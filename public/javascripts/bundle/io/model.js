(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/**
 * 放到自己项目中，统一定义的io处理层
 *
 * 使用jquery提供的ajax方法和本身封装的io业务层实现
 */
var IoConfig = require('libio-ioconfig'),
    Interio = require('libio-interio'),
    Storage = require('./storage');
/**
 * 统一处理未登录
 */
IoConfig.login.filter = function (result) {
    return result.code == 'A0002';
};
IoConfig.login.url = 'http://baidu.com/';

/**
 * 所有接口的io业务错误统一处理
 */
IoConfig.fail.filter = function (result) {
    return result.code != 'A0001';
};
IoConfig.iocall.fail = function (result) {
    _APP.Toast.show(result.errmsg || '网络错误');
};
IoConfig.iocall.error = function (jqXHR, textStatus, errorThrown) {
    _APP.Toast.show(textStatus || '网络错误');
};

IoConfig.ioargs.beforeSend = function () {
    //  _APP.Loading.show();
    console.log('请求开始');
};
IoConfig.iocall.complete = function () {
    //  _APP.Loading.hide();
    console.log('请求结束');
};

//支持跨越
IoConfig.ioargs.crossDomain = true;
/**
 * 数据接口配置
 */
var basehost = 'http://127.0.0.1:8000';

/**
 * url格式化
 * @example buildUrl('/rer/{sex}/fewr/{id}',{sex:'aa',id:'11'})
 *          返回：/rer/aa/fewr/11
 */
function buildUrl(url, data, isencode) {
    var reg = /\{([a-zA-A]+)\}/g;
    return url.replace(reg, function (all, key) {
        return isencode ? encodeURIComponent(data[key]) : data[key];
    });
}
/**
 * 请求数据层model
 * @param {Object} ioargs 传入的参数同$ioconfig.ioargs格式一致，一般是：
     * {
     * 	   data: {}
     * }
   @param {JSON} *iocall 传入的参数同$ioconfig.iocall格式一致，一般是：
   * {
   *     success
   *     complete
   *     //以下已经有统一处理，如果想覆盖则自行传入
   *     error
   *     fail
   * }
   @param {Object} urlData 针对url里面有{替换参数名}的情况，传入的键值对应数据
 */
module.exports = {
    /**
     * 获取项目文件目录结构
     * urlData: {
     *     id
     * }
     */
    main: function main(ioargs, iocall, urlData) {
        var _url = buildUrl(basehost + '/tracer/main/trace/{id}', urlData, true);
        Interio.transRequest($.extend({
            url: _url,
            method: 'GET'
        }, ioargs), iocall);
    },
    /**
     * 列表数据
     */
    listdata: function listdata(ioargs, iocall) {
        Interio.transRequest($.extend({
            url: basehost + '/listdata',
            method: 'POST',
            /**
             * 如果想对接口的数据进行缓存，则进行以下配置
             *
             * 数据缓存，暂不区分接口请求参数
             * @type {Object}
             */
            customconfig: {
                storage: Storage.listdata //配置缓存对象，必填
                //如果请求该接口前，要清楚所有本地缓存，则添加此配置
                //如：当前接口是用户登录/退出接口，则清除所有敏感数据
                // clearall: true
            }
        }, ioargs), iocall);
    },

    //登录接口
    login: function login(ioargs, iocall) {
        Interio.transRequest($.extend({
            url: '/users/login',
            method: 'POST'
        }, ioargs), iocall);
    },

    //为了测试，一般不要
    $interio: Interio,
    basehost: basehost
};

},{"./storage":2,"libio-interio":3,"libio-ioconfig":4}],2:[function(require,module,exports){
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

},{"libio-storage":5}],3:[function(require,module,exports){
'use strict';

/**
 * @fileoverview io接口请求控制器，在$.ajax上进行进一步封装
 *      1. 支持接口队列请求
 *      2. 支持接口数据缓存
 *      3. 支持接口统一业务错误及其他情况处理
 * @version 1.0 | 2015-06-28 版本信息
 * @author Zhang Mingrui | 592044573@qq.com
 * @return 更多详细信息参考代码里对应定义方法或属性位置的注释说明
 * 	transRequest {Function} 执行接口接口请求
 *  transQueueRequest {Function} 对一组请求进行单独的队列控制依次请求。全部请求完毕后进行通知。
 * @example
 *   var basehost = 'http://127.0.0.1:8000';
 *
 * 	 const InterIo = require('libio-interio');
 *
 * 	 InterIo.transRequest({
		 url: basehost+'/listdata',
		 method:'POST',
		 data: {'name': 'zmrdlb'}
	 },{
		 success: function(data){
			 console.log(data);
		 }
		 // fail: function(){
		 //     console.log('覆盖统一fail处理');
		 // },
		 // error: function(){
		 //     console.log('覆盖统一error处理');
		 // },
		 // complete: function(){
		 //     console.log('完成');
		 // }
	 });
 * */

var IoConfig = require('./ioconfig.js'),
    Storage = require('./storage.js');

//请求队列控制类
function queueHandle() {
	this.queue = []; //当前队列数据
	this.inprocess = false; //当前队列接口是否正在处理
	this.complete = function () {}; //队列请求完成后的回调
};
//执行队列数据请求
queueHandle.prototype.advance = function () {
	if (this.queue.length == 0) {
		this.inprocess = false;
		if (typeof this.complete == 'function') {
			this.complete();
		}
		return;
	}
	var req = this.queue.shift();
	this.request(req, true);
};
/**
* 添加接口请求处理
* @param {JSON} *opt format后的接口参数
* @param {Boolean} advance 是否是queueHander.advance调用
*/
queueHandle.prototype.request = function (opt, advance) {
	if (this.inprocess && !advance) {
		this.queue.push(opt);
		return;
	}
	this.inprocess = true;
	request(opt);
};
/**
 * queueHandle对象控制器
 */
var queueControl = {
	_queueobjs: [], //queueHandle对象列表
	get: function get() {
		//返回当前空闲的queueHandle对象
		var curqueue = null;
		var queueobjs = this._queueobjs;
		for (var i = 0, len = queueobjs.length; i < len; i++) {
			if (queueobjs[i].inprocess == false && queueobjs[i].lock == false) {
				//既无请求又没有被锁定
				queueobjs[i].lock = true;
				curqueue = queueobjs[i];
				break;
			}
		}
		if (curqueue == null) {
			curqueue = new queueHandle();
			curqueue.lock = true;
			this._queueobjs.push(curqueue);
		}
		return curqueue;
	},
	end: function end(queue) {
		//通知当前queueHandle对象已经使用完毕
		var queueobjs = this._queueobjs;
		for (var i = 0, len = queueobjs.length; i < len; i++) {
			if (queueobjs[i] == queue) {
				//既无请求又没有被锁定
				queueobjs[i].lock = false;
				break;
			}
		}
	}
};
/**
 * 格式化io接口请求参数
 * @param {JSON} *ioopt 数据接口参数
 * param {JSON} *iocall io请求回调
 * @param {queueHandle} *queueobj 队列控制器对象
 */
function format(ioargs, iocall, queueobj) {
	var _ioargs = {},
	    _iocall = {};
	$.extend(true, _ioargs, IoConfig.ioargs, ioargs);
	$.extend(true, _iocall, IoConfig.iocall, iocall);
	IoConfig.format(_ioargs);
	var oldsuccess = _iocall.success;
	var oldcomplete = _iocall.complete;
	var deallogin = _ioargs.customconfig.deallogin;
	var dealfail = _ioargs.customconfig.dealfail;
	var dealdata = _ioargs.customconfig.dealdata;
	_iocall.success = function (data, textStatus, jqXHR) {
		//重写success方法，用来处理未登陆问题
		if (deallogin && typeof IoConfig.login.filter == 'function') {
			//监测是否有未登陆错误处理
			if (IoConfig.login.filter(data)) {
				//未登录
				if (IoConfig.login.url != '') {
					//跳转url
					var loginurl = IoConfig.login.url;
					var search = IoConfig.login.key + '=' + encodeURIComponent(location.href);
					if (loginurl.lastIndexOf('?') != -1) {
						loginurl = loginurl.replace(/\?/, '?' + search);
					} else {
						loginurl = loginurl + '?' + search;
					}
					location.href = loginurl;
					return;
				} else if (typeof IoConfig.login.deal == 'function') {
					IoConfig.login.deal(data);
					return;
				}
			}
		}
		if (dealfail && typeof IoConfig.fail.filter == 'function') {
			//检测是否有业务错误处理
			if (IoConfig.fail.filter(data)) {
				//业务错误
				if (typeof _iocall[IoConfig.fail.funname] == 'function') {
					_iocall[IoConfig.fail.funname](data, textStatus, jqXHR);
				}
			} else {
				//业务成功
				if (dealdata) {
					//统一处理业务成功数据
					typeof oldsuccess == 'function' && oldsuccess(_ioargs.dealdata(data, textStatus, jqXHR), textStatus, jqXHR);
				} else {
					typeof oldsuccess == 'function' && oldsuccess(data, textStatus, jqXHR);
				}
			}
		} else {
			typeof oldsuccess == 'function' && oldsuccess(data, textStatus, jqXHR);
		}
	};
	if (_ioargs.customconfig.queue) {
		//说明接口同意进行队列控制
		_iocall.complete = function () {
			//重写接口请求完成事件
			queueobj.advance();
			typeof oldcomplete == 'function' && oldcomplete.apply(this, Array.prototype.slice.call(arguments));
		};
	}
	return {
		ioargs: _ioargs,
		iocall: _iocall
	};
}
function doajax(ioargs, iocall) {
	var interobj = null,
	    getInter = ioargs.customconfig.getInter,
	    storage = ioargs.customconfig.storage;
	delete ioargs.customconfig;

	interobj = $.ajax(ioargs).done(iocall.success).fail(iocall.error).always(iocall.complete).done(function (data) {
		if (storage && storage instanceof Storage) {
			storage.set(data);
		}
	});
	if (interobj && typeof getInter == 'function') {
		getInter(interobj);
	}
}
/**
 * 处理接口请求
 * @param {JSON} ioopt format后的接口参数
 */
function request(ioopt) {
	var _ioargs = ioopt.ioargs,
	    _iocall = ioopt.iocall,
	    mode = _ioargs.customconfig.mode,
	    clearall = _ioargs.customconfig.clearall,
	    storage = _ioargs.customconfig.storage,
	    cachedata = null;

	//清除所有缓存
	if (clearall) {
		Storage.clear();
	}

	//是否有缓存
	if (storage && storage instanceof Storage && (cachedata = storage.get()) != null) {
		_iocall.success(cachedata, 'success', null);
		_iocall.complete();
		return;
	}

	if (mode == 'ajax') {
		if (_ioargs.dataType == undefined || _ioargs.dataType == '') {
			_ioargs.dataType = 'json';
		}
		doajax(_ioargs, _iocall);
	} else if (mode == 'jsonp') {
		_ioargs.dataType = 'jsonp';
		_ioargs.crossDomain = true;
		doajax(_ioargs, _iocall);
	} else if (mode == 'script') {
		_ioargs.dataType = 'script';
		_ioargs.crossDomain = true;
		doajax(_ioargs, _iocall);
	}
}
var mainqueue = new queueHandle(); //主线程队列控制对象
module.exports = {
	/**
  * 执行接口请求
     * @param {JSON} *ioargs 接口扩展参数。对应ioconfig.js里的ioargs配置格式
     * @param {JSON} *iocall 接口扩展参数。对应ioconfig.js里的iocall配置格式
  */
	transRequest: function transRequest(ioargs, iocall) {
		if (ioargs && iocall && ioargs.url != '') {
			var curopt = format(ioargs, iocall, mainqueue);
			if (curopt.ioargs.customconfig.queue) {
				//说明遵循队列控制
				mainqueue.request(curopt);
			} else {
				request(curopt);
			}
		}
	},
	/**
  * 对一组请求进行单独的队列控制依次请求。全部请求完毕后进行通知。
  * 此情况下，通过ioargs设置的参数配置customconfig:{queue:true|false}无效。强制都走队列
 	 * @param {Array} *argsarr 接口请求数组
 	 * [{
 	 *    {JSON} *ioargs 接口扩展参数。对应ioconfig.js里的ioargs配置格式
 	 *    {JSON} *iocall 接口扩展参数。对应ioconfig.js里的iocall配置格式
 	 * }]
 	 * @param {JSON} customobj 用户自定义扩展参数
 	 * {
 	 * 	  {Function} complete 接口全部请求完毕后的通知回调
 	 * }
  */
	transQueueRequest: function transQueueRequest(argsarr, customobj) {
		if ($.isArray(argsarr) && argsarr.length > 0) {
			var queueobj = queueControl.get(); //获取一个空闲的queueHandle
			queueobj.complete = function () {
				queueControl.end(queueobj); //通知当前queue对象使用完毕
				if (customobj && typeof customobj.complete == 'function') {
					customobj.complete();
				}
			};
			for (var i = 0, len = argsarr.length; i < len; i++) {
				var ioargs = argsarr[i].ioargs || {};
				var iocall = argsarr[i].iocall || {};
				if (ioargs && iocall && ioargs.url != '') {
					ioargs = $.extend(true, ioargs, { customconfig: { queue: true } });
					var curopt = format(ioargs, iocall, queueobj);
					queueobj.request(curopt);
				}
			}
		}
	}
};

},{"./ioconfig.js":4,"./storage.js":5}],4:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * @fileoverview io接口请求相关数据配置
 * @version 1.0 | 2015-06-28 版本信息
 * @author Zhang Mingrui | 592044573@qq.com
 * @return 更多详细信息参考代码里对应定义方法或属性位置的注释说明
 * 	login {JSON} 对于接口返回未登陆错误进行统一处理配置
 *  ioargs {JSON} io请求接口默认参数
 *  setTrans {Function} 设置接口配置
 *  getTrans {Function} 获取接口配置
 *  globalSetup {Function} 设置全局ajax配置
 * @example
 * 		const IoConfig = require('libio-ioconfig');
 *
	 	 //统一处理未登录
		 IoConfig.login.filter = function(result){
		 	return result.code == 'A0002';
		 };
		 IoConfig.login.url = 'http://baidu.com/';

		 //所有接口的io业务错误统一处理
		 IoConfig.fail.filter = function(result) {
		 	return result.code != 'A0001';
		 };
		 IoConfig.iocall.fail = function(result){
		 	alert(result.errmsg || '网络错误');
		 };

		 IoConfig.ioargs.crossDomain = true;
 * */

