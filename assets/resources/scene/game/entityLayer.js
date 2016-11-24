var AStarMap = require('aStarMap');

cc.Class({
    extends: cc.Component,

    properties: {
        virtualEntityLayer: {
            default: null,
            type: cc.Node,
            tooltip: '虚拟建造层'
        },
        aStarMap: {
            default: null,
            type: AStarMap
        },
        mainBuildPos_l: {
            default: new cc.Vec2(80, 240),
            tooltip: '左边主城位置（像素）'
        },
        mainBuildPos_r: {
            default: new cc.Vec2(1200, 240),
            tooltip: '右边主城位置（像素）'
        }
    },

    // use this for initialization
    onLoad: function () {
        this.heroSet = {};
        this.heroSID = 0;
        this.buildSet = {};
        this.buildSID = 0;

        this.preaLoad();
        this.addListeners();
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },

    addListeners: function() {
        Notification.on('build_destroy', function(target){
            this.destroyBuildBySID(target.sid);
        }.bind(this), this);

        Notification.on('hero_destroy', function(target){
            this.destroyHeroBySID(target.sid);
        }.bind(this), this);
    },

    preaLoad: function() {
        this.resources = {};
        this.resPath = [
            'build/human/0/h-b-0',
            'build/human/1/h-b-1',
        ];

        this.resLoadCount = 0;
        for (var i = 0; i < this.resPath.length; i++) {
            var url = this.resPath[i];
            this.loadRes(url, this.preLoadCallback.bind(this));
        }
    },

    loadRes: function(url, callback){
        cc.loader.loadRes(url, cc.Prefab, function(err, res) {
            callback(err, res, url)
        });
    },

    preLoadCallback: function(err, res, url) {
        this.resources[url] = res;
        this.resLoadCount++;
        if (this.resLoadCount >= this.resPath.length)
            this.initMainBuild();
    },

    initMainBuild: function() {
        var node_l = cc.instantiate(this.resources[this.resPath[0]]);
        node_l.parent = this.node;
        node_l.setPosition(this.mainBuildPos_l);

        var node_r = cc.instantiate(this.resources[this.resPath[0]]);
        node_r.parent = this.node;
        node_r.setPosition(this.mainBuildPos_r);
    },

    createVirtualBuild: function(vec2) {
        var node = cc.instantiate(this.resources[this.resPath[1]]);
        node.opacity = 100;
        node.parent = this.virtualEntityLayer;
        node.setPosition(vec2);
        node.getComponent('build').frozen = true;
        this.currVirtualBuild = node;
    },

    moveVirtualBuild: function(vec2) {
        this.currVirtualBuild.setPosition(vec2);
    },

    removeVirtualBuild: function() {
        this.currVirtualBuild.removeFromParent();
    },

    createBuild: function(vec2, blockArray, heroMovePath) {
        var node = cc.instantiate(this.resources[this.resPath[1]]);
        node.parent = this.node;
        node.setPosition(vec2);
        
        var build = node.getComponent('build');
        build.setGridPosition(blockArray);
        build.camp = 1;
        build.setGrid(this.grid);
        build.setAStarMap(this.aStarMap);
        build.barrierArray = this.aStarMap.createBarrier(vec2, build.range);

        this.buildSet[this.buildSID] = build;
        build.sid = this.buildSID++;
        
        var barrier_lt = build.barrierArray[0];
        var barrier_rb = build.barrierArray[build.barrierArray.length - 1];
        node.setLocalZOrder(barrier_rb.y);

        for (var key in this.heroSet) {
            var hero = this.heroSet[key];
            var movePath = hero.movePath;
            for (var i = 0; i < movePath.length; i++) {
                var pos = movePath[i];
                if (pos.x >= barrier_lt.x && pos.x <= barrier_rb.x
                    && pos.y >= barrier_lt.y && pos.y <= barrier_rb.y) {
                    hero.getMovePath();
                    break;
                }
            }
        }
    },

    destroyBuildBySID: function(sid) {
        delete this.buildSet[sid];
    },

    createHero: function(hero) {
        this.heroSet[this.heroSID] = hero;
        hero.sid = this.heroSID++;
    },

    destroyHeroBySID: function(sid) {
        delete this.heroSet[sid];
    }
});
