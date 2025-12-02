import React, { useState, useEffect } from "react";
import Joi from "joi";

export default function CreateGroup() {
  const creator = "You";
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const [newMember, setNewMember] = useState("");
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    setGroups(JSON.parse(localStorage.getItem("groupsList")) || []);
    setMembers(JSON.parse(localStorage.getItem("membersList")) || []);

    fetch("https://dummyjson.com/users?limit=10")
      .then((res) => res.json())
      .then((data) => {
        const mappedUsers = data.users.map((user) => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
        }));
        setUsers(mappedUsers);
      })
      .catch((err) => console.log("Error fetching users:", err));
  }, []);

  //  Add multiple members with comma + prevent duplicates + cannot add creator manually
  const addMember = () => {
    let inputMembers = [];

    if (newMember.trim()) {
      inputMembers = newMember
        .split(",")
        .map((m) => m.trim())
        .filter((m) => m !== "");
    }

    if (selectedUser && !inputMembers.includes(selectedUser)) {
      inputMembers.push(selectedUser);
    }

    if (inputMembers.length === 0) return;

    const filtered = inputMembers.filter(
      (m) => !members.includes(m) && m.toLowerCase() !== creator.toLowerCase()
    );

    if (filtered.length === 0) {
      setNewMember("");
      setSelectedUser("");
      return;
    }

    const updated = [...members, ...filtered];
    setMembers(updated);
    localStorage.setItem("membersList", JSON.stringify(updated));
    setNewMember("");
    setSelectedUser("");
  };

  const deleteMember = (name) => {
    const updated = members.filter((m) => m !== name);
    setMembers(updated);
    localStorage.setItem("membersList", JSON.stringify(updated));
  };

  const createGroup = () => {
    const { error } = schema.validate(
      {
        groupName,
        members,
      },
      { abortEarly: false }
    );

    if (error) {
      setError(error.details[0].message);
      return;
    }

    const isDuplicate = groups.some(
      (g) => g.name.toLowerCase() === groupName.toLowerCase()
    );

    if (isDuplicate) {
      setError("Group name already exists");
      return;
    }

    const finalMembers = members.includes(creator)
      ? members
      : [creator, ...members];

    const newGroup = {
      id: Date.now(),
      name: groupName,
      members: finalMembers,
    };

    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    localStorage.setItem("groupsList", JSON.stringify(updatedGroups));

    alert("Group Created Successfully!");

    setGroupName("");
    setMembers([]);
    localStorage.removeItem("membersList");
    setError("");
  };

  const deleteGroup = (id) => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;

    const updated = groups.filter((g) => g.id !== id);
    setGroups(updated);
    localStorage.setItem("groupsList", JSON.stringify(updated));
  };

  const schema = Joi.object({
    groupName: Joi.string()
      .trim()
      .min(3)
      .regex(/^[A-Za-z\s]+$/)
      .required()
      .label("Group Name")
      .messages({
        "string.empty": "Group name cannot be empty",
        "string.min": "Group name must be at least 3 characters",
        "string.pattern.base": "Group name should contain only letters",
      }),
    members: Joi.array()
      .items(
        Joi.string()
          .trim()
          .regex(/^[A-Za-z\s]+$/)
          .messages({
            "string.empty": "Member name cannot be empty",
            "string.pattern.base": "Member name must contain only letters",
          })
      )
      .min(1)
      .required()
      .messages({
        "array.min": "At least 2 members are required",
      }),
  });

  return (
    <div className="container mt-5">
      <h2 className="fw-bold text-primary mb-4 d-flex align-items-center">
        <i className="bi bi-people-fill me-2 fs-2"></i>
        Group Management
      </h2>

      {/* CREATE GROUP */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h4 className="fw-bold mb-3">
            <i className="bi bi-collection me-2"></i>Create Group
          </h4>

          <div className="mb-3">
            <label className="form-label fw-semibold">Group Name</label>
            <input
              type="text"
              className="form-control rounded-3"
              placeholder="e.g., Family Trip"
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value);
                setError("");
              }}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Members Added</label>
            <div className="p-3 border rounded-3">
              {members.length === 0 && (
                <p className="text-muted">No members added yet.</p>
              )}

              {members.map((m, i) => (
                <span key={i} className="badge bg-primary me-2 mb-2 p-2 fs-6">
                  {m}
                  <i
                    className="bi bi-x-circle ms-2"
                    style={{ cursor: "pointer" }}
                    onClick={() => deleteMember(m)}
                  ></i>
                </span>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Select Members</label>

            <div className="dropdown">
              <button
                className="btn btn-outline-primary dropdown-toggle w-100 text-start"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Select members
              </button>

              <ul className="dropdown-menu p-2" style={{ width: "100%" }}>
                {users.map((user) => (
                  <li
                    key={user.id}
                    className="dropdown-item d-flex align-items-center"
                  >
                    <input
                      type="checkbox"
                      className="form-check-input me-2"
                      checked={members.includes(user.name)}
                      onChange={() => {
                        if (members.includes(user.name)) {
                          setMembers(members.filter((m) => m !== user.name));
                        } else {
                          setMembers([...members, user.name]);
                        }
                      }}
                    />
                    <label className="form-check-label">{user.name}</label>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <h4 className="fw-bold mb-3">
            <i className="bi bi-person-plus-fill me-2"></i>Manage Users
          </h4>

          <div className="d-flex">
            <input
              type="text"
              className="form-control rounded-3 me-2"
              placeholder="Add user name (comma separated)"
              value={newMember}
              onChange={(e) => setNewMember(e.target.value)}
            />
            <button className="btn btn-outline-primary" onClick={addMember}>
              Add
            </button>
          </div>

          <button className="btn btn-primary mt-3 mb-3" onClick={createGroup}>
            <i className="bi bi-check-circle me-2"></i>Create Group
          </button>
        </div>
        {error && <p className="text-danger fw-bold mt-2">{error}</p>}
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <h4 className="fw-bold mb-3">
            <i className="bi bi-list-ul me-2"></i>Existing Groups
          </h4>

          {groups.length === 0 && (
            <p className="text-muted">No groups created yet.</p>
          )}

          {groups.map((g) => (
            <div
              key={g.id}
              className="border rounded p-3 mb-3 bg-light shadow-sm"
            >
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="fw-bold mb-0">{g.name}</h5>

                <button
                  className="btn btn-sm btn-danger rounded-circle"
                  onClick={() => deleteGroup(g.id)}
                >
                  <i className="bi bi-trash-fill"></i>
                </button>
              </div>

              <p className="mb-1 fw-semibold mt-2">Members:</p>
              {g.members.map((m, i) => (
                <span key={i} className="badge bg-secondary me-2 p-2">
                  {m}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
