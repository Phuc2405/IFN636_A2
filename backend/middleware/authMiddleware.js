const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");

      if (!token) {
        res.status(401).json({
          responseCode: "401",
          description: "Not authorized, no token",
          status: "Failed",
        });
      }

      if (!user) {
        return res.status(401).json({
          responseCode: "401",
          description: "User no longer exists.",
          status: "Failed",
        });
      }

      // Check tokenVersion — mismatch means user has logged out
      if (decoded.tokenVersion !== user.tokenVersion) {
        return res.status(401).json({
          responseCode: "401",
          description: "Token has been invalidated. Please log in again.",
          status: "Failed",
        });
      }

      req.user = user;

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
