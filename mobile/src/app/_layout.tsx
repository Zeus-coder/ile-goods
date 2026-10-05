import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CartProvider } from "@/lib/cart-context";
import { colors, fonts } from "@/lib/theme";

export default function RootLayout() {
  const [loaded] = useFonts({ [fonts.serif]: require("../../assets/fonts/InstrumentSerif-Regular.ttf") });
  if (!loaded) return null;

  return (
    <CartProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTintColor: colors.inkStrong,
          headerShadowVisible: false,
          headerTitleStyle: { fontFamily: fonts.serif, fontSize: 22 },
          contentStyle: { backgroundColor: colors.canvas },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="product/[slug]" options={{ title: "" }} />
      </Stack>
    </CartProvider>
  );
}
