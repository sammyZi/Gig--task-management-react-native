import type React from "react"
import { StyleSheet, Text, View } from "react-native"
import { priorityColors, theme } from "../constants/theme"

interface PriorityBadgeProps {
  priority: "low" | "medium" | "high"
  size?: "small" | "medium"
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = "medium" }) => {
  const backgroundColor = priorityColors[priority]
  const isSmall = size === "small"

  return (
    <View style={[styles.badge, { backgroundColor }, isSmall && styles.smallBadge]}>
      <Text style={[styles.text, isSmall && styles.smallText]}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs + 2,
    borderRadius: theme.borderRadius.md,
    alignSelf: "flex-start",
  },
  smallBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.text.white,
    fontFamily: theme.fonts.semiBold,
  },
  smallText: {
    fontSize: 10,
  },
})
