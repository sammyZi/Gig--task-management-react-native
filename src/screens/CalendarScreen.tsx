import { Ionicons } from "@expo/vector-icons"
import type React from "react"
import { useEffect, useState } from "react"
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Calendar } from "react-native-calendars"
import { CustomModal } from "../components/CustomModal"
import { SafeContainer } from "../components/SafeContainer"
import { TaskItem } from "../components/TaskItem"
import { theme } from "../constants/theme"
import { useModal } from "../hooks/useModal"
import { taskService } from "../services/taskService"
import { useAuthStore } from "../store/authStore"
import { useTaskStore } from "../store/taskStore"

interface CalendarScreenProps {
  navigation: any
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({ navigation }) => {
  const { tasks, setTasks } = useTaskStore()
  const { user } = useAuthStore()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const { modalConfig, isVisible, hideModal } = useModal()

  useEffect(() => {
    if (user) {
      const unsubscribe = taskService.subscribeToTasks(user.id, setTasks)
      return unsubscribe
    }
  }, [user])

  const getMarkedDates = () => {
    const marked: any = {}

    tasks.forEach((task) => {
      // More reliable date string conversion that handles timezones
      const date = new Date(task.dueDate)
      const dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
        .toISOString()
        .split("T")[0]

      if (!marked[dateString]) {
        marked[dateString] = { dots: [] }
      }

      // Completed tasks always get gray dots
      const color = task.completed
        ? theme.colors.text.light // Gray color for completed tasks
        : task.priority === "high"
          ? theme.colors.error
          : task.priority === "medium"
            ? theme.colors.warning
            : theme.colors.accent

      marked[dateString].dots.push({ color })
    })

    // Mark selected date
    marked[selectedDate] = {
      ...(marked[selectedDate] || { dots: [] }),
      selected: true,
      selectedColor: theme.colors.primary,
    }

    return marked
  }

  const getTasksForDate = (dateString: string) => {
    return tasks.filter((task) => {
      const taskDate = new Date(task.dueDate)
      const taskDateString = new Date(taskDate.getTime() - (taskDate.getTimezoneOffset() * 60000))
        .toISOString()
        .split("T")[0]
      return taskDateString === dateString
    })
  }

  const selectedDateTasks = getTasksForDate(selectedDate)

  const formatSelectedDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <SafeContainer>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendar</Text>
        <TouchableOpacity
          style={styles.todayButton}
          onPress={() => setSelectedDate(new Date().toISOString().split("T")[0])}
        >
          <Text style={styles.todayButtonText}>Today</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Calendar
          key={`calendar-${tasks.length}`} // Force re-render when tasks change
          current={selectedDate}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={getMarkedDates()}
          markingType="multi-dot"
          theme={{
            backgroundColor: theme.colors.surface,
            calendarBackground: theme.colors.surface,
            textSectionTitleColor: theme.colors.text.secondary,
            selectedDayBackgroundColor: theme.colors.primary,
            selectedDayTextColor: theme.colors.text.white,
            todayTextColor: theme.colors.primary,
            dayTextColor: theme.colors.text.primary,
            textDisabledColor: theme.colors.text.light,
            dotColor: theme.colors.primary,
            selectedDotColor: theme.colors.text.white,
            arrowColor: theme.colors.primary,
            monthTextColor: theme.colors.text.primary,
            indicatorColor: theme.colors.primary,
            textDayFontFamily: theme.fonts.regular,
            textMonthFontFamily: theme.fonts.semiBold,
            textDayHeaderFontFamily: theme.fonts.medium,
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14,
          }}
          style={styles.calendar}
        />

        <View style={styles.tasksSection}>
          <Text style={styles.selectedDateText}>{formatSelectedDate(selectedDate)}</Text>

          {selectedDateTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color={theme.colors.text.light} />
              <Text style={styles.emptyTitle}>No tasks for this day</Text>
              <Text style={styles.emptySubtitle}>Tap the + button to create a new task</Text>
            </View>
          ) : (
            <View style={styles.tasksList}>
              {selectedDateTasks.map((task) => (
                <TaskItem key={task.id} task={task} onEdit={(task) => navigation.navigate("AddEditTask", { task })} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          navigation.navigate("AddEditTask", {
            defaultDate: new Date(selectedDate),
          })
        }
      >
        <Ionicons name="add" size={24} color={theme.colors.text.white} />
      </TouchableOpacity>

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
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.semiBold,
  },
  todayButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
  },
  todayButtonText: {
    color: theme.colors.text.white,
    fontWeight: "500",
    fontFamily: theme.fonts.medium,
  },
  calendar: {
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.md,
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tasksSection: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 100, // Space for FAB
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
    fontFamily: theme.fonts.semiBold,
  },
  tasksList: {
    gap: theme.spacing.sm,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.xxl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.semiBold,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: "center",
    fontFamily: theme.fonts.regular,
  },
  fab: {
    position: "absolute",
    bottom: theme.spacing.xl,
    right: theme.spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
})