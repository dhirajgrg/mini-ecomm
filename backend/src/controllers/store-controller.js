//CUSTOM MODULES
import userModel from "../models/user-model.js";
import storeModel from "../models/store-model.js";
import catchAsync from "../utils/catchAsync-util.js";
import AppError from "../utils/appError-util.js";

export const createStore = catchAsync(async (req, res, next) => {
  const { storeName, description, address } = req.body;

  const existingStore = await storeModel.findOne({ ownerId: req.user._id });
  if (existingStore) {
    return next(new AppError("You already have a store", 400));
  }
  const newStore = await storeModel.create({
    ownerId: req.user._id,
    storeName,
    description,
    address,
  });
  res.status(201).json({
    status: "success",
    message: "Store created successfully",
    data: {
      store: newStore,
    },
  });
});

export const getMyStores = catchAsync(async (req, res, next) => {
  const store = await storeModel.find({ ownerId: req.user._id });
  if (!store) next(new AppError(`No store found for this user`, 404));

  res.status(200).json({
    status: "success",
    message: "Store fetched successfully",
    data: {
      store,
    },
  });
});

export const getAllStores = catchAsync(async (req, res, next) => {
  const stores = await storeModel.find().populate("ownerId", "name email");
  if (!stores || stores.length === 0) {
    next(new AppError(`No stores found`, 404));
  }

  res.status(200).json({
    status: "success",
    totalStore:stores.length,
    message: "All stores fetched successfully",
    data: {
      stores,
    },
  });
});
export const approveStore = catchAsync(async (req, res, next) => {
  const store = await storeModel.findById(req.params.id);
  if (!store) next(new AppError(`Store not found with this id`, 404));

  store.isApproved = true;

  await store.save();
  res.status(200).json({
    status: "success",
    message: "Store approved successfully",
    data: {
      store,
    },
  });
});

export const suspendStore = catchAsync(async (req, res, next) => {
    
  const store = await storeModel.findById(req.params.id);
  if (!store) next(new AppError(`Store not found with this id`, 404));

  store.status = "suspended";
  await store.save();

  res.status(200).json({
    status: "success",
    message: "Store suspended successfully",
    data: {
      store,
    },
  });
});
