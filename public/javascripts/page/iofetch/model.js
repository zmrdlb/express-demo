/**
 * 放到自己项目中，统一定义的io处理层
 *
 * 使用npm包：node-io-fetch实现
 */
const {IoConfig,Io} = require('node-io-fetch');
const extend = require('extend');

/**
 * 设置自己的配置
 */

/**
 * 业务错误条件配置
 * @param  {[type]} result [description]
 * @return {[type]}        [description]
 */
IoConfig.fail.filter = function(result){
    if(result.code != 'A0001'){
        return true; //说明发生了业务错误
    }else{
        return false;
    }
}

/**
 * io请求发送前执行
 * @return {[type]} [description]
 */
IoConfig.ioparams.beforeSend = function(){
    console.log('请求开始');
    // _APP.Loading.show();
}

/**
 * io请求结束后
 */
IoConfig.ioparams.complete = function(){
    console.log('请求结束');
    // _APP.Loading.hide();
}

/**
 * 网络错误或者系统错误
 * @param  {[type]} error [description]
 * @return {[type]}       [description]
 */
IoConfig.ioparams.error = function(error){
    //error或有或无 error.message
    _APP.Toast.show(error.message || '亲，忙不过来了');
}

/**
 * 业务错误处理
 * @param  {[type]} result   [description]
 * @param  {[type]} response [description]
 * @return {[type]}          [description]
 */
IoConfig.ioparams.fail = function(result,response){
    if(result.code == 'A0002'){
        _APP.Toast.show('未登录');
    }else{
        _APP.Toast.show(result.errmsg || '亲，忙不过来了');
    }
}

/**
 * 调用以下方法的时候，opt如ioparams。但是一般只传以下参数就可以了：
 *   data success
 *   以下方法已经统一处理了，如果想覆盖自行传入
 *   beforeSend error fail complete
 */
module.exports = {
    //listdata接口
    listdata(opt){
        Io.request(extend(true,{
            request: {
                method: 'POST'
            },
            url: 'http://127.0.0.1:8000/listdata'
        },opt));
    }
};
