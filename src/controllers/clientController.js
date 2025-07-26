const ClientModel = require("../models/clientModel");
const bcrypt = require("bcrypt");
const { signInToken } = require("../utils/auth");
const Response = require("../utils/responseHelper");
const {
  isEmpty,
  isValidPhone,
  isValidObjectId,
} = require("../utils/validationHelper");

// REGISTER CLIENT
const registerClient = async (req, res) => {
  try {
    const { businessName, password, pin, userName, convenienceFee } =
      req.body;

    if (
      isEmpty(businessName) ||
      isEmpty(password) ||
      isEmpty(pin) ||
      isEmpty(userName)    ) {
      return Response.fail(
        res,
        "buisnessName, password ,userName  and pin are required"
      );
    }

    if (pin < 1000 || pin > 9999) {
      return Response.fail(res, "PIN must be a 4-digit number");
    }

    const existingClient = await ClientModel.findOne({ userName });
    if (existingClient) {
      return Response.fail(res, "Client with this username already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newClient = new ClientModel({
      businessName,
      password: hashedPassword,
      pin,
      userName,
      convenienceFee,
    });

    await newClient.save();

    return Response.success(res, "Client registered successfully", {
      id: newClient._id,
      businessName: newClient.businessName,
      isActive: newClient.isActive,
      userName: newClient.userName,
      convenienceFee: newClient.convenienceFee,
    });
  } catch (err) {
    return Response.error(res, "Failed to register client", err);
  }
};

// LOGIN CLIENT
const loginClient = async (req, res) => {
  try {
    const {  userName, password } = req.body;

    if (isEmpty(password)) {
      return Response.fail(res, "Password is required");
    }

    if (isEmpty(userName)) {
      return Response.fail(res, "userName is required");
    }

    const query = {
      isDeleted: false,
      $or: [],
    };

    if (!isEmpty(userName)) {
      query.$or.push({ userName });
    }
    if (query.$or.length === 0) {
      return Response.fail(res, "Invalid login input");
    }

    const client = await ClientModel.findOne(query);

    if (!client) return Response.fail(res, "Invalid credentials");

    const isMatch = await bcrypt.compare(password, client.password);
    if (!isMatch) return Response.fail(res, "incorrect password");

    const token = signInToken(client._id, "client");

    return Response.success(res, "Client logged in successfully", {
      token,
      client: {
        id: client._id,
        businessName: client.businessName,
        userName: client.userName,
        convenienceFee: client.convenienceFee,
        isActive: client.isActive,
      },
    });
  } catch (err) {
    return Response.error(res, "Login failed", err);
  }
};

// TOGGLE IS ACTIVE
const toggleIsActive = async (req, res) => {
  try {
    const clientId = req.userId;

    const client = await ClientModel.findById(clientId);

    if (!client || client.isDeleted) {
      return Response.fail(res, "Client not found or deleted");
    }

    client.isActive = !client.isActive;
    await client.save();

    return Response.success(
      res,
      `Client is now ${client.isActive ? "active" : "inactive"}`,
      {
        isActive: client.isActive,
      }
    );
  } catch (err) {
    return Response.error(res, "Failed to toggle status", err);
  }
};
const updateConvenienceFee = async (req, res) => {
  try {
    const clientId = req.userId;
    const { convenienceFee } = req.body;

    if (isEmpty(clientId) || !isValidObjectId(clientId)) {
      return Response.fail(res, "Valid clientId is required");
    }

    if (isEmpty(convenienceFee) && convenienceFee !== 0) {
      return Response.fail(res, "Convenience fee is required");
    }

    if (typeof convenienceFee !== "number" || convenienceFee < 0) {
      return Response.fail(
        res,
        "Convenience fee must be a non-negative number"
      );
    }
    const client = await ClientModel.findOne({
      _id: clientId,
      isDeleted: false,
    });
    if (!client) {
      return Response.fail(res, "Client not found");
    }
    client.convenienceFee = convenienceFee;
    await client.save();

    return Response.success(res, "Convenience fee updated successfully", {
      id: client._id,
      businessName: client.businessName,
      userName: client.userName,
      convenienceFee: client.convenienceFee,
    });
  } catch (err) {
    return Response.error(res, "Failed to update convenience fee", err);
  }
};

module.exports = {
  registerClient,
  loginClient,
  toggleIsActive,
  updateConvenienceFee,
};
