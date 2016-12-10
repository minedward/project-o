/*
    种族数据模型
*/
var buildData = require('buildData');

var raceData = cc.Class({
    properties: {
        level: 1,
        builds: {
            default: {},
            type: buildData,
            serializable: false
        },
        buildInGroup: {
            default: {},
            type: buildData,
            serializable: false
        },
    },

    updateData: function(obj) {
        for (var key in obj) {
            var element = obj[key];
            this[key] = element;
        }
    }
});

module.exports = raceData;
