import asyncHandler from 'express-async-handler';
import Category from '../models/Category.js';

// @desc    Create new category
// @route   POST /api/v1/categories
// @access  Private (admin only – will be protected later)
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, active } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Name is required');
  }
  const category = new Category({ name, description, active });
  await category.save();
  res.status(201).json(category);
});

// @desc    Get all categories (with optional pagination)
// @route   GET /api/v1/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const total = await Category.countDocuments();
  const categories = await Category.find().skip(skip).limit(limit);
  res.json({ total, page, limit, data: categories });
});

// @desc    Get single category by ID
// @route   GET /api/v1/categories/:id
// @access  Public
export const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  res.json(category);
});

// @desc    Update category
// @route   PATCH /api/v1/categories/:id
// @access  Private (admin only)
export const updateCategory = asyncHandler(async (req, res) => {
  const updates = req.body;
  const category = await Category.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  res.json(category);
});

// @desc    Delete category
// @route   DELETE /api/v1/categories/:id
// @access  Private (admin only)
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  res.json({ message: 'Category deleted' });
});
