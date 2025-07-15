const ItemModel = require("../models/itemModel");
const CategoryModel = require("../models/categoryModel");
const Response = require("../utils/responseHelper");
const { isEmpty, isValidObjectId } = require("../utils/validationHelper");
const { getPagination } = require("../utils/paginationHelper");
const createItem = async (req, res) => {
  try {
    const { categoryId, itemName, itemPrice, image, description, parcelFeePerPiece } = req.body;

    if (!isValidObjectId(categoryId)) return Response.fail(res, "Invalid category ID");

    if (isEmpty(itemName) || isEmpty(itemPrice) || isEmpty(image) || isEmpty(parcelFeePerPiece)) {
      return Response.fail(res, "itemName, itemPrice, image, and parcelFeePerPiece are required");
    }

    const item = await ItemModel.create({
      categoryId,
      itemName,
      itemPrice,
      image,
      description,
      parcelFeePerPiece,
    });

    return Response.success(res, "Item created successfully", item);
  } catch (err) {
    return Response.error(res, "Failed to create item", err);
  }
};
const updateItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    if (!isValidObjectId(itemId)) return Response.fail(res, "Invalid item ID");

    const item = await ItemModel.findByIdAndUpdate(itemId, req.body, { new: true });
    if (!item) return Response.fail(res, "Item not found");

    return Response.success(res, "Item updated successfully", item);
  } catch (err) {
    return Response.error(res, "Failed to update item", err);
  }
};
const deleteItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    if (!isValidObjectId(itemId)) return Response.fail(res, "Invalid item ID");

    const item = await ItemModel.findByIdAndDelete(itemId);
    if (!item) return Response.fail(res, "Item not found");

    return Response.success(res, "Item deleted successfully");
  } catch (err) {
    return Response.error(res, "Failed to delete item", err);
  }
};
const toggleIsPublished = async (req, res) => {
  try {
    const { itemId } = req.body;
    if (!isValidObjectId(itemId)) return Response.fail(res, "Invalid item ID");
    const item = await ItemModel.findById(itemId);
    if (!item) return Response.fail(res, "Item not found");

    item.isPublished = !item.isPublished;
    await item.save();

    return Response.success(res, `Item is now ${item.isPublished ? "Published" : "Unpublished"}`, {
      isPublished: item.isPublished,
    });
  } catch (err) {
    return Response.error(res, "Failed to toggle status", err);
  }
};
//for user side 
const listByCategory = async (req, res) => {
  try {
    const { categoryId } = req.body;
    if (!isValidObjectId(categoryId)) {
      return Response.fail(res, "Invalid category ID");
    }

    const items = await ItemModel.find({
      categoryId,
      isPublished: true,
    });

    return Response.success(res, "Items fetched by category", items);
  } catch (err) {
    return Response.error(res, "Failed to fetch category items", err);
  }
};

//for client side
const listingItems = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.body);
    const allCategories = await CategoryModel.find().lean();
    const items = await ItemModel.find()
      .populate("categoryId")
      .skip(skip)
      .limit(limit);

    const total = await ItemModel.countDocuments();
    const groupedItems = {};
    items.forEach(item => {
      const catId = item.categoryId?._id?.toString();
      if (!groupedItems[catId]) {
        groupedItems[catId] = [];
      }
      groupedItems[catId].push(item);
    });
    const groupedArray = allCategories.map(cat => {
      const catId = cat._id.toString();
      return {
        categoryId: cat._id,
        categoryName: cat.categoryName,
        items: groupedItems[catId] || [],
      };
    });
    const result = {
      categories: groupedArray,
      pagination: {
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    return Response.success(res, "Items listed by category with pagination", result);
  } catch (err) {
    return Response.error(res, "Failed to list items", err);
  }
};
module.exports = {
  createItem,
  updateItem,
  deleteItem,
  toggleIsPublished,
  listByCategory,
  listingItems,
};
