const OrderModel = require("../models/orderModel");
const CartModel = require("../models/cartModel");
const ClientModel = require("../models/clientModel");
const Response = require("../utils/responseHelper");
const { isValidObjectId } = require("../utils/validationHelper");
const {
  getPagination,
  paginatedResponse,
} = require("../utils/paginationHelper");

const formatDate = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
};
const createOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { orderType } = req.body;

    if (!orderType || !["Dine-In", "Parcel"].includes(orderType)) {
      return Response.fail(res, "Invalid or missing order type");
    }
    const cart = await CartModel.findOne({ userId, isDeleted: false }).populate(
      {
        path: "items.itemId",
        populate: { path: "categoryId", model: "Category" },
      }
    );
    if (!cart || cart.items.length === 0) {
      return Response.fail(res, "Cart is empty");
    }
    const client = await ClientModel.findOne({ isDeleted: false });
    const convenienceFee = client?.convenienceFee || 0;
    const businessName = client?.businessName || "Unknown";
    let subTotal = 0;
    let parcelFee = 0;
    const orderItems = [];
    cart.items.forEach((entry) => {
      const item = entry.itemId;
      const quantity = entry.quantity;
      const itemPrice = item.itemPrice || 0;
      const fee = item.parcelFeePerPiece || 0;

      subTotal += itemPrice * quantity;
      if (orderType === "Parcel") parcelFee += fee * quantity;

      orderItems.push({
        itemId: item._id,
        name: item.itemName,
        category: item.categoryId?.categoryName || "Uncategorized",
        quantity,
        price: itemPrice,
        parcelFeePerPiece: fee,
        totalItemPrice: itemPrice * quantity,
      });
    });

    const totalPrice = subTotal + parcelFee + convenienceFee;

    const createdAt = new Date();

    const todayStart = new Date(
      createdAt.getFullYear(),
      createdAt.getMonth(),
      createdAt.getDate(),
      0,
      0,
      0,
      0
    );
    const todayEnd = new Date(
      createdAt.getFullYear(),
      createdAt.getMonth(),
      createdAt.getDate(),
      23,
      59,
      59,
      999
    );

    const countBeforeThis = await OrderModel.countDocuments({
      createdAt: { $gte: todayStart, $lte: createdAt },
    });

    const tokenNumber = String(countBeforeThis + 1).padStart(2, "0");

    const formatDate = (date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${yyyy}${mm}${dd}`;
    };
    const orderDate = formatDate(createdAt);
    const orderId = `${tokenNumber}`;
    const order = await OrderModel.create({
      userId,
      cartId: cart._id,
      orderType,
      items: orderItems,
      subTotal,
      parcelFee,
      convenienceFee,
      businessName,
      totalPrice,
      orderId,
      tokenNumber,
      createdAt,
    });

    await CartModel.updateOne(
      { _id: cart._id },
      { $set: { isPurchased: true } }
    );

    return Response.success(res, "Order placed successfully", order);
  } catch (err) {
    return Response.error(res, "Failed to create order", err);
  }
};

const updateOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    if (!isValidObjectId(orderId))
      return Response.fail(res, "Invalid order ID");

    const updatedOrder = await OrderModel.findByIdAndUpdate(orderId, req.body, {
      new: true,
    });
    if (!updatedOrder) return Response.fail(res, "Order not found");

    return Response.success(res, "Order updated successfully", updatedOrder);
  } catch (err) {
    return Response.error(res, "Failed to update order", err);
  }
};

const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    if (!isValidObjectId(orderId))
      return Response.fail(res, "Invalid order ID");

    const order = await OrderModel.findById(orderId);
    if (!order || order.isDeleted) return Response.fail(res, "Order not found");

    order.isDeleted = true;
    await order.save();

    return Response.success(res, "Order deleted successfully");
  } catch (err) {
    return Response.error(res, "Failed to delete order", err);
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { orderStatus } = req.body;

    if (!isValidObjectId(orderId))
      return Response.fail(res, "Invalid order ID");
    if (
      !orderStatus ||
      ![
        "Preparing",
        "Confirm",
        "Ready",
        "Collected",
        "Expired",
        "Rejected",
      ].includes(orderStatus)
    ) {
      return Response.fail(res, "Invalid order status");
    }

    const order = await OrderModel.findById(orderId);
    if (!order) return Response.fail(res, "Order not found");

    order.orderStatus = orderStatus;
    await order.save();

    return Response.success(res, "Order status updated successfully", order);
  } catch (err) {
    return Response.error(res, "Failed to update order status", err);
  }
};

const ListingOrderByStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const { page, limit, skip } = getPagination(req.body);

    if (
      !orderStatus ||
      ![
        "Confirm",
        "Preparing",
        "Ready",
        "Collected",
        "Expired",
        "Rejected",
      ].includes(orderStatus)
    ) {
      return Response.fail(res, "Invalid order status");
    }

    const query = { orderStatus, isDeleted: false };

    const [orders, total] = await Promise.all([
      OrderModel.find(query).skip(skip).limit(limit),
      OrderModel.countDocuments(query),
    ]);

    const result = paginatedResponse(orders, total, page, limit);

    return Response.success(res, "Orders fetched by status", result);
  } catch (err) {
    return Response.error(res, "Failed to list orders", err);
  }
};

const ListingOrderByStatusOfUser = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const { page, limit, skip } = getPagination(req.body);

    // Base query for non-deleted orders
    const query = { isDeleted: false };

    // If valid orderStatus is provided, add it to the query
    if (orderStatus) {
      const validStatuses = [
        "Confirm",
        "Ready",
        "Collected",
        "Expired",
        "Rejected",
      ];
      if (!validStatuses.includes(orderStatus)) {
        return Response.fail(res, "Invalid order status");
      }
      query.orderStatus = orderStatus;
    }

    const [orders, total] = await Promise.all([
      OrderModel.find(query).skip(skip).limit(limit),
      OrderModel.countDocuments(query),
    ]);

    const result = paginatedResponse(orders, total, page, limit);

    return Response.success(res, "Orders fetched", result);
  } catch (err) {
    return Response.error(res, "Failed to list orders", err);
  }
};

const fetchOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const order = await OrderModel.findOne({
      userId,
      isDeleted: false,
      orderStatus: { $in: ["Confirm", "Ready"] },
    }).sort({ createdAt: -1 });

    if (!order) return Response.success(res, "No active order found", null);

    return Response.success(res, "Active order fetched", order);
  } catch (err) {
    return Response.error(res, "Failed to fetch active order", err);
  }
};

const fetchOrderHistory = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.body);

    const query = {
      isDeleted: false,
      orderStatus: { $in: ["Collected", "Expired", "Rejected"] },
    };

    const [orders, total] = await Promise.all([
      OrderModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      OrderModel.countDocuments(query),
    ]);

    const result = paginatedResponse(orders, total, page, limit);

    return Response.success(res, "Order history fetched", result);
  } catch (err) {
    return Response.error(res, "Failed to fetch order history", err);
  }
};

const verifyPinAndGetTotal = async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin) return Response.fail(res, "Pin is required");

    const client = await ClientModel.findOne({ isDeleted: false, pin });
    if (!client) return Response.fail(res, "incorrect pin");

    const result = await OrderModel.aggregate([
      {
        $match: {
          isDeleted: false,
          orderStatus: { $in: ["Collected", "Expired"] },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalPrice" },
        },
      },
    ]);

    const totalAmount = result.length > 0 ? result[0].totalAmount : 0;

    return Response.success(
      res,
      "Pin verified. Total collected/expired order amount.",
      {
        totalAmount,
      }
    );
  } catch (err) {
    return Response.error(res, "Failed to verify pin or calculate total", err);
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return Response.fail(res, "Order ID is required");
    }

    const order = await OrderModel.findOne({ _id: orderId });

    if (!order) {
      return Response.fail(res, "Order not found");
    }

    return Response.success(res, "Order details fetched successfully", order);
  } catch (err) {
    return Response.error(res, "Failed to fetch order details", err);
  }
};

module.exports = {
  createOrder,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
  ListingOrderByStatus,
  fetchOrder,
  fetchOrderHistory,
  verifyPinAndGetTotal,
  getOrderDetails,
  ListingOrderByStatusOfUser,
};
