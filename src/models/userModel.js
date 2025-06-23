const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  phoneNo: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    code: { type: String },
    expiresAt: { type: Date },
  },
  otpRequests: [
    {
      requestedAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);
