import React, { useEffect, useState, useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const months = [
  { id: "", name: "All Months" },
  { id: "01", name: "January" },
  { id: "02", name: "February" },
  { id: "03", name: "March" },
  { id: "04", name: "April" },
  { id: "05", name: "May" },
  { id: "06", name: "June" },
  { id: "07", name: "July" },
  { id: "08", name: "August" },
  { id: "09", name: "September" },
  { id: "10", name: "October" },
  { id: "11", name: "November" },
  { id: "12", name: "December" },
];

const Graph = () => {
  const [expenses, setExpenses] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");

  useEffect(() => {
    const storedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
    setExpenses(storedExpenses);
  }, []);

  const chartData = useMemo(() => {
    const categoryTotals = {};

    expenses
      .filter((expense) => {
        if (!selectedMonth) return true;
        const month = new Date(expense.date).getMonth() + 1;
        return String(month).padStart(2, "0") === selectedMonth;
      })
      .forEach((expense) => {
        categoryTotals[expense.category] =
          (categoryTotals[expense.category] || 0) + Number(expense.amount);
      });

    return {
      labels: Object.keys(categoryTotals),
      values: Object.values(categoryTotals),
    };
  }, [expenses, selectedMonth]);

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        data: chartData.values,
        backgroundColor: [
          "#007bff",
          "#28a745",
          "#ffc107",
          "#dc3545",
          "#17a2b8",
          "#6610f2",
          "#ff6600",
        ],
        borderColor: "#fff",
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  };

  const options = {
    cutout: "60%",
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  return (
    <div className="container text-center my-5">
      <h2 className="fw-bold mb-4">Category-wise Expense</h2>

      {/* Month Dropdown */}
      <div className="d-flex justify-content-center mb-4">
        <select
          className="form-select w-auto"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          {months.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {/* Chart */}
      <div className="mx-auto" style={{ maxWidth: "400px" }}>
        {chartData.values.length > 0 ? (
          <Doughnut data={data} options={options} />
        ) : (
          <p className="text-secondary mt-4">
            No expense found for selected month...
          </p>
        )}
      </div>
    </div>
  );
};

export default Graph;
