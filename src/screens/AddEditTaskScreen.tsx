import { Ionicons } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"
import type React from "react"
import { useState } from "react"
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { CustomModal } from "../components/CustomModal"
import { SafeContainer } from "../components/SafeContainer"
import { priorityColors, theme } from "../constants/theme"
import { useModal } from "../hooks/useModal"
import { taskService } from "../services/taskService"
import { useAuthStore } from "../store/authStore"
import { useTaskStore } from "../store/taskStore"
import type { Task } from "../types/Task"

interface AddEditTaskScreenProps {
  navigation: any
  route: any
}

export const AddEditTaskScreen: React.FC<AddEditTaskScreenProps> = ({ navigation, route }) => {
  const { task, defaultDate } = route.params || {}
  const isEditing = !!task
  const { updateTask } = useTaskStore() // Remove addTask since we rely on real-time updates
  const { user } = useAuthStore()
  const { modalConfig, isVisible, hideModal, showError, showSuccess } = useModal()

  const [title, setTitle] = useState(task?.title || "")
  const [description, setDescription] = useState(task?.description || "")
  const [dueDate, setDueDate] = useState(task?.dueDate || defaultDate || new Date())
  const [priority, setPriority] = useState<"low" | "medium" | "high">(task?.priority || "medium")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!title.trim()) {
      showError("Missing Information", "Please enter a task title to continue.")
      return
    }

    if (!user) {
      showError("Authentication Error", "You need to be signed in to create or edit tasks.")
      return
    }

    setLoading(true)
    try {
      if (isEditing) {
        const updates = {
          title: title.trim(),
          description: description.trim(),
          dueDate,
          priority,
        }
        await taskService.updateTask(task.id, updates)
        updateTask(task.id, updates)
        showSuccess("Task Updated", "Your task has been successfully updated!", () => {
          hideModal()
          navigation.goBack()
        })
      } else {
        const newTask: Omit<Task, "id" | "createdAt" | "updatedAt"> = {
          title: title.trim(),
          description: description.trim(),
          dueDate,
          priority,
          completed: false,
          userId: user.id,
        }

        // Only create in Firestore, let real-time subscription handle adding to store
        await taskService.createTask(newTask)

        showSuccess("Task Created", "Your new task has been successfully created!", () => {
          hideModal()
          navigation.goBack()
        })
      }
    } catch (error: any) {
      showError("Error", "Failed to save task. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios")
    if (selectedDate) {
      setDueDate(selectedDate)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <>
      <SafeContainer>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditing ? "Edit Task" : "New Task"}</Text>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.disabledButton]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>{loading ? "Saving..." : "Save"}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Task Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter task title"
              multiline
              placeholderTextColor={theme.colors.text.light}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter task description (optional)"
              multiline
              numberOfLines={4}
              placeholderTextColor={theme.colors.text.light}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Due Date</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.dateText}>{formatDate(dueDate)}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityContainer}>
              {(["low", "medium", "high"] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.priorityButton,
                    {
                      backgroundColor: priority === level ? priorityColors[level] : theme.colors.background,
                      borderColor: priorityColors[level],
                    },
                  ]}
                  onPress={() => setPriority(level)}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      {
                        color: priority === level ? theme.colors.text.white : priorityColors[level],
                      },
                    ]}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {showDatePicker && (
          <DateTimePicker
            value={dueDate}
            mode="date"
            display="default"
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}
      </SafeContainer>

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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.semiBold,
  },
  saveButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: theme.colors.text.white,
    fontWeight: "600",
    fontFamily: theme.fonts.semiBold,
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  inputContainer: {
    marginBottom: theme.spacing.xl,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.semiBold,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.regular,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  dateText: {
    fontSize: 16,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.md,
    fontFamily: theme.fonts.regular,
  },
  priorityContainer: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    alignItems: "center",
  },
  priorityText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: theme.fonts.semiBold,
  },
})
