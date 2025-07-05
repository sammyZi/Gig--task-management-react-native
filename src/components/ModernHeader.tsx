import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import type React from "react"
import { useEffect, useRef } from "react"
import { Animated, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { theme } from "../constants/theme"

interface ModernHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onFilterPress: () => void
  onProfilePress: () => void
  hasActiveFilters: boolean
  activeFiltersText?: string
  onEditFilters?: () => void
}

export const ModernHeader: React.FC<ModernHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onFilterPress,
  onProfilePress,
  hasActiveFilters,
  activeFiltersText,
  onEditFilters,
}) => {
  const slideAnim = useRef(new Animated.Value(-50)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
  }

  return (
    <LinearGradient colors={[theme.colors.primary, theme.colors.primaryDark]} style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        {/* Top Row */}
        <View style={styles.topRow}>
          <View style={styles.greetingContainer}>
            <Text style={styles.dateText}>{getCurrentDate()}</Text>
            <Text style={styles.titleText}>My Tasks</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={onProfilePress}>
            <LinearGradient colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)"]} style={styles.profileGradient}>
              <Ionicons name="person-outline" size={22} color={theme.colors.text.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Search Row */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color={theme.colors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search tasks..."
              value={searchQuery}
              onChangeText={onSearchChange}
              placeholderTextColor={theme.colors.text.secondary}
            />
            <TouchableOpacity
              style={[styles.filterButton, hasActiveFilters && styles.activeFilterButton]}
              onPress={onFilterPress}
            >
              <Ionicons
                name="options-outline"
                size={20}
                color={hasActiveFilters ? theme.colors.text.white : theme.colors.text.secondary}
              />
              {hasActiveFilters && <View style={styles.filterBadge} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Filters */}
        {hasActiveFilters && activeFiltersText && (
          <Animated.View style={styles.activeFiltersContainer}>
            <View style={styles.filterChip}>
              <Ionicons name="funnel" size={14} color={theme.colors.text.white} />
              <Text style={styles.activeFiltersText}>{activeFiltersText}</Text>
              <TouchableOpacity onPress={onEditFilters} style={styles.editButton}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </Animated.View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
     borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.lg,
  },
  greetingContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: theme.spacing.xs,
    fontFamily: theme.fonts.regular,
  },
  titleText: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.text.white,
    fontFamily: theme.fonts.bold,
  },
  profileButton: {
    borderRadius: 20,
    overflow: "hidden",
  },
  profileGradient: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  searchRow: {
    marginBottom: theme.spacing.md,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    height: 52,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.regular,
  },
  filterButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    position: "relative",
  },
  activeFilterButton: {
    backgroundColor: theme.colors.primary,
  },
  filterBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.warning,
  },
  activeFiltersContainer: {
    marginTop: theme.spacing.sm,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    alignSelf: "flex-start",
  },
  activeFiltersText: {
    color: theme.colors.text.white,
    fontSize: 14,
    fontFamily: theme.fonts.medium,
    marginLeft: theme.spacing.sm,
    marginRight: theme.spacing.md,
  },
  editButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  editText: {
    color: theme.colors.text.white,
    fontSize: 12,
    fontFamily: theme.fonts.semiBold,
  },
})
