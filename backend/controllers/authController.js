const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || "defaultsecret";
  return jwt.sign({ id }, secret, { expiresIn: "30d" });
};

// REGISTER
const registerUser = async (req, res) => {
  const { nickname, email, password, confirmPassword } = req.body;
  const missing = [];
  if (!nickname) missing.push("nickname");
  if (!email) missing.push("email");
  if (!password) missing.push("password");
  if (!confirmPassword) missing.push("confirmPassword");
  try {
    if (missing.length > 0) {
      return res.status(400).json({
        responseCode: "400",
        description: `Missing required fields`,
        status: "Failed",
        missingFields: missing.map((field) => ({
          errorField: field,
          errorMessage: `${field} is required`,
        })),
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(402).json({
        responseCode: "402",
        description: "Invalid email format",
        status: "Failed",
      });
    }
    if (password !== confirmPassword) {
      return res.status(405).json({
        responseCode: "405",
        description: "Passwords mismatch",
        status: "Failed",
      });
    }
    const authHeader = req.headers?.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "defaultsecret",
        );
        return res.status(409).json({
          responseCode: "409",
          description: "User has already logged in",
          status: "Failed",
        });
      } catch (err) {}
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(406).json({
        responseCode: "406",
        description: "Email already exists",
        status: "Failed",
      });
    }

    const user = await User.create({
      nickname,
      email,
      password,
      type: "user",
    });

    return res.status(201).json({
      responseCode: "201",
      description: "Created successfully",
      status: "Success",
      data: {
        nickname: user.nickname,
        email: user.email,
        type: user.type,
        token: generateToken(user.id),
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      responseCode: "500",
      description: "Internal server error",
      status: "Failed",
    });
  }
};

// LOGIN
const loginUser = async (req, res) => {
  const authHeader = req.headers?.authorization;
  const secret = process.env.JWT_SECRET || "defaultsecret";

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      jwt.verify(token, secret);

      return res.status(409).json({
        responseCode: "409",
        description: "User has already logged in",
        status: "Failed",
      });
    } catch (err) {
      // Token verification failed - continue with normal login flow
    }
  }
  const { email, password } = req.body;
  try {
    // Check missing fields
    const missing = [];
    if (!email) missing.push("email");
    if (!password) missing.push("password");
    if (missing.length > 0) {
      return res.status(400).json({
        responseCode: "400",
        description: `Missing required fields`,
        status: "Failed",
        missingFields: missing.map((field) => ({
          errorField: field,
          errorMessage: `${field} is required`,
        })),
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(402).json({
        responseCode: "402",
        description: "Invalid email format",
        status: "Failed",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(407).json({
        responseCode: "407",
        description: "Invalid email or password",
        status: "Failed",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(407).json({
        responseCode: "407",
        description: "Invalid email or password",
        status: "Failed",
      });
    }

    res.json({
      responseCode: "200",
      description: "Successful",
      status: "Success",
      data: {
        nickname: user.nickname,
        email: user.email,
        type: user.type,
        token: generateToken(user.id),
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      responseCode: "500",
      description: "Internal server error",
      status: "Failed",
    });
  }
};
const getUserInfo = async (req, res) => {
  return res.json({
    responseCode: "200",
    description: "User profile",
    status: "Success",
    data: {
      id: req.user._id,
      nickname: req.user.nickname,
      email: req.user.email,
      type: req.user.type,
    },
  });
};

module.exports = { registerUser, loginUser, getUserInfo };
