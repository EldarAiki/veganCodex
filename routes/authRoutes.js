const express =require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  logoutUser
} = require('../controllers/authController.js');
const { protect } = require('../middleware/authMiddleware.js');
const { registerValidation, loginValidation } = require('../middleware/validators/authValidator');

router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);
router.post('/logout', logoutUser);
router.get('/profile', protect, getProfile);

module.exports = router;