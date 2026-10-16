import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, shadow, topPad } from "./theme";
import { useAnnouncements, fmtAnnDate } from "./annUtils";

const TYPES = {
  alert: { label: "Ice Alert", icon: "warning", color: "#DC2626", bg: "#FEE2E2", text: "#991B1B" },
  update: { label: "Update", icon: "sync", color: C.blue, bg: "#DBEAFE", text: "#1E40AF" },
  event: { label: "Event", icon: "calendar", color: "#7C3AED", bg: "#EDE9FE", text: "#5B21B6" },
  campaign: { label: "Campaign", icon: "megaphone", color: "#0891B2", bg: "#CFFAFE", text: "#155E75" },
};
const typeOf = (t) => TYPES[t] || TYPES.update;

export default function AnnouncementsScreen({ apiUrl, token, lang = "en", onNavigate }) {
  const ann = useAnnouncements(apiUrl, token, lang);

  return (
    <View style={s.root}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => onNavigate("home")} hitSlop={10} style={s.back}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.title}>Announcements</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        {ann.status === "loading" && <ActivityIndicator color={C.blue} style={{ marginVertical: 40 }} />}
        {ann.status === "error" && (
          <TouchableOpacity onPress={ann.reload} style={s.stateBox}>
            <Ionicons name="cloud-offline-outline" size={30} color={C.muted} />
            <Text style={s.stateText}>Could not load announcements. Tap to retry.</Text>
          </TouchableOpacity>
        )}
        {ann.status === "empty" && (
          <View style={s.stateBox}>
            <Ionicons name="notifications-off-outline" size={30} color={C.muted} />
            <Text style={s.stateText}>No announcements right now. Check back soon.</Text>
          </View>
        )}
        {ann.status === "ok" && ann.items.map((a) => {
          const t = typeOf(a.type);
          return (
            <View key={a.id} style={[s.card, shadow, a.type === "alert" && s.cardAlert]}>
              <View style={s.cardHead}>
                <View style={[s.pill, { backgroundColor: t.bg }]}>
                  <Ionicons name={t.icon} size={13} color={t.color} />
                  <Text style={[s.pillText, { color: t.text }]}>{t.label}</Text>
                </View>
                <Text style={s.date}>{fmtAnnDate(a.created_at)}</Text>
              </View>
              <Text style={s.cardTitle}>{a.title}</Text>
              {a.body ? <Text style={s.cardBody}>{a.body}</Text> : null}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: topPad, paddingBottom: 12, paddingHorizontal: 16, backgroundColor: "#FAFAFC" },
  back: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "#EEF0F5" },
  title: { fontSize: 18, fontWeight: "700", color: C.blue },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 14 },
  cardAlert: { borderLeftWidth: 4, borderLeftColor: "#DC2626" },
  cardHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  pill: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  pillText: { fontSize: 12, fontWeight: "700" },
  date: { fontSize: 12, color: C.muted },
  cardTitle: { fontSize: 16, fontWeight: "700", color: C.text, lineHeight: 22 },
  cardBody: { fontSize: 14, lineHeight: 21, color: C.body, marginTop: 6 },
  stateBox: { alignItems: "center", gap: 10, paddingVertical: 50, paddingHorizontal: 20 },
  stateText: { fontSize: 14, lineHeight: 21, color: C.muted, textAlign: "center" },
});