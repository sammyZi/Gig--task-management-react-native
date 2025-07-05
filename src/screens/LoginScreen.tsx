import { Ionicons } from "@expo/vector-icons"
import type React from "react"
import { useState } from "react"
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { CustomModal } from "../components/CustomModal"
import { theme } from "../constants/theme"
import { useModal } from "../hooks/useModal"
import { authService } from "../services/authService"

interface LoginScreenProps {
  navigation: any
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { modalConfig, isVisible, hideModal, showError, showSuccess } = useModal()

  const getCustomErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "auth/user-not-found":
        return "No account found with this email address. Please check your email or create a new account."
      case "auth/wrong-password":
        return "Incorrect password. Please try again or reset your password."
      case "auth/invalid-email":
        return "Please enter a valid email address."
      case "auth/user-disabled":
        return "This account has been disabled. Please contact support."
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later or reset your password."
      case "auth/network-request-failed":
        return "Network error. Please check your internet connection and try again."
      case "auth/invalid-credential":
        return "Invalid email or password. Please check your credentials and try again."
      default:
        return "Login failed. Please check your credentials and try again."
    }
  }

  const handleLogin = async () => {
    if (!email || !password) {
      showError("Missing Information", "Please enter both email and password to continue.")
      return
    }

    if (!email.includes("@")) {
      showError("Invalid Email", "Please enter a valid email address.")
      return
    }

    setLoading(true)
    try {
      await authService.signIn(email, password)
      showSuccess("Welcome Back!", "You have successfully logged in.")
    } catch (error: any) {
      const errorCode = error.code || error.message
      const customMessage = getCustomErrorMessage(errorCode)
      showError("Login Failed", customMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      showError("Email Required", "Please enter your email address first, then tap 'Forgot Password' again.")
      return
    }

    if (!email.includes("@")) {
      showError("Invalid Email", "Please enter a valid email address.")
      return
    }

    try {
      await authService.resetPassword(email)
      showSuccess(
        "Reset Email Sent",
        `A password reset link has been sent to ${email}. Please check your inbox and follow the instructions.`,
      )
    } catch (error: any) {
      const errorCode = error.code || error.message
      let customMessage = "Failed to send reset email. Please try again."

      if (errorCode === "auth/user-not-found") {
        customMessage = "No account found with this email address. Please check your email or create a new account."
      } else if (errorCode === "auth/invalid-email") {
        customMessage = "Please enter a valid email address."
      }

      showError("Reset Failed", customMessage)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark" size={32} color={theme.colors.text.white} />
          </View>
          <Text style={styles.title}>Welcome back!</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={theme.colors.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                placeholderTextColor={theme.colors.text.light}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotPassword}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={theme.colors.text.secondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                autoComplete="password"
                placeholderTextColor={theme.colors.text.light}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={theme.colors.text.secondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loginButtonText}>Signing in...</Text>
              </View>
            ) : (
              <Text style={styles.loginButtonText}>Log in</Text>
            )}
          </TouchableOpacity>

          <View style={styles.socialContainer}>
            <Text style={styles.orText}>Or continue with</Text>
            <View style={styles.socialButtons}>
              <TouchableOpacity style={[styles.socialButton, styles.googleButton]}>
                <Ionicons name="logo-google" size={20} color={theme.colors.text.white} />
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialButton, styles.appleButton]}>
                <Ionicons name="logo-apple" size={20} color={theme.colors.text.white} />
                <Text style={styles.socialButtonText}>Apple</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.registerLink} onPress={() => navigation.navigate("Register")}>
            <Text style={styles.registerLinkText}>
              Don't have an account? <Text style={styles.registerLinkBold}>Get started!</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

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
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 40,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.text.primary,
    marginBottom: 8,
    fontFamily: theme.fonts.bold,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    fontFamily: theme.fonts.regular,
  },
  form: {
    flex: 1,
    paddingHorizontal: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.semiBold,
  },
  forgotPassword: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: "600",
    fontFamily: theme.fonts.semiBold,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
  },
  inputIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.regular,
  },
  eyeIcon: {
    padding: theme.spacing.xs,
  },
  loginButton: {
    height: 52,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loginButtonText: {
    color: theme.colors.text.white,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: theme.fonts.semiBold,
  },
  socialContainer: {
    alignItems: "center",
    marginTop: 32,
  },
  orText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 20,
    fontFamily: theme.fonts.regular,
  },
  socialButtons: {
    flexDirection: "row",
    gap: 12,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    gap: 8,
  },
  googleButton: {
    backgroundColor: "#DB4437",
  },
  appleButton: {
    backgroundColor: "#000000",
  },
  socialButtonText: {
    color: theme.colors.text.white,
    fontSize: 14,
    fontWeight: "500",
    fontFamily: theme.fonts.medium,
  },
  registerLink: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 20,
  },
  registerLinkText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontFamily: theme.fonts.regular,
  },
  registerLinkBold: {
    color: theme.colors.primary,
    fontWeight: "600",
    fontFamily: theme.fonts.semiBold,
  },
})
