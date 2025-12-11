// src/pages/CreateTicket.jsx
import React, { useState } from "react";

const PRIORITY_OPTIONS = ["High", "Medium", "Low"];

const PriorityDropdown = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setIsOpen(false);
  };

  return (
    <div className="priority-wrapper">
      {/* Header */}
      <div
        className="priority-header"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>Priority</span>
        <span className={`priority-arrow ${isOpen ? "open" : ""}`}>▾</span>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="priority-dropdown">
          <div className="priority-row clear" onClick={handleClear}>
            <input type="checkbox" checked={value === null} readOnly />
            <span>Clear Selection</span>
          </div>

          {PRIORITY_OPTIONS.map((opt) => (
            <div
              key={opt}
              className="priority-row"
              onClick={() => handleSelect(opt)}
            >
              <input type="checkbox" checked={value === opt} readOnly />
              <span>{opt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CreateTicket = ({ onCreate }) => {
  // TicketDetail'e uyumlu state isimleri
  const [title, setTitle] = useState("");
  const [project, setProject] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState(null);
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const newTicket = {
      id: Date.now(), // backend gelince değişecek
      title,
      project,
      assignee,
      priority,
      dueDate,
      description,
      status: "OPEN",
    };

    console.log("Created Ticket:", newTicket);

    if (onCreate) onCreate(newTicket);
  };

  return (
    <div className="create-ticket-page">
      {/* Back Arrow */}
      <button className="back-button">←</button>

      <h2 className="page-title">CREATE TICKET</h2>

      <form className="ticket-form" onSubmit={handleSubmit}>
        {/* SOL TARAF */}
        <div className="left-column">

          <div className="form-row">
            <label>Title:</label>
            <input
              type="text"
              placeholder="Enter title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-row">
            <label>Project:</label>
            <input
              type="text"
              placeholder="Project name"
              value={project}
              onChange={(e) => setProject(e.target.value)}
            />
          </div>

          <div className="form-row">
            <label>Assigned to:</label>
            <input
              type="text"
              placeholder="Person / Team"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
            />
          </div>

          <div className="form-row">
            <label>Due Date:</label>
            <input
              type="date"
              className="date-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="form-row description-row">
            <label>Description:</label>
            <textarea
              placeholder="Describe the ticket..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* SAĞ TARAF */}
        <div className="right-column">
          <PriorityDropdown value={priority} onChange={setPriority} />

          <button className="create-button" type="submit">
            Create
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTicket;
