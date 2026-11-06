import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js'; // placeholder, will be created later
import User from '../models/User.js';
import Product from '../models/Product.js';

// @desc Admin dashboard overview (placeholder)
// @route GET /api/v1/admin/dashboard
// @access Private, admin only
export const getDashboard = asyncHandler(async (req, res) => {
  // Simple stats – counts of users, products, orders
  const [userCount, productCount, orderCount] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order ? Order.countDocuments() : Promise.resolve(0),
  ]);
  res.json({ users: userCount, products: productCount, orders: orderCount });
});
