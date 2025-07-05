import { Ionicons } from "@expo/vector-icons"
import type React from "react"
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { priorityColors, theme } from "../constants/theme"
import { useTaskStore } from "../store/taskStore"

interface FilterModalProps {
  visible: boolean
  onClose: () => void
}

export const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose }) => {
  const { filter, setFilter } = useTaskStore()

  const priorityOptions = [
    { value: "all", label: "All Priorities" },
    { value: "high", label: "High Priority" },
    { value: "medium", label: "Medium Priority" },
    { value: "low", label: "Low Priority" },
  ]

  const statusOptions = [
    { value: "all", label: "All Tasks" },
    { value: "incomplete", label: "Active Tasks" },
    { value: "completed", label: "Completed Tasks" },
  ]

  const handlePrioritySelect = (priority: typeof filter.priority) => {
    setFilter({ priority })
  }

  const handleStatusSelect = (status: typeof filter.status) => {
    setFilter({ status })
  }

  const clearFilters = () => {
    setFilter({ priority: "all", status: "all" })
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Filter Tasks</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Priority</Text>
            {priorityOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.option, filter.priority === option.value && styles.selectedOption]}
                onPress={() => handlePrioritySelect(option.value as any)}
              >
                <View style={styles.optionContent}>
                  {option.value !== "all" && (
                    <View
                      style={[
                        styles.priorityDot,
                        { backgroundColor: priorityColors[option.value as keyof typeof priorityColors] },
                      ]}
                    />
                  )}
                  <Text style={[styles.optionText, filter.priority === option.value && styles.selectedOptionText]}>
                    {option.label}
                  </Text>
                </View>
                {filter.priority === option.value && (
                  <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.option, filter.status === option.value && styles.selectedOption]}
                onPress={() => handleStatusSelect(option.value as any)}
              >
                <Text style={[styles.optionText, filter.status === option.value && styles.selectedOptionText]}>
                  {option.label}
                </Text>
                {filter.status === option.value && <Ionicons name="checkmark" size={20} color={theme.colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear Filters</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={onClose}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingBottom: theme.spacing.lg,
    maxHeight: Dimensions.get("window").height * 0.8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.semiBold,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    fontFamily: theme.fonts.semiBold,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  selectedOption: {
    backgroundColor: `${theme.colors.primary}10`,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.md,
  },
  optionText: {
    fontSize: 16,
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.regular,
  },
  selectedOptionText: {
    color: theme.colors.primary,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  clearButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    fontFamily: theme.fonts.medium,
  },
  applyButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 16,
    color: theme.colors.text.white,
    fontFamily: theme.fonts.medium,
  },
})
