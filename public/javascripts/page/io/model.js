/**
 * 放到自己项目中，统一定义的io处理层
 *
 * 使用jquery提供的ajax方法和本身封装的io业务层实现
 */
const IoConfig = require('libio-ioconfig'),
      Interio = require('libio-interio');
 /**
  * 统一处理未登录
  */
 IoConfig.login.filter = function(result){
     return result.code == 'A0002';
 };
 IoConfig.login.url = 'http://baidu.com/';


 /**
  * 所有接口的io业务错误统一处理
  */
 IoConfig.fail.filter = function(result) {
     return result.code != 'A0001';
 };
 IoConfig.iocall.fail = function(result){
     _APP.toast.show(result.errmsg || '网络错误');
 };
 IoConfig.iocall.error = function(jqXHR, textStatus, errorThrown){
     _APP.Toast.show(textStatus || '网络错误');
 };

 IoConfig.ioargs.beforeSend = function(){
    //  _APP.Loading.show();
    console.log('请求开始');
 };
 IoConfig.iocall.complete = function(){
    //  _APP.Loading.hide();
    console.log('请求结束');
 }

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
 function buildUrl(url,data,isencode){
     var reg = /\{([a-zA-A]+)\}/g;
     return url.replace(reg, function (all, key) {
         return isencode? encodeURIComponent(data[key]): data[key];
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
 return {
     /**
      * 获取项目文件目录结构
      * urlData: {
      *     id
      * }
      */
     main: function(ioargs,iocall,urlData){
         var _url = buildUrl(basehost+'/tracer/main/trace/{id}',urlData,true);
         Interio.transRequest($.extend({
             url: _url,
             method:'GET'
         },ioargs),iocall);
     },
     /**
      * 列表数据
      */
     listdata: function(ioargs,iocall){
         Interio.transRequest($.extend({
             url: basehost+'/listdata',
             method:'POST'
         },ioargs),iocall);
     },

     //为了测试，一般不要
     $interio: Interio,
     basehost: basehost
 };
