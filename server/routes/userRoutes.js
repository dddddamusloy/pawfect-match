const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// ✅ Password validation function
const isPasswordValid = (password) => {
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(password);
};

// ✅ Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    if (!isPasswordValid(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include an uppercase letter, a number, and a special character.",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = email === "admin@mail.com" ? "admin" : "user";

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Login with lockout logic
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials." });

    // 🔐 Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(403).json({
        message: "Account locked. Please try again later.",
      });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      user.loginAttempts += 1;

      // Lock account after 3 failed attempts
      if (user.loginAttempts >= 3) {
        user.lockUntil = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      }

      await user.save();
      const attemptsLeft = 3 - user.loginAttempts;
      return res.status(401).json({
        message:
          attemptsLeft > 0
            ? `${attemptsLeft} attempt(s) left`
            : "Too many attempts. Try again in 1 hour.",
      });
    }

    // ✅ Reset attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get logged-in user info
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("name email role");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Logout
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
