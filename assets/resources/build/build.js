cc.Class({
    extends: cc.Component,

    properties: {
        range: {
            default: 2,
            tooltip: '兵营大小（格）'
        },
        hp: {
            default: 100,
            tooltip: '血量'
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
    },

    // use this for initialization
    onLoad: function () {
        this.dt = 0;
        this.buildDt = 0;
        this.clickTimes = 0;
        this.clickDuration = 0;
        this.entityLayer = this.node.parent;
        this.gridNodeScript = this.entityLayer.parent.getChildByName('girdNode').getComponent('gameGrid');
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

    setGridPosition: function(array) {
        this.blockArray = array;
    },

    createHero: function(idx) {
        var hero = cc.instantiate(this.heroUnit);
        hero.parent = this.entityLayer;

        var buildCollider = this.node.getComponent(cc.BoxCollider);
        var heroCollider = hero.getComponent(cc.BoxCollider);

        if (this.getBuildRelativePos() == 'up') {
            var bottomX = this.node.x + buildCollider.size.width / 4;
            var bottomY = this.node.y - buildCollider.size.height / 2;
            hero.x = bottomX - idx * heroCollider.size.width / 2;
            hero.y = bottomY - heroCollider.size.height;
        } else {
            var topX = this.node.x + buildCollider.size.width / 4;
            var topY = this.node.y + buildCollider.size.height / 2;
            hero.x = topX - idx * heroCollider.size.width / 2;
            hero.y = topY;
        }

        var heroComponent = hero.getComponent('hero');
        heroComponent.setCamp(1);
        heroComponent.move();
    },

    getBuildRelativePos: function() {
        var range = Math.sqrt(this.blockArray.length);
        var y = this.blockArray[0][1];
        if (y + range <= 7)   // 7位中数
            return 'down';
        else
            return 'up';
    },

    onClick: function(event) {
        this.clickTimes++;
        if (this.clickTimes >= 2) { //双击销毁
            this.clickTimes = 0;
            this.node.destroy();
            if (this.blockArray)
                Notification.dispatch('build_destroy', this.blockArray);
        }
    }
});
