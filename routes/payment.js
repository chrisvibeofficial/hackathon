const { initializePayment, verifyPayment } = require('../controllers/payment');
const { authenticate } = require('../middlewares/authorization');

const router = require('express').Router();

router.get('/initialize/payment/:planId', authenticate, initializePayment);
router.get('/verify/payment', authenticate, verifyPayment);

module.exports = router;