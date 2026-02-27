import productModel from "../models/product-model.js";
import catchAsync from "../utils/catchAsync-util.js";
import AppError from "../utils/appError-util.js";
import storeModel from "../models/store-model.js";

// Create a new product (Vendor only)
export const createProduct = catchAsync(async (req, res, next) => {
  //create new product
  const { title, description, price, stock = 0 } = req.body;

  if (!title || !description || !price) {
    next(new AppError("please provide all fields", 400));
  }

  const store = await storeModel.findOne({ ownerId: req.user._id });

  if (req.user.role !== "vendor" || !req.user._id.equals(store.ownerId)) {
    return next(
      new AppError("You are not authorized to create a product", 403),
    );
  }
  const existingProduct = await productModel.findOne({
    title: title,
    storeId: store._id,
  });

  if (existingProduct) {
    return next(
      new AppError(
        "A product with this title already exists in your store",
        400,
      ),
    );
  }

  const newProduct = await productModel.create({
    title,
    description,
    price,
    stock,
    storeId: store._id,
  });

  res.status(201).json({
    status: "success",
    message: "product created successfully",
    data: {
      product: newProduct,
    },
  });
});

//GET VENDOR PRODUCTS
export const getProducts = catchAsync(async (req, res, next) => {
  const store = await storeModel.findOne({ ownerId: req.user._id });

  if (!store) {
    return next(new AppError("Store not found for the vendor", 404));
  }
  const products = await productModel.find({ storeId: store._id });

  if (products.length === 0 || !products) {
    return next(new AppError("No products found for this vendor", 404));
  }
  return res.status(200).json({
    status: "success",
    data: {
      products,
    },
  });
});

//UPDATE PRODUCT
export const updateProduct = catchAsync(async (req, res, next) => {
  const { title, description, price, stock } = req.body;
  const product = await productModel.findById(req.params.id);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  const store = await storeModel.findById(product.storeId);
  if (
    req.user.role !== "vendor" ||
    req.user._id.toString() !== store.ownerId.toString()
  ) {
    return next(
      new AppError("You are not authorized to update this product", 403),
    );
  }
  const updatedProduct = await productModel.findByIdAndUpdate(
    req.params.id,
    { title, description, price, stock },
    { new: true },
  );

  res.status(200).json({
    status: "success",
    message: "product updated successfully",
    data: {
      product: updatedProduct,
    },
  });
});

//DELETE PRODUCT
export const deleteProduct = catchAsync(async (req, res, next) => {
  const product = await productModel.findById(req.params.id);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }
  const store = await storeModel.findById(product.storeId);
  if (
    req.user.role !== "vendor" ||
    req.user._id.toString() !== store.ownerId.toString()
  ) {
    return next(
      new AppError("You are not authorized to delete this product", 403),
    );
  }
  await productModel.findByIdAndDelete(req.params.id);
  res.status(200).json({
    status: "success",
    message: "product deleted successfully",
  });
});

//GET ALL PRODUCTS
export const getAllProducts = catchAsync(async (req, res, next) => {
  // Query filters
  const queryObj = {};

  // text search on title or description
  if (req.query.q) {
    const q = req.query.q;
    queryObj.$or = [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ];
  }

  // price range
  if (req.query.minPrice || req.query.maxPrice) {
    queryObj.price = {};
    if (req.query.minPrice) queryObj.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) queryObj.price.$lte = Number(req.query.maxPrice);
  }

  // store filter
  if (req.query.storeId) queryObj.storeId = req.query.storeId;

  // status (default active)
  queryObj.status = req.query.status || "active";

  let query = productModel.find(queryObj).populate("storeId", "storeName");

  // fields selection
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    query = query.select(fields);
  }

  // sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);

  const products = await query;
  const totalProducts = await productModel.countDocuments(queryObj);

  res.status(200).json({
    status: "success",
    page,
    limit,
    totalProducts,
    results: products.length,
    data: { products },
  });
});

//GET PRODUCT BY ID
export const getProductById = catchAsync(async (req, res, next) => {
  const product = await productModel
    .findById(req.params.id)
    .populate("storeId", "storeName");
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
});



//ADMIN - UPDATE PRODUCT INACTIVE
export const updateProductInactive = catchAsync(async (req, res, next) => {
  const product = await productModel.findById(req.params.id);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }
  if (req.user.role !== "admin" && req.user.role !== "vendor") {
    return next(
      new AppError("You are not authorized to perform this action", 403),
    );
  }

  const updatedProduct = await productModel.findByIdAndUpdate(
    req.params.id,
    { status: "inactive" },
    { new: true },
  );
  res.status(200).json({
    status: "success",
    message: "product marked as inactive",
    data: {
      product: updatedProduct,
    },
  });
});
