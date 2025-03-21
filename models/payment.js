const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.SchemaTypes.ObjectId,
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
  status: {
    type: String,
    enum: ['Pending', 'Success', 'Failed'],
    default: 'Pending'
  },
  reference: {
    type: String,
    require: true
  }
});

const paymentModel = mongoose.model('payments', paymentSchema);

module.exports = paymentModel;