import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import type React from "react"
import { useEffect, useState } from "react"
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from "react-native"
import { CustomModal } from "../components/CustomModal"
import { EmptyState } from "../components/EmptyState"
import { FilterBottomSheet } from "../components/FilterBottomSheet"
import { ModernHeader } from "../components/ModernHeader"
import { SafeContainer } from "../components/SafeContainer"
import { TaskSection } from "../components/TaskSection"
import { theme } from "../constants/theme"
import { useModal } from "../hooks/useModal"
import { taskService } from "../services/taskService"
import { useAuthStore } from "../store/authStore"
import { useTaskStore } from "../store/taskStore"
import type { Task } from "../types/Task"

interface TaskListScreenProps {
  navigation: any
}

export const TaskListScreen: React.FC<TaskListScreenProps> = ({ navigation }) => {
  const { tasks, filter, setTasks } = useTaskStore()
  const { user } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilterSheet, setShowFilterSheet] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const { modalConfig, isVisible, hideModal, showSuccess } = useModal()

  useEffect(() => {
    if (user) {
      console.log("TaskListScreen: Setting up task subscription for user:", user.id)
      setLoading(true)

      const unsubscribe = taskService.subscribeToTasks(user.id, (fetchedTasks) => {
        console.log("TaskListScreen: Received tasks from subscription:", fetchedTasks.length)
        setTasks(fetchedTasks)
        setLoading(false)
      })

      return () => {
        console.log("TaskListScreen: Cleaning up task subscription")
        unsubscribe()
      }
    }
  }, [user, setTasks])

  const onRefresh = async () => {
    if (!user) return

    setRefreshing(true)
    try {
      const freshTasks = await taskService.getTasks(user.id)
      setTasks(freshTasks)
    } catch (error) {
      console.error("Error refreshing tasks:", error)
    }
    setRefreshing(false)
  }

  const handleTaskComplete = (taskTitle: string) => {
    console.log("TaskListScreen: Handling task completion for:", taskTitle)
    showSuccess("Task Completed!", `Great job completing ! Keep up the excellent work.`)
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = filter.priority === "all" || task.priority === filter.priority
    const matchesStatus =
      filter.status === "all" ||
      (filter.status === "completed" && task.completed) ||
      (filter.status === "incomplete" && !task.completed)

    return matchesSearch && matchesPriority && matchesStatus
  })

  const groupTasksByDate = (tasks: Task[]) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const thisWeek = new Date(today)
    thisWeek.setDate(thisWeek.getDate() + 7)

    const groups = {
      overdue: [] as Task[],
      today: [] as Task[],
      tomorrow: [] as Task[],
      thisWeek: [] as Task[],
      later: [] as Task[],
      completed: [] as Task[],
    }

    tasks.forEach((task) => {
      if (task.completed) {
        groups.completed.push(task)
        return
      }

      const taskDate = new Date(task.dueDate)
      taskDate.setHours(0, 0, 0, 0)
      today.setHours(0, 0, 0, 0)

      if (taskDate < today) {
        groups.overdue.push(task)
      } else if (taskDate.toDateString() === today.toDateString()) {
        groups.today.push(task)
      } else if (taskDate.toDateString() === tomorrow.toDateString()) {
        groups.tomorrow.push(task)
      } else if (taskDate <= thisWeek) {
        groups.thisWeek.push(task)
      } else {
        groups.later.push(task)
      }
    })

    return groups
  }

  const groupedTasks = groupTasksByDate(filteredTasks)
  const hasActiveFilters = filter.priority !== "all" || filter.status !== "all"

  const getFilterBadgeText = () => {
    const filters = []
    if (filter.status !== "all") {
      filters.push(filter.status === "completed" ? "Completed" : "Active")
    }
    if (filter.priority !== "all") {
      filters.push(`${filter.priority.charAt(0).toUpperCase() + filter.priority.slice(1)} Priority`)
    }
    return filters.length > 0 ? filters.join(" • ") : undefined
  }

  const activeSections = [
    { title: "Today", tasks: groupedTasks.today, icon: "today", color: theme.colors.primary },
    { title: "Tomorrow", tasks: groupedTasks.tomorrow, icon: "calendar", color: theme.colors.accent },
    { title: "This Week", tasks: groupedTasks.thisWeek, icon: "time", color: theme.colors.warning },
    { title: "Later", tasks: groupedTasks.later, icon: "infinite", color: theme.colors.text.secondary },
  ]

  const overdueSection = {
    title: "Overdue",
    tasks: groupedTasks.overdue,
    icon: "warning",
    color: theme.colors.error,
  }

  const completedSection = {
    title: "Completed",
    tasks: groupedTasks.completed,
    icon: "checkmark-circle",
    color: theme.colors.success,
  }

  const shouldShowCompleted = completedSection.tasks.length > 0 && filter.status !== "incomplete"

  if (loading) {
    return (
      <SafeContainer edges={["top"]}>
        <ModernHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onFilterPress={() => setShowFilterSheet(true)}
          onProfilePress={() => navigation.navigate("Profile")}
          hasActiveFilters={hasActiveFilters}
          activeFiltersText={getFilterBadgeText()}
          onEditFilters={() => setShowFilterSheet(true)}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeContainer>
    )
  }

  return (
    <SafeContainer edges={["top"]}>
      <ModernHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterPress={() => setShowFilterSheet(true)}
        onProfilePress={() => navigation.navigate("Profile")}
        hasActiveFilters={hasActiveFilters}
        activeFiltersText={getFilterBadgeText()}
        onEditFilters={() => setShowFilterSheet(true)}
      />

      <FlatList
        data={[1]}
        renderItem={() => (
          <View style={styles.content}>
            {filteredTasks.length === 0 ? (
              <EmptyState hasActiveFilters={hasActiveFilters} onCreateTask={() => navigation.navigate("AddEditTask")} />
            ) : (
              <>
                {/* Active Tasks */}
                {activeSections.map((section) => (
                  <TaskSection
                    key={section.title}
                    title={section.title}
                    tasks={section.tasks}
                    onEdit={(task) => navigation.navigate("AddEditTask", { task })}
                    onTaskComplete={handleTaskComplete}
                    icon={section.icon}
                    color={section.color}
                    showCompletionFeedback={true}
                    collapsible={false}
                  />
                ))}

                {/* Overdue Tasks Section */}
                {overdueSection.tasks.length > 0 && (
                  <TaskSection
                    key={overdueSection.title}
                    title={overdueSection.title}
                    tasks={overdueSection.tasks}
                    onEdit={(task) => navigation.navigate("AddEditTask", { task })}
                    onTaskComplete={handleTaskComplete}
                    icon={overdueSection.icon}
                    color={overdueSection.color}
                    showCompletionFeedback={true}
                    collapsible={true}
                  />
                )}

                {/* Completed Tasks Section */}
                {shouldShowCompleted && (
                  <TaskSection
                    key={completedSection.title}
                    title={completedSection.title}
                    tasks={completedSection.tasks}
                    onEdit={(task) => navigation.navigate("AddEditTask", { task })}
                    icon={completedSection.icon}
                    color={completedSection.color}
                    showCompletionFeedback={false}
                    collapsible={true}
                  />
                )}
              </>
            )}
          </View>
        )}
        keyExtractor={() => "tasks"}
        style={styles.taskList}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate("AddEditTask")}>
        <LinearGradient colors={[theme.colors.primary, theme.colors.primaryLight]} style={styles.fabGradient}>
          <Ionicons name="add" size={24} color={theme.colors.text.white} />
        </LinearGradient>
      </TouchableOpacity>

      <FilterBottomSheet visible={showFilterSheet} onClose={() => setShowFilterSheet(false)} />

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
    </SafeContainer>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 100,
  },
  taskList: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  fab: {
    position: "absolute",
    bottom: theme.spacing.xl,
    right: theme.spacing.xl,
    borderRadius: 28,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
})
