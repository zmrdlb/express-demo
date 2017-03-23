var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
/* demo页 */
router.get('/demo/:id?', function(req, res, next) {
    res.render('demo', { title: 'demo页', params: req.params || {} });
})

module.exports = router;
