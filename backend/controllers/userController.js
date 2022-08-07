const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const User = require('../models/userModel');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const cloudinary = require('cloudinary');

// register a user
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
    folder: 'avatars',
    width: 150,
    crop: 'scale',
  });

  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });

  sendToken(user, 201, res);
});

exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // checking if user has given both email and password

  if (!email || !password) {
    return next(new ErrorHandler('please enter email and password', 400));
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new ErrorHandler('Invalid Email and Password', 401));
  }

  //   checking if the password matches !?
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler('Invalid Email and Password', 401));
  }

  sendToken(user, 200, res);
});

// lOG OUT USER
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie('token', null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'logged out successfuly',
  });
});

//  Forgot password

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  // Get Reset Password Token

  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/password/reset/${resetToken}`;

  const message = `your reset password token is :- \n\n ${resetPasswordUrl}\n\nIf you have not requested this mail then, pls ignore it`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Ecommerce Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfuly`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message, 500));
  }
});

// Reset Password

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  // creating hash token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler(
        'Reset password token is invalid or has been expired ',
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler('Password does not match ', 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});

// get User Details

exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

// update user Password

exports.updateUserPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler('Old Password is Incorrect', 401));
  }
  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler('password does not match', 401));
  }

  user.password = req.body.newPassword;

  await user.save();

  sendToken(user, 200, res);
});

// Update User Profile
exports.updateUserProfile = catchAsyncErrors(async (req, res, next) => {
  const newuserData = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, newuserData, {
    new: true,
    runValidators: true,
    userFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

// Get all users (admin)
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

// Get user (admin)
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with Id : ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// Update user role  -- Admin
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  console.log(req.params.id);

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    userFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

// Delete User (Admin)
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  // we will remove cloudinary
  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with Id:${req.params.id}`)
    );
  }

  await user.remove();

  res.status(200).json({
    success: true,
    message: 'User deleted successfuly',
  });
});
