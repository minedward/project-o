cc.Class({
    extends: cc.Component,

    properties: {
        hp: {
            default: 100,
            tooltip: '血量'
        },
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
        defType: {
            default: 1,
            tooltip: '防御类型（1：物理， 2：魔法， 3：城甲）'
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
        this.move();
    },

    // update: function (dt) {
    //     if (this.moveFlag) {
    //         this.node.x += this.speed * 32 * dt;    // 32为一个网格大小
    //         this.node.y += this.speed * 32 * dt;
    //     }
    // },

    onwalk: function() {
        var animationCp = this.node.getComponent('cc.Animation');
        animationCp.play('walk');
    },

    move: function() {
        this.moveFlag = true;
        this.onwalk();
        this.node.runAction(cc.moveTo(this.moveTime, this.endPos));
    },

    setCamp: function(camp) {
        this.camp = camp;
        if (camp == 1) {
            this.endPos = cc.v2(1200, 240);
            this.moveTime = cc.pDistanceSQ(this.endPos, this.node.getPosition()) / (this.speed * 32 * this.speed * 32);
        } else {

        }
    },

    setMap: function() {

    }
});
