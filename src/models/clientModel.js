const mongoose = require("mongoose");
const ClientSchema = new mongoose.Schema(
  {
    buisnessName: {
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
    password: {
      type: String,
      required: true,
      default: "",
    },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("client", ClientSchema);
