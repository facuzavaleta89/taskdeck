export type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
}

export type Workspace = {
  id: string
  name: string
  slug: string
  owner_id: string
  created_at: string
}

export type WorkspaceMember = {
  workspace_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
}

export type Board = {
  id: string
  name: string
  workspace_id: string
  created_by: string
  color: string
  created_at: string
}

export type Column = {
  id: string
  name: string
  board_id: string
  position: number
}

export type Label = {
  id: string
  name: string | null
  color: string
  board_id: string
}

export type CardLabel = {
  label_id: string
  labels: Label | null
}

export type Card = {
  id: string
  title: string
  description: string | null
  column_id: string
  position: number
  assigned_to: string | null
  due_date: string | null
  created_by: string | null
  created_at: string
  completed: boolean
  labels?: CardLabel[]
  checklist_items?: ChecklistItem[]
}

export type Invitation = {
  id: string
  workspace_id: string
  email: string
  token: string
  expires_at: string
  accepted: boolean
}

export type ChecklistItem = {
  id: string
  card_id: string
  text: string
  completed: boolean
  position: number
}