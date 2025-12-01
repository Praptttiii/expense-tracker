import React, { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const signup = (email, password) => {
    const newUser = { email, password };
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
  };

  const defaultUser = {
    email: "admin@example.com",
    password: "admin123",
  };

  const login = (email, password) => {
    const savedUser = JSON.parse(localStorage.getItem("user"));

    if (
      (savedUser &&
        savedUser.email === email &&
        savedUser.password === password) ||
      (email === defaultUser.email && password === defaultUser.password)
    ) {
      const loggedInUser = savedUser || defaultUser;
      setUser(loggedInUser);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
