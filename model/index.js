const mongoose = require('mongoose');
const { mongoPath } = require('../config/config.default');
async function main() {
  await mongoose.connect(mongoPath);
}

main()
  .then((res) => {
    console.log('Successfully connect to mongo');
  })
  .catch((err) => {
    console.log(err);
    console.log('Connect to mongo failed');
  });

module.exports = {
  User: mongoose.model('User', require('./userModel')),
  Video: mongoose.model('Video', require('./videoModel')),
  Videocomment: mongoose.model('Videocomment', require('./videocommentModel')),
  Subscribe: mongoose.model('Subscribe', require('./subscribeModel')),
  Videolike: mongoose.model('Videolike', require('./videolikeModel')),
  Collect: mongoose.model('Collect', require('./collectModel')),
};
