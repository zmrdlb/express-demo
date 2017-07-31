(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var Model = require('./model.js'),
    BaseView = require('core-baseview');

BaseView.register({
    _init: function _init() {
        /**
         * 普通单个请求
         *      这个配置说明加入全局网络主队列
             * customconfig: {
                 queue: true
             }
         */
        Model.listdata({
            data: { 'name': 'zmrdlb' }
            // customconfig: {
            //     queue: true
            // }
        }, {
            success: function success(data) {
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
        Model.main({
            data: { 'name': 'zmrdlb' }
            // customconfig: {
            //     queue: true
            // }
        }, {
            error: function error() {
                console.log('覆盖统一error处理');
            }
        }, {
            id: '1002'
        });

        //单独声明队列，接口按照队列顺序加载
        // Model.$interio.transQueueRequest([{
        //     ioargs: {
        //         url: Model.basehost+'/listdatas',
        //         method:'POST'
        //     },
        //     iocall: {
        //         error: function(){ //此接口本来什么都不返回，所以把默认错误提示覆盖了
        //             console.log('/listdatas error');
        //         }
        //     }
        // },{
        //     ioargs: {
        //         url: Model.basehost+'/listdata',
        //         method:'POST'
        //     },
        //     iocall: {
        //         success: function(data){
        //             console.log(data);
        //         }
        //     }
        // }], {
        //     complete: function(){
        //         console.log('队列全部完成')
        //     }
        // });
    }
});

},{"./model.js":2,"core-baseview":4}],2:[function(require,module,exports){
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

},{"./storage":3,"libio-interio":12,"libio-ioconfig":13}],3:[function(require,module,exports){
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

},{"libio-storage":14}],4:[function(require,module,exports){
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3Rvb2wvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInB1YmxpY1xcamF2YXNjcmlwdHNcXHBhZ2VcXGlvXFxpbmRleC5qcyIsInB1YmxpY1xcamF2YXNjcmlwdHNcXHBhZ2VcXGlvXFxtb2RlbC5qcyIsInB1YmxpY1xcamF2YXNjcmlwdHNcXHBhZ2VcXGlvXFxzdG9yYWdlLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcY29tbW9uXFxiYXNlLnZpZXcuanMiLCIuLi9ub2RlLWNvcmV1aS1wYy9qcy91aS91aS5hbGVydC5odG1sIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcdWlcXHVpLmFsZXJ0LmpzIiwiLi4vbm9kZS1jb3JldWktcGMvanMvdWkvdWkuY29uZmlybS5odG1sIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcdWlcXHVpLmNvbmZpcm0uanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx1aVxcdWkubGF5ZXIuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx1aVxcdWkubG9hZGluZy5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHVpXFx1aS50b2FzdC5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcaW9cXGludGVyaW8uanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXGlvXFxpb2NvbmZpZy5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcaW9cXHN0b3JhZ2UuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHVpXFxsYXllclxcYWxlcnQuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHVpXFxsYXllclxcYWxlcnRDb250cm9sLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1aVxcbGF5ZXJcXGFsZXJ0U2luZ2xlLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1aVxcbGF5ZXJcXGJhc2VDb250cm9sLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1aVxcbGF5ZXJcXGJvbWJMYXllci5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdWlcXGxheWVyXFxjb25maXJtLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1aVxcbGF5ZXJcXGNvbmZpcm1Db250cm9sLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1aVxcbGF5ZXJcXGNvbmZpcm1TaW5nbGUuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHVpXFxsYXllclxcbGF5ZXIuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHVpXFxsYXllclxcbWFzay5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdWlcXGxheWVyXFxwb3NpdGlvbkJvbWIuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHVpXFxsYXllclxcdHBsLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1dGlsXFxjc3NzdXBvcnQuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHV0aWxcXGRlbGF5ZXZ0LmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1dGlsXFxkZXZpY2VldnRuYW1lLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1dGlsXFxwdWJsaXNoZXJTLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1dGlsXFxyZXNpemUuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHV0aWxcXHJ3Y29udHJvbGxlci5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdXRpbFxcc2Nyb2xsLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1dGlsXFx0b29sLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1dGlsXFx3aW5yZXNpemUuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHV0aWxcXHdpbnNjcm9sbC5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdXRpbFxcd29ya2VyQ29udHJvbC5qcyIsIi4uL3Rvb2wvbm9kZV9tb2R1bGVzL3B1bnljb2RlL3B1bnljb2RlLmpzIiwiLi4vdG9vbC9ub2RlX21vZHVsZXMvcXVlcnlzdHJpbmctZXMzL2RlY29kZS5qcyIsIi4uL3Rvb2wvbm9kZV9tb2R1bGVzL3F1ZXJ5c3RyaW5nLWVzMy9lbmNvZGUuanMiLCIuLi90b29sL25vZGVfbW9kdWxlcy9xdWVyeXN0cmluZy1lczMvaW5kZXguanMiLCIuLi90b29sL25vZGVfbW9kdWxlcy91cmwvdXJsLmpzIiwiLi4vdG9vbC9ub2RlX21vZHVsZXMvdXJsL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQU0sUUFBUSxRQUFRLFlBQVIsQ0FBZDtBQUFBLElBQ00sV0FBVyxRQUFRLGVBQVIsQ0FEakI7O0FBR0EsU0FBUyxRQUFULENBQWtCO0FBQ2hCLFdBQU8saUJBQVU7QUFDYjs7Ozs7OztBQU9BLGNBQU0sUUFBTixDQUFlO0FBQ1gsa0JBQU0sRUFBQyxRQUFRLFFBQVQ7QUFDTjtBQUNBO0FBQ0E7QUFKVyxTQUFmLEVBS0U7QUFDRSxxQkFBUyxpQkFBUyxJQUFULEVBQWM7QUFDbkIsd0JBQVEsR0FBUixDQUFZLElBQVo7QUFDSDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVpGLFNBTEY7QUFtQkEsY0FBTSxJQUFOLENBQVc7QUFDUCxrQkFBTSxFQUFDLFFBQVEsUUFBVDtBQUNOO0FBQ0E7QUFDQTtBQUpPLFNBQVgsRUFLRTtBQUNFLG1CQUFPLGlCQUFVO0FBQ2Isd0JBQVEsR0FBUixDQUFZLGFBQVo7QUFDSDtBQUhILFNBTEYsRUFTRTtBQUNFLGdCQUFJO0FBRE4sU0FURjs7QUFjQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0g7QUFwRWUsQ0FBbEI7Ozs7O0FDSEE7Ozs7O0FBS0EsSUFBTSxXQUFXLFFBQVEsZ0JBQVIsQ0FBakI7QUFBQSxJQUNNLFVBQVUsUUFBUSxlQUFSLENBRGhCO0FBQUEsSUFFTSxVQUFVLFFBQVEsV0FBUixDQUZoQjs7QUFJQzs7O0FBR0EsU0FBUyxLQUFULENBQWUsTUFBZixHQUF3QixVQUFTLE1BQVQsRUFBZ0I7QUFDcEMsV0FBTyxPQUFPLElBQVAsSUFBZSxPQUF0QjtBQUNILENBRkQ7QUFHQSxTQUFTLEtBQVQsQ0FBZSxHQUFmLEdBQXFCLG1CQUFyQjs7QUFHQTs7O0FBR0EsU0FBUyxJQUFULENBQWMsTUFBZCxHQUF1QixVQUFTLE1BQVQsRUFBaUI7QUFDcEMsV0FBTyxPQUFPLElBQVAsSUFBZSxPQUF0QjtBQUNILENBRkQ7QUFHQSxTQUFTLE1BQVQsQ0FBZ0IsSUFBaEIsR0FBdUIsVUFBUyxNQUFULEVBQWdCO0FBQ25DLFNBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsT0FBTyxNQUFQLElBQWlCLE1BQWpDO0FBQ0gsQ0FGRDtBQUdBLFNBQVMsTUFBVCxDQUFnQixLQUFoQixHQUF3QixVQUFTLEtBQVQsRUFBZ0IsVUFBaEIsRUFBNEIsV0FBNUIsRUFBd0M7QUFDNUQsU0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixjQUFjLE1BQTlCO0FBQ0gsQ0FGRDs7QUFJQSxTQUFTLE1BQVQsQ0FBZ0IsVUFBaEIsR0FBNkIsWUFBVTtBQUNwQztBQUNBLFlBQVEsR0FBUixDQUFZLE1BQVo7QUFDRixDQUhEO0FBSUEsU0FBUyxNQUFULENBQWdCLFFBQWhCLEdBQTJCLFlBQVU7QUFDbEM7QUFDQSxZQUFRLEdBQVIsQ0FBWSxNQUFaO0FBQ0YsQ0FIRDs7QUFLQTtBQUNBLFNBQVMsTUFBVCxDQUFnQixXQUFoQixHQUE4QixJQUE5QjtBQUNBOzs7QUFHQSxJQUFJLFdBQVcsdUJBQWY7O0FBRUE7Ozs7O0FBS0EsU0FBUyxRQUFULENBQWtCLEdBQWxCLEVBQXNCLElBQXRCLEVBQTJCLFFBQTNCLEVBQW9DO0FBQ2hDLFFBQUksTUFBTSxrQkFBVjtBQUNBLFdBQU8sSUFBSSxPQUFKLENBQVksR0FBWixFQUFpQixVQUFVLEdBQVYsRUFBZSxHQUFmLEVBQW9CO0FBQ3hDLGVBQU8sV0FBVSxtQkFBbUIsS0FBSyxHQUFMLENBQW5CLENBQVYsR0FBeUMsS0FBSyxHQUFMLENBQWhEO0FBQ0gsS0FGTSxDQUFQO0FBR0g7QUFDRDs7Ozs7Ozs7Ozs7Ozs7OztBQWdCQSxPQUFPLE9BQVAsR0FBaUI7QUFDYjs7Ozs7O0FBTUEsVUFBTSxjQUFTLE1BQVQsRUFBZ0IsTUFBaEIsRUFBdUIsT0FBdkIsRUFBK0I7QUFDakMsWUFBSSxPQUFPLFNBQVMsV0FBUyx5QkFBbEIsRUFBNEMsT0FBNUMsRUFBb0QsSUFBcEQsQ0FBWDtBQUNBLGdCQUFRLFlBQVIsQ0FBcUIsRUFBRSxNQUFGLENBQVM7QUFDMUIsaUJBQUssSUFEcUI7QUFFMUIsb0JBQU87QUFGbUIsU0FBVCxFQUduQixNQUhtQixDQUFyQixFQUdVLE1BSFY7QUFJSCxLQWJZO0FBY2I7OztBQUdBLGNBQVUsa0JBQVMsTUFBVCxFQUFnQixNQUFoQixFQUF1QjtBQUM3QixnQkFBUSxZQUFSLENBQXFCLEVBQUUsTUFBRixDQUFTO0FBQzFCLGlCQUFLLFdBQVMsV0FEWTtBQUUxQixvQkFBTyxNQUZtQjtBQUcxQjs7Ozs7O0FBTUEsMEJBQWM7QUFDVix5QkFBUyxRQUFRLFFBRFAsQ0FDZ0I7QUFDMUI7QUFDQTtBQUNBO0FBSlU7QUFUWSxTQUFULEVBZW5CLE1BZm1CLENBQXJCLEVBZVUsTUFmVjtBQWdCSCxLQWxDWTs7QUFvQ2I7QUFDQSxXQUFPLGVBQVMsTUFBVCxFQUFpQixNQUFqQixFQUF3QjtBQUMzQixnQkFBUSxZQUFSLENBQXFCLEVBQUUsTUFBRixDQUFTO0FBQzFCLGlCQUFLLGNBRHFCO0FBRTFCLG9CQUFPO0FBRm1CLFNBQVQsRUFHbkIsTUFIbUIsQ0FBckIsRUFHVSxNQUhWO0FBSUgsS0ExQ1k7O0FBNENiO0FBQ0EsY0FBVSxPQTdDRztBQThDYixjQUFVO0FBOUNHLENBQWpCOzs7OztBQzFFRDs7Ozs7OztBQU9BLElBQU0sVUFBVSxRQUFRLGVBQVIsQ0FBaEI7O0FBRUM7Ozs7QUFJQTs7QUFFRCxPQUFPLE9BQVAsR0FBaUI7QUFDWixZQUFVLFFBQVEsTUFBUixDQUFlO0FBQ3JCLFlBQVEsSUFEYSxFQUNQO0FBQ2QsU0FBSztBQUZnQixHQUFmLENBREU7QUFLWixlQUFhLFFBQVEsTUFBUixDQUFlO0FBQ3hCLFlBQVEsTUFEZ0IsRUFDUjtBQUNoQixTQUFLO0FBRm1CLEdBQWY7QUFMRCxDQUFqQjs7Ozs7Ozs7O0FDZkE7Ozs7Ozs7QUFPQyxJQUFNLFFBQVEsUUFBUSxtQkFBUixDQUFkO0FBQUEsSUFDTSxVQUFVLFFBQVEscUJBQVIsQ0FEaEI7QUFBQSxJQUVNLFFBQVEsUUFBUSxtQkFBUixDQUZkO0FBQUEsSUFHTSxVQUFVLFFBQVEscUJBQVIsQ0FIaEI7QUFBQSxJQUlNLE9BQU8sUUFBUSxjQUFSLENBSmI7O0lBTUssUTtBQUNGLHdCQUFhO0FBQUE7O0FBQ1QsYUFBSyxJQUFMLEdBQVksUUFBWjtBQUNBO0FBQ0EsZUFBTyxJQUFQLEdBQWMsRUFBZDtBQUNBLGFBQUssS0FBTCxHQUFhLEtBQWI7QUFDQSxhQUFLLE9BQUwsR0FBZSxPQUFmO0FBQ0EsYUFBSyxLQUFMLEdBQWEsS0FBYjtBQUNBLGFBQUssT0FBTCxHQUFlLE9BQWY7QUFDQSxhQUFLLElBQUwsR0FBWSxJQUFaO0FBQ0g7Ozs7K0JBRUs7QUFDRixpQkFBSyxLQUFMO0FBQ0g7O0FBRUQ7Ozs7Ozs7Ozs7O2lDQVFnQixHLEVBQUk7QUFDaEIsZ0JBQUksSUFBSSxJQUFJLElBQUosRUFBUjtBQUNBLGlCQUFJLElBQUksR0FBUixJQUFlLEdBQWYsRUFBbUI7QUFDZixrQkFBRSxHQUFGLElBQVMsSUFBSSxHQUFKLENBQVQ7QUFDSDs7QUFFRDtBQUNBLGNBQUUsSUFBRjs7QUFFQSxtQkFBTyxDQUFQO0FBQ0g7Ozs7OztBQUdMLE9BQU8sT0FBUCxHQUFpQixRQUFqQjs7O0FDbERBO0FBQ0E7Ozs7QUNEQTs7Ozs7OztBQU9DLElBQU0sY0FBYyxRQUFRLHNCQUFSLENBQXBCO0FBQUEsSUFDTyxZQUFZLFFBQVEsbUJBQVIsQ0FEbkI7QUFBQSxJQUVPLE1BQU0sUUFBUSxpQkFBUixDQUZiOztBQUlELFlBQVksV0FBWixHQUEwQixLQUExQjs7QUFFQSxZQUFZLFNBQVosQ0FBc0I7QUFDbEIsV0FBTztBQUNILG1CQUFXLHdEQURSO0FBRUgsZ0JBQVE7QUFDSixrQkFBTSxjQUFTLEtBQVQsRUFBZTtBQUNqQixzQkFBTSxXQUFOLENBQWtCLFNBQWxCLEVBQTZCLFFBQTdCLENBQXNDLFNBQXRDO0FBQ0Esb0JBQUcsVUFBVSxVQUFiLEVBQXdCO0FBQ3BCLCtCQUFXLFlBQVU7QUFDakIsOEJBQU0sSUFBTjtBQUNBLG9DQUFZLE9BQVo7QUFDSCxxQkFIRCxFQUdFLEdBSEY7QUFJSCxpQkFMRCxNQUtLO0FBQ0QsMEJBQU0sSUFBTjtBQUNBLGdDQUFZLE9BQVo7QUFDSDtBQUNKO0FBWkc7QUFGTCxLQURXO0FBa0JsQixVQUFNO0FBQ0YsbUJBQVcsZUFEVDtBQUVGLGlCQUFTLFVBQVUsVUFBVixHQUFzQixDQUF0QixHQUF5QixHQUZoQztBQUdGLGdCQUFRO0FBQ0osa0JBQU0sY0FBUyxJQUFULEVBQWM7QUFDaEIsb0JBQUcsVUFBVSxVQUFiLEVBQXdCO0FBQ3BCLHlCQUFLLEdBQUwsQ0FBUyxTQUFULEVBQW1CLENBQW5CO0FBQ0EsK0JBQVcsWUFBVTtBQUNqQiw2QkFBSyxJQUFMO0FBQ0gscUJBRkQsRUFFRSxHQUZGO0FBR0gsaUJBTEQsTUFLSztBQUNELHlCQUFLLElBQUw7QUFDSDtBQUNKLGFBVkc7QUFXSixrQkFBTSxjQUFTLElBQVQsRUFBYztBQUNoQixvQkFBRyxVQUFVLFVBQWIsRUFBd0I7QUFDcEIseUJBQUssSUFBTCxHQUFZLEdBQVosQ0FBZ0IsU0FBaEIsRUFBMEIsR0FBMUI7QUFDSCxpQkFGRCxNQUVLO0FBQ0QseUJBQUssSUFBTDtBQUNIO0FBQ0o7QUFqQkc7QUFITixLQWxCWTtBQXlDbEIsV0FBTztBQUNILGtCQUFVO0FBRFA7QUF6Q1csQ0FBdEI7O0FBOENBLFlBQVksU0FBWixDQUFzQixHQUF0QixDQUEwQixVQUFTLFFBQVQsRUFBa0I7QUFDeEMsYUFBUyxLQUFULENBQWUsUUFBZixDQUF3QixTQUF4Qjs7QUFFQSxhQUFTLEdBQVQsQ0FBYSxNQUFiLENBQW9CLEdBQXBCLENBQXdCLFlBQVU7QUFDOUIsaUJBQVMsS0FBVCxDQUFlLFdBQWYsQ0FBMkIsU0FBM0IsRUFBc0MsUUFBdEMsQ0FBK0MsU0FBL0M7QUFDSCxLQUZEO0FBR0gsQ0FORDs7QUFRQSxPQUFPLE9BQVAsR0FBaUIsV0FBakI7OztBQ25FQTtBQUNBOzs7O0FDREE7Ozs7Ozs7QUFPQyxJQUFNLGdCQUFnQixRQUFRLHdCQUFSLENBQXRCO0FBQUEsSUFDTyxZQUFZLFFBQVEsbUJBQVIsQ0FEbkI7QUFBQSxJQUVPLE1BQU0sUUFBUSxtQkFBUixDQUZiOztBQUlELGNBQWMsV0FBZCxHQUE0QixLQUE1Qjs7QUFFQSxjQUFjLFNBQWQsQ0FBd0I7QUFDcEIsV0FBTztBQUNILG1CQUFXLDBEQURSO0FBRUgsZ0JBQVE7QUFDSixrQkFBTSxjQUFTLEtBQVQsRUFBZTtBQUNqQixzQkFBTSxXQUFOLENBQWtCLFNBQWxCLEVBQTZCLFFBQTdCLENBQXNDLFNBQXRDO0FBQ0Esb0JBQUcsVUFBVSxVQUFiLEVBQXdCO0FBQ3BCLCtCQUFXLFlBQVU7QUFDakIsOEJBQU0sSUFBTjtBQUNBLHNDQUFjLE9BQWQ7QUFDSCxxQkFIRCxFQUdFLEdBSEY7QUFJSCxpQkFMRCxNQUtLO0FBQ0QsMEJBQU0sSUFBTjtBQUNBLGtDQUFjLE9BQWQ7QUFDSDtBQUNKO0FBWkc7QUFGTCxLQURhO0FBa0JwQixVQUFNO0FBQ0YsbUJBQVcsZUFEVDtBQUVGLGlCQUFTLFVBQVUsVUFBVixHQUFzQixDQUF0QixHQUF5QixHQUZoQztBQUdGLGdCQUFRO0FBQ0osa0JBQU0sY0FBUyxJQUFULEVBQWM7QUFDaEIsb0JBQUcsVUFBVSxVQUFiLEVBQXdCO0FBQ3BCLHlCQUFLLEdBQUwsQ0FBUyxTQUFULEVBQW1CLENBQW5CO0FBQ0EsK0JBQVcsWUFBVTtBQUNqQiw2QkFBSyxJQUFMO0FBQ0gscUJBRkQsRUFFRSxHQUZGO0FBR0gsaUJBTEQsTUFLSztBQUNELHlCQUFLLElBQUw7QUFDSDtBQUNKLGFBVkc7QUFXSixrQkFBTSxjQUFTLElBQVQsRUFBYztBQUNoQixvQkFBRyxVQUFVLFVBQWIsRUFBd0I7QUFDcEIseUJBQUssSUFBTCxHQUFZLEdBQVosQ0FBZ0IsU0FBaEIsRUFBMEIsR0FBMUI7QUFDSCxpQkFGRCxNQUVLO0FBQ0QseUJBQUssSUFBTDtBQUNIO0FBQ0o7QUFqQkc7QUFITixLQWxCYztBQXlDcEIsYUFBUztBQUNMLGtCQUFVO0FBREw7QUF6Q1csQ0FBeEI7O0FBOENBLGNBQWMsU0FBZCxDQUF3QixHQUF4QixDQUE0QixVQUFTLFFBQVQsRUFBa0I7QUFDMUMsYUFBUyxLQUFULENBQWUsUUFBZixDQUF3QixTQUF4Qjs7QUFFQSxhQUFTLEdBQVQsQ0FBYSxNQUFiLENBQW9CLEdBQXBCLENBQXdCLFlBQVU7QUFDOUIsaUJBQVMsS0FBVCxDQUFlLFdBQWYsQ0FBMkIsU0FBM0IsRUFBc0MsUUFBdEMsQ0FBK0MsU0FBL0M7QUFDSCxLQUZEO0FBR0gsQ0FORDs7QUFRQSxPQUFPLE9BQVAsR0FBaUIsYUFBakI7Ozs7Ozs7Ozs7Ozs7QUNuRUE7Ozs7Ozs7QUFPQyxJQUFNLFlBQVksUUFBUSxvQkFBUixDQUFsQjtBQUFBLElBQ08sWUFBWSxRQUFRLG1CQUFSLENBRG5COztJQUdLLE87OztBQUNGOzs7Ozs7Ozs7Ozs7O0FBYUEscUJBQVksTUFBWixFQUFtQjtBQUFBOztBQUNmO0FBQ0EsaUJBQVMsRUFBRSxNQUFGLENBQVMsSUFBVCxFQUFjO0FBQ25CLG1CQUFPO0FBQ0gsMkJBQVcsZ0JBRFI7QUFFSCxzQkFBTSxLQUZIO0FBR0gsd0JBQVE7QUFDSiwwQkFBTSxjQUFTLEtBQVQsRUFBZTtBQUNqQiw4QkFBTSxXQUFOLENBQWtCLFNBQWxCLEVBQTZCLFFBQTdCLENBQXNDLFNBQXRDO0FBQ0EsNEJBQUcsVUFBVSxVQUFiLEVBQXdCO0FBQ3BCLHVDQUFXLFlBQVU7QUFDakIsc0NBQU0sSUFBTjtBQUNBLHNDQUFNLFlBQU4sQ0FBbUIsSUFBbkIsR0FGaUIsQ0FFVTtBQUM5Qiw2QkFIRCxFQUdFLEdBSEY7QUFJSCx5QkFMRCxNQUtLO0FBQ0Qsa0NBQU0sSUFBTjtBQUNBLGtDQUFNLFlBQU4sQ0FBbUIsSUFBbkIsR0FGQyxDQUUwQjtBQUM5QjtBQUNKO0FBWkc7QUFITCxhQURZO0FBbUJuQixrQkFBTTtBQUNGLDJCQUFXLGVBRFQ7QUFFRix5QkFBUyxVQUFVLFVBQVYsR0FBc0IsQ0FBdEIsR0FBeUIsR0FGaEM7QUFHRix3QkFBUTtBQUNKLDBCQUFNLGNBQVMsSUFBVCxFQUFjO0FBQ2hCLDRCQUFHLFVBQVUsVUFBYixFQUF3QjtBQUNwQixpQ0FBSyxHQUFMLENBQVMsU0FBVCxFQUFtQixDQUFuQjtBQUNBLHVDQUFXLFlBQVU7QUFDakIscUNBQUssSUFBTDtBQUNILDZCQUZELEVBRUUsR0FGRjtBQUdILHlCQUxELE1BS0s7QUFDRCxpQ0FBSyxJQUFMO0FBQ0g7QUFDSixxQkFWRztBQVdKLDBCQUFNLGNBQVMsSUFBVCxFQUFjO0FBQ2hCLDRCQUFHLFVBQVUsVUFBYixFQUF3QjtBQUNwQixpQ0FBSyxJQUFMLEdBQVksR0FBWixDQUFnQixTQUFoQixFQUEwQixHQUExQjtBQUNILHlCQUZELE1BRUs7QUFDRCxpQ0FBSyxJQUFMO0FBQ0g7QUFDSjtBQWpCRztBQUhOO0FBbkJhLFNBQWQsRUEwQ1AsVUFBVSxFQTFDSCxDQUFUOztBQUZlLHVIQThDVCxNQTlDUzs7QUErQ2YsWUFBSSxjQUFKO0FBQ0EsWUFBSSxTQUFTLE9BQUssS0FBbEI7O0FBRUEsZUFBTyxRQUFQLENBQWdCLFNBQWhCOztBQUVBLGVBQUssR0FBTCxDQUFTLE1BQVQsQ0FBZ0IsR0FBaEIsQ0FBb0IsWUFBVTtBQUMxQixtQkFBTyxXQUFQLENBQW1CLFNBQW5CLEVBQThCLFFBQTlCLENBQXVDLFNBQXZDO0FBQ0gsU0FGRDtBQXBEZTtBQXVEbEI7Ozs7K0JBRUs7QUFDRixnQkFBRyxLQUFLLE1BQUwsRUFBSCxFQUFpQjtBQUN0QixxQkFBSyxhQUFMLENBQW1CLElBQW5CLEdBRHNCLENBQ0s7QUFDM0IscUJBQUssSUFBTCxJQUFhLEtBQUssSUFBTCxDQUFVLElBQVYsRUFBYjtBQUNBLHFCQUFLLEtBQUw7QUFDQTtBQUNFOzs7O0VBN0VpQixTOztBQWdGdEIsT0FBTyxPQUFQLEdBQWlCLE9BQWpCOzs7OztBQzFGQTs7Ozs7O0FBTUMsSUFBTSxVQUFVLFFBQVEsZUFBUixDQUFoQjtBQUFBLElBQ08sZ0JBQWdCLFFBQVEsdUJBQVIsQ0FEdkI7O0FBR0QsSUFBSSxnQkFBZ0IsSUFBSSxhQUFKLEVBQXBCOztBQUVBLFNBQVMsYUFBVCxDQUF1QixNQUF2QixFQUE4QjtBQUMxQixXQUFPLE9BQVAsR0FBaUIsSUFBSSxPQUFKLENBQVk7QUFDekIsZUFBTztBQUNILHVCQUFXO0FBRFIsU0FEa0I7QUFJekIsY0FBTTtBQUNGLHFCQUFTLGFBRFAsQ0FDcUI7QUFEckI7QUFKbUIsS0FBWixDQUFqQjs7QUFTQSxXQUFPLE9BQVAsQ0FBZSxZQUFmLENBQTRCLEdBQTVCLENBQWdDLFlBQVU7QUFDdEMsZUFBTyxPQUFQLENBQWUsT0FBZjtBQUNBLGVBQU8sT0FBUCxHQUFpQixJQUFqQjtBQUNILEtBSEQ7O0FBS0EsV0FBTyxPQUFPLE9BQWQ7QUFDSDs7QUFHRCxPQUFPLE9BQVAsR0FBaUI7QUFDYixVQUFNLGdCQUFVO0FBQ1osWUFBSSxVQUFVLGNBQWMsY0FBYyxHQUFkLEVBQWQsQ0FBZDtBQUNBLGdCQUFRLElBQVI7QUFDSCxLQUpZO0FBS2IsVUFBTSxnQkFBVTtBQUNaLFlBQUksU0FBUyxjQUFjLEdBQWQsRUFBYjtBQUNBLFlBQUcsTUFBSCxFQUFVO0FBQ04sbUJBQU8sT0FBUCxDQUFlLElBQWY7QUFDSDtBQUNKO0FBVlksQ0FBakI7Ozs7O0FDOUJBOzs7Ozs7QUFNQyxJQUFNLFVBQVUsUUFBUSxlQUFSLENBQWhCO0FBQUEsSUFDTyxnQkFBZ0IsUUFBUSx1QkFBUixDQUR2Qjs7QUFHRCxJQUFJLGdCQUFnQixJQUFJLGFBQUosRUFBcEI7O0FBRUEsU0FBUyxXQUFULENBQXFCLE1BQXJCLEVBQTRCO0FBQ3hCLFdBQU8sS0FBUCxHQUFlLElBQUksT0FBSixDQUFZO0FBQ3ZCLGVBQU87QUFDSCx1QkFBVztBQURSLFNBRGdCO0FBSXZCLGNBQU07QUFDRixxQkFBUyxNQURQLENBQ2M7QUFEZDtBQUppQixLQUFaLENBQWY7O0FBU0EsV0FBTyxLQUFQLENBQWEsWUFBYixDQUEwQixHQUExQixDQUE4QixZQUFVO0FBQ3BDLGVBQU8sS0FBUCxDQUFhLE9BQWI7QUFDQSxlQUFPLEtBQVAsR0FBZSxJQUFmO0FBQ0gsS0FIRDs7QUFLQSxXQUFPLE9BQU8sS0FBZDtBQUNIOztBQUdELE9BQU8sT0FBUCxHQUFpQjtBQUNiLFVBQU0sY0FBUyxPQUFULEVBQWlCLFlBQWpCLEVBQThCO0FBQ2hDLFlBQUksUUFBUSxZQUFZLGNBQWMsR0FBZCxFQUFaLENBQVo7QUFDQSxjQUFNLFVBQU4sQ0FBaUIsT0FBakI7QUFDQSxjQUFNLFlBQU4sQ0FBbUIsR0FBbkIsQ0FBdUIsWUFBVTtBQUM3QixnQkFBRyxPQUFPLFlBQVAsSUFBdUIsVUFBMUIsRUFBcUM7QUFDakM7QUFDSDtBQUNKLFNBSkQ7QUFLQSxjQUFNLElBQU47QUFDQSxtQkFBVyxZQUFVO0FBQ2pCLGtCQUFNLElBQU47QUFDSCxTQUZELEVBRUUsSUFGRjtBQUdIO0FBYlksQ0FBakI7Ozs7O0FDOUJBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW1DQSxJQUFNLFdBQVcsUUFBUSxlQUFSLENBQWpCO0FBQUEsSUFDRSxVQUFVLFFBQVEsY0FBUixDQURaOztBQUdBO0FBQ0EsU0FBUyxXQUFULEdBQXNCO0FBQ3JCLE1BQUssS0FBTCxHQUFhLEVBQWIsQ0FEcUIsQ0FDSjtBQUNqQixNQUFLLFNBQUwsR0FBaUIsS0FBakIsQ0FGcUIsQ0FFRztBQUN4QixNQUFLLFFBQUwsR0FBZ0IsWUFBVSxDQUFFLENBQTVCLENBSHFCLENBR1M7QUFDOUI7QUFDRDtBQUNBLFlBQVksU0FBWixDQUFzQixPQUF0QixHQUFnQyxZQUFVO0FBQ3pDLEtBQUcsS0FBSyxLQUFMLENBQVcsTUFBWCxJQUFxQixDQUF4QixFQUEwQjtBQUN6QixPQUFLLFNBQUwsR0FBaUIsS0FBakI7QUFDQSxNQUFHLE9BQU8sS0FBSyxRQUFaLElBQXdCLFVBQTNCLEVBQXNDO0FBQ3JDLFFBQUssUUFBTDtBQUNBO0FBQ0Q7QUFDQTtBQUNELEtBQUksTUFBTSxLQUFLLEtBQUwsQ0FBVyxLQUFYLEVBQVY7QUFDQSxNQUFLLE9BQUwsQ0FBYSxHQUFiLEVBQWlCLElBQWpCO0FBQ0EsQ0FWRDtBQVdBOzs7OztBQUtBLFlBQVksU0FBWixDQUFzQixPQUF0QixHQUFnQyxVQUFTLEdBQVQsRUFBYSxPQUFiLEVBQXFCO0FBQ3BELEtBQUcsS0FBSyxTQUFMLElBQWtCLENBQUMsT0FBdEIsRUFBOEI7QUFDN0IsT0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixHQUFoQjtBQUNBO0FBQ0E7QUFDRCxNQUFLLFNBQUwsR0FBaUIsSUFBakI7QUFDQSxTQUFRLEdBQVI7QUFDQSxDQVBEO0FBUUE7OztBQUdBLElBQUksZUFBZTtBQUNsQixhQUFZLEVBRE0sRUFDRjtBQUNoQixNQUFLLGVBQVU7QUFBRTtBQUNoQixNQUFJLFdBQVcsSUFBZjtBQUNBLE1BQUksWUFBWSxLQUFLLFVBQXJCO0FBQ0EsT0FBSSxJQUFJLElBQUksQ0FBUixFQUFXLE1BQU0sVUFBVSxNQUEvQixFQUF1QyxJQUFJLEdBQTNDLEVBQWdELEdBQWhELEVBQW9EO0FBQ25ELE9BQUcsVUFBVSxDQUFWLEVBQWEsU0FBYixJQUEwQixLQUExQixJQUFtQyxVQUFVLENBQVYsRUFBYSxJQUFiLElBQXFCLEtBQTNELEVBQWlFO0FBQUU7QUFDbEUsY0FBVSxDQUFWLEVBQWEsSUFBYixHQUFvQixJQUFwQjtBQUNBLGVBQVcsVUFBVSxDQUFWLENBQVg7QUFDQTtBQUNBO0FBQ0Q7QUFDRCxNQUFHLFlBQVksSUFBZixFQUFvQjtBQUNuQixjQUFXLElBQUksV0FBSixFQUFYO0FBQ0EsWUFBUyxJQUFULEdBQWdCLElBQWhCO0FBQ0EsUUFBSyxVQUFMLENBQWdCLElBQWhCLENBQXFCLFFBQXJCO0FBQ0E7QUFDRCxTQUFPLFFBQVA7QUFDQSxFQWxCaUI7QUFtQmxCLE1BQUssYUFBUyxLQUFULEVBQWU7QUFBRTtBQUNyQixNQUFJLFlBQVksS0FBSyxVQUFyQjtBQUNBLE9BQUksSUFBSSxJQUFJLENBQVIsRUFBVyxNQUFNLFVBQVUsTUFBL0IsRUFBdUMsSUFBSSxHQUEzQyxFQUFnRCxHQUFoRCxFQUFvRDtBQUNuRCxPQUFHLFVBQVUsQ0FBVixLQUFnQixLQUFuQixFQUF5QjtBQUFFO0FBQzFCLGNBQVUsQ0FBVixFQUFhLElBQWIsR0FBb0IsS0FBcEI7QUFDQTtBQUNBO0FBQ0Q7QUFDRDtBQTNCaUIsQ0FBbkI7QUE2QkE7Ozs7OztBQU1BLFNBQVMsTUFBVCxDQUFnQixNQUFoQixFQUF1QixNQUF2QixFQUE4QixRQUE5QixFQUF1QztBQUN0QyxLQUFJLFVBQVUsRUFBZDtBQUFBLEtBQWtCLFVBQVUsRUFBNUI7QUFDQSxHQUFFLE1BQUYsQ0FBUyxJQUFULEVBQWMsT0FBZCxFQUFzQixTQUFTLE1BQS9CLEVBQXNDLE1BQXRDO0FBQ0EsR0FBRSxNQUFGLENBQVMsSUFBVCxFQUFjLE9BQWQsRUFBc0IsU0FBUyxNQUEvQixFQUFzQyxNQUF0QztBQUNBLFVBQVMsTUFBVCxDQUFnQixPQUFoQjtBQUNBLEtBQUksYUFBYSxRQUFRLE9BQXpCO0FBQ0EsS0FBSSxjQUFjLFFBQVEsUUFBMUI7QUFDQSxLQUFJLFlBQVksUUFBUSxZQUFSLENBQXFCLFNBQXJDO0FBQ0EsS0FBSSxXQUFXLFFBQVEsWUFBUixDQUFxQixRQUFwQztBQUNBLEtBQUksV0FBVyxRQUFRLFlBQVIsQ0FBcUIsUUFBcEM7QUFDQSxTQUFRLE9BQVIsR0FBa0IsVUFBUyxJQUFULEVBQWUsVUFBZixFQUEyQixLQUEzQixFQUFpQztBQUFFO0FBQ3BELE1BQUcsYUFBYSxPQUFPLFNBQVMsS0FBVCxDQUFlLE1BQXRCLElBQWdDLFVBQWhELEVBQTJEO0FBQUU7QUFDNUQsT0FBRyxTQUFTLEtBQVQsQ0FBZSxNQUFmLENBQXNCLElBQXRCLENBQUgsRUFBK0I7QUFBRTtBQUM3QixRQUFHLFNBQVMsS0FBVCxDQUFlLEdBQWYsSUFBc0IsRUFBekIsRUFBNEI7QUFBRTtBQUMxQixTQUFJLFdBQVcsU0FBUyxLQUFULENBQWUsR0FBOUI7QUFDUyxTQUFJLFNBQVMsU0FBUyxLQUFULENBQWUsR0FBZixHQUFtQixHQUFuQixHQUF1QixtQkFBbUIsU0FBUyxJQUE1QixDQUFwQztBQUNBLFNBQUcsU0FBUyxXQUFULENBQXFCLEdBQXJCLEtBQTZCLENBQUMsQ0FBakMsRUFBbUM7QUFDL0IsaUJBQVcsU0FBUyxPQUFULENBQWlCLElBQWpCLEVBQXNCLE1BQUksTUFBMUIsQ0FBWDtBQUNILE1BRkQsTUFHSTtBQUNBLGlCQUFXLFdBQVMsR0FBVCxHQUFhLE1BQXhCO0FBQ0g7QUFDRCxjQUFTLElBQVQsR0FBZ0IsUUFBaEI7QUFDQTtBQUNaLEtBWEQsTUFXTSxJQUFHLE9BQU8sU0FBUyxLQUFULENBQWUsSUFBdEIsSUFBOEIsVUFBakMsRUFBNEM7QUFDOUMsY0FBUyxLQUFULENBQWUsSUFBZixDQUFvQixJQUFwQjtBQUNBO0FBQ0g7QUFDSjtBQUNEO0FBQ0QsTUFBRyxZQUFZLE9BQU8sU0FBUyxJQUFULENBQWMsTUFBckIsSUFBK0IsVUFBOUMsRUFBeUQ7QUFBRTtBQUN2RCxPQUFHLFNBQVMsSUFBVCxDQUFjLE1BQWQsQ0FBcUIsSUFBckIsQ0FBSCxFQUE4QjtBQUFFO0FBQzVCLFFBQUcsT0FBTyxRQUFRLFNBQVMsSUFBVCxDQUFjLE9BQXRCLENBQVAsSUFBeUMsVUFBNUMsRUFBdUQ7QUFDbkQsYUFBUSxTQUFTLElBQVQsQ0FBYyxPQUF0QixFQUErQixJQUEvQixFQUFxQyxVQUFyQyxFQUFpRCxLQUFqRDtBQUNIO0FBQ0osSUFKRCxNQUlLO0FBQUU7QUFDSCxRQUFHLFFBQUgsRUFBWTtBQUFFO0FBQ1YsWUFBTyxVQUFQLElBQXFCLFVBQXJCLElBQW1DLFdBQVcsUUFBUSxRQUFSLENBQWlCLElBQWpCLEVBQXVCLFVBQXZCLEVBQW1DLEtBQW5DLENBQVgsRUFBc0QsVUFBdEQsRUFBa0UsS0FBbEUsQ0FBbkM7QUFDSCxLQUZELE1BRUs7QUFDRCxZQUFPLFVBQVAsSUFBcUIsVUFBckIsSUFBbUMsV0FBVyxJQUFYLEVBQWlCLFVBQWpCLEVBQTZCLEtBQTdCLENBQW5DO0FBQ0g7QUFDSjtBQUNKLEdBWkQsTUFZSztBQUNELFVBQU8sVUFBUCxJQUFxQixVQUFyQixJQUFtQyxXQUFXLElBQVgsRUFBaUIsVUFBakIsRUFBNkIsS0FBN0IsQ0FBbkM7QUFDSDtBQUNELEVBbkNEO0FBb0NBLEtBQUcsUUFBUSxZQUFSLENBQXFCLEtBQXhCLEVBQThCO0FBQUU7QUFDL0IsVUFBUSxRQUFSLEdBQW1CLFlBQVU7QUFBRTtBQUM5QixZQUFTLE9BQVQ7QUFDQSxVQUFPLFdBQVAsSUFBc0IsVUFBdEIsSUFBb0MsWUFBWSxLQUFaLENBQWtCLElBQWxCLEVBQXVCLE1BQU0sU0FBTixDQUFnQixLQUFoQixDQUFzQixJQUF0QixDQUEyQixTQUEzQixDQUF2QixDQUFwQztBQUNBLEdBSEQ7QUFJQTtBQUNELFFBQU87QUFDTixVQUFRLE9BREY7QUFFTixVQUFRO0FBRkYsRUFBUDtBQUlBO0FBQ0QsU0FBUyxNQUFULENBQWdCLE1BQWhCLEVBQXVCLE1BQXZCLEVBQThCO0FBQzdCLEtBQUksV0FBVyxJQUFmO0FBQUEsS0FDQyxXQUFXLE9BQU8sWUFBUCxDQUFvQixRQURoQztBQUFBLEtBRUMsVUFBVSxPQUFPLFlBQVAsQ0FBb0IsT0FGL0I7QUFHQSxRQUFPLE9BQU8sWUFBZDs7QUFFQSxZQUFXLEVBQUUsSUFBRixDQUFPLE1BQVAsRUFBZSxJQUFmLENBQW9CLE9BQU8sT0FBM0IsRUFBb0MsSUFBcEMsQ0FBeUMsT0FBTyxLQUFoRCxFQUF1RCxNQUF2RCxDQUE4RCxPQUFPLFFBQXJFLEVBQStFLElBQS9FLENBQW9GLFVBQVMsSUFBVCxFQUFjO0FBQzVHLE1BQUcsV0FBVyxtQkFBbUIsT0FBakMsRUFBeUM7QUFDeEMsV0FBUSxHQUFSLENBQVksSUFBWjtBQUNBO0FBQ0QsRUFKVSxDQUFYO0FBS0EsS0FBRyxZQUFZLE9BQU8sUUFBUCxJQUFtQixVQUFsQyxFQUE2QztBQUM1QyxXQUFTLFFBQVQ7QUFDQTtBQUNEO0FBQ0Q7Ozs7QUFJQSxTQUFTLE9BQVQsQ0FBaUIsS0FBakIsRUFBdUI7QUFDdEIsS0FBSSxVQUFVLE1BQU0sTUFBcEI7QUFBQSxLQUNDLFVBQVUsTUFBTSxNQURqQjtBQUFBLEtBRUMsT0FBTyxRQUFRLFlBQVIsQ0FBcUIsSUFGN0I7QUFBQSxLQUdDLFdBQVcsUUFBUSxZQUFSLENBQXFCLFFBSGpDO0FBQUEsS0FJQyxVQUFVLFFBQVEsWUFBUixDQUFxQixPQUpoQztBQUFBLEtBS0MsWUFBWSxJQUxiOztBQU9BO0FBQ0EsS0FBRyxRQUFILEVBQVk7QUFDWCxVQUFRLEtBQVI7QUFDQTs7QUFFRDtBQUNBLEtBQUcsV0FBVyxtQkFBbUIsT0FBOUIsSUFBMEMsQ0FBQyxZQUFZLFFBQVEsR0FBUixFQUFiLEtBQStCLElBQTVFLEVBQWtGO0FBQ2pGLFVBQVEsT0FBUixDQUFnQixTQUFoQixFQUEyQixTQUEzQixFQUFzQyxJQUF0QztBQUNBLFVBQVEsUUFBUjtBQUNBO0FBQ0E7O0FBRUQsS0FBRyxRQUFRLE1BQVgsRUFBa0I7QUFDakIsTUFBRyxRQUFRLFFBQVIsSUFBb0IsU0FBcEIsSUFBaUMsUUFBUSxRQUFSLElBQW9CLEVBQXhELEVBQTJEO0FBQzFELFdBQVEsUUFBUixHQUFtQixNQUFuQjtBQUNBO0FBQ0QsU0FBTyxPQUFQLEVBQWUsT0FBZjtBQUNBLEVBTEQsTUFLTSxJQUFHLFFBQVEsT0FBWCxFQUFtQjtBQUN4QixVQUFRLFFBQVIsR0FBbUIsT0FBbkI7QUFDQSxVQUFRLFdBQVIsR0FBc0IsSUFBdEI7QUFDQSxTQUFPLE9BQVAsRUFBZSxPQUFmO0FBQ0EsRUFKSyxNQUlBLElBQUcsUUFBUSxRQUFYLEVBQW9CO0FBQ3pCLFVBQVEsUUFBUixHQUFtQixRQUFuQjtBQUNBLFVBQVEsV0FBUixHQUFzQixJQUF0QjtBQUNBLFNBQU8sT0FBUCxFQUFlLE9BQWY7QUFDQTtBQUNEO0FBQ0QsSUFBSSxZQUFZLElBQUksV0FBSixFQUFoQixDLENBQW1DO0FBQ25DLE9BQU8sT0FBUCxHQUFpQjtBQUNoQjs7Ozs7QUFLQSxlQUFjLHNCQUFTLE1BQVQsRUFBZ0IsTUFBaEIsRUFBdUI7QUFDcEMsTUFBRyxVQUFVLE1BQVYsSUFBb0IsT0FBTyxHQUFQLElBQWMsRUFBckMsRUFBd0M7QUFDdkMsT0FBSSxTQUFTLE9BQU8sTUFBUCxFQUFjLE1BQWQsRUFBcUIsU0FBckIsQ0FBYjtBQUNBLE9BQUcsT0FBTyxNQUFQLENBQWMsWUFBZCxDQUEyQixLQUE5QixFQUFvQztBQUFFO0FBQ3JDLGNBQVUsT0FBVixDQUFrQixNQUFsQjtBQUNBLElBRkQsTUFHSTtBQUNILFlBQVEsTUFBUjtBQUNBO0FBQ0Q7QUFDRCxFQWhCZTtBQWlCaEI7Ozs7Ozs7Ozs7Ozs7QUFhQSxvQkFBbUIsMkJBQVMsT0FBVCxFQUFpQixTQUFqQixFQUEyQjtBQUM3QyxNQUFHLEVBQUUsT0FBRixDQUFVLE9BQVYsS0FBc0IsUUFBUSxNQUFSLEdBQWlCLENBQTFDLEVBQTRDO0FBQzNDLE9BQUksV0FBVyxhQUFhLEdBQWIsRUFBZixDQUQyQyxDQUNSO0FBQ25DLFlBQVMsUUFBVCxHQUFvQixZQUFVO0FBQzdCLGlCQUFhLEdBQWIsQ0FBaUIsUUFBakIsRUFENkIsQ0FDRDtBQUM1QixRQUFHLGFBQWEsT0FBTyxVQUFVLFFBQWpCLElBQTZCLFVBQTdDLEVBQXdEO0FBQ3ZELGVBQVUsUUFBVjtBQUNBO0FBQ0QsSUFMRDtBQU1BLFFBQUksSUFBSSxJQUFJLENBQVIsRUFBVyxNQUFNLFFBQVEsTUFBN0IsRUFBcUMsSUFBSSxHQUF6QyxFQUE4QyxHQUE5QyxFQUFrRDtBQUNqRCxRQUFJLFNBQVMsUUFBUSxDQUFSLEVBQVcsTUFBWCxJQUFxQixFQUFsQztBQUNBLFFBQUksU0FBUyxRQUFRLENBQVIsRUFBVyxNQUFYLElBQXFCLEVBQWxDO0FBQ0EsUUFBRyxVQUFVLE1BQVYsSUFBb0IsT0FBTyxHQUFQLElBQWMsRUFBckMsRUFBd0M7QUFDdkMsY0FBUyxFQUFFLE1BQUYsQ0FBUyxJQUFULEVBQWMsTUFBZCxFQUFxQixFQUFDLGNBQWEsRUFBQyxPQUFNLElBQVAsRUFBZCxFQUFyQixDQUFUO0FBQ0EsU0FBSSxTQUFTLE9BQU8sTUFBUCxFQUFjLE1BQWQsRUFBcUIsUUFBckIsQ0FBYjtBQUNBLGNBQVMsT0FBVCxDQUFpQixNQUFqQjtBQUNBO0FBQ0Q7QUFDRDtBQUNEO0FBakRlLENBQWpCOzs7Ozs7O0FDM05BOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE4QkE7QUFDQSxJQUFJLE9BQU8sRUFBWDtBQUNBOzs7QUFHQSxLQUFLLEtBQUwsR0FBYTtBQUNaLE9BQUssRUFETyxFQUNIO0FBQ1QsT0FBSyxJQUZPLEVBRUQ7QUFDWCxRQUFNLGNBQVMsSUFBVCxFQUFjLENBQUUsQ0FIVixFQUdZO0FBQ3hCLFVBQVEsZ0JBQVMsSUFBVCxFQUFjO0FBQUMsV0FBTyxLQUFQO0FBQWMsR0FKekIsQ0FJMEI7QUFKMUIsQ0FBYjtBQU1BOzs7O0FBSUEsS0FBSyxJQUFMLEdBQVk7QUFDUixXQUFTLE1BREQsRUFDUztBQUNqQixVQUFRLGdCQUFTLElBQVQsRUFBYztBQUFDLFdBQU8sS0FBUDtBQUFjLEdBRjdCLENBRThCO0FBQ3RDOzs7Ozs7Ozs7O0FBSFEsQ0FBWjtBQWNBLEtBQUssTUFBTCxHQUFjLEVBQUU7QUFDZjtBQUNBLE9BQUssRUFGUTtBQUdiLFVBQVEsS0FISztBQUliLGVBQWEsbUNBSkE7QUFLYixZQUFVLGtCQUFTLE1BQVQsRUFBZ0I7QUFBQyxXQUFPLE9BQU8sSUFBZDtBQUFvQixHQUxsQyxFQUtvQztBQUNqRDtBQUNBLGdCQUFhO0FBQ1osVUFBTSxNQURNLEVBQ0U7QUFDWCxlQUFXLElBRkYsRUFFUTtBQUNqQixjQUFVLElBSEQsRUFHTztBQUNoQixjQUFVLElBSkQsRUFJTztBQUNoQixXQUFPLEtBTEUsRUFLSztBQUNqQixhQUFTLElBTkcsRUFNRztBQUNmLGNBQVUsS0FQRSxFQU9LO0FBQ2QsY0FBVSxrQkFBUyxRQUFULEVBQWtCLENBQUUsQ0FSckIsQ0FRc0I7QUFSdEI7QUFQQSxDQUFkO0FBa0JBOzs7OztBQUtBLEtBQUssTUFBTCxHQUFjLEVBQUU7QUFDZixZQUFVLG9CQUFVLENBQUUsQ0FEVCxFQUNXO0FBQ3hCLFdBQVMsaUJBQVMsSUFBVCxFQUFlLFVBQWYsRUFBMkIsS0FBM0IsRUFBaUMsQ0FBRSxDQUYvQjtBQUdiLFNBQU8sZUFBUyxLQUFULEVBQWdCLFVBQWhCLEVBQTRCLFdBQTVCLEVBQXdDO0FBQUMsVUFBTyxjQUFjLE1BQXJCO0FBQStCLEdBSGxFO0FBSWIsUUFBTSxjQUFTLElBQVQsRUFBZSxVQUFmLEVBQTJCLEtBQTNCLEVBQWlDLENBQUUsQ0FKNUIsQ0FJNkI7QUFKN0IsQ0FBZDtBQU1BOzs7O0FBSUEsS0FBSyxNQUFMLEdBQWMsVUFBUyxHQUFULEVBQWEsQ0FBRSxDQUE3QjtBQUNBOzs7O0FBSUEsS0FBSyxXQUFMLEdBQW1CLFVBQVMsT0FBVCxFQUFpQjtBQUNuQyxNQUFHLFFBQU8sT0FBUCx5Q0FBTyxPQUFQLE1BQWtCLFFBQXJCLEVBQThCO0FBQzdCLE1BQUUsU0FBRixDQUFZLE9BQVo7QUFDQTtBQUNELENBSkQ7O0FBTUEsT0FBTyxPQUFQLEdBQWlCLElBQWpCOzs7OztBQ3ZHQTs7Ozs7OztBQU9BOzs7O0FBSUEsU0FBUyxPQUFULENBQWlCLEdBQWpCLEVBQXFCO0FBQ2pCLFVBQU0sRUFBRSxNQUFGLENBQVM7QUFDWDs7Ozs7Ozs7O0FBU0EsZ0JBQVEsSUFWRztBQVdYLGFBQUssRUFYTSxDQVdIO0FBWEcsS0FBVCxFQVlKLEdBWkksQ0FBTjs7QUFjQSxRQUFHLElBQUksR0FBSixJQUFXLEVBQVgsSUFBaUIsSUFBSSxNQUFKLElBQWMsRUFBbEMsRUFBcUM7QUFDakMsY0FBTSxJQUFJLEtBQUosQ0FBVSxzQkFBVixDQUFOO0FBQ0gsS0FGRCxNQUVNLElBQUcsQ0FBQyxtQ0FBbUMsSUFBbkMsQ0FBd0MsSUFBSSxNQUE1QyxDQUFKLEVBQXdEO0FBQzFELGNBQU0sSUFBSSxLQUFKLENBQVUsNkJBQVYsQ0FBTjtBQUNIOztBQUVELFFBQUksR0FBSixHQUFVLFFBQVEsU0FBUixHQUFvQixHQUFwQixHQUEwQixJQUFJLEdBQXhDOztBQUVBLFNBQUssR0FBTCxHQUFXLEdBQVg7QUFDSDs7QUFFRDs7OztBQUlBLFFBQVEsU0FBUixDQUFrQixlQUFsQixHQUFvQyxZQUFVO0FBQzFDLFFBQUksU0FBUyxLQUFLLEdBQUwsQ0FBUyxNQUF0QjtBQUFBLFFBQ0ksVUFBVSxJQUFJLElBQUosR0FBVyxPQUFYLEVBRGQ7QUFBQSxRQUVJLFdBQVcsQ0FGZjtBQUFBLFFBR0ksTUFBTSw4QkFIVjtBQUFBLFFBSUksUUFBUSxJQUpaOztBQU1BLFdBQU0sQ0FBQyxRQUFRLElBQUksSUFBSixDQUFTLE1BQVQsQ0FBVCxLQUE4QixJQUFwQyxFQUF5QztBQUNyQyxZQUFJLE1BQU0sTUFBTSxDQUFOLENBQVY7QUFBQSxZQUFvQjtBQUNoQixpQkFBUyxNQUFNLENBQU4sQ0FEYjtBQUVBLFlBQUcsTUFBTSxDQUFOLENBQUgsRUFBWTtBQUFFO0FBQ1YsbUJBQU8sTUFBTSxDQUFOLENBQVA7QUFDSDtBQUNELGNBQU0sT0FBTyxHQUFQLENBQU47QUFDQSxnQkFBUSxNQUFSO0FBQ0ksaUJBQUssR0FBTDtBQUNJLDRCQUFZLE1BQUksRUFBSixHQUFPLEVBQW5CO0FBQ0E7QUFDSixpQkFBSyxHQUFMO0FBQ0ksNEJBQVksTUFBSSxFQUFoQjtBQUNBO0FBQ0osaUJBQUssR0FBTDtBQUNJLDRCQUFZLEdBQVo7QUFDQTtBQUNKO0FBQ0k7QUFYUjtBQWFIOztBQUVELGVBQVcsV0FBUyxFQUFULEdBQVksRUFBWixHQUFlLElBQTFCOztBQUVBLFdBQU8sT0FBUDtBQUNILENBaENEOztBQWtDQTs7Ozs7Ozs7OztBQVVBLFFBQVEsU0FBUixDQUFrQixHQUFsQixHQUF3QixVQUFTLElBQVQsRUFBYztBQUNsQyxRQUFHLENBQUMsSUFBRCxJQUFTLE9BQU8sSUFBUCxDQUFZLElBQVosRUFBa0IsTUFBbEIsSUFBNEIsQ0FBeEMsRUFBMEM7QUFDdEM7QUFDSDs7QUFFRCxpQkFBYSxPQUFiLENBQXFCLEtBQUssR0FBTCxDQUFTLEdBQTlCLEVBQW1DLEtBQUssU0FBTCxDQUFlO0FBQzlDLGlCQUFTLEtBQUssZUFBTCxFQURxQztBQUU5QyxjQUFNO0FBRndDLEtBQWYsQ0FBbkM7QUFJSCxDQVREOztBQVdBOzs7O0FBSUEsUUFBUSxTQUFSLENBQWtCLEdBQWxCLEdBQXdCLFlBQVU7QUFDOUI7QUFDQSxRQUFJLFFBQVEsYUFBYSxPQUFiLENBQXFCLEtBQUssR0FBTCxDQUFTLEdBQTlCLENBQVo7QUFDQSxRQUFHLFNBQVMsSUFBWixFQUFpQjtBQUNiLGVBQU8sSUFBUDtBQUNILEtBRkQsTUFFSztBQUNELGdCQUFRLEtBQUssS0FBTCxDQUFXLEtBQVgsQ0FBUjtBQUNBLFlBQUcsT0FBTyxNQUFNLE9BQWIsS0FBeUIsSUFBSSxJQUFKLEdBQVcsT0FBWCxFQUE1QixFQUFpRDtBQUFFO0FBQy9DLGlCQUFLLE1BQUw7QUFDQSxtQkFBTyxJQUFQO0FBQ0gsU0FIRCxNQUdLO0FBQ0QsbUJBQU8sTUFBTSxJQUFiO0FBQ0g7QUFDSjtBQUNKLENBZEQ7O0FBZ0JBOzs7O0FBSUEsUUFBUSxTQUFSLENBQWtCLE1BQWxCLEdBQTJCLFlBQVU7QUFDakMsaUJBQWEsVUFBYixDQUF3QixLQUFLLEdBQUwsQ0FBUyxHQUFqQztBQUNILENBRkQ7O0FBSUE7Ozs7QUFJQSxRQUFRLFNBQVIsR0FBb0IsUUFBcEI7O0FBRUE7Ozs7QUFJQSxRQUFRLEtBQVIsR0FBZ0IsWUFBVTtBQUN0QixRQUFJLE1BQU0sSUFBSSxNQUFKLENBQVcsTUFBSSxRQUFRLFNBQXZCLENBQVY7QUFDQSxXQUFNLGFBQWEsTUFBYixHQUFzQixDQUE1QixFQUErQjtBQUMzQixZQUFJLE1BQU0sYUFBYSxHQUFiLENBQWlCLENBQWpCLENBQVY7QUFDQSxZQUFHLElBQUksSUFBSixDQUFTLEdBQVQsQ0FBSCxFQUFpQjtBQUNiLHlCQUFhLFVBQWIsQ0FBd0IsR0FBeEI7QUFDSDtBQUNKO0FBQ0osQ0FSRDs7QUFVQTs7Ozs7QUFLQSxRQUFRLE1BQVIsR0FBaUIsVUFBUyxHQUFULEVBQWE7QUFDMUIsV0FBTyxJQUFJLE9BQUosQ0FBWSxHQUFaLENBQVA7QUFDSCxDQUZEOztBQUlBLE9BQU8sT0FBUCxHQUFpQixPQUFqQjs7Ozs7Ozs7Ozs7Ozs7O0FDekpBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWdDQSxJQUFNLFlBQVksUUFBUSxnQkFBUixDQUFsQjtBQUFBLElBQ0ksTUFBTSxRQUFRLFVBQVIsQ0FEVjs7SUFHTSxLOzs7QUFDTDs7Ozs7Ozs7O0FBU0EsaUJBQVksTUFBWixFQUFvQjtBQUFBOztBQUNuQixRQUFJLE1BQU0sRUFBRSxNQUFGLENBQVMsSUFBVCxFQUFjO0FBQ3ZCLGFBQU87QUFDTixrQkFBVSxJQUFJLEtBRFIsQ0FDYztBQURkO0FBRGdCLEtBQWQsRUFJUixNQUpRLENBQVY7O0FBRG1CLDhHQU1iLEdBTmE7O0FBUW5CLFVBQUssVUFBTCxDQUFnQixJQUFJLEtBQUosQ0FBVSxRQUExQjtBQUNBLFVBQUssV0FBTCxHQUFtQixNQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLGFBQWhCLENBQW5CLENBVG1CLENBU2dDO0FBQ25ELFVBQUssS0FBTCxHQUFhLEVBQUUsU0FBRixFQUFiO0FBQ0E7QUFDRyxVQUFLLEtBQUwsQ0FBVyxFQUFYLENBQWMsV0FBZCxFQUEyQixRQUEzQixFQUFxQyxVQUFDLENBQUQsRUFBTztBQUMzQyxRQUFFLGNBQUY7QUFDQSxZQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLENBQWhCO0FBQ0gsWUFBSyxJQUFMO0FBQ0csS0FKRDtBQVpnQjtBQWlCbkI7QUFDRDs7Ozs7Ozs7aUNBSWEsSSxFQUFNO0FBQ2xCLFVBQUcsT0FBTyxJQUFQLElBQWUsUUFBZixJQUEyQixLQUFLLFdBQUwsQ0FBaUIsTUFBakIsR0FBMEIsQ0FBeEQsRUFBMEQ7QUFDaEQsYUFBSyxXQUFMLENBQWlCLElBQWpCLENBQXNCLElBQXRCO0FBQ0g7QUFDUDtBQUNEOzs7Ozs7OEJBR1U7QUFDVCxXQUFLLEtBQUwsQ0FBVyxHQUFYLENBQWUsV0FBZixFQUE0QixRQUE1QjtBQUNBO0FBQ0EsV0FBSyxXQUFMLEdBQW1CLElBQW5CO0FBQ0EsV0FBSyxLQUFMLEdBQWEsSUFBYjtBQUNBOzs7O0VBN0NrQixTOztBQWdEcEIsT0FBTyxPQUFQLEdBQWlCLEtBQWpCOzs7Ozs7Ozs7Ozs7Ozs7QUNuRkM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE0QkEsSUFBTSxRQUFRLFFBQVEsWUFBUixDQUFkO0FBQUEsSUFDTSxjQUFjLFFBQVEsa0JBQVIsQ0FEcEI7O0FBR0Q7Ozs7SUFHTSxZOzs7QUFDRiwwQkFBWSxXQUFaLEVBQXlCO0FBQUE7O0FBQUEsZ0lBQ2YsV0FEZTs7QUFFckIsY0FBSyxNQUFMLEdBQWMsWUFBVSxDQUFFLENBQTFCLENBRnFCLENBRU87QUFDbEMsY0FBSyxPQUFMLEdBQWUsQ0FBQyxJQUFELENBQWYsQ0FIMkIsQ0FHSjtBQUhJO0FBSXhCO0FBQ0Q7Ozs7Ozs7O29DQUlZLEssRUFBTTtBQUFBOztBQUNwQixnQkFBRyxLQUFLLFNBQUwsSUFBa0IsSUFBckIsRUFBMEI7QUFDekIscUJBQUssU0FBTCxHQUFpQixJQUFJLEtBQUosQ0FBVSxLQUFLLFdBQWYsQ0FBakI7QUFDQSxxQkFBSyxTQUFMLENBQWUsS0FBZixDQUFxQixHQUFyQixDQUF5QixVQUFDLENBQUQsRUFBTztBQUMvQiwyQkFBSyxNQUFMO0FBQ0EsaUJBRkQ7QUFHUyxxQkFBSyxRQUFMO0FBQ1QsYUFORCxNQU1LO0FBQ0ssb0JBQUcsS0FBSCxFQUFTO0FBQ0wseUJBQUssU0FBTCxDQUFlLFVBQWYsQ0FBMEIsS0FBSyxXQUFMLENBQWlCLEtBQWpCLENBQXVCLFFBQWpEO0FBQ0g7QUFDSjtBQUNQLG1CQUFPLEtBQUssU0FBWjtBQUNHO0FBQ0Q7Ozs7OztrQ0FHUztBQUNMO0FBQ0EsaUJBQUssTUFBTCxHQUFjLFlBQVUsQ0FBRSxDQUExQjtBQUNIOzs7O0VBOUJzQixXOztBQWlDM0IsT0FBTyxPQUFQLEdBQWlCLFlBQWpCOzs7OztBQ25FQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBMkJELElBQU0sZUFBZSxRQUFRLG1CQUFSLENBQXJCOztBQUVBLE9BQU8sT0FBUCxHQUFpQixJQUFJLFlBQUosRUFBakI7Ozs7Ozs7OztBQzdCQzs7Ozs7Ozs7OztBQVVBLElBQU0sT0FBTyxRQUFRLGNBQVIsQ0FBYjs7SUFFTSxXO0FBQ0Y7Ozs7QUFJQSx5QkFBWSxXQUFaLEVBQXdCO0FBQUE7O0FBQ3BCLGFBQUssU0FBTCxHQUFpQixJQUFqQixDQURvQixDQUNHO0FBQzVCLGFBQUssV0FBTCxHQUFtQixFQUFuQixDQUZ5QixDQUVGO0FBQ3ZCLGFBQUssT0FBTCxHQUFlLEVBQWYsQ0FIeUIsQ0FHTjtBQUNkLGFBQUssU0FBTCxHQUFpQixFQUFFLFNBQUYsRUFBakIsQ0FKb0IsQ0FJWTtBQUNoQyxZQUFHLE9BQU8sV0FBUCxJQUFzQixTQUF6QixFQUFtQztBQUMvQiwwQkFBYyxJQUFkO0FBQ0g7QUFDRCxhQUFLLFdBQUwsR0FBbUIsV0FBbkI7QUFDSDtBQUNEOzs7Ozs7OztrQ0FJVSxNLEVBQU87QUFDYixpQkFBSyxXQUFMLEdBQW1CLE1BQW5CO0FBQ0g7QUFDRDs7Ozs7O3NDQUdhLENBRVo7QUFDRDs7Ozs7O21DQUdVO0FBQUE7O0FBQ04sZ0JBQUcsS0FBSyxXQUFSLEVBQW9CO0FBQ2hCLHFCQUFLLFNBQUwsQ0FBZSxZQUFmLENBQTRCLEdBQTVCLENBQWdDLFlBQU07QUFDbEMsMEJBQUssT0FBTDtBQUNILGlCQUZEO0FBR0g7QUFDRCxpQkFBSyxTQUFMLENBQWUsSUFBZixDQUFvQixLQUFLLFNBQXpCO0FBQ0g7QUFDRDs7Ozs7Ozs7Ozs7Ozs7Ozs7NkJBY0csRyxFQUFJLEcsRUFBSTtBQUNQLGdCQUFHLENBQUMsS0FBSyxRQUFMLENBQWMsR0FBZCxDQUFKLEVBQXVCO0FBQzVCLHNCQUFNLElBQUksS0FBSixDQUFVLGtDQUFWLENBQU47QUFDQSxhQUZLLE1BRUQ7QUFDSixvQkFBRyxLQUFLLFFBQUwsQ0FBYyxHQUFkLENBQUgsRUFBc0I7QUFDckIsd0JBQUksVUFBVSxLQUFLLE9BQW5CO0FBRHFCO0FBQUE7QUFBQTs7QUFBQTtBQUVyQiw2Q0FBbUIsT0FBbkIsOEhBQTJCO0FBQUEsZ0NBQW5CLE9BQW1COztBQUMxQixnQ0FBRyxLQUFLLFVBQUwsQ0FBZ0IsSUFBSSxPQUFKLENBQWhCLENBQUgsRUFBaUM7QUFDaEMscUNBQUssTUFBSSxPQUFKLEdBQVksS0FBakIsSUFBMEIsSUFBSSxPQUFKLENBQTFCO0FBQ0EsNkJBRkQsTUFHSTtBQUNILHFDQUFLLE1BQUksT0FBSixHQUFZLEtBQWpCLElBQTBCLFlBQVUsQ0FBRSxDQUF0QztBQUNBO0FBQ0Q7QUFUb0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQVVyQixpQkFWRCxNQVVLO0FBQ0oseUJBQUssTUFBTCxHQUFjLFlBQVUsQ0FBRSxDQUExQjtBQUNBO0FBQ0Q7QUFDQSxvQkFBSSxjQUFjLEVBQWxCO0FBQ0EscUJBQUksSUFBSSxJQUFSLElBQWdCLEdBQWhCLEVBQW9CO0FBQ25CLGdDQUFZLElBQVosQ0FBaUIsSUFBakI7QUFDQTtBQUNELHFCQUFLLFdBQUwsQ0FBaUIsSUFBakI7QUFDQSxvQkFBSSxVQUFVLEtBQUssU0FBTCxDQUFlLFFBQWYsQ0FBd0IsV0FBeEIsQ0FBZDtBQUNBLHFCQUFJLElBQUksSUFBUixJQUFnQixPQUFoQixFQUF3QjtBQUN2Qix5QkFBSyxRQUFMLENBQWMsSUFBSSxJQUFKLENBQWQsS0FBNEIsUUFBUSxJQUFSLEVBQWMsSUFBZCxDQUFtQixJQUFJLElBQUosQ0FBbkIsQ0FBNUI7QUFDQTtBQUNELHFCQUFLLFNBQUwsQ0FBZSxJQUFmO0FBQ0E7QUFDRTtBQUNEOzs7Ozs7a0NBR1M7QUFDTCxnQkFBRyxLQUFLLFNBQUwsSUFBa0IsSUFBckIsRUFBMEI7QUFDL0IscUJBQUssU0FBTCxDQUFlLE9BQWY7QUFDQSxxQkFBSyxTQUFMLEdBQWlCLElBQWpCO0FBQ0E7QUFDRTs7Ozs7O0FBR04sT0FBTyxPQUFQLEdBQWlCLFdBQWpCOzs7Ozs7Ozs7Ozs7Ozs7QUMxR0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXdCQyxJQUFNLFFBQVEsUUFBUSxZQUFSLENBQWQ7QUFBQSxJQUNJLE9BQU8sUUFBUSxXQUFSLENBRFg7QUFBQSxJQUVHLGVBQWUsUUFBUSxtQkFBUixDQUZsQjtBQUFBLElBR0csT0FBTyxRQUFRLGNBQVIsQ0FIVjs7SUFLSyxTOzs7QUFDTDs7Ozs7Ozs7Ozs7Ozs7QUFjQSxvQkFBWSxNQUFaLEVBQW9CO0FBQUE7O0FBQ2IsTUFBSSxnQkFBZ0IsS0FBcEI7QUFDTixNQUFHLENBQUMsT0FBTyxTQUFSLElBQXFCLE9BQU8sU0FBUCxDQUFpQixNQUFqQixJQUEyQixDQUFuRCxFQUFxRDtBQUNwRCxVQUFPLFNBQVAsR0FBbUIsRUFBRSxhQUFGLEVBQWlCLFFBQWpCLENBQTBCLE1BQTFCLENBQW5CO0FBQ0EsbUJBQWdCLElBQWhCLENBRm9ELENBRTlCO0FBQ3RCO0FBQ0QsV0FBUyxVQUFVLEVBQW5CO0FBQ0E7O0FBUG1CLG9IQVFiLE9BQU8sU0FSTSxFQVFJLE9BQU8sS0FSWDs7QUFTYixRQUFLLGFBQUwsR0FBcUIsYUFBckI7QUFDTjtBQUNBLFFBQUssR0FBTCxHQUFXLElBQUksWUFBSixDQUFpQjtBQUMzQixVQUFPLE1BQUs7QUFEZSxHQUFqQixFQUVULE9BQU8sR0FGRSxDQUFYO0FBR0E7QUFDQSxNQUFJLFVBQVUsRUFBRSxNQUFGLENBQVMsSUFBVCxFQUFjO0FBQzNCLFNBQU0sSUFEcUI7QUFFM0IsWUFBUztBQUZrQixHQUFkLEVBR1osT0FBTyxJQUhLLENBQWQ7QUFJQSxNQUFHLFFBQVEsSUFBWCxFQUFnQjtBQUFFO0FBQ2pCLFNBQUssSUFBTCxHQUFZLElBQUksSUFBSixDQUFTLE9BQU8sU0FBaEIsRUFBMEIsT0FBMUIsQ0FBWjtBQUNBLE9BQUcsUUFBUSxPQUFYLEVBQW1CO0FBQUU7QUFDcEIsVUFBSyxJQUFMLENBQVUsUUFBVixDQUFtQixHQUFuQixDQUF1QixVQUFDLENBQUQsRUFBTztBQUM3QixXQUFLLElBQUw7QUFDQSxLQUZEO0FBR0E7QUFDRDtBQUNEO0FBQ0EsUUFBSyxLQUFMLENBQVcsRUFBWCxDQUFjLFdBQWQsRUFBMkIsV0FBM0IsRUFBd0MsVUFBQyxDQUFELEVBQU87QUFDM0MsS0FBRSxjQUFGO0FBQ0EsU0FBSyxJQUFMO0FBQ0EsR0FISjtBQTVCbUI7QUFnQ25CO0FBQ0Q7Ozs7Ozs7Ozs7Ozs7MkJBU1MsVyxFQUFZO0FBQUE7O0FBQ3BCLE9BQUksU0FBUyxFQUFiO0FBQUEsT0FBaUIsT0FBTyxJQUF4QjtBQUNBLE9BQUcsS0FBSyxPQUFMLENBQWEsV0FBYixDQUFILEVBQTZCO0FBQzVCLE1BQUUsSUFBRixDQUFPLFdBQVAsRUFBbUIsVUFBQyxLQUFELEVBQU8sSUFBUCxFQUFnQjtBQUNsQyxTQUFJLE9BQU8sT0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixTQUFPLElBQXZCLENBQVg7QUFDQSxTQUFHLEtBQUssTUFBTCxHQUFjLENBQWpCLEVBQW1CO0FBQ2xCLGFBQU8sSUFBUCxJQUFlLElBQWY7QUFDQTtBQUNELEtBTEQ7QUFNQTtBQUNELFVBQU8sTUFBUDtBQUNBO0FBQ0Q7Ozs7Ozt5QkFHTTtBQUNMLE9BQUcsQ0FBQyxLQUFLLE1BQUwsRUFBSixFQUFrQjtBQUNqQixTQUFLLGFBQUwsQ0FBbUIsSUFBbkIsR0FEaUIsQ0FDVTtBQUMzQixTQUFLLElBQUwsSUFBYSxLQUFLLElBQUwsQ0FBVSxJQUFWLEVBQWI7QUFDQSxTQUFLLEtBQUw7QUFDQSxTQUFLLEdBQUwsQ0FBUyxNQUFUO0FBQ0EsU0FBSyxZQUFMLENBQWtCLElBQWxCLEdBTGlCLENBS1M7QUFDMUI7QUFDRDtBQUNEOzs7Ozs7eUJBR007QUFDTCxPQUFHLEtBQUssTUFBTCxFQUFILEVBQWlCO0FBQ2hCLFNBQUssYUFBTCxDQUFtQixJQUFuQixHQURnQixDQUNXO0FBQzNCLFNBQUssSUFBTCxJQUFhLEtBQUssSUFBTCxDQUFVLElBQVYsRUFBYjtBQUNBLFNBQUssS0FBTDtBQUNBLFNBQUssWUFBTCxDQUFrQixJQUFsQixHQUpnQixDQUlVO0FBQzFCO0FBQ0Q7QUFDRDs7Ozs7OzRCQUdTO0FBQ1IsUUFBSyxLQUFMLENBQVcsR0FBWCxDQUFlLFdBQWYsRUFBNEIsV0FBNUI7QUFDQSxRQUFLLEdBQUwsQ0FBUyxPQUFUO0FBQ0EsT0FBRyxLQUFLLElBQVIsRUFBYTtBQUNILFNBQUssSUFBTCxDQUFVLE9BQVY7QUFDSDtBQUNELE9BQUksWUFBWSxLQUFLLFNBQXJCO0FBQ0E7QUFDQSxPQUFHLEtBQUssYUFBUixFQUFzQjtBQUMzQixjQUFVLE1BQVY7QUFDQTtBQUNELFFBQUssYUFBTCxHQUFxQixJQUFyQjtBQUNBOzs7O0VBM0dzQixLOztBQThHeEIsT0FBTyxPQUFQLEdBQWlCLFNBQWpCOzs7Ozs7Ozs7Ozs7Ozs7QUMzSUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFrQ0EsSUFBTSxZQUFZLFFBQVEsZ0JBQVIsQ0FBbEI7QUFBQSxJQUNFLE1BQU0sUUFBUSxVQUFSLENBRFI7O0lBR00sTzs7O0FBQ0w7Ozs7Ozs7OztBQVNBLGtCQUFZLE1BQVosRUFBb0I7QUFBQTs7QUFDbkIsTUFBSSxNQUFNLEVBQUUsTUFBRixDQUFTLElBQVQsRUFBYztBQUN2QixZQUFTO0FBQ1IsY0FBVSxJQUFJLE9BRE4sQ0FDYztBQURkO0FBRGMsR0FBZCxFQUlSLE1BSlEsQ0FBVjs7QUFEbUIsZ0hBTWIsR0FOYTs7QUFPbkIsUUFBSyxVQUFMLENBQWdCLElBQUksT0FBSixDQUFZLFFBQTVCO0FBQ0EsUUFBSyxXQUFMLEdBQW1CLE1BQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsYUFBaEIsQ0FBbkIsQ0FSbUIsQ0FRZ0M7QUFDbkQsUUFBSyxLQUFMLEdBQWEsRUFBRSxTQUFGLEVBQWI7QUFDQSxRQUFLLFNBQUwsR0FBaUIsRUFBRSxTQUFGLEVBQWpCO0FBQ0E7QUFDRyxRQUFLLEtBQUwsQ0FBVyxFQUFYLENBQWMsV0FBZCxFQUEyQixRQUEzQixFQUFxQyxVQUFDLENBQUQsRUFBTztBQUMzQyxLQUFFLGNBQUY7QUFDSCxTQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLENBQWhCO0FBQ0csU0FBSyxJQUFMO0FBQ0EsR0FKRDtBQUtBLFFBQUssS0FBTCxDQUFXLEVBQVgsQ0FBYyxXQUFkLEVBQTJCLFlBQTNCLEVBQXlDLFVBQUMsQ0FBRCxFQUFPO0FBQy9DLEtBQUUsY0FBRjtBQUNILFNBQUssU0FBTCxDQUFlLElBQWYsQ0FBb0IsQ0FBcEI7QUFDRyxTQUFLLElBQUw7QUFDQSxHQUpEO0FBakJnQjtBQXNCbkI7QUFDRDs7Ozs7Ozs7K0JBSWEsSSxFQUFLO0FBQ2pCLE9BQUcsT0FBTyxJQUFQLElBQWUsUUFBZixJQUEyQixLQUFLLFdBQUwsQ0FBaUIsTUFBakIsR0FBMEIsQ0FBeEQsRUFBMEQ7QUFDekQsU0FBSyxXQUFMLENBQWlCLElBQWpCLENBQXNCLElBQXRCO0FBQ0E7QUFDRDtBQUNEOzs7Ozs7NEJBR1M7QUFDUixRQUFLLEtBQUwsQ0FBVyxHQUFYLENBQWUsV0FBZixFQUE0QixRQUE1QjtBQUNBLFFBQUssS0FBTCxDQUFXLEdBQVgsQ0FBZSxXQUFmLEVBQTRCLFlBQTVCO0FBQ0E7QUFDQSxRQUFLLFdBQUwsR0FBbUIsSUFBbkI7QUFDQSxRQUFLLEtBQUwsR0FBYSxJQUFiO0FBQ0E7Ozs7RUFuRG9CLFM7O0FBc0R0QixPQUFPLE9BQVAsR0FBaUIsT0FBakI7Ozs7Ozs7Ozs7Ozs7OztBQzNGQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQStCQSxJQUFNLFVBQVUsUUFBUSxjQUFSLENBQWhCO0FBQUEsSUFDRSxjQUFjLFFBQVEsa0JBQVIsQ0FEaEI7O0lBR0ssYzs7O0FBQ0w7OztBQUdBLHlCQUFZLFdBQVosRUFBeUI7QUFBQTs7QUFBQSw4SEFDbEIsV0FEa0I7O0FBRXhCLFFBQUssTUFBTCxHQUFjLFlBQVUsQ0FBRSxDQUExQixDQUZ3QixDQUVJO0FBQzVCLFFBQUssVUFBTCxHQUFrQixZQUFVLENBQUUsQ0FBOUIsQ0FId0IsQ0FHUTtBQUNoQyxRQUFLLE9BQUwsR0FBZSxDQUFDLElBQUQsRUFBTSxRQUFOLENBQWYsQ0FKd0IsQ0FJUTtBQUpSO0FBS3hCO0FBQ0Q7Ozs7Ozs7OzhCQUlZLEssRUFBTTtBQUFBOztBQUNqQixPQUFHLEtBQUssU0FBTCxJQUFrQixJQUFyQixFQUEwQjtBQUN6QixTQUFLLFNBQUwsR0FBaUIsSUFBSSxPQUFKLENBQVksS0FBSyxXQUFqQixDQUFqQjtBQUNBLFNBQUssU0FBTCxDQUFlLEtBQWYsQ0FBcUIsR0FBckIsQ0FBeUIsVUFBQyxDQUFELEVBQU87QUFDL0IsWUFBSyxNQUFMO0FBQ0EsS0FGRDtBQUdBLFNBQUssU0FBTCxDQUFlLFNBQWYsQ0FBeUIsR0FBekIsQ0FBNkIsVUFBQyxDQUFELEVBQU87QUFDbkMsWUFBSyxVQUFMO0FBQ0EsS0FGRDtBQUdBLFNBQUssUUFBTDtBQUNBLElBVEQsTUFTSztBQUNLLFFBQUcsS0FBSCxFQUFTO0FBQ0wsVUFBSyxTQUFMLENBQWUsVUFBZixDQUEwQixLQUFLLFdBQUwsQ0FBaUIsT0FBakIsQ0FBeUIsUUFBbkQ7QUFDSDtBQUNKO0FBQ1AsVUFBTyxLQUFLLFNBQVo7QUFDQTtBQUNEOzs7Ozs7NEJBR1M7QUFDUjtBQUNBLFFBQUssTUFBTCxHQUFjLFlBQVUsQ0FBRSxDQUExQjtBQUNBLFFBQUssVUFBTCxHQUFrQixZQUFVLENBQUUsQ0FBOUI7QUFDQTs7OztFQXRDMkIsVzs7QUF5QzdCLE9BQU8sT0FBUCxHQUFpQixjQUFqQjs7Ozs7QUMzRUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE0QkEsSUFBTSxpQkFBaUIsUUFBUSxxQkFBUixDQUF2Qjs7QUFFQSxPQUFPLE9BQVAsR0FBaUIsSUFBSSxjQUFKLEVBQWpCOzs7Ozs7Ozs7QUM5QkQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBb0JPLEs7QUFDTDs7Ozs7QUFLQSxpQkFBWSxTQUFaLEVBQXNCLE1BQXRCLEVBQTZCO0FBQUE7O0FBQzdCLGdCQUFZLGFBQWEsRUFBRSxNQUFGLENBQXpCO0FBQ0MsUUFBSSxNQUFNLEVBQUUsTUFBRixDQUFTLElBQVQsRUFBYztBQUN2QixpQkFBVyxFQURZLEVBQ1I7QUFDZixjQUFRLENBRmUsRUFFWjtBQUNYLGdCQUFVLFVBSGEsRUFHRDtBQUN0QixZQUFNLEtBSmlCLEVBSVY7QUFDYixjQUFRO0FBQ1AsY0FBTSxJQURDLEVBQ0s7QUFDWixjQUFNLElBRkMsQ0FFSTtBQUZKO0FBTGUsS0FBZCxFQVNSLFVBQVUsRUFURixDQUFWO0FBVUEsUUFBSSxTQUFTLGNBQVksSUFBSSxRQUFoQixHQUF5QixHQUF6QixJQUE4QixJQUFJLElBQUosR0FBUyxFQUFULEdBQVksZUFBMUMsSUFBMkQsVUFBM0QsR0FBc0UsSUFBSSxNQUExRSxHQUFpRixHQUE5RjtBQUNBLFNBQUssU0FBTCxHQUFpQixTQUFqQixDQWI0QixDQWFBO0FBQzVCLFNBQUssS0FBTCxHQUFhLEVBQUUsVUFBUSxJQUFJLFNBQUosSUFBaUIsRUFBakIsR0FBb0IsRUFBcEIsR0FBdUIsYUFBVyxJQUFJLFNBQWYsR0FBeUIsR0FBeEQsSUFBNkQsVUFBN0QsR0FBd0UsTUFBeEUsR0FBK0UsVUFBakYsQ0FBYjtBQUNBLFNBQUssS0FBTCxDQUFXLFFBQVgsQ0FBb0IsU0FBcEI7QUFDQSxTQUFLLGFBQUwsR0FBcUIsRUFBRSxTQUFGLEVBQXJCLENBaEI0QixDQWdCUTtBQUNwQyxTQUFLLFlBQUwsR0FBb0IsRUFBRSxTQUFGLEVBQXBCLENBakI0QixDQWlCTztBQUNuQyxTQUFLLGFBQUwsR0FBcUIsRUFBRSxTQUFGLEVBQXJCLENBbEI0QixDQWtCUTtBQUNwQyxTQUFLLFlBQUwsR0FBb0IsRUFBRSxTQUFGLEVBQXBCLENBbkI0QixDQW1CTztBQUNuQyxTQUFLLE1BQUwsR0FBZSxJQUFJLE1BQW5CLENBcEI0QixDQW9CRDtBQUMzQjtBQUNEOzs7Ozs7OzsrQkFJVyxPLEVBQVE7QUFDbkIsVUFBRyxVQUFVLE1BQVYsSUFBb0IsQ0FBdkIsRUFBeUI7QUFDdkI7QUFDQTtBQUNELFVBQUcsT0FBTyxPQUFQLElBQWtCLFFBQXJCLEVBQThCO0FBQzdCLGFBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsT0FBaEI7QUFDQSxPQUZELE1BR0k7QUFDSCxhQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEVBQWhCLEVBQW9CLE1BQXBCLENBQTJCLE9BQTNCO0FBQ0E7QUFDRDtBQUNEOzs7Ozs7NEJBR087QUFDTixVQUFHLE9BQU8sS0FBSyxNQUFMLENBQVksSUFBbkIsSUFBMkIsVUFBOUIsRUFBeUM7QUFDeEMsYUFBSyxNQUFMLENBQVksSUFBWixDQUFpQixLQUFLLEtBQXRCO0FBQ0EsT0FGRCxNQUdJO0FBQ0gsYUFBSyxLQUFMLENBQVcsSUFBWDtBQUNBO0FBQ0Q7QUFDRDs7Ozs7OzJCQUdPO0FBQ04sVUFBRyxDQUFDLEtBQUssTUFBTCxFQUFKLEVBQWtCO0FBQ2pCLGFBQUssYUFBTCxDQUFtQixJQUFuQixHQURpQixDQUNVO0FBQzNCLGFBQUssS0FBTDtBQUNBLGFBQUssWUFBTCxDQUFrQixJQUFsQixHQUhpQixDQUdTO0FBQzFCO0FBQ0Q7QUFDRDs7Ozs7OzRCQUdPO0FBQ1AsVUFBRyxPQUFPLEtBQUssTUFBTCxDQUFZLElBQW5CLElBQTJCLFVBQTlCLEVBQXlDO0FBQ3ZDLGFBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsS0FBSyxLQUF0QjtBQUNBLE9BRkYsTUFHSztBQUNILGFBQUssS0FBTCxDQUFXLElBQVg7QUFDQTtBQUNEO0FBQ0Q7Ozs7OzsyQkFHTTtBQUNMLFVBQUcsS0FBSyxNQUFMLEVBQUgsRUFBaUI7QUFDaEIsYUFBSyxhQUFMLENBQW1CLElBQW5CLEdBRGdCLENBQ1c7QUFDM0IsYUFBSyxLQUFMO0FBQ0EsYUFBSyxZQUFMLENBQWtCLElBQWxCLEdBSGdCLENBR1U7QUFDMUI7QUFDRDtBQUNEOzs7Ozs7OEJBR1M7QUFDUixVQUFHLEtBQUssS0FBTCxJQUFjLElBQWpCLEVBQXNCO0FBQ3JCLGFBQUssS0FBTCxDQUFXLE1BQVg7QUFDQSxhQUFLLEtBQUwsR0FBYSxJQUFiO0FBQ0EsYUFBSyxPQUFMLEdBQWUsSUFBZjtBQUNBLGFBQUssT0FBTCxHQUFlLElBQWY7QUFDQSxhQUFLLE1BQUwsR0FBYyxJQUFkO0FBQ0EsYUFBSyxTQUFMLEdBQWlCLElBQWpCO0FBQ0E7QUFDRDtBQUNEOzs7Ozs7OzZCQUlRO0FBQ1AsYUFBTyxLQUFLLEtBQUwsQ0FBVyxHQUFYLENBQWUsU0FBZixLQUE2QixNQUFwQztBQUNBOzs7Ozs7QUFHSCxPQUFPLE9BQVAsR0FBaUIsS0FBakI7Ozs7Ozs7OztBQy9IQTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW1CQyxJQUFNLGVBQWUsUUFBUSxtQkFBUixDQUFyQjs7SUFFTSxJO0FBQ0w7Ozs7O0FBS0EsZ0JBQVksU0FBWixFQUFzQixNQUF0QixFQUE2QjtBQUFBOztBQUFBOztBQUM1QixnQkFBWSxhQUFhLEVBQUUsTUFBRixDQUF6QjtBQUNBLFFBQUksTUFBTSxFQUFFLE1BQUYsQ0FBUztBQUNULGlCQUFXLEVBREYsRUFDTTtBQUN4QixlQUFTLE1BRlMsRUFFRDtBQUNqQixjQUFRLENBSFUsRUFHUDtBQUNYLGVBQVMsR0FKUyxFQUlKO0FBQ2QsWUFBTSxLQUxZLEVBS0w7QUFDYixjQUFRO0FBQ1AsY0FBTSxJQURDLEVBQ0s7QUFDWixjQUFNLElBRkMsQ0FFSTtBQUZKO0FBTlUsS0FBVCxFQVVSLFVBQVUsRUFWRixDQUFWO0FBV0EsUUFBSSxTQUFTLGtDQUFnQyxJQUFJLE9BQXBDLEdBQTRDLEdBQTVDLElBQWlELElBQUksSUFBSixHQUFTLEVBQVQsR0FBWSxlQUE3RCxJQUE4RSxVQUE5RSxHQUF5RixJQUFJLE1BQTdGLEdBQW9HLEdBQWpIO0FBQ0EsU0FBSyxTQUFMLEdBQWlCLFNBQWpCLENBZDRCLENBY0E7QUFDNUIsU0FBSyxJQUFMLEdBQVksRUFBRSxVQUFRLElBQUksU0FBSixJQUFpQixFQUFqQixHQUFvQixFQUFwQixHQUF1QixhQUFXLElBQUksU0FBZixHQUF5QixHQUF4RCxJQUE2RCxVQUE3RCxHQUF3RSxNQUF4RSxHQUErRSxVQUFqRixDQUFaO0FBQ0EsU0FBSyxJQUFMLENBQVUsUUFBVixDQUFtQixTQUFuQjtBQUNBLFNBQUssSUFBTCxDQUFVLEdBQVYsQ0FBYyxTQUFkLEVBQXdCLElBQUksT0FBNUI7QUFDQSxTQUFLLE1BQUwsR0FBZSxJQUFJLE1BQW5CLENBbEI0QixDQWtCRDtBQUMzQixTQUFLLEdBQUwsR0FBVyxJQUFJLFlBQUosQ0FBaUIsRUFBQyxPQUFNLEtBQUssSUFBWixFQUFqQixFQUFtQyxFQUFDLE1BQUssTUFBTixFQUFuQyxDQUFYO0FBQ0E7QUFDQSxTQUFLLFFBQUwsR0FBZ0IsRUFBRSxTQUFGLEVBQWhCLENBckI0QixDQXFCRztBQUMvQixTQUFLLElBQUwsQ0FBVSxFQUFWLENBQWEsV0FBYixFQUF5QixVQUFDLENBQUQsRUFBTztBQUMvQixZQUFLLFFBQUwsQ0FBYyxJQUFkLENBQW1CLENBQW5CO0FBQ0EsS0FGRDtBQUdBO0FBQ0Q7Ozs7Ozs7MkJBR007QUFDTixVQUFHLE9BQU8sS0FBSyxNQUFMLENBQVksSUFBbkIsSUFBMkIsVUFBOUIsRUFBeUM7QUFDdkMsYUFBSyxNQUFMLENBQVksSUFBWixDQUFpQixLQUFLLElBQXRCO0FBQ0EsT0FGRixNQUdLO0FBQ0gsYUFBSyxJQUFMLENBQVUsSUFBVjtBQUNBO0FBQ0QsV0FBSyxHQUFMLENBQVMsTUFBVDtBQUNBO0FBQ0Q7Ozs7OzsyQkFHTTtBQUNMLFVBQUcsT0FBTyxLQUFLLE1BQUwsQ0FBWSxJQUFuQixJQUEyQixVQUE5QixFQUF5QztBQUN4QyxhQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLEtBQUssSUFBdEI7QUFDQSxPQUZELE1BR0k7QUFDSCxhQUFLLElBQUwsQ0FBVSxJQUFWO0FBQ0E7QUFDRDtBQUNEOzs7Ozs7OEJBR1M7QUFDUixVQUFHLEtBQUssSUFBTCxJQUFhLElBQWhCLEVBQXFCO0FBQ3BCLGFBQUssSUFBTCxDQUFVLEdBQVYsQ0FBYyxXQUFkO0FBQ0EsYUFBSyxJQUFMLENBQVUsTUFBVjtBQUNBLGFBQUssSUFBTCxHQUFZLElBQVo7QUFDQSxhQUFLLEdBQUwsQ0FBUyxPQUFUO0FBQ0EsYUFBSyxHQUFMLEdBQVcsSUFBWDtBQUNBLGFBQUssUUFBTCxHQUFnQixJQUFoQjtBQUNBO0FBQ0Q7Ozs7OztBQUdGLE9BQU8sT0FBUCxHQUFpQixJQUFqQjs7Ozs7Ozs7O0FDM0ZEOzs7Ozs7Ozs7Ozs7O0FBYUMsSUFBTSxZQUFZLFFBQVEsbUJBQVIsQ0FBbEI7QUFBQSxJQUNFLFNBQVMsUUFBUSxnQkFBUixDQURYO0FBQUEsSUFFQyxZQUFZLFFBQVEsbUJBQVIsQ0FGYjtBQUFBLElBR0MsU0FBUyxRQUFRLGdCQUFSLENBSFY7O0FBS0Q7OztBQUdBLFNBQVMsT0FBVCxDQUFnQixNQUFoQixFQUF1QixNQUF2QixFQUE4QjtBQUM3QixLQUFJLFNBQVMsRUFBYjtBQUFBLEtBQWdCLFFBQVEsT0FBTyxLQUEvQjtBQUFBLEtBQXFDLFNBQVMsT0FBTyxNQUFyRDtBQUNBLE9BQU0sR0FBTixDQUFVLFVBQVYsRUFBcUIsT0FBTyxRQUE1QjtBQUNBLEtBQUksYUFBYSxDQUFqQjtBQUFBLEtBQW9CLFlBQVksQ0FBaEM7QUFDQSxLQUFHLE9BQU8sUUFBUCxJQUFtQixVQUFuQixJQUFpQyxPQUFPLEtBQTNDLEVBQWlEO0FBQ2hELGVBQWEsT0FBTyxVQUFQLEVBQWI7QUFDQSxjQUFZLE9BQU8sU0FBUCxFQUFaO0FBQ0E7QUFDRCxTQUFRLE9BQU8sSUFBZjtBQUNDLE9BQUssR0FBTDtBQUFVO0FBQ1QsaUJBQWUsS0FBSyxHQUFMLENBQVMsTUFBTSxLQUFOLEVBQVQsRUFBdUIsT0FBTyxRQUE5QixJQUF3QyxDQUF4QyxHQUEwQyxPQUFPLE1BQVAsQ0FBYyxDQUFkLENBQXpEO0FBQ0EsZ0JBQWMsS0FBSyxHQUFMLENBQVMsTUFBTSxNQUFOLEVBQVQsRUFBd0IsT0FBTyxTQUEvQixJQUEwQyxDQUExQyxHQUE0QyxPQUFPLE1BQVAsQ0FBYyxDQUFkLENBQTFEO0FBQ0EsVUFBTyxHQUFQLEdBQWEsS0FBYjtBQUNBLFVBQU8sSUFBUCxHQUFjLEtBQWQ7QUFDQTtBQUNELE9BQUssTUFBTDtBQUFhO0FBQ1osVUFBTyxLQUFQLEdBQWUsTUFBZjtBQUNBLFVBQU8sTUFBUCxHQUFnQixNQUFoQjtBQUNBLFVBQU8sR0FBUCxHQUFhLEdBQWI7QUFDQSxVQUFPLElBQVAsR0FBYyxHQUFkO0FBQ0E7QUFaRjtBQWNBLFFBQU8sVUFBUCxHQUFvQixhQUFXLElBQS9CO0FBQ0EsUUFBTyxTQUFQLEdBQW1CLFlBQVUsSUFBN0I7QUFDQSxLQUFHLE9BQU8sT0FBTyxTQUFkLElBQTJCLFVBQTlCLEVBQXlDO0FBQ3hDLFNBQU8sU0FBUCxDQUFpQixNQUFqQjtBQUNBLEVBRkQsTUFFSztBQUNKLFFBQU0sR0FBTixDQUFVLE1BQVY7QUFDQTtBQUNEOztJQUVLLFE7QUFDTDs7Ozs7Ozs7QUFRQSxtQkFBWSxJQUFaLEVBQWlCLE1BQWpCLEVBQXdCO0FBQUE7O0FBQ3ZCO0FBQ0EsTUFBRyxVQUFVLE1BQVYsSUFBb0IsQ0FBdkIsRUFBeUI7QUFDeEIsU0FBTSxJQUFJLEtBQUosQ0FBVSxnQkFBVixDQUFOO0FBQ0E7QUFDRCxNQUFJLFNBQVMsRUFBRSxNQUFGLENBQVM7QUFDckIsVUFBTyxJQURjLEVBQ1I7QUFDYixZQUFTLEtBRlksQ0FFTjtBQUZNLEdBQVQsRUFHWCxRQUFRLEVBSEcsQ0FBYjtBQUlBLE1BQUcsT0FBTyxLQUFQLElBQWdCLE9BQU8sT0FBTyxLQUFkLElBQXVCLFFBQTFDLEVBQW1EO0FBQ2xELFVBQU8sS0FBUCxHQUFlLEVBQUUsT0FBTyxLQUFULENBQWY7QUFDQTtBQUNELE1BQUcsQ0FBQyxPQUFPLEtBQVIsSUFBaUIsT0FBTyxLQUFQLENBQWEsTUFBYixJQUF1QixDQUEzQyxFQUE2QztBQUM1QyxTQUFNLElBQUksS0FBSixDQUFVLFlBQVYsQ0FBTjtBQUNBO0FBQ0QsTUFBSSxTQUFTLEVBQUUsTUFBRixDQUFTO0FBQ3JCLFVBQU8sSUFEYyxFQUNSO0FBQ2IsU0FBTSxHQUZlLEVBRVY7QUFDWCxXQUFRLENBQUMsQ0FBRCxFQUFHLENBQUgsQ0FIYSxFQUdOO0FBQ2YsZUFBWSxLQUpTLEVBSUY7QUFDbkIsYUFBVSxDQUxXLEVBS1I7QUFDSixjQUFXLENBTkMsRUFNRTtBQUNkLGNBQVcsSUFQQyxDQU9JO0FBUEosR0FBVCxFQVFYLFVBQVUsRUFSQyxDQUFiO0FBU00sT0FBSyxNQUFMLEdBQWMsRUFBRSxTQUFGLEVBQWQsQ0F4QmlCLENBd0JZOztBQUVuQyxNQUFJLE9BQU8sSUFBWDtBQUNBO0FBQ0EsU0FBTyxNQUFQLEdBQWdCLE9BQU8sS0FBUCxDQUFhLFlBQWIsRUFBaEI7QUFDQSxNQUFJLFVBQVUsT0FBTyxNQUFQLENBQWMsR0FBZCxDQUFrQixDQUFsQixFQUFxQixPQUFyQixDQUE2QixXQUE3QixFQUFkO0FBQ0EsTUFBSSxhQUFhO0FBQ1AsU0FBTSxnQkFBVTtBQUNaLFNBQUssTUFBTDtBQUNIO0FBSE0sR0FBakI7QUFLTSxNQUFJLGNBQWMsS0FBbEIsQ0FuQ2lCLENBbUNRO0FBQ3pCLE1BQUksY0FBYyxLQUFsQixDQXBDaUIsQ0FvQ1E7QUFDL0IsTUFBRyxXQUFXLE1BQVgsSUFBcUIsV0FBVyxNQUFuQyxFQUEwQztBQUFFO0FBQ3hDLFVBQU8sTUFBUCxHQUFnQixFQUFFLE1BQUYsQ0FBaEI7QUFDSCxVQUFPLE9BQVAsR0FBaUIsSUFBakI7QUFDQTtBQUNELE1BQUcsT0FBTyxPQUFQLElBQWtCLE9BQU8sS0FBNUIsRUFBa0M7QUFBRTtBQUNuQyxVQUFPLFFBQVAsR0FBa0IsT0FBbEI7QUFDQSxHQUZELE1BR0k7QUFDSCxVQUFPLFFBQVAsR0FBa0IsVUFBbEI7QUFDQSxPQUFHLE9BQU8sS0FBVixFQUFpQjtBQUFFO0FBQ2Ysa0JBQWMsSUFBZDtBQUNTLFFBQUcsT0FBTyxPQUFWLEVBQWtCO0FBQ2QsZUFBVSxNQUFWLENBQWlCLFVBQWpCO0FBQ0gsS0FGRCxNQUdJO0FBQ0EsU0FBSSxTQUFTLElBQUksTUFBSixDQUFXLE9BQU8sTUFBbEIsQ0FBYjtBQUNBLFlBQU8sTUFBUCxDQUFjLFVBQWQ7QUFDSDtBQUNiO0FBQ0Q7QUFDRDtBQUNNLE1BQUcsT0FBTyxJQUFQLElBQWUsR0FBZixJQUFzQixPQUFPLFVBQWhDLEVBQTJDO0FBQ3ZDLGlCQUFjLElBQWQ7QUFDQSxPQUFHLE9BQU8sT0FBVixFQUFrQjtBQUNkLGNBQVUsTUFBVixDQUFpQixVQUFqQjtBQUNILElBRkQsTUFFSztBQUNELFFBQUksU0FBUyxJQUFJLE1BQUosQ0FBVyxPQUFPLE1BQWxCLENBQWI7QUFDQSxXQUFPLE1BQVAsQ0FBYyxVQUFkO0FBQ0g7QUFDSjtBQUNQLE9BQUssTUFBTCxHQUFjLE1BQWQsQ0FuRXVCLENBbUVEO0FBQ3RCLE9BQUssTUFBTCxHQUFjLE1BQWQsQ0FwRXVCLENBb0VEO0FBQ3RCLE9BQUssT0FBTCxHQUFlLFlBQVU7QUFBRTtBQUMxQixRQUFLLE1BQUwsR0FBYyxJQUFkO0FBQ0EsUUFBSyxNQUFMLEdBQWMsSUFBZDtBQUNBLE9BQUcsV0FBSCxFQUFlO0FBQ2QsUUFBRyxPQUFPLE9BQVYsRUFBa0I7QUFDakIsZUFBVSxRQUFWLENBQW1CLFVBQW5CO0FBQ0EsS0FGRCxNQUVLO0FBQ0osWUFBTyxRQUFQLENBQWdCLFVBQWhCO0FBQ0E7QUFDRDtBQUNELE9BQUcsV0FBSCxFQUFlO0FBQ1gsUUFBRyxPQUFPLE9BQVYsRUFBa0I7QUFDTCxlQUFVLFFBQVYsQ0FBbUIsVUFBbkI7QUFDSCxLQUZWLE1BRWM7QUFDRCxZQUFPLFFBQVAsQ0FBZ0IsVUFBaEI7QUFDSDtBQUNiO0FBQ0QsR0FqQkQ7QUFrQkE7QUFDRDs7Ozs7Ozs7MkJBSVE7QUFDUCxPQUFHLEtBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsR0FBbEIsQ0FBc0IsU0FBdEIsS0FBb0MsTUFBcEMsSUFBOEMsS0FBSyxNQUFMLENBQVksTUFBWixDQUFtQixHQUFuQixDQUF1QixTQUF2QixLQUFxQyxNQUF0RixFQUE2RjtBQUM1RixXQUFPLEtBQVA7QUFDQSxJQUZELE1BR0k7QUFDSCxZQUFPLEtBQUssTUFBWixFQUFtQixLQUFLLE1BQXhCO0FBQ1MsU0FBSyxNQUFMLENBQVksSUFBWjtBQUNULFdBQU8sSUFBUDtBQUNBO0FBQ0Q7Ozs7OztBQUdGLE9BQU8sT0FBUCxHQUFpQixRQUFqQjs7Ozs7QUNyS0E7OztBQUdBLFFBQVEsS0FBUixHQUFnQixDQUNaLGVBRFksRUFFZiwrQkFGZSxFQUdmLHdEQUhlLEVBSWQsSUFKYyxDQUlULEVBSlMsQ0FBaEI7QUFLQTs7O0FBR0EsUUFBUSxPQUFSLEdBQWtCLENBQ2QsZUFEYyxFQUVqQiwrQkFGaUIsRUFHakIsdUdBSGlCLEVBSWhCLElBSmdCLENBSVgsRUFKVyxDQUFsQjs7Ozs7QUNYQTs7Ozs7Ozs7O0FBU0EsSUFBSSxPQUFPLFNBQVMsYUFBVCxDQUF1QixLQUF2QixDQUFYO0FBQ0EsSUFBSSxTQUFTO0FBQ1o7QUFDQSxTQUFPLEVBQUUsZUFBZSxPQUFPLFNBQVMsSUFBVCxDQUFjLEtBQWQsQ0FBb0IsU0FBMUMsSUFBeUQsU0FBUyxVQUFULEtBQXdCLFlBQXhCLElBQXdDLE9BQU8sSUFBUCxDQUFZLFVBQVUsU0FBVixDQUFvQixXQUFwQixFQUFaLENBQW5HLENBRks7QUFHWjtBQUNBLGNBQVksRUFBRSxLQUFLLEtBQUwsQ0FBVyxVQUFYLElBQXlCLFNBQTNCO0FBSkEsQ0FBYjs7QUFPQSxPQUFPLE9BQVAsR0FBaUIsTUFBakI7Ozs7Ozs7Ozs7Ozs7QUNqQkE7Ozs7Ozs7O0FBUUMsSUFBTSxhQUFhLFFBQVEsaUJBQVIsQ0FBbkI7O0lBRU0sUTs7O0FBQ0w7Ozs7QUFJQSxvQkFBWSxNQUFaLEVBQW1CO0FBQUE7O0FBQUE7O0FBRWxCLFVBQUssS0FBTCxHQUFhLElBQWI7QUFDQSxNQUFFLE1BQUYsUUFBYztBQUNiLGlCQUFXLEdBREUsQ0FDRTtBQURGLEtBQWQsRUFFRSxVQUFVLEVBRlo7QUFIa0I7QUFNbEI7QUFDRDs7Ozs7Ozs0QkFHTztBQUFBOztBQUNOLFVBQUcsS0FBSyxLQUFSLEVBQWM7QUFDSixxQkFBYSxLQUFLLEtBQWxCO0FBQ0g7QUFDRCxXQUFLLEtBQUwsR0FBYSxXQUFXLFlBQU07QUFDN0IsZUFBSyxPQUFMO0FBQ0EsT0FGWSxFQUVYLEtBQUssU0FGTSxDQUFiO0FBR047Ozs7RUF0QnFCLFU7O0FBeUJ4QixPQUFPLE9BQVAsR0FBaUIsUUFBakI7Ozs7O0FDbkNBOzs7Ozs7QUFNQSxJQUFJLFNBQVM7QUFDWjtBQUNBLFlBQVksWUFBVTtBQUNsQixTQUFPLHlCQUF5QixNQUF6QixHQUFpQyxtQkFBakMsR0FBc0QsUUFBN0Q7QUFDSCxFQUZVLEVBRkM7QUFLWjtBQUNBLFFBQVEsWUFBVTtBQUNkLE1BQUcsV0FBVyxJQUFYLENBQWdCLFVBQVUsU0FBMUIsQ0FBSCxFQUF3QztBQUFFO0FBQ3RDLFVBQU8sYUFBUDtBQUNIO0FBQ0QsTUFBSSxPQUFPLFNBQVMsYUFBVCxDQUF1QixPQUF2QixDQUFYO0FBQ0EsTUFBRyxhQUFhLElBQWhCLEVBQXFCO0FBQ2pCLFVBQU8sT0FBUDtBQUNILEdBRkQsTUFFTSxJQUFHLHNCQUFzQixJQUF6QixFQUE4QjtBQUNoQyxVQUFPLGdCQUFQO0FBQ0gsR0FGSyxNQUVBO0FBQ0YsVUFBTyxPQUFQO0FBQ0g7QUFDSixFQVpNO0FBTkssQ0FBYjs7QUFxQkEsT0FBTyxPQUFQLEdBQWlCLE1BQWpCOzs7Ozs7Ozs7QUMzQkE7Ozs7Ozs7O0FBUUMsSUFBTSxPQUFPLFFBQVEsV0FBUixDQUFiO0FBQUEsSUFDRyxlQUFlLFFBQVEsbUJBQVIsQ0FEbEI7O0lBR0ssVTtBQUNMLHVCQUFhO0FBQUE7O0FBQ1osT0FBSyxXQUFMLEdBQW1CLEVBQW5CLENBRFksQ0FDVztBQUN2QixPQUFLLGFBQUwsR0FBcUIsSUFBSSxZQUFKLEVBQXJCO0FBQ0E7QUFDRDs7Ozs7OzsrQkFHYSxJLEVBQUs7QUFDakIsT0FBRyxLQUFLLFFBQUwsQ0FBYyxJQUFkLEtBQXVCLEtBQUssVUFBTCxDQUFnQixLQUFLLElBQXJCLENBQTFCLEVBQXFEO0FBQ3BELFdBQU8sSUFBUDtBQUNBO0FBQ0QsVUFBTyxLQUFQO0FBQ0E7QUFDRDs7Ozs7Ozs0QkFJUztBQUNSLFFBQUssYUFBTCxDQUFtQixJQUFuQixDQUF3QixVQUFTLElBQVQsRUFBYztBQUNyQyxNQUFFLElBQUYsQ0FBTyxLQUFLLFdBQVosRUFBd0IsVUFBUyxLQUFULEVBQWUsSUFBZixFQUFvQjtBQUMzQyxTQUFHLEtBQUssTUFBTCxNQUFpQixJQUFwQixFQUF5QjtBQUNsQixXQUFLLElBQUwsQ0FBVSxLQUFWLENBQWdCLE1BQWhCLEVBQXVCLEtBQUssSUFBNUI7QUFDRDtBQUNOLEtBSkQ7QUFLQSxJQU51QixDQU10QixJQU5zQixDQU1qQixJQU5pQixFQU1aLEVBQUMsTUFBTSxTQUFQLEVBTlksQ0FBeEI7QUFPQTtBQUNEOzs7Ozs7Ozs7Ozs0QkFRVSxVLEVBQVc7QUFDcEIsT0FBRyxLQUFLLFlBQUwsQ0FBa0IsVUFBbEIsQ0FBSCxFQUFpQztBQUNoQyxRQUFHLENBQUMsS0FBSyxVQUFMLENBQWdCLFdBQVcsTUFBM0IsQ0FBSixFQUF1QztBQUNoQyxnQkFBVyxNQUFYLEdBQW9CLFlBQVU7QUFDMUIsYUFBTyxJQUFQO0FBQ0gsTUFGRDtBQUdIO0FBQ0osUUFBRyxFQUFFLE9BQUYsQ0FBVSxVQUFWLEVBQXFCLEtBQUssV0FBMUIsSUFBeUMsQ0FBNUMsRUFBOEM7QUFDN0MsVUFBSyxhQUFMLENBQW1CLEtBQW5CLENBQXlCLFVBQVMsTUFBVCxFQUFnQjtBQUN4QyxXQUFLLFdBQUwsQ0FBaUIsSUFBakIsQ0FBc0IsTUFBdEI7QUFDQSxNQUZ3QixDQUV2QixJQUZ1QixDQUVsQixJQUZrQixFQUViLFVBRmEsQ0FBekI7QUFHQTtBQUNEO0FBQ0Q7QUFDRDs7Ozs7Ozs4QkFJWSxVLEVBQVc7QUFDdEIsT0FBRyxLQUFLLFlBQUwsQ0FBa0IsVUFBbEIsQ0FBSCxFQUFpQztBQUNoQyxTQUFLLGFBQUwsQ0FBbUIsS0FBbkIsQ0FBeUIsVUFBUyxNQUFULEVBQWdCO0FBQUE7O0FBQ3hDLE9BQUUsSUFBRixDQUFPLEtBQUssV0FBWixFQUF3QixVQUFDLEtBQUQsRUFBTyxJQUFQLEVBQWdCO0FBQ3ZDLFVBQUcsUUFBUSxNQUFYLEVBQWtCO0FBQ2QsYUFBSyxXQUFMLENBQWlCLE1BQWpCLENBQXdCLEtBQXhCLEVBQThCLENBQTlCO0FBQ0gsY0FBTyxLQUFQO0FBQ0E7QUFDRCxNQUxEO0FBTUEsS0FQd0IsQ0FPdkIsSUFQdUIsQ0FPbEIsSUFQa0IsRUFPYixVQVBhLENBQXpCO0FBUUE7QUFDRDs7Ozs7O0FBR0YsT0FBTyxPQUFQLEdBQWlCLFVBQWpCOzs7Ozs7Ozs7QUM5RUE7Ozs7Ozs7Ozs7OztBQVlBLElBQU0sV0FBVyxRQUFRLGVBQVIsQ0FBakI7O0lBRU0sTTtBQUNMOzs7O0FBSUEsaUJBQVksSUFBWixFQUFpQixNQUFqQixFQUF3QjtBQUFBOztBQUFBOztBQUN2QixNQUFHLEtBQUssTUFBTCxJQUFlLENBQWxCLEVBQW9CO0FBQ25CO0FBQ0E7QUFDRCxNQUFJLE1BQU0sRUFBRSxNQUFGLENBQVM7QUFDZixZQUFTO0FBRE0sR0FBVCxFQUVSLE1BRlEsQ0FBVjtBQUdBLE9BQUssS0FBTCxHQUFhLElBQUksUUFBSixDQUFhLEdBQWIsQ0FBYjtBQUNBLE9BQUssRUFBTCxDQUFRLElBQUksT0FBWixFQUFvQixZQUFNO0FBQ3pCLFNBQUssS0FBTCxDQUFXLEtBQVg7QUFDQSxHQUZEO0FBR0E7QUFDRDs7Ozs7Ozs7Ozs7O3lCQVFPLEcsRUFBSTtBQUNWLFFBQUssS0FBTCxDQUFXLFNBQVgsQ0FBcUIsR0FBckI7QUFDQTtBQUNEOzs7Ozs7OzJCQUlTLEcsRUFBSTtBQUNaLFFBQUssS0FBTCxDQUFXLFdBQVgsQ0FBdUIsR0FBdkI7QUFDQTs7Ozs7O0FBR0YsT0FBTyxPQUFQLEdBQWlCLE1BQWpCOzs7Ozs7Ozs7QUNuREE7Ozs7Ozs7QUFPQyxJQUFNLE9BQU8sUUFBUSxXQUFSLENBQWI7O0lBRU0sWTtBQUNMLDBCQUFhO0FBQUE7O0FBQ1osU0FBSyxRQUFMLEdBQWdCLEtBQWhCLENBRFksQ0FDVztBQUN2QixTQUFLLFNBQUwsR0FBaUIsS0FBakIsQ0FGWSxDQUVZO0FBQ3hCLFNBQUssS0FBTCxHQUFhLEVBQWIsQ0FIWSxDQUdLO0FBQ2pCO0FBQ0Q7Ozs7Ozs7aUNBR1k7QUFDWixVQUFHLEtBQUssU0FBUixFQUFrQjtBQUNoQixlQUFPLEtBQVA7QUFDQTtBQUNELGFBQU8sSUFBUDtBQUNBO0FBQ0Q7Ozs7OztrQ0FHYTtBQUNiLFVBQUcsS0FBSyxTQUFMLElBQWtCLEtBQUssUUFBMUIsRUFBbUM7QUFDakMsZUFBTyxLQUFQO0FBQ0E7QUFDRCxhQUFPLElBQVA7QUFDQTtBQUNEOzs7Ozs7Z0NBR1k7QUFDWCxhQUFNLEtBQUssS0FBTCxDQUFXLE1BQVgsR0FBb0IsQ0FBMUIsRUFBNEI7QUFDM0IsWUFBSSxNQUFNLEtBQUssS0FBTCxDQUFXLEtBQVgsRUFBVjtBQUNBLFlBQUcsSUFBSSxJQUFKLElBQVksTUFBZixFQUFzQjtBQUNyQixlQUFLLFNBQUwsQ0FBZSxJQUFJLEdBQW5CO0FBQ0EsU0FGRCxNQUVNLElBQUcsSUFBSSxJQUFKLElBQVksT0FBZixFQUF1QjtBQUM1QixlQUFLLFVBQUwsQ0FBZ0IsSUFBSSxHQUFwQjtBQUNBO0FBQ0Q7QUFDRDtBQUNEOzs7Ozs7OEJBR1UsRyxFQUFJO0FBQ2QsV0FBSyxRQUFMLEdBQWdCLElBQWhCO0FBQ0M7QUFDQSxXQUFLLFFBQUwsR0FBZ0IsS0FBaEI7QUFDQTtBQUNEOzs7Ozs7K0JBR1csRyxFQUFJO0FBQ2YsV0FBSyxTQUFMLEdBQWlCLElBQWpCO0FBQ0M7QUFDQSxXQUFLLFNBQUwsR0FBaUIsS0FBakI7QUFDQTtBQUNEOzs7Ozs7O3lCQUlLLEcsRUFBSTtBQUNSLFVBQUcsS0FBSyxVQUFMLENBQWdCLEdBQWhCLENBQUgsRUFBd0I7QUFDdkIsWUFBRyxLQUFLLFVBQUwsRUFBSCxFQUFxQjtBQUNwQixlQUFLLFNBQUwsQ0FBZSxHQUFmO0FBQ0EsZUFBSyxTQUFMO0FBQ0EsU0FIRCxNQUdLO0FBQ0osZUFBSyxLQUFMLENBQVcsSUFBWCxDQUFnQjtBQUNmLGtCQUFNLE1BRFM7QUFFZixpQkFBSztBQUZVLFdBQWhCO0FBSUE7QUFDRDtBQUNEO0FBQ0Q7Ozs7Ozs7MEJBSU0sRyxFQUFJO0FBQ1QsVUFBRyxLQUFLLFVBQUwsQ0FBZ0IsR0FBaEIsQ0FBSCxFQUF3QjtBQUN2QixZQUFHLEtBQUssV0FBTCxFQUFILEVBQXNCO0FBQ3JCLGVBQUssVUFBTCxDQUFnQixHQUFoQjtBQUNBLGVBQUssU0FBTDtBQUNBLFNBSEQsTUFHSztBQUNKLGVBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0I7QUFDZixrQkFBTSxPQURTO0FBRWYsaUJBQUs7QUFGVSxXQUFoQjtBQUlBO0FBQ0Q7QUFDRDs7Ozs7O0FBR0gsT0FBTyxPQUFQLEdBQWlCLFlBQWpCOzs7Ozs7Ozs7QUNsR0E7Ozs7Ozs7Ozs7Ozs7O0FBY0EsSUFBTSxXQUFXLFFBQVEsZUFBUixDQUFqQjs7SUFFTSxNO0FBQ0w7Ozs7QUFJQSxpQkFBWSxJQUFaLEVBQWlCLE1BQWpCLEVBQXdCO0FBQUE7O0FBQUE7O0FBQ3ZCLE1BQUcsS0FBSyxNQUFMLElBQWUsQ0FBbEIsRUFBb0I7QUFDbkI7QUFDQTtBQUNELE9BQUssS0FBTCxHQUFhLElBQUksUUFBSixDQUFhLE1BQWIsQ0FBYjtBQUNBLE9BQUssRUFBTCxDQUFRLFFBQVIsRUFBaUIsWUFBTTtBQUN0QixTQUFLLEtBQUwsQ0FBVyxLQUFYO0FBQ0EsR0FGRDtBQUdBO0FBQ0Q7Ozs7Ozs7Ozs7Ozt5QkFRVSxHLEVBQUk7QUFDYixRQUFLLEtBQUwsQ0FBVyxTQUFYLENBQXFCLEdBQXJCO0FBQ0E7QUFDRDs7Ozs7OzsyQkFJUyxHLEVBQUk7QUFDWixRQUFLLEtBQUwsQ0FBVyxXQUFYLENBQXVCLEdBQXZCO0FBQ0E7Ozs7OztBQUdGLE9BQU8sT0FBUCxHQUFpQixNQUFqQjs7Ozs7QUNsREE7Ozs7O0FBS0EsSUFBTSxNQUFNLFFBQVEsS0FBUixDQUFaOztBQUVBOzs7O0FBSUEsUUFBUSxTQUFSLEdBQW9CLFVBQVMsSUFBVCxFQUFjO0FBQ2pDLE1BQUcsUUFBUSxJQUFSLElBQWdCLFFBQVEsRUFBM0IsRUFBOEI7QUFDN0IsV0FBTyxJQUFQO0FBQ0E7QUFDRCxTQUFPLEtBQVA7QUFDQSxDQUxEO0FBTUE7Ozs7QUFJQSxRQUFRLFFBQVIsR0FBbUIsVUFBUyxJQUFULEVBQWM7QUFDaEMsU0FBTyxPQUFPLFNBQVAsQ0FBaUIsUUFBakIsQ0FBMEIsSUFBMUIsQ0FBK0IsSUFBL0IsS0FBd0MsaUJBQXhDLElBQTZELEtBQUssV0FBTCxJQUFvQixNQUF4RjtBQUNBLENBWkQ7QUFhQTs7O0FBR0EsUUFBUSxZQUFSLEdBQXVCLFVBQVMsSUFBVCxFQUFjO0FBQ2pDLFNBQU8sT0FBTyxTQUFQLENBQWlCLFFBQWpCLENBQTBCLElBQTFCLENBQStCLElBQS9CLEtBQXdDLGlCQUEvQztBQUNILENBbEJEO0FBbUJBOzs7O0FBSUEsUUFBUSxVQUFSLEdBQXFCLFVBQVMsSUFBVCxFQUFjO0FBQ2xDLFNBQU8sT0FBTyxJQUFQLElBQWUsVUFBdEI7QUFDQSxDQXpCRDtBQTBCQTs7OztBQUlBLFFBQVEsT0FBUixHQUFrQixVQUFTLElBQVQsRUFBYztBQUMvQixTQUFPLE9BQU8sU0FBUCxDQUFpQixRQUFqQixDQUEwQixJQUExQixDQUErQixJQUEvQixLQUF3QyxnQkFBL0M7QUFDQSxDQWhDRDtBQWlDQTs7OztBQUlBLFFBQVEsU0FBUixHQUFvQixVQUFTLElBQVQsRUFBYztBQUNqQyxTQUFPLE9BQU8sSUFBUCxJQUFlLFNBQXRCO0FBQ0EsQ0F2Q0Q7QUF3Q0E7Ozs7QUFJQSxRQUFRLFFBQVIsR0FBbUIsVUFBUyxJQUFULEVBQWM7QUFDaEMsU0FBTyxPQUFPLElBQVAsSUFBZSxRQUF0QjtBQUNBLENBOUNEO0FBK0NBOzs7O0FBSUEsUUFBUSxRQUFSLEdBQW1CLFVBQVMsSUFBVCxFQUFjO0FBQ2hDLFNBQU8sT0FBTyxJQUFQLElBQWUsUUFBdEI7QUFDQSxDQXJERDtBQXNEQTs7OztBQUlBLFFBQVEsZ0JBQVIsR0FBMkIsVUFBUyxJQUFULEVBQWM7QUFDeEMsU0FBTyxRQUFRLElBQVIsSUFBZ0IsS0FBSyxVQUFMLENBQWdCLEtBQUssSUFBckIsQ0FBaEIsSUFBOEMsS0FBSyxNQUFMLEdBQWMsQ0FBbkU7QUFDQSxDQTVERDs7QUE4REE7Ozs7OztBQU1BLFFBQVEsUUFBUixHQUFtQixVQUFTLEdBQVQsRUFBYTtBQUMvQixRQUFNLE9BQU8sU0FBUyxJQUF0Qjs7QUFFQSxTQUFPLElBQUksS0FBSixDQUFVLEdBQVYsRUFBYyxJQUFkLENBQVA7QUFDQSxDQUpEOzs7OztBQy9FQTs7Ozs7Ozs7OztBQVVBLElBQU0sU0FBUyxRQUFRLGFBQVIsQ0FBZjtBQUFBLElBQ0UsZ0JBQWdCLFFBQVEsb0JBQVIsQ0FEbEI7O0FBR0EsT0FBTyxPQUFQLEdBQWlCLElBQUksTUFBSixDQUFXLEVBQUUsTUFBRixDQUFYLEVBQXFCO0FBQ3JDLFdBQVMsZ0JBQWM7QUFEYyxDQUFyQixDQUFqQjs7Ozs7QUNiQTs7Ozs7Ozs7Ozs7O0FBWUEsSUFBTSxTQUFTLFFBQVEsYUFBUixDQUFmOztBQUVBLE9BQU8sT0FBUCxHQUFpQixJQUFJLE1BQUosQ0FBVyxFQUFFLE1BQUYsQ0FBWCxDQUFqQjs7Ozs7Ozs7O0FDZEE7Ozs7Ozs7Ozs7SUFVTyxNO0FBQ0Y7OztBQUdBLGtCQUFhO0FBQUE7O0FBQ1QsU0FBSyxJQUFMLEdBQVksSUFBWjtBQUNILEM7O0lBR0MsYTtBQUNGOzs7O0FBSUEsNkJBQWE7QUFBQTs7QUFDVCxhQUFLLFdBQUwsR0FBbUIsRUFBbkIsQ0FEUyxDQUNjO0FBQzFCO0FBQ0Q7Ozs7Ozs7OzhCQUlLO0FBQ0QsZ0JBQUksWUFBWSxJQUFoQjtBQUNBLGlCQUFJLElBQUksSUFBSSxDQUFSLEVBQVcsTUFBTSxLQUFLLFdBQUwsQ0FBaUIsTUFBdEMsRUFBOEMsSUFBSSxHQUFsRCxFQUF1RCxHQUF2RCxFQUEyRDtBQUN2RCxvQkFBRyxLQUFLLFdBQUwsQ0FBaUIsQ0FBakIsRUFBb0IsSUFBcEIsSUFBNEIsS0FBL0IsRUFBcUM7QUFBRTtBQUNuQyx5QkFBSyxXQUFMLENBQWlCLENBQWpCLEVBQW9CLElBQXBCLEdBQTJCLElBQTNCO0FBQ0EsZ0NBQVksS0FBSyxXQUFMLENBQWlCLENBQWpCLENBQVo7QUFDQTtBQUNIO0FBQ0o7QUFDRCxnQkFBRyxhQUFhLElBQWhCLEVBQXFCO0FBQ2pCLDRCQUFZLElBQUksTUFBSixFQUFaO0FBQ0EscUJBQUssV0FBTCxDQUFpQixJQUFqQixDQUFzQixTQUF0QjtBQUNIO0FBQ0QsbUJBQU8sU0FBUDtBQUNIO0FBQ0Q7Ozs7Ozs7OzRCQUtJLE0sRUFBTztBQUNQLGdCQUFJLFlBQVksSUFBaEI7QUFDQSxpQkFBSSxJQUFJLElBQUksQ0FBUixFQUFXLE1BQU0sS0FBSyxXQUFMLENBQWlCLE1BQXRDLEVBQThDLElBQUksR0FBbEQsRUFBdUQsR0FBdkQsRUFBMkQ7QUFDdkQsb0JBQUcsTUFBSCxFQUFVO0FBQ04sd0JBQUcsS0FBSyxXQUFMLENBQWlCLENBQWpCLEtBQXVCLE1BQTFCLEVBQWlDO0FBQUU7QUFDL0IsNkJBQUssV0FBTCxDQUFpQixDQUFqQixFQUFvQixJQUFwQixHQUEyQixLQUEzQjtBQUNBLG9DQUFZLEtBQUssV0FBTCxDQUFpQixDQUFqQixDQUFaO0FBQ0E7QUFDSDtBQUNKLGlCQU5ELE1BTUs7QUFDRCx3QkFBRyxLQUFLLFdBQUwsQ0FBaUIsQ0FBakIsRUFBb0IsSUFBcEIsSUFBNEIsSUFBL0IsRUFBb0M7QUFDaEMsNkJBQUssV0FBTCxDQUFpQixDQUFqQixFQUFvQixJQUFwQixHQUEyQixLQUEzQjtBQUNBLG9DQUFZLEtBQUssV0FBTCxDQUFpQixDQUFqQixDQUFaO0FBQ0E7QUFDSDtBQUNKO0FBQ0o7QUFDRCxtQkFBTyxTQUFQO0FBQ0g7QUFDRDs7Ozs7OztnQ0FJTztBQUNILGdCQUFJLFNBQVMsSUFBYjtBQUNBLGlCQUFJLElBQUksSUFBSSxDQUFSLEVBQVcsTUFBTSxLQUFLLFdBQUwsQ0FBaUIsTUFBdEMsRUFBOEMsSUFBSSxHQUFsRCxFQUF1RCxHQUF2RCxFQUEyRDtBQUN2RCxvQkFBRyxLQUFLLFdBQUwsQ0FBaUIsQ0FBakIsRUFBb0IsSUFBcEIsSUFBNEIsSUFBL0IsRUFBb0M7QUFBRTtBQUNsQyw2QkFBUyxLQUFUO0FBQ0E7QUFDSDtBQUNKO0FBQ0QsbUJBQU8sTUFBUDtBQUNIOzs7Ozs7QUFHTixPQUFPLE9BQVAsR0FBaUIsYUFBakI7Ozs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDcmhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1dEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiY29uc3QgTW9kZWwgPSByZXF1aXJlKCcuL21vZGVsLmpzJyksXHJcbiAgICAgIEJhc2VWaWV3ID0gcmVxdWlyZSgnY29yZS1iYXNldmlldycpO1xyXG5cclxuQmFzZVZpZXcucmVnaXN0ZXIoe1xyXG4gIF9pbml0OiBmdW5jdGlvbigpe1xyXG4gICAgICAvKipcclxuICAgICAgICog5pmu6YCa5Y2V5Liq6K+35rGCXHJcbiAgICAgICAqICAgICAg6L+Z5Liq6YWN572u6K+05piO5Yqg5YWl5YWo5bGA572R57uc5Li76Zif5YiXXHJcbiAgICAgICAgICAgKiBjdXN0b21jb25maWc6IHtcclxuICAgICAgICAgICAgICAgcXVldWU6IHRydWVcclxuICAgICAgICAgICB9XHJcbiAgICAgICAqL1xyXG4gICAgICBNb2RlbC5saXN0ZGF0YSh7XHJcbiAgICAgICAgICBkYXRhOiB7J25hbWUnOiAnem1yZGxiJ31cclxuICAgICAgICAgIC8vIGN1c3RvbWNvbmZpZzoge1xyXG4gICAgICAgICAgLy8gICAgIHF1ZXVlOiB0cnVlXHJcbiAgICAgICAgICAvLyB9XHJcbiAgICAgIH0se1xyXG4gICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvLyBmYWlsOiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKCfopobnm5bnu5/kuIBmYWls5aSE55CGJyk7XHJcbiAgICAgICAgICAvLyB9LFxyXG4gICAgICAgICAgLy8gZXJyb3I6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAvLyAgICAgY29uc29sZS5sb2coJ+imhueblue7n+S4gGVycm9y5aSE55CGJyk7XHJcbiAgICAgICAgICAvLyB9LFxyXG4gICAgICAgICAgLy8gY29tcGxldGU6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAvLyAgICAgY29uc29sZS5sb2coJ+WujOaIkCcpO1xyXG4gICAgICAgICAgLy8gfVxyXG4gICAgICB9KTtcclxuICAgICAgTW9kZWwubWFpbih7XHJcbiAgICAgICAgICBkYXRhOiB7J25hbWUnOiAnem1yZGxiJ31cclxuICAgICAgICAgIC8vIGN1c3RvbWNvbmZpZzoge1xyXG4gICAgICAgICAgLy8gICAgIHF1ZXVlOiB0cnVlXHJcbiAgICAgICAgICAvLyB9XHJcbiAgICAgIH0se1xyXG4gICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+imhueblue7n+S4gGVycm9y5aSE55CGJyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgIH0se1xyXG4gICAgICAgICAgaWQ6ICcxMDAyJ1xyXG4gICAgICB9KTtcclxuXHJcblxyXG4gICAgICAvL+WNleeLrOWjsOaYjumYn+WIl++8jOaOpeWPo+aMieeFp+mYn+WIl+mhuuW6j+WKoOi9vVxyXG4gICAgICAvLyBNb2RlbC4kaW50ZXJpby50cmFuc1F1ZXVlUmVxdWVzdChbe1xyXG4gICAgICAvLyAgICAgaW9hcmdzOiB7XHJcbiAgICAgIC8vICAgICAgICAgdXJsOiBNb2RlbC5iYXNlaG9zdCsnL2xpc3RkYXRhcycsXHJcbiAgICAgIC8vICAgICAgICAgbWV0aG9kOidQT1NUJ1xyXG4gICAgICAvLyAgICAgfSxcclxuICAgICAgLy8gICAgIGlvY2FsbDoge1xyXG4gICAgICAvLyAgICAgICAgIGVycm9yOiBmdW5jdGlvbigpeyAvL+atpOaOpeWPo+acrOadpeS7gOS5iOmDveS4jei/lOWbnu+8jOaJgOS7peaKium7mOiupOmUmeivr+aPkOekuuimhuebluS6hlxyXG4gICAgICAvLyAgICAgICAgICAgICBjb25zb2xlLmxvZygnL2xpc3RkYXRhcyBlcnJvcicpO1xyXG4gICAgICAvLyAgICAgICAgIH1cclxuICAgICAgLy8gICAgIH1cclxuICAgICAgLy8gfSx7XHJcbiAgICAgIC8vICAgICBpb2FyZ3M6IHtcclxuICAgICAgLy8gICAgICAgICB1cmw6IE1vZGVsLmJhc2Vob3N0KycvbGlzdGRhdGEnLFxyXG4gICAgICAvLyAgICAgICAgIG1ldGhvZDonUE9TVCdcclxuICAgICAgLy8gICAgIH0sXHJcbiAgICAgIC8vICAgICBpb2NhbGw6IHtcclxuICAgICAgLy8gICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKXtcclxuICAgICAgLy8gICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICAgIC8vICAgICAgICAgfVxyXG4gICAgICAvLyAgICAgfVxyXG4gICAgICAvLyB9XSwge1xyXG4gICAgICAvLyAgICAgY29tcGxldGU6IGZ1bmN0aW9uKCl7XHJcbiAgICAgIC8vICAgICAgICAgY29uc29sZS5sb2coJ+mYn+WIl+WFqOmDqOWujOaIkCcpXHJcbiAgICAgIC8vICAgICB9XHJcbiAgICAgIC8vIH0pO1xyXG4gIH1cclxufSk7XHJcbiIsIi8qKlxyXG4gKiDmlL7liLDoh6rlt7Hpobnnm67kuK3vvIznu5/kuIDlrprkuYnnmoRpb+WkhOeQhuWxglxyXG4gKlxyXG4gKiDkvb/nlKhqcXVlcnnmj5DkvpvnmoRhamF45pa55rOV5ZKM5pys6Lqr5bCB6KOF55qEaW/kuJrliqHlsYLlrp7njrBcclxuICovXHJcbmNvbnN0IElvQ29uZmlnID0gcmVxdWlyZSgnbGliaW8taW9jb25maWcnKSxcclxuICAgICAgSW50ZXJpbyA9IHJlcXVpcmUoJ2xpYmlvLWludGVyaW8nKSxcclxuICAgICAgU3RvcmFnZSA9IHJlcXVpcmUoJy4vc3RvcmFnZScpO1xyXG5cclxuIC8qKlxyXG4gICog57uf5LiA5aSE55CG5pyq55m75b2VXHJcbiAgKi9cclxuIElvQ29uZmlnLmxvZ2luLmZpbHRlciA9IGZ1bmN0aW9uKHJlc3VsdCl7XHJcbiAgICAgcmV0dXJuIHJlc3VsdC5jb2RlID09ICdBMDAwMic7XHJcbiB9O1xyXG4gSW9Db25maWcubG9naW4udXJsID0gJ2h0dHA6Ly9iYWlkdS5jb20vJztcclxuXHJcblxyXG4gLyoqXHJcbiAgKiDmiYDmnInmjqXlj6PnmoRpb+S4muWKoemUmeivr+e7n+S4gOWkhOeQhlxyXG4gICovXHJcbiBJb0NvbmZpZy5mYWlsLmZpbHRlciA9IGZ1bmN0aW9uKHJlc3VsdCkge1xyXG4gICAgIHJldHVybiByZXN1bHQuY29kZSAhPSAnQTAwMDEnO1xyXG4gfTtcclxuIElvQ29uZmlnLmlvY2FsbC5mYWlsID0gZnVuY3Rpb24ocmVzdWx0KXtcclxuICAgICBfQVBQLlRvYXN0LnNob3cocmVzdWx0LmVycm1zZyB8fCAn572R57uc6ZSZ6K+vJyk7XHJcbiB9O1xyXG4gSW9Db25maWcuaW9jYWxsLmVycm9yID0gZnVuY3Rpb24oanFYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKXtcclxuICAgICBfQVBQLlRvYXN0LnNob3codGV4dFN0YXR1cyB8fCAn572R57uc6ZSZ6K+vJyk7XHJcbiB9O1xyXG5cclxuIElvQ29uZmlnLmlvYXJncy5iZWZvcmVTZW5kID0gZnVuY3Rpb24oKXtcclxuICAgIC8vICBfQVBQLkxvYWRpbmcuc2hvdygpO1xyXG4gICAgY29uc29sZS5sb2coJ+ivt+axguW8gOWniycpO1xyXG4gfTtcclxuIElvQ29uZmlnLmlvY2FsbC5jb21wbGV0ZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAvLyAgX0FQUC5Mb2FkaW5nLmhpZGUoKTtcclxuICAgIGNvbnNvbGUubG9nKCfor7fmsYLnu5PmnZ8nKTtcclxuIH1cclxuXHJcbiAvL+aUr+aMgei3qOi2ilxyXG4gSW9Db25maWcuaW9hcmdzLmNyb3NzRG9tYWluID0gdHJ1ZTtcclxuIC8qKlxyXG4gICog5pWw5o2u5o6l5Y+j6YWN572uXHJcbiAgKi9cclxuIHZhciBiYXNlaG9zdCA9ICdodHRwOi8vMTI3LjAuMC4xOjgwMDAnO1xyXG5cclxuIC8qKlxyXG4gICogdXJs5qC85byP5YyWXHJcbiAgKiBAZXhhbXBsZSBidWlsZFVybCgnL3Jlci97c2V4fS9mZXdyL3tpZH0nLHtzZXg6J2FhJyxpZDonMTEnfSlcclxuICAqICAgICAgICAgIOi/lOWbnu+8mi9yZXIvYWEvZmV3ci8xMVxyXG4gICovXHJcbiBmdW5jdGlvbiBidWlsZFVybCh1cmwsZGF0YSxpc2VuY29kZSl7XHJcbiAgICAgdmFyIHJlZyA9IC9cXHsoW2EtekEtQV0rKVxcfS9nO1xyXG4gICAgIHJldHVybiB1cmwucmVwbGFjZShyZWcsIGZ1bmN0aW9uIChhbGwsIGtleSkge1xyXG4gICAgICAgICByZXR1cm4gaXNlbmNvZGU/IGVuY29kZVVSSUNvbXBvbmVudChkYXRhW2tleV0pOiBkYXRhW2tleV07XHJcbiAgICAgfSk7XHJcbiB9XHJcbiAvKipcclxuICAqIOivt+axguaVsOaNruWxgm1vZGVsXHJcbiAgKiBAcGFyYW0ge09iamVjdH0gaW9hcmdzIOS8oOWFpeeahOWPguaVsOWQjCRpb2NvbmZpZy5pb2FyZ3PmoLzlvI/kuIDoh7TvvIzkuIDoiKzmmK/vvJpcclxuICAgICAgKiB7XHJcbiAgICAgICogXHQgICBkYXRhOiB7fVxyXG4gICAgICAqIH1cclxuICAgIEBwYXJhbSB7SlNPTn0gKmlvY2FsbCDkvKDlhaXnmoTlj4LmlbDlkIwkaW9jb25maWcuaW9jYWxs5qC85byP5LiA6Ie077yM5LiA6Iis5piv77yaXHJcbiAgICAqIHtcclxuICAgICogICAgIHN1Y2Nlc3NcclxuICAgICogICAgIGNvbXBsZXRlXHJcbiAgICAqICAgICAvL+S7peS4i+W3sue7j+aciee7n+S4gOWkhOeQhu+8jOWmguaenOaDs+imhuebluWImeiHquihjOS8oOWFpVxyXG4gICAgKiAgICAgZXJyb3JcclxuICAgICogICAgIGZhaWxcclxuICAgICogfVxyXG4gICAgQHBhcmFtIHtPYmplY3R9IHVybERhdGEg6ZKI5a+5dXJs6YeM6Z2i5pyJe+abv+aNouWPguaVsOWQjX3nmoTmg4XlhrXvvIzkvKDlhaXnmoTplK7lgLzlr7nlupTmlbDmja5cclxuICAqL1xyXG4gbW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICAgLyoqXHJcbiAgICAgICog6I635Y+W6aG555uu5paH5Lu255uu5b2V57uT5p6EXHJcbiAgICAgICogdXJsRGF0YToge1xyXG4gICAgICAqICAgICBpZFxyXG4gICAgICAqIH1cclxuICAgICAgKi9cclxuICAgICBtYWluOiBmdW5jdGlvbihpb2FyZ3MsaW9jYWxsLHVybERhdGEpe1xyXG4gICAgICAgICB2YXIgX3VybCA9IGJ1aWxkVXJsKGJhc2Vob3N0KycvdHJhY2VyL21haW4vdHJhY2Uve2lkfScsdXJsRGF0YSx0cnVlKTtcclxuICAgICAgICAgSW50ZXJpby50cmFuc1JlcXVlc3QoJC5leHRlbmQoe1xyXG4gICAgICAgICAgICAgdXJsOiBfdXJsLFxyXG4gICAgICAgICAgICAgbWV0aG9kOidHRVQnXHJcbiAgICAgICAgIH0saW9hcmdzKSxpb2NhbGwpO1xyXG4gICAgIH0sXHJcbiAgICAgLyoqXHJcbiAgICAgICog5YiX6KGo5pWw5o2uXHJcbiAgICAgICovXHJcbiAgICAgbGlzdGRhdGE6IGZ1bmN0aW9uKGlvYXJncyxpb2NhbGwpe1xyXG4gICAgICAgICBJbnRlcmlvLnRyYW5zUmVxdWVzdCgkLmV4dGVuZCh7XHJcbiAgICAgICAgICAgICB1cmw6IGJhc2Vob3N0KycvbGlzdGRhdGEnLFxyXG4gICAgICAgICAgICAgbWV0aG9kOidQT1NUJyxcclxuICAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgICog5aaC5p6c5oOz5a+55o6l5Y+j55qE5pWw5o2u6L+b6KGM57yT5a2Y77yM5YiZ6L+b6KGM5Lul5LiL6YWN572uXHJcbiAgICAgICAgICAgICAgKlxyXG4gICAgICAgICAgICAgICog5pWw5o2u57yT5a2Y77yM5pqC5LiN5Yy65YiG5o6l5Y+j6K+35rGC5Y+C5pWwXHJcbiAgICAgICAgICAgICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICBjdXN0b21jb25maWc6IHtcclxuICAgICAgICAgICAgICAgICBzdG9yYWdlOiBTdG9yYWdlLmxpc3RkYXRhIC8v6YWN572u57yT5a2Y5a+56LGh77yM5b+F5aGrXHJcbiAgICAgICAgICAgICAgICAgLy/lpoLmnpzor7fmsYLor6XmjqXlj6PliY3vvIzopoHmuIXmpZrmiYDmnInmnKzlnLDnvJPlrZjvvIzliJnmt7vliqDmraTphY3nva5cclxuICAgICAgICAgICAgICAgICAvL+Wmgu+8muW9k+WJjeaOpeWPo+aYr+eUqOaIt+eZu+W9lS/pgIDlh7rmjqXlj6PvvIzliJnmuIXpmaTmiYDmnInmlY/mhJ/mlbDmja5cclxuICAgICAgICAgICAgICAgICAvLyBjbGVhcmFsbDogdHJ1ZVxyXG4gICAgICAgICAgICAgfVxyXG4gICAgICAgICB9LGlvYXJncyksaW9jYWxsKTtcclxuICAgICB9LFxyXG5cclxuICAgICAvL+eZu+W9leaOpeWPo1xyXG4gICAgIGxvZ2luOiBmdW5jdGlvbihpb2FyZ3MsIGlvY2FsbCl7XHJcbiAgICAgICAgIEludGVyaW8udHJhbnNSZXF1ZXN0KCQuZXh0ZW5kKHtcclxuICAgICAgICAgICAgIHVybDogJy91c2Vycy9sb2dpbicsXHJcbiAgICAgICAgICAgICBtZXRob2Q6J1BPU1QnXHJcbiAgICAgICAgIH0saW9hcmdzKSxpb2NhbGwpO1xyXG4gICAgIH0sXHJcblxyXG4gICAgIC8v5Li65LqG5rWL6K+V77yM5LiA6Iis5LiN6KaBXHJcbiAgICAgJGludGVyaW86IEludGVyaW8sXHJcbiAgICAgYmFzZWhvc3Q6IGJhc2Vob3N0XHJcbiB9O1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyDmlL7liLDoh6rlt7HnmoTpobnnm67kuK3vvIznu5/kuIDnmoTmnKzlnLDlrZjlgqjphY3nva5cclxuICogQHZlcnNpb24gMS4wIHwgMjAxNy0wNS0yNCDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAZXhhbXBsZVxyXG4gKiAqL1xyXG5cclxuY29uc3QgU3RvcmFnZSA9IHJlcXVpcmUoJ2xpYmlvLXN0b3JhZ2UnKTtcclxuXHJcbiAvKipcclxuICAqIOacrOWcsOWtmOWCqOWvueixoeaJgOWxnue7hO+8jOWRveWQjeWPr+iHquihjOS/ruaUueOAgum7mOiupOaYr1pNUkRMQlxyXG4gICogQHR5cGUge1N0cmluZ31cclxuICAqL1xyXG4gLy8gU3RvcmFnZS5ncm91cG5hbWUgPSAnbXlwcm9qZWN0bmFtZSc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgICBsaXN0ZGF0YTogU3RvcmFnZS5jcmVhdGUoe1xyXG4gICAgICAgICBtYXhhZ2U6ICcxRCcsIC8v5L+d5a2YMeWkqVxyXG4gICAgICAgICBrZXk6ICdsaXN0ZGF0YSdcclxuICAgICB9KSxcclxuICAgICBsaXN0ZGF0YXR3bzogU3RvcmFnZS5jcmVhdGUoe1xyXG4gICAgICAgICBtYXhhZ2U6ICcwLjFIJywgLy/kv53lrZgwLjHlsI/ml7ZcclxuICAgICAgICAga2V5OiAnbGlzdGRhdGF0d28nXHJcbiAgICAgfSlcclxufTtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcg6aG16Z2i5Z+65pysdmlld+exu+OAguacgOe7iOS4muWKoemhueebruS4reiQveWcsOmhteeahGpz6YO95b+F6aG75byV55So5q2kanPmiJblhbblrZDnsbtcclxuICogQHZlcnNpb24gMS4wIHwgMjAxNi0xMi0yMCDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAcmV0dXJuXHJcbiAqICovXHJcblxyXG4gY29uc3QgQWxlcnQgPSByZXF1aXJlKCcuLi91aS91aS5hbGVydC5qcycpLFxyXG4gICAgICAgQ29uZmlybSA9IHJlcXVpcmUoJy4uL3VpL3VpLmNvbmZpcm0uanMnKSxcclxuICAgICAgIFRvYXN0ID0gcmVxdWlyZSgnLi4vdWkvdWkudG9hc3QuanMnKSxcclxuICAgICAgIExvYWRpbmcgPSByZXF1aXJlKCcuLi91aS91aS5sb2FkaW5nLmpzJyksXHJcbiAgICAgICBUb29sID0gcmVxdWlyZSgnbGlidXRpbC10b29sJyk7XHJcblxyXG5jbGFzcyBCYXNlVmlldyB7XHJcbiAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgIHRoaXMubmFtZSA9ICd6bXJkbGInO1xyXG4gICAgICAgIC8v57uR5a6a5LiA5Lqb5bi455So55qE57uE5Lu25Yiw5YWo5bGA5Y+Y6YePXHJcbiAgICAgICAgd2luZG93Ll9BUFAgPSB7fTtcclxuICAgICAgICBfQVBQLkFsZXJ0ID0gQWxlcnQ7XHJcbiAgICAgICAgX0FQUC5Db25maXJtID0gQ29uZmlybTtcclxuICAgICAgICBfQVBQLlRvYXN0ID0gVG9hc3Q7XHJcbiAgICAgICAgX0FQUC5Mb2FkaW5nID0gTG9hZGluZztcclxuICAgICAgICBfQVBQLlRvb2wgPSBUb29sO1xyXG4gICAgfVxyXG5cclxuICAgIGluaXQoKXtcclxuICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDms6jlhozkuIDkuKrpobXpnaJcclxuICAgICAqIEBwYXJhbSAge09iamVjdH0gb3B0IOmHjOmdoumFjee9rueahOaJgOacieaWueazlemDvea0vueUn+e7mUJhc2VWaWV355qE5a6e5L6LXHJcbiAgICAgKiB7XHJcbiAgICAgKiAgICAgIF9pbml0OiDmraTmlrnms5Xlv4XpobvmnInvvIzpobXpnaLliJ3lp4vljJbmiafooYxcclxuICAgICAqIH1cclxuICAgICAqIEByZXR1cm4ge2luc3RhbmNlIG9mIEJhc2VWaWV3fSAgICAgW2Rlc2NyaXB0aW9uXVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgcmVnaXN0ZXIob3B0KXtcclxuICAgICAgICB2YXIgdCA9IG5ldyB0aGlzKCk7XHJcbiAgICAgICAgZm9yKHZhciBrZXkgaW4gb3B0KXtcclxuICAgICAgICAgICAgdFtrZXldID0gb3B0W2tleV07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL+WIneWni+WMllxyXG4gICAgICAgIHQuaW5pdCgpO1xyXG5cclxuICAgICAgICByZXR1cm4gdDtcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCYXNlVmlldztcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBcIjxkaXYgY2xhc3M9XFxcInRpdGxlIGpzLXRpdGxlXFxcIj7mj5DnpLo8L2Rpdj48ZGl2IGNsYXNzPVxcXCJib2R5IGpzLWNvbnRlbnRcXFwiPjwvZGl2PjxkaXYgY2xhc3M9Zm9vdGVyPjxhIGhyZWY9amF2YXNjcmlwdDo7IGNsYXNzPWpzLW9rPuehruWumjwvYT48L2Rpdj5cIjtcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IOWFrOWFsWFsZXJ05by55bGCXHJcbiAqIEB2ZXJzaW9uIDEuMCB8IDIwMTYtMTEtMTQg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQHJldHVyblxyXG4gKiAqL1xyXG5cclxuIGNvbnN0IEFsZXJ0U2luZ2xlID0gcmVxdWlyZSgnbGlibGF5ZXItYWxlcnRTaW5nbGUnKSxcclxuICAgICAgICBDc3NzdXBvcnQgPSByZXF1aXJlKCdsaWJ1dGlsLWNzc3N1cG9ydCcpLFxyXG4gICAgICAgIFRwbCA9IHJlcXVpcmUoJy4vdWkuYWxlcnQuaHRtbCcpO1xyXG5cclxuQWxlcnRTaW5nbGUuaGlkZWRlc3Ryb3kgPSBmYWxzZTtcclxuXHJcbkFsZXJ0U2luZ2xlLnNldGNvbmZpZyh7XHJcbiAgICBsYXllcjoge1xyXG4gICAgICAgIGNsYXNzbmFtZTogJ2NvcmV1aS1nLWxheWVyIGNvcmV1aS1nLXdhcm5sYXllciBjb3JldWktZy1sYXllci1hbGVydCcsXHJcbiAgICAgICAgY3VzdG9tOiB7XHJcbiAgICAgICAgICAgIGhpZGU6IGZ1bmN0aW9uKGxheWVyKXtcclxuICAgICAgICAgICAgICAgIGxheWVyLnJlbW92ZUNsYXNzKCdzaG93LXVwJykuYWRkQ2xhc3MoJ2hpZGUtdXAnKTtcclxuICAgICAgICAgICAgICAgIGlmKENzc3N1cG9ydC50cmFuc2l0aW9uKXtcclxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxheWVyLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgQWxlcnRTaW5nbGUuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sMzAwKTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIGxheWVyLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICBBbGVydFNpbmdsZS5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgbWFzazoge1xyXG4gICAgICAgIGNsYXNzbmFtZTogJ2NvcmV1aS1nLW1hc2snLFxyXG4gICAgICAgIG9wYWNpdHk6IENzc3N1cG9ydC50cmFuc2l0aW9uPyAwOiAwLjYsXHJcbiAgICAgICAgY3VzdG9tOiB7XHJcbiAgICAgICAgICAgIGhpZGU6IGZ1bmN0aW9uKG1hc2spe1xyXG4gICAgICAgICAgICAgICAgaWYoQ3Nzc3Vwb3J0LnRyYW5zaXRpb24pe1xyXG4gICAgICAgICAgICAgICAgICAgIG1hc2suY3NzKCdvcGFjaXR5JywwKTtcclxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hc2suaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sMzAwKTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIG1hc2suaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzaG93OiBmdW5jdGlvbihtYXNrKXtcclxuICAgICAgICAgICAgICAgIGlmKENzc3N1cG9ydC50cmFuc2l0aW9uKXtcclxuICAgICAgICAgICAgICAgICAgICBtYXNrLnNob3coKS5jc3MoJ29wYWNpdHknLDAuNik7XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICBtYXNrLnNob3coKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBhbGVydDoge1xyXG4gICAgICAgIGZyYW1ldHBsOiBUcGxcclxuICAgIH1cclxufSk7XHJcblxyXG5BbGVydFNpbmdsZS5jcmVhdGVjYWwuYWRkKGZ1bmN0aW9uKGxheWVyb2JqKXtcclxuICAgIGxheWVyb2JqLmxheWVyLmFkZENsYXNzKCdoaWRlLXVwJyk7XHJcblxyXG4gICAgbGF5ZXJvYmoucG9zLnBvc2NhbC5hZGQoZnVuY3Rpb24oKXtcclxuICAgICAgICBsYXllcm9iai5sYXllci5yZW1vdmVDbGFzcygnaGlkZS11cCcpLmFkZENsYXNzKCdzaG93LXVwJyk7XHJcbiAgICB9KTtcclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEFsZXJ0U2luZ2xlO1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFwiPGRpdiBjbGFzcz1cXFwidGl0bGUganMtdGl0bGVcXFwiPuaPkOekujwvZGl2PjxkaXYgY2xhc3M9XFxcImJvZHkganMtY29udGVudFxcXCI+PC9kaXY+PGRpdiBjbGFzcz1mb290ZXI+PGEgaHJlZj1qYXZhc2NyaXB0OjsgY2xhc3M9XFxcImNhbmNlbCBqcy1jYW5jZWxcXFwiPuWPlua2iDwvYT4gPGEgaHJlZj1qYXZhc2NyaXB0OjsgY2xhc3M9anMtb2s+56Gu5a6aPC9hPiA8aSBjbGFzcz1zcGxpdD48L2k+PC9kaXY+XCI7XG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyDlhazlhbFjb25maXJt5by55bGCXHJcbiAqIEB2ZXJzaW9uIDEuMCB8IDIwMTctMDEtMDYg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQHJldHVyblxyXG4gKiAqL1xyXG5cclxuIGNvbnN0IENvbmZpcm1TaW5nbGUgPSByZXF1aXJlKCdsaWJsYXllci1jb25maXJtU2luZ2xlJyksXHJcbiAgICAgICAgQ3Nzc3Vwb3J0ID0gcmVxdWlyZSgnbGlidXRpbC1jc3NzdXBvcnQnKSxcclxuICAgICAgICBUcGwgPSByZXF1aXJlKCcuL3VpLmNvbmZpcm0uaHRtbCcpO1xyXG5cclxuQ29uZmlybVNpbmdsZS5oaWRlZGVzdHJveSA9IGZhbHNlO1xyXG5cclxuQ29uZmlybVNpbmdsZS5zZXRjb25maWcoe1xyXG4gICAgbGF5ZXI6IHtcclxuICAgICAgICBjbGFzc25hbWU6ICdjb3JldWktZy1sYXllciBjb3JldWktZy13YXJubGF5ZXIgY29yZXVpLWctbGF5ZXItY29uZmlybScsXHJcbiAgICAgICAgY3VzdG9tOiB7XHJcbiAgICAgICAgICAgIGhpZGU6IGZ1bmN0aW9uKGxheWVyKXtcclxuICAgICAgICAgICAgICAgIGxheWVyLnJlbW92ZUNsYXNzKCdzaG93LXVwJykuYWRkQ2xhc3MoJ2hpZGUtdXAnKTtcclxuICAgICAgICAgICAgICAgIGlmKENzc3N1cG9ydC50cmFuc2l0aW9uKXtcclxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxheWVyLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgQ29uZmlybVNpbmdsZS5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwzMDApO1xyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgbGF5ZXIuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIENvbmZpcm1TaW5nbGUuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIG1hc2s6IHtcclxuICAgICAgICBjbGFzc25hbWU6ICdjb3JldWktZy1tYXNrJyxcclxuICAgICAgICBvcGFjaXR5OiBDc3NzdXBvcnQudHJhbnNpdGlvbj8gMDogMC42LFxyXG4gICAgICAgIGN1c3RvbToge1xyXG4gICAgICAgICAgICBoaWRlOiBmdW5jdGlvbihtYXNrKXtcclxuICAgICAgICAgICAgICAgIGlmKENzc3N1cG9ydC50cmFuc2l0aW9uKXtcclxuICAgICAgICAgICAgICAgICAgICBtYXNrLmNzcygnb3BhY2l0eScsMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXNrLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9LDMwMCk7XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICBtYXNrLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2hvdzogZnVuY3Rpb24obWFzayl7XHJcbiAgICAgICAgICAgICAgICBpZihDc3NzdXBvcnQudHJhbnNpdGlvbil7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFzay5zaG93KCkuY3NzKCdvcGFjaXR5JywwLjYpO1xyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFzay5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgY29uZmlybToge1xyXG4gICAgICAgIGZyYW1ldHBsOiBUcGxcclxuICAgIH1cclxufSk7XHJcblxyXG5Db25maXJtU2luZ2xlLmNyZWF0ZWNhbC5hZGQoZnVuY3Rpb24obGF5ZXJvYmope1xyXG4gICAgbGF5ZXJvYmoubGF5ZXIuYWRkQ2xhc3MoJ2hpZGUtdXAnKTtcclxuXHJcbiAgICBsYXllcm9iai5wb3MucG9zY2FsLmFkZChmdW5jdGlvbigpe1xyXG4gICAgICAgIGxheWVyb2JqLmxheWVyLnJlbW92ZUNsYXNzKCdoaWRlLXVwJykuYWRkQ2xhc3MoJ3Nob3ctdXAnKTtcclxuICAgIH0pO1xyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29uZmlybVNpbmdsZTtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcg5Lia5Yqh5Z+65pys5by55bGC57G777yM5aGr5YWF5LqG5LiA5Lqb5qC35byP44CC5Lia5Yqh5omA5pyJ6Ieq5a6a5LmJ5by55bGC5bCG57un5om/5q2k57G7XHJcbiAqIEB2ZXJzaW9uIDEuMCB8IDIwMTYtMTEtMTQg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQHJldHVyblxyXG4gKiAqL1xyXG5cclxuIGNvbnN0IEJvbWJMYXllciA9IHJlcXVpcmUoJ2xpYmxheWVyLWJvbWJMYXllcicpLFxyXG4gICAgICAgIENzc3N1cG9ydCA9IHJlcXVpcmUoJ2xpYnV0aWwtY3Nzc3Vwb3J0Jyk7XHJcblxyXG5jbGFzcyBVSUxheWVyIGV4dGVuZHMgQm9tYkxheWVyIHtcclxuICAgIC8qKlxyXG5cdCAqIOW8ueWxguexu+KAlOKAlOWIm+W7uuW5tua3u+WKoOWIsOaMh+WumuWuueWZqOS4rVxyXG4gICAgICogQHBhcmFtIHtKU09OfSBjb25maWcg5by55bGC6YWN572u5Y+C5pWwIO+8jOS4jeaYr+W/heWhq+mhuVxyXG4gICAgICogXHRcdHtcclxuICAgICAqIFx0ICAgICAgIGNvbnRhaW5lciB7RWxlbWVudH0g5a2Y5pS+5by55bGC55qE5a655Zmo44CC5Y+v5LiN5oyH5a6a77yM6buY6K6k5by55bGC5a2Y5pS+5LqOYm9keeS4reeahOS4gOS4quWKqOaAgeeUn+aIkOeahGRpdumHjFxyXG4gICAgICogXHQgICAgICAgcG9zOnt9LCAvL+WumuS9jeWPguaVsO+8jOWFt+S9k+ivtOaYjuWPr+ingeaWueazlWxheWVyL3Bvc2l0aW9uQm9tYuS4reeahGNvbmZpZ+ivtOaYjlxyXG4gICAgICogICAgICAgICBsYXllcjoge30sIC8v5by55bGC5L+h5oGv5Y+C5pWw77yM5YW35L2T6K+05piO5Y+v6KeB5pa55rOVbGF5ZXIvbGF5ZXLkuK3nmoRjb25maWfor7TmmI5cclxuICAgICAqIFx0XHQgICBtYXNrOiB7IC8v6YGu572p5L+h5oGv5Y+C5pWw77yM5YW35L2T6K+05piO5Y+v6KeB5pa55rOVbGF5ZXIvbWFza+S4reeahGNvbmZpZ+ivtOaYjuOAguWcqOatpOWfuuehgOS4iui/m+ihjOS7peS4i+aJqeWxlVxyXG4gICAgICogXHRcdFx0ICBtYXNrOiB0cnVlLCAvL+aYr+WQpuWIm+W7uumBrue9qVxyXG4gICAgICogICAgICAgICAgICBjbWxoaWRlOiBmYWxzZSAvL+eCueWHu+mBrue9qeaYr+WQpuWFs+mXreW8ueWxglxyXG4gICAgICogXHRcdCAgIH1cclxuICAgICAqICAgICAgfVxyXG5cdCAqL1xyXG4gICAgY29uc3RydWN0b3IoY29uZmlnKXtcclxuICAgICAgICAvL+a3u+WKoOiHquWumuS5ieWPguaVsFxyXG4gICAgICAgIGNvbmZpZyA9ICQuZXh0ZW5kKHRydWUse1xyXG4gICAgICAgICAgICBsYXllcjoge1xyXG4gICAgICAgICAgICAgICAgY2xhc3NuYW1lOiAnY29yZXVpLWctbGF5ZXInLFxyXG4gICAgICAgICAgICAgICAgc2hvdzogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBjdXN0b206IHtcclxuICAgICAgICAgICAgICAgICAgICBoaWRlOiBmdW5jdGlvbihsYXllcil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxheWVyLnJlbW92ZUNsYXNzKCdzaG93LXVwJykuYWRkQ2xhc3MoJ2hpZGUtdXAnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoQ3Nzc3Vwb3J0LnRyYW5zaXRpb24pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxheWVyLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5oaWRlYWZ0ZXJjYWwuZmlyZSgpOyAvL+WxgumakOiXj+WQjuWbnuiwg1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwzMDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxheWVyLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmhpZGVhZnRlcmNhbC5maXJlKCk7IC8v5bGC6ZqQ6JeP5ZCO5Zue6LCDXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG1hc2s6IHtcclxuICAgICAgICAgICAgICAgIGNsYXNzbmFtZTogJ2NvcmV1aS1nLW1hc2snLFxyXG4gICAgICAgICAgICAgICAgb3BhY2l0eTogQ3Nzc3Vwb3J0LnRyYW5zaXRpb24/IDA6IDAuNixcclxuICAgICAgICAgICAgICAgIGN1c3RvbToge1xyXG4gICAgICAgICAgICAgICAgICAgIGhpZGU6IGZ1bmN0aW9uKG1hc2spe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihDc3NzdXBvcnQudHJhbnNpdGlvbil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXNrLmNzcygnb3BhY2l0eScsMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFzay5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LDMwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFzay5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHNob3c6IGZ1bmN0aW9uKG1hc2spe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihDc3NzdXBvcnQudHJhbnNpdGlvbil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXNrLnNob3coKS5jc3MoJ29wYWNpdHknLDAuNik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFzay5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LGNvbmZpZyB8fCB7fSk7XHJcblxyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB2YXIgX2xheWVyID0gdGhpcy5sYXllcjtcclxuXHJcbiAgICAgICAgX2xheWVyLmFkZENsYXNzKCdoaWRlLXVwJyk7XHJcblxyXG4gICAgICAgIHRoaXMucG9zLnBvc2NhbC5hZGQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgX2xheWVyLnJlbW92ZUNsYXNzKCdoaWRlLXVwJykuYWRkQ2xhc3MoJ3Nob3ctdXAnKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBoaWRlKCl7XHJcbiAgICAgICAgaWYodGhpcy5pc3Nob3coKSl7XHJcblx0XHRcdHRoaXMuaGlkZWJlZm9yZWNhbC5maXJlKCk7IC8v5bGC6ZqQ6JeP5YmN5Zue6LCDXHJcblx0XHRcdHRoaXMubWFzayAmJiB0aGlzLm1hc2suaGlkZSgpO1xyXG5cdFx0XHR0aGlzLl9oaWRlKCk7XHJcblx0XHR9XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVUlMYXllcjtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcgbG9hZGluZyDmj5DnpLrlsYJcclxuICogQHZlcnNpb24gMS4wIHwgMjAxNi0wMS0wNiDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAcmV0dXJuXHJcbiAqICovXHJcbiBjb25zdCBVSUxheWVyID0gcmVxdWlyZSgnLi91aS5sYXllci5qcycpLFxyXG4gICAgICAgIFdvcmtlckNvbnRyb2wgPSByZXF1aXJlKCdsaWJ1dGlsLXdvcmtlckNvbnRyb2wnKTtcclxuXHJcbnZhciB3b3JrZXJDb250cm9sID0gbmV3IFdvcmtlckNvbnRyb2woKTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUxvYWRpbmcod29ya2VyKXtcclxuICAgIHdvcmtlci5sb2FkaW5nID0gbmV3IFVJTGF5ZXIoe1xyXG4gICAgICAgIGxheWVyOiB7XHJcbiAgICAgICAgICAgIGNsYXNzbmFtZTogJ2NvcmV1aS1nLWxheWVyIGNvcmV1aS1nLWxheWVyLWxvYWRpbmcnXHJcbiAgICAgICAgfSxcclxuICAgICAgICBtYXNrOiB7XHJcbiAgICAgICAgICAgIGJnY29sb3I6ICd0cmFuc3BhcmVudCcgLy/og4zmma/oibJcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB3b3JrZXIubG9hZGluZy5oaWRlYWZ0ZXJjYWwuYWRkKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgd29ya2VyLmxvYWRpbmcuZGVzdHJveSgpO1xyXG4gICAgICAgIHdvcmtlci5sb2FkaW5nID0gbnVsbDtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiB3b3JrZXIubG9hZGluZztcclxufVxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgc2hvdzogZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgbG9hZGluZyA9IGNyZWF0ZUxvYWRpbmcod29ya2VyQ29udHJvbC5nZXQoKSk7XHJcbiAgICAgICAgbG9hZGluZy5zaG93KCk7XHJcbiAgICB9LFxyXG4gICAgaGlkZTogZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgd29ya2VyID0gd29ya2VyQ29udHJvbC5lbmQoKTtcclxuICAgICAgICBpZih3b3JrZXIpe1xyXG4gICAgICAgICAgICB3b3JrZXIubG9hZGluZy5oaWRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IHRvYXN0IOaPkOekuuWxglxyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE2LTAxLTA2IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm5cclxuICogKi9cclxuIGNvbnN0IFVJTGF5ZXIgPSByZXF1aXJlKCcuL3VpLmxheWVyLmpzJyksXHJcbiAgICAgICAgV29ya2VyQ29udHJvbCA9IHJlcXVpcmUoJ2xpYnV0aWwtd29ya2VyQ29udHJvbCcpO1xyXG5cclxudmFyIHdvcmtlckNvbnRyb2wgPSBuZXcgV29ya2VyQ29udHJvbCgpO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlVG9hc3Qod29ya2VyKXtcclxuICAgIHdvcmtlci50b2FzdCA9IG5ldyBVSUxheWVyKHtcclxuICAgICAgICBsYXllcjoge1xyXG4gICAgICAgICAgICBjbGFzc25hbWU6ICdjb3JldWktZy1sYXllciBjb3JldWktZy1sYXllci10b2FzdCdcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1hc2s6IHtcclxuICAgICAgICAgICAgYmdjb2xvcjogJyNmZmYnIC8v6IOM5pmv6ImyXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgd29ya2VyLnRvYXN0LmhpZGVhZnRlcmNhbC5hZGQoZnVuY3Rpb24oKXtcclxuICAgICAgICB3b3JrZXIudG9hc3QuZGVzdHJveSgpO1xyXG4gICAgICAgIHdvcmtlci50b2FzdCA9IG51bGw7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gd29ya2VyLnRvYXN0O1xyXG59XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBzaG93OiBmdW5jdGlvbihjb250ZW50LGhpZGVhZnRlcmNhbCl7XHJcbiAgICAgICAgdmFyIHRvYXN0ID0gY3JlYXRlVG9hc3Qod29ya2VyQ29udHJvbC5nZXQoKSk7XHJcbiAgICAgICAgdG9hc3Quc2V0Q29udGVudChjb250ZW50KTtcclxuICAgICAgICB0b2FzdC5oaWRlYWZ0ZXJjYWwuYWRkKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGlmKHR5cGVvZiBoaWRlYWZ0ZXJjYWwgPT0gJ2Z1bmN0aW9uJyl7XHJcbiAgICAgICAgICAgICAgICBoaWRlYWZ0ZXJjYWwoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRvYXN0LnNob3coKTtcclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHRvYXN0LmhpZGUoKTtcclxuICAgICAgICB9LDIwMDApO1xyXG4gICAgfVxyXG59XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IGlv5o6l5Y+j6K+35rGC5o6n5Yi25Zmo77yM5ZyoJC5hamF45LiK6L+b6KGM6L+b5LiA5q2l5bCB6KOFXHJcbiAqICAgICAgMS4g5pSv5oyB5o6l5Y+j6Zif5YiX6K+35rGCXHJcbiAqICAgICAgMi4g5pSv5oyB5o6l5Y+j5pWw5o2u57yT5a2YXHJcbiAqICAgICAgMy4g5pSv5oyB5o6l5Y+j57uf5LiA5Lia5Yqh6ZSZ6K+v5Y+K5YW25LuW5oOF5Ya15aSE55CGXHJcbiAqIEB2ZXJzaW9uIDEuMCB8IDIwMTUtMDYtMjgg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQHJldHVybiDmm7TlpJror6bnu4bkv6Hmga/lj4LogIPku6PnoIHph4zlr7nlupTlrprkuYnmlrnms5XmiJblsZ7mgKfkvY3nva7nmoTms6jph4ror7TmmI5cclxuICogXHR0cmFuc1JlcXVlc3Qge0Z1bmN0aW9ufSDmiafooYzmjqXlj6PmjqXlj6Por7fmsYJcclxuICogIHRyYW5zUXVldWVSZXF1ZXN0IHtGdW5jdGlvbn0g5a+55LiA57uE6K+35rGC6L+b6KGM5Y2V54us55qE6Zif5YiX5o6n5Yi25L6d5qyh6K+35rGC44CC5YWo6YOo6K+35rGC5a6M5q+V5ZCO6L+b6KGM6YCa55+l44CCXHJcbiAqIEBleGFtcGxlXHJcbiAqICAgdmFyIGJhc2Vob3N0ID0gJ2h0dHA6Ly8xMjcuMC4wLjE6ODAwMCc7XHJcbiAqXHJcbiAqIFx0IGNvbnN0IEludGVySW8gPSByZXF1aXJlKCdsaWJpby1pbnRlcmlvJyk7XHJcbiAqXHJcbiAqIFx0IEludGVySW8udHJhbnNSZXF1ZXN0KHtcclxuXHRcdCB1cmw6IGJhc2Vob3N0KycvbGlzdGRhdGEnLFxyXG5cdFx0IG1ldGhvZDonUE9TVCcsXHJcblx0XHQgZGF0YTogeyduYW1lJzogJ3ptcmRsYid9XHJcblx0IH0se1xyXG5cdFx0IHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpe1xyXG5cdFx0XHQgY29uc29sZS5sb2coZGF0YSk7XHJcblx0XHQgfVxyXG5cdFx0IC8vIGZhaWw6IGZ1bmN0aW9uKCl7XHJcblx0XHQgLy8gICAgIGNvbnNvbGUubG9nKCfopobnm5bnu5/kuIBmYWls5aSE55CGJyk7XHJcblx0XHQgLy8gfSxcclxuXHRcdCAvLyBlcnJvcjogZnVuY3Rpb24oKXtcclxuXHRcdCAvLyAgICAgY29uc29sZS5sb2coJ+imhueblue7n+S4gGVycm9y5aSE55CGJyk7XHJcblx0XHQgLy8gfSxcclxuXHRcdCAvLyBjb21wbGV0ZTogZnVuY3Rpb24oKXtcclxuXHRcdCAvLyAgICAgY29uc29sZS5sb2coJ+WujOaIkCcpO1xyXG5cdFx0IC8vIH1cclxuXHQgfSk7XHJcbiAqICovXHJcblxyXG5jb25zdCBJb0NvbmZpZyA9IHJlcXVpcmUoJy4vaW9jb25maWcuanMnKSxcclxuXHRcdFN0b3JhZ2UgPSByZXF1aXJlKCcuL3N0b3JhZ2UuanMnKTtcclxuXHJcbi8v6K+35rGC6Zif5YiX5o6n5Yi257G7XHJcbmZ1bmN0aW9uIHF1ZXVlSGFuZGxlKCl7XHJcblx0dGhpcy5xdWV1ZSA9IFtdOyAvL+W9k+WJjemYn+WIl+aVsOaNrlxyXG5cdHRoaXMuaW5wcm9jZXNzID0gZmFsc2U7IC8v5b2T5YmN6Zif5YiX5o6l5Y+j5piv5ZCm5q2j5Zyo5aSE55CGXHJcblx0dGhpcy5jb21wbGV0ZSA9IGZ1bmN0aW9uKCl7fTsgLy/pmJ/liJfor7fmsYLlrozmiJDlkI7nmoTlm57osINcclxufTtcclxuLy/miafooYzpmJ/liJfmlbDmja7or7fmsYJcclxucXVldWVIYW5kbGUucHJvdG90eXBlLmFkdmFuY2UgPSBmdW5jdGlvbigpe1xyXG5cdGlmKHRoaXMucXVldWUubGVuZ3RoID09IDApe1xyXG5cdFx0dGhpcy5pbnByb2Nlc3MgPSBmYWxzZTtcclxuXHRcdGlmKHR5cGVvZiB0aGlzLmNvbXBsZXRlID09ICdmdW5jdGlvbicpe1xyXG5cdFx0XHR0aGlzLmNvbXBsZXRlKCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cdHZhciByZXEgPSB0aGlzLnF1ZXVlLnNoaWZ0KCk7XHJcblx0dGhpcy5yZXF1ZXN0KHJlcSx0cnVlKTtcclxufTtcclxuLyoqXHJcbiog5re75Yqg5o6l5Y+j6K+35rGC5aSE55CGXHJcbiogQHBhcmFtIHtKU09OfSAqb3B0IGZvcm1hdOWQjueahOaOpeWPo+WPguaVsFxyXG4qIEBwYXJhbSB7Qm9vbGVhbn0gYWR2YW5jZSDmmK/lkKbmmK9xdWV1ZUhhbmRlci5hZHZhbmNl6LCD55SoXHJcbiovXHJcbnF1ZXVlSGFuZGxlLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24ob3B0LGFkdmFuY2Upe1xyXG5cdGlmKHRoaXMuaW5wcm9jZXNzICYmICFhZHZhbmNlKXtcclxuXHRcdHRoaXMucXVldWUucHVzaChvcHQpO1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHR0aGlzLmlucHJvY2VzcyA9IHRydWU7XHJcblx0cmVxdWVzdChvcHQpO1xyXG59O1xyXG4vKipcclxuICogcXVldWVIYW5kbGXlr7nosaHmjqfliLblmahcclxuICovXHJcbnZhciBxdWV1ZUNvbnRyb2wgPSB7XHJcblx0X3F1ZXVlb2JqczogW10sIC8vcXVldWVIYW5kbGXlr7nosaHliJfooahcclxuXHRnZXQ6IGZ1bmN0aW9uKCl7IC8v6L+U5Zue5b2T5YmN56m66Zey55qEcXVldWVIYW5kbGXlr7nosaFcclxuXHRcdHZhciBjdXJxdWV1ZSA9IG51bGw7XHJcblx0XHR2YXIgcXVldWVvYmpzID0gdGhpcy5fcXVldWVvYmpzO1xyXG5cdFx0Zm9yKHZhciBpID0gMCwgbGVuID0gcXVldWVvYmpzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcclxuXHRcdFx0aWYocXVldWVvYmpzW2ldLmlucHJvY2VzcyA9PSBmYWxzZSAmJiBxdWV1ZW9ianNbaV0ubG9jayA9PSBmYWxzZSl7IC8v5pei5peg6K+35rGC5Y+I5rKh5pyJ6KKr6ZSB5a6aXHJcblx0XHRcdFx0cXVldWVvYmpzW2ldLmxvY2sgPSB0cnVlO1xyXG5cdFx0XHRcdGN1cnF1ZXVlID0gcXVldWVvYmpzW2ldO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRpZihjdXJxdWV1ZSA9PSBudWxsKXtcclxuXHRcdFx0Y3VycXVldWUgPSBuZXcgcXVldWVIYW5kbGUoKTtcclxuXHRcdFx0Y3VycXVldWUubG9jayA9IHRydWU7XHJcblx0XHRcdHRoaXMuX3F1ZXVlb2Jqcy5wdXNoKGN1cnF1ZXVlKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBjdXJxdWV1ZTtcclxuXHR9LFxyXG5cdGVuZDogZnVuY3Rpb24ocXVldWUpeyAvL+mAmuefpeW9k+WJjXF1ZXVlSGFuZGxl5a+56LGh5bey57uP5L2/55So5a6M5q+VXHJcblx0XHR2YXIgcXVldWVvYmpzID0gdGhpcy5fcXVldWVvYmpzO1xyXG5cdFx0Zm9yKHZhciBpID0gMCwgbGVuID0gcXVldWVvYmpzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcclxuXHRcdFx0aWYocXVldWVvYmpzW2ldID09IHF1ZXVlKXsgLy/ml6Lml6Dor7fmsYLlj4jmsqHmnInooqvplIHlrppcclxuXHRcdFx0XHRxdWV1ZW9ianNbaV0ubG9jayA9IGZhbHNlO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG4vKipcclxuICog5qC85byP5YyWaW/mjqXlj6Por7fmsYLlj4LmlbBcclxuICogQHBhcmFtIHtKU09OfSAqaW9vcHQg5pWw5o2u5o6l5Y+j5Y+C5pWwXHJcbiAqIHBhcmFtIHtKU09OfSAqaW9jYWxsIGlv6K+35rGC5Zue6LCDXHJcbiAqIEBwYXJhbSB7cXVldWVIYW5kbGV9ICpxdWV1ZW9iaiDpmJ/liJfmjqfliLblmajlr7nosaFcclxuICovXHJcbmZ1bmN0aW9uIGZvcm1hdChpb2FyZ3MsaW9jYWxsLHF1ZXVlb2JqKXtcclxuXHR2YXIgX2lvYXJncyA9IHt9LCBfaW9jYWxsID0ge307XHJcblx0JC5leHRlbmQodHJ1ZSxfaW9hcmdzLElvQ29uZmlnLmlvYXJncyxpb2FyZ3MpO1xyXG5cdCQuZXh0ZW5kKHRydWUsX2lvY2FsbCxJb0NvbmZpZy5pb2NhbGwsaW9jYWxsKTtcclxuXHRJb0NvbmZpZy5mb3JtYXQoX2lvYXJncyk7XHJcblx0dmFyIG9sZHN1Y2Nlc3MgPSBfaW9jYWxsLnN1Y2Nlc3M7XHJcblx0dmFyIG9sZGNvbXBsZXRlID0gX2lvY2FsbC5jb21wbGV0ZTtcclxuXHR2YXIgZGVhbGxvZ2luID0gX2lvYXJncy5jdXN0b21jb25maWcuZGVhbGxvZ2luO1xyXG5cdHZhciBkZWFsZmFpbCA9IF9pb2FyZ3MuY3VzdG9tY29uZmlnLmRlYWxmYWlsO1xyXG5cdHZhciBkZWFsZGF0YSA9IF9pb2FyZ3MuY3VzdG9tY29uZmlnLmRlYWxkYXRhO1xyXG5cdF9pb2NhbGwuc3VjY2VzcyA9IGZ1bmN0aW9uKGRhdGEsIHRleHRTdGF0dXMsIGpxWEhSKXsgLy/ph43lhplzdWNjZXNz5pa55rOV77yM55So5p2l5aSE55CG5pyq55m76ZmG6Zeu6aKYXHJcblx0XHRpZihkZWFsbG9naW4gJiYgdHlwZW9mIElvQ29uZmlnLmxvZ2luLmZpbHRlciA9PSAnZnVuY3Rpb24nKXsgLy/nm5HmtYvmmK/lkKbmnInmnKrnmbvpmYbplJnor6/lpITnkIZcclxuXHRcdFx0aWYoSW9Db25maWcubG9naW4uZmlsdGVyKGRhdGEpKXsgLy/mnKrnmbvlvZVcclxuXHRcdFx0ICAgIGlmKElvQ29uZmlnLmxvZ2luLnVybCAhPSAnJyl7IC8v6Lez6L2sdXJsXHJcblx0XHRcdCAgICAgICAgdmFyIGxvZ2ludXJsID0gSW9Db25maWcubG9naW4udXJsO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWFyY2ggPSBJb0NvbmZpZy5sb2dpbi5rZXkrJz0nK2VuY29kZVVSSUNvbXBvbmVudChsb2NhdGlvbi5ocmVmKTtcclxuICAgICAgICAgICAgICAgICAgICBpZihsb2dpbnVybC5sYXN0SW5kZXhPZignPycpICE9IC0xKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9naW51cmwgPSBsb2dpbnVybC5yZXBsYWNlKC9cXD8vLCc/JytzZWFyY2gpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dpbnVybCA9IGxvZ2ludXJsKyc/JytzZWFyY2g7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSBsb2dpbnVybDtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcblx0XHRcdCAgICB9ZWxzZSBpZih0eXBlb2YgSW9Db25maWcubG9naW4uZGVhbCA9PSAnZnVuY3Rpb24nKXtcclxuXHRcdFx0ICAgICAgICBJb0NvbmZpZy5sb2dpbi5kZWFsKGRhdGEpO1xyXG5cdFx0XHQgICAgICAgIHJldHVybjtcclxuXHRcdFx0ICAgIH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0aWYoZGVhbGZhaWwgJiYgdHlwZW9mIElvQ29uZmlnLmZhaWwuZmlsdGVyID09ICdmdW5jdGlvbicpeyAvL+ajgOa1i+aYr+WQpuacieS4muWKoemUmeivr+WkhOeQhlxyXG5cdFx0ICAgIGlmKElvQ29uZmlnLmZhaWwuZmlsdGVyKGRhdGEpKXsgLy/kuJrliqHplJnor69cclxuXHRcdCAgICAgICAgaWYodHlwZW9mIF9pb2NhbGxbSW9Db25maWcuZmFpbC5mdW5uYW1lXSA9PSAnZnVuY3Rpb24nKXtcclxuXHRcdCAgICAgICAgICAgIF9pb2NhbGxbSW9Db25maWcuZmFpbC5mdW5uYW1lXShkYXRhLCB0ZXh0U3RhdHVzLCBqcVhIUik7XHJcblx0XHQgICAgICAgIH1cclxuXHRcdCAgICB9ZWxzZXsgLy/kuJrliqHmiJDlip9cclxuXHRcdCAgICAgICAgaWYoZGVhbGRhdGEpeyAvL+e7n+S4gOWkhOeQhuS4muWKoeaIkOWKn+aVsOaNrlxyXG5cdFx0ICAgICAgICAgICAgdHlwZW9mIG9sZHN1Y2Nlc3MgPT0gJ2Z1bmN0aW9uJyAmJiBvbGRzdWNjZXNzKF9pb2FyZ3MuZGVhbGRhdGEoZGF0YSwgdGV4dFN0YXR1cywganFYSFIpLCB0ZXh0U3RhdHVzLCBqcVhIUik7XHJcblx0XHQgICAgICAgIH1lbHNle1xyXG5cdFx0ICAgICAgICAgICAgdHlwZW9mIG9sZHN1Y2Nlc3MgPT0gJ2Z1bmN0aW9uJyAmJiBvbGRzdWNjZXNzKGRhdGEsIHRleHRTdGF0dXMsIGpxWEhSKTtcclxuXHRcdCAgICAgICAgfVxyXG5cdFx0ICAgIH1cclxuXHRcdH1lbHNle1xyXG5cdFx0ICAgIHR5cGVvZiBvbGRzdWNjZXNzID09ICdmdW5jdGlvbicgJiYgb2xkc3VjY2VzcyhkYXRhLCB0ZXh0U3RhdHVzLCBqcVhIUik7XHJcblx0XHR9XHJcblx0fTtcclxuXHRpZihfaW9hcmdzLmN1c3RvbWNvbmZpZy5xdWV1ZSl7IC8v6K+05piO5o6l5Y+j5ZCM5oSP6L+b6KGM6Zif5YiX5o6n5Yi2XHJcblx0XHRfaW9jYWxsLmNvbXBsZXRlID0gZnVuY3Rpb24oKXsgLy/ph43lhpnmjqXlj6Por7fmsYLlrozmiJDkuovku7ZcclxuXHRcdFx0cXVldWVvYmouYWR2YW5jZSgpO1xyXG5cdFx0XHR0eXBlb2Ygb2xkY29tcGxldGUgPT0gJ2Z1bmN0aW9uJyAmJiBvbGRjb21wbGV0ZS5hcHBseSh0aGlzLEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xyXG5cdFx0fTtcclxuXHR9XHJcblx0cmV0dXJuIHtcclxuXHRcdGlvYXJnczogX2lvYXJncyxcclxuXHRcdGlvY2FsbDogX2lvY2FsbFxyXG5cdH07XHJcbn1cclxuZnVuY3Rpb24gZG9hamF4KGlvYXJncyxpb2NhbGwpe1xyXG5cdHZhciBpbnRlcm9iaiA9IG51bGwsXHJcblx0XHRnZXRJbnRlciA9IGlvYXJncy5jdXN0b21jb25maWcuZ2V0SW50ZXIsXHJcblx0XHRzdG9yYWdlID0gaW9hcmdzLmN1c3RvbWNvbmZpZy5zdG9yYWdlO1xyXG5cdGRlbGV0ZSBpb2FyZ3MuY3VzdG9tY29uZmlnO1xyXG5cclxuXHRpbnRlcm9iaiA9ICQuYWpheChpb2FyZ3MpLmRvbmUoaW9jYWxsLnN1Y2Nlc3MpLmZhaWwoaW9jYWxsLmVycm9yKS5hbHdheXMoaW9jYWxsLmNvbXBsZXRlKS5kb25lKGZ1bmN0aW9uKGRhdGEpe1xyXG5cdFx0aWYoc3RvcmFnZSAmJiBzdG9yYWdlIGluc3RhbmNlb2YgU3RvcmFnZSl7XHJcblx0XHRcdHN0b3JhZ2Uuc2V0KGRhdGEpO1xyXG5cdFx0fVxyXG5cdH0pO1xyXG5cdGlmKGludGVyb2JqICYmIHR5cGVvZiBnZXRJbnRlciA9PSAnZnVuY3Rpb24nKXtcclxuXHRcdGdldEludGVyKGludGVyb2JqKTtcclxuXHR9XHJcbn1cclxuLyoqXHJcbiAqIOWkhOeQhuaOpeWPo+ivt+axglxyXG4gKiBAcGFyYW0ge0pTT059IGlvb3B0IGZvcm1hdOWQjueahOaOpeWPo+WPguaVsFxyXG4gKi9cclxuZnVuY3Rpb24gcmVxdWVzdChpb29wdCl7XHJcblx0dmFyIF9pb2FyZ3MgPSBpb29wdC5pb2FyZ3MsXHJcblx0XHRfaW9jYWxsID0gaW9vcHQuaW9jYWxsLFxyXG5cdFx0bW9kZSA9IF9pb2FyZ3MuY3VzdG9tY29uZmlnLm1vZGUsXHJcblx0XHRjbGVhcmFsbCA9IF9pb2FyZ3MuY3VzdG9tY29uZmlnLmNsZWFyYWxsLFxyXG5cdFx0c3RvcmFnZSA9IF9pb2FyZ3MuY3VzdG9tY29uZmlnLnN0b3JhZ2UsXHJcblx0XHRjYWNoZWRhdGEgPSBudWxsO1xyXG5cclxuXHQvL+a4hemZpOaJgOaciee8k+WtmFxyXG5cdGlmKGNsZWFyYWxsKXtcclxuXHRcdFN0b3JhZ2UuY2xlYXIoKTtcclxuXHR9XHJcblxyXG5cdC8v5piv5ZCm5pyJ57yT5a2YXHJcblx0aWYoc3RvcmFnZSAmJiBzdG9yYWdlIGluc3RhbmNlb2YgU3RvcmFnZSAmJiAoKGNhY2hlZGF0YSA9IHN0b3JhZ2UuZ2V0KCkpICE9IG51bGwpKXtcclxuXHRcdF9pb2NhbGwuc3VjY2VzcyhjYWNoZWRhdGEsICdzdWNjZXNzJywgbnVsbCk7XHJcblx0XHRfaW9jYWxsLmNvbXBsZXRlKCk7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cclxuXHRpZihtb2RlID09ICdhamF4Jyl7XHJcblx0XHRpZihfaW9hcmdzLmRhdGFUeXBlID09IHVuZGVmaW5lZCB8fCBfaW9hcmdzLmRhdGFUeXBlID09ICcnKXtcclxuXHRcdFx0X2lvYXJncy5kYXRhVHlwZSA9ICdqc29uJztcclxuXHRcdH1cclxuXHRcdGRvYWpheChfaW9hcmdzLF9pb2NhbGwpO1xyXG5cdH1lbHNlIGlmKG1vZGUgPT0gJ2pzb25wJyl7XHJcblx0XHRfaW9hcmdzLmRhdGFUeXBlID0gJ2pzb25wJztcclxuXHRcdF9pb2FyZ3MuY3Jvc3NEb21haW4gPSB0cnVlO1xyXG5cdFx0ZG9hamF4KF9pb2FyZ3MsX2lvY2FsbCk7XHJcblx0fWVsc2UgaWYobW9kZSA9PSAnc2NyaXB0Jyl7XHJcblx0XHRfaW9hcmdzLmRhdGFUeXBlID0gJ3NjcmlwdCc7XHJcblx0XHRfaW9hcmdzLmNyb3NzRG9tYWluID0gdHJ1ZTtcclxuXHRcdGRvYWpheChfaW9hcmdzLF9pb2NhbGwpO1xyXG5cdH1cclxufVxyXG52YXIgbWFpbnF1ZXVlID0gbmV3IHF1ZXVlSGFuZGxlKCk7IC8v5Li757q/56iL6Zif5YiX5o6n5Yi25a+56LGhXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdC8qKlxyXG5cdCAqIOaJp+ihjOaOpeWPo+ivt+axglxyXG4gICAgICogQHBhcmFtIHtKU09OfSAqaW9hcmdzIOaOpeWPo+aJqeWxleWPguaVsOOAguWvueW6lGlvY29uZmlnLmpz6YeM55qEaW9hcmdz6YWN572u5qC85byPXHJcbiAgICAgKiBAcGFyYW0ge0pTT059ICppb2NhbGwg5o6l5Y+j5omp5bGV5Y+C5pWw44CC5a+55bqUaW9jb25maWcuanPph4znmoRpb2NhbGzphY3nva7moLzlvI9cclxuXHQgKi9cclxuXHR0cmFuc1JlcXVlc3Q6IGZ1bmN0aW9uKGlvYXJncyxpb2NhbGwpe1xyXG5cdFx0aWYoaW9hcmdzICYmIGlvY2FsbCAmJiBpb2FyZ3MudXJsICE9ICcnKXtcclxuXHRcdFx0dmFyIGN1cm9wdCA9IGZvcm1hdChpb2FyZ3MsaW9jYWxsLG1haW5xdWV1ZSk7XHJcblx0XHRcdGlmKGN1cm9wdC5pb2FyZ3MuY3VzdG9tY29uZmlnLnF1ZXVlKXsgLy/or7TmmI7pgbXlvqrpmJ/liJfmjqfliLZcclxuXHRcdFx0XHRtYWlucXVldWUucmVxdWVzdChjdXJvcHQpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2V7XHJcblx0XHRcdFx0cmVxdWVzdChjdXJvcHQpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSxcclxuXHQvKipcclxuXHQgKiDlr7nkuIDnu4Tor7fmsYLov5vooYzljZXni6znmoTpmJ/liJfmjqfliLbkvp3mrKHor7fmsYLjgILlhajpg6jor7fmsYLlrozmr5XlkI7ov5vooYzpgJrnn6XjgIJcclxuXHQgKiDmraTmg4XlhrXkuIvvvIzpgJrov4dpb2FyZ3Porr7nva7nmoTlj4LmlbDphY3nva5jdXN0b21jb25maWc6e3F1ZXVlOnRydWV8ZmFsc2V95peg5pWI44CC5by65Yi26YO96LWw6Zif5YiXXHJcblx0XHQgKiBAcGFyYW0ge0FycmF5fSAqYXJnc2FyciDmjqXlj6Por7fmsYLmlbDnu4RcclxuXHRcdCAqIFt7XHJcblx0XHQgKiAgICB7SlNPTn0gKmlvYXJncyDmjqXlj6PmianlsZXlj4LmlbDjgILlr7nlupRpb2NvbmZpZy5qc+mHjOeahGlvYXJnc+mFjee9ruagvOW8j1xyXG5cdFx0ICogICAge0pTT059ICppb2NhbGwg5o6l5Y+j5omp5bGV5Y+C5pWw44CC5a+55bqUaW9jb25maWcuanPph4znmoRpb2NhbGzphY3nva7moLzlvI9cclxuXHRcdCAqIH1dXHJcblx0XHQgKiBAcGFyYW0ge0pTT059IGN1c3RvbW9iaiDnlKjmiLfoh6rlrprkuYnmianlsZXlj4LmlbBcclxuXHRcdCAqIHtcclxuXHRcdCAqIFx0ICB7RnVuY3Rpb259IGNvbXBsZXRlIOaOpeWPo+WFqOmDqOivt+axguWujOavleWQjueahOmAmuefpeWbnuiwg1xyXG5cdFx0ICogfVxyXG5cdCAqL1xyXG5cdHRyYW5zUXVldWVSZXF1ZXN0OiBmdW5jdGlvbihhcmdzYXJyLGN1c3RvbW9iail7XHJcblx0XHRpZigkLmlzQXJyYXkoYXJnc2FycikgJiYgYXJnc2Fyci5sZW5ndGggPiAwKXtcclxuXHRcdFx0dmFyIHF1ZXVlb2JqID0gcXVldWVDb250cm9sLmdldCgpOyAvL+iOt+WPluS4gOS4quepuumXsueahHF1ZXVlSGFuZGxlXHJcblx0XHRcdHF1ZXVlb2JqLmNvbXBsZXRlID0gZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRxdWV1ZUNvbnRyb2wuZW5kKHF1ZXVlb2JqKTsgLy/pgJrnn6XlvZPliY1xdWV1ZeWvueixoeS9v+eUqOWujOavlVxyXG5cdFx0XHRcdGlmKGN1c3RvbW9iaiAmJiB0eXBlb2YgY3VzdG9tb2JqLmNvbXBsZXRlID09ICdmdW5jdGlvbicpe1xyXG5cdFx0XHRcdFx0Y3VzdG9tb2JqLmNvbXBsZXRlKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9O1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwLCBsZW4gPSBhcmdzYXJyLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcclxuXHRcdFx0XHR2YXIgaW9hcmdzID0gYXJnc2FycltpXS5pb2FyZ3MgfHwge307XHJcblx0XHRcdFx0dmFyIGlvY2FsbCA9IGFyZ3NhcnJbaV0uaW9jYWxsIHx8IHt9O1xyXG5cdFx0XHRcdGlmKGlvYXJncyAmJiBpb2NhbGwgJiYgaW9hcmdzLnVybCAhPSAnJyl7XHJcblx0XHRcdFx0XHRpb2FyZ3MgPSAkLmV4dGVuZCh0cnVlLGlvYXJncyx7Y3VzdG9tY29uZmlnOntxdWV1ZTp0cnVlfX0pO1xyXG5cdFx0XHRcdFx0dmFyIGN1cm9wdCA9IGZvcm1hdChpb2FyZ3MsaW9jYWxsLHF1ZXVlb2JqKTtcclxuXHRcdFx0XHRcdHF1ZXVlb2JqLnJlcXVlc3QoY3Vyb3B0KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcbn07XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IGlv5o6l5Y+j6K+35rGC55u45YWz5pWw5o2u6YWN572uXHJcbiAqIEB2ZXJzaW9uIDEuMCB8IDIwMTUtMDYtMjgg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQHJldHVybiDmm7TlpJror6bnu4bkv6Hmga/lj4LogIPku6PnoIHph4zlr7nlupTlrprkuYnmlrnms5XmiJblsZ7mgKfkvY3nva7nmoTms6jph4ror7TmmI5cclxuICogXHRsb2dpbiB7SlNPTn0g5a+55LqO5o6l5Y+j6L+U5Zue5pyq55m76ZmG6ZSZ6K+v6L+b6KGM57uf5LiA5aSE55CG6YWN572uXHJcbiAqICBpb2FyZ3Mge0pTT059IGlv6K+35rGC5o6l5Y+j6buY6K6k5Y+C5pWwXHJcbiAqICBzZXRUcmFucyB7RnVuY3Rpb259IOiuvue9ruaOpeWPo+mFjee9rlxyXG4gKiAgZ2V0VHJhbnMge0Z1bmN0aW9ufSDojrflj5bmjqXlj6PphY3nva5cclxuICogIGdsb2JhbFNldHVwIHtGdW5jdGlvbn0g6K6+572u5YWo5bGAYWpheOmFjee9rlxyXG4gKiBAZXhhbXBsZVxyXG4gKiBcdFx0Y29uc3QgSW9Db25maWcgPSByZXF1aXJlKCdsaWJpby1pb2NvbmZpZycpO1xyXG4gKlxyXG5cdCBcdCAvL+e7n+S4gOWkhOeQhuacqueZu+W9lVxyXG5cdFx0IElvQ29uZmlnLmxvZ2luLmZpbHRlciA9IGZ1bmN0aW9uKHJlc3VsdCl7XHJcblx0XHQgXHRyZXR1cm4gcmVzdWx0LmNvZGUgPT0gJ0EwMDAyJztcclxuXHRcdCB9O1xyXG5cdFx0IElvQ29uZmlnLmxvZ2luLnVybCA9ICdodHRwOi8vYmFpZHUuY29tLyc7XHJcblxyXG5cdFx0IC8v5omA5pyJ5o6l5Y+j55qEaW/kuJrliqHplJnor6/nu5/kuIDlpITnkIZcclxuXHRcdCBJb0NvbmZpZy5mYWlsLmZpbHRlciA9IGZ1bmN0aW9uKHJlc3VsdCkge1xyXG5cdFx0IFx0cmV0dXJuIHJlc3VsdC5jb2RlICE9ICdBMDAwMSc7XHJcblx0XHQgfTtcclxuXHRcdCBJb0NvbmZpZy5pb2NhbGwuZmFpbCA9IGZ1bmN0aW9uKHJlc3VsdCl7XHJcblx0XHQgXHRhbGVydChyZXN1bHQuZXJybXNnIHx8ICfnvZHnu5zplJnor68nKTtcclxuXHRcdCB9O1xyXG5cclxuXHRcdCBJb0NvbmZpZy5pb2FyZ3MuY3Jvc3NEb21haW4gPSB0cnVlO1xyXG4gKiAqL1xyXG5cclxuLy92YXIgaW9jYWNoZSA9IHt9OyAvL+aOpeWPo+eahOmFjee9rumhuee8k+WtmOOAguagvOW8j+S4untpbnRlcm5hbWXvvJtpb2FyZ3Pph4zpnaLnmoTlj4LmlbDphY3nva7poblqc29u5qC85byPfVxyXG52YXIgdGhhdCA9IHt9O1xyXG4vKipcclxuICog5a+55LqO5o6l5Y+j6L+U5Zue5pyq55m76ZmG6ZSZ6K+v6L+b6KGM57uf5LiA5aSE55CGIOmFjee9ruOAglxyXG4gKi9cclxudGhhdC5sb2dpbiA9IHtcclxuXHR1cmw6ICcnLCAvL+acqueZu+aDheWGteS4i+i3s+i9rOeahOmhtemdolxyXG5cdGtleTogJ2dvJywgLy/ot7PovazliLB1cmzmjIflrprpobXpnaLkvKDpgJLlvZPliY3pobXpnaLlnLDlnYDnmoTplK7lgLzlkI3np7BcclxuXHRkZWFsOiBmdW5jdGlvbihkYXRhKXt9LCAvL+acieeahOaDheWGteS4i++8jOS4jeaYr+i3s+i9rOeZu+W9lXVybO+8jOiAjOS4lOW8ueeZu+W9leW8ueWxguOAguWImeatpOaXtuWwhnVybOiuvue9ruS4uicn77yM5bCG55m76ZmG5by55bGC5by55Ye65aSE55CG5YaZ5Zyo5q2k5pa55rOV5LitXHJcblx0ZmlsdGVyOiBmdW5jdGlvbihkYXRhKXtyZXR1cm4gZmFsc2U7fSAvL+WmguaenOatpOWHveaVsOi/lOWbnnRydWXliJnot7Povax1cmzmjIflrprnmoTpobXpnaLjgIJkYXRh5piv5o6l5Y+j6L+U5Zue55qE5pWw5o2uXHJcbn07XHJcbi8qKlxyXG4gKiDlr7nkuo7mjqXlj6Pov5Tlm57nmoTkuJrliqHplJnor6/ov5vooYznu5/kuIDlpITnkIYg6YWN572u44CCXHJcbiAqIOWmgmNvZGUgPT0gJ0EwMDAxJyDnrpfmiJDlip/vvIzlhbbku5bpg73nrpflpLHotKVcclxuICovXHJcbnRoYXQuZmFpbCA9IHtcclxuICAgIGZ1bm5hbWU6ICdmYWlsJywgLy/lvZPlj5HnlJ/kuJrliqHplJnor6/nmoTml7blgJnvvIzosIPnlKjnmoTmoLzlvI/lkIzkuo5pb2FyZ3Pph4znmoTlh73mlbDnmoTlh73mlbDlkI3jgILpu5jorqTmmK9lcnJvclxyXG4gICAgZmlsdGVyOiBmdW5jdGlvbihkYXRhKXtyZXR1cm4gZmFsc2U7fSAvL+WmguaenOatpOWHveaVsOi/lOWbnnRydWXliJnor7TmmI7lvZPliY3mjqXlj6Pov5Tlm57kuJrliqHplJnor6/kv6Hmga/jgIJkYXRh5piv5o6l5Y+j6L+U5Zue55qE5pWw5o2uXHJcbiAgICAvKipcclxuICAgICAqIOWmguaenOaOpeWPl+S4muWKoemUmeivr+S/oeaBr+e7n+S4gOWkhOeQhu+8jOWImeWPr+S7peaMieeFp+S7peS4i+aWueW8j+Whq+WGme+8mlxyXG4gICAgICogcmVxaXVyZWpzKFsnbGliaW8vaW9jb25maWcnXSxmdW5jdGlvbigkaW9jb25maWcpe1xyXG4gICAgICogICAgICRpb2NvbmZpZy5lcnJvciA9IHtcclxuICAgICAqICAgICAgICAgZnVubmFtZTogJ2ZhaWwnLFxyXG4gICAgICogICAgICAgICBmaWx0ZXI6IGZ1bmN0aW9uKGRhdGEpe2lmKGRhdGEgJiYgZGF0YS5lcnJjb2RlICE9IDApe3JldHVybiB0cnVlO319XHJcbiAgICAgKiAgICAgfTtcclxuICAgICAqICAgICAkaW9jb25maWcuaW9hcmdzLmZhaWwgPSBmdW5jdGlvbihkYXRhKXsgYWxlcnQoZGF0YS5lcnJtc2cgfHwgJ+e9kee7nOmUmeivrycpOyB9XHJcbiAgICAgKiB9KTtcclxuICAgICAqL1xyXG59O1xyXG50aGF0LmlvYXJncyA9IHsgLy9pb+ivt+axgum7mOiupOeahOWPguaVsOagvOW8j1xyXG5cdC8v5ZCMYWpheOWPguaVsOWumOaWueivtOaYjumhuVxyXG5cdHVybDogJycsXHJcblx0bWV0aG9kOiAnR0VUJyxcclxuXHRjb250ZW50VHlwZTogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXHJcblx0ZGVhbGRhdGE6IGZ1bmN0aW9uKHJlc3VsdCl7cmV0dXJuIHJlc3VsdC5kYXRhO30sIC8v5b2T5Lia5Yqh5aSE55CG5oiQ5Yqf5pe277yM6L+U5Zue57uf5LiA5aSE55CG55qE5pWw5o2uXHJcblx0Ly/oh6rlrprkuYnmlbDmja5cclxuXHRjdXN0b21jb25maWc6e1xyXG5cdFx0bW9kZTogJ2FqYXgnLCAvL+S9v+eUqOS7gOS5iOaWueW8j+ivt+axgu+8jOm7mOiupOaYr2FqYXgoYWpheOaWueW8j+m7mOiupOi/lOWbnueahOaYr2pzb27moLzlvI/nmoTmlbDmja7jgILkuZ/lj6/pgJrov4flnKjlkoxtZXRob2Tlj4LmlbDlkIznuqfnmoTkvY3nva7orr7nva5kYXRhVHlwZeWPguaVsOadpeaUueWPmOm7mOiupOeahGpzb27orr7nva4p44CC5Y+v55So55qE5Y+C5pWw5pyJYWpheHxqc29ucHxzY3JpcHRcclxuXHQgICAgZGVhbGxvZ2luOiB0cnVlLCAvL+aYr+WQpue7n+S4gOWkhOeQhuacqueZu+mZhumUmeivr1xyXG5cdCAgICBkZWFsZmFpbDogdHJ1ZSwgLy/mmK/lkKbnu5/kuIDlpITnkIbkuJrliqHplJnor69cclxuXHQgICAgZGVhbGRhdGE6IHRydWUsIC8v5b2T5Lia5Yqh5aSE55CG5oiQ5Yqf5pe277yM5piv5ZCm57uf5LiA5aSE55CG6L+U5Zue55qE5pWw5o2u44CC5rOo5oSP77ya5Y+q5pyJ5b2TZGVhbGVycm9y5Li6dHJ1ZeaXtu+8jGRlYWxkYXRh5Li6dHJ1ZeaJjeacieaViOOAguWQpuWImeS4jeS8muiwg+eUqGRlYWxkYXRh5pa55rOVXHJcblx0ICAgIHF1ZXVlOiBmYWxzZSwgLy/mjqXlj6Por7fmsYLmmK/lkKbov5vooYzpmJ/liJfmjqfliLbvvIzljbPlvZPliY3or7fmsYLlrozmiJDlkI7miY3lj6/ku6Xov5vooYzkuIvkuIDkuKror7fmsYJcclxuXHRcdHN0b3JhZ2U6IG51bGwsIC8vbGliaW8vc3RvcmFnZeWvueixoe+8jOaOp+WItmlv6K+35rGC5pWw5o2u57yT5a2YXHJcblx0XHRjbGVhcmFsbDogZmFsc2UsIC8v6K+35rGC5o6l5Y+j5pe277yM5piv5ZCm5riF6Zmk5omA5pyJ57yT5a2YXHJcblx0ICAgIGdldEludGVyOiBmdW5jdGlvbihpbnRlcm9iail7fSAvL+iOt+WPluaOpeWPo+ivt+axguWunuS+i+WvueixoeOAguWmgmludGVyb2Jq5Li6JC5hamF4KCnov5Tlm57nmoTlr7nosaFcclxuXHR9XHJcbn07XHJcbi8qKlxyXG4gKiDlpoLmnpxkYXRh5piv5LuO5pys5Zyw57yT5a2Y5Lit6K+75Y+W55qE5pWw5o2u77yM6YKj5LmIc3VjY2Vzc+WSjGZhaWzmlrnms5XkuK3nmoTlj4LmlbDvvJpcclxuICogXHRcdHRleHRTdGF0dXPlkoxqcVhIUuWIhuWIq+aYryAnc3VjY2VzcycsIG51bGxcclxuICogQHR5cGUge09iamVjdH1cclxuICovXHJcbnRoYXQuaW9jYWxsID0geyAvL2lv6K+35rGC5Zue6LCDXHJcblx0Y29tcGxldGU6IGZ1bmN0aW9uKCl7fSwgLy/lj4LmlbDkuLogZGF0YXxqcVhIUiwgdGV4dFN0YXR1cywganFYSFJ8ZXJyb3JUaHJvd25cclxuXHRzdWNjZXNzOiBmdW5jdGlvbihkYXRhLCB0ZXh0U3RhdHVzLCBqcVhIUil7fSxcclxuXHRlcnJvcjogZnVuY3Rpb24oanFYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKXthbGVydCggdGV4dFN0YXR1cyB8fCAn572R57uc6ZSZ6K+vJyk7IH0sXHJcblx0ZmFpbDogZnVuY3Rpb24oZGF0YSwgdGV4dFN0YXR1cywganFYSFIpe30gLy/lvZPkuJrliqHlpITnkIbplJnor6/ml7bvvIzov5Tlm57nu5/kuIDlpITnkIbkuJrliqHplJnor69cclxufTtcclxuLyoqXHJcbiAqIOavj+S4quivt+axguWPkemAgeS5i+WJje+8jOe7n+S4gOagvOW8j+WMluWPguaVsOmFjee9ru+8iOagvOW8j+WQjGlvYXJnc++8ieOAglxyXG4gKiDlupTnlKjlnLrmma/vvJog5q+P5Liq5Lia5Yqh6aG555uu6ZyA6KaB6YWN572u57uf5LiA55qE5Y+C5pWw5aSE55CG44CCXHJcbiAqL1xyXG50aGF0LmZvcm1hdCA9IGZ1bmN0aW9uKG9wdCl7fTtcclxuLyoqXHJcbiAqIOiuvue9ruWFqOWxgOeahOaOpeWPo+ivt+axgumFjee9rlxyXG4gKiBAcGFyYW0ge09iamVjdH0gc2V0dGluZ1xyXG4gKi9cclxudGhhdC5nbG9iYWxTZXR1cCA9IGZ1bmN0aW9uKHNldHRpbmcpe1xyXG5cdGlmKHR5cGVvZiBzZXR0aW5nID09ICdvYmplY3QnKXtcclxuXHRcdCQuYWpheFNldHVwKHNldHRpbmcpO1xyXG5cdH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdGhhdDtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcg5L2/55SobG9jYWxTdG9yYWdl6L+b6KGM5pWw5o2u5a2Y5YKoXHJcbiAqIEB2ZXJzaW9uIDEuMCB8IDIwMTctMDQtMTMg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQHJldHVyblxyXG4gKiAqL1xyXG5cclxuLyoqXHJcbiAqIOaVsOaNruWtmOWCqOexu1xyXG4gKiBAcGFyYW0ge1t0eXBlXX0gb3B0IFtkZXNjcmlwdGlvbl1cclxuICovXHJcbmZ1bmN0aW9uIFN0b3JhZ2Uob3B0KXtcclxuICAgIG9wdCA9ICQuZXh0ZW5kKHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDlrZjlgqjlkajmnJ/vvIzpu5jorqTkuLox5aSp44CC5ZCO57yA6K+05piOXHJcbiAgICAgICAgICogTTog5pyIXHJcbiAgICAgICAgICogRDog5pelXHJcbiAgICAgICAgICogSDog5bCP5pe2XHJcbiAgICAgICAgICogQHR5cGUge1N0cmluZ31cclxuICAgICAgICAgKiBAZXhhbXBsZSAxLjVEIDAuNUggM00gMTVEMC4ySFxyXG4gICAgICAgICAqIOeJueWIq+ivtOaYju+8muWPquaUr+aMgTHkvY3lsI/mlbBcclxuICAgICAgICAgKi9cclxuICAgICAgICBtYXhhZ2U6ICcxRCcsXHJcbiAgICAgICAga2V5OiAnJyAvLyog6ZSu5YC8XHJcbiAgICB9LG9wdCk7XHJcblxyXG4gICAgaWYob3B0LmtleSA9PSAnJyB8fCBvcHQubWF4YWdlID09ICcnKXtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2xpYmlvL3N0b3JhZ2Ug5Y+C5pWw5Lyg5YWl6ZSZ6K+vJyk7XHJcbiAgICB9ZWxzZSBpZighL14oKFxcZCspKFxcLihbMS05XXsxfSkpPyhbTURIXSkpKyQvLnRlc3Qob3B0Lm1heGFnZSkpe1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbGliaW8vc3RvcmFnZSBtYXhhZ2XphY3nva7moLzlvI/kuI3mraPnoa4nKTtcclxuICAgIH1cclxuXHJcbiAgICBvcHQua2V5ID0gU3RvcmFnZS5ncm91cG5hbWUgKyAnXycgKyBvcHQua2V5O1xyXG5cclxuICAgIHRoaXMub3B0ID0gb3B0O1xyXG59XHJcblxyXG4vKipcclxuICog6K6h566X6L+H5pyf5pe26Ze054K5XHJcbiAqIEByZXR1cm4ge1N0cmluZ30gRGF0ZVRpbWXov4fmnJ/ml7bpl7TngrnlrZfnrKbkuLJcclxuICovXHJcblN0b3JhZ2UucHJvdG90eXBlLl9nZXRPdXREYXRlVGltZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgbWF4YWdlID0gdGhpcy5vcHQubWF4YWdlLFxyXG4gICAgICAgIG5vd3RpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSxcclxuICAgICAgICBkaWZmaG91ciA9IDAsXHJcbiAgICAgICAgcmVnID0gLyhcXGQrKShcXC4oWzEtOV17MX0pKT8oW01ESF0pL2csXHJcbiAgICAgICAgcmVhcnIgPSBudWxsO1xyXG5cclxuICAgIHdoaWxlKChyZWFyciA9IHJlZy5leGVjKG1heGFnZSkpICE9IG51bGwpe1xyXG4gICAgICAgIHZhciBudW0gPSByZWFyclsxXSwgLy/mlbTmlbDpg6jliIZcclxuICAgICAgICAgICAgc3VmZml4ID0gcmVhcnJbNF07XHJcbiAgICAgICAgaWYocmVhcnJbMl0peyAvL+ivtOaYjuWtmOWcqOWwj+aVsFxyXG4gICAgICAgICAgICBudW0gKz0gcmVhcnJbMl07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG51bSA9IE51bWJlcihudW0pO1xyXG4gICAgICAgIHN3aXRjaCAoc3VmZml4KSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ00nOlxyXG4gICAgICAgICAgICAgICAgZGlmZmhvdXIgKz0gbnVtKjMwKjI0O1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ0QnOlxyXG4gICAgICAgICAgICAgICAgZGlmZmhvdXIgKz0gbnVtKjI0O1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ0gnOlxyXG4gICAgICAgICAgICAgICAgZGlmZmhvdXIgKz0gbnVtO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbm93dGltZSArPSBkaWZmaG91cio2MCo2MCoxMDAwO1xyXG5cclxuICAgIHJldHVybiBub3d0aW1lO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIOaVsOaNruiuvue9rlxyXG4gKiBAcGFyYW0ge0pTT059IGRhdGEg5b6F5a2Y5YKo55qE5pWw5o2uXHJcbiAqIOWunumZheWtmOWCqOeahOaVsOaNruagvOW8j+WmguS4i++8mlxyXG4gKlxyXG4gKiAge1xyXG4gKiAgICAgIGVuZFRpbWU6IHtTdHJpbmd9XHJcbiAqICAgICAgZGF0YTogZGF0YVxyXG4gKiAgfVxyXG4gKi9cclxuU3RvcmFnZS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oZGF0YSl7XHJcbiAgICBpZighZGF0YSB8fCBPYmplY3Qua2V5cyhkYXRhKS5sZW5ndGggPT0gMCl7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMub3B0LmtleSwgSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgIGVuZFRpbWU6IHRoaXMuX2dldE91dERhdGVUaW1lKCksXHJcbiAgICAgICAgZGF0YTogZGF0YVxyXG4gICAgfSkpO1xyXG59XHJcblxyXG4vKipcclxuICog6I635Y+W5pWw5o2uXHJcbiAqIEByZXR1cm4ge0pTT058TnVsbH0g6L+U5Zuec2V05pe25YCZ55qEZGF0YeOAguWmguaenOi/h+acn+WImei/lOWbnm51bGxcclxuICovXHJcblN0b3JhZ2UucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKCl7XHJcbiAgICAvL+WIpOaWreaYr+WQpui/h+acn1xyXG4gICAgdmFyIHZhbHVlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5vcHQua2V5KTtcclxuICAgIGlmKHZhbHVlID09IG51bGwpe1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgICAgdmFsdWUgPSBKU09OLnBhcnNlKHZhbHVlKTtcclxuICAgICAgICBpZihOdW1iZXIodmFsdWUuZW5kVGltZSkgPD0gbmV3IERhdGUoKS5nZXRUaW1lKCkpeyAvL+i/h+acn1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLmRhdGE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICog5Yig6Zmk5q2k6aG55pWw5o2uXHJcbiAqIEByZXR1cm4ge1t0eXBlXX0gW2Rlc2NyaXB0aW9uXVxyXG4gKi9cclxuU3RvcmFnZS5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24oKXtcclxuICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKHRoaXMub3B0LmtleSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDmlbDmja7lgqjlrZjmiYDlsZ7nu4TlkI3np7BcclxuICogQHR5cGUge1N0cmluZ31cclxuICovXHJcblN0b3JhZ2UuZ3JvdXBuYW1lID0gJ1pNUkRMQic7XHJcblxyXG4vKipcclxuICog5Yig6Zmk5YWo6YOo5Zyo57uEU3RvcmFnZS5ncm91cG5hbWXkuIvnmoTnvJPlrZjmlbDmja5cclxuICogQHJldHVybiB7W3R5cGVdfSBbZGVzY3JpcHRpb25dXHJcbiAqL1xyXG5TdG9yYWdlLmNsZWFyID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciByZWcgPSBuZXcgUmVnRXhwKCdeJytTdG9yYWdlLmdyb3VwbmFtZSk7XHJcbiAgICB3aGlsZShsb2NhbFN0b3JhZ2UubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIHZhciBrZXkgPSBsb2NhbFN0b3JhZ2Uua2V5KDApO1xyXG4gICAgICAgIGlmKHJlZy50ZXN0KGtleSkpe1xyXG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShrZXkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOWIm+W7uuS4gOS4qlN0b3JhZ2Xlr7nosaFcclxuICogQHBhcmFtICB7SlNPTn0gb3B0IOivpuingVN0b3JhZ2XlrprkuYnlpIRcclxuICogQHJldHVybiB7U3RvcmFnZX0gICAgIFtkZXNjcmlwdGlvbl1cclxuICovXHJcblN0b3JhZ2UuY3JlYXRlID0gZnVuY3Rpb24ob3B0KXtcclxuICAgIHJldHVybiBuZXcgU3RvcmFnZShvcHQpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFN0b3JhZ2U7XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IGFsZXJ057G777yM57un5om/6IeqbGF5ZXIvYm9tYkxheWVy44CC5re75Yqg4oCc56Gu5a6a5oyJ6ZKu4oCd5LqL5Lu25Zue6LCDXHJcbiAqIOWmguaenOW8ueWxguS4reacieS7peS4i+WxnuaAp+eahOiKgueCuVxyXG4gKiBub2RlPVwiY2xvc2VcIu+8jOeCueWHu+WImeS8muWFs+mXreW8ueWxgizlubbop6blj5FoaWRlY2Fs6YCa55+l44CCXHJcbiAqIG5vZGU9XCJva1wi77yM54K55Ye75YiZ6Kem5Y+R4oCc56Gu5a6a5oyJ6ZKu4oCd5LqL5Lu244CB5YWz6Zet5by55bGC77yM5bm26Kem5Y+Rb2tjYWzlkoxoaWRlY2Fs6YCa55+l44CCXHJcbiAqIEB2ZXJzaW9uIDEuMC4wIHwgMjAxNS0wOS0xNCDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAZXhhbXBsZVxyXG4gKiBcdCBjb25zdCBBbGVydCA9IHJlcXVpcmUoJ2xpYmxheWVyLWFsZXJ0Jyk7XHJcbiAqXHJcbiAqIFx0IHZhciBsYXllciA9IG5ldyBBbGVydCh7XHJcbiAqIFx0IFx0YWxlcnQ6IHtcclxuICogXHRcdFx0ZnJhbWV0cGw6IFsgLy/lvLnlsYLln7rmnKzmqKHmnb9cclxuXHRcdFx0XHQnPGRpdiBjbGFzcz1cImpzLXRpdGxlXCI+PC9kaXY+JyxcclxuXHRcdFx0XHQnPGRpdiBjbGFzcz1cImpzLWNvbnRlbnRcIj48L2Rpdj4nLFxyXG5cdFx0XHRcdCc8ZGl2PjxhIGhyZWY9XCJqYXZhc2NyaXB0OjtcIiBjbGFzcz1cImpzLW9rXCI+5aW955qEPC9hPjwvZGl2PidcclxuXHRcdFx0XS5qb2luKCcnKVxyXG4gKiAgICAgIH1cclxuICogICB9KTtcclxuICogICBsYXllci5zaG93Y2FsLmFkZChmdW5jdGlvbih0eXBlKXtzd2l0Y2godHlwZSl7Y2FzZSAnYmVmb3JlJzpjb25zb2xlLmxvZygn5bGC5pi+56S65YmNJyk7YnJlYWs7IGNhc2UgJ2FmdGVyJzpjb25zb2xlLmxvZygn5bGC5pi+56S65ZCOJyk7YnJlYWs7fX0pO1xyXG4gKiAgIGxheWVyLmhpZGVjYWwuYWRkKGZ1bmN0aW9uKHR5cGUpe3N3aXRjaCh0eXBlKXtjYXNlICdiZWZvcmUnOmNvbnNvbGUubG9nKCflsYLpmpDol4/liY0nKTticmVhazsgY2FzZSAnYWZ0ZXInOmNvbnNvbGUubG9nKCflsYLpmpDol4/lkI4nKTticmVhazt9fSk7XHJcbiAqICAgbGF5ZXIub2tjYWwuYWRkKGZ1bmN0aW9uKGUpe2NvbnNvbGUubG9nKCfngrnlh7vkuobnoa7lrponKX0pO1xyXG4gKiAgIGxheWVyLnNldE15Q29udGVudCgn6K6+572ubm9kZT1cImNvbnRlbnRcIuiKgueCueeahGlubmVySFRNTCcpO1xyXG4gKiAgIHZhciBub2RlQXJyID0gbGF5ZXIuZ2V0Tm9kZXMoWyd0aXRsZSddKTsgLy8g6I635Y+WY2xhc3M9XCJqcy10aXRsZVwi55qE6IqC54K5XHJcbiAqICAgbm9kZUFyci50aXRsZS5odG1sKCflhoXlrrnljLpodG1sJyk7XHJcbiAqICAgbGF5ZXIuY29udGVudG5vZGU7IC8v5YaF5a655Yy6bm9kZT1cImNvbnRlbnRcIuiKgueCuVxyXG4gKiAgIGxheWVyLnNob3coKTsgLy/mmL7npLrlsYJcclxuICogICBsYXllci5oaWRlKCk7IC8v6ZqQ6JeP5bGCXHJcbiAqICAgbGF5ZXIubGF5ZXI7IC8v5bGCZG9t6IqC54K55a+56LGhXHJcbiAqICAgbGF5ZXIuY29udGFpbmVyOyAvL+a1ruWxguWuueWZqFxyXG4gKiAgIGxheWVyLmRlc3Ryb3koKTsgLy/plIDmr4HlsYJcclxuICogKi9cclxuY29uc3QgQm9tYkxheWVyID0gcmVxdWlyZSgnLi9ib21iTGF5ZXIuanMnKSxcclxuXHQgICBUcGwgPSByZXF1aXJlKCcuL3RwbC5qcycpO1xyXG5cclxuY2xhc3MgQWxlcnQgZXh0ZW5kcyBCb21iTGF5ZXIge1xyXG5cdC8qKlxyXG5cdCAqIGFsZXJ057G7XHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIOWPguaVsOWQjGxheWVyL2JvbWJMYXllcumHjOmdoueahGNvbmZpZyzlnKjmraTln7rnoYDkuIrlop7liqDlpoLkuIvpu5jorqTphY3nva5cclxuICAgICAqIHtcclxuICAgICAqIFx0ICAqYWxlcnQ6IHtcclxuICAgICAqIFx0XHQgKmZyYW1ldHBsIHtTdHJpbmd9IGFsZXJ05Z+65pys5qih5p2/44CC6KaB5rGC6K+36K+m6KeBbGF5ZXIvdHBs6YeM6Z2iYWxlcnTpobnnmoTopoHmsYJcclxuICAgICAqICAgIH1cclxuICAgICAqIH1cclxuXHQgKi9cclxuXHRjb25zdHJ1Y3Rvcihjb25maWcpIHtcclxuXHRcdHZhciBvcHQgPSAkLmV4dGVuZCh0cnVlLHtcclxuXHRcdFx0YWxlcnQ6IHtcclxuXHRcdFx0XHRmcmFtZXRwbDogVHBsLmFsZXJ0IC8vYWxlcnTlvLnlsYLln7rmnKzmqKHmnb/jgILopoHmsYLor7for6bop4FsYXllci90cGzph4zpnaJhbGVydOmhueeahOimgeaxglxyXG5cdFx0XHR9XHJcblx0XHR9LGNvbmZpZyk7XHJcblx0XHRzdXBlcihvcHQpO1xyXG5cclxuXHRcdHRoaXMuc2V0Q29udGVudChvcHQuYWxlcnQuZnJhbWV0cGwpO1xyXG5cdFx0dGhpcy5jb250ZW50bm9kZSA9IHRoaXMubGF5ZXIuZmluZCgnLmpzLWNvbnRlbnQnKTsgLy/lhoXlrrnljLroioLngrlcclxuXHRcdHRoaXMub2tjYWwgPSAkLkNhbGxiYWNrcygpO1xyXG5cdFx0Ly/kuovku7bnu5HlrppcclxuXHQgICAgdGhpcy5sYXllci5vbignY2xpY2subGliJywgJy5qcy1vaycsIChlKSA9PiB7XHJcblx0ICAgIFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdCAgICBcdHRoaXMub2tjYWwuZmlyZShlKTtcclxuXHRcdFx0dGhpcy5oaWRlKCk7XHJcblx0ICAgIH0pO1xyXG5cdH1cclxuXHQvKipcclxuICAgICAqIOiuvue9rmFsZXJ05YaF5a655Yy65YW35pyJW25vZGU9XCJjb250ZW50XCJd5bGe5oCn55qE6IqC54K555qEaHRtbFxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGh0bWxcclxuICAgICAqL1xyXG5cdHNldE15Q29udGVudChodG1sKSB7XHJcblx0XHRpZih0eXBlb2YgaHRtbCA9PSAnc3RyaW5nJyAmJiB0aGlzLmNvbnRlbnRub2RlLmxlbmd0aCA+IDApe1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRub2RlLmh0bWwoaHRtbCk7XHJcbiAgICAgICAgfVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiDnu4Tku7bplIDmr4FcclxuXHQgKi9cclxuXHRkZXN0cm95KCkge1xyXG5cdFx0dGhpcy5sYXllci5vZmYoJ2NsaWNrLmxpYicsICcuanMtb2snKTtcclxuXHRcdHN1cGVyLmRlc3Ryb3koKTtcclxuXHRcdHRoaXMuY29udGVudG5vZGUgPSBudWxsO1xyXG5cdFx0dGhpcy5va2NhbCA9IG51bGw7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEFsZXJ0O1xyXG4iLCLvu78vKipcclxuICogQGZpbGVvdmVydmlldyBhbGVydOeahOW3peWOguaOp+WItuWZqO+8jOe7p+aJv2Jhc2VDb250cm9sXHJcbiAqIOW6lOeUqOWcuuaZr++8mumSiOWvueeugOWNlWFsZXJ05by55bGC77yM6aKR57mB5pu05pS55by55bGC6YeM5p+Q5Lqb6IqC54K555qE5YaF5a6577yM5Lul5Y+K5pu05pS554K55Ye7XCLnoa7lrppcIuaMiemSruWQjueahOWbnuiwg+S6i+S7tlxyXG4gKiDlpoLmnpzmmK/mm7TlpI3mnYLnmoTkuqTkupLlu7rorq7kvb/nlKhsYXllcnMuYWxlcnTmiJZsYXllcnMuYm9tYkxheWVyXHJcbiAqIEB2ZXJzaW9uIDEuMC4wIHwgMjAxNi0wMS0yNiDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAZXhhbXBsZVxyXG4gKiBjb25zdCBBbGVydENvbnRyb2wgPSByZXF1aXJlKCdsaWJsYXllci1hbGVydENvbnRyb2wnKTtcclxuICpcclxuXHRcdHZhciBjdXJsYXllciA9IG5ldyBBbGVydENvbnRyb2woKTtcclxuXHRcdGN1cmxheWVyLnNldGNvbmZpZyh7XHJcblx0XHRcdGFsZXJ0OiB7XHJcblx0XHRcdFx0ZnJhbWV0cGw6IFtcclxuXHRcdFx0XHQgICAgJzxkaXYgY2xhc3M9XCJqcy10aXRsZVwiPjwvZGl2PicsXHJcblx0XHRcdFx0XHQnPGRpdiBjbGFzcz1cImpzLWNvbnRlbnRcIj48L2Rpdj4nLFxyXG5cdFx0XHRcdFx0JzxkaXY+PGEgaHJlZj1cImphdmFzY3JpcHQ6O1wiIGNsYXNzPVwianMtb2tcIj7lpb3nmoQ8L2E+PC9kaXY+J1xyXG5cdFx0XHRcdF0uam9pbignJylcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHRjdXJsYXllci5zaG93KHtcclxuICAgICAgICAgICAgY29udGVudDogJ+aCqOi/mOacqueZu+mZhidcclxuICAgICAgICB9LHtcclxuICAgICAgICAgICAgb2s6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn54K55Ye75aW955qEJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBjdXJsYXllci5nZXRsYXllcm9iaigp77ybIC8vbGF5ZXIvYWxlcnTnsbvlr7nosaFcclxuICogKi9cclxuIGNvbnN0IEFsZXJ0ID0gcmVxdWlyZSgnLi9hbGVydC5qcycpLFxyXG4gICAgICAgQmFzZUNvbnRyb2wgPSByZXF1aXJlKCcuL2Jhc2VDb250cm9sLmpzJyk7XHJcblxyXG4vKipcclxuKiBhbGVydOW3peWOguaOp+WItuWZqFxyXG4qL1xyXG5jbGFzcyBBbGVydENvbnRyb2wgZXh0ZW5kcyBCYXNlQ29udHJvbCB7XHJcbiAgICBjb25zdHJ1Y3RvcihoaWRlZGVzdHJveSkge1xyXG4gICAgICAgIHN1cGVyKGhpZGVkZXN0cm95KTtcclxuICAgICAgICB0aGlzLl9va2NhbCA9IGZ1bmN0aW9uKCl7fTsgLy/ngrnlh7tva+eahOWbnuiwg+engeacieWtmOWCqOWZqFxyXG5cdFx0dGhpcy5fZnVuYXJyID0gWydvayddOyAvL+WPr+aOp+WItueahOWbnuiwg+aWueazleWQjVxyXG4gICAgfVxyXG4gICAgLyoqXHJcblx0ICog6I635Y+WYWxlcnTlvLnlsYJcclxuXHQgKiBAcGFyYW0ge0Jvb2xlYW59IHJlc2V0IOaYr+WQpumHjeaWsOa4suafk+aooeadv+OAgum7mOiupOS4umZhbHNlXHJcblx0ICovXHJcbiAgICBnZXRsYXllcm9iaihyZXNldCl7XHJcblx0XHRpZih0aGlzLl9sYXllcm9iaiA9PSBudWxsKXtcclxuXHRcdFx0dGhpcy5fbGF5ZXJvYmogPSBuZXcgQWxlcnQodGhpcy5fZGVmYXVsdG9wdCk7XHJcblx0XHRcdHRoaXMuX2xheWVyb2JqLm9rY2FsLmFkZCgoZSkgPT4ge1xyXG5cdFx0XHRcdHRoaXMuX29rY2FsKCk7XHJcblx0XHRcdH0pO1xyXG4gICAgICAgICAgICB0aGlzLl9hZGRjYWxsKCk7XHJcblx0XHR9ZWxzZXtcclxuICAgICAgICAgICAgaWYocmVzZXQpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbGF5ZXJvYmouc2V0Q29udGVudCh0aGlzLl9kZWZhdWx0b3B0LmFsZXJ0LmZyYW1ldHBsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHRcdHJldHVybiB0aGlzLl9sYXllcm9iajtcclxuICAgIH1cclxuICAgIC8qKlxyXG5cdCAqIOmUgOavgWFsZXJ05by55bGCXHJcblx0ICovXHJcbiAgICBkZXN0cm95KCl7XHJcbiAgICAgICAgc3VwZXIuZGVzdHJveSgpO1xyXG4gICAgICAgIHRoaXMuX29rY2FsID0gZnVuY3Rpb24oKXt9O1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEFsZXJ0Q29udHJvbDtcclxuIiwi77u/LyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcgYWxlcnTnsbvljZXkvZPmjqfliLblmajvvIzkuIDoiKznlKjkuo7nroDljZXnmoRjb25maXJt5L+h5oGv5o+Q56S644CCXHJcbiAqIOazqOaEj++8muivpWFsZXJ05o6n5Yi255qE5a+56LGh5Y+KZG9t5Zyo5YWo5bGA5Lit5ZSv5LiA5a2Y5Zyo77yM5aaC5p6c5oOz6KaB5Yib5bu65aSa5Liq77yM6K+35L2/55SobGlibGF5ZXJzL2FsZXJ05oiWbGlibGF5ZXJzL2FsZXJ0Q29udHJvbFxyXG4gKiBAdmVyc2lvbiAxLjAuMCB8IDIwMTUtMDktMTQg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQGV4YW1wbGVcclxuICogICAgICBjb25zdCBBbGVydFNpbmdsZSA9IHJlcXVpcmUoJ2xpYmxheWVyLWFsZXJ0U2luZ2xlJyk7XHJcbiAqXHJcblx0XHRBbGVydFNpbmdsZS5zZXRjb25maWcoe1xyXG5cdFx0XHRhbGVydDoge1xyXG5cdFx0XHRcdGZyYW1ldHBsOiBbXHJcblx0XHRcdFx0ICAgICc8ZGl2IGNsYXNzPVwianMtdGl0bGVcIj48L2Rpdj4nLFxyXG5cdFx0XHRcdFx0JzxkaXYgY2xhc3M9XCJqcy1jb250ZW50XCI+PC9kaXY+JyxcclxuXHRcdFx0XHRcdCc8ZGl2PjxhIGhyZWY9XCJqYXZhc2NyaXB0OjtcIiBjbGFzcz1cImpzLW9rXCI+5aW955qEPC9hPjwvZGl2PidcclxuXHRcdFx0XHRdLmpvaW4oJycpXHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0QWxlcnRTaW5nbGUuZ2V0bGF5ZXJvYmooKe+8myAvL2xheWVyL2FsZXJ057G75a+56LGhXHJcblx0XHRBbGVydFNpbmdsZS5zaG93KHtcclxuICAgICAgICAgICAgY29udGVudDogJ+aCqOi/mOacqueZu+mZhidcclxuICAgICAgICB9LHtcclxuICAgICAgICAgICAgb2s6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn54K55Ye75aW955qEJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICogKi9cclxuXHJcbmNvbnN0IEFsZXJ0Q29udHJvbCA9IHJlcXVpcmUoJy4vYWxlcnRDb250cm9sLmpzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBBbGVydENvbnRyb2woKTtcclxuIiwi77u/LyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcg5Z+65pys55qE5by55bGC5bel5Y6C5o6n5Yi25Zmo77yM5LiN5Y+v55u05o6l5L2/55So77yM5Y+q5Y+v5a2Q57G757un5om/5ZCO5L2/55So44CCXHJcbiAqIOW6lOeUqOWcuuaZr++8mumSiOWvuemikee5geabtOaUueW8ueWxgumHjOafkOS6m+iKgueCueeahOWGheWuue+8jOS7peWPiuabtOaUueeCueWHu+aMiemSruWQjueahOWbnuiwg+S6i+S7tuOAglxyXG4gKiBAdmVyc2lvbiAxLjAuMCB8IDIwMTYtMDEtMjYg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQGV4YW1wbGVcclxuICogICAgICBjb25zdCBCYXNlQ29udHJvbCA9IHJlcXVpcmUoJ2xpYmxheWVyLWJhc2VDb250cm9sJyk7XHJcbiAqXHJcbiAqICovXHJcblxyXG4gY29uc3QgVG9vbCA9IHJlcXVpcmUoJ2xpYnV0aWwtdG9vbCcpO1xyXG5cclxuIGNsYXNzIEJhc2VDb250cm9sIHtcclxuICAgICAvKipcclxuICAgICAgKiDlt6XljoLmqKHlnovmjqfliLblmahcclxuICAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGhpZGVkZXN0cm95IOW8ueWxguWFs+mXreaXtu+8jOaYr+WQpui1sOezu+e7n+m7mOiupOeahOmUgOavgeaTjeS9nOOAgum7mOiupOS4unRydWVcclxuICAgICAgKi9cclxuICAgICBjb25zdHJ1Y3RvcihoaWRlZGVzdHJveSl7XHJcbiAgICAgICAgIHRoaXMuX2xheWVyb2JqID0gbnVsbDsgLy/lvLnlsYLlr7nosaFcclxuIFx0XHQgdGhpcy5fZGVmYXVsdG9wdCA9IHt9OyAvL+m7mOiupGNvbmZpZ+mFjee9ruWPguaVsFxyXG4gXHRcdCB0aGlzLl9mdW5hcnIgPSBbXTsgLy/kvJrmm7/mjaLnmoTlm57osIPmlrnms5XnmoTlhbPplK7or43jgILlpoJbJ29rJywnY2FuY2VsJ11cclxuICAgICAgICAgdGhpcy5jcmVhdGVjYWwgPSAkLkNhbGxiYWNrcygpOyAvL+W8ueWxguWvueixoeWIm+W7uuWQjueahOWbnuiwg1xyXG4gICAgICAgICBpZih0eXBlb2YgaGlkZWRlc3Ryb3kgIT0gJ2Jvb2xlYW4nKXtcclxuICAgICAgICAgICAgIGhpZGVkZXN0cm95ID0gdHJ1ZTtcclxuICAgICAgICAgfVxyXG4gICAgICAgICB0aGlzLmhpZGVkZXN0cm95ID0gaGlkZWRlc3Ryb3k7XHJcbiAgICAgfVxyXG4gICAgIC8qKlxyXG4gXHQgKiAg5Y+C5pWw6K+05piO6K+35Y+C6KeB5a2Q57G75L2/55So55qE5by55bGC57G76YeM6Z2i55qEY29uZmln6K+05piOXHJcbiBcdCAqICDlpoJhbGVydC5qc+OAgmNvbmZpcm0uanNcclxuIFx0ICovXHJcbiAgICAgc2V0Y29uZmlnKGNvbmZpZyl7XHJcbiAgICAgICAgIHRoaXMuX2RlZmF1bHRvcHQgPSBjb25maWc7XHJcbiAgICAgfVxyXG4gICAgIC8qKlxyXG4gXHQgKiDojrflj5blvLnlsYLlr7nosaHvvIzlhbfkvZPnlLHlrZDnsbvlrp7njrBcclxuIFx0ICovXHJcbiAgICAgZ2V0bGF5ZXJvYmooKXtcclxuXHJcbiAgICAgfVxyXG4gICAgIC8qKlxyXG4gXHQgKiDmt7vliqDns7vnu5/lm57osIPvvIznlLHlrZDnsbvliJvlu7rkuoblvLnlsYLlr7nosaHlkI7osIPnlKhcclxuIFx0ICovXHJcbiAgICAgX2FkZGNhbGwoKXtcclxuICAgICAgICAgaWYodGhpcy5oaWRlZGVzdHJveSl7XHJcbiAgICAgICAgICAgICB0aGlzLl9sYXllcm9iai5oaWRlYWZ0ZXJjYWwuYWRkKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICB0aGlzLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICB9XHJcbiAgICAgICAgIHRoaXMuY3JlYXRlY2FsLmZpcmUodGhpcy5fbGF5ZXJvYmopO1xyXG4gICAgIH1cclxuICAgICAvKipcclxuIFx0ICog5pi+56S65by55bGCXHJcbiBcdCAqIEBwYXJhbSB7T2JqZWN0fSAqdHh0IOaWh+ahiOmFjee9rizpgInloavjgILlpoLmnpxzZXRjb25maWfosIPnlKjorr7nva7nmoTmqKHmnb/kuK3ov5jmnInlhbbku5Zub2RlPVwi5YW25LuW5YC8XCLvvIxcclxuIFx0ICogICAgICDlpoJub2RlPVwib3RoZXJcIiDliJnlj6/oh6rooYzmianlsZVcclxuIFx0ICoge1xyXG4gXHQgKiBcdCBjb250ZW50IHtTdHJpbmd9IG5vZGU9XCJjb250ZW50XCLoioLngrnph4zpnaLnmoRodG1sXHJcbiBcdCAqICAgdGl0bGUge1N0cmluZ30gbm9kZT1cInRpdGxlXCLoioLngrnph4zpnaLnmoRodG1sXHJcbiBcdCAqICAgb2sge1N0cmluZ30gbm9kZT1cIm9rXCLoioLngrnph4zpnaLnmoRodG1sXHJcbiBcdCAqIH1cclxuIFx0ICogQHBhcmFtIHtPYmplY3R9IGNhbCDlm57osIPphY3nva5cclxuIFx0ICoge1xyXG4gXHQgKiBcdCDplK7lgLzkuLpfZnVuYXJy5Lit6Led56a755qE5YWz6ZSu6K+NIHtGdW5jdGlvbn0g54K55Ye756Gu5a6a5oyJ6ZKu5ZCO55qE5Zue6LCDXHJcbiBcdCAqIH1cclxuIFx0ICovXHJcbiBcdCBzaG93KHR4dCxjYWwpe1xyXG4gICAgICAgICBpZighVG9vbC5pc09iamVjdCh0eHQpKXtcclxuIFx0XHRcdHRocm93IG5ldyBFcnJvcignYmFzZUNvbnRyb2wtc2hvd+aWueazlXR4dOWPguaVsOW/hemhu+aYr2pzb27lr7nosaEnKTtcclxuIFx0XHR9ZWxzZXtcclxuIFx0XHRcdGlmKFRvb2wuaXNPYmplY3QoY2FsKSl7XHJcbiBcdFx0XHRcdHZhciBmdW5uYW1lID0gdGhpcy5fZnVuYXJyO1xyXG4gXHRcdFx0XHRmb3IodmFyIGN1cm5hbWUgb2YgZnVubmFtZSl7XHJcbiBcdFx0XHRcdFx0aWYoVG9vbC5pc0Z1bmN0aW9uKGNhbFtjdXJuYW1lXSkpe1xyXG4gXHRcdFx0XHRcdFx0dGhpc1snXycrY3VybmFtZSsnY2FsJ10gPSBjYWxbY3VybmFtZV07XHJcbiBcdFx0XHRcdFx0fVxyXG4gXHRcdFx0XHRcdGVsc2V7XHJcbiBcdFx0XHRcdFx0XHR0aGlzWydfJytjdXJuYW1lKydjYWwnXSA9IGZ1bmN0aW9uKCl7fTtcclxuIFx0XHRcdFx0XHR9XHJcbiBcdFx0XHRcdH1cclxuIFx0XHRcdH1lbHNle1xyXG4gXHRcdFx0XHR0aGlzLl9va2NhbCA9IGZ1bmN0aW9uKCl7fTtcclxuIFx0XHRcdH1cclxuIFx0XHRcdC8v6I635Y+WdHh06YeM6Z2i55qE6ZSu5YC8XHJcbiBcdFx0XHR2YXIgbm9kZW5hbWVhcnIgPSBbXTtcclxuIFx0XHRcdGZvcih2YXIgbmFtZSBpbiB0eHQpe1xyXG4gXHRcdFx0XHRub2RlbmFtZWFyci5wdXNoKG5hbWUpO1xyXG4gXHRcdFx0fVxyXG4gXHRcdFx0dGhpcy5nZXRsYXllcm9iaih0cnVlKTtcclxuIFx0XHRcdHZhciBub2RlYXJyID0gdGhpcy5fbGF5ZXJvYmouZ2V0Tm9kZXMobm9kZW5hbWVhcnIpO1xyXG4gXHRcdFx0Zm9yKHZhciBuYW1lIGluIG5vZGVhcnIpe1xyXG4gXHRcdFx0XHRUb29sLmlzU3RyaW5nKHR4dFtuYW1lXSkgJiYgbm9kZWFycltuYW1lXS5odG1sKHR4dFtuYW1lXSk7XHJcbiBcdFx0XHR9XHJcbiBcdFx0XHR0aGlzLl9sYXllcm9iai5zaG93KCk7XHJcbiBcdFx0fVxyXG4gICAgIH1cclxuICAgICAvKipcclxuICAgICAgKiDplIDmr4HlvLnlsYJcclxuICAgICAgKi9cclxuICAgICBkZXN0cm95KCl7XHJcbiAgICAgICAgIGlmKHRoaXMuX2xheWVyb2JqICE9IG51bGwpe1xyXG4gXHRcdFx0dGhpcy5fbGF5ZXJvYmouZGVzdHJveSgpO1xyXG4gXHRcdFx0dGhpcy5fbGF5ZXJvYmogPSBudWxsO1xyXG4gXHRcdH1cclxuICAgICB9XHJcbiB9XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VDb250cm9sO1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyDlvLnlsYLnsbvvvIznu6fmib/oh6psYXllci9sYXllcuOAgum7mOiupOWxheS4reWumuS9je+8jOaYvuekuumBrue9qeOAgu+8iOWmguaenOmcgOWFtuS7lueJueauiumFjee9ruWImeWPguingeWPguaVsOivtOaYju+8iVxyXG4gKiDlpoLmnpzlvLnlsYLkuK3mnInku6XkuIvlsZ7mgKfnmoToioLngrlub2RlPVwiY2xvc2VcIuOAguWImeeCueWHu+ivpeiKgueCueS8muWFs+mXreW8ueWxgu+8jOW5tuinpuWPkWhpZGVjYWzpgJrnn6XjgIJcclxuICogQHZlcnNpb24gMS4wLjAgfCAyMDE1LTA5LTE0IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEBleGFtcGxlXHJcbiAqIFx0IGNvbnN0IEJvbWJMYXllciA9IHJlcXVpcmUoJ2xpYmxheWVyLWJvbWJMYXllcicpO1xyXG4gKlxyXG4gKiAgIHZhciBsYXllciA9IG5ldyBCb21iTGF5ZXIoKTtcclxuICogICAgbGF5ZXIuc2hvd2JlZm9yZWNhbC5hZGQoZnVuY3Rpb24oKXtjb25zb2xlLmxvZygn5bGC5pi+56S65YmNJyk7fSk7XHJcbiAqICAgbGF5ZXIuaGlkZWJlZm9yZWNhbC5hZGQoZnVuY3Rpb24oKXtjb25zb2xlLmxvZygn5bGC6ZqQ6JeP5YmNJyk7fSk7XHJcbiAqICAgbGF5ZXIuc2hvd2FmdGVyY2FsLmFkZChmdW5jdGlvbigpe2NvbnNvbGUubG9nKCflsYLmmL7npLrlkI4nKTt9KTtcclxuICogICBsYXllci5oaWRlYWZ0ZXJjYWwuYWRkKGZ1bmN0aW9uKCl7Y29uc29sZS5sb2coJ+WxgumakOiXj+WQjicpO30pO1xyXG4gKiAgIGxheWVyLnBvcy5wb3NjYWwuYWRkKGZ1bmN0aW9uKCl7Y29uc29sZS5sb2coJ2xheWVy5a6a5L2N5ZCO5Zue6LCDJyl9KTtcclxuICogICBsYXllci5zZXRDb250ZW50KCc8ZGl2IGNsYXNzPVwianMtY29udGVudFwiPjwvZGl2PicpOyAvL+iuvue9rmxheWVy5bGC6YeM6Z2i55qE5YaF5a65XHJcbiAqICAgbGF5ZXIuZ2V0Tm9kZXMoWydjb250ZW50J10pOyAvLyDojrflj5ZjbGFzcz1cImpzLWNvbnRlbnRcIueahOiKgueCuVxyXG4gKiAgIGxheWVyLnNob3coKTsgLy/mmL7npLrlsYJcclxuICogICBsYXllci5oaWRlKCk7IC8v6ZqQ6JeP5bGCXHJcbiAqICAgbGF5ZXIubGF5ZXI7IC8v5bGCZG9t6IqC54K55a+56LGhXHJcbiAqICAgbGF5ZXIuY29udGFpbmVyOyAvL+a1ruWxguWuueWZqFxyXG4gKiAgIGxheWVyLmRlc3Ryb3koKTsgLy/plIDmr4HlsYJcclxuICpcclxuICogKi9cclxuXHJcbiBjb25zdCBMYXllciA9IHJlcXVpcmUoJy4vbGF5ZXIuanMnKSxcclxuIFx0ICAgTWFzayA9IHJlcXVpcmUoJy4vbWFzay5qcycpLFxyXG5cdCAgIFBvc2l0aW9uQm9tYiA9IHJlcXVpcmUoJy4vcG9zaXRpb25Cb21iLmpzJyksXHJcblx0ICAgVG9vbCA9IHJlcXVpcmUoJ2xpYnV0aWwtdG9vbCcpO1xyXG5cclxuY2xhc3MgQm9tYkxheWVyIGV4dGVuZHMgTGF5ZXIge1xyXG5cdC8qKlxyXG5cdCAqIOW8ueWxguexu+KAlOKAlOWIm+W7uuW5tua3u+WKoOWIsOaMh+WumuWuueWZqOS4rVxyXG4gICAgICogQHBhcmFtIHtKU09OfSBjb25maWcg5by55bGC6YWN572u5Y+C5pWwIO+8jOS4jeaYr+W/heWhq+mhuVxyXG4gICAgICogXHRcdHtcclxuICAgICAqIFx0ICAgICAgIGNvbnRhaW5lciB7RWxlbWVudH0g5a2Y5pS+5by55bGC55qE5a655Zmo44CC5Y+v5LiN5oyH5a6a77yM6buY6K6k5by55bGC5a2Y5pS+5LqOYm9keeS4reeahOS4gOS4quWKqOaAgeeUn+aIkOeahGRpdumHjFxyXG4gICAgICogXHQgICAgICAgcG9zOnt9LCAvL+WumuS9jeWPguaVsO+8jOWFt+S9k+ivtOaYjuWPr+ingeaWueazlWxheWVyL3Bvc2l0aW9uQm9tYuS4reeahGNvbmZpZ+ivtOaYjlxyXG4gICAgICogICAgICAgICBsYXllcjoge30sIC8v5by55bGC5L+h5oGv5Y+C5pWw77yM5YW35L2T6K+05piO5Y+v6KeB5pa55rOVbGF5ZXIvbGF5ZXLkuK3nmoRjb25maWfor7TmmI5cclxuICAgICAqIFx0XHQgICBtYXNrOiB7IC8v6YGu572p5L+h5oGv5Y+C5pWw77yM5YW35L2T6K+05piO5Y+v6KeB5pa55rOVbGF5ZXIvbWFza+S4reeahGNvbmZpZ+ivtOaYjuOAguWcqOatpOWfuuehgOS4iui/m+ihjOS7peS4i+aJqeWxlVxyXG4gICAgICogXHRcdFx0ICBtYXNrOiB0cnVlLCAvL+aYr+WQpuWIm+W7uumBrue9qVxyXG4gICAgICogICAgICAgICAgICBjbWxoaWRlOiBmYWxzZSAvL+eCueWHu+mBrue9qeaYr+WQpuWFs+mXreW8ueWxglxyXG4gICAgICogICAgICAgICAgICAvL+WFtuS7luafpeeci21hc2suanPkuK3nmoTphY3nva5cclxuICAgICAqIFx0XHQgICB9XHJcbiAgICAgKiAgICAgIH1cclxuXHQgKi9cclxuXHRjb25zdHJ1Y3Rvcihjb25maWcpIHtcclxuICAgICAgICB2YXIgX25ld2NvbnRhaW5lciA9IGZhbHNlO1xyXG5cdFx0aWYoIWNvbmZpZy5jb250YWluZXIgfHwgY29uZmlnLmNvbnRhaW5lci5sZW5ndGggPT0gMCl7XHJcblx0XHRcdGNvbmZpZy5jb250YWluZXIgPSAkKCc8ZGl2PjwvZGl2PicpLmFwcGVuZFRvKCdib2R5Jyk7XHJcblx0XHRcdF9uZXdjb250YWluZXIgPSB0cnVlOyAvL+ivtOaYjuaYr+aWsOWIm+W7uueahOWuueWZqFxyXG5cdFx0fVxyXG5cdFx0Y29uZmlnID0gY29uZmlnIHx8IHt9O1xyXG5cdFx0Ly/liJ3lp4vljJbln7rnsbtcclxuXHRcdHN1cGVyKGNvbmZpZy5jb250YWluZXIsY29uZmlnLmxheWVyKTtcclxuICAgICAgICB0aGlzLl9uZXdjb250YWluZXIgPSBfbmV3Y29udGFpbmVyO1xyXG5cdFx0Ly/liJvlu7rlrprkvY3nsbvlr7nosaFcclxuXHRcdHRoaXMucG9zID0gbmV3IFBvc2l0aW9uQm9tYih7XHJcblx0XHRcdGxheWVyOiB0aGlzLmxheWVyXHJcblx0XHR9LGNvbmZpZy5wb3MpO1xyXG5cdFx0Ly/liJvlu7rpga7nvalcclxuXHRcdHZhciBtYXNrb3B0ID0gJC5leHRlbmQodHJ1ZSx7XHJcblx0XHRcdG1hc2s6IHRydWUsXHJcblx0XHRcdGNtbGhpZGU6IGZhbHNlXHJcblx0XHR9LGNvbmZpZy5tYXNrKTtcclxuXHRcdGlmKG1hc2tvcHQubWFzayl7IC8v5aaC5p6c5Yib5bu66YGu572pXHJcblx0XHRcdHRoaXMubWFzayA9IG5ldyBNYXNrKGNvbmZpZy5jb250YWluZXIsbWFza29wdCk7XHJcblx0XHRcdGlmKG1hc2tvcHQuY21saGlkZSl7IC8v54K55Ye76YGu572p5YWz6ZetXHJcblx0XHRcdFx0dGhpcy5tYXNrLmNsaWNrY2FsLmFkZCgoZSkgPT4ge1xyXG5cdFx0XHRcdFx0dGhpcy5oaWRlKCk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdC8v5LqL5Lu257uR5a6aXHJcblx0XHR0aGlzLmxheWVyLm9uKCdjbGljay5saWInLCAnLmpzLWNsb3NlJywgKGUpID0+IHtcclxuXHQgICAgXHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0ICAgIFx0dGhpcy5oaWRlKCk7XHJcblx0ICAgIH0pO1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiDojrflj5ZhbGVydOS4reWFt+aciW5vZGU9J+aMh+WumuWQjeensCfnmoToioLngrnliJfooajjgILlpoLmnpxub2RlbmFtZWFycuS4reaMh+WumueahOiKgueCueS4jeWtmOWcqO+8jOWImeS4jeWcqOe7k+aenOS4rei/lOWbnuOAguS4vuS+i1xyXG4gICAgICogQHBhcmFtIHtBcnJheX0gbm9kZW5hbWVhcnIg5aaCWydjb250ZW50Jywnb2snXVxyXG4gICAgICogQHJldHVybiB7XHJcbiAgICAgKiBcdCAgIGNvbnRlbnQ6IOiOt+WPlueahOiKgueCuVxyXG4gICAgICogICAgIG9rOiDojrflj5bnmoToioLngrlcclxuICAgICAqIH1cclxuICAgICAqIOWmguaenGNvbnRlbnTkuI3lrZjlnKjvvIzliJnlj6rov5Tlm557b2t9XHJcblx0ICovXHJcblx0Z2V0Tm9kZXMobm9kZW5hbWVhcnIpe1xyXG5cdFx0dmFyIHJlc3VsdCA9IHt9LCB0aGF0ID0gdGhpcztcclxuXHRcdGlmKFRvb2wuaXNBcnJheShub2RlbmFtZWFycikpe1xyXG5cdFx0XHQkLmVhY2gobm9kZW5hbWVhcnIsKGluZGV4LG5hbWUpID0+IHtcclxuXHRcdFx0XHR2YXIgbm9kZSA9IHRoaXMubGF5ZXIuZmluZCgnLmpzLScrbmFtZSk7XHJcblx0XHRcdFx0aWYobm9kZS5sZW5ndGggPiAwKXtcclxuXHRcdFx0XHRcdHJlc3VsdFtuYW1lXSA9IG5vZGU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIOaYvuekuuW8ueWxglxyXG5cdCAqL1xyXG5cdHNob3coKXtcclxuXHRcdGlmKCF0aGlzLmlzc2hvdygpKXtcclxuXHRcdFx0dGhpcy5zaG93YmVmb3JlY2FsLmZpcmUoKTsgLy/lsYLmmL7npLrliY3lm57osINcclxuXHRcdFx0dGhpcy5tYXNrICYmIHRoaXMubWFzay5zaG93KCk7XHJcblx0XHRcdHRoaXMuX3Nob3coKTtcclxuXHRcdFx0dGhpcy5wb3Muc2V0cG9zKCk7XHJcblx0XHRcdHRoaXMuc2hvd2FmdGVyY2FsLmZpcmUoKTsgLy/lsYLmmL7npLrlkI7lm57osINcclxuXHRcdH1cclxuXHR9XHJcblx0LyoqXHJcblx0ICog6ZqQ6JeP5by55bGCXHJcblx0ICovXHJcblx0aGlkZSgpe1xyXG5cdFx0aWYodGhpcy5pc3Nob3coKSl7XHJcblx0XHRcdHRoaXMuaGlkZWJlZm9yZWNhbC5maXJlKCk7IC8v5bGC6ZqQ6JeP5YmN5Zue6LCDXHJcblx0XHRcdHRoaXMubWFzayAmJiB0aGlzLm1hc2suaGlkZSgpO1xyXG5cdFx0XHR0aGlzLl9oaWRlKCk7XHJcblx0XHRcdHRoaXMuaGlkZWFmdGVyY2FsLmZpcmUoKTsgLy/lsYLpmpDol4/lkI7lm57osINcclxuXHRcdH1cclxuXHR9XHJcblx0LyoqXHJcblx0ICog5by55bGC6ZSA5q+BXHJcblx0ICovXHJcblx0ZGVzdHJveSgpe1xyXG5cdFx0dGhpcy5sYXllci5vZmYoJ2NsaWNrLmxpYicsICcuanMtY2xvc2UnKTtcclxuXHRcdHRoaXMucG9zLmRlc3Ryb3koKTtcclxuXHRcdGlmKHRoaXMubWFzayl7XHJcbiAgICAgICAgICAgIHRoaXMubWFzay5kZXN0cm95KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBjb250YWluZXIgPSB0aGlzLmNvbnRhaW5lcjtcclxuICAgICAgICBzdXBlci5kZXN0cm95KCk7XHJcbiAgICAgICAgaWYodGhpcy5fbmV3Y29udGFpbmVyKXtcclxuXHRcdFx0Y29udGFpbmVyLnJlbW92ZSgpO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5fbmV3Y29udGFpbmVyID0gbnVsbDtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQm9tYkxheWVyO1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyBjb25maXJt57G777yM57un5om/6IeqbGF5ZXIvYm9tYkxheWVy44CC5re75Yqg4oCc56Gu5a6a5oyJ6ZKu4oCd5ZKM4oCc5Y+W5raI5oyJ6ZKu4oCd5LqL5Lu25Zue6LCDXHJcbiAqIOWmguaenOW8ueWxguS4reacieS7peS4i+WxnuaAp+eahOiKgueCuVxyXG4gKiBub2RlPVwiY2xvc2VcIu+8jOeCueWHu+WImeS8muWFs+mXreW8ueWxgizlubbop6blj5FoaWRlY2Fs6YCa55+l44CCXHJcbiAqIG5vZGU9XCJva1wi77yM54K55Ye75YiZ6Kem5Y+R4oCc56Gu5a6a5oyJ6ZKu4oCd5LqL5Lu277yM5YWz6Zet5by55bGC77yM5bm26Kem5Y+Rb2tjYWzlkoxoaWRlY2Fs6YCa55+l44CCXHJcbiAqIG5vZGU9XCJjYW5jZWxcIiDngrnlh7vop6blj5HigJzlj5bmtojmjInpkq7igJ3kuovku7bvvIzlhbPpl63lvLnlsYLvvIzlubbop6blj5FjYW5jZWxjYWzlkoxoaWRlY2Fs6YCa55+l44CCXHJcbiAqIEB2ZXJzaW9uIDEuMC4wIHwgMjAxNS0wOS0xNiDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAZXhhbXBsZVxyXG4gKiBcdCBjb25zdCBDb25maXJtID0gcmVxdWlyZSgnbGlibGF5ZXItY29uZmlybScpO1xyXG4gKlxyXG4gKiBcdCB2YXIgbGF5ZXIgPSBuZXcgQ29uZmlybSh7XHJcbiAqIFx0IFx0Y29uZmlybToge1xyXG4gKiBcdFx0XHRmcmFtZXRwbDogWyAvL+W8ueWxguWfuuacrOaooeadv1xyXG5cdFx0XHRcdCc8ZGl2IGNsYXNzPVwianMtdGl0bGVcIj48L2Rpdj4nLFxyXG5cdFx0XHRcdCc8ZGl2IGNsYXNzPVwianMtY29udGVudFwiPjwvZGl2PicsXHJcblx0XHRcdFx0JzxkaXY+PGEgaHJlZj1cImphdmFzY3JpcHQ6O1wiIGNsYXNzPVwianMtb2tcIj7lpb3nmoQ8L2E+PGEgaHJlZj1cImphdmFzY3JpcHQ6O1wiIGNsYXNzPVwianMtY2FuY2VsXCI+562J5LiL6K+0PC9hPjwvZGl2PidcclxuXHRcdFx0XS5qb2luKCcnKVxyXG4gKiAgICAgIH1cclxuICogICB9KTtcclxuICogICBsYXllci5zaG93Y2FsLmFkZChmdW5jdGlvbih0eXBlKXtzd2l0Y2godHlwZSl7Y2FzZSAnYmVmb3JlJzpjb25zb2xlLmxvZygn5bGC5pi+56S65YmNJyk7YnJlYWs7IGNhc2UgJ2FmdGVyJzpjb25zb2xlLmxvZygn5bGC5pi+56S65ZCOJyk7YnJlYWs7fX0pO1xyXG4gKiAgIGxheWVyLmhpZGVjYWwuYWRkKGZ1bmN0aW9uKHR5cGUpe3N3aXRjaCh0eXBlKXtjYXNlICdiZWZvcmUnOmNvbnNvbGUubG9nKCflsYLpmpDol4/liY0nKTticmVhazsgY2FzZSAnYWZ0ZXInOmNvbnNvbGUubG9nKCflsYLpmpDol4/lkI4nKTticmVhazt9fSk7XHJcbiAqICAgbGF5ZXIub2tjYWwuYWRkKGZ1bmN0aW9uKGUpe2NvbnNvbGUubG9nKCfngrnlh7vkuobnoa7lrponKX0pO1xyXG4gKiAgIGxheWVyLmNhbmNlbGNhbC5hZGQoZnVuY3Rpb24oZSl7Y29uc29sZS5sb2coJ+eCueWHu+S6huWPlua2iCcpfSk7XHJcbiAqICAgbGF5ZXIuc2V0TXlDb250ZW50KCforr7nva5ub2RlPVwiY29udGVudFwi6IqC54K555qEaW5uZXJIVE1MJyk7XHJcbiAqICAgdmFyIG5vZGVBcnIgPSBsYXllci5nZXROb2RlcyhbJ3RpdGxlJ10pOyAvLyDojrflj5ZjbGFzcz1cImpzLXRpdGxlXCLnmoToioLngrlcclxuICogICBub2RlQXJyLnRpdGxlLmh0bWwoJ+WGheWuueWMumh0bWwnKTtcclxuICogICBsYXllci5jb250ZW50bm9kZTsgLy/lhoXlrrnljLpub2RlPVwiY29udGVudFwi6IqC54K5XHJcbiAqICAgbGF5ZXIuc2hvdygpOyAvL+aYvuekuuWxglxyXG4gKiAgIGxheWVyLmhpZGUoKTsgLy/pmpDol4/lsYJcclxuICogICBsYXllci5sYXllcjsgLy/lsYJkb23oioLngrnlr7nosaFcclxuICogICBsYXllci5jb250YWluZXI7IC8v5rWu5bGC5a655ZmoXHJcbiAqICAgbGF5ZXIuZGVzdHJveSgpOyAvL+mUgOavgeWxglxyXG4gKiAqL1xyXG5jb25zdCBCb21iTGF5ZXIgPSByZXF1aXJlKCcuL2JvbWJMYXllci5qcycpLFxyXG5cdFx0VHBsID0gcmVxdWlyZSgnLi90cGwuanMnKTtcclxuXHJcbmNsYXNzIENvbmZpcm0gZXh0ZW5kcyBCb21iTGF5ZXIge1xyXG5cdC8qKlxyXG5cdCAqIGNvbmZpcm3nsbtcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcg5Y+C5pWw5ZCMbGF5ZXIvYm9tYkxheWVy6YeM6Z2i55qEY29uZmlnLOWcqOatpOWfuuehgOS4iuWinuWKoOWmguS4i+m7mOiupOmFjee9rlxyXG4gICAgICoge1xyXG4gICAgICogXHQgICpjb25maXJtOiB7XHJcbiAgICAgKiBcdFx0ICpmcmFtZXRwbCB7U3RyaW5nfSBjb25maXJt5Z+65pys5qih5p2/44CC6KaB5rGC6K+36K+m6KeBbGF5ZXIvdHBs6YeM6Z2iY29uZmlybemhueeahOimgeaxglxyXG4gICAgICogICAgfVxyXG4gICAgICogfVxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKGNvbmZpZykge1xyXG5cdFx0dmFyIG9wdCA9ICQuZXh0ZW5kKHRydWUse1xyXG5cdFx0XHRjb25maXJtOiB7XHJcblx0XHRcdFx0ZnJhbWV0cGw6IFRwbC5jb25maXJtIC8vY29uZmlybeW8ueWxguWfuuacrOaooeadv+OAguimgeaxguivt+ivpuingWxheWVyL3RwbOmHjOmdomNvbmZpcm3pobnnmoTopoHmsYJcclxuXHRcdFx0fVxyXG5cdFx0fSxjb25maWcpO1xyXG5cdFx0c3VwZXIob3B0KTtcclxuXHRcdHRoaXMuc2V0Q29udGVudChvcHQuY29uZmlybS5mcmFtZXRwbCk7XHJcblx0XHR0aGlzLmNvbnRlbnRub2RlID0gdGhpcy5sYXllci5maW5kKCcuanMtY29udGVudCcpOyAvL+WGheWuueWMuuiKgueCuVxyXG5cdFx0dGhpcy5va2NhbCA9ICQuQ2FsbGJhY2tzKCk7XHJcblx0XHR0aGlzLmNhbmNlbGNhbCA9ICQuQ2FsbGJhY2tzKCk7XHJcblx0XHQvL+S6i+S7tue7keWumlxyXG5cdCAgICB0aGlzLmxheWVyLm9uKCdjbGljay5saWInLCAnLmpzLW9rJywgKGUpID0+IHtcclxuXHQgICAgXHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdHRoaXMub2tjYWwuZmlyZShlKTtcclxuXHQgICAgXHR0aGlzLmhpZGUoKTtcclxuXHQgICAgfSk7XHJcblx0ICAgIHRoaXMubGF5ZXIub24oJ2NsaWNrLmxpYicsICcuanMtY2FuY2VsJywgKGUpID0+IHtcclxuXHQgICAgXHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdHRoaXMuY2FuY2VsY2FsLmZpcmUoZSk7XHJcblx0ICAgIFx0dGhpcy5oaWRlKCk7XHJcblx0ICAgIH0pO1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiDorr7nva5jb25maXJt5YaF5a655Yy65YW35pyJW25vZGU9XCJjb250ZW50XCJd5bGe5oCn55qE6IqC54K555qEaHRtbFxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGh0bWxcclxuXHQgKi9cclxuXHRzZXRNeUNvbnRlbnQoaHRtbCl7XHJcblx0XHRpZih0eXBlb2YgaHRtbCA9PSAnc3RyaW5nJyAmJiB0aGlzLmNvbnRlbnRub2RlLmxlbmd0aCA+IDApe1xyXG5cdFx0XHR0aGlzLmNvbnRlbnRub2RlLmh0bWwoaHRtbCk7XHJcblx0XHR9XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIOe7hOS7tumUgOavgVxyXG5cdCAqL1xyXG5cdGRlc3Ryb3koKXtcclxuXHRcdHRoaXMubGF5ZXIub2ZmKCdjbGljay5saWInLCAnLmpzLW9rJyk7XHJcblx0XHR0aGlzLmxheWVyLm9mZignY2xpY2subGliJywgJy5qcy1jYW5jZWwnKTtcclxuXHRcdHN1cGVyLmRlc3Ryb3koKTtcclxuXHRcdHRoaXMuY29udGVudG5vZGUgPSBudWxsO1xyXG5cdFx0dGhpcy5va2NhbCA9IG51bGw7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbmZpcm07XHJcbiIsIu+7vy8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IGNvbmZpcm3nmoTlt6XljoLmjqfliLblmajvvIzpm4bmiJBiYXNlQ29udHJvbFxyXG4gKiDlupTnlKjlnLrmma/vvJrpkojlr7nnroDljZVjb25maXJt5by55bGC77yM6ZKI5a+56aKR57mB5pu05pS55by55bGC6YeM5p+Q5Lqb6IqC54K555qE5YaF5a6577yM5Lul5Y+K5pu05pS554K55Ye7XCLnoa7lrppcIuOAgVwi5Y+W5raIXCLmjInpkq7lkI7nmoTlm57osIPkuovku7ZcclxuICog5aaC5p6c5piv5pu05aSN5p2C55qE5Lqk5LqS5bu66K6u5L2/55SobGF5ZXJzLmNvbmZpcm3miJZsYXllcnMuYm9tYkxheWVyXHJcbiAqIEB2ZXJzaW9uIDEuMC4wIHwgMjAxNi0wMS0yNiDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAZXhhbXBsZVxyXG4gKiBcdFx0Y29uc3QgQ29uZmlybUNvbnRyb2wgPSByZXF1aXJlKCdsaWJsYXllci1jb25maXJtQ29udHJvbCcpO1xyXG4gKlxyXG5cdFx0dmFyIGN1cmNvbmZpcm0gPSBuZXcgQ29uZmlybUNvbnRyb2woKTtcclxuXHRcdGN1cmNvbmZpcm0uc2V0Y29uZmlnKHtcclxuXHRcdFx0Y29uZmlybToge1xyXG5cdFx0XHRcdGZyYW1ldHBsOiBbXHJcblx0XHRcdFx0XHQnPGRpdiBjbGFzcz1cImpzLWNvbnRlbnRcIj48L2Rpdj4nLFxyXG5cdFx0XHRcdFx0JzxkaXY+PGEgaHJlZj1cImphdmFzY3JpcHQ6O1wiIGNsYXNzPVwianMtb2tcIj7lpb3nmoQ8L2E+PGEgaHJlZj1cImphdmFzY3JpcHQ6O1wiIGNsYXNzPVwianMtY2FuY2VsXCI+562J5LiL6K+0PC9hPjwvZGl2PidcclxuXHRcdFx0XHRdLmpvaW4oJycpXHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0Y3VyY29uZmlybS5zaG93KHtcclxuXHRcdCAgICBjb250ZW50OiAn5oKo6L+Y5pyq55m76ZmGJ1xyXG5cdFx0fSx7XHJcblx0XHQgICAgb2s6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn54K55Ye75aW955qEJyk7XHJcbiAgICAgICAgICAgIH0sXHJcblx0XHRcdGNhbmNlbDogZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRjb25zb2xlLmxvZygn54K55Ye7562J5LiL6K+0Jyk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0Y3VyY29uZmlybS5nZXRsYXllcm9iaigp77ybIC8vbGF5ZXIvY29uZmlybeexu+WvueixoVxyXG4gKiAqL1xyXG5cclxuIGNvbnN0IENvbmZpcm0gPSByZXF1aXJlKCcuL2NvbmZpcm0uanMnKSxcclxuIFx0XHRCYXNlQ29udHJvbCA9IHJlcXVpcmUoJy4vYmFzZUNvbnRyb2wuanMnKTtcclxuXHJcbmNsYXNzIENvbmZpcm1Db250cm9sIGV4dGVuZHMgQmFzZUNvbnRyb2wge1xyXG5cdC8qKlxyXG4gICAgICogY29uZmlybeW3peWOguaOp+WItuWZqFxyXG4gICAgICovXHJcblx0Y29uc3RydWN0b3IoaGlkZWRlc3Ryb3kpIHtcclxuXHRcdHN1cGVyKGhpZGVkZXN0cm95KTtcclxuXHRcdHRoaXMuX29rY2FsID0gZnVuY3Rpb24oKXt9OyAvL+eCueWHu29r55qE5Zue6LCD56eB5pyJ5a2Y5YKo5ZmoXHJcblx0XHR0aGlzLl9jYW5jZWxjYWwgPSBmdW5jdGlvbigpe307IC8v54K55Ye7Y2FuY2Vs55qE5Zue6LCD56eB5pyJ5a2Y5YKo5ZmoXHJcblx0XHR0aGlzLl9mdW5hcnIgPSBbJ29rJywnY2FuY2VsJ107IC8v5Y+v5o6n5Yi255qE5Zue6LCD5pa55rOV5ZCNXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIOiOt+WPlmNvbmZpcm3lvLnlsYJcclxuXHQgKiBAcGFyYW0ge0Jvb2xlYW59IHJlc2V0IOaYr+WQpumHjeaWsOa4suafk+aooeadv+OAgum7mOiupOS4umZhbHNlXHJcblx0ICovXHJcblx0Z2V0bGF5ZXJvYmoocmVzZXQpe1xyXG5cdFx0aWYodGhpcy5fbGF5ZXJvYmogPT0gbnVsbCl7XHJcblx0XHRcdHRoaXMuX2xheWVyb2JqID0gbmV3IENvbmZpcm0odGhpcy5fZGVmYXVsdG9wdCk7XHJcblx0XHRcdHRoaXMuX2xheWVyb2JqLm9rY2FsLmFkZCgoZSkgPT4ge1xyXG5cdFx0XHRcdHRoaXMuX29rY2FsKCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHR0aGlzLl9sYXllcm9iai5jYW5jZWxjYWwuYWRkKChlKSA9PiB7XHJcblx0XHRcdFx0dGhpcy5fY2FuY2VsY2FsKCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHR0aGlzLl9hZGRjYWxsKCk7XHJcblx0XHR9ZWxzZXtcclxuICAgICAgICAgICAgaWYocmVzZXQpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbGF5ZXJvYmouc2V0Q29udGVudCh0aGlzLl9kZWZhdWx0b3B0LmNvbmZpcm0uZnJhbWV0cGwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cdFx0cmV0dXJuIHRoaXMuX2xheWVyb2JqO1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiDplIDmr4FhbGVydOW8ueWxglxyXG5cdCAqL1xyXG5cdGRlc3Ryb3koKXtcclxuXHRcdHN1cGVyLmRlc3Ryb3koKTtcclxuXHRcdHRoaXMuX29rY2FsID0gZnVuY3Rpb24oKXt9O1xyXG5cdFx0dGhpcy5fY2FuY2VsY2FsID0gZnVuY3Rpb24oKXt9O1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb25maXJtQ29udHJvbDtcclxuIiwi77u/LyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcgY29uZnJpbeexu+WNleS9k+aOp+WItuWZqO+8jOS4gOiIrOeUqOS6jueugOWNleeahGNvbmZpcm3kv6Hmga/mj5DnpLrjgIJcclxuICog5rOo5oSP77ya6K+lY29uZnJpbeaOp+WItueahOWvueixoeWPimRvbeWcqOWFqOWxgOS4reWUr+S4gOWtmOWcqO+8jOWmguaenOaDs+imgeWIm+W7uuWkmuS4qu+8jOivt+S9v+eUqGxpYmxheWVycy9jb25maXJt5oiWbGlibGF5ZXJzL2NvbmZpcm1Db250cm9sXHJcbiAqIEB2ZXJzaW9uIDEuMC4wIHwgMjAxNS0wOS0xNiDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAZXhhbXBsZVxyXG4gKiAgICAgIGNvbnN0IENvbmZpcm1TaW5nbGUgPSByZXF1aXJlKCdsaWJsYXllci1jb25maXJtU2luZ2xlJyk7XHJcbiAqXHJcblx0XHRDb25maXJtU2luZ2xlLnNldGNvbmZpZyh7XHJcblx0XHRcdGNvbmZpcm06IHtcclxuXHRcdFx0XHRmcmFtZXRwbDogW1xyXG5cdFx0XHRcdFx0JzxkaXYgY2xhc3M9XCJqcy1jb250ZW50XCI+PC9kaXY+JyxcclxuXHRcdFx0XHRcdCc8ZGl2PjxhIGhyZWY9XCJqYXZhc2NyaXB0OjtcIiBjbGFzcz1cImpzLW9rXCI+5aW955qEPC9hPjxhIGhyZWY9XCJqYXZhc2NyaXB0OjtcIiBjbGFzcz1cImpzLWNhbmNlbFwiPuetieS4i+ivtDwvYT48L2Rpdj4nXHJcblx0XHRcdFx0XS5qb2luKCcnKVxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdENvbmZpcm1TaW5nbGUuc2hvdyh7XHJcblx0XHQgICAgY29udGVudDogJ+aCqOi/mOacqueZu+mZhidcclxuXHRcdH0se1xyXG5cdFx0ICAgIG9rOiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+eCueWHu+WlveeahCcpO1xyXG4gICAgICAgICAgICB9LFxyXG5cdFx0XHRjYW5jZWw6IGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0Y29uc29sZS5sb2coJ+eCueWHu+etieS4i+ivtCcpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuICAgICAgICBDb25maXJtU2luZ2xlLmdldGxheWVyb2JqKCnvvJsgLy9sYXllci9jb25maXJt57G75a+56LGhXHJcbiAqICovXHJcbiBjb25zdCBDb25mcmltQ29udHJvbCA9IHJlcXVpcmUoJy4vY29uZmlybUNvbnRyb2wuanMnKTtcclxuXHJcbiBtb2R1bGUuZXhwb3J0cyA9IG5ldyBDb25mcmltQ29udHJvbCgpO1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyDmta7lsYLln7rnsbtcclxuICogQHZlcnNpb24gMS4wLjAgfCAyMDE1LTA4LTE5IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm4g5rWu5bGC5Z+657G7XHJcbiAqIEBleGFtcGxlXHJcbiAqXHJcbiAqIFx0Y29uc3QgTGF5ZXIgPSByZXF1aXJlKCdsaWJsYXllci1sYXllcicpO1xyXG4gKlxyXG4gKiBcdCB2YXIgbGF5ZXIgPSBuZXcgTGF5ZXIoJCgnYm9keScpKTtcclxuICogICBsYXllci5zaG93YmVmb3JlY2FsLmFkZChmdW5jdGlvbigpe2NvbnNvbGUubG9nKCflsYLmmL7npLrliY0nKTt9KTtcclxuICogICBsYXllci5oaWRlYmVmb3JlY2FsLmFkZChmdW5jdGlvbigpe2NvbnNvbGUubG9nKCflsYLpmpDol4/liY0nKTt9KTtcclxuICogICBsYXllci5zaG93YWZ0ZXJjYWwuYWRkKGZ1bmN0aW9uKCl7Y29uc29sZS5sb2coJ+WxguaYvuekuuWQjicpO30pO1xyXG4gKiAgIGxheWVyLmhpZGVhZnRlcmNhbC5hZGQoZnVuY3Rpb24oKXtjb25zb2xlLmxvZygn5bGC6ZqQ6JeP5ZCOJyk7fSk7XHJcbiAqICAgbGF5ZXIuaGlkZSgpOyAvL+makOiXj+WxglxyXG4gKiAgIGxheWVyLmxheWVyOyAvL+WxgmRvbeiKgueCueWvueixoVxyXG4gKiAgIGxheWVyLmNvbnRhaW5lcjsgLy/mta7lsYLlrrnlmahcclxuICogICBsYXllci5kZXN0cm95KCk7IC8v6ZSA5q+B5bGCXHJcbiAqICovXHJcblxyXG4gY2xhc3MgTGF5ZXIge1xyXG5cdCAvKipcclxuIFx0ICog5rWu5bGC5Z+657G74oCU4oCU5Yib5bu65bm25re75Yqg5Yiw5oyH5a6a5a655Zmo5LitXHJcbiAgICAgICogQHBhcmFtIHtFbGVtZW50fSBjb250YWluZXIg5rWu5bGC5a2Y5pS+5a655Zmo77yM6buY6K6k5Li6JCgnYm9keScpXHJcbiAgICAgICogQHBhcmFtIHtKU09OfSBjb25maWcg5bGC6YWN572u5Y+C5pWw77yM6buY6K6k5L+h5oGv5Y+K6K+05piO5aaC5LiLb3B05Luj56CB5aSEXHJcbiBcdCAqL1xyXG5cdCBjb25zdHJ1Y3Rvcihjb250YWluZXIsY29uZmlnKXtcclxuXHRcdGNvbnRhaW5lciA9IGNvbnRhaW5lciB8fCAkKCdib2R5Jyk7XHJcbiBcdFx0dmFyIG9wdCA9ICQuZXh0ZW5kKHRydWUse1xyXG4gXHRcdFx0Y2xhc3NuYW1lOiAnJywgLy9sYXllcueahGNsYXNzXHJcbiBcdFx0XHR6SW5kZXg6IDIsIC8vbGF5ZXLnmoR6LWluZGV4XHJcbiBcdFx0XHRwb3NpdGlvbjogJ2Fic29sdXRlJywgLy9sYXllcueahHBvc2l0aW9u44CC6buY6K6k5pivYWJzb2x1dGVcclxuIFx0XHRcdHNob3c6IGZhbHNlLCAvL+WIm+W7uuWxguWQjum7mOiupOaYr+WQpuaYvuekulxyXG4gXHRcdFx0Y3VzdG9tOiB7XHJcbiBcdFx0XHRcdHNob3c6IG51bGwsIC8v55So5oi36Ieq5a6a5LmJ5pi+56S65bGC55qE5pa55rOV44CC5aaC5p6c5q2k5pa55rOV5a2Y5Zyo77yM5YiZ5LiN55So6buY6K6k55qE5pi+56S65bGC5pa55rOVXHJcbiBcdFx0XHRcdGhpZGU6IG51bGwgLy/nlKjmiLfoh6rlrprkuYnpmpDol4/lsYLnmoTmlrnms5XjgILlpoLmnpzmraTmlrnms5XlrZjlnKjvvIzliJnkuI3nlKjpu5jorqTnmoTpmpDol4/lsYLmlrnms5VcclxuIFx0XHRcdH1cclxuIFx0XHR9LGNvbmZpZyB8fCB7fSk7XHJcbiBcdFx0dmFyIGNzc3N0ciA9ICdwb3NpdGlvbjonK29wdC5wb3NpdGlvbisnOycrKG9wdC5zaG93PycnOidkaXNwbGF5Om5vbmU7JykrJ3otaW5kZXg6JytvcHQuekluZGV4Kyc7JztcclxuIFx0XHR0aGlzLmNvbnRhaW5lciA9IGNvbnRhaW5lcjsgLy/mta7lsYLlrrnlmahcclxuIFx0XHR0aGlzLmxheWVyID0gJCgnPGRpdicrKG9wdC5jbGFzc25hbWUgPT0gJyc/Jyc6JyBjbGFzcz1cIicrb3B0LmNsYXNzbmFtZSsnXCInKSsnIHN0eWxlPVwiJytjc3NzdHIrJ1wiPjwvZGl2PicpO1xyXG4gXHRcdHRoaXMubGF5ZXIuYXBwZW5kVG8oY29udGFpbmVyKTtcclxuIFx0XHR0aGlzLnNob3diZWZvcmVjYWwgPSAkLkNhbGxiYWNrcygpOyAvL+WxguaYvuekuuWJjeeahOWbnuiwg1xyXG4gXHRcdHRoaXMuc2hvd2FmdGVyY2FsID0gJC5DYWxsYmFja3MoKTsgLy/lsYLmmL7npLrlkI7nmoTlm57osINcclxuIFx0XHR0aGlzLmhpZGViZWZvcmVjYWwgPSAkLkNhbGxiYWNrcygpOyAvL+WxgumakOiXj+WJjeeahOWbnuiwg1xyXG4gXHRcdHRoaXMuaGlkZWFmdGVyY2FsID0gJC5DYWxsYmFja3MoKTsgLy/lsYLpmpDol4/lkI7nmoTlm57osINcclxuIFx0XHR0aGlzLmN1c3RvbSAgPSBvcHQuY3VzdG9tOyAvL+iHquWumuS5ieaWueazlVxyXG5cdCB9XHJcblx0IC8qKlxyXG4gXHQgKiDorr7nva7lsYLlhoXlrrlcclxuICBcdCAqIEBwYXJhbSB7RWxlbWVudHxTdHJpbmd9ICpjb250ZW50IGh0bWzlrZfnrKbkuLLmiJbogIXoioLngrnlr7nosaFcclxuIFx0ICovXHJcblx0IHNldENvbnRlbnQoY29udGVudCl7XHJcblx0XHRpZihhcmd1bWVudHMubGVuZ3RoID09IDApe1xyXG4gXHRcdFx0cmV0dXJuO1xyXG4gXHRcdH1cclxuIFx0XHRpZih0eXBlb2YgY29udGVudCA9PSAnc3RyaW5nJyl7XHJcbiBcdFx0XHR0aGlzLmxheWVyLmh0bWwoY29udGVudCk7XHJcbiBcdFx0fVxyXG4gXHRcdGVsc2V7XHJcbiBcdFx0XHR0aGlzLmxheWVyLmh0bWwoJycpLmFwcGVuZChjb250ZW50KTtcclxuIFx0XHR9XHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOaYvuekuuWxguOAglxyXG4gXHQgKi9cclxuXHQgX3Nob3coKXtcclxuXHRcdCBpZih0eXBlb2YgdGhpcy5jdXN0b20uc2hvdyA9PSAnZnVuY3Rpb24nKXtcclxuIFx0XHRcdHRoaXMuY3VzdG9tLnNob3codGhpcy5sYXllcik7XHJcbiBcdFx0fVxyXG4gXHRcdGVsc2V7XHJcbiBcdFx0XHR0aGlzLmxheWVyLnNob3coKTtcclxuIFx0XHR9XHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOaYvuekuuWxguOAguS8muinpuWPkXNob3djYWzlm57osINcclxuIFx0ICovXHJcbiBcdCBzaG93KCl7XHJcblx0XHQgaWYoIXRoaXMuaXNzaG93KCkpe1xyXG4gXHRcdFx0dGhpcy5zaG93YmVmb3JlY2FsLmZpcmUoKTsgLy/lsYLmmL7npLrliY3lm57osINcclxuIFx0XHRcdHRoaXMuX3Nob3coKTtcclxuIFx0XHRcdHRoaXMuc2hvd2FmdGVyY2FsLmZpcmUoKTsgLy/lsYLmmL7npLrlkI7lm57osINcclxuIFx0XHR9XHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOmakOiXj+WxguOAglxyXG4gXHQgKi9cclxuXHQgX2hpZGUoKXtcclxuXHRcdGlmKHR5cGVvZiB0aGlzLmN1c3RvbS5oaWRlID09ICdmdW5jdGlvbicpe1xyXG4gXHRcdFx0dGhpcy5jdXN0b20uaGlkZSh0aGlzLmxheWVyKTtcclxuIFx0XHR9XHJcbiBcdFx0ZWxzZXtcclxuIFx0XHRcdHRoaXMubGF5ZXIuaGlkZSgpO1xyXG4gXHRcdH1cclxuXHQgfVxyXG5cdCAvKipcclxuIFx0ICog6ZqQ6JeP5bGC44CC5Lya6Kem5Y+RaGlkZWNhbOWbnuiwg1xyXG4gXHQgKi9cclxuXHQgaGlkZSgpe1xyXG5cdFx0IGlmKHRoaXMuaXNzaG93KCkpe1xyXG4gXHRcdFx0dGhpcy5oaWRlYmVmb3JlY2FsLmZpcmUoKTsgLy/lsYLpmpDol4/liY3lm57osINcclxuIFx0XHRcdHRoaXMuX2hpZGUoKTtcclxuIFx0XHRcdHRoaXMuaGlkZWFmdGVyY2FsLmZpcmUoKTsgLy/lsYLpmpDol4/lkI7lm57osINcclxuIFx0XHR9XHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOmUgOavgeWxglxyXG4gXHQgKi9cclxuXHQgZGVzdHJveSgpe1xyXG5cdFx0IGlmKHRoaXMubGF5ZXIgIT0gbnVsbCl7XHJcbiBcdFx0XHR0aGlzLmxheWVyLnJlbW92ZSgpO1xyXG4gXHRcdFx0dGhpcy5sYXllciA9IG51bGw7XHJcbiBcdFx0XHR0aGlzLnNob3djYWwgPSBudWxsO1xyXG4gXHRcdFx0dGhpcy5oaWRlY2FsID0gbnVsbDtcclxuIFx0XHRcdHRoaXMuY3VzdG9tID0gbnVsbDtcclxuIFx0XHRcdHRoaXMuY29udGFpbmVyID0gbnVsbDtcclxuIFx0XHR9XHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOWIpOaWreWxguaYr+WQpuaYvuekulxyXG4gXHQgKiBAcmV0dXJuIHtCb29sZWFufSB0cnVlfGZhbHNlXHJcbiBcdCAqL1xyXG5cdCBpc3Nob3coKXtcclxuXHRcdCByZXR1cm4gdGhpcy5sYXllci5jc3MoJ2Rpc3BsYXknKSAhPSAnbm9uZSc7XHJcblx0IH1cclxuIH1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTGF5ZXI7XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IOmBrue9qeexu+KAlOKAlOWIm+W7uumBrue9qeW5tui/m+ihjOebuOWFs+aOp+WItlxyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE1LTA4LTE1IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm4g6YGu572p5a+56LGhXHJcbiAqIEBleGFtcGxlXHJcbiAqIFx0IGNvbnN0IE1hc2sgPSByZXF1aXJlKCdsaWJsYXllci1tYXNrJyk7XHJcbiAqXHJcbiAqIFx0IHZhciBtYXNrID0gbmV3ICRtYXNrKCQoJ2JvZHknKSk7XHJcbiAqICAgbWFzay5zaG93KCk7IC8v5pi+56S66YGu572pXHJcbiAqICAgbWFzay5oaWRlKCk7IC8v6ZqQ6JeP6YGu572pXHJcbiAqICAgbWFzay5tYXNrOyAvL+mBrue9qWRvbeiKgueCueWvueixoVxyXG4gKiAgIG1hc2suY29udGFpbmVyOyAvL+mBrue9qeWuueWZqFxyXG4gKiAgIG1hc2suZGVzdHJveSgpOyAvL+mUgOavgemBrue9qVxyXG4gKiAgIG1hc2suY2xpY2tjYWwuYWRkKGZ1bmN0aW9uKGUpe1xyXG4gKiBcdCAgICBjb25zb2xlLmxvZygn6YGu572p6KKr54K55Ye7Jyk7XHJcbiAqICAgfSk7XHJcbiAqICovXHJcblxyXG4gY29uc3QgUG9zaXRpb25Cb21iID0gcmVxdWlyZSgnLi9wb3NpdGlvbkJvbWIuanMnKTtcclxuXHJcbiBjbGFzcyBNYXNre1xyXG5cdCAvKipcclxuXHQgICog6YGu572p57G74oCU4oCU5Yib5bu66YGu572pZG9t5bm25re75Yqg5Yiw5oyH5a6a5a655Zmo5LitXHJcblx0ICAqIEBwYXJhbSB7RWxlbWVudH0gY29udGFpbmVyIOmBrue9qeWtmOaUvuWuueWZqO+8jOm7mOiupOS4uiQoJ2JvZHknKVxyXG5cdCAgKiBAcGFyYW0ge0pTT059IGNvbmZpZyDpga7nvanphY3nva7lj4LmlbDvvIzpu5jorqTkv6Hmga/lj4ror7TmmI7lpoLkuItvcHTku6PnoIHlpIRcclxuXHQgICovXHJcblx0IGNvbnN0cnVjdG9yKGNvbnRhaW5lcixjb25maWcpe1xyXG5cdFx0IGNvbnRhaW5lciA9IGNvbnRhaW5lciB8fCAkKCdib2R5Jyk7XHJcblx0XHQgdmFyIG9wdCA9ICQuZXh0ZW5kKHtcclxuICAgICAgICAgICAgIGNsYXNzbmFtZTogJycsIC8vbWFza+eahGNsYXNzXHJcblx0XHRcdCBiZ2NvbG9yOiAnIzAwMCcsIC8v6IOM5pmv6ImyXHJcblx0XHRcdCB6SW5kZXg6IDEsIC8v6YGu572pei1pbmRleFxyXG5cdFx0XHQgb3BhY2l0eTogMC42LCAvL+mBrue9qemAj+aYjuW6plxyXG5cdFx0XHQgc2hvdzogZmFsc2UsIC8v5Yib5bu66YGu572p5ZCO6buY6K6k5piv5ZCm5pi+56S6XHJcblx0XHRcdCBjdXN0b206IHtcclxuXHRcdFx0XHQgc2hvdzogbnVsbCwgLy/nlKjmiLfoh6rlrprkuYnmmL7npLrlsYLnmoTmlrnms5XjgILlpoLmnpzmraTmlrnms5XlrZjlnKjvvIzliJnkuI3nlKjpu5jorqTnmoTmmL7npLrlsYLmlrnms5VcclxuXHRcdFx0XHQgaGlkZTogbnVsbCAvL+eUqOaIt+iHquWumuS5iemakOiXj+WxgueahOaWueazleOAguWmguaenOatpOaWueazleWtmOWcqO+8jOWImeS4jeeUqOm7mOiupOeahOmakOiXj+WxguaWueazlVxyXG5cdFx0XHQgfVxyXG5cdFx0IH0sY29uZmlnIHx8IHt9KTtcclxuXHRcdCB2YXIgY3Nzc3RyID0gJ3Bvc2l0aW9uOmFic29sdXRlO2JhY2tncm91bmQ6JytvcHQuYmdjb2xvcisnOycrKG9wdC5zaG93PycnOidkaXNwbGF5Om5vbmU7JykrJ3otaW5kZXg6JytvcHQuekluZGV4Kyc7JztcclxuXHRcdCB0aGlzLmNvbnRhaW5lciA9IGNvbnRhaW5lcjsgLy/pga7nvanlrrnlmahcclxuXHRcdCB0aGlzLm1hc2sgPSAkKCc8ZGl2Jysob3B0LmNsYXNzbmFtZSA9PSAnJz8nJzonIGNsYXNzPVwiJytvcHQuY2xhc3NuYW1lKydcIicpKycgc3R5bGU9XCInK2Nzc3N0cisnXCI+PC9kaXY+Jyk7XHJcblx0XHQgdGhpcy5tYXNrLmFwcGVuZFRvKGNvbnRhaW5lcik7XHJcblx0XHQgdGhpcy5tYXNrLmNzcygnb3BhY2l0eScsb3B0Lm9wYWNpdHkpO1xyXG5cdFx0IHRoaXMuY3VzdG9tICA9IG9wdC5jdXN0b207IC8v6Ieq5a6a5LmJ5pa55rOVXHJcblx0XHQgdGhpcy5wb3MgPSBuZXcgUG9zaXRpb25Cb21iKHtsYXllcjp0aGlzLm1hc2t9LHttb2RlOidmdWxsJ30pO1xyXG5cdFx0IC8v57uR5a6a5LqL5Lu2XHJcblx0XHQgdGhpcy5jbGlja2NhbCA9ICQuQ2FsbGJhY2tzKCk7IC8v6YGu572p54K55Ye75ZCO55qE5Zue6LCDXHJcblx0XHQgdGhpcy5tYXNrLm9uKCdjbGljay5saWInLChlKSA9PiB7XHJcblx0XHRcdCB0aGlzLmNsaWNrY2FsLmZpcmUoZSk7XHJcblx0XHQgfSk7XHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOaYvuekuumBrue9qVxyXG4gXHQgKi9cclxuXHQgc2hvdygpe1xyXG5cdFx0aWYodHlwZW9mIHRoaXMuY3VzdG9tLnNob3cgPT0gJ2Z1bmN0aW9uJyl7XHJcbiBcdFx0XHR0aGlzLmN1c3RvbS5zaG93KHRoaXMubWFzayk7XHJcbiBcdFx0fVxyXG4gXHRcdGVsc2V7XHJcbiBcdFx0XHR0aGlzLm1hc2suc2hvdygpO1xyXG4gXHRcdH1cclxuIFx0XHR0aGlzLnBvcy5zZXRwb3MoKTtcclxuXHQgfVxyXG5cdCAvKipcclxuIFx0ICog6ZqQ6JeP6YGu572pXHJcbiBcdCAqL1xyXG5cdCBoaWRlKCl7XHJcblx0XHQgaWYodHlwZW9mIHRoaXMuY3VzdG9tLmhpZGUgPT0gJ2Z1bmN0aW9uJyl7XHJcbiBcdFx0XHR0aGlzLmN1c3RvbS5oaWRlKHRoaXMubWFzayk7XHJcbiBcdFx0fVxyXG4gXHRcdGVsc2V7XHJcbiBcdFx0XHR0aGlzLm1hc2suaGlkZSgpO1xyXG4gXHRcdH1cclxuXHQgfVxyXG5cdCAvKipcclxuIFx0ICog6ZSA5q+B6YGu572pXHJcbiBcdCAqL1xyXG5cdCBkZXN0cm95KCl7XHJcblx0XHQgaWYodGhpcy5tYXNrICE9IG51bGwpe1xyXG4gXHRcdFx0dGhpcy5tYXNrLm9mZignY2xpY2subGliJyk7XHJcbiBcdFx0XHR0aGlzLm1hc2sucmVtb3ZlKCk7XHJcbiBcdFx0XHR0aGlzLm1hc2sgPSBudWxsO1xyXG4gXHRcdFx0dGhpcy5wb3MuZGVzdHJveSgpO1xyXG4gXHRcdFx0dGhpcy5wb3MgPSBudWxsO1xyXG4gXHRcdFx0dGhpcy5jbGlja2NhbCA9IG51bGw7XHJcbiBcdFx0fVxyXG5cdCB9XHJcbiB9XHJcblxyXG4gbW9kdWxlLmV4cG9ydHMgPSBNYXNrO1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyDlvLnlsYLlrprkvY3mlrnms5VcclxuICogXHRcdOazqOaEj++8muiwg+eUqOatpOaWueazleWJje+8jOW/hemhu+aYr+W+heWumuS9jeWxgueahGRpc3BsYXnkuI3kuLpudWxs55qE5oOF5Ya15LiLXHJcbiAqIEB2ZXJzaW9uIDEuMCB8IDIwMTUtMDgtMTUg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQHJldHVybiDlvLnlsYLlrprkvY3mlrnms5VcclxuICogQGV4YW1wbGVcclxuICogXHQgY29uc3QgUG9zaXRpb25Cb21iID0gcmVxdWlyZSgnbGlibGF5ZXItcG9zaXRpb25Cb21iJyk7XHJcbiAqXHJcbiAqIFx0IHZhciBwb3MgPSBuZXcgUG9zaXRpb25Cb21iKHtsYXllcjrlsYJkb23oioLngrl9KTtcclxuICogXHQgcG9zLnBvc2NhbC5hZGQoZnVuY3Rpb24oKXtjb25zb2xlLmxvZygnbGF5ZXLlrprkvY3lkI7lm57osIMnKX0pO1xyXG4gKiAqL1xyXG5cclxuIGNvbnN0IFdpbnNjcm9sbCA9IHJlcXVpcmUoJ2xpYnV0aWwtd2luc2Nyb2xsJyksXHJcbiBcdFx0U2Nyb2xsID0gcmVxdWlyZSgnbGlidXRpbC1zY3JvbGwnKSxcclxuXHRcdFdpbnJlc2l6ZSA9IHJlcXVpcmUoJ2xpYnV0aWwtd2lucmVzaXplJyksXHJcblx0XHRSZXNpemUgPSByZXF1aXJlKCdsaWJ1dGlsLXJlc2l6ZScpO1xyXG5cclxuLyoqXHJcbiAqIOWumuS9jeeul+azlVxyXG4gKi9cclxuZnVuY3Rpb24gc2V0cG9zKGRvbW9wdCxwb3NvcHQpe1xyXG5cdHZhciBjc3NvcHQgPSB7fSxsYXllciA9IGRvbW9wdC5sYXllcixvZmZjb24gPSBkb21vcHQub2ZmY29uO1xyXG5cdGxheWVyLmNzcygncG9zaXRpb24nLGRvbW9wdC5wb3NpdGlvbik7XHJcblx0dmFyIG1hcmdpbkxlZnQgPSAwLCBtYXJnaW5Ub3AgPSAwO1xyXG5cdGlmKGRvbW9wdC5wb3NpdGlvbiA9PSAnYWJzb2x1dGUnICYmIHBvc29wdC5maXhlZCl7XHJcblx0XHRtYXJnaW5MZWZ0ID0gb2ZmY29uLnNjcm9sbExlZnQoKTtcclxuXHRcdG1hcmdpblRvcCA9IG9mZmNvbi5zY3JvbGxUb3AoKTtcclxuXHR9XHJcblx0c3dpdGNoIChwb3NvcHQubW9kZSl7XHJcblx0XHRjYXNlICdjJzogLy/lsYXkuK3lrprkvY1cclxuXHRcdFx0bWFyZ2luTGVmdCAtPSAoTWF0aC5tYXgobGF5ZXIud2lkdGgoKSxwb3NvcHQubWlud2lkdGgpLzIrcG9zb3B0Lm9mZnNldFswXSk7XHJcblx0XHRcdG1hcmdpblRvcCAtPSAoTWF0aC5tYXgobGF5ZXIuaGVpZ2h0KCkscG9zb3B0Lm1pbmhlaWdodCkvMitwb3NvcHQub2Zmc2V0WzFdKTtcclxuXHRcdFx0Y3Nzb3B0LnRvcCA9ICc1MCUnO1xyXG5cdFx0XHRjc3NvcHQubGVmdCA9ICc1MCUnO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdGNhc2UgJ2Z1bGwnOiAvL+a7oeWxj+WumuS9je+8jOWNoOa7oeaVtOS4quWumuS9jeWuueWZqOOAguacrOadpeS4jeiuvue9rndpZHRo5ZKMaGVpZ2h077yM6K6+572u5LqGcmlnaHTlkoxib3R0b23jgILkvYbmmK/lgbblj5FtYXJnaW7kuI3otbfkvZznlKjvvIzmraTml7bor7vlj5bnmoTlhYPntKDlsLrlr7jkuLowLlxyXG5cdFx0XHRjc3NvcHQud2lkdGggPSAnMTAwJSc7XHJcblx0XHRcdGNzc29wdC5oZWlnaHQgPSAnMTAwJSc7XHJcblx0XHRcdGNzc29wdC50b3AgPSAnMCc7XHJcblx0XHRcdGNzc29wdC5sZWZ0ID0gJzAnO1xyXG5cdFx0XHRicmVhaztcclxuXHR9XHJcblx0Y3Nzb3B0Lm1hcmdpbkxlZnQgPSBtYXJnaW5MZWZ0KydweCc7XHJcblx0Y3Nzb3B0Lm1hcmdpblRvcCA9IG1hcmdpblRvcCsncHgnO1xyXG5cdGlmKHR5cGVvZiBwb3NvcHQuY3VzdG9tcG9zID09ICdmdW5jdGlvbicpe1xyXG5cdFx0cG9zb3B0LmN1c3RvbXBvcyhjc3NvcHQpO1xyXG5cdH1lbHNle1xyXG5cdFx0bGF5ZXIuY3NzKGNzc29wdCk7XHJcblx0fVxyXG59XHJcblxyXG5jbGFzcyBQb3NpdGlvbntcclxuXHQvKipcclxuXHQgKiDlrprkvY3nsbtcclxuICAgICAqIEBwYXJhbSB7SlNPTn0gZG9tcyDlrprkvY1kb23nm7jlhbPkv6Hmga9cclxuICAgICAqIFx0XHR7XHJcbiAgICAgKiBcdFx0XHRsYXllcjogbnVsbCAvL3tKUXVlcnlFbGVtZW50fFN0cmluZ+iKgueCuemAieaLqeWZqH0g5b6F5a6a5L2N5bGC6IqC54K5XHJcbiAgICAgKiAgICAgIH1cclxuICAgICAqIEBwYXJhbSB7SlNPTn0gY29uZmlnIOWxguWumuS9jemFjee9ruWPguaVsO+8jOm7mOiupOS/oeaBr+WPiuivtOaYjuWmguS4i3Bvc29wdOS7o+eggeWkhFxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKGRvbXMsY29uZmlnKXtcclxuXHRcdC8v5Y+C5pWw5qOA5rWL5LiO6K6+572uXHJcblx0XHRpZihhcmd1bWVudHMubGVuZ3RoID09IDApe1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ+W/hemhu+S8oOWFpeebuOWFs+WumuS9jeeahGRvbeWPguaVsCcpO1xyXG5cdFx0fVxyXG5cdFx0dmFyIGRvbW9wdCA9ICQuZXh0ZW5kKHtcclxuXHRcdFx0bGF5ZXI6IG51bGwsIC8v5b6F5a6a5L2N5bGC6IqC54K5XHJcblx0XHRcdG9mZnBhZ2U6IGZhbHNlIC8v6K+05piO55u45a+55LqO5b2T5YmN6aG16Z2i5a6a5L2NXHJcblx0XHR9LGRvbXMgfHwge30pO1xyXG5cdFx0aWYoZG9tb3B0LmxheWVyICYmIHR5cGVvZiBkb21vcHQubGF5ZXIgPT0gJ3N0cmluZycpe1xyXG5cdFx0XHRkb21vcHQubGF5ZXIgPSAkKGRvbW9wdC5sYXllcik7XHJcblx0XHR9XHJcblx0XHRpZighZG9tb3B0LmxheWVyIHx8IGRvbW9wdC5sYXllci5sZW5ndGggPT0gMCl7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcign5Lyg5YWl55qE5a6a5L2N5bGC6IqC54K55peg5pWIJyk7XHJcblx0XHR9XHJcblx0XHR2YXIgcG9zb3B0ID0gJC5leHRlbmQoe1xyXG5cdFx0XHRmaXhlZDogdHJ1ZSwgLy/mmK/lkKblsIblvLnlsYLlp4vnu4jlrprkvY3lnKjlj6/op4bnqpflj6PljLrln5/vvIzpu5jorqTkuLp0cnVlXHJcblx0XHRcdG1vZGU6ICdjJywgLy/lrprkvY3mqKHlvI/vvIzmnprkuL7jgIJjOuS4remXtFxyXG5cdFx0XHRvZmZzZXQ6IFswLDBdLCAvL+WumuS5ieWQjuWBj+enu+WwuuWvuCBbeOi9tCx56L20XeOAguWvueS6jm1vZGXmmK9mdWxs55qE5qih5byP5peg5pWIXHJcblx0XHRcdHNpemVjaGFuZ2U6IGZhbHNlLCAvL+W9k21vZGXmmK9j5pe277yMb2Zmc2V0UGFyZW50IHJlc2l6ZeaXtu+8jOW+heWumuS9jeWxgueahOWkp+Wwj+aYr+WQpuS8muaUueWPmFxyXG5cdFx0XHRtaW53aWR0aDogMCwgLy/lrprkvY3orqHnrpfml7bvvIzlvoXlrprkvY3lsYJsYXllcueahOacgOWwj+WuveW6plxyXG4gICAgICAgICAgICBtaW5oZWlnaHQ6IDAsIC8v5a6a5L2N6K6h566X5pe277yM5b6F5a6a5L2N5bGCbGF5ZXLnmoTmnIDlsI/pq5jluqZcclxuICAgICAgICAgICAgY3VzdG9tcG9zOiBudWxsIC8v55So5oi36Ieq5a6a5LmJ5a6a5L2N5pa55rOV44CC5aaC5p6c5aOw5piO5q2k5pa55rOV77yM5YiZ5LiN5Lya5L2/55So57O757uf6buY6K6k55qE5pa55rOV6K6+572ucG9z55qE5a6a5L2N5Y+C5pWw77yM6ICM5piv5oqK5a6a5L2N5Y+C5pWwcG9z5Lyg6YCS57uZ5q2k5pa55rOVXHJcblx0XHR9LGNvbmZpZyB8fCB7fSk7XHJcbiAgICAgICAgdGhpcy5wb3NjYWwgPSAkLkNhbGxiYWNrcygpOyAvL3NldHBvc+WQjueahOWbnuiwg1xyXG5cclxuXHRcdHZhciB0aGF0ID0gdGhpcztcclxuXHRcdC8v5Yid5q2l5qOA5rWL5a6a5L2N5Y+C6ICD5a655ZmoXHJcblx0XHRkb21vcHQub2ZmY29uID0gZG9tb3B0LmxheWVyLm9mZnNldFBhcmVudCgpO1xyXG5cdFx0dmFyIHRhZ25hbWUgPSBkb21vcHQub2ZmY29uLmdldCgwKS50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XHJcblx0XHR2YXIgbGlzdGVuY2FsbCA9IHtcclxuICAgICAgICAgICAgY2FsbDogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIHRoYXQuc2V0cG9zKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciBpc2xpc3Njcm9sbCA9IGZhbHNlOyAvL+aYr+WQpuebkeWQrHNjcm9sbOS6i+S7tlxyXG4gICAgICAgIHZhciBpc2xpc3Jlc2l6ZSA9IGZhbHNlOyAvL+aYr+WQpuebkeWQrHJlc2l6ZeS6i+S7tlxyXG5cdFx0aWYodGFnbmFtZSA9PSAnYm9keScgfHwgdGFnbmFtZSA9PSAnaHRtbCcpeyAvL+ivtOaYjuebuOWvueS6jumhtemdouWumuS9jVxyXG5cdFx0ICAgIGRvbW9wdC5vZmZjb24gPSAkKCdib2R5Jyk7XHJcblx0XHRcdGRvbW9wdC5vZmZwYWdlID0gdHJ1ZTtcclxuXHRcdH1cclxuXHRcdGlmKGRvbW9wdC5vZmZwYWdlICYmIHBvc29wdC5maXhlZCl7IC8v5aaC5p6c5a6a5L2N5a655Zmo5piv5b2T5YmN6aG16Z2i44CB5Zu65a6a5a6a5L2N44CB5Y+v5L2/55SoZml4ZWTlrprkvY3jgILliJnnlKhmaXhlZOWumuS9jVxyXG5cdFx0XHRkb21vcHQucG9zaXRpb24gPSAnZml4ZWQnO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZXtcclxuXHRcdFx0ZG9tb3B0LnBvc2l0aW9uID0gJ2Fic29sdXRlJztcclxuXHRcdFx0aWYocG9zb3B0LmZpeGVkKSB7IC8v5aaC5p6c5Zu65a6a5a6a5L2N77yM5YiZ55uR5ZCsc2Nyb2xs5LqL5Lu2XHJcblx0XHRcdCAgICBpc2xpc3Njcm9sbCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBpZihkb21vcHQub2ZmcGFnZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgV2luc2Nyb2xsLmxpc3RlbihsaXN0ZW5jYWxsKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNjcm9sbCA9IG5ldyBTY3JvbGwoZG9tb3B0Lm9mZmNvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsLmxpc3RlbihsaXN0ZW5jYWxsKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Ly/or7TmmI5tb2Rl5pivY+aXtu+8jG9mZnNldFBhcmVudCByZXNpemXml7bvvIzlvoXlrprkvY3lsYLnmoTlpKflsI/kvJrmlLnlj5jvvIzliJnnm5HlkKxyZXNpemXkuovku7ZcclxuICAgICAgICBpZihwb3NvcHQubW9kZSA9PSAnYycgJiYgcG9zb3B0LnNpemVjaGFuZ2Upe1xyXG4gICAgICAgICAgICBpc2xpc3Jlc2l6ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIGlmKGRvbW9wdC5vZmZwYWdlKXtcclxuICAgICAgICAgICAgICAgIFdpbnJlc2l6ZS5saXN0ZW4obGlzdGVuY2FsbCk7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlc2l6ZSA9IG5ldyBSZXNpemUoZG9tb3B0Lm9mZmNvbik7XHJcbiAgICAgICAgICAgICAgICByZXNpemUubGlzdGVuKGxpc3RlbmNhbGwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cdFx0dGhpcy5kb21vcHQgPSBkb21vcHQ7IC8vZG9t5Y+C5pWwXHJcblx0XHR0aGlzLnBvc29wdCA9IHBvc29wdDsgLy/lrprkvY3lj4LmlbBcclxuXHRcdHRoaXMuZGVzdHJveSA9IGZ1bmN0aW9uKCl7IC8v57uE5Lu26ZSA5q+B5pa55rOVXHJcblx0XHRcdHRoaXMuZG9tb3B0ID0gbnVsbDtcclxuXHRcdFx0dGhpcy5wb3NvcHQgPSBudWxsO1xyXG5cdFx0XHRpZihpc2xpc3Njcm9sbCl7XHJcblx0XHRcdFx0aWYoZG9tb3B0Lm9mZnBhZ2Upe1xyXG5cdFx0XHRcdFx0V2luc2Nyb2xsLnVubGlzdGVuKGxpc3RlbmNhbGwpO1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0c2Nyb2xsLnVubGlzdGVuKGxpc3RlbmNhbGwpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRpZihpc2xpc3Jlc2l6ZSl7XHJcblx0XHRcdCAgICBpZihkb21vcHQub2ZmcGFnZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgV2lucmVzaXplLnVubGlzdGVuKGxpc3RlbmNhbGwpO1xyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzaXplLnVubGlzdGVuKGxpc3RlbmNhbGwpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiDov5vooYzlrprkvY1cclxuXHQgKiBAcmV0dXJuIHtCb29sZWFufSDmmK/lkKblrprkvY3miJDlip9cclxuXHQgKi9cclxuXHRzZXRwb3MoKXtcclxuXHRcdGlmKHRoaXMuZG9tb3B0LmxheWVyLmNzcygnZGlzcGxheScpID09ICdub25lJyB8fCB0aGlzLmRvbW9wdC5vZmZjb24uY3NzKCdkaXNwbGF5JykgPT0gJ25vbmUnKXtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZXtcclxuXHRcdFx0c2V0cG9zKHRoaXMuZG9tb3B0LHRoaXMucG9zb3B0KTtcclxuICAgICAgICAgICAgdGhpcy5wb3NjYWwuZmlyZSgpO1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUG9zaXRpb247XHJcbiIsIi8qKlxyXG4gKiBhbGVydOW8ueWxguaooeadv++8jOW/hemhu+WFt+acieaMh+WumueahG5vZGXlsZ7mgKdcclxuICovXHJcbmV4cG9ydHMuYWxlcnQgPSBbXHJcbiAgICAnPGRpdj7moIfpopg8L2Rpdj4nLFxyXG5cdCc8ZGl2IG5vZGU9XCJjb250ZW50XCI+5YaF5a655Yy6PC9kaXY+JyxcclxuXHQnPGRpdj48YSBocmVmPVwiamF2YXNjcmlwdDo7XCIgY2xhc3M9XCJqcy1va1wiPuehruWumjwvYT48L2Rpdj4nXHJcbl0uam9pbignJyk7XHJcbi8qKlxyXG4gKiBjb25maXJt5by55bGC5qih5p2/77yM5b+F6aG75YW35pyJ5oyH5a6a55qEbm9kZeWxnuaAp1xyXG4gKi9cclxuZXhwb3J0cy5jb25maXJtID0gW1xyXG4gICAgJzxkaXY+5qCH6aKYPC9kaXY+JyxcclxuXHQnPGRpdiBub2RlPVwiY29udGVudFwiPuWGheWuueWMujwvZGl2PicsXHJcblx0JzxkaXY+PGEgaHJlZj1cImphdmFzY3JpcHQ6O1wiIGNsYXNzPVwianMtb2tcIj7noa7lrpo8L2E+PGEgaHJlZj1cImphdmFzY3JpcHQ6O1wiIGNsYXNzPVwianMtY2FuY2VsXCI+5Y+W5raIPC9hPjwvZGl2PidcclxuXS5qb2luKCcnKVxyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyBjc3PmlK/mjIHmg4XlhrXliKTmlq3jgILkuLvopoHnlKjkuo7mtY/op4jlmajlhbzlrrlcclxuICogQHZlcnNpb24gMS4wIHwgMjAxNS0wOC0zMSDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAcmV0dXJuXHJcbiAqIEBleGFtcGxlXHJcbiAqIFx0IGNvbnN0IENzc3N1cG9ydCA9IHJlcXVpcmUoJ2xpYnV0aWwtY3Nzc3Vwb3J0Jyk7XHJcbiAqIFx0IENzc3N1cG9ydC5maXhlZDtcclxuICogKi9cclxudmFyIF9kaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxudmFyIHJlc3VsdCA9IHtcclxuXHQvL+aYr+WQpuaUr+aMgXBvc2l0aW9uOmZpeGVk5a6a5L2NXHJcblx0Zml4ZWQ6ICEoJ3VuZGVmaW5lZCcgPT0gdHlwZW9mKGRvY3VtZW50LmJvZHkuc3R5bGUubWF4SGVpZ2h0KSB8fCAoZG9jdW1lbnQuY29tcGF0TW9kZSAhPT0gXCJDU1MxQ29tcGF0XCIgJiYgL21zaWUvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpKSkpLFxyXG5cdC8v5piv5ZCm5pSv5oyBdHJhbnNpdGlvblxyXG5cdHRyYW5zaXRpb246ICEoX2Rpdi5zdHlsZS50cmFuc2l0aW9uID09IHVuZGVmaW5lZClcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gcmVzdWx0O1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyDlr7nkuo7pq5jpopHop6blj5HnmoTkuovku7bov5vooYzlu7bov5/lpITnkIbnsbvjgILlupTnlKjlnLrmma/vvJpzY3JvbGzlkoxyZXNpemVcclxuICogQHZlcnNpb24gMS4wLjAgfCAyMDE1LTA4LTI3IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm4g5aSE55CG57G7XHJcbiAqIEBleGFtcGxlXHJcbiAqICovXHJcblxyXG4gY29uc3QgUHVibGlzaGVyUyA9IHJlcXVpcmUoJy4vcHVibGlzaGVyUy5qcycpO1xyXG5cclxuIGNsYXNzIERlbGF5ZXZ0IGV4dGVuZHMgUHVibGlzaGVyU3tcclxuXHQgLyoqXHJcbiBcdCAqIOWvueS6jumrmOmikeinpuWPkeeahOS6i+S7tui/m+ihjOW7tui/n+WkhOeQhuOAguW6lOeUqOWcuuaZr++8mnNjcm9sbOWSjHJlc2l6ZVxyXG4gXHQgKiBAcGFyYW0ge0pTT059IGNvbmZpZyDphY3nva5cclxuIFx0ICovXHJcblx0IGNvbnN0cnVjdG9yKGNvbmZpZyl7XHJcblx0ICAgIHN1cGVyKCk7XHJcbiBcdFx0dGhpcy50aW1lciA9IG51bGw7XHJcbiBcdFx0JC5leHRlbmQodGhpcyx7XHJcbiBcdFx0XHRkZWxheXRpbWU6IDIwMCAvL+S6i+S7tuajgOa1i+W7tui/n+aXtumXtO+8jOavq+enklxyXG4gXHRcdH0sY29uZmlnIHx8IHt9KTtcclxuXHQgfVxyXG5cdCAvKipcclxuIFx0ICog5byA5aeL5qOA5rWLXHJcbiBcdCAqL1xyXG5cdCBzdGFydCgpe1xyXG5cdFx0IGlmKHRoaXMudGltZXIpe1xyXG4gICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZXIpO1xyXG4gICAgICAgICB9XHJcbiAgICAgICAgIHRoaXMudGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgXHR0aGlzLmRlbGl2ZXIoKTtcclxuICAgICAgICAgfSx0aGlzLmRlbGF5dGltZSk7XHJcblx0IH1cclxuIH1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRGVsYXlldnQ7XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IOagueaNruiuvuWkh+e7meWHuuebuOWFs+S4muWKoeS6i+S7tueahOS6i+S7tuWQjeensFxyXG4gKiBAdmVyc2lvbiAxLjAuMCB8IDIwMTUtMDktMTQg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQGV4YW1wbGVcclxuICogKi9cclxudmFyIHJlc3VsdCA9IHtcclxuXHQvL+a1j+iniOWZqOeql+WPo3Jlc2l6ZeS6i+S7tlxyXG5cdHdpbnJlc2l6ZTogKGZ1bmN0aW9uKCl7XHJcblx0ICAgIHJldHVybiAnb25vcmllbnRhdGlvbmNoYW5nZScgaW4gd2luZG93PyAnb3JpZW50YXRpb25jaGFuZ2UnOiAncmVzaXplJztcclxuXHR9KSgpLFxyXG5cdC8vaW5wdXTmiJZ0ZXh0YXJlYei+k+WFpeahhuWAvOaUueWPmOeahOebkeWQrOS6i+S7tlxyXG5cdGlucHV0OiAoZnVuY3Rpb24oKXtcclxuXHQgICAgaWYoL01TSUUgOS4wLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpKXsgLy9JZTnpgqPkuKrlnZHniLnnmoTvvIzmnKzmnaVpbnB1dOWSjHByb3BlcnR5Y2hhbmdl6YO95pSv5oyB77yM5L2G5piv5Yig6Zmk6ZSu5peg5rOV6Kem5Y+R6L+Z5Lik5Liq5LqL5Lu277yM5omA5Lul5b6X5re75Yqga2V5dXBcclxuXHQgICAgICAgIHJldHVybiAnaW5wdXQga2V5dXAnO1xyXG5cdCAgICB9XHJcblx0ICAgIHZhciBub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuXHQgICAgaWYoJ29uaW5wdXQnIGluIG5vZGUpe1xyXG5cdCAgICAgICAgcmV0dXJuICdpbnB1dCc7XHJcblx0ICAgIH1lbHNlIGlmKCdvbnByb3BlcnR5Y2hhbmdlJyBpbiBub2RlKXtcclxuXHQgICAgICAgIHJldHVybiAncHJvcGVydHljaGFuZ2UnO1xyXG5cdCAgICB9ZWxzZSB7XHJcblx0ICAgICAgICByZXR1cm4gJ2tleXVwJztcclxuXHQgICAgfVxyXG5cdH0pKClcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gcmVzdWx0O1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyDorqLpmIXogIXmqKHlvI/igJTigJTlj5HluIPogIXnsbvigJTigJTnsr7nroDniYhcclxuICog57K+566A54mI77ya6K6i6ZiF6ICF5LiN6ZmQ5a6a5b+F6aG75piv6K6i6ZiF6ICF57G7U3Vic2NyaWJlcueahOWvueixoVxyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE1LTA4LTMxIOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm4g5Y+R5biD6ICF57G7XHJcbiAqIEBleGFtcGxlXHJcbiAqICovXHJcbiBjb25zdCBUb29sID0gcmVxdWlyZSgnLi90b29sLmpzJyksXHJcblx0ICAgUndjb250cm9sbGVyID0gcmVxdWlyZSgnLi9yd2NvbnRyb2xsZXIuanMnKTtcclxuXHJcbmNsYXNzIFB1Ymxpc2hlclN7XHJcblx0Y29uc3RydWN0b3IoKXtcclxuXHRcdHRoaXMuc3Vic2NyaWJlcnMgPSBbXTsgLy/orrDlvZXorqLpmIXogIXlr7nosaFcclxuXHRcdHRoaXMucndjb250cm9sbGRlciA9IG5ldyBSd2NvbnRyb2xsZXIoKTtcclxuXHR9XHJcblx0LyoqXHJcblx0ICog5Y+C5pWw5pyJ5pWI5oCn6aqM6K+BXHJcblx0ICovXHJcblx0YXJnc1ZhbGlkYXRlKGRhdGEpe1xyXG5cdFx0aWYoVG9vbC5pc09iamVjdChkYXRhKSAmJiBUb29sLmlzRnVuY3Rpb24oZGF0YS5jYWxsKSl7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiDkv6Hmga/liIblj5HvvIzpgJrnn6XmiYDmnInorqLpmIXogIVcclxuXHQgKiBmaWx0ZXLmiafooYzov5Tlm550cnVl77yM5YiZ5omn6KGMY2FsbFxyXG5cdCAqL1xyXG5cdGRlbGl2ZXIoKXtcclxuXHRcdHRoaXMucndjb250cm9sbGRlci5yZWFkKGZ1bmN0aW9uKGRhdGEpe1xyXG5cdFx0XHQkLmVhY2godGhpcy5zdWJzY3JpYmVycyxmdW5jdGlvbihpbmRleCxpdGVtKXtcclxuXHRcdFx0XHRpZihpdGVtLmZpbHRlcigpID09IHRydWUpe1xyXG5cdFx0ICAgICAgICBcdGl0ZW0uY2FsbC5hcHBseSh3aW5kb3csZGF0YS5hcmdzKTtcclxuXHRcdCAgICAgIFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH0uYmluZCh0aGlzLHthcmdzOiBhcmd1bWVudHN9KSk7XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIOiuoumYhVxyXG4gXHQgKiBAcGFyYW0ge0pTT059ICpzdWJzY3JpYmVyIOiuoumYheiAheOAguagvOW8j+WQjHN1YnNjcmliZXJz6YeM55qE5Y2V54us5LiA6aG5XHJcbiBcdCAqIHtcclxuIFx0ICogXHRcdCpjYWxsOiBmdW5jdGlvbigpe30gLy/kv6Hmga/liIblj5HnmoTlm57osIPlh73mlbBcclxuIFx0ICogICAgICBmaWx0ZXI6IGZ1bmN0aW9uKCl7cmV0dXJuIHRydWU7fSAvL+i/h+a7pOadoeS7tlxyXG4gXHQgKiB9XHJcblx0ICovXHJcblx0c3Vic2NyaWJlKHN1YnNjcmliZXIpe1xyXG5cdFx0aWYodGhpcy5hcmdzVmFsaWRhdGUoc3Vic2NyaWJlcikpe1xyXG5cdFx0XHRpZighVG9vbC5pc0Z1bmN0aW9uKHN1YnNjcmliZXIuZmlsdGVyKSl7XHJcblx0XHQgICAgICAgIHN1YnNjcmliZXIuZmlsdGVyID0gZnVuY3Rpb24oKXtcclxuXHRcdCAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG5cdFx0ICAgICAgICB9O1xyXG5cdFx0ICAgIH1cclxuXHRcdFx0aWYoJC5pbkFycmF5KHN1YnNjcmliZXIsdGhpcy5zdWJzY3JpYmVycykgPCAwKXtcclxuXHRcdFx0XHR0aGlzLnJ3Y29udHJvbGxkZXIud3JpdGUoZnVuY3Rpb24oY3Vyc3ViKXtcclxuXHRcdFx0XHRcdHRoaXMuc3Vic2NyaWJlcnMucHVzaChjdXJzdWIpO1xyXG5cdFx0XHRcdH0uYmluZCh0aGlzLHN1YnNjcmliZXIpKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiDlj5bmtojorqLpmIVcclxuIFx0ICogQHBhcmFtIHtKU09OfSBzdWJzY3JpYmVyIOiuoumYheiAhVxyXG5cdCAqL1xyXG5cdHVuc3Vic2NyaWJlKHN1YnNjcmliZXIpe1xyXG5cdFx0aWYodGhpcy5hcmdzVmFsaWRhdGUoc3Vic2NyaWJlcikpe1xyXG5cdFx0XHR0aGlzLnJ3Y29udHJvbGxkZXIud3JpdGUoZnVuY3Rpb24oY3Vyc3ViKXtcclxuXHRcdFx0XHQkLmVhY2godGhpcy5zdWJzY3JpYmVycywoaW5kZXgsaXRlbSkgPT4ge1xyXG5cdFx0XHRcdFx0aWYoaXRlbSA9PSBjdXJzdWIpe1xyXG5cdFx0XHRcdFx0ICAgIHRoaXMuc3Vic2NyaWJlcnMuc3BsaWNlKGluZGV4LDEpO1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0uYmluZCh0aGlzLHN1YnNjcmliZXIpKTtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUHVibGlzaGVyUztcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXdcclxuICogICDnu5nmjIflrprlhYPntKDliJvlu7pyZXNpemXkuovku7bnm5HlkKznsbtcclxuICogQGF1dGhvciBtaW5ncnVpfCBtaW5ncnVpQHN0YWZmLnNpbmEuY29tLmNuXHJcbiAqIEB2ZXJzaW9uIDEuMCB8IDIwMTUtMDgtMjdcclxuICogQHJldHVybiByZXNpemXnsbtcclxuICogQGV4YW1wbGVcclxuICogIFx0Y29uc3QgUmVzaXplID0gcmVxdWlyZSgnbGlidXRpbC1yZXNpemUnKTtcclxuICogXHRcdHZhciByZXNpemUgPSBuZXcgUmVzaXplKCQod2luZG93KSk7XHJcbiAqIFx0XHRyZXNpemUubGlzdGVuKHtjYWxsOmZ1bmN0aW9uKCl7Y29uc29sZS5sb2coJ+eql+WPo3Jlc2l6ZScpO319KTtcclxuICovXHJcblxyXG5jb25zdCBEZWxheWV2dCA9IHJlcXVpcmUoJy4vZGVsYXlldnQuanMnKTtcclxuXHJcbmNsYXNzIFJlc2l6ZXtcclxuXHQvKipcclxuXHQgKiBAcGFyYW0ge0VsZW1lbnR9ICpub2RlIOWFg+e0oOiKgueCuVxyXG5cdCAqIEBwYXJhbSB7SlNPTn0gY29uZmlnIOW7tui/n+mFjee9ruOAguWQjGV2dC9kZWxheWV2dOexu+eahOWIneWni+WMluWPguaVsFxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKG5vZGUsY29uZmlnKXtcclxuXHRcdGlmKG5vZGUubGVuZ3RoID09IDApe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHR2YXIgb3B0ID0gJC5leHRlbmQoe1xyXG5cdFx0ICAgIGV2dG5hbWU6ICdyZXNpemUnXHJcblx0XHR9LGNvbmZpZyk7XHJcblx0XHR0aGlzLmRlbGF5ID0gbmV3IERlbGF5ZXZ0KG9wdCk7XHJcblx0XHRub2RlLm9uKG9wdC5ldnRuYW1lLCgpID0+IHtcclxuXHRcdFx0dGhpcy5kZWxheS5zdGFydCgpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIOa3u+WKoHNjcm9sbOS6i+S7tuebkeWQrFxyXG4gICAgICogQHBhcmFtIHtKU09OfSBvcHRcclxuICAgICAqIHtcclxuICAgICAqICAgY2FsbDogZnVuY3Rpb24vL+S6i+S7tuWPkeeUn+aXtuinpuWPkeeahOWbnuiwg1xyXG5cdCAqICAgZmlsdGVyOiBmdW5jdGlvbiAvL+i/h+a7pOadoeS7tuOAgmZpbHRlcui/lOWbnuS4unRydWXliJnmiY3op6blj5FjYWxs44CC5LiN5aGr5q2k6aG55YiZ6buY6K6k5LiN6L+H5rukXHJcblx0ICogfVxyXG4gICAgICovXHJcblx0bGlzdGVuKG9wdCl7XHJcblx0XHR0aGlzLmRlbGF5LnN1YnNjcmliZShvcHQpO1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiDnp7vpmaTnm5HlkKxcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHQg5ZKM6LCD55SobGlzdGVu5pe25LiA5qC355qE5Y+C5pWw5byV55SoXHJcblx0ICovXHJcblx0dW5saXN0ZW4ob3B0KXtcclxuXHRcdHRoaXMuZGVsYXkudW5zdWJzY3JpYmUob3B0KTtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUmVzaXplO1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyDor7vlhpnmjqfliLblmajigJTigJTlr7nkuo7or7vlhpnlvILmraXmk43kvZzov5vooYzmjqfliLZcclxuICogQHZlcnNpb24gMS4wIHwgMjAxNS0wOS0wNyDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAcmV0dXJuIOivu+WGmeaOp+WItuWZqOexu1xyXG4gKiBAZXhhbXBsZVxyXG4gKiAqL1xyXG4gY29uc3QgVG9vbCA9IHJlcXVpcmUoJy4vdG9vbC5qcycpO1xyXG5cclxuIGNsYXNzIFJ3Y29udHJvbGxlciB7XHJcblx0IGNvbnN0cnVjdG9yKCl7XHJcblx0XHQgdGhpcy5yZWFkbG9jayA9IGZhbHNlOyAvL+ivu+mUgVxyXG4gXHRcdHRoaXMud3JpdGVsb2NrID0gZmFsc2U7IC8v5YaZ6ZSBXHJcbiBcdFx0dGhpcy5xdWV1ZSA9IFtdOyAvL+ivu+WGmeaTjeS9nOe8k+WtmOmYn+WIl1xyXG5cdCB9XHJcblx0IC8qKlxyXG4gXHQgKiDojrflj5blvZPliY3mmK/lkKblj6/ku6XmiafooYzor7vmk43kvZxcclxuIFx0ICovXHJcblx0IHJlYWRlbmFibGUoKXtcclxuXHRcdGlmKHRoaXMud3JpdGVsb2NrKXtcclxuIFx0XHRcdHJldHVybiBmYWxzZTtcclxuIFx0XHR9XHJcbiBcdFx0cmV0dXJuIHRydWU7XHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOiOt+WPluW9k+WJjeaYr+WQpuWPr+S7peaJp+ihjOWGmeaTjeS9nFxyXG4gXHQgKi9cclxuXHQgd3JpdGVlbmFibGUoKXtcclxuXHRcdGlmKHRoaXMud3JpdGVsb2NrIHx8IHRoaXMucmVhZGxvY2spe1xyXG4gXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG4gXHRcdH1cclxuIFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHQgfVxyXG5cdCAvKipcclxuIFx0ICog5omn6KGM6K+75YaZ5pON5L2c6Zif5YiXXHJcbiBcdCAqL1xyXG4gXHQgZXhlY3F1ZXVlKCl7XHJcblx0XHQgd2hpbGUodGhpcy5xdWV1ZS5sZW5ndGggPiAwKXtcclxuIFx0XHRcdHZhciBvYmogPSB0aGlzLnF1ZXVlLnNoaWZ0KCk7XHJcbiBcdFx0XHRpZihvYmoudHlwZSA9PSAncmVhZCcpe1xyXG4gXHRcdFx0XHR0aGlzLl9leGVjcmVhZChvYmouZnVuKTtcclxuIFx0XHRcdH1lbHNlIGlmKG9iai50eXBlID09ICd3cml0ZScpe1xyXG4gXHRcdFx0XHR0aGlzLl9leGVjd3JpdGUob2JqLmZ1bik7XHJcbiBcdFx0XHR9XHJcbiBcdFx0fVxyXG5cdCB9XHJcblx0IC8qKlxyXG4gXHQgKiDnp4HmnInigJTigJTmiafooYzor7vmk43kvZxcclxuIFx0ICovXHJcblx0IF9leGVjcmVhZChmdW4pe1xyXG5cdFx0dGhpcy5yZWFkbG9jayA9IHRydWU7XHJcbiBcdFx0ZnVuKCk7XHJcbiBcdFx0dGhpcy5yZWFkbG9jayA9IGZhbHNlO1xyXG5cdCB9XHJcblx0IC8qKlxyXG4gXHQgKiDnp4HmnInigJTigJTmiafooYzlhpnmk43kvZxcclxuIFx0ICovXHJcblx0IF9leGVjd3JpdGUoZnVuKXtcclxuXHRcdHRoaXMud3JpdGVsb2NrID0gdHJ1ZTtcclxuIFx0XHRmdW4oKTtcclxuIFx0XHR0aGlzLndyaXRlbG9jayA9IGZhbHNlO1xyXG5cdCB9XHJcblx0IC8qKlxyXG4gXHQgKiDlvIDlp4vor7tcclxuICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSAqZnVuIOivu+aTjeS9nOWbnuiwg+WHveaVsFxyXG4gXHQgKi9cclxuXHQgcmVhZChmdW4pe1xyXG5cdFx0IGlmKFRvb2wuaXNGdW5jdGlvbihmdW4pKXtcclxuIFx0XHRcdGlmKHRoaXMucmVhZGVuYWJsZSgpKXtcclxuIFx0XHRcdFx0dGhpcy5fZXhlY3JlYWQoZnVuKTtcclxuIFx0XHRcdFx0dGhpcy5leGVjcXVldWUoKTtcclxuIFx0XHRcdH1lbHNle1xyXG4gXHRcdFx0XHR0aGlzLnF1ZXVlLnB1c2goe1xyXG4gXHRcdFx0XHRcdHR5cGU6ICdyZWFkJyxcclxuIFx0XHRcdFx0XHRmdW46IGZ1blxyXG4gXHRcdFx0XHR9KTtcclxuIFx0XHRcdH1cclxuIFx0XHR9XHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOW8gOWni+WGmVxyXG4gICAgICAqIEBwYXJhbSB7RnVuY3Rpb259ICpmdW4g5YaZ5pON5L2c5Zue6LCD5Ye95pWwXHJcbiBcdCAqL1xyXG5cdCB3cml0ZShmdW4pe1xyXG5cdFx0IGlmKFRvb2wuaXNGdW5jdGlvbihmdW4pKXtcclxuIFx0XHRcdGlmKHRoaXMud3JpdGVlbmFibGUoKSl7XHJcbiBcdFx0XHRcdHRoaXMuX2V4ZWN3cml0ZShmdW4pO1xyXG4gXHRcdFx0XHR0aGlzLmV4ZWNxdWV1ZSgpO1xyXG4gXHRcdFx0fWVsc2V7XHJcbiBcdFx0XHRcdHRoaXMucXVldWUucHVzaCh7XHJcbiBcdFx0XHRcdFx0dHlwZTogJ3dyaXRlJyxcclxuIFx0XHRcdFx0XHRmdW46IGZ1blxyXG4gXHRcdFx0XHR9KTtcclxuIFx0XHRcdH1cclxuIFx0XHR9XHJcblx0IH1cclxuIH1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUndjb250cm9sbGVyO1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlld1xyXG4gKiAgIOe7meaMh+WumuWFg+e0oOWIm+W7unNjcm9sbOS6i+S7tuebkeWQrOexu1xyXG4gKiBAYXV0aG9yIG1pbmdydWl8IG1pbmdydWlAc3RhZmYuc2luYS5jb20uY25cclxuICogQHZlcnNpb24gMS4wIHwgMjAxNS0wOC0yN1xyXG4gKiBAcmV0dXJuIHNjcm9sbOexu1xyXG4gKiBAZXhhbXBsZVxyXG4gKiBcdFx0Y29uc3QgU2Nyb2xsID0gcmVxdWlyZSgnbGlidXRpbC1zY3JvbGwnKTtcclxuICpcclxuICogXHRcdHZhciBzY3JvbGwgPSBuZXcgU2Nyb2xsKCQod2luZG93KSk7XHJcbiAqIFx0XHRzY3JvbGwubGlzdGVuKHtjYWxsOmZ1bmN0aW9uKCl7Y29uc29sZS5sb2coJ+eql+WPo3Njcm9sbCcpO319KTtcclxuICpcclxuICovXHJcblxyXG5jb25zdCBEZWxheWV2dCA9IHJlcXVpcmUoJy4vZGVsYXlldnQuanMnKTtcclxuXHJcbmNsYXNzIFNjcm9sbHtcclxuXHQvKipcclxuXHQgKiBAcGFyYW0ge0VsZW1lbnR9ICpub2RlIOWFg+e0oOiKgueCuVxyXG5cdCAqIEBwYXJhbSB7SlNPTn0gY29uZmlnIOW7tui/n+mFjee9ruOAguWQjGxpYmV2dC9kZWxheWV2dOexu+eahOWIneWni+WMluWPguaVsFxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKG5vZGUsY29uZmlnKXtcclxuXHRcdGlmKG5vZGUubGVuZ3RoID09IDApe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHR0aGlzLmRlbGF5ID0gbmV3IERlbGF5ZXZ0KGNvbmZpZyk7XHJcblx0XHRub2RlLm9uKCdzY3JvbGwnLCgpID0+IHtcclxuXHRcdFx0dGhpcy5kZWxheS5zdGFydCgpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIOa3u+WKoHNjcm9sbOS6i+S7tuebkeWQrFxyXG4gICAgICogQHBhcmFtIHtKU09OfSBvcHRcclxuICAgICAqIHtcclxuICAgICAqICAgY2FsbDogZnVuY3Rpb24vL+S6i+S7tuWPkeeUn+aXtuinpuWPkeeahOWbnuiwg1xyXG5cdCAqICAgZmlsdGVyOiBmdW5jdGlvbiAvL+i/h+a7pOadoeS7tuOAgmZpbHRlcui/lOWbnuS4unRydWXliJnmiY3op6blj5FjYWxs44CC5LiN5aGr5q2k6aG55YiZ6buY6K6k5LiN6L+H5rukXHJcblx0ICogfVxyXG4gICAgICovXHJcbiAgICBsaXN0ZW4ob3B0KXtcclxuXHRcdHRoaXMuZGVsYXkuc3Vic2NyaWJlKG9wdCk7XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIOenu+mZpOebkeWQrFxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdCDlkozosIPnlKhsaXN0ZW7ml7bkuIDmoLfnmoTlj4LmlbDlvJXnlKhcclxuXHQgKi9cclxuXHR1bmxpc3RlbihvcHQpe1xyXG5cdFx0dGhpcy5kZWxheS51bnN1YnNjcmliZShvcHQpO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTY3JvbGw7XHJcbiIsIi8qKlxyXG4gKiDluLjnlKjlsI/lt6XlhbdcclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiB2YXIgVG9vbCA9IHJlcXVpcmUoJ2xpYnV0aWwtdG9vbCcpO1xyXG4gKi9cclxuY29uc3QgVXJsID0gcmVxdWlyZSgndXJsJyk7XHJcblxyXG4vKipcclxuICogZGF0YeaYr+WQpuaYr+aXoOaViOWtl+auteOAguWNs+aYr251bGx8dW5kZWZpbmVkfCcnXHJcbiogQHBhcmFtIHtPYmplY3R9IGRhdGFcclxuICovXHJcbmV4cG9ydHMuaXNJbnZhbGlkID0gZnVuY3Rpb24oZGF0YSl7XHJcblx0aWYoZGF0YSA9PSBudWxsIHx8IGRhdGEgPT0gJycpe1xyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG5cdHJldHVybiBmYWxzZTtcclxufSxcclxuLyoqXHJcbiAqIOaYr+WQpuaYr09iamVjdOWvueixoeeahOWunuS+i++8jOmAmuW4uOeUqOadpeajgOa1i2RhdGHmmK/lkKbmmK/kuIDkuKrnuq/nmoRKU09O5a2X5q615oiWbmV3IE9iamVjdCgpXHJcbiogQHBhcmFtIHtPYmplY3R9IGRhdGFcclxuICovXHJcbmV4cG9ydHMuaXNPYmplY3QgPSBmdW5jdGlvbihkYXRhKXtcclxuXHRyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGRhdGEpID09ICdbb2JqZWN0IE9iamVjdF0nICYmIGRhdGEuY29uc3RydWN0b3IgPT0gT2JqZWN0O1xyXG59LFxyXG4vKipcclxuICog5pWw5o2u57G75Z6L5piv5ZCm5pivb2JqZWN044CC5LiN5LuF5LuF6ZmQ5LqO5piv57qv55qET2JqZWN05a6e5L6L5YyW55qE5a+56LGhXHJcbiAqL1xyXG5leHBvcnRzLmlzT2JqZWN0VHlwZSA9IGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChkYXRhKSA9PSAnW29iamVjdCBPYmplY3RdJztcclxufSxcclxuLyoqXHJcbiAqIOaYr+WQpuaYr2Z1bmN0aW9uXHJcbiogQHBhcmFtIHtPYmplY3R9IGRhdGFcclxuICovXHJcbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKGRhdGEpe1xyXG5cdHJldHVybiB0eXBlb2YgZGF0YSA9PSAnZnVuY3Rpb24nO1xyXG59LFxyXG4vKipcclxuICog5piv5ZCm5pivQXJyYXlcclxuKiBAcGFyYW0ge09iamVjdH0gZGF0YVxyXG4gKi9cclxuZXhwb3J0cy5pc0FycmF5ID0gZnVuY3Rpb24oZGF0YSl7XHJcblx0cmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChkYXRhKSA9PSAnW29iamVjdCBBcnJheV0nO1xyXG59LFxyXG4vKipcclxuICog5piv5ZCm5pivYm9vbGVhblxyXG4qIEBwYXJhbSB7T2JqZWN0fSBkYXRhXHJcbiAqL1xyXG5leHBvcnRzLmlzQm9vbGVhbiA9IGZ1bmN0aW9uKGRhdGEpe1xyXG5cdHJldHVybiB0eXBlb2YgZGF0YSA9PSAnYm9vbGVhbic7XHJcbn0sXHJcbi8qKlxyXG4gKiDmmK/lkKbmmK9TdHJpbmdcclxuKiBAcGFyYW0ge09iamVjdH0gZGF0YVxyXG4gKi9cclxuZXhwb3J0cy5pc1N0cmluZyA9IGZ1bmN0aW9uKGRhdGEpe1xyXG5cdHJldHVybiB0eXBlb2YgZGF0YSA9PSAnc3RyaW5nJztcclxufSxcclxuLyoqXHJcbiAqIOaYr+WQpuaYr051bWJlclxyXG4qIEBwYXJhbSB7T2JqZWN0fSBkYXRhXHJcbiAqL1xyXG5leHBvcnRzLmlzTnVtYmVyID0gZnVuY3Rpb24oZGF0YSl7XHJcblx0cmV0dXJuIHR5cGVvZiBkYXRhID09ICdudW1iZXInO1xyXG59LFxyXG4vKipcclxuICog5piv5ZCm5piv5LiA5Liq5pyJ5pWI55qEanF1ZXJ5IGRvbeWvueixoVxyXG4gKiBAcGFyYW0ge09iamVjdH0gbm9kZVxyXG4gKi9cclxuZXhwb3J0cy5pc1ZhbGlkSnF1ZXJ5RG9tID0gZnVuY3Rpb24obm9kZSl7XHJcblx0cmV0dXJuIG5vZGUgIT0gbnVsbCAmJiB0aGlzLmlzRnVuY3Rpb24obm9kZS5zaXplKSAmJiBub2RlLmxlbmd0aCA+IDA7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDop6PmnpB1cmxcclxuICogQHBhcmFtIHtTdHJpbmd9IHVybCB1cmzlnLDlnYDvvIzkuI3loavliJnlj5Zsb2NhdGlvbi5ocmVmXHJcbiAqIEByZXR1cm4ge09iamVjdH0gdXJsT2JqZWN0IGh0dHBzOi8vbm9kZWpzLm9yZy9kaXN0L2xhdGVzdC12Ni54L2RvY3MvYXBpL3VybC5odG1sI3VybF91cmxfc3RyaW5nc19hbmRfdXJsX29iamVjdHNcclxuICogIHF1ZXJ5OiDlpoLmnpzmsqHmnIlxdWVyee+8jOWImeaYr3t9XHJcbiAqL1xyXG5leHBvcnRzLnVybHBhcnNlID0gZnVuY3Rpb24odXJsKXtcclxuXHR1cmwgPSB1cmwgfHwgbG9jYXRpb24uaHJlZjtcclxuXHJcblx0cmV0dXJuIFVybC5wYXJzZSh1cmwsdHJ1ZSk7XHJcbn1cclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXdcclxuICogICDnm5HlkKx3aW5kb3cgcmVzaXpl44CC5Y+q5pSv5oyBUENcclxuICogQGF1dGhvciBtaW5ncnVpfCBtaW5ncnVpQHN0YWZmLnNpbmEuY29tLmNuXHJcbiAqIEB2ZXJzaW9uIDEuMCB8IDIwMTUtMDgtMjdcclxuICogQGV4YW1wbGVcclxuICogXHRcdGNvbnN0IFdpbnJlc2l6ZSA9IHJlcXVpcmUoJ2xpYnV0aWwtd2lucmVzaXplJyk7XHJcbiAqXHJcbiAqIFx0XHRXaW5yZXNpemUubGlzdGVuKHtjYWxsOmZ1bmN0aW9uKCl7Y29uc29sZS5sb2coJ+eql+WPo3Jlc2l6ZScpO319KTtcclxuICovXHJcbmNvbnN0IFJlc2l6ZSA9IHJlcXVpcmUoJy4vcmVzaXplLmpzJyksXHJcblx0XHREZXZpY2VldnRuYW1lID0gcmVxdWlyZSgnLi9kZXZpY2VldnRuYW1lLmpzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBSZXNpemUoJCh3aW5kb3cpLHtcclxuXHRldnRuYW1lOiBEZXZpY2VldnRuYW1lKycubGliJ1xyXG59KTtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXdcclxuICogICDnqpflj6Pmu5rliqjkuovku7bnm5HlkKxcclxuICogQGF1dGhvciBtaW5ncnVpfCBtaW5ncnVpQHN0YWZmLnNpbmEuY29tLmNuXHJcbiAqIEB2ZXJzaW9uIDEuMCB8IDIwMTUtMDgtMjdcclxuICogQHJldHVybiDmu5rliqjnm5HlkKzlr7nosaFcclxuICogQGV4YW1wbGVcclxuICogXHRcdGNvbnN0IFdpbnNjcm9sbCA9IHJlcXVpcmUoJ2xpYnV0aWwtd2luc2Nyb2xsJyk7XHJcbiAqXHJcbiAqIFx0XHRXaW5zY3JvbGwubGlzdGVuKHtjYWxsOmZ1bmN0aW9uKCl7Y29uc29sZS5sb2coJ+eql+WPo3Njcm9sbCcpO319KTtcclxuICovXHJcblxyXG5jb25zdCBTY3JvbGwgPSByZXF1aXJlKCcuL3Njcm9sbC5qcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBuZXcgU2Nyb2xsKCQod2luZG93KSk7XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IOe6v+eoi+axoOaOp+WItuWZqFxyXG4gKiAgICAgIOi0n+i0o+i/lOWbnuW9k+WJjeepuumXsueahOe6v+eoi+WvueixoVxyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE3LTAxLTE5IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm5cclxuICogQGV4YW1wbGVcclxuICogICAgICBjb25zdCBXb3JrZXJDb250cm9sID0gcmVxdWlyZSgnbGlidXRpbC13b3JrZXJDb250cm9sJyk7XHJcbiAqICovXHJcblxyXG4gY2xhc3MgV29ya2Vye1xyXG4gICAgIC8qKlxyXG4gICAgICAqIOS4gOS4que6v+eoi1xyXG4gICAgICAqL1xyXG4gICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgIHRoaXMubG9jayA9IHRydWU7XHJcbiAgICAgfVxyXG4gfVxyXG5cclxuIGNsYXNzIFdvcmtlckNvbnRyb2wge1xyXG4gICAgIC8qKlxyXG4gICAgICAqIOe6v+eoi+axoOaOp+WItuWZqOexu1xyXG4gICAgICAqIEByZXR1cm4ge1t0eXBlXX0gW2Rlc2NyaXB0aW9uXVxyXG4gICAgICAqL1xyXG4gICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgIHRoaXMuX3dvcmtlcm9ianMgPSBbXTsgLy93b3JrZXJDb250cm9s5a+56LGhXHJcbiAgICAgfVxyXG4gICAgIC8qKlxyXG4gICAgICAqIOi/lOWbnuW9k+WJjeepuumXsueahHdvcmtlckNvbnRyb2zlr7nosaFcclxuICAgICAgKiBAcmV0dXJuIHtbdHlwZV19IFtkZXNjcmlwdGlvbl1cclxuICAgICAgKi9cclxuICAgICBnZXQoKXtcclxuICAgICAgICAgdmFyIGN1cndvcmtlciA9IG51bGw7XHJcbiAgICAgICAgIGZvcih2YXIgaSA9IDAsIGxlbiA9IHRoaXMuX3dvcmtlcm9ianMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xyXG4gICAgICAgICAgICAgaWYodGhpcy5fd29ya2Vyb2Jqc1tpXS5sb2NrID09IGZhbHNlKXsgLy/ml6Lml6Dor7fmsYLlj4jmsqHmnInooqvplIHlrppcclxuICAgICAgICAgICAgICAgICB0aGlzLl93b3JrZXJvYmpzW2ldLmxvY2sgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgIGN1cndvcmtlciA9IHRoaXMuX3dvcmtlcm9ianNbaV07XHJcbiAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICB9XHJcbiAgICAgICAgIH1cclxuICAgICAgICAgaWYoY3Vyd29ya2VyID09IG51bGwpe1xyXG4gICAgICAgICAgICAgY3Vyd29ya2VyID0gbmV3IFdvcmtlcigpO1xyXG4gICAgICAgICAgICAgdGhpcy5fd29ya2Vyb2Jqcy5wdXNoKGN1cndvcmtlcik7XHJcbiAgICAgICAgIH1cclxuICAgICAgICAgcmV0dXJuIGN1cndvcmtlcjtcclxuICAgICB9XHJcbiAgICAgLyoqXHJcbiAgICAgICog6YCa55+l5b2T5YmNd29ya2VyQ29udHJvbOWvueixoeW3sue7j+S9v+eUqOWujOavlVxyXG4gICAgICAqIEBwYXJhbSB7aW5zdGFuY2Ugb2Ygd29ya2VyQ29udHJvbH0gd29ya2VyIOWmguaenOaPkOS+m+S6hndvcmtlcu+8jOWImee7k+adn+atpOe6v+eoi++8m+WmguaenOayoeaPkOS+m++8jOWImee7k+adn+esrOS4gOS4quato+WcqOS9v+eUqOeahOe6v+eoi1xyXG4gICAgICAqIEByZXR1cm4ge2luc3RhbmNlIG9mIHdvcmtlckNvbnRyb2wgfCBudWxsfSDlvZPliY3nu5PmnZ/nmoTnur/nqIvlr7nosaEu5rKh5pyJ5YiZ5Li6bnVsbFxyXG4gICAgICAqL1xyXG4gICAgIGVuZCh3b3JrZXIpe1xyXG4gICAgICAgICB2YXIgY3Vyd29ya2VyID0gbnVsbDtcclxuICAgICAgICAgZm9yKHZhciBpID0gMCwgbGVuID0gdGhpcy5fd29ya2Vyb2Jqcy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XHJcbiAgICAgICAgICAgICBpZih3b3JrZXIpe1xyXG4gICAgICAgICAgICAgICAgIGlmKHRoaXMuX3dvcmtlcm9ianNbaV0gPT0gd29ya2VyKXsgLy/ml6Lml6Dor7fmsYLlj4jmsqHmnInooqvplIHlrppcclxuICAgICAgICAgICAgICAgICAgICAgdGhpcy5fd29ya2Vyb2Jqc1tpXS5sb2NrID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgIGN1cndvcmtlciA9IHRoaXMuX3dvcmtlcm9ianNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgIGlmKHRoaXMuX3dvcmtlcm9ianNbaV0ubG9jayA9PSB0cnVlKXtcclxuICAgICAgICAgICAgICAgICAgICAgdGhpcy5fd29ya2Vyb2Jqc1tpXS5sb2NrID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgIGN1cndvcmtlciA9IHRoaXMuX3dvcmtlcm9ianNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgIH1cclxuICAgICAgICAgfVxyXG4gICAgICAgICByZXR1cm4gY3Vyd29ya2VyO1xyXG4gICAgIH1cclxuICAgICAvKipcclxuICAgICAgKiDmmK/lkKbmiYDmnInnmoTnur/nqIvpg73ooqvkvb/nlKjlrozmr5VcclxuICAgICAgKiBAcmV0dXJuIHtCb29sZWFufSB0cnVl77ya5omA5pyJ57q/56iL6YO956m66ZeyXHJcbiAgICAgICovXHJcbiAgICAgaXNlbmQoKXtcclxuICAgICAgICAgdmFyIHJlc3VsdCA9IHRydWU7XHJcbiAgICAgICAgIGZvcih2YXIgaSA9IDAsIGxlbiA9IHRoaXMuX3dvcmtlcm9ianMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xyXG4gICAgICAgICAgICAgaWYodGhpcy5fd29ya2Vyb2Jqc1tpXS5sb2NrID09IHRydWUpeyAvL+aXouaXoOivt+axguWPiOayoeacieiiq+mUgeWumlxyXG4gICAgICAgICAgICAgICAgIHJlc3VsdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgfVxyXG4gICAgICAgICB9XHJcbiAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgfVxyXG4gfVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBXb3JrZXJDb250cm9sO1xyXG4iLCIvKiEgaHR0cHM6Ly9tdGhzLmJlL3B1bnljb2RlIHYxLjQuMSBieSBAbWF0aGlhcyAqL1xuOyhmdW5jdGlvbihyb290KSB7XG5cblx0LyoqIERldGVjdCBmcmVlIHZhcmlhYmxlcyAqL1xuXHR2YXIgZnJlZUV4cG9ydHMgPSB0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JyAmJiBleHBvcnRzICYmXG5cdFx0IWV4cG9ydHMubm9kZVR5cGUgJiYgZXhwb3J0cztcblx0dmFyIGZyZWVNb2R1bGUgPSB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJlxuXHRcdCFtb2R1bGUubm9kZVR5cGUgJiYgbW9kdWxlO1xuXHR2YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsO1xuXHRpZiAoXG5cdFx0ZnJlZUdsb2JhbC5nbG9iYWwgPT09IGZyZWVHbG9iYWwgfHxcblx0XHRmcmVlR2xvYmFsLndpbmRvdyA9PT0gZnJlZUdsb2JhbCB8fFxuXHRcdGZyZWVHbG9iYWwuc2VsZiA9PT0gZnJlZUdsb2JhbFxuXHQpIHtcblx0XHRyb290ID0gZnJlZUdsb2JhbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYHB1bnljb2RlYCBvYmplY3QuXG5cdCAqIEBuYW1lIHB1bnljb2RlXG5cdCAqIEB0eXBlIE9iamVjdFxuXHQgKi9cblx0dmFyIHB1bnljb2RlLFxuXG5cdC8qKiBIaWdoZXN0IHBvc2l0aXZlIHNpZ25lZCAzMi1iaXQgZmxvYXQgdmFsdWUgKi9cblx0bWF4SW50ID0gMjE0NzQ4MzY0NywgLy8gYWthLiAweDdGRkZGRkZGIG9yIDJeMzEtMVxuXG5cdC8qKiBCb290c3RyaW5nIHBhcmFtZXRlcnMgKi9cblx0YmFzZSA9IDM2LFxuXHR0TWluID0gMSxcblx0dE1heCA9IDI2LFxuXHRza2V3ID0gMzgsXG5cdGRhbXAgPSA3MDAsXG5cdGluaXRpYWxCaWFzID0gNzIsXG5cdGluaXRpYWxOID0gMTI4LCAvLyAweDgwXG5cdGRlbGltaXRlciA9ICctJywgLy8gJ1xceDJEJ1xuXG5cdC8qKiBSZWd1bGFyIGV4cHJlc3Npb25zICovXG5cdHJlZ2V4UHVueWNvZGUgPSAvXnhuLS0vLFxuXHRyZWdleE5vbkFTQ0lJID0gL1teXFx4MjAtXFx4N0VdLywgLy8gdW5wcmludGFibGUgQVNDSUkgY2hhcnMgKyBub24tQVNDSUkgY2hhcnNcblx0cmVnZXhTZXBhcmF0b3JzID0gL1tcXHgyRVxcdTMwMDJcXHVGRjBFXFx1RkY2MV0vZywgLy8gUkZDIDM0OTAgc2VwYXJhdG9yc1xuXG5cdC8qKiBFcnJvciBtZXNzYWdlcyAqL1xuXHRlcnJvcnMgPSB7XG5cdFx0J292ZXJmbG93JzogJ092ZXJmbG93OiBpbnB1dCBuZWVkcyB3aWRlciBpbnRlZ2VycyB0byBwcm9jZXNzJyxcblx0XHQnbm90LWJhc2ljJzogJ0lsbGVnYWwgaW5wdXQgPj0gMHg4MCAobm90IGEgYmFzaWMgY29kZSBwb2ludCknLFxuXHRcdCdpbnZhbGlkLWlucHV0JzogJ0ludmFsaWQgaW5wdXQnXG5cdH0sXG5cblx0LyoqIENvbnZlbmllbmNlIHNob3J0Y3V0cyAqL1xuXHRiYXNlTWludXNUTWluID0gYmFzZSAtIHRNaW4sXG5cdGZsb29yID0gTWF0aC5mbG9vcixcblx0c3RyaW5nRnJvbUNoYXJDb2RlID0gU3RyaW5nLmZyb21DaGFyQ29kZSxcblxuXHQvKiogVGVtcG9yYXJ5IHZhcmlhYmxlICovXG5cdGtleTtcblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHQvKipcblx0ICogQSBnZW5lcmljIGVycm9yIHV0aWxpdHkgZnVuY3Rpb24uXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlIFRoZSBlcnJvciB0eXBlLlxuXHQgKiBAcmV0dXJucyB7RXJyb3J9IFRocm93cyBhIGBSYW5nZUVycm9yYCB3aXRoIHRoZSBhcHBsaWNhYmxlIGVycm9yIG1lc3NhZ2UuXG5cdCAqL1xuXHRmdW5jdGlvbiBlcnJvcih0eXBlKSB7XG5cdFx0dGhyb3cgbmV3IFJhbmdlRXJyb3IoZXJyb3JzW3R5cGVdKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBIGdlbmVyaWMgYEFycmF5I21hcGAgdXRpbGl0eSBmdW5jdGlvbi5cblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRoYXQgZ2V0cyBjYWxsZWQgZm9yIGV2ZXJ5IGFycmF5XG5cdCAqIGl0ZW0uXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gQSBuZXcgYXJyYXkgb2YgdmFsdWVzIHJldHVybmVkIGJ5IHRoZSBjYWxsYmFjayBmdW5jdGlvbi5cblx0ICovXG5cdGZ1bmN0aW9uIG1hcChhcnJheSwgZm4pIHtcblx0XHR2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuXHRcdHZhciByZXN1bHQgPSBbXTtcblx0XHR3aGlsZSAobGVuZ3RoLS0pIHtcblx0XHRcdHJlc3VsdFtsZW5ndGhdID0gZm4oYXJyYXlbbGVuZ3RoXSk7XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHQvKipcblx0ICogQSBzaW1wbGUgYEFycmF5I21hcGAtbGlrZSB3cmFwcGVyIHRvIHdvcmsgd2l0aCBkb21haW4gbmFtZSBzdHJpbmdzIG9yIGVtYWlsXG5cdCAqIGFkZHJlc3Nlcy5cblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGRvbWFpbiBUaGUgZG9tYWluIG5hbWUgb3IgZW1haWwgYWRkcmVzcy5cblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRoYXQgZ2V0cyBjYWxsZWQgZm9yIGV2ZXJ5XG5cdCAqIGNoYXJhY3Rlci5cblx0ICogQHJldHVybnMge0FycmF5fSBBIG5ldyBzdHJpbmcgb2YgY2hhcmFjdGVycyByZXR1cm5lZCBieSB0aGUgY2FsbGJhY2tcblx0ICogZnVuY3Rpb24uXG5cdCAqL1xuXHRmdW5jdGlvbiBtYXBEb21haW4oc3RyaW5nLCBmbikge1xuXHRcdHZhciBwYXJ0cyA9IHN0cmluZy5zcGxpdCgnQCcpO1xuXHRcdHZhciByZXN1bHQgPSAnJztcblx0XHRpZiAocGFydHMubGVuZ3RoID4gMSkge1xuXHRcdFx0Ly8gSW4gZW1haWwgYWRkcmVzc2VzLCBvbmx5IHRoZSBkb21haW4gbmFtZSBzaG91bGQgYmUgcHVueWNvZGVkLiBMZWF2ZVxuXHRcdFx0Ly8gdGhlIGxvY2FsIHBhcnQgKGkuZS4gZXZlcnl0aGluZyB1cCB0byBgQGApIGludGFjdC5cblx0XHRcdHJlc3VsdCA9IHBhcnRzWzBdICsgJ0AnO1xuXHRcdFx0c3RyaW5nID0gcGFydHNbMV07XG5cdFx0fVxuXHRcdC8vIEF2b2lkIGBzcGxpdChyZWdleClgIGZvciBJRTggY29tcGF0aWJpbGl0eS4gU2VlICMxNy5cblx0XHRzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShyZWdleFNlcGFyYXRvcnMsICdcXHgyRScpO1xuXHRcdHZhciBsYWJlbHMgPSBzdHJpbmcuc3BsaXQoJy4nKTtcblx0XHR2YXIgZW5jb2RlZCA9IG1hcChsYWJlbHMsIGZuKS5qb2luKCcuJyk7XG5cdFx0cmV0dXJuIHJlc3VsdCArIGVuY29kZWQ7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhbiBhcnJheSBjb250YWluaW5nIHRoZSBudW1lcmljIGNvZGUgcG9pbnRzIG9mIGVhY2ggVW5pY29kZVxuXHQgKiBjaGFyYWN0ZXIgaW4gdGhlIHN0cmluZy4gV2hpbGUgSmF2YVNjcmlwdCB1c2VzIFVDUy0yIGludGVybmFsbHksXG5cdCAqIHRoaXMgZnVuY3Rpb24gd2lsbCBjb252ZXJ0IGEgcGFpciBvZiBzdXJyb2dhdGUgaGFsdmVzIChlYWNoIG9mIHdoaWNoXG5cdCAqIFVDUy0yIGV4cG9zZXMgYXMgc2VwYXJhdGUgY2hhcmFjdGVycykgaW50byBhIHNpbmdsZSBjb2RlIHBvaW50LFxuXHQgKiBtYXRjaGluZyBVVEYtMTYuXG5cdCAqIEBzZWUgYHB1bnljb2RlLnVjczIuZW5jb2RlYFxuXHQgKiBAc2VlIDxodHRwczovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvamF2YXNjcmlwdC1lbmNvZGluZz5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlLnVjczJcblx0ICogQG5hbWUgZGVjb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBzdHJpbmcgVGhlIFVuaWNvZGUgaW5wdXQgc3RyaW5nIChVQ1MtMikuXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gVGhlIG5ldyBhcnJheSBvZiBjb2RlIHBvaW50cy5cblx0ICovXG5cdGZ1bmN0aW9uIHVjczJkZWNvZGUoc3RyaW5nKSB7XG5cdFx0dmFyIG91dHB1dCA9IFtdLFxuXHRcdCAgICBjb3VudGVyID0gMCxcblx0XHQgICAgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aCxcblx0XHQgICAgdmFsdWUsXG5cdFx0ICAgIGV4dHJhO1xuXHRcdHdoaWxlIChjb3VudGVyIDwgbGVuZ3RoKSB7XG5cdFx0XHR2YWx1ZSA9IHN0cmluZy5jaGFyQ29kZUF0KGNvdW50ZXIrKyk7XG5cdFx0XHRpZiAodmFsdWUgPj0gMHhEODAwICYmIHZhbHVlIDw9IDB4REJGRiAmJiBjb3VudGVyIDwgbGVuZ3RoKSB7XG5cdFx0XHRcdC8vIGhpZ2ggc3Vycm9nYXRlLCBhbmQgdGhlcmUgaXMgYSBuZXh0IGNoYXJhY3RlclxuXHRcdFx0XHRleHRyYSA9IHN0cmluZy5jaGFyQ29kZUF0KGNvdW50ZXIrKyk7XG5cdFx0XHRcdGlmICgoZXh0cmEgJiAweEZDMDApID09IDB4REMwMCkgeyAvLyBsb3cgc3Vycm9nYXRlXG5cdFx0XHRcdFx0b3V0cHV0LnB1c2goKCh2YWx1ZSAmIDB4M0ZGKSA8PCAxMCkgKyAoZXh0cmEgJiAweDNGRikgKyAweDEwMDAwKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyB1bm1hdGNoZWQgc3Vycm9nYXRlOyBvbmx5IGFwcGVuZCB0aGlzIGNvZGUgdW5pdCwgaW4gY2FzZSB0aGUgbmV4dFxuXHRcdFx0XHRcdC8vIGNvZGUgdW5pdCBpcyB0aGUgaGlnaCBzdXJyb2dhdGUgb2YgYSBzdXJyb2dhdGUgcGFpclxuXHRcdFx0XHRcdG91dHB1dC5wdXNoKHZhbHVlKTtcblx0XHRcdFx0XHRjb3VudGVyLS07XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG91dHB1dC5wdXNoKHZhbHVlKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG91dHB1dDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgc3RyaW5nIGJhc2VkIG9uIGFuIGFycmF5IG9mIG51bWVyaWMgY29kZSBwb2ludHMuXG5cdCAqIEBzZWUgYHB1bnljb2RlLnVjczIuZGVjb2RlYFxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGUudWNzMlxuXHQgKiBAbmFtZSBlbmNvZGVcblx0ICogQHBhcmFtIHtBcnJheX0gY29kZVBvaW50cyBUaGUgYXJyYXkgb2YgbnVtZXJpYyBjb2RlIHBvaW50cy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIG5ldyBVbmljb2RlIHN0cmluZyAoVUNTLTIpLlxuXHQgKi9cblx0ZnVuY3Rpb24gdWNzMmVuY29kZShhcnJheSkge1xuXHRcdHJldHVybiBtYXAoYXJyYXksIGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHR2YXIgb3V0cHV0ID0gJyc7XG5cdFx0XHRpZiAodmFsdWUgPiAweEZGRkYpIHtcblx0XHRcdFx0dmFsdWUgLT0gMHgxMDAwMDtcblx0XHRcdFx0b3V0cHV0ICs9IHN0cmluZ0Zyb21DaGFyQ29kZSh2YWx1ZSA+Pj4gMTAgJiAweDNGRiB8IDB4RDgwMCk7XG5cdFx0XHRcdHZhbHVlID0gMHhEQzAwIHwgdmFsdWUgJiAweDNGRjtcblx0XHRcdH1cblx0XHRcdG91dHB1dCArPSBzdHJpbmdGcm9tQ2hhckNvZGUodmFsdWUpO1xuXHRcdFx0cmV0dXJuIG91dHB1dDtcblx0XHR9KS5qb2luKCcnKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIGJhc2ljIGNvZGUgcG9pbnQgaW50byBhIGRpZ2l0L2ludGVnZXIuXG5cdCAqIEBzZWUgYGRpZ2l0VG9CYXNpYygpYFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge051bWJlcn0gY29kZVBvaW50IFRoZSBiYXNpYyBudW1lcmljIGNvZGUgcG9pbnQgdmFsdWUuXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBudW1lcmljIHZhbHVlIG9mIGEgYmFzaWMgY29kZSBwb2ludCAoZm9yIHVzZSBpblxuXHQgKiByZXByZXNlbnRpbmcgaW50ZWdlcnMpIGluIHRoZSByYW5nZSBgMGAgdG8gYGJhc2UgLSAxYCwgb3IgYGJhc2VgIGlmXG5cdCAqIHRoZSBjb2RlIHBvaW50IGRvZXMgbm90IHJlcHJlc2VudCBhIHZhbHVlLlxuXHQgKi9cblx0ZnVuY3Rpb24gYmFzaWNUb0RpZ2l0KGNvZGVQb2ludCkge1xuXHRcdGlmIChjb2RlUG9pbnQgLSA0OCA8IDEwKSB7XG5cdFx0XHRyZXR1cm4gY29kZVBvaW50IC0gMjI7XG5cdFx0fVxuXHRcdGlmIChjb2RlUG9pbnQgLSA2NSA8IDI2KSB7XG5cdFx0XHRyZXR1cm4gY29kZVBvaW50IC0gNjU7XG5cdFx0fVxuXHRcdGlmIChjb2RlUG9pbnQgLSA5NyA8IDI2KSB7XG5cdFx0XHRyZXR1cm4gY29kZVBvaW50IC0gOTc7XG5cdFx0fVxuXHRcdHJldHVybiBiYXNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgZGlnaXQvaW50ZWdlciBpbnRvIGEgYmFzaWMgY29kZSBwb2ludC5cblx0ICogQHNlZSBgYmFzaWNUb0RpZ2l0KClgXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBkaWdpdCBUaGUgbnVtZXJpYyB2YWx1ZSBvZiBhIGJhc2ljIGNvZGUgcG9pbnQuXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBiYXNpYyBjb2RlIHBvaW50IHdob3NlIHZhbHVlICh3aGVuIHVzZWQgZm9yXG5cdCAqIHJlcHJlc2VudGluZyBpbnRlZ2VycykgaXMgYGRpZ2l0YCwgd2hpY2ggbmVlZHMgdG8gYmUgaW4gdGhlIHJhbmdlXG5cdCAqIGAwYCB0byBgYmFzZSAtIDFgLiBJZiBgZmxhZ2AgaXMgbm9uLXplcm8sIHRoZSB1cHBlcmNhc2UgZm9ybSBpc1xuXHQgKiB1c2VkOyBlbHNlLCB0aGUgbG93ZXJjYXNlIGZvcm0gaXMgdXNlZC4gVGhlIGJlaGF2aW9yIGlzIHVuZGVmaW5lZFxuXHQgKiBpZiBgZmxhZ2AgaXMgbm9uLXplcm8gYW5kIGBkaWdpdGAgaGFzIG5vIHVwcGVyY2FzZSBmb3JtLlxuXHQgKi9cblx0ZnVuY3Rpb24gZGlnaXRUb0Jhc2ljKGRpZ2l0LCBmbGFnKSB7XG5cdFx0Ly8gIDAuLjI1IG1hcCB0byBBU0NJSSBhLi56IG9yIEEuLlpcblx0XHQvLyAyNi4uMzUgbWFwIHRvIEFTQ0lJIDAuLjlcblx0XHRyZXR1cm4gZGlnaXQgKyAyMiArIDc1ICogKGRpZ2l0IDwgMjYpIC0gKChmbGFnICE9IDApIDw8IDUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEJpYXMgYWRhcHRhdGlvbiBmdW5jdGlvbiBhcyBwZXIgc2VjdGlvbiAzLjQgb2YgUkZDIDM0OTIuXG5cdCAqIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNDkyI3NlY3Rpb24tMy40XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRmdW5jdGlvbiBhZGFwdChkZWx0YSwgbnVtUG9pbnRzLCBmaXJzdFRpbWUpIHtcblx0XHR2YXIgayA9IDA7XG5cdFx0ZGVsdGEgPSBmaXJzdFRpbWUgPyBmbG9vcihkZWx0YSAvIGRhbXApIDogZGVsdGEgPj4gMTtcblx0XHRkZWx0YSArPSBmbG9vcihkZWx0YSAvIG51bVBvaW50cyk7XG5cdFx0Zm9yICgvKiBubyBpbml0aWFsaXphdGlvbiAqLzsgZGVsdGEgPiBiYXNlTWludXNUTWluICogdE1heCA+PiAxOyBrICs9IGJhc2UpIHtcblx0XHRcdGRlbHRhID0gZmxvb3IoZGVsdGEgLyBiYXNlTWludXNUTWluKTtcblx0XHR9XG5cdFx0cmV0dXJuIGZsb29yKGsgKyAoYmFzZU1pbnVzVE1pbiArIDEpICogZGVsdGEgLyAoZGVsdGEgKyBza2V3KSk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBQdW55Y29kZSBzdHJpbmcgb2YgQVNDSUktb25seSBzeW1ib2xzIHRvIGEgc3RyaW5nIG9mIFVuaWNvZGVcblx0ICogc3ltYm9scy5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dCBUaGUgUHVueWNvZGUgc3RyaW5nIG9mIEFTQ0lJLW9ubHkgc3ltYm9scy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIHJlc3VsdGluZyBzdHJpbmcgb2YgVW5pY29kZSBzeW1ib2xzLlxuXHQgKi9cblx0ZnVuY3Rpb24gZGVjb2RlKGlucHV0KSB7XG5cdFx0Ly8gRG9uJ3QgdXNlIFVDUy0yXG5cdFx0dmFyIG91dHB1dCA9IFtdLFxuXHRcdCAgICBpbnB1dExlbmd0aCA9IGlucHV0Lmxlbmd0aCxcblx0XHQgICAgb3V0LFxuXHRcdCAgICBpID0gMCxcblx0XHQgICAgbiA9IGluaXRpYWxOLFxuXHRcdCAgICBiaWFzID0gaW5pdGlhbEJpYXMsXG5cdFx0ICAgIGJhc2ljLFxuXHRcdCAgICBqLFxuXHRcdCAgICBpbmRleCxcblx0XHQgICAgb2xkaSxcblx0XHQgICAgdyxcblx0XHQgICAgayxcblx0XHQgICAgZGlnaXQsXG5cdFx0ICAgIHQsXG5cdFx0ICAgIC8qKiBDYWNoZWQgY2FsY3VsYXRpb24gcmVzdWx0cyAqL1xuXHRcdCAgICBiYXNlTWludXNUO1xuXG5cdFx0Ly8gSGFuZGxlIHRoZSBiYXNpYyBjb2RlIHBvaW50czogbGV0IGBiYXNpY2AgYmUgdGhlIG51bWJlciBvZiBpbnB1dCBjb2RlXG5cdFx0Ly8gcG9pbnRzIGJlZm9yZSB0aGUgbGFzdCBkZWxpbWl0ZXIsIG9yIGAwYCBpZiB0aGVyZSBpcyBub25lLCB0aGVuIGNvcHlcblx0XHQvLyB0aGUgZmlyc3QgYmFzaWMgY29kZSBwb2ludHMgdG8gdGhlIG91dHB1dC5cblxuXHRcdGJhc2ljID0gaW5wdXQubGFzdEluZGV4T2YoZGVsaW1pdGVyKTtcblx0XHRpZiAoYmFzaWMgPCAwKSB7XG5cdFx0XHRiYXNpYyA9IDA7XG5cdFx0fVxuXG5cdFx0Zm9yIChqID0gMDsgaiA8IGJhc2ljOyArK2opIHtcblx0XHRcdC8vIGlmIGl0J3Mgbm90IGEgYmFzaWMgY29kZSBwb2ludFxuXHRcdFx0aWYgKGlucHV0LmNoYXJDb2RlQXQoaikgPj0gMHg4MCkge1xuXHRcdFx0XHRlcnJvcignbm90LWJhc2ljJyk7XG5cdFx0XHR9XG5cdFx0XHRvdXRwdXQucHVzaChpbnB1dC5jaGFyQ29kZUF0KGopKTtcblx0XHR9XG5cblx0XHQvLyBNYWluIGRlY29kaW5nIGxvb3A6IHN0YXJ0IGp1c3QgYWZ0ZXIgdGhlIGxhc3QgZGVsaW1pdGVyIGlmIGFueSBiYXNpYyBjb2RlXG5cdFx0Ly8gcG9pbnRzIHdlcmUgY29waWVkOyBzdGFydCBhdCB0aGUgYmVnaW5uaW5nIG90aGVyd2lzZS5cblxuXHRcdGZvciAoaW5kZXggPSBiYXNpYyA+IDAgPyBiYXNpYyArIDEgOiAwOyBpbmRleCA8IGlucHV0TGVuZ3RoOyAvKiBubyBmaW5hbCBleHByZXNzaW9uICovKSB7XG5cblx0XHRcdC8vIGBpbmRleGAgaXMgdGhlIGluZGV4IG9mIHRoZSBuZXh0IGNoYXJhY3RlciB0byBiZSBjb25zdW1lZC5cblx0XHRcdC8vIERlY29kZSBhIGdlbmVyYWxpemVkIHZhcmlhYmxlLWxlbmd0aCBpbnRlZ2VyIGludG8gYGRlbHRhYCxcblx0XHRcdC8vIHdoaWNoIGdldHMgYWRkZWQgdG8gYGlgLiBUaGUgb3ZlcmZsb3cgY2hlY2tpbmcgaXMgZWFzaWVyXG5cdFx0XHQvLyBpZiB3ZSBpbmNyZWFzZSBgaWAgYXMgd2UgZ28sIHRoZW4gc3VidHJhY3Qgb2ZmIGl0cyBzdGFydGluZ1xuXHRcdFx0Ly8gdmFsdWUgYXQgdGhlIGVuZCB0byBvYnRhaW4gYGRlbHRhYC5cblx0XHRcdGZvciAob2xkaSA9IGksIHcgPSAxLCBrID0gYmFzZTsgLyogbm8gY29uZGl0aW9uICovOyBrICs9IGJhc2UpIHtcblxuXHRcdFx0XHRpZiAoaW5kZXggPj0gaW5wdXRMZW5ndGgpIHtcblx0XHRcdFx0XHRlcnJvcignaW52YWxpZC1pbnB1dCcpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0ZGlnaXQgPSBiYXNpY1RvRGlnaXQoaW5wdXQuY2hhckNvZGVBdChpbmRleCsrKSk7XG5cblx0XHRcdFx0aWYgKGRpZ2l0ID49IGJhc2UgfHwgZGlnaXQgPiBmbG9vcigobWF4SW50IC0gaSkgLyB3KSkge1xuXHRcdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aSArPSBkaWdpdCAqIHc7XG5cdFx0XHRcdHQgPSBrIDw9IGJpYXMgPyB0TWluIDogKGsgPj0gYmlhcyArIHRNYXggPyB0TWF4IDogayAtIGJpYXMpO1xuXG5cdFx0XHRcdGlmIChkaWdpdCA8IHQpIHtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGJhc2VNaW51c1QgPSBiYXNlIC0gdDtcblx0XHRcdFx0aWYgKHcgPiBmbG9vcihtYXhJbnQgLyBiYXNlTWludXNUKSkge1xuXHRcdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dyAqPSBiYXNlTWludXNUO1xuXG5cdFx0XHR9XG5cblx0XHRcdG91dCA9IG91dHB1dC5sZW5ndGggKyAxO1xuXHRcdFx0YmlhcyA9IGFkYXB0KGkgLSBvbGRpLCBvdXQsIG9sZGkgPT0gMCk7XG5cblx0XHRcdC8vIGBpYCB3YXMgc3VwcG9zZWQgdG8gd3JhcCBhcm91bmQgZnJvbSBgb3V0YCB0byBgMGAsXG5cdFx0XHQvLyBpbmNyZW1lbnRpbmcgYG5gIGVhY2ggdGltZSwgc28gd2UnbGwgZml4IHRoYXQgbm93OlxuXHRcdFx0aWYgKGZsb29yKGkgLyBvdXQpID4gbWF4SW50IC0gbikge1xuXHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdH1cblxuXHRcdFx0biArPSBmbG9vcihpIC8gb3V0KTtcblx0XHRcdGkgJT0gb3V0O1xuXG5cdFx0XHQvLyBJbnNlcnQgYG5gIGF0IHBvc2l0aW9uIGBpYCBvZiB0aGUgb3V0cHV0XG5cdFx0XHRvdXRwdXQuc3BsaWNlKGkrKywgMCwgbik7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gdWNzMmVuY29kZShvdXRwdXQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgc3RyaW5nIG9mIFVuaWNvZGUgc3ltYm9scyAoZS5nLiBhIGRvbWFpbiBuYW1lIGxhYmVsKSB0byBhXG5cdCAqIFB1bnljb2RlIHN0cmluZyBvZiBBU0NJSS1vbmx5IHN5bWJvbHMuXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIHN0cmluZyBvZiBVbmljb2RlIHN5bWJvbHMuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSByZXN1bHRpbmcgUHVueWNvZGUgc3RyaW5nIG9mIEFTQ0lJLW9ubHkgc3ltYm9scy5cblx0ICovXG5cdGZ1bmN0aW9uIGVuY29kZShpbnB1dCkge1xuXHRcdHZhciBuLFxuXHRcdCAgICBkZWx0YSxcblx0XHQgICAgaGFuZGxlZENQQ291bnQsXG5cdFx0ICAgIGJhc2ljTGVuZ3RoLFxuXHRcdCAgICBiaWFzLFxuXHRcdCAgICBqLFxuXHRcdCAgICBtLFxuXHRcdCAgICBxLFxuXHRcdCAgICBrLFxuXHRcdCAgICB0LFxuXHRcdCAgICBjdXJyZW50VmFsdWUsXG5cdFx0ICAgIG91dHB1dCA9IFtdLFxuXHRcdCAgICAvKiogYGlucHV0TGVuZ3RoYCB3aWxsIGhvbGQgdGhlIG51bWJlciBvZiBjb2RlIHBvaW50cyBpbiBgaW5wdXRgLiAqL1xuXHRcdCAgICBpbnB1dExlbmd0aCxcblx0XHQgICAgLyoqIENhY2hlZCBjYWxjdWxhdGlvbiByZXN1bHRzICovXG5cdFx0ICAgIGhhbmRsZWRDUENvdW50UGx1c09uZSxcblx0XHQgICAgYmFzZU1pbnVzVCxcblx0XHQgICAgcU1pbnVzVDtcblxuXHRcdC8vIENvbnZlcnQgdGhlIGlucHV0IGluIFVDUy0yIHRvIFVuaWNvZGVcblx0XHRpbnB1dCA9IHVjczJkZWNvZGUoaW5wdXQpO1xuXG5cdFx0Ly8gQ2FjaGUgdGhlIGxlbmd0aFxuXHRcdGlucHV0TGVuZ3RoID0gaW5wdXQubGVuZ3RoO1xuXG5cdFx0Ly8gSW5pdGlhbGl6ZSB0aGUgc3RhdGVcblx0XHRuID0gaW5pdGlhbE47XG5cdFx0ZGVsdGEgPSAwO1xuXHRcdGJpYXMgPSBpbml0aWFsQmlhcztcblxuXHRcdC8vIEhhbmRsZSB0aGUgYmFzaWMgY29kZSBwb2ludHNcblx0XHRmb3IgKGogPSAwOyBqIDwgaW5wdXRMZW5ndGg7ICsraikge1xuXHRcdFx0Y3VycmVudFZhbHVlID0gaW5wdXRbal07XG5cdFx0XHRpZiAoY3VycmVudFZhbHVlIDwgMHg4MCkge1xuXHRcdFx0XHRvdXRwdXQucHVzaChzdHJpbmdGcm9tQ2hhckNvZGUoY3VycmVudFZhbHVlKSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aGFuZGxlZENQQ291bnQgPSBiYXNpY0xlbmd0aCA9IG91dHB1dC5sZW5ndGg7XG5cblx0XHQvLyBgaGFuZGxlZENQQ291bnRgIGlzIHRoZSBudW1iZXIgb2YgY29kZSBwb2ludHMgdGhhdCBoYXZlIGJlZW4gaGFuZGxlZDtcblx0XHQvLyBgYmFzaWNMZW5ndGhgIGlzIHRoZSBudW1iZXIgb2YgYmFzaWMgY29kZSBwb2ludHMuXG5cblx0XHQvLyBGaW5pc2ggdGhlIGJhc2ljIHN0cmluZyAtIGlmIGl0IGlzIG5vdCBlbXB0eSAtIHdpdGggYSBkZWxpbWl0ZXJcblx0XHRpZiAoYmFzaWNMZW5ndGgpIHtcblx0XHRcdG91dHB1dC5wdXNoKGRlbGltaXRlcik7XG5cdFx0fVxuXG5cdFx0Ly8gTWFpbiBlbmNvZGluZyBsb29wOlxuXHRcdHdoaWxlIChoYW5kbGVkQ1BDb3VudCA8IGlucHV0TGVuZ3RoKSB7XG5cblx0XHRcdC8vIEFsbCBub24tYmFzaWMgY29kZSBwb2ludHMgPCBuIGhhdmUgYmVlbiBoYW5kbGVkIGFscmVhZHkuIEZpbmQgdGhlIG5leHRcblx0XHRcdC8vIGxhcmdlciBvbmU6XG5cdFx0XHRmb3IgKG0gPSBtYXhJbnQsIGogPSAwOyBqIDwgaW5wdXRMZW5ndGg7ICsraikge1xuXHRcdFx0XHRjdXJyZW50VmFsdWUgPSBpbnB1dFtqXTtcblx0XHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA+PSBuICYmIGN1cnJlbnRWYWx1ZSA8IG0pIHtcblx0XHRcdFx0XHRtID0gY3VycmVudFZhbHVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIEluY3JlYXNlIGBkZWx0YWAgZW5vdWdoIHRvIGFkdmFuY2UgdGhlIGRlY29kZXIncyA8bixpPiBzdGF0ZSB0byA8bSwwPixcblx0XHRcdC8vIGJ1dCBndWFyZCBhZ2FpbnN0IG92ZXJmbG93XG5cdFx0XHRoYW5kbGVkQ1BDb3VudFBsdXNPbmUgPSBoYW5kbGVkQ1BDb3VudCArIDE7XG5cdFx0XHRpZiAobSAtIG4gPiBmbG9vcigobWF4SW50IC0gZGVsdGEpIC8gaGFuZGxlZENQQ291bnRQbHVzT25lKSkge1xuXHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdH1cblxuXHRcdFx0ZGVsdGEgKz0gKG0gLSBuKSAqIGhhbmRsZWRDUENvdW50UGx1c09uZTtcblx0XHRcdG4gPSBtO1xuXG5cdFx0XHRmb3IgKGogPSAwOyBqIDwgaW5wdXRMZW5ndGg7ICsraikge1xuXHRcdFx0XHRjdXJyZW50VmFsdWUgPSBpbnB1dFtqXTtcblxuXHRcdFx0XHRpZiAoY3VycmVudFZhbHVlIDwgbiAmJiArK2RlbHRhID4gbWF4SW50KSB7XG5cdFx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoY3VycmVudFZhbHVlID09IG4pIHtcblx0XHRcdFx0XHQvLyBSZXByZXNlbnQgZGVsdGEgYXMgYSBnZW5lcmFsaXplZCB2YXJpYWJsZS1sZW5ndGggaW50ZWdlclxuXHRcdFx0XHRcdGZvciAocSA9IGRlbHRhLCBrID0gYmFzZTsgLyogbm8gY29uZGl0aW9uICovOyBrICs9IGJhc2UpIHtcblx0XHRcdFx0XHRcdHQgPSBrIDw9IGJpYXMgPyB0TWluIDogKGsgPj0gYmlhcyArIHRNYXggPyB0TWF4IDogayAtIGJpYXMpO1xuXHRcdFx0XHRcdFx0aWYgKHEgPCB0KSB7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cU1pbnVzVCA9IHEgLSB0O1xuXHRcdFx0XHRcdFx0YmFzZU1pbnVzVCA9IGJhc2UgLSB0O1xuXHRcdFx0XHRcdFx0b3V0cHV0LnB1c2goXG5cdFx0XHRcdFx0XHRcdHN0cmluZ0Zyb21DaGFyQ29kZShkaWdpdFRvQmFzaWModCArIHFNaW51c1QgJSBiYXNlTWludXNULCAwKSlcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRxID0gZmxvb3IocU1pbnVzVCAvIGJhc2VNaW51c1QpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdG91dHB1dC5wdXNoKHN0cmluZ0Zyb21DaGFyQ29kZShkaWdpdFRvQmFzaWMocSwgMCkpKTtcblx0XHRcdFx0XHRiaWFzID0gYWRhcHQoZGVsdGEsIGhhbmRsZWRDUENvdW50UGx1c09uZSwgaGFuZGxlZENQQ291bnQgPT0gYmFzaWNMZW5ndGgpO1xuXHRcdFx0XHRcdGRlbHRhID0gMDtcblx0XHRcdFx0XHQrK2hhbmRsZWRDUENvdW50O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdCsrZGVsdGE7XG5cdFx0XHQrK247XG5cblx0XHR9XG5cdFx0cmV0dXJuIG91dHB1dC5qb2luKCcnKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIFB1bnljb2RlIHN0cmluZyByZXByZXNlbnRpbmcgYSBkb21haW4gbmFtZSBvciBhbiBlbWFpbCBhZGRyZXNzXG5cdCAqIHRvIFVuaWNvZGUuIE9ubHkgdGhlIFB1bnljb2RlZCBwYXJ0cyBvZiB0aGUgaW5wdXQgd2lsbCBiZSBjb252ZXJ0ZWQsIGkuZS5cblx0ICogaXQgZG9lc24ndCBtYXR0ZXIgaWYgeW91IGNhbGwgaXQgb24gYSBzdHJpbmcgdGhhdCBoYXMgYWxyZWFkeSBiZWVuXG5cdCAqIGNvbnZlcnRlZCB0byBVbmljb2RlLlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGlucHV0IFRoZSBQdW55Y29kZWQgZG9tYWluIG5hbWUgb3IgZW1haWwgYWRkcmVzcyB0b1xuXHQgKiBjb252ZXJ0IHRvIFVuaWNvZGUuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBVbmljb2RlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBnaXZlbiBQdW55Y29kZVxuXHQgKiBzdHJpbmcuXG5cdCAqL1xuXHRmdW5jdGlvbiB0b1VuaWNvZGUoaW5wdXQpIHtcblx0XHRyZXR1cm4gbWFwRG9tYWluKGlucHV0LCBmdW5jdGlvbihzdHJpbmcpIHtcblx0XHRcdHJldHVybiByZWdleFB1bnljb2RlLnRlc3Qoc3RyaW5nKVxuXHRcdFx0XHQ/IGRlY29kZShzdHJpbmcuc2xpY2UoNCkudG9Mb3dlckNhc2UoKSlcblx0XHRcdFx0OiBzdHJpbmc7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBVbmljb2RlIHN0cmluZyByZXByZXNlbnRpbmcgYSBkb21haW4gbmFtZSBvciBhbiBlbWFpbCBhZGRyZXNzIHRvXG5cdCAqIFB1bnljb2RlLiBPbmx5IHRoZSBub24tQVNDSUkgcGFydHMgb2YgdGhlIGRvbWFpbiBuYW1lIHdpbGwgYmUgY29udmVydGVkLFxuXHQgKiBpLmUuIGl0IGRvZXNuJ3QgbWF0dGVyIGlmIHlvdSBjYWxsIGl0IHdpdGggYSBkb21haW4gdGhhdCdzIGFscmVhZHkgaW5cblx0ICogQVNDSUkuXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIGRvbWFpbiBuYW1lIG9yIGVtYWlsIGFkZHJlc3MgdG8gY29udmVydCwgYXMgYVxuXHQgKiBVbmljb2RlIHN0cmluZy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIFB1bnljb2RlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBnaXZlbiBkb21haW4gbmFtZSBvclxuXHQgKiBlbWFpbCBhZGRyZXNzLlxuXHQgKi9cblx0ZnVuY3Rpb24gdG9BU0NJSShpbnB1dCkge1xuXHRcdHJldHVybiBtYXBEb21haW4oaW5wdXQsIGZ1bmN0aW9uKHN0cmluZykge1xuXHRcdFx0cmV0dXJuIHJlZ2V4Tm9uQVNDSUkudGVzdChzdHJpbmcpXG5cdFx0XHRcdD8gJ3huLS0nICsgZW5jb2RlKHN0cmluZylcblx0XHRcdFx0OiBzdHJpbmc7XG5cdFx0fSk7XG5cdH1cblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHQvKiogRGVmaW5lIHRoZSBwdWJsaWMgQVBJICovXG5cdHB1bnljb2RlID0ge1xuXHRcdC8qKlxuXHRcdCAqIEEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgY3VycmVudCBQdW55Y29kZS5qcyB2ZXJzaW9uIG51bWJlci5cblx0XHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0XHQgKiBAdHlwZSBTdHJpbmdcblx0XHQgKi9cblx0XHQndmVyc2lvbic6ICcxLjQuMScsXG5cdFx0LyoqXG5cdFx0ICogQW4gb2JqZWN0IG9mIG1ldGhvZHMgdG8gY29udmVydCBmcm9tIEphdmFTY3JpcHQncyBpbnRlcm5hbCBjaGFyYWN0ZXJcblx0XHQgKiByZXByZXNlbnRhdGlvbiAoVUNTLTIpIHRvIFVuaWNvZGUgY29kZSBwb2ludHMsIGFuZCBiYWNrLlxuXHRcdCAqIEBzZWUgPGh0dHBzOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9qYXZhc2NyaXB0LWVuY29kaW5nPlxuXHRcdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHRcdCAqIEB0eXBlIE9iamVjdFxuXHRcdCAqL1xuXHRcdCd1Y3MyJzoge1xuXHRcdFx0J2RlY29kZSc6IHVjczJkZWNvZGUsXG5cdFx0XHQnZW5jb2RlJzogdWNzMmVuY29kZVxuXHRcdH0sXG5cdFx0J2RlY29kZSc6IGRlY29kZSxcblx0XHQnZW5jb2RlJzogZW5jb2RlLFxuXHRcdCd0b0FTQ0lJJzogdG9BU0NJSSxcblx0XHQndG9Vbmljb2RlJzogdG9Vbmljb2RlXG5cdH07XG5cblx0LyoqIEV4cG9zZSBgcHVueWNvZGVgICovXG5cdC8vIFNvbWUgQU1EIGJ1aWxkIG9wdGltaXplcnMsIGxpa2Ugci5qcywgY2hlY2sgZm9yIHNwZWNpZmljIGNvbmRpdGlvbiBwYXR0ZXJuc1xuXHQvLyBsaWtlIHRoZSBmb2xsb3dpbmc6XG5cdGlmIChcblx0XHR0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiZcblx0XHR0eXBlb2YgZGVmaW5lLmFtZCA9PSAnb2JqZWN0JyAmJlxuXHRcdGRlZmluZS5hbWRcblx0KSB7XG5cdFx0ZGVmaW5lKCdwdW55Y29kZScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHB1bnljb2RlO1xuXHRcdH0pO1xuXHR9IGVsc2UgaWYgKGZyZWVFeHBvcnRzICYmIGZyZWVNb2R1bGUpIHtcblx0XHRpZiAobW9kdWxlLmV4cG9ydHMgPT0gZnJlZUV4cG9ydHMpIHtcblx0XHRcdC8vIGluIE5vZGUuanMsIGlvLmpzLCBvciBSaW5nb0pTIHYwLjguMCtcblx0XHRcdGZyZWVNb2R1bGUuZXhwb3J0cyA9IHB1bnljb2RlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBpbiBOYXJ3aGFsIG9yIFJpbmdvSlMgdjAuNy4wLVxuXHRcdFx0Zm9yIChrZXkgaW4gcHVueWNvZGUpIHtcblx0XHRcdFx0cHVueWNvZGUuaGFzT3duUHJvcGVydHkoa2V5KSAmJiAoZnJlZUV4cG9ydHNba2V5XSA9IHB1bnljb2RlW2tleV0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fSBlbHNlIHtcblx0XHQvLyBpbiBSaGlubyBvciBhIHdlYiBicm93c2VyXG5cdFx0cm9vdC5wdW55Y29kZSA9IHB1bnljb2RlO1xuXHR9XG5cbn0odGhpcykpO1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbid1c2Ugc3RyaWN0JztcblxuLy8gSWYgb2JqLmhhc093blByb3BlcnR5IGhhcyBiZWVuIG92ZXJyaWRkZW4sIHRoZW4gY2FsbGluZ1xuLy8gb2JqLmhhc093blByb3BlcnR5KHByb3ApIHdpbGwgYnJlYWsuXG4vLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9qb3llbnQvbm9kZS9pc3N1ZXMvMTcwN1xuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihxcywgc2VwLCBlcSwgb3B0aW9ucykge1xuICBzZXAgPSBzZXAgfHwgJyYnO1xuICBlcSA9IGVxIHx8ICc9JztcbiAgdmFyIG9iaiA9IHt9O1xuXG4gIGlmICh0eXBlb2YgcXMgIT09ICdzdHJpbmcnIHx8IHFzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBvYmo7XG4gIH1cblxuICB2YXIgcmVnZXhwID0gL1xcKy9nO1xuICBxcyA9IHFzLnNwbGl0KHNlcCk7XG5cbiAgdmFyIG1heEtleXMgPSAxMDAwO1xuICBpZiAob3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9ucy5tYXhLZXlzID09PSAnbnVtYmVyJykge1xuICAgIG1heEtleXMgPSBvcHRpb25zLm1heEtleXM7XG4gIH1cblxuICB2YXIgbGVuID0gcXMubGVuZ3RoO1xuICAvLyBtYXhLZXlzIDw9IDAgbWVhbnMgdGhhdCB3ZSBzaG91bGQgbm90IGxpbWl0IGtleXMgY291bnRcbiAgaWYgKG1heEtleXMgPiAwICYmIGxlbiA+IG1heEtleXMpIHtcbiAgICBsZW4gPSBtYXhLZXlzO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgIHZhciB4ID0gcXNbaV0ucmVwbGFjZShyZWdleHAsICclMjAnKSxcbiAgICAgICAgaWR4ID0geC5pbmRleE9mKGVxKSxcbiAgICAgICAga3N0ciwgdnN0ciwgaywgdjtcblxuICAgIGlmIChpZHggPj0gMCkge1xuICAgICAga3N0ciA9IHguc3Vic3RyKDAsIGlkeCk7XG4gICAgICB2c3RyID0geC5zdWJzdHIoaWR4ICsgMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGtzdHIgPSB4O1xuICAgICAgdnN0ciA9ICcnO1xuICAgIH1cblxuICAgIGsgPSBkZWNvZGVVUklDb21wb25lbnQoa3N0cik7XG4gICAgdiA9IGRlY29kZVVSSUNvbXBvbmVudCh2c3RyKTtcblxuICAgIGlmICghaGFzT3duUHJvcGVydHkob2JqLCBrKSkge1xuICAgICAgb2JqW2tdID0gdjtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkob2JqW2tdKSkge1xuICAgICAgb2JqW2tdLnB1c2godik7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9ialtrXSA9IFtvYmpba10sIHZdO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmo7XG59O1xuXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHhzKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeHMpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBzdHJpbmdpZnlQcmltaXRpdmUgPSBmdW5jdGlvbih2KSB7XG4gIHN3aXRjaCAodHlwZW9mIHYpIHtcbiAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgcmV0dXJuIHY7XG5cbiAgICBjYXNlICdib29sZWFuJzpcbiAgICAgIHJldHVybiB2ID8gJ3RydWUnIDogJ2ZhbHNlJztcblxuICAgIGNhc2UgJ251bWJlcic6XG4gICAgICByZXR1cm4gaXNGaW5pdGUodikgPyB2IDogJyc7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuICcnO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iaiwgc2VwLCBlcSwgbmFtZSkge1xuICBzZXAgPSBzZXAgfHwgJyYnO1xuICBlcSA9IGVxIHx8ICc9JztcbiAgaWYgKG9iaiA9PT0gbnVsbCkge1xuICAgIG9iaiA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGlmICh0eXBlb2Ygb2JqID09PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBtYXAob2JqZWN0S2V5cyhvYmopLCBmdW5jdGlvbihrKSB7XG4gICAgICB2YXIga3MgPSBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKGspKSArIGVxO1xuICAgICAgaWYgKGlzQXJyYXkob2JqW2tdKSkge1xuICAgICAgICByZXR1cm4gbWFwKG9ialtrXSwgZnVuY3Rpb24odikge1xuICAgICAgICAgIHJldHVybiBrcyArIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUodikpO1xuICAgICAgICB9KS5qb2luKHNlcCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4ga3MgKyBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKG9ialtrXSkpO1xuICAgICAgfVxuICAgIH0pLmpvaW4oc2VwKTtcblxuICB9XG5cbiAgaWYgKCFuYW1lKSByZXR1cm4gJyc7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKG5hbWUpKSArIGVxICtcbiAgICAgICAgIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUob2JqKSk7XG59O1xuXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHhzKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeHMpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcblxuZnVuY3Rpb24gbWFwICh4cywgZikge1xuICBpZiAoeHMubWFwKSByZXR1cm4geHMubWFwKGYpO1xuICB2YXIgcmVzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICByZXMucHVzaChmKHhzW2ldLCBpKSk7XG4gIH1cbiAgcmV0dXJuIHJlcztcbn1cblxudmFyIG9iamVjdEtleXMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiAob2JqKSB7XG4gIHZhciByZXMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSByZXMucHVzaChrZXkpO1xuICB9XG4gIHJldHVybiByZXM7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLmRlY29kZSA9IGV4cG9ydHMucGFyc2UgPSByZXF1aXJlKCcuL2RlY29kZScpO1xuZXhwb3J0cy5lbmNvZGUgPSBleHBvcnRzLnN0cmluZ2lmeSA9IHJlcXVpcmUoJy4vZW5jb2RlJyk7XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgcHVueWNvZGUgPSByZXF1aXJlKCdwdW55Y29kZScpO1xudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxuZXhwb3J0cy5wYXJzZSA9IHVybFBhcnNlO1xuZXhwb3J0cy5yZXNvbHZlID0gdXJsUmVzb2x2ZTtcbmV4cG9ydHMucmVzb2x2ZU9iamVjdCA9IHVybFJlc29sdmVPYmplY3Q7XG5leHBvcnRzLmZvcm1hdCA9IHVybEZvcm1hdDtcblxuZXhwb3J0cy5VcmwgPSBVcmw7XG5cbmZ1bmN0aW9uIFVybCgpIHtcbiAgdGhpcy5wcm90b2NvbCA9IG51bGw7XG4gIHRoaXMuc2xhc2hlcyA9IG51bGw7XG4gIHRoaXMuYXV0aCA9IG51bGw7XG4gIHRoaXMuaG9zdCA9IG51bGw7XG4gIHRoaXMucG9ydCA9IG51bGw7XG4gIHRoaXMuaG9zdG5hbWUgPSBudWxsO1xuICB0aGlzLmhhc2ggPSBudWxsO1xuICB0aGlzLnNlYXJjaCA9IG51bGw7XG4gIHRoaXMucXVlcnkgPSBudWxsO1xuICB0aGlzLnBhdGhuYW1lID0gbnVsbDtcbiAgdGhpcy5wYXRoID0gbnVsbDtcbiAgdGhpcy5ocmVmID0gbnVsbDtcbn1cblxuLy8gUmVmZXJlbmNlOiBSRkMgMzk4NiwgUkZDIDE4MDgsIFJGQyAyMzk2XG5cbi8vIGRlZmluZSB0aGVzZSBoZXJlIHNvIGF0IGxlYXN0IHRoZXkgb25seSBoYXZlIHRvIGJlXG4vLyBjb21waWxlZCBvbmNlIG9uIHRoZSBmaXJzdCBtb2R1bGUgbG9hZC5cbnZhciBwcm90b2NvbFBhdHRlcm4gPSAvXihbYS16MC05ListXSs6KS9pLFxuICAgIHBvcnRQYXR0ZXJuID0gLzpbMC05XSokLyxcblxuICAgIC8vIFNwZWNpYWwgY2FzZSBmb3IgYSBzaW1wbGUgcGF0aCBVUkxcbiAgICBzaW1wbGVQYXRoUGF0dGVybiA9IC9eKFxcL1xcLz8oPyFcXC8pW15cXD9cXHNdKikoXFw/W15cXHNdKik/JC8sXG5cbiAgICAvLyBSRkMgMjM5NjogY2hhcmFjdGVycyByZXNlcnZlZCBmb3IgZGVsaW1pdGluZyBVUkxzLlxuICAgIC8vIFdlIGFjdHVhbGx5IGp1c3QgYXV0by1lc2NhcGUgdGhlc2UuXG4gICAgZGVsaW1zID0gWyc8JywgJz4nLCAnXCInLCAnYCcsICcgJywgJ1xccicsICdcXG4nLCAnXFx0J10sXG5cbiAgICAvLyBSRkMgMjM5NjogY2hhcmFjdGVycyBub3QgYWxsb3dlZCBmb3IgdmFyaW91cyByZWFzb25zLlxuICAgIHVud2lzZSA9IFsneycsICd9JywgJ3wnLCAnXFxcXCcsICdeJywgJ2AnXS5jb25jYXQoZGVsaW1zKSxcblxuICAgIC8vIEFsbG93ZWQgYnkgUkZDcywgYnV0IGNhdXNlIG9mIFhTUyBhdHRhY2tzLiAgQWx3YXlzIGVzY2FwZSB0aGVzZS5cbiAgICBhdXRvRXNjYXBlID0gWydcXCcnXS5jb25jYXQodW53aXNlKSxcbiAgICAvLyBDaGFyYWN0ZXJzIHRoYXQgYXJlIG5ldmVyIGV2ZXIgYWxsb3dlZCBpbiBhIGhvc3RuYW1lLlxuICAgIC8vIE5vdGUgdGhhdCBhbnkgaW52YWxpZCBjaGFycyBhcmUgYWxzbyBoYW5kbGVkLCBidXQgdGhlc2VcbiAgICAvLyBhcmUgdGhlIG9uZXMgdGhhdCBhcmUgKmV4cGVjdGVkKiB0byBiZSBzZWVuLCBzbyB3ZSBmYXN0LXBhdGhcbiAgICAvLyB0aGVtLlxuICAgIG5vbkhvc3RDaGFycyA9IFsnJScsICcvJywgJz8nLCAnOycsICcjJ10uY29uY2F0KGF1dG9Fc2NhcGUpLFxuICAgIGhvc3RFbmRpbmdDaGFycyA9IFsnLycsICc/JywgJyMnXSxcbiAgICBob3N0bmFtZU1heExlbiA9IDI1NSxcbiAgICBob3N0bmFtZVBhcnRQYXR0ZXJuID0gL15bK2EtejAtOUEtWl8tXXswLDYzfSQvLFxuICAgIGhvc3RuYW1lUGFydFN0YXJ0ID0gL14oWythLXowLTlBLVpfLV17MCw2M30pKC4qKSQvLFxuICAgIC8vIHByb3RvY29scyB0aGF0IGNhbiBhbGxvdyBcInVuc2FmZVwiIGFuZCBcInVud2lzZVwiIGNoYXJzLlxuICAgIHVuc2FmZVByb3RvY29sID0ge1xuICAgICAgJ2phdmFzY3JpcHQnOiB0cnVlLFxuICAgICAgJ2phdmFzY3JpcHQ6JzogdHJ1ZVxuICAgIH0sXG4gICAgLy8gcHJvdG9jb2xzIHRoYXQgbmV2ZXIgaGF2ZSBhIGhvc3RuYW1lLlxuICAgIGhvc3RsZXNzUHJvdG9jb2wgPSB7XG4gICAgICAnamF2YXNjcmlwdCc6IHRydWUsXG4gICAgICAnamF2YXNjcmlwdDonOiB0cnVlXG4gICAgfSxcbiAgICAvLyBwcm90b2NvbHMgdGhhdCBhbHdheXMgY29udGFpbiBhIC8vIGJpdC5cbiAgICBzbGFzaGVkUHJvdG9jb2wgPSB7XG4gICAgICAnaHR0cCc6IHRydWUsXG4gICAgICAnaHR0cHMnOiB0cnVlLFxuICAgICAgJ2Z0cCc6IHRydWUsXG4gICAgICAnZ29waGVyJzogdHJ1ZSxcbiAgICAgICdmaWxlJzogdHJ1ZSxcbiAgICAgICdodHRwOic6IHRydWUsXG4gICAgICAnaHR0cHM6JzogdHJ1ZSxcbiAgICAgICdmdHA6JzogdHJ1ZSxcbiAgICAgICdnb3BoZXI6JzogdHJ1ZSxcbiAgICAgICdmaWxlOic6IHRydWVcbiAgICB9LFxuICAgIHF1ZXJ5c3RyaW5nID0gcmVxdWlyZSgncXVlcnlzdHJpbmcnKTtcblxuZnVuY3Rpb24gdXJsUGFyc2UodXJsLCBwYXJzZVF1ZXJ5U3RyaW5nLCBzbGFzaGVzRGVub3RlSG9zdCkge1xuICBpZiAodXJsICYmIHV0aWwuaXNPYmplY3QodXJsKSAmJiB1cmwgaW5zdGFuY2VvZiBVcmwpIHJldHVybiB1cmw7XG5cbiAgdmFyIHUgPSBuZXcgVXJsO1xuICB1LnBhcnNlKHVybCwgcGFyc2VRdWVyeVN0cmluZywgc2xhc2hlc0Rlbm90ZUhvc3QpO1xuICByZXR1cm4gdTtcbn1cblxuVXJsLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKHVybCwgcGFyc2VRdWVyeVN0cmluZywgc2xhc2hlc0Rlbm90ZUhvc3QpIHtcbiAgaWYgKCF1dGlsLmlzU3RyaW5nKHVybCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUGFyYW1ldGVyICd1cmwnIG11c3QgYmUgYSBzdHJpbmcsIG5vdCBcIiArIHR5cGVvZiB1cmwpO1xuICB9XG5cbiAgLy8gQ29weSBjaHJvbWUsIElFLCBvcGVyYSBiYWNrc2xhc2gtaGFuZGxpbmcgYmVoYXZpb3IuXG4gIC8vIEJhY2sgc2xhc2hlcyBiZWZvcmUgdGhlIHF1ZXJ5IHN0cmluZyBnZXQgY29udmVydGVkIHRvIGZvcndhcmQgc2xhc2hlc1xuICAvLyBTZWU6IGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD0yNTkxNlxuICB2YXIgcXVlcnlJbmRleCA9IHVybC5pbmRleE9mKCc/JyksXG4gICAgICBzcGxpdHRlciA9XG4gICAgICAgICAgKHF1ZXJ5SW5kZXggIT09IC0xICYmIHF1ZXJ5SW5kZXggPCB1cmwuaW5kZXhPZignIycpKSA/ICc/JyA6ICcjJyxcbiAgICAgIHVTcGxpdCA9IHVybC5zcGxpdChzcGxpdHRlciksXG4gICAgICBzbGFzaFJlZ2V4ID0gL1xcXFwvZztcbiAgdVNwbGl0WzBdID0gdVNwbGl0WzBdLnJlcGxhY2Uoc2xhc2hSZWdleCwgJy8nKTtcbiAgdXJsID0gdVNwbGl0LmpvaW4oc3BsaXR0ZXIpO1xuXG4gIHZhciByZXN0ID0gdXJsO1xuXG4gIC8vIHRyaW0gYmVmb3JlIHByb2NlZWRpbmcuXG4gIC8vIFRoaXMgaXMgdG8gc3VwcG9ydCBwYXJzZSBzdHVmZiBsaWtlIFwiICBodHRwOi8vZm9vLmNvbSAgXFxuXCJcbiAgcmVzdCA9IHJlc3QudHJpbSgpO1xuXG4gIGlmICghc2xhc2hlc0Rlbm90ZUhvc3QgJiYgdXJsLnNwbGl0KCcjJykubGVuZ3RoID09PSAxKSB7XG4gICAgLy8gVHJ5IGZhc3QgcGF0aCByZWdleHBcbiAgICB2YXIgc2ltcGxlUGF0aCA9IHNpbXBsZVBhdGhQYXR0ZXJuLmV4ZWMocmVzdCk7XG4gICAgaWYgKHNpbXBsZVBhdGgpIHtcbiAgICAgIHRoaXMucGF0aCA9IHJlc3Q7XG4gICAgICB0aGlzLmhyZWYgPSByZXN0O1xuICAgICAgdGhpcy5wYXRobmFtZSA9IHNpbXBsZVBhdGhbMV07XG4gICAgICBpZiAoc2ltcGxlUGF0aFsyXSkge1xuICAgICAgICB0aGlzLnNlYXJjaCA9IHNpbXBsZVBhdGhbMl07XG4gICAgICAgIGlmIChwYXJzZVF1ZXJ5U3RyaW5nKSB7XG4gICAgICAgICAgdGhpcy5xdWVyeSA9IHF1ZXJ5c3RyaW5nLnBhcnNlKHRoaXMuc2VhcmNoLnN1YnN0cigxKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5xdWVyeSA9IHRoaXMuc2VhcmNoLnN1YnN0cigxKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChwYXJzZVF1ZXJ5U3RyaW5nKSB7XG4gICAgICAgIHRoaXMuc2VhcmNoID0gJyc7XG4gICAgICAgIHRoaXMucXVlcnkgPSB7fTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfVxuXG4gIHZhciBwcm90byA9IHByb3RvY29sUGF0dGVybi5leGVjKHJlc3QpO1xuICBpZiAocHJvdG8pIHtcbiAgICBwcm90byA9IHByb3RvWzBdO1xuICAgIHZhciBsb3dlclByb3RvID0gcHJvdG8udG9Mb3dlckNhc2UoKTtcbiAgICB0aGlzLnByb3RvY29sID0gbG93ZXJQcm90bztcbiAgICByZXN0ID0gcmVzdC5zdWJzdHIocHJvdG8ubGVuZ3RoKTtcbiAgfVxuXG4gIC8vIGZpZ3VyZSBvdXQgaWYgaXQncyBnb3QgYSBob3N0XG4gIC8vIHVzZXJAc2VydmVyIGlzICphbHdheXMqIGludGVycHJldGVkIGFzIGEgaG9zdG5hbWUsIGFuZCB1cmxcbiAgLy8gcmVzb2x1dGlvbiB3aWxsIHRyZWF0IC8vZm9vL2JhciBhcyBob3N0PWZvbyxwYXRoPWJhciBiZWNhdXNlIHRoYXQnc1xuICAvLyBob3cgdGhlIGJyb3dzZXIgcmVzb2x2ZXMgcmVsYXRpdmUgVVJMcy5cbiAgaWYgKHNsYXNoZXNEZW5vdGVIb3N0IHx8IHByb3RvIHx8IHJlc3QubWF0Y2goL15cXC9cXC9bXkBcXC9dK0BbXkBcXC9dKy8pKSB7XG4gICAgdmFyIHNsYXNoZXMgPSByZXN0LnN1YnN0cigwLCAyKSA9PT0gJy8vJztcbiAgICBpZiAoc2xhc2hlcyAmJiAhKHByb3RvICYmIGhvc3RsZXNzUHJvdG9jb2xbcHJvdG9dKSkge1xuICAgICAgcmVzdCA9IHJlc3Quc3Vic3RyKDIpO1xuICAgICAgdGhpcy5zbGFzaGVzID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBpZiAoIWhvc3RsZXNzUHJvdG9jb2xbcHJvdG9dICYmXG4gICAgICAoc2xhc2hlcyB8fCAocHJvdG8gJiYgIXNsYXNoZWRQcm90b2NvbFtwcm90b10pKSkge1xuXG4gICAgLy8gdGhlcmUncyBhIGhvc3RuYW1lLlxuICAgIC8vIHRoZSBmaXJzdCBpbnN0YW5jZSBvZiAvLCA/LCA7LCBvciAjIGVuZHMgdGhlIGhvc3QuXG4gICAgLy9cbiAgICAvLyBJZiB0aGVyZSBpcyBhbiBAIGluIHRoZSBob3N0bmFtZSwgdGhlbiBub24taG9zdCBjaGFycyAqYXJlKiBhbGxvd2VkXG4gICAgLy8gdG8gdGhlIGxlZnQgb2YgdGhlIGxhc3QgQCBzaWduLCB1bmxlc3Mgc29tZSBob3N0LWVuZGluZyBjaGFyYWN0ZXJcbiAgICAvLyBjb21lcyAqYmVmb3JlKiB0aGUgQC1zaWduLlxuICAgIC8vIFVSTHMgYXJlIG9ibm94aW91cy5cbiAgICAvL1xuICAgIC8vIGV4OlxuICAgIC8vIGh0dHA6Ly9hQGJAYy8gPT4gdXNlcjphQGIgaG9zdDpjXG4gICAgLy8gaHR0cDovL2FAYj9AYyA9PiB1c2VyOmEgaG9zdDpjIHBhdGg6Lz9AY1xuXG4gICAgLy8gdjAuMTIgVE9ETyhpc2FhY3MpOiBUaGlzIGlzIG5vdCBxdWl0ZSBob3cgQ2hyb21lIGRvZXMgdGhpbmdzLlxuICAgIC8vIFJldmlldyBvdXIgdGVzdCBjYXNlIGFnYWluc3QgYnJvd3NlcnMgbW9yZSBjb21wcmVoZW5zaXZlbHkuXG5cbiAgICAvLyBmaW5kIHRoZSBmaXJzdCBpbnN0YW5jZSBvZiBhbnkgaG9zdEVuZGluZ0NoYXJzXG4gICAgdmFyIGhvc3RFbmQgPSAtMTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhvc3RFbmRpbmdDaGFycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGhlYyA9IHJlc3QuaW5kZXhPZihob3N0RW5kaW5nQ2hhcnNbaV0pO1xuICAgICAgaWYgKGhlYyAhPT0gLTEgJiYgKGhvc3RFbmQgPT09IC0xIHx8IGhlYyA8IGhvc3RFbmQpKVxuICAgICAgICBob3N0RW5kID0gaGVjO1xuICAgIH1cblxuICAgIC8vIGF0IHRoaXMgcG9pbnQsIGVpdGhlciB3ZSBoYXZlIGFuIGV4cGxpY2l0IHBvaW50IHdoZXJlIHRoZVxuICAgIC8vIGF1dGggcG9ydGlvbiBjYW5ub3QgZ28gcGFzdCwgb3IgdGhlIGxhc3QgQCBjaGFyIGlzIHRoZSBkZWNpZGVyLlxuICAgIHZhciBhdXRoLCBhdFNpZ247XG4gICAgaWYgKGhvc3RFbmQgPT09IC0xKSB7XG4gICAgICAvLyBhdFNpZ24gY2FuIGJlIGFueXdoZXJlLlxuICAgICAgYXRTaWduID0gcmVzdC5sYXN0SW5kZXhPZignQCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBhdFNpZ24gbXVzdCBiZSBpbiBhdXRoIHBvcnRpb24uXG4gICAgICAvLyBodHRwOi8vYUBiL2NAZCA9PiBob3N0OmIgYXV0aDphIHBhdGg6L2NAZFxuICAgICAgYXRTaWduID0gcmVzdC5sYXN0SW5kZXhPZignQCcsIGhvc3RFbmQpO1xuICAgIH1cblxuICAgIC8vIE5vdyB3ZSBoYXZlIGEgcG9ydGlvbiB3aGljaCBpcyBkZWZpbml0ZWx5IHRoZSBhdXRoLlxuICAgIC8vIFB1bGwgdGhhdCBvZmYuXG4gICAgaWYgKGF0U2lnbiAhPT0gLTEpIHtcbiAgICAgIGF1dGggPSByZXN0LnNsaWNlKDAsIGF0U2lnbik7XG4gICAgICByZXN0ID0gcmVzdC5zbGljZShhdFNpZ24gKyAxKTtcbiAgICAgIHRoaXMuYXV0aCA9IGRlY29kZVVSSUNvbXBvbmVudChhdXRoKTtcbiAgICB9XG5cbiAgICAvLyB0aGUgaG9zdCBpcyB0aGUgcmVtYWluaW5nIHRvIHRoZSBsZWZ0IG9mIHRoZSBmaXJzdCBub24taG9zdCBjaGFyXG4gICAgaG9zdEVuZCA9IC0xO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9uSG9zdENoYXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaGVjID0gcmVzdC5pbmRleE9mKG5vbkhvc3RDaGFyc1tpXSk7XG4gICAgICBpZiAoaGVjICE9PSAtMSAmJiAoaG9zdEVuZCA9PT0gLTEgfHwgaGVjIDwgaG9zdEVuZCkpXG4gICAgICAgIGhvc3RFbmQgPSBoZWM7XG4gICAgfVxuICAgIC8vIGlmIHdlIHN0aWxsIGhhdmUgbm90IGhpdCBpdCwgdGhlbiB0aGUgZW50aXJlIHRoaW5nIGlzIGEgaG9zdC5cbiAgICBpZiAoaG9zdEVuZCA9PT0gLTEpXG4gICAgICBob3N0RW5kID0gcmVzdC5sZW5ndGg7XG5cbiAgICB0aGlzLmhvc3QgPSByZXN0LnNsaWNlKDAsIGhvc3RFbmQpO1xuICAgIHJlc3QgPSByZXN0LnNsaWNlKGhvc3RFbmQpO1xuXG4gICAgLy8gcHVsbCBvdXQgcG9ydC5cbiAgICB0aGlzLnBhcnNlSG9zdCgpO1xuXG4gICAgLy8gd2UndmUgaW5kaWNhdGVkIHRoYXQgdGhlcmUgaXMgYSBob3N0bmFtZSxcbiAgICAvLyBzbyBldmVuIGlmIGl0J3MgZW1wdHksIGl0IGhhcyB0byBiZSBwcmVzZW50LlxuICAgIHRoaXMuaG9zdG5hbWUgPSB0aGlzLmhvc3RuYW1lIHx8ICcnO1xuXG4gICAgLy8gaWYgaG9zdG5hbWUgYmVnaW5zIHdpdGggWyBhbmQgZW5kcyB3aXRoIF1cbiAgICAvLyBhc3N1bWUgdGhhdCBpdCdzIGFuIElQdjYgYWRkcmVzcy5cbiAgICB2YXIgaXB2Nkhvc3RuYW1lID0gdGhpcy5ob3N0bmFtZVswXSA9PT0gJ1snICYmXG4gICAgICAgIHRoaXMuaG9zdG5hbWVbdGhpcy5ob3N0bmFtZS5sZW5ndGggLSAxXSA9PT0gJ10nO1xuXG4gICAgLy8gdmFsaWRhdGUgYSBsaXR0bGUuXG4gICAgaWYgKCFpcHY2SG9zdG5hbWUpIHtcbiAgICAgIHZhciBob3N0cGFydHMgPSB0aGlzLmhvc3RuYW1lLnNwbGl0KC9cXC4vKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gaG9zdHBhcnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgcGFydCA9IGhvc3RwYXJ0c1tpXTtcbiAgICAgICAgaWYgKCFwYXJ0KSBjb250aW51ZTtcbiAgICAgICAgaWYgKCFwYXJ0Lm1hdGNoKGhvc3RuYW1lUGFydFBhdHRlcm4pKSB7XG4gICAgICAgICAgdmFyIG5ld3BhcnQgPSAnJztcbiAgICAgICAgICBmb3IgKHZhciBqID0gMCwgayA9IHBhcnQubGVuZ3RoOyBqIDwgazsgaisrKSB7XG4gICAgICAgICAgICBpZiAocGFydC5jaGFyQ29kZUF0KGopID4gMTI3KSB7XG4gICAgICAgICAgICAgIC8vIHdlIHJlcGxhY2Ugbm9uLUFTQ0lJIGNoYXIgd2l0aCBhIHRlbXBvcmFyeSBwbGFjZWhvbGRlclxuICAgICAgICAgICAgICAvLyB3ZSBuZWVkIHRoaXMgdG8gbWFrZSBzdXJlIHNpemUgb2YgaG9zdG5hbWUgaXMgbm90XG4gICAgICAgICAgICAgIC8vIGJyb2tlbiBieSByZXBsYWNpbmcgbm9uLUFTQ0lJIGJ5IG5vdGhpbmdcbiAgICAgICAgICAgICAgbmV3cGFydCArPSAneCc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBuZXdwYXJ0ICs9IHBhcnRbal07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIHdlIHRlc3QgYWdhaW4gd2l0aCBBU0NJSSBjaGFyIG9ubHlcbiAgICAgICAgICBpZiAoIW5ld3BhcnQubWF0Y2goaG9zdG5hbWVQYXJ0UGF0dGVybikpIHtcbiAgICAgICAgICAgIHZhciB2YWxpZFBhcnRzID0gaG9zdHBhcnRzLnNsaWNlKDAsIGkpO1xuICAgICAgICAgICAgdmFyIG5vdEhvc3QgPSBob3N0cGFydHMuc2xpY2UoaSArIDEpO1xuICAgICAgICAgICAgdmFyIGJpdCA9IHBhcnQubWF0Y2goaG9zdG5hbWVQYXJ0U3RhcnQpO1xuICAgICAgICAgICAgaWYgKGJpdCkge1xuICAgICAgICAgICAgICB2YWxpZFBhcnRzLnB1c2goYml0WzFdKTtcbiAgICAgICAgICAgICAgbm90SG9zdC51bnNoaWZ0KGJpdFsyXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobm90SG9zdC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgcmVzdCA9ICcvJyArIG5vdEhvc3Quam9pbignLicpICsgcmVzdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuaG9zdG5hbWUgPSB2YWxpZFBhcnRzLmpvaW4oJy4nKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmhvc3RuYW1lLmxlbmd0aCA+IGhvc3RuYW1lTWF4TGVuKSB7XG4gICAgICB0aGlzLmhvc3RuYW1lID0gJyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGhvc3RuYW1lcyBhcmUgYWx3YXlzIGxvd2VyIGNhc2UuXG4gICAgICB0aGlzLmhvc3RuYW1lID0gdGhpcy5ob3N0bmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIH1cblxuICAgIGlmICghaXB2Nkhvc3RuYW1lKSB7XG4gICAgICAvLyBJRE5BIFN1cHBvcnQ6IFJldHVybnMgYSBwdW55Y29kZWQgcmVwcmVzZW50YXRpb24gb2YgXCJkb21haW5cIi5cbiAgICAgIC8vIEl0IG9ubHkgY29udmVydHMgcGFydHMgb2YgdGhlIGRvbWFpbiBuYW1lIHRoYXRcbiAgICAgIC8vIGhhdmUgbm9uLUFTQ0lJIGNoYXJhY3RlcnMsIGkuZS4gaXQgZG9lc24ndCBtYXR0ZXIgaWZcbiAgICAgIC8vIHlvdSBjYWxsIGl0IHdpdGggYSBkb21haW4gdGhhdCBhbHJlYWR5IGlzIEFTQ0lJLW9ubHkuXG4gICAgICB0aGlzLmhvc3RuYW1lID0gcHVueWNvZGUudG9BU0NJSSh0aGlzLmhvc3RuYW1lKTtcbiAgICB9XG5cbiAgICB2YXIgcCA9IHRoaXMucG9ydCA/ICc6JyArIHRoaXMucG9ydCA6ICcnO1xuICAgIHZhciBoID0gdGhpcy5ob3N0bmFtZSB8fCAnJztcbiAgICB0aGlzLmhvc3QgPSBoICsgcDtcbiAgICB0aGlzLmhyZWYgKz0gdGhpcy5ob3N0O1xuXG4gICAgLy8gc3RyaXAgWyBhbmQgXSBmcm9tIHRoZSBob3N0bmFtZVxuICAgIC8vIHRoZSBob3N0IGZpZWxkIHN0aWxsIHJldGFpbnMgdGhlbSwgdGhvdWdoXG4gICAgaWYgKGlwdjZIb3N0bmFtZSkge1xuICAgICAgdGhpcy5ob3N0bmFtZSA9IHRoaXMuaG9zdG5hbWUuc3Vic3RyKDEsIHRoaXMuaG9zdG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICBpZiAocmVzdFswXSAhPT0gJy8nKSB7XG4gICAgICAgIHJlc3QgPSAnLycgKyByZXN0O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIG5vdyByZXN0IGlzIHNldCB0byB0aGUgcG9zdC1ob3N0IHN0dWZmLlxuICAvLyBjaG9wIG9mZiBhbnkgZGVsaW0gY2hhcnMuXG4gIGlmICghdW5zYWZlUHJvdG9jb2xbbG93ZXJQcm90b10pIHtcblxuICAgIC8vIEZpcnN0LCBtYWtlIDEwMCUgc3VyZSB0aGF0IGFueSBcImF1dG9Fc2NhcGVcIiBjaGFycyBnZXRcbiAgICAvLyBlc2NhcGVkLCBldmVuIGlmIGVuY29kZVVSSUNvbXBvbmVudCBkb2Vzbid0IHRoaW5rIHRoZXlcbiAgICAvLyBuZWVkIHRvIGJlLlxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gYXV0b0VzY2FwZS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHZhciBhZSA9IGF1dG9Fc2NhcGVbaV07XG4gICAgICBpZiAocmVzdC5pbmRleE9mKGFlKSA9PT0gLTEpXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgdmFyIGVzYyA9IGVuY29kZVVSSUNvbXBvbmVudChhZSk7XG4gICAgICBpZiAoZXNjID09PSBhZSkge1xuICAgICAgICBlc2MgPSBlc2NhcGUoYWUpO1xuICAgICAgfVxuICAgICAgcmVzdCA9IHJlc3Quc3BsaXQoYWUpLmpvaW4oZXNjKTtcbiAgICB9XG4gIH1cblxuXG4gIC8vIGNob3Agb2ZmIGZyb20gdGhlIHRhaWwgZmlyc3QuXG4gIHZhciBoYXNoID0gcmVzdC5pbmRleE9mKCcjJyk7XG4gIGlmIChoYXNoICE9PSAtMSkge1xuICAgIC8vIGdvdCBhIGZyYWdtZW50IHN0cmluZy5cbiAgICB0aGlzLmhhc2ggPSByZXN0LnN1YnN0cihoYXNoKTtcbiAgICByZXN0ID0gcmVzdC5zbGljZSgwLCBoYXNoKTtcbiAgfVxuICB2YXIgcW0gPSByZXN0LmluZGV4T2YoJz8nKTtcbiAgaWYgKHFtICE9PSAtMSkge1xuICAgIHRoaXMuc2VhcmNoID0gcmVzdC5zdWJzdHIocW0pO1xuICAgIHRoaXMucXVlcnkgPSByZXN0LnN1YnN0cihxbSArIDEpO1xuICAgIGlmIChwYXJzZVF1ZXJ5U3RyaW5nKSB7XG4gICAgICB0aGlzLnF1ZXJ5ID0gcXVlcnlzdHJpbmcucGFyc2UodGhpcy5xdWVyeSk7XG4gICAgfVxuICAgIHJlc3QgPSByZXN0LnNsaWNlKDAsIHFtKTtcbiAgfSBlbHNlIGlmIChwYXJzZVF1ZXJ5U3RyaW5nKSB7XG4gICAgLy8gbm8gcXVlcnkgc3RyaW5nLCBidXQgcGFyc2VRdWVyeVN0cmluZyBzdGlsbCByZXF1ZXN0ZWRcbiAgICB0aGlzLnNlYXJjaCA9ICcnO1xuICAgIHRoaXMucXVlcnkgPSB7fTtcbiAgfVxuICBpZiAocmVzdCkgdGhpcy5wYXRobmFtZSA9IHJlc3Q7XG4gIGlmIChzbGFzaGVkUHJvdG9jb2xbbG93ZXJQcm90b10gJiZcbiAgICAgIHRoaXMuaG9zdG5hbWUgJiYgIXRoaXMucGF0aG5hbWUpIHtcbiAgICB0aGlzLnBhdGhuYW1lID0gJy8nO1xuICB9XG5cbiAgLy90byBzdXBwb3J0IGh0dHAucmVxdWVzdFxuICBpZiAodGhpcy5wYXRobmFtZSB8fCB0aGlzLnNlYXJjaCkge1xuICAgIHZhciBwID0gdGhpcy5wYXRobmFtZSB8fCAnJztcbiAgICB2YXIgcyA9IHRoaXMuc2VhcmNoIHx8ICcnO1xuICAgIHRoaXMucGF0aCA9IHAgKyBzO1xuICB9XG5cbiAgLy8gZmluYWxseSwgcmVjb25zdHJ1Y3QgdGhlIGhyZWYgYmFzZWQgb24gd2hhdCBoYXMgYmVlbiB2YWxpZGF0ZWQuXG4gIHRoaXMuaHJlZiA9IHRoaXMuZm9ybWF0KCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZm9ybWF0IGEgcGFyc2VkIG9iamVjdCBpbnRvIGEgdXJsIHN0cmluZ1xuZnVuY3Rpb24gdXJsRm9ybWF0KG9iaikge1xuICAvLyBlbnN1cmUgaXQncyBhbiBvYmplY3QsIGFuZCBub3QgYSBzdHJpbmcgdXJsLlxuICAvLyBJZiBpdCdzIGFuIG9iaiwgdGhpcyBpcyBhIG5vLW9wLlxuICAvLyB0aGlzIHdheSwgeW91IGNhbiBjYWxsIHVybF9mb3JtYXQoKSBvbiBzdHJpbmdzXG4gIC8vIHRvIGNsZWFuIHVwIHBvdGVudGlhbGx5IHdvbmt5IHVybHMuXG4gIGlmICh1dGlsLmlzU3RyaW5nKG9iaikpIG9iaiA9IHVybFBhcnNlKG9iaik7XG4gIGlmICghKG9iaiBpbnN0YW5jZW9mIFVybCkpIHJldHVybiBVcmwucHJvdG90eXBlLmZvcm1hdC5jYWxsKG9iaik7XG4gIHJldHVybiBvYmouZm9ybWF0KCk7XG59XG5cblVybC5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBhdXRoID0gdGhpcy5hdXRoIHx8ICcnO1xuICBpZiAoYXV0aCkge1xuICAgIGF1dGggPSBlbmNvZGVVUklDb21wb25lbnQoYXV0aCk7XG4gICAgYXV0aCA9IGF1dGgucmVwbGFjZSgvJTNBL2ksICc6Jyk7XG4gICAgYXV0aCArPSAnQCc7XG4gIH1cblxuICB2YXIgcHJvdG9jb2wgPSB0aGlzLnByb3RvY29sIHx8ICcnLFxuICAgICAgcGF0aG5hbWUgPSB0aGlzLnBhdGhuYW1lIHx8ICcnLFxuICAgICAgaGFzaCA9IHRoaXMuaGFzaCB8fCAnJyxcbiAgICAgIGhvc3QgPSBmYWxzZSxcbiAgICAgIHF1ZXJ5ID0gJyc7XG5cbiAgaWYgKHRoaXMuaG9zdCkge1xuICAgIGhvc3QgPSBhdXRoICsgdGhpcy5ob3N0O1xuICB9IGVsc2UgaWYgKHRoaXMuaG9zdG5hbWUpIHtcbiAgICBob3N0ID0gYXV0aCArICh0aGlzLmhvc3RuYW1lLmluZGV4T2YoJzonKSA9PT0gLTEgP1xuICAgICAgICB0aGlzLmhvc3RuYW1lIDpcbiAgICAgICAgJ1snICsgdGhpcy5ob3N0bmFtZSArICddJyk7XG4gICAgaWYgKHRoaXMucG9ydCkge1xuICAgICAgaG9zdCArPSAnOicgKyB0aGlzLnBvcnQ7XG4gICAgfVxuICB9XG5cbiAgaWYgKHRoaXMucXVlcnkgJiZcbiAgICAgIHV0aWwuaXNPYmplY3QodGhpcy5xdWVyeSkgJiZcbiAgICAgIE9iamVjdC5rZXlzKHRoaXMucXVlcnkpLmxlbmd0aCkge1xuICAgIHF1ZXJ5ID0gcXVlcnlzdHJpbmcuc3RyaW5naWZ5KHRoaXMucXVlcnkpO1xuICB9XG5cbiAgdmFyIHNlYXJjaCA9IHRoaXMuc2VhcmNoIHx8IChxdWVyeSAmJiAoJz8nICsgcXVlcnkpKSB8fCAnJztcblxuICBpZiAocHJvdG9jb2wgJiYgcHJvdG9jb2wuc3Vic3RyKC0xKSAhPT0gJzonKSBwcm90b2NvbCArPSAnOic7XG5cbiAgLy8gb25seSB0aGUgc2xhc2hlZFByb3RvY29scyBnZXQgdGhlIC8vLiAgTm90IG1haWx0bzosIHhtcHA6LCBldGMuXG4gIC8vIHVubGVzcyB0aGV5IGhhZCB0aGVtIHRvIGJlZ2luIHdpdGguXG4gIGlmICh0aGlzLnNsYXNoZXMgfHxcbiAgICAgICghcHJvdG9jb2wgfHwgc2xhc2hlZFByb3RvY29sW3Byb3RvY29sXSkgJiYgaG9zdCAhPT0gZmFsc2UpIHtcbiAgICBob3N0ID0gJy8vJyArIChob3N0IHx8ICcnKTtcbiAgICBpZiAocGF0aG5hbWUgJiYgcGF0aG5hbWUuY2hhckF0KDApICE9PSAnLycpIHBhdGhuYW1lID0gJy8nICsgcGF0aG5hbWU7XG4gIH0gZWxzZSBpZiAoIWhvc3QpIHtcbiAgICBob3N0ID0gJyc7XG4gIH1cblxuICBpZiAoaGFzaCAmJiBoYXNoLmNoYXJBdCgwKSAhPT0gJyMnKSBoYXNoID0gJyMnICsgaGFzaDtcbiAgaWYgKHNlYXJjaCAmJiBzZWFyY2guY2hhckF0KDApICE9PSAnPycpIHNlYXJjaCA9ICc/JyArIHNlYXJjaDtcblxuICBwYXRobmFtZSA9IHBhdGhuYW1lLnJlcGxhY2UoL1s/I10vZywgZnVuY3Rpb24obWF0Y2gpIHtcbiAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KG1hdGNoKTtcbiAgfSk7XG4gIHNlYXJjaCA9IHNlYXJjaC5yZXBsYWNlKCcjJywgJyUyMycpO1xuXG4gIHJldHVybiBwcm90b2NvbCArIGhvc3QgKyBwYXRobmFtZSArIHNlYXJjaCArIGhhc2g7XG59O1xuXG5mdW5jdGlvbiB1cmxSZXNvbHZlKHNvdXJjZSwgcmVsYXRpdmUpIHtcbiAgcmV0dXJuIHVybFBhcnNlKHNvdXJjZSwgZmFsc2UsIHRydWUpLnJlc29sdmUocmVsYXRpdmUpO1xufVxuXG5VcmwucHJvdG90eXBlLnJlc29sdmUgPSBmdW5jdGlvbihyZWxhdGl2ZSkge1xuICByZXR1cm4gdGhpcy5yZXNvbHZlT2JqZWN0KHVybFBhcnNlKHJlbGF0aXZlLCBmYWxzZSwgdHJ1ZSkpLmZvcm1hdCgpO1xufTtcblxuZnVuY3Rpb24gdXJsUmVzb2x2ZU9iamVjdChzb3VyY2UsIHJlbGF0aXZlKSB7XG4gIGlmICghc291cmNlKSByZXR1cm4gcmVsYXRpdmU7XG4gIHJldHVybiB1cmxQYXJzZShzb3VyY2UsIGZhbHNlLCB0cnVlKS5yZXNvbHZlT2JqZWN0KHJlbGF0aXZlKTtcbn1cblxuVXJsLnByb3RvdHlwZS5yZXNvbHZlT2JqZWN0ID0gZnVuY3Rpb24ocmVsYXRpdmUpIHtcbiAgaWYgKHV0aWwuaXNTdHJpbmcocmVsYXRpdmUpKSB7XG4gICAgdmFyIHJlbCA9IG5ldyBVcmwoKTtcbiAgICByZWwucGFyc2UocmVsYXRpdmUsIGZhbHNlLCB0cnVlKTtcbiAgICByZWxhdGl2ZSA9IHJlbDtcbiAgfVxuXG4gIHZhciByZXN1bHQgPSBuZXcgVXJsKCk7XG4gIHZhciB0a2V5cyA9IE9iamVjdC5rZXlzKHRoaXMpO1xuICBmb3IgKHZhciB0ayA9IDA7IHRrIDwgdGtleXMubGVuZ3RoOyB0aysrKSB7XG4gICAgdmFyIHRrZXkgPSB0a2V5c1t0a107XG4gICAgcmVzdWx0W3RrZXldID0gdGhpc1t0a2V5XTtcbiAgfVxuXG4gIC8vIGhhc2ggaXMgYWx3YXlzIG92ZXJyaWRkZW4sIG5vIG1hdHRlciB3aGF0LlxuICAvLyBldmVuIGhyZWY9XCJcIiB3aWxsIHJlbW92ZSBpdC5cbiAgcmVzdWx0Lmhhc2ggPSByZWxhdGl2ZS5oYXNoO1xuXG4gIC8vIGlmIHRoZSByZWxhdGl2ZSB1cmwgaXMgZW1wdHksIHRoZW4gdGhlcmUncyBub3RoaW5nIGxlZnQgdG8gZG8gaGVyZS5cbiAgaWYgKHJlbGF0aXZlLmhyZWYgPT09ICcnKSB7XG4gICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8vIGhyZWZzIGxpa2UgLy9mb28vYmFyIGFsd2F5cyBjdXQgdG8gdGhlIHByb3RvY29sLlxuICBpZiAocmVsYXRpdmUuc2xhc2hlcyAmJiAhcmVsYXRpdmUucHJvdG9jb2wpIHtcbiAgICAvLyB0YWtlIGV2ZXJ5dGhpbmcgZXhjZXB0IHRoZSBwcm90b2NvbCBmcm9tIHJlbGF0aXZlXG4gICAgdmFyIHJrZXlzID0gT2JqZWN0LmtleXMocmVsYXRpdmUpO1xuICAgIGZvciAodmFyIHJrID0gMDsgcmsgPCBya2V5cy5sZW5ndGg7IHJrKyspIHtcbiAgICAgIHZhciBya2V5ID0gcmtleXNbcmtdO1xuICAgICAgaWYgKHJrZXkgIT09ICdwcm90b2NvbCcpXG4gICAgICAgIHJlc3VsdFtya2V5XSA9IHJlbGF0aXZlW3JrZXldO1xuICAgIH1cblxuICAgIC8vdXJsUGFyc2UgYXBwZW5kcyB0cmFpbGluZyAvIHRvIHVybHMgbGlrZSBodHRwOi8vd3d3LmV4YW1wbGUuY29tXG4gICAgaWYgKHNsYXNoZWRQcm90b2NvbFtyZXN1bHQucHJvdG9jb2xdICYmXG4gICAgICAgIHJlc3VsdC5ob3N0bmFtZSAmJiAhcmVzdWx0LnBhdGhuYW1lKSB7XG4gICAgICByZXN1bHQucGF0aCA9IHJlc3VsdC5wYXRobmFtZSA9ICcvJztcbiAgICB9XG5cbiAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgaWYgKHJlbGF0aXZlLnByb3RvY29sICYmIHJlbGF0aXZlLnByb3RvY29sICE9PSByZXN1bHQucHJvdG9jb2wpIHtcbiAgICAvLyBpZiBpdCdzIGEga25vd24gdXJsIHByb3RvY29sLCB0aGVuIGNoYW5naW5nXG4gICAgLy8gdGhlIHByb3RvY29sIGRvZXMgd2VpcmQgdGhpbmdzXG4gICAgLy8gZmlyc3QsIGlmIGl0J3Mgbm90IGZpbGU6LCB0aGVuIHdlIE1VU1QgaGF2ZSBhIGhvc3QsXG4gICAgLy8gYW5kIGlmIHRoZXJlIHdhcyBhIHBhdGhcbiAgICAvLyB0byBiZWdpbiB3aXRoLCB0aGVuIHdlIE1VU1QgaGF2ZSBhIHBhdGguXG4gICAgLy8gaWYgaXQgaXMgZmlsZTosIHRoZW4gdGhlIGhvc3QgaXMgZHJvcHBlZCxcbiAgICAvLyBiZWNhdXNlIHRoYXQncyBrbm93biB0byBiZSBob3N0bGVzcy5cbiAgICAvLyBhbnl0aGluZyBlbHNlIGlzIGFzc3VtZWQgdG8gYmUgYWJzb2x1dGUuXG4gICAgaWYgKCFzbGFzaGVkUHJvdG9jb2xbcmVsYXRpdmUucHJvdG9jb2xdKSB7XG4gICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHJlbGF0aXZlKTtcbiAgICAgIGZvciAodmFyIHYgPSAwOyB2IDwga2V5cy5sZW5ndGg7IHYrKykge1xuICAgICAgICB2YXIgayA9IGtleXNbdl07XG4gICAgICAgIHJlc3VsdFtrXSA9IHJlbGF0aXZlW2tdO1xuICAgICAgfVxuICAgICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHJlc3VsdC5wcm90b2NvbCA9IHJlbGF0aXZlLnByb3RvY29sO1xuICAgIGlmICghcmVsYXRpdmUuaG9zdCAmJiAhaG9zdGxlc3NQcm90b2NvbFtyZWxhdGl2ZS5wcm90b2NvbF0pIHtcbiAgICAgIHZhciByZWxQYXRoID0gKHJlbGF0aXZlLnBhdGhuYW1lIHx8ICcnKS5zcGxpdCgnLycpO1xuICAgICAgd2hpbGUgKHJlbFBhdGgubGVuZ3RoICYmICEocmVsYXRpdmUuaG9zdCA9IHJlbFBhdGguc2hpZnQoKSkpO1xuICAgICAgaWYgKCFyZWxhdGl2ZS5ob3N0KSByZWxhdGl2ZS5ob3N0ID0gJyc7XG4gICAgICBpZiAoIXJlbGF0aXZlLmhvc3RuYW1lKSByZWxhdGl2ZS5ob3N0bmFtZSA9ICcnO1xuICAgICAgaWYgKHJlbFBhdGhbMF0gIT09ICcnKSByZWxQYXRoLnVuc2hpZnQoJycpO1xuICAgICAgaWYgKHJlbFBhdGgubGVuZ3RoIDwgMikgcmVsUGF0aC51bnNoaWZ0KCcnKTtcbiAgICAgIHJlc3VsdC5wYXRobmFtZSA9IHJlbFBhdGguam9pbignLycpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQucGF0aG5hbWUgPSByZWxhdGl2ZS5wYXRobmFtZTtcbiAgICB9XG4gICAgcmVzdWx0LnNlYXJjaCA9IHJlbGF0aXZlLnNlYXJjaDtcbiAgICByZXN1bHQucXVlcnkgPSByZWxhdGl2ZS5xdWVyeTtcbiAgICByZXN1bHQuaG9zdCA9IHJlbGF0aXZlLmhvc3QgfHwgJyc7XG4gICAgcmVzdWx0LmF1dGggPSByZWxhdGl2ZS5hdXRoO1xuICAgIHJlc3VsdC5ob3N0bmFtZSA9IHJlbGF0aXZlLmhvc3RuYW1lIHx8IHJlbGF0aXZlLmhvc3Q7XG4gICAgcmVzdWx0LnBvcnQgPSByZWxhdGl2ZS5wb3J0O1xuICAgIC8vIHRvIHN1cHBvcnQgaHR0cC5yZXF1ZXN0XG4gICAgaWYgKHJlc3VsdC5wYXRobmFtZSB8fCByZXN1bHQuc2VhcmNoKSB7XG4gICAgICB2YXIgcCA9IHJlc3VsdC5wYXRobmFtZSB8fCAnJztcbiAgICAgIHZhciBzID0gcmVzdWx0LnNlYXJjaCB8fCAnJztcbiAgICAgIHJlc3VsdC5wYXRoID0gcCArIHM7XG4gICAgfVxuICAgIHJlc3VsdC5zbGFzaGVzID0gcmVzdWx0LnNsYXNoZXMgfHwgcmVsYXRpdmUuc2xhc2hlcztcbiAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgdmFyIGlzU291cmNlQWJzID0gKHJlc3VsdC5wYXRobmFtZSAmJiByZXN1bHQucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycpLFxuICAgICAgaXNSZWxBYnMgPSAoXG4gICAgICAgICAgcmVsYXRpdmUuaG9zdCB8fFxuICAgICAgICAgIHJlbGF0aXZlLnBhdGhuYW1lICYmIHJlbGF0aXZlLnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nXG4gICAgICApLFxuICAgICAgbXVzdEVuZEFicyA9IChpc1JlbEFicyB8fCBpc1NvdXJjZUFicyB8fFxuICAgICAgICAgICAgICAgICAgICAocmVzdWx0Lmhvc3QgJiYgcmVsYXRpdmUucGF0aG5hbWUpKSxcbiAgICAgIHJlbW92ZUFsbERvdHMgPSBtdXN0RW5kQWJzLFxuICAgICAgc3JjUGF0aCA9IHJlc3VsdC5wYXRobmFtZSAmJiByZXN1bHQucGF0aG5hbWUuc3BsaXQoJy8nKSB8fCBbXSxcbiAgICAgIHJlbFBhdGggPSByZWxhdGl2ZS5wYXRobmFtZSAmJiByZWxhdGl2ZS5wYXRobmFtZS5zcGxpdCgnLycpIHx8IFtdLFxuICAgICAgcHN5Y2hvdGljID0gcmVzdWx0LnByb3RvY29sICYmICFzbGFzaGVkUHJvdG9jb2xbcmVzdWx0LnByb3RvY29sXTtcblxuICAvLyBpZiB0aGUgdXJsIGlzIGEgbm9uLXNsYXNoZWQgdXJsLCB0aGVuIHJlbGF0aXZlXG4gIC8vIGxpbmtzIGxpa2UgLi4vLi4gc2hvdWxkIGJlIGFibGVcbiAgLy8gdG8gY3Jhd2wgdXAgdG8gdGhlIGhvc3RuYW1lLCBhcyB3ZWxsLiAgVGhpcyBpcyBzdHJhbmdlLlxuICAvLyByZXN1bHQucHJvdG9jb2wgaGFzIGFscmVhZHkgYmVlbiBzZXQgYnkgbm93LlxuICAvLyBMYXRlciBvbiwgcHV0IHRoZSBmaXJzdCBwYXRoIHBhcnQgaW50byB0aGUgaG9zdCBmaWVsZC5cbiAgaWYgKHBzeWNob3RpYykge1xuICAgIHJlc3VsdC5ob3N0bmFtZSA9ICcnO1xuICAgIHJlc3VsdC5wb3J0ID0gbnVsbDtcbiAgICBpZiAocmVzdWx0Lmhvc3QpIHtcbiAgICAgIGlmIChzcmNQYXRoWzBdID09PSAnJykgc3JjUGF0aFswXSA9IHJlc3VsdC5ob3N0O1xuICAgICAgZWxzZSBzcmNQYXRoLnVuc2hpZnQocmVzdWx0Lmhvc3QpO1xuICAgIH1cbiAgICByZXN1bHQuaG9zdCA9ICcnO1xuICAgIGlmIChyZWxhdGl2ZS5wcm90b2NvbCkge1xuICAgICAgcmVsYXRpdmUuaG9zdG5hbWUgPSBudWxsO1xuICAgICAgcmVsYXRpdmUucG9ydCA9IG51bGw7XG4gICAgICBpZiAocmVsYXRpdmUuaG9zdCkge1xuICAgICAgICBpZiAocmVsUGF0aFswXSA9PT0gJycpIHJlbFBhdGhbMF0gPSByZWxhdGl2ZS5ob3N0O1xuICAgICAgICBlbHNlIHJlbFBhdGgudW5zaGlmdChyZWxhdGl2ZS5ob3N0KTtcbiAgICAgIH1cbiAgICAgIHJlbGF0aXZlLmhvc3QgPSBudWxsO1xuICAgIH1cbiAgICBtdXN0RW5kQWJzID0gbXVzdEVuZEFicyAmJiAocmVsUGF0aFswXSA9PT0gJycgfHwgc3JjUGF0aFswXSA9PT0gJycpO1xuICB9XG5cbiAgaWYgKGlzUmVsQWJzKSB7XG4gICAgLy8gaXQncyBhYnNvbHV0ZS5cbiAgICByZXN1bHQuaG9zdCA9IChyZWxhdGl2ZS5ob3N0IHx8IHJlbGF0aXZlLmhvc3QgPT09ICcnKSA/XG4gICAgICAgICAgICAgICAgICByZWxhdGl2ZS5ob3N0IDogcmVzdWx0Lmhvc3Q7XG4gICAgcmVzdWx0Lmhvc3RuYW1lID0gKHJlbGF0aXZlLmhvc3RuYW1lIHx8IHJlbGF0aXZlLmhvc3RuYW1lID09PSAnJykgP1xuICAgICAgICAgICAgICAgICAgICAgIHJlbGF0aXZlLmhvc3RuYW1lIDogcmVzdWx0Lmhvc3RuYW1lO1xuICAgIHJlc3VsdC5zZWFyY2ggPSByZWxhdGl2ZS5zZWFyY2g7XG4gICAgcmVzdWx0LnF1ZXJ5ID0gcmVsYXRpdmUucXVlcnk7XG4gICAgc3JjUGF0aCA9IHJlbFBhdGg7XG4gICAgLy8gZmFsbCB0aHJvdWdoIHRvIHRoZSBkb3QtaGFuZGxpbmcgYmVsb3cuXG4gIH0gZWxzZSBpZiAocmVsUGF0aC5sZW5ndGgpIHtcbiAgICAvLyBpdCdzIHJlbGF0aXZlXG4gICAgLy8gdGhyb3cgYXdheSB0aGUgZXhpc3RpbmcgZmlsZSwgYW5kIHRha2UgdGhlIG5ldyBwYXRoIGluc3RlYWQuXG4gICAgaWYgKCFzcmNQYXRoKSBzcmNQYXRoID0gW107XG4gICAgc3JjUGF0aC5wb3AoKTtcbiAgICBzcmNQYXRoID0gc3JjUGF0aC5jb25jYXQocmVsUGF0aCk7XG4gICAgcmVzdWx0LnNlYXJjaCA9IHJlbGF0aXZlLnNlYXJjaDtcbiAgICByZXN1bHQucXVlcnkgPSByZWxhdGl2ZS5xdWVyeTtcbiAgfSBlbHNlIGlmICghdXRpbC5pc051bGxPclVuZGVmaW5lZChyZWxhdGl2ZS5zZWFyY2gpKSB7XG4gICAgLy8ganVzdCBwdWxsIG91dCB0aGUgc2VhcmNoLlxuICAgIC8vIGxpa2UgaHJlZj0nP2ZvbycuXG4gICAgLy8gUHV0IHRoaXMgYWZ0ZXIgdGhlIG90aGVyIHR3byBjYXNlcyBiZWNhdXNlIGl0IHNpbXBsaWZpZXMgdGhlIGJvb2xlYW5zXG4gICAgaWYgKHBzeWNob3RpYykge1xuICAgICAgcmVzdWx0Lmhvc3RuYW1lID0gcmVzdWx0Lmhvc3QgPSBzcmNQYXRoLnNoaWZ0KCk7XG4gICAgICAvL29jY2F0aW9uYWx5IHRoZSBhdXRoIGNhbiBnZXQgc3R1Y2sgb25seSBpbiBob3N0XG4gICAgICAvL3RoaXMgZXNwZWNpYWxseSBoYXBwZW5zIGluIGNhc2VzIGxpa2VcbiAgICAgIC8vdXJsLnJlc29sdmVPYmplY3QoJ21haWx0bzpsb2NhbDFAZG9tYWluMScsICdsb2NhbDJAZG9tYWluMicpXG4gICAgICB2YXIgYXV0aEluSG9zdCA9IHJlc3VsdC5ob3N0ICYmIHJlc3VsdC5ob3N0LmluZGV4T2YoJ0AnKSA+IDAgP1xuICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuaG9zdC5zcGxpdCgnQCcpIDogZmFsc2U7XG4gICAgICBpZiAoYXV0aEluSG9zdCkge1xuICAgICAgICByZXN1bHQuYXV0aCA9IGF1dGhJbkhvc3Quc2hpZnQoKTtcbiAgICAgICAgcmVzdWx0Lmhvc3QgPSByZXN1bHQuaG9zdG5hbWUgPSBhdXRoSW5Ib3N0LnNoaWZ0KCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJlc3VsdC5zZWFyY2ggPSByZWxhdGl2ZS5zZWFyY2g7XG4gICAgcmVzdWx0LnF1ZXJ5ID0gcmVsYXRpdmUucXVlcnk7XG4gICAgLy90byBzdXBwb3J0IGh0dHAucmVxdWVzdFxuICAgIGlmICghdXRpbC5pc051bGwocmVzdWx0LnBhdGhuYW1lKSB8fCAhdXRpbC5pc051bGwocmVzdWx0LnNlYXJjaCkpIHtcbiAgICAgIHJlc3VsdC5wYXRoID0gKHJlc3VsdC5wYXRobmFtZSA/IHJlc3VsdC5wYXRobmFtZSA6ICcnKSArXG4gICAgICAgICAgICAgICAgICAgIChyZXN1bHQuc2VhcmNoID8gcmVzdWx0LnNlYXJjaCA6ICcnKTtcbiAgICB9XG4gICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGlmICghc3JjUGF0aC5sZW5ndGgpIHtcbiAgICAvLyBubyBwYXRoIGF0IGFsbC4gIGVhc3kuXG4gICAgLy8gd2UndmUgYWxyZWFkeSBoYW5kbGVkIHRoZSBvdGhlciBzdHVmZiBhYm92ZS5cbiAgICByZXN1bHQucGF0aG5hbWUgPSBudWxsO1xuICAgIC8vdG8gc3VwcG9ydCBodHRwLnJlcXVlc3RcbiAgICBpZiAocmVzdWx0LnNlYXJjaCkge1xuICAgICAgcmVzdWx0LnBhdGggPSAnLycgKyByZXN1bHQuc2VhcmNoO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQucGF0aCA9IG51bGw7XG4gICAgfVxuICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvLyBpZiBhIHVybCBFTkRzIGluIC4gb3IgLi4sIHRoZW4gaXQgbXVzdCBnZXQgYSB0cmFpbGluZyBzbGFzaC5cbiAgLy8gaG93ZXZlciwgaWYgaXQgZW5kcyBpbiBhbnl0aGluZyBlbHNlIG5vbi1zbGFzaHksXG4gIC8vIHRoZW4gaXQgbXVzdCBOT1QgZ2V0IGEgdHJhaWxpbmcgc2xhc2guXG4gIHZhciBsYXN0ID0gc3JjUGF0aC5zbGljZSgtMSlbMF07XG4gIHZhciBoYXNUcmFpbGluZ1NsYXNoID0gKFxuICAgICAgKHJlc3VsdC5ob3N0IHx8IHJlbGF0aXZlLmhvc3QgfHwgc3JjUGF0aC5sZW5ndGggPiAxKSAmJlxuICAgICAgKGxhc3QgPT09ICcuJyB8fCBsYXN0ID09PSAnLi4nKSB8fCBsYXN0ID09PSAnJyk7XG5cbiAgLy8gc3RyaXAgc2luZ2xlIGRvdHMsIHJlc29sdmUgZG91YmxlIGRvdHMgdG8gcGFyZW50IGRpclxuICAvLyBpZiB0aGUgcGF0aCB0cmllcyB0byBnbyBhYm92ZSB0aGUgcm9vdCwgYHVwYCBlbmRzIHVwID4gMFxuICB2YXIgdXAgPSAwO1xuICBmb3IgKHZhciBpID0gc3JjUGF0aC5sZW5ndGg7IGkgPj0gMDsgaS0tKSB7XG4gICAgbGFzdCA9IHNyY1BhdGhbaV07XG4gICAgaWYgKGxhc3QgPT09ICcuJykge1xuICAgICAgc3JjUGF0aC5zcGxpY2UoaSwgMSk7XG4gICAgfSBlbHNlIGlmIChsYXN0ID09PSAnLi4nKSB7XG4gICAgICBzcmNQYXRoLnNwbGljZShpLCAxKTtcbiAgICAgIHVwKys7XG4gICAgfSBlbHNlIGlmICh1cCkge1xuICAgICAgc3JjUGF0aC5zcGxpY2UoaSwgMSk7XG4gICAgICB1cC0tO1xuICAgIH1cbiAgfVxuXG4gIC8vIGlmIHRoZSBwYXRoIGlzIGFsbG93ZWQgdG8gZ28gYWJvdmUgdGhlIHJvb3QsIHJlc3RvcmUgbGVhZGluZyAuLnNcbiAgaWYgKCFtdXN0RW5kQWJzICYmICFyZW1vdmVBbGxEb3RzKSB7XG4gICAgZm9yICg7IHVwLS07IHVwKSB7XG4gICAgICBzcmNQYXRoLnVuc2hpZnQoJy4uJyk7XG4gICAgfVxuICB9XG5cbiAgaWYgKG11c3RFbmRBYnMgJiYgc3JjUGF0aFswXSAhPT0gJycgJiZcbiAgICAgICghc3JjUGF0aFswXSB8fCBzcmNQYXRoWzBdLmNoYXJBdCgwKSAhPT0gJy8nKSkge1xuICAgIHNyY1BhdGgudW5zaGlmdCgnJyk7XG4gIH1cblxuICBpZiAoaGFzVHJhaWxpbmdTbGFzaCAmJiAoc3JjUGF0aC5qb2luKCcvJykuc3Vic3RyKC0xKSAhPT0gJy8nKSkge1xuICAgIHNyY1BhdGgucHVzaCgnJyk7XG4gIH1cblxuICB2YXIgaXNBYnNvbHV0ZSA9IHNyY1BhdGhbMF0gPT09ICcnIHx8XG4gICAgICAoc3JjUGF0aFswXSAmJiBzcmNQYXRoWzBdLmNoYXJBdCgwKSA9PT0gJy8nKTtcblxuICAvLyBwdXQgdGhlIGhvc3QgYmFja1xuICBpZiAocHN5Y2hvdGljKSB7XG4gICAgcmVzdWx0Lmhvc3RuYW1lID0gcmVzdWx0Lmhvc3QgPSBpc0Fic29sdXRlID8gJycgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjUGF0aC5sZW5ndGggPyBzcmNQYXRoLnNoaWZ0KCkgOiAnJztcbiAgICAvL29jY2F0aW9uYWx5IHRoZSBhdXRoIGNhbiBnZXQgc3R1Y2sgb25seSBpbiBob3N0XG4gICAgLy90aGlzIGVzcGVjaWFsbHkgaGFwcGVucyBpbiBjYXNlcyBsaWtlXG4gICAgLy91cmwucmVzb2x2ZU9iamVjdCgnbWFpbHRvOmxvY2FsMUBkb21haW4xJywgJ2xvY2FsMkBkb21haW4yJylcbiAgICB2YXIgYXV0aEluSG9zdCA9IHJlc3VsdC5ob3N0ICYmIHJlc3VsdC5ob3N0LmluZGV4T2YoJ0AnKSA+IDAgP1xuICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lmhvc3Quc3BsaXQoJ0AnKSA6IGZhbHNlO1xuICAgIGlmIChhdXRoSW5Ib3N0KSB7XG4gICAgICByZXN1bHQuYXV0aCA9IGF1dGhJbkhvc3Quc2hpZnQoKTtcbiAgICAgIHJlc3VsdC5ob3N0ID0gcmVzdWx0Lmhvc3RuYW1lID0gYXV0aEluSG9zdC5zaGlmdCgpO1xuICAgIH1cbiAgfVxuXG4gIG11c3RFbmRBYnMgPSBtdXN0RW5kQWJzIHx8IChyZXN1bHQuaG9zdCAmJiBzcmNQYXRoLmxlbmd0aCk7XG5cbiAgaWYgKG11c3RFbmRBYnMgJiYgIWlzQWJzb2x1dGUpIHtcbiAgICBzcmNQYXRoLnVuc2hpZnQoJycpO1xuICB9XG5cbiAgaWYgKCFzcmNQYXRoLmxlbmd0aCkge1xuICAgIHJlc3VsdC5wYXRobmFtZSA9IG51bGw7XG4gICAgcmVzdWx0LnBhdGggPSBudWxsO1xuICB9IGVsc2Uge1xuICAgIHJlc3VsdC5wYXRobmFtZSA9IHNyY1BhdGguam9pbignLycpO1xuICB9XG5cbiAgLy90byBzdXBwb3J0IHJlcXVlc3QuaHR0cFxuICBpZiAoIXV0aWwuaXNOdWxsKHJlc3VsdC5wYXRobmFtZSkgfHwgIXV0aWwuaXNOdWxsKHJlc3VsdC5zZWFyY2gpKSB7XG4gICAgcmVzdWx0LnBhdGggPSAocmVzdWx0LnBhdGhuYW1lID8gcmVzdWx0LnBhdGhuYW1lIDogJycpICtcbiAgICAgICAgICAgICAgICAgIChyZXN1bHQuc2VhcmNoID8gcmVzdWx0LnNlYXJjaCA6ICcnKTtcbiAgfVxuICByZXN1bHQuYXV0aCA9IHJlbGF0aXZlLmF1dGggfHwgcmVzdWx0LmF1dGg7XG4gIHJlc3VsdC5zbGFzaGVzID0gcmVzdWx0LnNsYXNoZXMgfHwgcmVsYXRpdmUuc2xhc2hlcztcbiAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5VcmwucHJvdG90eXBlLnBhcnNlSG9zdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgaG9zdCA9IHRoaXMuaG9zdDtcbiAgdmFyIHBvcnQgPSBwb3J0UGF0dGVybi5leGVjKGhvc3QpO1xuICBpZiAocG9ydCkge1xuICAgIHBvcnQgPSBwb3J0WzBdO1xuICAgIGlmIChwb3J0ICE9PSAnOicpIHtcbiAgICAgIHRoaXMucG9ydCA9IHBvcnQuc3Vic3RyKDEpO1xuICAgIH1cbiAgICBob3N0ID0gaG9zdC5zdWJzdHIoMCwgaG9zdC5sZW5ndGggLSBwb3J0Lmxlbmd0aCk7XG4gIH1cbiAgaWYgKGhvc3QpIHRoaXMuaG9zdG5hbWUgPSBob3N0O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzU3RyaW5nOiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gdHlwZW9mKGFyZykgPT09ICdzdHJpbmcnO1xuICB9LFxuICBpc09iamVjdDogZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIHR5cGVvZihhcmcpID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG4gIH0sXG4gIGlzTnVsbDogZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIGFyZyA9PT0gbnVsbDtcbiAgfSxcbiAgaXNOdWxsT3JVbmRlZmluZWQ6IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiBhcmcgPT0gbnVsbDtcbiAgfVxufTtcbiJdfQ==
