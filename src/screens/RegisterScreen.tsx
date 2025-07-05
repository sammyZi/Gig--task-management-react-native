import { Ionicons } from "@expo/vector-icons"
import type React from "react"
import { useState } from "react"
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
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

interface RegisterScreenProps {
  navigation: any
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { modalConfig, isVisible, hideModal, showError, showSuccess } = useModal()

  const getCustomErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "auth/email-already-in-use":
        return "An account with this email already exists. Please use a different email or try logging in."
      case "auth/invalid-email":
        return "Please enter a valid email address."
      case "auth/operation-not-allowed":
        return "Email/password accounts are not enabled. Please contact support."
      case "auth/weak-password":
        return "Password is too weak. Please use at least 6 characters with a mix of letters and numbers."
      case "auth/network-request-failed":
        return "Network error. Please check your internet connection and try again."
      default:
        return "Account creation failed. Please try again."
    }
  }

  const validateInputs = () => {
    if (!email || !password || !confirmPassword) {
      showError("Missing Information", "Please fill in all fields to create your account.")
      return false
    }

    if (!email.includes("@") || !email.includes(".")) {
      showError("Invalid Email", "Please enter a valid email address (e.g., user@example.com).")
      return false
    }

    if (password.length < 6) {
      showError("Weak Password", "Password must be at least 6 characters long for security.")
      return false
    }

    if (password !== confirmPassword) {
      showError("Password Mismatch", "Passwords do not match. Please make sure both passwords are identical.")
      return false
    }

    // Additional password strength check
    if (!/(?=.*[a-zA-Z])/.test(password)) {
      showError("Weak Password", "Password should contain at least one letter for better security.")
      return false
    }

    return true
  }

  const handleRegister = async () => {
    if (!validateInputs()) return

    setLoading(true)
    try {
      await authService.signUp(email, password)
      showSuccess(
        "Account Created Successfully!",
        "Welcome to Gig Task Manager! You can now start organizing your tasks and boosting your productivity.",
      )
    } catch (error: any) {
      const errorCode = error.code || error.message
      const customMessage = getCustomErrorMessage(errorCode)
      showError("Registration Failed", customMessage)
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrength = () => {
    if (password.length === 0) return { strength: 0, text: "", color: theme.colors.text.light }
    if (password.length < 6) return { strength: 1, text: "Weak", color: theme.colors.error }
    if (password.length < 8) return { strength: 2, text: "Fair", color: theme.colors.warning }
    if (password.length >= 8 && /(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
      return { strength: 3, text: "Strong", color: theme.colors.success }
    }
    return { strength: 2, text: "Good", color: theme.colors.accent }
  }

  const passwordStrength = getPasswordStrength()

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="person-add" size={32} color={theme.colors.text.white} />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us and start organizing your tasks</Text>
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
              <Text style={styles.label}>Password</Text>
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
                  placeholder="Create a password"
                  secureTextEntry={!showPassword}
                  autoComplete="password-new"
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
              {password.length > 0 && (
                <View style={styles.passwordStrength}>
                  <View style={styles.strengthBar}>
                    <View
                      style={[
                        styles.strengthFill,
                        {
                          width: `${(passwordStrength.strength / 3) * 100}%`,
                          backgroundColor: passwordStrength.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.strengthText, { color: passwordStrength.color }]}>{passwordStrength.text}</Text>
                </View>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={theme.colors.text.secondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="password-new"
                  placeholderTextColor={theme.colors.text.light}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                  <Ionicons
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={theme.colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && (
                <View style={styles.matchIndicator}>
                  <Ionicons
                    name={password === confirmPassword ? "checkmark-circle" : "close-circle"}
                    size={16}
                    color={password === confirmPassword ? theme.colors.success : theme.colors.error}
                  />
                  <Text
                    style={[
                      styles.matchText,
                      { color: password === confirmPassword ? theme.colors.success : theme.colors.error },
                    ]}
                  >
                    {password === confirmPassword ? "Passwords match" : "Passwords don't match"}
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.signUpButton, loading && styles.disabledButton]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.signUpButtonText}>Creating Account...</Text>
                </View>
              ) : (
                <Text style={styles.signUpButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.socialContainer}>
              <Text style={styles.orText}>Or sign up with</Text>
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

            <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLinkText}>
                Already have an account? <Text style={styles.loginLinkBold}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    textAlign: "center",
    fontFamily: theme.fonts.regular,
  },
  form: {
    flex: 1,
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text.primary,
    marginBottom: 8,
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
  passwordStrength: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  strengthFill: {
    height: "100%",
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "500",
    fontFamily: theme.fonts.medium,
  },
  matchIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },
  matchText: {
    fontSize: 12,
    fontWeight: "500",
    fontFamily: theme.fonts.medium,
  },
  signUpButton: {
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
  signUpButtonText: {
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
  loginLink: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 20,
  },
  loginLinkText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontFamily: theme.fonts.regular,
  },
  loginLinkBold: {
    color: theme.colors.primary,
    fontWeight: "600",
    fontFamily: theme.fonts.semiBold,
  },
})
