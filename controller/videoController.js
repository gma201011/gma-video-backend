const {
  Video,
  Videocomment,
  Videolike,
  Subscribe,
  Collect,
} = require('../model/index');

const { hotInc, topHots } = require('../model/redis/redishotsinc');

exports.videoList = async (req, res) => {
  let { page = 1, size = 9 } = req.query;

  const videoList = await Video.find()
    .skip((page - 1) * size)
    .limit(size)
    .sort({ createAt: -1 })
    .populate('user', '_id username cover');
  const videoCount = await Video.countDocuments();
  res.status(200).json({ videoList, videoCount });
};

exports.videoLikeStatus = async (req, res) => {
  const userId = req.user.userInfo._id;
  const videoId = req.params.videoId;
  const likeInfo = await Videolike.findOne({ video: videoId, user: userId });

  if (likeInfo?.like === 1) {
    return res.status(200).json('like');
  } else if (likeInfo?.like === -1) {
    return res.status(200).json('dislike');
  } else {
    return res.status(200).json('none');
  }
};

exports.videoOperation = async (req, res) => {
  const videoOperate = { like: 0, save: false, subscribe: false };
  const userId = req.user.userInfo._id;
  const videoId = req.params.videoId;
  const videoInfo = await Video.findById(videoId);
  const channelId = videoInfo?.user;
  const likeInfo = await Videolike.findOne({ video: videoId, user: userId });
  const saveInfo = await Collect.findOne({ video: videoId, user: userId });
  const subscribeInfo = await Subscribe.findOne({
    channel: channelId,
    user: userId,
  });

  if (likeInfo) videoOperate.like = likeInfo?.like;
  if (saveInfo) videoOperate.save = true;
  if (subscribeInfo) videoOperate.subscribe = true;

  res.status(200).json({ videoOperate });
};

exports.video = async (req, res) => {
  const { videoId } = req.params;
  let videoInfo = await Video.findById(videoId).populate(
    'user',
    '_id username cover subscribeCount'
  );
  if (videoInfo) {
    videoInfo = videoInfo.toJSON();
    videoInfo.isLike = false;
    videoInfo.isDislike = false;
    videoInfo.isSubscribe = false;
  }

  if (req?.user?.userInfo) {
    const userId = req.user.userInfo._id;
    if (await Videolike.findOne({ user: userId, video: videoId, like: 1 })) {
      videoInfo.isLike = true;
    }
    if (await Videolike.findOne({ user: userId, video: videoId, like: -1 })) {
      videoInfo.isDislike = true;
    }
    if (
      await Subscribe.findOne({ user: userId, channel: videoInfo.user._id })
    ) {
      videoInfo.isSubscribe = true;
    }
  }
  await hotInc(videoId, 1);
  res.status(200).json(videoInfo);
};

exports.createVideo = async (req, res) => {
  const body = req.body;
  body.user = req.user.userInfo._id;
  const videoModel = new Video(body);
  try {
    const dbBack = await videoModel.save();
    res.status(201).json({ dbBack });
  } catch (error) {
    res.status(500).json({ err: error });
  }
};

exports.comment = async (req, res) => {
  const { videoId } = req.params;
  const videoInfo = await Video.findById(videoId);
  if (!videoInfo) {
    return res.status(404).json({ err: 'The video does not exist' });
  }
  const comment = await new Videocomment({
    content: req.body.content,
    video: videoId,
    user: req.user.userInfo._id,
  }).save();

  await hotInc(videoId, 3);
  videoInfo.commentCount++;
  await videoInfo.save();
  res.status(201).json(comment);
};

exports.commentList = async (req, res) => {
  const { videoId } = req.params;
  let { page = 1, size = 10 } = req.query;
  const comments = await Videocomment.find({ video: videoId })
    .skip((page - 1) * size)
    .limit(size)
    .sort({ createAt: -1 })
    .populate('user', '_id username image');
  const commentCount = await Videocomment.countDocuments({ video: videoId });
  res.status(200).json({ comments, commentCount });
};

