import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui";
import { authClient } from "@/lib/auth-client";
import { useCart } from "@/lib/cart-context";
import { formatNaira } from "@/lib/money";
import { useProducts } from "@/lib/products";
import { colors, fonts } from "@/lib/theme";

export default function ProductScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { products } = useProducts();
  const { data: session } = authClient.useSession();
  const { add } = useCart();
  const insets = useSafeAreaInsets();
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const product = products?.find((p) => p.slug === slug);
  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>{products ? "This product isn't available." : "Loading…"}</Text>
      </View>
    );
  }

  const addToBag = async () => {
    if (!session) {
      router.push("/account");
      return;
    }
    setAdding(true);
    setMessage(null);
    try {
      await add(product.id, 1);
      setMessage({ ok: true, text: "Added to your bag." });
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "Couldn't add it. Try again." });
    } finally {
      setAdding(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
      <View style={styles.imageWrap}>
        <Image source={product.image_url} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
      </View>
      <View style={styles.body}>
        <Text style={styles.eyebrow}>{product.category.toUpperCase()}</Text>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.muted}>By {product.maker}</Text>
        <Text style={styles.price}>{formatNaira(product.price_kobo)}</Text>

        {product.stock === 0 ? (
          <Text style={styles.soldOut}>Sold out. We're restocking soon.</Text>
        ) : (
          <View style={{ marginTop: 20, gap: 12 }}>
            <Button
              label={session ? "Add to bag" : "Sign in to add to bag"}
              onPress={addToBag}
              loading={adding}
              icon={<Ionicons name="bag-add-outline" size={20} color="#fff" />}
            />
            {message && (
              <View style={styles.messageRow}>
                <Text style={{ color: message.ok ? colors.sageInk : colors.roseInk, fontSize: 15 }}>{message.text}</Text>
                {message.ok && (
                  <Text style={styles.link} onPress={() => router.push("/cart")}>
                    View bag
                  </Text>
                )}
              </View>
            )}
            {product.stock <= 5 && <Text style={{ color: colors.sandInk }}>Only {product.stock} left in stock.</Text>}
          </View>
        )}

        <Text style={styles.description}>{product.description}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  imageWrap: { aspectRatio: 1, backgroundColor: colors.bone },
  body: { padding: 20 },
  eyebrow: { fontSize: 12, letterSpacing: 1, color: colors.muted },
  title: { fontFamily: fonts.serif, fontSize: 36, lineHeight: 40, color: colors.inkStrong, marginTop: 6 },
  muted: { color: colors.muted, fontSize: 15, marginTop: 4 },
  price: { marginTop: 14, fontSize: 20, color: colors.inkStrong, fontVariant: ["tabular-nums"] },
  soldOut: { marginTop: 20, backgroundColor: colors.bone, padding: 14, borderRadius: 8, color: colors.muted },
  messageRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  link: { color: colors.inkStrong, fontWeight: "600", textDecorationLine: "underline", fontSize: 15 },
  description: { marginTop: 24, fontSize: 16, lineHeight: 24, color: colors.ink },
});
