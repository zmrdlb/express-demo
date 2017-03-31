const Model = require('./model'),
      BaseView = require('core-baseview');

BaseView.register({
    _init: function(){
        Model.listdata({
             data: {
                 username: 'zmr',
                 sex: '女'
             },
             success: function(list){
                 console.log(list);
             }
         });
    }
});
