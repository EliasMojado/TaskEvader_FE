import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCompleteProfile, updateUserProfile, CompleteUserProfile } from '../services/profile';
import logo from '../../public/logo.png';

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<CompleteUserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form states for user profile
  const [displayName, setDisplayName] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [newProfilePic, setNewProfilePic] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompleteProfile = async () => {
      try {
        setLoading(true);
        const userProfile = await getCompleteProfile();
        setProfile(userProfile);
        
        // Initialize form states with profile data
        setDisplayName(userProfile.display_name || '');
        setFirstName(userProfile.first_name || '');
        setLastName(userProfile.last_name || '');
        setEmail(userProfile.email || '');
        setProfilePic(userProfile.profile_pic || null);
      } catch (err: any) {
        console.error('Failed to fetch profile:', err);
        setError(err.message || 'Failed to load user profile');
        
        // If unauthorized, redirect to login
        if (err.message?.includes('Authentication token not found') || err.message?.includes('401')) {
          localStorage.removeItem('authToken');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCompleteProfile();
  }, [navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewProfilePic(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Create form data for multipart/form-data submission
      const formData = new FormData();
      
      // Only add fields that have changed
      if (displayName !== profile?.display_name) {
        formData.append('display_name', displayName);
      }
      
      if (firstName !== profile?.first_name) {
        formData.append('first_name', firstName);
      }
      
      if (lastName !== profile?.last_name) {
        formData.append('last_name', lastName);
      }
      
      if (email !== profile?.email) {
        formData.append('email', email);
      }
      
      if (newProfilePic) {
        formData.append('profile_pic', newProfilePic);
      }
      
      // Only make the request if there are changes
      if (formData.has('display_name') || formData.has('first_name') || 
          formData.has('last_name') || formData.has('email') || formData.has('profile_pic')) {
        
        const updatedProfile = await updateUserProfile(formData);
        setProfile(updatedProfile);
        setProfilePic(updatedProfile.profile_pic || null);
        setSuccessMessage('Profile updated successfully!');
        
        // Clear the file input
        setNewProfilePic(null);
        setPreviewUrl(null);
      } else {
        setSuccessMessage('No changes to update');
      }
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err.message || 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const navigateToChangePassword = () => {
    navigate('/change-password');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading profile...</div>;
  }

  if (error && !profile) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }

  return (
    <div className="mx-20 my-5">
      <div className='flex flex-row justify-between items-center mb-8'>
        <img 
          src={logo} 
          alt="Task Evader Interface" 
          className="max-h-[50px] object-contain cursor-pointer"
          onClick={() => navigate('/home')}
        />
        <button
          onClick={handleLogout}
          className="bg-custom-lightred text-white py-2 px-4 rounded-md"
        >
          Logout
        </button>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Your Profile</h1>
        
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Profile Information Form */}
        <form onSubmit={handleSubmit} className="space-y-6 mb-12">
          <div className="flex flex-col items-center mb-6">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-custom-blue mb-4">
              {(previewUrl || profilePic) ? (
                <img 
                  src={previewUrl || profilePic || ''} 
                  alt="Profile Preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-500 text-xl font-bold">{profile?.username?.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
            
            <label className="bg-custom-blue hover:bg-blue-300 text-white py-2 px-4 rounded cursor-pointer transition-colors">
              Choose Profile Picture
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
            </label>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={profile?.username || ''}
              disabled
              className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
            />
            <p className="text-xs text-gray-500">Username cannot be changed</p>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md bg-white"
              placeholder="Enter your display name"
            />
            <p className="text-xs text-gray-500">This is the name shown to other users</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md bg-white"
                placeholder="Enter your first name"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md bg-white"
                placeholder="Enter your last name"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md bg-white"
              placeholder="Enter your email"
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-3 bg-custom-red text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Update Profile
          </button>
        </form>

        {/* Security Section with Change Password Button */}
        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Security</h2>
          
          <div className="flex justify-center">
            <button
              onClick={navigateToChangePassword}
              className="px-6 py-3 bg-custom-blue text-white rounded-md hover:bg-blue-400 transition-colors"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;