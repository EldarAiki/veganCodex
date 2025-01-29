const express =require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  logoutUser
} = require('../controllers/authController.js');
const { protect } = require('../middleware/authMiddleware.js');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/profile', protect, getProfile);

module.exports = router;