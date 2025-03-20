const nodemailer = require("nodemailer");
const userModel = require('../models/user');
const cloudinary = require('../configs/cloudinary');

exports.mail_sender = (options) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    service: process.env.NODEMAILER_SERVICE,
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: process.env.APP_USERNAME,
      pass: process.env.APP_PASSWORD,
    },
  });

  // async..await is not allowed in global scope, must use a wrapper
  async function main() {
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: `APPLICATION <${process.env.APP_USERNAME}>`, // sender address
      to: options.email, // list of receivers
      subject: options.subject, // Subject line
      html: options.html, // html body
    });
  };

  main().then(() => {
    console.log("Message has been sent to: ", options.email);
    // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
  }).catch(async (error) => {
    console.log(error.message);
    if (error.code === 'EENVELOP') {
      await userModel.findById(options.id);
      await cloudinary.uploader.destroy(options.public_id);
    }
  });
};

