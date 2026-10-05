import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useCallback } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui";
import type { CartLine } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { useCart } from "@/lib/cart-context";
import { API_URL } from "@/lib/config";
import { FREE_SHIPPING_FROM_KOBO, formatNaira } from "@/lib/money";
import { colors, fonts } from "@/lib/theme";

export default function CartScreen() {
  const { data: session } = authClient.useSession();
  const { cart, loading, error, refresh, setQuantity } = useCart();

  // Pick up anything added on the website since this screen was last shown.
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  if (!session) {
    return (
      <Empty
        title="Sign in to see your bag"
        body="Use the same Google account as the website and your bag will match on both."
        action={<Button label="Sign in" onPress={() => router.push("/account")} />}
      />
    );
  }

  if (cart && cart.lines.length === 0) {
    return (
      <Empty
        title="Your bag is empty"
        body="Anything you add here or on the website shows up in both places."
        action={<Button label="Browse the shop" onPress={() => router.push("/")} />}
        onRefresh={refresh}
        refreshing={loading}
      />
    );
  }

  const change = (line: CartLine, quantity: number) => setQuantity(line.product_id, quantity).catch(() => {});

  return (
    <FlatList
      data={cart?.lines ?? []}
      keyExtractor={(l) => String(l.product_id)}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={loading && !!cart} onRefresh={refresh} />}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListHeaderComponent={error ? <Text style={styles.error}>{error}</Text> : null}
      renderItem={({ item }) => (
        <View style={styles.line}>
          <Pressable onPress={() => router.push({ pathname: "/product/[slug]", params: { slug: item.slug } })} style={styles.thumb}>
            <Image source={item.image_url} style={StyleSheet.absoluteFill} contentFit="cover" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.muted}>{formatNaira(item.price_kobo)}</Text>
            <View style={styles.controls}>
              <View style={styles.stepper}>
                <StepButton icon="remove" label={`Decrease ${item.name}`} onPress={() => change(item, item.quantity - 1)} />
                <Text style={styles.qty}>{item.quantity}</Text>
                <StepButton icon="add" label={`Increase ${item.name}`} disabled={item.quantity >= item.stock} onPress={() => change(item, item.quantity + 1)} />
              </View>
              <Text style={styles.remove} onPress={() => change(item, 0)}>Remove</Text>
            </View>
          </View>
          <Text style={styles.lineTotal}>{formatNaira(item.price_kobo * item.quantity)}</Text>
        </View>
      )}
      ListFooterComponent={
        cart ? (
          <View style={styles.summary}>
            <Row label="Subtotal" value={formatNaira(cart.subtotal)} />
            <Row label="Delivery" value={cart.shipping === 0 ? "Free" : formatNaira(cart.shipping)} />
            {cart.shipping > 0 && (
              <Text style={styles.hint}>Free delivery on orders over {formatNaira(FREE_SHIPPING_FROM_KOBO)}.</Text>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatNaira(cart.total)}</Text>
            </View>
            <Button
              label="Check out on the website"
              onPress={() => WebBrowser.openBrowserAsync(`${API_URL}/cart`)}
              icon={<Ionicons name="open-outline" size={18} color="#fff" />}
              style={{ marginTop: 16 }}
            />
          </View>
        ) : (
          <Text style={[styles.muted, { textAlign: "center", marginTop: 24 }]}>Loading your bag…</Text>
        )
      }
    />
  );
}

function StepButton({ icon, label, onPress, disabled }: { icon: "add" | "remove"; label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityLabel={label} hitSlop={6} style={[styles.step, disabled && { opacity: 0.35 }]}>
      <Ionicons name={icon} size={16} color={colors.inkStrong} />
    </Pressable>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function Empty({ title, body, action, onRefresh, refreshing = false }: {
  title: string; body: string; action: React.ReactNode; onRefresh?: () => void; refreshing?: boolean;
}) {
  return (
    <FlatList
      data={[]}
      renderItem={null}
      contentContainerStyle={styles.empty}
      refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined}
      ListHeaderComponent={
        <View style={{ alignItems: "center" }}>
          <Ionicons name="bag-outline" size={44} color={colors.muted} />
          <Text style={styles.emptyTitle}>{title}</Text>
          <Text style={[styles.muted, { textAlign: "center", fontSize: 15, marginBottom: 20 }]}>{body}</Text>
          {action}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  empty: { flexGrow: 1, justifyContent: "center", padding: 32 },
  emptyTitle: { fontFamily: fonts.serif, fontSize: 30, color: colors.inkStrong, marginTop: 12, marginBottom: 6 },
  error: { color: colors.roseInk, marginBottom: 12 },
  separator: { height: 1, backgroundColor: colors.line, marginVertical: 14 },
  line: { flexDirection: "row", gap: 12 },
  thumb: { width: 76, height: 92, borderRadius: 8, overflow: "hidden", backgroundColor: colors.bone },
  name: { fontSize: 15, fontWeight: "600", color: colors.inkStrong },
  muted: { fontSize: 13, color: colors.muted, marginTop: 2 },
  controls: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 10 },
  stepper: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 8 },
  step: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  qty: { minWidth: 24, textAlign: "center", fontSize: 15, color: colors.inkStrong, fontVariant: ["tabular-nums"] },
  remove: { fontSize: 13, color: colors.muted, textDecorationLine: "underline" },
  lineTotal: { fontSize: 14, color: colors.inkStrong, fontVariant: ["tabular-nums"] },
  summary: { marginTop: 24, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  value: { fontSize: 14, color: colors.inkStrong, fontVariant: ["tabular-nums"] },
  hint: { fontSize: 12, color: colors.muted, marginBottom: 8 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 12, marginTop: 4 },
  totalLabel: { fontSize: 16, fontWeight: "600", color: colors.inkStrong },
  totalValue: { fontSize: 16, fontWeight: "600", color: colors.inkStrong, fontVariant: ["tabular-nums"] },
});
