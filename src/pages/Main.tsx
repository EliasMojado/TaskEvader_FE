import {useParams} from 'react-router-dom';
import {CollapsibleNode} from "../components/collapsible_node.tsx";
import {useEffect, useState} from "react";
import {fetchSpecificNodeWithCollaborator} from "../services/nodes.ts";
import {NodeData} from "../components/node.tsx";
import {SyncLoader} from "react-spinners";

const Main: React.FC<{ isCollapsed?: boolean }> = () => {
    const {id} = useParams<{ id: string }>();
    const [node_data, setNodeData] = useState<NodeData>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchNodeData = async () => {
            try {
                if (id) {
                    const data = await fetchSpecificNodeWithCollaborator(id);
                    data['icon_id'] = 1;
                    setNodeData(data);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Error fetching node data:", error);
            }
        };

        fetchNodeData();
    }, []);

  if(isLoading)
    return (
        <div className={'flex flex-col items-center justify-center w-full h-screen gap-5'}>
          <SyncLoader
              size={25}
              aria-label="Loading Spinner"
              data-testid="loader"
          />
          <h1 className="text-l">Loading Project</h1>
        </div>
    )

    return (
        <main className={'flex flex-row items-center justify-center w-full'}>
          <div className={'flex flex-col items-center justify-center w-fit gap-5'}>
            <CollapsibleNode node_data={node_data} />
          </div>
        </main>
    );
};

export default Main;