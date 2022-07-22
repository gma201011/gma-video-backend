const express = require('express');
const router = express.Router();
const { verifyToken } = require('../util/jwt');
const { videoValidator } = require('../middleware/validator/videoValidator');
const videoController = require('../controller/videoController');
const vodController = require('../controller/vodController');

router
  .get('/videolist', videoController.videoList)
  .get('/videolike/:videoId', verifyToken(), videoController.videoLikeStatus)
  .get(
    '/videooperation/:videoId',
    verifyToken(),
    videoController.videoOperation
  )
  .get('/video/:videoId', verifyToken(false), videoController.video)
  .get('/getvod', verifyToken(), vodController.getVod)
  .get('/getvideolink/:videoId', vodController.getVideoLink)
  .post(
    '/createvideo',
    verifyToken(),
    videoValidator,
    videoController.createVideo
  )
  .post('/comment/:videoId', verifyToken(), videoController.comment)
  .get('/commentlist/:videoId', videoController.commentList)
  .delete(
    '/comment/:videoId/:commentId',
    verifyToken(),
    videoController.deleteComment
  )
  .get('/like/:videoId', verifyToken(), videoController.likeVideo)
  .get('/dislike/:videoId', verifyToken(), videoController.dislikeVideo)
  .get('/likelist', verifyToken(), videoController.likeList)
  .get('/collect/:videoId', verifyToken(), videoController.collect)
  .get('/collectlist', verifyToken(), videoController.collectList)
  .get('/hotvideos/:topNum', videoController.hotVideos);

module.exports = router;
