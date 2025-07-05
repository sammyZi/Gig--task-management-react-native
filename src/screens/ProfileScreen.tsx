import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CustomModal } from "../components/CustomModal";
import { theme } from "../constants/theme";
import { useModal } from "../hooks/useModal";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/authStore";

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { modalConfig, isVisible, hideModal, showError, showConfirm } =
    useModal();

  const getCustomErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "auth/network-request-failed":
        return "Network error. Please check your internet connection and try again.";
      case "auth/too-many-requests":
        return "Too many requests. Please try again later.";
      default:
        return "An error occurred. Please try again.";
    }
  };

  const handleSignOut = () => {
    showConfirm(
      "Sign Out",
      "Are you sure you want to sign out of your account?",
      async () => {
        try {
          await authService.signOut();
        } catch (error: any) {
          const errorCode = error.code || error.message;
          const customMessage = getCustomErrorMessage(errorCode);
          showError("Sign Out Failed", customMessage);
        }
      },
      undefined,
      "Sign Out",
      "Cancel"
    );
  };

  const handleResetPassword = () => {
    if (!user?.email) {
      showError("Error", "No email address found for your account.");
      return;
    }

    showConfirm(
      "Reset Password",
      `Send password reset instructions to ${user.email}?`,
      async () => {
        try {
          await authService.resetPassword(user.email);
          showError(
            "Reset Email Sent",
            `Password reset instructions have been sent to ${user.email}. Please check your inbox.`
          );
        } catch (error: any) {
          const errorCode = error.code || error.message;
          let customMessage = "Failed to send reset email. Please try again.";

          if (errorCode === "auth/user-not-found") {
            customMessage = "No account found with this email address.";
          } else if (errorCode === "auth/invalid-email") {
            customMessage = "Invalid email address.";
          }

          showError("Reset Failed", customMessage);
        }
      },
      undefined,
      "Send Reset Email",
      "Cancel"
    );
  };

  const menuItems = [
    {
      icon: "person-outline",
      title: "Edit Profile",
      subtitle: "Update your personal information",
      onPress: () => {},
    },
    {
      icon: "notifications-outline",
      title: "Notifications",
      subtitle: "Manage your notification preferences",
      onPress: () => {},
    },
    {
      icon: "lock-closed-outline",
      title: "Change Password",
      subtitle: "Update your account password",
      onPress: handleResetPassword,
    },
    {
      icon: "help-circle-outline",
      title: "Help & Support",
      subtitle: "Get help and contact support",
      onPress: () => {},
    },
    {
      icon: "information-circle-outline",
      title: "About",
      subtitle: "App version and information",
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryLight]}
          style={[styles.header, { paddingBottom: 40 }]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.text.white}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.placeholder} />
        </LinearGradient>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryLight]}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </Text>
            </LinearGradient>
          </View>
          <Text style={styles.emailText}>{user?.email}</Text>
          <Text style={styles.memberSince}>
            Member since {new Date().getFullYear()}
          </Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                  <Ionicons
                    name={item.icon as any}
                    size={22}
                    color={theme.colors.primary}
                  />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.text.light}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <View style={styles.signOutContent}>
            <Ionicons
              name="log-out-outline"
              size={24}
              color={theme.colors.error}
            />
            <Text style={styles.signOutText}>Sign Out</Text>
          </View>
        </TouchableOpacity>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Gig Task Manager v1.0.0</Text>
        </View>
      </ScrollView>

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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.text.white,
    fontFamily: theme.fonts.semiBold,
  },
  placeholder: {
    width: 40,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    marginTop: -theme.spacing.lg,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
  },
  avatarContainer: {
    marginBottom: theme.spacing.md,
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: theme.colors.text.white,
    fontFamily: theme.fonts.bold,
  },
  emailText: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.fonts.semiBold,
  },
  memberSince: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontFamily: theme.fonts.regular,
  },
  menuSection: {
    backgroundColor: theme.colors.surface,
    marginTop: theme.spacing.lg,
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.text.primary,
    marginBottom: 2,
    fontFamily: theme.fonts.medium,
  },
  menuSubtitle: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    fontFamily: theme.fonts.regular,
  },
  signOutButton: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: `${theme.colors.error}20`,
  },
  signOutContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.error,
    fontFamily: theme.fonts.semiBold,
  },
  versionContainer: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
  },
  versionText: {
    fontSize: 12,
    color: theme.colors.text.light,
    fontFamily: theme.fonts.regular,
  },
});
