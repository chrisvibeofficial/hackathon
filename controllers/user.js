const userModel = require('../models/user');
const bcrypt = require('bcrypt');
const cloudinary = require('../configs/cloudinary');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { verifyMail, reset } = require('../helper/emailTemplate');
const { mail_sender } = require('../middlewares/nodemailer');
const jwtSecret = process.env.JWT_SECRET;


exports.registerUser = async (req, res) => {
  try {
    const { fullname, email, username, phoneNumber, gender, age, password, confirmPassword, address } = req.body;
    const file = req.file;

    if (password !== confirmPassword) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        message: 'Password does not match'
      })
    }

    const checkEmail = await userModel.find({ email: email.toLowerCase() });

    if (checkEmail.length === 1) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        message: `${email.toLowerCase()} has already been used`
      })
    };

    const checkUsername = await userModel.find({ username: username.toLowerCase() });

    if (checkUsername.length === 1) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        message: 'Username already exist'
      })
    };

    const checkPhoneNumber = await userModel.find({ phoneNumber: phoneNumber });

    if (checkPhoneNumber.length === 1) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        message: 'Phone number has already been used'
      })
    };

    const userAddress = address.split(' ');

    const saltedRound = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, saltedRound);

    const profilePicResult = await cloudinary.uploader.upload(file.path)
    fs.unlinkSync(file.path);

    const user = new userModel({
      fullname,
      email,
      username,
      phoneNumber,
      gender,
      age: `${age} years`,
      password: hashedPassword,
      address: {
        number: userAddress[0],
        name: userAddress[1],
        lga: userAddress[2],
        state: userAddress[3]
      },
      profilePic: {
        public_id: profilePicResult.public_id,
        image_url: profilePicResult.secure_url
      }
    });

    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '5mins' });
    const link = `${req.protocol}://${req.get('host')}/v1/verify/user/${token}`;
    const firstName = fullname.split(' ')[0];
    const html = verifyMail(link, firstName);

    const mailDetails = {
      email: user.email,
      subject: 'ACCOUNT VERIFICATION',
      html,
      id: user._id,
      public_id: user.profilePic.public_id
    };

    await mail_sender(mailDetails);
    await user.save();

    res.status(201).json({
      message: 'Account Registered Successfully',
      data: user
    })
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: 'Error registering user'
    })
  }
};


exports.verifyUser = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(404).json({
        message: 'Token not found'
      })
    };

    jwt.verify(token, jwtSecret, async (error, payload) => {
      if (error) {
        if (error instanceof jwt.JsonWebTokenError) {
          const { userId } = jwt.decode(token);
          const user = await userModel.findById(userId);

          if (!user) {
            return res.status(404).json({
              message: 'User not found'
            })
          };

          if (user.isVerified === true) {
            return res.status(400).json({
              message: 'Account has already been verified'
            })
          }

          const newToken = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '5mins' });
          const link = `${req.protocol}://${req.get('host')}/v1/verify/user/${newToken}`;
          const firstName = user.fullname.split(' ')[0];
          const html = verifyMail(link, firstName);

          const mailDetails = {
            email: user.email,
            subject: 'RESEND: ACCOUNT VERIFICATION',
            html
          };

          await mail_sender(mailDetails);

          res.status(200).json({
            message: 'Session has expired, link has been sent to your email address'
          })
        }
      } else {
        const user = await userModel.findById(payload.userId);

        if (!user) {
          return res.status(404).json({
            message: 'User not found'
          })
        };

        if (user.isVerified === true) {
          return res.status(400).json({
            message: 'Account has already been verified'
          })
        };

        user.isVerified = true;
        await user.save();

        res.status(200).json({
          message: 'Account verified successfully'
        })
      }
    })
  } catch (error) {
    console.log(error.message);

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({
        message: 'Session has expired, link has been sent to your email address'
      })
    };

    res.status(500).json({
      message: 'Error verifying user account'
    })
  }
};


exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        message: 'Account not found'
      })
    };

    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '5mins' });
    const link = `${req.protocol}://${req.get('host')}/v1/reset/password/${token}`;
    const firstName = user.fullname.split(' ')[0];
    const html = reset(link, firstName);

    const mailDetails = {
      email: user.email,
      subject: 'RESET PASSWORD',
      html
    };

    await mail_sender(mailDetails);

    res.status(200).json({
      message: 'Reset link has been sent to email address'
    })
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: 'Error forgetting password'
    })
  }
};


exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (!token) {
      return res.status(404).json({
        message: 'Token not found'
      })
    };

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: 'Password does not match'
      })
    };

    const { userId } = jwt.verify(token, jwtSecret);
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'Account not found'
      })
    };

    const saltedRound = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, saltedRound);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: 'Password changed successfully'
    })
  } catch (error) {
    console.log(error.message);

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({
        message: 'Session has expired, re-enter your email address'
      })
    };

    res.status(500).json({
      message: 'Error resetting password'
    })
  }
};


