// types.ts
export interface User {
    id: number;
    name: string;
    avatar: string;
  }
  
  export interface Task {
    id: number;
    name: string;
    dueDate: string;
    isCompleted: boolean;
    assignedUsers: User[];
    subtasks: Task[];
  }
  
  export interface Project {
    id: number;
    name: string;
    dueDate: string;
    members: User[];
    tasks: Task[];
  }
  