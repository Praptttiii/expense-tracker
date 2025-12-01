import React, { useEffect, useState } from "react";
import Joi from "joi";

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const storedCategories =
      JSON.parse(localStorage.getItem("categories")) || [];
    setCategories(Array.isArray(storedCategories) ? storedCategories : []);
  }, []);

  const handleDelete = (catToDelete) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;

    const updated = categories.filter((cat) => cat !== catToDelete);

    setCategories(updated);
    localStorage.setItem("categories", JSON.stringify(updated));
  };

  const addNewCategory = () => {
    if (!validateCategory()) return;
    const updated = [...categories, newCategory.trim()];

    setCategories(updated);
    localStorage.setItem("categories", JSON.stringify(updated));

    setNewCategory("");
  };

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

  return (
    <div className="container mt-5">
      <div className="fw-bold text-primary mb-4 d-flex align-items-center">
        <i className="bi bi-tags-fill fs-3 me-2 text-primary"></i>
        <h2 className="fw-bold text-primary d-flex align-items-center">
          Category Management
        </h2>
      </div>

      <div className="card shadow-sm rounded-4">
        <div className="card-body">
          {categories.length === 0 ? (
            <div className="text-center text-muted py-4">
              <i className="bi bi-folder-x fs-1"></i>
              <p className="mt-2">No categories found.</p>
            </div>
          ) : (
            <ul className="list-group">
              {categories.map((cat, index) => (
                <li
                  key={index}
                  className="list-group-item d-flex justify-content-between align-items-center position-relative"
                >
                  {/* DELETE BUTTON */}
                  <button
                    className="btn btn-sm btn-danger rounded-circle position-absolute"
                    style={{ top: "10px", right: "10px" }}
                    onClick={() => handleDelete(cat)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>

                  <div className="d-flex align-items-center">
                    <i className="bi bi-bookmark-fill text-warning me-3"></i>
                    <span className="fw-semibold">{cat}</span>
                  </div>

                  <i className="bi bi-chevron-right text-secondary"></i>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ADD NEW CATEGORY */}
        <div className="d-flex gap-2 p-3">
          <input
            type="text"
            className="form-control rounded-3"
            placeholder="New Category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />{" "}
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={addNewCategory}
          >
            Add
          </button>
        </div>
        {error && <small className="text-danger">{error}</small>}
      </div>
    </div>
  );
}
