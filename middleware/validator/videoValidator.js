const { body } = require('express-validator');
const validate = require('./errorBack');

module.exports.videoValidator = validate([
  body('title')
    .notEmpty()
    .withMessage('Title should not be empty')
    .bail()
    .isLength({ max: 20 })
    .withMessage('The number of title characters is limited to 20')
    .bail(),
  body('vodvideoid')
    .notEmpty()
    .withMessage('Vod id should not be empty')
    .bail(),
]);
