const asyncHandler = require('express-async-handler');
const { generateToken, generateVerificationToken } = require('../utils/generateToken.js');
const User = require('../models/User.js');
const { validationResult } = require('express-validator');
const { sendVerificationEmail } = require('../utils/sendEmail.js');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    username,
    email,
    password,
    emailVerificationToken: generateVerificationToken(),
    emailVerificationExpire: Date.now() + 3600000 // 1 hour
  });

  // disabled for development
  // await sendVerificationEmail(user.email, user.emailVerificationToken);
  
  res.status(201).json({
    _id: user._id,
    username: user.username,
    email: user.email,
    token: generateToken(user._id),
    message: 'Registration successful! Please check your email to verify your account'
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id)
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0), // Set expiration date to past
  });

  res.status(200).json({ message: 'User logged out successfully' });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  user.username = req.body.username || user.username;
  user.email = req.body.email || user.email;
  
  const updatedUser = await user.save();
  res.json({
    _id: updatedUser._id,
    username: updatedUser.username,
    email: updatedUser.email,
    role: updatedUser.role
  });
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
});

// Admin routes
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  await user.deleteOne();
  res.json({ success: true });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  
  const user = await User.findById(req.params.id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.role = role || user.role;
  user.isAdmin = role === 'admin';
  
  const updatedUser = await user.save();
  res.json({
    _id: updatedUser._id,
    username: updatedUser.username,
    email: updatedUser.email,
    role: updatedUser.role,
    isAdmin: updatedUser.isAdmin
  });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpire: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired verification token');
  }

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Email verified successfully! You can now log in'
  });
});

const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.isVerified) {
    res.status(400);
    throw new Error('Email is already verified');
  }

  user.emailVerificationToken = generateVerificationToken();
  user.emailVerificationExpire = Date.now() + 3600000;
  await user.save();

  await sendVerificationEmail(user.email, user.emailVerificationToken);

  res.json({
    success: true,
    message: 'Verification email resent successfully'
  });
});

module.exports = { 
  registerUser, 
  loginUser, 
  getProfile, 
  logoutUser, 
  updateProfile, 
  getAllUsers, 
  deleteUser, 
  updateUserRole,
  verifyEmail, 
  resendVerification 
};