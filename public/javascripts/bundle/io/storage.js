(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/**
 * @fileoverview 放到自己的项目中，统一的本地存储配置
 * @version 1.0 | 2017-05-24 版本信息
 * @author Zhang Mingrui | 592044573@qq.com
 * @example
 * */

var Storage = require('libio-storage');

/**
 * 本地存储对象所属组，命名可自行修改。默认是ZMRDLB
 * @type {String}
 */
// Storage.groupname = 'myprojectname';

module.exports = {
  listdata: Storage.create({
    maxage: '1D', //保存1天
    key: 'listdata'
  }),
  listdatatwo: Storage.create({
    maxage: '0.1H', //保存0.1小时
    key: 'listdatatwo'
  })
};

},{"libio-storage":2}],2:[function(require,module,exports){
'use strict';

/**
 * @fileoverview 使用localStorage进行数据存储
 * @version 1.0 | 2017-04-13 版本信息
 * @author Zhang Mingrui | 592044573@qq.com
 * @return
 * */

/**
 * 数据存储类
 * @param {[type]} opt [description]
 */
function Storage(opt) {
    opt = $.extend({
        /**
         * 存储周期，默认为1天。后缀说明
         * M: 月
         * D: 日
         * H: 小时
         * @type {String}
         * @example 1.5D 0.5H 3M 15D0.2H
         * 特别说明：只支持1位小数
         */
        maxage: '1D',
        key: '' //* 键值
    }, opt);

    if (opt.key == '' || opt.maxage == '') {
        throw new Error('libio/storage 参数传入错误');
    } else if (!/^((\d+)(\.([1-9]{1}))?([MDH]))+$/.test(opt.maxage)) {
        throw new Error('libio/storage maxage配置格式不正确');
    }

    opt.key = Storage.groupname + '_' + opt.key;

    this.opt = opt;
}

/**
 * 计算过期时间点
 * @return {String} DateTime过期时间点字符串
 */
Storage.prototype._getOutDateTime = function () {
    var maxage = this.opt.maxage,
        nowtime = new Date().getTime(),
        diffhour = 0,
        reg = /(\d+)(\.([1-9]{1}))?([MDH])/g,
        rearr = null;

    while ((rearr = reg.exec(maxage)) != null) {
        var num = rearr[1],
            //整数部分
        suffix = rearr[4];
        if (rearr[2]) {
            //说明存在小数
            num += rearr[2];
        }
        num = Number(num);
        switch (suffix) {
            case 'M':
                diffhour += num * 30 * 24;
                break;
            case 'D':
                diffhour += num * 24;
                break;
            case 'H':
                diffhour += num;
                break;
            default:
                break;
        }
    }

    nowtime += diffhour * 60 * 60 * 1000;

    return nowtime;
};

/**
 * 数据设置
 * @param {JSON} data 待存储的数据
 * 实际存储的数据格式如下：
 *
 *  {
 *      endTime: {String}
 *      data: data
 *  }
 */
Storage.prototype.set = function (data) {
    if (!data || Object.keys(data).length == 0) {
        return;
    }

    localStorage.setItem(this.opt.key, JSON.stringify({
        endTime: this._getOutDateTime(),
        data: data
    }));
};

/**
 * 获取数据
 * @return {JSON|Null} 返回set时候的data。如果过期则返回null
 */
Storage.prototype.get = function () {
    //判断是否过期
    var value = localStorage.getItem(this.opt.key);
    if (value == null) {
        return null;
    } else {
        value = JSON.parse(value);
        if (Number(value.endTime) <= new Date().getTime()) {
            //过期
            this.remove();
            return null;
        } else {
            return value.data;
        }
    }
};

/**
 * 删除此项数据
 * @return {[type]} [description]
 */
Storage.prototype.remove = function () {
    localStorage.removeItem(this.opt.key);
};

/**
 * 数据储存所属组名称
 * @type {String}
 */
Storage.groupname = 'ZMRDLB';

/**
 * 删除全部在组Storage.groupname下的缓存数据
 * @return {[type]} [description]
 */
Storage.clear = function () {
    var reg = new RegExp('^' + Storage.groupname);
    while (localStorage.length > 0) {
        var key = localStorage.key(0);
        if (reg.test(key)) {
            localStorage.removeItem(key);
        }
    }
};

/**
 * 创建一个Storage对象
 * @param  {JSON} opt 详见Storage定义处
 * @return {Storage}     [description]
 */
Storage.create = function (opt) {
    return new Storage(opt);
};

module.exports = Storage;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3Rvb2wvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInB1YmxpY1xcamF2YXNjcmlwdHNcXHBhZ2VcXGlvXFxzdG9yYWdlLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFxpb1xcc3RvcmFnZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7Ozs7QUFPQSxJQUFNLFVBQVUsUUFBUSxlQUFSLENBQWhCOztBQUVDOzs7O0FBSUE7O0FBRUQsT0FBTyxPQUFQLEdBQWlCO0FBQ1osWUFBVSxRQUFRLE1BQVIsQ0FBZTtBQUNyQixZQUFRLElBRGEsRUFDUDtBQUNkLFNBQUs7QUFGZ0IsR0FBZixDQURFO0FBS1osZUFBYSxRQUFRLE1BQVIsQ0FBZTtBQUN4QixZQUFRLE1BRGdCLEVBQ1I7QUFDaEIsU0FBSztBQUZtQixHQUFmO0FBTEQsQ0FBakI7Ozs7O0FDZkE7Ozs7Ozs7QUFPQTs7OztBQUlBLFNBQVMsT0FBVCxDQUFpQixHQUFqQixFQUFxQjtBQUNqQixVQUFNLEVBQUUsTUFBRixDQUFTO0FBQ1g7Ozs7Ozs7OztBQVNBLGdCQUFRLElBVkc7QUFXWCxhQUFLLEVBWE0sQ0FXSDtBQVhHLEtBQVQsRUFZSixHQVpJLENBQU47O0FBY0EsUUFBRyxJQUFJLEdBQUosSUFBVyxFQUFYLElBQWlCLElBQUksTUFBSixJQUFjLEVBQWxDLEVBQXFDO0FBQ2pDLGNBQU0sSUFBSSxLQUFKLENBQVUsc0JBQVYsQ0FBTjtBQUNILEtBRkQsTUFFTSxJQUFHLENBQUMsbUNBQW1DLElBQW5DLENBQXdDLElBQUksTUFBNUMsQ0FBSixFQUF3RDtBQUMxRCxjQUFNLElBQUksS0FBSixDQUFVLDZCQUFWLENBQU47QUFDSDs7QUFFRCxRQUFJLEdBQUosR0FBVSxRQUFRLFNBQVIsR0FBb0IsR0FBcEIsR0FBMEIsSUFBSSxHQUF4Qzs7QUFFQSxTQUFLLEdBQUwsR0FBVyxHQUFYO0FBQ0g7O0FBRUQ7Ozs7QUFJQSxRQUFR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dGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcg5pS+5Yiw6Ieq5bex55qE6aG555uu5Lit77yM57uf5LiA55qE5pys5Zyw5a2Y5YKo6YWN572uXHJcbiAqIEB2ZXJzaW9uIDEuMCB8IDIwMTctMDUtMjQg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQGV4YW1wbGVcclxuICogKi9cclxuXHJcbmNvbnN0IFN0b3JhZ2UgPSByZXF1aXJlKCdsaWJpby1zdG9yYWdlJyk7XHJcblxyXG4gLyoqXHJcbiAgKiDmnKzlnLDlrZjlgqjlr7nosaHmiYDlsZ7nu4TvvIzlkb3lkI3lj6/oh6rooYzkv67mlLnjgILpu5jorqTmmK9aTVJETEJcclxuICAqIEB0eXBlIHtTdHJpbmd9XHJcbiAgKi9cclxuIC8vIFN0b3JhZ2UuZ3JvdXBuYW1lID0gJ215cHJvamVjdG5hbWUnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICAgbGlzdGRhdGE6IFN0b3JhZ2UuY3JlYXRlKHtcclxuICAgICAgICAgbWF4YWdlOiAnMUQnLCAvL+S/neWtmDHlpKlcclxuICAgICAgICAga2V5OiAnbGlzdGRhdGEnXHJcbiAgICAgfSksXHJcbiAgICAgbGlzdGRhdGF0d286IFN0b3JhZ2UuY3JlYXRlKHtcclxuICAgICAgICAgbWF4YWdlOiAnMC4xSCcsIC8v5L+d5a2YMC4x5bCP5pe2XHJcbiAgICAgICAgIGtleTogJ2xpc3RkYXRhdHdvJ1xyXG4gICAgIH0pXHJcbn07XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IOS9v+eUqGxvY2FsU3RvcmFnZei/m+ihjOaVsOaNruWtmOWCqFxyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE3LTA0LTEzIOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm5cclxuICogKi9cclxuXHJcbi8qKlxyXG4gKiDmlbDmja7lrZjlgqjnsbtcclxuICogQHBhcmFtIHtbdHlwZV19IG9wdCBbZGVzY3JpcHRpb25dXHJcbiAqL1xyXG5mdW5jdGlvbiBTdG9yYWdlKG9wdCl7XHJcbiAgICBvcHQgPSAkLmV4dGVuZCh7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5a2Y5YKo5ZGo5pyf77yM6buY6K6k5Li6MeWkqeOAguWQjue8gOivtOaYjlxyXG4gICAgICAgICAqIE06IOaciFxyXG4gICAgICAgICAqIEQ6IOaXpVxyXG4gICAgICAgICAqIEg6IOWwj+aXtlxyXG4gICAgICAgICAqIEB0eXBlIHtTdHJpbmd9XHJcbiAgICAgICAgICogQGV4YW1wbGUgMS41RCAwLjVIIDNNIDE1RDAuMkhcclxuICAgICAgICAgKiDnibnliKvor7TmmI7vvJrlj6rmlK/mjIEx5L2N5bCP5pWwXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgbWF4YWdlOiAnMUQnLFxyXG4gICAgICAgIGtleTogJycgLy8qIOmUruWAvFxyXG4gICAgfSxvcHQpO1xyXG5cclxuICAgIGlmKG9wdC5rZXkgPT0gJycgfHwgb3B0Lm1heGFnZSA9PSAnJyl7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdsaWJpby9zdG9yYWdlIOWPguaVsOS8oOWFpemUmeivrycpO1xyXG4gICAgfWVsc2UgaWYoIS9eKChcXGQrKShcXC4oWzEtOV17MX0pKT8oW01ESF0pKSskLy50ZXN0KG9wdC5tYXhhZ2UpKXtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2xpYmlvL3N0b3JhZ2UgbWF4YWdl6YWN572u5qC85byP5LiN5q2j56GuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgb3B0LmtleSA9IFN0b3JhZ2UuZ3JvdXBuYW1lICsgJ18nICsgb3B0LmtleTtcclxuXHJcbiAgICB0aGlzLm9wdCA9IG9wdDtcclxufVxyXG5cclxuLyoqXHJcbiAqIOiuoeeul+i/h+acn+aXtumXtOeCuVxyXG4gKiBAcmV0dXJuIHtTdHJpbmd9IERhdGVUaW1l6L+H5pyf5pe26Ze054K55a2X56ym5LiyXHJcbiAqL1xyXG5TdG9yYWdlLnByb3RvdHlwZS5fZ2V0T3V0RGF0ZVRpbWUgPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIG1heGFnZSA9IHRoaXMub3B0Lm1heGFnZSxcclxuICAgICAgICBub3d0aW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCksXHJcbiAgICAgICAgZGlmZmhvdXIgPSAwLFxyXG4gICAgICAgIHJlZyA9IC8oXFxkKykoXFwuKFsxLTldezF9KSk/KFtNREhdKS9nLFxyXG4gICAgICAgIHJlYXJyID0gbnVsbDtcclxuXHJcbiAgICB3aGlsZSgocmVhcnIgPSByZWcuZXhlYyhtYXhhZ2UpKSAhPSBudWxsKXtcclxuICAgICAgICB2YXIgbnVtID0gcmVhcnJbMV0sIC8v5pW05pWw6YOo5YiGXHJcbiAgICAgICAgICAgIHN1ZmZpeCA9IHJlYXJyWzRdO1xyXG4gICAgICAgIGlmKHJlYXJyWzJdKXsgLy/or7TmmI7lrZjlnKjlsI/mlbBcclxuICAgICAgICAgICAgbnVtICs9IHJlYXJyWzJdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBudW0gPSBOdW1iZXIobnVtKTtcclxuICAgICAgICBzd2l0Y2ggKHN1ZmZpeCkge1xyXG4gICAgICAgICAgICBjYXNlICdNJzpcclxuICAgICAgICAgICAgICAgIGRpZmZob3VyICs9IG51bSozMCoyNDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdEJzpcclxuICAgICAgICAgICAgICAgIGRpZmZob3VyICs9IG51bSoyNDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdIJzpcclxuICAgICAgICAgICAgICAgIGRpZmZob3VyICs9IG51bTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG5vd3RpbWUgKz0gZGlmZmhvdXIqNjAqNjAqMTAwMDtcclxuXHJcbiAgICByZXR1cm4gbm93dGltZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiDmlbDmja7orr7nva5cclxuICogQHBhcmFtIHtKU09OfSBkYXRhIOW+heWtmOWCqOeahOaVsOaNrlxyXG4gKiDlrp7pmYXlrZjlgqjnmoTmlbDmja7moLzlvI/lpoLkuIvvvJpcclxuICpcclxuICogIHtcclxuICogICAgICBlbmRUaW1lOiB7U3RyaW5nfVxyXG4gKiAgICAgIGRhdGE6IGRhdGFcclxuICogIH1cclxuICovXHJcblN0b3JhZ2UucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgaWYoIWRhdGEgfHwgT2JqZWN0LmtleXMoZGF0YSkubGVuZ3RoID09IDApe1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLm9wdC5rZXksIEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICBlbmRUaW1lOiB0aGlzLl9nZXRPdXREYXRlVGltZSgpLFxyXG4gICAgICAgIGRhdGE6IGRhdGFcclxuICAgIH0pKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOiOt+WPluaVsOaNrlxyXG4gKiBAcmV0dXJuIHtKU09OfE51bGx9IOi/lOWbnnNldOaXtuWAmeeahGRhdGHjgILlpoLmnpzov4fmnJ/liJnov5Tlm55udWxsXHJcbiAqL1xyXG5TdG9yYWdlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbigpe1xyXG4gICAgLy/liKTmlq3mmK/lkKbov4fmnJ9cclxuICAgIHZhciB2YWx1ZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMub3B0LmtleSk7XHJcbiAgICBpZih2YWx1ZSA9PSBudWxsKXtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1lbHNle1xyXG4gICAgICAgIHZhbHVlID0gSlNPTi5wYXJzZSh2YWx1ZSk7XHJcbiAgICAgICAgaWYoTnVtYmVyKHZhbHVlLmVuZFRpbWUpIDw9IG5ldyBEYXRlKCkuZ2V0VGltZSgpKXsgLy/ov4fmnJ9cclxuICAgICAgICAgICAgdGhpcy5yZW1vdmUoKTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5kYXRhO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOWIoOmZpOatpOmhueaVsOaNrlxyXG4gKiBAcmV0dXJuIHtbdHlwZV19IFtkZXNjcmlwdGlvbl1cclxuICovXHJcblN0b3JhZ2UucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSh0aGlzLm9wdC5rZXkpO1xyXG59XHJcblxyXG4vKipcclxuICog5pWw5o2u5YKo5a2Y5omA5bGe57uE5ZCN56ewXHJcbiAqIEB0eXBlIHtTdHJpbmd9XHJcbiAqL1xyXG5TdG9yYWdlLmdyb3VwbmFtZSA9ICdaTVJETEInO1xyXG5cclxuLyoqXHJcbiAqIOWIoOmZpOWFqOmDqOWcqOe7hFN0b3JhZ2UuZ3JvdXBuYW1l5LiL55qE57yT5a2Y5pWw5o2uXHJcbiAqIEByZXR1cm4ge1t0eXBlXX0gW2Rlc2NyaXB0aW9uXVxyXG4gKi9cclxuU3RvcmFnZS5jbGVhciA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgcmVnID0gbmV3IFJlZ0V4cCgnXicrU3RvcmFnZS5ncm91cG5hbWUpO1xyXG4gICAgd2hpbGUobG9jYWxTdG9yYWdlLmxlbmd0aCA+IDApIHtcclxuICAgICAgICB2YXIga2V5ID0gbG9jYWxTdG9yYWdlLmtleSgwKTtcclxuICAgICAgICBpZihyZWcudGVzdChrZXkpKXtcclxuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oa2V5KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDliJvlu7rkuIDkuKpTdG9yYWdl5a+56LGhXHJcbiAqIEBwYXJhbSAge0pTT059IG9wdCDor6bop4FTdG9yYWdl5a6a5LmJ5aSEXHJcbiAqIEByZXR1cm4ge1N0b3JhZ2V9ICAgICBbZGVzY3JpcHRpb25dXHJcbiAqL1xyXG5TdG9yYWdlLmNyZWF0ZSA9IGZ1bmN0aW9uKG9wdCl7XHJcbiAgICByZXR1cm4gbmV3IFN0b3JhZ2Uob3B0KTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTdG9yYWdlO1xyXG4iXX0=
