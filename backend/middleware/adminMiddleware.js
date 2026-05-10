const admin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      responseCode: "401",
      description: "Invalid or expired token",
      status: "Failed",
    });
  }

  if (req.user.type !== "admin") {
    return res.status(403).json({
      responseCode: "403",
      description: "You are not allowed to do this action",
      status: "Failed",
    });
  }

  next();
};

module.exports = admin;
