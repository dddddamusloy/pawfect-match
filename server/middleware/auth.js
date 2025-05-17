const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ✅ Middleware: Verifies user JWT token from cookies
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.user = decoded; // includes userId and role
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
};

// ✅ Middleware: Checks if user is an admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  verifyToken,
  isAdmin
};
