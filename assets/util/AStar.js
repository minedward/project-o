var moveType = {
    FOUR : 1,
    EIGHT : 2,
}

cc.Class({
    extends: cc.Component,

    properties: {
        barrierLayerName: 'barrier',
        moveType:{
            default: moveType.EIGHT,
            tooltip: '方向选择(1:四方向 2:八方向)'
        }
    },

    editor: {
        requireComponent: cc.TiledMap,
    },

    onLoad: function () {
        this.tiledMap = this.getComponent(cc.TiledMap);
        this.layerBarrier = this.tiledMap.getLayer(this.barrierLayerName);
    },

    moveToward: function(startTilePos, desTilePos) {
        if (this.isInBarrierLayer(desTilePos)) {
            return [];
        }

        let deltaX = desTilePos.x - startTilePos.x;
        let deltaY = desTilePos.y - startTilePos.y;

        let openList = [];
        let closeList = [];
        let finalList = [];

        let start = {
            x: startTilePos.x,
            y: startTilePos.y,
            h: (Math.abs(deltaX) + Math.abs(deltaY)) * 10,
            g: 0,
            p: null,
        };

        start.f = start.h + start.g;
        openList.push(start);

        while(openList.length !== 0) {
            let parent  = openList.shift();
            closeList.push(parent);

            if (parent.h === 0) {break;}

            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    // ==========四方向或八方向开关==========
                    var isEight = Math.abs(i) + Math.abs(j) === 2;
                    if (this.moveType === moveType.FOUR && isEight) {continue;}
                    // ======================================

                    let raw = cc.p(parent.x + i, parent.y + j);
                    if (this.isInBarrierLayer(raw, isEight, parent)) {continue;}
                    if (this.isInList(raw, openList)) {continue;}
                    if (this.isInList(raw, closeList)) {continue;}
                    let neibour = {
                        x: raw.x,
                        y: raw.y,
                        h: Math.max(Math.abs(raw.x - desTilePos.x), Math.abs(raw.y - desTilePos.y)) * 10,
                        g: parent.g + ((i !== 0 && j !== 0) ? 14 : 10),  
                        p: parent,
                    };

                    neibour.f = neibour.h + neibour.g;
                    openList.push(neibour);
                }
            }
            openList.sort(this.sortF);
        }

        let des = closeList.pop();
        let dst = 0;

        while (des.p) {
            des.dx = des.x - des.p.x;
            des.dy = des.y - des.p.y;
            finalList.unshift(des);
            if (dst == 0)
                dst = des.g;
            des = des.p;
        }

        return {paths: finalList, dst: dst};
    },

    isInList: function(tilePosition, list){
        for (var i = 0; i < list.length; i++) {
            if (cc.pointEqualToPoint(list[i], tilePosition)) return true;
        }
        return false;
    },

    sortF: function(a, b) {
        return a.f - b.f;
    },

    isInBarrierLayer: function(tilePosition, isEight, parent) {
        let mapSize = this.tiledMap.getMapSize();

        if (tilePosition.x < 0 || tilePosition.x >= mapSize.width)
            return true;

        if (tilePosition.y < 0 || tilePosition.y >= mapSize.height)
            return true;

        if (this.layerBarrier.getTileGIDAt(tilePosition)) {
            return true;
        } else {
            if (this.moveType === moveType.EIGHT && isEight) {
                if (this.layerBarrier.getTileGIDAt(cc.v2(tilePosition.x, parent.y))
                    || this.layerBarrier.getTileGIDAt(cc.v2(parent.x, tilePosition.y)))
                    return true;
            }
        }

        return false;
    },

});
