import { Ionicons } from "@expo/vector-icons"
import type React from "react"
import { useEffect, useRef } from "react"
import { Animated, Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { priorityColors, theme } from "../constants/theme"
import { useTaskStore } from "../store/taskStore"

interface FilterBottomSheetProps {
  visible: boolean
  onClose: () => void
}

export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({ visible, onClose }) => {
  const { filter, setFilter } = useTaskStore()
  const slideAnim = useRef(new Animated.Value(Dimensions.get("window").height)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: Dimensions.get("window").height,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible])

  const statusOptions = [
    { value: "all", label: "All Tasks", icon: "list-outline", count: 0 },
    { value: "incomplete", label: "Active", icon: "radio-button-off-outline", count: 0 },
    { value: "completed", label: "Completed", icon: "checkmark-circle-outline", count: 0 },
  ]

  const priorityOptions = [
    { value: "all", label: "All Priorities", color: theme.colors.text.light },
    { value: "high", label: "High Priority", color: priorityColors.high },
    { value: "medium", label: "Medium Priority", color: priorityColors.medium },
    { value: "low", label: "Low Priority", color: priorityColors.low },
  ]

  const handleStatusSelect = (status: typeof filter.status) => {
    setFilter({ status })
  }

  const handlePrioritySelect = (priority: typeof filter.priority) => {
    setFilter({ priority })
  }

  const clearFilters = () => {
    setFilter({ priority: "all", status: "all" })
  }

  const hasActiveFilters = filter.priority !== "all" || filter.status !== "all"

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.overlayTouch} activeOpacity={1} onPress={onClose} />
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Filter Tasks</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Status Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Status</Text>
              <View style={styles.optionsGrid}>
                {statusOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.statusOption, filter.status === option.value && styles.selectedOption]}
                    onPress={() => handleStatusSelect(option.value as any)}
                  >
                    <View style={styles.statusOptionContent}>
                      <View
                        style={[
                          styles.statusIconContainer,
                          filter.status === option.value && styles.selectedIconContainer,
                        ]}
                      >
                        <Ionicons
                          name={option.icon as any}
                          size={20}
                          color={filter.status === option.value ? theme.colors.text.white : theme.colors.primary}
                        />
                      </View>
                      <Text
                        style={[styles.statusOptionText, filter.status === option.value && styles.selectedOptionText]}
                      >
                        {option.label}
                      </Text>
                    </View>
                    {filter.status === option.value && (
                      <View style={styles.checkmark}>
                        <Ionicons name="checkmark" size={16} color={theme.colors.primary} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Priority Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Priority</Text>
              <View style={styles.priorityGrid}>
                {priorityOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.priorityOption, filter.priority === option.value && styles.selectedPriorityOption]}
                    onPress={() => handlePrioritySelect(option.value as any)}
                  >
                    <View style={styles.priorityContent}>
                      <View style={[styles.priorityDot, { backgroundColor: option.color }]} />
                      <Text
                        style={[
                          styles.priorityOptionText,
                          filter.priority === option.value && styles.selectedPriorityText,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </View>
                    {filter.priority === option.value && (
                      <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.clearButton, !hasActiveFilters && styles.disabledButton]}
              onPress={clearFilters}
              disabled={!hasActiveFilters}
            >
              <Ionicons name="refresh-outline" size={18} color={theme.colors.text.secondary} />
              <Text style={[styles.clearButtonText, !hasActiveFilters && styles.disabledButtonText]}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={onClose}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  overlayTouch: {
    flex: 1,
  },
  container: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: Dimensions.get("window").height * 0.85,
    paddingBottom: theme.spacing.lg,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.semiBold,
  },
  closeButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
  },
  section: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    fontFamily: theme.fonts.semiBold,
  },
  optionsGrid: {
    gap: theme.spacing.md,
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  selectedOption: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}08`,
  },
  statusOptionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  selectedIconContainer: {
    backgroundColor: theme.colors.primary,
  },
  statusOptionText: {
    fontSize: 16,
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.medium,
  },
  selectedOptionText: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
  },
  priorityGrid: {
    gap: theme.spacing.sm,
  },
  priorityOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
  },
  selectedPriorityOption: {
    backgroundColor: `${theme.colors.primary}08`,
  },
  priorityContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.md,
  },
  priorityOptionText: {
    fontSize: 16,
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.medium,
  },
  selectedPriorityText: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  clearButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    gap: theme.spacing.sm,
  },
  disabledButton: {
    opacity: 0.5,
  },
  clearButtonText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    fontFamily: theme.fonts.medium,
  },
  disabledButtonText: {
    color: theme.colors.text.light,
  },
  applyButton: {
    flex: 2,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    fontSize: 16,
    color: theme.colors.text.white,
    fontFamily: theme.fonts.semiBold,
  },
})
