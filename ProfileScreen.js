import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, shadow, topPad } from "./theme";
import BottomNav from "./BottomNav";
import { useT } from "./i18n";
import { useObservations } from "./obsUtils";

function Stat({ value, label, color }) {
  return (
    <View style={[s.stat, shadow]}>
      <Text style={[s.statValue, { color }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function Toggle({ icon, label, value, onValueChange }) {
  return (
    <View style={s.prefRow}>
      <Ionicons name={icon} size={20} color={C.blue} />
      <Text style={s.prefLabel}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: C.blue, false: "#CBD5E1" }} thumbColor="#fff" />
    </View>
  );
}

function LinkRow({ icon, label, danger, onPress, last }) {
  return (
    <TouchableOpacity style={[s.linkRow, last && { borderBottomWidth: 0 }]} onPress={onPress} activeOpacity={0.7}>
      <View style={[s.linkIcon, danger && { backgroundColor: "#FEE2E2" }]}>
        <Ionicons name={icon} size={18} color={danger ? "#DC2626" : C.text} />
      </View>
      <Text style={[s.linkLabel, danger && { color: "#DC2626", fontWeight: "700" }]}>{label}</Text>
      {!danger && <Ionicons name="chevron-forward" size={18} color="#B6BBC6" />}
    </TouchableOpacity>
  );
}

export default function ProfileScreen({ user, apiUrl, token, lang, onLangChange, onNavigate, onLogout }) {
  const t = useT(lang);
  const obs = useObservations(apiUrl, token);
  const myObsCount = user ? obs.items.filter((o) => o.user_id === user.id).length : 0;
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(true);

  // Load saved notification preferences from the backend.
  useEffect(() => {
    let alive = true;
    if (!token) return;
    fetch(apiUrl + "/auth/profile", { headers: { Authorization: "Bearer " + token } })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (alive && j) { setPush(j.push_opt_in !== false); setEmail(j.email_opt_in !== false); } })
      .catch(() => {});
    return () => { alive = false; };
  }, [token]);

  // Persist a preference change immediately; revert the switch if the save fails.
  const savePrefs = (next) => {
    fetch(apiUrl + "/auth/notify-prefs", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify(next),
    }).catch(() => {});
  };
  const onPush = (v) => { setPush(v); savePrefs({ push_opt_in: v }); };
  const onEmail = (v) => { setEmail(v); savePrefs({ email_opt_in: v }); };

  const name = user?.username || user?.name || "-";
  const role = user?.role === "admin" ? "ADMIN" : t("citizen");
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

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

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18, paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
        <View style={s.head}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initials}</Text>
            <View style={s.editBadge}><Ionicons name="pencil" size={11} color="#fff" /></View>
          </View>
          <Text style={s.name}>{name}</Text>
          <Text style={s.role}>{role}</Text>
          <TouchableOpacity style={s.editBtn} onPress={() => onNavigate("editProfile")}>
            <Ionicons name="create-outline" size={15} color={C.blue} />
            <Text style={s.editText}>{t("edit_profile")}</Text>
          </TouchableOpacity>
        </View>

        <View style={s.statsRow}>
          <Stat value={myObsCount} label={t("observations_label")} color={C.blue} />
          <Stat value={user?.reviewed ?? 0} label={t("reviewed")} color="#6D28D9" />
          <Stat value={user?.daysActive ?? 0} label={t("days_active")} color={C.green} />
        </View>

        <View style={[s.card, shadow]}>
          <Text style={s.cardTitle}>{t("preferences")}</Text>
          <Toggle icon="notifications" label={t("push_notifications")} value={push} onValueChange={onPush} />
          <View style={s.div} />
          <Toggle icon="mail" label={t("email_notifications")} value={email} onValueChange={onEmail} />
          <View style={s.div} />
          <TouchableOpacity style={s.prefRow} onPress={() => onNavigate("region")} activeOpacity={0.7}>
            <Ionicons name="location" size={20} color={C.blue} />
            <Text style={s.prefLabel}>{t("region")}</Text>
            <Text style={s.prefValue}>Oulu</Text>
            <Ionicons name="chevron-forward" size={18} color="#B6BBC6" />
          </TouchableOpacity>
          <View style={s.div} />
          <View style={s.prefRow}>
            <Ionicons name="language" size={20} color={C.blue} />
            <Text style={s.prefLabel}>{t("language")}</Text>
            <View style={s.langGroup}>
              {["en", "fi"].map((l) => (
                <TouchableOpacity key={l} onPress={() => onLangChange && onLangChange(l)} style={[s.langBtn, lang === l && s.langOn]}>
                  <Text style={[s.langText, lang === l && { color: "#fff" }]}>{l.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={[s.card, shadow, { paddingVertical: 4 }]}>
          <LinkRow icon="lock-closed" label={t("change_password")} onPress={() => onNavigate("changePassword")} />
          <LinkRow icon="time" label={t("observation_history")} onPress={() => onNavigate("observations")} />
          <LinkRow icon="trash" label={t("delete_account")} danger onPress={() => onNavigate("deleteAccount")} />
          <LinkRow icon="log-out" label={t("sign_out")} danger last onPress={onLogout} />
        </View>
      </ScrollView>

      <BottomNav active="profile" onNavigate={onNavigate} />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: topPad, paddingBottom: 14, paddingHorizontal: 20, backgroundColor: "#FAFAFC" },
  brand: { fontSize: 19, fontWeight: "700", color: C.blue },
  head: { alignItems: "center", paddingVertical: 12 },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: C.chip, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 30, fontWeight: "800", color: C.blue },
  editBadge: { position: "absolute", right: 2, bottom: 2, width: 26, height: 26, borderRadius: 13, backgroundColor: C.blue, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: C.bg },
  name: { fontSize: 22, fontWeight: "800", color: C.text, marginTop: 12 },
  role: { fontSize: 12, fontWeight: "600", color: C.muted, letterSpacing: 1, marginTop: 2 },
  editBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 },
  editText: { fontSize: 14, fontWeight: "600", color: C.blue },
  statsRow: { flexDirection: "row", gap: 12, marginTop: 16 },
  stat: { flex: 1, backgroundColor: "#fff", borderRadius: 16, paddingVertical: 18, alignItems: "center" },
  statValue: { fontSize: 26, fontWeight: "800" },
  statLabel: { fontSize: 12, color: C.muted, marginTop: 4, textAlign: "center" },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginTop: 16 },
  cardTitle: { fontSize: 17, fontWeight: "700", color: C.text, marginBottom: 8 },
  prefRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 12 },
  prefLabel: { flex: 1, fontSize: 15, color: C.text },
  prefValue: { fontSize: 15, color: C.muted, marginRight: 6 },
  div: { height: 1, backgroundColor: C.line },
  langGroup: { flexDirection: "row", gap: 6 },
  langBtn: { paddingHorizontal: 14, height: 32, borderRadius: 16, borderWidth: 1, borderColor: C.line, alignItems: "center", justifyContent: "center" },
  langOn: { backgroundColor: C.blue, borderColor: C.blue },
  langText: { fontSize: 12, fontWeight: "700", color: C.body },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: C.line },
  linkIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#EEF0F5", alignItems: "center", justifyContent: "center" },
  linkLabel: { flex: 1, fontSize: 15, color: C.text },
});
