const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'users',
    require: true
  },
  planId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'plans',
  },
  userName: {
    type: String,
    require: true
  },
  plan: {
    type: String,
    require: true
  },
  amount: {
    type: String,
    require: true
  },
  duration: {
    type: String,
    require: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Success', 'Failed'],
    default: 'Pending'
  },
  subscriptionDate: {
    type: String,
    require: true,
    default: 'Processing'
  },
  expireDate: {
    type: Number,
    require: true,
    default: 0
  },
  reference: {
    type: String,
    require: true
  }
});

const subscriptionModel = mongoose.model('subscriptions', subscriptionSchema);

module.exports = subscriptionModel;