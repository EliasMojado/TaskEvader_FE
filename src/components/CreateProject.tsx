import React, { useState, useEffect, useRef } from "react";
import { Task, User } from "../data/types"; 
import "../styles/SlidingForm.css";
import plus from "../../public/plus.png";
import { searchUsers } from "../services/profile";
import { createNode } from "../services/nodes";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

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
  const [selectedEmoji, setSelectedEmoji] = useState<string>("📋"); // Default emoji
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close emoji picker
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    
    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

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

    if (!dueDate) {
      alert("Please select a due date.");
      return;
    }

    // const isInvalidDueDate = !dueDate || new Date(dueDate).getTime() === 0;
    // if (isInvalidDueDate) {
    //   alert("Please select a valid due date.");
    //   return;
    // }
  
    // Ensure all assigned users have valid ids
    const validAssignedUsers = assignedUsers.filter(user => user.id != null);
  
    const payload = {
      title: taskTitle,
      description,
      deadline: dueDate || null,
      priority: priority === "High" ? 3 : priority === "Medium" ? 2 : 1,
      status: status === "ongoing" ? "ongoing" : status === "done" ? "completed" : "missed",
      parent: parentId ?? null,
      collaborators: validAssignedUsers.map((user) => user.id),
      completed_subtasks: 0,
      icon: selectedEmoji, // Add the selected emoji to the payload
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

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setSelectedEmoji(emojiData.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="sliding-form">
      <h2>{parentId ? "Create Subtask" : "Create Root Task"}</h2>

      {/* Emoji Selector */}
      <div className="emoji-selector mb-4">
        <div className="flex items-center gap-2">
          <button 
            className="text-4xl p-2 border rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            {selectedEmoji}
          </button>
          <span className="text-sm text-gray-500">Click to change icon</span>
        </div>
        
        {showEmojiPicker && (
          <div 
            ref={emojiPickerRef}
            className="absolute z-10 mt-2 shadow-lg border rounded-lg"
          >
            <EmojiPicker 
              onEmojiClick={handleEmojiClick}
              skinTonesDisabled={true}
              searchPlaceHolder="Search"
              lazyLoadEmojis={true}
              searchDisabled={false}
              width={350}
              height={350}
              previewConfig={{
                showPreview: false
              }}
            />
          </div>
        )}
      </div>

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
        min={new Date().toISOString().slice(0, 16)} // YYYY-MM-DDTHH:MM
        required
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
