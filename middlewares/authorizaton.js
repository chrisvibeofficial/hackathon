const userModel = require('../models/user');
const jwt = require('jsonwebtoken');


exports.authenticate = async (req, res, next) => {
  try {
    const auth = req.headers.authorizatin;

    if (!auth) {
      return res.status(404).json({
        message: 'Token not passed to headers'
      })
    };

    const token = auth.split(' ')[1];

    if (!token) {
      return res.status(404).json({
        message: 'Token not found'
      })
    }
  } catch (error) {
    console.log(error.message);

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(400).json({
        message: 'Session expired, please login to continue'
      })
    }

    res.status(500).json({
      message: 'Authentication failed'
    })
  }
};