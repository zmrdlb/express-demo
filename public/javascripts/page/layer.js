const BaseView = require('core-baseview');

BaseView.register({
    _init: function(){
        $('#btn-alert-all').on('click',function(){
            _APP.Alert.show({
                title: '系统提示',
                content: '您还未登陆',
                ok: '好的'
            },{
                ok: function(){
                    console.log('点击好的');
                }
            });
        });

        $('#btn-alert-single').on('click',function(){
            _APP.Alert.show({
                content: '您还未登陆'
            });
        });

        $('#btn-confirm-all').on('click',function(){
            _APP.Confirm.show({
                title: '系统提示',
                content: '确定删除此用户？',
                ok: '是的',
                cancel: '考虑一下'
            },{
                ok: function(){
                    console.log('点击是的');
                },
                cancel: function(){
                    console.log('点击考虑一下');
                }
            });
        });

        $('#btn-confirm-single').on('click',function(){
            _APP.Confirm.show({
                content: '确定删除此用户？'
            },{
                ok: function(){
                    console.log('点击确定');
                }
            });
        });

        $('#btn-loading').on('click',function(){
            _APP.Loading.show();
            setTimeout(function(){
                _APP.Loading.hide();
            },3000);
        });

        $('#btn-toast-all').on('click',function(){
            _APP.Toast.show('请先登录',function(){
                console.log('隐藏');
            });
        });

        $('#btn-toast-single').on('click',function(){
            _APP.Toast.show('请先登录');
        });

    }
})
