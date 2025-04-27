import { API_BASE_URL } from '../constants';

export interface UserProfile {
  username: string;
  display_name?: string;
  profile_pic?: string;
}

export interface CollaboratorProfile {
    display_name: string;
    profile_pic: string | null;
}  

export const getUserProfile = async (): Promise<UserProfile> => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    throw new Error('Authentication token not found');
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/account/`, {
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
    console.error('Error fetching user profile:', error);
    throw new Error(error.message || 'Failed to fetch user profile');
  }
};

export const getUserProfileById = async (userId: number): Promise<CollaboratorProfile> => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/${userId}/`, {
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
      console.error(`Error fetching profile for user ID ${userId}:`, error);
      throw new Error(error.message || `Failed to fetch profile for user ID ${userId}`);
    }
  };