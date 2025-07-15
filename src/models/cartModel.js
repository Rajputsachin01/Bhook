const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
        quantity: {
          type: Number,
          default: 1,
          min: [1, "Quantity must be at least 1"],
        },
      },
    ],
    isDeleted: { type: Boolean, default: false },
    isPurchased: { type: Boolean, default: false },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Cart", CartSchema);
