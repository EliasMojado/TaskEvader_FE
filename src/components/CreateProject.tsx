import React, { useState, useEffect } from "react";
import { Task, User } from "../data/types"; 
import "../styles/SlidingForm.css";
import plus from "../../public/plus.png";
import { searchUsers, getAllUserProfiles } from "../services/profile";

interface CreateProjectProps {
  onClose: () => void;
  parentId?: number; // Optional parent task ID
}

const CreateProject: React.FC<CreateProjectProps> = ({ onClose, parentId }) => {
  const [taskTitle, setTaskTitle] = useState("");
  const [description, setDescription] = useState(""); // <<-- Added description
  const [dueDate, setDueDate] = useState<string>("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [status, setStatus] = useState<"On Going" | "Missed" | "Done">("On Going");
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]); // State to store users
  const [loading, setLoading] = useState<boolean>(true); // Loading state

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchTerm.trim() === "") {
        setAllUsers([]); // optionally clear list when search is empty
        return;
      }
  
      try {
        const users = await searchUsers(searchTerm);
        setAllUsers(users);
      } catch (err) {
        console.error("Error searching users:", err);
      }
    };
  
    const delayDebounce = setTimeout(() => {
      fetchSearchResults();
    }, 300); // debounce delay (ms)
  
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);
   // Empty dependency array means this effect runs once when the component mounts

  const handleCreate = () => {
    if (taskTitle) {
      const newTask: Task = {
        id: Date.now(),
        name: taskTitle,
        description, // <<-- Include description
        dueDate,
        isCompleted: status === "Done",
        assignedUsers,
        priority,
        status,
        ...(parentId !== undefined && { parent: parentId })
      };
      console.log("Created Task:", newTask);
      onClose();
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
  };

  const filteredUsers = allUsers.filter((user) =>
    user.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {/* Priority Selector */}
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

      {/* Status Selector - only show if creating a subtask */}
      {parentId !== undefined && (
        <div className="status-selector">
          <label htmlFor="status">Status:</label>
          <select
            id="status"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "On Going" | "Missed" | "Done")
            }
          >
            <option value="On Going">On Going</option>
            <option value="Missed">Missed</option>
            <option value="Done">Done</option>
          </select>
        </div>
      )}

      {/* Assigned Users */}
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
