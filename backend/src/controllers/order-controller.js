//order controller

import orderModel from "../models/order-model.js";
import cartModel from "../models/cart-model.js";
import catchAsync from "../utils/catchAsync-util.js";
import AppError from "../utils/appError-util.js";

//create order
export const createOrder = catchAsync(async (req, res, next) => {
  const { commissionRate } = req.body;

  const rate =
    typeof commissionRate === "number"
      ? commissionRate
      : parseFloat(commissionRate);

  if (isNaN(rate) || rate < 0 || rate > 100) {
    return next(new AppError("Commission rate must be between 0 and 100", 400));
  }

  const cart = await cartModel.findOne({
    customerId: req.user._id,
    status: "active",
  });

  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  const items = [];

  for (const item of cart.items) {
    items.push({
      productId: item.productId,
      storeId: item.storeId,
      vendorId: item.vendorId,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.subtotal,
    });
  }

  const totalItems = items.length;
  const totalAmount = items.reduce((acc, item) => acc + item.subtotal, 0);
  const commissionAmount = (totalAmount * rate) / 100;

  const order = await orderModel.create({
    customerId: req.user._id,
    items,
    totalItems,
    totalAmount,
    commissionRate: rate,
    commissionAmount,
    currency: "USD",
    status: "pending",
  });

  res.status(201).json({
    status: "success",
    message: "Order created successfully",
    data: { order },
  });
});

//get orders for user
export const getOrders = catchAsync(async (req, res, next) => {
  const orders = await orderModel.find({ customerId: req.user._id });

  if (!orders) return next(new AppError("No orders found", 404));
  res.status(200).json({
    status: "success",
    data: { orders },
  });
});

//cancell order if status is pending
export const cancelOrder = catchAsync(async (req, res, next) => {
  const {orderId}=req.params

  const order = await orderModel.findOne({
    _id:orderId,
    status: "pending",
  });
  if (!order) return next(new AppError("Order not found", 404));

if(!req.user._id.equals(order.customerId)){
  return next(new AppError("you are not authorized "))
}

  order.status = "cancelled";
  await order.save();
  res.status(200).json({ status: "success", data: { order } });
});
