const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    itemName: { type: String, required: true, default: "" },
    itemPrice: { type: Number, required: true, default: 0 },
    image: { type: String, required: true, default: "" },
    description: { type: String, default: "" },
    parcelFeePerPiece: { type: Number, required: true, default: 0 },
    isAvailable: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Item", ItemSchema);
