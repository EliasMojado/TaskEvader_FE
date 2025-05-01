import React, {useState} from "react";
import { Node, NodeData } from "./node.tsx";
import {fetchSpecificNodeWithCollaborator} from "../services/nodes.ts";

export const CollapsibleNode: React.FC<{ node_data: NodeData }> = ({ node_data }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [children, setChildren] = useState<NodeData[]>([]);

  const loadChildren = async () => {
    if (node_data.children && node_data.children.length > 0) {
      try {
        // Fetch all children and filter out null results (nodes user can't access)
        const fetchedChildrenResults = await Promise.all(
          node_data.children.map((childId) => fetchSpecificNodeWithCollaborator(Number(childId)))
        );
        
        // Filter out null responses (nodes the user can't access)
        const validChildren = fetchedChildrenResults.filter(child => child !== null);
        
        setChildren(validChildren);
      } catch (error) {
        console.error("Error loading children:", error);
      }
    }
  };

  return (
      <div className="flex flex-col w-full relative">
        <Node
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
            node_data={node_data}
            loadChildren={loadChildren}
        />

        {isCollapsed && children && children.length > 0 && (
            <div className="pl-10 ml-4 relative">
              {children.map((child) => (
                  child['icon_id'] = 1,
                  <div key={child.id} className={`relative`}>
                    <CollapsibleNode node_data={child} />
                  </div>
              ))}
            </div>
        )}
      </div>
  );
};