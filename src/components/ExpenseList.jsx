import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ExpenseList() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("expenses")) || [];
    setExpenses(data);
  }, []);

  const exportToPDF = (mode) => {
    const doc = new jsPDF();

    const addSection = (type) => {
      const isPersonal = type === "personal";
      const title = isPersonal
        ? "Personal Expense Report"
        : "Group Expense Report";

      const tableColumn = isPersonal
        ? ["No.", "Amount", "Category", "Date"]
        : [
            "No.",
            "Date",
            "Group Name",
            "Category",
            "Total Amount",
            "Split Type",
            "Your Share",
          ];

      const tableRows = [];

      const sectionData = filteredData.filter((e) => e.type === type);

      if (sectionData.length === 0) return; // nothing to add

      sectionData.forEach((e, index) => {
        const row = isPersonal
          ? [index + 1, e.amount, e.category, e.date]
          : [
              index + 1,
              e.date,
              e.group,
              e.category,
              e.amount,
              e.splitType,
              e.splitAmounts?.["You"] || "—",
            ];

        tableRows.push(row);
      });

      // Position this section below the previous table (if any)
      const startY = doc.lastAutoTable
        ? doc.lastAutoTable.finalY + 10 // below previous table
        : 20;

      doc.setFontSize(14);
      doc.text(title, 14, startY - 5);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY,
      });
    };

    // Decide what to export based on mode
    if (mode === "personal" || mode === "group") {
      addSection(mode);
    } else if (mode === "both") {
      addSection("personal");
      addSection("group");
    }

    const fileName =
      mode === "personal"
        ? "personal-expense-report.pdf"
        : mode === "group"
        ? "group-expense-report.pdf"
        : "all-expense-report.pdf";

    doc.save(fileName);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?"))
      return;

    const updated = expenses.filter((exp) => exp.id !== id);
    setExpenses(updated);
    localStorage.setItem("expenses", JSON.stringify(updated));
  };

  const columns = [
    { name: "Date", selector: (row) => row.date, sortable: true },
    {
      name: "Description",
      selector: (row) =>
        row.description && row.description.trim() !== ""
          ? row.description
          : "-",
      sortable: true,
    },
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
    .filter((exp) => {
      if (fromDate && exp.date < fromDate) return false;
      if (toDate && exp.date > toDate) return false;
      return true;
    });

  const personalExpenses = filteredData.filter((e) => e.type === "personal");
  const groupExpenses = filteredData.filter((e) => e.type === "group");

  const clearSearch = () => {
    setSearch("");
    setFromDate("");
    setToDate("");

    // Reset the list to full data
    const data = JSON.parse(localStorage.getItem("expenses")) || [];
    setExpenses(data);
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary d-flex align-items-center">
          <i className="bi bi-cash-stack me-2 fs-2"></i>
          Expense List
        </h2>

        <div className="d-flex align-items-center gap-3">
          {/* Export Dropdown */}
          {filteredData.length > 0 && (
            <div className="dropdown">
              <button
                className="btn btn-primary dropdown-toggle d-flex align-items-center gap-2"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-file-earmark-arrow-down"></i>
                Export PDF
              </button>

              <ul className="dropdown-menu shadow-sm">
                {/* Show 'Export All' only if both data exist */}
                {personalExpenses.length > 0 && groupExpenses.length > 0 && (
                  <li>
                    <button
                      className="dropdown-item d-flex align-items-center gap-2"
                      onClick={() => exportToPDF("both")}
                    >
                      <i className="bi bi-files"></i>
                      Export All
                    </button>
                  </li>
                )}

                {personalExpenses.length > 0 && (
                  <li>
                    <button
                      className="dropdown-item d-flex align-items-center gap-2"
                      onClick={() => exportToPDF("personal")}
                    >
                      <i className="bi bi-person-lines-fill text-primary"></i>
                      Export Personal
                    </button>
                  </li>
                )}

                {groupExpenses.length > 0 && (
                  <li>
                    <button
                      className="dropdown-item d-flex align-items-center gap-2"
                      onClick={() => exportToPDF("group")}
                    >
                      <i className="bi bi-people-fill text-success"></i>
                      Export Group
                    </button>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Back Button */}
          <button
            className="btn btn-outline-primary d-flex align-items-center gap-2"
            onClick={() => navigate("/")}
          >
            <i className="bi bi-arrow-left-circle"></i>
            Back
          </button>
        </div>
      </div>

      {expenses.length > 0 && (
        <>
          {/*  Search + Filters UI */}
          <div className="card p-3 mb-3 shadow-sm">
            <div className="row g-3 align-items-center">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search description, category or type..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
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
              {(search || fromDate || toDate) && (
                <div className="col d-flex justify-content-end ms-auto">
                  <button
                    className="btn btn-danger"
                    onClick={clearSearch}
                    title="Clear Search"
                  >
                    <i className="bi bi-x"></i>
                  </button>
                </div>
              )}
            </div>
          </div>

          {
            // PERSONAL
            filteredData.some((e) => e.type === "personal") && (
              <div className="shadow-sm rounded-4 border table-responsive p-2">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="fw-bold m-0">Personal Expenses</h3>
                </div>

                <DataTable
                  columns={columns}
                  data={filteredData.filter((e) => e.type === "personal")}
                  pagination
                  paginationPerPage={5}
                  paginationRowsPerPageOptions={[5, 10, 15]}
                  highlightOnHover
                  striped
                />
              </div>
            )
          }

          {
            // GROUP
            filteredData.some((e) => e.type === "group") && (
              <div className="mt-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="fw-bold m-0">Group Expenses</h3>
                </div>
                {filteredData
                  .filter((e) => e.type === "group")
                  .map((item, index) => (
                    <div
                      key={index}
                      className="border rounded-4 p-3 mb-3 shadow-sm bg-light position-relative"
                    >
                      {/* DELETE BUTTON */}
                      <button
                        className="btn btn-sm btn-danger rounded-circle position-absolute"
                        style={{ top: "10px", right: "10px" }}
                        onClick={() => handleDelete(item.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>

                      <p className="mb-1">
                        <strong>Date:</strong> {item.date}
                      </p>
                      <p className="mb-1">
                        <strong>Group Name:</strong> {item.group}
                      </p>

                      <p className="mb-1">
                        <strong>Members:</strong>{" "}
                        {item.groupMembers?.length
                          ? item.groupMembers.join(", ")
                          : "No members"}
                      </p>

                      <p className="mb-1">
                        <strong>Description:</strong> {item.description}
                      </p>

                      <p className="mb-1">
                        <strong>Category:</strong> {item.category}
                      </p>

                      <p className="mb-1">
                        <strong>Total Amount:</strong> ₹{item.amount}
                      </p>

                      <p className="mb-1">
                        <strong>Split Type:</strong> {item.splitType || "—"}
                      </p>

                      <div className="mt-2">
                        <strong>Split Amounts:</strong>
                        <ul className="mt-1">
                          {item.splitAmounts &&
                          Object.keys(item.splitAmounts).length > 0 ? ( //object.entries in used to convert object into array after converting it into array we can use map to iterate
                            Object.entries(item.splitAmounts).map(
                              ([name, amt], i) => (
                                <li key={i}>
                                  {name}: ₹{amt}
                                </li>
                              )
                            )
                          ) : (
                            <li>No split data</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  ))}
              </div>
            )
          }
        </>
      )}
    </div>
  );
}
