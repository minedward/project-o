var AStar = require('AStar');

var atkDir = {
    RIGHT : 1,
    LEFT : 2,
}

cc.Class({
    extends: cc.Component,
    properties: {
        floorLayerName: 'floor',
        enabledDebugDraw: true,
        mainBuildPos_l: new cc.Vec2(5, 15),
        mainBuildPos_r: new cc.Vec2(75, 15),
        campBorder_l: 27,
        campBorder_r: 53,
        campBorderPx_l: 432,
        campBorderPx_r: 848,
        attackBorderPx_l: 184,
        attackBorderPx_r: 1096,
        zone_t:{
            default: [],
            type: [cc.Integer]
        },
        zone_b:{
            default: [],
            type: [cc.Integer]
        },
    },
    
    editor: {
        requireComponent: AStar
    },
    
    onLoad: function() {
        this.debugTileColor = cc.color(255, 187, 255, 255);
        this.paths = [];
        this.posPaths = [];

        this.addListeners();
    },
    
    start: function () {
        this.aStar = this.getComponent(AStar);
        this.tiledMap = this.getComponent(cc.TiledMap);
        this.layerFloor = this.tiledMap.getLayer(this.floorLayerName);
    },

    addListeners: function() {
        Notification.on('build_destroy', function(target){
            this.destroyBarrier(target.barrierArray);
        }.bind(this), this);
    },
    
    getMovePath: function(start, dir) {
        if (this.enabledDebugDraw) {
            this.clearDebugColor();
        }
        
        // 得出边界点
        var border = dir == atkDir.RIGHT ? this.campBorder_l : this.campBorder_r;
        var zone;
        if (start.y >= this.zone_t[0] && start.y <= this.zone_t[1]) {
            zone = this.zone_t;
        } else if (start.y >= this.zone_b[0] && start.y <= this.zone_b[1]){
            zone = this.zone_b;
        } else {
            if (start.y - this.zone_t[1] <= this.zone_b[0] - start.y)
                zone = this.zone_t;
            else
                zone = this.zone_b;
        }

        // 循环计算得出最短路线
        var len = zone[1] - zone[0];
        var min = 10000;
  
        for (var i = 0; i <= len; i++) {
            var y = zone[0] + i;
            var paths = this.aStar.moveToward(start, cc.v2(border, y));
            if (paths.dst > 0 && paths.dst < min) {
                delete this.paths;
                this.paths = paths.paths;
                min = paths.dst;
            }
        }

        if (this.enabledDebugDraw) {
            for (let i = 0; i < this.paths.length; ++i) {
                this.debugDraw(this.paths[i], this.debugTileColor, i);
            }
        }

        return this.paths;
    },
    
    clearDebugColor: function(sender) {
        for (let i = 0; i < this.paths.length; ++i) {
            let touchTile = this.layerFloor.getTileAt(this.paths[i]);
            touchTile.color = cc.Color.WHITE;
            touchTile.removeAllChildren();
        }
    },
    
    debugDraw: function(tilePosition, color, index) { 
        let touchTile = this.layerFloor.getTileAt(tilePosition);
        touchTile.color = color;
    },
    
    tilePosistion: function(pixelPosition) {
        let mapSize = this.node.getContentSize();
        let tileSize = this.tiledMap.getTileSize();
        let x = Math.floor(pixelPosition.x / tileSize.width);
        let y = Math.floor((mapSize.height - pixelPosition.y) / tileSize.height);

        return cc.p(x, y);
    },

    getPosistion: function(vec2) {
        return this.layerFloor.getPositionAt(vec2);
    },

    createBarrier: function(pos, range) {
        var tilePos = this.tilePosistion(pos);
        var gid = this.layerFloor.getTileGIDAt(cc.v2(0, 0));
        var barrierArray = [];
        for (var i = -range+1; i < range; i++) {
            for (var j = -range; j < range-1; j++) {
                this.aStar.layerBarrier.setTileGID(gid, tilePos.x + i, tilePos.y + j);
                barrierArray.push({x: tilePos.x + i, y: tilePos.y + j});
            }     
        }
        return barrierArray;
    },

    destroyBarrier: function(barrierArray) {
        for (var i = 0; i < barrierArray.length; i++) {
            var barrier = barrierArray[i];
            this.aStar.layerBarrier.removeTileAt(barrier.x, barrier.y);
        }
    },
});