import React, { useEffect, useState, useRef } from "react";
import { NodeData } from "./Node";
import { searchUsers } from "../services/profile";
import { updateNode } from "../services/nodes";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { getUserProfileById, getUserProfile } from "../services/profile";
import plus from "../../public/plus.png";

interface User {
  id: number;
  display_name: string;
  profile_pic: string | null;
}

interface EditNodeFormProps {
  node: NodeData;
  onClose: () => void;
  onUpdate: () => void; // Optional callback to refresh node data
  initialCollaborators: number[]; // Initial collaborators IDs
}

const EditNodeForm: React.FC<EditNodeFormProps> = ({ node, onClose, onUpdate, initialCollaborators}) => {
  const [taskTitle, setTaskTitle] = useState(node.title);
  const [description, setDescription] = useState(node.description || "");
  const [dueDate, setDueDate] = useState<string>(node.deadline || "");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [status, setStatus] = useState<"ongoing" | "missed" | "done">(node.status as any);
  const [assignedUsers, setAssignedUsers] = useState<User[]>(node.collaborators);
  const [searchTerm, setSearchTerm] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedEmoji, setSelectedEmoji] = useState<string>(node.icon ?? "📋");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadCollaborators = async () => {
      if (!node.collaborators || node.collaborators.length === 0) return;

      setLoadingProfiles(true);
      try {
        const currentUser = await getUserProfile();
        const filteredCollaboratorIds = node.collaborators.filter(id => id !== currentUser.id);
        const profiles = await Promise.all(
          filteredCollaboratorIds.map(async (id) => {
            const profile = await getUserProfileById(id);
            return profile;
          })
        );
        setAssignedUsers(profiles);
      } catch (error) {
        console.error("Error loading collaborators:", error);
      }
      setLoadingProfiles(false);
    }
    loadCollaborators();
  }
  , [node]);

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

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchTerm.trim() === "") {
        setAllUsers([]);
        return;
      }
      try {
        const users = await searchUsers(searchTerm);
        setAllUsers(users);
      } catch (err) {
        console.error("Error searching users:", err);
      }
    };
    const delayDebounce = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleSaveChanges = async () => {
    if (!taskTitle) {
      alert("Please enter a task title.");
      return;
    }
    if (!dueDate) {
      alert("Please select a due date.");
      return;
    }

    const utcDueDate = new Date(dueDate).toISOString();

    const validAssignedUsers = assignedUsers.filter((user) => user.id != null);

    const payload = {
      id: node.id,
      title: taskTitle,
      description,
      deadline: utcDueDate || null,
      priority: priority === "High" ? 3 : priority === "Medium" ? 2 : 1,
      status,
      collaborators: validAssignedUsers.map((user) => user.id),
      icon: selectedEmoji,
    };

    try {
      await updateNode(payload.id, payload);
      onUpdate?.();
      onClose();
    } catch (err: any) {
      console.error("Failed to update node:", err);
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
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setSelectedEmoji(emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const formatLocalDateTime = (isoString: string) => {
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  };

  return (
    <div className="sliding-form cursor-default">
      <h2>Edit Task</h2>

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
          <div ref={emojiPickerRef} className="absolute z-10 mt-2 shadow-lg border rounded-lg">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              skinTonesDisabled={true}
              searchPlaceHolder="Search"
              lazyLoadEmojis={true}
              width={350}
              height={350}
              previewConfig={{ showPreview: false }}
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
        value={dueDate ? formatLocalDateTime(dueDate) : ""}
        onChange={(e) => setDueDate(e.target.value)}
        min={new Date().toISOString().slice(0, 16)}
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

      <div className="status-selector mt-4">
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status:</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as "ongoing" | "missed" | "done")}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="ongoing">Ongoing</option>
          <option value="missed">Missed</option>
          <option value="done">Done</option>
        </select>
      </div>


      <div className="assigned-users">
        <h3>Assigned Users</h3>
        <div className="collaborator-list">
          {assignedUsers.map((user) => (
            <div className="collaborator-item" key={user.id}>
              <img
                src={user.profile_pic || undefined}
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
        <button onClick={handleSaveChanges} className="save">Save Changes</button>
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

export default EditNodeForm;
