const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation failed",
      errors: Object.values(err.errors).map((item) => item.message),
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      message: `Invalid ${err.path}`,
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      message: "A record with the same unique value already exists",
      fields: Object.keys(err.keyPattern || {}),
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ message: "Invalid token" });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Token expired" });
  }

  return res.status(err.status || 500).json({
    message: err.message || "Server error",
  });
};

module.exports = errorHandler;
