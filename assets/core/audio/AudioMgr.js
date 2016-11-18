/**
 * 音乐管理类
 */
(function () {

    var AudioMgr = {

        path: '',

        audio: {},

        isPlayMusic: true,

        /**
         * 初始化所有音频（视项目而定）
         */
        init: function() {

        },

        /**
         * 加载音频
         * 
         * @param {String} url 音频名
         */
        load: function(url) {
            var audioPath = path + url;
            cc.loader.loadRes(audioPath + '.mp3', function(err, audio) {
                if (err) {
                    cc.error(err.message || err);
                } else {
                    AudioMgr.audio[audioPath] = audio;
                }
            });
        },

        /**
         * 播放背景音效（默认循环）
         * 
         * @param {String} url 音乐名
         */
        playMusic: function(url) {
            var audio = this.audio[path + url];
            if (audio)
			    cc.audioEngine.playMusic(music, true);

            if (MUSIC_SWITCH) {
                this.resumeMusic();
            } else {
                this.pauseMusic();
            }

            this.isPlayMusic = true;
        },

        /**
         * 暂停播放背景音乐
         */
        pauseMusic: function() {
            cc.audioEngine.pauseMusic();
        },

        /**
         * 恢复播放背景音乐
         */
        resumeMusic: function() {
            if (this.isPlayMusic) {
                cc.audioEngine.resumeMusic();
                this.isPlayMusic = true;
            }
        },

        /**
         * 停止播放背景音乐
         */
        stopMusic: function() {
		    this.isPlayMusic = false;
		    cc.audioEngine.stopMusic();
        },

        /**
         * 播放背景音效
         * 
         * @param {String} url 音效名
         * @param {Bool} loop 是否循环
         * 
         * @return {Number} 音效ID
         */
        playEffect: function(url, loop) {
            var audio = this.audio[path + url];
            loop = loop || false;
            if (audio && SOUND_SWITCH)
			    return cc.audioEngine.playEffect(music, loop);
        },

        /**
         * 停止播放指定音效
         * 
         * @param {Number} audioID 音效ID
         */
        stopEffect: function(audioID) {
            cc.audioEngine.stopEffect(audioID);
        },

        /**
         * 停止正在播放的所有音效
         */
        stopAllEffects : function() {
            cc.audioEngine.stopAllEffects();
        },
    }

});
