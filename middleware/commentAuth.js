const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

const commentAuthorization = asyncHandler(async (req, res, next) => {
  // 1. Get product and comment
  const product = await Product.findById(req.params.productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // 2. Find comment
  const comment = product.comments.id(req.params.commentId);
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  // 3. Verify ownership
  if (comment.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to modify this comment');
  }

  // 4. Attach to request
  req.product = product;
  req.comment = comment;
  next();
});

module.exports = commentAuthorization;