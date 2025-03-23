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

    const decodedToken = jwt.verify(token, jwtSecret);
    const { userId } = decodedToken;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'Authentication failed: User not found'
      })
    };

    if (user.isLoggedIn !== decodedToken.isLoggedIn) {
      return res.status(401).json({
        message: 'Authentication failed: User is not logged in'
      })
    };

    req.user = decodedToken;
    next();
  } catch (error) {
    console.log(error.message);

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({
        message: 'Session expired, please login to continue'
      })
    };

    res.status(500).json({
      message: 'Error authenticating user'
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

    const decodedToken = jwt.verify(token, jwtSecret);
    const { userId } = decodedToken;
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

    if (user.isLoggedIn !== decodedToken.isLoggedIn) {
      return res.status(401).json({
        message: 'Authentication failed: User is not logged in'
      })
    };

    req.user = decodedToken;
    next();
  } catch (error) {
    console.log(error.message);

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({
        message: 'Session expired, please login to continue'
      })
    };

    res.status(500).json({
      message: 'Error authorizating user'
    })
  }
};