import asyncHandler from 'express-async-handler';
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/authMiddleware.js';

// @desc    Get current user's wishlist
// @route   GET /api/v1/wishlist
// @access  Private
export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user.id }).populate('items.product');
  if (!wishlist) return res.json({ items: [] });
  res.json(wishlist);
});

// @desc    Add product to wishlist
// @route   POST /api/v1/wishlist/items
// @access  Private
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    res.status(400);
    throw new Error('productId required');
  }
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  let wishlist = await Wishlist.findOne({ user: req.user.id });
  if (!wishlist) {
    wishlist = new Wishlist({ user: req.user.id, items: [] });
  }
  const exists = wishlist.items.some((i) => i.product.toString() === productId);
  if (!exists) {
    wishlist.items.push({ product: productId });
    await wishlist.save();
  }
  await wishlist.populate('items.product');
  res.json(wishlist);
});

// @desc    Remove product from wishlist
// @route   DELETE /api/v1/wishlist/items/:productId
// @access  Private
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const wishlist = await Wishlist.findOne({ user: req.user.id });
  if (!wishlist) {
    res.status(404);
    throw new Error('Wishlist not found');
  }
  wishlist.items = wishlist.items.filter((i) => i.product.toString() !== productId);
  await wishlist.save();
  await wishlist.populate('items.product');
  res.json(wishlist);
});
