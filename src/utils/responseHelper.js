function fail(res, message = "Request failed", statusCode = 200) {
  return res.status(statusCode).json({
    status: false,
    message,
    data: null,
  });
}

function success(res, message = "Request successful", data = null, statusCode = 200) {
  return res.status(statusCode).json({
    status: true,
    message,
    data,
  });
}

function error(res, message = "Internal Server Error", err = {}, statusCode = 500) {
  console.error(" ERROR:", err?.message || err);
  return res.status(statusCode).json({
    status: false,
    message,
    error: err?.message || err,
  });
}

module.exports = {
  fail,
  success,
  error,
};
