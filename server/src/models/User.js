import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    // Additional optional fields
    phone: { type: String },
    addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address' }],
    status: { type: String, enum: ['active', 'blocked'], default: 'active' },
  },
  { timestamps: true }
);

// Helper method to set password
userSchema.methods.setPassword = async function (plainPassword) {
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(plainPassword, salt);
};

userSchema.methods.validatePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

const User = mongoose.model('User', userSchema);
export default User;
