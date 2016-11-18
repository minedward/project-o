/**
 * UI工具包
 */
(function () {

    var UIHelper = {
        
        /**
         * 为按钮注册一个事件
         * 
         * @param {cc.Component} button 按钮组件
         * @param {cc.Node} target 目标物体
         * @param {Sting} commponent 目标物体上的组件名
         * @param {String} cb 目标物体上的组件中的回调方法名
         */
        registerEvent: function(button, target, component, cb) {
            var handler = new cc.Component.EventHandler();

            handler.target = target;
            handler.component = component;
            handler.handler = cb;

            button.clickEvent.push(handler);
        },

        /**
         * 清空一个节点的所有子节点
         * @param {cc.Node} node   目标节点
         */
        destoryChildren: function(node) {
            if (node && node instanceof cc.Node) {
                for (var key in node.children) {
                    var child = node.children[key];
                    if (child && child.scriptName) {
                        var component = child.getComponent(child.scriptName);
                        component.destroy();
                    }
                    this.destoryChildren(child);
                }
            }

            if (node) {
                node.removeAddChildren();
            }
        },

        /**
         * 显示一个确认弹框
         * @param  {Object} params  弹框参数
         * {
         *  {String}    title,      标题
         *  {String}    content,    提示内容
         *  {Function}  confitm,    确认回调
         *  {Function}  cancel,     取消回调
         * }
         */
        showConfirmDialog: function(params) {
            cc.loader.loadRes('view/public/confirmDialog/confirmDialog', function(err, prefab) {
                var scene = cc.director.getScene();
                var node = cc.instantiate(prefab);
                node.parent = scene;

                var confirmDialog = node.getComponent('ConfirmDialog');
                confirmDialog.init(params);
            });
        },

        ConfirmType: {
            Scale,  // 1:由小变大弹出
            Move,   // 2:由下向上飘出
        },

        /**
         * 显示一个提示弹框
         * @param {String} content 提示内容
         * @param {Number} type 弹框类型
         */
        showTipDialog: function(content, type) {
            type = type || 1;
            var prefabUrl = '';
            var script = '';
            if (type == 1) {
                prefabUrl = 'view/public/scaleTipDialog';
                script = 'ScaleTipDialog';
            } else if (type == 2) {
                prefabUrl = 'view/public/moveTipDialog';
                script = 'MoveTipDialog';
            }

            cc.loader.loadRes(prefabUrl, function(err, prefab) {
                var scene = cc.director.getScene();
                var node = cc.instantiate(prefab);
                node.parent = scene;

                var dialog = node.getComponent(script);
                dialog.init(content);
            });
        },

        NumberType: {   // 暂时未定
        },

        /**
         * 创建图片数字
         * @param {Number} num 数字
         * @param {Number} type 暂时未定
         */
        createNumberNode: function(num, type) {

        },
    }

});