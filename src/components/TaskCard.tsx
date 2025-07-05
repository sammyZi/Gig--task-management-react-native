import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import type React from "react"
import { useEffect, useRef } from "react"
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { priorityColors, theme } from "../constants/theme"
import { useModal } from "../hooks/useModal"
import { taskService } from "../services/taskService"
import { useTaskStore } from "../store/taskStore"
import type { Task } from "../types/Task"
import { CustomModal } from "./CustomModal"

export interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onTaskComplete?: (taskTitle: string) => void
  index: number
  showCompletionFeedback?: boolean
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onTaskComplete,
  index,
  showCompletionFeedback = true,
}) => {
  const { updateTask, deleteTask } = useTaskStore()
  const { modalConfig, isVisible, hideModal, showError, showSuccess, showConfirm } = useModal()
  const slideAnim = useRef(new Animated.Value(50)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.95)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const handleToggleComplete = async () => {
    const scaleDown = Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    })
    const scaleUp = Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    })

    Animated.sequence([scaleDown, scaleUp]).start()

    try {
      const newCompletedStatus = !task.completed
      await taskService.updateTask(task.id, { completed: newCompletedStatus })
      updateTask(task.id, { completed: newCompletedStatus })

      // Show feedback only when completing a task (not when uncompleting) and if enabled
      if (newCompletedStatus && showCompletionFeedback) {
        if (onTaskComplete) {
          // Use parent's completion handler if provided
          console.log("TaskCard: Calling parent completion handler for:", task.title)
          onTaskComplete(task.title)
        } else {
          // Fallback to local modal
          console.log("TaskCard: Using local completion modal for:", task.title)
          showSuccess("Task Completed! 🎉", `Great job completing "${task.title}"! Keep up the excellent work.`)
        }
      }
    } catch (error: any) {
      console.error("TaskCard: Error updating task:", error)
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
          showSuccess("Task Deleted", "The task has been successfully removed.")
        } catch (error: any) {
          showError("Error", error.message)
        }
      },
      undefined,
      "Delete",
      "Cancel",
    )
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow"
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    }
  }

  const isOverdue = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const taskDate = new Date(task.dueDate)
    taskDate.setHours(0, 0, 0, 0)
    return taskDate < today && !task.completed
  }

  const getPriorityGradient = () => {
    switch (task.priority) {
      case "high":
        return ["#FF6B6B", "#FF8E8E"]
      case "medium":
        return ["#FFB347", "#FFD93D"]
      case "low":
        return ["#4ECDC4", "#6BCF7F"]
      default:
        return [theme.colors.primary, theme.colors.primaryLight]
    }
  }

  return (
    <>
      <Animated.View
        style={[
          styles.container,
          task.completed && styles.completedContainer,
          isOverdue() && styles.overdueContainer,
          {
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        {/* Priority Indicator */}
        <LinearGradient colors={getPriorityGradient()} style={styles.priorityIndicator} />

        {/* Main Content */}
        <View style={styles.content}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={handleToggleComplete} style={styles.checkbox}>
              <View
                style={[
                  styles.checkboxInner,
                  task.completed && styles.checkboxCompleted,
                  { borderColor: priorityColors[task.priority] },
                ]}
              >
                {task.completed && <Ionicons name="checkmark" size={16} color={theme.colors.text.white} />}
              </View>
            </TouchableOpacity>

            <View style={styles.taskInfo}>
              <Text style={[styles.title, task.completed && styles.completedText]} numberOfLines={2}>
                {task.title}
              </Text>
              {task.description && (
                <Text style={[styles.description, task.completed && styles.completedText]} numberOfLines={2}>
                  {task.description}
                </Text>
              )}
            </View>

            <View style={styles.actions}>
              <TouchableOpacity onPress={() => onEdit(task)} style={styles.actionButton}>
                <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
                <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer Row */}
          <View style={styles.footerRow}>
            <View style={styles.priorityBadge}>
              <View style={[styles.priorityDot, { backgroundColor: priorityColors[task.priority] }]} />
              <Text style={styles.priorityText}>{task.priority.toUpperCase()}</Text>
            </View>

            <View style={styles.dateContainer}>
              {isOverdue() && <Ionicons name="warning" size={14} color={theme.colors.error} />}
              <Text style={[styles.dateText, isOverdue() && styles.overdueText]}>{formatDate(task.dueDate)}</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Show modal for delete/error actions, but let parent handle completion */}
      {modalConfig && modalConfig.type !== "success" && (
        <CustomModal
          visible={isVisible}
          onClose={hideModal}
          title={modalConfig.title}
          message={modalConfig.message}
          type={modalConfig.type}
          buttons={modalConfig.buttons}
        />
      )}

      {/* Show success modal only if no parent handler is provided */}
      {modalConfig && modalConfig.type === "success" && !onTaskComplete && (
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
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: "hidden",
  },
  completedContainer: {
    opacity: 0.7,
  },
  overdueContainer: {
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.error,
  },
  priorityIndicator: {
    height: 4,
    width: "100%",
  },
  content: {
    padding: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: theme.spacing.md,
  },
  checkbox: {
    marginRight: theme.spacing.md,
    marginTop: 2,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
  },
  checkboxCompleted: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  taskInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.fonts.semiBold,
    lineHeight: 22,
  },
  description: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontFamily: theme.fonts.regular,
    lineHeight: 20,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: theme.colors.text.light,
  },
  actions: {
    flexDirection: "row",
    marginLeft: theme.spacing.sm,
  },
  actionButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
    marginLeft: theme.spacing.xs,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.xs,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.text.secondary,
    fontFamily: theme.fonts.semiBold,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 13,
    color: theme.colors.text.light,
    fontFamily: theme.fonts.medium,
    marginLeft: theme.spacing.xs,
  },
  overdueText: {
    color: theme.colors.error,
    fontWeight: "600",
  },
})
