const UserModel = require("../models/userModel");
const ClientModel = require("../models/clientModel");
const Response = require("../utils/responseHelper");
const { isValidPhone } = require("../utils/validationHelper");
const { signInToken } = require("../utils/auth");

const OTP_EXPIRY_SECONDS = 120;
const RATE_LIMIT_SECONDS = parseInt(process.env.OTP_RATE_LIMIT_SEC) || 20;
const MAX_OTP_PER_DAY = parseInt(process.env.OTP_DAILY_LIMIT) || 5;

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const sendOtp = async (req, res) => {
  try {
    const { phoneNo } = req.body;
    if (!isValidPhone(phoneNo))
      return Response.fail(res, "Invalid phone number");

    let user = await UserModel.findOne({ phoneNo });

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (user) {
      const lastRequest = user.otpRequests.slice(-1)[0];
      if (lastRequest) {
        const timeDiff = (now - new Date(lastRequest.requestedAt)) / 1000;
        if (timeDiff < RATE_LIMIT_SECONDS) {
          return Response.fail(
            res,
            `Please wait ${Math.ceil(
              RATE_LIMIT_SECONDS - timeDiff
            )} seconds before requesting OTP again.`
          );
        }
      }

      const otpToday = user.otpRequests.filter(
        (r) => new Date(r.requestedAt) >= today
      );
      if (otpToday.length >= MAX_OTP_PER_DAY) {
        return Response.fail(res, "Maximum OTP requests reached for today.");
      }

      user.otp = {
        code: generateOtp(),
        expiresAt: new Date(now.getTime() + OTP_EXPIRY_SECONDS * 1000),
      };
      user.otpRequests.push({ requestedAt: now });
      await user.save();
    } else {
      const newOtp = generateOtp();
      user = await UserModel.create({
        phoneNo,
        otp: {
          code: newOtp,
          expiresAt: new Date(now.getTime() + OTP_EXPIRY_SECONDS * 1000),
        },
        otpRequests: [{ requestedAt: now }],
      });
    }

    return Response.success(res, "OTP sent successfully", {
      otp: user.otp.code,
    });
  } catch (err) {
    return Response.error(res, "Failed to send OTP", err);
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { phoneNo, otp } = req.body;
    if (!isValidPhone(phoneNo) || !otp)
      return Response.fail(res, "Phone number and OTP are required");

    const user = await UserModel.findOne({ phoneNo });
    if (!user) return Response.fail(res, "User not found");

    const currentTime = new Date();
    if (
      !user.otp ||
      user.otp.code !== otp ||
      currentTime > new Date(user.otp.expiresAt)
    ) {
      return Response.fail(res, "Invalid or expired OTP");
    }

    const token = signInToken(user._id, "user");
    return Response.success(res, "OTP verified", { token });
  } catch (err) {
    return Response.error(res, "Failed to verify OTP", err);
  }
};

const resendOTP = async (req, res) => {
  try {
    const { phoneNo } = req.body;
    if (!isValidPhone(phoneNo))
      return Response.fail(res, "Invalid phone number");

    const user = await UserModel.findOne({ phoneNo });
    if (!user) return Response.fail(res, "User not found");

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastRequest = user.otpRequests.slice(-1)[0];
    if (lastRequest) {
      const timeDiff = (now - new Date(lastRequest.requestedAt)) / 1000;
      if (timeDiff < RATE_LIMIT_SECONDS) {
        return Response.fail(
          res,
          `Please wait ${Math.ceil(
            RATE_LIMIT_SECONDS - timeDiff
          )} seconds before resending OTP.`
        );
      }
    }

    const otpToday = user.otpRequests.filter(
      (r) => new Date(r.requestedAt) >= today
    );
    if (otpToday.length >= MAX_OTP_PER_DAY) {
      return Response.fail(res, "Maximum OTP requests reached for today.");
    }

    const newOtp = generateOtp();
    user.otp = {
      code: newOtp,
      expiresAt: new Date(now.getTime() + OTP_EXPIRY_SECONDS * 1000),
    };
    user.otpRequests.push({ requestedAt: now });
    await user.save();

    return Response.success(res, "OTP resent successfully", { otp: newOtp });
  } catch (err) {
    return Response.error(res, "Failed to resend OTP", err);
  }
};
const fetchClient = async (req, res) => {
  try {
    const client = await ClientModel.findOne({ isDeleted: false });

    if (!client) return Response.fail(res, "BusinessName not found");
    return Response.success(res, "Business refetched successfully", {
      businessName: client.businessName,
      isActive: client.isActive,
    });
  } catch (err) {
    return Response.error(res, "Failed to resend OTP", err);
  }
};

module.exports = {
  sendOtp,
  verifyOTP,
  resendOTP,
  fetchClient,
};
