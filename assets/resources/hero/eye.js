cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad: function() {
        this.hero = this.node.parent.getComponent('hero');
    },
    
    onCollisionEnter: function (other, self) {
        console.log('on eye enter');
        var entity = other.getComponent('entity');
        if (!entity) return;
        if (entity.camp == this.hero.camp) return;
        if (other.tag == 99) return;
        
        this.hero.target = other.node;
        this.hero.moveByTarget(cc.director.getDeltaTime());
        this.node.active = false;
    },
});
