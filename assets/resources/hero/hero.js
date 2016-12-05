var entity = require('entity');

cc.Class({
    extends: entity,

    properties: {
        speed: {
            default: 1,
            tooltip: '速度（计量单位是 格/s）'
        },
        atk: {
            default: 1,
            tooltip: '攻击力'
        },
        atkType: {
            default: 1,
            tooltip: '攻击类型（1：物理， 2：魔法）'
        },
        atkRange: {
            default: 1,
            tooltip: '攻击力范围'
        },
        atkCD: {
            default: 3,
            tooltip: '攻击速度（计量单位是 1次/n秒）'
        },
        searchRange: {
            set: function(value) {
                this._searchRange = value;
                this.eye.getComponent(cc.CircleCollider).radius = value * 16;
            },
            get: function() {
                return this._searchRange || 8;
            },
            tooltip: '侦查范围'
        },
        dir: {
            set: function(value){
                this._dir = value;
                this.node.scaleX = value;
            },
            get: function() {
                return this._dir || 1;
            },
            tooltip: '朝向(1：左 -1：右)'
        },
        eye: {
            default: null,
            type: cc.Node
        }
    },

    // use this for initialization
    onLoad: function () {
        this._super();
        
        var self = this;
        this.fsm = StateMachine.create({
            initial: 'idle',
            events: [
                { name: 'walk', from: 'idle', to: 'walking'},
                { name: 'rush', from: ['idle', 'walking'], to: 'run'},
                { name: 'attack', from: '*', to: 'attacking'},
                { name: 'skill', from: '*', to: 'skilling'},
                { name: 'hurt', from: '*', to: 'hurting'},
                { name: 'die', from: '*', to: 'dead'},
                { name: 'rest', from: '*', to: 'idle'},
            ],

            callbacks: {
                onidle:             function(event, from, to) { self.onIdle();              },
                onwalking:          function(event, from, to) { self.onWalking();           },
                onrun:              function(event, from, to) { self.onRun();               },
                onattacking:        function(event, from, to) { self.onAttacking();         },
                onskilling:         function(event, from, to) { self.onSkilling();          },
                onhurting:          function(event, from, to) { self.onHurting();           },
                ondead:             function(event, from, to) { self.onDead();              },
                onwalk:             function(event, from, to) { self.onWalk();              },
                onrush:             function(event, from, to) { self.onRush();              },
                onattack:           function(event, from, to) { self.onAttack();            },
                onskill:            function(event, from, to) { self.onSkill();             },
                onhurt:             function(event, from, to) { self.onHurt();              },
                ondie:              function(event, from, to) { self.onDie();               },
                onrest:             function(event, from, to) { self.onRest();              },
            }
        });

        this.inPosType = 1; // 1：已方营地 2：战地 3：敌方营地

        this.atkDt = this.atkCD;
        this.armatureDisplay.addEventListener(dragonBones.EventObject.COMPLETE, this.onAnimationCompleteEvent, this);
        this.armatureDisplay.addEventListener(dragonBones.EventObject.FRAME_EVENT, this.onAnimationFrameEvent, this);
    },

    start: function() {
        this._super();

        this.getRealSpeed();
        this.getMovePath();
        this.resetZOrder();
        this.addListeners();

        if (this.fsm.current == 'idle')
            this.fsm.walk();
    },

    update: function (dt) {
        if (this.isDead) return;

        this.updateAtkCD(dt);

        if (this.target) {
            this.node.stopAllActions();

            if (this.target.getComponent('entity').isDead) {
                this.target = null;
                this.eye.active = true;
                this.inAtkState = false;
                this.startMoveFlag = true;
                if (this.inPosType == 1) {
                    this.getMovePath();
                }
            } else {
                if (this.inAtkState) {
                    if (this.canAtk)
                        this.fsm.attack();
                }
                else
                    this.moveByTarget(dt);
                return;
            }
        }

        if (this.startMoveFlag) {
            if (this.fsm.current == 'attacking' || this.fsm.current == 'skilling') return;

            this.node.stopAllActions();
            if (this.inPosType == 1) {  // A星寻路
                this.moveByAStar();
            } else {   // 直线行走
                this.moveByLine(dt);
            }
        }
    },

    updateAtkCD: function(dt) {
        if (this.canAtk) return;

        this.atkDt += dt;
        if (this.atkDt >= this.atkCD) {
            this.atkDt = 0;
            this.canAtk = true;
        }
    },

    addListeners: function() {
        this.node.on('position-changed', function(event) {
            if (this.hpbar.active) {
                var selfPos = event.target.position;
                this.hpbar.position = cc.v2(selfPos.x, selfPos.y + this.hpbarHeight);
            }
        }.bind(this), this);
    },

    init: function(obj) {
        this.camp = obj.camp;
        this.dir = obj.camp == 1 ? 1 : -1;
        this.setAStarMap(obj.aStarMap);

        if (this.armature) {
            var slot = this.armature.getSlot('circle' + (obj.camp == 1 ? 2 : 1));
            if (slot)
                slot.display = null;
        }
    },

    initHpbar: function(layer) {
        this.hpbar.removeFromParent();
        this.hpbar.parent = layer;
    },

    // ========================================================
    // 行为状态
    onIdle: function() {
        var animationCp = this.getComponent('cc.Animation');
        animationCp.play('idle');
    },

    onWalking: function() {
        var animationCp = this.getComponent('cc.Animation');
        animationCp.play('walk');
    },

    onRun: function() {
        var animationCp = this.getComponent('cc.Animation');
        animationCp.play('run');
    },

    onAttacking: function() {
        var animationCp = this.getComponent('cc.Animation');
        animationCp.play('attack');
    },

    onSkilling: function() {
        var animationCp = this.getComponent('cc.Animation');
        animationCp.play('skill');
    },

    onHurting: function() {
        var animationCp = this.getComponent('cc.Animation');
        animationCp.play('hurt');
    },

    onDead: function() {
        var animationCp = this.getComponent('cc.Animation');
        animationCp.play('die');
    },

    // ========================================================
    // 行为事件
    onWalk: function() {
        this.startMoveFlag = true;
    },

    onAttack: function() {
        this.canAtk = false;
    },

    onHurt: function() {
    },

    onDie: function() {
        this.inAtkState = false;
        this.getComponent(cc.BoxCollider).enabled = false;
    },

    onRest: function() {
    },

    hurt: function(value) {
        this.changeHp(value);

        if (this.hp > 0) {
            if (this.fsm.current == 'idle') {
                this.fsm.hurt();
            }
        } else {
            this.fsm.die();
        }
    },

    getRealSpeed: function() {
        var tileSize = this.aStarMap.tiledMap.getTileSize();
        this.speedPx = this.speed * tileSize.width;
    },

    getMovePath: function() {
        var selfPos = this.node.position;
        var tileSize = this.aStarMap.tiledMap.getTileSize();
        var selfPosAtMap = cc.v2(selfPos.x+tileSize.width/2, selfPos.y+tileSize.height/2+1);

        if (this.movePath)
            delete this.movePath;

        this.movePath = this.aStarMap.getMovePath(this.aStarMap.tilePosistion(selfPosAtMap), this.camp);
    },

    moveByAStar: function() {
        if (this.fsm.current == 'idle')
            this.fsm.walk();

        var tileEndPos = this.movePath.shift();
        if (tileEndPos) {
            var sequence = [];
            var selfPos = this.node.position;
            var endPos = this.aStarMap.getPosistion(tileEndPos);
            this.dir = endPos.x > selfPos.x ? 1 : -1;

            var tileSize = this.aStarMap.tiledMap.getTileSize();
            endPos.y -= tileSize.height / 2;

            var duration = (endPos.x != selfPos.x) && (endPos.y != selfPos.y) ? 1.4 / this.speed : 1 / this.speed;
            sequence.push(cc.moveTo(duration, endPos));
            sequence.push(cc.callFunc(function() {
                this.resetZOrder();
                this.startMoveFlag = true;
            }.bind(this)));

            this.node.runAction(cc.sequence(sequence));
            this.startMoveFlag = false;
        } else {
            // this.tileMapY = tileEndPos.y;
            this.inPosType = 2;
            this.startMoveFlag = true;
            this.moveByLine(cc.director.getDeltaTime());
        }
    },

    moveByLine: function(dt) {
        var moveToMainBuild = function(target) {
            this.startMoveFlag = false;
            this.target = target;;
            this.moveByTarget(cc.director.getDeltaTime());
        }.bind(this);
  
        if (this.fsm.current == 'idle')
            this.fsm.walk();

        if (this.camp == 1) {
            if (this.node.x < this.aStarMap.attackBorderPx_r) {
                if (this.inPosType == 2 && this.node.x > this.aStarMap.campBorderPx_r)
                    this.inPosType = 3;
                
                if (this.dir == -1)
                    this.dir = 1;
                this.node.x += this.speedPx * dt;
            } else {
                moveToMainBuild(this.node.parent.getComponent('entityLayer').mainBuild_r);
            }
        } else {
            if (this.node.x > this.aStarMap.attackBorderPx_l) {
                if (this.inPosType == 2 && this.node.x < this.aStarMap.campBorderPx_l)
                    this.inPosType = 3;
                
                if (this.dir == 1)
                    this.dir = -1;
                this.node.x -= this.speedPx * dt;
            } else {
                moveToMainBuild(this.node.parent.getComponent('entityLayer').mainBuild_l);
            }
        }
    },

    getMoveVec2: function() {
        var selfPos = this.node.position;
        var targetPos = this.target.position;
        var atkDst = this.target.width/2 + this.node.width/2;
        this.dir = targetPos.x > selfPos.x ? 1 : -1;

        if (Math.abs(targetPos.x - selfPos.x) < atkDst && Math.abs(targetPos.y - selfPos.y) < atkDst*0.5)
            return null;
        
        var endPos = cc.pSub(cc.v2(targetPos.x - (this.target.width/2 + this.node.width/2 - 4)*this.dir, targetPos.y), selfPos);
        return cc.pNormalize(endPos);
    },

    moveByTarget: function(dt) {
        if (this.fsm.current == 'idle')
            this.fsm.walk();
        
        var targetVec2 = this.getMoveVec2();
        if (targetVec2) {
            this.node.x += targetVec2.x * this.speedPx * dt;
            this.node.y += targetVec2.y * this.speedPx * dt;
        } else {
            this.inAtkState = true;
            this.resetZOrder();
            this.fsm.rest();
        }
    },

    resetZOrder: function() {
        if (this.movePath && this.movePath.length > 0) {
            this.node.setLocalZOrder(this.movePath[0].y);
        } else {
            this.node.setLocalZOrder(this.aStarMap.tilePosistion(this.node.position).y);
        }
    },

    // ========================================================
    // 回调事件
    onCollisionStay: function (other, self) {
        var entity = other.getComponent('hero');
        if (!entity) return;
        if (entity.camp != this.camp) return;
        if (other.tag == 1) return;

        console.log('on body enter');
    },

    onAnimationCompleteEvent: function(event) {
        var name = event.detail.animationState.name;
        if (name == 'attack' || name == 'skill' || name == 'hurt') {
            this.fsm.rest();
        } else if (name == 'die') {
            this.node.destroy();
        }
    },

    onAnimationFrameEvent: function(event) {
        var name = event.detail.name;
        if (name == 'onDamage') {
            if (cc.isValid(this.target))
                this.target.getComponent('entity').hurt(-this.atk);
        }
    }
});
