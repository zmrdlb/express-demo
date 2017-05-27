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

},{"./storage":2,"libio-interio":12,"libio-ioconfig":13}],2:[function(require,module,exports){
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

},{"libio-storage":14}],3:[function(require,module,exports){
'use strict';

/**
 * @fileoverview 登录页
 * @version 1.0 | 2017-05-27 版本信息
 * @author Zhang Mingrui | 592044573@qq.com
 * @example
 * */
var Model = require('./io/model.js'),
    BaseView = require('core-baseview');

BaseView.register({
    _init: function _init() {
        var nodes = {
            username: $('#username'),
            password: $('#password'),
            login: $('#login')
        };

        nodes.login.on('click', function () {
            Model.login({
                data: {
                    username: nodes.username.val().trim(),
                    password: nodes.password.val().trim()
                }
            }, {
                success: function success(data) {
                    console.log(data);
                    _APP.Toast.show('登录成功', function () {
                        location.href = '/users';
                    });
                }
            });
        });
    }
});

},{"./io/model.js":1,"core-baseview":4}],4:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @fileoverview 页面基本view类。最终业务项目中落地页的js都必须引用此js或其子类
 * @version 1.0 | 2016-12-20 版本信息
 * @author Zhang Mingrui | 592044573@qq.com
 * @return
 * */

var Alert = require('../ui/ui.alert.js'),
    Confirm = require('../ui/ui.confirm.js'),
    Toast = require('../ui/ui.toast.js'),
    Loading = require('../ui/ui.loading.js'),
    Tool = require('libutil-tool');

var BaseView = function () {
    function BaseView() {
        _classCallCheck(this, BaseView);

        this.name = 'zmrdlb';
        //绑定一些常用的组件到全局变量
        window._APP = {};
        _APP.Alert = Alert;
        _APP.Confirm = Confirm;
        _APP.Toast = Toast;
        _APP.Loading = Loading;
        _APP.Tool = Tool;
    }

    _createClass(BaseView, [{
        key: 'init',
        value: function init() {
            this._init();
        }

        /**
         * 注册一个页面
         * @param  {Object} opt 里面配置的所有方法都派生给BaseView的实例
         * {
         *      _init: 此方法必须有，页面初始化执行
         * }
         * @return {instance of BaseView}     [description]
         */

    }], [{
        key: 'register',
        value: function register(opt) {
            var t = new this();
            for (var key in opt) {
                t[key] = opt[key];
            }

            //初始化
            t.init();

            return t;
        }
    }]);

    return BaseView;
}();

module.exports = BaseView;

},{"../ui/ui.alert.js":6,"../ui/ui.confirm.js":8,"../ui/ui.loading.js":10,"../ui/ui.toast.js":11,"libutil-tool":34}],5:[function(require,module,exports){
module.exports = "<div class=\"title js-title\">提示</div><div class=\"body js-content\"></div><div class=footer><a href=javascript:; class=js-ok>确定</a></div>";

},{}],6:[function(require,module,exports){
'use strict';

/**
 * @fileoverview 公共alert弹层
 * @version 1.0 | 2016-11-14 版本信息
 * @author Zhang Mingrui | 592044573@qq.com
 * @return
 * */

var AlertSingle = require('liblayer-alertSingle'),
    Csssuport = require('libutil-csssuport'),
    Tpl = require('./ui.alert.html');

AlertSingle.hidedestroy = false;

AlertSingle.setconfig({
    layer: {
        classname: 'coreui-g-layer coreui-g-warnlayer coreui-g-layer-alert',
        custom: {
            hide: function hide(layer) {
                layer.removeClass('show-up').addClass('hide-up');
                if (Csssuport.transition) {
                    setTimeout(function () {
                        layer.hide();
                        AlertSingle.destroy();
                    }, 300);
                } else {
                    layer.hide();
                    AlertSingle.destroy();
                }
            }
        }
    },
    mask: {
        classname: 'coreui-g-mask',
        opacity: Csssuport.transition ? 0 : 0.6,
        custom: {
            hide: function hide(mask) {
                if (Csssuport.transition) {
                    mask.css('opacity', 0);
                    setTimeout(function () {
                        mask.hide();
                    }, 300);
                } else {
                    mask.hide();
                }
            },
            show: function show(mask) {
                if (Csssuport.transition) {
                    mask.show().css('opacity', 0.6);
                } else {
                    mask.show();
                }
            }
        }
    },
    alert: {
        frametpl: Tpl
    }
});

AlertSingle.createcal.add(function (layerobj) {
    layerobj.layer.addClass('hide-up');

    layerobj.pos.poscal.add(function () {
        layerobj.layer.removeClass('hide-up').addClass('show-up');
    });
});

module.exports = AlertSingle;

},{"./ui.alert.html":5,"liblayer-alertSingle":17,"libutil-csssuport":27}],7:[function(require,module,exports){
module.exports = "<div class=\"title js-title\">提示</div><div class=\"body js-content\"></div><div class=footer><a href=javascript:; class=\"cancel js-cancel\">取消</a> <a href=javascript:; class=js-ok>确定</a> <i class=split></i></div>";

},{}],8:[function(require,module,exports){
'use strict';

/**
 * @fileoverview 公共confirm弹层
 * @version 1.0 | 2017-01-06 版本信息
 * @author Zhang Mingrui | 592044573@qq.com
 * @return
 * */

var ConfirmSingle = require('liblayer-confirmSingle'),
    Csssuport = require('libutil-csssuport'),
    Tpl = require('./ui.confirm.html');

ConfirmSingle.hidedestroy = false;

ConfirmSingle.setconfig({
    layer: {
        classname: 'coreui-g-layer coreui-g-warnlayer coreui-g-layer-confirm',
        custom: {
            hide: function hide(layer) {
                layer.removeClass('show-up').addClass('hide-up');
                if (Csssuport.transition) {
                    setTimeout(function () {
                        layer.hide();
                        ConfirmSingle.destroy();
                    }, 300);
                } else {
                    layer.hide();
                    ConfirmSingle.destroy();
                }
            }
        }
    },
    mask: {
        classname: 'coreui-g-mask',
        opacity: Csssuport.transition ? 0 : 0.6,
        custom: {
            hide: function hide(mask) {
                if (Csssuport.transition) {
                    mask.css('opacity', 0);
                    setTimeout(function () {
                        mask.hide();
                    }, 300);
                } else {
                    mask.hide();
                }
            },
            show: function show(mask) {
                if (Csssuport.transition) {
                    mask.show().css('opacity', 0.6);
                } else {
                    mask.show();
                }
            }
        }
    },
    confirm: {
        frametpl: Tpl
    }
});

ConfirmSingle.createcal.add(function (layerobj) {
    layerobj.layer.addClass('hide-up');

    layerobj.pos.poscal.add(function () {
        layerobj.layer.removeClass('hide-up').addClass('show-up');
    });
});

module.exports = ConfirmSingle;

},{"./ui.confirm.html":7,"liblayer-confirmSingle":22,"libutil-csssuport":27}],9:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @fileoverview 业务基本弹层类，填充了一些样式。业务所有自定义弹层将继承此类
 * @version 1.0 | 2016-11-14 版本信息
 * @author Zhang Mingrui | 592044573@qq.com
 * @return
 * */

var BombLayer = require('liblayer-bombLayer'),
    Csssuport = require('libutil-csssuport');

var UILayer = function (_BombLayer) {
    _inherits(UILayer, _BombLayer);

    /**
    * 弹层类——创建并添加到指定容器中
     * @param {JSON} config 弹层配置参数 ，不是必填项
     * 		{
     * 	       container {Element} 存放弹层的容器。可不指定，默认弹层存放于body中的一个动态生成的div里
     * 	       pos:{}, //定位参数，具体说明可见方法layer/positionBomb中的config说明
     *         layer: {}, //弹层信息参数，具体说明可见方法layer/layer中的config说明
     * 		   mask: { //遮罩信息参数，具体说明可见方法layer/mask中的config说明。在此基础上进行以下扩展
     * 			  mask: true, //是否创建遮罩
     *            cmlhide: false //点击遮罩是否关闭弹层
     * 		   }
     *      }
    */
    function UILayer(config) {
        _classCallCheck(this, UILayer);

        //添加自定义参数
        config = $.extend(true, {
            layer: {
                classname: 'coreui-g-layer',
                show: false,
                custom: {
                    hide: function hide(layer) {
                        layer.removeClass('show-up').addClass('hide-up');
                        if (Csssuport.transition) {
                            setTimeout(function () {
                                layer.hide();
                                _this.hideaftercal.fire(); //层隐藏后回调
                            }, 300);
                        } else {
                            layer.hide();
                            _this.hideaftercal.fire(); //层隐藏后回调
                        }
                    }
                }
            },
            mask: {
                classname: 'coreui-g-mask',
                opacity: Csssuport.transition ? 0 : 0.6,
                custom: {
                    hide: function hide(mask) {
                        if (Csssuport.transition) {
                            mask.css('opacity', 0);
                            setTimeout(function () {
                                mask.hide();
                            }, 300);
                        } else {
                            mask.hide();
                        }
                    },
                    show: function show(mask) {
                        if (Csssuport.transition) {
                            mask.show().css('opacity', 0.6);
                        } else {
                            mask.show();
                        }
                    }
                }
            }
        }, config || {});

        var _this2 = _possibleConstructorReturn(this, (UILayer.__proto__ || Object.getPrototypeOf(UILayer)).call(this, config));

        var _this = _this2;
        var _layer = _this2.layer;

        _layer.addClass('hide-up');

        _this2.pos.poscal.add(function () {
            _layer.removeClass('hide-up').addClass('show-up');
        });
        return _this2;
    }

    _createClass(UILayer, [{
        key: 'hide',
        value: function hide() {
            if (this.isshow()) {
                this.hidebeforecal.fire(); //层隐藏前回调
                this.mask && this.mask.hide();
                this._hide();
            }
        }
    }]);

    return UILayer;
}(BombLayer);

module.exports = UILayer;

},{"liblayer-bombLayer":19,"libutil-csssuport":27}],10:[function(require,module,exports){
'use strict';

/**
 * @fileoverview loading 提示层
 * @version 1.0 | 2016-01-06 版本信息
 * @author Zhang Mingrui | 592044573@qq.com
 * @return
 * */
var UILayer = require('./ui.layer.js'),
    WorkerControl = require('libutil-workerControl');

var workerControl = new WorkerControl();

function createLoading(worker) {
    worker.loading = new UILayer({
        layer: {
            classname: 'coreui-g-layer coreui-g-layer-loading'
        },
        mask: {
            bgcolor: 'transparent' //背景色
        }
    });

    worker.loading.hideaftercal.add(function () {
        worker.loading.destroy();
        worker.loading = null;
    });

    return worker.loading;
}

module.exports = {
    show: function show() {
        var loading = createLoading(workerControl.get());
        loading.show();
    },
    hide: function hide() {
        var worker = workerControl.end();
        if (worker) {
            worker.loading.hide();
        }
    }
};

},{"./ui.layer.js":9,"libutil-workerControl":37}],11:[function(require,module,exports){
'use strict';

/**
 * @fileoverview toast 提示层
 * @version 1.0 | 2016-01-06 版本信息
 * @author Zhang Mingrui | 592044573@qq.com
 * @return
 * */
var UILayer = require('./ui.layer.js'),
    WorkerControl = require('libutil-workerControl');

var workerControl = new WorkerControl();

function createToast(worker) {
    worker.toast = new UILayer({
        layer: {
            classname: 'coreui-g-layer coreui-g-layer-toast'
        },
        mask: {
            bgcolor: '#fff' //背景色
        }
    });

    worker.toast.hideaftercal.add(function () {
        worker.toast.destroy();
        worker.toast = null;
    });

    return worker.toast;
}

module.exports = {
    show: function show(content, hideaftercal) {
        var toast = createToast(workerControl.get());
        toast.setContent(content);
        toast.hideaftercal.add(function () {
            if (typeof hideaftercal == 'function') {
                hideaftercal();
            }
        });
        toast.show();
        setTimeout(function () {
            toast.hide();
        }, 2000);
    }
};

},{"./ui.layer.js":9,"libutil-workerControl":37}],12:[function(require,module,exports){
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

},{"./ioconfig.js":13,"./storage.js":14}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @fileoverview alert类，继承自layer/bombLayer。添加“确定按钮”事件回调
 * 如果弹层中有以下属性的节点
 * node="close"，点击则会关闭弹层,并触发hidecal通知。
 * node="ok"，点击则触发“确定按钮”事件、关闭弹层，并触发okcal和hidecal通知。
 * @version 1.0.0 | 2015-09-14 版本信息
 * @author Zhang Mingrui | 592044573@qq.com
 * @example
 * 	 const Alert = require('liblayer-alert');
 *
 * 	 var layer = new Alert({
 * 	 	alert: {
 * 			frametpl: [ //弹层基本模板
				'<div class="js-title"></div>',
				'<div class="js-content"></div>',
				'<div><a href="javascript:;" class="js-ok">好的</a></div>'
			].join('')
 *      }
 *   });
 *   layer.showcal.add(function(type){switch(type){case 'before':console.log('层显示前');break; case 'after':console.log('层显示后');break;}});
 *   layer.hidecal.add(function(type){switch(type){case 'before':console.log('层隐藏前');break; case 'after':console.log('层隐藏后');break;}});
 *   layer.okcal.add(function(e){console.log('点击了确定')});
 *   layer.setMyContent('设置node="content"节点的innerHTML');
 *   var nodeArr = layer.getNodes(['title']); // 获取class="js-title"的节点
 *   nodeArr.title.html('内容区html');
 *   layer.contentnode; //内容区node="content"节点
 *   layer.show(); //显示层
 *   layer.hide(); //隐藏层
 *   layer.layer; //层dom节点对象
 *   layer.container; //浮层容器
 *   layer.destroy(); //销毁层
 * */
var BombLayer = require('./bombLayer.js'),
    Tpl = require('./tpl.js');

var Alert = function (_BombLayer) {
  _inherits(Alert, _BombLayer);

  /**
   * alert类
      * @param {Object} config 参数同layer/bombLayer里面的config,在此基础上增加如下默认配置
      * {
      * 	  *alert: {
      * 		 *frametpl {String} alert基本模板。要求请详见layer/tpl里面alert项的要求
      *    }
      * }
   */
  function Alert(config) {
    _classCallCheck(this, Alert);

    var opt = $.extend(true, {
      alert: {
        frametpl: Tpl.alert //alert弹层基本模板。要求请详见layer/tpl里面alert项的要求
      }
    }, config);

    var _this = _possibleConstructorReturn(this, (Alert.__proto__ || Object.getPrototypeOf(Alert)).call(this, opt));

    _this.setContent(opt.alert.frametpl);
    _this.contentnode = _this.layer.find('.js-content'); //内容区节点
    _this.okcal = $.Callbacks();
    //事件绑定
    _this.layer.on('click.lib', '.js-ok', function (e) {
      e.preventDefault();
      _this.okcal.fire(e);
      _this.hide();
    });
    return _this;
  }
  /**
      * 设置alert内容区具有[node="content"]属性的节点的html
      * @param {String} html
      */


  _createClass(Alert, [{
    key: 'setMyContent',
    value: function setMyContent(html) {
      if (typeof html == 'string' && this.contentnode.length > 0) {
        this.contentnode.html(html);
      }
    }
    /**
     * 组件销毁
     */

  }, {
    key: 'destroy',
    value: function destroy() {
      this.layer.off('click.lib', '.js-ok');
      _get(Alert.prototype.__proto__ || Object.getPrototypeOf(Alert.prototype), 'destroy', this).call(this);
      this.contentnode = null;
      this.okcal = null;
    }
  }]);

  return Alert;
}(BombLayer);

module.exports = Alert;

},{"./bombLayer.js":19,"./tpl.js":26}],16:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
* @fileoverview alert的工厂控制器，继承baseControl
* 应用场景：针对简单alert弹层，频繁更改弹层里某些节点的内容，以及更改点击"确定"按钮后的回调事件
* 如果是更复杂的交互建议使用layers.alert或layers.bombLayer
* @version 1.0.0 | 2016-01-26 版本信息
* @author Zhang Mingrui | 592044573@qq.com
* @example
* const AlertControl = require('liblayer-alertControl');
*
	var curlayer = new AlertControl();
	curlayer.setconfig({
		alert: {
			frametpl: [
			    '<div class="js-title"></div>',
				'<div class="js-content"></div>',
				'<div><a href="javascript:;" class="js-ok">好的</a></div>'
			].join('')
		}
	});
	curlayer.show({
           content: '您还未登陆'
       },{
           ok: function(){
               console.log('点击好的');
           }
       });
       curlayer.getlayerobj()； //layer/alert类对象
* */
var Alert = require('./alert.js'),
    BaseControl = require('./baseControl.js');

/**
* alert工厂控制器
*/

var AlertControl = function (_BaseControl) {
    _inherits(AlertControl, _BaseControl);

    function AlertControl(hidedestroy) {
        _classCallCheck(this, AlertControl);

        var _this = _possibleConstructorReturn(this, (AlertControl.__proto__ || Object.getPrototypeOf(AlertControl)).call(this, hidedestroy));

        _this._okcal = function () {}; //点击ok的回调私有存储器
        _this._funarr = ['ok']; //可控制的回调方法名
        return _this;
    }
    /**
    * 获取alert弹层
    * @param {Boolean} reset 是否重新渲染模板。默认为false
    */


    _createClass(AlertControl, [{
        key: 'getlayerobj',
        value: function getlayerobj(reset) {
            var _this2 = this;

            if (this._layerobj == null) {
                this._layerobj = new Alert(this._defaultopt);
                this._layerobj.okcal.add(function (e) {
                    _this2._okcal();
                });
                this._addcall();
            } else {
                if (reset) {
                    this._layerobj.setContent(this._defaultopt.alert.frametpl);
                }
            }
            return this._layerobj;
        }
        /**
        * 销毁alert弹层
        */

    }, {
        key: 'destroy',
        value: function destroy() {
            _get(AlertControl.prototype.__proto__ || Object.getPrototypeOf(AlertControl.prototype), 'destroy', this).call(this);
            this._okcal = function () {};
        }
    }]);

    return AlertControl;
}(BaseControl);

module.exports = AlertControl;

},{"./alert.js":15,"./baseControl.js":18}],17:[function(require,module,exports){
'use strict';

/**
* @fileoverview alert类单体控制器，一般用于简单的confirm信息提示。
* 注意：该alert控制的对象及dom在全局中唯一存在，如果想要创建多个，请使用liblayers/alert或liblayers/alertControl
* @version 1.0.0 | 2015-09-14 版本信息
* @author Zhang Mingrui | 592044573@qq.com
* @example
*      const AlertSingle = require('liblayer-alertSingle');
*
	AlertSingle.setconfig({
		alert: {
			frametpl: [
			    '<div class="js-title"></div>',
				'<div class="js-content"></div>',
				'<div><a href="javascript:;" class="js-ok">好的</a></div>'
			].join('')
		}
	});
	AlertSingle.getlayerobj()； //layer/alert类对象
	AlertSingle.show({
           content: '您还未登陆'
       },{
           ok: function(){
               console.log('点击好的');
           }
       });
* */

var AlertControl = require('./alertControl.js');

module.exports = new AlertControl();

},{"./alertControl.js":16}],18:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
* @fileoverview 基本的弹层工厂控制器，不可直接使用，只可子类继承后使用。
* 应用场景：针对频繁更改弹层里某些节点的内容，以及更改点击按钮后的回调事件。
* @version 1.0.0 | 2016-01-26 版本信息
* @author Zhang Mingrui | 592044573@qq.com
* @example
*      const BaseControl = require('liblayer-baseControl');
*
* */

var Tool = require('libutil-tool');

var BaseControl = function () {
    /**
     * 工厂模型控制器
     * @param {Boolean} hidedestroy 弹层关闭时，是否走系统默认的销毁操作。默认为true
     */
    function BaseControl(hidedestroy) {
        _classCallCheck(this, BaseControl);

        this._layerobj = null; //弹层对象
        this._defaultopt = {}; //默认config配置参数
        this._funarr = []; //会替换的回调方法的关键词。如['ok','cancel']
        this.createcal = $.Callbacks(); //弹层对象创建后的回调
        if (typeof hidedestroy != 'boolean') {
            hidedestroy = true;
        }
        this.hidedestroy = hidedestroy;
    }
    /**
    *  参数说明请参见子类使用的弹层类里面的config说明
    *  如alert.js。confirm.js
    */


    _createClass(BaseControl, [{
        key: 'setconfig',
        value: function setconfig(config) {
            this._defaultopt = config;
        }
        /**
        * 获取弹层对象，具体由子类实现
        */

    }, {
        key: 'getlayerobj',
        value: function getlayerobj() {}
        /**
        * 添加系统回调，由子类创建了弹层对象后调用
        */

    }, {
        key: '_addcall',
        value: function _addcall() {
            var _this = this;

            if (this.hidedestroy) {
                this._layerobj.hideaftercal.add(function () {
                    _this.destroy();
                });
            }
            this.createcal.fire(this._layerobj);
        }
        /**
        * 显示弹层
        * @param {Object} *txt 文案配置,选填。如果setconfig调用设置的模板中还有其他node="其他值"，
        *      如node="other" 则可自行扩展
        * {
        * 	 content {String} node="content"节点里面的html
        *   title {String} node="title"节点里面的html
        *   ok {String} node="ok"节点里面的html
        * }
        * @param {Object} cal 回调配置
        * {
        * 	 键值为_funarr中距离的关键词 {Function} 点击确定按钮后的回调
        * }
        */

    }, {
        key: 'show',
        value: function show(txt, cal) {
            if (!Tool.isObject(txt)) {
                throw new Error('baseControl-show方法txt参数必须是json对象');
            } else {
                if (Tool.isObject(cal)) {
                    var funname = this._funarr;
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = funname[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var curname = _step.value;

                            if (Tool.isFunction(cal[curname])) {
                                this['_' + curname + 'cal'] = cal[curname];
                            } else {
                                this['_' + curname + 'cal'] = function () {};
                            }
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }
                } else {
                    this._okcal = function () {};
                }
                //获取txt里面的键值
                var nodenamearr = [];
                for (var name in txt) {
                    nodenamearr.push(name);
                }
                this.getlayerobj(true);
                var nodearr = this._layerobj.getNodes(nodenamearr);
                for (var name in nodearr) {
                    Tool.isString(txt[name]) && nodearr[name].html(txt[name]);
                }
                this._layerobj.show();
            }
        }
        /**
         * 销毁弹层
         */

    }, {
        key: 'destroy',
        value: function destroy() {
            if (this._layerobj != null) {
                this._layerobj.destroy();
                this._layerobj = null;
            }
        }
    }]);

    return BaseControl;
}();

module.exports = BaseControl;

},{"libutil-tool":34}],19:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @fileoverview 弹层类，继承自layer/layer。默认居中定位，显示遮罩。（如果需其他特殊配置则参见参数说明）
 * 如果弹层中有以下属性的节点node="close"。则点击该节点会关闭弹层，并触发hidecal通知。
 * @version 1.0.0 | 2015-09-14 版本信息
 * @author Zhang Mingrui | 592044573@qq.com
 * @example
 * 	 const BombLayer = require('liblayer-bombLayer');
 *
 *   var layer = new BombLayer();
 *    layer.showbeforecal.add(function(){console.log('层显示前');});
 *   layer.hidebeforecal.add(function(){console.log('层隐藏前');});
 *   layer.showaftercal.add(function(){console.log('层显示后');});
 *   layer.hideaftercal.add(function(){console.log('层隐藏后');});
 *   layer.pos.poscal.add(function(){console.log('layer定位后回调')});
 *   layer.setContent('<div class="js-content"></div>'); //设置layer层里面的内容
 *   layer.getNodes(['content']); // 获取class="js-content"的节点
 *   layer.show(); //显示层
 *   layer.hide(); //隐藏层
 *   layer.layer; //层dom节点对象
 *   layer.container; //浮层容器
 *   layer.destroy(); //销毁层
 *
 * */

var Layer = require('./layer.js'),
    Mask = require('./mask.js'),
    PositionBomb = require('./positionBomb.js'),
    Tool = require('libutil-tool');

var BombLayer = function (_Layer) {
	_inherits(BombLayer, _Layer);

	/**
  * 弹层类——创建并添加到指定容器中
     * @param {JSON} config 弹层配置参数 ，不是必填项
     * 		{
     * 	       container {Element} 存放弹层的容器。可不指定，默认弹层存放于body中的一个动态生成的div里
     * 	       pos:{}, //定位参数，具体说明可见方法layer/positionBomb中的config说明
     *         layer: {}, //弹层信息参数，具体说明可见方法layer/layer中的config说明
     * 		   mask: { //遮罩信息参数，具体说明可见方法layer/mask中的config说明。在此基础上进行以下扩展
     * 			  mask: true, //是否创建遮罩
     *            cmlhide: false //点击遮罩是否关闭弹层
     *            //其他查看mask.js中的配置
     * 		   }
     *      }
  */
	function BombLayer(config) {
		_classCallCheck(this, BombLayer);

		var _newcontainer = false;
		if (!config.container || config.container.length == 0) {
			config.container = $('<div></div>').appendTo('body');
			_newcontainer = true; //说明是新创建的容器
		}
		config = config || {};
		//初始化基类

		var _this = _possibleConstructorReturn(this, (BombLayer.__proto__ || Object.getPrototypeOf(BombLayer)).call(this, config.container, config.layer));

		_this._newcontainer = _newcontainer;
		//创建定位类对象
		_this.pos = new PositionBomb({
			layer: _this.layer
		}, config.pos);
		//创建遮罩
		var maskopt = $.extend(true, {
			mask: true,
			cmlhide: false
		}, config.mask);
		if (maskopt.mask) {
			//如果创建遮罩
			_this.mask = new Mask(config.container, maskopt);
			if (maskopt.cmlhide) {
				//点击遮罩关闭
				_this.mask.clickcal.add(function (e) {
					_this.hide();
				});
			}
		}
		//事件绑定
		_this.layer.on('click.lib', '.js-close', function (e) {
			e.preventDefault();
			_this.hide();
		});
		return _this;
	}
	/**
  * 获取alert中具有node='指定名称'的节点列表。如果nodenamearr中指定的节点不存在，则不在结果中返回。举例
     * @param {Array} nodenamearr 如['content','ok']
     * @return {
     * 	   content: 获取的节点
     *     ok: 获取的节点
     * }
     * 如果content不存在，则只返回{ok}
  */


	_createClass(BombLayer, [{
		key: 'getNodes',
		value: function getNodes(nodenamearr) {
			var _this2 = this;

			var result = {},
			    that = this;
			if (Tool.isArray(nodenamearr)) {
				$.each(nodenamearr, function (index, name) {
					var node = _this2.layer.find('.js-' + name);
					if (node.length > 0) {
						result[name] = node;
					}
				});
			}
			return result;
		}
		/**
   * 显示弹层
   */

	}, {
		key: 'show',
		value: function show() {
			if (!this.isshow()) {
				this.showbeforecal.fire(); //层显示前回调
				this.mask && this.mask.show();
				this._show();
				this.pos.setpos();
				this.showaftercal.fire(); //层显示后回调
			}
		}
		/**
   * 隐藏弹层
   */

	}, {
		key: 'hide',
		value: function hide() {
			if (this.isshow()) {
				this.hidebeforecal.fire(); //层隐藏前回调
				this.mask && this.mask.hide();
				this._hide();
				this.hideaftercal.fire(); //层隐藏后回调
			}
		}
		/**
   * 弹层销毁
   */

	}, {
		key: 'destroy',
		value: function destroy() {
			this.layer.off('click.lib', '.js-close');
			this.pos.destroy();
			if (this.mask) {
				this.mask.destroy();
			}
			var container = this.container;
			_get(BombLayer.prototype.__proto__ || Object.getPrototypeOf(BombLayer.prototype), 'destroy', this).call(this);
			if (this._newcontainer) {
				container.remove();
			}
			this._newcontainer = null;
		}
	}]);

	return BombLayer;
}(Layer);

module.exports = BombLayer;

},{"./layer.js":23,"./mask.js":24,"./positionBomb.js":25,"libutil-tool":34}],20:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @fileoverview confirm类，继承自layer/bombLayer。添加“确定按钮”和“取消按钮”事件回调
 * 如果弹层中有以下属性的节点
 * node="close"，点击则会关闭弹层,并触发hidecal通知。
 * node="ok"，点击则触发“确定按钮”事件，关闭弹层，并触发okcal和hidecal通知。
 * node="cancel" 点击触发“取消按钮”事件，关闭弹层，并触发cancelcal和hidecal通知。
 * @version 1.0.0 | 2015-09-16 版本信息
 * @author Zhang Mingrui | 592044573@qq.com
 * @example
 * 	 const Confirm = require('liblayer-confirm');
 *
 * 	 var layer = new Confirm({
 * 	 	confirm: {
 * 			frametpl: [ //弹层基本模板
				'<div class="js-title"></div>',
				'<div class="js-content"></div>',
				'<div><a href="javascript:;" class="js-ok">好的</a><a href="javascript:;" class="js-cancel">等下说</a></div>'
			].join('')
 *      }
 *   });
 *   layer.showcal.add(function(type){switch(type){case 'before':console.log('层显示前');break; case 'after':console.log('层显示后');break;}});
 *   layer.hidecal.add(function(type){switch(type){case 'before':console.log('层隐藏前');break; case 'after':console.log('层隐藏后');break;}});
 *   layer.okcal.add(function(e){console.log('点击了确定')});
 *   layer.cancelcal.add(function(e){console.log('点击了取消')});
 *   layer.setMyContent('设置node="content"节点的innerHTML');
 *   var nodeArr = layer.getNodes(['title']); // 获取class="js-title"的节点
 *   nodeArr.title.html('内容区html');
 *   layer.contentnode; //内容区node="content"节点
 *   layer.show(); //显示层
 *   layer.hide(); //隐藏层
 *   layer.layer; //层dom节点对象
 *   layer.container; //浮层容器
 *   layer.destroy(); //销毁层
 * */
var BombLayer = require('./bombLayer.js'),
    Tpl = require('./tpl.js');

var Confirm = function (_BombLayer) {
	_inherits(Confirm, _BombLayer);

	/**
  * confirm类
     * @param {Object} config 参数同layer/bombLayer里面的config,在此基础上增加如下默认配置
     * {
     * 	  *confirm: {
     * 		 *frametpl {String} confirm基本模板。要求请详见layer/tpl里面confirm项的要求
     *    }
     * }
  */
	function Confirm(config) {
		_classCallCheck(this, Confirm);

		var opt = $.extend(true, {
			confirm: {
				frametpl: Tpl.confirm //confirm弹层基本模板。要求请详见layer/tpl里面confirm项的要求
			}
		}, config);

		var _this = _possibleConstructorReturn(this, (Confirm.__proto__ || Object.getPrototypeOf(Confirm)).call(this, opt));

		_this.setContent(opt.confirm.frametpl);
		_this.contentnode = _this.layer.find('.js-content'); //内容区节点
		_this.okcal = $.Callbacks();
		_this.cancelcal = $.Callbacks();
		//事件绑定
		_this.layer.on('click.lib', '.js-ok', function (e) {
			e.preventDefault();
			_this.okcal.fire(e);
			_this.hide();
		});
		_this.layer.on('click.lib', '.js-cancel', function (e) {
			e.preventDefault();
			_this.cancelcal.fire(e);
			_this.hide();
		});
		return _this;
	}
	/**
  * 设置confirm内容区具有[node="content"]属性的节点的html
     * @param {String} html
  */


	_createClass(Confirm, [{
		key: 'setMyContent',
		value: function setMyContent(html) {
			if (typeof html == 'string' && this.contentnode.length > 0) {
				this.contentnode.html(html);
			}
		}
		/**
   * 组件销毁
   */

	}, {
		key: 'destroy',
		value: function destroy() {
			this.layer.off('click.lib', '.js-ok');
			this.layer.off('click.lib', '.js-cancel');
			_get(Confirm.prototype.__proto__ || Object.getPrototypeOf(Confirm.prototype), 'destroy', this).call(this);
			this.contentnode = null;
			this.okcal = null;
		}
	}]);

	return Confirm;
}(BombLayer);

module.exports = Confirm;

},{"./bombLayer.js":19,"./tpl.js":26}],21:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
* @fileoverview confirm的工厂控制器，集成baseControl
* 应用场景：针对简单confirm弹层，针对频繁更改弹层里某些节点的内容，以及更改点击"确定"、"取消"按钮后的回调事件
* 如果是更复杂的交互建议使用layers.confirm或layers.bombLayer
* @version 1.0.0 | 2016-01-26 版本信息
* @author Zhang Mingrui | 592044573@qq.com
* @example
* 		const ConfirmControl = require('liblayer-confirmControl');
*
	var curconfirm = new ConfirmControl();
	curconfirm.setconfig({
		confirm: {
			frametpl: [
				'<div class="js-content"></div>',
				'<div><a href="javascript:;" class="js-ok">好的</a><a href="javascript:;" class="js-cancel">等下说</a></div>'
			].join('')
		}
	});
	curconfirm.show({
	    content: '您还未登陆'
	},{
	    ok: function(){
               console.log('点击好的');
           },
		cancel: function(){
			console.log('点击等下说');
		}
	});
	curconfirm.getlayerobj()； //layer/confirm类对象
* */

var Confirm = require('./confirm.js'),
    BaseControl = require('./baseControl.js');

var ConfirmControl = function (_BaseControl) {
	_inherits(ConfirmControl, _BaseControl);

	/**
     * confirm工厂控制器
     */
	function ConfirmControl(hidedestroy) {
		_classCallCheck(this, ConfirmControl);

		var _this = _possibleConstructorReturn(this, (ConfirmControl.__proto__ || Object.getPrototypeOf(ConfirmControl)).call(this, hidedestroy));

		_this._okcal = function () {}; //点击ok的回调私有存储器
		_this._cancelcal = function () {}; //点击cancel的回调私有存储器
		_this._funarr = ['ok', 'cancel']; //可控制的回调方法名
		return _this;
	}
	/**
  * 获取confirm弹层
  * @param {Boolean} reset 是否重新渲染模板。默认为false
  */


	_createClass(ConfirmControl, [{
		key: 'getlayerobj',
		value: function getlayerobj(reset) {
			var _this2 = this;

			if (this._layerobj == null) {
				this._layerobj = new Confirm(this._defaultopt);
				this._layerobj.okcal.add(function (e) {
					_this2._okcal();
				});
				this._layerobj.cancelcal.add(function (e) {
					_this2._cancelcal();
				});
				this._addcall();
			} else {
				if (reset) {
					this._layerobj.setContent(this._defaultopt.confirm.frametpl);
				}
			}
			return this._layerobj;
		}
		/**
   * 销毁alert弹层
   */

	}, {
		key: 'destroy',
		value: function destroy() {
			_get(ConfirmControl.prototype.__proto__ || Object.getPrototypeOf(ConfirmControl.prototype), 'destroy', this).call(this);
			this._okcal = function () {};
			this._cancelcal = function () {};
		}
	}]);

	return ConfirmControl;
}(BaseControl);

module.exports = ConfirmControl;

},{"./baseControl.js":18,"./confirm.js":20}],22:[function(require,module,exports){
'use strict';

/**
* @fileoverview confrim类单体控制器，一般用于简单的confirm信息提示。
* 注意：该confrim控制的对象及dom在全局中唯一存在，如果想要创建多个，请使用liblayers/confirm或liblayers/confirmControl
* @version 1.0.0 | 2015-09-16 版本信息
* @author Zhang Mingrui | 592044573@qq.com
* @example
*      const ConfirmSingle = require('liblayer-confirmSingle');
*
	ConfirmSingle.setconfig({
		confirm: {
			frametpl: [
				'<div class="js-content"></div>',
				'<div><a href="javascript:;" class="js-ok">好的</a><a href="javascript:;" class="js-cancel">等下说</a></div>'
			].join('')
		}
	});
	ConfirmSingle.show({
	    content: '您还未登陆'
	},{
	    ok: function(){
               console.log('点击好的');
           },
		cancel: function(){
			console.log('点击等下说');
		}
	});
       ConfirmSingle.getlayerobj()； //layer/confirm类对象
* */
var ConfrimControl = require('./confirmControl.js');

module.exports = new ConfrimControl();

},{"./confirmControl.js":21}],23:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @fileoverview 浮层基类
 * @version 1.0.0 | 2015-08-19 版本信息
 * @author Zhang Mingrui | 592044573@qq.com
 * @return 浮层基类
 * @example
 *
 * 	const Layer = require('liblayer-layer');
 *
 * 	 var layer = new Layer($('body'));
 *   layer.showbeforecal.add(function(){console.log('层显示前');});
 *   layer.hidebeforecal.add(function(){console.log('层隐藏前');});
 *   layer.showaftercal.add(function(){console.log('层显示后');});
 *   layer.hideaftercal.add(function(){console.log('层隐藏后');});
 *   layer.hide(); //隐藏层
 *   layer.layer; //层dom节点对象
 *   layer.container; //浮层容器
 *   layer.destroy(); //销毁层
 * */

var Layer = function () {
  /**
   * 浮层基类——创建并添加到指定容器中
      * @param {Element} container 浮层存放容器，默认为$('body')
      * @param {JSON} config 层配置参数，默认信息及说明如下opt代码处
   */
  function Layer(container, config) {
    _classCallCheck(this, Layer);

    container = container || $('body');
    var opt = $.extend(true, {
      classname: '', //layer的class
      zIndex: 2, //layer的z-index
      position: 'absolute', //layer的position。默认是absolute
      show: false, //创建层后默认是否显示
      custom: {
        show: null, //用户自定义显示层的方法。如果此方法存在，则不用默认的显示层方法
        hide: null //用户自定义隐藏层的方法。如果此方法存在，则不用默认的隐藏层方法
      }
    }, config || {});
    var cssstr = 'position:' + opt.position + ';' + (opt.show ? '' : 'display:none;') + 'z-index:' + opt.zIndex + ';';
    this.container = container; //浮层容器
    this.layer = $('<div' + (opt.classname == '' ? '' : ' class="' + opt.classname + '"') + ' style="' + cssstr + '"></div>');
    this.layer.appendTo(container);
    this.showbeforecal = $.Callbacks(); //层显示前的回调
    this.showaftercal = $.Callbacks(); //层显示后的回调
    this.hidebeforecal = $.Callbacks(); //层隐藏前的回调
    this.hideaftercal = $.Callbacks(); //层隐藏后的回调
    this.custom = opt.custom; //自定义方法
  }
  /**
   * 设置层内容
  	 * @param {Element|String} *content html字符串或者节点对象
   */


  _createClass(Layer, [{
    key: 'setContent',
    value: function setContent(content) {
      if (arguments.length == 0) {
        return;
      }
      if (typeof content == 'string') {
        this.layer.html(content);
      } else {
        this.layer.html('').append(content);
      }
    }
    /**
     * 显示层。
     */

  }, {
    key: '_show',
    value: function _show() {
      if (typeof this.custom.show == 'function') {
        this.custom.show(this.layer);
      } else {
        this.layer.show();
      }
    }
    /**
     * 显示层。会触发showcal回调
     */

  }, {
    key: 'show',
    value: function show() {
      if (!this.isshow()) {
        this.showbeforecal.fire(); //层显示前回调
        this._show();
        this.showaftercal.fire(); //层显示后回调
      }
    }
    /**
     * 隐藏层。
     */

  }, {
    key: '_hide',
    value: function _hide() {
      if (typeof this.custom.hide == 'function') {
        this.custom.hide(this.layer);
      } else {
        this.layer.hide();
      }
    }
    /**
     * 隐藏层。会触发hidecal回调
     */

  }, {
    key: 'hide',
    value: function hide() {
      if (this.isshow()) {
        this.hidebeforecal.fire(); //层隐藏前回调
        this._hide();
        this.hideaftercal.fire(); //层隐藏后回调
      }
    }
    /**
     * 销毁层
     */

  }, {
    key: 'destroy',
    value: function destroy() {
      if (this.layer != null) {
        this.layer.remove();
        this.layer = null;
        this.showcal = null;
        this.hidecal = null;
        this.custom = null;
        this.container = null;
      }
    }
    /**
     * 判断层是否显示
     * @return {Boolean} true|false
     */

  }, {
    key: 'isshow',
    value: function isshow() {
      return this.layer.css('display') != 'none';
    }
  }]);

  return Layer;
}();

module.exports = Layer;

},{}],24:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @fileoverview 遮罩类——创建遮罩并进行相关控制
 * @version 1.0 | 2015-08-15 版本信息
 * @author Zhang Mingrui | 592044573@qq.com
 * @return 遮罩对象
 * @example
 * 	 const Mask = require('liblayer-mask');
 *
 * 	 var mask = new $mask($('body'));
 *   mask.show(); //显示遮罩
 *   mask.hide(); //隐藏遮罩
 *   mask.mask; //遮罩dom节点对象
 *   mask.container; //遮罩容器
 *   mask.destroy(); //销毁遮罩
 *   mask.clickcal.add(function(e){
 * 	    console.log('遮罩被点击');
 *   });
 * */

var PositionBomb = require('./positionBomb.js');

var Mask = function () {
  /**
   * 遮罩类——创建遮罩dom并添加到指定容器中
   * @param {Element} container 遮罩存放容器，默认为$('body')
   * @param {JSON} config 遮罩配置参数，默认信息及说明如下opt代码处
   */
  function Mask(container, config) {
    var _this = this;

    _classCallCheck(this, Mask);

    container = container || $('body');
    var opt = $.extend({
      classname: '', //mask的class
      bgcolor: '#000', //背景色
      zIndex: 1, //遮罩z-index
      opacity: 0.6, //遮罩透明度
      show: false, //创建遮罩后默认是否显示
      custom: {
        show: null, //用户自定义显示层的方法。如果此方法存在，则不用默认的显示层方法
        hide: null //用户自定义隐藏层的方法。如果此方法存在，则不用默认的隐藏层方法
      }
    }, config || {});
    var cssstr = 'position:absolute;background:' + opt.bgcolor + ';' + (opt.show ? '' : 'display:none;') + 'z-index:' + opt.zIndex + ';';
    this.container = container; //遮罩容器
    this.mask = $('<div' + (opt.classname == '' ? '' : ' class="' + opt.classname + '"') + ' style="' + cssstr + '"></div>');
    this.mask.appendTo(container);
    this.mask.css('opacity', opt.opacity);
    this.custom = opt.custom; //自定义方法
    this.pos = new PositionBomb({ layer: this.mask }, { mode: 'full' });
    //绑定事件
    this.clickcal = $.Callbacks(); //遮罩点击后的回调
    this.mask.on('click.lib', function (e) {
      _this.clickcal.fire(e);
    });
  }
  /**
   * 显示遮罩
   */


  _createClass(Mask, [{
    key: 'show',
    value: function show() {
      if (typeof this.custom.show == 'function') {
        this.custom.show(this.mask);
      } else {
        this.mask.show();
      }
      this.pos.setpos();
    }
    /**
     * 隐藏遮罩
     */

  }, {
    key: 'hide',
    value: function hide() {
      if (typeof this.custom.hide == 'function') {
        this.custom.hide(this.mask);
      } else {
        this.mask.hide();
      }
    }
    /**
     * 销毁遮罩
     */

  }, {
    key: 'destroy',
    value: function destroy() {
      if (this.mask != null) {
        this.mask.off('click.lib');
        this.mask.remove();
        this.mask = null;
        this.pos.destroy();
        this.pos = null;
        this.clickcal = null;
      }
    }
  }]);

  return Mask;
}();

module.exports = Mask;

},{"./positionBomb.js":25}],25:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @fileoverview 弹层定位方法
 * 		注意：调用此方法前，必须是待定位层的display不为null的情况下
 * @version 1.0 | 2015-08-15 版本信息
 * @author Zhang Mingrui | 592044573@qq.com
 * @return 弹层定位方法
 * @example
 * 	 const PositionBomb = require('liblayer-positionBomb');
 *
 * 	 var pos = new PositionBomb({layer:层dom节点});
 * 	 pos.poscal.add(function(){console.log('layer定位后回调')});
 * */

var Winscroll = require('libutil-winscroll'),
    Scroll = require('libutil-scroll'),
    Winresize = require('libutil-winresize'),
    Resize = require('libutil-resize');

/**
 * 定位算法
 */
function _setpos(domopt, posopt) {
	var cssopt = {},
	    layer = domopt.layer,
	    offcon = domopt.offcon;
	layer.css('position', domopt.position);
	var marginLeft = 0,
	    marginTop = 0;
	if (domopt.position == 'absolute' && posopt.fixed) {
		marginLeft = offcon.scrollLeft();
		marginTop = offcon.scrollTop();
	}
	switch (posopt.mode) {
		case 'c':
			//居中定位
			marginLeft -= Math.max(layer.width(), posopt.minwidth) / 2 + posopt.offset[0];
			marginTop -= Math.max(layer.height(), posopt.minheight) / 2 + posopt.offset[1];
			cssopt.top = '50%';
			cssopt.left = '50%';
			break;
		case 'full':
			//满屏定位，占满整个定位容器。本来不设置width和height，设置了right和bottom。但是偶发margin不起作用，此时读取的元素尺寸为0.
			cssopt.width = '100%';
			cssopt.height = '100%';
			cssopt.top = '0';
			cssopt.left = '0';
			break;
	}
	cssopt.marginLeft = marginLeft + 'px';
	cssopt.marginTop = marginTop + 'px';
	if (typeof posopt.custompos == 'function') {
		posopt.custompos(cssopt);
	} else {
		layer.css(cssopt);
	}
}

var Position = function () {
	/**
  * 定位类
     * @param {JSON} doms 定位dom相关信息
     * 		{
     * 			layer: null //{JQueryElement|String节点选择器} 待定位层节点
     *      }
     * @param {JSON} config 层定位配置参数，默认信息及说明如下posopt代码处
  */
	function Position(doms, config) {
		_classCallCheck(this, Position);

		//参数检测与设置
		if (arguments.length == 0) {
			throw new Error('必须传入相关定位的dom参数');
		}
		var domopt = $.extend({
			layer: null, //待定位层节点
			offpage: false //说明相对于当前页面定位
		}, doms || {});
		if (domopt.layer && typeof domopt.layer == 'string') {
			domopt.layer = $(domopt.layer);
		}
		if (!domopt.layer || domopt.layer.length == 0) {
			throw new Error('传入的定位层节点无效');
		}
		var posopt = $.extend({
			fixed: true, //是否将弹层始终定位在可视窗口区域，默认为true
			mode: 'c', //定位模式，枚举。c:中间
			offset: [0, 0], //定义后偏移尺寸 [x轴,y轴]。对于mode是full的模式无效
			sizechange: false, //当mode是c时，offsetParent resize时，待定位层的大小是否会改变
			minwidth: 0, //定位计算时，待定位层layer的最小宽度
			minheight: 0, //定位计算时，待定位层layer的最小高度
			custompos: null //用户自定义定位方法。如果声明此方法，则不会使用系统默认的方法设置pos的定位参数，而是把定位参数pos传递给此方法
		}, config || {});
		this.poscal = $.Callbacks(); //setpos后的回调

		var that = this;
		//初步检测定位参考容器
		domopt.offcon = domopt.layer.offsetParent();
		var tagname = domopt.offcon.get(0).tagName.toLowerCase();
		var listencall = {
			call: function call() {
				that.setpos();
			}
		};
		var islisscroll = false; //是否监听scroll事件
		var islisresize = false; //是否监听resize事件
		if (tagname == 'body' || tagname == 'html') {
			//说明相对于页面定位
			domopt.offcon = $('body');
			domopt.offpage = true;
		}
		if (domopt.offpage && posopt.fixed) {
			//如果定位容器是当前页面、固定定位、可使用fixed定位。则用fixed定位
			domopt.position = 'fixed';
		} else {
			domopt.position = 'absolute';
			if (posopt.fixed) {
				//如果固定定位，则监听scroll事件
				islisscroll = true;
				if (domopt.offpage) {
					Winscroll.listen(listencall);
				} else {
					var scroll = new Scroll(domopt.offcon);
					scroll.listen(listencall);
				}
			}
		}
		//说明mode是c时，offsetParent resize时，待定位层的大小会改变，则监听resize事件
		if (posopt.mode == 'c' && posopt.sizechange) {
			islisresize = true;
			if (domopt.offpage) {
				Winresize.listen(listencall);
			} else {
				var resize = new Resize(domopt.offcon);
				resize.listen(listencall);
			}
		}
		this.domopt = domopt; //dom参数
		this.posopt = posopt; //定位参数
		this.destroy = function () {
			//组件销毁方法
			this.domopt = null;
			this.posopt = null;
			if (islisscroll) {
				if (domopt.offpage) {
					Winscroll.unlisten(listencall);
				} else {
					scroll.unlisten(listencall);
				}
			}
			if (islisresize) {
				if (domopt.offpage) {
					Winresize.unlisten(listencall);
				} else {
					resize.unlisten(listencall);
				}
			}
		};
	}
	/**
  * 进行定位
  * @return {Boolean} 是否定位成功
  */


	_createClass(Position, [{
		key: 'setpos',
		value: function setpos() {
			if (this.domopt.layer.css('display') == 'none' || this.domopt.offcon.css('display') == 'none') {
				return false;
			} else {
				_setpos(this.domopt, this.posopt);
				this.poscal.fire();
				return true;
			}
		}
	}]);

	return Position;
}();

module.exports = Position;

},{"libutil-resize":31,"libutil-scroll":33,"libutil-winresize":35,"libutil-winscroll":36}],26:[function(require,module,exports){
'use strict';

/**
 * alert弹层模板，必须具有指定的node属性
 */
exports.alert = ['<div>标题</div>', '<div node="content">内容区</div>', '<div><a href="javascript:;" class="js-ok">确定</a></div>'].join('');
/**
 * confirm弹层模板，必须具有指定的node属性
 */
exports.confirm = ['<div>标题</div>', '<div node="content">内容区</div>', '<div><a href="javascript:;" class="js-ok">确定</a><a href="javascript:;" class="js-cancel">取消</a></div>'].join('');

},{}],27:[function(require,module,exports){
'use strict';

/**
 * @fileoverview css支持情况判断。主要用于浏览器兼容
 * @version 1.0 | 2015-08-31 版本信息
 * @author Zhang Mingrui | 592044573@qq.com
 * @return
 * @example
 * 	 const Csssuport = require('libutil-csssuport');
 * 	 Csssuport.fixed;
 * */
var _div = document.createElement('div');
var result = {
  //是否支持position:fixed定位
  fixed: !('undefined' == typeof document.body.style.maxHeight || document.compatMode !== "CSS1Compat" && /msie/.test(navigator.userAgent.toLowerCase())),
  //是否支持transition
  transition: !(_div.style.transition == undefined)
};

module.exports = result;

},{}],28:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @fileoverview 对于高频触发的事件进行延迟处理类。应用场景：scroll和resize
 * @version 1.0.0 | 2015-08-27 版本信息
 * @author Zhang Mingrui | 592044573@qq.com
 * @return 处理类
 * @example
 * */

var PublisherS = require('./publisherS.js');

var Delayevt = function (_PublisherS) {
  _inherits(Delayevt, _PublisherS);

  /**
   * 对于高频触发的事件进行延迟处理。应用场景：scroll和resize
   * @param {JSON} config 配置
   */
  function Delayevt(config) {
    _classCallCheck(this, Delayevt);

    var _this = _possibleConstructorReturn(this, (Delayevt.__proto__ || Object.getPrototypeOf(Delayevt)).call(this));

    _this.timer = null;
    $.extend(_this, {
      delaytime: 200 //事件检测延迟时间，毫秒
    }, config || {});
    return _this;
  }
  /**
   * 开始检测
   */


  _createClass(Delayevt, [{
    key: 'start',
    value: function start() {
      var _this2 = this;

      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(function () {
        _this2.deliver();
      }, this.delaytime);
    }
  }]);

  return Delayevt;
}(PublisherS);

module.exports = Delayevt;

},{"./publisherS.js":30}],29:[function(require,module,exports){
'use strict';

/**
 * @fileoverview 根据设备给出相关业务事件的事件名称
 * @version 1.0.0 | 2015-09-14 版本信息
 * @author Zhang Mingrui | 592044573@qq.com
 * @example
 * */
var result = {
	//浏览器窗口resize事件
	winresize: function () {
		return 'onorientationchange' in window ? 'orientationchange' : 'resize';
	}(),
	//input或textarea输入框值改变的监听事件
	input: function () {
		if (/MSIE 9.0/.test(navigator.userAgent)) {
			//Ie9那个坑爹的，本来input和propertychange都支持，但是删除键无法触发这两个事件，所以得添加keyup
			return 'input keyup';
		}
		var node = document.createElement('input');
		if ('oninput' in node) {
			return 'input';
		} else if ('onpropertychange' in node) {
			return 'propertychange';
		} else {
			return 'keyup';
		}
	}()
};

module.exports = result;

},{}],30:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @fileoverview 订阅者模式——发布者类——精简版
 * 精简版：订阅者不限定必须是订阅者类Subscriber的对象
 * @version 1.0 | 2015-08-31 版本信息
 * @author Zhang Mingrui | 592044573@qq.com
 * @return 发布者类
 * @example
 * */
var Tool = require('./tool.js'),
    Rwcontroller = require('./rwcontroller.js');

var PublisherS = function () {
	function PublisherS() {
		_classCallCheck(this, PublisherS);

		this.subscribers = []; //记录订阅者对象
		this.rwcontrollder = new Rwcontroller();
	}
	/**
  * 参数有效性验证
  */


	_createClass(PublisherS, [{
		key: 'argsValidate',
		value: function argsValidate(data) {
			if (Tool.isObject(data) && Tool.isFunction(data.call)) {
				return true;
			}
			return false;
		}
		/**
   * 信息分发，通知所有订阅者
   * filter执行返回true，则执行call
   */

	}, {
		key: 'deliver',
		value: function deliver() {
			this.rwcontrollder.read(function (data) {
				$.each(this.subscribers, function (index, item) {
					if (item.filter() == true) {
						item.call.apply(window, data.args);
					}
				});
			}.bind(this, { args: arguments }));
		}
		/**
   * 订阅
  	 * @param {JSON} *subscriber 订阅者。格式同subscribers里的单独一项
  	 * {
  	 * 		*call: function(){} //信息分发的回调函数
  	 *      filter: function(){return true;} //过滤条件
  	 * }
   */

	}, {
		key: 'subscribe',
		value: function subscribe(subscriber) {
			if (this.argsValidate(subscriber)) {
				if (!Tool.isFunction(subscriber.filter)) {
					subscriber.filter = function () {
						return true;
					};
				}
				if ($.inArray(subscriber, this.subscribers) < 0) {
					this.rwcontrollder.write(function (cursub) {
						this.subscribers.push(cursub);
					}.bind(this, subscriber));
				}
			}
		}
		/**
   * 取消订阅
  	 * @param {JSON} subscriber 订阅者
   */

	}, {
		key: 'unsubscribe',
		value: function unsubscribe(subscriber) {
			if (this.argsValidate(subscriber)) {
				this.rwcontrollder.write(function (cursub) {
					var _this = this;

					$.each(this.subscribers, function (index, item) {
						if (item == cursub) {
							_this.subscribers.splice(index, 1);
							return false;
						}
					});
				}.bind(this, subscriber));
			}
		}
	}]);

	return PublisherS;
}();

module.exports = PublisherS;

},{"./rwcontroller.js":32,"./tool.js":34}],31:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @fileoverview
 *   给指定元素创建resize事件监听类
 * @author mingrui| mingrui@staff.sina.com.cn
 * @version 1.0 | 2015-08-27
 * @return resize类
 * @example
 *  	const Resize = require('libutil-resize');
 * 		var resize = new Resize($(window));
 * 		resize.listen({call:function(){console.log('窗口resize');}});
 */

var Delayevt = require('./delayevt.js');

var Resize = function () {
	/**
  * @param {Element} *node 元素节点
  * @param {JSON} config 延迟配置。同evt/delayevt类的初始化参数
  */
	function Resize(node, config) {
		var _this = this;

		_classCallCheck(this, Resize);

		if (node.length == 0) {
			return;
		}
		var opt = $.extend({
			evtname: 'resize'
		}, config);
		this.delay = new Delayevt(opt);
		node.on(opt.evtname, function () {
			_this.delay.start();
		});
	}
	/**
  * 添加scroll事件监听
     * @param {JSON} opt
     * {
     *   call: function//事件发生时触发的回调
  *   filter: function //过滤条件。filter返回为true则才触发call。不填此项则默认不过滤
  * }
     */


	_createClass(Resize, [{
		key: 'listen',
		value: function listen(opt) {
			this.delay.subscribe(opt);
		}
		/**
   * 移除监听
      * @param {Object} opt 和调用listen时一样的参数引用
   */

	}, {
		key: 'unlisten',
		value: function unlisten(opt) {
			this.delay.unsubscribe(opt);
		}
	}]);

	return Resize;
}();

module.exports = Resize;

},{"./delayevt.js":28}],32:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @fileoverview 读写控制器——对于读写异步操作进行控制
 * @version 1.0 | 2015-09-07 版本信息
 * @author Zhang Mingrui | 592044573@qq.com
 * @return 读写控制器类
 * @example
 * */
var Tool = require('./tool.js');

var Rwcontroller = function () {
  function Rwcontroller() {
    _classCallCheck(this, Rwcontroller);

    this.readlock = false; //读锁
    this.writelock = false; //写锁
    this.queue = []; //读写操作缓存队列
  }
  /**
   * 获取当前是否可以执行读操作
   */


  _createClass(Rwcontroller, [{
    key: 'readenable',
    value: function readenable() {
      if (this.writelock) {
        return false;
      }
      return true;
    }
    /**
     * 获取当前是否可以执行写操作
     */

  }, {
    key: 'writeenable',
    value: function writeenable() {
      if (this.writelock || this.readlock) {
        return false;
      }
      return true;
    }
    /**
     * 执行读写操作队列
     */

  }, {
    key: 'execqueue',
    value: function execqueue() {
      while (this.queue.length > 0) {
        var obj = this.queue.shift();
        if (obj.type == 'read') {
          this._execread(obj.fun);
        } else if (obj.type == 'write') {
          this._execwrite(obj.fun);
        }
      }
    }
    /**
     * 私有——执行读操作
     */

  }, {
    key: '_execread',
    value: function _execread(fun) {
      this.readlock = true;
      fun();
      this.readlock = false;
    }
    /**
     * 私有——执行写操作
     */

  }, {
    key: '_execwrite',
    value: function _execwrite(fun) {
      this.writelock = true;
      fun();
      this.writelock = false;
    }
    /**
     * 开始读
        * @param {Function} *fun 读操作回调函数
     */

  }, {
    key: 'read',
    value: function read(fun) {
      if (Tool.isFunction(fun)) {
        if (this.readenable()) {
          this._execread(fun);
          this.execqueue();
        } else {
          this.queue.push({
            type: 'read',
            fun: fun
          });
        }
      }
    }
    /**
     * 开始写
        * @param {Function} *fun 写操作回调函数
     */

  }, {
    key: 'write',
    value: function write(fun) {
      if (Tool.isFunction(fun)) {
        if (this.writeenable()) {
          this._execwrite(fun);
          this.execqueue();
        } else {
          this.queue.push({
            type: 'write',
            fun: fun
          });
        }
      }
    }
  }]);

  return Rwcontroller;
}();

module.exports = Rwcontroller;

},{"./tool.js":34}],33:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @fileoverview
 *   给指定元素创建scroll事件监听类
 * @author mingrui| mingrui@staff.sina.com.cn
 * @version 1.0 | 2015-08-27
 * @return scroll类
 * @example
 * 		const Scroll = require('libutil-scroll');
 *
 * 		var scroll = new Scroll($(window));
 * 		scroll.listen({call:function(){console.log('窗口scroll');}});
 *
 */

var Delayevt = require('./delayevt.js');

var Scroll = function () {
	/**
  * @param {Element} *node 元素节点
  * @param {JSON} config 延迟配置。同libevt/delayevt类的初始化参数
  */
	function Scroll(node, config) {
		var _this = this;

		_classCallCheck(this, Scroll);

		if (node.length == 0) {
			return;
		}
		this.delay = new Delayevt(config);
		node.on('scroll', function () {
			_this.delay.start();
		});
	}
	/**
  * 添加scroll事件监听
     * @param {JSON} opt
     * {
     *   call: function//事件发生时触发的回调
  *   filter: function //过滤条件。filter返回为true则才触发call。不填此项则默认不过滤
  * }
     */


	_createClass(Scroll, [{
		key: 'listen',
		value: function listen(opt) {
			this.delay.subscribe(opt);
		}
		/**
   * 移除监听
      * @param {Object} opt 和调用listen时一样的参数引用
   */

	}, {
		key: 'unlisten',
		value: function unlisten(opt) {
			this.delay.unsubscribe(opt);
		}
	}]);

	return Scroll;
}();

module.exports = Scroll;

},{"./delayevt.js":28}],34:[function(require,module,exports){
'use strict';

/**
 * 常用小工具
 * @author Zhang Mingrui | 592044573@qq.com
 * var Tool = require('libutil-tool');
 */
var Url = require('url');

/**
 * data是否是无效字段。即是null|undefined|''
* @param {Object} data
 */
exports.isInvalid = function (data) {
  if (data == null || data == '') {
    return true;
  }
  return false;
},
/**
 * 是否是Object对象的实例，通常用来检测data是否是一个纯的JSON字段或new Object()
* @param {Object} data
 */
exports.isObject = function (data) {
  return Object.prototype.toString.call(data) == '[object Object]' && data.constructor == Object;
},
/**
 * 数据类型是否是object。不仅仅限于是纯的Object实例化的对象
 */
exports.isObjectType = function (data) {
  return Object.prototype.toString.call(data) == '[object Object]';
},
/**
 * 是否是function
* @param {Object} data
 */
exports.isFunction = function (data) {
  return typeof data == 'function';
},
/**
 * 是否是Array
* @param {Object} data
 */
exports.isArray = function (data) {
  return Object.prototype.toString.call(data) == '[object Array]';
},
/**
 * 是否是boolean
* @param {Object} data
 */
exports.isBoolean = function (data) {
  return typeof data == 'boolean';
},
/**
 * 是否是String
* @param {Object} data
 */
exports.isString = function (data) {
  return typeof data == 'string';
},
/**
 * 是否是Number
* @param {Object} data
 */
exports.isNumber = function (data) {
  return typeof data == 'number';
},
/**
 * 是否是一个有效的jquery dom对象
 * @param {Object} node
 */
exports.isValidJqueryDom = function (node) {
  return node != null && this.isFunction(node.size) && node.length > 0;
};

/**
 * 解析url
 * @param {String} url url地址，不填则取location.href
 * @return {Object} urlObject https://nodejs.org/dist/latest-v6.x/docs/api/url.html#url_url_strings_and_url_objects
 *  query: 如果没有query，则是{}
 */
exports.urlparse = function (url) {
  url = url || location.href;

  return Url.parse(url, true);
};

},{"url":42}],35:[function(require,module,exports){
'use strict';

/**
 * @fileoverview
 *   监听window resize。只支持PC
 * @author mingrui| mingrui@staff.sina.com.cn
 * @version 1.0 | 2015-08-27
 * @example
 * 		const Winresize = require('libutil-winresize');
 *
 * 		Winresize.listen({call:function(){console.log('窗口resize');}});
 */
var Resize = require('./resize.js'),
    Deviceevtname = require('./deviceevtname.js');

module.exports = new Resize($(window), {
  evtname: Deviceevtname + '.lib'
});

},{"./deviceevtname.js":29,"./resize.js":31}],36:[function(require,module,exports){
'use strict';

/**
 * @fileoverview
 *   窗口滚动事件监听
 * @author mingrui| mingrui@staff.sina.com.cn
 * @version 1.0 | 2015-08-27
 * @return 滚动监听对象
 * @example
 * 		const Winscroll = require('libutil-winscroll');
 *
 * 		Winscroll.listen({call:function(){console.log('窗口scroll');}});
 */

var Scroll = require('./scroll.js');

module.exports = new Scroll($(window));

},{"./scroll.js":33}],37:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @fileoverview 线程池控制器
 *      负责返回当前空闲的线程对象
 * @version 1.0 | 2017-01-19 版本信息
 * @author Zhang Mingrui | 592044573@qq.com
 * @return
 * @example
 *      const WorkerControl = require('libutil-workerControl');
 * */

var Worker =
/**
 * 一个线程
 */
function Worker() {
    _classCallCheck(this, Worker);

    this.lock = true;
};

var WorkerControl = function () {
    /**
     * 线程池控制器类
     * @return {[type]} [description]
     */
    function WorkerControl() {
        _classCallCheck(this, WorkerControl);

        this._workerobjs = []; //workerControl对象
    }
    /**
     * 返回当前空闲的workerControl对象
     * @return {[type]} [description]
     */


    _createClass(WorkerControl, [{
        key: "get",
        value: function get() {
            var curworker = null;
            for (var i = 0, len = this._workerobjs.length; i < len; i++) {
                if (this._workerobjs[i].lock == false) {
                    //既无请求又没有被锁定
                    this._workerobjs[i].lock = true;
                    curworker = this._workerobjs[i];
                    break;
                }
            }
            if (curworker == null) {
                curworker = new Worker();
                this._workerobjs.push(curworker);
            }
            return curworker;
        }
        /**
         * 通知当前workerControl对象已经使用完毕
         * @param {instance of workerControl} worker 如果提供了worker，则结束此线程；如果没提供，则结束第一个正在使用的线程
         * @return {instance of workerControl | null} 当前结束的线程对象.没有则为null
         */

    }, {
        key: "end",
        value: function end(worker) {
            var curworker = null;
            for (var i = 0, len = this._workerobjs.length; i < len; i++) {
                if (worker) {
                    if (this._workerobjs[i] == worker) {
                        //既无请求又没有被锁定
                        this._workerobjs[i].lock = false;
                        curworker = this._workerobjs[i];
                        break;
                    }
                } else {
                    if (this._workerobjs[i].lock == true) {
                        this._workerobjs[i].lock = false;
                        curworker = this._workerobjs[i];
                        break;
                    }
                }
            }
            return curworker;
        }
        /**
         * 是否所有的线程都被使用完毕
         * @return {Boolean} true：所有线程都空闲
         */

    }, {
        key: "isend",
        value: function isend() {
            var result = true;
            for (var i = 0, len = this._workerobjs.length; i < len; i++) {
                if (this._workerobjs[i].lock == true) {
                    //既无请求又没有被锁定
                    result = false;
                    break;
                }
            }
            return result;
        }
    }]);

    return WorkerControl;
}();

module.exports = WorkerControl;

},{}],38:[function(require,module,exports){
(function (global){
/*! https://mths.be/punycode v1.4.1 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports &&
		!exports.nodeType && exports;
	var freeModule = typeof module == 'object' && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.4.1',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) {
			// in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],39:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],40:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],41:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":39,"./encode":40}],42:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var punycode = require('punycode');
var util = require('./util');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // Special case for a simple path URL
    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && util.isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!util.isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  // Copy chrome, IE, opera backslash-handling behavior.
  // Back slashes before the query string get converted to forward slashes
  // See: https://code.google.com/p/chromium/issues/detail?id=25916
  var queryIndex = url.indexOf('?'),
      splitter =
          (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
      uSplit = url.split(splitter),
      slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, '/');
  url = uSplit.join(splitter);

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.path = rest;
      this.href = rest;
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
        if (parseQueryString) {
          this.query = querystring.parse(this.search.substr(1));
        } else {
          this.query = this.search.substr(1);
        }
      } else if (parseQueryString) {
        this.search = '';
        this.query = {};
      }
      return this;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a punycoded representation of "domain".
      // It only converts parts of the domain name that
      // have non-ASCII characters, i.e. it doesn't matter if
      // you call it with a domain that already is ASCII-only.
      this.hostname = punycode.toASCII(this.hostname);
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      if (rest.indexOf(ae) === -1)
        continue;
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (util.isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      util.isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (util.isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  var tkeys = Object.keys(this);
  for (var tk = 0; tk < tkeys.length; tk++) {
    var tkey = tkeys[tk];
    result[tkey] = this[tkey];
  }

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    var rkeys = Object.keys(relative);
    for (var rk = 0; rk < rkeys.length; rk++) {
      var rkey = rkeys[rk];
      if (rkey !== 'protocol')
        result[rkey] = relative[rkey];
    }

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      var keys = Object.keys(relative);
      for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        result[k] = relative[k];
      }
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!util.isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especially happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host || srcPath.length > 1) &&
      (last === '.' || last === '..') || last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last === '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especially happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

},{"./util":43,"punycode":38,"querystring":41}],43:[function(require,module,exports){
'use strict';

module.exports = {
  isString: function(arg) {
    return typeof(arg) === 'string';
  },
  isObject: function(arg) {
    return typeof(arg) === 'object' && arg !== null;
  },
  isNull: function(arg) {
    return arg === null;
  },
  isNullOrUndefined: function(arg) {
    return arg == null;
  }
};

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3Rvb2wvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInB1YmxpY1xcamF2YXNjcmlwdHNcXHBhZ2VcXGlvXFxtb2RlbC5qcyIsInB1YmxpY1xcamF2YXNjcmlwdHNcXHBhZ2VcXGlvXFxzdG9yYWdlLmpzIiwicHVibGljXFxqYXZhc2NyaXB0c1xccGFnZVxcbG9naW4uanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFxjb21tb25cXGJhc2Uudmlldy5qcyIsIi4uL25vZGUtY29yZXVpLXBjL2pzL3VpL3VpLmFsZXJ0Lmh0bWwiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx1aVxcdWkuYWxlcnQuanMiLCIuLi9ub2RlLWNvcmV1aS1wYy9qcy91aS91aS5jb25maXJtLmh0bWwiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx1aVxcdWkuY29uZmlybS5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHVpXFx1aS5sYXllci5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHVpXFx1aS5sb2FkaW5nLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcdWlcXHVpLnRvYXN0LmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFxpb1xcaW50ZXJpby5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcaW9cXGlvY29uZmlnLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFxpb1xcc3RvcmFnZS5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdWlcXGxheWVyXFxhbGVydC5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdWlcXGxheWVyXFxhbGVydENvbnRyb2wuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHVpXFxsYXllclxcYWxlcnRTaW5nbGUuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHVpXFxsYXllclxcYmFzZUNvbnRyb2wuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHVpXFxsYXllclxcYm9tYkxheWVyLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1aVxcbGF5ZXJcXGNvbmZpcm0uanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHVpXFxsYXllclxcY29uZmlybUNvbnRyb2wuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHVpXFxsYXllclxcY29uZmlybVNpbmdsZS5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdWlcXGxheWVyXFxsYXllci5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdWlcXGxheWVyXFxtYXNrLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1aVxcbGF5ZXJcXHBvc2l0aW9uQm9tYi5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdWlcXGxheWVyXFx0cGwuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHV0aWxcXGNzc3N1cG9ydC5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdXRpbFxcZGVsYXlldnQuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHV0aWxcXGRldmljZWV2dG5hbWUuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHV0aWxcXHB1Ymxpc2hlclMuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHV0aWxcXHJlc2l6ZS5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdXRpbFxccndjb250cm9sbGVyLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1dGlsXFxzY3JvbGwuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHV0aWxcXHRvb2wuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHV0aWxcXHdpbnJlc2l6ZS5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdXRpbFxcd2luc2Nyb2xsLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1dGlsXFx3b3JrZXJDb250cm9sLmpzIiwiLi4vdG9vbC9ub2RlX21vZHVsZXMvcHVueWNvZGUvcHVueWNvZGUuanMiLCIuLi90b29sL25vZGVfbW9kdWxlcy9xdWVyeXN0cmluZy1lczMvZGVjb2RlLmpzIiwiLi4vdG9vbC9ub2RlX21vZHVsZXMvcXVlcnlzdHJpbmctZXMzL2VuY29kZS5qcyIsIi4uL3Rvb2wvbm9kZV9tb2R1bGVzL3F1ZXJ5c3RyaW5nLWVzMy9pbmRleC5qcyIsIi4uL3Rvb2wvbm9kZV9tb2R1bGVzL3VybC91cmwuanMiLCIuLi90b29sL25vZGVfbW9kdWxlcy91cmwvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7O0FBS0EsSUFBTSxXQUFXLFFBQVEsZ0JBQVIsQ0FBakI7QUFBQSxJQUNNLFVBQVUsUUFBUSxlQUFSLENBRGhCO0FBQUEsSUFFTSxVQUFVLFFBQVEsV0FBUixDQUZoQjtBQUdDOzs7QUFHQSxTQUFTLEtBQVQsQ0FBZSxNQUFmLEdBQXdCLFVBQVMsTUFBVCxFQUFnQjtBQUNwQyxXQUFPLE9BQU8sSUFBUCxJQUFlLE9BQXRCO0FBQ0gsQ0FGRDtBQUdBLFNBQVMsS0FBVCxDQUFlLEdBQWYsR0FBcUIsbUJBQXJCOztBQUdBOzs7QUFHQSxTQUFTLElBQVQsQ0FBYyxNQUFkLEdBQXVCLFVBQVMsTUFBVCxFQUFpQjtBQUNwQyxXQUFPLE9BQU8sSUFBUCxJQUFlLE9BQXRCO0FBQ0gsQ0FGRDtBQUdBLFNBQVMsTUFBVCxDQUFnQixJQUFoQixHQUF1QixVQUFTLE1BQVQsRUFBZ0I7QUFDbkMsU0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixPQUFPLE1BQVAsSUFBaUIsTUFBakM7QUFDSCxDQUZE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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3JoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNXRCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxyXG4gKiDmlL7liLDoh6rlt7Hpobnnm67kuK3vvIznu5/kuIDlrprkuYnnmoRpb+WkhOeQhuWxglxyXG4gKlxyXG4gKiDkvb/nlKhqcXVlcnnmj5DkvpvnmoRhamF45pa55rOV5ZKM5pys6Lqr5bCB6KOF55qEaW/kuJrliqHlsYLlrp7njrBcclxuICovXHJcbmNvbnN0IElvQ29uZmlnID0gcmVxdWlyZSgnbGliaW8taW9jb25maWcnKSxcclxuICAgICAgSW50ZXJpbyA9IHJlcXVpcmUoJ2xpYmlvLWludGVyaW8nKSxcclxuICAgICAgU3RvcmFnZSA9IHJlcXVpcmUoJy4vc3RvcmFnZScpO1xyXG4gLyoqXHJcbiAgKiDnu5/kuIDlpITnkIbmnKrnmbvlvZVcclxuICAqL1xyXG4gSW9Db25maWcubG9naW4uZmlsdGVyID0gZnVuY3Rpb24ocmVzdWx0KXtcclxuICAgICByZXR1cm4gcmVzdWx0LmNvZGUgPT0gJ0EwMDAyJztcclxuIH07XHJcbiBJb0NvbmZpZy5sb2dpbi51cmwgPSAnaHR0cDovL2JhaWR1LmNvbS8nO1xyXG5cclxuXHJcbiAvKipcclxuICAqIOaJgOacieaOpeWPo+eahGlv5Lia5Yqh6ZSZ6K+v57uf5LiA5aSE55CGXHJcbiAgKi9cclxuIElvQ29uZmlnLmZhaWwuZmlsdGVyID0gZnVuY3Rpb24ocmVzdWx0KSB7XHJcbiAgICAgcmV0dXJuIHJlc3VsdC5jb2RlICE9ICdBMDAwMSc7XHJcbiB9O1xyXG4gSW9Db25maWcuaW9jYWxsLmZhaWwgPSBmdW5jdGlvbihyZXN1bHQpe1xyXG4gICAgIF9BUFAuVG9hc3Quc2hvdyhyZXN1bHQuZXJybXNnIHx8ICfnvZHnu5zplJnor68nKTtcclxuIH07XHJcbiBJb0NvbmZpZy5pb2NhbGwuZXJyb3IgPSBmdW5jdGlvbihqcVhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pe1xyXG4gICAgIF9BUFAuVG9hc3Quc2hvdyh0ZXh0U3RhdHVzIHx8ICfnvZHnu5zplJnor68nKTtcclxuIH07XHJcblxyXG4gSW9Db25maWcuaW9hcmdzLmJlZm9yZVNlbmQgPSBmdW5jdGlvbigpe1xyXG4gICAgLy8gIF9BUFAuTG9hZGluZy5zaG93KCk7XHJcbiAgICBjb25zb2xlLmxvZygn6K+35rGC5byA5aeLJyk7XHJcbiB9O1xyXG4gSW9Db25maWcuaW9jYWxsLmNvbXBsZXRlID0gZnVuY3Rpb24oKXtcclxuICAgIC8vICBfQVBQLkxvYWRpbmcuaGlkZSgpO1xyXG4gICAgY29uc29sZS5sb2coJ+ivt+axgue7k+adnycpO1xyXG4gfVxyXG5cclxuIC8v5pSv5oyB6Leo6LaKXHJcbiBJb0NvbmZpZy5pb2FyZ3MuY3Jvc3NEb21haW4gPSB0cnVlO1xyXG4gLyoqXHJcbiAgKiDmlbDmja7mjqXlj6PphY3nva5cclxuICAqL1xyXG4gdmFyIGJhc2Vob3N0ID0gJ2h0dHA6Ly8xMjcuMC4wLjE6ODAwMCc7XHJcblxyXG4gLyoqXHJcbiAgKiB1cmzmoLzlvI/ljJZcclxuICAqIEBleGFtcGxlIGJ1aWxkVXJsKCcvcmVyL3tzZXh9L2Zld3Ive2lkfScse3NleDonYWEnLGlkOicxMSd9KVxyXG4gICogICAgICAgICAg6L+U5Zue77yaL3Jlci9hYS9mZXdyLzExXHJcbiAgKi9cclxuIGZ1bmN0aW9uIGJ1aWxkVXJsKHVybCxkYXRhLGlzZW5jb2RlKXtcclxuICAgICB2YXIgcmVnID0gL1xceyhbYS16QS1BXSspXFx9L2c7XHJcbiAgICAgcmV0dXJuIHVybC5yZXBsYWNlKHJlZywgZnVuY3Rpb24gKGFsbCwga2V5KSB7XHJcbiAgICAgICAgIHJldHVybiBpc2VuY29kZT8gZW5jb2RlVVJJQ29tcG9uZW50KGRhdGFba2V5XSk6IGRhdGFba2V5XTtcclxuICAgICB9KTtcclxuIH1cclxuIC8qKlxyXG4gICog6K+35rGC5pWw5o2u5bGCbW9kZWxcclxuICAqIEBwYXJhbSB7T2JqZWN0fSBpb2FyZ3Mg5Lyg5YWl55qE5Y+C5pWw5ZCMJGlvY29uZmlnLmlvYXJnc+agvOW8j+S4gOiHtO+8jOS4gOiIrOaYr++8mlxyXG4gICAgICAqIHtcclxuICAgICAgKiBcdCAgIGRhdGE6IHt9XHJcbiAgICAgICogfVxyXG4gICAgQHBhcmFtIHtKU09OfSAqaW9jYWxsIOS8oOWFpeeahOWPguaVsOWQjCRpb2NvbmZpZy5pb2NhbGzmoLzlvI/kuIDoh7TvvIzkuIDoiKzmmK/vvJpcclxuICAgICoge1xyXG4gICAgKiAgICAgc3VjY2Vzc1xyXG4gICAgKiAgICAgY29tcGxldGVcclxuICAgICogICAgIC8v5Lul5LiL5bey57uP5pyJ57uf5LiA5aSE55CG77yM5aaC5p6c5oOz6KaG55uW5YiZ6Ieq6KGM5Lyg5YWlXHJcbiAgICAqICAgICBlcnJvclxyXG4gICAgKiAgICAgZmFpbFxyXG4gICAgKiB9XHJcbiAgICBAcGFyYW0ge09iamVjdH0gdXJsRGF0YSDpkojlr7l1cmzph4zpnaLmnIl75pu/5o2i5Y+C5pWw5ZCNfeeahOaDheWGte+8jOS8oOWFpeeahOmUruWAvOWvueW6lOaVsOaNrlxyXG4gICovXHJcbiBtb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgICAvKipcclxuICAgICAgKiDojrflj5bpobnnm67mlofku7bnm67lvZXnu5PmnoRcclxuICAgICAgKiB1cmxEYXRhOiB7XHJcbiAgICAgICogICAgIGlkXHJcbiAgICAgICogfVxyXG4gICAgICAqL1xyXG4gICAgIG1haW46IGZ1bmN0aW9uKGlvYXJncyxpb2NhbGwsdXJsRGF0YSl7XHJcbiAgICAgICAgIHZhciBfdXJsID0gYnVpbGRVcmwoYmFzZWhvc3QrJy90cmFjZXIvbWFpbi90cmFjZS97aWR9Jyx1cmxEYXRhLHRydWUpO1xyXG4gICAgICAgICBJbnRlcmlvLnRyYW5zUmVxdWVzdCgkLmV4dGVuZCh7XHJcbiAgICAgICAgICAgICB1cmw6IF91cmwsXHJcbiAgICAgICAgICAgICBtZXRob2Q6J0dFVCdcclxuICAgICAgICAgfSxpb2FyZ3MpLGlvY2FsbCk7XHJcbiAgICAgfSxcclxuICAgICAvKipcclxuICAgICAgKiDliJfooajmlbDmja5cclxuICAgICAgKi9cclxuICAgICBsaXN0ZGF0YTogZnVuY3Rpb24oaW9hcmdzLGlvY2FsbCl7XHJcbiAgICAgICAgIEludGVyaW8udHJhbnNSZXF1ZXN0KCQuZXh0ZW5kKHtcclxuICAgICAgICAgICAgIHVybDogYmFzZWhvc3QrJy9saXN0ZGF0YScsXHJcbiAgICAgICAgICAgICBtZXRob2Q6J1BPU1QnLFxyXG4gICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAgKiDlpoLmnpzmg7Plr7nmjqXlj6PnmoTmlbDmja7ov5vooYznvJPlrZjvvIzliJnov5vooYzku6XkuIvphY3nva5cclxuICAgICAgICAgICAgICAqXHJcbiAgICAgICAgICAgICAgKiDmlbDmja7nvJPlrZjvvIzmmoLkuI3ljLrliIbmjqXlj6Por7fmsYLlj4LmlbBcclxuICAgICAgICAgICAgICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgIGN1c3RvbWNvbmZpZzoge1xyXG4gICAgICAgICAgICAgICAgIHN0b3JhZ2U6IFN0b3JhZ2UubGlzdGRhdGEgLy/phY3nva7nvJPlrZjlr7nosaHvvIzlv4XloatcclxuICAgICAgICAgICAgICAgICAvL+WmguaenOivt+axguivpeaOpeWPo+WJje+8jOimgea4healmuaJgOacieacrOWcsOe8k+WtmO+8jOWImea3u+WKoOatpOmFjee9rlxyXG4gICAgICAgICAgICAgICAgIC8v5aaC77ya5b2T5YmN5o6l5Y+j5piv55So5oi355m75b2VL+mAgOWHuuaOpeWPo++8jOWImea4hemZpOaJgOacieaVj+aEn+aVsOaNrlxyXG4gICAgICAgICAgICAgICAgIC8vIGNsZWFyYWxsOiB0cnVlXHJcbiAgICAgICAgICAgICB9XHJcbiAgICAgICAgIH0saW9hcmdzKSxpb2NhbGwpO1xyXG4gICAgIH0sXHJcblxyXG4gICAgIC8v55m75b2V5o6l5Y+jXHJcbiAgICAgbG9naW46IGZ1bmN0aW9uKGlvYXJncywgaW9jYWxsKXtcclxuICAgICAgICAgSW50ZXJpby50cmFuc1JlcXVlc3QoJC5leHRlbmQoe1xyXG4gICAgICAgICAgICAgdXJsOiAnL3VzZXJzL2xvZ2luJyxcclxuICAgICAgICAgICAgIG1ldGhvZDonUE9TVCdcclxuICAgICAgICAgfSxpb2FyZ3MpLGlvY2FsbCk7XHJcbiAgICAgfSxcclxuXHJcbiAgICAgLy/kuLrkuobmtYvor5XvvIzkuIDoiKzkuI3opoFcclxuICAgICAkaW50ZXJpbzogSW50ZXJpbyxcclxuICAgICBiYXNlaG9zdDogYmFzZWhvc3RcclxuIH07XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IOaUvuWIsOiHquW3seeahOmhueebruS4re+8jOe7n+S4gOeahOacrOWcsOWtmOWCqOmFjee9rlxyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE3LTA1LTI0IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEBleGFtcGxlXHJcbiAqICovXHJcblxyXG5jb25zdCBTdG9yYWdlID0gcmVxdWlyZSgnbGliaW8tc3RvcmFnZScpO1xyXG5cclxuIC8qKlxyXG4gICog5pys5Zyw5a2Y5YKo5a+56LGh5omA5bGe57uE77yM5ZG95ZCN5Y+v6Ieq6KGM5L+u5pS544CC6buY6K6k5pivWk1SRExCXHJcbiAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICovXHJcbiAvLyBTdG9yYWdlLmdyb3VwbmFtZSA9ICdteXByb2plY3RuYW1lJztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgIGxpc3RkYXRhOiBTdG9yYWdlLmNyZWF0ZSh7XHJcbiAgICAgICAgIG1heGFnZTogJzFEJywgLy/kv53lrZgx5aSpXHJcbiAgICAgICAgIGtleTogJ2xpc3RkYXRhJ1xyXG4gICAgIH0pLFxyXG4gICAgIGxpc3RkYXRhdHdvOiBTdG9yYWdlLmNyZWF0ZSh7XHJcbiAgICAgICAgIG1heGFnZTogJzAuMUgnLCAvL+S/neWtmDAuMeWwj+aXtlxyXG4gICAgICAgICBrZXk6ICdsaXN0ZGF0YXR3bydcclxuICAgICB9KVxyXG59O1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyDnmbvlvZXpobVcclxuICogQHZlcnNpb24gMS4wIHwgMjAxNy0wNS0yNyDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAZXhhbXBsZVxyXG4gKiAqL1xyXG5jb25zdCBNb2RlbCA9IHJlcXVpcmUoJy4vaW8vbW9kZWwuanMnKSxcclxuICAgICAgICBCYXNlVmlldyA9IHJlcXVpcmUoJ2NvcmUtYmFzZXZpZXcnKTtcclxuXHJcbkJhc2VWaWV3LnJlZ2lzdGVyKHtcclxuICAgIF9pbml0OiBmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciBub2RlcyA9IHtcclxuICAgICAgICAgICAgdXNlcm5hbWU6ICQoJyN1c2VybmFtZScpLFxyXG4gICAgICAgICAgICBwYXNzd29yZDogJCgnI3Bhc3N3b3JkJyksXHJcbiAgICAgICAgICAgIGxvZ2luOiAkKCcjbG9naW4nKVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIG5vZGVzLmxvZ2luLm9uKCdjbGljaycsZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgTW9kZWwubG9naW4oe1xyXG4gICAgICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgIHVzZXJuYW1lOiBub2Rlcy51c2VybmFtZS52YWwoKS50cmltKCksXHJcbiAgICAgICAgICAgICAgICAgICAgcGFzc3dvcmQ6IG5vZGVzLnBhc3N3b3JkLnZhbCgpLnRyaW0oKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LHtcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIF9BUFAuVG9hc3Quc2hvdygn55m75b2V5oiQ5YqfJyxmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gJy91c2Vycyc7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0pO1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyDpobXpnaLln7rmnKx2aWV357G744CC5pyA57uI5Lia5Yqh6aG555uu5Lit6JC95Zyw6aG155qEanPpg73lv4XpobvlvJXnlKjmraRqc+aIluWFtuWtkOexu1xyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE2LTEyLTIwIOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm5cclxuICogKi9cclxuXHJcbiBjb25zdCBBbGVydCA9IHJlcXVpcmUoJy4uL3VpL3VpLmFsZXJ0LmpzJyksXHJcbiAgICAgICBDb25maXJtID0gcmVxdWlyZSgnLi4vdWkvdWkuY29uZmlybS5qcycpLFxyXG4gICAgICAgVG9hc3QgPSByZXF1aXJlKCcuLi91aS91aS50b2FzdC5qcycpLFxyXG4gICAgICAgTG9hZGluZyA9IHJlcXVpcmUoJy4uL3VpL3VpLmxvYWRpbmcuanMnKSxcclxuICAgICAgIFRvb2wgPSByZXF1aXJlKCdsaWJ1dGlsLXRvb2wnKTtcclxuXHJcbmNsYXNzIEJhc2VWaWV3IHtcclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gJ3ptcmRsYic7XHJcbiAgICAgICAgLy/nu5HlrprkuIDkupvluLjnlKjnmoTnu4Tku7bliLDlhajlsYDlj5jph49cclxuICAgICAgICB3aW5kb3cuX0FQUCA9IHt9O1xyXG4gICAgICAgIF9BUFAuQWxlcnQgPSBBbGVydDtcclxuICAgICAgICBfQVBQLkNvbmZpcm0gPSBDb25maXJtO1xyXG4gICAgICAgIF9BUFAuVG9hc3QgPSBUb2FzdDtcclxuICAgICAgICBfQVBQLkxvYWRpbmcgPSBMb2FkaW5nO1xyXG4gICAgICAgIF9BUFAuVG9vbCA9IFRvb2w7XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdCgpe1xyXG4gICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOazqOWGjOS4gOS4qumhtemdolxyXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSBvcHQg6YeM6Z2i6YWN572u55qE5omA5pyJ5pa55rOV6YO95rS+55Sf57uZQmFzZVZpZXfnmoTlrp7kvotcclxuICAgICAqIHtcclxuICAgICAqICAgICAgX2luaXQ6IOatpOaWueazleW/hemhu+acie+8jOmhtemdouWIneWni+WMluaJp+ihjFxyXG4gICAgICogfVxyXG4gICAgICogQHJldHVybiB7aW5zdGFuY2Ugb2YgQmFzZVZpZXd9ICAgICBbZGVzY3JpcHRpb25dXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyByZWdpc3RlcihvcHQpe1xyXG4gICAgICAgIHZhciB0ID0gbmV3IHRoaXMoKTtcclxuICAgICAgICBmb3IodmFyIGtleSBpbiBvcHQpe1xyXG4gICAgICAgICAgICB0W2tleV0gPSBvcHRba2V5XTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8v5Yid5aeL5YyWXHJcbiAgICAgICAgdC5pbml0KCk7XHJcblxyXG4gICAgICAgIHJldHVybiB0O1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VWaWV3O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFwiPGRpdiBjbGFzcz1cXFwidGl0bGUganMtdGl0bGVcXFwiPuaPkOekujwvZGl2PjxkaXYgY2xhc3M9XFxcImJvZHkganMtY29udGVudFxcXCI+PC9kaXY+PGRpdiBjbGFzcz1mb290ZXI+PGEgaHJlZj1qYXZhc2NyaXB0OjsgY2xhc3M9anMtb2s+56Gu5a6aPC9hPjwvZGl2PlwiO1xuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcg5YWs5YWxYWxlcnTlvLnlsYJcclxuICogQHZlcnNpb24gMS4wIHwgMjAxNi0xMS0xNCDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAcmV0dXJuXHJcbiAqICovXHJcblxyXG4gY29uc3QgQWxlcnRTaW5nbGUgPSByZXF1aXJlKCdsaWJsYXllci1hbGVydFNpbmdsZScpLFxyXG4gICAgICAgIENzc3N1cG9ydCA9IHJlcXVpcmUoJ2xpYnV0aWwtY3Nzc3Vwb3J0JyksXHJcbiAgICAgICAgVHBsID0gcmVxdWlyZSgnLi91aS5hbGVydC5odG1sJyk7XHJcblxyXG5BbGVydFNpbmdsZS5oaWRlZGVzdHJveSA9IGZhbHNlO1xyXG5cclxuQWxlcnRTaW5nbGUuc2V0Y29uZmlnKHtcclxuICAgIGxheWVyOiB7XHJcbiAgICAgICAgY2xhc3NuYW1lOiAnY29yZXVpLWctbGF5ZXIgY29yZXVpLWctd2FybmxheWVyIGNvcmV1aS1nLWxheWVyLWFsZXJ0JyxcclxuICAgICAgICBjdXN0b206IHtcclxuICAgICAgICAgICAgaGlkZTogZnVuY3Rpb24obGF5ZXIpe1xyXG4gICAgICAgICAgICAgICAgbGF5ZXIucmVtb3ZlQ2xhc3MoJ3Nob3ctdXAnKS5hZGRDbGFzcygnaGlkZS11cCcpO1xyXG4gICAgICAgICAgICAgICAgaWYoQ3Nzc3Vwb3J0LnRyYW5zaXRpb24pe1xyXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGF5ZXIuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBBbGVydFNpbmdsZS5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwzMDApO1xyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgbGF5ZXIuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIEFsZXJ0U2luZ2xlLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBtYXNrOiB7XHJcbiAgICAgICAgY2xhc3NuYW1lOiAnY29yZXVpLWctbWFzaycsXHJcbiAgICAgICAgb3BhY2l0eTogQ3Nzc3Vwb3J0LnRyYW5zaXRpb24/IDA6IDAuNixcclxuICAgICAgICBjdXN0b206IHtcclxuICAgICAgICAgICAgaGlkZTogZnVuY3Rpb24obWFzayl7XHJcbiAgICAgICAgICAgICAgICBpZihDc3NzdXBvcnQudHJhbnNpdGlvbil7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFzay5jc3MoJ29wYWNpdHknLDApO1xyXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFzay5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwzMDApO1xyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFzay5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNob3c6IGZ1bmN0aW9uKG1hc2spe1xyXG4gICAgICAgICAgICAgICAgaWYoQ3Nzc3Vwb3J0LnRyYW5zaXRpb24pe1xyXG4gICAgICAgICAgICAgICAgICAgIG1hc2suc2hvdygpLmNzcygnb3BhY2l0eScsMC42KTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIG1hc2suc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGFsZXJ0OiB7XHJcbiAgICAgICAgZnJhbWV0cGw6IFRwbFxyXG4gICAgfVxyXG59KTtcclxuXHJcbkFsZXJ0U2luZ2xlLmNyZWF0ZWNhbC5hZGQoZnVuY3Rpb24obGF5ZXJvYmope1xyXG4gICAgbGF5ZXJvYmoubGF5ZXIuYWRkQ2xhc3MoJ2hpZGUtdXAnKTtcclxuXHJcbiAgICBsYXllcm9iai5wb3MucG9zY2FsLmFkZChmdW5jdGlvbigpe1xyXG4gICAgICAgIGxheWVyb2JqLmxheWVyLnJlbW92ZUNsYXNzKCdoaWRlLXVwJykuYWRkQ2xhc3MoJ3Nob3ctdXAnKTtcclxuICAgIH0pO1xyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQWxlcnRTaW5nbGU7XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gXCI8ZGl2IGNsYXNzPVxcXCJ0aXRsZSBqcy10aXRsZVxcXCI+5o+Q56S6PC9kaXY+PGRpdiBjbGFzcz1cXFwiYm9keSBqcy1jb250ZW50XFxcIj48L2Rpdj48ZGl2IGNsYXNzPWZvb3Rlcj48YSBocmVmPWphdmFzY3JpcHQ6OyBjbGFzcz1cXFwiY2FuY2VsIGpzLWNhbmNlbFxcXCI+5Y+W5raIPC9hPiA8YSBocmVmPWphdmFzY3JpcHQ6OyBjbGFzcz1qcy1vaz7noa7lrpo8L2E+IDxpIGNsYXNzPXNwbGl0PjwvaT48L2Rpdj5cIjtcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IOWFrOWFsWNvbmZpcm3lvLnlsYJcclxuICogQHZlcnNpb24gMS4wIHwgMjAxNy0wMS0wNiDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAcmV0dXJuXHJcbiAqICovXHJcblxyXG4gY29uc3QgQ29uZmlybVNpbmdsZSA9IHJlcXVpcmUoJ2xpYmxheWVyLWNvbmZpcm1TaW5nbGUnKSxcclxuICAgICAgICBDc3NzdXBvcnQgPSByZXF1aXJlKCdsaWJ1dGlsLWNzc3N1cG9ydCcpLFxyXG4gICAgICAgIFRwbCA9IHJlcXVpcmUoJy4vdWkuY29uZmlybS5odG1sJyk7XHJcblxyXG5Db25maXJtU2luZ2xlLmhpZGVkZXN0cm95ID0gZmFsc2U7XHJcblxyXG5Db25maXJtU2luZ2xlLnNldGNvbmZpZyh7XHJcbiAgICBsYXllcjoge1xyXG4gICAgICAgIGNsYXNzbmFtZTogJ2NvcmV1aS1nLWxheWVyIGNvcmV1aS1nLXdhcm5sYXllciBjb3JldWktZy1sYXllci1jb25maXJtJyxcclxuICAgICAgICBjdXN0b206IHtcclxuICAgICAgICAgICAgaGlkZTogZnVuY3Rpb24obGF5ZXIpe1xyXG4gICAgICAgICAgICAgICAgbGF5ZXIucmVtb3ZlQ2xhc3MoJ3Nob3ctdXAnKS5hZGRDbGFzcygnaGlkZS11cCcpO1xyXG4gICAgICAgICAgICAgICAgaWYoQ3Nzc3Vwb3J0LnRyYW5zaXRpb24pe1xyXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGF5ZXIuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBDb25maXJtU2luZ2xlLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgICAgICB9LDMwMCk7XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICBsYXllci5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgQ29uZmlybVNpbmdsZS5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgbWFzazoge1xyXG4gICAgICAgIGNsYXNzbmFtZTogJ2NvcmV1aS1nLW1hc2snLFxyXG4gICAgICAgIG9wYWNpdHk6IENzc3N1cG9ydC50cmFuc2l0aW9uPyAwOiAwLjYsXHJcbiAgICAgICAgY3VzdG9tOiB7XHJcbiAgICAgICAgICAgIGhpZGU6IGZ1bmN0aW9uKG1hc2spe1xyXG4gICAgICAgICAgICAgICAgaWYoQ3Nzc3Vwb3J0LnRyYW5zaXRpb24pe1xyXG4gICAgICAgICAgICAgICAgICAgIG1hc2suY3NzKCdvcGFjaXR5JywwKTtcclxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hc2suaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sMzAwKTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIG1hc2suaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzaG93OiBmdW5jdGlvbihtYXNrKXtcclxuICAgICAgICAgICAgICAgIGlmKENzc3N1cG9ydC50cmFuc2l0aW9uKXtcclxuICAgICAgICAgICAgICAgICAgICBtYXNrLnNob3coKS5jc3MoJ29wYWNpdHknLDAuNik7XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICBtYXNrLnNob3coKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBjb25maXJtOiB7XHJcbiAgICAgICAgZnJhbWV0cGw6IFRwbFxyXG4gICAgfVxyXG59KTtcclxuXHJcbkNvbmZpcm1TaW5nbGUuY3JlYXRlY2FsLmFkZChmdW5jdGlvbihsYXllcm9iail7XHJcbiAgICBsYXllcm9iai5sYXllci5hZGRDbGFzcygnaGlkZS11cCcpO1xyXG5cclxuICAgIGxheWVyb2JqLnBvcy5wb3NjYWwuYWRkKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgbGF5ZXJvYmoubGF5ZXIucmVtb3ZlQ2xhc3MoJ2hpZGUtdXAnKS5hZGRDbGFzcygnc2hvdy11cCcpO1xyXG4gICAgfSk7XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb25maXJtU2luZ2xlO1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyDkuJrliqHln7rmnKzlvLnlsYLnsbvvvIzloavlhYXkuobkuIDkupvmoLflvI/jgILkuJrliqHmiYDmnInoh6rlrprkuYnlvLnlsYLlsIbnu6fmib/mraTnsbtcclxuICogQHZlcnNpb24gMS4wIHwgMjAxNi0xMS0xNCDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAcmV0dXJuXHJcbiAqICovXHJcblxyXG4gY29uc3QgQm9tYkxheWVyID0gcmVxdWlyZSgnbGlibGF5ZXItYm9tYkxheWVyJyksXHJcbiAgICAgICAgQ3Nzc3Vwb3J0ID0gcmVxdWlyZSgnbGlidXRpbC1jc3NzdXBvcnQnKTtcclxuXHJcbmNsYXNzIFVJTGF5ZXIgZXh0ZW5kcyBCb21iTGF5ZXIge1xyXG4gICAgLyoqXHJcblx0ICog5by55bGC57G74oCU4oCU5Yib5bu65bm25re75Yqg5Yiw5oyH5a6a5a655Zmo5LitXHJcbiAgICAgKiBAcGFyYW0ge0pTT059IGNvbmZpZyDlvLnlsYLphY3nva7lj4LmlbAg77yM5LiN5piv5b+F5aGr6aG5XHJcbiAgICAgKiBcdFx0e1xyXG4gICAgICogXHQgICAgICAgY29udGFpbmVyIHtFbGVtZW50fSDlrZjmlL7lvLnlsYLnmoTlrrnlmajjgILlj6/kuI3mjIflrprvvIzpu5jorqTlvLnlsYLlrZjmlL7kuo5ib2R55Lit55qE5LiA5Liq5Yqo5oCB55Sf5oiQ55qEZGl26YeMXHJcbiAgICAgKiBcdCAgICAgICBwb3M6e30sIC8v5a6a5L2N5Y+C5pWw77yM5YW35L2T6K+05piO5Y+v6KeB5pa55rOVbGF5ZXIvcG9zaXRpb25Cb21i5Lit55qEY29uZmln6K+05piOXHJcbiAgICAgKiAgICAgICAgIGxheWVyOiB7fSwgLy/lvLnlsYLkv6Hmga/lj4LmlbDvvIzlhbfkvZPor7TmmI7lj6/op4Hmlrnms5VsYXllci9sYXllcuS4reeahGNvbmZpZ+ivtOaYjlxyXG4gICAgICogXHRcdCAgIG1hc2s6IHsgLy/pga7nvankv6Hmga/lj4LmlbDvvIzlhbfkvZPor7TmmI7lj6/op4Hmlrnms5VsYXllci9tYXNr5Lit55qEY29uZmln6K+05piO44CC5Zyo5q2k5Z+656GA5LiK6L+b6KGM5Lul5LiL5omp5bGVXHJcbiAgICAgKiBcdFx0XHQgIG1hc2s6IHRydWUsIC8v5piv5ZCm5Yib5bu66YGu572pXHJcbiAgICAgKiAgICAgICAgICAgIGNtbGhpZGU6IGZhbHNlIC8v54K55Ye76YGu572p5piv5ZCm5YWz6Zet5by55bGCXHJcbiAgICAgKiBcdFx0ICAgfVxyXG4gICAgICogICAgICB9XHJcblx0ICovXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcpe1xyXG4gICAgICAgIC8v5re75Yqg6Ieq5a6a5LmJ5Y+C5pWwXHJcbiAgICAgICAgY29uZmlnID0gJC5leHRlbmQodHJ1ZSx7XHJcbiAgICAgICAgICAgIGxheWVyOiB7XHJcbiAgICAgICAgICAgICAgICBjbGFzc25hbWU6ICdjb3JldWktZy1sYXllcicsXHJcbiAgICAgICAgICAgICAgICBzaG93OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGN1c3RvbToge1xyXG4gICAgICAgICAgICAgICAgICAgIGhpZGU6IGZ1bmN0aW9uKGxheWVyKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGF5ZXIucmVtb3ZlQ2xhc3MoJ3Nob3ctdXAnKS5hZGRDbGFzcygnaGlkZS11cCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihDc3NzdXBvcnQudHJhbnNpdGlvbil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF5ZXIuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmhpZGVhZnRlcmNhbC5maXJlKCk7IC8v5bGC6ZqQ6JeP5ZCO5Zue6LCDXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LDMwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF5ZXIuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuaGlkZWFmdGVyY2FsLmZpcmUoKTsgLy/lsYLpmpDol4/lkI7lm57osINcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgbWFzazoge1xyXG4gICAgICAgICAgICAgICAgY2xhc3NuYW1lOiAnY29yZXVpLWctbWFzaycsXHJcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiBDc3NzdXBvcnQudHJhbnNpdGlvbj8gMDogMC42LFxyXG4gICAgICAgICAgICAgICAgY3VzdG9tOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaGlkZTogZnVuY3Rpb24obWFzayl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKENzc3N1cG9ydC50cmFuc2l0aW9uKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hc2suY3NzKCdvcGFjaXR5JywwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXNrLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sMzAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXNrLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgc2hvdzogZnVuY3Rpb24obWFzayl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKENzc3N1cG9ydC50cmFuc2l0aW9uKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hc2suc2hvdygpLmNzcygnb3BhY2l0eScsMC42KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXNrLnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sY29uZmlnIHx8IHt9KTtcclxuXHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHZhciBfbGF5ZXIgPSB0aGlzLmxheWVyO1xyXG5cclxuICAgICAgICBfbGF5ZXIuYWRkQ2xhc3MoJ2hpZGUtdXAnKTtcclxuXHJcbiAgICAgICAgdGhpcy5wb3MucG9zY2FsLmFkZChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBfbGF5ZXIucmVtb3ZlQ2xhc3MoJ2hpZGUtdXAnKS5hZGRDbGFzcygnc2hvdy11cCcpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGhpZGUoKXtcclxuICAgICAgICBpZih0aGlzLmlzc2hvdygpKXtcclxuXHRcdFx0dGhpcy5oaWRlYmVmb3JlY2FsLmZpcmUoKTsgLy/lsYLpmpDol4/liY3lm57osINcclxuXHRcdFx0dGhpcy5tYXNrICYmIHRoaXMubWFzay5oaWRlKCk7XHJcblx0XHRcdHRoaXMuX2hpZGUoKTtcclxuXHRcdH1cclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBVSUxheWVyO1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyBsb2FkaW5nIOaPkOekuuWxglxyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE2LTAxLTA2IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm5cclxuICogKi9cclxuIGNvbnN0IFVJTGF5ZXIgPSByZXF1aXJlKCcuL3VpLmxheWVyLmpzJyksXHJcbiAgICAgICAgV29ya2VyQ29udHJvbCA9IHJlcXVpcmUoJ2xpYnV0aWwtd29ya2VyQ29udHJvbCcpO1xyXG5cclxudmFyIHdvcmtlckNvbnRyb2wgPSBuZXcgV29ya2VyQ29udHJvbCgpO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlTG9hZGluZyh3b3JrZXIpe1xyXG4gICAgd29ya2VyLmxvYWRpbmcgPSBuZXcgVUlMYXllcih7XHJcbiAgICAgICAgbGF5ZXI6IHtcclxuICAgICAgICAgICAgY2xhc3NuYW1lOiAnY29yZXVpLWctbGF5ZXIgY29yZXVpLWctbGF5ZXItbG9hZGluZydcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1hc2s6IHtcclxuICAgICAgICAgICAgYmdjb2xvcjogJ3RyYW5zcGFyZW50JyAvL+iDjOaZr+iJslxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHdvcmtlci5sb2FkaW5nLmhpZGVhZnRlcmNhbC5hZGQoZnVuY3Rpb24oKXtcclxuICAgICAgICB3b3JrZXIubG9hZGluZy5kZXN0cm95KCk7XHJcbiAgICAgICAgd29ya2VyLmxvYWRpbmcgPSBudWxsO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHdvcmtlci5sb2FkaW5nO1xyXG59XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBzaG93OiBmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciBsb2FkaW5nID0gY3JlYXRlTG9hZGluZyh3b3JrZXJDb250cm9sLmdldCgpKTtcclxuICAgICAgICBsb2FkaW5nLnNob3coKTtcclxuICAgIH0sXHJcbiAgICBoaWRlOiBmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciB3b3JrZXIgPSB3b3JrZXJDb250cm9sLmVuZCgpO1xyXG4gICAgICAgIGlmKHdvcmtlcil7XHJcbiAgICAgICAgICAgIHdvcmtlci5sb2FkaW5nLmhpZGUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcgdG9hc3Qg5o+Q56S65bGCXHJcbiAqIEB2ZXJzaW9uIDEuMCB8IDIwMTYtMDEtMDYg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQHJldHVyblxyXG4gKiAqL1xyXG4gY29uc3QgVUlMYXllciA9IHJlcXVpcmUoJy4vdWkubGF5ZXIuanMnKSxcclxuICAgICAgICBXb3JrZXJDb250cm9sID0gcmVxdWlyZSgnbGlidXRpbC13b3JrZXJDb250cm9sJyk7XHJcblxyXG52YXIgd29ya2VyQ29udHJvbCA9IG5ldyBXb3JrZXJDb250cm9sKCk7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVUb2FzdCh3b3JrZXIpe1xyXG4gICAgd29ya2VyLnRvYXN0ID0gbmV3IFVJTGF5ZXIoe1xyXG4gICAgICAgIGxheWVyOiB7XHJcbiAgICAgICAgICAgIGNsYXNzbmFtZTogJ2NvcmV1aS1nLWxheWVyIGNvcmV1aS1nLWxheWVyLXRvYXN0J1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWFzazoge1xyXG4gICAgICAgICAgICBiZ2NvbG9yOiAnI2ZmZicgLy/og4zmma/oibJcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB3b3JrZXIudG9hc3QuaGlkZWFmdGVyY2FsLmFkZChmdW5jdGlvbigpe1xyXG4gICAgICAgIHdvcmtlci50b2FzdC5kZXN0cm95KCk7XHJcbiAgICAgICAgd29ya2VyLnRvYXN0ID0gbnVsbDtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiB3b3JrZXIudG9hc3Q7XHJcbn1cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIHNob3c6IGZ1bmN0aW9uKGNvbnRlbnQsaGlkZWFmdGVyY2FsKXtcclxuICAgICAgICB2YXIgdG9hc3QgPSBjcmVhdGVUb2FzdCh3b3JrZXJDb250cm9sLmdldCgpKTtcclxuICAgICAgICB0b2FzdC5zZXRDb250ZW50KGNvbnRlbnQpO1xyXG4gICAgICAgIHRvYXN0LmhpZGVhZnRlcmNhbC5hZGQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgaWYodHlwZW9mIGhpZGVhZnRlcmNhbCA9PSAnZnVuY3Rpb24nKXtcclxuICAgICAgICAgICAgICAgIGhpZGVhZnRlcmNhbCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdG9hc3Quc2hvdygpO1xyXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdG9hc3QuaGlkZSgpO1xyXG4gICAgICAgIH0sMjAwMCk7XHJcbiAgICB9XHJcbn1cclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcgaW/mjqXlj6Por7fmsYLmjqfliLblmajvvIzlnKgkLmFqYXjkuIrov5vooYzov5vkuIDmraXlsIHoo4VcclxuICogICAgICAxLiDmlK/mjIHmjqXlj6PpmJ/liJfor7fmsYJcclxuICogICAgICAyLiDmlK/mjIHmjqXlj6PmlbDmja7nvJPlrZhcclxuICogICAgICAzLiDmlK/mjIHmjqXlj6Pnu5/kuIDkuJrliqHplJnor6/lj4rlhbbku5bmg4XlhrXlpITnkIZcclxuICogQHZlcnNpb24gMS4wIHwgMjAxNS0wNi0yOCDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAcmV0dXJuIOabtOWkmuivpue7huS/oeaBr+WPguiAg+S7o+eggemHjOWvueW6lOWumuS5ieaWueazleaIluWxnuaAp+S9jee9rueahOazqOmHiuivtOaYjlxyXG4gKiBcdHRyYW5zUmVxdWVzdCB7RnVuY3Rpb259IOaJp+ihjOaOpeWPo+aOpeWPo+ivt+axglxyXG4gKiAgdHJhbnNRdWV1ZVJlcXVlc3Qge0Z1bmN0aW9ufSDlr7nkuIDnu4Tor7fmsYLov5vooYzljZXni6znmoTpmJ/liJfmjqfliLbkvp3mrKHor7fmsYLjgILlhajpg6jor7fmsYLlrozmr5XlkI7ov5vooYzpgJrnn6XjgIJcclxuICogQGV4YW1wbGVcclxuICogICB2YXIgYmFzZWhvc3QgPSAnaHR0cDovLzEyNy4wLjAuMTo4MDAwJztcclxuICpcclxuICogXHQgY29uc3QgSW50ZXJJbyA9IHJlcXVpcmUoJ2xpYmlvLWludGVyaW8nKTtcclxuICpcclxuICogXHQgSW50ZXJJby50cmFuc1JlcXVlc3Qoe1xyXG5cdFx0IHVybDogYmFzZWhvc3QrJy9saXN0ZGF0YScsXHJcblx0XHQgbWV0aG9kOidQT1NUJyxcclxuXHRcdCBkYXRhOiB7J25hbWUnOiAnem1yZGxiJ31cclxuXHQgfSx7XHJcblx0XHQgc3VjY2VzczogZnVuY3Rpb24oZGF0YSl7XHJcblx0XHRcdCBjb25zb2xlLmxvZyhkYXRhKTtcclxuXHRcdCB9XHJcblx0XHQgLy8gZmFpbDogZnVuY3Rpb24oKXtcclxuXHRcdCAvLyAgICAgY29uc29sZS5sb2coJ+imhueblue7n+S4gGZhaWzlpITnkIYnKTtcclxuXHRcdCAvLyB9LFxyXG5cdFx0IC8vIGVycm9yOiBmdW5jdGlvbigpe1xyXG5cdFx0IC8vICAgICBjb25zb2xlLmxvZygn6KaG55uW57uf5LiAZXJyb3LlpITnkIYnKTtcclxuXHRcdCAvLyB9LFxyXG5cdFx0IC8vIGNvbXBsZXRlOiBmdW5jdGlvbigpe1xyXG5cdFx0IC8vICAgICBjb25zb2xlLmxvZygn5a6M5oiQJyk7XHJcblx0XHQgLy8gfVxyXG5cdCB9KTtcclxuICogKi9cclxuXHJcbmNvbnN0IElvQ29uZmlnID0gcmVxdWlyZSgnLi9pb2NvbmZpZy5qcycpLFxyXG5cdFx0U3RvcmFnZSA9IHJlcXVpcmUoJy4vc3RvcmFnZS5qcycpO1xyXG5cclxuLy/or7fmsYLpmJ/liJfmjqfliLbnsbtcclxuZnVuY3Rpb24gcXVldWVIYW5kbGUoKXtcclxuXHR0aGlzLnF1ZXVlID0gW107IC8v5b2T5YmN6Zif5YiX5pWw5o2uXHJcblx0dGhpcy5pbnByb2Nlc3MgPSBmYWxzZTsgLy/lvZPliY3pmJ/liJfmjqXlj6PmmK/lkKbmraPlnKjlpITnkIZcclxuXHR0aGlzLmNvbXBsZXRlID0gZnVuY3Rpb24oKXt9OyAvL+mYn+WIl+ivt+axguWujOaIkOWQjueahOWbnuiwg1xyXG59O1xyXG4vL+aJp+ihjOmYn+WIl+aVsOaNruivt+axglxyXG5xdWV1ZUhhbmRsZS5wcm90b3R5cGUuYWR2YW5jZSA9IGZ1bmN0aW9uKCl7XHJcblx0aWYodGhpcy5xdWV1ZS5sZW5ndGggPT0gMCl7XHJcblx0XHR0aGlzLmlucHJvY2VzcyA9IGZhbHNlO1xyXG5cdFx0aWYodHlwZW9mIHRoaXMuY29tcGxldGUgPT0gJ2Z1bmN0aW9uJyl7XHJcblx0XHRcdHRoaXMuY29tcGxldGUoKTtcclxuXHRcdH1cclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0dmFyIHJlcSA9IHRoaXMucXVldWUuc2hpZnQoKTtcclxuXHR0aGlzLnJlcXVlc3QocmVxLHRydWUpO1xyXG59O1xyXG4vKipcclxuKiDmt7vliqDmjqXlj6Por7fmsYLlpITnkIZcclxuKiBAcGFyYW0ge0pTT059ICpvcHQgZm9ybWF05ZCO55qE5o6l5Y+j5Y+C5pWwXHJcbiogQHBhcmFtIHtCb29sZWFufSBhZHZhbmNlIOaYr+WQpuaYr3F1ZXVlSGFuZGVyLmFkdmFuY2XosIPnlKhcclxuKi9cclxucXVldWVIYW5kbGUucHJvdG90eXBlLnJlcXVlc3QgPSBmdW5jdGlvbihvcHQsYWR2YW5jZSl7XHJcblx0aWYodGhpcy5pbnByb2Nlc3MgJiYgIWFkdmFuY2Upe1xyXG5cdFx0dGhpcy5xdWV1ZS5wdXNoKG9wdCk7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cdHRoaXMuaW5wcm9jZXNzID0gdHJ1ZTtcclxuXHRyZXF1ZXN0KG9wdCk7XHJcbn07XHJcbi8qKlxyXG4gKiBxdWV1ZUhhbmRsZeWvueixoeaOp+WItuWZqFxyXG4gKi9cclxudmFyIHF1ZXVlQ29udHJvbCA9IHtcclxuXHRfcXVldWVvYmpzOiBbXSwgLy9xdWV1ZUhhbmRsZeWvueixoeWIl+ihqFxyXG5cdGdldDogZnVuY3Rpb24oKXsgLy/ov5Tlm57lvZPliY3nqbrpl7LnmoRxdWV1ZUhhbmRsZeWvueixoVxyXG5cdFx0dmFyIGN1cnF1ZXVlID0gbnVsbDtcclxuXHRcdHZhciBxdWV1ZW9ianMgPSB0aGlzLl9xdWV1ZW9ianM7XHJcblx0XHRmb3IodmFyIGkgPSAwLCBsZW4gPSBxdWV1ZW9ianMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xyXG5cdFx0XHRpZihxdWV1ZW9ianNbaV0uaW5wcm9jZXNzID09IGZhbHNlICYmIHF1ZXVlb2Jqc1tpXS5sb2NrID09IGZhbHNlKXsgLy/ml6Lml6Dor7fmsYLlj4jmsqHmnInooqvplIHlrppcclxuXHRcdFx0XHRxdWV1ZW9ianNbaV0ubG9jayA9IHRydWU7XHJcblx0XHRcdFx0Y3VycXVldWUgPSBxdWV1ZW9ianNbaV07XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGlmKGN1cnF1ZXVlID09IG51bGwpe1xyXG5cdFx0XHRjdXJxdWV1ZSA9IG5ldyBxdWV1ZUhhbmRsZSgpO1xyXG5cdFx0XHRjdXJxdWV1ZS5sb2NrID0gdHJ1ZTtcclxuXHRcdFx0dGhpcy5fcXVldWVvYmpzLnB1c2goY3VycXVldWUpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGN1cnF1ZXVlO1xyXG5cdH0sXHJcblx0ZW5kOiBmdW5jdGlvbihxdWV1ZSl7IC8v6YCa55+l5b2T5YmNcXVldWVIYW5kbGXlr7nosaHlt7Lnu4/kvb/nlKjlrozmr5VcclxuXHRcdHZhciBxdWV1ZW9ianMgPSB0aGlzLl9xdWV1ZW9ianM7XHJcblx0XHRmb3IodmFyIGkgPSAwLCBsZW4gPSBxdWV1ZW9ianMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xyXG5cdFx0XHRpZihxdWV1ZW9ianNbaV0gPT0gcXVldWUpeyAvL+aXouaXoOivt+axguWPiOayoeacieiiq+mUgeWumlxyXG5cdFx0XHRcdHF1ZXVlb2Jqc1tpXS5sb2NrID0gZmFsc2U7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcbn07XHJcbi8qKlxyXG4gKiDmoLzlvI/ljJZpb+aOpeWPo+ivt+axguWPguaVsFxyXG4gKiBAcGFyYW0ge0pTT059ICppb29wdCDmlbDmja7mjqXlj6Plj4LmlbBcclxuICogcGFyYW0ge0pTT059ICppb2NhbGwgaW/or7fmsYLlm57osINcclxuICogQHBhcmFtIHtxdWV1ZUhhbmRsZX0gKnF1ZXVlb2JqIOmYn+WIl+aOp+WItuWZqOWvueixoVxyXG4gKi9cclxuZnVuY3Rpb24gZm9ybWF0KGlvYXJncyxpb2NhbGwscXVldWVvYmope1xyXG5cdHZhciBfaW9hcmdzID0ge30sIF9pb2NhbGwgPSB7fTtcclxuXHQkLmV4dGVuZCh0cnVlLF9pb2FyZ3MsSW9Db25maWcuaW9hcmdzLGlvYXJncyk7XHJcblx0JC5leHRlbmQodHJ1ZSxfaW9jYWxsLElvQ29uZmlnLmlvY2FsbCxpb2NhbGwpO1xyXG5cdElvQ29uZmlnLmZvcm1hdChfaW9hcmdzKTtcclxuXHR2YXIgb2xkc3VjY2VzcyA9IF9pb2NhbGwuc3VjY2VzcztcclxuXHR2YXIgb2xkY29tcGxldGUgPSBfaW9jYWxsLmNvbXBsZXRlO1xyXG5cdHZhciBkZWFsbG9naW4gPSBfaW9hcmdzLmN1c3RvbWNvbmZpZy5kZWFsbG9naW47XHJcblx0dmFyIGRlYWxmYWlsID0gX2lvYXJncy5jdXN0b21jb25maWcuZGVhbGZhaWw7XHJcblx0dmFyIGRlYWxkYXRhID0gX2lvYXJncy5jdXN0b21jb25maWcuZGVhbGRhdGE7XHJcblx0X2lvY2FsbC5zdWNjZXNzID0gZnVuY3Rpb24oZGF0YSwgdGV4dFN0YXR1cywganFYSFIpeyAvL+mHjeWGmXN1Y2Nlc3Pmlrnms5XvvIznlKjmnaXlpITnkIbmnKrnmbvpmYbpl67pophcclxuXHRcdGlmKGRlYWxsb2dpbiAmJiB0eXBlb2YgSW9Db25maWcubG9naW4uZmlsdGVyID09ICdmdW5jdGlvbicpeyAvL+ebkea1i+aYr+WQpuacieacqueZu+mZhumUmeivr+WkhOeQhlxyXG5cdFx0XHRpZihJb0NvbmZpZy5sb2dpbi5maWx0ZXIoZGF0YSkpeyAvL+acqueZu+W9lVxyXG5cdFx0XHQgICAgaWYoSW9Db25maWcubG9naW4udXJsICE9ICcnKXsgLy/ot7Povax1cmxcclxuXHRcdFx0ICAgICAgICB2YXIgbG9naW51cmwgPSBJb0NvbmZpZy5sb2dpbi51cmw7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlYXJjaCA9IElvQ29uZmlnLmxvZ2luLmtleSsnPScrZW5jb2RlVVJJQ29tcG9uZW50KGxvY2F0aW9uLmhyZWYpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKGxvZ2ludXJsLmxhc3RJbmRleE9mKCc/JykgIT0gLTEpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dpbnVybCA9IGxvZ2ludXJsLnJlcGxhY2UoL1xcPy8sJz8nK3NlYXJjaCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2ludXJsID0gbG9naW51cmwrJz8nK3NlYXJjaDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9IGxvZ2ludXJsO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHRcdFx0ICAgIH1lbHNlIGlmKHR5cGVvZiBJb0NvbmZpZy5sb2dpbi5kZWFsID09ICdmdW5jdGlvbicpe1xyXG5cdFx0XHQgICAgICAgIElvQ29uZmlnLmxvZ2luLmRlYWwoZGF0YSk7XHJcblx0XHRcdCAgICAgICAgcmV0dXJuO1xyXG5cdFx0XHQgICAgfVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRpZihkZWFsZmFpbCAmJiB0eXBlb2YgSW9Db25maWcuZmFpbC5maWx0ZXIgPT0gJ2Z1bmN0aW9uJyl7IC8v5qOA5rWL5piv5ZCm5pyJ5Lia5Yqh6ZSZ6K+v5aSE55CGXHJcblx0XHQgICAgaWYoSW9Db25maWcuZmFpbC5maWx0ZXIoZGF0YSkpeyAvL+S4muWKoemUmeivr1xyXG5cdFx0ICAgICAgICBpZih0eXBlb2YgX2lvY2FsbFtJb0NvbmZpZy5mYWlsLmZ1bm5hbWVdID09ICdmdW5jdGlvbicpe1xyXG5cdFx0ICAgICAgICAgICAgX2lvY2FsbFtJb0NvbmZpZy5mYWlsLmZ1bm5hbWVdKGRhdGEsIHRleHRTdGF0dXMsIGpxWEhSKTtcclxuXHRcdCAgICAgICAgfVxyXG5cdFx0ICAgIH1lbHNleyAvL+S4muWKoeaIkOWKn1xyXG5cdFx0ICAgICAgICBpZihkZWFsZGF0YSl7IC8v57uf5LiA5aSE55CG5Lia5Yqh5oiQ5Yqf5pWw5o2uXHJcblx0XHQgICAgICAgICAgICB0eXBlb2Ygb2xkc3VjY2VzcyA9PSAnZnVuY3Rpb24nICYmIG9sZHN1Y2Nlc3MoX2lvYXJncy5kZWFsZGF0YShkYXRhLCB0ZXh0U3RhdHVzLCBqcVhIUiksIHRleHRTdGF0dXMsIGpxWEhSKTtcclxuXHRcdCAgICAgICAgfWVsc2V7XHJcblx0XHQgICAgICAgICAgICB0eXBlb2Ygb2xkc3VjY2VzcyA9PSAnZnVuY3Rpb24nICYmIG9sZHN1Y2Nlc3MoZGF0YSwgdGV4dFN0YXR1cywganFYSFIpO1xyXG5cdFx0ICAgICAgICB9XHJcblx0XHQgICAgfVxyXG5cdFx0fWVsc2V7XHJcblx0XHQgICAgdHlwZW9mIG9sZHN1Y2Nlc3MgPT0gJ2Z1bmN0aW9uJyAmJiBvbGRzdWNjZXNzKGRhdGEsIHRleHRTdGF0dXMsIGpxWEhSKTtcclxuXHRcdH1cclxuXHR9O1xyXG5cdGlmKF9pb2FyZ3MuY3VzdG9tY29uZmlnLnF1ZXVlKXsgLy/or7TmmI7mjqXlj6PlkIzmhI/ov5vooYzpmJ/liJfmjqfliLZcclxuXHRcdF9pb2NhbGwuY29tcGxldGUgPSBmdW5jdGlvbigpeyAvL+mHjeWGmeaOpeWPo+ivt+axguWujOaIkOS6i+S7tlxyXG5cdFx0XHRxdWV1ZW9iai5hZHZhbmNlKCk7XHJcblx0XHRcdHR5cGVvZiBvbGRjb21wbGV0ZSA9PSAnZnVuY3Rpb24nICYmIG9sZGNvbXBsZXRlLmFwcGx5KHRoaXMsQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XHJcblx0XHR9O1xyXG5cdH1cclxuXHRyZXR1cm4ge1xyXG5cdFx0aW9hcmdzOiBfaW9hcmdzLFxyXG5cdFx0aW9jYWxsOiBfaW9jYWxsXHJcblx0fTtcclxufVxyXG5mdW5jdGlvbiBkb2FqYXgoaW9hcmdzLGlvY2FsbCl7XHJcblx0dmFyIGludGVyb2JqID0gbnVsbCxcclxuXHRcdGdldEludGVyID0gaW9hcmdzLmN1c3RvbWNvbmZpZy5nZXRJbnRlcixcclxuXHRcdHN0b3JhZ2UgPSBpb2FyZ3MuY3VzdG9tY29uZmlnLnN0b3JhZ2U7XHJcblx0ZGVsZXRlIGlvYXJncy5jdXN0b21jb25maWc7XHJcblxyXG5cdGludGVyb2JqID0gJC5hamF4KGlvYXJncykuZG9uZShpb2NhbGwuc3VjY2VzcykuZmFpbChpb2NhbGwuZXJyb3IpLmFsd2F5cyhpb2NhbGwuY29tcGxldGUpLmRvbmUoZnVuY3Rpb24oZGF0YSl7XHJcblx0XHRpZihzdG9yYWdlICYmIHN0b3JhZ2UgaW5zdGFuY2VvZiBTdG9yYWdlKXtcclxuXHRcdFx0c3RvcmFnZS5zZXQoZGF0YSk7XHJcblx0XHR9XHJcblx0fSk7XHJcblx0aWYoaW50ZXJvYmogJiYgdHlwZW9mIGdldEludGVyID09ICdmdW5jdGlvbicpe1xyXG5cdFx0Z2V0SW50ZXIoaW50ZXJvYmopO1xyXG5cdH1cclxufVxyXG4vKipcclxuICog5aSE55CG5o6l5Y+j6K+35rGCXHJcbiAqIEBwYXJhbSB7SlNPTn0gaW9vcHQgZm9ybWF05ZCO55qE5o6l5Y+j5Y+C5pWwXHJcbiAqL1xyXG5mdW5jdGlvbiByZXF1ZXN0KGlvb3B0KXtcclxuXHR2YXIgX2lvYXJncyA9IGlvb3B0LmlvYXJncyxcclxuXHRcdF9pb2NhbGwgPSBpb29wdC5pb2NhbGwsXHJcblx0XHRtb2RlID0gX2lvYXJncy5jdXN0b21jb25maWcubW9kZSxcclxuXHRcdGNsZWFyYWxsID0gX2lvYXJncy5jdXN0b21jb25maWcuY2xlYXJhbGwsXHJcblx0XHRzdG9yYWdlID0gX2lvYXJncy5jdXN0b21jb25maWcuc3RvcmFnZSxcclxuXHRcdGNhY2hlZGF0YSA9IG51bGw7XHJcblxyXG5cdC8v5riF6Zmk5omA5pyJ57yT5a2YXHJcblx0aWYoY2xlYXJhbGwpe1xyXG5cdFx0U3RvcmFnZS5jbGVhcigpO1xyXG5cdH1cclxuXHJcblx0Ly/mmK/lkKbmnInnvJPlrZhcclxuXHRpZihzdG9yYWdlICYmIHN0b3JhZ2UgaW5zdGFuY2VvZiBTdG9yYWdlICYmICgoY2FjaGVkYXRhID0gc3RvcmFnZS5nZXQoKSkgIT0gbnVsbCkpe1xyXG5cdFx0X2lvY2FsbC5zdWNjZXNzKGNhY2hlZGF0YSwgJ3N1Y2Nlc3MnLCBudWxsKTtcclxuXHRcdF9pb2NhbGwuY29tcGxldGUoKTtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblxyXG5cdGlmKG1vZGUgPT0gJ2FqYXgnKXtcclxuXHRcdGlmKF9pb2FyZ3MuZGF0YVR5cGUgPT0gdW5kZWZpbmVkIHx8IF9pb2FyZ3MuZGF0YVR5cGUgPT0gJycpe1xyXG5cdFx0XHRfaW9hcmdzLmRhdGFUeXBlID0gJ2pzb24nO1xyXG5cdFx0fVxyXG5cdFx0ZG9hamF4KF9pb2FyZ3MsX2lvY2FsbCk7XHJcblx0fWVsc2UgaWYobW9kZSA9PSAnanNvbnAnKXtcclxuXHRcdF9pb2FyZ3MuZGF0YVR5cGUgPSAnanNvbnAnO1xyXG5cdFx0X2lvYXJncy5jcm9zc0RvbWFpbiA9IHRydWU7XHJcblx0XHRkb2FqYXgoX2lvYXJncyxfaW9jYWxsKTtcclxuXHR9ZWxzZSBpZihtb2RlID09ICdzY3JpcHQnKXtcclxuXHRcdF9pb2FyZ3MuZGF0YVR5cGUgPSAnc2NyaXB0JztcclxuXHRcdF9pb2FyZ3MuY3Jvc3NEb21haW4gPSB0cnVlO1xyXG5cdFx0ZG9hamF4KF9pb2FyZ3MsX2lvY2FsbCk7XHJcblx0fVxyXG59XHJcbnZhciBtYWlucXVldWUgPSBuZXcgcXVldWVIYW5kbGUoKTsgLy/kuLvnur/nqIvpmJ/liJfmjqfliLblr7nosaFcclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0LyoqXHJcblx0ICog5omn6KGM5o6l5Y+j6K+35rGCXHJcbiAgICAgKiBAcGFyYW0ge0pTT059ICppb2FyZ3Mg5o6l5Y+j5omp5bGV5Y+C5pWw44CC5a+55bqUaW9jb25maWcuanPph4znmoRpb2FyZ3PphY3nva7moLzlvI9cclxuICAgICAqIEBwYXJhbSB7SlNPTn0gKmlvY2FsbCDmjqXlj6PmianlsZXlj4LmlbDjgILlr7nlupRpb2NvbmZpZy5qc+mHjOeahGlvY2FsbOmFjee9ruagvOW8j1xyXG5cdCAqL1xyXG5cdHRyYW5zUmVxdWVzdDogZnVuY3Rpb24oaW9hcmdzLGlvY2FsbCl7XHJcblx0XHRpZihpb2FyZ3MgJiYgaW9jYWxsICYmIGlvYXJncy51cmwgIT0gJycpe1xyXG5cdFx0XHR2YXIgY3Vyb3B0ID0gZm9ybWF0KGlvYXJncyxpb2NhbGwsbWFpbnF1ZXVlKTtcclxuXHRcdFx0aWYoY3Vyb3B0LmlvYXJncy5jdXN0b21jb25maWcucXVldWUpeyAvL+ivtOaYjumBteW+qumYn+WIl+aOp+WItlxyXG5cdFx0XHRcdG1haW5xdWV1ZS5yZXF1ZXN0KGN1cm9wdCk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZXtcclxuXHRcdFx0XHRyZXF1ZXN0KGN1cm9wdCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9LFxyXG5cdC8qKlxyXG5cdCAqIOWvueS4gOe7hOivt+axgui/m+ihjOWNleeLrOeahOmYn+WIl+aOp+WItuS+neasoeivt+axguOAguWFqOmDqOivt+axguWujOavleWQjui/m+ihjOmAmuefpeOAglxyXG5cdCAqIOatpOaDheWGteS4i++8jOmAmui/h2lvYXJnc+iuvue9rueahOWPguaVsOmFjee9rmN1c3RvbWNvbmZpZzp7cXVldWU6dHJ1ZXxmYWxzZX3ml6DmlYjjgILlvLrliLbpg73otbDpmJ/liJdcclxuXHRcdCAqIEBwYXJhbSB7QXJyYXl9ICphcmdzYXJyIOaOpeWPo+ivt+axguaVsOe7hFxyXG5cdFx0ICogW3tcclxuXHRcdCAqICAgIHtKU09OfSAqaW9hcmdzIOaOpeWPo+aJqeWxleWPguaVsOOAguWvueW6lGlvY29uZmlnLmpz6YeM55qEaW9hcmdz6YWN572u5qC85byPXHJcblx0XHQgKiAgICB7SlNPTn0gKmlvY2FsbCDmjqXlj6PmianlsZXlj4LmlbDjgILlr7nlupRpb2NvbmZpZy5qc+mHjOeahGlvY2FsbOmFjee9ruagvOW8j1xyXG5cdFx0ICogfV1cclxuXHRcdCAqIEBwYXJhbSB7SlNPTn0gY3VzdG9tb2JqIOeUqOaIt+iHquWumuS5ieaJqeWxleWPguaVsFxyXG5cdFx0ICoge1xyXG5cdFx0ICogXHQgIHtGdW5jdGlvbn0gY29tcGxldGUg5o6l5Y+j5YWo6YOo6K+35rGC5a6M5q+V5ZCO55qE6YCa55+l5Zue6LCDXHJcblx0XHQgKiB9XHJcblx0ICovXHJcblx0dHJhbnNRdWV1ZVJlcXVlc3Q6IGZ1bmN0aW9uKGFyZ3NhcnIsY3VzdG9tb2JqKXtcclxuXHRcdGlmKCQuaXNBcnJheShhcmdzYXJyKSAmJiBhcmdzYXJyLmxlbmd0aCA+IDApe1xyXG5cdFx0XHR2YXIgcXVldWVvYmogPSBxdWV1ZUNvbnRyb2wuZ2V0KCk7IC8v6I635Y+W5LiA5Liq56m66Zey55qEcXVldWVIYW5kbGVcclxuXHRcdFx0cXVldWVvYmouY29tcGxldGUgPSBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdHF1ZXVlQ29udHJvbC5lbmQocXVldWVvYmopOyAvL+mAmuefpeW9k+WJjXF1ZXVl5a+56LGh5L2/55So5a6M5q+VXHJcblx0XHRcdFx0aWYoY3VzdG9tb2JqICYmIHR5cGVvZiBjdXN0b21vYmouY29tcGxldGUgPT0gJ2Z1bmN0aW9uJyl7XHJcblx0XHRcdFx0XHRjdXN0b21vYmouY29tcGxldGUoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH07XHJcblx0XHRcdGZvcih2YXIgaSA9IDAsIGxlbiA9IGFyZ3NhcnIubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xyXG5cdFx0XHRcdHZhciBpb2FyZ3MgPSBhcmdzYXJyW2ldLmlvYXJncyB8fCB7fTtcclxuXHRcdFx0XHR2YXIgaW9jYWxsID0gYXJnc2FycltpXS5pb2NhbGwgfHwge307XHJcblx0XHRcdFx0aWYoaW9hcmdzICYmIGlvY2FsbCAmJiBpb2FyZ3MudXJsICE9ICcnKXtcclxuXHRcdFx0XHRcdGlvYXJncyA9ICQuZXh0ZW5kKHRydWUsaW9hcmdzLHtjdXN0b21jb25maWc6e3F1ZXVlOnRydWV9fSk7XHJcblx0XHRcdFx0XHR2YXIgY3Vyb3B0ID0gZm9ybWF0KGlvYXJncyxpb2NhbGwscXVldWVvYmopO1xyXG5cdFx0XHRcdFx0cXVldWVvYmoucmVxdWVzdChjdXJvcHQpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcgaW/mjqXlj6Por7fmsYLnm7jlhbPmlbDmja7phY3nva5cclxuICogQHZlcnNpb24gMS4wIHwgMjAxNS0wNi0yOCDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAcmV0dXJuIOabtOWkmuivpue7huS/oeaBr+WPguiAg+S7o+eggemHjOWvueW6lOWumuS5ieaWueazleaIluWxnuaAp+S9jee9rueahOazqOmHiuivtOaYjlxyXG4gKiBcdGxvZ2luIHtKU09OfSDlr7nkuo7mjqXlj6Pov5Tlm57mnKrnmbvpmYbplJnor6/ov5vooYznu5/kuIDlpITnkIbphY3nva5cclxuICogIGlvYXJncyB7SlNPTn0gaW/or7fmsYLmjqXlj6Ppu5jorqTlj4LmlbBcclxuICogIHNldFRyYW5zIHtGdW5jdGlvbn0g6K6+572u5o6l5Y+j6YWN572uXHJcbiAqICBnZXRUcmFucyB7RnVuY3Rpb259IOiOt+WPluaOpeWPo+mFjee9rlxyXG4gKiAgZ2xvYmFsU2V0dXAge0Z1bmN0aW9ufSDorr7nva7lhajlsYBhamF46YWN572uXHJcbiAqIEBleGFtcGxlXHJcbiAqIFx0XHRjb25zdCBJb0NvbmZpZyA9IHJlcXVpcmUoJ2xpYmlvLWlvY29uZmlnJyk7XHJcbiAqXHJcblx0IFx0IC8v57uf5LiA5aSE55CG5pyq55m75b2VXHJcblx0XHQgSW9Db25maWcubG9naW4uZmlsdGVyID0gZnVuY3Rpb24ocmVzdWx0KXtcclxuXHRcdCBcdHJldHVybiByZXN1bHQuY29kZSA9PSAnQTAwMDInO1xyXG5cdFx0IH07XHJcblx0XHQgSW9Db25maWcubG9naW4udXJsID0gJ2h0dHA6Ly9iYWlkdS5jb20vJztcclxuXHJcblx0XHQgLy/miYDmnInmjqXlj6PnmoRpb+S4muWKoemUmeivr+e7n+S4gOWkhOeQhlxyXG5cdFx0IElvQ29uZmlnLmZhaWwuZmlsdGVyID0gZnVuY3Rpb24ocmVzdWx0KSB7XHJcblx0XHQgXHRyZXR1cm4gcmVzdWx0LmNvZGUgIT0gJ0EwMDAxJztcclxuXHRcdCB9O1xyXG5cdFx0IElvQ29uZmlnLmlvY2FsbC5mYWlsID0gZnVuY3Rpb24ocmVzdWx0KXtcclxuXHRcdCBcdGFsZXJ0KHJlc3VsdC5lcnJtc2cgfHwgJ+e9kee7nOmUmeivrycpO1xyXG5cdFx0IH07XHJcblxyXG5cdFx0IElvQ29uZmlnLmlvYXJncy5jcm9zc0RvbWFpbiA9IHRydWU7XHJcbiAqICovXHJcblxyXG4vL3ZhciBpb2NhY2hlID0ge307IC8v5o6l5Y+j55qE6YWN572u6aG557yT5a2Y44CC5qC85byP5Li6e2ludGVybmFtZe+8m2lvYXJnc+mHjOmdoueahOWPguaVsOmFjee9rumhuWpzb27moLzlvI99XHJcbnZhciB0aGF0ID0ge307XHJcbi8qKlxyXG4gKiDlr7nkuo7mjqXlj6Pov5Tlm57mnKrnmbvpmYbplJnor6/ov5vooYznu5/kuIDlpITnkIYg6YWN572u44CCXHJcbiAqL1xyXG50aGF0LmxvZ2luID0ge1xyXG5cdHVybDogJycsIC8v5pyq55m75oOF5Ya15LiL6Lez6L2s55qE6aG16Z2iXHJcblx0a2V5OiAnZ28nLCAvL+i3s+i9rOWIsHVybOaMh+WumumhtemdouS8oOmAkuW9k+WJjemhtemdouWcsOWdgOeahOmUruWAvOWQjeensFxyXG5cdGRlYWw6IGZ1bmN0aW9uKGRhdGEpe30sIC8v5pyJ55qE5oOF5Ya15LiL77yM5LiN5piv6Lez6L2s55m75b2VdXJs77yM6ICM5LiU5by555m75b2V5by55bGC44CC5YiZ5q2k5pe25bCGdXJs6K6+572u5Li6JyfvvIzlsIbnmbvpmYblvLnlsYLlvLnlh7rlpITnkIblhpnlnKjmraTmlrnms5XkuK1cclxuXHRmaWx0ZXI6IGZ1bmN0aW9uKGRhdGEpe3JldHVybiBmYWxzZTt9IC8v5aaC5p6c5q2k5Ye95pWw6L+U5ZuedHJ1ZeWImei3s+i9rHVybOaMh+WumueahOmhtemdouOAgmRhdGHmmK/mjqXlj6Pov5Tlm57nmoTmlbDmja5cclxufTtcclxuLyoqXHJcbiAqIOWvueS6juaOpeWPo+i/lOWbnueahOS4muWKoemUmeivr+i/m+ihjOe7n+S4gOWkhOeQhiDphY3nva7jgIJcclxuICog5aaCY29kZSA9PSAnQTAwMDEnIOeul+aIkOWKn++8jOWFtuS7lumDveeul+Wksei0pVxyXG4gKi9cclxudGhhdC5mYWlsID0ge1xyXG4gICAgZnVubmFtZTogJ2ZhaWwnLCAvL+W9k+WPkeeUn+S4muWKoemUmeivr+eahOaXtuWAme+8jOiwg+eUqOeahOagvOW8j+WQjOS6jmlvYXJnc+mHjOeahOWHveaVsOeahOWHveaVsOWQjeOAgum7mOiupOaYr2Vycm9yXHJcbiAgICBmaWx0ZXI6IGZ1bmN0aW9uKGRhdGEpe3JldHVybiBmYWxzZTt9IC8v5aaC5p6c5q2k5Ye95pWw6L+U5ZuedHJ1ZeWImeivtOaYjuW9k+WJjeaOpeWPo+i/lOWbnuS4muWKoemUmeivr+S/oeaBr+OAgmRhdGHmmK/mjqXlj6Pov5Tlm57nmoTmlbDmja5cclxuICAgIC8qKlxyXG4gICAgICog5aaC5p6c5o6l5Y+X5Lia5Yqh6ZSZ6K+v5L+h5oGv57uf5LiA5aSE55CG77yM5YiZ5Y+v5Lul5oyJ54Wn5Lul5LiL5pa55byP5aGr5YaZ77yaXHJcbiAgICAgKiByZXFpdXJlanMoWydsaWJpby9pb2NvbmZpZyddLGZ1bmN0aW9uKCRpb2NvbmZpZyl7XHJcbiAgICAgKiAgICAgJGlvY29uZmlnLmVycm9yID0ge1xyXG4gICAgICogICAgICAgICBmdW5uYW1lOiAnZmFpbCcsXHJcbiAgICAgKiAgICAgICAgIGZpbHRlcjogZnVuY3Rpb24oZGF0YSl7aWYoZGF0YSAmJiBkYXRhLmVycmNvZGUgIT0gMCl7cmV0dXJuIHRydWU7fX1cclxuICAgICAqICAgICB9O1xyXG4gICAgICogICAgICRpb2NvbmZpZy5pb2FyZ3MuZmFpbCA9IGZ1bmN0aW9uKGRhdGEpeyBhbGVydChkYXRhLmVycm1zZyB8fCAn572R57uc6ZSZ6K+vJyk7IH1cclxuICAgICAqIH0pO1xyXG4gICAgICovXHJcbn07XHJcbnRoYXQuaW9hcmdzID0geyAvL2lv6K+35rGC6buY6K6k55qE5Y+C5pWw5qC85byPXHJcblx0Ly/lkIxhamF45Y+C5pWw5a6Y5pa56K+05piO6aG5XHJcblx0dXJsOiAnJyxcclxuXHRtZXRob2Q6ICdHRVQnLFxyXG5cdGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcclxuXHRkZWFsZGF0YTogZnVuY3Rpb24ocmVzdWx0KXtyZXR1cm4gcmVzdWx0LmRhdGE7fSwgLy/lvZPkuJrliqHlpITnkIbmiJDlip/ml7bvvIzov5Tlm57nu5/kuIDlpITnkIbnmoTmlbDmja5cclxuXHQvL+iHquWumuS5ieaVsOaNrlxyXG5cdGN1c3RvbWNvbmZpZzp7XHJcblx0XHRtb2RlOiAnYWpheCcsIC8v5L2/55So5LuA5LmI5pa55byP6K+35rGC77yM6buY6K6k5pivYWpheChhamF45pa55byP6buY6K6k6L+U5Zue55qE5pivanNvbuagvOW8j+eahOaVsOaNruOAguS5n+WPr+mAmui/h+WcqOWSjG1ldGhvZOWPguaVsOWQjOe6p+eahOS9jee9ruiuvue9rmRhdGFUeXBl5Y+C5pWw5p2l5pS55Y+Y6buY6K6k55qEanNvbuiuvue9rinjgILlj6/nlKjnmoTlj4LmlbDmnIlhamF4fGpzb25wfHNjcmlwdFxyXG5cdCAgICBkZWFsbG9naW46IHRydWUsIC8v5piv5ZCm57uf5LiA5aSE55CG5pyq55m76ZmG6ZSZ6K+vXHJcblx0ICAgIGRlYWxmYWlsOiB0cnVlLCAvL+aYr+WQpue7n+S4gOWkhOeQhuS4muWKoemUmeivr1xyXG5cdCAgICBkZWFsZGF0YTogdHJ1ZSwgLy/lvZPkuJrliqHlpITnkIbmiJDlip/ml7bvvIzmmK/lkKbnu5/kuIDlpITnkIbov5Tlm57nmoTmlbDmja7jgILms6jmhI/vvJrlj6rmnInlvZNkZWFsZXJyb3LkuLp0cnVl5pe277yMZGVhbGRhdGHkuLp0cnVl5omN5pyJ5pWI44CC5ZCm5YiZ5LiN5Lya6LCD55SoZGVhbGRhdGHmlrnms5VcclxuXHQgICAgcXVldWU6IGZhbHNlLCAvL+aOpeWPo+ivt+axguaYr+WQpui/m+ihjOmYn+WIl+aOp+WItu+8jOWNs+W9k+WJjeivt+axguWujOaIkOWQjuaJjeWPr+S7pei/m+ihjOS4i+S4gOS4quivt+axglxyXG5cdFx0c3RvcmFnZTogbnVsbCwgLy9saWJpby9zdG9yYWdl5a+56LGh77yM5o6n5Yi2aW/or7fmsYLmlbDmja7nvJPlrZhcclxuXHRcdGNsZWFyYWxsOiBmYWxzZSwgLy/or7fmsYLmjqXlj6Pml7bvvIzmmK/lkKbmuIXpmaTmiYDmnInnvJPlrZhcclxuXHQgICAgZ2V0SW50ZXI6IGZ1bmN0aW9uKGludGVyb2JqKXt9IC8v6I635Y+W5o6l5Y+j6K+35rGC5a6e5L6L5a+56LGh44CC5aaCaW50ZXJvYmrkuLokLmFqYXgoKei/lOWbnueahOWvueixoVxyXG5cdH1cclxufTtcclxuLyoqXHJcbiAqIOWmguaenGRhdGHmmK/ku47mnKzlnLDnvJPlrZjkuK3or7vlj5bnmoTmlbDmja7vvIzpgqPkuYhzdWNjZXNz5ZKMZmFpbOaWueazleS4reeahOWPguaVsO+8mlxyXG4gKiBcdFx0dGV4dFN0YXR1c+WSjGpxWEhS5YiG5Yir5pivICdzdWNjZXNzJywgbnVsbFxyXG4gKiBAdHlwZSB7T2JqZWN0fVxyXG4gKi9cclxudGhhdC5pb2NhbGwgPSB7IC8vaW/or7fmsYLlm57osINcclxuXHRjb21wbGV0ZTogZnVuY3Rpb24oKXt9LCAvL+WPguaVsOS4uiBkYXRhfGpxWEhSLCB0ZXh0U3RhdHVzLCBqcVhIUnxlcnJvclRocm93blxyXG5cdHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEsIHRleHRTdGF0dXMsIGpxWEhSKXt9LFxyXG5cdGVycm9yOiBmdW5jdGlvbihqcVhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pe2FsZXJ0KCB0ZXh0U3RhdHVzIHx8ICfnvZHnu5zplJnor68nKTsgfSxcclxuXHRmYWlsOiBmdW5jdGlvbihkYXRhLCB0ZXh0U3RhdHVzLCBqcVhIUil7fSAvL+W9k+S4muWKoeWkhOeQhumUmeivr+aXtu+8jOi/lOWbnue7n+S4gOWkhOeQhuS4muWKoemUmeivr1xyXG59O1xyXG4vKipcclxuICog5q+P5Liq6K+35rGC5Y+R6YCB5LmL5YmN77yM57uf5LiA5qC85byP5YyW5Y+C5pWw6YWN572u77yI5qC85byP5ZCMaW9hcmdz77yJ44CCXHJcbiAqIOW6lOeUqOWcuuaZr++8miDmr4/kuKrkuJrliqHpobnnm67pnIDopoHphY3nva7nu5/kuIDnmoTlj4LmlbDlpITnkIbjgIJcclxuICovXHJcbnRoYXQuZm9ybWF0ID0gZnVuY3Rpb24ob3B0KXt9O1xyXG4vKipcclxuICog6K6+572u5YWo5bGA55qE5o6l5Y+j6K+35rGC6YWN572uXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBzZXR0aW5nXHJcbiAqL1xyXG50aGF0Lmdsb2JhbFNldHVwID0gZnVuY3Rpb24oc2V0dGluZyl7XHJcblx0aWYodHlwZW9mIHNldHRpbmcgPT0gJ29iamVjdCcpe1xyXG5cdFx0JC5hamF4U2V0dXAoc2V0dGluZyk7XHJcblx0fVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB0aGF0O1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyDkvb/nlKhsb2NhbFN0b3JhZ2Xov5vooYzmlbDmja7lrZjlgqhcclxuICogQHZlcnNpb24gMS4wIHwgMjAxNy0wNC0xMyDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAcmV0dXJuXHJcbiAqICovXHJcblxyXG4vKipcclxuICog5pWw5o2u5a2Y5YKo57G7XHJcbiAqIEBwYXJhbSB7W3R5cGVdfSBvcHQgW2Rlc2NyaXB0aW9uXVxyXG4gKi9cclxuZnVuY3Rpb24gU3RvcmFnZShvcHQpe1xyXG4gICAgb3B0ID0gJC5leHRlbmQoe1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOWtmOWCqOWRqOacn++8jOm7mOiupOS4ujHlpKnjgILlkI7nvIDor7TmmI5cclxuICAgICAgICAgKiBNOiDmnIhcclxuICAgICAgICAgKiBEOiDml6VcclxuICAgICAgICAgKiBIOiDlsI/ml7ZcclxuICAgICAgICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAgICAgICAqIEBleGFtcGxlIDEuNUQgMC41SCAzTSAxNUQwLjJIXHJcbiAgICAgICAgICog54m55Yir6K+05piO77ya5Y+q5pSv5oyBMeS9jeWwj+aVsFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG1heGFnZTogJzFEJyxcclxuICAgICAgICBrZXk6ICcnIC8vKiDplK7lgLxcclxuICAgIH0sb3B0KTtcclxuXHJcbiAgICBpZihvcHQua2V5ID09ICcnIHx8IG9wdC5tYXhhZ2UgPT0gJycpe1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbGliaW8vc3RvcmFnZSDlj4LmlbDkvKDlhaXplJnor68nKTtcclxuICAgIH1lbHNlIGlmKCEvXigoXFxkKykoXFwuKFsxLTldezF9KSk/KFtNREhdKSkrJC8udGVzdChvcHQubWF4YWdlKSl7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdsaWJpby9zdG9yYWdlIG1heGFnZemFjee9ruagvOW8j+S4jeato+ehricpO1xyXG4gICAgfVxyXG5cclxuICAgIG9wdC5rZXkgPSBTdG9yYWdlLmdyb3VwbmFtZSArICdfJyArIG9wdC5rZXk7XHJcblxyXG4gICAgdGhpcy5vcHQgPSBvcHQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDorqHnrpfov4fmnJ/ml7bpl7TngrlcclxuICogQHJldHVybiB7U3RyaW5nfSBEYXRlVGltZei/h+acn+aXtumXtOeCueWtl+espuS4slxyXG4gKi9cclxuU3RvcmFnZS5wcm90b3R5cGUuX2dldE91dERhdGVUaW1lID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBtYXhhZ2UgPSB0aGlzLm9wdC5tYXhhZ2UsXHJcbiAgICAgICAgbm93dGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpLFxyXG4gICAgICAgIGRpZmZob3VyID0gMCxcclxuICAgICAgICByZWcgPSAvKFxcZCspKFxcLihbMS05XXsxfSkpPyhbTURIXSkvZyxcclxuICAgICAgICByZWFyciA9IG51bGw7XHJcblxyXG4gICAgd2hpbGUoKHJlYXJyID0gcmVnLmV4ZWMobWF4YWdlKSkgIT0gbnVsbCl7XHJcbiAgICAgICAgdmFyIG51bSA9IHJlYXJyWzFdLCAvL+aVtOaVsOmDqOWIhlxyXG4gICAgICAgICAgICBzdWZmaXggPSByZWFycls0XTtcclxuICAgICAgICBpZihyZWFyclsyXSl7IC8v6K+05piO5a2Y5Zyo5bCP5pWwXHJcbiAgICAgICAgICAgIG51bSArPSByZWFyclsyXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbnVtID0gTnVtYmVyKG51bSk7XHJcbiAgICAgICAgc3dpdGNoIChzdWZmaXgpIHtcclxuICAgICAgICAgICAgY2FzZSAnTSc6XHJcbiAgICAgICAgICAgICAgICBkaWZmaG91ciArPSBudW0qMzAqMjQ7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnRCc6XHJcbiAgICAgICAgICAgICAgICBkaWZmaG91ciArPSBudW0qMjQ7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnSCc6XHJcbiAgICAgICAgICAgICAgICBkaWZmaG91ciArPSBudW07XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBub3d0aW1lICs9IGRpZmZob3VyKjYwKjYwKjEwMDA7XHJcblxyXG4gICAgcmV0dXJuIG5vd3RpbWU7XHJcbn07XHJcblxyXG4vKipcclxuICog5pWw5o2u6K6+572uXHJcbiAqIEBwYXJhbSB7SlNPTn0gZGF0YSDlvoXlrZjlgqjnmoTmlbDmja5cclxuICog5a6e6ZmF5a2Y5YKo55qE5pWw5o2u5qC85byP5aaC5LiL77yaXHJcbiAqXHJcbiAqICB7XHJcbiAqICAgICAgZW5kVGltZToge1N0cmluZ31cclxuICogICAgICBkYXRhOiBkYXRhXHJcbiAqICB9XHJcbiAqL1xyXG5TdG9yYWdlLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihkYXRhKXtcclxuICAgIGlmKCFkYXRhIHx8IE9iamVjdC5rZXlzKGRhdGEpLmxlbmd0aCA9PSAwKXtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5vcHQua2V5LCBKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgICAgZW5kVGltZTogdGhpcy5fZ2V0T3V0RGF0ZVRpbWUoKSxcclxuICAgICAgICBkYXRhOiBkYXRhXHJcbiAgICB9KSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDojrflj5bmlbDmja5cclxuICogQHJldHVybiB7SlNPTnxOdWxsfSDov5Tlm55zZXTml7blgJnnmoRkYXRh44CC5aaC5p6c6L+H5pyf5YiZ6L+U5ZuebnVsbFxyXG4gKi9cclxuU3RvcmFnZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oKXtcclxuICAgIC8v5Yik5pat5piv5ZCm6L+H5pyfXHJcbiAgICB2YXIgdmFsdWUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLm9wdC5rZXkpO1xyXG4gICAgaWYodmFsdWUgPT0gbnVsbCl7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9ZWxzZXtcclxuICAgICAgICB2YWx1ZSA9IEpTT04ucGFyc2UodmFsdWUpO1xyXG4gICAgICAgIGlmKE51bWJlcih2YWx1ZS5lbmRUaW1lKSA8PSBuZXcgRGF0ZSgpLmdldFRpbWUoKSl7IC8v6L+H5pyfXHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUuZGF0YTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDliKDpmaTmraTpobnmlbDmja5cclxuICogQHJldHVybiB7W3R5cGVdfSBbZGVzY3JpcHRpb25dXHJcbiAqL1xyXG5TdG9yYWdlLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbigpe1xyXG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0odGhpcy5vcHQua2V5KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOaVsOaNruWCqOWtmOaJgOWxnue7hOWQjeensFxyXG4gKiBAdHlwZSB7U3RyaW5nfVxyXG4gKi9cclxuU3RvcmFnZS5ncm91cG5hbWUgPSAnWk1SRExCJztcclxuXHJcbi8qKlxyXG4gKiDliKDpmaTlhajpg6jlnKjnu4RTdG9yYWdlLmdyb3VwbmFtZeS4i+eahOe8k+WtmOaVsOaNrlxyXG4gKiBAcmV0dXJuIHtbdHlwZV19IFtkZXNjcmlwdGlvbl1cclxuICovXHJcblN0b3JhZ2UuY2xlYXIgPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIHJlZyA9IG5ldyBSZWdFeHAoJ14nK1N0b3JhZ2UuZ3JvdXBuYW1lKTtcclxuICAgIHdoaWxlKGxvY2FsU3RvcmFnZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgdmFyIGtleSA9IGxvY2FsU3RvcmFnZS5rZXkoMCk7XHJcbiAgICAgICAgaWYocmVnLnRlc3Qoa2V5KSl7XHJcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGtleSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICog5Yib5bu65LiA5LiqU3RvcmFnZeWvueixoVxyXG4gKiBAcGFyYW0gIHtKU09OfSBvcHQg6K+m6KeBU3RvcmFnZeWumuS5ieWkhFxyXG4gKiBAcmV0dXJuIHtTdG9yYWdlfSAgICAgW2Rlc2NyaXB0aW9uXVxyXG4gKi9cclxuU3RvcmFnZS5jcmVhdGUgPSBmdW5jdGlvbihvcHQpe1xyXG4gICAgcmV0dXJuIG5ldyBTdG9yYWdlKG9wdCk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU3RvcmFnZTtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcgYWxlcnTnsbvvvIznu6fmib/oh6psYXllci9ib21iTGF5ZXLjgILmt7vliqDigJznoa7lrprmjInpkq7igJ3kuovku7blm57osINcclxuICog5aaC5p6c5by55bGC5Lit5pyJ5Lul5LiL5bGe5oCn55qE6IqC54K5XHJcbiAqIG5vZGU9XCJjbG9zZVwi77yM54K55Ye75YiZ5Lya5YWz6Zet5by55bGCLOW5tuinpuWPkWhpZGVjYWzpgJrnn6XjgIJcclxuICogbm9kZT1cIm9rXCLvvIzngrnlh7vliJnop6blj5HigJznoa7lrprmjInpkq7igJ3kuovku7bjgIHlhbPpl63lvLnlsYLvvIzlubbop6blj5Fva2NhbOWSjGhpZGVjYWzpgJrnn6XjgIJcclxuICogQHZlcnNpb24gMS4wLjAgfCAyMDE1LTA5LTE0IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEBleGFtcGxlXHJcbiAqIFx0IGNvbnN0IEFsZXJ0ID0gcmVxdWlyZSgnbGlibGF5ZXItYWxlcnQnKTtcclxuICpcclxuICogXHQgdmFyIGxheWVyID0gbmV3IEFsZXJ0KHtcclxuICogXHQgXHRhbGVydDoge1xyXG4gKiBcdFx0XHRmcmFtZXRwbDogWyAvL+W8ueWxguWfuuacrOaooeadv1xyXG5cdFx0XHRcdCc8ZGl2IGNsYXNzPVwianMtdGl0bGVcIj48L2Rpdj4nLFxyXG5cdFx0XHRcdCc8ZGl2IGNsYXNzPVwianMtY29udGVudFwiPjwvZGl2PicsXHJcblx0XHRcdFx0JzxkaXY+PGEgaHJlZj1cImphdmFzY3JpcHQ6O1wiIGNsYXNzPVwianMtb2tcIj7lpb3nmoQ8L2E+PC9kaXY+J1xyXG5cdFx0XHRdLmpvaW4oJycpXHJcbiAqICAgICAgfVxyXG4gKiAgIH0pO1xyXG4gKiAgIGxheWVyLnNob3djYWwuYWRkKGZ1bmN0aW9uKHR5cGUpe3N3aXRjaCh0eXBlKXtjYXNlICdiZWZvcmUnOmNvbnNvbGUubG9nKCflsYLmmL7npLrliY0nKTticmVhazsgY2FzZSAnYWZ0ZXInOmNvbnNvbGUubG9nKCflsYLmmL7npLrlkI4nKTticmVhazt9fSk7XHJcbiAqICAgbGF5ZXIuaGlkZWNhbC5hZGQoZnVuY3Rpb24odHlwZSl7c3dpdGNoKHR5cGUpe2Nhc2UgJ2JlZm9yZSc6Y29uc29sZS5sb2coJ+WxgumakOiXj+WJjScpO2JyZWFrOyBjYXNlICdhZnRlcic6Y29uc29sZS5sb2coJ+WxgumakOiXj+WQjicpO2JyZWFrO319KTtcclxuICogICBsYXllci5va2NhbC5hZGQoZnVuY3Rpb24oZSl7Y29uc29sZS5sb2coJ+eCueWHu+S6huehruWumicpfSk7XHJcbiAqICAgbGF5ZXIuc2V0TXlDb250ZW50KCforr7nva5ub2RlPVwiY29udGVudFwi6IqC54K555qEaW5uZXJIVE1MJyk7XHJcbiAqICAgdmFyIG5vZGVBcnIgPSBsYXllci5nZXROb2RlcyhbJ3RpdGxlJ10pOyAvLyDojrflj5ZjbGFzcz1cImpzLXRpdGxlXCLnmoToioLngrlcclxuICogICBub2RlQXJyLnRpdGxlLmh0bWwoJ+WGheWuueWMumh0bWwnKTtcclxuICogICBsYXllci5jb250ZW50bm9kZTsgLy/lhoXlrrnljLpub2RlPVwiY29udGVudFwi6IqC54K5XHJcbiAqICAgbGF5ZXIuc2hvdygpOyAvL+aYvuekuuWxglxyXG4gKiAgIGxheWVyLmhpZGUoKTsgLy/pmpDol4/lsYJcclxuICogICBsYXllci5sYXllcjsgLy/lsYJkb23oioLngrnlr7nosaFcclxuICogICBsYXllci5jb250YWluZXI7IC8v5rWu5bGC5a655ZmoXHJcbiAqICAgbGF5ZXIuZGVzdHJveSgpOyAvL+mUgOavgeWxglxyXG4gKiAqL1xyXG5jb25zdCBCb21iTGF5ZXIgPSByZXF1aXJlKCcuL2JvbWJMYXllci5qcycpLFxyXG5cdCAgIFRwbCA9IHJlcXVpcmUoJy4vdHBsLmpzJyk7XHJcblxyXG5jbGFzcyBBbGVydCBleHRlbmRzIEJvbWJMYXllciB7XHJcblx0LyoqXHJcblx0ICogYWxlcnTnsbtcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcg5Y+C5pWw5ZCMbGF5ZXIvYm9tYkxheWVy6YeM6Z2i55qEY29uZmlnLOWcqOatpOWfuuehgOS4iuWinuWKoOWmguS4i+m7mOiupOmFjee9rlxyXG4gICAgICoge1xyXG4gICAgICogXHQgICphbGVydDoge1xyXG4gICAgICogXHRcdCAqZnJhbWV0cGwge1N0cmluZ30gYWxlcnTln7rmnKzmqKHmnb/jgILopoHmsYLor7for6bop4FsYXllci90cGzph4zpnaJhbGVydOmhueeahOimgeaxglxyXG4gICAgICogICAgfVxyXG4gICAgICogfVxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKGNvbmZpZykge1xyXG5cdFx0dmFyIG9wdCA9ICQuZXh0ZW5kKHRydWUse1xyXG5cdFx0XHRhbGVydDoge1xyXG5cdFx0XHRcdGZyYW1ldHBsOiBUcGwuYWxlcnQgLy9hbGVydOW8ueWxguWfuuacrOaooeadv+OAguimgeaxguivt+ivpuingWxheWVyL3RwbOmHjOmdomFsZXJ06aG555qE6KaB5rGCXHJcblx0XHRcdH1cclxuXHRcdH0sY29uZmlnKTtcclxuXHRcdHN1cGVyKG9wdCk7XHJcblxyXG5cdFx0dGhpcy5zZXRDb250ZW50KG9wdC5hbGVydC5mcmFtZXRwbCk7XHJcblx0XHR0aGlzLmNvbnRlbnRub2RlID0gdGhpcy5sYXllci5maW5kKCcuanMtY29udGVudCcpOyAvL+WGheWuueWMuuiKgueCuVxyXG5cdFx0dGhpcy5va2NhbCA9ICQuQ2FsbGJhY2tzKCk7XHJcblx0XHQvL+S6i+S7tue7keWumlxyXG5cdCAgICB0aGlzLmxheWVyLm9uKCdjbGljay5saWInLCAnLmpzLW9rJywgKGUpID0+IHtcclxuXHQgICAgXHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0ICAgIFx0dGhpcy5va2NhbC5maXJlKGUpO1xyXG5cdFx0XHR0aGlzLmhpZGUoKTtcclxuXHQgICAgfSk7XHJcblx0fVxyXG5cdC8qKlxyXG4gICAgICog6K6+572uYWxlcnTlhoXlrrnljLrlhbfmnIlbbm9kZT1cImNvbnRlbnRcIl3lsZ7mgKfnmoToioLngrnnmoRodG1sXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gaHRtbFxyXG4gICAgICovXHJcblx0c2V0TXlDb250ZW50KGh0bWwpIHtcclxuXHRcdGlmKHR5cGVvZiBodG1sID09ICdzdHJpbmcnICYmIHRoaXMuY29udGVudG5vZGUubGVuZ3RoID4gMCl7XHJcbiAgICAgICAgICAgIHRoaXMuY29udGVudG5vZGUuaHRtbChodG1sKTtcclxuICAgICAgICB9XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIOe7hOS7tumUgOavgVxyXG5cdCAqL1xyXG5cdGRlc3Ryb3koKSB7XHJcblx0XHR0aGlzLmxheWVyLm9mZignY2xpY2subGliJywgJy5qcy1vaycpO1xyXG5cdFx0c3VwZXIuZGVzdHJveSgpO1xyXG5cdFx0dGhpcy5jb250ZW50bm9kZSA9IG51bGw7XHJcblx0XHR0aGlzLm9rY2FsID0gbnVsbDtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQWxlcnQ7XHJcbiIsIu+7vy8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IGFsZXJ055qE5bel5Y6C5o6n5Yi25Zmo77yM57un5om/YmFzZUNvbnRyb2xcclxuICog5bqU55So5Zy65pmv77ya6ZKI5a+5566A5Y2VYWxlcnTlvLnlsYLvvIzpopHnuYHmm7TmlLnlvLnlsYLph4zmn5DkupvoioLngrnnmoTlhoXlrrnvvIzku6Xlj4rmm7TmlLnngrnlh7tcIuehruWumlwi5oyJ6ZKu5ZCO55qE5Zue6LCD5LqL5Lu2XHJcbiAqIOWmguaenOaYr+abtOWkjeadgueahOS6pOS6kuW7uuiuruS9v+eUqGxheWVycy5hbGVydOaIlmxheWVycy5ib21iTGF5ZXJcclxuICogQHZlcnNpb24gMS4wLjAgfCAyMDE2LTAxLTI2IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEBleGFtcGxlXHJcbiAqIGNvbnN0IEFsZXJ0Q29udHJvbCA9IHJlcXVpcmUoJ2xpYmxheWVyLWFsZXJ0Q29udHJvbCcpO1xyXG4gKlxyXG5cdFx0dmFyIGN1cmxheWVyID0gbmV3IEFsZXJ0Q29udHJvbCgpO1xyXG5cdFx0Y3VybGF5ZXIuc2V0Y29uZmlnKHtcclxuXHRcdFx0YWxlcnQ6IHtcclxuXHRcdFx0XHRmcmFtZXRwbDogW1xyXG5cdFx0XHRcdCAgICAnPGRpdiBjbGFzcz1cImpzLXRpdGxlXCI+PC9kaXY+JyxcclxuXHRcdFx0XHRcdCc8ZGl2IGNsYXNzPVwianMtY29udGVudFwiPjwvZGl2PicsXHJcblx0XHRcdFx0XHQnPGRpdj48YSBocmVmPVwiamF2YXNjcmlwdDo7XCIgY2xhc3M9XCJqcy1va1wiPuWlveeahDwvYT48L2Rpdj4nXHJcblx0XHRcdFx0XS5qb2luKCcnKVxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdGN1cmxheWVyLnNob3coe1xyXG4gICAgICAgICAgICBjb250ZW50OiAn5oKo6L+Y5pyq55m76ZmGJ1xyXG4gICAgICAgIH0se1xyXG4gICAgICAgICAgICBvazogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfngrnlh7vlpb3nmoQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGN1cmxheWVyLmdldGxheWVyb2JqKCnvvJsgLy9sYXllci9hbGVydOexu+WvueixoVxyXG4gKiAqL1xyXG4gY29uc3QgQWxlcnQgPSByZXF1aXJlKCcuL2FsZXJ0LmpzJyksXHJcbiAgICAgICBCYXNlQ29udHJvbCA9IHJlcXVpcmUoJy4vYmFzZUNvbnRyb2wuanMnKTtcclxuXHJcbi8qKlxyXG4qIGFsZXJ05bel5Y6C5o6n5Yi25ZmoXHJcbiovXHJcbmNsYXNzIEFsZXJ0Q29udHJvbCBleHRlbmRzIEJhc2VDb250cm9sIHtcclxuICAgIGNvbnN0cnVjdG9yKGhpZGVkZXN0cm95KSB7XHJcbiAgICAgICAgc3VwZXIoaGlkZWRlc3Ryb3kpO1xyXG4gICAgICAgIHRoaXMuX29rY2FsID0gZnVuY3Rpb24oKXt9OyAvL+eCueWHu29r55qE5Zue6LCD56eB5pyJ5a2Y5YKo5ZmoXHJcblx0XHR0aGlzLl9mdW5hcnIgPSBbJ29rJ107IC8v5Y+v5o6n5Yi255qE5Zue6LCD5pa55rOV5ZCNXHJcbiAgICB9XHJcbiAgICAvKipcclxuXHQgKiDojrflj5ZhbGVydOW8ueWxglxyXG5cdCAqIEBwYXJhbSB7Qm9vbGVhbn0gcmVzZXQg5piv5ZCm6YeN5paw5riy5p+T5qih5p2/44CC6buY6K6k5Li6ZmFsc2VcclxuXHQgKi9cclxuICAgIGdldGxheWVyb2JqKHJlc2V0KXtcclxuXHRcdGlmKHRoaXMuX2xheWVyb2JqID09IG51bGwpe1xyXG5cdFx0XHR0aGlzLl9sYXllcm9iaiA9IG5ldyBBbGVydCh0aGlzLl9kZWZhdWx0b3B0KTtcclxuXHRcdFx0dGhpcy5fbGF5ZXJvYmoub2tjYWwuYWRkKChlKSA9PiB7XHJcblx0XHRcdFx0dGhpcy5fb2tjYWwoKTtcclxuXHRcdFx0fSk7XHJcbiAgICAgICAgICAgIHRoaXMuX2FkZGNhbGwoKTtcclxuXHRcdH1lbHNle1xyXG4gICAgICAgICAgICBpZihyZXNldCl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9sYXllcm9iai5zZXRDb250ZW50KHRoaXMuX2RlZmF1bHRvcHQuYWxlcnQuZnJhbWV0cGwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cdFx0cmV0dXJuIHRoaXMuX2xheWVyb2JqO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcblx0ICog6ZSA5q+BYWxlcnTlvLnlsYJcclxuXHQgKi9cclxuICAgIGRlc3Ryb3koKXtcclxuICAgICAgICBzdXBlci5kZXN0cm95KCk7XHJcbiAgICAgICAgdGhpcy5fb2tjYWwgPSBmdW5jdGlvbigpe307XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQWxlcnRDb250cm9sO1xyXG4iLCLvu78vKipcclxuICogQGZpbGVvdmVydmlldyBhbGVydOexu+WNleS9k+aOp+WItuWZqO+8jOS4gOiIrOeUqOS6jueugOWNleeahGNvbmZpcm3kv6Hmga/mj5DnpLrjgIJcclxuICog5rOo5oSP77ya6K+lYWxlcnTmjqfliLbnmoTlr7nosaHlj4pkb23lnKjlhajlsYDkuK3llK/kuIDlrZjlnKjvvIzlpoLmnpzmg7PopoHliJvlu7rlpJrkuKrvvIzor7fkvb/nlKhsaWJsYXllcnMvYWxlcnTmiJZsaWJsYXllcnMvYWxlcnRDb250cm9sXHJcbiAqIEB2ZXJzaW9uIDEuMC4wIHwgMjAxNS0wOS0xNCDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAZXhhbXBsZVxyXG4gKiAgICAgIGNvbnN0IEFsZXJ0U2luZ2xlID0gcmVxdWlyZSgnbGlibGF5ZXItYWxlcnRTaW5nbGUnKTtcclxuICpcclxuXHRcdEFsZXJ0U2luZ2xlLnNldGNvbmZpZyh7XHJcblx0XHRcdGFsZXJ0OiB7XHJcblx0XHRcdFx0ZnJhbWV0cGw6IFtcclxuXHRcdFx0XHQgICAgJzxkaXYgY2xhc3M9XCJqcy10aXRsZVwiPjwvZGl2PicsXHJcblx0XHRcdFx0XHQnPGRpdiBjbGFzcz1cImpzLWNvbnRlbnRcIj48L2Rpdj4nLFxyXG5cdFx0XHRcdFx0JzxkaXY+PGEgaHJlZj1cImphdmFzY3JpcHQ6O1wiIGNsYXNzPVwianMtb2tcIj7lpb3nmoQ8L2E+PC9kaXY+J1xyXG5cdFx0XHRcdF0uam9pbignJylcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHRBbGVydFNpbmdsZS5nZXRsYXllcm9iaigp77ybIC8vbGF5ZXIvYWxlcnTnsbvlr7nosaFcclxuXHRcdEFsZXJ0U2luZ2xlLnNob3coe1xyXG4gICAgICAgICAgICBjb250ZW50OiAn5oKo6L+Y5pyq55m76ZmGJ1xyXG4gICAgICAgIH0se1xyXG4gICAgICAgICAgICBvazogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfngrnlh7vlpb3nmoQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gKiAqL1xyXG5cclxuY29uc3QgQWxlcnRDb250cm9sID0gcmVxdWlyZSgnLi9hbGVydENvbnRyb2wuanMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbmV3IEFsZXJ0Q29udHJvbCgpO1xyXG4iLCLvu78vKipcclxuICogQGZpbGVvdmVydmlldyDln7rmnKznmoTlvLnlsYLlt6XljoLmjqfliLblmajvvIzkuI3lj6/nm7TmjqXkvb/nlKjvvIzlj6rlj6/lrZDnsbvnu6fmib/lkI7kvb/nlKjjgIJcclxuICog5bqU55So5Zy65pmv77ya6ZKI5a+56aKR57mB5pu05pS55by55bGC6YeM5p+Q5Lqb6IqC54K555qE5YaF5a6577yM5Lul5Y+K5pu05pS554K55Ye75oyJ6ZKu5ZCO55qE5Zue6LCD5LqL5Lu244CCXHJcbiAqIEB2ZXJzaW9uIDEuMC4wIHwgMjAxNi0wMS0yNiDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAZXhhbXBsZVxyXG4gKiAgICAgIGNvbnN0IEJhc2VDb250cm9sID0gcmVxdWlyZSgnbGlibGF5ZXItYmFzZUNvbnRyb2wnKTtcclxuICpcclxuICogKi9cclxuXHJcbiBjb25zdCBUb29sID0gcmVxdWlyZSgnbGlidXRpbC10b29sJyk7XHJcblxyXG4gY2xhc3MgQmFzZUNvbnRyb2wge1xyXG4gICAgIC8qKlxyXG4gICAgICAqIOW3peWOguaooeWei+aOp+WItuWZqFxyXG4gICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gaGlkZWRlc3Ryb3kg5by55bGC5YWz6Zet5pe277yM5piv5ZCm6LWw57O757uf6buY6K6k55qE6ZSA5q+B5pON5L2c44CC6buY6K6k5Li6dHJ1ZVxyXG4gICAgICAqL1xyXG4gICAgIGNvbnN0cnVjdG9yKGhpZGVkZXN0cm95KXtcclxuICAgICAgICAgdGhpcy5fbGF5ZXJvYmogPSBudWxsOyAvL+W8ueWxguWvueixoVxyXG4gXHRcdCB0aGlzLl9kZWZhdWx0b3B0ID0ge307IC8v6buY6K6kY29uZmln6YWN572u5Y+C5pWwXHJcbiBcdFx0IHRoaXMuX2Z1bmFyciA9IFtdOyAvL+S8muabv+aNoueahOWbnuiwg+aWueazleeahOWFs+mUruivjeOAguWmglsnb2snLCdjYW5jZWwnXVxyXG4gICAgICAgICB0aGlzLmNyZWF0ZWNhbCA9ICQuQ2FsbGJhY2tzKCk7IC8v5by55bGC5a+56LGh5Yib5bu65ZCO55qE5Zue6LCDXHJcbiAgICAgICAgIGlmKHR5cGVvZiBoaWRlZGVzdHJveSAhPSAnYm9vbGVhbicpe1xyXG4gICAgICAgICAgICAgaGlkZWRlc3Ryb3kgPSB0cnVlO1xyXG4gICAgICAgICB9XHJcbiAgICAgICAgIHRoaXMuaGlkZWRlc3Ryb3kgPSBoaWRlZGVzdHJveTtcclxuICAgICB9XHJcbiAgICAgLyoqXHJcbiBcdCAqICDlj4LmlbDor7TmmI7or7flj4Lop4HlrZDnsbvkvb/nlKjnmoTlvLnlsYLnsbvph4zpnaLnmoRjb25maWfor7TmmI5cclxuIFx0ICogIOWmgmFsZXJ0Lmpz44CCY29uZmlybS5qc1xyXG4gXHQgKi9cclxuICAgICBzZXRjb25maWcoY29uZmlnKXtcclxuICAgICAgICAgdGhpcy5fZGVmYXVsdG9wdCA9IGNvbmZpZztcclxuICAgICB9XHJcbiAgICAgLyoqXHJcbiBcdCAqIOiOt+WPluW8ueWxguWvueixoe+8jOWFt+S9k+eUseWtkOexu+WunueOsFxyXG4gXHQgKi9cclxuICAgICBnZXRsYXllcm9iaigpe1xyXG5cclxuICAgICB9XHJcbiAgICAgLyoqXHJcbiBcdCAqIOa3u+WKoOezu+e7n+Wbnuiwg++8jOeUseWtkOexu+WIm+W7uuS6huW8ueWxguWvueixoeWQjuiwg+eUqFxyXG4gXHQgKi9cclxuICAgICBfYWRkY2FsbCgpe1xyXG4gICAgICAgICBpZih0aGlzLmhpZGVkZXN0cm95KXtcclxuICAgICAgICAgICAgIHRoaXMuX2xheWVyb2JqLmhpZGVhZnRlcmNhbC5hZGQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgIHRoaXMuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgIH1cclxuICAgICAgICAgdGhpcy5jcmVhdGVjYWwuZmlyZSh0aGlzLl9sYXllcm9iaik7XHJcbiAgICAgfVxyXG4gICAgIC8qKlxyXG4gXHQgKiDmmL7npLrlvLnlsYJcclxuIFx0ICogQHBhcmFtIHtPYmplY3R9ICp0eHQg5paH5qGI6YWN572uLOmAieWhq+OAguWmguaenHNldGNvbmZpZ+iwg+eUqOiuvue9rueahOaooeadv+S4rei/mOacieWFtuS7lm5vZGU9XCLlhbbku5blgLxcIu+8jFxyXG4gXHQgKiAgICAgIOWmgm5vZGU9XCJvdGhlclwiIOWImeWPr+iHquihjOaJqeWxlVxyXG4gXHQgKiB7XHJcbiBcdCAqIFx0IGNvbnRlbnQge1N0cmluZ30gbm9kZT1cImNvbnRlbnRcIuiKgueCuemHjOmdoueahGh0bWxcclxuIFx0ICogICB0aXRsZSB7U3RyaW5nfSBub2RlPVwidGl0bGVcIuiKgueCuemHjOmdoueahGh0bWxcclxuIFx0ICogICBvayB7U3RyaW5nfSBub2RlPVwib2tcIuiKgueCuemHjOmdoueahGh0bWxcclxuIFx0ICogfVxyXG4gXHQgKiBAcGFyYW0ge09iamVjdH0gY2FsIOWbnuiwg+mFjee9rlxyXG4gXHQgKiB7XHJcbiBcdCAqIFx0IOmUruWAvOS4ul9mdW5hcnLkuK3ot53nprvnmoTlhbPplK7or40ge0Z1bmN0aW9ufSDngrnlh7vnoa7lrprmjInpkq7lkI7nmoTlm57osINcclxuIFx0ICogfVxyXG4gXHQgKi9cclxuIFx0IHNob3codHh0LGNhbCl7XHJcbiAgICAgICAgIGlmKCFUb29sLmlzT2JqZWN0KHR4dCkpe1xyXG4gXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdiYXNlQ29udHJvbC1zaG935pa55rOVdHh05Y+C5pWw5b+F6aG75pivanNvbuWvueixoScpO1xyXG4gXHRcdH1lbHNle1xyXG4gXHRcdFx0aWYoVG9vbC5pc09iamVjdChjYWwpKXtcclxuIFx0XHRcdFx0dmFyIGZ1bm5hbWUgPSB0aGlzLl9mdW5hcnI7XHJcbiBcdFx0XHRcdGZvcih2YXIgY3VybmFtZSBvZiBmdW5uYW1lKXtcclxuIFx0XHRcdFx0XHRpZihUb29sLmlzRnVuY3Rpb24oY2FsW2N1cm5hbWVdKSl7XHJcbiBcdFx0XHRcdFx0XHR0aGlzWydfJytjdXJuYW1lKydjYWwnXSA9IGNhbFtjdXJuYW1lXTtcclxuIFx0XHRcdFx0XHR9XHJcbiBcdFx0XHRcdFx0ZWxzZXtcclxuIFx0XHRcdFx0XHRcdHRoaXNbJ18nK2N1cm5hbWUrJ2NhbCddID0gZnVuY3Rpb24oKXt9O1xyXG4gXHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0fWVsc2V7XHJcbiBcdFx0XHRcdHRoaXMuX29rY2FsID0gZnVuY3Rpb24oKXt9O1xyXG4gXHRcdFx0fVxyXG4gXHRcdFx0Ly/ojrflj5Z0eHTph4zpnaLnmoTplK7lgLxcclxuIFx0XHRcdHZhciBub2RlbmFtZWFyciA9IFtdO1xyXG4gXHRcdFx0Zm9yKHZhciBuYW1lIGluIHR4dCl7XHJcbiBcdFx0XHRcdG5vZGVuYW1lYXJyLnB1c2gobmFtZSk7XHJcbiBcdFx0XHR9XHJcbiBcdFx0XHR0aGlzLmdldGxheWVyb2JqKHRydWUpO1xyXG4gXHRcdFx0dmFyIG5vZGVhcnIgPSB0aGlzLl9sYXllcm9iai5nZXROb2Rlcyhub2RlbmFtZWFycik7XHJcbiBcdFx0XHRmb3IodmFyIG5hbWUgaW4gbm9kZWFycil7XHJcbiBcdFx0XHRcdFRvb2wuaXNTdHJpbmcodHh0W25hbWVdKSAmJiBub2RlYXJyW25hbWVdLmh0bWwodHh0W25hbWVdKTtcclxuIFx0XHRcdH1cclxuIFx0XHRcdHRoaXMuX2xheWVyb2JqLnNob3coKTtcclxuIFx0XHR9XHJcbiAgICAgfVxyXG4gICAgIC8qKlxyXG4gICAgICAqIOmUgOavgeW8ueWxglxyXG4gICAgICAqL1xyXG4gICAgIGRlc3Ryb3koKXtcclxuICAgICAgICAgaWYodGhpcy5fbGF5ZXJvYmogIT0gbnVsbCl7XHJcbiBcdFx0XHR0aGlzLl9sYXllcm9iai5kZXN0cm95KCk7XHJcbiBcdFx0XHR0aGlzLl9sYXllcm9iaiA9IG51bGw7XHJcbiBcdFx0fVxyXG4gICAgIH1cclxuIH1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQmFzZUNvbnRyb2w7XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IOW8ueWxguexu++8jOe7p+aJv+iHqmxheWVyL2xheWVy44CC6buY6K6k5bGF5Lit5a6a5L2N77yM5pi+56S66YGu572p44CC77yI5aaC5p6c6ZyA5YW25LuW54m55q6K6YWN572u5YiZ5Y+C6KeB5Y+C5pWw6K+05piO77yJXHJcbiAqIOWmguaenOW8ueWxguS4reacieS7peS4i+WxnuaAp+eahOiKgueCuW5vZGU9XCJjbG9zZVwi44CC5YiZ54K55Ye76K+l6IqC54K55Lya5YWz6Zet5by55bGC77yM5bm26Kem5Y+RaGlkZWNhbOmAmuefpeOAglxyXG4gKiBAdmVyc2lvbiAxLjAuMCB8IDIwMTUtMDktMTQg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQGV4YW1wbGVcclxuICogXHQgY29uc3QgQm9tYkxheWVyID0gcmVxdWlyZSgnbGlibGF5ZXItYm9tYkxheWVyJyk7XHJcbiAqXHJcbiAqICAgdmFyIGxheWVyID0gbmV3IEJvbWJMYXllcigpO1xyXG4gKiAgICBsYXllci5zaG93YmVmb3JlY2FsLmFkZChmdW5jdGlvbigpe2NvbnNvbGUubG9nKCflsYLmmL7npLrliY0nKTt9KTtcclxuICogICBsYXllci5oaWRlYmVmb3JlY2FsLmFkZChmdW5jdGlvbigpe2NvbnNvbGUubG9nKCflsYLpmpDol4/liY0nKTt9KTtcclxuICogICBsYXllci5zaG93YWZ0ZXJjYWwuYWRkKGZ1bmN0aW9uKCl7Y29uc29sZS5sb2coJ+WxguaYvuekuuWQjicpO30pO1xyXG4gKiAgIGxheWVyLmhpZGVhZnRlcmNhbC5hZGQoZnVuY3Rpb24oKXtjb25zb2xlLmxvZygn5bGC6ZqQ6JeP5ZCOJyk7fSk7XHJcbiAqICAgbGF5ZXIucG9zLnBvc2NhbC5hZGQoZnVuY3Rpb24oKXtjb25zb2xlLmxvZygnbGF5ZXLlrprkvY3lkI7lm57osIMnKX0pO1xyXG4gKiAgIGxheWVyLnNldENvbnRlbnQoJzxkaXYgY2xhc3M9XCJqcy1jb250ZW50XCI+PC9kaXY+Jyk7IC8v6K6+572ubGF5ZXLlsYLph4zpnaLnmoTlhoXlrrlcclxuICogICBsYXllci5nZXROb2RlcyhbJ2NvbnRlbnQnXSk7IC8vIOiOt+WPlmNsYXNzPVwianMtY29udGVudFwi55qE6IqC54K5XHJcbiAqICAgbGF5ZXIuc2hvdygpOyAvL+aYvuekuuWxglxyXG4gKiAgIGxheWVyLmhpZGUoKTsgLy/pmpDol4/lsYJcclxuICogICBsYXllci5sYXllcjsgLy/lsYJkb23oioLngrnlr7nosaFcclxuICogICBsYXllci5jb250YWluZXI7IC8v5rWu5bGC5a655ZmoXHJcbiAqICAgbGF5ZXIuZGVzdHJveSgpOyAvL+mUgOavgeWxglxyXG4gKlxyXG4gKiAqL1xyXG5cclxuIGNvbnN0IExheWVyID0gcmVxdWlyZSgnLi9sYXllci5qcycpLFxyXG4gXHQgICBNYXNrID0gcmVxdWlyZSgnLi9tYXNrLmpzJyksXHJcblx0ICAgUG9zaXRpb25Cb21iID0gcmVxdWlyZSgnLi9wb3NpdGlvbkJvbWIuanMnKSxcclxuXHQgICBUb29sID0gcmVxdWlyZSgnbGlidXRpbC10b29sJyk7XHJcblxyXG5jbGFzcyBCb21iTGF5ZXIgZXh0ZW5kcyBMYXllciB7XHJcblx0LyoqXHJcblx0ICog5by55bGC57G74oCU4oCU5Yib5bu65bm25re75Yqg5Yiw5oyH5a6a5a655Zmo5LitXHJcbiAgICAgKiBAcGFyYW0ge0pTT059IGNvbmZpZyDlvLnlsYLphY3nva7lj4LmlbAg77yM5LiN5piv5b+F5aGr6aG5XHJcbiAgICAgKiBcdFx0e1xyXG4gICAgICogXHQgICAgICAgY29udGFpbmVyIHtFbGVtZW50fSDlrZjmlL7lvLnlsYLnmoTlrrnlmajjgILlj6/kuI3mjIflrprvvIzpu5jorqTlvLnlsYLlrZjmlL7kuo5ib2R55Lit55qE5LiA5Liq5Yqo5oCB55Sf5oiQ55qEZGl26YeMXHJcbiAgICAgKiBcdCAgICAgICBwb3M6e30sIC8v5a6a5L2N5Y+C5pWw77yM5YW35L2T6K+05piO5Y+v6KeB5pa55rOVbGF5ZXIvcG9zaXRpb25Cb21i5Lit55qEY29uZmln6K+05piOXHJcbiAgICAgKiAgICAgICAgIGxheWVyOiB7fSwgLy/lvLnlsYLkv6Hmga/lj4LmlbDvvIzlhbfkvZPor7TmmI7lj6/op4Hmlrnms5VsYXllci9sYXllcuS4reeahGNvbmZpZ+ivtOaYjlxyXG4gICAgICogXHRcdCAgIG1hc2s6IHsgLy/pga7nvankv6Hmga/lj4LmlbDvvIzlhbfkvZPor7TmmI7lj6/op4Hmlrnms5VsYXllci9tYXNr5Lit55qEY29uZmln6K+05piO44CC5Zyo5q2k5Z+656GA5LiK6L+b6KGM5Lul5LiL5omp5bGVXHJcbiAgICAgKiBcdFx0XHQgIG1hc2s6IHRydWUsIC8v5piv5ZCm5Yib5bu66YGu572pXHJcbiAgICAgKiAgICAgICAgICAgIGNtbGhpZGU6IGZhbHNlIC8v54K55Ye76YGu572p5piv5ZCm5YWz6Zet5by55bGCXHJcbiAgICAgKiAgICAgICAgICAgIC8v5YW25LuW5p+l55yLbWFzay5qc+S4reeahOmFjee9rlxyXG4gICAgICogXHRcdCAgIH1cclxuICAgICAqICAgICAgfVxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKGNvbmZpZykge1xyXG4gICAgICAgIHZhciBfbmV3Y29udGFpbmVyID0gZmFsc2U7XHJcblx0XHRpZighY29uZmlnLmNvbnRhaW5lciB8fCBjb25maWcuY29udGFpbmVyLmxlbmd0aCA9PSAwKXtcclxuXHRcdFx0Y29uZmlnLmNvbnRhaW5lciA9ICQoJzxkaXY+PC9kaXY+JykuYXBwZW5kVG8oJ2JvZHknKTtcclxuXHRcdFx0X25ld2NvbnRhaW5lciA9IHRydWU7IC8v6K+05piO5piv5paw5Yib5bu655qE5a655ZmoXHJcblx0XHR9XHJcblx0XHRjb25maWcgPSBjb25maWcgfHwge307XHJcblx0XHQvL+WIneWni+WMluWfuuexu1xyXG5cdFx0c3VwZXIoY29uZmlnLmNvbnRhaW5lcixjb25maWcubGF5ZXIpO1xyXG4gICAgICAgIHRoaXMuX25ld2NvbnRhaW5lciA9IF9uZXdjb250YWluZXI7XHJcblx0XHQvL+WIm+W7uuWumuS9jeexu+WvueixoVxyXG5cdFx0dGhpcy5wb3MgPSBuZXcgUG9zaXRpb25Cb21iKHtcclxuXHRcdFx0bGF5ZXI6IHRoaXMubGF5ZXJcclxuXHRcdH0sY29uZmlnLnBvcyk7XHJcblx0XHQvL+WIm+W7uumBrue9qVxyXG5cdFx0dmFyIG1hc2tvcHQgPSAkLmV4dGVuZCh0cnVlLHtcclxuXHRcdFx0bWFzazogdHJ1ZSxcclxuXHRcdFx0Y21saGlkZTogZmFsc2VcclxuXHRcdH0sY29uZmlnLm1hc2spO1xyXG5cdFx0aWYobWFza29wdC5tYXNrKXsgLy/lpoLmnpzliJvlu7rpga7nvalcclxuXHRcdFx0dGhpcy5tYXNrID0gbmV3IE1hc2soY29uZmlnLmNvbnRhaW5lcixtYXNrb3B0KTtcclxuXHRcdFx0aWYobWFza29wdC5jbWxoaWRlKXsgLy/ngrnlh7vpga7nvanlhbPpl61cclxuXHRcdFx0XHR0aGlzLm1hc2suY2xpY2tjYWwuYWRkKChlKSA9PiB7XHJcblx0XHRcdFx0XHR0aGlzLmhpZGUoKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Ly/kuovku7bnu5HlrppcclxuXHRcdHRoaXMubGF5ZXIub24oJ2NsaWNrLmxpYicsICcuanMtY2xvc2UnLCAoZSkgPT4ge1xyXG5cdCAgICBcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHQgICAgXHR0aGlzLmhpZGUoKTtcclxuXHQgICAgfSk7XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIOiOt+WPlmFsZXJ05Lit5YW35pyJbm9kZT0n5oyH5a6a5ZCN56ewJ+eahOiKgueCueWIl+ihqOOAguWmguaenG5vZGVuYW1lYXJy5Lit5oyH5a6a55qE6IqC54K55LiN5a2Y5Zyo77yM5YiZ5LiN5Zyo57uT5p6c5Lit6L+U5Zue44CC5Li+5L6LXHJcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBub2RlbmFtZWFyciDlpoJbJ2NvbnRlbnQnLCdvayddXHJcbiAgICAgKiBAcmV0dXJuIHtcclxuICAgICAqIFx0ICAgY29udGVudDog6I635Y+W55qE6IqC54K5XHJcbiAgICAgKiAgICAgb2s6IOiOt+WPlueahOiKgueCuVxyXG4gICAgICogfVxyXG4gICAgICog5aaC5p6cY29udGVudOS4jeWtmOWcqO+8jOWImeWPqui/lOWbnntva31cclxuXHQgKi9cclxuXHRnZXROb2Rlcyhub2RlbmFtZWFycil7XHJcblx0XHR2YXIgcmVzdWx0ID0ge30sIHRoYXQgPSB0aGlzO1xyXG5cdFx0aWYoVG9vbC5pc0FycmF5KG5vZGVuYW1lYXJyKSl7XHJcblx0XHRcdCQuZWFjaChub2RlbmFtZWFyciwoaW5kZXgsbmFtZSkgPT4ge1xyXG5cdFx0XHRcdHZhciBub2RlID0gdGhpcy5sYXllci5maW5kKCcuanMtJytuYW1lKTtcclxuXHRcdFx0XHRpZihub2RlLmxlbmd0aCA+IDApe1xyXG5cdFx0XHRcdFx0cmVzdWx0W25hbWVdID0gbm9kZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9XHJcblx0LyoqXHJcblx0ICog5pi+56S65by55bGCXHJcblx0ICovXHJcblx0c2hvdygpe1xyXG5cdFx0aWYoIXRoaXMuaXNzaG93KCkpe1xyXG5cdFx0XHR0aGlzLnNob3diZWZvcmVjYWwuZmlyZSgpOyAvL+WxguaYvuekuuWJjeWbnuiwg1xyXG5cdFx0XHR0aGlzLm1hc2sgJiYgdGhpcy5tYXNrLnNob3coKTtcclxuXHRcdFx0dGhpcy5fc2hvdygpO1xyXG5cdFx0XHR0aGlzLnBvcy5zZXRwb3MoKTtcclxuXHRcdFx0dGhpcy5zaG93YWZ0ZXJjYWwuZmlyZSgpOyAvL+WxguaYvuekuuWQjuWbnuiwg1xyXG5cdFx0fVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiDpmpDol4/lvLnlsYJcclxuXHQgKi9cclxuXHRoaWRlKCl7XHJcblx0XHRpZih0aGlzLmlzc2hvdygpKXtcclxuXHRcdFx0dGhpcy5oaWRlYmVmb3JlY2FsLmZpcmUoKTsgLy/lsYLpmpDol4/liY3lm57osINcclxuXHRcdFx0dGhpcy5tYXNrICYmIHRoaXMubWFzay5oaWRlKCk7XHJcblx0XHRcdHRoaXMuX2hpZGUoKTtcclxuXHRcdFx0dGhpcy5oaWRlYWZ0ZXJjYWwuZmlyZSgpOyAvL+WxgumakOiXj+WQjuWbnuiwg1xyXG5cdFx0fVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiDlvLnlsYLplIDmr4FcclxuXHQgKi9cclxuXHRkZXN0cm95KCl7XHJcblx0XHR0aGlzLmxheWVyLm9mZignY2xpY2subGliJywgJy5qcy1jbG9zZScpO1xyXG5cdFx0dGhpcy5wb3MuZGVzdHJveSgpO1xyXG5cdFx0aWYodGhpcy5tYXNrKXtcclxuICAgICAgICAgICAgdGhpcy5tYXNrLmRlc3Ryb3koKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGNvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyO1xyXG4gICAgICAgIHN1cGVyLmRlc3Ryb3koKTtcclxuICAgICAgICBpZih0aGlzLl9uZXdjb250YWluZXIpe1xyXG5cdFx0XHRjb250YWluZXIucmVtb3ZlKCk7XHJcblx0XHR9XHJcblx0XHR0aGlzLl9uZXdjb250YWluZXIgPSBudWxsO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCb21iTGF5ZXI7XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IGNvbmZpcm3nsbvvvIznu6fmib/oh6psYXllci9ib21iTGF5ZXLjgILmt7vliqDigJznoa7lrprmjInpkq7igJ3lkozigJzlj5bmtojmjInpkq7igJ3kuovku7blm57osINcclxuICog5aaC5p6c5by55bGC5Lit5pyJ5Lul5LiL5bGe5oCn55qE6IqC54K5XHJcbiAqIG5vZGU9XCJjbG9zZVwi77yM54K55Ye75YiZ5Lya5YWz6Zet5by55bGCLOW5tuinpuWPkWhpZGVjYWzpgJrnn6XjgIJcclxuICogbm9kZT1cIm9rXCLvvIzngrnlh7vliJnop6blj5HigJznoa7lrprmjInpkq7igJ3kuovku7bvvIzlhbPpl63lvLnlsYLvvIzlubbop6blj5Fva2NhbOWSjGhpZGVjYWzpgJrnn6XjgIJcclxuICogbm9kZT1cImNhbmNlbFwiIOeCueWHu+inpuWPkeKAnOWPlua2iOaMiemSruKAneS6i+S7tu+8jOWFs+mXreW8ueWxgu+8jOW5tuinpuWPkWNhbmNlbGNhbOWSjGhpZGVjYWzpgJrnn6XjgIJcclxuICogQHZlcnNpb24gMS4wLjAgfCAyMDE1LTA5LTE2IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEBleGFtcGxlXHJcbiAqIFx0IGNvbnN0IENvbmZpcm0gPSByZXF1aXJlKCdsaWJsYXllci1jb25maXJtJyk7XHJcbiAqXHJcbiAqIFx0IHZhciBsYXllciA9IG5ldyBDb25maXJtKHtcclxuICogXHQgXHRjb25maXJtOiB7XHJcbiAqIFx0XHRcdGZyYW1ldHBsOiBbIC8v5by55bGC5Z+65pys5qih5p2/XHJcblx0XHRcdFx0JzxkaXYgY2xhc3M9XCJqcy10aXRsZVwiPjwvZGl2PicsXHJcblx0XHRcdFx0JzxkaXYgY2xhc3M9XCJqcy1jb250ZW50XCI+PC9kaXY+JyxcclxuXHRcdFx0XHQnPGRpdj48YSBocmVmPVwiamF2YXNjcmlwdDo7XCIgY2xhc3M9XCJqcy1va1wiPuWlveeahDwvYT48YSBocmVmPVwiamF2YXNjcmlwdDo7XCIgY2xhc3M9XCJqcy1jYW5jZWxcIj7nrYnkuIvor7Q8L2E+PC9kaXY+J1xyXG5cdFx0XHRdLmpvaW4oJycpXHJcbiAqICAgICAgfVxyXG4gKiAgIH0pO1xyXG4gKiAgIGxheWVyLnNob3djYWwuYWRkKGZ1bmN0aW9uKHR5cGUpe3N3aXRjaCh0eXBlKXtjYXNlICdiZWZvcmUnOmNvbnNvbGUubG9nKCflsYLmmL7npLrliY0nKTticmVhazsgY2FzZSAnYWZ0ZXInOmNvbnNvbGUubG9nKCflsYLmmL7npLrlkI4nKTticmVhazt9fSk7XHJcbiAqICAgbGF5ZXIuaGlkZWNhbC5hZGQoZnVuY3Rpb24odHlwZSl7c3dpdGNoKHR5cGUpe2Nhc2UgJ2JlZm9yZSc6Y29uc29sZS5sb2coJ+WxgumakOiXj+WJjScpO2JyZWFrOyBjYXNlICdhZnRlcic6Y29uc29sZS5sb2coJ+WxgumakOiXj+WQjicpO2JyZWFrO319KTtcclxuICogICBsYXllci5va2NhbC5hZGQoZnVuY3Rpb24oZSl7Y29uc29sZS5sb2coJ+eCueWHu+S6huehruWumicpfSk7XHJcbiAqICAgbGF5ZXIuY2FuY2VsY2FsLmFkZChmdW5jdGlvbihlKXtjb25zb2xlLmxvZygn54K55Ye75LqG5Y+W5raIJyl9KTtcclxuICogICBsYXllci5zZXRNeUNvbnRlbnQoJ+iuvue9rm5vZGU9XCJjb250ZW50XCLoioLngrnnmoRpbm5lckhUTUwnKTtcclxuICogICB2YXIgbm9kZUFyciA9IGxheWVyLmdldE5vZGVzKFsndGl0bGUnXSk7IC8vIOiOt+WPlmNsYXNzPVwianMtdGl0bGVcIueahOiKgueCuVxyXG4gKiAgIG5vZGVBcnIudGl0bGUuaHRtbCgn5YaF5a655Yy6aHRtbCcpO1xyXG4gKiAgIGxheWVyLmNvbnRlbnRub2RlOyAvL+WGheWuueWMum5vZGU9XCJjb250ZW50XCLoioLngrlcclxuICogICBsYXllci5zaG93KCk7IC8v5pi+56S65bGCXHJcbiAqICAgbGF5ZXIuaGlkZSgpOyAvL+makOiXj+WxglxyXG4gKiAgIGxheWVyLmxheWVyOyAvL+WxgmRvbeiKgueCueWvueixoVxyXG4gKiAgIGxheWVyLmNvbnRhaW5lcjsgLy/mta7lsYLlrrnlmahcclxuICogICBsYXllci5kZXN0cm95KCk7IC8v6ZSA5q+B5bGCXHJcbiAqICovXHJcbmNvbnN0IEJvbWJMYXllciA9IHJlcXVpcmUoJy4vYm9tYkxheWVyLmpzJyksXHJcblx0XHRUcGwgPSByZXF1aXJlKCcuL3RwbC5qcycpO1xyXG5cclxuY2xhc3MgQ29uZmlybSBleHRlbmRzIEJvbWJMYXllciB7XHJcblx0LyoqXHJcblx0ICogY29uZmlybeexu1xyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyDlj4LmlbDlkIxsYXllci9ib21iTGF5ZXLph4zpnaLnmoRjb25maWcs5Zyo5q2k5Z+656GA5LiK5aKe5Yqg5aaC5LiL6buY6K6k6YWN572uXHJcbiAgICAgKiB7XHJcbiAgICAgKiBcdCAgKmNvbmZpcm06IHtcclxuICAgICAqIFx0XHQgKmZyYW1ldHBsIHtTdHJpbmd9IGNvbmZpcm3ln7rmnKzmqKHmnb/jgILopoHmsYLor7for6bop4FsYXllci90cGzph4zpnaJjb25maXJt6aG555qE6KaB5rGCXHJcbiAgICAgKiAgICB9XHJcbiAgICAgKiB9XHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IoY29uZmlnKSB7XHJcblx0XHR2YXIgb3B0ID0gJC5leHRlbmQodHJ1ZSx7XHJcblx0XHRcdGNvbmZpcm06IHtcclxuXHRcdFx0XHRmcmFtZXRwbDogVHBsLmNvbmZpcm0gLy9jb25maXJt5by55bGC5Z+65pys5qih5p2/44CC6KaB5rGC6K+36K+m6KeBbGF5ZXIvdHBs6YeM6Z2iY29uZmlybemhueeahOimgeaxglxyXG5cdFx0XHR9XHJcblx0XHR9LGNvbmZpZyk7XHJcblx0XHRzdXBlcihvcHQpO1xyXG5cdFx0dGhpcy5zZXRDb250ZW50KG9wdC5jb25maXJtLmZyYW1ldHBsKTtcclxuXHRcdHRoaXMuY29udGVudG5vZGUgPSB0aGlzLmxheWVyLmZpbmQoJy5qcy1jb250ZW50Jyk7IC8v5YaF5a655Yy66IqC54K5XHJcblx0XHR0aGlzLm9rY2FsID0gJC5DYWxsYmFja3MoKTtcclxuXHRcdHRoaXMuY2FuY2VsY2FsID0gJC5DYWxsYmFja3MoKTtcclxuXHRcdC8v5LqL5Lu257uR5a6aXHJcblx0ICAgIHRoaXMubGF5ZXIub24oJ2NsaWNrLmxpYicsICcuanMtb2snLCAoZSkgPT4ge1xyXG5cdCAgICBcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0dGhpcy5va2NhbC5maXJlKGUpO1xyXG5cdCAgICBcdHRoaXMuaGlkZSgpO1xyXG5cdCAgICB9KTtcclxuXHQgICAgdGhpcy5sYXllci5vbignY2xpY2subGliJywgJy5qcy1jYW5jZWwnLCAoZSkgPT4ge1xyXG5cdCAgICBcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0dGhpcy5jYW5jZWxjYWwuZmlyZShlKTtcclxuXHQgICAgXHR0aGlzLmhpZGUoKTtcclxuXHQgICAgfSk7XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIOiuvue9rmNvbmZpcm3lhoXlrrnljLrlhbfmnIlbbm9kZT1cImNvbnRlbnRcIl3lsZ7mgKfnmoToioLngrnnmoRodG1sXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gaHRtbFxyXG5cdCAqL1xyXG5cdHNldE15Q29udGVudChodG1sKXtcclxuXHRcdGlmKHR5cGVvZiBodG1sID09ICdzdHJpbmcnICYmIHRoaXMuY29udGVudG5vZGUubGVuZ3RoID4gMCl7XHJcblx0XHRcdHRoaXMuY29udGVudG5vZGUuaHRtbChodG1sKTtcclxuXHRcdH1cclxuXHR9XHJcblx0LyoqXHJcblx0ICog57uE5Lu26ZSA5q+BXHJcblx0ICovXHJcblx0ZGVzdHJveSgpe1xyXG5cdFx0dGhpcy5sYXllci5vZmYoJ2NsaWNrLmxpYicsICcuanMtb2snKTtcclxuXHRcdHRoaXMubGF5ZXIub2ZmKCdjbGljay5saWInLCAnLmpzLWNhbmNlbCcpO1xyXG5cdFx0c3VwZXIuZGVzdHJveSgpO1xyXG5cdFx0dGhpcy5jb250ZW50bm9kZSA9IG51bGw7XHJcblx0XHR0aGlzLm9rY2FsID0gbnVsbDtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29uZmlybTtcclxuIiwi77u/LyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcgY29uZmlybeeahOW3peWOguaOp+WItuWZqO+8jOmbhuaIkGJhc2VDb250cm9sXHJcbiAqIOW6lOeUqOWcuuaZr++8mumSiOWvueeugOWNlWNvbmZpcm3lvLnlsYLvvIzpkojlr7npopHnuYHmm7TmlLnlvLnlsYLph4zmn5DkupvoioLngrnnmoTlhoXlrrnvvIzku6Xlj4rmm7TmlLnngrnlh7tcIuehruWumlwi44CBXCLlj5bmtohcIuaMiemSruWQjueahOWbnuiwg+S6i+S7tlxyXG4gKiDlpoLmnpzmmK/mm7TlpI3mnYLnmoTkuqTkupLlu7rorq7kvb/nlKhsYXllcnMuY29uZmlybeaIlmxheWVycy5ib21iTGF5ZXJcclxuICogQHZlcnNpb24gMS4wLjAgfCAyMDE2LTAxLTI2IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEBleGFtcGxlXHJcbiAqIFx0XHRjb25zdCBDb25maXJtQ29udHJvbCA9IHJlcXVpcmUoJ2xpYmxheWVyLWNvbmZpcm1Db250cm9sJyk7XHJcbiAqXHJcblx0XHR2YXIgY3VyY29uZmlybSA9IG5ldyBDb25maXJtQ29udHJvbCgpO1xyXG5cdFx0Y3VyY29uZmlybS5zZXRjb25maWcoe1xyXG5cdFx0XHRjb25maXJtOiB7XHJcblx0XHRcdFx0ZnJhbWV0cGw6IFtcclxuXHRcdFx0XHRcdCc8ZGl2IGNsYXNzPVwianMtY29udGVudFwiPjwvZGl2PicsXHJcblx0XHRcdFx0XHQnPGRpdj48YSBocmVmPVwiamF2YXNjcmlwdDo7XCIgY2xhc3M9XCJqcy1va1wiPuWlveeahDwvYT48YSBocmVmPVwiamF2YXNjcmlwdDo7XCIgY2xhc3M9XCJqcy1jYW5jZWxcIj7nrYnkuIvor7Q8L2E+PC9kaXY+J1xyXG5cdFx0XHRcdF0uam9pbignJylcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHRjdXJjb25maXJtLnNob3coe1xyXG5cdFx0ICAgIGNvbnRlbnQ6ICfmgqjov5jmnKrnmbvpmYYnXHJcblx0XHR9LHtcclxuXHRcdCAgICBvazogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfngrnlh7vlpb3nmoQnKTtcclxuICAgICAgICAgICAgfSxcclxuXHRcdFx0Y2FuY2VsOiBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdGNvbnNvbGUubG9nKCfngrnlh7vnrYnkuIvor7QnKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHRjdXJjb25maXJtLmdldGxheWVyb2JqKCnvvJsgLy9sYXllci9jb25maXJt57G75a+56LGhXHJcbiAqICovXHJcblxyXG4gY29uc3QgQ29uZmlybSA9IHJlcXVpcmUoJy4vY29uZmlybS5qcycpLFxyXG4gXHRcdEJhc2VDb250cm9sID0gcmVxdWlyZSgnLi9iYXNlQ29udHJvbC5qcycpO1xyXG5cclxuY2xhc3MgQ29uZmlybUNvbnRyb2wgZXh0ZW5kcyBCYXNlQ29udHJvbCB7XHJcblx0LyoqXHJcbiAgICAgKiBjb25maXJt5bel5Y6C5o6n5Yi25ZmoXHJcbiAgICAgKi9cclxuXHRjb25zdHJ1Y3RvcihoaWRlZGVzdHJveSkge1xyXG5cdFx0c3VwZXIoaGlkZWRlc3Ryb3kpO1xyXG5cdFx0dGhpcy5fb2tjYWwgPSBmdW5jdGlvbigpe307IC8v54K55Ye7b2vnmoTlm57osIPnp4HmnInlrZjlgqjlmahcclxuXHRcdHRoaXMuX2NhbmNlbGNhbCA9IGZ1bmN0aW9uKCl7fTsgLy/ngrnlh7tjYW5jZWznmoTlm57osIPnp4HmnInlrZjlgqjlmahcclxuXHRcdHRoaXMuX2Z1bmFyciA9IFsnb2snLCdjYW5jZWwnXTsgLy/lj6/mjqfliLbnmoTlm57osIPmlrnms5XlkI1cclxuXHR9XHJcblx0LyoqXHJcblx0ICog6I635Y+WY29uZmlybeW8ueWxglxyXG5cdCAqIEBwYXJhbSB7Qm9vbGVhbn0gcmVzZXQg5piv5ZCm6YeN5paw5riy5p+T5qih5p2/44CC6buY6K6k5Li6ZmFsc2VcclxuXHQgKi9cclxuXHRnZXRsYXllcm9iaihyZXNldCl7XHJcblx0XHRpZih0aGlzLl9sYXllcm9iaiA9PSBudWxsKXtcclxuXHRcdFx0dGhpcy5fbGF5ZXJvYmogPSBuZXcgQ29uZmlybSh0aGlzLl9kZWZhdWx0b3B0KTtcclxuXHRcdFx0dGhpcy5fbGF5ZXJvYmoub2tjYWwuYWRkKChlKSA9PiB7XHJcblx0XHRcdFx0dGhpcy5fb2tjYWwoKTtcclxuXHRcdFx0fSk7XHJcblx0XHRcdHRoaXMuX2xheWVyb2JqLmNhbmNlbGNhbC5hZGQoKGUpID0+IHtcclxuXHRcdFx0XHR0aGlzLl9jYW5jZWxjYWwoKTtcclxuXHRcdFx0fSk7XHJcblx0XHRcdHRoaXMuX2FkZGNhbGwoKTtcclxuXHRcdH1lbHNle1xyXG4gICAgICAgICAgICBpZihyZXNldCl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9sYXllcm9iai5zZXRDb250ZW50KHRoaXMuX2RlZmF1bHRvcHQuY29uZmlybS5mcmFtZXRwbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblx0XHRyZXR1cm4gdGhpcy5fbGF5ZXJvYmo7XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIOmUgOavgWFsZXJ05by55bGCXHJcblx0ICovXHJcblx0ZGVzdHJveSgpe1xyXG5cdFx0c3VwZXIuZGVzdHJveSgpO1xyXG5cdFx0dGhpcy5fb2tjYWwgPSBmdW5jdGlvbigpe307XHJcblx0XHR0aGlzLl9jYW5jZWxjYWwgPSBmdW5jdGlvbigpe307XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbmZpcm1Db250cm9sO1xyXG4iLCLvu78vKipcclxuICogQGZpbGVvdmVydmlldyBjb25mcmlt57G75Y2V5L2T5o6n5Yi25Zmo77yM5LiA6Iis55So5LqO566A5Y2V55qEY29uZmlybeS/oeaBr+aPkOekuuOAglxyXG4gKiDms6jmhI/vvJror6Vjb25mcmlt5o6n5Yi255qE5a+56LGh5Y+KZG9t5Zyo5YWo5bGA5Lit5ZSv5LiA5a2Y5Zyo77yM5aaC5p6c5oOz6KaB5Yib5bu65aSa5Liq77yM6K+35L2/55SobGlibGF5ZXJzL2NvbmZpcm3miJZsaWJsYXllcnMvY29uZmlybUNvbnRyb2xcclxuICogQHZlcnNpb24gMS4wLjAgfCAyMDE1LTA5LTE2IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEBleGFtcGxlXHJcbiAqICAgICAgY29uc3QgQ29uZmlybVNpbmdsZSA9IHJlcXVpcmUoJ2xpYmxheWVyLWNvbmZpcm1TaW5nbGUnKTtcclxuICpcclxuXHRcdENvbmZpcm1TaW5nbGUuc2V0Y29uZmlnKHtcclxuXHRcdFx0Y29uZmlybToge1xyXG5cdFx0XHRcdGZyYW1ldHBsOiBbXHJcblx0XHRcdFx0XHQnPGRpdiBjbGFzcz1cImpzLWNvbnRlbnRcIj48L2Rpdj4nLFxyXG5cdFx0XHRcdFx0JzxkaXY+PGEgaHJlZj1cImphdmFzY3JpcHQ6O1wiIGNsYXNzPVwianMtb2tcIj7lpb3nmoQ8L2E+PGEgaHJlZj1cImphdmFzY3JpcHQ6O1wiIGNsYXNzPVwianMtY2FuY2VsXCI+562J5LiL6K+0PC9hPjwvZGl2PidcclxuXHRcdFx0XHRdLmpvaW4oJycpXHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0Q29uZmlybVNpbmdsZS5zaG93KHtcclxuXHRcdCAgICBjb250ZW50OiAn5oKo6L+Y5pyq55m76ZmGJ1xyXG5cdFx0fSx7XHJcblx0XHQgICAgb2s6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn54K55Ye75aW955qEJyk7XHJcbiAgICAgICAgICAgIH0sXHJcblx0XHRcdGNhbmNlbDogZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRjb25zb2xlLmxvZygn54K55Ye7562J5LiL6K+0Jyk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG4gICAgICAgIENvbmZpcm1TaW5nbGUuZ2V0bGF5ZXJvYmooKe+8myAvL2xheWVyL2NvbmZpcm3nsbvlr7nosaFcclxuICogKi9cclxuIGNvbnN0IENvbmZyaW1Db250cm9sID0gcmVxdWlyZSgnLi9jb25maXJtQ29udHJvbC5qcycpO1xyXG5cclxuIG1vZHVsZS5leHBvcnRzID0gbmV3IENvbmZyaW1Db250cm9sKCk7XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IOa1ruWxguWfuuexu1xyXG4gKiBAdmVyc2lvbiAxLjAuMCB8IDIwMTUtMDgtMTkg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQHJldHVybiDmta7lsYLln7rnsbtcclxuICogQGV4YW1wbGVcclxuICpcclxuICogXHRjb25zdCBMYXllciA9IHJlcXVpcmUoJ2xpYmxheWVyLWxheWVyJyk7XHJcbiAqXHJcbiAqIFx0IHZhciBsYXllciA9IG5ldyBMYXllcigkKCdib2R5JykpO1xyXG4gKiAgIGxheWVyLnNob3diZWZvcmVjYWwuYWRkKGZ1bmN0aW9uKCl7Y29uc29sZS5sb2coJ+WxguaYvuekuuWJjScpO30pO1xyXG4gKiAgIGxheWVyLmhpZGViZWZvcmVjYWwuYWRkKGZ1bmN0aW9uKCl7Y29uc29sZS5sb2coJ+WxgumakOiXj+WJjScpO30pO1xyXG4gKiAgIGxheWVyLnNob3dhZnRlcmNhbC5hZGQoZnVuY3Rpb24oKXtjb25zb2xlLmxvZygn5bGC5pi+56S65ZCOJyk7fSk7XHJcbiAqICAgbGF5ZXIuaGlkZWFmdGVyY2FsLmFkZChmdW5jdGlvbigpe2NvbnNvbGUubG9nKCflsYLpmpDol4/lkI4nKTt9KTtcclxuICogICBsYXllci5oaWRlKCk7IC8v6ZqQ6JeP5bGCXHJcbiAqICAgbGF5ZXIubGF5ZXI7IC8v5bGCZG9t6IqC54K55a+56LGhXHJcbiAqICAgbGF5ZXIuY29udGFpbmVyOyAvL+a1ruWxguWuueWZqFxyXG4gKiAgIGxheWVyLmRlc3Ryb3koKTsgLy/plIDmr4HlsYJcclxuICogKi9cclxuXHJcbiBjbGFzcyBMYXllciB7XHJcblx0IC8qKlxyXG4gXHQgKiDmta7lsYLln7rnsbvigJTigJTliJvlu7rlubbmt7vliqDliLDmjIflrprlrrnlmajkuK1cclxuICAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IGNvbnRhaW5lciDmta7lsYLlrZjmlL7lrrnlmajvvIzpu5jorqTkuLokKCdib2R5JylcclxuICAgICAgKiBAcGFyYW0ge0pTT059IGNvbmZpZyDlsYLphY3nva7lj4LmlbDvvIzpu5jorqTkv6Hmga/lj4ror7TmmI7lpoLkuItvcHTku6PnoIHlpIRcclxuIFx0ICovXHJcblx0IGNvbnN0cnVjdG9yKGNvbnRhaW5lcixjb25maWcpe1xyXG5cdFx0Y29udGFpbmVyID0gY29udGFpbmVyIHx8ICQoJ2JvZHknKTtcclxuIFx0XHR2YXIgb3B0ID0gJC5leHRlbmQodHJ1ZSx7XHJcbiBcdFx0XHRjbGFzc25hbWU6ICcnLCAvL2xheWVy55qEY2xhc3NcclxuIFx0XHRcdHpJbmRleDogMiwgLy9sYXllcueahHotaW5kZXhcclxuIFx0XHRcdHBvc2l0aW9uOiAnYWJzb2x1dGUnLCAvL2xheWVy55qEcG9zaXRpb27jgILpu5jorqTmmK9hYnNvbHV0ZVxyXG4gXHRcdFx0c2hvdzogZmFsc2UsIC8v5Yib5bu65bGC5ZCO6buY6K6k5piv5ZCm5pi+56S6XHJcbiBcdFx0XHRjdXN0b206IHtcclxuIFx0XHRcdFx0c2hvdzogbnVsbCwgLy/nlKjmiLfoh6rlrprkuYnmmL7npLrlsYLnmoTmlrnms5XjgILlpoLmnpzmraTmlrnms5XlrZjlnKjvvIzliJnkuI3nlKjpu5jorqTnmoTmmL7npLrlsYLmlrnms5VcclxuIFx0XHRcdFx0aGlkZTogbnVsbCAvL+eUqOaIt+iHquWumuS5iemakOiXj+WxgueahOaWueazleOAguWmguaenOatpOaWueazleWtmOWcqO+8jOWImeS4jeeUqOm7mOiupOeahOmakOiXj+WxguaWueazlVxyXG4gXHRcdFx0fVxyXG4gXHRcdH0sY29uZmlnIHx8IHt9KTtcclxuIFx0XHR2YXIgY3Nzc3RyID0gJ3Bvc2l0aW9uOicrb3B0LnBvc2l0aW9uKyc7Jysob3B0LnNob3c/Jyc6J2Rpc3BsYXk6bm9uZTsnKSsnei1pbmRleDonK29wdC56SW5kZXgrJzsnO1xyXG4gXHRcdHRoaXMuY29udGFpbmVyID0gY29udGFpbmVyOyAvL+a1ruWxguWuueWZqFxyXG4gXHRcdHRoaXMubGF5ZXIgPSAkKCc8ZGl2Jysob3B0LmNsYXNzbmFtZSA9PSAnJz8nJzonIGNsYXNzPVwiJytvcHQuY2xhc3NuYW1lKydcIicpKycgc3R5bGU9XCInK2Nzc3N0cisnXCI+PC9kaXY+Jyk7XHJcbiBcdFx0dGhpcy5sYXllci5hcHBlbmRUbyhjb250YWluZXIpO1xyXG4gXHRcdHRoaXMuc2hvd2JlZm9yZWNhbCA9ICQuQ2FsbGJhY2tzKCk7IC8v5bGC5pi+56S65YmN55qE5Zue6LCDXHJcbiBcdFx0dGhpcy5zaG93YWZ0ZXJjYWwgPSAkLkNhbGxiYWNrcygpOyAvL+WxguaYvuekuuWQjueahOWbnuiwg1xyXG4gXHRcdHRoaXMuaGlkZWJlZm9yZWNhbCA9ICQuQ2FsbGJhY2tzKCk7IC8v5bGC6ZqQ6JeP5YmN55qE5Zue6LCDXHJcbiBcdFx0dGhpcy5oaWRlYWZ0ZXJjYWwgPSAkLkNhbGxiYWNrcygpOyAvL+WxgumakOiXj+WQjueahOWbnuiwg1xyXG4gXHRcdHRoaXMuY3VzdG9tICA9IG9wdC5jdXN0b207IC8v6Ieq5a6a5LmJ5pa55rOVXHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOiuvue9ruWxguWGheWuuVxyXG4gIFx0ICogQHBhcmFtIHtFbGVtZW50fFN0cmluZ30gKmNvbnRlbnQgaHRtbOWtl+espuS4suaIluiAheiKgueCueWvueixoVxyXG4gXHQgKi9cclxuXHQgc2V0Q29udGVudChjb250ZW50KXtcclxuXHRcdGlmKGFyZ3VtZW50cy5sZW5ndGggPT0gMCl7XHJcbiBcdFx0XHRyZXR1cm47XHJcbiBcdFx0fVxyXG4gXHRcdGlmKHR5cGVvZiBjb250ZW50ID09ICdzdHJpbmcnKXtcclxuIFx0XHRcdHRoaXMubGF5ZXIuaHRtbChjb250ZW50KTtcclxuIFx0XHR9XHJcbiBcdFx0ZWxzZXtcclxuIFx0XHRcdHRoaXMubGF5ZXIuaHRtbCgnJykuYXBwZW5kKGNvbnRlbnQpO1xyXG4gXHRcdH1cclxuXHQgfVxyXG5cdCAvKipcclxuIFx0ICog5pi+56S65bGC44CCXHJcbiBcdCAqL1xyXG5cdCBfc2hvdygpe1xyXG5cdFx0IGlmKHR5cGVvZiB0aGlzLmN1c3RvbS5zaG93ID09ICdmdW5jdGlvbicpe1xyXG4gXHRcdFx0dGhpcy5jdXN0b20uc2hvdyh0aGlzLmxheWVyKTtcclxuIFx0XHR9XHJcbiBcdFx0ZWxzZXtcclxuIFx0XHRcdHRoaXMubGF5ZXIuc2hvdygpO1xyXG4gXHRcdH1cclxuXHQgfVxyXG5cdCAvKipcclxuIFx0ICog5pi+56S65bGC44CC5Lya6Kem5Y+Rc2hvd2NhbOWbnuiwg1xyXG4gXHQgKi9cclxuIFx0IHNob3coKXtcclxuXHRcdCBpZighdGhpcy5pc3Nob3coKSl7XHJcbiBcdFx0XHR0aGlzLnNob3diZWZvcmVjYWwuZmlyZSgpOyAvL+WxguaYvuekuuWJjeWbnuiwg1xyXG4gXHRcdFx0dGhpcy5fc2hvdygpO1xyXG4gXHRcdFx0dGhpcy5zaG93YWZ0ZXJjYWwuZmlyZSgpOyAvL+WxguaYvuekuuWQjuWbnuiwg1xyXG4gXHRcdH1cclxuXHQgfVxyXG5cdCAvKipcclxuIFx0ICog6ZqQ6JeP5bGC44CCXHJcbiBcdCAqL1xyXG5cdCBfaGlkZSgpe1xyXG5cdFx0aWYodHlwZW9mIHRoaXMuY3VzdG9tLmhpZGUgPT0gJ2Z1bmN0aW9uJyl7XHJcbiBcdFx0XHR0aGlzLmN1c3RvbS5oaWRlKHRoaXMubGF5ZXIpO1xyXG4gXHRcdH1cclxuIFx0XHRlbHNle1xyXG4gXHRcdFx0dGhpcy5sYXllci5oaWRlKCk7XHJcbiBcdFx0fVxyXG5cdCB9XHJcblx0IC8qKlxyXG4gXHQgKiDpmpDol4/lsYLjgILkvJrop6blj5FoaWRlY2Fs5Zue6LCDXHJcbiBcdCAqL1xyXG5cdCBoaWRlKCl7XHJcblx0XHQgaWYodGhpcy5pc3Nob3coKSl7XHJcbiBcdFx0XHR0aGlzLmhpZGViZWZvcmVjYWwuZmlyZSgpOyAvL+WxgumakOiXj+WJjeWbnuiwg1xyXG4gXHRcdFx0dGhpcy5faGlkZSgpO1xyXG4gXHRcdFx0dGhpcy5oaWRlYWZ0ZXJjYWwuZmlyZSgpOyAvL+WxgumakOiXj+WQjuWbnuiwg1xyXG4gXHRcdH1cclxuXHQgfVxyXG5cdCAvKipcclxuIFx0ICog6ZSA5q+B5bGCXHJcbiBcdCAqL1xyXG5cdCBkZXN0cm95KCl7XHJcblx0XHQgaWYodGhpcy5sYXllciAhPSBudWxsKXtcclxuIFx0XHRcdHRoaXMubGF5ZXIucmVtb3ZlKCk7XHJcbiBcdFx0XHR0aGlzLmxheWVyID0gbnVsbDtcclxuIFx0XHRcdHRoaXMuc2hvd2NhbCA9IG51bGw7XHJcbiBcdFx0XHR0aGlzLmhpZGVjYWwgPSBudWxsO1xyXG4gXHRcdFx0dGhpcy5jdXN0b20gPSBudWxsO1xyXG4gXHRcdFx0dGhpcy5jb250YWluZXIgPSBudWxsO1xyXG4gXHRcdH1cclxuXHQgfVxyXG5cdCAvKipcclxuIFx0ICog5Yik5pat5bGC5piv5ZCm5pi+56S6XHJcbiBcdCAqIEByZXR1cm4ge0Jvb2xlYW59IHRydWV8ZmFsc2VcclxuIFx0ICovXHJcblx0IGlzc2hvdygpe1xyXG5cdFx0IHJldHVybiB0aGlzLmxheWVyLmNzcygnZGlzcGxheScpICE9ICdub25lJztcclxuXHQgfVxyXG4gfVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBMYXllcjtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcg6YGu572p57G74oCU4oCU5Yib5bu66YGu572p5bm26L+b6KGM55u45YWz5o6n5Yi2XHJcbiAqIEB2ZXJzaW9uIDEuMCB8IDIwMTUtMDgtMTUg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQHJldHVybiDpga7nvanlr7nosaFcclxuICogQGV4YW1wbGVcclxuICogXHQgY29uc3QgTWFzayA9IHJlcXVpcmUoJ2xpYmxheWVyLW1hc2snKTtcclxuICpcclxuICogXHQgdmFyIG1hc2sgPSBuZXcgJG1hc2soJCgnYm9keScpKTtcclxuICogICBtYXNrLnNob3coKTsgLy/mmL7npLrpga7nvalcclxuICogICBtYXNrLmhpZGUoKTsgLy/pmpDol4/pga7nvalcclxuICogICBtYXNrLm1hc2s7IC8v6YGu572pZG9t6IqC54K55a+56LGhXHJcbiAqICAgbWFzay5jb250YWluZXI7IC8v6YGu572p5a655ZmoXHJcbiAqICAgbWFzay5kZXN0cm95KCk7IC8v6ZSA5q+B6YGu572pXHJcbiAqICAgbWFzay5jbGlja2NhbC5hZGQoZnVuY3Rpb24oZSl7XHJcbiAqIFx0ICAgIGNvbnNvbGUubG9nKCfpga7nvanooqvngrnlh7snKTtcclxuICogICB9KTtcclxuICogKi9cclxuXHJcbiBjb25zdCBQb3NpdGlvbkJvbWIgPSByZXF1aXJlKCcuL3Bvc2l0aW9uQm9tYi5qcycpO1xyXG5cclxuIGNsYXNzIE1hc2t7XHJcblx0IC8qKlxyXG5cdCAgKiDpga7nvannsbvigJTigJTliJvlu7rpga7nvalkb23lubbmt7vliqDliLDmjIflrprlrrnlmajkuK1cclxuXHQgICogQHBhcmFtIHtFbGVtZW50fSBjb250YWluZXIg6YGu572p5a2Y5pS+5a655Zmo77yM6buY6K6k5Li6JCgnYm9keScpXHJcblx0ICAqIEBwYXJhbSB7SlNPTn0gY29uZmlnIOmBrue9qemFjee9ruWPguaVsO+8jOm7mOiupOS/oeaBr+WPiuivtOaYjuWmguS4i29wdOS7o+eggeWkhFxyXG5cdCAgKi9cclxuXHQgY29uc3RydWN0b3IoY29udGFpbmVyLGNvbmZpZyl7XHJcblx0XHQgY29udGFpbmVyID0gY29udGFpbmVyIHx8ICQoJ2JvZHknKTtcclxuXHRcdCB2YXIgb3B0ID0gJC5leHRlbmQoe1xyXG4gICAgICAgICAgICAgY2xhc3NuYW1lOiAnJywgLy9tYXNr55qEY2xhc3NcclxuXHRcdFx0IGJnY29sb3I6ICcjMDAwJywgLy/og4zmma/oibJcclxuXHRcdFx0IHpJbmRleDogMSwgLy/pga7nval6LWluZGV4XHJcblx0XHRcdCBvcGFjaXR5OiAwLjYsIC8v6YGu572p6YCP5piO5bqmXHJcblx0XHRcdCBzaG93OiBmYWxzZSwgLy/liJvlu7rpga7nvanlkI7pu5jorqTmmK/lkKbmmL7npLpcclxuXHRcdFx0IGN1c3RvbToge1xyXG5cdFx0XHRcdCBzaG93OiBudWxsLCAvL+eUqOaIt+iHquWumuS5ieaYvuekuuWxgueahOaWueazleOAguWmguaenOatpOaWueazleWtmOWcqO+8jOWImeS4jeeUqOm7mOiupOeahOaYvuekuuWxguaWueazlVxyXG5cdFx0XHRcdCBoaWRlOiBudWxsIC8v55So5oi36Ieq5a6a5LmJ6ZqQ6JeP5bGC55qE5pa55rOV44CC5aaC5p6c5q2k5pa55rOV5a2Y5Zyo77yM5YiZ5LiN55So6buY6K6k55qE6ZqQ6JeP5bGC5pa55rOVXHJcblx0XHRcdCB9XHJcblx0XHQgfSxjb25maWcgfHwge30pO1xyXG5cdFx0IHZhciBjc3NzdHIgPSAncG9zaXRpb246YWJzb2x1dGU7YmFja2dyb3VuZDonK29wdC5iZ2NvbG9yKyc7Jysob3B0LnNob3c/Jyc6J2Rpc3BsYXk6bm9uZTsnKSsnei1pbmRleDonK29wdC56SW5kZXgrJzsnO1xyXG5cdFx0IHRoaXMuY29udGFpbmVyID0gY29udGFpbmVyOyAvL+mBrue9qeWuueWZqFxyXG5cdFx0IHRoaXMubWFzayA9ICQoJzxkaXYnKyhvcHQuY2xhc3NuYW1lID09ICcnPycnOicgY2xhc3M9XCInK29wdC5jbGFzc25hbWUrJ1wiJykrJyBzdHlsZT1cIicrY3Nzc3RyKydcIj48L2Rpdj4nKTtcclxuXHRcdCB0aGlzLm1hc2suYXBwZW5kVG8oY29udGFpbmVyKTtcclxuXHRcdCB0aGlzLm1hc2suY3NzKCdvcGFjaXR5JyxvcHQub3BhY2l0eSk7XHJcblx0XHQgdGhpcy5jdXN0b20gID0gb3B0LmN1c3RvbTsgLy/oh6rlrprkuYnmlrnms5VcclxuXHRcdCB0aGlzLnBvcyA9IG5ldyBQb3NpdGlvbkJvbWIoe2xheWVyOnRoaXMubWFza30se21vZGU6J2Z1bGwnfSk7XHJcblx0XHQgLy/nu5Hlrprkuovku7ZcclxuXHRcdCB0aGlzLmNsaWNrY2FsID0gJC5DYWxsYmFja3MoKTsgLy/pga7nvanngrnlh7vlkI7nmoTlm57osINcclxuXHRcdCB0aGlzLm1hc2sub24oJ2NsaWNrLmxpYicsKGUpID0+IHtcclxuXHRcdFx0IHRoaXMuY2xpY2tjYWwuZmlyZShlKTtcclxuXHRcdCB9KTtcclxuXHQgfVxyXG5cdCAvKipcclxuIFx0ICog5pi+56S66YGu572pXHJcbiBcdCAqL1xyXG5cdCBzaG93KCl7XHJcblx0XHRpZih0eXBlb2YgdGhpcy5jdXN0b20uc2hvdyA9PSAnZnVuY3Rpb24nKXtcclxuIFx0XHRcdHRoaXMuY3VzdG9tLnNob3codGhpcy5tYXNrKTtcclxuIFx0XHR9XHJcbiBcdFx0ZWxzZXtcclxuIFx0XHRcdHRoaXMubWFzay5zaG93KCk7XHJcbiBcdFx0fVxyXG4gXHRcdHRoaXMucG9zLnNldHBvcygpO1xyXG5cdCB9XHJcblx0IC8qKlxyXG4gXHQgKiDpmpDol4/pga7nvalcclxuIFx0ICovXHJcblx0IGhpZGUoKXtcclxuXHRcdCBpZih0eXBlb2YgdGhpcy5jdXN0b20uaGlkZSA9PSAnZnVuY3Rpb24nKXtcclxuIFx0XHRcdHRoaXMuY3VzdG9tLmhpZGUodGhpcy5tYXNrKTtcclxuIFx0XHR9XHJcbiBcdFx0ZWxzZXtcclxuIFx0XHRcdHRoaXMubWFzay5oaWRlKCk7XHJcbiBcdFx0fVxyXG5cdCB9XHJcblx0IC8qKlxyXG4gXHQgKiDplIDmr4Hpga7nvalcclxuIFx0ICovXHJcblx0IGRlc3Ryb3koKXtcclxuXHRcdCBpZih0aGlzLm1hc2sgIT0gbnVsbCl7XHJcbiBcdFx0XHR0aGlzLm1hc2sub2ZmKCdjbGljay5saWInKTtcclxuIFx0XHRcdHRoaXMubWFzay5yZW1vdmUoKTtcclxuIFx0XHRcdHRoaXMubWFzayA9IG51bGw7XHJcbiBcdFx0XHR0aGlzLnBvcy5kZXN0cm95KCk7XHJcbiBcdFx0XHR0aGlzLnBvcyA9IG51bGw7XHJcbiBcdFx0XHR0aGlzLmNsaWNrY2FsID0gbnVsbDtcclxuIFx0XHR9XHJcblx0IH1cclxuIH1cclxuXHJcbiBtb2R1bGUuZXhwb3J0cyA9IE1hc2s7XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IOW8ueWxguWumuS9jeaWueazlVxyXG4gKiBcdFx05rOo5oSP77ya6LCD55So5q2k5pa55rOV5YmN77yM5b+F6aG75piv5b6F5a6a5L2N5bGC55qEZGlzcGxheeS4jeS4um51bGznmoTmg4XlhrXkuItcclxuICogQHZlcnNpb24gMS4wIHwgMjAxNS0wOC0xNSDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAcmV0dXJuIOW8ueWxguWumuS9jeaWueazlVxyXG4gKiBAZXhhbXBsZVxyXG4gKiBcdCBjb25zdCBQb3NpdGlvbkJvbWIgPSByZXF1aXJlKCdsaWJsYXllci1wb3NpdGlvbkJvbWInKTtcclxuICpcclxuICogXHQgdmFyIHBvcyA9IG5ldyBQb3NpdGlvbkJvbWIoe2xheWVyOuWxgmRvbeiKgueCuX0pO1xyXG4gKiBcdCBwb3MucG9zY2FsLmFkZChmdW5jdGlvbigpe2NvbnNvbGUubG9nKCdsYXllcuWumuS9jeWQjuWbnuiwgycpfSk7XHJcbiAqICovXHJcblxyXG4gY29uc3QgV2luc2Nyb2xsID0gcmVxdWlyZSgnbGlidXRpbC13aW5zY3JvbGwnKSxcclxuIFx0XHRTY3JvbGwgPSByZXF1aXJlKCdsaWJ1dGlsLXNjcm9sbCcpLFxyXG5cdFx0V2lucmVzaXplID0gcmVxdWlyZSgnbGlidXRpbC13aW5yZXNpemUnKSxcclxuXHRcdFJlc2l6ZSA9IHJlcXVpcmUoJ2xpYnV0aWwtcmVzaXplJyk7XHJcblxyXG4vKipcclxuICog5a6a5L2N566X5rOVXHJcbiAqL1xyXG5mdW5jdGlvbiBzZXRwb3MoZG9tb3B0LHBvc29wdCl7XHJcblx0dmFyIGNzc29wdCA9IHt9LGxheWVyID0gZG9tb3B0LmxheWVyLG9mZmNvbiA9IGRvbW9wdC5vZmZjb247XHJcblx0bGF5ZXIuY3NzKCdwb3NpdGlvbicsZG9tb3B0LnBvc2l0aW9uKTtcclxuXHR2YXIgbWFyZ2luTGVmdCA9IDAsIG1hcmdpblRvcCA9IDA7XHJcblx0aWYoZG9tb3B0LnBvc2l0aW9uID09ICdhYnNvbHV0ZScgJiYgcG9zb3B0LmZpeGVkKXtcclxuXHRcdG1hcmdpbkxlZnQgPSBvZmZjb24uc2Nyb2xsTGVmdCgpO1xyXG5cdFx0bWFyZ2luVG9wID0gb2ZmY29uLnNjcm9sbFRvcCgpO1xyXG5cdH1cclxuXHRzd2l0Y2ggKHBvc29wdC5tb2RlKXtcclxuXHRcdGNhc2UgJ2MnOiAvL+WxheS4reWumuS9jVxyXG5cdFx0XHRtYXJnaW5MZWZ0IC09IChNYXRoLm1heChsYXllci53aWR0aCgpLHBvc29wdC5taW53aWR0aCkvMitwb3NvcHQub2Zmc2V0WzBdKTtcclxuXHRcdFx0bWFyZ2luVG9wIC09IChNYXRoLm1heChsYXllci5oZWlnaHQoKSxwb3NvcHQubWluaGVpZ2h0KS8yK3Bvc29wdC5vZmZzZXRbMV0pO1xyXG5cdFx0XHRjc3NvcHQudG9wID0gJzUwJSc7XHJcblx0XHRcdGNzc29wdC5sZWZ0ID0gJzUwJSc7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0Y2FzZSAnZnVsbCc6IC8v5ruh5bGP5a6a5L2N77yM5Y2g5ruh5pW05Liq5a6a5L2N5a655Zmo44CC5pys5p2l5LiN6K6+572ud2lkdGjlkoxoZWlnaHTvvIzorr7nva7kuoZyaWdodOWSjGJvdHRvbeOAguS9huaYr+WBtuWPkW1hcmdpbuS4jei1t+S9nOeUqO+8jOatpOaXtuivu+WPlueahOWFg+e0oOWwuuWvuOS4ujAuXHJcblx0XHRcdGNzc29wdC53aWR0aCA9ICcxMDAlJztcclxuXHRcdFx0Y3Nzb3B0LmhlaWdodCA9ICcxMDAlJztcclxuXHRcdFx0Y3Nzb3B0LnRvcCA9ICcwJztcclxuXHRcdFx0Y3Nzb3B0LmxlZnQgPSAnMCc7XHJcblx0XHRcdGJyZWFrO1xyXG5cdH1cclxuXHRjc3NvcHQubWFyZ2luTGVmdCA9IG1hcmdpbkxlZnQrJ3B4JztcclxuXHRjc3NvcHQubWFyZ2luVG9wID0gbWFyZ2luVG9wKydweCc7XHJcblx0aWYodHlwZW9mIHBvc29wdC5jdXN0b21wb3MgPT0gJ2Z1bmN0aW9uJyl7XHJcblx0XHRwb3NvcHQuY3VzdG9tcG9zKGNzc29wdCk7XHJcblx0fWVsc2V7XHJcblx0XHRsYXllci5jc3MoY3Nzb3B0KTtcclxuXHR9XHJcbn1cclxuXHJcbmNsYXNzIFBvc2l0aW9ue1xyXG5cdC8qKlxyXG5cdCAqIOWumuS9jeexu1xyXG4gICAgICogQHBhcmFtIHtKU09OfSBkb21zIOWumuS9jWRvbeebuOWFs+S/oeaBr1xyXG4gICAgICogXHRcdHtcclxuICAgICAqIFx0XHRcdGxheWVyOiBudWxsIC8ve0pRdWVyeUVsZW1lbnR8U3RyaW5n6IqC54K56YCJ5oup5ZmofSDlvoXlrprkvY3lsYLoioLngrlcclxuICAgICAqICAgICAgfVxyXG4gICAgICogQHBhcmFtIHtKU09OfSBjb25maWcg5bGC5a6a5L2N6YWN572u5Y+C5pWw77yM6buY6K6k5L+h5oGv5Y+K6K+05piO5aaC5LiLcG9zb3B05Luj56CB5aSEXHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IoZG9tcyxjb25maWcpe1xyXG5cdFx0Ly/lj4LmlbDmo4DmtYvkuI7orr7nva5cclxuXHRcdGlmKGFyZ3VtZW50cy5sZW5ndGggPT0gMCl7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcign5b+F6aG75Lyg5YWl55u45YWz5a6a5L2N55qEZG9t5Y+C5pWwJyk7XHJcblx0XHR9XHJcblx0XHR2YXIgZG9tb3B0ID0gJC5leHRlbmQoe1xyXG5cdFx0XHRsYXllcjogbnVsbCwgLy/lvoXlrprkvY3lsYLoioLngrlcclxuXHRcdFx0b2ZmcGFnZTogZmFsc2UgLy/or7TmmI7nm7jlr7nkuo7lvZPliY3pobXpnaLlrprkvY1cclxuXHRcdH0sZG9tcyB8fCB7fSk7XHJcblx0XHRpZihkb21vcHQubGF5ZXIgJiYgdHlwZW9mIGRvbW9wdC5sYXllciA9PSAnc3RyaW5nJyl7XHJcblx0XHRcdGRvbW9wdC5sYXllciA9ICQoZG9tb3B0LmxheWVyKTtcclxuXHRcdH1cclxuXHRcdGlmKCFkb21vcHQubGF5ZXIgfHwgZG9tb3B0LmxheWVyLmxlbmd0aCA9PSAwKXtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCfkvKDlhaXnmoTlrprkvY3lsYLoioLngrnml6DmlYgnKTtcclxuXHRcdH1cclxuXHRcdHZhciBwb3NvcHQgPSAkLmV4dGVuZCh7XHJcblx0XHRcdGZpeGVkOiB0cnVlLCAvL+aYr+WQpuWwhuW8ueWxguWni+e7iOWumuS9jeWcqOWPr+inhueql+WPo+WMuuWfn++8jOm7mOiupOS4unRydWVcclxuXHRcdFx0bW9kZTogJ2MnLCAvL+WumuS9jeaooeW8j++8jOaemuS4vuOAgmM65Lit6Ze0XHJcblx0XHRcdG9mZnNldDogWzAsMF0sIC8v5a6a5LmJ5ZCO5YGP56e75bC65a+4IFt46L20LHnovbRd44CC5a+55LqObW9kZeaYr2Z1bGznmoTmqKHlvI/ml6DmlYhcclxuXHRcdFx0c2l6ZWNoYW5nZTogZmFsc2UsIC8v5b2TbW9kZeaYr2Pml7bvvIxvZmZzZXRQYXJlbnQgcmVzaXpl5pe277yM5b6F5a6a5L2N5bGC55qE5aSn5bCP5piv5ZCm5Lya5pS55Y+YXHJcblx0XHRcdG1pbndpZHRoOiAwLCAvL+WumuS9jeiuoeeul+aXtu+8jOW+heWumuS9jeWxgmxheWVy55qE5pyA5bCP5a695bqmXHJcbiAgICAgICAgICAgIG1pbmhlaWdodDogMCwgLy/lrprkvY3orqHnrpfml7bvvIzlvoXlrprkvY3lsYJsYXllcueahOacgOWwj+mrmOW6plxyXG4gICAgICAgICAgICBjdXN0b21wb3M6IG51bGwgLy/nlKjmiLfoh6rlrprkuYnlrprkvY3mlrnms5XjgILlpoLmnpzlo7DmmI7mraTmlrnms5XvvIzliJnkuI3kvJrkvb/nlKjns7vnu5/pu5jorqTnmoTmlrnms5Xorr7nva5wb3PnmoTlrprkvY3lj4LmlbDvvIzogIzmmK/miorlrprkvY3lj4LmlbBwb3PkvKDpgJLnu5nmraTmlrnms5VcclxuXHRcdH0sY29uZmlnIHx8IHt9KTtcclxuICAgICAgICB0aGlzLnBvc2NhbCA9ICQuQ2FsbGJhY2tzKCk7IC8vc2V0cG9z5ZCO55qE5Zue6LCDXHJcblxyXG5cdFx0dmFyIHRoYXQgPSB0aGlzO1xyXG5cdFx0Ly/liJ3mraXmo4DmtYvlrprkvY3lj4LogIPlrrnlmahcclxuXHRcdGRvbW9wdC5vZmZjb24gPSBkb21vcHQubGF5ZXIub2Zmc2V0UGFyZW50KCk7XHJcblx0XHR2YXIgdGFnbmFtZSA9IGRvbW9wdC5vZmZjb24uZ2V0KDApLnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcclxuXHRcdHZhciBsaXN0ZW5jYWxsID0ge1xyXG4gICAgICAgICAgICBjYWxsOiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgdGhhdC5zZXRwb3MoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdmFyIGlzbGlzc2Nyb2xsID0gZmFsc2U7IC8v5piv5ZCm55uR5ZCsc2Nyb2xs5LqL5Lu2XHJcbiAgICAgICAgdmFyIGlzbGlzcmVzaXplID0gZmFsc2U7IC8v5piv5ZCm55uR5ZCscmVzaXpl5LqL5Lu2XHJcblx0XHRpZih0YWduYW1lID09ICdib2R5JyB8fCB0YWduYW1lID09ICdodG1sJyl7IC8v6K+05piO55u45a+55LqO6aG16Z2i5a6a5L2NXHJcblx0XHQgICAgZG9tb3B0Lm9mZmNvbiA9ICQoJ2JvZHknKTtcclxuXHRcdFx0ZG9tb3B0Lm9mZnBhZ2UgPSB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0aWYoZG9tb3B0Lm9mZnBhZ2UgJiYgcG9zb3B0LmZpeGVkKXsgLy/lpoLmnpzlrprkvY3lrrnlmajmmK/lvZPliY3pobXpnaLjgIHlm7rlrprlrprkvY3jgIHlj6/kvb/nlKhmaXhlZOWumuS9jeOAguWImeeUqGZpeGVk5a6a5L2NXHJcblx0XHRcdGRvbW9wdC5wb3NpdGlvbiA9ICdmaXhlZCc7XHJcblx0XHR9XHJcblx0XHRlbHNle1xyXG5cdFx0XHRkb21vcHQucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xyXG5cdFx0XHRpZihwb3NvcHQuZml4ZWQpIHsgLy/lpoLmnpzlm7rlrprlrprkvY3vvIzliJnnm5HlkKxzY3JvbGzkuovku7ZcclxuXHRcdFx0ICAgIGlzbGlzc2Nyb2xsID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGlmKGRvbW9wdC5vZmZwYWdlKXtcclxuICAgICAgICAgICAgICAgICAgICBXaW5zY3JvbGwubGlzdGVuKGxpc3RlbmNhbGwpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc2Nyb2xsID0gbmV3IFNjcm9sbChkb21vcHQub2ZmY29uKTtcclxuICAgICAgICAgICAgICAgICAgICBzY3JvbGwubGlzdGVuKGxpc3RlbmNhbGwpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHQvL+ivtOaYjm1vZGXmmK9j5pe277yMb2Zmc2V0UGFyZW50IHJlc2l6ZeaXtu+8jOW+heWumuS9jeWxgueahOWkp+Wwj+S8muaUueWPmO+8jOWImeebkeWQrHJlc2l6ZeS6i+S7tlxyXG4gICAgICAgIGlmKHBvc29wdC5tb2RlID09ICdjJyAmJiBwb3NvcHQuc2l6ZWNoYW5nZSl7XHJcbiAgICAgICAgICAgIGlzbGlzcmVzaXplID0gdHJ1ZTtcclxuICAgICAgICAgICAgaWYoZG9tb3B0Lm9mZnBhZ2Upe1xyXG4gICAgICAgICAgICAgICAgV2lucmVzaXplLmxpc3RlbihsaXN0ZW5jYWxsKTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICB2YXIgcmVzaXplID0gbmV3IFJlc2l6ZShkb21vcHQub2ZmY29uKTtcclxuICAgICAgICAgICAgICAgIHJlc2l6ZS5saXN0ZW4obGlzdGVuY2FsbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblx0XHR0aGlzLmRvbW9wdCA9IGRvbW9wdDsgLy9kb23lj4LmlbBcclxuXHRcdHRoaXMucG9zb3B0ID0gcG9zb3B0OyAvL+WumuS9jeWPguaVsFxyXG5cdFx0dGhpcy5kZXN0cm95ID0gZnVuY3Rpb24oKXsgLy/nu4Tku7bplIDmr4Hmlrnms5VcclxuXHRcdFx0dGhpcy5kb21vcHQgPSBudWxsO1xyXG5cdFx0XHR0aGlzLnBvc29wdCA9IG51bGw7XHJcblx0XHRcdGlmKGlzbGlzc2Nyb2xsKXtcclxuXHRcdFx0XHRpZihkb21vcHQub2ZmcGFnZSl7XHJcblx0XHRcdFx0XHRXaW5zY3JvbGwudW5saXN0ZW4obGlzdGVuY2FsbCk7XHJcblx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRzY3JvbGwudW5saXN0ZW4obGlzdGVuY2FsbCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdGlmKGlzbGlzcmVzaXplKXtcclxuXHRcdFx0ICAgIGlmKGRvbW9wdC5vZmZwYWdlKXtcclxuICAgICAgICAgICAgICAgICAgICBXaW5yZXNpemUudW5saXN0ZW4obGlzdGVuY2FsbCk7XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICByZXNpemUudW5saXN0ZW4obGlzdGVuY2FsbCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIOi/m+ihjOWumuS9jVxyXG5cdCAqIEByZXR1cm4ge0Jvb2xlYW59IOaYr+WQpuWumuS9jeaIkOWKn1xyXG5cdCAqL1xyXG5cdHNldHBvcygpe1xyXG5cdFx0aWYodGhpcy5kb21vcHQubGF5ZXIuY3NzKCdkaXNwbGF5JykgPT0gJ25vbmUnIHx8IHRoaXMuZG9tb3B0Lm9mZmNvbi5jc3MoJ2Rpc3BsYXknKSA9PSAnbm9uZScpe1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRlbHNle1xyXG5cdFx0XHRzZXRwb3ModGhpcy5kb21vcHQsdGhpcy5wb3NvcHQpO1xyXG4gICAgICAgICAgICB0aGlzLnBvc2NhbC5maXJlKCk7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQb3NpdGlvbjtcclxuIiwiLyoqXHJcbiAqIGFsZXJ05by55bGC5qih5p2/77yM5b+F6aG75YW35pyJ5oyH5a6a55qEbm9kZeWxnuaAp1xyXG4gKi9cclxuZXhwb3J0cy5hbGVydCA9IFtcclxuICAgICc8ZGl2Puagh+mimDwvZGl2PicsXHJcblx0JzxkaXYgbm9kZT1cImNvbnRlbnRcIj7lhoXlrrnljLo8L2Rpdj4nLFxyXG5cdCc8ZGl2PjxhIGhyZWY9XCJqYXZhc2NyaXB0OjtcIiBjbGFzcz1cImpzLW9rXCI+56Gu5a6aPC9hPjwvZGl2PidcclxuXS5qb2luKCcnKTtcclxuLyoqXHJcbiAqIGNvbmZpcm3lvLnlsYLmqKHmnb/vvIzlv4XpobvlhbfmnInmjIflrprnmoRub2Rl5bGe5oCnXHJcbiAqL1xyXG5leHBvcnRzLmNvbmZpcm0gPSBbXHJcbiAgICAnPGRpdj7moIfpopg8L2Rpdj4nLFxyXG5cdCc8ZGl2IG5vZGU9XCJjb250ZW50XCI+5YaF5a655Yy6PC9kaXY+JyxcclxuXHQnPGRpdj48YSBocmVmPVwiamF2YXNjcmlwdDo7XCIgY2xhc3M9XCJqcy1va1wiPuehruWumjwvYT48YSBocmVmPVwiamF2YXNjcmlwdDo7XCIgY2xhc3M9XCJqcy1jYW5jZWxcIj7lj5bmtog8L2E+PC9kaXY+J1xyXG5dLmpvaW4oJycpXHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IGNzc+aUr+aMgeaDheWGteWIpOaWreOAguS4u+imgeeUqOS6jua1j+iniOWZqOWFvOWuuVxyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE1LTA4LTMxIOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm5cclxuICogQGV4YW1wbGVcclxuICogXHQgY29uc3QgQ3Nzc3Vwb3J0ID0gcmVxdWlyZSgnbGlidXRpbC1jc3NzdXBvcnQnKTtcclxuICogXHQgQ3Nzc3Vwb3J0LmZpeGVkO1xyXG4gKiAqL1xyXG52YXIgX2RpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG52YXIgcmVzdWx0ID0ge1xyXG5cdC8v5piv5ZCm5pSv5oyBcG9zaXRpb246Zml4ZWTlrprkvY1cclxuXHRmaXhlZDogISgndW5kZWZpbmVkJyA9PSB0eXBlb2YoZG9jdW1lbnQuYm9keS5zdHlsZS5tYXhIZWlnaHQpIHx8IChkb2N1bWVudC5jb21wYXRNb2RlICE9PSBcIkNTUzFDb21wYXRcIiAmJiAvbXNpZS8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkpKSksXHJcblx0Ly/mmK/lkKbmlK/mjIF0cmFuc2l0aW9uXHJcblx0dHJhbnNpdGlvbjogIShfZGl2LnN0eWxlLnRyYW5zaXRpb24gPT0gdW5kZWZpbmVkKVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSByZXN1bHQ7XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IOWvueS6jumrmOmikeinpuWPkeeahOS6i+S7tui/m+ihjOW7tui/n+WkhOeQhuexu+OAguW6lOeUqOWcuuaZr++8mnNjcm9sbOWSjHJlc2l6ZVxyXG4gKiBAdmVyc2lvbiAxLjAuMCB8IDIwMTUtMDgtMjcg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQHJldHVybiDlpITnkIbnsbtcclxuICogQGV4YW1wbGVcclxuICogKi9cclxuXHJcbiBjb25zdCBQdWJsaXNoZXJTID0gcmVxdWlyZSgnLi9wdWJsaXNoZXJTLmpzJyk7XHJcblxyXG4gY2xhc3MgRGVsYXlldnQgZXh0ZW5kcyBQdWJsaXNoZXJTe1xyXG5cdCAvKipcclxuIFx0ICog5a+55LqO6auY6aKR6Kem5Y+R55qE5LqL5Lu26L+b6KGM5bu26L+f5aSE55CG44CC5bqU55So5Zy65pmv77yac2Nyb2xs5ZKMcmVzaXplXHJcbiBcdCAqIEBwYXJhbSB7SlNPTn0gY29uZmlnIOmFjee9rlxyXG4gXHQgKi9cclxuXHQgY29uc3RydWN0b3IoY29uZmlnKXtcclxuXHQgICAgc3VwZXIoKTtcclxuIFx0XHR0aGlzLnRpbWVyID0gbnVsbDtcclxuIFx0XHQkLmV4dGVuZCh0aGlzLHtcclxuIFx0XHRcdGRlbGF5dGltZTogMjAwIC8v5LqL5Lu25qOA5rWL5bu26L+f5pe26Ze077yM5q+r56eSXHJcbiBcdFx0fSxjb25maWcgfHwge30pO1xyXG5cdCB9XHJcblx0IC8qKlxyXG4gXHQgKiDlvIDlp4vmo4DmtYtcclxuIFx0ICovXHJcblx0IHN0YXJ0KCl7XHJcblx0XHQgaWYodGhpcy50aW1lcil7XHJcbiAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lcik7XHJcbiAgICAgICAgIH1cclxuICAgICAgICAgdGhpcy50aW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICBcdHRoaXMuZGVsaXZlcigpO1xyXG4gICAgICAgICB9LHRoaXMuZGVsYXl0aW1lKTtcclxuXHQgfVxyXG4gfVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBEZWxheWV2dDtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcg5qC55o2u6K6+5aSH57uZ5Ye655u45YWz5Lia5Yqh5LqL5Lu255qE5LqL5Lu25ZCN56ewXHJcbiAqIEB2ZXJzaW9uIDEuMC4wIHwgMjAxNS0wOS0xNCDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAZXhhbXBsZVxyXG4gKiAqL1xyXG52YXIgcmVzdWx0ID0ge1xyXG5cdC8v5rWP6KeI5Zmo56qX5Y+jcmVzaXpl5LqL5Lu2XHJcblx0d2lucmVzaXplOiAoZnVuY3Rpb24oKXtcclxuXHQgICAgcmV0dXJuICdvbm9yaWVudGF0aW9uY2hhbmdlJyBpbiB3aW5kb3c/ICdvcmllbnRhdGlvbmNoYW5nZSc6ICdyZXNpemUnO1xyXG5cdH0pKCksXHJcblx0Ly9pbnB1dOaIlnRleHRhcmVh6L6T5YWl5qGG5YC85pS55Y+Y55qE55uR5ZCs5LqL5Lu2XHJcblx0aW5wdXQ6IChmdW5jdGlvbigpe1xyXG5cdCAgICBpZigvTVNJRSA5LjAvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkpeyAvL0llOemCo+S4quWdkeeIueeahO+8jOacrOadpWlucHV05ZKMcHJvcGVydHljaGFuZ2Xpg73mlK/mjIHvvIzkvYbmmK/liKDpmaTplK7ml6Dms5Xop6blj5Hov5nkuKTkuKrkuovku7bvvIzmiYDku6Xlvpfmt7vliqBrZXl1cFxyXG5cdCAgICAgICAgcmV0dXJuICdpbnB1dCBrZXl1cCc7XHJcblx0ICAgIH1cclxuXHQgICAgdmFyIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xyXG5cdCAgICBpZignb25pbnB1dCcgaW4gbm9kZSl7XHJcblx0ICAgICAgICByZXR1cm4gJ2lucHV0JztcclxuXHQgICAgfWVsc2UgaWYoJ29ucHJvcGVydHljaGFuZ2UnIGluIG5vZGUpe1xyXG5cdCAgICAgICAgcmV0dXJuICdwcm9wZXJ0eWNoYW5nZSc7XHJcblx0ICAgIH1lbHNlIHtcclxuXHQgICAgICAgIHJldHVybiAna2V5dXAnO1xyXG5cdCAgICB9XHJcblx0fSkoKVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSByZXN1bHQ7XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IOiuoumYheiAheaooeW8j+KAlOKAlOWPkeW4g+iAheexu+KAlOKAlOeyvueugOeJiFxyXG4gKiDnsr7nroDniYjvvJrorqLpmIXogIXkuI3pmZDlrprlv4XpobvmmK/orqLpmIXogIXnsbtTdWJzY3JpYmVy55qE5a+56LGhXHJcbiAqIEB2ZXJzaW9uIDEuMCB8IDIwMTUtMDgtMzEg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQHJldHVybiDlj5HluIPogIXnsbtcclxuICogQGV4YW1wbGVcclxuICogKi9cclxuIGNvbnN0IFRvb2wgPSByZXF1aXJlKCcuL3Rvb2wuanMnKSxcclxuXHQgICBSd2NvbnRyb2xsZXIgPSByZXF1aXJlKCcuL3J3Y29udHJvbGxlci5qcycpO1xyXG5cclxuY2xhc3MgUHVibGlzaGVyU3tcclxuXHRjb25zdHJ1Y3Rvcigpe1xyXG5cdFx0dGhpcy5zdWJzY3JpYmVycyA9IFtdOyAvL+iusOW9leiuoumYheiAheWvueixoVxyXG5cdFx0dGhpcy5yd2NvbnRyb2xsZGVyID0gbmV3IFJ3Y29udHJvbGxlcigpO1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiDlj4LmlbDmnInmlYjmgKfpqozor4FcclxuXHQgKi9cclxuXHRhcmdzVmFsaWRhdGUoZGF0YSl7XHJcblx0XHRpZihUb29sLmlzT2JqZWN0KGRhdGEpICYmIFRvb2wuaXNGdW5jdGlvbihkYXRhLmNhbGwpKXtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIOS/oeaBr+WIhuWPke+8jOmAmuefpeaJgOacieiuoumYheiAhVxyXG5cdCAqIGZpbHRlcuaJp+ihjOi/lOWbnnRydWXvvIzliJnmiafooYxjYWxsXHJcblx0ICovXHJcblx0ZGVsaXZlcigpe1xyXG5cdFx0dGhpcy5yd2NvbnRyb2xsZGVyLnJlYWQoZnVuY3Rpb24oZGF0YSl7XHJcblx0XHRcdCQuZWFjaCh0aGlzLnN1YnNjcmliZXJzLGZ1bmN0aW9uKGluZGV4LGl0ZW0pe1xyXG5cdFx0XHRcdGlmKGl0ZW0uZmlsdGVyKCkgPT0gdHJ1ZSl7XHJcblx0XHQgICAgICAgIFx0aXRlbS5jYWxsLmFwcGx5KHdpbmRvdyxkYXRhLmFyZ3MpO1xyXG5cdFx0ICAgICAgXHR9XHJcblx0XHRcdH0pO1xyXG5cdFx0fS5iaW5kKHRoaXMse2FyZ3M6IGFyZ3VtZW50c30pKTtcclxuXHR9XHJcblx0LyoqXHJcblx0ICog6K6i6ZiFXHJcbiBcdCAqIEBwYXJhbSB7SlNPTn0gKnN1YnNjcmliZXIg6K6i6ZiF6ICF44CC5qC85byP5ZCMc3Vic2NyaWJlcnPph4znmoTljZXni6zkuIDpoblcclxuIFx0ICoge1xyXG4gXHQgKiBcdFx0KmNhbGw6IGZ1bmN0aW9uKCl7fSAvL+S/oeaBr+WIhuWPkeeahOWbnuiwg+WHveaVsFxyXG4gXHQgKiAgICAgIGZpbHRlcjogZnVuY3Rpb24oKXtyZXR1cm4gdHJ1ZTt9IC8v6L+H5ruk5p2h5Lu2XHJcbiBcdCAqIH1cclxuXHQgKi9cclxuXHRzdWJzY3JpYmUoc3Vic2NyaWJlcil7XHJcblx0XHRpZih0aGlzLmFyZ3NWYWxpZGF0ZShzdWJzY3JpYmVyKSl7XHJcblx0XHRcdGlmKCFUb29sLmlzRnVuY3Rpb24oc3Vic2NyaWJlci5maWx0ZXIpKXtcclxuXHRcdCAgICAgICAgc3Vic2NyaWJlci5maWx0ZXIgPSBmdW5jdGlvbigpe1xyXG5cdFx0ICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcblx0XHQgICAgICAgIH07XHJcblx0XHQgICAgfVxyXG5cdFx0XHRpZigkLmluQXJyYXkoc3Vic2NyaWJlcix0aGlzLnN1YnNjcmliZXJzKSA8IDApe1xyXG5cdFx0XHRcdHRoaXMucndjb250cm9sbGRlci53cml0ZShmdW5jdGlvbihjdXJzdWIpe1xyXG5cdFx0XHRcdFx0dGhpcy5zdWJzY3JpYmVycy5wdXNoKGN1cnN1Yik7XHJcblx0XHRcdFx0fS5iaW5kKHRoaXMsc3Vic2NyaWJlcikpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIOWPlua2iOiuoumYhVxyXG4gXHQgKiBAcGFyYW0ge0pTT059IHN1YnNjcmliZXIg6K6i6ZiF6ICFXHJcblx0ICovXHJcblx0dW5zdWJzY3JpYmUoc3Vic2NyaWJlcil7XHJcblx0XHRpZih0aGlzLmFyZ3NWYWxpZGF0ZShzdWJzY3JpYmVyKSl7XHJcblx0XHRcdHRoaXMucndjb250cm9sbGRlci53cml0ZShmdW5jdGlvbihjdXJzdWIpe1xyXG5cdFx0XHRcdCQuZWFjaCh0aGlzLnN1YnNjcmliZXJzLChpbmRleCxpdGVtKSA9PiB7XHJcblx0XHRcdFx0XHRpZihpdGVtID09IGN1cnN1Yil7XHJcblx0XHRcdFx0XHQgICAgdGhpcy5zdWJzY3JpYmVycy5zcGxpY2UoaW5kZXgsMSk7XHJcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fS5iaW5kKHRoaXMsc3Vic2NyaWJlcikpO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQdWJsaXNoZXJTO1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlld1xyXG4gKiAgIOe7meaMh+WumuWFg+e0oOWIm+W7unJlc2l6ZeS6i+S7tuebkeWQrOexu1xyXG4gKiBAYXV0aG9yIG1pbmdydWl8IG1pbmdydWlAc3RhZmYuc2luYS5jb20uY25cclxuICogQHZlcnNpb24gMS4wIHwgMjAxNS0wOC0yN1xyXG4gKiBAcmV0dXJuIHJlc2l6Zeexu1xyXG4gKiBAZXhhbXBsZVxyXG4gKiAgXHRjb25zdCBSZXNpemUgPSByZXF1aXJlKCdsaWJ1dGlsLXJlc2l6ZScpO1xyXG4gKiBcdFx0dmFyIHJlc2l6ZSA9IG5ldyBSZXNpemUoJCh3aW5kb3cpKTtcclxuICogXHRcdHJlc2l6ZS5saXN0ZW4oe2NhbGw6ZnVuY3Rpb24oKXtjb25zb2xlLmxvZygn56qX5Y+jcmVzaXplJyk7fX0pO1xyXG4gKi9cclxuXHJcbmNvbnN0IERlbGF5ZXZ0ID0gcmVxdWlyZSgnLi9kZWxheWV2dC5qcycpO1xyXG5cclxuY2xhc3MgUmVzaXple1xyXG5cdC8qKlxyXG5cdCAqIEBwYXJhbSB7RWxlbWVudH0gKm5vZGUg5YWD57Sg6IqC54K5XHJcblx0ICogQHBhcmFtIHtKU09OfSBjb25maWcg5bu26L+f6YWN572u44CC5ZCMZXZ0L2RlbGF5ZXZ057G755qE5Yid5aeL5YyW5Y+C5pWwXHJcblx0ICovXHJcblx0Y29uc3RydWN0b3Iobm9kZSxjb25maWcpe1xyXG5cdFx0aWYobm9kZS5sZW5ndGggPT0gMCl7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdHZhciBvcHQgPSAkLmV4dGVuZCh7XHJcblx0XHQgICAgZXZ0bmFtZTogJ3Jlc2l6ZSdcclxuXHRcdH0sY29uZmlnKTtcclxuXHRcdHRoaXMuZGVsYXkgPSBuZXcgRGVsYXlldnQob3B0KTtcclxuXHRcdG5vZGUub24ob3B0LmV2dG5hbWUsKCkgPT4ge1xyXG5cdFx0XHR0aGlzLmRlbGF5LnN0YXJ0KCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0LyoqXHJcblx0ICog5re75Yqgc2Nyb2xs5LqL5Lu255uR5ZCsXHJcbiAgICAgKiBAcGFyYW0ge0pTT059IG9wdFxyXG4gICAgICoge1xyXG4gICAgICogICBjYWxsOiBmdW5jdGlvbi8v5LqL5Lu25Y+R55Sf5pe26Kem5Y+R55qE5Zue6LCDXHJcblx0ICogICBmaWx0ZXI6IGZ1bmN0aW9uIC8v6L+H5ruk5p2h5Lu244CCZmlsdGVy6L+U5Zue5Li6dHJ1ZeWImeaJjeinpuWPkWNhbGzjgILkuI3loavmraTpobnliJnpu5jorqTkuI3ov4fmu6RcclxuXHQgKiB9XHJcbiAgICAgKi9cclxuXHRsaXN0ZW4ob3B0KXtcclxuXHRcdHRoaXMuZGVsYXkuc3Vic2NyaWJlKG9wdCk7XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIOenu+mZpOebkeWQrFxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdCDlkozosIPnlKhsaXN0ZW7ml7bkuIDmoLfnmoTlj4LmlbDlvJXnlKhcclxuXHQgKi9cclxuXHR1bmxpc3RlbihvcHQpe1xyXG5cdFx0dGhpcy5kZWxheS51bnN1YnNjcmliZShvcHQpO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSZXNpemU7XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IOivu+WGmeaOp+WItuWZqOKAlOKAlOWvueS6juivu+WGmeW8guatpeaTjeS9nOi/m+ihjOaOp+WItlxyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE1LTA5LTA3IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm4g6K+75YaZ5o6n5Yi25Zmo57G7XHJcbiAqIEBleGFtcGxlXHJcbiAqICovXHJcbiBjb25zdCBUb29sID0gcmVxdWlyZSgnLi90b29sLmpzJyk7XHJcblxyXG4gY2xhc3MgUndjb250cm9sbGVyIHtcclxuXHQgY29uc3RydWN0b3IoKXtcclxuXHRcdCB0aGlzLnJlYWRsb2NrID0gZmFsc2U7IC8v6K+76ZSBXHJcbiBcdFx0dGhpcy53cml0ZWxvY2sgPSBmYWxzZTsgLy/lhpnplIFcclxuIFx0XHR0aGlzLnF1ZXVlID0gW107IC8v6K+75YaZ5pON5L2c57yT5a2Y6Zif5YiXXHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOiOt+WPluW9k+WJjeaYr+WQpuWPr+S7peaJp+ihjOivu+aTjeS9nFxyXG4gXHQgKi9cclxuXHQgcmVhZGVuYWJsZSgpe1xyXG5cdFx0aWYodGhpcy53cml0ZWxvY2spe1xyXG4gXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG4gXHRcdH1cclxuIFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHQgfVxyXG5cdCAvKipcclxuIFx0ICog6I635Y+W5b2T5YmN5piv5ZCm5Y+v5Lul5omn6KGM5YaZ5pON5L2cXHJcbiBcdCAqL1xyXG5cdCB3cml0ZWVuYWJsZSgpe1xyXG5cdFx0aWYodGhpcy53cml0ZWxvY2sgfHwgdGhpcy5yZWFkbG9jayl7XHJcbiBcdFx0XHRyZXR1cm4gZmFsc2U7XHJcbiBcdFx0fVxyXG4gXHRcdHJldHVybiB0cnVlO1xyXG5cdCB9XHJcblx0IC8qKlxyXG4gXHQgKiDmiafooYzor7vlhpnmk43kvZzpmJ/liJdcclxuIFx0ICovXHJcbiBcdCBleGVjcXVldWUoKXtcclxuXHRcdCB3aGlsZSh0aGlzLnF1ZXVlLmxlbmd0aCA+IDApe1xyXG4gXHRcdFx0dmFyIG9iaiA9IHRoaXMucXVldWUuc2hpZnQoKTtcclxuIFx0XHRcdGlmKG9iai50eXBlID09ICdyZWFkJyl7XHJcbiBcdFx0XHRcdHRoaXMuX2V4ZWNyZWFkKG9iai5mdW4pO1xyXG4gXHRcdFx0fWVsc2UgaWYob2JqLnR5cGUgPT0gJ3dyaXRlJyl7XHJcbiBcdFx0XHRcdHRoaXMuX2V4ZWN3cml0ZShvYmouZnVuKTtcclxuIFx0XHRcdH1cclxuIFx0XHR9XHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOengeacieKAlOKAlOaJp+ihjOivu+aTjeS9nFxyXG4gXHQgKi9cclxuXHQgX2V4ZWNyZWFkKGZ1bil7XHJcblx0XHR0aGlzLnJlYWRsb2NrID0gdHJ1ZTtcclxuIFx0XHRmdW4oKTtcclxuIFx0XHR0aGlzLnJlYWRsb2NrID0gZmFsc2U7XHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOengeacieKAlOKAlOaJp+ihjOWGmeaTjeS9nFxyXG4gXHQgKi9cclxuXHQgX2V4ZWN3cml0ZShmdW4pe1xyXG5cdFx0dGhpcy53cml0ZWxvY2sgPSB0cnVlO1xyXG4gXHRcdGZ1bigpO1xyXG4gXHRcdHRoaXMud3JpdGVsb2NrID0gZmFsc2U7XHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOW8gOWni+ivu1xyXG4gICAgICAqIEBwYXJhbSB7RnVuY3Rpb259ICpmdW4g6K+75pON5L2c5Zue6LCD5Ye95pWwXHJcbiBcdCAqL1xyXG5cdCByZWFkKGZ1bil7XHJcblx0XHQgaWYoVG9vbC5pc0Z1bmN0aW9uKGZ1bikpe1xyXG4gXHRcdFx0aWYodGhpcy5yZWFkZW5hYmxlKCkpe1xyXG4gXHRcdFx0XHR0aGlzLl9leGVjcmVhZChmdW4pO1xyXG4gXHRcdFx0XHR0aGlzLmV4ZWNxdWV1ZSgpO1xyXG4gXHRcdFx0fWVsc2V7XHJcbiBcdFx0XHRcdHRoaXMucXVldWUucHVzaCh7XHJcbiBcdFx0XHRcdFx0dHlwZTogJ3JlYWQnLFxyXG4gXHRcdFx0XHRcdGZ1bjogZnVuXHJcbiBcdFx0XHRcdH0pO1xyXG4gXHRcdFx0fVxyXG4gXHRcdH1cclxuXHQgfVxyXG5cdCAvKipcclxuIFx0ICog5byA5aeL5YaZXHJcbiAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gKmZ1biDlhpnmk43kvZzlm57osIPlh73mlbBcclxuIFx0ICovXHJcblx0IHdyaXRlKGZ1bil7XHJcblx0XHQgaWYoVG9vbC5pc0Z1bmN0aW9uKGZ1bikpe1xyXG4gXHRcdFx0aWYodGhpcy53cml0ZWVuYWJsZSgpKXtcclxuIFx0XHRcdFx0dGhpcy5fZXhlY3dyaXRlKGZ1bik7XHJcbiBcdFx0XHRcdHRoaXMuZXhlY3F1ZXVlKCk7XHJcbiBcdFx0XHR9ZWxzZXtcclxuIFx0XHRcdFx0dGhpcy5xdWV1ZS5wdXNoKHtcclxuIFx0XHRcdFx0XHR0eXBlOiAnd3JpdGUnLFxyXG4gXHRcdFx0XHRcdGZ1bjogZnVuXHJcbiBcdFx0XHRcdH0pO1xyXG4gXHRcdFx0fVxyXG4gXHRcdH1cclxuXHQgfVxyXG4gfVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSd2NvbnRyb2xsZXI7XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3XHJcbiAqICAg57uZ5oyH5a6a5YWD57Sg5Yib5bu6c2Nyb2xs5LqL5Lu255uR5ZCs57G7XHJcbiAqIEBhdXRob3IgbWluZ3J1aXwgbWluZ3J1aUBzdGFmZi5zaW5hLmNvbS5jblxyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE1LTA4LTI3XHJcbiAqIEByZXR1cm4gc2Nyb2xs57G7XHJcbiAqIEBleGFtcGxlXHJcbiAqIFx0XHRjb25zdCBTY3JvbGwgPSByZXF1aXJlKCdsaWJ1dGlsLXNjcm9sbCcpO1xyXG4gKlxyXG4gKiBcdFx0dmFyIHNjcm9sbCA9IG5ldyBTY3JvbGwoJCh3aW5kb3cpKTtcclxuICogXHRcdHNjcm9sbC5saXN0ZW4oe2NhbGw6ZnVuY3Rpb24oKXtjb25zb2xlLmxvZygn56qX5Y+jc2Nyb2xsJyk7fX0pO1xyXG4gKlxyXG4gKi9cclxuXHJcbmNvbnN0IERlbGF5ZXZ0ID0gcmVxdWlyZSgnLi9kZWxheWV2dC5qcycpO1xyXG5cclxuY2xhc3MgU2Nyb2xse1xyXG5cdC8qKlxyXG5cdCAqIEBwYXJhbSB7RWxlbWVudH0gKm5vZGUg5YWD57Sg6IqC54K5XHJcblx0ICogQHBhcmFtIHtKU09OfSBjb25maWcg5bu26L+f6YWN572u44CC5ZCMbGliZXZ0L2RlbGF5ZXZ057G755qE5Yid5aeL5YyW5Y+C5pWwXHJcblx0ICovXHJcblx0Y29uc3RydWN0b3Iobm9kZSxjb25maWcpe1xyXG5cdFx0aWYobm9kZS5sZW5ndGggPT0gMCl7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdHRoaXMuZGVsYXkgPSBuZXcgRGVsYXlldnQoY29uZmlnKTtcclxuXHRcdG5vZGUub24oJ3Njcm9sbCcsKCkgPT4ge1xyXG5cdFx0XHR0aGlzLmRlbGF5LnN0YXJ0KCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0LyoqXHJcblx0ICog5re75Yqgc2Nyb2xs5LqL5Lu255uR5ZCsXHJcbiAgICAgKiBAcGFyYW0ge0pTT059IG9wdFxyXG4gICAgICoge1xyXG4gICAgICogICBjYWxsOiBmdW5jdGlvbi8v5LqL5Lu25Y+R55Sf5pe26Kem5Y+R55qE5Zue6LCDXHJcblx0ICogICBmaWx0ZXI6IGZ1bmN0aW9uIC8v6L+H5ruk5p2h5Lu244CCZmlsdGVy6L+U5Zue5Li6dHJ1ZeWImeaJjeinpuWPkWNhbGzjgILkuI3loavmraTpobnliJnpu5jorqTkuI3ov4fmu6RcclxuXHQgKiB9XHJcbiAgICAgKi9cclxuICAgIGxpc3RlbihvcHQpe1xyXG5cdFx0dGhpcy5kZWxheS5zdWJzY3JpYmUob3B0KTtcclxuXHR9XHJcblx0LyoqXHJcblx0ICog56e76Zmk55uR5ZCsXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0IOWSjOiwg+eUqGxpc3RlbuaXtuS4gOagt+eahOWPguaVsOW8leeUqFxyXG5cdCAqL1xyXG5cdHVubGlzdGVuKG9wdCl7XHJcblx0XHR0aGlzLmRlbGF5LnVuc3Vic2NyaWJlKG9wdCk7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNjcm9sbDtcclxuIiwiLyoqXHJcbiAqIOW4uOeUqOWwj+W3peWFt1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIHZhciBUb29sID0gcmVxdWlyZSgnbGlidXRpbC10b29sJyk7XHJcbiAqL1xyXG5jb25zdCBVcmwgPSByZXF1aXJlKCd1cmwnKTtcclxuXHJcbi8qKlxyXG4gKiBkYXRh5piv5ZCm5piv5peg5pWI5a2X5q6144CC5Y2z5pivbnVsbHx1bmRlZmluZWR8JydcclxuKiBAcGFyYW0ge09iamVjdH0gZGF0YVxyXG4gKi9cclxuZXhwb3J0cy5pc0ludmFsaWQgPSBmdW5jdGlvbihkYXRhKXtcclxuXHRpZihkYXRhID09IG51bGwgfHwgZGF0YSA9PSAnJyl7XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcblx0cmV0dXJuIGZhbHNlO1xyXG59LFxyXG4vKipcclxuICog5piv5ZCm5pivT2JqZWN05a+56LGh55qE5a6e5L6L77yM6YCa5bi455So5p2l5qOA5rWLZGF0YeaYr+WQpuaYr+S4gOS4que6r+eahEpTT07lrZfmrrXmiJZuZXcgT2JqZWN0KClcclxuKiBAcGFyYW0ge09iamVjdH0gZGF0YVxyXG4gKi9cclxuZXhwb3J0cy5pc09iamVjdCA9IGZ1bmN0aW9uKGRhdGEpe1xyXG5cdHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZGF0YSkgPT0gJ1tvYmplY3QgT2JqZWN0XScgJiYgZGF0YS5jb25zdHJ1Y3RvciA9PSBPYmplY3Q7XHJcbn0sXHJcbi8qKlxyXG4gKiDmlbDmja7nsbvlnovmmK/lkKbmmK9vYmplY3TjgILkuI3ku4Xku4XpmZDkuo7mmK/nuq/nmoRPYmplY3Tlrp7kvovljJbnmoTlr7nosaFcclxuICovXHJcbmV4cG9ydHMuaXNPYmplY3RUeXBlID0gZnVuY3Rpb24oZGF0YSl7XHJcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGRhdGEpID09ICdbb2JqZWN0IE9iamVjdF0nO1xyXG59LFxyXG4vKipcclxuICog5piv5ZCm5pivZnVuY3Rpb25cclxuKiBAcGFyYW0ge09iamVjdH0gZGF0YVxyXG4gKi9cclxuZXhwb3J0cy5pc0Z1bmN0aW9uID0gZnVuY3Rpb24oZGF0YSl7XHJcblx0cmV0dXJuIHR5cGVvZiBkYXRhID09ICdmdW5jdGlvbic7XHJcbn0sXHJcbi8qKlxyXG4gKiDmmK/lkKbmmK9BcnJheVxyXG4qIEBwYXJhbSB7T2JqZWN0fSBkYXRhXHJcbiAqL1xyXG5leHBvcnRzLmlzQXJyYXkgPSBmdW5jdGlvbihkYXRhKXtcclxuXHRyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGRhdGEpID09ICdbb2JqZWN0IEFycmF5XSc7XHJcbn0sXHJcbi8qKlxyXG4gKiDmmK/lkKbmmK9ib29sZWFuXHJcbiogQHBhcmFtIHtPYmplY3R9IGRhdGFcclxuICovXHJcbmV4cG9ydHMuaXNCb29sZWFuID0gZnVuY3Rpb24oZGF0YSl7XHJcblx0cmV0dXJuIHR5cGVvZiBkYXRhID09ICdib29sZWFuJztcclxufSxcclxuLyoqXHJcbiAqIOaYr+WQpuaYr1N0cmluZ1xyXG4qIEBwYXJhbSB7T2JqZWN0fSBkYXRhXHJcbiAqL1xyXG5leHBvcnRzLmlzU3RyaW5nID0gZnVuY3Rpb24oZGF0YSl7XHJcblx0cmV0dXJuIHR5cGVvZiBkYXRhID09ICdzdHJpbmcnO1xyXG59LFxyXG4vKipcclxuICog5piv5ZCm5pivTnVtYmVyXHJcbiogQHBhcmFtIHtPYmplY3R9IGRhdGFcclxuICovXHJcbmV4cG9ydHMuaXNOdW1iZXIgPSBmdW5jdGlvbihkYXRhKXtcclxuXHRyZXR1cm4gdHlwZW9mIGRhdGEgPT0gJ251bWJlcic7XHJcbn0sXHJcbi8qKlxyXG4gKiDmmK/lkKbmmK/kuIDkuKrmnInmlYjnmoRqcXVlcnkgZG9t5a+56LGhXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBub2RlXHJcbiAqL1xyXG5leHBvcnRzLmlzVmFsaWRKcXVlcnlEb20gPSBmdW5jdGlvbihub2RlKXtcclxuXHRyZXR1cm4gbm9kZSAhPSBudWxsICYmIHRoaXMuaXNGdW5jdGlvbihub2RlLnNpemUpICYmIG5vZGUubGVuZ3RoID4gMDtcclxufVxyXG5cclxuLyoqXHJcbiAqIOino+aekHVybFxyXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsIHVybOWcsOWdgO+8jOS4jeWhq+WImeWPlmxvY2F0aW9uLmhyZWZcclxuICogQHJldHVybiB7T2JqZWN0fSB1cmxPYmplY3QgaHR0cHM6Ly9ub2RlanMub3JnL2Rpc3QvbGF0ZXN0LXY2LngvZG9jcy9hcGkvdXJsLmh0bWwjdXJsX3VybF9zdHJpbmdzX2FuZF91cmxfb2JqZWN0c1xyXG4gKiAgcXVlcnk6IOWmguaenOayoeaciXF1ZXJ577yM5YiZ5pive31cclxuICovXHJcbmV4cG9ydHMudXJscGFyc2UgPSBmdW5jdGlvbih1cmwpe1xyXG5cdHVybCA9IHVybCB8fCBsb2NhdGlvbi5ocmVmO1xyXG5cclxuXHRyZXR1cm4gVXJsLnBhcnNlKHVybCx0cnVlKTtcclxufVxyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlld1xyXG4gKiAgIOebkeWQrHdpbmRvdyByZXNpemXjgILlj6rmlK/mjIFQQ1xyXG4gKiBAYXV0aG9yIG1pbmdydWl8IG1pbmdydWlAc3RhZmYuc2luYS5jb20uY25cclxuICogQHZlcnNpb24gMS4wIHwgMjAxNS0wOC0yN1xyXG4gKiBAZXhhbXBsZVxyXG4gKiBcdFx0Y29uc3QgV2lucmVzaXplID0gcmVxdWlyZSgnbGlidXRpbC13aW5yZXNpemUnKTtcclxuICpcclxuICogXHRcdFdpbnJlc2l6ZS5saXN0ZW4oe2NhbGw6ZnVuY3Rpb24oKXtjb25zb2xlLmxvZygn56qX5Y+jcmVzaXplJyk7fX0pO1xyXG4gKi9cclxuY29uc3QgUmVzaXplID0gcmVxdWlyZSgnLi9yZXNpemUuanMnKSxcclxuXHRcdERldmljZWV2dG5hbWUgPSByZXF1aXJlKCcuL2RldmljZWV2dG5hbWUuanMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbmV3IFJlc2l6ZSgkKHdpbmRvdykse1xyXG5cdGV2dG5hbWU6IERldmljZWV2dG5hbWUrJy5saWInXHJcbn0pO1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlld1xyXG4gKiAgIOeql+WPo+a7muWKqOS6i+S7tuebkeWQrFxyXG4gKiBAYXV0aG9yIG1pbmdydWl8IG1pbmdydWlAc3RhZmYuc2luYS5jb20uY25cclxuICogQHZlcnNpb24gMS4wIHwgMjAxNS0wOC0yN1xyXG4gKiBAcmV0dXJuIOa7muWKqOebkeWQrOWvueixoVxyXG4gKiBAZXhhbXBsZVxyXG4gKiBcdFx0Y29uc3QgV2luc2Nyb2xsID0gcmVxdWlyZSgnbGlidXRpbC13aW5zY3JvbGwnKTtcclxuICpcclxuICogXHRcdFdpbnNjcm9sbC5saXN0ZW4oe2NhbGw6ZnVuY3Rpb24oKXtjb25zb2xlLmxvZygn56qX5Y+jc2Nyb2xsJyk7fX0pO1xyXG4gKi9cclxuXHJcbmNvbnN0IFNjcm9sbCA9IHJlcXVpcmUoJy4vc2Nyb2xsLmpzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBTY3JvbGwoJCh3aW5kb3cpKTtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcg57q/56iL5rGg5o6n5Yi25ZmoXHJcbiAqICAgICAg6LSf6LSj6L+U5Zue5b2T5YmN56m66Zey55qE57q/56iL5a+56LGhXHJcbiAqIEB2ZXJzaW9uIDEuMCB8IDIwMTctMDEtMTkg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQHJldHVyblxyXG4gKiBAZXhhbXBsZVxyXG4gKiAgICAgIGNvbnN0IFdvcmtlckNvbnRyb2wgPSByZXF1aXJlKCdsaWJ1dGlsLXdvcmtlckNvbnRyb2wnKTtcclxuICogKi9cclxuXHJcbiBjbGFzcyBXb3JrZXJ7XHJcbiAgICAgLyoqXHJcbiAgICAgICog5LiA5Liq57q/56iLXHJcbiAgICAgICovXHJcbiAgICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICAgdGhpcy5sb2NrID0gdHJ1ZTtcclxuICAgICB9XHJcbiB9XHJcblxyXG4gY2xhc3MgV29ya2VyQ29udHJvbCB7XHJcbiAgICAgLyoqXHJcbiAgICAgICog57q/56iL5rGg5o6n5Yi25Zmo57G7XHJcbiAgICAgICogQHJldHVybiB7W3R5cGVdfSBbZGVzY3JpcHRpb25dXHJcbiAgICAgICovXHJcbiAgICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICAgdGhpcy5fd29ya2Vyb2JqcyA9IFtdOyAvL3dvcmtlckNvbnRyb2zlr7nosaFcclxuICAgICB9XHJcbiAgICAgLyoqXHJcbiAgICAgICog6L+U5Zue5b2T5YmN56m66Zey55qEd29ya2VyQ29udHJvbOWvueixoVxyXG4gICAgICAqIEByZXR1cm4ge1t0eXBlXX0gW2Rlc2NyaXB0aW9uXVxyXG4gICAgICAqL1xyXG4gICAgIGdldCgpe1xyXG4gICAgICAgICB2YXIgY3Vyd29ya2VyID0gbnVsbDtcclxuICAgICAgICAgZm9yKHZhciBpID0gMCwgbGVuID0gdGhpcy5fd29ya2Vyb2Jqcy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XHJcbiAgICAgICAgICAgICBpZih0aGlzLl93b3JrZXJvYmpzW2ldLmxvY2sgPT0gZmFsc2UpeyAvL+aXouaXoOivt+axguWPiOayoeacieiiq+mUgeWumlxyXG4gICAgICAgICAgICAgICAgIHRoaXMuX3dvcmtlcm9ianNbaV0ubG9jayA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgY3Vyd29ya2VyID0gdGhpcy5fd29ya2Vyb2Jqc1tpXTtcclxuICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgIH1cclxuICAgICAgICAgfVxyXG4gICAgICAgICBpZihjdXJ3b3JrZXIgPT0gbnVsbCl7XHJcbiAgICAgICAgICAgICBjdXJ3b3JrZXIgPSBuZXcgV29ya2VyKCk7XHJcbiAgICAgICAgICAgICB0aGlzLl93b3JrZXJvYmpzLnB1c2goY3Vyd29ya2VyKTtcclxuICAgICAgICAgfVxyXG4gICAgICAgICByZXR1cm4gY3Vyd29ya2VyO1xyXG4gICAgIH1cclxuICAgICAvKipcclxuICAgICAgKiDpgJrnn6XlvZPliY13b3JrZXJDb250cm9s5a+56LGh5bey57uP5L2/55So5a6M5q+VXHJcbiAgICAgICogQHBhcmFtIHtpbnN0YW5jZSBvZiB3b3JrZXJDb250cm9sfSB3b3JrZXIg5aaC5p6c5o+Q5L6b5LqGd29ya2Vy77yM5YiZ57uT5p2f5q2k57q/56iL77yb5aaC5p6c5rKh5o+Q5L6b77yM5YiZ57uT5p2f56ys5LiA5Liq5q2j5Zyo5L2/55So55qE57q/56iLXHJcbiAgICAgICogQHJldHVybiB7aW5zdGFuY2Ugb2Ygd29ya2VyQ29udHJvbCB8IG51bGx9IOW9k+WJjee7k+adn+eahOe6v+eoi+WvueixoS7msqHmnInliJnkuLpudWxsXHJcbiAgICAgICovXHJcbiAgICAgZW5kKHdvcmtlcil7XHJcbiAgICAgICAgIHZhciBjdXJ3b3JrZXIgPSBudWxsO1xyXG4gICAgICAgICBmb3IodmFyIGkgPSAwLCBsZW4gPSB0aGlzLl93b3JrZXJvYmpzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcclxuICAgICAgICAgICAgIGlmKHdvcmtlcil7XHJcbiAgICAgICAgICAgICAgICAgaWYodGhpcy5fd29ya2Vyb2Jqc1tpXSA9PSB3b3JrZXIpeyAvL+aXouaXoOivt+axguWPiOayoeacieiiq+mUgeWumlxyXG4gICAgICAgICAgICAgICAgICAgICB0aGlzLl93b3JrZXJvYmpzW2ldLmxvY2sgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgY3Vyd29ya2VyID0gdGhpcy5fd29ya2Vyb2Jqc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgaWYodGhpcy5fd29ya2Vyb2Jqc1tpXS5sb2NrID09IHRydWUpe1xyXG4gICAgICAgICAgICAgICAgICAgICB0aGlzLl93b3JrZXJvYmpzW2ldLmxvY2sgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgY3Vyd29ya2VyID0gdGhpcy5fd29ya2Vyb2Jqc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgfVxyXG4gICAgICAgICB9XHJcbiAgICAgICAgIHJldHVybiBjdXJ3b3JrZXI7XHJcbiAgICAgfVxyXG4gICAgIC8qKlxyXG4gICAgICAqIOaYr+WQpuaJgOacieeahOe6v+eoi+mDveiiq+S9v+eUqOWujOavlVxyXG4gICAgICAqIEByZXR1cm4ge0Jvb2xlYW59IHRydWXvvJrmiYDmnInnur/nqIvpg73nqbrpl7JcclxuICAgICAgKi9cclxuICAgICBpc2VuZCgpe1xyXG4gICAgICAgICB2YXIgcmVzdWx0ID0gdHJ1ZTtcclxuICAgICAgICAgZm9yKHZhciBpID0gMCwgbGVuID0gdGhpcy5fd29ya2Vyb2Jqcy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XHJcbiAgICAgICAgICAgICBpZih0aGlzLl93b3JrZXJvYmpzW2ldLmxvY2sgPT0gdHJ1ZSl7IC8v5pei5peg6K+35rGC5Y+I5rKh5pyJ6KKr6ZSB5a6aXHJcbiAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICB9XHJcbiAgICAgICAgIH1cclxuICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICB9XHJcbiB9XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFdvcmtlckNvbnRyb2w7XHJcbiIsIi8qISBodHRwczovL210aHMuYmUvcHVueWNvZGUgdjEuNC4xIGJ5IEBtYXRoaWFzICovXG47KGZ1bmN0aW9uKHJvb3QpIHtcblxuXHQvKiogRGV0ZWN0IGZyZWUgdmFyaWFibGVzICovXG5cdHZhciBmcmVlRXhwb3J0cyA9IHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHMgJiZcblx0XHQhZXhwb3J0cy5ub2RlVHlwZSAmJiBleHBvcnRzO1xuXHR2YXIgZnJlZU1vZHVsZSA9IHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlICYmXG5cdFx0IW1vZHVsZS5ub2RlVHlwZSAmJiBtb2R1bGU7XG5cdHZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWw7XG5cdGlmIChcblx0XHRmcmVlR2xvYmFsLmdsb2JhbCA9PT0gZnJlZUdsb2JhbCB8fFxuXHRcdGZyZWVHbG9iYWwud2luZG93ID09PSBmcmVlR2xvYmFsIHx8XG5cdFx0ZnJlZUdsb2JhbC5zZWxmID09PSBmcmVlR2xvYmFsXG5cdCkge1xuXHRcdHJvb3QgPSBmcmVlR2xvYmFsO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBgcHVueWNvZGVgIG9iamVjdC5cblx0ICogQG5hbWUgcHVueWNvZGVcblx0ICogQHR5cGUgT2JqZWN0XG5cdCAqL1xuXHR2YXIgcHVueWNvZGUsXG5cblx0LyoqIEhpZ2hlc3QgcG9zaXRpdmUgc2lnbmVkIDMyLWJpdCBmbG9hdCB2YWx1ZSAqL1xuXHRtYXhJbnQgPSAyMTQ3NDgzNjQ3LCAvLyBha2EuIDB4N0ZGRkZGRkYgb3IgMl4zMS0xXG5cblx0LyoqIEJvb3RzdHJpbmcgcGFyYW1ldGVycyAqL1xuXHRiYXNlID0gMzYsXG5cdHRNaW4gPSAxLFxuXHR0TWF4ID0gMjYsXG5cdHNrZXcgPSAzOCxcblx0ZGFtcCA9IDcwMCxcblx0aW5pdGlhbEJpYXMgPSA3Mixcblx0aW5pdGlhbE4gPSAxMjgsIC8vIDB4ODBcblx0ZGVsaW1pdGVyID0gJy0nLCAvLyAnXFx4MkQnXG5cblx0LyoqIFJlZ3VsYXIgZXhwcmVzc2lvbnMgKi9cblx0cmVnZXhQdW55Y29kZSA9IC9eeG4tLS8sXG5cdHJlZ2V4Tm9uQVNDSUkgPSAvW15cXHgyMC1cXHg3RV0vLCAvLyB1bnByaW50YWJsZSBBU0NJSSBjaGFycyArIG5vbi1BU0NJSSBjaGFyc1xuXHRyZWdleFNlcGFyYXRvcnMgPSAvW1xceDJFXFx1MzAwMlxcdUZGMEVcXHVGRjYxXS9nLCAvLyBSRkMgMzQ5MCBzZXBhcmF0b3JzXG5cblx0LyoqIEVycm9yIG1lc3NhZ2VzICovXG5cdGVycm9ycyA9IHtcblx0XHQnb3ZlcmZsb3cnOiAnT3ZlcmZsb3c6IGlucHV0IG5lZWRzIHdpZGVyIGludGVnZXJzIHRvIHByb2Nlc3MnLFxuXHRcdCdub3QtYmFzaWMnOiAnSWxsZWdhbCBpbnB1dCA+PSAweDgwIChub3QgYSBiYXNpYyBjb2RlIHBvaW50KScsXG5cdFx0J2ludmFsaWQtaW5wdXQnOiAnSW52YWxpZCBpbnB1dCdcblx0fSxcblxuXHQvKiogQ29udmVuaWVuY2Ugc2hvcnRjdXRzICovXG5cdGJhc2VNaW51c1RNaW4gPSBiYXNlIC0gdE1pbixcblx0Zmxvb3IgPSBNYXRoLmZsb29yLFxuXHRzdHJpbmdGcm9tQ2hhckNvZGUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlLFxuXG5cdC8qKiBUZW1wb3JhcnkgdmFyaWFibGUgKi9cblx0a2V5O1xuXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cdC8qKlxuXHQgKiBBIGdlbmVyaWMgZXJyb3IgdXRpbGl0eSBmdW5jdGlvbi5cblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IHR5cGUgVGhlIGVycm9yIHR5cGUuXG5cdCAqIEByZXR1cm5zIHtFcnJvcn0gVGhyb3dzIGEgYFJhbmdlRXJyb3JgIHdpdGggdGhlIGFwcGxpY2FibGUgZXJyb3IgbWVzc2FnZS5cblx0ICovXG5cdGZ1bmN0aW9uIGVycm9yKHR5cGUpIHtcblx0XHR0aHJvdyBuZXcgUmFuZ2VFcnJvcihlcnJvcnNbdHlwZV0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIEEgZ2VuZXJpYyBgQXJyYXkjbWFwYCB1dGlsaXR5IGZ1bmN0aW9uLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdGhhdCBnZXRzIGNhbGxlZCBmb3IgZXZlcnkgYXJyYXlcblx0ICogaXRlbS5cblx0ICogQHJldHVybnMge0FycmF5fSBBIG5ldyBhcnJheSBvZiB2YWx1ZXMgcmV0dXJuZWQgYnkgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uLlxuXHQgKi9cblx0ZnVuY3Rpb24gbWFwKGFycmF5LCBmbikge1xuXHRcdHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG5cdFx0dmFyIHJlc3VsdCA9IFtdO1xuXHRcdHdoaWxlIChsZW5ndGgtLSkge1xuXHRcdFx0cmVzdWx0W2xlbmd0aF0gPSBmbihhcnJheVtsZW5ndGhdKTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdC8qKlxuXHQgKiBBIHNpbXBsZSBgQXJyYXkjbWFwYC1saWtlIHdyYXBwZXIgdG8gd29yayB3aXRoIGRvbWFpbiBuYW1lIHN0cmluZ3Mgb3IgZW1haWxcblx0ICogYWRkcmVzc2VzLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gZG9tYWluIFRoZSBkb21haW4gbmFtZSBvciBlbWFpbCBhZGRyZXNzLlxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdGhhdCBnZXRzIGNhbGxlZCBmb3IgZXZlcnlcblx0ICogY2hhcmFjdGVyLlxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IEEgbmV3IHN0cmluZyBvZiBjaGFyYWN0ZXJzIHJldHVybmVkIGJ5IHRoZSBjYWxsYmFja1xuXHQgKiBmdW5jdGlvbi5cblx0ICovXG5cdGZ1bmN0aW9uIG1hcERvbWFpbihzdHJpbmcsIGZuKSB7XG5cdFx0dmFyIHBhcnRzID0gc3RyaW5nLnNwbGl0KCdAJyk7XG5cdFx0dmFyIHJlc3VsdCA9ICcnO1xuXHRcdGlmIChwYXJ0cy5sZW5ndGggPiAxKSB7XG5cdFx0XHQvLyBJbiBlbWFpbCBhZGRyZXNzZXMsIG9ubHkgdGhlIGRvbWFpbiBuYW1lIHNob3VsZCBiZSBwdW55Y29kZWQuIExlYXZlXG5cdFx0XHQvLyB0aGUgbG9jYWwgcGFydCAoaS5lLiBldmVyeXRoaW5nIHVwIHRvIGBAYCkgaW50YWN0LlxuXHRcdFx0cmVzdWx0ID0gcGFydHNbMF0gKyAnQCc7XG5cdFx0XHRzdHJpbmcgPSBwYXJ0c1sxXTtcblx0XHR9XG5cdFx0Ly8gQXZvaWQgYHNwbGl0KHJlZ2V4KWAgZm9yIElFOCBjb21wYXRpYmlsaXR5LiBTZWUgIzE3LlxuXHRcdHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKHJlZ2V4U2VwYXJhdG9ycywgJ1xceDJFJyk7XG5cdFx0dmFyIGxhYmVscyA9IHN0cmluZy5zcGxpdCgnLicpO1xuXHRcdHZhciBlbmNvZGVkID0gbWFwKGxhYmVscywgZm4pLmpvaW4oJy4nKTtcblx0XHRyZXR1cm4gcmVzdWx0ICsgZW5jb2RlZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGFuIGFycmF5IGNvbnRhaW5pbmcgdGhlIG51bWVyaWMgY29kZSBwb2ludHMgb2YgZWFjaCBVbmljb2RlXG5cdCAqIGNoYXJhY3RlciBpbiB0aGUgc3RyaW5nLiBXaGlsZSBKYXZhU2NyaXB0IHVzZXMgVUNTLTIgaW50ZXJuYWxseSxcblx0ICogdGhpcyBmdW5jdGlvbiB3aWxsIGNvbnZlcnQgYSBwYWlyIG9mIHN1cnJvZ2F0ZSBoYWx2ZXMgKGVhY2ggb2Ygd2hpY2hcblx0ICogVUNTLTIgZXhwb3NlcyBhcyBzZXBhcmF0ZSBjaGFyYWN0ZXJzKSBpbnRvIGEgc2luZ2xlIGNvZGUgcG9pbnQsXG5cdCAqIG1hdGNoaW5nIFVURi0xNi5cblx0ICogQHNlZSBgcHVueWNvZGUudWNzMi5lbmNvZGVgXG5cdCAqIEBzZWUgPGh0dHBzOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9qYXZhc2NyaXB0LWVuY29kaW5nPlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGUudWNzMlxuXHQgKiBAbmFtZSBkZWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZyBUaGUgVW5pY29kZSBpbnB1dCBzdHJpbmcgKFVDUy0yKS5cblx0ICogQHJldHVybnMge0FycmF5fSBUaGUgbmV3IGFycmF5IG9mIGNvZGUgcG9pbnRzLlxuXHQgKi9cblx0ZnVuY3Rpb24gdWNzMmRlY29kZShzdHJpbmcpIHtcblx0XHR2YXIgb3V0cHV0ID0gW10sXG5cdFx0ICAgIGNvdW50ZXIgPSAwLFxuXHRcdCAgICBsZW5ndGggPSBzdHJpbmcubGVuZ3RoLFxuXHRcdCAgICB2YWx1ZSxcblx0XHQgICAgZXh0cmE7XG5cdFx0d2hpbGUgKGNvdW50ZXIgPCBsZW5ndGgpIHtcblx0XHRcdHZhbHVlID0gc3RyaW5nLmNoYXJDb2RlQXQoY291bnRlcisrKTtcblx0XHRcdGlmICh2YWx1ZSA+PSAweEQ4MDAgJiYgdmFsdWUgPD0gMHhEQkZGICYmIGNvdW50ZXIgPCBsZW5ndGgpIHtcblx0XHRcdFx0Ly8gaGlnaCBzdXJyb2dhdGUsIGFuZCB0aGVyZSBpcyBhIG5leHQgY2hhcmFjdGVyXG5cdFx0XHRcdGV4dHJhID0gc3RyaW5nLmNoYXJDb2RlQXQoY291bnRlcisrKTtcblx0XHRcdFx0aWYgKChleHRyYSAmIDB4RkMwMCkgPT0gMHhEQzAwKSB7IC8vIGxvdyBzdXJyb2dhdGVcblx0XHRcdFx0XHRvdXRwdXQucHVzaCgoKHZhbHVlICYgMHgzRkYpIDw8IDEwKSArIChleHRyYSAmIDB4M0ZGKSArIDB4MTAwMDApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIHVubWF0Y2hlZCBzdXJyb2dhdGU7IG9ubHkgYXBwZW5kIHRoaXMgY29kZSB1bml0LCBpbiBjYXNlIHRoZSBuZXh0XG5cdFx0XHRcdFx0Ly8gY29kZSB1bml0IGlzIHRoZSBoaWdoIHN1cnJvZ2F0ZSBvZiBhIHN1cnJvZ2F0ZSBwYWlyXG5cdFx0XHRcdFx0b3V0cHV0LnB1c2godmFsdWUpO1xuXHRcdFx0XHRcdGNvdW50ZXItLTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b3V0cHV0LnB1c2godmFsdWUpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gb3V0cHV0O1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBzdHJpbmcgYmFzZWQgb24gYW4gYXJyYXkgb2YgbnVtZXJpYyBjb2RlIHBvaW50cy5cblx0ICogQHNlZSBgcHVueWNvZGUudWNzMi5kZWNvZGVgXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZS51Y3MyXG5cdCAqIEBuYW1lIGVuY29kZVxuXHQgKiBAcGFyYW0ge0FycmF5fSBjb2RlUG9pbnRzIFRoZSBhcnJheSBvZiBudW1lcmljIGNvZGUgcG9pbnRzLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgbmV3IFVuaWNvZGUgc3RyaW5nIChVQ1MtMikuXG5cdCAqL1xuXHRmdW5jdGlvbiB1Y3MyZW5jb2RlKGFycmF5KSB7XG5cdFx0cmV0dXJuIG1hcChhcnJheSwgZnVuY3Rpb24odmFsdWUpIHtcblx0XHRcdHZhciBvdXRwdXQgPSAnJztcblx0XHRcdGlmICh2YWx1ZSA+IDB4RkZGRikge1xuXHRcdFx0XHR2YWx1ZSAtPSAweDEwMDAwO1xuXHRcdFx0XHRvdXRwdXQgKz0gc3RyaW5nRnJvbUNoYXJDb2RlKHZhbHVlID4+PiAxMCAmIDB4M0ZGIHwgMHhEODAwKTtcblx0XHRcdFx0dmFsdWUgPSAweERDMDAgfCB2YWx1ZSAmIDB4M0ZGO1xuXHRcdFx0fVxuXHRcdFx0b3V0cHV0ICs9IHN0cmluZ0Zyb21DaGFyQ29kZSh2YWx1ZSk7XG5cdFx0XHRyZXR1cm4gb3V0cHV0O1xuXHRcdH0pLmpvaW4oJycpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgYmFzaWMgY29kZSBwb2ludCBpbnRvIGEgZGlnaXQvaW50ZWdlci5cblx0ICogQHNlZSBgZGlnaXRUb0Jhc2ljKClgXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBjb2RlUG9pbnQgVGhlIGJhc2ljIG51bWVyaWMgY29kZSBwb2ludCB2YWx1ZS5cblx0ICogQHJldHVybnMge051bWJlcn0gVGhlIG51bWVyaWMgdmFsdWUgb2YgYSBiYXNpYyBjb2RlIHBvaW50IChmb3IgdXNlIGluXG5cdCAqIHJlcHJlc2VudGluZyBpbnRlZ2VycykgaW4gdGhlIHJhbmdlIGAwYCB0byBgYmFzZSAtIDFgLCBvciBgYmFzZWAgaWZcblx0ICogdGhlIGNvZGUgcG9pbnQgZG9lcyBub3QgcmVwcmVzZW50IGEgdmFsdWUuXG5cdCAqL1xuXHRmdW5jdGlvbiBiYXNpY1RvRGlnaXQoY29kZVBvaW50KSB7XG5cdFx0aWYgKGNvZGVQb2ludCAtIDQ4IDwgMTApIHtcblx0XHRcdHJldHVybiBjb2RlUG9pbnQgLSAyMjtcblx0XHR9XG5cdFx0aWYgKGNvZGVQb2ludCAtIDY1IDwgMjYpIHtcblx0XHRcdHJldHVybiBjb2RlUG9pbnQgLSA2NTtcblx0XHR9XG5cdFx0aWYgKGNvZGVQb2ludCAtIDk3IDwgMjYpIHtcblx0XHRcdHJldHVybiBjb2RlUG9pbnQgLSA5Nztcblx0XHR9XG5cdFx0cmV0dXJuIGJhc2U7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBkaWdpdC9pbnRlZ2VyIGludG8gYSBiYXNpYyBjb2RlIHBvaW50LlxuXHQgKiBAc2VlIGBiYXNpY1RvRGlnaXQoKWBcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGRpZ2l0IFRoZSBudW1lcmljIHZhbHVlIG9mIGEgYmFzaWMgY29kZSBwb2ludC5cblx0ICogQHJldHVybnMge051bWJlcn0gVGhlIGJhc2ljIGNvZGUgcG9pbnQgd2hvc2UgdmFsdWUgKHdoZW4gdXNlZCBmb3Jcblx0ICogcmVwcmVzZW50aW5nIGludGVnZXJzKSBpcyBgZGlnaXRgLCB3aGljaCBuZWVkcyB0byBiZSBpbiB0aGUgcmFuZ2Vcblx0ICogYDBgIHRvIGBiYXNlIC0gMWAuIElmIGBmbGFnYCBpcyBub24temVybywgdGhlIHVwcGVyY2FzZSBmb3JtIGlzXG5cdCAqIHVzZWQ7IGVsc2UsIHRoZSBsb3dlcmNhc2UgZm9ybSBpcyB1c2VkLiBUaGUgYmVoYXZpb3IgaXMgdW5kZWZpbmVkXG5cdCAqIGlmIGBmbGFnYCBpcyBub24temVybyBhbmQgYGRpZ2l0YCBoYXMgbm8gdXBwZXJjYXNlIGZvcm0uXG5cdCAqL1xuXHRmdW5jdGlvbiBkaWdpdFRvQmFzaWMoZGlnaXQsIGZsYWcpIHtcblx0XHQvLyAgMC4uMjUgbWFwIHRvIEFTQ0lJIGEuLnogb3IgQS4uWlxuXHRcdC8vIDI2Li4zNSBtYXAgdG8gQVNDSUkgMC4uOVxuXHRcdHJldHVybiBkaWdpdCArIDIyICsgNzUgKiAoZGlnaXQgPCAyNikgLSAoKGZsYWcgIT0gMCkgPDwgNSk7XG5cdH1cblxuXHQvKipcblx0ICogQmlhcyBhZGFwdGF0aW9uIGZ1bmN0aW9uIGFzIHBlciBzZWN0aW9uIDMuNCBvZiBSRkMgMzQ5Mi5cblx0ICogaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM0OTIjc2VjdGlvbi0zLjRcblx0ICogQHByaXZhdGVcblx0ICovXG5cdGZ1bmN0aW9uIGFkYXB0KGRlbHRhLCBudW1Qb2ludHMsIGZpcnN0VGltZSkge1xuXHRcdHZhciBrID0gMDtcblx0XHRkZWx0YSA9IGZpcnN0VGltZSA/IGZsb29yKGRlbHRhIC8gZGFtcCkgOiBkZWx0YSA+PiAxO1xuXHRcdGRlbHRhICs9IGZsb29yKGRlbHRhIC8gbnVtUG9pbnRzKTtcblx0XHRmb3IgKC8qIG5vIGluaXRpYWxpemF0aW9uICovOyBkZWx0YSA+IGJhc2VNaW51c1RNaW4gKiB0TWF4ID4+IDE7IGsgKz0gYmFzZSkge1xuXHRcdFx0ZGVsdGEgPSBmbG9vcihkZWx0YSAvIGJhc2VNaW51c1RNaW4pO1xuXHRcdH1cblx0XHRyZXR1cm4gZmxvb3IoayArIChiYXNlTWludXNUTWluICsgMSkgKiBkZWx0YSAvIChkZWx0YSArIHNrZXcpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIFB1bnljb2RlIHN0cmluZyBvZiBBU0NJSS1vbmx5IHN5bWJvbHMgdG8gYSBzdHJpbmcgb2YgVW5pY29kZVxuXHQgKiBzeW1ib2xzLlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGlucHV0IFRoZSBQdW55Y29kZSBzdHJpbmcgb2YgQVNDSUktb25seSBzeW1ib2xzLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgcmVzdWx0aW5nIHN0cmluZyBvZiBVbmljb2RlIHN5bWJvbHMuXG5cdCAqL1xuXHRmdW5jdGlvbiBkZWNvZGUoaW5wdXQpIHtcblx0XHQvLyBEb24ndCB1c2UgVUNTLTJcblx0XHR2YXIgb3V0cHV0ID0gW10sXG5cdFx0ICAgIGlucHV0TGVuZ3RoID0gaW5wdXQubGVuZ3RoLFxuXHRcdCAgICBvdXQsXG5cdFx0ICAgIGkgPSAwLFxuXHRcdCAgICBuID0gaW5pdGlhbE4sXG5cdFx0ICAgIGJpYXMgPSBpbml0aWFsQmlhcyxcblx0XHQgICAgYmFzaWMsXG5cdFx0ICAgIGosXG5cdFx0ICAgIGluZGV4LFxuXHRcdCAgICBvbGRpLFxuXHRcdCAgICB3LFxuXHRcdCAgICBrLFxuXHRcdCAgICBkaWdpdCxcblx0XHQgICAgdCxcblx0XHQgICAgLyoqIENhY2hlZCBjYWxjdWxhdGlvbiByZXN1bHRzICovXG5cdFx0ICAgIGJhc2VNaW51c1Q7XG5cblx0XHQvLyBIYW5kbGUgdGhlIGJhc2ljIGNvZGUgcG9pbnRzOiBsZXQgYGJhc2ljYCBiZSB0aGUgbnVtYmVyIG9mIGlucHV0IGNvZGVcblx0XHQvLyBwb2ludHMgYmVmb3JlIHRoZSBsYXN0IGRlbGltaXRlciwgb3IgYDBgIGlmIHRoZXJlIGlzIG5vbmUsIHRoZW4gY29weVxuXHRcdC8vIHRoZSBmaXJzdCBiYXNpYyBjb2RlIHBvaW50cyB0byB0aGUgb3V0cHV0LlxuXG5cdFx0YmFzaWMgPSBpbnB1dC5sYXN0SW5kZXhPZihkZWxpbWl0ZXIpO1xuXHRcdGlmIChiYXNpYyA8IDApIHtcblx0XHRcdGJhc2ljID0gMDtcblx0XHR9XG5cblx0XHRmb3IgKGogPSAwOyBqIDwgYmFzaWM7ICsraikge1xuXHRcdFx0Ly8gaWYgaXQncyBub3QgYSBiYXNpYyBjb2RlIHBvaW50XG5cdFx0XHRpZiAoaW5wdXQuY2hhckNvZGVBdChqKSA+PSAweDgwKSB7XG5cdFx0XHRcdGVycm9yKCdub3QtYmFzaWMnKTtcblx0XHRcdH1cblx0XHRcdG91dHB1dC5wdXNoKGlucHV0LmNoYXJDb2RlQXQoaikpO1xuXHRcdH1cblxuXHRcdC8vIE1haW4gZGVjb2RpbmcgbG9vcDogc3RhcnQganVzdCBhZnRlciB0aGUgbGFzdCBkZWxpbWl0ZXIgaWYgYW55IGJhc2ljIGNvZGVcblx0XHQvLyBwb2ludHMgd2VyZSBjb3BpZWQ7IHN0YXJ0IGF0IHRoZSBiZWdpbm5pbmcgb3RoZXJ3aXNlLlxuXG5cdFx0Zm9yIChpbmRleCA9IGJhc2ljID4gMCA/IGJhc2ljICsgMSA6IDA7IGluZGV4IDwgaW5wdXRMZW5ndGg7IC8qIG5vIGZpbmFsIGV4cHJlc3Npb24gKi8pIHtcblxuXHRcdFx0Ly8gYGluZGV4YCBpcyB0aGUgaW5kZXggb2YgdGhlIG5leHQgY2hhcmFjdGVyIHRvIGJlIGNvbnN1bWVkLlxuXHRcdFx0Ly8gRGVjb2RlIGEgZ2VuZXJhbGl6ZWQgdmFyaWFibGUtbGVuZ3RoIGludGVnZXIgaW50byBgZGVsdGFgLFxuXHRcdFx0Ly8gd2hpY2ggZ2V0cyBhZGRlZCB0byBgaWAuIFRoZSBvdmVyZmxvdyBjaGVja2luZyBpcyBlYXNpZXJcblx0XHRcdC8vIGlmIHdlIGluY3JlYXNlIGBpYCBhcyB3ZSBnbywgdGhlbiBzdWJ0cmFjdCBvZmYgaXRzIHN0YXJ0aW5nXG5cdFx0XHQvLyB2YWx1ZSBhdCB0aGUgZW5kIHRvIG9idGFpbiBgZGVsdGFgLlxuXHRcdFx0Zm9yIChvbGRpID0gaSwgdyA9IDEsIGsgPSBiYXNlOyAvKiBubyBjb25kaXRpb24gKi87IGsgKz0gYmFzZSkge1xuXG5cdFx0XHRcdGlmIChpbmRleCA+PSBpbnB1dExlbmd0aCkge1xuXHRcdFx0XHRcdGVycm9yKCdpbnZhbGlkLWlucHV0Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRkaWdpdCA9IGJhc2ljVG9EaWdpdChpbnB1dC5jaGFyQ29kZUF0KGluZGV4KyspKTtcblxuXHRcdFx0XHRpZiAoZGlnaXQgPj0gYmFzZSB8fCBkaWdpdCA+IGZsb29yKChtYXhJbnQgLSBpKSAvIHcpKSB7XG5cdFx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpICs9IGRpZ2l0ICogdztcblx0XHRcdFx0dCA9IGsgPD0gYmlhcyA/IHRNaW4gOiAoayA+PSBiaWFzICsgdE1heCA/IHRNYXggOiBrIC0gYmlhcyk7XG5cblx0XHRcdFx0aWYgKGRpZ2l0IDwgdCkge1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YmFzZU1pbnVzVCA9IGJhc2UgLSB0O1xuXHRcdFx0XHRpZiAodyA+IGZsb29yKG1heEludCAvIGJhc2VNaW51c1QpKSB7XG5cdFx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR3ICo9IGJhc2VNaW51c1Q7XG5cblx0XHRcdH1cblxuXHRcdFx0b3V0ID0gb3V0cHV0Lmxlbmd0aCArIDE7XG5cdFx0XHRiaWFzID0gYWRhcHQoaSAtIG9sZGksIG91dCwgb2xkaSA9PSAwKTtcblxuXHRcdFx0Ly8gYGlgIHdhcyBzdXBwb3NlZCB0byB3cmFwIGFyb3VuZCBmcm9tIGBvdXRgIHRvIGAwYCxcblx0XHRcdC8vIGluY3JlbWVudGluZyBgbmAgZWFjaCB0aW1lLCBzbyB3ZSdsbCBmaXggdGhhdCBub3c6XG5cdFx0XHRpZiAoZmxvb3IoaSAvIG91dCkgPiBtYXhJbnQgLSBuKSB7XG5cdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0fVxuXG5cdFx0XHRuICs9IGZsb29yKGkgLyBvdXQpO1xuXHRcdFx0aSAlPSBvdXQ7XG5cblx0XHRcdC8vIEluc2VydCBgbmAgYXQgcG9zaXRpb24gYGlgIG9mIHRoZSBvdXRwdXRcblx0XHRcdG91dHB1dC5zcGxpY2UoaSsrLCAwLCBuKTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB1Y3MyZW5jb2RlKG91dHB1dCk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBzdHJpbmcgb2YgVW5pY29kZSBzeW1ib2xzIChlLmcuIGEgZG9tYWluIG5hbWUgbGFiZWwpIHRvIGFcblx0ICogUHVueWNvZGUgc3RyaW5nIG9mIEFTQ0lJLW9ubHkgc3ltYm9scy5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dCBUaGUgc3RyaW5nIG9mIFVuaWNvZGUgc3ltYm9scy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIHJlc3VsdGluZyBQdW55Y29kZSBzdHJpbmcgb2YgQVNDSUktb25seSBzeW1ib2xzLlxuXHQgKi9cblx0ZnVuY3Rpb24gZW5jb2RlKGlucHV0KSB7XG5cdFx0dmFyIG4sXG5cdFx0ICAgIGRlbHRhLFxuXHRcdCAgICBoYW5kbGVkQ1BDb3VudCxcblx0XHQgICAgYmFzaWNMZW5ndGgsXG5cdFx0ICAgIGJpYXMsXG5cdFx0ICAgIGosXG5cdFx0ICAgIG0sXG5cdFx0ICAgIHEsXG5cdFx0ICAgIGssXG5cdFx0ICAgIHQsXG5cdFx0ICAgIGN1cnJlbnRWYWx1ZSxcblx0XHQgICAgb3V0cHV0ID0gW10sXG5cdFx0ICAgIC8qKiBgaW5wdXRMZW5ndGhgIHdpbGwgaG9sZCB0aGUgbnVtYmVyIG9mIGNvZGUgcG9pbnRzIGluIGBpbnB1dGAuICovXG5cdFx0ICAgIGlucHV0TGVuZ3RoLFxuXHRcdCAgICAvKiogQ2FjaGVkIGNhbGN1bGF0aW9uIHJlc3VsdHMgKi9cblx0XHQgICAgaGFuZGxlZENQQ291bnRQbHVzT25lLFxuXHRcdCAgICBiYXNlTWludXNULFxuXHRcdCAgICBxTWludXNUO1xuXG5cdFx0Ly8gQ29udmVydCB0aGUgaW5wdXQgaW4gVUNTLTIgdG8gVW5pY29kZVxuXHRcdGlucHV0ID0gdWNzMmRlY29kZShpbnB1dCk7XG5cblx0XHQvLyBDYWNoZSB0aGUgbGVuZ3RoXG5cdFx0aW5wdXRMZW5ndGggPSBpbnB1dC5sZW5ndGg7XG5cblx0XHQvLyBJbml0aWFsaXplIHRoZSBzdGF0ZVxuXHRcdG4gPSBpbml0aWFsTjtcblx0XHRkZWx0YSA9IDA7XG5cdFx0YmlhcyA9IGluaXRpYWxCaWFzO1xuXG5cdFx0Ly8gSGFuZGxlIHRoZSBiYXNpYyBjb2RlIHBvaW50c1xuXHRcdGZvciAoaiA9IDA7IGogPCBpbnB1dExlbmd0aDsgKytqKSB7XG5cdFx0XHRjdXJyZW50VmFsdWUgPSBpbnB1dFtqXTtcblx0XHRcdGlmIChjdXJyZW50VmFsdWUgPCAweDgwKSB7XG5cdFx0XHRcdG91dHB1dC5wdXNoKHN0cmluZ0Zyb21DaGFyQ29kZShjdXJyZW50VmFsdWUpKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRoYW5kbGVkQ1BDb3VudCA9IGJhc2ljTGVuZ3RoID0gb3V0cHV0Lmxlbmd0aDtcblxuXHRcdC8vIGBoYW5kbGVkQ1BDb3VudGAgaXMgdGhlIG51bWJlciBvZiBjb2RlIHBvaW50cyB0aGF0IGhhdmUgYmVlbiBoYW5kbGVkO1xuXHRcdC8vIGBiYXNpY0xlbmd0aGAgaXMgdGhlIG51bWJlciBvZiBiYXNpYyBjb2RlIHBvaW50cy5cblxuXHRcdC8vIEZpbmlzaCB0aGUgYmFzaWMgc3RyaW5nIC0gaWYgaXQgaXMgbm90IGVtcHR5IC0gd2l0aCBhIGRlbGltaXRlclxuXHRcdGlmIChiYXNpY0xlbmd0aCkge1xuXHRcdFx0b3V0cHV0LnB1c2goZGVsaW1pdGVyKTtcblx0XHR9XG5cblx0XHQvLyBNYWluIGVuY29kaW5nIGxvb3A6XG5cdFx0d2hpbGUgKGhhbmRsZWRDUENvdW50IDwgaW5wdXRMZW5ndGgpIHtcblxuXHRcdFx0Ly8gQWxsIG5vbi1iYXNpYyBjb2RlIHBvaW50cyA8IG4gaGF2ZSBiZWVuIGhhbmRsZWQgYWxyZWFkeS4gRmluZCB0aGUgbmV4dFxuXHRcdFx0Ly8gbGFyZ2VyIG9uZTpcblx0XHRcdGZvciAobSA9IG1heEludCwgaiA9IDA7IGogPCBpbnB1dExlbmd0aDsgKytqKSB7XG5cdFx0XHRcdGN1cnJlbnRWYWx1ZSA9IGlucHV0W2pdO1xuXHRcdFx0XHRpZiAoY3VycmVudFZhbHVlID49IG4gJiYgY3VycmVudFZhbHVlIDwgbSkge1xuXHRcdFx0XHRcdG0gPSBjdXJyZW50VmFsdWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gSW5jcmVhc2UgYGRlbHRhYCBlbm91Z2ggdG8gYWR2YW5jZSB0aGUgZGVjb2RlcidzIDxuLGk+IHN0YXRlIHRvIDxtLDA+LFxuXHRcdFx0Ly8gYnV0IGd1YXJkIGFnYWluc3Qgb3ZlcmZsb3dcblx0XHRcdGhhbmRsZWRDUENvdW50UGx1c09uZSA9IGhhbmRsZWRDUENvdW50ICsgMTtcblx0XHRcdGlmIChtIC0gbiA+IGZsb29yKChtYXhJbnQgLSBkZWx0YSkgLyBoYW5kbGVkQ1BDb3VudFBsdXNPbmUpKSB7XG5cdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0fVxuXG5cdFx0XHRkZWx0YSArPSAobSAtIG4pICogaGFuZGxlZENQQ291bnRQbHVzT25lO1xuXHRcdFx0biA9IG07XG5cblx0XHRcdGZvciAoaiA9IDA7IGogPCBpbnB1dExlbmd0aDsgKytqKSB7XG5cdFx0XHRcdGN1cnJlbnRWYWx1ZSA9IGlucHV0W2pdO1xuXG5cdFx0XHRcdGlmIChjdXJyZW50VmFsdWUgPCBuICYmICsrZGVsdGEgPiBtYXhJbnQpIHtcblx0XHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChjdXJyZW50VmFsdWUgPT0gbikge1xuXHRcdFx0XHRcdC8vIFJlcHJlc2VudCBkZWx0YSBhcyBhIGdlbmVyYWxpemVkIHZhcmlhYmxlLWxlbmd0aCBpbnRlZ2VyXG5cdFx0XHRcdFx0Zm9yIChxID0gZGVsdGEsIGsgPSBiYXNlOyAvKiBubyBjb25kaXRpb24gKi87IGsgKz0gYmFzZSkge1xuXHRcdFx0XHRcdFx0dCA9IGsgPD0gYmlhcyA/IHRNaW4gOiAoayA+PSBiaWFzICsgdE1heCA/IHRNYXggOiBrIC0gYmlhcyk7XG5cdFx0XHRcdFx0XHRpZiAocSA8IHQpIHtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRxTWludXNUID0gcSAtIHQ7XG5cdFx0XHRcdFx0XHRiYXNlTWludXNUID0gYmFzZSAtIHQ7XG5cdFx0XHRcdFx0XHRvdXRwdXQucHVzaChcblx0XHRcdFx0XHRcdFx0c3RyaW5nRnJvbUNoYXJDb2RlKGRpZ2l0VG9CYXNpYyh0ICsgcU1pbnVzVCAlIGJhc2VNaW51c1QsIDApKVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdHEgPSBmbG9vcihxTWludXNUIC8gYmFzZU1pbnVzVCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0b3V0cHV0LnB1c2goc3RyaW5nRnJvbUNoYXJDb2RlKGRpZ2l0VG9CYXNpYyhxLCAwKSkpO1xuXHRcdFx0XHRcdGJpYXMgPSBhZGFwdChkZWx0YSwgaGFuZGxlZENQQ291bnRQbHVzT25lLCBoYW5kbGVkQ1BDb3VudCA9PSBiYXNpY0xlbmd0aCk7XG5cdFx0XHRcdFx0ZGVsdGEgPSAwO1xuXHRcdFx0XHRcdCsraGFuZGxlZENQQ291bnQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0KytkZWx0YTtcblx0XHRcdCsrbjtcblxuXHRcdH1cblx0XHRyZXR1cm4gb3V0cHV0LmpvaW4oJycpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgUHVueWNvZGUgc3RyaW5nIHJlcHJlc2VudGluZyBhIGRvbWFpbiBuYW1lIG9yIGFuIGVtYWlsIGFkZHJlc3Ncblx0ICogdG8gVW5pY29kZS4gT25seSB0aGUgUHVueWNvZGVkIHBhcnRzIG9mIHRoZSBpbnB1dCB3aWxsIGJlIGNvbnZlcnRlZCwgaS5lLlxuXHQgKiBpdCBkb2Vzbid0IG1hdHRlciBpZiB5b3UgY2FsbCBpdCBvbiBhIHN0cmluZyB0aGF0IGhhcyBhbHJlYWR5IGJlZW5cblx0ICogY29udmVydGVkIHRvIFVuaWNvZGUuXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIFB1bnljb2RlZCBkb21haW4gbmFtZSBvciBlbWFpbCBhZGRyZXNzIHRvXG5cdCAqIGNvbnZlcnQgdG8gVW5pY29kZS5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIFVuaWNvZGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIGdpdmVuIFB1bnljb2RlXG5cdCAqIHN0cmluZy5cblx0ICovXG5cdGZ1bmN0aW9uIHRvVW5pY29kZShpbnB1dCkge1xuXHRcdHJldHVybiBtYXBEb21haW4oaW5wdXQsIGZ1bmN0aW9uKHN0cmluZykge1xuXHRcdFx0cmV0dXJuIHJlZ2V4UHVueWNvZGUudGVzdChzdHJpbmcpXG5cdFx0XHRcdD8gZGVjb2RlKHN0cmluZy5zbGljZSg0KS50b0xvd2VyQ2FzZSgpKVxuXHRcdFx0XHQ6IHN0cmluZztcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIFVuaWNvZGUgc3RyaW5nIHJlcHJlc2VudGluZyBhIGRvbWFpbiBuYW1lIG9yIGFuIGVtYWlsIGFkZHJlc3MgdG9cblx0ICogUHVueWNvZGUuIE9ubHkgdGhlIG5vbi1BU0NJSSBwYXJ0cyBvZiB0aGUgZG9tYWluIG5hbWUgd2lsbCBiZSBjb252ZXJ0ZWQsXG5cdCAqIGkuZS4gaXQgZG9lc24ndCBtYXR0ZXIgaWYgeW91IGNhbGwgaXQgd2l0aCBhIGRvbWFpbiB0aGF0J3MgYWxyZWFkeSBpblxuXHQgKiBBU0NJSS5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dCBUaGUgZG9tYWluIG5hbWUgb3IgZW1haWwgYWRkcmVzcyB0byBjb252ZXJ0LCBhcyBhXG5cdCAqIFVuaWNvZGUgc3RyaW5nLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgUHVueWNvZGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIGdpdmVuIGRvbWFpbiBuYW1lIG9yXG5cdCAqIGVtYWlsIGFkZHJlc3MuXG5cdCAqL1xuXHRmdW5jdGlvbiB0b0FTQ0lJKGlucHV0KSB7XG5cdFx0cmV0dXJuIG1hcERvbWFpbihpbnB1dCwgZnVuY3Rpb24oc3RyaW5nKSB7XG5cdFx0XHRyZXR1cm4gcmVnZXhOb25BU0NJSS50ZXN0KHN0cmluZylcblx0XHRcdFx0PyAneG4tLScgKyBlbmNvZGUoc3RyaW5nKVxuXHRcdFx0XHQ6IHN0cmluZztcblx0XHR9KTtcblx0fVxuXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cdC8qKiBEZWZpbmUgdGhlIHB1YmxpYyBBUEkgKi9cblx0cHVueWNvZGUgPSB7XG5cdFx0LyoqXG5cdFx0ICogQSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBjdXJyZW50IFB1bnljb2RlLmpzIHZlcnNpb24gbnVtYmVyLlxuXHRcdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHRcdCAqIEB0eXBlIFN0cmluZ1xuXHRcdCAqL1xuXHRcdCd2ZXJzaW9uJzogJzEuNC4xJyxcblx0XHQvKipcblx0XHQgKiBBbiBvYmplY3Qgb2YgbWV0aG9kcyB0byBjb252ZXJ0IGZyb20gSmF2YVNjcmlwdCdzIGludGVybmFsIGNoYXJhY3RlclxuXHRcdCAqIHJlcHJlc2VudGF0aW9uIChVQ1MtMikgdG8gVW5pY29kZSBjb2RlIHBvaW50cywgYW5kIGJhY2suXG5cdFx0ICogQHNlZSA8aHR0cHM6Ly9tYXRoaWFzYnluZW5zLmJlL25vdGVzL2phdmFzY3JpcHQtZW5jb2Rpbmc+XG5cdFx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdFx0ICogQHR5cGUgT2JqZWN0XG5cdFx0ICovXG5cdFx0J3VjczInOiB7XG5cdFx0XHQnZGVjb2RlJzogdWNzMmRlY29kZSxcblx0XHRcdCdlbmNvZGUnOiB1Y3MyZW5jb2RlXG5cdFx0fSxcblx0XHQnZGVjb2RlJzogZGVjb2RlLFxuXHRcdCdlbmNvZGUnOiBlbmNvZGUsXG5cdFx0J3RvQVNDSUknOiB0b0FTQ0lJLFxuXHRcdCd0b1VuaWNvZGUnOiB0b1VuaWNvZGVcblx0fTtcblxuXHQvKiogRXhwb3NlIGBwdW55Y29kZWAgKi9cblx0Ly8gU29tZSBBTUQgYnVpbGQgb3B0aW1pemVycywgbGlrZSByLmpzLCBjaGVjayBmb3Igc3BlY2lmaWMgY29uZGl0aW9uIHBhdHRlcm5zXG5cdC8vIGxpa2UgdGhlIGZvbGxvd2luZzpcblx0aWYgKFxuXHRcdHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJlxuXHRcdHR5cGVvZiBkZWZpbmUuYW1kID09ICdvYmplY3QnICYmXG5cdFx0ZGVmaW5lLmFtZFxuXHQpIHtcblx0XHRkZWZpbmUoJ3B1bnljb2RlJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gcHVueWNvZGU7XG5cdFx0fSk7XG5cdH0gZWxzZSBpZiAoZnJlZUV4cG9ydHMgJiYgZnJlZU1vZHVsZSkge1xuXHRcdGlmIChtb2R1bGUuZXhwb3J0cyA9PSBmcmVlRXhwb3J0cykge1xuXHRcdFx0Ly8gaW4gTm9kZS5qcywgaW8uanMsIG9yIFJpbmdvSlMgdjAuOC4wK1xuXHRcdFx0ZnJlZU1vZHVsZS5leHBvcnRzID0gcHVueWNvZGU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGluIE5hcndoYWwgb3IgUmluZ29KUyB2MC43LjAtXG5cdFx0XHRmb3IgKGtleSBpbiBwdW55Y29kZSkge1xuXHRcdFx0XHRwdW55Y29kZS5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIChmcmVlRXhwb3J0c1trZXldID0gcHVueWNvZGVba2V5XSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdC8vIGluIFJoaW5vIG9yIGEgd2ViIGJyb3dzZXJcblx0XHRyb290LnB1bnljb2RlID0gcHVueWNvZGU7XG5cdH1cblxufSh0aGlzKSk7XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuJ3VzZSBzdHJpY3QnO1xuXG4vLyBJZiBvYmouaGFzT3duUHJvcGVydHkgaGFzIGJlZW4gb3ZlcnJpZGRlbiwgdGhlbiBjYWxsaW5nXG4vLyBvYmouaGFzT3duUHJvcGVydHkocHJvcCkgd2lsbCBicmVhay5cbi8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2pveWVudC9ub2RlL2lzc3Vlcy8xNzA3XG5mdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHFzLCBzZXAsIGVxLCBvcHRpb25zKSB7XG4gIHNlcCA9IHNlcCB8fCAnJic7XG4gIGVxID0gZXEgfHwgJz0nO1xuICB2YXIgb2JqID0ge307XG5cbiAgaWYgKHR5cGVvZiBxcyAhPT0gJ3N0cmluZycgfHwgcXMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfVxuXG4gIHZhciByZWdleHAgPSAvXFwrL2c7XG4gIHFzID0gcXMuc3BsaXQoc2VwKTtcblxuICB2YXIgbWF4S2V5cyA9IDEwMDA7XG4gIGlmIChvcHRpb25zICYmIHR5cGVvZiBvcHRpb25zLm1heEtleXMgPT09ICdudW1iZXInKSB7XG4gICAgbWF4S2V5cyA9IG9wdGlvbnMubWF4S2V5cztcbiAgfVxuXG4gIHZhciBsZW4gPSBxcy5sZW5ndGg7XG4gIC8vIG1heEtleXMgPD0gMCBtZWFucyB0aGF0IHdlIHNob3VsZCBub3QgbGltaXQga2V5cyBjb3VudFxuICBpZiAobWF4S2V5cyA+IDAgJiYgbGVuID4gbWF4S2V5cykge1xuICAgIGxlbiA9IG1heEtleXM7XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKSB7XG4gICAgdmFyIHggPSBxc1tpXS5yZXBsYWNlKHJlZ2V4cCwgJyUyMCcpLFxuICAgICAgICBpZHggPSB4LmluZGV4T2YoZXEpLFxuICAgICAgICBrc3RyLCB2c3RyLCBrLCB2O1xuXG4gICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICBrc3RyID0geC5zdWJzdHIoMCwgaWR4KTtcbiAgICAgIHZzdHIgPSB4LnN1YnN0cihpZHggKyAxKTtcbiAgICB9IGVsc2Uge1xuICAgICAga3N0ciA9IHg7XG4gICAgICB2c3RyID0gJyc7XG4gICAgfVxuXG4gICAgayA9IGRlY29kZVVSSUNvbXBvbmVudChrc3RyKTtcbiAgICB2ID0gZGVjb2RlVVJJQ29tcG9uZW50KHZzdHIpO1xuXG4gICAgaWYgKCFoYXNPd25Qcm9wZXJ0eShvYmosIGspKSB7XG4gICAgICBvYmpba10gPSB2O1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheShvYmpba10pKSB7XG4gICAgICBvYmpba10ucHVzaCh2KTtcbiAgICB9IGVsc2Uge1xuICAgICAgb2JqW2tdID0gW29ialtrXSwgdl07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG9iajtcbn07XG5cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoeHMpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh4cykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHN0cmluZ2lmeVByaW1pdGl2ZSA9IGZ1bmN0aW9uKHYpIHtcbiAgc3dpdGNoICh0eXBlb2Ygdikge1xuICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICByZXR1cm4gdjtcblxuICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgcmV0dXJuIHYgPyAndHJ1ZScgOiAnZmFsc2UnO1xuXG4gICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgIHJldHVybiBpc0Zpbml0ZSh2KSA/IHYgOiAnJztcblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gJyc7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqLCBzZXAsIGVxLCBuYW1lKSB7XG4gIHNlcCA9IHNlcCB8fCAnJic7XG4gIGVxID0gZXEgfHwgJz0nO1xuICBpZiAob2JqID09PSBudWxsKSB7XG4gICAgb2JqID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBvYmogPT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIG1hcChvYmplY3RLZXlzKG9iaiksIGZ1bmN0aW9uKGspIHtcbiAgICAgIHZhciBrcyA9IGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUoaykpICsgZXE7XG4gICAgICBpZiAoaXNBcnJheShvYmpba10pKSB7XG4gICAgICAgIHJldHVybiBtYXAob2JqW2tdLCBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgcmV0dXJuIGtzICsgZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZSh2KSk7XG4gICAgICAgIH0pLmpvaW4oc2VwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBrcyArIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUob2JqW2tdKSk7XG4gICAgICB9XG4gICAgfSkuam9pbihzZXApO1xuXG4gIH1cblxuICBpZiAoIW5hbWUpIHJldHVybiAnJztcbiAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUobmFtZSkpICsgZXEgK1xuICAgICAgICAgZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZShvYmopKTtcbn07XG5cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoeHMpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh4cykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG5mdW5jdGlvbiBtYXAgKHhzLCBmKSB7XG4gIGlmICh4cy5tYXApIHJldHVybiB4cy5tYXAoZik7XG4gIHZhciByZXMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB4cy5sZW5ndGg7IGkrKykge1xuICAgIHJlcy5wdXNoKGYoeHNbaV0sIGkpKTtcbiAgfVxuICByZXR1cm4gcmVzO1xufVxuXG52YXIgb2JqZWN0S2V5cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgdmFyIHJlcyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHJlcy5wdXNoKGtleSk7XG4gIH1cbiAgcmV0dXJuIHJlcztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuZGVjb2RlID0gZXhwb3J0cy5wYXJzZSA9IHJlcXVpcmUoJy4vZGVjb2RlJyk7XG5leHBvcnRzLmVuY29kZSA9IGV4cG9ydHMuc3RyaW5naWZ5ID0gcmVxdWlyZSgnLi9lbmNvZGUnKTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBwdW55Y29kZSA9IHJlcXVpcmUoJ3B1bnljb2RlJyk7XG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5leHBvcnRzLnBhcnNlID0gdXJsUGFyc2U7XG5leHBvcnRzLnJlc29sdmUgPSB1cmxSZXNvbHZlO1xuZXhwb3J0cy5yZXNvbHZlT2JqZWN0ID0gdXJsUmVzb2x2ZU9iamVjdDtcbmV4cG9ydHMuZm9ybWF0ID0gdXJsRm9ybWF0O1xuXG5leHBvcnRzLlVybCA9IFVybDtcblxuZnVuY3Rpb24gVXJsKCkge1xuICB0aGlzLnByb3RvY29sID0gbnVsbDtcbiAgdGhpcy5zbGFzaGVzID0gbnVsbDtcbiAgdGhpcy5hdXRoID0gbnVsbDtcbiAgdGhpcy5ob3N0ID0gbnVsbDtcbiAgdGhpcy5wb3J0ID0gbnVsbDtcbiAgdGhpcy5ob3N0bmFtZSA9IG51bGw7XG4gIHRoaXMuaGFzaCA9IG51bGw7XG4gIHRoaXMuc2VhcmNoID0gbnVsbDtcbiAgdGhpcy5xdWVyeSA9IG51bGw7XG4gIHRoaXMucGF0aG5hbWUgPSBudWxsO1xuICB0aGlzLnBhdGggPSBudWxsO1xuICB0aGlzLmhyZWYgPSBudWxsO1xufVxuXG4vLyBSZWZlcmVuY2U6IFJGQyAzOTg2LCBSRkMgMTgwOCwgUkZDIDIzOTZcblxuLy8gZGVmaW5lIHRoZXNlIGhlcmUgc28gYXQgbGVhc3QgdGhleSBvbmx5IGhhdmUgdG8gYmVcbi8vIGNvbXBpbGVkIG9uY2Ugb24gdGhlIGZpcnN0IG1vZHVsZSBsb2FkLlxudmFyIHByb3RvY29sUGF0dGVybiA9IC9eKFthLXowLTkuKy1dKzopL2ksXG4gICAgcG9ydFBhdHRlcm4gPSAvOlswLTldKiQvLFxuXG4gICAgLy8gU3BlY2lhbCBjYXNlIGZvciBhIHNpbXBsZSBwYXRoIFVSTFxuICAgIHNpbXBsZVBhdGhQYXR0ZXJuID0gL14oXFwvXFwvPyg/IVxcLylbXlxcP1xcc10qKShcXD9bXlxcc10qKT8kLyxcblxuICAgIC8vIFJGQyAyMzk2OiBjaGFyYWN0ZXJzIHJlc2VydmVkIGZvciBkZWxpbWl0aW5nIFVSTHMuXG4gICAgLy8gV2UgYWN0dWFsbHkganVzdCBhdXRvLWVzY2FwZSB0aGVzZS5cbiAgICBkZWxpbXMgPSBbJzwnLCAnPicsICdcIicsICdgJywgJyAnLCAnXFxyJywgJ1xcbicsICdcXHQnXSxcblxuICAgIC8vIFJGQyAyMzk2OiBjaGFyYWN0ZXJzIG5vdCBhbGxvd2VkIGZvciB2YXJpb3VzIHJlYXNvbnMuXG4gICAgdW53aXNlID0gWyd7JywgJ30nLCAnfCcsICdcXFxcJywgJ14nLCAnYCddLmNvbmNhdChkZWxpbXMpLFxuXG4gICAgLy8gQWxsb3dlZCBieSBSRkNzLCBidXQgY2F1c2Ugb2YgWFNTIGF0dGFja3MuICBBbHdheXMgZXNjYXBlIHRoZXNlLlxuICAgIGF1dG9Fc2NhcGUgPSBbJ1xcJyddLmNvbmNhdCh1bndpc2UpLFxuICAgIC8vIENoYXJhY3RlcnMgdGhhdCBhcmUgbmV2ZXIgZXZlciBhbGxvd2VkIGluIGEgaG9zdG5hbWUuXG4gICAgLy8gTm90ZSB0aGF0IGFueSBpbnZhbGlkIGNoYXJzIGFyZSBhbHNvIGhhbmRsZWQsIGJ1dCB0aGVzZVxuICAgIC8vIGFyZSB0aGUgb25lcyB0aGF0IGFyZSAqZXhwZWN0ZWQqIHRvIGJlIHNlZW4sIHNvIHdlIGZhc3QtcGF0aFxuICAgIC8vIHRoZW0uXG4gICAgbm9uSG9zdENoYXJzID0gWyclJywgJy8nLCAnPycsICc7JywgJyMnXS5jb25jYXQoYXV0b0VzY2FwZSksXG4gICAgaG9zdEVuZGluZ0NoYXJzID0gWycvJywgJz8nLCAnIyddLFxuICAgIGhvc3RuYW1lTWF4TGVuID0gMjU1LFxuICAgIGhvc3RuYW1lUGFydFBhdHRlcm4gPSAvXlsrYS16MC05QS1aXy1dezAsNjN9JC8sXG4gICAgaG9zdG5hbWVQYXJ0U3RhcnQgPSAvXihbK2EtejAtOUEtWl8tXXswLDYzfSkoLiopJC8sXG4gICAgLy8gcHJvdG9jb2xzIHRoYXQgY2FuIGFsbG93IFwidW5zYWZlXCIgYW5kIFwidW53aXNlXCIgY2hhcnMuXG4gICAgdW5zYWZlUHJvdG9jb2wgPSB7XG4gICAgICAnamF2YXNjcmlwdCc6IHRydWUsXG4gICAgICAnamF2YXNjcmlwdDonOiB0cnVlXG4gICAgfSxcbiAgICAvLyBwcm90b2NvbHMgdGhhdCBuZXZlciBoYXZlIGEgaG9zdG5hbWUuXG4gICAgaG9zdGxlc3NQcm90b2NvbCA9IHtcbiAgICAgICdqYXZhc2NyaXB0JzogdHJ1ZSxcbiAgICAgICdqYXZhc2NyaXB0Oic6IHRydWVcbiAgICB9LFxuICAgIC8vIHByb3RvY29scyB0aGF0IGFsd2F5cyBjb250YWluIGEgLy8gYml0LlxuICAgIHNsYXNoZWRQcm90b2NvbCA9IHtcbiAgICAgICdodHRwJzogdHJ1ZSxcbiAgICAgICdodHRwcyc6IHRydWUsXG4gICAgICAnZnRwJzogdHJ1ZSxcbiAgICAgICdnb3BoZXInOiB0cnVlLFxuICAgICAgJ2ZpbGUnOiB0cnVlLFxuICAgICAgJ2h0dHA6JzogdHJ1ZSxcbiAgICAgICdodHRwczonOiB0cnVlLFxuICAgICAgJ2Z0cDonOiB0cnVlLFxuICAgICAgJ2dvcGhlcjonOiB0cnVlLFxuICAgICAgJ2ZpbGU6JzogdHJ1ZVxuICAgIH0sXG4gICAgcXVlcnlzdHJpbmcgPSByZXF1aXJlKCdxdWVyeXN0cmluZycpO1xuXG5mdW5jdGlvbiB1cmxQYXJzZSh1cmwsIHBhcnNlUXVlcnlTdHJpbmcsIHNsYXNoZXNEZW5vdGVIb3N0KSB7XG4gIGlmICh1cmwgJiYgdXRpbC5pc09iamVjdCh1cmwpICYmIHVybCBpbnN0YW5jZW9mIFVybCkgcmV0dXJuIHVybDtcblxuICB2YXIgdSA9IG5ldyBVcmw7XG4gIHUucGFyc2UodXJsLCBwYXJzZVF1ZXJ5U3RyaW5nLCBzbGFzaGVzRGVub3RlSG9zdCk7XG4gIHJldHVybiB1O1xufVxuXG5VcmwucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24odXJsLCBwYXJzZVF1ZXJ5U3RyaW5nLCBzbGFzaGVzRGVub3RlSG9zdCkge1xuICBpZiAoIXV0aWwuaXNTdHJpbmcodXJsKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQYXJhbWV0ZXIgJ3VybCcgbXVzdCBiZSBhIHN0cmluZywgbm90IFwiICsgdHlwZW9mIHVybCk7XG4gIH1cblxuICAvLyBDb3B5IGNocm9tZSwgSUUsIG9wZXJhIGJhY2tzbGFzaC1oYW5kbGluZyBiZWhhdmlvci5cbiAgLy8gQmFjayBzbGFzaGVzIGJlZm9yZSB0aGUgcXVlcnkgc3RyaW5nIGdldCBjb252ZXJ0ZWQgdG8gZm9yd2FyZCBzbGFzaGVzXG4gIC8vIFNlZTogaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTI1OTE2XG4gIHZhciBxdWVyeUluZGV4ID0gdXJsLmluZGV4T2YoJz8nKSxcbiAgICAgIHNwbGl0dGVyID1cbiAgICAgICAgICAocXVlcnlJbmRleCAhPT0gLTEgJiYgcXVlcnlJbmRleCA8IHVybC5pbmRleE9mKCcjJykpID8gJz8nIDogJyMnLFxuICAgICAgdVNwbGl0ID0gdXJsLnNwbGl0KHNwbGl0dGVyKSxcbiAgICAgIHNsYXNoUmVnZXggPSAvXFxcXC9nO1xuICB1U3BsaXRbMF0gPSB1U3BsaXRbMF0ucmVwbGFjZShzbGFzaFJlZ2V4LCAnLycpO1xuICB1cmwgPSB1U3BsaXQuam9pbihzcGxpdHRlcik7XG5cbiAgdmFyIHJlc3QgPSB1cmw7XG5cbiAgLy8gdHJpbSBiZWZvcmUgcHJvY2VlZGluZy5cbiAgLy8gVGhpcyBpcyB0byBzdXBwb3J0IHBhcnNlIHN0dWZmIGxpa2UgXCIgIGh0dHA6Ly9mb28uY29tICBcXG5cIlxuICByZXN0ID0gcmVzdC50cmltKCk7XG5cbiAgaWYgKCFzbGFzaGVzRGVub3RlSG9zdCAmJiB1cmwuc3BsaXQoJyMnKS5sZW5ndGggPT09IDEpIHtcbiAgICAvLyBUcnkgZmFzdCBwYXRoIHJlZ2V4cFxuICAgIHZhciBzaW1wbGVQYXRoID0gc2ltcGxlUGF0aFBhdHRlcm4uZXhlYyhyZXN0KTtcbiAgICBpZiAoc2ltcGxlUGF0aCkge1xuICAgICAgdGhpcy5wYXRoID0gcmVzdDtcbiAgICAgIHRoaXMuaHJlZiA9IHJlc3Q7XG4gICAgICB0aGlzLnBhdGhuYW1lID0gc2ltcGxlUGF0aFsxXTtcbiAgICAgIGlmIChzaW1wbGVQYXRoWzJdKSB7XG4gICAgICAgIHRoaXMuc2VhcmNoID0gc2ltcGxlUGF0aFsyXTtcbiAgICAgICAgaWYgKHBhcnNlUXVlcnlTdHJpbmcpIHtcbiAgICAgICAgICB0aGlzLnF1ZXJ5ID0gcXVlcnlzdHJpbmcucGFyc2UodGhpcy5zZWFyY2guc3Vic3RyKDEpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnF1ZXJ5ID0gdGhpcy5zZWFyY2guc3Vic3RyKDEpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHBhcnNlUXVlcnlTdHJpbmcpIHtcbiAgICAgICAgdGhpcy5zZWFyY2ggPSAnJztcbiAgICAgICAgdGhpcy5xdWVyeSA9IHt9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9XG5cbiAgdmFyIHByb3RvID0gcHJvdG9jb2xQYXR0ZXJuLmV4ZWMocmVzdCk7XG4gIGlmIChwcm90bykge1xuICAgIHByb3RvID0gcHJvdG9bMF07XG4gICAgdmFyIGxvd2VyUHJvdG8gPSBwcm90by50b0xvd2VyQ2FzZSgpO1xuICAgIHRoaXMucHJvdG9jb2wgPSBsb3dlclByb3RvO1xuICAgIHJlc3QgPSByZXN0LnN1YnN0cihwcm90by5sZW5ndGgpO1xuICB9XG5cbiAgLy8gZmlndXJlIG91dCBpZiBpdCdzIGdvdCBhIGhvc3RcbiAgLy8gdXNlckBzZXJ2ZXIgaXMgKmFsd2F5cyogaW50ZXJwcmV0ZWQgYXMgYSBob3N0bmFtZSwgYW5kIHVybFxuICAvLyByZXNvbHV0aW9uIHdpbGwgdHJlYXQgLy9mb28vYmFyIGFzIGhvc3Q9Zm9vLHBhdGg9YmFyIGJlY2F1c2UgdGhhdCdzXG4gIC8vIGhvdyB0aGUgYnJvd3NlciByZXNvbHZlcyByZWxhdGl2ZSBVUkxzLlxuICBpZiAoc2xhc2hlc0Rlbm90ZUhvc3QgfHwgcHJvdG8gfHwgcmVzdC5tYXRjaCgvXlxcL1xcL1teQFxcL10rQFteQFxcL10rLykpIHtcbiAgICB2YXIgc2xhc2hlcyA9IHJlc3Quc3Vic3RyKDAsIDIpID09PSAnLy8nO1xuICAgIGlmIChzbGFzaGVzICYmICEocHJvdG8gJiYgaG9zdGxlc3NQcm90b2NvbFtwcm90b10pKSB7XG4gICAgICByZXN0ID0gcmVzdC5zdWJzdHIoMik7XG4gICAgICB0aGlzLnNsYXNoZXMgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGlmICghaG9zdGxlc3NQcm90b2NvbFtwcm90b10gJiZcbiAgICAgIChzbGFzaGVzIHx8IChwcm90byAmJiAhc2xhc2hlZFByb3RvY29sW3Byb3RvXSkpKSB7XG5cbiAgICAvLyB0aGVyZSdzIGEgaG9zdG5hbWUuXG4gICAgLy8gdGhlIGZpcnN0IGluc3RhbmNlIG9mIC8sID8sIDssIG9yICMgZW5kcyB0aGUgaG9zdC5cbiAgICAvL1xuICAgIC8vIElmIHRoZXJlIGlzIGFuIEAgaW4gdGhlIGhvc3RuYW1lLCB0aGVuIG5vbi1ob3N0IGNoYXJzICphcmUqIGFsbG93ZWRcbiAgICAvLyB0byB0aGUgbGVmdCBvZiB0aGUgbGFzdCBAIHNpZ24sIHVubGVzcyBzb21lIGhvc3QtZW5kaW5nIGNoYXJhY3RlclxuICAgIC8vIGNvbWVzICpiZWZvcmUqIHRoZSBALXNpZ24uXG4gICAgLy8gVVJMcyBhcmUgb2Jub3hpb3VzLlxuICAgIC8vXG4gICAgLy8gZXg6XG4gICAgLy8gaHR0cDovL2FAYkBjLyA9PiB1c2VyOmFAYiBob3N0OmNcbiAgICAvLyBodHRwOi8vYUBiP0BjID0+IHVzZXI6YSBob3N0OmMgcGF0aDovP0BjXG5cbiAgICAvLyB2MC4xMiBUT0RPKGlzYWFjcyk6IFRoaXMgaXMgbm90IHF1aXRlIGhvdyBDaHJvbWUgZG9lcyB0aGluZ3MuXG4gICAgLy8gUmV2aWV3IG91ciB0ZXN0IGNhc2UgYWdhaW5zdCBicm93c2VycyBtb3JlIGNvbXByZWhlbnNpdmVseS5cblxuICAgIC8vIGZpbmQgdGhlIGZpcnN0IGluc3RhbmNlIG9mIGFueSBob3N0RW5kaW5nQ2hhcnNcbiAgICB2YXIgaG9zdEVuZCA9IC0xO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaG9zdEVuZGluZ0NoYXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaGVjID0gcmVzdC5pbmRleE9mKGhvc3RFbmRpbmdDaGFyc1tpXSk7XG4gICAgICBpZiAoaGVjICE9PSAtMSAmJiAoaG9zdEVuZCA9PT0gLTEgfHwgaGVjIDwgaG9zdEVuZCkpXG4gICAgICAgIGhvc3RFbmQgPSBoZWM7XG4gICAgfVxuXG4gICAgLy8gYXQgdGhpcyBwb2ludCwgZWl0aGVyIHdlIGhhdmUgYW4gZXhwbGljaXQgcG9pbnQgd2hlcmUgdGhlXG4gICAgLy8gYXV0aCBwb3J0aW9uIGNhbm5vdCBnbyBwYXN0LCBvciB0aGUgbGFzdCBAIGNoYXIgaXMgdGhlIGRlY2lkZXIuXG4gICAgdmFyIGF1dGgsIGF0U2lnbjtcbiAgICBpZiAoaG9zdEVuZCA9PT0gLTEpIHtcbiAgICAgIC8vIGF0U2lnbiBjYW4gYmUgYW55d2hlcmUuXG4gICAgICBhdFNpZ24gPSByZXN0Lmxhc3RJbmRleE9mKCdAJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGF0U2lnbiBtdXN0IGJlIGluIGF1dGggcG9ydGlvbi5cbiAgICAgIC8vIGh0dHA6Ly9hQGIvY0BkID0+IGhvc3Q6YiBhdXRoOmEgcGF0aDovY0BkXG4gICAgICBhdFNpZ24gPSByZXN0Lmxhc3RJbmRleE9mKCdAJywgaG9zdEVuZCk7XG4gICAgfVxuXG4gICAgLy8gTm93IHdlIGhhdmUgYSBwb3J0aW9uIHdoaWNoIGlzIGRlZmluaXRlbHkgdGhlIGF1dGguXG4gICAgLy8gUHVsbCB0aGF0IG9mZi5cbiAgICBpZiAoYXRTaWduICE9PSAtMSkge1xuICAgICAgYXV0aCA9IHJlc3Quc2xpY2UoMCwgYXRTaWduKTtcbiAgICAgIHJlc3QgPSByZXN0LnNsaWNlKGF0U2lnbiArIDEpO1xuICAgICAgdGhpcy5hdXRoID0gZGVjb2RlVVJJQ29tcG9uZW50KGF1dGgpO1xuICAgIH1cblxuICAgIC8vIHRoZSBob3N0IGlzIHRoZSByZW1haW5pbmcgdG8gdGhlIGxlZnQgb2YgdGhlIGZpcnN0IG5vbi1ob3N0IGNoYXJcbiAgICBob3N0RW5kID0gLTE7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub25Ib3N0Q2hhcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBoZWMgPSByZXN0LmluZGV4T2Yobm9uSG9zdENoYXJzW2ldKTtcbiAgICAgIGlmIChoZWMgIT09IC0xICYmIChob3N0RW5kID09PSAtMSB8fCBoZWMgPCBob3N0RW5kKSlcbiAgICAgICAgaG9zdEVuZCA9IGhlYztcbiAgICB9XG4gICAgLy8gaWYgd2Ugc3RpbGwgaGF2ZSBub3QgaGl0IGl0LCB0aGVuIHRoZSBlbnRpcmUgdGhpbmcgaXMgYSBob3N0LlxuICAgIGlmIChob3N0RW5kID09PSAtMSlcbiAgICAgIGhvc3RFbmQgPSByZXN0Lmxlbmd0aDtcblxuICAgIHRoaXMuaG9zdCA9IHJlc3Quc2xpY2UoMCwgaG9zdEVuZCk7XG4gICAgcmVzdCA9IHJlc3Quc2xpY2UoaG9zdEVuZCk7XG5cbiAgICAvLyBwdWxsIG91dCBwb3J0LlxuICAgIHRoaXMucGFyc2VIb3N0KCk7XG5cbiAgICAvLyB3ZSd2ZSBpbmRpY2F0ZWQgdGhhdCB0aGVyZSBpcyBhIGhvc3RuYW1lLFxuICAgIC8vIHNvIGV2ZW4gaWYgaXQncyBlbXB0eSwgaXQgaGFzIHRvIGJlIHByZXNlbnQuXG4gICAgdGhpcy5ob3N0bmFtZSA9IHRoaXMuaG9zdG5hbWUgfHwgJyc7XG5cbiAgICAvLyBpZiBob3N0bmFtZSBiZWdpbnMgd2l0aCBbIGFuZCBlbmRzIHdpdGggXVxuICAgIC8vIGFzc3VtZSB0aGF0IGl0J3MgYW4gSVB2NiBhZGRyZXNzLlxuICAgIHZhciBpcHY2SG9zdG5hbWUgPSB0aGlzLmhvc3RuYW1lWzBdID09PSAnWycgJiZcbiAgICAgICAgdGhpcy5ob3N0bmFtZVt0aGlzLmhvc3RuYW1lLmxlbmd0aCAtIDFdID09PSAnXSc7XG5cbiAgICAvLyB2YWxpZGF0ZSBhIGxpdHRsZS5cbiAgICBpZiAoIWlwdjZIb3N0bmFtZSkge1xuICAgICAgdmFyIGhvc3RwYXJ0cyA9IHRoaXMuaG9zdG5hbWUuc3BsaXQoL1xcLi8pO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBob3N0cGFydHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBwYXJ0ID0gaG9zdHBhcnRzW2ldO1xuICAgICAgICBpZiAoIXBhcnQpIGNvbnRpbnVlO1xuICAgICAgICBpZiAoIXBhcnQubWF0Y2goaG9zdG5hbWVQYXJ0UGF0dGVybikpIHtcbiAgICAgICAgICB2YXIgbmV3cGFydCA9ICcnO1xuICAgICAgICAgIGZvciAodmFyIGogPSAwLCBrID0gcGFydC5sZW5ndGg7IGogPCBrOyBqKyspIHtcbiAgICAgICAgICAgIGlmIChwYXJ0LmNoYXJDb2RlQXQoaikgPiAxMjcpIHtcbiAgICAgICAgICAgICAgLy8gd2UgcmVwbGFjZSBub24tQVNDSUkgY2hhciB3aXRoIGEgdGVtcG9yYXJ5IHBsYWNlaG9sZGVyXG4gICAgICAgICAgICAgIC8vIHdlIG5lZWQgdGhpcyB0byBtYWtlIHN1cmUgc2l6ZSBvZiBob3N0bmFtZSBpcyBub3RcbiAgICAgICAgICAgICAgLy8gYnJva2VuIGJ5IHJlcGxhY2luZyBub24tQVNDSUkgYnkgbm90aGluZ1xuICAgICAgICAgICAgICBuZXdwYXJ0ICs9ICd4JztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG5ld3BhcnQgKz0gcGFydFtqXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gd2UgdGVzdCBhZ2FpbiB3aXRoIEFTQ0lJIGNoYXIgb25seVxuICAgICAgICAgIGlmICghbmV3cGFydC5tYXRjaChob3N0bmFtZVBhcnRQYXR0ZXJuKSkge1xuICAgICAgICAgICAgdmFyIHZhbGlkUGFydHMgPSBob3N0cGFydHMuc2xpY2UoMCwgaSk7XG4gICAgICAgICAgICB2YXIgbm90SG9zdCA9IGhvc3RwYXJ0cy5zbGljZShpICsgMSk7XG4gICAgICAgICAgICB2YXIgYml0ID0gcGFydC5tYXRjaChob3N0bmFtZVBhcnRTdGFydCk7XG4gICAgICAgICAgICBpZiAoYml0KSB7XG4gICAgICAgICAgICAgIHZhbGlkUGFydHMucHVzaChiaXRbMV0pO1xuICAgICAgICAgICAgICBub3RIb3N0LnVuc2hpZnQoYml0WzJdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChub3RIb3N0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICByZXN0ID0gJy8nICsgbm90SG9zdC5qb2luKCcuJykgKyByZXN0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5ob3N0bmFtZSA9IHZhbGlkUGFydHMuam9pbignLicpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaG9zdG5hbWUubGVuZ3RoID4gaG9zdG5hbWVNYXhMZW4pIHtcbiAgICAgIHRoaXMuaG9zdG5hbWUgPSAnJztcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gaG9zdG5hbWVzIGFyZSBhbHdheXMgbG93ZXIgY2FzZS5cbiAgICAgIHRoaXMuaG9zdG5hbWUgPSB0aGlzLmhvc3RuYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuXG4gICAgaWYgKCFpcHY2SG9zdG5hbWUpIHtcbiAgICAgIC8vIElETkEgU3VwcG9ydDogUmV0dXJucyBhIHB1bnljb2RlZCByZXByZXNlbnRhdGlvbiBvZiBcImRvbWFpblwiLlxuICAgICAgLy8gSXQgb25seSBjb252ZXJ0cyBwYXJ0cyBvZiB0aGUgZG9tYWluIG5hbWUgdGhhdFxuICAgICAgLy8gaGF2ZSBub24tQVNDSUkgY2hhcmFjdGVycywgaS5lLiBpdCBkb2Vzbid0IG1hdHRlciBpZlxuICAgICAgLy8geW91IGNhbGwgaXQgd2l0aCBhIGRvbWFpbiB0aGF0IGFscmVhZHkgaXMgQVNDSUktb25seS5cbiAgICAgIHRoaXMuaG9zdG5hbWUgPSBwdW55Y29kZS50b0FTQ0lJKHRoaXMuaG9zdG5hbWUpO1xuICAgIH1cblxuICAgIHZhciBwID0gdGhpcy5wb3J0ID8gJzonICsgdGhpcy5wb3J0IDogJyc7XG4gICAgdmFyIGggPSB0aGlzLmhvc3RuYW1lIHx8ICcnO1xuICAgIHRoaXMuaG9zdCA9IGggKyBwO1xuICAgIHRoaXMuaHJlZiArPSB0aGlzLmhvc3Q7XG5cbiAgICAvLyBzdHJpcCBbIGFuZCBdIGZyb20gdGhlIGhvc3RuYW1lXG4gICAgLy8gdGhlIGhvc3QgZmllbGQgc3RpbGwgcmV0YWlucyB0aGVtLCB0aG91Z2hcbiAgICBpZiAoaXB2Nkhvc3RuYW1lKSB7XG4gICAgICB0aGlzLmhvc3RuYW1lID0gdGhpcy5ob3N0bmFtZS5zdWJzdHIoMSwgdGhpcy5ob3N0bmFtZS5sZW5ndGggLSAyKTtcbiAgICAgIGlmIChyZXN0WzBdICE9PSAnLycpIHtcbiAgICAgICAgcmVzdCA9ICcvJyArIHJlc3Q7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gbm93IHJlc3QgaXMgc2V0IHRvIHRoZSBwb3N0LWhvc3Qgc3R1ZmYuXG4gIC8vIGNob3Agb2ZmIGFueSBkZWxpbSBjaGFycy5cbiAgaWYgKCF1bnNhZmVQcm90b2NvbFtsb3dlclByb3RvXSkge1xuXG4gICAgLy8gRmlyc3QsIG1ha2UgMTAwJSBzdXJlIHRoYXQgYW55IFwiYXV0b0VzY2FwZVwiIGNoYXJzIGdldFxuICAgIC8vIGVzY2FwZWQsIGV2ZW4gaWYgZW5jb2RlVVJJQ29tcG9uZW50IGRvZXNuJ3QgdGhpbmsgdGhleVxuICAgIC8vIG5lZWQgdG8gYmUuXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBhdXRvRXNjYXBlLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgdmFyIGFlID0gYXV0b0VzY2FwZVtpXTtcbiAgICAgIGlmIChyZXN0LmluZGV4T2YoYWUpID09PSAtMSlcbiAgICAgICAgY29udGludWU7XG4gICAgICB2YXIgZXNjID0gZW5jb2RlVVJJQ29tcG9uZW50KGFlKTtcbiAgICAgIGlmIChlc2MgPT09IGFlKSB7XG4gICAgICAgIGVzYyA9IGVzY2FwZShhZSk7XG4gICAgICB9XG4gICAgICByZXN0ID0gcmVzdC5zcGxpdChhZSkuam9pbihlc2MpO1xuICAgIH1cbiAgfVxuXG5cbiAgLy8gY2hvcCBvZmYgZnJvbSB0aGUgdGFpbCBmaXJzdC5cbiAgdmFyIGhhc2ggPSByZXN0LmluZGV4T2YoJyMnKTtcbiAgaWYgKGhhc2ggIT09IC0xKSB7XG4gICAgLy8gZ290IGEgZnJhZ21lbnQgc3RyaW5nLlxuICAgIHRoaXMuaGFzaCA9IHJlc3Quc3Vic3RyKGhhc2gpO1xuICAgIHJlc3QgPSByZXN0LnNsaWNlKDAsIGhhc2gpO1xuICB9XG4gIHZhciBxbSA9IHJlc3QuaW5kZXhPZignPycpO1xuICBpZiAocW0gIT09IC0xKSB7XG4gICAgdGhpcy5zZWFyY2ggPSByZXN0LnN1YnN0cihxbSk7XG4gICAgdGhpcy5xdWVyeSA9IHJlc3Quc3Vic3RyKHFtICsgMSk7XG4gICAgaWYgKHBhcnNlUXVlcnlTdHJpbmcpIHtcbiAgICAgIHRoaXMucXVlcnkgPSBxdWVyeXN0cmluZy5wYXJzZSh0aGlzLnF1ZXJ5KTtcbiAgICB9XG4gICAgcmVzdCA9IHJlc3Quc2xpY2UoMCwgcW0pO1xuICB9IGVsc2UgaWYgKHBhcnNlUXVlcnlTdHJpbmcpIHtcbiAgICAvLyBubyBxdWVyeSBzdHJpbmcsIGJ1dCBwYXJzZVF1ZXJ5U3RyaW5nIHN0aWxsIHJlcXVlc3RlZFxuICAgIHRoaXMuc2VhcmNoID0gJyc7XG4gICAgdGhpcy5xdWVyeSA9IHt9O1xuICB9XG4gIGlmIChyZXN0KSB0aGlzLnBhdGhuYW1lID0gcmVzdDtcbiAgaWYgKHNsYXNoZWRQcm90b2NvbFtsb3dlclByb3RvXSAmJlxuICAgICAgdGhpcy5ob3N0bmFtZSAmJiAhdGhpcy5wYXRobmFtZSkge1xuICAgIHRoaXMucGF0aG5hbWUgPSAnLyc7XG4gIH1cblxuICAvL3RvIHN1cHBvcnQgaHR0cC5yZXF1ZXN0XG4gIGlmICh0aGlzLnBhdGhuYW1lIHx8IHRoaXMuc2VhcmNoKSB7XG4gICAgdmFyIHAgPSB0aGlzLnBhdGhuYW1lIHx8ICcnO1xuICAgIHZhciBzID0gdGhpcy5zZWFyY2ggfHwgJyc7XG4gICAgdGhpcy5wYXRoID0gcCArIHM7XG4gIH1cblxuICAvLyBmaW5hbGx5LCByZWNvbnN0cnVjdCB0aGUgaHJlZiBiYXNlZCBvbiB3aGF0IGhhcyBiZWVuIHZhbGlkYXRlZC5cbiAgdGhpcy5ocmVmID0gdGhpcy5mb3JtYXQoKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBmb3JtYXQgYSBwYXJzZWQgb2JqZWN0IGludG8gYSB1cmwgc3RyaW5nXG5mdW5jdGlvbiB1cmxGb3JtYXQob2JqKSB7XG4gIC8vIGVuc3VyZSBpdCdzIGFuIG9iamVjdCwgYW5kIG5vdCBhIHN0cmluZyB1cmwuXG4gIC8vIElmIGl0J3MgYW4gb2JqLCB0aGlzIGlzIGEgbm8tb3AuXG4gIC8vIHRoaXMgd2F5LCB5b3UgY2FuIGNhbGwgdXJsX2Zvcm1hdCgpIG9uIHN0cmluZ3NcbiAgLy8gdG8gY2xlYW4gdXAgcG90ZW50aWFsbHkgd29ua3kgdXJscy5cbiAgaWYgKHV0aWwuaXNTdHJpbmcob2JqKSkgb2JqID0gdXJsUGFyc2Uob2JqKTtcbiAgaWYgKCEob2JqIGluc3RhbmNlb2YgVXJsKSkgcmV0dXJuIFVybC5wcm90b3R5cGUuZm9ybWF0LmNhbGwob2JqKTtcbiAgcmV0dXJuIG9iai5mb3JtYXQoKTtcbn1cblxuVXJsLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGF1dGggPSB0aGlzLmF1dGggfHwgJyc7XG4gIGlmIChhdXRoKSB7XG4gICAgYXV0aCA9IGVuY29kZVVSSUNvbXBvbmVudChhdXRoKTtcbiAgICBhdXRoID0gYXV0aC5yZXBsYWNlKC8lM0EvaSwgJzonKTtcbiAgICBhdXRoICs9ICdAJztcbiAgfVxuXG4gIHZhciBwcm90b2NvbCA9IHRoaXMucHJvdG9jb2wgfHwgJycsXG4gICAgICBwYXRobmFtZSA9IHRoaXMucGF0aG5hbWUgfHwgJycsXG4gICAgICBoYXNoID0gdGhpcy5oYXNoIHx8ICcnLFxuICAgICAgaG9zdCA9IGZhbHNlLFxuICAgICAgcXVlcnkgPSAnJztcblxuICBpZiAodGhpcy5ob3N0KSB7XG4gICAgaG9zdCA9IGF1dGggKyB0aGlzLmhvc3Q7XG4gIH0gZWxzZSBpZiAodGhpcy5ob3N0bmFtZSkge1xuICAgIGhvc3QgPSBhdXRoICsgKHRoaXMuaG9zdG5hbWUuaW5kZXhPZignOicpID09PSAtMSA/XG4gICAgICAgIHRoaXMuaG9zdG5hbWUgOlxuICAgICAgICAnWycgKyB0aGlzLmhvc3RuYW1lICsgJ10nKTtcbiAgICBpZiAodGhpcy5wb3J0KSB7XG4gICAgICBob3N0ICs9ICc6JyArIHRoaXMucG9ydDtcbiAgICB9XG4gIH1cblxuICBpZiAodGhpcy5xdWVyeSAmJlxuICAgICAgdXRpbC5pc09iamVjdCh0aGlzLnF1ZXJ5KSAmJlxuICAgICAgT2JqZWN0LmtleXModGhpcy5xdWVyeSkubGVuZ3RoKSB7XG4gICAgcXVlcnkgPSBxdWVyeXN0cmluZy5zdHJpbmdpZnkodGhpcy5xdWVyeSk7XG4gIH1cblxuICB2YXIgc2VhcmNoID0gdGhpcy5zZWFyY2ggfHwgKHF1ZXJ5ICYmICgnPycgKyBxdWVyeSkpIHx8ICcnO1xuXG4gIGlmIChwcm90b2NvbCAmJiBwcm90b2NvbC5zdWJzdHIoLTEpICE9PSAnOicpIHByb3RvY29sICs9ICc6JztcblxuICAvLyBvbmx5IHRoZSBzbGFzaGVkUHJvdG9jb2xzIGdldCB0aGUgLy8uICBOb3QgbWFpbHRvOiwgeG1wcDosIGV0Yy5cbiAgLy8gdW5sZXNzIHRoZXkgaGFkIHRoZW0gdG8gYmVnaW4gd2l0aC5cbiAgaWYgKHRoaXMuc2xhc2hlcyB8fFxuICAgICAgKCFwcm90b2NvbCB8fCBzbGFzaGVkUHJvdG9jb2xbcHJvdG9jb2xdKSAmJiBob3N0ICE9PSBmYWxzZSkge1xuICAgIGhvc3QgPSAnLy8nICsgKGhvc3QgfHwgJycpO1xuICAgIGlmIChwYXRobmFtZSAmJiBwYXRobmFtZS5jaGFyQXQoMCkgIT09ICcvJykgcGF0aG5hbWUgPSAnLycgKyBwYXRobmFtZTtcbiAgfSBlbHNlIGlmICghaG9zdCkge1xuICAgIGhvc3QgPSAnJztcbiAgfVxuXG4gIGlmIChoYXNoICYmIGhhc2guY2hhckF0KDApICE9PSAnIycpIGhhc2ggPSAnIycgKyBoYXNoO1xuICBpZiAoc2VhcmNoICYmIHNlYXJjaC5jaGFyQXQoMCkgIT09ICc/Jykgc2VhcmNoID0gJz8nICsgc2VhcmNoO1xuXG4gIHBhdGhuYW1lID0gcGF0aG5hbWUucmVwbGFjZSgvWz8jXS9nLCBmdW5jdGlvbihtYXRjaCkge1xuICAgIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQobWF0Y2gpO1xuICB9KTtcbiAgc2VhcmNoID0gc2VhcmNoLnJlcGxhY2UoJyMnLCAnJTIzJyk7XG5cbiAgcmV0dXJuIHByb3RvY29sICsgaG9zdCArIHBhdGhuYW1lICsgc2VhcmNoICsgaGFzaDtcbn07XG5cbmZ1bmN0aW9uIHVybFJlc29sdmUoc291cmNlLCByZWxhdGl2ZSkge1xuICByZXR1cm4gdXJsUGFyc2Uoc291cmNlLCBmYWxzZSwgdHJ1ZSkucmVzb2x2ZShyZWxhdGl2ZSk7XG59XG5cblVybC5wcm90b3R5cGUucmVzb2x2ZSA9IGZ1bmN0aW9uKHJlbGF0aXZlKSB7XG4gIHJldHVybiB0aGlzLnJlc29sdmVPYmplY3QodXJsUGFyc2UocmVsYXRpdmUsIGZhbHNlLCB0cnVlKSkuZm9ybWF0KCk7XG59O1xuXG5mdW5jdGlvbiB1cmxSZXNvbHZlT2JqZWN0KHNvdXJjZSwgcmVsYXRpdmUpIHtcbiAgaWYgKCFzb3VyY2UpIHJldHVybiByZWxhdGl2ZTtcbiAgcmV0dXJuIHVybFBhcnNlKHNvdXJjZSwgZmFsc2UsIHRydWUpLnJlc29sdmVPYmplY3QocmVsYXRpdmUpO1xufVxuXG5VcmwucHJvdG90eXBlLnJlc29sdmVPYmplY3QgPSBmdW5jdGlvbihyZWxhdGl2ZSkge1xuICBpZiAodXRpbC5pc1N0cmluZyhyZWxhdGl2ZSkpIHtcbiAgICB2YXIgcmVsID0gbmV3IFVybCgpO1xuICAgIHJlbC5wYXJzZShyZWxhdGl2ZSwgZmFsc2UsIHRydWUpO1xuICAgIHJlbGF0aXZlID0gcmVsO1xuICB9XG5cbiAgdmFyIHJlc3VsdCA9IG5ldyBVcmwoKTtcbiAgdmFyIHRrZXlzID0gT2JqZWN0LmtleXModGhpcyk7XG4gIGZvciAodmFyIHRrID0gMDsgdGsgPCB0a2V5cy5sZW5ndGg7IHRrKyspIHtcbiAgICB2YXIgdGtleSA9IHRrZXlzW3RrXTtcbiAgICByZXN1bHRbdGtleV0gPSB0aGlzW3RrZXldO1xuICB9XG5cbiAgLy8gaGFzaCBpcyBhbHdheXMgb3ZlcnJpZGRlbiwgbm8gbWF0dGVyIHdoYXQuXG4gIC8vIGV2ZW4gaHJlZj1cIlwiIHdpbGwgcmVtb3ZlIGl0LlxuICByZXN1bHQuaGFzaCA9IHJlbGF0aXZlLmhhc2g7XG5cbiAgLy8gaWYgdGhlIHJlbGF0aXZlIHVybCBpcyBlbXB0eSwgdGhlbiB0aGVyZSdzIG5vdGhpbmcgbGVmdCB0byBkbyBoZXJlLlxuICBpZiAocmVsYXRpdmUuaHJlZiA9PT0gJycpIHtcbiAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLy8gaHJlZnMgbGlrZSAvL2Zvby9iYXIgYWx3YXlzIGN1dCB0byB0aGUgcHJvdG9jb2wuXG4gIGlmIChyZWxhdGl2ZS5zbGFzaGVzICYmICFyZWxhdGl2ZS5wcm90b2NvbCkge1xuICAgIC8vIHRha2UgZXZlcnl0aGluZyBleGNlcHQgdGhlIHByb3RvY29sIGZyb20gcmVsYXRpdmVcbiAgICB2YXIgcmtleXMgPSBPYmplY3Qua2V5cyhyZWxhdGl2ZSk7XG4gICAgZm9yICh2YXIgcmsgPSAwOyByayA8IHJrZXlzLmxlbmd0aDsgcmsrKykge1xuICAgICAgdmFyIHJrZXkgPSBya2V5c1tya107XG4gICAgICBpZiAocmtleSAhPT0gJ3Byb3RvY29sJylcbiAgICAgICAgcmVzdWx0W3JrZXldID0gcmVsYXRpdmVbcmtleV07XG4gICAgfVxuXG4gICAgLy91cmxQYXJzZSBhcHBlbmRzIHRyYWlsaW5nIC8gdG8gdXJscyBsaWtlIGh0dHA6Ly93d3cuZXhhbXBsZS5jb21cbiAgICBpZiAoc2xhc2hlZFByb3RvY29sW3Jlc3VsdC5wcm90b2NvbF0gJiZcbiAgICAgICAgcmVzdWx0Lmhvc3RuYW1lICYmICFyZXN1bHQucGF0aG5hbWUpIHtcbiAgICAgIHJlc3VsdC5wYXRoID0gcmVzdWx0LnBhdGhuYW1lID0gJy8nO1xuICAgIH1cblxuICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBpZiAocmVsYXRpdmUucHJvdG9jb2wgJiYgcmVsYXRpdmUucHJvdG9jb2wgIT09IHJlc3VsdC5wcm90b2NvbCkge1xuICAgIC8vIGlmIGl0J3MgYSBrbm93biB1cmwgcHJvdG9jb2wsIHRoZW4gY2hhbmdpbmdcbiAgICAvLyB0aGUgcHJvdG9jb2wgZG9lcyB3ZWlyZCB0aGluZ3NcbiAgICAvLyBmaXJzdCwgaWYgaXQncyBub3QgZmlsZTosIHRoZW4gd2UgTVVTVCBoYXZlIGEgaG9zdCxcbiAgICAvLyBhbmQgaWYgdGhlcmUgd2FzIGEgcGF0aFxuICAgIC8vIHRvIGJlZ2luIHdpdGgsIHRoZW4gd2UgTVVTVCBoYXZlIGEgcGF0aC5cbiAgICAvLyBpZiBpdCBpcyBmaWxlOiwgdGhlbiB0aGUgaG9zdCBpcyBkcm9wcGVkLFxuICAgIC8vIGJlY2F1c2UgdGhhdCdzIGtub3duIHRvIGJlIGhvc3RsZXNzLlxuICAgIC8vIGFueXRoaW5nIGVsc2UgaXMgYXNzdW1lZCB0byBiZSBhYnNvbHV0ZS5cbiAgICBpZiAoIXNsYXNoZWRQcm90b2NvbFtyZWxhdGl2ZS5wcm90b2NvbF0pIHtcbiAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMocmVsYXRpdmUpO1xuICAgICAgZm9yICh2YXIgdiA9IDA7IHYgPCBrZXlzLmxlbmd0aDsgdisrKSB7XG4gICAgICAgIHZhciBrID0ga2V5c1t2XTtcbiAgICAgICAgcmVzdWx0W2tdID0gcmVsYXRpdmVba107XG4gICAgICB9XG4gICAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgcmVzdWx0LnByb3RvY29sID0gcmVsYXRpdmUucHJvdG9jb2w7XG4gICAgaWYgKCFyZWxhdGl2ZS5ob3N0ICYmICFob3N0bGVzc1Byb3RvY29sW3JlbGF0aXZlLnByb3RvY29sXSkge1xuICAgICAgdmFyIHJlbFBhdGggPSAocmVsYXRpdmUucGF0aG5hbWUgfHwgJycpLnNwbGl0KCcvJyk7XG4gICAgICB3aGlsZSAocmVsUGF0aC5sZW5ndGggJiYgIShyZWxhdGl2ZS5ob3N0ID0gcmVsUGF0aC5zaGlmdCgpKSk7XG4gICAgICBpZiAoIXJlbGF0aXZlLmhvc3QpIHJlbGF0aXZlLmhvc3QgPSAnJztcbiAgICAgIGlmICghcmVsYXRpdmUuaG9zdG5hbWUpIHJlbGF0aXZlLmhvc3RuYW1lID0gJyc7XG4gICAgICBpZiAocmVsUGF0aFswXSAhPT0gJycpIHJlbFBhdGgudW5zaGlmdCgnJyk7XG4gICAgICBpZiAocmVsUGF0aC5sZW5ndGggPCAyKSByZWxQYXRoLnVuc2hpZnQoJycpO1xuICAgICAgcmVzdWx0LnBhdGhuYW1lID0gcmVsUGF0aC5qb2luKCcvJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdC5wYXRobmFtZSA9IHJlbGF0aXZlLnBhdGhuYW1lO1xuICAgIH1cbiAgICByZXN1bHQuc2VhcmNoID0gcmVsYXRpdmUuc2VhcmNoO1xuICAgIHJlc3VsdC5xdWVyeSA9IHJlbGF0aXZlLnF1ZXJ5O1xuICAgIHJlc3VsdC5ob3N0ID0gcmVsYXRpdmUuaG9zdCB8fCAnJztcbiAgICByZXN1bHQuYXV0aCA9IHJlbGF0aXZlLmF1dGg7XG4gICAgcmVzdWx0Lmhvc3RuYW1lID0gcmVsYXRpdmUuaG9zdG5hbWUgfHwgcmVsYXRpdmUuaG9zdDtcbiAgICByZXN1bHQucG9ydCA9IHJlbGF0aXZlLnBvcnQ7XG4gICAgLy8gdG8gc3VwcG9ydCBodHRwLnJlcXVlc3RcbiAgICBpZiAocmVzdWx0LnBhdGhuYW1lIHx8IHJlc3VsdC5zZWFyY2gpIHtcbiAgICAgIHZhciBwID0gcmVzdWx0LnBhdGhuYW1lIHx8ICcnO1xuICAgICAgdmFyIHMgPSByZXN1bHQuc2VhcmNoIHx8ICcnO1xuICAgICAgcmVzdWx0LnBhdGggPSBwICsgcztcbiAgICB9XG4gICAgcmVzdWx0LnNsYXNoZXMgPSByZXN1bHQuc2xhc2hlcyB8fCByZWxhdGl2ZS5zbGFzaGVzO1xuICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICB2YXIgaXNTb3VyY2VBYnMgPSAocmVzdWx0LnBhdGhuYW1lICYmIHJlc3VsdC5wYXRobmFtZS5jaGFyQXQoMCkgPT09ICcvJyksXG4gICAgICBpc1JlbEFicyA9IChcbiAgICAgICAgICByZWxhdGl2ZS5ob3N0IHx8XG4gICAgICAgICAgcmVsYXRpdmUucGF0aG5hbWUgJiYgcmVsYXRpdmUucGF0aG5hbWUuY2hhckF0KDApID09PSAnLydcbiAgICAgICksXG4gICAgICBtdXN0RW5kQWJzID0gKGlzUmVsQWJzIHx8IGlzU291cmNlQWJzIHx8XG4gICAgICAgICAgICAgICAgICAgIChyZXN1bHQuaG9zdCAmJiByZWxhdGl2ZS5wYXRobmFtZSkpLFxuICAgICAgcmVtb3ZlQWxsRG90cyA9IG11c3RFbmRBYnMsXG4gICAgICBzcmNQYXRoID0gcmVzdWx0LnBhdGhuYW1lICYmIHJlc3VsdC5wYXRobmFtZS5zcGxpdCgnLycpIHx8IFtdLFxuICAgICAgcmVsUGF0aCA9IHJlbGF0aXZlLnBhdGhuYW1lICYmIHJlbGF0aXZlLnBhdGhuYW1lLnNwbGl0KCcvJykgfHwgW10sXG4gICAgICBwc3ljaG90aWMgPSByZXN1bHQucHJvdG9jb2wgJiYgIXNsYXNoZWRQcm90b2NvbFtyZXN1bHQucHJvdG9jb2xdO1xuXG4gIC8vIGlmIHRoZSB1cmwgaXMgYSBub24tc2xhc2hlZCB1cmwsIHRoZW4gcmVsYXRpdmVcbiAgLy8gbGlua3MgbGlrZSAuLi8uLiBzaG91bGQgYmUgYWJsZVxuICAvLyB0byBjcmF3bCB1cCB0byB0aGUgaG9zdG5hbWUsIGFzIHdlbGwuICBUaGlzIGlzIHN0cmFuZ2UuXG4gIC8vIHJlc3VsdC5wcm90b2NvbCBoYXMgYWxyZWFkeSBiZWVuIHNldCBieSBub3cuXG4gIC8vIExhdGVyIG9uLCBwdXQgdGhlIGZpcnN0IHBhdGggcGFydCBpbnRvIHRoZSBob3N0IGZpZWxkLlxuICBpZiAocHN5Y2hvdGljKSB7XG4gICAgcmVzdWx0Lmhvc3RuYW1lID0gJyc7XG4gICAgcmVzdWx0LnBvcnQgPSBudWxsO1xuICAgIGlmIChyZXN1bHQuaG9zdCkge1xuICAgICAgaWYgKHNyY1BhdGhbMF0gPT09ICcnKSBzcmNQYXRoWzBdID0gcmVzdWx0Lmhvc3Q7XG4gICAgICBlbHNlIHNyY1BhdGgudW5zaGlmdChyZXN1bHQuaG9zdCk7XG4gICAgfVxuICAgIHJlc3VsdC5ob3N0ID0gJyc7XG4gICAgaWYgKHJlbGF0aXZlLnByb3RvY29sKSB7XG4gICAgICByZWxhdGl2ZS5ob3N0bmFtZSA9IG51bGw7XG4gICAgICByZWxhdGl2ZS5wb3J0ID0gbnVsbDtcbiAgICAgIGlmIChyZWxhdGl2ZS5ob3N0KSB7XG4gICAgICAgIGlmIChyZWxQYXRoWzBdID09PSAnJykgcmVsUGF0aFswXSA9IHJlbGF0aXZlLmhvc3Q7XG4gICAgICAgIGVsc2UgcmVsUGF0aC51bnNoaWZ0KHJlbGF0aXZlLmhvc3QpO1xuICAgICAgfVxuICAgICAgcmVsYXRpdmUuaG9zdCA9IG51bGw7XG4gICAgfVxuICAgIG11c3RFbmRBYnMgPSBtdXN0RW5kQWJzICYmIChyZWxQYXRoWzBdID09PSAnJyB8fCBzcmNQYXRoWzBdID09PSAnJyk7XG4gIH1cblxuICBpZiAoaXNSZWxBYnMpIHtcbiAgICAvLyBpdCdzIGFic29sdXRlLlxuICAgIHJlc3VsdC5ob3N0ID0gKHJlbGF0aXZlLmhvc3QgfHwgcmVsYXRpdmUuaG9zdCA9PT0gJycpID9cbiAgICAgICAgICAgICAgICAgIHJlbGF0aXZlLmhvc3QgOiByZXN1bHQuaG9zdDtcbiAgICByZXN1bHQuaG9zdG5hbWUgPSAocmVsYXRpdmUuaG9zdG5hbWUgfHwgcmVsYXRpdmUuaG9zdG5hbWUgPT09ICcnKSA/XG4gICAgICAgICAgICAgICAgICAgICAgcmVsYXRpdmUuaG9zdG5hbWUgOiByZXN1bHQuaG9zdG5hbWU7XG4gICAgcmVzdWx0LnNlYXJjaCA9IHJlbGF0aXZlLnNlYXJjaDtcbiAgICByZXN1bHQucXVlcnkgPSByZWxhdGl2ZS5xdWVyeTtcbiAgICBzcmNQYXRoID0gcmVsUGF0aDtcbiAgICAvLyBmYWxsIHRocm91Z2ggdG8gdGhlIGRvdC1oYW5kbGluZyBiZWxvdy5cbiAgfSBlbHNlIGlmIChyZWxQYXRoLmxlbmd0aCkge1xuICAgIC8vIGl0J3MgcmVsYXRpdmVcbiAgICAvLyB0aHJvdyBhd2F5IHRoZSBleGlzdGluZyBmaWxlLCBhbmQgdGFrZSB0aGUgbmV3IHBhdGggaW5zdGVhZC5cbiAgICBpZiAoIXNyY1BhdGgpIHNyY1BhdGggPSBbXTtcbiAgICBzcmNQYXRoLnBvcCgpO1xuICAgIHNyY1BhdGggPSBzcmNQYXRoLmNvbmNhdChyZWxQYXRoKTtcbiAgICByZXN1bHQuc2VhcmNoID0gcmVsYXRpdmUuc2VhcmNoO1xuICAgIHJlc3VsdC5xdWVyeSA9IHJlbGF0aXZlLnF1ZXJ5O1xuICB9IGVsc2UgaWYgKCF1dGlsLmlzTnVsbE9yVW5kZWZpbmVkKHJlbGF0aXZlLnNlYXJjaCkpIHtcbiAgICAvLyBqdXN0IHB1bGwgb3V0IHRoZSBzZWFyY2guXG4gICAgLy8gbGlrZSBocmVmPSc/Zm9vJy5cbiAgICAvLyBQdXQgdGhpcyBhZnRlciB0aGUgb3RoZXIgdHdvIGNhc2VzIGJlY2F1c2UgaXQgc2ltcGxpZmllcyB0aGUgYm9vbGVhbnNcbiAgICBpZiAocHN5Y2hvdGljKSB7XG4gICAgICByZXN1bHQuaG9zdG5hbWUgPSByZXN1bHQuaG9zdCA9IHNyY1BhdGguc2hpZnQoKTtcbiAgICAgIC8vb2NjYXRpb25hbHkgdGhlIGF1dGggY2FuIGdldCBzdHVjayBvbmx5IGluIGhvc3RcbiAgICAgIC8vdGhpcyBlc3BlY2lhbGx5IGhhcHBlbnMgaW4gY2FzZXMgbGlrZVxuICAgICAgLy91cmwucmVzb2x2ZU9iamVjdCgnbWFpbHRvOmxvY2FsMUBkb21haW4xJywgJ2xvY2FsMkBkb21haW4yJylcbiAgICAgIHZhciBhdXRoSW5Ib3N0ID0gcmVzdWx0Lmhvc3QgJiYgcmVzdWx0Lmhvc3QuaW5kZXhPZignQCcpID4gMCA/XG4gICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5ob3N0LnNwbGl0KCdAJykgOiBmYWxzZTtcbiAgICAgIGlmIChhdXRoSW5Ib3N0KSB7XG4gICAgICAgIHJlc3VsdC5hdXRoID0gYXV0aEluSG9zdC5zaGlmdCgpO1xuICAgICAgICByZXN1bHQuaG9zdCA9IHJlc3VsdC5ob3N0bmFtZSA9IGF1dGhJbkhvc3Quc2hpZnQoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmVzdWx0LnNlYXJjaCA9IHJlbGF0aXZlLnNlYXJjaDtcbiAgICByZXN1bHQucXVlcnkgPSByZWxhdGl2ZS5xdWVyeTtcbiAgICAvL3RvIHN1cHBvcnQgaHR0cC5yZXF1ZXN0XG4gICAgaWYgKCF1dGlsLmlzTnVsbChyZXN1bHQucGF0aG5hbWUpIHx8ICF1dGlsLmlzTnVsbChyZXN1bHQuc2VhcmNoKSkge1xuICAgICAgcmVzdWx0LnBhdGggPSAocmVzdWx0LnBhdGhuYW1lID8gcmVzdWx0LnBhdGhuYW1lIDogJycpICtcbiAgICAgICAgICAgICAgICAgICAgKHJlc3VsdC5zZWFyY2ggPyByZXN1bHQuc2VhcmNoIDogJycpO1xuICAgIH1cbiAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgaWYgKCFzcmNQYXRoLmxlbmd0aCkge1xuICAgIC8vIG5vIHBhdGggYXQgYWxsLiAgZWFzeS5cbiAgICAvLyB3ZSd2ZSBhbHJlYWR5IGhhbmRsZWQgdGhlIG90aGVyIHN0dWZmIGFib3ZlLlxuICAgIHJlc3VsdC5wYXRobmFtZSA9IG51bGw7XG4gICAgLy90byBzdXBwb3J0IGh0dHAucmVxdWVzdFxuICAgIGlmIChyZXN1bHQuc2VhcmNoKSB7XG4gICAgICByZXN1bHQucGF0aCA9ICcvJyArIHJlc3VsdC5zZWFyY2g7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdC5wYXRoID0gbnVsbDtcbiAgICB9XG4gICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8vIGlmIGEgdXJsIEVORHMgaW4gLiBvciAuLiwgdGhlbiBpdCBtdXN0IGdldCBhIHRyYWlsaW5nIHNsYXNoLlxuICAvLyBob3dldmVyLCBpZiBpdCBlbmRzIGluIGFueXRoaW5nIGVsc2Ugbm9uLXNsYXNoeSxcbiAgLy8gdGhlbiBpdCBtdXN0IE5PVCBnZXQgYSB0cmFpbGluZyBzbGFzaC5cbiAgdmFyIGxhc3QgPSBzcmNQYXRoLnNsaWNlKC0xKVswXTtcbiAgdmFyIGhhc1RyYWlsaW5nU2xhc2ggPSAoXG4gICAgICAocmVzdWx0Lmhvc3QgfHwgcmVsYXRpdmUuaG9zdCB8fCBzcmNQYXRoLmxlbmd0aCA+IDEpICYmXG4gICAgICAobGFzdCA9PT0gJy4nIHx8IGxhc3QgPT09ICcuLicpIHx8IGxhc3QgPT09ICcnKTtcblxuICAvLyBzdHJpcCBzaW5nbGUgZG90cywgcmVzb2x2ZSBkb3VibGUgZG90cyB0byBwYXJlbnQgZGlyXG4gIC8vIGlmIHRoZSBwYXRoIHRyaWVzIHRvIGdvIGFib3ZlIHRoZSByb290LCBgdXBgIGVuZHMgdXAgPiAwXG4gIHZhciB1cCA9IDA7XG4gIGZvciAodmFyIGkgPSBzcmNQYXRoLmxlbmd0aDsgaSA+PSAwOyBpLS0pIHtcbiAgICBsYXN0ID0gc3JjUGF0aFtpXTtcbiAgICBpZiAobGFzdCA9PT0gJy4nKSB7XG4gICAgICBzcmNQYXRoLnNwbGljZShpLCAxKTtcbiAgICB9IGVsc2UgaWYgKGxhc3QgPT09ICcuLicpIHtcbiAgICAgIHNyY1BhdGguc3BsaWNlKGksIDEpO1xuICAgICAgdXArKztcbiAgICB9IGVsc2UgaWYgKHVwKSB7XG4gICAgICBzcmNQYXRoLnNwbGljZShpLCAxKTtcbiAgICAgIHVwLS07XG4gICAgfVxuICB9XG5cbiAgLy8gaWYgdGhlIHBhdGggaXMgYWxsb3dlZCB0byBnbyBhYm92ZSB0aGUgcm9vdCwgcmVzdG9yZSBsZWFkaW5nIC4uc1xuICBpZiAoIW11c3RFbmRBYnMgJiYgIXJlbW92ZUFsbERvdHMpIHtcbiAgICBmb3IgKDsgdXAtLTsgdXApIHtcbiAgICAgIHNyY1BhdGgudW5zaGlmdCgnLi4nKTtcbiAgICB9XG4gIH1cblxuICBpZiAobXVzdEVuZEFicyAmJiBzcmNQYXRoWzBdICE9PSAnJyAmJlxuICAgICAgKCFzcmNQYXRoWzBdIHx8IHNyY1BhdGhbMF0uY2hhckF0KDApICE9PSAnLycpKSB7XG4gICAgc3JjUGF0aC51bnNoaWZ0KCcnKTtcbiAgfVxuXG4gIGlmIChoYXNUcmFpbGluZ1NsYXNoICYmIChzcmNQYXRoLmpvaW4oJy8nKS5zdWJzdHIoLTEpICE9PSAnLycpKSB7XG4gICAgc3JjUGF0aC5wdXNoKCcnKTtcbiAgfVxuXG4gIHZhciBpc0Fic29sdXRlID0gc3JjUGF0aFswXSA9PT0gJycgfHxcbiAgICAgIChzcmNQYXRoWzBdICYmIHNyY1BhdGhbMF0uY2hhckF0KDApID09PSAnLycpO1xuXG4gIC8vIHB1dCB0aGUgaG9zdCBiYWNrXG4gIGlmIChwc3ljaG90aWMpIHtcbiAgICByZXN1bHQuaG9zdG5hbWUgPSByZXN1bHQuaG9zdCA9IGlzQWJzb2x1dGUgPyAnJyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmNQYXRoLmxlbmd0aCA/IHNyY1BhdGguc2hpZnQoKSA6ICcnO1xuICAgIC8vb2NjYXRpb25hbHkgdGhlIGF1dGggY2FuIGdldCBzdHVjayBvbmx5IGluIGhvc3RcbiAgICAvL3RoaXMgZXNwZWNpYWxseSBoYXBwZW5zIGluIGNhc2VzIGxpa2VcbiAgICAvL3VybC5yZXNvbHZlT2JqZWN0KCdtYWlsdG86bG9jYWwxQGRvbWFpbjEnLCAnbG9jYWwyQGRvbWFpbjInKVxuICAgIHZhciBhdXRoSW5Ib3N0ID0gcmVzdWx0Lmhvc3QgJiYgcmVzdWx0Lmhvc3QuaW5kZXhPZignQCcpID4gMCA/XG4gICAgICAgICAgICAgICAgICAgICByZXN1bHQuaG9zdC5zcGxpdCgnQCcpIDogZmFsc2U7XG4gICAgaWYgKGF1dGhJbkhvc3QpIHtcbiAgICAgIHJlc3VsdC5hdXRoID0gYXV0aEluSG9zdC5zaGlmdCgpO1xuICAgICAgcmVzdWx0Lmhvc3QgPSByZXN1bHQuaG9zdG5hbWUgPSBhdXRoSW5Ib3N0LnNoaWZ0KCk7XG4gICAgfVxuICB9XG5cbiAgbXVzdEVuZEFicyA9IG11c3RFbmRBYnMgfHwgKHJlc3VsdC5ob3N0ICYmIHNyY1BhdGgubGVuZ3RoKTtcblxuICBpZiAobXVzdEVuZEFicyAmJiAhaXNBYnNvbHV0ZSkge1xuICAgIHNyY1BhdGgudW5zaGlmdCgnJyk7XG4gIH1cblxuICBpZiAoIXNyY1BhdGgubGVuZ3RoKSB7XG4gICAgcmVzdWx0LnBhdGhuYW1lID0gbnVsbDtcbiAgICByZXN1bHQucGF0aCA9IG51bGw7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0LnBhdGhuYW1lID0gc3JjUGF0aC5qb2luKCcvJyk7XG4gIH1cblxuICAvL3RvIHN1cHBvcnQgcmVxdWVzdC5odHRwXG4gIGlmICghdXRpbC5pc051bGwocmVzdWx0LnBhdGhuYW1lKSB8fCAhdXRpbC5pc051bGwocmVzdWx0LnNlYXJjaCkpIHtcbiAgICByZXN1bHQucGF0aCA9IChyZXN1bHQucGF0aG5hbWUgPyByZXN1bHQucGF0aG5hbWUgOiAnJykgK1xuICAgICAgICAgICAgICAgICAgKHJlc3VsdC5zZWFyY2ggPyByZXN1bHQuc2VhcmNoIDogJycpO1xuICB9XG4gIHJlc3VsdC5hdXRoID0gcmVsYXRpdmUuYXV0aCB8fCByZXN1bHQuYXV0aDtcbiAgcmVzdWx0LnNsYXNoZXMgPSByZXN1bHQuc2xhc2hlcyB8fCByZWxhdGl2ZS5zbGFzaGVzO1xuICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cblVybC5wcm90b3R5cGUucGFyc2VIb3N0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBob3N0ID0gdGhpcy5ob3N0O1xuICB2YXIgcG9ydCA9IHBvcnRQYXR0ZXJuLmV4ZWMoaG9zdCk7XG4gIGlmIChwb3J0KSB7XG4gICAgcG9ydCA9IHBvcnRbMF07XG4gICAgaWYgKHBvcnQgIT09ICc6Jykge1xuICAgICAgdGhpcy5wb3J0ID0gcG9ydC5zdWJzdHIoMSk7XG4gICAgfVxuICAgIGhvc3QgPSBob3N0LnN1YnN0cigwLCBob3N0Lmxlbmd0aCAtIHBvcnQubGVuZ3RoKTtcbiAgfVxuICBpZiAoaG9zdCkgdGhpcy5ob3N0bmFtZSA9IGhvc3Q7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaXNTdHJpbmc6IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiB0eXBlb2YoYXJnKSA9PT0gJ3N0cmluZyc7XG4gIH0sXG4gIGlzT2JqZWN0OiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gdHlwZW9mKGFyZykgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbiAgfSxcbiAgaXNOdWxsOiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gYXJnID09PSBudWxsO1xuICB9LFxuICBpc051bGxPclVuZGVmaW5lZDogZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIGFyZyA9PSBudWxsO1xuICB9XG59O1xuIl19
