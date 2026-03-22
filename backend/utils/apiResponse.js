const sendSuccess = (res, data, status = 200) => {
  return res.status(status).json({ success: true, data });
};

const sendError = (res, status, message, error = null) => {
  return res.status(status).json({ success: false, message, error });
};

module.exports = { sendSuccess, sendError };