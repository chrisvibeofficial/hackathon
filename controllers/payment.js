const paymentModel = require('../models/payment');
const userModel = require('../models/user');
const planModel = require('../models/plan');
const generator = require('otp-generator');
const ref = generator.generate(15, { lowerCaseAlphabets: true, upperCaseAlphabets: true, specialChars: false });
const paymentSecretKey = process.env.KORAPAY_SECRET_KEY
const axios = require('axios');


exports.initializePayment = async (req, res) => {
  try {
    const { userId } = req.user;
    const { planId } = req.params;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    };

    const plan = await planModel.findById(planId);

    if (!plan) {
      return res.status(404).json({
        message: 'Plan not found'
      })
    };

    const paymentDetails = {
      amount: plan.amount,
      currency: 'NGN',
      reference: ref,
      customer: { email: user.email, name: user.fullname }
    };

    const response = await axios.post('https://api.korapay.com/merchant/api/v1/charges/initialize', paymentDetails, {
      headers: {
        Authorization: `Bearer ${paymentSecretKey}`
      }
    });

    const { data } = response?.data;

    const payment = new paymentModel({
      userId: user._id,
      userName: user.fullname,
      plan: plan.planName,
      amount: `#${plan.amount}`,
      duration: plan.duration,
      reference: data.reference
    });

    await payment.save();

    res.status(200).json({
      message: 'Payment initialized successfully',
      data: {
        reference: data.reference,
        checkout_url: data.checkout_url
      }
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Error initializing payment'
    })
  }
};


exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.query;
    const payment = await paymentModel.findOne({ reference: reference });

    if (!payment) {
      return res.status(404).json({
        message: 'Payment not found'
      })
    };

    const response = await axios.get(`https://api.korapay.com/merchant/api/v1/charges/${reference}`, {
      headers: {
        Authorization: `Bearer ${paymentSecretKey}`
      }
    });

    const { data } = response;

    if (data.status && data.data.status === 'success') {
      payment.status = 'Success'
      await payment.save();

      res.status(200).json({
        message: 'Transaction is successful'
      })
    } else {
      payment.status = 'Failed'
      await payment.save();

      res.status(200).json({
        message: 'Transaction failed'
      })
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Error verifying payment'
    })
  }
};