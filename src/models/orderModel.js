const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cartId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
      required: true,
    },
    orderId: {
      type: String,
      unique: true,
    },
    tokenNumber: {
      type: String, 
    },
    orderType: {
      type: String,
      enum: ["Dine-In", "Parcel"],
      required: true,
    },
    orderStatus: {
      type: String,
      enum: ["Preparing","Confirm", "Ready", "Collected", "Expired", "Rejected"],
      default: "Confirm",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    subTotal: {
      type: Number,
    },
    convenienceFee: {
      type: Number,
    },
    businessName: {
      type: String,
    },
    parcelFee: {
      type: Number,
    },
    totalPrice: {
      type: Number,
    },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Order", OrderSchema);
