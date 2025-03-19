const { registerUser, verifyUser, login, forgotPassword, resetPassword } = require('../controllers/user');
const uploads = require('../utils/multer');

const router = require('express').Router();

router.post('/register', uploads.single('profilePic'), registerUser);
router.get('/verify/user/:token', verifyUser);
router.post('/login', login);
router.post('/forgot/password', forgotPassword);
router.post('/reset/password/:token', resetPassword);

module.exports = router;