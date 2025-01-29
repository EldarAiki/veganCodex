const express = require('express');
const router = express.Router();
const {
  searchProducts,
  getProductById,
  addProduct,
  addComment,
  updateProduct,
  deleteProduct,
  updateComment,
  deleteComment
} = require('../controllers/productController.js');
const { protect } = require('../middleware/authMiddleware.js');
const cache = require('../middleware/cache');
const upload = require('../utils/upload');
const commentAuthorization = require('../middleware/commentAuth');
const { 
  productValidation, 
  commentValidation,
  objectIdValidation
} = require('../middleware/validators/productValidator');

router.get('/', cache(300), searchProducts);
router.get('/:id', objectIdValidation, getProductById);
router.post('/', protect,upload.array('images', 3), productValidation, addProduct);
router.post('/:id/comments', protect, objectIdValidation, commentValidation, addComment);
router.put(
  '/:id',
  protect,
  objectIdValidation,
  productValidation,
  updateProduct
);
router.delete(
  '/:id',
  protect,
  objectIdValidation,
  deleteProduct
);
router.route('/:productId/comments/:commentId')
  .put(protect, commentAuthorization, commentValidation, updateComment)   
  .delete(protect, commentAuthorization, deleteComment);

module.exports = router;