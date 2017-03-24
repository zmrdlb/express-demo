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

module.exports = router;
