const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      return next();
    } catch (error) {
      return res.status(401).json({
        responseCode: "401",
        description: "Invalid or expired token",
        status: "Failed",
      });
    }
  }

  return res.status(401).json({
    responseCode: "401",
    description: "Invalid or expired token",
    status: "Failed",
  });
};

module.exports = { protect };
