import { Ionicons } from "@expo/vector-icons"
import type React from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { theme } from "../constants/theme"
import { useModal } from "../hooks/useModal"
import { taskService } from "../services/taskService"
import { useTaskStore } from "../store/taskStore"
import type { Task } from "../types/Task"
import { CustomModal } from "./CustomModal"
import { PriorityBadge } from "./PriorityBadge"

interface TaskItemProps {
  task: Task
  onEdit: (task: Task) => void
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit }) => {
  const { updateTask, deleteTask } = useTaskStore()
  const { modalConfig, isVisible, hideModal, showError, showSuccess, showConfirm } = useModal()

  const handleToggleComplete = async () => {
    try {
      await taskService.updateTask(task.id, { completed: !task.completed })
      updateTask(task.id, { completed: !task.completed })

      if (!task.completed) {
        showSuccess("Task Completed!", "Great job on completing this task!")
      }
    } catch (error: any) {
      showError("Error", "Failed to update task status. Please try again.")
    }
  }

  const handleDelete = () => {
    showConfirm(
      "Delete Task",
      `Are you sure you want to delete "${task.title}"? This action cannot be undone.`,
      async () => {
        try {
          await taskService.deleteTask(task.id)
          deleteTask(task.id)
          showSuccess("Task Deleted", "The task has been successfully deleted.")
        } catch (error: any) {
          showError("Error", "Failed to delete task. Please try again.")
        }
      },
      undefined,
      "Delete",
      "Cancel",
    )
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <>
      <View style={[styles.container, task.completed && styles.completedContainer]}>
        <TouchableOpacity onPress={handleToggleComplete} style={styles.checkbox}>
          <Ionicons
            name={task.completed ? "checkmark-circle" : "ellipse-outline"}
            size={24}
            color={task.completed ? theme.colors.success : theme.colors.text.light}
          />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={[styles.title, task.completed && styles.completedText]}>{task.title}</Text>
          {task.description && (
            <Text style={[styles.description, task.completed && styles.completedText]}>{task.description}</Text>
          )}
          <View style={styles.footer}>
            <PriorityBadge priority={task.priority} size="small" />
            <Text style={styles.dueDate}>{formatDate(task.dueDate)}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={() => onEdit(task)} style={styles.actionButton}>
            <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
            <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {modalConfig && (
        <CustomModal
          visible={isVisible}
          onClose={hideModal}
          title={modalConfig.title}
          message={modalConfig.message}
          type={modalConfig.type}
          buttons={modalConfig.buttons}
        />
      )}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.xs,
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedContainer: {
    opacity: 0.7,
  },
  checkbox: {
    marginRight: theme.spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.fonts.semiBold,
  },
  description: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.regular,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: theme.colors.text.light,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dueDate: {
    fontSize: 12,
    color: theme.colors.text.light,
    fontFamily: theme.fonts.regular,
  },
  actions: {
    flexDirection: "row",
    marginLeft: theme.spacing.sm,
  },
  actionButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.xs,
  },
})
