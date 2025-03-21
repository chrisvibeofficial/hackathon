const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  planName: {
    type: String,
    require: true
  },
  amount: {
    type: Number,
    require: true
  },
  description: {
    type: String,
    require: true
  },
  duration: {
    type: String,
    require: true
  }
});

const planModel = mongoose.model('plans', planSchema);

module.exports = planModel;