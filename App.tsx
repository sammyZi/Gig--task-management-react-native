import { StatusBar } from "expo-status-bar"
import { onAuthStateChanged } from "firebase/auth"
import { useEffect, useState } from "react"
import { ActivityIndicator, View } from "react-native"
import { auth } from "./src/config/firebase"
import { theme } from "./src/constants/theme"
import { AppNavigator } from "./src/navigation/AppNavigator"
import { useAuthStore } from "./src/store/authStore"

export default function App() {
  const { user, setUser, loading, setLoading } = useAuthStore()
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
        })
      } else {
        setUser(null)
      }

      if (initializing) setInitializing(false)
      setLoading(false)
    })

    return unsubscribe
  }, [setUser, setLoading, initializing])

  if (initializing || loading) {
    return (
      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    )
  }

  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator />
    </>
  )
}

