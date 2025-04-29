// mockData.ts
import { Project } from './types';

export const mockProject: Project = {
  id: 1,
  name: "Sir Jace Final Exam",
  dueDate: "2025-04-30T23:59:00",
  members: [
    { id: 1, name: "Alice", avatar: "https://i.pravatar.cc/30?img=1" },
    { id: 2, name: "Bob", avatar: "https://i.pravatar.cc/30?img=2" },
    { id: 3, name: "Charlie", avatar: "https://i.pravatar.cc/30?img=3" },
    { id: 4, name: "David", avatar: "https://i.pravatar.cc/30?img=4" },
  ],
  tasks: [
    {
      id: 101,
      name: "Front End",
      dueDate: "2025-04-30T23:59:00",
      isCompleted: false,
      assignedUsers: [{ id: 1, name: "Alice", avatar: "https://i.pravatar.cc/30?img=1" }],
      subtasks: [
        {
          id: 102,
          name: "Main Page UI",
          dueDate: "2025-04-29T23:59:00",
          isCompleted: false,
          assignedUsers: [{ id: 2, name: "Bob", avatar: "https://i.pravatar.cc/30?img=2" }],
          subtasks: [],
        },
        {
          id: 103,
          name: "Data Fetching",
          dueDate: "2025-04-29T23:59:00",
          isCompleted: true,
          assignedUsers: [{ id: 3, name: "Charlie", avatar: "https://i.pravatar.cc/30?img=3" }],
          subtasks: [],
        }
      ],
    },
    {
      id: 104,
      name: "Back End",
      dueDate: "2025-04-30T23:59:00",
      isCompleted: false,
      assignedUsers: [{ id: 2, name: "Bob", avatar: "https://i.pravatar.cc/30?img=2" }, { id: 3, name: "Charlie", avatar: "https://i.pravatar.cc/30?img=3" }],
      subtasks: [],
    },
    {
      id: 105,
      name: "Samgyupsal",
      dueDate: "2025-04-26T12:00:00",
      isCompleted: false,
      assignedUsers: [
        { id: 1, name: "Alice", avatar: "https://i.pravatar.cc/30?img=1" },
        { id: 2, name: "Bob", avatar: "https://i.pravatar.cc/30?img=2" },
        { id: 3, name: "Charlie", avatar: "https://i.pravatar.cc/30?img=3" }
      ],
      subtasks: [],
    }
  ],
};
