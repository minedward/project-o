/**
 * 函数工具包
 */
(function () {

    var Helper = {
        
        /**
         * 获取随机整数
         * 
         * @param  {Number} max 最大值
         * @param  {Number} min 最小值（默认为0）
         * 
         * @return {Number} 随机数
         */
        getRandom: function(max, min) {
            min = min || 0;
            return Math.floor(Math.random() * (max - min)) + min;
        },

        /**
         * 整数前补0
         * 
         * @param  {Number} num 值
         * @param  {Number} n   字符串长度
         * 
         * @return {String} num=1 n=2 : 1 -> '01'
         */
        prefixInteger: function(num, n) {
            return (Array(n).join(0) + num).slice(-n);
        },

        /**
         * 深拷贝对象
         * 
         * @param  {Array || Object} o 数组或对象
         * 
         * @return {Array || Object}
         */
        clone: function(o){
            var k, ret= o, b;
            if(o && ((b = (o instanceof Array)) || o instanceof Object)) {
                ret = b ? [] : {};
                for(k in o){
                    if(o.hasOwnProperty(k)){
                        ret[k] = this.clone(o[k]);
                    }
                }
            }
            return ret;
        },

        /**
         * 时间戳格式化(年月日)
         * 
         * @param {Integer} timeStamp 时间戳
         * 
         * @return {String} 2016/8/28
         */
        getTimeStr: function (timeStamp) {
            var timeTab = timeStamp ? new Date(parseInt(timeStamp)) : new Date();
            var timeStr = `${timeTab.getFullYear()}/${timeTab.getMonth() + 1}/${timeTab.getDate()}`

            return timeStr;
        },

        /**
         * 时间戳格式化(时分秒)
         * 
         * @param {Integer} timeStamp 时间戳
         * 
         * 
         * @return {String} xx:xx:xx
         */
        getTimeStrBySecond: function (timeStamp) {

            function p(str) {
                return str < 10 ? '0' + str: str;
            }

            let h = p(parseInt(timeStamp / 3600));
            let m = p(parseInt((timeStamp % 3600) / 60));
            let s = p(parseInt((timeStamp % 3600) % 60));

            return `${h}:${m}:${s}`;
        },

        /**
         * 时间戳格式化(活动时间计时)
         * 
         * @param {Integer} timeStamp 时间戳
         * 
         * 
         * @return {String} xx天xx时xx分xx秒
         */
        getTimeDayStrBySecond: function (timeStamp) {

            function p(str) {
                return str < 10 ? '0' + str: str;
            }

            let d = parseInt(timeStamp / (24 * 3600));
            let h = parseInt(timeStamp / 3600);
            let m = parseInt((timeStamp % 3600) / 60);
            let s = parseInt((timeStamp % 3600) % 60);

            return `${d}天${h}时${m}分${s}秒`;
        },

        /**
         * 打印列表数据
         * 
         * @param  {Array || Object} o 数组或对象
         * 
         * @return {String}
         */
        dump: function(o) {
            cc.log(`Table data ==>> ${JSON.stringify(o)}`);
        },

        /**
         * 数字格式化为千分位
         * 
         * @param {Number || String} 需要转变的数字
         * 
         * @return {String} 456123456 -> 456,123,456
         */
        thousandsFormat: function(num) {   
            var reg = /(?=(?!\b)(\d{3})+$)/g;
            return String(num).replace(reg, ',');
        },

        /**
         * 数字格式化为千分位(逆向)
         * 
         * @param {String} 需要转变的数字串
         * 
         * @return {Number} 456,123,456 -> 456123456 
         */
        thousandsRevert: function(numStr) {
            numStr = numStr.replace(/,/gi, '');
            return numStr - 0;
        },
    }

});