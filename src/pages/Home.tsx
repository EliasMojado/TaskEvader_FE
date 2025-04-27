import React, { useEffect, useState } from 'react';
import { getUserProfile, UserProfile, getUserProfileById, CollaboratorProfile } from '../services/profile';
import { getRootNodes, Node } from '../services/nodes';
import { useNavigate } from 'react-router-dom';
import logo from '../../public/logo.png';

// Define status type for better type safety
type Status = 'all' | 'ongoing' | 'missed' | 'completed';

// Define enhanced node type with collaborator profiles
interface EnhancedNode extends Node {
  collaboratorProfiles?: CollaboratorProfile[];
}

const Home: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<Status>('all'); // Default status is 'all'
    const [nodes, setNodes] = useState<EnhancedNode[]>([]);
    const [nodesLoading, setNodesLoading] = useState<boolean>(true);
    const [nodesError, setNodesError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                const userProfile = await getUserProfile();
                setProfile(userProfile);
                console.log('User profile fetched successfully:', userProfile);
            } catch (err: any) {
                console.error('Failed to fetch profile:', err);
                setError(err.message || 'Failed to load user profile');
                
                localStorage.removeItem('authToken');
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [navigate]);

    useEffect(() => {
        const fetchRootNodesWithCollaborators = async () => {
            try {
                setNodesLoading(true);
                // Fetch basic root nodes
                const rootNodes = await getRootNodes();
                
                // For each node, fetch collaborator profiles
                const enhancedNodes = await Promise.all(
                    rootNodes.map(async (node) => {
                        // Skip if no collaborators
                        if (!node.collaborators || node.collaborators.length === 0) {
                            return { ...node, collaboratorProfiles: [] };
                        }
                        
                        try {
                            // Fetch collaborator profiles in parallel
                            const collaboratorProfiles = await Promise.all(
                                node.collaborators.map(async (userId) => {
                                    try {
                                        return await getUserProfileById(userId);
                                    } catch (err) {
                                        console.error(`Failed to fetch profile for user ${userId}:`, err);
                                        // Return a default profile on error
                                        return { display_name: `User ${userId}`, profile_pic: null };
                                    }
                                })
                            );
                            
                            return { ...node, collaboratorProfiles };
                        } catch (err) {
                            console.error(`Error fetching collaborator profiles for node ${node.id}:`, err);
                            // Return node with empty collaborator profiles if fetch fails
                            return { ...node, collaboratorProfiles: [] };
                        }
                    })
                );
                
                setNodes(enhancedNodes);
                console.log('Enhanced nodes with collaborators:', enhancedNodes);
            } catch (err: any) {
                console.error('Failed to fetch root nodes:', err);
                setNodesError(err.message || 'Failed to load root nodes');
            } finally {
                setNodesLoading(false);
            }
        };

        fetchRootNodesWithCollaborators();
    }, []);

    // Handle status button click
    const handleStatusChange = (newStatus: Status) => {
        setStatus(newStatus);
    };

    // Function to get button class based on active status
    const getButtonClass = (buttonStatus: Status) => {
        const baseClass = `py-1 rounded-xl border border-black text-center cursor-pointer transition-all duration-200`;
        const activeClass = status === buttonStatus ? "w-[12em] text-l scale-105 shadow-lg" : "w-[10em]";
        
        let bgClass = "";
        switch (buttonStatus) {
            case 'all':
                bgClass = "bg-white";
                break;
            case 'ongoing':
                bgClass = "bg-custom-yellow";
                break;
            case 'missed':
                bgClass = "bg-custom-lightred";
                break;
            case 'completed':
                bgClass = "bg-custom-blue";
                break;
        }
        
        return `${baseClass} ${activeClass} ${bgClass}`;
    };

    // Filter nodes based on selected status
    const filteredNodes = status === 'all' 
        ? nodes 
        : nodes.filter(node => node.status === status);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading profile...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
    }

    return (
        <div className="mx-20 my-5">
            <div className='flex flex-row justify-between items-center mb-4'>
                <img 
                    src={logo} 
                    alt="Task Evader Interface" 
                    className="max-h-[50px] object-contain"
                />

                {profile && (
                    <div>
                        <img 
                            src={profile.profile_pic} 
                            alt="Profile Picture" 
                            className="w-[3em] h-[3em] rounded-full object-cover"
                        />
                    </div>
                )}
            </div>
            
            <div className='flex flex-col mb-6 w-full px-4 items-center'>
                <h1 className="text-3xl mb-6 font-bold">Ready to get productive today{profile?.display_name ? `, ${profile.display_name} ?` : `, ${profile?.username}`}</h1>
                <h2 className="text-xl italic text-gray-500">Jump right in to one of your projects.</h2>
                <h2 className="text-l italic text-gray-500">or</h2>
                <h2 className="text-xl mb-2 italic text-gray-700 underline">Create a new one.</h2>
            </div>
            
            <div className='flex flex-row gap-4 mt-10 mb-8 justify-center'>
                <div 
                    className={getButtonClass('all')}
                    onClick={() => handleStatusChange('all')}
                >
                    All
                </div>
                <div 
                    className={getButtonClass('ongoing')}
                    onClick={() => handleStatusChange('ongoing')}
                >
                    Ongoing
                </div>
                <div 
                    className={getButtonClass('missed')}
                    onClick={() => handleStatusChange('missed')}
                >
                    Missed
                </div>
                <div 
                    className={getButtonClass('completed')}
                    onClick={() => handleStatusChange('completed')}
                >
                    Completed
                </div>
            </div>
            
            {/* Display nodes */}
            <div className="mt-8">
                <h2 className="text-2xl italic mb-4">Your Projects</h2>
                
                {nodesLoading ? (
                    <div className="text-center py-8">Loading projects...</div>
                ) : nodesError ? (
                    <div className="text-center py-8 text-red-500">Error: {nodesError}</div>
                ) : filteredNodes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        {status === 'all' 
                            ? "You don't have any projects yet." 
                            : `You don't have any ${status} projects.`}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredNodes.map(node => (
                            <div 
                                key={node.id} 
                                className={`p-4 rounded-lg border border-black`}
                            >
                                <div className="flex items-center mb-2">
                                    <h1 className="text-xl flex-grow">{node.title}</h1>
                                    <div className="flex -space-x-2 overflow-hidden">
                                        {/* Show up to 4 collaborators, excluding current user */}
                                        {node.collaboratorProfiles && node.collaboratorProfiles.length > 0 && 
                                            node.collaboratorProfiles
                                                .filter(collab => profile && collab.display_name !== profile.display_name)
                                                .slice(0, 4)
                                                .map((collab, index) => (
                                                    <div 
                                                        key={index} 
                                                        className="w-6 h-6 rounded-full border border-white overflow-hidden bg-gray-300"
                                                        title={collab.display_name}
                                                    >
                                                        {collab.profile_pic ? (
                                                            <img 
                                                                src={collab.profile_pic} 
                                                                alt={collab.display_name} 
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gray-300" />
                                                        )}
                                                    </div>
                                                ))
                                        }
                                        
                                        {/* Always show current user's avatar as last (5th) item */}
                                        {profile && (
                                            <div 
                                                className="w-6 h-6 rounded-full border-2 border-blue-400 overflow-hidden bg-gray-300"
                                                title={`You (${profile.display_name || profile.username})`}
                                            >
                                                {profile.profile_pic ? (
                                                    <img 
                                                        src={profile.profile_pic} 
                                                        alt={profile.display_name || profile.username} 
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-300" />
                                                )}
                                            </div>
                                        )}
                                        
                                        {/* Show "+X more" indicator if there are more than 4 additional collaborators (excluding self) */}
                                        {node.collaboratorProfiles && 
                                         profile && 
                                         node.collaboratorProfiles.filter(collab => collab.display_name !== profile.display_name).length > 4 && (
                                            <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center text-xs text-gray-600">
                                                +{node.collaboratorProfiles.filter(collab => collab.display_name !== profile.display_name).length - 4}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Existing deadline display */}
                                {node.deadline && (
                                    <p className={`text-sm mt-1 ${node.status === 'completed' ? 'text-gray-600' : 'text-red-500 font-medium'}`}>
                                        {new Date(node.deadline).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                )}

                                {node.children.length > 0 && (
                                    <div className="mt-2">
                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                            <div className="flex-grow bg-gray-400 rounded-full h-2.5 mr-2">
                                                <div 
                                                    className={`h-2.5 rounded-full border border-black ${
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
                                            <span className="flex-shrink-0 whitespace-nowrap">
                                                {node.completed_subtasks} / {node.children.length}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between mt-3">
                                    <span className="text-xs text-gray-500">
                                        Priority: {node.priority}
                                    </span>
                                    <span className="text-xs capitalize">
                                        {node.status}
                                    </span>
                                </div>
                            
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;