var aStarMap = require('aStarMap');
var entityLayer = require('entityLayer');

cc.Class({
    extends: cc.Component,

    properties: {
        aStarMap: {
            default: null,
            type: aStarMap
        },
        entityLayer: {
            default: null,
            type: entityLayer
        },
        bg: {
            default: null,
            type: cc.Node
        },
        lineSprite: {
            default: null,
            type: cc.SpriteFrame
        },
        lineContainer: {
            default: null,
            type: cc.Node
        },
        blockSprite: {
            default: [],
            type: cc.SpriteFrame
        },
        blockContainer: {
            default: null,
            type: cc.Node
        },
        gridWidth: 1280,
        gridHeight: 480,
        blockSize: 32,
        lineSize: 2,
        vaildBlockWidth: 13,
        originY: 120,
        mainBuildPos: {
            default: new cc.Vec2(1, 6),
            tooltip: '主城位置(格)'
        },
        mainBuildRange: 3,
        freshFrequency: 0.5,
    },

    // use this for initialization
    onLoad: function () {
        this.hCount = this.gridWidth / this.blockSize;
        this.vCount = this.gridHeight / this.blockSize;

        this.initLines(this.hCount, this.vCount);
        this.initBlocks(this.hCount, this.vCount);
        this.initMainBuild();

        this.touchVec2 = [];
        this.touchArray = [];
        this.moveArray = [];
        this.buildRange = 2;
        this.freshDt = 0;

        this.setVisiable(false);
        this.addListeners();
    },

    update: function(dt) {
        if (!this.visiable)
            return;

        this.freshDt += dt;
        if (this.freshDt > this.freshFrequency) {   //士兵阻挡建筑
            this.freshDt = 0;

            var freshFlag = false;
            for (var i = 0; i < this.moveArray.length; i++) {
                var pos = this.moveArray[i];
                if (this.blockArray[pos.x])
                    this.blockArray[pos.x][pos.y] -= 1;
                freshFlag = true;
            }
            delete this.moveArray;
            this.moveArray = [];

            for (var key in this.entityLayer.heroSet) {
                var hero = this.entityLayer.heroSet[key];
                var heroPos = hero.node.getPosition();
                if (heroPos.x > this.aStarMap.campBorderPx_l)
                    continue;
                
                var heroCollider = hero.getComponent(cc.BoxCollider).size;
                var heroRect = cc.rect(heroPos.x - heroCollider.width/2, heroPos.y+1, heroCollider.width, heroCollider.height-2);
                if (cc.rectIntersectsRect(heroRect, this.touchRect)) {
                    var gridPos = this.position2grid(heroPos);
                    this.moveArray.push(gridPos);
                    if (this.blockArray[gridPos.x])
                        this.blockArray[gridPos.x][gridPos.y] += 1;
                    freshFlag = true;
                }
            }

            if (freshFlag)
                this.changeRectBlock();
        }
    },

    addListeners: function() {
        Notification.on('build_destroy', function(target){
            this.destroyBuild(target.blockArray);
        }.bind(this), this);
    },

    // 生成网格线
    initLines: function(hCount, vCount) {
        var createLine = function(x, y, width, height) {
            var node = new cc.Node('line');
            var sp = node.addComponent(cc.Sprite);

            sp.spriteFrame = this.lineSprite;
            node.parent = this.lineContainer;
            node.setPosition(x, y);
            node.setContentSize(width, height);
        }.bind(this);

        var originX = -this.gridWidth/2;
        for (var i = 0; i < hCount + 1; i++) {
            createLine(originX + this.blockSize*i, 0, this.lineSize, this.gridHeight);
        }

        var originY = -this.gridHeight/2;
        for (var i = 0; i < vCount + 1; i++) {
            createLine(0, originY + this.blockSize*i, this.gridWidth, this.lineSize);
        }
    },

    // 生成网格
    initBlocks: function(hCount, vCount){
        var createWarnBlock = function(enabled) {
            var node = new cc.Node('block');
            var sp = node.addComponent(cc.Sprite);

            sp.spriteFrame = this.blockSprite[1];
            node.parent = this.blockContainer;
            sp.enabled = enabled;
            return sp;
        }.bind(this);

        this.blockArray = [];
        this.blockSpriteArray = [];
        for (var i = 0; i < hCount; i++) {
            if (i < this.vaildBlockWidth && i > 0) {
                this.blockArray[i] = [];
                this.blockSpriteArray[i] = [];
            }
            for (var j = 0; j < vCount; j++) {
                if (this.blockArray[i]) {
                    this.blockArray[i][j] = 1;
                    this.blockSpriteArray[i][j] = createWarnBlock(false);
                } else {
                    createWarnBlock(true);
                }
            }
        }
    },

    // 网格显隐
    setVisiable: function(visiable) {
        this.visiable = visiable;
        this.bg.active = visiable;
        this.blockContainer.active = visiable;
        this.lineContainer.active = visiable;
    },

    // 初始化主城格子
    initMainBuild: function() {
        for (var i = 0; i < this.mainBuildRange; i++) {
            for (var j = 0; j < this.mainBuildRange; j++) {
                var x = this.mainBuildPos.x + i;
                var y = this.mainBuildPos.y + j;
                this.blockArray[x][y] = 2;
            }
        }
    },

    // 像素转换为格子
    position2grid: function(vec2) {
        var x = Math.floor(vec2.x / this.blockSize);
        var y = Math.floor(vec2.y / this.blockSize);
        return cc.v2(x, y);
    },

    touchPosition2Gird: function(vec2) {
        var x = Math.floor(vec2.x / this.blockSize);
        var y = Math.floor((vec2.y - this.originY) / this.blockSize);
        var flag = false;

        if (this.touchVec2[0] !== x) {
            this.touchVec2[0] = x;
            flag = true;
        }
        if (this.touchVec2[1] !== y) {
            this.touchVec2[1] = y;
            flag = true;
        }
        if (flag) {
            this.buildCenterPos = cc.v2((x+this.buildRange/2) * this.blockSize, (y+this.buildRange/2) * this.blockSize);
            var width = (this.buildRange * 2 - 1) * this.aStarMap.tiledMap.getTileSize().width;
            this.touchRect = cc.rect(this.buildCenterPos.x-width/2, this.buildCenterPos.y-width/2, width, width);
        }

        return flag;
    },

    // 创建区域网格
    changeRectBlock: function() {
        this.resetAllBlock();

        for (var i = 0; i < this.buildRange; i++) {
            for (var j = 0; j < this.buildRange; j++) {
                var block = [this.touchVec2[0] + i, this.touchVec2[1] + j];
                this.touchArray.push(block);
                this.changeBlockState(block[0], block[1], true);
            }
        }
    },

    // 重置所有格子
    resetAllBlock: function() {
        for (var i = 0; i < this.touchArray.length; i++) {
            var element = this.touchArray[i];
            this.changeBlockState(element[0], element[1], false);
        }

        delete this.touchArray;
        this.touchArray = [];
    },

    // 改变格子状态
    changeBlockState: function(x, y, enabled) {
        if (this.blockArray[x] && this.blockArray[x][y]) {
            this.blockSpriteArray[x][y].enabled = enabled;
            this.blockSpriteArray[x][y].spriteFrame = this.blockSprite[this.blockArray[x][y]- 1];
        }
    },

    // 区域是否有效
    isRectVaild: function() {
        var vaildCount = 0;
        for (var i = 0; i < this.touchArray.length; i++) {
            var element = this.touchArray[i];
            var x = element[0];
            var y = element[1];
            if (this.blockArray[x] && this.blockArray[x][y] && this.blockArray[x][y] == 1)
                vaildCount++;
        }

        if (vaildCount == this.touchArray.length)
            return true;
        else
            return false;
    },

    setBuildRange: function(range) {
        this.buildRange = range;
    },

    createBuild: function() {
        for (var i = 0; i < this.touchArray.length; i++) {
            var element = this.touchArray[i];
            var x = element[0];
            var y = element[1];
            if (this.blockArray[x])
                this.blockArray[x][y] = 2;
        }
    },

    createBuildFromMap: function(node) {
        var build = node.getComponent('build');
        var pos = this.position2grid(node.position);
        var blockArray = [];
        for (var i = 0; i < build.range; i++) {
            for (var j = 0; j < build.range; j++) {
                var block = [pos.x + i, pos.y + j];
                blockArray.push(block);
            }
        }
        return blockArray;
    },

    destroyBuild: function(blockArray) {
        for (var i = 0; i < blockArray.length; i++) {
            var element = blockArray[i];
            var x = element[0];
            var y = element[1];
            if (this.blockArray[x])
                this.blockArray[x][y] = 1;
        }
    },
});
