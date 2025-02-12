const express =require('express');
const router = express.Router();
const {
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
} = require('../controllers/authController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');
const { registerValidation, loginValidation } = require('../middleware/validators/authValidator');

router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);
router.post('/logout', logoutUser); 
router.put('/profile', protect, updateProfile);
router.get('/profile', protect, getProfile);
router.get('/users', protect, admin, getAllUsers);
router.put('/users/:id', protect, admin, updateUserRole);
router.delete('/users/:id', protect, admin, deleteUser);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);

module.exports = router;