(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

// require('../common/core.js');
var $ = require('jquery');
// import myimport from '../comp/index.js';
// const myclass = require('../comp/class.js');
// const querystring = require('querystring');
//
// var obj = querystring.parse('foo=bar&baz=qux&baz=quux&corge');
//
// $('#test').html(obj.foo+ '|' +myclass.speak() + '|' + myimport());

var DateUtil = require('libutil-datetime');

$('#test').html(DateUtil.base(new Date().getTime(), 'yy.MM.dd hh:mm'));

},{"jquery":"jquery","libutil-datetime":2}],2:[function(require,module,exports){
/**
 * 各种日期格式化方法
 * var DateUtil = require('libutil/datetime');
 */

/**
 * 通用日期格式化方法
 * @param date 要格式化的日期
 * @param format 进行格式化的模式字符串
 *     支持的模式字母有：
 *     y:年,
 *     M:年中的月份(1-12),
 *     d:月份中的天(1-31),
 *     h:小时(0-23),
 *     m:分(0-59),
 *     s:秒(0-59),
 *     S:毫秒(0-999),
 *     q:季度(1-4)
 * @example
 *      DateUtil.base(new Date().getTime(),'yy.MM.dd hh:mm')
 */
exports.base = function (date, format) {
    date = new Date(date);

    var map = {
        "M": date.getMonth() + 1, //月份
        "d": date.getDate(), //日
        "h": date.getHours(), //小时
        "m": date.getMinutes(), //分
        "s": date.getSeconds(), //秒
        "q": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
    };
    format = format.replace(/([yMdhmsqS])+/g, function (all, t) {
        var v = map[t];
        if (v !== undefined) {
            if (all.length > 1) {
                v = '0' + v;
                v = v.substr(v.length - 2);
            }
            return v;
        } else if (t === 'y') {
            return (date.getFullYear() + '').substr(4 - all.length);
        }
        return all;
    });
    return format;
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3Rvb2wvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInB1YmxpY1xcamF2YXNjcmlwdHNcXHBhZ2VcXGJyb3dzZXIuanMiLCIuLlxcbm9kZS13aWRnZXQtcGNcXHV0aWxcXGRhdGV0aW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTtBQUNBLElBQU0sSUFBSSxRQUFRLFFBQVIsQ0FBVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLElBQUksV0FBVyxRQUFRLGtCQUFSLENBQWY7O0FBRUEsRUFBRSxPQUFGLEVBQVcsSUFBWCxDQUFnQixTQUFTLElBQVQsQ0FBYyxJQUFJLElBQUosR0FBVyxPQUFYLEVBQWQsRUFBbUMsZ0JBQW5DLENBQWhCOzs7QUNaQTs7Ozs7QUFNQTs7Ozs7Ozs7Ozs7Ozs7OztBQWdCQSxRQUFRLElBQVIsR0FBZSxVQUFTLElBQVQsRUFBYyxNQUFkLEVBQXFCO0FBQ2hDLFdBQU8sSUFBSSxJQUFKLENBQVMsSUFBVCxDQUFQOztBQUVBLFFBQUksTUFBTTtBQUNOLGFBQUssS0FBSyxRQUFMLEtBQWtCLENBRGpCLEVBQ29CO0FBQzFCLGFBQUssS0FBSyxPQUFMLEVBRkMsRUFFZTtBQUNyQixhQUFLLEtBQUssUUFBTCxFQUhDLEVBR2dCO0FBQ3RCLGFBQUssS0FBSyxVQUFMLEVBSkMsRUFJa0I7QUFDeEIsYUFBSyxLQUFLLFVBQUwsRUFMQyxFQUtrQjtBQUN4QixhQUFLLEtBQUssS0FBTCxDQUFXLENBQUMsS0FBSyxRQUFMLEtBQWtCLENBQW5CLElBQXdCLENBQW5DLENBTkMsRUFNc0M7QUFDNUMsYUFBSyxLQUFLLGVBQUwsRUFQQyxDQU9zQjtBQVB0QixLQUFWO0FBU0EsYUFBUyxPQUFPLE9BQVAsQ0FBZSxnQkFBZixFQUFpQyxVQUFTLEdBQVQsRUFBYyxDQUFkLEVBQWdCO0FBQ3RELFlBQUksSUFBSSxJQUFJLENBQUosQ0FBUjtBQUNBLFlBQUcsTUFBTSxTQUFULEVBQW1CO0FBQ2YsZ0JBQUcsSUFBSSxNQUFKLEdBQWEsQ0FBaEIsRUFBa0I7QUFDZCxvQkFBSSxNQUFNLENBQVY7QUFDQSxvQkFBSSxFQUFFLE1BQUYsQ0FBUyxFQUFFLE1BQUYsR0FBUyxDQUFsQixDQUFKO0FBQ0g7QUFDRCxtQkFBTyxDQUFQO0FBQ0gsU0FORCxNQU9LLElBQUcsTUFBTSxHQUFULEVBQWE7QUFDZCxtQkFBTyxDQUFDLEtBQUssV0FBTCxLQUFxQixFQUF0QixFQUEwQixNQUExQixDQUFpQyxJQUFJLElBQUksTUFBekMsQ0FBUDtBQUNIO0FBQ0QsZUFBTyxHQUFQO0FBQ0gsS0FiUSxDQUFUO0FBY0EsV0FBTyxNQUFQO0FBQ0gsQ0EzQkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gcmVxdWlyZSgnLi4vY29tbW9uL2NvcmUuanMnKTtcclxuY29uc3QgJCA9IHJlcXVpcmUoJ2pxdWVyeScpO1xyXG4vLyBpbXBvcnQgbXlpbXBvcnQgZnJvbSAnLi4vY29tcC9pbmRleC5qcyc7XHJcbi8vIGNvbnN0IG15Y2xhc3MgPSByZXF1aXJlKCcuLi9jb21wL2NsYXNzLmpzJyk7XHJcbi8vIGNvbnN0IHF1ZXJ5c3RyaW5nID0gcmVxdWlyZSgncXVlcnlzdHJpbmcnKTtcclxuLy9cclxuLy8gdmFyIG9iaiA9IHF1ZXJ5c3RyaW5nLnBhcnNlKCdmb289YmFyJmJhej1xdXgmYmF6PXF1dXgmY29yZ2UnKTtcclxuLy9cclxuLy8gJCgnI3Rlc3QnKS5odG1sKG9iai5mb28rICd8JyArbXljbGFzcy5zcGVhaygpICsgJ3wnICsgbXlpbXBvcnQoKSk7XHJcblxyXG52YXIgRGF0ZVV0aWwgPSByZXF1aXJlKCdsaWJ1dGlsLWRhdGV0aW1lJyk7XHJcblxyXG4kKCcjdGVzdCcpLmh0bWwoRGF0ZVV0aWwuYmFzZShuZXcgRGF0ZSgpLmdldFRpbWUoKSwneXkuTU0uZGQgaGg6bW0nKSk7XHJcbiIsIi8qKlxyXG4gKiDlkITnp43ml6XmnJ/moLzlvI/ljJbmlrnms5VcclxuICogdmFyIERhdGVVdGlsID0gcmVxdWlyZSgnbGlidXRpbC9kYXRldGltZScpO1xyXG4gKi9cclxuXHJcblxyXG4vKipcclxuICog6YCa55So5pel5pyf5qC85byP5YyW5pa55rOVXHJcbiAqIEBwYXJhbSBkYXRlIOimgeagvOW8j+WMlueahOaXpeacn1xyXG4gKiBAcGFyYW0gZm9ybWF0IOi/m+ihjOagvOW8j+WMlueahOaooeW8j+Wtl+espuS4slxyXG4gKiAgICAg5pSv5oyB55qE5qih5byP5a2X5q+N5pyJ77yaXHJcbiAqICAgICB5OuW5tCxcclxuICogICAgIE065bm05Lit55qE5pyI5Lu9KDEtMTIpLFxyXG4gKiAgICAgZDrmnIjku73kuK3nmoTlpKkoMS0zMSksXHJcbiAqICAgICBoOuWwj+aXtigwLTIzKSxcclxuICogICAgIG065YiGKDAtNTkpLFxyXG4gKiAgICAgczrnp5IoMC01OSksXHJcbiAqICAgICBTOuavq+enkigwLTk5OSksXHJcbiAqICAgICBxOuWto+W6pigxLTQpXHJcbiAqIEBleGFtcGxlXHJcbiAqICAgICAgRGF0ZVV0aWwuYmFzZShuZXcgRGF0ZSgpLmdldFRpbWUoKSwneXkuTU0uZGQgaGg6bW0nKVxyXG4gKi9cclxuZXhwb3J0cy5iYXNlID0gZnVuY3Rpb24oZGF0ZSxmb3JtYXQpe1xyXG4gICAgZGF0ZSA9IG5ldyBEYXRlKGRhdGUpO1xyXG5cclxuICAgIHZhciBtYXAgPSB7XHJcbiAgICAgICAgXCJNXCI6IGRhdGUuZ2V0TW9udGgoKSArIDEsIC8v5pyI5Lu9XHJcbiAgICAgICAgXCJkXCI6IGRhdGUuZ2V0RGF0ZSgpLCAvL+aXpVxyXG4gICAgICAgIFwiaFwiOiBkYXRlLmdldEhvdXJzKCksIC8v5bCP5pe2XHJcbiAgICAgICAgXCJtXCI6IGRhdGUuZ2V0TWludXRlcygpLCAvL+WIhlxyXG4gICAgICAgIFwic1wiOiBkYXRlLmdldFNlY29uZHMoKSwgLy/np5JcclxuICAgICAgICBcInFcIjogTWF0aC5mbG9vcigoZGF0ZS5nZXRNb250aCgpICsgMykgLyAzKSwgLy/lraPluqZcclxuICAgICAgICBcIlNcIjogZGF0ZS5nZXRNaWxsaXNlY29uZHMoKSAvL+avq+enklxyXG4gICAgfTtcclxuICAgIGZvcm1hdCA9IGZvcm1hdC5yZXBsYWNlKC8oW3lNZGhtc3FTXSkrL2csIGZ1bmN0aW9uKGFsbCwgdCl7XHJcbiAgICAgICAgdmFyIHYgPSBtYXBbdF07XHJcbiAgICAgICAgaWYodiAhPT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgaWYoYWxsLmxlbmd0aCA+IDEpe1xyXG4gICAgICAgICAgICAgICAgdiA9ICcwJyArIHY7XHJcbiAgICAgICAgICAgICAgICB2ID0gdi5zdWJzdHIodi5sZW5ndGgtMik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHY7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYodCA9PT0gJ3knKXtcclxuICAgICAgICAgICAgcmV0dXJuIChkYXRlLmdldEZ1bGxZZWFyKCkgKyAnJykuc3Vic3RyKDQgLSBhbGwubGVuZ3RoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGFsbDtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGZvcm1hdDtcclxufTtcclxuIl19
