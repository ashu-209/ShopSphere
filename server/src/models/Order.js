import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }, // price at purchase time (in paise)
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true }, // in paise
    paymentInfo: {
      razorpayOrderId: { type: String },
      razorpayPaymentId: { type: String },
      razorpaySignature: { type: String },
      status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'cancelled', 'shipped', 'delivered'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
