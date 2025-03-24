const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true }); 

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Local dish', 'street food', 'snack', 'dessert', 'drink'],
    default: 'Local dish'
  },
  description: {
    type: String,
    default: ''
  },
  ingredients: [{
    type: String,
    trim: true
  }],
  country: {
    type: String,
    required: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comments: [commentSchema],
  isVeganForCertain: {
    type: Boolean,
    default: true
  },
  likesCount: {
    type: Number,
    default: 0
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

productSchema.index({ country: 1, category: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);