//var iocache = {}; //接口的配置项缓存。格式为{intername；ioargs里面的参数配置项json格式}
var that = {};
/**
 * 对于接口返回未登陆错误进行统一处理 配置。
 */
that.login = {
  url: '', //未登情况下跳转的页面
  key: 'go', //跳转到url指定页面传递当前页面地址的键值名称
  deal: function deal(data) {}, //有的情况下，不是跳转登录url，而且弹登录弹层。则此时将url设置为''，将登陆弹层弹出处理写在此方法中
  filter: function filter(data) {
    return false;
  } //如果此函数返回true则跳转url指定的页面。data是接口返回的数据
};
/**
 * 对于接口返回的业务错误进行统一处理 配置。
 * 如code == 'A0001' 算成功，其他都算失败
 */
that.fail = {
  funname: 'fail', //当发生业务错误的时候，调用的格式同于ioargs里的函数的函数名。默认是error
  filter: function filter(data) {
    return false;
  } //如果此函数返回true则说明当前接口返回业务错误信息。data是接口返回的数据
  /**
   * 如果接受业务错误信息统一处理，则可以按照以下方式填写：
   * reqiurejs(['libio/ioconfig'],function($ioconfig){
   *     $ioconfig.error = {
   *         funname: 'fail',
   *         filter: function(data){if(data && data.errcode != 0){return true;}}
   *     };
   *     $ioconfig.ioargs.fail = function(data){ alert(data.errmsg || '网络错误'); }
   * });
   */
};
that.ioargs = { //io请求默认的参数格式
  //同ajax参数官方说明项
  url: '',
  method: 'GET',
  contentType: 'application/x-www-form-urlencoded',
  dealdata: function dealdata(result) {
    return result.data;
  }, //当业务处理成功时，返回统一处理的数据
  //自定义数据
  customconfig: {
    mode: 'ajax', //使用什么方式请求，默认是ajax(ajax方式默认返回的是json格式的数据。也可通过在和method参数同级的位置设置dataType参数来改变默认的json设置)。可用的参数有ajax|jsonp|script
    deallogin: true, //是否统一处理未登陆错误
    dealfail: true, //是否统一处理业务错误
    dealdata: true, //当业务处理成功时，是否统一处理返回的数据。注意：只有当dealerror为true时，dealdata为true才有效。否则不会调用dealdata方法
    queue: false, //接口请求是否进行队列控制，即当前请求完成后才可以进行下一个请求
    storage: null, //libio/storage对象，控制io请求数据缓存
    clearall: false, //请求接口时，是否清除所有缓存
    getInter: function getInter(interobj) {} //获取接口请求实例对象。如interobj为$.ajax()返回的对象
  }
};
/**
 * 如果data是从本地缓存中读取的数据，那么success和fail方法中的参数：
 * 		textStatus和jqXHR分别是 'success', null
 * @type {Object}
 */
that.iocall = { //io请求回调
  complete: function complete() {}, //参数为 data|jqXHR, textStatus, jqXHR|errorThrown
  success: function success(data, textStatus, jqXHR) {},
  error: function error(jqXHR, textStatus, errorThrown) {
    alert(textStatus || '网络错误');
  },
  fail: function fail(data, textStatus, jqXHR) {} //当业务处理错误时，返回统一处理业务错误
};
/**
 * 每个请求发送之前，统一格式化参数配置（格式同ioargs）。
 * 应用场景： 每个业务项目需要配置统一的参数处理。
 */
that.format = function (opt) {};
/**
 * 设置全局的接口请求配置
 * @param {Object} setting
 */
that.globalSetup = function (setting) {
  if ((typeof setting === 'undefined' ? 'undefined' : _typeof(setting)) == 'object') {
    $.ajaxSetup(setting);
  }
};

