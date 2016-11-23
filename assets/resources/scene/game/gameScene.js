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
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
        manager.enabledDebugDraw = true;
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
