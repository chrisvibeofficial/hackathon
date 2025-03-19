const joi = require('joi');

exports.validateRegister = (req, res, next) => {
  const schema = joi.object({
    
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      message: error.message
    });

    next();
  }
}