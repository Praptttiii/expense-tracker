import React, { useState, useEffect } from "react";
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
  const [selectedSplit, setSelectedSplit] = useState("");
  const [categories, setCategories] = useState(
    JSON.parse(localStorage.getItem("categories")) || [
      "Food",
      "Bills",
      "Travel",
    ]
  );
  const [equalSplitData, setEqualSplitData] = useState([]);
  const [customSplitData, setCustomSplitData] = useState([]);
  const [groups] = useState(
    JSON.parse(localStorage.getItem("groupsList")) || []
  );
  const [customError, setCustomError] = useState("");

  // JOI VALIDATION SCHEMA
  const schema = Joi.object({
    date: Joi.date().iso().max("now").required().label("Date"),
    amount: Joi.number().min(1).required().label("Amount"),
    description: Joi.string().min(3).required().label("Description"),
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

    if (type === "group" && selectedSplit === "custom") {
      const totalCustomAmount = customSplitData.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
      );

      if (totalCustomAmount !== Number(amount)) {
        alert("Total split amount must be equal to the main amount.");
        return;
      }
    }

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
    setSelectedSplit("");
    setEqualSplitData("");
    setCustomSplitData("");
    alert("Expense Added!");
    onSave();
  };

  const clearError = (field) => {
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  useEffect(() => {
    if (type !== "group" || !selectedGroup) {
      setEqualSplitData([]);
      setCustomSplitData([]);
      return;
    }

    const groupObj = groups.find((g) => g.name === selectedGroup);
    if (!groupObj) return;

    const members = groupObj.members || [];

    if (!amount || Number(amount) <= 0) {
      setEqualSplitData([]);
      setCustomSplitData([]);
      return;
    }

    // Equal Split
    if (selectedSplit === "equal" && amount) {
      const splitAmount = Number(amount) / members.length;

      const equalData = members.map((m) => ({
        name: m,
        amount: splitAmount.toFixed(2),
      }));

      setEqualSplitData(equalData);
      setCustomSplitData([]);
    }

    // Custom Split
    if (selectedSplit === "custom") {
      const customData = members.map((m) => ({
        name: m,
        amount: "",
      }));

      setCustomSplitData(customData);
      setEqualSplitData([]);
    }
  }, [type, selectedGroup, selectedSplit, amount]);

  const updateCustomAmount = (index, value) => {
    const updated = [...customSplitData];
    updated[index].amount = value;
    setCustomSplitData(updated);
    validateCustomSplit(updated);
  };

  const validateCustomSplit = (data) => {
    const totalEntered = Number(amount);
    const totalCustom = data.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    if (totalCustom > totalEntered) {
      setCustomError("Custom split total cannot exceed the entered amount.");
    } else if (totalCustom < totalEntered) {
      setCustomError(
        `You need to assign ₹${(totalEntered - totalCustom).toFixed(
          2
        )} more to match the total amount.`
      );
    } else {
      setCustomError(""); // valid
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-lg rounded-4 p-4">
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
