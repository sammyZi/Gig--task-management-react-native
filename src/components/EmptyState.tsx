import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import type React from "react"
import { useEffect, useRef } from "react"
import { Animated, StyleSheet, Text, TouchableOpacity } from "react-native"
import { theme } from "../constants/theme"

interface EmptyStateProps {
  hasActiveFilters: boolean
  onCreateTask: () => void
}

export const EmptyState: React.FC<EmptyStateProps> = ({ hasActiveFilters, onCreateTask }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={[`${theme.colors.primary}10`, `${theme.colors.primaryLight}05`]}
        style={styles.iconContainer}
      >
        <Ionicons
          name={hasActiveFilters ? "funnel-outline" : "clipboard-outline"}
          size={64}
          color={theme.colors.primary}
        />
      </LinearGradient>

      <Text style={styles.title}>{hasActiveFilters ? "No matching tasks" : "No tasks yet"}</Text>

      <Text style={styles.subtitle}>
        {hasActiveFilters
          ? "Try adjusting your filters or search terms to find what you're looking for"
          : "Create your first task to get started on your productivity journey"}
      </Text>

      {!hasActiveFilters && (
        <TouchableOpacity style={styles.createButton} onPress={onCreateTask}>
          <LinearGradient colors={[theme.colors.primary, theme.colors.primaryLight]} style={styles.buttonGradient}>
            <Ionicons name="add" size={20} color={theme.colors.text.white} />
            <Text style={styles.buttonText}>Create Task</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.xxl * 2,
    paddingHorizontal: theme.spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    fontFamily: theme.fonts.semiBold,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
    fontFamily: theme.fonts.regular,
  },
  createButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text.white,
    fontFamily: theme.fonts.semiBold,
  },
})
