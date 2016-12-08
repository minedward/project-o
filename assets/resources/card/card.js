var buildData = require('buildData')

cc.Class({
    extends: cc.Component,

    properties: {
        light: {
            default: null,
            type: cc.Node
        },
        nameNode: {
            default: null,
            type: cc.Node
        },
        nameLabel: {
            default: null,
            type: cc.Label
        },
        waterNode: {
            default: null,
            type: cc.Node
        },
        water: {
            default: null,
            type: cc.Label
        }
    },

    // use this for initialization
    onLoad: function () {

    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },

    onClick: function() {

    }
});
