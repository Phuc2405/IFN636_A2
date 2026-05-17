import axios from "axios";

const axiosInstance = axios.create({
  // baseURL can be set via REACT_APP_BASE_URL env variable, defaulting to localhost for development
  baseURL: process.env.REACT_APP_BASE_URL ? process.env.REACT_APP_BASE_URL : 'http://localhost:5001',
  // baseURL: "http://localhost:5001", // local
  //baseURL: 'http://16.176.7.15:5001', // live
  headers: { "Content-Type": "application/json" },
});

export default axiosInstance;
