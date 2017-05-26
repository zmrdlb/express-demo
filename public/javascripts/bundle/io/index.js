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
  _APP.toast.show(result.errmsg || '网络错误');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3Rvb2wvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInB1YmxpY1xcamF2YXNjcmlwdHNcXHBhZ2VcXGlvXFxpbmRleC5qcyIsInB1YmxpY1xcamF2YXNjcmlwdHNcXHBhZ2VcXGlvXFxtb2RlbC5qcyIsInB1YmxpY1xcamF2YXNjcmlwdHNcXHBhZ2VcXGlvXFxzdG9yYWdlLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcY29tbW9uXFxiYXNlLnZpZXcuanMiLCIuLi9ub2RlLWNvcmV1aS1wYy9qcy91aS91aS5hbGVydC5odG1sIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcdWlcXHVpLmFsZXJ0LmpzIiwiLi4vbm9kZS1jb3JldWktcGMvanMvdWkvdWkuY29uZmlybS5odG1sIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcdWlcXHVpLmNvbmZpcm0uanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx1aVxcdWkubGF5ZXIuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx1aVxcdWkubG9hZGluZy5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHVpXFx1aS50b2FzdC5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcaW9cXGludGVyaW8uanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXGlvXFxpb2NvbmZpZy5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcaW9cXHN0b3JhZ2UuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHVpXFxsYXllclxcYWxlcnQuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHVpXFxsYXllclxcYWxlcnRDb250cm9sLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1aVxcbGF5ZXJcXGFsZXJ0U2luZ2xlLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1aVxcbGF5ZXJcXGJhc2VDb250cm9sLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1aVxcbGF5ZXJcXGJvbWJMYXllci5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdWlcXGxheWVyXFxjb25maXJtLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1aVxcbGF5ZXJcXGNvbmZpcm1Db250cm9sLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1aVxcbGF5ZXJcXGNvbmZpcm1TaW5nbGUuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHVpXFxsYXllclxcbGF5ZXIuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHVpXFxsYXllclxcbWFzay5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdWlcXGxheWVyXFxwb3NpdGlvbkJvbWIuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHVpXFxsYXllclxcdHBsLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1dGlsXFxjc3NzdXBvcnQuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHV0aWxcXGRlbGF5ZXZ0LmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1dGlsXFxkZXZpY2VldnRuYW1lLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1dGlsXFxwdWJsaXNoZXJTLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1dGlsXFxyZXNpemUuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHV0aWxcXHJ3Y29udHJvbGxlci5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdXRpbFxcc2Nyb2xsLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1dGlsXFx0b29sLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1dGlsXFx3aW5yZXNpemUuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHV0aWxcXHdpbnNjcm9sbC5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdXRpbFxcd29ya2VyQ29udHJvbC5qcyIsIi4uL3Rvb2wvbm9kZV9tb2R1bGVzL3B1bnljb2RlL3B1bnljb2RlLmpzIiwiLi4vdG9vbC9ub2RlX21vZHVsZXMvcXVlcnlzdHJpbmctZXMzL2RlY29kZS5qcyIsIi4uL3Rvb2wvbm9kZV9tb2R1bGVzL3F1ZXJ5c3RyaW5nLWVzMy9lbmNvZGUuanMiLCIuLi90b29sL25vZGVfbW9kdWxlcy9xdWVyeXN0cmluZy1lczMvaW5kZXguanMiLCIuLi90b29sL25vZGVfbW9kdWxlcy91cmwvdXJsLmpzIiwiLi4vdG9vbC9ub2RlX21vZHVsZXMvdXJsL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQU0sUUFBUSxRQUFRLFlBQVIsQ0FBZDtBQUFBLElBQ00sV0FBVyxRQUFRLGVBQVIsQ0FEakI7O0FBR0EsU0FBUyxRQUFULENBQWtCO0FBQ2hCLFdBQU8saUJBQVU7QUFDYjs7Ozs7OztBQU9BLGNBQU0sUUFBTixDQUFlO0FBQ1gsa0JBQU0sRUFBQyxRQUFRLFFBQVQ7QUFDTjtBQUNBO0FBQ0E7QUFKVyxTQUFmLEVBS0U7QUFDRSxxQkFBUyxpQkFBUyxJQUFULEVBQWM7QUFDbkIsd0JBQVEsR0FBUixDQUFZLElBQVo7QUFDSDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVpGLFNBTEY7QUFtQkEsY0FBTSxJQUFOLENBQVc7QUFDUCxrQkFBTSxFQUFDLFFBQVEsUUFBVDtBQUNOO0FBQ0E7QUFDQTtBQUpPLFNBQVgsRUFLRTtBQUNFLG1CQUFPLGlCQUFVO0FBQ2Isd0JBQVEsR0FBUixDQUFZLGFBQVo7QUFDSDtBQUhILFNBTEYsRUFTRTtBQUNFLGdCQUFJO0FBRE4sU0FURjs7QUFjQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0g7QUFwRWUsQ0FBbEI7Ozs7O0FDSEE7Ozs7O0FBS0EsSUFBTSxXQUFXLFFBQVEsZ0JBQVIsQ0FBakI7QUFBQSxJQUNNLFVBQVUsUUFBUSxlQUFSLENBRGhCO0FBQUEsSUFFTSxVQUFVLFFBQVEsV0FBUixDQUZoQjtBQUdDOzs7QUFHQSxTQUFTLEtBQVQsQ0FBZSxNQUFmLEdBQXdCLFVBQVMsTUFBVCxFQUFnQjtBQUNwQyxTQUFPLE9BQU8sSUFBUCxJQUFlLE9BQXRCO0FBQ0gsQ0FGRDtBQUdBLFNBQVMsS0FBVCxDQUFlLEdBQWYsR0FBcUIsbUJBQXJCOztBQUdBOzs7QUFHQSxTQUFTLElBQVQsQ0FBYyxNQUFkLEdBQXVCLFVBQVMsTUFBVCxFQUFpQjtBQUNwQyxTQUFPLE9BQU8sSUFBUCxJQUFlLE9BQXRCO0FBQ0gsQ0FGRDtBQUdBLFNBQVMsTUFBVCxDQUFnQixJQUFoQixHQUF1QixVQUFTLE1BQVQsRUFBZ0I7QUFDbkMsT0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixPQUFPLE1BQVAsSUFBaUIsTUFBakM7QUFDSCxDQUZEO0FBR0EsU0FBUyxNQUFULENBQWdCLEtBQWhCLEdBQXdCLFVBQVMsS0FBVCxFQUFnQixVQUFoQixFQUE0QixXQUE1QixFQUF3QztBQUM1RCxPQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLGNBQWMsTUFBOUI7QUFDSCxDQUZEOztBQUlBLFNBQVMsTUFBVCxDQUFnQixVQUFoQixHQUE2QixZQUFVO0FBQ3BDO0FBQ0EsVUFBUSxHQUFSLENBQVksTUFBWjtBQUNGLENBSEQ7QUFJQSxTQUFTLE1BQVQsQ0FBZ0IsUUFBaEIsR0FBMkIsWUFBVTtBQUNsQztBQUNBLFVBQVEsR0FBUixDQUFZLE1BQVo7QUFDRixDQUhEOztBQUtBO0FBQ0EsU0FBUyxNQUFULENBQWdCLFdBQWhCLEdBQThCLElBQTlCO0FBQ0E7OztBQUdBLElBQUksV0FBVyx1QkFBZjs7QUFFQTs7Ozs7QUFLQSxTQUFTLFFBQVQsQ0FBa0IsR0FBbEIsRUFBc0IsSUFBdEIsRUFBMkIsUUFBM0IsRUFBb0M7QUFDaEMsTUFBSSxNQUFNLGtCQUFWO0FBQ0EsU0FBTyxJQUFJLE9BQUosQ0FBWSxHQUFaLEVBQWlCLFVBQVUsR0FBVixFQUFlLEdBQWYsRUFBb0I7QUFDeEMsV0FBTyxXQUFVLG1CQUFtQixLQUFLLEdBQUwsQ0FBbkIsQ0FBVixHQUF5QyxLQUFLLEdBQUwsQ0FBaEQ7QUFDSCxHQUZNLENBQVA7QUFHSDtBQUNEOzs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBLE9BQU8sT0FBUCxHQUFpQjtBQUNiOzs7Ozs7QUFNQSxRQUFNLGNBQVMsTUFBVCxFQUFnQixNQUFoQixFQUF1QixPQUF2QixFQUErQjtBQUNqQyxRQUFJLE9BQU8sU0FBUyxXQUFTLHlCQUFsQixFQUE0QyxPQUE1QyxFQUFvRCxJQUFwRCxDQUFYO0FBQ0EsWUFBUSxZQUFSLENBQXFCLEVBQUUsTUFBRixDQUFTO0FBQzFCLFdBQUssSUFEcUI7QUFFMUIsY0FBTztBQUZtQixLQUFULEVBR25CLE1BSG1CLENBQXJCLEVBR1UsTUFIVjtBQUlILEdBYlk7QUFjYjs7O0FBR0EsWUFBVSxrQkFBUyxNQUFULEVBQWdCLE1BQWhCLEVBQXVCO0FBQzdCLFlBQVEsWUFBUixDQUFxQixFQUFFLE1BQUYsQ0FBUztBQUMxQixXQUFLLFdBQVMsV0FEWTtBQUUxQixjQUFPLE1BRm1CO0FBRzFCOzs7Ozs7QUFNQSxvQkFBYztBQUNWLGlCQUFTLFFBQVEsUUFEUCxDQUNnQjtBQUMxQjtBQUNBO0FBQ0E7QUFKVTtBQVRZLEtBQVQsRUFlbkIsTUFmbUIsQ0FBckIsRUFlVSxNQWZWO0FBZ0JILEdBbENZOztBQW9DYjtBQUNBLFlBQVUsT0FyQ0c7QUFzQ2IsWUFBVTtBQXRDRyxDQUFqQjs7Ozs7QUN6RUQ7Ozs7Ozs7QUFPQSxJQUFNLFVBQVUsUUFBUSxlQUFSLENBQWhCOztBQUVDOzs7O0FBSUE7O0FBRUQsT0FBTyxPQUFQLEdBQWlCO0FBQ1osWUFBVSxRQUFRLE1BQVIsQ0FBZTtBQUNyQixZQUFRLElBRGEsRUFDUDtBQUNkLFNBQUs7QUFGZ0IsR0FBZixDQURFO0FBS1osZUFBYSxRQUFRLE1BQVIsQ0FBZTtBQUN4QixZQUFRLE1BRGdCLEVBQ1I7QUFDaEIsU0FBSztBQUZtQixHQUFmO0FBTEQsQ0FBakI7Ozs7Ozs7OztBQ2ZBOzs7Ozs7O0FBT0MsSUFBTSxRQUFRLFFBQVEsbUJBQVIsQ0FBZDtBQUFBLElBQ00sVUFBVSxRQUFRLHFCQUFSLENBRGhCO0FBQUEsSUFFTSxRQUFRLFFBQVEsbUJBQVIsQ0FGZDtBQUFBLElBR00sVUFBVSxRQUFRLHFCQUFSLENBSGhCO0FBQUEsSUFJTSxPQUFPLFFBQVEsY0FBUixDQUpiOztJQU1LLFE7QUFDRix3QkFBYTtBQUFBOztBQUNULGFBQUssSUFBTCxHQUFZLFFBQVo7QUFDQTtBQUNBLGVBQU8sSUFBUCxHQUFjLEVBQWQ7QUFDQSxhQUFLLEtBQUwsR0FBYSxLQUFiO0FBQ0EsYUFBSyxPQUFMLEdBQWUsT0FBZjtBQUNBLGFBQUssS0FBTCxHQUFhLEtBQWI7QUFDQSxhQUFLLE9BQUwsR0FBZSxPQUFmO0FBQ0EsYUFBSyxJQUFMLEdBQVksSUFBWjtBQUNIOzs7OytCQUVLO0FBQ0YsaUJBQUssS0FBTDtBQUNIOztBQUVEOzs7Ozs7Ozs7OztpQ0FRZ0IsRyxFQUFJO0FBQ2hCLGdCQUFJLElBQUksSUFBSSxJQUFKLEVBQVI7QUFDQSxpQkFBSSxJQUFJLEdBQVIsSUFBZSxHQUFmLEVBQW1CO0FBQ2Ysa0JBQUUsR0FBRixJQUFTLElBQUksR0FBSixDQUFUO0FBQ0g7O0FBRUQ7QUFDQSxjQUFFLElBQUY7O0FBRUEsbUJBQU8sQ0FBUDtBQUNIOzs7Ozs7QUFHTCxPQUFPLE9BQVAsR0FBaUIsUUFBakI7OztBQ2xEQTtBQUNBOzs7O0FDREE7Ozs7Ozs7QUFPQyxJQUFNLGNBQWMsUUFBUSxzQkFBUixDQUFwQjtBQUFBLElBQ08sWUFBWSxRQUFRLG1CQUFSLENBRG5CO0FBQUEsSUFFTyxNQUFNLFFBQVEsaUJBQVIsQ0FGYjs7QUFJRCxZQUFZLFdBQVosR0FBMEIsS0FBMUI7O0FBRUEsWUFBWSxTQUFaLENBQXNCO0FBQ2xCLFdBQU87QUFDSCxtQkFBVyx3REFEUjtBQUVILGdCQUFRO0FBQ0osa0JBQU0sY0FBUyxLQUFULEVBQWU7QUFDakIsc0JBQU0sV0FBTixDQUFrQixTQUFsQixFQUE2QixRQUE3QixDQUFzQyxTQUF0QztBQUNBLG9CQUFHLFVBQVUsVUFBYixFQUF3QjtBQUNwQiwrQkFBVyxZQUFVO0FBQ2pCLDhCQUFNLElBQU47QUFDQSxvQ0FBWSxPQUFaO0FBQ0gscUJBSEQsRUFHRSxHQUhGO0FBSUgsaUJBTEQsTUFLSztBQUNELDBCQUFNLElBQU47QUFDQSxnQ0FBWSxPQUFaO0FBQ0g7QUFDSjtBQVpHO0FBRkwsS0FEVztBQWtCbEIsVUFBTTtBQUNGLG1CQUFXLGVBRFQ7QUFFRixpQkFBUyxVQUFVLFVBQVYsR0FBc0IsQ0FBdEIsR0FBeUIsR0FGaEM7QUFHRixnQkFBUTtBQUNKLGtCQUFNLGNBQVMsSUFBVCxFQUFjO0FBQ2hCLG9CQUFHLFVBQVUsVUFBYixFQUF3QjtBQUNwQix5QkFBSyxHQUFMLENBQVMsU0FBVCxFQUFtQixDQUFuQjtBQUNBLCtCQUFXLFlBQVU7QUFDakIsNkJBQUssSUFBTDtBQUNILHFCQUZELEVBRUUsR0FGRjtBQUdILGlCQUxELE1BS0s7QUFDRCx5QkFBSyxJQUFMO0FBQ0g7QUFDSixhQVZHO0FBV0osa0JBQU0sY0FBUyxJQUFULEVBQWM7QUFDaEIsb0JBQUcsVUFBVSxVQUFiLEVBQXdCO0FBQ3BCLHlCQUFLLElBQUwsR0FBWSxHQUFaLENBQWdCLFNBQWhCLEVBQTBCLEdBQTFCO0FBQ0gsaUJBRkQsTUFFSztBQUNELHlCQUFLLElBQUw7QUFDSDtBQUNKO0FBakJHO0FBSE4sS0FsQlk7QUF5Q2xCLFdBQU87QUFDSCxrQkFBVTtBQURQO0FBekNXLENBQXRCOztBQThDQSxZQUFZLFNBQVosQ0FBc0IsR0FBdEIsQ0FBMEIsVUFBUyxRQUFULEVBQWtCO0FBQ3hDLGFBQVMsS0FBVCxDQUFlLFFBQWYsQ0FBd0IsU0FBeEI7O0FBRUEsYUFBUyxHQUFULENBQWEsTUFBYixDQUFvQixHQUFwQixDQUF3QixZQUFVO0FBQzlCLGlCQUFTLEtBQVQsQ0FBZSxXQUFmLENBQTJCLFNBQTNCLEVBQXNDLFFBQXRDLENBQStDLFNBQS9DO0FBQ0gsS0FGRDtBQUdILENBTkQ7O0FBUUEsT0FBTyxPQUFQLEdBQWlCLFdBQWpCOzs7QUNuRUE7QUFDQTs7OztBQ0RBOzs7Ozs7O0FBT0MsSUFBTSxnQkFBZ0IsUUFBUSx3QkFBUixDQUF0QjtBQUFBLElBQ08sWUFBWSxRQUFRLG1CQUFSLENBRG5CO0FBQUEsSUFFTyxNQUFNLFFBQVEsbUJBQVIsQ0FGYjs7QUFJRCxjQUFjLFdBQWQsR0FBNEIsS0FBNUI7O0FBRUEsY0FBYyxTQUFkLENBQXdCO0FBQ3BCLFdBQU87QUFDSCxtQkFBVywwREFEUjtBQUVILGdCQUFRO0FBQ0osa0JBQU0sY0FBUyxLQUFULEVBQWU7QUFDakIsc0JBQU0sV0FBTixDQUFrQixTQUFsQixFQUE2QixRQUE3QixDQUFzQyxTQUF0QztBQUNBLG9CQUFHLFVBQVUsVUFBYixFQUF3QjtBQUNwQiwrQkFBVyxZQUFVO0FBQ2pCLDhCQUFNLElBQU47QUFDQSxzQ0FBYyxPQUFkO0FBQ0gscUJBSEQsRUFHRSxHQUhGO0FBSUgsaUJBTEQsTUFLSztBQUNELDBCQUFNLElBQU47QUFDQSxrQ0FBYyxPQUFkO0FBQ0g7QUFDSjtBQVpHO0FBRkwsS0FEYTtBQWtCcEIsVUFBTTtBQUNGLG1CQUFXLGVBRFQ7QUFFRixpQkFBUyxVQUFVLFVBQVYsR0FBc0IsQ0FBdEIsR0FBeUIsR0FGaEM7QUFHRixnQkFBUTtBQUNKLGtCQUFNLGNBQVMsSUFBVCxFQUFjO0FBQ2hCLG9CQUFHLFVBQVUsVUFBYixFQUF3QjtBQUNwQix5QkFBSyxHQUFMLENBQVMsU0FBVCxFQUFtQixDQUFuQjtBQUNBLCtCQUFXLFlBQVU7QUFDakIsNkJBQUssSUFBTDtBQUNILHFCQUZELEVBRUUsR0FGRjtBQUdILGlCQUxELE1BS0s7QUFDRCx5QkFBSyxJQUFMO0FBQ0g7QUFDSixhQVZHO0FBV0osa0JBQU0sY0FBUyxJQUFULEVBQWM7QUFDaEIsb0JBQUcsVUFBVSxVQUFiLEVBQXdCO0FBQ3BCLHlCQUFLLElBQUwsR0FBWSxHQUFaLENBQWdCLFNBQWhCLEVBQTBCLEdBQTFCO0FBQ0gsaUJBRkQsTUFFSztBQUNELHlCQUFLLElBQUw7QUFDSDtBQUNKO0FBakJHO0FBSE4sS0FsQmM7QUF5Q3BCLGFBQVM7QUFDTCxrQkFBVTtBQURMO0FBekNXLENBQXhCOztBQThDQSxjQUFjLFNBQWQsQ0FBd0IsR0FBeEIsQ0FBNEIsVUFBUyxRQUFULEVBQWtCO0FBQzFDLGFBQVMsS0FBVCxDQUFlLFFBQWYsQ0FBd0IsU0FBeEI7O0FBRUEsYUFBUyxHQUFULENBQWEsTUFBYixDQUFvQixHQUFwQixDQUF3QixZQUFVO0FBQzlCLGlCQUFTLEtBQVQsQ0FBZSxXQUFmLENBQTJCLFNBQTNCLEVBQXNDLFFBQXRDLENBQStDLFNBQS9DO0FBQ0gsS0FGRDtBQUdILENBTkQ7O0FBUUEsT0FBTyxPQUFQLEdBQWlCLGFBQWpCOzs7Ozs7Ozs7Ozs7O0FDbkVBOzs7Ozs7O0FBT0MsSUFBTSxZQUFZLFFBQVEsb0JBQVIsQ0FBbEI7QUFBQSxJQUNPLFlBQVksUUFBUSxtQkFBUixDQURuQjs7SUFHSyxPOzs7QUFDRjs7Ozs7Ozs7Ozs7OztBQWFBLHFCQUFZLE1BQVosRUFBbUI7QUFBQTs7QUFDZjtBQUNBLGlCQUFTLEVBQUUsTUFBRixDQUFTLElBQVQsRUFBYztBQUNuQixtQkFBTztBQUNILDJCQUFXLGdCQURSO0FBRUgsc0JBQU0sS0FGSDtBQUdILHdCQUFRO0FBQ0osMEJBQU0sY0FBUyxLQUFULEVBQWU7QUFDakIsOEJBQU0sV0FBTixDQUFrQixTQUFsQixFQUE2QixRQUE3QixDQUFzQyxTQUF0QztBQUNBLDRCQUFHLFVBQVUsVUFBYixFQUF3QjtBQUNwQix1Q0FBVyxZQUFVO0FBQ2pCLHNDQUFNLElBQU47QUFDQSxzQ0FBTSxZQUFOLENBQW1CLElBQW5CLEdBRmlCLENBRVU7QUFDOUIsNkJBSEQsRUFHRSxHQUhGO0FBSUgseUJBTEQsTUFLSztBQUNELGtDQUFNLElBQU47QUFDQSxrQ0FBTSxZQUFOLENBQW1CLElBQW5CLEdBRkMsQ0FFMEI7QUFDOUI7QUFDSjtBQVpHO0FBSEwsYUFEWTtBQW1CbkIsa0JBQU07QUFDRiwyQkFBVyxlQURUO0FBRUYseUJBQVMsVUFBVSxVQUFWLEdBQXNCLENBQXRCLEdBQXlCLEdBRmhDO0FBR0Ysd0JBQVE7QUFDSiwwQkFBTSxjQUFTLElBQVQsRUFBYztBQUNoQiw0QkFBRyxVQUFVLFVBQWIsRUFBd0I7QUFDcEIsaUNBQUssR0FBTCxDQUFTLFNBQVQsRUFBbUIsQ0FBbkI7QUFDQSx1Q0FBVyxZQUFVO0FBQ2pCLHFDQUFLLElBQUw7QUFDSCw2QkFGRCxFQUVFLEdBRkY7QUFHSCx5QkFMRCxNQUtLO0FBQ0QsaUNBQUssSUFBTDtBQUNIO0FBQ0oscUJBVkc7QUFXSiwwQkFBTSxjQUFTLElBQVQsRUFBYztBQUNoQiw0QkFBRyxVQUFVLFVBQWIsRUFBd0I7QUFDcEIsaUNBQUssSUFBTCxHQUFZLEdBQVosQ0FBZ0IsU0FBaEIsRUFBMEIsR0FBMUI7QUFDSCx5QkFGRCxNQUVLO0FBQ0QsaUNBQUssSUFBTDtBQUNIO0FBQ0o7QUFqQkc7QUFITjtBQW5CYSxTQUFkLEVBMENQLFVBQVUsRUExQ0gsQ0FBVDs7QUFGZSx1SEE4Q1QsTUE5Q1M7O0FBK0NmLFlBQUksY0FBSjtBQUNBLFlBQUksU0FBUyxPQUFLLEtBQWxCOztBQUVBLGVBQU8sUUFBUCxDQUFnQixTQUFoQjs7QUFFQSxlQUFLLEdBQUwsQ0FBUyxNQUFULENBQWdCLEdBQWhCLENBQW9CLFlBQVU7QUFDMUIsbUJBQU8sV0FBUCxDQUFtQixTQUFuQixFQUE4QixRQUE5QixDQUF1QyxTQUF2QztBQUNILFNBRkQ7QUFwRGU7QUF1RGxCOzs7OytCQUVLO0FBQ0YsZ0JBQUcsS0FBSyxNQUFMLEVBQUgsRUFBaUI7QUFDdEIscUJBQUssYUFBTCxDQUFtQixJQUFuQixHQURzQixDQUNLO0FBQzNCLHFCQUFLLElBQUwsSUFBYSxLQUFLLElBQUwsQ0FBVSxJQUFWLEVBQWI7QUFDQSxxQkFBSyxLQUFMO0FBQ0E7QUFDRTs7OztFQTdFaUIsUzs7QUFnRnRCLE9BQU8sT0FBUCxHQUFpQixPQUFqQjs7Ozs7QUMxRkE7Ozs7OztBQU1DLElBQU0sVUFBVSxRQUFRLGVBQVIsQ0FBaEI7QUFBQSxJQUNPLGdCQUFnQixRQUFRLHVCQUFSLENBRHZCOztBQUdELElBQUksZ0JBQWdCLElBQUksYUFBSixFQUFwQjs7QUFFQSxTQUFTLGFBQVQsQ0FBdUIsTUFBdkIsRUFBOEI7QUFDMUIsV0FBTyxPQUFQLEdBQWlCLElBQUksT0FBSixDQUFZO0FBQ3pCLGVBQU87QUFDSCx1QkFBVztBQURSLFNBRGtCO0FBSXpCLGNBQU07QUFDRixxQkFBUyxhQURQLENBQ3FCO0FBRHJCO0FBSm1CLEtBQVosQ0FBakI7O0FBU0EsV0FBTyxPQUFQLENBQWUsWUFBZixDQUE0QixHQUE1QixDQUFnQyxZQUFVO0FBQ3RDLGVBQU8sT0FBUCxDQUFlLE9BQWY7QUFDQSxlQUFPLE9BQVAsR0FBaUIsSUFBakI7QUFDSCxLQUhEOztBQUtBLFdBQU8sT0FBTyxPQUFkO0FBQ0g7O0FBR0QsT0FBTyxPQUFQLEdBQWlCO0FBQ2IsVUFBTSxnQkFBVTtBQUNaLFlBQUksVUFBVSxjQUFjLGNBQWMsR0FBZCxFQUFkLENBQWQ7QUFDQSxnQkFBUSxJQUFSO0FBQ0gsS0FKWTtBQUtiLFVBQU0sZ0JBQVU7QUFDWixZQUFJLFNBQVMsY0FBYyxHQUFkLEVBQWI7QUFDQSxZQUFHLE1BQUgsRUFBVTtBQUNOLG1CQUFPLE9BQVAsQ0FBZSxJQUFmO0FBQ0g7QUFDSjtBQVZZLENBQWpCOzs7OztBQzlCQTs7Ozs7O0FBTUMsSUFBTSxVQUFVLFFBQVEsZUFBUixDQUFoQjtBQUFBLElBQ08sZ0JBQWdCLFFBQVEsdUJBQVIsQ0FEdkI7O0FBR0QsSUFBSSxnQkFBZ0IsSUFBSSxhQUFKLEVBQXBCOztBQUVBLFNBQVMsV0FBVCxDQUFxQixNQUFyQixFQUE0QjtBQUN4QixXQUFPLEtBQVAsR0FBZSxJQUFJLE9BQUosQ0FBWTtBQUN2QixlQUFPO0FBQ0gsdUJBQVc7QUFEUixTQURnQjtBQUl2QixjQUFNO0FBQ0YscUJBQVMsTUFEUCxDQUNjO0FBRGQ7QUFKaUIsS0FBWixDQUFmOztBQVNBLFdBQU8sS0FBUCxDQUFhLFlBQWIsQ0FBMEIsR0FBMUIsQ0FBOEIsWUFBVTtBQUNwQyxlQUFPLEtBQVAsQ0FBYSxPQUFiO0FBQ0EsZUFBTyxLQUFQLEdBQWUsSUFBZjtBQUNILEtBSEQ7O0FBS0EsV0FBTyxPQUFPLEtBQWQ7QUFDSDs7QUFHRCxPQUFPLE9BQVAsR0FBaUI7QUFDYixVQUFNLGNBQVMsT0FBVCxFQUFpQixZQUFqQixFQUE4QjtBQUNoQyxZQUFJLFFBQVEsWUFBWSxjQUFjLEdBQWQsRUFBWixDQUFaO0FBQ0EsY0FBTSxVQUFOLENBQWlCLE9BQWpCO0FBQ0EsY0FBTSxZQUFOLENBQW1CLEdBQW5CLENBQXVCLFlBQVU7QUFDN0IsZ0JBQUcsT0FBTyxZQUFQLElBQXVCLFVBQTFCLEVBQXFDO0FBQ2pDO0FBQ0g7QUFDSixTQUpEO0FBS0EsY0FBTSxJQUFOO0FBQ0EsbUJBQVcsWUFBVTtBQUNqQixrQkFBTSxJQUFOO0FBQ0gsU0FGRCxFQUVFLElBRkY7QUFHSDtBQWJZLENBQWpCOzs7OztBQzlCQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFtQ0EsSUFBTSxXQUFXLFFBQVEsZUFBUixDQUFqQjtBQUFBLElBQ0UsVUFBVSxRQUFRLGNBQVIsQ0FEWjs7QUFHQTtBQUNBLFNBQVMsV0FBVCxHQUFzQjtBQUNyQixNQUFLLEtBQUwsR0FBYSxFQUFiLENBRHFCLENBQ0o7QUFDakIsTUFBSyxTQUFMLEdBQWlCLEtBQWpCLENBRnFCLENBRUc7QUFDeEIsTUFBSyxRQUFMLEdBQWdCLFlBQVUsQ0FBRSxDQUE1QixDQUhxQixDQUdTO0FBQzlCO0FBQ0Q7QUFDQSxZQUFZLFNBQVosQ0FBc0IsT0FBdEIsR0FBZ0MsWUFBVTtBQUN6QyxLQUFHLEtBQUssS0FBTCxDQUFXLE1BQVgsSUFBcUIsQ0FBeEIsRUFBMEI7QUFDekIsT0FBSyxTQUFMLEdBQWlCLEtBQWpCO0FBQ0EsTUFBRyxPQUFPLEtBQUssUUFBWixJQUF3QixVQUEzQixFQUFzQztBQUNyQyxRQUFLLFFBQUw7QUFDQTtBQUNEO0FBQ0E7QUFDRCxLQUFJLE1BQU0sS0FBSyxLQUFMLENBQVcsS0FBWCxFQUFWO0FBQ0EsTUFBSyxPQUFMLENBQWEsR0FBYixFQUFpQixJQUFqQjtBQUNBLENBVkQ7QUFXQTs7Ozs7QUFLQSxZQUFZLFNBQVosQ0FBc0IsT0FBdEIsR0FBZ0MsVUFBUyxHQUFULEVBQWEsT0FBYixFQUFxQjtBQUNwRCxLQUFHLEtBQUssU0FBTCxJQUFrQixDQUFDLE9BQXRCLEVBQThCO0FBQzdCLE9BQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsR0FBaEI7QUFDQTtBQUNBO0FBQ0QsTUFBSyxTQUFMLEdBQWlCLElBQWpCO0FBQ0EsU0FBUSxHQUFSO0FBQ0EsQ0FQRDtBQVFBOzs7QUFHQSxJQUFJLGVBQWU7QUFDbEIsYUFBWSxFQURNLEVBQ0Y7QUFDaEIsTUFBSyxlQUFVO0FBQUU7QUFDaEIsTUFBSSxXQUFXLElBQWY7QUFDQSxNQUFJLFlBQVksS0FBSyxVQUFyQjtBQUNBLE9BQUksSUFBSSxJQUFJLENBQVIsRUFBVyxNQUFNLFVBQVUsTUFBL0IsRUFBdUMsSUFBSSxHQUEzQyxFQUFnRCxHQUFoRCxFQUFvRDtBQUNuRCxPQUFHLFVBQVUsQ0FBVixFQUFhLFNBQWIsSUFBMEIsS0FBMUIsSUFBbUMsVUFBVSxDQUFWLEVBQWEsSUFBYixJQUFxQixLQUEzRCxFQUFpRTtBQUFFO0FBQ2xFLGNBQVUsQ0FBVixFQUFhLElBQWIsR0FBb0IsSUFBcEI7QUFDQSxlQUFXLFVBQVUsQ0FBVixDQUFYO0FBQ0E7QUFDQTtBQUNEO0FBQ0QsTUFBRyxZQUFZLElBQWYsRUFBb0I7QUFDbkIsY0FBVyxJQUFJLFdBQUosRUFBWDtBQUNBLFlBQVMsSUFBVCxHQUFnQixJQUFoQjtBQUNBLFFBQUssVUFBTCxDQUFnQixJQUFoQixDQUFxQixRQUFyQjtBQUNBO0FBQ0QsU0FBTyxRQUFQO0FBQ0EsRUFsQmlCO0FBbUJsQixNQUFLLGFBQVMsS0FBVCxFQUFlO0FBQUU7QUFDckIsTUFBSSxZQUFZLEtBQUssVUFBckI7QUFDQSxPQUFJLElBQUksSUFBSSxDQUFSLEVBQVcsTUFBTSxVQUFVLE1BQS9CLEVBQXVDLElBQUksR0FBM0MsRUFBZ0QsR0FBaEQsRUFBb0Q7QUFDbkQsT0FBRyxVQUFVLENBQVYsS0FBZ0IsS0FBbkIsRUFBeUI7QUFBRTtBQUMxQixjQUFVLENBQVYsRUFBYSxJQUFiLEdBQW9CLEtBQXBCO0FBQ0E7QUFDQTtBQUNEO0FBQ0Q7QUEzQmlCLENBQW5CO0FBNkJBOzs7Ozs7QUFNQSxTQUFTLE1BQVQsQ0FBZ0IsTUFBaEIsRUFBdUIsTUFBdkIsRUFBOEIsUUFBOUIsRUFBdUM7QUFDdEMsS0FBSSxVQUFVLEVBQWQ7QUFBQSxLQUFrQixVQUFVLEVBQTVCO0FBQ0EsR0FBRSxNQUFGLENBQVMsSUFBVCxFQUFjLE9BQWQsRUFBc0IsU0FBUyxNQUEvQixFQUFzQyxNQUF0QztBQUNBLEdBQUUsTUFBRixDQUFTLElBQVQsRUFBYyxPQUFkLEVBQXNCLFNBQVMsTUFBL0IsRUFBc0MsTUFBdEM7QUFDQSxVQUFTLE1BQVQsQ0FBZ0IsT0FBaEI7QUFDQSxLQUFJLGFBQWEsUUFBUSxPQUF6QjtBQUNBLEtBQUksY0FBYyxRQUFRLFFBQTFCO0FBQ0EsS0FBSSxZQUFZLFFBQVEsWUFBUixDQUFxQixTQUFyQztBQUNBLEtBQUksV0FBVyxRQUFRLFlBQVIsQ0FBcUIsUUFBcEM7QUFDQSxLQUFJLFdBQVcsUUFBUSxZQUFSLENBQXFCLFFBQXBDO0FBQ0EsU0FBUSxPQUFSLEdBQWtCLFVBQVMsSUFBVCxFQUFlLFVBQWYsRUFBMkIsS0FBM0IsRUFBaUM7QUFBRTtBQUNwRCxNQUFHLGFBQWEsT0FBTyxTQUFTLEtBQVQsQ0FBZSxNQUF0QixJQUFnQyxVQUFoRCxFQUEyRDtBQUFFO0FBQzVELE9BQUcsU0FBUyxLQUFULENBQWUsTUFBZixDQUFzQixJQUF0QixDQUFILEVBQStCO0FBQUU7QUFDN0IsUUFBRyxTQUFTLEtBQVQsQ0FBZSxHQUFmLElBQXNCLEVBQXpCLEVBQTRCO0FBQUU7QUFDMUIsU0FBSSxXQUFXLFNBQVMsS0FBVCxDQUFlLEdBQTlCO0FBQ1MsU0FBSSxTQUFTLFNBQVMsS0FBVCxDQUFlLEdBQWYsR0FBbUIsR0FBbkIsR0FBdUIsbUJBQW1CLFNBQVMsSUFBNUIsQ0FBcEM7QUFDQSxTQUFHLFNBQVMsV0FBVCxDQUFxQixHQUFyQixLQUE2QixDQUFDLENBQWpDLEVBQW1DO0FBQy9CLGlCQUFXLFNBQVMsT0FBVCxDQUFpQixJQUFqQixFQUFzQixNQUFJLE1BQTFCLENBQVg7QUFDSCxNQUZELE1BR0k7QUFDQSxpQkFBVyxXQUFTLEdBQVQsR0FBYSxNQUF4QjtBQUNIO0FBQ0QsY0FBUyxJQUFULEdBQWdCLFFBQWhCO0FBQ0E7QUFDWixLQVhELE1BV00sSUFBRyxPQUFPLFNBQVMsS0FBVCxDQUFlLElBQXRCLElBQThCLFVBQWpDLEVBQTRDO0FBQzlDLGNBQVMsS0FBVCxDQUFlLElBQWYsQ0FBb0IsSUFBcEI7QUFDQTtBQUNIO0FBQ0o7QUFDRDtBQUNELE1BQUcsWUFBWSxPQUFPLFNBQVMsSUFBVCxDQUFjLE1BQXJCLElBQStCLFVBQTlDLEVBQXlEO0FBQUU7QUFDdkQsT0FBRyxTQUFTLElBQVQsQ0FBYyxNQUFkLENBQXFCLElBQXJCLENBQUgsRUFBOEI7QUFBRTtBQUM1QixRQUFHLE9BQU8sUUFBUSxTQUFTLElBQVQsQ0FBYyxPQUF0QixDQUFQLElBQXlDLFVBQTVDLEVBQXVEO0FBQ25ELGFBQVEsU0FBUyxJQUFULENBQWMsT0FBdEIsRUFBK0IsSUFBL0IsRUFBcUMsVUFBckMsRUFBaUQsS0FBakQ7QUFDSDtBQUNKLElBSkQsTUFJSztBQUFFO0FBQ0gsUUFBRyxRQUFILEVBQVk7QUFBRTtBQUNWLFlBQU8sVUFBUCxJQUFxQixVQUFyQixJQUFtQyxXQUFXLFFBQVEsUUFBUixDQUFpQixJQUFqQixFQUF1QixVQUF2QixFQUFtQyxLQUFuQyxDQUFYLEVBQXNELFVBQXRELEVBQWtFLEtBQWxFLENBQW5DO0FBQ0gsS0FGRCxNQUVLO0FBQ0QsWUFBTyxVQUFQLElBQXFCLFVBQXJCLElBQW1DLFdBQVcsSUFBWCxFQUFpQixVQUFqQixFQUE2QixLQUE3QixDQUFuQztBQUNIO0FBQ0o7QUFDSixHQVpELE1BWUs7QUFDRCxVQUFPLFVBQVAsSUFBcUIsVUFBckIsSUFBbUMsV0FBVyxJQUFYLEVBQWlCLFVBQWpCLEVBQTZCLEtBQTdCLENBQW5DO0FBQ0g7QUFDRCxFQW5DRDtBQW9DQSxLQUFHLFFBQVEsWUFBUixDQUFxQixLQUF4QixFQUE4QjtBQUFFO0FBQy9CLFVBQVEsUUFBUixHQUFtQixZQUFVO0FBQUU7QUFDOUIsWUFBUyxPQUFUO0FBQ0EsVUFBTyxXQUFQLElBQXNCLFVBQXRCLElBQW9DLFlBQVksS0FBWixDQUFrQixJQUFsQixFQUF1QixNQUFNLFNBQU4sQ0FBZ0IsS0FBaEIsQ0FBc0IsSUFBdEIsQ0FBMkIsU0FBM0IsQ0FBdkIsQ0FBcEM7QUFDQSxHQUhEO0FBSUE7QUFDRCxRQUFPO0FBQ04sVUFBUSxPQURGO0FBRU4sVUFBUTtBQUZGLEVBQVA7QUFJQTtBQUNELFNBQVMsTUFBVCxDQUFnQixNQUFoQixFQUF1QixNQUF2QixFQUE4QjtBQUM3QixLQUFJLFdBQVcsSUFBZjtBQUFBLEtBQ0MsV0FBVyxPQUFPLFlBQVAsQ0FBb0IsUUFEaEM7QUFBQSxLQUVDLFVBQVUsT0FBTyxZQUFQLENBQW9CLE9BRi9CO0FBR0EsUUFBTyxPQUFPLFlBQWQ7O0FBRUEsWUFBVyxFQUFFLElBQUYsQ0FBTyxNQUFQLEVBQWUsSUFBZixDQUFvQixPQUFPLE9BQTNCLEVBQW9DLElBQXBDLENBQXlDLE9BQU8sS0FBaEQsRUFBdUQsTUFBdkQsQ0FBOEQsT0FBTyxRQUFyRSxFQUErRSxJQUEvRSxDQUFvRixVQUFTLElBQVQsRUFBYztBQUM1RyxNQUFHLFdBQVcsbUJBQW1CLE9BQWpDLEVBQXlDO0FBQ3hDLFdBQVEsR0FBUixDQUFZLElBQVo7QUFDQTtBQUNELEVBSlUsQ0FBWDtBQUtBLEtBQUcsWUFBWSxPQUFPLFFBQVAsSUFBbUIsVUFBbEMsRUFBNkM7QUFDNUMsV0FBUyxRQUFUO0FBQ0E7QUFDRDtBQUNEOzs7O0FBSUEsU0FBUyxPQUFULENBQWlCLEtBQWpCLEVBQXVCO0FBQ3RCLEtBQUksVUFBVSxNQUFNLE1BQXBCO0FBQUEsS0FDQyxVQUFVLE1BQU0sTUFEakI7QUFBQSxLQUVDLE9BQU8sUUFBUSxZQUFSLENBQXFCLElBRjdCO0FBQUEsS0FHQyxXQUFXLFFBQVEsWUFBUixDQUFxQixRQUhqQztBQUFBLEtBSUMsVUFBVSxRQUFRLFlBQVIsQ0FBcUIsT0FKaEM7QUFBQSxLQUtDLFlBQVksSUFMYjs7QUFPQTtBQUNBLEtBQUcsUUFBSCxFQUFZO0FBQ1gsVUFBUSxLQUFSO0FBQ0E7O0FBRUQ7QUFDQSxLQUFHLFdBQVcsbUJBQW1CLE9BQTlCLElBQTBDLENBQUMsWUFBWSxRQUFRLEdBQVIsRUFBYixLQUErQixJQUE1RSxFQUFrRjtBQUNqRixVQUFRLE9BQVIsQ0FBZ0IsU0FBaEIsRUFBMkIsU0FBM0IsRUFBc0MsSUFBdEM7QUFDQSxVQUFRLFFBQVI7QUFDQTtBQUNBOztBQUVELEtBQUcsUUFBUSxNQUFYLEVBQWtCO0FBQ2pCLE1BQUcsUUFBUSxRQUFSLElBQW9CLFNBQXBCLElBQWlDLFFBQVEsUUFBUixJQUFvQixFQUF4RCxFQUEyRDtBQUMxRCxXQUFRLFFBQVIsR0FBbUIsTUFBbkI7QUFDQTtBQUNELFNBQU8sT0FBUCxFQUFlLE9BQWY7QUFDQSxFQUxELE1BS00sSUFBRyxRQUFRLE9BQVgsRUFBbUI7QUFDeEIsVUFBUSxRQUFSLEdBQW1CLE9BQW5CO0FBQ0EsVUFBUSxXQUFSLEdBQXNCLElBQXRCO0FBQ0EsU0FBTyxPQUFQLEVBQWUsT0FBZjtBQUNBLEVBSkssTUFJQSxJQUFHLFFBQVEsUUFBWCxFQUFvQjtBQUN6QixVQUFRLFFBQVIsR0FBbUIsUUFBbkI7QUFDQSxVQUFRLFdBQVIsR0FBc0IsSUFBdEI7QUFDQSxTQUFPLE9BQVAsRUFBZSxPQUFmO0FBQ0E7QUFDRDtBQUNELElBQUksWUFBWSxJQUFJLFdBQUosRUFBaEIsQyxDQUFtQztBQUNuQyxPQUFPLE9BQVAsR0FBaUI7QUFDaEI7Ozs7O0FBS0EsZUFBYyxzQkFBUyxNQUFULEVBQWdCLE1BQWhCLEVBQXVCO0FBQ3BDLE1BQUcsVUFBVSxNQUFWLElBQW9CLE9BQU8sR0FBUCxJQUFjLEVBQXJDLEVBQXdDO0FBQ3ZDLE9BQUksU0FBUyxPQUFPLE1BQVAsRUFBYyxNQUFkLEVBQXFCLFNBQXJCLENBQWI7QUFDQSxPQUFHLE9BQU8sTUFBUCxDQUFjLFlBQWQsQ0FBMkIsS0FBOUIsRUFBb0M7QUFBRTtBQUNyQyxjQUFVLE9BQVYsQ0FBa0IsTUFBbEI7QUFDQSxJQUZELE1BR0k7QUFDSCxZQUFRLE1BQVI7QUFDQTtBQUNEO0FBQ0QsRUFoQmU7QUFpQmhCOzs7Ozs7Ozs7Ozs7O0FBYUEsb0JBQW1CLDJCQUFTLE9BQVQsRUFBaUIsU0FBakIsRUFBMkI7QUFDN0MsTUFBRyxFQUFFLE9BQUYsQ0FBVSxPQUFWLEtBQXNCLFFBQVEsTUFBUixHQUFpQixDQUExQyxFQUE0QztBQUMzQyxPQUFJLFdBQVcsYUFBYSxHQUFiLEVBQWYsQ0FEMkMsQ0FDUjtBQUNuQyxZQUFTLFFBQVQsR0FBb0IsWUFBVTtBQUM3QixpQkFBYSxHQUFiLENBQWlCLFFBQWpCLEVBRDZCLENBQ0Q7QUFDNUIsUUFBRyxhQUFhLE9BQU8sVUFBVSxRQUFqQixJQUE2QixVQUE3QyxFQUF3RDtBQUN2RCxlQUFVLFFBQVY7QUFDQTtBQUNELElBTEQ7QUFNQSxRQUFJLElBQUksSUFBSSxDQUFSLEVBQVcsTUFBTSxRQUFRLE1BQTdCLEVBQXFDLElBQUksR0FBekMsRUFBOEMsR0FBOUMsRUFBa0Q7QUFDakQsUUFBSSxTQUFTLFFBQVEsQ0FBUixFQUFXLE1BQVgsSUFBcUIsRUFBbEM7QUFDQSxRQUFJLFNBQVMsUUFBUSxDQUFSLEVBQVcsTUFBWCxJQUFxQixFQUFsQztBQUNBLFFBQUcsVUFBVSxNQUFWLElBQW9CLE9BQU8sR0FBUCxJQUFjLEVBQXJDLEVBQXdDO0FBQ3ZDLGNBQVMsRUFBRSxNQUFGLENBQVMsSUFBVCxFQUFjLE1BQWQsRUFBcUIsRUFBQyxjQUFhLEVBQUMsT0FBTSxJQUFQLEVBQWQsRUFBckIsQ0FBVDtBQUNBLFNBQUksU0FBUyxPQUFPLE1BQVAsRUFBYyxNQUFkLEVBQXFCLFFBQXJCLENBQWI7QUFDQSxjQUFTLE9BQVQsQ0FBaUIsTUFBakI7QUFDQTtBQUNEO0FBQ0Q7QUFDRDtBQWpEZSxDQUFqQjs7Ozs7OztBQzNOQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBOEJBO0FBQ0EsSUFBSSxPQUFPLEVBQVg7QUFDQTs7O0FBR0EsS0FBSyxLQUFMLEdBQWE7QUFDWixPQUFLLEVBRE8sRUFDSDtBQUNULE9BQUssSUFGTyxFQUVEO0FBQ1gsUUFBTSxjQUFTLElBQVQsRUFBYyxDQUFFLENBSFYsRUFHWTtBQUN4QixVQUFRLGdCQUFTLElBQVQsRUFBYztBQUFDLFdBQU8sS0FBUDtBQUFjLEdBSnpCLENBSTBCO0FBSjFCLENBQWI7QUFNQTs7OztBQUlBLEtBQUssSUFBTCxHQUFZO0FBQ1IsV0FBUyxNQURELEVBQ1M7QUFDakIsVUFBUSxnQkFBUyxJQUFULEVBQWM7QUFBQyxXQUFPLEtBQVA7QUFBYyxHQUY3QixDQUU4QjtBQUN0Qzs7Ozs7Ozs7OztBQUhRLENBQVo7QUFjQSxLQUFLLE1BQUwsR0FBYyxFQUFFO0FBQ2Y7QUFDQSxPQUFLLEVBRlE7QUFHYixVQUFRLEtBSEs7QUFJYixlQUFhLG1DQUpBO0FBS2IsWUFBVSxrQkFBUyxNQUFULEVBQWdCO0FBQUMsV0FBTyxPQUFPLElBQWQ7QUFBb0IsR0FMbEMsRUFLb0M7QUFDakQ7QUFDQSxnQkFBYTtBQUNaLFVBQU0sTUFETSxFQUNFO0FBQ1gsZUFBVyxJQUZGLEVBRVE7QUFDakIsY0FBVSxJQUhELEVBR087QUFDaEIsY0FBVSxJQUpELEVBSU87QUFDaEIsV0FBTyxLQUxFLEVBS0s7QUFDakIsYUFBUyxJQU5HLEVBTUc7QUFDZixjQUFVLEtBUEUsRUFPSztBQUNkLGNBQVUsa0JBQVMsUUFBVCxFQUFrQixDQUFFLENBUnJCLENBUXNCO0FBUnRCO0FBUEEsQ0FBZDtBQWtCQTs7Ozs7QUFLQSxLQUFLLE1BQUwsR0FBYyxFQUFFO0FBQ2YsWUFBVSxvQkFBVSxDQUFFLENBRFQsRUFDVztBQUN4QixXQUFTLGlCQUFTLElBQVQsRUFBZSxVQUFmLEVBQTJCLEtBQTNCLEVBQWlDLENBQUUsQ0FGL0I7QUFHYixTQUFPLGVBQVMsS0FBVCxFQUFnQixVQUFoQixFQUE0QixXQUE1QixFQUF3QztBQUFDLFVBQU8sY0FBYyxNQUFyQjtBQUErQixHQUhsRTtBQUliLFFBQU0sY0FBUyxJQUFULEVBQWUsVUFBZixFQUEyQixLQUEzQixFQUFpQyxDQUFFLENBSjVCLENBSTZCO0FBSjdCLENBQWQ7QUFNQTs7OztBQUlBLEtBQUssTUFBTCxHQUFjLFVBQVMsR0FBVCxFQUFhLENBQUUsQ0FBN0I7QUFDQTs7OztBQUlBLEtBQUssV0FBTCxHQUFtQixVQUFTLE9BQVQsRUFBaUI7QUFDbkMsTUFBRyxRQUFPLE9BQVAseUNBQU8sT0FBUCxNQUFrQixRQUFyQixFQUE4QjtBQUM3QixNQUFFLFNBQUYsQ0FBWSxPQUFaO0FBQ0E7QUFDRCxDQUpEOztBQU1BLE9BQU8sT0FBUCxHQUFpQixJQUFqQjs7Ozs7QUN2R0E7Ozs7Ozs7QUFPQTs7OztBQUlBLFNBQVMsT0FBVCxDQUFpQixHQUFqQixFQUFxQjtBQUNqQixVQUFNLEVBQUUsTUFBRixDQUFTO0FBQ1g7Ozs7Ozs7OztBQVNBLGdCQUFRLElBVkc7QUFXWCxhQUFLLEVBWE0sQ0FXSDtBQVhHLEtBQVQsRUFZSixHQVpJLENBQU47O0FBY0EsUUFBRyxJQUFJLEdBQUosSUFBVyxFQUFYLElBQWlCLElBQUksTUFBSixJQUFjLEVBQWxDLEVBQXFDO0FBQ2pDLGNBQU0sSUFBSSxLQUFKLENBQVUsc0JBQVYsQ0FBTjtBQUNILEtBRkQsTUFFTSxJQUFHLENBQUMsbUNBQW1DLElBQW5DLENBQXdDLElBQUksTUFBNUMsQ0FBSixFQUF3RDtBQUMxRCxjQUFNLElBQUksS0FBSixDQUFVLDZCQUFWLENBQU47QUFDSDs7QUFFRCxRQUFJLEdBQUosR0FBVSxRQUFRLFNBQVIsR0FBb0IsR0FBcEIsR0FBMEIsSUFBSSxHQUF4Qzs7QUFFQSxTQUFLLEdBQUwsR0FBVyxHQUFYO0FBQ0g7O0FBRUQ7Ozs7QUFJQSxRQUFRLFNBQVIsQ0FBa0IsZUFBbEIsR0FBb0MsWUFBVTtBQUMxQyxRQUFJLFNBQVMsS0FBSyxHQUFMLENBQVMsTUFBdEI7QUFBQSxRQUNJLFVBQVUsSUFBSSxJQUFKLEdBQVcsT0FBWCxFQURkO0FBQUEsUUFFSSxXQUFXLENBRmY7QUFBQSxRQUdJLE1BQU0sOEJBSFY7QUFBQSxRQUlJLFFBQVEsSUFKWjs7QUFNQSxXQUFNLENBQUMsUUFBUSxJQUFJLElBQUosQ0FBUyxNQUFULENBQVQsS0FBOEIsSUFBcEMsRUFBeUM7QUFDckMsWUFBSSxNQUFNLE1BQU0sQ0FBTixDQUFWO0FBQUEsWUFBb0I7QUFDaEIsaUJBQVMsTUFBTSxDQUFOLENBRGI7QUFFQSxZQUFHLE1BQU0sQ0FBTixDQUFILEVBQVk7QUFBRTtBQUNWLG1CQUFPLE1BQU0sQ0FBTixDQUFQO0FBQ0g7QUFDRCxjQUFNLE9BQU8sR0FBUCxDQUFOO0FBQ0EsZ0JBQVEsTUFBUjtBQUNJLGlCQUFLLEdBQUw7QUFDSSw0QkFBWSxNQUFJLEVBQUosR0FBTyxFQUFuQjtBQUNBO0FBQ0osaUJBQUssR0FBTDtBQUNJLDRCQUFZLE1BQUksRUFBaEI7QUFDQTtBQUNKLGlCQUFLLEdBQUw7QUFDSSw0QkFBWSxHQUFaO0FBQ0E7QUFDSjtBQUNJO0FBWFI7QUFhSDs7QUFFRCxlQUFXLFdBQVMsRUFBVCxHQUFZLEVBQVosR0FBZSxJQUExQjs7QUFFQSxXQUFPLE9BQVA7QUFDSCxDQWhDRDs7QUFrQ0E7Ozs7Ozs7Ozs7QUFVQSxRQUFRLFNBQVIsQ0FBa0IsR0FBbEIsR0FBd0IsVUFBUyxJQUFULEVBQWM7QUFDbEMsUUFBRyxDQUFDLElBQUQsSUFBUyxPQUFPLElBQVAsQ0FBWSxJQUFaLEVBQWtCLE1BQWxCLElBQTRCLENBQXhDLEVBQTBDO0FBQ3RDO0FBQ0g7O0FBRUQsaUJBQWEsT0FBYixDQUFxQixLQUFLLEdBQUwsQ0FBUyxHQUE5QixFQUFtQyxLQUFLLFNBQUwsQ0FBZTtBQUM5QyxpQkFBUyxLQUFLLGVBQUwsRUFEcUM7QUFFOUMsY0FBTTtBQUZ3QyxLQUFmLENBQW5DO0FBSUgsQ0FURDs7QUFXQTs7OztBQUlBLFFBQVEsU0FBUixDQUFrQixHQUFsQixHQUF3QixZQUFVO0FBQzlCO0FBQ0EsUUFBSSxRQUFRLGFBQWEsT0FBYixDQUFxQixLQUFLLEdBQUwsQ0FBUyxHQUE5QixDQUFaO0FBQ0EsUUFBRyxTQUFTLElBQVosRUFBaUI7QUFDYixlQUFPLElBQVA7QUFDSCxLQUZELE1BRUs7QUFDRCxnQkFBUSxLQUFLLEtBQUwsQ0FBVyxLQUFYLENBQVI7QUFDQSxZQUFHLE9BQU8sTUFBTSxPQUFiLEtBQXlCLElBQUksSUFBSixHQUFXLE9BQVgsRUFBNUIsRUFBaUQ7QUFBRTtBQUMvQyxpQkFBSyxNQUFMO0FBQ0EsbUJBQU8sSUFBUDtBQUNILFNBSEQsTUFHSztBQUNELG1CQUFPLE1BQU0sSUFBYjtBQUNIO0FBQ0o7QUFDSixDQWREOztBQWdCQTs7OztBQUlBLFFBQVEsU0FBUixDQUFrQixNQUFsQixHQUEyQixZQUFVO0FBQ2pDLGlCQUFhLFVBQWIsQ0FBd0IsS0FBSyxHQUFMLENBQVMsR0FBakM7QUFDSCxDQUZEOztBQUlBOzs7O0FBSUEsUUFBUSxTQUFSLEdBQW9CLFFBQXBCOztBQUVBOzs7O0FBSUEsUUFBUSxLQUFSLEdBQWdCLFlBQVU7QUFDdEIsUUFBSSxNQUFNLElBQUksTUFBSixDQUFXLE1BQUksUUFBUSxTQUF2QixDQUFWO0FBQ0EsV0FBTSxhQUFhLE1BQWIsR0FBc0IsQ0FBNUIsRUFBK0I7QUFDM0IsWUFBSSxNQUFNLGFBQWEsR0FBYixDQUFpQixDQUFqQixDQUFWO0FBQ0EsWUFBRyxJQUFJLElBQUosQ0FBUyxHQUFULENBQUgsRUFBaUI7QUFDYix5QkFBYSxVQUFiLENBQXdCLEdBQXhCO0FBQ0g7QUFDSjtBQUNKLENBUkQ7O0FBVUE7Ozs7O0FBS0EsUUFBUSxNQUFSLEdBQWlCLFVBQVMsR0FBVCxFQUFhO0FBQzFCLFdBQU8sSUFBSSxPQUFKLENBQVksR0FBWixDQUFQO0FBQ0gsQ0FGRDs7QUFJQSxPQUFPLE9BQVAsR0FBaUIsT0FBakI7Ozs7Ozs7Ozs7Ozs7OztBQ3pKQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnQ0EsSUFBTSxZQUFZLFFBQVEsZ0JBQVIsQ0FBbEI7QUFBQSxJQUNJLE1BQU0sUUFBUSxVQUFSLENBRFY7O0lBR00sSzs7O0FBQ0w7Ozs7Ozs7OztBQVNBLGlCQUFZLE1BQVosRUFBb0I7QUFBQTs7QUFDbkIsUUFBSSxNQUFNLEVBQUUsTUFBRixDQUFTLElBQVQsRUFBYztBQUN2QixhQUFPO0FBQ04sa0JBQVUsSUFBSSxLQURSLENBQ2M7QUFEZDtBQURnQixLQUFkLEVBSVIsTUFKUSxDQUFWOztBQURtQiw4R0FNYixHQU5hOztBQVFuQixVQUFLLFVBQUwsQ0FBZ0IsSUFBSSxLQUFKLENBQVUsUUFBMUI7QUFDQSxVQUFLLFdBQUwsR0FBbUIsTUFBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixhQUFoQixDQUFuQixDQVRtQixDQVNnQztBQUNuRCxVQUFLLEtBQUwsR0FBYSxFQUFFLFNBQUYsRUFBYjtBQUNBO0FBQ0csVUFBSyxLQUFMLENBQVcsRUFBWCxDQUFjLFdBQWQsRUFBMkIsUUFBM0IsRUFBcUMsVUFBQyxDQUFELEVBQU87QUFDM0MsUUFBRSxjQUFGO0FBQ0EsWUFBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixDQUFoQjtBQUNILFlBQUssSUFBTDtBQUNHLEtBSkQ7QUFaZ0I7QUFpQm5CO0FBQ0Q7Ozs7Ozs7O2lDQUlhLEksRUFBTTtBQUNsQixVQUFHLE9BQU8sSUFBUCxJQUFlLFFBQWYsSUFBMkIsS0FBSyxXQUFMLENBQWlCLE1BQWpCLEdBQTBCLENBQXhELEVBQTBEO0FBQ2hELGFBQUssV0FBTCxDQUFpQixJQUFqQixDQUFzQixJQUF0QjtBQUNIO0FBQ1A7QUFDRDs7Ozs7OzhCQUdVO0FBQ1QsV0FBSyxLQUFMLENBQVcsR0FBWCxDQUFlLFdBQWYsRUFBNEIsUUFBNUI7QUFDQTtBQUNBLFdBQUssV0FBTCxHQUFtQixJQUFuQjtBQUNBLFdBQUssS0FBTCxHQUFhLElBQWI7QUFDQTs7OztFQTdDa0IsUzs7QUFnRHBCLE9BQU8sT0FBUCxHQUFpQixLQUFqQjs7Ozs7Ozs7Ozs7Ozs7O0FDbkZDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNEJBLElBQU0sUUFBUSxRQUFRLFlBQVIsQ0FBZDtBQUFBLElBQ00sY0FBYyxRQUFRLGtCQUFSLENBRHBCOztBQUdEOzs7O0lBR00sWTs7O0FBQ0YsMEJBQVksV0FBWixFQUF5QjtBQUFBOztBQUFBLGdJQUNmLFdBRGU7O0FBRXJCLGNBQUssTUFBTCxHQUFjLFlBQVUsQ0FBRSxDQUExQixDQUZxQixDQUVPO0FBQ2xDLGNBQUssT0FBTCxHQUFlLENBQUMsSUFBRCxDQUFmLENBSDJCLENBR0o7QUFISTtBQUl4QjtBQUNEOzs7Ozs7OztvQ0FJWSxLLEVBQU07QUFBQTs7QUFDcEIsZ0JBQUcsS0FBSyxTQUFMLElBQWtCLElBQXJCLEVBQTBCO0FBQ3pCLHFCQUFLLFNBQUwsR0FBaUIsSUFBSSxLQUFKLENBQVUsS0FBSyxXQUFmLENBQWpCO0FBQ0EscUJBQUssU0FBTCxDQUFlLEtBQWYsQ0FBcUIsR0FBckIsQ0FBeUIsVUFBQyxDQUFELEVBQU87QUFDL0IsMkJBQUssTUFBTDtBQUNBLGlCQUZEO0FBR1MscUJBQUssUUFBTDtBQUNULGFBTkQsTUFNSztBQUNLLG9CQUFHLEtBQUgsRUFBUztBQUNMLHlCQUFLLFNBQUwsQ0FBZSxVQUFmLENBQTBCLEtBQUssV0FBTCxDQUFpQixLQUFqQixDQUF1QixRQUFqRDtBQUNIO0FBQ0o7QUFDUCxtQkFBTyxLQUFLLFNBQVo7QUFDRztBQUNEOzs7Ozs7a0NBR1M7QUFDTDtBQUNBLGlCQUFLLE1BQUwsR0FBYyxZQUFVLENBQUUsQ0FBMUI7QUFDSDs7OztFQTlCc0IsVzs7QUFpQzNCLE9BQU8sT0FBUCxHQUFpQixZQUFqQjs7Ozs7QUNuRUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTJCRCxJQUFNLGVBQWUsUUFBUSxtQkFBUixDQUFyQjs7QUFFQSxPQUFPLE9BQVAsR0FBaUIsSUFBSSxZQUFKLEVBQWpCOzs7Ozs7Ozs7QUM3QkM7Ozs7Ozs7Ozs7QUFVQSxJQUFNLE9BQU8sUUFBUSxjQUFSLENBQWI7O0lBRU0sVztBQUNGOzs7O0FBSUEseUJBQVksV0FBWixFQUF3QjtBQUFBOztBQUNwQixhQUFLLFNBQUwsR0FBaUIsSUFBakIsQ0FEb0IsQ0FDRztBQUM1QixhQUFLLFdBQUwsR0FBbUIsRUFBbkIsQ0FGeUIsQ0FFRjtBQUN2QixhQUFLLE9BQUwsR0FBZSxFQUFmLENBSHlCLENBR047QUFDZCxhQUFLLFNBQUwsR0FBaUIsRUFBRSxTQUFGLEVBQWpCLENBSm9CLENBSVk7QUFDaEMsWUFBRyxPQUFPLFdBQVAsSUFBc0IsU0FBekIsRUFBbUM7QUFDL0IsMEJBQWMsSUFBZDtBQUNIO0FBQ0QsYUFBSyxXQUFMLEdBQW1CLFdBQW5CO0FBQ0g7QUFDRDs7Ozs7Ozs7a0NBSVUsTSxFQUFPO0FBQ2IsaUJBQUssV0FBTCxHQUFtQixNQUFuQjtBQUNIO0FBQ0Q7Ozs7OztzQ0FHYSxDQUVaO0FBQ0Q7Ozs7OzttQ0FHVTtBQUFBOztBQUNOLGdCQUFHLEtBQUssV0FBUixFQUFvQjtBQUNoQixxQkFBSyxTQUFMLENBQWUsWUFBZixDQUE0QixHQUE1QixDQUFnQyxZQUFNO0FBQ2xDLDBCQUFLLE9BQUw7QUFDSCxpQkFGRDtBQUdIO0FBQ0QsaUJBQUssU0FBTCxDQUFlLElBQWYsQ0FBb0IsS0FBSyxTQUF6QjtBQUNIO0FBQ0Q7Ozs7Ozs7Ozs7Ozs7Ozs7OzZCQWNHLEcsRUFBSSxHLEVBQUk7QUFDUCxnQkFBRyxDQUFDLEtBQUssUUFBTCxDQUFjLEdBQWQsQ0FBSixFQUF1QjtBQUM1QixzQkFBTSxJQUFJLEtBQUosQ0FBVSxrQ0FBVixDQUFOO0FBQ0EsYUFGSyxNQUVEO0FBQ0osb0JBQUcsS0FBSyxRQUFMLENBQWMsR0FBZCxDQUFILEVBQXNCO0FBQ3JCLHdCQUFJLFVBQVUsS0FBSyxPQUFuQjtBQURxQjtBQUFBO0FBQUE7O0FBQUE7QUFFckIsNkNBQW1CLE9BQW5CLDhIQUEyQjtBQUFBLGdDQUFuQixPQUFtQjs7QUFDMUIsZ0NBQUcsS0FBSyxVQUFMLENBQWdCLElBQUksT0FBSixDQUFoQixDQUFILEVBQWlDO0FBQ2hDLHFDQUFLLE1BQUksT0FBSixHQUFZLEtBQWpCLElBQTBCLElBQUksT0FBSixDQUExQjtBQUNBLDZCQUZELE1BR0k7QUFDSCxxQ0FBSyxNQUFJLE9BQUosR0FBWSxLQUFqQixJQUEwQixZQUFVLENBQUUsQ0FBdEM7QUFDQTtBQUNEO0FBVG9CO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFVckIsaUJBVkQsTUFVSztBQUNKLHlCQUFLLE1BQUwsR0FBYyxZQUFVLENBQUUsQ0FBMUI7QUFDQTtBQUNEO0FBQ0Esb0JBQUksY0FBYyxFQUFsQjtBQUNBLHFCQUFJLElBQUksSUFBUixJQUFnQixHQUFoQixFQUFvQjtBQUNuQixnQ0FBWSxJQUFaLENBQWlCLElBQWpCO0FBQ0E7QUFDRCxxQkFBSyxXQUFMLENBQWlCLElBQWpCO0FBQ0Esb0JBQUksVUFBVSxLQUFLLFNBQUwsQ0FBZSxRQUFmLENBQXdCLFdBQXhCLENBQWQ7QUFDQSxxQkFBSSxJQUFJLElBQVIsSUFBZ0IsT0FBaEIsRUFBd0I7QUFDdkIseUJBQUssUUFBTCxDQUFjLElBQUksSUFBSixDQUFkLEtBQTRCLFFBQVEsSUFBUixFQUFjLElBQWQsQ0FBbUIsSUFBSSxJQUFKLENBQW5CLENBQTVCO0FBQ0E7QUFDRCxxQkFBSyxTQUFMLENBQWUsSUFBZjtBQUNBO0FBQ0U7QUFDRDs7Ozs7O2tDQUdTO0FBQ0wsZ0JBQUcsS0FBSyxTQUFMLElBQWtCLElBQXJCLEVBQTBCO0FBQy9CLHFCQUFLLFNBQUwsQ0FBZSxPQUFmO0FBQ0EscUJBQUssU0FBTCxHQUFpQixJQUFqQjtBQUNBO0FBQ0U7Ozs7OztBQUdOLE9BQU8sT0FBUCxHQUFpQixXQUFqQjs7Ozs7Ozs7Ozs7Ozs7O0FDMUdBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF3QkMsSUFBTSxRQUFRLFFBQVEsWUFBUixDQUFkO0FBQUEsSUFDSSxPQUFPLFFBQVEsV0FBUixDQURYO0FBQUEsSUFFRyxlQUFlLFFBQVEsbUJBQVIsQ0FGbEI7QUFBQSxJQUdHLE9BQU8sUUFBUSxjQUFSLENBSFY7O0lBS0ssUzs7O0FBQ0w7Ozs7Ozs7Ozs7Ozs7O0FBY0Esb0JBQVksTUFBWixFQUFvQjtBQUFBOztBQUNiLE1BQUksZ0JBQWdCLEtBQXBCO0FBQ04sTUFBRyxDQUFDLE9BQU8sU0FBUixJQUFxQixPQUFPLFNBQVAsQ0FBaUIsTUFBakIsSUFBMkIsQ0FBbkQsRUFBcUQ7QUFDcEQsVUFBTyxTQUFQLEdBQW1CLEVBQUUsYUFBRixFQUFpQixRQUFqQixDQUEwQixNQUExQixDQUFuQjtBQUNBLG1CQUFnQixJQUFoQixDQUZvRCxDQUU5QjtBQUN0QjtBQUNELFdBQVMsVUFBVSxFQUFuQjtBQUNBOztBQVBtQixvSEFRYixPQUFPLFNBUk0sRUFRSSxPQUFPLEtBUlg7O0FBU2IsUUFBSyxhQUFMLEdBQXFCLGFBQXJCO0FBQ047QUFDQSxRQUFLLEdBQUwsR0FBVyxJQUFJLFlBQUosQ0FBaUI7QUFDM0IsVUFBTyxNQUFLO0FBRGUsR0FBakIsRUFFVCxPQUFPLEdBRkUsQ0FBWDtBQUdBO0FBQ0EsTUFBSSxVQUFVLEVBQUUsTUFBRixDQUFTLElBQVQsRUFBYztBQUMzQixTQUFNLElBRHFCO0FBRTNCLFlBQVM7QUFGa0IsR0FBZCxFQUdaLE9BQU8sSUFISyxDQUFkO0FBSUEsTUFBRyxRQUFRLElBQVgsRUFBZ0I7QUFBRTtBQUNqQixTQUFLLElBQUwsR0FBWSxJQUFJLElBQUosQ0FBUyxPQUFPLFNBQWhCLEVBQTBCLE9BQTFCLENBQVo7QUFDQSxPQUFHLFFBQVEsT0FBWCxFQUFtQjtBQUFFO0FBQ3BCLFVBQUssSUFBTCxDQUFVLFFBQVYsQ0FBbUIsR0FBbkIsQ0FBdUIsVUFBQyxDQUFELEVBQU87QUFDN0IsV0FBSyxJQUFMO0FBQ0EsS0FGRDtBQUdBO0FBQ0Q7QUFDRDtBQUNBLFFBQUssS0FBTCxDQUFXLEVBQVgsQ0FBYyxXQUFkLEVBQTJCLFdBQTNCLEVBQXdDLFVBQUMsQ0FBRCxFQUFPO0FBQzNDLEtBQUUsY0FBRjtBQUNBLFNBQUssSUFBTDtBQUNBLEdBSEo7QUE1Qm1CO0FBZ0NuQjtBQUNEOzs7Ozs7Ozs7Ozs7OzJCQVNTLFcsRUFBWTtBQUFBOztBQUNwQixPQUFJLFNBQVMsRUFBYjtBQUFBLE9BQWlCLE9BQU8sSUFBeEI7QUFDQSxPQUFHLEtBQUssT0FBTCxDQUFhLFdBQWIsQ0FBSCxFQUE2QjtBQUM1QixNQUFFLElBQUYsQ0FBTyxXQUFQLEVBQW1CLFVBQUMsS0FBRCxFQUFPLElBQVAsRUFBZ0I7QUFDbEMsU0FBSSxPQUFPLE9BQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsU0FBTyxJQUF2QixDQUFYO0FBQ0EsU0FBRyxLQUFLLE1BQUwsR0FBYyxDQUFqQixFQUFtQjtBQUNsQixhQUFPLElBQVAsSUFBZSxJQUFmO0FBQ0E7QUFDRCxLQUxEO0FBTUE7QUFDRCxVQUFPLE1BQVA7QUFDQTtBQUNEOzs7Ozs7eUJBR007QUFDTCxPQUFHLENBQUMsS0FBSyxNQUFMLEVBQUosRUFBa0I7QUFDakIsU0FBSyxhQUFMLENBQW1CLElBQW5CLEdBRGlCLENBQ1U7QUFDM0IsU0FBSyxJQUFMLElBQWEsS0FBSyxJQUFMLENBQVUsSUFBVixFQUFiO0FBQ0EsU0FBSyxLQUFMO0FBQ0EsU0FBSyxHQUFMLENBQVMsTUFBVDtBQUNBLFNBQUssWUFBTCxDQUFrQixJQUFsQixHQUxpQixDQUtTO0FBQzFCO0FBQ0Q7QUFDRDs7Ozs7O3lCQUdNO0FBQ0wsT0FBRyxLQUFLLE1BQUwsRUFBSCxFQUFpQjtBQUNoQixTQUFLLGFBQUwsQ0FBbUIsSUFBbkIsR0FEZ0IsQ0FDVztBQUMzQixTQUFLLElBQUwsSUFBYSxLQUFLLElBQUwsQ0FBVSxJQUFWLEVBQWI7QUFDQSxTQUFLLEtBQUw7QUFDQSxTQUFLLFlBQUwsQ0FBa0IsSUFBbEIsR0FKZ0IsQ0FJVTtBQUMxQjtBQUNEO0FBQ0Q7Ozs7Ozs0QkFHUztBQUNSLFFBQUssS0FBTCxDQUFXLEdBQVgsQ0FBZSxXQUFmLEVBQTRCLFdBQTVCO0FBQ0EsUUFBSyxHQUFMLENBQVMsT0FBVDtBQUNBLE9BQUcsS0FBSyxJQUFSLEVBQWE7QUFDSCxTQUFLLElBQUwsQ0FBVSxPQUFWO0FBQ0g7QUFDRCxPQUFJLFlBQVksS0FBSyxTQUFyQjtBQUNBO0FBQ0EsT0FBRyxLQUFLLGFBQVIsRUFBc0I7QUFDM0IsY0FBVSxNQUFWO0FBQ0E7QUFDRCxRQUFLLGFBQUwsR0FBcUIsSUFBckI7QUFDQTs7OztFQTNHc0IsSzs7QUE4R3hCLE9BQU8sT0FBUCxHQUFpQixTQUFqQjs7Ozs7Ozs7Ozs7Ozs7O0FDM0lBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBa0NBLElBQU0sWUFBWSxRQUFRLGdCQUFSLENBQWxCO0FBQUEsSUFDRSxNQUFNLFFBQVEsVUFBUixDQURSOztJQUdNLE87OztBQUNMOzs7Ozs7Ozs7QUFTQSxrQkFBWSxNQUFaLEVBQW9CO0FBQUE7O0FBQ25CLE1BQUksTUFBTSxFQUFFLE1BQUYsQ0FBUyxJQUFULEVBQWM7QUFDdkIsWUFBUztBQUNSLGNBQVUsSUFBSSxPQUROLENBQ2M7QUFEZDtBQURjLEdBQWQsRUFJUixNQUpRLENBQVY7O0FBRG1CLGdIQU1iLEdBTmE7O0FBT25CLFFBQUssVUFBTCxDQUFnQixJQUFJLE9BQUosQ0FBWSxRQUE1QjtBQUNBLFFBQUssV0FBTCxHQUFtQixNQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLGFBQWhCLENBQW5CLENBUm1CLENBUWdDO0FBQ25ELFFBQUssS0FBTCxHQUFhLEVBQUUsU0FBRixFQUFiO0FBQ0EsUUFBSyxTQUFMLEdBQWlCLEVBQUUsU0FBRixFQUFqQjtBQUNBO0FBQ0csUUFBSyxLQUFMLENBQVcsRUFBWCxDQUFjLFdBQWQsRUFBMkIsUUFBM0IsRUFBcUMsVUFBQyxDQUFELEVBQU87QUFDM0MsS0FBRSxjQUFGO0FBQ0gsU0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixDQUFoQjtBQUNHLFNBQUssSUFBTDtBQUNBLEdBSkQ7QUFLQSxRQUFLLEtBQUwsQ0FBVyxFQUFYLENBQWMsV0FBZCxFQUEyQixZQUEzQixFQUF5QyxVQUFDLENBQUQsRUFBTztBQUMvQyxLQUFFLGNBQUY7QUFDSCxTQUFLLFNBQUwsQ0FBZSxJQUFmLENBQW9CLENBQXBCO0FBQ0csU0FBSyxJQUFMO0FBQ0EsR0FKRDtBQWpCZ0I7QUFzQm5CO0FBQ0Q7Ozs7Ozs7OytCQUlhLEksRUFBSztBQUNqQixPQUFHLE9BQU8sSUFBUCxJQUFlLFFBQWYsSUFBMkIsS0FBSyxXQUFMLENBQWlCLE1BQWpCLEdBQTBCLENBQXhELEVBQTBEO0FBQ3pELFNBQUssV0FBTCxDQUFpQixJQUFqQixDQUFzQixJQUF0QjtBQUNBO0FBQ0Q7QUFDRDs7Ozs7OzRCQUdTO0FBQ1IsUUFBSyxLQUFMLENBQVcsR0FBWCxDQUFlLFdBQWYsRUFBNEIsUUFBNUI7QUFDQSxRQUFLLEtBQUwsQ0FBVyxHQUFYLENBQWUsV0FBZixFQUE0QixZQUE1QjtBQUNBO0FBQ0EsUUFBSyxXQUFMLEdBQW1CLElBQW5CO0FBQ0EsUUFBSyxLQUFMLEdBQWEsSUFBYjtBQUNBOzs7O0VBbkRvQixTOztBQXNEdEIsT0FBTyxPQUFQLEdBQWlCLE9BQWpCOzs7Ozs7Ozs7Ozs7Ozs7QUMzRkM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUErQkEsSUFBTSxVQUFVLFFBQVEsY0FBUixDQUFoQjtBQUFBLElBQ0UsY0FBYyxRQUFRLGtCQUFSLENBRGhCOztJQUdLLGM7OztBQUNMOzs7QUFHQSx5QkFBWSxXQUFaLEVBQXlCO0FBQUE7O0FBQUEsOEhBQ2xCLFdBRGtCOztBQUV4QixRQUFLLE1BQUwsR0FBYyxZQUFVLENBQUUsQ0FBMUIsQ0FGd0IsQ0FFSTtBQUM1QixRQUFLLFVBQUwsR0FBa0IsWUFBVSxDQUFFLENBQTlCLENBSHdCLENBR1E7QUFDaEMsUUFBSyxPQUFMLEdBQWUsQ0FBQyxJQUFELEVBQU0sUUFBTixDQUFmLENBSndCLENBSVE7QUFKUjtBQUt4QjtBQUNEOzs7Ozs7Ozs4QkFJWSxLLEVBQU07QUFBQTs7QUFDakIsT0FBRyxLQUFLLFNBQUwsSUFBa0IsSUFBckIsRUFBMEI7QUFDekIsU0FBSyxTQUFMLEdBQWlCLElBQUksT0FBSixDQUFZLEtBQUssV0FBakIsQ0FBakI7QUFDQSxTQUFLLFNBQUwsQ0FBZSxLQUFmLENBQXFCLEdBQXJCLENBQXlCLFVBQUMsQ0FBRCxFQUFPO0FBQy9CLFlBQUssTUFBTDtBQUNBLEtBRkQ7QUFHQSxTQUFLLFNBQUwsQ0FBZSxTQUFmLENBQXlCLEdBQXpCLENBQTZCLFVBQUMsQ0FBRCxFQUFPO0FBQ25DLFlBQUssVUFBTDtBQUNBLEtBRkQ7QUFHQSxTQUFLLFFBQUw7QUFDQSxJQVRELE1BU0s7QUFDSyxRQUFHLEtBQUgsRUFBUztBQUNMLFVBQUssU0FBTCxDQUFlLFVBQWYsQ0FBMEIsS0FBSyxXQUFMLENBQWlCLE9BQWpCLENBQXlCLFFBQW5EO0FBQ0g7QUFDSjtBQUNQLFVBQU8sS0FBSyxTQUFaO0FBQ0E7QUFDRDs7Ozs7OzRCQUdTO0FBQ1I7QUFDQSxRQUFLLE1BQUwsR0FBYyxZQUFVLENBQUUsQ0FBMUI7QUFDQSxRQUFLLFVBQUwsR0FBa0IsWUFBVSxDQUFFLENBQTlCO0FBQ0E7Ozs7RUF0QzJCLFc7O0FBeUM3QixPQUFPLE9BQVAsR0FBaUIsY0FBakI7Ozs7O0FDM0VDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNEJBLElBQU0saUJBQWlCLFFBQVEscUJBQVIsQ0FBdkI7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLElBQUksY0FBSixFQUFqQjs7Ozs7Ozs7O0FDOUJEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQW9CTyxLO0FBQ0w7Ozs7O0FBS0EsaUJBQVksU0FBWixFQUFzQixNQUF0QixFQUE2QjtBQUFBOztBQUM3QixnQkFBWSxhQUFhLEVBQUUsTUFBRixDQUF6QjtBQUNDLFFBQUksTUFBTSxFQUFFLE1BQUYsQ0FBUyxJQUFULEVBQWM7QUFDdkIsaUJBQVcsRUFEWSxFQUNSO0FBQ2YsY0FBUSxDQUZlLEVBRVo7QUFDWCxnQkFBVSxVQUhhLEVBR0Q7QUFDdEIsWUFBTSxLQUppQixFQUlWO0FBQ2IsY0FBUTtBQUNQLGNBQU0sSUFEQyxFQUNLO0FBQ1osY0FBTSxJQUZDLENBRUk7QUFGSjtBQUxlLEtBQWQsRUFTUixVQUFVLEVBVEYsQ0FBVjtBQVVBLFFBQUksU0FBUyxjQUFZLElBQUksUUFBaEIsR0FBeUIsR0FBekIsSUFBOEIsSUFBSSxJQUFKLEdBQVMsRUFBVCxHQUFZLGVBQTFDLElBQTJELFVBQTNELEdBQXNFLElBQUksTUFBMUUsR0FBaUYsR0FBOUY7QUFDQSxTQUFLLFNBQUwsR0FBaUIsU0FBakIsQ0FiNEIsQ0FhQTtBQUM1QixTQUFLLEtBQUwsR0FBYSxFQUFFLFVBQVEsSUFBSSxTQUFKLElBQWlCLEVBQWpCLEdBQW9CLEVBQXBCLEdBQXVCLGFBQVcsSUFBSSxTQUFmLEdBQXlCLEdBQXhELElBQTZELFVBQTdELEdBQXdFLE1BQXhFLEdBQStFLFVBQWpGLENBQWI7QUFDQSxTQUFLLEtBQUwsQ0FBVyxRQUFYLENBQW9CLFNBQXBCO0FBQ0EsU0FBSyxhQUFMLEdBQXFCLEVBQUUsU0FBRixFQUFyQixDQWhCNEIsQ0FnQlE7QUFDcEMsU0FBSyxZQUFMLEdBQW9CLEVBQUUsU0FBRixFQUFwQixDQWpCNEIsQ0FpQk87QUFDbkMsU0FBSyxhQUFMLEdBQXFCLEVBQUUsU0FBRixFQUFyQixDQWxCNEIsQ0FrQlE7QUFDcEMsU0FBSyxZQUFMLEdBQW9CLEVBQUUsU0FBRixFQUFwQixDQW5CNEIsQ0FtQk87QUFDbkMsU0FBSyxNQUFMLEdBQWUsSUFBSSxNQUFuQixDQXBCNEIsQ0FvQkQ7QUFDM0I7QUFDRDs7Ozs7Ozs7K0JBSVcsTyxFQUFRO0FBQ25CLFVBQUcsVUFBVSxNQUFWLElBQW9CLENBQXZCLEVBQXlCO0FBQ3ZCO0FBQ0E7QUFDRCxVQUFHLE9BQU8sT0FBUCxJQUFrQixRQUFyQixFQUE4QjtBQUM3QixhQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLE9BQWhCO0FBQ0EsT0FGRCxNQUdJO0FBQ0gsYUFBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixFQUFoQixFQUFvQixNQUFwQixDQUEyQixPQUEzQjtBQUNBO0FBQ0Q7QUFDRDs7Ozs7OzRCQUdPO0FBQ04sVUFBRyxPQUFPLEtBQUssTUFBTCxDQUFZLElBQW5CLElBQTJCLFVBQTlCLEVBQXlDO0FBQ3hDLGFBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsS0FBSyxLQUF0QjtBQUNBLE9BRkQsTUFHSTtBQUNILGFBQUssS0FBTCxDQUFXLElBQVg7QUFDQTtBQUNEO0FBQ0Q7Ozs7OzsyQkFHTztBQUNOLFVBQUcsQ0FBQyxLQUFLLE1BQUwsRUFBSixFQUFrQjtBQUNqQixhQUFLLGFBQUwsQ0FBbUIsSUFBbkIsR0FEaUIsQ0FDVTtBQUMzQixhQUFLLEtBQUw7QUFDQSxhQUFLLFlBQUwsQ0FBa0IsSUFBbEIsR0FIaUIsQ0FHUztBQUMxQjtBQUNEO0FBQ0Q7Ozs7Ozs0QkFHTztBQUNQLFVBQUcsT0FBTyxLQUFLLE1BQUwsQ0FBWSxJQUFuQixJQUEyQixVQUE5QixFQUF5QztBQUN2QyxhQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLEtBQUssS0FBdEI7QUFDQSxPQUZGLE1BR0s7QUFDSCxhQUFLLEtBQUwsQ0FBVyxJQUFYO0FBQ0E7QUFDRDtBQUNEOzs7Ozs7MkJBR007QUFDTCxVQUFHLEtBQUssTUFBTCxFQUFILEVBQWlCO0FBQ2hCLGFBQUssYUFBTCxDQUFtQixJQUFuQixHQURnQixDQUNXO0FBQzNCLGFBQUssS0FBTDtBQUNBLGFBQUssWUFBTCxDQUFrQixJQUFsQixHQUhnQixDQUdVO0FBQzFCO0FBQ0Q7QUFDRDs7Ozs7OzhCQUdTO0FBQ1IsVUFBRyxLQUFLLEtBQUwsSUFBYyxJQUFqQixFQUFzQjtBQUNyQixhQUFLLEtBQUwsQ0FBVyxNQUFYO0FBQ0EsYUFBSyxLQUFMLEdBQWEsSUFBYjtBQUNBLGFBQUssT0FBTCxHQUFlLElBQWY7QUFDQSxhQUFLLE9BQUwsR0FBZSxJQUFmO0FBQ0EsYUFBSyxNQUFMLEdBQWMsSUFBZDtBQUNBLGFBQUssU0FBTCxHQUFpQixJQUFqQjtBQUNBO0FBQ0Q7QUFDRDs7Ozs7Ozs2QkFJUTtBQUNQLGFBQU8sS0FBSyxLQUFMLENBQVcsR0FBWCxDQUFlLFNBQWYsS0FBNkIsTUFBcEM7QUFDQTs7Ozs7O0FBR0gsT0FBTyxPQUFQLEdBQWlCLEtBQWpCOzs7Ozs7Ozs7QUMvSEE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFtQkMsSUFBTSxlQUFlLFFBQVEsbUJBQVIsQ0FBckI7O0lBRU0sSTtBQUNMOzs7OztBQUtBLGdCQUFZLFNBQVosRUFBc0IsTUFBdEIsRUFBNkI7QUFBQTs7QUFBQTs7QUFDNUIsZ0JBQVksYUFBYSxFQUFFLE1BQUYsQ0FBekI7QUFDQSxRQUFJLE1BQU0sRUFBRSxNQUFGLENBQVM7QUFDVCxpQkFBVyxFQURGLEVBQ007QUFDeEIsZUFBUyxNQUZTLEVBRUQ7QUFDakIsY0FBUSxDQUhVLEVBR1A7QUFDWCxlQUFTLEdBSlMsRUFJSjtBQUNkLFlBQU0sS0FMWSxFQUtMO0FBQ2IsY0FBUTtBQUNQLGNBQU0sSUFEQyxFQUNLO0FBQ1osY0FBTSxJQUZDLENBRUk7QUFGSjtBQU5VLEtBQVQsRUFVUixVQUFVLEVBVkYsQ0FBVjtBQVdBLFFBQUksU0FBUyxrQ0FBZ0MsSUFBSSxPQUFwQyxHQUE0QyxHQUE1QyxJQUFpRCxJQUFJLElBQUosR0FBUyxFQUFULEdBQVksZUFBN0QsSUFBOEUsVUFBOUUsR0FBeUYsSUFBSSxNQUE3RixHQUFvRyxHQUFqSDtBQUNBLFNBQUssU0FBTCxHQUFpQixTQUFqQixDQWQ0QixDQWNBO0FBQzVCLFNBQUssSUFBTCxHQUFZLEVBQUUsVUFBUSxJQUFJLFNBQUosSUFBaUIsRUFBakIsR0FBb0IsRUFBcEIsR0FBdUIsYUFBVyxJQUFJLFNBQWYsR0FBeUIsR0FBeEQsSUFBNkQsVUFBN0QsR0FBd0UsTUFBeEUsR0FBK0UsVUFBakYsQ0FBWjtBQUNBLFNBQUssSUFBTCxDQUFVLFFBQVYsQ0FBbUIsU0FBbkI7QUFDQSxTQUFLLElBQUwsQ0FBVSxHQUFWLENBQWMsU0FBZCxFQUF3QixJQUFJLE9BQTVCO0FBQ0EsU0FBSyxNQUFMLEdBQWUsSUFBSSxNQUFuQixDQWxCNEIsQ0FrQkQ7QUFDM0IsU0FBSyxHQUFMLEdBQVcsSUFBSSxZQUFKLENBQWlCLEVBQUMsT0FBTSxLQUFLLElBQVosRUFBakIsRUFBbUMsRUFBQyxNQUFLLE1BQU4sRUFBbkMsQ0FBWDtBQUNBO0FBQ0EsU0FBSyxRQUFMLEdBQWdCLEVBQUUsU0FBRixFQUFoQixDQXJCNEIsQ0FxQkc7QUFDL0IsU0FBSyxJQUFMLENBQVUsRUFBVixDQUFhLFdBQWIsRUFBeUIsVUFBQyxDQUFELEVBQU87QUFDL0IsWUFBSyxRQUFMLENBQWMsSUFBZCxDQUFtQixDQUFuQjtBQUNBLEtBRkQ7QUFHQTtBQUNEOzs7Ozs7OzJCQUdNO0FBQ04sVUFBRyxPQUFPLEtBQUssTUFBTCxDQUFZLElBQW5CLElBQTJCLFVBQTlCLEVBQXlDO0FBQ3ZDLGFBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsS0FBSyxJQUF0QjtBQUNBLE9BRkYsTUFHSztBQUNILGFBQUssSUFBTCxDQUFVLElBQVY7QUFDQTtBQUNELFdBQUssR0FBTCxDQUFTLE1BQVQ7QUFDQTtBQUNEOzs7Ozs7MkJBR007QUFDTCxVQUFHLE9BQU8sS0FBSyxNQUFMLENBQVksSUFBbkIsSUFBMkIsVUFBOUIsRUFBeUM7QUFDeEMsYUFBSyxNQUFMLENBQVksSUFBWixDQUFpQixLQUFLLElBQXRCO0FBQ0EsT0FGRCxNQUdJO0FBQ0gsYUFBSyxJQUFMLENBQVUsSUFBVjtBQUNBO0FBQ0Q7QUFDRDs7Ozs7OzhCQUdTO0FBQ1IsVUFBRyxLQUFLLElBQUwsSUFBYSxJQUFoQixFQUFxQjtBQUNwQixhQUFLLElBQUwsQ0FBVSxHQUFWLENBQWMsV0FBZDtBQUNBLGFBQUssSUFBTCxDQUFVLE1BQVY7QUFDQSxhQUFLLElBQUwsR0FBWSxJQUFaO0FBQ0EsYUFBSyxHQUFMLENBQVMsT0FBVDtBQUNBLGFBQUssR0FBTCxHQUFXLElBQVg7QUFDQSxhQUFLLFFBQUwsR0FBZ0IsSUFBaEI7QUFDQTtBQUNEOzs7Ozs7QUFHRixPQUFPLE9BQVAsR0FBaUIsSUFBakI7Ozs7Ozs7OztBQzNGRDs7Ozs7Ozs7Ozs7OztBQWFDLElBQU0sWUFBWSxRQUFRLG1CQUFSLENBQWxCO0FBQUEsSUFDRSxTQUFTLFFBQVEsZ0JBQVIsQ0FEWDtBQUFBLElBRUMsWUFBWSxRQUFRLG1CQUFSLENBRmI7QUFBQSxJQUdDLFNBQVMsUUFBUSxnQkFBUixDQUhWOztBQUtEOzs7QUFHQSxTQUFTLE9BQVQsQ0FBZ0IsTUFBaEIsRUFBdUIsTUFBdkIsRUFBOEI7QUFDN0IsS0FBSSxTQUFTLEVBQWI7QUFBQSxLQUFnQixRQUFRLE9BQU8sS0FBL0I7QUFBQSxLQUFxQyxTQUFTLE9BQU8sTUFBckQ7QUFDQSxPQUFNLEdBQU4sQ0FBVSxVQUFWLEVBQXFCLE9BQU8sUUFBNUI7QUFDQSxLQUFJLGFBQWEsQ0FBakI7QUFBQSxLQUFvQixZQUFZLENBQWhDO0FBQ0EsS0FBRyxPQUFPLFFBQVAsSUFBbUIsVUFBbkIsSUFBaUMsT0FBTyxLQUEzQyxFQUFpRDtBQUNoRCxlQUFhLE9BQU8sVUFBUCxFQUFiO0FBQ0EsY0FBWSxPQUFPLFNBQVAsRUFBWjtBQUNBO0FBQ0QsU0FBUSxPQUFPLElBQWY7QUFDQyxPQUFLLEdBQUw7QUFBVTtBQUNULGlCQUFlLEtBQUssR0FBTCxDQUFTLE1BQU0sS0FBTixFQUFULEVBQXVCLE9BQU8sUUFBOUIsSUFBd0MsQ0FBeEMsR0FBMEMsT0FBTyxNQUFQLENBQWMsQ0FBZCxDQUF6RDtBQUNBLGdCQUFjLEtBQUssR0FBTCxDQUFTLE1BQU0sTUFBTixFQUFULEVBQXdCLE9BQU8sU0FBL0IsSUFBMEMsQ0FBMUMsR0FBNEMsT0FBTyxNQUFQLENBQWMsQ0FBZCxDQUExRDtBQUNBLFVBQU8sR0FBUCxHQUFhLEtBQWI7QUFDQSxVQUFPLElBQVAsR0FBYyxLQUFkO0FBQ0E7QUFDRCxPQUFLLE1BQUw7QUFBYTtBQUNaLFVBQU8sS0FBUCxHQUFlLE1BQWY7QUFDQSxVQUFPLE1BQVAsR0FBZ0IsTUFBaEI7QUFDQSxVQUFPLEdBQVAsR0FBYSxHQUFiO0FBQ0EsVUFBTyxJQUFQLEdBQWMsR0FBZDtBQUNBO0FBWkY7QUFjQSxRQUFPLFVBQVAsR0FBb0IsYUFBVyxJQUEvQjtBQUNBLFFBQU8sU0FBUCxHQUFtQixZQUFVLElBQTdCO0FBQ0EsS0FBRyxPQUFPLE9BQU8sU0FBZCxJQUEyQixVQUE5QixFQUF5QztBQUN4QyxTQUFPLFNBQVAsQ0FBaUIsTUFBakI7QUFDQSxFQUZELE1BRUs7QUFDSixRQUFNLEdBQU4sQ0FBVSxNQUFWO0FBQ0E7QUFDRDs7SUFFSyxRO0FBQ0w7Ozs7Ozs7O0FBUUEsbUJBQVksSUFBWixFQUFpQixNQUFqQixFQUF3QjtBQUFBOztBQUN2QjtBQUNBLE1BQUcsVUFBVSxNQUFWLElBQW9CLENBQXZCLEVBQXlCO0FBQ3hCLFNBQU0sSUFBSSxLQUFKLENBQVUsZ0JBQVYsQ0FBTjtBQUNBO0FBQ0QsTUFBSSxTQUFTLEVBQUUsTUFBRixDQUFTO0FBQ3JCLFVBQU8sSUFEYyxFQUNSO0FBQ2IsWUFBUyxLQUZZLENBRU47QUFGTSxHQUFULEVBR1gsUUFBUSxFQUhHLENBQWI7QUFJQSxNQUFHLE9BQU8sS0FBUCxJQUFnQixPQUFPLE9BQU8sS0FBZCxJQUF1QixRQUExQyxFQUFtRDtBQUNsRCxVQUFPLEtBQVAsR0FBZSxFQUFFLE9BQU8sS0FBVCxDQUFmO0FBQ0E7QUFDRCxNQUFHLENBQUMsT0FBTyxLQUFSLElBQWlCLE9BQU8sS0FBUCxDQUFhLE1BQWIsSUFBdUIsQ0FBM0MsRUFBNkM7QUFDNUMsU0FBTSxJQUFJLEtBQUosQ0FBVSxZQUFWLENBQU47QUFDQTtBQUNELE1BQUksU0FBUyxFQUFFLE1BQUYsQ0FBUztBQUNyQixVQUFPLElBRGMsRUFDUjtBQUNiLFNBQU0sR0FGZSxFQUVWO0FBQ1gsV0FBUSxDQUFDLENBQUQsRUFBRyxDQUFILENBSGEsRUFHTjtBQUNmLGVBQVksS0FKUyxFQUlGO0FBQ25CLGFBQVUsQ0FMVyxFQUtSO0FBQ0osY0FBVyxDQU5DLEVBTUU7QUFDZCxjQUFXLElBUEMsQ0FPSTtBQVBKLEdBQVQsRUFRWCxVQUFVLEVBUkMsQ0FBYjtBQVNNLE9BQUssTUFBTCxHQUFjLEVBQUUsU0FBRixFQUFkLENBeEJpQixDQXdCWTs7QUFFbkMsTUFBSSxPQUFPLElBQVg7QUFDQTtBQUNBLFNBQU8sTUFBUCxHQUFnQixPQUFPLEtBQVAsQ0FBYSxZQUFiLEVBQWhCO0FBQ0EsTUFBSSxVQUFVLE9BQU8sTUFBUCxDQUFjLEdBQWQsQ0FBa0IsQ0FBbEIsRUFBcUIsT0FBckIsQ0FBNkIsV0FBN0IsRUFBZDtBQUNBLE1BQUksYUFBYTtBQUNQLFNBQU0sZ0JBQVU7QUFDWixTQUFLLE1BQUw7QUFDSDtBQUhNLEdBQWpCO0FBS00sTUFBSSxjQUFjLEtBQWxCLENBbkNpQixDQW1DUTtBQUN6QixNQUFJLGNBQWMsS0FBbEIsQ0FwQ2lCLENBb0NRO0FBQy9CLE1BQUcsV0FBVyxNQUFYLElBQXFCLFdBQVcsTUFBbkMsRUFBMEM7QUFBRTtBQUN4QyxVQUFPLE1BQVAsR0FBZ0IsRUFBRSxNQUFGLENBQWhCO0FBQ0gsVUFBTyxPQUFQLEdBQWlCLElBQWpCO0FBQ0E7QUFDRCxNQUFHLE9BQU8sT0FBUCxJQUFrQixPQUFPLEtBQTVCLEVBQWtDO0FBQUU7QUFDbkMsVUFBTyxRQUFQLEdBQWtCLE9BQWxCO0FBQ0EsR0FGRCxNQUdJO0FBQ0gsVUFBTyxRQUFQLEdBQWtCLFVBQWxCO0FBQ0EsT0FBRyxPQUFPLEtBQVYsRUFBaUI7QUFBRTtBQUNmLGtCQUFjLElBQWQ7QUFDUyxRQUFHLE9BQU8sT0FBVixFQUFrQjtBQUNkLGVBQVUsTUFBVixDQUFpQixVQUFqQjtBQUNILEtBRkQsTUFHSTtBQUNBLFNBQUksU0FBUyxJQUFJLE1BQUosQ0FBVyxPQUFPLE1BQWxCLENBQWI7QUFDQSxZQUFPLE1BQVAsQ0FBYyxVQUFkO0FBQ0g7QUFDYjtBQUNEO0FBQ0Q7QUFDTSxNQUFHLE9BQU8sSUFBUCxJQUFlLEdBQWYsSUFBc0IsT0FBTyxVQUFoQyxFQUEyQztBQUN2QyxpQkFBYyxJQUFkO0FBQ0EsT0FBRyxPQUFPLE9BQVYsRUFBa0I7QUFDZCxjQUFVLE1BQVYsQ0FBaUIsVUFBakI7QUFDSCxJQUZELE1BRUs7QUFDRCxRQUFJLFNBQVMsSUFBSSxNQUFKLENBQVcsT0FBTyxNQUFsQixDQUFiO0FBQ0EsV0FBTyxNQUFQLENBQWMsVUFBZDtBQUNIO0FBQ0o7QUFDUCxPQUFLLE1BQUwsR0FBYyxNQUFkLENBbkV1QixDQW1FRDtBQUN0QixPQUFLLE1BQUwsR0FBYyxNQUFkLENBcEV1QixDQW9FRDtBQUN0QixPQUFLLE9BQUwsR0FBZSxZQUFVO0FBQUU7QUFDMUIsUUFBSyxNQUFMLEdBQWMsSUFBZDtBQUNBLFFBQUssTUFBTCxHQUFjLElBQWQ7QUFDQSxPQUFHLFdBQUgsRUFBZTtBQUNkLFFBQUcsT0FBTyxPQUFWLEVBQWtCO0FBQ2pCLGVBQVUsUUFBVixDQUFtQixVQUFuQjtBQUNBLEtBRkQsTUFFSztBQUNKLFlBQU8sUUFBUCxDQUFnQixVQUFoQjtBQUNBO0FBQ0Q7QUFDRCxPQUFHLFdBQUgsRUFBZTtBQUNYLFFBQUcsT0FBTyxPQUFWLEVBQWtCO0FBQ0wsZUFBVSxRQUFWLENBQW1CLFVBQW5CO0FBQ0gsS0FGVixNQUVjO0FBQ0QsWUFBTyxRQUFQLENBQWdCLFVBQWhCO0FBQ0g7QUFDYjtBQUNELEdBakJEO0FBa0JBO0FBQ0Q7Ozs7Ozs7OzJCQUlRO0FBQ1AsT0FBRyxLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLEdBQWxCLENBQXNCLFNBQXRCLEtBQW9DLE1BQXBDLElBQThDLEtBQUssTUFBTCxDQUFZLE1BQVosQ0FBbUIsR0FBbkIsQ0FBdUIsU0FBdkIsS0FBcUMsTUFBdEYsRUFBNkY7QUFDNUYsV0FBTyxLQUFQO0FBQ0EsSUFGRCxNQUdJO0FBQ0gsWUFBTyxLQUFLLE1BQVosRUFBbUIsS0FBSyxNQUF4QjtBQUNTLFNBQUssTUFBTCxDQUFZLElBQVo7QUFDVCxXQUFPLElBQVA7QUFDQTtBQUNEOzs7Ozs7QUFHRixPQUFPLE9BQVAsR0FBaUIsUUFBakI7Ozs7O0FDcktBOzs7QUFHQSxRQUFRLEtBQVIsR0FBZ0IsQ0FDWixlQURZLEVBRWYsK0JBRmUsRUFHZix3REFIZSxFQUlkLElBSmMsQ0FJVCxFQUpTLENBQWhCO0FBS0E7OztBQUdBLFFBQVEsT0FBUixHQUFrQixDQUNkLGVBRGMsRUFFakIsK0JBRmlCLEVBR2pCLHVHQUhpQixFQUloQixJQUpnQixDQUlYLEVBSlcsQ0FBbEI7Ozs7O0FDWEE7Ozs7Ozs7OztBQVNBLElBQUksT0FBTyxTQUFTLGFBQVQsQ0FBdUIsS0FBdkIsQ0FBWDtBQUNBLElBQUksU0FBUztBQUNaO0FBQ0EsU0FBTyxFQUFFLGVBQWUsT0FBTyxTQUFTLElBQVQsQ0FBYyxLQUFkLENBQW9CLFNBQTFDLElBQXlELFNBQVMsVUFBVCxLQUF3QixZQUF4QixJQUF3QyxPQUFPLElBQVAsQ0FBWSxVQUFVLFNBQVYsQ0FBb0IsV0FBcEIsRUFBWixDQUFuRyxDQUZLO0FBR1o7QUFDQSxjQUFZLEVBQUUsS0FBSyxLQUFMLENBQVcsVUFBWCxJQUF5QixTQUEzQjtBQUpBLENBQWI7O0FBT0EsT0FBTyxPQUFQLEdBQWlCLE1BQWpCOzs7Ozs7Ozs7Ozs7O0FDakJBOzs7Ozs7OztBQVFDLElBQU0sYUFBYSxRQUFRLGlCQUFSLENBQW5COztJQUVNLFE7OztBQUNMOzs7O0FBSUEsb0JBQVksTUFBWixFQUFtQjtBQUFBOztBQUFBOztBQUVsQixVQUFLLEtBQUwsR0FBYSxJQUFiO0FBQ0EsTUFBRSxNQUFGLFFBQWM7QUFDYixpQkFBVyxHQURFLENBQ0U7QUFERixLQUFkLEVBRUUsVUFBVSxFQUZaO0FBSGtCO0FBTWxCO0FBQ0Q7Ozs7Ozs7NEJBR087QUFBQTs7QUFDTixVQUFHLEtBQUssS0FBUixFQUFjO0FBQ0oscUJBQWEsS0FBSyxLQUFsQjtBQUNIO0FBQ0QsV0FBSyxLQUFMLEdBQWEsV0FBVyxZQUFNO0FBQzdCLGVBQUssT0FBTDtBQUNBLE9BRlksRUFFWCxLQUFLLFNBRk0sQ0FBYjtBQUdOOzs7O0VBdEJxQixVOztBQXlCeEIsT0FBTyxPQUFQLEdBQWlCLFFBQWpCOzs7OztBQ25DQTs7Ozs7O0FBTUEsSUFBSSxTQUFTO0FBQ1o7QUFDQSxZQUFZLFlBQVU7QUFDbEIsU0FBTyx5QkFBeUIsTUFBekIsR0FBaUMsbUJBQWpDLEdBQXNELFFBQTdEO0FBQ0gsRUFGVSxFQUZDO0FBS1o7QUFDQSxRQUFRLFlBQVU7QUFDZCxNQUFHLFdBQVcsSUFBWCxDQUFnQixVQUFVLFNBQTFCLENBQUgsRUFBd0M7QUFBRTtBQUN0QyxVQUFPLGFBQVA7QUFDSDtBQUNELE1BQUksT0FBTyxTQUFTLGFBQVQsQ0FBdUIsT0FBdkIsQ0FBWDtBQUNBLE1BQUcsYUFBYSxJQUFoQixFQUFxQjtBQUNqQixVQUFPLE9BQVA7QUFDSCxHQUZELE1BRU0sSUFBRyxzQkFBc0IsSUFBekIsRUFBOEI7QUFDaEMsVUFBTyxnQkFBUDtBQUNILEdBRkssTUFFQTtBQUNGLFVBQU8sT0FBUDtBQUNIO0FBQ0osRUFaTTtBQU5LLENBQWI7O0FBcUJBLE9BQU8sT0FBUCxHQUFpQixNQUFqQjs7Ozs7Ozs7O0FDM0JBOzs7Ozs7OztBQVFDLElBQU0sT0FBTyxRQUFRLFdBQVIsQ0FBYjtBQUFBLElBQ0csZUFBZSxRQUFRLG1CQUFSLENBRGxCOztJQUdLLFU7QUFDTCx1QkFBYTtBQUFBOztBQUNaLE9BQUssV0FBTCxHQUFtQixFQUFuQixDQURZLENBQ1c7QUFDdkIsT0FBSyxhQUFMLEdBQXFCLElBQUksWUFBSixFQUFyQjtBQUNBO0FBQ0Q7Ozs7Ozs7K0JBR2EsSSxFQUFLO0FBQ2pCLE9BQUcsS0FBSyxRQUFMLENBQWMsSUFBZCxLQUF1QixLQUFLLFVBQUwsQ0FBZ0IsS0FBSyxJQUFyQixDQUExQixFQUFxRDtBQUNwRCxXQUFPLElBQVA7QUFDQTtBQUNELFVBQU8sS0FBUDtBQUNBO0FBQ0Q7Ozs7Ozs7NEJBSVM7QUFDUixRQUFLLGFBQUwsQ0FBbUIsSUFBbkIsQ0FBd0IsVUFBUyxJQUFULEVBQWM7QUFDckMsTUFBRSxJQUFGLENBQU8sS0FBSyxXQUFaLEVBQXdCLFVBQVMsS0FBVCxFQUFlLElBQWYsRUFBb0I7QUFDM0MsU0FBRyxLQUFLLE1BQUwsTUFBaUIsSUFBcEIsRUFBeUI7QUFDbEIsV0FBSyxJQUFMLENBQVUsS0FBVixDQUFnQixNQUFoQixFQUF1QixLQUFLLElBQTVCO0FBQ0Q7QUFDTixLQUpEO0FBS0EsSUFOdUIsQ0FNdEIsSUFOc0IsQ0FNakIsSUFOaUIsRUFNWixFQUFDLE1BQU0sU0FBUCxFQU5ZLENBQXhCO0FBT0E7QUFDRDs7Ozs7Ozs7Ozs7NEJBUVUsVSxFQUFXO0FBQ3BCLE9BQUcsS0FBSyxZQUFMLENBQWtCLFVBQWxCLENBQUgsRUFBaUM7QUFDaEMsUUFBRyxDQUFDLEtBQUssVUFBTCxDQUFnQixXQUFXLE1BQTNCLENBQUosRUFBdUM7QUFDaEMsZ0JBQVcsTUFBWCxHQUFvQixZQUFVO0FBQzFCLGFBQU8sSUFBUDtBQUNILE1BRkQ7QUFHSDtBQUNKLFFBQUcsRUFBRSxPQUFGLENBQVUsVUFBVixFQUFxQixLQUFLLFdBQTFCLElBQXlDLENBQTVDLEVBQThDO0FBQzdDLFVBQUssYUFBTCxDQUFtQixLQUFuQixDQUF5QixVQUFTLE1BQVQsRUFBZ0I7QUFDeEMsV0FBSyxXQUFMLENBQWlCLElBQWpCLENBQXNCLE1BQXRCO0FBQ0EsTUFGd0IsQ0FFdkIsSUFGdUIsQ0FFbEIsSUFGa0IsRUFFYixVQUZhLENBQXpCO0FBR0E7QUFDRDtBQUNEO0FBQ0Q7Ozs7Ozs7OEJBSVksVSxFQUFXO0FBQ3RCLE9BQUcsS0FBSyxZQUFMLENBQWtCLFVBQWxCLENBQUgsRUFBaUM7QUFDaEMsU0FBSyxhQUFMLENBQW1CLEtBQW5CLENBQXlCLFVBQVMsTUFBVCxFQUFnQjtBQUFBOztBQUN4QyxPQUFFLElBQUYsQ0FBTyxLQUFLLFdBQVosRUFBd0IsVUFBQyxLQUFELEVBQU8sSUFBUCxFQUFnQjtBQUN2QyxVQUFHLFFBQVEsTUFBWCxFQUFrQjtBQUNkLGFBQUssV0FBTCxDQUFpQixNQUFqQixDQUF3QixLQUF4QixFQUE4QixDQUE5QjtBQUNILGNBQU8sS0FBUDtBQUNBO0FBQ0QsTUFMRDtBQU1BLEtBUHdCLENBT3ZCLElBUHVCLENBT2xCLElBUGtCLEVBT2IsVUFQYSxDQUF6QjtBQVFBO0FBQ0Q7Ozs7OztBQUdGLE9BQU8sT0FBUCxHQUFpQixVQUFqQjs7Ozs7Ozs7O0FDOUVBOzs7Ozs7Ozs7Ozs7QUFZQSxJQUFNLFdBQVcsUUFBUSxlQUFSLENBQWpCOztJQUVNLE07QUFDTDs7OztBQUlBLGlCQUFZLElBQVosRUFBaUIsTUFBakIsRUFBd0I7QUFBQTs7QUFBQTs7QUFDdkIsTUFBRyxLQUFLLE1BQUwsSUFBZSxDQUFsQixFQUFvQjtBQUNuQjtBQUNBO0FBQ0QsTUFBSSxNQUFNLEVBQUUsTUFBRixDQUFTO0FBQ2YsWUFBUztBQURNLEdBQVQsRUFFUixNQUZRLENBQVY7QUFHQSxPQUFLLEtBQUwsR0FBYSxJQUFJLFFBQUosQ0FBYSxHQUFiLENBQWI7QUFDQSxPQUFLLEVBQUwsQ0FBUSxJQUFJLE9BQVosRUFBb0IsWUFBTTtBQUN6QixTQUFLLEtBQUwsQ0FBVyxLQUFYO0FBQ0EsR0FGRDtBQUdBO0FBQ0Q7Ozs7Ozs7Ozs7Ozt5QkFRTyxHLEVBQUk7QUFDVixRQUFLLEtBQUwsQ0FBVyxTQUFYLENBQXFCLEdBQXJCO0FBQ0E7QUFDRDs7Ozs7OzsyQkFJUyxHLEVBQUk7QUFDWixRQUFLLEtBQUwsQ0FBVyxXQUFYLENBQXVCLEdBQXZCO0FBQ0E7Ozs7OztBQUdGLE9BQU8sT0FBUCxHQUFpQixNQUFqQjs7Ozs7Ozs7O0FDbkRBOzs7Ozs7O0FBT0MsSUFBTSxPQUFPLFFBQVEsV0FBUixDQUFiOztJQUVNLFk7QUFDTCwwQkFBYTtBQUFBOztBQUNaLFNBQUssUUFBTCxHQUFnQixLQUFoQixDQURZLENBQ1c7QUFDdkIsU0FBSyxTQUFMLEdBQWlCLEtBQWpCLENBRlksQ0FFWTtBQUN4QixTQUFLLEtBQUwsR0FBYSxFQUFiLENBSFksQ0FHSztBQUNqQjtBQUNEOzs7Ozs7O2lDQUdZO0FBQ1osVUFBRyxLQUFLLFNBQVIsRUFBa0I7QUFDaEIsZUFBTyxLQUFQO0FBQ0E7QUFDRCxhQUFPLElBQVA7QUFDQTtBQUNEOzs7Ozs7a0NBR2E7QUFDYixVQUFHLEtBQUssU0FBTCxJQUFrQixLQUFLLFFBQTFCLEVBQW1DO0FBQ2pDLGVBQU8sS0FBUDtBQUNBO0FBQ0QsYUFBTyxJQUFQO0FBQ0E7QUFDRDs7Ozs7O2dDQUdZO0FBQ1gsYUFBTSxLQUFLLEtBQUwsQ0FBVyxNQUFYLEdBQW9CLENBQTFCLEVBQTRCO0FBQzNCLFlBQUksTUFBTSxLQUFLLEtBQUwsQ0FBVyxLQUFYLEVBQVY7QUFDQSxZQUFHLElBQUksSUFBSixJQUFZLE1BQWYsRUFBc0I7QUFDckIsZUFBSyxTQUFMLENBQWUsSUFBSSxHQUFuQjtBQUNBLFNBRkQsTUFFTSxJQUFHLElBQUksSUFBSixJQUFZLE9BQWYsRUFBdUI7QUFDNUIsZUFBSyxVQUFMLENBQWdCLElBQUksR0FBcEI7QUFDQTtBQUNEO0FBQ0Q7QUFDRDs7Ozs7OzhCQUdVLEcsRUFBSTtBQUNkLFdBQUssUUFBTCxHQUFnQixJQUFoQjtBQUNDO0FBQ0EsV0FBSyxRQUFMLEdBQWdCLEtBQWhCO0FBQ0E7QUFDRDs7Ozs7OytCQUdXLEcsRUFBSTtBQUNmLFdBQUssU0FBTCxHQUFpQixJQUFqQjtBQUNDO0FBQ0EsV0FBSyxTQUFMLEdBQWlCLEtBQWpCO0FBQ0E7QUFDRDs7Ozs7Ozt5QkFJSyxHLEVBQUk7QUFDUixVQUFHLEtBQUssVUFBTCxDQUFnQixHQUFoQixDQUFILEVBQXdCO0FBQ3ZCLFlBQUcsS0FBSyxVQUFMLEVBQUgsRUFBcUI7QUFDcEIsZUFBSyxTQUFMLENBQWUsR0FBZjtBQUNBLGVBQUssU0FBTDtBQUNBLFNBSEQsTUFHSztBQUNKLGVBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0I7QUFDZixrQkFBTSxNQURTO0FBRWYsaUJBQUs7QUFGVSxXQUFoQjtBQUlBO0FBQ0Q7QUFDRDtBQUNEOzs7Ozs7OzBCQUlNLEcsRUFBSTtBQUNULFVBQUcsS0FBSyxVQUFMLENBQWdCLEdBQWhCLENBQUgsRUFBd0I7QUFDdkIsWUFBRyxLQUFLLFdBQUwsRUFBSCxFQUFzQjtBQUNyQixlQUFLLFVBQUwsQ0FBZ0IsR0FBaEI7QUFDQSxlQUFLLFNBQUw7QUFDQSxTQUhELE1BR0s7QUFDSixlQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCO0FBQ2Ysa0JBQU0sT0FEUztBQUVmLGlCQUFLO0FBRlUsV0FBaEI7QUFJQTtBQUNEO0FBQ0Q7Ozs7OztBQUdILE9BQU8sT0FBUCxHQUFpQixZQUFqQjs7Ozs7Ozs7O0FDbEdBOzs7Ozs7Ozs7Ozs7OztBQWNBLElBQU0sV0FBVyxRQUFRLGVBQVIsQ0FBakI7O0lBRU0sTTtBQUNMOzs7O0FBSUEsaUJBQVksSUFBWixFQUFpQixNQUFqQixFQUF3QjtBQUFBOztBQUFBOztBQUN2QixNQUFHLEtBQUssTUFBTCxJQUFlLENBQWxCLEVBQW9CO0FBQ25CO0FBQ0E7QUFDRCxPQUFLLEtBQUwsR0FBYSxJQUFJLFFBQUosQ0FBYSxNQUFiLENBQWI7QUFDQSxPQUFLLEVBQUwsQ0FBUSxRQUFSLEVBQWlCLFlBQU07QUFDdEIsU0FBSyxLQUFMLENBQVcsS0FBWDtBQUNBLEdBRkQ7QUFHQTtBQUNEOzs7Ozs7Ozs7Ozs7eUJBUVUsRyxFQUFJO0FBQ2IsUUFBSyxLQUFMLENBQVcsU0FBWCxDQUFxQixHQUFyQjtBQUNBO0FBQ0Q7Ozs7Ozs7MkJBSVMsRyxFQUFJO0FBQ1osUUFBSyxLQUFMLENBQVcsV0FBWCxDQUF1QixHQUF2QjtBQUNBOzs7Ozs7QUFHRixPQUFPLE9BQVAsR0FBaUIsTUFBakI7Ozs7O0FDbERBOzs7OztBQUtBLElBQU0sTUFBTSxRQUFRLEtBQVIsQ0FBWjs7QUFFQTs7OztBQUlBLFFBQVEsU0FBUixHQUFvQixVQUFTLElBQVQsRUFBYztBQUNqQyxNQUFHLFFBQVEsSUFBUixJQUFnQixRQUFRLEVBQTNCLEVBQThCO0FBQzdCLFdBQU8sSUFBUDtBQUNBO0FBQ0QsU0FBTyxLQUFQO0FBQ0EsQ0FMRDtBQU1BOzs7O0FBSUEsUUFBUSxRQUFSLEdBQW1CLFVBQVMsSUFBVCxFQUFjO0FBQ2hDLFNBQU8sT0FBTyxTQUFQLENBQWlCLFFBQWpCLENBQTBCLElBQTFCLENBQStCLElBQS9CLEtBQXdDLGlCQUF4QyxJQUE2RCxLQUFLLFdBQUwsSUFBb0IsTUFBeEY7QUFDQSxDQVpEO0FBYUE7OztBQUdBLFFBQVEsWUFBUixHQUF1QixVQUFTLElBQVQsRUFBYztBQUNqQyxTQUFPLE9BQU8sU0FBUCxDQUFpQixRQUFqQixDQUEwQixJQUExQixDQUErQixJQUEvQixLQUF3QyxpQkFBL0M7QUFDSCxDQWxCRDtBQW1CQTs7OztBQUlBLFFBQVEsVUFBUixHQUFxQixVQUFTLElBQVQsRUFBYztBQUNsQyxTQUFPLE9BQU8sSUFBUCxJQUFlLFVBQXRCO0FBQ0EsQ0F6QkQ7QUEwQkE7Ozs7QUFJQSxRQUFRLE9BQVIsR0FBa0IsVUFBUyxJQUFULEVBQWM7QUFDL0IsU0FBTyxPQUFPLFNBQVAsQ0FBaUIsUUFBakIsQ0FBMEIsSUFBMUIsQ0FBK0IsSUFBL0IsS0FBd0MsZ0JBQS9DO0FBQ0EsQ0FoQ0Q7QUFpQ0E7Ozs7QUFJQSxRQUFRLFNBQVIsR0FBb0IsVUFBUyxJQUFULEVBQWM7QUFDakMsU0FBTyxPQUFPLElBQVAsSUFBZSxTQUF0QjtBQUNBLENBdkNEO0FBd0NBOzs7O0FBSUEsUUFBUSxRQUFSLEdBQW1CLFVBQVMsSUFBVCxFQUFjO0FBQ2hDLFNBQU8sT0FBTyxJQUFQLElBQWUsUUFBdEI7QUFDQSxDQTlDRDtBQStDQTs7OztBQUlBLFFBQVEsUUFBUixHQUFtQixVQUFTLElBQVQsRUFBYztBQUNoQyxTQUFPLE9BQU8sSUFBUCxJQUFlLFFBQXRCO0FBQ0EsQ0FyREQ7QUFzREE7Ozs7QUFJQSxRQUFRLGdCQUFSLEdBQTJCLFVBQVMsSUFBVCxFQUFjO0FBQ3hDLFNBQU8sUUFBUSxJQUFSLElBQWdCLEtBQUssVUFBTCxDQUFnQixLQUFLLElBQXJCLENBQWhCLElBQThDLEtBQUssTUFBTCxHQUFjLENBQW5FO0FBQ0EsQ0E1REQ7O0FBOERBOzs7Ozs7QUFNQSxRQUFRLFFBQVIsR0FBbUIsVUFBUyxHQUFULEVBQWE7QUFDL0IsUUFBTSxPQUFPLFNBQVMsSUFBdEI7O0FBRUEsU0FBTyxJQUFJLEtBQUosQ0FBVSxHQUFWLEVBQWMsSUFBZCxDQUFQO0FBQ0EsQ0FKRDs7Ozs7QUMvRUE7Ozs7Ozs7Ozs7QUFVQSxJQUFNLFNBQVMsUUFBUSxhQUFSLENBQWY7QUFBQSxJQUNFLGdCQUFnQixRQUFRLG9CQUFSLENBRGxCOztBQUdBLE9BQU8sT0FBUCxHQUFpQixJQUFJLE1BQUosQ0FBVyxFQUFFLE1BQUYsQ0FBWCxFQUFxQjtBQUNyQyxXQUFTLGdCQUFjO0FBRGMsQ0FBckIsQ0FBakI7Ozs7O0FDYkE7Ozs7Ozs7Ozs7OztBQVlBLElBQU0sU0FBUyxRQUFRLGFBQVIsQ0FBZjs7QUFFQSxPQUFPLE9BQVAsR0FBaUIsSUFBSSxNQUFKLENBQVcsRUFBRSxNQUFGLENBQVgsQ0FBakI7Ozs7Ozs7OztBQ2RBOzs7Ozs7Ozs7O0lBVU8sTTtBQUNGOzs7QUFHQSxrQkFBYTtBQUFBOztBQUNULFNBQUssSUFBTCxHQUFZLElBQVo7QUFDSCxDOztJQUdDLGE7QUFDRjs7OztBQUlBLDZCQUFhO0FBQUE7O0FBQ1QsYUFBSyxXQUFMLEdBQW1CLEVBQW5CLENBRFMsQ0FDYztBQUMxQjtBQUNEOzs7Ozs7Ozs4QkFJSztBQUNELGdCQUFJLFlBQVksSUFBaEI7QUFDQSxpQkFBSSxJQUFJLElBQUksQ0FBUixFQUFXLE1BQU0sS0FBSyxXQUFMLENBQWlCLE1BQXRDLEVBQThDLElBQUksR0FBbEQsRUFBdUQsR0FBdkQsRUFBMkQ7QUFDdkQsb0JBQUcsS0FBSyxXQUFMLENBQWlCLENBQWpCLEVBQW9CLElBQXBCLElBQTRCLEtBQS9CLEVBQXFDO0FBQUU7QUFDbkMseUJBQUssV0FBTCxDQUFpQixDQUFqQixFQUFvQixJQUFwQixHQUEyQixJQUEzQjtBQUNBLGdDQUFZLEtBQUssV0FBTCxDQUFpQixDQUFqQixDQUFaO0FBQ0E7QUFDSDtBQUNKO0FBQ0QsZ0JBQUcsYUFBYSxJQUFoQixFQUFxQjtBQUNqQiw0QkFBWSxJQUFJLE1BQUosRUFBWjtBQUNBLHFCQUFLLFdBQUwsQ0FBaUIsSUFBakIsQ0FBc0IsU0FBdEI7QUFDSDtBQUNELG1CQUFPLFNBQVA7QUFDSDtBQUNEOzs7Ozs7Ozs0QkFLSSxNLEVBQU87QUFDUCxnQkFBSSxZQUFZLElBQWhCO0FBQ0EsaUJBQUksSUFBSSxJQUFJLENBQVIsRUFBVyxNQUFNLEtBQUssV0FBTCxDQUFpQixNQUF0QyxFQUE4QyxJQUFJLEdBQWxELEVBQXVELEdBQXZELEVBQTJEO0FBQ3ZELG9CQUFHLE1BQUgsRUFBVTtBQUNOLHdCQUFHLEtBQUssV0FBTCxDQUFpQixDQUFqQixLQUF1QixNQUExQixFQUFpQztBQUFFO0FBQy9CLDZCQUFLLFdBQUwsQ0FBaUIsQ0FBakIsRUFBb0IsSUFBcEIsR0FBMkIsS0FBM0I7QUFDQSxvQ0FBWSxLQUFLLFdBQUwsQ0FBaUIsQ0FBakIsQ0FBWjtBQUNBO0FBQ0g7QUFDSixpQkFORCxNQU1LO0FBQ0Qsd0JBQUcsS0FBSyxXQUFMLENBQWlCLENBQWpCLEVBQW9CLElBQXBCLElBQTRCLElBQS9CLEVBQW9DO0FBQ2hDLDZCQUFLLFdBQUwsQ0FBaUIsQ0FBakIsRUFBb0IsSUFBcEIsR0FBMkIsS0FBM0I7QUFDQSxvQ0FBWSxLQUFLLFdBQUwsQ0FBaUIsQ0FBakIsQ0FBWjtBQUNBO0FBQ0g7QUFDSjtBQUNKO0FBQ0QsbUJBQU8sU0FBUDtBQUNIO0FBQ0Q7Ozs7Ozs7Z0NBSU87QUFDSCxnQkFBSSxTQUFTLElBQWI7QUFDQSxpQkFBSSxJQUFJLElBQUksQ0FBUixFQUFXLE1BQU0sS0FBSyxXQUFMLENBQWlCLE1BQXRDLEVBQThDLElBQUksR0FBbEQsRUFBdUQsR0FBdkQsRUFBMkQ7QUFDdkQsb0JBQUcsS0FBSyxXQUFMLENBQWlCLENBQWpCLEVBQW9CLElBQXBCLElBQTRCLElBQS9CLEVBQW9DO0FBQUU7QUFDbEMsNkJBQVMsS0FBVDtBQUNBO0FBQ0g7QUFDSjtBQUNELG1CQUFPLE1BQVA7QUFDSDs7Ozs7O0FBR04sT0FBTyxPQUFQLEdBQWlCLGFBQWpCOzs7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3JoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNXRCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImNvbnN0IE1vZGVsID0gcmVxdWlyZSgnLi9tb2RlbC5qcycpLFxyXG4gICAgICBCYXNlVmlldyA9IHJlcXVpcmUoJ2NvcmUtYmFzZXZpZXcnKTtcclxuXHJcbkJhc2VWaWV3LnJlZ2lzdGVyKHtcclxuICBfaW5pdDogZnVuY3Rpb24oKXtcclxuICAgICAgLyoqXHJcbiAgICAgICAqIOaZrumAmuWNleS4quivt+axglxyXG4gICAgICAgKiAgICAgIOi/meS4qumFjee9ruivtOaYjuWKoOWFpeWFqOWxgOe9kee7nOS4u+mYn+WIl1xyXG4gICAgICAgICAgICogY3VzdG9tY29uZmlnOiB7XHJcbiAgICAgICAgICAgICAgIHF1ZXVlOiB0cnVlXHJcbiAgICAgICAgICAgfVxyXG4gICAgICAgKi9cclxuICAgICAgTW9kZWwubGlzdGRhdGEoe1xyXG4gICAgICAgICAgZGF0YTogeyduYW1lJzogJ3ptcmRsYid9XHJcbiAgICAgICAgICAvLyBjdXN0b21jb25maWc6IHtcclxuICAgICAgICAgIC8vICAgICBxdWV1ZTogdHJ1ZVxyXG4gICAgICAgICAgLy8gfVxyXG4gICAgICB9LHtcclxuICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy8gZmFpbDogZnVuY3Rpb24oKXtcclxuICAgICAgICAgIC8vICAgICBjb25zb2xlLmxvZygn6KaG55uW57uf5LiAZmFpbOWkhOeQhicpO1xyXG4gICAgICAgICAgLy8gfSxcclxuICAgICAgICAgIC8vIGVycm9yOiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKCfopobnm5bnu5/kuIBlcnJvcuWkhOeQhicpO1xyXG4gICAgICAgICAgLy8gfSxcclxuICAgICAgICAgIC8vIGNvbXBsZXRlOiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKCflrozmiJAnKTtcclxuICAgICAgICAgIC8vIH1cclxuICAgICAgfSk7XHJcbiAgICAgIE1vZGVsLm1haW4oe1xyXG4gICAgICAgICAgZGF0YTogeyduYW1lJzogJ3ptcmRsYid9XHJcbiAgICAgICAgICAvLyBjdXN0b21jb25maWc6IHtcclxuICAgICAgICAgIC8vICAgICBxdWV1ZTogdHJ1ZVxyXG4gICAgICAgICAgLy8gfVxyXG4gICAgICB9LHtcclxuICAgICAgICAgIGVycm9yOiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfopobnm5bnu5/kuIBlcnJvcuWkhOeQhicpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICB9LHtcclxuICAgICAgICAgIGlkOiAnMTAwMidcclxuICAgICAgfSk7XHJcblxyXG5cclxuICAgICAgLy/ljZXni6zlo7DmmI7pmJ/liJfvvIzmjqXlj6PmjInnhafpmJ/liJfpobrluo/liqDovb1cclxuICAgICAgLy8gTW9kZWwuJGludGVyaW8udHJhbnNRdWV1ZVJlcXVlc3QoW3tcclxuICAgICAgLy8gICAgIGlvYXJnczoge1xyXG4gICAgICAvLyAgICAgICAgIHVybDogTW9kZWwuYmFzZWhvc3QrJy9saXN0ZGF0YXMnLFxyXG4gICAgICAvLyAgICAgICAgIG1ldGhvZDonUE9TVCdcclxuICAgICAgLy8gICAgIH0sXHJcbiAgICAgIC8vICAgICBpb2NhbGw6IHtcclxuICAgICAgLy8gICAgICAgICBlcnJvcjogZnVuY3Rpb24oKXsgLy/mraTmjqXlj6PmnKzmnaXku4DkuYjpg73kuI3ov5Tlm57vvIzmiYDku6Xmiorpu5jorqTplJnor6/mj5DnpLropobnm5bkuoZcclxuICAgICAgLy8gICAgICAgICAgICAgY29uc29sZS5sb2coJy9saXN0ZGF0YXMgZXJyb3InKTtcclxuICAgICAgLy8gICAgICAgICB9XHJcbiAgICAgIC8vICAgICB9XHJcbiAgICAgIC8vIH0se1xyXG4gICAgICAvLyAgICAgaW9hcmdzOiB7XHJcbiAgICAgIC8vICAgICAgICAgdXJsOiBNb2RlbC5iYXNlaG9zdCsnL2xpc3RkYXRhJyxcclxuICAgICAgLy8gICAgICAgICBtZXRob2Q6J1BPU1QnXHJcbiAgICAgIC8vICAgICB9LFxyXG4gICAgICAvLyAgICAgaW9jYWxsOiB7XHJcbiAgICAgIC8vICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgIC8vICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xyXG4gICAgICAvLyAgICAgICAgIH1cclxuICAgICAgLy8gICAgIH1cclxuICAgICAgLy8gfV0sIHtcclxuICAgICAgLy8gICAgIGNvbXBsZXRlOiBmdW5jdGlvbigpe1xyXG4gICAgICAvLyAgICAgICAgIGNvbnNvbGUubG9nKCfpmJ/liJflhajpg6jlrozmiJAnKVxyXG4gICAgICAvLyAgICAgfVxyXG4gICAgICAvLyB9KTtcclxuICB9XHJcbn0pO1xyXG4iLCIvKipcclxuICog5pS+5Yiw6Ieq5bex6aG555uu5Lit77yM57uf5LiA5a6a5LmJ55qEaW/lpITnkIblsYJcclxuICpcclxuICog5L2/55SoanF1ZXJ55o+Q5L6b55qEYWpheOaWueazleWSjOacrOi6q+WwgeijheeahGlv5Lia5Yqh5bGC5a6e546wXHJcbiAqL1xyXG5jb25zdCBJb0NvbmZpZyA9IHJlcXVpcmUoJ2xpYmlvLWlvY29uZmlnJyksXHJcbiAgICAgIEludGVyaW8gPSByZXF1aXJlKCdsaWJpby1pbnRlcmlvJyksXHJcbiAgICAgIFN0b3JhZ2UgPSByZXF1aXJlKCcuL3N0b3JhZ2UnKTtcclxuIC8qKlxyXG4gICog57uf5LiA5aSE55CG5pyq55m75b2VXHJcbiAgKi9cclxuIElvQ29uZmlnLmxvZ2luLmZpbHRlciA9IGZ1bmN0aW9uKHJlc3VsdCl7XHJcbiAgICAgcmV0dXJuIHJlc3VsdC5jb2RlID09ICdBMDAwMic7XHJcbiB9O1xyXG4gSW9Db25maWcubG9naW4udXJsID0gJ2h0dHA6Ly9iYWlkdS5jb20vJztcclxuXHJcblxyXG4gLyoqXHJcbiAgKiDmiYDmnInmjqXlj6PnmoRpb+S4muWKoemUmeivr+e7n+S4gOWkhOeQhlxyXG4gICovXHJcbiBJb0NvbmZpZy5mYWlsLmZpbHRlciA9IGZ1bmN0aW9uKHJlc3VsdCkge1xyXG4gICAgIHJldHVybiByZXN1bHQuY29kZSAhPSAnQTAwMDEnO1xyXG4gfTtcclxuIElvQ29uZmlnLmlvY2FsbC5mYWlsID0gZnVuY3Rpb24ocmVzdWx0KXtcclxuICAgICBfQVBQLnRvYXN0LnNob3cocmVzdWx0LmVycm1zZyB8fCAn572R57uc6ZSZ6K+vJyk7XHJcbiB9O1xyXG4gSW9Db25maWcuaW9jYWxsLmVycm9yID0gZnVuY3Rpb24oanFYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKXtcclxuICAgICBfQVBQLlRvYXN0LnNob3codGV4dFN0YXR1cyB8fCAn572R57uc6ZSZ6K+vJyk7XHJcbiB9O1xyXG5cclxuIElvQ29uZmlnLmlvYXJncy5iZWZvcmVTZW5kID0gZnVuY3Rpb24oKXtcclxuICAgIC8vICBfQVBQLkxvYWRpbmcuc2hvdygpO1xyXG4gICAgY29uc29sZS5sb2coJ+ivt+axguW8gOWniycpO1xyXG4gfTtcclxuIElvQ29uZmlnLmlvY2FsbC5jb21wbGV0ZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAvLyAgX0FQUC5Mb2FkaW5nLmhpZGUoKTtcclxuICAgIGNvbnNvbGUubG9nKCfor7fmsYLnu5PmnZ8nKTtcclxuIH1cclxuXHJcbiAvL+aUr+aMgei3qOi2ilxyXG4gSW9Db25maWcuaW9hcmdzLmNyb3NzRG9tYWluID0gdHJ1ZTtcclxuIC8qKlxyXG4gICog5pWw5o2u5o6l5Y+j6YWN572uXHJcbiAgKi9cclxuIHZhciBiYXNlaG9zdCA9ICdodHRwOi8vMTI3LjAuMC4xOjgwMDAnO1xyXG5cclxuIC8qKlxyXG4gICogdXJs5qC85byP5YyWXHJcbiAgKiBAZXhhbXBsZSBidWlsZFVybCgnL3Jlci97c2V4fS9mZXdyL3tpZH0nLHtzZXg6J2FhJyxpZDonMTEnfSlcclxuICAqICAgICAgICAgIOi/lOWbnu+8mi9yZXIvYWEvZmV3ci8xMVxyXG4gICovXHJcbiBmdW5jdGlvbiBidWlsZFVybCh1cmwsZGF0YSxpc2VuY29kZSl7XHJcbiAgICAgdmFyIHJlZyA9IC9cXHsoW2EtekEtQV0rKVxcfS9nO1xyXG4gICAgIHJldHVybiB1cmwucmVwbGFjZShyZWcsIGZ1bmN0aW9uIChhbGwsIGtleSkge1xyXG4gICAgICAgICByZXR1cm4gaXNlbmNvZGU/IGVuY29kZVVSSUNvbXBvbmVudChkYXRhW2tleV0pOiBkYXRhW2tleV07XHJcbiAgICAgfSk7XHJcbiB9XHJcbiAvKipcclxuICAqIOivt+axguaVsOaNruWxgm1vZGVsXHJcbiAgKiBAcGFyYW0ge09iamVjdH0gaW9hcmdzIOS8oOWFpeeahOWPguaVsOWQjCRpb2NvbmZpZy5pb2FyZ3PmoLzlvI/kuIDoh7TvvIzkuIDoiKzmmK/vvJpcclxuICAgICAgKiB7XHJcbiAgICAgICogXHQgICBkYXRhOiB7fVxyXG4gICAgICAqIH1cclxuICAgIEBwYXJhbSB7SlNPTn0gKmlvY2FsbCDkvKDlhaXnmoTlj4LmlbDlkIwkaW9jb25maWcuaW9jYWxs5qC85byP5LiA6Ie077yM5LiA6Iis5piv77yaXHJcbiAgICAqIHtcclxuICAgICogICAgIHN1Y2Nlc3NcclxuICAgICogICAgIGNvbXBsZXRlXHJcbiAgICAqICAgICAvL+S7peS4i+W3sue7j+aciee7n+S4gOWkhOeQhu+8jOWmguaenOaDs+imhuebluWImeiHquihjOS8oOWFpVxyXG4gICAgKiAgICAgZXJyb3JcclxuICAgICogICAgIGZhaWxcclxuICAgICogfVxyXG4gICAgQHBhcmFtIHtPYmplY3R9IHVybERhdGEg6ZKI5a+5dXJs6YeM6Z2i5pyJe+abv+aNouWPguaVsOWQjX3nmoTmg4XlhrXvvIzkvKDlhaXnmoTplK7lgLzlr7nlupTmlbDmja5cclxuICAqL1xyXG4gbW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICAgLyoqXHJcbiAgICAgICog6I635Y+W6aG555uu5paH5Lu255uu5b2V57uT5p6EXHJcbiAgICAgICogdXJsRGF0YToge1xyXG4gICAgICAqICAgICBpZFxyXG4gICAgICAqIH1cclxuICAgICAgKi9cclxuICAgICBtYWluOiBmdW5jdGlvbihpb2FyZ3MsaW9jYWxsLHVybERhdGEpe1xyXG4gICAgICAgICB2YXIgX3VybCA9IGJ1aWxkVXJsKGJhc2Vob3N0KycvdHJhY2VyL21haW4vdHJhY2Uve2lkfScsdXJsRGF0YSx0cnVlKTtcclxuICAgICAgICAgSW50ZXJpby50cmFuc1JlcXVlc3QoJC5leHRlbmQoe1xyXG4gICAgICAgICAgICAgdXJsOiBfdXJsLFxyXG4gICAgICAgICAgICAgbWV0aG9kOidHRVQnXHJcbiAgICAgICAgIH0saW9hcmdzKSxpb2NhbGwpO1xyXG4gICAgIH0sXHJcbiAgICAgLyoqXHJcbiAgICAgICog5YiX6KGo5pWw5o2uXHJcbiAgICAgICovXHJcbiAgICAgbGlzdGRhdGE6IGZ1bmN0aW9uKGlvYXJncyxpb2NhbGwpe1xyXG4gICAgICAgICBJbnRlcmlvLnRyYW5zUmVxdWVzdCgkLmV4dGVuZCh7XHJcbiAgICAgICAgICAgICB1cmw6IGJhc2Vob3N0KycvbGlzdGRhdGEnLFxyXG4gICAgICAgICAgICAgbWV0aG9kOidQT1NUJyxcclxuICAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgICog5aaC5p6c5oOz5a+55o6l5Y+j55qE5pWw5o2u6L+b6KGM57yT5a2Y77yM5YiZ6L+b6KGM5Lul5LiL6YWN572uXHJcbiAgICAgICAgICAgICAgKlxyXG4gICAgICAgICAgICAgICog5pWw5o2u57yT5a2Y77yM5pqC5LiN5Yy65YiG5o6l5Y+j6K+35rGC5Y+C5pWwXHJcbiAgICAgICAgICAgICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICBjdXN0b21jb25maWc6IHtcclxuICAgICAgICAgICAgICAgICBzdG9yYWdlOiBTdG9yYWdlLmxpc3RkYXRhIC8v6YWN572u57yT5a2Y5a+56LGh77yM5b+F5aGrXHJcbiAgICAgICAgICAgICAgICAgLy/lpoLmnpzor7fmsYLor6XmjqXlj6PliY3vvIzopoHmuIXmpZrmiYDmnInmnKzlnLDnvJPlrZjvvIzliJnmt7vliqDmraTphY3nva5cclxuICAgICAgICAgICAgICAgICAvL+Wmgu+8muW9k+WJjeaOpeWPo+aYr+eUqOaIt+eZu+W9lS/pgIDlh7rmjqXlj6PvvIzliJnmuIXpmaTmiYDmnInmlY/mhJ/mlbDmja5cclxuICAgICAgICAgICAgICAgICAvLyBjbGVhcmFsbDogdHJ1ZVxyXG4gICAgICAgICAgICAgfVxyXG4gICAgICAgICB9LGlvYXJncyksaW9jYWxsKTtcclxuICAgICB9LFxyXG5cclxuICAgICAvL+S4uuS6hua1i+ivle+8jOS4gOiIrOS4jeimgVxyXG4gICAgICRpbnRlcmlvOiBJbnRlcmlvLFxyXG4gICAgIGJhc2Vob3N0OiBiYXNlaG9zdFxyXG4gfTtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcg5pS+5Yiw6Ieq5bex55qE6aG555uu5Lit77yM57uf5LiA55qE5pys5Zyw5a2Y5YKo6YWN572uXHJcbiAqIEB2ZXJzaW9uIDEuMCB8IDIwMTctMDUtMjQg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQGV4YW1wbGVcclxuICogKi9cclxuXHJcbmNvbnN0IFN0b3JhZ2UgPSByZXF1aXJlKCdsaWJpby1zdG9yYWdlJyk7XHJcblxyXG4gLyoqXHJcbiAgKiDmnKzlnLDlrZjlgqjlr7nosaHmiYDlsZ7nu4TvvIzlkb3lkI3lj6/oh6rooYzkv67mlLnjgILpu5jorqTmmK9aTVJETEJcclxuICAqIEB0eXBlIHtTdHJpbmd9XHJcbiAgKi9cclxuIC8vIFN0b3JhZ2UuZ3JvdXBuYW1lID0gJ215cHJvamVjdG5hbWUnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICAgbGlzdGRhdGE6IFN0b3JhZ2UuY3JlYXRlKHtcclxuICAgICAgICAgbWF4YWdlOiAnMUQnLCAvL+S/neWtmDHlpKlcclxuICAgICAgICAga2V5OiAnbGlzdGRhdGEnXHJcbiAgICAgfSksXHJcbiAgICAgbGlzdGRhdGF0d286IFN0b3JhZ2UuY3JlYXRlKHtcclxuICAgICAgICAgbWF4YWdlOiAnMC4xSCcsIC8v5L+d5a2YMC4x5bCP5pe2XHJcbiAgICAgICAgIGtleTogJ2xpc3RkYXRhdHdvJ1xyXG4gICAgIH0pXHJcbn07XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IOmhtemdouWfuuacrHZpZXfnsbvjgILmnIDnu4jkuJrliqHpobnnm67kuK3okL3lnLDpobXnmoRqc+mDveW/hemhu+W8leeUqOatpGpz5oiW5YW25a2Q57G7XHJcbiAqIEB2ZXJzaW9uIDEuMCB8IDIwMTYtMTItMjAg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQHJldHVyblxyXG4gKiAqL1xyXG5cclxuIGNvbnN0IEFsZXJ0ID0gcmVxdWlyZSgnLi4vdWkvdWkuYWxlcnQuanMnKSxcclxuICAgICAgIENvbmZpcm0gPSByZXF1aXJlKCcuLi91aS91aS5jb25maXJtLmpzJyksXHJcbiAgICAgICBUb2FzdCA9IHJlcXVpcmUoJy4uL3VpL3VpLnRvYXN0LmpzJyksXHJcbiAgICAgICBMb2FkaW5nID0gcmVxdWlyZSgnLi4vdWkvdWkubG9hZGluZy5qcycpLFxyXG4gICAgICAgVG9vbCA9IHJlcXVpcmUoJ2xpYnV0aWwtdG9vbCcpO1xyXG5cclxuY2xhc3MgQmFzZVZpZXcge1xyXG4gICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICB0aGlzLm5hbWUgPSAnem1yZGxiJztcclxuICAgICAgICAvL+e7keWumuS4gOS6m+W4uOeUqOeahOe7hOS7tuWIsOWFqOWxgOWPmOmHj1xyXG4gICAgICAgIHdpbmRvdy5fQVBQID0ge307XHJcbiAgICAgICAgX0FQUC5BbGVydCA9IEFsZXJ0O1xyXG4gICAgICAgIF9BUFAuQ29uZmlybSA9IENvbmZpcm07XHJcbiAgICAgICAgX0FQUC5Ub2FzdCA9IFRvYXN0O1xyXG4gICAgICAgIF9BUFAuTG9hZGluZyA9IExvYWRpbmc7XHJcbiAgICAgICAgX0FQUC5Ub29sID0gVG9vbDtcclxuICAgIH1cclxuXHJcbiAgICBpbml0KCl7XHJcbiAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5rOo5YaM5LiA5Liq6aG16Z2iXHJcbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9IG9wdCDph4zpnaLphY3nva7nmoTmiYDmnInmlrnms5Xpg73mtL7nlJ/nu5lCYXNlVmlld+eahOWunuS+i1xyXG4gICAgICoge1xyXG4gICAgICogICAgICBfaW5pdDog5q2k5pa55rOV5b+F6aG75pyJ77yM6aG16Z2i5Yid5aeL5YyW5omn6KGMXHJcbiAgICAgKiB9XHJcbiAgICAgKiBAcmV0dXJuIHtpbnN0YW5jZSBvZiBCYXNlVmlld30gICAgIFtkZXNjcmlwdGlvbl1cclxuICAgICAqL1xyXG4gICAgc3RhdGljIHJlZ2lzdGVyKG9wdCl7XHJcbiAgICAgICAgdmFyIHQgPSBuZXcgdGhpcygpO1xyXG4gICAgICAgIGZvcih2YXIga2V5IGluIG9wdCl7XHJcbiAgICAgICAgICAgIHRba2V5XSA9IG9wdFtrZXldO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy/liJ3lp4vljJZcclxuICAgICAgICB0LmluaXQoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQmFzZVZpZXc7XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gXCI8ZGl2IGNsYXNzPVxcXCJ0aXRsZSBqcy10aXRsZVxcXCI+5o+Q56S6PC9kaXY+PGRpdiBjbGFzcz1cXFwiYm9keSBqcy1jb250ZW50XFxcIj48L2Rpdj48ZGl2IGNsYXNzPWZvb3Rlcj48YSBocmVmPWphdmFzY3JpcHQ6OyBjbGFzcz1qcy1vaz7noa7lrpo8L2E+PC9kaXY+XCI7XG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyDlhazlhbFhbGVydOW8ueWxglxyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE2LTExLTE0IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm5cclxuICogKi9cclxuXHJcbiBjb25zdCBBbGVydFNpbmdsZSA9IHJlcXVpcmUoJ2xpYmxheWVyLWFsZXJ0U2luZ2xlJyksXHJcbiAgICAgICAgQ3Nzc3Vwb3J0ID0gcmVxdWlyZSgnbGlidXRpbC1jc3NzdXBvcnQnKSxcclxuICAgICAgICBUcGwgPSByZXF1aXJlKCcuL3VpLmFsZXJ0Lmh0bWwnKTtcclxuXHJcbkFsZXJ0U2luZ2xlLmhpZGVkZXN0cm95ID0gZmFsc2U7XHJcblxyXG5BbGVydFNpbmdsZS5zZXRjb25maWcoe1xyXG4gICAgbGF5ZXI6IHtcclxuICAgICAgICBjbGFzc25hbWU6ICdjb3JldWktZy1sYXllciBjb3JldWktZy13YXJubGF5ZXIgY29yZXVpLWctbGF5ZXItYWxlcnQnLFxyXG4gICAgICAgIGN1c3RvbToge1xyXG4gICAgICAgICAgICBoaWRlOiBmdW5jdGlvbihsYXllcil7XHJcbiAgICAgICAgICAgICAgICBsYXllci5yZW1vdmVDbGFzcygnc2hvdy11cCcpLmFkZENsYXNzKCdoaWRlLXVwJyk7XHJcbiAgICAgICAgICAgICAgICBpZihDc3NzdXBvcnQudHJhbnNpdGlvbil7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXllci5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEFsZXJ0U2luZ2xlLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgICAgICB9LDMwMCk7XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICBsYXllci5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgQWxlcnRTaW5nbGUuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIG1hc2s6IHtcclxuICAgICAgICBjbGFzc25hbWU6ICdjb3JldWktZy1tYXNrJyxcclxuICAgICAgICBvcGFjaXR5OiBDc3NzdXBvcnQudHJhbnNpdGlvbj8gMDogMC42LFxyXG4gICAgICAgIGN1c3RvbToge1xyXG4gICAgICAgICAgICBoaWRlOiBmdW5jdGlvbihtYXNrKXtcclxuICAgICAgICAgICAgICAgIGlmKENzc3N1cG9ydC50cmFuc2l0aW9uKXtcclxuICAgICAgICAgICAgICAgICAgICBtYXNrLmNzcygnb3BhY2l0eScsMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXNrLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9LDMwMCk7XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICBtYXNrLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2hvdzogZnVuY3Rpb24obWFzayl7XHJcbiAgICAgICAgICAgICAgICBpZihDc3NzdXBvcnQudHJhbnNpdGlvbil7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFzay5zaG93KCkuY3NzKCdvcGFjaXR5JywwLjYpO1xyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFzay5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgYWxlcnQ6IHtcclxuICAgICAgICBmcmFtZXRwbDogVHBsXHJcbiAgICB9XHJcbn0pO1xyXG5cclxuQWxlcnRTaW5nbGUuY3JlYXRlY2FsLmFkZChmdW5jdGlvbihsYXllcm9iail7XHJcbiAgICBsYXllcm9iai5sYXllci5hZGRDbGFzcygnaGlkZS11cCcpO1xyXG5cclxuICAgIGxheWVyb2JqLnBvcy5wb3NjYWwuYWRkKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgbGF5ZXJvYmoubGF5ZXIucmVtb3ZlQ2xhc3MoJ2hpZGUtdXAnKS5hZGRDbGFzcygnc2hvdy11cCcpO1xyXG4gICAgfSk7XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBbGVydFNpbmdsZTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBcIjxkaXYgY2xhc3M9XFxcInRpdGxlIGpzLXRpdGxlXFxcIj7mj5DnpLo8L2Rpdj48ZGl2IGNsYXNzPVxcXCJib2R5IGpzLWNvbnRlbnRcXFwiPjwvZGl2PjxkaXYgY2xhc3M9Zm9vdGVyPjxhIGhyZWY9amF2YXNjcmlwdDo7IGNsYXNzPVxcXCJjYW5jZWwganMtY2FuY2VsXFxcIj7lj5bmtog8L2E+IDxhIGhyZWY9amF2YXNjcmlwdDo7IGNsYXNzPWpzLW9rPuehruWumjwvYT4gPGkgY2xhc3M9c3BsaXQ+PC9pPjwvZGl2PlwiO1xuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcg5YWs5YWxY29uZmlybeW8ueWxglxyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE3LTAxLTA2IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm5cclxuICogKi9cclxuXHJcbiBjb25zdCBDb25maXJtU2luZ2xlID0gcmVxdWlyZSgnbGlibGF5ZXItY29uZmlybVNpbmdsZScpLFxyXG4gICAgICAgIENzc3N1cG9ydCA9IHJlcXVpcmUoJ2xpYnV0aWwtY3Nzc3Vwb3J0JyksXHJcbiAgICAgICAgVHBsID0gcmVxdWlyZSgnLi91aS5jb25maXJtLmh0bWwnKTtcclxuXHJcbkNvbmZpcm1TaW5nbGUuaGlkZWRlc3Ryb3kgPSBmYWxzZTtcclxuXHJcbkNvbmZpcm1TaW5nbGUuc2V0Y29uZmlnKHtcclxuICAgIGxheWVyOiB7XHJcbiAgICAgICAgY2xhc3NuYW1lOiAnY29yZXVpLWctbGF5ZXIgY29yZXVpLWctd2FybmxheWVyIGNvcmV1aS1nLWxheWVyLWNvbmZpcm0nLFxyXG4gICAgICAgIGN1c3RvbToge1xyXG4gICAgICAgICAgICBoaWRlOiBmdW5jdGlvbihsYXllcil7XHJcbiAgICAgICAgICAgICAgICBsYXllci5yZW1vdmVDbGFzcygnc2hvdy11cCcpLmFkZENsYXNzKCdoaWRlLXVwJyk7XHJcbiAgICAgICAgICAgICAgICBpZihDc3NzdXBvcnQudHJhbnNpdGlvbil7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXllci5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIENvbmZpcm1TaW5nbGUuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sMzAwKTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIGxheWVyLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICBDb25maXJtU2luZ2xlLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBtYXNrOiB7XHJcbiAgICAgICAgY2xhc3NuYW1lOiAnY29yZXVpLWctbWFzaycsXHJcbiAgICAgICAgb3BhY2l0eTogQ3Nzc3Vwb3J0LnRyYW5zaXRpb24/IDA6IDAuNixcclxuICAgICAgICBjdXN0b206IHtcclxuICAgICAgICAgICAgaGlkZTogZnVuY3Rpb24obWFzayl7XHJcbiAgICAgICAgICAgICAgICBpZihDc3NzdXBvcnQudHJhbnNpdGlvbil7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFzay5jc3MoJ29wYWNpdHknLDApO1xyXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFzay5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwzMDApO1xyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFzay5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNob3c6IGZ1bmN0aW9uKG1hc2spe1xyXG4gICAgICAgICAgICAgICAgaWYoQ3Nzc3Vwb3J0LnRyYW5zaXRpb24pe1xyXG4gICAgICAgICAgICAgICAgICAgIG1hc2suc2hvdygpLmNzcygnb3BhY2l0eScsMC42KTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIG1hc2suc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGNvbmZpcm06IHtcclxuICAgICAgICBmcmFtZXRwbDogVHBsXHJcbiAgICB9XHJcbn0pO1xyXG5cclxuQ29uZmlybVNpbmdsZS5jcmVhdGVjYWwuYWRkKGZ1bmN0aW9uKGxheWVyb2JqKXtcclxuICAgIGxheWVyb2JqLmxheWVyLmFkZENsYXNzKCdoaWRlLXVwJyk7XHJcblxyXG4gICAgbGF5ZXJvYmoucG9zLnBvc2NhbC5hZGQoZnVuY3Rpb24oKXtcclxuICAgICAgICBsYXllcm9iai5sYXllci5yZW1vdmVDbGFzcygnaGlkZS11cCcpLmFkZENsYXNzKCdzaG93LXVwJyk7XHJcbiAgICB9KTtcclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbmZpcm1TaW5nbGU7XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IOS4muWKoeWfuuacrOW8ueWxguexu++8jOWhq+WFheS6huS4gOS6m+agt+W8j+OAguS4muWKoeaJgOacieiHquWumuS5ieW8ueWxguWwhue7p+aJv+atpOexu1xyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE2LTExLTE0IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm5cclxuICogKi9cclxuXHJcbiBjb25zdCBCb21iTGF5ZXIgPSByZXF1aXJlKCdsaWJsYXllci1ib21iTGF5ZXInKSxcclxuICAgICAgICBDc3NzdXBvcnQgPSByZXF1aXJlKCdsaWJ1dGlsLWNzc3N1cG9ydCcpO1xyXG5cclxuY2xhc3MgVUlMYXllciBleHRlbmRzIEJvbWJMYXllciB7XHJcbiAgICAvKipcclxuXHQgKiDlvLnlsYLnsbvigJTigJTliJvlu7rlubbmt7vliqDliLDmjIflrprlrrnlmajkuK1cclxuICAgICAqIEBwYXJhbSB7SlNPTn0gY29uZmlnIOW8ueWxgumFjee9ruWPguaVsCDvvIzkuI3mmK/lv4XloavpoblcclxuICAgICAqIFx0XHR7XHJcbiAgICAgKiBcdCAgICAgICBjb250YWluZXIge0VsZW1lbnR9IOWtmOaUvuW8ueWxgueahOWuueWZqOOAguWPr+S4jeaMh+Wumu+8jOm7mOiupOW8ueWxguWtmOaUvuS6jmJvZHnkuK3nmoTkuIDkuKrliqjmgIHnlJ/miJDnmoRkaXbph4xcclxuICAgICAqIFx0ICAgICAgIHBvczp7fSwgLy/lrprkvY3lj4LmlbDvvIzlhbfkvZPor7TmmI7lj6/op4Hmlrnms5VsYXllci9wb3NpdGlvbkJvbWLkuK3nmoRjb25maWfor7TmmI5cclxuICAgICAqICAgICAgICAgbGF5ZXI6IHt9LCAvL+W8ueWxguS/oeaBr+WPguaVsO+8jOWFt+S9k+ivtOaYjuWPr+ingeaWueazlWxheWVyL2xheWVy5Lit55qEY29uZmln6K+05piOXHJcbiAgICAgKiBcdFx0ICAgbWFzazogeyAvL+mBrue9qeS/oeaBr+WPguaVsO+8jOWFt+S9k+ivtOaYjuWPr+ingeaWueazlWxheWVyL21hc2vkuK3nmoRjb25maWfor7TmmI7jgILlnKjmraTln7rnoYDkuIrov5vooYzku6XkuIvmianlsZVcclxuICAgICAqIFx0XHRcdCAgbWFzazogdHJ1ZSwgLy/mmK/lkKbliJvlu7rpga7nvalcclxuICAgICAqICAgICAgICAgICAgY21saGlkZTogZmFsc2UgLy/ngrnlh7vpga7nvanmmK/lkKblhbPpl63lvLnlsYJcclxuICAgICAqIFx0XHQgICB9XHJcbiAgICAgKiAgICAgIH1cclxuXHQgKi9cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZyl7XHJcbiAgICAgICAgLy/mt7vliqDoh6rlrprkuYnlj4LmlbBcclxuICAgICAgICBjb25maWcgPSAkLmV4dGVuZCh0cnVlLHtcclxuICAgICAgICAgICAgbGF5ZXI6IHtcclxuICAgICAgICAgICAgICAgIGNsYXNzbmFtZTogJ2NvcmV1aS1nLWxheWVyJyxcclxuICAgICAgICAgICAgICAgIHNob3c6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgY3VzdG9tOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaGlkZTogZnVuY3Rpb24obGF5ZXIpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXllci5yZW1vdmVDbGFzcygnc2hvdy11cCcpLmFkZENsYXNzKCdoaWRlLXVwJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKENzc3N1cG9ydC50cmFuc2l0aW9uKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXllci5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuaGlkZWFmdGVyY2FsLmZpcmUoKTsgLy/lsYLpmpDol4/lkI7lm57osINcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sMzAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXllci5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5oaWRlYWZ0ZXJjYWwuZmlyZSgpOyAvL+WxgumakOiXj+WQjuWbnuiwg1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBtYXNrOiB7XHJcbiAgICAgICAgICAgICAgICBjbGFzc25hbWU6ICdjb3JldWktZy1tYXNrJyxcclxuICAgICAgICAgICAgICAgIG9wYWNpdHk6IENzc3N1cG9ydC50cmFuc2l0aW9uPyAwOiAwLjYsXHJcbiAgICAgICAgICAgICAgICBjdXN0b206IHtcclxuICAgICAgICAgICAgICAgICAgICBoaWRlOiBmdW5jdGlvbihtYXNrKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoQ3Nzc3Vwb3J0LnRyYW5zaXRpb24pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFzay5jc3MoJ29wYWNpdHknLDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hc2suaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwzMDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hc2suaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBzaG93OiBmdW5jdGlvbihtYXNrKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoQ3Nzc3Vwb3J0LnRyYW5zaXRpb24pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFzay5zaG93KCkuY3NzKCdvcGFjaXR5JywwLjYpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hc2suc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxjb25maWcgfHwge30pO1xyXG5cclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgdmFyIF9sYXllciA9IHRoaXMubGF5ZXI7XHJcblxyXG4gICAgICAgIF9sYXllci5hZGRDbGFzcygnaGlkZS11cCcpO1xyXG5cclxuICAgICAgICB0aGlzLnBvcy5wb3NjYWwuYWRkKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIF9sYXllci5yZW1vdmVDbGFzcygnaGlkZS11cCcpLmFkZENsYXNzKCdzaG93LXVwJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgaGlkZSgpe1xyXG4gICAgICAgIGlmKHRoaXMuaXNzaG93KCkpe1xyXG5cdFx0XHR0aGlzLmhpZGViZWZvcmVjYWwuZmlyZSgpOyAvL+WxgumakOiXj+WJjeWbnuiwg1xyXG5cdFx0XHR0aGlzLm1hc2sgJiYgdGhpcy5tYXNrLmhpZGUoKTtcclxuXHRcdFx0dGhpcy5faGlkZSgpO1xyXG5cdFx0fVxyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFVJTGF5ZXI7XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IGxvYWRpbmcg5o+Q56S65bGCXHJcbiAqIEB2ZXJzaW9uIDEuMCB8IDIwMTYtMDEtMDYg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQHJldHVyblxyXG4gKiAqL1xyXG4gY29uc3QgVUlMYXllciA9IHJlcXVpcmUoJy4vdWkubGF5ZXIuanMnKSxcclxuICAgICAgICBXb3JrZXJDb250cm9sID0gcmVxdWlyZSgnbGlidXRpbC13b3JrZXJDb250cm9sJyk7XHJcblxyXG52YXIgd29ya2VyQ29udHJvbCA9IG5ldyBXb3JrZXJDb250cm9sKCk7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVMb2FkaW5nKHdvcmtlcil7XHJcbiAgICB3b3JrZXIubG9hZGluZyA9IG5ldyBVSUxheWVyKHtcclxuICAgICAgICBsYXllcjoge1xyXG4gICAgICAgICAgICBjbGFzc25hbWU6ICdjb3JldWktZy1sYXllciBjb3JldWktZy1sYXllci1sb2FkaW5nJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWFzazoge1xyXG4gICAgICAgICAgICBiZ2NvbG9yOiAndHJhbnNwYXJlbnQnIC8v6IOM5pmv6ImyXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgd29ya2VyLmxvYWRpbmcuaGlkZWFmdGVyY2FsLmFkZChmdW5jdGlvbigpe1xyXG4gICAgICAgIHdvcmtlci5sb2FkaW5nLmRlc3Ryb3koKTtcclxuICAgICAgICB3b3JrZXIubG9hZGluZyA9IG51bGw7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gd29ya2VyLmxvYWRpbmc7XHJcbn1cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIHNob3c6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdmFyIGxvYWRpbmcgPSBjcmVhdGVMb2FkaW5nKHdvcmtlckNvbnRyb2wuZ2V0KCkpO1xyXG4gICAgICAgIGxvYWRpbmcuc2hvdygpO1xyXG4gICAgfSxcclxuICAgIGhpZGU6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdmFyIHdvcmtlciA9IHdvcmtlckNvbnRyb2wuZW5kKCk7XHJcbiAgICAgICAgaWYod29ya2VyKXtcclxuICAgICAgICAgICAgd29ya2VyLmxvYWRpbmcuaGlkZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyB0b2FzdCDmj5DnpLrlsYJcclxuICogQHZlcnNpb24gMS4wIHwgMjAxNi0wMS0wNiDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAcmV0dXJuXHJcbiAqICovXHJcbiBjb25zdCBVSUxheWVyID0gcmVxdWlyZSgnLi91aS5sYXllci5qcycpLFxyXG4gICAgICAgIFdvcmtlckNvbnRyb2wgPSByZXF1aXJlKCdsaWJ1dGlsLXdvcmtlckNvbnRyb2wnKTtcclxuXHJcbnZhciB3b3JrZXJDb250cm9sID0gbmV3IFdvcmtlckNvbnRyb2woKTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVRvYXN0KHdvcmtlcil7XHJcbiAgICB3b3JrZXIudG9hc3QgPSBuZXcgVUlMYXllcih7XHJcbiAgICAgICAgbGF5ZXI6IHtcclxuICAgICAgICAgICAgY2xhc3NuYW1lOiAnY29yZXVpLWctbGF5ZXIgY29yZXVpLWctbGF5ZXItdG9hc3QnXHJcbiAgICAgICAgfSxcclxuICAgICAgICBtYXNrOiB7XHJcbiAgICAgICAgICAgIGJnY29sb3I6ICcjZmZmJyAvL+iDjOaZr+iJslxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHdvcmtlci50b2FzdC5oaWRlYWZ0ZXJjYWwuYWRkKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgd29ya2VyLnRvYXN0LmRlc3Ryb3koKTtcclxuICAgICAgICB3b3JrZXIudG9hc3QgPSBudWxsO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHdvcmtlci50b2FzdDtcclxufVxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgc2hvdzogZnVuY3Rpb24oY29udGVudCxoaWRlYWZ0ZXJjYWwpe1xyXG4gICAgICAgIHZhciB0b2FzdCA9IGNyZWF0ZVRvYXN0KHdvcmtlckNvbnRyb2wuZ2V0KCkpO1xyXG4gICAgICAgIHRvYXN0LnNldENvbnRlbnQoY29udGVudCk7XHJcbiAgICAgICAgdG9hc3QuaGlkZWFmdGVyY2FsLmFkZChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBpZih0eXBlb2YgaGlkZWFmdGVyY2FsID09ICdmdW5jdGlvbicpe1xyXG4gICAgICAgICAgICAgICAgaGlkZWFmdGVyY2FsKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0b2FzdC5zaG93KCk7XHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB0b2FzdC5oaWRlKCk7XHJcbiAgICAgICAgfSwyMDAwKTtcclxuICAgIH1cclxufVxyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyBpb+aOpeWPo+ivt+axguaOp+WItuWZqO+8jOWcqCQuYWpheOS4iui/m+ihjOi/m+S4gOatpeWwgeijhVxyXG4gKiAgICAgIDEuIOaUr+aMgeaOpeWPo+mYn+WIl+ivt+axglxyXG4gKiAgICAgIDIuIOaUr+aMgeaOpeWPo+aVsOaNrue8k+WtmFxyXG4gKiAgICAgIDMuIOaUr+aMgeaOpeWPo+e7n+S4gOS4muWKoemUmeivr+WPiuWFtuS7luaDheWGteWkhOeQhlxyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE1LTA2LTI4IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm4g5pu05aSa6K+m57uG5L+h5oGv5Y+C6ICD5Luj56CB6YeM5a+55bqU5a6a5LmJ5pa55rOV5oiW5bGe5oCn5L2N572u55qE5rOo6YeK6K+05piOXHJcbiAqIFx0dHJhbnNSZXF1ZXN0IHtGdW5jdGlvbn0g5omn6KGM5o6l5Y+j5o6l5Y+j6K+35rGCXHJcbiAqICB0cmFuc1F1ZXVlUmVxdWVzdCB7RnVuY3Rpb259IOWvueS4gOe7hOivt+axgui/m+ihjOWNleeLrOeahOmYn+WIl+aOp+WItuS+neasoeivt+axguOAguWFqOmDqOivt+axguWujOavleWQjui/m+ihjOmAmuefpeOAglxyXG4gKiBAZXhhbXBsZVxyXG4gKiAgIHZhciBiYXNlaG9zdCA9ICdodHRwOi8vMTI3LjAuMC4xOjgwMDAnO1xyXG4gKlxyXG4gKiBcdCBjb25zdCBJbnRlcklvID0gcmVxdWlyZSgnbGliaW8taW50ZXJpbycpO1xyXG4gKlxyXG4gKiBcdCBJbnRlcklvLnRyYW5zUmVxdWVzdCh7XHJcblx0XHQgdXJsOiBiYXNlaG9zdCsnL2xpc3RkYXRhJyxcclxuXHRcdCBtZXRob2Q6J1BPU1QnLFxyXG5cdFx0IGRhdGE6IHsnbmFtZSc6ICd6bXJkbGInfVxyXG5cdCB9LHtcclxuXHRcdCBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKXtcclxuXHRcdFx0IGNvbnNvbGUubG9nKGRhdGEpO1xyXG5cdFx0IH1cclxuXHRcdCAvLyBmYWlsOiBmdW5jdGlvbigpe1xyXG5cdFx0IC8vICAgICBjb25zb2xlLmxvZygn6KaG55uW57uf5LiAZmFpbOWkhOeQhicpO1xyXG5cdFx0IC8vIH0sXHJcblx0XHQgLy8gZXJyb3I6IGZ1bmN0aW9uKCl7XHJcblx0XHQgLy8gICAgIGNvbnNvbGUubG9nKCfopobnm5bnu5/kuIBlcnJvcuWkhOeQhicpO1xyXG5cdFx0IC8vIH0sXHJcblx0XHQgLy8gY29tcGxldGU6IGZ1bmN0aW9uKCl7XHJcblx0XHQgLy8gICAgIGNvbnNvbGUubG9nKCflrozmiJAnKTtcclxuXHRcdCAvLyB9XHJcblx0IH0pO1xyXG4gKiAqL1xyXG5cclxuY29uc3QgSW9Db25maWcgPSByZXF1aXJlKCcuL2lvY29uZmlnLmpzJyksXHJcblx0XHRTdG9yYWdlID0gcmVxdWlyZSgnLi9zdG9yYWdlLmpzJyk7XHJcblxyXG4vL+ivt+axgumYn+WIl+aOp+WItuexu1xyXG5mdW5jdGlvbiBxdWV1ZUhhbmRsZSgpe1xyXG5cdHRoaXMucXVldWUgPSBbXTsgLy/lvZPliY3pmJ/liJfmlbDmja5cclxuXHR0aGlzLmlucHJvY2VzcyA9IGZhbHNlOyAvL+W9k+WJjemYn+WIl+aOpeWPo+aYr+WQpuato+WcqOWkhOeQhlxyXG5cdHRoaXMuY29tcGxldGUgPSBmdW5jdGlvbigpe307IC8v6Zif5YiX6K+35rGC5a6M5oiQ5ZCO55qE5Zue6LCDXHJcbn07XHJcbi8v5omn6KGM6Zif5YiX5pWw5o2u6K+35rGCXHJcbnF1ZXVlSGFuZGxlLnByb3RvdHlwZS5hZHZhbmNlID0gZnVuY3Rpb24oKXtcclxuXHRpZih0aGlzLnF1ZXVlLmxlbmd0aCA9PSAwKXtcclxuXHRcdHRoaXMuaW5wcm9jZXNzID0gZmFsc2U7XHJcblx0XHRpZih0eXBlb2YgdGhpcy5jb21wbGV0ZSA9PSAnZnVuY3Rpb24nKXtcclxuXHRcdFx0dGhpcy5jb21wbGV0ZSgpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHR2YXIgcmVxID0gdGhpcy5xdWV1ZS5zaGlmdCgpO1xyXG5cdHRoaXMucmVxdWVzdChyZXEsdHJ1ZSk7XHJcbn07XHJcbi8qKlxyXG4qIOa3u+WKoOaOpeWPo+ivt+axguWkhOeQhlxyXG4qIEBwYXJhbSB7SlNPTn0gKm9wdCBmb3JtYXTlkI7nmoTmjqXlj6Plj4LmlbBcclxuKiBAcGFyYW0ge0Jvb2xlYW59IGFkdmFuY2Ug5piv5ZCm5pivcXVldWVIYW5kZXIuYWR2YW5jZeiwg+eUqFxyXG4qL1xyXG5xdWV1ZUhhbmRsZS5wcm90b3R5cGUucmVxdWVzdCA9IGZ1bmN0aW9uKG9wdCxhZHZhbmNlKXtcclxuXHRpZih0aGlzLmlucHJvY2VzcyAmJiAhYWR2YW5jZSl7XHJcblx0XHR0aGlzLnF1ZXVlLnB1c2gob3B0KTtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0dGhpcy5pbnByb2Nlc3MgPSB0cnVlO1xyXG5cdHJlcXVlc3Qob3B0KTtcclxufTtcclxuLyoqXHJcbiAqIHF1ZXVlSGFuZGxl5a+56LGh5o6n5Yi25ZmoXHJcbiAqL1xyXG52YXIgcXVldWVDb250cm9sID0ge1xyXG5cdF9xdWV1ZW9ianM6IFtdLCAvL3F1ZXVlSGFuZGxl5a+56LGh5YiX6KGoXHJcblx0Z2V0OiBmdW5jdGlvbigpeyAvL+i/lOWbnuW9k+WJjeepuumXsueahHF1ZXVlSGFuZGxl5a+56LGhXHJcblx0XHR2YXIgY3VycXVldWUgPSBudWxsO1xyXG5cdFx0dmFyIHF1ZXVlb2JqcyA9IHRoaXMuX3F1ZXVlb2JqcztcclxuXHRcdGZvcih2YXIgaSA9IDAsIGxlbiA9IHF1ZXVlb2Jqcy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XHJcblx0XHRcdGlmKHF1ZXVlb2Jqc1tpXS5pbnByb2Nlc3MgPT0gZmFsc2UgJiYgcXVldWVvYmpzW2ldLmxvY2sgPT0gZmFsc2UpeyAvL+aXouaXoOivt+axguWPiOayoeacieiiq+mUgeWumlxyXG5cdFx0XHRcdHF1ZXVlb2Jqc1tpXS5sb2NrID0gdHJ1ZTtcclxuXHRcdFx0XHRjdXJxdWV1ZSA9IHF1ZXVlb2Jqc1tpXTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0aWYoY3VycXVldWUgPT0gbnVsbCl7XHJcblx0XHRcdGN1cnF1ZXVlID0gbmV3IHF1ZXVlSGFuZGxlKCk7XHJcblx0XHRcdGN1cnF1ZXVlLmxvY2sgPSB0cnVlO1xyXG5cdFx0XHR0aGlzLl9xdWV1ZW9ianMucHVzaChjdXJxdWV1ZSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gY3VycXVldWU7XHJcblx0fSxcclxuXHRlbmQ6IGZ1bmN0aW9uKHF1ZXVlKXsgLy/pgJrnn6XlvZPliY1xdWV1ZUhhbmRsZeWvueixoeW3sue7j+S9v+eUqOWujOavlVxyXG5cdFx0dmFyIHF1ZXVlb2JqcyA9IHRoaXMuX3F1ZXVlb2JqcztcclxuXHRcdGZvcih2YXIgaSA9IDAsIGxlbiA9IHF1ZXVlb2Jqcy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XHJcblx0XHRcdGlmKHF1ZXVlb2Jqc1tpXSA9PSBxdWV1ZSl7IC8v5pei5peg6K+35rGC5Y+I5rKh5pyJ6KKr6ZSB5a6aXHJcblx0XHRcdFx0cXVldWVvYmpzW2ldLmxvY2sgPSBmYWxzZTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuLyoqXHJcbiAqIOagvOW8j+WMlmlv5o6l5Y+j6K+35rGC5Y+C5pWwXHJcbiAqIEBwYXJhbSB7SlNPTn0gKmlvb3B0IOaVsOaNruaOpeWPo+WPguaVsFxyXG4gKiBwYXJhbSB7SlNPTn0gKmlvY2FsbCBpb+ivt+axguWbnuiwg1xyXG4gKiBAcGFyYW0ge3F1ZXVlSGFuZGxlfSAqcXVldWVvYmog6Zif5YiX5o6n5Yi25Zmo5a+56LGhXHJcbiAqL1xyXG5mdW5jdGlvbiBmb3JtYXQoaW9hcmdzLGlvY2FsbCxxdWV1ZW9iail7XHJcblx0dmFyIF9pb2FyZ3MgPSB7fSwgX2lvY2FsbCA9IHt9O1xyXG5cdCQuZXh0ZW5kKHRydWUsX2lvYXJncyxJb0NvbmZpZy5pb2FyZ3MsaW9hcmdzKTtcclxuXHQkLmV4dGVuZCh0cnVlLF9pb2NhbGwsSW9Db25maWcuaW9jYWxsLGlvY2FsbCk7XHJcblx0SW9Db25maWcuZm9ybWF0KF9pb2FyZ3MpO1xyXG5cdHZhciBvbGRzdWNjZXNzID0gX2lvY2FsbC5zdWNjZXNzO1xyXG5cdHZhciBvbGRjb21wbGV0ZSA9IF9pb2NhbGwuY29tcGxldGU7XHJcblx0dmFyIGRlYWxsb2dpbiA9IF9pb2FyZ3MuY3VzdG9tY29uZmlnLmRlYWxsb2dpbjtcclxuXHR2YXIgZGVhbGZhaWwgPSBfaW9hcmdzLmN1c3RvbWNvbmZpZy5kZWFsZmFpbDtcclxuXHR2YXIgZGVhbGRhdGEgPSBfaW9hcmdzLmN1c3RvbWNvbmZpZy5kZWFsZGF0YTtcclxuXHRfaW9jYWxsLnN1Y2Nlc3MgPSBmdW5jdGlvbihkYXRhLCB0ZXh0U3RhdHVzLCBqcVhIUil7IC8v6YeN5YaZc3VjY2Vzc+aWueazle+8jOeUqOadpeWkhOeQhuacqueZu+mZhumXrumimFxyXG5cdFx0aWYoZGVhbGxvZ2luICYmIHR5cGVvZiBJb0NvbmZpZy5sb2dpbi5maWx0ZXIgPT0gJ2Z1bmN0aW9uJyl7IC8v55uR5rWL5piv5ZCm5pyJ5pyq55m76ZmG6ZSZ6K+v5aSE55CGXHJcblx0XHRcdGlmKElvQ29uZmlnLmxvZ2luLmZpbHRlcihkYXRhKSl7IC8v5pyq55m75b2VXHJcblx0XHRcdCAgICBpZihJb0NvbmZpZy5sb2dpbi51cmwgIT0gJycpeyAvL+i3s+i9rHVybFxyXG5cdFx0XHQgICAgICAgIHZhciBsb2dpbnVybCA9IElvQ29uZmlnLmxvZ2luLnVybDtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc2VhcmNoID0gSW9Db25maWcubG9naW4ua2V5Kyc9JytlbmNvZGVVUklDb21wb25lbnQobG9jYXRpb24uaHJlZik7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYobG9naW51cmwubGFzdEluZGV4T2YoJz8nKSAhPSAtMSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2ludXJsID0gbG9naW51cmwucmVwbGFjZSgvXFw/LywnPycrc2VhcmNoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9naW51cmwgPSBsb2dpbnVybCsnPycrc2VhcmNoO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gbG9naW51cmw7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cdFx0XHQgICAgfWVsc2UgaWYodHlwZW9mIElvQ29uZmlnLmxvZ2luLmRlYWwgPT0gJ2Z1bmN0aW9uJyl7XHJcblx0XHRcdCAgICAgICAgSW9Db25maWcubG9naW4uZGVhbChkYXRhKTtcclxuXHRcdFx0ICAgICAgICByZXR1cm47XHJcblx0XHRcdCAgICB9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGlmKGRlYWxmYWlsICYmIHR5cGVvZiBJb0NvbmZpZy5mYWlsLmZpbHRlciA9PSAnZnVuY3Rpb24nKXsgLy/mo4DmtYvmmK/lkKbmnInkuJrliqHplJnor6/lpITnkIZcclxuXHRcdCAgICBpZihJb0NvbmZpZy5mYWlsLmZpbHRlcihkYXRhKSl7IC8v5Lia5Yqh6ZSZ6K+vXHJcblx0XHQgICAgICAgIGlmKHR5cGVvZiBfaW9jYWxsW0lvQ29uZmlnLmZhaWwuZnVubmFtZV0gPT0gJ2Z1bmN0aW9uJyl7XHJcblx0XHQgICAgICAgICAgICBfaW9jYWxsW0lvQ29uZmlnLmZhaWwuZnVubmFtZV0oZGF0YSwgdGV4dFN0YXR1cywganFYSFIpO1xyXG5cdFx0ICAgICAgICB9XHJcblx0XHQgICAgfWVsc2V7IC8v5Lia5Yqh5oiQ5YqfXHJcblx0XHQgICAgICAgIGlmKGRlYWxkYXRhKXsgLy/nu5/kuIDlpITnkIbkuJrliqHmiJDlip/mlbDmja5cclxuXHRcdCAgICAgICAgICAgIHR5cGVvZiBvbGRzdWNjZXNzID09ICdmdW5jdGlvbicgJiYgb2xkc3VjY2VzcyhfaW9hcmdzLmRlYWxkYXRhKGRhdGEsIHRleHRTdGF0dXMsIGpxWEhSKSwgdGV4dFN0YXR1cywganFYSFIpO1xyXG5cdFx0ICAgICAgICB9ZWxzZXtcclxuXHRcdCAgICAgICAgICAgIHR5cGVvZiBvbGRzdWNjZXNzID09ICdmdW5jdGlvbicgJiYgb2xkc3VjY2VzcyhkYXRhLCB0ZXh0U3RhdHVzLCBqcVhIUik7XHJcblx0XHQgICAgICAgIH1cclxuXHRcdCAgICB9XHJcblx0XHR9ZWxzZXtcclxuXHRcdCAgICB0eXBlb2Ygb2xkc3VjY2VzcyA9PSAnZnVuY3Rpb24nICYmIG9sZHN1Y2Nlc3MoZGF0YSwgdGV4dFN0YXR1cywganFYSFIpO1xyXG5cdFx0fVxyXG5cdH07XHJcblx0aWYoX2lvYXJncy5jdXN0b21jb25maWcucXVldWUpeyAvL+ivtOaYjuaOpeWPo+WQjOaEj+i/m+ihjOmYn+WIl+aOp+WItlxyXG5cdFx0X2lvY2FsbC5jb21wbGV0ZSA9IGZ1bmN0aW9uKCl7IC8v6YeN5YaZ5o6l5Y+j6K+35rGC5a6M5oiQ5LqL5Lu2XHJcblx0XHRcdHF1ZXVlb2JqLmFkdmFuY2UoKTtcclxuXHRcdFx0dHlwZW9mIG9sZGNvbXBsZXRlID09ICdmdW5jdGlvbicgJiYgb2xkY29tcGxldGUuYXBwbHkodGhpcyxBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcclxuXHRcdH07XHJcblx0fVxyXG5cdHJldHVybiB7XHJcblx0XHRpb2FyZ3M6IF9pb2FyZ3MsXHJcblx0XHRpb2NhbGw6IF9pb2NhbGxcclxuXHR9O1xyXG59XHJcbmZ1bmN0aW9uIGRvYWpheChpb2FyZ3MsaW9jYWxsKXtcclxuXHR2YXIgaW50ZXJvYmogPSBudWxsLFxyXG5cdFx0Z2V0SW50ZXIgPSBpb2FyZ3MuY3VzdG9tY29uZmlnLmdldEludGVyLFxyXG5cdFx0c3RvcmFnZSA9IGlvYXJncy5jdXN0b21jb25maWcuc3RvcmFnZTtcclxuXHRkZWxldGUgaW9hcmdzLmN1c3RvbWNvbmZpZztcclxuXHJcblx0aW50ZXJvYmogPSAkLmFqYXgoaW9hcmdzKS5kb25lKGlvY2FsbC5zdWNjZXNzKS5mYWlsKGlvY2FsbC5lcnJvcikuYWx3YXlzKGlvY2FsbC5jb21wbGV0ZSkuZG9uZShmdW5jdGlvbihkYXRhKXtcclxuXHRcdGlmKHN0b3JhZ2UgJiYgc3RvcmFnZSBpbnN0YW5jZW9mIFN0b3JhZ2Upe1xyXG5cdFx0XHRzdG9yYWdlLnNldChkYXRhKTtcclxuXHRcdH1cclxuXHR9KTtcclxuXHRpZihpbnRlcm9iaiAmJiB0eXBlb2YgZ2V0SW50ZXIgPT0gJ2Z1bmN0aW9uJyl7XHJcblx0XHRnZXRJbnRlcihpbnRlcm9iaik7XHJcblx0fVxyXG59XHJcbi8qKlxyXG4gKiDlpITnkIbmjqXlj6Por7fmsYJcclxuICogQHBhcmFtIHtKU09OfSBpb29wdCBmb3JtYXTlkI7nmoTmjqXlj6Plj4LmlbBcclxuICovXHJcbmZ1bmN0aW9uIHJlcXVlc3QoaW9vcHQpe1xyXG5cdHZhciBfaW9hcmdzID0gaW9vcHQuaW9hcmdzLFxyXG5cdFx0X2lvY2FsbCA9IGlvb3B0LmlvY2FsbCxcclxuXHRcdG1vZGUgPSBfaW9hcmdzLmN1c3RvbWNvbmZpZy5tb2RlLFxyXG5cdFx0Y2xlYXJhbGwgPSBfaW9hcmdzLmN1c3RvbWNvbmZpZy5jbGVhcmFsbCxcclxuXHRcdHN0b3JhZ2UgPSBfaW9hcmdzLmN1c3RvbWNvbmZpZy5zdG9yYWdlLFxyXG5cdFx0Y2FjaGVkYXRhID0gbnVsbDtcclxuXHJcblx0Ly/muIXpmaTmiYDmnInnvJPlrZhcclxuXHRpZihjbGVhcmFsbCl7XHJcblx0XHRTdG9yYWdlLmNsZWFyKCk7XHJcblx0fVxyXG5cclxuXHQvL+aYr+WQpuaciee8k+WtmFxyXG5cdGlmKHN0b3JhZ2UgJiYgc3RvcmFnZSBpbnN0YW5jZW9mIFN0b3JhZ2UgJiYgKChjYWNoZWRhdGEgPSBzdG9yYWdlLmdldCgpKSAhPSBudWxsKSl7XHJcblx0XHRfaW9jYWxsLnN1Y2Nlc3MoY2FjaGVkYXRhLCAnc3VjY2VzcycsIG51bGwpO1xyXG5cdFx0X2lvY2FsbC5jb21wbGV0ZSgpO1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHJcblx0aWYobW9kZSA9PSAnYWpheCcpe1xyXG5cdFx0aWYoX2lvYXJncy5kYXRhVHlwZSA9PSB1bmRlZmluZWQgfHwgX2lvYXJncy5kYXRhVHlwZSA9PSAnJyl7XHJcblx0XHRcdF9pb2FyZ3MuZGF0YVR5cGUgPSAnanNvbic7XHJcblx0XHR9XHJcblx0XHRkb2FqYXgoX2lvYXJncyxfaW9jYWxsKTtcclxuXHR9ZWxzZSBpZihtb2RlID09ICdqc29ucCcpe1xyXG5cdFx0X2lvYXJncy5kYXRhVHlwZSA9ICdqc29ucCc7XHJcblx0XHRfaW9hcmdzLmNyb3NzRG9tYWluID0gdHJ1ZTtcclxuXHRcdGRvYWpheChfaW9hcmdzLF9pb2NhbGwpO1xyXG5cdH1lbHNlIGlmKG1vZGUgPT0gJ3NjcmlwdCcpe1xyXG5cdFx0X2lvYXJncy5kYXRhVHlwZSA9ICdzY3JpcHQnO1xyXG5cdFx0X2lvYXJncy5jcm9zc0RvbWFpbiA9IHRydWU7XHJcblx0XHRkb2FqYXgoX2lvYXJncyxfaW9jYWxsKTtcclxuXHR9XHJcbn1cclxudmFyIG1haW5xdWV1ZSA9IG5ldyBxdWV1ZUhhbmRsZSgpOyAvL+S4u+e6v+eoi+mYn+WIl+aOp+WItuWvueixoVxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHQvKipcclxuXHQgKiDmiafooYzmjqXlj6Por7fmsYJcclxuICAgICAqIEBwYXJhbSB7SlNPTn0gKmlvYXJncyDmjqXlj6PmianlsZXlj4LmlbDjgILlr7nlupRpb2NvbmZpZy5qc+mHjOeahGlvYXJnc+mFjee9ruagvOW8j1xyXG4gICAgICogQHBhcmFtIHtKU09OfSAqaW9jYWxsIOaOpeWPo+aJqeWxleWPguaVsOOAguWvueW6lGlvY29uZmlnLmpz6YeM55qEaW9jYWxs6YWN572u5qC85byPXHJcblx0ICovXHJcblx0dHJhbnNSZXF1ZXN0OiBmdW5jdGlvbihpb2FyZ3MsaW9jYWxsKXtcclxuXHRcdGlmKGlvYXJncyAmJiBpb2NhbGwgJiYgaW9hcmdzLnVybCAhPSAnJyl7XHJcblx0XHRcdHZhciBjdXJvcHQgPSBmb3JtYXQoaW9hcmdzLGlvY2FsbCxtYWlucXVldWUpO1xyXG5cdFx0XHRpZihjdXJvcHQuaW9hcmdzLmN1c3RvbWNvbmZpZy5xdWV1ZSl7IC8v6K+05piO6YG15b6q6Zif5YiX5o6n5Yi2XHJcblx0XHRcdFx0bWFpbnF1ZXVlLnJlcXVlc3QoY3Vyb3B0KTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNle1xyXG5cdFx0XHRcdHJlcXVlc3QoY3Vyb3B0KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0sXHJcblx0LyoqXHJcblx0ICog5a+55LiA57uE6K+35rGC6L+b6KGM5Y2V54us55qE6Zif5YiX5o6n5Yi25L6d5qyh6K+35rGC44CC5YWo6YOo6K+35rGC5a6M5q+V5ZCO6L+b6KGM6YCa55+l44CCXHJcblx0ICog5q2k5oOF5Ya15LiL77yM6YCa6L+HaW9hcmdz6K6+572u55qE5Y+C5pWw6YWN572uY3VzdG9tY29uZmlnOntxdWV1ZTp0cnVlfGZhbHNlfeaXoOaViOOAguW8uuWItumDvei1sOmYn+WIl1xyXG5cdFx0ICogQHBhcmFtIHtBcnJheX0gKmFyZ3NhcnIg5o6l5Y+j6K+35rGC5pWw57uEXHJcblx0XHQgKiBbe1xyXG5cdFx0ICogICAge0pTT059ICppb2FyZ3Mg5o6l5Y+j5omp5bGV5Y+C5pWw44CC5a+55bqUaW9jb25maWcuanPph4znmoRpb2FyZ3PphY3nva7moLzlvI9cclxuXHRcdCAqICAgIHtKU09OfSAqaW9jYWxsIOaOpeWPo+aJqeWxleWPguaVsOOAguWvueW6lGlvY29uZmlnLmpz6YeM55qEaW9jYWxs6YWN572u5qC85byPXHJcblx0XHQgKiB9XVxyXG5cdFx0ICogQHBhcmFtIHtKU09OfSBjdXN0b21vYmog55So5oi36Ieq5a6a5LmJ5omp5bGV5Y+C5pWwXHJcblx0XHQgKiB7XHJcblx0XHQgKiBcdCAge0Z1bmN0aW9ufSBjb21wbGV0ZSDmjqXlj6Plhajpg6jor7fmsYLlrozmr5XlkI7nmoTpgJrnn6Xlm57osINcclxuXHRcdCAqIH1cclxuXHQgKi9cclxuXHR0cmFuc1F1ZXVlUmVxdWVzdDogZnVuY3Rpb24oYXJnc2FycixjdXN0b21vYmope1xyXG5cdFx0aWYoJC5pc0FycmF5KGFyZ3NhcnIpICYmIGFyZ3NhcnIubGVuZ3RoID4gMCl7XHJcblx0XHRcdHZhciBxdWV1ZW9iaiA9IHF1ZXVlQ29udHJvbC5nZXQoKTsgLy/ojrflj5bkuIDkuKrnqbrpl7LnmoRxdWV1ZUhhbmRsZVxyXG5cdFx0XHRxdWV1ZW9iai5jb21wbGV0ZSA9IGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0cXVldWVDb250cm9sLmVuZChxdWV1ZW9iaik7IC8v6YCa55+l5b2T5YmNcXVldWXlr7nosaHkvb/nlKjlrozmr5VcclxuXHRcdFx0XHRpZihjdXN0b21vYmogJiYgdHlwZW9mIGN1c3RvbW9iai5jb21wbGV0ZSA9PSAnZnVuY3Rpb24nKXtcclxuXHRcdFx0XHRcdGN1c3RvbW9iai5jb21wbGV0ZSgpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fTtcclxuXHRcdFx0Zm9yKHZhciBpID0gMCwgbGVuID0gYXJnc2Fyci5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XHJcblx0XHRcdFx0dmFyIGlvYXJncyA9IGFyZ3NhcnJbaV0uaW9hcmdzIHx8IHt9O1xyXG5cdFx0XHRcdHZhciBpb2NhbGwgPSBhcmdzYXJyW2ldLmlvY2FsbCB8fCB7fTtcclxuXHRcdFx0XHRpZihpb2FyZ3MgJiYgaW9jYWxsICYmIGlvYXJncy51cmwgIT0gJycpe1xyXG5cdFx0XHRcdFx0aW9hcmdzID0gJC5leHRlbmQodHJ1ZSxpb2FyZ3Mse2N1c3RvbWNvbmZpZzp7cXVldWU6dHJ1ZX19KTtcclxuXHRcdFx0XHRcdHZhciBjdXJvcHQgPSBmb3JtYXQoaW9hcmdzLGlvY2FsbCxxdWV1ZW9iaik7XHJcblx0XHRcdFx0XHRxdWV1ZW9iai5yZXF1ZXN0KGN1cm9wdCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyBpb+aOpeWPo+ivt+axguebuOWFs+aVsOaNrumFjee9rlxyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE1LTA2LTI4IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm4g5pu05aSa6K+m57uG5L+h5oGv5Y+C6ICD5Luj56CB6YeM5a+55bqU5a6a5LmJ5pa55rOV5oiW5bGe5oCn5L2N572u55qE5rOo6YeK6K+05piOXHJcbiAqIFx0bG9naW4ge0pTT059IOWvueS6juaOpeWPo+i/lOWbnuacqueZu+mZhumUmeivr+i/m+ihjOe7n+S4gOWkhOeQhumFjee9rlxyXG4gKiAgaW9hcmdzIHtKU09OfSBpb+ivt+axguaOpeWPo+m7mOiupOWPguaVsFxyXG4gKiAgc2V0VHJhbnMge0Z1bmN0aW9ufSDorr7nva7mjqXlj6PphY3nva5cclxuICogIGdldFRyYW5zIHtGdW5jdGlvbn0g6I635Y+W5o6l5Y+j6YWN572uXHJcbiAqICBnbG9iYWxTZXR1cCB7RnVuY3Rpb259IOiuvue9ruWFqOWxgGFqYXjphY3nva5cclxuICogQGV4YW1wbGVcclxuICogXHRcdGNvbnN0IElvQ29uZmlnID0gcmVxdWlyZSgnbGliaW8taW9jb25maWcnKTtcclxuICpcclxuXHQgXHQgLy/nu5/kuIDlpITnkIbmnKrnmbvlvZVcclxuXHRcdCBJb0NvbmZpZy5sb2dpbi5maWx0ZXIgPSBmdW5jdGlvbihyZXN1bHQpe1xyXG5cdFx0IFx0cmV0dXJuIHJlc3VsdC5jb2RlID09ICdBMDAwMic7XHJcblx0XHQgfTtcclxuXHRcdCBJb0NvbmZpZy5sb2dpbi51cmwgPSAnaHR0cDovL2JhaWR1LmNvbS8nO1xyXG5cclxuXHRcdCAvL+aJgOacieaOpeWPo+eahGlv5Lia5Yqh6ZSZ6K+v57uf5LiA5aSE55CGXHJcblx0XHQgSW9Db25maWcuZmFpbC5maWx0ZXIgPSBmdW5jdGlvbihyZXN1bHQpIHtcclxuXHRcdCBcdHJldHVybiByZXN1bHQuY29kZSAhPSAnQTAwMDEnO1xyXG5cdFx0IH07XHJcblx0XHQgSW9Db25maWcuaW9jYWxsLmZhaWwgPSBmdW5jdGlvbihyZXN1bHQpe1xyXG5cdFx0IFx0YWxlcnQocmVzdWx0LmVycm1zZyB8fCAn572R57uc6ZSZ6K+vJyk7XHJcblx0XHQgfTtcclxuXHJcblx0XHQgSW9Db25maWcuaW9hcmdzLmNyb3NzRG9tYWluID0gdHJ1ZTtcclxuICogKi9cclxuXHJcbi8vdmFyIGlvY2FjaGUgPSB7fTsgLy/mjqXlj6PnmoTphY3nva7pobnnvJPlrZjjgILmoLzlvI/kuLp7aW50ZXJuYW1l77ybaW9hcmdz6YeM6Z2i55qE5Y+C5pWw6YWN572u6aG5anNvbuagvOW8j31cclxudmFyIHRoYXQgPSB7fTtcclxuLyoqXHJcbiAqIOWvueS6juaOpeWPo+i/lOWbnuacqueZu+mZhumUmeivr+i/m+ihjOe7n+S4gOWkhOeQhiDphY3nva7jgIJcclxuICovXHJcbnRoYXQubG9naW4gPSB7XHJcblx0dXJsOiAnJywgLy/mnKrnmbvmg4XlhrXkuIvot7PovaznmoTpobXpnaJcclxuXHRrZXk6ICdnbycsIC8v6Lez6L2s5YiwdXJs5oyH5a6a6aG16Z2i5Lyg6YCS5b2T5YmN6aG16Z2i5Zyw5Z2A55qE6ZSu5YC85ZCN56ewXHJcblx0ZGVhbDogZnVuY3Rpb24oZGF0YSl7fSwgLy/mnInnmoTmg4XlhrXkuIvvvIzkuI3mmK/ot7PovaznmbvlvZV1cmzvvIzogIzkuJTlvLnnmbvlvZXlvLnlsYLjgILliJnmraTml7blsIZ1cmzorr7nva7kuLonJ++8jOWwhueZu+mZhuW8ueWxguW8ueWHuuWkhOeQhuWGmeWcqOatpOaWueazleS4rVxyXG5cdGZpbHRlcjogZnVuY3Rpb24oZGF0YSl7cmV0dXJuIGZhbHNlO30gLy/lpoLmnpzmraTlh73mlbDov5Tlm550cnVl5YiZ6Lez6L2sdXJs5oyH5a6a55qE6aG16Z2i44CCZGF0YeaYr+aOpeWPo+i/lOWbnueahOaVsOaNrlxyXG59O1xyXG4vKipcclxuICog5a+55LqO5o6l5Y+j6L+U5Zue55qE5Lia5Yqh6ZSZ6K+v6L+b6KGM57uf5LiA5aSE55CGIOmFjee9ruOAglxyXG4gKiDlpoJjb2RlID09ICdBMDAwMScg566X5oiQ5Yqf77yM5YW25LuW6YO9566X5aSx6LSlXHJcbiAqL1xyXG50aGF0LmZhaWwgPSB7XHJcbiAgICBmdW5uYW1lOiAnZmFpbCcsIC8v5b2T5Y+R55Sf5Lia5Yqh6ZSZ6K+v55qE5pe25YCZ77yM6LCD55So55qE5qC85byP5ZCM5LqOaW9hcmdz6YeM55qE5Ye95pWw55qE5Ye95pWw5ZCN44CC6buY6K6k5pivZXJyb3JcclxuICAgIGZpbHRlcjogZnVuY3Rpb24oZGF0YSl7cmV0dXJuIGZhbHNlO30gLy/lpoLmnpzmraTlh73mlbDov5Tlm550cnVl5YiZ6K+05piO5b2T5YmN5o6l5Y+j6L+U5Zue5Lia5Yqh6ZSZ6K+v5L+h5oGv44CCZGF0YeaYr+aOpeWPo+i/lOWbnueahOaVsOaNrlxyXG4gICAgLyoqXHJcbiAgICAgKiDlpoLmnpzmjqXlj5fkuJrliqHplJnor6/kv6Hmga/nu5/kuIDlpITnkIbvvIzliJnlj6/ku6XmjInnhafku6XkuIvmlrnlvI/loavlhpnvvJpcclxuICAgICAqIHJlcWl1cmVqcyhbJ2xpYmlvL2lvY29uZmlnJ10sZnVuY3Rpb24oJGlvY29uZmlnKXtcclxuICAgICAqICAgICAkaW9jb25maWcuZXJyb3IgPSB7XHJcbiAgICAgKiAgICAgICAgIGZ1bm5hbWU6ICdmYWlsJyxcclxuICAgICAqICAgICAgICAgZmlsdGVyOiBmdW5jdGlvbihkYXRhKXtpZihkYXRhICYmIGRhdGEuZXJyY29kZSAhPSAwKXtyZXR1cm4gdHJ1ZTt9fVxyXG4gICAgICogICAgIH07XHJcbiAgICAgKiAgICAgJGlvY29uZmlnLmlvYXJncy5mYWlsID0gZnVuY3Rpb24oZGF0YSl7IGFsZXJ0KGRhdGEuZXJybXNnIHx8ICfnvZHnu5zplJnor68nKTsgfVxyXG4gICAgICogfSk7XHJcbiAgICAgKi9cclxufTtcclxudGhhdC5pb2FyZ3MgPSB7IC8vaW/or7fmsYLpu5jorqTnmoTlj4LmlbDmoLzlvI9cclxuXHQvL+WQjGFqYXjlj4LmlbDlrpjmlrnor7TmmI7poblcclxuXHR1cmw6ICcnLFxyXG5cdG1ldGhvZDogJ0dFVCcsXHJcblx0Y29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxyXG5cdGRlYWxkYXRhOiBmdW5jdGlvbihyZXN1bHQpe3JldHVybiByZXN1bHQuZGF0YTt9LCAvL+W9k+S4muWKoeWkhOeQhuaIkOWKn+aXtu+8jOi/lOWbnue7n+S4gOWkhOeQhueahOaVsOaNrlxyXG5cdC8v6Ieq5a6a5LmJ5pWw5o2uXHJcblx0Y3VzdG9tY29uZmlnOntcclxuXHRcdG1vZGU6ICdhamF4JywgLy/kvb/nlKjku4DkuYjmlrnlvI/or7fmsYLvvIzpu5jorqTmmK9hamF4KGFqYXjmlrnlvI/pu5jorqTov5Tlm57nmoTmmK9qc29u5qC85byP55qE5pWw5o2u44CC5Lmf5Y+v6YCa6L+H5Zyo5ZKMbWV0aG9k5Y+C5pWw5ZCM57qn55qE5L2N572u6K6+572uZGF0YVR5cGXlj4LmlbDmnaXmlLnlj5jpu5jorqTnmoRqc29u6K6+572uKeOAguWPr+eUqOeahOWPguaVsOaciWFqYXh8anNvbnB8c2NyaXB0XHJcblx0ICAgIGRlYWxsb2dpbjogdHJ1ZSwgLy/mmK/lkKbnu5/kuIDlpITnkIbmnKrnmbvpmYbplJnor69cclxuXHQgICAgZGVhbGZhaWw6IHRydWUsIC8v5piv5ZCm57uf5LiA5aSE55CG5Lia5Yqh6ZSZ6K+vXHJcblx0ICAgIGRlYWxkYXRhOiB0cnVlLCAvL+W9k+S4muWKoeWkhOeQhuaIkOWKn+aXtu+8jOaYr+WQpue7n+S4gOWkhOeQhui/lOWbnueahOaVsOaNruOAguazqOaEj++8muWPquacieW9k2RlYWxlcnJvcuS4unRydWXml7bvvIxkZWFsZGF0YeS4unRydWXmiY3mnInmlYjjgILlkKbliJnkuI3kvJrosIPnlKhkZWFsZGF0YeaWueazlVxyXG5cdCAgICBxdWV1ZTogZmFsc2UsIC8v5o6l5Y+j6K+35rGC5piv5ZCm6L+b6KGM6Zif5YiX5o6n5Yi277yM5Y2z5b2T5YmN6K+35rGC5a6M5oiQ5ZCO5omN5Y+v5Lul6L+b6KGM5LiL5LiA5Liq6K+35rGCXHJcblx0XHRzdG9yYWdlOiBudWxsLCAvL2xpYmlvL3N0b3JhZ2Xlr7nosaHvvIzmjqfliLZpb+ivt+axguaVsOaNrue8k+WtmFxyXG5cdFx0Y2xlYXJhbGw6IGZhbHNlLCAvL+ivt+axguaOpeWPo+aXtu+8jOaYr+WQpua4hemZpOaJgOaciee8k+WtmFxyXG5cdCAgICBnZXRJbnRlcjogZnVuY3Rpb24oaW50ZXJvYmope30gLy/ojrflj5bmjqXlj6Por7fmsYLlrp7kvovlr7nosaHjgILlpoJpbnRlcm9iauS4uiQuYWpheCgp6L+U5Zue55qE5a+56LGhXHJcblx0fVxyXG59O1xyXG4vKipcclxuICog5aaC5p6cZGF0YeaYr+S7juacrOWcsOe8k+WtmOS4reivu+WPlueahOaVsOaNru+8jOmCo+S5iHN1Y2Nlc3PlkoxmYWls5pa55rOV5Lit55qE5Y+C5pWw77yaXHJcbiAqIFx0XHR0ZXh0U3RhdHVz5ZKManFYSFLliIbliKvmmK8gJ3N1Y2Nlc3MnLCBudWxsXHJcbiAqIEB0eXBlIHtPYmplY3R9XHJcbiAqL1xyXG50aGF0LmlvY2FsbCA9IHsgLy9pb+ivt+axguWbnuiwg1xyXG5cdGNvbXBsZXRlOiBmdW5jdGlvbigpe30sIC8v5Y+C5pWw5Li6IGRhdGF8anFYSFIsIHRleHRTdGF0dXMsIGpxWEhSfGVycm9yVGhyb3duXHJcblx0c3VjY2VzczogZnVuY3Rpb24oZGF0YSwgdGV4dFN0YXR1cywganFYSFIpe30sXHJcblx0ZXJyb3I6IGZ1bmN0aW9uKGpxWEhSLCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bil7YWxlcnQoIHRleHRTdGF0dXMgfHwgJ+e9kee7nOmUmeivrycpOyB9LFxyXG5cdGZhaWw6IGZ1bmN0aW9uKGRhdGEsIHRleHRTdGF0dXMsIGpxWEhSKXt9IC8v5b2T5Lia5Yqh5aSE55CG6ZSZ6K+v5pe277yM6L+U5Zue57uf5LiA5aSE55CG5Lia5Yqh6ZSZ6K+vXHJcbn07XHJcbi8qKlxyXG4gKiDmr4/kuKror7fmsYLlj5HpgIHkuYvliY3vvIznu5/kuIDmoLzlvI/ljJblj4LmlbDphY3nva7vvIjmoLzlvI/lkIxpb2FyZ3PvvInjgIJcclxuICog5bqU55So5Zy65pmv77yaIOavj+S4quS4muWKoemhueebrumcgOimgemFjee9rue7n+S4gOeahOWPguaVsOWkhOeQhuOAglxyXG4gKi9cclxudGhhdC5mb3JtYXQgPSBmdW5jdGlvbihvcHQpe307XHJcbi8qKlxyXG4gKiDorr7nva7lhajlsYDnmoTmjqXlj6Por7fmsYLphY3nva5cclxuICogQHBhcmFtIHtPYmplY3R9IHNldHRpbmdcclxuICovXHJcbnRoYXQuZ2xvYmFsU2V0dXAgPSBmdW5jdGlvbihzZXR0aW5nKXtcclxuXHRpZih0eXBlb2Ygc2V0dGluZyA9PSAnb2JqZWN0Jyl7XHJcblx0XHQkLmFqYXhTZXR1cChzZXR0aW5nKTtcclxuXHR9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHRoYXQ7XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IOS9v+eUqGxvY2FsU3RvcmFnZei/m+ihjOaVsOaNruWtmOWCqFxyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE3LTA0LTEzIOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm5cclxuICogKi9cclxuXHJcbi8qKlxyXG4gKiDmlbDmja7lrZjlgqjnsbtcclxuICogQHBhcmFtIHtbdHlwZV19IG9wdCBbZGVzY3JpcHRpb25dXHJcbiAqL1xyXG5mdW5jdGlvbiBTdG9yYWdlKG9wdCl7XHJcbiAgICBvcHQgPSAkLmV4dGVuZCh7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5a2Y5YKo5ZGo5pyf77yM6buY6K6k5Li6MeWkqeOAguWQjue8gOivtOaYjlxyXG4gICAgICAgICAqIE06IOaciFxyXG4gICAgICAgICAqIEQ6IOaXpVxyXG4gICAgICAgICAqIEg6IOWwj+aXtlxyXG4gICAgICAgICAqIEB0eXBlIHtTdHJpbmd9XHJcbiAgICAgICAgICogQGV4YW1wbGUgMS41RCAwLjVIIDNNIDE1RDAuMkhcclxuICAgICAgICAgKiDnibnliKvor7TmmI7vvJrlj6rmlK/mjIEx5L2N5bCP5pWwXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgbWF4YWdlOiAnMUQnLFxyXG4gICAgICAgIGtleTogJycgLy8qIOmUruWAvFxyXG4gICAgfSxvcHQpO1xyXG5cclxuICAgIGlmKG9wdC5rZXkgPT0gJycgfHwgb3B0Lm1heGFnZSA9PSAnJyl7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdsaWJpby9zdG9yYWdlIOWPguaVsOS8oOWFpemUmeivrycpO1xyXG4gICAgfWVsc2UgaWYoIS9eKChcXGQrKShcXC4oWzEtOV17MX0pKT8oW01ESF0pKSskLy50ZXN0KG9wdC5tYXhhZ2UpKXtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2xpYmlvL3N0b3JhZ2UgbWF4YWdl6YWN572u5qC85byP5LiN5q2j56GuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgb3B0LmtleSA9IFN0b3JhZ2UuZ3JvdXBuYW1lICsgJ18nICsgb3B0LmtleTtcclxuXHJcbiAgICB0aGlzLm9wdCA9IG9wdDtcclxufVxyXG5cclxuLyoqXHJcbiAqIOiuoeeul+i/h+acn+aXtumXtOeCuVxyXG4gKiBAcmV0dXJuIHtTdHJpbmd9IERhdGVUaW1l6L+H5pyf5pe26Ze054K55a2X56ym5LiyXHJcbiAqL1xyXG5TdG9yYWdlLnByb3RvdHlwZS5fZ2V0T3V0RGF0ZVRpbWUgPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIG1heGFnZSA9IHRoaXMub3B0Lm1heGFnZSxcclxuICAgICAgICBub3d0aW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCksXHJcbiAgICAgICAgZGlmZmhvdXIgPSAwLFxyXG4gICAgICAgIHJlZyA9IC8oXFxkKykoXFwuKFsxLTldezF9KSk/KFtNREhdKS9nLFxyXG4gICAgICAgIHJlYXJyID0gbnVsbDtcclxuXHJcbiAgICB3aGlsZSgocmVhcnIgPSByZWcuZXhlYyhtYXhhZ2UpKSAhPSBudWxsKXtcclxuICAgICAgICB2YXIgbnVtID0gcmVhcnJbMV0sIC8v5pW05pWw6YOo5YiGXHJcbiAgICAgICAgICAgIHN1ZmZpeCA9IHJlYXJyWzRdO1xyXG4gICAgICAgIGlmKHJlYXJyWzJdKXsgLy/or7TmmI7lrZjlnKjlsI/mlbBcclxuICAgICAgICAgICAgbnVtICs9IHJlYXJyWzJdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBudW0gPSBOdW1iZXIobnVtKTtcclxuICAgICAgICBzd2l0Y2ggKHN1ZmZpeCkge1xyXG4gICAgICAgICAgICBjYXNlICdNJzpcclxuICAgICAgICAgICAgICAgIGRpZmZob3VyICs9IG51bSozMCoyNDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdEJzpcclxuICAgICAgICAgICAgICAgIGRpZmZob3VyICs9IG51bSoyNDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdIJzpcclxuICAgICAgICAgICAgICAgIGRpZmZob3VyICs9IG51bTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG5vd3RpbWUgKz0gZGlmZmhvdXIqNjAqNjAqMTAwMDtcclxuXHJcbiAgICByZXR1cm4gbm93dGltZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiDmlbDmja7orr7nva5cclxuICogQHBhcmFtIHtKU09OfSBkYXRhIOW+heWtmOWCqOeahOaVsOaNrlxyXG4gKiDlrp7pmYXlrZjlgqjnmoTmlbDmja7moLzlvI/lpoLkuIvvvJpcclxuICpcclxuICogIHtcclxuICogICAgICBlbmRUaW1lOiB7U3RyaW5nfVxyXG4gKiAgICAgIGRhdGE6IGRhdGFcclxuICogIH1cclxuICovXHJcblN0b3JhZ2UucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgaWYoIWRhdGEgfHwgT2JqZWN0LmtleXMoZGF0YSkubGVuZ3RoID09IDApe1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLm9wdC5rZXksIEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICBlbmRUaW1lOiB0aGlzLl9nZXRPdXREYXRlVGltZSgpLFxyXG4gICAgICAgIGRhdGE6IGRhdGFcclxuICAgIH0pKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOiOt+WPluaVsOaNrlxyXG4gKiBAcmV0dXJuIHtKU09OfE51bGx9IOi/lOWbnnNldOaXtuWAmeeahGRhdGHjgILlpoLmnpzov4fmnJ/liJnov5Tlm55udWxsXHJcbiAqL1xyXG5TdG9yYWdlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbigpe1xyXG4gICAgLy/liKTmlq3mmK/lkKbov4fmnJ9cclxuICAgIHZhciB2YWx1ZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMub3B0LmtleSk7XHJcbiAgICBpZih2YWx1ZSA9PSBudWxsKXtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1lbHNle1xyXG4gICAgICAgIHZhbHVlID0gSlNPTi5wYXJzZSh2YWx1ZSk7XHJcbiAgICAgICAgaWYoTnVtYmVyKHZhbHVlLmVuZFRpbWUpIDw9IG5ldyBEYXRlKCkuZ2V0VGltZSgpKXsgLy/ov4fmnJ9cclxuICAgICAgICAgICAgdGhpcy5yZW1vdmUoKTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5kYXRhO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOWIoOmZpOatpOmhueaVsOaNrlxyXG4gKiBAcmV0dXJuIHtbdHlwZV19IFtkZXNjcmlwdGlvbl1cclxuICovXHJcblN0b3JhZ2UucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSh0aGlzLm9wdC5rZXkpO1xyXG59XHJcblxyXG4vKipcclxuICog5pWw5o2u5YKo5a2Y5omA5bGe57uE5ZCN56ewXHJcbiAqIEB0eXBlIHtTdHJpbmd9XHJcbiAqL1xyXG5TdG9yYWdlLmdyb3VwbmFtZSA9ICdaTVJETEInO1xyXG5cclxuLyoqXHJcbiAqIOWIoOmZpOWFqOmDqOWcqOe7hFN0b3JhZ2UuZ3JvdXBuYW1l5LiL55qE57yT5a2Y5pWw5o2uXHJcbiAqIEByZXR1cm4ge1t0eXBlXX0gW2Rlc2NyaXB0aW9uXVxyXG4gKi9cclxuU3RvcmFnZS5jbGVhciA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgcmVnID0gbmV3IFJlZ0V4cCgnXicrU3RvcmFnZS5ncm91cG5hbWUpO1xyXG4gICAgd2hpbGUobG9jYWxTdG9yYWdlLmxlbmd0aCA+IDApIHtcclxuICAgICAgICB2YXIga2V5ID0gbG9jYWxTdG9yYWdlLmtleSgwKTtcclxuICAgICAgICBpZihyZWcudGVzdChrZXkpKXtcclxuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oa2V5KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDliJvlu7rkuIDkuKpTdG9yYWdl5a+56LGhXHJcbiAqIEBwYXJhbSAge0pTT059IG9wdCDor6bop4FTdG9yYWdl5a6a5LmJ5aSEXHJcbiAqIEByZXR1cm4ge1N0b3JhZ2V9ICAgICBbZGVzY3JpcHRpb25dXHJcbiAqL1xyXG5TdG9yYWdlLmNyZWF0ZSA9IGZ1bmN0aW9uKG9wdCl7XHJcbiAgICByZXR1cm4gbmV3IFN0b3JhZ2Uob3B0KTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTdG9yYWdlO1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyBhbGVydOexu++8jOe7p+aJv+iHqmxheWVyL2JvbWJMYXllcuOAgua3u+WKoOKAnOehruWumuaMiemSruKAneS6i+S7tuWbnuiwg1xyXG4gKiDlpoLmnpzlvLnlsYLkuK3mnInku6XkuIvlsZ7mgKfnmoToioLngrlcclxuICogbm9kZT1cImNsb3NlXCLvvIzngrnlh7vliJnkvJrlhbPpl63lvLnlsYIs5bm26Kem5Y+RaGlkZWNhbOmAmuefpeOAglxyXG4gKiBub2RlPVwib2tcIu+8jOeCueWHu+WImeinpuWPkeKAnOehruWumuaMiemSruKAneS6i+S7tuOAgeWFs+mXreW8ueWxgu+8jOW5tuinpuWPkW9rY2Fs5ZKMaGlkZWNhbOmAmuefpeOAglxyXG4gKiBAdmVyc2lvbiAxLjAuMCB8IDIwMTUtMDktMTQg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQGV4YW1wbGVcclxuICogXHQgY29uc3QgQWxlcnQgPSByZXF1aXJlKCdsaWJsYXllci1hbGVydCcpO1xyXG4gKlxyXG4gKiBcdCB2YXIgbGF5ZXIgPSBuZXcgQWxlcnQoe1xyXG4gKiBcdCBcdGFsZXJ0OiB7XHJcbiAqIFx0XHRcdGZyYW1ldHBsOiBbIC8v5by55bGC5Z+65pys5qih5p2/XHJcblx0XHRcdFx0JzxkaXYgY2xhc3M9XCJqcy10aXRsZVwiPjwvZGl2PicsXHJcblx0XHRcdFx0JzxkaXYgY2xhc3M9XCJqcy1jb250ZW50XCI+PC9kaXY+JyxcclxuXHRcdFx0XHQnPGRpdj48YSBocmVmPVwiamF2YXNjcmlwdDo7XCIgY2xhc3M9XCJqcy1va1wiPuWlveeahDwvYT48L2Rpdj4nXHJcblx0XHRcdF0uam9pbignJylcclxuICogICAgICB9XHJcbiAqICAgfSk7XHJcbiAqICAgbGF5ZXIuc2hvd2NhbC5hZGQoZnVuY3Rpb24odHlwZSl7c3dpdGNoKHR5cGUpe2Nhc2UgJ2JlZm9yZSc6Y29uc29sZS5sb2coJ+WxguaYvuekuuWJjScpO2JyZWFrOyBjYXNlICdhZnRlcic6Y29uc29sZS5sb2coJ+WxguaYvuekuuWQjicpO2JyZWFrO319KTtcclxuICogICBsYXllci5oaWRlY2FsLmFkZChmdW5jdGlvbih0eXBlKXtzd2l0Y2godHlwZSl7Y2FzZSAnYmVmb3JlJzpjb25zb2xlLmxvZygn5bGC6ZqQ6JeP5YmNJyk7YnJlYWs7IGNhc2UgJ2FmdGVyJzpjb25zb2xlLmxvZygn5bGC6ZqQ6JeP5ZCOJyk7YnJlYWs7fX0pO1xyXG4gKiAgIGxheWVyLm9rY2FsLmFkZChmdW5jdGlvbihlKXtjb25zb2xlLmxvZygn54K55Ye75LqG56Gu5a6aJyl9KTtcclxuICogICBsYXllci5zZXRNeUNvbnRlbnQoJ+iuvue9rm5vZGU9XCJjb250ZW50XCLoioLngrnnmoRpbm5lckhUTUwnKTtcclxuICogICB2YXIgbm9kZUFyciA9IGxheWVyLmdldE5vZGVzKFsndGl0bGUnXSk7IC8vIOiOt+WPlmNsYXNzPVwianMtdGl0bGVcIueahOiKgueCuVxyXG4gKiAgIG5vZGVBcnIudGl0bGUuaHRtbCgn5YaF5a655Yy6aHRtbCcpO1xyXG4gKiAgIGxheWVyLmNvbnRlbnRub2RlOyAvL+WGheWuueWMum5vZGU9XCJjb250ZW50XCLoioLngrlcclxuICogICBsYXllci5zaG93KCk7IC8v5pi+56S65bGCXHJcbiAqICAgbGF5ZXIuaGlkZSgpOyAvL+makOiXj+WxglxyXG4gKiAgIGxheWVyLmxheWVyOyAvL+WxgmRvbeiKgueCueWvueixoVxyXG4gKiAgIGxheWVyLmNvbnRhaW5lcjsgLy/mta7lsYLlrrnlmahcclxuICogICBsYXllci5kZXN0cm95KCk7IC8v6ZSA5q+B5bGCXHJcbiAqICovXHJcbmNvbnN0IEJvbWJMYXllciA9IHJlcXVpcmUoJy4vYm9tYkxheWVyLmpzJyksXHJcblx0ICAgVHBsID0gcmVxdWlyZSgnLi90cGwuanMnKTtcclxuXHJcbmNsYXNzIEFsZXJ0IGV4dGVuZHMgQm9tYkxheWVyIHtcclxuXHQvKipcclxuXHQgKiBhbGVydOexu1xyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyDlj4LmlbDlkIxsYXllci9ib21iTGF5ZXLph4zpnaLnmoRjb25maWcs5Zyo5q2k5Z+656GA5LiK5aKe5Yqg5aaC5LiL6buY6K6k6YWN572uXHJcbiAgICAgKiB7XHJcbiAgICAgKiBcdCAgKmFsZXJ0OiB7XHJcbiAgICAgKiBcdFx0ICpmcmFtZXRwbCB7U3RyaW5nfSBhbGVydOWfuuacrOaooeadv+OAguimgeaxguivt+ivpuingWxheWVyL3RwbOmHjOmdomFsZXJ06aG555qE6KaB5rGCXHJcbiAgICAgKiAgICB9XHJcbiAgICAgKiB9XHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IoY29uZmlnKSB7XHJcblx0XHR2YXIgb3B0ID0gJC5leHRlbmQodHJ1ZSx7XHJcblx0XHRcdGFsZXJ0OiB7XHJcblx0XHRcdFx0ZnJhbWV0cGw6IFRwbC5hbGVydCAvL2FsZXJ05by55bGC5Z+65pys5qih5p2/44CC6KaB5rGC6K+36K+m6KeBbGF5ZXIvdHBs6YeM6Z2iYWxlcnTpobnnmoTopoHmsYJcclxuXHRcdFx0fVxyXG5cdFx0fSxjb25maWcpO1xyXG5cdFx0c3VwZXIob3B0KTtcclxuXHJcblx0XHR0aGlzLnNldENvbnRlbnQob3B0LmFsZXJ0LmZyYW1ldHBsKTtcclxuXHRcdHRoaXMuY29udGVudG5vZGUgPSB0aGlzLmxheWVyLmZpbmQoJy5qcy1jb250ZW50Jyk7IC8v5YaF5a655Yy66IqC54K5XHJcblx0XHR0aGlzLm9rY2FsID0gJC5DYWxsYmFja3MoKTtcclxuXHRcdC8v5LqL5Lu257uR5a6aXHJcblx0ICAgIHRoaXMubGF5ZXIub24oJ2NsaWNrLmxpYicsICcuanMtb2snLCAoZSkgPT4ge1xyXG5cdCAgICBcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHQgICAgXHR0aGlzLm9rY2FsLmZpcmUoZSk7XHJcblx0XHRcdHRoaXMuaGlkZSgpO1xyXG5cdCAgICB9KTtcclxuXHR9XHJcblx0LyoqXHJcbiAgICAgKiDorr7nva5hbGVydOWGheWuueWMuuWFt+aciVtub2RlPVwiY29udGVudFwiXeWxnuaAp+eahOiKgueCueeahGh0bWxcclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBodG1sXHJcbiAgICAgKi9cclxuXHRzZXRNeUNvbnRlbnQoaHRtbCkge1xyXG5cdFx0aWYodHlwZW9mIGh0bWwgPT0gJ3N0cmluZycgJiYgdGhpcy5jb250ZW50bm9kZS5sZW5ndGggPiAwKXtcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50bm9kZS5odG1sKGh0bWwpO1xyXG4gICAgICAgIH1cclxuXHR9XHJcblx0LyoqXHJcblx0ICog57uE5Lu26ZSA5q+BXHJcblx0ICovXHJcblx0ZGVzdHJveSgpIHtcclxuXHRcdHRoaXMubGF5ZXIub2ZmKCdjbGljay5saWInLCAnLmpzLW9rJyk7XHJcblx0XHRzdXBlci5kZXN0cm95KCk7XHJcblx0XHR0aGlzLmNvbnRlbnRub2RlID0gbnVsbDtcclxuXHRcdHRoaXMub2tjYWwgPSBudWxsO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBbGVydDtcclxuIiwi77u/LyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcgYWxlcnTnmoTlt6XljoLmjqfliLblmajvvIznu6fmib9iYXNlQ29udHJvbFxyXG4gKiDlupTnlKjlnLrmma/vvJrpkojlr7nnroDljZVhbGVydOW8ueWxgu+8jOmikee5geabtOaUueW8ueWxgumHjOafkOS6m+iKgueCueeahOWGheWuue+8jOS7peWPiuabtOaUueeCueWHu1wi56Gu5a6aXCLmjInpkq7lkI7nmoTlm57osIPkuovku7ZcclxuICog5aaC5p6c5piv5pu05aSN5p2C55qE5Lqk5LqS5bu66K6u5L2/55SobGF5ZXJzLmFsZXJ05oiWbGF5ZXJzLmJvbWJMYXllclxyXG4gKiBAdmVyc2lvbiAxLjAuMCB8IDIwMTYtMDEtMjYg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQGV4YW1wbGVcclxuICogY29uc3QgQWxlcnRDb250cm9sID0gcmVxdWlyZSgnbGlibGF5ZXItYWxlcnRDb250cm9sJyk7XHJcbiAqXHJcblx0XHR2YXIgY3VybGF5ZXIgPSBuZXcgQWxlcnRDb250cm9sKCk7XHJcblx0XHRjdXJsYXllci5zZXRjb25maWcoe1xyXG5cdFx0XHRhbGVydDoge1xyXG5cdFx0XHRcdGZyYW1ldHBsOiBbXHJcblx0XHRcdFx0ICAgICc8ZGl2IGNsYXNzPVwianMtdGl0bGVcIj48L2Rpdj4nLFxyXG5cdFx0XHRcdFx0JzxkaXYgY2xhc3M9XCJqcy1jb250ZW50XCI+PC9kaXY+JyxcclxuXHRcdFx0XHRcdCc8ZGl2PjxhIGhyZWY9XCJqYXZhc2NyaXB0OjtcIiBjbGFzcz1cImpzLW9rXCI+5aW955qEPC9hPjwvZGl2PidcclxuXHRcdFx0XHRdLmpvaW4oJycpXHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0Y3VybGF5ZXIuc2hvdyh7XHJcbiAgICAgICAgICAgIGNvbnRlbnQ6ICfmgqjov5jmnKrnmbvpmYYnXHJcbiAgICAgICAgfSx7XHJcbiAgICAgICAgICAgIG9rOiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+eCueWHu+WlveeahCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY3VybGF5ZXIuZ2V0bGF5ZXJvYmooKe+8myAvL2xheWVyL2FsZXJ057G75a+56LGhXHJcbiAqICovXHJcbiBjb25zdCBBbGVydCA9IHJlcXVpcmUoJy4vYWxlcnQuanMnKSxcclxuICAgICAgIEJhc2VDb250cm9sID0gcmVxdWlyZSgnLi9iYXNlQ29udHJvbC5qcycpO1xyXG5cclxuLyoqXHJcbiogYWxlcnTlt6XljoLmjqfliLblmahcclxuKi9cclxuY2xhc3MgQWxlcnRDb250cm9sIGV4dGVuZHMgQmFzZUNvbnRyb2wge1xyXG4gICAgY29uc3RydWN0b3IoaGlkZWRlc3Ryb3kpIHtcclxuICAgICAgICBzdXBlcihoaWRlZGVzdHJveSk7XHJcbiAgICAgICAgdGhpcy5fb2tjYWwgPSBmdW5jdGlvbigpe307IC8v54K55Ye7b2vnmoTlm57osIPnp4HmnInlrZjlgqjlmahcclxuXHRcdHRoaXMuX2Z1bmFyciA9IFsnb2snXTsgLy/lj6/mjqfliLbnmoTlm57osIPmlrnms5XlkI1cclxuICAgIH1cclxuICAgIC8qKlxyXG5cdCAqIOiOt+WPlmFsZXJ05by55bGCXHJcblx0ICogQHBhcmFtIHtCb29sZWFufSByZXNldCDmmK/lkKbph43mlrDmuLLmn5PmqKHmnb/jgILpu5jorqTkuLpmYWxzZVxyXG5cdCAqL1xyXG4gICAgZ2V0bGF5ZXJvYmoocmVzZXQpe1xyXG5cdFx0aWYodGhpcy5fbGF5ZXJvYmogPT0gbnVsbCl7XHJcblx0XHRcdHRoaXMuX2xheWVyb2JqID0gbmV3IEFsZXJ0KHRoaXMuX2RlZmF1bHRvcHQpO1xyXG5cdFx0XHR0aGlzLl9sYXllcm9iai5va2NhbC5hZGQoKGUpID0+IHtcclxuXHRcdFx0XHR0aGlzLl9va2NhbCgpO1xyXG5cdFx0XHR9KTtcclxuICAgICAgICAgICAgdGhpcy5fYWRkY2FsbCgpO1xyXG5cdFx0fWVsc2V7XHJcbiAgICAgICAgICAgIGlmKHJlc2V0KXtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2xheWVyb2JqLnNldENvbnRlbnQodGhpcy5fZGVmYXVsdG9wdC5hbGVydC5mcmFtZXRwbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblx0XHRyZXR1cm4gdGhpcy5fbGF5ZXJvYmo7XHJcbiAgICB9XHJcbiAgICAvKipcclxuXHQgKiDplIDmr4FhbGVydOW8ueWxglxyXG5cdCAqL1xyXG4gICAgZGVzdHJveSgpe1xyXG4gICAgICAgIHN1cGVyLmRlc3Ryb3koKTtcclxuICAgICAgICB0aGlzLl9va2NhbCA9IGZ1bmN0aW9uKCl7fTtcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBbGVydENvbnRyb2w7XHJcbiIsIu+7vy8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IGFsZXJ057G75Y2V5L2T5o6n5Yi25Zmo77yM5LiA6Iis55So5LqO566A5Y2V55qEY29uZmlybeS/oeaBr+aPkOekuuOAglxyXG4gKiDms6jmhI/vvJror6VhbGVydOaOp+WItueahOWvueixoeWPimRvbeWcqOWFqOWxgOS4reWUr+S4gOWtmOWcqO+8jOWmguaenOaDs+imgeWIm+W7uuWkmuS4qu+8jOivt+S9v+eUqGxpYmxheWVycy9hbGVydOaIlmxpYmxheWVycy9hbGVydENvbnRyb2xcclxuICogQHZlcnNpb24gMS4wLjAgfCAyMDE1LTA5LTE0IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEBleGFtcGxlXHJcbiAqICAgICAgY29uc3QgQWxlcnRTaW5nbGUgPSByZXF1aXJlKCdsaWJsYXllci1hbGVydFNpbmdsZScpO1xyXG4gKlxyXG5cdFx0QWxlcnRTaW5nbGUuc2V0Y29uZmlnKHtcclxuXHRcdFx0YWxlcnQ6IHtcclxuXHRcdFx0XHRmcmFtZXRwbDogW1xyXG5cdFx0XHRcdCAgICAnPGRpdiBjbGFzcz1cImpzLXRpdGxlXCI+PC9kaXY+JyxcclxuXHRcdFx0XHRcdCc8ZGl2IGNsYXNzPVwianMtY29udGVudFwiPjwvZGl2PicsXHJcblx0XHRcdFx0XHQnPGRpdj48YSBocmVmPVwiamF2YXNjcmlwdDo7XCIgY2xhc3M9XCJqcy1va1wiPuWlveeahDwvYT48L2Rpdj4nXHJcblx0XHRcdFx0XS5qb2luKCcnKVxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdEFsZXJ0U2luZ2xlLmdldGxheWVyb2JqKCnvvJsgLy9sYXllci9hbGVydOexu+WvueixoVxyXG5cdFx0QWxlcnRTaW5nbGUuc2hvdyh7XHJcbiAgICAgICAgICAgIGNvbnRlbnQ6ICfmgqjov5jmnKrnmbvpmYYnXHJcbiAgICAgICAgfSx7XHJcbiAgICAgICAgICAgIG9rOiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+eCueWHu+WlveeahCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAqICovXHJcblxyXG5jb25zdCBBbGVydENvbnRyb2wgPSByZXF1aXJlKCcuL2FsZXJ0Q29udHJvbC5qcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBuZXcgQWxlcnRDb250cm9sKCk7XHJcbiIsIu+7vy8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IOWfuuacrOeahOW8ueWxguW3peWOguaOp+WItuWZqO+8jOS4jeWPr+ebtOaOpeS9v+eUqO+8jOWPquWPr+WtkOexu+e7p+aJv+WQjuS9v+eUqOOAglxyXG4gKiDlupTnlKjlnLrmma/vvJrpkojlr7npopHnuYHmm7TmlLnlvLnlsYLph4zmn5DkupvoioLngrnnmoTlhoXlrrnvvIzku6Xlj4rmm7TmlLnngrnlh7vmjInpkq7lkI7nmoTlm57osIPkuovku7bjgIJcclxuICogQHZlcnNpb24gMS4wLjAgfCAyMDE2LTAxLTI2IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEBleGFtcGxlXHJcbiAqICAgICAgY29uc3QgQmFzZUNvbnRyb2wgPSByZXF1aXJlKCdsaWJsYXllci1iYXNlQ29udHJvbCcpO1xyXG4gKlxyXG4gKiAqL1xyXG5cclxuIGNvbnN0IFRvb2wgPSByZXF1aXJlKCdsaWJ1dGlsLXRvb2wnKTtcclxuXHJcbiBjbGFzcyBCYXNlQ29udHJvbCB7XHJcbiAgICAgLyoqXHJcbiAgICAgICog5bel5Y6C5qih5Z6L5o6n5Yi25ZmoXHJcbiAgICAgICogQHBhcmFtIHtCb29sZWFufSBoaWRlZGVzdHJveSDlvLnlsYLlhbPpl63ml7bvvIzmmK/lkKbotbDns7vnu5/pu5jorqTnmoTplIDmr4Hmk43kvZzjgILpu5jorqTkuLp0cnVlXHJcbiAgICAgICovXHJcbiAgICAgY29uc3RydWN0b3IoaGlkZWRlc3Ryb3kpe1xyXG4gICAgICAgICB0aGlzLl9sYXllcm9iaiA9IG51bGw7IC8v5by55bGC5a+56LGhXHJcbiBcdFx0IHRoaXMuX2RlZmF1bHRvcHQgPSB7fTsgLy/pu5jorqRjb25maWfphY3nva7lj4LmlbBcclxuIFx0XHQgdGhpcy5fZnVuYXJyID0gW107IC8v5Lya5pu/5o2i55qE5Zue6LCD5pa55rOV55qE5YWz6ZSu6K+N44CC5aaCWydvaycsJ2NhbmNlbCddXHJcbiAgICAgICAgIHRoaXMuY3JlYXRlY2FsID0gJC5DYWxsYmFja3MoKTsgLy/lvLnlsYLlr7nosaHliJvlu7rlkI7nmoTlm57osINcclxuICAgICAgICAgaWYodHlwZW9mIGhpZGVkZXN0cm95ICE9ICdib29sZWFuJyl7XHJcbiAgICAgICAgICAgICBoaWRlZGVzdHJveSA9IHRydWU7XHJcbiAgICAgICAgIH1cclxuICAgICAgICAgdGhpcy5oaWRlZGVzdHJveSA9IGhpZGVkZXN0cm95O1xyXG4gICAgIH1cclxuICAgICAvKipcclxuIFx0ICogIOWPguaVsOivtOaYjuivt+WPguingeWtkOexu+S9v+eUqOeahOW8ueWxguexu+mHjOmdoueahGNvbmZpZ+ivtOaYjlxyXG4gXHQgKiAg5aaCYWxlcnQuanPjgIJjb25maXJtLmpzXHJcbiBcdCAqL1xyXG4gICAgIHNldGNvbmZpZyhjb25maWcpe1xyXG4gICAgICAgICB0aGlzLl9kZWZhdWx0b3B0ID0gY29uZmlnO1xyXG4gICAgIH1cclxuICAgICAvKipcclxuIFx0ICog6I635Y+W5by55bGC5a+56LGh77yM5YW35L2T55Sx5a2Q57G75a6e546wXHJcbiBcdCAqL1xyXG4gICAgIGdldGxheWVyb2JqKCl7XHJcblxyXG4gICAgIH1cclxuICAgICAvKipcclxuIFx0ICog5re75Yqg57O757uf5Zue6LCD77yM55Sx5a2Q57G75Yib5bu65LqG5by55bGC5a+56LGh5ZCO6LCD55SoXHJcbiBcdCAqL1xyXG4gICAgIF9hZGRjYWxsKCl7XHJcbiAgICAgICAgIGlmKHRoaXMuaGlkZWRlc3Ryb3kpe1xyXG4gICAgICAgICAgICAgdGhpcy5fbGF5ZXJvYmouaGlkZWFmdGVyY2FsLmFkZCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgdGhpcy5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgfVxyXG4gICAgICAgICB0aGlzLmNyZWF0ZWNhbC5maXJlKHRoaXMuX2xheWVyb2JqKTtcclxuICAgICB9XHJcbiAgICAgLyoqXHJcbiBcdCAqIOaYvuekuuW8ueWxglxyXG4gXHQgKiBAcGFyYW0ge09iamVjdH0gKnR4dCDmlofmoYjphY3nva4s6YCJ5aGr44CC5aaC5p6cc2V0Y29uZmln6LCD55So6K6+572u55qE5qih5p2/5Lit6L+Y5pyJ5YW25LuWbm9kZT1cIuWFtuS7luWAvFwi77yMXHJcbiBcdCAqICAgICAg5aaCbm9kZT1cIm90aGVyXCIg5YiZ5Y+v6Ieq6KGM5omp5bGVXHJcbiBcdCAqIHtcclxuIFx0ICogXHQgY29udGVudCB7U3RyaW5nfSBub2RlPVwiY29udGVudFwi6IqC54K56YeM6Z2i55qEaHRtbFxyXG4gXHQgKiAgIHRpdGxlIHtTdHJpbmd9IG5vZGU9XCJ0aXRsZVwi6IqC54K56YeM6Z2i55qEaHRtbFxyXG4gXHQgKiAgIG9rIHtTdHJpbmd9IG5vZGU9XCJva1wi6IqC54K56YeM6Z2i55qEaHRtbFxyXG4gXHQgKiB9XHJcbiBcdCAqIEBwYXJhbSB7T2JqZWN0fSBjYWwg5Zue6LCD6YWN572uXHJcbiBcdCAqIHtcclxuIFx0ICogXHQg6ZSu5YC85Li6X2Z1bmFycuS4rei3neemu+eahOWFs+mUruivjSB7RnVuY3Rpb259IOeCueWHu+ehruWumuaMiemSruWQjueahOWbnuiwg1xyXG4gXHQgKiB9XHJcbiBcdCAqL1xyXG4gXHQgc2hvdyh0eHQsY2FsKXtcclxuICAgICAgICAgaWYoIVRvb2wuaXNPYmplY3QodHh0KSl7XHJcbiBcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ2Jhc2VDb250cm9sLXNob3fmlrnms5V0eHTlj4LmlbDlv4XpobvmmK9qc29u5a+56LGhJyk7XHJcbiBcdFx0fWVsc2V7XHJcbiBcdFx0XHRpZihUb29sLmlzT2JqZWN0KGNhbCkpe1xyXG4gXHRcdFx0XHR2YXIgZnVubmFtZSA9IHRoaXMuX2Z1bmFycjtcclxuIFx0XHRcdFx0Zm9yKHZhciBjdXJuYW1lIG9mIGZ1bm5hbWUpe1xyXG4gXHRcdFx0XHRcdGlmKFRvb2wuaXNGdW5jdGlvbihjYWxbY3VybmFtZV0pKXtcclxuIFx0XHRcdFx0XHRcdHRoaXNbJ18nK2N1cm5hbWUrJ2NhbCddID0gY2FsW2N1cm5hbWVdO1xyXG4gXHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0XHRlbHNle1xyXG4gXHRcdFx0XHRcdFx0dGhpc1snXycrY3VybmFtZSsnY2FsJ10gPSBmdW5jdGlvbigpe307XHJcbiBcdFx0XHRcdFx0fVxyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHR9ZWxzZXtcclxuIFx0XHRcdFx0dGhpcy5fb2tjYWwgPSBmdW5jdGlvbigpe307XHJcbiBcdFx0XHR9XHJcbiBcdFx0XHQvL+iOt+WPlnR4dOmHjOmdoueahOmUruWAvFxyXG4gXHRcdFx0dmFyIG5vZGVuYW1lYXJyID0gW107XHJcbiBcdFx0XHRmb3IodmFyIG5hbWUgaW4gdHh0KXtcclxuIFx0XHRcdFx0bm9kZW5hbWVhcnIucHVzaChuYW1lKTtcclxuIFx0XHRcdH1cclxuIFx0XHRcdHRoaXMuZ2V0bGF5ZXJvYmoodHJ1ZSk7XHJcbiBcdFx0XHR2YXIgbm9kZWFyciA9IHRoaXMuX2xheWVyb2JqLmdldE5vZGVzKG5vZGVuYW1lYXJyKTtcclxuIFx0XHRcdGZvcih2YXIgbmFtZSBpbiBub2RlYXJyKXtcclxuIFx0XHRcdFx0VG9vbC5pc1N0cmluZyh0eHRbbmFtZV0pICYmIG5vZGVhcnJbbmFtZV0uaHRtbCh0eHRbbmFtZV0pO1xyXG4gXHRcdFx0fVxyXG4gXHRcdFx0dGhpcy5fbGF5ZXJvYmouc2hvdygpO1xyXG4gXHRcdH1cclxuICAgICB9XHJcbiAgICAgLyoqXHJcbiAgICAgICog6ZSA5q+B5by55bGCXHJcbiAgICAgICovXHJcbiAgICAgZGVzdHJveSgpe1xyXG4gICAgICAgICBpZih0aGlzLl9sYXllcm9iaiAhPSBudWxsKXtcclxuIFx0XHRcdHRoaXMuX2xheWVyb2JqLmRlc3Ryb3koKTtcclxuIFx0XHRcdHRoaXMuX2xheWVyb2JqID0gbnVsbDtcclxuIFx0XHR9XHJcbiAgICAgfVxyXG4gfVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCYXNlQ29udHJvbDtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcg5by55bGC57G777yM57un5om/6IeqbGF5ZXIvbGF5ZXLjgILpu5jorqTlsYXkuK3lrprkvY3vvIzmmL7npLrpga7nvanjgILvvIjlpoLmnpzpnIDlhbbku5bnibnmrorphY3nva7liJnlj4Lop4Hlj4LmlbDor7TmmI7vvIlcclxuICog5aaC5p6c5by55bGC5Lit5pyJ5Lul5LiL5bGe5oCn55qE6IqC54K5bm9kZT1cImNsb3NlXCLjgILliJnngrnlh7vor6XoioLngrnkvJrlhbPpl63lvLnlsYLvvIzlubbop6blj5FoaWRlY2Fs6YCa55+l44CCXHJcbiAqIEB2ZXJzaW9uIDEuMC4wIHwgMjAxNS0wOS0xNCDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAZXhhbXBsZVxyXG4gKiBcdCBjb25zdCBCb21iTGF5ZXIgPSByZXF1aXJlKCdsaWJsYXllci1ib21iTGF5ZXInKTtcclxuICpcclxuICogICB2YXIgbGF5ZXIgPSBuZXcgQm9tYkxheWVyKCk7XHJcbiAqICAgIGxheWVyLnNob3diZWZvcmVjYWwuYWRkKGZ1bmN0aW9uKCl7Y29uc29sZS5sb2coJ+WxguaYvuekuuWJjScpO30pO1xyXG4gKiAgIGxheWVyLmhpZGViZWZvcmVjYWwuYWRkKGZ1bmN0aW9uKCl7Y29uc29sZS5sb2coJ+WxgumakOiXj+WJjScpO30pO1xyXG4gKiAgIGxheWVyLnNob3dhZnRlcmNhbC5hZGQoZnVuY3Rpb24oKXtjb25zb2xlLmxvZygn5bGC5pi+56S65ZCOJyk7fSk7XHJcbiAqICAgbGF5ZXIuaGlkZWFmdGVyY2FsLmFkZChmdW5jdGlvbigpe2NvbnNvbGUubG9nKCflsYLpmpDol4/lkI4nKTt9KTtcclxuICogICBsYXllci5wb3MucG9zY2FsLmFkZChmdW5jdGlvbigpe2NvbnNvbGUubG9nKCdsYXllcuWumuS9jeWQjuWbnuiwgycpfSk7XHJcbiAqICAgbGF5ZXIuc2V0Q29udGVudCgnPGRpdiBjbGFzcz1cImpzLWNvbnRlbnRcIj48L2Rpdj4nKTsgLy/orr7nva5sYXllcuWxgumHjOmdoueahOWGheWuuVxyXG4gKiAgIGxheWVyLmdldE5vZGVzKFsnY29udGVudCddKTsgLy8g6I635Y+WY2xhc3M9XCJqcy1jb250ZW50XCLnmoToioLngrlcclxuICogICBsYXllci5zaG93KCk7IC8v5pi+56S65bGCXHJcbiAqICAgbGF5ZXIuaGlkZSgpOyAvL+makOiXj+WxglxyXG4gKiAgIGxheWVyLmxheWVyOyAvL+WxgmRvbeiKgueCueWvueixoVxyXG4gKiAgIGxheWVyLmNvbnRhaW5lcjsgLy/mta7lsYLlrrnlmahcclxuICogICBsYXllci5kZXN0cm95KCk7IC8v6ZSA5q+B5bGCXHJcbiAqXHJcbiAqICovXHJcblxyXG4gY29uc3QgTGF5ZXIgPSByZXF1aXJlKCcuL2xheWVyLmpzJyksXHJcbiBcdCAgIE1hc2sgPSByZXF1aXJlKCcuL21hc2suanMnKSxcclxuXHQgICBQb3NpdGlvbkJvbWIgPSByZXF1aXJlKCcuL3Bvc2l0aW9uQm9tYi5qcycpLFxyXG5cdCAgIFRvb2wgPSByZXF1aXJlKCdsaWJ1dGlsLXRvb2wnKTtcclxuXHJcbmNsYXNzIEJvbWJMYXllciBleHRlbmRzIExheWVyIHtcclxuXHQvKipcclxuXHQgKiDlvLnlsYLnsbvigJTigJTliJvlu7rlubbmt7vliqDliLDmjIflrprlrrnlmajkuK1cclxuICAgICAqIEBwYXJhbSB7SlNPTn0gY29uZmlnIOW8ueWxgumFjee9ruWPguaVsCDvvIzkuI3mmK/lv4XloavpoblcclxuICAgICAqIFx0XHR7XHJcbiAgICAgKiBcdCAgICAgICBjb250YWluZXIge0VsZW1lbnR9IOWtmOaUvuW8ueWxgueahOWuueWZqOOAguWPr+S4jeaMh+Wumu+8jOm7mOiupOW8ueWxguWtmOaUvuS6jmJvZHnkuK3nmoTkuIDkuKrliqjmgIHnlJ/miJDnmoRkaXbph4xcclxuICAgICAqIFx0ICAgICAgIHBvczp7fSwgLy/lrprkvY3lj4LmlbDvvIzlhbfkvZPor7TmmI7lj6/op4Hmlrnms5VsYXllci9wb3NpdGlvbkJvbWLkuK3nmoRjb25maWfor7TmmI5cclxuICAgICAqICAgICAgICAgbGF5ZXI6IHt9LCAvL+W8ueWxguS/oeaBr+WPguaVsO+8jOWFt+S9k+ivtOaYjuWPr+ingeaWueazlWxheWVyL2xheWVy5Lit55qEY29uZmln6K+05piOXHJcbiAgICAgKiBcdFx0ICAgbWFzazogeyAvL+mBrue9qeS/oeaBr+WPguaVsO+8jOWFt+S9k+ivtOaYjuWPr+ingeaWueazlWxheWVyL21hc2vkuK3nmoRjb25maWfor7TmmI7jgILlnKjmraTln7rnoYDkuIrov5vooYzku6XkuIvmianlsZVcclxuICAgICAqIFx0XHRcdCAgbWFzazogdHJ1ZSwgLy/mmK/lkKbliJvlu7rpga7nvalcclxuICAgICAqICAgICAgICAgICAgY21saGlkZTogZmFsc2UgLy/ngrnlh7vpga7nvanmmK/lkKblhbPpl63lvLnlsYJcclxuICAgICAqICAgICAgICAgICAgLy/lhbbku5bmn6XnnIttYXNrLmpz5Lit55qE6YWN572uXHJcbiAgICAgKiBcdFx0ICAgfVxyXG4gICAgICogICAgICB9XHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IoY29uZmlnKSB7XHJcbiAgICAgICAgdmFyIF9uZXdjb250YWluZXIgPSBmYWxzZTtcclxuXHRcdGlmKCFjb25maWcuY29udGFpbmVyIHx8IGNvbmZpZy5jb250YWluZXIubGVuZ3RoID09IDApe1xyXG5cdFx0XHRjb25maWcuY29udGFpbmVyID0gJCgnPGRpdj48L2Rpdj4nKS5hcHBlbmRUbygnYm9keScpO1xyXG5cdFx0XHRfbmV3Y29udGFpbmVyID0gdHJ1ZTsgLy/or7TmmI7mmK/mlrDliJvlu7rnmoTlrrnlmahcclxuXHRcdH1cclxuXHRcdGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcclxuXHRcdC8v5Yid5aeL5YyW5Z+657G7XHJcblx0XHRzdXBlcihjb25maWcuY29udGFpbmVyLGNvbmZpZy5sYXllcik7XHJcbiAgICAgICAgdGhpcy5fbmV3Y29udGFpbmVyID0gX25ld2NvbnRhaW5lcjtcclxuXHRcdC8v5Yib5bu65a6a5L2N57G75a+56LGhXHJcblx0XHR0aGlzLnBvcyA9IG5ldyBQb3NpdGlvbkJvbWIoe1xyXG5cdFx0XHRsYXllcjogdGhpcy5sYXllclxyXG5cdFx0fSxjb25maWcucG9zKTtcclxuXHRcdC8v5Yib5bu66YGu572pXHJcblx0XHR2YXIgbWFza29wdCA9ICQuZXh0ZW5kKHRydWUse1xyXG5cdFx0XHRtYXNrOiB0cnVlLFxyXG5cdFx0XHRjbWxoaWRlOiBmYWxzZVxyXG5cdFx0fSxjb25maWcubWFzayk7XHJcblx0XHRpZihtYXNrb3B0Lm1hc2speyAvL+WmguaenOWIm+W7uumBrue9qVxyXG5cdFx0XHR0aGlzLm1hc2sgPSBuZXcgTWFzayhjb25maWcuY29udGFpbmVyLG1hc2tvcHQpO1xyXG5cdFx0XHRpZihtYXNrb3B0LmNtbGhpZGUpeyAvL+eCueWHu+mBrue9qeWFs+mXrVxyXG5cdFx0XHRcdHRoaXMubWFzay5jbGlja2NhbC5hZGQoKGUpID0+IHtcclxuXHRcdFx0XHRcdHRoaXMuaGlkZSgpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHQvL+S6i+S7tue7keWumlxyXG5cdFx0dGhpcy5sYXllci5vbignY2xpY2subGliJywgJy5qcy1jbG9zZScsIChlKSA9PiB7XHJcblx0ICAgIFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdCAgICBcdHRoaXMuaGlkZSgpO1xyXG5cdCAgICB9KTtcclxuXHR9XHJcblx0LyoqXHJcblx0ICog6I635Y+WYWxlcnTkuK3lhbfmnIlub2RlPSfmjIflrprlkI3np7An55qE6IqC54K55YiX6KGo44CC5aaC5p6cbm9kZW5hbWVhcnLkuK3mjIflrprnmoToioLngrnkuI3lrZjlnKjvvIzliJnkuI3lnKjnu5PmnpzkuK3ov5Tlm57jgILkuL7kvotcclxuICAgICAqIEBwYXJhbSB7QXJyYXl9IG5vZGVuYW1lYXJyIOWmglsnY29udGVudCcsJ29rJ11cclxuICAgICAqIEByZXR1cm4ge1xyXG4gICAgICogXHQgICBjb250ZW50OiDojrflj5bnmoToioLngrlcclxuICAgICAqICAgICBvazog6I635Y+W55qE6IqC54K5XHJcbiAgICAgKiB9XHJcbiAgICAgKiDlpoLmnpxjb250ZW505LiN5a2Y5Zyo77yM5YiZ5Y+q6L+U5Zuee29rfVxyXG5cdCAqL1xyXG5cdGdldE5vZGVzKG5vZGVuYW1lYXJyKXtcclxuXHRcdHZhciByZXN1bHQgPSB7fSwgdGhhdCA9IHRoaXM7XHJcblx0XHRpZihUb29sLmlzQXJyYXkobm9kZW5hbWVhcnIpKXtcclxuXHRcdFx0JC5lYWNoKG5vZGVuYW1lYXJyLChpbmRleCxuYW1lKSA9PiB7XHJcblx0XHRcdFx0dmFyIG5vZGUgPSB0aGlzLmxheWVyLmZpbmQoJy5qcy0nK25hbWUpO1xyXG5cdFx0XHRcdGlmKG5vZGUubGVuZ3RoID4gMCl7XHJcblx0XHRcdFx0XHRyZXN1bHRbbmFtZV0gPSBub2RlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiDmmL7npLrlvLnlsYJcclxuXHQgKi9cclxuXHRzaG93KCl7XHJcblx0XHRpZighdGhpcy5pc3Nob3coKSl7XHJcblx0XHRcdHRoaXMuc2hvd2JlZm9yZWNhbC5maXJlKCk7IC8v5bGC5pi+56S65YmN5Zue6LCDXHJcblx0XHRcdHRoaXMubWFzayAmJiB0aGlzLm1hc2suc2hvdygpO1xyXG5cdFx0XHR0aGlzLl9zaG93KCk7XHJcblx0XHRcdHRoaXMucG9zLnNldHBvcygpO1xyXG5cdFx0XHR0aGlzLnNob3dhZnRlcmNhbC5maXJlKCk7IC8v5bGC5pi+56S65ZCO5Zue6LCDXHJcblx0XHR9XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIOmakOiXj+W8ueWxglxyXG5cdCAqL1xyXG5cdGhpZGUoKXtcclxuXHRcdGlmKHRoaXMuaXNzaG93KCkpe1xyXG5cdFx0XHR0aGlzLmhpZGViZWZvcmVjYWwuZmlyZSgpOyAvL+WxgumakOiXj+WJjeWbnuiwg1xyXG5cdFx0XHR0aGlzLm1hc2sgJiYgdGhpcy5tYXNrLmhpZGUoKTtcclxuXHRcdFx0dGhpcy5faGlkZSgpO1xyXG5cdFx0XHR0aGlzLmhpZGVhZnRlcmNhbC5maXJlKCk7IC8v5bGC6ZqQ6JeP5ZCO5Zue6LCDXHJcblx0XHR9XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIOW8ueWxgumUgOavgVxyXG5cdCAqL1xyXG5cdGRlc3Ryb3koKXtcclxuXHRcdHRoaXMubGF5ZXIub2ZmKCdjbGljay5saWInLCAnLmpzLWNsb3NlJyk7XHJcblx0XHR0aGlzLnBvcy5kZXN0cm95KCk7XHJcblx0XHRpZih0aGlzLm1hc2spe1xyXG4gICAgICAgICAgICB0aGlzLm1hc2suZGVzdHJveSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgY29udGFpbmVyID0gdGhpcy5jb250YWluZXI7XHJcbiAgICAgICAgc3VwZXIuZGVzdHJveSgpO1xyXG4gICAgICAgIGlmKHRoaXMuX25ld2NvbnRhaW5lcil7XHJcblx0XHRcdGNvbnRhaW5lci5yZW1vdmUoKTtcclxuXHRcdH1cclxuXHRcdHRoaXMuX25ld2NvbnRhaW5lciA9IG51bGw7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJvbWJMYXllcjtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcgY29uZmlybeexu++8jOe7p+aJv+iHqmxheWVyL2JvbWJMYXllcuOAgua3u+WKoOKAnOehruWumuaMiemSruKAneWSjOKAnOWPlua2iOaMiemSruKAneS6i+S7tuWbnuiwg1xyXG4gKiDlpoLmnpzlvLnlsYLkuK3mnInku6XkuIvlsZ7mgKfnmoToioLngrlcclxuICogbm9kZT1cImNsb3NlXCLvvIzngrnlh7vliJnkvJrlhbPpl63lvLnlsYIs5bm26Kem5Y+RaGlkZWNhbOmAmuefpeOAglxyXG4gKiBub2RlPVwib2tcIu+8jOeCueWHu+WImeinpuWPkeKAnOehruWumuaMiemSruKAneS6i+S7tu+8jOWFs+mXreW8ueWxgu+8jOW5tuinpuWPkW9rY2Fs5ZKMaGlkZWNhbOmAmuefpeOAglxyXG4gKiBub2RlPVwiY2FuY2VsXCIg54K55Ye76Kem5Y+R4oCc5Y+W5raI5oyJ6ZKu4oCd5LqL5Lu277yM5YWz6Zet5by55bGC77yM5bm26Kem5Y+RY2FuY2VsY2Fs5ZKMaGlkZWNhbOmAmuefpeOAglxyXG4gKiBAdmVyc2lvbiAxLjAuMCB8IDIwMTUtMDktMTYg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQGV4YW1wbGVcclxuICogXHQgY29uc3QgQ29uZmlybSA9IHJlcXVpcmUoJ2xpYmxheWVyLWNvbmZpcm0nKTtcclxuICpcclxuICogXHQgdmFyIGxheWVyID0gbmV3IENvbmZpcm0oe1xyXG4gKiBcdCBcdGNvbmZpcm06IHtcclxuICogXHRcdFx0ZnJhbWV0cGw6IFsgLy/lvLnlsYLln7rmnKzmqKHmnb9cclxuXHRcdFx0XHQnPGRpdiBjbGFzcz1cImpzLXRpdGxlXCI+PC9kaXY+JyxcclxuXHRcdFx0XHQnPGRpdiBjbGFzcz1cImpzLWNvbnRlbnRcIj48L2Rpdj4nLFxyXG5cdFx0XHRcdCc8ZGl2PjxhIGhyZWY9XCJqYXZhc2NyaXB0OjtcIiBjbGFzcz1cImpzLW9rXCI+5aW955qEPC9hPjxhIGhyZWY9XCJqYXZhc2NyaXB0OjtcIiBjbGFzcz1cImpzLWNhbmNlbFwiPuetieS4i+ivtDwvYT48L2Rpdj4nXHJcblx0XHRcdF0uam9pbignJylcclxuICogICAgICB9XHJcbiAqICAgfSk7XHJcbiAqICAgbGF5ZXIuc2hvd2NhbC5hZGQoZnVuY3Rpb24odHlwZSl7c3dpdGNoKHR5cGUpe2Nhc2UgJ2JlZm9yZSc6Y29uc29sZS5sb2coJ+WxguaYvuekuuWJjScpO2JyZWFrOyBjYXNlICdhZnRlcic6Y29uc29sZS5sb2coJ+WxguaYvuekuuWQjicpO2JyZWFrO319KTtcclxuICogICBsYXllci5oaWRlY2FsLmFkZChmdW5jdGlvbih0eXBlKXtzd2l0Y2godHlwZSl7Y2FzZSAnYmVmb3JlJzpjb25zb2xlLmxvZygn5bGC6ZqQ6JeP5YmNJyk7YnJlYWs7IGNhc2UgJ2FmdGVyJzpjb25zb2xlLmxvZygn5bGC6ZqQ6JeP5ZCOJyk7YnJlYWs7fX0pO1xyXG4gKiAgIGxheWVyLm9rY2FsLmFkZChmdW5jdGlvbihlKXtjb25zb2xlLmxvZygn54K55Ye75LqG56Gu5a6aJyl9KTtcclxuICogICBsYXllci5jYW5jZWxjYWwuYWRkKGZ1bmN0aW9uKGUpe2NvbnNvbGUubG9nKCfngrnlh7vkuoblj5bmtognKX0pO1xyXG4gKiAgIGxheWVyLnNldE15Q29udGVudCgn6K6+572ubm9kZT1cImNvbnRlbnRcIuiKgueCueeahGlubmVySFRNTCcpO1xyXG4gKiAgIHZhciBub2RlQXJyID0gbGF5ZXIuZ2V0Tm9kZXMoWyd0aXRsZSddKTsgLy8g6I635Y+WY2xhc3M9XCJqcy10aXRsZVwi55qE6IqC54K5XHJcbiAqICAgbm9kZUFyci50aXRsZS5odG1sKCflhoXlrrnljLpodG1sJyk7XHJcbiAqICAgbGF5ZXIuY29udGVudG5vZGU7IC8v5YaF5a655Yy6bm9kZT1cImNvbnRlbnRcIuiKgueCuVxyXG4gKiAgIGxheWVyLnNob3coKTsgLy/mmL7npLrlsYJcclxuICogICBsYXllci5oaWRlKCk7IC8v6ZqQ6JeP5bGCXHJcbiAqICAgbGF5ZXIubGF5ZXI7IC8v5bGCZG9t6IqC54K55a+56LGhXHJcbiAqICAgbGF5ZXIuY29udGFpbmVyOyAvL+a1ruWxguWuueWZqFxyXG4gKiAgIGxheWVyLmRlc3Ryb3koKTsgLy/plIDmr4HlsYJcclxuICogKi9cclxuY29uc3QgQm9tYkxheWVyID0gcmVxdWlyZSgnLi9ib21iTGF5ZXIuanMnKSxcclxuXHRcdFRwbCA9IHJlcXVpcmUoJy4vdHBsLmpzJyk7XHJcblxyXG5jbGFzcyBDb25maXJtIGV4dGVuZHMgQm9tYkxheWVyIHtcclxuXHQvKipcclxuXHQgKiBjb25maXJt57G7XHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIOWPguaVsOWQjGxheWVyL2JvbWJMYXllcumHjOmdoueahGNvbmZpZyzlnKjmraTln7rnoYDkuIrlop7liqDlpoLkuIvpu5jorqTphY3nva5cclxuICAgICAqIHtcclxuICAgICAqIFx0ICAqY29uZmlybToge1xyXG4gICAgICogXHRcdCAqZnJhbWV0cGwge1N0cmluZ30gY29uZmlybeWfuuacrOaooeadv+OAguimgeaxguivt+ivpuingWxheWVyL3RwbOmHjOmdomNvbmZpcm3pobnnmoTopoHmsYJcclxuICAgICAqICAgIH1cclxuICAgICAqIH1cclxuXHQgKi9cclxuXHRjb25zdHJ1Y3Rvcihjb25maWcpIHtcclxuXHRcdHZhciBvcHQgPSAkLmV4dGVuZCh0cnVlLHtcclxuXHRcdFx0Y29uZmlybToge1xyXG5cdFx0XHRcdGZyYW1ldHBsOiBUcGwuY29uZmlybSAvL2NvbmZpcm3lvLnlsYLln7rmnKzmqKHmnb/jgILopoHmsYLor7for6bop4FsYXllci90cGzph4zpnaJjb25maXJt6aG555qE6KaB5rGCXHJcblx0XHRcdH1cclxuXHRcdH0sY29uZmlnKTtcclxuXHRcdHN1cGVyKG9wdCk7XHJcblx0XHR0aGlzLnNldENvbnRlbnQob3B0LmNvbmZpcm0uZnJhbWV0cGwpO1xyXG5cdFx0dGhpcy5jb250ZW50bm9kZSA9IHRoaXMubGF5ZXIuZmluZCgnLmpzLWNvbnRlbnQnKTsgLy/lhoXlrrnljLroioLngrlcclxuXHRcdHRoaXMub2tjYWwgPSAkLkNhbGxiYWNrcygpO1xyXG5cdFx0dGhpcy5jYW5jZWxjYWwgPSAkLkNhbGxiYWNrcygpO1xyXG5cdFx0Ly/kuovku7bnu5HlrppcclxuXHQgICAgdGhpcy5sYXllci5vbignY2xpY2subGliJywgJy5qcy1vaycsIChlKSA9PiB7XHJcblx0ICAgIFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHR0aGlzLm9rY2FsLmZpcmUoZSk7XHJcblx0ICAgIFx0dGhpcy5oaWRlKCk7XHJcblx0ICAgIH0pO1xyXG5cdCAgICB0aGlzLmxheWVyLm9uKCdjbGljay5saWInLCAnLmpzLWNhbmNlbCcsIChlKSA9PiB7XHJcblx0ICAgIFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHR0aGlzLmNhbmNlbGNhbC5maXJlKGUpO1xyXG5cdCAgICBcdHRoaXMuaGlkZSgpO1xyXG5cdCAgICB9KTtcclxuXHR9XHJcblx0LyoqXHJcblx0ICog6K6+572uY29uZmlybeWGheWuueWMuuWFt+aciVtub2RlPVwiY29udGVudFwiXeWxnuaAp+eahOiKgueCueeahGh0bWxcclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBodG1sXHJcblx0ICovXHJcblx0c2V0TXlDb250ZW50KGh0bWwpe1xyXG5cdFx0aWYodHlwZW9mIGh0bWwgPT0gJ3N0cmluZycgJiYgdGhpcy5jb250ZW50bm9kZS5sZW5ndGggPiAwKXtcclxuXHRcdFx0dGhpcy5jb250ZW50bm9kZS5odG1sKGh0bWwpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiDnu4Tku7bplIDmr4FcclxuXHQgKi9cclxuXHRkZXN0cm95KCl7XHJcblx0XHR0aGlzLmxheWVyLm9mZignY2xpY2subGliJywgJy5qcy1vaycpO1xyXG5cdFx0dGhpcy5sYXllci5vZmYoJ2NsaWNrLmxpYicsICcuanMtY2FuY2VsJyk7XHJcblx0XHRzdXBlci5kZXN0cm95KCk7XHJcblx0XHR0aGlzLmNvbnRlbnRub2RlID0gbnVsbDtcclxuXHRcdHRoaXMub2tjYWwgPSBudWxsO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb25maXJtO1xyXG4iLCLvu78vKipcclxuICogQGZpbGVvdmVydmlldyBjb25maXJt55qE5bel5Y6C5o6n5Yi25Zmo77yM6ZuG5oiQYmFzZUNvbnRyb2xcclxuICog5bqU55So5Zy65pmv77ya6ZKI5a+5566A5Y2VY29uZmlybeW8ueWxgu+8jOmSiOWvuemikee5geabtOaUueW8ueWxgumHjOafkOS6m+iKgueCueeahOWGheWuue+8jOS7peWPiuabtOaUueeCueWHu1wi56Gu5a6aXCLjgIFcIuWPlua2iFwi5oyJ6ZKu5ZCO55qE5Zue6LCD5LqL5Lu2XHJcbiAqIOWmguaenOaYr+abtOWkjeadgueahOS6pOS6kuW7uuiuruS9v+eUqGxheWVycy5jb25maXJt5oiWbGF5ZXJzLmJvbWJMYXllclxyXG4gKiBAdmVyc2lvbiAxLjAuMCB8IDIwMTYtMDEtMjYg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQGV4YW1wbGVcclxuICogXHRcdGNvbnN0IENvbmZpcm1Db250cm9sID0gcmVxdWlyZSgnbGlibGF5ZXItY29uZmlybUNvbnRyb2wnKTtcclxuICpcclxuXHRcdHZhciBjdXJjb25maXJtID0gbmV3IENvbmZpcm1Db250cm9sKCk7XHJcblx0XHRjdXJjb25maXJtLnNldGNvbmZpZyh7XHJcblx0XHRcdGNvbmZpcm06IHtcclxuXHRcdFx0XHRmcmFtZXRwbDogW1xyXG5cdFx0XHRcdFx0JzxkaXYgY2xhc3M9XCJqcy1jb250ZW50XCI+PC9kaXY+JyxcclxuXHRcdFx0XHRcdCc8ZGl2PjxhIGhyZWY9XCJqYXZhc2NyaXB0OjtcIiBjbGFzcz1cImpzLW9rXCI+5aW955qEPC9hPjxhIGhyZWY9XCJqYXZhc2NyaXB0OjtcIiBjbGFzcz1cImpzLWNhbmNlbFwiPuetieS4i+ivtDwvYT48L2Rpdj4nXHJcblx0XHRcdFx0XS5qb2luKCcnKVxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdGN1cmNvbmZpcm0uc2hvdyh7XHJcblx0XHQgICAgY29udGVudDogJ+aCqOi/mOacqueZu+mZhidcclxuXHRcdH0se1xyXG5cdFx0ICAgIG9rOiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+eCueWHu+WlveeahCcpO1xyXG4gICAgICAgICAgICB9LFxyXG5cdFx0XHRjYW5jZWw6IGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0Y29uc29sZS5sb2coJ+eCueWHu+etieS4i+ivtCcpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdGN1cmNvbmZpcm0uZ2V0bGF5ZXJvYmooKe+8myAvL2xheWVyL2NvbmZpcm3nsbvlr7nosaFcclxuICogKi9cclxuXHJcbiBjb25zdCBDb25maXJtID0gcmVxdWlyZSgnLi9jb25maXJtLmpzJyksXHJcbiBcdFx0QmFzZUNvbnRyb2wgPSByZXF1aXJlKCcuL2Jhc2VDb250cm9sLmpzJyk7XHJcblxyXG5jbGFzcyBDb25maXJtQ29udHJvbCBleHRlbmRzIEJhc2VDb250cm9sIHtcclxuXHQvKipcclxuICAgICAqIGNvbmZpcm3lt6XljoLmjqfliLblmahcclxuICAgICAqL1xyXG5cdGNvbnN0cnVjdG9yKGhpZGVkZXN0cm95KSB7XHJcblx0XHRzdXBlcihoaWRlZGVzdHJveSk7XHJcblx0XHR0aGlzLl9va2NhbCA9IGZ1bmN0aW9uKCl7fTsgLy/ngrnlh7tva+eahOWbnuiwg+engeacieWtmOWCqOWZqFxyXG5cdFx0dGhpcy5fY2FuY2VsY2FsID0gZnVuY3Rpb24oKXt9OyAvL+eCueWHu2NhbmNlbOeahOWbnuiwg+engeacieWtmOWCqOWZqFxyXG5cdFx0dGhpcy5fZnVuYXJyID0gWydvaycsJ2NhbmNlbCddOyAvL+WPr+aOp+WItueahOWbnuiwg+aWueazleWQjVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiDojrflj5Zjb25maXJt5by55bGCXHJcblx0ICogQHBhcmFtIHtCb29sZWFufSByZXNldCDmmK/lkKbph43mlrDmuLLmn5PmqKHmnb/jgILpu5jorqTkuLpmYWxzZVxyXG5cdCAqL1xyXG5cdGdldGxheWVyb2JqKHJlc2V0KXtcclxuXHRcdGlmKHRoaXMuX2xheWVyb2JqID09IG51bGwpe1xyXG5cdFx0XHR0aGlzLl9sYXllcm9iaiA9IG5ldyBDb25maXJtKHRoaXMuX2RlZmF1bHRvcHQpO1xyXG5cdFx0XHR0aGlzLl9sYXllcm9iai5va2NhbC5hZGQoKGUpID0+IHtcclxuXHRcdFx0XHR0aGlzLl9va2NhbCgpO1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0dGhpcy5fbGF5ZXJvYmouY2FuY2VsY2FsLmFkZCgoZSkgPT4ge1xyXG5cdFx0XHRcdHRoaXMuX2NhbmNlbGNhbCgpO1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0dGhpcy5fYWRkY2FsbCgpO1xyXG5cdFx0fWVsc2V7XHJcbiAgICAgICAgICAgIGlmKHJlc2V0KXtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2xheWVyb2JqLnNldENvbnRlbnQodGhpcy5fZGVmYXVsdG9wdC5jb25maXJtLmZyYW1ldHBsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHRcdHJldHVybiB0aGlzLl9sYXllcm9iajtcclxuXHR9XHJcblx0LyoqXHJcblx0ICog6ZSA5q+BYWxlcnTlvLnlsYJcclxuXHQgKi9cclxuXHRkZXN0cm95KCl7XHJcblx0XHRzdXBlci5kZXN0cm95KCk7XHJcblx0XHR0aGlzLl9va2NhbCA9IGZ1bmN0aW9uKCl7fTtcclxuXHRcdHRoaXMuX2NhbmNlbGNhbCA9IGZ1bmN0aW9uKCl7fTtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29uZmlybUNvbnRyb2w7XHJcbiIsIu+7vy8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IGNvbmZyaW3nsbvljZXkvZPmjqfliLblmajvvIzkuIDoiKznlKjkuo7nroDljZXnmoRjb25maXJt5L+h5oGv5o+Q56S644CCXHJcbiAqIOazqOaEj++8muivpWNvbmZyaW3mjqfliLbnmoTlr7nosaHlj4pkb23lnKjlhajlsYDkuK3llK/kuIDlrZjlnKjvvIzlpoLmnpzmg7PopoHliJvlu7rlpJrkuKrvvIzor7fkvb/nlKhsaWJsYXllcnMvY29uZmlybeaIlmxpYmxheWVycy9jb25maXJtQ29udHJvbFxyXG4gKiBAdmVyc2lvbiAxLjAuMCB8IDIwMTUtMDktMTYg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQGV4YW1wbGVcclxuICogICAgICBjb25zdCBDb25maXJtU2luZ2xlID0gcmVxdWlyZSgnbGlibGF5ZXItY29uZmlybVNpbmdsZScpO1xyXG4gKlxyXG5cdFx0Q29uZmlybVNpbmdsZS5zZXRjb25maWcoe1xyXG5cdFx0XHRjb25maXJtOiB7XHJcblx0XHRcdFx0ZnJhbWV0cGw6IFtcclxuXHRcdFx0XHRcdCc8ZGl2IGNsYXNzPVwianMtY29udGVudFwiPjwvZGl2PicsXHJcblx0XHRcdFx0XHQnPGRpdj48YSBocmVmPVwiamF2YXNjcmlwdDo7XCIgY2xhc3M9XCJqcy1va1wiPuWlveeahDwvYT48YSBocmVmPVwiamF2YXNjcmlwdDo7XCIgY2xhc3M9XCJqcy1jYW5jZWxcIj7nrYnkuIvor7Q8L2E+PC9kaXY+J1xyXG5cdFx0XHRcdF0uam9pbignJylcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHRDb25maXJtU2luZ2xlLnNob3coe1xyXG5cdFx0ICAgIGNvbnRlbnQ6ICfmgqjov5jmnKrnmbvpmYYnXHJcblx0XHR9LHtcclxuXHRcdCAgICBvazogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfngrnlh7vlpb3nmoQnKTtcclxuICAgICAgICAgICAgfSxcclxuXHRcdFx0Y2FuY2VsOiBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdGNvbnNvbGUubG9nKCfngrnlh7vnrYnkuIvor7QnKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcbiAgICAgICAgQ29uZmlybVNpbmdsZS5nZXRsYXllcm9iaigp77ybIC8vbGF5ZXIvY29uZmlybeexu+WvueixoVxyXG4gKiAqL1xyXG4gY29uc3QgQ29uZnJpbUNvbnRyb2wgPSByZXF1aXJlKCcuL2NvbmZpcm1Db250cm9sLmpzJyk7XHJcblxyXG4gbW9kdWxlLmV4cG9ydHMgPSBuZXcgQ29uZnJpbUNvbnRyb2woKTtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcg5rWu5bGC5Z+657G7XHJcbiAqIEB2ZXJzaW9uIDEuMC4wIHwgMjAxNS0wOC0xOSDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAcmV0dXJuIOa1ruWxguWfuuexu1xyXG4gKiBAZXhhbXBsZVxyXG4gKlxyXG4gKiBcdGNvbnN0IExheWVyID0gcmVxdWlyZSgnbGlibGF5ZXItbGF5ZXInKTtcclxuICpcclxuICogXHQgdmFyIGxheWVyID0gbmV3IExheWVyKCQoJ2JvZHknKSk7XHJcbiAqICAgbGF5ZXIuc2hvd2JlZm9yZWNhbC5hZGQoZnVuY3Rpb24oKXtjb25zb2xlLmxvZygn5bGC5pi+56S65YmNJyk7fSk7XHJcbiAqICAgbGF5ZXIuaGlkZWJlZm9yZWNhbC5hZGQoZnVuY3Rpb24oKXtjb25zb2xlLmxvZygn5bGC6ZqQ6JeP5YmNJyk7fSk7XHJcbiAqICAgbGF5ZXIuc2hvd2FmdGVyY2FsLmFkZChmdW5jdGlvbigpe2NvbnNvbGUubG9nKCflsYLmmL7npLrlkI4nKTt9KTtcclxuICogICBsYXllci5oaWRlYWZ0ZXJjYWwuYWRkKGZ1bmN0aW9uKCl7Y29uc29sZS5sb2coJ+WxgumakOiXj+WQjicpO30pO1xyXG4gKiAgIGxheWVyLmhpZGUoKTsgLy/pmpDol4/lsYJcclxuICogICBsYXllci5sYXllcjsgLy/lsYJkb23oioLngrnlr7nosaFcclxuICogICBsYXllci5jb250YWluZXI7IC8v5rWu5bGC5a655ZmoXHJcbiAqICAgbGF5ZXIuZGVzdHJveSgpOyAvL+mUgOavgeWxglxyXG4gKiAqL1xyXG5cclxuIGNsYXNzIExheWVyIHtcclxuXHQgLyoqXHJcbiBcdCAqIOa1ruWxguWfuuexu+KAlOKAlOWIm+W7uuW5tua3u+WKoOWIsOaMh+WumuWuueWZqOS4rVxyXG4gICAgICAqIEBwYXJhbSB7RWxlbWVudH0gY29udGFpbmVyIOa1ruWxguWtmOaUvuWuueWZqO+8jOm7mOiupOS4uiQoJ2JvZHknKVxyXG4gICAgICAqIEBwYXJhbSB7SlNPTn0gY29uZmlnIOWxgumFjee9ruWPguaVsO+8jOm7mOiupOS/oeaBr+WPiuivtOaYjuWmguS4i29wdOS7o+eggeWkhFxyXG4gXHQgKi9cclxuXHQgY29uc3RydWN0b3IoY29udGFpbmVyLGNvbmZpZyl7XHJcblx0XHRjb250YWluZXIgPSBjb250YWluZXIgfHwgJCgnYm9keScpO1xyXG4gXHRcdHZhciBvcHQgPSAkLmV4dGVuZCh0cnVlLHtcclxuIFx0XHRcdGNsYXNzbmFtZTogJycsIC8vbGF5ZXLnmoRjbGFzc1xyXG4gXHRcdFx0ekluZGV4OiAyLCAvL2xheWVy55qEei1pbmRleFxyXG4gXHRcdFx0cG9zaXRpb246ICdhYnNvbHV0ZScsIC8vbGF5ZXLnmoRwb3NpdGlvbuOAgum7mOiupOaYr2Fic29sdXRlXHJcbiBcdFx0XHRzaG93OiBmYWxzZSwgLy/liJvlu7rlsYLlkI7pu5jorqTmmK/lkKbmmL7npLpcclxuIFx0XHRcdGN1c3RvbToge1xyXG4gXHRcdFx0XHRzaG93OiBudWxsLCAvL+eUqOaIt+iHquWumuS5ieaYvuekuuWxgueahOaWueazleOAguWmguaenOatpOaWueazleWtmOWcqO+8jOWImeS4jeeUqOm7mOiupOeahOaYvuekuuWxguaWueazlVxyXG4gXHRcdFx0XHRoaWRlOiBudWxsIC8v55So5oi36Ieq5a6a5LmJ6ZqQ6JeP5bGC55qE5pa55rOV44CC5aaC5p6c5q2k5pa55rOV5a2Y5Zyo77yM5YiZ5LiN55So6buY6K6k55qE6ZqQ6JeP5bGC5pa55rOVXHJcbiBcdFx0XHR9XHJcbiBcdFx0fSxjb25maWcgfHwge30pO1xyXG4gXHRcdHZhciBjc3NzdHIgPSAncG9zaXRpb246JytvcHQucG9zaXRpb24rJzsnKyhvcHQuc2hvdz8nJzonZGlzcGxheTpub25lOycpKyd6LWluZGV4Oicrb3B0LnpJbmRleCsnOyc7XHJcbiBcdFx0dGhpcy5jb250YWluZXIgPSBjb250YWluZXI7IC8v5rWu5bGC5a655ZmoXHJcbiBcdFx0dGhpcy5sYXllciA9ICQoJzxkaXYnKyhvcHQuY2xhc3NuYW1lID09ICcnPycnOicgY2xhc3M9XCInK29wdC5jbGFzc25hbWUrJ1wiJykrJyBzdHlsZT1cIicrY3Nzc3RyKydcIj48L2Rpdj4nKTtcclxuIFx0XHR0aGlzLmxheWVyLmFwcGVuZFRvKGNvbnRhaW5lcik7XHJcbiBcdFx0dGhpcy5zaG93YmVmb3JlY2FsID0gJC5DYWxsYmFja3MoKTsgLy/lsYLmmL7npLrliY3nmoTlm57osINcclxuIFx0XHR0aGlzLnNob3dhZnRlcmNhbCA9ICQuQ2FsbGJhY2tzKCk7IC8v5bGC5pi+56S65ZCO55qE5Zue6LCDXHJcbiBcdFx0dGhpcy5oaWRlYmVmb3JlY2FsID0gJC5DYWxsYmFja3MoKTsgLy/lsYLpmpDol4/liY3nmoTlm57osINcclxuIFx0XHR0aGlzLmhpZGVhZnRlcmNhbCA9ICQuQ2FsbGJhY2tzKCk7IC8v5bGC6ZqQ6JeP5ZCO55qE5Zue6LCDXHJcbiBcdFx0dGhpcy5jdXN0b20gID0gb3B0LmN1c3RvbTsgLy/oh6rlrprkuYnmlrnms5VcclxuXHQgfVxyXG5cdCAvKipcclxuIFx0ICog6K6+572u5bGC5YaF5a65XHJcbiAgXHQgKiBAcGFyYW0ge0VsZW1lbnR8U3RyaW5nfSAqY29udGVudCBodG1s5a2X56ym5Liy5oiW6ICF6IqC54K55a+56LGhXHJcbiBcdCAqL1xyXG5cdCBzZXRDb250ZW50KGNvbnRlbnQpe1xyXG5cdFx0aWYoYXJndW1lbnRzLmxlbmd0aCA9PSAwKXtcclxuIFx0XHRcdHJldHVybjtcclxuIFx0XHR9XHJcbiBcdFx0aWYodHlwZW9mIGNvbnRlbnQgPT0gJ3N0cmluZycpe1xyXG4gXHRcdFx0dGhpcy5sYXllci5odG1sKGNvbnRlbnQpO1xyXG4gXHRcdH1cclxuIFx0XHRlbHNle1xyXG4gXHRcdFx0dGhpcy5sYXllci5odG1sKCcnKS5hcHBlbmQoY29udGVudCk7XHJcbiBcdFx0fVxyXG5cdCB9XHJcblx0IC8qKlxyXG4gXHQgKiDmmL7npLrlsYLjgIJcclxuIFx0ICovXHJcblx0IF9zaG93KCl7XHJcblx0XHQgaWYodHlwZW9mIHRoaXMuY3VzdG9tLnNob3cgPT0gJ2Z1bmN0aW9uJyl7XHJcbiBcdFx0XHR0aGlzLmN1c3RvbS5zaG93KHRoaXMubGF5ZXIpO1xyXG4gXHRcdH1cclxuIFx0XHRlbHNle1xyXG4gXHRcdFx0dGhpcy5sYXllci5zaG93KCk7XHJcbiBcdFx0fVxyXG5cdCB9XHJcblx0IC8qKlxyXG4gXHQgKiDmmL7npLrlsYLjgILkvJrop6blj5FzaG93Y2Fs5Zue6LCDXHJcbiBcdCAqL1xyXG4gXHQgc2hvdygpe1xyXG5cdFx0IGlmKCF0aGlzLmlzc2hvdygpKXtcclxuIFx0XHRcdHRoaXMuc2hvd2JlZm9yZWNhbC5maXJlKCk7IC8v5bGC5pi+56S65YmN5Zue6LCDXHJcbiBcdFx0XHR0aGlzLl9zaG93KCk7XHJcbiBcdFx0XHR0aGlzLnNob3dhZnRlcmNhbC5maXJlKCk7IC8v5bGC5pi+56S65ZCO5Zue6LCDXHJcbiBcdFx0fVxyXG5cdCB9XHJcblx0IC8qKlxyXG4gXHQgKiDpmpDol4/lsYLjgIJcclxuIFx0ICovXHJcblx0IF9oaWRlKCl7XHJcblx0XHRpZih0eXBlb2YgdGhpcy5jdXN0b20uaGlkZSA9PSAnZnVuY3Rpb24nKXtcclxuIFx0XHRcdHRoaXMuY3VzdG9tLmhpZGUodGhpcy5sYXllcik7XHJcbiBcdFx0fVxyXG4gXHRcdGVsc2V7XHJcbiBcdFx0XHR0aGlzLmxheWVyLmhpZGUoKTtcclxuIFx0XHR9XHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOmakOiXj+WxguOAguS8muinpuWPkWhpZGVjYWzlm57osINcclxuIFx0ICovXHJcblx0IGhpZGUoKXtcclxuXHRcdCBpZih0aGlzLmlzc2hvdygpKXtcclxuIFx0XHRcdHRoaXMuaGlkZWJlZm9yZWNhbC5maXJlKCk7IC8v5bGC6ZqQ6JeP5YmN5Zue6LCDXHJcbiBcdFx0XHR0aGlzLl9oaWRlKCk7XHJcbiBcdFx0XHR0aGlzLmhpZGVhZnRlcmNhbC5maXJlKCk7IC8v5bGC6ZqQ6JeP5ZCO5Zue6LCDXHJcbiBcdFx0fVxyXG5cdCB9XHJcblx0IC8qKlxyXG4gXHQgKiDplIDmr4HlsYJcclxuIFx0ICovXHJcblx0IGRlc3Ryb3koKXtcclxuXHRcdCBpZih0aGlzLmxheWVyICE9IG51bGwpe1xyXG4gXHRcdFx0dGhpcy5sYXllci5yZW1vdmUoKTtcclxuIFx0XHRcdHRoaXMubGF5ZXIgPSBudWxsO1xyXG4gXHRcdFx0dGhpcy5zaG93Y2FsID0gbnVsbDtcclxuIFx0XHRcdHRoaXMuaGlkZWNhbCA9IG51bGw7XHJcbiBcdFx0XHR0aGlzLmN1c3RvbSA9IG51bGw7XHJcbiBcdFx0XHR0aGlzLmNvbnRhaW5lciA9IG51bGw7XHJcbiBcdFx0fVxyXG5cdCB9XHJcblx0IC8qKlxyXG4gXHQgKiDliKTmlq3lsYLmmK/lkKbmmL7npLpcclxuIFx0ICogQHJldHVybiB7Qm9vbGVhbn0gdHJ1ZXxmYWxzZVxyXG4gXHQgKi9cclxuXHQgaXNzaG93KCl7XHJcblx0XHQgcmV0dXJuIHRoaXMubGF5ZXIuY3NzKCdkaXNwbGF5JykgIT0gJ25vbmUnO1xyXG5cdCB9XHJcbiB9XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IExheWVyO1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyDpga7nvannsbvigJTigJTliJvlu7rpga7nvanlubbov5vooYznm7jlhbPmjqfliLZcclxuICogQHZlcnNpb24gMS4wIHwgMjAxNS0wOC0xNSDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAcmV0dXJuIOmBrue9qeWvueixoVxyXG4gKiBAZXhhbXBsZVxyXG4gKiBcdCBjb25zdCBNYXNrID0gcmVxdWlyZSgnbGlibGF5ZXItbWFzaycpO1xyXG4gKlxyXG4gKiBcdCB2YXIgbWFzayA9IG5ldyAkbWFzaygkKCdib2R5JykpO1xyXG4gKiAgIG1hc2suc2hvdygpOyAvL+aYvuekuumBrue9qVxyXG4gKiAgIG1hc2suaGlkZSgpOyAvL+makOiXj+mBrue9qVxyXG4gKiAgIG1hc2subWFzazsgLy/pga7nvalkb23oioLngrnlr7nosaFcclxuICogICBtYXNrLmNvbnRhaW5lcjsgLy/pga7nvanlrrnlmahcclxuICogICBtYXNrLmRlc3Ryb3koKTsgLy/plIDmr4Hpga7nvalcclxuICogICBtYXNrLmNsaWNrY2FsLmFkZChmdW5jdGlvbihlKXtcclxuICogXHQgICAgY29uc29sZS5sb2coJ+mBrue9qeiiq+eCueWHuycpO1xyXG4gKiAgIH0pO1xyXG4gKiAqL1xyXG5cclxuIGNvbnN0IFBvc2l0aW9uQm9tYiA9IHJlcXVpcmUoJy4vcG9zaXRpb25Cb21iLmpzJyk7XHJcblxyXG4gY2xhc3MgTWFza3tcclxuXHQgLyoqXHJcblx0ICAqIOmBrue9qeexu+KAlOKAlOWIm+W7uumBrue9qWRvbeW5tua3u+WKoOWIsOaMh+WumuWuueWZqOS4rVxyXG5cdCAgKiBAcGFyYW0ge0VsZW1lbnR9IGNvbnRhaW5lciDpga7nvanlrZjmlL7lrrnlmajvvIzpu5jorqTkuLokKCdib2R5JylcclxuXHQgICogQHBhcmFtIHtKU09OfSBjb25maWcg6YGu572p6YWN572u5Y+C5pWw77yM6buY6K6k5L+h5oGv5Y+K6K+05piO5aaC5LiLb3B05Luj56CB5aSEXHJcblx0ICAqL1xyXG5cdCBjb25zdHJ1Y3Rvcihjb250YWluZXIsY29uZmlnKXtcclxuXHRcdCBjb250YWluZXIgPSBjb250YWluZXIgfHwgJCgnYm9keScpO1xyXG5cdFx0IHZhciBvcHQgPSAkLmV4dGVuZCh7XHJcbiAgICAgICAgICAgICBjbGFzc25hbWU6ICcnLCAvL21hc2vnmoRjbGFzc1xyXG5cdFx0XHQgYmdjb2xvcjogJyMwMDAnLCAvL+iDjOaZr+iJslxyXG5cdFx0XHQgekluZGV4OiAxLCAvL+mBrue9qXotaW5kZXhcclxuXHRcdFx0IG9wYWNpdHk6IDAuNiwgLy/pga7nvanpgI/mmI7luqZcclxuXHRcdFx0IHNob3c6IGZhbHNlLCAvL+WIm+W7uumBrue9qeWQjum7mOiupOaYr+WQpuaYvuekulxyXG5cdFx0XHQgY3VzdG9tOiB7XHJcblx0XHRcdFx0IHNob3c6IG51bGwsIC8v55So5oi36Ieq5a6a5LmJ5pi+56S65bGC55qE5pa55rOV44CC5aaC5p6c5q2k5pa55rOV5a2Y5Zyo77yM5YiZ5LiN55So6buY6K6k55qE5pi+56S65bGC5pa55rOVXHJcblx0XHRcdFx0IGhpZGU6IG51bGwgLy/nlKjmiLfoh6rlrprkuYnpmpDol4/lsYLnmoTmlrnms5XjgILlpoLmnpzmraTmlrnms5XlrZjlnKjvvIzliJnkuI3nlKjpu5jorqTnmoTpmpDol4/lsYLmlrnms5VcclxuXHRcdFx0IH1cclxuXHRcdCB9LGNvbmZpZyB8fCB7fSk7XHJcblx0XHQgdmFyIGNzc3N0ciA9ICdwb3NpdGlvbjphYnNvbHV0ZTtiYWNrZ3JvdW5kOicrb3B0LmJnY29sb3IrJzsnKyhvcHQuc2hvdz8nJzonZGlzcGxheTpub25lOycpKyd6LWluZGV4Oicrb3B0LnpJbmRleCsnOyc7XHJcblx0XHQgdGhpcy5jb250YWluZXIgPSBjb250YWluZXI7IC8v6YGu572p5a655ZmoXHJcblx0XHQgdGhpcy5tYXNrID0gJCgnPGRpdicrKG9wdC5jbGFzc25hbWUgPT0gJyc/Jyc6JyBjbGFzcz1cIicrb3B0LmNsYXNzbmFtZSsnXCInKSsnIHN0eWxlPVwiJytjc3NzdHIrJ1wiPjwvZGl2PicpO1xyXG5cdFx0IHRoaXMubWFzay5hcHBlbmRUbyhjb250YWluZXIpO1xyXG5cdFx0IHRoaXMubWFzay5jc3MoJ29wYWNpdHknLG9wdC5vcGFjaXR5KTtcclxuXHRcdCB0aGlzLmN1c3RvbSAgPSBvcHQuY3VzdG9tOyAvL+iHquWumuS5ieaWueazlVxyXG5cdFx0IHRoaXMucG9zID0gbmV3IFBvc2l0aW9uQm9tYih7bGF5ZXI6dGhpcy5tYXNrfSx7bW9kZTonZnVsbCd9KTtcclxuXHRcdCAvL+e7keWumuS6i+S7tlxyXG5cdFx0IHRoaXMuY2xpY2tjYWwgPSAkLkNhbGxiYWNrcygpOyAvL+mBrue9qeeCueWHu+WQjueahOWbnuiwg1xyXG5cdFx0IHRoaXMubWFzay5vbignY2xpY2subGliJywoZSkgPT4ge1xyXG5cdFx0XHQgdGhpcy5jbGlja2NhbC5maXJlKGUpO1xyXG5cdFx0IH0pO1xyXG5cdCB9XHJcblx0IC8qKlxyXG4gXHQgKiDmmL7npLrpga7nvalcclxuIFx0ICovXHJcblx0IHNob3coKXtcclxuXHRcdGlmKHR5cGVvZiB0aGlzLmN1c3RvbS5zaG93ID09ICdmdW5jdGlvbicpe1xyXG4gXHRcdFx0dGhpcy5jdXN0b20uc2hvdyh0aGlzLm1hc2spO1xyXG4gXHRcdH1cclxuIFx0XHRlbHNle1xyXG4gXHRcdFx0dGhpcy5tYXNrLnNob3coKTtcclxuIFx0XHR9XHJcbiBcdFx0dGhpcy5wb3Muc2V0cG9zKCk7XHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOmakOiXj+mBrue9qVxyXG4gXHQgKi9cclxuXHQgaGlkZSgpe1xyXG5cdFx0IGlmKHR5cGVvZiB0aGlzLmN1c3RvbS5oaWRlID09ICdmdW5jdGlvbicpe1xyXG4gXHRcdFx0dGhpcy5jdXN0b20uaGlkZSh0aGlzLm1hc2spO1xyXG4gXHRcdH1cclxuIFx0XHRlbHNle1xyXG4gXHRcdFx0dGhpcy5tYXNrLmhpZGUoKTtcclxuIFx0XHR9XHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOmUgOavgemBrue9qVxyXG4gXHQgKi9cclxuXHQgZGVzdHJveSgpe1xyXG5cdFx0IGlmKHRoaXMubWFzayAhPSBudWxsKXtcclxuIFx0XHRcdHRoaXMubWFzay5vZmYoJ2NsaWNrLmxpYicpO1xyXG4gXHRcdFx0dGhpcy5tYXNrLnJlbW92ZSgpO1xyXG4gXHRcdFx0dGhpcy5tYXNrID0gbnVsbDtcclxuIFx0XHRcdHRoaXMucG9zLmRlc3Ryb3koKTtcclxuIFx0XHRcdHRoaXMucG9zID0gbnVsbDtcclxuIFx0XHRcdHRoaXMuY2xpY2tjYWwgPSBudWxsO1xyXG4gXHRcdH1cclxuXHQgfVxyXG4gfVxyXG5cclxuIG1vZHVsZS5leHBvcnRzID0gTWFzaztcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcg5by55bGC5a6a5L2N5pa55rOVXHJcbiAqIFx0XHTms6jmhI/vvJrosIPnlKjmraTmlrnms5XliY3vvIzlv4XpobvmmK/lvoXlrprkvY3lsYLnmoRkaXNwbGF55LiN5Li6bnVsbOeahOaDheWGteS4i1xyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE1LTA4LTE1IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm4g5by55bGC5a6a5L2N5pa55rOVXHJcbiAqIEBleGFtcGxlXHJcbiAqIFx0IGNvbnN0IFBvc2l0aW9uQm9tYiA9IHJlcXVpcmUoJ2xpYmxheWVyLXBvc2l0aW9uQm9tYicpO1xyXG4gKlxyXG4gKiBcdCB2YXIgcG9zID0gbmV3IFBvc2l0aW9uQm9tYih7bGF5ZXI65bGCZG9t6IqC54K5fSk7XHJcbiAqIFx0IHBvcy5wb3NjYWwuYWRkKGZ1bmN0aW9uKCl7Y29uc29sZS5sb2coJ2xheWVy5a6a5L2N5ZCO5Zue6LCDJyl9KTtcclxuICogKi9cclxuXHJcbiBjb25zdCBXaW5zY3JvbGwgPSByZXF1aXJlKCdsaWJ1dGlsLXdpbnNjcm9sbCcpLFxyXG4gXHRcdFNjcm9sbCA9IHJlcXVpcmUoJ2xpYnV0aWwtc2Nyb2xsJyksXHJcblx0XHRXaW5yZXNpemUgPSByZXF1aXJlKCdsaWJ1dGlsLXdpbnJlc2l6ZScpLFxyXG5cdFx0UmVzaXplID0gcmVxdWlyZSgnbGlidXRpbC1yZXNpemUnKTtcclxuXHJcbi8qKlxyXG4gKiDlrprkvY3nrpfms5VcclxuICovXHJcbmZ1bmN0aW9uIHNldHBvcyhkb21vcHQscG9zb3B0KXtcclxuXHR2YXIgY3Nzb3B0ID0ge30sbGF5ZXIgPSBkb21vcHQubGF5ZXIsb2ZmY29uID0gZG9tb3B0Lm9mZmNvbjtcclxuXHRsYXllci5jc3MoJ3Bvc2l0aW9uJyxkb21vcHQucG9zaXRpb24pO1xyXG5cdHZhciBtYXJnaW5MZWZ0ID0gMCwgbWFyZ2luVG9wID0gMDtcclxuXHRpZihkb21vcHQucG9zaXRpb24gPT0gJ2Fic29sdXRlJyAmJiBwb3NvcHQuZml4ZWQpe1xyXG5cdFx0bWFyZ2luTGVmdCA9IG9mZmNvbi5zY3JvbGxMZWZ0KCk7XHJcblx0XHRtYXJnaW5Ub3AgPSBvZmZjb24uc2Nyb2xsVG9wKCk7XHJcblx0fVxyXG5cdHN3aXRjaCAocG9zb3B0Lm1vZGUpe1xyXG5cdFx0Y2FzZSAnYyc6IC8v5bGF5Lit5a6a5L2NXHJcblx0XHRcdG1hcmdpbkxlZnQgLT0gKE1hdGgubWF4KGxheWVyLndpZHRoKCkscG9zb3B0Lm1pbndpZHRoKS8yK3Bvc29wdC5vZmZzZXRbMF0pO1xyXG5cdFx0XHRtYXJnaW5Ub3AgLT0gKE1hdGgubWF4KGxheWVyLmhlaWdodCgpLHBvc29wdC5taW5oZWlnaHQpLzIrcG9zb3B0Lm9mZnNldFsxXSk7XHJcblx0XHRcdGNzc29wdC50b3AgPSAnNTAlJztcclxuXHRcdFx0Y3Nzb3B0LmxlZnQgPSAnNTAlJztcclxuXHRcdFx0YnJlYWs7XHJcblx0XHRjYXNlICdmdWxsJzogLy/mu6HlsY/lrprkvY3vvIzljaDmu6HmlbTkuKrlrprkvY3lrrnlmajjgILmnKzmnaXkuI3orr7nva53aWR0aOWSjGhlaWdodO+8jOiuvue9ruS6hnJpZ2h05ZKMYm90dG9t44CC5L2G5piv5YG25Y+RbWFyZ2lu5LiN6LW35L2c55So77yM5q2k5pe26K+75Y+W55qE5YWD57Sg5bC65a+45Li6MC5cclxuXHRcdFx0Y3Nzb3B0LndpZHRoID0gJzEwMCUnO1xyXG5cdFx0XHRjc3NvcHQuaGVpZ2h0ID0gJzEwMCUnO1xyXG5cdFx0XHRjc3NvcHQudG9wID0gJzAnO1xyXG5cdFx0XHRjc3NvcHQubGVmdCA9ICcwJztcclxuXHRcdFx0YnJlYWs7XHJcblx0fVxyXG5cdGNzc29wdC5tYXJnaW5MZWZ0ID0gbWFyZ2luTGVmdCsncHgnO1xyXG5cdGNzc29wdC5tYXJnaW5Ub3AgPSBtYXJnaW5Ub3ArJ3B4JztcclxuXHRpZih0eXBlb2YgcG9zb3B0LmN1c3RvbXBvcyA9PSAnZnVuY3Rpb24nKXtcclxuXHRcdHBvc29wdC5jdXN0b21wb3MoY3Nzb3B0KTtcclxuXHR9ZWxzZXtcclxuXHRcdGxheWVyLmNzcyhjc3NvcHQpO1xyXG5cdH1cclxufVxyXG5cclxuY2xhc3MgUG9zaXRpb257XHJcblx0LyoqXHJcblx0ICog5a6a5L2N57G7XHJcbiAgICAgKiBAcGFyYW0ge0pTT059IGRvbXMg5a6a5L2NZG9t55u45YWz5L+h5oGvXHJcbiAgICAgKiBcdFx0e1xyXG4gICAgICogXHRcdFx0bGF5ZXI6IG51bGwgLy97SlF1ZXJ5RWxlbWVudHxTdHJpbmfoioLngrnpgInmi6nlmah9IOW+heWumuS9jeWxguiKgueCuVxyXG4gICAgICogICAgICB9XHJcbiAgICAgKiBAcGFyYW0ge0pTT059IGNvbmZpZyDlsYLlrprkvY3phY3nva7lj4LmlbDvvIzpu5jorqTkv6Hmga/lj4ror7TmmI7lpoLkuItwb3NvcHTku6PnoIHlpIRcclxuXHQgKi9cclxuXHRjb25zdHJ1Y3Rvcihkb21zLGNvbmZpZyl7XHJcblx0XHQvL+WPguaVsOajgOa1i+S4juiuvue9rlxyXG5cdFx0aWYoYXJndW1lbnRzLmxlbmd0aCA9PSAwKXtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCflv4XpobvkvKDlhaXnm7jlhbPlrprkvY3nmoRkb23lj4LmlbAnKTtcclxuXHRcdH1cclxuXHRcdHZhciBkb21vcHQgPSAkLmV4dGVuZCh7XHJcblx0XHRcdGxheWVyOiBudWxsLCAvL+W+heWumuS9jeWxguiKgueCuVxyXG5cdFx0XHRvZmZwYWdlOiBmYWxzZSAvL+ivtOaYjuebuOWvueS6juW9k+WJjemhtemdouWumuS9jVxyXG5cdFx0fSxkb21zIHx8IHt9KTtcclxuXHRcdGlmKGRvbW9wdC5sYXllciAmJiB0eXBlb2YgZG9tb3B0LmxheWVyID09ICdzdHJpbmcnKXtcclxuXHRcdFx0ZG9tb3B0LmxheWVyID0gJChkb21vcHQubGF5ZXIpO1xyXG5cdFx0fVxyXG5cdFx0aWYoIWRvbW9wdC5sYXllciB8fCBkb21vcHQubGF5ZXIubGVuZ3RoID09IDApe1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ+S8oOWFpeeahOWumuS9jeWxguiKgueCueaXoOaViCcpO1xyXG5cdFx0fVxyXG5cdFx0dmFyIHBvc29wdCA9ICQuZXh0ZW5kKHtcclxuXHRcdFx0Zml4ZWQ6IHRydWUsIC8v5piv5ZCm5bCG5by55bGC5aeL57uI5a6a5L2N5Zyo5Y+v6KeG56qX5Y+j5Yy65Z+f77yM6buY6K6k5Li6dHJ1ZVxyXG5cdFx0XHRtb2RlOiAnYycsIC8v5a6a5L2N5qih5byP77yM5p6a5Li+44CCYzrkuK3pl7RcclxuXHRcdFx0b2Zmc2V0OiBbMCwwXSwgLy/lrprkuYnlkI7lgY/np7vlsLrlr7ggW3jovbQseei9tF3jgILlr7nkuo5tb2Rl5pivZnVsbOeahOaooeW8j+aXoOaViFxyXG5cdFx0XHRzaXplY2hhbmdlOiBmYWxzZSwgLy/lvZNtb2Rl5pivY+aXtu+8jG9mZnNldFBhcmVudCByZXNpemXml7bvvIzlvoXlrprkvY3lsYLnmoTlpKflsI/mmK/lkKbkvJrmlLnlj5hcclxuXHRcdFx0bWlud2lkdGg6IDAsIC8v5a6a5L2N6K6h566X5pe277yM5b6F5a6a5L2N5bGCbGF5ZXLnmoTmnIDlsI/lrr3luqZcclxuICAgICAgICAgICAgbWluaGVpZ2h0OiAwLCAvL+WumuS9jeiuoeeul+aXtu+8jOW+heWumuS9jeWxgmxheWVy55qE5pyA5bCP6auY5bqmXHJcbiAgICAgICAgICAgIGN1c3RvbXBvczogbnVsbCAvL+eUqOaIt+iHquWumuS5ieWumuS9jeaWueazleOAguWmguaenOWjsOaYjuatpOaWueazle+8jOWImeS4jeS8muS9v+eUqOezu+e7n+m7mOiupOeahOaWueazleiuvue9rnBvc+eahOWumuS9jeWPguaVsO+8jOiAjOaYr+aKiuWumuS9jeWPguaVsHBvc+S8oOmAkue7meatpOaWueazlVxyXG5cdFx0fSxjb25maWcgfHwge30pO1xyXG4gICAgICAgIHRoaXMucG9zY2FsID0gJC5DYWxsYmFja3MoKTsgLy9zZXRwb3PlkI7nmoTlm57osINcclxuXHJcblx0XHR2YXIgdGhhdCA9IHRoaXM7XHJcblx0XHQvL+WIneatpeajgOa1i+WumuS9jeWPguiAg+WuueWZqFxyXG5cdFx0ZG9tb3B0Lm9mZmNvbiA9IGRvbW9wdC5sYXllci5vZmZzZXRQYXJlbnQoKTtcclxuXHRcdHZhciB0YWduYW1lID0gZG9tb3B0Lm9mZmNvbi5nZXQoMCkudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xyXG5cdFx0dmFyIGxpc3RlbmNhbGwgPSB7XHJcbiAgICAgICAgICAgIGNhbGw6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnNldHBvcygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgaXNsaXNzY3JvbGwgPSBmYWxzZTsgLy/mmK/lkKbnm5HlkKxzY3JvbGzkuovku7ZcclxuICAgICAgICB2YXIgaXNsaXNyZXNpemUgPSBmYWxzZTsgLy/mmK/lkKbnm5HlkKxyZXNpemXkuovku7ZcclxuXHRcdGlmKHRhZ25hbWUgPT0gJ2JvZHknIHx8IHRhZ25hbWUgPT0gJ2h0bWwnKXsgLy/or7TmmI7nm7jlr7nkuo7pobXpnaLlrprkvY1cclxuXHRcdCAgICBkb21vcHQub2ZmY29uID0gJCgnYm9keScpO1xyXG5cdFx0XHRkb21vcHQub2ZmcGFnZSA9IHRydWU7XHJcblx0XHR9XHJcblx0XHRpZihkb21vcHQub2ZmcGFnZSAmJiBwb3NvcHQuZml4ZWQpeyAvL+WmguaenOWumuS9jeWuueWZqOaYr+W9k+WJjemhtemdouOAgeWbuuWumuWumuS9jeOAgeWPr+S9v+eUqGZpeGVk5a6a5L2N44CC5YiZ55SoZml4ZWTlrprkvY1cclxuXHRcdFx0ZG9tb3B0LnBvc2l0aW9uID0gJ2ZpeGVkJztcclxuXHRcdH1cclxuXHRcdGVsc2V7XHJcblx0XHRcdGRvbW9wdC5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XHJcblx0XHRcdGlmKHBvc29wdC5maXhlZCkgeyAvL+WmguaenOWbuuWumuWumuS9je+8jOWImeebkeWQrHNjcm9sbOS6i+S7tlxyXG5cdFx0XHQgICAgaXNsaXNzY3JvbGwgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgaWYoZG9tb3B0Lm9mZnBhZ2Upe1xyXG4gICAgICAgICAgICAgICAgICAgIFdpbnNjcm9sbC5saXN0ZW4obGlzdGVuY2FsbCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzY3JvbGwgPSBuZXcgU2Nyb2xsKGRvbW9wdC5vZmZjb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbC5saXN0ZW4obGlzdGVuY2FsbCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdC8v6K+05piObW9kZeaYr2Pml7bvvIxvZmZzZXRQYXJlbnQgcmVzaXpl5pe277yM5b6F5a6a5L2N5bGC55qE5aSn5bCP5Lya5pS55Y+Y77yM5YiZ55uR5ZCscmVzaXpl5LqL5Lu2XHJcbiAgICAgICAgaWYocG9zb3B0Lm1vZGUgPT0gJ2MnICYmIHBvc29wdC5zaXplY2hhbmdlKXtcclxuICAgICAgICAgICAgaXNsaXNyZXNpemUgPSB0cnVlO1xyXG4gICAgICAgICAgICBpZihkb21vcHQub2ZmcGFnZSl7XHJcbiAgICAgICAgICAgICAgICBXaW5yZXNpemUubGlzdGVuKGxpc3RlbmNhbGwpO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHZhciByZXNpemUgPSBuZXcgUmVzaXplKGRvbW9wdC5vZmZjb24pO1xyXG4gICAgICAgICAgICAgICAgcmVzaXplLmxpc3RlbihsaXN0ZW5jYWxsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHRcdHRoaXMuZG9tb3B0ID0gZG9tb3B0OyAvL2RvbeWPguaVsFxyXG5cdFx0dGhpcy5wb3NvcHQgPSBwb3NvcHQ7IC8v5a6a5L2N5Y+C5pWwXHJcblx0XHR0aGlzLmRlc3Ryb3kgPSBmdW5jdGlvbigpeyAvL+e7hOS7tumUgOavgeaWueazlVxyXG5cdFx0XHR0aGlzLmRvbW9wdCA9IG51bGw7XHJcblx0XHRcdHRoaXMucG9zb3B0ID0gbnVsbDtcclxuXHRcdFx0aWYoaXNsaXNzY3JvbGwpe1xyXG5cdFx0XHRcdGlmKGRvbW9wdC5vZmZwYWdlKXtcclxuXHRcdFx0XHRcdFdpbnNjcm9sbC51bmxpc3RlbihsaXN0ZW5jYWxsKTtcclxuXHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdHNjcm9sbC51bmxpc3RlbihsaXN0ZW5jYWxsKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0aWYoaXNsaXNyZXNpemUpe1xyXG5cdFx0XHQgICAgaWYoZG9tb3B0Lm9mZnBhZ2Upe1xyXG4gICAgICAgICAgICAgICAgICAgIFdpbnJlc2l6ZS51bmxpc3RlbihsaXN0ZW5jYWxsKTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc2l6ZS51bmxpc3RlbihsaXN0ZW5jYWxsKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHR9XHJcblx0LyoqXHJcblx0ICog6L+b6KGM5a6a5L2NXHJcblx0ICogQHJldHVybiB7Qm9vbGVhbn0g5piv5ZCm5a6a5L2N5oiQ5YqfXHJcblx0ICovXHJcblx0c2V0cG9zKCl7XHJcblx0XHRpZih0aGlzLmRvbW9wdC5sYXllci5jc3MoJ2Rpc3BsYXknKSA9PSAnbm9uZScgfHwgdGhpcy5kb21vcHQub2ZmY29uLmNzcygnZGlzcGxheScpID09ICdub25lJyl7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdGVsc2V7XHJcblx0XHRcdHNldHBvcyh0aGlzLmRvbW9wdCx0aGlzLnBvc29wdCk7XHJcbiAgICAgICAgICAgIHRoaXMucG9zY2FsLmZpcmUoKTtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBvc2l0aW9uO1xyXG4iLCIvKipcclxuICogYWxlcnTlvLnlsYLmqKHmnb/vvIzlv4XpobvlhbfmnInmjIflrprnmoRub2Rl5bGe5oCnXHJcbiAqL1xyXG5leHBvcnRzLmFsZXJ0ID0gW1xyXG4gICAgJzxkaXY+5qCH6aKYPC9kaXY+JyxcclxuXHQnPGRpdiBub2RlPVwiY29udGVudFwiPuWGheWuueWMujwvZGl2PicsXHJcblx0JzxkaXY+PGEgaHJlZj1cImphdmFzY3JpcHQ6O1wiIGNsYXNzPVwianMtb2tcIj7noa7lrpo8L2E+PC9kaXY+J1xyXG5dLmpvaW4oJycpO1xyXG4vKipcclxuICogY29uZmlybeW8ueWxguaooeadv++8jOW/hemhu+WFt+acieaMh+WumueahG5vZGXlsZ7mgKdcclxuICovXHJcbmV4cG9ydHMuY29uZmlybSA9IFtcclxuICAgICc8ZGl2Puagh+mimDwvZGl2PicsXHJcblx0JzxkaXYgbm9kZT1cImNvbnRlbnRcIj7lhoXlrrnljLo8L2Rpdj4nLFxyXG5cdCc8ZGl2PjxhIGhyZWY9XCJqYXZhc2NyaXB0OjtcIiBjbGFzcz1cImpzLW9rXCI+56Gu5a6aPC9hPjxhIGhyZWY9XCJqYXZhc2NyaXB0OjtcIiBjbGFzcz1cImpzLWNhbmNlbFwiPuWPlua2iDwvYT48L2Rpdj4nXHJcbl0uam9pbignJylcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcgY3Nz5pSv5oyB5oOF5Ya15Yik5pat44CC5Li76KaB55So5LqO5rWP6KeI5Zmo5YW85a65XHJcbiAqIEB2ZXJzaW9uIDEuMCB8IDIwMTUtMDgtMzEg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQHJldHVyblxyXG4gKiBAZXhhbXBsZVxyXG4gKiBcdCBjb25zdCBDc3NzdXBvcnQgPSByZXF1aXJlKCdsaWJ1dGlsLWNzc3N1cG9ydCcpO1xyXG4gKiBcdCBDc3NzdXBvcnQuZml4ZWQ7XHJcbiAqICovXHJcbnZhciBfZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbnZhciByZXN1bHQgPSB7XHJcblx0Ly/mmK/lkKbmlK/mjIFwb3NpdGlvbjpmaXhlZOWumuS9jVxyXG5cdGZpeGVkOiAhKCd1bmRlZmluZWQnID09IHR5cGVvZihkb2N1bWVudC5ib2R5LnN0eWxlLm1heEhlaWdodCkgfHwgKGRvY3VtZW50LmNvbXBhdE1vZGUgIT09IFwiQ1NTMUNvbXBhdFwiICYmIC9tc2llLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKSkpKSxcclxuXHQvL+aYr+WQpuaUr+aMgXRyYW5zaXRpb25cclxuXHR0cmFuc2l0aW9uOiAhKF9kaXYuc3R5bGUudHJhbnNpdGlvbiA9PSB1bmRlZmluZWQpXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHJlc3VsdDtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcg5a+55LqO6auY6aKR6Kem5Y+R55qE5LqL5Lu26L+b6KGM5bu26L+f5aSE55CG57G744CC5bqU55So5Zy65pmv77yac2Nyb2xs5ZKMcmVzaXplXHJcbiAqIEB2ZXJzaW9uIDEuMC4wIHwgMjAxNS0wOC0yNyDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAcmV0dXJuIOWkhOeQhuexu1xyXG4gKiBAZXhhbXBsZVxyXG4gKiAqL1xyXG5cclxuIGNvbnN0IFB1Ymxpc2hlclMgPSByZXF1aXJlKCcuL3B1Ymxpc2hlclMuanMnKTtcclxuXHJcbiBjbGFzcyBEZWxheWV2dCBleHRlbmRzIFB1Ymxpc2hlclN7XHJcblx0IC8qKlxyXG4gXHQgKiDlr7nkuo7pq5jpopHop6blj5HnmoTkuovku7bov5vooYzlu7bov5/lpITnkIbjgILlupTnlKjlnLrmma/vvJpzY3JvbGzlkoxyZXNpemVcclxuIFx0ICogQHBhcmFtIHtKU09OfSBjb25maWcg6YWN572uXHJcbiBcdCAqL1xyXG5cdCBjb25zdHJ1Y3Rvcihjb25maWcpe1xyXG5cdCAgICBzdXBlcigpO1xyXG4gXHRcdHRoaXMudGltZXIgPSBudWxsO1xyXG4gXHRcdCQuZXh0ZW5kKHRoaXMse1xyXG4gXHRcdFx0ZGVsYXl0aW1lOiAyMDAgLy/kuovku7bmo4DmtYvlu7bov5/ml7bpl7TvvIzmr6vnp5JcclxuIFx0XHR9LGNvbmZpZyB8fCB7fSk7XHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOW8gOWni+ajgOa1i1xyXG4gXHQgKi9cclxuXHQgc3RhcnQoKXtcclxuXHRcdCBpZih0aGlzLnRpbWVyKXtcclxuICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVyKTtcclxuICAgICAgICAgfVxyXG4gICAgICAgICB0aGlzLnRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgIFx0dGhpcy5kZWxpdmVyKCk7XHJcbiAgICAgICAgIH0sdGhpcy5kZWxheXRpbWUpO1xyXG5cdCB9XHJcbiB9XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IERlbGF5ZXZ0O1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyDmoLnmja7orr7lpIfnu5nlh7rnm7jlhbPkuJrliqHkuovku7bnmoTkuovku7blkI3np7BcclxuICogQHZlcnNpb24gMS4wLjAgfCAyMDE1LTA5LTE0IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEBleGFtcGxlXHJcbiAqICovXHJcbnZhciByZXN1bHQgPSB7XHJcblx0Ly/mtY/op4jlmajnqpflj6NyZXNpemXkuovku7ZcclxuXHR3aW5yZXNpemU6IChmdW5jdGlvbigpe1xyXG5cdCAgICByZXR1cm4gJ29ub3JpZW50YXRpb25jaGFuZ2UnIGluIHdpbmRvdz8gJ29yaWVudGF0aW9uY2hhbmdlJzogJ3Jlc2l6ZSc7XHJcblx0fSkoKSxcclxuXHQvL2lucHV05oiWdGV4dGFyZWHovpPlhaXmoYblgLzmlLnlj5jnmoTnm5HlkKzkuovku7ZcclxuXHRpbnB1dDogKGZ1bmN0aW9uKCl7XHJcblx0ICAgIGlmKC9NU0lFIDkuMC8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSl7IC8vSWU56YKj5Liq5Z2R54i555qE77yM5pys5p2laW5wdXTlkoxwcm9wZXJ0eWNoYW5nZemDveaUr+aMge+8jOS9huaYr+WIoOmZpOmUruaXoOazleinpuWPkei/meS4pOS4quS6i+S7tu+8jOaJgOS7peW+l+a3u+WKoGtleXVwXHJcblx0ICAgICAgICByZXR1cm4gJ2lucHV0IGtleXVwJztcclxuXHQgICAgfVxyXG5cdCAgICB2YXIgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcblx0ICAgIGlmKCdvbmlucHV0JyBpbiBub2RlKXtcclxuXHQgICAgICAgIHJldHVybiAnaW5wdXQnO1xyXG5cdCAgICB9ZWxzZSBpZignb25wcm9wZXJ0eWNoYW5nZScgaW4gbm9kZSl7XHJcblx0ICAgICAgICByZXR1cm4gJ3Byb3BlcnR5Y2hhbmdlJztcclxuXHQgICAgfWVsc2Uge1xyXG5cdCAgICAgICAgcmV0dXJuICdrZXl1cCc7XHJcblx0ICAgIH1cclxuXHR9KSgpXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHJlc3VsdDtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcg6K6i6ZiF6ICF5qih5byP4oCU4oCU5Y+R5biD6ICF57G74oCU4oCU57K+566A54mIXHJcbiAqIOeyvueugOeJiO+8muiuoumYheiAheS4jemZkOWumuW/hemhu+aYr+iuoumYheiAheexu1N1YnNjcmliZXLnmoTlr7nosaFcclxuICogQHZlcnNpb24gMS4wIHwgMjAxNS0wOC0zMSDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAcmV0dXJuIOWPkeW4g+iAheexu1xyXG4gKiBAZXhhbXBsZVxyXG4gKiAqL1xyXG4gY29uc3QgVG9vbCA9IHJlcXVpcmUoJy4vdG9vbC5qcycpLFxyXG5cdCAgIFJ3Y29udHJvbGxlciA9IHJlcXVpcmUoJy4vcndjb250cm9sbGVyLmpzJyk7XHJcblxyXG5jbGFzcyBQdWJsaXNoZXJTe1xyXG5cdGNvbnN0cnVjdG9yKCl7XHJcblx0XHR0aGlzLnN1YnNjcmliZXJzID0gW107IC8v6K6w5b2V6K6i6ZiF6ICF5a+56LGhXHJcblx0XHR0aGlzLnJ3Y29udHJvbGxkZXIgPSBuZXcgUndjb250cm9sbGVyKCk7XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIOWPguaVsOacieaViOaAp+mqjOivgVxyXG5cdCAqL1xyXG5cdGFyZ3NWYWxpZGF0ZShkYXRhKXtcclxuXHRcdGlmKFRvb2wuaXNPYmplY3QoZGF0YSkgJiYgVG9vbC5pc0Z1bmN0aW9uKGRhdGEuY2FsbCkpe1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblx0LyoqXHJcblx0ICog5L+h5oGv5YiG5Y+R77yM6YCa55+l5omA5pyJ6K6i6ZiF6ICFXHJcblx0ICogZmlsdGVy5omn6KGM6L+U5ZuedHJ1Ze+8jOWImeaJp+ihjGNhbGxcclxuXHQgKi9cclxuXHRkZWxpdmVyKCl7XHJcblx0XHR0aGlzLnJ3Y29udHJvbGxkZXIucmVhZChmdW5jdGlvbihkYXRhKXtcclxuXHRcdFx0JC5lYWNoKHRoaXMuc3Vic2NyaWJlcnMsZnVuY3Rpb24oaW5kZXgsaXRlbSl7XHJcblx0XHRcdFx0aWYoaXRlbS5maWx0ZXIoKSA9PSB0cnVlKXtcclxuXHRcdCAgICAgICAgXHRpdGVtLmNhbGwuYXBwbHkod2luZG93LGRhdGEuYXJncyk7XHJcblx0XHQgICAgICBcdH1cclxuXHRcdFx0fSk7XHJcblx0XHR9LmJpbmQodGhpcyx7YXJnczogYXJndW1lbnRzfSkpO1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiDorqLpmIVcclxuIFx0ICogQHBhcmFtIHtKU09OfSAqc3Vic2NyaWJlciDorqLpmIXogIXjgILmoLzlvI/lkIxzdWJzY3JpYmVyc+mHjOeahOWNleeLrOS4gOmhuVxyXG4gXHQgKiB7XHJcbiBcdCAqIFx0XHQqY2FsbDogZnVuY3Rpb24oKXt9IC8v5L+h5oGv5YiG5Y+R55qE5Zue6LCD5Ye95pWwXHJcbiBcdCAqICAgICAgZmlsdGVyOiBmdW5jdGlvbigpe3JldHVybiB0cnVlO30gLy/ov4fmu6TmnaHku7ZcclxuIFx0ICogfVxyXG5cdCAqL1xyXG5cdHN1YnNjcmliZShzdWJzY3JpYmVyKXtcclxuXHRcdGlmKHRoaXMuYXJnc1ZhbGlkYXRlKHN1YnNjcmliZXIpKXtcclxuXHRcdFx0aWYoIVRvb2wuaXNGdW5jdGlvbihzdWJzY3JpYmVyLmZpbHRlcikpe1xyXG5cdFx0ICAgICAgICBzdWJzY3JpYmVyLmZpbHRlciA9IGZ1bmN0aW9uKCl7XHJcblx0XHQgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHRcdCAgICAgICAgfTtcclxuXHRcdCAgICB9XHJcblx0XHRcdGlmKCQuaW5BcnJheShzdWJzY3JpYmVyLHRoaXMuc3Vic2NyaWJlcnMpIDwgMCl7XHJcblx0XHRcdFx0dGhpcy5yd2NvbnRyb2xsZGVyLndyaXRlKGZ1bmN0aW9uKGN1cnN1Yil7XHJcblx0XHRcdFx0XHR0aGlzLnN1YnNjcmliZXJzLnB1c2goY3Vyc3ViKTtcclxuXHRcdFx0XHR9LmJpbmQodGhpcyxzdWJzY3JpYmVyKSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0LyoqXHJcblx0ICog5Y+W5raI6K6i6ZiFXHJcbiBcdCAqIEBwYXJhbSB7SlNPTn0gc3Vic2NyaWJlciDorqLpmIXogIVcclxuXHQgKi9cclxuXHR1bnN1YnNjcmliZShzdWJzY3JpYmVyKXtcclxuXHRcdGlmKHRoaXMuYXJnc1ZhbGlkYXRlKHN1YnNjcmliZXIpKXtcclxuXHRcdFx0dGhpcy5yd2NvbnRyb2xsZGVyLndyaXRlKGZ1bmN0aW9uKGN1cnN1Yil7XHJcblx0XHRcdFx0JC5lYWNoKHRoaXMuc3Vic2NyaWJlcnMsKGluZGV4LGl0ZW0pID0+IHtcclxuXHRcdFx0XHRcdGlmKGl0ZW0gPT0gY3Vyc3ViKXtcclxuXHRcdFx0XHRcdCAgICB0aGlzLnN1YnNjcmliZXJzLnNwbGljZShpbmRleCwxKTtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9LmJpbmQodGhpcyxzdWJzY3JpYmVyKSk7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFB1Ymxpc2hlclM7XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3XHJcbiAqICAg57uZ5oyH5a6a5YWD57Sg5Yib5bu6cmVzaXpl5LqL5Lu255uR5ZCs57G7XHJcbiAqIEBhdXRob3IgbWluZ3J1aXwgbWluZ3J1aUBzdGFmZi5zaW5hLmNvbS5jblxyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE1LTA4LTI3XHJcbiAqIEByZXR1cm4gcmVzaXpl57G7XHJcbiAqIEBleGFtcGxlXHJcbiAqICBcdGNvbnN0IFJlc2l6ZSA9IHJlcXVpcmUoJ2xpYnV0aWwtcmVzaXplJyk7XHJcbiAqIFx0XHR2YXIgcmVzaXplID0gbmV3IFJlc2l6ZSgkKHdpbmRvdykpO1xyXG4gKiBcdFx0cmVzaXplLmxpc3Rlbih7Y2FsbDpmdW5jdGlvbigpe2NvbnNvbGUubG9nKCfnqpflj6NyZXNpemUnKTt9fSk7XHJcbiAqL1xyXG5cclxuY29uc3QgRGVsYXlldnQgPSByZXF1aXJlKCcuL2RlbGF5ZXZ0LmpzJyk7XHJcblxyXG5jbGFzcyBSZXNpemV7XHJcblx0LyoqXHJcblx0ICogQHBhcmFtIHtFbGVtZW50fSAqbm9kZSDlhYPntKDoioLngrlcclxuXHQgKiBAcGFyYW0ge0pTT059IGNvbmZpZyDlu7bov5/phY3nva7jgILlkIxldnQvZGVsYXlldnTnsbvnmoTliJ3lp4vljJblj4LmlbBcclxuXHQgKi9cclxuXHRjb25zdHJ1Y3Rvcihub2RlLGNvbmZpZyl7XHJcblx0XHRpZihub2RlLmxlbmd0aCA9PSAwKXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0dmFyIG9wdCA9ICQuZXh0ZW5kKHtcclxuXHRcdCAgICBldnRuYW1lOiAncmVzaXplJ1xyXG5cdFx0fSxjb25maWcpO1xyXG5cdFx0dGhpcy5kZWxheSA9IG5ldyBEZWxheWV2dChvcHQpO1xyXG5cdFx0bm9kZS5vbihvcHQuZXZ0bmFtZSwoKSA9PiB7XHJcblx0XHRcdHRoaXMuZGVsYXkuc3RhcnQoKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiDmt7vliqBzY3JvbGzkuovku7bnm5HlkKxcclxuICAgICAqIEBwYXJhbSB7SlNPTn0gb3B0XHJcbiAgICAgKiB7XHJcbiAgICAgKiAgIGNhbGw6IGZ1bmN0aW9uLy/kuovku7blj5HnlJ/ml7bop6blj5HnmoTlm57osINcclxuXHQgKiAgIGZpbHRlcjogZnVuY3Rpb24gLy/ov4fmu6TmnaHku7bjgIJmaWx0ZXLov5Tlm57kuLp0cnVl5YiZ5omN6Kem5Y+RY2FsbOOAguS4jeWhq+atpOmhueWImem7mOiupOS4jei/h+a7pFxyXG5cdCAqIH1cclxuICAgICAqL1xyXG5cdGxpc3RlbihvcHQpe1xyXG5cdFx0dGhpcy5kZWxheS5zdWJzY3JpYmUob3B0KTtcclxuXHR9XHJcblx0LyoqXHJcblx0ICog56e76Zmk55uR5ZCsXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0IOWSjOiwg+eUqGxpc3RlbuaXtuS4gOagt+eahOWPguaVsOW8leeUqFxyXG5cdCAqL1xyXG5cdHVubGlzdGVuKG9wdCl7XHJcblx0XHR0aGlzLmRlbGF5LnVuc3Vic2NyaWJlKG9wdCk7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJlc2l6ZTtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcg6K+75YaZ5o6n5Yi25Zmo4oCU4oCU5a+55LqO6K+75YaZ5byC5q2l5pON5L2c6L+b6KGM5o6n5Yi2XHJcbiAqIEB2ZXJzaW9uIDEuMCB8IDIwMTUtMDktMDcg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQHJldHVybiDor7vlhpnmjqfliLblmajnsbtcclxuICogQGV4YW1wbGVcclxuICogKi9cclxuIGNvbnN0IFRvb2wgPSByZXF1aXJlKCcuL3Rvb2wuanMnKTtcclxuXHJcbiBjbGFzcyBSd2NvbnRyb2xsZXIge1xyXG5cdCBjb25zdHJ1Y3Rvcigpe1xyXG5cdFx0IHRoaXMucmVhZGxvY2sgPSBmYWxzZTsgLy/or7vplIFcclxuIFx0XHR0aGlzLndyaXRlbG9jayA9IGZhbHNlOyAvL+WGmemUgVxyXG4gXHRcdHRoaXMucXVldWUgPSBbXTsgLy/or7vlhpnmk43kvZznvJPlrZjpmJ/liJdcclxuXHQgfVxyXG5cdCAvKipcclxuIFx0ICog6I635Y+W5b2T5YmN5piv5ZCm5Y+v5Lul5omn6KGM6K+75pON5L2cXHJcbiBcdCAqL1xyXG5cdCByZWFkZW5hYmxlKCl7XHJcblx0XHRpZih0aGlzLndyaXRlbG9jayl7XHJcbiBcdFx0XHRyZXR1cm4gZmFsc2U7XHJcbiBcdFx0fVxyXG4gXHRcdHJldHVybiB0cnVlO1xyXG5cdCB9XHJcblx0IC8qKlxyXG4gXHQgKiDojrflj5blvZPliY3mmK/lkKblj6/ku6XmiafooYzlhpnmk43kvZxcclxuIFx0ICovXHJcblx0IHdyaXRlZW5hYmxlKCl7XHJcblx0XHRpZih0aGlzLndyaXRlbG9jayB8fCB0aGlzLnJlYWRsb2NrKXtcclxuIFx0XHRcdHJldHVybiBmYWxzZTtcclxuIFx0XHR9XHJcbiBcdFx0cmV0dXJuIHRydWU7XHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOaJp+ihjOivu+WGmeaTjeS9nOmYn+WIl1xyXG4gXHQgKi9cclxuIFx0IGV4ZWNxdWV1ZSgpe1xyXG5cdFx0IHdoaWxlKHRoaXMucXVldWUubGVuZ3RoID4gMCl7XHJcbiBcdFx0XHR2YXIgb2JqID0gdGhpcy5xdWV1ZS5zaGlmdCgpO1xyXG4gXHRcdFx0aWYob2JqLnR5cGUgPT0gJ3JlYWQnKXtcclxuIFx0XHRcdFx0dGhpcy5fZXhlY3JlYWQob2JqLmZ1bik7XHJcbiBcdFx0XHR9ZWxzZSBpZihvYmoudHlwZSA9PSAnd3JpdGUnKXtcclxuIFx0XHRcdFx0dGhpcy5fZXhlY3dyaXRlKG9iai5mdW4pO1xyXG4gXHRcdFx0fVxyXG4gXHRcdH1cclxuXHQgfVxyXG5cdCAvKipcclxuIFx0ICog56eB5pyJ4oCU4oCU5omn6KGM6K+75pON5L2cXHJcbiBcdCAqL1xyXG5cdCBfZXhlY3JlYWQoZnVuKXtcclxuXHRcdHRoaXMucmVhZGxvY2sgPSB0cnVlO1xyXG4gXHRcdGZ1bigpO1xyXG4gXHRcdHRoaXMucmVhZGxvY2sgPSBmYWxzZTtcclxuXHQgfVxyXG5cdCAvKipcclxuIFx0ICog56eB5pyJ4oCU4oCU5omn6KGM5YaZ5pON5L2cXHJcbiBcdCAqL1xyXG5cdCBfZXhlY3dyaXRlKGZ1bil7XHJcblx0XHR0aGlzLndyaXRlbG9jayA9IHRydWU7XHJcbiBcdFx0ZnVuKCk7XHJcbiBcdFx0dGhpcy53cml0ZWxvY2sgPSBmYWxzZTtcclxuXHQgfVxyXG5cdCAvKipcclxuIFx0ICog5byA5aeL6K+7XHJcbiAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gKmZ1biDor7vmk43kvZzlm57osIPlh73mlbBcclxuIFx0ICovXHJcblx0IHJlYWQoZnVuKXtcclxuXHRcdCBpZihUb29sLmlzRnVuY3Rpb24oZnVuKSl7XHJcbiBcdFx0XHRpZih0aGlzLnJlYWRlbmFibGUoKSl7XHJcbiBcdFx0XHRcdHRoaXMuX2V4ZWNyZWFkKGZ1bik7XHJcbiBcdFx0XHRcdHRoaXMuZXhlY3F1ZXVlKCk7XHJcbiBcdFx0XHR9ZWxzZXtcclxuIFx0XHRcdFx0dGhpcy5xdWV1ZS5wdXNoKHtcclxuIFx0XHRcdFx0XHR0eXBlOiAncmVhZCcsXHJcbiBcdFx0XHRcdFx0ZnVuOiBmdW5cclxuIFx0XHRcdFx0fSk7XHJcbiBcdFx0XHR9XHJcbiBcdFx0fVxyXG5cdCB9XHJcblx0IC8qKlxyXG4gXHQgKiDlvIDlp4vlhplcclxuICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSAqZnVuIOWGmeaTjeS9nOWbnuiwg+WHveaVsFxyXG4gXHQgKi9cclxuXHQgd3JpdGUoZnVuKXtcclxuXHRcdCBpZihUb29sLmlzRnVuY3Rpb24oZnVuKSl7XHJcbiBcdFx0XHRpZih0aGlzLndyaXRlZW5hYmxlKCkpe1xyXG4gXHRcdFx0XHR0aGlzLl9leGVjd3JpdGUoZnVuKTtcclxuIFx0XHRcdFx0dGhpcy5leGVjcXVldWUoKTtcclxuIFx0XHRcdH1lbHNle1xyXG4gXHRcdFx0XHR0aGlzLnF1ZXVlLnB1c2goe1xyXG4gXHRcdFx0XHRcdHR5cGU6ICd3cml0ZScsXHJcbiBcdFx0XHRcdFx0ZnVuOiBmdW5cclxuIFx0XHRcdFx0fSk7XHJcbiBcdFx0XHR9XHJcbiBcdFx0fVxyXG5cdCB9XHJcbiB9XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJ3Y29udHJvbGxlcjtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXdcclxuICogICDnu5nmjIflrprlhYPntKDliJvlu7pzY3JvbGzkuovku7bnm5HlkKznsbtcclxuICogQGF1dGhvciBtaW5ncnVpfCBtaW5ncnVpQHN0YWZmLnNpbmEuY29tLmNuXHJcbiAqIEB2ZXJzaW9uIDEuMCB8IDIwMTUtMDgtMjdcclxuICogQHJldHVybiBzY3JvbGznsbtcclxuICogQGV4YW1wbGVcclxuICogXHRcdGNvbnN0IFNjcm9sbCA9IHJlcXVpcmUoJ2xpYnV0aWwtc2Nyb2xsJyk7XHJcbiAqXHJcbiAqIFx0XHR2YXIgc2Nyb2xsID0gbmV3IFNjcm9sbCgkKHdpbmRvdykpO1xyXG4gKiBcdFx0c2Nyb2xsLmxpc3Rlbih7Y2FsbDpmdW5jdGlvbigpe2NvbnNvbGUubG9nKCfnqpflj6NzY3JvbGwnKTt9fSk7XHJcbiAqXHJcbiAqL1xyXG5cclxuY29uc3QgRGVsYXlldnQgPSByZXF1aXJlKCcuL2RlbGF5ZXZ0LmpzJyk7XHJcblxyXG5jbGFzcyBTY3JvbGx7XHJcblx0LyoqXHJcblx0ICogQHBhcmFtIHtFbGVtZW50fSAqbm9kZSDlhYPntKDoioLngrlcclxuXHQgKiBAcGFyYW0ge0pTT059IGNvbmZpZyDlu7bov5/phY3nva7jgILlkIxsaWJldnQvZGVsYXlldnTnsbvnmoTliJ3lp4vljJblj4LmlbBcclxuXHQgKi9cclxuXHRjb25zdHJ1Y3Rvcihub2RlLGNvbmZpZyl7XHJcblx0XHRpZihub2RlLmxlbmd0aCA9PSAwKXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5kZWxheSA9IG5ldyBEZWxheWV2dChjb25maWcpO1xyXG5cdFx0bm9kZS5vbignc2Nyb2xsJywoKSA9PiB7XHJcblx0XHRcdHRoaXMuZGVsYXkuc3RhcnQoKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiDmt7vliqBzY3JvbGzkuovku7bnm5HlkKxcclxuICAgICAqIEBwYXJhbSB7SlNPTn0gb3B0XHJcbiAgICAgKiB7XHJcbiAgICAgKiAgIGNhbGw6IGZ1bmN0aW9uLy/kuovku7blj5HnlJ/ml7bop6blj5HnmoTlm57osINcclxuXHQgKiAgIGZpbHRlcjogZnVuY3Rpb24gLy/ov4fmu6TmnaHku7bjgIJmaWx0ZXLov5Tlm57kuLp0cnVl5YiZ5omN6Kem5Y+RY2FsbOOAguS4jeWhq+atpOmhueWImem7mOiupOS4jei/h+a7pFxyXG5cdCAqIH1cclxuICAgICAqL1xyXG4gICAgbGlzdGVuKG9wdCl7XHJcblx0XHR0aGlzLmRlbGF5LnN1YnNjcmliZShvcHQpO1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiDnp7vpmaTnm5HlkKxcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHQg5ZKM6LCD55SobGlzdGVu5pe25LiA5qC355qE5Y+C5pWw5byV55SoXHJcblx0ICovXHJcblx0dW5saXN0ZW4ob3B0KXtcclxuXHRcdHRoaXMuZGVsYXkudW5zdWJzY3JpYmUob3B0KTtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2Nyb2xsO1xyXG4iLCIvKipcclxuICog5bi455So5bCP5bel5YW3XHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogdmFyIFRvb2wgPSByZXF1aXJlKCdsaWJ1dGlsLXRvb2wnKTtcclxuICovXHJcbmNvbnN0IFVybCA9IHJlcXVpcmUoJ3VybCcpO1xyXG5cclxuLyoqXHJcbiAqIGRhdGHmmK/lkKbmmK/ml6DmlYjlrZfmrrXjgILljbPmmK9udWxsfHVuZGVmaW5lZHwnJ1xyXG4qIEBwYXJhbSB7T2JqZWN0fSBkYXRhXHJcbiAqL1xyXG5leHBvcnRzLmlzSW52YWxpZCA9IGZ1bmN0aW9uKGRhdGEpe1xyXG5cdGlmKGRhdGEgPT0gbnVsbCB8fCBkYXRhID09ICcnKXtcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxuXHRyZXR1cm4gZmFsc2U7XHJcbn0sXHJcbi8qKlxyXG4gKiDmmK/lkKbmmK9PYmplY3Tlr7nosaHnmoTlrp7kvovvvIzpgJrluLjnlKjmnaXmo4DmtYtkYXRh5piv5ZCm5piv5LiA5Liq57qv55qESlNPTuWtl+auteaIlm5ldyBPYmplY3QoKVxyXG4qIEBwYXJhbSB7T2JqZWN0fSBkYXRhXHJcbiAqL1xyXG5leHBvcnRzLmlzT2JqZWN0ID0gZnVuY3Rpb24oZGF0YSl7XHJcblx0cmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChkYXRhKSA9PSAnW29iamVjdCBPYmplY3RdJyAmJiBkYXRhLmNvbnN0cnVjdG9yID09IE9iamVjdDtcclxufSxcclxuLyoqXHJcbiAqIOaVsOaNruexu+Wei+aYr+WQpuaYr29iamVjdOOAguS4jeS7heS7hemZkOS6juaYr+e6r+eahE9iamVjdOWunuS+i+WMlueahOWvueixoVxyXG4gKi9cclxuZXhwb3J0cy5pc09iamVjdFR5cGUgPSBmdW5jdGlvbihkYXRhKXtcclxuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZGF0YSkgPT0gJ1tvYmplY3QgT2JqZWN0XSc7XHJcbn0sXHJcbi8qKlxyXG4gKiDmmK/lkKbmmK9mdW5jdGlvblxyXG4qIEBwYXJhbSB7T2JqZWN0fSBkYXRhXHJcbiAqL1xyXG5leHBvcnRzLmlzRnVuY3Rpb24gPSBmdW5jdGlvbihkYXRhKXtcclxuXHRyZXR1cm4gdHlwZW9mIGRhdGEgPT0gJ2Z1bmN0aW9uJztcclxufSxcclxuLyoqXHJcbiAqIOaYr+WQpuaYr0FycmF5XHJcbiogQHBhcmFtIHtPYmplY3R9IGRhdGFcclxuICovXHJcbmV4cG9ydHMuaXNBcnJheSA9IGZ1bmN0aW9uKGRhdGEpe1xyXG5cdHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZGF0YSkgPT0gJ1tvYmplY3QgQXJyYXldJztcclxufSxcclxuLyoqXHJcbiAqIOaYr+WQpuaYr2Jvb2xlYW5cclxuKiBAcGFyYW0ge09iamVjdH0gZGF0YVxyXG4gKi9cclxuZXhwb3J0cy5pc0Jvb2xlYW4gPSBmdW5jdGlvbihkYXRhKXtcclxuXHRyZXR1cm4gdHlwZW9mIGRhdGEgPT0gJ2Jvb2xlYW4nO1xyXG59LFxyXG4vKipcclxuICog5piv5ZCm5pivU3RyaW5nXHJcbiogQHBhcmFtIHtPYmplY3R9IGRhdGFcclxuICovXHJcbmV4cG9ydHMuaXNTdHJpbmcgPSBmdW5jdGlvbihkYXRhKXtcclxuXHRyZXR1cm4gdHlwZW9mIGRhdGEgPT0gJ3N0cmluZyc7XHJcbn0sXHJcbi8qKlxyXG4gKiDmmK/lkKbmmK9OdW1iZXJcclxuKiBAcGFyYW0ge09iamVjdH0gZGF0YVxyXG4gKi9cclxuZXhwb3J0cy5pc051bWJlciA9IGZ1bmN0aW9uKGRhdGEpe1xyXG5cdHJldHVybiB0eXBlb2YgZGF0YSA9PSAnbnVtYmVyJztcclxufSxcclxuLyoqXHJcbiAqIOaYr+WQpuaYr+S4gOS4quacieaViOeahGpxdWVyeSBkb23lr7nosaFcclxuICogQHBhcmFtIHtPYmplY3R9IG5vZGVcclxuICovXHJcbmV4cG9ydHMuaXNWYWxpZEpxdWVyeURvbSA9IGZ1bmN0aW9uKG5vZGUpe1xyXG5cdHJldHVybiBub2RlICE9IG51bGwgJiYgdGhpcy5pc0Z1bmN0aW9uKG5vZGUuc2l6ZSkgJiYgbm9kZS5sZW5ndGggPiAwO1xyXG59XHJcblxyXG4vKipcclxuICog6Kej5p6QdXJsXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgdXJs5Zyw5Z2A77yM5LiN5aGr5YiZ5Y+WbG9jYXRpb24uaHJlZlxyXG4gKiBAcmV0dXJuIHtPYmplY3R9IHVybE9iamVjdCBodHRwczovL25vZGVqcy5vcmcvZGlzdC9sYXRlc3QtdjYueC9kb2NzL2FwaS91cmwuaHRtbCN1cmxfdXJsX3N0cmluZ3NfYW5kX3VybF9vYmplY3RzXHJcbiAqICBxdWVyeTog5aaC5p6c5rKh5pyJcXVlcnnvvIzliJnmmK97fVxyXG4gKi9cclxuZXhwb3J0cy51cmxwYXJzZSA9IGZ1bmN0aW9uKHVybCl7XHJcblx0dXJsID0gdXJsIHx8IGxvY2F0aW9uLmhyZWY7XHJcblxyXG5cdHJldHVybiBVcmwucGFyc2UodXJsLHRydWUpO1xyXG59XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3XHJcbiAqICAg55uR5ZCsd2luZG93IHJlc2l6ZeOAguWPquaUr+aMgVBDXHJcbiAqIEBhdXRob3IgbWluZ3J1aXwgbWluZ3J1aUBzdGFmZi5zaW5hLmNvbS5jblxyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE1LTA4LTI3XHJcbiAqIEBleGFtcGxlXHJcbiAqIFx0XHRjb25zdCBXaW5yZXNpemUgPSByZXF1aXJlKCdsaWJ1dGlsLXdpbnJlc2l6ZScpO1xyXG4gKlxyXG4gKiBcdFx0V2lucmVzaXplLmxpc3Rlbih7Y2FsbDpmdW5jdGlvbigpe2NvbnNvbGUubG9nKCfnqpflj6NyZXNpemUnKTt9fSk7XHJcbiAqL1xyXG5jb25zdCBSZXNpemUgPSByZXF1aXJlKCcuL3Jlc2l6ZS5qcycpLFxyXG5cdFx0RGV2aWNlZXZ0bmFtZSA9IHJlcXVpcmUoJy4vZGV2aWNlZXZ0bmFtZS5qcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBuZXcgUmVzaXplKCQod2luZG93KSx7XHJcblx0ZXZ0bmFtZTogRGV2aWNlZXZ0bmFtZSsnLmxpYidcclxufSk7XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3XHJcbiAqICAg56qX5Y+j5rua5Yqo5LqL5Lu255uR5ZCsXHJcbiAqIEBhdXRob3IgbWluZ3J1aXwgbWluZ3J1aUBzdGFmZi5zaW5hLmNvbS5jblxyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE1LTA4LTI3XHJcbiAqIEByZXR1cm4g5rua5Yqo55uR5ZCs5a+56LGhXHJcbiAqIEBleGFtcGxlXHJcbiAqIFx0XHRjb25zdCBXaW5zY3JvbGwgPSByZXF1aXJlKCdsaWJ1dGlsLXdpbnNjcm9sbCcpO1xyXG4gKlxyXG4gKiBcdFx0V2luc2Nyb2xsLmxpc3Rlbih7Y2FsbDpmdW5jdGlvbigpe2NvbnNvbGUubG9nKCfnqpflj6NzY3JvbGwnKTt9fSk7XHJcbiAqL1xyXG5cclxuY29uc3QgU2Nyb2xsID0gcmVxdWlyZSgnLi9zY3JvbGwuanMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbmV3IFNjcm9sbCgkKHdpbmRvdykpO1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyDnur/nqIvmsaDmjqfliLblmahcclxuICogICAgICDotJ/otKPov5Tlm57lvZPliY3nqbrpl7LnmoTnur/nqIvlr7nosaFcclxuICogQHZlcnNpb24gMS4wIHwgMjAxNy0wMS0xOSDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAcmV0dXJuXHJcbiAqIEBleGFtcGxlXHJcbiAqICAgICAgY29uc3QgV29ya2VyQ29udHJvbCA9IHJlcXVpcmUoJ2xpYnV0aWwtd29ya2VyQ29udHJvbCcpO1xyXG4gKiAqL1xyXG5cclxuIGNsYXNzIFdvcmtlcntcclxuICAgICAvKipcclxuICAgICAgKiDkuIDkuKrnur/nqItcclxuICAgICAgKi9cclxuICAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgICB0aGlzLmxvY2sgPSB0cnVlO1xyXG4gICAgIH1cclxuIH1cclxuXHJcbiBjbGFzcyBXb3JrZXJDb250cm9sIHtcclxuICAgICAvKipcclxuICAgICAgKiDnur/nqIvmsaDmjqfliLblmajnsbtcclxuICAgICAgKiBAcmV0dXJuIHtbdHlwZV19IFtkZXNjcmlwdGlvbl1cclxuICAgICAgKi9cclxuICAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgICB0aGlzLl93b3JrZXJvYmpzID0gW107IC8vd29ya2VyQ29udHJvbOWvueixoVxyXG4gICAgIH1cclxuICAgICAvKipcclxuICAgICAgKiDov5Tlm57lvZPliY3nqbrpl7LnmoR3b3JrZXJDb250cm9s5a+56LGhXHJcbiAgICAgICogQHJldHVybiB7W3R5cGVdfSBbZGVzY3JpcHRpb25dXHJcbiAgICAgICovXHJcbiAgICAgZ2V0KCl7XHJcbiAgICAgICAgIHZhciBjdXJ3b3JrZXIgPSBudWxsO1xyXG4gICAgICAgICBmb3IodmFyIGkgPSAwLCBsZW4gPSB0aGlzLl93b3JrZXJvYmpzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcclxuICAgICAgICAgICAgIGlmKHRoaXMuX3dvcmtlcm9ianNbaV0ubG9jayA9PSBmYWxzZSl7IC8v5pei5peg6K+35rGC5Y+I5rKh5pyJ6KKr6ZSB5a6aXHJcbiAgICAgICAgICAgICAgICAgdGhpcy5fd29ya2Vyb2Jqc1tpXS5sb2NrID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICBjdXJ3b3JrZXIgPSB0aGlzLl93b3JrZXJvYmpzW2ldO1xyXG4gICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgfVxyXG4gICAgICAgICB9XHJcbiAgICAgICAgIGlmKGN1cndvcmtlciA9PSBudWxsKXtcclxuICAgICAgICAgICAgIGN1cndvcmtlciA9IG5ldyBXb3JrZXIoKTtcclxuICAgICAgICAgICAgIHRoaXMuX3dvcmtlcm9ianMucHVzaChjdXJ3b3JrZXIpO1xyXG4gICAgICAgICB9XHJcbiAgICAgICAgIHJldHVybiBjdXJ3b3JrZXI7XHJcbiAgICAgfVxyXG4gICAgIC8qKlxyXG4gICAgICAqIOmAmuefpeW9k+WJjXdvcmtlckNvbnRyb2zlr7nosaHlt7Lnu4/kvb/nlKjlrozmr5VcclxuICAgICAgKiBAcGFyYW0ge2luc3RhbmNlIG9mIHdvcmtlckNvbnRyb2x9IHdvcmtlciDlpoLmnpzmj5DkvpvkuoZ3b3JrZXLvvIzliJnnu5PmnZ/mraTnur/nqIvvvJvlpoLmnpzmsqHmj5DkvpvvvIzliJnnu5PmnZ/nrKzkuIDkuKrmraPlnKjkvb/nlKjnmoTnur/nqItcclxuICAgICAgKiBAcmV0dXJuIHtpbnN0YW5jZSBvZiB3b3JrZXJDb250cm9sIHwgbnVsbH0g5b2T5YmN57uT5p2f55qE57q/56iL5a+56LGhLuayoeacieWImeS4um51bGxcclxuICAgICAgKi9cclxuICAgICBlbmQod29ya2VyKXtcclxuICAgICAgICAgdmFyIGN1cndvcmtlciA9IG51bGw7XHJcbiAgICAgICAgIGZvcih2YXIgaSA9IDAsIGxlbiA9IHRoaXMuX3dvcmtlcm9ianMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xyXG4gICAgICAgICAgICAgaWYod29ya2VyKXtcclxuICAgICAgICAgICAgICAgICBpZih0aGlzLl93b3JrZXJvYmpzW2ldID09IHdvcmtlcil7IC8v5pei5peg6K+35rGC5Y+I5rKh5pyJ6KKr6ZSB5a6aXHJcbiAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3dvcmtlcm9ianNbaV0ubG9jayA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICBjdXJ3b3JrZXIgPSB0aGlzLl93b3JrZXJvYmpzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICBpZih0aGlzLl93b3JrZXJvYmpzW2ldLmxvY2sgPT0gdHJ1ZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3dvcmtlcm9ianNbaV0ubG9jayA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICBjdXJ3b3JrZXIgPSB0aGlzLl93b3JrZXJvYmpzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICB9XHJcbiAgICAgICAgIH1cclxuICAgICAgICAgcmV0dXJuIGN1cndvcmtlcjtcclxuICAgICB9XHJcbiAgICAgLyoqXHJcbiAgICAgICog5piv5ZCm5omA5pyJ55qE57q/56iL6YO96KKr5L2/55So5a6M5q+VXHJcbiAgICAgICogQHJldHVybiB7Qm9vbGVhbn0gdHJ1Ze+8muaJgOaciee6v+eoi+mDveepuumXslxyXG4gICAgICAqL1xyXG4gICAgIGlzZW5kKCl7XHJcbiAgICAgICAgIHZhciByZXN1bHQgPSB0cnVlO1xyXG4gICAgICAgICBmb3IodmFyIGkgPSAwLCBsZW4gPSB0aGlzLl93b3JrZXJvYmpzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcclxuICAgICAgICAgICAgIGlmKHRoaXMuX3dvcmtlcm9ianNbaV0ubG9jayA9PSB0cnVlKXsgLy/ml6Lml6Dor7fmsYLlj4jmsqHmnInooqvplIHlrppcclxuICAgICAgICAgICAgICAgICByZXN1bHQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgIH1cclxuICAgICAgICAgfVxyXG4gICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgIH1cclxuIH1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gV29ya2VyQ29udHJvbDtcclxuIiwiLyohIGh0dHBzOi8vbXRocy5iZS9wdW55Y29kZSB2MS40LjEgYnkgQG1hdGhpYXMgKi9cbjsoZnVuY3Rpb24ocm9vdCkge1xuXG5cdC8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZXMgKi9cblx0dmFyIGZyZWVFeHBvcnRzID0gdHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0cyAmJlxuXHRcdCFleHBvcnRzLm5vZGVUeXBlICYmIGV4cG9ydHM7XG5cdHZhciBmcmVlTW9kdWxlID0gdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiZcblx0XHQhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZTtcblx0dmFyIGZyZWVHbG9iYWwgPSB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbDtcblx0aWYgKFxuXHRcdGZyZWVHbG9iYWwuZ2xvYmFsID09PSBmcmVlR2xvYmFsIHx8XG5cdFx0ZnJlZUdsb2JhbC53aW5kb3cgPT09IGZyZWVHbG9iYWwgfHxcblx0XHRmcmVlR2xvYmFsLnNlbGYgPT09IGZyZWVHbG9iYWxcblx0KSB7XG5cdFx0cm9vdCA9IGZyZWVHbG9iYWw7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGBwdW55Y29kZWAgb2JqZWN0LlxuXHQgKiBAbmFtZSBwdW55Y29kZVxuXHQgKiBAdHlwZSBPYmplY3Rcblx0ICovXG5cdHZhciBwdW55Y29kZSxcblxuXHQvKiogSGlnaGVzdCBwb3NpdGl2ZSBzaWduZWQgMzItYml0IGZsb2F0IHZhbHVlICovXG5cdG1heEludCA9IDIxNDc0ODM2NDcsIC8vIGFrYS4gMHg3RkZGRkZGRiBvciAyXjMxLTFcblxuXHQvKiogQm9vdHN0cmluZyBwYXJhbWV0ZXJzICovXG5cdGJhc2UgPSAzNixcblx0dE1pbiA9IDEsXG5cdHRNYXggPSAyNixcblx0c2tldyA9IDM4LFxuXHRkYW1wID0gNzAwLFxuXHRpbml0aWFsQmlhcyA9IDcyLFxuXHRpbml0aWFsTiA9IDEyOCwgLy8gMHg4MFxuXHRkZWxpbWl0ZXIgPSAnLScsIC8vICdcXHgyRCdcblxuXHQvKiogUmVndWxhciBleHByZXNzaW9ucyAqL1xuXHRyZWdleFB1bnljb2RlID0gL154bi0tLyxcblx0cmVnZXhOb25BU0NJSSA9IC9bXlxceDIwLVxceDdFXS8sIC8vIHVucHJpbnRhYmxlIEFTQ0lJIGNoYXJzICsgbm9uLUFTQ0lJIGNoYXJzXG5cdHJlZ2V4U2VwYXJhdG9ycyA9IC9bXFx4MkVcXHUzMDAyXFx1RkYwRVxcdUZGNjFdL2csIC8vIFJGQyAzNDkwIHNlcGFyYXRvcnNcblxuXHQvKiogRXJyb3IgbWVzc2FnZXMgKi9cblx0ZXJyb3JzID0ge1xuXHRcdCdvdmVyZmxvdyc6ICdPdmVyZmxvdzogaW5wdXQgbmVlZHMgd2lkZXIgaW50ZWdlcnMgdG8gcHJvY2VzcycsXG5cdFx0J25vdC1iYXNpYyc6ICdJbGxlZ2FsIGlucHV0ID49IDB4ODAgKG5vdCBhIGJhc2ljIGNvZGUgcG9pbnQpJyxcblx0XHQnaW52YWxpZC1pbnB1dCc6ICdJbnZhbGlkIGlucHV0J1xuXHR9LFxuXG5cdC8qKiBDb252ZW5pZW5jZSBzaG9ydGN1dHMgKi9cblx0YmFzZU1pbnVzVE1pbiA9IGJhc2UgLSB0TWluLFxuXHRmbG9vciA9IE1hdGguZmxvb3IsXG5cdHN0cmluZ0Zyb21DaGFyQ29kZSA9IFN0cmluZy5mcm9tQ2hhckNvZGUsXG5cblx0LyoqIFRlbXBvcmFyeSB2YXJpYWJsZSAqL1xuXHRrZXk7XG5cblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblx0LyoqXG5cdCAqIEEgZ2VuZXJpYyBlcnJvciB1dGlsaXR5IGZ1bmN0aW9uLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gdHlwZSBUaGUgZXJyb3IgdHlwZS5cblx0ICogQHJldHVybnMge0Vycm9yfSBUaHJvd3MgYSBgUmFuZ2VFcnJvcmAgd2l0aCB0aGUgYXBwbGljYWJsZSBlcnJvciBtZXNzYWdlLlxuXHQgKi9cblx0ZnVuY3Rpb24gZXJyb3IodHlwZSkge1xuXHRcdHRocm93IG5ldyBSYW5nZUVycm9yKGVycm9yc1t0eXBlXSk7XG5cdH1cblxuXHQvKipcblx0ICogQSBnZW5lcmljIGBBcnJheSNtYXBgIHV0aWxpdHkgZnVuY3Rpb24uXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0aGF0IGdldHMgY2FsbGVkIGZvciBldmVyeSBhcnJheVxuXHQgKiBpdGVtLlxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IEEgbmV3IGFycmF5IG9mIHZhbHVlcyByZXR1cm5lZCBieSB0aGUgY2FsbGJhY2sgZnVuY3Rpb24uXG5cdCAqL1xuXHRmdW5jdGlvbiBtYXAoYXJyYXksIGZuKSB7XG5cdFx0dmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcblx0XHR2YXIgcmVzdWx0ID0gW107XG5cdFx0d2hpbGUgKGxlbmd0aC0tKSB7XG5cdFx0XHRyZXN1bHRbbGVuZ3RoXSA9IGZuKGFycmF5W2xlbmd0aF0pO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0LyoqXG5cdCAqIEEgc2ltcGxlIGBBcnJheSNtYXBgLWxpa2Ugd3JhcHBlciB0byB3b3JrIHdpdGggZG9tYWluIG5hbWUgc3RyaW5ncyBvciBlbWFpbFxuXHQgKiBhZGRyZXNzZXMuXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBkb21haW4gVGhlIGRvbWFpbiBuYW1lIG9yIGVtYWlsIGFkZHJlc3MuXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0aGF0IGdldHMgY2FsbGVkIGZvciBldmVyeVxuXHQgKiBjaGFyYWN0ZXIuXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gQSBuZXcgc3RyaW5nIG9mIGNoYXJhY3RlcnMgcmV0dXJuZWQgYnkgdGhlIGNhbGxiYWNrXG5cdCAqIGZ1bmN0aW9uLlxuXHQgKi9cblx0ZnVuY3Rpb24gbWFwRG9tYWluKHN0cmluZywgZm4pIHtcblx0XHR2YXIgcGFydHMgPSBzdHJpbmcuc3BsaXQoJ0AnKTtcblx0XHR2YXIgcmVzdWx0ID0gJyc7XG5cdFx0aWYgKHBhcnRzLmxlbmd0aCA+IDEpIHtcblx0XHRcdC8vIEluIGVtYWlsIGFkZHJlc3Nlcywgb25seSB0aGUgZG9tYWluIG5hbWUgc2hvdWxkIGJlIHB1bnljb2RlZC4gTGVhdmVcblx0XHRcdC8vIHRoZSBsb2NhbCBwYXJ0IChpLmUuIGV2ZXJ5dGhpbmcgdXAgdG8gYEBgKSBpbnRhY3QuXG5cdFx0XHRyZXN1bHQgPSBwYXJ0c1swXSArICdAJztcblx0XHRcdHN0cmluZyA9IHBhcnRzWzFdO1xuXHRcdH1cblx0XHQvLyBBdm9pZCBgc3BsaXQocmVnZXgpYCBmb3IgSUU4IGNvbXBhdGliaWxpdHkuIFNlZSAjMTcuXG5cdFx0c3RyaW5nID0gc3RyaW5nLnJlcGxhY2UocmVnZXhTZXBhcmF0b3JzLCAnXFx4MkUnKTtcblx0XHR2YXIgbGFiZWxzID0gc3RyaW5nLnNwbGl0KCcuJyk7XG5cdFx0dmFyIGVuY29kZWQgPSBtYXAobGFiZWxzLCBmbikuam9pbignLicpO1xuXHRcdHJldHVybiByZXN1bHQgKyBlbmNvZGVkO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYW4gYXJyYXkgY29udGFpbmluZyB0aGUgbnVtZXJpYyBjb2RlIHBvaW50cyBvZiBlYWNoIFVuaWNvZGVcblx0ICogY2hhcmFjdGVyIGluIHRoZSBzdHJpbmcuIFdoaWxlIEphdmFTY3JpcHQgdXNlcyBVQ1MtMiBpbnRlcm5hbGx5LFxuXHQgKiB0aGlzIGZ1bmN0aW9uIHdpbGwgY29udmVydCBhIHBhaXIgb2Ygc3Vycm9nYXRlIGhhbHZlcyAoZWFjaCBvZiB3aGljaFxuXHQgKiBVQ1MtMiBleHBvc2VzIGFzIHNlcGFyYXRlIGNoYXJhY3RlcnMpIGludG8gYSBzaW5nbGUgY29kZSBwb2ludCxcblx0ICogbWF0Y2hpbmcgVVRGLTE2LlxuXHQgKiBAc2VlIGBwdW55Y29kZS51Y3MyLmVuY29kZWBcblx0ICogQHNlZSA8aHR0cHM6Ly9tYXRoaWFzYnluZW5zLmJlL25vdGVzL2phdmFzY3JpcHQtZW5jb2Rpbmc+XG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZS51Y3MyXG5cdCAqIEBuYW1lIGRlY29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gc3RyaW5nIFRoZSBVbmljb2RlIGlucHV0IHN0cmluZyAoVUNTLTIpLlxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IFRoZSBuZXcgYXJyYXkgb2YgY29kZSBwb2ludHMuXG5cdCAqL1xuXHRmdW5jdGlvbiB1Y3MyZGVjb2RlKHN0cmluZykge1xuXHRcdHZhciBvdXRwdXQgPSBbXSxcblx0XHQgICAgY291bnRlciA9IDAsXG5cdFx0ICAgIGxlbmd0aCA9IHN0cmluZy5sZW5ndGgsXG5cdFx0ICAgIHZhbHVlLFxuXHRcdCAgICBleHRyYTtcblx0XHR3aGlsZSAoY291bnRlciA8IGxlbmd0aCkge1xuXHRcdFx0dmFsdWUgPSBzdHJpbmcuY2hhckNvZGVBdChjb3VudGVyKyspO1xuXHRcdFx0aWYgKHZhbHVlID49IDB4RDgwMCAmJiB2YWx1ZSA8PSAweERCRkYgJiYgY291bnRlciA8IGxlbmd0aCkge1xuXHRcdFx0XHQvLyBoaWdoIHN1cnJvZ2F0ZSwgYW5kIHRoZXJlIGlzIGEgbmV4dCBjaGFyYWN0ZXJcblx0XHRcdFx0ZXh0cmEgPSBzdHJpbmcuY2hhckNvZGVBdChjb3VudGVyKyspO1xuXHRcdFx0XHRpZiAoKGV4dHJhICYgMHhGQzAwKSA9PSAweERDMDApIHsgLy8gbG93IHN1cnJvZ2F0ZVxuXHRcdFx0XHRcdG91dHB1dC5wdXNoKCgodmFsdWUgJiAweDNGRikgPDwgMTApICsgKGV4dHJhICYgMHgzRkYpICsgMHgxMDAwMCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gdW5tYXRjaGVkIHN1cnJvZ2F0ZTsgb25seSBhcHBlbmQgdGhpcyBjb2RlIHVuaXQsIGluIGNhc2UgdGhlIG5leHRcblx0XHRcdFx0XHQvLyBjb2RlIHVuaXQgaXMgdGhlIGhpZ2ggc3Vycm9nYXRlIG9mIGEgc3Vycm9nYXRlIHBhaXJcblx0XHRcdFx0XHRvdXRwdXQucHVzaCh2YWx1ZSk7XG5cdFx0XHRcdFx0Y291bnRlci0tO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvdXRwdXQucHVzaCh2YWx1ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBvdXRwdXQ7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHN0cmluZyBiYXNlZCBvbiBhbiBhcnJheSBvZiBudW1lcmljIGNvZGUgcG9pbnRzLlxuXHQgKiBAc2VlIGBwdW55Y29kZS51Y3MyLmRlY29kZWBcblx0ICogQG1lbWJlck9mIHB1bnljb2RlLnVjczJcblx0ICogQG5hbWUgZW5jb2RlXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGNvZGVQb2ludHMgVGhlIGFycmF5IG9mIG51bWVyaWMgY29kZSBwb2ludHMuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBuZXcgVW5pY29kZSBzdHJpbmcgKFVDUy0yKS5cblx0ICovXG5cdGZ1bmN0aW9uIHVjczJlbmNvZGUoYXJyYXkpIHtcblx0XHRyZXR1cm4gbWFwKGFycmF5LCBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0dmFyIG91dHB1dCA9ICcnO1xuXHRcdFx0aWYgKHZhbHVlID4gMHhGRkZGKSB7XG5cdFx0XHRcdHZhbHVlIC09IDB4MTAwMDA7XG5cdFx0XHRcdG91dHB1dCArPSBzdHJpbmdGcm9tQ2hhckNvZGUodmFsdWUgPj4+IDEwICYgMHgzRkYgfCAweEQ4MDApO1xuXHRcdFx0XHR2YWx1ZSA9IDB4REMwMCB8IHZhbHVlICYgMHgzRkY7XG5cdFx0XHR9XG5cdFx0XHRvdXRwdXQgKz0gc3RyaW5nRnJvbUNoYXJDb2RlKHZhbHVlKTtcblx0XHRcdHJldHVybiBvdXRwdXQ7XG5cdFx0fSkuam9pbignJyk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBiYXNpYyBjb2RlIHBvaW50IGludG8gYSBkaWdpdC9pbnRlZ2VyLlxuXHQgKiBAc2VlIGBkaWdpdFRvQmFzaWMoKWBcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGNvZGVQb2ludCBUaGUgYmFzaWMgbnVtZXJpYyBjb2RlIHBvaW50IHZhbHVlLlxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgbnVtZXJpYyB2YWx1ZSBvZiBhIGJhc2ljIGNvZGUgcG9pbnQgKGZvciB1c2UgaW5cblx0ICogcmVwcmVzZW50aW5nIGludGVnZXJzKSBpbiB0aGUgcmFuZ2UgYDBgIHRvIGBiYXNlIC0gMWAsIG9yIGBiYXNlYCBpZlxuXHQgKiB0aGUgY29kZSBwb2ludCBkb2VzIG5vdCByZXByZXNlbnQgYSB2YWx1ZS5cblx0ICovXG5cdGZ1bmN0aW9uIGJhc2ljVG9EaWdpdChjb2RlUG9pbnQpIHtcblx0XHRpZiAoY29kZVBvaW50IC0gNDggPCAxMCkge1xuXHRcdFx0cmV0dXJuIGNvZGVQb2ludCAtIDIyO1xuXHRcdH1cblx0XHRpZiAoY29kZVBvaW50IC0gNjUgPCAyNikge1xuXHRcdFx0cmV0dXJuIGNvZGVQb2ludCAtIDY1O1xuXHRcdH1cblx0XHRpZiAoY29kZVBvaW50IC0gOTcgPCAyNikge1xuXHRcdFx0cmV0dXJuIGNvZGVQb2ludCAtIDk3O1xuXHRcdH1cblx0XHRyZXR1cm4gYmFzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIGRpZ2l0L2ludGVnZXIgaW50byBhIGJhc2ljIGNvZGUgcG9pbnQuXG5cdCAqIEBzZWUgYGJhc2ljVG9EaWdpdCgpYFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge051bWJlcn0gZGlnaXQgVGhlIG51bWVyaWMgdmFsdWUgb2YgYSBiYXNpYyBjb2RlIHBvaW50LlxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgYmFzaWMgY29kZSBwb2ludCB3aG9zZSB2YWx1ZSAod2hlbiB1c2VkIGZvclxuXHQgKiByZXByZXNlbnRpbmcgaW50ZWdlcnMpIGlzIGBkaWdpdGAsIHdoaWNoIG5lZWRzIHRvIGJlIGluIHRoZSByYW5nZVxuXHQgKiBgMGAgdG8gYGJhc2UgLSAxYC4gSWYgYGZsYWdgIGlzIG5vbi16ZXJvLCB0aGUgdXBwZXJjYXNlIGZvcm0gaXNcblx0ICogdXNlZDsgZWxzZSwgdGhlIGxvd2VyY2FzZSBmb3JtIGlzIHVzZWQuIFRoZSBiZWhhdmlvciBpcyB1bmRlZmluZWRcblx0ICogaWYgYGZsYWdgIGlzIG5vbi16ZXJvIGFuZCBgZGlnaXRgIGhhcyBubyB1cHBlcmNhc2UgZm9ybS5cblx0ICovXG5cdGZ1bmN0aW9uIGRpZ2l0VG9CYXNpYyhkaWdpdCwgZmxhZykge1xuXHRcdC8vICAwLi4yNSBtYXAgdG8gQVNDSUkgYS4ueiBvciBBLi5aXG5cdFx0Ly8gMjYuLjM1IG1hcCB0byBBU0NJSSAwLi45XG5cdFx0cmV0dXJuIGRpZ2l0ICsgMjIgKyA3NSAqIChkaWdpdCA8IDI2KSAtICgoZmxhZyAhPSAwKSA8PCA1KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBCaWFzIGFkYXB0YXRpb24gZnVuY3Rpb24gYXMgcGVyIHNlY3Rpb24gMy40IG9mIFJGQyAzNDkyLlxuXHQgKiBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzQ5MiNzZWN0aW9uLTMuNFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0ZnVuY3Rpb24gYWRhcHQoZGVsdGEsIG51bVBvaW50cywgZmlyc3RUaW1lKSB7XG5cdFx0dmFyIGsgPSAwO1xuXHRcdGRlbHRhID0gZmlyc3RUaW1lID8gZmxvb3IoZGVsdGEgLyBkYW1wKSA6IGRlbHRhID4+IDE7XG5cdFx0ZGVsdGEgKz0gZmxvb3IoZGVsdGEgLyBudW1Qb2ludHMpO1xuXHRcdGZvciAoLyogbm8gaW5pdGlhbGl6YXRpb24gKi87IGRlbHRhID4gYmFzZU1pbnVzVE1pbiAqIHRNYXggPj4gMTsgayArPSBiYXNlKSB7XG5cdFx0XHRkZWx0YSA9IGZsb29yKGRlbHRhIC8gYmFzZU1pbnVzVE1pbik7XG5cdFx0fVxuXHRcdHJldHVybiBmbG9vcihrICsgKGJhc2VNaW51c1RNaW4gKyAxKSAqIGRlbHRhIC8gKGRlbHRhICsgc2tldykpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgUHVueWNvZGUgc3RyaW5nIG9mIEFTQ0lJLW9ubHkgc3ltYm9scyB0byBhIHN0cmluZyBvZiBVbmljb2RlXG5cdCAqIHN5bWJvbHMuXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIFB1bnljb2RlIHN0cmluZyBvZiBBU0NJSS1vbmx5IHN5bWJvbHMuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSByZXN1bHRpbmcgc3RyaW5nIG9mIFVuaWNvZGUgc3ltYm9scy5cblx0ICovXG5cdGZ1bmN0aW9uIGRlY29kZShpbnB1dCkge1xuXHRcdC8vIERvbid0IHVzZSBVQ1MtMlxuXHRcdHZhciBvdXRwdXQgPSBbXSxcblx0XHQgICAgaW5wdXRMZW5ndGggPSBpbnB1dC5sZW5ndGgsXG5cdFx0ICAgIG91dCxcblx0XHQgICAgaSA9IDAsXG5cdFx0ICAgIG4gPSBpbml0aWFsTixcblx0XHQgICAgYmlhcyA9IGluaXRpYWxCaWFzLFxuXHRcdCAgICBiYXNpYyxcblx0XHQgICAgaixcblx0XHQgICAgaW5kZXgsXG5cdFx0ICAgIG9sZGksXG5cdFx0ICAgIHcsXG5cdFx0ICAgIGssXG5cdFx0ICAgIGRpZ2l0LFxuXHRcdCAgICB0LFxuXHRcdCAgICAvKiogQ2FjaGVkIGNhbGN1bGF0aW9uIHJlc3VsdHMgKi9cblx0XHQgICAgYmFzZU1pbnVzVDtcblxuXHRcdC8vIEhhbmRsZSB0aGUgYmFzaWMgY29kZSBwb2ludHM6IGxldCBgYmFzaWNgIGJlIHRoZSBudW1iZXIgb2YgaW5wdXQgY29kZVxuXHRcdC8vIHBvaW50cyBiZWZvcmUgdGhlIGxhc3QgZGVsaW1pdGVyLCBvciBgMGAgaWYgdGhlcmUgaXMgbm9uZSwgdGhlbiBjb3B5XG5cdFx0Ly8gdGhlIGZpcnN0IGJhc2ljIGNvZGUgcG9pbnRzIHRvIHRoZSBvdXRwdXQuXG5cblx0XHRiYXNpYyA9IGlucHV0Lmxhc3RJbmRleE9mKGRlbGltaXRlcik7XG5cdFx0aWYgKGJhc2ljIDwgMCkge1xuXHRcdFx0YmFzaWMgPSAwO1xuXHRcdH1cblxuXHRcdGZvciAoaiA9IDA7IGogPCBiYXNpYzsgKytqKSB7XG5cdFx0XHQvLyBpZiBpdCdzIG5vdCBhIGJhc2ljIGNvZGUgcG9pbnRcblx0XHRcdGlmIChpbnB1dC5jaGFyQ29kZUF0KGopID49IDB4ODApIHtcblx0XHRcdFx0ZXJyb3IoJ25vdC1iYXNpYycpO1xuXHRcdFx0fVxuXHRcdFx0b3V0cHV0LnB1c2goaW5wdXQuY2hhckNvZGVBdChqKSk7XG5cdFx0fVxuXG5cdFx0Ly8gTWFpbiBkZWNvZGluZyBsb29wOiBzdGFydCBqdXN0IGFmdGVyIHRoZSBsYXN0IGRlbGltaXRlciBpZiBhbnkgYmFzaWMgY29kZVxuXHRcdC8vIHBvaW50cyB3ZXJlIGNvcGllZDsgc3RhcnQgYXQgdGhlIGJlZ2lubmluZyBvdGhlcndpc2UuXG5cblx0XHRmb3IgKGluZGV4ID0gYmFzaWMgPiAwID8gYmFzaWMgKyAxIDogMDsgaW5kZXggPCBpbnB1dExlbmd0aDsgLyogbm8gZmluYWwgZXhwcmVzc2lvbiAqLykge1xuXG5cdFx0XHQvLyBgaW5kZXhgIGlzIHRoZSBpbmRleCBvZiB0aGUgbmV4dCBjaGFyYWN0ZXIgdG8gYmUgY29uc3VtZWQuXG5cdFx0XHQvLyBEZWNvZGUgYSBnZW5lcmFsaXplZCB2YXJpYWJsZS1sZW5ndGggaW50ZWdlciBpbnRvIGBkZWx0YWAsXG5cdFx0XHQvLyB3aGljaCBnZXRzIGFkZGVkIHRvIGBpYC4gVGhlIG92ZXJmbG93IGNoZWNraW5nIGlzIGVhc2llclxuXHRcdFx0Ly8gaWYgd2UgaW5jcmVhc2UgYGlgIGFzIHdlIGdvLCB0aGVuIHN1YnRyYWN0IG9mZiBpdHMgc3RhcnRpbmdcblx0XHRcdC8vIHZhbHVlIGF0IHRoZSBlbmQgdG8gb2J0YWluIGBkZWx0YWAuXG5cdFx0XHRmb3IgKG9sZGkgPSBpLCB3ID0gMSwgayA9IGJhc2U7IC8qIG5vIGNvbmRpdGlvbiAqLzsgayArPSBiYXNlKSB7XG5cblx0XHRcdFx0aWYgKGluZGV4ID49IGlucHV0TGVuZ3RoKSB7XG5cdFx0XHRcdFx0ZXJyb3IoJ2ludmFsaWQtaW5wdXQnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGRpZ2l0ID0gYmFzaWNUb0RpZ2l0KGlucHV0LmNoYXJDb2RlQXQoaW5kZXgrKykpO1xuXG5cdFx0XHRcdGlmIChkaWdpdCA+PSBiYXNlIHx8IGRpZ2l0ID4gZmxvb3IoKG1heEludCAtIGkpIC8gdykpIHtcblx0XHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGkgKz0gZGlnaXQgKiB3O1xuXHRcdFx0XHR0ID0gayA8PSBiaWFzID8gdE1pbiA6IChrID49IGJpYXMgKyB0TWF4ID8gdE1heCA6IGsgLSBiaWFzKTtcblxuXHRcdFx0XHRpZiAoZGlnaXQgPCB0KSB7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRiYXNlTWludXNUID0gYmFzZSAtIHQ7XG5cdFx0XHRcdGlmICh3ID4gZmxvb3IobWF4SW50IC8gYmFzZU1pbnVzVCkpIHtcblx0XHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHcgKj0gYmFzZU1pbnVzVDtcblxuXHRcdFx0fVxuXG5cdFx0XHRvdXQgPSBvdXRwdXQubGVuZ3RoICsgMTtcblx0XHRcdGJpYXMgPSBhZGFwdChpIC0gb2xkaSwgb3V0LCBvbGRpID09IDApO1xuXG5cdFx0XHQvLyBgaWAgd2FzIHN1cHBvc2VkIHRvIHdyYXAgYXJvdW5kIGZyb20gYG91dGAgdG8gYDBgLFxuXHRcdFx0Ly8gaW5jcmVtZW50aW5nIGBuYCBlYWNoIHRpbWUsIHNvIHdlJ2xsIGZpeCB0aGF0IG5vdzpcblx0XHRcdGlmIChmbG9vcihpIC8gb3V0KSA+IG1heEludCAtIG4pIHtcblx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHR9XG5cblx0XHRcdG4gKz0gZmxvb3IoaSAvIG91dCk7XG5cdFx0XHRpICU9IG91dDtcblxuXHRcdFx0Ly8gSW5zZXJ0IGBuYCBhdCBwb3NpdGlvbiBgaWAgb2YgdGhlIG91dHB1dFxuXHRcdFx0b3V0cHV0LnNwbGljZShpKyssIDAsIG4pO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHVjczJlbmNvZGUob3V0cHV0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIHN0cmluZyBvZiBVbmljb2RlIHN5bWJvbHMgKGUuZy4gYSBkb21haW4gbmFtZSBsYWJlbCkgdG8gYVxuXHQgKiBQdW55Y29kZSBzdHJpbmcgb2YgQVNDSUktb25seSBzeW1ib2xzLlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGlucHV0IFRoZSBzdHJpbmcgb2YgVW5pY29kZSBzeW1ib2xzLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgcmVzdWx0aW5nIFB1bnljb2RlIHN0cmluZyBvZiBBU0NJSS1vbmx5IHN5bWJvbHMuXG5cdCAqL1xuXHRmdW5jdGlvbiBlbmNvZGUoaW5wdXQpIHtcblx0XHR2YXIgbixcblx0XHQgICAgZGVsdGEsXG5cdFx0ICAgIGhhbmRsZWRDUENvdW50LFxuXHRcdCAgICBiYXNpY0xlbmd0aCxcblx0XHQgICAgYmlhcyxcblx0XHQgICAgaixcblx0XHQgICAgbSxcblx0XHQgICAgcSxcblx0XHQgICAgayxcblx0XHQgICAgdCxcblx0XHQgICAgY3VycmVudFZhbHVlLFxuXHRcdCAgICBvdXRwdXQgPSBbXSxcblx0XHQgICAgLyoqIGBpbnB1dExlbmd0aGAgd2lsbCBob2xkIHRoZSBudW1iZXIgb2YgY29kZSBwb2ludHMgaW4gYGlucHV0YC4gKi9cblx0XHQgICAgaW5wdXRMZW5ndGgsXG5cdFx0ICAgIC8qKiBDYWNoZWQgY2FsY3VsYXRpb24gcmVzdWx0cyAqL1xuXHRcdCAgICBoYW5kbGVkQ1BDb3VudFBsdXNPbmUsXG5cdFx0ICAgIGJhc2VNaW51c1QsXG5cdFx0ICAgIHFNaW51c1Q7XG5cblx0XHQvLyBDb252ZXJ0IHRoZSBpbnB1dCBpbiBVQ1MtMiB0byBVbmljb2RlXG5cdFx0aW5wdXQgPSB1Y3MyZGVjb2RlKGlucHV0KTtcblxuXHRcdC8vIENhY2hlIHRoZSBsZW5ndGhcblx0XHRpbnB1dExlbmd0aCA9IGlucHV0Lmxlbmd0aDtcblxuXHRcdC8vIEluaXRpYWxpemUgdGhlIHN0YXRlXG5cdFx0biA9IGluaXRpYWxOO1xuXHRcdGRlbHRhID0gMDtcblx0XHRiaWFzID0gaW5pdGlhbEJpYXM7XG5cblx0XHQvLyBIYW5kbGUgdGhlIGJhc2ljIGNvZGUgcG9pbnRzXG5cdFx0Zm9yIChqID0gMDsgaiA8IGlucHV0TGVuZ3RoOyArK2opIHtcblx0XHRcdGN1cnJlbnRWYWx1ZSA9IGlucHV0W2pdO1xuXHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA8IDB4ODApIHtcblx0XHRcdFx0b3V0cHV0LnB1c2goc3RyaW5nRnJvbUNoYXJDb2RlKGN1cnJlbnRWYWx1ZSkpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGhhbmRsZWRDUENvdW50ID0gYmFzaWNMZW5ndGggPSBvdXRwdXQubGVuZ3RoO1xuXG5cdFx0Ly8gYGhhbmRsZWRDUENvdW50YCBpcyB0aGUgbnVtYmVyIG9mIGNvZGUgcG9pbnRzIHRoYXQgaGF2ZSBiZWVuIGhhbmRsZWQ7XG5cdFx0Ly8gYGJhc2ljTGVuZ3RoYCBpcyB0aGUgbnVtYmVyIG9mIGJhc2ljIGNvZGUgcG9pbnRzLlxuXG5cdFx0Ly8gRmluaXNoIHRoZSBiYXNpYyBzdHJpbmcgLSBpZiBpdCBpcyBub3QgZW1wdHkgLSB3aXRoIGEgZGVsaW1pdGVyXG5cdFx0aWYgKGJhc2ljTGVuZ3RoKSB7XG5cdFx0XHRvdXRwdXQucHVzaChkZWxpbWl0ZXIpO1xuXHRcdH1cblxuXHRcdC8vIE1haW4gZW5jb2RpbmcgbG9vcDpcblx0XHR3aGlsZSAoaGFuZGxlZENQQ291bnQgPCBpbnB1dExlbmd0aCkge1xuXG5cdFx0XHQvLyBBbGwgbm9uLWJhc2ljIGNvZGUgcG9pbnRzIDwgbiBoYXZlIGJlZW4gaGFuZGxlZCBhbHJlYWR5LiBGaW5kIHRoZSBuZXh0XG5cdFx0XHQvLyBsYXJnZXIgb25lOlxuXHRcdFx0Zm9yIChtID0gbWF4SW50LCBqID0gMDsgaiA8IGlucHV0TGVuZ3RoOyArK2opIHtcblx0XHRcdFx0Y3VycmVudFZhbHVlID0gaW5wdXRbal07XG5cdFx0XHRcdGlmIChjdXJyZW50VmFsdWUgPj0gbiAmJiBjdXJyZW50VmFsdWUgPCBtKSB7XG5cdFx0XHRcdFx0bSA9IGN1cnJlbnRWYWx1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBJbmNyZWFzZSBgZGVsdGFgIGVub3VnaCB0byBhZHZhbmNlIHRoZSBkZWNvZGVyJ3MgPG4saT4gc3RhdGUgdG8gPG0sMD4sXG5cdFx0XHQvLyBidXQgZ3VhcmQgYWdhaW5zdCBvdmVyZmxvd1xuXHRcdFx0aGFuZGxlZENQQ291bnRQbHVzT25lID0gaGFuZGxlZENQQ291bnQgKyAxO1xuXHRcdFx0aWYgKG0gLSBuID4gZmxvb3IoKG1heEludCAtIGRlbHRhKSAvIGhhbmRsZWRDUENvdW50UGx1c09uZSkpIHtcblx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHR9XG5cblx0XHRcdGRlbHRhICs9IChtIC0gbikgKiBoYW5kbGVkQ1BDb3VudFBsdXNPbmU7XG5cdFx0XHRuID0gbTtcblxuXHRcdFx0Zm9yIChqID0gMDsgaiA8IGlucHV0TGVuZ3RoOyArK2opIHtcblx0XHRcdFx0Y3VycmVudFZhbHVlID0gaW5wdXRbal07XG5cblx0XHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA8IG4gJiYgKytkZWx0YSA+IG1heEludCkge1xuXHRcdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA9PSBuKSB7XG5cdFx0XHRcdFx0Ly8gUmVwcmVzZW50IGRlbHRhIGFzIGEgZ2VuZXJhbGl6ZWQgdmFyaWFibGUtbGVuZ3RoIGludGVnZXJcblx0XHRcdFx0XHRmb3IgKHEgPSBkZWx0YSwgayA9IGJhc2U7IC8qIG5vIGNvbmRpdGlvbiAqLzsgayArPSBiYXNlKSB7XG5cdFx0XHRcdFx0XHR0ID0gayA8PSBiaWFzID8gdE1pbiA6IChrID49IGJpYXMgKyB0TWF4ID8gdE1heCA6IGsgLSBiaWFzKTtcblx0XHRcdFx0XHRcdGlmIChxIDwgdCkge1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHFNaW51c1QgPSBxIC0gdDtcblx0XHRcdFx0XHRcdGJhc2VNaW51c1QgPSBiYXNlIC0gdDtcblx0XHRcdFx0XHRcdG91dHB1dC5wdXNoKFxuXHRcdFx0XHRcdFx0XHRzdHJpbmdGcm9tQ2hhckNvZGUoZGlnaXRUb0Jhc2ljKHQgKyBxTWludXNUICUgYmFzZU1pbnVzVCwgMCkpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0cSA9IGZsb29yKHFNaW51c1QgLyBiYXNlTWludXNUKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRvdXRwdXQucHVzaChzdHJpbmdGcm9tQ2hhckNvZGUoZGlnaXRUb0Jhc2ljKHEsIDApKSk7XG5cdFx0XHRcdFx0YmlhcyA9IGFkYXB0KGRlbHRhLCBoYW5kbGVkQ1BDb3VudFBsdXNPbmUsIGhhbmRsZWRDUENvdW50ID09IGJhc2ljTGVuZ3RoKTtcblx0XHRcdFx0XHRkZWx0YSA9IDA7XG5cdFx0XHRcdFx0KytoYW5kbGVkQ1BDb3VudDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQrK2RlbHRhO1xuXHRcdFx0KytuO1xuXG5cdFx0fVxuXHRcdHJldHVybiBvdXRwdXQuam9pbignJyk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBQdW55Y29kZSBzdHJpbmcgcmVwcmVzZW50aW5nIGEgZG9tYWluIG5hbWUgb3IgYW4gZW1haWwgYWRkcmVzc1xuXHQgKiB0byBVbmljb2RlLiBPbmx5IHRoZSBQdW55Y29kZWQgcGFydHMgb2YgdGhlIGlucHV0IHdpbGwgYmUgY29udmVydGVkLCBpLmUuXG5cdCAqIGl0IGRvZXNuJ3QgbWF0dGVyIGlmIHlvdSBjYWxsIGl0IG9uIGEgc3RyaW5nIHRoYXQgaGFzIGFscmVhZHkgYmVlblxuXHQgKiBjb252ZXJ0ZWQgdG8gVW5pY29kZS5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dCBUaGUgUHVueWNvZGVkIGRvbWFpbiBuYW1lIG9yIGVtYWlsIGFkZHJlc3MgdG9cblx0ICogY29udmVydCB0byBVbmljb2RlLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgVW5pY29kZSByZXByZXNlbnRhdGlvbiBvZiB0aGUgZ2l2ZW4gUHVueWNvZGVcblx0ICogc3RyaW5nLlxuXHQgKi9cblx0ZnVuY3Rpb24gdG9Vbmljb2RlKGlucHV0KSB7XG5cdFx0cmV0dXJuIG1hcERvbWFpbihpbnB1dCwgZnVuY3Rpb24oc3RyaW5nKSB7XG5cdFx0XHRyZXR1cm4gcmVnZXhQdW55Y29kZS50ZXN0KHN0cmluZylcblx0XHRcdFx0PyBkZWNvZGUoc3RyaW5nLnNsaWNlKDQpLnRvTG93ZXJDYXNlKCkpXG5cdFx0XHRcdDogc3RyaW5nO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgVW5pY29kZSBzdHJpbmcgcmVwcmVzZW50aW5nIGEgZG9tYWluIG5hbWUgb3IgYW4gZW1haWwgYWRkcmVzcyB0b1xuXHQgKiBQdW55Y29kZS4gT25seSB0aGUgbm9uLUFTQ0lJIHBhcnRzIG9mIHRoZSBkb21haW4gbmFtZSB3aWxsIGJlIGNvbnZlcnRlZCxcblx0ICogaS5lLiBpdCBkb2Vzbid0IG1hdHRlciBpZiB5b3UgY2FsbCBpdCB3aXRoIGEgZG9tYWluIHRoYXQncyBhbHJlYWR5IGluXG5cdCAqIEFTQ0lJLlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGlucHV0IFRoZSBkb21haW4gbmFtZSBvciBlbWFpbCBhZGRyZXNzIHRvIGNvbnZlcnQsIGFzIGFcblx0ICogVW5pY29kZSBzdHJpbmcuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBQdW55Y29kZSByZXByZXNlbnRhdGlvbiBvZiB0aGUgZ2l2ZW4gZG9tYWluIG5hbWUgb3Jcblx0ICogZW1haWwgYWRkcmVzcy5cblx0ICovXG5cdGZ1bmN0aW9uIHRvQVNDSUkoaW5wdXQpIHtcblx0XHRyZXR1cm4gbWFwRG9tYWluKGlucHV0LCBmdW5jdGlvbihzdHJpbmcpIHtcblx0XHRcdHJldHVybiByZWdleE5vbkFTQ0lJLnRlc3Qoc3RyaW5nKVxuXHRcdFx0XHQ/ICd4bi0tJyArIGVuY29kZShzdHJpbmcpXG5cdFx0XHRcdDogc3RyaW5nO1xuXHRcdH0pO1xuXHR9XG5cblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblx0LyoqIERlZmluZSB0aGUgcHVibGljIEFQSSAqL1xuXHRwdW55Y29kZSA9IHtcblx0XHQvKipcblx0XHQgKiBBIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIGN1cnJlbnQgUHVueWNvZGUuanMgdmVyc2lvbiBudW1iZXIuXG5cdFx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdFx0ICogQHR5cGUgU3RyaW5nXG5cdFx0ICovXG5cdFx0J3ZlcnNpb24nOiAnMS40LjEnLFxuXHRcdC8qKlxuXHRcdCAqIEFuIG9iamVjdCBvZiBtZXRob2RzIHRvIGNvbnZlcnQgZnJvbSBKYXZhU2NyaXB0J3MgaW50ZXJuYWwgY2hhcmFjdGVyXG5cdFx0ICogcmVwcmVzZW50YXRpb24gKFVDUy0yKSB0byBVbmljb2RlIGNvZGUgcG9pbnRzLCBhbmQgYmFjay5cblx0XHQgKiBAc2VlIDxodHRwczovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvamF2YXNjcmlwdC1lbmNvZGluZz5cblx0XHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0XHQgKiBAdHlwZSBPYmplY3Rcblx0XHQgKi9cblx0XHQndWNzMic6IHtcblx0XHRcdCdkZWNvZGUnOiB1Y3MyZGVjb2RlLFxuXHRcdFx0J2VuY29kZSc6IHVjczJlbmNvZGVcblx0XHR9LFxuXHRcdCdkZWNvZGUnOiBkZWNvZGUsXG5cdFx0J2VuY29kZSc6IGVuY29kZSxcblx0XHQndG9BU0NJSSc6IHRvQVNDSUksXG5cdFx0J3RvVW5pY29kZSc6IHRvVW5pY29kZVxuXHR9O1xuXG5cdC8qKiBFeHBvc2UgYHB1bnljb2RlYCAqL1xuXHQvLyBTb21lIEFNRCBidWlsZCBvcHRpbWl6ZXJzLCBsaWtlIHIuanMsIGNoZWNrIGZvciBzcGVjaWZpYyBjb25kaXRpb24gcGF0dGVybnNcblx0Ly8gbGlrZSB0aGUgZm9sbG93aW5nOlxuXHRpZiAoXG5cdFx0dHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmXG5cdFx0dHlwZW9mIGRlZmluZS5hbWQgPT0gJ29iamVjdCcgJiZcblx0XHRkZWZpbmUuYW1kXG5cdCkge1xuXHRcdGRlZmluZSgncHVueWNvZGUnLCBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBwdW55Y29kZTtcblx0XHR9KTtcblx0fSBlbHNlIGlmIChmcmVlRXhwb3J0cyAmJiBmcmVlTW9kdWxlKSB7XG5cdFx0aWYgKG1vZHVsZS5leHBvcnRzID09IGZyZWVFeHBvcnRzKSB7XG5cdFx0XHQvLyBpbiBOb2RlLmpzLCBpby5qcywgb3IgUmluZ29KUyB2MC44LjArXG5cdFx0XHRmcmVlTW9kdWxlLmV4cG9ydHMgPSBwdW55Y29kZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gaW4gTmFyd2hhbCBvciBSaW5nb0pTIHYwLjcuMC1cblx0XHRcdGZvciAoa2V5IGluIHB1bnljb2RlKSB7XG5cdFx0XHRcdHB1bnljb2RlLmhhc093blByb3BlcnR5KGtleSkgJiYgKGZyZWVFeHBvcnRzW2tleV0gPSBwdW55Y29kZVtrZXldKTtcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Ly8gaW4gUmhpbm8gb3IgYSB3ZWIgYnJvd3NlclxuXHRcdHJvb3QucHVueWNvZGUgPSBwdW55Y29kZTtcblx0fVxuXG59KHRoaXMpKTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4ndXNlIHN0cmljdCc7XG5cbi8vIElmIG9iai5oYXNPd25Qcm9wZXJ0eSBoYXMgYmVlbiBvdmVycmlkZGVuLCB0aGVuIGNhbGxpbmdcbi8vIG9iai5oYXNPd25Qcm9wZXJ0eShwcm9wKSB3aWxsIGJyZWFrLlxuLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vam95ZW50L25vZGUvaXNzdWVzLzE3MDdcbmZ1bmN0aW9uIGhhc093blByb3BlcnR5KG9iaiwgcHJvcCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocXMsIHNlcCwgZXEsIG9wdGlvbnMpIHtcbiAgc2VwID0gc2VwIHx8ICcmJztcbiAgZXEgPSBlcSB8fCAnPSc7XG4gIHZhciBvYmogPSB7fTtcblxuICBpZiAodHlwZW9mIHFzICE9PSAnc3RyaW5nJyB8fCBxcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gb2JqO1xuICB9XG5cbiAgdmFyIHJlZ2V4cCA9IC9cXCsvZztcbiAgcXMgPSBxcy5zcGxpdChzZXApO1xuXG4gIHZhciBtYXhLZXlzID0gMTAwMDtcbiAgaWYgKG9wdGlvbnMgJiYgdHlwZW9mIG9wdGlvbnMubWF4S2V5cyA9PT0gJ251bWJlcicpIHtcbiAgICBtYXhLZXlzID0gb3B0aW9ucy5tYXhLZXlzO1xuICB9XG5cbiAgdmFyIGxlbiA9IHFzLmxlbmd0aDtcbiAgLy8gbWF4S2V5cyA8PSAwIG1lYW5zIHRoYXQgd2Ugc2hvdWxkIG5vdCBsaW1pdCBrZXlzIGNvdW50XG4gIGlmIChtYXhLZXlzID4gMCAmJiBsZW4gPiBtYXhLZXlzKSB7XG4gICAgbGVuID0gbWF4S2V5cztcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpIHtcbiAgICB2YXIgeCA9IHFzW2ldLnJlcGxhY2UocmVnZXhwLCAnJTIwJyksXG4gICAgICAgIGlkeCA9IHguaW5kZXhPZihlcSksXG4gICAgICAgIGtzdHIsIHZzdHIsIGssIHY7XG5cbiAgICBpZiAoaWR4ID49IDApIHtcbiAgICAgIGtzdHIgPSB4LnN1YnN0cigwLCBpZHgpO1xuICAgICAgdnN0ciA9IHguc3Vic3RyKGlkeCArIDEpO1xuICAgIH0gZWxzZSB7XG4gICAgICBrc3RyID0geDtcbiAgICAgIHZzdHIgPSAnJztcbiAgICB9XG5cbiAgICBrID0gZGVjb2RlVVJJQ29tcG9uZW50KGtzdHIpO1xuICAgIHYgPSBkZWNvZGVVUklDb21wb25lbnQodnN0cik7XG5cbiAgICBpZiAoIWhhc093blByb3BlcnR5KG9iaiwgaykpIHtcbiAgICAgIG9ialtrXSA9IHY7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KG9ialtrXSkpIHtcbiAgICAgIG9ialtrXS5wdXNoKHYpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvYmpba10gPSBbb2JqW2tdLCB2XTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gb2JqO1xufTtcblxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uICh4cykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHhzKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgc3RyaW5naWZ5UHJpbWl0aXZlID0gZnVuY3Rpb24odikge1xuICBzd2l0Y2ggKHR5cGVvZiB2KSB7XG4gICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgIHJldHVybiB2O1xuXG4gICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICByZXR1cm4gdiA/ICd0cnVlJyA6ICdmYWxzZSc7XG5cbiAgICBjYXNlICdudW1iZXInOlxuICAgICAgcmV0dXJuIGlzRmluaXRlKHYpID8gdiA6ICcnO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiAnJztcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmosIHNlcCwgZXEsIG5hbWUpIHtcbiAgc2VwID0gc2VwIHx8ICcmJztcbiAgZXEgPSBlcSB8fCAnPSc7XG4gIGlmIChvYmogPT09IG51bGwpIHtcbiAgICBvYmogPSB1bmRlZmluZWQ7XG4gIH1cblxuICBpZiAodHlwZW9mIG9iaiA9PT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gbWFwKG9iamVjdEtleXMob2JqKSwgZnVuY3Rpb24oaykge1xuICAgICAgdmFyIGtzID0gZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZShrKSkgKyBlcTtcbiAgICAgIGlmIChpc0FycmF5KG9ialtrXSkpIHtcbiAgICAgICAgcmV0dXJuIG1hcChvYmpba10sIGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICByZXR1cm4ga3MgKyBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKHYpKTtcbiAgICAgICAgfSkuam9pbihzZXApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGtzICsgZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZShvYmpba10pKTtcbiAgICAgIH1cbiAgICB9KS5qb2luKHNlcCk7XG5cbiAgfVxuXG4gIGlmICghbmFtZSkgcmV0dXJuICcnO1xuICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZShuYW1lKSkgKyBlcSArXG4gICAgICAgICBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKG9iaikpO1xufTtcblxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uICh4cykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHhzKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG5cbmZ1bmN0aW9uIG1hcCAoeHMsIGYpIHtcbiAgaWYgKHhzLm1hcCkgcmV0dXJuIHhzLm1hcChmKTtcbiAgdmFyIHJlcyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgcmVzLnB1c2goZih4c1tpXSwgaSkpO1xuICB9XG4gIHJldHVybiByZXM7XG59XG5cbnZhciBvYmplY3RLZXlzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24gKG9iaikge1xuICB2YXIgcmVzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkgcmVzLnB1c2goa2V5KTtcbiAgfVxuICByZXR1cm4gcmVzO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5kZWNvZGUgPSBleHBvcnRzLnBhcnNlID0gcmVxdWlyZSgnLi9kZWNvZGUnKTtcbmV4cG9ydHMuZW5jb2RlID0gZXhwb3J0cy5zdHJpbmdpZnkgPSByZXF1aXJlKCcuL2VuY29kZScpO1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHB1bnljb2RlID0gcmVxdWlyZSgncHVueWNvZGUnKTtcbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbmV4cG9ydHMucGFyc2UgPSB1cmxQYXJzZTtcbmV4cG9ydHMucmVzb2x2ZSA9IHVybFJlc29sdmU7XG5leHBvcnRzLnJlc29sdmVPYmplY3QgPSB1cmxSZXNvbHZlT2JqZWN0O1xuZXhwb3J0cy5mb3JtYXQgPSB1cmxGb3JtYXQ7XG5cbmV4cG9ydHMuVXJsID0gVXJsO1xuXG5mdW5jdGlvbiBVcmwoKSB7XG4gIHRoaXMucHJvdG9jb2wgPSBudWxsO1xuICB0aGlzLnNsYXNoZXMgPSBudWxsO1xuICB0aGlzLmF1dGggPSBudWxsO1xuICB0aGlzLmhvc3QgPSBudWxsO1xuICB0aGlzLnBvcnQgPSBudWxsO1xuICB0aGlzLmhvc3RuYW1lID0gbnVsbDtcbiAgdGhpcy5oYXNoID0gbnVsbDtcbiAgdGhpcy5zZWFyY2ggPSBudWxsO1xuICB0aGlzLnF1ZXJ5ID0gbnVsbDtcbiAgdGhpcy5wYXRobmFtZSA9IG51bGw7XG4gIHRoaXMucGF0aCA9IG51bGw7XG4gIHRoaXMuaHJlZiA9IG51bGw7XG59XG5cbi8vIFJlZmVyZW5jZTogUkZDIDM5ODYsIFJGQyAxODA4LCBSRkMgMjM5NlxuXG4vLyBkZWZpbmUgdGhlc2UgaGVyZSBzbyBhdCBsZWFzdCB0aGV5IG9ubHkgaGF2ZSB0byBiZVxuLy8gY29tcGlsZWQgb25jZSBvbiB0aGUgZmlyc3QgbW9kdWxlIGxvYWQuXG52YXIgcHJvdG9jb2xQYXR0ZXJuID0gL14oW2EtejAtOS4rLV0rOikvaSxcbiAgICBwb3J0UGF0dGVybiA9IC86WzAtOV0qJC8sXG5cbiAgICAvLyBTcGVjaWFsIGNhc2UgZm9yIGEgc2ltcGxlIHBhdGggVVJMXG4gICAgc2ltcGxlUGF0aFBhdHRlcm4gPSAvXihcXC9cXC8/KD8hXFwvKVteXFw/XFxzXSopKFxcP1teXFxzXSopPyQvLFxuXG4gICAgLy8gUkZDIDIzOTY6IGNoYXJhY3RlcnMgcmVzZXJ2ZWQgZm9yIGRlbGltaXRpbmcgVVJMcy5cbiAgICAvLyBXZSBhY3R1YWxseSBqdXN0IGF1dG8tZXNjYXBlIHRoZXNlLlxuICAgIGRlbGltcyA9IFsnPCcsICc+JywgJ1wiJywgJ2AnLCAnICcsICdcXHInLCAnXFxuJywgJ1xcdCddLFxuXG4gICAgLy8gUkZDIDIzOTY6IGNoYXJhY3RlcnMgbm90IGFsbG93ZWQgZm9yIHZhcmlvdXMgcmVhc29ucy5cbiAgICB1bndpc2UgPSBbJ3snLCAnfScsICd8JywgJ1xcXFwnLCAnXicsICdgJ10uY29uY2F0KGRlbGltcyksXG5cbiAgICAvLyBBbGxvd2VkIGJ5IFJGQ3MsIGJ1dCBjYXVzZSBvZiBYU1MgYXR0YWNrcy4gIEFsd2F5cyBlc2NhcGUgdGhlc2UuXG4gICAgYXV0b0VzY2FwZSA9IFsnXFwnJ10uY29uY2F0KHVud2lzZSksXG4gICAgLy8gQ2hhcmFjdGVycyB0aGF0IGFyZSBuZXZlciBldmVyIGFsbG93ZWQgaW4gYSBob3N0bmFtZS5cbiAgICAvLyBOb3RlIHRoYXQgYW55IGludmFsaWQgY2hhcnMgYXJlIGFsc28gaGFuZGxlZCwgYnV0IHRoZXNlXG4gICAgLy8gYXJlIHRoZSBvbmVzIHRoYXQgYXJlICpleHBlY3RlZCogdG8gYmUgc2Vlbiwgc28gd2UgZmFzdC1wYXRoXG4gICAgLy8gdGhlbS5cbiAgICBub25Ib3N0Q2hhcnMgPSBbJyUnLCAnLycsICc/JywgJzsnLCAnIyddLmNvbmNhdChhdXRvRXNjYXBlKSxcbiAgICBob3N0RW5kaW5nQ2hhcnMgPSBbJy8nLCAnPycsICcjJ10sXG4gICAgaG9zdG5hbWVNYXhMZW4gPSAyNTUsXG4gICAgaG9zdG5hbWVQYXJ0UGF0dGVybiA9IC9eWythLXowLTlBLVpfLV17MCw2M30kLyxcbiAgICBob3N0bmFtZVBhcnRTdGFydCA9IC9eKFsrYS16MC05QS1aXy1dezAsNjN9KSguKikkLyxcbiAgICAvLyBwcm90b2NvbHMgdGhhdCBjYW4gYWxsb3cgXCJ1bnNhZmVcIiBhbmQgXCJ1bndpc2VcIiBjaGFycy5cbiAgICB1bnNhZmVQcm90b2NvbCA9IHtcbiAgICAgICdqYXZhc2NyaXB0JzogdHJ1ZSxcbiAgICAgICdqYXZhc2NyaXB0Oic6IHRydWVcbiAgICB9LFxuICAgIC8vIHByb3RvY29scyB0aGF0IG5ldmVyIGhhdmUgYSBob3N0bmFtZS5cbiAgICBob3N0bGVzc1Byb3RvY29sID0ge1xuICAgICAgJ2phdmFzY3JpcHQnOiB0cnVlLFxuICAgICAgJ2phdmFzY3JpcHQ6JzogdHJ1ZVxuICAgIH0sXG4gICAgLy8gcHJvdG9jb2xzIHRoYXQgYWx3YXlzIGNvbnRhaW4gYSAvLyBiaXQuXG4gICAgc2xhc2hlZFByb3RvY29sID0ge1xuICAgICAgJ2h0dHAnOiB0cnVlLFxuICAgICAgJ2h0dHBzJzogdHJ1ZSxcbiAgICAgICdmdHAnOiB0cnVlLFxuICAgICAgJ2dvcGhlcic6IHRydWUsXG4gICAgICAnZmlsZSc6IHRydWUsXG4gICAgICAnaHR0cDonOiB0cnVlLFxuICAgICAgJ2h0dHBzOic6IHRydWUsXG4gICAgICAnZnRwOic6IHRydWUsXG4gICAgICAnZ29waGVyOic6IHRydWUsXG4gICAgICAnZmlsZTonOiB0cnVlXG4gICAgfSxcbiAgICBxdWVyeXN0cmluZyA9IHJlcXVpcmUoJ3F1ZXJ5c3RyaW5nJyk7XG5cbmZ1bmN0aW9uIHVybFBhcnNlKHVybCwgcGFyc2VRdWVyeVN0cmluZywgc2xhc2hlc0Rlbm90ZUhvc3QpIHtcbiAgaWYgKHVybCAmJiB1dGlsLmlzT2JqZWN0KHVybCkgJiYgdXJsIGluc3RhbmNlb2YgVXJsKSByZXR1cm4gdXJsO1xuXG4gIHZhciB1ID0gbmV3IFVybDtcbiAgdS5wYXJzZSh1cmwsIHBhcnNlUXVlcnlTdHJpbmcsIHNsYXNoZXNEZW5vdGVIb3N0KTtcbiAgcmV0dXJuIHU7XG59XG5cblVybC5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbih1cmwsIHBhcnNlUXVlcnlTdHJpbmcsIHNsYXNoZXNEZW5vdGVIb3N0KSB7XG4gIGlmICghdXRpbC5pc1N0cmluZyh1cmwpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlBhcmFtZXRlciAndXJsJyBtdXN0IGJlIGEgc3RyaW5nLCBub3QgXCIgKyB0eXBlb2YgdXJsKTtcbiAgfVxuXG4gIC8vIENvcHkgY2hyb21lLCBJRSwgb3BlcmEgYmFja3NsYXNoLWhhbmRsaW5nIGJlaGF2aW9yLlxuICAvLyBCYWNrIHNsYXNoZXMgYmVmb3JlIHRoZSBxdWVyeSBzdHJpbmcgZ2V0IGNvbnZlcnRlZCB0byBmb3J3YXJkIHNsYXNoZXNcbiAgLy8gU2VlOiBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9MjU5MTZcbiAgdmFyIHF1ZXJ5SW5kZXggPSB1cmwuaW5kZXhPZignPycpLFxuICAgICAgc3BsaXR0ZXIgPVxuICAgICAgICAgIChxdWVyeUluZGV4ICE9PSAtMSAmJiBxdWVyeUluZGV4IDwgdXJsLmluZGV4T2YoJyMnKSkgPyAnPycgOiAnIycsXG4gICAgICB1U3BsaXQgPSB1cmwuc3BsaXQoc3BsaXR0ZXIpLFxuICAgICAgc2xhc2hSZWdleCA9IC9cXFxcL2c7XG4gIHVTcGxpdFswXSA9IHVTcGxpdFswXS5yZXBsYWNlKHNsYXNoUmVnZXgsICcvJyk7XG4gIHVybCA9IHVTcGxpdC5qb2luKHNwbGl0dGVyKTtcblxuICB2YXIgcmVzdCA9IHVybDtcblxuICAvLyB0cmltIGJlZm9yZSBwcm9jZWVkaW5nLlxuICAvLyBUaGlzIGlzIHRvIHN1cHBvcnQgcGFyc2Ugc3R1ZmYgbGlrZSBcIiAgaHR0cDovL2Zvby5jb20gIFxcblwiXG4gIHJlc3QgPSByZXN0LnRyaW0oKTtcblxuICBpZiAoIXNsYXNoZXNEZW5vdGVIb3N0ICYmIHVybC5zcGxpdCgnIycpLmxlbmd0aCA9PT0gMSkge1xuICAgIC8vIFRyeSBmYXN0IHBhdGggcmVnZXhwXG4gICAgdmFyIHNpbXBsZVBhdGggPSBzaW1wbGVQYXRoUGF0dGVybi5leGVjKHJlc3QpO1xuICAgIGlmIChzaW1wbGVQYXRoKSB7XG4gICAgICB0aGlzLnBhdGggPSByZXN0O1xuICAgICAgdGhpcy5ocmVmID0gcmVzdDtcbiAgICAgIHRoaXMucGF0aG5hbWUgPSBzaW1wbGVQYXRoWzFdO1xuICAgICAgaWYgKHNpbXBsZVBhdGhbMl0pIHtcbiAgICAgICAgdGhpcy5zZWFyY2ggPSBzaW1wbGVQYXRoWzJdO1xuICAgICAgICBpZiAocGFyc2VRdWVyeVN0cmluZykge1xuICAgICAgICAgIHRoaXMucXVlcnkgPSBxdWVyeXN0cmluZy5wYXJzZSh0aGlzLnNlYXJjaC5zdWJzdHIoMSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucXVlcnkgPSB0aGlzLnNlYXJjaC5zdWJzdHIoMSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAocGFyc2VRdWVyeVN0cmluZykge1xuICAgICAgICB0aGlzLnNlYXJjaCA9ICcnO1xuICAgICAgICB0aGlzLnF1ZXJ5ID0ge307XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH1cblxuICB2YXIgcHJvdG8gPSBwcm90b2NvbFBhdHRlcm4uZXhlYyhyZXN0KTtcbiAgaWYgKHByb3RvKSB7XG4gICAgcHJvdG8gPSBwcm90b1swXTtcbiAgICB2YXIgbG93ZXJQcm90byA9IHByb3RvLnRvTG93ZXJDYXNlKCk7XG4gICAgdGhpcy5wcm90b2NvbCA9IGxvd2VyUHJvdG87XG4gICAgcmVzdCA9IHJlc3Quc3Vic3RyKHByb3RvLmxlbmd0aCk7XG4gIH1cblxuICAvLyBmaWd1cmUgb3V0IGlmIGl0J3MgZ290IGEgaG9zdFxuICAvLyB1c2VyQHNlcnZlciBpcyAqYWx3YXlzKiBpbnRlcnByZXRlZCBhcyBhIGhvc3RuYW1lLCBhbmQgdXJsXG4gIC8vIHJlc29sdXRpb24gd2lsbCB0cmVhdCAvL2Zvby9iYXIgYXMgaG9zdD1mb28scGF0aD1iYXIgYmVjYXVzZSB0aGF0J3NcbiAgLy8gaG93IHRoZSBicm93c2VyIHJlc29sdmVzIHJlbGF0aXZlIFVSTHMuXG4gIGlmIChzbGFzaGVzRGVub3RlSG9zdCB8fCBwcm90byB8fCByZXN0Lm1hdGNoKC9eXFwvXFwvW15AXFwvXStAW15AXFwvXSsvKSkge1xuICAgIHZhciBzbGFzaGVzID0gcmVzdC5zdWJzdHIoMCwgMikgPT09ICcvLyc7XG4gICAgaWYgKHNsYXNoZXMgJiYgIShwcm90byAmJiBob3N0bGVzc1Byb3RvY29sW3Byb3RvXSkpIHtcbiAgICAgIHJlc3QgPSByZXN0LnN1YnN0cigyKTtcbiAgICAgIHRoaXMuc2xhc2hlcyA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFob3N0bGVzc1Byb3RvY29sW3Byb3RvXSAmJlxuICAgICAgKHNsYXNoZXMgfHwgKHByb3RvICYmICFzbGFzaGVkUHJvdG9jb2xbcHJvdG9dKSkpIHtcblxuICAgIC8vIHRoZXJlJ3MgYSBob3N0bmFtZS5cbiAgICAvLyB0aGUgZmlyc3QgaW5zdGFuY2Ugb2YgLywgPywgOywgb3IgIyBlbmRzIHRoZSBob3N0LlxuICAgIC8vXG4gICAgLy8gSWYgdGhlcmUgaXMgYW4gQCBpbiB0aGUgaG9zdG5hbWUsIHRoZW4gbm9uLWhvc3QgY2hhcnMgKmFyZSogYWxsb3dlZFxuICAgIC8vIHRvIHRoZSBsZWZ0IG9mIHRoZSBsYXN0IEAgc2lnbiwgdW5sZXNzIHNvbWUgaG9zdC1lbmRpbmcgY2hhcmFjdGVyXG4gICAgLy8gY29tZXMgKmJlZm9yZSogdGhlIEAtc2lnbi5cbiAgICAvLyBVUkxzIGFyZSBvYm5veGlvdXMuXG4gICAgLy9cbiAgICAvLyBleDpcbiAgICAvLyBodHRwOi8vYUBiQGMvID0+IHVzZXI6YUBiIGhvc3Q6Y1xuICAgIC8vIGh0dHA6Ly9hQGI/QGMgPT4gdXNlcjphIGhvc3Q6YyBwYXRoOi8/QGNcblxuICAgIC8vIHYwLjEyIFRPRE8oaXNhYWNzKTogVGhpcyBpcyBub3QgcXVpdGUgaG93IENocm9tZSBkb2VzIHRoaW5ncy5cbiAgICAvLyBSZXZpZXcgb3VyIHRlc3QgY2FzZSBhZ2FpbnN0IGJyb3dzZXJzIG1vcmUgY29tcHJlaGVuc2l2ZWx5LlxuXG4gICAgLy8gZmluZCB0aGUgZmlyc3QgaW5zdGFuY2Ugb2YgYW55IGhvc3RFbmRpbmdDaGFyc1xuICAgIHZhciBob3N0RW5kID0gLTE7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBob3N0RW5kaW5nQ2hhcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBoZWMgPSByZXN0LmluZGV4T2YoaG9zdEVuZGluZ0NoYXJzW2ldKTtcbiAgICAgIGlmIChoZWMgIT09IC0xICYmIChob3N0RW5kID09PSAtMSB8fCBoZWMgPCBob3N0RW5kKSlcbiAgICAgICAgaG9zdEVuZCA9IGhlYztcbiAgICB9XG5cbiAgICAvLyBhdCB0aGlzIHBvaW50LCBlaXRoZXIgd2UgaGF2ZSBhbiBleHBsaWNpdCBwb2ludCB3aGVyZSB0aGVcbiAgICAvLyBhdXRoIHBvcnRpb24gY2Fubm90IGdvIHBhc3QsIG9yIHRoZSBsYXN0IEAgY2hhciBpcyB0aGUgZGVjaWRlci5cbiAgICB2YXIgYXV0aCwgYXRTaWduO1xuICAgIGlmIChob3N0RW5kID09PSAtMSkge1xuICAgICAgLy8gYXRTaWduIGNhbiBiZSBhbnl3aGVyZS5cbiAgICAgIGF0U2lnbiA9IHJlc3QubGFzdEluZGV4T2YoJ0AnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gYXRTaWduIG11c3QgYmUgaW4gYXV0aCBwb3J0aW9uLlxuICAgICAgLy8gaHR0cDovL2FAYi9jQGQgPT4gaG9zdDpiIGF1dGg6YSBwYXRoOi9jQGRcbiAgICAgIGF0U2lnbiA9IHJlc3QubGFzdEluZGV4T2YoJ0AnLCBob3N0RW5kKTtcbiAgICB9XG5cbiAgICAvLyBOb3cgd2UgaGF2ZSBhIHBvcnRpb24gd2hpY2ggaXMgZGVmaW5pdGVseSB0aGUgYXV0aC5cbiAgICAvLyBQdWxsIHRoYXQgb2ZmLlxuICAgIGlmIChhdFNpZ24gIT09IC0xKSB7XG4gICAgICBhdXRoID0gcmVzdC5zbGljZSgwLCBhdFNpZ24pO1xuICAgICAgcmVzdCA9IHJlc3Quc2xpY2UoYXRTaWduICsgMSk7XG4gICAgICB0aGlzLmF1dGggPSBkZWNvZGVVUklDb21wb25lbnQoYXV0aCk7XG4gICAgfVxuXG4gICAgLy8gdGhlIGhvc3QgaXMgdGhlIHJlbWFpbmluZyB0byB0aGUgbGVmdCBvZiB0aGUgZmlyc3Qgbm9uLWhvc3QgY2hhclxuICAgIGhvc3RFbmQgPSAtMTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vbkhvc3RDaGFycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGhlYyA9IHJlc3QuaW5kZXhPZihub25Ib3N0Q2hhcnNbaV0pO1xuICAgICAgaWYgKGhlYyAhPT0gLTEgJiYgKGhvc3RFbmQgPT09IC0xIHx8IGhlYyA8IGhvc3RFbmQpKVxuICAgICAgICBob3N0RW5kID0gaGVjO1xuICAgIH1cbiAgICAvLyBpZiB3ZSBzdGlsbCBoYXZlIG5vdCBoaXQgaXQsIHRoZW4gdGhlIGVudGlyZSB0aGluZyBpcyBhIGhvc3QuXG4gICAgaWYgKGhvc3RFbmQgPT09IC0xKVxuICAgICAgaG9zdEVuZCA9IHJlc3QubGVuZ3RoO1xuXG4gICAgdGhpcy5ob3N0ID0gcmVzdC5zbGljZSgwLCBob3N0RW5kKTtcbiAgICByZXN0ID0gcmVzdC5zbGljZShob3N0RW5kKTtcblxuICAgIC8vIHB1bGwgb3V0IHBvcnQuXG4gICAgdGhpcy5wYXJzZUhvc3QoKTtcblxuICAgIC8vIHdlJ3ZlIGluZGljYXRlZCB0aGF0IHRoZXJlIGlzIGEgaG9zdG5hbWUsXG4gICAgLy8gc28gZXZlbiBpZiBpdCdzIGVtcHR5LCBpdCBoYXMgdG8gYmUgcHJlc2VudC5cbiAgICB0aGlzLmhvc3RuYW1lID0gdGhpcy5ob3N0bmFtZSB8fCAnJztcblxuICAgIC8vIGlmIGhvc3RuYW1lIGJlZ2lucyB3aXRoIFsgYW5kIGVuZHMgd2l0aCBdXG4gICAgLy8gYXNzdW1lIHRoYXQgaXQncyBhbiBJUHY2IGFkZHJlc3MuXG4gICAgdmFyIGlwdjZIb3N0bmFtZSA9IHRoaXMuaG9zdG5hbWVbMF0gPT09ICdbJyAmJlxuICAgICAgICB0aGlzLmhvc3RuYW1lW3RoaXMuaG9zdG5hbWUubGVuZ3RoIC0gMV0gPT09ICddJztcblxuICAgIC8vIHZhbGlkYXRlIGEgbGl0dGxlLlxuICAgIGlmICghaXB2Nkhvc3RuYW1lKSB7XG4gICAgICB2YXIgaG9zdHBhcnRzID0gdGhpcy5ob3N0bmFtZS5zcGxpdCgvXFwuLyk7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGhvc3RwYXJ0cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIHBhcnQgPSBob3N0cGFydHNbaV07XG4gICAgICAgIGlmICghcGFydCkgY29udGludWU7XG4gICAgICAgIGlmICghcGFydC5tYXRjaChob3N0bmFtZVBhcnRQYXR0ZXJuKSkge1xuICAgICAgICAgIHZhciBuZXdwYXJ0ID0gJyc7XG4gICAgICAgICAgZm9yICh2YXIgaiA9IDAsIGsgPSBwYXJ0Lmxlbmd0aDsgaiA8IGs7IGorKykge1xuICAgICAgICAgICAgaWYgKHBhcnQuY2hhckNvZGVBdChqKSA+IDEyNykge1xuICAgICAgICAgICAgICAvLyB3ZSByZXBsYWNlIG5vbi1BU0NJSSBjaGFyIHdpdGggYSB0ZW1wb3JhcnkgcGxhY2Vob2xkZXJcbiAgICAgICAgICAgICAgLy8gd2UgbmVlZCB0aGlzIHRvIG1ha2Ugc3VyZSBzaXplIG9mIGhvc3RuYW1lIGlzIG5vdFxuICAgICAgICAgICAgICAvLyBicm9rZW4gYnkgcmVwbGFjaW5nIG5vbi1BU0NJSSBieSBub3RoaW5nXG4gICAgICAgICAgICAgIG5ld3BhcnQgKz0gJ3gnO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgbmV3cGFydCArPSBwYXJ0W2pdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICAvLyB3ZSB0ZXN0IGFnYWluIHdpdGggQVNDSUkgY2hhciBvbmx5XG4gICAgICAgICAgaWYgKCFuZXdwYXJ0Lm1hdGNoKGhvc3RuYW1lUGFydFBhdHRlcm4pKSB7XG4gICAgICAgICAgICB2YXIgdmFsaWRQYXJ0cyA9IGhvc3RwYXJ0cy5zbGljZSgwLCBpKTtcbiAgICAgICAgICAgIHZhciBub3RIb3N0ID0gaG9zdHBhcnRzLnNsaWNlKGkgKyAxKTtcbiAgICAgICAgICAgIHZhciBiaXQgPSBwYXJ0Lm1hdGNoKGhvc3RuYW1lUGFydFN0YXJ0KTtcbiAgICAgICAgICAgIGlmIChiaXQpIHtcbiAgICAgICAgICAgICAgdmFsaWRQYXJ0cy5wdXNoKGJpdFsxXSk7XG4gICAgICAgICAgICAgIG5vdEhvc3QudW5zaGlmdChiaXRbMl0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5vdEhvc3QubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIHJlc3QgPSAnLycgKyBub3RIb3N0LmpvaW4oJy4nKSArIHJlc3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmhvc3RuYW1lID0gdmFsaWRQYXJ0cy5qb2luKCcuJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5ob3N0bmFtZS5sZW5ndGggPiBob3N0bmFtZU1heExlbikge1xuICAgICAgdGhpcy5ob3N0bmFtZSA9ICcnO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBob3N0bmFtZXMgYXJlIGFsd2F5cyBsb3dlciBjYXNlLlxuICAgICAgdGhpcy5ob3N0bmFtZSA9IHRoaXMuaG9zdG5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICB9XG5cbiAgICBpZiAoIWlwdjZIb3N0bmFtZSkge1xuICAgICAgLy8gSUROQSBTdXBwb3J0OiBSZXR1cm5zIGEgcHVueWNvZGVkIHJlcHJlc2VudGF0aW9uIG9mIFwiZG9tYWluXCIuXG4gICAgICAvLyBJdCBvbmx5IGNvbnZlcnRzIHBhcnRzIG9mIHRoZSBkb21haW4gbmFtZSB0aGF0XG4gICAgICAvLyBoYXZlIG5vbi1BU0NJSSBjaGFyYWN0ZXJzLCBpLmUuIGl0IGRvZXNuJ3QgbWF0dGVyIGlmXG4gICAgICAvLyB5b3UgY2FsbCBpdCB3aXRoIGEgZG9tYWluIHRoYXQgYWxyZWFkeSBpcyBBU0NJSS1vbmx5LlxuICAgICAgdGhpcy5ob3N0bmFtZSA9IHB1bnljb2RlLnRvQVNDSUkodGhpcy5ob3N0bmFtZSk7XG4gICAgfVxuXG4gICAgdmFyIHAgPSB0aGlzLnBvcnQgPyAnOicgKyB0aGlzLnBvcnQgOiAnJztcbiAgICB2YXIgaCA9IHRoaXMuaG9zdG5hbWUgfHwgJyc7XG4gICAgdGhpcy5ob3N0ID0gaCArIHA7XG4gICAgdGhpcy5ocmVmICs9IHRoaXMuaG9zdDtcblxuICAgIC8vIHN0cmlwIFsgYW5kIF0gZnJvbSB0aGUgaG9zdG5hbWVcbiAgICAvLyB0aGUgaG9zdCBmaWVsZCBzdGlsbCByZXRhaW5zIHRoZW0sIHRob3VnaFxuICAgIGlmIChpcHY2SG9zdG5hbWUpIHtcbiAgICAgIHRoaXMuaG9zdG5hbWUgPSB0aGlzLmhvc3RuYW1lLnN1YnN0cigxLCB0aGlzLmhvc3RuYW1lLmxlbmd0aCAtIDIpO1xuICAgICAgaWYgKHJlc3RbMF0gIT09ICcvJykge1xuICAgICAgICByZXN0ID0gJy8nICsgcmVzdDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBub3cgcmVzdCBpcyBzZXQgdG8gdGhlIHBvc3QtaG9zdCBzdHVmZi5cbiAgLy8gY2hvcCBvZmYgYW55IGRlbGltIGNoYXJzLlxuICBpZiAoIXVuc2FmZVByb3RvY29sW2xvd2VyUHJvdG9dKSB7XG5cbiAgICAvLyBGaXJzdCwgbWFrZSAxMDAlIHN1cmUgdGhhdCBhbnkgXCJhdXRvRXNjYXBlXCIgY2hhcnMgZ2V0XG4gICAgLy8gZXNjYXBlZCwgZXZlbiBpZiBlbmNvZGVVUklDb21wb25lbnQgZG9lc24ndCB0aGluayB0aGV5XG4gICAgLy8gbmVlZCB0byBiZS5cbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGF1dG9Fc2NhcGUubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB2YXIgYWUgPSBhdXRvRXNjYXBlW2ldO1xuICAgICAgaWYgKHJlc3QuaW5kZXhPZihhZSkgPT09IC0xKVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIHZhciBlc2MgPSBlbmNvZGVVUklDb21wb25lbnQoYWUpO1xuICAgICAgaWYgKGVzYyA9PT0gYWUpIHtcbiAgICAgICAgZXNjID0gZXNjYXBlKGFlKTtcbiAgICAgIH1cbiAgICAgIHJlc3QgPSByZXN0LnNwbGl0KGFlKS5qb2luKGVzYyk7XG4gICAgfVxuICB9XG5cblxuICAvLyBjaG9wIG9mZiBmcm9tIHRoZSB0YWlsIGZpcnN0LlxuICB2YXIgaGFzaCA9IHJlc3QuaW5kZXhPZignIycpO1xuICBpZiAoaGFzaCAhPT0gLTEpIHtcbiAgICAvLyBnb3QgYSBmcmFnbWVudCBzdHJpbmcuXG4gICAgdGhpcy5oYXNoID0gcmVzdC5zdWJzdHIoaGFzaCk7XG4gICAgcmVzdCA9IHJlc3Quc2xpY2UoMCwgaGFzaCk7XG4gIH1cbiAgdmFyIHFtID0gcmVzdC5pbmRleE9mKCc/Jyk7XG4gIGlmIChxbSAhPT0gLTEpIHtcbiAgICB0aGlzLnNlYXJjaCA9IHJlc3Quc3Vic3RyKHFtKTtcbiAgICB0aGlzLnF1ZXJ5ID0gcmVzdC5zdWJzdHIocW0gKyAxKTtcbiAgICBpZiAocGFyc2VRdWVyeVN0cmluZykge1xuICAgICAgdGhpcy5xdWVyeSA9IHF1ZXJ5c3RyaW5nLnBhcnNlKHRoaXMucXVlcnkpO1xuICAgIH1cbiAgICByZXN0ID0gcmVzdC5zbGljZSgwLCBxbSk7XG4gIH0gZWxzZSBpZiAocGFyc2VRdWVyeVN0cmluZykge1xuICAgIC8vIG5vIHF1ZXJ5IHN0cmluZywgYnV0IHBhcnNlUXVlcnlTdHJpbmcgc3RpbGwgcmVxdWVzdGVkXG4gICAgdGhpcy5zZWFyY2ggPSAnJztcbiAgICB0aGlzLnF1ZXJ5ID0ge307XG4gIH1cbiAgaWYgKHJlc3QpIHRoaXMucGF0aG5hbWUgPSByZXN0O1xuICBpZiAoc2xhc2hlZFByb3RvY29sW2xvd2VyUHJvdG9dICYmXG4gICAgICB0aGlzLmhvc3RuYW1lICYmICF0aGlzLnBhdGhuYW1lKSB7XG4gICAgdGhpcy5wYXRobmFtZSA9ICcvJztcbiAgfVxuXG4gIC8vdG8gc3VwcG9ydCBodHRwLnJlcXVlc3RcbiAgaWYgKHRoaXMucGF0aG5hbWUgfHwgdGhpcy5zZWFyY2gpIHtcbiAgICB2YXIgcCA9IHRoaXMucGF0aG5hbWUgfHwgJyc7XG4gICAgdmFyIHMgPSB0aGlzLnNlYXJjaCB8fCAnJztcbiAgICB0aGlzLnBhdGggPSBwICsgcztcbiAgfVxuXG4gIC8vIGZpbmFsbHksIHJlY29uc3RydWN0IHRoZSBocmVmIGJhc2VkIG9uIHdoYXQgaGFzIGJlZW4gdmFsaWRhdGVkLlxuICB0aGlzLmhyZWYgPSB0aGlzLmZvcm1hdCgpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGZvcm1hdCBhIHBhcnNlZCBvYmplY3QgaW50byBhIHVybCBzdHJpbmdcbmZ1bmN0aW9uIHVybEZvcm1hdChvYmopIHtcbiAgLy8gZW5zdXJlIGl0J3MgYW4gb2JqZWN0LCBhbmQgbm90IGEgc3RyaW5nIHVybC5cbiAgLy8gSWYgaXQncyBhbiBvYmosIHRoaXMgaXMgYSBuby1vcC5cbiAgLy8gdGhpcyB3YXksIHlvdSBjYW4gY2FsbCB1cmxfZm9ybWF0KCkgb24gc3RyaW5nc1xuICAvLyB0byBjbGVhbiB1cCBwb3RlbnRpYWxseSB3b25reSB1cmxzLlxuICBpZiAodXRpbC5pc1N0cmluZyhvYmopKSBvYmogPSB1cmxQYXJzZShvYmopO1xuICBpZiAoIShvYmogaW5zdGFuY2VvZiBVcmwpKSByZXR1cm4gVXJsLnByb3RvdHlwZS5mb3JtYXQuY2FsbChvYmopO1xuICByZXR1cm4gb2JqLmZvcm1hdCgpO1xufVxuXG5VcmwucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgYXV0aCA9IHRoaXMuYXV0aCB8fCAnJztcbiAgaWYgKGF1dGgpIHtcbiAgICBhdXRoID0gZW5jb2RlVVJJQ29tcG9uZW50KGF1dGgpO1xuICAgIGF1dGggPSBhdXRoLnJlcGxhY2UoLyUzQS9pLCAnOicpO1xuICAgIGF1dGggKz0gJ0AnO1xuICB9XG5cbiAgdmFyIHByb3RvY29sID0gdGhpcy5wcm90b2NvbCB8fCAnJyxcbiAgICAgIHBhdGhuYW1lID0gdGhpcy5wYXRobmFtZSB8fCAnJyxcbiAgICAgIGhhc2ggPSB0aGlzLmhhc2ggfHwgJycsXG4gICAgICBob3N0ID0gZmFsc2UsXG4gICAgICBxdWVyeSA9ICcnO1xuXG4gIGlmICh0aGlzLmhvc3QpIHtcbiAgICBob3N0ID0gYXV0aCArIHRoaXMuaG9zdDtcbiAgfSBlbHNlIGlmICh0aGlzLmhvc3RuYW1lKSB7XG4gICAgaG9zdCA9IGF1dGggKyAodGhpcy5ob3N0bmFtZS5pbmRleE9mKCc6JykgPT09IC0xID9cbiAgICAgICAgdGhpcy5ob3N0bmFtZSA6XG4gICAgICAgICdbJyArIHRoaXMuaG9zdG5hbWUgKyAnXScpO1xuICAgIGlmICh0aGlzLnBvcnQpIHtcbiAgICAgIGhvc3QgKz0gJzonICsgdGhpcy5wb3J0O1xuICAgIH1cbiAgfVxuXG4gIGlmICh0aGlzLnF1ZXJ5ICYmXG4gICAgICB1dGlsLmlzT2JqZWN0KHRoaXMucXVlcnkpICYmXG4gICAgICBPYmplY3Qua2V5cyh0aGlzLnF1ZXJ5KS5sZW5ndGgpIHtcbiAgICBxdWVyeSA9IHF1ZXJ5c3RyaW5nLnN0cmluZ2lmeSh0aGlzLnF1ZXJ5KTtcbiAgfVxuXG4gIHZhciBzZWFyY2ggPSB0aGlzLnNlYXJjaCB8fCAocXVlcnkgJiYgKCc/JyArIHF1ZXJ5KSkgfHwgJyc7XG5cbiAgaWYgKHByb3RvY29sICYmIHByb3RvY29sLnN1YnN0cigtMSkgIT09ICc6JykgcHJvdG9jb2wgKz0gJzonO1xuXG4gIC8vIG9ubHkgdGhlIHNsYXNoZWRQcm90b2NvbHMgZ2V0IHRoZSAvLy4gIE5vdCBtYWlsdG86LCB4bXBwOiwgZXRjLlxuICAvLyB1bmxlc3MgdGhleSBoYWQgdGhlbSB0byBiZWdpbiB3aXRoLlxuICBpZiAodGhpcy5zbGFzaGVzIHx8XG4gICAgICAoIXByb3RvY29sIHx8IHNsYXNoZWRQcm90b2NvbFtwcm90b2NvbF0pICYmIGhvc3QgIT09IGZhbHNlKSB7XG4gICAgaG9zdCA9ICcvLycgKyAoaG9zdCB8fCAnJyk7XG4gICAgaWYgKHBhdGhuYW1lICYmIHBhdGhuYW1lLmNoYXJBdCgwKSAhPT0gJy8nKSBwYXRobmFtZSA9ICcvJyArIHBhdGhuYW1lO1xuICB9IGVsc2UgaWYgKCFob3N0KSB7XG4gICAgaG9zdCA9ICcnO1xuICB9XG5cbiAgaWYgKGhhc2ggJiYgaGFzaC5jaGFyQXQoMCkgIT09ICcjJykgaGFzaCA9ICcjJyArIGhhc2g7XG4gIGlmIChzZWFyY2ggJiYgc2VhcmNoLmNoYXJBdCgwKSAhPT0gJz8nKSBzZWFyY2ggPSAnPycgKyBzZWFyY2g7XG5cbiAgcGF0aG5hbWUgPSBwYXRobmFtZS5yZXBsYWNlKC9bPyNdL2csIGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChtYXRjaCk7XG4gIH0pO1xuICBzZWFyY2ggPSBzZWFyY2gucmVwbGFjZSgnIycsICclMjMnKTtcblxuICByZXR1cm4gcHJvdG9jb2wgKyBob3N0ICsgcGF0aG5hbWUgKyBzZWFyY2ggKyBoYXNoO1xufTtcblxuZnVuY3Rpb24gdXJsUmVzb2x2ZShzb3VyY2UsIHJlbGF0aXZlKSB7XG4gIHJldHVybiB1cmxQYXJzZShzb3VyY2UsIGZhbHNlLCB0cnVlKS5yZXNvbHZlKHJlbGF0aXZlKTtcbn1cblxuVXJsLnByb3RvdHlwZS5yZXNvbHZlID0gZnVuY3Rpb24ocmVsYXRpdmUpIHtcbiAgcmV0dXJuIHRoaXMucmVzb2x2ZU9iamVjdCh1cmxQYXJzZShyZWxhdGl2ZSwgZmFsc2UsIHRydWUpKS5mb3JtYXQoKTtcbn07XG5cbmZ1bmN0aW9uIHVybFJlc29sdmVPYmplY3Qoc291cmNlLCByZWxhdGl2ZSkge1xuICBpZiAoIXNvdXJjZSkgcmV0dXJuIHJlbGF0aXZlO1xuICByZXR1cm4gdXJsUGFyc2Uoc291cmNlLCBmYWxzZSwgdHJ1ZSkucmVzb2x2ZU9iamVjdChyZWxhdGl2ZSk7XG59XG5cblVybC5wcm90b3R5cGUucmVzb2x2ZU9iamVjdCA9IGZ1bmN0aW9uKHJlbGF0aXZlKSB7XG4gIGlmICh1dGlsLmlzU3RyaW5nKHJlbGF0aXZlKSkge1xuICAgIHZhciByZWwgPSBuZXcgVXJsKCk7XG4gICAgcmVsLnBhcnNlKHJlbGF0aXZlLCBmYWxzZSwgdHJ1ZSk7XG4gICAgcmVsYXRpdmUgPSByZWw7XG4gIH1cblxuICB2YXIgcmVzdWx0ID0gbmV3IFVybCgpO1xuICB2YXIgdGtleXMgPSBPYmplY3Qua2V5cyh0aGlzKTtcbiAgZm9yICh2YXIgdGsgPSAwOyB0ayA8IHRrZXlzLmxlbmd0aDsgdGsrKykge1xuICAgIHZhciB0a2V5ID0gdGtleXNbdGtdO1xuICAgIHJlc3VsdFt0a2V5XSA9IHRoaXNbdGtleV07XG4gIH1cblxuICAvLyBoYXNoIGlzIGFsd2F5cyBvdmVycmlkZGVuLCBubyBtYXR0ZXIgd2hhdC5cbiAgLy8gZXZlbiBocmVmPVwiXCIgd2lsbCByZW1vdmUgaXQuXG4gIHJlc3VsdC5oYXNoID0gcmVsYXRpdmUuaGFzaDtcblxuICAvLyBpZiB0aGUgcmVsYXRpdmUgdXJsIGlzIGVtcHR5LCB0aGVuIHRoZXJlJ3Mgbm90aGluZyBsZWZ0IHRvIGRvIGhlcmUuXG4gIGlmIChyZWxhdGl2ZS5ocmVmID09PSAnJykge1xuICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvLyBocmVmcyBsaWtlIC8vZm9vL2JhciBhbHdheXMgY3V0IHRvIHRoZSBwcm90b2NvbC5cbiAgaWYgKHJlbGF0aXZlLnNsYXNoZXMgJiYgIXJlbGF0aXZlLnByb3RvY29sKSB7XG4gICAgLy8gdGFrZSBldmVyeXRoaW5nIGV4Y2VwdCB0aGUgcHJvdG9jb2wgZnJvbSByZWxhdGl2ZVxuICAgIHZhciBya2V5cyA9IE9iamVjdC5rZXlzKHJlbGF0aXZlKTtcbiAgICBmb3IgKHZhciByayA9IDA7IHJrIDwgcmtleXMubGVuZ3RoOyByaysrKSB7XG4gICAgICB2YXIgcmtleSA9IHJrZXlzW3JrXTtcbiAgICAgIGlmIChya2V5ICE9PSAncHJvdG9jb2wnKVxuICAgICAgICByZXN1bHRbcmtleV0gPSByZWxhdGl2ZVtya2V5XTtcbiAgICB9XG5cbiAgICAvL3VybFBhcnNlIGFwcGVuZHMgdHJhaWxpbmcgLyB0byB1cmxzIGxpa2UgaHR0cDovL3d3dy5leGFtcGxlLmNvbVxuICAgIGlmIChzbGFzaGVkUHJvdG9jb2xbcmVzdWx0LnByb3RvY29sXSAmJlxuICAgICAgICByZXN1bHQuaG9zdG5hbWUgJiYgIXJlc3VsdC5wYXRobmFtZSkge1xuICAgICAgcmVzdWx0LnBhdGggPSByZXN1bHQucGF0aG5hbWUgPSAnLyc7XG4gICAgfVxuXG4gICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGlmIChyZWxhdGl2ZS5wcm90b2NvbCAmJiByZWxhdGl2ZS5wcm90b2NvbCAhPT0gcmVzdWx0LnByb3RvY29sKSB7XG4gICAgLy8gaWYgaXQncyBhIGtub3duIHVybCBwcm90b2NvbCwgdGhlbiBjaGFuZ2luZ1xuICAgIC8vIHRoZSBwcm90b2NvbCBkb2VzIHdlaXJkIHRoaW5nc1xuICAgIC8vIGZpcnN0LCBpZiBpdCdzIG5vdCBmaWxlOiwgdGhlbiB3ZSBNVVNUIGhhdmUgYSBob3N0LFxuICAgIC8vIGFuZCBpZiB0aGVyZSB3YXMgYSBwYXRoXG4gICAgLy8gdG8gYmVnaW4gd2l0aCwgdGhlbiB3ZSBNVVNUIGhhdmUgYSBwYXRoLlxuICAgIC8vIGlmIGl0IGlzIGZpbGU6LCB0aGVuIHRoZSBob3N0IGlzIGRyb3BwZWQsXG4gICAgLy8gYmVjYXVzZSB0aGF0J3Mga25vd24gdG8gYmUgaG9zdGxlc3MuXG4gICAgLy8gYW55dGhpbmcgZWxzZSBpcyBhc3N1bWVkIHRvIGJlIGFic29sdXRlLlxuICAgIGlmICghc2xhc2hlZFByb3RvY29sW3JlbGF0aXZlLnByb3RvY29sXSkge1xuICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhyZWxhdGl2ZSk7XG4gICAgICBmb3IgKHZhciB2ID0gMDsgdiA8IGtleXMubGVuZ3RoOyB2KyspIHtcbiAgICAgICAgdmFyIGsgPSBrZXlzW3ZdO1xuICAgICAgICByZXN1bHRba10gPSByZWxhdGl2ZVtrXTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICByZXN1bHQucHJvdG9jb2wgPSByZWxhdGl2ZS5wcm90b2NvbDtcbiAgICBpZiAoIXJlbGF0aXZlLmhvc3QgJiYgIWhvc3RsZXNzUHJvdG9jb2xbcmVsYXRpdmUucHJvdG9jb2xdKSB7XG4gICAgICB2YXIgcmVsUGF0aCA9IChyZWxhdGl2ZS5wYXRobmFtZSB8fCAnJykuc3BsaXQoJy8nKTtcbiAgICAgIHdoaWxlIChyZWxQYXRoLmxlbmd0aCAmJiAhKHJlbGF0aXZlLmhvc3QgPSByZWxQYXRoLnNoaWZ0KCkpKTtcbiAgICAgIGlmICghcmVsYXRpdmUuaG9zdCkgcmVsYXRpdmUuaG9zdCA9ICcnO1xuICAgICAgaWYgKCFyZWxhdGl2ZS5ob3N0bmFtZSkgcmVsYXRpdmUuaG9zdG5hbWUgPSAnJztcbiAgICAgIGlmIChyZWxQYXRoWzBdICE9PSAnJykgcmVsUGF0aC51bnNoaWZ0KCcnKTtcbiAgICAgIGlmIChyZWxQYXRoLmxlbmd0aCA8IDIpIHJlbFBhdGgudW5zaGlmdCgnJyk7XG4gICAgICByZXN1bHQucGF0aG5hbWUgPSByZWxQYXRoLmpvaW4oJy8nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0LnBhdGhuYW1lID0gcmVsYXRpdmUucGF0aG5hbWU7XG4gICAgfVxuICAgIHJlc3VsdC5zZWFyY2ggPSByZWxhdGl2ZS5zZWFyY2g7XG4gICAgcmVzdWx0LnF1ZXJ5ID0gcmVsYXRpdmUucXVlcnk7XG4gICAgcmVzdWx0Lmhvc3QgPSByZWxhdGl2ZS5ob3N0IHx8ICcnO1xuICAgIHJlc3VsdC5hdXRoID0gcmVsYXRpdmUuYXV0aDtcbiAgICByZXN1bHQuaG9zdG5hbWUgPSByZWxhdGl2ZS5ob3N0bmFtZSB8fCByZWxhdGl2ZS5ob3N0O1xuICAgIHJlc3VsdC5wb3J0ID0gcmVsYXRpdmUucG9ydDtcbiAgICAvLyB0byBzdXBwb3J0IGh0dHAucmVxdWVzdFxuICAgIGlmIChyZXN1bHQucGF0aG5hbWUgfHwgcmVzdWx0LnNlYXJjaCkge1xuICAgICAgdmFyIHAgPSByZXN1bHQucGF0aG5hbWUgfHwgJyc7XG4gICAgICB2YXIgcyA9IHJlc3VsdC5zZWFyY2ggfHwgJyc7XG4gICAgICByZXN1bHQucGF0aCA9IHAgKyBzO1xuICAgIH1cbiAgICByZXN1bHQuc2xhc2hlcyA9IHJlc3VsdC5zbGFzaGVzIHx8IHJlbGF0aXZlLnNsYXNoZXM7XG4gICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHZhciBpc1NvdXJjZUFicyA9IChyZXN1bHQucGF0aG5hbWUgJiYgcmVzdWx0LnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nKSxcbiAgICAgIGlzUmVsQWJzID0gKFxuICAgICAgICAgIHJlbGF0aXZlLmhvc3QgfHxcbiAgICAgICAgICByZWxhdGl2ZS5wYXRobmFtZSAmJiByZWxhdGl2ZS5wYXRobmFtZS5jaGFyQXQoMCkgPT09ICcvJ1xuICAgICAgKSxcbiAgICAgIG11c3RFbmRBYnMgPSAoaXNSZWxBYnMgfHwgaXNTb3VyY2VBYnMgfHxcbiAgICAgICAgICAgICAgICAgICAgKHJlc3VsdC5ob3N0ICYmIHJlbGF0aXZlLnBhdGhuYW1lKSksXG4gICAgICByZW1vdmVBbGxEb3RzID0gbXVzdEVuZEFicyxcbiAgICAgIHNyY1BhdGggPSByZXN1bHQucGF0aG5hbWUgJiYgcmVzdWx0LnBhdGhuYW1lLnNwbGl0KCcvJykgfHwgW10sXG4gICAgICByZWxQYXRoID0gcmVsYXRpdmUucGF0aG5hbWUgJiYgcmVsYXRpdmUucGF0aG5hbWUuc3BsaXQoJy8nKSB8fCBbXSxcbiAgICAgIHBzeWNob3RpYyA9IHJlc3VsdC5wcm90b2NvbCAmJiAhc2xhc2hlZFByb3RvY29sW3Jlc3VsdC5wcm90b2NvbF07XG5cbiAgLy8gaWYgdGhlIHVybCBpcyBhIG5vbi1zbGFzaGVkIHVybCwgdGhlbiByZWxhdGl2ZVxuICAvLyBsaW5rcyBsaWtlIC4uLy4uIHNob3VsZCBiZSBhYmxlXG4gIC8vIHRvIGNyYXdsIHVwIHRvIHRoZSBob3N0bmFtZSwgYXMgd2VsbC4gIFRoaXMgaXMgc3RyYW5nZS5cbiAgLy8gcmVzdWx0LnByb3RvY29sIGhhcyBhbHJlYWR5IGJlZW4gc2V0IGJ5IG5vdy5cbiAgLy8gTGF0ZXIgb24sIHB1dCB0aGUgZmlyc3QgcGF0aCBwYXJ0IGludG8gdGhlIGhvc3QgZmllbGQuXG4gIGlmIChwc3ljaG90aWMpIHtcbiAgICByZXN1bHQuaG9zdG5hbWUgPSAnJztcbiAgICByZXN1bHQucG9ydCA9IG51bGw7XG4gICAgaWYgKHJlc3VsdC5ob3N0KSB7XG4gICAgICBpZiAoc3JjUGF0aFswXSA9PT0gJycpIHNyY1BhdGhbMF0gPSByZXN1bHQuaG9zdDtcbiAgICAgIGVsc2Ugc3JjUGF0aC51bnNoaWZ0KHJlc3VsdC5ob3N0KTtcbiAgICB9XG4gICAgcmVzdWx0Lmhvc3QgPSAnJztcbiAgICBpZiAocmVsYXRpdmUucHJvdG9jb2wpIHtcbiAgICAgIHJlbGF0aXZlLmhvc3RuYW1lID0gbnVsbDtcbiAgICAgIHJlbGF0aXZlLnBvcnQgPSBudWxsO1xuICAgICAgaWYgKHJlbGF0aXZlLmhvc3QpIHtcbiAgICAgICAgaWYgKHJlbFBhdGhbMF0gPT09ICcnKSByZWxQYXRoWzBdID0gcmVsYXRpdmUuaG9zdDtcbiAgICAgICAgZWxzZSByZWxQYXRoLnVuc2hpZnQocmVsYXRpdmUuaG9zdCk7XG4gICAgICB9XG4gICAgICByZWxhdGl2ZS5ob3N0ID0gbnVsbDtcbiAgICB9XG4gICAgbXVzdEVuZEFicyA9IG11c3RFbmRBYnMgJiYgKHJlbFBhdGhbMF0gPT09ICcnIHx8IHNyY1BhdGhbMF0gPT09ICcnKTtcbiAgfVxuXG4gIGlmIChpc1JlbEFicykge1xuICAgIC8vIGl0J3MgYWJzb2x1dGUuXG4gICAgcmVzdWx0Lmhvc3QgPSAocmVsYXRpdmUuaG9zdCB8fCByZWxhdGl2ZS5ob3N0ID09PSAnJykgP1xuICAgICAgICAgICAgICAgICAgcmVsYXRpdmUuaG9zdCA6IHJlc3VsdC5ob3N0O1xuICAgIHJlc3VsdC5ob3N0bmFtZSA9IChyZWxhdGl2ZS5ob3N0bmFtZSB8fCByZWxhdGl2ZS5ob3N0bmFtZSA9PT0gJycpID9cbiAgICAgICAgICAgICAgICAgICAgICByZWxhdGl2ZS5ob3N0bmFtZSA6IHJlc3VsdC5ob3N0bmFtZTtcbiAgICByZXN1bHQuc2VhcmNoID0gcmVsYXRpdmUuc2VhcmNoO1xuICAgIHJlc3VsdC5xdWVyeSA9IHJlbGF0aXZlLnF1ZXJ5O1xuICAgIHNyY1BhdGggPSByZWxQYXRoO1xuICAgIC8vIGZhbGwgdGhyb3VnaCB0byB0aGUgZG90LWhhbmRsaW5nIGJlbG93LlxuICB9IGVsc2UgaWYgKHJlbFBhdGgubGVuZ3RoKSB7XG4gICAgLy8gaXQncyByZWxhdGl2ZVxuICAgIC8vIHRocm93IGF3YXkgdGhlIGV4aXN0aW5nIGZpbGUsIGFuZCB0YWtlIHRoZSBuZXcgcGF0aCBpbnN0ZWFkLlxuICAgIGlmICghc3JjUGF0aCkgc3JjUGF0aCA9IFtdO1xuICAgIHNyY1BhdGgucG9wKCk7XG4gICAgc3JjUGF0aCA9IHNyY1BhdGguY29uY2F0KHJlbFBhdGgpO1xuICAgIHJlc3VsdC5zZWFyY2ggPSByZWxhdGl2ZS5zZWFyY2g7XG4gICAgcmVzdWx0LnF1ZXJ5ID0gcmVsYXRpdmUucXVlcnk7XG4gIH0gZWxzZSBpZiAoIXV0aWwuaXNOdWxsT3JVbmRlZmluZWQocmVsYXRpdmUuc2VhcmNoKSkge1xuICAgIC8vIGp1c3QgcHVsbCBvdXQgdGhlIHNlYXJjaC5cbiAgICAvLyBsaWtlIGhyZWY9Jz9mb28nLlxuICAgIC8vIFB1dCB0aGlzIGFmdGVyIHRoZSBvdGhlciB0d28gY2FzZXMgYmVjYXVzZSBpdCBzaW1wbGlmaWVzIHRoZSBib29sZWFuc1xuICAgIGlmIChwc3ljaG90aWMpIHtcbiAgICAgIHJlc3VsdC5ob3N0bmFtZSA9IHJlc3VsdC5ob3N0ID0gc3JjUGF0aC5zaGlmdCgpO1xuICAgICAgLy9vY2NhdGlvbmFseSB0aGUgYXV0aCBjYW4gZ2V0IHN0dWNrIG9ubHkgaW4gaG9zdFxuICAgICAgLy90aGlzIGVzcGVjaWFsbHkgaGFwcGVucyBpbiBjYXNlcyBsaWtlXG4gICAgICAvL3VybC5yZXNvbHZlT2JqZWN0KCdtYWlsdG86bG9jYWwxQGRvbWFpbjEnLCAnbG9jYWwyQGRvbWFpbjInKVxuICAgICAgdmFyIGF1dGhJbkhvc3QgPSByZXN1bHQuaG9zdCAmJiByZXN1bHQuaG9zdC5pbmRleE9mKCdAJykgPiAwID9cbiAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lmhvc3Quc3BsaXQoJ0AnKSA6IGZhbHNlO1xuICAgICAgaWYgKGF1dGhJbkhvc3QpIHtcbiAgICAgICAgcmVzdWx0LmF1dGggPSBhdXRoSW5Ib3N0LnNoaWZ0KCk7XG4gICAgICAgIHJlc3VsdC5ob3N0ID0gcmVzdWx0Lmhvc3RuYW1lID0gYXV0aEluSG9zdC5zaGlmdCgpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXN1bHQuc2VhcmNoID0gcmVsYXRpdmUuc2VhcmNoO1xuICAgIHJlc3VsdC5xdWVyeSA9IHJlbGF0aXZlLnF1ZXJ5O1xuICAgIC8vdG8gc3VwcG9ydCBodHRwLnJlcXVlc3RcbiAgICBpZiAoIXV0aWwuaXNOdWxsKHJlc3VsdC5wYXRobmFtZSkgfHwgIXV0aWwuaXNOdWxsKHJlc3VsdC5zZWFyY2gpKSB7XG4gICAgICByZXN1bHQucGF0aCA9IChyZXN1bHQucGF0aG5hbWUgPyByZXN1bHQucGF0aG5hbWUgOiAnJykgK1xuICAgICAgICAgICAgICAgICAgICAocmVzdWx0LnNlYXJjaCA/IHJlc3VsdC5zZWFyY2ggOiAnJyk7XG4gICAgfVxuICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBpZiAoIXNyY1BhdGgubGVuZ3RoKSB7XG4gICAgLy8gbm8gcGF0aCBhdCBhbGwuICBlYXN5LlxuICAgIC8vIHdlJ3ZlIGFscmVhZHkgaGFuZGxlZCB0aGUgb3RoZXIgc3R1ZmYgYWJvdmUuXG4gICAgcmVzdWx0LnBhdGhuYW1lID0gbnVsbDtcbiAgICAvL3RvIHN1cHBvcnQgaHR0cC5yZXF1ZXN0XG4gICAgaWYgKHJlc3VsdC5zZWFyY2gpIHtcbiAgICAgIHJlc3VsdC5wYXRoID0gJy8nICsgcmVzdWx0LnNlYXJjaDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0LnBhdGggPSBudWxsO1xuICAgIH1cbiAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLy8gaWYgYSB1cmwgRU5EcyBpbiAuIG9yIC4uLCB0aGVuIGl0IG11c3QgZ2V0IGEgdHJhaWxpbmcgc2xhc2guXG4gIC8vIGhvd2V2ZXIsIGlmIGl0IGVuZHMgaW4gYW55dGhpbmcgZWxzZSBub24tc2xhc2h5LFxuICAvLyB0aGVuIGl0IG11c3QgTk9UIGdldCBhIHRyYWlsaW5nIHNsYXNoLlxuICB2YXIgbGFzdCA9IHNyY1BhdGguc2xpY2UoLTEpWzBdO1xuICB2YXIgaGFzVHJhaWxpbmdTbGFzaCA9IChcbiAgICAgIChyZXN1bHQuaG9zdCB8fCByZWxhdGl2ZS5ob3N0IHx8IHNyY1BhdGgubGVuZ3RoID4gMSkgJiZcbiAgICAgIChsYXN0ID09PSAnLicgfHwgbGFzdCA9PT0gJy4uJykgfHwgbGFzdCA9PT0gJycpO1xuXG4gIC8vIHN0cmlwIHNpbmdsZSBkb3RzLCByZXNvbHZlIGRvdWJsZSBkb3RzIHRvIHBhcmVudCBkaXJcbiAgLy8gaWYgdGhlIHBhdGggdHJpZXMgdG8gZ28gYWJvdmUgdGhlIHJvb3QsIGB1cGAgZW5kcyB1cCA+IDBcbiAgdmFyIHVwID0gMDtcbiAgZm9yICh2YXIgaSA9IHNyY1BhdGgubGVuZ3RoOyBpID49IDA7IGktLSkge1xuICAgIGxhc3QgPSBzcmNQYXRoW2ldO1xuICAgIGlmIChsYXN0ID09PSAnLicpIHtcbiAgICAgIHNyY1BhdGguc3BsaWNlKGksIDEpO1xuICAgIH0gZWxzZSBpZiAobGFzdCA9PT0gJy4uJykge1xuICAgICAgc3JjUGF0aC5zcGxpY2UoaSwgMSk7XG4gICAgICB1cCsrO1xuICAgIH0gZWxzZSBpZiAodXApIHtcbiAgICAgIHNyY1BhdGguc3BsaWNlKGksIDEpO1xuICAgICAgdXAtLTtcbiAgICB9XG4gIH1cblxuICAvLyBpZiB0aGUgcGF0aCBpcyBhbGxvd2VkIHRvIGdvIGFib3ZlIHRoZSByb290LCByZXN0b3JlIGxlYWRpbmcgLi5zXG4gIGlmICghbXVzdEVuZEFicyAmJiAhcmVtb3ZlQWxsRG90cykge1xuICAgIGZvciAoOyB1cC0tOyB1cCkge1xuICAgICAgc3JjUGF0aC51bnNoaWZ0KCcuLicpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChtdXN0RW5kQWJzICYmIHNyY1BhdGhbMF0gIT09ICcnICYmXG4gICAgICAoIXNyY1BhdGhbMF0gfHwgc3JjUGF0aFswXS5jaGFyQXQoMCkgIT09ICcvJykpIHtcbiAgICBzcmNQYXRoLnVuc2hpZnQoJycpO1xuICB9XG5cbiAgaWYgKGhhc1RyYWlsaW5nU2xhc2ggJiYgKHNyY1BhdGguam9pbignLycpLnN1YnN0cigtMSkgIT09ICcvJykpIHtcbiAgICBzcmNQYXRoLnB1c2goJycpO1xuICB9XG5cbiAgdmFyIGlzQWJzb2x1dGUgPSBzcmNQYXRoWzBdID09PSAnJyB8fFxuICAgICAgKHNyY1BhdGhbMF0gJiYgc3JjUGF0aFswXS5jaGFyQXQoMCkgPT09ICcvJyk7XG5cbiAgLy8gcHV0IHRoZSBob3N0IGJhY2tcbiAgaWYgKHBzeWNob3RpYykge1xuICAgIHJlc3VsdC5ob3N0bmFtZSA9IHJlc3VsdC5ob3N0ID0gaXNBYnNvbHV0ZSA/ICcnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNyY1BhdGgubGVuZ3RoID8gc3JjUGF0aC5zaGlmdCgpIDogJyc7XG4gICAgLy9vY2NhdGlvbmFseSB0aGUgYXV0aCBjYW4gZ2V0IHN0dWNrIG9ubHkgaW4gaG9zdFxuICAgIC8vdGhpcyBlc3BlY2lhbGx5IGhhcHBlbnMgaW4gY2FzZXMgbGlrZVxuICAgIC8vdXJsLnJlc29sdmVPYmplY3QoJ21haWx0bzpsb2NhbDFAZG9tYWluMScsICdsb2NhbDJAZG9tYWluMicpXG4gICAgdmFyIGF1dGhJbkhvc3QgPSByZXN1bHQuaG9zdCAmJiByZXN1bHQuaG9zdC5pbmRleE9mKCdAJykgPiAwID9cbiAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5ob3N0LnNwbGl0KCdAJykgOiBmYWxzZTtcbiAgICBpZiAoYXV0aEluSG9zdCkge1xuICAgICAgcmVzdWx0LmF1dGggPSBhdXRoSW5Ib3N0LnNoaWZ0KCk7XG4gICAgICByZXN1bHQuaG9zdCA9IHJlc3VsdC5ob3N0bmFtZSA9IGF1dGhJbkhvc3Quc2hpZnQoKTtcbiAgICB9XG4gIH1cblxuICBtdXN0RW5kQWJzID0gbXVzdEVuZEFicyB8fCAocmVzdWx0Lmhvc3QgJiYgc3JjUGF0aC5sZW5ndGgpO1xuXG4gIGlmIChtdXN0RW5kQWJzICYmICFpc0Fic29sdXRlKSB7XG4gICAgc3JjUGF0aC51bnNoaWZ0KCcnKTtcbiAgfVxuXG4gIGlmICghc3JjUGF0aC5sZW5ndGgpIHtcbiAgICByZXN1bHQucGF0aG5hbWUgPSBudWxsO1xuICAgIHJlc3VsdC5wYXRoID0gbnVsbDtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQucGF0aG5hbWUgPSBzcmNQYXRoLmpvaW4oJy8nKTtcbiAgfVxuXG4gIC8vdG8gc3VwcG9ydCByZXF1ZXN0Lmh0dHBcbiAgaWYgKCF1dGlsLmlzTnVsbChyZXN1bHQucGF0aG5hbWUpIHx8ICF1dGlsLmlzTnVsbChyZXN1bHQuc2VhcmNoKSkge1xuICAgIHJlc3VsdC5wYXRoID0gKHJlc3VsdC5wYXRobmFtZSA/IHJlc3VsdC5wYXRobmFtZSA6ICcnKSArXG4gICAgICAgICAgICAgICAgICAocmVzdWx0LnNlYXJjaCA/IHJlc3VsdC5zZWFyY2ggOiAnJyk7XG4gIH1cbiAgcmVzdWx0LmF1dGggPSByZWxhdGl2ZS5hdXRoIHx8IHJlc3VsdC5hdXRoO1xuICByZXN1bHQuc2xhc2hlcyA9IHJlc3VsdC5zbGFzaGVzIHx8IHJlbGF0aXZlLnNsYXNoZXM7XG4gIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICByZXR1cm4gcmVzdWx0O1xufTtcblxuVXJsLnByb3RvdHlwZS5wYXJzZUhvc3QgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGhvc3QgPSB0aGlzLmhvc3Q7XG4gIHZhciBwb3J0ID0gcG9ydFBhdHRlcm4uZXhlYyhob3N0KTtcbiAgaWYgKHBvcnQpIHtcbiAgICBwb3J0ID0gcG9ydFswXTtcbiAgICBpZiAocG9ydCAhPT0gJzonKSB7XG4gICAgICB0aGlzLnBvcnQgPSBwb3J0LnN1YnN0cigxKTtcbiAgICB9XG4gICAgaG9zdCA9IGhvc3Quc3Vic3RyKDAsIGhvc3QubGVuZ3RoIC0gcG9ydC5sZW5ndGgpO1xuICB9XG4gIGlmIChob3N0KSB0aGlzLmhvc3RuYW1lID0gaG9zdDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpc1N0cmluZzogZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIHR5cGVvZihhcmcpID09PSAnc3RyaW5nJztcbiAgfSxcbiAgaXNPYmplY3Q6IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiB0eXBlb2YoYXJnKSA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xuICB9LFxuICBpc051bGw6IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiBhcmcgPT09IG51bGw7XG4gIH0sXG4gIGlzTnVsbE9yVW5kZWZpbmVkOiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gYXJnID09IG51bGw7XG4gIH1cbn07XG4iXX0=
