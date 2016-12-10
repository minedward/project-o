/*
    玩家数据模型
*/
var raceData = require('raceData');

var playerData = cc.Class({
    properties: {
        level: 1,
        name: '',
        gold: 0,
        diamond: 0,
        wood: 0,
        iron: 0,
        crystal: 0,
        raceIdx: 0,
        races: {
            default: {},
            type: raceData,
            serializable: false
        }
    },

    updateData: function(obj) {
        for (var key in obj) {
            var element = obj[key];
            if (key == 'races') {
                this.updateRaces(element);
            } else {
                this[key] = element;
            }
        }
    },

    updateRaces: function(races) {
        for (var key in races) {
            var element = races[key];
            if (!this.races[key]) {
                this.races[key] = new raceData();
            }
            this.races[key].updateData(element);
        }
    }
});

module.exports = playerData;