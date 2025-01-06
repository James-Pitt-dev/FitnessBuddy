const Joi = require('joi');

module.exports.userSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().required(),
});

// server side validate db inputs