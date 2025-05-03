import { API_BASE_URL } from '../constants';
import {getUserProfileById} from "./profile.ts";
import {HeaderAuth} from "./auth.ts";

export interface Node {
  id: number;
  title: string;
  description: string;
  deadline: string | null;
  priority: number;
  status: 'ongoing' | 'missed' | 'done';
  parent_id: number | null;
  children: Node[];
  collaborators: number[];  // Assuming these are IDs of the collaborators
  completed_subtasks: number;
  ongoing_subtasks: number;
  missed_subtasks: number;
  created_at: string;
  updated_at: string;
  icon?: string;
}

export interface CreateNodePayload {
  title: string;
  description: string;
  deadline: string | null;
  priority: number;
  status: 'ongoing' | 'missed' | 'completed';
  parent_id?: number | null;  // Parent node ID if this node is a child of another
  collaborators: number[];  // Assuming collaborators are specified by their IDs
  completed_subtasks: number;  // The initial count of completed subtasks
}

export const getRootNodes = async (): Promise<Node[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/nodes/roots/`, {
      method: 'GET',
      headers: await HeaderAuth(),
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

// Add this new function to get a specific node by ID
export const getNodeData = async (id: number | string): Promise<Node> => {
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/nodes/${id}/`, {
      method: 'GET',
      headers: await HeaderAuth()
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error(`Error fetching node with ID ${id}:`, error);
    throw new Error(error.message || `Failed to fetch node with ID ${id}`);
  }
};

export const createNode = async (payload: CreateNodePayload): Promise<Node> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/nodes/`, {
      method: 'POST',
      headers: await HeaderAuth(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Error response:", errorData);  // Log the detailed error response
      throw new Error(errorData.message || `Failed to create node (Status: ${response.status})`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error creating node:', error);
    throw new Error(error.message || 'Failed to create node');
  }
};

export const deleteNode = async (id: number | string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/nodes/${id}/`, {
      method: 'DELETE',
      headers: await HeaderAuth(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete node (Status: ${response.status})`);
    }
  } catch (error: any) {
    console.error(`Error deleting node ${id} with children:`, error);
    throw new Error(error.message || 'Failed to delete node and its children');
  }
};

export const fetchSpecificNodeWithCollaborator = async (id: number) => {
  try {
    // Fetch basic root nodes
    const node = await getNodeData(id);

    const collaboratorProfiles = await Promise.all(
        node.collaborators.map(async (userId) => {
          try {
            return await getUserProfileById(userId);
          } catch (err) {
            console.error(`Failed to fetch profile for user ${userId}:`, err);
            // Return a default profile on error
            return { display_name: `User ${userId}`, profile_pic: null, id: userId };
          }
        })
    );

    return { ...node, collaboratorProfiles };
  } catch (err: any) {
    // Check if this is a 404 error (node not found / no access)
    if (err.message && (err.message.includes('404') || err.message.includes('No Node matches'))) {
      console.log(`User does not have access to node ${id}, skipping`);
      return null; // Return null to indicate this node should be skipped
    }
    
    console.error(`Error fetching collaborator profiles for node ${id}:`, err);
    // Return node with empty collaborator profiles for other errors
    return { id, collaboratorProfiles: [], children: [] };
  }
};

export const updateNode = async (id: number, payload: Partial<Node>): Promise<Node> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/nodes/${id}/`, {
      method: 'PATCH',
      headers: await HeaderAuth(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update node (Status: ${response.status})`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error(`Error updating node ${id}:`, error);
    throw new Error(error.message || `Failed to update node ${id}`);
  }
}