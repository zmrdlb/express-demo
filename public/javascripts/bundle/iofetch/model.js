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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3Rvb2wvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIm5vZGVfbW9kdWxlcy9leHRlbmQvaW5kZXguanMiLCJwdWJsaWNcXGphdmFzY3JpcHRzXFxwYWdlXFxpb2ZldGNoXFxtb2RlbC5qcyIsIi4uL25vZGUtaW8tZmV0Y2gvaW5kZXguanMiLCIuLlxcbm9kZS1pby1mZXRjaFxcaW8uanMiLCIuLlxcbm9kZS1pby1mZXRjaFxcaW9jb25maWcuanMiLCIuLi9ub2RlLWlvLWZldGNoL25vZGVfbW9kdWxlcy93aGF0d2ctZmV0Y2gvZmV0Y2guanMiLCIuLi90b29sL25vZGVfbW9kdWxlcy9xdWVyeXN0cmluZy1lczMvZGVjb2RlLmpzIiwiLi4vdG9vbC9ub2RlX21vZHVsZXMvcXVlcnlzdHJpbmctZXMzL2VuY29kZS5qcyIsIi4uL3Rvb2wvbm9kZV9tb2R1bGVzL3F1ZXJ5c3RyaW5nLWVzMy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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RkEsT0FBTyxPQUFQLEdBQWlCLElBQWpCOzs7OztBQzVJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN2NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG52YXIgdG9TdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG52YXIgaXNBcnJheSA9IGZ1bmN0aW9uIGlzQXJyYXkoYXJyKSB7XG5cdGlmICh0eXBlb2YgQXJyYXkuaXNBcnJheSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdHJldHVybiBBcnJheS5pc0FycmF5KGFycik7XG5cdH1cblxuXHRyZXR1cm4gdG9TdHIuY2FsbChhcnIpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcblxudmFyIGlzUGxhaW5PYmplY3QgPSBmdW5jdGlvbiBpc1BsYWluT2JqZWN0KG9iaikge1xuXHRpZiAoIW9iaiB8fCB0b1N0ci5jYWxsKG9iaikgIT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0dmFyIGhhc093bkNvbnN0cnVjdG9yID0gaGFzT3duLmNhbGwob2JqLCAnY29uc3RydWN0b3InKTtcblx0dmFyIGhhc0lzUHJvdG90eXBlT2YgPSBvYmouY29uc3RydWN0b3IgJiYgb2JqLmNvbnN0cnVjdG9yLnByb3RvdHlwZSAmJiBoYXNPd24uY2FsbChvYmouY29uc3RydWN0b3IucHJvdG90eXBlLCAnaXNQcm90b3R5cGVPZicpO1xuXHQvLyBOb3Qgb3duIGNvbnN0cnVjdG9yIHByb3BlcnR5IG11c3QgYmUgT2JqZWN0XG5cdGlmIChvYmouY29uc3RydWN0b3IgJiYgIWhhc093bkNvbnN0cnVjdG9yICYmICFoYXNJc1Byb3RvdHlwZU9mKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Ly8gT3duIHByb3BlcnRpZXMgYXJlIGVudW1lcmF0ZWQgZmlyc3RseSwgc28gdG8gc3BlZWQgdXAsXG5cdC8vIGlmIGxhc3Qgb25lIGlzIG93biwgdGhlbiBhbGwgcHJvcGVydGllcyBhcmUgb3duLlxuXHR2YXIga2V5O1xuXHRmb3IgKGtleSBpbiBvYmopIHsvKiovfVxuXG5cdHJldHVybiB0eXBlb2Yga2V5ID09PSAndW5kZWZpbmVkJyB8fCBoYXNPd24uY2FsbChvYmosIGtleSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGV4dGVuZCgpIHtcblx0dmFyIG9wdGlvbnMsIG5hbWUsIHNyYywgY29weSwgY29weUlzQXJyYXksIGNsb25lLFxuXHRcdHRhcmdldCA9IGFyZ3VtZW50c1swXSxcblx0XHRpID0gMSxcblx0XHRsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoLFxuXHRcdGRlZXAgPSBmYWxzZTtcblxuXHQvLyBIYW5kbGUgYSBkZWVwIGNvcHkgc2l0dWF0aW9uXG5cdGlmICh0eXBlb2YgdGFyZ2V0ID09PSAnYm9vbGVhbicpIHtcblx0XHRkZWVwID0gdGFyZ2V0O1xuXHRcdHRhcmdldCA9IGFyZ3VtZW50c1sxXSB8fCB7fTtcblx0XHQvLyBza2lwIHRoZSBib29sZWFuIGFuZCB0aGUgdGFyZ2V0XG5cdFx0aSA9IDI7XG5cdH0gZWxzZSBpZiAoKHR5cGVvZiB0YXJnZXQgIT09ICdvYmplY3QnICYmIHR5cGVvZiB0YXJnZXQgIT09ICdmdW5jdGlvbicpIHx8IHRhcmdldCA9PSBudWxsKSB7XG5cdFx0dGFyZ2V0ID0ge307XG5cdH1cblxuXHRmb3IgKDsgaSA8IGxlbmd0aDsgKytpKSB7XG5cdFx0b3B0aW9ucyA9IGFyZ3VtZW50c1tpXTtcblx0XHQvLyBPbmx5IGRlYWwgd2l0aCBub24tbnVsbC91bmRlZmluZWQgdmFsdWVzXG5cdFx0aWYgKG9wdGlvbnMgIT0gbnVsbCkge1xuXHRcdFx0Ly8gRXh0ZW5kIHRoZSBiYXNlIG9iamVjdFxuXHRcdFx0Zm9yIChuYW1lIGluIG9wdGlvbnMpIHtcblx0XHRcdFx0c3JjID0gdGFyZ2V0W25hbWVdO1xuXHRcdFx0XHRjb3B5ID0gb3B0aW9uc1tuYW1lXTtcblxuXHRcdFx0XHQvLyBQcmV2ZW50IG5ldmVyLWVuZGluZyBsb29wXG5cdFx0XHRcdGlmICh0YXJnZXQgIT09IGNvcHkpIHtcblx0XHRcdFx0XHQvLyBSZWN1cnNlIGlmIHdlJ3JlIG1lcmdpbmcgcGxhaW4gb2JqZWN0cyBvciBhcnJheXNcblx0XHRcdFx0XHRpZiAoZGVlcCAmJiBjb3B5ICYmIChpc1BsYWluT2JqZWN0KGNvcHkpIHx8IChjb3B5SXNBcnJheSA9IGlzQXJyYXkoY29weSkpKSkge1xuXHRcdFx0XHRcdFx0aWYgKGNvcHlJc0FycmF5KSB7XG5cdFx0XHRcdFx0XHRcdGNvcHlJc0FycmF5ID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdGNsb25lID0gc3JjICYmIGlzQXJyYXkoc3JjKSA/IHNyYyA6IFtdO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Y2xvbmUgPSBzcmMgJiYgaXNQbGFpbk9iamVjdChzcmMpID8gc3JjIDoge307XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdC8vIE5ldmVyIG1vdmUgb3JpZ2luYWwgb2JqZWN0cywgY2xvbmUgdGhlbVxuXHRcdFx0XHRcdFx0dGFyZ2V0W25hbWVdID0gZXh0ZW5kKGRlZXAsIGNsb25lLCBjb3B5KTtcblxuXHRcdFx0XHRcdC8vIERvbid0IGJyaW5nIGluIHVuZGVmaW5lZCB2YWx1ZXNcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiBjb3B5ICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHRcdFx0dGFyZ2V0W25hbWVdID0gY29weTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvLyBSZXR1cm4gdGhlIG1vZGlmaWVkIG9iamVjdFxuXHRyZXR1cm4gdGFyZ2V0O1xufTtcblxuIiwiLyoqXHJcbiAqIOaUvuWIsOiHquW3semhueebruS4re+8jOe7n+S4gOWumuS5ieeahGlv5aSE55CG5bGCXHJcbiAqL1xyXG5jb25zdCB7SW9Db25maWcsSW99ID0gcmVxdWlyZSgnbm9kZS1pby1mZXRjaCcpO1xyXG5jb25zdCBleHRlbmQgPSByZXF1aXJlKCdleHRlbmQnKTtcclxuXHJcbi8qKlxyXG4gKiDorr7nva7oh6rlt7HnmoTphY3nva5cclxuICovXHJcblxyXG4vKipcclxuICog5Lia5Yqh6ZSZ6K+v5p2h5Lu26YWN572uXHJcbiAqIEBwYXJhbSAge1t0eXBlXX0gcmVzdWx0IFtkZXNjcmlwdGlvbl1cclxuICogQHJldHVybiB7W3R5cGVdfSAgICAgICAgW2Rlc2NyaXB0aW9uXVxyXG4gKi9cclxuSW9Db25maWcuZmFpbC5maWx0ZXIgPSBmdW5jdGlvbihyZXN1bHQpe1xyXG4gICAgaWYocmVzdWx0LmNvZGUgIT0gJ0EwMDAxJyl7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7IC8v6K+05piO5Y+R55Sf5LqG5Lia5Yqh6ZSZ6K+vXHJcbiAgICB9ZWxzZXtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBpb+ivt+axguWPkemAgeWJjeaJp+ihjFxyXG4gKiBAcmV0dXJuIHtbdHlwZV19IFtkZXNjcmlwdGlvbl1cclxuICovXHJcbklvQ29uZmlnLmlvcGFyYW1zLmJlZm9yZVNlbmQgPSBmdW5jdGlvbigpe1xyXG4gICAgY29uc29sZS5sb2coJ+ivt+axguW8gOWniycpO1xyXG4gICAgLy8gX0FQUC5Mb2FkaW5nLnNob3coKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIGlv6K+35rGC57uT5p2f5ZCOXHJcbiAqL1xyXG5Jb0NvbmZpZy5pb3BhcmFtcy5jb21wbGV0ZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICBjb25zb2xlLmxvZygn6K+35rGC57uT5p2fJylcclxuICAgIC8vIF9BUFAuTG9hZGluZy5oaWRlKCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDnvZHnu5zplJnor6/miJbogIXns7vnu5/plJnor69cclxuICogQHBhcmFtICB7W3R5cGVdfSBlcnJvciBbZGVzY3JpcHRpb25dXHJcbiAqIEByZXR1cm4ge1t0eXBlXX0gICAgICAgW2Rlc2NyaXB0aW9uXVxyXG4gKi9cclxuSW9Db25maWcuaW9wYXJhbXMuZXJyb3IgPSBmdW5jdGlvbihlcnJvcil7XHJcbiAgICAvL2Vycm9y5oiW5pyJ5oiW5pegIGVycm9yLm1lc3NhZ2VcclxuICAgIF9BUFAuVG9hc3Quc2hvdyhlcnJvci5tZXNzYWdlIHx8ICfkurLvvIzlv5nkuI3ov4fmnaXkuoYnKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOS4muWKoemUmeivr+WkhOeQhlxyXG4gKiBAcGFyYW0gIHtbdHlwZV19IHJlc3VsdCAgIFtkZXNjcmlwdGlvbl1cclxuICogQHBhcmFtICB7W3R5cGVdfSByZXNwb25zZSBbZGVzY3JpcHRpb25dXHJcbiAqIEByZXR1cm4ge1t0eXBlXX0gICAgICAgICAgW2Rlc2NyaXB0aW9uXVxyXG4gKi9cclxuSW9Db25maWcuaW9wYXJhbXMuZmFpbCA9IGZ1bmN0aW9uKHJlc3VsdCxyZXNwb25zZSl7XHJcbiAgICBpZihyZXN1bHQuY29kZSA9PSAnQTAwMDInKXtcclxuICAgICAgICBfQVBQLlRvYXN0LnNob3coJ+acqueZu+W9lScpO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgICAgX0FQUC5Ub2FzdC5zaG93KHJlc3VsdC5lcnJtc2cgfHwgJ+S6su+8jOW/meS4jei/h+adpeS6hicpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICog6LCD55So5Lul5LiL5pa55rOV55qE5pe25YCZ77yMb3B05aaCaW9wYXJhbXPjgILkvYbmmK/kuIDoiKzlj6rkvKDku6XkuIvlj4LmlbDlsLHlj6/ku6XkuobvvJpcclxuICogICBkYXRhIHN1Y2Nlc3NcclxuICogICDku6XkuIvmlrnms5Xlt7Lnu4/nu5/kuIDlpITnkIbkuobvvIzlpoLmnpzmg7Popobnm5boh6rooYzkvKDlhaVcclxuICogICBiZWZvcmVTZW5kIGVycm9yIGZhaWwgY29tcGxldGVcclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgLy9saXN0ZGF0YeaOpeWPo1xyXG4gICAgbGlzdGRhdGEob3B0KXtcclxuICAgICAgICBJby5yZXF1ZXN0KGV4dGVuZCh0cnVlLHtcclxuICAgICAgICAgICAgcmVxdWVzdDoge1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdXJsOiAnaHR0cDovLzEyNy4wLjAuMTo4MDAwL2xpc3RkYXRhJ1xyXG4gICAgICAgIH0sb3B0KSk7XHJcbiAgICB9XHJcbn07XHJcbiIsImV4cG9ydHMuSW8gPSByZXF1aXJlKCcuL2lvJyk7XHJcbmV4cG9ydHMuSW9Db25maWcgPSByZXF1aXJlKCcuL2lvY29uZmlnJyk7XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IGlv6K+35rGC5oC7YVxyXG4gKi9cclxucmVxdWlyZSgnd2hhdHdnLWZldGNoJyk7XHJcbmNvbnN0IElvQ29uZmlnID0gcmVxdWlyZSgnLi9pb2NvbmZpZycpO1xyXG5jb25zdCBleHRlbmQgPSByZXF1aXJlKCdleHRlbmQnKTtcclxuY29uc3QgcXVlcnlzdHJpbmcgPSByZXF1aXJlKCdxdWVyeXN0cmluZycpO1xyXG5cclxuLyoqXHJcbiAqIOWwhmRhdGHmoLzlvI/ljJbmiJBGb3JtRGF0YVxyXG4gKiBAcGFyYW0gIHtKU09OfSBkYXRhIFtkZXNjcmlwdGlvbl1cclxuICogQHJldHVybiB7Rm9ybURhdGF9ICAgICAgW2Rlc2NyaXB0aW9uXVxyXG4gKi9cclxuZnVuY3Rpb24gZm9ybWF0Rm9ybURhdGEoZGF0YSl7XHJcbiAgICB2YXIgX2Zvcm1kYXRhID0gbmV3IEZvcm1EYXRhKCk7XHJcbiAgICBkYXRhID0gT2JqZWN0LmVudHJpZXMoZGF0YSk7XHJcbiAgICBmb3IodmFyIHBhaXIgb2YgZGF0YSl7XHJcbiAgICAgICAgdmFyIFtrZXksIHZhbF0gPSBwYWlyO1xyXG4gICAgICAgIGlmKHZhbCA9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9ZWxzZSBpZih2YWwuY29uc3RydWN0b3IgPT0gQXJyYXkpe1xyXG4gICAgICAgICAgICB2YWwuZm9yRWFjaCgodixpKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBfZm9ybWRhdGEuYXBwZW5kKGtleSx2KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBfZm9ybWRhdGEuYXBwZW5kKGtleSx2YWwpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBfZm9ybWRhdGE7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgLyoqXHJcbiAgICAgKiDlj5Hotbdpb+ivt+axglxyXG4gICAgICogQHBhcmFtICB7SlNPTn0gaW9wYXJhbXMg5ZCMaW9jb25maWcuaW9wYXJhbXNcclxuICAgICAqIEByZXR1cm4ge1t0eXBlXX0gICAgICAgICAgW2Rlc2NyaXB0aW9uXVxyXG4gICAgICovXHJcbiAgICByZXF1ZXN0OiBmdW5jdGlvbihpb3BhcmFtcykge1xyXG4gICAgICAgIGlmKGlvcGFyYW1zLnVybCA9PSAnJyl7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaW/lj4LmlbB1cmzkuI3og73kuLrnqbonKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgY29uZiA9IHt9O1xyXG5cclxuICAgICAgICBleHRlbmQodHJ1ZSxjb25mLElvQ29uZmlnLmlvcGFyYW1zLGlvcGFyYW1zKTtcclxuXHJcbiAgICAgICAgY29uZi5yZXF1ZXN0Lm1ldGhvZCA9IGNvbmYucmVxdWVzdC5tZXRob2QudG9VcHBlckNhc2UoKTtcclxuXHJcbiAgICAgICAgLy/mo4DmtYtpb3BhcmFtc+mHjOeahGRhdGFcclxuICAgICAgICB2YXIgYm9keSA9IGNvbmYuZGF0YSwgX21ldGhvZCA9IGNvbmYucmVxdWVzdC5tZXRob2Q7XHJcblxyXG4gICAgICAgIGlmKGJvZHkgJiYgYm9keS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KXsgLy/or7TmmI5kYXRh5pivanNvblxyXG4gICAgICAgICAgICBpZihfbWV0aG9kICE9ICdHRVQnICYmIF9tZXRob2QgIT0gJ0hFQUQnICYmIGNvbmYuaXNmb3JtZGF0YSl7XHJcbiAgICAgICAgICAgICAgICBib2R5ID0gZm9ybWF0Rm9ybURhdGEoYm9keSk7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgY29uZi5oZWFkZXJzWydDb250ZW50LVR5cGUnXTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICBib2R5ID0gcXVlcnlzdHJpbmcuc3RyaW5naWZ5KGJvZHkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZihjb25mLmhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID09PSBmYWxzZSl7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBjb25mLmhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy/otYvlgLxyZXF1ZXN0LmJvZHlcclxuICAgICAgICBpZihib2R5KXtcclxuICAgICAgICAgICAgc3dpdGNoKF9tZXRob2Qpe1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnR0VUJzpcclxuICAgICAgICAgICAgICAgICAgICBpZih0eXBlb2YgYm9keSA9PSAnc3RyaW5nJyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmYudXJsICs9ICc/Jytib2R5LnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnSEVBRCc6XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGNvbmYucmVxdWVzdC5ib2R5ID0gYm9keTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy/lj5Hotbfor7fmsYJcclxuICAgICAgICBjb25mLnJlcXVlc3QuaGVhZGVycyA9IGNvbmYuaGVhZGVycztcclxuICAgICAgICB2YXIgbXlyZXF1ZXN0ID0gbmV3IFJlcXVlc3QoY29uZi51cmwsY29uZi5yZXF1ZXN0KTtcclxuXHJcbiAgICAgICAgLy/or7fmsYLlj5HotbfliY3nu5/kuIDlpITnkIZcclxuICAgICAgICBjb25mLmJlZm9yZVNlbmQoKTtcclxuXHJcbiAgICAgICAgdmFyIHJhY2UgPSBQcm9taXNlLnJhY2UoW1xyXG4gICAgICAgICAgICBmZXRjaChteXJlcXVlc3QpLFxyXG4gICAgICAgICAgICBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLHJlamVjdCl7XHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KHJlamVjdCxjb25mLnRpbWVvdXQsbmV3IEVycm9yKCfor7fmsYLotoXml7YnKSk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgXSk7XHJcbiAgICAgICAgcmFjZS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuICAgICAgICAgICAgaWYocmVzcG9uc2Uub2spIHsgLy9yZXNwb25zZS5zdGF0dXMgWzIwMCwyOTldXHJcbiAgICAgICAgICAgICAgICByZXNwb25zZVtjb25mLnR5cGVdKCkudGhlbihmdW5jdGlvbihyZXN1bHQpe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKGNvbmYuZGVhbGZhaWwpeyAvL+WkhOeQhuS4muWKoemUmeivr1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihJb0NvbmZpZy5mYWlsLmZpbHRlcihyZXN1bHQpKXsgLy/mnInkuJrliqHplJnor6/lj5HnlJ9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZbSW9Db25maWcuZmFpbC5mdW5uYW1lXShyZXN1bHQscmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXsgLy/ml6DkuJrliqHplJnor6/lj5HnlJ9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGNvbmYuZGVhbGRhdGEpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmYuc3VjY2Vzcyhjb25mLmRlYWxkYXRhZnVuKHJlc3VsdCkscmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZi5zdWNjZXNzKHJlc3VsdCxyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZi5zdWNjZXNzKHJlc3VsdCxyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxmdW5jdGlvbihlcnJvcil7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IocmVzcG9uc2Uuc3RhdHVzVGV4dCB8fCAn572R57uc6ZSZ6K+vJylcclxuICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbmYuY29tcGxldGUoKTtcclxuICAgICAgICB9KS5jYXRjaChmdW5jdGlvbihlcnJvcil7XHJcbiAgICAgICAgICAgIC8v5o2V6I635Lu75L2V6ZSZ6K+v77yM5Y2z5Y+R55Sf6K+t5rOV6ZSZ6K+v5Lmf5Lya5o2V6I63XHJcbiAgICAgICAgICAgIGNvbmYuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICBjb25mLmNvbXBsZXRlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn07XHJcbiIsIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IGlv6K+35rGC55qE5LiA5Lqb5YWs5YWx6YWN572uXHJcbiAqL1xyXG4gY29uc3QgdGhhdCA9IHtcclxuICAgIC8qKlxyXG4gICAgICog5a+55LqO5o6l5Y+j6L+U5Zue55qE5Lia5Yqh6ZSZ6K+v6L+b6KGM57uf5LiA5aSE55CGXHJcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAgICovXHJcbiAgICBmYWlsOiB7XHJcbiAgICAgICAgZnVubmFtZTogJ2ZhaWwnLCAvL+W9k+WPkeeUn+S4muWKoemUmeivr+eahOaXtuWAme+8jOiwg+eUqOeahOaWueazleWQjVxyXG4gICAgICAgIGZpbHRlcjogZnVuY3Rpb24ocmVzdWx0KSB7XHJcbiAgICAgICAgICAgIC8vIGlmKHJlc3VsdC5jb2RlICE9ICdBMDAwMScpe1xyXG4gICAgICAgICAgICAvLyAgICAgcmV0dXJuIHRydWU7IC8v6K+05piO5Y+R55Sf5LqG5Lia5Yqh6ZSZ6K+vXHJcbiAgICAgICAgICAgIC8vIH1lbHNle1xyXG4gICAgICAgICAgICAvLyAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6K+35rGC5aS06YOo6YWN572uXHJcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAgICovXHJcbiAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgLy/lpoLmnpxDb250ZW50LVR5cGXorr7nva7kuLpmYWxzZSzliJnkuI3kvKBDb250ZW50LVR5cGVcclxuICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCdcclxuICAgIH0sXHJcbiAgICAvKipcclxuICAgICAqIOivt+axguWvueixoeWPguaVsOmFjee9rlxyXG4gICAgICogQHR5cGUge09iamVjdH1cclxuICAgICAqL1xyXG4gICAgcmVxdWVzdDoge1xyXG4gICAgICAgIG1ldGhvZDogJ0dFVCcsIC8vR0VUfFBPU1RcclxuICAgICAgICBtb2RlOiAnY29ycycsIC8vY29yc3xuby1jb3JzfHNhbWUtb3JpZ2lufG5hdmlnYXRlXHJcbiAgICAgICAgLy/lhbbku5blj4LmlbBcclxuICAgICAgICAvL2JvZHk6IGNyZWRlbnRpYWxzOiBjYWNoZTogcmVkaXJlY3Q6IHJlZmVycmVyOiBpbnRlZ3JpdHlcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBzYW1lLW9yaWdpbjog5ZCMYWpheOS4gOagt++8jOWQjOWfn+WPkemAgWNvb2tpZVxyXG4gICAgICAgICAqIGluY2x1ZGU6IOi3qOWfn+WPkemAgWNvb2tpZVxyXG4gICAgICAgICAqIEB0eXBlIHtTdHJpbmd9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY3JlZGVudGlhbHM6ICdzYW1lLW9yaWdpbidcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiDosIPnlKhpb+e7hOS7tu+8jOS8oOWFpeeahOWPguaVsOagvOW8j1xyXG4gKiBAdHlwZSB7T2JqZWN0fVxyXG4gKi9cclxudGhhdC5pb3BhcmFtcyA9IHtcclxuICAgIGhlYWRlcnM6IHRoYXQuaGVhZGVycywgLy/lkIxoZWFkZXJzXHJcbiAgICByZXF1ZXN0OiB0aGF0LnJlcXVlc3QsIC8v5ZCMcmVxdWVzdFxyXG4gICAgLyoqXHJcbiAgICAgKiDor7fmsYLlj4LmlbDjgILlj6/ku6XmmK/ku6XkuIvlh6Dnp43nsbvlnovvvJpcclxuICAgICAqIEJvbGJcclxuICAgICAqIEJ1ZmZlclNvdXJjZVxyXG4gICAgICogRm9ybURhdGFcclxuICAgICAqIFVSTFNlYXJjaFBhcmFtc1xyXG4gICAgICogVVNWU3RyaW5nXHJcbiAgICAgKiBTdHJpbmdcclxuICAgICAqIEpTT046IOWmguaenOaYr2pzb24sIOWImeWBmueJueauiuWkhOeQhu+8jOivt+ingeS4i+mdomlzZm9ybWRhdGHnmoTor7TmmI5cclxuICAgICAqL1xyXG4gICAgLy8gZGF0YToge30sXHJcbiAgICAvKipcclxuICAgICAqIOWmguaenGRhdGHmmK9qc29uOlxyXG4gICAgICogIDEuIHJlcXVlc3QubWV0aG9k5LiN5pivR0VU5oiWSEVBRCwg5LiUaXNmb3JtZGF0YeS4unRydWUsIOmCo+S5iOWwhmRhdGHovazmjaLmiJBGb3JtRGF0YeagvOW8j1xyXG4gICAgICogIDIuIOWmguaenOS4jeespuWQiOesrDHnp43vvIzlsIZkYXRh6L2s5o2i5oiQcXVlcnlzdHJpbmdcclxuICAgICAqIEB0eXBlIHtCb29sZWFufVxyXG4gICAgICovXHJcbiAgICBpc2Zvcm1kYXRhOiBmYWxzZSxcclxuICAgIHVybDogJycsIC8v6K+35rGCdXJs5Zyw5Z2AXHJcbiAgICAvKipcclxuICAgICAqIOivt+axgueahOaVsOaNruexu+Wei++8jOm7mOiupOS4umpzb24uIOaVsOaNruexu+Wei+WSjHJlcG9uc2Xlr7nosaHov5Tlm57ojrflj5bnu5PmnpznmoTmlrnms5Xlr7nlupTlhbPns7vlpoLkuItcclxuICAgICAqIGFycmF5QnVmZmVyOiByZXNwb25zZS5hcnJheUJ1ZmZlclxyXG4gICAgICogYmxvYjogcmVzcG9uc2UuYmxvYlxyXG4gICAgICogZm9ybURhdGE6IHJlc3BvbnNlLmZvcm1EYXRhLFxyXG4gICAgICoganNvbjogcmVzcG9uc2UuanNvbixcclxuICAgICAqIHRleHQ6IHJlc3BvbnNlLnRleHRcclxuICAgICAqIEB0eXBlIHtTdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIHR5cGU6ICdqc29uJyxcclxuICAgIHRpbWVvdXQ6IDYwMDAsXHJcbiAgICAvKipcclxuICAgICAqIGlv6K+35rGC5YmN77yM57uf5LiA55qE5aSE55CGXHJcbiAgICAgKiBAcmV0dXJuIHtbdHlwZV19IFtkZXNjcmlwdGlvbl1cclxuICAgICAqL1xyXG4gICAgYmVmb3JlU2VuZDogZnVuY3Rpb24oKXtcclxuXHJcbiAgICB9LFxyXG4gICAgLyoqXHJcbiAgICAgKiDlr7nkuo7mjqXlj6Pov5Tlm57plJnor6/vvIzkuIDoiKzlm6DkuLrnvZHnu5zljp/lm6DvvIzov5vooYznmoTnu5/kuIDlpITnkIZcclxuICAgICAqL1xyXG4gICAgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKXtcclxuICAgICAgICAvL2Vycm9y5oiW5pyJ5oiW5pegIGVycm9yLm1lc3NhZ2VcclxuICAgICAgICAvL0FsZXJ0LmFsZXJ0KCfns7vnu5/mtojmga8nLGVycm9yLm1lc3NhZ2UgfHwgJ+S6su+8jOW/meS4jei/h+adpeS6hicpO1xyXG4gICAgfSxcclxuICAgIC8qKlxyXG4gICAgICog5aaC5p6cZmFpbOmFjee9ruS6hmZ1bm5hbWXkuLpmYWlsLOWImeiwg+eUqOatpOaWueazlS4g5q2k5pe2ZmFpbC5maWx0ZXLov5Tlm550cnVlXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdHxPdGhlcn0gcmVzdWx0IOaOpeWPo+i/lOWbnuaVsOaNrlxyXG4gICAgICogQHBhcmFtIHtSZXNwb25zZX0gcmVzcG9uc2Ug6L+U5Zue55qEcmVzcG9uc2Xlr7nosaFcclxuICAgICAqIEByZXR1cm4ge1t0eXBlXX0gW2Rlc2NyaXB0aW9uXVxyXG4gICAgICovXHJcbiAgICBmYWlsOiBmdW5jdGlvbihyZXN1bHQscmVzcG9uc2Upe1xyXG4gICAgICAgIC8vQWxlcnQuYWxlcnQoJ+ezu+e7n+a2iOaBrycscmVzdWx0LmVycm1zZyB8fCAn5Lqy77yM5b+Z5LiN6L+H5p2l5LqGJyk7XHJcbiAgICB9LFxyXG4gICAgLyoqXHJcbiAgICAgKiDmiJDlip/osIPnlKjmlrnms5XjgILosIPnlKjnmoTmg4XlhrXmnInlpoLkuIvlh6Dnp43vvJpcclxuICAgICAqIDEuIGRlYWxmYWls5Li6dHJ1ZSwg5YiZZmFpbC5maWx0ZXLov5Tlm55mYWxzZeaXtu+8jOiwg+eUqHN1Y2Nlc3NcclxuICAgICAqICAgICAgICAgIOatpOaXtuWmguaenGRlYWxkYXRh5Li6dHJ1ZSwg5YiZcmVzdWx05Li6ZGVhbGRhdGFmdW7ov5Tlm57nmoTmlbDmja5cclxuICAgICAqIDIuIGRlYWxmYWls5Li6ZmFsc2Xml7bvvIzliJnmjqXlj6Pov5Tlm57lkI7nm7TmjqXosIPnlKjmraTmlrnms5XvvIjkuI3lj5HnlJ9lcnJvcueahOaDheWGteS4i++8iVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fE90aGVyfSByZXN1bHQg5o6l5Y+j6L+U5Zue5pWw5o2uXHJcbiAgICAgKiBAcGFyYW0ge1Jlc3BvbnNlfSByZXNwb25zZSDov5Tlm57nmoRyZXNwb25zZeWvueixoVxyXG4gICAgICovXHJcbiAgICBzdWNjZXNzOiBmdW5jdGlvbihyZXN1bHQscmVzcG9uc2Upe30sXHJcbiAgICAvKipcclxuICAgICAqIOaOpeWPo+ivt+axguWujOavleiwg+eUqOOAguaXoOiuunN1Y2Nlc3MsZmFpbCxlcnJvclxyXG4gICAgICogQHJldHVybiB7W3R5cGVdfSBbZGVzY3JpcHRpb25dXHJcbiAgICAgKi9cclxuICAgIGNvbXBsZXRlOiBmdW5jdGlvbigpe30sXHJcbiAgICAvKipcclxuICAgICAqIOWmguaenGRlYWxkYXRh5Li6dHJ1ZSwg5YiZc3VjY2Vzc+eahHJlc3VsdOS4uuatpOaWueazlei/lOWbnueahOaVsOaNrlxyXG4gICAgICogQHBhcmFtIHtPYmplY3R8T3RoZXJ9IHJlc3VsdCDmjqXlj6Pov5Tlm57mlbDmja5cclxuICAgICAqIEByZXR1cm4ge1t0eXBlXX0gICAgICAgIFtkZXNjcmlwdGlvbl1cclxuICAgICAqL1xyXG4gICAgZGVhbGRhdGFmdW46IGZ1bmN0aW9uKHJlc3VsdCl7cmV0dXJuIHJlc3VsdC5kYXRhfSxcclxuICAgIC8qKlxyXG4gICAgICog5piv5ZCm57uf5LiA5aSE55CG5Lia5Yqh6ZSZ6K+vXHJcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgZGVhbGZhaWw6IHRydWUsIC8v5piv5ZCm57uf5LiA5aSE55CG5Lia5Yqh6ZSZ6K+vXHJcbiAgICAvKipcclxuICAgICAqIOW9k+S4muWKoeaIkOWKn+aXtu+8jOiwg+eUqHN1Y2Nlc3PliY3vvIzmmK/lkKbnu5/kuIDmoLzlvI/ljJbmlbDmja5cclxuICAgICAqIOWmguaenGRlYWxmYWls5Li6dHJ1ZSzlubbkuJRmYWlsLmZpbHRlcui/lOWbnuS4umZhbHNl5pe277yM5aaC5p6c5q2k6aG56K6+572u5Li6dHJ1ZSzliJnosIPnlKhkZWFsZGF0YWZ1buaWueazle+8jOi/lOWbnuWkhOeQhuWQjueahOaVsOaNrlxyXG4gICAgICogQHR5cGUge0Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGRlYWxkYXRhOiB0cnVlXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHRoYXQ7XHJcbiIsIihmdW5jdGlvbihzZWxmKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBpZiAoc2VsZi5mZXRjaCkge1xuICAgIHJldHVyblxuICB9XG5cbiAgdmFyIHN1cHBvcnQgPSB7XG4gICAgc2VhcmNoUGFyYW1zOiAnVVJMU2VhcmNoUGFyYW1zJyBpbiBzZWxmLFxuICAgIGl0ZXJhYmxlOiAnU3ltYm9sJyBpbiBzZWxmICYmICdpdGVyYXRvcicgaW4gU3ltYm9sLFxuICAgIGJsb2I6ICdGaWxlUmVhZGVyJyBpbiBzZWxmICYmICdCbG9iJyBpbiBzZWxmICYmIChmdW5jdGlvbigpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIG5ldyBCbG9iKClcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9KSgpLFxuICAgIGZvcm1EYXRhOiAnRm9ybURhdGEnIGluIHNlbGYsXG4gICAgYXJyYXlCdWZmZXI6ICdBcnJheUJ1ZmZlcicgaW4gc2VsZlxuICB9XG5cbiAgaWYgKHN1cHBvcnQuYXJyYXlCdWZmZXIpIHtcbiAgICB2YXIgdmlld0NsYXNzZXMgPSBbXG4gICAgICAnW29iamVjdCBJbnQ4QXJyYXldJyxcbiAgICAgICdbb2JqZWN0IFVpbnQ4QXJyYXldJyxcbiAgICAgICdbb2JqZWN0IFVpbnQ4Q2xhbXBlZEFycmF5XScsXG4gICAgICAnW29iamVjdCBJbnQxNkFycmF5XScsXG4gICAgICAnW29iamVjdCBVaW50MTZBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgSW50MzJBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgVWludDMyQXJyYXldJyxcbiAgICAgICdbb2JqZWN0IEZsb2F0MzJBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgRmxvYXQ2NEFycmF5XSdcbiAgICBdXG5cbiAgICB2YXIgaXNEYXRhVmlldyA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIG9iaiAmJiBEYXRhVmlldy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihvYmopXG4gICAgfVxuXG4gICAgdmFyIGlzQXJyYXlCdWZmZXJWaWV3ID0gQXJyYXlCdWZmZXIuaXNWaWV3IHx8IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIG9iaiAmJiB2aWV3Q2xhc3Nlcy5pbmRleE9mKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopKSA+IC0xXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplTmFtZShuYW1lKSB7XG4gICAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xuICAgICAgbmFtZSA9IFN0cmluZyhuYW1lKVxuICAgIH1cbiAgICBpZiAoL1teYS16MC05XFwtIyQlJicqKy5cXF5fYHx+XS9pLnRlc3QobmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgY2hhcmFjdGVyIGluIGhlYWRlciBmaWVsZCBuYW1lJylcbiAgICB9XG4gICAgcmV0dXJuIG5hbWUudG9Mb3dlckNhc2UoKVxuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplVmFsdWUodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgdmFsdWUgPSBTdHJpbmcodmFsdWUpXG4gICAgfVxuICAgIHJldHVybiB2YWx1ZVxuICB9XG5cbiAgLy8gQnVpbGQgYSBkZXN0cnVjdGl2ZSBpdGVyYXRvciBmb3IgdGhlIHZhbHVlIGxpc3RcbiAgZnVuY3Rpb24gaXRlcmF0b3JGb3IoaXRlbXMpIHtcbiAgICB2YXIgaXRlcmF0b3IgPSB7XG4gICAgICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gaXRlbXMuc2hpZnQoKVxuICAgICAgICByZXR1cm4ge2RvbmU6IHZhbHVlID09PSB1bmRlZmluZWQsIHZhbHVlOiB2YWx1ZX1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3VwcG9ydC5pdGVyYWJsZSkge1xuICAgICAgaXRlcmF0b3JbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gaXRlcmF0b3JcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gaXRlcmF0b3JcbiAgfVxuXG4gIGZ1bmN0aW9uIEhlYWRlcnMoaGVhZGVycykge1xuICAgIHRoaXMubWFwID0ge31cblxuICAgIGlmIChoZWFkZXJzIGluc3RhbmNlb2YgSGVhZGVycykge1xuICAgICAgaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kKG5hbWUsIHZhbHVlKVxuICAgICAgfSwgdGhpcylcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoaGVhZGVycykpIHtcbiAgICAgIGhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbihoZWFkZXIpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQoaGVhZGVyWzBdLCBoZWFkZXJbMV0pXG4gICAgICB9LCB0aGlzKVxuICAgIH0gZWxzZSBpZiAoaGVhZGVycykge1xuICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoaGVhZGVycykuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kKG5hbWUsIGhlYWRlcnNbbmFtZV0pXG4gICAgICB9LCB0aGlzKVxuICAgIH1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmFwcGVuZCA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgbmFtZSA9IG5vcm1hbGl6ZU5hbWUobmFtZSlcbiAgICB2YWx1ZSA9IG5vcm1hbGl6ZVZhbHVlKHZhbHVlKVxuICAgIHZhciBvbGRWYWx1ZSA9IHRoaXMubWFwW25hbWVdXG4gICAgdGhpcy5tYXBbbmFtZV0gPSBvbGRWYWx1ZSA/IG9sZFZhbHVlKycsJyt2YWx1ZSA6IHZhbHVlXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgZGVsZXRlIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgbmFtZSA9IG5vcm1hbGl6ZU5hbWUobmFtZSlcbiAgICByZXR1cm4gdGhpcy5oYXMobmFtZSkgPyB0aGlzLm1hcFtuYW1lXSA6IG51bGxcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAuaGFzT3duUHJvcGVydHkobm9ybWFsaXplTmFtZShuYW1lKSlcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV0gPSBub3JtYWxpemVWYWx1ZSh2YWx1ZSlcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbihjYWxsYmFjaywgdGhpc0FyZykge1xuICAgIGZvciAodmFyIG5hbWUgaW4gdGhpcy5tYXApIHtcbiAgICAgIGlmICh0aGlzLm1hcC5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIHRoaXMubWFwW25hbWVdLCBuYW1lLCB0aGlzKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmtleXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXVxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkgeyBpdGVtcy5wdXNoKG5hbWUpIH0pXG4gICAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUudmFsdWVzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGl0ZW1zID0gW11cbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHsgaXRlbXMucHVzaCh2YWx1ZSkgfSlcbiAgICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5lbnRyaWVzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGl0ZW1zID0gW11cbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHsgaXRlbXMucHVzaChbbmFtZSwgdmFsdWVdKSB9KVxuICAgIHJldHVybiBpdGVyYXRvckZvcihpdGVtcylcbiAgfVxuXG4gIGlmIChzdXBwb3J0Lml0ZXJhYmxlKSB7XG4gICAgSGVhZGVycy5wcm90b3R5cGVbU3ltYm9sLml0ZXJhdG9yXSA9IEhlYWRlcnMucHJvdG90eXBlLmVudHJpZXNcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbnN1bWVkKGJvZHkpIHtcbiAgICBpZiAoYm9keS5ib2R5VXNlZCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBUeXBlRXJyb3IoJ0FscmVhZHkgcmVhZCcpKVxuICAgIH1cbiAgICBib2R5LmJvZHlVc2VkID0gdHJ1ZVxuICB9XG5cbiAgZnVuY3Rpb24gZmlsZVJlYWRlclJlYWR5KHJlYWRlcikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVzb2x2ZShyZWFkZXIucmVzdWx0KVxuICAgICAgfVxuICAgICAgcmVhZGVyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KHJlYWRlci5lcnJvcilcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc0FycmF5QnVmZmVyKGJsb2IpIHtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgIHZhciBwcm9taXNlID0gZmlsZVJlYWRlclJlYWR5KHJlYWRlcilcbiAgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoYmxvYilcbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc1RleHQoYmxvYikge1xuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgdmFyIHByb21pc2UgPSBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKVxuICAgIHJlYWRlci5yZWFkQXNUZXh0KGJsb2IpXG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRBcnJheUJ1ZmZlckFzVGV4dChidWYpIHtcbiAgICB2YXIgdmlldyA9IG5ldyBVaW50OEFycmF5KGJ1ZilcbiAgICB2YXIgY2hhcnMgPSBuZXcgQXJyYXkodmlldy5sZW5ndGgpXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZpZXcubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNoYXJzW2ldID0gU3RyaW5nLmZyb21DaGFyQ29kZSh2aWV3W2ldKVxuICAgIH1cbiAgICByZXR1cm4gY2hhcnMuam9pbignJylcbiAgfVxuXG4gIGZ1bmN0aW9uIGJ1ZmZlckNsb25lKGJ1Zikge1xuICAgIGlmIChidWYuc2xpY2UpIHtcbiAgICAgIHJldHVybiBidWYuc2xpY2UoMClcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHZpZXcgPSBuZXcgVWludDhBcnJheShidWYuYnl0ZUxlbmd0aClcbiAgICAgIHZpZXcuc2V0KG5ldyBVaW50OEFycmF5KGJ1ZikpXG4gICAgICByZXR1cm4gdmlldy5idWZmZXJcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBCb2R5KCkge1xuICAgIHRoaXMuYm9keVVzZWQgPSBmYWxzZVxuXG4gICAgdGhpcy5faW5pdEJvZHkgPSBmdW5jdGlvbihib2R5KSB7XG4gICAgICB0aGlzLl9ib2R5SW5pdCA9IGJvZHlcbiAgICAgIGlmICghYm9keSkge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9ICcnXG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5ibG9iICYmIEJsb2IucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUJsb2IgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuZm9ybURhdGEgJiYgRm9ybURhdGEucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUZvcm1EYXRhID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LnNlYXJjaFBhcmFtcyAmJiBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSBib2R5LnRvU3RyaW5nKClcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5hcnJheUJ1ZmZlciAmJiBzdXBwb3J0LmJsb2IgJiYgaXNEYXRhVmlldyhib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5QXJyYXlCdWZmZXIgPSBidWZmZXJDbG9uZShib2R5LmJ1ZmZlcilcbiAgICAgICAgLy8gSUUgMTAtMTEgY2FuJ3QgaGFuZGxlIGEgRGF0YVZpZXcgYm9keS5cbiAgICAgICAgdGhpcy5fYm9keUluaXQgPSBuZXcgQmxvYihbdGhpcy5fYm9keUFycmF5QnVmZmVyXSlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5hcnJheUJ1ZmZlciAmJiAoQXJyYXlCdWZmZXIucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkgfHwgaXNBcnJheUJ1ZmZlclZpZXcoYm9keSkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlBcnJheUJ1ZmZlciA9IGJ1ZmZlckNsb25lKGJvZHkpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vuc3VwcG9ydGVkIEJvZHlJbml0IHR5cGUnKVxuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuaGVhZGVycy5nZXQoJ2NvbnRlbnQtdHlwZScpKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCAndGV4dC9wbGFpbjtjaGFyc2V0PVVURi04JylcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5QmxvYiAmJiB0aGlzLl9ib2R5QmxvYi50eXBlKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgdGhpcy5fYm9keUJsb2IudHlwZSlcbiAgICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LnNlYXJjaFBhcmFtcyAmJiBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9VVRGLTgnKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuYmxvYikge1xuICAgICAgdGhpcy5ibG9iID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICAgIHJldHVybiByZWplY3RlZFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2JvZHlCbG9iKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5QmxvYilcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBCbG9iKFt0aGlzLl9ib2R5QXJyYXlCdWZmZXJdKSlcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5Rm9ybURhdGEpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgYmxvYicpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgQmxvYihbdGhpcy5fYm9keVRleHRdKSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmFycmF5QnVmZmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpIHtcbiAgICAgICAgICByZXR1cm4gY29uc3VtZWQodGhpcykgfHwgUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlBcnJheUJ1ZmZlcilcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5ibG9iKCkudGhlbihyZWFkQmxvYkFzQXJyYXlCdWZmZXIpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgcmV0dXJuIHJlamVjdGVkXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9ib2R5QmxvYikge1xuICAgICAgICByZXR1cm4gcmVhZEJsb2JBc1RleHQodGhpcy5fYm9keUJsb2IpXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJlYWRBcnJheUJ1ZmZlckFzVGV4dCh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpKVxuICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5Rm9ybURhdGEpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZCBub3QgcmVhZCBGb3JtRGF0YSBib2R5IGFzIHRleHQnKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5VGV4dClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3VwcG9ydC5mb3JtRGF0YSkge1xuICAgICAgdGhpcy5mb3JtRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihkZWNvZGUpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5qc29uID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihKU09OLnBhcnNlKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvLyBIVFRQIG1ldGhvZHMgd2hvc2UgY2FwaXRhbGl6YXRpb24gc2hvdWxkIGJlIG5vcm1hbGl6ZWRcbiAgdmFyIG1ldGhvZHMgPSBbJ0RFTEVURScsICdHRVQnLCAnSEVBRCcsICdPUFRJT05TJywgJ1BPU1QnLCAnUFVUJ11cblxuICBmdW5jdGlvbiBub3JtYWxpemVNZXRob2QobWV0aG9kKSB7XG4gICAgdmFyIHVwY2FzZWQgPSBtZXRob2QudG9VcHBlckNhc2UoKVxuICAgIHJldHVybiAobWV0aG9kcy5pbmRleE9mKHVwY2FzZWQpID4gLTEpID8gdXBjYXNlZCA6IG1ldGhvZFxuICB9XG5cbiAgZnVuY3Rpb24gUmVxdWVzdChpbnB1dCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG4gICAgdmFyIGJvZHkgPSBvcHRpb25zLmJvZHlcblxuICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIFJlcXVlc3QpIHtcbiAgICAgIGlmIChpbnB1dC5ib2R5VXNlZCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBbHJlYWR5IHJlYWQnKVxuICAgICAgfVxuICAgICAgdGhpcy51cmwgPSBpbnB1dC51cmxcbiAgICAgIHRoaXMuY3JlZGVudGlhbHMgPSBpbnB1dC5jcmVkZW50aWFsc1xuICAgICAgaWYgKCFvcHRpb25zLmhlYWRlcnMpIHtcbiAgICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMoaW5wdXQuaGVhZGVycylcbiAgICAgIH1cbiAgICAgIHRoaXMubWV0aG9kID0gaW5wdXQubWV0aG9kXG4gICAgICB0aGlzLm1vZGUgPSBpbnB1dC5tb2RlXG4gICAgICBpZiAoIWJvZHkgJiYgaW5wdXQuX2JvZHlJbml0ICE9IG51bGwpIHtcbiAgICAgICAgYm9keSA9IGlucHV0Ll9ib2R5SW5pdFxuICAgICAgICBpbnB1dC5ib2R5VXNlZCA9IHRydWVcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51cmwgPSBTdHJpbmcoaW5wdXQpXG4gICAgfVxuXG4gICAgdGhpcy5jcmVkZW50aWFscyA9IG9wdGlvbnMuY3JlZGVudGlhbHMgfHwgdGhpcy5jcmVkZW50aWFscyB8fCAnb21pdCdcbiAgICBpZiAob3B0aW9ucy5oZWFkZXJzIHx8ICF0aGlzLmhlYWRlcnMpIHtcbiAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKG9wdGlvbnMuaGVhZGVycylcbiAgICB9XG4gICAgdGhpcy5tZXRob2QgPSBub3JtYWxpemVNZXRob2Qob3B0aW9ucy5tZXRob2QgfHwgdGhpcy5tZXRob2QgfHwgJ0dFVCcpXG4gICAgdGhpcy5tb2RlID0gb3B0aW9ucy5tb2RlIHx8IHRoaXMubW9kZSB8fCBudWxsXG4gICAgdGhpcy5yZWZlcnJlciA9IG51bGxcblxuICAgIGlmICgodGhpcy5tZXRob2QgPT09ICdHRVQnIHx8IHRoaXMubWV0aG9kID09PSAnSEVBRCcpICYmIGJvZHkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0JvZHkgbm90IGFsbG93ZWQgZm9yIEdFVCBvciBIRUFEIHJlcXVlc3RzJylcbiAgICB9XG4gICAgdGhpcy5faW5pdEJvZHkoYm9keSlcbiAgfVxuXG4gIFJlcXVlc3QucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBSZXF1ZXN0KHRoaXMsIHsgYm9keTogdGhpcy5fYm9keUluaXQgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlY29kZShib2R5KSB7XG4gICAgdmFyIGZvcm0gPSBuZXcgRm9ybURhdGEoKVxuICAgIGJvZHkudHJpbSgpLnNwbGl0KCcmJykuZm9yRWFjaChmdW5jdGlvbihieXRlcykge1xuICAgICAgaWYgKGJ5dGVzKSB7XG4gICAgICAgIHZhciBzcGxpdCA9IGJ5dGVzLnNwbGl0KCc9JylcbiAgICAgICAgdmFyIG5hbWUgPSBzcGxpdC5zaGlmdCgpLnJlcGxhY2UoL1xcKy9nLCAnICcpXG4gICAgICAgIHZhciB2YWx1ZSA9IHNwbGl0LmpvaW4oJz0nKS5yZXBsYWNlKC9cXCsvZywgJyAnKVxuICAgICAgICBmb3JtLmFwcGVuZChkZWNvZGVVUklDb21wb25lbnQobmFtZSksIGRlY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gZm9ybVxuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VIZWFkZXJzKHJhd0hlYWRlcnMpIHtcbiAgICB2YXIgaGVhZGVycyA9IG5ldyBIZWFkZXJzKClcbiAgICByYXdIZWFkZXJzLnNwbGl0KC9cXHI/XFxuLykuZm9yRWFjaChmdW5jdGlvbihsaW5lKSB7XG4gICAgICB2YXIgcGFydHMgPSBsaW5lLnNwbGl0KCc6JylcbiAgICAgIHZhciBrZXkgPSBwYXJ0cy5zaGlmdCgpLnRyaW0oKVxuICAgICAgaWYgKGtleSkge1xuICAgICAgICB2YXIgdmFsdWUgPSBwYXJ0cy5qb2luKCc6JykudHJpbSgpXG4gICAgICAgIGhlYWRlcnMuYXBwZW5kKGtleSwgdmFsdWUpXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gaGVhZGVyc1xuICB9XG5cbiAgQm9keS5jYWxsKFJlcXVlc3QucHJvdG90eXBlKVxuXG4gIGZ1bmN0aW9uIFJlc3BvbnNlKGJvZHlJbml0LCBvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0ge31cbiAgICB9XG5cbiAgICB0aGlzLnR5cGUgPSAnZGVmYXVsdCdcbiAgICB0aGlzLnN0YXR1cyA9ICdzdGF0dXMnIGluIG9wdGlvbnMgPyBvcHRpb25zLnN0YXR1cyA6IDIwMFxuICAgIHRoaXMub2sgPSB0aGlzLnN0YXR1cyA+PSAyMDAgJiYgdGhpcy5zdGF0dXMgPCAzMDBcbiAgICB0aGlzLnN0YXR1c1RleHQgPSAnc3RhdHVzVGV4dCcgaW4gb3B0aW9ucyA/IG9wdGlvbnMuc3RhdHVzVGV4dCA6ICdPSydcbiAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpXG4gICAgdGhpcy51cmwgPSBvcHRpb25zLnVybCB8fCAnJ1xuICAgIHRoaXMuX2luaXRCb2R5KGJvZHlJbml0KVxuICB9XG5cbiAgQm9keS5jYWxsKFJlc3BvbnNlLnByb3RvdHlwZSlcblxuICBSZXNwb25zZS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKHRoaXMuX2JvZHlJbml0LCB7XG4gICAgICBzdGF0dXM6IHRoaXMuc3RhdHVzLFxuICAgICAgc3RhdHVzVGV4dDogdGhpcy5zdGF0dXNUZXh0LFxuICAgICAgaGVhZGVyczogbmV3IEhlYWRlcnModGhpcy5oZWFkZXJzKSxcbiAgICAgIHVybDogdGhpcy51cmxcbiAgICB9KVxuICB9XG5cbiAgUmVzcG9uc2UuZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcmVzcG9uc2UgPSBuZXcgUmVzcG9uc2UobnVsbCwge3N0YXR1czogMCwgc3RhdHVzVGV4dDogJyd9KVxuICAgIHJlc3BvbnNlLnR5cGUgPSAnZXJyb3InXG4gICAgcmV0dXJuIHJlc3BvbnNlXG4gIH1cblxuICB2YXIgcmVkaXJlY3RTdGF0dXNlcyA9IFszMDEsIDMwMiwgMzAzLCAzMDcsIDMwOF1cblxuICBSZXNwb25zZS5yZWRpcmVjdCA9IGZ1bmN0aW9uKHVybCwgc3RhdHVzKSB7XG4gICAgaWYgKHJlZGlyZWN0U3RhdHVzZXMuaW5kZXhPZihzdGF0dXMpID09PSAtMSkge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0ludmFsaWQgc3RhdHVzIGNvZGUnKVxuICAgIH1cblxuICAgIHJldHVybiBuZXcgUmVzcG9uc2UobnVsbCwge3N0YXR1czogc3RhdHVzLCBoZWFkZXJzOiB7bG9jYXRpb246IHVybH19KVxuICB9XG5cbiAgc2VsZi5IZWFkZXJzID0gSGVhZGVyc1xuICBzZWxmLlJlcXVlc3QgPSBSZXF1ZXN0XG4gIHNlbGYuUmVzcG9uc2UgPSBSZXNwb25zZVxuXG4gIHNlbGYuZmV0Y2ggPSBmdW5jdGlvbihpbnB1dCwgaW5pdCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciByZXF1ZXN0ID0gbmV3IFJlcXVlc3QoaW5wdXQsIGluaXQpXG4gICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcblxuICAgICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgICBzdGF0dXM6IHhoci5zdGF0dXMsXG4gICAgICAgICAgc3RhdHVzVGV4dDogeGhyLnN0YXR1c1RleHQsXG4gICAgICAgICAgaGVhZGVyczogcGFyc2VIZWFkZXJzKHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSB8fCAnJylcbiAgICAgICAgfVxuICAgICAgICBvcHRpb25zLnVybCA9ICdyZXNwb25zZVVSTCcgaW4geGhyID8geGhyLnJlc3BvbnNlVVJMIDogb3B0aW9ucy5oZWFkZXJzLmdldCgnWC1SZXF1ZXN0LVVSTCcpXG4gICAgICAgIHZhciBib2R5ID0gJ3Jlc3BvbnNlJyBpbiB4aHIgPyB4aHIucmVzcG9uc2UgOiB4aHIucmVzcG9uc2VUZXh0XG4gICAgICAgIHJlc29sdmUobmV3IFJlc3BvbnNlKGJvZHksIG9wdGlvbnMpKVxuICAgICAgfVxuXG4gICAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKVxuICAgICAgfVxuXG4gICAgICB4aHIub250aW1lb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChuZXcgVHlwZUVycm9yKCdOZXR3b3JrIHJlcXVlc3QgZmFpbGVkJykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vcGVuKHJlcXVlc3QubWV0aG9kLCByZXF1ZXN0LnVybCwgdHJ1ZSlcblxuICAgICAgaWYgKHJlcXVlc3QuY3JlZGVudGlhbHMgPT09ICdpbmNsdWRlJykge1xuICAgICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZVxuICAgICAgfVxuXG4gICAgICBpZiAoJ3Jlc3BvbnNlVHlwZScgaW4geGhyICYmIHN1cHBvcnQuYmxvYikge1xuICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2Jsb2InXG4gICAgICB9XG5cbiAgICAgIHJlcXVlc3QuaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKG5hbWUsIHZhbHVlKVxuICAgICAgfSlcblxuICAgICAgeGhyLnNlbmQodHlwZW9mIHJlcXVlc3QuX2JvZHlJbml0ID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiByZXF1ZXN0Ll9ib2R5SW5pdClcbiAgICB9KVxuICB9XG4gIHNlbGYuZmV0Y2gucG9seWZpbGwgPSB0cnVlXG59KSh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgPyBzZWxmIDogdGhpcyk7XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuJ3VzZSBzdHJpY3QnO1xuXG4vLyBJZiBvYmouaGFzT3duUHJvcGVydHkgaGFzIGJlZW4gb3ZlcnJpZGRlbiwgdGhlbiBjYWxsaW5nXG4vLyBvYmouaGFzT3duUHJvcGVydHkocHJvcCkgd2lsbCBicmVhay5cbi8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2pveWVudC9ub2RlL2lzc3Vlcy8xNzA3XG5mdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHFzLCBzZXAsIGVxLCBvcHRpb25zKSB7XG4gIHNlcCA9IHNlcCB8fCAnJic7XG4gIGVxID0gZXEgfHwgJz0nO1xuICB2YXIgb2JqID0ge307XG5cbiAgaWYgKHR5cGVvZiBxcyAhPT0gJ3N0cmluZycgfHwgcXMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfVxuXG4gIHZhciByZWdleHAgPSAvXFwrL2c7XG4gIHFzID0gcXMuc3BsaXQoc2VwKTtcblxuICB2YXIgbWF4S2V5cyA9IDEwMDA7XG4gIGlmIChvcHRpb25zICYmIHR5cGVvZiBvcHRpb25zLm1heEtleXMgPT09ICdudW1iZXInKSB7XG4gICAgbWF4S2V5cyA9IG9wdGlvbnMubWF4S2V5cztcbiAgfVxuXG4gIHZhciBsZW4gPSBxcy5sZW5ndGg7XG4gIC8vIG1heEtleXMgPD0gMCBtZWFucyB0aGF0IHdlIHNob3VsZCBub3QgbGltaXQga2V5cyBjb3VudFxuICBpZiAobWF4S2V5cyA+IDAgJiYgbGVuID4gbWF4S2V5cykge1xuICAgIGxlbiA9IG1heEtleXM7XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKSB7XG4gICAgdmFyIHggPSBxc1tpXS5yZXBsYWNlKHJlZ2V4cCwgJyUyMCcpLFxuICAgICAgICBpZHggPSB4LmluZGV4T2YoZXEpLFxuICAgICAgICBrc3RyLCB2c3RyLCBrLCB2O1xuXG4gICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICBrc3RyID0geC5zdWJzdHIoMCwgaWR4KTtcbiAgICAgIHZzdHIgPSB4LnN1YnN0cihpZHggKyAxKTtcbiAgICB9IGVsc2Uge1xuICAgICAga3N0ciA9IHg7XG4gICAgICB2c3RyID0gJyc7XG4gICAgfVxuXG4gICAgayA9IGRlY29kZVVSSUNvbXBvbmVudChrc3RyKTtcbiAgICB2ID0gZGVjb2RlVVJJQ29tcG9uZW50KHZzdHIpO1xuXG4gICAgaWYgKCFoYXNPd25Qcm9wZXJ0eShvYmosIGspKSB7XG4gICAgICBvYmpba10gPSB2O1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheShvYmpba10pKSB7XG4gICAgICBvYmpba10ucHVzaCh2KTtcbiAgICB9IGVsc2Uge1xuICAgICAgb2JqW2tdID0gW29ialtrXSwgdl07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG9iajtcbn07XG5cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoeHMpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh4cykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHN0cmluZ2lmeVByaW1pdGl2ZSA9IGZ1bmN0aW9uKHYpIHtcbiAgc3dpdGNoICh0eXBlb2Ygdikge1xuICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICByZXR1cm4gdjtcblxuICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgcmV0dXJuIHYgPyAndHJ1ZScgOiAnZmFsc2UnO1xuXG4gICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgIHJldHVybiBpc0Zpbml0ZSh2KSA/IHYgOiAnJztcblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gJyc7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqLCBzZXAsIGVxLCBuYW1lKSB7XG4gIHNlcCA9IHNlcCB8fCAnJic7XG4gIGVxID0gZXEgfHwgJz0nO1xuICBpZiAob2JqID09PSBudWxsKSB7XG4gICAgb2JqID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBvYmogPT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIG1hcChvYmplY3RLZXlzKG9iaiksIGZ1bmN0aW9uKGspIHtcbiAgICAgIHZhciBrcyA9IGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUoaykpICsgZXE7XG4gICAgICBpZiAoaXNBcnJheShvYmpba10pKSB7XG4gICAgICAgIHJldHVybiBtYXAob2JqW2tdLCBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgcmV0dXJuIGtzICsgZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZSh2KSk7XG4gICAgICAgIH0pLmpvaW4oc2VwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBrcyArIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUob2JqW2tdKSk7XG4gICAgICB9XG4gICAgfSkuam9pbihzZXApO1xuXG4gIH1cblxuICBpZiAoIW5hbWUpIHJldHVybiAnJztcbiAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUobmFtZSkpICsgZXEgK1xuICAgICAgICAgZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZShvYmopKTtcbn07XG5cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoeHMpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh4cykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG5mdW5jdGlvbiBtYXAgKHhzLCBmKSB7XG4gIGlmICh4cy5tYXApIHJldHVybiB4cy5tYXAoZik7XG4gIHZhciByZXMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB4cy5sZW5ndGg7IGkrKykge1xuICAgIHJlcy5wdXNoKGYoeHNbaV0sIGkpKTtcbiAgfVxuICByZXR1cm4gcmVzO1xufVxuXG52YXIgb2JqZWN0S2V5cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgdmFyIHJlcyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHJlcy5wdXNoKGtleSk7XG4gIH1cbiAgcmV0dXJuIHJlcztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuZGVjb2RlID0gZXhwb3J0cy5wYXJzZSA9IHJlcXVpcmUoJy4vZGVjb2RlJyk7XG5leHBvcnRzLmVuY29kZSA9IGV4cG9ydHMuc3RyaW5naWZ5ID0gcmVxdWlyZSgnLi9lbmNvZGUnKTtcbiJdfQ==
