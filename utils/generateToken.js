const jwt = require( 'jsonwebtoken');
const crypto = require('crypto');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};


const generateVerificationToken = () => {
  return crypto.randomBytes(20).toString('hex');
};

module.exports = { generateToken, generateVerificationToken };