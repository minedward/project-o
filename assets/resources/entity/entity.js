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
    },

    setGrid: function(grid) {
        this.grid = grid;
    },

    setAStarMap: function(map) {
        this.aStarMap = map;
    },
});
