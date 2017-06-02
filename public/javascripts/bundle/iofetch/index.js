(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {/**/}

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

module.exports = function extend() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0],
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target !== copy) {
					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[name] = extend(deep, clone, copy);

					// Don't bring in undefined values
					} else if (typeof copy !== 'undefined') {
						target[name] = copy;
					}
				}
			}
		}
	}

	// Return the modified object
	return target;
};


},{}],2:[function(require,module,exports){
'use strict';

// require('core-js/fn/object/entries');
// require('core-js/es6/promise');

var Model = require('./model'),
    BaseView = require('core-baseview');

BaseView.register({
    _init: function _init() {
        Model.listdata({
            data: {
                username: 'zmr',
                sex: '女'
            },
            success: function success(list) {
                console.log(list);
            }
        });
    }
});

},{"./model":3,"core-baseview":4}],3:[function(require,module,exports){
'use strict';

/**
 * 放到自己项目中，统一定义的io处理层
 *
 * 使用npm包：node-io-fetch实现
 */
var _require = require('node-io-fetch'),
    IoConfig = _require.IoConfig,
    Io = _require.Io;

var extend = require('extend');

/**
 * 设置自己的配置
 */

/**
 * 如果data是json，且method不是GET或HEAD，是否将data格式化成form-data数据传递
 * @type {Boolean}
 */
IoConfig.ioparams.isformdata = true;
/**
 * 业务错误条件配置
 * @param  {[type]} result [description]
 * @return {[type]}        [description]
 */
IoConfig.fail.filter = function (result) {
    if (result.code != 'A0001') {
        return true; //说明发生了业务错误
    } else {
        return false;
    }
};

/**
 * io请求发送前执行
 * @return {[type]} [description]
 */
IoConfig.ioparams.beforeSend = function () {
    console.log('请求开始');
    // _APP.Loading.show();
};

/**
 * io请求结束后
 */
IoConfig.ioparams.complete = function () {
    console.log('请求结束');
    // _APP.Loading.hide();
};

/**
 * 网络错误或者系统错误
 * @param  {[type]} error [description]
 * @return {[type]}       [description]
 */
IoConfig.ioparams.error = function (error) {
    //error或有或无 error.message
    _APP.Toast.show(error.message || '亲，忙不过来了');
};

/**
 * 业务错误处理
 * @param  {[type]} result   [description]
 * @param  {[type]} response [description]
 * @return {[type]}          [description]
 */
IoConfig.ioparams.fail = function (result, response) {
    if (result.code == 'A0002') {
        _APP.Toast.show('未登录');
    } else {
        _APP.Toast.show(result.errmsg || '亲，忙不过来了');
    }
};

/**
 * 调用以下方法的时候，opt如ioparams。但是一般只传以下参数就可以了：
 *   data success
 *   以下方法已经统一处理了，如果想覆盖自行传入
 *   beforeSend error fail complete
 */
module.exports = {
    //listdata接口
    listdata: function listdata(opt) {
        Io.request(extend(true, {
            request: {
                method: 'POST'
            },
            url: 'http://127.0.0.1:8000/listdata'
        }, opt));
    }
};

},{"extend":1,"node-io-fetch":35}],4:[function(require,module,exports){
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

},{"../ui/ui.alert.js":6,"../ui/ui.confirm.js":8,"../ui/ui.loading.js":10,"../ui/ui.toast.js":11,"libutil-tool":31}],5:[function(require,module,exports){
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

},{"./ui.alert.html":5,"liblayer-alertSingle":14,"libutil-csssuport":24}],7:[function(require,module,exports){
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

},{"./ui.confirm.html":7,"liblayer-confirmSingle":19,"libutil-csssuport":24}],9:[function(require,module,exports){
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

},{"liblayer-bombLayer":16,"libutil-csssuport":24}],10:[function(require,module,exports){
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

},{"./ui.layer.js":9,"libutil-workerControl":34}],11:[function(require,module,exports){
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

},{"./ui.layer.js":9,"libutil-workerControl":34}],12:[function(require,module,exports){
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

},{"./bombLayer.js":16,"./tpl.js":23}],13:[function(require,module,exports){
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

},{"./alert.js":12,"./baseControl.js":15}],14:[function(require,module,exports){
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

},{"./alertControl.js":13}],15:[function(require,module,exports){
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

},{"libutil-tool":31}],16:[function(require,module,exports){
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

},{"./layer.js":20,"./mask.js":21,"./positionBomb.js":22,"libutil-tool":31}],17:[function(require,module,exports){
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

},{"./bombLayer.js":16,"./tpl.js":23}],18:[function(require,module,exports){
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

},{"./baseControl.js":15,"./confirm.js":17}],19:[function(require,module,exports){
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

},{"./confirmControl.js":18}],20:[function(require,module,exports){
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

},{}],21:[function(require,module,exports){
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

},{"./positionBomb.js":22}],22:[function(require,module,exports){
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

},{"libutil-resize":28,"libutil-scroll":30,"libutil-winresize":32,"libutil-winscroll":33}],23:[function(require,module,exports){
'use strict';

/**
 * alert弹层模板，必须具有指定的node属性
 */
exports.alert = ['<div>标题</div>', '<div node="content">内容区</div>', '<div><a href="javascript:;" class="js-ok">确定</a></div>'].join('');
/**
 * confirm弹层模板，必须具有指定的node属性
 */
exports.confirm = ['<div>标题</div>', '<div node="content">内容区</div>', '<div><a href="javascript:;" class="js-ok">确定</a><a href="javascript:;" class="js-cancel">取消</a></div>'].join('');

},{}],24:[function(require,module,exports){
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

},{}],25:[function(require,module,exports){
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

},{"./publisherS.js":27}],26:[function(require,module,exports){
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

},{}],27:[function(require,module,exports){
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

},{"./rwcontroller.js":29,"./tool.js":31}],28:[function(require,module,exports){
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

},{"./delayevt.js":25}],29:[function(require,module,exports){
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

},{"./tool.js":31}],30:[function(require,module,exports){
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

},{"./delayevt.js":25}],31:[function(require,module,exports){
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

},{"url":44}],32:[function(require,module,exports){
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

},{"./deviceevtname.js":26,"./resize.js":28}],33:[function(require,module,exports){
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

},{"./scroll.js":30}],34:[function(require,module,exports){
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

},{}],35:[function(require,module,exports){
exports.Io = require('./io');
exports.IoConfig = require('./ioconfig');

},{"./io":36,"./ioconfig":37}],36:[function(require,module,exports){
/**
 * @fileoverview io请求总a
 */
require('whatwg-fetch');
const IoConfig = require('./ioconfig');
const extend = require('extend');
const querystring = require('querystring');

/**
 * 将data格式化成FormData
 * @param  {JSON} data [description]
 * @return {FormData}      [description]
 */
function formatFormData(data){
    var _formdata = new FormData();
    for(var key in data){
        var val = data[key];
        if(val == undefined){
            continue;
        }else if(val.constructor == Array){
            val.forEach(function(v,i){
                _formdata.append(key,v);
            });
            continue;
        }else{
            _formdata.append(key,val);
        }
    }
    return _formdata;
}

module.exports = {
    /**
     * 发起io请求
     * @param  {JSON} ioparams 同ioconfig.ioparams
     * @return {[type]}          [description]
     */
    request: function(ioparams) {
        if(ioparams.url == ''){
            throw new Error('io参数url不能为空');
            return;
        }
        var conf = {};

        extend(true,conf,IoConfig.ioparams,ioparams);

        conf.request.method = conf.request.method.toUpperCase();

        //检测ioparams里的data
        var body = conf.data, _method = conf.request.method;

        if(body && body.constructor === Object){ //说明data是json
            if(_method != 'GET' && _method != 'HEAD' && conf.isformdata){
                body = formatFormData(body);
                delete conf.headers['Content-Type'];
            }else{
                body = querystring.stringify(body);
            }
        }

        if(conf.headers['Content-Type'] === false){
            delete conf.headers['Content-Type'];
        }

        //赋值request.body
        if(body){
            switch(_method){
                case 'GET':
                    if(typeof body == 'string'){
                        conf.url += '?'+body.toString();
                    }
                    break;
                case 'HEAD':
                    break;
                default:
                    conf.request.body = body;
                    break;
            }
        }

        //发起请求
        conf.request.headers = conf.headers;
        var myrequest = new Request(conf.url,conf.request);

        //请求发起前统一处理
        conf.beforeSend();

        var race = Promise.race([
            fetch(myrequest),
            new Promise(function(resolve,reject){
                setTimeout(reject,conf.timeout,new Error('请求超时'));
            })
        ]);
        race.then(function(response){
            if(response.ok) { //response.status [200,299]
                response[conf.type]().then(function(result){
                    if(conf.dealfail){ //处理业务错误
                        if(IoConfig.fail.filter(result)){ //有业务错误发生
                            conf[IoConfig.fail.funname](result,response);
                        }else{ //无业务错误发生
                            if(conf.dealdata){
                                conf.success(conf.dealdatafun(result),response);
                            }else{
                                conf.success(result,response);
                            }
                        }
                    }else{
                        conf.success(result,response);
                    }
                },function(error){
                    throw error;
                });
            }else{
                var error = new Error(response.statusText || '网络错误')
                throw error;
            }
            conf.complete();
        }).catch(function(error){
            //捕获任何错误，即发生语法错误也会捕获
            conf.error(error);
            conf.complete();
        });
    }
};

},{"./ioconfig":37,"extend":38,"querystring":43,"whatwg-fetch":39}],37:[function(require,module,exports){
/**
 * @fileoverview io请求的一些公共配置
 */
 const that = {
    /**
     * 对于接口返回的业务错误进行统一处理
     * @type {Object}
     */
    fail: {
        funname: 'fail', //当发生业务错误的时候，调用的方法名
        filter: function(result) {
            // if(result.code != 'A0001'){
            //     return true; //说明发生了业务错误
            // }else{
            //     return false;
            // }
            return false;
        }
    },

    /**
     * 请求头部配置
     * @type {Object}
     */
    headers: {
        //如果Content-Type设置为false,则不传Content-Type
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    /**
     * 请求对象参数配置
     * @type {Object}
     */
    request: {
        method: 'GET', //GET|POST
        mode: 'cors', //cors|no-cors|same-origin|navigate
        //其他参数
        //body: credentials: cache: redirect: referrer: integrity
        /**
         * same-origin: 同ajax一样，同域发送cookie
         * include: 跨域发送cookie
         * @type {String}
         */
        credentials: 'same-origin'
    }
};

/**
 * 调用io组件，传入的参数格式
 * @type {Object}
 */
that.ioparams = {
    headers: that.headers, //同headers
    request: that.request, //同request
    /**
     * 请求参数。可以是以下几种类型：
     * Bolb
     * BufferSource
     * FormData
     * URLSearchParams
     * USVString
     * String
     * JSON: 如果是json, 则做特殊处理，请见下面isformdata的说明
     */
    // data: {},
    /**
     * 如果data是json:
     *  1. request.method不是GET或HEAD, 且isformdata为true, 那么将data转换成FormData格式
     *  2. 如果不符合第1种，将data转换成querystring
     * @type {Boolean}
     */
    isformdata: false,
    url: '', //请求url地址
    /**
     * 请求的数据类型，默认为json. 数据类型和reponse对象返回获取结果的方法对应关系如下
     * arrayBuffer: response.arrayBuffer
     * blob: response.blob
     * formData: response.formData,
     * json: response.json,
     * text: response.text
     * @type {String}
     */
    type: 'json',
    timeout: 6000,
    /**
     * io请求前，统一的处理
     * @return {[type]} [description]
     */
    beforeSend: function(){

    },
    /**
     * 对于接口返回错误，一般因为网络原因，进行的统一处理
     */
    error: function(error){
        //error或有或无 error.message
        //Alert.alert('系统消息',error.message || '亲，忙不过来了');
    },
    /**
     * 如果fail配置了funname为fail,则调用此方法. 此时fail.filter返回true
     * @param {Object|Other} result 接口返回数据
     * @param {Response} response 返回的response对象
     * @return {[type]} [description]
     */
    fail: function(result,response){
        //Alert.alert('系统消息',result.errmsg || '亲，忙不过来了');
    },
    /**
     * 成功调用方法。调用的情况有如下几种：
     * 1. dealfail为true, 则fail.filter返回false时，调用success
     *          此时如果dealdata为true, 则result为dealdatafun返回的数据
     * 2. dealfail为false时，则接口返回后直接调用此方法（不发生error的情况下）
     *
     * @param {Object|Other} result 接口返回数据
     * @param {Response} response 返回的response对象
     */
    success: function(result,response){},
    /**
     * 接口请求完毕调用。无论success,fail,error
     * @return {[type]} [description]
     */
    complete: function(){},
    /**
     * 如果dealdata为true, 则success的result为此方法返回的数据
     * @param {Object|Other} result 接口返回数据
     * @return {[type]}        [description]
     */
    dealdatafun: function(result){return result.data},
    /**
     * 是否统一处理业务错误
     * @type {Boolean}
     */
    dealfail: true, //是否统一处理业务错误
    /**
     * 当业务成功时，调用success前，是否统一格式化数据
     * 如果dealfail为true,并且fail.filter返回为false时，如果此项设置为true,则调用dealdatafun方法，返回处理后的数据
     * @type {Boolean}
     */
    dealdata: true
};

module.exports = that;

},{}],38:[function(require,module,exports){
arguments[4][1][0].apply(exports,arguments)
},{"dup":1}],39:[function(require,module,exports){
(function(self) {
  'use strict';

  if (self.fetch) {
    return
  }

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob()
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ]

    var isDataView = function(obj) {
      return obj && DataView.prototype.isPrototypeOf(obj)
    }

    var isArrayBufferView = ArrayBuffer.isView || function(obj) {
      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
    }
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value)
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift()
        return {done: value === undefined, value: value}
      }
    }

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      }
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {}

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value)
      }, this)
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1])
      }, this)
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name])
      }, this)
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var oldValue = this.map[name]
    this.map[name] = oldValue ? oldValue+','+value : value
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    name = normalizeName(name)
    return this.has(name) ? this.map[name] : null
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value)
  }

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this)
      }
    }
  }

  Headers.prototype.keys = function() {
    var items = []
    this.forEach(function(value, name) { items.push(name) })
    return iteratorFor(items)
  }

  Headers.prototype.values = function() {
    var items = []
    this.forEach(function(value) { items.push(value) })
    return iteratorFor(items)
  }

  Headers.prototype.entries = function() {
    var items = []
    this.forEach(function(value, name) { items.push([name, value]) })
    return iteratorFor(items)
  }

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsArrayBuffer(blob)
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsText(blob)
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf)
    var chars = new Array(view.length)

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i])
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength)
      view.set(new Uint8Array(buf))
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false

    this._initBody = function(body) {
      this._bodyInit = body
      if (!body) {
        this._bodyText = ''
      } else if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString()
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer)
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer])
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body)
      } else {
        throw new Error('unsupported BodyInit type')
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8')
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type)
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
        }
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      }
    }

    this.text = function() {
      var rejected = consumed(this)
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {}
    var body = options.body

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url
      this.credentials = input.credentials
      if (!options.headers) {
        this.headers = new Headers(input.headers)
      }
      this.method = input.method
      this.mode = input.mode
      if (!body && input._bodyInit != null) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    } else {
      this.url = String(input)
    }

    this.credentials = options.credentials || this.credentials || 'omit'
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers)
    }
    this.method = normalizeMethod(options.method || this.method || 'GET')
    this.mode = options.mode || this.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body)
  }

  Request.prototype.clone = function() {
    return new Request(this, { body: this._bodyInit })
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers()
    rawHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':')
      var key = parts.shift().trim()
      if (key) {
        var value = parts.join(':').trim()
        headers.append(key, value)
      }
    })
    return headers
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this.type = 'default'
    this.status = 'status' in options ? options.status : 200
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = 'statusText' in options ? options.statusText : 'OK'
    this.headers = new Headers(options.headers)
    this.url = options.url || ''
    this._initBody(bodyInit)
  }

  Body.call(Response.prototype)

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  }

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''})
    response.type = 'error'
    return response
  }

  var redirectStatuses = [301, 302, 303, 307, 308]

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  }

  self.Headers = Headers
  self.Request = Request
  self.Response = Response

  self.fetch = function(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init)
      var xhr = new XMLHttpRequest()

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        }
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL')
        var body = 'response' in xhr ? xhr.response : xhr.responseText
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value)
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  self.fetch.polyfill = true
})(typeof self !== 'undefined' ? self : this);

},{}],40:[function(require,module,exports){
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

},{}],41:[function(require,module,exports){
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

},{}],42:[function(require,module,exports){
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

},{}],43:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":41,"./encode":42}],44:[function(require,module,exports){
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

},{"./util":45,"punycode":40,"querystring":43}],45:[function(require,module,exports){
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

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3Rvb2wvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIm5vZGVfbW9kdWxlcy9leHRlbmQvaW5kZXguanMiLCJwdWJsaWNcXGphdmFzY3JpcHRzXFxwYWdlXFxpb2ZldGNoXFxpbmRleC5qcyIsInB1YmxpY1xcamF2YXNjcmlwdHNcXHBhZ2VcXGlvZmV0Y2hcXG1vZGVsLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcY29tbW9uXFxiYXNlLnZpZXcuanMiLCIuLi9ub2RlLWNvcmV1aS1wYy9qcy91aS91aS5hbGVydC5odG1sIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcdWlcXHVpLmFsZXJ0LmpzIiwiLi4vbm9kZS1jb3JldWktcGMvanMvdWkvdWkuY29uZmlybS5odG1sIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcdWlcXHVpLmNvbmZpcm0uanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx1aVxcdWkubGF5ZXIuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx1aVxcdWkubG9hZGluZy5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHVpXFx1aS50b2FzdC5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdWlcXGxheWVyXFxhbGVydC5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdWlcXGxheWVyXFxhbGVydENvbnRyb2wuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHVpXFxsYXllclxcYWxlcnRTaW5nbGUuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHVpXFxsYXllclxcYmFzZUNvbnRyb2wuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHVpXFxsYXllclxcYm9tYkxheWVyLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1aVxcbGF5ZXJcXGNvbmZpcm0uanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHVpXFxsYXllclxcY29uZmlybUNvbnRyb2wuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHVpXFxsYXllclxcY29uZmlybVNpbmdsZS5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdWlcXGxheWVyXFxsYXllci5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdWlcXGxheWVyXFxtYXNrLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1aVxcbGF5ZXJcXHBvc2l0aW9uQm9tYi5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdWlcXGxheWVyXFx0cGwuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHV0aWxcXGNzc3N1cG9ydC5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdXRpbFxcZGVsYXlldnQuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHV0aWxcXGRldmljZWV2dG5hbWUuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHV0aWxcXHB1Ymxpc2hlclMuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHV0aWxcXHJlc2l6ZS5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdXRpbFxccndjb250cm9sbGVyLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1dGlsXFxzY3JvbGwuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHV0aWxcXHRvb2wuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHV0aWxcXHdpbnJlc2l6ZS5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdXRpbFxcd2luc2Nyb2xsLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1dGlsXFx3b3JrZXJDb250cm9sLmpzIiwiLi4vbm9kZS1pby1mZXRjaC9pbmRleC5qcyIsIi4uL25vZGUtaW8tZmV0Y2gvaW8uanMiLCIuLi9ub2RlLWlvLWZldGNoL2lvY29uZmlnLmpzIiwiLi4vbm9kZS1pby1mZXRjaC9ub2RlX21vZHVsZXMvd2hhdHdnLWZldGNoL2ZldGNoLmpzIiwiLi4vdG9vbC9ub2RlX21vZHVsZXMvcHVueWNvZGUvcHVueWNvZGUuanMiLCIuLi90b29sL25vZGVfbW9kdWxlcy9xdWVyeXN0cmluZy1lczMvZGVjb2RlLmpzIiwiLi4vdG9vbC9ub2RlX21vZHVsZXMvcXVlcnlzdHJpbmctZXMzL2VuY29kZS5qcyIsIi4uL3Rvb2wvbm9kZV9tb2R1bGVzL3F1ZXJ5c3RyaW5nLWVzMy9pbmRleC5qcyIsIi4uL3Rvb2wvbm9kZV9tb2R1bGVzL3VybC91cmwuanMiLCIuLi90b29sL25vZGVfbW9kdWxlcy91cmwvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3RGQTtBQUNBOztBQUVBLElB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDN0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDN2NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3JoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNXRCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG52YXIgdG9TdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG52YXIgaXNBcnJheSA9IGZ1bmN0aW9uIGlzQXJyYXkoYXJyKSB7XG5cdGlmICh0eXBlb2YgQXJyYXkuaXNBcnJheSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdHJldHVybiBBcnJheS5pc0FycmF5KGFycik7XG5cdH1cblxuXHRyZXR1cm4gdG9TdHIuY2FsbChhcnIpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcblxudmFyIGlzUGxhaW5PYmplY3QgPSBmdW5jdGlvbiBpc1BsYWluT2JqZWN0KG9iaikge1xuXHRpZiAoIW9iaiB8fCB0b1N0ci5jYWxsKG9iaikgIT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0dmFyIGhhc093bkNvbnN0cnVjdG9yID0gaGFzT3duLmNhbGwob2JqLCAnY29uc3RydWN0b3InKTtcblx0dmFyIGhhc0lzUHJvdG90eXBlT2YgPSBvYmouY29uc3RydWN0b3IgJiYgb2JqLmNvbnN0cnVjdG9yLnByb3RvdHlwZSAmJiBoYXNPd24uY2FsbChvYmouY29uc3RydWN0b3IucHJvdG90eXBlLCAnaXNQcm90b3R5cGVPZicpO1xuXHQvLyBOb3Qgb3duIGNvbnN0cnVjdG9yIHByb3BlcnR5IG11c3QgYmUgT2JqZWN0XG5cdGlmIChvYmouY29uc3RydWN0b3IgJiYgIWhhc093bkNvbnN0cnVjdG9yICYmICFoYXNJc1Byb3RvdHlwZU9mKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Ly8gT3duIHByb3BlcnRpZXMgYXJlIGVudW1lcmF0ZWQgZmlyc3RseSwgc28gdG8gc3BlZWQgdXAsXG5cdC8vIGlmIGxhc3Qgb25lIGlzIG93biwgdGhlbiBhbGwgcHJvcGVydGllcyBhcmUgb3duLlxuXHR2YXIga2V5O1xuXHRmb3IgKGtleSBpbiBvYmopIHsvKiovfVxuXG5cdHJldHVybiB0eXBlb2Yga2V5ID09PSAndW5kZWZpbmVkJyB8fCBoYXNPd24uY2FsbChvYmosIGtleSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGV4dGVuZCgpIHtcblx0dmFyIG9wdGlvbnMsIG5hbWUsIHNyYywgY29weSwgY29weUlzQXJyYXksIGNsb25lLFxuXHRcdHRhcmdldCA9IGFyZ3VtZW50c1swXSxcblx0XHRpID0gMSxcblx0XHRsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoLFxuXHRcdGRlZXAgPSBmYWxzZTtcblxuXHQvLyBIYW5kbGUgYSBkZWVwIGNvcHkgc2l0dWF0aW9uXG5cdGlmICh0eXBlb2YgdGFyZ2V0ID09PSAnYm9vbGVhbicpIHtcblx0XHRkZWVwID0gdGFyZ2V0O1xuXHRcdHRhcmdldCA9IGFyZ3VtZW50c1sxXSB8fCB7fTtcblx0XHQvLyBza2lwIHRoZSBib29sZWFuIGFuZCB0aGUgdGFyZ2V0XG5cdFx0aSA9IDI7XG5cdH0gZWxzZSBpZiAoKHR5cGVvZiB0YXJnZXQgIT09ICdvYmplY3QnICYmIHR5cGVvZiB0YXJnZXQgIT09ICdmdW5jdGlvbicpIHx8IHRhcmdldCA9PSBudWxsKSB7XG5cdFx0dGFyZ2V0ID0ge307XG5cdH1cblxuXHRmb3IgKDsgaSA8IGxlbmd0aDsgKytpKSB7XG5cdFx0b3B0aW9ucyA9IGFyZ3VtZW50c1tpXTtcblx0XHQvLyBPbmx5IGRlYWwgd2l0aCBub24tbnVsbC91bmRlZmluZWQgdmFsdWVzXG5cdFx0aWYgKG9wdGlvbnMgIT0gbnVsbCkge1xuXHRcdFx0Ly8gRXh0ZW5kIHRoZSBiYXNlIG9iamVjdFxuXHRcdFx0Zm9yIChuYW1lIGluIG9wdGlvbnMpIHtcblx0XHRcdFx0c3JjID0gdGFyZ2V0W25hbWVdO1xuXHRcdFx0XHRjb3B5ID0gb3B0aW9uc1tuYW1lXTtcblxuXHRcdFx0XHQvLyBQcmV2ZW50IG5ldmVyLWVuZGluZyBsb29wXG5cdFx0XHRcdGlmICh0YXJnZXQgIT09IGNvcHkpIHtcblx0XHRcdFx0XHQvLyBSZWN1cnNlIGlmIHdlJ3JlIG1lcmdpbmcgcGxhaW4gb2JqZWN0cyBvciBhcnJheXNcblx0XHRcdFx0XHRpZiAoZGVlcCAmJiBjb3B5ICYmIChpc1BsYWluT2JqZWN0KGNvcHkpIHx8IChjb3B5SXNBcnJheSA9IGlzQXJyYXkoY29weSkpKSkge1xuXHRcdFx0XHRcdFx0aWYgKGNvcHlJc0FycmF5KSB7XG5cdFx0XHRcdFx0XHRcdGNvcHlJc0FycmF5ID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdGNsb25lID0gc3JjICYmIGlzQXJyYXkoc3JjKSA/IHNyYyA6IFtdO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Y2xvbmUgPSBzcmMgJiYgaXNQbGFpbk9iamVjdChzcmMpID8gc3JjIDoge307XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdC8vIE5ldmVyIG1vdmUgb3JpZ2luYWwgb2JqZWN0cywgY2xvbmUgdGhlbVxuXHRcdFx0XHRcdFx0dGFyZ2V0W25hbWVdID0gZXh0ZW5kKGRlZXAsIGNsb25lLCBjb3B5KTtcblxuXHRcdFx0XHRcdC8vIERvbid0IGJyaW5nIGluIHVuZGVmaW5lZCB2YWx1ZXNcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiBjb3B5ICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHRcdFx0dGFyZ2V0W25hbWVdID0gY29weTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvLyBSZXR1cm4gdGhlIG1vZGlmaWVkIG9iamVjdFxuXHRyZXR1cm4gdGFyZ2V0O1xufTtcblxuIiwiLy8gcmVxdWlyZSgnY29yZS1qcy9mbi9vYmplY3QvZW50cmllcycpO1xyXG4vLyByZXF1aXJlKCdjb3JlLWpzL2VzNi9wcm9taXNlJyk7XHJcblxyXG5jb25zdCBNb2RlbCA9IHJlcXVpcmUoJy4vbW9kZWwnKSxcclxuICAgICAgQmFzZVZpZXcgPSByZXF1aXJlKCdjb3JlLWJhc2V2aWV3Jyk7XHJcblxyXG5CYXNlVmlldy5yZWdpc3Rlcih7XHJcbiAgICBfaW5pdDogZnVuY3Rpb24oKXtcclxuICAgICAgICBNb2RlbC5saXN0ZGF0YSh7XHJcbiAgICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgdXNlcm5hbWU6ICd6bXInLFxyXG4gICAgICAgICAgICAgICAgIHNleDogJ+WlsydcclxuICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihsaXN0KXtcclxuICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhsaXN0KTtcclxuICAgICAgICAgICAgIH1cclxuICAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0pO1xyXG4iLCIvKipcclxuICog5pS+5Yiw6Ieq5bex6aG555uu5Lit77yM57uf5LiA5a6a5LmJ55qEaW/lpITnkIblsYJcclxuICpcclxuICog5L2/55SobnBt5YyF77yabm9kZS1pby1mZXRjaOWunueOsFxyXG4gKi9cclxuY29uc3Qge0lvQ29uZmlnLElvfSA9IHJlcXVpcmUoJ25vZGUtaW8tZmV0Y2gnKTtcclxuY29uc3QgZXh0ZW5kID0gcmVxdWlyZSgnZXh0ZW5kJyk7XHJcblxyXG4vKipcclxuICog6K6+572u6Ieq5bex55qE6YWN572uXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIOWmguaenGRhdGHmmK9qc29u77yM5LiUbWV0aG9k5LiN5pivR0VU5oiWSEVBRO+8jOaYr+WQpuWwhmRhdGHmoLzlvI/ljJbmiJBmb3JtLWRhdGHmlbDmja7kvKDpgJJcclxuICogQHR5cGUge0Jvb2xlYW59XHJcbiAqL1xyXG5Jb0NvbmZpZy5pb3BhcmFtcy5pc2Zvcm1kYXRhID0gdHJ1ZTtcclxuLyoqXHJcbiAqIOS4muWKoemUmeivr+adoeS7tumFjee9rlxyXG4gKiBAcGFyYW0gIHtbdHlwZV19IHJlc3VsdCBbZGVzY3JpcHRpb25dXHJcbiAqIEByZXR1cm4ge1t0eXBlXX0gICAgICAgIFtkZXNjcmlwdGlvbl1cclxuICovXHJcbklvQ29uZmlnLmZhaWwuZmlsdGVyID0gZnVuY3Rpb24ocmVzdWx0KXtcclxuICAgIGlmKHJlc3VsdC5jb2RlICE9ICdBMDAwMScpe1xyXG4gICAgICAgIHJldHVybiB0cnVlOyAvL+ivtOaYjuWPkeeUn+S6huS4muWKoemUmeivr1xyXG4gICAgfWVsc2V7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogaW/or7fmsYLlj5HpgIHliY3miafooYxcclxuICogQHJldHVybiB7W3R5cGVdfSBbZGVzY3JpcHRpb25dXHJcbiAqL1xyXG5Jb0NvbmZpZy5pb3BhcmFtcy5iZWZvcmVTZW5kID0gZnVuY3Rpb24oKXtcclxuICAgIGNvbnNvbGUubG9nKCfor7fmsYLlvIDlp4snKTtcclxuICAgIC8vIF9BUFAuTG9hZGluZy5zaG93KCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBpb+ivt+axgue7k+adn+WQjlxyXG4gKi9cclxuSW9Db25maWcuaW9wYXJhbXMuY29tcGxldGUgPSBmdW5jdGlvbigpe1xyXG4gICAgY29uc29sZS5sb2coJ+ivt+axgue7k+adnycpO1xyXG4gICAgLy8gX0FQUC5Mb2FkaW5nLmhpZGUoKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOe9kee7nOmUmeivr+aIluiAheezu+e7n+mUmeivr1xyXG4gKiBAcGFyYW0gIHtbdHlwZV19IGVycm9yIFtkZXNjcmlwdGlvbl1cclxuICogQHJldHVybiB7W3R5cGVdfSAgICAgICBbZGVzY3JpcHRpb25dXHJcbiAqL1xyXG5Jb0NvbmZpZy5pb3BhcmFtcy5lcnJvciA9IGZ1bmN0aW9uKGVycm9yKXtcclxuICAgIC8vZXJyb3LmiJbmnInmiJbml6AgZXJyb3IubWVzc2FnZVxyXG4gICAgX0FQUC5Ub2FzdC5zaG93KGVycm9yLm1lc3NhZ2UgfHwgJ+S6su+8jOW/meS4jei/h+adpeS6hicpO1xyXG59XHJcblxyXG4vKipcclxuICog5Lia5Yqh6ZSZ6K+v5aSE55CGXHJcbiAqIEBwYXJhbSAge1t0eXBlXX0gcmVzdWx0ICAgW2Rlc2NyaXB0aW9uXVxyXG4gKiBAcGFyYW0gIHtbdHlwZV19IHJlc3BvbnNlIFtkZXNjcmlwdGlvbl1cclxuICogQHJldHVybiB7W3R5cGVdfSAgICAgICAgICBbZGVzY3JpcHRpb25dXHJcbiAqL1xyXG5Jb0NvbmZpZy5pb3BhcmFtcy5mYWlsID0gZnVuY3Rpb24ocmVzdWx0LHJlc3BvbnNlKXtcclxuICAgIGlmKHJlc3VsdC5jb2RlID09ICdBMDAwMicpe1xyXG4gICAgICAgIF9BUFAuVG9hc3Quc2hvdygn5pyq55m75b2VJyk7XHJcbiAgICB9ZWxzZXtcclxuICAgICAgICBfQVBQLlRvYXN0LnNob3cocmVzdWx0LmVycm1zZyB8fCAn5Lqy77yM5b+Z5LiN6L+H5p2l5LqGJyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDosIPnlKjku6XkuIvmlrnms5XnmoTml7blgJnvvIxvcHTlpoJpb3BhcmFtc+OAguS9huaYr+S4gOiIrOWPquS8oOS7peS4i+WPguaVsOWwseWPr+S7peS6hu+8mlxyXG4gKiAgIGRhdGEgc3VjY2Vzc1xyXG4gKiAgIOS7peS4i+aWueazleW3sue7j+e7n+S4gOWkhOeQhuS6hu+8jOWmguaenOaDs+imhuebluiHquihjOS8oOWFpVxyXG4gKiAgIGJlZm9yZVNlbmQgZXJyb3IgZmFpbCBjb21wbGV0ZVxyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICAvL2xpc3RkYXRh5o6l5Y+jXHJcbiAgICBsaXN0ZGF0YShvcHQpe1xyXG4gICAgICAgIElvLnJlcXVlc3QoZXh0ZW5kKHRydWUse1xyXG4gICAgICAgICAgICByZXF1ZXN0OiB7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB1cmw6ICdodHRwOi8vMTI3LjAuMC4xOjgwMDAvbGlzdGRhdGEnXHJcbiAgICAgICAgfSxvcHQpKTtcclxuICAgIH1cclxufTtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcg6aG16Z2i5Z+65pysdmlld+exu+OAguacgOe7iOS4muWKoemhueebruS4reiQveWcsOmhteeahGpz6YO95b+F6aG75byV55So5q2kanPmiJblhbblrZDnsbtcclxuICogQHZlcnNpb24gMS4wIHwgMjAxNi0xMi0yMCDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAcmV0dXJuXHJcbiAqICovXHJcblxyXG4gY29uc3QgQWxlcnQgPSByZXF1aXJlKCcuLi91aS91aS5hbGVydC5qcycpLFxyXG4gICAgICAgQ29uZmlybSA9IHJlcXVpcmUoJy4uL3VpL3VpLmNvbmZpcm0uanMnKSxcclxuICAgICAgIFRvYXN0ID0gcmVxdWlyZSgnLi4vdWkvdWkudG9hc3QuanMnKSxcclxuICAgICAgIExvYWRpbmcgPSByZXF1aXJlKCcuLi91aS91aS5sb2FkaW5nLmpzJyksXHJcbiAgICAgICBUb29sID0gcmVxdWlyZSgnbGlidXRpbC10b29sJyk7XHJcblxyXG5jbGFzcyBCYXNlVmlldyB7XHJcbiAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgIHRoaXMubmFtZSA9ICd6bXJkbGInO1xyXG4gICAgICAgIC8v57uR5a6a5LiA5Lqb5bi455So55qE57uE5Lu25Yiw5YWo5bGA5Y+Y6YePXHJcbiAgICAgICAgd2luZG93Ll9BUFAgPSB7fTtcclxuICAgICAgICBfQVBQLkFsZXJ0ID0gQWxlcnQ7XHJcbiAgICAgICAgX0FQUC5Db25maXJtID0gQ29uZmlybTtcclxuICAgICAgICBfQVBQLlRvYXN0ID0gVG9hc3Q7XHJcbiAgICAgICAgX0FQUC5Mb2FkaW5nID0gTG9hZGluZztcclxuICAgICAgICBfQVBQLlRvb2wgPSBUb29sO1xyXG4gICAgfVxyXG5cclxuICAgIGluaXQoKXtcclxuICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDms6jlhozkuIDkuKrpobXpnaJcclxuICAgICAqIEBwYXJhbSAge09iamVjdH0gb3B0IOmHjOmdoumFjee9rueahOaJgOacieaWueazlemDvea0vueUn+e7mUJhc2VWaWV355qE5a6e5L6LXHJcbiAgICAgKiB7XHJcbiAgICAgKiAgICAgIF9pbml0OiDmraTmlrnms5Xlv4XpobvmnInvvIzpobXpnaLliJ3lp4vljJbmiafooYxcclxuICAgICAqIH1cclxuICAgICAqIEByZXR1cm4ge2luc3RhbmNlIG9mIEJhc2VWaWV3fSAgICAgW2Rlc2NyaXB0aW9uXVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgcmVnaXN0ZXIob3B0KXtcclxuICAgICAgICB2YXIgdCA9IG5ldyB0aGlzKCk7XHJcbiAgICAgICAgZm9yKHZhciBrZXkgaW4gb3B0KXtcclxuICAgICAgICAgICAgdFtrZXldID0gb3B0W2tleV07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL+WIneWni+WMllxyXG4gICAgICAgIHQuaW5pdCgpO1xyXG5cclxuICAgICAgICByZXR1cm4gdDtcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCYXNlVmlldztcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBcIjxkaXYgY2xhc3M9XFxcInRpdGxlIGpzLXRpdGxlXFxcIj7mj5DnpLo8L2Rpdj48ZGl2IGNsYXNzPVxcXCJib2R5IGpzLWNvbnRlbnRcXFwiPjwvZGl2PjxkaXYgY2xhc3M9Zm9vdGVyPjxhIGhyZWY9amF2YXNjcmlwdDo7IGNsYXNzPWpzLW9rPuehruWumjwvYT48L2Rpdj5cIjtcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IOWFrOWFsWFsZXJ05by55bGCXHJcbiAqIEB2ZXJzaW9uIDEuMCB8IDIwMTYtMTEtMTQg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQHJldHVyblxyXG4gKiAqL1xyXG5cclxuIGNvbnN0IEFsZXJ0U2luZ2xlID0gcmVxdWlyZSgnbGlibGF5ZXItYWxlcnRTaW5nbGUnKSxcclxuICAgICAgICBDc3NzdXBvcnQgPSByZXF1aXJlKCdsaWJ1dGlsLWNzc3N1cG9ydCcpLFxyXG4gICAgICAgIFRwbCA9IHJlcXVpcmUoJy4vdWkuYWxlcnQuaHRtbCcpO1xyXG5cclxuQWxlcnRTaW5nbGUuaGlkZWRlc3Ryb3kgPSBmYWxzZTtcclxuXHJcbkFsZXJ0U2luZ2xlLnNldGNvbmZpZyh7XHJcbiAgICBsYXllcjoge1xyXG4gICAgICAgIGNsYXNzbmFtZTogJ2NvcmV1aS1nLWxheWVyIGNvcmV1aS1nLXdhcm5sYXllciBjb3JldWktZy1sYXllci1hbGVydCcsXHJcbiAgICAgICAgY3VzdG9tOiB7XHJcbiAgICAgICAgICAgIGhpZGU6IGZ1bmN0aW9uKGxheWVyKXtcclxuICAgICAgICAgICAgICAgIGxheWVyLnJlbW92ZUNsYXNzKCdzaG93LXVwJykuYWRkQ2xhc3MoJ2hpZGUtdXAnKTtcclxuICAgICAgICAgICAgICAgIGlmKENzc3N1cG9ydC50cmFuc2l0aW9uKXtcclxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxheWVyLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgQWxlcnRTaW5nbGUuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sMzAwKTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIGxheWVyLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICBBbGVydFNpbmdsZS5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgbWFzazoge1xyXG4gICAgICAgIGNsYXNzbmFtZTogJ2NvcmV1aS1nLW1hc2snLFxyXG4gICAgICAgIG9wYWNpdHk6IENzc3N1cG9ydC50cmFuc2l0aW9uPyAwOiAwLjYsXHJcbiAgICAgICAgY3VzdG9tOiB7XHJcbiAgICAgICAgICAgIGhpZGU6IGZ1bmN0aW9uKG1hc2spe1xyXG4gICAgICAgICAgICAgICAgaWYoQ3Nzc3Vwb3J0LnRyYW5zaXRpb24pe1xyXG4gICAgICAgICAgICAgICAgICAgIG1hc2suY3NzKCdvcGFjaXR5JywwKTtcclxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hc2suaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sMzAwKTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIG1hc2suaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzaG93OiBmdW5jdGlvbihtYXNrKXtcclxuICAgICAgICAgICAgICAgIGlmKENzc3N1cG9ydC50cmFuc2l0aW9uKXtcclxuICAgICAgICAgICAgICAgICAgICBtYXNrLnNob3coKS5jc3MoJ29wYWNpdHknLDAuNik7XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICBtYXNrLnNob3coKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBhbGVydDoge1xyXG4gICAgICAgIGZyYW1ldHBsOiBUcGxcclxuICAgIH1cclxufSk7XHJcblxyXG5BbGVydFNpbmdsZS5jcmVhdGVjYWwuYWRkKGZ1bmN0aW9uKGxheWVyb2JqKXtcclxuICAgIGxheWVyb2JqLmxheWVyLmFkZENsYXNzKCdoaWRlLXVwJyk7XHJcblxyXG4gICAgbGF5ZXJvYmoucG9zLnBvc2NhbC5hZGQoZnVuY3Rpb24oKXtcclxuICAgICAgICBsYXllcm9iai5sYXllci5yZW1vdmVDbGFzcygnaGlkZS11cCcpLmFkZENsYXNzKCdzaG93LXVwJyk7XHJcbiAgICB9KTtcclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEFsZXJ0U2luZ2xlO1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFwiPGRpdiBjbGFzcz1cXFwidGl0bGUganMtdGl0bGVcXFwiPuaPkOekujwvZGl2PjxkaXYgY2xhc3M9XFxcImJvZHkganMtY29udGVudFxcXCI+PC9kaXY+PGRpdiBjbGFzcz1mb290ZXI+PGEgaHJlZj1qYXZhc2NyaXB0OjsgY2xhc3M9XFxcImNhbmNlbCBqcy1jYW5jZWxcXFwiPuWPlua2iDwvYT4gPGEgaHJlZj1qYXZhc2NyaXB0OjsgY2xhc3M9anMtb2s+56Gu5a6aPC9hPiA8aSBjbGFzcz1zcGxpdD48L2k+PC9kaXY+XCI7XG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyDlhazlhbFjb25maXJt5by55bGCXHJcbiAqIEB2ZXJzaW9uIDEuMCB8IDIwMTctMDEtMDYg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQHJldHVyblxyXG4gKiAqL1xyXG5cclxuIGNvbnN0IENvbmZpcm1TaW5nbGUgPSByZXF1aXJlKCdsaWJsYXllci1jb25maXJtU2luZ2xlJyksXHJcbiAgICAgICAgQ3Nzc3Vwb3J0ID0gcmVxdWlyZSgnbGlidXRpbC1jc3NzdXBvcnQnKSxcclxuICAgICAgICBUcGwgPSByZXF1aXJlKCcuL3VpLmNvbmZpcm0uaHRtbCcpO1xyXG5cclxuQ29uZmlybVNpbmdsZS5oaWRlZGVzdHJveSA9IGZhbHNlO1xyXG5cclxuQ29uZmlybVNpbmdsZS5zZXRjb25maWcoe1xyXG4gICAgbGF5ZXI6IHtcclxuICAgICAgICBjbGFzc25hbWU6ICdjb3JldWktZy1sYXllciBjb3JldWktZy13YXJubGF5ZXIgY29yZXVpLWctbGF5ZXItY29uZmlybScsXHJcbiAgICAgICAgY3VzdG9tOiB7XHJcbiAgICAgICAgICAgIGhpZGU6IGZ1bmN0aW9uKGxheWVyKXtcclxuICAgICAgICAgICAgICAgIGxheWVyLnJlbW92ZUNsYXNzKCdzaG93LXVwJykuYWRkQ2xhc3MoJ2hpZGUtdXAnKTtcclxuICAgICAgICAgICAgICAgIGlmKENzc3N1cG9ydC50cmFuc2l0aW9uKXtcclxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxheWVyLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgQ29uZmlybVNpbmdsZS5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwzMDApO1xyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgbGF5ZXIuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIENvbmZpcm1TaW5nbGUuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIG1hc2s6IHtcclxuICAgICAgICBjbGFzc25hbWU6ICdjb3JldWktZy1tYXNrJyxcclxuICAgICAgICBvcGFjaXR5OiBDc3NzdXBvcnQudHJhbnNpdGlvbj8gMDogMC42LFxyXG4gICAgICAgIGN1c3RvbToge1xyXG4gICAgICAgICAgICBoaWRlOiBmdW5jdGlvbihtYXNrKXtcclxuICAgICAgICAgICAgICAgIGlmKENzc3N1cG9ydC50cmFuc2l0aW9uKXtcclxuICAgICAgICAgICAgICAgICAgICBtYXNrLmNzcygnb3BhY2l0eScsMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXNrLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9LDMwMCk7XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICBtYXNrLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2hvdzogZnVuY3Rpb24obWFzayl7XHJcbiAgICAgICAgICAgICAgICBpZihDc3NzdXBvcnQudHJhbnNpdGlvbil7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFzay5zaG93KCkuY3NzKCdvcGFjaXR5JywwLjYpO1xyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFzay5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgY29uZmlybToge1xyXG4gICAgICAgIGZyYW1ldHBsOiBUcGxcclxuICAgIH1cclxufSk7XHJcblxyXG5Db25maXJtU2luZ2xlLmNyZWF0ZWNhbC5hZGQoZnVuY3Rpb24obGF5ZXJvYmope1xyXG4gICAgbGF5ZXJvYmoubGF5ZXIuYWRkQ2xhc3MoJ2hpZGUtdXAnKTtcclxuXHJcbiAgICBsYXllcm9iai5wb3MucG9zY2FsLmFkZChmdW5jdGlvbigpe1xyXG4gICAgICAgIGxheWVyb2JqLmxheWVyLnJlbW92ZUNsYXNzKCdoaWRlLXVwJykuYWRkQ2xhc3MoJ3Nob3ctdXAnKTtcclxuICAgIH0pO1xyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29uZmlybVNpbmdsZTtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcg5Lia5Yqh5Z+65pys5by55bGC57G777yM5aGr5YWF5LqG5LiA5Lqb5qC35byP44CC5Lia5Yqh5omA5pyJ6Ieq5a6a5LmJ5by55bGC5bCG57un5om/5q2k57G7XHJcbiAqIEB2ZXJzaW9uIDEuMCB8IDIwMTYtMTEtMTQg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQHJldHVyblxyXG4gKiAqL1xyXG5cclxuIGNvbnN0IEJvbWJMYXllciA9IHJlcXVpcmUoJ2xpYmxheWVyLWJvbWJMYXllcicpLFxyXG4gICAgICAgIENzc3N1cG9ydCA9IHJlcXVpcmUoJ2xpYnV0aWwtY3Nzc3Vwb3J0Jyk7XHJcblxyXG5jbGFzcyBVSUxheWVyIGV4dGVuZHMgQm9tYkxheWVyIHtcclxuICAgIC8qKlxyXG5cdCAqIOW8ueWxguexu+KAlOKAlOWIm+W7uuW5tua3u+WKoOWIsOaMh+WumuWuueWZqOS4rVxyXG4gICAgICogQHBhcmFtIHtKU09OfSBjb25maWcg5by55bGC6YWN572u5Y+C5pWwIO+8jOS4jeaYr+W/heWhq+mhuVxyXG4gICAgICogXHRcdHtcclxuICAgICAqIFx0ICAgICAgIGNvbnRhaW5lciB7RWxlbWVudH0g5a2Y5pS+5by55bGC55qE5a655Zmo44CC5Y+v5LiN5oyH5a6a77yM6buY6K6k5by55bGC5a2Y5pS+5LqOYm9keeS4reeahOS4gOS4quWKqOaAgeeUn+aIkOeahGRpdumHjFxyXG4gICAgICogXHQgICAgICAgcG9zOnt9LCAvL+WumuS9jeWPguaVsO+8jOWFt+S9k+ivtOaYjuWPr+ingeaWueazlWxheWVyL3Bvc2l0aW9uQm9tYuS4reeahGNvbmZpZ+ivtOaYjlxyXG4gICAgICogICAgICAgICBsYXllcjoge30sIC8v5by55bGC5L+h5oGv5Y+C5pWw77yM5YW35L2T6K+05piO5Y+v6KeB5pa55rOVbGF5ZXIvbGF5ZXLkuK3nmoRjb25maWfor7TmmI5cclxuICAgICAqIFx0XHQgICBtYXNrOiB7IC8v6YGu572p5L+h5oGv5Y+C5pWw77yM5YW35L2T6K+05piO5Y+v6KeB5pa55rOVbGF5ZXIvbWFza+S4reeahGNvbmZpZ+ivtOaYjuOAguWcqOatpOWfuuehgOS4iui/m+ihjOS7peS4i+aJqeWxlVxyXG4gICAgICogXHRcdFx0ICBtYXNrOiB0cnVlLCAvL+aYr+WQpuWIm+W7uumBrue9qVxyXG4gICAgICogICAgICAgICAgICBjbWxoaWRlOiBmYWxzZSAvL+eCueWHu+mBrue9qeaYr+WQpuWFs+mXreW8ueWxglxyXG4gICAgICogXHRcdCAgIH1cclxuICAgICAqICAgICAgfVxyXG5cdCAqL1xyXG4gICAgY29uc3RydWN0b3IoY29uZmlnKXtcclxuICAgICAgICAvL+a3u+WKoOiHquWumuS5ieWPguaVsFxyXG4gICAgICAgIGNvbmZpZyA9ICQuZXh0ZW5kKHRydWUse1xyXG4gICAgICAgICAgICBsYXllcjoge1xyXG4gICAgICAgICAgICAgICAgY2xhc3NuYW1lOiAnY29yZXVpLWctbGF5ZXInLFxyXG4gICAgICAgICAgICAgICAgc2hvdzogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBjdXN0b206IHtcclxuICAgICAgICAgICAgICAgICAgICBoaWRlOiBmdW5jdGlvbihsYXllcil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxheWVyLnJlbW92ZUNsYXNzKCdzaG93LXVwJykuYWRkQ2xhc3MoJ2hpZGUtdXAnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoQ3Nzc3Vwb3J0LnRyYW5zaXRpb24pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxheWVyLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5oaWRlYWZ0ZXJjYWwuZmlyZSgpOyAvL+WxgumakOiXj+WQjuWbnuiwg1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwzMDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxheWVyLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmhpZGVhZnRlcmNhbC5maXJlKCk7IC8v5bGC6ZqQ6JeP5ZCO5Zue6LCDXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG1hc2s6IHtcclxuICAgICAgICAgICAgICAgIGNsYXNzbmFtZTogJ2NvcmV1aS1nLW1hc2snLFxyXG4gICAgICAgICAgICAgICAgb3BhY2l0eTogQ3Nzc3Vwb3J0LnRyYW5zaXRpb24/IDA6IDAuNixcclxuICAgICAgICAgICAgICAgIGN1c3RvbToge1xyXG4gICAgICAgICAgICAgICAgICAgIGhpZGU6IGZ1bmN0aW9uKG1hc2spe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihDc3NzdXBvcnQudHJhbnNpdGlvbil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXNrLmNzcygnb3BhY2l0eScsMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFzay5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LDMwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFzay5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHNob3c6IGZ1bmN0aW9uKG1hc2spe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihDc3NzdXBvcnQudHJhbnNpdGlvbil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXNrLnNob3coKS5jc3MoJ29wYWNpdHknLDAuNik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFzay5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LGNvbmZpZyB8fCB7fSk7XHJcblxyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB2YXIgX2xheWVyID0gdGhpcy5sYXllcjtcclxuXHJcbiAgICAgICAgX2xheWVyLmFkZENsYXNzKCdoaWRlLXVwJyk7XHJcblxyXG4gICAgICAgIHRoaXMucG9zLnBvc2NhbC5hZGQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgX2xheWVyLnJlbW92ZUNsYXNzKCdoaWRlLXVwJykuYWRkQ2xhc3MoJ3Nob3ctdXAnKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBoaWRlKCl7XHJcbiAgICAgICAgaWYodGhpcy5pc3Nob3coKSl7XHJcblx0XHRcdHRoaXMuaGlkZWJlZm9yZWNhbC5maXJlKCk7IC8v5bGC6ZqQ6JeP5YmN5Zue6LCDXHJcblx0XHRcdHRoaXMubWFzayAmJiB0aGlzLm1hc2suaGlkZSgpO1xyXG5cdFx0XHR0aGlzLl9oaWRlKCk7XHJcblx0XHR9XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVUlMYXllcjtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcgbG9hZGluZyDmj5DnpLrlsYJcclxuICogQHZlcnNpb24gMS4wIHwgMjAxNi0wMS0wNiDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAcmV0dXJuXHJcbiAqICovXHJcbiBjb25zdCBVSUxheWVyID0gcmVxdWlyZSgnLi91aS5sYXllci5qcycpLFxyXG4gICAgICAgIFdvcmtlckNvbnRyb2wgPSByZXF1aXJlKCdsaWJ1dGlsLXdvcmtlckNvbnRyb2wnKTtcclxuXHJcbnZhciB3b3JrZXJDb250cm9sID0gbmV3IFdvcmtlckNvbnRyb2woKTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUxvYWRpbmcod29ya2VyKXtcclxuICAgIHdvcmtlci5sb2FkaW5nID0gbmV3IFVJTGF5ZXIoe1xyXG4gICAgICAgIGxheWVyOiB7XHJcbiAgICAgICAgICAgIGNsYXNzbmFtZTogJ2NvcmV1aS1nLWxheWVyIGNvcmV1aS1nLWxheWVyLWxvYWRpbmcnXHJcbiAgICAgICAgfSxcclxuICAgICAgICBtYXNrOiB7XHJcbiAgICAgICAgICAgIGJnY29sb3I6ICd0cmFuc3BhcmVudCcgLy/og4zmma/oibJcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB3b3JrZXIubG9hZGluZy5oaWRlYWZ0ZXJjYWwuYWRkKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgd29ya2VyLmxvYWRpbmcuZGVzdHJveSgpO1xyXG4gICAgICAgIHdvcmtlci5sb2FkaW5nID0gbnVsbDtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiB3b3JrZXIubG9hZGluZztcclxufVxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgc2hvdzogZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgbG9hZGluZyA9IGNyZWF0ZUxvYWRpbmcod29ya2VyQ29udHJvbC5nZXQoKSk7XHJcbiAgICAgICAgbG9hZGluZy5zaG93KCk7XHJcbiAgICB9LFxyXG4gICAgaGlkZTogZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgd29ya2VyID0gd29ya2VyQ29udHJvbC5lbmQoKTtcclxuICAgICAgICBpZih3b3JrZXIpe1xyXG4gICAgICAgICAgICB3b3JrZXIubG9hZGluZy5oaWRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IHRvYXN0IOaPkOekuuWxglxyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE2LTAxLTA2IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm5cclxuICogKi9cclxuIGNvbnN0IFVJTGF5ZXIgPSByZXF1aXJlKCcuL3VpLmxheWVyLmpzJyksXHJcbiAgICAgICAgV29ya2VyQ29udHJvbCA9IHJlcXVpcmUoJ2xpYnV0aWwtd29ya2VyQ29udHJvbCcpO1xyXG5cclxudmFyIHdvcmtlckNvbnRyb2wgPSBuZXcgV29ya2VyQ29udHJvbCgpO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlVG9hc3Qod29ya2VyKXtcclxuICAgIHdvcmtlci50b2FzdCA9IG5ldyBVSUxheWVyKHtcclxuICAgICAgICBsYXllcjoge1xyXG4gICAgICAgICAgICBjbGFzc25hbWU6ICdjb3JldWktZy1sYXllciBjb3JldWktZy1sYXllci10b2FzdCdcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1hc2s6IHtcclxuICAgICAgICAgICAgYmdjb2xvcjogJyNmZmYnIC8v6IOM5pmv6ImyXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgd29ya2VyLnRvYXN0LmhpZGVhZnRlcmNhbC5hZGQoZnVuY3Rpb24oKXtcclxuICAgICAgICB3b3JrZXIudG9hc3QuZGVzdHJveSgpO1xyXG4gICAgICAgIHdvcmtlci50b2FzdCA9IG51bGw7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gd29ya2VyLnRvYXN0O1xyXG59XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBzaG93OiBmdW5jdGlvbihjb250ZW50LGhpZGVhZnRlcmNhbCl7XHJcbiAgICAgICAgdmFyIHRvYXN0ID0gY3JlYXRlVG9hc3Qod29ya2VyQ29udHJvbC5nZXQoKSk7XHJcbiAgICAgICAgdG9hc3Quc2V0Q29udGVudChjb250ZW50KTtcclxuICAgICAgICB0b2FzdC5oaWRlYWZ0ZXJjYWwuYWRkKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGlmKHR5cGVvZiBoaWRlYWZ0ZXJjYWwgPT0gJ2Z1bmN0aW9uJyl7XHJcbiAgICAgICAgICAgICAgICBoaWRlYWZ0ZXJjYWwoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRvYXN0LnNob3coKTtcclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHRvYXN0LmhpZGUoKTtcclxuICAgICAgICB9LDIwMDApO1xyXG4gICAgfVxyXG59XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IGFsZXJ057G777yM57un5om/6IeqbGF5ZXIvYm9tYkxheWVy44CC5re75Yqg4oCc56Gu5a6a5oyJ6ZKu4oCd5LqL5Lu25Zue6LCDXHJcbiAqIOWmguaenOW8ueWxguS4reacieS7peS4i+WxnuaAp+eahOiKgueCuVxyXG4gKiBub2RlPVwiY2xvc2VcIu+8jOeCueWHu+WImeS8muWFs+mXreW8ueWxgizlubbop6blj5FoaWRlY2Fs6YCa55+l44CCXHJcbiAqIG5vZGU9XCJva1wi77yM54K55Ye75YiZ6Kem5Y+R4oCc56Gu5a6a5oyJ6ZKu4oCd5LqL5Lu244CB5YWz6Zet5by55bGC77yM5bm26Kem5Y+Rb2tjYWzlkoxoaWRlY2Fs6YCa55+l44CCXHJcbiAqIEB2ZXJzaW9uIDEuMC4wIHwgMjAxNS0wOS0xNCDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAZXhhbXBsZVxyXG4gKiBcdCBjb25zdCBBbGVydCA9IHJlcXVpcmUoJ2xpYmxheWVyLWFsZXJ0Jyk7XHJcbiAqXHJcbiAqIFx0IHZhciBsYXllciA9IG5ldyBBbGVydCh7XHJcbiAqIFx0IFx0YWxlcnQ6IHtcclxuICogXHRcdFx0ZnJhbWV0cGw6IFsgLy/lvLnlsYLln7rmnKzmqKHmnb9cclxuXHRcdFx0XHQnPGRpdiBjbGFzcz1cImpzLXRpdGxlXCI+PC9kaXY+JyxcclxuXHRcdFx0XHQnPGRpdiBjbGFzcz1cImpzLWNvbnRlbnRcIj48L2Rpdj4nLFxyXG5cdFx0XHRcdCc8ZGl2PjxhIGhyZWY9XCJqYXZhc2NyaXB0OjtcIiBjbGFzcz1cImpzLW9rXCI+5aW955qEPC9hPjwvZGl2PidcclxuXHRcdFx0XS5qb2luKCcnKVxyXG4gKiAgICAgIH1cclxuICogICB9KTtcclxuICogICBsYXllci5zaG93Y2FsLmFkZChmdW5jdGlvbih0eXBlKXtzd2l0Y2godHlwZSl7Y2FzZSAnYmVmb3JlJzpjb25zb2xlLmxvZygn5bGC5pi+56S65YmNJyk7YnJlYWs7IGNhc2UgJ2FmdGVyJzpjb25zb2xlLmxvZygn5bGC5pi+56S65ZCOJyk7YnJlYWs7fX0pO1xyXG4gKiAgIGxheWVyLmhpZGVjYWwuYWRkKGZ1bmN0aW9uKHR5cGUpe3N3aXRjaCh0eXBlKXtjYXNlICdiZWZvcmUnOmNvbnNvbGUubG9nKCflsYLpmpDol4/liY0nKTticmVhazsgY2FzZSAnYWZ0ZXInOmNvbnNvbGUubG9nKCflsYLpmpDol4/lkI4nKTticmVhazt9fSk7XHJcbiAqICAgbGF5ZXIub2tjYWwuYWRkKGZ1bmN0aW9uKGUpe2NvbnNvbGUubG9nKCfngrnlh7vkuobnoa7lrponKX0pO1xyXG4gKiAgIGxheWVyLnNldE15Q29udGVudCgn6K6+572ubm9kZT1cImNvbnRlbnRcIuiKgueCueeahGlubmVySFRNTCcpO1xyXG4gKiAgIHZhciBub2RlQXJyID0gbGF5ZXIuZ2V0Tm9kZXMoWyd0aXRsZSddKTsgLy8g6I635Y+WY2xhc3M9XCJqcy10aXRsZVwi55qE6IqC54K5XHJcbiAqICAgbm9kZUFyci50aXRsZS5odG1sKCflhoXlrrnljLpodG1sJyk7XHJcbiAqICAgbGF5ZXIuY29udGVudG5vZGU7IC8v5YaF5a655Yy6bm9kZT1cImNvbnRlbnRcIuiKgueCuVxyXG4gKiAgIGxheWVyLnNob3coKTsgLy/mmL7npLrlsYJcclxuICogICBsYXllci5oaWRlKCk7IC8v6ZqQ6JeP5bGCXHJcbiAqICAgbGF5ZXIubGF5ZXI7IC8v5bGCZG9t6IqC54K55a+56LGhXHJcbiAqICAgbGF5ZXIuY29udGFpbmVyOyAvL+a1ruWxguWuueWZqFxyXG4gKiAgIGxheWVyLmRlc3Ryb3koKTsgLy/plIDmr4HlsYJcclxuICogKi9cclxuY29uc3QgQm9tYkxheWVyID0gcmVxdWlyZSgnLi9ib21iTGF5ZXIuanMnKSxcclxuXHQgICBUcGwgPSByZXF1aXJlKCcuL3RwbC5qcycpO1xyXG5cclxuY2xhc3MgQWxlcnQgZXh0ZW5kcyBCb21iTGF5ZXIge1xyXG5cdC8qKlxyXG5cdCAqIGFsZXJ057G7XHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIOWPguaVsOWQjGxheWVyL2JvbWJMYXllcumHjOmdoueahGNvbmZpZyzlnKjmraTln7rnoYDkuIrlop7liqDlpoLkuIvpu5jorqTphY3nva5cclxuICAgICAqIHtcclxuICAgICAqIFx0ICAqYWxlcnQ6IHtcclxuICAgICAqIFx0XHQgKmZyYW1ldHBsIHtTdHJpbmd9IGFsZXJ05Z+65pys5qih5p2/44CC6KaB5rGC6K+36K+m6KeBbGF5ZXIvdHBs6YeM6Z2iYWxlcnTpobnnmoTopoHmsYJcclxuICAgICAqICAgIH1cclxuICAgICAqIH1cclxuXHQgKi9cclxuXHRjb25zdHJ1Y3Rvcihjb25maWcpIHtcclxuXHRcdHZhciBvcHQgPSAkLmV4dGVuZCh0cnVlLHtcclxuXHRcdFx0YWxlcnQ6IHtcclxuXHRcdFx0XHRmcmFtZXRwbDogVHBsLmFsZXJ0IC8vYWxlcnTlvLnlsYLln7rmnKzmqKHmnb/jgILopoHmsYLor7for6bop4FsYXllci90cGzph4zpnaJhbGVydOmhueeahOimgeaxglxyXG5cdFx0XHR9XHJcblx0XHR9LGNvbmZpZyk7XHJcblx0XHRzdXBlcihvcHQpO1xyXG5cclxuXHRcdHRoaXMuc2V0Q29udGVudChvcHQuYWxlcnQuZnJhbWV0cGwpO1xyXG5cdFx0dGhpcy5jb250ZW50bm9kZSA9IHRoaXMubGF5ZXIuZmluZCgnLmpzLWNvbnRlbnQnKTsgLy/lhoXlrrnljLroioLngrlcclxuXHRcdHRoaXMub2tjYWwgPSAkLkNhbGxiYWNrcygpO1xyXG5cdFx0Ly/kuovku7bnu5HlrppcclxuXHQgICAgdGhpcy5sYXllci5vbignY2xpY2subGliJywgJy5qcy1vaycsIChlKSA9PiB7XHJcblx0ICAgIFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdCAgICBcdHRoaXMub2tjYWwuZmlyZShlKTtcclxuXHRcdFx0dGhpcy5oaWRlKCk7XHJcblx0ICAgIH0pO1xyXG5cdH1cclxuXHQvKipcclxuICAgICAqIOiuvue9rmFsZXJ05YaF5a655Yy65YW35pyJW25vZGU9XCJjb250ZW50XCJd5bGe5oCn55qE6IqC54K555qEaHRtbFxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGh0bWxcclxuICAgICAqL1xyXG5cdHNldE15Q29udGVudChodG1sKSB7XHJcblx0XHRpZih0eXBlb2YgaHRtbCA9PSAnc3RyaW5nJyAmJiB0aGlzLmNvbnRlbnRub2RlLmxlbmd0aCA+IDApe1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRub2RlLmh0bWwoaHRtbCk7XHJcbiAgICAgICAgfVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiDnu4Tku7bplIDmr4FcclxuXHQgKi9cclxuXHRkZXN0cm95KCkge1xyXG5cdFx0dGhpcy5sYXllci5vZmYoJ2NsaWNrLmxpYicsICcuanMtb2snKTtcclxuXHRcdHN1cGVyLmRlc3Ryb3koKTtcclxuXHRcdHRoaXMuY29udGVudG5vZGUgPSBudWxsO1xyXG5cdFx0dGhpcy5va2NhbCA9IG51bGw7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEFsZXJ0O1xyXG4iLCLvu78vKipcclxuICogQGZpbGVvdmVydmlldyBhbGVydOeahOW3peWOguaOp+WItuWZqO+8jOe7p+aJv2Jhc2VDb250cm9sXHJcbiAqIOW6lOeUqOWcuuaZr++8mumSiOWvueeugOWNlWFsZXJ05by55bGC77yM6aKR57mB5pu05pS55by55bGC6YeM5p+Q5Lqb6IqC54K555qE5YaF5a6577yM5Lul5Y+K5pu05pS554K55Ye7XCLnoa7lrppcIuaMiemSruWQjueahOWbnuiwg+S6i+S7tlxyXG4gKiDlpoLmnpzmmK/mm7TlpI3mnYLnmoTkuqTkupLlu7rorq7kvb/nlKhsYXllcnMuYWxlcnTmiJZsYXllcnMuYm9tYkxheWVyXHJcbiAqIEB2ZXJzaW9uIDEuMC4wIHwgMjAxNi0wMS0yNiDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAZXhhbXBsZVxyXG4gKiBjb25zdCBBbGVydENvbnRyb2wgPSByZXF1aXJlKCdsaWJsYXllci1hbGVydENvbnRyb2wnKTtcclxuICpcclxuXHRcdHZhciBjdXJsYXllciA9IG5ldyBBbGVydENvbnRyb2woKTtcclxuXHRcdGN1cmxheWVyLnNldGNvbmZpZyh7XHJcblx0XHRcdGFsZXJ0OiB7XHJcblx0XHRcdFx0ZnJhbWV0cGw6IFtcclxuXHRcdFx0XHQgICAgJzxkaXYgY2xhc3M9XCJqcy10aXRsZVwiPjwvZGl2PicsXHJcblx0XHRcdFx0XHQnPGRpdiBjbGFzcz1cImpzLWNvbnRlbnRcIj48L2Rpdj4nLFxyXG5cdFx0XHRcdFx0JzxkaXY+PGEgaHJlZj1cImphdmFzY3JpcHQ6O1wiIGNsYXNzPVwianMtb2tcIj7lpb3nmoQ8L2E+PC9kaXY+J1xyXG5cdFx0XHRcdF0uam9pbignJylcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHRjdXJsYXllci5zaG93KHtcclxuICAgICAgICAgICAgY29udGVudDogJ+aCqOi/mOacqueZu+mZhidcclxuICAgICAgICB9LHtcclxuICAgICAgICAgICAgb2s6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn54K55Ye75aW955qEJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBjdXJsYXllci5nZXRsYXllcm9iaigp77ybIC8vbGF5ZXIvYWxlcnTnsbvlr7nosaFcclxuICogKi9cclxuIGNvbnN0IEFsZXJ0ID0gcmVxdWlyZSgnLi9hbGVydC5qcycpLFxyXG4gICAgICAgQmFzZUNvbnRyb2wgPSByZXF1aXJlKCcuL2Jhc2VDb250cm9sLmpzJyk7XHJcblxyXG4vKipcclxuKiBhbGVydOW3peWOguaOp+WItuWZqFxyXG4qL1xyXG5jbGFzcyBBbGVydENvbnRyb2wgZXh0ZW5kcyBCYXNlQ29udHJvbCB7XHJcbiAgICBjb25zdHJ1Y3RvcihoaWRlZGVzdHJveSkge1xyXG4gICAgICAgIHN1cGVyKGhpZGVkZXN0cm95KTtcclxuICAgICAgICB0aGlzLl9va2NhbCA9IGZ1bmN0aW9uKCl7fTsgLy/ngrnlh7tva+eahOWbnuiwg+engeacieWtmOWCqOWZqFxyXG5cdFx0dGhpcy5fZnVuYXJyID0gWydvayddOyAvL+WPr+aOp+WItueahOWbnuiwg+aWueazleWQjVxyXG4gICAgfVxyXG4gICAgLyoqXHJcblx0ICog6I635Y+WYWxlcnTlvLnlsYJcclxuXHQgKiBAcGFyYW0ge0Jvb2xlYW59IHJlc2V0IOaYr+WQpumHjeaWsOa4suafk+aooeadv+OAgum7mOiupOS4umZhbHNlXHJcblx0ICovXHJcbiAgICBnZXRsYXllcm9iaihyZXNldCl7XHJcblx0XHRpZih0aGlzLl9sYXllcm9iaiA9PSBudWxsKXtcclxuXHRcdFx0dGhpcy5fbGF5ZXJvYmogPSBuZXcgQWxlcnQodGhpcy5fZGVmYXVsdG9wdCk7XHJcblx0XHRcdHRoaXMuX2xheWVyb2JqLm9rY2FsLmFkZCgoZSkgPT4ge1xyXG5cdFx0XHRcdHRoaXMuX29rY2FsKCk7XHJcblx0XHRcdH0pO1xyXG4gICAgICAgICAgICB0aGlzLl9hZGRjYWxsKCk7XHJcblx0XHR9ZWxzZXtcclxuICAgICAgICAgICAgaWYocmVzZXQpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbGF5ZXJvYmouc2V0Q29udGVudCh0aGlzLl9kZWZhdWx0b3B0LmFsZXJ0LmZyYW1ldHBsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHRcdHJldHVybiB0aGlzLl9sYXllcm9iajtcclxuICAgIH1cclxuICAgIC8qKlxyXG5cdCAqIOmUgOavgWFsZXJ05by55bGCXHJcblx0ICovXHJcbiAgICBkZXN0cm95KCl7XHJcbiAgICAgICAgc3VwZXIuZGVzdHJveSgpO1xyXG4gICAgICAgIHRoaXMuX29rY2FsID0gZnVuY3Rpb24oKXt9O1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEFsZXJ0Q29udHJvbDtcclxuIiwi77u/LyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcgYWxlcnTnsbvljZXkvZPmjqfliLblmajvvIzkuIDoiKznlKjkuo7nroDljZXnmoRjb25maXJt5L+h5oGv5o+Q56S644CCXHJcbiAqIOazqOaEj++8muivpWFsZXJ05o6n5Yi255qE5a+56LGh5Y+KZG9t5Zyo5YWo5bGA5Lit5ZSv5LiA5a2Y5Zyo77yM5aaC5p6c5oOz6KaB5Yib5bu65aSa5Liq77yM6K+35L2/55SobGlibGF5ZXJzL2FsZXJ05oiWbGlibGF5ZXJzL2FsZXJ0Q29udHJvbFxyXG4gKiBAdmVyc2lvbiAxLjAuMCB8IDIwMTUtMDktMTQg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQGV4YW1wbGVcclxuICogICAgICBjb25zdCBBbGVydFNpbmdsZSA9IHJlcXVpcmUoJ2xpYmxheWVyLWFsZXJ0U2luZ2xlJyk7XHJcbiAqXHJcblx0XHRBbGVydFNpbmdsZS5zZXRjb25maWcoe1xyXG5cdFx0XHRhbGVydDoge1xyXG5cdFx0XHRcdGZyYW1ldHBsOiBbXHJcblx0XHRcdFx0ICAgICc8ZGl2IGNsYXNzPVwianMtdGl0bGVcIj48L2Rpdj4nLFxyXG5cdFx0XHRcdFx0JzxkaXYgY2xhc3M9XCJqcy1jb250ZW50XCI+PC9kaXY+JyxcclxuXHRcdFx0XHRcdCc8ZGl2PjxhIGhyZWY9XCJqYXZhc2NyaXB0OjtcIiBjbGFzcz1cImpzLW9rXCI+5aW955qEPC9hPjwvZGl2PidcclxuXHRcdFx0XHRdLmpvaW4oJycpXHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0QWxlcnRTaW5nbGUuZ2V0bGF5ZXJvYmooKe+8myAvL2xheWVyL2FsZXJ057G75a+56LGhXHJcblx0XHRBbGVydFNpbmdsZS5zaG93KHtcclxuICAgICAgICAgICAgY29udGVudDogJ+aCqOi/mOacqueZu+mZhidcclxuICAgICAgICB9LHtcclxuICAgICAgICAgICAgb2s6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn54K55Ye75aW955qEJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICogKi9cclxuXHJcbmNvbnN0IEFsZXJ0Q29udHJvbCA9IHJlcXVpcmUoJy4vYWxlcnRDb250cm9sLmpzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBBbGVydENvbnRyb2woKTtcclxuIiwi77u/LyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcg5Z+65pys55qE5by55bGC5bel5Y6C5o6n5Yi25Zmo77yM5LiN5Y+v55u05o6l5L2/55So77yM5Y+q5Y+v5a2Q57G757un5om/5ZCO5L2/55So44CCXHJcbiAqIOW6lOeUqOWcuuaZr++8mumSiOWvuemikee5geabtOaUueW8ueWxgumHjOafkOS6m+iKgueCueeahOWGheWuue+8jOS7peWPiuabtOaUueeCueWHu+aMiemSruWQjueahOWbnuiwg+S6i+S7tuOAglxyXG4gKiBAdmVyc2lvbiAxLjAuMCB8IDIwMTYtMDEtMjYg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQGV4YW1wbGVcclxuICogICAgICBjb25zdCBCYXNlQ29udHJvbCA9IHJlcXVpcmUoJ2xpYmxheWVyLWJhc2VDb250cm9sJyk7XHJcbiAqXHJcbiAqICovXHJcblxyXG4gY29uc3QgVG9vbCA9IHJlcXVpcmUoJ2xpYnV0aWwtdG9vbCcpO1xyXG5cclxuIGNsYXNzIEJhc2VDb250cm9sIHtcclxuICAgICAvKipcclxuICAgICAgKiDlt6XljoLmqKHlnovmjqfliLblmahcclxuICAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGhpZGVkZXN0cm95IOW8ueWxguWFs+mXreaXtu+8jOaYr+WQpui1sOezu+e7n+m7mOiupOeahOmUgOavgeaTjeS9nOOAgum7mOiupOS4unRydWVcclxuICAgICAgKi9cclxuICAgICBjb25zdHJ1Y3RvcihoaWRlZGVzdHJveSl7XHJcbiAgICAgICAgIHRoaXMuX2xheWVyb2JqID0gbnVsbDsgLy/lvLnlsYLlr7nosaFcclxuIFx0XHQgdGhpcy5fZGVmYXVsdG9wdCA9IHt9OyAvL+m7mOiupGNvbmZpZ+mFjee9ruWPguaVsFxyXG4gXHRcdCB0aGlzLl9mdW5hcnIgPSBbXTsgLy/kvJrmm7/mjaLnmoTlm57osIPmlrnms5XnmoTlhbPplK7or43jgILlpoJbJ29rJywnY2FuY2VsJ11cclxuICAgICAgICAgdGhpcy5jcmVhdGVjYWwgPSAkLkNhbGxiYWNrcygpOyAvL+W8ueWxguWvueixoeWIm+W7uuWQjueahOWbnuiwg1xyXG4gICAgICAgICBpZih0eXBlb2YgaGlkZWRlc3Ryb3kgIT0gJ2Jvb2xlYW4nKXtcclxuICAgICAgICAgICAgIGhpZGVkZXN0cm95ID0gdHJ1ZTtcclxuICAgICAgICAgfVxyXG4gICAgICAgICB0aGlzLmhpZGVkZXN0cm95ID0gaGlkZWRlc3Ryb3k7XHJcbiAgICAgfVxyXG4gICAgIC8qKlxyXG4gXHQgKiAg5Y+C5pWw6K+05piO6K+35Y+C6KeB5a2Q57G75L2/55So55qE5by55bGC57G76YeM6Z2i55qEY29uZmln6K+05piOXHJcbiBcdCAqICDlpoJhbGVydC5qc+OAgmNvbmZpcm0uanNcclxuIFx0ICovXHJcbiAgICAgc2V0Y29uZmlnKGNvbmZpZyl7XHJcbiAgICAgICAgIHRoaXMuX2RlZmF1bHRvcHQgPSBjb25maWc7XHJcbiAgICAgfVxyXG4gICAgIC8qKlxyXG4gXHQgKiDojrflj5blvLnlsYLlr7nosaHvvIzlhbfkvZPnlLHlrZDnsbvlrp7njrBcclxuIFx0ICovXHJcbiAgICAgZ2V0bGF5ZXJvYmooKXtcclxuXHJcbiAgICAgfVxyXG4gICAgIC8qKlxyXG4gXHQgKiDmt7vliqDns7vnu5/lm57osIPvvIznlLHlrZDnsbvliJvlu7rkuoblvLnlsYLlr7nosaHlkI7osIPnlKhcclxuIFx0ICovXHJcbiAgICAgX2FkZGNhbGwoKXtcclxuICAgICAgICAgaWYodGhpcy5oaWRlZGVzdHJveSl7XHJcbiAgICAgICAgICAgICB0aGlzLl9sYXllcm9iai5oaWRlYWZ0ZXJjYWwuYWRkKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICB0aGlzLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICB9XHJcbiAgICAgICAgIHRoaXMuY3JlYXRlY2FsLmZpcmUodGhpcy5fbGF5ZXJvYmopO1xyXG4gICAgIH1cclxuICAgICAvKipcclxuIFx0ICog5pi+56S65by55bGCXHJcbiBcdCAqIEBwYXJhbSB7T2JqZWN0fSAqdHh0IOaWh+ahiOmFjee9rizpgInloavjgILlpoLmnpxzZXRjb25maWfosIPnlKjorr7nva7nmoTmqKHmnb/kuK3ov5jmnInlhbbku5Zub2RlPVwi5YW25LuW5YC8XCLvvIxcclxuIFx0ICogICAgICDlpoJub2RlPVwib3RoZXJcIiDliJnlj6/oh6rooYzmianlsZVcclxuIFx0ICoge1xyXG4gXHQgKiBcdCBjb250ZW50IHtTdHJpbmd9IG5vZGU9XCJjb250ZW50XCLoioLngrnph4zpnaLnmoRodG1sXHJcbiBcdCAqICAgdGl0bGUge1N0cmluZ30gbm9kZT1cInRpdGxlXCLoioLngrnph4zpnaLnmoRodG1sXHJcbiBcdCAqICAgb2sge1N0cmluZ30gbm9kZT1cIm9rXCLoioLngrnph4zpnaLnmoRodG1sXHJcbiBcdCAqIH1cclxuIFx0ICogQHBhcmFtIHtPYmplY3R9IGNhbCDlm57osIPphY3nva5cclxuIFx0ICoge1xyXG4gXHQgKiBcdCDplK7lgLzkuLpfZnVuYXJy5Lit6Led56a755qE5YWz6ZSu6K+NIHtGdW5jdGlvbn0g54K55Ye756Gu5a6a5oyJ6ZKu5ZCO55qE5Zue6LCDXHJcbiBcdCAqIH1cclxuIFx0ICovXHJcbiBcdCBzaG93KHR4dCxjYWwpe1xyXG4gICAgICAgICBpZighVG9vbC5pc09iamVjdCh0eHQpKXtcclxuIFx0XHRcdHRocm93IG5ldyBFcnJvcignYmFzZUNvbnRyb2wtc2hvd+aWueazlXR4dOWPguaVsOW/hemhu+aYr2pzb27lr7nosaEnKTtcclxuIFx0XHR9ZWxzZXtcclxuIFx0XHRcdGlmKFRvb2wuaXNPYmplY3QoY2FsKSl7XHJcbiBcdFx0XHRcdHZhciBmdW5uYW1lID0gdGhpcy5fZnVuYXJyO1xyXG4gXHRcdFx0XHRmb3IodmFyIGN1cm5hbWUgb2YgZnVubmFtZSl7XHJcbiBcdFx0XHRcdFx0aWYoVG9vbC5pc0Z1bmN0aW9uKGNhbFtjdXJuYW1lXSkpe1xyXG4gXHRcdFx0XHRcdFx0dGhpc1snXycrY3VybmFtZSsnY2FsJ10gPSBjYWxbY3VybmFtZV07XHJcbiBcdFx0XHRcdFx0fVxyXG4gXHRcdFx0XHRcdGVsc2V7XHJcbiBcdFx0XHRcdFx0XHR0aGlzWydfJytjdXJuYW1lKydjYWwnXSA9IGZ1bmN0aW9uKCl7fTtcclxuIFx0XHRcdFx0XHR9XHJcbiBcdFx0XHRcdH1cclxuIFx0XHRcdH1lbHNle1xyXG4gXHRcdFx0XHR0aGlzLl9va2NhbCA9IGZ1bmN0aW9uKCl7fTtcclxuIFx0XHRcdH1cclxuIFx0XHRcdC8v6I635Y+WdHh06YeM6Z2i55qE6ZSu5YC8XHJcbiBcdFx0XHR2YXIgbm9kZW5hbWVhcnIgPSBbXTtcclxuIFx0XHRcdGZvcih2YXIgbmFtZSBpbiB0eHQpe1xyXG4gXHRcdFx0XHRub2RlbmFtZWFyci5wdXNoKG5hbWUpO1xyXG4gXHRcdFx0fVxyXG4gXHRcdFx0dGhpcy5nZXRsYXllcm9iaih0cnVlKTtcclxuIFx0XHRcdHZhciBub2RlYXJyID0gdGhpcy5fbGF5ZXJvYmouZ2V0Tm9kZXMobm9kZW5hbWVhcnIpO1xyXG4gXHRcdFx0Zm9yKHZhciBuYW1lIGluIG5vZGVhcnIpe1xyXG4gXHRcdFx0XHRUb29sLmlzU3RyaW5nKHR4dFtuYW1lXSkgJiYgbm9kZWFycltuYW1lXS5odG1sKHR4dFtuYW1lXSk7XHJcbiBcdFx0XHR9XHJcbiBcdFx0XHR0aGlzLl9sYXllcm9iai5zaG93KCk7XHJcbiBcdFx0fVxyXG4gICAgIH1cclxuICAgICAvKipcclxuICAgICAgKiDplIDmr4HlvLnlsYJcclxuICAgICAgKi9cclxuICAgICBkZXN0cm95KCl7XHJcbiAgICAgICAgIGlmKHRoaXMuX2xheWVyb2JqICE9IG51bGwpe1xyXG4gXHRcdFx0dGhpcy5fbGF5ZXJvYmouZGVzdHJveSgpO1xyXG4gXHRcdFx0dGhpcy5fbGF5ZXJvYmogPSBudWxsO1xyXG4gXHRcdH1cclxuICAgICB9XHJcbiB9XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VDb250cm9sO1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyDlvLnlsYLnsbvvvIznu6fmib/oh6psYXllci9sYXllcuOAgum7mOiupOWxheS4reWumuS9je+8jOaYvuekuumBrue9qeOAgu+8iOWmguaenOmcgOWFtuS7lueJueauiumFjee9ruWImeWPguingeWPguaVsOivtOaYju+8iVxyXG4gKiDlpoLmnpzlvLnlsYLkuK3mnInku6XkuIvlsZ7mgKfnmoToioLngrlub2RlPVwiY2xvc2VcIuOAguWImeeCueWHu+ivpeiKgueCueS8muWFs+mXreW8ueWxgu+8jOW5tuinpuWPkWhpZGVjYWzpgJrnn6XjgIJcclxuICogQHZlcnNpb24gMS4wLjAgfCAyMDE1LTA5LTE0IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEBleGFtcGxlXHJcbiAqIFx0IGNvbnN0IEJvbWJMYXllciA9IHJlcXVpcmUoJ2xpYmxheWVyLWJvbWJMYXllcicpO1xyXG4gKlxyXG4gKiAgIHZhciBsYXllciA9IG5ldyBCb21iTGF5ZXIoKTtcclxuICogICAgbGF5ZXIuc2hvd2JlZm9yZWNhbC5hZGQoZnVuY3Rpb24oKXtjb25zb2xlLmxvZygn5bGC5pi+56S65YmNJyk7fSk7XHJcbiAqICAgbGF5ZXIuaGlkZWJlZm9yZWNhbC5hZGQoZnVuY3Rpb24oKXtjb25zb2xlLmxvZygn5bGC6ZqQ6JeP5YmNJyk7fSk7XHJcbiAqICAgbGF5ZXIuc2hvd2FmdGVyY2FsLmFkZChmdW5jdGlvbigpe2NvbnNvbGUubG9nKCflsYLmmL7npLrlkI4nKTt9KTtcclxuICogICBsYXllci5oaWRlYWZ0ZXJjYWwuYWRkKGZ1bmN0aW9uKCl7Y29uc29sZS5sb2coJ+WxgumakOiXj+WQjicpO30pO1xyXG4gKiAgIGxheWVyLnBvcy5wb3NjYWwuYWRkKGZ1bmN0aW9uKCl7Y29uc29sZS5sb2coJ2xheWVy5a6a5L2N5ZCO5Zue6LCDJyl9KTtcclxuICogICBsYXllci5zZXRDb250ZW50KCc8ZGl2IGNsYXNzPVwianMtY29udGVudFwiPjwvZGl2PicpOyAvL+iuvue9rmxheWVy5bGC6YeM6Z2i55qE5YaF5a65XHJcbiAqICAgbGF5ZXIuZ2V0Tm9kZXMoWydjb250ZW50J10pOyAvLyDojrflj5ZjbGFzcz1cImpzLWNvbnRlbnRcIueahOiKgueCuVxyXG4gKiAgIGxheWVyLnNob3coKTsgLy/mmL7npLrlsYJcclxuICogICBsYXllci5oaWRlKCk7IC8v6ZqQ6JeP5bGCXHJcbiAqICAgbGF5ZXIubGF5ZXI7IC8v5bGCZG9t6IqC54K55a+56LGhXHJcbiAqICAgbGF5ZXIuY29udGFpbmVyOyAvL+a1ruWxguWuueWZqFxyXG4gKiAgIGxheWVyLmRlc3Ryb3koKTsgLy/plIDmr4HlsYJcclxuICpcclxuICogKi9cclxuXHJcbiBjb25zdCBMYXllciA9IHJlcXVpcmUoJy4vbGF5ZXIuanMnKSxcclxuIFx0ICAgTWFzayA9IHJlcXVpcmUoJy4vbWFzay5qcycpLFxyXG5cdCAgIFBvc2l0aW9uQm9tYiA9IHJlcXVpcmUoJy4vcG9zaXRpb25Cb21iLmpzJyksXHJcblx0ICAgVG9vbCA9IHJlcXVpcmUoJ2xpYnV0aWwtdG9vbCcpO1xyXG5cclxuY2xhc3MgQm9tYkxheWVyIGV4dGVuZHMgTGF5ZXIge1xyXG5cdC8qKlxyXG5cdCAqIOW8ueWxguexu+KAlOKAlOWIm+W7uuW5tua3u+WKoOWIsOaMh+WumuWuueWZqOS4rVxyXG4gICAgICogQHBhcmFtIHtKU09OfSBjb25maWcg5by55bGC6YWN572u5Y+C5pWwIO+8jOS4jeaYr+W/heWhq+mhuVxyXG4gICAgICogXHRcdHtcclxuICAgICAqIFx0ICAgICAgIGNvbnRhaW5lciB7RWxlbWVudH0g5a2Y5pS+5by55bGC55qE5a655Zmo44CC5Y+v5LiN5oyH5a6a77yM6buY6K6k5by55bGC5a2Y5pS+5LqOYm9keeS4reeahOS4gOS4quWKqOaAgeeUn+aIkOeahGRpdumHjFxyXG4gICAgICogXHQgICAgICAgcG9zOnt9LCAvL+WumuS9jeWPguaVsO+8jOWFt+S9k+ivtOaYjuWPr+ingeaWueazlWxheWVyL3Bvc2l0aW9uQm9tYuS4reeahGNvbmZpZ+ivtOaYjlxyXG4gICAgICogICAgICAgICBsYXllcjoge30sIC8v5by55bGC5L+h5oGv5Y+C5pWw77yM5YW35L2T6K+05piO5Y+v6KeB5pa55rOVbGF5ZXIvbGF5ZXLkuK3nmoRjb25maWfor7TmmI5cclxuICAgICAqIFx0XHQgICBtYXNrOiB7IC8v6YGu572p5L+h5oGv5Y+C5pWw77yM5YW35L2T6K+05piO5Y+v6KeB5pa55rOVbGF5ZXIvbWFza+S4reeahGNvbmZpZ+ivtOaYjuOAguWcqOatpOWfuuehgOS4iui/m+ihjOS7peS4i+aJqeWxlVxyXG4gICAgICogXHRcdFx0ICBtYXNrOiB0cnVlLCAvL+aYr+WQpuWIm+W7uumBrue9qVxyXG4gICAgICogICAgICAgICAgICBjbWxoaWRlOiBmYWxzZSAvL+eCueWHu+mBrue9qeaYr+WQpuWFs+mXreW8ueWxglxyXG4gICAgICogICAgICAgICAgICAvL+WFtuS7luafpeeci21hc2suanPkuK3nmoTphY3nva5cclxuICAgICAqIFx0XHQgICB9XHJcbiAgICAgKiAgICAgIH1cclxuXHQgKi9cclxuXHRjb25zdHJ1Y3Rvcihjb25maWcpIHtcclxuICAgICAgICB2YXIgX25ld2NvbnRhaW5lciA9IGZhbHNlO1xyXG5cdFx0aWYoIWNvbmZpZy5jb250YWluZXIgfHwgY29uZmlnLmNvbnRhaW5lci5sZW5ndGggPT0gMCl7XHJcblx0XHRcdGNvbmZpZy5jb250YWluZXIgPSAkKCc8ZGl2PjwvZGl2PicpLmFwcGVuZFRvKCdib2R5Jyk7XHJcblx0XHRcdF9uZXdjb250YWluZXIgPSB0cnVlOyAvL+ivtOaYjuaYr+aWsOWIm+W7uueahOWuueWZqFxyXG5cdFx0fVxyXG5cdFx0Y29uZmlnID0gY29uZmlnIHx8IHt9O1xyXG5cdFx0Ly/liJ3lp4vljJbln7rnsbtcclxuXHRcdHN1cGVyKGNvbmZpZy5jb250YWluZXIsY29uZmlnLmxheWVyKTtcclxuICAgICAgICB0aGlzLl9uZXdjb250YWluZXIgPSBfbmV3Y29udGFpbmVyO1xyXG5cdFx0Ly/liJvlu7rlrprkvY3nsbvlr7nosaFcclxuXHRcdHRoaXMucG9zID0gbmV3IFBvc2l0aW9uQm9tYih7XHJcblx0XHRcdGxheWVyOiB0aGlzLmxheWVyXHJcblx0XHR9LGNvbmZpZy5wb3MpO1xyXG5cdFx0Ly/liJvlu7rpga7nvalcclxuXHRcdHZhciBtYXNrb3B0ID0gJC5leHRlbmQodHJ1ZSx7XHJcblx0XHRcdG1hc2s6IHRydWUsXHJcblx0XHRcdGNtbGhpZGU6IGZhbHNlXHJcblx0XHR9LGNvbmZpZy5tYXNrKTtcclxuXHRcdGlmKG1hc2tvcHQubWFzayl7IC8v5aaC5p6c5Yib5bu66YGu572pXHJcblx0XHRcdHRoaXMubWFzayA9IG5ldyBNYXNrKGNvbmZpZy5jb250YWluZXIsbWFza29wdCk7XHJcblx0XHRcdGlmKG1hc2tvcHQuY21saGlkZSl7IC8v54K55Ye76YGu572p5YWz6ZetXHJcblx0XHRcdFx0dGhpcy5tYXNrLmNsaWNrY2FsLmFkZCgoZSkgPT4ge1xyXG5cdFx0XHRcdFx0dGhpcy5oaWRlKCk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdC8v5LqL5Lu257uR5a6aXHJcblx0XHR0aGlzLmxheWVyLm9uKCdjbGljay5saWInLCAnLmpzLWNsb3NlJywgKGUpID0+IHtcclxuXHQgICAgXHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0ICAgIFx0dGhpcy5oaWRlKCk7XHJcblx0ICAgIH0pO1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiDojrflj5ZhbGVydOS4reWFt+aciW5vZGU9J+aMh+WumuWQjeensCfnmoToioLngrnliJfooajjgILlpoLmnpxub2RlbmFtZWFycuS4reaMh+WumueahOiKgueCueS4jeWtmOWcqO+8jOWImeS4jeWcqOe7k+aenOS4rei/lOWbnuOAguS4vuS+i1xyXG4gICAgICogQHBhcmFtIHtBcnJheX0gbm9kZW5hbWVhcnIg5aaCWydjb250ZW50Jywnb2snXVxyXG4gICAgICogQHJldHVybiB7XHJcbiAgICAgKiBcdCAgIGNvbnRlbnQ6IOiOt+WPlueahOiKgueCuVxyXG4gICAgICogICAgIG9rOiDojrflj5bnmoToioLngrlcclxuICAgICAqIH1cclxuICAgICAqIOWmguaenGNvbnRlbnTkuI3lrZjlnKjvvIzliJnlj6rov5Tlm557b2t9XHJcblx0ICovXHJcblx0Z2V0Tm9kZXMobm9kZW5hbWVhcnIpe1xyXG5cdFx0dmFyIHJlc3VsdCA9IHt9LCB0aGF0ID0gdGhpcztcclxuXHRcdGlmKFRvb2wuaXNBcnJheShub2RlbmFtZWFycikpe1xyXG5cdFx0XHQkLmVhY2gobm9kZW5hbWVhcnIsKGluZGV4LG5hbWUpID0+IHtcclxuXHRcdFx0XHR2YXIgbm9kZSA9IHRoaXMubGF5ZXIuZmluZCgnLmpzLScrbmFtZSk7XHJcblx0XHRcdFx0aWYobm9kZS5sZW5ndGggPiAwKXtcclxuXHRcdFx0XHRcdHJlc3VsdFtuYW1lXSA9IG5vZGU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIOaYvuekuuW8ueWxglxyXG5cdCAqL1xyXG5cdHNob3coKXtcclxuXHRcdGlmKCF0aGlzLmlzc2hvdygpKXtcclxuXHRcdFx0dGhpcy5zaG93YmVmb3JlY2FsLmZpcmUoKTsgLy/lsYLmmL7npLrliY3lm57osINcclxuXHRcdFx0dGhpcy5tYXNrICYmIHRoaXMubWFzay5zaG93KCk7XHJcblx0XHRcdHRoaXMuX3Nob3coKTtcclxuXHRcdFx0dGhpcy5wb3Muc2V0cG9zKCk7XHJcblx0XHRcdHRoaXMuc2hvd2FmdGVyY2FsLmZpcmUoKTsgLy/lsYLmmL7npLrlkI7lm57osINcclxuXHRcdH1cclxuXHR9XHJcblx0LyoqXHJcblx0ICog6ZqQ6JeP5by55bGCXHJcblx0ICovXHJcblx0aGlkZSgpe1xyXG5cdFx0aWYodGhpcy5pc3Nob3coKSl7XHJcblx0XHRcdHRoaXMuaGlkZWJlZm9yZWNhbC5maXJlKCk7IC8v5bGC6ZqQ6JeP5YmN5Zue6LCDXHJcblx0XHRcdHRoaXMubWFzayAmJiB0aGlzLm1hc2suaGlkZSgpO1xyXG5cdFx0XHR0aGlzLl9oaWRlKCk7XHJcblx0XHRcdHRoaXMuaGlkZWFmdGVyY2FsLmZpcmUoKTsgLy/lsYLpmpDol4/lkI7lm57osINcclxuXHRcdH1cclxuXHR9XHJcblx0LyoqXHJcblx0ICog5by55bGC6ZSA5q+BXHJcblx0ICovXHJcblx0ZGVzdHJveSgpe1xyXG5cdFx0dGhpcy5sYXllci5vZmYoJ2NsaWNrLmxpYicsICcuanMtY2xvc2UnKTtcclxuXHRcdHRoaXMucG9zLmRlc3Ryb3koKTtcclxuXHRcdGlmKHRoaXMubWFzayl7XHJcbiAgICAgICAgICAgIHRoaXMubWFzay5kZXN0cm95KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBjb250YWluZXIgPSB0aGlzLmNvbnRhaW5lcjtcclxuICAgICAgICBzdXBlci5kZXN0cm95KCk7XHJcbiAgICAgICAgaWYodGhpcy5fbmV3Y29udGFpbmVyKXtcclxuXHRcdFx0Y29udGFpbmVyLnJlbW92ZSgpO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5fbmV3Y29udGFpbmVyID0gbnVsbDtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQm9tYkxheWVyO1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyBjb25maXJt57G777yM57un5om/6IeqbGF5ZXIvYm9tYkxheWVy44CC5re75Yqg4oCc56Gu5a6a5oyJ6ZKu4oCd5ZKM4oCc5Y+W5raI5oyJ6ZKu4oCd5LqL5Lu25Zue6LCDXHJcbiAqIOWmguaenOW8ueWxguS4reacieS7peS4i+WxnuaAp+eahOiKgueCuVxyXG4gKiBub2RlPVwiY2xvc2VcIu+8jOeCueWHu+WImeS8muWFs+mXreW8ueWxgizlubbop6blj5FoaWRlY2Fs6YCa55+l44CCXHJcbiAqIG5vZGU9XCJva1wi77yM54K55Ye75YiZ6Kem5Y+R4oCc56Gu5a6a5oyJ6ZKu4oCd5LqL5Lu277yM5YWz6Zet5by55bGC77yM5bm26Kem5Y+Rb2tjYWzlkoxoaWRlY2Fs6YCa55+l44CCXHJcbiAqIG5vZGU9XCJjYW5jZWxcIiDngrnlh7vop6blj5HigJzlj5bmtojmjInpkq7igJ3kuovku7bvvIzlhbPpl63lvLnlsYLvvIzlubbop6blj5FjYW5jZWxjYWzlkoxoaWRlY2Fs6YCa55+l44CCXHJcbiAqIEB2ZXJzaW9uIDEuMC4wIHwgMjAxNS0wOS0xNiDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAZXhhbXBsZVxyXG4gKiBcdCBjb25zdCBDb25maXJtID0gcmVxdWlyZSgnbGlibGF5ZXItY29uZmlybScpO1xyXG4gKlxyXG4gKiBcdCB2YXIgbGF5ZXIgPSBuZXcgQ29uZmlybSh7XHJcbiAqIFx0IFx0Y29uZmlybToge1xyXG4gKiBcdFx0XHRmcmFtZXRwbDogWyAvL+W8ueWxguWfuuacrOaooeadv1xyXG5cdFx0XHRcdCc8ZGl2IGNsYXNzPVwianMtdGl0bGVcIj48L2Rpdj4nLFxyXG5cdFx0XHRcdCc8ZGl2IGNsYXNzPVwianMtY29udGVudFwiPjwvZGl2PicsXHJcblx0XHRcdFx0JzxkaXY+PGEgaHJlZj1cImphdmFzY3JpcHQ6O1wiIGNsYXNzPVwianMtb2tcIj7lpb3nmoQ8L2E+PGEgaHJlZj1cImphdmFzY3JpcHQ6O1wiIGNsYXNzPVwianMtY2FuY2VsXCI+562J5LiL6K+0PC9hPjwvZGl2PidcclxuXHRcdFx0XS5qb2luKCcnKVxyXG4gKiAgICAgIH1cclxuICogICB9KTtcclxuICogICBsYXllci5zaG93Y2FsLmFkZChmdW5jdGlvbih0eXBlKXtzd2l0Y2godHlwZSl7Y2FzZSAnYmVmb3JlJzpjb25zb2xlLmxvZygn5bGC5pi+56S65YmNJyk7YnJlYWs7IGNhc2UgJ2FmdGVyJzpjb25zb2xlLmxvZygn5bGC5pi+56S65ZCOJyk7YnJlYWs7fX0pO1xyXG4gKiAgIGxheWVyLmhpZGVjYWwuYWRkKGZ1bmN0aW9uKHR5cGUpe3N3aXRjaCh0eXBlKXtjYXNlICdiZWZvcmUnOmNvbnNvbGUubG9nKCflsYLpmpDol4/liY0nKTticmVhazsgY2FzZSAnYWZ0ZXInOmNvbnNvbGUubG9nKCflsYLpmpDol4/lkI4nKTticmVhazt9fSk7XHJcbiAqICAgbGF5ZXIub2tjYWwuYWRkKGZ1bmN0aW9uKGUpe2NvbnNvbGUubG9nKCfngrnlh7vkuobnoa7lrponKX0pO1xyXG4gKiAgIGxheWVyLmNhbmNlbGNhbC5hZGQoZnVuY3Rpb24oZSl7Y29uc29sZS5sb2coJ+eCueWHu+S6huWPlua2iCcpfSk7XHJcbiAqICAgbGF5ZXIuc2V0TXlDb250ZW50KCforr7nva5ub2RlPVwiY29udGVudFwi6IqC54K555qEaW5uZXJIVE1MJyk7XHJcbiAqICAgdmFyIG5vZGVBcnIgPSBsYXllci5nZXROb2RlcyhbJ3RpdGxlJ10pOyAvLyDojrflj5ZjbGFzcz1cImpzLXRpdGxlXCLnmoToioLngrlcclxuICogICBub2RlQXJyLnRpdGxlLmh0bWwoJ+WGheWuueWMumh0bWwnKTtcclxuICogICBsYXllci5jb250ZW50bm9kZTsgLy/lhoXlrrnljLpub2RlPVwiY29udGVudFwi6IqC54K5XHJcbiAqICAgbGF5ZXIuc2hvdygpOyAvL+aYvuekuuWxglxyXG4gKiAgIGxheWVyLmhpZGUoKTsgLy/pmpDol4/lsYJcclxuICogICBsYXllci5sYXllcjsgLy/lsYJkb23oioLngrnlr7nosaFcclxuICogICBsYXllci5jb250YWluZXI7IC8v5rWu5bGC5a655ZmoXHJcbiAqICAgbGF5ZXIuZGVzdHJveSgpOyAvL+mUgOavgeWxglxyXG4gKiAqL1xyXG5jb25zdCBCb21iTGF5ZXIgPSByZXF1aXJlKCcuL2JvbWJMYXllci5qcycpLFxyXG5cdFx0VHBsID0gcmVxdWlyZSgnLi90cGwuanMnKTtcclxuXHJcbmNsYXNzIENvbmZpcm0gZXh0ZW5kcyBCb21iTGF5ZXIge1xyXG5cdC8qKlxyXG5cdCAqIGNvbmZpcm3nsbtcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcg5Y+C5pWw5ZCMbGF5ZXIvYm9tYkxheWVy6YeM6Z2i55qEY29uZmlnLOWcqOatpOWfuuehgOS4iuWinuWKoOWmguS4i+m7mOiupOmFjee9rlxyXG4gICAgICoge1xyXG4gICAgICogXHQgICpjb25maXJtOiB7XHJcbiAgICAgKiBcdFx0ICpmcmFtZXRwbCB7U3RyaW5nfSBjb25maXJt5Z+65pys5qih5p2/44CC6KaB5rGC6K+36K+m6KeBbGF5ZXIvdHBs6YeM6Z2iY29uZmlybemhueeahOimgeaxglxyXG4gICAgICogICAgfVxyXG4gICAgICogfVxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKGNvbmZpZykge1xyXG5cdFx0dmFyIG9wdCA9ICQuZXh0ZW5kKHRydWUse1xyXG5cdFx0XHRjb25maXJtOiB7XHJcblx0XHRcdFx0ZnJhbWV0cGw6IFRwbC5jb25maXJtIC8vY29uZmlybeW8ueWxguWfuuacrOaooeadv+OAguimgeaxguivt+ivpuingWxheWVyL3RwbOmHjOmdomNvbmZpcm3pobnnmoTopoHmsYJcclxuXHRcdFx0fVxyXG5cdFx0fSxjb25maWcpO1xyXG5cdFx0c3VwZXIob3B0KTtcclxuXHRcdHRoaXMuc2V0Q29udGVudChvcHQuY29uZmlybS5mcmFtZXRwbCk7XHJcblx0XHR0aGlzLmNvbnRlbnRub2RlID0gdGhpcy5sYXllci5maW5kKCcuanMtY29udGVudCcpOyAvL+WGheWuueWMuuiKgueCuVxyXG5cdFx0dGhpcy5va2NhbCA9ICQuQ2FsbGJhY2tzKCk7XHJcblx0XHR0aGlzLmNhbmNlbGNhbCA9ICQuQ2FsbGJhY2tzKCk7XHJcblx0XHQvL+S6i+S7tue7keWumlxyXG5cdCAgICB0aGlzLmxheWVyLm9uKCdjbGljay5saWInLCAnLmpzLW9rJywgKGUpID0+IHtcclxuXHQgICAgXHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdHRoaXMub2tjYWwuZmlyZShlKTtcclxuXHQgICAgXHR0aGlzLmhpZGUoKTtcclxuXHQgICAgfSk7XHJcblx0ICAgIHRoaXMubGF5ZXIub24oJ2NsaWNrLmxpYicsICcuanMtY2FuY2VsJywgKGUpID0+IHtcclxuXHQgICAgXHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdHRoaXMuY2FuY2VsY2FsLmZpcmUoZSk7XHJcblx0ICAgIFx0dGhpcy5oaWRlKCk7XHJcblx0ICAgIH0pO1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiDorr7nva5jb25maXJt5YaF5a655Yy65YW35pyJW25vZGU9XCJjb250ZW50XCJd5bGe5oCn55qE6IqC54K555qEaHRtbFxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGh0bWxcclxuXHQgKi9cclxuXHRzZXRNeUNvbnRlbnQoaHRtbCl7XHJcblx0XHRpZih0eXBlb2YgaHRtbCA9PSAnc3RyaW5nJyAmJiB0aGlzLmNvbnRlbnRub2RlLmxlbmd0aCA+IDApe1xyXG5cdFx0XHR0aGlzLmNvbnRlbnRub2RlLmh0bWwoaHRtbCk7XHJcblx0XHR9XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIOe7hOS7tumUgOavgVxyXG5cdCAqL1xyXG5cdGRlc3Ryb3koKXtcclxuXHRcdHRoaXMubGF5ZXIub2ZmKCdjbGljay5saWInLCAnLmpzLW9rJyk7XHJcblx0XHR0aGlzLmxheWVyLm9mZignY2xpY2subGliJywgJy5qcy1jYW5jZWwnKTtcclxuXHRcdHN1cGVyLmRlc3Ryb3koKTtcclxuXHRcdHRoaXMuY29udGVudG5vZGUgPSBudWxsO1xyXG5cdFx0dGhpcy5va2NhbCA9IG51bGw7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbmZpcm07XHJcbiIsIu+7vy8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IGNvbmZpcm3nmoTlt6XljoLmjqfliLblmajvvIzpm4bmiJBiYXNlQ29udHJvbFxyXG4gKiDlupTnlKjlnLrmma/vvJrpkojlr7nnroDljZVjb25maXJt5by55bGC77yM6ZKI5a+56aKR57mB5pu05pS55by55bGC6YeM5p+Q5Lqb6IqC54K555qE5YaF5a6577yM5Lul5Y+K5pu05pS554K55Ye7XCLnoa7lrppcIuOAgVwi5Y+W5raIXCLmjInpkq7lkI7nmoTlm57osIPkuovku7ZcclxuICog5aaC5p6c5piv5pu05aSN5p2C55qE5Lqk5LqS5bu66K6u5L2/55SobGF5ZXJzLmNvbmZpcm3miJZsYXllcnMuYm9tYkxheWVyXHJcbiAqIEB2ZXJzaW9uIDEuMC4wIHwgMjAxNi0wMS0yNiDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAZXhhbXBsZVxyXG4gKiBcdFx0Y29uc3QgQ29uZmlybUNvbnRyb2wgPSByZXF1aXJlKCdsaWJsYXllci1jb25maXJtQ29udHJvbCcpO1xyXG4gKlxyXG5cdFx0dmFyIGN1cmNvbmZpcm0gPSBuZXcgQ29uZmlybUNvbnRyb2woKTtcclxuXHRcdGN1cmNvbmZpcm0uc2V0Y29uZmlnKHtcclxuXHRcdFx0Y29uZmlybToge1xyXG5cdFx0XHRcdGZyYW1ldHBsOiBbXHJcblx0XHRcdFx0XHQnPGRpdiBjbGFzcz1cImpzLWNvbnRlbnRcIj48L2Rpdj4nLFxyXG5cdFx0XHRcdFx0JzxkaXY+PGEgaHJlZj1cImphdmFzY3JpcHQ6O1wiIGNsYXNzPVwianMtb2tcIj7lpb3nmoQ8L2E+PGEgaHJlZj1cImphdmFzY3JpcHQ6O1wiIGNsYXNzPVwianMtY2FuY2VsXCI+562J5LiL6K+0PC9hPjwvZGl2PidcclxuXHRcdFx0XHRdLmpvaW4oJycpXHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0Y3VyY29uZmlybS5zaG93KHtcclxuXHRcdCAgICBjb250ZW50OiAn5oKo6L+Y5pyq55m76ZmGJ1xyXG5cdFx0fSx7XHJcblx0XHQgICAgb2s6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn54K55Ye75aW955qEJyk7XHJcbiAgICAgICAgICAgIH0sXHJcblx0XHRcdGNhbmNlbDogZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRjb25zb2xlLmxvZygn54K55Ye7562J5LiL6K+0Jyk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0Y3VyY29uZmlybS5nZXRsYXllcm9iaigp77ybIC8vbGF5ZXIvY29uZmlybeexu+WvueixoVxyXG4gKiAqL1xyXG5cclxuIGNvbnN0IENvbmZpcm0gPSByZXF1aXJlKCcuL2NvbmZpcm0uanMnKSxcclxuIFx0XHRCYXNlQ29udHJvbCA9IHJlcXVpcmUoJy4vYmFzZUNvbnRyb2wuanMnKTtcclxuXHJcbmNsYXNzIENvbmZpcm1Db250cm9sIGV4dGVuZHMgQmFzZUNvbnRyb2wge1xyXG5cdC8qKlxyXG4gICAgICogY29uZmlybeW3peWOguaOp+WItuWZqFxyXG4gICAgICovXHJcblx0Y29uc3RydWN0b3IoaGlkZWRlc3Ryb3kpIHtcclxuXHRcdHN1cGVyKGhpZGVkZXN0cm95KTtcclxuXHRcdHRoaXMuX29rY2FsID0gZnVuY3Rpb24oKXt9OyAvL+eCueWHu29r55qE5Zue6LCD56eB5pyJ5a2Y5YKo5ZmoXHJcblx0XHR0aGlzLl9jYW5jZWxjYWwgPSBmdW5jdGlvbigpe307IC8v54K55Ye7Y2FuY2Vs55qE5Zue6LCD56eB5pyJ5a2Y5YKo5ZmoXHJcblx0XHR0aGlzLl9mdW5hcnIgPSBbJ29rJywnY2FuY2VsJ107IC8v5Y+v5o6n5Yi255qE5Zue6LCD5pa55rOV5ZCNXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIOiOt+WPlmNvbmZpcm3lvLnlsYJcclxuXHQgKiBAcGFyYW0ge0Jvb2xlYW59IHJlc2V0IOaYr+WQpumHjeaWsOa4suafk+aooeadv+OAgum7mOiupOS4umZhbHNlXHJcblx0ICovXHJcblx0Z2V0bGF5ZXJvYmoocmVzZXQpe1xyXG5cdFx0aWYodGhpcy5fbGF5ZXJvYmogPT0gbnVsbCl7XHJcblx0XHRcdHRoaXMuX2xheWVyb2JqID0gbmV3IENvbmZpcm0odGhpcy5fZGVmYXVsdG9wdCk7XHJcblx0XHRcdHRoaXMuX2xheWVyb2JqLm9rY2FsLmFkZCgoZSkgPT4ge1xyXG5cdFx0XHRcdHRoaXMuX29rY2FsKCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHR0aGlzLl9sYXllcm9iai5jYW5jZWxjYWwuYWRkKChlKSA9PiB7XHJcblx0XHRcdFx0dGhpcy5fY2FuY2VsY2FsKCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHR0aGlzLl9hZGRjYWxsKCk7XHJcblx0XHR9ZWxzZXtcclxuICAgICAgICAgICAgaWYocmVzZXQpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbGF5ZXJvYmouc2V0Q29udGVudCh0aGlzLl9kZWZhdWx0b3B0LmNvbmZpcm0uZnJhbWV0cGwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cdFx0cmV0dXJuIHRoaXMuX2xheWVyb2JqO1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiDplIDmr4FhbGVydOW8ueWxglxyXG5cdCAqL1xyXG5cdGRlc3Ryb3koKXtcclxuXHRcdHN1cGVyLmRlc3Ryb3koKTtcclxuXHRcdHRoaXMuX29rY2FsID0gZnVuY3Rpb24oKXt9O1xyXG5cdFx0dGhpcy5fY2FuY2VsY2FsID0gZnVuY3Rpb24oKXt9O1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb25maXJtQ29udHJvbDtcclxuIiwi77u/LyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcgY29uZnJpbeexu+WNleS9k+aOp+WItuWZqO+8jOS4gOiIrOeUqOS6jueugOWNleeahGNvbmZpcm3kv6Hmga/mj5DnpLrjgIJcclxuICog5rOo5oSP77ya6K+lY29uZnJpbeaOp+WItueahOWvueixoeWPimRvbeWcqOWFqOWxgOS4reWUr+S4gOWtmOWcqO+8jOWmguaenOaDs+imgeWIm+W7uuWkmuS4qu+8jOivt+S9v+eUqGxpYmxheWVycy9jb25maXJt5oiWbGlibGF5ZXJzL2NvbmZpcm1Db250cm9sXHJcbiAqIEB2ZXJzaW9uIDEuMC4wIHwgMjAxNS0wOS0xNiDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAZXhhbXBsZVxyXG4gKiAgICAgIGNvbnN0IENvbmZpcm1TaW5nbGUgPSByZXF1aXJlKCdsaWJsYXllci1jb25maXJtU2luZ2xlJyk7XHJcbiAqXHJcblx0XHRDb25maXJtU2luZ2xlLnNldGNvbmZpZyh7XHJcblx0XHRcdGNvbmZpcm06IHtcclxuXHRcdFx0XHRmcmFtZXRwbDogW1xyXG5cdFx0XHRcdFx0JzxkaXYgY2xhc3M9XCJqcy1jb250ZW50XCI+PC9kaXY+JyxcclxuXHRcdFx0XHRcdCc8ZGl2PjxhIGhyZWY9XCJqYXZhc2NyaXB0OjtcIiBjbGFzcz1cImpzLW9rXCI+5aW955qEPC9hPjxhIGhyZWY9XCJqYXZhc2NyaXB0OjtcIiBjbGFzcz1cImpzLWNhbmNlbFwiPuetieS4i+ivtDwvYT48L2Rpdj4nXHJcblx0XHRcdFx0XS5qb2luKCcnKVxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdENvbmZpcm1TaW5nbGUuc2hvdyh7XHJcblx0XHQgICAgY29udGVudDogJ+aCqOi/mOacqueZu+mZhidcclxuXHRcdH0se1xyXG5cdFx0ICAgIG9rOiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+eCueWHu+WlveeahCcpO1xyXG4gICAgICAgICAgICB9LFxyXG5cdFx0XHRjYW5jZWw6IGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0Y29uc29sZS5sb2coJ+eCueWHu+etieS4i+ivtCcpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuICAgICAgICBDb25maXJtU2luZ2xlLmdldGxheWVyb2JqKCnvvJsgLy9sYXllci9jb25maXJt57G75a+56LGhXHJcbiAqICovXHJcbiBjb25zdCBDb25mcmltQ29udHJvbCA9IHJlcXVpcmUoJy4vY29uZmlybUNvbnRyb2wuanMnKTtcclxuXHJcbiBtb2R1bGUuZXhwb3J0cyA9IG5ldyBDb25mcmltQ29udHJvbCgpO1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyDmta7lsYLln7rnsbtcclxuICogQHZlcnNpb24gMS4wLjAgfCAyMDE1LTA4LTE5IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm4g5rWu5bGC5Z+657G7XHJcbiAqIEBleGFtcGxlXHJcbiAqXHJcbiAqIFx0Y29uc3QgTGF5ZXIgPSByZXF1aXJlKCdsaWJsYXllci1sYXllcicpO1xyXG4gKlxyXG4gKiBcdCB2YXIgbGF5ZXIgPSBuZXcgTGF5ZXIoJCgnYm9keScpKTtcclxuICogICBsYXllci5zaG93YmVmb3JlY2FsLmFkZChmdW5jdGlvbigpe2NvbnNvbGUubG9nKCflsYLmmL7npLrliY0nKTt9KTtcclxuICogICBsYXllci5oaWRlYmVmb3JlY2FsLmFkZChmdW5jdGlvbigpe2NvbnNvbGUubG9nKCflsYLpmpDol4/liY0nKTt9KTtcclxuICogICBsYXllci5zaG93YWZ0ZXJjYWwuYWRkKGZ1bmN0aW9uKCl7Y29uc29sZS5sb2coJ+WxguaYvuekuuWQjicpO30pO1xyXG4gKiAgIGxheWVyLmhpZGVhZnRlcmNhbC5hZGQoZnVuY3Rpb24oKXtjb25zb2xlLmxvZygn5bGC6ZqQ6JeP5ZCOJyk7fSk7XHJcbiAqICAgbGF5ZXIuaGlkZSgpOyAvL+makOiXj+WxglxyXG4gKiAgIGxheWVyLmxheWVyOyAvL+WxgmRvbeiKgueCueWvueixoVxyXG4gKiAgIGxheWVyLmNvbnRhaW5lcjsgLy/mta7lsYLlrrnlmahcclxuICogICBsYXllci5kZXN0cm95KCk7IC8v6ZSA5q+B5bGCXHJcbiAqICovXHJcblxyXG4gY2xhc3MgTGF5ZXIge1xyXG5cdCAvKipcclxuIFx0ICog5rWu5bGC5Z+657G74oCU4oCU5Yib5bu65bm25re75Yqg5Yiw5oyH5a6a5a655Zmo5LitXHJcbiAgICAgICogQHBhcmFtIHtFbGVtZW50fSBjb250YWluZXIg5rWu5bGC5a2Y5pS+5a655Zmo77yM6buY6K6k5Li6JCgnYm9keScpXHJcbiAgICAgICogQHBhcmFtIHtKU09OfSBjb25maWcg5bGC6YWN572u5Y+C5pWw77yM6buY6K6k5L+h5oGv5Y+K6K+05piO5aaC5LiLb3B05Luj56CB5aSEXHJcbiBcdCAqL1xyXG5cdCBjb25zdHJ1Y3Rvcihjb250YWluZXIsY29uZmlnKXtcclxuXHRcdGNvbnRhaW5lciA9IGNvbnRhaW5lciB8fCAkKCdib2R5Jyk7XHJcbiBcdFx0dmFyIG9wdCA9ICQuZXh0ZW5kKHRydWUse1xyXG4gXHRcdFx0Y2xhc3NuYW1lOiAnJywgLy9sYXllcueahGNsYXNzXHJcbiBcdFx0XHR6SW5kZXg6IDIsIC8vbGF5ZXLnmoR6LWluZGV4XHJcbiBcdFx0XHRwb3NpdGlvbjogJ2Fic29sdXRlJywgLy9sYXllcueahHBvc2l0aW9u44CC6buY6K6k5pivYWJzb2x1dGVcclxuIFx0XHRcdHNob3c6IGZhbHNlLCAvL+WIm+W7uuWxguWQjum7mOiupOaYr+WQpuaYvuekulxyXG4gXHRcdFx0Y3VzdG9tOiB7XHJcbiBcdFx0XHRcdHNob3c6IG51bGwsIC8v55So5oi36Ieq5a6a5LmJ5pi+56S65bGC55qE5pa55rOV44CC5aaC5p6c5q2k5pa55rOV5a2Y5Zyo77yM5YiZ5LiN55So6buY6K6k55qE5pi+56S65bGC5pa55rOVXHJcbiBcdFx0XHRcdGhpZGU6IG51bGwgLy/nlKjmiLfoh6rlrprkuYnpmpDol4/lsYLnmoTmlrnms5XjgILlpoLmnpzmraTmlrnms5XlrZjlnKjvvIzliJnkuI3nlKjpu5jorqTnmoTpmpDol4/lsYLmlrnms5VcclxuIFx0XHRcdH1cclxuIFx0XHR9LGNvbmZpZyB8fCB7fSk7XHJcbiBcdFx0dmFyIGNzc3N0ciA9ICdwb3NpdGlvbjonK29wdC5wb3NpdGlvbisnOycrKG9wdC5zaG93PycnOidkaXNwbGF5Om5vbmU7JykrJ3otaW5kZXg6JytvcHQuekluZGV4Kyc7JztcclxuIFx0XHR0aGlzLmNvbnRhaW5lciA9IGNvbnRhaW5lcjsgLy/mta7lsYLlrrnlmahcclxuIFx0XHR0aGlzLmxheWVyID0gJCgnPGRpdicrKG9wdC5jbGFzc25hbWUgPT0gJyc/Jyc6JyBjbGFzcz1cIicrb3B0LmNsYXNzbmFtZSsnXCInKSsnIHN0eWxlPVwiJytjc3NzdHIrJ1wiPjwvZGl2PicpO1xyXG4gXHRcdHRoaXMubGF5ZXIuYXBwZW5kVG8oY29udGFpbmVyKTtcclxuIFx0XHR0aGlzLnNob3diZWZvcmVjYWwgPSAkLkNhbGxiYWNrcygpOyAvL+WxguaYvuekuuWJjeeahOWbnuiwg1xyXG4gXHRcdHRoaXMuc2hvd2FmdGVyY2FsID0gJC5DYWxsYmFja3MoKTsgLy/lsYLmmL7npLrlkI7nmoTlm57osINcclxuIFx0XHR0aGlzLmhpZGViZWZvcmVjYWwgPSAkLkNhbGxiYWNrcygpOyAvL+WxgumakOiXj+WJjeeahOWbnuiwg1xyXG4gXHRcdHRoaXMuaGlkZWFmdGVyY2FsID0gJC5DYWxsYmFja3MoKTsgLy/lsYLpmpDol4/lkI7nmoTlm57osINcclxuIFx0XHR0aGlzLmN1c3RvbSAgPSBvcHQuY3VzdG9tOyAvL+iHquWumuS5ieaWueazlVxyXG5cdCB9XHJcblx0IC8qKlxyXG4gXHQgKiDorr7nva7lsYLlhoXlrrlcclxuICBcdCAqIEBwYXJhbSB7RWxlbWVudHxTdHJpbmd9ICpjb250ZW50IGh0bWzlrZfnrKbkuLLmiJbogIXoioLngrnlr7nosaFcclxuIFx0ICovXHJcblx0IHNldENvbnRlbnQoY29udGVudCl7XHJcblx0XHRpZihhcmd1bWVudHMubGVuZ3RoID09IDApe1xyXG4gXHRcdFx0cmV0dXJuO1xyXG4gXHRcdH1cclxuIFx0XHRpZih0eXBlb2YgY29udGVudCA9PSAnc3RyaW5nJyl7XHJcbiBcdFx0XHR0aGlzLmxheWVyLmh0bWwoY29udGVudCk7XHJcbiBcdFx0fVxyXG4gXHRcdGVsc2V7XHJcbiBcdFx0XHR0aGlzLmxheWVyLmh0bWwoJycpLmFwcGVuZChjb250ZW50KTtcclxuIFx0XHR9XHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOaYvuekuuWxguOAglxyXG4gXHQgKi9cclxuXHQgX3Nob3coKXtcclxuXHRcdCBpZih0eXBlb2YgdGhpcy5jdXN0b20uc2hvdyA9PSAnZnVuY3Rpb24nKXtcclxuIFx0XHRcdHRoaXMuY3VzdG9tLnNob3codGhpcy5sYXllcik7XHJcbiBcdFx0fVxyXG4gXHRcdGVsc2V7XHJcbiBcdFx0XHR0aGlzLmxheWVyLnNob3coKTtcclxuIFx0XHR9XHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOaYvuekuuWxguOAguS8muinpuWPkXNob3djYWzlm57osINcclxuIFx0ICovXHJcbiBcdCBzaG93KCl7XHJcblx0XHQgaWYoIXRoaXMuaXNzaG93KCkpe1xyXG4gXHRcdFx0dGhpcy5zaG93YmVmb3JlY2FsLmZpcmUoKTsgLy/lsYLmmL7npLrliY3lm57osINcclxuIFx0XHRcdHRoaXMuX3Nob3coKTtcclxuIFx0XHRcdHRoaXMuc2hvd2FmdGVyY2FsLmZpcmUoKTsgLy/lsYLmmL7npLrlkI7lm57osINcclxuIFx0XHR9XHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOmakOiXj+WxguOAglxyXG4gXHQgKi9cclxuXHQgX2hpZGUoKXtcclxuXHRcdGlmKHR5cGVvZiB0aGlzLmN1c3RvbS5oaWRlID09ICdmdW5jdGlvbicpe1xyXG4gXHRcdFx0dGhpcy5jdXN0b20uaGlkZSh0aGlzLmxheWVyKTtcclxuIFx0XHR9XHJcbiBcdFx0ZWxzZXtcclxuIFx0XHRcdHRoaXMubGF5ZXIuaGlkZSgpO1xyXG4gXHRcdH1cclxuXHQgfVxyXG5cdCAvKipcclxuIFx0ICog6ZqQ6JeP5bGC44CC5Lya6Kem5Y+RaGlkZWNhbOWbnuiwg1xyXG4gXHQgKi9cclxuXHQgaGlkZSgpe1xyXG5cdFx0IGlmKHRoaXMuaXNzaG93KCkpe1xyXG4gXHRcdFx0dGhpcy5oaWRlYmVmb3JlY2FsLmZpcmUoKTsgLy/lsYLpmpDol4/liY3lm57osINcclxuIFx0XHRcdHRoaXMuX2hpZGUoKTtcclxuIFx0XHRcdHRoaXMuaGlkZWFmdGVyY2FsLmZpcmUoKTsgLy/lsYLpmpDol4/lkI7lm57osINcclxuIFx0XHR9XHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOmUgOavgeWxglxyXG4gXHQgKi9cclxuXHQgZGVzdHJveSgpe1xyXG5cdFx0IGlmKHRoaXMubGF5ZXIgIT0gbnVsbCl7XHJcbiBcdFx0XHR0aGlzLmxheWVyLnJlbW92ZSgpO1xyXG4gXHRcdFx0dGhpcy5sYXllciA9IG51bGw7XHJcbiBcdFx0XHR0aGlzLnNob3djYWwgPSBudWxsO1xyXG4gXHRcdFx0dGhpcy5oaWRlY2FsID0gbnVsbDtcclxuIFx0XHRcdHRoaXMuY3VzdG9tID0gbnVsbDtcclxuIFx0XHRcdHRoaXMuY29udGFpbmVyID0gbnVsbDtcclxuIFx0XHR9XHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOWIpOaWreWxguaYr+WQpuaYvuekulxyXG4gXHQgKiBAcmV0dXJuIHtCb29sZWFufSB0cnVlfGZhbHNlXHJcbiBcdCAqL1xyXG5cdCBpc3Nob3coKXtcclxuXHRcdCByZXR1cm4gdGhpcy5sYXllci5jc3MoJ2Rpc3BsYXknKSAhPSAnbm9uZSc7XHJcblx0IH1cclxuIH1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTGF5ZXI7XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IOmBrue9qeexu+KAlOKAlOWIm+W7uumBrue9qeW5tui/m+ihjOebuOWFs+aOp+WItlxyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE1LTA4LTE1IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm4g6YGu572p5a+56LGhXHJcbiAqIEBleGFtcGxlXHJcbiAqIFx0IGNvbnN0IE1hc2sgPSByZXF1aXJlKCdsaWJsYXllci1tYXNrJyk7XHJcbiAqXHJcbiAqIFx0IHZhciBtYXNrID0gbmV3ICRtYXNrKCQoJ2JvZHknKSk7XHJcbiAqICAgbWFzay5zaG93KCk7IC8v5pi+56S66YGu572pXHJcbiAqICAgbWFzay5oaWRlKCk7IC8v6ZqQ6JeP6YGu572pXHJcbiAqICAgbWFzay5tYXNrOyAvL+mBrue9qWRvbeiKgueCueWvueixoVxyXG4gKiAgIG1hc2suY29udGFpbmVyOyAvL+mBrue9qeWuueWZqFxyXG4gKiAgIG1hc2suZGVzdHJveSgpOyAvL+mUgOavgemBrue9qVxyXG4gKiAgIG1hc2suY2xpY2tjYWwuYWRkKGZ1bmN0aW9uKGUpe1xyXG4gKiBcdCAgICBjb25zb2xlLmxvZygn6YGu572p6KKr54K55Ye7Jyk7XHJcbiAqICAgfSk7XHJcbiAqICovXHJcblxyXG4gY29uc3QgUG9zaXRpb25Cb21iID0gcmVxdWlyZSgnLi9wb3NpdGlvbkJvbWIuanMnKTtcclxuXHJcbiBjbGFzcyBNYXNre1xyXG5cdCAvKipcclxuXHQgICog6YGu572p57G74oCU4oCU5Yib5bu66YGu572pZG9t5bm25re75Yqg5Yiw5oyH5a6a5a655Zmo5LitXHJcblx0ICAqIEBwYXJhbSB7RWxlbWVudH0gY29udGFpbmVyIOmBrue9qeWtmOaUvuWuueWZqO+8jOm7mOiupOS4uiQoJ2JvZHknKVxyXG5cdCAgKiBAcGFyYW0ge0pTT059IGNvbmZpZyDpga7nvanphY3nva7lj4LmlbDvvIzpu5jorqTkv6Hmga/lj4ror7TmmI7lpoLkuItvcHTku6PnoIHlpIRcclxuXHQgICovXHJcblx0IGNvbnN0cnVjdG9yKGNvbnRhaW5lcixjb25maWcpe1xyXG5cdFx0IGNvbnRhaW5lciA9IGNvbnRhaW5lciB8fCAkKCdib2R5Jyk7XHJcblx0XHQgdmFyIG9wdCA9ICQuZXh0ZW5kKHtcclxuICAgICAgICAgICAgIGNsYXNzbmFtZTogJycsIC8vbWFza+eahGNsYXNzXHJcblx0XHRcdCBiZ2NvbG9yOiAnIzAwMCcsIC8v6IOM5pmv6ImyXHJcblx0XHRcdCB6SW5kZXg6IDEsIC8v6YGu572pei1pbmRleFxyXG5cdFx0XHQgb3BhY2l0eTogMC42LCAvL+mBrue9qemAj+aYjuW6plxyXG5cdFx0XHQgc2hvdzogZmFsc2UsIC8v5Yib5bu66YGu572p5ZCO6buY6K6k5piv5ZCm5pi+56S6XHJcblx0XHRcdCBjdXN0b206IHtcclxuXHRcdFx0XHQgc2hvdzogbnVsbCwgLy/nlKjmiLfoh6rlrprkuYnmmL7npLrlsYLnmoTmlrnms5XjgILlpoLmnpzmraTmlrnms5XlrZjlnKjvvIzliJnkuI3nlKjpu5jorqTnmoTmmL7npLrlsYLmlrnms5VcclxuXHRcdFx0XHQgaGlkZTogbnVsbCAvL+eUqOaIt+iHquWumuS5iemakOiXj+WxgueahOaWueazleOAguWmguaenOatpOaWueazleWtmOWcqO+8jOWImeS4jeeUqOm7mOiupOeahOmakOiXj+WxguaWueazlVxyXG5cdFx0XHQgfVxyXG5cdFx0IH0sY29uZmlnIHx8IHt9KTtcclxuXHRcdCB2YXIgY3Nzc3RyID0gJ3Bvc2l0aW9uOmFic29sdXRlO2JhY2tncm91bmQ6JytvcHQuYmdjb2xvcisnOycrKG9wdC5zaG93PycnOidkaXNwbGF5Om5vbmU7JykrJ3otaW5kZXg6JytvcHQuekluZGV4Kyc7JztcclxuXHRcdCB0aGlzLmNvbnRhaW5lciA9IGNvbnRhaW5lcjsgLy/pga7nvanlrrnlmahcclxuXHRcdCB0aGlzLm1hc2sgPSAkKCc8ZGl2Jysob3B0LmNsYXNzbmFtZSA9PSAnJz8nJzonIGNsYXNzPVwiJytvcHQuY2xhc3NuYW1lKydcIicpKycgc3R5bGU9XCInK2Nzc3N0cisnXCI+PC9kaXY+Jyk7XHJcblx0XHQgdGhpcy5tYXNrLmFwcGVuZFRvKGNvbnRhaW5lcik7XHJcblx0XHQgdGhpcy5tYXNrLmNzcygnb3BhY2l0eScsb3B0Lm9wYWNpdHkpO1xyXG5cdFx0IHRoaXMuY3VzdG9tICA9IG9wdC5jdXN0b207IC8v6Ieq5a6a5LmJ5pa55rOVXHJcblx0XHQgdGhpcy5wb3MgPSBuZXcgUG9zaXRpb25Cb21iKHtsYXllcjp0aGlzLm1hc2t9LHttb2RlOidmdWxsJ30pO1xyXG5cdFx0IC8v57uR5a6a5LqL5Lu2XHJcblx0XHQgdGhpcy5jbGlja2NhbCA9ICQuQ2FsbGJhY2tzKCk7IC8v6YGu572p54K55Ye75ZCO55qE5Zue6LCDXHJcblx0XHQgdGhpcy5tYXNrLm9uKCdjbGljay5saWInLChlKSA9PiB7XHJcblx0XHRcdCB0aGlzLmNsaWNrY2FsLmZpcmUoZSk7XHJcblx0XHQgfSk7XHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOaYvuekuumBrue9qVxyXG4gXHQgKi9cclxuXHQgc2hvdygpe1xyXG5cdFx0aWYodHlwZW9mIHRoaXMuY3VzdG9tLnNob3cgPT0gJ2Z1bmN0aW9uJyl7XHJcbiBcdFx0XHR0aGlzLmN1c3RvbS5zaG93KHRoaXMubWFzayk7XHJcbiBcdFx0fVxyXG4gXHRcdGVsc2V7XHJcbiBcdFx0XHR0aGlzLm1hc2suc2hvdygpO1xyXG4gXHRcdH1cclxuIFx0XHR0aGlzLnBvcy5zZXRwb3MoKTtcclxuXHQgfVxyXG5cdCAvKipcclxuIFx0ICog6ZqQ6JeP6YGu572pXHJcbiBcdCAqL1xyXG5cdCBoaWRlKCl7XHJcblx0XHQgaWYodHlwZW9mIHRoaXMuY3VzdG9tLmhpZGUgPT0gJ2Z1bmN0aW9uJyl7XHJcbiBcdFx0XHR0aGlzLmN1c3RvbS5oaWRlKHRoaXMubWFzayk7XHJcbiBcdFx0fVxyXG4gXHRcdGVsc2V7XHJcbiBcdFx0XHR0aGlzLm1hc2suaGlkZSgpO1xyXG4gXHRcdH1cclxuXHQgfVxyXG5cdCAvKipcclxuIFx0ICog6ZSA5q+B6YGu572pXHJcbiBcdCAqL1xyXG5cdCBkZXN0cm95KCl7XHJcblx0XHQgaWYodGhpcy5tYXNrICE9IG51bGwpe1xyXG4gXHRcdFx0dGhpcy5tYXNrLm9mZignY2xpY2subGliJyk7XHJcbiBcdFx0XHR0aGlzLm1hc2sucmVtb3ZlKCk7XHJcbiBcdFx0XHR0aGlzLm1hc2sgPSBudWxsO1xyXG4gXHRcdFx0dGhpcy5wb3MuZGVzdHJveSgpO1xyXG4gXHRcdFx0dGhpcy5wb3MgPSBudWxsO1xyXG4gXHRcdFx0dGhpcy5jbGlja2NhbCA9IG51bGw7XHJcbiBcdFx0fVxyXG5cdCB9XHJcbiB9XHJcblxyXG4gbW9kdWxlLmV4cG9ydHMgPSBNYXNrO1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyDlvLnlsYLlrprkvY3mlrnms5VcclxuICogXHRcdOazqOaEj++8muiwg+eUqOatpOaWueazleWJje+8jOW/hemhu+aYr+W+heWumuS9jeWxgueahGRpc3BsYXnkuI3kuLpudWxs55qE5oOF5Ya15LiLXHJcbiAqIEB2ZXJzaW9uIDEuMCB8IDIwMTUtMDgtMTUg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQHJldHVybiDlvLnlsYLlrprkvY3mlrnms5VcclxuICogQGV4YW1wbGVcclxuICogXHQgY29uc3QgUG9zaXRpb25Cb21iID0gcmVxdWlyZSgnbGlibGF5ZXItcG9zaXRpb25Cb21iJyk7XHJcbiAqXHJcbiAqIFx0IHZhciBwb3MgPSBuZXcgUG9zaXRpb25Cb21iKHtsYXllcjrlsYJkb23oioLngrl9KTtcclxuICogXHQgcG9zLnBvc2NhbC5hZGQoZnVuY3Rpb24oKXtjb25zb2xlLmxvZygnbGF5ZXLlrprkvY3lkI7lm57osIMnKX0pO1xyXG4gKiAqL1xyXG5cclxuIGNvbnN0IFdpbnNjcm9sbCA9IHJlcXVpcmUoJ2xpYnV0aWwtd2luc2Nyb2xsJyksXHJcbiBcdFx0U2Nyb2xsID0gcmVxdWlyZSgnbGlidXRpbC1zY3JvbGwnKSxcclxuXHRcdFdpbnJlc2l6ZSA9IHJlcXVpcmUoJ2xpYnV0aWwtd2lucmVzaXplJyksXHJcblx0XHRSZXNpemUgPSByZXF1aXJlKCdsaWJ1dGlsLXJlc2l6ZScpO1xyXG5cclxuLyoqXHJcbiAqIOWumuS9jeeul+azlVxyXG4gKi9cclxuZnVuY3Rpb24gc2V0cG9zKGRvbW9wdCxwb3NvcHQpe1xyXG5cdHZhciBjc3NvcHQgPSB7fSxsYXllciA9IGRvbW9wdC5sYXllcixvZmZjb24gPSBkb21vcHQub2ZmY29uO1xyXG5cdGxheWVyLmNzcygncG9zaXRpb24nLGRvbW9wdC5wb3NpdGlvbik7XHJcblx0dmFyIG1hcmdpbkxlZnQgPSAwLCBtYXJnaW5Ub3AgPSAwO1xyXG5cdGlmKGRvbW9wdC5wb3NpdGlvbiA9PSAnYWJzb2x1dGUnICYmIHBvc29wdC5maXhlZCl7XHJcblx0XHRtYXJnaW5MZWZ0ID0gb2ZmY29uLnNjcm9sbExlZnQoKTtcclxuXHRcdG1hcmdpblRvcCA9IG9mZmNvbi5zY3JvbGxUb3AoKTtcclxuXHR9XHJcblx0c3dpdGNoIChwb3NvcHQubW9kZSl7XHJcblx0XHRjYXNlICdjJzogLy/lsYXkuK3lrprkvY1cclxuXHRcdFx0bWFyZ2luTGVmdCAtPSAoTWF0aC5tYXgobGF5ZXIud2lkdGgoKSxwb3NvcHQubWlud2lkdGgpLzIrcG9zb3B0Lm9mZnNldFswXSk7XHJcblx0XHRcdG1hcmdpblRvcCAtPSAoTWF0aC5tYXgobGF5ZXIuaGVpZ2h0KCkscG9zb3B0Lm1pbmhlaWdodCkvMitwb3NvcHQub2Zmc2V0WzFdKTtcclxuXHRcdFx0Y3Nzb3B0LnRvcCA9ICc1MCUnO1xyXG5cdFx0XHRjc3NvcHQubGVmdCA9ICc1MCUnO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdGNhc2UgJ2Z1bGwnOiAvL+a7oeWxj+WumuS9je+8jOWNoOa7oeaVtOS4quWumuS9jeWuueWZqOOAguacrOadpeS4jeiuvue9rndpZHRo5ZKMaGVpZ2h077yM6K6+572u5LqGcmlnaHTlkoxib3R0b23jgILkvYbmmK/lgbblj5FtYXJnaW7kuI3otbfkvZznlKjvvIzmraTml7bor7vlj5bnmoTlhYPntKDlsLrlr7jkuLowLlxyXG5cdFx0XHRjc3NvcHQud2lkdGggPSAnMTAwJSc7XHJcblx0XHRcdGNzc29wdC5oZWlnaHQgPSAnMTAwJSc7XHJcblx0XHRcdGNzc29wdC50b3AgPSAnMCc7XHJcblx0XHRcdGNzc29wdC5sZWZ0ID0gJzAnO1xyXG5cdFx0XHRicmVhaztcclxuXHR9XHJcblx0Y3Nzb3B0Lm1hcmdpbkxlZnQgPSBtYXJnaW5MZWZ0KydweCc7XHJcblx0Y3Nzb3B0Lm1hcmdpblRvcCA9IG1hcmdpblRvcCsncHgnO1xyXG5cdGlmKHR5cGVvZiBwb3NvcHQuY3VzdG9tcG9zID09ICdmdW5jdGlvbicpe1xyXG5cdFx0cG9zb3B0LmN1c3RvbXBvcyhjc3NvcHQpO1xyXG5cdH1lbHNle1xyXG5cdFx0bGF5ZXIuY3NzKGNzc29wdCk7XHJcblx0fVxyXG59XHJcblxyXG5jbGFzcyBQb3NpdGlvbntcclxuXHQvKipcclxuXHQgKiDlrprkvY3nsbtcclxuICAgICAqIEBwYXJhbSB7SlNPTn0gZG9tcyDlrprkvY1kb23nm7jlhbPkv6Hmga9cclxuICAgICAqIFx0XHR7XHJcbiAgICAgKiBcdFx0XHRsYXllcjogbnVsbCAvL3tKUXVlcnlFbGVtZW50fFN0cmluZ+iKgueCuemAieaLqeWZqH0g5b6F5a6a5L2N5bGC6IqC54K5XHJcbiAgICAgKiAgICAgIH1cclxuICAgICAqIEBwYXJhbSB7SlNPTn0gY29uZmlnIOWxguWumuS9jemFjee9ruWPguaVsO+8jOm7mOiupOS/oeaBr+WPiuivtOaYjuWmguS4i3Bvc29wdOS7o+eggeWkhFxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKGRvbXMsY29uZmlnKXtcclxuXHRcdC8v5Y+C5pWw5qOA5rWL5LiO6K6+572uXHJcblx0XHRpZihhcmd1bWVudHMubGVuZ3RoID09IDApe1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ+W/hemhu+S8oOWFpeebuOWFs+WumuS9jeeahGRvbeWPguaVsCcpO1xyXG5cdFx0fVxyXG5cdFx0dmFyIGRvbW9wdCA9ICQuZXh0ZW5kKHtcclxuXHRcdFx0bGF5ZXI6IG51bGwsIC8v5b6F5a6a5L2N5bGC6IqC54K5XHJcblx0XHRcdG9mZnBhZ2U6IGZhbHNlIC8v6K+05piO55u45a+55LqO5b2T5YmN6aG16Z2i5a6a5L2NXHJcblx0XHR9LGRvbXMgfHwge30pO1xyXG5cdFx0aWYoZG9tb3B0LmxheWVyICYmIHR5cGVvZiBkb21vcHQubGF5ZXIgPT0gJ3N0cmluZycpe1xyXG5cdFx0XHRkb21vcHQubGF5ZXIgPSAkKGRvbW9wdC5sYXllcik7XHJcblx0XHR9XHJcblx0XHRpZighZG9tb3B0LmxheWVyIHx8IGRvbW9wdC5sYXllci5sZW5ndGggPT0gMCl7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcign5Lyg5YWl55qE5a6a5L2N5bGC6IqC54K55peg5pWIJyk7XHJcblx0XHR9XHJcblx0XHR2YXIgcG9zb3B0ID0gJC5leHRlbmQoe1xyXG5cdFx0XHRmaXhlZDogdHJ1ZSwgLy/mmK/lkKblsIblvLnlsYLlp4vnu4jlrprkvY3lnKjlj6/op4bnqpflj6PljLrln5/vvIzpu5jorqTkuLp0cnVlXHJcblx0XHRcdG1vZGU6ICdjJywgLy/lrprkvY3mqKHlvI/vvIzmnprkuL7jgIJjOuS4remXtFxyXG5cdFx0XHRvZmZzZXQ6IFswLDBdLCAvL+WumuS5ieWQjuWBj+enu+WwuuWvuCBbeOi9tCx56L20XeOAguWvueS6jm1vZGXmmK9mdWxs55qE5qih5byP5peg5pWIXHJcblx0XHRcdHNpemVjaGFuZ2U6IGZhbHNlLCAvL+W9k21vZGXmmK9j5pe277yMb2Zmc2V0UGFyZW50IHJlc2l6ZeaXtu+8jOW+heWumuS9jeWxgueahOWkp+Wwj+aYr+WQpuS8muaUueWPmFxyXG5cdFx0XHRtaW53aWR0aDogMCwgLy/lrprkvY3orqHnrpfml7bvvIzlvoXlrprkvY3lsYJsYXllcueahOacgOWwj+WuveW6plxyXG4gICAgICAgICAgICBtaW5oZWlnaHQ6IDAsIC8v5a6a5L2N6K6h566X5pe277yM5b6F5a6a5L2N5bGCbGF5ZXLnmoTmnIDlsI/pq5jluqZcclxuICAgICAgICAgICAgY3VzdG9tcG9zOiBudWxsIC8v55So5oi36Ieq5a6a5LmJ5a6a5L2N5pa55rOV44CC5aaC5p6c5aOw5piO5q2k5pa55rOV77yM5YiZ5LiN5Lya5L2/55So57O757uf6buY6K6k55qE5pa55rOV6K6+572ucG9z55qE5a6a5L2N5Y+C5pWw77yM6ICM5piv5oqK5a6a5L2N5Y+C5pWwcG9z5Lyg6YCS57uZ5q2k5pa55rOVXHJcblx0XHR9LGNvbmZpZyB8fCB7fSk7XHJcbiAgICAgICAgdGhpcy5wb3NjYWwgPSAkLkNhbGxiYWNrcygpOyAvL3NldHBvc+WQjueahOWbnuiwg1xyXG5cclxuXHRcdHZhciB0aGF0ID0gdGhpcztcclxuXHRcdC8v5Yid5q2l5qOA5rWL5a6a5L2N5Y+C6ICD5a655ZmoXHJcblx0XHRkb21vcHQub2ZmY29uID0gZG9tb3B0LmxheWVyLm9mZnNldFBhcmVudCgpO1xyXG5cdFx0dmFyIHRhZ25hbWUgPSBkb21vcHQub2ZmY29uLmdldCgwKS50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XHJcblx0XHR2YXIgbGlzdGVuY2FsbCA9IHtcclxuICAgICAgICAgICAgY2FsbDogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIHRoYXQuc2V0cG9zKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciBpc2xpc3Njcm9sbCA9IGZhbHNlOyAvL+aYr+WQpuebkeWQrHNjcm9sbOS6i+S7tlxyXG4gICAgICAgIHZhciBpc2xpc3Jlc2l6ZSA9IGZhbHNlOyAvL+aYr+WQpuebkeWQrHJlc2l6ZeS6i+S7tlxyXG5cdFx0aWYodGFnbmFtZSA9PSAnYm9keScgfHwgdGFnbmFtZSA9PSAnaHRtbCcpeyAvL+ivtOaYjuebuOWvueS6jumhtemdouWumuS9jVxyXG5cdFx0ICAgIGRvbW9wdC5vZmZjb24gPSAkKCdib2R5Jyk7XHJcblx0XHRcdGRvbW9wdC5vZmZwYWdlID0gdHJ1ZTtcclxuXHRcdH1cclxuXHRcdGlmKGRvbW9wdC5vZmZwYWdlICYmIHBvc29wdC5maXhlZCl7IC8v5aaC5p6c5a6a5L2N5a655Zmo5piv5b2T5YmN6aG16Z2i44CB5Zu65a6a5a6a5L2N44CB5Y+v5L2/55SoZml4ZWTlrprkvY3jgILliJnnlKhmaXhlZOWumuS9jVxyXG5cdFx0XHRkb21vcHQucG9zaXRpb24gPSAnZml4ZWQnO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZXtcclxuXHRcdFx0ZG9tb3B0LnBvc2l0aW9uID0gJ2Fic29sdXRlJztcclxuXHRcdFx0aWYocG9zb3B0LmZpeGVkKSB7IC8v5aaC5p6c5Zu65a6a5a6a5L2N77yM5YiZ55uR5ZCsc2Nyb2xs5LqL5Lu2XHJcblx0XHRcdCAgICBpc2xpc3Njcm9sbCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBpZihkb21vcHQub2ZmcGFnZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgV2luc2Nyb2xsLmxpc3RlbihsaXN0ZW5jYWxsKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNjcm9sbCA9IG5ldyBTY3JvbGwoZG9tb3B0Lm9mZmNvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsLmxpc3RlbihsaXN0ZW5jYWxsKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Ly/or7TmmI5tb2Rl5pivY+aXtu+8jG9mZnNldFBhcmVudCByZXNpemXml7bvvIzlvoXlrprkvY3lsYLnmoTlpKflsI/kvJrmlLnlj5jvvIzliJnnm5HlkKxyZXNpemXkuovku7ZcclxuICAgICAgICBpZihwb3NvcHQubW9kZSA9PSAnYycgJiYgcG9zb3B0LnNpemVjaGFuZ2Upe1xyXG4gICAgICAgICAgICBpc2xpc3Jlc2l6ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIGlmKGRvbW9wdC5vZmZwYWdlKXtcclxuICAgICAgICAgICAgICAgIFdpbnJlc2l6ZS5saXN0ZW4obGlzdGVuY2FsbCk7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlc2l6ZSA9IG5ldyBSZXNpemUoZG9tb3B0Lm9mZmNvbik7XHJcbiAgICAgICAgICAgICAgICByZXNpemUubGlzdGVuKGxpc3RlbmNhbGwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cdFx0dGhpcy5kb21vcHQgPSBkb21vcHQ7IC8vZG9t5Y+C5pWwXHJcblx0XHR0aGlzLnBvc29wdCA9IHBvc29wdDsgLy/lrprkvY3lj4LmlbBcclxuXHRcdHRoaXMuZGVzdHJveSA9IGZ1bmN0aW9uKCl7IC8v57uE5Lu26ZSA5q+B5pa55rOVXHJcblx0XHRcdHRoaXMuZG9tb3B0ID0gbnVsbDtcclxuXHRcdFx0dGhpcy5wb3NvcHQgPSBudWxsO1xyXG5cdFx0XHRpZihpc2xpc3Njcm9sbCl7XHJcblx0XHRcdFx0aWYoZG9tb3B0Lm9mZnBhZ2Upe1xyXG5cdFx0XHRcdFx0V2luc2Nyb2xsLnVubGlzdGVuKGxpc3RlbmNhbGwpO1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0c2Nyb2xsLnVubGlzdGVuKGxpc3RlbmNhbGwpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRpZihpc2xpc3Jlc2l6ZSl7XHJcblx0XHRcdCAgICBpZihkb21vcHQub2ZmcGFnZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgV2lucmVzaXplLnVubGlzdGVuKGxpc3RlbmNhbGwpO1xyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzaXplLnVubGlzdGVuKGxpc3RlbmNhbGwpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiDov5vooYzlrprkvY1cclxuXHQgKiBAcmV0dXJuIHtCb29sZWFufSDmmK/lkKblrprkvY3miJDlip9cclxuXHQgKi9cclxuXHRzZXRwb3MoKXtcclxuXHRcdGlmKHRoaXMuZG9tb3B0LmxheWVyLmNzcygnZGlzcGxheScpID09ICdub25lJyB8fCB0aGlzLmRvbW9wdC5vZmZjb24uY3NzKCdkaXNwbGF5JykgPT0gJ25vbmUnKXtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZXtcclxuXHRcdFx0c2V0cG9zKHRoaXMuZG9tb3B0LHRoaXMucG9zb3B0KTtcclxuICAgICAgICAgICAgdGhpcy5wb3NjYWwuZmlyZSgpO1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUG9zaXRpb247XHJcbiIsIi8qKlxyXG4gKiBhbGVydOW8ueWxguaooeadv++8jOW/hemhu+WFt+acieaMh+WumueahG5vZGXlsZ7mgKdcclxuICovXHJcbmV4cG9ydHMuYWxlcnQgPSBbXHJcbiAgICAnPGRpdj7moIfpopg8L2Rpdj4nLFxyXG5cdCc8ZGl2IG5vZGU9XCJjb250ZW50XCI+5YaF5a655Yy6PC9kaXY+JyxcclxuXHQnPGRpdj48YSBocmVmPVwiamF2YXNjcmlwdDo7XCIgY2xhc3M9XCJqcy1va1wiPuehruWumjwvYT48L2Rpdj4nXHJcbl0uam9pbignJyk7XHJcbi8qKlxyXG4gKiBjb25maXJt5by55bGC5qih5p2/77yM5b+F6aG75YW35pyJ5oyH5a6a55qEbm9kZeWxnuaAp1xyXG4gKi9cclxuZXhwb3J0cy5jb25maXJtID0gW1xyXG4gICAgJzxkaXY+5qCH6aKYPC9kaXY+JyxcclxuXHQnPGRpdiBub2RlPVwiY29udGVudFwiPuWGheWuueWMujwvZGl2PicsXHJcblx0JzxkaXY+PGEgaHJlZj1cImphdmFzY3JpcHQ6O1wiIGNsYXNzPVwianMtb2tcIj7noa7lrpo8L2E+PGEgaHJlZj1cImphdmFzY3JpcHQ6O1wiIGNsYXNzPVwianMtY2FuY2VsXCI+5Y+W5raIPC9hPjwvZGl2PidcclxuXS5qb2luKCcnKVxyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyBjc3PmlK/mjIHmg4XlhrXliKTmlq3jgILkuLvopoHnlKjkuo7mtY/op4jlmajlhbzlrrlcclxuICogQHZlcnNpb24gMS4wIHwgMjAxNS0wOC0zMSDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAcmV0dXJuXHJcbiAqIEBleGFtcGxlXHJcbiAqIFx0IGNvbnN0IENzc3N1cG9ydCA9IHJlcXVpcmUoJ2xpYnV0aWwtY3Nzc3Vwb3J0Jyk7XHJcbiAqIFx0IENzc3N1cG9ydC5maXhlZDtcclxuICogKi9cclxudmFyIF9kaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxudmFyIHJlc3VsdCA9IHtcclxuXHQvL+aYr+WQpuaUr+aMgXBvc2l0aW9uOmZpeGVk5a6a5L2NXHJcblx0Zml4ZWQ6ICEoJ3VuZGVmaW5lZCcgPT0gdHlwZW9mKGRvY3VtZW50LmJvZHkuc3R5bGUubWF4SGVpZ2h0KSB8fCAoZG9jdW1lbnQuY29tcGF0TW9kZSAhPT0gXCJDU1MxQ29tcGF0XCIgJiYgL21zaWUvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpKSkpLFxyXG5cdC8v5piv5ZCm5pSv5oyBdHJhbnNpdGlvblxyXG5cdHRyYW5zaXRpb246ICEoX2Rpdi5zdHlsZS50cmFuc2l0aW9uID09IHVuZGVmaW5lZClcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gcmVzdWx0O1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyDlr7nkuo7pq5jpopHop6blj5HnmoTkuovku7bov5vooYzlu7bov5/lpITnkIbnsbvjgILlupTnlKjlnLrmma/vvJpzY3JvbGzlkoxyZXNpemVcclxuICogQHZlcnNpb24gMS4wLjAgfCAyMDE1LTA4LTI3IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm4g5aSE55CG57G7XHJcbiAqIEBleGFtcGxlXHJcbiAqICovXHJcblxyXG4gY29uc3QgUHVibGlzaGVyUyA9IHJlcXVpcmUoJy4vcHVibGlzaGVyUy5qcycpO1xyXG5cclxuIGNsYXNzIERlbGF5ZXZ0IGV4dGVuZHMgUHVibGlzaGVyU3tcclxuXHQgLyoqXHJcbiBcdCAqIOWvueS6jumrmOmikeinpuWPkeeahOS6i+S7tui/m+ihjOW7tui/n+WkhOeQhuOAguW6lOeUqOWcuuaZr++8mnNjcm9sbOWSjHJlc2l6ZVxyXG4gXHQgKiBAcGFyYW0ge0pTT059IGNvbmZpZyDphY3nva5cclxuIFx0ICovXHJcblx0IGNvbnN0cnVjdG9yKGNvbmZpZyl7XHJcblx0ICAgIHN1cGVyKCk7XHJcbiBcdFx0dGhpcy50aW1lciA9IG51bGw7XHJcbiBcdFx0JC5leHRlbmQodGhpcyx7XHJcbiBcdFx0XHRkZWxheXRpbWU6IDIwMCAvL+S6i+S7tuajgOa1i+W7tui/n+aXtumXtO+8jOavq+enklxyXG4gXHRcdH0sY29uZmlnIHx8IHt9KTtcclxuXHQgfVxyXG5cdCAvKipcclxuIFx0ICog5byA5aeL5qOA5rWLXHJcbiBcdCAqL1xyXG5cdCBzdGFydCgpe1xyXG5cdFx0IGlmKHRoaXMudGltZXIpe1xyXG4gICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZXIpO1xyXG4gICAgICAgICB9XHJcbiAgICAgICAgIHRoaXMudGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgXHR0aGlzLmRlbGl2ZXIoKTtcclxuICAgICAgICAgfSx0aGlzLmRlbGF5dGltZSk7XHJcblx0IH1cclxuIH1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRGVsYXlldnQ7XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IOagueaNruiuvuWkh+e7meWHuuebuOWFs+S4muWKoeS6i+S7tueahOS6i+S7tuWQjeensFxyXG4gKiBAdmVyc2lvbiAxLjAuMCB8IDIwMTUtMDktMTQg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQGV4YW1wbGVcclxuICogKi9cclxudmFyIHJlc3VsdCA9IHtcclxuXHQvL+a1j+iniOWZqOeql+WPo3Jlc2l6ZeS6i+S7tlxyXG5cdHdpbnJlc2l6ZTogKGZ1bmN0aW9uKCl7XHJcblx0ICAgIHJldHVybiAnb25vcmllbnRhdGlvbmNoYW5nZScgaW4gd2luZG93PyAnb3JpZW50YXRpb25jaGFuZ2UnOiAncmVzaXplJztcclxuXHR9KSgpLFxyXG5cdC8vaW5wdXTmiJZ0ZXh0YXJlYei+k+WFpeahhuWAvOaUueWPmOeahOebkeWQrOS6i+S7tlxyXG5cdGlucHV0OiAoZnVuY3Rpb24oKXtcclxuXHQgICAgaWYoL01TSUUgOS4wLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpKXsgLy9JZTnpgqPkuKrlnZHniLnnmoTvvIzmnKzmnaVpbnB1dOWSjHByb3BlcnR5Y2hhbmdl6YO95pSv5oyB77yM5L2G5piv5Yig6Zmk6ZSu5peg5rOV6Kem5Y+R6L+Z5Lik5Liq5LqL5Lu277yM5omA5Lul5b6X5re75Yqga2V5dXBcclxuXHQgICAgICAgIHJldHVybiAnaW5wdXQga2V5dXAnO1xyXG5cdCAgICB9XHJcblx0ICAgIHZhciBub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuXHQgICAgaWYoJ29uaW5wdXQnIGluIG5vZGUpe1xyXG5cdCAgICAgICAgcmV0dXJuICdpbnB1dCc7XHJcblx0ICAgIH1lbHNlIGlmKCdvbnByb3BlcnR5Y2hhbmdlJyBpbiBub2RlKXtcclxuXHQgICAgICAgIHJldHVybiAncHJvcGVydHljaGFuZ2UnO1xyXG5cdCAgICB9ZWxzZSB7XHJcblx0ICAgICAgICByZXR1cm4gJ2tleXVwJztcclxuXHQgICAgfVxyXG5cdH0pKClcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gcmVzdWx0O1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyDorqLpmIXogIXmqKHlvI/igJTigJTlj5HluIPogIXnsbvigJTigJTnsr7nroDniYhcclxuICog57K+566A54mI77ya6K6i6ZiF6ICF5LiN6ZmQ5a6a5b+F6aG75piv6K6i6ZiF6ICF57G7U3Vic2NyaWJlcueahOWvueixoVxyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE1LTA4LTMxIOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm4g5Y+R5biD6ICF57G7XHJcbiAqIEBleGFtcGxlXHJcbiAqICovXHJcbiBjb25zdCBUb29sID0gcmVxdWlyZSgnLi90b29sLmpzJyksXHJcblx0ICAgUndjb250cm9sbGVyID0gcmVxdWlyZSgnLi9yd2NvbnRyb2xsZXIuanMnKTtcclxuXHJcbmNsYXNzIFB1Ymxpc2hlclN7XHJcblx0Y29uc3RydWN0b3IoKXtcclxuXHRcdHRoaXMuc3Vic2NyaWJlcnMgPSBbXTsgLy/orrDlvZXorqLpmIXogIXlr7nosaFcclxuXHRcdHRoaXMucndjb250cm9sbGRlciA9IG5ldyBSd2NvbnRyb2xsZXIoKTtcclxuXHR9XHJcblx0LyoqXHJcblx0ICog5Y+C5pWw5pyJ5pWI5oCn6aqM6K+BXHJcblx0ICovXHJcblx0YXJnc1ZhbGlkYXRlKGRhdGEpe1xyXG5cdFx0aWYoVG9vbC5pc09iamVjdChkYXRhKSAmJiBUb29sLmlzRnVuY3Rpb24oZGF0YS5jYWxsKSl7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiDkv6Hmga/liIblj5HvvIzpgJrnn6XmiYDmnInorqLpmIXogIVcclxuXHQgKiBmaWx0ZXLmiafooYzov5Tlm550cnVl77yM5YiZ5omn6KGMY2FsbFxyXG5cdCAqL1xyXG5cdGRlbGl2ZXIoKXtcclxuXHRcdHRoaXMucndjb250cm9sbGRlci5yZWFkKGZ1bmN0aW9uKGRhdGEpe1xyXG5cdFx0XHQkLmVhY2godGhpcy5zdWJzY3JpYmVycyxmdW5jdGlvbihpbmRleCxpdGVtKXtcclxuXHRcdFx0XHRpZihpdGVtLmZpbHRlcigpID09IHRydWUpe1xyXG5cdFx0ICAgICAgICBcdGl0ZW0uY2FsbC5hcHBseSh3aW5kb3csZGF0YS5hcmdzKTtcclxuXHRcdCAgICAgIFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH0uYmluZCh0aGlzLHthcmdzOiBhcmd1bWVudHN9KSk7XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIOiuoumYhVxyXG4gXHQgKiBAcGFyYW0ge0pTT059ICpzdWJzY3JpYmVyIOiuoumYheiAheOAguagvOW8j+WQjHN1YnNjcmliZXJz6YeM55qE5Y2V54us5LiA6aG5XHJcbiBcdCAqIHtcclxuIFx0ICogXHRcdCpjYWxsOiBmdW5jdGlvbigpe30gLy/kv6Hmga/liIblj5HnmoTlm57osIPlh73mlbBcclxuIFx0ICogICAgICBmaWx0ZXI6IGZ1bmN0aW9uKCl7cmV0dXJuIHRydWU7fSAvL+i/h+a7pOadoeS7tlxyXG4gXHQgKiB9XHJcblx0ICovXHJcblx0c3Vic2NyaWJlKHN1YnNjcmliZXIpe1xyXG5cdFx0aWYodGhpcy5hcmdzVmFsaWRhdGUoc3Vic2NyaWJlcikpe1xyXG5cdFx0XHRpZighVG9vbC5pc0Z1bmN0aW9uKHN1YnNjcmliZXIuZmlsdGVyKSl7XHJcblx0XHQgICAgICAgIHN1YnNjcmliZXIuZmlsdGVyID0gZnVuY3Rpb24oKXtcclxuXHRcdCAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG5cdFx0ICAgICAgICB9O1xyXG5cdFx0ICAgIH1cclxuXHRcdFx0aWYoJC5pbkFycmF5KHN1YnNjcmliZXIsdGhpcy5zdWJzY3JpYmVycykgPCAwKXtcclxuXHRcdFx0XHR0aGlzLnJ3Y29udHJvbGxkZXIud3JpdGUoZnVuY3Rpb24oY3Vyc3ViKXtcclxuXHRcdFx0XHRcdHRoaXMuc3Vic2NyaWJlcnMucHVzaChjdXJzdWIpO1xyXG5cdFx0XHRcdH0uYmluZCh0aGlzLHN1YnNjcmliZXIpKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiDlj5bmtojorqLpmIVcclxuIFx0ICogQHBhcmFtIHtKU09OfSBzdWJzY3JpYmVyIOiuoumYheiAhVxyXG5cdCAqL1xyXG5cdHVuc3Vic2NyaWJlKHN1YnNjcmliZXIpe1xyXG5cdFx0aWYodGhpcy5hcmdzVmFsaWRhdGUoc3Vic2NyaWJlcikpe1xyXG5cdFx0XHR0aGlzLnJ3Y29udHJvbGxkZXIud3JpdGUoZnVuY3Rpb24oY3Vyc3ViKXtcclxuXHRcdFx0XHQkLmVhY2godGhpcy5zdWJzY3JpYmVycywoaW5kZXgsaXRlbSkgPT4ge1xyXG5cdFx0XHRcdFx0aWYoaXRlbSA9PSBjdXJzdWIpe1xyXG5cdFx0XHRcdFx0ICAgIHRoaXMuc3Vic2NyaWJlcnMuc3BsaWNlKGluZGV4LDEpO1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0uYmluZCh0aGlzLHN1YnNjcmliZXIpKTtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUHVibGlzaGVyUztcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXdcclxuICogICDnu5nmjIflrprlhYPntKDliJvlu7pyZXNpemXkuovku7bnm5HlkKznsbtcclxuICogQGF1dGhvciBtaW5ncnVpfCBtaW5ncnVpQHN0YWZmLnNpbmEuY29tLmNuXHJcbiAqIEB2ZXJzaW9uIDEuMCB8IDIwMTUtMDgtMjdcclxuICogQHJldHVybiByZXNpemXnsbtcclxuICogQGV4YW1wbGVcclxuICogIFx0Y29uc3QgUmVzaXplID0gcmVxdWlyZSgnbGlidXRpbC1yZXNpemUnKTtcclxuICogXHRcdHZhciByZXNpemUgPSBuZXcgUmVzaXplKCQod2luZG93KSk7XHJcbiAqIFx0XHRyZXNpemUubGlzdGVuKHtjYWxsOmZ1bmN0aW9uKCl7Y29uc29sZS5sb2coJ+eql+WPo3Jlc2l6ZScpO319KTtcclxuICovXHJcblxyXG5jb25zdCBEZWxheWV2dCA9IHJlcXVpcmUoJy4vZGVsYXlldnQuanMnKTtcclxuXHJcbmNsYXNzIFJlc2l6ZXtcclxuXHQvKipcclxuXHQgKiBAcGFyYW0ge0VsZW1lbnR9ICpub2RlIOWFg+e0oOiKgueCuVxyXG5cdCAqIEBwYXJhbSB7SlNPTn0gY29uZmlnIOW7tui/n+mFjee9ruOAguWQjGV2dC9kZWxheWV2dOexu+eahOWIneWni+WMluWPguaVsFxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKG5vZGUsY29uZmlnKXtcclxuXHRcdGlmKG5vZGUubGVuZ3RoID09IDApe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHR2YXIgb3B0ID0gJC5leHRlbmQoe1xyXG5cdFx0ICAgIGV2dG5hbWU6ICdyZXNpemUnXHJcblx0XHR9LGNvbmZpZyk7XHJcblx0XHR0aGlzLmRlbGF5ID0gbmV3IERlbGF5ZXZ0KG9wdCk7XHJcblx0XHRub2RlLm9uKG9wdC5ldnRuYW1lLCgpID0+IHtcclxuXHRcdFx0dGhpcy5kZWxheS5zdGFydCgpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIOa3u+WKoHNjcm9sbOS6i+S7tuebkeWQrFxyXG4gICAgICogQHBhcmFtIHtKU09OfSBvcHRcclxuICAgICAqIHtcclxuICAgICAqICAgY2FsbDogZnVuY3Rpb24vL+S6i+S7tuWPkeeUn+aXtuinpuWPkeeahOWbnuiwg1xyXG5cdCAqICAgZmlsdGVyOiBmdW5jdGlvbiAvL+i/h+a7pOadoeS7tuOAgmZpbHRlcui/lOWbnuS4unRydWXliJnmiY3op6blj5FjYWxs44CC5LiN5aGr5q2k6aG55YiZ6buY6K6k5LiN6L+H5rukXHJcblx0ICogfVxyXG4gICAgICovXHJcblx0bGlzdGVuKG9wdCl7XHJcblx0XHR0aGlzLmRlbGF5LnN1YnNjcmliZShvcHQpO1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiDnp7vpmaTnm5HlkKxcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHQg5ZKM6LCD55SobGlzdGVu5pe25LiA5qC355qE5Y+C5pWw5byV55SoXHJcblx0ICovXHJcblx0dW5saXN0ZW4ob3B0KXtcclxuXHRcdHRoaXMuZGVsYXkudW5zdWJzY3JpYmUob3B0KTtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUmVzaXplO1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyDor7vlhpnmjqfliLblmajigJTigJTlr7nkuo7or7vlhpnlvILmraXmk43kvZzov5vooYzmjqfliLZcclxuICogQHZlcnNpb24gMS4wIHwgMjAxNS0wOS0wNyDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAcmV0dXJuIOivu+WGmeaOp+WItuWZqOexu1xyXG4gKiBAZXhhbXBsZVxyXG4gKiAqL1xyXG4gY29uc3QgVG9vbCA9IHJlcXVpcmUoJy4vdG9vbC5qcycpO1xyXG5cclxuIGNsYXNzIFJ3Y29udHJvbGxlciB7XHJcblx0IGNvbnN0cnVjdG9yKCl7XHJcblx0XHQgdGhpcy5yZWFkbG9jayA9IGZhbHNlOyAvL+ivu+mUgVxyXG4gXHRcdHRoaXMud3JpdGVsb2NrID0gZmFsc2U7IC8v5YaZ6ZSBXHJcbiBcdFx0dGhpcy5xdWV1ZSA9IFtdOyAvL+ivu+WGmeaTjeS9nOe8k+WtmOmYn+WIl1xyXG5cdCB9XHJcblx0IC8qKlxyXG4gXHQgKiDojrflj5blvZPliY3mmK/lkKblj6/ku6XmiafooYzor7vmk43kvZxcclxuIFx0ICovXHJcblx0IHJlYWRlbmFibGUoKXtcclxuXHRcdGlmKHRoaXMud3JpdGVsb2NrKXtcclxuIFx0XHRcdHJldHVybiBmYWxzZTtcclxuIFx0XHR9XHJcbiBcdFx0cmV0dXJuIHRydWU7XHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOiOt+WPluW9k+WJjeaYr+WQpuWPr+S7peaJp+ihjOWGmeaTjeS9nFxyXG4gXHQgKi9cclxuXHQgd3JpdGVlbmFibGUoKXtcclxuXHRcdGlmKHRoaXMud3JpdGVsb2NrIHx8IHRoaXMucmVhZGxvY2spe1xyXG4gXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG4gXHRcdH1cclxuIFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHQgfVxyXG5cdCAvKipcclxuIFx0ICog5omn6KGM6K+75YaZ5pON5L2c6Zif5YiXXHJcbiBcdCAqL1xyXG4gXHQgZXhlY3F1ZXVlKCl7XHJcblx0XHQgd2hpbGUodGhpcy5xdWV1ZS5sZW5ndGggPiAwKXtcclxuIFx0XHRcdHZhciBvYmogPSB0aGlzLnF1ZXVlLnNoaWZ0KCk7XHJcbiBcdFx0XHRpZihvYmoudHlwZSA9PSAncmVhZCcpe1xyXG4gXHRcdFx0XHR0aGlzLl9leGVjcmVhZChvYmouZnVuKTtcclxuIFx0XHRcdH1lbHNlIGlmKG9iai50eXBlID09ICd3cml0ZScpe1xyXG4gXHRcdFx0XHR0aGlzLl9leGVjd3JpdGUob2JqLmZ1bik7XHJcbiBcdFx0XHR9XHJcbiBcdFx0fVxyXG5cdCB9XHJcblx0IC8qKlxyXG4gXHQgKiDnp4HmnInigJTigJTmiafooYzor7vmk43kvZxcclxuIFx0ICovXHJcblx0IF9leGVjcmVhZChmdW4pe1xyXG5cdFx0dGhpcy5yZWFkbG9jayA9IHRydWU7XHJcbiBcdFx0ZnVuKCk7XHJcbiBcdFx0dGhpcy5yZWFkbG9jayA9IGZhbHNlO1xyXG5cdCB9XHJcblx0IC8qKlxyXG4gXHQgKiDnp4HmnInigJTigJTmiafooYzlhpnmk43kvZxcclxuIFx0ICovXHJcblx0IF9leGVjd3JpdGUoZnVuKXtcclxuXHRcdHRoaXMud3JpdGVsb2NrID0gdHJ1ZTtcclxuIFx0XHRmdW4oKTtcclxuIFx0XHR0aGlzLndyaXRlbG9jayA9IGZhbHNlO1xyXG5cdCB9XHJcblx0IC8qKlxyXG4gXHQgKiDlvIDlp4vor7tcclxuICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSAqZnVuIOivu+aTjeS9nOWbnuiwg+WHveaVsFxyXG4gXHQgKi9cclxuXHQgcmVhZChmdW4pe1xyXG5cdFx0IGlmKFRvb2wuaXNGdW5jdGlvbihmdW4pKXtcclxuIFx0XHRcdGlmKHRoaXMucmVhZGVuYWJsZSgpKXtcclxuIFx0XHRcdFx0dGhpcy5fZXhlY3JlYWQoZnVuKTtcclxuIFx0XHRcdFx0dGhpcy5leGVjcXVldWUoKTtcclxuIFx0XHRcdH1lbHNle1xyXG4gXHRcdFx0XHR0aGlzLnF1ZXVlLnB1c2goe1xyXG4gXHRcdFx0XHRcdHR5cGU6ICdyZWFkJyxcclxuIFx0XHRcdFx0XHRmdW46IGZ1blxyXG4gXHRcdFx0XHR9KTtcclxuIFx0XHRcdH1cclxuIFx0XHR9XHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOW8gOWni+WGmVxyXG4gICAgICAqIEBwYXJhbSB7RnVuY3Rpb259ICpmdW4g5YaZ5pON5L2c5Zue6LCD5Ye95pWwXHJcbiBcdCAqL1xyXG5cdCB3cml0ZShmdW4pe1xyXG5cdFx0IGlmKFRvb2wuaXNGdW5jdGlvbihmdW4pKXtcclxuIFx0XHRcdGlmKHRoaXMud3JpdGVlbmFibGUoKSl7XHJcbiBcdFx0XHRcdHRoaXMuX2V4ZWN3cml0ZShmdW4pO1xyXG4gXHRcdFx0XHR0aGlzLmV4ZWNxdWV1ZSgpO1xyXG4gXHRcdFx0fWVsc2V7XHJcbiBcdFx0XHRcdHRoaXMucXVldWUucHVzaCh7XHJcbiBcdFx0XHRcdFx0dHlwZTogJ3dyaXRlJyxcclxuIFx0XHRcdFx0XHRmdW46IGZ1blxyXG4gXHRcdFx0XHR9KTtcclxuIFx0XHRcdH1cclxuIFx0XHR9XHJcblx0IH1cclxuIH1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUndjb250cm9sbGVyO1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlld1xyXG4gKiAgIOe7meaMh+WumuWFg+e0oOWIm+W7unNjcm9sbOS6i+S7tuebkeWQrOexu1xyXG4gKiBAYXV0aG9yIG1pbmdydWl8IG1pbmdydWlAc3RhZmYuc2luYS5jb20uY25cclxuICogQHZlcnNpb24gMS4wIHwgMjAxNS0wOC0yN1xyXG4gKiBAcmV0dXJuIHNjcm9sbOexu1xyXG4gKiBAZXhhbXBsZVxyXG4gKiBcdFx0Y29uc3QgU2Nyb2xsID0gcmVxdWlyZSgnbGlidXRpbC1zY3JvbGwnKTtcclxuICpcclxuICogXHRcdHZhciBzY3JvbGwgPSBuZXcgU2Nyb2xsKCQod2luZG93KSk7XHJcbiAqIFx0XHRzY3JvbGwubGlzdGVuKHtjYWxsOmZ1bmN0aW9uKCl7Y29uc29sZS5sb2coJ+eql+WPo3Njcm9sbCcpO319KTtcclxuICpcclxuICovXHJcblxyXG5jb25zdCBEZWxheWV2dCA9IHJlcXVpcmUoJy4vZGVsYXlldnQuanMnKTtcclxuXHJcbmNsYXNzIFNjcm9sbHtcclxuXHQvKipcclxuXHQgKiBAcGFyYW0ge0VsZW1lbnR9ICpub2RlIOWFg+e0oOiKgueCuVxyXG5cdCAqIEBwYXJhbSB7SlNPTn0gY29uZmlnIOW7tui/n+mFjee9ruOAguWQjGxpYmV2dC9kZWxheWV2dOexu+eahOWIneWni+WMluWPguaVsFxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKG5vZGUsY29uZmlnKXtcclxuXHRcdGlmKG5vZGUubGVuZ3RoID09IDApe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHR0aGlzLmRlbGF5ID0gbmV3IERlbGF5ZXZ0KGNvbmZpZyk7XHJcblx0XHRub2RlLm9uKCdzY3JvbGwnLCgpID0+IHtcclxuXHRcdFx0dGhpcy5kZWxheS5zdGFydCgpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIOa3u+WKoHNjcm9sbOS6i+S7tuebkeWQrFxyXG4gICAgICogQHBhcmFtIHtKU09OfSBvcHRcclxuICAgICAqIHtcclxuICAgICAqICAgY2FsbDogZnVuY3Rpb24vL+S6i+S7tuWPkeeUn+aXtuinpuWPkeeahOWbnuiwg1xyXG5cdCAqICAgZmlsdGVyOiBmdW5jdGlvbiAvL+i/h+a7pOadoeS7tuOAgmZpbHRlcui/lOWbnuS4unRydWXliJnmiY3op6blj5FjYWxs44CC5LiN5aGr5q2k6aG55YiZ6buY6K6k5LiN6L+H5rukXHJcblx0ICogfVxyXG4gICAgICovXHJcbiAgICBsaXN0ZW4ob3B0KXtcclxuXHRcdHRoaXMuZGVsYXkuc3Vic2NyaWJlKG9wdCk7XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIOenu+mZpOebkeWQrFxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdCDlkozosIPnlKhsaXN0ZW7ml7bkuIDmoLfnmoTlj4LmlbDlvJXnlKhcclxuXHQgKi9cclxuXHR1bmxpc3RlbihvcHQpe1xyXG5cdFx0dGhpcy5kZWxheS51bnN1YnNjcmliZShvcHQpO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTY3JvbGw7XHJcbiIsIi8qKlxyXG4gKiDluLjnlKjlsI/lt6XlhbdcclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiB2YXIgVG9vbCA9IHJlcXVpcmUoJ2xpYnV0aWwtdG9vbCcpO1xyXG4gKi9cclxuY29uc3QgVXJsID0gcmVxdWlyZSgndXJsJyk7XHJcblxyXG4vKipcclxuICogZGF0YeaYr+WQpuaYr+aXoOaViOWtl+auteOAguWNs+aYr251bGx8dW5kZWZpbmVkfCcnXHJcbiogQHBhcmFtIHtPYmplY3R9IGRhdGFcclxuICovXHJcbmV4cG9ydHMuaXNJbnZhbGlkID0gZnVuY3Rpb24oZGF0YSl7XHJcblx0aWYoZGF0YSA9PSBudWxsIHx8IGRhdGEgPT0gJycpe1xyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG5cdHJldHVybiBmYWxzZTtcclxufSxcclxuLyoqXHJcbiAqIOaYr+WQpuaYr09iamVjdOWvueixoeeahOWunuS+i++8jOmAmuW4uOeUqOadpeajgOa1i2RhdGHmmK/lkKbmmK/kuIDkuKrnuq/nmoRKU09O5a2X5q615oiWbmV3IE9iamVjdCgpXHJcbiogQHBhcmFtIHtPYmplY3R9IGRhdGFcclxuICovXHJcbmV4cG9ydHMuaXNPYmplY3QgPSBmdW5jdGlvbihkYXRhKXtcclxuXHRyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGRhdGEpID09ICdbb2JqZWN0IE9iamVjdF0nICYmIGRhdGEuY29uc3RydWN0b3IgPT0gT2JqZWN0O1xyXG59LFxyXG4vKipcclxuICog5pWw5o2u57G75Z6L5piv5ZCm5pivb2JqZWN044CC5LiN5LuF5LuF6ZmQ5LqO5piv57qv55qET2JqZWN05a6e5L6L5YyW55qE5a+56LGhXHJcbiAqL1xyXG5leHBvcnRzLmlzT2JqZWN0VHlwZSA9IGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChkYXRhKSA9PSAnW29iamVjdCBPYmplY3RdJztcclxufSxcclxuLyoqXHJcbiAqIOaYr+WQpuaYr2Z1bmN0aW9uXHJcbiogQHBhcmFtIHtPYmplY3R9IGRhdGFcclxuICovXHJcbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKGRhdGEpe1xyXG5cdHJldHVybiB0eXBlb2YgZGF0YSA9PSAnZnVuY3Rpb24nO1xyXG59LFxyXG4vKipcclxuICog5piv5ZCm5pivQXJyYXlcclxuKiBAcGFyYW0ge09iamVjdH0gZGF0YVxyXG4gKi9cclxuZXhwb3J0cy5pc0FycmF5ID0gZnVuY3Rpb24oZGF0YSl7XHJcblx0cmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChkYXRhKSA9PSAnW29iamVjdCBBcnJheV0nO1xyXG59LFxyXG4vKipcclxuICog5piv5ZCm5pivYm9vbGVhblxyXG4qIEBwYXJhbSB7T2JqZWN0fSBkYXRhXHJcbiAqL1xyXG5leHBvcnRzLmlzQm9vbGVhbiA9IGZ1bmN0aW9uKGRhdGEpe1xyXG5cdHJldHVybiB0eXBlb2YgZGF0YSA9PSAnYm9vbGVhbic7XHJcbn0sXHJcbi8qKlxyXG4gKiDmmK/lkKbmmK9TdHJpbmdcclxuKiBAcGFyYW0ge09iamVjdH0gZGF0YVxyXG4gKi9cclxuZXhwb3J0cy5pc1N0cmluZyA9IGZ1bmN0aW9uKGRhdGEpe1xyXG5cdHJldHVybiB0eXBlb2YgZGF0YSA9PSAnc3RyaW5nJztcclxufSxcclxuLyoqXHJcbiAqIOaYr+WQpuaYr051bWJlclxyXG4qIEBwYXJhbSB7T2JqZWN0fSBkYXRhXHJcbiAqL1xyXG5leHBvcnRzLmlzTnVtYmVyID0gZnVuY3Rpb24oZGF0YSl7XHJcblx0cmV0dXJuIHR5cGVvZiBkYXRhID09ICdudW1iZXInO1xyXG59LFxyXG4vKipcclxuICog5piv5ZCm5piv5LiA5Liq5pyJ5pWI55qEanF1ZXJ5IGRvbeWvueixoVxyXG4gKiBAcGFyYW0ge09iamVjdH0gbm9kZVxyXG4gKi9cclxuZXhwb3J0cy5pc1ZhbGlkSnF1ZXJ5RG9tID0gZnVuY3Rpb24obm9kZSl7XHJcblx0cmV0dXJuIG5vZGUgIT0gbnVsbCAmJiB0aGlzLmlzRnVuY3Rpb24obm9kZS5zaXplKSAmJiBub2RlLmxlbmd0aCA+IDA7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDop6PmnpB1cmxcclxuICogQHBhcmFtIHtTdHJpbmd9IHVybCB1cmzlnLDlnYDvvIzkuI3loavliJnlj5Zsb2NhdGlvbi5ocmVmXHJcbiAqIEByZXR1cm4ge09iamVjdH0gdXJsT2JqZWN0IGh0dHBzOi8vbm9kZWpzLm9yZy9kaXN0L2xhdGVzdC12Ni54L2RvY3MvYXBpL3VybC5odG1sI3VybF91cmxfc3RyaW5nc19hbmRfdXJsX29iamVjdHNcclxuICogIHF1ZXJ5OiDlpoLmnpzmsqHmnIlxdWVyee+8jOWImeaYr3t9XHJcbiAqL1xyXG5leHBvcnRzLnVybHBhcnNlID0gZnVuY3Rpb24odXJsKXtcclxuXHR1cmwgPSB1cmwgfHwgbG9jYXRpb24uaHJlZjtcclxuXHJcblx0cmV0dXJuIFVybC5wYXJzZSh1cmwsdHJ1ZSk7XHJcbn1cclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXdcclxuICogICDnm5HlkKx3aW5kb3cgcmVzaXpl44CC5Y+q5pSv5oyBUENcclxuICogQGF1dGhvciBtaW5ncnVpfCBtaW5ncnVpQHN0YWZmLnNpbmEuY29tLmNuXHJcbiAqIEB2ZXJzaW9uIDEuMCB8IDIwMTUtMDgtMjdcclxuICogQGV4YW1wbGVcclxuICogXHRcdGNvbnN0IFdpbnJlc2l6ZSA9IHJlcXVpcmUoJ2xpYnV0aWwtd2lucmVzaXplJyk7XHJcbiAqXHJcbiAqIFx0XHRXaW5yZXNpemUubGlzdGVuKHtjYWxsOmZ1bmN0aW9uKCl7Y29uc29sZS5sb2coJ+eql+WPo3Jlc2l6ZScpO319KTtcclxuICovXHJcbmNvbnN0IFJlc2l6ZSA9IHJlcXVpcmUoJy4vcmVzaXplLmpzJyksXHJcblx0XHREZXZpY2VldnRuYW1lID0gcmVxdWlyZSgnLi9kZXZpY2VldnRuYW1lLmpzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBSZXNpemUoJCh3aW5kb3cpLHtcclxuXHRldnRuYW1lOiBEZXZpY2VldnRuYW1lKycubGliJ1xyXG59KTtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXdcclxuICogICDnqpflj6Pmu5rliqjkuovku7bnm5HlkKxcclxuICogQGF1dGhvciBtaW5ncnVpfCBtaW5ncnVpQHN0YWZmLnNpbmEuY29tLmNuXHJcbiAqIEB2ZXJzaW9uIDEuMCB8IDIwMTUtMDgtMjdcclxuICogQHJldHVybiDmu5rliqjnm5HlkKzlr7nosaFcclxuICogQGV4YW1wbGVcclxuICogXHRcdGNvbnN0IFdpbnNjcm9sbCA9IHJlcXVpcmUoJ2xpYnV0aWwtd2luc2Nyb2xsJyk7XHJcbiAqXHJcbiAqIFx0XHRXaW5zY3JvbGwubGlzdGVuKHtjYWxsOmZ1bmN0aW9uKCl7Y29uc29sZS5sb2coJ+eql+WPo3Njcm9sbCcpO319KTtcclxuICovXHJcblxyXG5jb25zdCBTY3JvbGwgPSByZXF1aXJlKCcuL3Njcm9sbC5qcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBuZXcgU2Nyb2xsKCQod2luZG93KSk7XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IOe6v+eoi+axoOaOp+WItuWZqFxyXG4gKiAgICAgIOi0n+i0o+i/lOWbnuW9k+WJjeepuumXsueahOe6v+eoi+WvueixoVxyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE3LTAxLTE5IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm5cclxuICogQGV4YW1wbGVcclxuICogICAgICBjb25zdCBXb3JrZXJDb250cm9sID0gcmVxdWlyZSgnbGlidXRpbC13b3JrZXJDb250cm9sJyk7XHJcbiAqICovXHJcblxyXG4gY2xhc3MgV29ya2Vye1xyXG4gICAgIC8qKlxyXG4gICAgICAqIOS4gOS4que6v+eoi1xyXG4gICAgICAqL1xyXG4gICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgIHRoaXMubG9jayA9IHRydWU7XHJcbiAgICAgfVxyXG4gfVxyXG5cclxuIGNsYXNzIFdvcmtlckNvbnRyb2wge1xyXG4gICAgIC8qKlxyXG4gICAgICAqIOe6v+eoi+axoOaOp+WItuWZqOexu1xyXG4gICAgICAqIEByZXR1cm4ge1t0eXBlXX0gW2Rlc2NyaXB0aW9uXVxyXG4gICAgICAqL1xyXG4gICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgIHRoaXMuX3dvcmtlcm9ianMgPSBbXTsgLy93b3JrZXJDb250cm9s5a+56LGhXHJcbiAgICAgfVxyXG4gICAgIC8qKlxyXG4gICAgICAqIOi/lOWbnuW9k+WJjeepuumXsueahHdvcmtlckNvbnRyb2zlr7nosaFcclxuICAgICAgKiBAcmV0dXJuIHtbdHlwZV19IFtkZXNjcmlwdGlvbl1cclxuICAgICAgKi9cclxuICAgICBnZXQoKXtcclxuICAgICAgICAgdmFyIGN1cndvcmtlciA9IG51bGw7XHJcbiAgICAgICAgIGZvcih2YXIgaSA9IDAsIGxlbiA9IHRoaXMuX3dvcmtlcm9ianMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xyXG4gICAgICAgICAgICAgaWYodGhpcy5fd29ya2Vyb2Jqc1tpXS5sb2NrID09IGZhbHNlKXsgLy/ml6Lml6Dor7fmsYLlj4jmsqHmnInooqvplIHlrppcclxuICAgICAgICAgICAgICAgICB0aGlzLl93b3JrZXJvYmpzW2ldLmxvY2sgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgIGN1cndvcmtlciA9IHRoaXMuX3dvcmtlcm9ianNbaV07XHJcbiAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICB9XHJcbiAgICAgICAgIH1cclxuICAgICAgICAgaWYoY3Vyd29ya2VyID09IG51bGwpe1xyXG4gICAgICAgICAgICAgY3Vyd29ya2VyID0gbmV3IFdvcmtlcigpO1xyXG4gICAgICAgICAgICAgdGhpcy5fd29ya2Vyb2Jqcy5wdXNoKGN1cndvcmtlcik7XHJcbiAgICAgICAgIH1cclxuICAgICAgICAgcmV0dXJuIGN1cndvcmtlcjtcclxuICAgICB9XHJcbiAgICAgLyoqXHJcbiAgICAgICog6YCa55+l5b2T5YmNd29ya2VyQ29udHJvbOWvueixoeW3sue7j+S9v+eUqOWujOavlVxyXG4gICAgICAqIEBwYXJhbSB7aW5zdGFuY2Ugb2Ygd29ya2VyQ29udHJvbH0gd29ya2VyIOWmguaenOaPkOS+m+S6hndvcmtlcu+8jOWImee7k+adn+atpOe6v+eoi++8m+WmguaenOayoeaPkOS+m++8jOWImee7k+adn+esrOS4gOS4quato+WcqOS9v+eUqOeahOe6v+eoi1xyXG4gICAgICAqIEByZXR1cm4ge2luc3RhbmNlIG9mIHdvcmtlckNvbnRyb2wgfCBudWxsfSDlvZPliY3nu5PmnZ/nmoTnur/nqIvlr7nosaEu5rKh5pyJ5YiZ5Li6bnVsbFxyXG4gICAgICAqL1xyXG4gICAgIGVuZCh3b3JrZXIpe1xyXG4gICAgICAgICB2YXIgY3Vyd29ya2VyID0gbnVsbDtcclxuICAgICAgICAgZm9yKHZhciBpID0gMCwgbGVuID0gdGhpcy5fd29ya2Vyb2Jqcy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XHJcbiAgICAgICAgICAgICBpZih3b3JrZXIpe1xyXG4gICAgICAgICAgICAgICAgIGlmKHRoaXMuX3dvcmtlcm9ianNbaV0gPT0gd29ya2VyKXsgLy/ml6Lml6Dor7fmsYLlj4jmsqHmnInooqvplIHlrppcclxuICAgICAgICAgICAgICAgICAgICAgdGhpcy5fd29ya2Vyb2Jqc1tpXS5sb2NrID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgIGN1cndvcmtlciA9IHRoaXMuX3dvcmtlcm9ianNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgIGlmKHRoaXMuX3dvcmtlcm9ianNbaV0ubG9jayA9PSB0cnVlKXtcclxuICAgICAgICAgICAgICAgICAgICAgdGhpcy5fd29ya2Vyb2Jqc1tpXS5sb2NrID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgIGN1cndvcmtlciA9IHRoaXMuX3dvcmtlcm9ianNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgIH1cclxuICAgICAgICAgfVxyXG4gICAgICAgICByZXR1cm4gY3Vyd29ya2VyO1xyXG4gICAgIH1cclxuICAgICAvKipcclxuICAgICAgKiDmmK/lkKbmiYDmnInnmoTnur/nqIvpg73ooqvkvb/nlKjlrozmr5VcclxuICAgICAgKiBAcmV0dXJuIHtCb29sZWFufSB0cnVl77ya5omA5pyJ57q/56iL6YO956m66ZeyXHJcbiAgICAgICovXHJcbiAgICAgaXNlbmQoKXtcclxuICAgICAgICAgdmFyIHJlc3VsdCA9IHRydWU7XHJcbiAgICAgICAgIGZvcih2YXIgaSA9IDAsIGxlbiA9IHRoaXMuX3dvcmtlcm9ianMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xyXG4gICAgICAgICAgICAgaWYodGhpcy5fd29ya2Vyb2Jqc1tpXS5sb2NrID09IHRydWUpeyAvL+aXouaXoOivt+axguWPiOayoeacieiiq+mUgeWumlxyXG4gICAgICAgICAgICAgICAgIHJlc3VsdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgfVxyXG4gICAgICAgICB9XHJcbiAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgfVxyXG4gfVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBXb3JrZXJDb250cm9sO1xyXG4iLCJleHBvcnRzLklvID0gcmVxdWlyZSgnLi9pbycpO1xyXG5leHBvcnRzLklvQ29uZmlnID0gcmVxdWlyZSgnLi9pb2NvbmZpZycpO1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyBpb+ivt+axguaAu2FcclxuICovXHJcbnJlcXVpcmUoJ3doYXR3Zy1mZXRjaCcpO1xyXG5jb25zdCBJb0NvbmZpZyA9IHJlcXVpcmUoJy4vaW9jb25maWcnKTtcclxuY29uc3QgZXh0ZW5kID0gcmVxdWlyZSgnZXh0ZW5kJyk7XHJcbmNvbnN0IHF1ZXJ5c3RyaW5nID0gcmVxdWlyZSgncXVlcnlzdHJpbmcnKTtcclxuXHJcbi8qKlxyXG4gKiDlsIZkYXRh5qC85byP5YyW5oiQRm9ybURhdGFcclxuICogQHBhcmFtICB7SlNPTn0gZGF0YSBbZGVzY3JpcHRpb25dXHJcbiAqIEByZXR1cm4ge0Zvcm1EYXRhfSAgICAgIFtkZXNjcmlwdGlvbl1cclxuICovXHJcbmZ1bmN0aW9uIGZvcm1hdEZvcm1EYXRhKGRhdGEpe1xyXG4gICAgdmFyIF9mb3JtZGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xyXG4gICAgZm9yKHZhciBrZXkgaW4gZGF0YSl7XHJcbiAgICAgICAgdmFyIHZhbCA9IGRhdGFba2V5XTtcclxuICAgICAgICBpZih2YWwgPT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfWVsc2UgaWYodmFsLmNvbnN0cnVjdG9yID09IEFycmF5KXtcclxuICAgICAgICAgICAgdmFsLmZvckVhY2goZnVuY3Rpb24odixpKXtcclxuICAgICAgICAgICAgICAgIF9mb3JtZGF0YS5hcHBlbmQoa2V5LHYpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIF9mb3JtZGF0YS5hcHBlbmQoa2V5LHZhbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIF9mb3JtZGF0YTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICAvKipcclxuICAgICAqIOWPkei1t2lv6K+35rGCXHJcbiAgICAgKiBAcGFyYW0gIHtKU09OfSBpb3BhcmFtcyDlkIxpb2NvbmZpZy5pb3BhcmFtc1xyXG4gICAgICogQHJldHVybiB7W3R5cGVdfSAgICAgICAgICBbZGVzY3JpcHRpb25dXHJcbiAgICAgKi9cclxuICAgIHJlcXVlc3Q6IGZ1bmN0aW9uKGlvcGFyYW1zKSB7XHJcbiAgICAgICAgaWYoaW9wYXJhbXMudXJsID09ICcnKXtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpb+WPguaVsHVybOS4jeiDveS4uuepuicpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBjb25mID0ge307XHJcblxyXG4gICAgICAgIGV4dGVuZCh0cnVlLGNvbmYsSW9Db25maWcuaW9wYXJhbXMsaW9wYXJhbXMpO1xyXG5cclxuICAgICAgICBjb25mLnJlcXVlc3QubWV0aG9kID0gY29uZi5yZXF1ZXN0Lm1ldGhvZC50b1VwcGVyQ2FzZSgpO1xyXG5cclxuICAgICAgICAvL+ajgOa1i2lvcGFyYW1z6YeM55qEZGF0YVxyXG4gICAgICAgIHZhciBib2R5ID0gY29uZi5kYXRhLCBfbWV0aG9kID0gY29uZi5yZXF1ZXN0Lm1ldGhvZDtcclxuXHJcbiAgICAgICAgaWYoYm9keSAmJiBib2R5LmNvbnN0cnVjdG9yID09PSBPYmplY3QpeyAvL+ivtOaYjmRhdGHmmK9qc29uXHJcbiAgICAgICAgICAgIGlmKF9tZXRob2QgIT0gJ0dFVCcgJiYgX21ldGhvZCAhPSAnSEVBRCcgJiYgY29uZi5pc2Zvcm1kYXRhKXtcclxuICAgICAgICAgICAgICAgIGJvZHkgPSBmb3JtYXRGb3JtRGF0YShib2R5KTtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBjb25mLmhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIGJvZHkgPSBxdWVyeXN0cmluZy5zdHJpbmdpZnkoYm9keSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKGNvbmYuaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPT09IGZhbHNlKXtcclxuICAgICAgICAgICAgZGVsZXRlIGNvbmYuaGVhZGVyc1snQ29udGVudC1UeXBlJ107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL+i1i+WAvHJlcXVlc3QuYm9keVxyXG4gICAgICAgIGlmKGJvZHkpe1xyXG4gICAgICAgICAgICBzd2l0Y2goX21ldGhvZCl7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdHRVQnOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmKHR5cGVvZiBib2R5ID09ICdzdHJpbmcnKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZi51cmwgKz0gJz8nK2JvZHkudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdIRUFEJzpcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgY29uZi5yZXF1ZXN0LmJvZHkgPSBib2R5O1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL+WPkei1t+ivt+axglxyXG4gICAgICAgIGNvbmYucmVxdWVzdC5oZWFkZXJzID0gY29uZi5oZWFkZXJzO1xyXG4gICAgICAgIHZhciBteXJlcXVlc3QgPSBuZXcgUmVxdWVzdChjb25mLnVybCxjb25mLnJlcXVlc3QpO1xyXG5cclxuICAgICAgICAvL+ivt+axguWPkei1t+WJjee7n+S4gOWkhOeQhlxyXG4gICAgICAgIGNvbmYuYmVmb3JlU2VuZCgpO1xyXG5cclxuICAgICAgICB2YXIgcmFjZSA9IFByb21pc2UucmFjZShbXHJcbiAgICAgICAgICAgIGZldGNoKG15cmVxdWVzdCksXHJcbiAgICAgICAgICAgIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUscmVqZWN0KXtcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQocmVqZWN0LGNvbmYudGltZW91dCxuZXcgRXJyb3IoJ+ivt+axgui2heaXticpKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICBdKTtcclxuICAgICAgICByYWNlLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG4gICAgICAgICAgICBpZihyZXNwb25zZS5vaykgeyAvL3Jlc3BvbnNlLnN0YXR1cyBbMjAwLDI5OV1cclxuICAgICAgICAgICAgICAgIHJlc3BvbnNlW2NvbmYudHlwZV0oKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCl7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoY29uZi5kZWFsZmFpbCl7IC8v5aSE55CG5Lia5Yqh6ZSZ6K+vXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKElvQ29uZmlnLmZhaWwuZmlsdGVyKHJlc3VsdCkpeyAvL+acieS4muWKoemUmeivr+WPkeeUn1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZltJb0NvbmZpZy5mYWlsLmZ1bm5hbWVdKHJlc3VsdCxyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNleyAvL+aXoOS4muWKoemUmeivr+WPkeeUn1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoY29uZi5kZWFsZGF0YSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZi5zdWNjZXNzKGNvbmYuZGVhbGRhdGFmdW4ocmVzdWx0KSxyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25mLnN1Y2Nlc3MocmVzdWx0LHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25mLnN1Y2Nlc3MocmVzdWx0LHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LGZ1bmN0aW9uKGVycm9yKXtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHZhciBlcnJvciA9IG5ldyBFcnJvcihyZXNwb25zZS5zdGF0dXNUZXh0IHx8ICfnvZHnu5zplJnor68nKVxyXG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uZi5jb21wbGV0ZSgpO1xyXG4gICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcclxuICAgICAgICAgICAgLy/mjZXojrfku7vkvZXplJnor6/vvIzljbPlj5HnlJ/or63ms5XplJnor6/kuZ/kvJrmjZXojrdcclxuICAgICAgICAgICAgY29uZi5lcnJvcihlcnJvcik7XHJcbiAgICAgICAgICAgIGNvbmYuY29tcGxldGUoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufTtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcgaW/or7fmsYLnmoTkuIDkupvlhazlhbHphY3nva5cclxuICovXHJcbiBjb25zdCB0aGF0ID0ge1xyXG4gICAgLyoqXHJcbiAgICAgKiDlr7nkuo7mjqXlj6Pov5Tlm57nmoTkuJrliqHplJnor6/ov5vooYznu5/kuIDlpITnkIZcclxuICAgICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICAgKi9cclxuICAgIGZhaWw6IHtcclxuICAgICAgICBmdW5uYW1lOiAnZmFpbCcsIC8v5b2T5Y+R55Sf5Lia5Yqh6ZSZ6K+v55qE5pe25YCZ77yM6LCD55So55qE5pa55rOV5ZCNXHJcbiAgICAgICAgZmlsdGVyOiBmdW5jdGlvbihyZXN1bHQpIHtcclxuICAgICAgICAgICAgLy8gaWYocmVzdWx0LmNvZGUgIT0gJ0EwMDAxJyl7XHJcbiAgICAgICAgICAgIC8vICAgICByZXR1cm4gdHJ1ZTsgLy/or7TmmI7lj5HnlJ/kuobkuJrliqHplJnor69cclxuICAgICAgICAgICAgLy8gfWVsc2V7XHJcbiAgICAgICAgICAgIC8vICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIC8vIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDor7fmsYLlpLTpg6jphY3nva5cclxuICAgICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICAgKi9cclxuICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAvL+WmguaenENvbnRlbnQtVHlwZeiuvue9ruS4umZhbHNlLOWImeS4jeS8oENvbnRlbnQtVHlwZVxyXG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xyXG4gICAgfSxcclxuICAgIC8qKlxyXG4gICAgICog6K+35rGC5a+56LGh5Y+C5pWw6YWN572uXHJcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAgICovXHJcbiAgICByZXF1ZXN0OiB7XHJcbiAgICAgICAgbWV0aG9kOiAnR0VUJywgLy9HRVR8UE9TVFxyXG4gICAgICAgIG1vZGU6ICdjb3JzJywgLy9jb3JzfG5vLWNvcnN8c2FtZS1vcmlnaW58bmF2aWdhdGVcclxuICAgICAgICAvL+WFtuS7luWPguaVsFxyXG4gICAgICAgIC8vYm9keTogY3JlZGVudGlhbHM6IGNhY2hlOiByZWRpcmVjdDogcmVmZXJyZXI6IGludGVncml0eVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIHNhbWUtb3JpZ2luOiDlkIxhamF45LiA5qC377yM5ZCM5Z+f5Y+R6YCBY29va2llXHJcbiAgICAgICAgICogaW5jbHVkZTog6Leo5Z+f5Y+R6YCBY29va2llXHJcbiAgICAgICAgICogQHR5cGUge1N0cmluZ31cclxuICAgICAgICAgKi9cclxuICAgICAgICBjcmVkZW50aWFsczogJ3NhbWUtb3JpZ2luJ1xyXG4gICAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIOiwg+eUqGlv57uE5Lu277yM5Lyg5YWl55qE5Y+C5pWw5qC85byPXHJcbiAqIEB0eXBlIHtPYmplY3R9XHJcbiAqL1xyXG50aGF0LmlvcGFyYW1zID0ge1xyXG4gICAgaGVhZGVyczogdGhhdC5oZWFkZXJzLCAvL+WQjGhlYWRlcnNcclxuICAgIHJlcXVlc3Q6IHRoYXQucmVxdWVzdCwgLy/lkIxyZXF1ZXN0XHJcbiAgICAvKipcclxuICAgICAqIOivt+axguWPguaVsOOAguWPr+S7peaYr+S7peS4i+WHoOenjeexu+Wei++8mlxyXG4gICAgICogQm9sYlxyXG4gICAgICogQnVmZmVyU291cmNlXHJcbiAgICAgKiBGb3JtRGF0YVxyXG4gICAgICogVVJMU2VhcmNoUGFyYW1zXHJcbiAgICAgKiBVU1ZTdHJpbmdcclxuICAgICAqIFN0cmluZ1xyXG4gICAgICogSlNPTjog5aaC5p6c5pivanNvbiwg5YiZ5YGa54m55q6K5aSE55CG77yM6K+36KeB5LiL6Z2iaXNmb3JtZGF0YeeahOivtOaYjlxyXG4gICAgICovXHJcbiAgICAvLyBkYXRhOiB7fSxcclxuICAgIC8qKlxyXG4gICAgICog5aaC5p6cZGF0YeaYr2pzb246XHJcbiAgICAgKiAgMS4gcmVxdWVzdC5tZXRob2TkuI3mmK9HRVTmiJZIRUFELCDkuJRpc2Zvcm1kYXRh5Li6dHJ1ZSwg6YKj5LmI5bCGZGF0Yei9rOaNouaIkEZvcm1EYXRh5qC85byPXHJcbiAgICAgKiAgMi4g5aaC5p6c5LiN56ym5ZCI56ysMeenje+8jOWwhmRhdGHovazmjaLmiJBxdWVyeXN0cmluZ1xyXG4gICAgICogQHR5cGUge0Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGlzZm9ybWRhdGE6IGZhbHNlLFxyXG4gICAgdXJsOiAnJywgLy/or7fmsYJ1cmzlnLDlnYBcclxuICAgIC8qKlxyXG4gICAgICog6K+35rGC55qE5pWw5o2u57G75Z6L77yM6buY6K6k5Li6anNvbi4g5pWw5o2u57G75Z6L5ZKMcmVwb25zZeWvueixoei/lOWbnuiOt+WPlue7k+aenOeahOaWueazleWvueW6lOWFs+ezu+WmguS4i1xyXG4gICAgICogYXJyYXlCdWZmZXI6IHJlc3BvbnNlLmFycmF5QnVmZmVyXHJcbiAgICAgKiBibG9iOiByZXNwb25zZS5ibG9iXHJcbiAgICAgKiBmb3JtRGF0YTogcmVzcG9uc2UuZm9ybURhdGEsXHJcbiAgICAgKiBqc29uOiByZXNwb25zZS5qc29uLFxyXG4gICAgICogdGV4dDogcmVzcG9uc2UudGV4dFxyXG4gICAgICogQHR5cGUge1N0cmluZ31cclxuICAgICAqL1xyXG4gICAgdHlwZTogJ2pzb24nLFxyXG4gICAgdGltZW91dDogNjAwMCxcclxuICAgIC8qKlxyXG4gICAgICogaW/or7fmsYLliY3vvIznu5/kuIDnmoTlpITnkIZcclxuICAgICAqIEByZXR1cm4ge1t0eXBlXX0gW2Rlc2NyaXB0aW9uXVxyXG4gICAgICovXHJcbiAgICBiZWZvcmVTZW5kOiBmdW5jdGlvbigpe1xyXG5cclxuICAgIH0sXHJcbiAgICAvKipcclxuICAgICAqIOWvueS6juaOpeWPo+i/lOWbnumUmeivr++8jOS4gOiIrOWboOS4uue9kee7nOWOn+WboO+8jOi/m+ihjOeahOe7n+S4gOWkhOeQhlxyXG4gICAgICovXHJcbiAgICBlcnJvcjogZnVuY3Rpb24oZXJyb3Ipe1xyXG4gICAgICAgIC8vZXJyb3LmiJbmnInmiJbml6AgZXJyb3IubWVzc2FnZVxyXG4gICAgICAgIC8vQWxlcnQuYWxlcnQoJ+ezu+e7n+a2iOaBrycsZXJyb3IubWVzc2FnZSB8fCAn5Lqy77yM5b+Z5LiN6L+H5p2l5LqGJyk7XHJcbiAgICB9LFxyXG4gICAgLyoqXHJcbiAgICAgKiDlpoLmnpxmYWls6YWN572u5LqGZnVubmFtZeS4umZhaWws5YiZ6LCD55So5q2k5pa55rOVLiDmraTml7ZmYWlsLmZpbHRlcui/lOWbnnRydWVcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fE90aGVyfSByZXN1bHQg5o6l5Y+j6L+U5Zue5pWw5o2uXHJcbiAgICAgKiBAcGFyYW0ge1Jlc3BvbnNlfSByZXNwb25zZSDov5Tlm57nmoRyZXNwb25zZeWvueixoVxyXG4gICAgICogQHJldHVybiB7W3R5cGVdfSBbZGVzY3JpcHRpb25dXHJcbiAgICAgKi9cclxuICAgIGZhaWw6IGZ1bmN0aW9uKHJlc3VsdCxyZXNwb25zZSl7XHJcbiAgICAgICAgLy9BbGVydC5hbGVydCgn57O757uf5raI5oGvJyxyZXN1bHQuZXJybXNnIHx8ICfkurLvvIzlv5nkuI3ov4fmnaXkuoYnKTtcclxuICAgIH0sXHJcbiAgICAvKipcclxuICAgICAqIOaIkOWKn+iwg+eUqOaWueazleOAguiwg+eUqOeahOaDheWGteacieWmguS4i+WHoOenje+8mlxyXG4gICAgICogMS4gZGVhbGZhaWzkuLp0cnVlLCDliJlmYWlsLmZpbHRlcui/lOWbnmZhbHNl5pe277yM6LCD55Soc3VjY2Vzc1xyXG4gICAgICogICAgICAgICAg5q2k5pe25aaC5p6cZGVhbGRhdGHkuLp0cnVlLCDliJlyZXN1bHTkuLpkZWFsZGF0YWZ1bui/lOWbnueahOaVsOaNrlxyXG4gICAgICogMi4gZGVhbGZhaWzkuLpmYWxzZeaXtu+8jOWImeaOpeWPo+i/lOWbnuWQjuebtOaOpeiwg+eUqOatpOaWueazle+8iOS4jeWPkeeUn2Vycm9y55qE5oOF5Ya15LiL77yJXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtPYmplY3R8T3RoZXJ9IHJlc3VsdCDmjqXlj6Pov5Tlm57mlbDmja5cclxuICAgICAqIEBwYXJhbSB7UmVzcG9uc2V9IHJlc3BvbnNlIOi/lOWbnueahHJlc3BvbnNl5a+56LGhXHJcbiAgICAgKi9cclxuICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3VsdCxyZXNwb25zZSl7fSxcclxuICAgIC8qKlxyXG4gICAgICog5o6l5Y+j6K+35rGC5a6M5q+V6LCD55So44CC5peg6K66c3VjY2VzcyxmYWlsLGVycm9yXHJcbiAgICAgKiBAcmV0dXJuIHtbdHlwZV19IFtkZXNjcmlwdGlvbl1cclxuICAgICAqL1xyXG4gICAgY29tcGxldGU6IGZ1bmN0aW9uKCl7fSxcclxuICAgIC8qKlxyXG4gICAgICog5aaC5p6cZGVhbGRhdGHkuLp0cnVlLCDliJlzdWNjZXNz55qEcmVzdWx05Li65q2k5pa55rOV6L+U5Zue55qE5pWw5o2uXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdHxPdGhlcn0gcmVzdWx0IOaOpeWPo+i/lOWbnuaVsOaNrlxyXG4gICAgICogQHJldHVybiB7W3R5cGVdfSAgICAgICAgW2Rlc2NyaXB0aW9uXVxyXG4gICAgICovXHJcbiAgICBkZWFsZGF0YWZ1bjogZnVuY3Rpb24ocmVzdWx0KXtyZXR1cm4gcmVzdWx0LmRhdGF9LFxyXG4gICAgLyoqXHJcbiAgICAgKiDmmK/lkKbnu5/kuIDlpITnkIbkuJrliqHplJnor69cclxuICAgICAqIEB0eXBlIHtCb29sZWFufVxyXG4gICAgICovXHJcbiAgICBkZWFsZmFpbDogdHJ1ZSwgLy/mmK/lkKbnu5/kuIDlpITnkIbkuJrliqHplJnor69cclxuICAgIC8qKlxyXG4gICAgICog5b2T5Lia5Yqh5oiQ5Yqf5pe277yM6LCD55Soc3VjY2Vzc+WJje+8jOaYr+WQpue7n+S4gOagvOW8j+WMluaVsOaNrlxyXG4gICAgICog5aaC5p6cZGVhbGZhaWzkuLp0cnVlLOW5tuS4lGZhaWwuZmlsdGVy6L+U5Zue5Li6ZmFsc2Xml7bvvIzlpoLmnpzmraTpobnorr7nva7kuLp0cnVlLOWImeiwg+eUqGRlYWxkYXRhZnVu5pa55rOV77yM6L+U5Zue5aSE55CG5ZCO55qE5pWw5o2uXHJcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgZGVhbGRhdGE6IHRydWVcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdGhhdDtcclxuIiwiKGZ1bmN0aW9uKHNlbGYpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGlmIChzZWxmLmZldGNoKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICB2YXIgc3VwcG9ydCA9IHtcbiAgICBzZWFyY2hQYXJhbXM6ICdVUkxTZWFyY2hQYXJhbXMnIGluIHNlbGYsXG4gICAgaXRlcmFibGU6ICdTeW1ib2wnIGluIHNlbGYgJiYgJ2l0ZXJhdG9yJyBpbiBTeW1ib2wsXG4gICAgYmxvYjogJ0ZpbGVSZWFkZXInIGluIHNlbGYgJiYgJ0Jsb2InIGluIHNlbGYgJiYgKGZ1bmN0aW9uKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgbmV3IEJsb2IoKVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH0pKCksXG4gICAgZm9ybURhdGE6ICdGb3JtRGF0YScgaW4gc2VsZixcbiAgICBhcnJheUJ1ZmZlcjogJ0FycmF5QnVmZmVyJyBpbiBzZWxmXG4gIH1cblxuICBpZiAoc3VwcG9ydC5hcnJheUJ1ZmZlcikge1xuICAgIHZhciB2aWV3Q2xhc3NlcyA9IFtcbiAgICAgICdbb2JqZWN0IEludDhBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgVWludDhBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgVWludDhDbGFtcGVkQXJyYXldJyxcbiAgICAgICdbb2JqZWN0IEludDE2QXJyYXldJyxcbiAgICAgICdbb2JqZWN0IFVpbnQxNkFycmF5XScsXG4gICAgICAnW29iamVjdCBJbnQzMkFycmF5XScsXG4gICAgICAnW29iamVjdCBVaW50MzJBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgRmxvYXQzMkFycmF5XScsXG4gICAgICAnW29iamVjdCBGbG9hdDY0QXJyYXldJ1xuICAgIF1cblxuICAgIHZhciBpc0RhdGFWaWV3ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gb2JqICYmIERhdGFWaWV3LnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKG9iailcbiAgICB9XG5cbiAgICB2YXIgaXNBcnJheUJ1ZmZlclZpZXcgPSBBcnJheUJ1ZmZlci5pc1ZpZXcgfHwgZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gb2JqICYmIHZpZXdDbGFzc2VzLmluZGV4T2YoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikpID4gLTFcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVOYW1lKG5hbWUpIHtcbiAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICBuYW1lID0gU3RyaW5nKG5hbWUpXG4gICAgfVxuICAgIGlmICgvW15hLXowLTlcXC0jJCUmJyorLlxcXl9gfH5dL2kudGVzdChuYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBjaGFyYWN0ZXIgaW4gaGVhZGVyIGZpZWxkIG5hbWUnKVxuICAgIH1cbiAgICByZXR1cm4gbmFtZS50b0xvd2VyQ2FzZSgpXG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVWYWx1ZSh2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICB2YWx1ZSA9IFN0cmluZyh2YWx1ZSlcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cblxuICAvLyBCdWlsZCBhIGRlc3RydWN0aXZlIGl0ZXJhdG9yIGZvciB0aGUgdmFsdWUgbGlzdFxuICBmdW5jdGlvbiBpdGVyYXRvckZvcihpdGVtcykge1xuICAgIHZhciBpdGVyYXRvciA9IHtcbiAgICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdmFsdWUgPSBpdGVtcy5zaGlmdCgpXG4gICAgICAgIHJldHVybiB7ZG9uZTogdmFsdWUgPT09IHVuZGVmaW5lZCwgdmFsdWU6IHZhbHVlfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0Lml0ZXJhYmxlKSB7XG4gICAgICBpdGVyYXRvcltTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBpdGVyYXRvclxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBpdGVyYXRvclxuICB9XG5cbiAgZnVuY3Rpb24gSGVhZGVycyhoZWFkZXJzKSB7XG4gICAgdGhpcy5tYXAgPSB7fVxuXG4gICAgaWYgKGhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzKSB7XG4gICAgICBoZWFkZXJzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQobmFtZSwgdmFsdWUpXG4gICAgICB9LCB0aGlzKVxuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShoZWFkZXJzKSkge1xuICAgICAgaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKGhlYWRlcikge1xuICAgICAgICB0aGlzLmFwcGVuZChoZWFkZXJbMF0sIGhlYWRlclsxXSlcbiAgICAgIH0sIHRoaXMpXG4gICAgfSBlbHNlIGlmIChoZWFkZXJzKSB7XG4gICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhoZWFkZXJzKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQobmFtZSwgaGVhZGVyc1tuYW1lXSlcbiAgICAgIH0sIHRoaXMpXG4gICAgfVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuYXBwZW5kID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICBuYW1lID0gbm9ybWFsaXplTmFtZShuYW1lKVxuICAgIHZhbHVlID0gbm9ybWFsaXplVmFsdWUodmFsdWUpXG4gICAgdmFyIG9sZFZhbHVlID0gdGhpcy5tYXBbbmFtZV1cbiAgICB0aGlzLm1hcFtuYW1lXSA9IG9sZFZhbHVlID8gb2xkVmFsdWUrJywnK3ZhbHVlIDogdmFsdWVcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlWydkZWxldGUnXSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBuYW1lID0gbm9ybWFsaXplTmFtZShuYW1lKVxuICAgIHJldHVybiB0aGlzLmhhcyhuYW1lKSA/IHRoaXMubWFwW25hbWVdIDogbnVsbFxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiB0aGlzLm1hcC5oYXNPd25Qcm9wZXJ0eShub3JtYWxpemVOYW1lKG5hbWUpKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXSA9IG5vcm1hbGl6ZVZhbHVlKHZhbHVlKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uKGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgZm9yICh2YXIgbmFtZSBpbiB0aGlzLm1hcCkge1xuICAgICAgaWYgKHRoaXMubWFwLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgIGNhbGxiYWNrLmNhbGwodGhpc0FyZywgdGhpcy5tYXBbbmFtZV0sIG5hbWUsIHRoaXMpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUua2V5cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpdGVtcyA9IFtdXG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7IGl0ZW1zLnB1c2gobmFtZSkgfSlcbiAgICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS52YWx1ZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXVxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSkgeyBpdGVtcy5wdXNoKHZhbHVlKSB9KVxuICAgIHJldHVybiBpdGVyYXRvckZvcihpdGVtcylcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmVudHJpZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXVxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkgeyBpdGVtcy5wdXNoKFtuYW1lLCB2YWx1ZV0pIH0pXG4gICAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxuICB9XG5cbiAgaWYgKHN1cHBvcnQuaXRlcmFibGUpIHtcbiAgICBIZWFkZXJzLnByb3RvdHlwZVtTeW1ib2wuaXRlcmF0b3JdID0gSGVhZGVycy5wcm90b3R5cGUuZW50cmllc1xuICB9XG5cbiAgZnVuY3Rpb24gY29uc3VtZWQoYm9keSkge1xuICAgIGlmIChib2R5LmJvZHlVc2VkKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJykpXG4gICAgfVxuICAgIGJvZHkuYm9keVVzZWQgPSB0cnVlXG4gIH1cblxuICBmdW5jdGlvbiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXNvbHZlKHJlYWRlci5yZXN1bHQpXG4gICAgICB9XG4gICAgICByZWFkZXIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QocmVhZGVyLmVycm9yKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQmxvYkFzQXJyYXlCdWZmZXIoYmxvYikge1xuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgdmFyIHByb21pc2UgPSBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKVxuICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihibG9iKVxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQmxvYkFzVGV4dChibG9iKSB7XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICB2YXIgcHJvbWlzZSA9IGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpXG4gICAgcmVhZGVyLnJlYWRBc1RleHQoYmxvYilcbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEFycmF5QnVmZmVyQXNUZXh0KGJ1Zikge1xuICAgIHZhciB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmKVxuICAgIHZhciBjaGFycyA9IG5ldyBBcnJheSh2aWV3Lmxlbmd0aClcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmlldy5sZW5ndGg7IGkrKykge1xuICAgICAgY2hhcnNbaV0gPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHZpZXdbaV0pXG4gICAgfVxuICAgIHJldHVybiBjaGFycy5qb2luKCcnKVxuICB9XG5cbiAgZnVuY3Rpb24gYnVmZmVyQ2xvbmUoYnVmKSB7XG4gICAgaWYgKGJ1Zi5zbGljZSkge1xuICAgICAgcmV0dXJuIGJ1Zi5zbGljZSgwKVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdmlldyA9IG5ldyBVaW50OEFycmF5KGJ1Zi5ieXRlTGVuZ3RoKVxuICAgICAgdmlldy5zZXQobmV3IFVpbnQ4QXJyYXkoYnVmKSlcbiAgICAgIHJldHVybiB2aWV3LmJ1ZmZlclxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIEJvZHkoKSB7XG4gICAgdGhpcy5ib2R5VXNlZCA9IGZhbHNlXG5cbiAgICB0aGlzLl9pbml0Qm9keSA9IGZ1bmN0aW9uKGJvZHkpIHtcbiAgICAgIHRoaXMuX2JvZHlJbml0ID0gYm9keVxuICAgICAgaWYgKCFib2R5KSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gJydcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmJsb2IgJiYgQmxvYi5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5QmxvYiA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5mb3JtRGF0YSAmJiBGb3JtRGF0YS5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5Rm9ybURhdGEgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuc2VhcmNoUGFyYW1zICYmIFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHkudG9TdHJpbmcoKVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmFycmF5QnVmZmVyICYmIHN1cHBvcnQuYmxvYiAmJiBpc0RhdGFWaWV3KGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlBcnJheUJ1ZmZlciA9IGJ1ZmZlckNsb25lKGJvZHkuYnVmZmVyKVxuICAgICAgICAvLyBJRSAxMC0xMSBjYW4ndCBoYW5kbGUgYSBEYXRhVmlldyBib2R5LlxuICAgICAgICB0aGlzLl9ib2R5SW5pdCA9IG5ldyBCbG9iKFt0aGlzLl9ib2R5QXJyYXlCdWZmZXJdKVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmFycmF5QnVmZmVyICYmIChBcnJheUJ1ZmZlci5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSB8fCBpc0FycmF5QnVmZmVyVmlldyhib2R5KSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUFycmF5QnVmZmVyID0gYnVmZmVyQ2xvbmUoYm9keSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigndW5zdXBwb3J0ZWQgQm9keUluaXQgdHlwZScpXG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5oZWFkZXJzLmdldCgnY29udGVudC10eXBlJykpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsICd0ZXh0L3BsYWluO2NoYXJzZXQ9VVRGLTgnKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlCbG9iICYmIHRoaXMuX2JvZHlCbG9iLnR5cGUpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCB0aGlzLl9ib2R5QmxvYi50eXBlKVxuICAgICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuc2VhcmNoUGFyYW1zICYmIFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7Y2hhcnNldD1VVEYtOCcpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3VwcG9ydC5ibG9iKSB7XG4gICAgICB0aGlzLmJsb2IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdGVkXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fYm9keUJsb2IpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlCbG9iKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IEJsb2IoW3RoaXMuX2JvZHlBcnJheUJ1ZmZlcl0pKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyBibG9iJylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBCbG9iKFt0aGlzLl9ib2R5VGV4dF0pKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYXJyYXlCdWZmZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikge1xuICAgICAgICAgIHJldHVybiBjb25zdW1lZCh0aGlzKSB8fCBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keUFycmF5QnVmZmVyKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLmJsb2IoKS50aGVuKHJlYWRCbG9iQXNBcnJheUJ1ZmZlcilcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMudGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICByZXR1cm4gcmVqZWN0ZWRcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX2JvZHlCbG9iKSB7XG4gICAgICAgIHJldHVybiByZWFkQmxvYkFzVGV4dCh0aGlzLl9ib2R5QmxvYilcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUFycmF5QnVmZmVyKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVhZEFycmF5QnVmZmVyQXNUZXh0KHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikpXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgdGV4dCcpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlUZXh0KVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0LmZvcm1EYXRhKSB7XG4gICAgICB0aGlzLmZvcm1EYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRleHQoKS50aGVuKGRlY29kZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmpzb24gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnRleHQoKS50aGVuKEpTT04ucGFyc2UpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8vIEhUVFAgbWV0aG9kcyB3aG9zZSBjYXBpdGFsaXphdGlvbiBzaG91bGQgYmUgbm9ybWFsaXplZFxuICB2YXIgbWV0aG9kcyA9IFsnREVMRVRFJywgJ0dFVCcsICdIRUFEJywgJ09QVElPTlMnLCAnUE9TVCcsICdQVVQnXVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZU1ldGhvZChtZXRob2QpIHtcbiAgICB2YXIgdXBjYXNlZCA9IG1ldGhvZC50b1VwcGVyQ2FzZSgpXG4gICAgcmV0dXJuIChtZXRob2RzLmluZGV4T2YodXBjYXNlZCkgPiAtMSkgPyB1cGNhc2VkIDogbWV0aG9kXG4gIH1cblxuICBmdW5jdGlvbiBSZXF1ZXN0KGlucHV0LCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cbiAgICB2YXIgYm9keSA9IG9wdGlvbnMuYm9keVxuXG4gICAgaWYgKGlucHV0IGluc3RhbmNlb2YgUmVxdWVzdCkge1xuICAgICAgaWYgKGlucHV0LmJvZHlVc2VkKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FscmVhZHkgcmVhZCcpXG4gICAgICB9XG4gICAgICB0aGlzLnVybCA9IGlucHV0LnVybFxuICAgICAgdGhpcy5jcmVkZW50aWFscyA9IGlucHV0LmNyZWRlbnRpYWxzXG4gICAgICBpZiAoIW9wdGlvbnMuaGVhZGVycykge1xuICAgICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhpbnB1dC5oZWFkZXJzKVxuICAgICAgfVxuICAgICAgdGhpcy5tZXRob2QgPSBpbnB1dC5tZXRob2RcbiAgICAgIHRoaXMubW9kZSA9IGlucHV0Lm1vZGVcbiAgICAgIGlmICghYm9keSAmJiBpbnB1dC5fYm9keUluaXQgIT0gbnVsbCkge1xuICAgICAgICBib2R5ID0gaW5wdXQuX2JvZHlJbml0XG4gICAgICAgIGlucHV0LmJvZHlVc2VkID0gdHJ1ZVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnVybCA9IFN0cmluZyhpbnB1dClcbiAgICB9XG5cbiAgICB0aGlzLmNyZWRlbnRpYWxzID0gb3B0aW9ucy5jcmVkZW50aWFscyB8fCB0aGlzLmNyZWRlbnRpYWxzIHx8ICdvbWl0J1xuICAgIGlmIChvcHRpb25zLmhlYWRlcnMgfHwgIXRoaXMuaGVhZGVycykge1xuICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMob3B0aW9ucy5oZWFkZXJzKVxuICAgIH1cbiAgICB0aGlzLm1ldGhvZCA9IG5vcm1hbGl6ZU1ldGhvZChvcHRpb25zLm1ldGhvZCB8fCB0aGlzLm1ldGhvZCB8fCAnR0VUJylcbiAgICB0aGlzLm1vZGUgPSBvcHRpb25zLm1vZGUgfHwgdGhpcy5tb2RlIHx8IG51bGxcbiAgICB0aGlzLnJlZmVycmVyID0gbnVsbFxuXG4gICAgaWYgKCh0aGlzLm1ldGhvZCA9PT0gJ0dFVCcgfHwgdGhpcy5tZXRob2QgPT09ICdIRUFEJykgJiYgYm9keSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQm9keSBub3QgYWxsb3dlZCBmb3IgR0VUIG9yIEhFQUQgcmVxdWVzdHMnKVxuICAgIH1cbiAgICB0aGlzLl9pbml0Qm9keShib2R5KVxuICB9XG5cbiAgUmVxdWVzdC5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFJlcXVlc3QodGhpcywgeyBib2R5OiB0aGlzLl9ib2R5SW5pdCB9KVxuICB9XG5cbiAgZnVuY3Rpb24gZGVjb2RlKGJvZHkpIHtcbiAgICB2YXIgZm9ybSA9IG5ldyBGb3JtRGF0YSgpXG4gICAgYm9keS50cmltKCkuc3BsaXQoJyYnKS5mb3JFYWNoKGZ1bmN0aW9uKGJ5dGVzKSB7XG4gICAgICBpZiAoYnl0ZXMpIHtcbiAgICAgICAgdmFyIHNwbGl0ID0gYnl0ZXMuc3BsaXQoJz0nKVxuICAgICAgICB2YXIgbmFtZSA9IHNwbGl0LnNoaWZ0KCkucmVwbGFjZSgvXFwrL2csICcgJylcbiAgICAgICAgdmFyIHZhbHVlID0gc3BsaXQuam9pbignPScpLnJlcGxhY2UoL1xcKy9nLCAnICcpXG4gICAgICAgIGZvcm0uYXBwZW5kKGRlY29kZVVSSUNvbXBvbmVudChuYW1lKSwgZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlKSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBmb3JtXG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZUhlYWRlcnMocmF3SGVhZGVycykge1xuICAgIHZhciBoZWFkZXJzID0gbmV3IEhlYWRlcnMoKVxuICAgIHJhd0hlYWRlcnMuc3BsaXQoL1xccj9cXG4vKS5mb3JFYWNoKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgIHZhciBwYXJ0cyA9IGxpbmUuc3BsaXQoJzonKVxuICAgICAgdmFyIGtleSA9IHBhcnRzLnNoaWZ0KCkudHJpbSgpXG4gICAgICBpZiAoa2V5KSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IHBhcnRzLmpvaW4oJzonKS50cmltKClcbiAgICAgICAgaGVhZGVycy5hcHBlbmQoa2V5LCB2YWx1ZSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBoZWFkZXJzXG4gIH1cblxuICBCb2R5LmNhbGwoUmVxdWVzdC5wcm90b3R5cGUpXG5cbiAgZnVuY3Rpb24gUmVzcG9uc2UoYm9keUluaXQsIG9wdGlvbnMpIHtcbiAgICBpZiAoIW9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSB7fVxuICAgIH1cblxuICAgIHRoaXMudHlwZSA9ICdkZWZhdWx0J1xuICAgIHRoaXMuc3RhdHVzID0gJ3N0YXR1cycgaW4gb3B0aW9ucyA/IG9wdGlvbnMuc3RhdHVzIDogMjAwXG4gICAgdGhpcy5vayA9IHRoaXMuc3RhdHVzID49IDIwMCAmJiB0aGlzLnN0YXR1cyA8IDMwMFxuICAgIHRoaXMuc3RhdHVzVGV4dCA9ICdzdGF0dXNUZXh0JyBpbiBvcHRpb25zID8gb3B0aW9ucy5zdGF0dXNUZXh0IDogJ09LJ1xuICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKG9wdGlvbnMuaGVhZGVycylcbiAgICB0aGlzLnVybCA9IG9wdGlvbnMudXJsIHx8ICcnXG4gICAgdGhpcy5faW5pdEJvZHkoYm9keUluaXQpXG4gIH1cblxuICBCb2R5LmNhbGwoUmVzcG9uc2UucHJvdG90eXBlKVxuXG4gIFJlc3BvbnNlLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgUmVzcG9uc2UodGhpcy5fYm9keUluaXQsIHtcbiAgICAgIHN0YXR1czogdGhpcy5zdGF0dXMsXG4gICAgICBzdGF0dXNUZXh0OiB0aGlzLnN0YXR1c1RleHQsXG4gICAgICBoZWFkZXJzOiBuZXcgSGVhZGVycyh0aGlzLmhlYWRlcnMpLFxuICAgICAgdXJsOiB0aGlzLnVybFxuICAgIH0pXG4gIH1cblxuICBSZXNwb25zZS5lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXNwb25zZSA9IG5ldyBSZXNwb25zZShudWxsLCB7c3RhdHVzOiAwLCBzdGF0dXNUZXh0OiAnJ30pXG4gICAgcmVzcG9uc2UudHlwZSA9ICdlcnJvcidcbiAgICByZXR1cm4gcmVzcG9uc2VcbiAgfVxuXG4gIHZhciByZWRpcmVjdFN0YXR1c2VzID0gWzMwMSwgMzAyLCAzMDMsIDMwNywgMzA4XVxuXG4gIFJlc3BvbnNlLnJlZGlyZWN0ID0gZnVuY3Rpb24odXJsLCBzdGF0dXMpIHtcbiAgICBpZiAocmVkaXJlY3RTdGF0dXNlcy5pbmRleE9mKHN0YXR1cykgPT09IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW52YWxpZCBzdGF0dXMgY29kZScpXG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShudWxsLCB7c3RhdHVzOiBzdGF0dXMsIGhlYWRlcnM6IHtsb2NhdGlvbjogdXJsfX0pXG4gIH1cblxuICBzZWxmLkhlYWRlcnMgPSBIZWFkZXJzXG4gIHNlbGYuUmVxdWVzdCA9IFJlcXVlc3RcbiAgc2VsZi5SZXNwb25zZSA9IFJlc3BvbnNlXG5cbiAgc2VsZi5mZXRjaCA9IGZ1bmN0aW9uKGlucHV0LCBpbml0KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIHJlcXVlc3QgPSBuZXcgUmVxdWVzdChpbnB1dCwgaW5pdClcbiAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuXG4gICAgICB4aHIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgICAgIHN0YXR1czogeGhyLnN0YXR1cyxcbiAgICAgICAgICBzdGF0dXNUZXh0OiB4aHIuc3RhdHVzVGV4dCxcbiAgICAgICAgICBoZWFkZXJzOiBwYXJzZUhlYWRlcnMoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpIHx8ICcnKVxuICAgICAgICB9XG4gICAgICAgIG9wdGlvbnMudXJsID0gJ3Jlc3BvbnNlVVJMJyBpbiB4aHIgPyB4aHIucmVzcG9uc2VVUkwgOiBvcHRpb25zLmhlYWRlcnMuZ2V0KCdYLVJlcXVlc3QtVVJMJylcbiAgICAgICAgdmFyIGJvZHkgPSAncmVzcG9uc2UnIGluIHhociA/IHhoci5yZXNwb25zZSA6IHhoci5yZXNwb25zZVRleHRcbiAgICAgICAgcmVzb2x2ZShuZXcgUmVzcG9uc2UoYm9keSwgb3B0aW9ucykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChuZXcgVHlwZUVycm9yKCdOZXR3b3JrIHJlcXVlc3QgZmFpbGVkJykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vbnRpbWVvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ05ldHdvcmsgcmVxdWVzdCBmYWlsZWQnKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9wZW4ocmVxdWVzdC5tZXRob2QsIHJlcXVlc3QudXJsLCB0cnVlKVxuXG4gICAgICBpZiAocmVxdWVzdC5jcmVkZW50aWFscyA9PT0gJ2luY2x1ZGUnKSB7XG4gICAgICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlXG4gICAgICB9XG5cbiAgICAgIGlmICgncmVzcG9uc2VUeXBlJyBpbiB4aHIgJiYgc3VwcG9ydC5ibG9iKSB7XG4gICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnYmxvYidcbiAgICAgIH1cblxuICAgICAgcmVxdWVzdC5oZWFkZXJzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIobmFtZSwgdmFsdWUpXG4gICAgICB9KVxuXG4gICAgICB4aHIuc2VuZCh0eXBlb2YgcmVxdWVzdC5fYm9keUluaXQgPT09ICd1bmRlZmluZWQnID8gbnVsbCA6IHJlcXVlc3QuX2JvZHlJbml0KVxuICAgIH0pXG4gIH1cbiAgc2VsZi5mZXRjaC5wb2x5ZmlsbCA9IHRydWVcbn0pKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyA/IHNlbGYgOiB0aGlzKTtcbiIsIi8qISBodHRwczovL210aHMuYmUvcHVueWNvZGUgdjEuNC4xIGJ5IEBtYXRoaWFzICovXG47KGZ1bmN0aW9uKHJvb3QpIHtcblxuXHQvKiogRGV0ZWN0IGZyZWUgdmFyaWFibGVzICovXG5cdHZhciBmcmVlRXhwb3J0cyA9IHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHMgJiZcblx0XHQhZXhwb3J0cy5ub2RlVHlwZSAmJiBleHBvcnRzO1xuXHR2YXIgZnJlZU1vZHVsZSA9IHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlICYmXG5cdFx0IW1vZHVsZS5ub2RlVHlwZSAmJiBtb2R1bGU7XG5cdHZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWw7XG5cdGlmIChcblx0XHRmcmVlR2xvYmFsLmdsb2JhbCA9PT0gZnJlZUdsb2JhbCB8fFxuXHRcdGZyZWVHbG9iYWwud2luZG93ID09PSBmcmVlR2xvYmFsIHx8XG5cdFx0ZnJlZUdsb2JhbC5zZWxmID09PSBmcmVlR2xvYmFsXG5cdCkge1xuXHRcdHJvb3QgPSBmcmVlR2xvYmFsO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBgcHVueWNvZGVgIG9iamVjdC5cblx0ICogQG5hbWUgcHVueWNvZGVcblx0ICogQHR5cGUgT2JqZWN0XG5cdCAqL1xuXHR2YXIgcHVueWNvZGUsXG5cblx0LyoqIEhpZ2hlc3QgcG9zaXRpdmUgc2lnbmVkIDMyLWJpdCBmbG9hdCB2YWx1ZSAqL1xuXHRtYXhJbnQgPSAyMTQ3NDgzNjQ3LCAvLyBha2EuIDB4N0ZGRkZGRkYgb3IgMl4zMS0xXG5cblx0LyoqIEJvb3RzdHJpbmcgcGFyYW1ldGVycyAqL1xuXHRiYXNlID0gMzYsXG5cdHRNaW4gPSAxLFxuXHR0TWF4ID0gMjYsXG5cdHNrZXcgPSAzOCxcblx0ZGFtcCA9IDcwMCxcblx0aW5pdGlhbEJpYXMgPSA3Mixcblx0aW5pdGlhbE4gPSAxMjgsIC8vIDB4ODBcblx0ZGVsaW1pdGVyID0gJy0nLCAvLyAnXFx4MkQnXG5cblx0LyoqIFJlZ3VsYXIgZXhwcmVzc2lvbnMgKi9cblx0cmVnZXhQdW55Y29kZSA9IC9eeG4tLS8sXG5cdHJlZ2V4Tm9uQVNDSUkgPSAvW15cXHgyMC1cXHg3RV0vLCAvLyB1bnByaW50YWJsZSBBU0NJSSBjaGFycyArIG5vbi1BU0NJSSBjaGFyc1xuXHRyZWdleFNlcGFyYXRvcnMgPSAvW1xceDJFXFx1MzAwMlxcdUZGMEVcXHVGRjYxXS9nLCAvLyBSRkMgMzQ5MCBzZXBhcmF0b3JzXG5cblx0LyoqIEVycm9yIG1lc3NhZ2VzICovXG5cdGVycm9ycyA9IHtcblx0XHQnb3ZlcmZsb3cnOiAnT3ZlcmZsb3c6IGlucHV0IG5lZWRzIHdpZGVyIGludGVnZXJzIHRvIHByb2Nlc3MnLFxuXHRcdCdub3QtYmFzaWMnOiAnSWxsZWdhbCBpbnB1dCA+PSAweDgwIChub3QgYSBiYXNpYyBjb2RlIHBvaW50KScsXG5cdFx0J2ludmFsaWQtaW5wdXQnOiAnSW52YWxpZCBpbnB1dCdcblx0fSxcblxuXHQvKiogQ29udmVuaWVuY2Ugc2hvcnRjdXRzICovXG5cdGJhc2VNaW51c1RNaW4gPSBiYXNlIC0gdE1pbixcblx0Zmxvb3IgPSBNYXRoLmZsb29yLFxuXHRzdHJpbmdGcm9tQ2hhckNvZGUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlLFxuXG5cdC8qKiBUZW1wb3JhcnkgdmFyaWFibGUgKi9cblx0a2V5O1xuXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cdC8qKlxuXHQgKiBBIGdlbmVyaWMgZXJyb3IgdXRpbGl0eSBmdW5jdGlvbi5cblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IHR5cGUgVGhlIGVycm9yIHR5cGUuXG5cdCAqIEByZXR1cm5zIHtFcnJvcn0gVGhyb3dzIGEgYFJhbmdlRXJyb3JgIHdpdGggdGhlIGFwcGxpY2FibGUgZXJyb3IgbWVzc2FnZS5cblx0ICovXG5cdGZ1bmN0aW9uIGVycm9yKHR5cGUpIHtcblx0XHR0aHJvdyBuZXcgUmFuZ2VFcnJvcihlcnJvcnNbdHlwZV0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIEEgZ2VuZXJpYyBgQXJyYXkjbWFwYCB1dGlsaXR5IGZ1bmN0aW9uLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdGhhdCBnZXRzIGNhbGxlZCBmb3IgZXZlcnkgYXJyYXlcblx0ICogaXRlbS5cblx0ICogQHJldHVybnMge0FycmF5fSBBIG5ldyBhcnJheSBvZiB2YWx1ZXMgcmV0dXJuZWQgYnkgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uLlxuXHQgKi9cblx0ZnVuY3Rpb24gbWFwKGFycmF5LCBmbikge1xuXHRcdHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG5cdFx0dmFyIHJlc3VsdCA9IFtdO1xuXHRcdHdoaWxlIChsZW5ndGgtLSkge1xuXHRcdFx0cmVzdWx0W2xlbmd0aF0gPSBmbihhcnJheVtsZW5ndGhdKTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdC8qKlxuXHQgKiBBIHNpbXBsZSBgQXJyYXkjbWFwYC1saWtlIHdyYXBwZXIgdG8gd29yayB3aXRoIGRvbWFpbiBuYW1lIHN0cmluZ3Mgb3IgZW1haWxcblx0ICogYWRkcmVzc2VzLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gZG9tYWluIFRoZSBkb21haW4gbmFtZSBvciBlbWFpbCBhZGRyZXNzLlxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdGhhdCBnZXRzIGNhbGxlZCBmb3IgZXZlcnlcblx0ICogY2hhcmFjdGVyLlxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IEEgbmV3IHN0cmluZyBvZiBjaGFyYWN0ZXJzIHJldHVybmVkIGJ5IHRoZSBjYWxsYmFja1xuXHQgKiBmdW5jdGlvbi5cblx0ICovXG5cdGZ1bmN0aW9uIG1hcERvbWFpbihzdHJpbmcsIGZuKSB7XG5cdFx0dmFyIHBhcnRzID0gc3RyaW5nLnNwbGl0KCdAJyk7XG5cdFx0dmFyIHJlc3VsdCA9ICcnO1xuXHRcdGlmIChwYXJ0cy5sZW5ndGggPiAxKSB7XG5cdFx0XHQvLyBJbiBlbWFpbCBhZGRyZXNzZXMsIG9ubHkgdGhlIGRvbWFpbiBuYW1lIHNob3VsZCBiZSBwdW55Y29kZWQuIExlYXZlXG5cdFx0XHQvLyB0aGUgbG9jYWwgcGFydCAoaS5lLiBldmVyeXRoaW5nIHVwIHRvIGBAYCkgaW50YWN0LlxuXHRcdFx0cmVzdWx0ID0gcGFydHNbMF0gKyAnQCc7XG5cdFx0XHRzdHJpbmcgPSBwYXJ0c1sxXTtcblx0XHR9XG5cdFx0Ly8gQXZvaWQgYHNwbGl0KHJlZ2V4KWAgZm9yIElFOCBjb21wYXRpYmlsaXR5LiBTZWUgIzE3LlxuXHRcdHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKHJlZ2V4U2VwYXJhdG9ycywgJ1xceDJFJyk7XG5cdFx0dmFyIGxhYmVscyA9IHN0cmluZy5zcGxpdCgnLicpO1xuXHRcdHZhciBlbmNvZGVkID0gbWFwKGxhYmVscywgZm4pLmpvaW4oJy4nKTtcblx0XHRyZXR1cm4gcmVzdWx0ICsgZW5jb2RlZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGFuIGFycmF5IGNvbnRhaW5pbmcgdGhlIG51bWVyaWMgY29kZSBwb2ludHMgb2YgZWFjaCBVbmljb2RlXG5cdCAqIGNoYXJhY3RlciBpbiB0aGUgc3RyaW5nLiBXaGlsZSBKYXZhU2NyaXB0IHVzZXMgVUNTLTIgaW50ZXJuYWxseSxcblx0ICogdGhpcyBmdW5jdGlvbiB3aWxsIGNvbnZlcnQgYSBwYWlyIG9mIHN1cnJvZ2F0ZSBoYWx2ZXMgKGVhY2ggb2Ygd2hpY2hcblx0ICogVUNTLTIgZXhwb3NlcyBhcyBzZXBhcmF0ZSBjaGFyYWN0ZXJzKSBpbnRvIGEgc2luZ2xlIGNvZGUgcG9pbnQsXG5cdCAqIG1hdGNoaW5nIFVURi0xNi5cblx0ICogQHNlZSBgcHVueWNvZGUudWNzMi5lbmNvZGVgXG5cdCAqIEBzZWUgPGh0dHBzOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9qYXZhc2NyaXB0LWVuY29kaW5nPlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGUudWNzMlxuXHQgKiBAbmFtZSBkZWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZyBUaGUgVW5pY29kZSBpbnB1dCBzdHJpbmcgKFVDUy0yKS5cblx0ICogQHJldHVybnMge0FycmF5fSBUaGUgbmV3IGFycmF5IG9mIGNvZGUgcG9pbnRzLlxuXHQgKi9cblx0ZnVuY3Rpb24gdWNzMmRlY29kZShzdHJpbmcpIHtcblx0XHR2YXIgb3V0cHV0ID0gW10sXG5cdFx0ICAgIGNvdW50ZXIgPSAwLFxuXHRcdCAgICBsZW5ndGggPSBzdHJpbmcubGVuZ3RoLFxuXHRcdCAgICB2YWx1ZSxcblx0XHQgICAgZXh0cmE7XG5cdFx0d2hpbGUgKGNvdW50ZXIgPCBsZW5ndGgpIHtcblx0XHRcdHZhbHVlID0gc3RyaW5nLmNoYXJDb2RlQXQoY291bnRlcisrKTtcblx0XHRcdGlmICh2YWx1ZSA+PSAweEQ4MDAgJiYgdmFsdWUgPD0gMHhEQkZGICYmIGNvdW50ZXIgPCBsZW5ndGgpIHtcblx0XHRcdFx0Ly8gaGlnaCBzdXJyb2dhdGUsIGFuZCB0aGVyZSBpcyBhIG5leHQgY2hhcmFjdGVyXG5cdFx0XHRcdGV4dHJhID0gc3RyaW5nLmNoYXJDb2RlQXQoY291bnRlcisrKTtcblx0XHRcdFx0aWYgKChleHRyYSAmIDB4RkMwMCkgPT0gMHhEQzAwKSB7IC8vIGxvdyBzdXJyb2dhdGVcblx0XHRcdFx0XHRvdXRwdXQucHVzaCgoKHZhbHVlICYgMHgzRkYpIDw8IDEwKSArIChleHRyYSAmIDB4M0ZGKSArIDB4MTAwMDApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIHVubWF0Y2hlZCBzdXJyb2dhdGU7IG9ubHkgYXBwZW5kIHRoaXMgY29kZSB1bml0LCBpbiBjYXNlIHRoZSBuZXh0XG5cdFx0XHRcdFx0Ly8gY29kZSB1bml0IGlzIHRoZSBoaWdoIHN1cnJvZ2F0ZSBvZiBhIHN1cnJvZ2F0ZSBwYWlyXG5cdFx0XHRcdFx0b3V0cHV0LnB1c2godmFsdWUpO1xuXHRcdFx0XHRcdGNvdW50ZXItLTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b3V0cHV0LnB1c2godmFsdWUpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gb3V0cHV0O1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBzdHJpbmcgYmFzZWQgb24gYW4gYXJyYXkgb2YgbnVtZXJpYyBjb2RlIHBvaW50cy5cblx0ICogQHNlZSBgcHVueWNvZGUudWNzMi5kZWNvZGVgXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZS51Y3MyXG5cdCAqIEBuYW1lIGVuY29kZVxuXHQgKiBAcGFyYW0ge0FycmF5fSBjb2RlUG9pbnRzIFRoZSBhcnJheSBvZiBudW1lcmljIGNvZGUgcG9pbnRzLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgbmV3IFVuaWNvZGUgc3RyaW5nIChVQ1MtMikuXG5cdCAqL1xuXHRmdW5jdGlvbiB1Y3MyZW5jb2RlKGFycmF5KSB7XG5cdFx0cmV0dXJuIG1hcChhcnJheSwgZnVuY3Rpb24odmFsdWUpIHtcblx0XHRcdHZhciBvdXRwdXQgPSAnJztcblx0XHRcdGlmICh2YWx1ZSA+IDB4RkZGRikge1xuXHRcdFx0XHR2YWx1ZSAtPSAweDEwMDAwO1xuXHRcdFx0XHRvdXRwdXQgKz0gc3RyaW5nRnJvbUNoYXJDb2RlKHZhbHVlID4+PiAxMCAmIDB4M0ZGIHwgMHhEODAwKTtcblx0XHRcdFx0dmFsdWUgPSAweERDMDAgfCB2YWx1ZSAmIDB4M0ZGO1xuXHRcdFx0fVxuXHRcdFx0b3V0cHV0ICs9IHN0cmluZ0Zyb21DaGFyQ29kZSh2YWx1ZSk7XG5cdFx0XHRyZXR1cm4gb3V0cHV0O1xuXHRcdH0pLmpvaW4oJycpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgYmFzaWMgY29kZSBwb2ludCBpbnRvIGEgZGlnaXQvaW50ZWdlci5cblx0ICogQHNlZSBgZGlnaXRUb0Jhc2ljKClgXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBjb2RlUG9pbnQgVGhlIGJhc2ljIG51bWVyaWMgY29kZSBwb2ludCB2YWx1ZS5cblx0ICogQHJldHVybnMge051bWJlcn0gVGhlIG51bWVyaWMgdmFsdWUgb2YgYSBiYXNpYyBjb2RlIHBvaW50IChmb3IgdXNlIGluXG5cdCAqIHJlcHJlc2VudGluZyBpbnRlZ2VycykgaW4gdGhlIHJhbmdlIGAwYCB0byBgYmFzZSAtIDFgLCBvciBgYmFzZWAgaWZcblx0ICogdGhlIGNvZGUgcG9pbnQgZG9lcyBub3QgcmVwcmVzZW50IGEgdmFsdWUuXG5cdCAqL1xuXHRmdW5jdGlvbiBiYXNpY1RvRGlnaXQoY29kZVBvaW50KSB7XG5cdFx0aWYgKGNvZGVQb2ludCAtIDQ4IDwgMTApIHtcblx0XHRcdHJldHVybiBjb2RlUG9pbnQgLSAyMjtcblx0XHR9XG5cdFx0aWYgKGNvZGVQb2ludCAtIDY1IDwgMjYpIHtcblx0XHRcdHJldHVybiBjb2RlUG9pbnQgLSA2NTtcblx0XHR9XG5cdFx0aWYgKGNvZGVQb2ludCAtIDk3IDwgMjYpIHtcblx0XHRcdHJldHVybiBjb2RlUG9pbnQgLSA5Nztcblx0XHR9XG5cdFx0cmV0dXJuIGJhc2U7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBkaWdpdC9pbnRlZ2VyIGludG8gYSBiYXNpYyBjb2RlIHBvaW50LlxuXHQgKiBAc2VlIGBiYXNpY1RvRGlnaXQoKWBcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGRpZ2l0IFRoZSBudW1lcmljIHZhbHVlIG9mIGEgYmFzaWMgY29kZSBwb2ludC5cblx0ICogQHJldHVybnMge051bWJlcn0gVGhlIGJhc2ljIGNvZGUgcG9pbnQgd2hvc2UgdmFsdWUgKHdoZW4gdXNlZCBmb3Jcblx0ICogcmVwcmVzZW50aW5nIGludGVnZXJzKSBpcyBgZGlnaXRgLCB3aGljaCBuZWVkcyB0byBiZSBpbiB0aGUgcmFuZ2Vcblx0ICogYDBgIHRvIGBiYXNlIC0gMWAuIElmIGBmbGFnYCBpcyBub24temVybywgdGhlIHVwcGVyY2FzZSBmb3JtIGlzXG5cdCAqIHVzZWQ7IGVsc2UsIHRoZSBsb3dlcmNhc2UgZm9ybSBpcyB1c2VkLiBUaGUgYmVoYXZpb3IgaXMgdW5kZWZpbmVkXG5cdCAqIGlmIGBmbGFnYCBpcyBub24temVybyBhbmQgYGRpZ2l0YCBoYXMgbm8gdXBwZXJjYXNlIGZvcm0uXG5cdCAqL1xuXHRmdW5jdGlvbiBkaWdpdFRvQmFzaWMoZGlnaXQsIGZsYWcpIHtcblx0XHQvLyAgMC4uMjUgbWFwIHRvIEFTQ0lJIGEuLnogb3IgQS4uWlxuXHRcdC8vIDI2Li4zNSBtYXAgdG8gQVNDSUkgMC4uOVxuXHRcdHJldHVybiBkaWdpdCArIDIyICsgNzUgKiAoZGlnaXQgPCAyNikgLSAoKGZsYWcgIT0gMCkgPDwgNSk7XG5cdH1cblxuXHQvKipcblx0ICogQmlhcyBhZGFwdGF0aW9uIGZ1bmN0aW9uIGFzIHBlciBzZWN0aW9uIDMuNCBvZiBSRkMgMzQ5Mi5cblx0ICogaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM0OTIjc2VjdGlvbi0zLjRcblx0ICogQHByaXZhdGVcblx0ICovXG5cdGZ1bmN0aW9uIGFkYXB0KGRlbHRhLCBudW1Qb2ludHMsIGZpcnN0VGltZSkge1xuXHRcdHZhciBrID0gMDtcblx0XHRkZWx0YSA9IGZpcnN0VGltZSA/IGZsb29yKGRlbHRhIC8gZGFtcCkgOiBkZWx0YSA+PiAxO1xuXHRcdGRlbHRhICs9IGZsb29yKGRlbHRhIC8gbnVtUG9pbnRzKTtcblx0XHRmb3IgKC8qIG5vIGluaXRpYWxpemF0aW9uICovOyBkZWx0YSA+IGJhc2VNaW51c1RNaW4gKiB0TWF4ID4+IDE7IGsgKz0gYmFzZSkge1xuXHRcdFx0ZGVsdGEgPSBmbG9vcihkZWx0YSAvIGJhc2VNaW51c1RNaW4pO1xuXHRcdH1cblx0XHRyZXR1cm4gZmxvb3IoayArIChiYXNlTWludXNUTWluICsgMSkgKiBkZWx0YSAvIChkZWx0YSArIHNrZXcpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIFB1bnljb2RlIHN0cmluZyBvZiBBU0NJSS1vbmx5IHN5bWJvbHMgdG8gYSBzdHJpbmcgb2YgVW5pY29kZVxuXHQgKiBzeW1ib2xzLlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGlucHV0IFRoZSBQdW55Y29kZSBzdHJpbmcgb2YgQVNDSUktb25seSBzeW1ib2xzLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgcmVzdWx0aW5nIHN0cmluZyBvZiBVbmljb2RlIHN5bWJvbHMuXG5cdCAqL1xuXHRmdW5jdGlvbiBkZWNvZGUoaW5wdXQpIHtcblx0XHQvLyBEb24ndCB1c2UgVUNTLTJcblx0XHR2YXIgb3V0cHV0ID0gW10sXG5cdFx0ICAgIGlucHV0TGVuZ3RoID0gaW5wdXQubGVuZ3RoLFxuXHRcdCAgICBvdXQsXG5cdFx0ICAgIGkgPSAwLFxuXHRcdCAgICBuID0gaW5pdGlhbE4sXG5cdFx0ICAgIGJpYXMgPSBpbml0aWFsQmlhcyxcblx0XHQgICAgYmFzaWMsXG5cdFx0ICAgIGosXG5cdFx0ICAgIGluZGV4LFxuXHRcdCAgICBvbGRpLFxuXHRcdCAgICB3LFxuXHRcdCAgICBrLFxuXHRcdCAgICBkaWdpdCxcblx0XHQgICAgdCxcblx0XHQgICAgLyoqIENhY2hlZCBjYWxjdWxhdGlvbiByZXN1bHRzICovXG5cdFx0ICAgIGJhc2VNaW51c1Q7XG5cblx0XHQvLyBIYW5kbGUgdGhlIGJhc2ljIGNvZGUgcG9pbnRzOiBsZXQgYGJhc2ljYCBiZSB0aGUgbnVtYmVyIG9mIGlucHV0IGNvZGVcblx0XHQvLyBwb2ludHMgYmVmb3JlIHRoZSBsYXN0IGRlbGltaXRlciwgb3IgYDBgIGlmIHRoZXJlIGlzIG5vbmUsIHRoZW4gY29weVxuXHRcdC8vIHRoZSBmaXJzdCBiYXNpYyBjb2RlIHBvaW50cyB0byB0aGUgb3V0cHV0LlxuXG5cdFx0YmFzaWMgPSBpbnB1dC5sYXN0SW5kZXhPZihkZWxpbWl0ZXIpO1xuXHRcdGlmIChiYXNpYyA8IDApIHtcblx0XHRcdGJhc2ljID0gMDtcblx0XHR9XG5cblx0XHRmb3IgKGogPSAwOyBqIDwgYmFzaWM7ICsraikge1xuXHRcdFx0Ly8gaWYgaXQncyBub3QgYSBiYXNpYyBjb2RlIHBvaW50XG5cdFx0XHRpZiAoaW5wdXQuY2hhckNvZGVBdChqKSA+PSAweDgwKSB7XG5cdFx0XHRcdGVycm9yKCdub3QtYmFzaWMnKTtcblx0XHRcdH1cblx0XHRcdG91dHB1dC5wdXNoKGlucHV0LmNoYXJDb2RlQXQoaikpO1xuXHRcdH1cblxuXHRcdC8vIE1haW4gZGVjb2RpbmcgbG9vcDogc3RhcnQganVzdCBhZnRlciB0aGUgbGFzdCBkZWxpbWl0ZXIgaWYgYW55IGJhc2ljIGNvZGVcblx0XHQvLyBwb2ludHMgd2VyZSBjb3BpZWQ7IHN0YXJ0IGF0IHRoZSBiZWdpbm5pbmcgb3RoZXJ3aXNlLlxuXG5cdFx0Zm9yIChpbmRleCA9IGJhc2ljID4gMCA/IGJhc2ljICsgMSA6IDA7IGluZGV4IDwgaW5wdXRMZW5ndGg7IC8qIG5vIGZpbmFsIGV4cHJlc3Npb24gKi8pIHtcblxuXHRcdFx0Ly8gYGluZGV4YCBpcyB0aGUgaW5kZXggb2YgdGhlIG5leHQgY2hhcmFjdGVyIHRvIGJlIGNvbnN1bWVkLlxuXHRcdFx0Ly8gRGVjb2RlIGEgZ2VuZXJhbGl6ZWQgdmFyaWFibGUtbGVuZ3RoIGludGVnZXIgaW50byBgZGVsdGFgLFxuXHRcdFx0Ly8gd2hpY2ggZ2V0cyBhZGRlZCB0byBgaWAuIFRoZSBvdmVyZmxvdyBjaGVja2luZyBpcyBlYXNpZXJcblx0XHRcdC8vIGlmIHdlIGluY3JlYXNlIGBpYCBhcyB3ZSBnbywgdGhlbiBzdWJ0cmFjdCBvZmYgaXRzIHN0YXJ0aW5nXG5cdFx0XHQvLyB2YWx1ZSBhdCB0aGUgZW5kIHRvIG9idGFpbiBgZGVsdGFgLlxuXHRcdFx0Zm9yIChvbGRpID0gaSwgdyA9IDEsIGsgPSBiYXNlOyAvKiBubyBjb25kaXRpb24gKi87IGsgKz0gYmFzZSkge1xuXG5cdFx0XHRcdGlmIChpbmRleCA+PSBpbnB1dExlbmd0aCkge1xuXHRcdFx0XHRcdGVycm9yKCdpbnZhbGlkLWlucHV0Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRkaWdpdCA9IGJhc2ljVG9EaWdpdChpbnB1dC5jaGFyQ29kZUF0KGluZGV4KyspKTtcblxuXHRcdFx0XHRpZiAoZGlnaXQgPj0gYmFzZSB8fCBkaWdpdCA+IGZsb29yKChtYXhJbnQgLSBpKSAvIHcpKSB7XG5cdFx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpICs9IGRpZ2l0ICogdztcblx0XHRcdFx0dCA9IGsgPD0gYmlhcyA/IHRNaW4gOiAoayA+PSBiaWFzICsgdE1heCA/IHRNYXggOiBrIC0gYmlhcyk7XG5cblx0XHRcdFx0aWYgKGRpZ2l0IDwgdCkge1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YmFzZU1pbnVzVCA9IGJhc2UgLSB0O1xuXHRcdFx0XHRpZiAodyA+IGZsb29yKG1heEludCAvIGJhc2VNaW51c1QpKSB7XG5cdFx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR3ICo9IGJhc2VNaW51c1Q7XG5cblx0XHRcdH1cblxuXHRcdFx0b3V0ID0gb3V0cHV0Lmxlbmd0aCArIDE7XG5cdFx0XHRiaWFzID0gYWRhcHQoaSAtIG9sZGksIG91dCwgb2xkaSA9PSAwKTtcblxuXHRcdFx0Ly8gYGlgIHdhcyBzdXBwb3NlZCB0byB3cmFwIGFyb3VuZCBmcm9tIGBvdXRgIHRvIGAwYCxcblx0XHRcdC8vIGluY3JlbWVudGluZyBgbmAgZWFjaCB0aW1lLCBzbyB3ZSdsbCBmaXggdGhhdCBub3c6XG5cdFx0XHRpZiAoZmxvb3IoaSAvIG91dCkgPiBtYXhJbnQgLSBuKSB7XG5cdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0fVxuXG5cdFx0XHRuICs9IGZsb29yKGkgLyBvdXQpO1xuXHRcdFx0aSAlPSBvdXQ7XG5cblx0XHRcdC8vIEluc2VydCBgbmAgYXQgcG9zaXRpb24gYGlgIG9mIHRoZSBvdXRwdXRcblx0XHRcdG91dHB1dC5zcGxpY2UoaSsrLCAwLCBuKTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB1Y3MyZW5jb2RlKG91dHB1dCk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBzdHJpbmcgb2YgVW5pY29kZSBzeW1ib2xzIChlLmcuIGEgZG9tYWluIG5hbWUgbGFiZWwpIHRvIGFcblx0ICogUHVueWNvZGUgc3RyaW5nIG9mIEFTQ0lJLW9ubHkgc3ltYm9scy5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dCBUaGUgc3RyaW5nIG9mIFVuaWNvZGUgc3ltYm9scy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIHJlc3VsdGluZyBQdW55Y29kZSBzdHJpbmcgb2YgQVNDSUktb25seSBzeW1ib2xzLlxuXHQgKi9cblx0ZnVuY3Rpb24gZW5jb2RlKGlucHV0KSB7XG5cdFx0dmFyIG4sXG5cdFx0ICAgIGRlbHRhLFxuXHRcdCAgICBoYW5kbGVkQ1BDb3VudCxcblx0XHQgICAgYmFzaWNMZW5ndGgsXG5cdFx0ICAgIGJpYXMsXG5cdFx0ICAgIGosXG5cdFx0ICAgIG0sXG5cdFx0ICAgIHEsXG5cdFx0ICAgIGssXG5cdFx0ICAgIHQsXG5cdFx0ICAgIGN1cnJlbnRWYWx1ZSxcblx0XHQgICAgb3V0cHV0ID0gW10sXG5cdFx0ICAgIC8qKiBgaW5wdXRMZW5ndGhgIHdpbGwgaG9sZCB0aGUgbnVtYmVyIG9mIGNvZGUgcG9pbnRzIGluIGBpbnB1dGAuICovXG5cdFx0ICAgIGlucHV0TGVuZ3RoLFxuXHRcdCAgICAvKiogQ2FjaGVkIGNhbGN1bGF0aW9uIHJlc3VsdHMgKi9cblx0XHQgICAgaGFuZGxlZENQQ291bnRQbHVzT25lLFxuXHRcdCAgICBiYXNlTWludXNULFxuXHRcdCAgICBxTWludXNUO1xuXG5cdFx0Ly8gQ29udmVydCB0aGUgaW5wdXQgaW4gVUNTLTIgdG8gVW5pY29kZVxuXHRcdGlucHV0ID0gdWNzMmRlY29kZShpbnB1dCk7XG5cblx0XHQvLyBDYWNoZSB0aGUgbGVuZ3RoXG5cdFx0aW5wdXRMZW5ndGggPSBpbnB1dC5sZW5ndGg7XG5cblx0XHQvLyBJbml0aWFsaXplIHRoZSBzdGF0ZVxuXHRcdG4gPSBpbml0aWFsTjtcblx0XHRkZWx0YSA9IDA7XG5cdFx0YmlhcyA9IGluaXRpYWxCaWFzO1xuXG5cdFx0Ly8gSGFuZGxlIHRoZSBiYXNpYyBjb2RlIHBvaW50c1xuXHRcdGZvciAoaiA9IDA7IGogPCBpbnB1dExlbmd0aDsgKytqKSB7XG5cdFx0XHRjdXJyZW50VmFsdWUgPSBpbnB1dFtqXTtcblx0XHRcdGlmIChjdXJyZW50VmFsdWUgPCAweDgwKSB7XG5cdFx0XHRcdG91dHB1dC5wdXNoKHN0cmluZ0Zyb21DaGFyQ29kZShjdXJyZW50VmFsdWUpKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRoYW5kbGVkQ1BDb3VudCA9IGJhc2ljTGVuZ3RoID0gb3V0cHV0Lmxlbmd0aDtcblxuXHRcdC8vIGBoYW5kbGVkQ1BDb3VudGAgaXMgdGhlIG51bWJlciBvZiBjb2RlIHBvaW50cyB0aGF0IGhhdmUgYmVlbiBoYW5kbGVkO1xuXHRcdC8vIGBiYXNpY0xlbmd0aGAgaXMgdGhlIG51bWJlciBvZiBiYXNpYyBjb2RlIHBvaW50cy5cblxuXHRcdC8vIEZpbmlzaCB0aGUgYmFzaWMgc3RyaW5nIC0gaWYgaXQgaXMgbm90IGVtcHR5IC0gd2l0aCBhIGRlbGltaXRlclxuXHRcdGlmIChiYXNpY0xlbmd0aCkge1xuXHRcdFx0b3V0cHV0LnB1c2goZGVsaW1pdGVyKTtcblx0XHR9XG5cblx0XHQvLyBNYWluIGVuY29kaW5nIGxvb3A6XG5cdFx0d2hpbGUgKGhhbmRsZWRDUENvdW50IDwgaW5wdXRMZW5ndGgpIHtcblxuXHRcdFx0Ly8gQWxsIG5vbi1iYXNpYyBjb2RlIHBvaW50cyA8IG4gaGF2ZSBiZWVuIGhhbmRsZWQgYWxyZWFkeS4gRmluZCB0aGUgbmV4dFxuXHRcdFx0Ly8gbGFyZ2VyIG9uZTpcblx0XHRcdGZvciAobSA9IG1heEludCwgaiA9IDA7IGogPCBpbnB1dExlbmd0aDsgKytqKSB7XG5cdFx0XHRcdGN1cnJlbnRWYWx1ZSA9IGlucHV0W2pdO1xuXHRcdFx0XHRpZiAoY3VycmVudFZhbHVlID49IG4gJiYgY3VycmVudFZhbHVlIDwgbSkge1xuXHRcdFx0XHRcdG0gPSBjdXJyZW50VmFsdWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gSW5jcmVhc2UgYGRlbHRhYCBlbm91Z2ggdG8gYWR2YW5jZSB0aGUgZGVjb2RlcidzIDxuLGk+IHN0YXRlIHRvIDxtLDA+LFxuXHRcdFx0Ly8gYnV0IGd1YXJkIGFnYWluc3Qgb3ZlcmZsb3dcblx0XHRcdGhhbmRsZWRDUENvdW50UGx1c09uZSA9IGhhbmRsZWRDUENvdW50ICsgMTtcblx0XHRcdGlmIChtIC0gbiA+IGZsb29yKChtYXhJbnQgLSBkZWx0YSkgLyBoYW5kbGVkQ1BDb3VudFBsdXNPbmUpKSB7XG5cdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0fVxuXG5cdFx0XHRkZWx0YSArPSAobSAtIG4pICogaGFuZGxlZENQQ291bnRQbHVzT25lO1xuXHRcdFx0biA9IG07XG5cblx0XHRcdGZvciAoaiA9IDA7IGogPCBpbnB1dExlbmd0aDsgKytqKSB7XG5cdFx0XHRcdGN1cnJlbnRWYWx1ZSA9IGlucHV0W2pdO1xuXG5cdFx0XHRcdGlmIChjdXJyZW50VmFsdWUgPCBuICYmICsrZGVsdGEgPiBtYXhJbnQpIHtcblx0XHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChjdXJyZW50VmFsdWUgPT0gbikge1xuXHRcdFx0XHRcdC8vIFJlcHJlc2VudCBkZWx0YSBhcyBhIGdlbmVyYWxpemVkIHZhcmlhYmxlLWxlbmd0aCBpbnRlZ2VyXG5cdFx0XHRcdFx0Zm9yIChxID0gZGVsdGEsIGsgPSBiYXNlOyAvKiBubyBjb25kaXRpb24gKi87IGsgKz0gYmFzZSkge1xuXHRcdFx0XHRcdFx0dCA9IGsgPD0gYmlhcyA/IHRNaW4gOiAoayA+PSBiaWFzICsgdE1heCA/IHRNYXggOiBrIC0gYmlhcyk7XG5cdFx0XHRcdFx0XHRpZiAocSA8IHQpIHtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRxTWludXNUID0gcSAtIHQ7XG5cdFx0XHRcdFx0XHRiYXNlTWludXNUID0gYmFzZSAtIHQ7XG5cdFx0XHRcdFx0XHRvdXRwdXQucHVzaChcblx0XHRcdFx0XHRcdFx0c3RyaW5nRnJvbUNoYXJDb2RlKGRpZ2l0VG9CYXNpYyh0ICsgcU1pbnVzVCAlIGJhc2VNaW51c1QsIDApKVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdHEgPSBmbG9vcihxTWludXNUIC8gYmFzZU1pbnVzVCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0b3V0cHV0LnB1c2goc3RyaW5nRnJvbUNoYXJDb2RlKGRpZ2l0VG9CYXNpYyhxLCAwKSkpO1xuXHRcdFx0XHRcdGJpYXMgPSBhZGFwdChkZWx0YSwgaGFuZGxlZENQQ291bnRQbHVzT25lLCBoYW5kbGVkQ1BDb3VudCA9PSBiYXNpY0xlbmd0aCk7XG5cdFx0XHRcdFx0ZGVsdGEgPSAwO1xuXHRcdFx0XHRcdCsraGFuZGxlZENQQ291bnQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0KytkZWx0YTtcblx0XHRcdCsrbjtcblxuXHRcdH1cblx0XHRyZXR1cm4gb3V0cHV0LmpvaW4oJycpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgUHVueWNvZGUgc3RyaW5nIHJlcHJlc2VudGluZyBhIGRvbWFpbiBuYW1lIG9yIGFuIGVtYWlsIGFkZHJlc3Ncblx0ICogdG8gVW5pY29kZS4gT25seSB0aGUgUHVueWNvZGVkIHBhcnRzIG9mIHRoZSBpbnB1dCB3aWxsIGJlIGNvbnZlcnRlZCwgaS5lLlxuXHQgKiBpdCBkb2Vzbid0IG1hdHRlciBpZiB5b3UgY2FsbCBpdCBvbiBhIHN0cmluZyB0aGF0IGhhcyBhbHJlYWR5IGJlZW5cblx0ICogY29udmVydGVkIHRvIFVuaWNvZGUuXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIFB1bnljb2RlZCBkb21haW4gbmFtZSBvciBlbWFpbCBhZGRyZXNzIHRvXG5cdCAqIGNvbnZlcnQgdG8gVW5pY29kZS5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIFVuaWNvZGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIGdpdmVuIFB1bnljb2RlXG5cdCAqIHN0cmluZy5cblx0ICovXG5cdGZ1bmN0aW9uIHRvVW5pY29kZShpbnB1dCkge1xuXHRcdHJldHVybiBtYXBEb21haW4oaW5wdXQsIGZ1bmN0aW9uKHN0cmluZykge1xuXHRcdFx0cmV0dXJuIHJlZ2V4UHVueWNvZGUudGVzdChzdHJpbmcpXG5cdFx0XHRcdD8gZGVjb2RlKHN0cmluZy5zbGljZSg0KS50b0xvd2VyQ2FzZSgpKVxuXHRcdFx0XHQ6IHN0cmluZztcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIFVuaWNvZGUgc3RyaW5nIHJlcHJlc2VudGluZyBhIGRvbWFpbiBuYW1lIG9yIGFuIGVtYWlsIGFkZHJlc3MgdG9cblx0ICogUHVueWNvZGUuIE9ubHkgdGhlIG5vbi1BU0NJSSBwYXJ0cyBvZiB0aGUgZG9tYWluIG5hbWUgd2lsbCBiZSBjb252ZXJ0ZWQsXG5cdCAqIGkuZS4gaXQgZG9lc24ndCBtYXR0ZXIgaWYgeW91IGNhbGwgaXQgd2l0aCBhIGRvbWFpbiB0aGF0J3MgYWxyZWFkeSBpblxuXHQgKiBBU0NJSS5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dCBUaGUgZG9tYWluIG5hbWUgb3IgZW1haWwgYWRkcmVzcyB0byBjb252ZXJ0LCBhcyBhXG5cdCAqIFVuaWNvZGUgc3RyaW5nLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgUHVueWNvZGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIGdpdmVuIGRvbWFpbiBuYW1lIG9yXG5cdCAqIGVtYWlsIGFkZHJlc3MuXG5cdCAqL1xuXHRmdW5jdGlvbiB0b0FTQ0lJKGlucHV0KSB7XG5cdFx0cmV0dXJuIG1hcERvbWFpbihpbnB1dCwgZnVuY3Rpb24oc3RyaW5nKSB7XG5cdFx0XHRyZXR1cm4gcmVnZXhOb25BU0NJSS50ZXN0KHN0cmluZylcblx0XHRcdFx0PyAneG4tLScgKyBlbmNvZGUoc3RyaW5nKVxuXHRcdFx0XHQ6IHN0cmluZztcblx0XHR9KTtcblx0fVxuXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cdC8qKiBEZWZpbmUgdGhlIHB1YmxpYyBBUEkgKi9cblx0cHVueWNvZGUgPSB7XG5cdFx0LyoqXG5cdFx0ICogQSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBjdXJyZW50IFB1bnljb2RlLmpzIHZlcnNpb24gbnVtYmVyLlxuXHRcdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHRcdCAqIEB0eXBlIFN0cmluZ1xuXHRcdCAqL1xuXHRcdCd2ZXJzaW9uJzogJzEuNC4xJyxcblx0XHQvKipcblx0XHQgKiBBbiBvYmplY3Qgb2YgbWV0aG9kcyB0byBjb252ZXJ0IGZyb20gSmF2YVNjcmlwdCdzIGludGVybmFsIGNoYXJhY3RlclxuXHRcdCAqIHJlcHJlc2VudGF0aW9uIChVQ1MtMikgdG8gVW5pY29kZSBjb2RlIHBvaW50cywgYW5kIGJhY2suXG5cdFx0ICogQHNlZSA8aHR0cHM6Ly9tYXRoaWFzYnluZW5zLmJlL25vdGVzL2phdmFzY3JpcHQtZW5jb2Rpbmc+XG5cdFx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdFx0ICogQHR5cGUgT2JqZWN0XG5cdFx0ICovXG5cdFx0J3VjczInOiB7XG5cdFx0XHQnZGVjb2RlJzogdWNzMmRlY29kZSxcblx0XHRcdCdlbmNvZGUnOiB1Y3MyZW5jb2RlXG5cdFx0fSxcblx0XHQnZGVjb2RlJzogZGVjb2RlLFxuXHRcdCdlbmNvZGUnOiBlbmNvZGUsXG5cdFx0J3RvQVNDSUknOiB0b0FTQ0lJLFxuXHRcdCd0b1VuaWNvZGUnOiB0b1VuaWNvZGVcblx0fTtcblxuXHQvKiogRXhwb3NlIGBwdW55Y29kZWAgKi9cblx0Ly8gU29tZSBBTUQgYnVpbGQgb3B0aW1pemVycywgbGlrZSByLmpzLCBjaGVjayBmb3Igc3BlY2lmaWMgY29uZGl0aW9uIHBhdHRlcm5zXG5cdC8vIGxpa2UgdGhlIGZvbGxvd2luZzpcblx0aWYgKFxuXHRcdHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJlxuXHRcdHR5cGVvZiBkZWZpbmUuYW1kID09ICdvYmplY3QnICYmXG5cdFx0ZGVmaW5lLmFtZFxuXHQpIHtcblx0XHRkZWZpbmUoJ3B1bnljb2RlJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gcHVueWNvZGU7XG5cdFx0fSk7XG5cdH0gZWxzZSBpZiAoZnJlZUV4cG9ydHMgJiYgZnJlZU1vZHVsZSkge1xuXHRcdGlmIChtb2R1bGUuZXhwb3J0cyA9PSBmcmVlRXhwb3J0cykge1xuXHRcdFx0Ly8gaW4gTm9kZS5qcywgaW8uanMsIG9yIFJpbmdvSlMgdjAuOC4wK1xuXHRcdFx0ZnJlZU1vZHVsZS5leHBvcnRzID0gcHVueWNvZGU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGluIE5hcndoYWwgb3IgUmluZ29KUyB2MC43LjAtXG5cdFx0XHRmb3IgKGtleSBpbiBwdW55Y29kZSkge1xuXHRcdFx0XHRwdW55Y29kZS5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIChmcmVlRXhwb3J0c1trZXldID0gcHVueWNvZGVba2V5XSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdC8vIGluIFJoaW5vIG9yIGEgd2ViIGJyb3dzZXJcblx0XHRyb290LnB1bnljb2RlID0gcHVueWNvZGU7XG5cdH1cblxufSh0aGlzKSk7XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuJ3VzZSBzdHJpY3QnO1xuXG4vLyBJZiBvYmouaGFzT3duUHJvcGVydHkgaGFzIGJlZW4gb3ZlcnJpZGRlbiwgdGhlbiBjYWxsaW5nXG4vLyBvYmouaGFzT3duUHJvcGVydHkocHJvcCkgd2lsbCBicmVhay5cbi8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2pveWVudC9ub2RlL2lzc3Vlcy8xNzA3XG5mdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHFzLCBzZXAsIGVxLCBvcHRpb25zKSB7XG4gIHNlcCA9IHNlcCB8fCAnJic7XG4gIGVxID0gZXEgfHwgJz0nO1xuICB2YXIgb2JqID0ge307XG5cbiAgaWYgKHR5cGVvZiBxcyAhPT0gJ3N0cmluZycgfHwgcXMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfVxuXG4gIHZhciByZWdleHAgPSAvXFwrL2c7XG4gIHFzID0gcXMuc3BsaXQoc2VwKTtcblxuICB2YXIgbWF4S2V5cyA9IDEwMDA7XG4gIGlmIChvcHRpb25zICYmIHR5cGVvZiBvcHRpb25zLm1heEtleXMgPT09ICdudW1iZXInKSB7XG4gICAgbWF4S2V5cyA9IG9wdGlvbnMubWF4S2V5cztcbiAgfVxuXG4gIHZhciBsZW4gPSBxcy5sZW5ndGg7XG4gIC8vIG1heEtleXMgPD0gMCBtZWFucyB0aGF0IHdlIHNob3VsZCBub3QgbGltaXQga2V5cyBjb3VudFxuICBpZiAobWF4S2V5cyA+IDAgJiYgbGVuID4gbWF4S2V5cykge1xuICAgIGxlbiA9IG1heEtleXM7XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKSB7XG4gICAgdmFyIHggPSBxc1tpXS5yZXBsYWNlKHJlZ2V4cCwgJyUyMCcpLFxuICAgICAgICBpZHggPSB4LmluZGV4T2YoZXEpLFxuICAgICAgICBrc3RyLCB2c3RyLCBrLCB2O1xuXG4gICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICBrc3RyID0geC5zdWJzdHIoMCwgaWR4KTtcbiAgICAgIHZzdHIgPSB4LnN1YnN0cihpZHggKyAxKTtcbiAgICB9IGVsc2Uge1xuICAgICAga3N0ciA9IHg7XG4gICAgICB2c3RyID0gJyc7XG4gICAgfVxuXG4gICAgayA9IGRlY29kZVVSSUNvbXBvbmVudChrc3RyKTtcbiAgICB2ID0gZGVjb2RlVVJJQ29tcG9uZW50KHZzdHIpO1xuXG4gICAgaWYgKCFoYXNPd25Qcm9wZXJ0eShvYmosIGspKSB7XG4gICAgICBvYmpba10gPSB2O1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheShvYmpba10pKSB7XG4gICAgICBvYmpba10ucHVzaCh2KTtcbiAgICB9IGVsc2Uge1xuICAgICAgb2JqW2tdID0gW29ialtrXSwgdl07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG9iajtcbn07XG5cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoeHMpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh4cykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHN0cmluZ2lmeVByaW1pdGl2ZSA9IGZ1bmN0aW9uKHYpIHtcbiAgc3dpdGNoICh0eXBlb2Ygdikge1xuICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICByZXR1cm4gdjtcblxuICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgcmV0dXJuIHYgPyAndHJ1ZScgOiAnZmFsc2UnO1xuXG4gICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgIHJldHVybiBpc0Zpbml0ZSh2KSA/IHYgOiAnJztcblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gJyc7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqLCBzZXAsIGVxLCBuYW1lKSB7XG4gIHNlcCA9IHNlcCB8fCAnJic7XG4gIGVxID0gZXEgfHwgJz0nO1xuICBpZiAob2JqID09PSBudWxsKSB7XG4gICAgb2JqID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBvYmogPT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIG1hcChvYmplY3RLZXlzKG9iaiksIGZ1bmN0aW9uKGspIHtcbiAgICAgIHZhciBrcyA9IGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUoaykpICsgZXE7XG4gICAgICBpZiAoaXNBcnJheShvYmpba10pKSB7XG4gICAgICAgIHJldHVybiBtYXAob2JqW2tdLCBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgcmV0dXJuIGtzICsgZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZSh2KSk7XG4gICAgICAgIH0pLmpvaW4oc2VwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBrcyArIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUob2JqW2tdKSk7XG4gICAgICB9XG4gICAgfSkuam9pbihzZXApO1xuXG4gIH1cblxuICBpZiAoIW5hbWUpIHJldHVybiAnJztcbiAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUobmFtZSkpICsgZXEgK1xuICAgICAgICAgZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZShvYmopKTtcbn07XG5cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoeHMpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh4cykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG5mdW5jdGlvbiBtYXAgKHhzLCBmKSB7XG4gIGlmICh4cy5tYXApIHJldHVybiB4cy5tYXAoZik7XG4gIHZhciByZXMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB4cy5sZW5ndGg7IGkrKykge1xuICAgIHJlcy5wdXNoKGYoeHNbaV0sIGkpKTtcbiAgfVxuICByZXR1cm4gcmVzO1xufVxuXG52YXIgb2JqZWN0S2V5cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgdmFyIHJlcyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHJlcy5wdXNoKGtleSk7XG4gIH1cbiAgcmV0dXJuIHJlcztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuZGVjb2RlID0gZXhwb3J0cy5wYXJzZSA9IHJlcXVpcmUoJy4vZGVjb2RlJyk7XG5leHBvcnRzLmVuY29kZSA9IGV4cG9ydHMuc3RyaW5naWZ5ID0gcmVxdWlyZSgnLi9lbmNvZGUnKTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBwdW55Y29kZSA9IHJlcXVpcmUoJ3B1bnljb2RlJyk7XG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5leHBvcnRzLnBhcnNlID0gdXJsUGFyc2U7XG5leHBvcnRzLnJlc29sdmUgPSB1cmxSZXNvbHZlO1xuZXhwb3J0cy5yZXNvbHZlT2JqZWN0ID0gdXJsUmVzb2x2ZU9iamVjdDtcbmV4cG9ydHMuZm9ybWF0ID0gdXJsRm9ybWF0O1xuXG5leHBvcnRzLlVybCA9IFVybDtcblxuZnVuY3Rpb24gVXJsKCkge1xuICB0aGlzLnByb3RvY29sID0gbnVsbDtcbiAgdGhpcy5zbGFzaGVzID0gbnVsbDtcbiAgdGhpcy5hdXRoID0gbnVsbDtcbiAgdGhpcy5ob3N0ID0gbnVsbDtcbiAgdGhpcy5wb3J0ID0gbnVsbDtcbiAgdGhpcy5ob3N0bmFtZSA9IG51bGw7XG4gIHRoaXMuaGFzaCA9IG51bGw7XG4gIHRoaXMuc2VhcmNoID0gbnVsbDtcbiAgdGhpcy5xdWVyeSA9IG51bGw7XG4gIHRoaXMucGF0aG5hbWUgPSBudWxsO1xuICB0aGlzLnBhdGggPSBudWxsO1xuICB0aGlzLmhyZWYgPSBudWxsO1xufVxuXG4vLyBSZWZlcmVuY2U6IFJGQyAzOTg2LCBSRkMgMTgwOCwgUkZDIDIzOTZcblxuLy8gZGVmaW5lIHRoZXNlIGhlcmUgc28gYXQgbGVhc3QgdGhleSBvbmx5IGhhdmUgdG8gYmVcbi8vIGNvbXBpbGVkIG9uY2Ugb24gdGhlIGZpcnN0IG1vZHVsZSBsb2FkLlxudmFyIHByb3RvY29sUGF0dGVybiA9IC9eKFthLXowLTkuKy1dKzopL2ksXG4gICAgcG9ydFBhdHRlcm4gPSAvOlswLTldKiQvLFxuXG4gICAgLy8gU3BlY2lhbCBjYXNlIGZvciBhIHNpbXBsZSBwYXRoIFVSTFxuICAgIHNpbXBsZVBhdGhQYXR0ZXJuID0gL14oXFwvXFwvPyg/IVxcLylbXlxcP1xcc10qKShcXD9bXlxcc10qKT8kLyxcblxuICAgIC8vIFJGQyAyMzk2OiBjaGFyYWN0ZXJzIHJlc2VydmVkIGZvciBkZWxpbWl0aW5nIFVSTHMuXG4gICAgLy8gV2UgYWN0dWFsbHkganVzdCBhdXRvLWVzY2FwZSB0aGVzZS5cbiAgICBkZWxpbXMgPSBbJzwnLCAnPicsICdcIicsICdgJywgJyAnLCAnXFxyJywgJ1xcbicsICdcXHQnXSxcblxuICAgIC8vIFJGQyAyMzk2OiBjaGFyYWN0ZXJzIG5vdCBhbGxvd2VkIGZvciB2YXJpb3VzIHJlYXNvbnMuXG4gICAgdW53aXNlID0gWyd7JywgJ30nLCAnfCcsICdcXFxcJywgJ14nLCAnYCddLmNvbmNhdChkZWxpbXMpLFxuXG4gICAgLy8gQWxsb3dlZCBieSBSRkNzLCBidXQgY2F1c2Ugb2YgWFNTIGF0dGFja3MuICBBbHdheXMgZXNjYXBlIHRoZXNlLlxuICAgIGF1dG9Fc2NhcGUgPSBbJ1xcJyddLmNvbmNhdCh1bndpc2UpLFxuICAgIC8vIENoYXJhY3RlcnMgdGhhdCBhcmUgbmV2ZXIgZXZlciBhbGxvd2VkIGluIGEgaG9zdG5hbWUuXG4gICAgLy8gTm90ZSB0aGF0IGFueSBpbnZhbGlkIGNoYXJzIGFyZSBhbHNvIGhhbmRsZWQsIGJ1dCB0aGVzZVxuICAgIC8vIGFyZSB0aGUgb25lcyB0aGF0IGFyZSAqZXhwZWN0ZWQqIHRvIGJlIHNlZW4sIHNvIHdlIGZhc3QtcGF0aFxuICAgIC8vIHRoZW0uXG4gICAgbm9uSG9zdENoYXJzID0gWyclJywgJy8nLCAnPycsICc7JywgJyMnXS5jb25jYXQoYXV0b0VzY2FwZSksXG4gICAgaG9zdEVuZGluZ0NoYXJzID0gWycvJywgJz8nLCAnIyddLFxuICAgIGhvc3RuYW1lTWF4TGVuID0gMjU1LFxuICAgIGhvc3RuYW1lUGFydFBhdHRlcm4gPSAvXlsrYS16MC05QS1aXy1dezAsNjN9JC8sXG4gICAgaG9zdG5hbWVQYXJ0U3RhcnQgPSAvXihbK2EtejAtOUEtWl8tXXswLDYzfSkoLiopJC8sXG4gICAgLy8gcHJvdG9jb2xzIHRoYXQgY2FuIGFsbG93IFwidW5zYWZlXCIgYW5kIFwidW53aXNlXCIgY2hhcnMuXG4gICAgdW5zYWZlUHJvdG9jb2wgPSB7XG4gICAgICAnamF2YXNjcmlwdCc6IHRydWUsXG4gICAgICAnamF2YXNjcmlwdDonOiB0cnVlXG4gICAgfSxcbiAgICAvLyBwcm90b2NvbHMgdGhhdCBuZXZlciBoYXZlIGEgaG9zdG5hbWUuXG4gICAgaG9zdGxlc3NQcm90b2NvbCA9IHtcbiAgICAgICdqYXZhc2NyaXB0JzogdHJ1ZSxcbiAgICAgICdqYXZhc2NyaXB0Oic6IHRydWVcbiAgICB9LFxuICAgIC8vIHByb3RvY29scyB0aGF0IGFsd2F5cyBjb250YWluIGEgLy8gYml0LlxuICAgIHNsYXNoZWRQcm90b2NvbCA9IHtcbiAgICAgICdodHRwJzogdHJ1ZSxcbiAgICAgICdodHRwcyc6IHRydWUsXG4gICAgICAnZnRwJzogdHJ1ZSxcbiAgICAgICdnb3BoZXInOiB0cnVlLFxuICAgICAgJ2ZpbGUnOiB0cnVlLFxuICAgICAgJ2h0dHA6JzogdHJ1ZSxcbiAgICAgICdodHRwczonOiB0cnVlLFxuICAgICAgJ2Z0cDonOiB0cnVlLFxuICAgICAgJ2dvcGhlcjonOiB0cnVlLFxuICAgICAgJ2ZpbGU6JzogdHJ1ZVxuICAgIH0sXG4gICAgcXVlcnlzdHJpbmcgPSByZXF1aXJlKCdxdWVyeXN0cmluZycpO1xuXG5mdW5jdGlvbiB1cmxQYXJzZSh1cmwsIHBhcnNlUXVlcnlTdHJpbmcsIHNsYXNoZXNEZW5vdGVIb3N0KSB7XG4gIGlmICh1cmwgJiYgdXRpbC5pc09iamVjdCh1cmwpICYmIHVybCBpbnN0YW5jZW9mIFVybCkgcmV0dXJuIHVybDtcblxuICB2YXIgdSA9IG5ldyBVcmw7XG4gIHUucGFyc2UodXJsLCBwYXJzZVF1ZXJ5U3RyaW5nLCBzbGFzaGVzRGVub3RlSG9zdCk7XG4gIHJldHVybiB1O1xufVxuXG5VcmwucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24odXJsLCBwYXJzZVF1ZXJ5U3RyaW5nLCBzbGFzaGVzRGVub3RlSG9zdCkge1xuICBpZiAoIXV0aWwuaXNTdHJpbmcodXJsKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQYXJhbWV0ZXIgJ3VybCcgbXVzdCBiZSBhIHN0cmluZywgbm90IFwiICsgdHlwZW9mIHVybCk7XG4gIH1cblxuICAvLyBDb3B5IGNocm9tZSwgSUUsIG9wZXJhIGJhY2tzbGFzaC1oYW5kbGluZyBiZWhhdmlvci5cbiAgLy8gQmFjayBzbGFzaGVzIGJlZm9yZSB0aGUgcXVlcnkgc3RyaW5nIGdldCBjb252ZXJ0ZWQgdG8gZm9yd2FyZCBzbGFzaGVzXG4gIC8vIFNlZTogaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTI1OTE2XG4gIHZhciBxdWVyeUluZGV4ID0gdXJsLmluZGV4T2YoJz8nKSxcbiAgICAgIHNwbGl0dGVyID1cbiAgICAgICAgICAocXVlcnlJbmRleCAhPT0gLTEgJiYgcXVlcnlJbmRleCA8IHVybC5pbmRleE9mKCcjJykpID8gJz8nIDogJyMnLFxuICAgICAgdVNwbGl0ID0gdXJsLnNwbGl0KHNwbGl0dGVyKSxcbiAgICAgIHNsYXNoUmVnZXggPSAvXFxcXC9nO1xuICB1U3BsaXRbMF0gPSB1U3BsaXRbMF0ucmVwbGFjZShzbGFzaFJlZ2V4LCAnLycpO1xuICB1cmwgPSB1U3BsaXQuam9pbihzcGxpdHRlcik7XG5cbiAgdmFyIHJlc3QgPSB1cmw7XG5cbiAgLy8gdHJpbSBiZWZvcmUgcHJvY2VlZGluZy5cbiAgLy8gVGhpcyBpcyB0byBzdXBwb3J0IHBhcnNlIHN0dWZmIGxpa2UgXCIgIGh0dHA6Ly9mb28uY29tICBcXG5cIlxuICByZXN0ID0gcmVzdC50cmltKCk7XG5cbiAgaWYgKCFzbGFzaGVzRGVub3RlSG9zdCAmJiB1cmwuc3BsaXQoJyMnKS5sZW5ndGggPT09IDEpIHtcbiAgICAvLyBUcnkgZmFzdCBwYXRoIHJlZ2V4cFxuICAgIHZhciBzaW1wbGVQYXRoID0gc2ltcGxlUGF0aFBhdHRlcm4uZXhlYyhyZXN0KTtcbiAgICBpZiAoc2ltcGxlUGF0aCkge1xuICAgICAgdGhpcy5wYXRoID0gcmVzdDtcbiAgICAgIHRoaXMuaHJlZiA9IHJlc3Q7XG4gICAgICB0aGlzLnBhdGhuYW1lID0gc2ltcGxlUGF0aFsxXTtcbiAgICAgIGlmIChzaW1wbGVQYXRoWzJdKSB7XG4gICAgICAgIHRoaXMuc2VhcmNoID0gc2ltcGxlUGF0aFsyXTtcbiAgICAgICAgaWYgKHBhcnNlUXVlcnlTdHJpbmcpIHtcbiAgICAgICAgICB0aGlzLnF1ZXJ5ID0gcXVlcnlzdHJpbmcucGFyc2UodGhpcy5zZWFyY2guc3Vic3RyKDEpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnF1ZXJ5ID0gdGhpcy5zZWFyY2guc3Vic3RyKDEpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHBhcnNlUXVlcnlTdHJpbmcpIHtcbiAgICAgICAgdGhpcy5zZWFyY2ggPSAnJztcbiAgICAgICAgdGhpcy5xdWVyeSA9IHt9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9XG5cbiAgdmFyIHByb3RvID0gcHJvdG9jb2xQYXR0ZXJuLmV4ZWMocmVzdCk7XG4gIGlmIChwcm90bykge1xuICAgIHByb3RvID0gcHJvdG9bMF07XG4gICAgdmFyIGxvd2VyUHJvdG8gPSBwcm90by50b0xvd2VyQ2FzZSgpO1xuICAgIHRoaXMucHJvdG9jb2wgPSBsb3dlclByb3RvO1xuICAgIHJlc3QgPSByZXN0LnN1YnN0cihwcm90by5sZW5ndGgpO1xuICB9XG5cbiAgLy8gZmlndXJlIG91dCBpZiBpdCdzIGdvdCBhIGhvc3RcbiAgLy8gdXNlckBzZXJ2ZXIgaXMgKmFsd2F5cyogaW50ZXJwcmV0ZWQgYXMgYSBob3N0bmFtZSwgYW5kIHVybFxuICAvLyByZXNvbHV0aW9uIHdpbGwgdHJlYXQgLy9mb28vYmFyIGFzIGhvc3Q9Zm9vLHBhdGg9YmFyIGJlY2F1c2UgdGhhdCdzXG4gIC8vIGhvdyB0aGUgYnJvd3NlciByZXNvbHZlcyByZWxhdGl2ZSBVUkxzLlxuICBpZiAoc2xhc2hlc0Rlbm90ZUhvc3QgfHwgcHJvdG8gfHwgcmVzdC5tYXRjaCgvXlxcL1xcL1teQFxcL10rQFteQFxcL10rLykpIHtcbiAgICB2YXIgc2xhc2hlcyA9IHJlc3Quc3Vic3RyKDAsIDIpID09PSAnLy8nO1xuICAgIGlmIChzbGFzaGVzICYmICEocHJvdG8gJiYgaG9zdGxlc3NQcm90b2NvbFtwcm90b10pKSB7XG4gICAgICByZXN0ID0gcmVzdC5zdWJzdHIoMik7XG4gICAgICB0aGlzLnNsYXNoZXMgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGlmICghaG9zdGxlc3NQcm90b2NvbFtwcm90b10gJiZcbiAgICAgIChzbGFzaGVzIHx8IChwcm90byAmJiAhc2xhc2hlZFByb3RvY29sW3Byb3RvXSkpKSB7XG5cbiAgICAvLyB0aGVyZSdzIGEgaG9zdG5hbWUuXG4gICAgLy8gdGhlIGZpcnN0IGluc3RhbmNlIG9mIC8sID8sIDssIG9yICMgZW5kcyB0aGUgaG9zdC5cbiAgICAvL1xuICAgIC8vIElmIHRoZXJlIGlzIGFuIEAgaW4gdGhlIGhvc3RuYW1lLCB0aGVuIG5vbi1ob3N0IGNoYXJzICphcmUqIGFsbG93ZWRcbiAgICAvLyB0byB0aGUgbGVmdCBvZiB0aGUgbGFzdCBAIHNpZ24sIHVubGVzcyBzb21lIGhvc3QtZW5kaW5nIGNoYXJhY3RlclxuICAgIC8vIGNvbWVzICpiZWZvcmUqIHRoZSBALXNpZ24uXG4gICAgLy8gVVJMcyBhcmUgb2Jub3hpb3VzLlxuICAgIC8vXG4gICAgLy8gZXg6XG4gICAgLy8gaHR0cDovL2FAYkBjLyA9PiB1c2VyOmFAYiBob3N0OmNcbiAgICAvLyBodHRwOi8vYUBiP0BjID0+IHVzZXI6YSBob3N0OmMgcGF0aDovP0BjXG5cbiAgICAvLyB2MC4xMiBUT0RPKGlzYWFjcyk6IFRoaXMgaXMgbm90IHF1aXRlIGhvdyBDaHJvbWUgZG9lcyB0aGluZ3MuXG4gICAgLy8gUmV2aWV3IG91ciB0ZXN0IGNhc2UgYWdhaW5zdCBicm93c2VycyBtb3JlIGNvbXByZWhlbnNpdmVseS5cblxuICAgIC8vIGZpbmQgdGhlIGZpcnN0IGluc3RhbmNlIG9mIGFueSBob3N0RW5kaW5nQ2hhcnNcbiAgICB2YXIgaG9zdEVuZCA9IC0xO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaG9zdEVuZGluZ0NoYXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaGVjID0gcmVzdC5pbmRleE9mKGhvc3RFbmRpbmdDaGFyc1tpXSk7XG4gICAgICBpZiAoaGVjICE9PSAtMSAmJiAoaG9zdEVuZCA9PT0gLTEgfHwgaGVjIDwgaG9zdEVuZCkpXG4gICAgICAgIGhvc3RFbmQgPSBoZWM7XG4gICAgfVxuXG4gICAgLy8gYXQgdGhpcyBwb2ludCwgZWl0aGVyIHdlIGhhdmUgYW4gZXhwbGljaXQgcG9pbnQgd2hlcmUgdGhlXG4gICAgLy8gYXV0aCBwb3J0aW9uIGNhbm5vdCBnbyBwYXN0LCBvciB0aGUgbGFzdCBAIGNoYXIgaXMgdGhlIGRlY2lkZXIuXG4gICAgdmFyIGF1dGgsIGF0U2lnbjtcbiAgICBpZiAoaG9zdEVuZCA9PT0gLTEpIHtcbiAgICAgIC8vIGF0U2lnbiBjYW4gYmUgYW55d2hlcmUuXG4gICAgICBhdFNpZ24gPSByZXN0Lmxhc3RJbmRleE9mKCdAJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGF0U2lnbiBtdXN0IGJlIGluIGF1dGggcG9ydGlvbi5cbiAgICAgIC8vIGh0dHA6Ly9hQGIvY0BkID0+IGhvc3Q6YiBhdXRoOmEgcGF0aDovY0BkXG4gICAgICBhdFNpZ24gPSByZXN0Lmxhc3RJbmRleE9mKCdAJywgaG9zdEVuZCk7XG4gICAgfVxuXG4gICAgLy8gTm93IHdlIGhhdmUgYSBwb3J0aW9uIHdoaWNoIGlzIGRlZmluaXRlbHkgdGhlIGF1dGguXG4gICAgLy8gUHVsbCB0aGF0IG9mZi5cbiAgICBpZiAoYXRTaWduICE9PSAtMSkge1xuICAgICAgYXV0aCA9IHJlc3Quc2xpY2UoMCwgYXRTaWduKTtcbiAgICAgIHJlc3QgPSByZXN0LnNsaWNlKGF0U2lnbiArIDEpO1xuICAgICAgdGhpcy5hdXRoID0gZGVjb2RlVVJJQ29tcG9uZW50KGF1dGgpO1xuICAgIH1cblxuICAgIC8vIHRoZSBob3N0IGlzIHRoZSByZW1haW5pbmcgdG8gdGhlIGxlZnQgb2YgdGhlIGZpcnN0IG5vbi1ob3N0IGNoYXJcbiAgICBob3N0RW5kID0gLTE7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub25Ib3N0Q2hhcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBoZWMgPSByZXN0LmluZGV4T2Yobm9uSG9zdENoYXJzW2ldKTtcbiAgICAgIGlmIChoZWMgIT09IC0xICYmIChob3N0RW5kID09PSAtMSB8fCBoZWMgPCBob3N0RW5kKSlcbiAgICAgICAgaG9zdEVuZCA9IGhlYztcbiAgICB9XG4gICAgLy8gaWYgd2Ugc3RpbGwgaGF2ZSBub3QgaGl0IGl0LCB0aGVuIHRoZSBlbnRpcmUgdGhpbmcgaXMgYSBob3N0LlxuICAgIGlmIChob3N0RW5kID09PSAtMSlcbiAgICAgIGhvc3RFbmQgPSByZXN0Lmxlbmd0aDtcblxuICAgIHRoaXMuaG9zdCA9IHJlc3Quc2xpY2UoMCwgaG9zdEVuZCk7XG4gICAgcmVzdCA9IHJlc3Quc2xpY2UoaG9zdEVuZCk7XG5cbiAgICAvLyBwdWxsIG91dCBwb3J0LlxuICAgIHRoaXMucGFyc2VIb3N0KCk7XG5cbiAgICAvLyB3ZSd2ZSBpbmRpY2F0ZWQgdGhhdCB0aGVyZSBpcyBhIGhvc3RuYW1lLFxuICAgIC8vIHNvIGV2ZW4gaWYgaXQncyBlbXB0eSwgaXQgaGFzIHRvIGJlIHByZXNlbnQuXG4gICAgdGhpcy5ob3N0bmFtZSA9IHRoaXMuaG9zdG5hbWUgfHwgJyc7XG5cbiAgICAvLyBpZiBob3N0bmFtZSBiZWdpbnMgd2l0aCBbIGFuZCBlbmRzIHdpdGggXVxuICAgIC8vIGFzc3VtZSB0aGF0IGl0J3MgYW4gSVB2NiBhZGRyZXNzLlxuICAgIHZhciBpcHY2SG9zdG5hbWUgPSB0aGlzLmhvc3RuYW1lWzBdID09PSAnWycgJiZcbiAgICAgICAgdGhpcy5ob3N0bmFtZVt0aGlzLmhvc3RuYW1lLmxlbmd0aCAtIDFdID09PSAnXSc7XG5cbiAgICAvLyB2YWxpZGF0ZSBhIGxpdHRsZS5cbiAgICBpZiAoIWlwdjZIb3N0bmFtZSkge1xuICAgICAgdmFyIGhvc3RwYXJ0cyA9IHRoaXMuaG9zdG5hbWUuc3BsaXQoL1xcLi8pO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBob3N0cGFydHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBwYXJ0ID0gaG9zdHBhcnRzW2ldO1xuICAgICAgICBpZiAoIXBhcnQpIGNvbnRpbnVlO1xuICAgICAgICBpZiAoIXBhcnQubWF0Y2goaG9zdG5hbWVQYXJ0UGF0dGVybikpIHtcbiAgICAgICAgICB2YXIgbmV3cGFydCA9ICcnO1xuICAgICAgICAgIGZvciAodmFyIGogPSAwLCBrID0gcGFydC5sZW5ndGg7IGogPCBrOyBqKyspIHtcbiAgICAgICAgICAgIGlmIChwYXJ0LmNoYXJDb2RlQXQoaikgPiAxMjcpIHtcbiAgICAgICAgICAgICAgLy8gd2UgcmVwbGFjZSBub24tQVNDSUkgY2hhciB3aXRoIGEgdGVtcG9yYXJ5IHBsYWNlaG9sZGVyXG4gICAgICAgICAgICAgIC8vIHdlIG5lZWQgdGhpcyB0byBtYWtlIHN1cmUgc2l6ZSBvZiBob3N0bmFtZSBpcyBub3RcbiAgICAgICAgICAgICAgLy8gYnJva2VuIGJ5IHJlcGxhY2luZyBub24tQVNDSUkgYnkgbm90aGluZ1xuICAgICAgICAgICAgICBuZXdwYXJ0ICs9ICd4JztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG5ld3BhcnQgKz0gcGFydFtqXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gd2UgdGVzdCBhZ2FpbiB3aXRoIEFTQ0lJIGNoYXIgb25seVxuICAgICAgICAgIGlmICghbmV3cGFydC5tYXRjaChob3N0bmFtZVBhcnRQYXR0ZXJuKSkge1xuICAgICAgICAgICAgdmFyIHZhbGlkUGFydHMgPSBob3N0cGFydHMuc2xpY2UoMCwgaSk7XG4gICAgICAgICAgICB2YXIgbm90SG9zdCA9IGhvc3RwYXJ0cy5zbGljZShpICsgMSk7XG4gICAgICAgICAgICB2YXIgYml0ID0gcGFydC5tYXRjaChob3N0bmFtZVBhcnRTdGFydCk7XG4gICAgICAgICAgICBpZiAoYml0KSB7XG4gICAgICAgICAgICAgIHZhbGlkUGFydHMucHVzaChiaXRbMV0pO1xuICAgICAgICAgICAgICBub3RIb3N0LnVuc2hpZnQoYml0WzJdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChub3RIb3N0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICByZXN0ID0gJy8nICsgbm90SG9zdC5qb2luKCcuJykgKyByZXN0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5ob3N0bmFtZSA9IHZhbGlkUGFydHMuam9pbignLicpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaG9zdG5hbWUubGVuZ3RoID4gaG9zdG5hbWVNYXhMZW4pIHtcbiAgICAgIHRoaXMuaG9zdG5hbWUgPSAnJztcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gaG9zdG5hbWVzIGFyZSBhbHdheXMgbG93ZXIgY2FzZS5cbiAgICAgIHRoaXMuaG9zdG5hbWUgPSB0aGlzLmhvc3RuYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuXG4gICAgaWYgKCFpcHY2SG9zdG5hbWUpIHtcbiAgICAgIC8vIElETkEgU3VwcG9ydDogUmV0dXJucyBhIHB1bnljb2RlZCByZXByZXNlbnRhdGlvbiBvZiBcImRvbWFpblwiLlxuICAgICAgLy8gSXQgb25seSBjb252ZXJ0cyBwYXJ0cyBvZiB0aGUgZG9tYWluIG5hbWUgdGhhdFxuICAgICAgLy8gaGF2ZSBub24tQVNDSUkgY2hhcmFjdGVycywgaS5lLiBpdCBkb2Vzbid0IG1hdHRlciBpZlxuICAgICAgLy8geW91IGNhbGwgaXQgd2l0aCBhIGRvbWFpbiB0aGF0IGFscmVhZHkgaXMgQVNDSUktb25seS5cbiAgICAgIHRoaXMuaG9zdG5hbWUgPSBwdW55Y29kZS50b0FTQ0lJKHRoaXMuaG9zdG5hbWUpO1xuICAgIH1cblxuICAgIHZhciBwID0gdGhpcy5wb3J0ID8gJzonICsgdGhpcy5wb3J0IDogJyc7XG4gICAgdmFyIGggPSB0aGlzLmhvc3RuYW1lIHx8ICcnO1xuICAgIHRoaXMuaG9zdCA9IGggKyBwO1xuICAgIHRoaXMuaHJlZiArPSB0aGlzLmhvc3Q7XG5cbiAgICAvLyBzdHJpcCBbIGFuZCBdIGZyb20gdGhlIGhvc3RuYW1lXG4gICAgLy8gdGhlIGhvc3QgZmllbGQgc3RpbGwgcmV0YWlucyB0aGVtLCB0aG91Z2hcbiAgICBpZiAoaXB2Nkhvc3RuYW1lKSB7XG4gICAgICB0aGlzLmhvc3RuYW1lID0gdGhpcy5ob3N0bmFtZS5zdWJzdHIoMSwgdGhpcy5ob3N0bmFtZS5sZW5ndGggLSAyKTtcbiAgICAgIGlmIChyZXN0WzBdICE9PSAnLycpIHtcbiAgICAgICAgcmVzdCA9ICcvJyArIHJlc3Q7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gbm93IHJlc3QgaXMgc2V0IHRvIHRoZSBwb3N0LWhvc3Qgc3R1ZmYuXG4gIC8vIGNob3Agb2ZmIGFueSBkZWxpbSBjaGFycy5cbiAgaWYgKCF1bnNhZmVQcm90b2NvbFtsb3dlclByb3RvXSkge1xuXG4gICAgLy8gRmlyc3QsIG1ha2UgMTAwJSBzdXJlIHRoYXQgYW55IFwiYXV0b0VzY2FwZVwiIGNoYXJzIGdldFxuICAgIC8vIGVzY2FwZWQsIGV2ZW4gaWYgZW5jb2RlVVJJQ29tcG9uZW50IGRvZXNuJ3QgdGhpbmsgdGhleVxuICAgIC8vIG5lZWQgdG8gYmUuXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBhdXRvRXNjYXBlLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgdmFyIGFlID0gYXV0b0VzY2FwZVtpXTtcbiAgICAgIGlmIChyZXN0LmluZGV4T2YoYWUpID09PSAtMSlcbiAgICAgICAgY29udGludWU7XG4gICAgICB2YXIgZXNjID0gZW5jb2RlVVJJQ29tcG9uZW50KGFlKTtcbiAgICAgIGlmIChlc2MgPT09IGFlKSB7XG4gICAgICAgIGVzYyA9IGVzY2FwZShhZSk7XG4gICAgICB9XG4gICAgICByZXN0ID0gcmVzdC5zcGxpdChhZSkuam9pbihlc2MpO1xuICAgIH1cbiAgfVxuXG5cbiAgLy8gY2hvcCBvZmYgZnJvbSB0aGUgdGFpbCBmaXJzdC5cbiAgdmFyIGhhc2ggPSByZXN0LmluZGV4T2YoJyMnKTtcbiAgaWYgKGhhc2ggIT09IC0xKSB7XG4gICAgLy8gZ290IGEgZnJhZ21lbnQgc3RyaW5nLlxuICAgIHRoaXMuaGFzaCA9IHJlc3Quc3Vic3RyKGhhc2gpO1xuICAgIHJlc3QgPSByZXN0LnNsaWNlKDAsIGhhc2gpO1xuICB9XG4gIHZhciBxbSA9IHJlc3QuaW5kZXhPZignPycpO1xuICBpZiAocW0gIT09IC0xKSB7XG4gICAgdGhpcy5zZWFyY2ggPSByZXN0LnN1YnN0cihxbSk7XG4gICAgdGhpcy5xdWVyeSA9IHJlc3Quc3Vic3RyKHFtICsgMSk7XG4gICAgaWYgKHBhcnNlUXVlcnlTdHJpbmcpIHtcbiAgICAgIHRoaXMucXVlcnkgPSBxdWVyeXN0cmluZy5wYXJzZSh0aGlzLnF1ZXJ5KTtcbiAgICB9XG4gICAgcmVzdCA9IHJlc3Quc2xpY2UoMCwgcW0pO1xuICB9IGVsc2UgaWYgKHBhcnNlUXVlcnlTdHJpbmcpIHtcbiAgICAvLyBubyBxdWVyeSBzdHJpbmcsIGJ1dCBwYXJzZVF1ZXJ5U3RyaW5nIHN0aWxsIHJlcXVlc3RlZFxuICAgIHRoaXMuc2VhcmNoID0gJyc7XG4gICAgdGhpcy5xdWVyeSA9IHt9O1xuICB9XG4gIGlmIChyZXN0KSB0aGlzLnBhdGhuYW1lID0gcmVzdDtcbiAgaWYgKHNsYXNoZWRQcm90b2NvbFtsb3dlclByb3RvXSAmJlxuICAgICAgdGhpcy5ob3N0bmFtZSAmJiAhdGhpcy5wYXRobmFtZSkge1xuICAgIHRoaXMucGF0aG5hbWUgPSAnLyc7XG4gIH1cblxuICAvL3RvIHN1cHBvcnQgaHR0cC5yZXF1ZXN0XG4gIGlmICh0aGlzLnBhdGhuYW1lIHx8IHRoaXMuc2VhcmNoKSB7XG4gICAgdmFyIHAgPSB0aGlzLnBhdGhuYW1lIHx8ICcnO1xuICAgIHZhciBzID0gdGhpcy5zZWFyY2ggfHwgJyc7XG4gICAgdGhpcy5wYXRoID0gcCArIHM7XG4gIH1cblxuICAvLyBmaW5hbGx5LCByZWNvbnN0cnVjdCB0aGUgaHJlZiBiYXNlZCBvbiB3aGF0IGhhcyBiZWVuIHZhbGlkYXRlZC5cbiAgdGhpcy5ocmVmID0gdGhpcy5mb3JtYXQoKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBmb3JtYXQgYSBwYXJzZWQgb2JqZWN0IGludG8gYSB1cmwgc3RyaW5nXG5mdW5jdGlvbiB1cmxGb3JtYXQob2JqKSB7XG4gIC8vIGVuc3VyZSBpdCdzIGFuIG9iamVjdCwgYW5kIG5vdCBhIHN0cmluZyB1cmwuXG4gIC8vIElmIGl0J3MgYW4gb2JqLCB0aGlzIGlzIGEgbm8tb3AuXG4gIC8vIHRoaXMgd2F5LCB5b3UgY2FuIGNhbGwgdXJsX2Zvcm1hdCgpIG9uIHN0cmluZ3NcbiAgLy8gdG8gY2xlYW4gdXAgcG90ZW50aWFsbHkgd29ua3kgdXJscy5cbiAgaWYgKHV0aWwuaXNTdHJpbmcob2JqKSkgb2JqID0gdXJsUGFyc2Uob2JqKTtcbiAgaWYgKCEob2JqIGluc3RhbmNlb2YgVXJsKSkgcmV0dXJuIFVybC5wcm90b3R5cGUuZm9ybWF0LmNhbGwob2JqKTtcbiAgcmV0dXJuIG9iai5mb3JtYXQoKTtcbn1cblxuVXJsLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGF1dGggPSB0aGlzLmF1dGggfHwgJyc7XG4gIGlmIChhdXRoKSB7XG4gICAgYXV0aCA9IGVuY29kZVVSSUNvbXBvbmVudChhdXRoKTtcbiAgICBhdXRoID0gYXV0aC5yZXBsYWNlKC8lM0EvaSwgJzonKTtcbiAgICBhdXRoICs9ICdAJztcbiAgfVxuXG4gIHZhciBwcm90b2NvbCA9IHRoaXMucHJvdG9jb2wgfHwgJycsXG4gICAgICBwYXRobmFtZSA9IHRoaXMucGF0aG5hbWUgfHwgJycsXG4gICAgICBoYXNoID0gdGhpcy5oYXNoIHx8ICcnLFxuICAgICAgaG9zdCA9IGZhbHNlLFxuICAgICAgcXVlcnkgPSAnJztcblxuICBpZiAodGhpcy5ob3N0KSB7XG4gICAgaG9zdCA9IGF1dGggKyB0aGlzLmhvc3Q7XG4gIH0gZWxzZSBpZiAodGhpcy5ob3N0bmFtZSkge1xuICAgIGhvc3QgPSBhdXRoICsgKHRoaXMuaG9zdG5hbWUuaW5kZXhPZignOicpID09PSAtMSA/XG4gICAgICAgIHRoaXMuaG9zdG5hbWUgOlxuICAgICAgICAnWycgKyB0aGlzLmhvc3RuYW1lICsgJ10nKTtcbiAgICBpZiAodGhpcy5wb3J0KSB7XG4gICAgICBob3N0ICs9ICc6JyArIHRoaXMucG9ydDtcbiAgICB9XG4gIH1cblxuICBpZiAodGhpcy5xdWVyeSAmJlxuICAgICAgdXRpbC5pc09iamVjdCh0aGlzLnF1ZXJ5KSAmJlxuICAgICAgT2JqZWN0LmtleXModGhpcy5xdWVyeSkubGVuZ3RoKSB7XG4gICAgcXVlcnkgPSBxdWVyeXN0cmluZy5zdHJpbmdpZnkodGhpcy5xdWVyeSk7XG4gIH1cblxuICB2YXIgc2VhcmNoID0gdGhpcy5zZWFyY2ggfHwgKHF1ZXJ5ICYmICgnPycgKyBxdWVyeSkpIHx8ICcnO1xuXG4gIGlmIChwcm90b2NvbCAmJiBwcm90b2NvbC5zdWJzdHIoLTEpICE9PSAnOicpIHByb3RvY29sICs9ICc6JztcblxuICAvLyBvbmx5IHRoZSBzbGFzaGVkUHJvdG9jb2xzIGdldCB0aGUgLy8uICBOb3QgbWFpbHRvOiwgeG1wcDosIGV0Yy5cbiAgLy8gdW5sZXNzIHRoZXkgaGFkIHRoZW0gdG8gYmVnaW4gd2l0aC5cbiAgaWYgKHRoaXMuc2xhc2hlcyB8fFxuICAgICAgKCFwcm90b2NvbCB8fCBzbGFzaGVkUHJvdG9jb2xbcHJvdG9jb2xdKSAmJiBob3N0ICE9PSBmYWxzZSkge1xuICAgIGhvc3QgPSAnLy8nICsgKGhvc3QgfHwgJycpO1xuICAgIGlmIChwYXRobmFtZSAmJiBwYXRobmFtZS5jaGFyQXQoMCkgIT09ICcvJykgcGF0aG5hbWUgPSAnLycgKyBwYXRobmFtZTtcbiAgfSBlbHNlIGlmICghaG9zdCkge1xuICAgIGhvc3QgPSAnJztcbiAgfVxuXG4gIGlmIChoYXNoICYmIGhhc2guY2hhckF0KDApICE9PSAnIycpIGhhc2ggPSAnIycgKyBoYXNoO1xuICBpZiAoc2VhcmNoICYmIHNlYXJjaC5jaGFyQXQoMCkgIT09ICc/Jykgc2VhcmNoID0gJz8nICsgc2VhcmNoO1xuXG4gIHBhdGhuYW1lID0gcGF0aG5hbWUucmVwbGFjZSgvWz8jXS9nLCBmdW5jdGlvbihtYXRjaCkge1xuICAgIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQobWF0Y2gpO1xuICB9KTtcbiAgc2VhcmNoID0gc2VhcmNoLnJlcGxhY2UoJyMnLCAnJTIzJyk7XG5cbiAgcmV0dXJuIHByb3RvY29sICsgaG9zdCArIHBhdGhuYW1lICsgc2VhcmNoICsgaGFzaDtcbn07XG5cbmZ1bmN0aW9uIHVybFJlc29sdmUoc291cmNlLCByZWxhdGl2ZSkge1xuICByZXR1cm4gdXJsUGFyc2Uoc291cmNlLCBmYWxzZSwgdHJ1ZSkucmVzb2x2ZShyZWxhdGl2ZSk7XG59XG5cblVybC5wcm90b3R5cGUucmVzb2x2ZSA9IGZ1bmN0aW9uKHJlbGF0aXZlKSB7XG4gIHJldHVybiB0aGlzLnJlc29sdmVPYmplY3QodXJsUGFyc2UocmVsYXRpdmUsIGZhbHNlLCB0cnVlKSkuZm9ybWF0KCk7XG59O1xuXG5mdW5jdGlvbiB1cmxSZXNvbHZlT2JqZWN0KHNvdXJjZSwgcmVsYXRpdmUpIHtcbiAgaWYgKCFzb3VyY2UpIHJldHVybiByZWxhdGl2ZTtcbiAgcmV0dXJuIHVybFBhcnNlKHNvdXJjZSwgZmFsc2UsIHRydWUpLnJlc29sdmVPYmplY3QocmVsYXRpdmUpO1xufVxuXG5VcmwucHJvdG90eXBlLnJlc29sdmVPYmplY3QgPSBmdW5jdGlvbihyZWxhdGl2ZSkge1xuICBpZiAodXRpbC5pc1N0cmluZyhyZWxhdGl2ZSkpIHtcbiAgICB2YXIgcmVsID0gbmV3IFVybCgpO1xuICAgIHJlbC5wYXJzZShyZWxhdGl2ZSwgZmFsc2UsIHRydWUpO1xuICAgIHJlbGF0aXZlID0gcmVsO1xuICB9XG5cbiAgdmFyIHJlc3VsdCA9IG5ldyBVcmwoKTtcbiAgdmFyIHRrZXlzID0gT2JqZWN0LmtleXModGhpcyk7XG4gIGZvciAodmFyIHRrID0gMDsgdGsgPCB0a2V5cy5sZW5ndGg7IHRrKyspIHtcbiAgICB2YXIgdGtleSA9IHRrZXlzW3RrXTtcbiAgICByZXN1bHRbdGtleV0gPSB0aGlzW3RrZXldO1xuICB9XG5cbiAgLy8gaGFzaCBpcyBhbHdheXMgb3ZlcnJpZGRlbiwgbm8gbWF0dGVyIHdoYXQuXG4gIC8vIGV2ZW4gaHJlZj1cIlwiIHdpbGwgcmVtb3ZlIGl0LlxuICByZXN1bHQuaGFzaCA9IHJlbGF0aXZlLmhhc2g7XG5cbiAgLy8gaWYgdGhlIHJlbGF0aXZlIHVybCBpcyBlbXB0eSwgdGhlbiB0aGVyZSdzIG5vdGhpbmcgbGVmdCB0byBkbyBoZXJlLlxuICBpZiAocmVsYXRpdmUuaHJlZiA9PT0gJycpIHtcbiAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLy8gaHJlZnMgbGlrZSAvL2Zvby9iYXIgYWx3YXlzIGN1dCB0byB0aGUgcHJvdG9jb2wuXG4gIGlmIChyZWxhdGl2ZS5zbGFzaGVzICYmICFyZWxhdGl2ZS5wcm90b2NvbCkge1xuICAgIC8vIHRha2UgZXZlcnl0aGluZyBleGNlcHQgdGhlIHByb3RvY29sIGZyb20gcmVsYXRpdmVcbiAgICB2YXIgcmtleXMgPSBPYmplY3Qua2V5cyhyZWxhdGl2ZSk7XG4gICAgZm9yICh2YXIgcmsgPSAwOyByayA8IHJrZXlzLmxlbmd0aDsgcmsrKykge1xuICAgICAgdmFyIHJrZXkgPSBya2V5c1tya107XG4gICAgICBpZiAocmtleSAhPT0gJ3Byb3RvY29sJylcbiAgICAgICAgcmVzdWx0W3JrZXldID0gcmVsYXRpdmVbcmtleV07XG4gICAgfVxuXG4gICAgLy91cmxQYXJzZSBhcHBlbmRzIHRyYWlsaW5nIC8gdG8gdXJscyBsaWtlIGh0dHA6Ly93d3cuZXhhbXBsZS5jb21cbiAgICBpZiAoc2xhc2hlZFByb3RvY29sW3Jlc3VsdC5wcm90b2NvbF0gJiZcbiAgICAgICAgcmVzdWx0Lmhvc3RuYW1lICYmICFyZXN1bHQucGF0aG5hbWUpIHtcbiAgICAgIHJlc3VsdC5wYXRoID0gcmVzdWx0LnBhdGhuYW1lID0gJy8nO1xuICAgIH1cblxuICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBpZiAocmVsYXRpdmUucHJvdG9jb2wgJiYgcmVsYXRpdmUucHJvdG9jb2wgIT09IHJlc3VsdC5wcm90b2NvbCkge1xuICAgIC8vIGlmIGl0J3MgYSBrbm93biB1cmwgcHJvdG9jb2wsIHRoZW4gY2hhbmdpbmdcbiAgICAvLyB0aGUgcHJvdG9jb2wgZG9lcyB3ZWlyZCB0aGluZ3NcbiAgICAvLyBmaXJzdCwgaWYgaXQncyBub3QgZmlsZTosIHRoZW4gd2UgTVVTVCBoYXZlIGEgaG9zdCxcbiAgICAvLyBhbmQgaWYgdGhlcmUgd2FzIGEgcGF0aFxuICAgIC8vIHRvIGJlZ2luIHdpdGgsIHRoZW4gd2UgTVVTVCBoYXZlIGEgcGF0aC5cbiAgICAvLyBpZiBpdCBpcyBmaWxlOiwgdGhlbiB0aGUgaG9zdCBpcyBkcm9wcGVkLFxuICAgIC8vIGJlY2F1c2UgdGhhdCdzIGtub3duIHRvIGJlIGhvc3RsZXNzLlxuICAgIC8vIGFueXRoaW5nIGVsc2UgaXMgYXNzdW1lZCB0byBiZSBhYnNvbHV0ZS5cbiAgICBpZiAoIXNsYXNoZWRQcm90b2NvbFtyZWxhdGl2ZS5wcm90b2NvbF0pIHtcbiAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMocmVsYXRpdmUpO1xuICAgICAgZm9yICh2YXIgdiA9IDA7IHYgPCBrZXlzLmxlbmd0aDsgdisrKSB7XG4gICAgICAgIHZhciBrID0ga2V5c1t2XTtcbiAgICAgICAgcmVzdWx0W2tdID0gcmVsYXRpdmVba107XG4gICAgICB9XG4gICAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgcmVzdWx0LnByb3RvY29sID0gcmVsYXRpdmUucHJvdG9jb2w7XG4gICAgaWYgKCFyZWxhdGl2ZS5ob3N0ICYmICFob3N0bGVzc1Byb3RvY29sW3JlbGF0aXZlLnByb3RvY29sXSkge1xuICAgICAgdmFyIHJlbFBhdGggPSAocmVsYXRpdmUucGF0aG5hbWUgfHwgJycpLnNwbGl0KCcvJyk7XG4gICAgICB3aGlsZSAocmVsUGF0aC5sZW5ndGggJiYgIShyZWxhdGl2ZS5ob3N0ID0gcmVsUGF0aC5zaGlmdCgpKSk7XG4gICAgICBpZiAoIXJlbGF0aXZlLmhvc3QpIHJlbGF0aXZlLmhvc3QgPSAnJztcbiAgICAgIGlmICghcmVsYXRpdmUuaG9zdG5hbWUpIHJlbGF0aXZlLmhvc3RuYW1lID0gJyc7XG4gICAgICBpZiAocmVsUGF0aFswXSAhPT0gJycpIHJlbFBhdGgudW5zaGlmdCgnJyk7XG4gICAgICBpZiAocmVsUGF0aC5sZW5ndGggPCAyKSByZWxQYXRoLnVuc2hpZnQoJycpO1xuICAgICAgcmVzdWx0LnBhdGhuYW1lID0gcmVsUGF0aC5qb2luKCcvJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdC5wYXRobmFtZSA9IHJlbGF0aXZlLnBhdGhuYW1lO1xuICAgIH1cbiAgICByZXN1bHQuc2VhcmNoID0gcmVsYXRpdmUuc2VhcmNoO1xuICAgIHJlc3VsdC5xdWVyeSA9IHJlbGF0aXZlLnF1ZXJ5O1xuICAgIHJlc3VsdC5ob3N0ID0gcmVsYXRpdmUuaG9zdCB8fCAnJztcbiAgICByZXN1bHQuYXV0aCA9IHJlbGF0aXZlLmF1dGg7XG4gICAgcmVzdWx0Lmhvc3RuYW1lID0gcmVsYXRpdmUuaG9zdG5hbWUgfHwgcmVsYXRpdmUuaG9zdDtcbiAgICByZXN1bHQucG9ydCA9IHJlbGF0aXZlLnBvcnQ7XG4gICAgLy8gdG8gc3VwcG9ydCBodHRwLnJlcXVlc3RcbiAgICBpZiAocmVzdWx0LnBhdGhuYW1lIHx8IHJlc3VsdC5zZWFyY2gpIHtcbiAgICAgIHZhciBwID0gcmVzdWx0LnBhdGhuYW1lIHx8ICcnO1xuICAgICAgdmFyIHMgPSByZXN1bHQuc2VhcmNoIHx8ICcnO1xuICAgICAgcmVzdWx0LnBhdGggPSBwICsgcztcbiAgICB9XG4gICAgcmVzdWx0LnNsYXNoZXMgPSByZXN1bHQuc2xhc2hlcyB8fCByZWxhdGl2ZS5zbGFzaGVzO1xuICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICB2YXIgaXNTb3VyY2VBYnMgPSAocmVzdWx0LnBhdGhuYW1lICYmIHJlc3VsdC5wYXRobmFtZS5jaGFyQXQoMCkgPT09ICcvJyksXG4gICAgICBpc1JlbEFicyA9IChcbiAgICAgICAgICByZWxhdGl2ZS5ob3N0IHx8XG4gICAgICAgICAgcmVsYXRpdmUucGF0aG5hbWUgJiYgcmVsYXRpdmUucGF0aG5hbWUuY2hhckF0KDApID09PSAnLydcbiAgICAgICksXG4gICAgICBtdXN0RW5kQWJzID0gKGlzUmVsQWJzIHx8IGlzU291cmNlQWJzIHx8XG4gICAgICAgICAgICAgICAgICAgIChyZXN1bHQuaG9zdCAmJiByZWxhdGl2ZS5wYXRobmFtZSkpLFxuICAgICAgcmVtb3ZlQWxsRG90cyA9IG11c3RFbmRBYnMsXG4gICAgICBzcmNQYXRoID0gcmVzdWx0LnBhdGhuYW1lICYmIHJlc3VsdC5wYXRobmFtZS5zcGxpdCgnLycpIHx8IFtdLFxuICAgICAgcmVsUGF0aCA9IHJlbGF0aXZlLnBhdGhuYW1lICYmIHJlbGF0aXZlLnBhdGhuYW1lLnNwbGl0KCcvJykgfHwgW10sXG4gICAgICBwc3ljaG90aWMgPSByZXN1bHQucHJvdG9jb2wgJiYgIXNsYXNoZWRQcm90b2NvbFtyZXN1bHQucHJvdG9jb2xdO1xuXG4gIC8vIGlmIHRoZSB1cmwgaXMgYSBub24tc2xhc2hlZCB1cmwsIHRoZW4gcmVsYXRpdmVcbiAgLy8gbGlua3MgbGlrZSAuLi8uLiBzaG91bGQgYmUgYWJsZVxuICAvLyB0byBjcmF3bCB1cCB0byB0aGUgaG9zdG5hbWUsIGFzIHdlbGwuICBUaGlzIGlzIHN0cmFuZ2UuXG4gIC8vIHJlc3VsdC5wcm90b2NvbCBoYXMgYWxyZWFkeSBiZWVuIHNldCBieSBub3cuXG4gIC8vIExhdGVyIG9uLCBwdXQgdGhlIGZpcnN0IHBhdGggcGFydCBpbnRvIHRoZSBob3N0IGZpZWxkLlxuICBpZiAocHN5Y2hvdGljKSB7XG4gICAgcmVzdWx0Lmhvc3RuYW1lID0gJyc7XG4gICAgcmVzdWx0LnBvcnQgPSBudWxsO1xuICAgIGlmIChyZXN1bHQuaG9zdCkge1xuICAgICAgaWYgKHNyY1BhdGhbMF0gPT09ICcnKSBzcmNQYXRoWzBdID0gcmVzdWx0Lmhvc3Q7XG4gICAgICBlbHNlIHNyY1BhdGgudW5zaGlmdChyZXN1bHQuaG9zdCk7XG4gICAgfVxuICAgIHJlc3VsdC5ob3N0ID0gJyc7XG4gICAgaWYgKHJlbGF0aXZlLnByb3RvY29sKSB7XG4gICAgICByZWxhdGl2ZS5ob3N0bmFtZSA9IG51bGw7XG4gICAgICByZWxhdGl2ZS5wb3J0ID0gbnVsbDtcbiAgICAgIGlmIChyZWxhdGl2ZS5ob3N0KSB7XG4gICAgICAgIGlmIChyZWxQYXRoWzBdID09PSAnJykgcmVsUGF0aFswXSA9IHJlbGF0aXZlLmhvc3Q7XG4gICAgICAgIGVsc2UgcmVsUGF0aC51bnNoaWZ0KHJlbGF0aXZlLmhvc3QpO1xuICAgICAgfVxuICAgICAgcmVsYXRpdmUuaG9zdCA9IG51bGw7XG4gICAgfVxuICAgIG11c3RFbmRBYnMgPSBtdXN0RW5kQWJzICYmIChyZWxQYXRoWzBdID09PSAnJyB8fCBzcmNQYXRoWzBdID09PSAnJyk7XG4gIH1cblxuICBpZiAoaXNSZWxBYnMpIHtcbiAgICAvLyBpdCdzIGFic29sdXRlLlxuICAgIHJlc3VsdC5ob3N0ID0gKHJlbGF0aXZlLmhvc3QgfHwgcmVsYXRpdmUuaG9zdCA9PT0gJycpID9cbiAgICAgICAgICAgICAgICAgIHJlbGF0aXZlLmhvc3QgOiByZXN1bHQuaG9zdDtcbiAgICByZXN1bHQuaG9zdG5hbWUgPSAocmVsYXRpdmUuaG9zdG5hbWUgfHwgcmVsYXRpdmUuaG9zdG5hbWUgPT09ICcnKSA/XG4gICAgICAgICAgICAgICAgICAgICAgcmVsYXRpdmUuaG9zdG5hbWUgOiByZXN1bHQuaG9zdG5hbWU7XG4gICAgcmVzdWx0LnNlYXJjaCA9IHJlbGF0aXZlLnNlYXJjaDtcbiAgICByZXN1bHQucXVlcnkgPSByZWxhdGl2ZS5xdWVyeTtcbiAgICBzcmNQYXRoID0gcmVsUGF0aDtcbiAgICAvLyBmYWxsIHRocm91Z2ggdG8gdGhlIGRvdC1oYW5kbGluZyBiZWxvdy5cbiAgfSBlbHNlIGlmIChyZWxQYXRoLmxlbmd0aCkge1xuICAgIC8vIGl0J3MgcmVsYXRpdmVcbiAgICAvLyB0aHJvdyBhd2F5IHRoZSBleGlzdGluZyBmaWxlLCBhbmQgdGFrZSB0aGUgbmV3IHBhdGggaW5zdGVhZC5cbiAgICBpZiAoIXNyY1BhdGgpIHNyY1BhdGggPSBbXTtcbiAgICBzcmNQYXRoLnBvcCgpO1xuICAgIHNyY1BhdGggPSBzcmNQYXRoLmNvbmNhdChyZWxQYXRoKTtcbiAgICByZXN1bHQuc2VhcmNoID0gcmVsYXRpdmUuc2VhcmNoO1xuICAgIHJlc3VsdC5xdWVyeSA9IHJlbGF0aXZlLnF1ZXJ5O1xuICB9IGVsc2UgaWYgKCF1dGlsLmlzTnVsbE9yVW5kZWZpbmVkKHJlbGF0aXZlLnNlYXJjaCkpIHtcbiAgICAvLyBqdXN0IHB1bGwgb3V0IHRoZSBzZWFyY2guXG4gICAgLy8gbGlrZSBocmVmPSc/Zm9vJy5cbiAgICAvLyBQdXQgdGhpcyBhZnRlciB0aGUgb3RoZXIgdHdvIGNhc2VzIGJlY2F1c2UgaXQgc2ltcGxpZmllcyB0aGUgYm9vbGVhbnNcbiAgICBpZiAocHN5Y2hvdGljKSB7XG4gICAgICByZXN1bHQuaG9zdG5hbWUgPSByZXN1bHQuaG9zdCA9IHNyY1BhdGguc2hpZnQoKTtcbiAgICAgIC8vb2NjYXRpb25hbHkgdGhlIGF1dGggY2FuIGdldCBzdHVjayBvbmx5IGluIGhvc3RcbiAgICAgIC8vdGhpcyBlc3BlY2lhbGx5IGhhcHBlbnMgaW4gY2FzZXMgbGlrZVxuICAgICAgLy91cmwucmVzb2x2ZU9iamVjdCgnbWFpbHRvOmxvY2FsMUBkb21haW4xJywgJ2xvY2FsMkBkb21haW4yJylcbiAgICAgIHZhciBhdXRoSW5Ib3N0ID0gcmVzdWx0Lmhvc3QgJiYgcmVzdWx0Lmhvc3QuaW5kZXhPZignQCcpID4gMCA/XG4gICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5ob3N0LnNwbGl0KCdAJykgOiBmYWxzZTtcbiAgICAgIGlmIChhdXRoSW5Ib3N0KSB7XG4gICAgICAgIHJlc3VsdC5hdXRoID0gYXV0aEluSG9zdC5zaGlmdCgpO1xuICAgICAgICByZXN1bHQuaG9zdCA9IHJlc3VsdC5ob3N0bmFtZSA9IGF1dGhJbkhvc3Quc2hpZnQoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmVzdWx0LnNlYXJjaCA9IHJlbGF0aXZlLnNlYXJjaDtcbiAgICByZXN1bHQucXVlcnkgPSByZWxhdGl2ZS5xdWVyeTtcbiAgICAvL3RvIHN1cHBvcnQgaHR0cC5yZXF1ZXN0XG4gICAgaWYgKCF1dGlsLmlzTnVsbChyZXN1bHQucGF0aG5hbWUpIHx8ICF1dGlsLmlzTnVsbChyZXN1bHQuc2VhcmNoKSkge1xuICAgICAgcmVzdWx0LnBhdGggPSAocmVzdWx0LnBhdGhuYW1lID8gcmVzdWx0LnBhdGhuYW1lIDogJycpICtcbiAgICAgICAgICAgICAgICAgICAgKHJlc3VsdC5zZWFyY2ggPyByZXN1bHQuc2VhcmNoIDogJycpO1xuICAgIH1cbiAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgaWYgKCFzcmNQYXRoLmxlbmd0aCkge1xuICAgIC8vIG5vIHBhdGggYXQgYWxsLiAgZWFzeS5cbiAgICAvLyB3ZSd2ZSBhbHJlYWR5IGhhbmRsZWQgdGhlIG90aGVyIHN0dWZmIGFib3ZlLlxuICAgIHJlc3VsdC5wYXRobmFtZSA9IG51bGw7XG4gICAgLy90byBzdXBwb3J0IGh0dHAucmVxdWVzdFxuICAgIGlmIChyZXN1bHQuc2VhcmNoKSB7XG4gICAgICByZXN1bHQucGF0aCA9ICcvJyArIHJlc3VsdC5zZWFyY2g7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdC5wYXRoID0gbnVsbDtcbiAgICB9XG4gICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8vIGlmIGEgdXJsIEVORHMgaW4gLiBvciAuLiwgdGhlbiBpdCBtdXN0IGdldCBhIHRyYWlsaW5nIHNsYXNoLlxuICAvLyBob3dldmVyLCBpZiBpdCBlbmRzIGluIGFueXRoaW5nIGVsc2Ugbm9uLXNsYXNoeSxcbiAgLy8gdGhlbiBpdCBtdXN0IE5PVCBnZXQgYSB0cmFpbGluZyBzbGFzaC5cbiAgdmFyIGxhc3QgPSBzcmNQYXRoLnNsaWNlKC0xKVswXTtcbiAgdmFyIGhhc1RyYWlsaW5nU2xhc2ggPSAoXG4gICAgICAocmVzdWx0Lmhvc3QgfHwgcmVsYXRpdmUuaG9zdCB8fCBzcmNQYXRoLmxlbmd0aCA+IDEpICYmXG4gICAgICAobGFzdCA9PT0gJy4nIHx8IGxhc3QgPT09ICcuLicpIHx8IGxhc3QgPT09ICcnKTtcblxuICAvLyBzdHJpcCBzaW5nbGUgZG90cywgcmVzb2x2ZSBkb3VibGUgZG90cyB0byBwYXJlbnQgZGlyXG4gIC8vIGlmIHRoZSBwYXRoIHRyaWVzIHRvIGdvIGFib3ZlIHRoZSByb290LCBgdXBgIGVuZHMgdXAgPiAwXG4gIHZhciB1cCA9IDA7XG4gIGZvciAodmFyIGkgPSBzcmNQYXRoLmxlbmd0aDsgaSA+PSAwOyBpLS0pIHtcbiAgICBsYXN0ID0gc3JjUGF0aFtpXTtcbiAgICBpZiAobGFzdCA9PT0gJy4nKSB7XG4gICAgICBzcmNQYXRoLnNwbGljZShpLCAxKTtcbiAgICB9IGVsc2UgaWYgKGxhc3QgPT09ICcuLicpIHtcbiAgICAgIHNyY1BhdGguc3BsaWNlKGksIDEpO1xuICAgICAgdXArKztcbiAgICB9IGVsc2UgaWYgKHVwKSB7XG4gICAgICBzcmNQYXRoLnNwbGljZShpLCAxKTtcbiAgICAgIHVwLS07XG4gICAgfVxuICB9XG5cbiAgLy8gaWYgdGhlIHBhdGggaXMgYWxsb3dlZCB0byBnbyBhYm92ZSB0aGUgcm9vdCwgcmVzdG9yZSBsZWFkaW5nIC4uc1xuICBpZiAoIW11c3RFbmRBYnMgJiYgIXJlbW92ZUFsbERvdHMpIHtcbiAgICBmb3IgKDsgdXAtLTsgdXApIHtcbiAgICAgIHNyY1BhdGgudW5zaGlmdCgnLi4nKTtcbiAgICB9XG4gIH1cblxuICBpZiAobXVzdEVuZEFicyAmJiBzcmNQYXRoWzBdICE9PSAnJyAmJlxuICAgICAgKCFzcmNQYXRoWzBdIHx8IHNyY1BhdGhbMF0uY2hhckF0KDApICE9PSAnLycpKSB7XG4gICAgc3JjUGF0aC51bnNoaWZ0KCcnKTtcbiAgfVxuXG4gIGlmIChoYXNUcmFpbGluZ1NsYXNoICYmIChzcmNQYXRoLmpvaW4oJy8nKS5zdWJzdHIoLTEpICE9PSAnLycpKSB7XG4gICAgc3JjUGF0aC5wdXNoKCcnKTtcbiAgfVxuXG4gIHZhciBpc0Fic29sdXRlID0gc3JjUGF0aFswXSA9PT0gJycgfHxcbiAgICAgIChzcmNQYXRoWzBdICYmIHNyY1BhdGhbMF0uY2hhckF0KDApID09PSAnLycpO1xuXG4gIC8vIHB1dCB0aGUgaG9zdCBiYWNrXG4gIGlmIChwc3ljaG90aWMpIHtcbiAgICByZXN1bHQuaG9zdG5hbWUgPSByZXN1bHQuaG9zdCA9IGlzQWJzb2x1dGUgPyAnJyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmNQYXRoLmxlbmd0aCA/IHNyY1BhdGguc2hpZnQoKSA6ICcnO1xuICAgIC8vb2NjYXRpb25hbHkgdGhlIGF1dGggY2FuIGdldCBzdHVjayBvbmx5IGluIGhvc3RcbiAgICAvL3RoaXMgZXNwZWNpYWxseSBoYXBwZW5zIGluIGNhc2VzIGxpa2VcbiAgICAvL3VybC5yZXNvbHZlT2JqZWN0KCdtYWlsdG86bG9jYWwxQGRvbWFpbjEnLCAnbG9jYWwyQGRvbWFpbjInKVxuICAgIHZhciBhdXRoSW5Ib3N0ID0gcmVzdWx0Lmhvc3QgJiYgcmVzdWx0Lmhvc3QuaW5kZXhPZignQCcpID4gMCA/XG4gICAgICAgICAgICAgICAgICAgICByZXN1bHQuaG9zdC5zcGxpdCgnQCcpIDogZmFsc2U7XG4gICAgaWYgKGF1dGhJbkhvc3QpIHtcbiAgICAgIHJlc3VsdC5hdXRoID0gYXV0aEluSG9zdC5zaGlmdCgpO1xuICAgICAgcmVzdWx0Lmhvc3QgPSByZXN1bHQuaG9zdG5hbWUgPSBhdXRoSW5Ib3N0LnNoaWZ0KCk7XG4gICAgfVxuICB9XG5cbiAgbXVzdEVuZEFicyA9IG11c3RFbmRBYnMgfHwgKHJlc3VsdC5ob3N0ICYmIHNyY1BhdGgubGVuZ3RoKTtcblxuICBpZiAobXVzdEVuZEFicyAmJiAhaXNBYnNvbHV0ZSkge1xuICAgIHNyY1BhdGgudW5zaGlmdCgnJyk7XG4gIH1cblxuICBpZiAoIXNyY1BhdGgubGVuZ3RoKSB7XG4gICAgcmVzdWx0LnBhdGhuYW1lID0gbnVsbDtcbiAgICByZXN1bHQucGF0aCA9IG51bGw7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0LnBhdGhuYW1lID0gc3JjUGF0aC5qb2luKCcvJyk7XG4gIH1cblxuICAvL3RvIHN1cHBvcnQgcmVxdWVzdC5odHRwXG4gIGlmICghdXRpbC5pc051bGwocmVzdWx0LnBhdGhuYW1lKSB8fCAhdXRpbC5pc051bGwocmVzdWx0LnNlYXJjaCkpIHtcbiAgICByZXN1bHQucGF0aCA9IChyZXN1bHQucGF0aG5hbWUgPyByZXN1bHQucGF0aG5hbWUgOiAnJykgK1xuICAgICAgICAgICAgICAgICAgKHJlc3VsdC5zZWFyY2ggPyByZXN1bHQuc2VhcmNoIDogJycpO1xuICB9XG4gIHJlc3VsdC5hdXRoID0gcmVsYXRpdmUuYXV0aCB8fCByZXN1bHQuYXV0aDtcbiAgcmVzdWx0LnNsYXNoZXMgPSByZXN1bHQuc2xhc2hlcyB8fCByZWxhdGl2ZS5zbGFzaGVzO1xuICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cblVybC5wcm90b3R5cGUucGFyc2VIb3N0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBob3N0ID0gdGhpcy5ob3N0O1xuICB2YXIgcG9ydCA9IHBvcnRQYXR0ZXJuLmV4ZWMoaG9zdCk7XG4gIGlmIChwb3J0KSB7XG4gICAgcG9ydCA9IHBvcnRbMF07XG4gICAgaWYgKHBvcnQgIT09ICc6Jykge1xuICAgICAgdGhpcy5wb3J0ID0gcG9ydC5zdWJzdHIoMSk7XG4gICAgfVxuICAgIGhvc3QgPSBob3N0LnN1YnN0cigwLCBob3N0Lmxlbmd0aCAtIHBvcnQubGVuZ3RoKTtcbiAgfVxuICBpZiAoaG9zdCkgdGhpcy5ob3N0bmFtZSA9IGhvc3Q7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaXNTdHJpbmc6IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiB0eXBlb2YoYXJnKSA9PT0gJ3N0cmluZyc7XG4gIH0sXG4gIGlzT2JqZWN0OiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gdHlwZW9mKGFyZykgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbiAgfSxcbiAgaXNOdWxsOiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gYXJnID09PSBudWxsO1xuICB9LFxuICBpc051bGxPclVuZGVmaW5lZDogZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIGFyZyA9PSBudWxsO1xuICB9XG59O1xuIl19
