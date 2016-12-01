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
        this.getRealSpeed();
        this.getMovePath();
        this.resetZOrder();

        this.fsm.walk();
    },

    update: function (dt) {
        if (this.target) {
            if (this.target.isDead) {
                this.target = null;
                this.eye.active = true;
                this.startMoveFlag = true;
            } else {
                if (this.inAtkState)
                    this.updateAtkCD(dt);
                else
                    this.moveByTarget(dt);

                return;
            }
        }

        if (this.startMoveFlag) {
            this.node.stopAllActions();
            if (this.inPosType == 1) {  // A星寻路
                this.moveByAStar();
            } else {   // 直线行走
                this.moveByLine(dt);
            }
        }
    },

    updateAtkCD: function(dt) {
        this.atkDt += dt;
        if (this.atkDt >= this.atkCD) {
            this.atkDt = 0;
            this.fsm.attack();
        }
    },

    addListeners: function() {
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
    },

    onHurt: function() {
    },

    onDie: function() {

    },

    onRest: function() {
    },

    hurt: function(value) {
        if (this.isDead) return;

        this.hp += value;
        if (this.hp > 0) {
            if (this.fsm.current == 'attacking' || this.fsm.current == 'skilling') return;
            this.fsm.hurt();
        }
        else
            this.fsm.die();
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

        if (this.camp == 1) {
            if (this.node.x < this.aStarMap.attackBorderPx_r) {
                if (this.inPosType == 2 && this.node.x > this.aStarMap.campBorderPx_r)
                    this.inPosType = 3;
                
                this.node.x += this.speedPx * dt;
            } else {
                moveToMainBuild(this.node.parent.getComponent('entityLayer').mainBuild_r);
            }
        } else {
            if (this.node.x > this.aStarMap.attackBorderPx_l) {
                if (this.inPosType == 2 && this.node.x < this.aStarMap.campBorderPx_l)
                    this.inPosType = 3;
                
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
        if (Math.abs(targetPos.x - selfPos.x) < atkDst)
            return null;
        
        this.dir = targetPos.x > selfPos.x ? 1 : -1;
        var endPos = cc.pSub(cc.v2(targetPos.x - (this.target.width/2 + this.node.width/2 - 4)*this.dir, targetPos.y), selfPos);
        return cc.pNormalize(endPos);
    },

    moveByTarget: function(dt) {
        var targetVec2 = this.getMoveVec2();
        if (targetVec2) {
            this.node.x += targetVec2.x * this.speedPx * dt;
            this.node.y += targetVec2.y * this.speedPx * dt;
        } else {
            this.inAtkState = true;
            this.resetZOrder();
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
        }
    },

    onAnimationFrameEvent: function(event) {
        var name = event.detail.name;
        if (name == 'onDamage') {
            this.target.getComponent('entity').hurt(-this.atk);
        }
    }
});
