var gameGrid = require('gameGrid');
var entityLayer = require('entityLayer');

cc.Class({
    extends: cc.Component,

    properties: {
        gameGrid: {
            default: null,
            type: gameGrid
        },
        entityLayer: {
            default: null,
            type: entityLayer
        }
    },

    // use this for initialization
    onLoad: function () {
        this.setTouchEvent();
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },

    // 触摸事件
    setTouchEvent: function() {
        this.node.on('touchstart', this.onTouchStart, this);
        this.node.on('touchmove', this.onTouchMove, this);
        this.node.on('touchend', this.onTouchEnd, this);
        this.node.on('touchcancel', this.onTouchCancel, this);
    },

    onTouchStart: function(event) {
        if (this.isTouching)
            event.stopPropagationImmediate();

        this.isTouching = true;
        var pos = event.getLocation();
        this.gameGrid.setVisiable(true);
        this.gameGrid.touchPosition2Gird(pos);
        this.gameGrid.changeRectBlock();
        this.entityLayer.createVirtualBuild(this.gameGrid.buildCenterPos);
    },

    onTouchMove: function(event) {
        var pos = event.getLocation();
        if (this.gameGrid.touchPosition2Gird(pos)) {
            this.gameGrid.changeRectBlock();
            this.entityLayer.moveVirtualBuild(this.gameGrid.buildCenterPos);
        }
    },

    onTouchEnd: function(event) {
        this.isTouching = false;
        this.gameGrid.setVisiable(false);
        this.entityLayer.removeVirtualBuild();
        if (this.gameGrid.isRectVaild()) {
            this.gameGrid.createBuild();
            this.entityLayer.createBuild(this.gameGrid.buildCenterPos, this.gameGrid.touchArray);
        }

        this.gameGrid.resetAllBlock();
    },

    onTouchCancel: function(event) {
        this.isTouching = false;
        this.gameGrid.setVisiable(false);
        this.gameGrid.resetAllBlock();
        this.entityLayer.removeVirtualBuild();
    },
    
    enableBuildMode: function(enable) {
        this.node.active = !this.node.active;
    },
});
