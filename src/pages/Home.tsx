import React, { useEffect, useState } from 'react';
import { getUserProfile, UserProfile, getUserProfileById } from '../services/profile';
import { getRootNodes } from '../services/nodes';
import {useLocation, useNavigate} from 'react-router-dom';
import logo from '../../public/logo.png';
import CreateProject from '../components/CreateProject'; // Import the CreateProject component
import {Node as NodeCard, NodeData} from '../components/node';
import {MdPerson} from "react-icons/md"; // Import the Node component
import { STATUS } from "../constants/index.ts";

// Define status type for better type safety
type Status = 'all' | 'ongoing' | 'missed' | 'completed';

const Home: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<Status>('all'); // Default status is 'all'
    const [nodes, setNodes] = useState<NodeData[]>([]);
    const [nodesLoading, setNodesLoading] = useState<boolean>(true);
    const [nodesError, setNodesError] = useState<string | null>(null);
    const location = useLocation();
    const [showCreateProject, setShowCreateProject] = useState(false); // New state!

    const navigate = useNavigate();

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const userProfile = await getUserProfile();
            setProfile(userProfile);
            console.log('User profile fetched successfully:', userProfile);
        } catch (err: unknown) {
            console.error('Failed to fetch profile:', err);
            setError(err.message || 'Failed to load user profile');
        } finally {
            setLoading(false);
        }
    };

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
        } catch (err: never) {
            console.error('Failed to fetch root nodes:', err);
            setNodesError(err.message || 'Failed to load root nodes');
        } finally {
            setNodesLoading(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
        fetchRootNodesWithCollaborators();
    }, [location.state]);

    // useEffect(() => {
    //     fetchUserProfile();
    //     fetchRootNodesWithCollaborators();
    // }, []);

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
    const filteredNodes : NodeData[] = status === 'all'
    ? nodes 
    : status === 'completed'
        ? nodes.filter(node => node.status === 'done' || node.status === STATUS.completed)
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
                    <div
                        className='cursor-pointer'
                        onClick={() => navigate('/profile')}
                        title='Go to Profile'
                    >
                        {profile.profile_pic ?
                        <img 
                            src={profile.profile_pic} 
                            alt="Profile Picture" 
                            className="w-[3em] h-[3em] rounded-full object-cover"
                        /> : <MdPerson size={50} color={'darkgrey'}/>}
                    </div>
                )}
            </div>
            
            <div className='flex flex-col mb-6 w-full px-4 items-center'>
                <h1 className="text-3xl mb-6 font-bold">Ready to get productive today{profile?.display_name ? `, ${profile.display_name} ?` : `, ${profile?.username}`}</h1>
                <h2 className="text-xl italic text-gray-500">Jump right in to one of your projects.</h2>
                <h2 className="text-l italic text-gray-500">or</h2>
                {/* Wrap "Create a new one" in a clickable div */}
                <div 
                    className="text-xl mb-2 italic text-gray-700 underline cursor-pointer"
                    onClick={() => setShowCreateProject(true)} // <-- Open the panel
                >
                    Create a new one.
                </div>
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
                        {
                            filteredNodes.map(node => {
                                if (!node.icon) {
                                    node['icon_id'] = 1;
                                }
                                return <NodeCard
                                    nodeData={node}
                                    key={node.id}
                                    isHomePage={true}
                                />
                        }
                        )}
                    </div>
                )}
            </div>
            <div 
                className={`
                    fixed top-0 right-0 h-full w-[600px] bg-white shadow-lg 
                    transition-all duration-500 z-50
                    ${showCreateProject ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
                    ${showCreateProject ? 'pointer-events-auto' : 'pointer-events-none'}
                `}
            >
                <CreateProject 
                    onClose={() => setShowCreateProject(false)}
                />
            </div>


            {/* Dim background */}
            {showCreateProject && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setShowCreateProject(false)}
                />
            )}

        </div>
    );
};

export default Home;