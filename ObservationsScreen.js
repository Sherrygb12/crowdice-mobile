import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, shadow, topPad } from "./theme";
import BottomNav from "./BottomNav";
import { useObservations, iceLabel, iceIcon, fmtDate } from "./obsUtils";
import { useT } from "./i18n";

const LEVEL = 4, XP = 850, XP_MAX = 1000;

function Stat({ value, delta, label, sub }) {
  return (
    <View style={[s.stat, shadow]}>
      <Text style={s.statLabel}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6 }}>
        <Text style={s.statValue}>{value}</Text>
        {delta ? <Text style={s.statDelta}>{delta}</Text> : null}
      </View>
      {sub ? <Text style={s.statSub}>{sub}</Text> : null}
    </View>
  );
}

export default function ObservationsScreen({ apiUrl, token, lang, user, onNavigate }) {
  const t = useT(lang);
  const obs = useObservations(apiUrl, token);
  const mine = user ? obs.items.filter((o) => o.user_id === user.id) : obs.items;
  const total = mine.length;
  const verified = mine.filter((o) => o.status === "verified" || o.status === "approved").length;
  const pct = Math.round((XP / XP_MAX) * 100);

  return (
    <View style={s.root}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => onNavigate("home")} hitSlop={10} style={s.back}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.title}>{t("my_observations")}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18, paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
        <View style={s.statsRow}>
          <Stat value={total} delta={total ? "+" + total : null} label={t("total_reports")} />
          <Stat value={verified} sub={total ? Math.round((verified / total) * 100) + "%" : "0%"} label={t("verified")} />
        </View>

        <View style={s.headRow}>
          <Text style={s.section}>{t("recent_observations")}</Text>
          <TouchableOpacity onPress={() => onNavigate("submit")}>
            <Text style={s.export}>{t("new")}</Text>
          </TouchableOpacity>
        </View>

        {obs.status === "loading" && <ActivityIndicator color={C.blue} style={{ marginVertical: 30 }} />}
        {obs.status === "error" && (
          <TouchableOpacity onPress={obs.reload} style={s.stateBox}>
            <Ionicons name="cloud-offline-outline" size={30} color={C.muted} />
            <Text style={s.stateText}>{t("could_not_load")}</Text>
          </TouchableOpacity>
        )}
        {(obs.status === "empty" || (obs.status === "ok" && mine.length === 0)) && (
          <View style={s.stateBox}>
            <Ionicons name="camera-outline" size={30} color={C.muted} />
            <Text style={s.stateText}>{t("no_observations")}</Text>
          </View>
        )}
        {obs.status === "ok" && mine.map((o) => (
          <View key={o.id} style={[s.card, shadow]}>
            <View style={s.chip}><Ionicons name={iceIcon(o.ice_type)} size={22} color={C.blue} /></View>
            <View style={{ flex: 1 }}>
              <Text style={s.cardTitle}>{t(o.ice_type) !== o.ice_type ? t(o.ice_type) : iceLabel(o.ice_type)}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 }}>
                <Ionicons name="calendar-outline" size={12} color={C.muted} />
                <Text style={s.cardDate}>{fmtDate(o.created_at)}{o.river_name ? "  •  " + o.river_name : ""}</Text>
              </View>
            </View>
            <View style={[s.badge, o.status === "verified" ? s.badgeOk : s.badgePending]}>
              <Ionicons name="ellipse" size={8} color={o.status === "verified" ? C.green : C.amber} />
              <Text style={[s.badgeText, { color: o.status === "verified" ? "#065F46" : "#92400E" }]}>
                {o.status === "verified" ? t("verified") : t("pending_review")}
              </Text>
            </View>
          </View>
        ))}

        <View style={s.achieve}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={s.achieveTitle}>{t("achievement")}</Text>
              <Text style={s.achieveSub}>{t("top_observers")}</Text>
            </View>
            <Ionicons name="trophy" size={28} color="rgba(255,255,255,0.9)" />
          </View>
          <View style={s.bar}><View style={[s.barFill, { width: pct + "%" }]} /></View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
            <Text style={s.achieveMeta}>★ Lv. {LEVEL} {t("observer_level")}</Text>
            <Text style={s.achieveMeta}>{XP} / {XP_MAX} XP</Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={s.fab} onPress={() => onNavigate("submit")} activeOpacity={0.9}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <BottomNav active="none" onNavigate={onNavigate} />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: topPad, paddingBottom: 12, paddingHorizontal: 16, backgroundColor: "#FAFAFC" },
  back: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "#EEF0F5" },
  title: { fontSize: 18, fontWeight: "700", color: C.text },
  statsRow: { flexDirection: "row", gap: 12 },
  stat: { flex: 1, backgroundColor: "#fff", borderRadius: 16, padding: 16 },
  statLabel: { fontSize: 12, fontWeight: "600", color: C.muted, letterSpacing: 0.4, marginBottom: 6 },
  statValue: { fontSize: 28, fontWeight: "800", color: C.blue },
  statDelta: { fontSize: 13, fontWeight: "700", color: C.green, marginBottom: 5 },
  statSub: { fontSize: 13, color: C.muted, marginTop: 2 },
  headRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 24, marginBottom: 12 },
  section: { fontSize: 17, fontWeight: "700", color: C.text },
  export: { fontSize: 14, fontWeight: "600", color: C.blue },
  card: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "#fff", borderRadius: 16, padding: 14, marginBottom: 12 },
  chip: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.chip, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 15, fontWeight: "700", color: C.text },
  cardDate: { fontSize: 12, color: C.muted },
  badge: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  badgePending: { backgroundColor: "#FEF3C7" },
  badgeOk: { backgroundColor: "#D1FAE5" },
  badgeText: { fontSize: 11, fontWeight: "600" },
  stateBox: { alignItems: "center", gap: 10, paddingVertical: 36, paddingHorizontal: 20 },
  stateText: { fontSize: 14, lineHeight: 21, color: C.muted, textAlign: "center" },
  achieve: { backgroundColor: C.blue, borderRadius: 18, padding: 18, marginTop: 10 },
  achieveTitle: { color: "#fff", fontSize: 17, fontWeight: "800" },
  achieveSub: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 2 },
  bar: { height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.3)", marginTop: 16, overflow: "hidden" },
  barFill: { height: 8, borderRadius: 4, backgroundColor: "#fff" },
  achieveMeta: { color: "#fff", fontSize: 13, fontWeight: "600" },
  fab: { position: "absolute", right: 20, bottom: 96, width: 56, height: 56, borderRadius: 28, backgroundColor: C.blue, alignItems: "center", justifyContent: "center", ...shadow },
});