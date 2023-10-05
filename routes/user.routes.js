const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const express = require("express");
const { UserModel } = require("../models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userRouter = express.Router();

userRouter.get("/", (req, res) => {
  res.send("All the user");
});


userRouter.use(bodyParser.json());

userRouter.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  bcrypt.hash(password, 5, async function (err, hash) {
    if (err) return res.send({ message: "somthing went wrong", status: 0 });
    let user = new UserModel({ name, email, password: hash });
    try {
        await user.save();
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
      auth: {
        user: "bhushanarth456@gmail.com",
        pass: "zxdcioqnieprsywm",
      },
    });
    
    
    // Email data
    const mailOptions = {
    from: 'bhushanarth456@gmail.com',
    to: email,
    subject: 'Thank You for Your Submission',
    text: `Hi ${name},\n\nThank you for your submission !`,
  };
  
  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email: ' + error.message);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
  
  res.status(201).send({
    message: "User created",
    status: 1,
  });
  
} catch (error) {
  res.send({
        message: error.message,
        status: 0,
      });
    }
  });
});

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let option ={
    expiresIn:"3m"
  }

  try {
    let data = await UserModel.find({ email });
    if (data.length > 0) {
      let token = jwt.sign({ userId: data[0]._id }, "arth",option);
      bcrypt.compare(password, data[0].password, function (err, result) {
        if (err)
          return res.send({ message: "Somthing went wrong:" + err, status: 0 });
        if (result) {
          res.send({
            message: "User logged in successfully",
            token: token,
            status: 1,
          });
        } else {
          res.send({
            message: "Incorrect password",
            status: 0,
          });
        }
      });
    } else {
      res.send({
        message: "User does not exist",
        status: 0,
      });
    }
  } catch (error) {
    res.send({
      message: error.message,
      status: 0,
    });
  }
});

module.exports = { userRouter };





