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
        // manager.enabledDebugDraw = true;
    },

    start: function() {
        cc.loader.loadRes('campaign/campaign-test', cc.Prefab, function(err, res) {
            var campaign = cc.instantiate(res);
            var builds = campaign.getChildByName('build').getChildren();

            this.entityLayer.initMainBuild(campaign.getChildByName('mainBuild_l'), campaign.getChildByName('mainBuild_r'));
            for (var i = 0; i < builds.length;) {
                var build = builds[i];
                var blockArray = this.gameGrid.createBuildFromMap(build);
                this.entityLayer.createBuildFromMap(build, blockArray);
            }
        }.bind(this));
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
