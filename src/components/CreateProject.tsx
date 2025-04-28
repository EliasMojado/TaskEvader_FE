import React, { useState } from "react";
import { Task, User } from "../data/types";
import "../styles/SlidingForm.css";
import plus from '../assets/plus.png';

// Mock available users (this would usually come from a backend or props)
const allUsers: User[] = [
  { id: 1, name: "Alice", avatar: "https://i.pravatar.cc/150?u=alice" },
  { id: 2, name: "Bob", avatar: "https://i.pravatar.cc/150?u=bob" },
  { id: 3, name: "Charlie", avatar: "https://i.pravatar.cc/150?u=charlie" },
  { id: 4, name: "David", avatar: "https://i.pravatar.cc/150?u=david" }
];

interface ProjectFormProps {
  onClose: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onClose }) => {
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [dueDate, setDueDate] = useState<string>("");
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleCreate = () => {
    if (projectTitle) {
      const newProject: Task = {
        id: Date.now(),
        name: projectTitle,
        dueDate,
        isCompleted: false,
        assignedUsers,
        subtasks: []
      };
      console.log("Created Project:", newProject);
      // Here, you might want to actually save the new project somewhere
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
      <h2>Create Project</h2>
      <input
        type="text"
        placeholder="Project Title"
        value={projectTitle}
        onChange={(e) => setProjectTitle(e.target.value)}
      />
      <textarea
        placeholder="Project Description (optional)"
        value={projectDescription}
        onChange={(e) => setProjectDescription(e.target.value)}
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
            {/* <img src={plus} alt="Add" className="plus-icon" /> */}
            +
          </button>
        </div>
      </div>

      <div className="buttons">
        <button onClick={onClose} className="cancel">Cancel</button>
        <button onClick={handleCreate} className="save">Create</button>
      </div>

      {/* Modal for selecting users */}
      {showModal && (
        <div className="modal-overlay">
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

export default ProjectForm;
