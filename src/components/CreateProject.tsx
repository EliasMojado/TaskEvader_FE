import React, { useState, useEffect } from "react";
import { Task, User } from "../data/types"; 
import "../styles/SlidingForm.css";
import plus from "../../public/plus.png";
import { searchUsers } from "../services/profile";
import { createNode } from "../services/nodes";

interface CreateProjectProps {
  onClose: () => void;
  parentId?: number;
}

const CreateProject: React.FC<CreateProjectProps> = ({ onClose, parentId }) => {
  const [taskTitle, setTaskTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<string>("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [status, setStatus] = useState<"ongoing" | "missed" | "done">("ongoing");
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Search user logic
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchTerm.trim() === "") {
        setAllUsers([]);
        return;
      }
      try {
        const users = await searchUsers(searchTerm);
        setAllUsers(users);
        console.log("Fetched users:", users);
      } catch (err) {
        console.error("Error searching users:", err);
      }
    };
    const delayDebounce = setTimeout(() => {
      fetchSearchResults();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleCreate = async () => {
    if (!taskTitle) {
      alert("Please enter a task title.");
      return;
    }
  
    // Ensure all assigned users have valid ids
    const validAssignedUsers = assignedUsers.filter(user => user.id != null);
    // console.log("Valid assigned users:", validAssignedUsers);
    // if (validAssignedUsers.length === 0) {
    //   alert("Please assign at least one valid user.");
    //   return;
    // }
  
    const payload = {
      title: taskTitle,
      description,
      deadline: dueDate || null,
      priority: priority === "High" ? 3 : priority === "Medium" ? 2 : 1,
      // Adjust the status to match Django's expected case
      status: status === "ongoing" ? "ongoing" : status === "done" ? "done" : "missed",
      parent: parentId ?? null,
      collaborators: validAssignedUsers.map((user) => user.id),
      completed_subtasks: 0,
    };
  
    try {
      const created = await createNode(payload);
      console.log("Successfully created node:", created);
      onClose();
    } catch (err: any) {
      console.error("Failed to create node:", err);
      alert("Error: " + (err.message ?? "Unknown error"));
    }
  };
  
  

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddRemoveUser = (user: User) => {
    setAssignedUsers((prev) => {
      const isAlreadyAssigned = prev.some((u) => u.id === user.id);
      return isAlreadyAssigned ? prev.filter((u) => u.id !== user.id) : [...prev, user];
    });
    console.log("Assigned users:", assignedUsers);
  };

  return (
    <div className="sliding-form">
      <h2>{parentId ? "Create Subtask" : "Create Root Task"}</h2>

      <input
        type="text"
        placeholder="Task Title"
        value={taskTitle}
        onChange={(e) => setTaskTitle(e.target.value)}
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="description-input"
      />

      <input
        type="datetime-local"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />

      <div className="priority-selector">
        <label htmlFor="priority">Priority:</label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as "Low" | "Medium" | "High")}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      {parentId !== undefined && (
        <div className="status-selector">
          <label htmlFor="status">Status:</label>
          <select
            id="status"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "ongoing" | "missed" | "done")
            }
          >
            <option value="ongoing">Ongoing</option>
            <option value="missed">Missed</option>
            <option value="done">Done</option>
          </select>
        </div>
      )}


      <div className="assigned-users">
        <h3>Assigned Users</h3>
        <div className="collaborator-list">
          {assignedUsers.map((user) => (
            <div className="collaborator-item" key={user.id}>
              <img
                src={user.profile_pic}
                alt={user.display_name}
                title={user.display_name}
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
        <button onClick={onClose} className="cancel">Cancel</button>
        <button onClick={handleCreate} className="save">Create</button>
      </div>

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
              {allUsers.map((user) => (
                <li key={user.id} className="collaborator-item">
                  <img
                    src={user.profile_pic || undefined}
                    alt={user.display_name}
                    title={user.display_name}
                    className="collaborator-avatar"
                    onClick={() => handleAddRemoveUser(user)}
                  />
                  <span>{user.display_name}</span>
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

export default CreateProject;
