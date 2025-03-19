const { registerUser, verifyUser, login, forgotPassword, resetPassword, getUsers, getUser, changePassword } = require('../controllers/user');
const { authorize, authenticate } = require('../middlewares/authorization');
const uploads = require('../utils/multer');

const router = require('express').Router();

router.post('/register', uploads.single('profilePic'), registerUser);
router.get('/verify/user/:token', verifyUser);
router.post('/login', login);
router.post('/forgot/password', forgotPassword);
router.post('/reset/password/:token', resetPassword);
router.get('/users', authorize, getUsers);
router.get('/user', authenticate, getUser);
router.post('/change/password', authenticate, changePassword);


module.exports = router;