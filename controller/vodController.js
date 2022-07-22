const { Video } = require('../model/index');

const RPCClient = require('@alicloud/pop-core').RPCClient;

//remember to set your own key
let accessKeyId, accessKeySecret;

function initVodClient(accessKeyId, accessKeySecret) {
  const regionId = 'cn-shanghai';
  const client = new RPCClient({
    accessKeyId: accessKeyId,
    accessKeySecret: accessKeySecret,
    endpoint: 'http://vod.' + regionId + '.aliyuncs.com',
    apiVersion: '2017-03-21',
  });

  return client;
}

exports.getVod = async (req, res) => {
  const client = initVodClient(accessKeyId, accessKeySecret);

  const vodBack = await client.request(
    'CreateUploadVideo',
    {
      Title: 'this is a sample',
      FileName: 'filename.mp4',
    },
    {}
  );
  res.status(200).json({ vod: vodBack });
};

exports.getVideoLink = async (req, res) => {
  const client = initVodClient(accessKeyId, accessKeySecret);

  const { videoId } = req.params;

  const videoInfo = await Video.findById(videoId);
  if (!videoInfo)
    return res.status(401).json({ msg: 'The video does not exist' });
  const vidId = videoInfo.vodvideoid;
  try {
    const response = await client.request(
      'GetPlayInfo',
      { VideoId: vidId },
      {}
    );
    res.status(200).json({ response });
  } catch (error) {
    console.log(error);
  }
};
