const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please enter product name'],
    trim: true,
  },
  discription: {
    type: String,
    required: [true, 'Please enter product discriptpion'],
  },
  price: {
    type: Number,
    required: [true, 'Please enter product price'],
    maxlength: [8, 'price cannot exceed 10 million'],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  category: {
    type: String,
    required: [true, 'Please enter product category'],
  },
  stock: {
    type: Number,
    required: [true, 'Please enter product stock'],
    maxlength: [5, 'stock cannot exceed 5'],
    default: 1,
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],

  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'user',
    required: true,
  },

  createAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('product', productSchema);
