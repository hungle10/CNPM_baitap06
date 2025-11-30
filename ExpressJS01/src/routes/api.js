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

const auth = require("../middleware/auth");
const delay = require("../middleware/delay");
const { apiLimiter, authLimiter, registerLimiter } = require("../middleware/rateLimiter");
const productController = require("../controllers/productController");
const { requireAdmin } = require("../middleware/authorization");
const {
  validateProductQuery,
  validateCreateProduct,
  validateUpdateProduct,
} = require("../middleware/validation");

const routerAPI = express.Router();

// Apply auth to all /v1/api routes by default. The `auth` middleware
// itself contains a whitelist (register/login/forgot/check-otp/reset-password)
// so these endpoints remain public while everything else requires a token.
// Apply auth to routes. auth middleware contains a whitelist so public
// endpoints remain available.
routerAPI.use(auth);

// Apply a general API rate limiter to all API routes
routerAPI.use(apiLimiter);

routerAPI.get("/", (req, res) => {
  return res.status(200).json("Hello world api");
});

// register & login are handled below with rate limiting

// apply stricter limiters to auth endpoints
routerAPI.post("/login", authLimiter, handleLogin);
routerAPI.post("/register", registerLimiter, createUser);

routerAPI.post("/forgot-password", forgotPassword);
routerAPI.post("/check-otp", checkOTP);
routerAPI.post("/reset-password", resetPassword);

// ===========================
// PRODUCT ROUTES
// ===========================
// Public product routes (client-facing)
const { validateSearchQuery } = require("../middleware/validation");

routerAPI.get("/products/search", validateSearchQuery, productController.searchProducts);
routerAPI.get("/products", validateProductQuery, productController.getProducts);
routerAPI.get("/products/categories", productController.getCategories);
routerAPI.get("/products/:id", productController.getProductById);

// Admin product management
routerAPI.post(
  "/admin/products",
  requireAdmin,
  validateCreateProduct,
  productController.createProduct
);

routerAPI.put(
  "/admin/products/:id",
  requireAdmin,
  validateUpdateProduct,
  productController.updateProduct
);

routerAPI.delete("/admin/products/:id", requireAdmin, productController.deleteProduct);

routerAPI.get("/user", auth, getUser);
routerAPI.get("/account", auth, delay, getAccount);

module.exports = routerAPI;