import asyncHandler from 'express-async-handler';
import Brand from '../models/Brand.js';

// @desc    Create new brand
// @route   POST /api/v1/brands
// @access  Private (admin)
export const createBrand = asyncHandler(async (req, res) => {
  const { name, description, active } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Name is required');
  }
  const brand = new Brand({ name, description, active });
  await brand.save();
  res.status(201).json(brand);
});

// @desc    Get all brands
// @route   GET /api/v1/brands
// @access  Public
export const getBrands = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const total = await Brand.countDocuments();
  const brands = await Brand.find().skip(skip).limit(limit);
  res.json({ total, page, limit, data: brands });
});

// @desc    Get single brand by ID
// @route   GET /api/v1/brands/:id
// @access  Public
export const getBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    res.status(404);
    throw new Error('Brand not found');
  }
  res.json(brand);
});

// @desc    Update brand
// @route   PATCH /api/v1/brands/:id
// @access  Private (admin)
export const updateBrand = asyncHandler(async (req, res) => {
  const updates = req.body;
  const brand = await Brand.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!brand) {
    res.status(404);
    throw new Error('Brand not found');
  }
  res.json(brand);
});

// @desc    Delete brand
// @route   DELETE /api/v1/brands/:id
// @access  Private (admin)
export const deleteBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findByIdAndDelete(req.params.id);
  if (!brand) {
    res.status(404);
    throw new Error('Brand not found');
  }
  res.json({ message: 'Brand deleted' });
});
