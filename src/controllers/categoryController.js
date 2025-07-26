const CategoryModel = require("../models/categoryModel");
const Response = require("../utils/responseHelper");
const { isEmpty, isValidObjectId } = require("../utils/validationHelper");
const { getPagination, paginatedResponse } = require("../utils/paginationHelper");

const createCategory = async (req, res) => {
  try {
    const { categoryName } = req.body;

    if (isEmpty(categoryName)) return Response.fail(res, "categoryName field is required");

    const categoryCreated = await CategoryModel.create({ categoryName });

    if (!categoryCreated) return Response.fail(res, "category not created");
    return Response.success(res, "category created successfully", categoryCreated);
  } catch (error) {
    console.log(error);
    return Response.error(res, "Internal Server Error", error);
  }
};

const updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    if (!isValidObjectId(categoryId)) return Response.fail(res, "Invalid category ID");

    const { categoryName } = req.body;

    const isExist = await CategoryModel.findById(categoryId);
    if (!isExist) return Response.fail(res, "Category does not exist");
    if (isExist.isDeleted) return Response.fail(res, "Category has been deleted");

    const updatedCategory = {};
    if (!isEmpty(categoryName)) updatedCategory.categoryName = categoryName;
    const categoryUpdate = await CategoryModel.findByIdAndUpdate(categoryId, updatedCategory, { new: true });

    if (!categoryUpdate) return Response.fail(res, "Category not updated");
    return Response.success(res, "Category updated successfully", categoryUpdate);
  } catch (error) {
    return Response.error(res, "Internal Server Error", error);
  }
};

const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    if (!isValidObjectId(categoryId)) return Response.fail(res, "Invalid Category ID");
    const isDelete = await CategoryModel.findByIdAndDelete(categoryId);
    if (!isDelete) return Response.fail(res, "Category not deleted");
    return Response.success(res, "Category deleted successfully");
  } catch (error) {
    return Response.error(res, "Internal Server Error", error);
  }
};

const listCategories = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.body);
    const categories = await CategoryModel.find().sort({ _id: -1 }).skip(skip).limit(limit);
    const total = await CategoryModel.countDocuments();
    if (!categories.length) return Response.fail(res, "No categories found for matching the criteria");
    const paginated = paginatedResponse(categories, total, page, limit);
    return Response.success(res, "Category listing fetched", paginated);
  } catch (error) {
    return Response.error(res, "Internal Server Error", error);
  }
};


module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  listCategories,
};
