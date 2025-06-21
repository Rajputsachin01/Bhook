const BannerModel = require("../models/bannerModel");
const Response = require("../utils/responseResponse");
const { isEmpty, isValidObjectId } = require("../utils/validationHelper");
const { getPagination, paginatedResponse } = require("../utils/paginationHelper");

const createBanner = async (req, res) => {
  try {
    const { title, description, fileUrl } = req.body;

    if (isEmpty(title)) return Response.fail(res, "Title field is required");
    if (isEmpty(description)) return Response.fail(res, "Description field is required");
    if (isEmpty(fileUrl)) return Response.fail(res, "File URL is required");

    const bannerCreated = await BannerModel.create({ title, description, fileUrl });

    if (!bannerCreated) return Response.fail(res, "Banner not created");
    return Response.success(res, "Banner created successfully", bannerCreated);
  } catch (error) {
    return Response.error(res, "Internal Server Error", error);
  }
};

const updateBanner = async (req, res) => {
  try {
    const bannerId = req.params.id;
    if (!isValidObjectId(bannerId)) return Response.fail(res, "Invalid banner ID");

    const { title, description, fileUrl } = req.body;

    const isExist = await BannerModel.findById(bannerId);
    if (!isExist) return Response.fail(res, "Banner does not exist");
    if (isExist.isDeleted) return Response.fail(res, "Banner has been deleted");

    const updatedBanner = {};
    if (!isEmpty(title)) updatedBanner.title = title;
    if (!isEmpty(description)) updatedBanner.description = description;
    if (!isEmpty(fileUrl)) updatedBanner.fileUrl = fileUrl;

    const bannerUpdate = await BannerModel.findByIdAndUpdate(bannerId, updatedBanner, { new: true });

    if (!bannerUpdate) return Response.fail(res, "Banner not updated");
    return Response.success(res, "Banner updated successfully", bannerUpdate);
  } catch (error) {
    return Response.error(res, "Internal Server Error", error);
  }
};

const deleteBanner = async (req, res) => {
  try {
    const bannerId = req.params.id;
    if (!isValidObjectId(bannerId)) return Response.fail(res, "Invalid banner ID");

    const isDelete = await BannerModel.findByIdAndDelete(bannerId);
    if (!isDelete) return Response.fail(res, "Banner not deleted");

    return Response.success(res, "Banner deleted successfully");
  } catch (error) {
    return Response.error(res, "Internal Server Error", error);
  }
};

const removeBanner = async (req, res) => {
  try {
    const { bannerId } = req.body;
    if (!isValidObjectId(bannerId)) return Response.fail(res, "Invalid banner ID");

    const isRemoved = await BannerModel.findOneAndUpdate({ _id: bannerId }, { isDeleted: true }, { new: true });

    if (!isRemoved) return Response.fail(res, "Banner not found");
    return Response.success(res, "Banner removed successfully");
  } catch (error) {
    return Response.error(res, "Internal Server Error", error);
  }
};

const listingBanner = async (req, res) => {
  try {
    const { search = "" } = req.body;
    const { page, limit, skip } = getPagination(req.body);

    const query = {
      ...(search && {
        $or: [{ title: { $regex: search, $options: "i" } }],
      }),
    };

    const banners = await BannerModel.find(query).skip(skip).limit(limit);
    const total = await BannerModel.countDocuments(query);

    if (!banners.length) return Response.fail(res, "No banners found for matching the criteria");

    const paginated = paginatedResponse(banners, total, page, limit);
    return Response.success(res, "Banner listing fetched", paginated);
  } catch (error) {
    return Response.error(res, "Internal Server Error", error);
  }
};

const fetchAllBanners = async (req, res) => {
  try {
    const bannerList = await BannerModel.find({ isDeleted: false });
    if (!bannerList.length) return Response.fail(res, "No banners found");

    return Response.success(res, "Banners fetched successfully", bannerList);
  } catch (error) {
    return Response.error(res, "Internal Server Error", error);
  }
};

module.exports = {
  createBanner,
  deleteBanner,
  removeBanner,
  listingBanner,
  updateBanner,
  fetchAllBanners,
};
