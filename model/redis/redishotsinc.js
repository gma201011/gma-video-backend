const { redis } = require('./index');

exports.hotInc = async (videoId, incNum) => {
  const data = await redis.zscore('videohots', videoId);
  let inc;
  if (data) {
    inc = await redis.zincrby('videohots', incNum, videoId);
  } else {
    inc = await redis.zadd('videohots', incNum, videoId);
  }
  return inc;
};

exports.topHots = async (num) => {
  const hotVideos = await redis.zrevrange('videohots', 0, -1, 'withscores');
  const hotVideoOrder = hotVideos.slice(0, num * 2);
  const result = {};
  for (let i = 0; i < hotVideoOrder.length; i++) {
    if (i % 2 === 0) {
      result[hotVideoOrder[i]] = hotVideoOrder[i + 1];
    }
  }
  return result;
};
