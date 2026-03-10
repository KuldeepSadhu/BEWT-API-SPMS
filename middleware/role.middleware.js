/**
 * Middleware: Restricts access to specific roles.
 * Must be used AFTER the `protect` middleware.
 *
 * Usage: router.get("/admin-only", protect, authorize("admin"), handler)
 * @param {...string} roles - Allowed roles e.g. "admin", "faculty", "student"
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Requires one of these roles: ${roles.join(", ")}.`,
      });
    }
    next();
  };
};
