// types.ts

export interface User {
  id: number;
  display_name: string;
  email: string;
  profile_pic: string | null;
}

export type Priority = "Low" | "Medium" | "High";
export type Status = "Not Started" | "In Progress" | "Completed";

export interface Task {
  id: number;
  name: string;
  dueDate: string;
  isCompleted: boolean;
  assignedUsers: User[];
  parent?: number; // Optional parent task ID (undefined means it's a root-level task)
  priority: Priority;
  status: Status;
}

export interface Project {
  id: number;
  name: string;
  dueDate: string;
  members: User[];
  tasks: Task[]; // Flat list of tasks, some with parent relationships
}
