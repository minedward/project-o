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
        searchRange: {
            default: 5,
            tooltip: '侦查范围'
        },
    },

    // use this for initialization
    onLoad: function () {
        var self = this;
        this.fsm = StateMachine.create({
            initial: 'idle',
            events: [
                { name: 'walk', from: 'idle', to: 'walking'},
                { name: 'rush', from: ['idle', 'walking'], to: 'run'},
                { name: 'attack', from: ['idle', 'walking', 'run', 'hurting'], to: 'attacking'},
                { name: 'skill', from: ['idle', 'walking', 'run', 'hurting'], to: 'skilling'},
                { name: 'hurt', from: 'idle', to: 'hurting'},
                { name: 'die', from: '*', to: 'dead'}
            ],

            callbacks: {
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
            }
        });

        this.inPosType = 1; // 1：已方营地 2：战地 3：敌方营地
        this.fsm.walk();
        // this.addListeners();
    },

    update: function (dt) {
        if (this.startMoveFlag) {
            this.node.stopAllActions();
            if (this.inPosType == 1) {  // A星寻路
                this.moveByAStar();
            } else {   // 直线行走
                this.moveByLine(dt);
            }
        }
    },

    addListeners: function() {
    },

    // ========================================================
    // 行为状态
    onWalking: function() {
        var animationCp = this.node.getComponent('cc.Animation');
        animationCp.play('walk');
    },

    onRun: function() {
        var animationCp = this.node.getComponent('cc.Animation');
        animationCp.play('run');
    },

    onAttacking: function() {
        var animationCp = this.node.getComponent('cc.Animation');
        animationCp.play('attack');
    },

    onSkilling: function() {
        var animationCp = this.node.getComponent('cc.Animation');
        animationCp.play('skill');
    },

    onHurting: function() {
        var animationCp = this.node.getComponent('cc.Animation');
        animationCp.play('hurt');
    },

    onDead: function() {
        var animationCp = this.node.getComponent('cc.Animation');
        animationCp.play('die');
    },

    // ========================================================
    // 行为事件
    onWalk: function() {
        this.startMoveFlag = true;
    },

    moveByAStar: function() {
        var selfPos = this.node.getPosition();
        var tileSize = this.aStarMap.tiledMap.getTileSize();
        var selfPosAtMap = cc.v2(selfPos.x+tileSize.width/2, selfPos.y+tileSize.height/2+1);
        var movePath = this.aStarMap.getMovePath(this.aStarMap.tilePosistion(selfPosAtMap), this.camp);
        var sequence = [];

        for (var i = 0; i < movePath.length; i++) {
            var pos = this.aStarMap.getPosistion(movePath[i]);
            pos.y -= tileSize.height / 2;

            var duration = (pos.x != selfPos.x) && (pos.y != selfPos.y) ? 1.4 / this.speed : 1 / this.speed;
            sequence.push(cc.moveTo(duration, pos));

            selfPos = pos;
        }
        sequence.push(cc.callFunc(function() {
            this.tileMapY = movePath[movePath.length-1].y;
            this.inPosType = 2;
            this.startMoveFlag = true;
        }.bind(this)));

        this.node.runAction(cc.sequence(sequence));
        this.startMoveFlag = false;
    },

    moveByLine: function(dt) {
        if (this.node.x < this.node.parent.width) {
            if (this.inPosType == 2 && this.node.x > this.aStarMap.campBorderPx_r)
                this.inPosType = 3;
                
            var tileSize = this.aStarMap.tiledMap.getTileSize();
            this.node.x += this.speed * tileSize.width * dt;
        } else {
            this.startMoveFlag = false;
        }
    },
});
