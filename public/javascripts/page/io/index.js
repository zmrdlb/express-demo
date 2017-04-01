const Model = require('./model.js'),
      BaseView = require('core-baseview');

BaseView.register({
  _init: function(){
      /**
       * 普通单个请求
       *      这个配置说明加入全局网络主队列
           * customconfig: {
               queue: true
           }
       */
      Model.listdata({
          data: {'name': 'zmrdlb'}
          // customconfig: {
          //     queue: true
          // }
      },{
          success: function(data){
              console.log(data);
          }
          // fail: function(){
          //     console.log('覆盖统一fail处理');
          // },
          // error: function(){
          //     console.log('覆盖统一error处理');
          // },
          // complete: function(){
          //     console.log('完成');
          // }
      });
      Model.main({
          data: {'name': 'zmrdlb'}
          // customconfig: {
          //     queue: true
          // }
      },{
          error: function(){
              console.log('覆盖统一error处理');
          }
      },{
          id: '1002'
      });


      //单独声明队列，接口按照队列顺序加载
      // Model.$interio.transQueueRequest([{
      //     ioargs: {
      //         url: Model.basehost+'/listdatas',
      //         method:'POST'
      //     },
      //     iocall: {
      //         error: function(){ //此接口本来什么都不返回，所以把默认错误提示覆盖了
      //             console.log('/listdatas error');
      //         }
      //     }
      // },{
      //     ioargs: {
      //         url: Model.basehost+'/listdata',
      //         method:'POST'
      //     },
      //     iocall: {
      //         success: function(data){
      //             console.log(data);
      //         }
      //     }
      // }], {
      //     complete: function(){
      //         console.log('队列全部完成')
      //     }
      // });
  }
});
