import React, { createContext, useState, useContext, useEffect } from "react";
import axiosInstance from "../axiosConfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Restore user from localStorage on mount (if stored as token-only or user object)
  useEffect(() => {
    if (!user) {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          return;
        } catch {
          // fall through
        }
      }
      if (token) {
        setUser({ token });
      }
    }
  }, [user]);

  const login = (userData) => {
    // Backend returns: { responseCode, description, status, data: { token, nickname, ... } }
    // Extract token and data
    const tokenToStore = userData.token || userData.data?.token;
    const userDataToStore = userData.data || userData;

    localStorage.setItem("token", tokenToStore);
    localStorage.setItem("user", JSON.stringify({ ...userDataToStore, token: tokenToStore }));
    setUser({ ...userDataToStore, token: tokenToStore });
  };

  const logout = async () => {
    await axiosInstance.post("/api/auth/logout", {}, {
      headers: { Authorization: `Bearer ${user.token}` },
    });

    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);