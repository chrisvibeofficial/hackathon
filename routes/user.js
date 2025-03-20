const { registerUser, verifyUser, login, forgotPassword, resetPassword, getUsers, getUser, changePassword, updateProfilePic, updateAddress, deleteUser, logout } = require('../controllers/user');
const { authorize, authenticate } = require('../middlewares/authorization');
const uploads = require('../utils/multer');

const router = require('express').Router();

router.post('/register', uploads.single('profilePic'), registerUser);
router.get('/verify/user/:token', verifyUser);
router.post('/forgot/password', forgotPassword);
router.post('/reset/password/:token', resetPassword);
router.post('/login', login);
router.get('/logout', authenticate, logout);
router.get('/users', authorize, getUsers);
router.get('/user', authenticate, getUser);
router.put('/change/password', authenticate, changePassword);
router.put('/update/profile', authenticate, uploads.single('profilePic'), updateProfilePic);
router.put('/update/address', authenticate, updateAddress);
router.delete('/delete/user/:id', authorize, deleteUser);


module.exports = router;