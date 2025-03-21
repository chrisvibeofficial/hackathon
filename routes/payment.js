const { initializePayment } = require('../../controllers/payment');
const { authenticate } = require('../middlewares/authorization');

const router = require('express').Router();

router.get('/initialize/payment/:userId/:planId', authenticate, initializePayment);

module.exports = router;