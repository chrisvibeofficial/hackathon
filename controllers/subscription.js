const subscriptionModel = require('../models/subscription');
const userModel = require('../models/user');
const planModel = require('../models/plan');
const generator = require('otp-generator');
const ref = generator.generate(15, { lowerCaseAlphabets: true, upperCaseAlphabets: true, specialChars: false });
const koraSecretKey = process.env.KORAPAY_SECRET_KEY
const axios = require('axios');


exports.initializeSubscription = async (req, res) => {
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
        Authorization: `Bearer ${koraSecretKey}`
      }
    });

    const { data } = response?.data;

    const subscription = new subscriptionModel({
      userId: user._id,
      planId: plan._id,
      userName: user.fullname,
      plan: plan.planName,
      amount: `#${plan.amount}`,
      duration: plan.duration,
      reference: data.reference
    });

    await subscription.save();

    res.status(200).json({
      message: 'subscription initialized successfully',
      data: {
        reference: data.reference,
        checkout_url: data.checkout_url
      }
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Error initializing subscription'
    })
  }
};


exports.verifySubscription = async (req, res) => {
  try {
    const { reference } = req.query;
    const subscription = await subscriptionModel.findOne({ reference: reference });
    const user = await userModel.findById(subscription.userId);
    const plan = await planModel.findById(subscription.planId);
    const month = parseInt(plan.duration.split(' ')[0]);

    if (!plan) {
      return res.status(404).json({
        message: 'Plan not found'
      })
    };

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    };

    if (!subscription) {
      return res.status(404).json({
        message: 'subscription not found'
      })
    };

    const response = await axios.get(`https://api.korapay.com/merchant/api/v1/charges/${reference}`, {
      headers: {
        Authorization: `Bearer ${koraSecretKey}`
      }
    });

    const { data } = response;

    if (data.status && data.data.status === 'success') {
      subscription.status = 'Success';
      subscription.subscriptionDate = new Date().toLocaleString();
      subscription.expireDate = Date.now() + ((30.44 * 24 * 60 * 60 * 1000) * month),
        await subscription.save();
      user.subscriptionId.push(subscription._id);
      await user.save();

      res.status(200).json({
        message: 'Transaction is successful'
      })
    } else {
      subscription.status = 'Failed'
      await subscription.save();

      res.status(200).json({
        message: 'Transaction failed'
      })
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Error verifying subscription'
    })
  }
};