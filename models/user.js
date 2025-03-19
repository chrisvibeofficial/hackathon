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
  address: {
    number: { type: String, require: true },
    name: { type: String, require: true },
    lga: { type: String, require: true },
    state: { type: String, require: true },
  },
  profilePic: {
    public_id: { type: String, require: true },
    image_url: { type: String, require: true }
  },
  isAdmin: {
    type: Boolean,
    require: true,
    default: false
  },
  isVerified: {
    type: Boolean,
    require: true,
    default: false
  },
  isRecommended: {
    type: Boolean,
    require: true,
    default: false
  },
});

const userModel = mongoose.model('users', userSchema);

module.exports = userModel;