// ===========================
// AUTHORIZATION MIDDLEWARE
// ===========================

// Check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      EC: -1,
      EM: "Authentication required",
    });
  }
  next();
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      EC: -1,
      EM: "Authentication required",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      EC: -1,
      EM: "Admin access required",
    });
  }
  next();
};

// Check if user has specific role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        EC: -1,
        EM: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        EC: -1,
        EM: `Only users with roles: ${roles.join(", ")} can access this resource`,
      });
    }
    next();
  };
};

// Check if user owns the resource or is admin
const requireOwnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      EC: -1,
      EM: "Authentication required",
    });
  }

  // If admin, allow access
  if (req.user.role === "admin") {
    return next();
  }

  // Check if user ID from params matches current user's ID
  if (req.params.userId && req.params.userId !== req.user.id.toString()) {
    return res.status(403).json({
      EC: -1,
      EM: "You can only access your own resources",
    });
  }

  next();
};

module.exports = {
  requireAuth,
  requireAdmin,
  requireRole,
  requireOwnerOrAdmin,
};
