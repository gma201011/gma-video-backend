const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

const validator = require('../middleware/validator/userValidator');
const { verifyToken } = require('../util/jwt');

const multer = require('multer');
const upload = multer({ dest: 'public/' });

router
  .get('/auth', verifyToken(), userController.auth)
  .get('/getchannel', verifyToken(), userController.getChannel)
  .get('/getsubscribe/:userId', userController.getSubscribe)
  .get('/getuser/:userId', verifyToken(false), userController.getUserChannel)
  .get('/channelvideolist/:userId', userController.channelVideoList)
  .get('/unsubscribe/:userId', verifyToken(), userController.unsubscribe)
  .get('/subscribe/:userId', verifyToken(), userController.subscribe)
  .post('/registers', validator.register, userController.register)
  .post('/logins', validator.login, userController.login)
  .get('/lists', verifyToken(), userController.list)
  .put('/', verifyToken(), validator.update, userController.update)
  .post(
    '/avatar',
    verifyToken(),
    upload.single('avatar'),
    userController.avatar
  )
  .delete('/', userController.delete);

module.exports = router;
