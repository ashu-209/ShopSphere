import mongoose from 'mongoose';
import { slugify } from '../utils/slugify.js';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String },
    images: [{ type: String }], // URLs (Cloudinary or placeholder)
    price: { type: Number, required: true }, // store as integer (e.g., paise)
    discount: { type: Number, default: 0 }, // percent discount
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
    sku: { type: String, unique: true, required: true },
    stock: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// generate slug from name
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name);
  }
  next();
});

// virtual for discounted price
productSchema.virtual('discountedPrice').get(function () {
  if (!this.discount) return this.price;
  return Math.round(this.price * (1 - this.discount / 100));
});

const Product = mongoose.model('Product', productSchema);
export default Product;
