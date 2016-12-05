cc.Class({
    extends: cc.Component,

    properties: {
        level: {
            default: 1,
            tooltip: '等级'
        },
        hp: {
            default: 100,
            tooltip: '血量'
        },
        camp: {
            default: 1,
            tooltip: '阵营'
        },
        hpbar: {
            default: null,
            type: cc.Node
        },
        hpbarHeight: 50,
    },

    onLoad: function() {
        this.maxHp = this.hp;
    },

    start: function() {
        this.hpbar.getComponent('hpbar').init(this.camp, this.level);
    },

    setGrid: function(grid) {
        this.grid = grid;
    },

    setAStarMap: function(map) {
        this.aStarMap = map;
    },

    changeHp: function(value) {
        if (this.isDead) return;

        this.hp += value;
        if (this.hp > 0) {
            this.hpbar.active = true;
            var selfPos = this.node.position;
            this.hpbar.position = cc.v2(selfPos.x, selfPos.y + this.hpbarHeight);
            this.hpbar.getComponent('hpbar').setPercent(this.hp / this.maxHp);
        } else {
            this.isDead = true;
            this.hpbar.active = false;
            this.hpbar.removeFromParent();
        }
    }
});
