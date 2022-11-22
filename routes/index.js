var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/', require('./../controllers/index').main);

module.exports = router;
