import jwt from "jsonwebtoken";

/**
 * Middleware: Verifies the JWT token from the Authorization header.
 * Attaches decoded { id, role } to req.user if valid.
 */
export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "No token provided. Access denied." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret",
    );
    req.user = decoded; // { id, role }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};
