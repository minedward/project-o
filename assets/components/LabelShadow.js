cc.Class({
    extends: cc.Component,

    properties: {
        string: {
            get: function() {
                return this._string || '';
            },
            set: function(value) {
                this._string = value;
                this.originLabel.string = value;
                this.shadowLabel.string = value;
            }
        }
    },

    editor: {
        requireComponent: cc.Label,
        menu: '添加渲染组件/LabelShadow',
        executeInEditMode: true
    },

    // use this for initialization
    start: function () {
        var node = cc.instantiate(this.node);
        node.name = 'originLabel';
        node.getComponent('LabelShadow').destroy();

        node.parent = this.node;
        node.position = cc.v2(-2, 2);
        this.beforeColor = this.node.color;
        node.color = this.beforeColor;
        this.node.color = cc.Color.BLACK;
        this.node.position = cc.pAdd(this.node.position, cc.v2(2, -2));

        this.shadowLabel = this.getComponent(cc.Label);
        this.originNode = node;
        this.originLabel = node.getComponent(cc.Label);
    },

    onDestroy: function() {
        if (this.node.getChildren().length > 0) {
            this.node.color = this.beforeColor;
            this.node.position = cc.pAdd(this.node.position, cc.v2(-2, 2));
            this.node.getChildByName('originLabel').removeFromParent();
        }
    }
});
