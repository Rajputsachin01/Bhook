const mongoose = require("mongoose");

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^[6-9]\d{9}$/.test(phone); // Indian mobile format
}

function isEmpty(value) {
  return value === undefined || value === null || value === "";
}

module.exports = {
  isValidObjectId,
  isValidEmail,
  isValidPhone,
  isEmpty,
};
