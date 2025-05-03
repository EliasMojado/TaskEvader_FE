import React, {JSX, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {STATUS} from "../constants/index.ts";
import {
  MdLaptop,
  MdOutlineCheckBoxOutlineBlank,
  MdPerson,
  MdUnfoldLess,
  MdUnfoldMore
} from "react-icons/md";
import {TbCalendarClock} from "react-icons/tb";
import {ProgressBar, ProgressProps} from "../components/progress_bar.tsx";
import {formatDateToLocale} from "../helpers/date_helper.ts";
import {BiDotsVertical, BiEdit} from "react-icons/bi";
import {IoIosCheckboxOutline, IoMdTrash} from "react-icons/io";
import {AiFillFileAdd, AiOutlineCloseSquare} from "react-icons/ai";
import CreateSubtaskForm from "./CreateSubtaskForm.tsx";
import EditNodeForm from './EditNodeForm.tsx';
import {deleteNode, updateNode} from "../services/nodes";
import {Tooltip} from "react-tooltip";
import {getUserProfileById} from "../services/profile.ts";

export type NodeData = {
  id: number;
  title: string;
  deadline: string;
  description: string;
  collaborators: CollaboratorProfile[];
  parent: number;
  status: string;
  completed_subtasks: number;
  ongoing_subtasks: number;
  missed_subtasks: number;
  icon_id?: number;
  icon?: string;
  children: NodeData[];
}

type Icons = {
  [key: number]: {
    icon_sm: JSX.Element;
    icon_md: JSX.Element;
    icon_lg: JSX.Element;
  }
}

type CollaboratorProfile = {
  display_name: string;
  profile_pic: string | null;
  id: number;
}

const IconsMap: Icons = {
  1: {
    icon_sm: <MdLaptop size={20} color={'#001F54'}/>,
    icon_md: <MdLaptop size={40} color={'#001F54'}/>,
    icon_lg: <MdLaptop size={65} color={'#001F54'}/>
  },
}

export const Node: React.FC<{
  isCollapsed?: boolean,
  nodeData: NodeData,
  setIsCollapsed?: React.Dispatch<React.SetStateAction<boolean>>,
  isHomePage?: boolean,
  loadChildren?: () => Promise<void>,
  onRefresh?: () => void
}> = ({isCollapsed = false, nodeData, setIsCollapsed, isHomePage = false, loadChildren, onRefresh}) => {
  const [hovered, setHovered] = useState<boolean>(false);
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [collaborators, setCollaborators] = useState<CollaboratorProfile[]>([]);
  const [node_data, setNodeData] = useState<NodeData>(nodeData);
  const navigate = useNavigate();
  const key = node_data.id;
  const isLeaf = !(node_data.completed_subtasks || node_data.ongoing_subtasks || node_data.missed_subtasks);

  useEffect(() => {
    const fetchCollaborators = async () => {
      const collaboratorProfiles = await Promise.all(
          node_data.collaborators.map(async (id: number) => {
            const profile = await getUserProfileById(id); // Fetch profile data
            return profile;
          })
      );
      setCollaborators(collaboratorProfiles);
    };

    fetchCollaborators();
  }, [node_data.collaborators]);

  const handleDelete = async () => {
    // Example: call your backend API to delete the node
    try {
      await deleteNode(node_data.id);
      console.log(`Deleting node with ID ${node_data.id}`);
      setShowDeleteConfirm(false);
      onRefresh?.(); // Call the onRefresh function to refresh the parent node
      // optionally reload or update UI
    } catch (error) {
      console.error("Failed to delete node:", error);
    }
  };


  const handleToggleCollapse = () => {
    if (setIsCollapsed && !isLeaf) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
      <main
          onClick={() => {
            if (isHomePage) {
              navigate(`/main/${key}`);
            } else {
              if (!isCollapsed && node_data.children.length > 0) {
                loadChildren?.();
              }
              handleToggleCollapse();
            }
          }}
          onMouseOver={() => setHovered(true)}
          onMouseLeave={() => {
            setHovered(false);
            setShowOptions(false);
          }}
          data-tooltip-id={`node-description-${node_data.id}`}
          data-tooltip-content={node_data.description || "No description available"}
          data-tooltip-delay-show={400}
          data-tooltip-place="bottom"
          className={`flex flex-row w-full items-center relative border cursor-pointer hover:shadow-lg my-2 select-none
                    ${node_data.parent == null ? 'rounded-lg px-6 py-4 max-w-fit border-palm-blue mt-5' : 'rounded-lg px-6 py-2 border-carribean-current'}`}
          className={`flex flex-row w-fit items-center relative border cursor-pointer hover:shadow-lg my-2 select-none gap-2 
          ${node_data.status == STATUS.completed && 'bg-blue-50'} ${node_data.status == STATUS.missed && 'bg-red-50'}
                    ${node_data.parent == null ? 'rounded-lg px-6 py-4 max-w-fit border-palm-blue mt-5' : `rounded-lg px-6 py-2 
                    ${node_data.status == STATUS.missed && 'border-pastel-red'} 
                    ${node_data.status == STATUS.completed && 'border-blue-400'} 
                    border-carribean-current`}`}
      >
        {
          /*
          Collapse Button Indicator,
          will now show if the node is a leaf
          */
        }

        {
            !isHomePage
            && <div className={'h-full items-center justify-center flex'}>
              {
                  !isLeaf && (isCollapsed
                      ? <MdUnfoldLess size={25}/>
                      : <MdUnfoldMore size={25}/>)
              }
            </div>
        }


        {
          /*
          Main Content
            - Custom Icon
            - Title
            - Deadline
            - Collaborators
            - Progress Bar
          */
        }
        <div className={'flex flex-col gap-2'}>
          {
            /*
              - Custom Icon
              - Title
              - Deadline
              - Collaborators
            */
          }
          <div className={'flex flex-row gap-2 justify-center items-center'}>

            {
              /*
               - Custom Icon
              */
            }

            <div className={'flex flex-col select-none'}>
              {node_data.icon ? (
                  // If icon is available, render the emoji with appropriate size
                  <span className={
                    node_data.parent == null
                        ? 'text-5xl' // Large size for root nodes
                        : isLeaf
                            ? 'text-xl' // Small size for leaf nodes
                            : 'text-3xl' // Medium size for others
                  }>
                  {node_data.icon}
                </span>
              ) : (
                  // Fallback to original icons if no emoji is available
                  node_data.parent == null
                      ? IconsMap[node_data.icon_id || 1].icon_lg
                      : isLeaf
                          ? IconsMap[node_data.icon_id || 1].icon_sm
                          : IconsMap[node_data.icon_id || 1].icon_md
              )}
            </div>

            {
              /*
                - Title,
                - Deadline,
                - Collaborators.
                - Progress Bar
              */
            }

            <div className={`flex ${isLeaf ? 'flex-row items-center gap-2' : 'flex-col'}`}>

              {
                /*
                  - Title
                  - Deadline
                  - Collaborators
                */
              }
              <div className={`flex ${node_data.parent != null ? 'flex-row items-center gap-2' : 'flex-col'}`}>

                {
                  /*
                    - Title
                  */
                }
                <div className={'h-fit overflow-ellipsis '}>
                  <h1
                      className={`w-fit font-inter select-none whitespace-nowrap ${
                          node_data.parent == null
                              ? isHomePage
                                  ? 'font-bold text-l leading-none'
                                  : 'font-medium text-3xl'
                              : 'font-medium text-sm leading-none'
                      } text-palm-blue ${
                          node_data.status === STATUS.completed ? 'line-through' : ''
                      }`}
                  >
                    {node_data["title"]}
                  </h1>
                </div>

                {
                  /*
                    - Deadline
                    - Collaborators
                  */
                }
                <div className={'flex flex-row gap-1 w-full h-full items-center'}>
                  <span
                      className={`w-fit h-fit px-4 whitespace-nowrap ${node_data.parent == null ? 'text-[12px]' : 'text-[10px]'} 
                  rounded-2xl text-palm-blue bg-uranian-blue font-viga flex flex-row items-center justify-center gap-1`}>
                    <TbCalendarClock/>
                    <span>
                      {formatDateToLocale(node_data['deadline'])} | {new Date(node_data['deadline']).toLocaleTimeString('en-US', {timeZoneName: 'short'})}
                    </span>
                  </span>
                  <span className={'flex flex-row items-center h-full'}>
                  {collaborators.slice(0, 3).map((profile) => (
                      <div
                          key={profile.id}
                          data-tooltip-id={`collaborator-${profile.id}`}
                          data-tooltip-content={`${profile.display_name}`}
                          data-tooltip-delay-show={200}
                          data-tooltip-delay-hide={200}
                          data-tooltip-place={"bottom"}
                          className={`flex items-center justify-center rounded-full overflow-hidden`}
                          style={{
                            width: isLeaf ? 15 : 20,
                            height: isLeaf ? 15 : 20,
                          }}
                      >
                        {profile.profile_pic ? (
                            <img
                                src={profile.profile_pic}
                                width="100%"
                                height="100%"
                                className="object-cover"
                            />
                        ) : (
                            <MdPerson size={isLeaf ? 15 : 20} color={'darkgrey'}/>
                        )}
                        <Tooltip
                            id={`collaborator-${profile.id}`}
                            style={{
                              backgroundColor: "white",
                              color: "#197278",
                              padding: "8px 12px",
                              borderRadius: "6px",
                              fontWeight: "bold",
                              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                              fontSize: "12px",
                              zIndex: 10,
                            }}
                        />
                      </div>
                  ))}
                    {collaborators.length > 3 && (
                        <div
                            data-tooltip-id="extra-collaborators-tooltip"
                            data-tooltip-content={collaborators.slice(3).map((profile) => profile.display_name).join(', ')}
                            data-tooltip-delay-show={200}
                            data-tooltip-delay-hide={200}
                            data-tooltip-place={"bottom"}
                            className={`rounded-full bg-gray-300 text-black text-[10px] flex items-center justify-center border-2 border-white ${
                                isLeaf ? 'w-6 h-6' : 'w-5 h-5'
                            }`}
                        >
                          +{collaborators.length - 3}
                        </div>
                    )}
                    <Tooltip
                        id="extra-collaborators-tooltip"
                        style={{
                          backgroundColor: "white",
                          color: "#197278",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          fontWeight: "bold",
                          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                          fontSize: "12px",
                          zIndex: 10
                        }}
                    />
                    </span>
                </div>
              </div>
              {
                /*
                  - Progress Bar
                */
              }
              {node_data.parent == null || !isLeaf &&
                  <div className={'h-2'}>
                      <ProgressBar progress={
                        {
                          completed: node_data.completed_subtasks,
                          ongoing: node_data.ongoing_subtasks,
                          missed: node_data.missed_subtasks
                        } as ProgressProps
                      }/>
                  </div>
              }
            </div>
          </div>
          {
            /*
            - Progress Bar
            */
          }

          {node_data.parent == null &&
              <div className={'h-3 w-full'}>
                  <ProgressBar progress={
                    {
                      completed: node_data.completed_subtasks,
                      ongoing: node_data.ongoing_subtasks,
                      missed: node_data.missed_subtasks
                    } as ProgressProps
                  }/>
              </div>
          }
        </div>

        {isLeaf &&
            <div className={'w-full justify-end items-end flex flex-row ml-4'}>
              {node_data.status == STATUS.ongoing &&
                  <MdOutlineCheckBoxOutlineBlank
                      onClick={async () => {
                        try {
                          await updateNode(node_data.id, {status: 'done'});
                          setNodeData({...node_data, status: 'done'});
                          // Trigger parent refresh to update its completed_subtasks count
                          onRefresh?.();
                        } catch (error) {
                          console.error('Failed to update node:', error);
                        }
                      }}
                      size={20}
                      color={'#3F3D56'}
                      className={'cursor-pointer'}
                  />
              }
              {node_data.status == STATUS.done &&
                  <MdOutlineCheckBox
                      onClick={async (e) => {
                        // Stop event propagation to prevent the parent node toggle
                        e.stopPropagation();
                        try {
                          await updateNode(node_data.id, {status: 'ongoing'});
                          setNodeData({...node_data, status: 'ongoing'});
                          // Ensure onRefresh is called
                          onRefresh?.();
                        } catch (error) {
                          console.error('Failed to update node:', error);
                        }
                      }}
                      size={20}
                      color={'#3F3D56'}
                      className={'cursor-pointer'}
                  />
              }
              {node_data.status == STATUS.completed &&
                  <IoIosCheckboxOutline
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await updateNode(node_data.id, {status: 'ongoing'});
                          setNodeData({...node_data, status: 'ongoing'});
                          // Add onRefresh here too
                          onRefresh?.();
                        } catch (error) {
                          console.error('Failed to update node:', error);
                        }
                      }}
                      size={node_data.parent == null ? 20 : 15} color={'#197278'}/>}
              {node_data.status == STATUS.missed &&
                  <AiOutlineCloseSquare size={node_data.parent == null ? 20 : 13} color={'#F33D3A'}/>}
            </div>
        }

        {hovered &&
            <div className={'absolute right-1 z-10'}>
                <BiDotsVertical
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowOptions(!showOptions)
                    }}
                    onMouseLeave={() => {
                      setHovered(false)
                    }}/>
              {showOptions &&
                  <div className={'absolute left-1 flex flex-col gap-1 bg-white rounded-xl border shadow-lg p-2'}
                       onClick={(e) => e.stopPropagation()}>
                      <h1 className={'text-palm-blue font-inter font-bold text-sm pl-1 border-b-2 mb-1 pb-1'}>Actions</h1>
                      <div
                          className={'flex flex-row items-center gap-2 cursor-pointer hover:bg-uranian-blue pr-4 pl-1 py-1 rounded-md'}
                          onClick={() => setShowCreateProject(true)}>
                          <AiFillFileAdd size={15} color={'#197278'}/>
                          <span className={'text-palm-blue font-inter font-medium text-sm'}>Add</span>
                      </div>
                      <div
                          className={'flex flex-row items-center gap-2 cursor-pointer hover:bg-uranian-blue pr-4 pl-1 py-1 rounded-md'}
                          onClick={() => {
                            setShowEditProject(true);
                            setShowOptions(false);
                          }}>
                          <BiEdit size={15} color={'#197278'}/>
                          <span className={'text-palm-blue font-inter font-medium text-sm'}>Edit</span>
                      </div>
                      <div
                          className={'flex flex-row items-center gap-2 cursor-pointer hover:bg-uranian-blue pr-4 pl-1 py-1 rounded-md'}
                          onClick={() => setShowDeleteConfirm(true)}
                      >
                          <IoMdTrash size={15} color={'#FC7554'}/>
                          <span className={'text-palm-blue font-inter font-medium text-sm'}>Delete</span>
                      </div>
                  </div>
              }
            </div>
        }
        <div
            className={`
                fixed top-0 right-0 h-full w-[600px] bg-white shadow-lg 
                transition-all duration-500 z-50
                ${showCreateProject ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
                ${showCreateProject ? 'pointer-events-auto' : 'pointer-events-none'}
            `}
            onClick={(e) => e.stopPropagation()}
        >
          <CreateSubtaskForm
              parentNode={node_data}
              onClose={() => setShowCreateProject(false)}
              onRefresh={onRefresh}
          />
        </div>


        {/* Dim background */}
        {showCreateProject && (
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCreateProject(false);
                }}
            />
        )}
        <div
            className={`
                fixed top-0 right-0 h-full w-[600px] bg-white shadow-lg 
                transition-all duration-500 z-50
                ${showEditProject ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
                ${showEditProject ? 'pointer-events-auto' : 'pointer-events-none'}
            `}
            onClick={(e) => e.stopPropagation()}
        >
          <EditNodeForm
              node={node_data}
              onRefresh={onRefresh}
              onClose={() => setShowCreateProject(false)}
              onUpdate={() => {
                setShowEditProject(false);
                loadChildren?.();
              }}
              initialCollaborators={node_data.collaborators as number[]}
          />
        </div>
        {/* Dim background */}
        {showEditProject && (
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEditProject(false);
                }}
            />
        )}
        {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                 onClick={() => setShowDeleteConfirm(false)}>
              <div className="bg-white p-6 rounded-lg shadow-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-bold mb-4 text-palm-blue">Are you sure?</h2>
                <p className="mb-4">Do you really want to delete <strong>{node_data.title}</strong>?</p>
                <div className="flex justify-end gap-4">
                  <button
                      className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
                      onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                      onClick={handleDelete}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
        )}
        <Tooltip
            id={`node-description-${node_data.id}`}
            style={{
              backgroundColor: "white",
              color: "#197278",
              padding: "12px 16px",
              borderRadius: "6px",
              fontWeight: "normal",
              maxWidth: "300px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
              fontSize: "14px",
              zIndex: 10,
              whiteSpace: "pre-wrap",
              textAlign: "left"
            }}
        />
      </main>
  );
};