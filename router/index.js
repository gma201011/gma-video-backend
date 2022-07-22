const express = require('express');
const router = express.Router();

router.use('/video', require('./video'));
router.use('/user', require('./user'));

module.exports = router;