module.exports = that;

},{}],5:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3Rvb2wvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInB1YmxpY1xcamF2YXNjcmlwdHNcXHBhZ2VcXGlvXFxtb2RlbC5qcyIsInB1YmxpY1xcamF2YXNjcmlwdHNcXHBhZ2VcXGlvXFxzdG9yYWdlLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFxpb1xcaW50ZXJpby5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcaW9cXGlvY29uZmlnLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFxpb1xcc3RvcmFnZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7O0FBS0EsSUFBTSxXQUFXLFFBQVEsZ0JBQVIsQ0FBakI7QUFBQSxJQUNNLFVBQVUsUUFBUSxlQUFSLENBRGhCO0FBQUEsSUFFTSxVQUFVLFFBQVEsV0FBUixDQUZoQjtBQUdDOzs7QUFHQSxTQUFTLEtBQVQsQ0FBZSxNQUFmLEdBQXdCLFVBQVMsTUFBVCxFQUFnQjtBQUNwQyxXQUFPLE9BQU8sSUFBUCxJQUFlLE9BQXRCO0FBQ0gsQ0FGRDtBQUdBLFNBQVMsS0FBVCxDQUFlLEdBQWYsR0FBcUIsbUJBQXJCOztBQUdBOzs7QUFHQSxTQUFTLElBQVQsQ0FBYyxNQUFkLEdBQXVCLFVBQVMsTUFBVCxFQUFpQjtBQUNwQyxXQUFPLE9BQU8sSUFBUCxJQUFlLE9BQXRCO0FBQ0gsQ0FGRDtBQUdBLFNBQVMsTUFBVCxDQUFnQixJQUFoQixHQUF1QixVQUFTLE1BQVQsRUFBZ0I7QUFDbkMsU0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixPQUFPLE1BQVAsSUFBaUIsTUFBakM7QUFDSCxDQUZEO0FBR0EsU0FBUyxNQUFULENBQWdCLEtBQWhCLEdBQXdCLFVBQVMsS0FBVCxFQUFnQixVQUFoQixFQUE0QixXQUE1QixFQUF3QztBQUM1RCxTQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLGNBQWMsTUFBOUI7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Q0FBWSxHQUFaLENBQVA7QUFDSCxDQUZEOztBQUlBLE9BQU8sT0FBUCxHQUFpQixPQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcclxuICog5pS+5Yiw6Ieq5bex6aG555uu5Lit77yM57uf5LiA5a6a5LmJ55qEaW/lpITnkIblsYJcclxuICpcclxuICog5L2/55SoanF1ZXJ55o+Q5L6b55qEYWpheOaWueazleWSjOacrOi6q+WwgeijheeahGlv5Lia5Yqh5bGC5a6e546wXHJcbiAqL1xyXG5jb25zdCBJb0NvbmZpZyA9IHJlcXVpcmUoJ2xpYmlvLWlvY29uZmlnJyksXHJcbiAgICAgIEludGVyaW8gPSByZXF1aXJlKCdsaWJpby1pbnRlcmlvJyksXHJcbiAgICAgIFN0b3JhZ2UgPSByZXF1aXJlKCcuL3N0b3JhZ2UnKTtcclxuIC8qKlxyXG4gICog57uf5LiA5aSE55CG5pyq55m75b2VXHJcbiAgKi9cclxuIElvQ29uZmlnLmxvZ2luLmZpbHRlciA9IGZ1bmN0aW9uKHJlc3VsdCl7XHJcbiAgICAgcmV0dXJuIHJlc3VsdC5jb2RlID09ICdBMDAwMic7XHJcbiB9O1xyXG4gSW9Db25maWcubG9naW4udXJsID0gJ2h0dHA6Ly9iYWlkdS5jb20vJztcclxuXHJcblxyXG4gLyoqXHJcbiAgKiDmiYDmnInmjqXlj6PnmoRpb+S4muWKoemUmeivr+e7n+S4gOWkhOeQhlxyXG4gICovXHJcbiBJb0NvbmZpZy5mYWlsLmZpbHRlciA9IGZ1bmN0aW9uKHJlc3VsdCkge1xyXG4gICAgIHJldHVybiByZXN1bHQuY29kZSAhPSAnQTAwMDEnO1xyXG4gfTtcclxuIElvQ29uZmlnLmlvY2FsbC5mYWlsID0gZnVuY3Rpb24ocmVzdWx0KXtcclxuICAgICBfQVBQLlRvYXN0LnNob3cocmVzdWx0LmVycm1zZyB8fCAn572R57uc6ZSZ6K+vJyk7XHJcbiB9O1xyXG4gSW9Db25maWcuaW9jYWxsLmVycm9yID0gZnVuY3Rpb24oanFYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKXtcclxuICAgICBfQVBQLlRvYXN0LnNob3codGV4dFN0YXR1cyB8fCAn572R57uc6ZSZ6K+vJyk7XHJcbiB9O1xyXG5cclxuIElvQ29uZmlnLmlvYXJncy5iZWZvcmVTZW5kID0gZnVuY3Rpb24oKXtcclxuICAgIC8vICBfQVBQLkxvYWRpbmcuc2hvdygpO1xyXG4gICAgY29uc29sZS5sb2coJ+ivt+axguW8gOWniycpO1xyXG4gfTtcclxuIElvQ29uZmlnLmlvY2FsbC5jb21wbGV0ZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAvLyAgX0FQUC5Mb2FkaW5nLmhpZGUoKTtcclxuICAgIGNvbnNvbGUubG9nKCfor7fmsYLnu5PmnZ8nKTtcclxuIH1cclxuXHJcbiAvL+aUr+aMgei3qOi2ilxyXG4gSW9Db25maWcuaW9hcmdzLmNyb3NzRG9tYWluID0gdHJ1ZTtcclxuIC8qKlxyXG4gICog5pWw5o2u5o6l5Y+j6YWN572uXHJcbiAgKi9cclxuIHZhciBiYXNlaG9zdCA9ICdodHRwOi8vMTI3LjAuMC4xOjgwMDAnO1xyXG5cclxuIC8qKlxyXG4gICogdXJs5qC85byP5YyWXHJcbiAgKiBAZXhhbXBsZSBidWlsZFVybCgnL3Jlci97c2V4fS9mZXdyL3tpZH0nLHtzZXg6J2FhJyxpZDonMTEnfSlcclxuICAqICAgICAgICAgIOi/lOWbnu+8mi9yZXIvYWEvZmV3ci8xMVxyXG4gICovXHJcbiBmdW5jdGlvbiBidWlsZFVybCh1cmwsZGF0YSxpc2VuY29kZSl7XHJcbiAgICAgdmFyIHJlZyA9IC9cXHsoW2EtekEtQV0rKVxcfS9nO1xyXG4gICAgIHJldHVybiB1cmwucmVwbGFjZShyZWcsIGZ1bmN0aW9uIChhbGwsIGtleSkge1xyXG4gICAgICAgICByZXR1cm4gaXNlbmNvZGU/IGVuY29kZVVSSUNvbXBvbmVudChkYXRhW2tleV0pOiBkYXRhW2tleV07XHJcbiAgICAgfSk7XHJcbiB9XHJcbiAvKipcclxuICAqIOivt+axguaVsOaNruWxgm1vZGVsXHJcbiAgKiBAcGFyYW0ge09iamVjdH0gaW9hcmdzIOS8oOWFpeeahOWPguaVsOWQjCRpb2NvbmZpZy5pb2FyZ3PmoLzlvI/kuIDoh7TvvIzkuIDoiKzmmK/vvJpcclxuICAgICAgKiB7XHJcbiAgICAgICogXHQgICBkYXRhOiB7fVxyXG4gICAgICAqIH1cclxuICAgIEBwYXJhbSB7SlNPTn0gKmlvY2FsbCDkvKDlhaXnmoTlj4LmlbDlkIwkaW9jb25maWcuaW9jYWxs5qC85byP5LiA6Ie077yM5LiA6Iis5piv77yaXHJcbiAgICAqIHtcclxuICAgICogICAgIHN1Y2Nlc3NcclxuICAgICogICAgIGNvbXBsZXRlXHJcbiAgICAqICAgICAvL+S7peS4i+W3sue7j+aciee7n+S4gOWkhOeQhu+8jOWmguaenOaDs+imhuebluWImeiHquihjOS8oOWFpVxyXG4gICAgKiAgICAgZXJyb3JcclxuICAgICogICAgIGZhaWxcclxuICAgICogfVxyXG4gICAgQHBhcmFtIHtPYmplY3R9IHVybERhdGEg6ZKI5a+5dXJs6YeM6Z2i5pyJe+abv+aNouWPguaVsOWQjX3nmoTmg4XlhrXvvIzkvKDlhaXnmoTplK7lgLzlr7nlupTmlbDmja5cclxuICAqL1xyXG4gbW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICAgLyoqXHJcbiAgICAgICog6I635Y+W6aG555uu5paH5Lu255uu5b2V57uT5p6EXHJcbiAgICAgICogdXJsRGF0YToge1xyXG4gICAgICAqICAgICBpZFxyXG4gICAgICAqIH1cclxuICAgICAgKi9cclxuICAgICBtYWluOiBmdW5jdGlvbihpb2FyZ3MsaW9jYWxsLHVybERhdGEpe1xyXG4gICAgICAgICB2YXIgX3VybCA9IGJ1aWxkVXJsKGJhc2Vob3N0KycvdHJhY2VyL21haW4vdHJhY2Uve2lkfScsdXJsRGF0YSx0cnVlKTtcclxuICAgICAgICAgSW50ZXJpby50cmFuc1JlcXVlc3QoJC5leHRlbmQoe1xyXG4gICAgICAgICAgICAgdXJsOiBfdXJsLFxyXG4gICAgICAgICAgICAgbWV0aG9kOidHRVQnXHJcbiAgICAgICAgIH0saW9hcmdzKSxpb2NhbGwpO1xyXG4gICAgIH0sXHJcbiAgICAgLyoqXHJcbiAgICAgICog5YiX6KGo5pWw5o2uXHJcbiAgICAgICovXHJcbiAgICAgbGlzdGRhdGE6IGZ1bmN0aW9uKGlvYXJncyxpb2NhbGwpe1xyXG4gICAgICAgICBJbnRlcmlvLnRyYW5zUmVxdWVzdCgkLmV4dGVuZCh7XHJcbiAgICAgICAgICAgICB1cmw6IGJhc2Vob3N0KycvbGlzdGRhdGEnLFxyXG4gICAgICAgICAgICAgbWV0aG9kOidQT1NUJyxcclxuICAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgICog5aaC5p6c5oOz5a+55o6l5Y+j55qE5pWw5o2u6L+b6KGM57yT5a2Y77yM5YiZ6L+b6KGM5Lul5LiL6YWN572uXHJcbiAgICAgICAgICAgICAgKlxyXG4gICAgICAgICAgICAgICog5pWw5o2u57yT5a2Y77yM5pqC5LiN5Yy65YiG5o6l5Y+j6K+35rGC5Y+C5pWwXHJcbiAgICAgICAgICAgICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICBjdXN0b21jb25maWc6IHtcclxuICAgICAgICAgICAgICAgICBzdG9yYWdlOiBTdG9yYWdlLmxpc3RkYXRhIC8v6YWN572u57yT5a2Y5a+56LGh77yM5b+F5aGrXHJcbiAgICAgICAgICAgICAgICAgLy/lpoLmnpzor7fmsYLor6XmjqXlj6PliY3vvIzopoHmuIXmpZrmiYDmnInmnKzlnLDnvJPlrZjvvIzliJnmt7vliqDmraTphY3nva5cclxuICAgICAgICAgICAgICAgICAvL+Wmgu+8muW9k+WJjeaOpeWPo+aYr+eUqOaIt+eZu+W9lS/pgIDlh7rmjqXlj6PvvIzliJnmuIXpmaTmiYDmnInmlY/mhJ/mlbDmja5cclxuICAgICAgICAgICAgICAgICAvLyBjbGVhcmFsbDogdHJ1ZVxyXG4gICAgICAgICAgICAgfVxyXG4gICAgICAgICB9LGlvYXJncyksaW9jYWxsKTtcclxuICAgICB9LFxyXG5cclxuICAgICAvL+eZu+W9leaOpeWPo1xyXG4gICAgIGxvZ2luOiBmdW5jdGlvbihpb2FyZ3MsIGlvY2FsbCl7XHJcbiAgICAgICAgIEludGVyaW8udHJhbnNSZXF1ZXN0KCQuZXh0ZW5kKHtcclxuICAgICAgICAgICAgIHVybDogJy91c2Vycy9sb2dpbicsXHJcbiAgICAgICAgICAgICBtZXRob2Q6J1BPU1QnXHJcbiAgICAgICAgIH0saW9hcmdzKSxpb2NhbGwpO1xyXG4gICAgIH0sXHJcblxyXG4gICAgIC8v5Li65LqG5rWL6K+V77yM5LiA6Iis5LiN6KaBXHJcbiAgICAgJGludGVyaW86IEludGVyaW8sXHJcbiAgICAgYmFzZWhvc3Q6IGJhc2Vob3N0XHJcbiB9O1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyDmlL7liLDoh6rlt7HnmoTpobnnm67kuK3vvIznu5/kuIDnmoTmnKzlnLDlrZjlgqjphY3nva5cclxuICogQHZlcnNpb24gMS4wIHwgMjAxNy0wNS0yNCDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAZXhhbXBsZVxyXG4gKiAqL1xyXG5cclxuY29uc3QgU3RvcmFnZSA9IHJlcXVpcmUoJ2xpYmlvLXN0b3JhZ2UnKTtcclxuXHJcbiAvKipcclxuICAqIOacrOWcsOWtmOWCqOWvueixoeaJgOWxnue7hO+8jOWRveWQjeWPr+iHquihjOS/ruaUueOAgum7mOiupOaYr1pNUkRMQlxyXG4gICogQHR5cGUge1N0cmluZ31cclxuICAqL1xyXG4gLy8gU3RvcmFnZS5ncm91cG5hbWUgPSAnbXlwcm9qZWN0bmFtZSc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgICBsaXN0ZGF0YTogU3RvcmFnZS5jcmVhdGUoe1xyXG4gICAgICAgICBtYXhhZ2U6ICcxRCcsIC8v5L+d5a2YMeWkqVxyXG4gICAgICAgICBrZXk6ICdsaXN0ZGF0YSdcclxuICAgICB9KSxcclxuICAgICBsaXN0ZGF0YXR3bzogU3RvcmFnZS5jcmVhdGUoe1xyXG4gICAgICAgICBtYXhhZ2U6ICcwLjFIJywgLy/kv53lrZgwLjHlsI/ml7ZcclxuICAgICAgICAga2V5OiAnbGlzdGRhdGF0d28nXHJcbiAgICAgfSlcclxufTtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcgaW/mjqXlj6Por7fmsYLmjqfliLblmajvvIzlnKgkLmFqYXjkuIrov5vooYzov5vkuIDmraXlsIHoo4VcclxuICogICAgICAxLiDmlK/mjIHmjqXlj6PpmJ/liJfor7fmsYJcclxuICogICAgICAyLiDmlK/mjIHmjqXlj6PmlbDmja7nvJPlrZhcclxuICogICAgICAzLiDmlK/mjIHmjqXlj6Pnu5/kuIDkuJrliqHplJnor6/lj4rlhbbku5bmg4XlhrXlpITnkIZcclxuICogQHZlcnNpb24gMS4wIHwgMjAxNS0wNi0yOCDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAcmV0dXJuIOabtOWkmuivpue7huS/oeaBr+WPguiAg+S7o+eggemHjOWvueW6lOWumuS5ieaWueazleaIluWxnuaAp+S9jee9rueahOazqOmHiuivtOaYjlxyXG4gKiBcdHRyYW5zUmVxdWVzdCB7RnVuY3Rpb259IOaJp+ihjOaOpeWPo+aOpeWPo+ivt+axglxyXG4gKiAgdHJhbnNRdWV1ZVJlcXVlc3Qge0Z1bmN0aW9ufSDlr7nkuIDnu4Tor7fmsYLov5vooYzljZXni6znmoTpmJ/liJfmjqfliLbkvp3mrKHor7fmsYLjgILlhajpg6jor7fmsYLlrozmr5XlkI7ov5vooYzpgJrnn6XjgIJcclxuICogQGV4YW1wbGVcclxuICogICB2YXIgYmFzZWhvc3QgPSAnaHR0cDovLzEyNy4wLjAuMTo4MDAwJztcclxuICpcclxuICogXHQgY29uc3QgSW50ZXJJbyA9IHJlcXVpcmUoJ2xpYmlvLWludGVyaW8nKTtcclxuICpcclxuICogXHQgSW50ZXJJby50cmFuc1JlcXVlc3Qoe1xyXG5cdFx0IHVybDogYmFzZWhvc3QrJy9saXN0ZGF0YScsXHJcblx0XHQgbWV0aG9kOidQT1NUJyxcclxuXHRcdCBkYXRhOiB7J25hbWUnOiAnem1yZGxiJ31cclxuXHQgfSx7XHJcblx0XHQgc3VjY2VzczogZnVuY3Rpb24oZGF0YSl7XHJcblx0XHRcdCBjb25zb2xlLmxvZyhkYXRhKTtcclxuXHRcdCB9XHJcblx0XHQgLy8gZmFpbDogZnVuY3Rpb24oKXtcclxuXHRcdCAvLyAgICAgY29uc29sZS5sb2coJ+imhueblue7n+S4gGZhaWzlpITnkIYnKTtcclxuXHRcdCAvLyB9LFxyXG5cdFx0IC8vIGVycm9yOiBmdW5jdGlvbigpe1xyXG5cdFx0IC8vICAgICBjb25zb2xlLmxvZygn6KaG55uW57uf5LiAZXJyb3LlpITnkIYnKTtcclxuXHRcdCAvLyB9LFxyXG5cdFx0IC8vIGNvbXBsZXRlOiBmdW5jdGlvbigpe1xyXG5cdFx0IC8vICAgICBjb25zb2xlLmxvZygn5a6M5oiQJyk7XHJcblx0XHQgLy8gfVxyXG5cdCB9KTtcclxuICogKi9cclxuXHJcbmNvbnN0IElvQ29uZmlnID0gcmVxdWlyZSgnLi9pb2NvbmZpZy5qcycpLFxyXG5cdFx0U3RvcmFnZSA9IHJlcXVpcmUoJy4vc3RvcmFnZS5qcycpO1xyXG5cclxuLy/or7fmsYLpmJ/liJfmjqfliLbnsbtcclxuZnVuY3Rpb24gcXVldWVIYW5kbGUoKXtcclxuXHR0aGlzLnF1ZXVlID0gW107IC8v5b2T5YmN6Zif5YiX5pWw5o2uXHJcblx0dGhpcy5pbnByb2Nlc3MgPSBmYWxzZTsgLy/lvZPliY3pmJ/liJfmjqXlj6PmmK/lkKbmraPlnKjlpITnkIZcclxuXHR0aGlzLmNvbXBsZXRlID0gZnVuY3Rpb24oKXt9OyAvL+mYn+WIl+ivt+axguWujOaIkOWQjueahOWbnuiwg1xyXG59O1xyXG4vL+aJp+ihjOmYn+WIl+aVsOaNruivt+axglxyXG5xdWV1ZUhhbmRsZS5wcm90b3R5cGUuYWR2YW5jZSA9IGZ1bmN0aW9uKCl7XHJcblx0aWYodGhpcy5xdWV1ZS5sZW5ndGggPT0gMCl7XHJcblx0XHR0aGlzLmlucHJvY2VzcyA9IGZhbHNlO1xyXG5cdFx0aWYodHlwZW9mIHRoaXMuY29tcGxldGUgPT0gJ2Z1bmN0aW9uJyl7XHJcblx0XHRcdHRoaXMuY29tcGxldGUoKTtcclxuXHRcdH1cclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0dmFyIHJlcSA9IHRoaXMucXVldWUuc2hpZnQoKTtcclxuXHR0aGlzLnJlcXVlc3QocmVxLHRydWUpO1xyXG59O1xyXG4vKipcclxuKiDmt7vliqDmjqXlj6Por7fmsYLlpITnkIZcclxuKiBAcGFyYW0ge0pTT059ICpvcHQgZm9ybWF05ZCO55qE5o6l5Y+j5Y+C5pWwXHJcbiogQHBhcmFtIHtCb29sZWFufSBhZHZhbmNlIOaYr+WQpuaYr3F1ZXVlSGFuZGVyLmFkdmFuY2XosIPnlKhcclxuKi9cclxucXVldWVIYW5kbGUucHJvdG90eXBlLnJlcXVlc3QgPSBmdW5jdGlvbihvcHQsYWR2YW5jZSl7XHJcblx0aWYodGhpcy5pbnByb2Nlc3MgJiYgIWFkdmFuY2Upe1xyXG5cdFx0dGhpcy5xdWV1ZS5wdXNoKG9wdCk7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cdHRoaXMuaW5wcm9jZXNzID0gdHJ1ZTtcclxuXHRyZXF1ZXN0KG9wdCk7XHJcbn07XHJcbi8qKlxyXG4gKiBxdWV1ZUhhbmRsZeWvueixoeaOp+WItuWZqFxyXG4gKi9cclxudmFyIHF1ZXVlQ29udHJvbCA9IHtcclxuXHRfcXVldWVvYmpzOiBbXSwgLy9xdWV1ZUhhbmRsZeWvueixoeWIl+ihqFxyXG5cdGdldDogZnVuY3Rpb24oKXsgLy/ov5Tlm57lvZPliY3nqbrpl7LnmoRxdWV1ZUhhbmRsZeWvueixoVxyXG5cdFx0dmFyIGN1cnF1ZXVlID0gbnVsbDtcclxuXHRcdHZhciBxdWV1ZW9ianMgPSB0aGlzLl9xdWV1ZW9ianM7XHJcblx0XHRmb3IodmFyIGkgPSAwLCBsZW4gPSBxdWV1ZW9ianMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xyXG5cdFx0XHRpZihxdWV1ZW9ianNbaV0uaW5wcm9jZXNzID09IGZhbHNlICYmIHF1ZXVlb2Jqc1tpXS5sb2NrID09IGZhbHNlKXsgLy/ml6Lml6Dor7fmsYLlj4jmsqHmnInooqvplIHlrppcclxuXHRcdFx0XHRxdWV1ZW9ianNbaV0ubG9jayA9IHRydWU7XHJcblx0XHRcdFx0Y3VycXVldWUgPSBxdWV1ZW9ianNbaV07XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGlmKGN1cnF1ZXVlID09IG51bGwpe1xyXG5cdFx0XHRjdXJxdWV1ZSA9IG5ldyBxdWV1ZUhhbmRsZSgpO1xyXG5cdFx0XHRjdXJxdWV1ZS5sb2NrID0gdHJ1ZTtcclxuXHRcdFx0dGhpcy5fcXVldWVvYmpzLnB1c2goY3VycXVldWUpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGN1cnF1ZXVlO1xyXG5cdH0sXHJcblx0ZW5kOiBmdW5jdGlvbihxdWV1ZSl7IC8v6YCa55+l5b2T5YmNcXVldWVIYW5kbGXlr7nosaHlt7Lnu4/kvb/nlKjlrozmr5VcclxuXHRcdHZhciBxdWV1ZW9ianMgPSB0aGlzLl9xdWV1ZW9ianM7XHJcblx0XHRmb3IodmFyIGkgPSAwLCBsZW4gPSBxdWV1ZW9ianMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xyXG5cdFx0XHRpZihxdWV1ZW9ianNbaV0gPT0gcXVldWUpeyAvL+aXouaXoOivt+axguWPiOayoeacieiiq+mUgeWumlxyXG5cdFx0XHRcdHF1ZXVlb2Jqc1tpXS5sb2NrID0gZmFsc2U7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcbn07XHJcbi8qKlxyXG4gKiDmoLzlvI/ljJZpb+aOpeWPo+ivt+axguWPguaVsFxyXG4gKiBAcGFyYW0ge0pTT059ICppb29wdCDmlbDmja7mjqXlj6Plj4LmlbBcclxuICogcGFyYW0ge0pTT059ICppb2NhbGwgaW/or7fmsYLlm57osINcclxuICogQHBhcmFtIHtxdWV1ZUhhbmRsZX0gKnF1ZXVlb2JqIOmYn+WIl+aOp+WItuWZqOWvueixoVxyXG4gKi9cclxuZnVuY3Rpb24gZm9ybWF0KGlvYXJncyxpb2NhbGwscXVldWVvYmope1xyXG5cdHZhciBfaW9hcmdzID0ge30sIF9pb2NhbGwgPSB7fTtcclxuXHQkLmV4dGVuZCh0cnVlLF9pb2FyZ3MsSW9Db25maWcuaW9hcmdzLGlvYXJncyk7XHJcblx0JC5leHRlbmQodHJ1ZSxfaW9jYWxsLElvQ29uZmlnLmlvY2FsbCxpb2NhbGwpO1xyXG5cdElvQ29uZmlnLmZvcm1hdChfaW9hcmdzKTtcclxuXHR2YXIgb2xkc3VjY2VzcyA9IF9pb2NhbGwuc3VjY2VzcztcclxuXHR2YXIgb2xkY29tcGxldGUgPSBfaW9jYWxsLmNvbXBsZXRlO1xyXG5cdHZhciBkZWFsbG9naW4gPSBfaW9hcmdzLmN1c3RvbWNvbmZpZy5kZWFsbG9naW47XHJcblx0dmFyIGRlYWxmYWlsID0gX2lvYXJncy5jdXN0b21jb25maWcuZGVhbGZhaWw7XHJcblx0dmFyIGRlYWxkYXRhID0gX2lvYXJncy5jdXN0b21jb25maWcuZGVhbGRhdGE7XHJcblx0X2lvY2FsbC5zdWNjZXNzID0gZnVuY3Rpb24oZGF0YSwgdGV4dFN0YXR1cywganFYSFIpeyAvL+mHjeWGmXN1Y2Nlc3Pmlrnms5XvvIznlKjmnaXlpITnkIbmnKrnmbvpmYbpl67pophcclxuXHRcdGlmKGRlYWxsb2dpbiAmJiB0eXBlb2YgSW9Db25maWcubG9naW4uZmlsdGVyID09ICdmdW5jdGlvbicpeyAvL+ebkea1i+aYr+WQpuacieacqueZu+mZhumUmeivr+WkhOeQhlxyXG5cdFx0XHRpZihJb0NvbmZpZy5sb2dpbi5maWx0ZXIoZGF0YSkpeyAvL+acqueZu+W9lVxyXG5cdFx0XHQgICAgaWYoSW9Db25maWcubG9naW4udXJsICE9ICcnKXsgLy/ot7Povax1cmxcclxuXHRcdFx0ICAgICAgICB2YXIgbG9naW51cmwgPSBJb0NvbmZpZy5sb2dpbi51cmw7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlYXJjaCA9IElvQ29uZmlnLmxvZ2luLmtleSsnPScrZW5jb2RlVVJJQ29tcG9uZW50KGxvY2F0aW9uLmhyZWYpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKGxvZ2ludXJsLmxhc3RJbmRleE9mKCc/JykgIT0gLTEpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dpbnVybCA9IGxvZ2ludXJsLnJlcGxhY2UoL1xcPy8sJz8nK3NlYXJjaCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2ludXJsID0gbG9naW51cmwrJz8nK3NlYXJjaDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9IGxvZ2ludXJsO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHRcdFx0ICAgIH1lbHNlIGlmKHR5cGVvZiBJb0NvbmZpZy5sb2dpbi5kZWFsID09ICdmdW5jdGlvbicpe1xyXG5cdFx0XHQgICAgICAgIElvQ29uZmlnLmxvZ2luLmRlYWwoZGF0YSk7XHJcblx0XHRcdCAgICAgICAgcmV0dXJuO1xyXG5cdFx0XHQgICAgfVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRpZihkZWFsZmFpbCAmJiB0eXBlb2YgSW9Db25maWcuZmFpbC5maWx0ZXIgPT0gJ2Z1bmN0aW9uJyl7IC8v5qOA5rWL5piv5ZCm5pyJ5Lia5Yqh6ZSZ6K+v5aSE55CGXHJcblx0XHQgICAgaWYoSW9Db25maWcuZmFpbC5maWx0ZXIoZGF0YSkpeyAvL+S4muWKoemUmeivr1xyXG5cdFx0ICAgICAgICBpZih0eXBlb2YgX2lvY2FsbFtJb0NvbmZpZy5mYWlsLmZ1bm5hbWVdID09ICdmdW5jdGlvbicpe1xyXG5cdFx0ICAgICAgICAgICAgX2lvY2FsbFtJb0NvbmZpZy5mYWlsLmZ1bm5hbWVdKGRhdGEsIHRleHRTdGF0dXMsIGpxWEhSKTtcclxuXHRcdCAgICAgICAgfVxyXG5cdFx0ICAgIH1lbHNleyAvL+S4muWKoeaIkOWKn1xyXG5cdFx0ICAgICAgICBpZihkZWFsZGF0YSl7IC8v57uf5LiA5aSE55CG5Lia5Yqh5oiQ5Yqf5pWw5o2uXHJcblx0XHQgICAgICAgICAgICB0eXBlb2Ygb2xkc3VjY2VzcyA9PSAnZnVuY3Rpb24nICYmIG9sZHN1Y2Nlc3MoX2lvYXJncy5kZWFsZGF0YShkYXRhLCB0ZXh0U3RhdHVzLCBqcVhIUiksIHRleHRTdGF0dXMsIGpxWEhSKTtcclxuXHRcdCAgICAgICAgfWVsc2V7XHJcblx0XHQgICAgICAgICAgICB0eXBlb2Ygb2xkc3VjY2VzcyA9PSAnZnVuY3Rpb24nICYmIG9sZHN1Y2Nlc3MoZGF0YSwgdGV4dFN0YXR1cywganFYSFIpO1xyXG5cdFx0ICAgICAgICB9XHJcblx0XHQgICAgfVxyXG5cdFx0fWVsc2V7XHJcblx0XHQgICAgdHlwZW9mIG9sZHN1Y2Nlc3MgPT0gJ2Z1bmN0aW9uJyAmJiBvbGRzdWNjZXNzKGRhdGEsIHRleHRTdGF0dXMsIGpxWEhSKTtcclxuXHRcdH1cclxuXHR9O1xyXG5cdGlmKF9pb2FyZ3MuY3VzdG9tY29uZmlnLnF1ZXVlKXsgLy/or7TmmI7mjqXlj6PlkIzmhI/ov5vooYzpmJ/liJfmjqfliLZcclxuXHRcdF9pb2NhbGwuY29tcGxldGUgPSBmdW5jdGlvbigpeyAvL+mHjeWGmeaOpeWPo+ivt+axguWujOaIkOS6i+S7tlxyXG5cdFx0XHRxdWV1ZW9iai5hZHZhbmNlKCk7XHJcblx0XHRcdHR5cGVvZiBvbGRjb21wbGV0ZSA9PSAnZnVuY3Rpb24nICYmIG9sZGNvbXBsZXRlLmFwcGx5KHRoaXMsQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XHJcblx0XHR9O1xyXG5cdH1cclxuXHRyZXR1cm4ge1xyXG5cdFx0aW9hcmdzOiBfaW9hcmdzLFxyXG5cdFx0aW9jYWxsOiBfaW9jYWxsXHJcblx0fTtcclxufVxyXG5mdW5jdGlvbiBkb2FqYXgoaW9hcmdzLGlvY2FsbCl7XHJcblx0dmFyIGludGVyb2JqID0gbnVsbCxcclxuXHRcdGdldEludGVyID0gaW9hcmdzLmN1c3RvbWNvbmZpZy5nZXRJbnRlcixcclxuXHRcdHN0b3JhZ2UgPSBpb2FyZ3MuY3VzdG9tY29uZmlnLnN0b3JhZ2U7XHJcblx0ZGVsZXRlIGlvYXJncy5jdXN0b21jb25maWc7XHJcblxyXG5cdGludGVyb2JqID0gJC5hamF4KGlvYXJncykuZG9uZShpb2NhbGwuc3VjY2VzcykuZmFpbChpb2NhbGwuZXJyb3IpLmFsd2F5cyhpb2NhbGwuY29tcGxldGUpLmRvbmUoZnVuY3Rpb24oZGF0YSl7XHJcblx0XHRpZihzdG9yYWdlICYmIHN0b3JhZ2UgaW5zdGFuY2VvZiBTdG9yYWdlKXtcclxuXHRcdFx0c3RvcmFnZS5zZXQoZGF0YSk7XHJcblx0XHR9XHJcblx0fSk7XHJcblx0aWYoaW50ZXJvYmogJiYgdHlwZW9mIGdldEludGVyID09ICdmdW5jdGlvbicpe1xyXG5cdFx0Z2V0SW50ZXIoaW50ZXJvYmopO1xyXG5cdH1cclxufVxyXG4vKipcclxuICog5aSE55CG5o6l5Y+j6K+35rGCXHJcbiAqIEBwYXJhbSB7SlNPTn0gaW9vcHQgZm9ybWF05ZCO55qE5o6l5Y+j5Y+C5pWwXHJcbiAqL1xyXG5mdW5jdGlvbiByZXF1ZXN0KGlvb3B0KXtcclxuXHR2YXIgX2lvYXJncyA9IGlvb3B0LmlvYXJncyxcclxuXHRcdF9pb2NhbGwgPSBpb29wdC5pb2NhbGwsXHJcblx0XHRtb2RlID0gX2lvYXJncy5jdXN0b21jb25maWcubW9kZSxcclxuXHRcdGNsZWFyYWxsID0gX2lvYXJncy5jdXN0b21jb25maWcuY2xlYXJhbGwsXHJcblx0XHRzdG9yYWdlID0gX2lvYXJncy5jdXN0b21jb25maWcuc3RvcmFnZSxcclxuXHRcdGNhY2hlZGF0YSA9IG51bGw7XHJcblxyXG5cdC8v5riF6Zmk5omA5pyJ57yT5a2YXHJcblx0aWYoY2xlYXJhbGwpe1xyXG5cdFx0U3RvcmFnZS5jbGVhcigpO1xyXG5cdH1cclxuXHJcblx0Ly/mmK/lkKbmnInnvJPlrZhcclxuXHRpZihzdG9yYWdlICYmIHN0b3JhZ2UgaW5zdGFuY2VvZiBTdG9yYWdlICYmICgoY2FjaGVkYXRhID0gc3RvcmFnZS5nZXQoKSkgIT0gbnVsbCkpe1xyXG5cdFx0X2lvY2FsbC5zdWNjZXNzKGNhY2hlZGF0YSwgJ3N1Y2Nlc3MnLCBudWxsKTtcclxuXHRcdF9pb2NhbGwuY29tcGxldGUoKTtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblxyXG5cdGlmKG1vZGUgPT0gJ2FqYXgnKXtcclxuXHRcdGlmKF9pb2FyZ3MuZGF0YVR5cGUgPT0gdW5kZWZpbmVkIHx8IF9pb2FyZ3MuZGF0YVR5cGUgPT0gJycpe1xyXG5cdFx0XHRfaW9hcmdzLmRhdGFUeXBlID0gJ2pzb24nO1xyXG5cdFx0fVxyXG5cdFx0ZG9hamF4KF9pb2FyZ3MsX2lvY2FsbCk7XHJcblx0fWVsc2UgaWYobW9kZSA9PSAnanNvbnAnKXtcclxuXHRcdF9pb2FyZ3MuZGF0YVR5cGUgPSAnanNvbnAnO1xyXG5cdFx0X2lvYXJncy5jcm9zc0RvbWFpbiA9IHRydWU7XHJcblx0XHRkb2FqYXgoX2lvYXJncyxfaW9jYWxsKTtcclxuXHR9ZWxzZSBpZihtb2RlID09ICdzY3JpcHQnKXtcclxuXHRcdF9pb2FyZ3MuZGF0YVR5cGUgPSAnc2NyaXB0JztcclxuXHRcdF9pb2FyZ3MuY3Jvc3NEb21haW4gPSB0cnVlO1xyXG5cdFx0ZG9hamF4KF9pb2FyZ3MsX2lvY2FsbCk7XHJcblx0fVxyXG59XHJcbnZhciBtYWlucXVldWUgPSBuZXcgcXVldWVIYW5kbGUoKTsgLy/kuLvnur/nqIvpmJ/liJfmjqfliLblr7nosaFcclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0LyoqXHJcblx0ICog5omn6KGM5o6l5Y+j6K+35rGCXHJcbiAgICAgKiBAcGFyYW0ge0pTT059ICppb2FyZ3Mg5o6l5Y+j5omp5bGV5Y+C5pWw44CC5a+55bqUaW9jb25maWcuanPph4znmoRpb2FyZ3PphY3nva7moLzlvI9cclxuICAgICAqIEBwYXJhbSB7SlNPTn0gKmlvY2FsbCDmjqXlj6PmianlsZXlj4LmlbDjgILlr7nlupRpb2NvbmZpZy5qc+mHjOeahGlvY2FsbOmFjee9ruagvOW8j1xyXG5cdCAqL1xyXG5cdHRyYW5zUmVxdWVzdDogZnVuY3Rpb24oaW9hcmdzLGlvY2FsbCl7XHJcblx0XHRpZihpb2FyZ3MgJiYgaW9jYWxsICYmIGlvYXJncy51cmwgIT0gJycpe1xyXG5cdFx0XHR2YXIgY3Vyb3B0ID0gZm9ybWF0KGlvYXJncyxpb2NhbGwsbWFpbnF1ZXVlKTtcclxuXHRcdFx0aWYoY3Vyb3B0LmlvYXJncy5jdXN0b21jb25maWcucXVldWUpeyAvL+ivtOaYjumBteW+qumYn+WIl+aOp+WItlxyXG5cdFx0XHRcdG1haW5xdWV1ZS5yZXF1ZXN0KGN1cm9wdCk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZXtcclxuXHRcdFx0XHRyZXF1ZXN0KGN1cm9wdCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9LFxyXG5cdC8qKlxyXG5cdCAqIOWvueS4gOe7hOivt+axgui/m+ihjOWNleeLrOeahOmYn+WIl+aOp+WItuS+neasoeivt+axguOAguWFqOmDqOivt+axguWujOavleWQjui/m+ihjOmAmuefpeOAglxyXG5cdCAqIOatpOaDheWGteS4i++8jOmAmui/h2lvYXJnc+iuvue9rueahOWPguaVsOmFjee9rmN1c3RvbWNvbmZpZzp7cXVldWU6dHJ1ZXxmYWxzZX3ml6DmlYjjgILlvLrliLbpg73otbDpmJ/liJdcclxuXHRcdCAqIEBwYXJhbSB7QXJyYXl9ICphcmdzYXJyIOaOpeWPo+ivt+axguaVsOe7hFxyXG5cdFx0ICogW3tcclxuXHRcdCAqICAgIHtKU09OfSAqaW9hcmdzIOaOpeWPo+aJqeWxleWPguaVsOOAguWvueW6lGlvY29uZmlnLmpz6YeM55qEaW9hcmdz6YWN572u5qC85byPXHJcblx0XHQgKiAgICB7SlNPTn0gKmlvY2FsbCDmjqXlj6PmianlsZXlj4LmlbDjgILlr7nlupRpb2NvbmZpZy5qc+mHjOeahGlvY2FsbOmFjee9ruagvOW8j1xyXG5cdFx0ICogfV1cclxuXHRcdCAqIEBwYXJhbSB7SlNPTn0gY3VzdG9tb2JqIOeUqOaIt+iHquWumuS5ieaJqeWxleWPguaVsFxyXG5cdFx0ICoge1xyXG5cdFx0ICogXHQgIHtGdW5jdGlvbn0gY29tcGxldGUg5o6l5Y+j5YWo6YOo6K+35rGC5a6M5q+V5ZCO55qE6YCa55+l5Zue6LCDXHJcblx0XHQgKiB9XHJcblx0ICovXHJcblx0dHJhbnNRdWV1ZVJlcXVlc3Q6IGZ1bmN0aW9uKGFyZ3NhcnIsY3VzdG9tb2JqKXtcclxuXHRcdGlmKCQuaXNBcnJheShhcmdzYXJyKSAmJiBhcmdzYXJyLmxlbmd0aCA+IDApe1xyXG5cdFx0XHR2YXIgcXVldWVvYmogPSBxdWV1ZUNvbnRyb2wuZ2V0KCk7IC8v6I635Y+W5LiA5Liq56m66Zey55qEcXVldWVIYW5kbGVcclxuXHRcdFx0cXVldWVvYmouY29tcGxldGUgPSBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdHF1ZXVlQ29udHJvbC5lbmQocXVldWVvYmopOyAvL+mAmuefpeW9k+WJjXF1ZXVl5a+56LGh5L2/55So5a6M5q+VXHJcblx0XHRcdFx0aWYoY3VzdG9tb2JqICYmIHR5cGVvZiBjdXN0b21vYmouY29tcGxldGUgPT0gJ2Z1bmN0aW9uJyl7XHJcblx0XHRcdFx0XHRjdXN0b21vYmouY29tcGxldGUoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH07XHJcblx0XHRcdGZvcih2YXIgaSA9IDAsIGxlbiA9IGFyZ3NhcnIubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xyXG5cdFx0XHRcdHZhciBpb2FyZ3MgPSBhcmdzYXJyW2ldLmlvYXJncyB8fCB7fTtcclxuXHRcdFx0XHR2YXIgaW9jYWxsID0gYXJnc2FycltpXS5pb2NhbGwgfHwge307XHJcblx0XHRcdFx0aWYoaW9hcmdzICYmIGlvY2FsbCAmJiBpb2FyZ3MudXJsICE9ICcnKXtcclxuXHRcdFx0XHRcdGlvYXJncyA9ICQuZXh0ZW5kKHRydWUsaW9hcmdzLHtjdXN0b21jb25maWc6e3F1ZXVlOnRydWV9fSk7XHJcblx0XHRcdFx0XHR2YXIgY3Vyb3B0ID0gZm9ybWF0KGlvYXJncyxpb2NhbGwscXVldWVvYmopO1xyXG5cdFx0XHRcdFx0cXVldWVvYmoucmVxdWVzdChjdXJvcHQpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcgaW/mjqXlj6Por7fmsYLnm7jlhbPmlbDmja7phY3nva5cclxuICogQHZlcnNpb24gMS4wIHwgMjAxNS0wNi0yOCDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAcmV0dXJuIOabtOWkmuivpue7huS/oeaBr+WPguiAg+S7o+eggemHjOWvueW6lOWumuS5ieaWueazleaIluWxnuaAp+S9jee9rueahOazqOmHiuivtOaYjlxyXG4gKiBcdGxvZ2luIHtKU09OfSDlr7nkuo7mjqXlj6Pov5Tlm57mnKrnmbvpmYbplJnor6/ov5vooYznu5/kuIDlpITnkIbphY3nva5cclxuICogIGlvYXJncyB7SlNPTn0gaW/or7fmsYLmjqXlj6Ppu5jorqTlj4LmlbBcclxuICogIHNldFRyYW5zIHtGdW5jdGlvbn0g6K6+572u5o6l5Y+j6YWN572uXHJcbiAqICBnZXRUcmFucyB7RnVuY3Rpb259IOiOt+WPluaOpeWPo+mFjee9rlxyXG4gKiAgZ2xvYmFsU2V0dXAge0Z1bmN0aW9ufSDorr7nva7lhajlsYBhamF46YWN572uXHJcbiAqIEBleGFtcGxlXHJcbiAqIFx0XHRjb25zdCBJb0NvbmZpZyA9IHJlcXVpcmUoJ2xpYmlvLWlvY29uZmlnJyk7XHJcbiAqXHJcblx0IFx0IC8v57uf5LiA5aSE55CG5pyq55m75b2VXHJcblx0XHQgSW9Db25maWcubG9naW4uZmlsdGVyID0gZnVuY3Rpb24ocmVzdWx0KXtcclxuXHRcdCBcdHJldHVybiByZXN1bHQuY29kZSA9PSAnQTAwMDInO1xyXG5cdFx0IH07XHJcblx0XHQgSW9Db25maWcubG9naW4udXJsID0gJ2h0dHA6Ly9iYWlkdS5jb20vJztcclxuXHJcblx0XHQgLy/miYDmnInmjqXlj6PnmoRpb+S4muWKoemUmeivr+e7n+S4gOWkhOeQhlxyXG5cdFx0IElvQ29uZmlnLmZhaWwuZmlsdGVyID0gZnVuY3Rpb24ocmVzdWx0KSB7XHJcblx0XHQgXHRyZXR1cm4gcmVzdWx0LmNvZGUgIT0gJ0EwMDAxJztcclxuXHRcdCB9O1xyXG5cdFx0IElvQ29uZmlnLmlvY2FsbC5mYWlsID0gZnVuY3Rpb24ocmVzdWx0KXtcclxuXHRcdCBcdGFsZXJ0KHJlc3VsdC5lcnJtc2cgfHwgJ+e9kee7nOmUmeivrycpO1xyXG5cdFx0IH07XHJcblxyXG5cdFx0IElvQ29uZmlnLmlvYXJncy5jcm9zc0RvbWFpbiA9IHRydWU7XHJcbiAqICovXHJcblxyXG4vL3ZhciBpb2NhY2hlID0ge307IC8v5o6l5Y+j55qE6YWN572u6aG557yT5a2Y44CC5qC85byP5Li6e2ludGVybmFtZe+8m2lvYXJnc+mHjOmdoueahOWPguaVsOmFjee9rumhuWpzb27moLzlvI99XHJcbnZhciB0aGF0ID0ge307XHJcbi8qKlxyXG4gKiDlr7nkuo7mjqXlj6Pov5Tlm57mnKrnmbvpmYbplJnor6/ov5vooYznu5/kuIDlpITnkIYg6YWN572u44CCXHJcbiAqL1xyXG50aGF0LmxvZ2luID0ge1xyXG5cdHVybDogJycsIC8v5pyq55m75oOF5Ya15LiL6Lez6L2s55qE6aG16Z2iXHJcblx0a2V5OiAnZ28nLCAvL+i3s+i9rOWIsHVybOaMh+WumumhtemdouS8oOmAkuW9k+WJjemhtemdouWcsOWdgOeahOmUruWAvOWQjeensFxyXG5cdGRlYWw6IGZ1bmN0aW9uKGRhdGEpe30sIC8v5pyJ55qE5oOF5Ya15LiL77yM5LiN5piv6Lez6L2s55m75b2VdXJs77yM6ICM5LiU5by555m75b2V5by55bGC44CC5YiZ5q2k5pe25bCGdXJs6K6+572u5Li6JyfvvIzlsIbnmbvpmYblvLnlsYLlvLnlh7rlpITnkIblhpnlnKjmraTmlrnms5XkuK1cclxuXHRmaWx0ZXI6IGZ1bmN0aW9uKGRhdGEpe3JldHVybiBmYWxzZTt9IC8v5aaC5p6c5q2k5Ye95pWw6L+U5ZuedHJ1ZeWImei3s+i9rHVybOaMh+WumueahOmhtemdouOAgmRhdGHmmK/mjqXlj6Pov5Tlm57nmoTmlbDmja5cclxufTtcclxuLyoqXHJcbiAqIOWvueS6juaOpeWPo+i/lOWbnueahOS4muWKoemUmeivr+i/m+ihjOe7n+S4gOWkhOeQhiDphY3nva7jgIJcclxuICog5aaCY29kZSA9PSAnQTAwMDEnIOeul+aIkOWKn++8jOWFtuS7lumDveeul+Wksei0pVxyXG4gKi9cclxudGhhdC5mYWlsID0ge1xyXG4gICAgZnVubmFtZTogJ2ZhaWwnLCAvL+W9k+WPkeeUn+S4muWKoemUmeivr+eahOaXtuWAme+8jOiwg+eUqOeahOagvOW8j+WQjOS6jmlvYXJnc+mHjOeahOWHveaVsOeahOWHveaVsOWQjeOAgum7mOiupOaYr2Vycm9yXHJcbiAgICBmaWx0ZXI6IGZ1bmN0aW9uKGRhdGEpe3JldHVybiBmYWxzZTt9IC8v5aaC5p6c5q2k5Ye95pWw6L+U5ZuedHJ1ZeWImeivtOaYjuW9k+WJjeaOpeWPo+i/lOWbnuS4muWKoemUmeivr+S/oeaBr+OAgmRhdGHmmK/mjqXlj6Pov5Tlm57nmoTmlbDmja5cclxuICAgIC8qKlxyXG4gICAgICog5aaC5p6c5o6l5Y+X5Lia5Yqh6ZSZ6K+v5L+h5oGv57uf5LiA5aSE55CG77yM5YiZ5Y+v5Lul5oyJ54Wn5Lul5LiL5pa55byP5aGr5YaZ77yaXHJcbiAgICAgKiByZXFpdXJlanMoWydsaWJpby9pb2NvbmZpZyddLGZ1bmN0aW9uKCRpb2NvbmZpZyl7XHJcbiAgICAgKiAgICAgJGlvY29uZmlnLmVycm9yID0ge1xyXG4gICAgICogICAgICAgICBmdW5uYW1lOiAnZmFpbCcsXHJcbiAgICAgKiAgICAgICAgIGZpbHRlcjogZnVuY3Rpb24oZGF0YSl7aWYoZGF0YSAmJiBkYXRhLmVycmNvZGUgIT0gMCl7cmV0dXJuIHRydWU7fX1cclxuICAgICAqICAgICB9O1xyXG4gICAgICogICAgICRpb2NvbmZpZy5pb2FyZ3MuZmFpbCA9IGZ1bmN0aW9uKGRhdGEpeyBhbGVydChkYXRhLmVycm1zZyB8fCAn572R57uc6ZSZ6K+vJyk7IH1cclxuICAgICAqIH0pO1xyXG4gICAgICovXHJcbn07XHJcbnRoYXQuaW9hcmdzID0geyAvL2lv6K+35rGC6buY6K6k55qE5Y+C5pWw5qC85byPXHJcblx0Ly/lkIxhamF45Y+C5pWw5a6Y5pa56K+05piO6aG5XHJcblx0dXJsOiAnJyxcclxuXHRtZXRob2Q6ICdHRVQnLFxyXG5cdGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcclxuXHRkZWFsZGF0YTogZnVuY3Rpb24ocmVzdWx0KXtyZXR1cm4gcmVzdWx0LmRhdGE7fSwgLy/lvZPkuJrliqHlpITnkIbmiJDlip/ml7bvvIzov5Tlm57nu5/kuIDlpITnkIbnmoTmlbDmja5cclxuXHQvL+iHquWumuS5ieaVsOaNrlxyXG5cdGN1c3RvbWNvbmZpZzp7XHJcblx0XHRtb2RlOiAnYWpheCcsIC8v5L2/55So5LuA5LmI5pa55byP6K+35rGC77yM6buY6K6k5pivYWpheChhamF45pa55byP6buY6K6k6L+U5Zue55qE5pivanNvbuagvOW8j+eahOaVsOaNruOAguS5n+WPr+mAmui/h+WcqOWSjG1ldGhvZOWPguaVsOWQjOe6p+eahOS9jee9ruiuvue9rmRhdGFUeXBl5Y+C5pWw5p2l5pS55Y+Y6buY6K6k55qEanNvbuiuvue9rinjgILlj6/nlKjnmoTlj4LmlbDmnIlhamF4fGpzb25wfHNjcmlwdFxyXG5cdCAgICBkZWFsbG9naW46IHRydWUsIC8v5piv5ZCm57uf5LiA5aSE55CG5pyq55m76ZmG6ZSZ6K+vXHJcblx0ICAgIGRlYWxmYWlsOiB0cnVlLCAvL+aYr+WQpue7n+S4gOWkhOeQhuS4muWKoemUmeivr1xyXG5cdCAgICBkZWFsZGF0YTogdHJ1ZSwgLy/lvZPkuJrliqHlpITnkIbmiJDlip/ml7bvvIzmmK/lkKbnu5/kuIDlpITnkIbov5Tlm57nmoTmlbDmja7jgILms6jmhI/vvJrlj6rmnInlvZNkZWFsZXJyb3LkuLp0cnVl5pe277yMZGVhbGRhdGHkuLp0cnVl5omN5pyJ5pWI44CC5ZCm5YiZ5LiN5Lya6LCD55SoZGVhbGRhdGHmlrnms5VcclxuXHQgICAgcXVldWU6IGZhbHNlLCAvL+aOpeWPo+ivt+axguaYr+WQpui/m+ihjOmYn+WIl+aOp+WItu+8jOWNs+W9k+WJjeivt+axguWujOaIkOWQjuaJjeWPr+S7pei/m+ihjOS4i+S4gOS4quivt+axglxyXG5cdFx0c3RvcmFnZTogbnVsbCwgLy9saWJpby9zdG9yYWdl5a+56LGh77yM5o6n5Yi2aW/or7fmsYLmlbDmja7nvJPlrZhcclxuXHRcdGNsZWFyYWxsOiBmYWxzZSwgLy/or7fmsYLmjqXlj6Pml7bvvIzmmK/lkKbmuIXpmaTmiYDmnInnvJPlrZhcclxuXHQgICAgZ2V0SW50ZXI6IGZ1bmN0aW9uKGludGVyb2JqKXt9IC8v6I635Y+W5o6l5Y+j6K+35rGC5a6e5L6L5a+56LGh44CC5aaCaW50ZXJvYmrkuLokLmFqYXgoKei/lOWbnueahOWvueixoVxyXG5cdH1cclxufTtcclxuLyoqXHJcbiAqIOWmguaenGRhdGHmmK/ku47mnKzlnLDnvJPlrZjkuK3or7vlj5bnmoTmlbDmja7vvIzpgqPkuYhzdWNjZXNz5ZKMZmFpbOaWueazleS4reeahOWPguaVsO+8mlxyXG4gKiBcdFx0dGV4dFN0YXR1c+WSjGpxWEhS5YiG5Yir5pivICdzdWNjZXNzJywgbnVsbFxyXG4gKiBAdHlwZSB7T2JqZWN0fVxyXG4gKi9cclxudGhhdC5pb2NhbGwgPSB7IC8vaW/or7fmsYLlm57osINcclxuXHRjb21wbGV0ZTogZnVuY3Rpb24oKXt9LCAvL+WPguaVsOS4uiBkYXRhfGpxWEhSLCB0ZXh0U3RhdHVzLCBqcVhIUnxlcnJvclRocm93blxyXG5cdHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEsIHRleHRTdGF0dXMsIGpxWEhSKXt9LFxyXG5cdGVycm9yOiBmdW5jdGlvbihqcVhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pe2FsZXJ0KCB0ZXh0U3RhdHVzIHx8ICfnvZHnu5zplJnor68nKTsgfSxcclxuXHRmYWlsOiBmdW5jdGlvbihkYXRhLCB0ZXh0U3RhdHVzLCBqcVhIUil7fSAvL+W9k+S4muWKoeWkhOeQhumUmeivr+aXtu+8jOi/lOWbnue7n+S4gOWkhOeQhuS4muWKoemUmeivr1xyXG59O1xyXG4vKipcclxuICog5q+P5Liq6K+35rGC5Y+R6YCB5LmL5YmN77yM57uf5LiA5qC85byP5YyW5Y+C5pWw6YWN572u77yI5qC85byP5ZCMaW9hcmdz77yJ44CCXHJcbiAqIOW6lOeUqOWcuuaZr++8miDmr4/kuKrkuJrliqHpobnnm67pnIDopoHphY3nva7nu5/kuIDnmoTlj4LmlbDlpITnkIbjgIJcclxuICovXHJcbnRoYXQuZm9ybWF0ID0gZnVuY3Rpb24ob3B0KXt9O1xyXG4vKipcclxuICog6K6+572u5YWo5bGA55qE5o6l5Y+j6K+35rGC6YWN572uXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBzZXR0aW5nXHJcbiAqL1xyXG50aGF0Lmdsb2JhbFNldHVwID0gZnVuY3Rpb24oc2V0dGluZyl7XHJcblx0aWYodHlwZW9mIHNldHRpbmcgPT0gJ29iamVjdCcpe1xyXG5cdFx0JC5hamF4U2V0dXAoc2V0dGluZyk7XHJcblx0fVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB0aGF0O1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyDkvb/nlKhsb2NhbFN0b3JhZ2Xov5vooYzmlbDmja7lrZjlgqhcclxuICogQHZlcnNpb24gMS4wIHwgMjAxNy0wNC0xMyDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAcmV0dXJuXHJcbiAqICovXHJcblxyXG4vKipcclxuICog5pWw5o2u5a2Y5YKo57G7XHJcbiAqIEBwYXJhbSB7W3R5cGVdfSBvcHQgW2Rlc2NyaXB0aW9uXVxyXG4gKi9cclxuZnVuY3Rpb24gU3RvcmFnZShvcHQpe1xyXG4gICAgb3B0ID0gJC5leHRlbmQoe1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOWtmOWCqOWRqOacn++8jOm7mOiupOS4ujHlpKnjgILlkI7nvIDor7TmmI5cclxuICAgICAgICAgKiBNOiDmnIhcclxuICAgICAgICAgKiBEOiDml6VcclxuICAgICAgICAgKiBIOiDlsI/ml7ZcclxuICAgICAgICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAgICAgICAqIEBleGFtcGxlIDEuNUQgMC41SCAzTSAxNUQwLjJIXHJcbiAgICAgICAgICog54m55Yir6K+05piO77ya5Y+q5pSv5oyBMeS9jeWwj+aVsFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG1heGFnZTogJzFEJyxcclxuICAgICAgICBrZXk6ICcnIC8vKiDplK7lgLxcclxuICAgIH0sb3B0KTtcclxuXHJcbiAgICBpZihvcHQua2V5ID09ICcnIHx8IG9wdC5tYXhhZ2UgPT0gJycpe1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbGliaW8vc3RvcmFnZSDlj4LmlbDkvKDlhaXplJnor68nKTtcclxuICAgIH1lbHNlIGlmKCEvXigoXFxkKykoXFwuKFsxLTldezF9KSk/KFtNREhdKSkrJC8udGVzdChvcHQubWF4YWdlKSl7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdsaWJpby9zdG9yYWdlIG1heGFnZemFjee9ruagvOW8j+S4jeato+ehricpO1xyXG4gICAgfVxyXG5cclxuICAgIG9wdC5rZXkgPSBTdG9yYWdlLmdyb3VwbmFtZSArICdfJyArIG9wdC5rZXk7XHJcblxyXG4gICAgdGhpcy5vcHQgPSBvcHQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDorqHnrpfov4fmnJ/ml7bpl7TngrlcclxuICogQHJldHVybiB7U3RyaW5nfSBEYXRlVGltZei/h+acn+aXtumXtOeCueWtl+espuS4slxyXG4gKi9cclxuU3RvcmFnZS5wcm90b3R5cGUuX2dldE91dERhdGVUaW1lID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBtYXhhZ2UgPSB0aGlzLm9wdC5tYXhhZ2UsXHJcbiAgICAgICAgbm93dGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpLFxyXG4gICAgICAgIGRpZmZob3VyID0gMCxcclxuICAgICAgICByZWcgPSAvKFxcZCspKFxcLihbMS05XXsxfSkpPyhbTURIXSkvZyxcclxuICAgICAgICByZWFyciA9IG51bGw7XHJcblxyXG4gICAgd2hpbGUoKHJlYXJyID0gcmVnLmV4ZWMobWF4YWdlKSkgIT0gbnVsbCl7XHJcbiAgICAgICAgdmFyIG51bSA9IHJlYXJyWzFdLCAvL+aVtOaVsOmDqOWIhlxyXG4gICAgICAgICAgICBzdWZmaXggPSByZWFycls0XTtcclxuICAgICAgICBpZihyZWFyclsyXSl7IC8v6K+05piO5a2Y5Zyo5bCP5pWwXHJcbiAgICAgICAgICAgIG51bSArPSByZWFyclsyXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbnVtID0gTnVtYmVyKG51bSk7XHJcbiAgICAgICAgc3dpdGNoIChzdWZmaXgpIHtcclxuICAgICAgICAgICAgY2FzZSAnTSc6XHJcbiAgICAgICAgICAgICAgICBkaWZmaG91ciArPSBudW0qMzAqMjQ7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnRCc6XHJcbiAgICAgICAgICAgICAgICBkaWZmaG91ciArPSBudW0qMjQ7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnSCc6XHJcbiAgICAgICAgICAgICAgICBkaWZmaG91ciArPSBudW07XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBub3d0aW1lICs9IGRpZmZob3VyKjYwKjYwKjEwMDA7XHJcblxyXG4gICAgcmV0dXJuIG5vd3RpbWU7XHJcbn07XHJcblxyXG4vKipcclxuICog5pWw5o2u6K6+572uXHJcbiAqIEBwYXJhbSB7SlNPTn0gZGF0YSDlvoXlrZjlgqjnmoTmlbDmja5cclxuICog5a6e6ZmF5a2Y5YKo55qE5pWw5o2u5qC85byP5aaC5LiL77yaXHJcbiAqXHJcbiAqICB7XHJcbiAqICAgICAgZW5kVGltZToge1N0cmluZ31cclxuICogICAgICBkYXRhOiBkYXRhXHJcbiAqICB9XHJcbiAqL1xyXG5TdG9yYWdlLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihkYXRhKXtcclxuICAgIGlmKCFkYXRhIHx8IE9iamVjdC5rZXlzKGRhdGEpLmxlbmd0aCA9PSAwKXtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5vcHQua2V5LCBKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgICAgZW5kVGltZTogdGhpcy5fZ2V0T3V0RGF0ZVRpbWUoKSxcclxuICAgICAgICBkYXRhOiBkYXRhXHJcbiAgICB9KSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDojrflj5bmlbDmja5cclxuICogQHJldHVybiB7SlNPTnxOdWxsfSDov5Tlm55zZXTml7blgJnnmoRkYXRh44CC5aaC5p6c6L+H5pyf5YiZ6L+U5ZuebnVsbFxyXG4gKi9cclxuU3RvcmFnZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oKXtcclxuICAgIC8v5Yik5pat5piv5ZCm6L+H5pyfXHJcbiAgICB2YXIgdmFsdWUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLm9wdC5rZXkpO1xyXG4gICAgaWYodmFsdWUgPT0gbnVsbCl7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9ZWxzZXtcclxuICAgICAgICB2YWx1ZSA9IEpTT04ucGFyc2UodmFsdWUpO1xyXG4gICAgICAgIGlmKE51bWJlcih2YWx1ZS5lbmRUaW1lKSA8PSBuZXcgRGF0ZSgpLmdldFRpbWUoKSl7IC8v6L+H5pyfXHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUuZGF0YTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDliKDpmaTmraTpobnmlbDmja5cclxuICogQHJldHVybiB7W3R5cGVdfSBbZGVzY3JpcHRpb25dXHJcbiAqL1xyXG5TdG9yYWdlLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbigpe1xyXG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0odGhpcy5vcHQua2V5KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOaVsOaNruWCqOWtmOaJgOWxnue7hOWQjeensFxyXG4gKiBAdHlwZSB7U3RyaW5nfVxyXG4gKi9cclxuU3RvcmFnZS5ncm91cG5hbWUgPSAnWk1SRExCJztcclxuXHJcbi8qKlxyXG4gKiDliKDpmaTlhajpg6jlnKjnu4RTdG9yYWdlLmdyb3VwbmFtZeS4i+eahOe8k+WtmOaVsOaNrlxyXG4gKiBAcmV0dXJuIHtbdHlwZV19IFtkZXNjcmlwdGlvbl1cclxuICovXHJcblN0b3JhZ2UuY2xlYXIgPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIHJlZyA9IG5ldyBSZWdFeHAoJ14nK1N0b3JhZ2UuZ3JvdXBuYW1lKTtcclxuICAgIHdoaWxlKGxvY2FsU3RvcmFnZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgdmFyIGtleSA9IGxvY2FsU3RvcmFnZS5rZXkoMCk7XHJcbiAgICAgICAgaWYocmVnLnRlc3Qoa2V5KSl7XHJcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGtleSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICog5Yib5bu65LiA5LiqU3RvcmFnZeWvueixoVxyXG4gKiBAcGFyYW0gIHtKU09OfSBvcHQg6K+m6KeBU3RvcmFnZeWumuS5ieWkhFxyXG4gKiBAcmV0dXJuIHtTdG9yYWdlfSAgICAgW2Rlc2NyaXB0aW9uXVxyXG4gKi9cclxuU3RvcmFnZS5jcmVhdGUgPSBmdW5jdGlvbihvcHQpe1xyXG4gICAgcmV0dXJuIG5ldyBTdG9yYWdlKG9wdCk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU3RvcmFnZTtcclxuIl19
