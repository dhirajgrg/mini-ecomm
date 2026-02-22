import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        store: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Store",
        },
        vendor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        quantity: Number,
        price: Number,
      },
    ],
    totalAmount: Number,
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered"],
      default: "pending",
    },
    shippingAddress: String,
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
