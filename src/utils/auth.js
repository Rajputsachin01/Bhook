require("dotenv").config();
const jwt = require("jsonwebtoken");
const Response = require("./responseHelper");

const signInToken = (userId, role = "user") => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};
const isAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.fail(res, "Unauthorized: Token missing", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;
    req.role = decoded.role;

    next();
  } catch (err) {
    console.error(" JWT Error:", err);
    return Response.error(res, "Unauthorized: Invalid token", err, 401);
  }
};
const isClient = (req, res, next) => {
  if (req.role !== "client") {
    return Response.fail(res, "Forbidden: Clients only", 403);
  }
  next();
};

const isUser = (req, res, next) => {
  if (req.role !== "user") {
    return Response.fail(res, "Forbidden: Users only", 403);
  }
  next();
};

module.exports = {
  signInToken,
  isAuth,
  isClient,
  isUser,
};
