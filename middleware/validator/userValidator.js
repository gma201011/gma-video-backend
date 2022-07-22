const { body } = require('express-validator');
const validate = require('./errorBack');
const { User } = require('../../model/index');

module.exports.register = validate([
  body('username')
    .notEmpty()
    .withMessage('Username should not be empty')
    .bail()
    .isLength({ min: 3 })
    .withMessage('Username must contain at least 3 characters')
    .bail(),
  body('password')
    .notEmpty()
    .withMessage('Password should not be empty')
    .bail()
    .isLength({ min: 5 })
    .withMessage('Username must contain at least 5 characters')
    .bail(),
  body('email')
    .notEmpty()
    .withMessage('Email should not be empty')
    .bail()
    .isEmail()
    .withMessage('The e-mail address had an incorrect format')
    .bail()
    .custom(async (val) => {
      const emailValidate = await User.findOne({ email: val });
      if (emailValidate) {
        return Promise.reject('Email address is already registered');
      }
    })
    .bail(),
  body('phone')
    .notEmpty()
    .withMessage('Phone number should not be empty')
    .bail()
    .custom(async (val) => {
      const phoneValidate = await User.findOne({ phone: val });
      if (phoneValidate) {
        return Promise.reject('Phone number is already registered');
      }
    })
    .bail(),
]);

module.exports.login = validate([
  body('email')
    .notEmpty()
    .withMessage('Email should not be empty')
    .bail()
    .isEmail()
    .withMessage('The e-mail address had an incorrect format')
    .bail()
    .custom(async (val) => {
      const hasEmail = await User.findOne({ email: val });
      if (!hasEmail) {
        return Promise.reject('This email has not registered');
      }
    })
    .bail(),
  body('password')
    .notEmpty()
    .withMessage('Password should not be empty')
    .bail(),
]);

module.exports.update = validate([
  body('email')
    .custom(async (val) => {
      const emailValidate = await User.findOne({ email: val });
      if (emailValidate) {
        return Promise.reject('Email address is already registered');
      }
    })
    .bail(),
  body('username')
    .custom(async (val) => {
      const usernameValidate = await User.findOne({ username: val });
      if (usernameValidate) {
        return Promise.reject('Username is already registered');
      }
    })
    .bail(),
  body('phone')
    .custom(async (val) => {
      const phoneValidate = await User.findOne({ phone: val });
      if (phoneValidate) {
        return Promise.reject('The phone number is already registered');
      }
    })
    .bail(),
]);
