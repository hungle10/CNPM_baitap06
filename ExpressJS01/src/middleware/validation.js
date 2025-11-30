const { body, validationResult, query, param } = require("express-validator");

// Middleware xử lý kết quả validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      EC: -1,
      EM: "Validation error",
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

// ===========================
// REGISTER VALIDATION
// ===========================
const validateRegister = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is not valid")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number"),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Confirm password does not match"),
  handleValidationErrors,
];

// ===========================
// LOGIN VALIDATION
// ===========================
const validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is not valid")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  handleValidationErrors,
];

// ===========================
// FORGOT PASSWORD VALIDATION
// ===========================
const validateForgotPassword = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is not valid")
    .normalizeEmail(),
  handleValidationErrors,
];

// ===========================
// RESET PASSWORD VALIDATION
// ===========================
const validateResetPassword = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is not valid")
    .normalizeEmail(),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters")
    .matches(/[A-Z]/)
    .withMessage("New password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("New password must contain at least one number"),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage("Confirm password does not match"),
  handleValidationErrors,
];

// ===========================
// CHECK OTP VALIDATION
// ===========================
const validateCheckOTP = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is not valid")
    .normalizeEmail(),
  body("otp")
    .trim()
    .notEmpty()
    .withMessage("OTP is required")
    .isLength({ min: 4, max: 6 })
    .withMessage("OTP must be between 4 and 6 characters"),
  handleValidationErrors,
];

// ===========================
// PRODUCT QUERY VALIDATION
// ===========================
const validateProductQuery = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100")
    .toInt(),
  query("category")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Category cannot be empty"),
  query("search")
    .optional()
    .trim(),
  query("sortBy")
    .optional()
    .trim()
    .isIn(["name", "price", "rating", "createdAt"])
    .withMessage("Invalid sort field"),
  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be asc or desc"),
  handleValidationErrors,
];

// ===========================
// SEARCH VALIDATION
// ===========================
const validateSearchQuery = [
  query('q').optional().trim(),
  query('category').optional().trim(),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('minPrice must be non-negative').toFloat(),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('maxPrice must be non-negative').toFloat(),
  query('isOnPromotion').optional().isBoolean().withMessage('isOnPromotion must be boolean').toBoolean(),
  query('minViews').optional().isInt({ min: 0 }).withMessage('minViews must be non-negative integer').toInt(),
  query('minRating').optional().isFloat({ min: 0, max: 5 }).withMessage('minRating must be between 0 and 5').toFloat(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('sortBy').optional().isIn(['price','rating','totalReviews','views','createdAt']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc','desc']).withMessage('Sort order must be asc or desc'),
  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateCheckOTP,
  validateProductQuery,
  // ===========================
  // PRODUCT BODY VALIDATION
  // ===========================
  validateCreateProduct: [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("description").optional().trim(),
    body("price").notEmpty().withMessage("Price is required").isFloat({ min: 0 }).withMessage("Price must be a non-negative number"),
    body("category").trim().notEmpty().withMessage("Category is required"),
    body("image").optional().isURL().withMessage("Image must be a valid URL"),
    body("stock").optional().isInt({ min: 0 }).withMessage("Stock must be a non-negative integer").toInt(),
    body("rating").optional().isFloat({ min: 0, max: 5 }).withMessage("Rating must be between 0 and 5").toFloat(),
    body("totalReviews").optional().isInt({ min: 0 }).withMessage("totalReviews must be an integer").toInt(),
    handleValidationErrors,
  ],
  validateUpdateProduct: [
    body("name").optional().trim().notEmpty().withMessage("If provided, name can't be empty"),
    body("description").optional().trim(),
    body("price").optional().isFloat({ min: 0 }).withMessage("Price must be a non-negative number"),
    body("category").optional().trim().notEmpty().withMessage("If provided, category can't be empty"),
    body("image").optional().isURL().withMessage("Image must be a valid URL"),
    body("stock").optional().isInt({ min: 0 }).withMessage("Stock must be a non-negative integer").toInt(),
    body("isActive").optional().isBoolean().withMessage("isActive must be boolean").toBoolean(),
    handleValidationErrors,
  ],
    validateSearchQuery,
  handleValidationErrors,
};
