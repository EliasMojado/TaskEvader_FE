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
import { deleteNode } from "../services/nodes";

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
  node_data: NodeData,
  setIsCollapsed?: React.Dispatch<React.SetStateAction<boolean>>,
  isHomePage?: boolean,
  loadChildren?: () => Promise<void>
}> = ({isCollapsed = false, node_data, setIsCollapsed, isHomePage = false, loadChildren}) => {
  const [hovered, setHovered] = useState<boolean>(false);
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();
  const key = node_data.id;
  const isLeaf = !(node_data.completed_subtasks || node_data.ongoing_subtasks || node_data.missed_subtasks);

  const handleDelete = async () => {
    // Example: call your backend API to delete the node
    try {
      await deleteNode(node_data.id);
      console.log(`Deleting node with ID ${node_data.id}`);
      setShowDeleteConfirm(false);
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
          className={`flex mb-2 flex-row w-full items-center gap-2 relative border cursor-pointer hover:shadow-lg transition-all duration-200
                    ${node_data.parent == null ? 'rounded-lg px-6 py-4 border-palm-blue mt-5' : 'rounded-lg px-6 py-2 border-carribean-current'}`}
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
          <div className={'flex flex-row gap-2'}>

            {
              /*
               - Custom Icon
              */
            }

            <div className={'flex flex-col items-center justify-center'}>
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

            <div className={`flex ${isLeaf ? 'flex-row items-center gap-2' : 'flex-col justify-center'}`}>

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
                <h1
                    className={`w-fit font-inter ${
                      node_data.parent == null 
                        ? isHomePage 
                          ? 'font-bold text-l leading-none ' 
                          : 'font-medium text-3xl' 
                        : 'font-medium text-sm'
                      } text-palm-blue ${
                        node_data.status === STATUS.completed ? 'line-through' : ''
                      }`}
                    style={isHomePage ? {
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    } : {}}
                >
                  {node_data["title"]}
                </h1>

                {
                  /*
                    - Deadline
                    - Collaborators
                  */
                }
                <div className={'flex flex-row items-center gap-1'}>
                  <span className={`w-fit h-fit px-4 py-0.5 whitespace-nowrap ${node_data.parent == null ? 'text-[10px]' : 'text-[7px]'} 
                  rounded-2xl text-palm-blue bg-uranian-blue font-viga flex flex-row items-center justify-center gap-1`}>
                    <TbCalendarClock/>
                    <span>
                      {/* {formatDateToLocale(node_data['deadline'])} | {new Date(node_data['deadline']).toLocaleTimeString()} */}
                      {formatDateToLocale(node_data['deadline'])} | {new Date(node_data['deadline']).toLocaleTimeString('en-US', {timeZoneName: 'short'})}
                    </span>
                  </span>
                  <span className={'flex flex-row'}>
                    {node_data['collaborators'].map((profile: CollaboratorProfile) => (
                    <div key={profile.id} className={`${node_data.parent == null ? 'w-5 h-5' : 'w-3 h-3'} rounded-full border border-white 
                      overflow-hidden items-center justify-center flex bg-gray-300`}>
                      <MdPerson/>
                    </div>
                  ))}
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

          {node_data.parent == null &&
              <div className={'h-3'}>
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
        <div></div>
        {isLeaf &&
        <div>
          {node_data.status == STATUS.ongoing &&
              <MdOutlineCheckBoxOutlineBlank size={node_data.parent == null ? 20 : 13} color={'#001F54'}/>}
          {node_data.status == STATUS.completed && <IoIosCheckboxOutline size={node_data.parent == null ? 20 : 13} color={'#197278'}/>}
          {node_data.status == STATUS.missed && <AiOutlineCloseSquare size={node_data.parent == null ? 20 : 13} color={'#F33D3A'}/>}
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
              <div className={'absolute left-1 flex flex-col gap-2 bg-white rounded-xl border shadow-lg p-4'} 
                  onClick={(e) => e.stopPropagation()}>
                  <h1 className={'text-palm-blue font-inter font-bold text-sm'}>Actions</h1>

                  <div className={'flex flex-row items-center gap-2 cursor-pointer'}
                      onClick={() => setShowCreateProject(true)}>
                      <AiFillFileAdd size={15} color={'#197278'}/>
                      <span className={'text-palm-blue font-inter font-medium text-sm'}>Add</span>
                  </div>
                  <div className={'flex flex-row items-center gap-2'}
                      onClick={() => {
                        setShowEditProject(true);
                        setShowOptions(false);
                      }}>
                      <BiEdit size={15} color={'#197278'}/>
                      <span className={'text-palm-blue font-inter font-medium text-sm'}>Edit</span>
                  </div>
                  <div
                    className={'flex flex-row items-center gap-2 cursor-pointer'}
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <IoMdTrash size={15} color={'#FC7554'} />
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

      </main>
  );
};