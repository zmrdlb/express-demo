/**
 * @fileoverview 放到自己的项目中，统一的本地存储配置
 * @version 1.0 | 2017-05-24 版本信息
 * @author Zhang Mingrui | 592044573@qq.com
 * @example
 * */

const Storage = require('libio-storage');

 /**
  * 本地存储对象所属组，命名可自行修改。默认是ZMRDLB
  * @type {String}
  */
 // Storage.groupname = 'myprojectname';

module.exports = {
     listdata: Storage.create({
         maxage: '1D', //保存1天
         key: 'listdata'
     }),
     listdatatwo: Storage.create({
         maxage: '0.1H', //保存0.1小时
         key: 'listdatatwo'
     })
};
