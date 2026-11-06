import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';

// @desc    Create new product (admin only)
// @route   POST /api/v1/products
// @access  Private (admin)
export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    images = [],
    price,
    discount = 0,
    category,
    brand,
    sku,
    stock = 0,
    active = true,
  } = req.body;
  if (!name || !price || !category || !brand || !sku) {
    res.status(400);
    throw new Error('Missing required fields');
  }
  // Verify referenced IDs exist
  const cat = await Category.findById(category);
  const br = await Brand.findById(brand);
  if (!cat || !br) {
    res.status(400);
    throw new Error('Invalid category or brand reference');
  }
  const product = new Product({
    name,
    description,
    images,
    price,
    discount,
    category,
    brand,
    sku,
    stock,
    active,
  });
  await product.save();
  res.status(201).json(product);
});

// @desc    Get list of products with filters, pagination, sorting
// @route   GET /api/v1/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    sort = 'createdAt',
    order = 'desc',
    search,
    category,
    brand,
    priceMin,
    priceMax,
    ratingMin,
  } = req.query;

  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  if (category) query.category = category;
  if (brand) query.brand = brand;
  if (priceMin || priceMax) {
    query.price = {};
    if (priceMin) query.price.$gte = Number(priceMin);
    if (priceMax) query.price.$lte = Number(priceMax);
  }
  if (ratingMin) query.averageRating = { $gte: Number(ratingMin) };

  const sortObj = {};
  sortObj[sort] = order === 'asc' ? 1 : -1;

  const skip = (page - 1) * limit;
  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('category', 'name slug')
    .populate('brand', 'name slug')
    .sort(sortObj)
    .skip(skip)
    .limit(Number(limit));

  res.json({ total, page: Number(page), limit: Number(limit), data: products });
});

// @desc    Get single product by ID (or slug)
// @route   GET /api/v1/products/:id
// @access  Public
export const getProduct = asyncHandler(async (req, res) => {
  const identifier = req.params.id;
  let product;
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    product = await Product.findById(identifier);
  } else {
    product = await Product.findOne({ slug: identifier });
  }
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  await product.populate('category', 'name slug');
  await product.populate('brand', 'name slug');
  res.json(product);
});

// @desc    Update product (admin only)
// @route   PATCH /api/v1/products/:id
// @access  Private (admin)
export const updateProduct = asyncHandler(async (req, res) => {
  const updates = req.body;
  if (updates.category) {
    const cat = await Category.findById(updates.category);
    if (!cat) {
      res.status(400);
      throw new Error('Invalid category ID');
    }
  }
  if (updates.brand) {
    const br = await Brand.findById(updates.brand);
    if (!br) {
      res.status(400);
      throw new Error('Invalid brand ID');
    }
  }
  const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json(product);
});

// @desc    Delete product (admin only)
// @route   DELETE /api/v1/products/:id
// @access  Private (admin)
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ message: 'Product deleted' });
});
