import { API_BASE_URL } from '../constants';

export interface UserProfile {
  id: number;
  username: string;
  display_name?: string;
  profile_pic?: string;
}

export interface CollaboratorProfile {
    id: number;
    display_name: string;
    profile_pic: string | null;
}  

export interface CompleteUserProfile {
  username: string;
  display_name?: string;
  profile_pic?: string | null;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface PublicUserProfile {
  id: number;
  display_name: string;
  email: string;
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


export const getCompleteProfile = async (): Promise<CompleteUserProfile> => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    throw new Error('Authentication token not found');
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/complete-profile/`, {
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
    console.error('Error fetching complete profile:', error);
    throw new Error(error.message || 'Failed to fetch complete profile');
  }
};


// Updated to work with CompleteUserProfile type
export const updateUserProfile = async (formData: FormData): Promise<CompleteUserProfile> => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    throw new Error('Authentication token not found');
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/account/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Token ${token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    throw new Error(error.message || 'Failed to update user profile');
  }
};


export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    throw new Error('Authentication token not found');
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/change-password/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `Request failed with status ${response.status}`);
    }
  } catch (error: any) {
    console.error('Error changing password:', error);
    throw new Error(error.message || 'Failed to change password');
  }
};

export const getAllUserProfiles = async (): Promise<PublicUserProfile[]> => {
  const token = localStorage.getItem('authToken');

  if (!token) {
    throw new Error('Authentication token not found');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/user-profiles/`, {
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
    console.error('Error fetching all user profiles:', error);
    throw new Error(error.message || 'Failed to fetch all user profiles');
  }
};


export const searchUsers = async (query: string): Promise<PublicUserProfile[]> => {
  const token = localStorage.getItem('authToken');

  if (!token) {
    throw new Error("Authentication token not found");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/search-users/?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch search results (status: ${response.status})`);
    }

    const data = await response.json();
    
    // Log the data to the console to see what you're getting
    console.log("Search results:", data);
    
    return data;
  } catch (error: any) {
    console.error("Search error:", error);
    throw new Error(error.message || "Failed to search users");
  }
};

