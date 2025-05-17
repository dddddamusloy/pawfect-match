const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'user' },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date }
});

module.exports = mongoose.model("User", userSchema);
