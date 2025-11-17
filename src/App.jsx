import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/navBar";
import Home from "./components/home";
import AddExpense from "./components/addExpense";
import ExpenseList from "./components/expenseList";
import CreateGroup from "./components/createGroup";

function App() {
  return (
    <HashRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add-expense" element={<AddExpense />} />
        <Route path="/expenses" element={<ExpenseList />} />
        <Route path="/create-group" element={<CreateGroup />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
