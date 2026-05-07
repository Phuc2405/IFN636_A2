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
        ResponseCode: "400",
        Description: `Missing required fields`,
        Status: "Failed",
        MissingFields: missing.map((field) => ({
          ErrorField: field,
          ErrorMessage: `${field} is required`,
        })),
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(402).json({
        ResponseCode: "402",
        Description: "Invalid email format",
        Status: "Failed",
      });
    }
    if (password !== confirmPassword) {
      return res.status(405).json({
        ResponseCode: "405",
        Description: "Passwords mismatch",
        Status: "Failed",
      });
    }
    const authHeader = req.headers?.authorization;
    if (authHeader) {
      return res.status(409).json({
        ResponseCode: "409",
        Description: "User has already logged in",
        Status: "Failed",
      });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(406).json({
        ResponseCode: "406",
        Description: "Email already exists",
        Status: "Failed",
      });
    }

    const user = await User.create({
      nickname,
      email,
      password,
      type: "user",
    });

    return res.status(201).json({
      ResponseCode: "201",
      Description: "Created successfully",
      Status: "Success",
      Data: {
        nickname: user.nickname,
        email: user.email,
        type: user.type,
        token: generateToken(user.id),
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      ResponseCode: "500",
      Description: "Internal server error",
      Status: "Failed",
    });
  }
};

// LOGIN
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check missing fields
    const missing = [];
    if (!email) missing.push("email");
    if (!password) missing.push("password");
    if (missing.length > 0) {
      return res.status(400).json({
        ResponseCode: "400",
        Description: `Missing required fields`,
        Status: "Failed",
        MissingFields: missing.map((field) => ({
          ErrorField: field,
          ErrorMessage: `${field} is required`,
        })),
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(402).json({
        ResponseCode: "402",
        Description: "Invalid email format",
        Status: "Failed",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        ResponseCode: "401",
        Description: "Invalid email or password",
        Status: "Failed",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({
        ResponseCode: "401",
        Description: "Invalid email or password",
        Status: "Failed",
      });
    }
    const authHeader = req.headers?.authorization;
    if (authHeader) {
      return res.status(409).json({
        ResponseCode: "409",
        Description: "User has already logged in",
        Status: "Failed",
      });
    }

    res.json({
      ResponseCode: "200",
      Description: "Successful",
      Status: "Success",
      Data: {
        nickname: user.nickname,
        email: user.email,
        type: user.type,
        token: generateToken(user.id),
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      ResponseCode: "500",
      Description: "Internal server error",
      Status: "Failed",
    });
  }
};

module.exports = { registerUser, loginUser };
