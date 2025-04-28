import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserProfile, UserProfile, getUserProfileById, CollaboratorProfile } from '../services/profile';
import { Node } from '../services/nodes';
import { API_BASE_URL } from '../constants';

// Define enhanced node type with collaborator profiles
interface EnhancedNode extends Node {
  collaboratorProfiles?: CollaboratorProfile[];
}

const Main: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [node, setNode] = useState<EnhancedNode | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userProfile = await getUserProfile();
        setProfile(userProfile);
      } catch (err: any) {
        console.error('Failed to fetch profile:', err);
        
        // If unauthorized, redirect to login
        if (err.message?.includes('Authentication token not found') || err.message?.includes('401')) {
          localStorage.removeItem('authToken');
          navigate('/login');
        }
      }
    };

    fetchUserProfile();
  }, [navigate]);

  useEffect(() => {
    const fetchNodeWithCollaborators = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        // Fetch node details
        const response = await fetch(`${API_BASE_URL}/api/nodes/${id}/`, {
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
        
        const nodeData = await response.json();
        
        // Fetch collaborator profiles if node has collaborators
        if (nodeData.collaborators && nodeData.collaborators.length > 0) {
          const collaboratorProfiles = await Promise.all(
            nodeData.collaborators.map(async (userId: number) => {
              try {
                return await getUserProfileById(userId);
              } catch (err) {
                console.error(`Failed to fetch profile for user ${userId}:`, err);
                // Return a default profile on error
                return { display_name: `User ${userId}`, profile_pic: null };
              }
            })
          );
          
          setNode({ ...nodeData, collaboratorProfiles });
        } else {
          setNode({ ...nodeData, collaboratorProfiles: [] });
        }
      } catch (err: any) {
        console.error('Failed to fetch node details:', err);
        setError(err.message || 'Failed to load node details');
        
        // If unauthorized, redirect to login
        if (err.message?.includes('Authentication token not found') || err.message?.includes('401')) {
          localStorage.removeItem('authToken');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNodeWithCollaborators();
  }, [id, navigate]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading node details...</div>;
  }

  if (error || !node) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-red-500 mb-4">Error: {error || 'Node not found'}</div>
        <button 
          onClick={() => navigate('/home')}
          className="px-4 py-2 bg-custom-blue text-white rounded-md"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="mx-20 my-5">
      {/* Back button with white background */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center text-gray-600 hover:text-gray-900 bg-white"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back to Projects
        </button>
      </div>

      <div className="max-w-4xl mx-auto">        
        <div className="py-4 bg-white border-b-2 border-black">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold pr-10">{node.title}</h2>
            <div className="flex -space-x-2 overflow-hidden">
              {/* Show collaborators */}
              {node.collaboratorProfiles && node.collaboratorProfiles.length > 0 && 
                node.collaboratorProfiles
                  .filter(collab => profile && collab.display_name !== profile.display_name)
                  .slice(0, 4)
                  .map((collab, index) => (
                    <div 
                      key={index} 
                      className="w-8 h-8 rounded-full border border-white overflow-hidden bg-gray-300"
                      title={collab.display_name}
                    >
                      {collab.profile_pic ? (
                        <img 
                          src={collab.profile_pic} 
                          alt={collab.display_name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 text-sm">
                            {collab.display_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
              }
              
              {/* Show current user */}
              {profile && (
                <div 
                  className="w-8 h-8 rounded-full border-2 border-blue-400 overflow-hidden bg-gray-300"
                  title={`You (${profile.display_name || profile.username})`}
                >
                  {profile.profile_pic ? (
                    <img 
                      src={profile.profile_pic} 
                      alt={profile.display_name || profile.username} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600 text-sm">
                        {(profile.display_name || profile.username).charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Show "+X more" indicator */}
              {node.collaboratorProfiles && 
                profile && 
                node.collaboratorProfiles.filter(collab => collab.display_name !== profile.display_name).length > 4 && (
                <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center text-xs text-gray-600">
                  +{node.collaboratorProfiles.filter(collab => collab.display_name !== profile.display_name).length - 4}
                </div>
              )}
            </div>
          </div>
          
          {/* Deadline */}
          {node.deadline && (
            <div className="mb-2">
              <span className={`${node.status === 'completed' ? 'text-gray-600' : 'text-red-500 text-sm'}`}>
                {new Date(node.deadline).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          )}

          {/* Progress bar for subtasks */}
          {node.children.length > 0 && (
            <div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1 max-w-md"> {/* Added max-w-md */}
                <div className="flex-grow bg-gray-400 rounded-full h-3 mr-2">
                    <div 
                    className={`h-3 rounded-full border border-black ${
                        node.status === 'completed' 
                        ? 'bg-custom-blue' 
                        : node.status === 'ongoing' 
                            ? 'bg-custom-yellow' 
                            : 'bg-custom-lightred'
                    }`}
                    style={{ 
                        width: `${node.children.length > 0 
                        ? (node.completed_subtasks / node.children.length) * 100 
                        : 0}%` 
                    }}
                    ></div>
                </div>
                <span className="flex-shrink-0 whitespace-nowrap font-medium">
                    {node.completed_subtasks} / {node.children.length}
                </span>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Main;