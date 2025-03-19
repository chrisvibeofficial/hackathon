const userModel = require('../models/user');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;


exports.authenticate = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;

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
    };

    const { userId } = jwt.verify(token, jwtSecret);
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'Authentication failed: User not found'
      })
    };

    req.user = user;
    next();
  } catch (error) {
    console.log(error.message);

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(400).json({
        message: 'Session expired, please login to continue'
      })
    };

    res.status(500).json({
      message: 'Authentication failed'
    })
  }
};


exports.authorize = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;

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
    };

    const { userId } = jwt.verify(token, jwtSecret);
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'Authentication failed: User not found'
      })
    };

    if (user.isAdmin !== true) {
      return res.status(401).json({
        message: 'Authorization failed: Contact admin'
      })
    };

    req.user = user;
    next();
  } catch (error) {
    console.log(error.message);

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(400).json({
        message: 'Session expired, please login to continue'
      })
    };

    res.status(500).json({
      message: 'Authorization failed'
    })
  }
};