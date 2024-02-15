import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { TouchableOpacity } from "react-native";
import * as SecureStore from "expo-secure-store";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

const tokenCache = {
  async getToken(key: string): Promise<string | undefined | null> {
    try {
      return SecureStore.getItemAsync(key);
    } catch (error) {
      console.log(error);
      return null;
    }
  },
  async saveToken(key: string, token: string): Promise<void> {
    try {
      return SecureStore.setItemAsync(key, token);
    } catch (error) {
      console.log(error);
    }
  },
  async clearToken(key: string): Promise<void> {
    return SecureStore.deleteItemAsync(key);
  },
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    montserrat: require("@/assets/fonts/Montserrat-Regular.ttf"),
    "montserrat-sb": require("@/assets/fonts/Montserrat-SemiBold.ttf"),
    "montserrat-b": require("@/assets/fonts/Montserrat-Bold.ttf"),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <RootLayoutNav />
    </ClerkProvider>
  );
}

function RootLayoutNav() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/(modals)/login");
    }
  }, [isLoaded]);
  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false, headerTitleAlign: "center" }}
      />
      <Stack.Screen
        name="(modals)/login"
        options={{
          headerTitleAlign: "center",
          headerTitleStyle: {
            fontFamily: "montserrat-sb",
          },
          title: "Log in or sign up",
          presentation: "modal",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close-outline" size={28}></Ionicons>
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen name="listing/[id]" />
      <Stack.Screen
        name="(modals)/booking"
        options={{
          presentation: "transparentModal",
          animation: "fade",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close-outline" size={28}></Ionicons>
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}
