const CartModel = require("../models/cartModel");
const ItemModel = require("../models/itemModel");
const Response = require("../utils/responseHelper");
const { isEmpty, isValidObjectId } = require("../utils/validationHelper");

const createCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId, quantity = 1 } = req.body;
    if (!isValidObjectId(itemId)) return Response.fail(res, "Invalid item ID");
    if (quantity < 1) return Response.fail(res, "Quantity must be at least 1");
    let cart = await CartModel.findOne({ userId, isDeleted: false });
    if (!cart) {
      cart = await CartModel.create({
        userId,
        items: [{ itemId, quantity }],
      });
    } else {
      const existingItem = cart.items.find(
        (i) => i.itemId.toString() === itemId
      );
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ itemId, quantity });
      }
      await cart.save();
    }
    return Response.success(res, "Cart updated successfully", cart);
  } catch (err) {
    return Response.error(res, "Failed to create/update cart", err);
  }
};

const updateCart = async (req, res) => {
  try {
    const cartId = req.params.id;
    const { itemId, quantity } = req.body;

    if (!isValidObjectId(cartId) || !isValidObjectId(itemId)) {
      return Response.fail(res, "Invalid cart or item ID");
    }

    if (quantity < 1) {
      return Response.fail(res, "Quantity must be at least 1");
    }

    const cart = await CartModel.findOne({ _id: cartId, isDeleted: false });

    if (!cart) return Response.fail(res, "Cart not found");

    const item = cart.items.find((i) => i.itemId.toString() === itemId);

    if (!item) return Response.fail(res, "Item not found in cart");

    item.quantity = quantity;
    await cart.save();

    return Response.success(res, "Cart item updated", cart);
  } catch (err) {
    return Response.error(res, "Failed to update cart item", err);
  }
};

const deleteCart = async (req, res) => {
  try {
    const cartId = req.params.id;

    if (!isValidObjectId(cartId)) return Response.fail(res, "Invalid cart ID");

    const cart = await CartModel.findById(cartId);
    if (!cart || cart.isDeleted) return Response.fail(res, "Cart not found");

    cart.isDeleted = true;
    await cart.save();

    return Response.success(res, "Cart deleted successfully");
  } catch (err) {
    return Response.error(res, "Failed to delete cart", err);
  }
};
const removeItemFromCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId } = req.body;

    if (!isValidObjectId(itemId)) return Response.fail(res, "Invalid item ID");

    const cart = await CartModel.findOne({ userId, isDeleted: false });

    if (!cart) return Response.fail(res, "Cart not found");

    const originalLength = cart.items.length;

    cart.items = cart.items.filter((i) => i.itemId.toString() !== itemId);

    if (cart.items.length === originalLength) {
      return Response.fail(res, "Item not found in cart");
    }

    await cart.save();

    return Response.success(res, "Item removed from cart", cart);
  } catch (err) {
    return Response.error(res, "Failed to remove item from cart", err);
  }
};


// const listingCarts = async (req, res) => {
//   try {
//     const userId = req.userId;

//     const cart = await CartModel.findOne({ userId, isDeleted: false }).populate({
//       path: "items.itemId",
//       populate: {
//         path: "categoryId",
//         model: "Category",
//       },
//     });

//     if (!cart) return Response.success(res, "Cart is empty", []);

//     let cartTotal = 0;
//     let totalItems = 0; 

//     const enrichedItems = cart.items.map((entry) => {
//       const item = entry.itemId;
//       const quantity = entry.quantity;

//       const itemPrice = item?.itemPrice || 0;
//       const itemTotal = itemPrice * quantity;

//       cartTotal += itemTotal;
//       totalItems += quantity; 

//       return {
//         _id: item._id,
//         itemName: item.itemName,
//         itemPrice,
//         quantity,
//         itemTotal,
//         parcelFeePerPiece: item.parcelFeePerPiece,
//         category: item.categoryId?.name || "Uncategorized",
//       };
//     });

//     const finalCart = {
//       cartId: cart._id,
//       items: enrichedItems,
//       cartTotal,
//       totalItems,
//     };

//     return Response.success(res, "Cart fetched with totals", finalCart);
//   } catch (err) {
//     return Response.error(res, "Failed to fetch cart", err);
//   }
// }
const listingCarts = async (req, res) => {
  try {
    const userId = req.userId;

    const cart = await CartModel.findOne({ userId, isDeleted: false }).populate({
      path: "items.itemId",
      populate: {
        path: "categoryId", 
        model: "Category",
      },
    });
    if (!cart) return Response.success(res, "Cart is empty", []);

    let cartTotal = 0;
    let totalItems = 0;
    const enrichedItems = cart.items.map((entry) => {
      const item = entry.itemId; 
      const quantity = entry.quantity;

      const itemPrice = item?.itemPrice || 0;
      const itemTotal = itemPrice * quantity;

      cartTotal += itemTotal;
      totalItems += quantity;
      return {
        _id: item._id,
        itemName: item.itemName,
        itemPrice,
        quantity,
        itemTotal,
        parcelFeePerPiece: item.parcelFeePerPiece,
        category: item.categoryId?.categoryName || "Uncategorized", 
        description: item.description, 
        image: item.image, 
        isPublished: item.isPublished,
      };
    });
    const finalCart = {
      cartId: cart._id,
      items: enrichedItems,
      cartTotal,
      totalItems,
    };

    return Response.success(res, "Cart fetched with totals", finalCart);
  } catch (err) {
    return Response.error(res, "Failed to fetch cart", err);
  }
};





module.exports = {
  createCart,
  updateCart,
  deleteCart,
  removeItemFromCart,
  listingCarts,
};
