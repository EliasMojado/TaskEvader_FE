import React, {useState, useEffect} from "react";
import { Node, NodeData } from "./node.tsx";

export const CollapsibleNode: React.FC<{ node_data: NodeData; onRefresh?: () => void }> = ({ node_data, onRefresh }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Log the node data structure for debugging
  useEffect(() => {
    console.log(`Rendering CollapsibleNode for ${node_data.title}`, node_data);
  }, [node_data]);

  // We don't need to fetch children since they are already in the node_data
  // This is just a placeholder function to satisfy the Node component prop
  const loadChildren = () => {
    // Children are already loaded and included in node_data
    console.log("Children already loaded in node_data:", node_data.children);
  };

  return (
    <div className="flex flex-col w-full relative">
      <Node
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          node_data={node_data}
          loadChildren={loadChildren}
          onRefresh={onRefresh}
      />

      {isCollapsed && node_data.children && node_data.children.length > 0 && (
        <div className="pl-10 ml-4 relative">
          {/* Render children directly from node_data.children */}
          {node_data.children.map((child) => {
            // Only set icon_id if icon is not available as fallback
            const childData = {...child};
            if (!childData.icon) {
              childData.icon_id = 1;
            }
            return (
              <div key={childData.id} className="relative">
                <CollapsibleNode node_data={childData} onRefresh={onRefresh} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};