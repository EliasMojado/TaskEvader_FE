import React, { useState } from "react";
import { Node, NodeData } from "./node.tsx";

export const CollapsibleNode: React.FC<{ node_data: NodeData; onRefresh?: () => void }> = ({ node_data, onRefresh }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  return (
      <div className={`flex flex-col w-full h-full min-h-fit relative`}>
        <div className="flex flex-row items-center h-full">
          {node_data.parent !== null && (
              <div
                  className={`border-palm-blue border-l border-b w-6 h-10 absolute -left-10 -top-2 rounded-bl-xl ml-4`}
              >
                {/* This is the line that connects to the parent node */}
              </div>
          )}
          <Node
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
              nodeData={node_data}
              onRefresh={onRefresh}
          />
        </div>

        {isCollapsed && node_data.children && node_data.children.length > 0 && (
            <div className="relative ml-10">
              {node_data.children.map((child, index) => {
                const childData = { ...child };
                if (!childData.icon) {
                  childData.icon_id = 1;
                }
                return (
                    <div
                        key={childData.id}
                        className={`relative flex flex-row items-center h-full child-${childData.id}-${index}`}
                    >
                      {node_data.parent !== null && index < node_data.children.length - 1 && (
                          <div className={`border-palm-blue absolute h-full -left-6 border-l`}></div>
                      )}
                      <CollapsibleNode node_data={childData} onRefresh={onRefresh} />
                    </div>
                );
              })}
            </div>
        )}
      </div>
  );
};