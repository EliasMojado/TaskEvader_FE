import React, { useState } from "react";
import { Task, User } from "../data/types";
import "../styles/SlidingForm.css";
import plus from '../../public/plus.png';

// Mock available users (this would usually come from a backend or props)
const allUsers: User[] = [
  { id: 1, name: "Alice", avatar: "https://i.pravatar.cc/150?u=alice" },
  { id: 2, name: "Bob", avatar: "https://i.pravatar.cc/150?u=bob" },
  { id: 3, name: "Charlie", avatar: "https://i.pravatar.cc/150?u=charlie" },
  { id: 4, name: "David", avatar: "https://i.pravatar.cc/150?u=david" }
];

interface SlidingFormProps {
  task: Task | null;
  onClose: () => void;
}

const SlidingForm: React.FC<SlidingFormProps> = ({ task, onClose }) => {
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [subtaskDescription, setSubtaskDescription] = useState("");
  const [dueDate, setDueDate] = useState<string>("");
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleCreate = () => {
    if (task && subtaskTitle) {
      const newSubtask: Task = {
        id: Date.now(), // simple ID generation; you might replace this later
        name: subtaskTitle,
        dueDate,
        isCompleted: false,
        assignedUsers,
        subtasks: []
      };
      console.log("Created Subtask:", newSubtask);
      // Here, you might want to actually update the parent's subtasks list
      onClose();
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddRemoveUser = (user: User) => {
    setAssignedUsers((prev) => {
      const isAlreadyAssigned = prev.some((u) => u.id === user.id);
      if (isAlreadyAssigned) {
        return prev.filter((u) => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const filteredUsers = allUsers.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="sliding-form">
      <h2>Add Subtask</h2>
      <p>Parent Task: {task?.name}</p>
      <input
        type="text"
        placeholder="Subtask Title"
        value={subtaskTitle}
        onChange={(e) => setSubtaskTitle(e.target.value)}
      />
      <textarea
        placeholder="Subtask Description (optional)"
        value={subtaskDescription}
        onChange={(e) => setSubtaskDescription(e.target.value)}
      />
      <input
        type="datetime-local"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />

      <div className="assigned-users">
        <h3>Assigned Users</h3>
        <div className="collaborator-list">
          {assignedUsers.map((user) => (
            <div className="collaborator-item" key={user.id}>
              <img
                src={user.avatar}
                alt={user.name}
                title={user.name}
                className="collaborator-avatar"
                onClick={() => handleAddRemoveUser(user)}
              />
            </div>
          ))}
          <button onClick={() => setShowModal(true)} className="add-collaborator-btn">
            <img src={plus} alt="Add" className="plus-icon" />
          </button>
        </div>
      </div>

      <div className="buttons">
        <button onClick={onClose}>Cancel</button>
        <button onClick={handleCreate}>Create</button>
      </div>

      {/* Modal for selecting users */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Select Users</h3>
            <input
              type="text"
              placeholder="Search users"
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
            <ul className="collaborator-list">
              {filteredUsers.map((user) => (
                <li key={user.id} className="collaborator-item">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    title={user.name}
                    className="collaborator-avatar"
                    onClick={() => handleAddRemoveUser(user)}
                  />
                  <span>{user.name}</span>
                </li>
              ))}
            </ul>
            <button onClick={() => setShowModal(false)} className="close-modal-btn">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlidingForm;
