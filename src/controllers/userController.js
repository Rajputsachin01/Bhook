const UserModel = require("../models/userModel");
const { signInToken } = require("../utils/isAuth");
const Response = require("../utils/responseHelper");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { isValidEmail, isValidPhone, isEmpty } = require("../utils/validationHelper");

async function getUserWithToken(userId, role) {
  try {
    let userDetail = await userProfile(userId);
    const token = signInToken(userId, role);
    return { token: token, userDetail: userDetail };
  } catch (error) {
    console.log(error);
    return {};
  }
}

const userProfile = async (userId) => {
  try {
    let userProfile = await UserModel.findById(userId).select({
      password: 0,
      __v: 0,
      createdAt: 0,
      updatedAt: 0,
    });
    return userProfile;
  } catch (error) {
    return false;
  }
};

// for generating 4 digit random otp
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

// For creating user
const registerUser  = async (req, res) => {
  try {
    const { name, email, password, phoneNo } = req.body;

    if (isEmpty(name)) return Response.fail(res, "Name is required");
    if (isEmpty(email)) return Response.fail(res, "Email is required");
    if (isEmpty(password)) return Response.fail(res, "Password is required");
    if (isEmpty(phoneNo)) return Response.fail(res, "Phone number is required");

    if (!isValidEmail(email)) return Response.fail(res, "Email is not valid!");
    if (!isValidPhone(phoneNo)) return Response.fail(res, "Phone number is not valid!");

    const existingUser  = await UserModel.findOne({
      $or: [{ email }, { phoneNo }],
      isDeleted: false,
    });

    if (existingUser ) {
      return Response.fail(res, "User  already exists with this email or phone number!");
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    let baseName = name.toLowerCase().replace(/\s+/g, "");
    let lastThree = String(phoneNo).slice(-3);
    let userName = `${baseName}${lastThree}`;
    let usernameExists = await UserModel.findOne({ userName });

    while (usernameExists) {
      const rand = Math.floor(100 + Math.random() * 900);
      userName = `${baseName}${rand}`;
      usernameExists = await UserModel.findOne({ userName });
    }

    const otp = "1234"; // For dev only, replace with actual generation
    const userObj = {
      userName,
      name,
      email,
      phoneNo,
      password: hashedPassword,
      otp,
    };

    const createdUser  = await UserModel.create(userObj);
    return Response.success(res, "OTP successfully sent", createdUser );
  } catch (error) {
    console.error(error);
    return Response.error(res, "Internal Server Error", error);
  }
};

// for updating User
const updateUser  = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, email, phoneNo } = req.body;

    if (isEmpty(userId)) {
      return Response.fail(res, "User  ID is missing from request");
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return Response.fail(res, "User  not found");
    }

    let objToUpdate = {};

    if (name && name !== user.name) {
      objToUpdate.name = name;
    }

    if (email && email !== user.email) {
      if (!isValidEmail(email)) {
        return Response.fail(res, "Email is not valid!");
      }

      const existingEmailUser  = await UserModel.findOne({
        email: new RegExp(`^${email}$`, "i"),
        _id: { $ne: userId },
      });
      if (existingEmailUser ) {
        return Response.fail(res, "Email is already used in another account");
      }

      objToUpdate.email = email;
    }

    if (phoneNo && phoneNo !== user.phoneNo) {
      if (!isValidPhone(phoneNo)) {
        return Response.fail(res, "Phone number is not valid!");
      }

      const existingPhoneUser  = await UserModel.findOne({
        phoneNo,
        _id: { $ne: userId },
      });
      if (existingPhoneUser ) {
        return Response.fail(res, "Phone number is already used in another account");
      }

      objToUpdate.phoneNo = phoneNo;
    }

    if (Object.keys(objToUpdate).length === 0) {
      return Response.success(res, "No changes detected in profile", user);
    }

    const updatedProfile = await UserModel.findByIdAndUpdate(userId, objToUpdate, {
      new: true,
    });

    return Response.success(res, "User  updated successfully!", updatedProfile);
  } catch (error) {
    console.log(error);
    return Response.error(res, "Internal Server Error", error);
  }
};

// for soft delete User
const removeUser  = async (req, res) => {
  try {
    const { userId } = req.body;
    if (isEmpty(userId)) {
      return Response.fail(res, "Please provide User Id");
    }
    let i = { _id: userId };
    let deleted = await UserModel.findOneAndUpdate(
      i,
      { isDeleted: true },
      { new: true }
    );
    if (!deleted) {
      return Response.fail(res, "No user found!");
    }
    return Response.success(res, "User  deleted successfully", deleted);
  } catch (error) {
    console.log(error);
    return Response.error(res, "Internal Server Error", error);
  }
};

// for fetching user profile
const fetchProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await UserModel.findById(userId).select({
      password: 0,
      __v: 0,
      createdAt: 0,
      updatedAt: 0,
    });
    if (!user) {
      return Response.fail(res, "User  not found");
    }
    return Response.success(res, "Profile fetched successfully", user);
  } catch (error) {
    console.log(error);
    return Response.error(res, "Internal Server Error", error);
  }
};

// for finding user By UserId
const findUserById = async (req, res) => {
  try {
    const { userId } = req.body;
    if (isEmpty(userId)) {
      return Response.fail(res, "userId is required");
    }
    const user = await UserModel.findOne({ _id: userId, isDeleted: false });
    if (!user) {
      return Response.fail(res, "User  not found");
    }
    return Response.success(res, "User  found", user);
  } catch (error) {
    console.log(error);
    return Response.error(res, "Internal Server Error", error);
  }
};

