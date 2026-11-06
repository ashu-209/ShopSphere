import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getCart);
router.post('/items', protect, addToCart);
router.patch('/items/:productId', protect, updateCartItem);
router.delete('/items/:productId', protect, removeCartItem);
router.delete('/', protect, clearCart);

export default router;
