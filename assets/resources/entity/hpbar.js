cc.Class({
    extends: cc.Component,

    properties: {
        barWidth: {
            set: function(value) {
                this._barWidth = value;
                this.barBg.width = value;
                this.barBg.getComponent(cc.ProgressBar).totalLength = value - 4;
                this.bar.node.width = value - 4;
                this.bar.node.x = (value - 4) * -0.5;
                this.lvBg.node.x = value * -0.5;
            },
            get: function() {
                return this._barWidth || 32;
            }
        },
        barBg: {
            default: null,
            type: cc.Node
        },
        bar: {
            default: null,
            type: cc.Sprite
        },
        lvBg: {
            default: null,
            type: cc.Sprite
        },
        lv: {
            default: null,
            type: cc.Label
        },
        barSprite: {
            default: [],
            type: cc.SpriteFrame
        },
        lvSprite: {
            default: [],
            type: cc.SpriteFrame
        },
    },

    onLoad: function() {
        this.node.active = false;
    },
    
    init: function(type, level) {
        this.bar.spriteFrame = this.barSprite[type - 1];
        this.lvBg.spriteFrame = this.lvSprite[type - 1];
        this.lv.string = level + '';
    },

    setPercent: function(percent) {
        this.barBg.getComponent(cc.ProgressBar).progress = percent;
    }
});
