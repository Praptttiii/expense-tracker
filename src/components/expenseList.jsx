import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";

export default function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("expenses")) || [];
    setExpenses(data);
  }, []);

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?"))
      return;

    const updated = expenses.filter((exp) => exp.id !== id);
    setExpenses(updated);
    localStorage.setItem("expenses", JSON.stringify(updated));
  };

  const columns = [
    { name: "Date", selector: (row) => row.date, sortable: true },
    { name: "Description", selector: (row) => row.description, sortable: true },
    { name: "Category", selector: (row) => row.category, sortable: true },
    { name: "Amount (₹)", selector: (row) => row.amount, sortable: true },
    { name: "Type", selector: (row) => row.type, sortable: true },

    {
      name: "Delete",
      cell: (row) => (
        <button
          className="btn btn-sm btn-danger rounded-circle"
          onClick={() => handleDelete(row.id)}
        >
          <i className="bi bi-trash-fill"></i>
        </button>
      ),
    },
  ];

  // Filters
  const filteredData = expenses
    .filter(
      (exp) =>
        exp.description.toLowerCase().includes(search.toLowerCase()) ||
        exp.category.toLowerCase().includes(search.toLowerCase()) ||
        exp.type.toLowerCase().includes(search.toLowerCase())
    )
    .filter((exp) => (filterCategory ? exp.category === filterCategory : true))
    .filter((exp) => {
      if (fromDate && exp.date < fromDate) return false;
      if (toDate && exp.date > toDate) return false;
      return true;
    });

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary d-flex align-items-center">
          <i className="bi bi-cash-stack me-2 fs-2"></i>
          Expense List
        </h2>

        <button
          className="btn btn-outline-primary"
          onClick={() => navigate("/")}
        >
          <i className="bi bi-arrow-left-circle me-2"></i>Back
        </button>
      </div>

      {expenses.length > 0 && (
        <>
          {/*  Search + Filters UI */}
          <div className="card p-3 mb-3 shadow-sm">
            <div className="row g-3">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search description, category or type..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="col-md-3">
                <select
                  className="form-select"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {Array.from(new Set(expenses.map((e) => e.category))).map(
                    (cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="col-md-2">
                <input
                  type="date"
                  className="form-control"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>

              <div className="col-md-2">
                <input
                  type="date"
                  className="form-control"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* DataTable */}
          <div className="shadow-sm rounded-4 border table-responsive p-2">
            <DataTable
              columns={columns}
              data={filteredData}
              pagination
              paginationPerPage={3}
              paginationRowsPerPageOptions={[3, 5, 7]}
              highlightOnHover
              striped
            />
          </div>
        </>
      )}
    </div>
  );
}
