const rateLimit = require("express-rate-limit");

// ===========================
// GENERAL API RATE LIMITER
// ===========================
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// ===========================
// STRICT LIMITER FOR AUTH ROUTES
// ===========================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many login attempts, please try again later.",
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

// ===========================
// REGISTER LIMITER
// ===========================
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 registration attempts per hour
  message: "Too many registration attempts, please try again later.",
  skipSuccessfulRequests: true,
});

// ===========================
// PASSWORD RESET LIMITER
// ===========================
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset attempts per hour
  message: "Too many password reset attempts, please try again later.",
});

// ===========================
// OTP CHECK LIMITER
// ===========================
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 OTP attempts per 15 minutes
  message: "Too many OTP attempts, please try again later.",
});

module.exports = {
  apiLimiter,
  authLimiter,
  registerLimiter,
  passwordResetLimiter,
  otpLimiter,
};
