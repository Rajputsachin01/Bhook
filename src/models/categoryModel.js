const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
      default: "",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("category", CategorySchema);
