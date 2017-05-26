(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/**
 * @fileoverview storage存储使用演示
 * @version 1.0 | 2017-05-26 版本信息
 * @author Zhang Mingrui | 592044573@qq.com
 * @example
 * */
var Storage = require('libio-storage'),
    BaseView = require('core-baseview');

BaseView.register({
    _init: function _init() {

        var nodes = {
            keyname: $('#keyname'),
            outdate: $('#outdate'),
            mydata: $('#mydata')
        };

        var _storageMap = {};

        function create() {
            var keyname = nodes.keyname.val().trim();
            if (_storageMap[keyname]) {
                _APP.Toast.show(keyname + '键值的数据存储对象已经创建');
            } else {
                _storageMap[keyname] = Storage.create({
                    maxage: nodes.outdate.val().trim(),
                    key: keyname
                });
                _APP.Toast.show(keyname + '键值的数据存储对象创建成功');
            }
        }

        function warn() {
            console.log('请在开发人员工具中查看localStorage的存储数据情况');
        }

        $('#createStorage').on('click', function () {
            create();
        });

        $('#setStorage').on('click', function () {
            var keyname = nodes.keyname.val().trim();
            var value = JSON.parse(nodes.mydata.val().trim());
            _storageMap[keyname].set(value);
            console.warn('可以尝试在过期时间后，尝试获取当前数据项，查看返回结果');
            warn();
        });

        $('#getStorage').on('click', function () {
            console.log('获取存储的数据');
            var keyname = nodes.keyname.val().trim();
            var data = _storageMap[keyname].get();
            console.log(data);
            if (data == null) {
                console.warn('数据已过期');
                warn();
            }
        });

        $('#removeStorage').on('click', function () {
            var keyname = nodes.keyname.val().trim();
            _storageMap[keyname].remove();
            warn();
        });

        $('#clearStorage').on('click', function () {
            Storage.clear();
            warn();
        });
    }
});

},{"core-baseview":2,"libio-storage":10}],2:[function(require,module,exports){
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

},{"../ui/ui.alert.js":4,"../ui/ui.confirm.js":6,"../ui/ui.loading.js":8,"../ui/ui.toast.js":9,"libutil-tool":30}],3:[function(require,module,exports){
module.exports = "<div class=\"title js-title\">提示</div><div class=\"body js-content\"></div><div class=footer><a href=javascript:; class=js-ok>确定</a></div>";

},{}],4:[function(require,module,exports){
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

},{"./ui.alert.html":3,"liblayer-alertSingle":13,"libutil-csssuport":23}],5:[function(require,module,exports){
module.exports = "<div class=\"title js-title\">提示</div><div class=\"body js-content\"></div><div class=footer><a href=javascript:; class=\"cancel js-cancel\">取消</a> <a href=javascript:; class=js-ok>确定</a> <i class=split></i></div>";

},{}],6:[function(require,module,exports){
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

},{"./ui.confirm.html":5,"liblayer-confirmSingle":18,"libutil-csssuport":23}],7:[function(require,module,exports){
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

},{"liblayer-bombLayer":15,"libutil-csssuport":23}],8:[function(require,module,exports){
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

},{"./ui.layer.js":7,"libutil-workerControl":33}],9:[function(require,module,exports){
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

},{"./ui.layer.js":7,"libutil-workerControl":33}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{"./bombLayer.js":15,"./tpl.js":22}],12:[function(require,module,exports){
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

},{"./alert.js":11,"./baseControl.js":14}],13:[function(require,module,exports){
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

},{"./alertControl.js":12}],14:[function(require,module,exports){
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

},{"libutil-tool":30}],15:[function(require,module,exports){
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
				this.container.remove();
			}
			this._newcontainer = null;
		}
	}]);

	return BombLayer;
}(Layer);

