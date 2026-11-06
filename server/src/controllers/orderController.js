import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { adminOnly } from '../middleware/authMiddleware.js';

// Initialize Razorpay instance
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * @desc    Create a new order from user's cart and generate Razorpay order
 * @route   POST /api/v1/orders
 * @access  Private (user)
 */
export const createOrder = asyncHandler(async (req, res) => {
  // Find user's cart
  const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  // Compute total amount (price * qty) in paise
  let total = 0;
  const orderItems = cart.items.map((item) => {
    const price = item.product.price; // stored in paise
    total += price * item.quantity;
    return {
      product: item.product._id,
      quantity: item.quantity,
      price,
    };
  });

  // Create Razorpay order
  const razorpayOrder = await razorpayInstance.orders.create({
    amount: total, // amount in paise
    currency: 'INR',
    receipt: `order_${Date.now()}`,
    payment_capture: 1,
  });

  // Persist order with paymentInfo.status = 'created'
  const order = await Order.create({
    user: req.user.id,
    items: orderItems,
    totalAmount: total,
    paymentInfo: {
      razorpayOrderId: razorpayOrder.id,
      status: 'created',
    },
  });

  // Clear cart after order creation
  await Cart.findOneAndDelete({ user: req.user.id });

  res.status(201).json({ orderId: order._id, razorpayOrderId: razorpayOrder.id, amount: total, currency: 'INR' });
});

/**
 * @desc    Verify Razorpay payment signature and update order status
 * @route   POST /api/v1/orders/verify
 * @access  Private (user)
 */
export const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
  if (!orderId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
    res.status(400);
    throw new Error('Missing payment verification fields');
  }

  // Find order
  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Verify signature
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (generatedSignature !== razorpaySignature) {
    res.status(400);
    throw new Error('Invalid payment signature');
  }

  // Update order payment info and stock reduction
  order.paymentInfo = { razorpayOrderId, razorpayPaymentId, razorpaySignature, status: 'paid' };
  order.status = 'paid';
  await order.save();

  // Decrease stock for each product
  const stockUpdates = order.items.map(async (item) => {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  });
  await Promise.all(stockUpdates);

  res.json({ message: 'Payment verified and order confirmed', order });
});

/**
 * @desc    Get current user's orders
 * @route   GET /api/v1/orders/my
 * @access  Private (user)
 */
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).populate('items.product');
  res.json(orders);
});

/**
 * @desc    Get all orders (admin)
 * @route   GET /api/v1/orders
 * @access  Private, admin only
 */
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate('user items.product');
  res.json(orders);
});
