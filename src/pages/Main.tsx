import {useParams} from 'react-router-dom';
import {CollapsibleNode} from "../components/collapsible_node.tsx";
import {useEffect, useState, useRef} from "react";
import {fetchSpecificNodeWithCollaborator, getNodeData, Node} from "../services/nodes.ts";
import {SyncLoader} from "react-spinners";

type SortOption = 'deadline' | 'priority';
type FilterOption = 'all' | 'ongoing' | 'completed' | 'missed';

const Main: React.FC<{ isCollapsed?: boolean }> = () => {
    const {id} = useParams<{ id: string }>();
    const [rootNode, setRootNode] = useState<Node | null>(null);
    const [childNodes, setChildNodes] = useState<{ [key: number]: Node }>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [sortOption, setSortOption] = useState<SortOption>('deadline');
    const [filterOption, setFilterOption] = useState<FilterOption>('all');
    // const debugRef = useRef({ renderCount: 0 });
    
    // Keep track of the initial child fetch
    const initialFetchCompleteRef = useRef(false);
    
    // Safe debugging function - disabled for production
    // const logDebug = (message: string, data?: any) => {
    //     Console logs disabled
    //     console.log(`[DEBUG-${++debugRef.current.renderCount}] ${message}`, data !== undefined ? data : '');
    // };

    // Fetch root node data
    useEffect(() => {
        const fetchRootNode = async () => {
            if (!id) return;
            
            // logDebug(`Fetching root node with ID: ${id}`);
            try {
                const data = await fetchSpecificNodeWithCollaborator(parseInt(id));
                if (!data) {
                    throw new Error(`Node with ID ${id} not found or not accessible`);
                }
                
                // logDebug('Root node data received', {
                //     id: data.id,
                //     title: data.title,
                //     childrenIds: data.children
                // });
                
                data['icon_id'] = 1;
                setRootNode(data);
                
                // Check if children are already full objects (not just IDs)
                const childrenAreObjects = Array.isArray(data.children) && 
                    data.children.length > 0 && 
                    typeof data.children[0] === 'object';
                
                if (childrenAreObjects) {
                    // Children are already objects, no need to fetch
                    // logDebug('Children are already objects, no need to fetch', data.children);
                    setIsLoading(false);
                } else if (Array.isArray(data.children) && data.children.length > 0) {
                    // Children are IDs, need to fetch
                    // logDebug('Children are IDs, need to fetch', data.children);
                    initialFetchCompleteRef.current = false;
                    fetchChildNodesData(data.children, true);
                } else {
                    // No children to fetch, so we can stop loading
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Error fetching root node:", error);
                setIsLoading(false);
            }
        };
        
        fetchRootNode();
    }, [id]);
    
    // Fetch child nodes data based on IDs
    const fetchChildNodesData = async (childrenIds: number[], isInitialFetch = false) => {
        // logDebug('Fetching data for child nodes', { 
        //     count: childrenIds.length, 
        //     ids: childrenIds,
        //     isInitialFetch
        // });
        
        const newChildNodes: { [key: number]: Node } = {};
        let fetchedCount = 0;
        let errorCount = 0;
        
        // Process each child ID
        const fetchPromises = childrenIds.map(async (childId) => {
            try {
                const childData = await getNodeData(childId);
                newChildNodes[childId] = childData;
                fetchedCount++;
                
                // logDebug(`Fetched child node ${fetchedCount}/${childrenIds.length}`, {
                //     id: childData.id,
                //     title: childData.title,
                //     hasGrandchildren: childData.children && childData.children.length > 0
                // });
                
                // Return true for successful fetch
                return true;
            } catch (error) {
                errorCount++;
                // logDebug(`Child node ${childId} not accessible, skipping`, error);
                // Return false for failed fetch
                return false;
            }
        });
        
        // Wait for all fetch operations to complete
        await Promise.all(fetchPromises);
        
        // Update the childNodes state with the new nodes
        setChildNodes(prevNodes => ({
            ...prevNodes,
            ...newChildNodes
        }));
        
        // If this was the initial fetch of top-level children, set loading to false
        // regardless of errors - as long as we tried all nodes
        if (isInitialFetch && !initialFetchCompleteRef.current) {
            initialFetchCompleteRef.current = true;
            // logDebug(`Initial fetch complete: ${fetchedCount} successful, ${errorCount} failed`);
            setIsLoading(false);
        }
        
        // Now fetch grandchildren for any successful child nodes
        for (const childId of Object.keys(newChildNodes).map(Number)) {
            const childData = newChildNodes[childId];
            if (Array.isArray(childData.children) && childData.children.length > 0) {
                await fetchChildNodesData(childData.children as number[]);
            }
        }
    };
    
    // Apply sort and filter to a list of node IDs
    const processSortAndFilter = (nodeIds: number[]): number[] => {
        if (!nodeIds || nodeIds.length === 0) return [];
        
        // Filter nodes based on criteria
        let filteredIds = [...nodeIds];
        
        if (filterOption !== 'all') {
            filteredIds = filteredIds.filter(nodeId => {
                const node = childNodes[nodeId];
                if (!node) return false;
                
                const keepOngoing = filterOption === 'ongoing' && node.status === 'ongoing';
                const keepCompleted = filterOption === 'completed' && node.status === 'completed';
                const keepMissed = filterOption === 'missed' && node.status === 'missed';
                
                return keepOngoing || keepCompleted || keepMissed;
            });
            
            // logDebug(`Filtered node IDs (${filterOption})`, {
            //     before: nodeIds.length,
            //     after: filteredIds.length
            // });
        }
        
        // Sort nodes based on selected option
        if (filteredIds.length > 1) {
            filteredIds.sort((idA, idB) => {
                const nodeA = childNodes[idA];
                const nodeB = childNodes[idB];
                
                if (!nodeA || !nodeB) return 0;
                
                if (sortOption === 'deadline') {
                    // Handle null deadlines
                    if (!nodeA.deadline && !nodeB.deadline) return 0;
                    if (!nodeA.deadline) return 1;
                    if (!nodeB.deadline) return -1;
                    
                    const dateA = new Date(nodeA.deadline).getTime();
                    const dateB = new Date(nodeB.deadline).getTime();
                    
                    return dateA - dateB;
                } else {
                    // Sort by priority (higher priority first)
                    const priorityA = nodeA.priority || 0;
                    const priorityB = nodeB.priority || 0;
                    
                    return priorityB - priorityA;
                }
            });
            
            // logDebug(`Sorted node IDs (${sortOption})`, {
            //     before: nodeIds,
            //     after: filteredIds
            // });
        }
        
        return filteredIds;
    };
    
    // Build a complete node tree with sorted and filtered children
    const buildNodeTree = (node: Node | null): Node | null => {
        if (!node) return null;
        
        // Create a deep copy to avoid mutations
        const processedNode = {...node};
        
        // If we have children, process them
        if (Array.isArray(processedNode.children) && processedNode.children.length > 0) {
            // Check if children are already objects or just IDs
            const childrenAreObjects = typeof processedNode.children[0] === 'object';
            
            if (childrenAreObjects) {
                // Children are already objects, just apply sort and filter
                // logDebug('Children are already objects in buildNodeTree');
                
                // Convert children array to proper type for TypeScript
                const childrenObjects = processedNode.children as Node[];
                
                // Sort children if needed
                if (sortOption === 'deadline') {
                    childrenObjects.sort((a, b) => {
                        if (!a.deadline && !b.deadline) return 0;
                        if (!a.deadline) return 1;
                        if (!b.deadline) return -1;
                        
                        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
                    });
                } else {
                    // Sort by priority (higher priority first)
                    childrenObjects.sort((a, b) => {
                        const priorityA = a.priority || 0;
                        const priorityB = b.priority || 0;
                        
                        return priorityB - priorityA;
                    });
                }
                
                // Filter children if needed
                if (filterOption !== 'all') {
                    const filteredChildren = childrenObjects.filter(child => {
                        const keepOngoing = filterOption === 'ongoing' && child.status === 'ongoing';
                        const keepCompleted = filterOption === 'completed' && child.status === 'completed';
                        const keepMissed = filterOption === 'missed' && child.status === 'missed';
                        
                        return keepOngoing || keepCompleted || keepMissed;
                    });
                    
                    // Process each child recursively
                    processedNode.children = filteredChildren.map(child => buildNodeTree(child))
                                                           .filter(Boolean) as Node[];
                } else {
                    // Process each child recursively with no filtering
                    processedNode.children = childrenObjects.map(child => buildNodeTree(child))
                                                          .filter(Boolean) as Node[];
                }
            } else {
                // Children are IDs, use the original process
                // logDebug('Children are IDs in buildNodeTree');
                // Apply sort and filter to children IDs
                const childrenIds = processSortAndFilter(processedNode.children as number[]);
                
                // Transform IDs into full node objects with their own processed children
                const processedChildren = childrenIds
                    .map(childId => {
                        const childNode = childNodes[childId];
                        if (!childNode) return null;
                        
                        // Recursively process child's children
                        return buildNodeTree(childNode);
                    })
                    .filter(Boolean) as Node[]; // Remove any null nodes
                
                // Set the processed children array
                processedNode.children = processedChildren;
            }
        }
        
        return processedNode;
    };
    
    // Generate the final processed tree for display
    const processedNodeData = buildNodeTree(rootNode);

    const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newSortOption = event.target.value as SortOption;
        // logDebug(`Sort changed from ${sortOption} to ${newSortOption}`);
        setSortOption(newSortOption);
    };

    const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newFilterOption = event.target.value as FilterOption;
        // logDebug(`Filter changed from ${filterOption} to ${newFilterOption}`);
        setFilterOption(newFilterOption);
    };

    if(isLoading) {
        return (
            <div className={'flex flex-col items-center justify-center w-full h-screen gap-5 bg-gray-50'}>
                <div className="animate-pulse">
                    <SyncLoader
                        color="#4f46e5"
                        size={20}
                        margin={5}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                    />
                </div>
                <h1 className="text-xl font-medium text-gray-700 animate-pulse">Loading Project...</h1>
                <p className="text-sm text-gray-500">Getting your tasks ready</p>
            </div>
        );
    }

    return (
        <main className={'flex flex-col items-center justify-center w-full'}>
            <div className={'flex flex-row justify-center w-full gap-6 mb-6 p-4 bg-gray-50 rounded-lg shadow-sm'}>
                <div className="flex items-center">
                    <label htmlFor="sort-select" className="mr-2 font-medium flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                        </svg>
                        Sort by:
                    </label>
                    <select
                        id="sort-select"
                        value={sortOption}
                        onChange={handleSortChange}
                        className="p-2 border rounded-md bg-white shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-colors"
                    >
                        <option value="deadline">⏰ Deadline (nearest first)</option>
                        <option value="priority">🔥 Priority (highest first)</option>
                    </select>
                </div>
                
                <div className="flex items-center">
                    <label htmlFor="filter-select" className="mr-2 font-medium flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filter:
                    </label>
                    <select
                        id="filter-select"
                        value={filterOption}
                        onChange={handleFilterChange}
                        className="p-2 border rounded-md bg-white shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-colors"
                    >
                        <option value="all">📋 All Tasks</option>
                        <option value="ongoing">🔄 Ongoing</option>
                        <option value="completed">✅ Completed</option>
                        <option value="missed">⏱️ Missed</option>
                    </select>
                </div>
            </div>
            
            <div className={'flex flex-col items-center justify-center w-fit gap-5'}>
                {processedNodeData && <CollapsibleNode node_data={processedNodeData} />}
            </div>
        </main>
    );
};

export default Main;