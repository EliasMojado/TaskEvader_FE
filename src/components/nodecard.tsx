import React from 'react';
import { Node } from '../services/nodes';
import { CollaboratorProfile } from '../services/profile';

interface NodeCardProps {
  node: Node & { collaboratorProfiles?: CollaboratorProfile[] };
  profile: any;
  level?: number;
  expandedNodes: number[];
  toggleNodeExpansion: (nodeId: number) => void;
}

const NodeCard: React.FC<NodeCardProps> = ({ 
  node, 
  profile, 
  level = 0, 
  expandedNodes, 
  toggleNodeExpansion 
}) => {
  const isExpanded = expandedNodes.includes(node.id);
  const hasChildren = node.children && node.children.length > 0;
  
  // Calculate indentation based on level
  const indentationStyle = {
    marginLeft: `${level * 20}px`
  };

  return (
    <div className="mb-3">
      <div 
        className="py-4 bg-white border-b-2 border-black hover:bg-gray-50 cursor-pointer"
        style={indentationStyle}
      >
        <div className="flex items-center">
          {/* Expand/collapse button for nodes with children */}
          {hasChildren && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleNodeExpansion(node.id);
              }}
              className="mr-2 w-5 h-5 flex items-center justify-center"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d={isExpanded ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"}
                />
              </svg>
            </button>
          )}
          
          {/* For nodes without children, add empty space for alignment */}
          {!hasChildren && <div className="w-7"></div>}
          
          <div className="flex-grow">
            <h2 className="text-xl font-semibold">{node.title}</h2>
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
          </div>
          
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
        
        {/* Progress bar for subtasks */}
        {node.children.length > 0 && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1 max-w-md">
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
      
      {/* Render children if expanded */}
      {isExpanded && hasChildren && node.children.map(childNode => (
        <NodeCard
          key={childNode.id}
          node={childNode as Node & { collaboratorProfiles?: CollaboratorProfile[] }}
          profile={profile}
          level={level + 1}
          expandedNodes={expandedNodes}
          toggleNodeExpansion={toggleNodeExpansion}
        />
      ))}
    </div>
  );
};

export default NodeCard;