// for verifying OTP
const verifyOTP = async (req, res) => {
  try {
    const { number, email, otp } = req.body;

    if (isEmpty(otp)) {
      return Response.fail(res, "OTP is required");
    }

    if (isEmpty(number) && isEmpty(email)) {
      return Response.fail(res, "Either phone number or email is required");
    }

    if (number && !isValidPhone(number)) {
      return Response.fail(res, "Phone number is not valid!");
    }

    const query = {
      otp,
      ...(number ? { phoneNo: number } : {}),
      ...(email ? { email } : {}),
    };

    const user = await UserModel.findOne(query);

    if (!user) {
      return Response.fail(res, "Invalid OTP");
    }

    const newOtp = "1234";
    await UserModel.updateOne({ _id: user._id }, { $set: { otp: newOtp } });

    const role = "user";
    const { token, userDetail } = await getUserWithToken(user._id, role);
    if (!token || !userDetail) {
      return Response.error(res, "Failed to generate token or get user profile");
    }

    res.cookie("token", token);
    return Response.success(res, "Token generated successfully.", {
      token,
      userDetail,
    });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    return Response.error(res, "Internal Server Error", error);
  }
};

// resend OTP
const resendOTP = async (req, res) => {
  try {
    const { number } = req.body;

    if (isEmpty(number)) {
      return Response.fail(res, "Please provide phone number.");
    }
    const user = await UserModel.findOne({ phoneNo: number });

    if (!user) {
      return Response.fail(res, "User  not found!");
    }
    // Generate new OTP and set expiry
    const otp = "1234";
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await UserModel.updateOne({ _id: user._id }, { $set: { otp, otpExpires } });
    return Response.success(res, "OTP resent successfully.");
  } catch (error) {
    console.error(error);
    return Response.error(res, "Internal Server Error", error);
  }
};

// login using only phone number
const loginUser  = async (req, res) => {
  try {
    const { phoneNo, email } = req.body;

    if (isEmpty(phoneNo) && isEmpty(email)) {
      return Response.fail(res, "Either phone number or email is required");
    }

    const query = {
      isDeleted: false,
      ...(phoneNo ? { phoneNo } : {}),
      ...(email ? { email } : {})
    };

    const user = await UserModel.findOne(query);

    if (!user) {
      return Response.fail(res, "User  not found");
    }

    const newOtp = "1234"; 
    user.otp = newOtp;
    await user.save();
    return Response.success(res, "OTP sent successfully", user.email);
  } catch (error) {
    console.error("Login Error:", error);
    return Response.error(res, "Internal Server Error", error);
  }
};

// for forget password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (isEmpty(email)) {
      return Response.fail(res, "Please enter your email");
    }
    const user = await UserModel.findOne({ email });
    if (!user) {
      return Response.fail(res, "User  not found");
    }
    const otp = "1234";
    user.resetPasswordToken = otp; // Store OTP for password reset
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
    return Response.success(res, "Password reset email sent", email);
  } catch (error) {
    console.error("Error:", error.message);
    return Response.error(res, "Internal Server Error", error);
  }
};

// for password reset OTP On email
const verifyResetPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (isEmpty(email) || isEmpty(otp)) return Response.fail(res, "Email and OTP are required");

    const user = await UserModel.findOne({
      email,
      resetPasswordToken: otp,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return Response.fail(res, "Invalid or expired OTP");
    return Response.success(res, "OTP verified successfully");
  } catch (error) {
    console.log(error);
    return Response.error(res, "Internal Server Error", error);
  }
};

// for resend Password Reset OTP On email
const resendResetPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (isEmpty(email)) {
      return Response.fail(res, "Email is required");
    }
    const user = await UserModel.findOne({ email });
    if (!user) {
      return Response.fail(res, "User  not found");
    }
    const otp = "1234";
    user.resetPasswordToken = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
    return Response.success(res, "New OTP sent successfully");
  } catch (error) {
    console.log(error);
    return Response.error(res, "Internal Server Error", error);
  }
};

// for reset password
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (isEmpty(email) || isEmpty(newPassword) || isEmpty(confirmPassword)) {
      return Response.fail(res, "All fields are required");
    }
    if (newPassword !== confirmPassword) {
      return Response.fail(res, "Passwords do not match");
    }
    const user = await UserModel.findOne({ email });
    if (!user) {
      return Response.fail(res, "User  not found");
    }
    if (user.resetPasswordExpires < Date.now()) {
      return Response.fail(res, "OTP expired. Please request a new OTP.");
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return Response.success(res, "Password has been reset successfully");
  } catch (error) {
    console.log(error);
    return Response.error(res, "Internal Server Error", error);
  }
};

const listingUser  = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.body;

    const query = {
      isDeleted: { $ne: true },
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await UserModel.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    const users = await UserModel.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    return Response.success(res, "User  list fetched successfully", {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages,
      users,
    });
  } catch (error) {
    console.log(error);
    return Response.error(res, "Internal Server Error", error);
  }
};

module.exports = {
  registerUser ,
  updateUser ,
  removeUser ,
  fetchProfile,
  findUserById,
  loginUser ,
  verifyOTP,
  resendOTP,
  forgotPassword,
  verifyResetPasswordOtp,
  resendResetPasswordOtp,
  resetPassword,
  listingUser ,
};
