const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    require: true
  },
  email: {
    type: String,
    require: true,
    lowercase: true
  },
  username: {
    type: String,
    require: true,
    lowercase: true
  },
  gender: {
    type: String,
    require: true,
    enum: ['Male', 'Female']
  },
  age: {
    type: String,
    require: true,
  },
  phoneNumber: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  profilePic: {
    public_id: { type: String },
    image_url: { type: String }
  },
  isLoggedIn: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isRecommended: {
    type: Boolean,
    default: false
  },
  isRestricted: {
    type: Boolean,
    default: false
  },
  subscriptionId: [{
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'subscriptions'
  }]
});

const userModel = mongoose.model('users', userSchema);

module.exports = userModel;