module.exports = BombLayer;

},{"./layer.js":19,"./mask.js":20,"./positionBomb.js":21,"libutil-tool":30}],16:[function(require,module,exports){
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

},{"./bombLayer.js":15,"./tpl.js":22}],17:[function(require,module,exports){
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

},{"./baseControl.js":14,"./confirm.js":16}],18:[function(require,module,exports){
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

},{"./confirmControl.js":17}],19:[function(require,module,exports){
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

},{}],20:[function(require,module,exports){
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

},{"./positionBomb.js":21}],21:[function(require,module,exports){
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

},{"libutil-resize":27,"libutil-scroll":29,"libutil-winresize":31,"libutil-winscroll":32}],22:[function(require,module,exports){
'use strict';

/**
 * alert弹层模板，必须具有指定的node属性
 */
exports.alert = ['<div>标题</div>', '<div node="content">内容区</div>', '<div><a href="javascript:;" class="js-ok">确定</a></div>'].join('');
/**
 * confirm弹层模板，必须具有指定的node属性
 */
exports.confirm = ['<div>标题</div>', '<div node="content">内容区</div>', '<div><a href="javascript:;" class="js-ok">确定</a><a href="javascript:;" class="js-cancel">取消</a></div>'].join('');

},{}],23:[function(require,module,exports){
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

},{}],24:[function(require,module,exports){
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

},{"./publisherS.js":26}],25:[function(require,module,exports){
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

},{}],26:[function(require,module,exports){
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

},{"./rwcontroller.js":28,"./tool.js":30}],27:[function(require,module,exports){
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

},{"./delayevt.js":24}],28:[function(require,module,exports){
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

},{"./tool.js":30}],29:[function(require,module,exports){
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

},{"./delayevt.js":24}],30:[function(require,module,exports){
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

},{"url":38}],31:[function(require,module,exports){
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

},{"./deviceevtname.js":25,"./resize.js":27}],32:[function(require,module,exports){
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

},{"./scroll.js":29}],33:[function(require,module,exports){
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

},{}],34:[function(require,module,exports){
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

},{}],35:[function(require,module,exports){
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

},{}],36:[function(require,module,exports){
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

},{}],37:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":35,"./encode":36}],38:[function(require,module,exports){
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

},{"./util":39,"punycode":34,"querystring":37}],39:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3Rvb2wvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInB1YmxpY1xcamF2YXNjcmlwdHNcXHBhZ2VcXHN0b3JhZ2UuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFxjb21tb25cXGJhc2Uudmlldy5qcyIsIi4uL25vZGUtY29yZXVpLXBjL2pzL3VpL3VpLmFsZXJ0Lmh0bWwiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx1aVxcdWkuYWxlcnQuanMiLCIuLi9ub2RlLWNvcmV1aS1wYy9qcy91aS91aS5jb25maXJtLmh0bWwiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx1aVxcdWkuY29uZmlybS5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHVpXFx1aS5sYXllci5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHVpXFx1aS5sb2FkaW5nLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcdWlcXHVpLnRvYXN0LmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFxpb1xcc3RvcmFnZS5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdWlcXGxheWVyXFxhbGVydC5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdWlcXGxheWVyXFxhbGVydENvbnRyb2wuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHVpXFxsYXllclxcYWxlcnRTaW5nbGUuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHVpXFxsYXllclxcYmFzZUNvbnRyb2wuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHVpXFxsYXllclxcYm9tYkxheWVyLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1aVxcbGF5ZXJcXGNvbmZpcm0uanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHVpXFxsYXllclxcY29uZmlybUNvbnRyb2wuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHVpXFxsYXllclxcY29uZmlybVNpbmdsZS5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdWlcXGxheWVyXFxsYXllci5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdWlcXGxheWVyXFxtYXNrLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1aVxcbGF5ZXJcXHBvc2l0aW9uQm9tYi5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdWlcXGxheWVyXFx0cGwuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHV0aWxcXGNzc3N1cG9ydC5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdXRpbFxcZGVsYXlldnQuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHV0aWxcXGRldmljZWV2dG5hbWUuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHV0aWxcXHB1Ymxpc2hlclMuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHV0aWxcXHJlc2l6ZS5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdXRpbFxccndjb250cm9sbGVyLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1dGlsXFxzY3JvbGwuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHV0aWxcXHRvb2wuanMiLCIuLlxcbm9kZS1jb3JldWktcGNcXGpzXFx3aWRnZXRcXHV0aWxcXHdpbnJlc2l6ZS5qcyIsIi4uXFxub2RlLWNvcmV1aS1wY1xcanNcXHdpZGdldFxcdXRpbFxcd2luc2Nyb2xsLmpzIiwiLi5cXG5vZGUtY29yZXVpLXBjXFxqc1xcd2lkZ2V0XFx1dGlsXFx3b3JrZXJDb250cm9sLmpzIiwiLi4vdG9vbC9ub2RlX21vZHVsZXMvcHVueWNvZGUvcHVueWNvZGUuanMiLCIuLi90b29sL25vZGVfbW9kdWxlcy9xdWVyeXN0cmluZy1lczMvZGVjb2RlLmpzIiwiLi4vdG9vbC9ub2RlX21vZHVsZXMvcXVlcnlzdHJpbmctZXMzL2VuY29kZS5qcyIsIi4uL3Rvb2wvbm9kZV9tb2R1bGVzL3F1ZXJ5c3RyaW5nLWVzMy9pbmRleC5qcyIsIi4uL3Rvb2wvbm9kZV9tb2R1bGVzL3VybC91cmwuanMiLCIuLi90b29sL25vZGVfbW9kdWxlcy91cmwvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7OztBQU1BLElBQU0sVUFBVSxRQUFRLGVBQVIsQ0FBaEI7QUFBQSxJQUNRLFdBQVcsUUFBUSxlQUFSLENBRG5COztBQUdBLFNBQVMsUUFBVCxDQUFrQjtBQUNkLFdBQU8saUJBQVU7O0FBRWIsWUFBSSxRQUFRO0FBQ1IscUJBQVMsRUFBRSxVQUFGLENBREQ7QUFFUixxQkFBUyxFQUFFLFVBQUYsQ0FGRDtBQUdSLG9CQUFRLEVBQUUsU0FBRjtBQUhBLFNBQVo7O0FBTUEsWUFBSSxjQUFjLEVBQWxCOztBQUVBLGlCQUFTLE1BQVQsR0FBaUI7QUFDYixnQkFBSSxVQUFVLE1BQU0sT0FBTixDQUFjLEdBQWQsR0FBb0IsSUFBcEIsRUFBZDtBQUNBLGdCQUFHLFlBQVksT0FBWixDQUFILEVBQXdCO0FBQ3BCLHFCQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLFVBQVEsZUFBeEI7QUFDSCxhQUZELE1BRUs7QUFDRCw0QkFBWSxPQUFaLElBQXVCLFFBQVEsTUFBUixDQUFlO0FBQ2xDLDRCQUFRLE1BQU0sT0FBTixDQUFjLEdBQWQsR0FBb0IsSUFBcEIsRUFEMEI7QUFFbEMseUJBQUs7QUFGNkIsaUJBQWYsQ0FBdkI7QUFJQSxxQkFBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixVQUFRLGVBQXhCO0FBQ0g7QUFDSjs7QUFFRCxpQkFBUyxJQUFULEdBQWU7QUFDWCxvQkFBUSxHQUFSLENBQVksZ0NBQVo7QUFDSDs7QUFFRCxV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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDcmhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1dEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcgc3RvcmFnZeWtmOWCqOS9v+eUqOa8lOekulxyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE3LTA1LTI2IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEBleGFtcGxlXHJcbiAqICovXHJcbmNvbnN0IFN0b3JhZ2UgPSByZXF1aXJlKCdsaWJpby1zdG9yYWdlJyksXHJcbiAgICAgICAgQmFzZVZpZXcgPSByZXF1aXJlKCdjb3JlLWJhc2V2aWV3Jyk7XHJcblxyXG5CYXNlVmlldy5yZWdpc3Rlcih7XHJcbiAgICBfaW5pdDogZnVuY3Rpb24oKXtcclxuXHJcbiAgICAgICAgdmFyIG5vZGVzID0ge1xyXG4gICAgICAgICAgICBrZXluYW1lOiAkKCcja2V5bmFtZScpLFxyXG4gICAgICAgICAgICBvdXRkYXRlOiAkKCcjb3V0ZGF0ZScpLFxyXG4gICAgICAgICAgICBteWRhdGE6ICQoJyNteWRhdGEnKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIF9zdG9yYWdlTWFwID0ge307XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZSgpe1xyXG4gICAgICAgICAgICB2YXIga2V5bmFtZSA9IG5vZGVzLmtleW5hbWUudmFsKCkudHJpbSgpO1xyXG4gICAgICAgICAgICBpZihfc3RvcmFnZU1hcFtrZXluYW1lXSl7XHJcbiAgICAgICAgICAgICAgICBfQVBQLlRvYXN0LnNob3coa2V5bmFtZSsn6ZSu5YC855qE5pWw5o2u5a2Y5YKo5a+56LGh5bey57uP5Yib5bu6Jyk7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgX3N0b3JhZ2VNYXBba2V5bmFtZV0gPSBTdG9yYWdlLmNyZWF0ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgbWF4YWdlOiBub2Rlcy5vdXRkYXRlLnZhbCgpLnRyaW0oKSxcclxuICAgICAgICAgICAgICAgICAgICBrZXk6IGtleW5hbWVcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgX0FQUC5Ub2FzdC5zaG93KGtleW5hbWUrJ+mUruWAvOeahOaVsOaNruWtmOWCqOWvueixoeWIm+W7uuaIkOWKnycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiB3YXJuKCl7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCfor7flnKjlvIDlj5HkurrlkZjlt6XlhbfkuK3mn6XnnItsb2NhbFN0b3JhZ2XnmoTlrZjlgqjmlbDmja7mg4XlhrUnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICQoJyNjcmVhdGVTdG9yYWdlJykub24oJ2NsaWNrJyxmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBjcmVhdGUoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJCgnI3NldFN0b3JhZ2UnKS5vbignY2xpY2snLGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHZhciBrZXluYW1lID0gbm9kZXMua2V5bmFtZS52YWwoKS50cmltKCk7XHJcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IEpTT04ucGFyc2Uobm9kZXMubXlkYXRhLnZhbCgpLnRyaW0oKSk7XHJcbiAgICAgICAgICAgIF9zdG9yYWdlTWFwW2tleW5hbWVdLnNldCh2YWx1ZSk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybign5Y+v5Lul5bCd6K+V5Zyo6L+H5pyf5pe26Ze05ZCO77yM5bCd6K+V6I635Y+W5b2T5YmN5pWw5o2u6aG577yM5p+l55yL6L+U5Zue57uT5p6cJyk7XHJcbiAgICAgICAgICAgIHdhcm4oKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJCgnI2dldFN0b3JhZ2UnKS5vbignY2xpY2snLGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCfojrflj5blrZjlgqjnmoTmlbDmja4nKTtcclxuICAgICAgICAgICAgdmFyIGtleW5hbWUgPSBub2Rlcy5rZXluYW1lLnZhbCgpLnRyaW0oKTtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSBfc3RvcmFnZU1hcFtrZXluYW1lXS5nZXQoKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICAgICAgICAgIGlmKGRhdGEgPT0gbnVsbCl7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ+aVsOaNruW3sui/h+acnycpO1xyXG4gICAgICAgICAgICAgICAgd2FybigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICQoJyNyZW1vdmVTdG9yYWdlJykub24oJ2NsaWNrJyxmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB2YXIga2V5bmFtZSA9IG5vZGVzLmtleW5hbWUudmFsKCkudHJpbSgpO1xyXG4gICAgICAgICAgICBfc3RvcmFnZU1hcFtrZXluYW1lXS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgd2FybigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkKCcjY2xlYXJTdG9yYWdlJykub24oJ2NsaWNrJyxmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBTdG9yYWdlLmNsZWFyKCk7XHJcbiAgICAgICAgICAgIHdhcm4oKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9XHJcbn0pO1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyDpobXpnaLln7rmnKx2aWV357G744CC5pyA57uI5Lia5Yqh6aG555uu5Lit6JC95Zyw6aG155qEanPpg73lv4XpobvlvJXnlKjmraRqc+aIluWFtuWtkOexu1xyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE2LTEyLTIwIOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm5cclxuICogKi9cclxuXHJcbiBjb25zdCBBbGVydCA9IHJlcXVpcmUoJy4uL3VpL3VpLmFsZXJ0LmpzJyksXHJcbiAgICAgICBDb25maXJtID0gcmVxdWlyZSgnLi4vdWkvdWkuY29uZmlybS5qcycpLFxyXG4gICAgICAgVG9hc3QgPSByZXF1aXJlKCcuLi91aS91aS50b2FzdC5qcycpLFxyXG4gICAgICAgTG9hZGluZyA9IHJlcXVpcmUoJy4uL3VpL3VpLmxvYWRpbmcuanMnKSxcclxuICAgICAgIFRvb2wgPSByZXF1aXJlKCdsaWJ1dGlsLXRvb2wnKTtcclxuXHJcbmNsYXNzIEJhc2VWaWV3IHtcclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gJ3ptcmRsYic7XHJcbiAgICAgICAgLy/nu5HlrprkuIDkupvluLjnlKjnmoTnu4Tku7bliLDlhajlsYDlj5jph49cclxuICAgICAgICB3aW5kb3cuX0FQUCA9IHt9O1xyXG4gICAgICAgIF9BUFAuQWxlcnQgPSBBbGVydDtcclxuICAgICAgICBfQVBQLkNvbmZpcm0gPSBDb25maXJtO1xyXG4gICAgICAgIF9BUFAuVG9hc3QgPSBUb2FzdDtcclxuICAgICAgICBfQVBQLkxvYWRpbmcgPSBMb2FkaW5nO1xyXG4gICAgICAgIF9BUFAuVG9vbCA9IFRvb2w7XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdCgpe1xyXG4gICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOazqOWGjOS4gOS4qumhtemdolxyXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSBvcHQg6YeM6Z2i6YWN572u55qE5omA5pyJ5pa55rOV6YO95rS+55Sf57uZQmFzZVZpZXfnmoTlrp7kvotcclxuICAgICAqIHtcclxuICAgICAqICAgICAgX2luaXQ6IOatpOaWueazleW/hemhu+acie+8jOmhtemdouWIneWni+WMluaJp+ihjFxyXG4gICAgICogfVxyXG4gICAgICogQHJldHVybiB7aW5zdGFuY2Ugb2YgQmFzZVZpZXd9ICAgICBbZGVzY3JpcHRpb25dXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyByZWdpc3RlcihvcHQpe1xyXG4gICAgICAgIHZhciB0ID0gbmV3IHRoaXMoKTtcclxuICAgICAgICBmb3IodmFyIGtleSBpbiBvcHQpe1xyXG4gICAgICAgICAgICB0W2tleV0gPSBvcHRba2V5XTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8v5Yid5aeL5YyWXHJcbiAgICAgICAgdC5pbml0KCk7XHJcblxyXG4gICAgICAgIHJldHVybiB0O1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VWaWV3O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFwiPGRpdiBjbGFzcz1cXFwidGl0bGUganMtdGl0bGVcXFwiPuaPkOekujwvZGl2PjxkaXYgY2xhc3M9XFxcImJvZHkganMtY29udGVudFxcXCI+PC9kaXY+PGRpdiBjbGFzcz1mb290ZXI+PGEgaHJlZj1qYXZhc2NyaXB0OjsgY2xhc3M9anMtb2s+56Gu5a6aPC9hPjwvZGl2PlwiO1xuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcg5YWs5YWxYWxlcnTlvLnlsYJcclxuICogQHZlcnNpb24gMS4wIHwgMjAxNi0xMS0xNCDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAcmV0dXJuXHJcbiAqICovXHJcblxyXG4gY29uc3QgQWxlcnRTaW5nbGUgPSByZXF1aXJlKCdsaWJsYXllci1hbGVydFNpbmdsZScpLFxyXG4gICAgICAgIENzc3N1cG9ydCA9IHJlcXVpcmUoJ2xpYnV0aWwtY3Nzc3Vwb3J0JyksXHJcbiAgICAgICAgVHBsID0gcmVxdWlyZSgnLi91aS5hbGVydC5odG1sJyk7XHJcblxyXG5BbGVydFNpbmdsZS5oaWRlZGVzdHJveSA9IGZhbHNlO1xyXG5cclxuQWxlcnRTaW5nbGUuc2V0Y29uZmlnKHtcclxuICAgIGxheWVyOiB7XHJcbiAgICAgICAgY2xhc3NuYW1lOiAnY29yZXVpLWctbGF5ZXIgY29yZXVpLWctd2FybmxheWVyIGNvcmV1aS1nLWxheWVyLWFsZXJ0JyxcclxuICAgICAgICBjdXN0b206IHtcclxuICAgICAgICAgICAgaGlkZTogZnVuY3Rpb24obGF5ZXIpe1xyXG4gICAgICAgICAgICAgICAgbGF5ZXIucmVtb3ZlQ2xhc3MoJ3Nob3ctdXAnKS5hZGRDbGFzcygnaGlkZS11cCcpO1xyXG4gICAgICAgICAgICAgICAgaWYoQ3Nzc3Vwb3J0LnRyYW5zaXRpb24pe1xyXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGF5ZXIuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBBbGVydFNpbmdsZS5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwzMDApO1xyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgbGF5ZXIuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIEFsZXJ0U2luZ2xlLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBtYXNrOiB7XHJcbiAgICAgICAgY3VzdG9tOiB7XHJcbiAgICAgICAgICAgIGhpZGU6IGZ1bmN0aW9uKG1hc2spe1xyXG4gICAgICAgICAgICAgICAgaWYoQ3Nzc3Vwb3J0LnRyYW5zaXRpb24pe1xyXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFzay5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwzMDApO1xyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFzay5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgYWxlcnQ6IHtcclxuICAgICAgICBmcmFtZXRwbDogVHBsXHJcbiAgICB9XHJcbn0pO1xyXG5cclxuQWxlcnRTaW5nbGUuY3JlYXRlY2FsLmFkZChmdW5jdGlvbihsYXllcm9iail7XHJcbiAgICBsYXllcm9iai5sYXllci5hZGRDbGFzcygnaGlkZS11cCcpO1xyXG5cclxuICAgIGxheWVyb2JqLnBvcy5wb3NjYWwuYWRkKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgbGF5ZXJvYmoubGF5ZXIucmVtb3ZlQ2xhc3MoJ2hpZGUtdXAnKS5hZGRDbGFzcygnc2hvdy11cCcpO1xyXG4gICAgfSk7XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBbGVydFNpbmdsZTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBcIjxkaXYgY2xhc3M9XFxcInRpdGxlIGpzLXRpdGxlXFxcIj7mj5DnpLo8L2Rpdj48ZGl2IGNsYXNzPVxcXCJib2R5IGpzLWNvbnRlbnRcXFwiPjwvZGl2PjxkaXYgY2xhc3M9Zm9vdGVyPjxhIGhyZWY9amF2YXNjcmlwdDo7IGNsYXNzPVxcXCJjYW5jZWwganMtY2FuY2VsXFxcIj7lj5bmtog8L2E+IDxhIGhyZWY9amF2YXNjcmlwdDo7IGNsYXNzPWpzLW9rPuehruWumjwvYT4gPGkgY2xhc3M9c3BsaXQ+PC9pPjwvZGl2PlwiO1xuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcg5YWs5YWxY29uZmlybeW8ueWxglxyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE3LTAxLTA2IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm5cclxuICogKi9cclxuXHJcbiBjb25zdCBDb25maXJtU2luZ2xlID0gcmVxdWlyZSgnbGlibGF5ZXItY29uZmlybVNpbmdsZScpLFxyXG4gICAgICAgIENzc3N1cG9ydCA9IHJlcXVpcmUoJ2xpYnV0aWwtY3Nzc3Vwb3J0JyksXHJcbiAgICAgICAgVHBsID0gcmVxdWlyZSgnLi91aS5jb25maXJtLmh0bWwnKTtcclxuXHJcbkNvbmZpcm1TaW5nbGUuaGlkZWRlc3Ryb3kgPSBmYWxzZTtcclxuXHJcbkNvbmZpcm1TaW5nbGUuc2V0Y29uZmlnKHtcclxuICAgIGxheWVyOiB7XHJcbiAgICAgICAgY2xhc3NuYW1lOiAnY29yZXVpLWctbGF5ZXIgY29yZXVpLWctd2FybmxheWVyIGNvcmV1aS1nLWxheWVyLWNvbmZpcm0nLFxyXG4gICAgICAgIGN1c3RvbToge1xyXG4gICAgICAgICAgICBoaWRlOiBmdW5jdGlvbihsYXllcil7XHJcbiAgICAgICAgICAgICAgICBsYXllci5yZW1vdmVDbGFzcygnc2hvdy11cCcpLmFkZENsYXNzKCdoaWRlLXVwJyk7XHJcbiAgICAgICAgICAgICAgICBpZihDc3NzdXBvcnQudHJhbnNpdGlvbil7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXllci5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIENvbmZpcm1TaW5nbGUuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sMzAwKTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIGxheWVyLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICBDb25maXJtU2luZ2xlLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBtYXNrOiB7XHJcbiAgICAgICAgY3VzdG9tOiB7XHJcbiAgICAgICAgICAgIGhpZGU6IGZ1bmN0aW9uKG1hc2spe1xyXG4gICAgICAgICAgICAgICAgaWYoQ3Nzc3Vwb3J0LnRyYW5zaXRpb24pe1xyXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFzay5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwzMDApO1xyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFzay5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgY29uZmlybToge1xyXG4gICAgICAgIGZyYW1ldHBsOiBUcGxcclxuICAgIH1cclxufSk7XHJcblxyXG5Db25maXJtU2luZ2xlLmNyZWF0ZWNhbC5hZGQoZnVuY3Rpb24obGF5ZXJvYmope1xyXG4gICAgbGF5ZXJvYmoubGF5ZXIuYWRkQ2xhc3MoJ2hpZGUtdXAnKTtcclxuXHJcbiAgICBsYXllcm9iai5wb3MucG9zY2FsLmFkZChmdW5jdGlvbigpe1xyXG4gICAgICAgIGxheWVyb2JqLmxheWVyLnJlbW92ZUNsYXNzKCdoaWRlLXVwJykuYWRkQ2xhc3MoJ3Nob3ctdXAnKTtcclxuICAgIH0pO1xyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29uZmlybVNpbmdsZTtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcg5Lia5Yqh5Z+65pys5by55bGC57G777yM5aGr5YWF5LqG5LiA5Lqb5qC35byP44CC5Lia5Yqh5omA5pyJ6Ieq5a6a5LmJ5by55bGC5bCG57un5om/5q2k57G7XHJcbiAqIEB2ZXJzaW9uIDEuMCB8IDIwMTYtMTEtMTQg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQHJldHVyblxyXG4gKiAqL1xyXG5cclxuIGNvbnN0IEJvbWJMYXllciA9IHJlcXVpcmUoJ2xpYmxheWVyLWJvbWJMYXllcicpLFxyXG4gICAgICAgIENzc3N1cG9ydCA9IHJlcXVpcmUoJ2xpYnV0aWwtY3Nzc3Vwb3J0Jyk7XHJcblxyXG5jbGFzcyBVSUxheWVyIGV4dGVuZHMgQm9tYkxheWVyIHtcclxuICAgIC8qKlxyXG5cdCAqIOW8ueWxguexu+KAlOKAlOWIm+W7uuW5tua3u+WKoOWIsOaMh+WumuWuueWZqOS4rVxyXG4gICAgICogQHBhcmFtIHtKU09OfSBjb25maWcg5by55bGC6YWN572u5Y+C5pWwIO+8jOS4jeaYr+W/heWhq+mhuVxyXG4gICAgICogXHRcdHtcclxuICAgICAqIFx0ICAgICAgIGNvbnRhaW5lciB7RWxlbWVudH0g5a2Y5pS+5by55bGC55qE5a655Zmo44CC5Y+v5LiN5oyH5a6a77yM6buY6K6k5by55bGC5a2Y5pS+5LqOYm9keeS4reeahOS4gOS4quWKqOaAgeeUn+aIkOeahGRpdumHjFxyXG4gICAgICogXHQgICAgICAgcG9zOnt9LCAvL+WumuS9jeWPguaVsO+8jOWFt+S9k+ivtOaYjuWPr+ingeaWueazlWxheWVyL3Bvc2l0aW9uQm9tYuS4reeahGNvbmZpZ+ivtOaYjlxyXG4gICAgICogICAgICAgICBsYXllcjoge30sIC8v5by55bGC5L+h5oGv5Y+C5pWw77yM5YW35L2T6K+05piO5Y+v6KeB5pa55rOVbGF5ZXIvbGF5ZXLkuK3nmoRjb25maWfor7TmmI5cclxuICAgICAqIFx0XHQgICBtYXNrOiB7IC8v6YGu572p5L+h5oGv5Y+C5pWw77yM5YW35L2T6K+05piO5Y+v6KeB5pa55rOVbGF5ZXIvbWFza+S4reeahGNvbmZpZ+ivtOaYjuOAguWcqOatpOWfuuehgOS4iui/m+ihjOS7peS4i+aJqeWxlVxyXG4gICAgICogXHRcdFx0ICBtYXNrOiB0cnVlLCAvL+aYr+WQpuWIm+W7uumBrue9qVxyXG4gICAgICogICAgICAgICAgICBjbWxoaWRlOiBmYWxzZSAvL+eCueWHu+mBrue9qeaYr+WQpuWFs+mXreW8ueWxglxyXG4gICAgICogXHRcdCAgIH1cclxuICAgICAqICAgICAgfVxyXG5cdCAqL1xyXG4gICAgY29uc3RydWN0b3IoY29uZmlnKXtcclxuICAgICAgICAvL+a3u+WKoOiHquWumuS5ieWPguaVsFxyXG4gICAgICAgIGNvbmZpZyA9ICQuZXh0ZW5kKHRydWUse1xyXG4gICAgICAgICAgICBsYXllcjoge1xyXG4gICAgICAgICAgICAgICAgY2xhc3NuYW1lOiAnY29yZXVpLWctbGF5ZXInLFxyXG4gICAgICAgICAgICAgICAgc2hvdzogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBjdXN0b206IHtcclxuICAgICAgICAgICAgICAgICAgICBoaWRlOiBmdW5jdGlvbihsYXllcil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxheWVyLnJlbW92ZUNsYXNzKCdzaG93LXVwJykuYWRkQ2xhc3MoJ2hpZGUtdXAnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoQ3Nzc3Vwb3J0LnRyYW5zaXRpb24pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxheWVyLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5oaWRlYWZ0ZXJjYWwuZmlyZSgpOyAvL+WxgumakOiXj+WQjuWbnuiwg1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwzMDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxheWVyLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmhpZGVhZnRlcmNhbC5maXJlKCk7IC8v5bGC6ZqQ6JeP5ZCO5Zue6LCDXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG1hc2s6IHtcclxuICAgICAgICAgICAgICAgIGN1c3RvbToge1xyXG4gICAgICAgICAgICAgICAgICAgIGhpZGU6IGZ1bmN0aW9uKG1hc2spe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihDc3NzdXBvcnQudHJhbnNpdGlvbil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFzay5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LDMwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFzay5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LGNvbmZpZyB8fCB7fSk7XHJcblxyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB2YXIgX2xheWVyID0gdGhpcy5sYXllcjtcclxuXHJcbiAgICAgICAgX2xheWVyLmFkZENsYXNzKCdoaWRlLXVwJyk7XHJcblxyXG4gICAgICAgIHRoaXMucG9zLnBvc2NhbC5hZGQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgX2xheWVyLnJlbW92ZUNsYXNzKCdoaWRlLXVwJykuYWRkQ2xhc3MoJ3Nob3ctdXAnKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBoaWRlKCl7XHJcbiAgICAgICAgaWYodGhpcy5pc3Nob3coKSl7XHJcblx0XHRcdHRoaXMuaGlkZWJlZm9yZWNhbC5maXJlKCk7IC8v5bGC6ZqQ6JeP5YmN5Zue6LCDXHJcblx0XHRcdHRoaXMubWFzayAmJiB0aGlzLm1hc2suaGlkZSgpO1xyXG5cdFx0XHR0aGlzLl9oaWRlKCk7XHJcblx0XHR9XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVUlMYXllcjtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcgbG9hZGluZyDmj5DnpLrlsYJcclxuICogQHZlcnNpb24gMS4wIHwgMjAxNi0wMS0wNiDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAcmV0dXJuXHJcbiAqICovXHJcbiBjb25zdCBVSUxheWVyID0gcmVxdWlyZSgnLi91aS5sYXllci5qcycpLFxyXG4gICAgICAgIFdvcmtlckNvbnRyb2wgPSByZXF1aXJlKCdsaWJ1dGlsLXdvcmtlckNvbnRyb2wnKTtcclxuXHJcbnZhciB3b3JrZXJDb250cm9sID0gbmV3IFdvcmtlckNvbnRyb2woKTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUxvYWRpbmcod29ya2VyKXtcclxuICAgIHdvcmtlci5sb2FkaW5nID0gbmV3IFVJTGF5ZXIoe1xyXG4gICAgICAgIGxheWVyOiB7XHJcbiAgICAgICAgICAgIGNsYXNzbmFtZTogJ2NvcmV1aS1nLWxheWVyIGNvcmV1aS1nLWxheWVyLWxvYWRpbmcnXHJcbiAgICAgICAgfSxcclxuICAgICAgICBtYXNrOiB7XHJcbiAgICAgICAgICAgIGJnY29sb3I6ICcjZmZmJywgLy/og4zmma/oibJcclxuICAgICAgICAgICAgb3BhY2l0eTogMCwgLy/pga7nvanpgI/mmI7luqZcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB3b3JrZXIubG9hZGluZy5oaWRlYWZ0ZXJjYWwuYWRkKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgd29ya2VyLmxvYWRpbmcuZGVzdHJveSgpO1xyXG4gICAgICAgIHdvcmtlci5sb2FkaW5nID0gbnVsbDtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiB3b3JrZXIubG9hZGluZztcclxufVxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgc2hvdzogZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgbG9hZGluZyA9IGNyZWF0ZUxvYWRpbmcod29ya2VyQ29udHJvbC5nZXQoKSk7XHJcbiAgICAgICAgbG9hZGluZy5zaG93KCk7XHJcbiAgICB9LFxyXG4gICAgaGlkZTogZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgd29ya2VyID0gd29ya2VyQ29udHJvbC5lbmQoKTtcclxuICAgICAgICBpZih3b3JrZXIpe1xyXG4gICAgICAgICAgICB3b3JrZXIubG9hZGluZy5oaWRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IHRvYXN0IOaPkOekuuWxglxyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE2LTAxLTA2IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm5cclxuICogKi9cclxuIGNvbnN0IFVJTGF5ZXIgPSByZXF1aXJlKCcuL3VpLmxheWVyLmpzJyksXHJcbiAgICAgICAgV29ya2VyQ29udHJvbCA9IHJlcXVpcmUoJ2xpYnV0aWwtd29ya2VyQ29udHJvbCcpO1xyXG5cclxudmFyIHdvcmtlckNvbnRyb2wgPSBuZXcgV29ya2VyQ29udHJvbCgpO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlVG9hc3Qod29ya2VyKXtcclxuICAgIHdvcmtlci50b2FzdCA9IG5ldyBVSUxheWVyKHtcclxuICAgICAgICBsYXllcjoge1xyXG4gICAgICAgICAgICBjbGFzc25hbWU6ICdjb3JldWktZy1sYXllciBjb3JldWktZy1sYXllci10b2FzdCdcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1hc2s6IHtcclxuICAgICAgICAgICAgYmdjb2xvcjogJyNmZmYnLCAvL+iDjOaZr+iJslxyXG4gICAgICAgICAgICBvcGFjaXR5OiAwLCAvL+mBrue9qemAj+aYjuW6plxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHdvcmtlci50b2FzdC5oaWRlYWZ0ZXJjYWwuYWRkKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgd29ya2VyLnRvYXN0LmRlc3Ryb3koKTtcclxuICAgICAgICB3b3JrZXIudG9hc3QgPSBudWxsO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHdvcmtlci50b2FzdDtcclxufVxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgc2hvdzogZnVuY3Rpb24oY29udGVudCxoaWRlYWZ0ZXJjYWwpe1xyXG4gICAgICAgIHZhciB0b2FzdCA9IGNyZWF0ZVRvYXN0KHdvcmtlckNvbnRyb2wuZ2V0KCkpO1xyXG4gICAgICAgIHRvYXN0LnNldENvbnRlbnQoY29udGVudCk7XHJcbiAgICAgICAgdG9hc3QuaGlkZWFmdGVyY2FsLmFkZChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBpZih0eXBlb2YgaGlkZWFmdGVyY2FsID09ICdmdW5jdGlvbicpe1xyXG4gICAgICAgICAgICAgICAgaGlkZWFmdGVyY2FsKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0b2FzdC5zaG93KCk7XHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB0b2FzdC5oaWRlKCk7XHJcbiAgICAgICAgfSwyMDAwKTtcclxuICAgIH1cclxufVxyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyDkvb/nlKhsb2NhbFN0b3JhZ2Xov5vooYzmlbDmja7lrZjlgqhcclxuICogQHZlcnNpb24gMS4wIHwgMjAxNy0wNC0xMyDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAcmV0dXJuXHJcbiAqICovXHJcblxyXG4vKipcclxuICog5pWw5o2u5a2Y5YKo57G7XHJcbiAqIEBwYXJhbSB7W3R5cGVdfSBvcHQgW2Rlc2NyaXB0aW9uXVxyXG4gKi9cclxuZnVuY3Rpb24gU3RvcmFnZShvcHQpe1xyXG4gICAgb3B0ID0gJC5leHRlbmQoe1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOWtmOWCqOWRqOacn++8jOm7mOiupOS4ujHlpKnjgILlkI7nvIDor7TmmI5cclxuICAgICAgICAgKiBNOiDmnIhcclxuICAgICAgICAgKiBEOiDml6VcclxuICAgICAgICAgKiBIOiDlsI/ml7ZcclxuICAgICAgICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAgICAgICAqIEBleGFtcGxlIDEuNUQgMC41SCAzTSAxNUQwLjJIXHJcbiAgICAgICAgICog54m55Yir6K+05piO77ya5Y+q5pSv5oyBMeS9jeWwj+aVsFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG1heGFnZTogJzFEJyxcclxuICAgICAgICBrZXk6ICcnIC8vKiDplK7lgLxcclxuICAgIH0sb3B0KTtcclxuXHJcbiAgICBpZihvcHQua2V5ID09ICcnIHx8IG9wdC5tYXhhZ2UgPT0gJycpe1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbGliaW8vc3RvcmFnZSDlj4LmlbDkvKDlhaXplJnor68nKTtcclxuICAgIH1lbHNlIGlmKCEvXigoXFxkKykoXFwuKFsxLTldezF9KSk/KFtNREhdKSkrJC8udGVzdChvcHQubWF4YWdlKSl7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdsaWJpby9zdG9yYWdlIG1heGFnZemFjee9ruagvOW8j+S4jeato+ehricpO1xyXG4gICAgfVxyXG5cclxuICAgIG9wdC5rZXkgPSBTdG9yYWdlLmdyb3VwbmFtZSArICdfJyArIG9wdC5rZXk7XHJcblxyXG4gICAgdGhpcy5vcHQgPSBvcHQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDorqHnrpfov4fmnJ/ml7bpl7TngrlcclxuICogQHJldHVybiB7U3RyaW5nfSBEYXRlVGltZei/h+acn+aXtumXtOeCueWtl+espuS4slxyXG4gKi9cclxuU3RvcmFnZS5wcm90b3R5cGUuX2dldE91dERhdGVUaW1lID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBtYXhhZ2UgPSB0aGlzLm9wdC5tYXhhZ2UsXHJcbiAgICAgICAgbm93dGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpLFxyXG4gICAgICAgIGRpZmZob3VyID0gMCxcclxuICAgICAgICByZWcgPSAvKFxcZCspKFxcLihbMS05XXsxfSkpPyhbTURIXSkvZyxcclxuICAgICAgICByZWFyciA9IG51bGw7XHJcblxyXG4gICAgd2hpbGUoKHJlYXJyID0gcmVnLmV4ZWMobWF4YWdlKSkgIT0gbnVsbCl7XHJcbiAgICAgICAgdmFyIG51bSA9IHJlYXJyWzFdLCAvL+aVtOaVsOmDqOWIhlxyXG4gICAgICAgICAgICBzdWZmaXggPSByZWFycls0XTtcclxuICAgICAgICBpZihyZWFyclsyXSl7IC8v6K+05piO5a2Y5Zyo5bCP5pWwXHJcbiAgICAgICAgICAgIG51bSArPSByZWFyclsyXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbnVtID0gTnVtYmVyKG51bSk7XHJcbiAgICAgICAgc3dpdGNoIChzdWZmaXgpIHtcclxuICAgICAgICAgICAgY2FzZSAnTSc6XHJcbiAgICAgICAgICAgICAgICBkaWZmaG91ciArPSBudW0qMzAqMjQ7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnRCc6XHJcbiAgICAgICAgICAgICAgICBkaWZmaG91ciArPSBudW0qMjQ7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnSCc6XHJcbiAgICAgICAgICAgICAgICBkaWZmaG91ciArPSBudW07XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBub3d0aW1lICs9IGRpZmZob3VyKjYwKjYwKjEwMDA7XHJcblxyXG4gICAgcmV0dXJuIG5vd3RpbWU7XHJcbn07XHJcblxyXG4vKipcclxuICog5pWw5o2u6K6+572uXHJcbiAqIEBwYXJhbSB7SlNPTn0gZGF0YSDlvoXlrZjlgqjnmoTmlbDmja5cclxuICog5a6e6ZmF5a2Y5YKo55qE5pWw5o2u5qC85byP5aaC5LiL77yaXHJcbiAqXHJcbiAqICB7XHJcbiAqICAgICAgZW5kVGltZToge1N0cmluZ31cclxuICogICAgICBkYXRhOiBkYXRhXHJcbiAqICB9XHJcbiAqL1xyXG5TdG9yYWdlLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihkYXRhKXtcclxuICAgIGlmKCFkYXRhIHx8IE9iamVjdC5rZXlzKGRhdGEpLmxlbmd0aCA9PSAwKXtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5vcHQua2V5LCBKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgICAgZW5kVGltZTogdGhpcy5fZ2V0T3V0RGF0ZVRpbWUoKSxcclxuICAgICAgICBkYXRhOiBkYXRhXHJcbiAgICB9KSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDojrflj5bmlbDmja5cclxuICogQHJldHVybiB7SlNPTnxOdWxsfSDov5Tlm55zZXTml7blgJnnmoRkYXRh44CC5aaC5p6c6L+H5pyf5YiZ6L+U5ZuebnVsbFxyXG4gKi9cclxuU3RvcmFnZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oKXtcclxuICAgIC8v5Yik5pat5piv5ZCm6L+H5pyfXHJcbiAgICB2YXIgdmFsdWUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLm9wdC5rZXkpO1xyXG4gICAgaWYodmFsdWUgPT0gbnVsbCl7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9ZWxzZXtcclxuICAgICAgICB2YWx1ZSA9IEpTT04ucGFyc2UodmFsdWUpO1xyXG4gICAgICAgIGlmKE51bWJlcih2YWx1ZS5lbmRUaW1lKSA8PSBuZXcgRGF0ZSgpLmdldFRpbWUoKSl7IC8v6L+H5pyfXHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUuZGF0YTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDliKDpmaTmraTpobnmlbDmja5cclxuICogQHJldHVybiB7W3R5cGVdfSBbZGVzY3JpcHRpb25dXHJcbiAqL1xyXG5TdG9yYWdlLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbigpe1xyXG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0odGhpcy5vcHQua2V5KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOaVsOaNruWCqOWtmOaJgOWxnue7hOWQjeensFxyXG4gKiBAdHlwZSB7U3RyaW5nfVxyXG4gKi9cclxuU3RvcmFnZS5ncm91cG5hbWUgPSAnWk1SRExCJztcclxuXHJcbi8qKlxyXG4gKiDliKDpmaTlhajpg6jlnKjnu4RTdG9yYWdlLmdyb3VwbmFtZeS4i+eahOe8k+WtmOaVsOaNrlxyXG4gKiBAcmV0dXJuIHtbdHlwZV19IFtkZXNjcmlwdGlvbl1cclxuICovXHJcblN0b3JhZ2UuY2xlYXIgPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIHJlZyA9IG5ldyBSZWdFeHAoJ14nK1N0b3JhZ2UuZ3JvdXBuYW1lKTtcclxuICAgIHdoaWxlKGxvY2FsU3RvcmFnZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgdmFyIGtleSA9IGxvY2FsU3RvcmFnZS5rZXkoMCk7XHJcbiAgICAgICAgaWYocmVnLnRlc3Qoa2V5KSl7XHJcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGtleSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICog5Yib5bu65LiA5LiqU3RvcmFnZeWvueixoVxyXG4gKiBAcGFyYW0gIHtKU09OfSBvcHQg6K+m6KeBU3RvcmFnZeWumuS5ieWkhFxyXG4gKiBAcmV0dXJuIHtTdG9yYWdlfSAgICAgW2Rlc2NyaXB0aW9uXVxyXG4gKi9cclxuU3RvcmFnZS5jcmVhdGUgPSBmdW5jdGlvbihvcHQpe1xyXG4gICAgcmV0dXJuIG5ldyBTdG9yYWdlKG9wdCk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU3RvcmFnZTtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcgYWxlcnTnsbvvvIznu6fmib/oh6psYXllci9ib21iTGF5ZXLjgILmt7vliqDigJznoa7lrprmjInpkq7igJ3kuovku7blm57osINcclxuICog5aaC5p6c5by55bGC5Lit5pyJ5Lul5LiL5bGe5oCn55qE6IqC54K5XHJcbiAqIG5vZGU9XCJjbG9zZVwi77yM54K55Ye75YiZ5Lya5YWz6Zet5by55bGCLOW5tuinpuWPkWhpZGVjYWzpgJrnn6XjgIJcclxuICogbm9kZT1cIm9rXCLvvIzngrnlh7vliJnop6blj5HigJznoa7lrprmjInpkq7igJ3kuovku7bjgIHlhbPpl63lvLnlsYLvvIzlubbop6blj5Fva2NhbOWSjGhpZGVjYWzpgJrnn6XjgIJcclxuICogQHZlcnNpb24gMS4wLjAgfCAyMDE1LTA5LTE0IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEBleGFtcGxlXHJcbiAqIFx0IGNvbnN0IEFsZXJ0ID0gcmVxdWlyZSgnbGlibGF5ZXItYWxlcnQnKTtcclxuICpcclxuICogXHQgdmFyIGxheWVyID0gbmV3IEFsZXJ0KHtcclxuICogXHQgXHRhbGVydDoge1xyXG4gKiBcdFx0XHRmcmFtZXRwbDogWyAvL+W8ueWxguWfuuacrOaooeadv1xyXG5cdFx0XHRcdCc8ZGl2IGNsYXNzPVwianMtdGl0bGVcIj48L2Rpdj4nLFxyXG5cdFx0XHRcdCc8ZGl2IGNsYXNzPVwianMtY29udGVudFwiPjwvZGl2PicsXHJcblx0XHRcdFx0JzxkaXY+PGEgaHJlZj1cImphdmFzY3JpcHQ6O1wiIGNsYXNzPVwianMtb2tcIj7lpb3nmoQ8L2E+PC9kaXY+J1xyXG5cdFx0XHRdLmpvaW4oJycpXHJcbiAqICAgICAgfVxyXG4gKiAgIH0pO1xyXG4gKiAgIGxheWVyLnNob3djYWwuYWRkKGZ1bmN0aW9uKHR5cGUpe3N3aXRjaCh0eXBlKXtjYXNlICdiZWZvcmUnOmNvbnNvbGUubG9nKCflsYLmmL7npLrliY0nKTticmVhazsgY2FzZSAnYWZ0ZXInOmNvbnNvbGUubG9nKCflsYLmmL7npLrlkI4nKTticmVhazt9fSk7XHJcbiAqICAgbGF5ZXIuaGlkZWNhbC5hZGQoZnVuY3Rpb24odHlwZSl7c3dpdGNoKHR5cGUpe2Nhc2UgJ2JlZm9yZSc6Y29uc29sZS5sb2coJ+WxgumakOiXj+WJjScpO2JyZWFrOyBjYXNlICdhZnRlcic6Y29uc29sZS5sb2coJ+WxgumakOiXj+WQjicpO2JyZWFrO319KTtcclxuICogICBsYXllci5va2NhbC5hZGQoZnVuY3Rpb24oZSl7Y29uc29sZS5sb2coJ+eCueWHu+S6huehruWumicpfSk7XHJcbiAqICAgbGF5ZXIuc2V0TXlDb250ZW50KCforr7nva5ub2RlPVwiY29udGVudFwi6IqC54K555qEaW5uZXJIVE1MJyk7XHJcbiAqICAgdmFyIG5vZGVBcnIgPSBsYXllci5nZXROb2RlcyhbJ3RpdGxlJ10pOyAvLyDojrflj5ZjbGFzcz1cImpzLXRpdGxlXCLnmoToioLngrlcclxuICogICBub2RlQXJyLnRpdGxlLmh0bWwoJ+WGheWuueWMumh0bWwnKTtcclxuICogICBsYXllci5jb250ZW50bm9kZTsgLy/lhoXlrrnljLpub2RlPVwiY29udGVudFwi6IqC54K5XHJcbiAqICAgbGF5ZXIuc2hvdygpOyAvL+aYvuekuuWxglxyXG4gKiAgIGxheWVyLmhpZGUoKTsgLy/pmpDol4/lsYJcclxuICogICBsYXllci5sYXllcjsgLy/lsYJkb23oioLngrnlr7nosaFcclxuICogICBsYXllci5jb250YWluZXI7IC8v5rWu5bGC5a655ZmoXHJcbiAqICAgbGF5ZXIuZGVzdHJveSgpOyAvL+mUgOavgeWxglxyXG4gKiAqL1xyXG5jb25zdCBCb21iTGF5ZXIgPSByZXF1aXJlKCcuL2JvbWJMYXllci5qcycpLFxyXG5cdCAgIFRwbCA9IHJlcXVpcmUoJy4vdHBsLmpzJyk7XHJcblxyXG5jbGFzcyBBbGVydCBleHRlbmRzIEJvbWJMYXllciB7XHJcblx0LyoqXHJcblx0ICogYWxlcnTnsbtcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcg5Y+C5pWw5ZCMbGF5ZXIvYm9tYkxheWVy6YeM6Z2i55qEY29uZmlnLOWcqOatpOWfuuehgOS4iuWinuWKoOWmguS4i+m7mOiupOmFjee9rlxyXG4gICAgICoge1xyXG4gICAgICogXHQgICphbGVydDoge1xyXG4gICAgICogXHRcdCAqZnJhbWV0cGwge1N0cmluZ30gYWxlcnTln7rmnKzmqKHmnb/jgILopoHmsYLor7for6bop4FsYXllci90cGzph4zpnaJhbGVydOmhueeahOimgeaxglxyXG4gICAgICogICAgfVxyXG4gICAgICogfVxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKGNvbmZpZykge1xyXG5cdFx0dmFyIG9wdCA9ICQuZXh0ZW5kKHRydWUse1xyXG5cdFx0XHRhbGVydDoge1xyXG5cdFx0XHRcdGZyYW1ldHBsOiBUcGwuYWxlcnQgLy9hbGVydOW8ueWxguWfuuacrOaooeadv+OAguimgeaxguivt+ivpuingWxheWVyL3RwbOmHjOmdomFsZXJ06aG555qE6KaB5rGCXHJcblx0XHRcdH1cclxuXHRcdH0sY29uZmlnKTtcclxuXHRcdHN1cGVyKG9wdCk7XHJcblxyXG5cdFx0dGhpcy5zZXRDb250ZW50KG9wdC5hbGVydC5mcmFtZXRwbCk7XHJcblx0XHR0aGlzLmNvbnRlbnRub2RlID0gdGhpcy5sYXllci5maW5kKCcuanMtY29udGVudCcpOyAvL+WGheWuueWMuuiKgueCuVxyXG5cdFx0dGhpcy5va2NhbCA9ICQuQ2FsbGJhY2tzKCk7XHJcblx0XHQvL+S6i+S7tue7keWumlxyXG5cdCAgICB0aGlzLmxheWVyLm9uKCdjbGljay5saWInLCAnLmpzLW9rJywgKGUpID0+IHtcclxuXHQgICAgXHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0ICAgIFx0dGhpcy5va2NhbC5maXJlKGUpO1xyXG5cdFx0XHR0aGlzLmhpZGUoKTtcclxuXHQgICAgfSk7XHJcblx0fVxyXG5cdC8qKlxyXG4gICAgICog6K6+572uYWxlcnTlhoXlrrnljLrlhbfmnIlbbm9kZT1cImNvbnRlbnRcIl3lsZ7mgKfnmoToioLngrnnmoRodG1sXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gaHRtbFxyXG4gICAgICovXHJcblx0c2V0TXlDb250ZW50KGh0bWwpIHtcclxuXHRcdGlmKHR5cGVvZiBodG1sID09ICdzdHJpbmcnICYmIHRoaXMuY29udGVudG5vZGUubGVuZ3RoID4gMCl7XHJcbiAgICAgICAgICAgIHRoaXMuY29udGVudG5vZGUuaHRtbChodG1sKTtcclxuICAgICAgICB9XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIOe7hOS7tumUgOavgVxyXG5cdCAqL1xyXG5cdGRlc3Ryb3koKSB7XHJcblx0XHR0aGlzLmxheWVyLm9mZignY2xpY2subGliJywgJy5qcy1vaycpO1xyXG5cdFx0c3VwZXIuZGVzdHJveSgpO1xyXG5cdFx0dGhpcy5jb250ZW50bm9kZSA9IG51bGw7XHJcblx0XHR0aGlzLm9rY2FsID0gbnVsbDtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQWxlcnQ7XHJcbiIsIu+7vy8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IGFsZXJ055qE5bel5Y6C5o6n5Yi25Zmo77yM57un5om/YmFzZUNvbnRyb2xcclxuICog5bqU55So5Zy65pmv77ya6ZKI5a+5566A5Y2VYWxlcnTlvLnlsYLvvIzpopHnuYHmm7TmlLnlvLnlsYLph4zmn5DkupvoioLngrnnmoTlhoXlrrnvvIzku6Xlj4rmm7TmlLnngrnlh7tcIuehruWumlwi5oyJ6ZKu5ZCO55qE5Zue6LCD5LqL5Lu2XHJcbiAqIOWmguaenOaYr+abtOWkjeadgueahOS6pOS6kuW7uuiuruS9v+eUqGxheWVycy5hbGVydOaIlmxheWVycy5ib21iTGF5ZXJcclxuICogQHZlcnNpb24gMS4wLjAgfCAyMDE2LTAxLTI2IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEBleGFtcGxlXHJcbiAqIGNvbnN0IEFsZXJ0Q29udHJvbCA9IHJlcXVpcmUoJ2xpYmxheWVyLWFsZXJ0Q29udHJvbCcpO1xyXG4gKlxyXG5cdFx0dmFyIGN1cmxheWVyID0gbmV3IEFsZXJ0Q29udHJvbCgpO1xyXG5cdFx0Y3VybGF5ZXIuc2V0Y29uZmlnKHtcclxuXHRcdFx0YWxlcnQ6IHtcclxuXHRcdFx0XHRmcmFtZXRwbDogW1xyXG5cdFx0XHRcdCAgICAnPGRpdiBjbGFzcz1cImpzLXRpdGxlXCI+PC9kaXY+JyxcclxuXHRcdFx0XHRcdCc8ZGl2IGNsYXNzPVwianMtY29udGVudFwiPjwvZGl2PicsXHJcblx0XHRcdFx0XHQnPGRpdj48YSBocmVmPVwiamF2YXNjcmlwdDo7XCIgY2xhc3M9XCJqcy1va1wiPuWlveeahDwvYT48L2Rpdj4nXHJcblx0XHRcdFx0XS5qb2luKCcnKVxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdGN1cmxheWVyLnNob3coe1xyXG4gICAgICAgICAgICBjb250ZW50OiAn5oKo6L+Y5pyq55m76ZmGJ1xyXG4gICAgICAgIH0se1xyXG4gICAgICAgICAgICBvazogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfngrnlh7vlpb3nmoQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGN1cmxheWVyLmdldGxheWVyb2JqKCnvvJsgLy9sYXllci9hbGVydOexu+WvueixoVxyXG4gKiAqL1xyXG4gY29uc3QgQWxlcnQgPSByZXF1aXJlKCcuL2FsZXJ0LmpzJyksXHJcbiAgICAgICBCYXNlQ29udHJvbCA9IHJlcXVpcmUoJy4vYmFzZUNvbnRyb2wuanMnKTtcclxuXHJcbi8qKlxyXG4qIGFsZXJ05bel5Y6C5o6n5Yi25ZmoXHJcbiovXHJcbmNsYXNzIEFsZXJ0Q29udHJvbCBleHRlbmRzIEJhc2VDb250cm9sIHtcclxuICAgIGNvbnN0cnVjdG9yKGhpZGVkZXN0cm95KSB7XHJcbiAgICAgICAgc3VwZXIoaGlkZWRlc3Ryb3kpO1xyXG4gICAgICAgIHRoaXMuX29rY2FsID0gZnVuY3Rpb24oKXt9OyAvL+eCueWHu29r55qE5Zue6LCD56eB5pyJ5a2Y5YKo5ZmoXHJcblx0XHR0aGlzLl9mdW5hcnIgPSBbJ29rJ107IC8v5Y+v5o6n5Yi255qE5Zue6LCD5pa55rOV5ZCNXHJcbiAgICB9XHJcbiAgICAvKipcclxuXHQgKiDojrflj5ZhbGVydOW8ueWxglxyXG5cdCAqIEBwYXJhbSB7Qm9vbGVhbn0gcmVzZXQg5piv5ZCm6YeN5paw5riy5p+T5qih5p2/44CC6buY6K6k5Li6ZmFsc2VcclxuXHQgKi9cclxuICAgIGdldGxheWVyb2JqKHJlc2V0KXtcclxuXHRcdGlmKHRoaXMuX2xheWVyb2JqID09IG51bGwpe1xyXG5cdFx0XHR0aGlzLl9sYXllcm9iaiA9IG5ldyBBbGVydCh0aGlzLl9kZWZhdWx0b3B0KTtcclxuXHRcdFx0dGhpcy5fbGF5ZXJvYmoub2tjYWwuYWRkKChlKSA9PiB7XHJcblx0XHRcdFx0dGhpcy5fb2tjYWwoKTtcclxuXHRcdFx0fSk7XHJcbiAgICAgICAgICAgIHRoaXMuX2FkZGNhbGwoKTtcclxuXHRcdH1lbHNle1xyXG4gICAgICAgICAgICBpZihyZXNldCl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9sYXllcm9iai5zZXRDb250ZW50KHRoaXMuX2RlZmF1bHRvcHQuYWxlcnQuZnJhbWV0cGwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cdFx0cmV0dXJuIHRoaXMuX2xheWVyb2JqO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcblx0ICog6ZSA5q+BYWxlcnTlvLnlsYJcclxuXHQgKi9cclxuICAgIGRlc3Ryb3koKXtcclxuICAgICAgICBzdXBlci5kZXN0cm95KCk7XHJcbiAgICAgICAgdGhpcy5fb2tjYWwgPSBmdW5jdGlvbigpe307XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQWxlcnRDb250cm9sO1xyXG4iLCLvu78vKipcclxuICogQGZpbGVvdmVydmlldyBhbGVydOexu+WNleS9k+aOp+WItuWZqO+8jOS4gOiIrOeUqOS6jueugOWNleeahGNvbmZpcm3kv6Hmga/mj5DnpLrjgIJcclxuICog5rOo5oSP77ya6K+lYWxlcnTmjqfliLbnmoTlr7nosaHlj4pkb23lnKjlhajlsYDkuK3llK/kuIDlrZjlnKjvvIzlpoLmnpzmg7PopoHliJvlu7rlpJrkuKrvvIzor7fkvb/nlKhsaWJsYXllcnMvYWxlcnTmiJZsaWJsYXllcnMvYWxlcnRDb250cm9sXHJcbiAqIEB2ZXJzaW9uIDEuMC4wIHwgMjAxNS0wOS0xNCDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAZXhhbXBsZVxyXG4gKiAgICAgIGNvbnN0IEFsZXJ0U2luZ2xlID0gcmVxdWlyZSgnbGlibGF5ZXItYWxlcnRTaW5nbGUnKTtcclxuICpcclxuXHRcdEFsZXJ0U2luZ2xlLnNldGNvbmZpZyh7XHJcblx0XHRcdGFsZXJ0OiB7XHJcblx0XHRcdFx0ZnJhbWV0cGw6IFtcclxuXHRcdFx0XHQgICAgJzxkaXYgY2xhc3M9XCJqcy10aXRsZVwiPjwvZGl2PicsXHJcblx0XHRcdFx0XHQnPGRpdiBjbGFzcz1cImpzLWNvbnRlbnRcIj48L2Rpdj4nLFxyXG5cdFx0XHRcdFx0JzxkaXY+PGEgaHJlZj1cImphdmFzY3JpcHQ6O1wiIGNsYXNzPVwianMtb2tcIj7lpb3nmoQ8L2E+PC9kaXY+J1xyXG5cdFx0XHRcdF0uam9pbignJylcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHRBbGVydFNpbmdsZS5nZXRsYXllcm9iaigp77ybIC8vbGF5ZXIvYWxlcnTnsbvlr7nosaFcclxuXHRcdEFsZXJ0U2luZ2xlLnNob3coe1xyXG4gICAgICAgICAgICBjb250ZW50OiAn5oKo6L+Y5pyq55m76ZmGJ1xyXG4gICAgICAgIH0se1xyXG4gICAgICAgICAgICBvazogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfngrnlh7vlpb3nmoQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gKiAqL1xyXG5cclxuY29uc3QgQWxlcnRDb250cm9sID0gcmVxdWlyZSgnLi9hbGVydENvbnRyb2wuanMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbmV3IEFsZXJ0Q29udHJvbCgpO1xyXG4iLCLvu78vKipcclxuICogQGZpbGVvdmVydmlldyDln7rmnKznmoTlvLnlsYLlt6XljoLmjqfliLblmajvvIzkuI3lj6/nm7TmjqXkvb/nlKjvvIzlj6rlj6/lrZDnsbvnu6fmib/lkI7kvb/nlKjjgIJcclxuICog5bqU55So5Zy65pmv77ya6ZKI5a+56aKR57mB5pu05pS55by55bGC6YeM5p+Q5Lqb6IqC54K555qE5YaF5a6577yM5Lul5Y+K5pu05pS554K55Ye75oyJ6ZKu5ZCO55qE5Zue6LCD5LqL5Lu244CCXHJcbiAqIEB2ZXJzaW9uIDEuMC4wIHwgMjAxNi0wMS0yNiDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAZXhhbXBsZVxyXG4gKiAgICAgIGNvbnN0IEJhc2VDb250cm9sID0gcmVxdWlyZSgnbGlibGF5ZXItYmFzZUNvbnRyb2wnKTtcclxuICpcclxuICogKi9cclxuXHJcbiBjb25zdCBUb29sID0gcmVxdWlyZSgnbGlidXRpbC10b29sJyk7XHJcblxyXG4gY2xhc3MgQmFzZUNvbnRyb2wge1xyXG4gICAgIC8qKlxyXG4gICAgICAqIOW3peWOguaooeWei+aOp+WItuWZqFxyXG4gICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gaGlkZWRlc3Ryb3kg5by55bGC5YWz6Zet5pe277yM5piv5ZCm6LWw57O757uf6buY6K6k55qE6ZSA5q+B5pON5L2c44CC6buY6K6k5Li6dHJ1ZVxyXG4gICAgICAqL1xyXG4gICAgIGNvbnN0cnVjdG9yKGhpZGVkZXN0cm95KXtcclxuICAgICAgICAgdGhpcy5fbGF5ZXJvYmogPSBudWxsOyAvL+W8ueWxguWvueixoVxyXG4gXHRcdCB0aGlzLl9kZWZhdWx0b3B0ID0ge307IC8v6buY6K6kY29uZmln6YWN572u5Y+C5pWwXHJcbiBcdFx0IHRoaXMuX2Z1bmFyciA9IFtdOyAvL+S8muabv+aNoueahOWbnuiwg+aWueazleeahOWFs+mUruivjeOAguWmglsnb2snLCdjYW5jZWwnXVxyXG4gICAgICAgICB0aGlzLmNyZWF0ZWNhbCA9ICQuQ2FsbGJhY2tzKCk7IC8v5by55bGC5a+56LGh5Yib5bu65ZCO55qE5Zue6LCDXHJcbiAgICAgICAgIGlmKHR5cGVvZiBoaWRlZGVzdHJveSAhPSAnYm9vbGVhbicpe1xyXG4gICAgICAgICAgICAgaGlkZWRlc3Ryb3kgPSB0cnVlO1xyXG4gICAgICAgICB9XHJcbiAgICAgICAgIHRoaXMuaGlkZWRlc3Ryb3kgPSBoaWRlZGVzdHJveTtcclxuICAgICB9XHJcbiAgICAgLyoqXHJcbiBcdCAqICDlj4LmlbDor7TmmI7or7flj4Lop4HlrZDnsbvkvb/nlKjnmoTlvLnlsYLnsbvph4zpnaLnmoRjb25maWfor7TmmI5cclxuIFx0ICogIOWmgmFsZXJ0Lmpz44CCY29uZmlybS5qc1xyXG4gXHQgKi9cclxuICAgICBzZXRjb25maWcoY29uZmlnKXtcclxuICAgICAgICAgdGhpcy5fZGVmYXVsdG9wdCA9IGNvbmZpZztcclxuICAgICB9XHJcbiAgICAgLyoqXHJcbiBcdCAqIOiOt+WPluW8ueWxguWvueixoe+8jOWFt+S9k+eUseWtkOexu+WunueOsFxyXG4gXHQgKi9cclxuICAgICBnZXRsYXllcm9iaigpe1xyXG5cclxuICAgICB9XHJcbiAgICAgLyoqXHJcbiBcdCAqIOa3u+WKoOezu+e7n+Wbnuiwg++8jOeUseWtkOexu+WIm+W7uuS6huW8ueWxguWvueixoeWQjuiwg+eUqFxyXG4gXHQgKi9cclxuICAgICBfYWRkY2FsbCgpe1xyXG4gICAgICAgICBpZih0aGlzLmhpZGVkZXN0cm95KXtcclxuICAgICAgICAgICAgIHRoaXMuX2xheWVyb2JqLmhpZGVhZnRlcmNhbC5hZGQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgIHRoaXMuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgIH1cclxuICAgICAgICAgdGhpcy5jcmVhdGVjYWwuZmlyZSh0aGlzLl9sYXllcm9iaik7XHJcbiAgICAgfVxyXG4gICAgIC8qKlxyXG4gXHQgKiDmmL7npLrlvLnlsYJcclxuIFx0ICogQHBhcmFtIHtPYmplY3R9ICp0eHQg5paH5qGI6YWN572uLOmAieWhq+OAguWmguaenHNldGNvbmZpZ+iwg+eUqOiuvue9rueahOaooeadv+S4rei/mOacieWFtuS7lm5vZGU9XCLlhbbku5blgLxcIu+8jFxyXG4gXHQgKiAgICAgIOWmgm5vZGU9XCJvdGhlclwiIOWImeWPr+iHquihjOaJqeWxlVxyXG4gXHQgKiB7XHJcbiBcdCAqIFx0IGNvbnRlbnQge1N0cmluZ30gbm9kZT1cImNvbnRlbnRcIuiKgueCuemHjOmdoueahGh0bWxcclxuIFx0ICogICB0aXRsZSB7U3RyaW5nfSBub2RlPVwidGl0bGVcIuiKgueCuemHjOmdoueahGh0bWxcclxuIFx0ICogICBvayB7U3RyaW5nfSBub2RlPVwib2tcIuiKgueCuemHjOmdoueahGh0bWxcclxuIFx0ICogfVxyXG4gXHQgKiBAcGFyYW0ge09iamVjdH0gY2FsIOWbnuiwg+mFjee9rlxyXG4gXHQgKiB7XHJcbiBcdCAqIFx0IOmUruWAvOS4ul9mdW5hcnLkuK3ot53nprvnmoTlhbPplK7or40ge0Z1bmN0aW9ufSDngrnlh7vnoa7lrprmjInpkq7lkI7nmoTlm57osINcclxuIFx0ICogfVxyXG4gXHQgKi9cclxuIFx0IHNob3codHh0LGNhbCl7XHJcbiAgICAgICAgIGlmKCFUb29sLmlzT2JqZWN0KHR4dCkpe1xyXG4gXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdiYXNlQ29udHJvbC1zaG935pa55rOVdHh05Y+C5pWw5b+F6aG75pivanNvbuWvueixoScpO1xyXG4gXHRcdH1lbHNle1xyXG4gXHRcdFx0aWYoVG9vbC5pc09iamVjdChjYWwpKXtcclxuIFx0XHRcdFx0dmFyIGZ1bm5hbWUgPSB0aGlzLl9mdW5hcnI7XHJcbiBcdFx0XHRcdGZvcih2YXIgY3VybmFtZSBvZiBmdW5uYW1lKXtcclxuIFx0XHRcdFx0XHRpZihUb29sLmlzRnVuY3Rpb24oY2FsW2N1cm5hbWVdKSl7XHJcbiBcdFx0XHRcdFx0XHR0aGlzWydfJytjdXJuYW1lKydjYWwnXSA9IGNhbFtjdXJuYW1lXTtcclxuIFx0XHRcdFx0XHR9XHJcbiBcdFx0XHRcdFx0ZWxzZXtcclxuIFx0XHRcdFx0XHRcdHRoaXNbJ18nK2N1cm5hbWUrJ2NhbCddID0gZnVuY3Rpb24oKXt9O1xyXG4gXHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0fWVsc2V7XHJcbiBcdFx0XHRcdHRoaXMuX29rY2FsID0gZnVuY3Rpb24oKXt9O1xyXG4gXHRcdFx0fVxyXG4gXHRcdFx0Ly/ojrflj5Z0eHTph4zpnaLnmoTplK7lgLxcclxuIFx0XHRcdHZhciBub2RlbmFtZWFyciA9IFtdO1xyXG4gXHRcdFx0Zm9yKHZhciBuYW1lIGluIHR4dCl7XHJcbiBcdFx0XHRcdG5vZGVuYW1lYXJyLnB1c2gobmFtZSk7XHJcbiBcdFx0XHR9XHJcbiBcdFx0XHR0aGlzLmdldGxheWVyb2JqKHRydWUpO1xyXG4gXHRcdFx0dmFyIG5vZGVhcnIgPSB0aGlzLl9sYXllcm9iai5nZXROb2Rlcyhub2RlbmFtZWFycik7XHJcbiBcdFx0XHRmb3IodmFyIG5hbWUgaW4gbm9kZWFycil7XHJcbiBcdFx0XHRcdFRvb2wuaXNTdHJpbmcodHh0W25hbWVdKSAmJiBub2RlYXJyW25hbWVdLmh0bWwodHh0W25hbWVdKTtcclxuIFx0XHRcdH1cclxuIFx0XHRcdHRoaXMuX2xheWVyb2JqLnNob3coKTtcclxuIFx0XHR9XHJcbiAgICAgfVxyXG4gICAgIC8qKlxyXG4gICAgICAqIOmUgOavgeW8ueWxglxyXG4gICAgICAqL1xyXG4gICAgIGRlc3Ryb3koKXtcclxuICAgICAgICAgaWYodGhpcy5fbGF5ZXJvYmogIT0gbnVsbCl7XHJcbiBcdFx0XHR0aGlzLl9sYXllcm9iai5kZXN0cm95KCk7XHJcbiBcdFx0XHR0aGlzLl9sYXllcm9iaiA9IG51bGw7XHJcbiBcdFx0fVxyXG4gICAgIH1cclxuIH1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQmFzZUNvbnRyb2w7XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IOW8ueWxguexu++8jOe7p+aJv+iHqmxheWVyL2xheWVy44CC6buY6K6k5bGF5Lit5a6a5L2N77yM5pi+56S66YGu572p44CC77yI5aaC5p6c6ZyA5YW25LuW54m55q6K6YWN572u5YiZ5Y+C6KeB5Y+C5pWw6K+05piO77yJXHJcbiAqIOWmguaenOW8ueWxguS4reacieS7peS4i+WxnuaAp+eahOiKgueCuW5vZGU9XCJjbG9zZVwi44CC5YiZ54K55Ye76K+l6IqC54K55Lya5YWz6Zet5by55bGC77yM5bm26Kem5Y+RaGlkZWNhbOmAmuefpeOAglxyXG4gKiBAdmVyc2lvbiAxLjAuMCB8IDIwMTUtMDktMTQg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQGV4YW1wbGVcclxuICogXHQgY29uc3QgQm9tYkxheWVyID0gcmVxdWlyZSgnbGlibGF5ZXItYm9tYkxheWVyJyk7XHJcbiAqXHJcbiAqICAgdmFyIGxheWVyID0gbmV3IEJvbWJMYXllcigpO1xyXG4gKiAgICBsYXllci5zaG93YmVmb3JlY2FsLmFkZChmdW5jdGlvbigpe2NvbnNvbGUubG9nKCflsYLmmL7npLrliY0nKTt9KTtcclxuICogICBsYXllci5oaWRlYmVmb3JlY2FsLmFkZChmdW5jdGlvbigpe2NvbnNvbGUubG9nKCflsYLpmpDol4/liY0nKTt9KTtcclxuICogICBsYXllci5zaG93YWZ0ZXJjYWwuYWRkKGZ1bmN0aW9uKCl7Y29uc29sZS5sb2coJ+WxguaYvuekuuWQjicpO30pO1xyXG4gKiAgIGxheWVyLmhpZGVhZnRlcmNhbC5hZGQoZnVuY3Rpb24oKXtjb25zb2xlLmxvZygn5bGC6ZqQ6JeP5ZCOJyk7fSk7XHJcbiAqICAgbGF5ZXIucG9zLnBvc2NhbC5hZGQoZnVuY3Rpb24oKXtjb25zb2xlLmxvZygnbGF5ZXLlrprkvY3lkI7lm57osIMnKX0pO1xyXG4gKiAgIGxheWVyLnNldENvbnRlbnQoJzxkaXYgY2xhc3M9XCJqcy1jb250ZW50XCI+PC9kaXY+Jyk7IC8v6K6+572ubGF5ZXLlsYLph4zpnaLnmoTlhoXlrrlcclxuICogICBsYXllci5nZXROb2RlcyhbJ2NvbnRlbnQnXSk7IC8vIOiOt+WPlmNsYXNzPVwianMtY29udGVudFwi55qE6IqC54K5XHJcbiAqICAgbGF5ZXIuc2hvdygpOyAvL+aYvuekuuWxglxyXG4gKiAgIGxheWVyLmhpZGUoKTsgLy/pmpDol4/lsYJcclxuICogICBsYXllci5sYXllcjsgLy/lsYJkb23oioLngrnlr7nosaFcclxuICogICBsYXllci5jb250YWluZXI7IC8v5rWu5bGC5a655ZmoXHJcbiAqICAgbGF5ZXIuZGVzdHJveSgpOyAvL+mUgOavgeWxglxyXG4gKlxyXG4gKiAqL1xyXG5cclxuIGNvbnN0IExheWVyID0gcmVxdWlyZSgnLi9sYXllci5qcycpLFxyXG4gXHQgICBNYXNrID0gcmVxdWlyZSgnLi9tYXNrLmpzJyksXHJcblx0ICAgUG9zaXRpb25Cb21iID0gcmVxdWlyZSgnLi9wb3NpdGlvbkJvbWIuanMnKSxcclxuXHQgICBUb29sID0gcmVxdWlyZSgnbGlidXRpbC10b29sJyk7XHJcblxyXG5jbGFzcyBCb21iTGF5ZXIgZXh0ZW5kcyBMYXllciB7XHJcblx0LyoqXHJcblx0ICog5by55bGC57G74oCU4oCU5Yib5bu65bm25re75Yqg5Yiw5oyH5a6a5a655Zmo5LitXHJcbiAgICAgKiBAcGFyYW0ge0pTT059IGNvbmZpZyDlvLnlsYLphY3nva7lj4LmlbAg77yM5LiN5piv5b+F5aGr6aG5XHJcbiAgICAgKiBcdFx0e1xyXG4gICAgICogXHQgICAgICAgY29udGFpbmVyIHtFbGVtZW50fSDlrZjmlL7lvLnlsYLnmoTlrrnlmajjgILlj6/kuI3mjIflrprvvIzpu5jorqTlvLnlsYLlrZjmlL7kuo5ib2R55Lit55qE5LiA5Liq5Yqo5oCB55Sf5oiQ55qEZGl26YeMXHJcbiAgICAgKiBcdCAgICAgICBwb3M6e30sIC8v5a6a5L2N5Y+C5pWw77yM5YW35L2T6K+05piO5Y+v6KeB5pa55rOVbGF5ZXIvcG9zaXRpb25Cb21i5Lit55qEY29uZmln6K+05piOXHJcbiAgICAgKiAgICAgICAgIGxheWVyOiB7fSwgLy/lvLnlsYLkv6Hmga/lj4LmlbDvvIzlhbfkvZPor7TmmI7lj6/op4Hmlrnms5VsYXllci9sYXllcuS4reeahGNvbmZpZ+ivtOaYjlxyXG4gICAgICogXHRcdCAgIG1hc2s6IHsgLy/pga7nvankv6Hmga/lj4LmlbDvvIzlhbfkvZPor7TmmI7lj6/op4Hmlrnms5VsYXllci9tYXNr5Lit55qEY29uZmln6K+05piO44CC5Zyo5q2k5Z+656GA5LiK6L+b6KGM5Lul5LiL5omp5bGVXHJcbiAgICAgKiBcdFx0XHQgIG1hc2s6IHRydWUsIC8v5piv5ZCm5Yib5bu66YGu572pXHJcbiAgICAgKiAgICAgICAgICAgIGNtbGhpZGU6IGZhbHNlIC8v54K55Ye76YGu572p5piv5ZCm5YWz6Zet5by55bGCXHJcbiAgICAgKiAgICAgICAgICAgIC8v5YW25LuW5p+l55yLbWFzay5qc+S4reeahOmFjee9rlxyXG4gICAgICogXHRcdCAgIH1cclxuICAgICAqICAgICAgfVxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKGNvbmZpZykge1xyXG4gICAgICAgIHZhciBfbmV3Y29udGFpbmVyID0gZmFsc2U7XHJcblx0XHRpZighY29uZmlnLmNvbnRhaW5lciB8fCBjb25maWcuY29udGFpbmVyLmxlbmd0aCA9PSAwKXtcclxuXHRcdFx0Y29uZmlnLmNvbnRhaW5lciA9ICQoJzxkaXY+PC9kaXY+JykuYXBwZW5kVG8oJ2JvZHknKTtcclxuXHRcdFx0X25ld2NvbnRhaW5lciA9IHRydWU7IC8v6K+05piO5piv5paw5Yib5bu655qE5a655ZmoXHJcblx0XHR9XHJcblx0XHRjb25maWcgPSBjb25maWcgfHwge307XHJcblx0XHQvL+WIneWni+WMluWfuuexu1xyXG5cdFx0c3VwZXIoY29uZmlnLmNvbnRhaW5lcixjb25maWcubGF5ZXIpO1xyXG4gICAgICAgIHRoaXMuX25ld2NvbnRhaW5lciA9IF9uZXdjb250YWluZXI7XHJcblx0XHQvL+WIm+W7uuWumuS9jeexu+WvueixoVxyXG5cdFx0dGhpcy5wb3MgPSBuZXcgUG9zaXRpb25Cb21iKHtcclxuXHRcdFx0bGF5ZXI6IHRoaXMubGF5ZXJcclxuXHRcdH0sY29uZmlnLnBvcyk7XHJcblx0XHQvL+WIm+W7uumBrue9qVxyXG5cdFx0dmFyIG1hc2tvcHQgPSAkLmV4dGVuZCh0cnVlLHtcclxuXHRcdFx0bWFzazogdHJ1ZSxcclxuXHRcdFx0Y21saGlkZTogZmFsc2VcclxuXHRcdH0sY29uZmlnLm1hc2spO1xyXG5cdFx0aWYobWFza29wdC5tYXNrKXsgLy/lpoLmnpzliJvlu7rpga7nvalcclxuXHRcdFx0dGhpcy5tYXNrID0gbmV3IE1hc2soY29uZmlnLmNvbnRhaW5lcixtYXNrb3B0KTtcclxuXHRcdFx0aWYobWFza29wdC5jbWxoaWRlKXsgLy/ngrnlh7vpga7nvanlhbPpl61cclxuXHRcdFx0XHR0aGlzLm1hc2suY2xpY2tjYWwuYWRkKChlKSA9PiB7XHJcblx0XHRcdFx0XHR0aGlzLmhpZGUoKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Ly/kuovku7bnu5HlrppcclxuXHRcdHRoaXMubGF5ZXIub24oJ2NsaWNrLmxpYicsICcuanMtY2xvc2UnLCAoZSkgPT4ge1xyXG5cdCAgICBcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHQgICAgXHR0aGlzLmhpZGUoKTtcclxuXHQgICAgfSk7XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIOiOt+WPlmFsZXJ05Lit5YW35pyJbm9kZT0n5oyH5a6a5ZCN56ewJ+eahOiKgueCueWIl+ihqOOAguWmguaenG5vZGVuYW1lYXJy5Lit5oyH5a6a55qE6IqC54K55LiN5a2Y5Zyo77yM5YiZ5LiN5Zyo57uT5p6c5Lit6L+U5Zue44CC5Li+5L6LXHJcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBub2RlbmFtZWFyciDlpoJbJ2NvbnRlbnQnLCdvayddXHJcbiAgICAgKiBAcmV0dXJuIHtcclxuICAgICAqIFx0ICAgY29udGVudDog6I635Y+W55qE6IqC54K5XHJcbiAgICAgKiAgICAgb2s6IOiOt+WPlueahOiKgueCuVxyXG4gICAgICogfVxyXG4gICAgICog5aaC5p6cY29udGVudOS4jeWtmOWcqO+8jOWImeWPqui/lOWbnntva31cclxuXHQgKi9cclxuXHRnZXROb2Rlcyhub2RlbmFtZWFycil7XHJcblx0XHR2YXIgcmVzdWx0ID0ge30sIHRoYXQgPSB0aGlzO1xyXG5cdFx0aWYoVG9vbC5pc0FycmF5KG5vZGVuYW1lYXJyKSl7XHJcblx0XHRcdCQuZWFjaChub2RlbmFtZWFyciwoaW5kZXgsbmFtZSkgPT4ge1xyXG5cdFx0XHRcdHZhciBub2RlID0gdGhpcy5sYXllci5maW5kKCcuanMtJytuYW1lKTtcclxuXHRcdFx0XHRpZihub2RlLmxlbmd0aCA+IDApe1xyXG5cdFx0XHRcdFx0cmVzdWx0W25hbWVdID0gbm9kZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9XHJcblx0LyoqXHJcblx0ICog5pi+56S65by55bGCXHJcblx0ICovXHJcblx0c2hvdygpe1xyXG5cdFx0aWYoIXRoaXMuaXNzaG93KCkpe1xyXG5cdFx0XHR0aGlzLnNob3diZWZvcmVjYWwuZmlyZSgpOyAvL+WxguaYvuekuuWJjeWbnuiwg1xyXG5cdFx0XHR0aGlzLm1hc2sgJiYgdGhpcy5tYXNrLnNob3coKTtcclxuXHRcdFx0dGhpcy5fc2hvdygpO1xyXG5cdFx0XHR0aGlzLnBvcy5zZXRwb3MoKTtcclxuXHRcdFx0dGhpcy5zaG93YWZ0ZXJjYWwuZmlyZSgpOyAvL+WxguaYvuekuuWQjuWbnuiwg1xyXG5cdFx0fVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiDpmpDol4/lvLnlsYJcclxuXHQgKi9cclxuXHRoaWRlKCl7XHJcblx0XHRpZih0aGlzLmlzc2hvdygpKXtcclxuXHRcdFx0dGhpcy5oaWRlYmVmb3JlY2FsLmZpcmUoKTsgLy/lsYLpmpDol4/liY3lm57osINcclxuXHRcdFx0dGhpcy5tYXNrICYmIHRoaXMubWFzay5oaWRlKCk7XHJcblx0XHRcdHRoaXMuX2hpZGUoKTtcclxuXHRcdFx0dGhpcy5oaWRlYWZ0ZXJjYWwuZmlyZSgpOyAvL+WxgumakOiXj+WQjuWbnuiwg1xyXG5cdFx0fVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiDlvLnlsYLplIDmr4FcclxuXHQgKi9cclxuXHRkZXN0cm95KCl7XHJcblx0XHR0aGlzLmxheWVyLm9mZignY2xpY2subGliJywgJy5qcy1jbG9zZScpO1xyXG5cdFx0dGhpcy5wb3MuZGVzdHJveSgpO1xyXG5cdFx0aWYodGhpcy5tYXNrKXtcclxuICAgICAgICAgICAgdGhpcy5tYXNrLmRlc3Ryb3koKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGNvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyO1xyXG4gICAgICAgIHN1cGVyLmRlc3Ryb3koKTtcclxuICAgICAgICBpZih0aGlzLl9uZXdjb250YWluZXIpe1xyXG5cdFx0XHR0aGlzLmNvbnRhaW5lci5yZW1vdmUoKTtcclxuXHRcdH1cclxuXHRcdHRoaXMuX25ld2NvbnRhaW5lciA9IG51bGw7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJvbWJMYXllcjtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcgY29uZmlybeexu++8jOe7p+aJv+iHqmxheWVyL2JvbWJMYXllcuOAgua3u+WKoOKAnOehruWumuaMiemSruKAneWSjOKAnOWPlua2iOaMiemSruKAneS6i+S7tuWbnuiwg1xyXG4gKiDlpoLmnpzlvLnlsYLkuK3mnInku6XkuIvlsZ7mgKfnmoToioLngrlcclxuICogbm9kZT1cImNsb3NlXCLvvIzngrnlh7vliJnkvJrlhbPpl63lvLnlsYIs5bm26Kem5Y+RaGlkZWNhbOmAmuefpeOAglxyXG4gKiBub2RlPVwib2tcIu+8jOeCueWHu+WImeinpuWPkeKAnOehruWumuaMiemSruKAneS6i+S7tu+8jOWFs+mXreW8ueWxgu+8jOW5tuinpuWPkW9rY2Fs5ZKMaGlkZWNhbOmAmuefpeOAglxyXG4gKiBub2RlPVwiY2FuY2VsXCIg54K55Ye76Kem5Y+R4oCc5Y+W5raI5oyJ6ZKu4oCd5LqL5Lu277yM5YWz6Zet5by55bGC77yM5bm26Kem5Y+RY2FuY2VsY2Fs5ZKMaGlkZWNhbOmAmuefpeOAglxyXG4gKiBAdmVyc2lvbiAxLjAuMCB8IDIwMTUtMDktMTYg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQGV4YW1wbGVcclxuICogXHQgY29uc3QgQ29uZmlybSA9IHJlcXVpcmUoJ2xpYmxheWVyLWNvbmZpcm0nKTtcclxuICpcclxuICogXHQgdmFyIGxheWVyID0gbmV3IENvbmZpcm0oe1xyXG4gKiBcdCBcdGNvbmZpcm06IHtcclxuICogXHRcdFx0ZnJhbWV0cGw6IFsgLy/lvLnlsYLln7rmnKzmqKHmnb9cclxuXHRcdFx0XHQnPGRpdiBjbGFzcz1cImpzLXRpdGxlXCI+PC9kaXY+JyxcclxuXHRcdFx0XHQnPGRpdiBjbGFzcz1cImpzLWNvbnRlbnRcIj48L2Rpdj4nLFxyXG5cdFx0XHRcdCc8ZGl2PjxhIGhyZWY9XCJqYXZhc2NyaXB0OjtcIiBjbGFzcz1cImpzLW9rXCI+5aW955qEPC9hPjxhIGhyZWY9XCJqYXZhc2NyaXB0OjtcIiBjbGFzcz1cImpzLWNhbmNlbFwiPuetieS4i+ivtDwvYT48L2Rpdj4nXHJcblx0XHRcdF0uam9pbignJylcclxuICogICAgICB9XHJcbiAqICAgfSk7XHJcbiAqICAgbGF5ZXIuc2hvd2NhbC5hZGQoZnVuY3Rpb24odHlwZSl7c3dpdGNoKHR5cGUpe2Nhc2UgJ2JlZm9yZSc6Y29uc29sZS5sb2coJ+WxguaYvuekuuWJjScpO2JyZWFrOyBjYXNlICdhZnRlcic6Y29uc29sZS5sb2coJ+WxguaYvuekuuWQjicpO2JyZWFrO319KTtcclxuICogICBsYXllci5oaWRlY2FsLmFkZChmdW5jdGlvbih0eXBlKXtzd2l0Y2godHlwZSl7Y2FzZSAnYmVmb3JlJzpjb25zb2xlLmxvZygn5bGC6ZqQ6JeP5YmNJyk7YnJlYWs7IGNhc2UgJ2FmdGVyJzpjb25zb2xlLmxvZygn5bGC6ZqQ6JeP5ZCOJyk7YnJlYWs7fX0pO1xyXG4gKiAgIGxheWVyLm9rY2FsLmFkZChmdW5jdGlvbihlKXtjb25zb2xlLmxvZygn54K55Ye75LqG56Gu5a6aJyl9KTtcclxuICogICBsYXllci5jYW5jZWxjYWwuYWRkKGZ1bmN0aW9uKGUpe2NvbnNvbGUubG9nKCfngrnlh7vkuoblj5bmtognKX0pO1xyXG4gKiAgIGxheWVyLnNldE15Q29udGVudCgn6K6+572ubm9kZT1cImNvbnRlbnRcIuiKgueCueeahGlubmVySFRNTCcpO1xyXG4gKiAgIHZhciBub2RlQXJyID0gbGF5ZXIuZ2V0Tm9kZXMoWyd0aXRsZSddKTsgLy8g6I635Y+WY2xhc3M9XCJqcy10aXRsZVwi55qE6IqC54K5XHJcbiAqICAgbm9kZUFyci50aXRsZS5odG1sKCflhoXlrrnljLpodG1sJyk7XHJcbiAqICAgbGF5ZXIuY29udGVudG5vZGU7IC8v5YaF5a655Yy6bm9kZT1cImNvbnRlbnRcIuiKgueCuVxyXG4gKiAgIGxheWVyLnNob3coKTsgLy/mmL7npLrlsYJcclxuICogICBsYXllci5oaWRlKCk7IC8v6ZqQ6JeP5bGCXHJcbiAqICAgbGF5ZXIubGF5ZXI7IC8v5bGCZG9t6IqC54K55a+56LGhXHJcbiAqICAgbGF5ZXIuY29udGFpbmVyOyAvL+a1ruWxguWuueWZqFxyXG4gKiAgIGxheWVyLmRlc3Ryb3koKTsgLy/plIDmr4HlsYJcclxuICogKi9cclxuY29uc3QgQm9tYkxheWVyID0gcmVxdWlyZSgnLi9ib21iTGF5ZXIuanMnKSxcclxuXHRcdFRwbCA9IHJlcXVpcmUoJy4vdHBsLmpzJyk7XHJcblxyXG5jbGFzcyBDb25maXJtIGV4dGVuZHMgQm9tYkxheWVyIHtcclxuXHQvKipcclxuXHQgKiBjb25maXJt57G7XHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIOWPguaVsOWQjGxheWVyL2JvbWJMYXllcumHjOmdoueahGNvbmZpZyzlnKjmraTln7rnoYDkuIrlop7liqDlpoLkuIvpu5jorqTphY3nva5cclxuICAgICAqIHtcclxuICAgICAqIFx0ICAqY29uZmlybToge1xyXG4gICAgICogXHRcdCAqZnJhbWV0cGwge1N0cmluZ30gY29uZmlybeWfuuacrOaooeadv+OAguimgeaxguivt+ivpuingWxheWVyL3RwbOmHjOmdomNvbmZpcm3pobnnmoTopoHmsYJcclxuICAgICAqICAgIH1cclxuICAgICAqIH1cclxuXHQgKi9cclxuXHRjb25zdHJ1Y3Rvcihjb25maWcpIHtcclxuXHRcdHZhciBvcHQgPSAkLmV4dGVuZCh0cnVlLHtcclxuXHRcdFx0Y29uZmlybToge1xyXG5cdFx0XHRcdGZyYW1ldHBsOiBUcGwuY29uZmlybSAvL2NvbmZpcm3lvLnlsYLln7rmnKzmqKHmnb/jgILopoHmsYLor7for6bop4FsYXllci90cGzph4zpnaJjb25maXJt6aG555qE6KaB5rGCXHJcblx0XHRcdH1cclxuXHRcdH0sY29uZmlnKTtcclxuXHRcdHN1cGVyKG9wdCk7XHJcblx0XHR0aGlzLnNldENvbnRlbnQob3B0LmNvbmZpcm0uZnJhbWV0cGwpO1xyXG5cdFx0dGhpcy5jb250ZW50bm9kZSA9IHRoaXMubGF5ZXIuZmluZCgnLmpzLWNvbnRlbnQnKTsgLy/lhoXlrrnljLroioLngrlcclxuXHRcdHRoaXMub2tjYWwgPSAkLkNhbGxiYWNrcygpO1xyXG5cdFx0dGhpcy5jYW5jZWxjYWwgPSAkLkNhbGxiYWNrcygpO1xyXG5cdFx0Ly/kuovku7bnu5HlrppcclxuXHQgICAgdGhpcy5sYXllci5vbignY2xpY2subGliJywgJy5qcy1vaycsIChlKSA9PiB7XHJcblx0ICAgIFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHR0aGlzLm9rY2FsLmZpcmUoZSk7XHJcblx0ICAgIFx0dGhpcy5oaWRlKCk7XHJcblx0ICAgIH0pO1xyXG5cdCAgICB0aGlzLmxheWVyLm9uKCdjbGljay5saWInLCAnLmpzLWNhbmNlbCcsIChlKSA9PiB7XHJcblx0ICAgIFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHR0aGlzLmNhbmNlbGNhbC5maXJlKGUpO1xyXG5cdCAgICBcdHRoaXMuaGlkZSgpO1xyXG5cdCAgICB9KTtcclxuXHR9XHJcblx0LyoqXHJcblx0ICog6K6+572uY29uZmlybeWGheWuueWMuuWFt+aciVtub2RlPVwiY29udGVudFwiXeWxnuaAp+eahOiKgueCueeahGh0bWxcclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBodG1sXHJcblx0ICovXHJcblx0c2V0TXlDb250ZW50KGh0bWwpe1xyXG5cdFx0aWYodHlwZW9mIGh0bWwgPT0gJ3N0cmluZycgJiYgdGhpcy5jb250ZW50bm9kZS5sZW5ndGggPiAwKXtcclxuXHRcdFx0dGhpcy5jb250ZW50bm9kZS5odG1sKGh0bWwpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiDnu4Tku7bplIDmr4FcclxuXHQgKi9cclxuXHRkZXN0cm95KCl7XHJcblx0XHR0aGlzLmxheWVyLm9mZignY2xpY2subGliJywgJy5qcy1vaycpO1xyXG5cdFx0dGhpcy5sYXllci5vZmYoJ2NsaWNrLmxpYicsICcuanMtY2FuY2VsJyk7XHJcblx0XHRzdXBlci5kZXN0cm95KCk7XHJcblx0XHR0aGlzLmNvbnRlbnRub2RlID0gbnVsbDtcclxuXHRcdHRoaXMub2tjYWwgPSBudWxsO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb25maXJtO1xyXG4iLCLvu78vKipcclxuICogQGZpbGVvdmVydmlldyBjb25maXJt55qE5bel5Y6C5o6n5Yi25Zmo77yM6ZuG5oiQYmFzZUNvbnRyb2xcclxuICog5bqU55So5Zy65pmv77ya6ZKI5a+5566A5Y2VY29uZmlybeW8ueWxgu+8jOmSiOWvuemikee5geabtOaUueW8ueWxgumHjOafkOS6m+iKgueCueeahOWGheWuue+8jOS7peWPiuabtOaUueeCueWHu1wi56Gu5a6aXCLjgIFcIuWPlua2iFwi5oyJ6ZKu5ZCO55qE5Zue6LCD5LqL5Lu2XHJcbiAqIOWmguaenOaYr+abtOWkjeadgueahOS6pOS6kuW7uuiuruS9v+eUqGxheWVycy5jb25maXJt5oiWbGF5ZXJzLmJvbWJMYXllclxyXG4gKiBAdmVyc2lvbiAxLjAuMCB8IDIwMTYtMDEtMjYg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQGV4YW1wbGVcclxuICogXHRcdGNvbnN0IENvbmZpcm1Db250cm9sID0gcmVxdWlyZSgnbGlibGF5ZXItY29uZmlybUNvbnRyb2wnKTtcclxuICpcclxuXHRcdHZhciBjdXJjb25maXJtID0gbmV3IENvbmZpcm1Db250cm9sKCk7XHJcblx0XHRjdXJjb25maXJtLnNldGNvbmZpZyh7XHJcblx0XHRcdGNvbmZpcm06IHtcclxuXHRcdFx0XHRmcmFtZXRwbDogW1xyXG5cdFx0XHRcdFx0JzxkaXYgY2xhc3M9XCJqcy1jb250ZW50XCI+PC9kaXY+JyxcclxuXHRcdFx0XHRcdCc8ZGl2PjxhIGhyZWY9XCJqYXZhc2NyaXB0OjtcIiBjbGFzcz1cImpzLW9rXCI+5aW955qEPC9hPjxhIGhyZWY9XCJqYXZhc2NyaXB0OjtcIiBjbGFzcz1cImpzLWNhbmNlbFwiPuetieS4i+ivtDwvYT48L2Rpdj4nXHJcblx0XHRcdFx0XS5qb2luKCcnKVxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdGN1cmNvbmZpcm0uc2hvdyh7XHJcblx0XHQgICAgY29udGVudDogJ+aCqOi/mOacqueZu+mZhidcclxuXHRcdH0se1xyXG5cdFx0ICAgIG9rOiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+eCueWHu+WlveeahCcpO1xyXG4gICAgICAgICAgICB9LFxyXG5cdFx0XHRjYW5jZWw6IGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0Y29uc29sZS5sb2coJ+eCueWHu+etieS4i+ivtCcpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdGN1cmNvbmZpcm0uZ2V0bGF5ZXJvYmooKe+8myAvL2xheWVyL2NvbmZpcm3nsbvlr7nosaFcclxuICogKi9cclxuXHJcbiBjb25zdCBDb25maXJtID0gcmVxdWlyZSgnLi9jb25maXJtLmpzJyksXHJcbiBcdFx0QmFzZUNvbnRyb2wgPSByZXF1aXJlKCcuL2Jhc2VDb250cm9sLmpzJyk7XHJcblxyXG5jbGFzcyBDb25maXJtQ29udHJvbCBleHRlbmRzIEJhc2VDb250cm9sIHtcclxuXHQvKipcclxuICAgICAqIGNvbmZpcm3lt6XljoLmjqfliLblmahcclxuICAgICAqL1xyXG5cdGNvbnN0cnVjdG9yKGhpZGVkZXN0cm95KSB7XHJcblx0XHRzdXBlcihoaWRlZGVzdHJveSk7XHJcblx0XHR0aGlzLl9va2NhbCA9IGZ1bmN0aW9uKCl7fTsgLy/ngrnlh7tva+eahOWbnuiwg+engeacieWtmOWCqOWZqFxyXG5cdFx0dGhpcy5fY2FuY2VsY2FsID0gZnVuY3Rpb24oKXt9OyAvL+eCueWHu2NhbmNlbOeahOWbnuiwg+engeacieWtmOWCqOWZqFxyXG5cdFx0dGhpcy5fZnVuYXJyID0gWydvaycsJ2NhbmNlbCddOyAvL+WPr+aOp+WItueahOWbnuiwg+aWueazleWQjVxyXG5cdH1cclxuXHQvKipcclxuXHQgKiDojrflj5Zjb25maXJt5by55bGCXHJcblx0ICogQHBhcmFtIHtCb29sZWFufSByZXNldCDmmK/lkKbph43mlrDmuLLmn5PmqKHmnb/jgILpu5jorqTkuLpmYWxzZVxyXG5cdCAqL1xyXG5cdGdldGxheWVyb2JqKHJlc2V0KXtcclxuXHRcdGlmKHRoaXMuX2xheWVyb2JqID09IG51bGwpe1xyXG5cdFx0XHR0aGlzLl9sYXllcm9iaiA9IG5ldyBDb25maXJtKHRoaXMuX2RlZmF1bHRvcHQpO1xyXG5cdFx0XHR0aGlzLl9sYXllcm9iai5va2NhbC5hZGQoKGUpID0+IHtcclxuXHRcdFx0XHR0aGlzLl9va2NhbCgpO1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0dGhpcy5fbGF5ZXJvYmouY2FuY2VsY2FsLmFkZCgoZSkgPT4ge1xyXG5cdFx0XHRcdHRoaXMuX2NhbmNlbGNhbCgpO1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0dGhpcy5fYWRkY2FsbCgpO1xyXG5cdFx0fWVsc2V7XHJcbiAgICAgICAgICAgIGlmKHJlc2V0KXtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2xheWVyb2JqLnNldENvbnRlbnQodGhpcy5fZGVmYXVsdG9wdC5jb25maXJtLmZyYW1ldHBsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHRcdHJldHVybiB0aGlzLl9sYXllcm9iajtcclxuXHR9XHJcblx0LyoqXHJcblx0ICog6ZSA5q+BYWxlcnTlvLnlsYJcclxuXHQgKi9cclxuXHRkZXN0cm95KCl7XHJcblx0XHRzdXBlci5kZXN0cm95KCk7XHJcblx0XHR0aGlzLl9va2NhbCA9IGZ1bmN0aW9uKCl7fTtcclxuXHRcdHRoaXMuX2NhbmNlbGNhbCA9IGZ1bmN0aW9uKCl7fTtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29uZmlybUNvbnRyb2w7XHJcbiIsIu+7vy8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IGNvbmZyaW3nsbvljZXkvZPmjqfliLblmajvvIzkuIDoiKznlKjkuo7nroDljZXnmoRjb25maXJt5L+h5oGv5o+Q56S644CCXHJcbiAqIOazqOaEj++8muivpWNvbmZyaW3mjqfliLbnmoTlr7nosaHlj4pkb23lnKjlhajlsYDkuK3llK/kuIDlrZjlnKjvvIzlpoLmnpzmg7PopoHliJvlu7rlpJrkuKrvvIzor7fkvb/nlKhsaWJsYXllcnMvY29uZmlybeaIlmxpYmxheWVycy9jb25maXJtQ29udHJvbFxyXG4gKiBAdmVyc2lvbiAxLjAuMCB8IDIwMTUtMDktMTYg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQGV4YW1wbGVcclxuICogICAgICBjb25zdCBDb25maXJtU2luZ2xlID0gcmVxdWlyZSgnbGlibGF5ZXItY29uZmlybVNpbmdsZScpO1xyXG4gKlxyXG5cdFx0Q29uZmlybVNpbmdsZS5zZXRjb25maWcoe1xyXG5cdFx0XHRjb25maXJtOiB7XHJcblx0XHRcdFx0ZnJhbWV0cGw6IFtcclxuXHRcdFx0XHRcdCc8ZGl2IGNsYXNzPVwianMtY29udGVudFwiPjwvZGl2PicsXHJcblx0XHRcdFx0XHQnPGRpdj48YSBocmVmPVwiamF2YXNjcmlwdDo7XCIgY2xhc3M9XCJqcy1va1wiPuWlveeahDwvYT48YSBocmVmPVwiamF2YXNjcmlwdDo7XCIgY2xhc3M9XCJqcy1jYW5jZWxcIj7nrYnkuIvor7Q8L2E+PC9kaXY+J1xyXG5cdFx0XHRcdF0uam9pbignJylcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHRDb25maXJtU2luZ2xlLnNob3coe1xyXG5cdFx0ICAgIGNvbnRlbnQ6ICfmgqjov5jmnKrnmbvpmYYnXHJcblx0XHR9LHtcclxuXHRcdCAgICBvazogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfngrnlh7vlpb3nmoQnKTtcclxuICAgICAgICAgICAgfSxcclxuXHRcdFx0Y2FuY2VsOiBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdGNvbnNvbGUubG9nKCfngrnlh7vnrYnkuIvor7QnKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcbiAgICAgICAgQ29uZmlybVNpbmdsZS5nZXRsYXllcm9iaigp77ybIC8vbGF5ZXIvY29uZmlybeexu+WvueixoVxyXG4gKiAqL1xyXG4gY29uc3QgQ29uZnJpbUNvbnRyb2wgPSByZXF1aXJlKCcuL2NvbmZpcm1Db250cm9sLmpzJyk7XHJcblxyXG4gbW9kdWxlLmV4cG9ydHMgPSBuZXcgQ29uZnJpbUNvbnRyb2woKTtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcg5rWu5bGC5Z+657G7XHJcbiAqIEB2ZXJzaW9uIDEuMC4wIHwgMjAxNS0wOC0xOSDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAcmV0dXJuIOa1ruWxguWfuuexu1xyXG4gKiBAZXhhbXBsZVxyXG4gKlxyXG4gKiBcdGNvbnN0IExheWVyID0gcmVxdWlyZSgnbGlibGF5ZXItbGF5ZXInKTtcclxuICpcclxuICogXHQgdmFyIGxheWVyID0gbmV3IExheWVyKCQoJ2JvZHknKSk7XHJcbiAqICAgbGF5ZXIuc2hvd2JlZm9yZWNhbC5hZGQoZnVuY3Rpb24oKXtjb25zb2xlLmxvZygn5bGC5pi+56S65YmNJyk7fSk7XHJcbiAqICAgbGF5ZXIuaGlkZWJlZm9yZWNhbC5hZGQoZnVuY3Rpb24oKXtjb25zb2xlLmxvZygn5bGC6ZqQ6JeP5YmNJyk7fSk7XHJcbiAqICAgbGF5ZXIuc2hvd2FmdGVyY2FsLmFkZChmdW5jdGlvbigpe2NvbnNvbGUubG9nKCflsYLmmL7npLrlkI4nKTt9KTtcclxuICogICBsYXllci5oaWRlYWZ0ZXJjYWwuYWRkKGZ1bmN0aW9uKCl7Y29uc29sZS5sb2coJ+WxgumakOiXj+WQjicpO30pO1xyXG4gKiAgIGxheWVyLmhpZGUoKTsgLy/pmpDol4/lsYJcclxuICogICBsYXllci5sYXllcjsgLy/lsYJkb23oioLngrnlr7nosaFcclxuICogICBsYXllci5jb250YWluZXI7IC8v5rWu5bGC5a655ZmoXHJcbiAqICAgbGF5ZXIuZGVzdHJveSgpOyAvL+mUgOavgeWxglxyXG4gKiAqL1xyXG5cclxuIGNsYXNzIExheWVyIHtcclxuXHQgLyoqXHJcbiBcdCAqIOa1ruWxguWfuuexu+KAlOKAlOWIm+W7uuW5tua3u+WKoOWIsOaMh+WumuWuueWZqOS4rVxyXG4gICAgICAqIEBwYXJhbSB7RWxlbWVudH0gY29udGFpbmVyIOa1ruWxguWtmOaUvuWuueWZqO+8jOm7mOiupOS4uiQoJ2JvZHknKVxyXG4gICAgICAqIEBwYXJhbSB7SlNPTn0gY29uZmlnIOWxgumFjee9ruWPguaVsO+8jOm7mOiupOS/oeaBr+WPiuivtOaYjuWmguS4i29wdOS7o+eggeWkhFxyXG4gXHQgKi9cclxuXHQgY29uc3RydWN0b3IoY29udGFpbmVyLGNvbmZpZyl7XHJcblx0XHRjb250YWluZXIgPSBjb250YWluZXIgfHwgJCgnYm9keScpO1xyXG4gXHRcdHZhciBvcHQgPSAkLmV4dGVuZCh0cnVlLHtcclxuIFx0XHRcdGNsYXNzbmFtZTogJycsIC8vbGF5ZXLnmoRjbGFzc1xyXG4gXHRcdFx0ekluZGV4OiAyLCAvL2xheWVy55qEei1pbmRleFxyXG4gXHRcdFx0cG9zaXRpb246ICdhYnNvbHV0ZScsIC8vbGF5ZXLnmoRwb3NpdGlvbuOAgum7mOiupOaYr2Fic29sdXRlXHJcbiBcdFx0XHRzaG93OiBmYWxzZSwgLy/liJvlu7rlsYLlkI7pu5jorqTmmK/lkKbmmL7npLpcclxuIFx0XHRcdGN1c3RvbToge1xyXG4gXHRcdFx0XHRzaG93OiBudWxsLCAvL+eUqOaIt+iHquWumuS5ieaYvuekuuWxgueahOaWueazleOAguWmguaenOatpOaWueazleWtmOWcqO+8jOWImeS4jeeUqOm7mOiupOeahOaYvuekuuWxguaWueazlVxyXG4gXHRcdFx0XHRoaWRlOiBudWxsIC8v55So5oi36Ieq5a6a5LmJ6ZqQ6JeP5bGC55qE5pa55rOV44CC5aaC5p6c5q2k5pa55rOV5a2Y5Zyo77yM5YiZ5LiN55So6buY6K6k55qE6ZqQ6JeP5bGC5pa55rOVXHJcbiBcdFx0XHR9XHJcbiBcdFx0fSxjb25maWcgfHwge30pO1xyXG4gXHRcdHZhciBjc3NzdHIgPSAncG9zaXRpb246JytvcHQucG9zaXRpb24rJzsnKyhvcHQuc2hvdz8nJzonZGlzcGxheTpub25lOycpKyd6LWluZGV4Oicrb3B0LnpJbmRleCsnOyc7XHJcbiBcdFx0dGhpcy5jb250YWluZXIgPSBjb250YWluZXI7IC8v5rWu5bGC5a655ZmoXHJcbiBcdFx0dGhpcy5sYXllciA9ICQoJzxkaXYnKyhvcHQuY2xhc3NuYW1lID09ICcnPycnOicgY2xhc3M9XCInK29wdC5jbGFzc25hbWUrJ1wiJykrJyBzdHlsZT1cIicrY3Nzc3RyKydcIj48L2Rpdj4nKTtcclxuIFx0XHR0aGlzLmxheWVyLmFwcGVuZFRvKGNvbnRhaW5lcik7XHJcbiBcdFx0dGhpcy5zaG93YmVmb3JlY2FsID0gJC5DYWxsYmFja3MoKTsgLy/lsYLmmL7npLrliY3nmoTlm57osINcclxuIFx0XHR0aGlzLnNob3dhZnRlcmNhbCA9ICQuQ2FsbGJhY2tzKCk7IC8v5bGC5pi+56S65ZCO55qE5Zue6LCDXHJcbiBcdFx0dGhpcy5oaWRlYmVmb3JlY2FsID0gJC5DYWxsYmFja3MoKTsgLy/lsYLpmpDol4/liY3nmoTlm57osINcclxuIFx0XHR0aGlzLmhpZGVhZnRlcmNhbCA9ICQuQ2FsbGJhY2tzKCk7IC8v5bGC6ZqQ6JeP5ZCO55qE5Zue6LCDXHJcbiBcdFx0dGhpcy5jdXN0b20gID0gb3B0LmN1c3RvbTsgLy/oh6rlrprkuYnmlrnms5VcclxuXHQgfVxyXG5cdCAvKipcclxuIFx0ICog6K6+572u5bGC5YaF5a65XHJcbiAgXHQgKiBAcGFyYW0ge0VsZW1lbnR8U3RyaW5nfSAqY29udGVudCBodG1s5a2X56ym5Liy5oiW6ICF6IqC54K55a+56LGhXHJcbiBcdCAqL1xyXG5cdCBzZXRDb250ZW50KGNvbnRlbnQpe1xyXG5cdFx0aWYoYXJndW1lbnRzLmxlbmd0aCA9PSAwKXtcclxuIFx0XHRcdHJldHVybjtcclxuIFx0XHR9XHJcbiBcdFx0aWYodHlwZW9mIGNvbnRlbnQgPT0gJ3N0cmluZycpe1xyXG4gXHRcdFx0dGhpcy5sYXllci5odG1sKGNvbnRlbnQpO1xyXG4gXHRcdH1cclxuIFx0XHRlbHNle1xyXG4gXHRcdFx0dGhpcy5sYXllci5odG1sKCcnKS5hcHBlbmQoY29udGVudCk7XHJcbiBcdFx0fVxyXG5cdCB9XHJcblx0IC8qKlxyXG4gXHQgKiDmmL7npLrlsYLjgIJcclxuIFx0ICovXHJcblx0IF9zaG93KCl7XHJcblx0XHQgaWYodHlwZW9mIHRoaXMuY3VzdG9tLnNob3cgPT0gJ2Z1bmN0aW9uJyl7XHJcbiBcdFx0XHR0aGlzLmN1c3RvbS5zaG93KHRoaXMubGF5ZXIpO1xyXG4gXHRcdH1cclxuIFx0XHRlbHNle1xyXG4gXHRcdFx0dGhpcy5sYXllci5zaG93KCk7XHJcbiBcdFx0fVxyXG5cdCB9XHJcblx0IC8qKlxyXG4gXHQgKiDmmL7npLrlsYLjgILkvJrop6blj5FzaG93Y2Fs5Zue6LCDXHJcbiBcdCAqL1xyXG4gXHQgc2hvdygpe1xyXG5cdFx0IGlmKCF0aGlzLmlzc2hvdygpKXtcclxuIFx0XHRcdHRoaXMuc2hvd2JlZm9yZWNhbC5maXJlKCk7IC8v5bGC5pi+56S65YmN5Zue6LCDXHJcbiBcdFx0XHR0aGlzLl9zaG93KCk7XHJcbiBcdFx0XHR0aGlzLnNob3dhZnRlcmNhbC5maXJlKCk7IC8v5bGC5pi+56S65ZCO5Zue6LCDXHJcbiBcdFx0fVxyXG5cdCB9XHJcblx0IC8qKlxyXG4gXHQgKiDpmpDol4/lsYLjgIJcclxuIFx0ICovXHJcblx0IF9oaWRlKCl7XHJcblx0XHRpZih0eXBlb2YgdGhpcy5jdXN0b20uaGlkZSA9PSAnZnVuY3Rpb24nKXtcclxuIFx0XHRcdHRoaXMuY3VzdG9tLmhpZGUodGhpcy5sYXllcik7XHJcbiBcdFx0fVxyXG4gXHRcdGVsc2V7XHJcbiBcdFx0XHR0aGlzLmxheWVyLmhpZGUoKTtcclxuIFx0XHR9XHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOmakOiXj+WxguOAguS8muinpuWPkWhpZGVjYWzlm57osINcclxuIFx0ICovXHJcblx0IGhpZGUoKXtcclxuXHRcdCBpZih0aGlzLmlzc2hvdygpKXtcclxuIFx0XHRcdHRoaXMuaGlkZWJlZm9yZWNhbC5maXJlKCk7IC8v5bGC6ZqQ6JeP5YmN5Zue6LCDXHJcbiBcdFx0XHR0aGlzLl9oaWRlKCk7XHJcbiBcdFx0XHR0aGlzLmhpZGVhZnRlcmNhbC5maXJlKCk7IC8v5bGC6ZqQ6JeP5ZCO5Zue6LCDXHJcbiBcdFx0fVxyXG5cdCB9XHJcblx0IC8qKlxyXG4gXHQgKiDplIDmr4HlsYJcclxuIFx0ICovXHJcblx0IGRlc3Ryb3koKXtcclxuXHRcdCBpZih0aGlzLmxheWVyICE9IG51bGwpe1xyXG4gXHRcdFx0dGhpcy5sYXllci5yZW1vdmUoKTtcclxuIFx0XHRcdHRoaXMubGF5ZXIgPSBudWxsO1xyXG4gXHRcdFx0dGhpcy5zaG93Y2FsID0gbnVsbDtcclxuIFx0XHRcdHRoaXMuaGlkZWNhbCA9IG51bGw7XHJcbiBcdFx0XHR0aGlzLmN1c3RvbSA9IG51bGw7XHJcbiBcdFx0XHR0aGlzLmNvbnRhaW5lciA9IG51bGw7XHJcbiBcdFx0fVxyXG5cdCB9XHJcblx0IC8qKlxyXG4gXHQgKiDliKTmlq3lsYLmmK/lkKbmmL7npLpcclxuIFx0ICogQHJldHVybiB7Qm9vbGVhbn0gdHJ1ZXxmYWxzZVxyXG4gXHQgKi9cclxuXHQgaXNzaG93KCl7XHJcblx0XHQgcmV0dXJuIHRoaXMubGF5ZXIuY3NzKCdkaXNwbGF5JykgIT0gJ25vbmUnO1xyXG5cdCB9XHJcbiB9XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IExheWVyO1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyDpga7nvannsbvigJTigJTliJvlu7rpga7nvanlubbov5vooYznm7jlhbPmjqfliLZcclxuICogQHZlcnNpb24gMS4wIHwgMjAxNS0wOC0xNSDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAcmV0dXJuIOmBrue9qeWvueixoVxyXG4gKiBAZXhhbXBsZVxyXG4gKiBcdCBjb25zdCBNYXNrID0gcmVxdWlyZSgnbGlibGF5ZXItbWFzaycpO1xyXG4gKlxyXG4gKiBcdCB2YXIgbWFzayA9IG5ldyAkbWFzaygkKCdib2R5JykpO1xyXG4gKiAgIG1hc2suc2hvdygpOyAvL+aYvuekuumBrue9qVxyXG4gKiAgIG1hc2suaGlkZSgpOyAvL+makOiXj+mBrue9qVxyXG4gKiAgIG1hc2subWFzazsgLy/pga7nvalkb23oioLngrnlr7nosaFcclxuICogICBtYXNrLmNvbnRhaW5lcjsgLy/pga7nvanlrrnlmahcclxuICogICBtYXNrLmRlc3Ryb3koKTsgLy/plIDmr4Hpga7nvalcclxuICogICBtYXNrLmNsaWNrY2FsLmFkZChmdW5jdGlvbihlKXtcclxuICogXHQgICAgY29uc29sZS5sb2coJ+mBrue9qeiiq+eCueWHuycpO1xyXG4gKiAgIH0pO1xyXG4gKiAqL1xyXG5cclxuIGNvbnN0IFBvc2l0aW9uQm9tYiA9IHJlcXVpcmUoJy4vcG9zaXRpb25Cb21iLmpzJyk7XHJcblxyXG4gY2xhc3MgTWFza3tcclxuXHQgLyoqXHJcblx0ICAqIOmBrue9qeexu+KAlOKAlOWIm+W7uumBrue9qWRvbeW5tua3u+WKoOWIsOaMh+WumuWuueWZqOS4rVxyXG5cdCAgKiBAcGFyYW0ge0VsZW1lbnR9IGNvbnRhaW5lciDpga7nvanlrZjmlL7lrrnlmajvvIzpu5jorqTkuLokKCdib2R5JylcclxuXHQgICogQHBhcmFtIHtKU09OfSBjb25maWcg6YGu572p6YWN572u5Y+C5pWw77yM6buY6K6k5L+h5oGv5Y+K6K+05piO5aaC5LiLb3B05Luj56CB5aSEXHJcblx0ICAqL1xyXG5cdCBjb25zdHJ1Y3Rvcihjb250YWluZXIsY29uZmlnKXtcclxuXHRcdCBjb250YWluZXIgPSBjb250YWluZXIgfHwgJCgnYm9keScpO1xyXG5cdFx0IHZhciBvcHQgPSAkLmV4dGVuZCh7XHJcblx0XHRcdCBiZ2NvbG9yOiAnIzAwMCcsIC8v6IOM5pmv6ImyXHJcblx0XHRcdCB6SW5kZXg6IDEsIC8v6YGu572pei1pbmRleFxyXG5cdFx0XHQgb3BhY2l0eTogMC42LCAvL+mBrue9qemAj+aYjuW6plxyXG5cdFx0XHQgc2hvdzogZmFsc2UsIC8v5Yib5bu66YGu572p5ZCO6buY6K6k5piv5ZCm5pi+56S6XHJcblx0XHRcdCBjdXN0b206IHtcclxuXHRcdFx0XHQgc2hvdzogbnVsbCwgLy/nlKjmiLfoh6rlrprkuYnmmL7npLrlsYLnmoTmlrnms5XjgILlpoLmnpzmraTmlrnms5XlrZjlnKjvvIzliJnkuI3nlKjpu5jorqTnmoTmmL7npLrlsYLmlrnms5VcclxuXHRcdFx0XHQgaGlkZTogbnVsbCAvL+eUqOaIt+iHquWumuS5iemakOiXj+WxgueahOaWueazleOAguWmguaenOatpOaWueazleWtmOWcqO+8jOWImeS4jeeUqOm7mOiupOeahOmakOiXj+WxguaWueazlVxyXG5cdFx0XHQgfVxyXG5cdFx0IH0sY29uZmlnIHx8IHt9KTtcclxuXHRcdCB2YXIgY3Nzc3RyID0gJ3Bvc2l0aW9uOmFic29sdXRlO2JhY2tncm91bmQ6JytvcHQuYmdjb2xvcisnOycrKG9wdC5zaG93PycnOidkaXNwbGF5Om5vbmU7JykrJ3otaW5kZXg6JytvcHQuekluZGV4Kyc7JztcclxuXHRcdCB0aGlzLmNvbnRhaW5lciA9IGNvbnRhaW5lcjsgLy/pga7nvanlrrnlmahcclxuXHRcdCB0aGlzLm1hc2sgPSAkKCc8ZGl2IHN0eWxlPVwiJytjc3NzdHIrJ1wiPjwvZGl2PicpO1xyXG5cdFx0IHRoaXMubWFzay5hcHBlbmRUbyhjb250YWluZXIpO1xyXG5cdFx0IHRoaXMubWFzay5jc3MoJ29wYWNpdHknLG9wdC5vcGFjaXR5KTtcclxuXHRcdCB0aGlzLmN1c3RvbSAgPSBvcHQuY3VzdG9tOyAvL+iHquWumuS5ieaWueazlVxyXG5cdFx0IHRoaXMucG9zID0gbmV3IFBvc2l0aW9uQm9tYih7bGF5ZXI6dGhpcy5tYXNrfSx7bW9kZTonZnVsbCd9KTtcclxuXHRcdCAvL+e7keWumuS6i+S7tlxyXG5cdFx0IHRoaXMuY2xpY2tjYWwgPSAkLkNhbGxiYWNrcygpOyAvL+mBrue9qeeCueWHu+WQjueahOWbnuiwg1xyXG5cdFx0IHRoaXMubWFzay5vbignY2xpY2subGliJywoZSkgPT4ge1xyXG5cdFx0XHQgdGhpcy5jbGlja2NhbC5maXJlKGUpO1xyXG5cdFx0IH0pO1xyXG5cdCB9XHJcblx0IC8qKlxyXG4gXHQgKiDmmL7npLrpga7nvalcclxuIFx0ICovXHJcblx0IHNob3coKXtcclxuXHRcdGlmKHR5cGVvZiB0aGlzLmN1c3RvbS5zaG93ID09ICdmdW5jdGlvbicpe1xyXG4gXHRcdFx0dGhpcy5jdXN0b20uc2hvdyh0aGlzLm1hc2spO1xyXG4gXHRcdH1cclxuIFx0XHRlbHNle1xyXG4gXHRcdFx0dGhpcy5tYXNrLnNob3coKTtcclxuIFx0XHR9XHJcbiBcdFx0dGhpcy5wb3Muc2V0cG9zKCk7XHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOmakOiXj+mBrue9qVxyXG4gXHQgKi9cclxuXHQgaGlkZSgpe1xyXG5cdFx0IGlmKHR5cGVvZiB0aGlzLmN1c3RvbS5oaWRlID09ICdmdW5jdGlvbicpe1xyXG4gXHRcdFx0dGhpcy5jdXN0b20uaGlkZSh0aGlzLm1hc2spO1xyXG4gXHRcdH1cclxuIFx0XHRlbHNle1xyXG4gXHRcdFx0dGhpcy5tYXNrLmhpZGUoKTtcclxuIFx0XHR9XHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOmUgOavgemBrue9qVxyXG4gXHQgKi9cclxuXHQgZGVzdHJveSgpe1xyXG5cdFx0IGlmKHRoaXMubWFzayAhPSBudWxsKXtcclxuIFx0XHRcdHRoaXMubWFzay5vZmYoJ2NsaWNrLmxpYicpO1xyXG4gXHRcdFx0dGhpcy5tYXNrLnJlbW92ZSgpO1xyXG4gXHRcdFx0dGhpcy5tYXNrID0gbnVsbDtcclxuIFx0XHRcdHRoaXMucG9zLmRlc3Ryb3koKTtcclxuIFx0XHRcdHRoaXMucG9zID0gbnVsbDtcclxuIFx0XHRcdHRoaXMuY2xpY2tjYWwgPSBudWxsO1xyXG4gXHRcdH1cclxuXHQgfVxyXG4gfVxyXG5cclxuIG1vZHVsZS5leHBvcnRzID0gTWFzaztcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcg5by55bGC5a6a5L2N5pa55rOVXHJcbiAqIFx0XHTms6jmhI/vvJrosIPnlKjmraTmlrnms5XliY3vvIzlv4XpobvmmK/lvoXlrprkvY3lsYLnmoRkaXNwbGF55LiN5Li6bnVsbOeahOaDheWGteS4i1xyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE1LTA4LTE1IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEByZXR1cm4g5by55bGC5a6a5L2N5pa55rOVXHJcbiAqIEBleGFtcGxlXHJcbiAqIFx0IGNvbnN0IFBvc2l0aW9uQm9tYiA9IHJlcXVpcmUoJ2xpYmxheWVyLXBvc2l0aW9uQm9tYicpO1xyXG4gKlxyXG4gKiBcdCB2YXIgcG9zID0gbmV3IFBvc2l0aW9uQm9tYih7bGF5ZXI65bGCZG9t6IqC54K5fSk7XHJcbiAqIFx0IHBvcy5wb3NjYWwuYWRkKGZ1bmN0aW9uKCl7Y29uc29sZS5sb2coJ2xheWVy5a6a5L2N5ZCO5Zue6LCDJyl9KTtcclxuICogKi9cclxuXHJcbiBjb25zdCBXaW5zY3JvbGwgPSByZXF1aXJlKCdsaWJ1dGlsLXdpbnNjcm9sbCcpLFxyXG4gXHRcdFNjcm9sbCA9IHJlcXVpcmUoJ2xpYnV0aWwtc2Nyb2xsJyksXHJcblx0XHRXaW5yZXNpemUgPSByZXF1aXJlKCdsaWJ1dGlsLXdpbnJlc2l6ZScpLFxyXG5cdFx0UmVzaXplID0gcmVxdWlyZSgnbGlidXRpbC1yZXNpemUnKTtcclxuXHJcbi8qKlxyXG4gKiDlrprkvY3nrpfms5VcclxuICovXHJcbmZ1bmN0aW9uIHNldHBvcyhkb21vcHQscG9zb3B0KXtcclxuXHR2YXIgY3Nzb3B0ID0ge30sbGF5ZXIgPSBkb21vcHQubGF5ZXIsb2ZmY29uID0gZG9tb3B0Lm9mZmNvbjtcclxuXHRsYXllci5jc3MoJ3Bvc2l0aW9uJyxkb21vcHQucG9zaXRpb24pO1xyXG5cdHZhciBtYXJnaW5MZWZ0ID0gMCwgbWFyZ2luVG9wID0gMDtcclxuXHRpZihkb21vcHQucG9zaXRpb24gPT0gJ2Fic29sdXRlJyAmJiBwb3NvcHQuZml4ZWQpe1xyXG5cdFx0bWFyZ2luTGVmdCA9IG9mZmNvbi5zY3JvbGxMZWZ0KCk7XHJcblx0XHRtYXJnaW5Ub3AgPSBvZmZjb24uc2Nyb2xsVG9wKCk7XHJcblx0fVxyXG5cdHN3aXRjaCAocG9zb3B0Lm1vZGUpe1xyXG5cdFx0Y2FzZSAnYyc6IC8v5bGF5Lit5a6a5L2NXHJcblx0XHRcdG1hcmdpbkxlZnQgLT0gKE1hdGgubWF4KGxheWVyLndpZHRoKCkscG9zb3B0Lm1pbndpZHRoKS8yK3Bvc29wdC5vZmZzZXRbMF0pO1xyXG5cdFx0XHRtYXJnaW5Ub3AgLT0gKE1hdGgubWF4KGxheWVyLmhlaWdodCgpLHBvc29wdC5taW5oZWlnaHQpLzIrcG9zb3B0Lm9mZnNldFsxXSk7XHJcblx0XHRcdGNzc29wdC50b3AgPSAnNTAlJztcclxuXHRcdFx0Y3Nzb3B0LmxlZnQgPSAnNTAlJztcclxuXHRcdFx0YnJlYWs7XHJcblx0XHRjYXNlICdmdWxsJzogLy/mu6HlsY/lrprkvY3vvIzljaDmu6HmlbTkuKrlrprkvY3lrrnlmajjgILmnKzmnaXkuI3orr7nva53aWR0aOWSjGhlaWdodO+8jOiuvue9ruS6hnJpZ2h05ZKMYm90dG9t44CC5L2G5piv5YG25Y+RbWFyZ2lu5LiN6LW35L2c55So77yM5q2k5pe26K+75Y+W55qE5YWD57Sg5bC65a+45Li6MC5cclxuXHRcdFx0Y3Nzb3B0LndpZHRoID0gJzEwMCUnO1xyXG5cdFx0XHRjc3NvcHQuaGVpZ2h0ID0gJzEwMCUnO1xyXG5cdFx0XHRjc3NvcHQudG9wID0gJzAnO1xyXG5cdFx0XHRjc3NvcHQubGVmdCA9ICcwJztcclxuXHRcdFx0YnJlYWs7XHJcblx0fVxyXG5cdGNzc29wdC5tYXJnaW5MZWZ0ID0gbWFyZ2luTGVmdCsncHgnO1xyXG5cdGNzc29wdC5tYXJnaW5Ub3AgPSBtYXJnaW5Ub3ArJ3B4JztcclxuXHRpZih0eXBlb2YgcG9zb3B0LmN1c3RvbXBvcyA9PSAnZnVuY3Rpb24nKXtcclxuXHRcdHBvc29wdC5jdXN0b21wb3MoY3Nzb3B0KTtcclxuXHR9ZWxzZXtcclxuXHRcdGxheWVyLmNzcyhjc3NvcHQpO1xyXG5cdH1cclxufVxyXG5cclxuY2xhc3MgUG9zaXRpb257XHJcblx0LyoqXHJcblx0ICog5a6a5L2N57G7XHJcbiAgICAgKiBAcGFyYW0ge0pTT059IGRvbXMg5a6a5L2NZG9t55u45YWz5L+h5oGvXHJcbiAgICAgKiBcdFx0e1xyXG4gICAgICogXHRcdFx0bGF5ZXI6IG51bGwgLy97SlF1ZXJ5RWxlbWVudHxTdHJpbmfoioLngrnpgInmi6nlmah9IOW+heWumuS9jeWxguiKgueCuVxyXG4gICAgICogICAgICB9XHJcbiAgICAgKiBAcGFyYW0ge0pTT059IGNvbmZpZyDlsYLlrprkvY3phY3nva7lj4LmlbDvvIzpu5jorqTkv6Hmga/lj4ror7TmmI7lpoLkuItwb3NvcHTku6PnoIHlpIRcclxuXHQgKi9cclxuXHRjb25zdHJ1Y3Rvcihkb21zLGNvbmZpZyl7XHJcblx0XHQvL+WPguaVsOajgOa1i+S4juiuvue9rlxyXG5cdFx0aWYoYXJndW1lbnRzLmxlbmd0aCA9PSAwKXtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCflv4XpobvkvKDlhaXnm7jlhbPlrprkvY3nmoRkb23lj4LmlbAnKTtcclxuXHRcdH1cclxuXHRcdHZhciBkb21vcHQgPSAkLmV4dGVuZCh7XHJcblx0XHRcdGxheWVyOiBudWxsLCAvL+W+heWumuS9jeWxguiKgueCuVxyXG5cdFx0XHRvZmZwYWdlOiBmYWxzZSAvL+ivtOaYjuebuOWvueS6juW9k+WJjemhtemdouWumuS9jVxyXG5cdFx0fSxkb21zIHx8IHt9KTtcclxuXHRcdGlmKGRvbW9wdC5sYXllciAmJiB0eXBlb2YgZG9tb3B0LmxheWVyID09ICdzdHJpbmcnKXtcclxuXHRcdFx0ZG9tb3B0LmxheWVyID0gJChkb21vcHQubGF5ZXIpO1xyXG5cdFx0fVxyXG5cdFx0aWYoIWRvbW9wdC5sYXllciB8fCBkb21vcHQubGF5ZXIubGVuZ3RoID09IDApe1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ+S8oOWFpeeahOWumuS9jeWxguiKgueCueaXoOaViCcpO1xyXG5cdFx0fVxyXG5cdFx0dmFyIHBvc29wdCA9ICQuZXh0ZW5kKHtcclxuXHRcdFx0Zml4ZWQ6IHRydWUsIC8v5piv5ZCm5bCG5by55bGC5aeL57uI5a6a5L2N5Zyo5Y+v6KeG56qX5Y+j5Yy65Z+f77yM6buY6K6k5Li6dHJ1ZVxyXG5cdFx0XHRtb2RlOiAnYycsIC8v5a6a5L2N5qih5byP77yM5p6a5Li+44CCYzrkuK3pl7RcclxuXHRcdFx0b2Zmc2V0OiBbMCwwXSwgLy/lrprkuYnlkI7lgY/np7vlsLrlr7ggW3jovbQseei9tF3jgILlr7nkuo5tb2Rl5pivZnVsbOeahOaooeW8j+aXoOaViFxyXG5cdFx0XHRzaXplY2hhbmdlOiBmYWxzZSwgLy/lvZNtb2Rl5pivY+aXtu+8jG9mZnNldFBhcmVudCByZXNpemXml7bvvIzlvoXlrprkvY3lsYLnmoTlpKflsI/mmK/lkKbkvJrmlLnlj5hcclxuXHRcdFx0bWlud2lkdGg6IDAsIC8v5a6a5L2N6K6h566X5pe277yM5b6F5a6a5L2N5bGCbGF5ZXLnmoTmnIDlsI/lrr3luqZcclxuICAgICAgICAgICAgbWluaGVpZ2h0OiAwLCAvL+WumuS9jeiuoeeul+aXtu+8jOW+heWumuS9jeWxgmxheWVy55qE5pyA5bCP6auY5bqmXHJcbiAgICAgICAgICAgIGN1c3RvbXBvczogbnVsbCAvL+eUqOaIt+iHquWumuS5ieWumuS9jeaWueazleOAguWmguaenOWjsOaYjuatpOaWueazle+8jOWImeS4jeS8muS9v+eUqOezu+e7n+m7mOiupOeahOaWueazleiuvue9rnBvc+eahOWumuS9jeWPguaVsO+8jOiAjOaYr+aKiuWumuS9jeWPguaVsHBvc+S8oOmAkue7meatpOaWueazlVxyXG5cdFx0fSxjb25maWcgfHwge30pO1xyXG4gICAgICAgIHRoaXMucG9zY2FsID0gJC5DYWxsYmFja3MoKTsgLy9zZXRwb3PlkI7nmoTlm57osINcclxuXHJcblx0XHR2YXIgdGhhdCA9IHRoaXM7XHJcblx0XHQvL+WIneatpeajgOa1i+WumuS9jeWPguiAg+WuueWZqFxyXG5cdFx0ZG9tb3B0Lm9mZmNvbiA9IGRvbW9wdC5sYXllci5vZmZzZXRQYXJlbnQoKTtcclxuXHRcdHZhciB0YWduYW1lID0gZG9tb3B0Lm9mZmNvbi5nZXQoMCkudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xyXG5cdFx0dmFyIGxpc3RlbmNhbGwgPSB7XHJcbiAgICAgICAgICAgIGNhbGw6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnNldHBvcygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgaXNsaXNzY3JvbGwgPSBmYWxzZTsgLy/mmK/lkKbnm5HlkKxzY3JvbGzkuovku7ZcclxuICAgICAgICB2YXIgaXNsaXNyZXNpemUgPSBmYWxzZTsgLy/mmK/lkKbnm5HlkKxyZXNpemXkuovku7ZcclxuXHRcdGlmKHRhZ25hbWUgPT0gJ2JvZHknIHx8IHRhZ25hbWUgPT0gJ2h0bWwnKXsgLy/or7TmmI7nm7jlr7nkuo7pobXpnaLlrprkvY1cclxuXHRcdCAgICBkb21vcHQub2ZmY29uID0gJCgnYm9keScpO1xyXG5cdFx0XHRkb21vcHQub2ZmcGFnZSA9IHRydWU7XHJcblx0XHR9XHJcblx0XHRpZihkb21vcHQub2ZmcGFnZSAmJiBwb3NvcHQuZml4ZWQpeyAvL+WmguaenOWumuS9jeWuueWZqOaYr+W9k+WJjemhtemdouOAgeWbuuWumuWumuS9jeOAgeWPr+S9v+eUqGZpeGVk5a6a5L2N44CC5YiZ55SoZml4ZWTlrprkvY1cclxuXHRcdFx0ZG9tb3B0LnBvc2l0aW9uID0gJ2ZpeGVkJztcclxuXHRcdH1cclxuXHRcdGVsc2V7XHJcblx0XHRcdGRvbW9wdC5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XHJcblx0XHRcdGlmKHBvc29wdC5maXhlZCkgeyAvL+WmguaenOWbuuWumuWumuS9je+8jOWImeebkeWQrHNjcm9sbOS6i+S7tlxyXG5cdFx0XHQgICAgaXNsaXNzY3JvbGwgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgaWYoZG9tb3B0Lm9mZnBhZ2Upe1xyXG4gICAgICAgICAgICAgICAgICAgIFdpbnNjcm9sbC5saXN0ZW4obGlzdGVuY2FsbCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzY3JvbGwgPSBuZXcgU2Nyb2xsKGRvbW9wdC5vZmZjb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbC5saXN0ZW4obGlzdGVuY2FsbCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdC8v6K+05piObW9kZeaYr2Pml7bvvIxvZmZzZXRQYXJlbnQgcmVzaXpl5pe277yM5b6F5a6a5L2N5bGC55qE5aSn5bCP5Lya5pS55Y+Y77yM5YiZ55uR5ZCscmVzaXpl5LqL5Lu2XHJcbiAgICAgICAgaWYocG9zb3B0Lm1vZGUgPT0gJ2MnICYmIHBvc29wdC5zaXplY2hhbmdlKXtcclxuICAgICAgICAgICAgaXNsaXNyZXNpemUgPSB0cnVlO1xyXG4gICAgICAgICAgICBpZihkb21vcHQub2ZmcGFnZSl7XHJcbiAgICAgICAgICAgICAgICBXaW5yZXNpemUubGlzdGVuKGxpc3RlbmNhbGwpO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHZhciByZXNpemUgPSBuZXcgUmVzaXplKGRvbW9wdC5vZmZjb24pO1xyXG4gICAgICAgICAgICAgICAgcmVzaXplLmxpc3RlbihsaXN0ZW5jYWxsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHRcdHRoaXMuZG9tb3B0ID0gZG9tb3B0OyAvL2RvbeWPguaVsFxyXG5cdFx0dGhpcy5wb3NvcHQgPSBwb3NvcHQ7IC8v5a6a5L2N5Y+C5pWwXHJcblx0XHR0aGlzLmRlc3Ryb3kgPSBmdW5jdGlvbigpeyAvL+e7hOS7tumUgOavgeaWueazlVxyXG5cdFx0XHR0aGlzLmRvbW9wdCA9IG51bGw7XHJcblx0XHRcdHRoaXMucG9zb3B0ID0gbnVsbDtcclxuXHRcdFx0aWYoaXNsaXNzY3JvbGwpe1xyXG5cdFx0XHRcdGlmKGRvbW9wdC5vZmZwYWdlKXtcclxuXHRcdFx0XHRcdFdpbnNjcm9sbC51bmxpc3RlbihsaXN0ZW5jYWxsKTtcclxuXHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdHNjcm9sbC51bmxpc3RlbihsaXN0ZW5jYWxsKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0aWYoaXNsaXNyZXNpemUpe1xyXG5cdFx0XHQgICAgaWYoZG9tb3B0Lm9mZnBhZ2Upe1xyXG4gICAgICAgICAgICAgICAgICAgIFdpbnJlc2l6ZS51bmxpc3RlbihsaXN0ZW5jYWxsKTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc2l6ZS51bmxpc3RlbihsaXN0ZW5jYWxsKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHR9XHJcblx0LyoqXHJcblx0ICog6L+b6KGM5a6a5L2NXHJcblx0ICogQHJldHVybiB7Qm9vbGVhbn0g5piv5ZCm5a6a5L2N5oiQ5YqfXHJcblx0ICovXHJcblx0c2V0cG9zKCl7XHJcblx0XHRpZih0aGlzLmRvbW9wdC5sYXllci5jc3MoJ2Rpc3BsYXknKSA9PSAnbm9uZScgfHwgdGhpcy5kb21vcHQub2ZmY29uLmNzcygnZGlzcGxheScpID09ICdub25lJyl7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdGVsc2V7XHJcblx0XHRcdHNldHBvcyh0aGlzLmRvbW9wdCx0aGlzLnBvc29wdCk7XHJcbiAgICAgICAgICAgIHRoaXMucG9zY2FsLmZpcmUoKTtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBvc2l0aW9uO1xyXG4iLCIvKipcclxuICogYWxlcnTlvLnlsYLmqKHmnb/vvIzlv4XpobvlhbfmnInmjIflrprnmoRub2Rl5bGe5oCnXHJcbiAqL1xyXG5leHBvcnRzLmFsZXJ0ID0gW1xyXG4gICAgJzxkaXY+5qCH6aKYPC9kaXY+JyxcclxuXHQnPGRpdiBub2RlPVwiY29udGVudFwiPuWGheWuueWMujwvZGl2PicsXHJcblx0JzxkaXY+PGEgaHJlZj1cImphdmFzY3JpcHQ6O1wiIGNsYXNzPVwianMtb2tcIj7noa7lrpo8L2E+PC9kaXY+J1xyXG5dLmpvaW4oJycpO1xyXG4vKipcclxuICogY29uZmlybeW8ueWxguaooeadv++8jOW/hemhu+WFt+acieaMh+WumueahG5vZGXlsZ7mgKdcclxuICovXHJcbmV4cG9ydHMuY29uZmlybSA9IFtcclxuICAgICc8ZGl2Puagh+mimDwvZGl2PicsXHJcblx0JzxkaXYgbm9kZT1cImNvbnRlbnRcIj7lhoXlrrnljLo8L2Rpdj4nLFxyXG5cdCc8ZGl2PjxhIGhyZWY9XCJqYXZhc2NyaXB0OjtcIiBjbGFzcz1cImpzLW9rXCI+56Gu5a6aPC9hPjxhIGhyZWY9XCJqYXZhc2NyaXB0OjtcIiBjbGFzcz1cImpzLWNhbmNlbFwiPuWPlua2iDwvYT48L2Rpdj4nXHJcbl0uam9pbignJylcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcgY3Nz5pSv5oyB5oOF5Ya15Yik5pat44CC5Li76KaB55So5LqO5rWP6KeI5Zmo5YW85a65XHJcbiAqIEB2ZXJzaW9uIDEuMCB8IDIwMTUtMDgtMzEg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQHJldHVyblxyXG4gKiBAZXhhbXBsZVxyXG4gKiBcdCBjb25zdCBDc3NzdXBvcnQgPSByZXF1aXJlKCdsaWJ1dGlsLWNzc3N1cG9ydCcpO1xyXG4gKiBcdCBDc3NzdXBvcnQuZml4ZWQ7XHJcbiAqICovXHJcbnZhciBfZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbnZhciByZXN1bHQgPSB7XHJcblx0Ly/mmK/lkKbmlK/mjIFwb3NpdGlvbjpmaXhlZOWumuS9jVxyXG5cdGZpeGVkOiAhKCd1bmRlZmluZWQnID09IHR5cGVvZihkb2N1bWVudC5ib2R5LnN0eWxlLm1heEhlaWdodCkgfHwgKGRvY3VtZW50LmNvbXBhdE1vZGUgIT09IFwiQ1NTMUNvbXBhdFwiICYmIC9tc2llLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKSkpKSxcclxuXHQvL+aYr+WQpuaUr+aMgXRyYW5zaXRpb25cclxuXHR0cmFuc2l0aW9uOiAhKF9kaXYuc3R5bGUudHJhbnNpdGlvbiA9PSB1bmRlZmluZWQpXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHJlc3VsdDtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcg5a+55LqO6auY6aKR6Kem5Y+R55qE5LqL5Lu26L+b6KGM5bu26L+f5aSE55CG57G744CC5bqU55So5Zy65pmv77yac2Nyb2xs5ZKMcmVzaXplXHJcbiAqIEB2ZXJzaW9uIDEuMC4wIHwgMjAxNS0wOC0yNyDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAcmV0dXJuIOWkhOeQhuexu1xyXG4gKiBAZXhhbXBsZVxyXG4gKiAqL1xyXG5cclxuIGNvbnN0IFB1Ymxpc2hlclMgPSByZXF1aXJlKCcuL3B1Ymxpc2hlclMuanMnKTtcclxuXHJcbiBjbGFzcyBEZWxheWV2dCBleHRlbmRzIFB1Ymxpc2hlclN7XHJcblx0IC8qKlxyXG4gXHQgKiDlr7nkuo7pq5jpopHop6blj5HnmoTkuovku7bov5vooYzlu7bov5/lpITnkIbjgILlupTnlKjlnLrmma/vvJpzY3JvbGzlkoxyZXNpemVcclxuIFx0ICogQHBhcmFtIHtKU09OfSBjb25maWcg6YWN572uXHJcbiBcdCAqL1xyXG5cdCBjb25zdHJ1Y3Rvcihjb25maWcpe1xyXG5cdCAgICBzdXBlcigpO1xyXG4gXHRcdHRoaXMudGltZXIgPSBudWxsO1xyXG4gXHRcdCQuZXh0ZW5kKHRoaXMse1xyXG4gXHRcdFx0ZGVsYXl0aW1lOiAyMDAgLy/kuovku7bmo4DmtYvlu7bov5/ml7bpl7TvvIzmr6vnp5JcclxuIFx0XHR9LGNvbmZpZyB8fCB7fSk7XHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOW8gOWni+ajgOa1i1xyXG4gXHQgKi9cclxuXHQgc3RhcnQoKXtcclxuXHRcdCBpZih0aGlzLnRpbWVyKXtcclxuICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVyKTtcclxuICAgICAgICAgfVxyXG4gICAgICAgICB0aGlzLnRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgIFx0dGhpcy5kZWxpdmVyKCk7XHJcbiAgICAgICAgIH0sdGhpcy5kZWxheXRpbWUpO1xyXG5cdCB9XHJcbiB9XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IERlbGF5ZXZ0O1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyDmoLnmja7orr7lpIfnu5nlh7rnm7jlhbPkuJrliqHkuovku7bnmoTkuovku7blkI3np7BcclxuICogQHZlcnNpb24gMS4wLjAgfCAyMDE1LTA5LTE0IOeJiOacrOS/oeaBr1xyXG4gKiBAYXV0aG9yIFpoYW5nIE1pbmdydWkgfCA1OTIwNDQ1NzNAcXEuY29tXHJcbiAqIEBleGFtcGxlXHJcbiAqICovXHJcbnZhciByZXN1bHQgPSB7XHJcblx0Ly/mtY/op4jlmajnqpflj6NyZXNpemXkuovku7ZcclxuXHR3aW5yZXNpemU6IChmdW5jdGlvbigpe1xyXG5cdCAgICByZXR1cm4gJ29ub3JpZW50YXRpb25jaGFuZ2UnIGluIHdpbmRvdz8gJ29yaWVudGF0aW9uY2hhbmdlJzogJ3Jlc2l6ZSc7XHJcblx0fSkoKSxcclxuXHQvL2lucHV05oiWdGV4dGFyZWHovpPlhaXmoYblgLzmlLnlj5jnmoTnm5HlkKzkuovku7ZcclxuXHRpbnB1dDogKGZ1bmN0aW9uKCl7XHJcblx0ICAgIGlmKC9NU0lFIDkuMC8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSl7IC8vSWU56YKj5Liq5Z2R54i555qE77yM5pys5p2laW5wdXTlkoxwcm9wZXJ0eWNoYW5nZemDveaUr+aMge+8jOS9huaYr+WIoOmZpOmUruaXoOazleinpuWPkei/meS4pOS4quS6i+S7tu+8jOaJgOS7peW+l+a3u+WKoGtleXVwXHJcblx0ICAgICAgICByZXR1cm4gJ2lucHV0IGtleXVwJztcclxuXHQgICAgfVxyXG5cdCAgICB2YXIgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcblx0ICAgIGlmKCdvbmlucHV0JyBpbiBub2RlKXtcclxuXHQgICAgICAgIHJldHVybiAnaW5wdXQnO1xyXG5cdCAgICB9ZWxzZSBpZignb25wcm9wZXJ0eWNoYW5nZScgaW4gbm9kZSl7XHJcblx0ICAgICAgICByZXR1cm4gJ3Byb3BlcnR5Y2hhbmdlJztcclxuXHQgICAgfWVsc2Uge1xyXG5cdCAgICAgICAgcmV0dXJuICdrZXl1cCc7XHJcblx0ICAgIH1cclxuXHR9KSgpXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHJlc3VsdDtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcg6K6i6ZiF6ICF5qih5byP4oCU4oCU5Y+R5biD6ICF57G74oCU4oCU57K+566A54mIXHJcbiAqIOeyvueugOeJiO+8muiuoumYheiAheS4jemZkOWumuW/hemhu+aYr+iuoumYheiAheexu1N1YnNjcmliZXLnmoTlr7nosaFcclxuICogQHZlcnNpb24gMS4wIHwgMjAxNS0wOC0zMSDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAcmV0dXJuIOWPkeW4g+iAheexu1xyXG4gKiBAZXhhbXBsZVxyXG4gKiAqL1xyXG4gY29uc3QgVG9vbCA9IHJlcXVpcmUoJy4vdG9vbC5qcycpLFxyXG5cdCAgIFJ3Y29udHJvbGxlciA9IHJlcXVpcmUoJy4vcndjb250cm9sbGVyLmpzJyk7XHJcblxyXG5jbGFzcyBQdWJsaXNoZXJTe1xyXG5cdGNvbnN0cnVjdG9yKCl7XHJcblx0XHR0aGlzLnN1YnNjcmliZXJzID0gW107IC8v6K6w5b2V6K6i6ZiF6ICF5a+56LGhXHJcblx0XHR0aGlzLnJ3Y29udHJvbGxkZXIgPSBuZXcgUndjb250cm9sbGVyKCk7XHJcblx0fVxyXG5cdC8qKlxyXG5cdCAqIOWPguaVsOacieaViOaAp+mqjOivgVxyXG5cdCAqL1xyXG5cdGFyZ3NWYWxpZGF0ZShkYXRhKXtcclxuXHRcdGlmKFRvb2wuaXNPYmplY3QoZGF0YSkgJiYgVG9vbC5pc0Z1bmN0aW9uKGRhdGEuY2FsbCkpe1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblx0LyoqXHJcblx0ICog5L+h5oGv5YiG5Y+R77yM6YCa55+l5omA5pyJ6K6i6ZiF6ICFXHJcblx0ICogZmlsdGVy5omn6KGM6L+U5ZuedHJ1Ze+8jOWImeaJp+ihjGNhbGxcclxuXHQgKi9cclxuXHRkZWxpdmVyKCl7XHJcblx0XHR0aGlzLnJ3Y29udHJvbGxkZXIucmVhZChmdW5jdGlvbihkYXRhKXtcclxuXHRcdFx0JC5lYWNoKHRoaXMuc3Vic2NyaWJlcnMsZnVuY3Rpb24oaW5kZXgsaXRlbSl7XHJcblx0XHRcdFx0aWYoaXRlbS5maWx0ZXIoKSA9PSB0cnVlKXtcclxuXHRcdCAgICAgICAgXHRpdGVtLmNhbGwuYXBwbHkod2luZG93LGRhdGEuYXJncyk7XHJcblx0XHQgICAgICBcdH1cclxuXHRcdFx0fSk7XHJcblx0XHR9LmJpbmQodGhpcyx7YXJnczogYXJndW1lbnRzfSkpO1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiDorqLpmIVcclxuIFx0ICogQHBhcmFtIHtKU09OfSAqc3Vic2NyaWJlciDorqLpmIXogIXjgILmoLzlvI/lkIxzdWJzY3JpYmVyc+mHjOeahOWNleeLrOS4gOmhuVxyXG4gXHQgKiB7XHJcbiBcdCAqIFx0XHQqY2FsbDogZnVuY3Rpb24oKXt9IC8v5L+h5oGv5YiG5Y+R55qE5Zue6LCD5Ye95pWwXHJcbiBcdCAqICAgICAgZmlsdGVyOiBmdW5jdGlvbigpe3JldHVybiB0cnVlO30gLy/ov4fmu6TmnaHku7ZcclxuIFx0ICogfVxyXG5cdCAqL1xyXG5cdHN1YnNjcmliZShzdWJzY3JpYmVyKXtcclxuXHRcdGlmKHRoaXMuYXJnc1ZhbGlkYXRlKHN1YnNjcmliZXIpKXtcclxuXHRcdFx0aWYoIVRvb2wuaXNGdW5jdGlvbihzdWJzY3JpYmVyLmZpbHRlcikpe1xyXG5cdFx0ICAgICAgICBzdWJzY3JpYmVyLmZpbHRlciA9IGZ1bmN0aW9uKCl7XHJcblx0XHQgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHRcdCAgICAgICAgfTtcclxuXHRcdCAgICB9XHJcblx0XHRcdGlmKCQuaW5BcnJheShzdWJzY3JpYmVyLHRoaXMuc3Vic2NyaWJlcnMpIDwgMCl7XHJcblx0XHRcdFx0dGhpcy5yd2NvbnRyb2xsZGVyLndyaXRlKGZ1bmN0aW9uKGN1cnN1Yil7XHJcblx0XHRcdFx0XHR0aGlzLnN1YnNjcmliZXJzLnB1c2goY3Vyc3ViKTtcclxuXHRcdFx0XHR9LmJpbmQodGhpcyxzdWJzY3JpYmVyKSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0LyoqXHJcblx0ICog5Y+W5raI6K6i6ZiFXHJcbiBcdCAqIEBwYXJhbSB7SlNPTn0gc3Vic2NyaWJlciDorqLpmIXogIVcclxuXHQgKi9cclxuXHR1bnN1YnNjcmliZShzdWJzY3JpYmVyKXtcclxuXHRcdGlmKHRoaXMuYXJnc1ZhbGlkYXRlKHN1YnNjcmliZXIpKXtcclxuXHRcdFx0dGhpcy5yd2NvbnRyb2xsZGVyLndyaXRlKGZ1bmN0aW9uKGN1cnN1Yil7XHJcblx0XHRcdFx0JC5lYWNoKHRoaXMuc3Vic2NyaWJlcnMsKGluZGV4LGl0ZW0pID0+IHtcclxuXHRcdFx0XHRcdGlmKGl0ZW0gPT0gY3Vyc3ViKXtcclxuXHRcdFx0XHRcdCAgICB0aGlzLnN1YnNjcmliZXJzLnNwbGljZShpbmRleCwxKTtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9LmJpbmQodGhpcyxzdWJzY3JpYmVyKSk7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFB1Ymxpc2hlclM7XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3XHJcbiAqICAg57uZ5oyH5a6a5YWD57Sg5Yib5bu6cmVzaXpl5LqL5Lu255uR5ZCs57G7XHJcbiAqIEBhdXRob3IgbWluZ3J1aXwgbWluZ3J1aUBzdGFmZi5zaW5hLmNvbS5jblxyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE1LTA4LTI3XHJcbiAqIEByZXR1cm4gcmVzaXpl57G7XHJcbiAqIEBleGFtcGxlXHJcbiAqICBcdGNvbnN0IFJlc2l6ZSA9IHJlcXVpcmUoJ2xpYnV0aWwtcmVzaXplJyk7XHJcbiAqIFx0XHR2YXIgcmVzaXplID0gbmV3IFJlc2l6ZSgkKHdpbmRvdykpO1xyXG4gKiBcdFx0cmVzaXplLmxpc3Rlbih7Y2FsbDpmdW5jdGlvbigpe2NvbnNvbGUubG9nKCfnqpflj6NyZXNpemUnKTt9fSk7XHJcbiAqL1xyXG5cclxuY29uc3QgRGVsYXlldnQgPSByZXF1aXJlKCcuL2RlbGF5ZXZ0LmpzJyk7XHJcblxyXG5jbGFzcyBSZXNpemV7XHJcblx0LyoqXHJcblx0ICogQHBhcmFtIHtFbGVtZW50fSAqbm9kZSDlhYPntKDoioLngrlcclxuXHQgKiBAcGFyYW0ge0pTT059IGNvbmZpZyDlu7bov5/phY3nva7jgILlkIxldnQvZGVsYXlldnTnsbvnmoTliJ3lp4vljJblj4LmlbBcclxuXHQgKi9cclxuXHRjb25zdHJ1Y3Rvcihub2RlLGNvbmZpZyl7XHJcblx0XHRpZihub2RlLmxlbmd0aCA9PSAwKXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0dmFyIG9wdCA9ICQuZXh0ZW5kKHtcclxuXHRcdCAgICBldnRuYW1lOiAncmVzaXplJ1xyXG5cdFx0fSxjb25maWcpO1xyXG5cdFx0dGhpcy5kZWxheSA9IG5ldyBEZWxheWV2dChvcHQpO1xyXG5cdFx0bm9kZS5vbihvcHQuZXZ0bmFtZSwoKSA9PiB7XHJcblx0XHRcdHRoaXMuZGVsYXkuc3RhcnQoKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiDmt7vliqBzY3JvbGzkuovku7bnm5HlkKxcclxuICAgICAqIEBwYXJhbSB7SlNPTn0gb3B0XHJcbiAgICAgKiB7XHJcbiAgICAgKiAgIGNhbGw6IGZ1bmN0aW9uLy/kuovku7blj5HnlJ/ml7bop6blj5HnmoTlm57osINcclxuXHQgKiAgIGZpbHRlcjogZnVuY3Rpb24gLy/ov4fmu6TmnaHku7bjgIJmaWx0ZXLov5Tlm57kuLp0cnVl5YiZ5omN6Kem5Y+RY2FsbOOAguS4jeWhq+atpOmhueWImem7mOiupOS4jei/h+a7pFxyXG5cdCAqIH1cclxuICAgICAqL1xyXG5cdGxpc3RlbihvcHQpe1xyXG5cdFx0dGhpcy5kZWxheS5zdWJzY3JpYmUob3B0KTtcclxuXHR9XHJcblx0LyoqXHJcblx0ICog56e76Zmk55uR5ZCsXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0IOWSjOiwg+eUqGxpc3RlbuaXtuS4gOagt+eahOWPguaVsOW8leeUqFxyXG5cdCAqL1xyXG5cdHVubGlzdGVuKG9wdCl7XHJcblx0XHR0aGlzLmRlbGF5LnVuc3Vic2NyaWJlKG9wdCk7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJlc2l6ZTtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcg6K+75YaZ5o6n5Yi25Zmo4oCU4oCU5a+55LqO6K+75YaZ5byC5q2l5pON5L2c6L+b6KGM5o6n5Yi2XHJcbiAqIEB2ZXJzaW9uIDEuMCB8IDIwMTUtMDktMDcg54mI5pys5L+h5oGvXHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogQHJldHVybiDor7vlhpnmjqfliLblmajnsbtcclxuICogQGV4YW1wbGVcclxuICogKi9cclxuIGNvbnN0IFRvb2wgPSByZXF1aXJlKCcuL3Rvb2wuanMnKTtcclxuXHJcbiBjbGFzcyBSd2NvbnRyb2xsZXIge1xyXG5cdCBjb25zdHJ1Y3Rvcigpe1xyXG5cdFx0IHRoaXMucmVhZGxvY2sgPSBmYWxzZTsgLy/or7vplIFcclxuIFx0XHR0aGlzLndyaXRlbG9jayA9IGZhbHNlOyAvL+WGmemUgVxyXG4gXHRcdHRoaXMucXVldWUgPSBbXTsgLy/or7vlhpnmk43kvZznvJPlrZjpmJ/liJdcclxuXHQgfVxyXG5cdCAvKipcclxuIFx0ICog6I635Y+W5b2T5YmN5piv5ZCm5Y+v5Lul5omn6KGM6K+75pON5L2cXHJcbiBcdCAqL1xyXG5cdCByZWFkZW5hYmxlKCl7XHJcblx0XHRpZih0aGlzLndyaXRlbG9jayl7XHJcbiBcdFx0XHRyZXR1cm4gZmFsc2U7XHJcbiBcdFx0fVxyXG4gXHRcdHJldHVybiB0cnVlO1xyXG5cdCB9XHJcblx0IC8qKlxyXG4gXHQgKiDojrflj5blvZPliY3mmK/lkKblj6/ku6XmiafooYzlhpnmk43kvZxcclxuIFx0ICovXHJcblx0IHdyaXRlZW5hYmxlKCl7XHJcblx0XHRpZih0aGlzLndyaXRlbG9jayB8fCB0aGlzLnJlYWRsb2NrKXtcclxuIFx0XHRcdHJldHVybiBmYWxzZTtcclxuIFx0XHR9XHJcbiBcdFx0cmV0dXJuIHRydWU7XHJcblx0IH1cclxuXHQgLyoqXHJcbiBcdCAqIOaJp+ihjOivu+WGmeaTjeS9nOmYn+WIl1xyXG4gXHQgKi9cclxuIFx0IGV4ZWNxdWV1ZSgpe1xyXG5cdFx0IHdoaWxlKHRoaXMucXVldWUubGVuZ3RoID4gMCl7XHJcbiBcdFx0XHR2YXIgb2JqID0gdGhpcy5xdWV1ZS5zaGlmdCgpO1xyXG4gXHRcdFx0aWYob2JqLnR5cGUgPT0gJ3JlYWQnKXtcclxuIFx0XHRcdFx0dGhpcy5fZXhlY3JlYWQob2JqLmZ1bik7XHJcbiBcdFx0XHR9ZWxzZSBpZihvYmoudHlwZSA9PSAnd3JpdGUnKXtcclxuIFx0XHRcdFx0dGhpcy5fZXhlY3dyaXRlKG9iai5mdW4pO1xyXG4gXHRcdFx0fVxyXG4gXHRcdH1cclxuXHQgfVxyXG5cdCAvKipcclxuIFx0ICog56eB5pyJ4oCU4oCU5omn6KGM6K+75pON5L2cXHJcbiBcdCAqL1xyXG5cdCBfZXhlY3JlYWQoZnVuKXtcclxuXHRcdHRoaXMucmVhZGxvY2sgPSB0cnVlO1xyXG4gXHRcdGZ1bigpO1xyXG4gXHRcdHRoaXMucmVhZGxvY2sgPSBmYWxzZTtcclxuXHQgfVxyXG5cdCAvKipcclxuIFx0ICog56eB5pyJ4oCU4oCU5omn6KGM5YaZ5pON5L2cXHJcbiBcdCAqL1xyXG5cdCBfZXhlY3dyaXRlKGZ1bil7XHJcblx0XHR0aGlzLndyaXRlbG9jayA9IHRydWU7XHJcbiBcdFx0ZnVuKCk7XHJcbiBcdFx0dGhpcy53cml0ZWxvY2sgPSBmYWxzZTtcclxuXHQgfVxyXG5cdCAvKipcclxuIFx0ICog5byA5aeL6K+7XHJcbiAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gKmZ1biDor7vmk43kvZzlm57osIPlh73mlbBcclxuIFx0ICovXHJcblx0IHJlYWQoZnVuKXtcclxuXHRcdCBpZihUb29sLmlzRnVuY3Rpb24oZnVuKSl7XHJcbiBcdFx0XHRpZih0aGlzLnJlYWRlbmFibGUoKSl7XHJcbiBcdFx0XHRcdHRoaXMuX2V4ZWNyZWFkKGZ1bik7XHJcbiBcdFx0XHRcdHRoaXMuZXhlY3F1ZXVlKCk7XHJcbiBcdFx0XHR9ZWxzZXtcclxuIFx0XHRcdFx0dGhpcy5xdWV1ZS5wdXNoKHtcclxuIFx0XHRcdFx0XHR0eXBlOiAncmVhZCcsXHJcbiBcdFx0XHRcdFx0ZnVuOiBmdW5cclxuIFx0XHRcdFx0fSk7XHJcbiBcdFx0XHR9XHJcbiBcdFx0fVxyXG5cdCB9XHJcblx0IC8qKlxyXG4gXHQgKiDlvIDlp4vlhplcclxuICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSAqZnVuIOWGmeaTjeS9nOWbnuiwg+WHveaVsFxyXG4gXHQgKi9cclxuXHQgd3JpdGUoZnVuKXtcclxuXHRcdCBpZihUb29sLmlzRnVuY3Rpb24oZnVuKSl7XHJcbiBcdFx0XHRpZih0aGlzLndyaXRlZW5hYmxlKCkpe1xyXG4gXHRcdFx0XHR0aGlzLl9leGVjd3JpdGUoZnVuKTtcclxuIFx0XHRcdFx0dGhpcy5leGVjcXVldWUoKTtcclxuIFx0XHRcdH1lbHNle1xyXG4gXHRcdFx0XHR0aGlzLnF1ZXVlLnB1c2goe1xyXG4gXHRcdFx0XHRcdHR5cGU6ICd3cml0ZScsXHJcbiBcdFx0XHRcdFx0ZnVuOiBmdW5cclxuIFx0XHRcdFx0fSk7XHJcbiBcdFx0XHR9XHJcbiBcdFx0fVxyXG5cdCB9XHJcbiB9XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJ3Y29udHJvbGxlcjtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXdcclxuICogICDnu5nmjIflrprlhYPntKDliJvlu7pzY3JvbGzkuovku7bnm5HlkKznsbtcclxuICogQGF1dGhvciBtaW5ncnVpfCBtaW5ncnVpQHN0YWZmLnNpbmEuY29tLmNuXHJcbiAqIEB2ZXJzaW9uIDEuMCB8IDIwMTUtMDgtMjdcclxuICogQHJldHVybiBzY3JvbGznsbtcclxuICogQGV4YW1wbGVcclxuICogXHRcdGNvbnN0IFNjcm9sbCA9IHJlcXVpcmUoJ2xpYnV0aWwtc2Nyb2xsJyk7XHJcbiAqXHJcbiAqIFx0XHR2YXIgc2Nyb2xsID0gbmV3IFNjcm9sbCgkKHdpbmRvdykpO1xyXG4gKiBcdFx0c2Nyb2xsLmxpc3Rlbih7Y2FsbDpmdW5jdGlvbigpe2NvbnNvbGUubG9nKCfnqpflj6NzY3JvbGwnKTt9fSk7XHJcbiAqXHJcbiAqL1xyXG5cclxuY29uc3QgRGVsYXlldnQgPSByZXF1aXJlKCcuL2RlbGF5ZXZ0LmpzJyk7XHJcblxyXG5jbGFzcyBTY3JvbGx7XHJcblx0LyoqXHJcblx0ICogQHBhcmFtIHtFbGVtZW50fSAqbm9kZSDlhYPntKDoioLngrlcclxuXHQgKiBAcGFyYW0ge0pTT059IGNvbmZpZyDlu7bov5/phY3nva7jgILlkIxsaWJldnQvZGVsYXlldnTnsbvnmoTliJ3lp4vljJblj4LmlbBcclxuXHQgKi9cclxuXHRjb25zdHJ1Y3Rvcihub2RlLGNvbmZpZyl7XHJcblx0XHRpZihub2RlLmxlbmd0aCA9PSAwKXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5kZWxheSA9IG5ldyBEZWxheWV2dChjb25maWcpO1xyXG5cdFx0bm9kZS5vbignc2Nyb2xsJywoKSA9PiB7XHJcblx0XHRcdHRoaXMuZGVsYXkuc3RhcnQoKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiDmt7vliqBzY3JvbGzkuovku7bnm5HlkKxcclxuICAgICAqIEBwYXJhbSB7SlNPTn0gb3B0XHJcbiAgICAgKiB7XHJcbiAgICAgKiAgIGNhbGw6IGZ1bmN0aW9uLy/kuovku7blj5HnlJ/ml7bop6blj5HnmoTlm57osINcclxuXHQgKiAgIGZpbHRlcjogZnVuY3Rpb24gLy/ov4fmu6TmnaHku7bjgIJmaWx0ZXLov5Tlm57kuLp0cnVl5YiZ5omN6Kem5Y+RY2FsbOOAguS4jeWhq+atpOmhueWImem7mOiupOS4jei/h+a7pFxyXG5cdCAqIH1cclxuICAgICAqL1xyXG4gICAgbGlzdGVuKG9wdCl7XHJcblx0XHR0aGlzLmRlbGF5LnN1YnNjcmliZShvcHQpO1xyXG5cdH1cclxuXHQvKipcclxuXHQgKiDnp7vpmaTnm5HlkKxcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHQg5ZKM6LCD55SobGlzdGVu5pe25LiA5qC355qE5Y+C5pWw5byV55SoXHJcblx0ICovXHJcblx0dW5saXN0ZW4ob3B0KXtcclxuXHRcdHRoaXMuZGVsYXkudW5zdWJzY3JpYmUob3B0KTtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2Nyb2xsO1xyXG4iLCIvKipcclxuICog5bi455So5bCP5bel5YW3XHJcbiAqIEBhdXRob3IgWmhhbmcgTWluZ3J1aSB8IDU5MjA0NDU3M0BxcS5jb21cclxuICogdmFyIFRvb2wgPSByZXF1aXJlKCdsaWJ1dGlsLXRvb2wnKTtcclxuICovXHJcbmNvbnN0IFVybCA9IHJlcXVpcmUoJ3VybCcpO1xyXG5cclxuLyoqXHJcbiAqIGRhdGHmmK/lkKbmmK/ml6DmlYjlrZfmrrXjgILljbPmmK9udWxsfHVuZGVmaW5lZHwnJ1xyXG4qIEBwYXJhbSB7T2JqZWN0fSBkYXRhXHJcbiAqL1xyXG5leHBvcnRzLmlzSW52YWxpZCA9IGZ1bmN0aW9uKGRhdGEpe1xyXG5cdGlmKGRhdGEgPT0gbnVsbCB8fCBkYXRhID09ICcnKXtcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxuXHRyZXR1cm4gZmFsc2U7XHJcbn0sXHJcbi8qKlxyXG4gKiDmmK/lkKbmmK9PYmplY3Tlr7nosaHnmoTlrp7kvovvvIzpgJrluLjnlKjmnaXmo4DmtYtkYXRh5piv5ZCm5piv5LiA5Liq57qv55qESlNPTuWtl+auteaIlm5ldyBPYmplY3QoKVxyXG4qIEBwYXJhbSB7T2JqZWN0fSBkYXRhXHJcbiAqL1xyXG5leHBvcnRzLmlzT2JqZWN0ID0gZnVuY3Rpb24oZGF0YSl7XHJcblx0cmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChkYXRhKSA9PSAnW29iamVjdCBPYmplY3RdJyAmJiBkYXRhLmNvbnN0cnVjdG9yID09IE9iamVjdDtcclxufSxcclxuLyoqXHJcbiAqIOaVsOaNruexu+Wei+aYr+WQpuaYr29iamVjdOOAguS4jeS7heS7hemZkOS6juaYr+e6r+eahE9iamVjdOWunuS+i+WMlueahOWvueixoVxyXG4gKi9cclxuZXhwb3J0cy5pc09iamVjdFR5cGUgPSBmdW5jdGlvbihkYXRhKXtcclxuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZGF0YSkgPT0gJ1tvYmplY3QgT2JqZWN0XSc7XHJcbn0sXHJcbi8qKlxyXG4gKiDmmK/lkKbmmK9mdW5jdGlvblxyXG4qIEBwYXJhbSB7T2JqZWN0fSBkYXRhXHJcbiAqL1xyXG5leHBvcnRzLmlzRnVuY3Rpb24gPSBmdW5jdGlvbihkYXRhKXtcclxuXHRyZXR1cm4gdHlwZW9mIGRhdGEgPT0gJ2Z1bmN0aW9uJztcclxufSxcclxuLyoqXHJcbiAqIOaYr+WQpuaYr0FycmF5XHJcbiogQHBhcmFtIHtPYmplY3R9IGRhdGFcclxuICovXHJcbmV4cG9ydHMuaXNBcnJheSA9IGZ1bmN0aW9uKGRhdGEpe1xyXG5cdHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZGF0YSkgPT0gJ1tvYmplY3QgQXJyYXldJztcclxufSxcclxuLyoqXHJcbiAqIOaYr+WQpuaYr2Jvb2xlYW5cclxuKiBAcGFyYW0ge09iamVjdH0gZGF0YVxyXG4gKi9cclxuZXhwb3J0cy5pc0Jvb2xlYW4gPSBmdW5jdGlvbihkYXRhKXtcclxuXHRyZXR1cm4gdHlwZW9mIGRhdGEgPT0gJ2Jvb2xlYW4nO1xyXG59LFxyXG4vKipcclxuICog5piv5ZCm5pivU3RyaW5nXHJcbiogQHBhcmFtIHtPYmplY3R9IGRhdGFcclxuICovXHJcbmV4cG9ydHMuaXNTdHJpbmcgPSBmdW5jdGlvbihkYXRhKXtcclxuXHRyZXR1cm4gdHlwZW9mIGRhdGEgPT0gJ3N0cmluZyc7XHJcbn0sXHJcbi8qKlxyXG4gKiDmmK/lkKbmmK9OdW1iZXJcclxuKiBAcGFyYW0ge09iamVjdH0gZGF0YVxyXG4gKi9cclxuZXhwb3J0cy5pc051bWJlciA9IGZ1bmN0aW9uKGRhdGEpe1xyXG5cdHJldHVybiB0eXBlb2YgZGF0YSA9PSAnbnVtYmVyJztcclxufSxcclxuLyoqXHJcbiAqIOaYr+WQpuaYr+S4gOS4quacieaViOeahGpxdWVyeSBkb23lr7nosaFcclxuICogQHBhcmFtIHtPYmplY3R9IG5vZGVcclxuICovXHJcbmV4cG9ydHMuaXNWYWxpZEpxdWVyeURvbSA9IGZ1bmN0aW9uKG5vZGUpe1xyXG5cdHJldHVybiBub2RlICE9IG51bGwgJiYgdGhpcy5pc0Z1bmN0aW9uKG5vZGUuc2l6ZSkgJiYgbm9kZS5sZW5ndGggPiAwO1xyXG59XHJcblxyXG4vKipcclxuICog6Kej5p6QdXJsXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgdXJs5Zyw5Z2A77yM5LiN5aGr5YiZ5Y+WbG9jYXRpb24uaHJlZlxyXG4gKiBAcmV0dXJuIHtPYmplY3R9IHVybE9iamVjdCBodHRwczovL25vZGVqcy5vcmcvZGlzdC9sYXRlc3QtdjYueC9kb2NzL2FwaS91cmwuaHRtbCN1cmxfdXJsX3N0cmluZ3NfYW5kX3VybF9vYmplY3RzXHJcbiAqICBxdWVyeTog5aaC5p6c5rKh5pyJcXVlcnnvvIzliJnmmK97fVxyXG4gKi9cclxuZXhwb3J0cy51cmxwYXJzZSA9IGZ1bmN0aW9uKHVybCl7XHJcblx0dXJsID0gdXJsIHx8IGxvY2F0aW9uLmhyZWY7XHJcblxyXG5cdHJldHVybiBVcmwucGFyc2UodXJsLHRydWUpO1xyXG59XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3XHJcbiAqICAg55uR5ZCsd2luZG93IHJlc2l6ZeOAguWPquaUr+aMgVBDXHJcbiAqIEBhdXRob3IgbWluZ3J1aXwgbWluZ3J1aUBzdGFmZi5zaW5hLmNvbS5jblxyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE1LTA4LTI3XHJcbiAqIEBleGFtcGxlXHJcbiAqIFx0XHRjb25zdCBXaW5yZXNpemUgPSByZXF1aXJlKCdsaWJ1dGlsLXdpbnJlc2l6ZScpO1xyXG4gKlxyXG4gKiBcdFx0V2lucmVzaXplLmxpc3Rlbih7Y2FsbDpmdW5jdGlvbigpe2NvbnNvbGUubG9nKCfnqpflj6NyZXNpemUnKTt9fSk7XHJcbiAqL1xyXG5jb25zdCBSZXNpemUgPSByZXF1aXJlKCcuL3Jlc2l6ZS5qcycpLFxyXG5cdFx0RGV2aWNlZXZ0bmFtZSA9IHJlcXVpcmUoJy4vZGV2aWNlZXZ0bmFtZS5qcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBuZXcgUmVzaXplKCQod2luZG93KSx7XHJcblx0ZXZ0bmFtZTogRGV2aWNlZXZ0bmFtZSsnLmxpYidcclxufSk7XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3XHJcbiAqICAg56qX5Y+j5rua5Yqo5LqL5Lu255uR5ZCsXHJcbiAqIEBhdXRob3IgbWluZ3J1aXwgbWluZ3J1aUBzdGFmZi5zaW5hLmNvbS5jblxyXG4gKiBAdmVyc2lvbiAxLjAgfCAyMDE1LTA4LTI3XHJcbiAqIEByZXR1cm4g5rua5Yqo55uR5ZCs5a+56LGhXHJcbiAqIEBleGFtcGxlXHJcbiAqIFx0XHRjb25zdCBXaW5zY3JvbGwgPSByZXF1aXJlKCdsaWJ1dGlsLXdpbnNjcm9sbCcpO1xyXG4gKlxyXG4gKiBcdFx0V2luc2Nyb2xsLmxpc3Rlbih7Y2FsbDpmdW5jdGlvbigpe2NvbnNvbGUubG9nKCfnqpflj6NzY3JvbGwnKTt9fSk7XHJcbiAqL1xyXG5cclxuY29uc3QgU2Nyb2xsID0gcmVxdWlyZSgnLi9zY3JvbGwuanMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbmV3IFNjcm9sbCgkKHdpbmRvdykpO1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyDnur/nqIvmsaDmjqfliLblmahcclxuICogICAgICDotJ/otKPov5Tlm57lvZPliY3nqbrpl7LnmoTnur/nqIvlr7nosaFcclxuICogQHZlcnNpb24gMS4wIHwgMjAxNy0wMS0xOSDniYjmnKzkv6Hmga9cclxuICogQGF1dGhvciBaaGFuZyBNaW5ncnVpIHwgNTkyMDQ0NTczQHFxLmNvbVxyXG4gKiBAcmV0dXJuXHJcbiAqIEBleGFtcGxlXHJcbiAqICAgICAgY29uc3QgV29ya2VyQ29udHJvbCA9IHJlcXVpcmUoJ2xpYnV0aWwtd29ya2VyQ29udHJvbCcpO1xyXG4gKiAqL1xyXG5cclxuIGNsYXNzIFdvcmtlcntcclxuICAgICAvKipcclxuICAgICAgKiDkuIDkuKrnur/nqItcclxuICAgICAgKi9cclxuICAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgICB0aGlzLmxvY2sgPSB0cnVlO1xyXG4gICAgIH1cclxuIH1cclxuXHJcbiBjbGFzcyBXb3JrZXJDb250cm9sIHtcclxuICAgICAvKipcclxuICAgICAgKiDnur/nqIvmsaDmjqfliLblmajnsbtcclxuICAgICAgKiBAcmV0dXJuIHtbdHlwZV19IFtkZXNjcmlwdGlvbl1cclxuICAgICAgKi9cclxuICAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgICB0aGlzLl93b3JrZXJvYmpzID0gW107IC8vd29ya2VyQ29udHJvbOWvueixoVxyXG4gICAgIH1cclxuICAgICAvKipcclxuICAgICAgKiDov5Tlm57lvZPliY3nqbrpl7LnmoR3b3JrZXJDb250cm9s5a+56LGhXHJcbiAgICAgICogQHJldHVybiB7W3R5cGVdfSBbZGVzY3JpcHRpb25dXHJcbiAgICAgICovXHJcbiAgICAgZ2V0KCl7XHJcbiAgICAgICAgIHZhciBjdXJ3b3JrZXIgPSBudWxsO1xyXG4gICAgICAgICBmb3IodmFyIGkgPSAwLCBsZW4gPSB0aGlzLl93b3JrZXJvYmpzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcclxuICAgICAgICAgICAgIGlmKHRoaXMuX3dvcmtlcm9ianNbaV0ubG9jayA9PSBmYWxzZSl7IC8v5pei5peg6K+35rGC5Y+I5rKh5pyJ6KKr6ZSB5a6aXHJcbiAgICAgICAgICAgICAgICAgdGhpcy5fd29ya2Vyb2Jqc1tpXS5sb2NrID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICBjdXJ3b3JrZXIgPSB0aGlzLl93b3JrZXJvYmpzW2ldO1xyXG4gICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgfVxyXG4gICAgICAgICB9XHJcbiAgICAgICAgIGlmKGN1cndvcmtlciA9PSBudWxsKXtcclxuICAgICAgICAgICAgIGN1cndvcmtlciA9IG5ldyBXb3JrZXIoKTtcclxuICAgICAgICAgICAgIHRoaXMuX3dvcmtlcm9ianMucHVzaChjdXJ3b3JrZXIpO1xyXG4gICAgICAgICB9XHJcbiAgICAgICAgIHJldHVybiBjdXJ3b3JrZXI7XHJcbiAgICAgfVxyXG4gICAgIC8qKlxyXG4gICAgICAqIOmAmuefpeW9k+WJjXdvcmtlckNvbnRyb2zlr7nosaHlt7Lnu4/kvb/nlKjlrozmr5VcclxuICAgICAgKiBAcGFyYW0ge2luc3RhbmNlIG9mIHdvcmtlckNvbnRyb2x9IHdvcmtlciDlpoLmnpzmj5DkvpvkuoZ3b3JrZXLvvIzliJnnu5PmnZ/mraTnur/nqIvvvJvlpoLmnpzmsqHmj5DkvpvvvIzliJnnu5PmnZ/nrKzkuIDkuKrmraPlnKjkvb/nlKjnmoTnur/nqItcclxuICAgICAgKiBAcmV0dXJuIHtpbnN0YW5jZSBvZiB3b3JrZXJDb250cm9sIHwgbnVsbH0g5b2T5YmN57uT5p2f55qE57q/56iL5a+56LGhLuayoeacieWImeS4um51bGxcclxuICAgICAgKi9cclxuICAgICBlbmQod29ya2VyKXtcclxuICAgICAgICAgdmFyIGN1cndvcmtlciA9IG51bGw7XHJcbiAgICAgICAgIGZvcih2YXIgaSA9IDAsIGxlbiA9IHRoaXMuX3dvcmtlcm9ianMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xyXG4gICAgICAgICAgICAgaWYod29ya2VyKXtcclxuICAgICAgICAgICAgICAgICBpZih0aGlzLl93b3JrZXJvYmpzW2ldID09IHdvcmtlcil7IC8v5pei5peg6K+35rGC5Y+I5rKh5pyJ6KKr6ZSB5a6aXHJcbiAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3dvcmtlcm9ianNbaV0ubG9jayA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICBjdXJ3b3JrZXIgPSB0aGlzLl93b3JrZXJvYmpzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICBpZih0aGlzLl93b3JrZXJvYmpzW2ldLmxvY2sgPT0gdHJ1ZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3dvcmtlcm9ianNbaV0ubG9jayA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICBjdXJ3b3JrZXIgPSB0aGlzLl93b3JrZXJvYmpzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICB9XHJcbiAgICAgICAgIH1cclxuICAgICAgICAgcmV0dXJuIGN1cndvcmtlcjtcclxuICAgICB9XHJcbiAgICAgLyoqXHJcbiAgICAgICog5piv5ZCm5omA5pyJ55qE57q/56iL6YO96KKr5L2/55So5a6M5q+VXHJcbiAgICAgICogQHJldHVybiB7Qm9vbGVhbn0gdHJ1Ze+8muaJgOaciee6v+eoi+mDveepuumXslxyXG4gICAgICAqL1xyXG4gICAgIGlzZW5kKCl7XHJcbiAgICAgICAgIHZhciByZXN1bHQgPSB0cnVlO1xyXG4gICAgICAgICBmb3IodmFyIGkgPSAwLCBsZW4gPSB0aGlzLl93b3JrZXJvYmpzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcclxuICAgICAgICAgICAgIGlmKHRoaXMuX3dvcmtlcm9ianNbaV0ubG9jayA9PSB0cnVlKXsgLy/ml6Lml6Dor7fmsYLlj4jmsqHmnInooqvplIHlrppcclxuICAgICAgICAgICAgICAgICByZXN1bHQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgIH1cclxuICAgICAgICAgfVxyXG4gICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgIH1cclxuIH1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gV29ya2VyQ29udHJvbDtcclxuIiwiLyohIGh0dHBzOi8vbXRocy5iZS9wdW55Y29kZSB2MS40LjEgYnkgQG1hdGhpYXMgKi9cbjsoZnVuY3Rpb24ocm9vdCkge1xuXG5cdC8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZXMgKi9cblx0dmFyIGZyZWVFeHBvcnRzID0gdHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0cyAmJlxuXHRcdCFleHBvcnRzLm5vZGVUeXBlICYmIGV4cG9ydHM7XG5cdHZhciBmcmVlTW9kdWxlID0gdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiZcblx0XHQhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZTtcblx0dmFyIGZyZWVHbG9iYWwgPSB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbDtcblx0aWYgKFxuXHRcdGZyZWVHbG9iYWwuZ2xvYmFsID09PSBmcmVlR2xvYmFsIHx8XG5cdFx0ZnJlZUdsb2JhbC53aW5kb3cgPT09IGZyZWVHbG9iYWwgfHxcblx0XHRmcmVlR2xvYmFsLnNlbGYgPT09IGZyZWVHbG9iYWxcblx0KSB7XG5cdFx0cm9vdCA9IGZyZWVHbG9iYWw7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGBwdW55Y29kZWAgb2JqZWN0LlxuXHQgKiBAbmFtZSBwdW55Y29kZVxuXHQgKiBAdHlwZSBPYmplY3Rcblx0ICovXG5cdHZhciBwdW55Y29kZSxcblxuXHQvKiogSGlnaGVzdCBwb3NpdGl2ZSBzaWduZWQgMzItYml0IGZsb2F0IHZhbHVlICovXG5cdG1heEludCA9IDIxNDc0ODM2NDcsIC8vIGFrYS4gMHg3RkZGRkZGRiBvciAyXjMxLTFcblxuXHQvKiogQm9vdHN0cmluZyBwYXJhbWV0ZXJzICovXG5cdGJhc2UgPSAzNixcblx0dE1pbiA9IDEsXG5cdHRNYXggPSAyNixcblx0c2tldyA9IDM4LFxuXHRkYW1wID0gNzAwLFxuXHRpbml0aWFsQmlhcyA9IDcyLFxuXHRpbml0aWFsTiA9IDEyOCwgLy8gMHg4MFxuXHRkZWxpbWl0ZXIgPSAnLScsIC8vICdcXHgyRCdcblxuXHQvKiogUmVndWxhciBleHByZXNzaW9ucyAqL1xuXHRyZWdleFB1bnljb2RlID0gL154bi0tLyxcblx0cmVnZXhOb25BU0NJSSA9IC9bXlxceDIwLVxceDdFXS8sIC8vIHVucHJpbnRhYmxlIEFTQ0lJIGNoYXJzICsgbm9uLUFTQ0lJIGNoYXJzXG5cdHJlZ2V4U2VwYXJhdG9ycyA9IC9bXFx4MkVcXHUzMDAyXFx1RkYwRVxcdUZGNjFdL2csIC8vIFJGQyAzNDkwIHNlcGFyYXRvcnNcblxuXHQvKiogRXJyb3IgbWVzc2FnZXMgKi9cblx0ZXJyb3JzID0ge1xuXHRcdCdvdmVyZmxvdyc6ICdPdmVyZmxvdzogaW5wdXQgbmVlZHMgd2lkZXIgaW50ZWdlcnMgdG8gcHJvY2VzcycsXG5cdFx0J25vdC1iYXNpYyc6ICdJbGxlZ2FsIGlucHV0ID49IDB4ODAgKG5vdCBhIGJhc2ljIGNvZGUgcG9pbnQpJyxcblx0XHQnaW52YWxpZC1pbnB1dCc6ICdJbnZhbGlkIGlucHV0J1xuXHR9LFxuXG5cdC8qKiBDb252ZW5pZW5jZSBzaG9ydGN1dHMgKi9cblx0YmFzZU1pbnVzVE1pbiA9IGJhc2UgLSB0TWluLFxuXHRmbG9vciA9IE1hdGguZmxvb3IsXG5cdHN0cmluZ0Zyb21DaGFyQ29kZSA9IFN0cmluZy5mcm9tQ2hhckNvZGUsXG5cblx0LyoqIFRlbXBvcmFyeSB2YXJpYWJsZSAqL1xuXHRrZXk7XG5cblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblx0LyoqXG5cdCAqIEEgZ2VuZXJpYyBlcnJvciB1dGlsaXR5IGZ1bmN0aW9uLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gdHlwZSBUaGUgZXJyb3IgdHlwZS5cblx0ICogQHJldHVybnMge0Vycm9yfSBUaHJvd3MgYSBgUmFuZ2VFcnJvcmAgd2l0aCB0aGUgYXBwbGljYWJsZSBlcnJvciBtZXNzYWdlLlxuXHQgKi9cblx0ZnVuY3Rpb24gZXJyb3IodHlwZSkge1xuXHRcdHRocm93IG5ldyBSYW5nZUVycm9yKGVycm9yc1t0eXBlXSk7XG5cdH1cblxuXHQvKipcblx0ICogQSBnZW5lcmljIGBBcnJheSNtYXBgIHV0aWxpdHkgZnVuY3Rpb24uXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0aGF0IGdldHMgY2FsbGVkIGZvciBldmVyeSBhcnJheVxuXHQgKiBpdGVtLlxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IEEgbmV3IGFycmF5IG9mIHZhbHVlcyByZXR1cm5lZCBieSB0aGUgY2FsbGJhY2sgZnVuY3Rpb24uXG5cdCAqL1xuXHRmdW5jdGlvbiBtYXAoYXJyYXksIGZuKSB7XG5cdFx0dmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcblx0XHR2YXIgcmVzdWx0ID0gW107XG5cdFx0d2hpbGUgKGxlbmd0aC0tKSB7XG5cdFx0XHRyZXN1bHRbbGVuZ3RoXSA9IGZuKGFycmF5W2xlbmd0aF0pO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0LyoqXG5cdCAqIEEgc2ltcGxlIGBBcnJheSNtYXBgLWxpa2Ugd3JhcHBlciB0byB3b3JrIHdpdGggZG9tYWluIG5hbWUgc3RyaW5ncyBvciBlbWFpbFxuXHQgKiBhZGRyZXNzZXMuXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBkb21haW4gVGhlIGRvbWFpbiBuYW1lIG9yIGVtYWlsIGFkZHJlc3MuXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0aGF0IGdldHMgY2FsbGVkIGZvciBldmVyeVxuXHQgKiBjaGFyYWN0ZXIuXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gQSBuZXcgc3RyaW5nIG9mIGNoYXJhY3RlcnMgcmV0dXJuZWQgYnkgdGhlIGNhbGxiYWNrXG5cdCAqIGZ1bmN0aW9uLlxuXHQgKi9cblx0ZnVuY3Rpb24gbWFwRG9tYWluKHN0cmluZywgZm4pIHtcblx0XHR2YXIgcGFydHMgPSBzdHJpbmcuc3BsaXQoJ0AnKTtcblx0XHR2YXIgcmVzdWx0ID0gJyc7XG5cdFx0aWYgKHBhcnRzLmxlbmd0aCA+IDEpIHtcblx0XHRcdC8vIEluIGVtYWlsIGFkZHJlc3Nlcywgb25seSB0aGUgZG9tYWluIG5hbWUgc2hvdWxkIGJlIHB1bnljb2RlZC4gTGVhdmVcblx0XHRcdC8vIHRoZSBsb2NhbCBwYXJ0IChpLmUuIGV2ZXJ5dGhpbmcgdXAgdG8gYEBgKSBpbnRhY3QuXG5cdFx0XHRyZXN1bHQgPSBwYXJ0c1swXSArICdAJztcblx0XHRcdHN0cmluZyA9IHBhcnRzWzFdO1xuXHRcdH1cblx0XHQvLyBBdm9pZCBgc3BsaXQocmVnZXgpYCBmb3IgSUU4IGNvbXBhdGliaWxpdHkuIFNlZSAjMTcuXG5cdFx0c3RyaW5nID0gc3RyaW5nLnJlcGxhY2UocmVnZXhTZXBhcmF0b3JzLCAnXFx4MkUnKTtcblx0XHR2YXIgbGFiZWxzID0gc3RyaW5nLnNwbGl0KCcuJyk7XG5cdFx0dmFyIGVuY29kZWQgPSBtYXAobGFiZWxzLCBmbikuam9pbignLicpO1xuXHRcdHJldHVybiByZXN1bHQgKyBlbmNvZGVkO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYW4gYXJyYXkgY29udGFpbmluZyB0aGUgbnVtZXJpYyBjb2RlIHBvaW50cyBvZiBlYWNoIFVuaWNvZGVcblx0ICogY2hhcmFjdGVyIGluIHRoZSBzdHJpbmcuIFdoaWxlIEphdmFTY3JpcHQgdXNlcyBVQ1MtMiBpbnRlcm5hbGx5LFxuXHQgKiB0aGlzIGZ1bmN0aW9uIHdpbGwgY29udmVydCBhIHBhaXIgb2Ygc3Vycm9nYXRlIGhhbHZlcyAoZWFjaCBvZiB3aGljaFxuXHQgKiBVQ1MtMiBleHBvc2VzIGFzIHNlcGFyYXRlIGNoYXJhY3RlcnMpIGludG8gYSBzaW5nbGUgY29kZSBwb2ludCxcblx0ICogbWF0Y2hpbmcgVVRGLTE2LlxuXHQgKiBAc2VlIGBwdW55Y29kZS51Y3MyLmVuY29kZWBcblx0ICogQHNlZSA8aHR0cHM6Ly9tYXRoaWFzYnluZW5zLmJlL25vdGVzL2phdmFzY3JpcHQtZW5jb2Rpbmc+XG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZS51Y3MyXG5cdCAqIEBuYW1lIGRlY29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gc3RyaW5nIFRoZSBVbmljb2RlIGlucHV0IHN0cmluZyAoVUNTLTIpLlxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IFRoZSBuZXcgYXJyYXkgb2YgY29kZSBwb2ludHMuXG5cdCAqL1xuXHRmdW5jdGlvbiB1Y3MyZGVjb2RlKHN0cmluZykge1xuXHRcdHZhciBvdXRwdXQgPSBbXSxcblx0XHQgICAgY291bnRlciA9IDAsXG5cdFx0ICAgIGxlbmd0aCA9IHN0cmluZy5sZW5ndGgsXG5cdFx0ICAgIHZhbHVlLFxuXHRcdCAgICBleHRyYTtcblx0XHR3aGlsZSAoY291bnRlciA8IGxlbmd0aCkge1xuXHRcdFx0dmFsdWUgPSBzdHJpbmcuY2hhckNvZGVBdChjb3VudGVyKyspO1xuXHRcdFx0aWYgKHZhbHVlID49IDB4RDgwMCAmJiB2YWx1ZSA8PSAweERCRkYgJiYgY291bnRlciA8IGxlbmd0aCkge1xuXHRcdFx0XHQvLyBoaWdoIHN1cnJvZ2F0ZSwgYW5kIHRoZXJlIGlzIGEgbmV4dCBjaGFyYWN0ZXJcblx0XHRcdFx0ZXh0cmEgPSBzdHJpbmcuY2hhckNvZGVBdChjb3VudGVyKyspO1xuXHRcdFx0XHRpZiAoKGV4dHJhICYgMHhGQzAwKSA9PSAweERDMDApIHsgLy8gbG93IHN1cnJvZ2F0ZVxuXHRcdFx0XHRcdG91dHB1dC5wdXNoKCgodmFsdWUgJiAweDNGRikgPDwgMTApICsgKGV4dHJhICYgMHgzRkYpICsgMHgxMDAwMCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gdW5tYXRjaGVkIHN1cnJvZ2F0ZTsgb25seSBhcHBlbmQgdGhpcyBjb2RlIHVuaXQsIGluIGNhc2UgdGhlIG5leHRcblx0XHRcdFx0XHQvLyBjb2RlIHVuaXQgaXMgdGhlIGhpZ2ggc3Vycm9nYXRlIG9mIGEgc3Vycm9nYXRlIHBhaXJcblx0XHRcdFx0XHRvdXRwdXQucHVzaCh2YWx1ZSk7XG5cdFx0XHRcdFx0Y291bnRlci0tO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvdXRwdXQucHVzaCh2YWx1ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBvdXRwdXQ7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHN0cmluZyBiYXNlZCBvbiBhbiBhcnJheSBvZiBudW1lcmljIGNvZGUgcG9pbnRzLlxuXHQgKiBAc2VlIGBwdW55Y29kZS51Y3MyLmRlY29kZWBcblx0ICogQG1lbWJlck9mIHB1bnljb2RlLnVjczJcblx0ICogQG5hbWUgZW5jb2RlXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGNvZGVQb2ludHMgVGhlIGFycmF5IG9mIG51bWVyaWMgY29kZSBwb2ludHMuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBuZXcgVW5pY29kZSBzdHJpbmcgKFVDUy0yKS5cblx0ICovXG5cdGZ1bmN0aW9uIHVjczJlbmNvZGUoYXJyYXkpIHtcblx0XHRyZXR1cm4gbWFwKGFycmF5LCBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0dmFyIG91dHB1dCA9ICcnO1xuXHRcdFx0aWYgKHZhbHVlID4gMHhGRkZGKSB7XG5cdFx0XHRcdHZhbHVlIC09IDB4MTAwMDA7XG5cdFx0XHRcdG91dHB1dCArPSBzdHJpbmdGcm9tQ2hhckNvZGUodmFsdWUgPj4+IDEwICYgMHgzRkYgfCAweEQ4MDApO1xuXHRcdFx0XHR2YWx1ZSA9IDB4REMwMCB8IHZhbHVlICYgMHgzRkY7XG5cdFx0XHR9XG5cdFx0XHRvdXRwdXQgKz0gc3RyaW5nRnJvbUNoYXJDb2RlKHZhbHVlKTtcblx0XHRcdHJldHVybiBvdXRwdXQ7XG5cdFx0fSkuam9pbignJyk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBiYXNpYyBjb2RlIHBvaW50IGludG8gYSBkaWdpdC9pbnRlZ2VyLlxuXHQgKiBAc2VlIGBkaWdpdFRvQmFzaWMoKWBcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGNvZGVQb2ludCBUaGUgYmFzaWMgbnVtZXJpYyBjb2RlIHBvaW50IHZhbHVlLlxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgbnVtZXJpYyB2YWx1ZSBvZiBhIGJhc2ljIGNvZGUgcG9pbnQgKGZvciB1c2UgaW5cblx0ICogcmVwcmVzZW50aW5nIGludGVnZXJzKSBpbiB0aGUgcmFuZ2UgYDBgIHRvIGBiYXNlIC0gMWAsIG9yIGBiYXNlYCBpZlxuXHQgKiB0aGUgY29kZSBwb2ludCBkb2VzIG5vdCByZXByZXNlbnQgYSB2YWx1ZS5cblx0ICovXG5cdGZ1bmN0aW9uIGJhc2ljVG9EaWdpdChjb2RlUG9pbnQpIHtcblx0XHRpZiAoY29kZVBvaW50IC0gNDggPCAxMCkge1xuXHRcdFx0cmV0dXJuIGNvZGVQb2ludCAtIDIyO1xuXHRcdH1cblx0XHRpZiAoY29kZVBvaW50IC0gNjUgPCAyNikge1xuXHRcdFx0cmV0dXJuIGNvZGVQb2ludCAtIDY1O1xuXHRcdH1cblx0XHRpZiAoY29kZVBvaW50IC0gOTcgPCAyNikge1xuXHRcdFx0cmV0dXJuIGNvZGVQb2ludCAtIDk3O1xuXHRcdH1cblx0XHRyZXR1cm4gYmFzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIGRpZ2l0L2ludGVnZXIgaW50byBhIGJhc2ljIGNvZGUgcG9pbnQuXG5cdCAqIEBzZWUgYGJhc2ljVG9EaWdpdCgpYFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge051bWJlcn0gZGlnaXQgVGhlIG51bWVyaWMgdmFsdWUgb2YgYSBiYXNpYyBjb2RlIHBvaW50LlxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgYmFzaWMgY29kZSBwb2ludCB3aG9zZSB2YWx1ZSAod2hlbiB1c2VkIGZvclxuXHQgKiByZXByZXNlbnRpbmcgaW50ZWdlcnMpIGlzIGBkaWdpdGAsIHdoaWNoIG5lZWRzIHRvIGJlIGluIHRoZSByYW5nZVxuXHQgKiBgMGAgdG8gYGJhc2UgLSAxYC4gSWYgYGZsYWdgIGlzIG5vbi16ZXJvLCB0aGUgdXBwZXJjYXNlIGZvcm0gaXNcblx0ICogdXNlZDsgZWxzZSwgdGhlIGxvd2VyY2FzZSBmb3JtIGlzIHVzZWQuIFRoZSBiZWhhdmlvciBpcyB1bmRlZmluZWRcblx0ICogaWYgYGZsYWdgIGlzIG5vbi16ZXJvIGFuZCBgZGlnaXRgIGhhcyBubyB1cHBlcmNhc2UgZm9ybS5cblx0ICovXG5cdGZ1bmN0aW9uIGRpZ2l0VG9CYXNpYyhkaWdpdCwgZmxhZykge1xuXHRcdC8vICAwLi4yNSBtYXAgdG8gQVNDSUkgYS4ueiBvciBBLi5aXG5cdFx0Ly8gMjYuLjM1IG1hcCB0byBBU0NJSSAwLi45XG5cdFx0cmV0dXJuIGRpZ2l0ICsgMjIgKyA3NSAqIChkaWdpdCA8IDI2KSAtICgoZmxhZyAhPSAwKSA8PCA1KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBCaWFzIGFkYXB0YXRpb24gZnVuY3Rpb24gYXMgcGVyIHNlY3Rpb24gMy40IG9mIFJGQyAzNDkyLlxuXHQgKiBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzQ5MiNzZWN0aW9uLTMuNFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0ZnVuY3Rpb24gYWRhcHQoZGVsdGEsIG51bVBvaW50cywgZmlyc3RUaW1lKSB7XG5cdFx0dmFyIGsgPSAwO1xuXHRcdGRlbHRhID0gZmlyc3RUaW1lID8gZmxvb3IoZGVsdGEgLyBkYW1wKSA6IGRlbHRhID4+IDE7XG5cdFx0ZGVsdGEgKz0gZmxvb3IoZGVsdGEgLyBudW1Qb2ludHMpO1xuXHRcdGZvciAoLyogbm8gaW5pdGlhbGl6YXRpb24gKi87IGRlbHRhID4gYmFzZU1pbnVzVE1pbiAqIHRNYXggPj4gMTsgayArPSBiYXNlKSB7XG5cdFx0XHRkZWx0YSA9IGZsb29yKGRlbHRhIC8gYmFzZU1pbnVzVE1pbik7XG5cdFx0fVxuXHRcdHJldHVybiBmbG9vcihrICsgKGJhc2VNaW51c1RNaW4gKyAxKSAqIGRlbHRhIC8gKGRlbHRhICsgc2tldykpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgUHVueWNvZGUgc3RyaW5nIG9mIEFTQ0lJLW9ubHkgc3ltYm9scyB0byBhIHN0cmluZyBvZiBVbmljb2RlXG5cdCAqIHN5bWJvbHMuXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIFB1bnljb2RlIHN0cmluZyBvZiBBU0NJSS1vbmx5IHN5bWJvbHMuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSByZXN1bHRpbmcgc3RyaW5nIG9mIFVuaWNvZGUgc3ltYm9scy5cblx0ICovXG5cdGZ1bmN0aW9uIGRlY29kZShpbnB1dCkge1xuXHRcdC8vIERvbid0IHVzZSBVQ1MtMlxuXHRcdHZhciBvdXRwdXQgPSBbXSxcblx0XHQgICAgaW5wdXRMZW5ndGggPSBpbnB1dC5sZW5ndGgsXG5cdFx0ICAgIG91dCxcblx0XHQgICAgaSA9IDAsXG5cdFx0ICAgIG4gPSBpbml0aWFsTixcblx0XHQgICAgYmlhcyA9IGluaXRpYWxCaWFzLFxuXHRcdCAgICBiYXNpYyxcblx0XHQgICAgaixcblx0XHQgICAgaW5kZXgsXG5cdFx0ICAgIG9sZGksXG5cdFx0ICAgIHcsXG5cdFx0ICAgIGssXG5cdFx0ICAgIGRpZ2l0LFxuXHRcdCAgICB0LFxuXHRcdCAgICAvKiogQ2FjaGVkIGNhbGN1bGF0aW9uIHJlc3VsdHMgKi9cblx0XHQgICAgYmFzZU1pbnVzVDtcblxuXHRcdC8vIEhhbmRsZSB0aGUgYmFzaWMgY29kZSBwb2ludHM6IGxldCBgYmFzaWNgIGJlIHRoZSBudW1iZXIgb2YgaW5wdXQgY29kZVxuXHRcdC8vIHBvaW50cyBiZWZvcmUgdGhlIGxhc3QgZGVsaW1pdGVyLCBvciBgMGAgaWYgdGhlcmUgaXMgbm9uZSwgdGhlbiBjb3B5XG5cdFx0Ly8gdGhlIGZpcnN0IGJhc2ljIGNvZGUgcG9pbnRzIHRvIHRoZSBvdXRwdXQuXG5cblx0XHRiYXNpYyA9IGlucHV0Lmxhc3RJbmRleE9mKGRlbGltaXRlcik7XG5cdFx0aWYgKGJhc2ljIDwgMCkge1xuXHRcdFx0YmFzaWMgPSAwO1xuXHRcdH1cblxuXHRcdGZvciAoaiA9IDA7IGogPCBiYXNpYzsgKytqKSB7XG5cdFx0XHQvLyBpZiBpdCdzIG5vdCBhIGJhc2ljIGNvZGUgcG9pbnRcblx0XHRcdGlmIChpbnB1dC5jaGFyQ29kZUF0KGopID49IDB4ODApIHtcblx0XHRcdFx0ZXJyb3IoJ25vdC1iYXNpYycpO1xuXHRcdFx0fVxuXHRcdFx0b3V0cHV0LnB1c2goaW5wdXQuY2hhckNvZGVBdChqKSk7XG5cdFx0fVxuXG5cdFx0Ly8gTWFpbiBkZWNvZGluZyBsb29wOiBzdGFydCBqdXN0IGFmdGVyIHRoZSBsYXN0IGRlbGltaXRlciBpZiBhbnkgYmFzaWMgY29kZVxuXHRcdC8vIHBvaW50cyB3ZXJlIGNvcGllZDsgc3RhcnQgYXQgdGhlIGJlZ2lubmluZyBvdGhlcndpc2UuXG5cblx0XHRmb3IgKGluZGV4ID0gYmFzaWMgPiAwID8gYmFzaWMgKyAxIDogMDsgaW5kZXggPCBpbnB1dExlbmd0aDsgLyogbm8gZmluYWwgZXhwcmVzc2lvbiAqLykge1xuXG5cdFx0XHQvLyBgaW5kZXhgIGlzIHRoZSBpbmRleCBvZiB0aGUgbmV4dCBjaGFyYWN0ZXIgdG8gYmUgY29uc3VtZWQuXG5cdFx0XHQvLyBEZWNvZGUgYSBnZW5lcmFsaXplZCB2YXJpYWJsZS1sZW5ndGggaW50ZWdlciBpbnRvIGBkZWx0YWAsXG5cdFx0XHQvLyB3aGljaCBnZXRzIGFkZGVkIHRvIGBpYC4gVGhlIG92ZXJmbG93IGNoZWNraW5nIGlzIGVhc2llclxuXHRcdFx0Ly8gaWYgd2UgaW5jcmVhc2UgYGlgIGFzIHdlIGdvLCB0aGVuIHN1YnRyYWN0IG9mZiBpdHMgc3RhcnRpbmdcblx0XHRcdC8vIHZhbHVlIGF0IHRoZSBlbmQgdG8gb2J0YWluIGBkZWx0YWAuXG5cdFx0XHRmb3IgKG9sZGkgPSBpLCB3ID0gMSwgayA9IGJhc2U7IC8qIG5vIGNvbmRpdGlvbiAqLzsgayArPSBiYXNlKSB7XG5cblx0XHRcdFx0aWYgKGluZGV4ID49IGlucHV0TGVuZ3RoKSB7XG5cdFx0XHRcdFx0ZXJyb3IoJ2ludmFsaWQtaW5wdXQnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGRpZ2l0ID0gYmFzaWNUb0RpZ2l0KGlucHV0LmNoYXJDb2RlQXQoaW5kZXgrKykpO1xuXG5cdFx0XHRcdGlmIChkaWdpdCA+PSBiYXNlIHx8IGRpZ2l0ID4gZmxvb3IoKG1heEludCAtIGkpIC8gdykpIHtcblx0XHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGkgKz0gZGlnaXQgKiB3O1xuXHRcdFx0XHR0ID0gayA8PSBiaWFzID8gdE1pbiA6IChrID49IGJpYXMgKyB0TWF4ID8gdE1heCA6IGsgLSBiaWFzKTtcblxuXHRcdFx0XHRpZiAoZGlnaXQgPCB0KSB7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRiYXNlTWludXNUID0gYmFzZSAtIHQ7XG5cdFx0XHRcdGlmICh3ID4gZmxvb3IobWF4SW50IC8gYmFzZU1pbnVzVCkpIHtcblx0XHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHcgKj0gYmFzZU1pbnVzVDtcblxuXHRcdFx0fVxuXG5cdFx0XHRvdXQgPSBvdXRwdXQubGVuZ3RoICsgMTtcblx0XHRcdGJpYXMgPSBhZGFwdChpIC0gb2xkaSwgb3V0LCBvbGRpID09IDApO1xuXG5cdFx0XHQvLyBgaWAgd2FzIHN1cHBvc2VkIHRvIHdyYXAgYXJvdW5kIGZyb20gYG91dGAgdG8gYDBgLFxuXHRcdFx0Ly8gaW5jcmVtZW50aW5nIGBuYCBlYWNoIHRpbWUsIHNvIHdlJ2xsIGZpeCB0aGF0IG5vdzpcblx0XHRcdGlmIChmbG9vcihpIC8gb3V0KSA+IG1heEludCAtIG4pIHtcblx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHR9XG5cblx0XHRcdG4gKz0gZmxvb3IoaSAvIG91dCk7XG5cdFx0XHRpICU9IG91dDtcblxuXHRcdFx0Ly8gSW5zZXJ0IGBuYCBhdCBwb3NpdGlvbiBgaWAgb2YgdGhlIG91dHB1dFxuXHRcdFx0b3V0cHV0LnNwbGljZShpKyssIDAsIG4pO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHVjczJlbmNvZGUob3V0cHV0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIHN0cmluZyBvZiBVbmljb2RlIHN5bWJvbHMgKGUuZy4gYSBkb21haW4gbmFtZSBsYWJlbCkgdG8gYVxuXHQgKiBQdW55Y29kZSBzdHJpbmcgb2YgQVNDSUktb25seSBzeW1ib2xzLlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGlucHV0IFRoZSBzdHJpbmcgb2YgVW5pY29kZSBzeW1ib2xzLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgcmVzdWx0aW5nIFB1bnljb2RlIHN0cmluZyBvZiBBU0NJSS1vbmx5IHN5bWJvbHMuXG5cdCAqL1xuXHRmdW5jdGlvbiBlbmNvZGUoaW5wdXQpIHtcblx0XHR2YXIgbixcblx0XHQgICAgZGVsdGEsXG5cdFx0ICAgIGhhbmRsZWRDUENvdW50LFxuXHRcdCAgICBiYXNpY0xlbmd0aCxcblx0XHQgICAgYmlhcyxcblx0XHQgICAgaixcblx0XHQgICAgbSxcblx0XHQgICAgcSxcblx0XHQgICAgayxcblx0XHQgICAgdCxcblx0XHQgICAgY3VycmVudFZhbHVlLFxuXHRcdCAgICBvdXRwdXQgPSBbXSxcblx0XHQgICAgLyoqIGBpbnB1dExlbmd0aGAgd2lsbCBob2xkIHRoZSBudW1iZXIgb2YgY29kZSBwb2ludHMgaW4gYGlucHV0YC4gKi9cblx0XHQgICAgaW5wdXRMZW5ndGgsXG5cdFx0ICAgIC8qKiBDYWNoZWQgY2FsY3VsYXRpb24gcmVzdWx0cyAqL1xuXHRcdCAgICBoYW5kbGVkQ1BDb3VudFBsdXNPbmUsXG5cdFx0ICAgIGJhc2VNaW51c1QsXG5cdFx0ICAgIHFNaW51c1Q7XG5cblx0XHQvLyBDb252ZXJ0IHRoZSBpbnB1dCBpbiBVQ1MtMiB0byBVbmljb2RlXG5cdFx0aW5wdXQgPSB1Y3MyZGVjb2RlKGlucHV0KTtcblxuXHRcdC8vIENhY2hlIHRoZSBsZW5ndGhcblx0XHRpbnB1dExlbmd0aCA9IGlucHV0Lmxlbmd0aDtcblxuXHRcdC8vIEluaXRpYWxpemUgdGhlIHN0YXRlXG5cdFx0biA9IGluaXRpYWxOO1xuXHRcdGRlbHRhID0gMDtcblx0XHRiaWFzID0gaW5pdGlhbEJpYXM7XG5cblx0XHQvLyBIYW5kbGUgdGhlIGJhc2ljIGNvZGUgcG9pbnRzXG5cdFx0Zm9yIChqID0gMDsgaiA8IGlucHV0TGVuZ3RoOyArK2opIHtcblx0XHRcdGN1cnJlbnRWYWx1ZSA9IGlucHV0W2pdO1xuXHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA8IDB4ODApIHtcblx0XHRcdFx0b3V0cHV0LnB1c2goc3RyaW5nRnJvbUNoYXJDb2RlKGN1cnJlbnRWYWx1ZSkpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGhhbmRsZWRDUENvdW50ID0gYmFzaWNMZW5ndGggPSBvdXRwdXQubGVuZ3RoO1xuXG5cdFx0Ly8gYGhhbmRsZWRDUENvdW50YCBpcyB0aGUgbnVtYmVyIG9mIGNvZGUgcG9pbnRzIHRoYXQgaGF2ZSBiZWVuIGhhbmRsZWQ7XG5cdFx0Ly8gYGJhc2ljTGVuZ3RoYCBpcyB0aGUgbnVtYmVyIG9mIGJhc2ljIGNvZGUgcG9pbnRzLlxuXG5cdFx0Ly8gRmluaXNoIHRoZSBiYXNpYyBzdHJpbmcgLSBpZiBpdCBpcyBub3QgZW1wdHkgLSB3aXRoIGEgZGVsaW1pdGVyXG5cdFx0aWYgKGJhc2ljTGVuZ3RoKSB7XG5cdFx0XHRvdXRwdXQucHVzaChkZWxpbWl0ZXIpO1xuXHRcdH1cblxuXHRcdC8vIE1haW4gZW5jb2RpbmcgbG9vcDpcblx0XHR3aGlsZSAoaGFuZGxlZENQQ291bnQgPCBpbnB1dExlbmd0aCkge1xuXG5cdFx0XHQvLyBBbGwgbm9uLWJhc2ljIGNvZGUgcG9pbnRzIDwgbiBoYXZlIGJlZW4gaGFuZGxlZCBhbHJlYWR5LiBGaW5kIHRoZSBuZXh0XG5cdFx0XHQvLyBsYXJnZXIgb25lOlxuXHRcdFx0Zm9yIChtID0gbWF4SW50LCBqID0gMDsgaiA8IGlucHV0TGVuZ3RoOyArK2opIHtcblx0XHRcdFx0Y3VycmVudFZhbHVlID0gaW5wdXRbal07XG5cdFx0XHRcdGlmIChjdXJyZW50VmFsdWUgPj0gbiAmJiBjdXJyZW50VmFsdWUgPCBtKSB7XG5cdFx0XHRcdFx0bSA9IGN1cnJlbnRWYWx1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBJbmNyZWFzZSBgZGVsdGFgIGVub3VnaCB0byBhZHZhbmNlIHRoZSBkZWNvZGVyJ3MgPG4saT4gc3RhdGUgdG8gPG0sMD4sXG5cdFx0XHQvLyBidXQgZ3VhcmQgYWdhaW5zdCBvdmVyZmxvd1xuXHRcdFx0aGFuZGxlZENQQ291bnRQbHVzT25lID0gaGFuZGxlZENQQ291bnQgKyAxO1xuXHRcdFx0aWYgKG0gLSBuID4gZmxvb3IoKG1heEludCAtIGRlbHRhKSAvIGhhbmRsZWRDUENvdW50UGx1c09uZSkpIHtcblx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHR9XG5cblx0XHRcdGRlbHRhICs9IChtIC0gbikgKiBoYW5kbGVkQ1BDb3VudFBsdXNPbmU7XG5cdFx0XHRuID0gbTtcblxuXHRcdFx0Zm9yIChqID0gMDsgaiA8IGlucHV0TGVuZ3RoOyArK2opIHtcblx0XHRcdFx0Y3VycmVudFZhbHVlID0gaW5wdXRbal07XG5cblx0XHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA8IG4gJiYgKytkZWx0YSA+IG1heEludCkge1xuXHRcdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA9PSBuKSB7XG5cdFx0XHRcdFx0Ly8gUmVwcmVzZW50IGRlbHRhIGFzIGEgZ2VuZXJhbGl6ZWQgdmFyaWFibGUtbGVuZ3RoIGludGVnZXJcblx0XHRcdFx0XHRmb3IgKHEgPSBkZWx0YSwgayA9IGJhc2U7IC8qIG5vIGNvbmRpdGlvbiAqLzsgayArPSBiYXNlKSB7XG5cdFx0XHRcdFx0XHR0ID0gayA8PSBiaWFzID8gdE1pbiA6IChrID49IGJpYXMgKyB0TWF4ID8gdE1heCA6IGsgLSBiaWFzKTtcblx0XHRcdFx0XHRcdGlmIChxIDwgdCkge1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHFNaW51c1QgPSBxIC0gdDtcblx0XHRcdFx0XHRcdGJhc2VNaW51c1QgPSBiYXNlIC0gdDtcblx0XHRcdFx0XHRcdG91dHB1dC5wdXNoKFxuXHRcdFx0XHRcdFx0XHRzdHJpbmdGcm9tQ2hhckNvZGUoZGlnaXRUb0Jhc2ljKHQgKyBxTWludXNUICUgYmFzZU1pbnVzVCwgMCkpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0cSA9IGZsb29yKHFNaW51c1QgLyBiYXNlTWludXNUKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRvdXRwdXQucHVzaChzdHJpbmdGcm9tQ2hhckNvZGUoZGlnaXRUb0Jhc2ljKHEsIDApKSk7XG5cdFx0XHRcdFx0YmlhcyA9IGFkYXB0KGRlbHRhLCBoYW5kbGVkQ1BDb3VudFBsdXNPbmUsIGhhbmRsZWRDUENvdW50ID09IGJhc2ljTGVuZ3RoKTtcblx0XHRcdFx0XHRkZWx0YSA9IDA7XG5cdFx0XHRcdFx0KytoYW5kbGVkQ1BDb3VudDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQrK2RlbHRhO1xuXHRcdFx0KytuO1xuXG5cdFx0fVxuXHRcdHJldHVybiBvdXRwdXQuam9pbignJyk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBQdW55Y29kZSBzdHJpbmcgcmVwcmVzZW50aW5nIGEgZG9tYWluIG5hbWUgb3IgYW4gZW1haWwgYWRkcmVzc1xuXHQgKiB0byBVbmljb2RlLiBPbmx5IHRoZSBQdW55Y29kZWQgcGFydHMgb2YgdGhlIGlucHV0IHdpbGwgYmUgY29udmVydGVkLCBpLmUuXG5cdCAqIGl0IGRvZXNuJ3QgbWF0dGVyIGlmIHlvdSBjYWxsIGl0IG9uIGEgc3RyaW5nIHRoYXQgaGFzIGFscmVhZHkgYmVlblxuXHQgKiBjb252ZXJ0ZWQgdG8gVW5pY29kZS5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dCBUaGUgUHVueWNvZGVkIGRvbWFpbiBuYW1lIG9yIGVtYWlsIGFkZHJlc3MgdG9cblx0ICogY29udmVydCB0byBVbmljb2RlLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgVW5pY29kZSByZXByZXNlbnRhdGlvbiBvZiB0aGUgZ2l2ZW4gUHVueWNvZGVcblx0ICogc3RyaW5nLlxuXHQgKi9cblx0ZnVuY3Rpb24gdG9Vbmljb2RlKGlucHV0KSB7XG5cdFx0cmV0dXJuIG1hcERvbWFpbihpbnB1dCwgZnVuY3Rpb24oc3RyaW5nKSB7XG5cdFx0XHRyZXR1cm4gcmVnZXhQdW55Y29kZS50ZXN0KHN0cmluZylcblx0XHRcdFx0PyBkZWNvZGUoc3RyaW5nLnNsaWNlKDQpLnRvTG93ZXJDYXNlKCkpXG5cdFx0XHRcdDogc3RyaW5nO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgVW5pY29kZSBzdHJpbmcgcmVwcmVzZW50aW5nIGEgZG9tYWluIG5hbWUgb3IgYW4gZW1haWwgYWRkcmVzcyB0b1xuXHQgKiBQdW55Y29kZS4gT25seSB0aGUgbm9uLUFTQ0lJIHBhcnRzIG9mIHRoZSBkb21haW4gbmFtZSB3aWxsIGJlIGNvbnZlcnRlZCxcblx0ICogaS5lLiBpdCBkb2Vzbid0IG1hdHRlciBpZiB5b3UgY2FsbCBpdCB3aXRoIGEgZG9tYWluIHRoYXQncyBhbHJlYWR5IGluXG5cdCAqIEFTQ0lJLlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGlucHV0IFRoZSBkb21haW4gbmFtZSBvciBlbWFpbCBhZGRyZXNzIHRvIGNvbnZlcnQsIGFzIGFcblx0ICogVW5pY29kZSBzdHJpbmcuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBQdW55Y29kZSByZXByZXNlbnRhdGlvbiBvZiB0aGUgZ2l2ZW4gZG9tYWluIG5hbWUgb3Jcblx0ICogZW1haWwgYWRkcmVzcy5cblx0ICovXG5cdGZ1bmN0aW9uIHRvQVNDSUkoaW5wdXQpIHtcblx0XHRyZXR1cm4gbWFwRG9tYWluKGlucHV0LCBmdW5jdGlvbihzdHJpbmcpIHtcblx0XHRcdHJldHVybiByZWdleE5vbkFTQ0lJLnRlc3Qoc3RyaW5nKVxuXHRcdFx0XHQ/ICd4bi0tJyArIGVuY29kZShzdHJpbmcpXG5cdFx0XHRcdDogc3RyaW5nO1xuXHRcdH0pO1xuXHR9XG5cblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblx0LyoqIERlZmluZSB0aGUgcHVibGljIEFQSSAqL1xuXHRwdW55Y29kZSA9IHtcblx0XHQvKipcblx0XHQgKiBBIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIGN1cnJlbnQgUHVueWNvZGUuanMgdmVyc2lvbiBudW1iZXIuXG5cdFx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdFx0ICogQHR5cGUgU3RyaW5nXG5cdFx0ICovXG5cdFx0J3ZlcnNpb24nOiAnMS40LjEnLFxuXHRcdC8qKlxuXHRcdCAqIEFuIG9iamVjdCBvZiBtZXRob2RzIHRvIGNvbnZlcnQgZnJvbSBKYXZhU2NyaXB0J3MgaW50ZXJuYWwgY2hhcmFjdGVyXG5cdFx0ICogcmVwcmVzZW50YXRpb24gKFVDUy0yKSB0byBVbmljb2RlIGNvZGUgcG9pbnRzLCBhbmQgYmFjay5cblx0XHQgKiBAc2VlIDxodHRwczovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvamF2YXNjcmlwdC1lbmNvZGluZz5cblx0XHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0XHQgKiBAdHlwZSBPYmplY3Rcblx0XHQgKi9cblx0XHQndWNzMic6IHtcblx0XHRcdCdkZWNvZGUnOiB1Y3MyZGVjb2RlLFxuXHRcdFx0J2VuY29kZSc6IHVjczJlbmNvZGVcblx0XHR9LFxuXHRcdCdkZWNvZGUnOiBkZWNvZGUsXG5cdFx0J2VuY29kZSc6IGVuY29kZSxcblx0XHQndG9BU0NJSSc6IHRvQVNDSUksXG5cdFx0J3RvVW5pY29kZSc6IHRvVW5pY29kZVxuXHR9O1xuXG5cdC8qKiBFeHBvc2UgYHB1bnljb2RlYCAqL1xuXHQvLyBTb21lIEFNRCBidWlsZCBvcHRpbWl6ZXJzLCBsaWtlIHIuanMsIGNoZWNrIGZvciBzcGVjaWZpYyBjb25kaXRpb24gcGF0dGVybnNcblx0Ly8gbGlrZSB0aGUgZm9sbG93aW5nOlxuXHRpZiAoXG5cdFx0dHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmXG5cdFx0dHlwZW9mIGRlZmluZS5hbWQgPT0gJ29iamVjdCcgJiZcblx0XHRkZWZpbmUuYW1kXG5cdCkge1xuXHRcdGRlZmluZSgncHVueWNvZGUnLCBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBwdW55Y29kZTtcblx0XHR9KTtcblx0fSBlbHNlIGlmIChmcmVlRXhwb3J0cyAmJiBmcmVlTW9kdWxlKSB7XG5cdFx0aWYgKG1vZHVsZS5leHBvcnRzID09IGZyZWVFeHBvcnRzKSB7XG5cdFx0XHQvLyBpbiBOb2RlLmpzLCBpby5qcywgb3IgUmluZ29KUyB2MC44LjArXG5cdFx0XHRmcmVlTW9kdWxlLmV4cG9ydHMgPSBwdW55Y29kZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gaW4gTmFyd2hhbCBvciBSaW5nb0pTIHYwLjcuMC1cblx0XHRcdGZvciAoa2V5IGluIHB1bnljb2RlKSB7XG5cdFx0XHRcdHB1bnljb2RlLmhhc093blByb3BlcnR5KGtleSkgJiYgKGZyZWVFeHBvcnRzW2tleV0gPSBwdW55Y29kZVtrZXldKTtcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Ly8gaW4gUmhpbm8gb3IgYSB3ZWIgYnJvd3NlclxuXHRcdHJvb3QucHVueWNvZGUgPSBwdW55Y29kZTtcblx0fVxuXG59KHRoaXMpKTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4ndXNlIHN0cmljdCc7XG5cbi8vIElmIG9iai5oYXNPd25Qcm9wZXJ0eSBoYXMgYmVlbiBvdmVycmlkZGVuLCB0aGVuIGNhbGxpbmdcbi8vIG9iai5oYXNPd25Qcm9wZXJ0eShwcm9wKSB3aWxsIGJyZWFrLlxuLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vam95ZW50L25vZGUvaXNzdWVzLzE3MDdcbmZ1bmN0aW9uIGhhc093blByb3BlcnR5KG9iaiwgcHJvcCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocXMsIHNlcCwgZXEsIG9wdGlvbnMpIHtcbiAgc2VwID0gc2VwIHx8ICcmJztcbiAgZXEgPSBlcSB8fCAnPSc7XG4gIHZhciBvYmogPSB7fTtcblxuICBpZiAodHlwZW9mIHFzICE9PSAnc3RyaW5nJyB8fCBxcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gb2JqO1xuICB9XG5cbiAgdmFyIHJlZ2V4cCA9IC9cXCsvZztcbiAgcXMgPSBxcy5zcGxpdChzZXApO1xuXG4gIHZhciBtYXhLZXlzID0gMTAwMDtcbiAgaWYgKG9wdGlvbnMgJiYgdHlwZW9mIG9wdGlvbnMubWF4S2V5cyA9PT0gJ251bWJlcicpIHtcbiAgICBtYXhLZXlzID0gb3B0aW9ucy5tYXhLZXlzO1xuICB9XG5cbiAgdmFyIGxlbiA9IHFzLmxlbmd0aDtcbiAgLy8gbWF4S2V5cyA8PSAwIG1lYW5zIHRoYXQgd2Ugc2hvdWxkIG5vdCBsaW1pdCBrZXlzIGNvdW50XG4gIGlmIChtYXhLZXlzID4gMCAmJiBsZW4gPiBtYXhLZXlzKSB7XG4gICAgbGVuID0gbWF4S2V5cztcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpIHtcbiAgICB2YXIgeCA9IHFzW2ldLnJlcGxhY2UocmVnZXhwLCAnJTIwJyksXG4gICAgICAgIGlkeCA9IHguaW5kZXhPZihlcSksXG4gICAgICAgIGtzdHIsIHZzdHIsIGssIHY7XG5cbiAgICBpZiAoaWR4ID49IDApIHtcbiAgICAgIGtzdHIgPSB4LnN1YnN0cigwLCBpZHgpO1xuICAgICAgdnN0ciA9IHguc3Vic3RyKGlkeCArIDEpO1xuICAgIH0gZWxzZSB7XG4gICAgICBrc3RyID0geDtcbiAgICAgIHZzdHIgPSAnJztcbiAgICB9XG5cbiAgICBrID0gZGVjb2RlVVJJQ29tcG9uZW50KGtzdHIpO1xuICAgIHYgPSBkZWNvZGVVUklDb21wb25lbnQodnN0cik7XG5cbiAgICBpZiAoIWhhc093blByb3BlcnR5KG9iaiwgaykpIHtcbiAgICAgIG9ialtrXSA9IHY7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KG9ialtrXSkpIHtcbiAgICAgIG9ialtrXS5wdXNoKHYpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvYmpba10gPSBbb2JqW2tdLCB2XTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gb2JqO1xufTtcblxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uICh4cykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHhzKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgc3RyaW5naWZ5UHJpbWl0aXZlID0gZnVuY3Rpb24odikge1xuICBzd2l0Y2ggKHR5cGVvZiB2KSB7XG4gICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgIHJldHVybiB2O1xuXG4gICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICByZXR1cm4gdiA/ICd0cnVlJyA6ICdmYWxzZSc7XG5cbiAgICBjYXNlICdudW1iZXInOlxuICAgICAgcmV0dXJuIGlzRmluaXRlKHYpID8gdiA6ICcnO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiAnJztcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmosIHNlcCwgZXEsIG5hbWUpIHtcbiAgc2VwID0gc2VwIHx8ICcmJztcbiAgZXEgPSBlcSB8fCAnPSc7XG4gIGlmIChvYmogPT09IG51bGwpIHtcbiAgICBvYmogPSB1bmRlZmluZWQ7XG4gIH1cblxuICBpZiAodHlwZW9mIG9iaiA9PT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gbWFwKG9iamVjdEtleXMob2JqKSwgZnVuY3Rpb24oaykge1xuICAgICAgdmFyIGtzID0gZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZShrKSkgKyBlcTtcbiAgICAgIGlmIChpc0FycmF5KG9ialtrXSkpIHtcbiAgICAgICAgcmV0dXJuIG1hcChvYmpba10sIGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICByZXR1cm4ga3MgKyBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKHYpKTtcbiAgICAgICAgfSkuam9pbihzZXApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGtzICsgZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZShvYmpba10pKTtcbiAgICAgIH1cbiAgICB9KS5qb2luKHNlcCk7XG5cbiAgfVxuXG4gIGlmICghbmFtZSkgcmV0dXJuICcnO1xuICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZShuYW1lKSkgKyBlcSArXG4gICAgICAgICBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKG9iaikpO1xufTtcblxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uICh4cykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHhzKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG5cbmZ1bmN0aW9uIG1hcCAoeHMsIGYpIHtcbiAgaWYgKHhzLm1hcCkgcmV0dXJuIHhzLm1hcChmKTtcbiAgdmFyIHJlcyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgcmVzLnB1c2goZih4c1tpXSwgaSkpO1xuICB9XG4gIHJldHVybiByZXM7XG59XG5cbnZhciBvYmplY3RLZXlzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24gKG9iaikge1xuICB2YXIgcmVzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkgcmVzLnB1c2goa2V5KTtcbiAgfVxuICByZXR1cm4gcmVzO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5kZWNvZGUgPSBleHBvcnRzLnBhcnNlID0gcmVxdWlyZSgnLi9kZWNvZGUnKTtcbmV4cG9ydHMuZW5jb2RlID0gZXhwb3J0cy5zdHJpbmdpZnkgPSByZXF1aXJlKCcuL2VuY29kZScpO1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHB1bnljb2RlID0gcmVxdWlyZSgncHVueWNvZGUnKTtcbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbmV4cG9ydHMucGFyc2UgPSB1cmxQYXJzZTtcbmV4cG9ydHMucmVzb2x2ZSA9IHVybFJlc29sdmU7XG5leHBvcnRzLnJlc29sdmVPYmplY3QgPSB1cmxSZXNvbHZlT2JqZWN0O1xuZXhwb3J0cy5mb3JtYXQgPSB1cmxGb3JtYXQ7XG5cbmV4cG9ydHMuVXJsID0gVXJsO1xuXG5mdW5jdGlvbiBVcmwoKSB7XG4gIHRoaXMucHJvdG9jb2wgPSBudWxsO1xuICB0aGlzLnNsYXNoZXMgPSBudWxsO1xuICB0aGlzLmF1dGggPSBudWxsO1xuICB0aGlzLmhvc3QgPSBudWxsO1xuICB0aGlzLnBvcnQgPSBudWxsO1xuICB0aGlzLmhvc3RuYW1lID0gbnVsbDtcbiAgdGhpcy5oYXNoID0gbnVsbDtcbiAgdGhpcy5zZWFyY2ggPSBudWxsO1xuICB0aGlzLnF1ZXJ5ID0gbnVsbDtcbiAgdGhpcy5wYXRobmFtZSA9IG51bGw7XG4gIHRoaXMucGF0aCA9IG51bGw7XG4gIHRoaXMuaHJlZiA9IG51bGw7XG59XG5cbi8vIFJlZmVyZW5jZTogUkZDIDM5ODYsIFJGQyAxODA4LCBSRkMgMjM5NlxuXG4vLyBkZWZpbmUgdGhlc2UgaGVyZSBzbyBhdCBsZWFzdCB0aGV5IG9ubHkgaGF2ZSB0byBiZVxuLy8gY29tcGlsZWQgb25jZSBvbiB0aGUgZmlyc3QgbW9kdWxlIGxvYWQuXG52YXIgcHJvdG9jb2xQYXR0ZXJuID0gL14oW2EtejAtOS4rLV0rOikvaSxcbiAgICBwb3J0UGF0dGVybiA9IC86WzAtOV0qJC8sXG5cbiAgICAvLyBTcGVjaWFsIGNhc2UgZm9yIGEgc2ltcGxlIHBhdGggVVJMXG4gICAgc2ltcGxlUGF0aFBhdHRlcm4gPSAvXihcXC9cXC8/KD8hXFwvKVteXFw/XFxzXSopKFxcP1teXFxzXSopPyQvLFxuXG4gICAgLy8gUkZDIDIzOTY6IGNoYXJhY3RlcnMgcmVzZXJ2ZWQgZm9yIGRlbGltaXRpbmcgVVJMcy5cbiAgICAvLyBXZSBhY3R1YWxseSBqdXN0IGF1dG8tZXNjYXBlIHRoZXNlLlxuICAgIGRlbGltcyA9IFsnPCcsICc+JywgJ1wiJywgJ2AnLCAnICcsICdcXHInLCAnXFxuJywgJ1xcdCddLFxuXG4gICAgLy8gUkZDIDIzOTY6IGNoYXJhY3RlcnMgbm90IGFsbG93ZWQgZm9yIHZhcmlvdXMgcmVhc29ucy5cbiAgICB1bndpc2UgPSBbJ3snLCAnfScsICd8JywgJ1xcXFwnLCAnXicsICdgJ10uY29uY2F0KGRlbGltcyksXG5cbiAgICAvLyBBbGxvd2VkIGJ5IFJGQ3MsIGJ1dCBjYXVzZSBvZiBYU1MgYXR0YWNrcy4gIEFsd2F5cyBlc2NhcGUgdGhlc2UuXG4gICAgYXV0b0VzY2FwZSA9IFsnXFwnJ10uY29uY2F0KHVud2lzZSksXG4gICAgLy8gQ2hhcmFjdGVycyB0aGF0IGFyZSBuZXZlciBldmVyIGFsbG93ZWQgaW4gYSBob3N0bmFtZS5cbiAgICAvLyBOb3RlIHRoYXQgYW55IGludmFsaWQgY2hhcnMgYXJlIGFsc28gaGFuZGxlZCwgYnV0IHRoZXNlXG4gICAgLy8gYXJlIHRoZSBvbmVzIHRoYXQgYXJlICpleHBlY3RlZCogdG8gYmUgc2Vlbiwgc28gd2UgZmFzdC1wYXRoXG4gICAgLy8gdGhlbS5cbiAgICBub25Ib3N0Q2hhcnMgPSBbJyUnLCAnLycsICc/JywgJzsnLCAnIyddLmNvbmNhdChhdXRvRXNjYXBlKSxcbiAgICBob3N0RW5kaW5nQ2hhcnMgPSBbJy8nLCAnPycsICcjJ10sXG4gICAgaG9zdG5hbWVNYXhMZW4gPSAyNTUsXG4gICAgaG9zdG5hbWVQYXJ0UGF0dGVybiA9IC9eWythLXowLTlBLVpfLV17MCw2M30kLyxcbiAgICBob3N0bmFtZVBhcnRTdGFydCA9IC9eKFsrYS16MC05QS1aXy1dezAsNjN9KSguKikkLyxcbiAgICAvLyBwcm90b2NvbHMgdGhhdCBjYW4gYWxsb3cgXCJ1bnNhZmVcIiBhbmQgXCJ1bndpc2VcIiBjaGFycy5cbiAgICB1bnNhZmVQcm90b2NvbCA9IHtcbiAgICAgICdqYXZhc2NyaXB0JzogdHJ1ZSxcbiAgICAgICdqYXZhc2NyaXB0Oic6IHRydWVcbiAgICB9LFxuICAgIC8vIHByb3RvY29scyB0aGF0IG5ldmVyIGhhdmUgYSBob3N0bmFtZS5cbiAgICBob3N0bGVzc1Byb3RvY29sID0ge1xuICAgICAgJ2phdmFzY3JpcHQnOiB0cnVlLFxuICAgICAgJ2phdmFzY3JpcHQ6JzogdHJ1ZVxuICAgIH0sXG4gICAgLy8gcHJvdG9jb2xzIHRoYXQgYWx3YXlzIGNvbnRhaW4gYSAvLyBiaXQuXG4gICAgc2xhc2hlZFByb3RvY29sID0ge1xuICAgICAgJ2h0dHAnOiB0cnVlLFxuICAgICAgJ2h0dHBzJzogdHJ1ZSxcbiAgICAgICdmdHAnOiB0cnVlLFxuICAgICAgJ2dvcGhlcic6IHRydWUsXG4gICAgICAnZmlsZSc6IHRydWUsXG4gICAgICAnaHR0cDonOiB0cnVlLFxuICAgICAgJ2h0dHBzOic6IHRydWUsXG4gICAgICAnZnRwOic6IHRydWUsXG4gICAgICAnZ29waGVyOic6IHRydWUsXG4gICAgICAnZmlsZTonOiB0cnVlXG4gICAgfSxcbiAgICBxdWVyeXN0cmluZyA9IHJlcXVpcmUoJ3F1ZXJ5c3RyaW5nJyk7XG5cbmZ1bmN0aW9uIHVybFBhcnNlKHVybCwgcGFyc2VRdWVyeVN0cmluZywgc2xhc2hlc0Rlbm90ZUhvc3QpIHtcbiAgaWYgKHVybCAmJiB1dGlsLmlzT2JqZWN0KHVybCkgJiYgdXJsIGluc3RhbmNlb2YgVXJsKSByZXR1cm4gdXJsO1xuXG4gIHZhciB1ID0gbmV3IFVybDtcbiAgdS5wYXJzZSh1cmwsIHBhcnNlUXVlcnlTdHJpbmcsIHNsYXNoZXNEZW5vdGVIb3N0KTtcbiAgcmV0dXJuIHU7XG59XG5cblVybC5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbih1cmwsIHBhcnNlUXVlcnlTdHJpbmcsIHNsYXNoZXNEZW5vdGVIb3N0KSB7XG4gIGlmICghdXRpbC5pc1N0cmluZyh1cmwpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlBhcmFtZXRlciAndXJsJyBtdXN0IGJlIGEgc3RyaW5nLCBub3QgXCIgKyB0eXBlb2YgdXJsKTtcbiAgfVxuXG4gIC8vIENvcHkgY2hyb21lLCBJRSwgb3BlcmEgYmFja3NsYXNoLWhhbmRsaW5nIGJlaGF2aW9yLlxuICAvLyBCYWNrIHNsYXNoZXMgYmVmb3JlIHRoZSBxdWVyeSBzdHJpbmcgZ2V0IGNvbnZlcnRlZCB0byBmb3J3YXJkIHNsYXNoZXNcbiAgLy8gU2VlOiBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9MjU5MTZcbiAgdmFyIHF1ZXJ5SW5kZXggPSB1cmwuaW5kZXhPZignPycpLFxuICAgICAgc3BsaXR0ZXIgPVxuICAgICAgICAgIChxdWVyeUluZGV4ICE9PSAtMSAmJiBxdWVyeUluZGV4IDwgdXJsLmluZGV4T2YoJyMnKSkgPyAnPycgOiAnIycsXG4gICAgICB1U3BsaXQgPSB1cmwuc3BsaXQoc3BsaXR0ZXIpLFxuICAgICAgc2xhc2hSZWdleCA9IC9cXFxcL2c7XG4gIHVTcGxpdFswXSA9IHVTcGxpdFswXS5yZXBsYWNlKHNsYXNoUmVnZXgsICcvJyk7XG4gIHVybCA9IHVTcGxpdC5qb2luKHNwbGl0dGVyKTtcblxuICB2YXIgcmVzdCA9IHVybDtcblxuICAvLyB0cmltIGJlZm9yZSBwcm9jZWVkaW5nLlxuICAvLyBUaGlzIGlzIHRvIHN1cHBvcnQgcGFyc2Ugc3R1ZmYgbGlrZSBcIiAgaHR0cDovL2Zvby5jb20gIFxcblwiXG4gIHJlc3QgPSByZXN0LnRyaW0oKTtcblxuICBpZiAoIXNsYXNoZXNEZW5vdGVIb3N0ICYmIHVybC5zcGxpdCgnIycpLmxlbmd0aCA9PT0gMSkge1xuICAgIC8vIFRyeSBmYXN0IHBhdGggcmVnZXhwXG4gICAgdmFyIHNpbXBsZVBhdGggPSBzaW1wbGVQYXRoUGF0dGVybi5leGVjKHJlc3QpO1xuICAgIGlmIChzaW1wbGVQYXRoKSB7XG4gICAgICB0aGlzLnBhdGggPSByZXN0O1xuICAgICAgdGhpcy5ocmVmID0gcmVzdDtcbiAgICAgIHRoaXMucGF0aG5hbWUgPSBzaW1wbGVQYXRoWzFdO1xuICAgICAgaWYgKHNpbXBsZVBhdGhbMl0pIHtcbiAgICAgICAgdGhpcy5zZWFyY2ggPSBzaW1wbGVQYXRoWzJdO1xuICAgICAgICBpZiAocGFyc2VRdWVyeVN0cmluZykge1xuICAgICAgICAgIHRoaXMucXVlcnkgPSBxdWVyeXN0cmluZy5wYXJzZSh0aGlzLnNlYXJjaC5zdWJzdHIoMSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucXVlcnkgPSB0aGlzLnNlYXJjaC5zdWJzdHIoMSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAocGFyc2VRdWVyeVN0cmluZykge1xuICAgICAgICB0aGlzLnNlYXJjaCA9ICcnO1xuICAgICAgICB0aGlzLnF1ZXJ5ID0ge307XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH1cblxuICB2YXIgcHJvdG8gPSBwcm90b2NvbFBhdHRlcm4uZXhlYyhyZXN0KTtcbiAgaWYgKHByb3RvKSB7XG4gICAgcHJvdG8gPSBwcm90b1swXTtcbiAgICB2YXIgbG93ZXJQcm90byA9IHByb3RvLnRvTG93ZXJDYXNlKCk7XG4gICAgdGhpcy5wcm90b2NvbCA9IGxvd2VyUHJvdG87XG4gICAgcmVzdCA9IHJlc3Quc3Vic3RyKHByb3RvLmxlbmd0aCk7XG4gIH1cblxuICAvLyBmaWd1cmUgb3V0IGlmIGl0J3MgZ290IGEgaG9zdFxuICAvLyB1c2VyQHNlcnZlciBpcyAqYWx3YXlzKiBpbnRlcnByZXRlZCBhcyBhIGhvc3RuYW1lLCBhbmQgdXJsXG4gIC8vIHJlc29sdXRpb24gd2lsbCB0cmVhdCAvL2Zvby9iYXIgYXMgaG9zdD1mb28scGF0aD1iYXIgYmVjYXVzZSB0aGF0J3NcbiAgLy8gaG93IHRoZSBicm93c2VyIHJlc29sdmVzIHJlbGF0aXZlIFVSTHMuXG4gIGlmIChzbGFzaGVzRGVub3RlSG9zdCB8fCBwcm90byB8fCByZXN0Lm1hdGNoKC9eXFwvXFwvW15AXFwvXStAW15AXFwvXSsvKSkge1xuICAgIHZhciBzbGFzaGVzID0gcmVzdC5zdWJzdHIoMCwgMikgPT09ICcvLyc7XG4gICAgaWYgKHNsYXNoZXMgJiYgIShwcm90byAmJiBob3N0bGVzc1Byb3RvY29sW3Byb3RvXSkpIHtcbiAgICAgIHJlc3QgPSByZXN0LnN1YnN0cigyKTtcbiAgICAgIHRoaXMuc2xhc2hlcyA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFob3N0bGVzc1Byb3RvY29sW3Byb3RvXSAmJlxuICAgICAgKHNsYXNoZXMgfHwgKHByb3RvICYmICFzbGFzaGVkUHJvdG9jb2xbcHJvdG9dKSkpIHtcblxuICAgIC8vIHRoZXJlJ3MgYSBob3N0bmFtZS5cbiAgICAvLyB0aGUgZmlyc3QgaW5zdGFuY2Ugb2YgLywgPywgOywgb3IgIyBlbmRzIHRoZSBob3N0LlxuICAgIC8vXG4gICAgLy8gSWYgdGhlcmUgaXMgYW4gQCBpbiB0aGUgaG9zdG5hbWUsIHRoZW4gbm9uLWhvc3QgY2hhcnMgKmFyZSogYWxsb3dlZFxuICAgIC8vIHRvIHRoZSBsZWZ0IG9mIHRoZSBsYXN0IEAgc2lnbiwgdW5sZXNzIHNvbWUgaG9zdC1lbmRpbmcgY2hhcmFjdGVyXG4gICAgLy8gY29tZXMgKmJlZm9yZSogdGhlIEAtc2lnbi5cbiAgICAvLyBVUkxzIGFyZSBvYm5veGlvdXMuXG4gICAgLy9cbiAgICAvLyBleDpcbiAgICAvLyBodHRwOi8vYUBiQGMvID0+IHVzZXI6YUBiIGhvc3Q6Y1xuICAgIC8vIGh0dHA6Ly9hQGI/QGMgPT4gdXNlcjphIGhvc3Q6YyBwYXRoOi8/QGNcblxuICAgIC8vIHYwLjEyIFRPRE8oaXNhYWNzKTogVGhpcyBpcyBub3QgcXVpdGUgaG93IENocm9tZSBkb2VzIHRoaW5ncy5cbiAgICAvLyBSZXZpZXcgb3VyIHRlc3QgY2FzZSBhZ2FpbnN0IGJyb3dzZXJzIG1vcmUgY29tcHJlaGVuc2l2ZWx5LlxuXG4gICAgLy8gZmluZCB0aGUgZmlyc3QgaW5zdGFuY2Ugb2YgYW55IGhvc3RFbmRpbmdDaGFyc1xuICAgIHZhciBob3N0RW5kID0gLTE7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBob3N0RW5kaW5nQ2hhcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBoZWMgPSByZXN0LmluZGV4T2YoaG9zdEVuZGluZ0NoYXJzW2ldKTtcbiAgICAgIGlmIChoZWMgIT09IC0xICYmIChob3N0RW5kID09PSAtMSB8fCBoZWMgPCBob3N0RW5kKSlcbiAgICAgICAgaG9zdEVuZCA9IGhlYztcbiAgICB9XG5cbiAgICAvLyBhdCB0aGlzIHBvaW50LCBlaXRoZXIgd2UgaGF2ZSBhbiBleHBsaWNpdCBwb2ludCB3aGVyZSB0aGVcbiAgICAvLyBhdXRoIHBvcnRpb24gY2Fubm90IGdvIHBhc3QsIG9yIHRoZSBsYXN0IEAgY2hhciBpcyB0aGUgZGVjaWRlci5cbiAgICB2YXIgYXV0aCwgYXRTaWduO1xuICAgIGlmIChob3N0RW5kID09PSAtMSkge1xuICAgICAgLy8gYXRTaWduIGNhbiBiZSBhbnl3aGVyZS5cbiAgICAgIGF0U2lnbiA9IHJlc3QubGFzdEluZGV4T2YoJ0AnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gYXRTaWduIG11c3QgYmUgaW4gYXV0aCBwb3J0aW9uLlxuICAgICAgLy8gaHR0cDovL2FAYi9jQGQgPT4gaG9zdDpiIGF1dGg6YSBwYXRoOi9jQGRcbiAgICAgIGF0U2lnbiA9IHJlc3QubGFzdEluZGV4T2YoJ0AnLCBob3N0RW5kKTtcbiAgICB9XG5cbiAgICAvLyBOb3cgd2UgaGF2ZSBhIHBvcnRpb24gd2hpY2ggaXMgZGVmaW5pdGVseSB0aGUgYXV0aC5cbiAgICAvLyBQdWxsIHRoYXQgb2ZmLlxuICAgIGlmIChhdFNpZ24gIT09IC0xKSB7XG4gICAgICBhdXRoID0gcmVzdC5zbGljZSgwLCBhdFNpZ24pO1xuICAgICAgcmVzdCA9IHJlc3Quc2xpY2UoYXRTaWduICsgMSk7XG4gICAgICB0aGlzLmF1dGggPSBkZWNvZGVVUklDb21wb25lbnQoYXV0aCk7XG4gICAgfVxuXG4gICAgLy8gdGhlIGhvc3QgaXMgdGhlIHJlbWFpbmluZyB0byB0aGUgbGVmdCBvZiB0aGUgZmlyc3Qgbm9uLWhvc3QgY2hhclxuICAgIGhvc3RFbmQgPSAtMTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vbkhvc3RDaGFycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGhlYyA9IHJlc3QuaW5kZXhPZihub25Ib3N0Q2hhcnNbaV0pO1xuICAgICAgaWYgKGhlYyAhPT0gLTEgJiYgKGhvc3RFbmQgPT09IC0xIHx8IGhlYyA8IGhvc3RFbmQpKVxuICAgICAgICBob3N0RW5kID0gaGVjO1xuICAgIH1cbiAgICAvLyBpZiB3ZSBzdGlsbCBoYXZlIG5vdCBoaXQgaXQsIHRoZW4gdGhlIGVudGlyZSB0aGluZyBpcyBhIGhvc3QuXG4gICAgaWYgKGhvc3RFbmQgPT09IC0xKVxuICAgICAgaG9zdEVuZCA9IHJlc3QubGVuZ3RoO1xuXG4gICAgdGhpcy5ob3N0ID0gcmVzdC5zbGljZSgwLCBob3N0RW5kKTtcbiAgICByZXN0ID0gcmVzdC5zbGljZShob3N0RW5kKTtcblxuICAgIC8vIHB1bGwgb3V0IHBvcnQuXG4gICAgdGhpcy5wYXJzZUhvc3QoKTtcblxuICAgIC8vIHdlJ3ZlIGluZGljYXRlZCB0aGF0IHRoZXJlIGlzIGEgaG9zdG5hbWUsXG4gICAgLy8gc28gZXZlbiBpZiBpdCdzIGVtcHR5LCBpdCBoYXMgdG8gYmUgcHJlc2VudC5cbiAgICB0aGlzLmhvc3RuYW1lID0gdGhpcy5ob3N0bmFtZSB8fCAnJztcblxuICAgIC8vIGlmIGhvc3RuYW1lIGJlZ2lucyB3aXRoIFsgYW5kIGVuZHMgd2l0aCBdXG4gICAgLy8gYXNzdW1lIHRoYXQgaXQncyBhbiBJUHY2IGFkZHJlc3MuXG4gICAgdmFyIGlwdjZIb3N0bmFtZSA9IHRoaXMuaG9zdG5hbWVbMF0gPT09ICdbJyAmJlxuICAgICAgICB0aGlzLmhvc3RuYW1lW3RoaXMuaG9zdG5hbWUubGVuZ3RoIC0gMV0gPT09ICddJztcblxuICAgIC8vIHZhbGlkYXRlIGEgbGl0dGxlLlxuICAgIGlmICghaXB2Nkhvc3RuYW1lKSB7XG4gICAgICB2YXIgaG9zdHBhcnRzID0gdGhpcy5ob3N0bmFtZS5zcGxpdCgvXFwuLyk7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGhvc3RwYXJ0cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIHBhcnQgPSBob3N0cGFydHNbaV07XG4gICAgICAgIGlmICghcGFydCkgY29udGludWU7XG4gICAgICAgIGlmICghcGFydC5tYXRjaChob3N0bmFtZVBhcnRQYXR0ZXJuKSkge1xuICAgICAgICAgIHZhciBuZXdwYXJ0ID0gJyc7XG4gICAgICAgICAgZm9yICh2YXIgaiA9IDAsIGsgPSBwYXJ0Lmxlbmd0aDsgaiA8IGs7IGorKykge1xuICAgICAgICAgICAgaWYgKHBhcnQuY2hhckNvZGVBdChqKSA+IDEyNykge1xuICAgICAgICAgICAgICAvLyB3ZSByZXBsYWNlIG5vbi1BU0NJSSBjaGFyIHdpdGggYSB0ZW1wb3JhcnkgcGxhY2Vob2xkZXJcbiAgICAgICAgICAgICAgLy8gd2UgbmVlZCB0aGlzIHRvIG1ha2Ugc3VyZSBzaXplIG9mIGhvc3RuYW1lIGlzIG5vdFxuICAgICAgICAgICAgICAvLyBicm9rZW4gYnkgcmVwbGFjaW5nIG5vbi1BU0NJSSBieSBub3RoaW5nXG4gICAgICAgICAgICAgIG5ld3BhcnQgKz0gJ3gnO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgbmV3cGFydCArPSBwYXJ0W2pdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICAvLyB3ZSB0ZXN0IGFnYWluIHdpdGggQVNDSUkgY2hhciBvbmx5XG4gICAgICAgICAgaWYgKCFuZXdwYXJ0Lm1hdGNoKGhvc3RuYW1lUGFydFBhdHRlcm4pKSB7XG4gICAgICAgICAgICB2YXIgdmFsaWRQYXJ0cyA9IGhvc3RwYXJ0cy5zbGljZSgwLCBpKTtcbiAgICAgICAgICAgIHZhciBub3RIb3N0ID0gaG9zdHBhcnRzLnNsaWNlKGkgKyAxKTtcbiAgICAgICAgICAgIHZhciBiaXQgPSBwYXJ0Lm1hdGNoKGhvc3RuYW1lUGFydFN0YXJ0KTtcbiAgICAgICAgICAgIGlmIChiaXQpIHtcbiAgICAgICAgICAgICAgdmFsaWRQYXJ0cy5wdXNoKGJpdFsxXSk7XG4gICAgICAgICAgICAgIG5vdEhvc3QudW5zaGlmdChiaXRbMl0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5vdEhvc3QubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIHJlc3QgPSAnLycgKyBub3RIb3N0LmpvaW4oJy4nKSArIHJlc3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmhvc3RuYW1lID0gdmFsaWRQYXJ0cy5qb2luKCcuJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5ob3N0bmFtZS5sZW5ndGggPiBob3N0bmFtZU1heExlbikge1xuICAgICAgdGhpcy5ob3N0bmFtZSA9ICcnO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBob3N0bmFtZXMgYXJlIGFsd2F5cyBsb3dlciBjYXNlLlxuICAgICAgdGhpcy5ob3N0bmFtZSA9IHRoaXMuaG9zdG5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICB9XG5cbiAgICBpZiAoIWlwdjZIb3N0bmFtZSkge1xuICAgICAgLy8gSUROQSBTdXBwb3J0OiBSZXR1cm5zIGEgcHVueWNvZGVkIHJlcHJlc2VudGF0aW9uIG9mIFwiZG9tYWluXCIuXG4gICAgICAvLyBJdCBvbmx5IGNvbnZlcnRzIHBhcnRzIG9mIHRoZSBkb21haW4gbmFtZSB0aGF0XG4gICAgICAvLyBoYXZlIG5vbi1BU0NJSSBjaGFyYWN0ZXJzLCBpLmUuIGl0IGRvZXNuJ3QgbWF0dGVyIGlmXG4gICAgICAvLyB5b3UgY2FsbCBpdCB3aXRoIGEgZG9tYWluIHRoYXQgYWxyZWFkeSBpcyBBU0NJSS1vbmx5LlxuICAgICAgdGhpcy5ob3N0bmFtZSA9IHB1bnljb2RlLnRvQVNDSUkodGhpcy5ob3N0bmFtZSk7XG4gICAgfVxuXG4gICAgdmFyIHAgPSB0aGlzLnBvcnQgPyAnOicgKyB0aGlzLnBvcnQgOiAnJztcbiAgICB2YXIgaCA9IHRoaXMuaG9zdG5hbWUgfHwgJyc7XG4gICAgdGhpcy5ob3N0ID0gaCArIHA7XG4gICAgdGhpcy5ocmVmICs9IHRoaXMuaG9zdDtcblxuICAgIC8vIHN0cmlwIFsgYW5kIF0gZnJvbSB0aGUgaG9zdG5hbWVcbiAgICAvLyB0aGUgaG9zdCBmaWVsZCBzdGlsbCByZXRhaW5zIHRoZW0sIHRob3VnaFxuICAgIGlmIChpcHY2SG9zdG5hbWUpIHtcbiAgICAgIHRoaXMuaG9zdG5hbWUgPSB0aGlzLmhvc3RuYW1lLnN1YnN0cigxLCB0aGlzLmhvc3RuYW1lLmxlbmd0aCAtIDIpO1xuICAgICAgaWYgKHJlc3RbMF0gIT09ICcvJykge1xuICAgICAgICByZXN0ID0gJy8nICsgcmVzdDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBub3cgcmVzdCBpcyBzZXQgdG8gdGhlIHBvc3QtaG9zdCBzdHVmZi5cbiAgLy8gY2hvcCBvZmYgYW55IGRlbGltIGNoYXJzLlxuICBpZiAoIXVuc2FmZVByb3RvY29sW2xvd2VyUHJvdG9dKSB7XG5cbiAgICAvLyBGaXJzdCwgbWFrZSAxMDAlIHN1cmUgdGhhdCBhbnkgXCJhdXRvRXNjYXBlXCIgY2hhcnMgZ2V0XG4gICAgLy8gZXNjYXBlZCwgZXZlbiBpZiBlbmNvZGVVUklDb21wb25lbnQgZG9lc24ndCB0aGluayB0aGV5XG4gICAgLy8gbmVlZCB0byBiZS5cbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGF1dG9Fc2NhcGUubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB2YXIgYWUgPSBhdXRvRXNjYXBlW2ldO1xuICAgICAgaWYgKHJlc3QuaW5kZXhPZihhZSkgPT09IC0xKVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIHZhciBlc2MgPSBlbmNvZGVVUklDb21wb25lbnQoYWUpO1xuICAgICAgaWYgKGVzYyA9PT0gYWUpIHtcbiAgICAgICAgZXNjID0gZXNjYXBlKGFlKTtcbiAgICAgIH1cbiAgICAgIHJlc3QgPSByZXN0LnNwbGl0KGFlKS5qb2luKGVzYyk7XG4gICAgfVxuICB9XG5cblxuICAvLyBjaG9wIG9mZiBmcm9tIHRoZSB0YWlsIGZpcnN0LlxuICB2YXIgaGFzaCA9IHJlc3QuaW5kZXhPZignIycpO1xuICBpZiAoaGFzaCAhPT0gLTEpIHtcbiAgICAvLyBnb3QgYSBmcmFnbWVudCBzdHJpbmcuXG4gICAgdGhpcy5oYXNoID0gcmVzdC5zdWJzdHIoaGFzaCk7XG4gICAgcmVzdCA9IHJlc3Quc2xpY2UoMCwgaGFzaCk7XG4gIH1cbiAgdmFyIHFtID0gcmVzdC5pbmRleE9mKCc/Jyk7XG4gIGlmIChxbSAhPT0gLTEpIHtcbiAgICB0aGlzLnNlYXJjaCA9IHJlc3Quc3Vic3RyKHFtKTtcbiAgICB0aGlzLnF1ZXJ5ID0gcmVzdC5zdWJzdHIocW0gKyAxKTtcbiAgICBpZiAocGFyc2VRdWVyeVN0cmluZykge1xuICAgICAgdGhpcy5xdWVyeSA9IHF1ZXJ5c3RyaW5nLnBhcnNlKHRoaXMucXVlcnkpO1xuICAgIH1cbiAgICByZXN0ID0gcmVzdC5zbGljZSgwLCBxbSk7XG4gIH0gZWxzZSBpZiAocGFyc2VRdWVyeVN0cmluZykge1xuICAgIC8vIG5vIHF1ZXJ5IHN0cmluZywgYnV0IHBhcnNlUXVlcnlTdHJpbmcgc3RpbGwgcmVxdWVzdGVkXG4gICAgdGhpcy5zZWFyY2ggPSAnJztcbiAgICB0aGlzLnF1ZXJ5ID0ge307XG4gIH1cbiAgaWYgKHJlc3QpIHRoaXMucGF0aG5hbWUgPSByZXN0O1xuICBpZiAoc2xhc2hlZFByb3RvY29sW2xvd2VyUHJvdG9dICYmXG4gICAgICB0aGlzLmhvc3RuYW1lICYmICF0aGlzLnBhdGhuYW1lKSB7XG4gICAgdGhpcy5wYXRobmFtZSA9ICcvJztcbiAgfVxuXG4gIC8vdG8gc3VwcG9ydCBodHRwLnJlcXVlc3RcbiAgaWYgKHRoaXMucGF0aG5hbWUgfHwgdGhpcy5zZWFyY2gpIHtcbiAgICB2YXIgcCA9IHRoaXMucGF0aG5hbWUgfHwgJyc7XG4gICAgdmFyIHMgPSB0aGlzLnNlYXJjaCB8fCAnJztcbiAgICB0aGlzLnBhdGggPSBwICsgcztcbiAgfVxuXG4gIC8vIGZpbmFsbHksIHJlY29uc3RydWN0IHRoZSBocmVmIGJhc2VkIG9uIHdoYXQgaGFzIGJlZW4gdmFsaWRhdGVkLlxuICB0aGlzLmhyZWYgPSB0aGlzLmZvcm1hdCgpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGZvcm1hdCBhIHBhcnNlZCBvYmplY3QgaW50byBhIHVybCBzdHJpbmdcbmZ1bmN0aW9uIHVybEZvcm1hdChvYmopIHtcbiAgLy8gZW5zdXJlIGl0J3MgYW4gb2JqZWN0LCBhbmQgbm90IGEgc3RyaW5nIHVybC5cbiAgLy8gSWYgaXQncyBhbiBvYmosIHRoaXMgaXMgYSBuby1vcC5cbiAgLy8gdGhpcyB3YXksIHlvdSBjYW4gY2FsbCB1cmxfZm9ybWF0KCkgb24gc3RyaW5nc1xuICAvLyB0byBjbGVhbiB1cCBwb3RlbnRpYWxseSB3b25reSB1cmxzLlxuICBpZiAodXRpbC5pc1N0cmluZyhvYmopKSBvYmogPSB1cmxQYXJzZShvYmopO1xuICBpZiAoIShvYmogaW5zdGFuY2VvZiBVcmwpKSByZXR1cm4gVXJsLnByb3RvdHlwZS5mb3JtYXQuY2FsbChvYmopO1xuICByZXR1cm4gb2JqLmZvcm1hdCgpO1xufVxuXG5VcmwucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgYXV0aCA9IHRoaXMuYXV0aCB8fCAnJztcbiAgaWYgKGF1dGgpIHtcbiAgICBhdXRoID0gZW5jb2RlVVJJQ29tcG9uZW50KGF1dGgpO1xuICAgIGF1dGggPSBhdXRoLnJlcGxhY2UoLyUzQS9pLCAnOicpO1xuICAgIGF1dGggKz0gJ0AnO1xuICB9XG5cbiAgdmFyIHByb3RvY29sID0gdGhpcy5wcm90b2NvbCB8fCAnJyxcbiAgICAgIHBhdGhuYW1lID0gdGhpcy5wYXRobmFtZSB8fCAnJyxcbiAgICAgIGhhc2ggPSB0aGlzLmhhc2ggfHwgJycsXG4gICAgICBob3N0ID0gZmFsc2UsXG4gICAgICBxdWVyeSA9ICcnO1xuXG4gIGlmICh0aGlzLmhvc3QpIHtcbiAgICBob3N0ID0gYXV0aCArIHRoaXMuaG9zdDtcbiAgfSBlbHNlIGlmICh0aGlzLmhvc3RuYW1lKSB7XG4gICAgaG9zdCA9IGF1dGggKyAodGhpcy5ob3N0bmFtZS5pbmRleE9mKCc6JykgPT09IC0xID9cbiAgICAgICAgdGhpcy5ob3N0bmFtZSA6XG4gICAgICAgICdbJyArIHRoaXMuaG9zdG5hbWUgKyAnXScpO1xuICAgIGlmICh0aGlzLnBvcnQpIHtcbiAgICAgIGhvc3QgKz0gJzonICsgdGhpcy5wb3J0O1xuICAgIH1cbiAgfVxuXG4gIGlmICh0aGlzLnF1ZXJ5ICYmXG4gICAgICB1dGlsLmlzT2JqZWN0KHRoaXMucXVlcnkpICYmXG4gICAgICBPYmplY3Qua2V5cyh0aGlzLnF1ZXJ5KS5sZW5ndGgpIHtcbiAgICBxdWVyeSA9IHF1ZXJ5c3RyaW5nLnN0cmluZ2lmeSh0aGlzLnF1ZXJ5KTtcbiAgfVxuXG4gIHZhciBzZWFyY2ggPSB0aGlzLnNlYXJjaCB8fCAocXVlcnkgJiYgKCc/JyArIHF1ZXJ5KSkgfHwgJyc7XG5cbiAgaWYgKHByb3RvY29sICYmIHByb3RvY29sLnN1YnN0cigtMSkgIT09ICc6JykgcHJvdG9jb2wgKz0gJzonO1xuXG4gIC8vIG9ubHkgdGhlIHNsYXNoZWRQcm90b2NvbHMgZ2V0IHRoZSAvLy4gIE5vdCBtYWlsdG86LCB4bXBwOiwgZXRjLlxuICAvLyB1bmxlc3MgdGhleSBoYWQgdGhlbSB0byBiZWdpbiB3aXRoLlxuICBpZiAodGhpcy5zbGFzaGVzIHx8XG4gICAgICAoIXByb3RvY29sIHx8IHNsYXNoZWRQcm90b2NvbFtwcm90b2NvbF0pICYmIGhvc3QgIT09IGZhbHNlKSB7XG4gICAgaG9zdCA9ICcvLycgKyAoaG9zdCB8fCAnJyk7XG4gICAgaWYgKHBhdGhuYW1lICYmIHBhdGhuYW1lLmNoYXJBdCgwKSAhPT0gJy8nKSBwYXRobmFtZSA9ICcvJyArIHBhdGhuYW1lO1xuICB9IGVsc2UgaWYgKCFob3N0KSB7XG4gICAgaG9zdCA9ICcnO1xuICB9XG5cbiAgaWYgKGhhc2ggJiYgaGFzaC5jaGFyQXQoMCkgIT09ICcjJykgaGFzaCA9ICcjJyArIGhhc2g7XG4gIGlmIChzZWFyY2ggJiYgc2VhcmNoLmNoYXJBdCgwKSAhPT0gJz8nKSBzZWFyY2ggPSAnPycgKyBzZWFyY2g7XG5cbiAgcGF0aG5hbWUgPSBwYXRobmFtZS5yZXBsYWNlKC9bPyNdL2csIGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChtYXRjaCk7XG4gIH0pO1xuICBzZWFyY2ggPSBzZWFyY2gucmVwbGFjZSgnIycsICclMjMnKTtcblxuICByZXR1cm4gcHJvdG9jb2wgKyBob3N0ICsgcGF0aG5hbWUgKyBzZWFyY2ggKyBoYXNoO1xufTtcblxuZnVuY3Rpb24gdXJsUmVzb2x2ZShzb3VyY2UsIHJlbGF0aXZlKSB7XG4gIHJldHVybiB1cmxQYXJzZShzb3VyY2UsIGZhbHNlLCB0cnVlKS5yZXNvbHZlKHJlbGF0aXZlKTtcbn1cblxuVXJsLnByb3RvdHlwZS5yZXNvbHZlID0gZnVuY3Rpb24ocmVsYXRpdmUpIHtcbiAgcmV0dXJuIHRoaXMucmVzb2x2ZU9iamVjdCh1cmxQYXJzZShyZWxhdGl2ZSwgZmFsc2UsIHRydWUpKS5mb3JtYXQoKTtcbn07XG5cbmZ1bmN0aW9uIHVybFJlc29sdmVPYmplY3Qoc291cmNlLCByZWxhdGl2ZSkge1xuICBpZiAoIXNvdXJjZSkgcmV0dXJuIHJlbGF0aXZlO1xuICByZXR1cm4gdXJsUGFyc2Uoc291cmNlLCBmYWxzZSwgdHJ1ZSkucmVzb2x2ZU9iamVjdChyZWxhdGl2ZSk7XG59XG5cblVybC5wcm90b3R5cGUucmVzb2x2ZU9iamVjdCA9IGZ1bmN0aW9uKHJlbGF0aXZlKSB7XG4gIGlmICh1dGlsLmlzU3RyaW5nKHJlbGF0aXZlKSkge1xuICAgIHZhciByZWwgPSBuZXcgVXJsKCk7XG4gICAgcmVsLnBhcnNlKHJlbGF0aXZlLCBmYWxzZSwgdHJ1ZSk7XG4gICAgcmVsYXRpdmUgPSByZWw7XG4gIH1cblxuICB2YXIgcmVzdWx0ID0gbmV3IFVybCgpO1xuICB2YXIgdGtleXMgPSBPYmplY3Qua2V5cyh0aGlzKTtcbiAgZm9yICh2YXIgdGsgPSAwOyB0ayA8IHRrZXlzLmxlbmd0aDsgdGsrKykge1xuICAgIHZhciB0a2V5ID0gdGtleXNbdGtdO1xuICAgIHJlc3VsdFt0a2V5XSA9IHRoaXNbdGtleV07XG4gIH1cblxuICAvLyBoYXNoIGlzIGFsd2F5cyBvdmVycmlkZGVuLCBubyBtYXR0ZXIgd2hhdC5cbiAgLy8gZXZlbiBocmVmPVwiXCIgd2lsbCByZW1vdmUgaXQuXG4gIHJlc3VsdC5oYXNoID0gcmVsYXRpdmUuaGFzaDtcblxuICAvLyBpZiB0aGUgcmVsYXRpdmUgdXJsIGlzIGVtcHR5LCB0aGVuIHRoZXJlJ3Mgbm90aGluZyBsZWZ0IHRvIGRvIGhlcmUuXG4gIGlmIChyZWxhdGl2ZS5ocmVmID09PSAnJykge1xuICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvLyBocmVmcyBsaWtlIC8vZm9vL2JhciBhbHdheXMgY3V0IHRvIHRoZSBwcm90b2NvbC5cbiAgaWYgKHJlbGF0aXZlLnNsYXNoZXMgJiYgIXJlbGF0aXZlLnByb3RvY29sKSB7XG4gICAgLy8gdGFrZSBldmVyeXRoaW5nIGV4Y2VwdCB0aGUgcHJvdG9jb2wgZnJvbSByZWxhdGl2ZVxuICAgIHZhciBya2V5cyA9IE9iamVjdC5rZXlzKHJlbGF0aXZlKTtcbiAgICBmb3IgKHZhciByayA9IDA7IHJrIDwgcmtleXMubGVuZ3RoOyByaysrKSB7XG4gICAgICB2YXIgcmtleSA9IHJrZXlzW3JrXTtcbiAgICAgIGlmIChya2V5ICE9PSAncHJvdG9jb2wnKVxuICAgICAgICByZXN1bHRbcmtleV0gPSByZWxhdGl2ZVtya2V5XTtcbiAgICB9XG5cbiAgICAvL3VybFBhcnNlIGFwcGVuZHMgdHJhaWxpbmcgLyB0byB1cmxzIGxpa2UgaHR0cDovL3d3dy5leGFtcGxlLmNvbVxuICAgIGlmIChzbGFzaGVkUHJvdG9jb2xbcmVzdWx0LnByb3RvY29sXSAmJlxuICAgICAgICByZXN1bHQuaG9zdG5hbWUgJiYgIXJlc3VsdC5wYXRobmFtZSkge1xuICAgICAgcmVzdWx0LnBhdGggPSByZXN1bHQucGF0aG5hbWUgPSAnLyc7XG4gICAgfVxuXG4gICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGlmIChyZWxhdGl2ZS5wcm90b2NvbCAmJiByZWxhdGl2ZS5wcm90b2NvbCAhPT0gcmVzdWx0LnByb3RvY29sKSB7XG4gICAgLy8gaWYgaXQncyBhIGtub3duIHVybCBwcm90b2NvbCwgdGhlbiBjaGFuZ2luZ1xuICAgIC8vIHRoZSBwcm90b2NvbCBkb2VzIHdlaXJkIHRoaW5nc1xuICAgIC8vIGZpcnN0LCBpZiBpdCdzIG5vdCBmaWxlOiwgdGhlbiB3ZSBNVVNUIGhhdmUgYSBob3N0LFxuICAgIC8vIGFuZCBpZiB0aGVyZSB3YXMgYSBwYXRoXG4gICAgLy8gdG8gYmVnaW4gd2l0aCwgdGhlbiB3ZSBNVVNUIGhhdmUgYSBwYXRoLlxuICAgIC8vIGlmIGl0IGlzIGZpbGU6LCB0aGVuIHRoZSBob3N0IGlzIGRyb3BwZWQsXG4gICAgLy8gYmVjYXVzZSB0aGF0J3Mga25vd24gdG8gYmUgaG9zdGxlc3MuXG4gICAgLy8gYW55dGhpbmcgZWxzZSBpcyBhc3N1bWVkIHRvIGJlIGFic29sdXRlLlxuICAgIGlmICghc2xhc2hlZFByb3RvY29sW3JlbGF0aXZlLnByb3RvY29sXSkge1xuICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhyZWxhdGl2ZSk7XG4gICAgICBmb3IgKHZhciB2ID0gMDsgdiA8IGtleXMubGVuZ3RoOyB2KyspIHtcbiAgICAgICAgdmFyIGsgPSBrZXlzW3ZdO1xuICAgICAgICByZXN1bHRba10gPSByZWxhdGl2ZVtrXTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICByZXN1bHQucHJvdG9jb2wgPSByZWxhdGl2ZS5wcm90b2NvbDtcbiAgICBpZiAoIXJlbGF0aXZlLmhvc3QgJiYgIWhvc3RsZXNzUHJvdG9jb2xbcmVsYXRpdmUucHJvdG9jb2xdKSB7XG4gICAgICB2YXIgcmVsUGF0aCA9IChyZWxhdGl2ZS5wYXRobmFtZSB8fCAnJykuc3BsaXQoJy8nKTtcbiAgICAgIHdoaWxlIChyZWxQYXRoLmxlbmd0aCAmJiAhKHJlbGF0aXZlLmhvc3QgPSByZWxQYXRoLnNoaWZ0KCkpKTtcbiAgICAgIGlmICghcmVsYXRpdmUuaG9zdCkgcmVsYXRpdmUuaG9zdCA9ICcnO1xuICAgICAgaWYgKCFyZWxhdGl2ZS5ob3N0bmFtZSkgcmVsYXRpdmUuaG9zdG5hbWUgPSAnJztcbiAgICAgIGlmIChyZWxQYXRoWzBdICE9PSAnJykgcmVsUGF0aC51bnNoaWZ0KCcnKTtcbiAgICAgIGlmIChyZWxQYXRoLmxlbmd0aCA8IDIpIHJlbFBhdGgudW5zaGlmdCgnJyk7XG4gICAgICByZXN1bHQucGF0aG5hbWUgPSByZWxQYXRoLmpvaW4oJy8nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0LnBhdGhuYW1lID0gcmVsYXRpdmUucGF0aG5hbWU7XG4gICAgfVxuICAgIHJlc3VsdC5zZWFyY2ggPSByZWxhdGl2ZS5zZWFyY2g7XG4gICAgcmVzdWx0LnF1ZXJ5ID0gcmVsYXRpdmUucXVlcnk7XG4gICAgcmVzdWx0Lmhvc3QgPSByZWxhdGl2ZS5ob3N0IHx8ICcnO1xuICAgIHJlc3VsdC5hdXRoID0gcmVsYXRpdmUuYXV0aDtcbiAgICByZXN1bHQuaG9zdG5hbWUgPSByZWxhdGl2ZS5ob3N0bmFtZSB8fCByZWxhdGl2ZS5ob3N0O1xuICAgIHJlc3VsdC5wb3J0ID0gcmVsYXRpdmUucG9ydDtcbiAgICAvLyB0byBzdXBwb3J0IGh0dHAucmVxdWVzdFxuICAgIGlmIChyZXN1bHQucGF0aG5hbWUgfHwgcmVzdWx0LnNlYXJjaCkge1xuICAgICAgdmFyIHAgPSByZXN1bHQucGF0aG5hbWUgfHwgJyc7XG4gICAgICB2YXIgcyA9IHJlc3VsdC5zZWFyY2ggfHwgJyc7XG4gICAgICByZXN1bHQucGF0aCA9IHAgKyBzO1xuICAgIH1cbiAgICByZXN1bHQuc2xhc2hlcyA9IHJlc3VsdC5zbGFzaGVzIHx8IHJlbGF0aXZlLnNsYXNoZXM7XG4gICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHZhciBpc1NvdXJjZUFicyA9IChyZXN1bHQucGF0aG5hbWUgJiYgcmVzdWx0LnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nKSxcbiAgICAgIGlzUmVsQWJzID0gKFxuICAgICAgICAgIHJlbGF0aXZlLmhvc3QgfHxcbiAgICAgICAgICByZWxhdGl2ZS5wYXRobmFtZSAmJiByZWxhdGl2ZS5wYXRobmFtZS5jaGFyQXQoMCkgPT09ICcvJ1xuICAgICAgKSxcbiAgICAgIG11c3RFbmRBYnMgPSAoaXNSZWxBYnMgfHwgaXNTb3VyY2VBYnMgfHxcbiAgICAgICAgICAgICAgICAgICAgKHJlc3VsdC5ob3N0ICYmIHJlbGF0aXZlLnBhdGhuYW1lKSksXG4gICAgICByZW1vdmVBbGxEb3RzID0gbXVzdEVuZEFicyxcbiAgICAgIHNyY1BhdGggPSByZXN1bHQucGF0aG5hbWUgJiYgcmVzdWx0LnBhdGhuYW1lLnNwbGl0KCcvJykgfHwgW10sXG4gICAgICByZWxQYXRoID0gcmVsYXRpdmUucGF0aG5hbWUgJiYgcmVsYXRpdmUucGF0aG5hbWUuc3BsaXQoJy8nKSB8fCBbXSxcbiAgICAgIHBzeWNob3RpYyA9IHJlc3VsdC5wcm90b2NvbCAmJiAhc2xhc2hlZFByb3RvY29sW3Jlc3VsdC5wcm90b2NvbF07XG5cbiAgLy8gaWYgdGhlIHVybCBpcyBhIG5vbi1zbGFzaGVkIHVybCwgdGhlbiByZWxhdGl2ZVxuICAvLyBsaW5rcyBsaWtlIC4uLy4uIHNob3VsZCBiZSBhYmxlXG4gIC8vIHRvIGNyYXdsIHVwIHRvIHRoZSBob3N0bmFtZSwgYXMgd2VsbC4gIFRoaXMgaXMgc3RyYW5nZS5cbiAgLy8gcmVzdWx0LnByb3RvY29sIGhhcyBhbHJlYWR5IGJlZW4gc2V0IGJ5IG5vdy5cbiAgLy8gTGF0ZXIgb24sIHB1dCB0aGUgZmlyc3QgcGF0aCBwYXJ0IGludG8gdGhlIGhvc3QgZmllbGQuXG4gIGlmIChwc3ljaG90aWMpIHtcbiAgICByZXN1bHQuaG9zdG5hbWUgPSAnJztcbiAgICByZXN1bHQucG9ydCA9IG51bGw7XG4gICAgaWYgKHJlc3VsdC5ob3N0KSB7XG4gICAgICBpZiAoc3JjUGF0aFswXSA9PT0gJycpIHNyY1BhdGhbMF0gPSByZXN1bHQuaG9zdDtcbiAgICAgIGVsc2Ugc3JjUGF0aC51bnNoaWZ0KHJlc3VsdC5ob3N0KTtcbiAgICB9XG4gICAgcmVzdWx0Lmhvc3QgPSAnJztcbiAgICBpZiAocmVsYXRpdmUucHJvdG9jb2wpIHtcbiAgICAgIHJlbGF0aXZlLmhvc3RuYW1lID0gbnVsbDtcbiAgICAgIHJlbGF0aXZlLnBvcnQgPSBudWxsO1xuICAgICAgaWYgKHJlbGF0aXZlLmhvc3QpIHtcbiAgICAgICAgaWYgKHJlbFBhdGhbMF0gPT09ICcnKSByZWxQYXRoWzBdID0gcmVsYXRpdmUuaG9zdDtcbiAgICAgICAgZWxzZSByZWxQYXRoLnVuc2hpZnQocmVsYXRpdmUuaG9zdCk7XG4gICAgICB9XG4gICAgICByZWxhdGl2ZS5ob3N0ID0gbnVsbDtcbiAgICB9XG4gICAgbXVzdEVuZEFicyA9IG11c3RFbmRBYnMgJiYgKHJlbFBhdGhbMF0gPT09ICcnIHx8IHNyY1BhdGhbMF0gPT09ICcnKTtcbiAgfVxuXG4gIGlmIChpc1JlbEFicykge1xuICAgIC8vIGl0J3MgYWJzb2x1dGUuXG4gICAgcmVzdWx0Lmhvc3QgPSAocmVsYXRpdmUuaG9zdCB8fCByZWxhdGl2ZS5ob3N0ID09PSAnJykgP1xuICAgICAgICAgICAgICAgICAgcmVsYXRpdmUuaG9zdCA6IHJlc3VsdC5ob3N0O1xuICAgIHJlc3VsdC5ob3N0bmFtZSA9IChyZWxhdGl2ZS5ob3N0bmFtZSB8fCByZWxhdGl2ZS5ob3N0bmFtZSA9PT0gJycpID9cbiAgICAgICAgICAgICAgICAgICAgICByZWxhdGl2ZS5ob3N0bmFtZSA6IHJlc3VsdC5ob3N0bmFtZTtcbiAgICByZXN1bHQuc2VhcmNoID0gcmVsYXRpdmUuc2VhcmNoO1xuICAgIHJlc3VsdC5xdWVyeSA9IHJlbGF0aXZlLnF1ZXJ5O1xuICAgIHNyY1BhdGggPSByZWxQYXRoO1xuICAgIC8vIGZhbGwgdGhyb3VnaCB0byB0aGUgZG90LWhhbmRsaW5nIGJlbG93LlxuICB9IGVsc2UgaWYgKHJlbFBhdGgubGVuZ3RoKSB7XG4gICAgLy8gaXQncyByZWxhdGl2ZVxuICAgIC8vIHRocm93IGF3YXkgdGhlIGV4aXN0aW5nIGZpbGUsIGFuZCB0YWtlIHRoZSBuZXcgcGF0aCBpbnN0ZWFkLlxuICAgIGlmICghc3JjUGF0aCkgc3JjUGF0aCA9IFtdO1xuICAgIHNyY1BhdGgucG9wKCk7XG4gICAgc3JjUGF0aCA9IHNyY1BhdGguY29uY2F0KHJlbFBhdGgpO1xuICAgIHJlc3VsdC5zZWFyY2ggPSByZWxhdGl2ZS5zZWFyY2g7XG4gICAgcmVzdWx0LnF1ZXJ5ID0gcmVsYXRpdmUucXVlcnk7XG4gIH0gZWxzZSBpZiAoIXV0aWwuaXNOdWxsT3JVbmRlZmluZWQocmVsYXRpdmUuc2VhcmNoKSkge1xuICAgIC8vIGp1c3QgcHVsbCBvdXQgdGhlIHNlYXJjaC5cbiAgICAvLyBsaWtlIGhyZWY9Jz9mb28nLlxuICAgIC8vIFB1dCB0aGlzIGFmdGVyIHRoZSBvdGhlciB0d28gY2FzZXMgYmVjYXVzZSBpdCBzaW1wbGlmaWVzIHRoZSBib29sZWFuc1xuICAgIGlmIChwc3ljaG90aWMpIHtcbiAgICAgIHJlc3VsdC5ob3N0bmFtZSA9IHJlc3VsdC5ob3N0ID0gc3JjUGF0aC5zaGlmdCgpO1xuICAgICAgLy9vY2NhdGlvbmFseSB0aGUgYXV0aCBjYW4gZ2V0IHN0dWNrIG9ubHkgaW4gaG9zdFxuICAgICAgLy90aGlzIGVzcGVjaWFsbHkgaGFwcGVucyBpbiBjYXNlcyBsaWtlXG4gICAgICAvL3VybC5yZXNvbHZlT2JqZWN0KCdtYWlsdG86bG9jYWwxQGRvbWFpbjEnLCAnbG9jYWwyQGRvbWFpbjInKVxuICAgICAgdmFyIGF1dGhJbkhvc3QgPSByZXN1bHQuaG9zdCAmJiByZXN1bHQuaG9zdC5pbmRleE9mKCdAJykgPiAwID9cbiAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lmhvc3Quc3BsaXQoJ0AnKSA6IGZhbHNlO1xuICAgICAgaWYgKGF1dGhJbkhvc3QpIHtcbiAgICAgICAgcmVzdWx0LmF1dGggPSBhdXRoSW5Ib3N0LnNoaWZ0KCk7XG4gICAgICAgIHJlc3VsdC5ob3N0ID0gcmVzdWx0Lmhvc3RuYW1lID0gYXV0aEluSG9zdC5zaGlmdCgpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXN1bHQuc2VhcmNoID0gcmVsYXRpdmUuc2VhcmNoO1xuICAgIHJlc3VsdC5xdWVyeSA9IHJlbGF0aXZlLnF1ZXJ5O1xuICAgIC8vdG8gc3VwcG9ydCBodHRwLnJlcXVlc3RcbiAgICBpZiAoIXV0aWwuaXNOdWxsKHJlc3VsdC5wYXRobmFtZSkgfHwgIXV0aWwuaXNOdWxsKHJlc3VsdC5zZWFyY2gpKSB7XG4gICAgICByZXN1bHQucGF0aCA9IChyZXN1bHQucGF0aG5hbWUgPyByZXN1bHQucGF0aG5hbWUgOiAnJykgK1xuICAgICAgICAgICAgICAgICAgICAocmVzdWx0LnNlYXJjaCA/IHJlc3VsdC5zZWFyY2ggOiAnJyk7XG4gICAgfVxuICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBpZiAoIXNyY1BhdGgubGVuZ3RoKSB7XG4gICAgLy8gbm8gcGF0aCBhdCBhbGwuICBlYXN5LlxuICAgIC8vIHdlJ3ZlIGFscmVhZHkgaGFuZGxlZCB0aGUgb3RoZXIgc3R1ZmYgYWJvdmUuXG4gICAgcmVzdWx0LnBhdGhuYW1lID0gbnVsbDtcbiAgICAvL3RvIHN1cHBvcnQgaHR0cC5yZXF1ZXN0XG4gICAgaWYgKHJlc3VsdC5zZWFyY2gpIHtcbiAgICAgIHJlc3VsdC5wYXRoID0gJy8nICsgcmVzdWx0LnNlYXJjaDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0LnBhdGggPSBudWxsO1xuICAgIH1cbiAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLy8gaWYgYSB1cmwgRU5EcyBpbiAuIG9yIC4uLCB0aGVuIGl0IG11c3QgZ2V0IGEgdHJhaWxpbmcgc2xhc2guXG4gIC8vIGhvd2V2ZXIsIGlmIGl0IGVuZHMgaW4gYW55dGhpbmcgZWxzZSBub24tc2xhc2h5LFxuICAvLyB0aGVuIGl0IG11c3QgTk9UIGdldCBhIHRyYWlsaW5nIHNsYXNoLlxuICB2YXIgbGFzdCA9IHNyY1BhdGguc2xpY2UoLTEpWzBdO1xuICB2YXIgaGFzVHJhaWxpbmdTbGFzaCA9IChcbiAgICAgIChyZXN1bHQuaG9zdCB8fCByZWxhdGl2ZS5ob3N0IHx8IHNyY1BhdGgubGVuZ3RoID4gMSkgJiZcbiAgICAgIChsYXN0ID09PSAnLicgfHwgbGFzdCA9PT0gJy4uJykgfHwgbGFzdCA9PT0gJycpO1xuXG4gIC8vIHN0cmlwIHNpbmdsZSBkb3RzLCByZXNvbHZlIGRvdWJsZSBkb3RzIHRvIHBhcmVudCBkaXJcbiAgLy8gaWYgdGhlIHBhdGggdHJpZXMgdG8gZ28gYWJvdmUgdGhlIHJvb3QsIGB1cGAgZW5kcyB1cCA+IDBcbiAgdmFyIHVwID0gMDtcbiAgZm9yICh2YXIgaSA9IHNyY1BhdGgubGVuZ3RoOyBpID49IDA7IGktLSkge1xuICAgIGxhc3QgPSBzcmNQYXRoW2ldO1xuICAgIGlmIChsYXN0ID09PSAnLicpIHtcbiAgICAgIHNyY1BhdGguc3BsaWNlKGksIDEpO1xuICAgIH0gZWxzZSBpZiAobGFzdCA9PT0gJy4uJykge1xuICAgICAgc3JjUGF0aC5zcGxpY2UoaSwgMSk7XG4gICAgICB1cCsrO1xuICAgIH0gZWxzZSBpZiAodXApIHtcbiAgICAgIHNyY1BhdGguc3BsaWNlKGksIDEpO1xuICAgICAgdXAtLTtcbiAgICB9XG4gIH1cblxuICAvLyBpZiB0aGUgcGF0aCBpcyBhbGxvd2VkIHRvIGdvIGFib3ZlIHRoZSByb290LCByZXN0b3JlIGxlYWRpbmcgLi5zXG4gIGlmICghbXVzdEVuZEFicyAmJiAhcmVtb3ZlQWxsRG90cykge1xuICAgIGZvciAoOyB1cC0tOyB1cCkge1xuICAgICAgc3JjUGF0aC51bnNoaWZ0KCcuLicpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChtdXN0RW5kQWJzICYmIHNyY1BhdGhbMF0gIT09ICcnICYmXG4gICAgICAoIXNyY1BhdGhbMF0gfHwgc3JjUGF0aFswXS5jaGFyQXQoMCkgIT09ICcvJykpIHtcbiAgICBzcmNQYXRoLnVuc2hpZnQoJycpO1xuICB9XG5cbiAgaWYgKGhhc1RyYWlsaW5nU2xhc2ggJiYgKHNyY1BhdGguam9pbignLycpLnN1YnN0cigtMSkgIT09ICcvJykpIHtcbiAgICBzcmNQYXRoLnB1c2goJycpO1xuICB9XG5cbiAgdmFyIGlzQWJzb2x1dGUgPSBzcmNQYXRoWzBdID09PSAnJyB8fFxuICAgICAgKHNyY1BhdGhbMF0gJiYgc3JjUGF0aFswXS5jaGFyQXQoMCkgPT09ICcvJyk7XG5cbiAgLy8gcHV0IHRoZSBob3N0IGJhY2tcbiAgaWYgKHBzeWNob3RpYykge1xuICAgIHJlc3VsdC5ob3N0bmFtZSA9IHJlc3VsdC5ob3N0ID0gaXNBYnNvbHV0ZSA/ICcnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNyY1BhdGgubGVuZ3RoID8gc3JjUGF0aC5zaGlmdCgpIDogJyc7XG4gICAgLy9vY2NhdGlvbmFseSB0aGUgYXV0aCBjYW4gZ2V0IHN0dWNrIG9ubHkgaW4gaG9zdFxuICAgIC8vdGhpcyBlc3BlY2lhbGx5IGhhcHBlbnMgaW4gY2FzZXMgbGlrZVxuICAgIC8vdXJsLnJlc29sdmVPYmplY3QoJ21haWx0bzpsb2NhbDFAZG9tYWluMScsICdsb2NhbDJAZG9tYWluMicpXG4gICAgdmFyIGF1dGhJbkhvc3QgPSByZXN1bHQuaG9zdCAmJiByZXN1bHQuaG9zdC5pbmRleE9mKCdAJykgPiAwID9cbiAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5ob3N0LnNwbGl0KCdAJykgOiBmYWxzZTtcbiAgICBpZiAoYXV0aEluSG9zdCkge1xuICAgICAgcmVzdWx0LmF1dGggPSBhdXRoSW5Ib3N0LnNoaWZ0KCk7XG4gICAgICByZXN1bHQuaG9zdCA9IHJlc3VsdC5ob3N0bmFtZSA9IGF1dGhJbkhvc3Quc2hpZnQoKTtcbiAgICB9XG4gIH1cblxuICBtdXN0RW5kQWJzID0gbXVzdEVuZEFicyB8fCAocmVzdWx0Lmhvc3QgJiYgc3JjUGF0aC5sZW5ndGgpO1xuXG4gIGlmIChtdXN0RW5kQWJzICYmICFpc0Fic29sdXRlKSB7XG4gICAgc3JjUGF0aC51bnNoaWZ0KCcnKTtcbiAgfVxuXG4gIGlmICghc3JjUGF0aC5sZW5ndGgpIHtcbiAgICByZXN1bHQucGF0aG5hbWUgPSBudWxsO1xuICAgIHJlc3VsdC5wYXRoID0gbnVsbDtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQucGF0aG5hbWUgPSBzcmNQYXRoLmpvaW4oJy8nKTtcbiAgfVxuXG4gIC8vdG8gc3VwcG9ydCByZXF1ZXN0Lmh0dHBcbiAgaWYgKCF1dGlsLmlzTnVsbChyZXN1bHQucGF0aG5hbWUpIHx8ICF1dGlsLmlzTnVsbChyZXN1bHQuc2VhcmNoKSkge1xuICAgIHJlc3VsdC5wYXRoID0gKHJlc3VsdC5wYXRobmFtZSA/IHJlc3VsdC5wYXRobmFtZSA6ICcnKSArXG4gICAgICAgICAgICAgICAgICAocmVzdWx0LnNlYXJjaCA/IHJlc3VsdC5zZWFyY2ggOiAnJyk7XG4gIH1cbiAgcmVzdWx0LmF1dGggPSByZWxhdGl2ZS5hdXRoIHx8IHJlc3VsdC5hdXRoO1xuICByZXN1bHQuc2xhc2hlcyA9IHJlc3VsdC5zbGFzaGVzIHx8IHJlbGF0aXZlLnNsYXNoZXM7XG4gIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICByZXR1cm4gcmVzdWx0O1xufTtcblxuVXJsLnByb3RvdHlwZS5wYXJzZUhvc3QgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGhvc3QgPSB0aGlzLmhvc3Q7XG4gIHZhciBwb3J0ID0gcG9ydFBhdHRlcm4uZXhlYyhob3N0KTtcbiAgaWYgKHBvcnQpIHtcbiAgICBwb3J0ID0gcG9ydFswXTtcbiAgICBpZiAocG9ydCAhPT0gJzonKSB7XG4gICAgICB0aGlzLnBvcnQgPSBwb3J0LnN1YnN0cigxKTtcbiAgICB9XG4gICAgaG9zdCA9IGhvc3Quc3Vic3RyKDAsIGhvc3QubGVuZ3RoIC0gcG9ydC5sZW5ndGgpO1xuICB9XG4gIGlmIChob3N0KSB0aGlzLmhvc3RuYW1lID0gaG9zdDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpc1N0cmluZzogZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIHR5cGVvZihhcmcpID09PSAnc3RyaW5nJztcbiAgfSxcbiAgaXNPYmplY3Q6IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiB0eXBlb2YoYXJnKSA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xuICB9LFxuICBpc051bGw6IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiBhcmcgPT09IG51bGw7XG4gIH0sXG4gIGlzTnVsbE9yVW5kZWZpbmVkOiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gYXJnID09IG51bGw7XG4gIH1cbn07XG4iXX0=
