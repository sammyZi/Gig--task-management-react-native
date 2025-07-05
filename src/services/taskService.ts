import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore"
import { db } from "../config/firebase"
import type { Task } from "../types/Task"

const COLLECTION_NAME = "tasks"

const convertFirestoreTask = (doc: any): Task => {
  const data = doc.data()
  return {
    id: doc.id,
    title: data.title,
    description: data.description,
    dueDate: data.dueDate.toDate(),
    priority: data.priority,
    completed: data.completed,
    userId: data.userId,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  }
}

export const taskService = {
  async createTask(task: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<string> {
    try {
      console.log("Creating task:", task.title)
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...task,
        dueDate: Timestamp.fromDate(task.dueDate),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })

      console.log("Task created successfully with ID:", docRef.id)
      return docRef.id
    } catch (error) {
      console.error("Error creating task:", error)
      throw new Error("Failed to create task")
    }
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    try {
      console.log("Updating task:", id)
      const taskRef = doc(db, COLLECTION_NAME, id)
      const updateData: any = { ...updates }

      if (updates.dueDate) {
        updateData.dueDate = Timestamp.fromDate(updates.dueDate)
      }
      updateData.updatedAt = Timestamp.now()

      await updateDoc(taskRef, updateData)
      console.log("Task updated successfully:", id)
    } catch (error) {
      console.error("Error updating task:", error)
      throw new Error("Failed to update task")
    }
  },

  async deleteTask(id: string): Promise<void> {
    try {
      console.log("Deleting task:", id)
      await deleteDoc(doc(db, COLLECTION_NAME, id))
      console.log("Task deleted successfully:", id)
    } catch (error) {
      console.error("Error deleting task:", error)
      throw new Error("Failed to delete task")
    }
  },

  async getTasks(userId: string): Promise<Task[]> {
    try {
      console.log("Fetching tasks for user:", userId)
      const q = query(collection(db, COLLECTION_NAME), where("userId", "==", userId))

      const querySnapshot = await getDocs(q)
      const tasks: Task[] = []
      const seenIds = new Set<string>()

      querySnapshot.forEach((doc) => {
        if (!seenIds.has(doc.id)) {
          console.log("Processing task:", doc.id, doc.data().title)
          tasks.push(convertFirestoreTask(doc))
          seenIds.add(doc.id)
        }
      })

      // Sort by due date on client side
      tasks.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())

      console.log("Processed and sorted tasks:", tasks.length)
      return tasks
    } catch (error) {
      console.error("Error fetching tasks:", error)
      throw new Error("Failed to fetch tasks")
    }
  },

  subscribeToTasks(userId: string, callback: (tasks: Task[]) => void): () => void {
    console.log("Setting up task subscription for user:", userId)

    const q = query(collection(db, COLLECTION_NAME), where("userId", "==", userId))

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        console.log("Firestore snapshot received, docs count:", querySnapshot.docs.length)
        const tasks: Task[] = []
        const seenIds = new Set<string>()

        querySnapshot.forEach((doc) => {
          if (!seenIds.has(doc.id)) {
            console.log("Processing task:", doc.id, doc.data().title)
            tasks.push(convertFirestoreTask(doc))
            seenIds.add(doc.id)
          } else {
            console.warn("Duplicate task detected and skipped:", doc.id)
          }
        })

        // Sort by due date on client side
        tasks.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())

        console.log("Processed and sorted unique tasks:", tasks.length)
        callback(tasks)
      },
      (error) => {
        console.error("Error in task subscription:", error)
        // Fallback to one-time fetch
        taskService.getTasks(userId).then(callback).catch(console.error)
      },
    )

    return unsubscribe
  },
}
