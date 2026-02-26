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

export const getCart = catchAsync(async (req, res, next) => {
  const cart = await cartModel.findOne({
    customerId: req.user._id,
    status: "active",
  });

  if (!cart) return next(new AppError("Cart not found", 404));

  res.status(200).json({
    status: "success",
    totalItems: cart.items.length,
    message: "Cart fetched successfully",
    data: { cart },
  });
});

//removeItemsFromCart
export const updateCartItems = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return next(new AppError("Quantity must be at least 1", 400));
  }

  const product = await productModel
    .findById({ _id: productId })
    .select("stock");

  if (product.stock < quantity)
    next(
      new AppError(`Out of Stock, only have ${product.stock}stock remaning`),
    );

  const cart = await cartModel.findOne({
    customerId: req.user._id,
    status: "active",
  });

  if (!cart) return next(new AppError("Cart not found with this user", 404));

  const item = cart.items.find((item) => item.productId.equals(productId));

  if (!item) return next(new AppError("Item not found in this cart", 404));

  // ✅ Update quantity
  item.quantity = quantity;

  // ✅ Recalculate subtotal
  item.subtotal = item.price * item.quantity;

  // ✅ Recalculate totals properly
  cart.totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);

  cart.totalAmount = cart.items.reduce((acc, item) => acc + item.subtotal, 0);

  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Item updated successfully",
    data: { cart },
  });
});

export const removeCartItems = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  const cart = await cartModel.findOne({
    customerId: req.user._id,
    status: "active",
  });

  if (!cart) {
    return next(new AppError("Cart not found with this user", 404));
  }

  // Remove item
  cart.items = cart.items.filter((item) => !item.productId.equals(productId));

  // Recalculate totals
  cart.totalItems = 0;
  cart.totalAmount = 0;

  cart.items.forEach((item) => {
    item.subtotal = item.price * item.quantity;
    cart.totalItems += item.quantity;
    cart.totalAmount += item.subtotal;
  });

  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Item removed successfully",
    data: { cart },
  });
});

export const deleteCart = catchAsync(async (req, res, next) => {
  const cart = await cartModel.findOneAndDelete({
    customerId: req.user._id,
    status: "active",
  });

  if (!cart) {
    return next(new AppError("Cart not found with this user", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Cart deleted successfully",
  });
});

export const getAllCarts = catchAsync(async (req, res, next) => {

  const carts = await cartModel.find().select("customerId totalAmount currency");

  if (!carts) next(new AppError(`No any cart found yet`, 404));

  res.status(200).json({
    status: "success",
    totalCarts: carts.length,
    message: "fetched carts successfully",
    data: { carts },
  });
});
export const getSingleCart = catchAsync(async (req, res, next) => {
  const {cartId}=req.params

  const cart = await cartModel.findById(cartId);

  if (!cart) next(new AppError(`No any cart found yet`, 404));

  res.status(200).json({
    status: "success",
    message: "fetched cart successfully",
    data: { cart},
  });
});
