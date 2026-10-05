import { Image } from "expo-image";
import { Link } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui";
import type { Product } from "@/lib/api";
import { formatNaira } from "@/lib/money";
import { useProducts } from "@/lib/products";
import { colors, fonts } from "@/lib/theme";

export default function ShopScreen() {
  const { products, error, refreshing, reload } = useProducts();
  const [category, setCategory] = useState<string | null>(null);

  const categories = useMemo(() => [...new Set((products ?? []).map((p) => p.category))], [products]);
  const shown = useMemo(() => (products ?? []).filter((p) => !category || p.category === category), [products, category]);

  if (error && !products) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>{error}</Text>
        <Button label="Try again" onPress={reload} style={{ marginTop: 16 }} />
      </View>
    );
  }

  return (
    <FlatList
      data={shown}
      keyExtractor={(p) => String(p.id)}
      numColumns={2}
      columnWrapperStyle={{ gap: 14 }}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reload} />}
      ListHeaderComponent={
        <View>
          <Text style={styles.heading}>Good things for every room.</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {[null, ...categories].map((c) => {
              const active = c === category;
              return (
                <Pressable
                  key={c ?? "all"}
                  onPress={() => setCategory(c)}
                  style={[styles.chip, active && styles.chipActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.chipText, active && { color: "#fff" }]}>{c ?? "All"}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      }
      renderItem={({ item }) => <ProductCard product={item} />}
      ListEmptyComponent={products ? null : <Text style={[styles.muted, { textAlign: "center" }]}>Loading products…</Text>}
    />
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={{ pathname: "/product/[slug]", params: { slug: product.slug } }} asChild>
      <Pressable style={styles.card}>
        <View style={styles.imageWrap}>
          <Image source={product.image_url} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
        </View>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.muted}>{product.category}</Text>
        <Text style={styles.price}>{formatNaira(product.price_kobo)}</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 22, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  heading: { fontFamily: fonts.serif, fontSize: 34, lineHeight: 38, color: colors.inkStrong, marginTop: 4 },
  chips: { gap: 8, paddingVertical: 16 },
  chip: { borderWidth: 1, borderColor: colors.line, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 7, backgroundColor: colors.canvas },
  chipActive: { backgroundColor: colors.inkStrong, borderColor: colors.inkStrong },
  chipText: { fontSize: 14, color: colors.ink },
  card: { flex: 1 },
  imageWrap: { aspectRatio: 4 / 5, borderRadius: 12, overflow: "hidden", backgroundColor: colors.bone, borderWidth: 1, borderColor: colors.line },
  name: { marginTop: 10, fontSize: 15, fontWeight: "600", color: colors.inkStrong },
  muted: { fontSize: 13, color: colors.muted, marginTop: 2 },
  price: { marginTop: 4, fontSize: 14, color: colors.ink, fontVariant: ["tabular-nums"] },
});
