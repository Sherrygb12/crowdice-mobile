import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, COVERS, shadow, topPad } from "./theme";
import { useBlogs } from "./blogUtils";
import { useObservations, iceLabel, iceIcon, fmtDate } from "./obsUtils";
import { useT } from "./i18n";
import BottomNav from "./BottomNav";

const WEATHER = { temp: -8.2 };
const WATER = { level: null };

function BlogCard({ b, index, onPress, t }) {
  return (
    <TouchableOpacity style={[s.bCard, shadow]} onPress={onPress} activeOpacity={0.88}>
      <View style={[s.bCover, { backgroundColor: COVERS[index % COVERS.length] }]}>
        {b.image ? (
          <Image source={{ uri: b.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <>
            <View style={s.dotBig} />
            <View style={s.dotSmall} />
            <Ionicons name="snow" size={40} color="rgba(255,255,255,0.9)" />
          </>
        )}
      </View>
      <View style={s.bBody}>
        <Text style={s.bTitle} numberOfLines={2}>{b.title}</Text>
        <View style={s.bMeta}>
          <Ionicons name="time-outline" size={13} color={C.muted} />
          <Text style={s.bMetaText}>{b.minutes} {t("min_read")}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ apiUrl, token, lang = "en", onNavigate }) {
  const t = useT(lang);
  const blogs = useBlogs(apiUrl, token, lang, 6);
  const obs = useObservations(apiUrl, token);
  const recent = obs.items.slice(0, 3);

  return (
    <View style={s.root}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => onNavigate("menu")} hitSlop={10}>
          <Ionicons name="menu" size={26} color={C.text} />
        </TouchableOpacity>
        <Text style={s.brand}>CrowdICE</Text>
        <TouchableOpacity onPress={() => onNavigate("notifications")} hitSlop={10}>
          <Ionicons name="notifications-outline" size={24} color={C.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={s.pad}>
          <View style={s.alert}>
            <View style={s.alertIcon}><Ionicons name="warning" size={22} color="#fff" /></View>
            <View style={{ flex: 1 }}>
              <Text style={s.alertTitle}>{t("river_ice_alert")}</Text>
              <Text style={s.alertBody}>{lang === "fi" ? "Nopeaa jäätymistä havaittu lähellä sektoria B. Noudata erityistä varovaisuutta havaintoja tehdessäsi." : "Rapid ice formation detected near Sector B. Exercise extreme caution during observations."}</Text>
            </View>
          </View>

          <TouchableOpacity style={s.submit} onPress={() => onNavigate("submit")} activeOpacity={0.85}>
            <Ionicons name="add-circle" size={22} color="#fff" />
            <Text style={s.submitText}>{t("submit_observation")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.quick} onPress={() => onNavigate("questionnaire")} activeOpacity={0.85}>
            <View style={s.quickIcon}><Ionicons name="clipboard-outline" size={24} color="#fff" /></View>
            <View style={{ flex: 1 }}>
              <Text style={s.quickTitle}>{t("quick_questionnaire")}</Text>
              <Text style={s.quickSub}>{t("quick_q_sub")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={C.text} />
          </TouchableOpacity>

          <View style={s.row}>
            <TouchableOpacity style={[s.stat, shadow]} onPress={() => onNavigate("live")} activeOpacity={0.88}>
              <Text style={s.statLabel}>{t("temperature")}</Text>
              <Text style={s.statValue}>{WEATHER.temp.toFixed(1)}{"\u00b0"}<Text style={s.statUnit}> C</Text></Text>
              <View style={s.statFoot}>
                <Ionicons name="trending-down" size={13} color={C.muted} />
                <Text style={s.statFootText}>{lang === "fi" ? "Laskee nopeasti" : "Dropping fast"}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[s.stat, shadow]} onPress={() => onNavigate("live")} activeOpacity={0.88}>
              <Text style={s.statLabel}>{t("water_level")}</Text>
              <Text style={s.statValue}>{WATER.level == null ? "--" : WATER.level.toFixed(2)}<Text style={s.statUnit}> m</Text></Text>
              <View style={s.statFoot}>
                <Ionicons name="checkmark-circle" size={13} color={C.green} />
                <Text style={[s.statFootText, { color: C.green }]}>{lang === "fi" ? "Vakaa" : "Stable condition"}</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>{t("recent_observations")}</Text>
            <TouchableOpacity onPress={() => onNavigate("observations")}><Text style={s.viewAll}>{t("view_all")}</Text></TouchableOpacity>
          </View>

          {obs.status === "loading" && <ActivityIndicator color={C.blue} style={{ marginVertical: 16 }} />}
          {(obs.status === "empty" || (obs.status === "ok" && recent.length === 0)) && (
            <Text style={s.emptyInline}>{t("no_observations_home")}</Text>
          )}
          {obs.status === "ok" && recent.map((o) => (
            <TouchableOpacity key={o.id} style={[s.listCard, shadow]} onPress={() => onNavigate("observations")} activeOpacity={0.85}>
              <View style={s.chip}><Ionicons name={iceIcon(o.ice_type)} size={22} color={C.blue} /></View>
              <View style={{ flex: 1 }}>
                <Text style={s.listTitle}>{t(o.ice_type) !== o.ice_type ? t(o.ice_type) : iceLabel(o.ice_type)}</Text>
                <Text style={s.listSub} numberOfLines={1}>{(o.notes || o.river_name || "") } {"\u2022"} {fmtDate(o.created_at)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#B6BBC6" />
            </TouchableOpacity>
          ))}

          <View style={s.sectionHead}>
            <View>
              <Text style={s.sectionTitle}>{t("guidelines")}</Text>
              <Text style={s.sectionSub}>{t("guidelines_sub")}</Text>
            </View>
            <TouchableOpacity onPress={() => onNavigate("blogs")}><Text style={s.viewAll}>{t("view_all")}</Text></TouchableOpacity>
          </View>
        </View>

        {blogs.status === "loading" && <ActivityIndicator color={C.blue} style={{ marginVertical: 24 }} />}
        {blogs.status === "empty" && <Text style={s.emptyText}>{t("no_announcements")}</Text>}
        {blogs.status === "error" && (
          <TouchableOpacity onPress={blogs.reload}>
            <Text style={s.emptyText}>{t("could_not_load")}</Text>
          </TouchableOpacity>
        )}
        {blogs.status === "ok" && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.carousel}>
            {blogs.items.map((b, i) => (
              <BlogCard key={String(b.id)} b={b} index={i} onPress={() => onNavigate("blog", b)} t={t} />
            ))}
          </ScrollView>
        )}
      </ScrollView>

      <BottomNav active="home" onNavigate={onNavigate} />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: topPad, paddingBottom: 14, paddingHorizontal: 20, backgroundColor: "#FAFAFC" },
  brand: { fontSize: 19, fontWeight: "700", color: C.blue },
  pad: { padding: 18, paddingTop: 24 },
  alert: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: C.alertBg, borderRadius: 16, padding: 16 },
  alertIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.alertIcon, alignItems: "center", justifyContent: "center" },
  alertTitle: { fontSize: 12, fontWeight: "700", letterSpacing: 0.8, color: C.alertText },
  alertBody: { fontSize: 14, lineHeight: 20, color: C.alertText, marginTop: 2 },
  submit: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: C.blue, borderRadius: 14, height: 52, marginTop: 20 },
  submitText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  quick: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 20, padding: 14, backgroundColor: C.qBg, borderRadius: 14, borderWidth: 1, borderColor: C.blue },
  quickIcon: { width: 44, height: 44, borderRadius: 10, backgroundColor: C.blue, alignItems: "center", justifyContent: "center" },
  quickTitle: { fontSize: 15, fontWeight: "700", color: C.text },
  quickSub: { fontSize: 12, color: C.text, marginTop: 2 },
  row: { flexDirection: "row", gap: 14, marginTop: 20 },
  stat: { flex: 1, backgroundColor: C.card, borderRadius: 16, padding: 14 },
  statLabel: { fontSize: 12, fontWeight: "600", color: C.muted, letterSpacing: 0.4 },
  statValue: { fontSize: 30, fontWeight: "700", color: C.blue, marginTop: 6 },
  statUnit: { fontSize: 15, fontWeight: "500", color: C.muted },
  statFoot: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 8 },
  statFootText: { fontSize: 12, color: C.muted },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 28, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: C.text },
  sectionSub: { fontSize: 12, color: C.muted, marginTop: 2 },
  viewAll: { fontSize: 14, fontWeight: "600", color: C.blue },
  listCard: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: C.card, borderRadius: 16, padding: 14, marginBottom: 12 },
  chip: { width: 46, height: 46, borderRadius: 12, backgroundColor: C.chip, alignItems: "center", justifyContent: "center" },
  listTitle: { fontSize: 14, fontWeight: "700", color: C.text },
  listSub: { fontSize: 13, color: "#4A5568", marginTop: 3, lineHeight: 18 },
  emptyInline: { fontSize: 14, color: C.muted, paddingVertical: 12 },
  carousel: { paddingHorizontal: 18, paddingBottom: 8, gap: 14 },
  bCard: { width: 250, backgroundColor: C.card, borderRadius: 18, overflow: "hidden" },
  bCover: { height: 120, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  dotBig: { position: "absolute", width: 150, height: 150, borderRadius: 75, backgroundColor: "rgba(255,255,255,0.14)", right: -40, top: -50 },
  dotSmall: { position: "absolute", width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.12)", left: -20, bottom: -30 },
  bBody: { padding: 14 },
  bTitle: { fontSize: 15, fontWeight: "700", color: C.text, lineHeight: 21 },
  bMeta: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 10 },
  bMetaText: { fontSize: 12, color: C.muted },
  emptyText: { fontSize: 14, color: C.muted, textAlign: "center", marginVertical: 22, paddingHorizontal: 24 },
});