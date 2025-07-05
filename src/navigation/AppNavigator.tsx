import { Ionicons } from "@expo/vector-icons"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import type React from "react"
import { useEffect } from "react"
import { theme } from "../constants/theme"
import { authService } from "../services/authService"
import { useAuthStore } from "../store/authStore"

// Screens
import { AddEditTaskScreen } from "../screens/AddEditTaskScreen"
import { CalendarScreen } from "../screens/CalendarScreen"
import { ForgotPasswordScreen } from "../screens/ForgotPasswordScreen"
import { LoginScreen } from "../screens/LoginScreen"
import { ProfileScreen } from "../screens/ProfileScreen"
import { RegisterScreen } from "../screens/RegisterScreen"
import { TaskListScreen } from "../screens/TaskListScreen"
import { WelcomeScreen } from "../screens/WelcomeScreen"

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
)

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap

        if (route.name === "Tasks") {
          iconName = focused ? "list" : "list-outline"
        } else if (route.name === "Calendar") {
          iconName = focused ? "calendar" : "calendar-outline"
        } else {
          iconName = focused ? "person" : "person-outline"
        }

        return <Ionicons name={iconName} size={size} color={color} />
      },
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.text.light,
      tabBarStyle: {
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        paddingBottom: 5,
        height: 60,
      },
      tabBarLabelStyle: {
        fontFamily: theme.fonts.medium,
        fontSize: 12,
      },
    })}
  >
    <Tab.Screen name="Tasks" component={TaskListScreen} />
    <Tab.Screen name="Calendar" component={CalendarScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
)

const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={MainTabs} />
    <Stack.Screen name="AddEditTask" component={AddEditTaskScreen} />
  </Stack.Navigator>
)

export const AppNavigator: React.FC = () => {
  const { user, setUser, setLoading } = useAuthStore()

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || undefined,
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  return <NavigationContainer>{user ? <MainStack /> : <AuthStack />}</NavigationContainer>
}
