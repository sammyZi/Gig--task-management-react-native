import { Ionicons } from "@expo/vector-icons"
import type React from "react"
import { useEffect, useRef } from "react"
import { Animated, Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { theme } from "../constants/theme"

interface CustomModalProps {
  visible: boolean
  onClose: () => void
  title: string
  message?: string
  type?: "success" | "error" | "warning" | "info"
  buttons?: {
    text: string
    onPress: () => void
    style?: "default" | "destructive" | "cancel"
  }[]
  children?: React.ReactNode
}

export const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  title,
  message,
  type = "info",
  buttons = [{ text: "OK", onPress: onClose }],
  children,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible])

  const getIconAndColor = () => {
    switch (type) {
      case "success":
        return { icon: "checkmark-circle", color: theme.colors.success }
      case "error":
        return { icon: "close-circle", color: theme.colors.error }
      case "warning":
        return { icon: "warning", color: theme.colors.warning }
      default:
        return { icon: "information-circle", color: theme.colors.primary }
    }
  }

  const { icon, color } = getIconAndColor()

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.overlayTouch} activeOpacity={1} onPress={onClose} />
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
              <Ionicons name={icon as any} size={32} color={color} />
            </View>
            <Text style={styles.title}>{title}</Text>
            {message && <Text style={styles.message}>{message}</Text>}
          </View>

          {children && <View style={styles.content}>{children}</View>}

          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  button.style === "destructive" && styles.destructiveButton,
                  button.style === "cancel" && styles.cancelButton,
                  buttons.length === 1 && styles.singleButton,
                ]}
                onPress={button.onPress}
              >
                <Text
                  style={[
                    styles.buttonText,
                    button.style === "destructive" && styles.destructiveButtonText,
                    button.style === "cancel" && styles.cancelButtonText,
                  ]}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
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
    justifyContent: "center",
    alignItems: "center",
  },
  overlayTouch: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.xl,
    maxWidth: Dimensions.get("window").width - theme.spacing.xl * 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: "center",
    paddingTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.text.primary,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.semiBold,
  },
  message: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
    fontFamily: theme.fonts.regular,
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  buttonContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.md + 2,
    alignItems: "center",
    backgroundColor: theme.colors.primary,
  },
  singleButton: {
    borderBottomLeftRadius: theme.borderRadius.lg,
    borderBottomRightRadius: theme.borderRadius.lg,
  },
  cancelButton: {
    backgroundColor: theme.colors.surface,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
    borderBottomLeftRadius: theme.borderRadius.lg,
  },
  destructiveButton: {
    backgroundColor: theme.colors.error,
    borderBottomRightRadius: theme.borderRadius.lg,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text.white,
    fontFamily: theme.fonts.semiBold,
  },
  cancelButtonText: {
    color: theme.colors.text.secondary,
  },
  destructiveButtonText: {
    color: theme.colors.text.white,
  },
})
