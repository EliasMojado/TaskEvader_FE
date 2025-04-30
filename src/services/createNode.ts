// import { API_BASE_URL } from '../constants'

// export interface CreateNodePayload {
//   title: string
//   description: string
//   deadline: string | null // ISO string or null
//   priority: number         // 0 = Low, 1 = Medium, 2 = High (or whatever your mapping is)
//   status: string           // e.g., "Pending", "In Progress", "Completed"
//   parent_id?: number | null // Optional for top-level tasks/projects
// }

// export interface NodeResponse {
//   id: number
//   title: string
//   description: string
//   deadline: string | null
//   priority: number
//   status: string
//   parent_id: number | null
//   created_at: string
//   updated_at: string
//   completed_subtasks: number
// }

// export async function createNode(payload: CreateNodePayload): Promise<NodeResponse> {
//   const res = await fetch(`${API_BASE_URL}/api/nodes/`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(payload),
//   })

//   if (!res.ok) {
//     const errorData = await res.json()
//     throw new Error(errorData.message || 'Failed to create node')
//   }

//   return res.json()
// }
