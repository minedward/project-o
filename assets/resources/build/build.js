var entity = require('entity');
var helper = require('Helper');

cc.Class({
    extends: entity,

    properties: {
        range: {
            default: 2,
            tooltip: '兵营大小（格）'
        },
        defType: {
            default: 3,
            tooltip: '防御类型是城甲'
        },
        buildDuration: {
            default: 1,
            tooltip: '建造时长'
        },
        frozen: {
            default: false,
            tooltip: '是否停止生产'
        },
        frequency: {
            default: 5,
            tooltip: '出兵频率（s）'
        },
        heroCount: {
            default: 1,
            tooltip: '出兵数量（个）'
        },
        heroUnit: {
            default: null,
            type: cc.Prefab,
            tooltip: '出兵单位'
        },
        dir: {
            set: function(value){
                this._dir = value;
                this.node.getChildByName('build').scaleX = value * Math.abs(this.node.getChildByName('build').scaleX);
            },
            get: function() {
                return this._dir || 1;
            },
            tooltip: '朝向(1：左 -1：右)'
        }
    },

    // use this for initialization
    onLoad: function () {
        this._super();

        this.dt = 0;
        this.buildDt = 0;
        this.clickTimes = 0;
        this.clickDuration = 0;
    },

    start: function() {
        this._super();
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (this.frozen)
            return;

        this.dt += dt;
        if (this.dt > this.frequency) {
            this.dt = 0;
            for (var i = 0; i < this.heroCount; i++) {
                this.createHero(i);
            }
        }

        if (this.clickTimes > 0) {
            this.clickDuration += dt;
            if (this.clickDuration > 0.5) {
                this.clickDuration = 0;
                this.clickTimes = 0;
            }
        }
    },

    init: function(obj) {       
        this.setGridPosition(obj.blockArray);
        this.camp = obj.camp;
        this.setAStarMap(obj.aStarMap);
        this.barrierArray = obj.barrierArray;
    },

    initHpbar: function(layer) {
        this.hpbar.removeFromParent();
        this.hpbar.parent = layer;
    },

    hurt: function(value) {
        this.changeHp(value);

        if (this.hp <= 0) {
            this.frozen = true;
            helper.performWithDelay(this.node, function() {
                this.node.destroy();
                Notification.dispatch('build_destroy', this);
            }.bind(this), 1);
        }
    },

    setGridPosition: function(array) {
        this.blockArray = array;
    },

    createHero: function(idx) {
        var node = cc.instantiate(this.heroUnit);
        node.parent = this.node.parent;

        var buildCollider = this.getComponent(cc.BoxCollider);
        var heroCollider = node.getComponent(cc.BoxCollider);

        if (this.getBuildRelativePos() == 'up') {
            var bottomX;
            if (this.camp == 1){
                bottomX = this.node.x + buildCollider.size.width / 2;
                node.x = bottomX - idx * heroCollider.size.width / 2;
            } else {
                bottomX = this.node.x - buildCollider.size.width / 2;
                node.x = bottomX + idx * heroCollider.size.width / 2;
            }
            
            var bottomY = this.node.y - buildCollider.size.height / 2;
            node.y = bottomY - heroCollider.size.height;
        } else {
            var topX;
            if (this.camp == 1){
                topX = this.node.x + buildCollider.size.width / 4;
                node.x = topX - idx * heroCollider.size.width / 2;
            } else {
                topX = this.node.x - buildCollider.size.width / 4;
                node.x = topX + idx * heroCollider.size.width / 2;
            }

            var topY = this.node.y + buildCollider.size.height / 2;
            node.y = topY;
        }

        var hero = node.getComponent('hero');
        var entityLayer = this.node.parent.getComponent('entityLayer');
        hero.init({camp : this.camp, aStarMap : this.aStarMap});
        entityLayer.createHero(hero);
        hero.initHpbar(entityLayer.uiLayer);
    },

    getBuildRelativePos: function() {
        var range = Math.sqrt(this.blockArray.length);
        var y = this.blockArray[0][1];
        if (y + range - 1 < 7)  // 7位中数
            return 'down';
        else if (y == 7 && y + range - 1 == 8)
            return 'down';
        else
            return 'up';
    },

    onClick: function(event) {
        this.clickTimes++;
        if (this.clickTimes >= 2) { //双击销毁
            this.clickTimes = 0;
            this.node.destroy();
            Notification.dispatch('build_destroy', this);
        }
    }
});
