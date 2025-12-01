import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="container mt-5">
      <div
        className="p-5 text-center shadow-lg rounded-4 mb-5 text-white"
        style={{
          background: "linear-gradient(135deg, #2b52efff, #09bad1ff)",
        }}
      >
        <h1 className="display-5 fw-bold">
          <span className="d-inline-flex align-items-center gap-3">
            Track Expenses Smarter 💸
          </span>
        </h1>

        <p className="mt-3 fs-5 opacity-75">
          Stay in control of your finances — track, analyze, and manage your
          spending effortlessly.
        </p>

        <Link
          to="/add-expense"
          className="btn btn-light btn-lg mt-3 fw-bold px-4 shadow-sm"
        >
          <i className="bi bi-plus-circle me-2"></i>
          Add Expense
        </Link>
      </div>

      <h3 className="text-center mb-4 fw-bold">
        Why Choose Our Expense Tracker?
      </h3>

      <div className="row text-center g-4">
        <div className="col-md-4">
          <div
            className="p-4 rounded-4 shadow-sm h-100 bg-white border"
            style={{ transition: "0.3s" }}
          >
            <i className="bi bi-pencil-square fs-1 text-primary mb-3"></i>
            <h4 className="fw-bold">
              <Link
                to="/expenses"
                className="fw-bold text-decoration-none text-dark"
              >
                Easy Expense Tracking
              </Link>
            </h4>
            <p className="text-muted">
              Add expenses in seconds with our simple and clean interface.
            </p>
          </div>
        </div>

        <div className="col-md-4">
          <div
            className="p-4 rounded-4 shadow-sm h-100 bg-white border"
            style={{ transition: "0.3s" }}
          >
            <i className="bi bi-bar-chart-line fs-1 text-primary mb-3"></i>
            <h4 className="fw-bold">
              <Link
                to="/Graph"
                className="fw-bold text-decoration-none text-dark"
              >
                Smart Summary
              </Link>
            </h4>
            <p className="text-muted">
              Get monthly reports and insights to understand your spending
              better.
            </p>
          </div>
        </div>

        <div className="col-md-4 ">
          <div
            className="p-4 rounded-4 shadow-sm h-100 bg-white border"
            style={{ transition: "0.3s" }}
          >
            <i className="bi bi-people-fill fs-1 text-primary mb-3"></i>
            <h4 className="fw-bold">
              <Link
                to="/create-group"
                className="fw-bold text-decoration-none text-dark"
              >
                Group Management
              </Link>
            </h4>
            <p className="text-muted">
              Split bills and track group expenses effortlessly with friends or
              family.
            </p>
          </div>
        </div>
      </div>
      <div className="my-5"></div>
    </div>
  );
}
