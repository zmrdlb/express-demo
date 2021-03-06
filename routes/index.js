var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
/* demo页 */
router.get('/demo/:id?', function(req, res, next) {
    res.render('demo', { title: 'demo页', params: req.params || {} });
});
/* layer页 */
router.get('/layer', function(req, res, next) {
    res.render('layer', { title: '系统弹层使用'});
});
/* io fetch 页 */
router.get('/iofetch', function(req, res, next) {
    res.render('iofetch', { title: 'node-io-fetch组件使用'});
});
/* io 页 */
router.get('/io', function(req, res, next) {
    res.render('io', { title: 'io接口调用'});
});
/* storage 页 */
router.get('/storage', function(req, res, next) {
    res.render('storage', { title: 'storage存储'});
});

module.exports = router;
