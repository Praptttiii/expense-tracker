import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Joi from "joi";

export default function AddExpense({ onSave }) {
  const navigate = useNavigate();

  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("personal");
  const [newCategory, setNewCategory] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [errors, setErrors] = useState({});

  const [categories, setCategories] = useState(
    JSON.parse(localStorage.getItem("categories")) || [
      "Food",
      "Bills",
      "Travel",
    ]
  );

  const [groups] = useState(
    (JSON.parse(localStorage.getItem("groupsList")) || []).map((g) => g.name)
  );

  // JOI VALIDATION SCHEMA
  const schema = Joi.object({
    date: Joi.string().required().label("Date"),
    amount: Joi.number().min(1).required().label("Amount"),
    description: Joi.string().min(3).required().label("Description"),
    category: Joi.string().required().label("Category"),
    type: Joi.string().required(),
    selectedGroup: Joi.string().when("type", {
      is: "group",
      then: Joi.string().required().label("Group"),
      otherwise: Joi.string().allow(""),
    }),
  });

  const validateField = () => {
    const formData = {
      date,
      amount: amount ? Number(amount) : "",
      description,
      category,
      type,
      selectedGroup,
    };

    const result = schema.validate(formData, { abortEarly: false });

    if (!result.error) {
      setErrors({});
      return true;
    }

    const newErrors = {};
    result.error.details.forEach((err) => {
      newErrors[err.path[0]] = err.message;
    });

    setErrors(newErrors);
    return false;
  };

  const addCategory = () => {
    if (!newCategory.trim()) return;
    const updated = [...categories, newCategory];
    setCategories(updated);
    localStorage.setItem("categories", JSON.stringify(updated));
    setCategory(newCategory);
    setNewCategory("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateField()) return;

    const expense = {
      id: "R_" + Date.now(),
      date,
      amount: parseFloat(amount),
      description,
      category,
      type,
      group: type === "group" ? selectedGroup : null,
    };

    const existing = JSON.parse(localStorage.getItem("expenses")) || [];
    existing.push(expense);
    localStorage.setItem("expenses", JSON.stringify(existing));

    // Reset Form
    setDate("");
    setAmount("");
    setDescription("");
    setCategory("");
    setType("personal");
    setNewCategory("");
    setSelectedGroup("");

    alert("Expense Added!");
    onSave();
  };

  const clearError = (field) => {
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="shadow-lg rounded-4 p-4 bg-white w-50">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-primary">
            <i className="bi bi-receipt-cutoff me-2"></i>Add Expense
          </h2>
          <button
            className="btn btn-outline-primary"
            onClick={() => navigate("/")}
          >
            <i className="bi bi-arrow-left-circle me-2"></i>Back
          </button>
        </div>

        {/* DATE */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Date</label>
            <input
              type="date"
              className="form-control form-control-lg rounded-3"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                clearError("date");
              }}
            />
            {errors.date && <p className="text-danger mt-1">{errors.date}</p>}
          </div>

          {/* AMOUNT */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Amount (₹)</label>
            <input
              type="number"
              className="form-control form-control-lg rounded-3"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                clearError("amount");
              }}
            />

            {errors.amount && (
              <p className="text-danger mt-1">{errors.amount}</p>
            )}
          </div>

          {/* DESCRIPTION */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Description</label>
            <input
              type="text"
              className="form-control form-control-lg rounded-3"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                clearError("description");
              }}
            />
            {errors.description && (
              <p className="text-danger mt-1">{errors.description}</p>
            )}
          </div>

          {/* CATEGORY */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Category</label>

            <select
              className="form-select form-select-lg rounded-3"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                clearError("category");
              }}
            >
              <option value="">Select Category</option>
              {categories.map((c, i) => (
                <option key={i} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {errors.category && (
              <p className="text-danger mt-1">{errors.category}</p>
            )}
          </div>

          {/* ADD NEW CATEGORY */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Add New Category</label>

            <div className="d-flex gap-2">
              <input
                type="text"
                className="form-control form-control-lg rounded-3"
                placeholder="Eg: Shopping"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-outline-primary btn-lg rounded-3"
                onClick={addCategory}
              >
                Add
              </button>
            </div>
          </div>

          {/* EXPENSE TYPE */}
          <div className="mb-4">
            <label className="form-label fw-semibold">Expense Type</label>
            <select
              className="form-select form-select-lg rounded-3"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="personal">Personal</option>
              <option value="group">Group</option>
            </select>
          </div>

          {/* GROUP SELECT */}
          {type === "group" && (
            <div className="mb-4">
              <label className="form-label fw-semibold">Select Group</label>
              <select
                className="form-select form-select-lg rounded-3"
                value={selectedGroup}
                onChange={(e) => {
                  setSelectedGroup(e.target.value);
                  clearError("selectedGroup");
                }}
              >
                <option value="">Choose a Group</option>
                {groups.map((g, i) => (
                  <option key={i} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              {errors.selectedGroup && (
                <p className="text-danger mt-1">{errors.selectedGroup}</p>
              )}
            </div>
          )}

          <button
            className="btn btn-primary btn-lg w-auto rounded-3 shadow-sm fw-bold"
            type="submit"
          >
            <i className="bi bi-check-circle me-2"></i>
            Save Expense
          </button>
        </form>
      </div>
    </div>
  );
}
