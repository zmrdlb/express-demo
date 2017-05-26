/**
 * @fileoverview storage存储使用演示
 * @version 1.0 | 2017-05-26 版本信息
 * @author Zhang Mingrui | 592044573@qq.com
 * @example
 * */
const Storage = require('libio-storage'),
        BaseView = require('core-baseview');

BaseView.register({
    _init: function(){

        var nodes = {
            keyname: $('#keyname'),
            outdate: $('#outdate'),
            mydata: $('#mydata')
        }

        var _storageMap = {};

        function create(){
            var keyname = nodes.keyname.val().trim();
            if(_storageMap[keyname]){
                _APP.Toast.show(keyname+'键值的数据存储对象已经创建');
            }else{
                _storageMap[keyname] = Storage.create({
                    maxage: nodes.outdate.val().trim(),
                    key: keyname
                });
                _APP.Toast.show(keyname+'键值的数据存储对象创建成功');
            }
        }

        function warn(){
            console.log('请在开发人员工具中查看localStorage的存储数据情况');
        }

        $('#createStorage').on('click',function(){
            create();
        });

        $('#setStorage').on('click',function(){
            var keyname = nodes.keyname.val().trim();
            var value = JSON.parse(nodes.mydata.val().trim());
            _storageMap[keyname].set(value);
            console.warn('可以尝试在过期时间后，尝试获取当前数据项，查看返回结果');
            warn();
        });

        $('#getStorage').on('click',function(){
            console.log('获取存储的数据');
            var keyname = nodes.keyname.val().trim();
            var data = _storageMap[keyname].get();
            console.log(data);
            if(data == null){
                console.warn('数据已过期');
                warn();
            }
        });

        $('#removeStorage').on('click',function(){
            var keyname = nodes.keyname.val().trim();
            _storageMap[keyname].remove();
            warn();
        });

        $('#clearStorage').on('click',function(){
            Storage.clear();
            warn();
        });

    }
});
