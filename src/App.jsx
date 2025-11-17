import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/navBar";
import Home from "./components/home";
import AddExpense from "./components/addExpense";
import ExpenseList from "./components/expenseList";
import CreateGroup from "./components/createGroup";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add-expense" element={<AddExpense />} />
        <Route path="/expenses" element={<ExpenseList />} />
        <Route path="/create-group" element={<CreateGroup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
