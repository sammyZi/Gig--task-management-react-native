import { Ionicons } from "@expo/vector-icons"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { theme } from "../constants/theme"
import type { Task } from "../types/Task"
import { TaskCard } from "./TaskCard"

export interface TaskSectionProps {
  title: string
  tasks: Task[]
  onEdit: (task: Task) => void
  onTaskComplete?: (taskTitle: string) => void
  icon: string
  color: string
  showCompletionFeedback?: boolean
  collapsible?: boolean
}

export const TaskSection: React.FC<TaskSectionProps> = ({
  title,
  tasks,
  onEdit,
  onTaskComplete,
  icon,
  color,
  showCompletionFeedback = true,
  collapsible = false,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const heightAnim = useRef(new Animated.Value(1)).current
  const [isCollapsed, setIsCollapsed] = useState(collapsible)

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [])

  useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: isCollapsed ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }, [isCollapsed])

  if (tasks.length === 0) return null

  const toggleCollapse = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed)
    }
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <TouchableOpacity style={styles.header} onPress={toggleCollapse} activeOpacity={collapsible ? 0.7 : 1}>
        <View style={styles.titleContainer}>
          <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
            <Ionicons name={icon as any} size={18} color={color} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <View style={[styles.countBadge, { backgroundColor: color }]}>
            <Text style={styles.countText}>{tasks.length}</Text>
          </View>
        </View>
        {collapsible && (
          <View style={styles.collapseButton}>
            <Ionicons
              name={isCollapsed ? "chevron-down" : "chevron-up"}
              size={20}
              color={theme.colors.text.secondary}
            />
          </View>
        )}
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.tasksContainer,
          {
            opacity: heightAnim,
            transform: [
              {
                scaleY: heightAnim,
              },
            ],
          },
        ]}
      >
        {!isCollapsed &&
          tasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onTaskComplete={onTaskComplete}
              index={index}
              showCompletionFeedback={showCompletionFeedback}
            />
          ))}
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.semiBold,
    flex: 1,
  },
  countBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    minWidth: 24,
    alignItems: "center",
  },
  countText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.text.white,
    fontFamily: theme.fonts.semiBold,
  },
  collapseButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  tasksContainer: {
    gap: theme.spacing.xs,
  },
})
