/**
 * @fileoverview 登录页
 * @version 1.0 | 2017-05-27 版本信息
 * @author Zhang Mingrui | 592044573@qq.com
 * @example
 * */
const Model = require('./io/model.js'),
        BaseView = require('core-baseview');

BaseView.register({
    _init: function(){
        var nodes = {
            username: $('#username'),
            password: $('#password'),
            login: $('#login')
        };

        nodes.login.on('click',function(){
            Model.login({
                data: {
                    username: nodes.username.val().trim(),
                    password: nodes.password.val().trim()
                }
            },{
                success: function(data){
                    console.log(data);
                    _APP.Toast.show('登录成功',function(){
                        location.href = '/users';
                    });
                }
            })
        });
    }
});
