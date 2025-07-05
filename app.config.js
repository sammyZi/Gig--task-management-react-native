export default {
  expo: {
    name: "Task Manager",
    slug: "gig-task-manager",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#6C5CE7",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.yourcompany.gigtaskmanager",
      hermesEnabled: false
    },
    android: {
      package: "com.yourcompany.gigtaskmanager",
      hermesEnabled: false,
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#6C5CE7",
      },
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "expo-font",
      [
        "expo-build-properties",
        {
          ios: {
            newArchEnabled: true,
          },
          android: {
            newArchEnabled: true,
            kotlinVersion: "1.9.0",
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      eas: {
        projectId: "b72cc902-a56e-4695-b9fa-192e6e5ee582",
      },
    },
    updates: {
      url: "https://u.expo.dev/b72cc902-a56e-4695-b9fa-192e6e5ee582",
    },
    runtimeVersion: {
      policy: "appVersion",
    },
  },
};
