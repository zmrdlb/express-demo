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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3Rvb2wvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInB1YmxpY1xcamF2YXNjcmlwdHNcXHBhZ2VcXGlvXFxtb2RlbC5qcyIsInB1YmxpY1xcamF2YXNjcmlwdHNcXHBhZ2VcXGlvXFxzdG9yYWdlLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFxpb1xcaW50ZXJpby5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcaW9cXGlvY29uZmlnLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFxpb1xcc3RvcmFnZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7O0FBS0EsSUFBTSxXQUFXLFFBQVEsZ0JBQVIsQ0FBakI7QUFBQSxJQUNNLFVBQVUsUUFBUSxlQUFSLENBRGhCO0FBQUEsSUFFTSxVQUFVLFFBQVEsV0FBUixDQUZoQjs7QUFJQzs7O0FBR0EsU0FBUyxLQUFULENBQWUsTUFBZixHQUF3QixVQUFTLE1BQVQsRUFBZ0I7QUFDcEMsV0FBTyxPQUFPLElBQVAsSUFBZSxPQUF0QjtBQUNILENBRkQ7QUFHQSxTQUFTLEtBQVQsQ0FBZSxHQUFmLEdBQXFCLG1CQUFyQjs7QUFHQTs7O0FBR0EsU0FBUyxJQUFULENBQWMsTUFBZCxHQUF1QixVQUFTLE1BQVQsRUFBaUI7QUFDcEMsV0FBTyxPQUFPLElBQVAsSUFBZSxPQUF0QjtBQUNILENBRkQ7QUFHQSxTQUFTLE1BQVQsQ0FBZ0IsSUFBaEIsR0FBdUIsVUFBUyxNQUFULEVBQWdCO0FBQ25DLFNBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsT0FBTyxNQUFQLElBQWlCLE1BQWpDO0FBQ0gsQ0FGRDtBQUdBLFNBQVMsTUFBVCxDQUFnQixLQUFoQixHQUF3QixVQUFTLEtBQVQsRUFBZ0IsVUFBaEIsRUFBNEIsV0FBNUIsRUFBd0M7QUFDNUQsU0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixjQUFjLE1BQTlC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LENBQVksR0FBWixDQUFQO0FBQ0gsQ0FGRDs7QUFJQSxPQUFPLE9BQVAsR0FBaUIsT0FBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXHJcbiAqIOaUvuWIsOiHquW3semhueebruS4re+8jOe7n+S4gOWumuS5ieeahGlv5aSE55CG5bGCXHJcbiAqXHJcbiAqIOS9v+eUqGpxdWVyeeaPkOS+m+eahGFqYXjmlrnms5XlkozmnKzouqvlsIHoo4XnmoRpb+S4muWKoeWxguWunueOsFxyXG4gKi9cclxuY29uc3QgSW9Db25maWcgPSByZXF1aXJlKCdsaWJpby1pb2NvbmZpZycpLFxyXG4gICAgICBJbnRlcmlvID0gcmVxdWlyZSgnbGliaW8taW50ZXJpbycpLFxyXG4gICAgICBTdG9yYWdlID0gcmVxdWlyZSgnLi9zdG9yYWdlJyk7XHJcblxyXG4gLyoqXHJcbiAgKiDnu5/kuIDlpITnkIbmnKrnmbvlvZVcclxuICAqL1xyXG4gSW9Db25maWcubG9naW4uZmlsdGVyID0gZnVuY3Rpb24ocmVzdWx0KXtcclxuICAgICByZXR1cm4gcmVzdWx0LmNvZGUgPT0gJ0EwMDAyJztcclxuIH07XHJcbiBJb0NvbmZpZy5sb2dpbi51cmwgPSAnaHR0cDovL2JhaWR1LmNvbS8nO1xyXG5cclxuXHJcbiAvKipcclxuICAqIOaJgOacieaOpeWPo+eahGlv5Lia5Yqh6ZSZ6K+v57uf5LiA5aSE55CGXHJcbiAgKi9cclxuIElvQ29uZmlnLmZhaWwuZmlsdGVyID0gZnVuY3Rpb24ocmVzdWx0KSB7XHJcbiAgICAgcmV0dXJuIHJlc3VsdC5jb2RlICE9ICdBMDAwMSc7XHJcbiB9O1xyXG4gSW9Db25maWcuaW9jYWxsLmZhaWwgPSBmdW5jdGlvbihyZXN1bHQpe1xyXG4gICAgIF9BUFAuVG9hc3Quc2hvdyhyZXN1bHQuZXJybXNnIHx8ICfnvZHnu5zplJnor68nKTtcclxuIH07XHJcbiBJb0NvbmZpZy5pb2NhbGwuZXJyb3IgPSBmdW5jdGlvbihqcVhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pe1xyXG4gICAgIF9BUFAuVG9hc3Quc2hvdyh0ZXh0U3RhdHVzIHx8ICfnvZHnu5zplJnor68nKTtcclxuIH07XHJcblxyXG4gSW9Db25maWcuaW9hcmdzLmJlZm9yZVNlbmQgPSBmdW5jdGlvbigpe1xyXG4gICAgLy8gIF9BUFAuTG9hZGluZy5zaG93KCk7XHJcbiAgICBjb25zb2xlLmxvZygn6K+35rGC5byA5aeLJyk7XHJcbiB9O1xyXG4gSW9Db25maWcuaW9jYWxsLmNvbXBsZXRlID0gZnVuY3Rpb24oKXtcclxuICAgIC8vICBfQVBQLkxvYWRpbmcuaGlkZSgpO1xyXG4gICAgY29uc29sZS5sb2coJ+ivt+axgue7k+adnycpO1xyXG4gfVxyXG5cclxuIC8v5pSv5oyB6Leo6LaKXHJcbiBJb0NvbmZpZy5pb2FyZ3MuY3Jvc3NEb21haW4gPSB0cnVlO1xyXG4gLyoqXHJcbiAgKiDmlbDmja7mjqXlj6PphY3nva5cclxuICAqL1xyXG4gdmFyIGJhc2Vob3N0ID0gJ2h0dHA6Ly8xMjcuMC4wLjE6ODAwMCc7XHJcblxyXG4gLyoqXHJcbiAgKiB1cmzmoLzlvI/ljJZcclxuICAqIEBleGFtcGxlIGJ1aWxkVXJsKCcvcmVyL3tzZXh9L2Zld3Ive2lkfScse3NleDonYWEnLGlkOicxMSd9KVxyXG4gICogICAgICAgICAg6L+U5Zue77yaL3Jlci9hYS9mZXdyLzExXHJcbiAgKi9cclxuIGZ1bmN0aW9uIGJ1aWxkVXJsKHVybCxkYXRhLGlzZW5jb2RlKXtcclxuICAgICB2YXIgcmVnID0gL1xceyhbYS16QS1BXSspXFx9L2c7XHJcbiAgICAgcmV0dXJuIHVybC5yZXBsYWNlKHJlZywgZnVuY3Rpb24gKGFsbCwga2V5KSB7XHJcbiAgICAgICAgIHJldHVybiBpc2VuY29kZT8gZW5jb2RlVVJJQ29tcG9uZW50KGRhdGFba2V5XSk6IGRhdGFba2V5XTtcclxuICAgICB9KTtcclxuIH1cclxuIC8qKlxyXG4gICog6K+35rGC5pWw5o2u5bGCbW9kZWxcclxuICAqIEBwYXJhbSB7T2JqZWN0fSBpb2FyZ3Mg5Lyg5YWl55qE5Y+C5pWw5ZCMJGlvY29uZmlnLmlvYXJnc+agvOW8j+S4gOiHtO+8jOS4gOiIrOaYr++8mlxyXG4gICAgICAqIHtcclxuICAgICAgKiBcdCAgIGRhdGE6IHt9XHJcbiAgICAgICogfVxyXG4gICAgQHBhcmFtIHtKU09OfSAqaW9jYWxsIOS8oOWFpeeahOWPguaVsOWQjCRpb2NvbmZpZy5pb2NhbGzmoLzlvI/kuIDoh7TvvIzkuIDoiKzmmK/vvJpcclxuICAgICoge1xyXG4gICAgKiAgICAgc3VjY2Vzc1xyXG4gICAgKiAgICAgY29tcGxldGVcclxuICAgICogICAgIC8v5Lul5LiL5bey57uP5pyJ57uf5LiA5aSE55CG77yM5aaC5p6c5oOz6KaG55uW5YiZ6Ieq6KGM5Lyg5YWlXHJcbiAgICAqICAgICBlcnJvclxyXG4gICAgKiAgICAgZmFpbFxyXG4gICAgKiB9XHJcbiAgICBAcGFyYW0ge09iamVjdH0gdXJsRGF0YSDpkojlr7l1cmzph4zpnaLmnIl75pu/5o2i5Y+C5pWw5ZCNfeeahOaDheWGte+8jOS8oOWFpeeahOmUruWAvOWvueW6lOaVsOaNrlxyXG4gICovXHJcbiBtb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgICAvKipcclxuICAgICAgKiDojrflj5bpobnnm67mlofku7bnm67lvZXnu5PmnoRcclxuICAgICAgKiB1cmxEYXRhOiB7XHJcbiAgICAgICogICAgIGlkXHJcbiAgICAgICogfVxyXG4gICAgICAqL1xyXG4gICAgIG1haW46IGZ1bmN0aW9uKGlvYXJncyxpb2NhbGwsdXJsRGF0YSl7XHJcbiAgICAgICAgIHZhciBfdXJsID0gYnVpbGRVcmwoYmFzZWhvc3QrJy90cmFjZXIvbWFpbi90cmFjZS97aWR9Jyx1cmxEYXRhLHRydWUpO1xyXG4gICAgICAgICBJbnRlcmlvLnRyYW5zUmVxdWVzdCgkLmV4dGVuZCh7XHJcbiAgICAgICAgICAgICB1cmw6IF91cmwsXHJcbiAgICAgICAgICAgICBtZXRob2Q6J0dFVCdcclxuICAgICAgICAgfSxpb2FyZ3MpLGlvY2FsbCk7XHJcbiAgICAgfSxcclxuICAgICAvKipcclxuICAgICAgKiDliJfooajmlbDmja5cclxuICAgICAgKi9cclxuICAgICBsaXN0ZGF0YTogZnVuY3Rpb24oaW9hcmdzLGlvY2FsbCl7XHJcbiAgICAgICAgIEludGVyaW8udHJhbnNSZXF1ZXN0KCQuZXh0ZW5kKHtcclxuICAgICAgICAgICAgIHVybDogYmFzZWhvc3QrJy9saXN0ZGF0YScsXHJcbiAgICAgICAgICAgICBtZXRob2Q6J1BPU1QnLFxyXG4gICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAgKiDlpoLmnpzmg7Plr7nmjqXlj6PnmoTmlbDmja7ov5vooYznvJPlrZjvvIzliJnov5vooYzku6XkuIvphY3nva5cclxuICAgICAgICAgICAgICAqXHJcbiAgICAgICAgICAgICAgKiDmlbDmja7nvJPlrZjvvIzmmoLkuI3ljLrliIbmjqXlj6Por7fmsYLlj4LmlbBcclxuICAgICAgICAgICAgICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgIGN1c3RvbWNvbmZpZzoge1xyXG4gICAgICAgICAgICAgICAgIHN0b3JhZ2U6IFN0b3JhZ2UubGlzdGRhdGEgLy/phY3nva7nvJPlrZjlr7nosaHvvIzlv4XloatcclxuICAgICAgICAgICAgICAgICAvL+WmguaenOivt+axguivpeaOpeWPo+WJje+8jOimgea4healmuaJgOacieacrOWcsOe8k+WtmO+8jOWImea3u+WKoOatpOmFjee9rlxyXG4gICAgICAgICAgICAgICAgIC8v5aaC77ya5b2T5YmN5o6l5Y+j5piv55So5oi355m75b2VL+mAgOWHuuaOpeWPo++8jOWImea4hemZpOaJgOacieaVj+aEn+aVsOaNrlxyXG4gICAgICAgICAgICAgICAgIC8vIGNsZWFyYWxsOiB0cnVlXHJcbiAgICAgICAgICAgICB9XHJcbiAgICAgICAgIH0saW9hcmdzKSxpb2NhbGwpO1xyXG4gICAgIH0sXHJcblxyXG4gICAgIC8v55m75b2V5o6l5Y+jXHJcbiAgICAgbG9naW46IGZ1bmN0aW9uKGlvYXJncywgaW9jYWxsKXtcclxuICAgICAgICAgSW50ZXJpby50cmFuc1JlcXVlc3QoJC5leHRlbmQoe1xyXG4gICAgICAgICAgICAgdXJsOiAnL3VzZXJzL2xvZ2luJyxcclxuICAgICAgICAgICAgIG1ldGhvZDonUE9TVCdcclxuICAgICAgICAgfSxpb2FyZ3MpLGlvY2FsbCk7XHJcbiAgICAgfSxcclxuXHJcbiAgICAgLy/kuLrkuobmtYvor5XvvIzkuIDoiKzkuI3opoFcclxuICAgICAkaW50ZXJpbzogSW50ZXJpbyxcclxuICAgICBiYXNlaG9zdDogYmFzZWhvc3RcclxuIH07XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IOaUvuWIsOiHquW3seeahOmhueebruS4re+8jOe7n+S4gOeahOacrOWcsOWtmOWCqOmFjee9rlxyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE3LTA1LTI0IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEBleGFtcGxlXHJcbiAqICovXHJcblxyXG5jb25zdCBTdG9yYWdlID0gcmVxdWlyZSgnbGliaW8tc3RvcmFnZScpO1xyXG5cclxuIC8qKlxyXG4gICog5pys5Zyw5a2Y5YKo5a+56LGh5omA5bGe57uE77yM5ZG95ZCN5Y+v6Ieq6KGM5L+u5pS544CC6buY6K6k5pivWk1SRExCXHJcbiAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICovXHJcbiAvLyBTdG9yYWdlLmdyb3VwbmFtZSA9ICdteXByb2plY3RuYW1lJztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgIGxpc3RkYXRhOiBTdG9yYWdlLmNyZWF0ZSh7XHJcbiAgICAgICAgIG1heGFnZTogJzFEJywgLy/kv53lrZgx5aSpXHJcbiAgICAgICAgIGtleTogJ2xpc3RkYXRhJ1xyXG4gICAgIH0pLFxyXG4gICAgIGxpc3RkYXRhdHdvOiBTdG9yYWdlLmNyZWF0ZSh7XHJcbiAgICAgICAgIG1heGFnZTogJzAuMUgnLCAvL+S/neWtmDAuMeWwj+aXtlxyXG4gICAgICAgICBrZXk6ICdsaXN0ZGF0YXR3bydcclxuICAgICB9KVxyXG59O1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyBpb+aOpeWPo+ivt+axguaOp+WItuWZqO+8jOWcqCQuYWpheOS4iui/m+ihjOi/m+S4gOatpeWwgeijhVxyXG4gKiAgICAgIDEuIOaUr+aMgeaOpeWPo+mYn+WIl+ivt+axglxyXG4gKiAgICAgIDIuIOaUr+aMgeaOpeWPo+aVsOaNrue8k+WtmFxyXG4gKiAgICAgIDMuIOaUr+aMgeaOpeWPo+e7n+S4gOS4muWKoemUmeivr+WPiuWFtuS7luaDheWGteWkhOeQhlxyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE1LTA2LTI4IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm4g5pu05aSa6K+m57uG5L+h5oGv5Y+C6ICD5Luj56CB6YeM5a+55bqU5a6a5LmJ5pa55rOV5oiW5bGe5oCn5L2N572u55qE5rOo6YeK6K+05piOXHJcbiAqIFx0dHJhbnNSZXF1ZXN0IHtGdW5jdGlvbn0g5omn6KGM5o6l5Y+j5o6l5Y+j6K+35rGCXHJcbiAqICB0cmFuc1F1ZXVlUmVxdWVzdCB7RnVuY3Rpb259IOWvueS4gOe7hOivt+axgui/m+ihjOWNleeLrOeahOmYn+WIl+aOp+WItuS+neasoeivt+axguOAguWFqOmDqOivt+axguWujOavleWQjui/m+ihjOmAmuefpeOAglxyXG4gKiBAZXhhbXBsZVxyXG4gKiAgIHZhciBiYXNlaG9zdCA9ICdodHRwOi8vMTI3LjAuMC4xOjgwMDAnO1xyXG4gKlxyXG4gKiBcdCBjb25zdCBJbnRlcklvID0gcmVxdWlyZSgnbGliaW8taW50ZXJpbycpO1xyXG4gKlxyXG4gKiBcdCBJbnRlcklvLnRyYW5zUmVxdWVzdCh7XHJcblx0XHQgdXJsOiBiYXNlaG9zdCsnL2xpc3RkYXRhJyxcclxuXHRcdCBtZXRob2Q6J1BPU1QnLFxyXG5cdFx0IGRhdGE6IHsnbmFtZSc6ICd6bXJkbGInfVxyXG5cdCB9LHtcclxuXHRcdCBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKXtcclxuXHRcdFx0IGNvbnNvbGUubG9nKGRhdGEpO1xyXG5cdFx0IH1cclxuXHRcdCAvLyBmYWlsOiBmdW5jdGlvbigpe1xyXG5cdFx0IC8vICAgICBjb25zb2xlLmxvZygn6KaG55uW57uf5LiAZmFpbOWkhOeQhicpO1xyXG5cdFx0IC8vIH0sXHJcblx0XHQgLy8gZXJyb3I6IGZ1bmN0aW9uKCl7XHJcblx0XHQgLy8gICAgIGNvbnNvbGUubG9nKCfopobnm5bnu5/kuIBlcnJvcuWkhOeQhicpO1xyXG5cdFx0IC8vIH0sXHJcblx0XHQgLy8gY29tcGxldGU6IGZ1bmN0aW9uKCl7XHJcblx0XHQgLy8gICAgIGNvbnNvbGUubG9nKCflrozmiJAnKTtcclxuXHRcdCAvLyB9XHJcblx0IH0pO1xyXG4gKiAqL1xyXG5cclxuY29uc3QgSW9Db25maWcgPSByZXF1aXJlKCcuL2lvY29uZmlnLmpzJyksXHJcblx0XHRTdG9yYWdlID0gcmVxdWlyZSgnLi9zdG9yYWdlLmpzJyk7XHJcblxyXG4vL+ivt+axgumYn+WIl+aOp+WItuexu1xyXG5mdW5jdGlvbiBxdWV1ZUhhbmRsZSgpe1xyXG5cdHRoaXMucXVldWUgPSBbXTsgLy/lvZPliY3pmJ/liJfmlbDmja5cclxuXHR0aGlzLmlucHJvY2VzcyA9IGZhbHNlOyAvL+W9k+WJjemYn+WIl+aOpeWPo+aYr+WQpuato+WcqOWkhOeQhlxyXG5cdHRoaXMuY29tcGxldGUgPSBmdW5jdGlvbigpe307IC8v6Zif5YiX6K+35rGC5a6M5oiQ5ZCO55qE5Zue6LCDXHJcbn07XHJcbi8v5omn6KGM6Zif5YiX5pWw5o2u6K+35rGCXHJcbnF1ZXVlSGFuZGxlLnByb3RvdHlwZS5hZHZhbmNlID0gZnVuY3Rpb24oKXtcclxuXHRpZih0aGlzLnF1ZXVlLmxlbmd0aCA9PSAwKXtcclxuXHRcdHRoaXMuaW5wcm9jZXNzID0gZmFsc2U7XHJcblx0XHRpZih0eXBlb2YgdGhpcy5jb21wbGV0ZSA9PSAnZnVuY3Rpb24nKXtcclxuXHRcdFx0dGhpcy5jb21wbGV0ZSgpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHR2YXIgcmVxID0gdGhpcy5xdWV1ZS5zaGlmdCgpO1xyXG5cdHRoaXMucmVxdWVzdChyZXEsdHJ1ZSk7XHJcbn07XHJcbi8qKlxyXG4qIOa3u+WKoOaOpeWPo+ivt+axguWkhOeQhlxyXG4qIEBwYXJhbSB7SlNPTn0gKm9wdCBmb3JtYXTlkI7nmoTmjqXlj6Plj4LmlbBcclxuKiBAcGFyYW0ge0Jvb2xlYW59IGFkdmFuY2Ug5piv5ZCm5pivcXVldWVIYW5kZXIuYWR2YW5jZeiwg+eUqFxyXG4qL1xyXG5xdWV1ZUhhbmRsZS5wcm90b3R5cGUucmVxdWVzdCA9IGZ1bmN0aW9uKG9wdCxhZHZhbmNlKXtcclxuXHRpZih0aGlzLmlucHJvY2VzcyAmJiAhYWR2YW5jZSl7XHJcblx0XHR0aGlzLnF1ZXVlLnB1c2gob3B0KTtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0dGhpcy5pbnByb2Nlc3MgPSB0cnVlO1xyXG5cdHJlcXVlc3Qob3B0KTtcclxufTtcclxuLyoqXHJcbiAqIHF1ZXVlSGFuZGxl5a+56LGh5o6n5Yi25ZmoXHJcbiAqL1xyXG52YXIgcXVldWVDb250cm9sID0ge1xyXG5cdF9xdWV1ZW9ianM6IFtdLCAvL3F1ZXVlSGFuZGxl5a+56LGh5YiX6KGoXHJcblx0Z2V0OiBmdW5jdGlvbigpeyAvL+i/lOWbnuW9k+WJjeepuumXsueahHF1ZXVlSGFuZGxl5a+56LGhXHJcblx0XHR2YXIgY3VycXVldWUgPSBudWxsO1xyXG5cdFx0dmFyIHF1ZXVlb2JqcyA9IHRoaXMuX3F1ZXVlb2JqcztcclxuXHRcdGZvcih2YXIgaSA9IDAsIGxlbiA9IHF1ZXVlb2Jqcy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XHJcblx0XHRcdGlmKHF1ZXVlb2Jqc1tpXS5pbnByb2Nlc3MgPT0gZmFsc2UgJiYgcXVldWVvYmpzW2ldLmxvY2sgPT0gZmFsc2UpeyAvL+aXouaXoOivt+axguWPiOayoeacieiiq+mUgeWumlxyXG5cdFx0XHRcdHF1ZXVlb2Jqc1tpXS5sb2NrID0gdHJ1ZTtcclxuXHRcdFx0XHRjdXJxdWV1ZSA9IHF1ZXVlb2Jqc1tpXTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0aWYoY3VycXVldWUgPT0gbnVsbCl7XHJcblx0XHRcdGN1cnF1ZXVlID0gbmV3IHF1ZXVlSGFuZGxlKCk7XHJcblx0XHRcdGN1cnF1ZXVlLmxvY2sgPSB0cnVlO1xyXG5cdFx0XHR0aGlzLl9xdWV1ZW9ianMucHVzaChjdXJxdWV1ZSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gY3VycXVldWU7XHJcblx0fSxcclxuXHRlbmQ6IGZ1bmN0aW9uKHF1ZXVlKXsgLy/pgJrnn6XlvZPliY1xdWV1ZUhhbmRsZeWvueixoeW3sue7j+S9v+eUqOWujOavlVxyXG5cdFx0dmFyIHF1ZXVlb2JqcyA9IHRoaXMuX3F1ZXVlb2JqcztcclxuXHRcdGZvcih2YXIgaSA9IDAsIGxlbiA9IHF1ZXVlb2Jqcy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XHJcblx0XHRcdGlmKHF1ZXVlb2Jqc1tpXSA9PSBxdWV1ZSl7IC8v5pei5peg6K+35rGC5Y+I5rKh5pyJ6KKr6ZSB5a6aXHJcblx0XHRcdFx0cXVldWVvYmpzW2ldLmxvY2sgPSBmYWxzZTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuLyoqXHJcbiAqIOagvOW8j+WMlmlv5o6l5Y+j6K+35rGC5Y+C5pWwXHJcbiAqIEBwYXJhbSB7SlNPTn0gKmlvb3B0IOaVsOaNruaOpeWPo+WPguaVsFxyXG4gKiBwYXJhbSB7SlNPTn0gKmlvY2FsbCBpb+ivt+axguWbnuiwg1xyXG4gKiBAcGFyYW0ge3F1ZXVlSGFuZGxlfSAqcXVldWVvYmog6Zif5YiX5o6n5Yi25Zmo5a+56LGhXHJcbiAqL1xyXG5mdW5jdGlvbiBmb3JtYXQoaW9hcmdzLGlvY2FsbCxxdWV1ZW9iail7XHJcblx0dmFyIF9pb2FyZ3MgPSB7fSwgX2lvY2FsbCA9IHt9O1xyXG5cdCQuZXh0ZW5kKHRydWUsX2lvYXJncyxJb0NvbmZpZy5pb2FyZ3MsaW9hcmdzKTtcclxuXHQkLmV4dGVuZCh0cnVlLF9pb2NhbGwsSW9Db25maWcuaW9jYWxsLGlvY2FsbCk7XHJcblx0SW9Db25maWcuZm9ybWF0KF9pb2FyZ3MpO1xyXG5cdHZhciBvbGRzdWNjZXNzID0gX2lvY2FsbC5zdWNjZXNzO1xyXG5cdHZhciBvbGRjb21wbGV0ZSA9IF9pb2NhbGwuY29tcGxldGU7XHJcblx0dmFyIGRlYWxsb2dpbiA9IF9pb2FyZ3MuY3VzdG9tY29uZmlnLmRlYWxsb2dpbjtcclxuXHR2YXIgZGVhbGZhaWwgPSBfaW9hcmdzLmN1c3RvbWNvbmZpZy5kZWFsZmFpbDtcclxuXHR2YXIgZGVhbGRhdGEgPSBfaW9hcmdzLmN1c3RvbWNvbmZpZy5kZWFsZGF0YTtcclxuXHRfaW9jYWxsLnN1Y2Nlc3MgPSBmdW5jdGlvbihkYXRhLCB0ZXh0U3RhdHVzLCBqcVhIUil7IC8v6YeN5YaZc3VjY2Vzc+aWueazle+8jOeUqOadpeWkhOeQhuacqueZu+mZhumXrumimFxyXG5cdFx0aWYoZGVhbGxvZ2luICYmIHR5cGVvZiBJb0NvbmZpZy5sb2dpbi5maWx0ZXIgPT0gJ2Z1bmN0aW9uJyl7IC8v55uR5rWL5piv5ZCm5pyJ5pyq55m76ZmG6ZSZ6K+v5aSE55CGXHJcblx0XHRcdGlmKElvQ29uZmlnLmxvZ2luLmZpbHRlcihkYXRhKSl7IC8v5pyq55m75b2VXHJcblx0XHRcdCAgICBpZihJb0NvbmZpZy5sb2dpbi51cmwgIT0gJycpeyAvL+i3s+i9rHVybFxyXG5cdFx0XHQgICAgICAgIHZhciBsb2dpbnVybCA9IElvQ29uZmlnLmxvZ2luLnVybDtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc2VhcmNoID0gSW9Db25maWcubG9naW4ua2V5Kyc9JytlbmNvZGVVUklDb21wb25lbnQobG9jYXRpb24uaHJlZik7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYobG9naW51cmwubGFzdEluZGV4T2YoJz8nKSAhPSAtMSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2ludXJsID0gbG9naW51cmwucmVwbGFjZSgvXFw/LywnPycrc2VhcmNoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9naW51cmwgPSBsb2dpbnVybCsnPycrc2VhcmNoO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gbG9naW51cmw7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cdFx0XHQgICAgfWVsc2UgaWYodHlwZW9mIElvQ29uZmlnLmxvZ2luLmRlYWwgPT0gJ2Z1bmN0aW9uJyl7XHJcblx0XHRcdCAgICAgICAgSW9Db25maWcubG9naW4uZGVhbChkYXRhKTtcclxuXHRcdFx0ICAgICAgICByZXR1cm47XHJcblx0XHRcdCAgICB9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGlmKGRlYWxmYWlsICYmIHR5cGVvZiBJb0NvbmZpZy5mYWlsLmZpbHRlciA9PSAnZnVuY3Rpb24nKXsgLy/mo4DmtYvmmK/lkKbmnInkuJrliqHplJnor6/lpITnkIZcclxuXHRcdCAgICBpZihJb0NvbmZpZy5mYWlsLmZpbHRlcihkYXRhKSl7IC8v5Lia5Yqh6ZSZ6K+vXHJcblx0XHQgICAgICAgIGlmKHR5cGVvZiBfaW9jYWxsW0lvQ29uZmlnLmZhaWwuZnVubmFtZV0gPT0gJ2Z1bmN0aW9uJyl7XHJcblx0XHQgICAgICAgICAgICBfaW9jYWxsW0lvQ29uZmlnLmZhaWwuZnVubmFtZV0oZGF0YSwgdGV4dFN0YXR1cywganFYSFIpO1xyXG5cdFx0ICAgICAgICB9XHJcblx0XHQgICAgfWVsc2V7IC8v5Lia5Yqh5oiQ5YqfXHJcblx0XHQgICAgICAgIGlmKGRlYWxkYXRhKXsgLy/nu5/kuIDlpITnkIbkuJrliqHmiJDlip/mlbDmja5cclxuXHRcdCAgICAgICAgICAgIHR5cGVvZiBvbGRzdWNjZXNzID09ICdmdW5jdGlvbicgJiYgb2xkc3VjY2VzcyhfaW9hcmdzLmRlYWxkYXRhKGRhdGEsIHRleHRTdGF0dXMsIGpxWEhSKSwgdGV4dFN0YXR1cywganFYSFIpO1xyXG5cdFx0ICAgICAgICB9ZWxzZXtcclxuXHRcdCAgICAgICAgICAgIHR5cGVvZiBvbGRzdWNjZXNzID09ICdmdW5jdGlvbicgJiYgb2xkc3VjY2VzcyhkYXRhLCB0ZXh0U3RhdHVzLCBqcVhIUik7XHJcblx0XHQgICAgICAgIH1cclxuXHRcdCAgICB9XHJcblx0XHR9ZWxzZXtcclxuXHRcdCAgICB0eXBlb2Ygb2xkc3VjY2VzcyA9PSAnZnVuY3Rpb24nICYmIG9sZHN1Y2Nlc3MoZGF0YSwgdGV4dFN0YXR1cywganFYSFIpO1xyXG5cdFx0fVxyXG5cdH07XHJcblx0aWYoX2lvYXJncy5jdXN0b21jb25maWcucXVldWUpeyAvL+ivtOaYjuaOpeWPo+WQjOaEj+i/m+ihjOmYn+WIl+aOp+WItlxyXG5cdFx0X2lvY2FsbC5jb21wbGV0ZSA9IGZ1bmN0aW9uKCl7IC8v6YeN5YaZ5o6l5Y+j6K+35rGC5a6M5oiQ5LqL5Lu2XHJcblx0XHRcdHF1ZXVlb2JqLmFkdmFuY2UoKTtcclxuXHRcdFx0dHlwZW9mIG9sZGNvbXBsZXRlID09ICdmdW5jdGlvbicgJiYgb2xkY29tcGxldGUuYXBwbHkodGhpcyxBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcclxuXHRcdH07XHJcblx0fVxyXG5cdHJldHVybiB7XHJcblx0XHRpb2FyZ3M6IF9pb2FyZ3MsXHJcblx0XHRpb2NhbGw6IF9pb2NhbGxcclxuXHR9O1xyXG59XHJcbmZ1bmN0aW9uIGRvYWpheChpb2FyZ3MsaW9jYWxsKXtcclxuXHR2YXIgaW50ZXJvYmogPSBudWxsLFxyXG5cdFx0Z2V0SW50ZXIgPSBpb2FyZ3MuY3VzdG9tY29uZmlnLmdldEludGVyLFxyXG5cdFx0c3RvcmFnZSA9IGlvYXJncy5jdXN0b21jb25maWcuc3RvcmFnZTtcclxuXHRkZWxldGUgaW9hcmdzLmN1c3RvbWNvbmZpZztcclxuXHJcblx0aW50ZXJvYmogPSAkLmFqYXgoaW9hcmdzKS5kb25lKGlvY2FsbC5zdWNjZXNzKS5mYWlsKGlvY2FsbC5lcnJvcikuYWx3YXlzKGlvY2FsbC5jb21wbGV0ZSkuZG9uZShmdW5jdGlvbihkYXRhKXtcclxuXHRcdGlmKHN0b3JhZ2UgJiYgc3RvcmFnZSBpbnN0YW5jZW9mIFN0b3JhZ2Upe1xyXG5cdFx0XHRzdG9yYWdlLnNldChkYXRhKTtcclxuXHRcdH1cclxuXHR9KTtcclxuXHRpZihpbnRlcm9iaiAmJiB0eXBlb2YgZ2V0SW50ZXIgPT0gJ2Z1bmN0aW9uJyl7XHJcblx0XHRnZXRJbnRlcihpbnRlcm9iaik7XHJcblx0fVxyXG59XHJcbi8qKlxyXG4gKiDlpITnkIbmjqXlj6Por7fmsYJcclxuICogQHBhcmFtIHtKU09OfSBpb29wdCBmb3JtYXTlkI7nmoTmjqXlj6Plj4LmlbBcclxuICovXHJcbmZ1bmN0aW9uIHJlcXVlc3QoaW9vcHQpe1xyXG5cdHZhciBfaW9hcmdzID0gaW9vcHQuaW9hcmdzLFxyXG5cdFx0X2lvY2FsbCA9IGlvb3B0LmlvY2FsbCxcclxuXHRcdG1vZGUgPSBfaW9hcmdzLmN1c3RvbWNvbmZpZy5tb2RlLFxyXG5cdFx0Y2xlYXJhbGwgPSBfaW9hcmdzLmN1c3RvbWNvbmZpZy5jbGVhcmFsbCxcclxuXHRcdHN0b3JhZ2UgPSBfaW9hcmdzLmN1c3RvbWNvbmZpZy5zdG9yYWdlLFxyXG5cdFx0Y2FjaGVkYXRhID0gbnVsbDtcclxuXHJcblx0Ly/muIXpmaTmiYDmnInnvJPlrZhcclxuXHRpZihjbGVhcmFsbCl7XHJcblx0XHRTdG9yYWdlLmNsZWFyKCk7XHJcblx0fVxyXG5cclxuXHQvL+aYr+WQpuaciee8k+WtmFxyXG5cdGlmKHN0b3JhZ2UgJiYgc3RvcmFnZSBpbnN0YW5jZW9mIFN0b3JhZ2UgJiYgKChjYWNoZWRhdGEgPSBzdG9yYWdlLmdldCgpKSAhPSBudWxsKSl7XHJcblx0XHRfaW9jYWxsLnN1Y2Nlc3MoY2FjaGVkYXRhLCAnc3VjY2VzcycsIG51bGwpO1xyXG5cdFx0X2lvY2FsbC5jb21wbGV0ZSgpO1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHJcblx0aWYobW9kZSA9PSAnYWpheCcpe1xyXG5cdFx0aWYoX2lvYXJncy5kYXRhVHlwZSA9PSB1bmRlZmluZWQgfHwgX2lvYXJncy5kYXRhVHlwZSA9PSAnJyl7XHJcblx0XHRcdF9pb2FyZ3MuZGF0YVR5cGUgPSAnanNvbic7XHJcblx0XHR9XHJcblx0XHRkb2FqYXgoX2lvYXJncyxfaW9jYWxsKTtcclxuXHR9ZWxzZSBpZihtb2RlID09ICdqc29ucCcpe1xyXG5cdFx0X2lvYXJncy5kYXRhVHlwZSA9ICdqc29ucCc7XHJcblx0XHRfaW9hcmdzLmNyb3NzRG9tYWluID0gdHJ1ZTtcclxuXHRcdGRvYWpheChfaW9hcmdzLF9pb2NhbGwpO1xyXG5cdH1lbHNlIGlmKG1vZGUgPT0gJ3NjcmlwdCcpe1xyXG5cdFx0X2lvYXJncy5kYXRhVHlwZSA9ICdzY3JpcHQnO1xyXG5cdFx0X2lvYXJncy5jcm9zc0RvbWFpbiA9IHRydWU7XHJcblx0XHRkb2FqYXgoX2lvYXJncyxfaW9jYWxsKTtcclxuXHR9XHJcbn1cclxudmFyIG1haW5xdWV1ZSA9IG5ldyBxdWV1ZUhhbmRsZSgpOyAvL+S4u+e6v+eoi+mYn+WIl+aOp+WItuWvueixoVxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHQvKipcclxuXHQgKiDmiafooYzmjqXlj6Por7fmsYJcclxuICAgICAqIEBwYXJhbSB7SlNPTn0gKmlvYXJncyDmjqXlj6PmianlsZXlj4LmlbDjgILlr7nlupRpb2NvbmZpZy5qc+mHjOeahGlvYXJnc+mFjee9ruagvOW8j1xyXG4gICAgICogQHBhcmFtIHtKU09OfSAqaW9jYWxsIOaOpeWPo+aJqeWxleWPguaVsOOAguWvueW6lGlvY29uZmlnLmpz6YeM55qEaW9jYWxs6YWN572u5qC85byPXHJcblx0ICovXHJcblx0dHJhbnNSZXF1ZXN0OiBmdW5jdGlvbihpb2FyZ3MsaW9jYWxsKXtcclxuXHRcdGlmKGlvYXJncyAmJiBpb2NhbGwgJiYgaW9hcmdzLnVybCAhPSAnJyl7XHJcblx0XHRcdHZhciBjdXJvcHQgPSBmb3JtYXQoaW9hcmdzLGlvY2FsbCxtYWlucXVldWUpO1xyXG5cdFx0XHRpZihjdXJvcHQuaW9hcmdzLmN1c3RvbWNvbmZpZy5xdWV1ZSl7IC8v6K+05piO6YG15b6q6Zif5YiX5o6n5Yi2XHJcblx0XHRcdFx0bWFpbnF1ZXVlLnJlcXVlc3QoY3Vyb3B0KTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNle1xyXG5cdFx0XHRcdHJlcXVlc3QoY3Vyb3B0KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0sXHJcblx0LyoqXHJcblx0ICog5a+55LiA57uE6K+35rGC6L+b6KGM5Y2V54us55qE6Zif5YiX5o6n5Yi25L6d5qyh6K+35rGC44CC5YWo6YOo6K+35rGC5a6M5q+V5ZCO6L+b6KGM6YCa55+l44CCXHJcblx0ICog5q2k5oOF5Ya15LiL77yM6YCa6L+HaW9hcmdz6K6+572u55qE5Y+C5pWw6YWN572uY3VzdG9tY29uZmlnOntxdWV1ZTp0cnVlfGZhbHNlfeaXoOaViOOAguW8uuWItumDvei1sOmYn+WIl1xyXG5cdFx0ICogQHBhcmFtIHtBcnJheX0gKmFyZ3NhcnIg5o6l5Y+j6K+35rGC5pWw57uEXHJcblx0XHQgKiBbe1xyXG5cdFx0ICogICAge0pTT059ICppb2FyZ3Mg5o6l5Y+j5omp5bGV5Y+C5pWw44CC5a+55bqUaW9jb25maWcuanPph4znmoRpb2FyZ3PphY3nva7moLzlvI9cclxuXHRcdCAqICAgIHtKU09OfSAqaW9jYWxsIOaOpeWPo+aJqeWxleWPguaVsOOAguWvueW6lGlvY29uZmlnLmpz6YeM55qEaW9jYWxs6YWN572u5qC85byPXHJcblx0XHQgKiB9XVxyXG5cdFx0ICogQHBhcmFtIHtKU09OfSBjdXN0b21vYmog55So5oi36Ieq5a6a5LmJ5omp5bGV5Y+C5pWwXHJcblx0XHQgKiB7XHJcblx0XHQgKiBcdCAge0Z1bmN0aW9ufSBjb21wbGV0ZSDmjqXlj6Plhajpg6jor7fmsYLlrozmr5XlkI7nmoTpgJrnn6Xlm57osINcclxuXHRcdCAqIH1cclxuXHQgKi9cclxuXHR0cmFuc1F1ZXVlUmVxdWVzdDogZnVuY3Rpb24oYXJnc2FycixjdXN0b21vYmope1xyXG5cdFx0aWYoJC5pc0FycmF5KGFyZ3NhcnIpICYmIGFyZ3NhcnIubGVuZ3RoID4gMCl7XHJcblx0XHRcdHZhciBxdWV1ZW9iaiA9IHF1ZXVlQ29udHJvbC5nZXQoKTsgLy/ojrflj5bkuIDkuKrnqbrpl7LnmoRxdWV1ZUhhbmRsZVxyXG5cdFx0XHRxdWV1ZW9iai5jb21wbGV0ZSA9IGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0cXVldWVDb250cm9sLmVuZChxdWV1ZW9iaik7IC8v6YCa55+l5b2T5YmNcXVldWXlr7nosaHkvb/nlKjlrozmr5VcclxuXHRcdFx0XHRpZihjdXN0b21vYmogJiYgdHlwZW9mIGN1c3RvbW9iai5jb21wbGV0ZSA9PSAnZnVuY3Rpb24nKXtcclxuXHRcdFx0XHRcdGN1c3RvbW9iai5jb21wbGV0ZSgpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fTtcclxuXHRcdFx0Zm9yKHZhciBpID0gMCwgbGVuID0gYXJnc2Fyci5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XHJcblx0XHRcdFx0dmFyIGlvYXJncyA9IGFyZ3NhcnJbaV0uaW9hcmdzIHx8IHt9O1xyXG5cdFx0XHRcdHZhciBpb2NhbGwgPSBhcmdzYXJyW2ldLmlvY2FsbCB8fCB7fTtcclxuXHRcdFx0XHRpZihpb2FyZ3MgJiYgaW9jYWxsICYmIGlvYXJncy51cmwgIT0gJycpe1xyXG5cdFx0XHRcdFx0aW9hcmdzID0gJC5leHRlbmQodHJ1ZSxpb2FyZ3Mse2N1c3RvbWNvbmZpZzp7cXVldWU6dHJ1ZX19KTtcclxuXHRcdFx0XHRcdHZhciBjdXJvcHQgPSBmb3JtYXQoaW9hcmdzLGlvY2FsbCxxdWV1ZW9iaik7XHJcblx0XHRcdFx0XHRxdWV1ZW9iai5yZXF1ZXN0KGN1cm9wdCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyBpb+aOpeWPo+ivt+axguebuOWFs+aVsOaNrumFjee9rlxyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE1LTA2LTI4IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm4g5pu05aSa6K+m57uG5L+h5oGv5Y+C6ICD5Luj56CB6YeM5a+55bqU5a6a5LmJ5pa55rOV5oiW5bGe5oCn5L2N572u55qE5rOo6YeK6K+05piOXHJcbiAqIFx0bG9naW4ge0pTT059IOWvueS6juaOpeWPo+i/lOWbnuacqueZu+mZhumUmeivr+i/m+ihjOe7n+S4gOWkhOeQhumFjee9rlxyXG4gKiAgaW9hcmdzIHtKU09OfSBpb+ivt+axguaOpeWPo+m7mOiupOWPguaVsFxyXG4gKiAgc2V0VHJhbnMge0Z1bmN0aW9ufSDorr7nva7mjqXlj6PphY3nva5cclxuICogIGdldFRyYW5zIHtGdW5jdGlvbn0g6I635Y+W5o6l5Y+j6YWN572uXHJcbiAqICBnbG9iYWxTZXR1cCB7RnVuY3Rpb259IOiuvue9ruWFqOWxgGFqYXjphY3nva5cclxuICogQGV4YW1wbGVcclxuICogXHRcdGNvbnN0IElvQ29uZmlnID0gcmVxdWlyZSgnbGliaW8taW9jb25maWcnKTtcclxuICpcclxuXHQgXHQgLy/nu5/kuIDlpITnkIbmnKrnmbvlvZVcclxuXHRcdCBJb0NvbmZpZy5sb2dpbi5maWx0ZXIgPSBmdW5jdGlvbihyZXN1bHQpe1xyXG5cdFx0IFx0cmV0dXJuIHJlc3VsdC5jb2RlID09ICdBMDAwMic7XHJcblx0XHQgfTtcclxuXHRcdCBJb0NvbmZpZy5sb2dpbi51cmwgPSAnaHR0cDovL2JhaWR1LmNvbS8nO1xyXG5cclxuXHRcdCAvL+aJgOacieaOpeWPo+eahGlv5Lia5Yqh6ZSZ6K+v57uf5LiA5aSE55CGXHJcblx0XHQgSW9Db25maWcuZmFpbC5maWx0ZXIgPSBmdW5jdGlvbihyZXN1bHQpIHtcclxuXHRcdCBcdHJldHVybiByZXN1bHQuY29kZSAhPSAnQTAwMDEnO1xyXG5cdFx0IH07XHJcblx0XHQgSW9Db25maWcuaW9jYWxsLmZhaWwgPSBmdW5jdGlvbihyZXN1bHQpe1xyXG5cdFx0IFx0YWxlcnQocmVzdWx0LmVycm1zZyB8fCAn572R57uc6ZSZ6K+vJyk7XHJcblx0XHQgfTtcclxuXHJcblx0XHQgSW9Db25maWcuaW9hcmdzLmNyb3NzRG9tYWluID0gdHJ1ZTtcclxuICogKi9cclxuXHJcbi8vdmFyIGlvY2FjaGUgPSB7fTsgLy/mjqXlj6PnmoTphY3nva7pobnnvJPlrZjjgILmoLzlvI/kuLp7aW50ZXJuYW1l77ybaW9hcmdz6YeM6Z2i55qE5Y+C5pWw6YWN572u6aG5anNvbuagvOW8j31cclxudmFyIHRoYXQgPSB7fTtcclxuLyoqXHJcbiAqIOWvueS6juaOpeWPo+i/lOWbnuacqueZu+mZhumUmeivr+i/m+ihjOe7n+S4gOWkhOeQhiDphY3nva7jgIJcclxuICovXHJcbnRoYXQubG9naW4gPSB7XHJcblx0dXJsOiAnJywgLy/mnKrnmbvmg4XlhrXkuIvot7PovaznmoTpobXpnaJcclxuXHRrZXk6ICdnbycsIC8v6Lez6L2s5YiwdXJs5oyH5a6a6aG16Z2i5Lyg6YCS5b2T5YmN6aG16Z2i5Zyw5Z2A55qE6ZSu5YC85ZCN56ewXHJcblx0ZGVhbDogZnVuY3Rpb24oZGF0YSl7fSwgLy/mnInnmoTmg4XlhrXkuIvvvIzkuI3mmK/ot7PovaznmbvlvZV1cmzvvIzogIzkuJTlvLnnmbvlvZXlvLnlsYLjgILliJnmraTml7blsIZ1cmzorr7nva7kuLonJ++8jOWwhueZu+mZhuW8ueWxguW8ueWHuuWkhOeQhuWGmeWcqOatpOaWueazleS4rVxyXG5cdGZpbHRlcjogZnVuY3Rpb24oZGF0YSl7cmV0dXJuIGZhbHNlO30gLy/lpoLmnpzmraTlh73mlbDov5Tlm550cnVl5YiZ6Lez6L2sdXJs5oyH5a6a55qE6aG16Z2i44CCZGF0YeaYr+aOpeWPo+i/lOWbnueahOaVsOaNrlxyXG59O1xyXG4vKipcclxuICog5a+55LqO5o6l5Y+j6L+U5Zue55qE5Lia5Yqh6ZSZ6K+v6L+b6KGM57uf5LiA5aSE55CGIOmFjee9ruOAglxyXG4gKiDlpoJjb2RlID09ICdBMDAwMScg566X5oiQ5Yqf77yM5YW25LuW6YO9566X5aSx6LSlXHJcbiAqL1xyXG50aGF0LmZhaWwgPSB7XHJcbiAgICBmdW5uYW1lOiAnZmFpbCcsIC8v5b2T5Y+R55Sf5Lia5Yqh6ZSZ6K+v55qE5pe25YCZ77yM6LCD55So55qE5qC85byP5ZCM5LqOaW9hcmdz6YeM55qE5Ye95pWw55qE5Ye95pWw5ZCN44CC6buY6K6k5pivZXJyb3JcclxuICAgIGZpbHRlcjogZnVuY3Rpb24oZGF0YSl7cmV0dXJuIGZhbHNlO30gLy/lpoLmnpzmraTlh73mlbDov5Tlm550cnVl5YiZ6K+05piO5b2T5YmN5o6l5Y+j6L+U5Zue5Lia5Yqh6ZSZ6K+v5L+h5oGv44CCZGF0YeaYr+aOpeWPo+i/lOWbnueahOaVsOaNrlxyXG4gICAgLyoqXHJcbiAgICAgKiDlpoLmnpzmjqXlj5fkuJrliqHplJnor6/kv6Hmga/nu5/kuIDlpITnkIbvvIzliJnlj6/ku6XmjInnhafku6XkuIvmlrnlvI/loavlhpnvvJpcclxuICAgICAqIHJlcWl1cmVqcyhbJ2xpYmlvL2lvY29uZmlnJ10sZnVuY3Rpb24oJGlvY29uZmlnKXtcclxuICAgICAqICAgICAkaW9jb25maWcuZXJyb3IgPSB7XHJcbiAgICAgKiAgICAgICAgIGZ1bm5hbWU6ICdmYWlsJyxcclxuICAgICAqICAgICAgICAgZmlsdGVyOiBmdW5jdGlvbihkYXRhKXtpZihkYXRhICYmIGRhdGEuZXJyY29kZSAhPSAwKXtyZXR1cm4gdHJ1ZTt9fVxyXG4gICAgICogICAgIH07XHJcbiAgICAgKiAgICAgJGlvY29uZmlnLmlvYXJncy5mYWlsID0gZnVuY3Rpb24oZGF0YSl7IGFsZXJ0KGRhdGEuZXJybXNnIHx8ICfnvZHnu5zplJnor68nKTsgfVxyXG4gICAgICogfSk7XHJcbiAgICAgKi9cclxufTtcclxudGhhdC5pb2FyZ3MgPSB7IC8vaW/or7fmsYLpu5jorqTnmoTlj4LmlbDmoLzlvI9cclxuXHQvL+WQjGFqYXjlj4LmlbDlrpjmlrnor7TmmI7poblcclxuXHR1cmw6ICcnLFxyXG5cdG1ldGhvZDogJ0dFVCcsXHJcblx0Y29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxyXG5cdGRlYWxkYXRhOiBmdW5jdGlvbihyZXN1bHQpe3JldHVybiByZXN1bHQuZGF0YTt9LCAvL+W9k+S4muWKoeWkhOeQhuaIkOWKn+aXtu+8jOi/lOWbnue7n+S4gOWkhOeQhueahOaVsOaNrlxyXG5cdC8v6Ieq5a6a5LmJ5pWw5o2uXHJcblx0Y3VzdG9tY29uZmlnOntcclxuXHRcdG1vZGU6ICdhamF4JywgLy/kvb/nlKjku4DkuYjmlrnlvI/or7fmsYLvvIzpu5jorqTmmK9hamF4KGFqYXjmlrnlvI/pu5jorqTov5Tlm57nmoTmmK9qc29u5qC85byP55qE5pWw5o2u44CC5Lmf5Y+v6YCa6L+H5Zyo5ZKMbWV0aG9k5Y+C5pWw5ZCM57qn55qE5L2N572u6K6+572uZGF0YVR5cGXlj4LmlbDmnaXmlLnlj5jpu5jorqTnmoRqc29u6K6+572uKeOAguWPr+eUqOeahOWPguaVsOaciWFqYXh8anNvbnB8c2NyaXB0XHJcblx0ICAgIGRlYWxsb2dpbjogdHJ1ZSwgLy/mmK/lkKbnu5/kuIDlpITnkIbmnKrnmbvpmYbplJnor69cclxuXHQgICAgZGVhbGZhaWw6IHRydWUsIC8v5piv5ZCm57uf5LiA5aSE55CG5Lia5Yqh6ZSZ6K+vXHJcblx0ICAgIGRlYWxkYXRhOiB0cnVlLCAvL+W9k+S4muWKoeWkhOeQhuaIkOWKn+aXtu+8jOaYr+WQpue7n+S4gOWkhOeQhui/lOWbnueahOaVsOaNruOAguazqOaEj++8muWPquacieW9k2RlYWxlcnJvcuS4unRydWXml7bvvIxkZWFsZGF0YeS4unRydWXmiY3mnInmlYjjgILlkKbliJnkuI3kvJrosIPnlKhkZWFsZGF0YeaWueazlVxyXG5cdCAgICBxdWV1ZTogZmFsc2UsIC8v5o6l5Y+j6K+35rGC5piv5ZCm6L+b6KGM6Zif5YiX5o6n5Yi277yM5Y2z5b2T5YmN6K+35rGC5a6M5oiQ5ZCO5omN5Y+v5Lul6L+b6KGM5LiL5LiA5Liq6K+35rGCXHJcblx0XHRzdG9yYWdlOiBudWxsLCAvL2xpYmlvL3N0b3JhZ2Xlr7nosaHvvIzmjqfliLZpb+ivt+axguaVsOaNrue8k+WtmFxyXG5cdFx0Y2xlYXJhbGw6IGZhbHNlLCAvL+ivt+axguaOpeWPo+aXtu+8jOaYr+WQpua4hemZpOaJgOaciee8k+WtmFxyXG5cdCAgICBnZXRJbnRlcjogZnVuY3Rpb24oaW50ZXJvYmope30gLy/ojrflj5bmjqXlj6Por7fmsYLlrp7kvovlr7nosaHjgILlpoJpbnRlcm9iauS4uiQuYWpheCgp6L+U5Zue55qE5a+56LGhXHJcblx0fVxyXG59O1xyXG4vKipcclxuICog5aaC5p6cZGF0YeaYr+S7juacrOWcsOe8k+WtmOS4reivu+WPlueahOaVsOaNru+8jOmCo+S5iHN1Y2Nlc3PlkoxmYWls5pa55rOV5Lit55qE5Y+C5pWw77yaXHJcbiAqIFx0XHR0ZXh0U3RhdHVz5ZKManFYSFLliIbliKvmmK8gJ3N1Y2Nlc3MnLCBudWxsXHJcbiAqIEB0eXBlIHtPYmplY3R9XHJcbiAqL1xyXG50aGF0LmlvY2FsbCA9IHsgLy9pb+ivt+axguWbnuiwg1xyXG5cdGNvbXBsZXRlOiBmdW5jdGlvbigpe30sIC8v5Y+C5pWw5Li6IGRhdGF8anFYSFIsIHRleHRTdGF0dXMsIGpxWEhSfGVycm9yVGhyb3duXHJcblx0c3VjY2VzczogZnVuY3Rpb24oZGF0YSwgdGV4dFN0YXR1cywganFYSFIpe30sXHJcblx0ZXJyb3I6IGZ1bmN0aW9uKGpxWEhSLCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bil7YWxlcnQoIHRleHRTdGF0dXMgfHwgJ+e9kee7nOmUmeivrycpOyB9LFxyXG5cdGZhaWw6IGZ1bmN0aW9uKGRhdGEsIHRleHRTdGF0dXMsIGpxWEhSKXt9IC8v5b2T5Lia5Yqh5aSE55CG6ZSZ6K+v5pe277yM6L+U5Zue57uf5LiA5aSE55CG5Lia5Yqh6ZSZ6K+vXHJcbn07XHJcbi8qKlxyXG4gKiDmr4/kuKror7fmsYLlj5HpgIHkuYvliY3vvIznu5/kuIDmoLzlvI/ljJblj4LmlbDphY3nva7vvIjmoLzlvI/lkIxpb2FyZ3PvvInjgIJcclxuICog5bqU55So5Zy65pmv77yaIOavj+S4quS4muWKoemhueebrumcgOimgemFjee9rue7n+S4gOeahOWPguaVsOWkhOeQhuOAglxyXG4gKi9cclxudGhhdC5mb3JtYXQgPSBmdW5jdGlvbihvcHQpe307XHJcbi8qKlxyXG4gKiDorr7nva7lhajlsYDnmoTmjqXlj6Por7fmsYLphY3nva5cclxuICogQHBhcmFtIHtPYmplY3R9IHNldHRpbmdcclxuICovXHJcbnRoYXQuZ2xvYmFsU2V0dXAgPSBmdW5jdGlvbihzZXR0aW5nKXtcclxuXHRpZih0eXBlb2Ygc2V0dGluZyA9PSAnb2JqZWN0Jyl7XHJcblx0XHQkLmFqYXhTZXR1cChzZXR0aW5nKTtcclxuXHR9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHRoYXQ7XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IOS9v+eUqGxvY2FsU3RvcmFnZei/m+ihjOaVsOaNruWtmOWCqFxyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE3LTA0LTEzIOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm5cclxuICogKi9cclxuXHJcbi8qKlxyXG4gKiDmlbDmja7lrZjlgqjnsbtcclxuICogQHBhcmFtIHtbdHlwZV19IG9wdCBbZGVzY3JpcHRpb25dXHJcbiAqL1xyXG5mdW5jdGlvbiBTdG9yYWdlKG9wdCl7XHJcbiAgICBvcHQgPSAkLmV4dGVuZCh7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5a2Y5YKo5ZGo5pyf77yM6buY6K6k5Li6MeWkqeOAguWQjue8gOivtOaYjlxyXG4gICAgICAgICAqIE06IOaciFxyXG4gICAgICAgICAqIEQ6IOaXpVxyXG4gICAgICAgICAqIEg6IOWwj+aXtlxyXG4gICAgICAgICAqIEB0eXBlIHtTdHJpbmd9XHJcbiAgICAgICAgICogQGV4YW1wbGUgMS41RCAwLjVIIDNNIDE1RDAuMkhcclxuICAgICAgICAgKiDnibnliKvor7TmmI7vvJrlj6rmlK/mjIEx5L2N5bCP5pWwXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgbWF4YWdlOiAnMUQnLFxyXG4gICAgICAgIGtleTogJycgLy8qIOmUruWAvFxyXG4gICAgfSxvcHQpO1xyXG5cclxuICAgIGlmKG9wdC5rZXkgPT0gJycgfHwgb3B0Lm1heGFnZSA9PSAnJyl7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdsaWJpby9zdG9yYWdlIOWPguaVsOS8oOWFpemUmeivrycpO1xyXG4gICAgfWVsc2UgaWYoIS9eKChcXGQrKShcXC4oWzEtOV17MX0pKT8oW01ESF0pKSskLy50ZXN0KG9wdC5tYXhhZ2UpKXtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2xpYmlvL3N0b3JhZ2UgbWF4YWdl6YWN572u5qC85byP5LiN5q2j56GuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgb3B0LmtleSA9IFN0b3JhZ2UuZ3JvdXBuYW1lICsgJ18nICsgb3B0LmtleTtcclxuXHJcbiAgICB0aGlzLm9wdCA9IG9wdDtcclxufVxyXG5cclxuLyoqXHJcbiAqIOiuoeeul+i/h+acn+aXtumXtOeCuVxyXG4gKiBAcmV0dXJuIHtTdHJpbmd9IERhdGVUaW1l6L+H5pyf5pe26Ze054K55a2X56ym5LiyXHJcbiAqL1xyXG5TdG9yYWdlLnByb3RvdHlwZS5fZ2V0T3V0RGF0ZVRpbWUgPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIG1heGFnZSA9IHRoaXMub3B0Lm1heGFnZSxcclxuICAgICAgICBub3d0aW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCksXHJcbiAgICAgICAgZGlmZmhvdXIgPSAwLFxyXG4gICAgICAgIHJlZyA9IC8oXFxkKykoXFwuKFsxLTldezF9KSk/KFtNREhdKS9nLFxyXG4gICAgICAgIHJlYXJyID0gbnVsbDtcclxuXHJcbiAgICB3aGlsZSgocmVhcnIgPSByZWcuZXhlYyhtYXhhZ2UpKSAhPSBudWxsKXtcclxuICAgICAgICB2YXIgbnVtID0gcmVhcnJbMV0sIC8v5pW05pWw6YOo5YiGXHJcbiAgICAgICAgICAgIHN1ZmZpeCA9IHJlYXJyWzRdO1xyXG4gICAgICAgIGlmKHJlYXJyWzJdKXsgLy/or7TmmI7lrZjlnKjlsI/mlbBcclxuICAgICAgICAgICAgbnVtICs9IHJlYXJyWzJdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBudW0gPSBOdW1iZXIobnVtKTtcclxuICAgICAgICBzd2l0Y2ggKHN1ZmZpeCkge1xyXG4gICAgICAgICAgICBjYXNlICdNJzpcclxuICAgICAgICAgICAgICAgIGRpZmZob3VyICs9IG51bSozMCoyNDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdEJzpcclxuICAgICAgICAgICAgICAgIGRpZmZob3VyICs9IG51bSoyNDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdIJzpcclxuICAgICAgICAgICAgICAgIGRpZmZob3VyICs9IG51bTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG5vd3RpbWUgKz0gZGlmZmhvdXIqNjAqNjAqMTAwMDtcclxuXHJcbiAgICByZXR1cm4gbm93dGltZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiDmlbDmja7orr7nva5cclxuICogQHBhcmFtIHtKU09OfSBkYXRhIOW+heWtmOWCqOeahOaVsOaNrlxyXG4gKiDlrp7pmYXlrZjlgqjnmoTmlbDmja7moLzlvI/lpoLkuIvvvJpcclxuICpcclxuICogIHtcclxuICogICAgICBlbmRUaW1lOiB7U3RyaW5nfVxyXG4gKiAgICAgIGRhdGE6IGRhdGFcclxuICogIH1cclxuICovXHJcblN0b3JhZ2UucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgaWYoIWRhdGEgfHwgT2JqZWN0LmtleXMoZGF0YSkubGVuZ3RoID09IDApe1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLm9wdC5rZXksIEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICBlbmRUaW1lOiB0aGlzLl9nZXRPdXREYXRlVGltZSgpLFxyXG4gICAgICAgIGRhdGE6IGRhdGFcclxuICAgIH0pKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOiOt+WPluaVsOaNrlxyXG4gKiBAcmV0dXJuIHtKU09OfE51bGx9IOi/lOWbnnNldOaXtuWAmeeahGRhdGHjgILlpoLmnpzov4fmnJ/liJnov5Tlm55udWxsXHJcbiAqL1xyXG5TdG9yYWdlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbigpe1xyXG4gICAgLy/liKTmlq3mmK/lkKbov4fmnJ9cclxuICAgIHZhciB2YWx1ZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMub3B0LmtleSk7XHJcbiAgICBpZih2YWx1ZSA9PSBudWxsKXtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1lbHNle1xyXG4gICAgICAgIHZhbHVlID0gSlNPTi5wYXJzZSh2YWx1ZSk7XHJcbiAgICAgICAgaWYoTnVtYmVyKHZhbHVlLmVuZFRpbWUpIDw9IG5ldyBEYXRlKCkuZ2V0VGltZSgpKXsgLy/ov4fmnJ9cclxuICAgICAgICAgICAgdGhpcy5yZW1vdmUoKTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5kYXRhO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOWIoOmZpOatpOmhueaVsOaNrlxyXG4gKiBAcmV0dXJuIHtbdHlwZV19IFtkZXNjcmlwdGlvbl1cclxuICovXHJcblN0b3JhZ2UucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSh0aGlzLm9wdC5rZXkpO1xyXG59XHJcblxyXG4vKipcclxuICog5pWw5o2u5YKo5a2Y5omA5bGe57uE5ZCN56ewXHJcbiAqIEB0eXBlIHtTdHJpbmd9XHJcbiAqL1xyXG5TdG9yYWdlLmdyb3VwbmFtZSA9ICdaTVJETEInO1xyXG5cclxuLyoqXHJcbiAqIOWIoOmZpOWFqOmDqOWcqOe7hFN0b3JhZ2UuZ3JvdXBuYW1l5LiL55qE57yT5a2Y5pWw5o2uXHJcbiAqIEByZXR1cm4ge1t0eXBlXX0gW2Rlc2NyaXB0aW9uXVxyXG4gKi9cclxuU3RvcmFnZS5jbGVhciA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgcmVnID0gbmV3IFJlZ0V4cCgnXicrU3RvcmFnZS5ncm91cG5hbWUpO1xyXG4gICAgd2hpbGUobG9jYWxTdG9yYWdlLmxlbmd0aCA+IDApIHtcclxuICAgICAgICB2YXIga2V5ID0gbG9jYWxTdG9yYWdlLmtleSgwKTtcclxuICAgICAgICBpZihyZWcudGVzdChrZXkpKXtcclxuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oa2V5KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDliJvlu7rkuIDkuKpTdG9yYWdl5a+56LGhXHJcbiAqIEBwYXJhbSAge0pTT059IG9wdCDor6bop4FTdG9yYWdl5a6a5LmJ5aSEXHJcbiAqIEByZXR1cm4ge1N0b3JhZ2V9ICAgICBbZGVzY3JpcHRpb25dXHJcbiAqL1xyXG5TdG9yYWdlLmNyZWF0ZSA9IGZ1bmN0aW9uKG9wdCl7XHJcbiAgICByZXR1cm4gbmV3IFN0b3JhZ2Uob3B0KTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTdG9yYWdlO1xyXG4iXX0=
