import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        storeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Store",
          required: true,
        },
        vendorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        // Snapshot fields (important for ecommerce)
        title: {
          type: String,
          required: true,
        },
        // image: String,

        price: {
          type: Number,
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },

        subtotal: {
          type: Number,
          required: true,
        },
      },
    ],

    totalItems: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      default: 0,
    },

    currency: {
      type: String,
      default: "USD",
    },

    status: {
      type: String,
      enum: ["active", "ordered"],
      default: "active",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Cart", cartSchema);
