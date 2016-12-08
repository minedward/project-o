var default_vert = require('ccShader_Default_Vert');
var shadow_frag = require('ccShader_Shadow_Frag');

var EffectShadow = cc.Class({
    extends: cc.Component,

    properties: {
        isAllChildrenUser: false,
    },

    editor: {
        menu: '添加Shader组件/Shadow'
    },

    onLoad: function () {
        this.use();
    },

    use: function() {
        this.program = new cc.GLProgram();
        if (cc.sys.isNative) {
            cc.log("use native GLProgram")
            this.program.initWithString(default_vert, shadow_frag);
            this.program.link();
            this.program.updateUniforms();
        }else{
            this.program.initWithVertexShaderByteArray(default_vert, shadow_frag);
            this.program.addAttribute(cc.macro.ATTRIBUTE_NAME_POSITION, cc.macro.VERTEX_ATTRIB_POSITION);
            this.program.addAttribute(cc.macro.ATTRIBUTE_NAME_COLOR, cc.macro.VERTEX_ATTRIB_COLOR);
            this.program.addAttribute(cc.macro.ATTRIBUTE_NAME_TEX_COORD, cc.macro.VERTEX_ATTRIB_TEX_COORDS);
            this.program.link();
            this.program.updateUniforms();
        }
        this.setProgram( this.node._sgNode, this.program );
        
    },

    setProgram:function (node, program) {
        if (cc.sys.isNative) {
            var glProgram_state = cc.GLProgramState.getOrCreateWithGLProgram(program);
            node.setGLProgramState(glProgram_state);
        } else{
            node.setShaderProgram(program);    
        }
        
        var children = node.children;
        if (!children) return;

        for (var i = 0; i < children.length; i++)
        {
            this.setProgram(children[i], program);
        }
    }, 
});


cc.Shadow = module.exports = EffectShadow;