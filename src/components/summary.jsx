import React, { useEffect, useState } from "react";

export default function Summary() {
  const [expenses, setExpenses] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [search, setSearch] = useState("");
  const now = new Date();
  const defaultMonth = now.toISOString().slice(0, 7);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("expenses")) || [];
    setExpenses(data);

    setSelectedMonth(defaultMonth);
  }, []);

  const formattedMonth = new Date(selectedMonth + "-01").toLocaleString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    }
  );

  const filteredByMonth = expenses.filter((e) =>
    e.date.startsWith(selectedMonth)
  );

  // filter group expenses
  const groupExpenses = filteredByMonth.filter((e) => e.type === "group");

  // Unique groups in that month
  const groupsInMonth = [...new Set(groupExpenses.map((e) => e.groupId))];

  //group details
  const getGroupDetails = (groupId) => {
    return groupExpenses.find((e) => e.groupId === groupId);
  };

  // FILTER BY MONTH + SEARCH
  const personalExpenses = expenses.filter((e) => {
    const matchType = e.type === "personal";

    const matchMonth =
      selectedMonth === "" ? true : e.date.startsWith(selectedMonth);

    const matchSearch =
      search === "" ||
      e.description?.toLowerCase().includes(search.toLowerCase()) ||
      e.category?.toLowerCase().includes(search.toLowerCase());

    return matchType && matchMonth && matchSearch;
  });

  // TOTAL PERSONAL EXPENSE FOR SELECTED MONTH
  const totalPersonal = personalExpenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  // CATEGORY BREAKDOWN
  const categoryTotals = {};
  personalExpenses.forEach((exp) => {
    if (!categoryTotals[exp.category]) categoryTotals[exp.category] = 0;
    categoryTotals[exp.category] += Number(exp.amount);
  });

  return (
    <div className="container mt-5">
      <h2 className="fw-bold text-primary">
        <i className="bi bi-graph-up-arrow me-2"></i>
        Summary
      </h2>

      {/* Month Selector */}
      <div className="card p-3 mt-3 shadow-sm">
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label fw-semibold">Select Month</label>
            <input
              type="month"
              className="form-control"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">Search</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search description or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {(selectedMonth || search) && (
            <div className="col-md-2 d-flex align-items-end">
              <button
                className="btn btn-danger"
                onClick={() => {
                  setSelectedMonth(defaultMonth);
                  setSearch("");
                }}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TOTAL PERSONAL EXPENSE */}
      <div className="card p-4 mt-4 shadow-sm border-0 rounded-4 bg-light">
        <h4 className="fw-bold text-success">
          Total Personal Expense - {formattedMonth} : ₹{totalPersonal}
        </h4>
      </div>

      {/* CATEGORY BREAKDOWN */}
      <div className="card p-3 mt-4 shadow-sm rounded-4">
        <h5 className="fw-bold">Category Breakdown</h5>

        {Object.keys(categoryTotals).length === 0 ? (
          <p className="text-muted mt-2">No personal expenses found.</p>
        ) : (
          <ul className="list-group mt-2">
            {Object.entries(categoryTotals).map(([cat, amt], i) => (
              <li
                key={i}
                className="list-group-item d-flex justify-content-between fs-6 fw-semibold"
              >
                <span>{cat}</span>
                <span className="text-primary">₹{amt}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card p-3 mt-4 shadow-sm rounded-4">
        <h4 className="fw-bold">Groups for {formattedMonth}</h4>

        {groupsInMonth.length === 0 ? (
          <p className="text-muted mt-2">No groups found for this month.</p>
        ) : (
          <ul className="list-group mt-3">
            {groupsInMonth.map((groupId) => {
              const g = getGroupDetails(groupId);
              const group_name = g.group;
              const members = g.groupMembers || [];
              const splitType = g.splitType || "equal";
              const splitAmounts = g.splitAmounts || {};
              const amount = g.amount;
              return (
                <li
                  key={groupId}
                  className="list-group-item mb-3 rounded-3 shadow-sm p-3"
                >
                  <h5 className="fw-bold text-primary">{group_name}</h5>

                  <p className="mb-1">
                    <strong>Total Expense:</strong> ₹{amount}
                  </p>
                  <p className="mb-2">
                    <strong>Split Type:</strong> {splitType}
                  </p>

                  {/* Members & Split Amounts */}
                  <h6 className="fw-semibold mt-3">Members & Split</h6>

                  <ul className="mt-2">
                    {members.map((m) => (
                      <li key={m} className="d-flex justify-content-between">
                        <span>{m}</span>

                        <span
                          className={`fw-bold ${
                            m.trim().toLowerCase() === "you"
                              ? "text-success"
                              : "text-danger"
                          }`}
                        >
                          ₹{(splitAmounts[m] || 0).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Total owed */}
                  <h6 className="fw-bold mt-3 text-primary">
                    Total Owed To You: ₹
                    {members
                      .filter((m) => m !== "You")
                      .reduce((sum, m) => sum + (splitAmounts[m] || 0), 0)
                      .toFixed(2)}
                  </h6>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
