var hero = require('hero');

cc.Class({
    extends: hero,

    properties: {
        armatureDisplay: {
            default: null,
            type: dragonBones.ArmatureDisplay
        },
    },

    // use this for initialization
    onLoad: function () {
        this._super();

        // this.armature = this.armatureDisplay.armature();
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },

    // ========================================================
    // 行为状态
    onIdle: function() {
        // var animation = this.armature.animation;
        // animation.fadeIn('idle', -1, -1, 0, NORMAL_ANIMATION_GROUP);
        this.armatureDisplay.playAnimation('idle', 0);
    },

    onWalking: function() {
        this.armatureDisplay.playAnimation('walk', 0);
    },

    onRun: function() {
        this.armatureDisplay.playAnimation('run', 0);
    },

    onAttacking: function() {
        this.armatureDisplay.playAnimation('attack', -1);
    },

    onSkilling: function() {
        this.armatureDisplay.playAnimation('skill', -1);
    },

    onHurting: function() {
        this.armatureDisplay.playAnimation('hurt', -1);
    },

    onDead: function() {
        this.armatureDisplay.playAnimation('die', -1);
    },
});
