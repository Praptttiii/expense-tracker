import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Joi from "joi";

export default function AddExpense({ onSave }) {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(
    localStorage.getItem("lastCategory") || ""
  );
  const [type, setType] = useState("personal");
  const [newCategory, setNewCategory] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedSplit, setSelectedSplit] = useState("");
  const [errors, setErrors] = useState({});
  const [customError, setCustomError] = useState("");

  const [categories, setCategories] = useState(
    JSON.parse(localStorage.getItem("categories")) || [
      "Food",
      "Bills",
      "Travel",
    ]
  );

  const [groups] = useState(
    JSON.parse(localStorage.getItem("groupsList")) || []
  );

  const [equalSplitData, setEqualSplitData] = useState([]);
  const [customSplitData, setCustomSplitData] = useState([]);

  // JOI VALIDATION SCHEMA
  const schema = Joi.object({
    date: Joi.date().iso().max("now").required().label("Date"),
    amount: Joi.number().min(1).required().label("Amount"),
    description: Joi.string().min(3).allow("").label("Description"),
    category: Joi.string().min(3).required().label("Category"),
    type: Joi.string().required(),
    selectedGroup: Joi.string().when("type", {
      is: "group",
      then: Joi.string().required().label("Group"),
      otherwise: Joi.string().allow(""),
    }),
    selectedSplit: Joi.string().when("type", {
      is: "group",
      then: Joi.string().required().label("Split Type"),
      otherwise: Joi.string().allow(""),
    }),
  });

  const categorySchema = Joi.string().min(3).max(20).required().messages({
    "string.empty": "Category name is required",
    "string.min": "Category must be at least 3 characters",
    "string.max": "Category must be less than 20 characters",
  });

  const validateCategory = () => {
    const result = categorySchema.validate(newCategory);
    if (result.error) {
      setError(result.error.details[0].message);
      return false;
    }
    setError("");
    return true;
  };

  // VALIDATION
  const validateField = () => {
    const formData = {
      date,
      amount: amount ? Number(amount) : "",
      description,
      category,
      type,
      selectedGroup,
      selectedSplit,
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

  // HELPERS
  const getGroupMembers = () => {
    if (type !== "group") return [];
    return groups.find((g) => g.name === selectedGroup)?.members || [];
  };

  const calculateEqualSplit = (members) => {
    const split = Number(amount) / members.length;
    return members.map((m) => ({ name: m, amount: split.toFixed(2) }));
  };

  const calculateCustomSplit = (members) => {
    return members.map((m) => ({ name: m, amount: "" }));
  };

  const getSplitAmounts = (members) => {
    if (selectedSplit === "equal") {
      const result = {};
      members.forEach((m) => (result[m] = Number(amount) / members.length));
      return result;
    }

    if (selectedSplit === "custom") {
      const result = {};
      customSplitData.forEach((item) => {
        result[item.name] = Number(item.amount || 0);
      });
      return result;
    }

    return null;
  };

  const validateCustomSplitAmount = () => {
    if (selectedSplit !== "custom") return true;

    const totalCustom = customSplitData.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    if (totalCustom !== Number(amount)) {
      alert("Total split amount must match the total amount.");
      return false;
    }
    return true;
  };

  const clearError = (field) => {
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // CATEGORY ADD
  const addCategory = () => {
    if (!validateCategory()) return;
    const updated = [...categories, newCategory];
    setCategories(updated);
    localStorage.setItem("categories", JSON.stringify(updated));
    setCategory(newCategory);
    setNewCategory("");
  };

  // SPLIT CALCULATIONS
  useEffect(() => {
    if (type !== "group" || !selectedGroup || !amount) {
      setEqualSplitData([]);
      setCustomSplitData([]);
      return;
    }

    const members = getGroupMembers();
    if (members.length === 0) return;

    if (selectedSplit === "equal") {
      setEqualSplitData(calculateEqualSplit(members));
      setCustomSplitData([]);
    }

    if (selectedSplit === "custom") {
      setCustomSplitData(calculateCustomSplit(members));
      setEqualSplitData([]);
    }
  }, [type, selectedGroup, selectedSplit, amount]);

  const updateCustomAmount = (i, value) => {
    const updated = [...customSplitData];
    updated[i].amount = value;
    setCustomSplitData(updated);

    const totalCustom = updated.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    if (totalCustom > Number(amount)) {
      setCustomError("Custom total exceeds entered amount.");
    } else if (totalCustom < Number(amount)) {
      setCustomError(
        `Remaining: ₹${(Number(amount) - totalCustom).toFixed(2)}`
      );
    } else {
      setCustomError("");
    }
  };

  // SUBMIT
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateField()) return;
    if (!validateCustomSplitAmount()) return;

    const members = getGroupMembers();
    const splitAmounts = getSplitAmounts(members);

    const expense = {
      id: "R_" + Date.now(),
      date,
      amount: parseFloat(amount),
      description,
      category,
      type,
      group: type === "group" ? selectedGroup : null,
      groupId: type === "group" ? "G_" + Date.now() : null,
      groupMembers: type === "group" ? members : null,
      splitType: type === "group" ? selectedSplit : null,
      splitAmounts: type === "group" ? splitAmounts : null,
    };

    const existing = JSON.parse(localStorage.getItem("expenses")) || [];
    existing.push(expense);
    localStorage.setItem("expenses", JSON.stringify(existing));
    navigate("/expenses");

    onSave();
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary mb-0">
          <i className="bi bi-receipt-cutoff me-2"></i>Add Expense
        </h2>
        <button
          className="btn btn-outline-primary"
          onClick={() => navigate("/")}
        >
          <i className="bi bi-arrow-left-circle me-2"></i>Back
        </button>
      </div>
      <div className="card shadow-lg rounded-4 p-4">
        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            <div className="col-md-6">
              {/* DATE */}
              <label className="form-label fw-semibold">Date</label>
              <input
                type="date"
                className="form-control rounded-3 mb-3"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  clearError("date");
                }}
              />
              {errors.date && <p className="text-danger">{errors.date}</p>}

              {/* AMOUNT */}
              <label className="form-label fw-semibold">Amount (₹)</label>
              <input
                type="number"
                className="form-control rounded-3 mb-3"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  clearError("amount");
                }}
              />
              {errors.amount && <p className="text-danger">{errors.amount}</p>}

              {/* DESCRIPTION */}
              <label className="form-label fw-semibold">Description</label>
              <input
                type="text"
                className="form-control rounded-3 mb-3"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  clearError("description");
                }}
              />
              {errors.description && (
                <p className="text-danger">{errors.description}</p>
              )}

              {/* CATEGORY */}
              <label className="form-label fw-semibold">Category</label>
              <select
                className="form-select rounded-3 mb-2"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  localStorage.setItem("lastCategory", e.target.value);
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
                <p className="text-danger">{errors.category}</p>
              )}

              {/* ADD NEW CATEGORY */}
              <div className="d-flex gap-2 mb-4">
                <input
                  type="text"
                  className="form-control rounded-3"
                  placeholder="New Category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={addCategory}
                >
                  Add
                </button>
              </div>
              {error && <small className="text-danger">{error}</small>}
            </div>

            <div className="col-md-6">
              {/* Expense Type */}
              <label className="form-label fw-semibold">Expense Type</label>
              <select
                className="form-select rounded-3 mb-3"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="personal">Personal</option>
                <option value="group">Group</option>
              </select>

              {/* GROUP SELECT */}
              {type === "group" && (
                <>
                  <label className="form-label fw-semibold">Select Group</label>
                  <select
                    className="form-select rounded-3 mb-3"
                    value={selectedGroup}
                    onChange={(e) => {
                      setSelectedGroup(e.target.value);
                      clearError("selectedGroup");
                    }}
                  >
                    <option value="">Choose Group</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.name}>
                        {g.name}
                      </option>
                    ))}
                  </select>

                  {errors.selectedGroup && (
                    <p className="text-danger mb-2">{errors.selectedGroup}</p>
                  )}

                  {/* SPLIT TYPE */}
                  <label className="form-label fw-semibold">Split Type</label>
                  <select
                    className="form-select rounded-3 mb-3"
                    value={selectedSplit}
                    onChange={(e) => {
                      setSelectedSplit(e.target.value);
                      clearError("selectedSplit");
                    }}
                  >
                    <option value="">Choose Split Type</option>
                    <option value="equal">Equal Split</option>
                    <option value="custom">Custom Split</option>
                  </select>
                  {errors.selectedSplit && (
                    <p className="text-danger">{errors.selectedSplit}</p>
                  )}
                </>
              )}

              {/* Equal Split*/}
              {selectedSplit === "equal" && equalSplitData.length > 0 && (
                <div className="card p-3 mt-2">
                  <h6 className="fw-bold text-primary mb-2">Equal Split</h6>
                  {equalSplitData.map((item, i) => (
                    <div
                      key={i}
                      className="d-flex justify-content-between py-1"
                    >
                      <span>{item.name}</span>
                      <span>₹{item.amount}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Custom Split */}
              {selectedSplit === "custom" && customSplitData.length > 0 && (
                <div className="card p-3 mt-2">
                  <h6 className="fw-bold text-primary mb-3">Custom Split</h6>

                  {customSplitData.map((item, i) => (
                    <div
                      key={i}
                      className="d-flex justify-content-between align-items-center mb-2"
                    >
                      <span>{item.name}</span>
                      <input
                        type="number"
                        className="form-control w-25"
                        placeholder="Amount"
                        value={item.amount}
                        onChange={(e) => updateCustomAmount(i, e.target.value)}
                      />
                    </div>
                  ))}

                  {customError && (
                    <p className="text-danger fw-bold mt-2">{customError}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="text-end mt-4">
            <button className="btn btn-primary btn-lg px-4" type="submit">
              <i className="bi bi-check-circle me-2"></i>
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
