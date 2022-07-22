const fs = require('fs');
const { promisify } = require('util');
const lodash = require('lodash');
const { User, Subscribe, Video } = require('../model/index');
const { createToken } = require('../util/jwt');

const rename = promisify(fs.rename);

exports.auth = async (req, res) => {
  const userInfo = req.user.userInfo;
  return res.status(200).json({ userInfo });
};

exports.getChannel = async (req, res) => {
  let { page = 1, num = 10 } = req.query;
  let channelList = await Subscribe.find({
    channel: req.user.userInfo._id,
  })
    .skip((page - 1) * num)
    .limit(num)
    .sort({ createAt: -1 })
    .populate('user');
  channelList = channelList.map((item) => {
    return lodash.pick(item.user, [
      '_id',
      'username',
      'image',
      'subscribeCount',
      'cover',
      'channeldes',
    ]);
  });
  res.status(200).json({ channelList });
};

exports.channelVideoList = async (req, res) => {
  const userId = req.params.userId;
  const videoList = await Video.find({ user: userId });
  res.status(200).json({ videoList });
};

exports.getSubscribe = async (req, res) => {
  let { pageNum = 1, pageSize = 10 } = req.body;
  let subscribeList = await Subscribe.find({
    user: req.params.userId,
  })
    .skip((pageNum - 1) * pageSize)
    .limit(pageSize)
    .sort({ createAt: -1 })
    .populate('channel');
  subscribeList = subscribeList.map((item) => {
    return lodash.pick(item.channel, [
      '_id',
      'username',
      'image',
      'subscribeCount',
      'cover',
      'channeldes',
      'createAt',
    ]);
  });
  res.status(200).json({ subscribeList });
};

exports.getUserChannel = async (req, res) => {
  let isSubscribe = false;
  if (req.user) {
    const recordSubscribe = await Subscribe.findOne({
      user: req.user.userInfo._id,
      channel: req.params.userId,
    });
    if (recordSubscribe) {
      isSubscribe = true;
    }
  }

  const userChannel = await User.findById(req.params.userId);
  res.status(200).json({
    ...lodash.pick(userChannel, [
      '_id',
      'username',
      'image',
      'subscribeCount',
      'cover',
      'channeldes',
      'createAt',
    ]),
    isSubscribe,
  });
};

exports.unsubscribe = async (req, res) => {
  const userId = req.user.userInfo._id;
  const channelId = req.params.userId;
  if (userId === channelId) {
    return res.status(401).json({ err: 'User can not unsubscribe itself' });
  }

  const recordSubscribe = await Subscribe.findOne({
    user: userId,
    channel: channelId,
  });
  if (recordSubscribe) {
    await recordSubscribe.remove();
    const userChannel = await User.findById(channelId);
    userChannel.subscribeCount--;
    await userChannel.save();

    res
      .status(200)
      .json({ msg: `Successfully unsubscribe ${userChannel.username}` });
  } else {
    const channelUser = await User.findById(channelId);
    res.status(401).json({
      err: 'User has not subscribed the channel',
    });
  }
};

exports.subscribe = async (req, res) => {
  const userId = req.user.userInfo._id;
  const channelId = req.params.userId;
  if (userId === channelId) {
    return res.status(401).json({ err: 'User should not subscribe itself' });
  }

  const recordSubscribe = await Subscribe.findOne({
    user: userId,
    channel: channelId,
  });
  if (!recordSubscribe) {
    await new Subscribe({
      user: userId,
      channel: channelId,
    }).save();

    const userChannel = await User.findById(channelId);
    userChannel.subscribeCount++;
    await userChannel.save();

    res
      .status(200)
      .json({ msg: `Successfully unsubscribe ${userChannel.username}` });
  } else {
    res.status(401).json({ err: 'You have subscribed the channel' });
  }
};

exports.register = async (req, res) => {
  const userModel = new User(req.body);
  const dbData = await userModel.save();
  const user = dbData.toJSON();
  delete user.password;
  res.status(201).json({ user });
};

exports.login = async (req, res) => {
  let dbBack = await User.findOne(req.body);
  if (!dbBack) {
    res.status(402).json({ error: 'Email or password wrong' });
  }
  dbBack = dbBack.toJSON();
  dbBack.token = await createToken(dbBack);
  res.status(200).json(dbBack);
};

exports.list = async (req, res) => {
  console.log(req.method);
  res.send('/user-list');
};

exports.update = async (req, res) => {
  const id = req.user.userInfo._id;
  const dbBack = await User.findByIdAndUpdate(id, req.body, { new: true });
  res.status(202).json({ user: dbBack });
};

exports.avatar = async (req, res) => {
  const fileArr = req.file.originalname.split('.');
  const fileType = fileArr[fileArr.length - 1];

  try {
    await rename(
      `./public/${req.file.filename}`,
      `./public/${req.file.filename}.${fileType}`
    );
    res.status(201).json({ filepath: req.file.filename + '.' + fileType });
  } catch (error) {
    res.status(500).json({ err: error });
  }
};

exports.delete = async (req, res) => {
  console.log(req.method);
  res.send('/user-delete');
};
