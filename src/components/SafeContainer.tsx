import type React from "react"
import { Platform, StatusBar, StyleSheet, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { theme } from "../constants/theme"

interface SafeContainerProps {
  children: React.ReactNode
  backgroundColor?: string
  edges?: ("top" | "bottom" | "left" | "right")[]
}

export const SafeContainer: React.FC<SafeContainerProps> = ({
  children,
  backgroundColor = theme.colors.background,
  edges = ["top", "bottom", "left", "right"],
}) => {
  const insets = useSafeAreaInsets()

  const paddingTop = edges.includes("top") ? (Platform.OS === "android" ? StatusBar.currentHeight || 0 : insets.top) : 0
  const paddingBottom = edges.includes("bottom") ? insets.bottom : 0
  const paddingLeft = edges.includes("left") ? insets.left : 0
  const paddingRight = edges.includes("right") ? insets.right : 0

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          paddingTop,
          paddingBottom,
          paddingLeft,
          paddingRight,
        },
      ]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
