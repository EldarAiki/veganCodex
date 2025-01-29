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

router.get('/', cache(300), searchProducts);
router.get('/:id', getProductById);
router.post('/', protect,upload.array('images', 3), addProduct);
router.post('/:id/comments', protect, addComment);
router.route('/:id')
  .put(protect, updateProduct)
  .delete(protect, deleteProduct);
router.route('/:productId/comments/:commentId')
  .put(protect, commentAuthorization, updateComment)   
  .delete(protect, commentAuthorization, deleteComment);

module.exports = router;