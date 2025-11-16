import React, { useState, useEffect } from "react";

export default function CreateGroup() {
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const [newMember, setNewMember] = useState("");

  useEffect(() => {
    setGroups(JSON.parse(localStorage.getItem("groupsList")) || []);
    setMembers(JSON.parse(localStorage.getItem("membersList")) || []);
  }, []);

  const addMember = () => {
    if (!newMember.trim()) return;

    const updated = [...members, newMember];
    setMembers(updated);
    localStorage.setItem("membersList", JSON.stringify(updated));
    setNewMember("");
  };

  const deleteMember = (name) => {
    const updated = members.filter((m) => m !== name);
    setMembers(updated);
    localStorage.setItem("membersList", JSON.stringify(updated));
  };

  const createGroup = () => {
    if (!groupName.trim()) return alert("Enter group name!");
    if (members.length === 0)
      return alert("Add at least one member before creating a group!");

    const newGroup = {
      id: Date.now(),
      name: groupName,
      members: [...members],
    };

    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    localStorage.setItem("groupsList", JSON.stringify(updatedGroups));

    alert("Group Created Successfully!");

    setGroupName("");
  };

  const deleteGroup = (id) => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;

    const updated = groups.filter((g) => g.id !== id);
    setGroups(updated);
    localStorage.setItem("groupsList", JSON.stringify(updated));
  };

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
              onChange={(e) => setGroupName(e.target.value)}
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
          <h4 className="fw-bold mb-3">
            <i className="bi bi-person-plus-fill me-2"></i>Manage Users
          </h4>

          <div className="d-flex">
            <input
              type="text"
              className="form-control rounded-3 me-2"
              placeholder="Add user name"
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
