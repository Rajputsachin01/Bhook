const mongoose = require("mongoose");
const ClientSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    pin: {
      type: Number,
      required: true,
      min: 1000,
      max: 9999,
    },
    userName: {
      type: String,
    },
    convenienceFee: {
      type: Number,
    },
    password: {
      type: String,
      required: true,
      default: "",
    },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Client", ClientSchema);
