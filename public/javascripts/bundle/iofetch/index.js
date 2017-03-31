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
 */
var _require = require('node-io-fetch'),
    IoConfig = _require.IoConfig,
    Io = _require.Io;

var extend = require('extend');

/**
 * 设置自己的配置
 */

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
        custom: {
            hide: function hide(mask) {
                if (Csssuport.transition) {
                    setTimeout(function () {
                        mask.hide();
                    }, 300);
                } else {
                    mask.hide();
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
        custom: {
            hide: function hide(mask) {
                if (Csssuport.transition) {
                    setTimeout(function () {
                        mask.hide();
                    }, 300);
                } else {
                    mask.hide();
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
                custom: {
                    hide: function hide(mask) {
                        if (Csssuport.transition) {
                            setTimeout(function () {
                                mask.hide();
                            }, 300);
                        } else {
                            mask.hide();
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
            bgcolor: '#fff', //背景色
            opacity: 0 }
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
            bgcolor: '#fff', //背景色
            opacity: 0 }
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
			if (this._newcontainer) {
				this.container.remove();
			}
			_get(BombLayer.prototype.__proto__ || Object.getPrototypeOf(BombLayer.prototype), 'destroy', this).call(this);
			this.pos.destroy();
			if (this.mask) {
				this.mask.destroy();
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
    this.mask = $('<div style="' + cssstr + '"></div>');
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
function formatFormData(data) {
    var _formdata = new FormData();
    data = Object.entries(data);
    for (var pair of data) {
        var [key, val] = pair;
        if (val == undefined) {
            continue;
        } else if (val.constructor == Array) {
            val.forEach((v, i) => {
                _formdata.append(key, v);
            });
            continue;
        } else {
            _formdata.append(key, val);
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
    request: function (ioparams) {
        if (ioparams.url == '') {
            throw new Error('io参数url不能为空');
            return;
        }
        var conf = {};

        extend(true, conf, IoConfig.ioparams, ioparams);

        conf.request.method = conf.request.method.toUpperCase();

        //检测ioparams里的data
        var body = conf.data,
            _method = conf.request.method;

        if (body && body.constructor === Object) {
            //说明data是json
            if (_method != 'GET' && _method != 'HEAD' && conf.isformdata) {
                body = formatFormData(body);
                delete conf.headers['Content-Type'];
            } else {
                body = querystring.stringify(body);
            }
        }

        if (conf.headers['Content-Type'] === false) {
            delete conf.headers['Content-Type'];
        }

        //赋值request.body
        if (body) {
            switch (_method) {
                case 'GET':
                    if (typeof body == 'string') {
                        conf.url += '?' + body.toString();
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
        var myrequest = new Request(conf.url, conf.request);

        //请求发起前统一处理
        conf.beforeSend();

        var race = Promise.race([fetch(myrequest), new Promise(function (resolve, reject) {
            setTimeout(reject, conf.timeout, new Error('请求超时'));
        })]);
        race.then(function (response) {
            if (response.ok) {
                //response.status [200,299]
                response[conf.type]().then(function (result) {
                    if (conf.dealfail) {
                        //处理业务错误
                        if (IoConfig.fail.filter(result)) {
                            //有业务错误发生
                            conf[IoConfig.fail.funname](result, response);
                        } else {
                            //无业务错误发生
                            if (conf.dealdata) {
                                conf.success(conf.dealdatafun(result), response);
                            } else {
                                conf.success(result, response);
                            }
                        }
                    } else {
                        conf.success(result, response);
                    }
                }, function (error) {
                    throw error;
                });
            } else {
                var error = new Error(response.statusText || '网络错误');
                throw error;
            }
            conf.complete();
        }).catch(function (error) {
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
    filter: function (result) {
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
  beforeSend: function () {},
  /**
   * 对于接口返回错误，一般因为网络原因，进行的统一处理
   */
  error: function (error) {
    //error或有或无 error.message
    //Alert.alert('系统消息',error.message || '亲，忙不过来了');
  },
  /**
   * 如果fail配置了funname为fail,则调用此方法. 此时fail.filter返回true
   * @param {Object|Other} result 接口返回数据
   * @param {Response} response 返回的response对象
   * @return {[type]} [description]
   */
  fail: function (result, response) {
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
  success: function (result, response) {},
  /**
   * 接口请求完毕调用。无论success,fail,error
   * @return {[type]} [description]
   */
  complete: function () {},
  /**
   * 如果dealdata为true, 则success的result为此方法返回的数据
   * @param {Object|Other} result 接口返回数据
   * @return {[type]}        [description]
   */
  dealdatafun: function (result) {
    return result.data;
  },
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3Rvb2wvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIm5vZGVfbW9kdWxlcy9leHRlbmQvaW5kZXguanMiLCJwdWJsaWNcXGphdmFzY3JpcHRzXFxwYWdlXFxpb2ZldGNoXFxpbmRleC5qcyIsInB1YmxpY1xcamF2YXNjcmlwdHNcXHBhZ2VcXGlvZmV0Y2hcXG1vZGVsLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcY29tbW9uXFxiYXNlLnZpZXcuanMiLCIuLi9ub2RlLWNvcmV1aS1wYy9qcy91aS91aS5hbGVydC5odG1sIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcdWlcXHVpLmFsZXJ0LmpzIiwiLi4vbm9kZS1jb3JldWktcGMvanMvdWkvdWkuY29uZmlybS5odG1sIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcdWlcXHVpLmNvbmZpcm0uanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx1aVxcdWkubGF5ZXIuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx1aVxcdWkubG9hZGluZy5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHVpXFx1aS50b2FzdC5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdWlcXGxheWVyXFxhbGVydC5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdWlcXGxheWVyXFxhbGVydENvbnRyb2wuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHVpXFxsYXllclxcYWxlcnRTaW5nbGUuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHVpXFxsYXllclxcYmFzZUNvbnRyb2wuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHVpXFxsYXllclxcYm9tYkxheWVyLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1aVxcbGF5ZXJcXGNvbmZpcm0uanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHVpXFxsYXllclxcY29uZmlybUNvbnRyb2wuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHVpXFxsYXllclxcY29uZmlybVNpbmdsZS5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdWlcXGxheWVyXFxsYXllci5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdWlcXGxheWVyXFxtYXNrLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1aVxcbGF5ZXJcXHBvc2l0aW9uQm9tYi5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdWlcXGxheWVyXFx0cGwuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHV0aWxcXGNzc3N1cG9ydC5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdXRpbFxcZGVsYXlldnQuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHV0aWxcXGRldmljZWV2dG5hbWUuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHV0aWxcXHB1Ymxpc2hlclMuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHV0aWxcXHJlc2l6ZS5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdXRpbFxccndjb250cm9sbGVyLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1dGlsXFxzY3JvbGwuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHV0aWxcXHRvb2wuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHV0aWxcXHdpbnJlc2l6ZS5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdXRpbFxcd2luc2Nyb2xsLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1dGlsXFx3b3JrZXJDb250cm9sLmpzIiwiLi4vbm9kZS1pby1mZXRjaC9pbmRleC5qcyIsIi4uXFxub2RlLWlvLWZldGNoXFxpby5qcyIsIi4uXFxub2RlLWlvLWZldGNoXFxpb2NvbmZpZy5qcyIsIi4uL25vZGUtaW8tZmV0Y2gvbm9kZV9tb2R1bGVzL3doYXR3Zy1mZXRjaC9mZXRjaC5qcyIsIi4uL3Rvb2wvbm9kZV9tb2R1bGVzL3B1bnljb2RlL3B1bnljb2RlLmpzIiwiLi4vdG9vbC9ub2RlX21vZHVsZXMvcXVlcnlzdHJpbmctZXMzL2RlY29kZS5qcyIsIi4uL3Rvb2wvbm9kZV9tb2R1bGVzL3F1ZXJ5c3RyaW5nLWVzMy9lbmNvZGUuanMiLCIuLi90b29sL25vZGVfbW9kdWxlcy9xdWVyeXN0cmluZy1lczMvaW5kZXguanMiLCIuLi90b29sL25vZGVfbW9kdWxlcy91cmwvdXJsLmpzIiwiLi4vdG9vbC9ub2RlX21vZHVsZXMvdXJsL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN0RkEsSUFBTSxRQUFR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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzdjQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNyaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzV0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIHRvU3RyID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxudmFyIGlzQXJyYXkgPSBmdW5jdGlvbiBpc0FycmF5KGFycikge1xuXHRpZiAodHlwZW9mIEFycmF5LmlzQXJyYXkgPT09ICdmdW5jdGlvbicpIHtcblx0XHRyZXR1cm4gQXJyYXkuaXNBcnJheShhcnIpO1xuXHR9XG5cblx0cmV0dXJuIHRvU3RyLmNhbGwoYXJyKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG5cbnZhciBpc1BsYWluT2JqZWN0ID0gZnVuY3Rpb24gaXNQbGFpbk9iamVjdChvYmopIHtcblx0aWYgKCFvYmogfHwgdG9TdHIuY2FsbChvYmopICE9PSAnW29iamVjdCBPYmplY3RdJykge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHZhciBoYXNPd25Db25zdHJ1Y3RvciA9IGhhc093bi5jYWxsKG9iaiwgJ2NvbnN0cnVjdG9yJyk7XG5cdHZhciBoYXNJc1Byb3RvdHlwZU9mID0gb2JqLmNvbnN0cnVjdG9yICYmIG9iai5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgJiYgaGFzT3duLmNhbGwob2JqLmNvbnN0cnVjdG9yLnByb3RvdHlwZSwgJ2lzUHJvdG90eXBlT2YnKTtcblx0Ly8gTm90IG93biBjb25zdHJ1Y3RvciBwcm9wZXJ0eSBtdXN0IGJlIE9iamVjdFxuXHRpZiAob2JqLmNvbnN0cnVjdG9yICYmICFoYXNPd25Db25zdHJ1Y3RvciAmJiAhaGFzSXNQcm90b3R5cGVPZikge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8vIE93biBwcm9wZXJ0aWVzIGFyZSBlbnVtZXJhdGVkIGZpcnN0bHksIHNvIHRvIHNwZWVkIHVwLFxuXHQvLyBpZiBsYXN0IG9uZSBpcyBvd24sIHRoZW4gYWxsIHByb3BlcnRpZXMgYXJlIG93bi5cblx0dmFyIGtleTtcblx0Zm9yIChrZXkgaW4gb2JqKSB7LyoqL31cblxuXHRyZXR1cm4gdHlwZW9mIGtleSA9PT0gJ3VuZGVmaW5lZCcgfHwgaGFzT3duLmNhbGwob2JqLCBrZXkpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBleHRlbmQoKSB7XG5cdHZhciBvcHRpb25zLCBuYW1lLCBzcmMsIGNvcHksIGNvcHlJc0FycmF5LCBjbG9uZSxcblx0XHR0YXJnZXQgPSBhcmd1bWVudHNbMF0sXG5cdFx0aSA9IDEsXG5cdFx0bGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aCxcblx0XHRkZWVwID0gZmFsc2U7XG5cblx0Ly8gSGFuZGxlIGEgZGVlcCBjb3B5IHNpdHVhdGlvblxuXHRpZiAodHlwZW9mIHRhcmdldCA9PT0gJ2Jvb2xlYW4nKSB7XG5cdFx0ZGVlcCA9IHRhcmdldDtcblx0XHR0YXJnZXQgPSBhcmd1bWVudHNbMV0gfHwge307XG5cdFx0Ly8gc2tpcCB0aGUgYm9vbGVhbiBhbmQgdGhlIHRhcmdldFxuXHRcdGkgPSAyO1xuXHR9IGVsc2UgaWYgKCh0eXBlb2YgdGFyZ2V0ICE9PSAnb2JqZWN0JyAmJiB0eXBlb2YgdGFyZ2V0ICE9PSAnZnVuY3Rpb24nKSB8fCB0YXJnZXQgPT0gbnVsbCkge1xuXHRcdHRhcmdldCA9IHt9O1xuXHR9XG5cblx0Zm9yICg7IGkgPCBsZW5ndGg7ICsraSkge1xuXHRcdG9wdGlvbnMgPSBhcmd1bWVudHNbaV07XG5cdFx0Ly8gT25seSBkZWFsIHdpdGggbm9uLW51bGwvdW5kZWZpbmVkIHZhbHVlc1xuXHRcdGlmIChvcHRpb25zICE9IG51bGwpIHtcblx0XHRcdC8vIEV4dGVuZCB0aGUgYmFzZSBvYmplY3Rcblx0XHRcdGZvciAobmFtZSBpbiBvcHRpb25zKSB7XG5cdFx0XHRcdHNyYyA9IHRhcmdldFtuYW1lXTtcblx0XHRcdFx0Y29weSA9IG9wdGlvbnNbbmFtZV07XG5cblx0XHRcdFx0Ly8gUHJldmVudCBuZXZlci1lbmRpbmcgbG9vcFxuXHRcdFx0XHRpZiAodGFyZ2V0ICE9PSBjb3B5KSB7XG5cdFx0XHRcdFx0Ly8gUmVjdXJzZSBpZiB3ZSdyZSBtZXJnaW5nIHBsYWluIG9iamVjdHMgb3IgYXJyYXlzXG5cdFx0XHRcdFx0aWYgKGRlZXAgJiYgY29weSAmJiAoaXNQbGFpbk9iamVjdChjb3B5KSB8fCAoY29weUlzQXJyYXkgPSBpc0FycmF5KGNvcHkpKSkpIHtcblx0XHRcdFx0XHRcdGlmIChjb3B5SXNBcnJheSkge1xuXHRcdFx0XHRcdFx0XHRjb3B5SXNBcnJheSA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRjbG9uZSA9IHNyYyAmJiBpc0FycmF5KHNyYykgPyBzcmMgOiBbXTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGNsb25lID0gc3JjICYmIGlzUGxhaW5PYmplY3Qoc3JjKSA/IHNyYyA6IHt9O1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvLyBOZXZlciBtb3ZlIG9yaWdpbmFsIG9iamVjdHMsIGNsb25lIHRoZW1cblx0XHRcdFx0XHRcdHRhcmdldFtuYW1lXSA9IGV4dGVuZChkZWVwLCBjbG9uZSwgY29weSk7XG5cblx0XHRcdFx0XHQvLyBEb24ndCBicmluZyBpbiB1bmRlZmluZWQgdmFsdWVzXG5cdFx0XHRcdFx0fSBlbHNlIGlmICh0eXBlb2YgY29weSAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0XHRcdHRhcmdldFtuYW1lXSA9IGNvcHk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Ly8gUmV0dXJuIHRoZSBtb2RpZmllZCBvYmplY3Rcblx0cmV0dXJuIHRhcmdldDtcbn07XG5cbiIsImNvbnN0IE1vZGVsID0gcmVxdWlyZSgnLi9tb2RlbCcpLFxyXG4gICAgICBCYXNlVmlldyA9IHJlcXVpcmUoJ2NvcmUtYmFzZXZpZXcnKTtcclxuXHJcbkJhc2VWaWV3LnJlZ2lzdGVyKHtcclxuICAgIF9pbml0OiBmdW5jdGlvbigpe1xyXG4gICAgICAgIE1vZGVsLmxpc3RkYXRhKHtcclxuICAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgICB1c2VybmFtZTogJ3ptcicsXHJcbiAgICAgICAgICAgICAgICAgc2V4OiAn5aWzJ1xyXG4gICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGxpc3Qpe1xyXG4gICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGxpc3QpO1xyXG4gICAgICAgICAgICAgfVxyXG4gICAgICAgICB9KTtcclxuICAgIH1cclxufSk7XHJcbiIsIi8qKlxyXG4gKiDmlL7liLDoh6rlt7Hpobnnm67kuK3vvIznu5/kuIDlrprkuYnnmoRpb+WkhOeQhuWxglxyXG4gKi9cclxuY29uc3Qge0lvQ29uZmlnLElvfSA9IHJlcXVpcmUoJ25vZGUtaW8tZmV0Y2gnKTtcclxuY29uc3QgZXh0ZW5kID0gcmVxdWlyZSgnZXh0ZW5kJyk7XHJcblxyXG4vKipcclxuICog6K6+572u6Ieq5bex55qE6YWN572uXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIOS4muWKoemUmeivr+adoeS7tumFjee9rlxyXG4gKiBAcGFyYW0gIHtbdHlwZV19IHJlc3VsdCBbZGVzY3JpcHRpb25dXHJcbiAqIEByZXR1cm4ge1t0eXBlXX0gICAgICAgIFtkZXNjcmlwdGlvbl1cclxuICovXHJcbklvQ29uZmlnLmZhaWwuZmlsdGVyID0gZnVuY3Rpb24ocmVzdWx0KXtcclxuICAgIGlmKHJlc3VsdC5jb2RlICE9ICdBMDAwMScpe1xyXG4gICAgICAgIHJldHVybiB0cnVlOyAvL+ivtOaYjuWPkeeUn+S6huS4muWKoemUmeivr1xyXG4gICAgfWVsc2V7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogaW/or7fmsYLlj5HpgIHliY3miafooYxcclxuICogQHJldHVybiB7W3R5cGVdfSBbZGVzY3JpcHRpb25dXHJcbiAqL1xyXG5Jb0NvbmZpZy5pb3BhcmFtcy5iZWZvcmVTZW5kID0gZnVuY3Rpb24oKXtcclxuICAgIGNvbnNvbGUubG9nKCfor7fmsYLlvIDlp4snKTtcclxuICAgIC8vIF9BUFAuTG9hZGluZy5zaG93KCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBpb+ivt+axgue7k+adn+WQjlxyXG4gKi9cclxuSW9Db25maWcuaW9wYXJhbXMuY29tcGxldGUgPSBmdW5jdGlvbigpe1xyXG4gICAgY29uc29sZS5sb2coJ+ivt+axgue7k+adnycpXHJcbiAgICAvLyBfQVBQLkxvYWRpbmcuaGlkZSgpO1xyXG59XHJcblxyXG4vKipcclxuICog572R57uc6ZSZ6K+v5oiW6ICF57O757uf6ZSZ6K+vXHJcbiAqIEBwYXJhbSAge1t0eXBlXX0gZXJyb3IgW2Rlc2NyaXB0aW9uXVxyXG4gKiBAcmV0dXJuIHtbdHlwZV19ICAgICAgIFtkZXNjcmlwdGlvbl1cclxuICovXHJcbklvQ29uZmlnLmlvcGFyYW1zLmVycm9yID0gZnVuY3Rpb24oZXJyb3Ipe1xyXG4gICAgLy9lcnJvcuaIluacieaIluaXoCBlcnJvci5tZXNzYWdlXHJcbiAgICBfQVBQLlRvYXN0LnNob3coZXJyb3IubWVzc2FnZSB8fCAn5Lqy77yM5b+Z5LiN6L+H5p2l5LqGJyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDkuJrliqHplJnor6/lpITnkIZcclxuICogQHBhcmFtICB7W3R5cGVdfSByZXN1bHQgICBbZGVzY3JpcHRpb25dXHJcbiAqIEBwYXJhbSAge1t0eXBlXX0gcmVzcG9uc2UgW2Rlc2NyaXB0aW9uXVxyXG4gKiBAcmV0dXJuIHtbdHlwZV19ICAgICAgICAgIFtkZXNjcmlwdGlvbl1cclxuICovXHJcbklvQ29uZmlnLmlvcGFyYW1zLmZhaWwgPSBmdW5jdGlvbihyZXN1bHQscmVzcG9uc2Upe1xyXG4gICAgaWYocmVzdWx0LmNvZGUgPT0gJ0EwMDAyJyl7XHJcbiAgICAgICAgX0FQUC5Ub2FzdC5zaG93KCfmnKrnmbvlvZUnKTtcclxuICAgIH1lbHNle1xyXG4gICAgICAgIF9BUFAuVG9hc3Quc2hvdyhyZXN1bHQuZXJybXNnIHx8ICfkurLvvIzlv5nkuI3ov4fmnaXkuoYnKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOiwg+eUqOS7peS4i+aWueazleeahOaXtuWAme+8jG9wdOWmgmlvcGFyYW1z44CC5L2G5piv5LiA6Iis5Y+q5Lyg5Lul5LiL5Y+C5pWw5bCx5Y+v5Lul5LqG77yaXHJcbiAqICAgZGF0YSBzdWNjZXNzXHJcbiAqICAg5Lul5LiL5pa55rOV5bey57uP57uf5LiA5aSE55CG5LqG77yM5aaC5p6c5oOz6KaG55uW6Ieq6KGM5Lyg5YWlXHJcbiAqICAgYmVmb3JlU2VuZCBlcnJvciBmYWlsIGNvbXBsZXRlXHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIC8vbGlzdGRhdGHmjqXlj6NcclxuICAgIGxpc3RkYXRhKG9wdCl7XHJcbiAgICAgICAgSW8ucmVxdWVzdChleHRlbmQodHJ1ZSx7XHJcbiAgICAgICAgICAgIHJlcXVlc3Q6IHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHVybDogJ2h0dHA6Ly8xMjcuMC4wLjE6ODAwMC9saXN0ZGF0YSdcclxuICAgICAgICB9LG9wdCkpO1xyXG4gICAgfVxyXG59O1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyDpobXpnaLln7rmnKx2aWV357G744CC5pyA57uI5Lia5Yqh6aG555uu5Lit6JC95Zyw6aG155qEanPpg73lv4XpobvlvJXnlKjmraRqc+aIluWFtuWtkOexu1xyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE2LTEyLTIwIOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm5cclxuICogKi9cclxuXHJcbiBjb25zdCBBbGVydCA9IHJlcXVpcmUoJy4uL3VpL3VpLmFsZXJ0LmpzJyksXHJcbiAgICAgICBDb25maXJtID0gcmVxdWlyZSgnLi4vdWkvdWkuY29uZmlybS5qcycpLFxyXG4gICAgICAgVG9hc3QgPSByZXF1aXJlKCcuLi91aS91aS50b2FzdC5qcycpLFxyXG4gICAgICAgTG9hZGluZyA9IHJlcXVpcmUoJy4uL3VpL3VpLmxvYWRpbmcuanMnKSxcclxuICAgICAgIFRvb2wgPSByZXF1aXJlKCdsaWJ1dGlsLXRvb2wnKTtcclxuXHJcbmNsYXNzIEJhc2VWaWV3IHtcclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gJ3ptcmRsYic7XHJcbiAgICAgICAgLy/nu5HlrprkuIDkupvluLjnlKjnmoTnu4Tku7bliLDlhajlsYDlj5jph49cclxuICAgICAgICB3aW5kb3cuX0FQUCA9IHt9O1xyXG4gICAgICAgIF9BUFAuQWxlcnQgPSBBbGVydDtcclxuICAgICAgICBfQVBQLkNvbmZpcm0gPSBDb25maXJtO1xyXG4gICAgICAgIF9BUFAuVG9hc3QgPSBUb2FzdDtcclxuICAgICAgICBfQVBQLkxvYWRpbmcgPSBMb2FkaW5nO1xyXG4gICAgICAgIF9BUFAuVG9vbCA9IFRvb2w7XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdCgpe1xyXG4gICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOazqOWGjOS4gOS4qumhtemdolxyXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSBvcHQg6YeM6Z2i6YWN572u55qE5omA5pyJ5pa55rOV6YO95rS+55Sf57uZQmFzZVZpZXfnmoTlrp7kvotcclxuICAgICAqIHtcclxuICAgICAqICAgICAgX2luaXQ6IOatpOaWueazleW/hemhu+acie+8jOmhtemdouWIneWni+WMluaJp+ihjFxyXG4gICAgICogfVxyXG4gICAgICogQHJldHVybiB7aW5zdGFuY2Ugb2YgQmFzZVZpZXd9ICAgICBbZGVzY3JpcHRpb25dXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyByZWdpc3RlcihvcHQpe1xyXG4gICAgICAgIHZhciB0ID0gbmV3IHRoaXMoKTtcclxuICAgICAgICBmb3IodmFyIGtleSBpbiBvcHQpe1xyXG4gICAgICAgICAgICB0W2tleV0gPSBvcHRba2V5XTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8v5Yid5aeL5YyWXHJcbiAgICAgICAgdC5pbml0KCk7XHJcblxyXG4gICAgICAgIHJldHVybiB0O1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VWaWV3O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFwiPGRpdiBjbGFzcz1cXFwidGl0bGUganMtdGl0bGVcXFwiPuaPkOekujwvZGl2PjxkaXYgY2xhc3M9XFxcImJvZHkganMtY29udGVudFxcXCI+PC9kaXY+PGRpdiBjbGFzcz1mb290ZXI+PGEgaHJlZj1qYXZhc2NyaXB0OjsgY2xhc3M9anMtb2s+56Gu5a6aPC9hPjwvZGl2PlwiO1xuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcg5YWs5YWxYWxlcnTlvLnlsYJcclxuICogQHZlcnNpb24gMS4wIHwgMjAxNi0xMS0xNCDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAcmV0dXJuXHJcbiAqICovXHJcblxyXG4gY29uc3QgQWxlcnRTaW5nbGUgPSByZXF1aXJlKCdsaWJsYXllci1hbGVydFNpbmdsZScpLFxyXG4gICAgICAgIENzc3N1cG9ydCA9IHJlcXVpcmUoJ2xpYnV0aWwtY3Nzc3Vwb3J0JyksXHJcbiAgICAgICAgVHBsID0gcmVxdWlyZSgnLi91aS5hbGVydC5odG1sJyk7XHJcblxyXG5BbGVydFNpbmdsZS5oaWRlZGVzdHJveSA9IGZhbHNlO1xyXG5cclxuQWxlcnRTaW5nbGUuc2V0Y29uZmlnKHtcclxuICAgIGxheWVyOiB7XHJcbiAgICAgICAgY2xhc3NuYW1lOiAnY29yZXVpLWctbGF5ZXIgY29yZXVpLWctd2FybmxheWVyIGNvcmV1aS1nLWxheWVyLWFsZXJ0JyxcclxuICAgICAgICBjdXN0b206IHtcclxuICAgICAgICAgICAgaGlkZTogZnVuY3Rpb24obGF5ZXIpe1xyXG4gICAgICAgICAgICAgICAgbGF5ZXIucmVtb3ZlQ2xhc3MoJ3Nob3ctdXAnKS5hZGRDbGFzcygnaGlkZS11cCcpO1xyXG4gICAgICAgICAgICAgICAgaWYoQ3Nzc3Vwb3J0LnRyYW5zaXRpb24pe1xyXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGF5ZXIuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBBbGVydFNpbmdsZS5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwzMDApO1xyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgbGF5ZXIuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIEFsZXJ0U2luZ2xlLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBtYXNrOiB7XHJcbiAgICAgICAgY3VzdG9tOiB7XHJcbiAgICAgICAgICAgIGhpZGU6IGZ1bmN0aW9uKG1hc2spe1xyXG4gICAgICAgICAgICAgICAgaWYoQ3Nzc3Vwb3J0LnRyYW5zaXRpb24pe1xyXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFzay5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwzMDApO1xyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFzay5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgYWxlcnQ6IHtcclxuICAgICAgICBmcmFtZXRwbDogVHBsXHJcbiAgICB9XHJcbn0pO1xyXG5cclxuQWxlcnRTaW5nbGUuY3JlYXRlY2FsLmFkZChmdW5jdGlvbihsYXllcm9iail7XHJcbiAgICBsYXllcm9iai5sYXllci5hZGRDbGFzcygnaGlkZS11cCcpO1xyXG5cclxuICAgIGxheWVyb2JqLnBvcy5wb3NjYWwuYWRkKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgbGF5ZXJvYmoubGF5ZXIucmVtb3ZlQ2xhc3MoJ2hpZGUtdXAnKS5hZGRDbGFzcygnc2hvdy11cCcpO1xyXG4gICAgfSk7XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBbGVydFNpbmdsZTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBcIjxkaXYgY2xhc3M9XFxcInRpdGxlIGpzLXRpdGxlXFxcIj7mj5DnpLo8L2Rpdj48ZGl2IGNsYXNzPVxcXCJib2R5IGpzLWNvbnRlbnRcXFwiPjwvZGl2PjxkaXYgY2xhc3M9Zm9vdGVyPjxhIGhyZWY9amF2YXNjcmlwdDo7IGNsYXNzPVxcXCJjYW5jZWwganMtY2FuY2VsXFxcIj7lj5bmtog8L2E+IDxhIGhyZWY9amF2YXNjcmlwdDo7IGNsYXNzPWpzLW9rPuehruWumjwvYT4gPGkgY2xhc3M9c3BsaXQ+PC9pPjwvZGl2PlwiO1xuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcg5YWs5YWxY29uZmlybeW8ueWxglxyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE3LTAxLTA2IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm5cclxuICogKi9cclxuXHJcbiBjb25zdCBDb25maXJtU2luZ2xlID0gcmVxdWlyZSgnbGlibGF5ZXItY29uZmlybVNpbmdsZScpLFxyXG4gICAgICAgIENzc3N1cG9ydCA9IHJlcXVpcmUoJ2xpYnV0aWwtY3Nzc3Vwb3J0JyksXHJcbiAgICAgICAgVHBsID0gcmVxdWlyZSgnLi91aS5jb25maXJtLmh0bWwnKTtcclxuXHJcbkNvbmZpcm1TaW5nbGUuaGlkZWRlc3Ryb3kgPSBmYWxzZTtcclxuXHJcbkNvbmZpcm1TaW5nbGUuc2V0Y29uZmlnKHtcclxuICAgIGxheWVyOiB7XHJcbiAgICAgICAgY2xhc3NuYW1lOiAnY29yZXVpLWctbGF5ZXIgY29yZXVpLWctd2FybmxheWVyIGNvcmV1aS1nLWxheWVyLWNvbmZpcm0nLFxyXG4gICAgICAgIGN1c3RvbToge1xyXG4gICAgICAgICAgICBoaWRlOiBmdW5jdGlvbihsYXllcil7XHJcbiAgICAgICAgICAgICAgICBsYXllci5yZW1vdmVDbGFzcygnc2hvdy11cCcpLmFkZENsYXNzKCdoaWRlLXVwJyk7XHJcbiAgICAgICAgICAgICAgICBpZihDc3NzdXBvcnQudHJhbnNpdGlvbil7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXllci5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIENvbmZpcm1TaW5nbGUuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sMzAwKTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIGxheWVyLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICBDb25maXJtU2luZ2xlLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBtYXNrOiB7XHJcbiAgICAgICAgY3VzdG9tOiB7XHJcbiAgICAgICAgICAgIGhpZGU6IGZ1bmN0aW9uKG1hc2spe1xyXG4gICAgICAgICAgICAgICAgaWYoQ3Nzc3Vwb3J0LnRyYW5zaXRpb24pe1xyXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFzay5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwzMDApO1xyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFzay5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgY29uZmlybToge1xyXG4gICAgICAgIGZyYW1ldHBsOiBUcGxcclxuICAgIH1cclxufSk7XHJcblxyXG5Db25maXJtU2luZ2xlLmNyZWF0ZWNhbC5hZGQoZnVuY3Rpb24obGF5ZXJvYmope1xyXG4gICAgbGF5ZXJvYmoubGF5ZXIuYWRkQ2xhc3MoJ2hpZGUtdXAnKTtcclxuXHJcbiAgICBsYXllcm9iai5wb3MucG9zY2FsLmFkZChmdW5jdGlvbigpe1xyXG4gICAgICAgIGxheWVyb2JqLmxheWVyLnJlbW92ZUNsYXNzKCdoaWRlLXVwJykuYWRkQ2xhc3MoJ3Nob3ctdXAnKTtcclxuICAgIH0pO1xyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29uZmlybVNpbmdsZTtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcg5Lia5Yqh5Z+65pys5by55bGC57G777yM5aGr5YWF5LqG5LiA5Lqb5qC35byP44CC5Lia5Yqh5omA5pyJ6Ieq5a6a5LmJ5by55bGC5bCG57un5om/5q2k57G7XHJcbiAqIEB2ZXJzaW9uIDEuMCB8IDIwMTYtMTEtMTQg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQHJldHVyblxyXG4gKiAqL1xyXG5cclxuIGNvbnN0IEJvbWJMYXllciA9IHJlcXVpcmUoJ2xpYmxheWVyLWJvbWJMYXllcicpLFxyXG4gICAgICAgIENzc3N1cG9ydCA9IHJlcXVpcmUoJ2xpYnV0aWwtY3Nzc3Vwb3J0Jyk7XHJcblxyXG5jbGFzcyBVSUxheWVyIGV4dGVuZHMgQm9tYkxheWVyIHtcclxuICAgIC8qKlxyXG5cdCAqIOW8ueWxguexu+KAlOKAlOWIm+W7uuW5tua3u+WKoOWIsOaMh+WumuWuueWZqOS4rVxyXG4gICAgICogQHBhcmFtIHtKU09OfSBjb25maWcg5by55bGC6YWN572u5Y+C5pWwIO+8jOS4jeaYr+W/heWhq+mhuVxyXG4gICAgICogXHRcdHtcclxuICAgICAqIFx0ICAgICAgIGNvbnRhaW5lciB7RWxlbWVudH0g5a2Y5pS+5by55bGC55qE5a655Zmo44CC5Y+v5LiN5oyH5a6a77yM6buY6K6k5by55bGC5a2Y5pS+5LqOYm9keeS4reeahOS4gOS4quWKqOaAgeeUn+aIkOeahGRpdumHjFxyXG4gICAgICogXHQgICAgICAgcG9zOnt9LCAvL+WumuS9jeWPguaVsO+8jOWFt+S9k+ivtOaYjuWPr+ingeaWueazlWxheWVyL3Bvc2l0aW9uQm9tYuS4reeahGNvbmZpZ+ivtOaYjlxyXG4gICAgICogICAgICAgICBsYXllcjoge30sIC8v5by55bGC5L+h5oGv5Y+C5pWw77yM5YW35L2T6K+05piO5Y+v6KeB5pa55rOVbGF5ZXIvbGF5ZXLkuK3nmoRjb25maWfor7TmmI5cclxuICAgICAqIFx0XHQgICBtYXNrOiB7IC8v6YGu572p5L+h5oGv5Y+C5pWw77yM5YW35L2T6K+05piO5Y+v6KeB5pa55rOVbGF5ZXIvbWFza+S4reeahGNvbmZpZ+ivtOaYjuOAguWcqOatpOWfuuehgOS4iui/m+ihjOS7peS4i+aJqeWxlVxyXG4gICAgICogXHRcdFx0ICBtYXNrOiB0cnVlLCAvL+aYr+WQpuWIm+W7uumBrue9qVxyXG4gICAgICogICAgICAgICAgICBjbWxoaWRlOiBmYWxzZSAvL+eCueWHu+mBrue9qeaYr+WQpuWFs+mXreW8ueWxglxyXG4gICAgICogXHRcdCAgIH1cclxuICAgICAqICAgICAgfVxyXG5cdCAqL1xyXG4gICAgY29uc3RydWN0b3IoY29uZmlnKXtcclxuICAgICAgICAvL+a3u+WKoOiHquWumuS5ieWPguaVsFxyXG4gICAgICAgIGNvbmZpZyA9ICQuZXh0ZW5kKHRydWUse1xyXG4gICAgICAgICAgICBsYXllcjoge1xyXG4gICAgICAgICAgICAgICAgY2xhc3NuYW1lOiAnY29yZXVpLWctbGF5ZXInLFxyXG4gICAgICAgICAgICAgICAgc2hvdzogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBjdXN0b206IHtcclxuICAgICAgICAgICAgICAgICAgICBoaWRlOiBmdW5jdGlvbihsYXllcil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxheWVyLnJlbW92ZUNsYXNzKCdzaG93LXVwJykuYWRkQ2xhc3MoJ2hpZGUtdXAnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoQ3Nzc3Vwb3J0LnRyYW5zaXRpb24pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxheWVyLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5oaWRlYWZ0ZXJjYWwuZmlyZSgpOyAvL+WxgumakOiXj+WQjuWbnuiwg1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwzMDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxheWVyLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmhpZGVhZnRlcmNhbC5maXJlKCk7IC8v5bGC6ZqQ6JeP5ZCO5Zue6LCDXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG1hc2s6IHtcclxuICAgICAgICAgICAgICAgIGN1c3RvbToge1xyXG4gICAgICAgICAgICAgICAgICAgIGhpZGU6IGZ1bmN0aW9uKG1hc2spe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihDc3NzdXBvcnQudHJhbnNpdGlvbil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFzay5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LDMwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFzay5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LGNvbmZpZyB8fCB7fSk7XHJcblxyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB2YXIgX2xheWVyID0gdGhpcy5sYXllcjtcclxuXHJcbiAgICAgICAgX2xheWVyLmFkZENsYXNzKCdoaWRlLXVwJyk7XHJcblxyXG4gICAgICAgIHRoaXMucG9zLnBvc2NhbC5hZGQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgX2xheWVyLnJlbW92ZUNsYXNzKCdoaWRlLXVwJykuYWRkQ2xhc3MoJ3Nob3ctdXAnKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBoaWRlKCl7XHJcbiAgICAgICAgaWYodGhpcy5pc3Nob3coKSl7XHJcblx0XHRcdHRoaXMuaGlkZWJlZm9yZWNhbC5maXJlKCk7IC8v5bGC6ZqQ6JeP5YmN5Zue6LCDXHJcblx0XHRcdHRoaXMubWFzayAmJiB0aGlzLm1hc2suaGlkZSgpO1xyXG5cdFx0XHR0aGlzLl9oaWRlKCk7XHJcblx0XHR9XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVUlMYXllcjtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcgbG9hZGluZyDmj5DnpLrlsYJcclxuICogQHZlcnNpb24gMS4wIHwgMjAxNi0wMS0wNiDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAcmV0dXJuXHJcbiAqICovXHJcbiBjb25zdCBVSUxheWVyID0gcmVxdWlyZSgnLi91aS5sYXllci5qcycpLFxyXG4gICAgICAgIFdvcmtlckNvbnRyb2wgPSByZXF1aXJlKCdsaWJ1dGlsLXdvcmtlckNvbnRyb2wnKTtcclxuXHJcbnZhciB3b3JrZXJDb250cm9sID0gbmV3IFdvcmtlckNvbnRyb2woKTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUxvYWRpbmcod29ya2VyKXtcclxuICAgIHdvcmtlci5sb2FkaW5nID0gbmV3IFVJTGF5ZXIoe1xyXG4gICAgICAgIGxheWVyOiB7XHJcbiAgICAgICAgICAgIGNsYXNzbmFtZTogJ2NvcmV1aS1nLWxheWVyIGNvcmV1aS1nLWxheWVyLWxvYWRpbmcnXHJcbiAgICAgICAgfSxcclxuICAgICAgICBtYXNrOiB7XHJcbiAgICAgICAgICAgIGJnY29sb3I6ICcjZmZmJywgLy/og4zmma/oibJcclxuICAgICAgICAgICAgb3BhY2l0eTogMCwgLy/pga7nvanpgI/mmI7luqZcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB3b3JrZXIubG9hZGluZy5oaWRlYWZ0ZXJjYWwuYWRkKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgd29ya2VyLmxvYWRpbmcuZGVzdHJveSgpO1xyXG4gICAgICAgIHdvcmtlci5sb2FkaW5nID0gbnVsbDtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiB3b3JrZXIubG9hZGluZztcclxufVxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgc2hvdzogZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgbG9hZGluZyA9IGNyZWF0ZUxvYWRpbmcod29ya2VyQ29udHJvbC5nZXQoKSk7XHJcbiAgICAgICAgbG9hZGluZy5zaG93KCk7XHJcbiAgICB9LFxyXG4gICAgaGlkZTogZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgd29ya2VyID0gd29ya2VyQ29udHJvbC5lbmQoKTtcclxuICAgICAgICBpZih3b3JrZXIpe1xyXG4gICAgICAgICAgICB3b3JrZXIubG9hZGluZy5oaWRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IHRvYXN0IOaPkOekuuWxglxyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE2LTAxLTA2IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm5cclxuICogKi9cclxuIGNvbnN0IFVJTGF5ZXIgPSByZXF1aXJlKCcuL3VpLmxheWVyLmpzJyksXHJcbiAgICAgICAgV29ya2VyQ29udHJvbCA9IHJlcXVpcmUoJ2xpYnV0aWwtd29ya2VyQ29udHJvbCcpO1xyXG5cclxudmFyIHdvcmtlckNvbnRyb2wgPSBuZXcgV29ya2VyQ29udHJvbCgpO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlVG9hc3Qod29ya2VyKXtcclxuICAgIHdvcmtlci50b2FzdCA9IG5ldyBVSUxheWVyKHtcclxuICAgICAgICBsYXllcjoge1xyXG4gICAgICAgICAgICBjbGFzc25hbWU6ICdjb3JldWktZy1sYXllciBjb3JldWktZy1sYXllci10b2FzdCdcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1hc2s6IHtcclxuICAgICAgICAgICAgYmdjb2xvcjogJyNmZmYnLCAvL+iDjOaZr+iJslxyXG4gICAgICAgICAgICBvcGFjaXR5OiAwLCAvL+mBrue9qemAj+aYjuW6plxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHdvcmtlci50b2FzdC5oaWRlYWZ0ZXJjYWwuYWRkKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgd29ya2VyLnRvYXN0LmRlc3Ryb3koKTtcclxuICAgICAgICB3b3JrZXIudG9hc3QgPSBudWxsO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHdvcmtlci50b2FzdDtcclxufVxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgc2hvdzogZnVuY3Rpb24oY29udGVudCxoaWRlYWZ0ZXJjYWwpe1xyXG4gICAgICAgIHZhciB0b2FzdCA9IGNyZWF0ZVRvYXN0KHdvcmtlckNvbnRyb2wuZ2V0KCkpO1xyXG4gICAgICAgIHRvYXN0LnNldENvbnRlbnQoY29udGVudCk7XHJcbiAgICAgICAgdG9hc3QuaGlkZWFmdGVyY2FsLmFkZChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBpZih0eXBlb2YgaGlkZWFmdGVyY2FsID09ICdmdW5jdGlvbicpe1xyXG4gICAgICAgICAgICAgICAgaGlkZWFmdGVyY2FsKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0b2FzdC5zaG93KCk7XHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB0b2FzdC5oaWRlKCk7XHJcbiAgICAgICAgfSwyMDAwKTtcclxuICAgIH1cclxufVxyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyBhbGVydOexu++8jOe7p+aJv+iHqmxheWVyL2JvbWJMYXllcuOAgua3u+WKoOKAnOehruWumuaMiemSruKAneS6i+S7tuWbnuiwg1xyXG4gKiDlpoLmnpzlvLnlsYLkuK3mnInku6XkuIvlsZ7mgKfnmoToioLngrlcclxuICogbm9kZT1cImNsb3NlXCLvvIzngrnlh7vliJnkvJrlhbPpl63lvLnlsYIs5bm26Kem5Y+RaGlkZWNhbOmAmuefpeOAglxyXG4gKiBub2RlPVwib2tcIu+8jOeCueWHu+WImeinpuWPkeKAnOehruWumuaMiemSruKAneS6i+S7tuOAgeWFs+mXreW8ueWxgu+8jOW5tuinpuWPkW9rY2Fs5ZKMaGlkZWNhbOmAmuefpeOAglxyXG4gKiBAdmVyc2lvbiAxLjAuMCB8IDIwMTUtMDktMTQg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQGV4YW1wbGVcclxuICogXHQgY29uc3QgQWxlcnQgPSByZXF1aXJlKCdsaWJsYXllci1hbGVydCcpO1xyXG4gKlxyXG4gKiBcdCB2YXIgbGF5ZXIgPSBuZXcgQWxlcnQoe1xyXG4gKiBcdCBcdGFsZXJ0OiB7XHJcbiAqIFx0XHRcdGZyYW1ldHBsOiBbIC8v5by55bGC5Z+65pys5qih5p2/XHJcblx0XHRcdFx0JzxkaXYgY2xhc3M9XCJqcy10aXRsZVwiPjwvZGl2PicsXHJcblx0XHRcdFx0JzxkaXYgY2xhc3M9XCJqcy1jb250ZW50XCI+PC9kaXY+JyxcclxuXHRcdFx0XHQnPGRpdj48YSBocmVmPVwiamF2YXNjcmlwdDo7XCIgY2xhc3M9XCJqcy1va1wiPuWlveeahDwvYT48L2Rpdj4nXHJcblx0XHRcdF0uam9pbignJylcclxuICogICAgICB9XHJcbiAqICAgfSk7XHJcbiAqICAgbGF5ZXIuc2hvd2NhbC5hZGQoZnVuY3Rpb24odHlwZSl7c3dpdGNoKHR5cGUpe2Nhc2UgJ2JlZm9yZSc6Y29uc29sZS5sb2coJ+WxguaYvuekuuWJjScpO2JyZWFrOyBjYXNlICdhZnRlcic6Y29uc29sZS5sb2coJ+WxguaYvuekuuWQjicpO2JyZWFrO319KTtcclxuICogICBsYXllci5oaWRlY2FsLmFkZChmdW5jdGlvbih0eXBlKXtzd2l0Y2godHlwZSl7Y2FzZSAnYmVmb3JlJzpjb25zb2xlLmxvZygn5bGC6ZqQ6JeP5YmNJyk7YnJlYWs7IGNhc2UgJ2FmdGVyJzpjb25zb2xlLmxvZygn5bGC6ZqQ6JeP5ZCOJyk7YnJlYWs7fX0pO1xyXG4gKiAgIGxheWVyLm9rY2FsLmFkZChmdW5jdGlvbihlKXtjb25zb2xlLmxvZygn54K55Ye75LqG56Gu5a6aJyl9KTtcclxuICogICBsYXllci5zZXRNeUNvbnRlbnQoJ+iuvue9rm5vZGU9XCJjb250ZW50XCLoioLngrnnmoRpbm5lckhUTUwnKTtcclxuICogICB2YXIgbm9kZUFyciA9IGxheWVyLmdldE5vZGVzKFsndGl0bGUnXSk7IC8vIOiOt+WPlmNsYXNzPVwianMtdGl0bGVcIueahOiKgueCuVxyXG4gKiAgIG5vZGVBcnIudGl0bGUuaHRtbCgn5YaF5a655Yy6aHRtbCcpO1xyXG4gKiAgIGxheWVyLmNvbnRlbnRub2RlOyAvL+WGheWuueWMum5vZGU9XCJjb250ZW50XCLoioLngrlcclxuICogICBsYXllci5zaG93KCk7IC8v5pi+56S65bGCXHJcbiAqICAgbGF5ZXIuaGlkZSgpOyAvL+makOiXj+WxglxyXG4gKiAgIGxheWVyLmxheWVyOyAvL+WxgmRvbeiKgueCueWvueixoVxyXG4gKiAgIGxheWVyLmNvbnRhaW5lcjsgLy/mta7lsYLlrrnlmahcclxuICogICBsYXllci5kZXN0cm95KCk7IC8v6ZSA5q+B5bGCXHJcbiAqICovXHJcbmNvbnN0IEJvbWJMYXllciA9IHJlcXVpcmUoJy4vYm9tYkxheWVyLmpzJyksXHJcblx0ICAgVHBsID0gcmVxdWlyZSgnLi90cGwuanMnKTtcclxuXHJcbmNsYXNzIEFsZXJ0IGV4dGVuZHMgQm9tYkxheWVyIHtcclxuXHQvKipcclxuXHQgKiBhbGVydOexu1xyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyDlj4LmlbDlkIxsYXllci9ib21iTGF5ZXLph4zpnaLnmoRjb25maWcs5Zyo5q2k5Z+656GA5LiK5aKe5Yqg5aaC5LiL6buY6K6k6YWN572uXHJcbiAgICAgKiB7XHJcbiAgICAgKiBcdCAgKmFsZXJ0OiB7XHJcbiAgICAgKiBcdFx0ICpmcmFtZXRwbCB7U3RyaW5nfSBhbGVydOWfuuacrOaooeadv+OAguimgeaxguivt+ivpuingWxheWVyL3RwbOmHjOmdomFsZXJ06aG555qE6KaB5rGCXHJcbiAgICAgKiAgICB9XHJcbiAgICAgKiB9XHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IoY29uZmlnKSB7XHJcblx0XHR2YXIgb3B0ID0gJC5leHRlbmQodHJ1ZSx7XHJcblx0XHRcdGFsZXJ0OiB7XHJcblx0XHRcdFx0ZnJhbWV0cGw6IFRwbC5hbGVydCAvL2FsZXJ05by55bGC5Z+65pys5qih5p2/44CC6KaB5rGC6K+36K+m6KeBbGF5ZXIvdHBs6YeM6Z2iYWxlcnTpobnnmoTopoHmsYJcclxuXHRcdFx0fVxyXG5cdFx0fSxjb25maWcpO1xyXG5cdFx0c3VwZXIob3B0KTtcclxuXHJcblx0XHR0aGlzLnNldENvbnRlbnQob3B0LmFsZXJ0LmZyYW1ldHBsKTtcclxuXHRcdHRoaXMuY29udGVudG5vZGUgPSB0aGlzLmxheWVyLmZpbmQoJy5qcy1jb250ZW50Jyk7IC8v5YaF5a655Yy66IqC54K5XHJcblx0XHR0aGlzLm9rY2FsID0gJC5DYWxsYmFja3MoKTtcclxuXHRcdC8v5LqL5Lu257uR5a6aXHJcblx0ICAgIHRoaXMubGF5ZXIub24oJ2NsaWNrLmxpYicsICcuanMtb2snLCAoZSkgPT4ge1xyXG5cdCAgICBcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHQgICAgXHR0aGlzLm9rY2FsLmZpcmUoZSk7XHJcblx0XHRcdHRoaXMuaGlkZSgpO1xyXG5cdCAgICB9KTtcclxuXHR9XHJcblx0LyoqXHJcbiAgICAgKiDorr7nva5hbGVydOWGheWuueWMuuWFt+aciVtub2RlPVwiY29udGVudFwiXeWxnuaAp+eahOiKgueCueeahGh0bWxcclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBodG1sXHJcbiAgICAgKi9cclxuXHRzZXRNeUNvbnRlbnQoaHRtbCkge1xyXG5cdFx0aWYodHlwZW9mIGh0bWwgPT0gJ3N0cmluZycgJiYgdGhpcy5jb250ZW50bm9kZS5sZW5ndGggPiAwKXtcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50bm9kZS5odG1sKGh0bWwpO1xyXG4gICAgICAgIH1cclxuXHR9XHJcblx0LyoqXHJcblx0ICog57uE5Lu26ZSA5q+BXHJcblx0ICovXHJcblx0ZGVzdHJveSgpIHtcclxuXHRcdHRoaXMubGF5ZXIub2ZmKCdjbGljay5saWInLCAnLmpzLW9rJyk7XHJcblx0XHRzdXBlci5kZXN0cm95KCk7XHJcblx0XHR0aGlzLmNvbnRlbnRub2RlID0gbnVsbDtcclxuXHRcdHRoaXMub2tjYWwgPSBudWxsO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBbGVydDtcclxuIiwi77u/LyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcgYWxlcnTnmoTlt6XljoLmjqfliLblmajvvIznu6fmib9iYXNlQ29udHJvbFxyXG4gKiDlupTnlKjlnLrmma/vvJrpkojlr7nnroDljZVhbGVydOW8ueWxgu+8jOmikee5geabtOaUueW8ueWxgumHjOafkOS6m+iKgueCueeahOWGheWuue+8jOS7peWPiuabtOaUueeCueWHu1wi56Gu5a6aXCLmjInpkq7lkI7nmoTlm57osIPkuovku7ZcclxuICog5aaC5p6c5piv5pu05aSN5p2C55qE5Lqk5LqS5bu66K6u5L2/55SobGF5ZXJzLmFsZXJ05oiWbGF5ZXJzLmJvbWJMYXllclxyXG4gKiBAdmVyc2lvbiAxLjAuMCB8IDIwMTYtMDEtMjYg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQGV4YW1wbGVcclxuICogY29uc3QgQWxlcnRDb250cm9sID0gcmVxdWlyZSgnbGlibGF5ZXItYWxlcnRDb250cm9sJyk7XHJcbiAqXHJcblx0XHR2YXIgY3VybGF5ZXIgPSBuZXcgQWxlcnRDb250cm9sKCk7XHJcblx0XHRjdXJsYXllci5zZXRjb25maWcoe1xyXG5cdFx0XHRhbGVydDoge1xyXG5cdFx0XHRcdGZyYW1ldHBsOiBbXHJcblx0XHRcdFx0ICAgICc8ZGl2IGNsYXNzPVwianMtdGl0bGVcIj48L2Rpdj4nLFxyXG5cdFx0XHRcdFx0JzxkaXYgY2xhc3M9XCJqcy1jb250ZW50XCI+PC9kaXY+JyxcclxuXHRcdFx0XHRcdCc8ZGl2PjxhIGhyZWY9XCJqYXZhc2NyaXB0OjtcIiBjbGFzcz1cImpzLW9rXCI+5aW955qEPC9hPjwvZGl2PidcclxuXHRcdFx0XHRdLmpvaW4oJycpXHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0Y3VybGF5ZXIuc2hvdyh7XHJcbiAgICAgICAgICAgIGNvbnRlbnQ6ICfmgqjov5jmnKrnmbvpmYYnXHJcbiAgICAgICAgfSx7XHJcbiAgICAgICAgICAgIG9rOiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+eCueWHu+WlveeahCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY3VybGF5ZXIuZ2V0bGF5ZXJvYmooKe+8myAvL2xheWVyL2FsZXJ057G75a+56LGhXHJcbiAqICovXHJcbiBjb25zdCBBbGVydCA9IHJlcXVpcmUoJy4vYWxlcnQuanMnKSxcclxuICAgICAgIEJhc2VDb250cm9sID0gcmVxdWlyZSgnLi9iYXNlQ29udHJvbC5qcycpO1xyXG5cclxuLyoqXHJcbiogYWxlcnTlt6XljoLmjqfliLblmahcclxuKi9cclxuY2xhc3MgQWxlcnRDb250cm9sIGV4dGVuZHMgQmFzZUNvbnRyb2wge1xyXG4gICAgY29uc3RydWN0b3IoaGlkZWRlc3Ryb3kpIHtcclxuICAgICAgICBzdXBlcihoaWRlZGVzdHJveSk7XHJcbiAgICAgICAgdGhpcy5fb2tjYWwgPSBmdW5jdGlvbigpe307IC8v54K55Ye7b2vnmoTlm57osIPnp4HmnInlrZjlgqjlmahcclxuXHRcdHRoaXMuX2Z1bmFyciA9IFsnb2snXTsgLy/lj6/mjqfliLbnmoTlm57osIPmlrnms5XlkI1cclxuICAgIH1cclxuICAgIC8qKlxyXG5cdCAqIOiOt+WPlmFsZXJ05by55bGCXHJcblx0ICogQHBhcmFtIHtCb29sZWFufSByZXNldCDmmK/lkKbph43mlrDmuLLmn5PmqKHmnb/jgILpu5jorqTkuLpmYWxzZVxyXG5cdCAqL1xyXG4gICAgZ2V0bGF5ZXJvYmoocmVzZXQpe1xyXG5cdFx0aWYodGhpcy5fbGF5ZXJvYmogPT0gbnVsbCl7XHJcblx0XHRcdHRoaXMuX2xheWVyb2JqID0gbmV3IEFsZXJ0KHRoaXMuX2RlZmF1bHRvcHQpO1xyXG5cdFx0XHR0aGlzLl9sYXllcm9iai5va2NhbC5hZGQoKGUpID0+IHtcclxuXHRcdFx0XHR0aGlzLl9va2NhbCgpO1xyXG5cdFx0XHR9KTtcclxuICAgICAgICAgICAgdGhpcy5fYWRkY2FsbCgpO1xyXG5cdFx0fWVsc2V7XHJcbiAgICAgICAgICAgIGlmKHJlc2V0KXtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2xheWVyb2JqLnNldENvbnRlbnQodGhpcy5fZGVmYXVsdG9wdC5hbGVydC5mcmFtZXRwbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblx0XHRyZXR1cm4gdGhpcy5fbGF5ZXJvYmo7XHJcbiAgICB9XHJcbiAgICAvKipcclxuXHQgKiDplIDmr4FhbGVydOW8ueWxglxyXG5cdCAqL1xyXG4gICAgZGVzdHJveSgpe1xyXG4gICAgICAgIHN1cGVyLmRlc3Ryb3koKTtcclxuICAgICAgICB0aGlzLl9va2NhbCA9IGZ1bmN0aW9uKCl7fTtcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBbGVydENvbnRyb2w7XHJcbiIsIu+7vy8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IGFsZXJ057G75Y2V5L2T5o6n5Yi25Zmo77yM5LiA6Iis55So5LqO566A5Y2V55qEY29uZmlybeS/oeaBr+aPkOekuuOAglxyXG4gKiDms6jmhI/vvJror6VhbGVydOaOp+WItueahOWvueixoeWPimRvbeWcqOWFqOWxgOS4reWUr+S4gOWtmOWcqO+8jOWmguaenOaDs+imgeWIm+W7uuWkmuS4qu+8jOivt+S9v+eUqGxpYmxheWVycy9hbGVydOaIlmxpYmxheWVycy9hbGVydENvbnRyb2xcclxuICogQHZlcnNpb24gMS4wLjAgfCAyMDE1LTA5LTE0IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEBleGFtcGxlXHJcbiAqICAgICAgY29uc3QgQWxlcnRTaW5nbGUgPSByZXF1aXJlKCdsaWJsYXllci1hbGVydFNpbmdsZScpO1xyXG4gKlxyXG5cdFx0QWxlcnRTaW5nbGUuc2V0Y29uZmlnKHtcclxuXHRcdFx0YWxlcnQ6IHtcclxuXHRcdFx0XHRmcmFtZXRwbDogW1xyXG5cdFx0XHRcdCAgICAnPGRpdiBjbGFzcz1cImpzLXRpdGxlXCI+PC9kaXY+JyxcclxuXHRcdFx0XHRcdCc8ZGl2IGNsYXNzPVwianMtY29udGVudFwiPjwvZGl2PicsXHJcblx0XHRcdFx0XHQnPGRpdj48YSBocmVmPVwiamF2YXNjcmlwdDo7XCIgY2xhc3M9XCJqcy1va1wiPuWlveeahDwvYT48L2Rpdj4nXHJcblx0XHRcdFx0XS5qb2luKCcnKVxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdEFsZXJ0U2luZ2xlLmdldGxheWVyb2JqKCnvvJsgLy9sYXllci9hbGVydOexu+WvueixoVxyXG5cdFx0QWxlcnRTaW5nbGUuc2hvdyh7XHJcbiAgICAgICAgICAgIGNvbnRlbnQ6ICfmgqjov5jmnKrnmbvpmYYnXHJcbiAgICAgICAgfSx7XHJcbiAgICAgICAgICAgIG9rOiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+eCueWHu+WlveeahCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAqICovXHJcblxyXG5jb25zdCBBbGVydENvbnRyb2wgPSByZXF1aXJlKCcuL2FsZXJ0Q29udHJvbC5qcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBuZXcgQWxlcnRDb250cm9sKCk7XHJcbiIsIu+7vy8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IOWfuuacrOeahOW8ueWxguW3peWOguaOp+WItuWZqO+8jOS4jeWPr+ebtOaOpeS9v+eUqO+8jOWPquWPr+WtkOexu+e7p+aJv+WQjuS9v+eUqOOAglxyXG4gKiDlupTnlKjlnLrmma/vvJrpkojlr7npopHnuYHmm7TmlLnlvLnlsYLph4zmn5DkupvoioLngrnnmoTlhoXlrrnvvIzku6Xlj4rmm7TmlLnngrnlh7vmjInpkq7lkI7nmoTlm57osIPkuovku7bjgIJcclxuICogQHZlcnNpb24gMS4wLjAgfCAyMDE2LTAxLTI2IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEBleGFtcGxlXHJcbiAqICAgICAgY29uc3QgQmFzZUNvbnRyb2wgPSByZXF1aXJlKCdsaWJsYXllci1iYXNlQ29udHJvbCcpO1xyXG4gKlxyXG4gKiAqL1xyXG5cclxuIGNvbnN0IFRvb2wgPSByZXF1aXJlKCdsaWJ1dGlsLXRvb2wnKTtcclxuXHJcbiBjbGFzcyBCYXNlQ29udHJvbCB7XHJcbiAgICAgLyoqXHJcbiAgICAgICog5bel5Y6C5qih5Z6L5o6n5Yi25ZmoXHJcbiAgICAgICogQHBhcmFtIHtCb29sZWFufSBoaWRlZGVzdHJveSDlvLnlsYLlhbPpl63ml7bvvIzmmK/lkKbotbDns7vnu5/pu5jorqTnmoTplIDmr4Hmk43kvZzjgILpu5jorqTkuLp0cnVlXHJcbiAgICAgICovXHJcbiAgICAgY29uc3RydWN0b3IoaGlkZWRlc3Ryb3kpe1xyXG4gICAgICAgICB0aGlzLl9sYXllcm9iaiA9IG51bGw7IC8v5by55bGC5a+56LGhXHJcbiBcdFx0IHRoaXMuX2RlZmF1bHRvcHQgPSB7fTsgLy/pu5jorqRjb25maWfphY3nva7lj4LmlbBcclxuIFx0XHQgdGhpcy5fZnVuYXJyID0gW107IC8v5Lya5pu/5o2i55qE5Zue6LCD5pa55rOV55qE5YWz6ZSu6K+N44CC5aaCWydvaycsJ2NhbmNlbCddXHJcbiAgICAgICAgIHRoaXMuY3JlYXRlY2FsID0gJC5DYWxsYmFja3MoKTsgLy/lvLnlsYLlr7nosaHliJvlu7rlkI7nmoTlm57osINcclxuICAgICAgICAgaWYodHlwZW9mIGhpZGVkZXN0cm95ICE9ICdib29sZWFuJyl7XHJcbiAgICAgICAgICAgICBoaWRlZGVzdHJveSA9IHRydWU7XHJcbiAgICAgICAgIH1cclxuICAgICAgICAgdGhpcy5oaWRlZGVzdHJveSA9IGhpZGVkZXN0cm95O1xyXG4gICAgIH1cclxuICAgICAvKipcclxuIFx0ICogIOWPguaVsOivtOaYjuivt+WPguingeWtkOexu+S9v+eUqOeahOW8ueWxguexu+mHjOmdoueahGNvbmZpZ+ivtOaYjlxyXG4gXHQgKiAg5aaCYWxlcnQuanPjgIJjb25maXJtLmpzXHJcbiBcdCAqL1xyXG4gICAgIHNldGNvbmZpZyhjb25maWcpe1xyXG4gICAgICAgICB0aGlzLl9kZWZhdWx0b3B0ID0gY29uZmlnO1xyXG4gICAgIH1cclxuICAgICAvKipcclxuIFx0ICog6I635Y+W5by55bGC5a+56LGh77yM5YW35L2T55Sx5a2Q57G75a6e546wXHJcbiBcdCAqL1xyXG4gICAgIGdldGxheWVyb2JqKCl7XHJcblxyXG4gICAgIH1cclxuICAgICAvKipcclxuIFx0ICog5re75Yqg57O757uf5Zue6LCD77yM55Sx5a2Q57G75Yib5bu65LqG5by55bGC5a+56LGh5ZCO6LCD55SoXHJcbiBcdCAqL1xyXG4gICAgIF9hZGRjYWxsKCl7XHJcbiAgICAgICAgIGlmKHRoaXMuaGlkZWRlc3Ryb3kpe1xyXG4gICAgICAgICAgICAgdGhpcy5fbGF5ZXJvYmouaGlkZWFmdGVyY2FsLmFkZCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgdGhpcy5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgfVxyXG4gICAgICAgICB0aGlzLmNyZWF0ZWNhbC5maXJlKHRoaXMuX2xheWVyb2JqKTtcclxuICAgICB9XHJcbiAgICAgLyoqXHJcbiBcdCAqIOaYvuekuuW8ueWxglxyXG4gXHQgKiBAcGFyYW0ge09iamVjdH0gKnR4dCDmlofmoYjphY3nva4s6YCJ5aGr44CC5aaC5p6cc2V0Y29uZmln6LCD55So6K6+572u55qE5qih5p2/5Lit6L+Y5pyJ5YW25LuWbm9kZT1cIuWFtuS7luWAvFwi77yMXHJcbiBcdCAqICAgICAg5aaCbm9kZT1cIm90aGVyXCIg5YiZ5Y+v6Ieq6KGM5omp5bGVXHJcbiBcdCAqIHtcclxuIFx0ICogXHQgY29udGVudCB7U3RyaW5nfSBub2RlPVwiY29udGVudFwi6IqC54K56YeM6Z2i55qEaHRtbFxyXG4gXHQgKiAgIHRpdGxlIHtTdHJpbmd9IG5vZGU9XCJ0aXRsZVwi6IqC54K56YeM6Z2i55qEaHRtbFxyXG4gXHQgKiAgIG9rIHtTdHJpbmd9IG5vZGU9XCJva1wi6IqC54K56YeM6Z2i55qEaHRtbFxyXG4gXHQgKiB9XHJcbiBcdCAqIEBwYXJhbSB7T2JqZWN0fSBjYWwg5Zue6LCD6YWN572uXHJcbiBcdCAqIHtcclxuIFx0ICogXHQg6ZSu5YC85Li6X2Z1bmFycuS4rei3neemu+eahOWFs+mUruivjSB7RnVuY3Rpb259IOeCueWHu+ehruWumuaMiemSruWQjueahOWbnuiwg1xyXG4gXHQgKiB9XHJcbiBcdCAqL1xyXG4gXHQgc2hvdyh0eHQsY2FsKXtcclxuICAgICAgICAgaWYoIVRvb2wuaXNPYmplY3QodHh0KSl7XHJcbiBcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ2Jhc2VDb250cm9sLXNob3fmlrnms5V0eHTlj4LmlbDlv4XpobvmmK9qc29u5a+56LGhJyk7XHJcbiBcdFx0fWVsc2V7XHJcbiBcdFx0XHRpZihUb29sLmlzT2JqZWN0KGNhbCkpe1xyXG4gXHRcdFx0XHR2YXIgZnVubmFtZSA9IHRoaXMuX2Z1bmFycjtcclxuIFx0XHRcdFx0Zm9yKHZhciBjdXJuYW1lIG9mIGZ1bm5hbWUpe1xyXG4gXHRcdFx0XHRcdGlmKFRvb2wuaXNGdW5jdGlvbihjYWxbY3VybmFtZV0pKXtcclxuIFx0XHRcdFx0XHRcdHRoaXNbJ18nK2N1cm5hbWUrJ2NhbCddID0gY2FsW2N1cm5hbWVdO1xyXG4gXHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0XHRlbHNle1xyXG4gXHRcdFx0XHRcdFx0dGhpc1snXycrY3VybmFtZSsnY2FsJ10gPSBmdW5jdGlvbigpe307XHJcbiBcdFx0XHRcdFx0fVxyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHR9ZWxzZXtcclxuIFx0XHRcdFx0dGhpcy5fb2tjYWwgPSBmdW5jdGlvbigpe307XHJcbiBcdFx0XHR9XHJcbiBcdFx0XHQvL+iOt+WPlnR4dOmHjOmdoueahOmUruWAvFxyXG4gXHRcdFx0dmFyIG5vZGVuYW1lYXJyID0gW107XHJcbiBcdFx0XHRmb3IodmFyIG5hbWUgaW4gdHh0KXtcclxuIFx0XHRcdFx0bm9kZW5hbWVhcnIucHVzaChuYW1lKTtcclxuIFx0XHRcdH1cclxuIFx0XHRcdHRoaXMuZ2V0bGF5ZXJvYmoodHJ1ZSk7XHJcbiBcdFx0XHR2YXIgbm9kZWFyciA9IHRoaXMuX2xheWVyb2JqLmdldE5vZGVzKG5vZGVuYW1lYXJyKTtcclxuIFx0XHRcdGZvcih2YXIgbmFtZSBpbiBub2RlYXJyKXtcclxuIFx0XHRcdFx0VG9vbC5pc1N0cmluZyh0eHRbbmFtZV0pICYmIG5vZGVhcnJbbmFtZV0uaHRtbCh0eHRbbmFtZV0pO1xyXG4gXHRcdFx0fVxyXG4gXHRcdFx0dGhpcy5fbGF5ZXJvYmouc2hvdygpO1xyXG4gXHRcdH1cclxuICAgICB9XHJcbiAgICAgLyoqXHJcbiAgICAgICog6ZSA5q+B5by55bGCXHJcbiAgICAgICovXHJcbiAgICAgZGVzdHJveSgpe1xyXG4gICAgICAgICBpZih0aGlzLl9sYXllcm9iaiAhPSBudWxsKXtcclxuIFx0XHRcdHRoaXMuX2xheWVyb2JqLmRlc3Ryb3koKTtcclxuIFx0XHRcdHRoaXMuX2xheWVyb2JqID0gbnVsbDtcclxuIFx0XHR9XHJcbiAgICAgfVxyXG4gfVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCYXNlQ29udHJvbDtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcg5by55bGC57G777yM57un5om/6IeqbGF5ZXIvbGF5ZXLjgILpu5jorqTlsYXkuK3lrprkvY3vvIzmmL7npLrpga7nvanjgILvvIjlpoLmnpzpnIDlhbbku5bnibnmrorphY3nva7liJnlj4Lop4Hlj4LmlbDor7TmmI7vvIlcclxuICog5aaC5p6c5by55bGC5Lit5pyJ5Lul5LiL5bGe5oCn55qE6IqC54K5bm9kZT1cImNsb3NlXCLjgILliJnngrnlh7vor6XoioLngrnkvJrlhbPpl63lvLnlsYLvvIzlubbop6blj5FoaWRlY2Fs6YCa55+l44CCXHJcbiAqIEB2ZXJzaW9uIDEuMC4wIHwgMjAxNS0wOS0xNCDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAZXhhbXBsZVxyXG4gKiBcdCBjb25zdCBCb21iTGF5ZXIgPSByZXF1aXJlKCdsaWJsYXllci1ib21iTGF5ZXInKTtcclxuICpcclxuICogICB2YXIgbGF5ZXIgPSBuZXcgQm9tYkxheWVyKCk7XHJcbiAqICAgIGxheWVyLnNob3diZWZvcmVjYWwuYWRkKGZ1bmN0aW9uKCl7Y29uc29sZS5sb2coJ+WxguaYvuekuuWJjScpO30pO1xyXG4gKiAgIGxheWVyLmhpZGViZWZvcmVjYWwuYWRkKGZ1bmN0aW9uKCl7Y29uc29sZS5sb2coJ+WxgumakOiXj+WJjScpO30pO1xyXG4gKiAgIGxheWVyLnNob3dhZnRlcmNhbC5hZGQoZnVuY3Rpb24oKXtjb25zb2xlLmxvZygn5bGC5pi+56S65ZCOJyk7fSk7XHJcbiAqICAgbGF5ZXIuaGlkZWFmdGVyY2FsLmFkZChmdW5jdGlvbigpe2NvbnNvbGUubG9nKCflsYLpmpDol4/lkI4nKTt9KTtcclxuICogICBsYXllci5wb3MucG9zY2FsLmFkZChmdW5jdGlvbigpe2NvbnNvbGUubG9nKCdsYXllcuWumuS9jeWQjuWbnuiwgycpfSk7XHJcbiAqICAgbGF5ZXIuc2V0Q29udGVudCgnPGRpdiBjbGFzcz1cImpzLWNvbnRlbnRcIj48L2Rpdj4nKTsgLy/orr7nva5sYXllcuWxgumHjOmdoueahOWGheWuuVxyXG4gKiAgIGxheWVyLmdldE5vZGVzKFsnY29udGVudCddKTsgLy8g6I635Y+WY2xhc3M9XCJqcy1jb250ZW50XCLnmoToioLngrlcclxuICogICBsYXllci5zaG93KCk7IC8v5pi+56S65bGCXHJcbiAqICAgbGF5ZXIuaGlkZSgpOyAvL+makOiXj+WxglxyXG4gKiAgIGxheWVyLmxheWVyOyAvL+WxgmRvbeiKgueCueWvueixoVxyXG4gKiAgIGxheWVyLmNvbnRhaW5lcjsgLy/mta7lsYLlrrnlmahcclxuICogICBsYXllci5kZXN0cm95KCk7IC8v6ZSA5q+B5bGCXHJcbiAqXHJcbiAqICovXHJcblxyXG4gY29uc3QgTGF5ZXIgPSByZXF1aXJlKCcuL2xheWVyLmpzJyksXHJcbiBcdCAgIE1hc2sgPSByZXF1aXJlKCcuL21hc2suanMnKSxcclxuXHQgICBQb3NpdGlvbkJvbWIgPSByZXF1aXJlKCcuL3Bvc2l0aW9uQm9tYi5qcycpLFxyXG5cdCAgIFRvb2wgPSByZXF1aXJlKCdsaWJ1dGlsLXRvb2wnKTtcclxuXHJcbmNsYXNzIEJvbWJMYXllciBleHRlbmRzIExheWVyIHtcclxuXHQvKipcclxuXHQgKiDlvLnlsYLnsbvigJTigJTliJvlu7rlubbmt7vliqDliLDmjIflrprlrrnlmajkuK1cclxuICAgICAqIEBwYXJhbSB7SlNPTn0gY29uZmlnIOW8ueWxgumFjee9ruWPguaVsCDvvIzkuI3mmK/lv4XloavpoblcclxuICAgICAqIFx0XHR7XHJcbiAgICAgKiBcdCAgICAgICBjb250YWluZXIge0VsZW1lbnR9IOWtmOaUvuW8ueWxgueahOWuueWZqOOAguWPr+S4jeaMh+Wumu+8jOm7mOiupOW8ueWxguWtmOaUvuS6jmJvZHnkuK3nmoTkuIDkuKrliqjmgIHnlJ/miJDnmoRkaXbph4xcclxuICAgICAqIFx0ICAgICAgIHBvczp7fSwgLy/lrprkvY3lj4LmlbDvvIzlhbfkvZPor7TmmI7lj6/op4Hmlrnms5VsYXllci9wb3NpdGlvbkJvbWLkuK3nmoRjb25maWfor7TmmI5cclxuICAgICAqICAgICAgICAgbGF5ZXI6IHt9LCAvL+W8ueWxguS/oeaBr+WPguaVsO+8jOWFt+S9k+ivtOaYjuWPr+ingeaWueazlWxheWVyL2xheWVy5Lit55qEY29uZmln6K+05piOXHJcbiAgICAgKiBcdFx0ICAgbWFzazogeyAvL+mBrue9qeS/oeaBr+WPguaVsO+8jOWFt+S9k+ivtOaYjuWPr+ingeaWueazlWxheWVyL21hc2vkuK3nmoRjb25maWfor7TmmI7jgILlnKjmraTln7rnoYDkuIrov5vooYzku6XkuIvmianlsZVcclxuICAgICAqIFx0XHRcdCAgbWFzazogdHJ1ZSwgLy/mmK/lkKbliJvlu7rpga7nvalcclxuICAgICAqICAgICAgICAgICAgY21saGlkZTogZmFsc2UgLy/ngrnlh7vpga7nvanmmK/lkKblhbPpl63lvLnlsYJcclxuICAgICAqICAgICAgICAgICAgLy/lhbbku5bmn6XnnIttYXNrLmpz5Lit55qE6YWN572uXHJcbiAgICAgKiBcdFx0ICAgfVxyXG4gICAgICogICAgICB9XHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IoY29uZmlnKSB7XHJcbiAgICAgICAgdmFyIF9uZXdjb250YWluZXIgPSBmYWxzZTtcclxuXHRcdGlmKCFjb25maWcuY29udGFpbmVyIHx8IGNvbmZpZy5jb250YWluZXIubGVuZ3RoID09IDApe1xyXG5cdFx0XHRjb25maWcuY29udGFpbmVyID0gJCgnPGRpdj48L2Rpdj4nKS5hcHBlbmRUbygnYm9keScpO1xyXG5cdFx0XHRfbmV3Y29udGFpbmVyID0gdHJ1ZTsgLy/or7TmmI7mmK/mlrDliJvlu7rnmoTlrrnlmahcclxuXHRcdH1cclxuXHRcdGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcclxuXHRcdC8v5Yid5aeL5YyW5Z+657G7XHJcblx0XHRzdXBlcihjb25maWcuY29udGFpbmVyLGNvbmZpZy5sYXllcik7XHJcbiAgICAgICAgdGhpcy5fbmV3Y29udGFpbmVyID0gX25ld2NvbnRhaW5lcjtcclxuXHRcdC8v5Yib5bu65a6a5L2N57G75a+56LGhXHJcblx0XHR0aGlzLnBvcyA9IG5ldyBQb3NpdGlvbkJvbWIoe1xyXG5cdFx0XHRsYXllcjogdGhpcy5sYXllclxyXG5cdFx0fSxjb25maWcucG9zKTtcclxuXHRcdC8v5Yib5bu66YGu572pXHJcblx0XHR2YXIgbWFza29wdCA9ICQuZXh0ZW5kKHRydWUse1xyXG5cdFx0XHRtYXNrOiB0cnVlLFxyXG5cdFx0XHRjbWxoaWRlOiBmYWxzZVxyXG5cdFx0fSxjb25maWcubWFzayk7XHJcblx0XHRpZihtYXNrb3B0Lm1hc2speyAvL+WmguaenOWIm+W7uumBrue9qVxyXG5cdFx0XHR0aGlzLm1hc2sgPSBuZXcgTWFzayhjb25maWcuY29udGFpbmVyLG1hc2tvcHQpO1xyXG5cdFx0XHRpZihtYXNrb3B0LmNtbGhpZGUpeyAvL+eCueWHu+mBrue9qeWFs+mXrVxyXG5cdFx0XHRcdHRoaXMubWFzay5jbGlja2NhbC5hZGQoKGUpID0+IHtcclxuXHRcdFx0XHRcdHRoaXMuaGlkZSgpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHQvL+S6i+S7tue7keWumlxyXG5cdFx0dGhpcy5sYXllci5vbignY2xpY2subGliJywgJy5qcy1jbG9zZScsIChlKSA9PiB7XHJcblx0ICAgIFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdCAgICBcdHRoaXMuaGlkZSgpO1xyXG5cdCAgICB9KTtcclxuXHR9XHJcblx0LyoqXHJcblx0ICog6I635Y+WYWxlcnTkuK3lhbfmnIlub2RlPSfmjIflrprlkI3np7An55qE6IqC54K55YiX6KGo44CC5aaC5p6cbm9kZW5hbWVhcnLkuK3mjIflrprnmoToioLngrnkuI3lrZjlnKjvvIzliJnkuI3lnKjnu5PmnpzkuK3ov5Tlm57jgILkuL7kvotcclxuICAgICAqIEBwYXJhbSB7QXJyYXl9IG5vZGVuYW1lYXJyIOWmglsnY29udGVudCcsJ29rJ11cclxuICAgICAqIEByZXR1cm4ge1xyXG4gICAgICogXHQgICBjb250ZW50OiDojrflj5bnmoToioLngrlcclxuICAgICAqICAgICBvazog6I635Y+W55qE6IqC54K5XHJcbiAgICAgKiB9XHJcbiAgICAgKiDlpoLmnpxjb250ZW505LiN5a2Y5Zyo77yM5YiZ5Y+q6L+U5Zuee29rfVxyXG5cdCAqL1xyXG5cdGdldE5vZGVzKG5vZGVuYW1lYXJyKXtcclxuXHRcdHZhciByZXN1bHQgPSB7fSwgdGhhdCA9IHRoaXM7XHJcblx0XHRpZihUb29sLmlzQXJyYXkobm9kZW5hbWVhcnIpKXtcclxuXHRcdFx0JC5lYWNoKG5vZGVuYW1lYXJyLChpbmRleCxuYW1lKSA9PiB7XHJcblx0XHRcdFx0dmFyIG5vZGUgPSB0aGlzLmxheWVyLmZpbmQoJy5qcy0nK25hbWUpO1xyXG5cdFx0XHRcdGlmKG5vZGUubGVuZ3RoID4gMCl7XHJcblx0XHRcdFx0XHRyZXN1bHRbbmFtZV0gPSBub2RlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiDmmL7npLrlvLnlsYJcclxuXHQgKi9cclxuXHRzaG93KCl7XHJcblx0XHRpZighdGhpcy5pc3Nob3coKSl7XHJcblx0XHRcdHRoaXMuc2hvd2JlZm9yZWNhbC5maXJlKCk7IC8v5bGC5pi+56S65YmN5Zue6LCDXHJcblx0XHRcdHRoaXMubWFzayAmJiB0aGlzLm1hc2suc2hvdygpO1xyXG5cdFx0XHR0aGlzLl9zaG93KCk7XHJcblx0XHRcdHRoaXMucG9zLnNldHBvcygpO1xyXG5cdFx0XHR0aGlzLnNob3dhZnRlcmNhbC5maXJlKCk7IC8v5bGC5pi+56S65ZCO5Zue6LCDXHJcblx0XHR9XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIOmakOiXj+W8ueWxglxyXG5cdCAqL1xyXG5cdGhpZGUoKXtcclxuXHRcdGlmKHRoaXMuaXNzaG93KCkpe1xyXG5cdFx0XHR0aGlzLmhpZGViZWZvcmVjYWwuZmlyZSgpOyAvL+WxgumakOiXj+WJjeWbnuiwg1xyXG5cdFx0XHR0aGlzLm1hc2sgJiYgdGhpcy5tYXNrLmhpZGUoKTtcclxuXHRcdFx0dGhpcy5faGlkZSgpO1xyXG5cdFx0XHR0aGlzLmhpZGVhZnRlcmNhbC5maXJlKCk7IC8v5bGC6ZqQ6JeP5ZCO5Zue6LCDXHJcblx0XHR9XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIOW8ueWxgumUgOavgVxyXG5cdCAqL1xyXG5cdGRlc3Ryb3koKXtcclxuXHRcdHRoaXMubGF5ZXIub2ZmKCdjbGljay5saWInLCAnLmpzLWNsb3NlJyk7XHJcblx0XHRpZih0aGlzLl9uZXdjb250YWluZXIpe1xyXG5cdFx0XHR0aGlzLmNvbnRhaW5lci5yZW1vdmUoKTtcclxuXHRcdH1cclxuXHRcdHN1cGVyLmRlc3Ryb3koKTtcclxuXHRcdHRoaXMucG9zLmRlc3Ryb3koKTtcclxuXHRcdGlmKHRoaXMubWFzayl7XHJcbiAgICAgICAgICAgIHRoaXMubWFzay5kZXN0cm95KCk7XHJcbiAgICAgICAgfVxyXG5cdFx0dGhpcy5fbmV3Y29udGFpbmVyID0gbnVsbDtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQm9tYkxheWVyO1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyBjb25maXJt57G777yM57un5om/6IeqbGF5ZXIvYm9tYkxheWVy44CC5re75Yqg4oCc56Gu5a6a5oyJ6ZKu4oCd5ZKM4oCc5Y+W5raI5oyJ6ZKu4oCd5LqL5Lu25Zue6LCDXHJcbiAqIOWmguaenOW8ueWxguS4reacieS7peS4i+WxnuaAp+eahOiKgueCuVxyXG4gKiBub2RlPVwiY2xvc2VcIu+8jOeCueWHu+WImeS8muWFs+mXreW8ueWxgizlubbop6blj5FoaWRlY2Fs6YCa55+l44CCXHJcbiAqIG5vZGU9XCJva1wi77yM54K55Ye75YiZ6Kem5Y+R4oCc56Gu5a6a5oyJ6ZKu4oCd5LqL5Lu277yM5YWz6Zet5by55bGC77yM5bm26Kem5Y+Rb2tjYWzlkoxoaWRlY2Fs6YCa55+l44CCXHJcbiAqIG5vZGU9XCJjYW5jZWxcIiDngrnlh7vop6blj5HigJzlj5bmtojmjInpkq7igJ3kuovku7bvvIzlhbPpl63lvLnlsYLvvIzlubbop6blj5FjYW5jZWxjYWzlkoxoaWRlY2Fs6YCa55+l44CCXHJcbiAqIEB2ZXJzaW9uIDEuMC4wIHwgMjAxNS0wOS0xNiDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAZXhhbXBsZVxyXG4gKiBcdCBjb25zdCBDb25maXJtID0gcmVxdWlyZSgnbGlibGF5ZXItY29uZmlybScpO1xyXG4gKlxyXG4gKiBcdCB2YXIgbGF5ZXIgPSBuZXcgQ29uZmlybSh7XHJcbiAqIFx0IFx0Y29uZmlybToge1xyXG4gKiBcdFx0XHRmcmFtZXRwbDogWyAvL+W8ueWxguWfuuacrOaooeadv1xyXG5cdFx0XHRcdCc8ZGl2IGNsYXNzPVwianMtdGl0bGVcIj48L2Rpdj4nLFxyXG5cdFx0XHRcdCc8ZGl2IGNsYXNzPVwianMtY29udGVudFwiPjwvZGl2PicsXHJcblx0XHRcdFx0JzxkaXY+PGEgaHJlZj1cImphdmFzY3JpcHQ6O1wiIGNsYXNzPVwianMtb2tcIj7lpb3nmoQ8L2E+PGEgaHJlZj1cImphdmFzY3JpcHQ6O1wiIGNsYXNzPVwianMtY2FuY2VsXCI+562J5LiL6K+0PC9hPjwvZGl2PidcclxuXHRcdFx0XS5qb2luKCcnKVxyXG4gKiAgICAgIH1cclxuICogICB9KTtcclxuICogICBsYXllci5zaG93Y2FsLmFkZChmdW5jdGlvbih0eXBlKXtzd2l0Y2godHlwZSl7Y2FzZSAnYmVmb3JlJzpjb25zb2xlLmxvZygn5bGC5pi+56S65YmNJyk7YnJlYWs7IGNhc2UgJ2FmdGVyJzpjb25zb2xlLmxvZygn5bGC5pi+56S65ZCOJyk7YnJlYWs7fX0pO1xyXG4gKiAgIGxheWVyLmhpZGVjYWwuYWRkKGZ1bmN0aW9uKHR5cGUpe3N3aXRjaCh0eXBlKXtjYXNlICdiZWZvcmUnOmNvbnNvbGUubG9nKCflsYLpmpDol4/liY0nKTticmVhazsgY2FzZSAnYWZ0ZXInOmNvbnNvbGUubG9nKCflsYLpmpDol4/lkI4nKTticmVhazt9fSk7XHJcbiAqICAgbGF5ZXIub2tjYWwuYWRkKGZ1bmN0aW9uKGUpe2NvbnNvbGUubG9nKCfngrnlh7vkuobnoa7lrponKX0pO1xyXG4gKiAgIGxheWVyLmNhbmNlbGNhbC5hZGQoZnVuY3Rpb24oZSl7Y29uc29sZS5sb2coJ+eCueWHu+S6huWPlua2iCcpfSk7XHJcbiAqICAgbGF5ZXIuc2V0TXlDb250ZW50KCforr7nva5ub2RlPVwiY29udGVudFwi6IqC54K555qEaW5uZXJIVE1MJyk7XHJcbiAqICAgdmFyIG5vZGVBcnIgPSBsYXllci5nZXROb2RlcyhbJ3RpdGxlJ10pOyAvLyDojrflj5ZjbGFzcz1cImpzLXRpdGxlXCLnmoToioLngrlcclxuICogICBub2RlQXJyLnRpdGxlLmh0bWwoJ+WGheWuueWMumh0bWwnKTtcclxuICogICBsYXllci5jb250ZW50bm9kZTsgLy/lhoXlrrnljLpub2RlPVwiY29udGVudFwi6IqC54K5XHJcbiAqICAgbGF5ZXIuc2hvdygpOyAvL+aYvuekuuWxglxyXG4gKiAgIGxheWVyLmhpZGUoKTsgLy/pmpDol4/lsYJcclxuICogICBsYXllci5sYXllcjsgLy/lsYJkb23oioLngrnlr7nosaFcclxuICogICBsYXllci5jb250YWluZXI7IC8v5rWu5bGC5a655ZmoXHJcbiAqICAgbGF5ZXIuZGVzdHJveSgpOyAvL+mUgOavgeWxglxyXG4gKiAqL1xyXG5jb25zdCBCb21iTGF5ZXIgPSByZXF1aXJlKCcuL2JvbWJMYXllci5qcycpLFxyXG5cdFx0VHBsID0gcmVxdWlyZSgnLi90cGwuanMnKTtcclxuXHJcbmNsYXNzIENvbmZpcm0gZXh0ZW5kcyBCb21iTGF5ZXIge1xyXG5cdC8qKlxyXG5cdCAqIGNvbmZpcm3nsbtcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcg5Y+C5pWw5ZCMbGF5ZXIvYm9tYkxheWVy6YeM6Z2i55qEY29uZmlnLOWcqOatpOWfuuehgOS4iuWinuWKoOWmguS4i+m7mOiupOmFjee9rlxyXG4gICAgICoge1xyXG4gICAgICogXHQgICpjb25maXJtOiB7XHJcbiAgICAgKiBcdFx0ICpmcmFtZXRwbCB7U3RyaW5nfSBjb25maXJt5Z+65pys5qih5p2/44CC6KaB5rGC6K+36K+m6KeBbGF5ZXIvdHBs6YeM6Z2iY29uZmlybemhueeahOimgeaxglxyXG4gICAgICogICAgfVxyXG4gICAgICogfVxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKGNvbmZpZykge1xyXG5cdFx0dmFyIG9wdCA9ICQuZXh0ZW5kKHRydWUse1xyXG5cdFx0XHRjb25maXJtOiB7XHJcblx0XHRcdFx0ZnJhbWV0cGw6IFRwbC5jb25maXJtIC8vY29uZmlybeW8ueWxguWfuuacrOaooeadv+OAguimgeaxguivt+ivpuingWxheWVyL3RwbOmHjOmdomNvbmZpcm3pobnnmoTopoHmsYJcclxuXHRcdFx0fVxyXG5cdFx0fSxjb25maWcpO1xyXG5cdFx0c3VwZXIob3B0KTtcclxuXHRcdHRoaXMuc2V0Q29udGVudChvcHQuY29uZmlybS5mcmFtZXRwbCk7XHJcblx0XHR0aGlzLmNvbnRlbnRub2RlID0gdGhpcy5sYXllci5maW5kKCcuanMtY29udGVudCcpOyAvL+WGheWuueWMuuiKgueCuVxyXG5cdFx0dGhpcy5va2NhbCA9ICQuQ2FsbGJhY2tzKCk7XHJcblx0XHR0aGlzLmNhbmNlbGNhbCA9ICQuQ2FsbGJhY2tzKCk7XHJcblx0XHQvL+S6i+S7tue7keWumlxyXG5cdCAgICB0aGlzLmxheWVyLm9uKCdjbGljay5saWInLCAnLmpzLW9rJywgKGUpID0+IHtcclxuXHQgICAgXHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdHRoaXMub2tjYWwuZmlyZShlKTtcclxuXHQgICAgXHR0aGlzLmhpZGUoKTtcclxuXHQgICAgfSk7XHJcblx0ICAgIHRoaXMubGF5ZXIub24oJ2NsaWNrLmxpYicsICcuanMtY2FuY2VsJywgKGUpID0+IHtcclxuXHQgICAgXHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdHRoaXMuY2FuY2VsY2FsLmZpcmUoZSk7XHJcblx0ICAgIFx0dGhpcy5oaWRlKCk7XHJcblx0ICAgIH0pO1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiDorr7nva5jb25maXJt5YaF5a655Yy65YW35pyJW25vZGU9XCJjb250ZW50XCJd5bGe5oCn55qE6IqC54K555qEaHRtbFxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGh0bWxcclxuXHQgKi9cclxuXHRzZXRNeUNvbnRlbnQoaHRtbCl7XHJcblx0XHRpZih0eXBlb2YgaHRtbCA9PSAnc3RyaW5nJyAmJiB0aGlzLmNvbnRlbnRub2RlLmxlbmd0aCA+IDApe1xyXG5cdFx0XHR0aGlzLmNvbnRlbnRub2RlLmh0bWwoaHRtbCk7XHJcblx0XHR9XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIOe7hOS7tumUgOavgVxyXG5cdCAqL1xyXG5cdGRlc3Ryb3koKXtcclxuXHRcdHRoaXMubGF5ZXIub2ZmKCdjbGljay5saWInLCAnLmpzLW9rJyk7XHJcblx0XHR0aGlzLmxheWVyLm9mZignY2xpY2subGliJywgJy5qcy1jYW5jZWwnKTtcclxuXHRcdHN1cGVyLmRlc3Ryb3koKTtcclxuXHRcdHRoaXMuY29udGVudG5vZGUgPSBudWxsO1xyXG5cdFx0dGhpcy5va2NhbCA9IG51bGw7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbmZpcm07XHJcbiIsIu+7vy8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IGNvbmZpcm3nmoTlt6XljoLmjqfliLblmajvvIzpm4bmiJBiYXNlQ29udHJvbFxyXG4gKiDlupTnlKjlnLrmma/vvJrpkojlr7nnroDljZVjb25maXJt5by55bGC77yM6ZKI5a+56aKR57mB5pu05pS55by55bGC6YeM5p+Q5Lqb6IqC54K555qE5YaF5a6577yM5Lul5Y+K5pu05pS554K55Ye7XCLnoa7lrppcIuOAgVwi5Y+W5raIXCLmjInpkq7lkI7nmoTlm57osIPkuovku7ZcclxuICog5aaC5p6c5piv5pu05aSN5p2C55qE5Lqk5LqS5bu66K6u5L2/55SobGF5ZXJzLmNvbmZpcm3miJZsYXllcnMuYm9tYkxheWVyXHJcbiAqIEB2ZXJzaW9uIDEuMC4wIHwgMjAxNi0wMS0yNiDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAZXhhbXBsZVxyXG4gKiBcdFx0Y29uc3QgQ29uZmlybUNvbnRyb2wgPSByZXF1aXJlKCdsaWJsYXllci1jb25maXJtQ29udHJvbCcpO1xyXG4gKlxyXG5cdFx0dmFyIGN1cmNvbmZpcm0gPSBuZXcgQ29uZmlybUNvbnRyb2woKTtcclxuXHRcdGN1cmNvbmZpcm0uc2V0Y29uZmlnKHtcclxuXHRcdFx0Y29uZmlybToge1xyXG5cdFx0XHRcdGZyYW1ldHBsOiBbXHJcblx0XHRcdFx0XHQnPGRpdiBjbGFzcz1cImpzLWNvbnRlbnRcIj48L2Rpdj4nLFxyXG5cdFx0XHRcdFx0JzxkaXY+PGEgaHJlZj1cImphdmFzY3JpcHQ6O1wiIGNsYXNzPVwianMtb2tcIj7lpb3nmoQ8L2E+PGEgaHJlZj1cImphdmFzY3JpcHQ6O1wiIGNsYXNzPVwianMtY2FuY2VsXCI+562J5LiL6K+0PC9hPjwvZGl2PidcclxuXHRcdFx0XHRdLmpvaW4oJycpXHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0Y3VyY29uZmlybS5zaG93KHtcclxuXHRcdCAgICBjb250ZW50OiAn5oKo6L+Y5pyq55m76ZmGJ1xyXG5cdFx0fSx7XHJcblx0XHQgICAgb2s6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn54K55Ye75aW955qEJyk7XHJcbiAgICAgICAgICAgIH0sXHJcblx0XHRcdGNhbmNlbDogZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRjb25zb2xlLmxvZygn54K55Ye7562J5LiL6K+0Jyk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0Y3VyY29uZmlybS5nZXRsYXllcm9iaigp77ybIC8vbGF5ZXIvY29uZmlybeexu+WvueixoVxyXG4gKiAqL1xyXG5cclxuIGNvbnN0IENvbmZpcm0gPSByZXF1aXJlKCcuL2NvbmZpcm0uanMnKSxcclxuIFx0XHRCYXNlQ29udHJvbCA9IHJlcXVpcmUoJy4vYmFzZUNvbnRyb2wuanMnKTtcclxuXHJcbmNsYXNzIENvbmZpcm1Db250cm9sIGV4dGVuZHMgQmFzZUNvbnRyb2wge1xyXG5cdC8qKlxyXG4gICAgICogY29uZmlybeW3peWOguaOp+WItuWZqFxyXG4gICAgICovXHJcblx0Y29uc3RydWN0b3IoaGlkZWRlc3Ryb3kpIHtcclxuXHRcdHN1cGVyKGhpZGVkZXN0cm95KTtcclxuXHRcdHRoaXMuX29rY2FsID0gZnVuY3Rpb24oKXt9OyAvL+eCueWHu29r55qE5Zue6LCD56eB5pyJ5a2Y5YKo5ZmoXHJcblx0XHR0aGlzLl9jYW5jZWxjYWwgPSBmdW5jdGlvbigpe307IC8v54K55Ye7Y2FuY2Vs55qE5Zue6LCD56eB5pyJ5a2Y5YKo5ZmoXHJcblx0XHR0aGlzLl9mdW5hcnIgPSBbJ29rJywnY2FuY2VsJ107IC8v5Y+v5o6n5Yi255qE5Zue6LCD5pa55rOV5ZCNXHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIOiOt+WPlmNvbmZpcm3lvLnlsYJcclxuXHQgKiBAcGFyYW0ge0Jvb2xlYW59IHJlc2V0IOaYr+WQpumHjeaWsOa4suafk+aooeadv+OAgum7mOiupOS4umZhbHNlXHJcblx0ICovXHJcblx0Z2V0bGF5ZXJvYmoocmVzZXQpe1xyXG5cdFx0aWYodGhpcy5fbGF5ZXJvYmogPT0gbnVsbCl7XHJcblx0XHRcdHRoaXMuX2xheWVyb2JqID0gbmV3IENvbmZpcm0odGhpcy5fZGVmYXVsdG9wdCk7XHJcblx0XHRcdHRoaXMuX2xheWVyb2JqLm9rY2FsLmFkZCgoZSkgPT4ge1xyXG5cdFx0XHRcdHRoaXMuX29rY2FsKCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHR0aGlzLl9sYXllcm9iai5jYW5jZWxjYWwuYWRkKChlKSA9PiB7XHJcblx0XHRcdFx0dGhpcy5fY2FuY2VsY2FsKCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHR0aGlzLl9hZGRjYWxsKCk7XHJcblx0XHR9ZWxzZXtcclxuICAgICAgICAgICAgaWYocmVzZXQpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbGF5ZXJvYmouc2V0Q29udGVudCh0aGlzLl9kZWZhdWx0b3B0LmNvbmZpcm0uZnJhbWV0cGwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cdFx0cmV0dXJuIHRoaXMuX2xheWVyb2JqO1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiDplIDmr4FhbGVydOW8ueWxglxyXG5cdCAqL1xyXG5cdGRlc3Ryb3koKXtcclxuXHRcdHN1cGVyLmRlc3Ryb3koKTtcclxuXHRcdHRoaXMuX29rY2FsID0gZnVuY3Rpb24oKXt9O1xyXG5cdFx0dGhpcy5fY2FuY2VsY2FsID0gZnVuY3Rpb24oKXt9O1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb25maXJtQ29udHJvbDtcclxuIiwi77u/LyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcgY29uZnJpbeexu+WNleS9k+aOp+WItuWZqO+8jOS4gOiIrOeUqOS6jueugOWNleeahGNvbmZpcm3kv6Hmga/mj5DnpLrjgIJcclxuICog5rOo5oSP77ya6K+lY29uZnJpbeaOp+WItueahOWvueixoeWPimRvbeWcqOWFqOWxgOS4reWUr+S4gOWtmOWcqO+8jOWmguaenOaDs+imgeWIm+W7uuWkmuS4qu+8jOivt+S9v+eUqGxpYmxheWVycy9jb25maXJt5oiWbGlibGF5ZXJzL2NvbmZpcm1Db250cm9sXHJcbiAqIEB2ZXJzaW9uIDEuMC4wIHwgMjAxNS0wOS0xNiDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAZXhhbXBsZVxyXG4gKiAgICAgIGNvbnN0IENvbmZpcm1TaW5nbGUgPSByZXF1aXJlKCdsaWJsYXllci1jb25maXJtU2luZ2xlJyk7XHJcbiAqXHJcblx0XHRDb25maXJtU2luZ2xlLnNldGNvbmZpZyh7XHJcblx0XHRcdGNvbmZpcm06IHtcclxuXHRcdFx0XHRmcmFtZXRwbDogW1xyXG5cdFx0XHRcdFx0JzxkaXYgY2xhc3M9XCJqcy1jb250ZW50XCI+PC9kaXY+JyxcclxuXHRcdFx0XHRcdCc8ZGl2PjxhIGhyZWY9XCJqYXZhc2NyaXB0OjtcIiBjbGFzcz1cImpzLW9rXCI+5aW955qEPC9hPjxhIGhyZWY9XCJqYXZhc2NyaXB0OjtcIiBjbGFzcz1cImpzLWNhbmNlbFwiPuetieS4i+ivtDwvYT48L2Rpdj4nXHJcblx0XHRcdFx0XS5qb2luKCcnKVxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdENvbmZpcm1TaW5nbGUuc2hvdyh7XHJcblx0XHQgICAgY29udGVudDogJ+aCqOi/mOacqueZu+mZhidcclxuXHRcdH0se1xyXG5cdFx0ICAgIG9rOiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+eCueWHu+WlveeahCcpO1xyXG4gICAgICAgICAgICB9LFxyXG5cdFx0XHRjYW5jZWw6IGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0Y29uc29sZS5sb2coJ+eCueWHu+etieS4i+ivtCcpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuICAgICAgICBDb25maXJtU2luZ2xlLmdldGxheWVyb2JqKCnvvJsgLy9sYXllci9jb25maXJt57G75a+56LGhXHJcbiAqICovXHJcbiBjb25zdCBDb25mcmltQ29udHJvbCA9IHJlcXVpcmUoJy4vY29uZmlybUNvbnRyb2wuanMnKTtcclxuXHJcbiBtb2R1bGUuZXhwb3J0cyA9IG5ldyBDb25mcmltQ29udHJvbCgpO1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyDmta7lsYLln7rnsbtcclxuICogQHZlcnNpb24gMS4wLjAgfCAyMDE1LTA4LTE5IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm4g5rWu5bGC5Z+657G7XHJcbiAqIEBleGFtcGxlXHJcbiAqXHJcbiAqIFx0Y29uc3QgTGF5ZXIgPSByZXF1aXJlKCdsaWJsYXllci1sYXllcicpO1xyXG4gKlxyXG4gKiBcdCB2YXIgbGF5ZXIgPSBuZXcgTGF5ZXIoJCgnYm9keScpKTtcclxuICogICBsYXllci5zaG93YmVmb3JlY2FsLmFkZChmdW5jdGlvbigpe2NvbnNvbGUubG9nKCflsYLmmL7npLrliY0nKTt9KTtcclxuICogICBsYXllci5oaWRlYmVmb3JlY2FsLmFkZChmdW5jdGlvbigpe2NvbnNvbGUubG9nKCflsYLpmpDol4/liY0nKTt9KTtcclxuICogICBsYXllci5zaG93YWZ0ZXJjYWwuYWRkKGZ1bmN0aW9uKCl7Y29uc29sZS5sb2coJ+WxguaYvuekuuWQjicpO30pO1xyXG4gKiAgIGxheWVyLmhpZGVhZnRlcmNhbC5hZGQoZnVuY3Rpb24oKXtjb25zb2xlLmxvZygn5bGC6ZqQ6JeP5ZCOJyk7fSk7XHJcbiAqICAgbGF5ZXIuaGlkZSgpOyAvL+makOiXj+WxglxyXG4gKiAgIGxheWVyLmxheWVyOyAvL+WxgmRvbeiKgueCueWvueixoVxyXG4gKiAgIGxheWVyLmNvbnRhaW5lcjsgLy/mta7lsYLlrrnlmahcclxuICogICBsYXllci5kZXN0cm95KCk7IC8v6ZSA5q+B5bGCXHJcbiAqICovXHJcblxyXG4gY2xhc3MgTGF5ZXIge1xyXG5cdCAvKipcclxuIFx0ICog5rWu5bGC5Z+657G74oCU4oCU5Yib5bu65bm25re75Yqg5Yiw5oyH5a6a5a655Zmo5LitXHJcbiAgICAgICogQHBhcmFtIHtFbGVtZW50fSBjb250YWluZXIg5rWu5bGC5a2Y5pS+5a655Zmo77yM6buY6K6k5Li6JCgnYm9keScpXHJcbiAgICAgICogQHBhcmFtIHtKU09OfSBjb25maWcg5bGC6YWN572u5Y+C5pWw77yM6buY6K6k5L+h5oGv5Y+K6K+05piO5aaC5LiLb3B05Luj56CB5aSEXHJcbiBcdCAqL1xyXG5cdCBjb25zdHJ1Y3Rvcihjb250YWluZXIsY29uZmlnKXtcclxuXHRcdGNvbnRhaW5lciA9IGNvbnRhaW5lciB8fCAkKCdib2R5Jyk7XHJcbiBcdFx0dmFyIG9wdCA9ICQuZXh0ZW5kKHRydWUse1xyXG4gXHRcdFx0Y2xhc3NuYW1lOiAnJywgLy9sYXllcueahGNsYXNzXHJcbiBcdFx0XHR6SW5kZXg6IDIsIC8vbGF5ZXLnmoR6LWluZGV4XHJcbiBcdFx0XHRwb3NpdGlvbjogJ2Fic29sdXRlJywgLy9sYXllcueahHBvc2l0aW9u44CC6buY6K6k5pivYWJzb2x1dGVcclxuIFx0XHRcdHNob3c6IGZhbHNlLCAvL+WIm+W7uuWxguWQjum7mOiupOaYr+WQpuaYvuekulxyXG4gXHRcdFx0Y3VzdG9tOiB7XHJcbiBcdFx0XHRcdHNob3c6IG51bGwsIC8v55So5oi36Ieq5a6a5LmJ5pi+56S65bGC55qE5pa55rOV44CC5aaC5p6c5q2k5pa55rOV5a2Y5Zyo77yM5YiZ5LiN55So6buY6K6k55qE5pi+56S65bGC5pa55rOVXHJcbiBcdFx0XHRcdGhpZGU6IG51bGwgLy/nlKjmiLfoh6rlrprkuYnpmpDol4/lsYLnmoTmlrnms5XjgILlpoLmnpzmraTmlrnms5XlrZjlnKjvvIzliJnkuI3nlKjpu5jorqTnmoTpmpDol4/lsYLmlrnms5VcclxuIFx0XHRcdH1cclxuIFx0XHR9LGNvbmZpZyB8fCB7fSk7XHJcbiBcdFx0dmFyIGNzc3N0ciA9ICdwb3NpdGlvbjonK29wdC5wb3NpdGlvbisnOycrKG9wdC5zaG93PycnOidkaXNwbGF5Om5vbmU7JykrJ3otaW5kZXg6JytvcHQuekluZGV4Kyc7JztcclxuIFx0XHR0aGlzLmNvbnRhaW5lciA9IGNvbnRhaW5lcjsgLy/mta7lsYLlrrnlmahcclxuIFx0XHR0aGlzLmxheWVyID0gJCgnPGRpdicrKG9wdC5jbGFzc25hbWUgPT0gJyc/Jyc6JyBjbGFzcz1cIicrb3B0LmNsYXNzbmFtZSsnXCInKSsnIHN0eWxlPVwiJytjc3NzdHIrJ1wiPjwvZGl2PicpO1xyXG4gXHRcdHRoaXMubGF5ZXIuYXBwZW5kVG8oY29udGFpbmVyKTtcclxuIFx0XHR0aGlzLnNob3diZWZvcmVjYWwgPSAkLkNhbGxiYWNrcygpOyAvL+WxguaYvuekuuWJjeeahOWbnuiwg1xyXG4gXHRcdHRoaXMuc2hvd2FmdGVyY2FsID0gJC5DYWxsYmFja3MoKTsgLy/lsYLmmL7npLrlkI7nmoTlm57osINcclxuIFx0XHR0aGlzLmhpZGViZWZvcmVjYWwgPSAkLkNhbGxiYWNrcygpOyAvL+WxgumakOiXj+WJjeeahOWbnuiwg1xyXG4gXHRcdHRoaXMuaGlkZWFmdGVyY2FsID0gJC5DYWxsYmFja3MoKTsgLy/lsYLpmpDol4/lkI7nmoTlm57osINcclxuIFx0XHR0aGlzLmN1c3RvbSAgPSBvcHQuY3VzdG9tOyAvL+iHquWumuS5ieaWueazlVxyXG5cdCB9XHJcblx0IC8qKlxyXG4gXHQgKiDorr7nva7lsYLlhoXlrrlcclxuICBcdCAqIEBwYXJhbSB7RWxlbWVudHxTdHJpbmd9ICpjb250ZW50IGh0bWzlrZfnrKbkuLLmiJbogIXoioLngrnlr7nosaFcclxuIFx0ICovXHJcblx0IHNldENvbnRlbnQoY29udGVudCl7XHJcblx0XHRpZihhcmd1bWVudHMubGVuZ3RoID09IDApe1xyXG4gXHRcdFx0cmV0dXJuO1xyXG4gXHRcdH1cclxuIFx0XHRpZih0eXBlb2YgY29udGVudCA9PSAnc3RyaW5nJyl7XHJcbiBcdFx0XHR0aGlzLmxheWVyLmh0bWwoY29udGVudCk7XHJcbiBcdFx0fVxyXG4gXHRcdGVsc2V7XHJcbiBcdFx0XHR0aGlzLmxheWVyLmh0bWwoJycpLmFwcGVuZChjb250ZW50KTtcclxuIFx0XHR9XHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOaYvuekuuWxguOAglxyXG4gXHQgKi9cclxuXHQgX3Nob3coKXtcclxuXHRcdCBpZih0eXBlb2YgdGhpcy5jdXN0b20uc2hvdyA9PSAnZnVuY3Rpb24nKXtcclxuIFx0XHRcdHRoaXMuY3VzdG9tLnNob3codGhpcy5sYXllcik7XHJcbiBcdFx0fVxyXG4gXHRcdGVsc2V7XHJcbiBcdFx0XHR0aGlzLmxheWVyLnNob3coKTtcclxuIFx0XHR9XHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOaYvuekuuWxguOAguS8muinpuWPkXNob3djYWzlm57osINcclxuIFx0ICovXHJcbiBcdCBzaG93KCl7XHJcblx0XHQgaWYoIXRoaXMuaXNzaG93KCkpe1xyXG4gXHRcdFx0dGhpcy5zaG93YmVmb3JlY2FsLmZpcmUoKTsgLy/lsYLmmL7npLrliY3lm57osINcclxuIFx0XHRcdHRoaXMuX3Nob3coKTtcclxuIFx0XHRcdHRoaXMuc2hvd2FmdGVyY2FsLmZpcmUoKTsgLy/lsYLmmL7npLrlkI7lm57osINcclxuIFx0XHR9XHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOmakOiXj+WxguOAglxyXG4gXHQgKi9cclxuXHQgX2hpZGUoKXtcclxuXHRcdGlmKHR5cGVvZiB0aGlzLmN1c3RvbS5oaWRlID09ICdmdW5jdGlvbicpe1xyXG4gXHRcdFx0dGhpcy5jdXN0b20uaGlkZSh0aGlzLmxheWVyKTtcclxuIFx0XHR9XHJcbiBcdFx0ZWxzZXtcclxuIFx0XHRcdHRoaXMubGF5ZXIuaGlkZSgpO1xyXG4gXHRcdH1cclxuXHQgfVxyXG5cdCAvKipcclxuIFx0ICog6ZqQ6JeP5bGC44CC5Lya6Kem5Y+RaGlkZWNhbOWbnuiwg1xyXG4gXHQgKi9cclxuXHQgaGlkZSgpe1xyXG5cdFx0IGlmKHRoaXMuaXNzaG93KCkpe1xyXG4gXHRcdFx0dGhpcy5oaWRlYmVmb3JlY2FsLmZpcmUoKTsgLy/lsYLpmpDol4/liY3lm57osINcclxuIFx0XHRcdHRoaXMuX2hpZGUoKTtcclxuIFx0XHRcdHRoaXMuaGlkZWFmdGVyY2FsLmZpcmUoKTsgLy/lsYLpmpDol4/lkI7lm57osINcclxuIFx0XHR9XHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOmUgOavgeWxglxyXG4gXHQgKi9cclxuXHQgZGVzdHJveSgpe1xyXG5cdFx0IGlmKHRoaXMubGF5ZXIgIT0gbnVsbCl7XHJcbiBcdFx0XHR0aGlzLmxheWVyLnJlbW92ZSgpO1xyXG4gXHRcdFx0dGhpcy5sYXllciA9IG51bGw7XHJcbiBcdFx0XHR0aGlzLnNob3djYWwgPSBudWxsO1xyXG4gXHRcdFx0dGhpcy5oaWRlY2FsID0gbnVsbDtcclxuIFx0XHRcdHRoaXMuY3VzdG9tID0gbnVsbDtcclxuIFx0XHRcdHRoaXMuY29udGFpbmVyID0gbnVsbDtcclxuIFx0XHR9XHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOWIpOaWreWxguaYr+WQpuaYvuekulxyXG4gXHQgKiBAcmV0dXJuIHtCb29sZWFufSB0cnVlfGZhbHNlXHJcbiBcdCAqL1xyXG5cdCBpc3Nob3coKXtcclxuXHRcdCByZXR1cm4gdGhpcy5sYXllci5jc3MoJ2Rpc3BsYXknKSAhPSAnbm9uZSc7XHJcblx0IH1cclxuIH1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTGF5ZXI7XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IOmBrue9qeexu+KAlOKAlOWIm+W7uumBrue9qeW5tui/m+ihjOebuOWFs+aOp+WItlxyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE1LTA4LTE1IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm4g6YGu572p5a+56LGhXHJcbiAqIEBleGFtcGxlXHJcbiAqIFx0IGNvbnN0IE1hc2sgPSByZXF1aXJlKCdsaWJsYXllci1tYXNrJyk7XHJcbiAqXHJcbiAqIFx0IHZhciBtYXNrID0gbmV3ICRtYXNrKCQoJ2JvZHknKSk7XHJcbiAqICAgbWFzay5zaG93KCk7IC8v5pi+56S66YGu572pXHJcbiAqICAgbWFzay5oaWRlKCk7IC8v6ZqQ6JeP6YGu572pXHJcbiAqICAgbWFzay5tYXNrOyAvL+mBrue9qWRvbeiKgueCueWvueixoVxyXG4gKiAgIG1hc2suY29udGFpbmVyOyAvL+mBrue9qeWuueWZqFxyXG4gKiAgIG1hc2suZGVzdHJveSgpOyAvL+mUgOavgemBrue9qVxyXG4gKiAgIG1hc2suY2xpY2tjYWwuYWRkKGZ1bmN0aW9uKGUpe1xyXG4gKiBcdCAgICBjb25zb2xlLmxvZygn6YGu572p6KKr54K55Ye7Jyk7XHJcbiAqICAgfSk7XHJcbiAqICovXHJcblxyXG4gY29uc3QgUG9zaXRpb25Cb21iID0gcmVxdWlyZSgnLi9wb3NpdGlvbkJvbWIuanMnKTtcclxuXHJcbiBjbGFzcyBNYXNre1xyXG5cdCAvKipcclxuXHQgICog6YGu572p57G74oCU4oCU5Yib5bu66YGu572pZG9t5bm25re75Yqg5Yiw5oyH5a6a5a655Zmo5LitXHJcblx0ICAqIEBwYXJhbSB7RWxlbWVudH0gY29udGFpbmVyIOmBrue9qeWtmOaUvuWuueWZqO+8jOm7mOiupOS4uiQoJ2JvZHknKVxyXG5cdCAgKiBAcGFyYW0ge0pTT059IGNvbmZpZyDpga7nvanphY3nva7lj4LmlbDvvIzpu5jorqTkv6Hmga/lj4ror7TmmI7lpoLkuItvcHTku6PnoIHlpIRcclxuXHQgICovXHJcblx0IGNvbnN0cnVjdG9yKGNvbnRhaW5lcixjb25maWcpe1xyXG5cdFx0IGNvbnRhaW5lciA9IGNvbnRhaW5lciB8fCAkKCdib2R5Jyk7XHJcblx0XHQgdmFyIG9wdCA9ICQuZXh0ZW5kKHtcclxuXHRcdFx0IGJnY29sb3I6ICcjMDAwJywgLy/og4zmma/oibJcclxuXHRcdFx0IHpJbmRleDogMSwgLy/pga7nval6LWluZGV4XHJcblx0XHRcdCBvcGFjaXR5OiAwLjYsIC8v6YGu572p6YCP5piO5bqmXHJcblx0XHRcdCBzaG93OiBmYWxzZSwgLy/liJvlu7rpga7nvanlkI7pu5jorqTmmK/lkKbmmL7npLpcclxuXHRcdFx0IGN1c3RvbToge1xyXG5cdFx0XHRcdCBzaG93OiBudWxsLCAvL+eUqOaIt+iHquWumuS5ieaYvuekuuWxgueahOaWueazleOAguWmguaenOatpOaWueazleWtmOWcqO+8jOWImeS4jeeUqOm7mOiupOeahOaYvuekuuWxguaWueazlVxyXG5cdFx0XHRcdCBoaWRlOiBudWxsIC8v55So5oi36Ieq5a6a5LmJ6ZqQ6JeP5bGC55qE5pa55rOV44CC5aaC5p6c5q2k5pa55rOV5a2Y5Zyo77yM5YiZ5LiN55So6buY6K6k55qE6ZqQ6JeP5bGC5pa55rOVXHJcblx0XHRcdCB9XHJcblx0XHQgfSxjb25maWcgfHwge30pO1xyXG5cdFx0IHZhciBjc3NzdHIgPSAncG9zaXRpb246YWJzb2x1dGU7YmFja2dyb3VuZDonK29wdC5iZ2NvbG9yKyc7Jysob3B0LnNob3c/Jyc6J2Rpc3BsYXk6bm9uZTsnKSsnei1pbmRleDonK29wdC56SW5kZXgrJzsnO1xyXG5cdFx0IHRoaXMuY29udGFpbmVyID0gY29udGFpbmVyOyAvL+mBrue9qeWuueWZqFxyXG5cdFx0IHRoaXMubWFzayA9ICQoJzxkaXYgc3R5bGU9XCInK2Nzc3N0cisnXCI+PC9kaXY+Jyk7XHJcblx0XHQgdGhpcy5tYXNrLmFwcGVuZFRvKGNvbnRhaW5lcik7XHJcblx0XHQgdGhpcy5tYXNrLmNzcygnb3BhY2l0eScsb3B0Lm9wYWNpdHkpO1xyXG5cdFx0IHRoaXMuY3VzdG9tICA9IG9wdC5jdXN0b207IC8v6Ieq5a6a5LmJ5pa55rOVXHJcblx0XHQgdGhpcy5wb3MgPSBuZXcgUG9zaXRpb25Cb21iKHtsYXllcjp0aGlzLm1hc2t9LHttb2RlOidmdWxsJ30pO1xyXG5cdFx0IC8v57uR5a6a5LqL5Lu2XHJcblx0XHQgdGhpcy5jbGlja2NhbCA9ICQuQ2FsbGJhY2tzKCk7IC8v6YGu572p54K55Ye75ZCO55qE5Zue6LCDXHJcblx0XHQgdGhpcy5tYXNrLm9uKCdjbGljay5saWInLChlKSA9PiB7XHJcblx0XHRcdCB0aGlzLmNsaWNrY2FsLmZpcmUoZSk7XHJcblx0XHQgfSk7XHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOaYvuekuumBrue9qVxyXG4gXHQgKi9cclxuXHQgc2hvdygpe1xyXG5cdFx0aWYodHlwZW9mIHRoaXMuY3VzdG9tLnNob3cgPT0gJ2Z1bmN0aW9uJyl7XHJcbiBcdFx0XHR0aGlzLmN1c3RvbS5zaG93KHRoaXMubWFzayk7XHJcbiBcdFx0fVxyXG4gXHRcdGVsc2V7XHJcbiBcdFx0XHR0aGlzLm1hc2suc2hvdygpO1xyXG4gXHRcdH1cclxuIFx0XHR0aGlzLnBvcy5zZXRwb3MoKTtcclxuXHQgfVxyXG5cdCAvKipcclxuIFx0ICog6ZqQ6JeP6YGu572pXHJcbiBcdCAqL1xyXG5cdCBoaWRlKCl7XHJcblx0XHQgaWYodHlwZW9mIHRoaXMuY3VzdG9tLmhpZGUgPT0gJ2Z1bmN0aW9uJyl7XHJcbiBcdFx0XHR0aGlzLmN1c3RvbS5oaWRlKHRoaXMubWFzayk7XHJcbiBcdFx0fVxyXG4gXHRcdGVsc2V7XHJcbiBcdFx0XHR0aGlzLm1hc2suaGlkZSgpO1xyXG4gXHRcdH1cclxuXHQgfVxyXG5cdCAvKipcclxuIFx0ICog6ZSA5q+B6YGu572pXHJcbiBcdCAqL1xyXG5cdCBkZXN0cm95KCl7XHJcblx0XHQgaWYodGhpcy5tYXNrICE9IG51bGwpe1xyXG4gXHRcdFx0dGhpcy5tYXNrLm9mZignY2xpY2subGliJyk7XHJcbiBcdFx0XHR0aGlzLm1hc2sucmVtb3ZlKCk7XHJcbiBcdFx0XHR0aGlzLm1hc2sgPSBudWxsO1xyXG4gXHRcdFx0dGhpcy5wb3MuZGVzdHJveSgpO1xyXG4gXHRcdFx0dGhpcy5wb3MgPSBudWxsO1xyXG4gXHRcdFx0dGhpcy5jbGlja2NhbCA9IG51bGw7XHJcbiBcdFx0fVxyXG5cdCB9XHJcbiB9XHJcblxyXG4gbW9kdWxlLmV4cG9ydHMgPSBNYXNrO1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyDlvLnlsYLlrprkvY3mlrnms5VcclxuICogXHRcdOazqOaEj++8muiwg+eUqOatpOaWueazleWJje+8jOW/hemhu+aYr+W+heWumuS9jeWxgueahGRpc3BsYXnkuI3kuLpudWxs55qE5oOF5Ya15LiLXHJcbiAqIEB2ZXJzaW9uIDEuMCB8IDIwMTUtMDgtMTUg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQHJldHVybiDlvLnlsYLlrprkvY3mlrnms5VcclxuICogQGV4YW1wbGVcclxuICogXHQgY29uc3QgUG9zaXRpb25Cb21iID0gcmVxdWlyZSgnbGlibGF5ZXItcG9zaXRpb25Cb21iJyk7XHJcbiAqXHJcbiAqIFx0IHZhciBwb3MgPSBuZXcgUG9zaXRpb25Cb21iKHtsYXllcjrlsYJkb23oioLngrl9KTtcclxuICogXHQgcG9zLnBvc2NhbC5hZGQoZnVuY3Rpb24oKXtjb25zb2xlLmxvZygnbGF5ZXLlrprkvY3lkI7lm57osIMnKX0pO1xyXG4gKiAqL1xyXG5cclxuIGNvbnN0IFdpbnNjcm9sbCA9IHJlcXVpcmUoJ2xpYnV0aWwtd2luc2Nyb2xsJyksXHJcbiBcdFx0U2Nyb2xsID0gcmVxdWlyZSgnbGlidXRpbC1zY3JvbGwnKSxcclxuXHRcdFdpbnJlc2l6ZSA9IHJlcXVpcmUoJ2xpYnV0aWwtd2lucmVzaXplJyksXHJcblx0XHRSZXNpemUgPSByZXF1aXJlKCdsaWJ1dGlsLXJlc2l6ZScpO1xyXG5cclxuLyoqXHJcbiAqIOWumuS9jeeul+azlVxyXG4gKi9cclxuZnVuY3Rpb24gc2V0cG9zKGRvbW9wdCxwb3NvcHQpe1xyXG5cdHZhciBjc3NvcHQgPSB7fSxsYXllciA9IGRvbW9wdC5sYXllcixvZmZjb24gPSBkb21vcHQub2ZmY29uO1xyXG5cdGxheWVyLmNzcygncG9zaXRpb24nLGRvbW9wdC5wb3NpdGlvbik7XHJcblx0dmFyIG1hcmdpbkxlZnQgPSAwLCBtYXJnaW5Ub3AgPSAwO1xyXG5cdGlmKGRvbW9wdC5wb3NpdGlvbiA9PSAnYWJzb2x1dGUnICYmIHBvc29wdC5maXhlZCl7XHJcblx0XHRtYXJnaW5MZWZ0ID0gb2ZmY29uLnNjcm9sbExlZnQoKTtcclxuXHRcdG1hcmdpblRvcCA9IG9mZmNvbi5zY3JvbGxUb3AoKTtcclxuXHR9XHJcblx0c3dpdGNoIChwb3NvcHQubW9kZSl7XHJcblx0XHRjYXNlICdjJzogLy/lsYXkuK3lrprkvY1cclxuXHRcdFx0bWFyZ2luTGVmdCAtPSAoTWF0aC5tYXgobGF5ZXIud2lkdGgoKSxwb3NvcHQubWlud2lkdGgpLzIrcG9zb3B0Lm9mZnNldFswXSk7XHJcblx0XHRcdG1hcmdpblRvcCAtPSAoTWF0aC5tYXgobGF5ZXIuaGVpZ2h0KCkscG9zb3B0Lm1pbmhlaWdodCkvMitwb3NvcHQub2Zmc2V0WzFdKTtcclxuXHRcdFx0Y3Nzb3B0LnRvcCA9ICc1MCUnO1xyXG5cdFx0XHRjc3NvcHQubGVmdCA9ICc1MCUnO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdGNhc2UgJ2Z1bGwnOiAvL+a7oeWxj+WumuS9je+8jOWNoOa7oeaVtOS4quWumuS9jeWuueWZqOOAguacrOadpeS4jeiuvue9rndpZHRo5ZKMaGVpZ2h077yM6K6+572u5LqGcmlnaHTlkoxib3R0b23jgILkvYbmmK/lgbblj5FtYXJnaW7kuI3otbfkvZznlKjvvIzmraTml7bor7vlj5bnmoTlhYPntKDlsLrlr7jkuLowLlxyXG5cdFx0XHRjc3NvcHQud2lkdGggPSAnMTAwJSc7XHJcblx0XHRcdGNzc29wdC5oZWlnaHQgPSAnMTAwJSc7XHJcblx0XHRcdGNzc29wdC50b3AgPSAnMCc7XHJcblx0XHRcdGNzc29wdC5sZWZ0ID0gJzAnO1xyXG5cdFx0XHRicmVhaztcclxuXHR9XHJcblx0Y3Nzb3B0Lm1hcmdpbkxlZnQgPSBtYXJnaW5MZWZ0KydweCc7XHJcblx0Y3Nzb3B0Lm1hcmdpblRvcCA9IG1hcmdpblRvcCsncHgnO1xyXG5cdGlmKHR5cGVvZiBwb3NvcHQuY3VzdG9tcG9zID09ICdmdW5jdGlvbicpe1xyXG5cdFx0cG9zb3B0LmN1c3RvbXBvcyhjc3NvcHQpO1xyXG5cdH1lbHNle1xyXG5cdFx0bGF5ZXIuY3NzKGNzc29wdCk7XHJcblx0fVxyXG59XHJcblxyXG5jbGFzcyBQb3NpdGlvbntcclxuXHQvKipcclxuXHQgKiDlrprkvY3nsbtcclxuICAgICAqIEBwYXJhbSB7SlNPTn0gZG9tcyDlrprkvY1kb23nm7jlhbPkv6Hmga9cclxuICAgICAqIFx0XHR7XHJcbiAgICAgKiBcdFx0XHRsYXllcjogbnVsbCAvL3tKUXVlcnlFbGVtZW50fFN0cmluZ+iKgueCuemAieaLqeWZqH0g5b6F5a6a5L2N5bGC6IqC54K5XHJcbiAgICAgKiAgICAgIH1cclxuICAgICAqIEBwYXJhbSB7SlNPTn0gY29uZmlnIOWxguWumuS9jemFjee9ruWPguaVsO+8jOm7mOiupOS/oeaBr+WPiuivtOaYjuWmguS4i3Bvc29wdOS7o+eggeWkhFxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKGRvbXMsY29uZmlnKXtcclxuXHRcdC8v5Y+C5pWw5qOA5rWL5LiO6K6+572uXHJcblx0XHRpZihhcmd1bWVudHMubGVuZ3RoID09IDApe1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ+W/hemhu+S8oOWFpeebuOWFs+WumuS9jeeahGRvbeWPguaVsCcpO1xyXG5cdFx0fVxyXG5cdFx0dmFyIGRvbW9wdCA9ICQuZXh0ZW5kKHtcclxuXHRcdFx0bGF5ZXI6IG51bGwsIC8v5b6F5a6a5L2N5bGC6IqC54K5XHJcblx0XHRcdG9mZnBhZ2U6IGZhbHNlIC8v6K+05piO55u45a+55LqO5b2T5YmN6aG16Z2i5a6a5L2NXHJcblx0XHR9LGRvbXMgfHwge30pO1xyXG5cdFx0aWYoZG9tb3B0LmxheWVyICYmIHR5cGVvZiBkb21vcHQubGF5ZXIgPT0gJ3N0cmluZycpe1xyXG5cdFx0XHRkb21vcHQubGF5ZXIgPSAkKGRvbW9wdC5sYXllcik7XHJcblx0XHR9XHJcblx0XHRpZighZG9tb3B0LmxheWVyIHx8IGRvbW9wdC5sYXllci5sZW5ndGggPT0gMCl7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcign5Lyg5YWl55qE5a6a5L2N5bGC6IqC54K55peg5pWIJyk7XHJcblx0XHR9XHJcblx0XHR2YXIgcG9zb3B0ID0gJC5leHRlbmQoe1xyXG5cdFx0XHRmaXhlZDogdHJ1ZSwgLy/mmK/lkKblsIblvLnlsYLlp4vnu4jlrprkvY3lnKjlj6/op4bnqpflj6PljLrln5/vvIzpu5jorqTkuLp0cnVlXHJcblx0XHRcdG1vZGU6ICdjJywgLy/lrprkvY3mqKHlvI/vvIzmnprkuL7jgIJjOuS4remXtFxyXG5cdFx0XHRvZmZzZXQ6IFswLDBdLCAvL+WumuS5ieWQjuWBj+enu+WwuuWvuCBbeOi9tCx56L20XeOAguWvueS6jm1vZGXmmK9mdWxs55qE5qih5byP5peg5pWIXHJcblx0XHRcdHNpemVjaGFuZ2U6IGZhbHNlLCAvL+W9k21vZGXmmK9j5pe277yMb2Zmc2V0UGFyZW50IHJlc2l6ZeaXtu+8jOW+heWumuS9jeWxgueahOWkp+Wwj+aYr+WQpuS8muaUueWPmFxyXG5cdFx0XHRtaW53aWR0aDogMCwgLy/lrprkvY3orqHnrpfml7bvvIzlvoXlrprkvY3lsYJsYXllcueahOacgOWwj+WuveW6plxyXG4gICAgICAgICAgICBtaW5oZWlnaHQ6IDAsIC8v5a6a5L2N6K6h566X5pe277yM5b6F5a6a5L2N5bGCbGF5ZXLnmoTmnIDlsI/pq5jluqZcclxuICAgICAgICAgICAgY3VzdG9tcG9zOiBudWxsIC8v55So5oi36Ieq5a6a5LmJ5a6a5L2N5pa55rOV44CC5aaC5p6c5aOw5piO5q2k5pa55rOV77yM5YiZ5LiN5Lya5L2/55So57O757uf6buY6K6k55qE5pa55rOV6K6+572ucG9z55qE5a6a5L2N5Y+C5pWw77yM6ICM5piv5oqK5a6a5L2N5Y+C5pWwcG9z5Lyg6YCS57uZ5q2k5pa55rOVXHJcblx0XHR9LGNvbmZpZyB8fCB7fSk7XHJcbiAgICAgICAgdGhpcy5wb3NjYWwgPSAkLkNhbGxiYWNrcygpOyAvL3NldHBvc+WQjueahOWbnuiwg1xyXG5cclxuXHRcdHZhciB0aGF0ID0gdGhpcztcclxuXHRcdC8v5Yid5q2l5qOA5rWL5a6a5L2N5Y+C6ICD5a655ZmoXHJcblx0XHRkb21vcHQub2ZmY29uID0gZG9tb3B0LmxheWVyLm9mZnNldFBhcmVudCgpO1xyXG5cdFx0dmFyIHRhZ25hbWUgPSBkb21vcHQub2ZmY29uLmdldCgwKS50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XHJcblx0XHR2YXIgbGlzdGVuY2FsbCA9IHtcclxuICAgICAgICAgICAgY2FsbDogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIHRoYXQuc2V0cG9zKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciBpc2xpc3Njcm9sbCA9IGZhbHNlOyAvL+aYr+WQpuebkeWQrHNjcm9sbOS6i+S7tlxyXG4gICAgICAgIHZhciBpc2xpc3Jlc2l6ZSA9IGZhbHNlOyAvL+aYr+WQpuebkeWQrHJlc2l6ZeS6i+S7tlxyXG5cdFx0aWYodGFnbmFtZSA9PSAnYm9keScgfHwgdGFnbmFtZSA9PSAnaHRtbCcpeyAvL+ivtOaYjuebuOWvueS6jumhtemdouWumuS9jVxyXG5cdFx0ICAgIGRvbW9wdC5vZmZjb24gPSAkKCdib2R5Jyk7XHJcblx0XHRcdGRvbW9wdC5vZmZwYWdlID0gdHJ1ZTtcclxuXHRcdH1cclxuXHRcdGlmKGRvbW9wdC5vZmZwYWdlICYmIHBvc29wdC5maXhlZCl7IC8v5aaC5p6c5a6a5L2N5a655Zmo5piv5b2T5YmN6aG16Z2i44CB5Zu65a6a5a6a5L2N44CB5Y+v5L2/55SoZml4ZWTlrprkvY3jgILliJnnlKhmaXhlZOWumuS9jVxyXG5cdFx0XHRkb21vcHQucG9zaXRpb24gPSAnZml4ZWQnO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZXtcclxuXHRcdFx0ZG9tb3B0LnBvc2l0aW9uID0gJ2Fic29sdXRlJztcclxuXHRcdFx0aWYocG9zb3B0LmZpeGVkKSB7IC8v5aaC5p6c5Zu65a6a5a6a5L2N77yM5YiZ55uR5ZCsc2Nyb2xs5LqL5Lu2XHJcblx0XHRcdCAgICBpc2xpc3Njcm9sbCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBpZihkb21vcHQub2ZmcGFnZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgV2luc2Nyb2xsLmxpc3RlbihsaXN0ZW5jYWxsKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNjcm9sbCA9IG5ldyBTY3JvbGwoZG9tb3B0Lm9mZmNvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsLmxpc3RlbihsaXN0ZW5jYWxsKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Ly/or7TmmI5tb2Rl5pivY+aXtu+8jG9mZnNldFBhcmVudCByZXNpemXml7bvvIzlvoXlrprkvY3lsYLnmoTlpKflsI/kvJrmlLnlj5jvvIzliJnnm5HlkKxyZXNpemXkuovku7ZcclxuICAgICAgICBpZihwb3NvcHQubW9kZSA9PSAnYycgJiYgcG9zb3B0LnNpemVjaGFuZ2Upe1xyXG4gICAgICAgICAgICBpc2xpc3Jlc2l6ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIGlmKGRvbW9wdC5vZmZwYWdlKXtcclxuICAgICAgICAgICAgICAgIFdpbnJlc2l6ZS5saXN0ZW4obGlzdGVuY2FsbCk7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlc2l6ZSA9IG5ldyBSZXNpemUoZG9tb3B0Lm9mZmNvbik7XHJcbiAgICAgICAgICAgICAgICByZXNpemUubGlzdGVuKGxpc3RlbmNhbGwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cdFx0dGhpcy5kb21vcHQgPSBkb21vcHQ7IC8vZG9t5Y+C5pWwXHJcblx0XHR0aGlzLnBvc29wdCA9IHBvc29wdDsgLy/lrprkvY3lj4LmlbBcclxuXHRcdHRoaXMuZGVzdHJveSA9IGZ1bmN0aW9uKCl7IC8v57uE5Lu26ZSA5q+B5pa55rOVXHJcblx0XHRcdHRoaXMuZG9tb3B0ID0gbnVsbDtcclxuXHRcdFx0dGhpcy5wb3NvcHQgPSBudWxsO1xyXG5cdFx0XHRpZihpc2xpc3Njcm9sbCl7XHJcblx0XHRcdFx0aWYoZG9tb3B0Lm9mZnBhZ2Upe1xyXG5cdFx0XHRcdFx0V2luc2Nyb2xsLnVubGlzdGVuKGxpc3RlbmNhbGwpO1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0c2Nyb2xsLnVubGlzdGVuKGxpc3RlbmNhbGwpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRpZihpc2xpc3Jlc2l6ZSl7XHJcblx0XHRcdCAgICBpZihkb21vcHQub2ZmcGFnZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgV2lucmVzaXplLnVubGlzdGVuKGxpc3RlbmNhbGwpO1xyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzaXplLnVubGlzdGVuKGxpc3RlbmNhbGwpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiDov5vooYzlrprkvY1cclxuXHQgKiBAcmV0dXJuIHtCb29sZWFufSDmmK/lkKblrprkvY3miJDlip9cclxuXHQgKi9cclxuXHRzZXRwb3MoKXtcclxuXHRcdGlmKHRoaXMuZG9tb3B0LmxheWVyLmNzcygnZGlzcGxheScpID09ICdub25lJyB8fCB0aGlzLmRvbW9wdC5vZmZjb24uY3NzKCdkaXNwbGF5JykgPT0gJ25vbmUnKXtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZXtcclxuXHRcdFx0c2V0cG9zKHRoaXMuZG9tb3B0LHRoaXMucG9zb3B0KTtcclxuICAgICAgICAgICAgdGhpcy5wb3NjYWwuZmlyZSgpO1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUG9zaXRpb247XHJcbiIsIi8qKlxyXG4gKiBhbGVydOW8ueWxguaooeadv++8jOW/hemhu+WFt+acieaMh+WumueahG5vZGXlsZ7mgKdcclxuICovXHJcbmV4cG9ydHMuYWxlcnQgPSBbXHJcbiAgICAnPGRpdj7moIfpopg8L2Rpdj4nLFxyXG5cdCc8ZGl2IG5vZGU9XCJjb250ZW50XCI+5YaF5a655Yy6PC9kaXY+JyxcclxuXHQnPGRpdj48YSBocmVmPVwiamF2YXNjcmlwdDo7XCIgY2xhc3M9XCJqcy1va1wiPuehruWumjwvYT48L2Rpdj4nXHJcbl0uam9pbignJyk7XHJcbi8qKlxyXG4gKiBjb25maXJt5by55bGC5qih5p2/77yM5b+F6aG75YW35pyJ5oyH5a6a55qEbm9kZeWxnuaAp1xyXG4gKi9cclxuZXhwb3J0cy5jb25maXJtID0gW1xyXG4gICAgJzxkaXY+5qCH6aKYPC9kaXY+JyxcclxuXHQnPGRpdiBub2RlPVwiY29udGVudFwiPuWGheWuueWMujwvZGl2PicsXHJcblx0JzxkaXY+PGEgaHJlZj1cImphdmFzY3JpcHQ6O1wiIGNsYXNzPVwianMtb2tcIj7noa7lrpo8L2E+PGEgaHJlZj1cImphdmFzY3JpcHQ6O1wiIGNsYXNzPVwianMtY2FuY2VsXCI+5Y+W5raIPC9hPjwvZGl2PidcclxuXS5qb2luKCcnKVxyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyBjc3PmlK/mjIHmg4XlhrXliKTmlq3jgILkuLvopoHnlKjkuo7mtY/op4jlmajlhbzlrrlcclxuICogQHZlcnNpb24gMS4wIHwgMjAxNS0wOC0zMSDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAcmV0dXJuXHJcbiAqIEBleGFtcGxlXHJcbiAqIFx0IGNvbnN0IENzc3N1cG9ydCA9IHJlcXVpcmUoJ2xpYnV0aWwtY3Nzc3Vwb3J0Jyk7XHJcbiAqIFx0IENzc3N1cG9ydC5maXhlZDtcclxuICogKi9cclxudmFyIF9kaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxudmFyIHJlc3VsdCA9IHtcclxuXHQvL+aYr+WQpuaUr+aMgXBvc2l0aW9uOmZpeGVk5a6a5L2NXHJcblx0Zml4ZWQ6ICEoJ3VuZGVmaW5lZCcgPT0gdHlwZW9mKGRvY3VtZW50LmJvZHkuc3R5bGUubWF4SGVpZ2h0KSB8fCAoZG9jdW1lbnQuY29tcGF0TW9kZSAhPT0gXCJDU1MxQ29tcGF0XCIgJiYgL21zaWUvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpKSkpLFxyXG5cdC8v5piv5ZCm5pSv5oyBdHJhbnNpdGlvblxyXG5cdHRyYW5zaXRpb246ICEoX2Rpdi5zdHlsZS50cmFuc2l0aW9uID09IHVuZGVmaW5lZClcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gcmVzdWx0O1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyDlr7nkuo7pq5jpopHop6blj5HnmoTkuovku7bov5vooYzlu7bov5/lpITnkIbnsbvjgILlupTnlKjlnLrmma/vvJpzY3JvbGzlkoxyZXNpemVcclxuICogQHZlcnNpb24gMS4wLjAgfCAyMDE1LTA4LTI3IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm4g5aSE55CG57G7XHJcbiAqIEBleGFtcGxlXHJcbiAqICovXHJcblxyXG4gY29uc3QgUHVibGlzaGVyUyA9IHJlcXVpcmUoJy4vcHVibGlzaGVyUy5qcycpO1xyXG5cclxuIGNsYXNzIERlbGF5ZXZ0IGV4dGVuZHMgUHVibGlzaGVyU3tcclxuXHQgLyoqXHJcbiBcdCAqIOWvueS6jumrmOmikeinpuWPkeeahOS6i+S7tui/m+ihjOW7tui/n+WkhOeQhuOAguW6lOeUqOWcuuaZr++8mnNjcm9sbOWSjHJlc2l6ZVxyXG4gXHQgKiBAcGFyYW0ge0pTT059IGNvbmZpZyDphY3nva5cclxuIFx0ICovXHJcblx0IGNvbnN0cnVjdG9yKGNvbmZpZyl7XHJcblx0ICAgIHN1cGVyKCk7XHJcbiBcdFx0dGhpcy50aW1lciA9IG51bGw7XHJcbiBcdFx0JC5leHRlbmQodGhpcyx7XHJcbiBcdFx0XHRkZWxheXRpbWU6IDIwMCAvL+S6i+S7tuajgOa1i+W7tui/n+aXtumXtO+8jOavq+enklxyXG4gXHRcdH0sY29uZmlnIHx8IHt9KTtcclxuXHQgfVxyXG5cdCAvKipcclxuIFx0ICog5byA5aeL5qOA5rWLXHJcbiBcdCAqL1xyXG5cdCBzdGFydCgpe1xyXG5cdFx0IGlmKHRoaXMudGltZXIpe1xyXG4gICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZXIpO1xyXG4gICAgICAgICB9XHJcbiAgICAgICAgIHRoaXMudGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgXHR0aGlzLmRlbGl2ZXIoKTtcclxuICAgICAgICAgfSx0aGlzLmRlbGF5dGltZSk7XHJcblx0IH1cclxuIH1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRGVsYXlldnQ7XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IOagueaNruiuvuWkh+e7meWHuuebuOWFs+S4muWKoeS6i+S7tueahOS6i+S7tuWQjeensFxyXG4gKiBAdmVyc2lvbiAxLjAuMCB8IDIwMTUtMDktMTQg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQGV4YW1wbGVcclxuICogKi9cclxudmFyIHJlc3VsdCA9IHtcclxuXHQvL+a1j+iniOWZqOeql+WPo3Jlc2l6ZeS6i+S7tlxyXG5cdHdpbnJlc2l6ZTogKGZ1bmN0aW9uKCl7XHJcblx0ICAgIHJldHVybiAnb25vcmllbnRhdGlvbmNoYW5nZScgaW4gd2luZG93PyAnb3JpZW50YXRpb25jaGFuZ2UnOiAncmVzaXplJztcclxuXHR9KSgpLFxyXG5cdC8vaW5wdXTmiJZ0ZXh0YXJlYei+k+WFpeahhuWAvOaUueWPmOeahOebkeWQrOS6i+S7tlxyXG5cdGlucHV0OiAoZnVuY3Rpb24oKXtcclxuXHQgICAgaWYoL01TSUUgOS4wLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpKXsgLy9JZTnpgqPkuKrlnZHniLnnmoTvvIzmnKzmnaVpbnB1dOWSjHByb3BlcnR5Y2hhbmdl6YO95pSv5oyB77yM5L2G5piv5Yig6Zmk6ZSu5peg5rOV6Kem5Y+R6L+Z5Lik5Liq5LqL5Lu277yM5omA5Lul5b6X5re75Yqga2V5dXBcclxuXHQgICAgICAgIHJldHVybiAnaW5wdXQga2V5dXAnO1xyXG5cdCAgICB9XHJcblx0ICAgIHZhciBub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuXHQgICAgaWYoJ29uaW5wdXQnIGluIG5vZGUpe1xyXG5cdCAgICAgICAgcmV0dXJuICdpbnB1dCc7XHJcblx0ICAgIH1lbHNlIGlmKCdvbnByb3BlcnR5Y2hhbmdlJyBpbiBub2RlKXtcclxuXHQgICAgICAgIHJldHVybiAncHJvcGVydHljaGFuZ2UnO1xyXG5cdCAgICB9ZWxzZSB7XHJcblx0ICAgICAgICByZXR1cm4gJ2tleXVwJztcclxuXHQgICAgfVxyXG5cdH0pKClcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gcmVzdWx0O1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyDorqLpmIXogIXmqKHlvI/igJTigJTlj5HluIPogIXnsbvigJTigJTnsr7nroDniYhcclxuICog57K+566A54mI77ya6K6i6ZiF6ICF5LiN6ZmQ5a6a5b+F6aG75piv6K6i6ZiF6ICF57G7U3Vic2NyaWJlcueahOWvueixoVxyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE1LTA4LTMxIOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm4g5Y+R5biD6ICF57G7XHJcbiAqIEBleGFtcGxlXHJcbiAqICovXHJcbiBjb25zdCBUb29sID0gcmVxdWlyZSgnLi90b29sLmpzJyksXHJcblx0ICAgUndjb250cm9sbGVyID0gcmVxdWlyZSgnLi9yd2NvbnRyb2xsZXIuanMnKTtcclxuXHJcbmNsYXNzIFB1Ymxpc2hlclN7XHJcblx0Y29uc3RydWN0b3IoKXtcclxuXHRcdHRoaXMuc3Vic2NyaWJlcnMgPSBbXTsgLy/orrDlvZXorqLpmIXogIXlr7nosaFcclxuXHRcdHRoaXMucndjb250cm9sbGRlciA9IG5ldyBSd2NvbnRyb2xsZXIoKTtcclxuXHR9XHJcblx0LyoqXHJcblx0ICog5Y+C5pWw5pyJ5pWI5oCn6aqM6K+BXHJcblx0ICovXHJcblx0YXJnc1ZhbGlkYXRlKGRhdGEpe1xyXG5cdFx0aWYoVG9vbC5pc09iamVjdChkYXRhKSAmJiBUb29sLmlzRnVuY3Rpb24oZGF0YS5jYWxsKSl7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiDkv6Hmga/liIblj5HvvIzpgJrnn6XmiYDmnInorqLpmIXogIVcclxuXHQgKiBmaWx0ZXLmiafooYzov5Tlm550cnVl77yM5YiZ5omn6KGMY2FsbFxyXG5cdCAqL1xyXG5cdGRlbGl2ZXIoKXtcclxuXHRcdHRoaXMucndjb250cm9sbGRlci5yZWFkKGZ1bmN0aW9uKGRhdGEpe1xyXG5cdFx0XHQkLmVhY2godGhpcy5zdWJzY3JpYmVycyxmdW5jdGlvbihpbmRleCxpdGVtKXtcclxuXHRcdFx0XHRpZihpdGVtLmZpbHRlcigpID09IHRydWUpe1xyXG5cdFx0ICAgICAgICBcdGl0ZW0uY2FsbC5hcHBseSh3aW5kb3csZGF0YS5hcmdzKTtcclxuXHRcdCAgICAgIFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH0uYmluZCh0aGlzLHthcmdzOiBhcmd1bWVudHN9KSk7XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIOiuoumYhVxyXG4gXHQgKiBAcGFyYW0ge0pTT059ICpzdWJzY3JpYmVyIOiuoumYheiAheOAguagvOW8j+WQjHN1YnNjcmliZXJz6YeM55qE5Y2V54us5LiA6aG5XHJcbiBcdCAqIHtcclxuIFx0ICogXHRcdCpjYWxsOiBmdW5jdGlvbigpe30gLy/kv6Hmga/liIblj5HnmoTlm57osIPlh73mlbBcclxuIFx0ICogICAgICBmaWx0ZXI6IGZ1bmN0aW9uKCl7cmV0dXJuIHRydWU7fSAvL+i/h+a7pOadoeS7tlxyXG4gXHQgKiB9XHJcblx0ICovXHJcblx0c3Vic2NyaWJlKHN1YnNjcmliZXIpe1xyXG5cdFx0aWYodGhpcy5hcmdzVmFsaWRhdGUoc3Vic2NyaWJlcikpe1xyXG5cdFx0XHRpZighVG9vbC5pc0Z1bmN0aW9uKHN1YnNjcmliZXIuZmlsdGVyKSl7XHJcblx0XHQgICAgICAgIHN1YnNjcmliZXIuZmlsdGVyID0gZnVuY3Rpb24oKXtcclxuXHRcdCAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG5cdFx0ICAgICAgICB9O1xyXG5cdFx0ICAgIH1cclxuXHRcdFx0aWYoJC5pbkFycmF5KHN1YnNjcmliZXIsdGhpcy5zdWJzY3JpYmVycykgPCAwKXtcclxuXHRcdFx0XHR0aGlzLnJ3Y29udHJvbGxkZXIud3JpdGUoZnVuY3Rpb24oY3Vyc3ViKXtcclxuXHRcdFx0XHRcdHRoaXMuc3Vic2NyaWJlcnMucHVzaChjdXJzdWIpO1xyXG5cdFx0XHRcdH0uYmluZCh0aGlzLHN1YnNjcmliZXIpKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiDlj5bmtojorqLpmIVcclxuIFx0ICogQHBhcmFtIHtKU09OfSBzdWJzY3JpYmVyIOiuoumYheiAhVxyXG5cdCAqL1xyXG5cdHVuc3Vic2NyaWJlKHN1YnNjcmliZXIpe1xyXG5cdFx0aWYodGhpcy5hcmdzVmFsaWRhdGUoc3Vic2NyaWJlcikpe1xyXG5cdFx0XHR0aGlzLnJ3Y29udHJvbGxkZXIud3JpdGUoZnVuY3Rpb24oY3Vyc3ViKXtcclxuXHRcdFx0XHQkLmVhY2godGhpcy5zdWJzY3JpYmVycywoaW5kZXgsaXRlbSkgPT4ge1xyXG5cdFx0XHRcdFx0aWYoaXRlbSA9PSBjdXJzdWIpe1xyXG5cdFx0XHRcdFx0ICAgIHRoaXMuc3Vic2NyaWJlcnMuc3BsaWNlKGluZGV4LDEpO1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0uYmluZCh0aGlzLHN1YnNjcmliZXIpKTtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUHVibGlzaGVyUztcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXdcclxuICogICDnu5nmjIflrprlhYPntKDliJvlu7pyZXNpemXkuovku7bnm5HlkKznsbtcclxuICogQGF1dGhvciBtaW5ncnVpfCBtaW5ncnVpQHN0YWZmLnNpbmEuY29tLmNuXHJcbiAqIEB2ZXJzaW9uIDEuMCB8IDIwMTUtMDgtMjdcclxuICogQHJldHVybiByZXNpemXnsbtcclxuICogQGV4YW1wbGVcclxuICogIFx0Y29uc3QgUmVzaXplID0gcmVxdWlyZSgnbGlidXRpbC1yZXNpemUnKTtcclxuICogXHRcdHZhciByZXNpemUgPSBuZXcgUmVzaXplKCQod2luZG93KSk7XHJcbiAqIFx0XHRyZXNpemUubGlzdGVuKHtjYWxsOmZ1bmN0aW9uKCl7Y29uc29sZS5sb2coJ+eql+WPo3Jlc2l6ZScpO319KTtcclxuICovXHJcblxyXG5jb25zdCBEZWxheWV2dCA9IHJlcXVpcmUoJy4vZGVsYXlldnQuanMnKTtcclxuXHJcbmNsYXNzIFJlc2l6ZXtcclxuXHQvKipcclxuXHQgKiBAcGFyYW0ge0VsZW1lbnR9ICpub2RlIOWFg+e0oOiKgueCuVxyXG5cdCAqIEBwYXJhbSB7SlNPTn0gY29uZmlnIOW7tui/n+mFjee9ruOAguWQjGV2dC9kZWxheWV2dOexu+eahOWIneWni+WMluWPguaVsFxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKG5vZGUsY29uZmlnKXtcclxuXHRcdGlmKG5vZGUubGVuZ3RoID09IDApe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHR2YXIgb3B0ID0gJC5leHRlbmQoe1xyXG5cdFx0ICAgIGV2dG5hbWU6ICdyZXNpemUnXHJcblx0XHR9LGNvbmZpZyk7XHJcblx0XHR0aGlzLmRlbGF5ID0gbmV3IERlbGF5ZXZ0KG9wdCk7XHJcblx0XHRub2RlLm9uKG9wdC5ldnRuYW1lLCgpID0+IHtcclxuXHRcdFx0dGhpcy5kZWxheS5zdGFydCgpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIOa3u+WKoHNjcm9sbOS6i+S7tuebkeWQrFxyXG4gICAgICogQHBhcmFtIHtKU09OfSBvcHRcclxuICAgICAqIHtcclxuICAgICAqICAgY2FsbDogZnVuY3Rpb24vL+S6i+S7tuWPkeeUn+aXtuinpuWPkeeahOWbnuiwg1xyXG5cdCAqICAgZmlsdGVyOiBmdW5jdGlvbiAvL+i/h+a7pOadoeS7tuOAgmZpbHRlcui/lOWbnuS4unRydWXliJnmiY3op6blj5FjYWxs44CC5LiN5aGr5q2k6aG55YiZ6buY6K6k5LiN6L+H5rukXHJcblx0ICogfVxyXG4gICAgICovXHJcblx0bGlzdGVuKG9wdCl7XHJcblx0XHR0aGlzLmRlbGF5LnN1YnNjcmliZShvcHQpO1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiDnp7vpmaTnm5HlkKxcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHQg5ZKM6LCD55SobGlzdGVu5pe25LiA5qC355qE5Y+C5pWw5byV55SoXHJcblx0ICovXHJcblx0dW5saXN0ZW4ob3B0KXtcclxuXHRcdHRoaXMuZGVsYXkudW5zdWJzY3JpYmUob3B0KTtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUmVzaXplO1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyDor7vlhpnmjqfliLblmajigJTigJTlr7nkuo7or7vlhpnlvILmraXmk43kvZzov5vooYzmjqfliLZcclxuICogQHZlcnNpb24gMS4wIHwgMjAxNS0wOS0wNyDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAcmV0dXJuIOivu+WGmeaOp+WItuWZqOexu1xyXG4gKiBAZXhhbXBsZVxyXG4gKiAqL1xyXG4gY29uc3QgVG9vbCA9IHJlcXVpcmUoJy4vdG9vbC5qcycpO1xyXG5cclxuIGNsYXNzIFJ3Y29udHJvbGxlciB7XHJcblx0IGNvbnN0cnVjdG9yKCl7XHJcblx0XHQgdGhpcy5yZWFkbG9jayA9IGZhbHNlOyAvL+ivu+mUgVxyXG4gXHRcdHRoaXMud3JpdGVsb2NrID0gZmFsc2U7IC8v5YaZ6ZSBXHJcbiBcdFx0dGhpcy5xdWV1ZSA9IFtdOyAvL+ivu+WGmeaTjeS9nOe8k+WtmOmYn+WIl1xyXG5cdCB9XHJcblx0IC8qKlxyXG4gXHQgKiDojrflj5blvZPliY3mmK/lkKblj6/ku6XmiafooYzor7vmk43kvZxcclxuIFx0ICovXHJcblx0IHJlYWRlbmFibGUoKXtcclxuXHRcdGlmKHRoaXMud3JpdGVsb2NrKXtcclxuIFx0XHRcdHJldHVybiBmYWxzZTtcclxuIFx0XHR9XHJcbiBcdFx0cmV0dXJuIHRydWU7XHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOiOt+WPluW9k+WJjeaYr+WQpuWPr+S7peaJp+ihjOWGmeaTjeS9nFxyXG4gXHQgKi9cclxuXHQgd3JpdGVlbmFibGUoKXtcclxuXHRcdGlmKHRoaXMud3JpdGVsb2NrIHx8IHRoaXMucmVhZGxvY2spe1xyXG4gXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG4gXHRcdH1cclxuIFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHQgfVxyXG5cdCAvKipcclxuIFx0ICog5omn6KGM6K+75YaZ5pON5L2c6Zif5YiXXHJcbiBcdCAqL1xyXG4gXHQgZXhlY3F1ZXVlKCl7XHJcblx0XHQgd2hpbGUodGhpcy5xdWV1ZS5sZW5ndGggPiAwKXtcclxuIFx0XHRcdHZhciBvYmogPSB0aGlzLnF1ZXVlLnNoaWZ0KCk7XHJcbiBcdFx0XHRpZihvYmoudHlwZSA9PSAncmVhZCcpe1xyXG4gXHRcdFx0XHR0aGlzLl9leGVjcmVhZChvYmouZnVuKTtcclxuIFx0XHRcdH1lbHNlIGlmKG9iai50eXBlID09ICd3cml0ZScpe1xyXG4gXHRcdFx0XHR0aGlzLl9leGVjd3JpdGUob2JqLmZ1bik7XHJcbiBcdFx0XHR9XHJcbiBcdFx0fVxyXG5cdCB9XHJcblx0IC8qKlxyXG4gXHQgKiDnp4HmnInigJTigJTmiafooYzor7vmk43kvZxcclxuIFx0ICovXHJcblx0IF9leGVjcmVhZChmdW4pe1xyXG5cdFx0dGhpcy5yZWFkbG9jayA9IHRydWU7XHJcbiBcdFx0ZnVuKCk7XHJcbiBcdFx0dGhpcy5yZWFkbG9jayA9IGZhbHNlO1xyXG5cdCB9XHJcblx0IC8qKlxyXG4gXHQgKiDnp4HmnInigJTigJTmiafooYzlhpnmk43kvZxcclxuIFx0ICovXHJcblx0IF9leGVjd3JpdGUoZnVuKXtcclxuXHRcdHRoaXMud3JpdGVsb2NrID0gdHJ1ZTtcclxuIFx0XHRmdW4oKTtcclxuIFx0XHR0aGlzLndyaXRlbG9jayA9IGZhbHNlO1xyXG5cdCB9XHJcblx0IC8qKlxyXG4gXHQgKiDlvIDlp4vor7tcclxuICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSAqZnVuIOivu+aTjeS9nOWbnuiwg+WHveaVsFxyXG4gXHQgKi9cclxuXHQgcmVhZChmdW4pe1xyXG5cdFx0IGlmKFRvb2wuaXNGdW5jdGlvbihmdW4pKXtcclxuIFx0XHRcdGlmKHRoaXMucmVhZGVuYWJsZSgpKXtcclxuIFx0XHRcdFx0dGhpcy5fZXhlY3JlYWQoZnVuKTtcclxuIFx0XHRcdFx0dGhpcy5leGVjcXVldWUoKTtcclxuIFx0XHRcdH1lbHNle1xyXG4gXHRcdFx0XHR0aGlzLnF1ZXVlLnB1c2goe1xyXG4gXHRcdFx0XHRcdHR5cGU6ICdyZWFkJyxcclxuIFx0XHRcdFx0XHRmdW46IGZ1blxyXG4gXHRcdFx0XHR9KTtcclxuIFx0XHRcdH1cclxuIFx0XHR9XHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOW8gOWni+WGmVxyXG4gICAgICAqIEBwYXJhbSB7RnVuY3Rpb259ICpmdW4g5YaZ5pON5L2c5Zue6LCD5Ye95pWwXHJcbiBcdCAqL1xyXG5cdCB3cml0ZShmdW4pe1xyXG5cdFx0IGlmKFRvb2wuaXNGdW5jdGlvbihmdW4pKXtcclxuIFx0XHRcdGlmKHRoaXMud3JpdGVlbmFibGUoKSl7XHJcbiBcdFx0XHRcdHRoaXMuX2V4ZWN3cml0ZShmdW4pO1xyXG4gXHRcdFx0XHR0aGlzLmV4ZWNxdWV1ZSgpO1xyXG4gXHRcdFx0fWVsc2V7XHJcbiBcdFx0XHRcdHRoaXMucXVldWUucHVzaCh7XHJcbiBcdFx0XHRcdFx0dHlwZTogJ3dyaXRlJyxcclxuIFx0XHRcdFx0XHRmdW46IGZ1blxyXG4gXHRcdFx0XHR9KTtcclxuIFx0XHRcdH1cclxuIFx0XHR9XHJcblx0IH1cclxuIH1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUndjb250cm9sbGVyO1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlld1xyXG4gKiAgIOe7meaMh+WumuWFg+e0oOWIm+W7unNjcm9sbOS6i+S7tuebkeWQrOexu1xyXG4gKiBAYXV0aG9yIG1pbmdydWl8IG1pbmdydWlAc3RhZmYuc2luYS5jb20uY25cclxuICogQHZlcnNpb24gMS4wIHwgMjAxNS0wOC0yN1xyXG4gKiBAcmV0dXJuIHNjcm9sbOexu1xyXG4gKiBAZXhhbXBsZVxyXG4gKiBcdFx0Y29uc3QgU2Nyb2xsID0gcmVxdWlyZSgnbGlidXRpbC1zY3JvbGwnKTtcclxuICpcclxuICogXHRcdHZhciBzY3JvbGwgPSBuZXcgU2Nyb2xsKCQod2luZG93KSk7XHJcbiAqIFx0XHRzY3JvbGwubGlzdGVuKHtjYWxsOmZ1bmN0aW9uKCl7Y29uc29sZS5sb2coJ+eql+WPo3Njcm9sbCcpO319KTtcclxuICpcclxuICovXHJcblxyXG5jb25zdCBEZWxheWV2dCA9IHJlcXVpcmUoJy4vZGVsYXlldnQuanMnKTtcclxuXHJcbmNsYXNzIFNjcm9sbHtcclxuXHQvKipcclxuXHQgKiBAcGFyYW0ge0VsZW1lbnR9ICpub2RlIOWFg+e0oOiKgueCuVxyXG5cdCAqIEBwYXJhbSB7SlNPTn0gY29uZmlnIOW7tui/n+mFjee9ruOAguWQjGxpYmV2dC9kZWxheWV2dOexu+eahOWIneWni+WMluWPguaVsFxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKG5vZGUsY29uZmlnKXtcclxuXHRcdGlmKG5vZGUubGVuZ3RoID09IDApe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHR0aGlzLmRlbGF5ID0gbmV3IERlbGF5ZXZ0KGNvbmZpZyk7XHJcblx0XHRub2RlLm9uKCdzY3JvbGwnLCgpID0+IHtcclxuXHRcdFx0dGhpcy5kZWxheS5zdGFydCgpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIOa3u+WKoHNjcm9sbOS6i+S7tuebkeWQrFxyXG4gICAgICogQHBhcmFtIHtKU09OfSBvcHRcclxuICAgICAqIHtcclxuICAgICAqICAgY2FsbDogZnVuY3Rpb24vL+S6i+S7tuWPkeeUn+aXtuinpuWPkeeahOWbnuiwg1xyXG5cdCAqICAgZmlsdGVyOiBmdW5jdGlvbiAvL+i/h+a7pOadoeS7tuOAgmZpbHRlcui/lOWbnuS4unRydWXliJnmiY3op6blj5FjYWxs44CC5LiN5aGr5q2k6aG55YiZ6buY6K6k5LiN6L+H5rukXHJcblx0ICogfVxyXG4gICAgICovXHJcbiAgICBsaXN0ZW4ob3B0KXtcclxuXHRcdHRoaXMuZGVsYXkuc3Vic2NyaWJlKG9wdCk7XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIOenu+mZpOebkeWQrFxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdCDlkozosIPnlKhsaXN0ZW7ml7bkuIDmoLfnmoTlj4LmlbDlvJXnlKhcclxuXHQgKi9cclxuXHR1bmxpc3RlbihvcHQpe1xyXG5cdFx0dGhpcy5kZWxheS51bnN1YnNjcmliZShvcHQpO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTY3JvbGw7XHJcbiIsIi8qKlxyXG4gKiDluLjnlKjlsI/lt6XlhbdcclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiB2YXIgVG9vbCA9IHJlcXVpcmUoJ2xpYnV0aWwtdG9vbCcpO1xyXG4gKi9cclxuY29uc3QgVXJsID0gcmVxdWlyZSgndXJsJyk7XHJcblxyXG4vKipcclxuICogZGF0YeaYr+WQpuaYr+aXoOaViOWtl+auteOAguWNs+aYr251bGx8dW5kZWZpbmVkfCcnXHJcbiogQHBhcmFtIHtPYmplY3R9IGRhdGFcclxuICovXHJcbmV4cG9ydHMuaXNJbnZhbGlkID0gZnVuY3Rpb24oZGF0YSl7XHJcblx0aWYoZGF0YSA9PSBudWxsIHx8IGRhdGEgPT0gJycpe1xyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG5cdHJldHVybiBmYWxzZTtcclxufSxcclxuLyoqXHJcbiAqIOaYr+WQpuaYr09iamVjdOWvueixoeeahOWunuS+i++8jOmAmuW4uOeUqOadpeajgOa1i2RhdGHmmK/lkKbmmK/kuIDkuKrnuq/nmoRKU09O5a2X5q615oiWbmV3IE9iamVjdCgpXHJcbiogQHBhcmFtIHtPYmplY3R9IGRhdGFcclxuICovXHJcbmV4cG9ydHMuaXNPYmplY3QgPSBmdW5jdGlvbihkYXRhKXtcclxuXHRyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGRhdGEpID09ICdbb2JqZWN0IE9iamVjdF0nICYmIGRhdGEuY29uc3RydWN0b3IgPT0gT2JqZWN0O1xyXG59LFxyXG4vKipcclxuICog5pWw5o2u57G75Z6L5piv5ZCm5pivb2JqZWN044CC5LiN5LuF5LuF6ZmQ5LqO5piv57qv55qET2JqZWN05a6e5L6L5YyW55qE5a+56LGhXHJcbiAqL1xyXG5leHBvcnRzLmlzT2JqZWN0VHlwZSA9IGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChkYXRhKSA9PSAnW29iamVjdCBPYmplY3RdJztcclxufSxcclxuLyoqXHJcbiAqIOaYr+WQpuaYr2Z1bmN0aW9uXHJcbiogQHBhcmFtIHtPYmplY3R9IGRhdGFcclxuICovXHJcbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKGRhdGEpe1xyXG5cdHJldHVybiB0eXBlb2YgZGF0YSA9PSAnZnVuY3Rpb24nO1xyXG59LFxyXG4vKipcclxuICog5piv5ZCm5pivQXJyYXlcclxuKiBAcGFyYW0ge09iamVjdH0gZGF0YVxyXG4gKi9cclxuZXhwb3J0cy5pc0FycmF5ID0gZnVuY3Rpb24oZGF0YSl7XHJcblx0cmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChkYXRhKSA9PSAnW29iamVjdCBBcnJheV0nO1xyXG59LFxyXG4vKipcclxuICog5piv5ZCm5pivYm9vbGVhblxyXG4qIEBwYXJhbSB7T2JqZWN0fSBkYXRhXHJcbiAqL1xyXG5leHBvcnRzLmlzQm9vbGVhbiA9IGZ1bmN0aW9uKGRhdGEpe1xyXG5cdHJldHVybiB0eXBlb2YgZGF0YSA9PSAnYm9vbGVhbic7XHJcbn0sXHJcbi8qKlxyXG4gKiDmmK/lkKbmmK9TdHJpbmdcclxuKiBAcGFyYW0ge09iamVjdH0gZGF0YVxyXG4gKi9cclxuZXhwb3J0cy5pc1N0cmluZyA9IGZ1bmN0aW9uKGRhdGEpe1xyXG5cdHJldHVybiB0eXBlb2YgZGF0YSA9PSAnc3RyaW5nJztcclxufSxcclxuLyoqXHJcbiAqIOaYr+WQpuaYr051bWJlclxyXG4qIEBwYXJhbSB7T2JqZWN0fSBkYXRhXHJcbiAqL1xyXG5leHBvcnRzLmlzTnVtYmVyID0gZnVuY3Rpb24oZGF0YSl7XHJcblx0cmV0dXJuIHR5cGVvZiBkYXRhID09ICdudW1iZXInO1xyXG59LFxyXG4vKipcclxuICog5piv5ZCm5piv5LiA5Liq5pyJ5pWI55qEanF1ZXJ5IGRvbeWvueixoVxyXG4gKiBAcGFyYW0ge09iamVjdH0gbm9kZVxyXG4gKi9cclxuZXhwb3J0cy5pc1ZhbGlkSnF1ZXJ5RG9tID0gZnVuY3Rpb24obm9kZSl7XHJcblx0cmV0dXJuIG5vZGUgIT0gbnVsbCAmJiB0aGlzLmlzRnVuY3Rpb24obm9kZS5zaXplKSAmJiBub2RlLmxlbmd0aCA+IDA7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDop6PmnpB1cmxcclxuICogQHBhcmFtIHtTdHJpbmd9IHVybCB1cmzlnLDlnYDvvIzkuI3loavliJnlj5Zsb2NhdGlvbi5ocmVmXHJcbiAqIEByZXR1cm4ge09iamVjdH0gdXJsT2JqZWN0IGh0dHBzOi8vbm9kZWpzLm9yZy9kaXN0L2xhdGVzdC12Ni54L2RvY3MvYXBpL3VybC5odG1sI3VybF91cmxfc3RyaW5nc19hbmRfdXJsX29iamVjdHNcclxuICogIHF1ZXJ5OiDlpoLmnpzmsqHmnIlxdWVyee+8jOWImeaYr3t9XHJcbiAqL1xyXG5leHBvcnRzLnVybHBhcnNlID0gZnVuY3Rpb24odXJsKXtcclxuXHR1cmwgPSB1cmwgfHwgbG9jYXRpb24uaHJlZjtcclxuXHJcblx0cmV0dXJuIFVybC5wYXJzZSh1cmwsdHJ1ZSk7XHJcbn1cclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXdcclxuICogICDnm5HlkKx3aW5kb3cgcmVzaXpl44CC5Y+q5pSv5oyBUENcclxuICogQGF1dGhvciBtaW5ncnVpfCBtaW5ncnVpQHN0YWZmLnNpbmEuY29tLmNuXHJcbiAqIEB2ZXJzaW9uIDEuMCB8IDIwMTUtMDgtMjdcclxuICogQGV4YW1wbGVcclxuICogXHRcdGNvbnN0IFdpbnJlc2l6ZSA9IHJlcXVpcmUoJ2xpYnV0aWwtd2lucmVzaXplJyk7XHJcbiAqXHJcbiAqIFx0XHRXaW5yZXNpemUubGlzdGVuKHtjYWxsOmZ1bmN0aW9uKCl7Y29uc29sZS5sb2coJ+eql+WPo3Jlc2l6ZScpO319KTtcclxuICovXHJcbmNvbnN0IFJlc2l6ZSA9IHJlcXVpcmUoJy4vcmVzaXplLmpzJyksXHJcblx0XHREZXZpY2VldnRuYW1lID0gcmVxdWlyZSgnLi9kZXZpY2VldnRuYW1lLmpzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBSZXNpemUoJCh3aW5kb3cpLHtcclxuXHRldnRuYW1lOiBEZXZpY2VldnRuYW1lKycubGliJ1xyXG59KTtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXdcclxuICogICDnqpflj6Pmu5rliqjkuovku7bnm5HlkKxcclxuICogQGF1dGhvciBtaW5ncnVpfCBtaW5ncnVpQHN0YWZmLnNpbmEuY29tLmNuXHJcbiAqIEB2ZXJzaW9uIDEuMCB8IDIwMTUtMDgtMjdcclxuICogQHJldHVybiDmu5rliqjnm5HlkKzlr7nosaFcclxuICogQGV4YW1wbGVcclxuICogXHRcdGNvbnN0IFdpbnNjcm9sbCA9IHJlcXVpcmUoJ2xpYnV0aWwtd2luc2Nyb2xsJyk7XHJcbiAqXHJcbiAqIFx0XHRXaW5zY3JvbGwubGlzdGVuKHtjYWxsOmZ1bmN0aW9uKCl7Y29uc29sZS5sb2coJ+eql+WPo3Njcm9sbCcpO319KTtcclxuICovXHJcblxyXG5jb25zdCBTY3JvbGwgPSByZXF1aXJlKCcuL3Njcm9sbC5qcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBuZXcgU2Nyb2xsKCQod2luZG93KSk7XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IOe6v+eoi+axoOaOp+WItuWZqFxyXG4gKiAgICAgIOi0n+i0o+i/lOWbnuW9k+WJjeepuumXsueahOe6v+eoi+WvueixoVxyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE3LTAxLTE5IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm5cclxuICogQGV4YW1wbGVcclxuICogICAgICBjb25zdCBXb3JrZXJDb250cm9sID0gcmVxdWlyZSgnbGlidXRpbC13b3JrZXJDb250cm9sJyk7XHJcbiAqICovXHJcblxyXG4gY2xhc3MgV29ya2Vye1xyXG4gICAgIC8qKlxyXG4gICAgICAqIOS4gOS4que6v+eoi1xyXG4gICAgICAqL1xyXG4gICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgIHRoaXMubG9jayA9IHRydWU7XHJcbiAgICAgfVxyXG4gfVxyXG5cclxuIGNsYXNzIFdvcmtlckNvbnRyb2wge1xyXG4gICAgIC8qKlxyXG4gICAgICAqIOe6v+eoi+axoOaOp+WItuWZqOexu1xyXG4gICAgICAqIEByZXR1cm4ge1t0eXBlXX0gW2Rlc2NyaXB0aW9uXVxyXG4gICAgICAqL1xyXG4gICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgIHRoaXMuX3dvcmtlcm9ianMgPSBbXTsgLy93b3JrZXJDb250cm9s5a+56LGhXHJcbiAgICAgfVxyXG4gICAgIC8qKlxyXG4gICAgICAqIOi/lOWbnuW9k+WJjeepuumXsueahHdvcmtlckNvbnRyb2zlr7nosaFcclxuICAgICAgKiBAcmV0dXJuIHtbdHlwZV19IFtkZXNjcmlwdGlvbl1cclxuICAgICAgKi9cclxuICAgICBnZXQoKXtcclxuICAgICAgICAgdmFyIGN1cndvcmtlciA9IG51bGw7XHJcbiAgICAgICAgIGZvcih2YXIgaSA9IDAsIGxlbiA9IHRoaXMuX3dvcmtlcm9ianMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xyXG4gICAgICAgICAgICAgaWYodGhpcy5fd29ya2Vyb2Jqc1tpXS5sb2NrID09IGZhbHNlKXsgLy/ml6Lml6Dor7fmsYLlj4jmsqHmnInooqvplIHlrppcclxuICAgICAgICAgICAgICAgICB0aGlzLl93b3JrZXJvYmpzW2ldLmxvY2sgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgIGN1cndvcmtlciA9IHRoaXMuX3dvcmtlcm9ianNbaV07XHJcbiAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICB9XHJcbiAgICAgICAgIH1cclxuICAgICAgICAgaWYoY3Vyd29ya2VyID09IG51bGwpe1xyXG4gICAgICAgICAgICAgY3Vyd29ya2VyID0gbmV3IFdvcmtlcigpO1xyXG4gICAgICAgICAgICAgdGhpcy5fd29ya2Vyb2Jqcy5wdXNoKGN1cndvcmtlcik7XHJcbiAgICAgICAgIH1cclxuICAgICAgICAgcmV0dXJuIGN1cndvcmtlcjtcclxuICAgICB9XHJcbiAgICAgLyoqXHJcbiAgICAgICog6YCa55+l5b2T5YmNd29ya2VyQ29udHJvbOWvueixoeW3sue7j+S9v+eUqOWujOavlVxyXG4gICAgICAqIEBwYXJhbSB7aW5zdGFuY2Ugb2Ygd29ya2VyQ29udHJvbH0gd29ya2VyIOWmguaenOaPkOS+m+S6hndvcmtlcu+8jOWImee7k+adn+atpOe6v+eoi++8m+WmguaenOayoeaPkOS+m++8jOWImee7k+adn+esrOS4gOS4quato+WcqOS9v+eUqOeahOe6v+eoi1xyXG4gICAgICAqIEByZXR1cm4ge2luc3RhbmNlIG9mIHdvcmtlckNvbnRyb2wgfCBudWxsfSDlvZPliY3nu5PmnZ/nmoTnur/nqIvlr7nosaEu5rKh5pyJ5YiZ5Li6bnVsbFxyXG4gICAgICAqL1xyXG4gICAgIGVuZCh3b3JrZXIpe1xyXG4gICAgICAgICB2YXIgY3Vyd29ya2VyID0gbnVsbDtcclxuICAgICAgICAgZm9yKHZhciBpID0gMCwgbGVuID0gdGhpcy5fd29ya2Vyb2Jqcy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XHJcbiAgICAgICAgICAgICBpZih3b3JrZXIpe1xyXG4gICAgICAgICAgICAgICAgIGlmKHRoaXMuX3dvcmtlcm9ianNbaV0gPT0gd29ya2VyKXsgLy/ml6Lml6Dor7fmsYLlj4jmsqHmnInooqvplIHlrppcclxuICAgICAgICAgICAgICAgICAgICAgdGhpcy5fd29ya2Vyb2Jqc1tpXS5sb2NrID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgIGN1cndvcmtlciA9IHRoaXMuX3dvcmtlcm9ianNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgIGlmKHRoaXMuX3dvcmtlcm9ianNbaV0ubG9jayA9PSB0cnVlKXtcclxuICAgICAgICAgICAgICAgICAgICAgdGhpcy5fd29ya2Vyb2Jqc1tpXS5sb2NrID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgIGN1cndvcmtlciA9IHRoaXMuX3dvcmtlcm9ianNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgIH1cclxuICAgICAgICAgfVxyXG4gICAgICAgICByZXR1cm4gY3Vyd29ya2VyO1xyXG4gICAgIH1cclxuICAgICAvKipcclxuICAgICAgKiDmmK/lkKbmiYDmnInnmoTnur/nqIvpg73ooqvkvb/nlKjlrozmr5VcclxuICAgICAgKiBAcmV0dXJuIHtCb29sZWFufSB0cnVl77ya5omA5pyJ57q/56iL6YO956m66ZeyXHJcbiAgICAgICovXHJcbiAgICAgaXNlbmQoKXtcclxuICAgICAgICAgdmFyIHJlc3VsdCA9IHRydWU7XHJcbiAgICAgICAgIGZvcih2YXIgaSA9IDAsIGxlbiA9IHRoaXMuX3dvcmtlcm9ianMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xyXG4gICAgICAgICAgICAgaWYodGhpcy5fd29ya2Vyb2Jqc1tpXS5sb2NrID09IHRydWUpeyAvL+aXouaXoOivt+axguWPiOayoeacieiiq+mUgeWumlxyXG4gICAgICAgICAgICAgICAgIHJlc3VsdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgfVxyXG4gICAgICAgICB9XHJcbiAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgfVxyXG4gfVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBXb3JrZXJDb250cm9sO1xyXG4iLCJleHBvcnRzLklvID0gcmVxdWlyZSgnLi9pbycpO1xyXG5leHBvcnRzLklvQ29uZmlnID0gcmVxdWlyZSgnLi9pb2NvbmZpZycpO1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyBpb+ivt+axguaAu2FcclxuICovXHJcbnJlcXVpcmUoJ3doYXR3Zy1mZXRjaCcpO1xyXG5jb25zdCBJb0NvbmZpZyA9IHJlcXVpcmUoJy4vaW9jb25maWcnKTtcclxuY29uc3QgZXh0ZW5kID0gcmVxdWlyZSgnZXh0ZW5kJyk7XHJcbmNvbnN0IHF1ZXJ5c3RyaW5nID0gcmVxdWlyZSgncXVlcnlzdHJpbmcnKTtcclxuXHJcbi8qKlxyXG4gKiDlsIZkYXRh5qC85byP5YyW5oiQRm9ybURhdGFcclxuICogQHBhcmFtICB7SlNPTn0gZGF0YSBbZGVzY3JpcHRpb25dXHJcbiAqIEByZXR1cm4ge0Zvcm1EYXRhfSAgICAgIFtkZXNjcmlwdGlvbl1cclxuICovXHJcbmZ1bmN0aW9uIGZvcm1hdEZvcm1EYXRhKGRhdGEpe1xyXG4gICAgdmFyIF9mb3JtZGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xyXG4gICAgZGF0YSA9IE9iamVjdC5lbnRyaWVzKGRhdGEpO1xyXG4gICAgZm9yKHZhciBwYWlyIG9mIGRhdGEpe1xyXG4gICAgICAgIHZhciBba2V5LCB2YWxdID0gcGFpcjtcclxuICAgICAgICBpZih2YWwgPT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfWVsc2UgaWYodmFsLmNvbnN0cnVjdG9yID09IEFycmF5KXtcclxuICAgICAgICAgICAgdmFsLmZvckVhY2goKHYsaSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgX2Zvcm1kYXRhLmFwcGVuZChrZXksdik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgX2Zvcm1kYXRhLmFwcGVuZChrZXksdmFsKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gX2Zvcm1kYXRhO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIC8qKlxyXG4gICAgICog5Y+R6LW3aW/or7fmsYJcclxuICAgICAqIEBwYXJhbSAge0pTT059IGlvcGFyYW1zIOWQjGlvY29uZmlnLmlvcGFyYW1zXHJcbiAgICAgKiBAcmV0dXJuIHtbdHlwZV19ICAgICAgICAgIFtkZXNjcmlwdGlvbl1cclxuICAgICAqL1xyXG4gICAgcmVxdWVzdDogZnVuY3Rpb24oaW9wYXJhbXMpIHtcclxuICAgICAgICBpZihpb3BhcmFtcy51cmwgPT0gJycpe1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2lv5Y+C5pWwdXJs5LiN6IO95Li656m6Jyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGNvbmYgPSB7fTtcclxuXHJcbiAgICAgICAgZXh0ZW5kKHRydWUsY29uZixJb0NvbmZpZy5pb3BhcmFtcyxpb3BhcmFtcyk7XHJcblxyXG4gICAgICAgIGNvbmYucmVxdWVzdC5tZXRob2QgPSBjb25mLnJlcXVlc3QubWV0aG9kLnRvVXBwZXJDYXNlKCk7XHJcblxyXG4gICAgICAgIC8v5qOA5rWLaW9wYXJhbXPph4znmoRkYXRhXHJcbiAgICAgICAgdmFyIGJvZHkgPSBjb25mLmRhdGEsIF9tZXRob2QgPSBjb25mLnJlcXVlc3QubWV0aG9kO1xyXG5cclxuICAgICAgICBpZihib2R5ICYmIGJvZHkuY29uc3RydWN0b3IgPT09IE9iamVjdCl7IC8v6K+05piOZGF0YeaYr2pzb25cclxuICAgICAgICAgICAgaWYoX21ldGhvZCAhPSAnR0VUJyAmJiBfbWV0aG9kICE9ICdIRUFEJyAmJiBjb25mLmlzZm9ybWRhdGEpe1xyXG4gICAgICAgICAgICAgICAgYm9keSA9IGZvcm1hdEZvcm1EYXRhKGJvZHkpO1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIGNvbmYuaGVhZGVyc1snQ29udGVudC1UeXBlJ107XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgYm9keSA9IHF1ZXJ5c3RyaW5nLnN0cmluZ2lmeShib2R5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoY29uZi5oZWFkZXJzWydDb250ZW50LVR5cGUnXSA9PT0gZmFsc2Upe1xyXG4gICAgICAgICAgICBkZWxldGUgY29uZi5oZWFkZXJzWydDb250ZW50LVR5cGUnXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8v6LWL5YC8cmVxdWVzdC5ib2R5XHJcbiAgICAgICAgaWYoYm9keSl7XHJcbiAgICAgICAgICAgIHN3aXRjaChfbWV0aG9kKXtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ0dFVCc6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYodHlwZW9mIGJvZHkgPT0gJ3N0cmluZycpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25mLnVybCArPSAnPycrYm9keS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ0hFQUQnOlxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBjb25mLnJlcXVlc3QuYm9keSA9IGJvZHk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8v5Y+R6LW36K+35rGCXHJcbiAgICAgICAgY29uZi5yZXF1ZXN0LmhlYWRlcnMgPSBjb25mLmhlYWRlcnM7XHJcbiAgICAgICAgdmFyIG15cmVxdWVzdCA9IG5ldyBSZXF1ZXN0KGNvbmYudXJsLGNvbmYucmVxdWVzdCk7XHJcblxyXG4gICAgICAgIC8v6K+35rGC5Y+R6LW35YmN57uf5LiA5aSE55CGXHJcbiAgICAgICAgY29uZi5iZWZvcmVTZW5kKCk7XHJcblxyXG4gICAgICAgIHZhciByYWNlID0gUHJvbWlzZS5yYWNlKFtcclxuICAgICAgICAgICAgZmV0Y2gobXlyZXF1ZXN0KSxcclxuICAgICAgICAgICAgbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSxyZWplY3Qpe1xyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChyZWplY3QsY29uZi50aW1lb3V0LG5ldyBFcnJvcign6K+35rGC6LaF5pe2JykpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIF0pO1xyXG4gICAgICAgIHJhY2UudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XHJcbiAgICAgICAgICAgIGlmKHJlc3BvbnNlLm9rKSB7IC8vcmVzcG9uc2Uuc3RhdHVzIFsyMDAsMjk5XVxyXG4gICAgICAgICAgICAgICAgcmVzcG9uc2VbY29uZi50eXBlXSgpLnRoZW4oZnVuY3Rpb24ocmVzdWx0KXtcclxuICAgICAgICAgICAgICAgICAgICBpZihjb25mLmRlYWxmYWlsKXsgLy/lpITnkIbkuJrliqHplJnor69cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoSW9Db25maWcuZmFpbC5maWx0ZXIocmVzdWx0KSl7IC8v5pyJ5Lia5Yqh6ZSZ6K+v5Y+R55SfXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25mW0lvQ29uZmlnLmZhaWwuZnVubmFtZV0ocmVzdWx0LHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7IC8v5peg5Lia5Yqh6ZSZ6K+v5Y+R55SfXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihjb25mLmRlYWxkYXRhKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25mLnN1Y2Nlc3MoY29uZi5kZWFsZGF0YWZ1bihyZXN1bHQpLHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmYuc3VjY2VzcyhyZXN1bHQscmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmYuc3VjY2VzcyhyZXN1bHQscmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sZnVuY3Rpb24oZXJyb3Ipe1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgdmFyIGVycm9yID0gbmV3IEVycm9yKHJlc3BvbnNlLnN0YXR1c1RleHQgfHwgJ+e9kee7nOmUmeivrycpXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25mLmNvbXBsZXRlKCk7XHJcbiAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xyXG4gICAgICAgICAgICAvL+aNleiOt+S7u+S9lemUmeivr++8jOWNs+WPkeeUn+ivreazlemUmeivr+S5n+S8muaNleiOt1xyXG4gICAgICAgICAgICBjb25mLmVycm9yKGVycm9yKTtcclxuICAgICAgICAgICAgY29uZi5jb21wbGV0ZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59O1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyBpb+ivt+axgueahOS4gOS6m+WFrOWFsemFjee9rlxyXG4gKi9cclxuIGNvbnN0IHRoYXQgPSB7XHJcbiAgICAvKipcclxuICAgICAqIOWvueS6juaOpeWPo+i/lOWbnueahOS4muWKoemUmeivr+i/m+ihjOe7n+S4gOWkhOeQhlxyXG4gICAgICogQHR5cGUge09iamVjdH1cclxuICAgICAqL1xyXG4gICAgZmFpbDoge1xyXG4gICAgICAgIGZ1bm5hbWU6ICdmYWlsJywgLy/lvZPlj5HnlJ/kuJrliqHplJnor6/nmoTml7blgJnvvIzosIPnlKjnmoTmlrnms5XlkI1cclxuICAgICAgICBmaWx0ZXI6IGZ1bmN0aW9uKHJlc3VsdCkge1xyXG4gICAgICAgICAgICAvLyBpZihyZXN1bHQuY29kZSAhPSAnQTAwMDEnKXtcclxuICAgICAgICAgICAgLy8gICAgIHJldHVybiB0cnVlOyAvL+ivtOaYjuWPkeeUn+S6huS4muWKoemUmeivr1xyXG4gICAgICAgICAgICAvLyB9ZWxzZXtcclxuICAgICAgICAgICAgLy8gICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIOivt+axguWktOmDqOmFjee9rlxyXG4gICAgICogQHR5cGUge09iamVjdH1cclxuICAgICAqL1xyXG4gICAgaGVhZGVyczoge1xyXG4gICAgICAgIC8v5aaC5p6cQ29udGVudC1UeXBl6K6+572u5Li6ZmFsc2Us5YiZ5LiN5LygQ29udGVudC1UeXBlXHJcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXHJcbiAgICB9LFxyXG4gICAgLyoqXHJcbiAgICAgKiDor7fmsYLlr7nosaHlj4LmlbDphY3nva5cclxuICAgICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICAgKi9cclxuICAgIHJlcXVlc3Q6IHtcclxuICAgICAgICBtZXRob2Q6ICdHRVQnLCAvL0dFVHxQT1NUXHJcbiAgICAgICAgbW9kZTogJ2NvcnMnLCAvL2NvcnN8bm8tY29yc3xzYW1lLW9yaWdpbnxuYXZpZ2F0ZVxyXG4gICAgICAgIC8v5YW25LuW5Y+C5pWwXHJcbiAgICAgICAgLy9ib2R5OiBjcmVkZW50aWFsczogY2FjaGU6IHJlZGlyZWN0OiByZWZlcnJlcjogaW50ZWdyaXR5XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogc2FtZS1vcmlnaW46IOWQjGFqYXjkuIDmoLfvvIzlkIzln5/lj5HpgIFjb29raWVcclxuICAgICAgICAgKiBpbmNsdWRlOiDot6jln5/lj5HpgIFjb29raWVcclxuICAgICAgICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nXHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICog6LCD55SoaW/nu4Tku7bvvIzkvKDlhaXnmoTlj4LmlbDmoLzlvI9cclxuICogQHR5cGUge09iamVjdH1cclxuICovXHJcbnRoYXQuaW9wYXJhbXMgPSB7XHJcbiAgICBoZWFkZXJzOiB0aGF0LmhlYWRlcnMsIC8v5ZCMaGVhZGVyc1xyXG4gICAgcmVxdWVzdDogdGhhdC5yZXF1ZXN0LCAvL+WQjHJlcXVlc3RcclxuICAgIC8qKlxyXG4gICAgICog6K+35rGC5Y+C5pWw44CC5Y+v5Lul5piv5Lul5LiL5Yeg56eN57G75Z6L77yaXHJcbiAgICAgKiBCb2xiXHJcbiAgICAgKiBCdWZmZXJTb3VyY2VcclxuICAgICAqIEZvcm1EYXRhXHJcbiAgICAgKiBVUkxTZWFyY2hQYXJhbXNcclxuICAgICAqIFVTVlN0cmluZ1xyXG4gICAgICogU3RyaW5nXHJcbiAgICAgKiBKU09OOiDlpoLmnpzmmK9qc29uLCDliJnlgZrnibnmrorlpITnkIbvvIzor7fop4HkuIvpnaJpc2Zvcm1kYXRh55qE6K+05piOXHJcbiAgICAgKi9cclxuICAgIC8vIGRhdGE6IHt9LFxyXG4gICAgLyoqXHJcbiAgICAgKiDlpoLmnpxkYXRh5pivanNvbjpcclxuICAgICAqICAxLiByZXF1ZXN0Lm1ldGhvZOS4jeaYr0dFVOaIlkhFQUQsIOS4lGlzZm9ybWRhdGHkuLp0cnVlLCDpgqPkuYjlsIZkYXRh6L2s5o2i5oiQRm9ybURhdGHmoLzlvI9cclxuICAgICAqICAyLiDlpoLmnpzkuI3nrKblkIjnrKwx56eN77yM5bCGZGF0Yei9rOaNouaIkHF1ZXJ5c3RyaW5nXHJcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgaXNmb3JtZGF0YTogZmFsc2UsXHJcbiAgICB1cmw6ICcnLCAvL+ivt+axgnVybOWcsOWdgFxyXG4gICAgLyoqXHJcbiAgICAgKiDor7fmsYLnmoTmlbDmja7nsbvlnovvvIzpu5jorqTkuLpqc29uLiDmlbDmja7nsbvlnovlkoxyZXBvbnNl5a+56LGh6L+U5Zue6I635Y+W57uT5p6c55qE5pa55rOV5a+55bqU5YWz57O75aaC5LiLXHJcbiAgICAgKiBhcnJheUJ1ZmZlcjogcmVzcG9uc2UuYXJyYXlCdWZmZXJcclxuICAgICAqIGJsb2I6IHJlc3BvbnNlLmJsb2JcclxuICAgICAqIGZvcm1EYXRhOiByZXNwb25zZS5mb3JtRGF0YSxcclxuICAgICAqIGpzb246IHJlc3BvbnNlLmpzb24sXHJcbiAgICAgKiB0ZXh0OiByZXNwb25zZS50ZXh0XHJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAgICovXHJcbiAgICB0eXBlOiAnanNvbicsXHJcbiAgICB0aW1lb3V0OiA2MDAwLFxyXG4gICAgLyoqXHJcbiAgICAgKiBpb+ivt+axguWJje+8jOe7n+S4gOeahOWkhOeQhlxyXG4gICAgICogQHJldHVybiB7W3R5cGVdfSBbZGVzY3JpcHRpb25dXHJcbiAgICAgKi9cclxuICAgIGJlZm9yZVNlbmQ6IGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgfSxcclxuICAgIC8qKlxyXG4gICAgICog5a+55LqO5o6l5Y+j6L+U5Zue6ZSZ6K+v77yM5LiA6Iis5Zug5Li6572R57uc5Y6f5Zug77yM6L+b6KGM55qE57uf5LiA5aSE55CGXHJcbiAgICAgKi9cclxuICAgIGVycm9yOiBmdW5jdGlvbihlcnJvcil7XHJcbiAgICAgICAgLy9lcnJvcuaIluacieaIluaXoCBlcnJvci5tZXNzYWdlXHJcbiAgICAgICAgLy9BbGVydC5hbGVydCgn57O757uf5raI5oGvJyxlcnJvci5tZXNzYWdlIHx8ICfkurLvvIzlv5nkuI3ov4fmnaXkuoYnKTtcclxuICAgIH0sXHJcbiAgICAvKipcclxuICAgICAqIOWmguaenGZhaWzphY3nva7kuoZmdW5uYW1l5Li6ZmFpbCzliJnosIPnlKjmraTmlrnms5UuIOatpOaXtmZhaWwuZmlsdGVy6L+U5ZuedHJ1ZVxyXG4gICAgICogQHBhcmFtIHtPYmplY3R8T3RoZXJ9IHJlc3VsdCDmjqXlj6Pov5Tlm57mlbDmja5cclxuICAgICAqIEBwYXJhbSB7UmVzcG9uc2V9IHJlc3BvbnNlIOi/lOWbnueahHJlc3BvbnNl5a+56LGhXHJcbiAgICAgKiBAcmV0dXJuIHtbdHlwZV19IFtkZXNjcmlwdGlvbl1cclxuICAgICAqL1xyXG4gICAgZmFpbDogZnVuY3Rpb24ocmVzdWx0LHJlc3BvbnNlKXtcclxuICAgICAgICAvL0FsZXJ0LmFsZXJ0KCfns7vnu5/mtojmga8nLHJlc3VsdC5lcnJtc2cgfHwgJ+S6su+8jOW/meS4jei/h+adpeS6hicpO1xyXG4gICAgfSxcclxuICAgIC8qKlxyXG4gICAgICog5oiQ5Yqf6LCD55So5pa55rOV44CC6LCD55So55qE5oOF5Ya15pyJ5aaC5LiL5Yeg56eN77yaXHJcbiAgICAgKiAxLiBkZWFsZmFpbOS4unRydWUsIOWImWZhaWwuZmlsdGVy6L+U5ZueZmFsc2Xml7bvvIzosIPnlKhzdWNjZXNzXHJcbiAgICAgKiAgICAgICAgICDmraTml7blpoLmnpxkZWFsZGF0YeS4unRydWUsIOWImXJlc3VsdOS4umRlYWxkYXRhZnVu6L+U5Zue55qE5pWw5o2uXHJcbiAgICAgKiAyLiBkZWFsZmFpbOS4umZhbHNl5pe277yM5YiZ5o6l5Y+j6L+U5Zue5ZCO55u05o6l6LCD55So5q2k5pa55rOV77yI5LiN5Y+R55SfZXJyb3LnmoTmg4XlhrXkuIvvvIlcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdHxPdGhlcn0gcmVzdWx0IOaOpeWPo+i/lOWbnuaVsOaNrlxyXG4gICAgICogQHBhcmFtIHtSZXNwb25zZX0gcmVzcG9uc2Ug6L+U5Zue55qEcmVzcG9uc2Xlr7nosaFcclxuICAgICAqL1xyXG4gICAgc3VjY2VzczogZnVuY3Rpb24ocmVzdWx0LHJlc3BvbnNlKXt9LFxyXG4gICAgLyoqXHJcbiAgICAgKiDmjqXlj6Por7fmsYLlrozmr5XosIPnlKjjgILml6DorrpzdWNjZXNzLGZhaWwsZXJyb3JcclxuICAgICAqIEByZXR1cm4ge1t0eXBlXX0gW2Rlc2NyaXB0aW9uXVxyXG4gICAgICovXHJcbiAgICBjb21wbGV0ZTogZnVuY3Rpb24oKXt9LFxyXG4gICAgLyoqXHJcbiAgICAgKiDlpoLmnpxkZWFsZGF0YeS4unRydWUsIOWImXN1Y2Nlc3PnmoRyZXN1bHTkuLrmraTmlrnms5Xov5Tlm57nmoTmlbDmja5cclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fE90aGVyfSByZXN1bHQg5o6l5Y+j6L+U5Zue5pWw5o2uXHJcbiAgICAgKiBAcmV0dXJuIHtbdHlwZV19ICAgICAgICBbZGVzY3JpcHRpb25dXHJcbiAgICAgKi9cclxuICAgIGRlYWxkYXRhZnVuOiBmdW5jdGlvbihyZXN1bHQpe3JldHVybiByZXN1bHQuZGF0YX0sXHJcbiAgICAvKipcclxuICAgICAqIOaYr+WQpue7n+S4gOWkhOeQhuS4muWKoemUmeivr1xyXG4gICAgICogQHR5cGUge0Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGRlYWxmYWlsOiB0cnVlLCAvL+aYr+WQpue7n+S4gOWkhOeQhuS4muWKoemUmeivr1xyXG4gICAgLyoqXHJcbiAgICAgKiDlvZPkuJrliqHmiJDlip/ml7bvvIzosIPnlKhzdWNjZXNz5YmN77yM5piv5ZCm57uf5LiA5qC85byP5YyW5pWw5o2uXHJcbiAgICAgKiDlpoLmnpxkZWFsZmFpbOS4unRydWUs5bm25LiUZmFpbC5maWx0ZXLov5Tlm57kuLpmYWxzZeaXtu+8jOWmguaenOatpOmhueiuvue9ruS4unRydWUs5YiZ6LCD55SoZGVhbGRhdGFmdW7mlrnms5XvvIzov5Tlm57lpITnkIblkI7nmoTmlbDmja5cclxuICAgICAqIEB0eXBlIHtCb29sZWFufVxyXG4gICAgICovXHJcbiAgICBkZWFsZGF0YTogdHJ1ZVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB0aGF0O1xyXG4iLCIoZnVuY3Rpb24oc2VsZikge1xuICAndXNlIHN0cmljdCc7XG5cbiAgaWYgKHNlbGYuZmV0Y2gpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIHZhciBzdXBwb3J0ID0ge1xuICAgIHNlYXJjaFBhcmFtczogJ1VSTFNlYXJjaFBhcmFtcycgaW4gc2VsZixcbiAgICBpdGVyYWJsZTogJ1N5bWJvbCcgaW4gc2VsZiAmJiAnaXRlcmF0b3InIGluIFN5bWJvbCxcbiAgICBibG9iOiAnRmlsZVJlYWRlcicgaW4gc2VsZiAmJiAnQmxvYicgaW4gc2VsZiAmJiAoZnVuY3Rpb24oKSB7XG4gICAgICB0cnkge1xuICAgICAgICBuZXcgQmxvYigpXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfSkoKSxcbiAgICBmb3JtRGF0YTogJ0Zvcm1EYXRhJyBpbiBzZWxmLFxuICAgIGFycmF5QnVmZmVyOiAnQXJyYXlCdWZmZXInIGluIHNlbGZcbiAgfVxuXG4gIGlmIChzdXBwb3J0LmFycmF5QnVmZmVyKSB7XG4gICAgdmFyIHZpZXdDbGFzc2VzID0gW1xuICAgICAgJ1tvYmplY3QgSW50OEFycmF5XScsXG4gICAgICAnW29iamVjdCBVaW50OEFycmF5XScsXG4gICAgICAnW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgSW50MTZBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgVWludDE2QXJyYXldJyxcbiAgICAgICdbb2JqZWN0IEludDMyQXJyYXldJyxcbiAgICAgICdbb2JqZWN0IFVpbnQzMkFycmF5XScsXG4gICAgICAnW29iamVjdCBGbG9hdDMyQXJyYXldJyxcbiAgICAgICdbb2JqZWN0IEZsb2F0NjRBcnJheV0nXG4gICAgXVxuXG4gICAgdmFyIGlzRGF0YVZpZXcgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBvYmogJiYgRGF0YVZpZXcucHJvdG90eXBlLmlzUHJvdG90eXBlT2Yob2JqKVxuICAgIH1cblxuICAgIHZhciBpc0FycmF5QnVmZmVyVmlldyA9IEFycmF5QnVmZmVyLmlzVmlldyB8fCBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBvYmogJiYgdmlld0NsYXNzZXMuaW5kZXhPZihPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSkgPiAtMVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZU5hbWUobmFtZSkge1xuICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIG5hbWUgPSBTdHJpbmcobmFtZSlcbiAgICB9XG4gICAgaWYgKC9bXmEtejAtOVxcLSMkJSYnKisuXFxeX2B8fl0vaS50ZXN0KG5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGNoYXJhY3RlciBpbiBoZWFkZXIgZmllbGQgbmFtZScpXG4gICAgfVxuICAgIHJldHVybiBuYW1lLnRvTG93ZXJDYXNlKClcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZVZhbHVlKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHZhbHVlID0gU3RyaW5nKHZhbHVlKVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWVcbiAgfVxuXG4gIC8vIEJ1aWxkIGEgZGVzdHJ1Y3RpdmUgaXRlcmF0b3IgZm9yIHRoZSB2YWx1ZSBsaXN0XG4gIGZ1bmN0aW9uIGl0ZXJhdG9yRm9yKGl0ZW1zKSB7XG4gICAgdmFyIGl0ZXJhdG9yID0ge1xuICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGl0ZW1zLnNoaWZ0KClcbiAgICAgICAgcmV0dXJuIHtkb25lOiB2YWx1ZSA9PT0gdW5kZWZpbmVkLCB2YWx1ZTogdmFsdWV9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuaXRlcmFibGUpIHtcbiAgICAgIGl0ZXJhdG9yW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGl0ZXJhdG9yXG4gIH1cblxuICBmdW5jdGlvbiBIZWFkZXJzKGhlYWRlcnMpIHtcbiAgICB0aGlzLm1hcCA9IHt9XG5cbiAgICBpZiAoaGVhZGVycyBpbnN0YW5jZW9mIEhlYWRlcnMpIHtcbiAgICAgIGhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICB0aGlzLmFwcGVuZChuYW1lLCB2YWx1ZSlcbiAgICAgIH0sIHRoaXMpXG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGhlYWRlcnMpKSB7XG4gICAgICBoZWFkZXJzLmZvckVhY2goZnVuY3Rpb24oaGVhZGVyKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kKGhlYWRlclswXSwgaGVhZGVyWzFdKVxuICAgICAgfSwgdGhpcylcbiAgICB9IGVsc2UgaWYgKGhlYWRlcnMpIHtcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGhlYWRlcnMpLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgICB0aGlzLmFwcGVuZChuYW1lLCBoZWFkZXJzW25hbWVdKVxuICAgICAgfSwgdGhpcylcbiAgICB9XG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5hcHBlbmQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIG5hbWUgPSBub3JtYWxpemVOYW1lKG5hbWUpXG4gICAgdmFsdWUgPSBub3JtYWxpemVWYWx1ZSh2YWx1ZSlcbiAgICB2YXIgb2xkVmFsdWUgPSB0aGlzLm1hcFtuYW1lXVxuICAgIHRoaXMubWFwW25hbWVdID0gb2xkVmFsdWUgPyBvbGRWYWx1ZSsnLCcrdmFsdWUgOiB2YWx1ZVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGVbJ2RlbGV0ZSddID0gZnVuY3Rpb24obmFtZSkge1xuICAgIGRlbGV0ZSB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24obmFtZSkge1xuICAgIG5hbWUgPSBub3JtYWxpemVOYW1lKG5hbWUpXG4gICAgcmV0dXJuIHRoaXMuaGFzKG5hbWUpID8gdGhpcy5tYXBbbmFtZV0gOiBudWxsXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwLmhhc093blByb3BlcnR5KG5vcm1hbGl6ZU5hbWUobmFtZSkpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldID0gbm9ybWFsaXplVmFsdWUodmFsdWUpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24oY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMubWFwKSB7XG4gICAgICBpZiAodGhpcy5tYXAuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzQXJnLCB0aGlzLm1hcFtuYW1lXSwgbmFtZSwgdGhpcylcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5rZXlzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGl0ZW1zID0gW11cbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHsgaXRlbXMucHVzaChuYW1lKSB9KVxuICAgIHJldHVybiBpdGVyYXRvckZvcihpdGVtcylcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLnZhbHVlcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpdGVtcyA9IFtdXG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKSB7IGl0ZW1zLnB1c2godmFsdWUpIH0pXG4gICAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZW50cmllcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpdGVtcyA9IFtdXG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7IGl0ZW1zLnB1c2goW25hbWUsIHZhbHVlXSkgfSlcbiAgICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG4gIH1cblxuICBpZiAoc3VwcG9ydC5pdGVyYWJsZSkge1xuICAgIEhlYWRlcnMucHJvdG90eXBlW1N5bWJvbC5pdGVyYXRvcl0gPSBIZWFkZXJzLnByb3RvdHlwZS5lbnRyaWVzXG4gIH1cblxuICBmdW5jdGlvbiBjb25zdW1lZChib2R5KSB7XG4gICAgaWYgKGJvZHkuYm9keVVzZWQpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVHlwZUVycm9yKCdBbHJlYWR5IHJlYWQnKSlcbiAgICB9XG4gICAgYm9keS5ib2R5VXNlZCA9IHRydWVcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlc29sdmUocmVhZGVyLnJlc3VsdClcbiAgICAgIH1cbiAgICAgIHJlYWRlci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChyZWFkZXIuZXJyb3IpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRCbG9iQXNBcnJheUJ1ZmZlcihibG9iKSB7XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICB2YXIgcHJvbWlzZSA9IGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpXG4gICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKGJsb2IpXG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRCbG9iQXNUZXh0KGJsb2IpIHtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgIHZhciBwcm9taXNlID0gZmlsZVJlYWRlclJlYWR5KHJlYWRlcilcbiAgICByZWFkZXIucmVhZEFzVGV4dChibG9iKVxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQXJyYXlCdWZmZXJBc1RleHQoYnVmKSB7XG4gICAgdmFyIHZpZXcgPSBuZXcgVWludDhBcnJheShidWYpXG4gICAgdmFyIGNoYXJzID0gbmV3IEFycmF5KHZpZXcubGVuZ3RoKVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2aWV3Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBjaGFyc1tpXSA9IFN0cmluZy5mcm9tQ2hhckNvZGUodmlld1tpXSlcbiAgICB9XG4gICAgcmV0dXJuIGNoYXJzLmpvaW4oJycpXG4gIH1cblxuICBmdW5jdGlvbiBidWZmZXJDbG9uZShidWYpIHtcbiAgICBpZiAoYnVmLnNsaWNlKSB7XG4gICAgICByZXR1cm4gYnVmLnNsaWNlKDApXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmLmJ5dGVMZW5ndGgpXG4gICAgICB2aWV3LnNldChuZXcgVWludDhBcnJheShidWYpKVxuICAgICAgcmV0dXJuIHZpZXcuYnVmZmVyXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gQm9keSgpIHtcbiAgICB0aGlzLmJvZHlVc2VkID0gZmFsc2VcblxuICAgIHRoaXMuX2luaXRCb2R5ID0gZnVuY3Rpb24oYm9keSkge1xuICAgICAgdGhpcy5fYm9keUluaXQgPSBib2R5XG4gICAgICBpZiAoIWJvZHkpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSAnJ1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYmxvYiAmJiBCbG9iLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlCbG9iID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmZvcm1EYXRhICYmIEZvcm1EYXRhLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlGb3JtRGF0YSA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5zZWFyY2hQYXJhbXMgJiYgVVJMU2VhcmNoUGFyYW1zLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gYm9keS50b1N0cmluZygpXG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYXJyYXlCdWZmZXIgJiYgc3VwcG9ydC5ibG9iICYmIGlzRGF0YVZpZXcoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUFycmF5QnVmZmVyID0gYnVmZmVyQ2xvbmUoYm9keS5idWZmZXIpXG4gICAgICAgIC8vIElFIDEwLTExIGNhbid0IGhhbmRsZSBhIERhdGFWaWV3IGJvZHkuXG4gICAgICAgIHRoaXMuX2JvZHlJbml0ID0gbmV3IEJsb2IoW3RoaXMuX2JvZHlBcnJheUJ1ZmZlcl0pXG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYXJyYXlCdWZmZXIgJiYgKEFycmF5QnVmZmVyLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpIHx8IGlzQXJyYXlCdWZmZXJWaWV3KGJvZHkpKSkge1xuICAgICAgICB0aGlzLl9ib2R5QXJyYXlCdWZmZXIgPSBidWZmZXJDbG9uZShib2R5KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bnN1cHBvcnRlZCBCb2R5SW5pdCB0eXBlJylcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLmhlYWRlcnMuZ2V0KCdjb250ZW50LXR5cGUnKSkge1xuICAgICAgICBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgJ3RleHQvcGxhaW47Y2hhcnNldD1VVEYtOCcpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUJsb2IgJiYgdGhpcy5fYm9keUJsb2IudHlwZSkge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsIHRoaXMuX2JvZHlCbG9iLnR5cGUpXG4gICAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5zZWFyY2hQYXJhbXMgJiYgVVJMU2VhcmNoUGFyYW1zLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDtjaGFyc2V0PVVURi04JylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0LmJsb2IpIHtcbiAgICAgIHRoaXMuYmxvYiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0ZWRcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9ib2R5QmxvYikge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keUJsb2IpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUFycmF5QnVmZmVyKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgQmxvYihbdGhpcy5fYm9keUFycmF5QnVmZmVyXSkpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUZvcm1EYXRhKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZCBub3QgcmVhZCBGb3JtRGF0YSBib2R5IGFzIGJsb2InKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IEJsb2IoW3RoaXMuX2JvZHlUZXh0XSkpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5hcnJheUJ1ZmZlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5fYm9keUFycmF5QnVmZmVyKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbnN1bWVkKHRoaXMpIHx8IFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuYmxvYigpLnRoZW4ocmVhZEJsb2JBc0FycmF5QnVmZmVyKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy50ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICAgIHJldHVybiByZWplY3RlZFxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fYm9keUJsb2IpIHtcbiAgICAgICAgcmV0dXJuIHJlYWRCbG9iQXNUZXh0KHRoaXMuX2JvZHlCbG9iKVxuICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZWFkQXJyYXlCdWZmZXJBc1RleHQodGhpcy5fYm9keUFycmF5QnVmZmVyKSlcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUZvcm1EYXRhKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyB0ZXh0JylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keVRleHQpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuZm9ybURhdGEpIHtcbiAgICAgIHRoaXMuZm9ybURhdGEgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oZGVjb2RlKVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuanNvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oSlNPTi5wYXJzZSlcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLy8gSFRUUCBtZXRob2RzIHdob3NlIGNhcGl0YWxpemF0aW9uIHNob3VsZCBiZSBub3JtYWxpemVkXG4gIHZhciBtZXRob2RzID0gWydERUxFVEUnLCAnR0VUJywgJ0hFQUQnLCAnT1BUSU9OUycsICdQT1NUJywgJ1BVVCddXG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplTWV0aG9kKG1ldGhvZCkge1xuICAgIHZhciB1cGNhc2VkID0gbWV0aG9kLnRvVXBwZXJDYXNlKClcbiAgICByZXR1cm4gKG1ldGhvZHMuaW5kZXhPZih1cGNhc2VkKSA+IC0xKSA/IHVwY2FzZWQgOiBtZXRob2RcbiAgfVxuXG4gIGZ1bmN0aW9uIFJlcXVlc3QoaW5wdXQsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICAgIHZhciBib2R5ID0gb3B0aW9ucy5ib2R5XG5cbiAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBSZXF1ZXN0KSB7XG4gICAgICBpZiAoaW5wdXQuYm9keVVzZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJylcbiAgICAgIH1cbiAgICAgIHRoaXMudXJsID0gaW5wdXQudXJsXG4gICAgICB0aGlzLmNyZWRlbnRpYWxzID0gaW5wdXQuY3JlZGVudGlhbHNcbiAgICAgIGlmICghb3B0aW9ucy5oZWFkZXJzKSB7XG4gICAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKGlucHV0LmhlYWRlcnMpXG4gICAgICB9XG4gICAgICB0aGlzLm1ldGhvZCA9IGlucHV0Lm1ldGhvZFxuICAgICAgdGhpcy5tb2RlID0gaW5wdXQubW9kZVxuICAgICAgaWYgKCFib2R5ICYmIGlucHV0Ll9ib2R5SW5pdCAhPSBudWxsKSB7XG4gICAgICAgIGJvZHkgPSBpbnB1dC5fYm9keUluaXRcbiAgICAgICAgaW5wdXQuYm9keVVzZWQgPSB0cnVlXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudXJsID0gU3RyaW5nKGlucHV0KVxuICAgIH1cblxuICAgIHRoaXMuY3JlZGVudGlhbHMgPSBvcHRpb25zLmNyZWRlbnRpYWxzIHx8IHRoaXMuY3JlZGVudGlhbHMgfHwgJ29taXQnXG4gICAgaWYgKG9wdGlvbnMuaGVhZGVycyB8fCAhdGhpcy5oZWFkZXJzKSB7XG4gICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpXG4gICAgfVxuICAgIHRoaXMubWV0aG9kID0gbm9ybWFsaXplTWV0aG9kKG9wdGlvbnMubWV0aG9kIHx8IHRoaXMubWV0aG9kIHx8ICdHRVQnKVxuICAgIHRoaXMubW9kZSA9IG9wdGlvbnMubW9kZSB8fCB0aGlzLm1vZGUgfHwgbnVsbFxuICAgIHRoaXMucmVmZXJyZXIgPSBudWxsXG5cbiAgICBpZiAoKHRoaXMubWV0aG9kID09PSAnR0VUJyB8fCB0aGlzLm1ldGhvZCA9PT0gJ0hFQUQnKSAmJiBib2R5KSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdCb2R5IG5vdCBhbGxvd2VkIGZvciBHRVQgb3IgSEVBRCByZXF1ZXN0cycpXG4gICAgfVxuICAgIHRoaXMuX2luaXRCb2R5KGJvZHkpXG4gIH1cblxuICBSZXF1ZXN0LnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCh0aGlzLCB7IGJvZHk6IHRoaXMuX2JvZHlJbml0IH0pXG4gIH1cblxuICBmdW5jdGlvbiBkZWNvZGUoYm9keSkge1xuICAgIHZhciBmb3JtID0gbmV3IEZvcm1EYXRhKClcbiAgICBib2R5LnRyaW0oKS5zcGxpdCgnJicpLmZvckVhY2goZnVuY3Rpb24oYnl0ZXMpIHtcbiAgICAgIGlmIChieXRlcykge1xuICAgICAgICB2YXIgc3BsaXQgPSBieXRlcy5zcGxpdCgnPScpXG4gICAgICAgIHZhciBuYW1lID0gc3BsaXQuc2hpZnQoKS5yZXBsYWNlKC9cXCsvZywgJyAnKVxuICAgICAgICB2YXIgdmFsdWUgPSBzcGxpdC5qb2luKCc9JykucmVwbGFjZSgvXFwrL2csICcgJylcbiAgICAgICAgZm9ybS5hcHBlbmQoZGVjb2RlVVJJQ29tcG9uZW50KG5hbWUpLCBkZWNvZGVVUklDb21wb25lbnQodmFsdWUpKVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIGZvcm1cbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlSGVhZGVycyhyYXdIZWFkZXJzKSB7XG4gICAgdmFyIGhlYWRlcnMgPSBuZXcgSGVhZGVycygpXG4gICAgcmF3SGVhZGVycy5zcGxpdCgvXFxyP1xcbi8pLmZvckVhY2goZnVuY3Rpb24obGluZSkge1xuICAgICAgdmFyIHBhcnRzID0gbGluZS5zcGxpdCgnOicpXG4gICAgICB2YXIga2V5ID0gcGFydHMuc2hpZnQoKS50cmltKClcbiAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gcGFydHMuam9pbignOicpLnRyaW0oKVxuICAgICAgICBoZWFkZXJzLmFwcGVuZChrZXksIHZhbHVlKVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIGhlYWRlcnNcbiAgfVxuXG4gIEJvZHkuY2FsbChSZXF1ZXN0LnByb3RvdHlwZSlcblxuICBmdW5jdGlvbiBSZXNwb25zZShib2R5SW5pdCwgb3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IHt9XG4gICAgfVxuXG4gICAgdGhpcy50eXBlID0gJ2RlZmF1bHQnXG4gICAgdGhpcy5zdGF0dXMgPSAnc3RhdHVzJyBpbiBvcHRpb25zID8gb3B0aW9ucy5zdGF0dXMgOiAyMDBcbiAgICB0aGlzLm9rID0gdGhpcy5zdGF0dXMgPj0gMjAwICYmIHRoaXMuc3RhdHVzIDwgMzAwXG4gICAgdGhpcy5zdGF0dXNUZXh0ID0gJ3N0YXR1c1RleHQnIGluIG9wdGlvbnMgPyBvcHRpb25zLnN0YXR1c1RleHQgOiAnT0snXG4gICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMob3B0aW9ucy5oZWFkZXJzKVxuICAgIHRoaXMudXJsID0gb3B0aW9ucy51cmwgfHwgJydcbiAgICB0aGlzLl9pbml0Qm9keShib2R5SW5pdClcbiAgfVxuXG4gIEJvZHkuY2FsbChSZXNwb25zZS5wcm90b3R5cGUpXG5cbiAgUmVzcG9uc2UucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZSh0aGlzLl9ib2R5SW5pdCwge1xuICAgICAgc3RhdHVzOiB0aGlzLnN0YXR1cyxcbiAgICAgIHN0YXR1c1RleHQ6IHRoaXMuc3RhdHVzVGV4dCxcbiAgICAgIGhlYWRlcnM6IG5ldyBIZWFkZXJzKHRoaXMuaGVhZGVycyksXG4gICAgICB1cmw6IHRoaXMudXJsXG4gICAgfSlcbiAgfVxuXG4gIFJlc3BvbnNlLmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKG51bGwsIHtzdGF0dXM6IDAsIHN0YXR1c1RleHQ6ICcnfSlcbiAgICByZXNwb25zZS50eXBlID0gJ2Vycm9yJ1xuICAgIHJldHVybiByZXNwb25zZVxuICB9XG5cbiAgdmFyIHJlZGlyZWN0U3RhdHVzZXMgPSBbMzAxLCAzMDIsIDMwMywgMzA3LCAzMDhdXG5cbiAgUmVzcG9uc2UucmVkaXJlY3QgPSBmdW5jdGlvbih1cmwsIHN0YXR1cykge1xuICAgIGlmIChyZWRpcmVjdFN0YXR1c2VzLmluZGV4T2Yoc3RhdHVzKSA9PT0gLTEpIHtcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbnZhbGlkIHN0YXR1cyBjb2RlJylcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKG51bGwsIHtzdGF0dXM6IHN0YXR1cywgaGVhZGVyczoge2xvY2F0aW9uOiB1cmx9fSlcbiAgfVxuXG4gIHNlbGYuSGVhZGVycyA9IEhlYWRlcnNcbiAgc2VsZi5SZXF1ZXN0ID0gUmVxdWVzdFxuICBzZWxmLlJlc3BvbnNlID0gUmVzcG9uc2VcblxuICBzZWxmLmZldGNoID0gZnVuY3Rpb24oaW5wdXQsIGluaXQpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgcmVxdWVzdCA9IG5ldyBSZXF1ZXN0KGlucHV0LCBpbml0KVxuICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG5cbiAgICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICAgICAgc3RhdHVzOiB4aHIuc3RhdHVzLFxuICAgICAgICAgIHN0YXR1c1RleHQ6IHhoci5zdGF0dXNUZXh0LFxuICAgICAgICAgIGhlYWRlcnM6IHBhcnNlSGVhZGVycyh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkgfHwgJycpXG4gICAgICAgIH1cbiAgICAgICAgb3B0aW9ucy51cmwgPSAncmVzcG9uc2VVUkwnIGluIHhociA/IHhoci5yZXNwb25zZVVSTCA6IG9wdGlvbnMuaGVhZGVycy5nZXQoJ1gtUmVxdWVzdC1VUkwnKVxuICAgICAgICB2YXIgYm9keSA9ICdyZXNwb25zZScgaW4geGhyID8geGhyLnJlc3BvbnNlIDogeGhyLnJlc3BvbnNlVGV4dFxuICAgICAgICByZXNvbHZlKG5ldyBSZXNwb25zZShib2R5LCBvcHRpb25zKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ05ldHdvcmsgcmVxdWVzdCBmYWlsZWQnKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9udGltZW91dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKVxuICAgICAgfVxuXG4gICAgICB4aHIub3BlbihyZXF1ZXN0Lm1ldGhvZCwgcmVxdWVzdC51cmwsIHRydWUpXG5cbiAgICAgIGlmIChyZXF1ZXN0LmNyZWRlbnRpYWxzID09PSAnaW5jbHVkZScpIHtcbiAgICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWVcbiAgICAgIH1cblxuICAgICAgaWYgKCdyZXNwb25zZVR5cGUnIGluIHhociAmJiBzdXBwb3J0LmJsb2IpIHtcbiAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdibG9iJ1xuICAgICAgfVxuXG4gICAgICByZXF1ZXN0LmhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihuYW1lLCB2YWx1ZSlcbiAgICAgIH0pXG5cbiAgICAgIHhoci5zZW5kKHR5cGVvZiByZXF1ZXN0Ll9ib2R5SW5pdCA9PT0gJ3VuZGVmaW5lZCcgPyBudWxsIDogcmVxdWVzdC5fYm9keUluaXQpXG4gICAgfSlcbiAgfVxuICBzZWxmLmZldGNoLnBvbHlmaWxsID0gdHJ1ZVxufSkodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnID8gc2VsZiA6IHRoaXMpO1xuIiwiLyohIGh0dHBzOi8vbXRocy5iZS9wdW55Y29kZSB2MS40LjEgYnkgQG1hdGhpYXMgKi9cbjsoZnVuY3Rpb24ocm9vdCkge1xuXG5cdC8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZXMgKi9cblx0dmFyIGZyZWVFeHBvcnRzID0gdHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0cyAmJlxuXHRcdCFleHBvcnRzLm5vZGVUeXBlICYmIGV4cG9ydHM7XG5cdHZhciBmcmVlTW9kdWxlID0gdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiZcblx0XHQhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZTtcblx0dmFyIGZyZWVHbG9iYWwgPSB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbDtcblx0aWYgKFxuXHRcdGZyZWVHbG9iYWwuZ2xvYmFsID09PSBmcmVlR2xvYmFsIHx8XG5cdFx0ZnJlZUdsb2JhbC53aW5kb3cgPT09IGZyZWVHbG9iYWwgfHxcblx0XHRmcmVlR2xvYmFsLnNlbGYgPT09IGZyZWVHbG9iYWxcblx0KSB7XG5cdFx0cm9vdCA9IGZyZWVHbG9iYWw7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGBwdW55Y29kZWAgb2JqZWN0LlxuXHQgKiBAbmFtZSBwdW55Y29kZVxuXHQgKiBAdHlwZSBPYmplY3Rcblx0ICovXG5cdHZhciBwdW55Y29kZSxcblxuXHQvKiogSGlnaGVzdCBwb3NpdGl2ZSBzaWduZWQgMzItYml0IGZsb2F0IHZhbHVlICovXG5cdG1heEludCA9IDIxNDc0ODM2NDcsIC8vIGFrYS4gMHg3RkZGRkZGRiBvciAyXjMxLTFcblxuXHQvKiogQm9vdHN0cmluZyBwYXJhbWV0ZXJzICovXG5cdGJhc2UgPSAzNixcblx0dE1pbiA9IDEsXG5cdHRNYXggPSAyNixcblx0c2tldyA9IDM4LFxuXHRkYW1wID0gNzAwLFxuXHRpbml0aWFsQmlhcyA9IDcyLFxuXHRpbml0aWFsTiA9IDEyOCwgLy8gMHg4MFxuXHRkZWxpbWl0ZXIgPSAnLScsIC8vICdcXHgyRCdcblxuXHQvKiogUmVndWxhciBleHByZXNzaW9ucyAqL1xuXHRyZWdleFB1bnljb2RlID0gL154bi0tLyxcblx0cmVnZXhOb25BU0NJSSA9IC9bXlxceDIwLVxceDdFXS8sIC8vIHVucHJpbnRhYmxlIEFTQ0lJIGNoYXJzICsgbm9uLUFTQ0lJIGNoYXJzXG5cdHJlZ2V4U2VwYXJhdG9ycyA9IC9bXFx4MkVcXHUzMDAyXFx1RkYwRVxcdUZGNjFdL2csIC8vIFJGQyAzNDkwIHNlcGFyYXRvcnNcblxuXHQvKiogRXJyb3IgbWVzc2FnZXMgKi9cblx0ZXJyb3JzID0ge1xuXHRcdCdvdmVyZmxvdyc6ICdPdmVyZmxvdzogaW5wdXQgbmVlZHMgd2lkZXIgaW50ZWdlcnMgdG8gcHJvY2VzcycsXG5cdFx0J25vdC1iYXNpYyc6ICdJbGxlZ2FsIGlucHV0ID49IDB4ODAgKG5vdCBhIGJhc2ljIGNvZGUgcG9pbnQpJyxcblx0XHQnaW52YWxpZC1pbnB1dCc6ICdJbnZhbGlkIGlucHV0J1xuXHR9LFxuXG5cdC8qKiBDb252ZW5pZW5jZSBzaG9ydGN1dHMgKi9cblx0YmFzZU1pbnVzVE1pbiA9IGJhc2UgLSB0TWluLFxuXHRmbG9vciA9IE1hdGguZmxvb3IsXG5cdHN0cmluZ0Zyb21DaGFyQ29kZSA9IFN0cmluZy5mcm9tQ2hhckNvZGUsXG5cblx0LyoqIFRlbXBvcmFyeSB2YXJpYWJsZSAqL1xuXHRrZXk7XG5cblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblx0LyoqXG5cdCAqIEEgZ2VuZXJpYyBlcnJvciB1dGlsaXR5IGZ1bmN0aW9uLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gdHlwZSBUaGUgZXJyb3IgdHlwZS5cblx0ICogQHJldHVybnMge0Vycm9yfSBUaHJvd3MgYSBgUmFuZ2VFcnJvcmAgd2l0aCB0aGUgYXBwbGljYWJsZSBlcnJvciBtZXNzYWdlLlxuXHQgKi9cblx0ZnVuY3Rpb24gZXJyb3IodHlwZSkge1xuXHRcdHRocm93IG5ldyBSYW5nZUVycm9yKGVycm9yc1t0eXBlXSk7XG5cdH1cblxuXHQvKipcblx0ICogQSBnZW5lcmljIGBBcnJheSNtYXBgIHV0aWxpdHkgZnVuY3Rpb24uXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0aGF0IGdldHMgY2FsbGVkIGZvciBldmVyeSBhcnJheVxuXHQgKiBpdGVtLlxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IEEgbmV3IGFycmF5IG9mIHZhbHVlcyByZXR1cm5lZCBieSB0aGUgY2FsbGJhY2sgZnVuY3Rpb24uXG5cdCAqL1xuXHRmdW5jdGlvbiBtYXAoYXJyYXksIGZuKSB7XG5cdFx0dmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcblx0XHR2YXIgcmVzdWx0ID0gW107XG5cdFx0d2hpbGUgKGxlbmd0aC0tKSB7XG5cdFx0XHRyZXN1bHRbbGVuZ3RoXSA9IGZuKGFycmF5W2xlbmd0aF0pO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0LyoqXG5cdCAqIEEgc2ltcGxlIGBBcnJheSNtYXBgLWxpa2Ugd3JhcHBlciB0byB3b3JrIHdpdGggZG9tYWluIG5hbWUgc3RyaW5ncyBvciBlbWFpbFxuXHQgKiBhZGRyZXNzZXMuXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBkb21haW4gVGhlIGRvbWFpbiBuYW1lIG9yIGVtYWlsIGFkZHJlc3MuXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0aGF0IGdldHMgY2FsbGVkIGZvciBldmVyeVxuXHQgKiBjaGFyYWN0ZXIuXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gQSBuZXcgc3RyaW5nIG9mIGNoYXJhY3RlcnMgcmV0dXJuZWQgYnkgdGhlIGNhbGxiYWNrXG5cdCAqIGZ1bmN0aW9uLlxuXHQgKi9cblx0ZnVuY3Rpb24gbWFwRG9tYWluKHN0cmluZywgZm4pIHtcblx0XHR2YXIgcGFydHMgPSBzdHJpbmcuc3BsaXQoJ0AnKTtcblx0XHR2YXIgcmVzdWx0ID0gJyc7XG5cdFx0aWYgKHBhcnRzLmxlbmd0aCA+IDEpIHtcblx0XHRcdC8vIEluIGVtYWlsIGFkZHJlc3Nlcywgb25seSB0aGUgZG9tYWluIG5hbWUgc2hvdWxkIGJlIHB1bnljb2RlZC4gTGVhdmVcblx0XHRcdC8vIHRoZSBsb2NhbCBwYXJ0IChpLmUuIGV2ZXJ5dGhpbmcgdXAgdG8gYEBgKSBpbnRhY3QuXG5cdFx0XHRyZXN1bHQgPSBwYXJ0c1swXSArICdAJztcblx0XHRcdHN0cmluZyA9IHBhcnRzWzFdO1xuXHRcdH1cblx0XHQvLyBBdm9pZCBgc3BsaXQocmVnZXgpYCBmb3IgSUU4IGNvbXBhdGliaWxpdHkuIFNlZSAjMTcuXG5cdFx0c3RyaW5nID0gc3RyaW5nLnJlcGxhY2UocmVnZXhTZXBhcmF0b3JzLCAnXFx4MkUnKTtcblx0XHR2YXIgbGFiZWxzID0gc3RyaW5nLnNwbGl0KCcuJyk7XG5cdFx0dmFyIGVuY29kZWQgPSBtYXAobGFiZWxzLCBmbikuam9pbignLicpO1xuXHRcdHJldHVybiByZXN1bHQgKyBlbmNvZGVkO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYW4gYXJyYXkgY29udGFpbmluZyB0aGUgbnVtZXJpYyBjb2RlIHBvaW50cyBvZiBlYWNoIFVuaWNvZGVcblx0ICogY2hhcmFjdGVyIGluIHRoZSBzdHJpbmcuIFdoaWxlIEphdmFTY3JpcHQgdXNlcyBVQ1MtMiBpbnRlcm5hbGx5LFxuXHQgKiB0aGlzIGZ1bmN0aW9uIHdpbGwgY29udmVydCBhIHBhaXIgb2Ygc3Vycm9nYXRlIGhhbHZlcyAoZWFjaCBvZiB3aGljaFxuXHQgKiBVQ1MtMiBleHBvc2VzIGFzIHNlcGFyYXRlIGNoYXJhY3RlcnMpIGludG8gYSBzaW5nbGUgY29kZSBwb2ludCxcblx0ICogbWF0Y2hpbmcgVVRGLTE2LlxuXHQgKiBAc2VlIGBwdW55Y29kZS51Y3MyLmVuY29kZWBcblx0ICogQHNlZSA8aHR0cHM6Ly9tYXRoaWFzYnluZW5zLmJlL25vdGVzL2phdmFzY3JpcHQtZW5jb2Rpbmc+XG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZS51Y3MyXG5cdCAqIEBuYW1lIGRlY29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gc3RyaW5nIFRoZSBVbmljb2RlIGlucHV0IHN0cmluZyAoVUNTLTIpLlxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IFRoZSBuZXcgYXJyYXkgb2YgY29kZSBwb2ludHMuXG5cdCAqL1xuXHRmdW5jdGlvbiB1Y3MyZGVjb2RlKHN0cmluZykge1xuXHRcdHZhciBvdXRwdXQgPSBbXSxcblx0XHQgICAgY291bnRlciA9IDAsXG5cdFx0ICAgIGxlbmd0aCA9IHN0cmluZy5sZW5ndGgsXG5cdFx0ICAgIHZhbHVlLFxuXHRcdCAgICBleHRyYTtcblx0XHR3aGlsZSAoY291bnRlciA8IGxlbmd0aCkge1xuXHRcdFx0dmFsdWUgPSBzdHJpbmcuY2hhckNvZGVBdChjb3VudGVyKyspO1xuXHRcdFx0aWYgKHZhbHVlID49IDB4RDgwMCAmJiB2YWx1ZSA8PSAweERCRkYgJiYgY291bnRlciA8IGxlbmd0aCkge1xuXHRcdFx0XHQvLyBoaWdoIHN1cnJvZ2F0ZSwgYW5kIHRoZXJlIGlzIGEgbmV4dCBjaGFyYWN0ZXJcblx0XHRcdFx0ZXh0cmEgPSBzdHJpbmcuY2hhckNvZGVBdChjb3VudGVyKyspO1xuXHRcdFx0XHRpZiAoKGV4dHJhICYgMHhGQzAwKSA9PSAweERDMDApIHsgLy8gbG93IHN1cnJvZ2F0ZVxuXHRcdFx0XHRcdG91dHB1dC5wdXNoKCgodmFsdWUgJiAweDNGRikgPDwgMTApICsgKGV4dHJhICYgMHgzRkYpICsgMHgxMDAwMCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gdW5tYXRjaGVkIHN1cnJvZ2F0ZTsgb25seSBhcHBlbmQgdGhpcyBjb2RlIHVuaXQsIGluIGNhc2UgdGhlIG5leHRcblx0XHRcdFx0XHQvLyBjb2RlIHVuaXQgaXMgdGhlIGhpZ2ggc3Vycm9nYXRlIG9mIGEgc3Vycm9nYXRlIHBhaXJcblx0XHRcdFx0XHRvdXRwdXQucHVzaCh2YWx1ZSk7XG5cdFx0XHRcdFx0Y291bnRlci0tO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvdXRwdXQucHVzaCh2YWx1ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBvdXRwdXQ7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHN0cmluZyBiYXNlZCBvbiBhbiBhcnJheSBvZiBudW1lcmljIGNvZGUgcG9pbnRzLlxuXHQgKiBAc2VlIGBwdW55Y29kZS51Y3MyLmRlY29kZWBcblx0ICogQG1lbWJlck9mIHB1bnljb2RlLnVjczJcblx0ICogQG5hbWUgZW5jb2RlXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGNvZGVQb2ludHMgVGhlIGFycmF5IG9mIG51bWVyaWMgY29kZSBwb2ludHMuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBuZXcgVW5pY29kZSBzdHJpbmcgKFVDUy0yKS5cblx0ICovXG5cdGZ1bmN0aW9uIHVjczJlbmNvZGUoYXJyYXkpIHtcblx0XHRyZXR1cm4gbWFwKGFycmF5LCBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0dmFyIG91dHB1dCA9ICcnO1xuXHRcdFx0aWYgKHZhbHVlID4gMHhGRkZGKSB7XG5cdFx0XHRcdHZhbHVlIC09IDB4MTAwMDA7XG5cdFx0XHRcdG91dHB1dCArPSBzdHJpbmdGcm9tQ2hhckNvZGUodmFsdWUgPj4+IDEwICYgMHgzRkYgfCAweEQ4MDApO1xuXHRcdFx0XHR2YWx1ZSA9IDB4REMwMCB8IHZhbHVlICYgMHgzRkY7XG5cdFx0XHR9XG5cdFx0XHRvdXRwdXQgKz0gc3RyaW5nRnJvbUNoYXJDb2RlKHZhbHVlKTtcblx0XHRcdHJldHVybiBvdXRwdXQ7XG5cdFx0fSkuam9pbignJyk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBiYXNpYyBjb2RlIHBvaW50IGludG8gYSBkaWdpdC9pbnRlZ2VyLlxuXHQgKiBAc2VlIGBkaWdpdFRvQmFzaWMoKWBcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGNvZGVQb2ludCBUaGUgYmFzaWMgbnVtZXJpYyBjb2RlIHBvaW50IHZhbHVlLlxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgbnVtZXJpYyB2YWx1ZSBvZiBhIGJhc2ljIGNvZGUgcG9pbnQgKGZvciB1c2UgaW5cblx0ICogcmVwcmVzZW50aW5nIGludGVnZXJzKSBpbiB0aGUgcmFuZ2UgYDBgIHRvIGBiYXNlIC0gMWAsIG9yIGBiYXNlYCBpZlxuXHQgKiB0aGUgY29kZSBwb2ludCBkb2VzIG5vdCByZXByZXNlbnQgYSB2YWx1ZS5cblx0ICovXG5cdGZ1bmN0aW9uIGJhc2ljVG9EaWdpdChjb2RlUG9pbnQpIHtcblx0XHRpZiAoY29kZVBvaW50IC0gNDggPCAxMCkge1xuXHRcdFx0cmV0dXJuIGNvZGVQb2ludCAtIDIyO1xuXHRcdH1cblx0XHRpZiAoY29kZVBvaW50IC0gNjUgPCAyNikge1xuXHRcdFx0cmV0dXJuIGNvZGVQb2ludCAtIDY1O1xuXHRcdH1cblx0XHRpZiAoY29kZVBvaW50IC0gOTcgPCAyNikge1xuXHRcdFx0cmV0dXJuIGNvZGVQb2ludCAtIDk3O1xuXHRcdH1cblx0XHRyZXR1cm4gYmFzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIGRpZ2l0L2ludGVnZXIgaW50byBhIGJhc2ljIGNvZGUgcG9pbnQuXG5cdCAqIEBzZWUgYGJhc2ljVG9EaWdpdCgpYFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge051bWJlcn0gZGlnaXQgVGhlIG51bWVyaWMgdmFsdWUgb2YgYSBiYXNpYyBjb2RlIHBvaW50LlxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgYmFzaWMgY29kZSBwb2ludCB3aG9zZSB2YWx1ZSAod2hlbiB1c2VkIGZvclxuXHQgKiByZXByZXNlbnRpbmcgaW50ZWdlcnMpIGlzIGBkaWdpdGAsIHdoaWNoIG5lZWRzIHRvIGJlIGluIHRoZSByYW5nZVxuXHQgKiBgMGAgdG8gYGJhc2UgLSAxYC4gSWYgYGZsYWdgIGlzIG5vbi16ZXJvLCB0aGUgdXBwZXJjYXNlIGZvcm0gaXNcblx0ICogdXNlZDsgZWxzZSwgdGhlIGxvd2VyY2FzZSBmb3JtIGlzIHVzZWQuIFRoZSBiZWhhdmlvciBpcyB1bmRlZmluZWRcblx0ICogaWYgYGZsYWdgIGlzIG5vbi16ZXJvIGFuZCBgZGlnaXRgIGhhcyBubyB1cHBlcmNhc2UgZm9ybS5cblx0ICovXG5cdGZ1bmN0aW9uIGRpZ2l0VG9CYXNpYyhkaWdpdCwgZmxhZykge1xuXHRcdC8vICAwLi4yNSBtYXAgdG8gQVNDSUkgYS4ueiBvciBBLi5aXG5cdFx0Ly8gMjYuLjM1IG1hcCB0byBBU0NJSSAwLi45XG5cdFx0cmV0dXJuIGRpZ2l0ICsgMjIgKyA3NSAqIChkaWdpdCA8IDI2KSAtICgoZmxhZyAhPSAwKSA8PCA1KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBCaWFzIGFkYXB0YXRpb24gZnVuY3Rpb24gYXMgcGVyIHNlY3Rpb24gMy40IG9mIFJGQyAzNDkyLlxuXHQgKiBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzQ5MiNzZWN0aW9uLTMuNFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0ZnVuY3Rpb24gYWRhcHQoZGVsdGEsIG51bVBvaW50cywgZmlyc3RUaW1lKSB7XG5cdFx0dmFyIGsgPSAwO1xuXHRcdGRlbHRhID0gZmlyc3RUaW1lID8gZmxvb3IoZGVsdGEgLyBkYW1wKSA6IGRlbHRhID4+IDE7XG5cdFx0ZGVsdGEgKz0gZmxvb3IoZGVsdGEgLyBudW1Qb2ludHMpO1xuXHRcdGZvciAoLyogbm8gaW5pdGlhbGl6YXRpb24gKi87IGRlbHRhID4gYmFzZU1pbnVzVE1pbiAqIHRNYXggPj4gMTsgayArPSBiYXNlKSB7XG5cdFx0XHRkZWx0YSA9IGZsb29yKGRlbHRhIC8gYmFzZU1pbnVzVE1pbik7XG5cdFx0fVxuXHRcdHJldHVybiBmbG9vcihrICsgKGJhc2VNaW51c1RNaW4gKyAxKSAqIGRlbHRhIC8gKGRlbHRhICsgc2tldykpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgUHVueWNvZGUgc3RyaW5nIG9mIEFTQ0lJLW9ubHkgc3ltYm9scyB0byBhIHN0cmluZyBvZiBVbmljb2RlXG5cdCAqIHN5bWJvbHMuXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIFB1bnljb2RlIHN0cmluZyBvZiBBU0NJSS1vbmx5IHN5bWJvbHMuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSByZXN1bHRpbmcgc3RyaW5nIG9mIFVuaWNvZGUgc3ltYm9scy5cblx0ICovXG5cdGZ1bmN0aW9uIGRlY29kZShpbnB1dCkge1xuXHRcdC8vIERvbid0IHVzZSBVQ1MtMlxuXHRcdHZhciBvdXRwdXQgPSBbXSxcblx0XHQgICAgaW5wdXRMZW5ndGggPSBpbnB1dC5sZW5ndGgsXG5cdFx0ICAgIG91dCxcblx0XHQgICAgaSA9IDAsXG5cdFx0ICAgIG4gPSBpbml0aWFsTixcblx0XHQgICAgYmlhcyA9IGluaXRpYWxCaWFzLFxuXHRcdCAgICBiYXNpYyxcblx0XHQgICAgaixcblx0XHQgICAgaW5kZXgsXG5cdFx0ICAgIG9sZGksXG5cdFx0ICAgIHcsXG5cdFx0ICAgIGssXG5cdFx0ICAgIGRpZ2l0LFxuXHRcdCAgICB0LFxuXHRcdCAgICAvKiogQ2FjaGVkIGNhbGN1bGF0aW9uIHJlc3VsdHMgKi9cblx0XHQgICAgYmFzZU1pbnVzVDtcblxuXHRcdC8vIEhhbmRsZSB0aGUgYmFzaWMgY29kZSBwb2ludHM6IGxldCBgYmFzaWNgIGJlIHRoZSBudW1iZXIgb2YgaW5wdXQgY29kZVxuXHRcdC8vIHBvaW50cyBiZWZvcmUgdGhlIGxhc3QgZGVsaW1pdGVyLCBvciBgMGAgaWYgdGhlcmUgaXMgbm9uZSwgdGhlbiBjb3B5XG5cdFx0Ly8gdGhlIGZpcnN0IGJhc2ljIGNvZGUgcG9pbnRzIHRvIHRoZSBvdXRwdXQuXG5cblx0XHRiYXNpYyA9IGlucHV0Lmxhc3RJbmRleE9mKGRlbGltaXRlcik7XG5cdFx0aWYgKGJhc2ljIDwgMCkge1xuXHRcdFx0YmFzaWMgPSAwO1xuXHRcdH1cblxuXHRcdGZvciAoaiA9IDA7IGogPCBiYXNpYzsgKytqKSB7XG5cdFx0XHQvLyBpZiBpdCdzIG5vdCBhIGJhc2ljIGNvZGUgcG9pbnRcblx0XHRcdGlmIChpbnB1dC5jaGFyQ29kZUF0KGopID49IDB4ODApIHtcblx0XHRcdFx0ZXJyb3IoJ25vdC1iYXNpYycpO1xuXHRcdFx0fVxuXHRcdFx0b3V0cHV0LnB1c2goaW5wdXQuY2hhckNvZGVBdChqKSk7XG5cdFx0fVxuXG5cdFx0Ly8gTWFpbiBkZWNvZGluZyBsb29wOiBzdGFydCBqdXN0IGFmdGVyIHRoZSBsYXN0IGRlbGltaXRlciBpZiBhbnkgYmFzaWMgY29kZVxuXHRcdC8vIHBvaW50cyB3ZXJlIGNvcGllZDsgc3RhcnQgYXQgdGhlIGJlZ2lubmluZyBvdGhlcndpc2UuXG5cblx0XHRmb3IgKGluZGV4ID0gYmFzaWMgPiAwID8gYmFzaWMgKyAxIDogMDsgaW5kZXggPCBpbnB1dExlbmd0aDsgLyogbm8gZmluYWwgZXhwcmVzc2lvbiAqLykge1xuXG5cdFx0XHQvLyBgaW5kZXhgIGlzIHRoZSBpbmRleCBvZiB0aGUgbmV4dCBjaGFyYWN0ZXIgdG8gYmUgY29uc3VtZWQuXG5cdFx0XHQvLyBEZWNvZGUgYSBnZW5lcmFsaXplZCB2YXJpYWJsZS1sZW5ndGggaW50ZWdlciBpbnRvIGBkZWx0YWAsXG5cdFx0XHQvLyB3aGljaCBnZXRzIGFkZGVkIHRvIGBpYC4gVGhlIG92ZXJmbG93IGNoZWNraW5nIGlzIGVhc2llclxuXHRcdFx0Ly8gaWYgd2UgaW5jcmVhc2UgYGlgIGFzIHdlIGdvLCB0aGVuIHN1YnRyYWN0IG9mZiBpdHMgc3RhcnRpbmdcblx0XHRcdC8vIHZhbHVlIGF0IHRoZSBlbmQgdG8gb2J0YWluIGBkZWx0YWAuXG5cdFx0XHRmb3IgKG9sZGkgPSBpLCB3ID0gMSwgayA9IGJhc2U7IC8qIG5vIGNvbmRpdGlvbiAqLzsgayArPSBiYXNlKSB7XG5cblx0XHRcdFx0aWYgKGluZGV4ID49IGlucHV0TGVuZ3RoKSB7XG5cdFx0XHRcdFx0ZXJyb3IoJ2ludmFsaWQtaW5wdXQnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGRpZ2l0ID0gYmFzaWNUb0RpZ2l0KGlucHV0LmNoYXJDb2RlQXQoaW5kZXgrKykpO1xuXG5cdFx0XHRcdGlmIChkaWdpdCA+PSBiYXNlIHx8IGRpZ2l0ID4gZmxvb3IoKG1heEludCAtIGkpIC8gdykpIHtcblx0XHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGkgKz0gZGlnaXQgKiB3O1xuXHRcdFx0XHR0ID0gayA8PSBiaWFzID8gdE1pbiA6IChrID49IGJpYXMgKyB0TWF4ID8gdE1heCA6IGsgLSBiaWFzKTtcblxuXHRcdFx0XHRpZiAoZGlnaXQgPCB0KSB7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRiYXNlTWludXNUID0gYmFzZSAtIHQ7XG5cdFx0XHRcdGlmICh3ID4gZmxvb3IobWF4SW50IC8gYmFzZU1pbnVzVCkpIHtcblx0XHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHcgKj0gYmFzZU1pbnVzVDtcblxuXHRcdFx0fVxuXG5cdFx0XHRvdXQgPSBvdXRwdXQubGVuZ3RoICsgMTtcblx0XHRcdGJpYXMgPSBhZGFwdChpIC0gb2xkaSwgb3V0LCBvbGRpID09IDApO1xuXG5cdFx0XHQvLyBgaWAgd2FzIHN1cHBvc2VkIHRvIHdyYXAgYXJvdW5kIGZyb20gYG91dGAgdG8gYDBgLFxuXHRcdFx0Ly8gaW5jcmVtZW50aW5nIGBuYCBlYWNoIHRpbWUsIHNvIHdlJ2xsIGZpeCB0aGF0IG5vdzpcblx0XHRcdGlmIChmbG9vcihpIC8gb3V0KSA+IG1heEludCAtIG4pIHtcblx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHR9XG5cblx0XHRcdG4gKz0gZmxvb3IoaSAvIG91dCk7XG5cdFx0XHRpICU9IG91dDtcblxuXHRcdFx0Ly8gSW5zZXJ0IGBuYCBhdCBwb3NpdGlvbiBgaWAgb2YgdGhlIG91dHB1dFxuXHRcdFx0b3V0cHV0LnNwbGljZShpKyssIDAsIG4pO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHVjczJlbmNvZGUob3V0cHV0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIHN0cmluZyBvZiBVbmljb2RlIHN5bWJvbHMgKGUuZy4gYSBkb21haW4gbmFtZSBsYWJlbCkgdG8gYVxuXHQgKiBQdW55Y29kZSBzdHJpbmcgb2YgQVNDSUktb25seSBzeW1ib2xzLlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGlucHV0IFRoZSBzdHJpbmcgb2YgVW5pY29kZSBzeW1ib2xzLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgcmVzdWx0aW5nIFB1bnljb2RlIHN0cmluZyBvZiBBU0NJSS1vbmx5IHN5bWJvbHMuXG5cdCAqL1xuXHRmdW5jdGlvbiBlbmNvZGUoaW5wdXQpIHtcblx0XHR2YXIgbixcblx0XHQgICAgZGVsdGEsXG5cdFx0ICAgIGhhbmRsZWRDUENvdW50LFxuXHRcdCAgICBiYXNpY0xlbmd0aCxcblx0XHQgICAgYmlhcyxcblx0XHQgICAgaixcblx0XHQgICAgbSxcblx0XHQgICAgcSxcblx0XHQgICAgayxcblx0XHQgICAgdCxcblx0XHQgICAgY3VycmVudFZhbHVlLFxuXHRcdCAgICBvdXRwdXQgPSBbXSxcblx0XHQgICAgLyoqIGBpbnB1dExlbmd0aGAgd2lsbCBob2xkIHRoZSBudW1iZXIgb2YgY29kZSBwb2ludHMgaW4gYGlucHV0YC4gKi9cblx0XHQgICAgaW5wdXRMZW5ndGgsXG5cdFx0ICAgIC8qKiBDYWNoZWQgY2FsY3VsYXRpb24gcmVzdWx0cyAqL1xuXHRcdCAgICBoYW5kbGVkQ1BDb3VudFBsdXNPbmUsXG5cdFx0ICAgIGJhc2VNaW51c1QsXG5cdFx0ICAgIHFNaW51c1Q7XG5cblx0XHQvLyBDb252ZXJ0IHRoZSBpbnB1dCBpbiBVQ1MtMiB0byBVbmljb2RlXG5cdFx0aW5wdXQgPSB1Y3MyZGVjb2RlKGlucHV0KTtcblxuXHRcdC8vIENhY2hlIHRoZSBsZW5ndGhcblx0XHRpbnB1dExlbmd0aCA9IGlucHV0Lmxlbmd0aDtcblxuXHRcdC8vIEluaXRpYWxpemUgdGhlIHN0YXRlXG5cdFx0biA9IGluaXRpYWxOO1xuXHRcdGRlbHRhID0gMDtcblx0XHRiaWFzID0gaW5pdGlhbEJpYXM7XG5cblx0XHQvLyBIYW5kbGUgdGhlIGJhc2ljIGNvZGUgcG9pbnRzXG5cdFx0Zm9yIChqID0gMDsgaiA8IGlucHV0TGVuZ3RoOyArK2opIHtcblx0XHRcdGN1cnJlbnRWYWx1ZSA9IGlucHV0W2pdO1xuXHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA8IDB4ODApIHtcblx0XHRcdFx0b3V0cHV0LnB1c2goc3RyaW5nRnJvbUNoYXJDb2RlKGN1cnJlbnRWYWx1ZSkpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGhhbmRsZWRDUENvdW50ID0gYmFzaWNMZW5ndGggPSBvdXRwdXQubGVuZ3RoO1xuXG5cdFx0Ly8gYGhhbmRsZWRDUENvdW50YCBpcyB0aGUgbnVtYmVyIG9mIGNvZGUgcG9pbnRzIHRoYXQgaGF2ZSBiZWVuIGhhbmRsZWQ7XG5cdFx0Ly8gYGJhc2ljTGVuZ3RoYCBpcyB0aGUgbnVtYmVyIG9mIGJhc2ljIGNvZGUgcG9pbnRzLlxuXG5cdFx0Ly8gRmluaXNoIHRoZSBiYXNpYyBzdHJpbmcgLSBpZiBpdCBpcyBub3QgZW1wdHkgLSB3aXRoIGEgZGVsaW1pdGVyXG5cdFx0aWYgKGJhc2ljTGVuZ3RoKSB7XG5cdFx0XHRvdXRwdXQucHVzaChkZWxpbWl0ZXIpO1xuXHRcdH1cblxuXHRcdC8vIE1haW4gZW5jb2RpbmcgbG9vcDpcblx0XHR3aGlsZSAoaGFuZGxlZENQQ291bnQgPCBpbnB1dExlbmd0aCkge1xuXG5cdFx0XHQvLyBBbGwgbm9uLWJhc2ljIGNvZGUgcG9pbnRzIDwgbiBoYXZlIGJlZW4gaGFuZGxlZCBhbHJlYWR5LiBGaW5kIHRoZSBuZXh0XG5cdFx0XHQvLyBsYXJnZXIgb25lOlxuXHRcdFx0Zm9yIChtID0gbWF4SW50LCBqID0gMDsgaiA8IGlucHV0TGVuZ3RoOyArK2opIHtcblx0XHRcdFx0Y3VycmVudFZhbHVlID0gaW5wdXRbal07XG5cdFx0XHRcdGlmIChjdXJyZW50VmFsdWUgPj0gbiAmJiBjdXJyZW50VmFsdWUgPCBtKSB7XG5cdFx0XHRcdFx0bSA9IGN1cnJlbnRWYWx1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBJbmNyZWFzZSBgZGVsdGFgIGVub3VnaCB0byBhZHZhbmNlIHRoZSBkZWNvZGVyJ3MgPG4saT4gc3RhdGUgdG8gPG0sMD4sXG5cdFx0XHQvLyBidXQgZ3VhcmQgYWdhaW5zdCBvdmVyZmxvd1xuXHRcdFx0aGFuZGxlZENQQ291bnRQbHVzT25lID0gaGFuZGxlZENQQ291bnQgKyAxO1xuXHRcdFx0aWYgKG0gLSBuID4gZmxvb3IoKG1heEludCAtIGRlbHRhKSAvIGhhbmRsZWRDUENvdW50UGx1c09uZSkpIHtcblx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHR9XG5cblx0XHRcdGRlbHRhICs9IChtIC0gbikgKiBoYW5kbGVkQ1BDb3VudFBsdXNPbmU7XG5cdFx0XHRuID0gbTtcblxuXHRcdFx0Zm9yIChqID0gMDsgaiA8IGlucHV0TGVuZ3RoOyArK2opIHtcblx0XHRcdFx0Y3VycmVudFZhbHVlID0gaW5wdXRbal07XG5cblx0XHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA8IG4gJiYgKytkZWx0YSA+IG1heEludCkge1xuXHRcdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA9PSBuKSB7XG5cdFx0XHRcdFx0Ly8gUmVwcmVzZW50IGRlbHRhIGFzIGEgZ2VuZXJhbGl6ZWQgdmFyaWFibGUtbGVuZ3RoIGludGVnZXJcblx0XHRcdFx0XHRmb3IgKHEgPSBkZWx0YSwgayA9IGJhc2U7IC8qIG5vIGNvbmRpdGlvbiAqLzsgayArPSBiYXNlKSB7XG5cdFx0XHRcdFx0XHR0ID0gayA8PSBiaWFzID8gdE1pbiA6IChrID49IGJpYXMgKyB0TWF4ID8gdE1heCA6IGsgLSBiaWFzKTtcblx0XHRcdFx0XHRcdGlmIChxIDwgdCkge1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHFNaW51c1QgPSBxIC0gdDtcblx0XHRcdFx0XHRcdGJhc2VNaW51c1QgPSBiYXNlIC0gdDtcblx0XHRcdFx0XHRcdG91dHB1dC5wdXNoKFxuXHRcdFx0XHRcdFx0XHRzdHJpbmdGcm9tQ2hhckNvZGUoZGlnaXRUb0Jhc2ljKHQgKyBxTWludXNUICUgYmFzZU1pbnVzVCwgMCkpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0cSA9IGZsb29yKHFNaW51c1QgLyBiYXNlTWludXNUKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRvdXRwdXQucHVzaChzdHJpbmdGcm9tQ2hhckNvZGUoZGlnaXRUb0Jhc2ljKHEsIDApKSk7XG5cdFx0XHRcdFx0YmlhcyA9IGFkYXB0KGRlbHRhLCBoYW5kbGVkQ1BDb3VudFBsdXNPbmUsIGhhbmRsZWRDUENvdW50ID09IGJhc2ljTGVuZ3RoKTtcblx0XHRcdFx0XHRkZWx0YSA9IDA7XG5cdFx0XHRcdFx0KytoYW5kbGVkQ1BDb3VudDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQrK2RlbHRhO1xuXHRcdFx0KytuO1xuXG5cdFx0fVxuXHRcdHJldHVybiBvdXRwdXQuam9pbignJyk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBQdW55Y29kZSBzdHJpbmcgcmVwcmVzZW50aW5nIGEgZG9tYWluIG5hbWUgb3IgYW4gZW1haWwgYWRkcmVzc1xuXHQgKiB0byBVbmljb2RlLiBPbmx5IHRoZSBQdW55Y29kZWQgcGFydHMgb2YgdGhlIGlucHV0IHdpbGwgYmUgY29udmVydGVkLCBpLmUuXG5cdCAqIGl0IGRvZXNuJ3QgbWF0dGVyIGlmIHlvdSBjYWxsIGl0IG9uIGEgc3RyaW5nIHRoYXQgaGFzIGFscmVhZHkgYmVlblxuXHQgKiBjb252ZXJ0ZWQgdG8gVW5pY29kZS5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dCBUaGUgUHVueWNvZGVkIGRvbWFpbiBuYW1lIG9yIGVtYWlsIGFkZHJlc3MgdG9cblx0ICogY29udmVydCB0byBVbmljb2RlLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgVW5pY29kZSByZXByZXNlbnRhdGlvbiBvZiB0aGUgZ2l2ZW4gUHVueWNvZGVcblx0ICogc3RyaW5nLlxuXHQgKi9cblx0ZnVuY3Rpb24gdG9Vbmljb2RlKGlucHV0KSB7XG5cdFx0cmV0dXJuIG1hcERvbWFpbihpbnB1dCwgZnVuY3Rpb24oc3RyaW5nKSB7XG5cdFx0XHRyZXR1cm4gcmVnZXhQdW55Y29kZS50ZXN0KHN0cmluZylcblx0XHRcdFx0PyBkZWNvZGUoc3RyaW5nLnNsaWNlKDQpLnRvTG93ZXJDYXNlKCkpXG5cdFx0XHRcdDogc3RyaW5nO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgVW5pY29kZSBzdHJpbmcgcmVwcmVzZW50aW5nIGEgZG9tYWluIG5hbWUgb3IgYW4gZW1haWwgYWRkcmVzcyB0b1xuXHQgKiBQdW55Y29kZS4gT25seSB0aGUgbm9uLUFTQ0lJIHBhcnRzIG9mIHRoZSBkb21haW4gbmFtZSB3aWxsIGJlIGNvbnZlcnRlZCxcblx0ICogaS5lLiBpdCBkb2Vzbid0IG1hdHRlciBpZiB5b3UgY2FsbCBpdCB3aXRoIGEgZG9tYWluIHRoYXQncyBhbHJlYWR5IGluXG5cdCAqIEFTQ0lJLlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGlucHV0IFRoZSBkb21haW4gbmFtZSBvciBlbWFpbCBhZGRyZXNzIHRvIGNvbnZlcnQsIGFzIGFcblx0ICogVW5pY29kZSBzdHJpbmcuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBQdW55Y29kZSByZXByZXNlbnRhdGlvbiBvZiB0aGUgZ2l2ZW4gZG9tYWluIG5hbWUgb3Jcblx0ICogZW1haWwgYWRkcmVzcy5cblx0ICovXG5cdGZ1bmN0aW9uIHRvQVNDSUkoaW5wdXQpIHtcblx0XHRyZXR1cm4gbWFwRG9tYWluKGlucHV0LCBmdW5jdGlvbihzdHJpbmcpIHtcblx0XHRcdHJldHVybiByZWdleE5vbkFTQ0lJLnRlc3Qoc3RyaW5nKVxuXHRcdFx0XHQ/ICd4bi0tJyArIGVuY29kZShzdHJpbmcpXG5cdFx0XHRcdDogc3RyaW5nO1xuXHRcdH0pO1xuXHR9XG5cblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblx0LyoqIERlZmluZSB0aGUgcHVibGljIEFQSSAqL1xuXHRwdW55Y29kZSA9IHtcblx0XHQvKipcblx0XHQgKiBBIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIGN1cnJlbnQgUHVueWNvZGUuanMgdmVyc2lvbiBudW1iZXIuXG5cdFx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdFx0ICogQHR5cGUgU3RyaW5nXG5cdFx0ICovXG5cdFx0J3ZlcnNpb24nOiAnMS40LjEnLFxuXHRcdC8qKlxuXHRcdCAqIEFuIG9iamVjdCBvZiBtZXRob2RzIHRvIGNvbnZlcnQgZnJvbSBKYXZhU2NyaXB0J3MgaW50ZXJuYWwgY2hhcmFjdGVyXG5cdFx0ICogcmVwcmVzZW50YXRpb24gKFVDUy0yKSB0byBVbmljb2RlIGNvZGUgcG9pbnRzLCBhbmQgYmFjay5cblx0XHQgKiBAc2VlIDxodHRwczovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvamF2YXNjcmlwdC1lbmNvZGluZz5cblx0XHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0XHQgKiBAdHlwZSBPYmplY3Rcblx0XHQgKi9cblx0XHQndWNzMic6IHtcblx0XHRcdCdkZWNvZGUnOiB1Y3MyZGVjb2RlLFxuXHRcdFx0J2VuY29kZSc6IHVjczJlbmNvZGVcblx0XHR9LFxuXHRcdCdkZWNvZGUnOiBkZWNvZGUsXG5cdFx0J2VuY29kZSc6IGVuY29kZSxcblx0XHQndG9BU0NJSSc6IHRvQVNDSUksXG5cdFx0J3RvVW5pY29kZSc6IHRvVW5pY29kZVxuXHR9O1xuXG5cdC8qKiBFeHBvc2UgYHB1bnljb2RlYCAqL1xuXHQvLyBTb21lIEFNRCBidWlsZCBvcHRpbWl6ZXJzLCBsaWtlIHIuanMsIGNoZWNrIGZvciBzcGVjaWZpYyBjb25kaXRpb24gcGF0dGVybnNcblx0Ly8gbGlrZSB0aGUgZm9sbG93aW5nOlxuXHRpZiAoXG5cdFx0dHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmXG5cdFx0dHlwZW9mIGRlZmluZS5hbWQgPT0gJ29iamVjdCcgJiZcblx0XHRkZWZpbmUuYW1kXG5cdCkge1xuXHRcdGRlZmluZSgncHVueWNvZGUnLCBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBwdW55Y29kZTtcblx0XHR9KTtcblx0fSBlbHNlIGlmIChmcmVlRXhwb3J0cyAmJiBmcmVlTW9kdWxlKSB7XG5cdFx0aWYgKG1vZHVsZS5leHBvcnRzID09IGZyZWVFeHBvcnRzKSB7XG5cdFx0XHQvLyBpbiBOb2RlLmpzLCBpby5qcywgb3IgUmluZ29KUyB2MC44LjArXG5cdFx0XHRmcmVlTW9kdWxlLmV4cG9ydHMgPSBwdW55Y29kZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gaW4gTmFyd2hhbCBvciBSaW5nb0pTIHYwLjcuMC1cblx0XHRcdGZvciAoa2V5IGluIHB1bnljb2RlKSB7XG5cdFx0XHRcdHB1bnljb2RlLmhhc093blByb3BlcnR5KGtleSkgJiYgKGZyZWVFeHBvcnRzW2tleV0gPSBwdW55Y29kZVtrZXldKTtcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Ly8gaW4gUmhpbm8gb3IgYSB3ZWIgYnJvd3NlclxuXHRcdHJvb3QucHVueWNvZGUgPSBwdW55Y29kZTtcblx0fVxuXG59KHRoaXMpKTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4ndXNlIHN0cmljdCc7XG5cbi8vIElmIG9iai5oYXNPd25Qcm9wZXJ0eSBoYXMgYmVlbiBvdmVycmlkZGVuLCB0aGVuIGNhbGxpbmdcbi8vIG9iai5oYXNPd25Qcm9wZXJ0eShwcm9wKSB3aWxsIGJyZWFrLlxuLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vam95ZW50L25vZGUvaXNzdWVzLzE3MDdcbmZ1bmN0aW9uIGhhc093blByb3BlcnR5KG9iaiwgcHJvcCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocXMsIHNlcCwgZXEsIG9wdGlvbnMpIHtcbiAgc2VwID0gc2VwIHx8ICcmJztcbiAgZXEgPSBlcSB8fCAnPSc7XG4gIHZhciBvYmogPSB7fTtcblxuICBpZiAodHlwZW9mIHFzICE9PSAnc3RyaW5nJyB8fCBxcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gb2JqO1xuICB9XG5cbiAgdmFyIHJlZ2V4cCA9IC9cXCsvZztcbiAgcXMgPSBxcy5zcGxpdChzZXApO1xuXG4gIHZhciBtYXhLZXlzID0gMTAwMDtcbiAgaWYgKG9wdGlvbnMgJiYgdHlwZW9mIG9wdGlvbnMubWF4S2V5cyA9PT0gJ251bWJlcicpIHtcbiAgICBtYXhLZXlzID0gb3B0aW9ucy5tYXhLZXlzO1xuICB9XG5cbiAgdmFyIGxlbiA9IHFzLmxlbmd0aDtcbiAgLy8gbWF4S2V5cyA8PSAwIG1lYW5zIHRoYXQgd2Ugc2hvdWxkIG5vdCBsaW1pdCBrZXlzIGNvdW50XG4gIGlmIChtYXhLZXlzID4gMCAmJiBsZW4gPiBtYXhLZXlzKSB7XG4gICAgbGVuID0gbWF4S2V5cztcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpIHtcbiAgICB2YXIgeCA9IHFzW2ldLnJlcGxhY2UocmVnZXhwLCAnJTIwJyksXG4gICAgICAgIGlkeCA9IHguaW5kZXhPZihlcSksXG4gICAgICAgIGtzdHIsIHZzdHIsIGssIHY7XG5cbiAgICBpZiAoaWR4ID49IDApIHtcbiAgICAgIGtzdHIgPSB4LnN1YnN0cigwLCBpZHgpO1xuICAgICAgdnN0ciA9IHguc3Vic3RyKGlkeCArIDEpO1xuICAgIH0gZWxzZSB7XG4gICAgICBrc3RyID0geDtcbiAgICAgIHZzdHIgPSAnJztcbiAgICB9XG5cbiAgICBrID0gZGVjb2RlVVJJQ29tcG9uZW50KGtzdHIpO1xuICAgIHYgPSBkZWNvZGVVUklDb21wb25lbnQodnN0cik7XG5cbiAgICBpZiAoIWhhc093blByb3BlcnR5KG9iaiwgaykpIHtcbiAgICAgIG9ialtrXSA9IHY7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KG9ialtrXSkpIHtcbiAgICAgIG9ialtrXS5wdXNoKHYpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvYmpba10gPSBbb2JqW2tdLCB2XTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gb2JqO1xufTtcblxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uICh4cykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHhzKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgc3RyaW5naWZ5UHJpbWl0aXZlID0gZnVuY3Rpb24odikge1xuICBzd2l0Y2ggKHR5cGVvZiB2KSB7XG4gICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgIHJldHVybiB2O1xuXG4gICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICByZXR1cm4gdiA/ICd0cnVlJyA6ICdmYWxzZSc7XG5cbiAgICBjYXNlICdudW1iZXInOlxuICAgICAgcmV0dXJuIGlzRmluaXRlKHYpID8gdiA6ICcnO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiAnJztcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmosIHNlcCwgZXEsIG5hbWUpIHtcbiAgc2VwID0gc2VwIHx8ICcmJztcbiAgZXEgPSBlcSB8fCAnPSc7XG4gIGlmIChvYmogPT09IG51bGwpIHtcbiAgICBvYmogPSB1bmRlZmluZWQ7XG4gIH1cblxuICBpZiAodHlwZW9mIG9iaiA9PT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gbWFwKG9iamVjdEtleXMob2JqKSwgZnVuY3Rpb24oaykge1xuICAgICAgdmFyIGtzID0gZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZShrKSkgKyBlcTtcbiAgICAgIGlmIChpc0FycmF5KG9ialtrXSkpIHtcbiAgICAgICAgcmV0dXJuIG1hcChvYmpba10sIGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICByZXR1cm4ga3MgKyBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKHYpKTtcbiAgICAgICAgfSkuam9pbihzZXApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGtzICsgZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZShvYmpba10pKTtcbiAgICAgIH1cbiAgICB9KS5qb2luKHNlcCk7XG5cbiAgfVxuXG4gIGlmICghbmFtZSkgcmV0dXJuICcnO1xuICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZShuYW1lKSkgKyBlcSArXG4gICAgICAgICBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKG9iaikpO1xufTtcblxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uICh4cykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHhzKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG5cbmZ1bmN0aW9uIG1hcCAoeHMsIGYpIHtcbiAgaWYgKHhzLm1hcCkgcmV0dXJuIHhzLm1hcChmKTtcbiAgdmFyIHJlcyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgcmVzLnB1c2goZih4c1tpXSwgaSkpO1xuICB9XG4gIHJldHVybiByZXM7XG59XG5cbnZhciBvYmplY3RLZXlzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24gKG9iaikge1xuICB2YXIgcmVzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkgcmVzLnB1c2goa2V5KTtcbiAgfVxuICByZXR1cm4gcmVzO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5kZWNvZGUgPSBleHBvcnRzLnBhcnNlID0gcmVxdWlyZSgnLi9kZWNvZGUnKTtcbmV4cG9ydHMuZW5jb2RlID0gZXhwb3J0cy5zdHJpbmdpZnkgPSByZXF1aXJlKCcuL2VuY29kZScpO1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHB1bnljb2RlID0gcmVxdWlyZSgncHVueWNvZGUnKTtcbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbmV4cG9ydHMucGFyc2UgPSB1cmxQYXJzZTtcbmV4cG9ydHMucmVzb2x2ZSA9IHVybFJlc29sdmU7XG5leHBvcnRzLnJlc29sdmVPYmplY3QgPSB1cmxSZXNvbHZlT2JqZWN0O1xuZXhwb3J0cy5mb3JtYXQgPSB1cmxGb3JtYXQ7XG5cbmV4cG9ydHMuVXJsID0gVXJsO1xuXG5mdW5jdGlvbiBVcmwoKSB7XG4gIHRoaXMucHJvdG9jb2wgPSBudWxsO1xuICB0aGlzLnNsYXNoZXMgPSBudWxsO1xuICB0aGlzLmF1dGggPSBudWxsO1xuICB0aGlzLmhvc3QgPSBudWxsO1xuICB0aGlzLnBvcnQgPSBudWxsO1xuICB0aGlzLmhvc3RuYW1lID0gbnVsbDtcbiAgdGhpcy5oYXNoID0gbnVsbDtcbiAgdGhpcy5zZWFyY2ggPSBudWxsO1xuICB0aGlzLnF1ZXJ5ID0gbnVsbDtcbiAgdGhpcy5wYXRobmFtZSA9IG51bGw7XG4gIHRoaXMucGF0aCA9IG51bGw7XG4gIHRoaXMuaHJlZiA9IG51bGw7XG59XG5cbi8vIFJlZmVyZW5jZTogUkZDIDM5ODYsIFJGQyAxODA4LCBSRkMgMjM5NlxuXG4vLyBkZWZpbmUgdGhlc2UgaGVyZSBzbyBhdCBsZWFzdCB0aGV5IG9ubHkgaGF2ZSB0byBiZVxuLy8gY29tcGlsZWQgb25jZSBvbiB0aGUgZmlyc3QgbW9kdWxlIGxvYWQuXG52YXIgcHJvdG9jb2xQYXR0ZXJuID0gL14oW2EtejAtOS4rLV0rOikvaSxcbiAgICBwb3J0UGF0dGVybiA9IC86WzAtOV0qJC8sXG5cbiAgICAvLyBTcGVjaWFsIGNhc2UgZm9yIGEgc2ltcGxlIHBhdGggVVJMXG4gICAgc2ltcGxlUGF0aFBhdHRlcm4gPSAvXihcXC9cXC8/KD8hXFwvKVteXFw/XFxzXSopKFxcP1teXFxzXSopPyQvLFxuXG4gICAgLy8gUkZDIDIzOTY6IGNoYXJhY3RlcnMgcmVzZXJ2ZWQgZm9yIGRlbGltaXRpbmcgVVJMcy5cbiAgICAvLyBXZSBhY3R1YWxseSBqdXN0IGF1dG8tZXNjYXBlIHRoZXNlLlxuICAgIGRlbGltcyA9IFsnPCcsICc+JywgJ1wiJywgJ2AnLCAnICcsICdcXHInLCAnXFxuJywgJ1xcdCddLFxuXG4gICAgLy8gUkZDIDIzOTY6IGNoYXJhY3RlcnMgbm90IGFsbG93ZWQgZm9yIHZhcmlvdXMgcmVhc29ucy5cbiAgICB1bndpc2UgPSBbJ3snLCAnfScsICd8JywgJ1xcXFwnLCAnXicsICdgJ10uY29uY2F0KGRlbGltcyksXG5cbiAgICAvLyBBbGxvd2VkIGJ5IFJGQ3MsIGJ1dCBjYXVzZSBvZiBYU1MgYXR0YWNrcy4gIEFsd2F5cyBlc2NhcGUgdGhlc2UuXG4gICAgYXV0b0VzY2FwZSA9IFsnXFwnJ10uY29uY2F0KHVud2lzZSksXG4gICAgLy8gQ2hhcmFjdGVycyB0aGF0IGFyZSBuZXZlciBldmVyIGFsbG93ZWQgaW4gYSBob3N0bmFtZS5cbiAgICAvLyBOb3RlIHRoYXQgYW55IGludmFsaWQgY2hhcnMgYXJlIGFsc28gaGFuZGxlZCwgYnV0IHRoZXNlXG4gICAgLy8gYXJlIHRoZSBvbmVzIHRoYXQgYXJlICpleHBlY3RlZCogdG8gYmUgc2Vlbiwgc28gd2UgZmFzdC1wYXRoXG4gICAgLy8gdGhlbS5cbiAgICBub25Ib3N0Q2hhcnMgPSBbJyUnLCAnLycsICc/JywgJzsnLCAnIyddLmNvbmNhdChhdXRvRXNjYXBlKSxcbiAgICBob3N0RW5kaW5nQ2hhcnMgPSBbJy8nLCAnPycsICcjJ10sXG4gICAgaG9zdG5hbWVNYXhMZW4gPSAyNTUsXG4gICAgaG9zdG5hbWVQYXJ0UGF0dGVybiA9IC9eWythLXowLTlBLVpfLV17MCw2M30kLyxcbiAgICBob3N0bmFtZVBhcnRTdGFydCA9IC9eKFsrYS16MC05QS1aXy1dezAsNjN9KSguKikkLyxcbiAgICAvLyBwcm90b2NvbHMgdGhhdCBjYW4gYWxsb3cgXCJ1bnNhZmVcIiBhbmQgXCJ1bndpc2VcIiBjaGFycy5cbiAgICB1bnNhZmVQcm90b2NvbCA9IHtcbiAgICAgICdqYXZhc2NyaXB0JzogdHJ1ZSxcbiAgICAgICdqYXZhc2NyaXB0Oic6IHRydWVcbiAgICB9LFxuICAgIC8vIHByb3RvY29scyB0aGF0IG5ldmVyIGhhdmUgYSBob3N0bmFtZS5cbiAgICBob3N0bGVzc1Byb3RvY29sID0ge1xuICAgICAgJ2phdmFzY3JpcHQnOiB0cnVlLFxuICAgICAgJ2phdmFzY3JpcHQ6JzogdHJ1ZVxuICAgIH0sXG4gICAgLy8gcHJvdG9jb2xzIHRoYXQgYWx3YXlzIGNvbnRhaW4gYSAvLyBiaXQuXG4gICAgc2xhc2hlZFByb3RvY29sID0ge1xuICAgICAgJ2h0dHAnOiB0cnVlLFxuICAgICAgJ2h0dHBzJzogdHJ1ZSxcbiAgICAgICdmdHAnOiB0cnVlLFxuICAgICAgJ2dvcGhlcic6IHRydWUsXG4gICAgICAnZmlsZSc6IHRydWUsXG4gICAgICAnaHR0cDonOiB0cnVlLFxuICAgICAgJ2h0dHBzOic6IHRydWUsXG4gICAgICAnZnRwOic6IHRydWUsXG4gICAgICAnZ29waGVyOic6IHRydWUsXG4gICAgICAnZmlsZTonOiB0cnVlXG4gICAgfSxcbiAgICBxdWVyeXN0cmluZyA9IHJlcXVpcmUoJ3F1ZXJ5c3RyaW5nJyk7XG5cbmZ1bmN0aW9uIHVybFBhcnNlKHVybCwgcGFyc2VRdWVyeVN0cmluZywgc2xhc2hlc0Rlbm90ZUhvc3QpIHtcbiAgaWYgKHVybCAmJiB1dGlsLmlzT2JqZWN0KHVybCkgJiYgdXJsIGluc3RhbmNlb2YgVXJsKSByZXR1cm4gdXJsO1xuXG4gIHZhciB1ID0gbmV3IFVybDtcbiAgdS5wYXJzZSh1cmwsIHBhcnNlUXVlcnlTdHJpbmcsIHNsYXNoZXNEZW5vdGVIb3N0KTtcbiAgcmV0dXJuIHU7XG59XG5cblVybC5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbih1cmwsIHBhcnNlUXVlcnlTdHJpbmcsIHNsYXNoZXNEZW5vdGVIb3N0KSB7XG4gIGlmICghdXRpbC5pc1N0cmluZyh1cmwpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlBhcmFtZXRlciAndXJsJyBtdXN0IGJlIGEgc3RyaW5nLCBub3QgXCIgKyB0eXBlb2YgdXJsKTtcbiAgfVxuXG4gIC8vIENvcHkgY2hyb21lLCBJRSwgb3BlcmEgYmFja3NsYXNoLWhhbmRsaW5nIGJlaGF2aW9yLlxuICAvLyBCYWNrIHNsYXNoZXMgYmVmb3JlIHRoZSBxdWVyeSBzdHJpbmcgZ2V0IGNvbnZlcnRlZCB0byBmb3J3YXJkIHNsYXNoZXNcbiAgLy8gU2VlOiBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9MjU5MTZcbiAgdmFyIHF1ZXJ5SW5kZXggPSB1cmwuaW5kZXhPZignPycpLFxuICAgICAgc3BsaXR0ZXIgPVxuICAgICAgICAgIChxdWVyeUluZGV4ICE9PSAtMSAmJiBxdWVyeUluZGV4IDwgdXJsLmluZGV4T2YoJyMnKSkgPyAnPycgOiAnIycsXG4gICAgICB1U3BsaXQgPSB1cmwuc3BsaXQoc3BsaXR0ZXIpLFxuICAgICAgc2xhc2hSZWdleCA9IC9cXFxcL2c7XG4gIHVTcGxpdFswXSA9IHVTcGxpdFswXS5yZXBsYWNlKHNsYXNoUmVnZXgsICcvJyk7XG4gIHVybCA9IHVTcGxpdC5qb2luKHNwbGl0dGVyKTtcblxuICB2YXIgcmVzdCA9IHVybDtcblxuICAvLyB0cmltIGJlZm9yZSBwcm9jZWVkaW5nLlxuICAvLyBUaGlzIGlzIHRvIHN1cHBvcnQgcGFyc2Ugc3R1ZmYgbGlrZSBcIiAgaHR0cDovL2Zvby5jb20gIFxcblwiXG4gIHJlc3QgPSByZXN0LnRyaW0oKTtcblxuICBpZiAoIXNsYXNoZXNEZW5vdGVIb3N0ICYmIHVybC5zcGxpdCgnIycpLmxlbmd0aCA9PT0gMSkge1xuICAgIC8vIFRyeSBmYXN0IHBhdGggcmVnZXhwXG4gICAgdmFyIHNpbXBsZVBhdGggPSBzaW1wbGVQYXRoUGF0dGVybi5leGVjKHJlc3QpO1xuICAgIGlmIChzaW1wbGVQYXRoKSB7XG4gICAgICB0aGlzLnBhdGggPSByZXN0O1xuICAgICAgdGhpcy5ocmVmID0gcmVzdDtcbiAgICAgIHRoaXMucGF0aG5hbWUgPSBzaW1wbGVQYXRoWzFdO1xuICAgICAgaWYgKHNpbXBsZVBhdGhbMl0pIHtcbiAgICAgICAgdGhpcy5zZWFyY2ggPSBzaW1wbGVQYXRoWzJdO1xuICAgICAgICBpZiAocGFyc2VRdWVyeVN0cmluZykge1xuICAgICAgICAgIHRoaXMucXVlcnkgPSBxdWVyeXN0cmluZy5wYXJzZSh0aGlzLnNlYXJjaC5zdWJzdHIoMSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucXVlcnkgPSB0aGlzLnNlYXJjaC5zdWJzdHIoMSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAocGFyc2VRdWVyeVN0cmluZykge1xuICAgICAgICB0aGlzLnNlYXJjaCA9ICcnO1xuICAgICAgICB0aGlzLnF1ZXJ5ID0ge307XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH1cblxuICB2YXIgcHJvdG8gPSBwcm90b2NvbFBhdHRlcm4uZXhlYyhyZXN0KTtcbiAgaWYgKHByb3RvKSB7XG4gICAgcHJvdG8gPSBwcm90b1swXTtcbiAgICB2YXIgbG93ZXJQcm90byA9IHByb3RvLnRvTG93ZXJDYXNlKCk7XG4gICAgdGhpcy5wcm90b2NvbCA9IGxvd2VyUHJvdG87XG4gICAgcmVzdCA9IHJlc3Quc3Vic3RyKHByb3RvLmxlbmd0aCk7XG4gIH1cblxuICAvLyBmaWd1cmUgb3V0IGlmIGl0J3MgZ290IGEgaG9zdFxuICAvLyB1c2VyQHNlcnZlciBpcyAqYWx3YXlzKiBpbnRlcnByZXRlZCBhcyBhIGhvc3RuYW1lLCBhbmQgdXJsXG4gIC8vIHJlc29sdXRpb24gd2lsbCB0cmVhdCAvL2Zvby9iYXIgYXMgaG9zdD1mb28scGF0aD1iYXIgYmVjYXVzZSB0aGF0J3NcbiAgLy8gaG93IHRoZSBicm93c2VyIHJlc29sdmVzIHJlbGF0aXZlIFVSTHMuXG4gIGlmIChzbGFzaGVzRGVub3RlSG9zdCB8fCBwcm90byB8fCByZXN0Lm1hdGNoKC9eXFwvXFwvW15AXFwvXStAW15AXFwvXSsvKSkge1xuICAgIHZhciBzbGFzaGVzID0gcmVzdC5zdWJzdHIoMCwgMikgPT09ICcvLyc7XG4gICAgaWYgKHNsYXNoZXMgJiYgIShwcm90byAmJiBob3N0bGVzc1Byb3RvY29sW3Byb3RvXSkpIHtcbiAgICAgIHJlc3QgPSByZXN0LnN1YnN0cigyKTtcbiAgICAgIHRoaXMuc2xhc2hlcyA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFob3N0bGVzc1Byb3RvY29sW3Byb3RvXSAmJlxuICAgICAgKHNsYXNoZXMgfHwgKHByb3RvICYmICFzbGFzaGVkUHJvdG9jb2xbcHJvdG9dKSkpIHtcblxuICAgIC8vIHRoZXJlJ3MgYSBob3N0bmFtZS5cbiAgICAvLyB0aGUgZmlyc3QgaW5zdGFuY2Ugb2YgLywgPywgOywgb3IgIyBlbmRzIHRoZSBob3N0LlxuICAgIC8vXG4gICAgLy8gSWYgdGhlcmUgaXMgYW4gQCBpbiB0aGUgaG9zdG5hbWUsIHRoZW4gbm9uLWhvc3QgY2hhcnMgKmFyZSogYWxsb3dlZFxuICAgIC8vIHRvIHRoZSBsZWZ0IG9mIHRoZSBsYXN0IEAgc2lnbiwgdW5sZXNzIHNvbWUgaG9zdC1lbmRpbmcgY2hhcmFjdGVyXG4gICAgLy8gY29tZXMgKmJlZm9yZSogdGhlIEAtc2lnbi5cbiAgICAvLyBVUkxzIGFyZSBvYm5veGlvdXMuXG4gICAgLy9cbiAgICAvLyBleDpcbiAgICAvLyBodHRwOi8vYUBiQGMvID0+IHVzZXI6YUBiIGhvc3Q6Y1xuICAgIC8vIGh0dHA6Ly9hQGI/QGMgPT4gdXNlcjphIGhvc3Q6YyBwYXRoOi8/QGNcblxuICAgIC8vIHYwLjEyIFRPRE8oaXNhYWNzKTogVGhpcyBpcyBub3QgcXVpdGUgaG93IENocm9tZSBkb2VzIHRoaW5ncy5cbiAgICAvLyBSZXZpZXcgb3VyIHRlc3QgY2FzZSBhZ2FpbnN0IGJyb3dzZXJzIG1vcmUgY29tcHJlaGVuc2l2ZWx5LlxuXG4gICAgLy8gZmluZCB0aGUgZmlyc3QgaW5zdGFuY2Ugb2YgYW55IGhvc3RFbmRpbmdDaGFyc1xuICAgIHZhciBob3N0RW5kID0gLTE7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBob3N0RW5kaW5nQ2hhcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBoZWMgPSByZXN0LmluZGV4T2YoaG9zdEVuZGluZ0NoYXJzW2ldKTtcbiAgICAgIGlmIChoZWMgIT09IC0xICYmIChob3N0RW5kID09PSAtMSB8fCBoZWMgPCBob3N0RW5kKSlcbiAgICAgICAgaG9zdEVuZCA9IGhlYztcbiAgICB9XG5cbiAgICAvLyBhdCB0aGlzIHBvaW50LCBlaXRoZXIgd2UgaGF2ZSBhbiBleHBsaWNpdCBwb2ludCB3aGVyZSB0aGVcbiAgICAvLyBhdXRoIHBvcnRpb24gY2Fubm90IGdvIHBhc3QsIG9yIHRoZSBsYXN0IEAgY2hhciBpcyB0aGUgZGVjaWRlci5cbiAgICB2YXIgYXV0aCwgYXRTaWduO1xuICAgIGlmIChob3N0RW5kID09PSAtMSkge1xuICAgICAgLy8gYXRTaWduIGNhbiBiZSBhbnl3aGVyZS5cbiAgICAgIGF0U2lnbiA9IHJlc3QubGFzdEluZGV4T2YoJ0AnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gYXRTaWduIG11c3QgYmUgaW4gYXV0aCBwb3J0aW9uLlxuICAgICAgLy8gaHR0cDovL2FAYi9jQGQgPT4gaG9zdDpiIGF1dGg6YSBwYXRoOi9jQGRcbiAgICAgIGF0U2lnbiA9IHJlc3QubGFzdEluZGV4T2YoJ0AnLCBob3N0RW5kKTtcbiAgICB9XG5cbiAgICAvLyBOb3cgd2UgaGF2ZSBhIHBvcnRpb24gd2hpY2ggaXMgZGVmaW5pdGVseSB0aGUgYXV0aC5cbiAgICAvLyBQdWxsIHRoYXQgb2ZmLlxuICAgIGlmIChhdFNpZ24gIT09IC0xKSB7XG4gICAgICBhdXRoID0gcmVzdC5zbGljZSgwLCBhdFNpZ24pO1xuICAgICAgcmVzdCA9IHJlc3Quc2xpY2UoYXRTaWduICsgMSk7XG4gICAgICB0aGlzLmF1dGggPSBkZWNvZGVVUklDb21wb25lbnQoYXV0aCk7XG4gICAgfVxuXG4gICAgLy8gdGhlIGhvc3QgaXMgdGhlIHJlbWFpbmluZyB0byB0aGUgbGVmdCBvZiB0aGUgZmlyc3Qgbm9uLWhvc3QgY2hhclxuICAgIGhvc3RFbmQgPSAtMTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vbkhvc3RDaGFycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGhlYyA9IHJlc3QuaW5kZXhPZihub25Ib3N0Q2hhcnNbaV0pO1xuICAgICAgaWYgKGhlYyAhPT0gLTEgJiYgKGhvc3RFbmQgPT09IC0xIHx8IGhlYyA8IGhvc3RFbmQpKVxuICAgICAgICBob3N0RW5kID0gaGVjO1xuICAgIH1cbiAgICAvLyBpZiB3ZSBzdGlsbCBoYXZlIG5vdCBoaXQgaXQsIHRoZW4gdGhlIGVudGlyZSB0aGluZyBpcyBhIGhvc3QuXG4gICAgaWYgKGhvc3RFbmQgPT09IC0xKVxuICAgICAgaG9zdEVuZCA9IHJlc3QubGVuZ3RoO1xuXG4gICAgdGhpcy5ob3N0ID0gcmVzdC5zbGljZSgwLCBob3N0RW5kKTtcbiAgICByZXN0ID0gcmVzdC5zbGljZShob3N0RW5kKTtcblxuICAgIC8vIHB1bGwgb3V0IHBvcnQuXG4gICAgdGhpcy5wYXJzZUhvc3QoKTtcblxuICAgIC8vIHdlJ3ZlIGluZGljYXRlZCB0aGF0IHRoZXJlIGlzIGEgaG9zdG5hbWUsXG4gICAgLy8gc28gZXZlbiBpZiBpdCdzIGVtcHR5LCBpdCBoYXMgdG8gYmUgcHJlc2VudC5cbiAgICB0aGlzLmhvc3RuYW1lID0gdGhpcy5ob3N0bmFtZSB8fCAnJztcblxuICAgIC8vIGlmIGhvc3RuYW1lIGJlZ2lucyB3aXRoIFsgYW5kIGVuZHMgd2l0aCBdXG4gICAgLy8gYXNzdW1lIHRoYXQgaXQncyBhbiBJUHY2IGFkZHJlc3MuXG4gICAgdmFyIGlwdjZIb3N0bmFtZSA9IHRoaXMuaG9zdG5hbWVbMF0gPT09ICdbJyAmJlxuICAgICAgICB0aGlzLmhvc3RuYW1lW3RoaXMuaG9zdG5hbWUubGVuZ3RoIC0gMV0gPT09ICddJztcblxuICAgIC8vIHZhbGlkYXRlIGEgbGl0dGxlLlxuICAgIGlmICghaXB2Nkhvc3RuYW1lKSB7XG4gICAgICB2YXIgaG9zdHBhcnRzID0gdGhpcy5ob3N0bmFtZS5zcGxpdCgvXFwuLyk7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGhvc3RwYXJ0cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIHBhcnQgPSBob3N0cGFydHNbaV07XG4gICAgICAgIGlmICghcGFydCkgY29udGludWU7XG4gICAgICAgIGlmICghcGFydC5tYXRjaChob3N0bmFtZVBhcnRQYXR0ZXJuKSkge1xuICAgICAgICAgIHZhciBuZXdwYXJ0ID0gJyc7XG4gICAgICAgICAgZm9yICh2YXIgaiA9IDAsIGsgPSBwYXJ0Lmxlbmd0aDsgaiA8IGs7IGorKykge1xuICAgICAgICAgICAgaWYgKHBhcnQuY2hhckNvZGVBdChqKSA+IDEyNykge1xuICAgICAgICAgICAgICAvLyB3ZSByZXBsYWNlIG5vbi1BU0NJSSBjaGFyIHdpdGggYSB0ZW1wb3JhcnkgcGxhY2Vob2xkZXJcbiAgICAgICAgICAgICAgLy8gd2UgbmVlZCB0aGlzIHRvIG1ha2Ugc3VyZSBzaXplIG9mIGhvc3RuYW1lIGlzIG5vdFxuICAgICAgICAgICAgICAvLyBicm9rZW4gYnkgcmVwbGFjaW5nIG5vbi1BU0NJSSBieSBub3RoaW5nXG4gICAgICAgICAgICAgIG5ld3BhcnQgKz0gJ3gnO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgbmV3cGFydCArPSBwYXJ0W2pdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICAvLyB3ZSB0ZXN0IGFnYWluIHdpdGggQVNDSUkgY2hhciBvbmx5XG4gICAgICAgICAgaWYgKCFuZXdwYXJ0Lm1hdGNoKGhvc3RuYW1lUGFydFBhdHRlcm4pKSB7XG4gICAgICAgICAgICB2YXIgdmFsaWRQYXJ0cyA9IGhvc3RwYXJ0cy5zbGljZSgwLCBpKTtcbiAgICAgICAgICAgIHZhciBub3RIb3N0ID0gaG9zdHBhcnRzLnNsaWNlKGkgKyAxKTtcbiAgICAgICAgICAgIHZhciBiaXQgPSBwYXJ0Lm1hdGNoKGhvc3RuYW1lUGFydFN0YXJ0KTtcbiAgICAgICAgICAgIGlmIChiaXQpIHtcbiAgICAgICAgICAgICAgdmFsaWRQYXJ0cy5wdXNoKGJpdFsxXSk7XG4gICAgICAgICAgICAgIG5vdEhvc3QudW5zaGlmdChiaXRbMl0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5vdEhvc3QubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIHJlc3QgPSAnLycgKyBub3RIb3N0LmpvaW4oJy4nKSArIHJlc3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmhvc3RuYW1lID0gdmFsaWRQYXJ0cy5qb2luKCcuJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5ob3N0bmFtZS5sZW5ndGggPiBob3N0bmFtZU1heExlbikge1xuICAgICAgdGhpcy5ob3N0bmFtZSA9ICcnO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBob3N0bmFtZXMgYXJlIGFsd2F5cyBsb3dlciBjYXNlLlxuICAgICAgdGhpcy5ob3N0bmFtZSA9IHRoaXMuaG9zdG5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICB9XG5cbiAgICBpZiAoIWlwdjZIb3N0bmFtZSkge1xuICAgICAgLy8gSUROQSBTdXBwb3J0OiBSZXR1cm5zIGEgcHVueWNvZGVkIHJlcHJlc2VudGF0aW9uIG9mIFwiZG9tYWluXCIuXG4gICAgICAvLyBJdCBvbmx5IGNvbnZlcnRzIHBhcnRzIG9mIHRoZSBkb21haW4gbmFtZSB0aGF0XG4gICAgICAvLyBoYXZlIG5vbi1BU0NJSSBjaGFyYWN0ZXJzLCBpLmUuIGl0IGRvZXNuJ3QgbWF0dGVyIGlmXG4gICAgICAvLyB5b3UgY2FsbCBpdCB3aXRoIGEgZG9tYWluIHRoYXQgYWxyZWFkeSBpcyBBU0NJSS1vbmx5LlxuICAgICAgdGhpcy5ob3N0bmFtZSA9IHB1bnljb2RlLnRvQVNDSUkodGhpcy5ob3N0bmFtZSk7XG4gICAgfVxuXG4gICAgdmFyIHAgPSB0aGlzLnBvcnQgPyAnOicgKyB0aGlzLnBvcnQgOiAnJztcbiAgICB2YXIgaCA9IHRoaXMuaG9zdG5hbWUgfHwgJyc7XG4gICAgdGhpcy5ob3N0ID0gaCArIHA7XG4gICAgdGhpcy5ocmVmICs9IHRoaXMuaG9zdDtcblxuICAgIC8vIHN0cmlwIFsgYW5kIF0gZnJvbSB0aGUgaG9zdG5hbWVcbiAgICAvLyB0aGUgaG9zdCBmaWVsZCBzdGlsbCByZXRhaW5zIHRoZW0sIHRob3VnaFxuICAgIGlmIChpcHY2SG9zdG5hbWUpIHtcbiAgICAgIHRoaXMuaG9zdG5hbWUgPSB0aGlzLmhvc3RuYW1lLnN1YnN0cigxLCB0aGlzLmhvc3RuYW1lLmxlbmd0aCAtIDIpO1xuICAgICAgaWYgKHJlc3RbMF0gIT09ICcvJykge1xuICAgICAgICByZXN0ID0gJy8nICsgcmVzdDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBub3cgcmVzdCBpcyBzZXQgdG8gdGhlIHBvc3QtaG9zdCBzdHVmZi5cbiAgLy8gY2hvcCBvZmYgYW55IGRlbGltIGNoYXJzLlxuICBpZiAoIXVuc2FmZVByb3RvY29sW2xvd2VyUHJvdG9dKSB7XG5cbiAgICAvLyBGaXJzdCwgbWFrZSAxMDAlIHN1cmUgdGhhdCBhbnkgXCJhdXRvRXNjYXBlXCIgY2hhcnMgZ2V0XG4gICAgLy8gZXNjYXBlZCwgZXZlbiBpZiBlbmNvZGVVUklDb21wb25lbnQgZG9lc24ndCB0aGluayB0aGV5XG4gICAgLy8gbmVlZCB0byBiZS5cbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGF1dG9Fc2NhcGUubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB2YXIgYWUgPSBhdXRvRXNjYXBlW2ldO1xuICAgICAgaWYgKHJlc3QuaW5kZXhPZihhZSkgPT09IC0xKVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIHZhciBlc2MgPSBlbmNvZGVVUklDb21wb25lbnQoYWUpO1xuICAgICAgaWYgKGVzYyA9PT0gYWUpIHtcbiAgICAgICAgZXNjID0gZXNjYXBlKGFlKTtcbiAgICAgIH1cbiAgICAgIHJlc3QgPSByZXN0LnNwbGl0KGFlKS5qb2luKGVzYyk7XG4gICAgfVxuICB9XG5cblxuICAvLyBjaG9wIG9mZiBmcm9tIHRoZSB0YWlsIGZpcnN0LlxuICB2YXIgaGFzaCA9IHJlc3QuaW5kZXhPZignIycpO1xuICBpZiAoaGFzaCAhPT0gLTEpIHtcbiAgICAvLyBnb3QgYSBmcmFnbWVudCBzdHJpbmcuXG4gICAgdGhpcy5oYXNoID0gcmVzdC5zdWJzdHIoaGFzaCk7XG4gICAgcmVzdCA9IHJlc3Quc2xpY2UoMCwgaGFzaCk7XG4gIH1cbiAgdmFyIHFtID0gcmVzdC5pbmRleE9mKCc/Jyk7XG4gIGlmIChxbSAhPT0gLTEpIHtcbiAgICB0aGlzLnNlYXJjaCA9IHJlc3Quc3Vic3RyKHFtKTtcbiAgICB0aGlzLnF1ZXJ5ID0gcmVzdC5zdWJzdHIocW0gKyAxKTtcbiAgICBpZiAocGFyc2VRdWVyeVN0cmluZykge1xuICAgICAgdGhpcy5xdWVyeSA9IHF1ZXJ5c3RyaW5nLnBhcnNlKHRoaXMucXVlcnkpO1xuICAgIH1cbiAgICByZXN0ID0gcmVzdC5zbGljZSgwLCBxbSk7XG4gIH0gZWxzZSBpZiAocGFyc2VRdWVyeVN0cmluZykge1xuICAgIC8vIG5vIHF1ZXJ5IHN0cmluZywgYnV0IHBhcnNlUXVlcnlTdHJpbmcgc3RpbGwgcmVxdWVzdGVkXG4gICAgdGhpcy5zZWFyY2ggPSAnJztcbiAgICB0aGlzLnF1ZXJ5ID0ge307XG4gIH1cbiAgaWYgKHJlc3QpIHRoaXMucGF0aG5hbWUgPSByZXN0O1xuICBpZiAoc2xhc2hlZFByb3RvY29sW2xvd2VyUHJvdG9dICYmXG4gICAgICB0aGlzLmhvc3RuYW1lICYmICF0aGlzLnBhdGhuYW1lKSB7XG4gICAgdGhpcy5wYXRobmFtZSA9ICcvJztcbiAgfVxuXG4gIC8vdG8gc3VwcG9ydCBodHRwLnJlcXVlc3RcbiAgaWYgKHRoaXMucGF0aG5hbWUgfHwgdGhpcy5zZWFyY2gpIHtcbiAgICB2YXIgcCA9IHRoaXMucGF0aG5hbWUgfHwgJyc7XG4gICAgdmFyIHMgPSB0aGlzLnNlYXJjaCB8fCAnJztcbiAgICB0aGlzLnBhdGggPSBwICsgcztcbiAgfVxuXG4gIC8vIGZpbmFsbHksIHJlY29uc3RydWN0IHRoZSBocmVmIGJhc2VkIG9uIHdoYXQgaGFzIGJlZW4gdmFsaWRhdGVkLlxuICB0aGlzLmhyZWYgPSB0aGlzLmZvcm1hdCgpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGZvcm1hdCBhIHBhcnNlZCBvYmplY3QgaW50byBhIHVybCBzdHJpbmdcbmZ1bmN0aW9uIHVybEZvcm1hdChvYmopIHtcbiAgLy8gZW5zdXJlIGl0J3MgYW4gb2JqZWN0LCBhbmQgbm90IGEgc3RyaW5nIHVybC5cbiAgLy8gSWYgaXQncyBhbiBvYmosIHRoaXMgaXMgYSBuby1vcC5cbiAgLy8gdGhpcyB3YXksIHlvdSBjYW4gY2FsbCB1cmxfZm9ybWF0KCkgb24gc3RyaW5nc1xuICAvLyB0byBjbGVhbiB1cCBwb3RlbnRpYWxseSB3b25reSB1cmxzLlxuICBpZiAodXRpbC5pc1N0cmluZyhvYmopKSBvYmogPSB1cmxQYXJzZShvYmopO1xuICBpZiAoIShvYmogaW5zdGFuY2VvZiBVcmwpKSByZXR1cm4gVXJsLnByb3RvdHlwZS5mb3JtYXQuY2FsbChvYmopO1xuICByZXR1cm4gb2JqLmZvcm1hdCgpO1xufVxuXG5VcmwucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgYXV0aCA9IHRoaXMuYXV0aCB8fCAnJztcbiAgaWYgKGF1dGgpIHtcbiAgICBhdXRoID0gZW5jb2RlVVJJQ29tcG9uZW50KGF1dGgpO1xuICAgIGF1dGggPSBhdXRoLnJlcGxhY2UoLyUzQS9pLCAnOicpO1xuICAgIGF1dGggKz0gJ0AnO1xuICB9XG5cbiAgdmFyIHByb3RvY29sID0gdGhpcy5wcm90b2NvbCB8fCAnJyxcbiAgICAgIHBhdGhuYW1lID0gdGhpcy5wYXRobmFtZSB8fCAnJyxcbiAgICAgIGhhc2ggPSB0aGlzLmhhc2ggfHwgJycsXG4gICAgICBob3N0ID0gZmFsc2UsXG4gICAgICBxdWVyeSA9ICcnO1xuXG4gIGlmICh0aGlzLmhvc3QpIHtcbiAgICBob3N0ID0gYXV0aCArIHRoaXMuaG9zdDtcbiAgfSBlbHNlIGlmICh0aGlzLmhvc3RuYW1lKSB7XG4gICAgaG9zdCA9IGF1dGggKyAodGhpcy5ob3N0bmFtZS5pbmRleE9mKCc6JykgPT09IC0xID9cbiAgICAgICAgdGhpcy5ob3N0bmFtZSA6XG4gICAgICAgICdbJyArIHRoaXMuaG9zdG5hbWUgKyAnXScpO1xuICAgIGlmICh0aGlzLnBvcnQpIHtcbiAgICAgIGhvc3QgKz0gJzonICsgdGhpcy5wb3J0O1xuICAgIH1cbiAgfVxuXG4gIGlmICh0aGlzLnF1ZXJ5ICYmXG4gICAgICB1dGlsLmlzT2JqZWN0KHRoaXMucXVlcnkpICYmXG4gICAgICBPYmplY3Qua2V5cyh0aGlzLnF1ZXJ5KS5sZW5ndGgpIHtcbiAgICBxdWVyeSA9IHF1ZXJ5c3RyaW5nLnN0cmluZ2lmeSh0aGlzLnF1ZXJ5KTtcbiAgfVxuXG4gIHZhciBzZWFyY2ggPSB0aGlzLnNlYXJjaCB8fCAocXVlcnkgJiYgKCc/JyArIHF1ZXJ5KSkgfHwgJyc7XG5cbiAgaWYgKHByb3RvY29sICYmIHByb3RvY29sLnN1YnN0cigtMSkgIT09ICc6JykgcHJvdG9jb2wgKz0gJzonO1xuXG4gIC8vIG9ubHkgdGhlIHNsYXNoZWRQcm90b2NvbHMgZ2V0IHRoZSAvLy4gIE5vdCBtYWlsdG86LCB4bXBwOiwgZXRjLlxuICAvLyB1bmxlc3MgdGhleSBoYWQgdGhlbSB0byBiZWdpbiB3aXRoLlxuICBpZiAodGhpcy5zbGFzaGVzIHx8XG4gICAgICAoIXByb3RvY29sIHx8IHNsYXNoZWRQcm90b2NvbFtwcm90b2NvbF0pICYmIGhvc3QgIT09IGZhbHNlKSB7XG4gICAgaG9zdCA9ICcvLycgKyAoaG9zdCB8fCAnJyk7XG4gICAgaWYgKHBhdGhuYW1lICYmIHBhdGhuYW1lLmNoYXJBdCgwKSAhPT0gJy8nKSBwYXRobmFtZSA9ICcvJyArIHBhdGhuYW1lO1xuICB9IGVsc2UgaWYgKCFob3N0KSB7XG4gICAgaG9zdCA9ICcnO1xuICB9XG5cbiAgaWYgKGhhc2ggJiYgaGFzaC5jaGFyQXQoMCkgIT09ICcjJykgaGFzaCA9ICcjJyArIGhhc2g7XG4gIGlmIChzZWFyY2ggJiYgc2VhcmNoLmNoYXJBdCgwKSAhPT0gJz8nKSBzZWFyY2ggPSAnPycgKyBzZWFyY2g7XG5cbiAgcGF0aG5hbWUgPSBwYXRobmFtZS5yZXBsYWNlKC9bPyNdL2csIGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChtYXRjaCk7XG4gIH0pO1xuICBzZWFyY2ggPSBzZWFyY2gucmVwbGFjZSgnIycsICclMjMnKTtcblxuICByZXR1cm4gcHJvdG9jb2wgKyBob3N0ICsgcGF0aG5hbWUgKyBzZWFyY2ggKyBoYXNoO1xufTtcblxuZnVuY3Rpb24gdXJsUmVzb2x2ZShzb3VyY2UsIHJlbGF0aXZlKSB7XG4gIHJldHVybiB1cmxQYXJzZShzb3VyY2UsIGZhbHNlLCB0cnVlKS5yZXNvbHZlKHJlbGF0aXZlKTtcbn1cblxuVXJsLnByb3RvdHlwZS5yZXNvbHZlID0gZnVuY3Rpb24ocmVsYXRpdmUpIHtcbiAgcmV0dXJuIHRoaXMucmVzb2x2ZU9iamVjdCh1cmxQYXJzZShyZWxhdGl2ZSwgZmFsc2UsIHRydWUpKS5mb3JtYXQoKTtcbn07XG5cbmZ1bmN0aW9uIHVybFJlc29sdmVPYmplY3Qoc291cmNlLCByZWxhdGl2ZSkge1xuICBpZiAoIXNvdXJjZSkgcmV0dXJuIHJlbGF0aXZlO1xuICByZXR1cm4gdXJsUGFyc2Uoc291cmNlLCBmYWxzZSwgdHJ1ZSkucmVzb2x2ZU9iamVjdChyZWxhdGl2ZSk7XG59XG5cblVybC5wcm90b3R5cGUucmVzb2x2ZU9iamVjdCA9IGZ1bmN0aW9uKHJlbGF0aXZlKSB7XG4gIGlmICh1dGlsLmlzU3RyaW5nKHJlbGF0aXZlKSkge1xuICAgIHZhciByZWwgPSBuZXcgVXJsKCk7XG4gICAgcmVsLnBhcnNlKHJlbGF0aXZlLCBmYWxzZSwgdHJ1ZSk7XG4gICAgcmVsYXRpdmUgPSByZWw7XG4gIH1cblxuICB2YXIgcmVzdWx0ID0gbmV3IFVybCgpO1xuICB2YXIgdGtleXMgPSBPYmplY3Qua2V5cyh0aGlzKTtcbiAgZm9yICh2YXIgdGsgPSAwOyB0ayA8IHRrZXlzLmxlbmd0aDsgdGsrKykge1xuICAgIHZhciB0a2V5ID0gdGtleXNbdGtdO1xuICAgIHJlc3VsdFt0a2V5XSA9IHRoaXNbdGtleV07XG4gIH1cblxuICAvLyBoYXNoIGlzIGFsd2F5cyBvdmVycmlkZGVuLCBubyBtYXR0ZXIgd2hhdC5cbiAgLy8gZXZlbiBocmVmPVwiXCIgd2lsbCByZW1vdmUgaXQuXG4gIHJlc3VsdC5oYXNoID0gcmVsYXRpdmUuaGFzaDtcblxuICAvLyBpZiB0aGUgcmVsYXRpdmUgdXJsIGlzIGVtcHR5LCB0aGVuIHRoZXJlJ3Mgbm90aGluZyBsZWZ0IHRvIGRvIGhlcmUuXG4gIGlmIChyZWxhdGl2ZS5ocmVmID09PSAnJykge1xuICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvLyBocmVmcyBsaWtlIC8vZm9vL2JhciBhbHdheXMgY3V0IHRvIHRoZSBwcm90b2NvbC5cbiAgaWYgKHJlbGF0aXZlLnNsYXNoZXMgJiYgIXJlbGF0aXZlLnByb3RvY29sKSB7XG4gICAgLy8gdGFrZSBldmVyeXRoaW5nIGV4Y2VwdCB0aGUgcHJvdG9jb2wgZnJvbSByZWxhdGl2ZVxuICAgIHZhciBya2V5cyA9IE9iamVjdC5rZXlzKHJlbGF0aXZlKTtcbiAgICBmb3IgKHZhciByayA9IDA7IHJrIDwgcmtleXMubGVuZ3RoOyByaysrKSB7XG4gICAgICB2YXIgcmtleSA9IHJrZXlzW3JrXTtcbiAgICAgIGlmIChya2V5ICE9PSAncHJvdG9jb2wnKVxuICAgICAgICByZXN1bHRbcmtleV0gPSByZWxhdGl2ZVtya2V5XTtcbiAgICB9XG5cbiAgICAvL3VybFBhcnNlIGFwcGVuZHMgdHJhaWxpbmcgLyB0byB1cmxzIGxpa2UgaHR0cDovL3d3dy5leGFtcGxlLmNvbVxuICAgIGlmIChzbGFzaGVkUHJvdG9jb2xbcmVzdWx0LnByb3RvY29sXSAmJlxuICAgICAgICByZXN1bHQuaG9zdG5hbWUgJiYgIXJlc3VsdC5wYXRobmFtZSkge1xuICAgICAgcmVzdWx0LnBhdGggPSByZXN1bHQucGF0aG5hbWUgPSAnLyc7XG4gICAgfVxuXG4gICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGlmIChyZWxhdGl2ZS5wcm90b2NvbCAmJiByZWxhdGl2ZS5wcm90b2NvbCAhPT0gcmVzdWx0LnByb3RvY29sKSB7XG4gICAgLy8gaWYgaXQncyBhIGtub3duIHVybCBwcm90b2NvbCwgdGhlbiBjaGFuZ2luZ1xuICAgIC8vIHRoZSBwcm90b2NvbCBkb2VzIHdlaXJkIHRoaW5nc1xuICAgIC8vIGZpcnN0LCBpZiBpdCdzIG5vdCBmaWxlOiwgdGhlbiB3ZSBNVVNUIGhhdmUgYSBob3N0LFxuICAgIC8vIGFuZCBpZiB0aGVyZSB3YXMgYSBwYXRoXG4gICAgLy8gdG8gYmVnaW4gd2l0aCwgdGhlbiB3ZSBNVVNUIGhhdmUgYSBwYXRoLlxuICAgIC8vIGlmIGl0IGlzIGZpbGU6LCB0aGVuIHRoZSBob3N0IGlzIGRyb3BwZWQsXG4gICAgLy8gYmVjYXVzZSB0aGF0J3Mga25vd24gdG8gYmUgaG9zdGxlc3MuXG4gICAgLy8gYW55dGhpbmcgZWxzZSBpcyBhc3N1bWVkIHRvIGJlIGFic29sdXRlLlxuICAgIGlmICghc2xhc2hlZFByb3RvY29sW3JlbGF0aXZlLnByb3RvY29sXSkge1xuICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhyZWxhdGl2ZSk7XG4gICAgICBmb3IgKHZhciB2ID0gMDsgdiA8IGtleXMubGVuZ3RoOyB2KyspIHtcbiAgICAgICAgdmFyIGsgPSBrZXlzW3ZdO1xuICAgICAgICByZXN1bHRba10gPSByZWxhdGl2ZVtrXTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICByZXN1bHQucHJvdG9jb2wgPSByZWxhdGl2ZS5wcm90b2NvbDtcbiAgICBpZiAoIXJlbGF0aXZlLmhvc3QgJiYgIWhvc3RsZXNzUHJvdG9jb2xbcmVsYXRpdmUucHJvdG9jb2xdKSB7XG4gICAgICB2YXIgcmVsUGF0aCA9IChyZWxhdGl2ZS5wYXRobmFtZSB8fCAnJykuc3BsaXQoJy8nKTtcbiAgICAgIHdoaWxlIChyZWxQYXRoLmxlbmd0aCAmJiAhKHJlbGF0aXZlLmhvc3QgPSByZWxQYXRoLnNoaWZ0KCkpKTtcbiAgICAgIGlmICghcmVsYXRpdmUuaG9zdCkgcmVsYXRpdmUuaG9zdCA9ICcnO1xuICAgICAgaWYgKCFyZWxhdGl2ZS5ob3N0bmFtZSkgcmVsYXRpdmUuaG9zdG5hbWUgPSAnJztcbiAgICAgIGlmIChyZWxQYXRoWzBdICE9PSAnJykgcmVsUGF0aC51bnNoaWZ0KCcnKTtcbiAgICAgIGlmIChyZWxQYXRoLmxlbmd0aCA8IDIpIHJlbFBhdGgudW5zaGlmdCgnJyk7XG4gICAgICByZXN1bHQucGF0aG5hbWUgPSByZWxQYXRoLmpvaW4oJy8nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0LnBhdGhuYW1lID0gcmVsYXRpdmUucGF0aG5hbWU7XG4gICAgfVxuICAgIHJlc3VsdC5zZWFyY2ggPSByZWxhdGl2ZS5zZWFyY2g7XG4gICAgcmVzdWx0LnF1ZXJ5ID0gcmVsYXRpdmUucXVlcnk7XG4gICAgcmVzdWx0Lmhvc3QgPSByZWxhdGl2ZS5ob3N0IHx8ICcnO1xuICAgIHJlc3VsdC5hdXRoID0gcmVsYXRpdmUuYXV0aDtcbiAgICByZXN1bHQuaG9zdG5hbWUgPSByZWxhdGl2ZS5ob3N0bmFtZSB8fCByZWxhdGl2ZS5ob3N0O1xuICAgIHJlc3VsdC5wb3J0ID0gcmVsYXRpdmUucG9ydDtcbiAgICAvLyB0byBzdXBwb3J0IGh0dHAucmVxdWVzdFxuICAgIGlmIChyZXN1bHQucGF0aG5hbWUgfHwgcmVzdWx0LnNlYXJjaCkge1xuICAgICAgdmFyIHAgPSByZXN1bHQucGF0aG5hbWUgfHwgJyc7XG4gICAgICB2YXIgcyA9IHJlc3VsdC5zZWFyY2ggfHwgJyc7XG4gICAgICByZXN1bHQucGF0aCA9IHAgKyBzO1xuICAgIH1cbiAgICByZXN1bHQuc2xhc2hlcyA9IHJlc3VsdC5zbGFzaGVzIHx8IHJlbGF0aXZlLnNsYXNoZXM7XG4gICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHZhciBpc1NvdXJjZUFicyA9IChyZXN1bHQucGF0aG5hbWUgJiYgcmVzdWx0LnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nKSxcbiAgICAgIGlzUmVsQWJzID0gKFxuICAgICAgICAgIHJlbGF0aXZlLmhvc3QgfHxcbiAgICAgICAgICByZWxhdGl2ZS5wYXRobmFtZSAmJiByZWxhdGl2ZS5wYXRobmFtZS5jaGFyQXQoMCkgPT09ICcvJ1xuICAgICAgKSxcbiAgICAgIG11c3RFbmRBYnMgPSAoaXNSZWxBYnMgfHwgaXNTb3VyY2VBYnMgfHxcbiAgICAgICAgICAgICAgICAgICAgKHJlc3VsdC5ob3N0ICYmIHJlbGF0aXZlLnBhdGhuYW1lKSksXG4gICAgICByZW1vdmVBbGxEb3RzID0gbXVzdEVuZEFicyxcbiAgICAgIHNyY1BhdGggPSByZXN1bHQucGF0aG5hbWUgJiYgcmVzdWx0LnBhdGhuYW1lLnNwbGl0KCcvJykgfHwgW10sXG4gICAgICByZWxQYXRoID0gcmVsYXRpdmUucGF0aG5hbWUgJiYgcmVsYXRpdmUucGF0aG5hbWUuc3BsaXQoJy8nKSB8fCBbXSxcbiAgICAgIHBzeWNob3RpYyA9IHJlc3VsdC5wcm90b2NvbCAmJiAhc2xhc2hlZFByb3RvY29sW3Jlc3VsdC5wcm90b2NvbF07XG5cbiAgLy8gaWYgdGhlIHVybCBpcyBhIG5vbi1zbGFzaGVkIHVybCwgdGhlbiByZWxhdGl2ZVxuICAvLyBsaW5rcyBsaWtlIC4uLy4uIHNob3VsZCBiZSBhYmxlXG4gIC8vIHRvIGNyYXdsIHVwIHRvIHRoZSBob3N0bmFtZSwgYXMgd2VsbC4gIFRoaXMgaXMgc3RyYW5nZS5cbiAgLy8gcmVzdWx0LnByb3RvY29sIGhhcyBhbHJlYWR5IGJlZW4gc2V0IGJ5IG5vdy5cbiAgLy8gTGF0ZXIgb24sIHB1dCB0aGUgZmlyc3QgcGF0aCBwYXJ0IGludG8gdGhlIGhvc3QgZmllbGQuXG4gIGlmIChwc3ljaG90aWMpIHtcbiAgICByZXN1bHQuaG9zdG5hbWUgPSAnJztcbiAgICByZXN1bHQucG9ydCA9IG51bGw7XG4gICAgaWYgKHJlc3VsdC5ob3N0KSB7XG4gICAgICBpZiAoc3JjUGF0aFswXSA9PT0gJycpIHNyY1BhdGhbMF0gPSByZXN1bHQuaG9zdDtcbiAgICAgIGVsc2Ugc3JjUGF0aC51bnNoaWZ0KHJlc3VsdC5ob3N0KTtcbiAgICB9XG4gICAgcmVzdWx0Lmhvc3QgPSAnJztcbiAgICBpZiAocmVsYXRpdmUucHJvdG9jb2wpIHtcbiAgICAgIHJlbGF0aXZlLmhvc3RuYW1lID0gbnVsbDtcbiAgICAgIHJlbGF0aXZlLnBvcnQgPSBudWxsO1xuICAgICAgaWYgKHJlbGF0aXZlLmhvc3QpIHtcbiAgICAgICAgaWYgKHJlbFBhdGhbMF0gPT09ICcnKSByZWxQYXRoWzBdID0gcmVsYXRpdmUuaG9zdDtcbiAgICAgICAgZWxzZSByZWxQYXRoLnVuc2hpZnQocmVsYXRpdmUuaG9zdCk7XG4gICAgICB9XG4gICAgICByZWxhdGl2ZS5ob3N0ID0gbnVsbDtcbiAgICB9XG4gICAgbXVzdEVuZEFicyA9IG11c3RFbmRBYnMgJiYgKHJlbFBhdGhbMF0gPT09ICcnIHx8IHNyY1BhdGhbMF0gPT09ICcnKTtcbiAgfVxuXG4gIGlmIChpc1JlbEFicykge1xuICAgIC8vIGl0J3MgYWJzb2x1dGUuXG4gICAgcmVzdWx0Lmhvc3QgPSAocmVsYXRpdmUuaG9zdCB8fCByZWxhdGl2ZS5ob3N0ID09PSAnJykgP1xuICAgICAgICAgICAgICAgICAgcmVsYXRpdmUuaG9zdCA6IHJlc3VsdC5ob3N0O1xuICAgIHJlc3VsdC5ob3N0bmFtZSA9IChyZWxhdGl2ZS5ob3N0bmFtZSB8fCByZWxhdGl2ZS5ob3N0bmFtZSA9PT0gJycpID9cbiAgICAgICAgICAgICAgICAgICAgICByZWxhdGl2ZS5ob3N0bmFtZSA6IHJlc3VsdC5ob3N0bmFtZTtcbiAgICByZXN1bHQuc2VhcmNoID0gcmVsYXRpdmUuc2VhcmNoO1xuICAgIHJlc3VsdC5xdWVyeSA9IHJlbGF0aXZlLnF1ZXJ5O1xuICAgIHNyY1BhdGggPSByZWxQYXRoO1xuICAgIC8vIGZhbGwgdGhyb3VnaCB0byB0aGUgZG90LWhhbmRsaW5nIGJlbG93LlxuICB9IGVsc2UgaWYgKHJlbFBhdGgubGVuZ3RoKSB7XG4gICAgLy8gaXQncyByZWxhdGl2ZVxuICAgIC8vIHRocm93IGF3YXkgdGhlIGV4aXN0aW5nIGZpbGUsIGFuZCB0YWtlIHRoZSBuZXcgcGF0aCBpbnN0ZWFkLlxuICAgIGlmICghc3JjUGF0aCkgc3JjUGF0aCA9IFtdO1xuICAgIHNyY1BhdGgucG9wKCk7XG4gICAgc3JjUGF0aCA9IHNyY1BhdGguY29uY2F0KHJlbFBhdGgpO1xuICAgIHJlc3VsdC5zZWFyY2ggPSByZWxhdGl2ZS5zZWFyY2g7XG4gICAgcmVzdWx0LnF1ZXJ5ID0gcmVsYXRpdmUucXVlcnk7XG4gIH0gZWxzZSBpZiAoIXV0aWwuaXNOdWxsT3JVbmRlZmluZWQocmVsYXRpdmUuc2VhcmNoKSkge1xuICAgIC8vIGp1c3QgcHVsbCBvdXQgdGhlIHNlYXJjaC5cbiAgICAvLyBsaWtlIGhyZWY9Jz9mb28nLlxuICAgIC8vIFB1dCB0aGlzIGFmdGVyIHRoZSBvdGhlciB0d28gY2FzZXMgYmVjYXVzZSBpdCBzaW1wbGlmaWVzIHRoZSBib29sZWFuc1xuICAgIGlmIChwc3ljaG90aWMpIHtcbiAgICAgIHJlc3VsdC5ob3N0bmFtZSA9IHJlc3VsdC5ob3N0ID0gc3JjUGF0aC5zaGlmdCgpO1xuICAgICAgLy9vY2NhdGlvbmFseSB0aGUgYXV0aCBjYW4gZ2V0IHN0dWNrIG9ubHkgaW4gaG9zdFxuICAgICAgLy90aGlzIGVzcGVjaWFsbHkgaGFwcGVucyBpbiBjYXNlcyBsaWtlXG4gICAgICAvL3VybC5yZXNvbHZlT2JqZWN0KCdtYWlsdG86bG9jYWwxQGRvbWFpbjEnLCAnbG9jYWwyQGRvbWFpbjInKVxuICAgICAgdmFyIGF1dGhJbkhvc3QgPSByZXN1bHQuaG9zdCAmJiByZXN1bHQuaG9zdC5pbmRleE9mKCdAJykgPiAwID9cbiAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lmhvc3Quc3BsaXQoJ0AnKSA6IGZhbHNlO1xuICAgICAgaWYgKGF1dGhJbkhvc3QpIHtcbiAgICAgICAgcmVzdWx0LmF1dGggPSBhdXRoSW5Ib3N0LnNoaWZ0KCk7XG4gICAgICAgIHJlc3VsdC5ob3N0ID0gcmVzdWx0Lmhvc3RuYW1lID0gYXV0aEluSG9zdC5zaGlmdCgpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXN1bHQuc2VhcmNoID0gcmVsYXRpdmUuc2VhcmNoO1xuICAgIHJlc3VsdC5xdWVyeSA9IHJlbGF0aXZlLnF1ZXJ5O1xuICAgIC8vdG8gc3VwcG9ydCBodHRwLnJlcXVlc3RcbiAgICBpZiAoIXV0aWwuaXNOdWxsKHJlc3VsdC5wYXRobmFtZSkgfHwgIXV0aWwuaXNOdWxsKHJlc3VsdC5zZWFyY2gpKSB7XG4gICAgICByZXN1bHQucGF0aCA9IChyZXN1bHQucGF0aG5hbWUgPyByZXN1bHQucGF0aG5hbWUgOiAnJykgK1xuICAgICAgICAgICAgICAgICAgICAocmVzdWx0LnNlYXJjaCA/IHJlc3VsdC5zZWFyY2ggOiAnJyk7XG4gICAgfVxuICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBpZiAoIXNyY1BhdGgubGVuZ3RoKSB7XG4gICAgLy8gbm8gcGF0aCBhdCBhbGwuICBlYXN5LlxuICAgIC8vIHdlJ3ZlIGFscmVhZHkgaGFuZGxlZCB0aGUgb3RoZXIgc3R1ZmYgYWJvdmUuXG4gICAgcmVzdWx0LnBhdGhuYW1lID0gbnVsbDtcbiAgICAvL3RvIHN1cHBvcnQgaHR0cC5yZXF1ZXN0XG4gICAgaWYgKHJlc3VsdC5zZWFyY2gpIHtcbiAgICAgIHJlc3VsdC5wYXRoID0gJy8nICsgcmVzdWx0LnNlYXJjaDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0LnBhdGggPSBudWxsO1xuICAgIH1cbiAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLy8gaWYgYSB1cmwgRU5EcyBpbiAuIG9yIC4uLCB0aGVuIGl0IG11c3QgZ2V0IGEgdHJhaWxpbmcgc2xhc2guXG4gIC8vIGhvd2V2ZXIsIGlmIGl0IGVuZHMgaW4gYW55dGhpbmcgZWxzZSBub24tc2xhc2h5LFxuICAvLyB0aGVuIGl0IG11c3QgTk9UIGdldCBhIHRyYWlsaW5nIHNsYXNoLlxuICB2YXIgbGFzdCA9IHNyY1BhdGguc2xpY2UoLTEpWzBdO1xuICB2YXIgaGFzVHJhaWxpbmdTbGFzaCA9IChcbiAgICAgIChyZXN1bHQuaG9zdCB8fCByZWxhdGl2ZS5ob3N0IHx8IHNyY1BhdGgubGVuZ3RoID4gMSkgJiZcbiAgICAgIChsYXN0ID09PSAnLicgfHwgbGFzdCA9PT0gJy4uJykgfHwgbGFzdCA9PT0gJycpO1xuXG4gIC8vIHN0cmlwIHNpbmdsZSBkb3RzLCByZXNvbHZlIGRvdWJsZSBkb3RzIHRvIHBhcmVudCBkaXJcbiAgLy8gaWYgdGhlIHBhdGggdHJpZXMgdG8gZ28gYWJvdmUgdGhlIHJvb3QsIGB1cGAgZW5kcyB1cCA+IDBcbiAgdmFyIHVwID0gMDtcbiAgZm9yICh2YXIgaSA9IHNyY1BhdGgubGVuZ3RoOyBpID49IDA7IGktLSkge1xuICAgIGxhc3QgPSBzcmNQYXRoW2ldO1xuICAgIGlmIChsYXN0ID09PSAnLicpIHtcbiAgICAgIHNyY1BhdGguc3BsaWNlKGksIDEpO1xuICAgIH0gZWxzZSBpZiAobGFzdCA9PT0gJy4uJykge1xuICAgICAgc3JjUGF0aC5zcGxpY2UoaSwgMSk7XG4gICAgICB1cCsrO1xuICAgIH0gZWxzZSBpZiAodXApIHtcbiAgICAgIHNyY1BhdGguc3BsaWNlKGksIDEpO1xuICAgICAgdXAtLTtcbiAgICB9XG4gIH1cblxuICAvLyBpZiB0aGUgcGF0aCBpcyBhbGxvd2VkIHRvIGdvIGFib3ZlIHRoZSByb290LCByZXN0b3JlIGxlYWRpbmcgLi5zXG4gIGlmICghbXVzdEVuZEFicyAmJiAhcmVtb3ZlQWxsRG90cykge1xuICAgIGZvciAoOyB1cC0tOyB1cCkge1xuICAgICAgc3JjUGF0aC51bnNoaWZ0KCcuLicpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChtdXN0RW5kQWJzICYmIHNyY1BhdGhbMF0gIT09ICcnICYmXG4gICAgICAoIXNyY1BhdGhbMF0gfHwgc3JjUGF0aFswXS5jaGFyQXQoMCkgIT09ICcvJykpIHtcbiAgICBzcmNQYXRoLnVuc2hpZnQoJycpO1xuICB9XG5cbiAgaWYgKGhhc1RyYWlsaW5nU2xhc2ggJiYgKHNyY1BhdGguam9pbignLycpLnN1YnN0cigtMSkgIT09ICcvJykpIHtcbiAgICBzcmNQYXRoLnB1c2goJycpO1xuICB9XG5cbiAgdmFyIGlzQWJzb2x1dGUgPSBzcmNQYXRoWzBdID09PSAnJyB8fFxuICAgICAgKHNyY1BhdGhbMF0gJiYgc3JjUGF0aFswXS5jaGFyQXQoMCkgPT09ICcvJyk7XG5cbiAgLy8gcHV0IHRoZSBob3N0IGJhY2tcbiAgaWYgKHBzeWNob3RpYykge1xuICAgIHJlc3VsdC5ob3N0bmFtZSA9IHJlc3VsdC5ob3N0ID0gaXNBYnNvbHV0ZSA/ICcnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNyY1BhdGgubGVuZ3RoID8gc3JjUGF0aC5zaGlmdCgpIDogJyc7XG4gICAgLy9vY2NhdGlvbmFseSB0aGUgYXV0aCBjYW4gZ2V0IHN0dWNrIG9ubHkgaW4gaG9zdFxuICAgIC8vdGhpcyBlc3BlY2lhbGx5IGhhcHBlbnMgaW4gY2FzZXMgbGlrZVxuICAgIC8vdXJsLnJlc29sdmVPYmplY3QoJ21haWx0bzpsb2NhbDFAZG9tYWluMScsICdsb2NhbDJAZG9tYWluMicpXG4gICAgdmFyIGF1dGhJbkhvc3QgPSByZXN1bHQuaG9zdCAmJiByZXN1bHQuaG9zdC5pbmRleE9mKCdAJykgPiAwID9cbiAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5ob3N0LnNwbGl0KCdAJykgOiBmYWxzZTtcbiAgICBpZiAoYXV0aEluSG9zdCkge1xuICAgICAgcmVzdWx0LmF1dGggPSBhdXRoSW5Ib3N0LnNoaWZ0KCk7XG4gICAgICByZXN1bHQuaG9zdCA9IHJlc3VsdC5ob3N0bmFtZSA9IGF1dGhJbkhvc3Quc2hpZnQoKTtcbiAgICB9XG4gIH1cblxuICBtdXN0RW5kQWJzID0gbXVzdEVuZEFicyB8fCAocmVzdWx0Lmhvc3QgJiYgc3JjUGF0aC5sZW5ndGgpO1xuXG4gIGlmIChtdXN0RW5kQWJzICYmICFpc0Fic29sdXRlKSB7XG4gICAgc3JjUGF0aC51bnNoaWZ0KCcnKTtcbiAgfVxuXG4gIGlmICghc3JjUGF0aC5sZW5ndGgpIHtcbiAgICByZXN1bHQucGF0aG5hbWUgPSBudWxsO1xuICAgIHJlc3VsdC5wYXRoID0gbnVsbDtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQucGF0aG5hbWUgPSBzcmNQYXRoLmpvaW4oJy8nKTtcbiAgfVxuXG4gIC8vdG8gc3VwcG9ydCByZXF1ZXN0Lmh0dHBcbiAgaWYgKCF1dGlsLmlzTnVsbChyZXN1bHQucGF0aG5hbWUpIHx8ICF1dGlsLmlzTnVsbChyZXN1bHQuc2VhcmNoKSkge1xuICAgIHJlc3VsdC5wYXRoID0gKHJlc3VsdC5wYXRobmFtZSA/IHJlc3VsdC5wYXRobmFtZSA6ICcnKSArXG4gICAgICAgICAgICAgICAgICAocmVzdWx0LnNlYXJjaCA/IHJlc3VsdC5zZWFyY2ggOiAnJyk7XG4gIH1cbiAgcmVzdWx0LmF1dGggPSByZWxhdGl2ZS5hdXRoIHx8IHJlc3VsdC5hdXRoO1xuICByZXN1bHQuc2xhc2hlcyA9IHJlc3VsdC5zbGFzaGVzIHx8IHJlbGF0aXZlLnNsYXNoZXM7XG4gIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICByZXR1cm4gcmVzdWx0O1xufTtcblxuVXJsLnByb3RvdHlwZS5wYXJzZUhvc3QgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGhvc3QgPSB0aGlzLmhvc3Q7XG4gIHZhciBwb3J0ID0gcG9ydFBhdHRlcm4uZXhlYyhob3N0KTtcbiAgaWYgKHBvcnQpIHtcbiAgICBwb3J0ID0gcG9ydFswXTtcbiAgICBpZiAocG9ydCAhPT0gJzonKSB7XG4gICAgICB0aGlzLnBvcnQgPSBwb3J0LnN1YnN0cigxKTtcbiAgICB9XG4gICAgaG9zdCA9IGhvc3Quc3Vic3RyKDAsIGhvc3QubGVuZ3RoIC0gcG9ydC5sZW5ndGgpO1xuICB9XG4gIGlmIChob3N0KSB0aGlzLmhvc3RuYW1lID0gaG9zdDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpc1N0cmluZzogZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIHR5cGVvZihhcmcpID09PSAnc3RyaW5nJztcbiAgfSxcbiAgaXNPYmplY3Q6IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiB0eXBlb2YoYXJnKSA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xuICB9LFxuICBpc051bGw6IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiBhcmcgPT09IG51bGw7XG4gIH0sXG4gIGlzTnVsbE9yVW5kZWZpbmVkOiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gYXJnID09IG51bGw7XG4gIH1cbn07XG4iXX0=
