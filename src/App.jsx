import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import AddExpense from "./components/AddExpense";
import ExpenseList from "./components/ExpenseList";
import CreateGroup from "./components/CreateGroup";
import Summary from "./components/Summary";
import CategoryList from "./components/CategoryList";
import { AuthProvider } from "./context/AuthContext";
import Login from "./components/Login";
import Layout from "./layout/Layout";
import Signup from "./components/Signup";
import ProtectedRoute from "./wrappers/ProtectedRoute";
import PublicRoute from "./wrappers/PublicRoute";

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/add-expense" element={<AddExpense />} />
            <Route path="/expenses" element={<ExpenseList />} />
            <Route path="/create-group" element={<CreateGroup />} />
            <Route path="/monthly-summary" element={<Summary />} />
            <Route path="/category-list" element={<CategoryList />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
