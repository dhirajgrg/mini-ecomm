import cartModel from "../models/cart-model.js";
import catchAsync from "../utils/catchAsync-util.js";
import productModel from "../models/product-model.js";
import storeModel from "../models/store-model.js";
import AppError from "../utils/appError-util.js";

export const addToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;

  // 1. Basic Validation
  if (!quantity || quantity <= 0) {
    return next(new AppError("Quantity must be at least 1", 400));
  }

  // 2. Fetch Product (Optimized with .select)
  const product = await productModel
    .findById(productId)
    .select("price storeId title stock");

  if (!product) return next(new AppError("Product not found", 404));

  // 3. Fetch Store (Optimized with .select)
  const store = await storeModel.findById(product.storeId).select("ownerId");
  if (!store) return next(new AppError("Store not found", 404));

  // 4. Find Active Cart
  let cart = await cartModel.findOne({
    customerId: req.user._id,
    status: "active",
  });

  // 5. Unified Stock Validation
  // We check the sum of (what is already in cart) + (what is being added)
  const existingItem = cart
    ? cart.items.find((item) => item.productId.equals(productId))
    : null;

  const currentQtyInCart = existingItem ? existingItem.quantity : 0;
  const totalRequestedQty = currentQtyInCart + quantity;

  if (product.stock < totalRequestedQty) {
    return next(
      new AppError(
        `Insufficient stock. Available: ${product.stock}. You already have requested ${totalRequestedQty} quantity  and you have ${currentQtyInCart >= 0 ? currentQtyInCart : "0"} quantity in cart`,
        400,
      ),
    );
  }

  const incomingSubtotal = product.price * quantity;

  // 6. Logic Branch: Create New vs Update Existing
  if (!cart) {
    // Scenario: User has no active cart
    cart = await cartModel.create({
      customerId: req.user._id,
      items: [
        {
          productId: product._id,
          storeId: product.storeId,
          vendorId: store.ownerId,
          title: product.title,
          price: product.price,
          quantity,
          subtotal: incomingSubtotal,
        },
      ],
      totalItems: quantity,
      totalAmount: incomingSubtotal,
    });
  } else {
    // Scenario: User has an existing active cart
    if (existingItem) {
      // Update existing product line item
      existingItem.quantity += quantity;
      existingItem.subtotal = existingItem.quantity * product.price;
    } else {
      // Add a brand new product to the items array
      cart.items.push({
        productId: product._id,
        storeId: product.storeId,
        vendorId: store.ownerId,
        title: product.title,
        price: product.price,
        quantity,
        subtotal: incomingSubtotal,
      });
    }

    // Recalculate Cart Grand Totals
    cart.totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);
    cart.totalAmount = cart.items.reduce((acc, item) => acc + item.subtotal, 0);

    await cart.save();
  }

  // 7. Response
  return res.status(200).json({
    status: "success",
    message: "Item added to cart successfully",
    data: { cart },
  });
});
