export interface Task {
  id: string
  title: string
  description: string
  dueDate: Date
  priority: "low" | "medium" | "high"
  completed: boolean
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  email: string
  displayName?: string
}
