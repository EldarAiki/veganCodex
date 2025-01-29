const asyncHandler = require('express-async-handler');
const Product =require('../models/Product.js');
const redisClient = require('../config/redis'); 
const { deleteFromCloudinary } = require('../utils/upload');
const { validationResult } = require('express-validator');

// @desc    Search products by location
// @route   GET /api/products
// @access  Public
const searchProducts = asyncHandler(async (req, res) => {
  // Pagination settings
  const DEFAULT_LIMIT = 50;
  const MAX_LIMIT = 200;
  
  // Get query parameters
  const { location, category, page: pageParam, limit: limitParam } = req.query;
  
  // Validate and parse pagination inputs
  const page = Math.max(1, parseInt(pageParam) || 1);
  let limit = parseInt(limitParam) || DEFAULT_LIMIT;
  limit = Math.min(Math.max(limit, 1), MAX_LIMIT); 
  
  // Build query
  const query = {};
  if (location) {
    query.country = { $regex: location, $options: 'i' };
  }
  if (category) {
    query.category = { $regex: `^${category}$`, $options: 'i' };
  }

  // Get paginated results
  const [products, total] = await Promise.all([
    Product.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('addedBy', 'username')
      .populate('comments.user', 'username'),
    Product.countDocuments(query)
  ]);

  // Calculate pagination metadata
  const totalPages = Math.ceil(total / limit);
  const nextPage = page < totalPages ? page + 1 : null;

  res.json({
    success: true,
    count: products.length,
    pagination: {
      total,
      totalPages,
      currentPage: page,
      nextPage,
      limit
    },
    data: products
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('addedBy', 'username')
    .populate('comments.user', 'username');

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Add new product
// @route   POST /api/products
// @access  Private
const addProduct = asyncHandler(async (req, res) => {
  const { name, category, country, description } = req.body;
  const imageUrls = req.files?.map(file => file.path) || [];

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const product = await Product.create({
    name,
    category,
    country,
    description,
    addedBy: req.user._id,
    images: imageUrls
  });

  redisClient.del('vegancodex*', (err) => {
    if (err) console.error('Cache clear error:', err);
  });

  res.status(201).json(product);
});

// @desc    Add comment to product
// @route   POST /api/products/:id/comments
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { text } = req.body;
  
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const comment = {
    user: req.user._id,
    text
  };

  product.comments.push(comment);
  await product.save();

  const patterns = [
    `vegancodex:products*id=${product._id}*`, // Product detail
    `vegancodex:products*country=${product.country}*` // Country listings
  ];
  
  patterns.forEach(pattern => {
    redisClient.del(pattern, (err) => {
      if (err) console.error('Cache clear error:', err);
    });
  });

  res.status(201).json(product);
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Verify ownership
  if (product.addedBy.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this product');
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json(updatedProduct);
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Owner
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (product.addedBy.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this product');
  }

  if (product.images?.length) {
    await Promise.all(
      product.images.map(imageUrl => {
        const publicId = imageUrl.split('/').pop().split('.')[0];
        return deleteFromCloudinary(`vegancodex/${publicId}`);
      })
    );
  }

  await product.deleteOne();

  res.json({ success: true, message: 'Product removed' });
});

// const updateComment = asyncHandler(async (req, res) => {
//   const product = await Product.findById(req.params.productId);
  
//   // Find comment
//   const comment = product.comments.id(req.params.commentId);
  
//   // Authorization check
//   if (comment.user.toString() !== req.user._id.toString()) {
//     res.status(403);
//     throw new Error('Not authorized to edit this comment');
//   }

//   // Update comment text
//   comment.text = req.body.text;
//   await product.save();

//   res.json(comment);
// });

// Delete Comment

const updateComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  
  // Validation
  if (!text || text.trim() === '') {
    res.status(400);
    throw new Error('Comment text is required');
  }

  // Update comment
  req.comment.text = text.trim();
  await req.product.save();

  res.json({
    _id: req.comment._id,
    text: req.comment.text,
    user: req.comment.user,
    createdAt: req.comment.createdAt
  });
});

// const deleteComment = asyncHandler(async (req, res) => {
//   const product = await Product.findById(req.params.productId);
  
//   // Remove comment
//   product.comments.pull(req.params.commentId);
//   await product.save();

//   res.json({ success: true });
// });

const deleteComment = asyncHandler(async (req, res) => {
  // Remove comment
  req.product.comments.pull(req.comment._id);
  await req.product.save();

  res.json({ 
    success: true, 
    message: 'Comment deleted successfully' 
  });
});

module.exports = { searchProducts, getProductById,
   addProduct, addComment, updateProduct, deleteProduct, updateComment, deleteComment };