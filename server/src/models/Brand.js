import mongoose from 'mongoose';
import { slugify } from '../utils/slugify.js';

const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto‑generate slug before saving
brandSchema.pre('save', function (next) {
  if (!this.isModified('name')) return next();
  this.slug = slugify(this.name);
  next();
});

const Brand = mongoose.model('Brand', brandSchema);
export default Brand;
