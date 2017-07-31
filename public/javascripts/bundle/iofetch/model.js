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
IoConfig.request.credentials = 'same-origin';

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
IoConfig.ioparams.fail = function (result) {
    if (result.code == 'A0002') {
        _APP.Toast.show('未登录');
    } else {
        _APP.Toast.show(result.errmsg || '亲，忙不过来了');
    }
};

/**
 * 调用以下方法的时候，opt如ioparams。但是一般只传以下参数就可以了：
 *   data then (catch)
 *   以下方法已经统一处理了，如果想覆盖自行传入
 *   beforeSend error fail complete
 */
module.exports = {
    //listdata接口
    listdata: function listdata(opt) {
        return Io.request(extend(true, {
            request: {
                method: 'POST'
            },
            url: 'http://127.0.0.1:8000/listdata'
        }, opt));
    }
};

},{"extend":1,"node-io-fetch":3}],3:[function(require,module,exports){
exports.Io = require('./io');
exports.IoConfig = require('./ioconfig');

},{"./io":4,"./ioconfig":5}],4:[function(require,module,exports){
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
    for (var key in data) {
        var val = data[key];
        if (val == undefined) {
            continue;
        } else if (val.constructor == Array) {
            val.forEach(function (v, i) {
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

        return new Promise(function (resolve, reject) {
            race.then(function (response) {
                if (response.ok) {
                    //response.status [200,299]
                    response[conf.type]().then(function (result) {
                        if (conf.dealfail) {
                            //处理业务错误
                            if (IoConfig.fail.filter(result)) {
                                //有业务错误发生
                                if (typeof conf[IoConfig.fail.funname] == 'function') {
                                    //判断默认fail是否是一个有效函数
                                    conf[IoConfig.fail.funname](result);
                                }
                                reject(result);
                            } else {
                                //无业务错误发生
                                if (conf.dealdata) {
                                    resolve(conf.dealdatafun(result));
                                } else {
                                    resolve(result);
                                }
                            }
                        } else {
                            resolve(result);
                        }
                    }, function (error) {
                        throw error;
                    });
                } else {
                    var error = new Error(response.statusText || '网络错误');
                    throw error;
                }
                conf.complete();
                conf.getResponse(response);
            }).catch(function (error) {
                //捕获任何错误，即发生语法错误也会捕获
                conf.error(error);
                conf.complete();
            });
        });
    }
};

},{"./ioconfig":5,"extend":6,"querystring":10,"whatwg-fetch":7}],5:[function(require,module,exports){
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
    credentials: 'include'
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
   * 获取fetch返回的response对象。fail,then和catch发生的时候，可以获取到此对象
   * @param {Response} response 返回的response对象
   * @return {[type]}          [description]
   */
  getResponse: function (response) {},
  /**
   * 对于接口返回错误，一般因为网络原因，进行的统一处理
   */
  error: function (error) {
    //error或有或无 error.message
    //Alert.alert('系统消息',error.message || '亲，忙不过来了');
  },
  /**
   * 如果fail配置了funname为fail,则调用此方法. 此时fail.filter返回true
   * 在此可进行统一业务错误处理
   * @param {Object|Other} result 接口返回数据
   * @return {[type]} [description]
   */
  fail: function (result) {
    //Alert.alert('系统消息',result.errmsg || '亲，忙不过来了');
  },
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

/**
 * 本来下面这两项配置是放在that.ioparams里面的，但是后面改版，采用promise方式传递以下这两项。
 * 也就是说，that.iocallback其实是个介绍，并无实际意义
 * @type {Object}
 */
that.iocallback = {
  /**
   * 业务错误处理。
   * 如果fail配置了funname为fail，并且fail.filter返回true，则默认调用that.ioparams.fail处理方法
   * 配置了catch，也会调用catch
   * 如果配置了io请求参数fail为null，则不会调用that.ioparams.fail
   * @param {Object|Other} result 接口返回数据
   * @return {[type]} [description]
   */
  catch: function (result) {
    //Alert.alert('系统消息',result.errmsg || '亲，忙不过来了');
  },
  /**
   * 成功调用方法。调用的情况有如下几种：
   * 1. dealfail为true, 则fail.filter返回false时，调用success
   *          此时如果dealdata为true, 则result为dealdatafun返回的数据
   * 2. dealfail为false时，则接口返回后直接调用此方法（不发生error的情况下）
   *
   * @param {Object|Other} result 接口返回数据
   */
  then: function (result) {}
};

module.exports = that;

},{}],6:[function(require,module,exports){
arguments[4][1][0].apply(exports,arguments)
},{"dup":1}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":8,"./encode":9}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3Rvb2wvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIm5vZGVfbW9kdWxlcy9leHRlbmQvaW5kZXguanMiLCJwdWJsaWNcXGphdmFzY3JpcHRzXFxwYWdlXFxpb2ZldGNoXFxtb2RlbC5qcyIsIi4uL25vZGUtaW8tZmV0Y2gvaW5kZXguanMiLCIuLlxcbm9kZS1pby1mZXRjaFxcaW8uanMiLCIuLlxcbm9kZS1pby1mZXRjaFxcaW9jb25maWcuanMiLCIuLi9ub2RlLWlvLWZldGNoL25vZGVfbW9kdWxlcy93aGF0d2ctZmV0Y2gvZmV0Y2guanMiLCIuLi90b29sL25vZGVfbW9kdWxlcy9xdWVyeXN0cmluZy1lczMvZGVjb2RlLmpzIiwiLi4vdG9vbC9ub2RlX21vZHVsZXMvcXVlcnlzdHJpbmctZXMzL2VuY29kZS5qcyIsIi4uL3Rvb2wvbm9kZV9tb2R1bGVzL3F1ZXJ5c3RyaW5nLWVzMy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN2NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG52YXIgdG9TdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG52YXIgaXNBcnJheSA9IGZ1bmN0aW9uIGlzQXJyYXkoYXJyKSB7XG5cdGlmICh0eXBlb2YgQXJyYXkuaXNBcnJheSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdHJldHVybiBBcnJheS5pc0FycmF5KGFycik7XG5cdH1cblxuXHRyZXR1cm4gdG9TdHIuY2FsbChhcnIpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcblxudmFyIGlzUGxhaW5PYmplY3QgPSBmdW5jdGlvbiBpc1BsYWluT2JqZWN0KG9iaikge1xuXHRpZiAoIW9iaiB8fCB0b1N0ci5jYWxsKG9iaikgIT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0dmFyIGhhc093bkNvbnN0cnVjdG9yID0gaGFzT3duLmNhbGwob2JqLCAnY29uc3RydWN0b3InKTtcblx0dmFyIGhhc0lzUHJvdG90eXBlT2YgPSBvYmouY29uc3RydWN0b3IgJiYgb2JqLmNvbnN0cnVjdG9yLnByb3RvdHlwZSAmJiBoYXNPd24uY2FsbChvYmouY29uc3RydWN0b3IucHJvdG90eXBlLCAnaXNQcm90b3R5cGVPZicpO1xuXHQvLyBOb3Qgb3duIGNvbnN0cnVjdG9yIHByb3BlcnR5IG11c3QgYmUgT2JqZWN0XG5cdGlmIChvYmouY29uc3RydWN0b3IgJiYgIWhhc093bkNvbnN0cnVjdG9yICYmICFoYXNJc1Byb3RvdHlwZU9mKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Ly8gT3duIHByb3BlcnRpZXMgYXJlIGVudW1lcmF0ZWQgZmlyc3RseSwgc28gdG8gc3BlZWQgdXAsXG5cdC8vIGlmIGxhc3Qgb25lIGlzIG93biwgdGhlbiBhbGwgcHJvcGVydGllcyBhcmUgb3duLlxuXHR2YXIga2V5O1xuXHRmb3IgKGtleSBpbiBvYmopIHsvKiovfVxuXG5cdHJldHVybiB0eXBlb2Yga2V5ID09PSAndW5kZWZpbmVkJyB8fCBoYXNPd24uY2FsbChvYmosIGtleSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGV4dGVuZCgpIHtcblx0dmFyIG9wdGlvbnMsIG5hbWUsIHNyYywgY29weSwgY29weUlzQXJyYXksIGNsb25lLFxuXHRcdHRhcmdldCA9IGFyZ3VtZW50c1swXSxcblx0XHRpID0gMSxcblx0XHRsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoLFxuXHRcdGRlZXAgPSBmYWxzZTtcblxuXHQvLyBIYW5kbGUgYSBkZWVwIGNvcHkgc2l0dWF0aW9uXG5cdGlmICh0eXBlb2YgdGFyZ2V0ID09PSAnYm9vbGVhbicpIHtcblx0XHRkZWVwID0gdGFyZ2V0O1xuXHRcdHRhcmdldCA9IGFyZ3VtZW50c1sxXSB8fCB7fTtcblx0XHQvLyBza2lwIHRoZSBib29sZWFuIGFuZCB0aGUgdGFyZ2V0XG5cdFx0aSA9IDI7XG5cdH0gZWxzZSBpZiAoKHR5cGVvZiB0YXJnZXQgIT09ICdvYmplY3QnICYmIHR5cGVvZiB0YXJnZXQgIT09ICdmdW5jdGlvbicpIHx8IHRhcmdldCA9PSBudWxsKSB7XG5cdFx0dGFyZ2V0ID0ge307XG5cdH1cblxuXHRmb3IgKDsgaSA8IGxlbmd0aDsgKytpKSB7XG5cdFx0b3B0aW9ucyA9IGFyZ3VtZW50c1tpXTtcblx0XHQvLyBPbmx5IGRlYWwgd2l0aCBub24tbnVsbC91bmRlZmluZWQgdmFsdWVzXG5cdFx0aWYgKG9wdGlvbnMgIT0gbnVsbCkge1xuXHRcdFx0Ly8gRXh0ZW5kIHRoZSBiYXNlIG9iamVjdFxuXHRcdFx0Zm9yIChuYW1lIGluIG9wdGlvbnMpIHtcblx0XHRcdFx0c3JjID0gdGFyZ2V0W25hbWVdO1xuXHRcdFx0XHRjb3B5ID0gb3B0aW9uc1tuYW1lXTtcblxuXHRcdFx0XHQvLyBQcmV2ZW50IG5ldmVyLWVuZGluZyBsb29wXG5cdFx0XHRcdGlmICh0YXJnZXQgIT09IGNvcHkpIHtcblx0XHRcdFx0XHQvLyBSZWN1cnNlIGlmIHdlJ3JlIG1lcmdpbmcgcGxhaW4gb2JqZWN0cyBvciBhcnJheXNcblx0XHRcdFx0XHRpZiAoZGVlcCAmJiBjb3B5ICYmIChpc1BsYWluT2JqZWN0KGNvcHkpIHx8IChjb3B5SXNBcnJheSA9IGlzQXJyYXkoY29weSkpKSkge1xuXHRcdFx0XHRcdFx0aWYgKGNvcHlJc0FycmF5KSB7XG5cdFx0XHRcdFx0XHRcdGNvcHlJc0FycmF5ID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdGNsb25lID0gc3JjICYmIGlzQXJyYXkoc3JjKSA/IHNyYyA6IFtdO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Y2xvbmUgPSBzcmMgJiYgaXNQbGFpbk9iamVjdChzcmMpID8gc3JjIDoge307XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdC8vIE5ldmVyIG1vdmUgb3JpZ2luYWwgb2JqZWN0cywgY2xvbmUgdGhlbVxuXHRcdFx0XHRcdFx0dGFyZ2V0W25hbWVdID0gZXh0ZW5kKGRlZXAsIGNsb25lLCBjb3B5KTtcblxuXHRcdFx0XHRcdC8vIERvbid0IGJyaW5nIGluIHVuZGVmaW5lZCB2YWx1ZXNcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiBjb3B5ICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHRcdFx0dGFyZ2V0W25hbWVdID0gY29weTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvLyBSZXR1cm4gdGhlIG1vZGlmaWVkIG9iamVjdFxuXHRyZXR1cm4gdGFyZ2V0O1xufTtcblxuIiwiLyoqXHJcbiAqIOaUvuWIsOiHquW3semhueebruS4re+8jOe7n+S4gOWumuS5ieeahGlv5aSE55CG5bGCXHJcbiAqXHJcbiAqIOS9v+eUqG5wbeWMhe+8mm5vZGUtaW8tZmV0Y2jlrp7njrBcclxuICovXHJcbmNvbnN0IHtJb0NvbmZpZyxJb30gPSByZXF1aXJlKCdub2RlLWlvLWZldGNoJyk7XHJcbmNvbnN0IGV4dGVuZCA9IHJlcXVpcmUoJ2V4dGVuZCcpO1xyXG5cclxuLyoqXHJcbiAqIOiuvue9ruiHquW3seeahOmFjee9rlxyXG4gKi9cclxuSW9Db25maWcucmVxdWVzdC5jcmVkZW50aWFscyA9ICdzYW1lLW9yaWdpbic7XHJcblxyXG4vKipcclxuICog5aaC5p6cZGF0YeaYr2pzb27vvIzkuJRtZXRob2TkuI3mmK9HRVTmiJZIRUFE77yM5piv5ZCm5bCGZGF0YeagvOW8j+WMluaIkGZvcm0tZGF0YeaVsOaNruS8oOmAklxyXG4gKiBAdHlwZSB7Qm9vbGVhbn1cclxuICovXHJcbklvQ29uZmlnLmlvcGFyYW1zLmlzZm9ybWRhdGEgPSB0cnVlO1xyXG4vKipcclxuICog5Lia5Yqh6ZSZ6K+v5p2h5Lu26YWN572uXHJcbiAqIEBwYXJhbSAge1t0eXBlXX0gcmVzdWx0IFtkZXNjcmlwdGlvbl1cclxuICogQHJldHVybiB7W3R5cGVdfSAgICAgICAgW2Rlc2NyaXB0aW9uXVxyXG4gKi9cclxuSW9Db25maWcuZmFpbC5maWx0ZXIgPSBmdW5jdGlvbihyZXN1bHQpe1xyXG4gICAgaWYocmVzdWx0LmNvZGUgIT0gJ0EwMDAxJyl7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7IC8v6K+05piO5Y+R55Sf5LqG5Lia5Yqh6ZSZ6K+vXHJcbiAgICB9ZWxzZXtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBpb+ivt+axguWPkemAgeWJjeaJp+ihjFxyXG4gKiBAcmV0dXJuIHtbdHlwZV19IFtkZXNjcmlwdGlvbl1cclxuICovXHJcbklvQ29uZmlnLmlvcGFyYW1zLmJlZm9yZVNlbmQgPSBmdW5jdGlvbigpe1xyXG4gICAgY29uc29sZS5sb2coJ+ivt+axguW8gOWniycpO1xyXG4gICAgLy8gX0FQUC5Mb2FkaW5nLnNob3coKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIGlv6K+35rGC57uT5p2f5ZCOXHJcbiAqL1xyXG5Jb0NvbmZpZy5pb3BhcmFtcy5jb21wbGV0ZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICBjb25zb2xlLmxvZygn6K+35rGC57uT5p2fJyk7XHJcbiAgICAvLyBfQVBQLkxvYWRpbmcuaGlkZSgpO1xyXG59XHJcblxyXG4vKipcclxuICog572R57uc6ZSZ6K+v5oiW6ICF57O757uf6ZSZ6K+vXHJcbiAqIEBwYXJhbSAge1t0eXBlXX0gZXJyb3IgW2Rlc2NyaXB0aW9uXVxyXG4gKiBAcmV0dXJuIHtbdHlwZV19ICAgICAgIFtkZXNjcmlwdGlvbl1cclxuICovXHJcbklvQ29uZmlnLmlvcGFyYW1zLmVycm9yID0gZnVuY3Rpb24oZXJyb3Ipe1xyXG4gICAgLy9lcnJvcuaIluacieaIluaXoCBlcnJvci5tZXNzYWdlXHJcbiAgICBfQVBQLlRvYXN0LnNob3coZXJyb3IubWVzc2FnZSB8fCAn5Lqy77yM5b+Z5LiN6L+H5p2l5LqGJyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDkuJrliqHplJnor6/lpITnkIZcclxuICogQHBhcmFtICB7W3R5cGVdfSByZXN1bHQgICBbZGVzY3JpcHRpb25dXHJcbiAqIEBwYXJhbSAge1t0eXBlXX0gcmVzcG9uc2UgW2Rlc2NyaXB0aW9uXVxyXG4gKiBAcmV0dXJuIHtbdHlwZV19ICAgICAgICAgIFtkZXNjcmlwdGlvbl1cclxuICovXHJcbklvQ29uZmlnLmlvcGFyYW1zLmZhaWwgPSBmdW5jdGlvbihyZXN1bHQpe1xyXG4gICAgaWYocmVzdWx0LmNvZGUgPT0gJ0EwMDAyJyl7XHJcbiAgICAgICAgX0FQUC5Ub2FzdC5zaG93KCfmnKrnmbvlvZUnKTtcclxuICAgIH1lbHNle1xyXG4gICAgICAgIF9BUFAuVG9hc3Quc2hvdyhyZXN1bHQuZXJybXNnIHx8ICfkurLvvIzlv5nkuI3ov4fmnaXkuoYnKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOiwg+eUqOS7peS4i+aWueazleeahOaXtuWAme+8jG9wdOWmgmlvcGFyYW1z44CC5L2G5piv5LiA6Iis5Y+q5Lyg5Lul5LiL5Y+C5pWw5bCx5Y+v5Lul5LqG77yaXHJcbiAqICAgZGF0YSB0aGVuIChjYXRjaClcclxuICogICDku6XkuIvmlrnms5Xlt7Lnu4/nu5/kuIDlpITnkIbkuobvvIzlpoLmnpzmg7Popobnm5boh6rooYzkvKDlhaVcclxuICogICBiZWZvcmVTZW5kIGVycm9yIGZhaWwgY29tcGxldGVcclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgLy9saXN0ZGF0YeaOpeWPo1xyXG4gICAgbGlzdGRhdGEob3B0KXtcclxuICAgICAgICByZXR1cm4gSW8ucmVxdWVzdChleHRlbmQodHJ1ZSx7XHJcbiAgICAgICAgICAgIHJlcXVlc3Q6IHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHVybDogJ2h0dHA6Ly8xMjcuMC4wLjE6ODAwMC9saXN0ZGF0YSdcclxuICAgICAgICB9LG9wdCkpO1xyXG4gICAgfVxyXG59O1xyXG4iLCJleHBvcnRzLklvID0gcmVxdWlyZSgnLi9pbycpO1xyXG5leHBvcnRzLklvQ29uZmlnID0gcmVxdWlyZSgnLi9pb2NvbmZpZycpO1xyXG4iLCIvKipcclxuICogQGZpbGVvdmVydmlldyBpb+ivt+axguaAu2FcclxuICovXHJcbnJlcXVpcmUoJ3doYXR3Zy1mZXRjaCcpO1xyXG5jb25zdCBJb0NvbmZpZyA9IHJlcXVpcmUoJy4vaW9jb25maWcnKTtcclxuY29uc3QgZXh0ZW5kID0gcmVxdWlyZSgnZXh0ZW5kJyk7XHJcbmNvbnN0IHF1ZXJ5c3RyaW5nID0gcmVxdWlyZSgncXVlcnlzdHJpbmcnKTtcclxuXHJcbi8qKlxyXG4gKiDlsIZkYXRh5qC85byP5YyW5oiQRm9ybURhdGFcclxuICogQHBhcmFtICB7SlNPTn0gZGF0YSBbZGVzY3JpcHRpb25dXHJcbiAqIEByZXR1cm4ge0Zvcm1EYXRhfSAgICAgIFtkZXNjcmlwdGlvbl1cclxuICovXHJcbmZ1bmN0aW9uIGZvcm1hdEZvcm1EYXRhKGRhdGEpe1xyXG4gICAgdmFyIF9mb3JtZGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xyXG4gICAgZm9yKHZhciBrZXkgaW4gZGF0YSl7XHJcbiAgICAgICAgdmFyIHZhbCA9IGRhdGFba2V5XTtcclxuICAgICAgICBpZih2YWwgPT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfWVsc2UgaWYodmFsLmNvbnN0cnVjdG9yID09IEFycmF5KXtcclxuICAgICAgICAgICAgdmFsLmZvckVhY2goZnVuY3Rpb24odixpKXtcclxuICAgICAgICAgICAgICAgIF9mb3JtZGF0YS5hcHBlbmQoa2V5LHYpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIF9mb3JtZGF0YS5hcHBlbmQoa2V5LHZhbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIF9mb3JtZGF0YTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICAvKipcclxuICAgICAqIOWPkei1t2lv6K+35rGCXHJcbiAgICAgKiBAcGFyYW0gIHtKU09OfSBpb3BhcmFtcyDlkIxpb2NvbmZpZy5pb3BhcmFtc1xyXG4gICAgICogQHJldHVybiB7W3R5cGVdfSAgICAgICAgICBbZGVzY3JpcHRpb25dXHJcbiAgICAgKi9cclxuICAgIHJlcXVlc3Q6IGZ1bmN0aW9uKGlvcGFyYW1zKSB7XHJcbiAgICAgICAgaWYoaW9wYXJhbXMudXJsID09ICcnKXtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpb+WPguaVsHVybOS4jeiDveS4uuepuicpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBjb25mID0ge307XHJcblxyXG4gICAgICAgIGV4dGVuZCh0cnVlLGNvbmYsSW9Db25maWcuaW9wYXJhbXMsaW9wYXJhbXMpO1xyXG5cclxuICAgICAgICBjb25mLnJlcXVlc3QubWV0aG9kID0gY29uZi5yZXF1ZXN0Lm1ldGhvZC50b1VwcGVyQ2FzZSgpO1xyXG5cclxuICAgICAgICAvL+ajgOa1i2lvcGFyYW1z6YeM55qEZGF0YVxyXG4gICAgICAgIHZhciBib2R5ID0gY29uZi5kYXRhLCBfbWV0aG9kID0gY29uZi5yZXF1ZXN0Lm1ldGhvZDtcclxuXHJcbiAgICAgICAgaWYoYm9keSAmJiBib2R5LmNvbnN0cnVjdG9yID09PSBPYmplY3QpeyAvL+ivtOaYjmRhdGHmmK9qc29uXHJcbiAgICAgICAgICAgIGlmKF9tZXRob2QgIT0gJ0dFVCcgJiYgX21ldGhvZCAhPSAnSEVBRCcgJiYgY29uZi5pc2Zvcm1kYXRhKXtcclxuICAgICAgICAgICAgICAgIGJvZHkgPSBmb3JtYXRGb3JtRGF0YShib2R5KTtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBjb25mLmhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIGJvZHkgPSBxdWVyeXN0cmluZy5zdHJpbmdpZnkoYm9keSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKGNvbmYuaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPT09IGZhbHNlKXtcclxuICAgICAgICAgICAgZGVsZXRlIGNvbmYuaGVhZGVyc1snQ29udGVudC1UeXBlJ107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL+i1i+WAvHJlcXVlc3QuYm9keVxyXG4gICAgICAgIGlmKGJvZHkpe1xyXG4gICAgICAgICAgICBzd2l0Y2goX21ldGhvZCl7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdHRVQnOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmKHR5cGVvZiBib2R5ID09ICdzdHJpbmcnKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZi51cmwgKz0gJz8nK2JvZHkudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdIRUFEJzpcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgY29uZi5yZXF1ZXN0LmJvZHkgPSBib2R5O1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL+WPkei1t+ivt+axglxyXG4gICAgICAgIGNvbmYucmVxdWVzdC5oZWFkZXJzID0gY29uZi5oZWFkZXJzO1xyXG4gICAgICAgIHZhciBteXJlcXVlc3QgPSBuZXcgUmVxdWVzdChjb25mLnVybCxjb25mLnJlcXVlc3QpO1xyXG5cclxuICAgICAgICAvL+ivt+axguWPkei1t+WJjee7n+S4gOWkhOeQhlxyXG4gICAgICAgIGNvbmYuYmVmb3JlU2VuZCgpO1xyXG5cclxuICAgICAgICB2YXIgcmFjZSA9IFByb21pc2UucmFjZShbXHJcbiAgICAgICAgICAgIGZldGNoKG15cmVxdWVzdCksXHJcbiAgICAgICAgICAgIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUscmVqZWN0KXtcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQocmVqZWN0LGNvbmYudGltZW91dCxuZXcgRXJyb3IoJ+ivt+axgui2heaXticpKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUscmVqZWN0KXtcclxuICAgICAgICAgICAgcmFjZS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuICAgICAgICAgICAgICAgIGlmKHJlc3BvbnNlLm9rKSB7IC8vcmVzcG9uc2Uuc3RhdHVzIFsyMDAsMjk5XVxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlW2NvbmYudHlwZV0oKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGNvbmYuZGVhbGZhaWwpeyAvL+WkhOeQhuS4muWKoemUmeivr1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoSW9Db25maWcuZmFpbC5maWx0ZXIocmVzdWx0KSl7IC8v5pyJ5Lia5Yqh6ZSZ6K+v5Y+R55SfXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodHlwZW9mIGNvbmZbSW9Db25maWcuZmFpbC5mdW5uYW1lXSA9PSAnZnVuY3Rpb24nKXsgLy/liKTmlq3pu5jorqRmYWls5piv5ZCm5piv5LiA5Liq5pyJ5pWI5Ye95pWwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZbSW9Db25maWcuZmFpbC5mdW5uYW1lXShyZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QocmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNleyAvL+aXoOS4muWKoemUmeivr+WPkeeUn1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGNvbmYuZGVhbGRhdGEpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGNvbmYuZGVhbGRhdGFmdW4ocmVzdWx0KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSxmdW5jdGlvbihlcnJvcil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVycm9yID0gbmV3IEVycm9yKHJlc3BvbnNlLnN0YXR1c1RleHQgfHwgJ+e9kee7nOmUmeivrycpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25mLmNvbXBsZXRlKCk7XHJcbiAgICAgICAgICAgICAgICBjb25mLmdldFJlc3BvbnNlKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xyXG4gICAgICAgICAgICAgICAgLy/mjZXojrfku7vkvZXplJnor6/vvIzljbPlj5HnlJ/or63ms5XplJnor6/kuZ/kvJrmjZXojrdcclxuICAgICAgICAgICAgICAgIGNvbmYuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgY29uZi5jb21wbGV0ZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufTtcclxuIiwiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcgaW/or7fmsYLnmoTkuIDkupvlhazlhbHphY3nva5cclxuICovXHJcbiBjb25zdCB0aGF0ID0ge1xyXG4gICAgLyoqXHJcbiAgICAgKiDlr7nkuo7mjqXlj6Pov5Tlm57nmoTkuJrliqHplJnor6/ov5vooYznu5/kuIDlpITnkIZcclxuICAgICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICAgKi9cclxuICAgIGZhaWw6IHtcclxuICAgICAgICBmdW5uYW1lOiAnZmFpbCcsIC8v5b2T5Y+R55Sf5Lia5Yqh6ZSZ6K+v55qE5pe25YCZ77yM6LCD55So55qE5pa55rOV5ZCNXHJcbiAgICAgICAgZmlsdGVyOiBmdW5jdGlvbihyZXN1bHQpIHtcclxuICAgICAgICAgICAgLy8gaWYocmVzdWx0LmNvZGUgIT0gJ0EwMDAxJyl7XHJcbiAgICAgICAgICAgIC8vICAgICByZXR1cm4gdHJ1ZTsgLy/or7TmmI7lj5HnlJ/kuobkuJrliqHplJnor69cclxuICAgICAgICAgICAgLy8gfWVsc2V7XHJcbiAgICAgICAgICAgIC8vICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIC8vIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDor7fmsYLlpLTpg6jphY3nva5cclxuICAgICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICAgKi9cclxuICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAvL+WmguaenENvbnRlbnQtVHlwZeiuvue9ruS4umZhbHNlLOWImeS4jeS8oENvbnRlbnQtVHlwZVxyXG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xyXG4gICAgfSxcclxuICAgIC8qKlxyXG4gICAgICog6K+35rGC5a+56LGh5Y+C5pWw6YWN572uXHJcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAgICovXHJcbiAgICByZXF1ZXN0OiB7XHJcbiAgICAgICAgbWV0aG9kOiAnR0VUJywgLy9HRVR8UE9TVFxyXG4gICAgICAgIG1vZGU6ICdjb3JzJywgLy9jb3JzfG5vLWNvcnN8c2FtZS1vcmlnaW58bmF2aWdhdGVcclxuICAgICAgICAvL+WFtuS7luWPguaVsFxyXG4gICAgICAgIC8vYm9keTogY3JlZGVudGlhbHM6IGNhY2hlOiByZWRpcmVjdDogcmVmZXJyZXI6IGludGVncml0eVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIHNhbWUtb3JpZ2luOiDlkIxhamF45LiA5qC377yM5ZCM5Z+f5Y+R6YCBY29va2llXHJcbiAgICAgICAgICogaW5jbHVkZTog6Leo5Z+f5Y+R6YCBY29va2llXHJcbiAgICAgICAgICogQHR5cGUge1N0cmluZ31cclxuICAgICAgICAgKi9cclxuICAgICAgICBjcmVkZW50aWFsczogJ2luY2x1ZGUnXHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICog6LCD55SoaW/nu4Tku7bvvIzkvKDlhaXnmoTlj4LmlbDmoLzlvI9cclxuICogQHR5cGUge09iamVjdH1cclxuICovXHJcbnRoYXQuaW9wYXJhbXMgPSB7XHJcbiAgICBoZWFkZXJzOiB0aGF0LmhlYWRlcnMsIC8v5ZCMaGVhZGVyc1xyXG4gICAgcmVxdWVzdDogdGhhdC5yZXF1ZXN0LCAvL+WQjHJlcXVlc3RcclxuICAgIC8qKlxyXG4gICAgICog6K+35rGC5Y+C5pWw44CC5Y+v5Lul5piv5Lul5LiL5Yeg56eN57G75Z6L77yaXHJcbiAgICAgKiBCb2xiXHJcbiAgICAgKiBCdWZmZXJTb3VyY2VcclxuICAgICAqIEZvcm1EYXRhXHJcbiAgICAgKiBVUkxTZWFyY2hQYXJhbXNcclxuICAgICAqIFVTVlN0cmluZ1xyXG4gICAgICogU3RyaW5nXHJcbiAgICAgKiBKU09OOiDlpoLmnpzmmK9qc29uLCDliJnlgZrnibnmrorlpITnkIbvvIzor7fop4HkuIvpnaJpc2Zvcm1kYXRh55qE6K+05piOXHJcbiAgICAgKi9cclxuICAgIC8vIGRhdGE6IHt9LFxyXG4gICAgLyoqXHJcbiAgICAgKiDlpoLmnpxkYXRh5pivanNvbjpcclxuICAgICAqICAxLiByZXF1ZXN0Lm1ldGhvZOS4jeaYr0dFVOaIlkhFQUQsIOS4lGlzZm9ybWRhdGHkuLp0cnVlLCDpgqPkuYjlsIZkYXRh6L2s5o2i5oiQRm9ybURhdGHmoLzlvI9cclxuICAgICAqICAyLiDlpoLmnpzkuI3nrKblkIjnrKwx56eN77yM5bCGZGF0Yei9rOaNouaIkHF1ZXJ5c3RyaW5nXHJcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgaXNmb3JtZGF0YTogZmFsc2UsXHJcbiAgICB1cmw6ICcnLCAvL+ivt+axgnVybOWcsOWdgFxyXG4gICAgLyoqXHJcbiAgICAgKiDor7fmsYLnmoTmlbDmja7nsbvlnovvvIzpu5jorqTkuLpqc29uLiDmlbDmja7nsbvlnovlkoxyZXBvbnNl5a+56LGh6L+U5Zue6I635Y+W57uT5p6c55qE5pa55rOV5a+55bqU5YWz57O75aaC5LiLXHJcbiAgICAgKiBhcnJheUJ1ZmZlcjogcmVzcG9uc2UuYXJyYXlCdWZmZXJcclxuICAgICAqIGJsb2I6IHJlc3BvbnNlLmJsb2JcclxuICAgICAqIGZvcm1EYXRhOiByZXNwb25zZS5mb3JtRGF0YSxcclxuICAgICAqIGpzb246IHJlc3BvbnNlLmpzb24sXHJcbiAgICAgKiB0ZXh0OiByZXNwb25zZS50ZXh0XHJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAgICovXHJcbiAgICB0eXBlOiAnanNvbicsXHJcbiAgICB0aW1lb3V0OiA2MDAwLFxyXG4gICAgLyoqXHJcbiAgICAgKiBpb+ivt+axguWJje+8jOe7n+S4gOeahOWkhOeQhlxyXG4gICAgICogQHJldHVybiB7W3R5cGVdfSBbZGVzY3JpcHRpb25dXHJcbiAgICAgKi9cclxuICAgIGJlZm9yZVNlbmQ6IGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgfSxcclxuICAgIC8qKlxyXG4gICAgICog6I635Y+WZmV0Y2jov5Tlm57nmoRyZXNwb25zZeWvueixoeOAgmZhaWwsdGhlbuWSjGNhdGNo5Y+R55Sf55qE5pe25YCZ77yM5Y+v5Lul6I635Y+W5Yiw5q2k5a+56LGhXHJcbiAgICAgKiBAcGFyYW0ge1Jlc3BvbnNlfSByZXNwb25zZSDov5Tlm57nmoRyZXNwb25zZeWvueixoVxyXG4gICAgICogQHJldHVybiB7W3R5cGVdfSAgICAgICAgICBbZGVzY3JpcHRpb25dXHJcbiAgICAgKi9cclxuICAgIGdldFJlc3BvbnNlOiBmdW5jdGlvbihyZXNwb25zZSl7XHJcblxyXG4gICAgfSxcclxuICAgIC8qKlxyXG4gICAgICog5a+55LqO5o6l5Y+j6L+U5Zue6ZSZ6K+v77yM5LiA6Iis5Zug5Li6572R57uc5Y6f5Zug77yM6L+b6KGM55qE57uf5LiA5aSE55CGXHJcbiAgICAgKi9cclxuICAgIGVycm9yOiBmdW5jdGlvbihlcnJvcil7XHJcbiAgICAgICAgLy9lcnJvcuaIluacieaIluaXoCBlcnJvci5tZXNzYWdlXHJcbiAgICAgICAgLy9BbGVydC5hbGVydCgn57O757uf5raI5oGvJyxlcnJvci5tZXNzYWdlIHx8ICfkurLvvIzlv5nkuI3ov4fmnaXkuoYnKTtcclxuICAgIH0sXHJcbiAgICAvKipcclxuICAgICAqIOWmguaenGZhaWzphY3nva7kuoZmdW5uYW1l5Li6ZmFpbCzliJnosIPnlKjmraTmlrnms5UuIOatpOaXtmZhaWwuZmlsdGVy6L+U5ZuedHJ1ZVxyXG4gICAgICog5Zyo5q2k5Y+v6L+b6KGM57uf5LiA5Lia5Yqh6ZSZ6K+v5aSE55CGXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdHxPdGhlcn0gcmVzdWx0IOaOpeWPo+i/lOWbnuaVsOaNrlxyXG4gICAgICogQHJldHVybiB7W3R5cGVdfSBbZGVzY3JpcHRpb25dXHJcbiAgICAgKi9cclxuICAgIGZhaWw6IGZ1bmN0aW9uKHJlc3VsdCl7XHJcbiAgICAgICAgLy9BbGVydC5hbGVydCgn57O757uf5raI5oGvJyxyZXN1bHQuZXJybXNnIHx8ICfkurLvvIzlv5nkuI3ov4fmnaXkuoYnKTtcclxuICAgIH0sXHJcbiAgICAvKipcclxuICAgICAqIOaOpeWPo+ivt+axguWujOavleiwg+eUqOOAguaXoOiuunN1Y2Nlc3MsZmFpbCxlcnJvclxyXG4gICAgICogQHJldHVybiB7W3R5cGVdfSBbZGVzY3JpcHRpb25dXHJcbiAgICAgKi9cclxuICAgIGNvbXBsZXRlOiBmdW5jdGlvbigpe30sXHJcbiAgICAvKipcclxuICAgICAqIOWmguaenGRlYWxkYXRh5Li6dHJ1ZSwg5YiZc3VjY2Vzc+eahHJlc3VsdOS4uuatpOaWueazlei/lOWbnueahOaVsOaNrlxyXG4gICAgICogQHBhcmFtIHtPYmplY3R8T3RoZXJ9IHJlc3VsdCDmjqXlj6Pov5Tlm57mlbDmja5cclxuICAgICAqIEByZXR1cm4ge1t0eXBlXX0gICAgICAgIFtkZXNjcmlwdGlvbl1cclxuICAgICAqL1xyXG4gICAgZGVhbGRhdGFmdW46IGZ1bmN0aW9uKHJlc3VsdCl7cmV0dXJuIHJlc3VsdC5kYXRhfSxcclxuICAgIC8qKlxyXG4gICAgICog5piv5ZCm57uf5LiA5aSE55CG5Lia5Yqh6ZSZ6K+vXHJcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgZGVhbGZhaWw6IHRydWUsIC8v5piv5ZCm57uf5LiA5aSE55CG5Lia5Yqh6ZSZ6K+vXHJcbiAgICAvKipcclxuICAgICAqIOW9k+S4muWKoeaIkOWKn+aXtu+8jOiwg+eUqHN1Y2Nlc3PliY3vvIzmmK/lkKbnu5/kuIDmoLzlvI/ljJbmlbDmja5cclxuICAgICAqIOWmguaenGRlYWxmYWls5Li6dHJ1ZSzlubbkuJRmYWlsLmZpbHRlcui/lOWbnuS4umZhbHNl5pe277yM5aaC5p6c5q2k6aG56K6+572u5Li6dHJ1ZSzliJnosIPnlKhkZWFsZGF0YWZ1buaWueazle+8jOi/lOWbnuWkhOeQhuWQjueahOaVsOaNrlxyXG4gICAgICogQHR5cGUge0Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGRlYWxkYXRhOiB0cnVlXHJcbn07XHJcblxyXG4vKipcclxuICog5pys5p2l5LiL6Z2i6L+Z5Lik6aG56YWN572u5piv5pS+5ZyodGhhdC5pb3BhcmFtc+mHjOmdoueahO+8jOS9huaYr+WQjumdouaUueeJiO+8jOmHh+eUqHByb21pc2XmlrnlvI/kvKDpgJLku6XkuIvov5nkuKTpobnjgIJcclxuICog5Lmf5bCx5piv6K+077yMdGhhdC5pb2NhbGxiYWNr5YW25a6e5piv5Liq5LuL57uN77yM5bm25peg5a6e6ZmF5oSP5LmJXHJcbiAqIEB0eXBlIHtPYmplY3R9XHJcbiAqL1xyXG50aGF0LmlvY2FsbGJhY2sgPSB7XHJcbiAgICAvKipcclxuICAgICAqIOS4muWKoemUmeivr+WkhOeQhuOAglxyXG4gICAgICog5aaC5p6cZmFpbOmFjee9ruS6hmZ1bm5hbWXkuLpmYWls77yM5bm25LiUZmFpbC5maWx0ZXLov5Tlm550cnVl77yM5YiZ6buY6K6k6LCD55SodGhhdC5pb3BhcmFtcy5mYWls5aSE55CG5pa55rOVXHJcbiAgICAgKiDphY3nva7kuoZjYXRjaO+8jOS5n+S8muiwg+eUqGNhdGNoXHJcbiAgICAgKiDlpoLmnpzphY3nva7kuoZpb+ivt+axguWPguaVsGZhaWzkuLpudWxs77yM5YiZ5LiN5Lya6LCD55SodGhhdC5pb3BhcmFtcy5mYWlsXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdHxPdGhlcn0gcmVzdWx0IOaOpeWPo+i/lOWbnuaVsOaNrlxyXG4gICAgICogQHJldHVybiB7W3R5cGVdfSBbZGVzY3JpcHRpb25dXHJcbiAgICAgKi9cclxuICAgIGNhdGNoOiBmdW5jdGlvbihyZXN1bHQpe1xyXG4gICAgICAgIC8vQWxlcnQuYWxlcnQoJ+ezu+e7n+a2iOaBrycscmVzdWx0LmVycm1zZyB8fCAn5Lqy77yM5b+Z5LiN6L+H5p2l5LqGJyk7XHJcbiAgICB9LFxyXG4gICAgLyoqXHJcbiAgICAgKiDmiJDlip/osIPnlKjmlrnms5XjgILosIPnlKjnmoTmg4XlhrXmnInlpoLkuIvlh6Dnp43vvJpcclxuICAgICAqIDEuIGRlYWxmYWls5Li6dHJ1ZSwg5YiZZmFpbC5maWx0ZXLov5Tlm55mYWxzZeaXtu+8jOiwg+eUqHN1Y2Nlc3NcclxuICAgICAqICAgICAgICAgIOatpOaXtuWmguaenGRlYWxkYXRh5Li6dHJ1ZSwg5YiZcmVzdWx05Li6ZGVhbGRhdGFmdW7ov5Tlm57nmoTmlbDmja5cclxuICAgICAqIDIuIGRlYWxmYWls5Li6ZmFsc2Xml7bvvIzliJnmjqXlj6Pov5Tlm57lkI7nm7TmjqXosIPnlKjmraTmlrnms5XvvIjkuI3lj5HnlJ9lcnJvcueahOaDheWGteS4i++8iVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fE90aGVyfSByZXN1bHQg5o6l5Y+j6L+U5Zue5pWw5o2uXHJcbiAgICAgKi9cclxuICAgIHRoZW46IGZ1bmN0aW9uKHJlc3VsdCl7fVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB0aGF0O1xyXG4iLCIoZnVuY3Rpb24oc2VsZikge1xuICAndXNlIHN0cmljdCc7XG5cbiAgaWYgKHNlbGYuZmV0Y2gpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIHZhciBzdXBwb3J0ID0ge1xuICAgIHNlYXJjaFBhcmFtczogJ1VSTFNlYXJjaFBhcmFtcycgaW4gc2VsZixcbiAgICBpdGVyYWJsZTogJ1N5bWJvbCcgaW4gc2VsZiAmJiAnaXRlcmF0b3InIGluIFN5bWJvbCxcbiAgICBibG9iOiAnRmlsZVJlYWRlcicgaW4gc2VsZiAmJiAnQmxvYicgaW4gc2VsZiAmJiAoZnVuY3Rpb24oKSB7XG4gICAgICB0cnkge1xuICAgICAgICBuZXcgQmxvYigpXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfSkoKSxcbiAgICBmb3JtRGF0YTogJ0Zvcm1EYXRhJyBpbiBzZWxmLFxuICAgIGFycmF5QnVmZmVyOiAnQXJyYXlCdWZmZXInIGluIHNlbGZcbiAgfVxuXG4gIGlmIChzdXBwb3J0LmFycmF5QnVmZmVyKSB7XG4gICAgdmFyIHZpZXdDbGFzc2VzID0gW1xuICAgICAgJ1tvYmplY3QgSW50OEFycmF5XScsXG4gICAgICAnW29iamVjdCBVaW50OEFycmF5XScsXG4gICAgICAnW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgSW50MTZBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgVWludDE2QXJyYXldJyxcbiAgICAgICdbb2JqZWN0IEludDMyQXJyYXldJyxcbiAgICAgICdbb2JqZWN0IFVpbnQzMkFycmF5XScsXG4gICAgICAnW29iamVjdCBGbG9hdDMyQXJyYXldJyxcbiAgICAgICdbb2JqZWN0IEZsb2F0NjRBcnJheV0nXG4gICAgXVxuXG4gICAgdmFyIGlzRGF0YVZpZXcgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBvYmogJiYgRGF0YVZpZXcucHJvdG90eXBlLmlzUHJvdG90eXBlT2Yob2JqKVxuICAgIH1cblxuICAgIHZhciBpc0FycmF5QnVmZmVyVmlldyA9IEFycmF5QnVmZmVyLmlzVmlldyB8fCBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBvYmogJiYgdmlld0NsYXNzZXMuaW5kZXhPZihPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSkgPiAtMVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZU5hbWUobmFtZSkge1xuICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIG5hbWUgPSBTdHJpbmcobmFtZSlcbiAgICB9XG4gICAgaWYgKC9bXmEtejAtOVxcLSMkJSYnKisuXFxeX2B8fl0vaS50ZXN0KG5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGNoYXJhY3RlciBpbiBoZWFkZXIgZmllbGQgbmFtZScpXG4gICAgfVxuICAgIHJldHVybiBuYW1lLnRvTG93ZXJDYXNlKClcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZVZhbHVlKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHZhbHVlID0gU3RyaW5nKHZhbHVlKVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWVcbiAgfVxuXG4gIC8vIEJ1aWxkIGEgZGVzdHJ1Y3RpdmUgaXRlcmF0b3IgZm9yIHRoZSB2YWx1ZSBsaXN0XG4gIGZ1bmN0aW9uIGl0ZXJhdG9yRm9yKGl0ZW1zKSB7XG4gICAgdmFyIGl0ZXJhdG9yID0ge1xuICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGl0ZW1zLnNoaWZ0KClcbiAgICAgICAgcmV0dXJuIHtkb25lOiB2YWx1ZSA9PT0gdW5kZWZpbmVkLCB2YWx1ZTogdmFsdWV9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuaXRlcmFibGUpIHtcbiAgICAgIGl0ZXJhdG9yW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGl0ZXJhdG9yXG4gIH1cblxuICBmdW5jdGlvbiBIZWFkZXJzKGhlYWRlcnMpIHtcbiAgICB0aGlzLm1hcCA9IHt9XG5cbiAgICBpZiAoaGVhZGVycyBpbnN0YW5jZW9mIEhlYWRlcnMpIHtcbiAgICAgIGhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICB0aGlzLmFwcGVuZChuYW1lLCB2YWx1ZSlcbiAgICAgIH0sIHRoaXMpXG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGhlYWRlcnMpKSB7XG4gICAgICBoZWFkZXJzLmZvckVhY2goZnVuY3Rpb24oaGVhZGVyKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kKGhlYWRlclswXSwgaGVhZGVyWzFdKVxuICAgICAgfSwgdGhpcylcbiAgICB9IGVsc2UgaWYgKGhlYWRlcnMpIHtcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGhlYWRlcnMpLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgICB0aGlzLmFwcGVuZChuYW1lLCBoZWFkZXJzW25hbWVdKVxuICAgICAgfSwgdGhpcylcbiAgICB9XG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5hcHBlbmQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIG5hbWUgPSBub3JtYWxpemVOYW1lKG5hbWUpXG4gICAgdmFsdWUgPSBub3JtYWxpemVWYWx1ZSh2YWx1ZSlcbiAgICB2YXIgb2xkVmFsdWUgPSB0aGlzLm1hcFtuYW1lXVxuICAgIHRoaXMubWFwW25hbWVdID0gb2xkVmFsdWUgPyBvbGRWYWx1ZSsnLCcrdmFsdWUgOiB2YWx1ZVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGVbJ2RlbGV0ZSddID0gZnVuY3Rpb24obmFtZSkge1xuICAgIGRlbGV0ZSB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24obmFtZSkge1xuICAgIG5hbWUgPSBub3JtYWxpemVOYW1lKG5hbWUpXG4gICAgcmV0dXJuIHRoaXMuaGFzKG5hbWUpID8gdGhpcy5tYXBbbmFtZV0gOiBudWxsXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwLmhhc093blByb3BlcnR5KG5vcm1hbGl6ZU5hbWUobmFtZSkpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldID0gbm9ybWFsaXplVmFsdWUodmFsdWUpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24oY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMubWFwKSB7XG4gICAgICBpZiAodGhpcy5tYXAuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzQXJnLCB0aGlzLm1hcFtuYW1lXSwgbmFtZSwgdGhpcylcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5rZXlzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGl0ZW1zID0gW11cbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHsgaXRlbXMucHVzaChuYW1lKSB9KVxuICAgIHJldHVybiBpdGVyYXRvckZvcihpdGVtcylcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLnZhbHVlcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpdGVtcyA9IFtdXG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKSB7IGl0ZW1zLnB1c2godmFsdWUpIH0pXG4gICAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZW50cmllcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpdGVtcyA9IFtdXG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7IGl0ZW1zLnB1c2goW25hbWUsIHZhbHVlXSkgfSlcbiAgICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG4gIH1cblxuICBpZiAoc3VwcG9ydC5pdGVyYWJsZSkge1xuICAgIEhlYWRlcnMucHJvdG90eXBlW1N5bWJvbC5pdGVyYXRvcl0gPSBIZWFkZXJzLnByb3RvdHlwZS5lbnRyaWVzXG4gIH1cblxuICBmdW5jdGlvbiBjb25zdW1lZChib2R5KSB7XG4gICAgaWYgKGJvZHkuYm9keVVzZWQpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVHlwZUVycm9yKCdBbHJlYWR5IHJlYWQnKSlcbiAgICB9XG4gICAgYm9keS5ib2R5VXNlZCA9IHRydWVcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlc29sdmUocmVhZGVyLnJlc3VsdClcbiAgICAgIH1cbiAgICAgIHJlYWRlci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChyZWFkZXIuZXJyb3IpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRCbG9iQXNBcnJheUJ1ZmZlcihibG9iKSB7XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICB2YXIgcHJvbWlzZSA9IGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpXG4gICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKGJsb2IpXG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRCbG9iQXNUZXh0KGJsb2IpIHtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgIHZhciBwcm9taXNlID0gZmlsZVJlYWRlclJlYWR5KHJlYWRlcilcbiAgICByZWFkZXIucmVhZEFzVGV4dChibG9iKVxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQXJyYXlCdWZmZXJBc1RleHQoYnVmKSB7XG4gICAgdmFyIHZpZXcgPSBuZXcgVWludDhBcnJheShidWYpXG4gICAgdmFyIGNoYXJzID0gbmV3IEFycmF5KHZpZXcubGVuZ3RoKVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2aWV3Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBjaGFyc1tpXSA9IFN0cmluZy5mcm9tQ2hhckNvZGUodmlld1tpXSlcbiAgICB9XG4gICAgcmV0dXJuIGNoYXJzLmpvaW4oJycpXG4gIH1cblxuICBmdW5jdGlvbiBidWZmZXJDbG9uZShidWYpIHtcbiAgICBpZiAoYnVmLnNsaWNlKSB7XG4gICAgICByZXR1cm4gYnVmLnNsaWNlKDApXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmLmJ5dGVMZW5ndGgpXG4gICAgICB2aWV3LnNldChuZXcgVWludDhBcnJheShidWYpKVxuICAgICAgcmV0dXJuIHZpZXcuYnVmZmVyXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gQm9keSgpIHtcbiAgICB0aGlzLmJvZHlVc2VkID0gZmFsc2VcblxuICAgIHRoaXMuX2luaXRCb2R5ID0gZnVuY3Rpb24oYm9keSkge1xuICAgICAgdGhpcy5fYm9keUluaXQgPSBib2R5XG4gICAgICBpZiAoIWJvZHkpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSAnJ1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYmxvYiAmJiBCbG9iLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlCbG9iID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmZvcm1EYXRhICYmIEZvcm1EYXRhLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlGb3JtRGF0YSA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5zZWFyY2hQYXJhbXMgJiYgVVJMU2VhcmNoUGFyYW1zLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gYm9keS50b1N0cmluZygpXG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYXJyYXlCdWZmZXIgJiYgc3VwcG9ydC5ibG9iICYmIGlzRGF0YVZpZXcoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUFycmF5QnVmZmVyID0gYnVmZmVyQ2xvbmUoYm9keS5idWZmZXIpXG4gICAgICAgIC8vIElFIDEwLTExIGNhbid0IGhhbmRsZSBhIERhdGFWaWV3IGJvZHkuXG4gICAgICAgIHRoaXMuX2JvZHlJbml0ID0gbmV3IEJsb2IoW3RoaXMuX2JvZHlBcnJheUJ1ZmZlcl0pXG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYXJyYXlCdWZmZXIgJiYgKEFycmF5QnVmZmVyLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpIHx8IGlzQXJyYXlCdWZmZXJWaWV3KGJvZHkpKSkge1xuICAgICAgICB0aGlzLl9ib2R5QXJyYXlCdWZmZXIgPSBidWZmZXJDbG9uZShib2R5KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bnN1cHBvcnRlZCBCb2R5SW5pdCB0eXBlJylcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLmhlYWRlcnMuZ2V0KCdjb250ZW50LXR5cGUnKSkge1xuICAgICAgICBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgJ3RleHQvcGxhaW47Y2hhcnNldD1VVEYtOCcpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUJsb2IgJiYgdGhpcy5fYm9keUJsb2IudHlwZSkge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsIHRoaXMuX2JvZHlCbG9iLnR5cGUpXG4gICAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5zZWFyY2hQYXJhbXMgJiYgVVJMU2VhcmNoUGFyYW1zLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDtjaGFyc2V0PVVURi04JylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0LmJsb2IpIHtcbiAgICAgIHRoaXMuYmxvYiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0ZWRcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9ib2R5QmxvYikge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keUJsb2IpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUFycmF5QnVmZmVyKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgQmxvYihbdGhpcy5fYm9keUFycmF5QnVmZmVyXSkpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUZvcm1EYXRhKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZCBub3QgcmVhZCBGb3JtRGF0YSBib2R5IGFzIGJsb2InKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IEJsb2IoW3RoaXMuX2JvZHlUZXh0XSkpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5hcnJheUJ1ZmZlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5fYm9keUFycmF5QnVmZmVyKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbnN1bWVkKHRoaXMpIHx8IFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuYmxvYigpLnRoZW4ocmVhZEJsb2JBc0FycmF5QnVmZmVyKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy50ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICAgIHJldHVybiByZWplY3RlZFxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fYm9keUJsb2IpIHtcbiAgICAgICAgcmV0dXJuIHJlYWRCbG9iQXNUZXh0KHRoaXMuX2JvZHlCbG9iKVxuICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZWFkQXJyYXlCdWZmZXJBc1RleHQodGhpcy5fYm9keUFycmF5QnVmZmVyKSlcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUZvcm1EYXRhKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyB0ZXh0JylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keVRleHQpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuZm9ybURhdGEpIHtcbiAgICAgIHRoaXMuZm9ybURhdGEgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oZGVjb2RlKVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuanNvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oSlNPTi5wYXJzZSlcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLy8gSFRUUCBtZXRob2RzIHdob3NlIGNhcGl0YWxpemF0aW9uIHNob3VsZCBiZSBub3JtYWxpemVkXG4gIHZhciBtZXRob2RzID0gWydERUxFVEUnLCAnR0VUJywgJ0hFQUQnLCAnT1BUSU9OUycsICdQT1NUJywgJ1BVVCddXG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplTWV0aG9kKG1ldGhvZCkge1xuICAgIHZhciB1cGNhc2VkID0gbWV0aG9kLnRvVXBwZXJDYXNlKClcbiAgICByZXR1cm4gKG1ldGhvZHMuaW5kZXhPZih1cGNhc2VkKSA+IC0xKSA/IHVwY2FzZWQgOiBtZXRob2RcbiAgfVxuXG4gIGZ1bmN0aW9uIFJlcXVlc3QoaW5wdXQsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICAgIHZhciBib2R5ID0gb3B0aW9ucy5ib2R5XG5cbiAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBSZXF1ZXN0KSB7XG4gICAgICBpZiAoaW5wdXQuYm9keVVzZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJylcbiAgICAgIH1cbiAgICAgIHRoaXMudXJsID0gaW5wdXQudXJsXG4gICAgICB0aGlzLmNyZWRlbnRpYWxzID0gaW5wdXQuY3JlZGVudGlhbHNcbiAgICAgIGlmICghb3B0aW9ucy5oZWFkZXJzKSB7XG4gICAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKGlucHV0LmhlYWRlcnMpXG4gICAgICB9XG4gICAgICB0aGlzLm1ldGhvZCA9IGlucHV0Lm1ldGhvZFxuICAgICAgdGhpcy5tb2RlID0gaW5wdXQubW9kZVxuICAgICAgaWYgKCFib2R5ICYmIGlucHV0Ll9ib2R5SW5pdCAhPSBudWxsKSB7XG4gICAgICAgIGJvZHkgPSBpbnB1dC5fYm9keUluaXRcbiAgICAgICAgaW5wdXQuYm9keVVzZWQgPSB0cnVlXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudXJsID0gU3RyaW5nKGlucHV0KVxuICAgIH1cblxuICAgIHRoaXMuY3JlZGVudGlhbHMgPSBvcHRpb25zLmNyZWRlbnRpYWxzIHx8IHRoaXMuY3JlZGVudGlhbHMgfHwgJ29taXQnXG4gICAgaWYgKG9wdGlvbnMuaGVhZGVycyB8fCAhdGhpcy5oZWFkZXJzKSB7XG4gICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpXG4gICAgfVxuICAgIHRoaXMubWV0aG9kID0gbm9ybWFsaXplTWV0aG9kKG9wdGlvbnMubWV0aG9kIHx8IHRoaXMubWV0aG9kIHx8ICdHRVQnKVxuICAgIHRoaXMubW9kZSA9IG9wdGlvbnMubW9kZSB8fCB0aGlzLm1vZGUgfHwgbnVsbFxuICAgIHRoaXMucmVmZXJyZXIgPSBudWxsXG5cbiAgICBpZiAoKHRoaXMubWV0aG9kID09PSAnR0VUJyB8fCB0aGlzLm1ldGhvZCA9PT0gJ0hFQUQnKSAmJiBib2R5KSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdCb2R5IG5vdCBhbGxvd2VkIGZvciBHRVQgb3IgSEVBRCByZXF1ZXN0cycpXG4gICAgfVxuICAgIHRoaXMuX2luaXRCb2R5KGJvZHkpXG4gIH1cblxuICBSZXF1ZXN0LnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCh0aGlzLCB7IGJvZHk6IHRoaXMuX2JvZHlJbml0IH0pXG4gIH1cblxuICBmdW5jdGlvbiBkZWNvZGUoYm9keSkge1xuICAgIHZhciBmb3JtID0gbmV3IEZvcm1EYXRhKClcbiAgICBib2R5LnRyaW0oKS5zcGxpdCgnJicpLmZvckVhY2goZnVuY3Rpb24oYnl0ZXMpIHtcbiAgICAgIGlmIChieXRlcykge1xuICAgICAgICB2YXIgc3BsaXQgPSBieXRlcy5zcGxpdCgnPScpXG4gICAgICAgIHZhciBuYW1lID0gc3BsaXQuc2hpZnQoKS5yZXBsYWNlKC9cXCsvZywgJyAnKVxuICAgICAgICB2YXIgdmFsdWUgPSBzcGxpdC5qb2luKCc9JykucmVwbGFjZSgvXFwrL2csICcgJylcbiAgICAgICAgZm9ybS5hcHBlbmQoZGVjb2RlVVJJQ29tcG9uZW50KG5hbWUpLCBkZWNvZGVVUklDb21wb25lbnQodmFsdWUpKVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIGZvcm1cbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlSGVhZGVycyhyYXdIZWFkZXJzKSB7XG4gICAgdmFyIGhlYWRlcnMgPSBuZXcgSGVhZGVycygpXG4gICAgcmF3SGVhZGVycy5zcGxpdCgvXFxyP1xcbi8pLmZvckVhY2goZnVuY3Rpb24obGluZSkge1xuICAgICAgdmFyIHBhcnRzID0gbGluZS5zcGxpdCgnOicpXG4gICAgICB2YXIga2V5ID0gcGFydHMuc2hpZnQoKS50cmltKClcbiAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gcGFydHMuam9pbignOicpLnRyaW0oKVxuICAgICAgICBoZWFkZXJzLmFwcGVuZChrZXksIHZhbHVlKVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIGhlYWRlcnNcbiAgfVxuXG4gIEJvZHkuY2FsbChSZXF1ZXN0LnByb3RvdHlwZSlcblxuICBmdW5jdGlvbiBSZXNwb25zZShib2R5SW5pdCwgb3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IHt9XG4gICAgfVxuXG4gICAgdGhpcy50eXBlID0gJ2RlZmF1bHQnXG4gICAgdGhpcy5zdGF0dXMgPSAnc3RhdHVzJyBpbiBvcHRpb25zID8gb3B0aW9ucy5zdGF0dXMgOiAyMDBcbiAgICB0aGlzLm9rID0gdGhpcy5zdGF0dXMgPj0gMjAwICYmIHRoaXMuc3RhdHVzIDwgMzAwXG4gICAgdGhpcy5zdGF0dXNUZXh0ID0gJ3N0YXR1c1RleHQnIGluIG9wdGlvbnMgPyBvcHRpb25zLnN0YXR1c1RleHQgOiAnT0snXG4gICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMob3B0aW9ucy5oZWFkZXJzKVxuICAgIHRoaXMudXJsID0gb3B0aW9ucy51cmwgfHwgJydcbiAgICB0aGlzLl9pbml0Qm9keShib2R5SW5pdClcbiAgfVxuXG4gIEJvZHkuY2FsbChSZXNwb25zZS5wcm90b3R5cGUpXG5cbiAgUmVzcG9uc2UucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZSh0aGlzLl9ib2R5SW5pdCwge1xuICAgICAgc3RhdHVzOiB0aGlzLnN0YXR1cyxcbiAgICAgIHN0YXR1c1RleHQ6IHRoaXMuc3RhdHVzVGV4dCxcbiAgICAgIGhlYWRlcnM6IG5ldyBIZWFkZXJzKHRoaXMuaGVhZGVycyksXG4gICAgICB1cmw6IHRoaXMudXJsXG4gICAgfSlcbiAgfVxuXG4gIFJlc3BvbnNlLmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKG51bGwsIHtzdGF0dXM6IDAsIHN0YXR1c1RleHQ6ICcnfSlcbiAgICByZXNwb25zZS50eXBlID0gJ2Vycm9yJ1xuICAgIHJldHVybiByZXNwb25zZVxuICB9XG5cbiAgdmFyIHJlZGlyZWN0U3RhdHVzZXMgPSBbMzAxLCAzMDIsIDMwMywgMzA3LCAzMDhdXG5cbiAgUmVzcG9uc2UucmVkaXJlY3QgPSBmdW5jdGlvbih1cmwsIHN0YXR1cykge1xuICAgIGlmIChyZWRpcmVjdFN0YXR1c2VzLmluZGV4T2Yoc3RhdHVzKSA9PT0gLTEpIHtcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbnZhbGlkIHN0YXR1cyBjb2RlJylcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKG51bGwsIHtzdGF0dXM6IHN0YXR1cywgaGVhZGVyczoge2xvY2F0aW9uOiB1cmx9fSlcbiAgfVxuXG4gIHNlbGYuSGVhZGVycyA9IEhlYWRlcnNcbiAgc2VsZi5SZXF1ZXN0ID0gUmVxdWVzdFxuICBzZWxmLlJlc3BvbnNlID0gUmVzcG9uc2VcblxuICBzZWxmLmZldGNoID0gZnVuY3Rpb24oaW5wdXQsIGluaXQpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgcmVxdWVzdCA9IG5ldyBSZXF1ZXN0KGlucHV0LCBpbml0KVxuICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG5cbiAgICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICAgICAgc3RhdHVzOiB4aHIuc3RhdHVzLFxuICAgICAgICAgIHN0YXR1c1RleHQ6IHhoci5zdGF0dXNUZXh0LFxuICAgICAgICAgIGhlYWRlcnM6IHBhcnNlSGVhZGVycyh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkgfHwgJycpXG4gICAgICAgIH1cbiAgICAgICAgb3B0aW9ucy51cmwgPSAncmVzcG9uc2VVUkwnIGluIHhociA/IHhoci5yZXNwb25zZVVSTCA6IG9wdGlvbnMuaGVhZGVycy5nZXQoJ1gtUmVxdWVzdC1VUkwnKVxuICAgICAgICB2YXIgYm9keSA9ICdyZXNwb25zZScgaW4geGhyID8geGhyLnJlc3BvbnNlIDogeGhyLnJlc3BvbnNlVGV4dFxuICAgICAgICByZXNvbHZlKG5ldyBSZXNwb25zZShib2R5LCBvcHRpb25zKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ05ldHdvcmsgcmVxdWVzdCBmYWlsZWQnKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9udGltZW91dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKVxuICAgICAgfVxuXG4gICAgICB4aHIub3BlbihyZXF1ZXN0Lm1ldGhvZCwgcmVxdWVzdC51cmwsIHRydWUpXG5cbiAgICAgIGlmIChyZXF1ZXN0LmNyZWRlbnRpYWxzID09PSAnaW5jbHVkZScpIHtcbiAgICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWVcbiAgICAgIH1cblxuICAgICAgaWYgKCdyZXNwb25zZVR5cGUnIGluIHhociAmJiBzdXBwb3J0LmJsb2IpIHtcbiAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdibG9iJ1xuICAgICAgfVxuXG4gICAgICByZXF1ZXN0LmhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihuYW1lLCB2YWx1ZSlcbiAgICAgIH0pXG5cbiAgICAgIHhoci5zZW5kKHR5cGVvZiByZXF1ZXN0Ll9ib2R5SW5pdCA9PT0gJ3VuZGVmaW5lZCcgPyBudWxsIDogcmVxdWVzdC5fYm9keUluaXQpXG4gICAgfSlcbiAgfVxuICBzZWxmLmZldGNoLnBvbHlmaWxsID0gdHJ1ZVxufSkodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnID8gc2VsZiA6IHRoaXMpO1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbid1c2Ugc3RyaWN0JztcblxuLy8gSWYgb2JqLmhhc093blByb3BlcnR5IGhhcyBiZWVuIG92ZXJyaWRkZW4sIHRoZW4gY2FsbGluZ1xuLy8gb2JqLmhhc093blByb3BlcnR5KHByb3ApIHdpbGwgYnJlYWsuXG4vLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9qb3llbnQvbm9kZS9pc3N1ZXMvMTcwN1xuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihxcywgc2VwLCBlcSwgb3B0aW9ucykge1xuICBzZXAgPSBzZXAgfHwgJyYnO1xuICBlcSA9IGVxIHx8ICc9JztcbiAgdmFyIG9iaiA9IHt9O1xuXG4gIGlmICh0eXBlb2YgcXMgIT09ICdzdHJpbmcnIHx8IHFzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBvYmo7XG4gIH1cblxuICB2YXIgcmVnZXhwID0gL1xcKy9nO1xuICBxcyA9IHFzLnNwbGl0KHNlcCk7XG5cbiAgdmFyIG1heEtleXMgPSAxMDAwO1xuICBpZiAob3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9ucy5tYXhLZXlzID09PSAnbnVtYmVyJykge1xuICAgIG1heEtleXMgPSBvcHRpb25zLm1heEtleXM7XG4gIH1cblxuICB2YXIgbGVuID0gcXMubGVuZ3RoO1xuICAvLyBtYXhLZXlzIDw9IDAgbWVhbnMgdGhhdCB3ZSBzaG91bGQgbm90IGxpbWl0IGtleXMgY291bnRcbiAgaWYgKG1heEtleXMgPiAwICYmIGxlbiA+IG1heEtleXMpIHtcbiAgICBsZW4gPSBtYXhLZXlzO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgIHZhciB4ID0gcXNbaV0ucmVwbGFjZShyZWdleHAsICclMjAnKSxcbiAgICAgICAgaWR4ID0geC5pbmRleE9mKGVxKSxcbiAgICAgICAga3N0ciwgdnN0ciwgaywgdjtcblxuICAgIGlmIChpZHggPj0gMCkge1xuICAgICAga3N0ciA9IHguc3Vic3RyKDAsIGlkeCk7XG4gICAgICB2c3RyID0geC5zdWJzdHIoaWR4ICsgMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGtzdHIgPSB4O1xuICAgICAgdnN0ciA9ICcnO1xuICAgIH1cblxuICAgIGsgPSBkZWNvZGVVUklDb21wb25lbnQoa3N0cik7XG4gICAgdiA9IGRlY29kZVVSSUNvbXBvbmVudCh2c3RyKTtcblxuICAgIGlmICghaGFzT3duUHJvcGVydHkob2JqLCBrKSkge1xuICAgICAgb2JqW2tdID0gdjtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkob2JqW2tdKSkge1xuICAgICAgb2JqW2tdLnB1c2godik7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9ialtrXSA9IFtvYmpba10sIHZdO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmo7XG59O1xuXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHhzKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeHMpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBzdHJpbmdpZnlQcmltaXRpdmUgPSBmdW5jdGlvbih2KSB7XG4gIHN3aXRjaCAodHlwZW9mIHYpIHtcbiAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgcmV0dXJuIHY7XG5cbiAgICBjYXNlICdib29sZWFuJzpcbiAgICAgIHJldHVybiB2ID8gJ3RydWUnIDogJ2ZhbHNlJztcblxuICAgIGNhc2UgJ251bWJlcic6XG4gICAgICByZXR1cm4gaXNGaW5pdGUodikgPyB2IDogJyc7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuICcnO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iaiwgc2VwLCBlcSwgbmFtZSkge1xuICBzZXAgPSBzZXAgfHwgJyYnO1xuICBlcSA9IGVxIHx8ICc9JztcbiAgaWYgKG9iaiA9PT0gbnVsbCkge1xuICAgIG9iaiA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGlmICh0eXBlb2Ygb2JqID09PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBtYXAob2JqZWN0S2V5cyhvYmopLCBmdW5jdGlvbihrKSB7XG4gICAgICB2YXIga3MgPSBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKGspKSArIGVxO1xuICAgICAgaWYgKGlzQXJyYXkob2JqW2tdKSkge1xuICAgICAgICByZXR1cm4gbWFwKG9ialtrXSwgZnVuY3Rpb24odikge1xuICAgICAgICAgIHJldHVybiBrcyArIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUodikpO1xuICAgICAgICB9KS5qb2luKHNlcCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4ga3MgKyBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKG9ialtrXSkpO1xuICAgICAgfVxuICAgIH0pLmpvaW4oc2VwKTtcblxuICB9XG5cbiAgaWYgKCFuYW1lKSByZXR1cm4gJyc7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKG5hbWUpKSArIGVxICtcbiAgICAgICAgIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUob2JqKSk7XG59O1xuXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHhzKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeHMpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcblxuZnVuY3Rpb24gbWFwICh4cywgZikge1xuICBpZiAoeHMubWFwKSByZXR1cm4geHMubWFwKGYpO1xuICB2YXIgcmVzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICByZXMucHVzaChmKHhzW2ldLCBpKSk7XG4gIH1cbiAgcmV0dXJuIHJlcztcbn1cblxudmFyIG9iamVjdEtleXMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiAob2JqKSB7XG4gIHZhciByZXMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSByZXMucHVzaChrZXkpO1xuICB9XG4gIHJldHVybiByZXM7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLmRlY29kZSA9IGV4cG9ydHMucGFyc2UgPSByZXF1aXJlKCcuL2RlY29kZScpO1xuZXhwb3J0cy5lbmNvZGUgPSBleHBvcnRzLnN0cmluZ2lmeSA9IHJlcXVpcmUoJy4vZW5jb2RlJyk7XG4iXX0=
