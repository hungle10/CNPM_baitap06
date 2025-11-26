// const express = require("express");
// const {
//   createUser,
//   handleLogin,
//   getUser,
//   getAccount,
// } = require("../controllers/userController");

// const {
//   forgotPassword,
//   resetPassword,
// } = require("../controllers/auth.controller");

// const auth = require("../middleware/auth");
// const delay = require("../middleware/delay");

// const routerAPI = express.Router();

// // Test route
// routerAPI.get("/", (req, res) => {
//   return res.status(200).json("Hello world api");
// });

// // Register + Login
// routerAPI.post("/register", createUser);
// routerAPI.post("/login", handleLogin);

// // Forgot + Reset password
// routerAPI.post("/forgot-password", forgotPassword);
// routerAPI.post("/check-otp", checkOTP);
// routerAPI.post("/reset-password", resetPassword);

// // Protected routes
// routerAPI.get("/user", auth, getUser);
// routerAPI.get("/account", auth, delay, getAccount);

// module.exports = routerAPI;

const express = require("express");

const {
  createUser,
  handleLogin,
  getUser,
  getAccount,
} = require("../controllers/userController");

const {
  forgotPassword,
  resetPassword,
  checkOTP,
} = require("../controllers/auth.controller");

const {
  getProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
    reindexProducts,
} = require("../controllers/productController");

const auth = require("../middleware/auth");
const delay = require("../middleware/delay");

// Import security middleware
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateCheckOTP,
  validateProductQuery,
} = require("../middleware/validation");

const {
  apiLimiter,
  authLimiter,
  registerLimiter,
  passwordResetLimiter,
  otpLimiter,
} = require("../middleware/rateLimiter");

const { requireAuth, requireAdmin, requireRole } = require("../middleware/authorization");

const routerAPI = express.Router();

// ===========================
// TEST ROUTE
// ===========================
routerAPI.get("/", (req, res) => {
  return res.status(200).json({ EC: 0, EM: "Hello world api" });
});

// ===========================
// AUTH ROUTES
// ===========================

// Register
routerAPI.post(
  "/register",
  registerLimiter,
  validateRegister,
  createUser
);

// Login
routerAPI.post(
  "/login",
  authLimiter,
  validateLogin,
  handleLogin
);

// Forgot password
routerAPI.post(
  "/forgot-password",
  passwordResetLimiter,
  validateForgotPassword,
  forgotPassword
);
// Check OTP
routerAPI.post(
  "/check-otp",
  otpLimiter,
  validateCheckOTP,
  checkOTP
);

// Reset password
routerAPI.post(
  "/reset-password",
  passwordResetLimiter,
  validateResetPassword,
  resetPassword
);

// ===========================
// PROTECTED USER ROUTES
// ===========================

// Get all users (protected)
routerAPI.get("/user", auth, getUser);

// Get current user account (protected)
routerAPI.get("/account", auth, delay, getAccount);

// ===========================
// PRODUCT ROUTES (PUBLIC)
// ===========================

// Get all products with pagination
routerAPI.get(
  "/products",
  validateProductQuery,
  getProducts
);

// Get all categories
routerAPI.get("/products/categories", getCategories);

// Get product by ID
routerAPI.get("/products/:id", getProductById);

// ===========================
// ADMIN ONLY ROUTES
// ===========================

// Create product (admin only)
routerAPI.post(
  "/admin/products",
  auth,
  requireAdmin,
  createProduct
);

// Update product (admin only)
routerAPI.put(
  "/admin/products/:id",
  auth,
  requireAdmin,
  updateProduct
);

// Delete product (admin only)
routerAPI.delete(
  "/admin/products/:id",
  auth,
  requireAdmin,
  deleteProduct
);

// Reindex products (admin only)
routerAPI.post("/admin/products/reindex", auth, requireAdmin, reindexProducts);

module.exports = routerAPI;
