import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui";
import { authClient } from "@/lib/auth-client";
import { API_URL } from "@/lib/config";
import { colors, fonts } from "@/lib/theme";

export default function AccountScreen() {
  const { data: session, isPending } = authClient.useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async () => {
    setBusy(true);
    setError(null);
    // Opens Google in the browser via the website's auth server, then returns to the app.
    const { error } = await authClient.signIn.social({ provider: "google", callbackURL: "/account" });
    if (error) setError(error.message ?? "Sign-in didn't finish. Try again.");
    setBusy(false);
  };

  const signOut = async () => {
    setBusy(true);
    await authClient.signOut();
    setBusy(false);
  };

  if (session) {
    const { user } = session;
    return (
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.profile}>
          {user.image ? (
            <Image source={user.image} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.initial]}>
              <Text style={styles.initialText}>{user.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.muted}>{user.email}</Text>
          </View>
        </View>
        <View style={styles.note}>
          <Ionicons name="sync-outline" size={18} color={colors.sageInk} />
          <Text style={styles.noteText}>Your bag is synced with {API_URL.replace(/^https?:\/\//, "")}.</Text>
        </View>
        <Button label="Sign out" variant="secondary" onPress={signOut} loading={busy}
          icon={<Ionicons name="log-out-outline" size={18} color={colors.inkStrong} />} />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.page, { flexGrow: 1, justifyContent: "center" }]}>
      <Text style={styles.title}>Sign in to Ilé Goods</Text>
      <Text style={[styles.muted, { fontSize: 16, marginBottom: 28 }]}>
        Use the same Google account as the website. Your bag follows you between the two.
      </Text>
      <Button label="Continue with Google" onPress={signIn} loading={busy || isPending}
        icon={<Ionicons name="logo-google" size={18} color="#fff" />} />
      {error && <Text style={styles.error}>{error}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, gap: 16 },
  title: { fontFamily: fonts.serif, fontSize: 38, lineHeight: 42, color: colors.inkStrong },
  profile: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 8 },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  initial: { backgroundColor: "#e05a33", alignItems: "center", justifyContent: "center" },
  initialText: { color: "#fff", fontSize: 24, fontWeight: "600" },
  name: { fontFamily: fonts.serif, fontSize: 28, color: colors.inkStrong },
  muted: { color: colors.muted, fontSize: 14 },
  note: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.sage, padding: 12, borderRadius: 8 },
  noteText: { color: colors.sageInk, fontSize: 14, flex: 1 },
  error: { color: colors.roseInk, textAlign: "center" },
});