exports.login = async (req, res) => {
  try {
    const { username, email, phoneNumber, password } = req.body;
    let user;

    if (username) {
      user = await userModel.findOne({ username: username.toLowerCase() });

      if (!user) {
        return res.status(404).json({
          message: 'No account found'
        })
      }
    } else if (email) {
      user = await userModel.findOne({ email: email.toLowerCase() });

      if (!user) {
        return res.status(404).json({
          message: 'No account found'
        })
      }
    } else if (phoneNumber) {
      user = await userModel.findOne({ phoneNumber: phoneNumber });

      if (!user) {
        return res.status(404).json({
          message: 'No account found'
        })
      }
    };

    const correctPassword = await bcrypt.compare(password, user.password);

    if (!correctPassword) {
      return res.status(400).json({
        message: 'Incorrect password'
      })
    };

    if (user.isVerified !== true) {
      return res.status(400).json({
        message: 'Your account is not verified'
      })
    };

    if (user.isRestricted === true) {
      return res.status(400).json({
        message: 'Your account is restricted'
      })
    };

    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1day' });
    user.generatedToken.push(token);
    user.isLoggedIn = true;
    await user.save();

    res.status(200).json({
      message: 'Login successfully',
      token
    })
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: 'Error logging user in'
    })
  }
};


exports.logout = async (req, res) => {
  try {
    const auth = req.headers.authorization;

    if (!auth) {
      return res.status(404).json({
        message: 'Token not passed to headers'
      })
    };
    
    const token = auth.split(' ')[1];
    const { userId } = token;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'No account found'
      })
    };

    if (user.isLoggedIn !== true) {
      return res.status(400).json({
        message: 'Account is logged out already'
      })
    };

    if (user.generatedToken.includes(token) && user.isLoggedIn === true) {
      user.isLoggedIn = false
    } else {
      user.isLoggedIn = true
    };

    await user.save();

    res.status(200).json({
      message: 'Logout successfully'
    })
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: 'Error logging user out'
    })
  }
};


exports.getUsers = async (req, res) => {
  try {
    const users = await userModel.find({ isAdmin: false });

    if (users.length < 1) {
      return res.status(404).json({
        message: 'No user found'
      })
    };

    res.status(200).json({
      message: 'All users',
      total: users.length,
      data: users
    })
  } catch (error) {
    console.log(error.message);

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(400).json({
        message: 'Session expired, please login to continue'
      })
    };

    res.status(500).json({
      message: 'Error getting all users'
    })
  }
};


exports.getUser = async (req, res) => {
  try {
    const userId = req.user._id
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'Account not found'
      })
    };

    res.status(200).json({
      message: 'User',
      data: user
    })
  } catch (error) {
    console.log(error.message);

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(400).json({
        message: 'Session expired, please login to continue'
      })
    };

    res.status(500).json({
      message: 'Error getting user'
    })
  }
};


exports.changePassword = async (req, res) => {
  try {
    const userId = req.user._id

    const { password, newPassword, confirmPassword } = req.body;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'Account not found'
      })
    };

    const correctPassword = await bcrypt.compare(password, user.password);

    if (!correctPassword) {
      return res.status(400).json({
        message: 'Incorrect password'
      })
    };

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: 'Password does not match'
      })
    };

    const saltedRound = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, saltedRound);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.log(error.message);

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(400).json({
        message: 'Session expired, please login to continue'
      })
    };

    res.status(500).json({
      message: 'Error changing password'
    })
  }
};


exports.updateProfilePic = async (req, res) => {
  try {
    const userId = req.user._id;
    const file = req.file;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'Account not found'
      })
    };

    const data = {
      profilePic: user.profilePic
    };

    if (file && file.path) {
      await cloudinary.uploader.destroy(user.profilePic.public_id);
      const profilePicresult = await cloudinary.uploader.upload(file.path);
      fs.unlinkSync(file.path);

      data.profilePic = {
        public_id: profilePicresult.public_id,
        image_url: profilePicresult.secure_url
      };

      const updatedProfilePic = await userModel.findByIdAndUpdate(user._id, data, { new: true });

      res.status(200).json({
        message: 'Profile picture updated successfully',
        data: updatedProfilePic
      })
    }
  } catch (error) {
    console.log(error.message);

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(400).json({
        message: 'Session expired, please login to continue'
      })
    };

    res.status(500).json({
      message: 'Error updating profile picture'
    })
  }
};


exports.updateAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { address } = req.body;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'Account not found'
      })
    };

    const userAddress = address.split(' ');


    const data = {
      number: userAddress[0],
      name: userAddress[1],
      lga: userAddress[2],
      state: userAddress[3]
    }

    user.address = data
    await user.save();

    res.status(200).json({
      message: 'Address updated successfully',
      data: updatedAddress
    })
  } catch (error) {
    console.log(error);

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(400).json({
        message: 'Session expired, please login to continue'
      })
    };

    res.status(500).json({
      message: 'Error updating address'
    })
  }
};


exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({
        message: 'User does not exist'
      })
    };

    const deletedUser = await userModel.findByIdAndDelete(user._id);

    if (deletedUser) {
      await cloudinary.uploader.destroy(user.profilePic.public_id);
    };

    res.status(200).json({
      message: 'Account deleted successfully'
    })
  } catch (error) {
    console.log(error.message);

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(400).json({
        message: 'Session expired, please login to continue'
      })
    };

    res.status(500).json({
      message: 'Error deleting account'
    })
  }
};