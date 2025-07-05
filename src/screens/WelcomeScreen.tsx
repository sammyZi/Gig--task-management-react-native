import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import type React from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { theme } from "../constants/theme"

interface WelcomeScreenProps {
  navigation: any
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  return (
    
      <LinearGradient colors={[theme.colors.primary, theme.colors.primaryLight]} style={styles.gradient}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <View style={styles.iconBackground}>
              <Ionicons name="checkmark" size={40} color={theme.colors.text.white} />
            </View>
            <View style={[styles.decorativeCircle, styles.circle1]} />
            <View style={[styles.decorativeCircle, styles.circle2]} />
            <View style={[styles.decorativeCircle, styles.circle3]} />
          </View>

          <Text style={styles.title}>Get things done.</Text>
          <Text style={styles.subtitle}>Organize your tasks and{"\n"}maximize your productivity.</Text>

          <TouchableOpacity style={styles.getStartedButton} onPress={() => navigation.navigate("Login")}>
            <Ionicons name="arrow-forward" size={24} color={theme.colors.text.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    
  )
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  iconContainer: {
    position: "relative",
    marginBottom: theme.spacing.xxl + theme.spacing.md,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  decorativeCircle: {
    position: "absolute",
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  circle1: {
    width: 8,
    height: 8,
    top: -20,
    right: -10,
  },
  circle2: {
    width: 12,
    height: 12,
    bottom: -15,
    left: -20,
  },
  circle3: {
    width: 6,
    height: 6,
    top: 10,
    right: -25,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: theme.colors.text.white,
    textAlign: "center",
    marginBottom: theme.spacing.md,
    fontFamily: theme.fonts.bold,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: theme.spacing.xxl + theme.spacing.md,
    fontFamily: theme.fonts.regular,
  },
  getStartedButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
})
