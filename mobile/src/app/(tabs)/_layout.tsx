import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { useCart } from "@/lib/cart-context";
import { colors, fonts } from "@/lib/theme";

export default function TabLayout() {
  const { cart } = useCart();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.inkStrong,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { borderTopColor: colors.line },
        headerShadowVisible: false,
        headerTitleStyle: { fontFamily: fonts.serif, fontSize: 26, color: colors.inkStrong },
        sceneStyle: { backgroundColor: colors.canvas },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ilé Goods",
          tabBarLabel: "Shop",
          tabBarIcon: ({ color, size }) => <Ionicons name="storefront-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Your bag",
          tabBarLabel: "Bag",
          tabBarBadge: cart?.count ? cart.count : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.inkStrong, color: "#fff", fontSize: 11 },
          tabBarIcon: ({ color, size }) => <Ionicons name="bag-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
