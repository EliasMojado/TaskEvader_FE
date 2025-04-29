// ProjectPage.tsx
import React, { useState } from "react";
import { mockProject } from "../data/mockData";
import { Task } from "../data/types";
import SlidingForm from "./SlidingForm"; // <-- Import SlidingForm component
import '../styles/list.css';

const isOverdue = (dueDate: string) => {
  return new Date(dueDate) < new Date();
};

const ProjectPage: React.FC = () => {
  const project = mockProject;

  const [formOpen, setFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleOpenForm = (task: Task) => {
    setSelectedTask(task);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedTask(null);
  };

  const renderTask = (task: Task, depth: number = 0) => {
    const completedSubtasks = task.subtasks.filter((t) => t.isCompleted).length;
    const totalSubtasks = task.subtasks.length;

    return (
      <div className="task-container" style={{ position: 'relative', marginLeft: depth * 20, marginTop: 10 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <input type="checkbox" checked={task.isCompleted} readOnly />
          <div style={{ marginLeft: 10, position: 'relative' }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <strong style={{ textDecoration: task.isCompleted ? "line-through" : "none" }}>
                {task.name}
              </strong>
              {task.name === "Samgyupsal" && (
                <span style={{ color: "red", marginLeft: 5 }}>🔥</span>
              )}
            </div>
            <small style={{ color: isOverdue(task.dueDate) ? "red" : "gray" }}>
              {new Date(task.dueDate).toLocaleString()}
            </small>

            <div style={{ display: "flex", marginTop: 5 }}>
              {task.assignedUsers.map((user) => (
                <img
                  key={user.id}
                  src={user.avatar}
                  alt={user.name}
                  style={{ width: 24, height: 24, borderRadius: "50%", marginRight: 5 }}
                />
              ))}
            </div>

            {totalSubtasks > 0 && (
              <div style={{ background: "#eee", width: 150, height: 8, borderRadius: 4, marginTop: 5 }}>
                <div
                  style={{
                    background: "#ffc107",
                    width: `${(completedSubtasks / totalSubtasks) * 100}%`,
                    height: "100%",
                    borderRadius: 4,
                  }}
                />
              </div>
            )}

            {/* Hover button */}
            <button
              onClick={() => handleOpenForm(task)}
              className="add-subtask-btn"
            >
              +
            </button>
          </div>
        </div>

        {/* Subtasks */}
        {task.subtasks.map((subtask) => renderTask(subtask, depth + 1))}
      </div>
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>{project.name}</h2>
      <small style={{ color: isOverdue(project.dueDate) ? "red" : "gray" }}>
        {new Date(project.dueDate).toLocaleString()}
      </small>
      <div style={{ marginTop: 20 }}>
        {project.tasks.map((task) => renderTask(task))}
      </div>

      {/* Render SlidingForm if formOpen is true */}
      {formOpen && selectedTask && (
        <SlidingForm task={selectedTask} onClose={handleCloseForm} />
      )}
    </div>
  );
};

export default ProjectPage;
