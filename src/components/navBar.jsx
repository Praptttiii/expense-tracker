import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const closeMenu = () => {
    const navbarCollapse = document.getElementById("navbarContent");
    if (navbarCollapse.classList.contains("show")) {
      new window.bootstrap.Collapse(navbarCollapse).hide();
    }
  };
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container-fluid px-2">
        <a className="navbar-brand fw-bold fs-4 px-3">💸 Expense Tracker</a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav mb-2 mb-lg-0 gap-2">
            <li className="nav-item">
              <Link className="nav-link text-white" to="/" onClick={closeMenu}>
                Home
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className="nav-link text-white"
                to="/add-expense"
                onClick={closeMenu}
              >
                Add Expense
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className="nav-link text-white"
                to="/expenses"
                onClick={closeMenu}
              >
                Expense List
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className="nav-link text-white"
                to="/create-group"
                onClick={closeMenu}
              >
                Create Group
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className="nav-link text-white"
                to="/monthly-summary"
                onClick={closeMenu}
              >
                Summary
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
