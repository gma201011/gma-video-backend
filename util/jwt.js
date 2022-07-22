const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { uuid } = require('../config/config.default');
const toJwt = promisify(jwt.sign);
const verify = promisify(jwt.verify);

module.exports.verifyToken = function (required = true) {
  return async (req, res, next) => {
    let token = req.headers.authorization;
    token = token ? token.split('Bearer ')[1] : null;
    if (token) {
      try {
        let userInfo = await verify(token, uuid);
        req.user = userInfo;
        next();
      } catch (error) {
        res.status(402).json({ error: 'Invalid token' });
      }
    } else if (required) {
      return res
        .status(402)
        .json({ error: 'Request must contain authorization' });
    } else {
      next();
    }
  };
};

module.exports.createToken = async (userInfo) => {
  return await toJwt({ userInfo }, uuid, {
    expiresIn: 60 * 60 * 24,
  });
};
