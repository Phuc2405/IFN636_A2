const mongoose = require("mongoose");

class DatabaseConnection {
  constructor() {
    if (DatabaseConnection.instance) {
      return DatabaseConnection.instance;
    }

    DatabaseConnection.instance = this;
  }

  async connect() {
    if (mongoose.connection.readyState === 1) {
      console.log("Using existing MongoDB connection");
      return mongoose.connection;
    }

    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("MongoDB connected successfully");
      return mongoose.connection;
    } catch (error) {
      console.error("MongoDB connection failed:", error.message);
      process.exit(1);
    }
  }
}

const databaseConnection = new DatabaseConnection();

const connectDB = async () => {
  return databaseConnection.connect();
};

module.exports = connectDB;
