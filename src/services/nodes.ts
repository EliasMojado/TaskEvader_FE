import { API_BASE_URL } from '../constants';

export interface Node {
  id: number;
  title: string;
  description: string;
  deadline: string | null;
  priority: number;
  status: 'ongoing' | 'missed' | 'completed';
  parent: number | null;
  children: Node[];
  collaborators: number[];
  completed_subtasks: number;
  created_at: string;
  updated_at: string;
}

export const getRootNodes = async (): Promise<Node[]> => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    throw new Error('Authentication token not found');
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/nodes/roots/`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching root nodes:', error);
    throw new Error(error.message || 'Failed to fetch root nodes');
  }
};