exports.deleteComment = async (req, res) => {
  const { videoId, commentId } = req.params;
  const videoInfo = await Video.findById(videoId);
  const videoComment = await Videocomment.findById(commentId);
  if (!videoInfo)
    return res.status(404).json({ err: 'The video does not exist' });
  if (!videoComment)
    return res.status(404).json({ err: 'The comment does not exist' });

  if (!videoComment.user.equals(req.user.userInfo._id))
    return res
      .status(404)
      .json({ err: 'Permission denied, the user id does not match' });
  await videoComment.remove();

  await hotInc(videoId, -1);
  videoInfo.commentCount--;
  await videoInfo.save();
  res.status(200).json({ msg: 'Successfully delete the comment' });
};

exports.likeVideo = async (req, res) => {
  const userId = req.user.userInfo._id;
  const videoId = req.params.videoId;
  const videoInfo = await Video.findById(videoId);
  if (!videoInfo)
    return res.status(404).json({ err: 'The video does not exist' });

  const doc = await Videolike.findOne({
    user: userId,
    video: videoId,
  });

  let isLike = true;

  if (doc && doc.like === 1) {
    await doc.remove();
    await hotInc(videoId, -7);
    isLike = false;
  } else if (doc && doc.like === -1) {
    doc.like = 1;
    await doc.save();
    await hotInc(videoId, 7);
  } else {
    await new Videolike({
      user: userId,
      video: videoId,
      like: 1,
    }).save();
    await hotInc(videoId, 7);
  }

  videoInfo.likeCount = await Videolike.countDocuments({
    video: videoId,
    like: 1,
  });

  videoInfo.dislikeCount = await Videolike.countDocuments({
    video: videoId,
    like: -1,
  });

  await videoInfo.save();

  res.status(200).json({
    ...videoInfo.toJSON(),
    isLike,
  });
};

exports.dislikeVideo = async (req, res) => {
  const userId = req.user.userInfo._id;
  const videoId = req.params.videoId;
  const videoInfo = await Video.findById(videoId);
  if (!videoInfo)
    return res.status(404).json({ err: 'The video does not exist' });

  const doc = await Videolike.findOne({
    user: userId,
    video: videoId,
  });

  let isDislike = true;

  if (doc && doc.like === -1) {
    isDislike = false;
    await doc.remove();
  } else if (doc && doc.like === 1) {
    doc.like = -1;
    await doc.save();
  } else {
    await new Videolike({
      user: userId,
      video: videoId,
      like: -1,
    }).save();
  }

  videoInfo.likeCount = await Videolike.countDocuments({
    video: videoId,
    like: 1,
  });

  videoInfo.dislikeCount = await Videolike.countDocuments({
    video: videoId,
    like: -1,
  });

  await videoInfo.save();

  res.status(200).json({
    ...videoInfo.toJSON(),
    isDislike,
  });
};

exports.likeList = async (req, res) => {
  let { page = 1, size = 10 } = req.query;
  const likeInfo = await Videolike.find({
    like: 1,
    user: req.user.userInfo._id,
  })
    .skip((page - 1) * size)
    .limit(size)
    .populate('video', '_id title vodvideoId user');

  const likeCount = await Videolike.countDocuments({
    like: 1,
    user: req.user.userInfo._id,
  });
  res.status(200).json({ likeInfo, likeCount });
};

exports.collectList = async (req, res) => {
  let { page = 1, size = 10 } = req.query;
  const collectList = await Collect.find({
    user: req.user.userInfo._id,
  })
    .skip((page - 1) * size)
    .limit(size)
    .populate('video', '_id title vodvideoId user');
  res.status(200).json({ collectList });
};

exports.collect = async (req, res) => {
  const videoId = req.params.videoId;
  const userId = req.user.userInfo._id;
  const video = await Video.findById(videoId);
  if (!video) return res.status(404).json({ err: 'The video does not exist' });

  let collectDoc = await Collect.findOne({
    user: userId,
    video: videoId,
  });

  if (collectDoc) {
    await Collect.deleteOne({ user: userId, video: videoId });
    return res
      .status(201)
      .json({ msg: `The video ${videoId} has been canceled saving` });
  }
  const userCollection = await new Collect({
    user: userId,
    video: videoId,
  }).save();

  if (userCollection) {
    await hotInc(videoId, 10);
  }

  res.status(201).json({ userCollection });
};

exports.hotVideos = async (req, res) => {
  const topNum = req.params.topNum;
  const hotVideos = await topHots(topNum);
  res.status(200).json({ hotVideos });
};
