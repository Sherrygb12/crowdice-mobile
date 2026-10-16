import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, topPad } from "./theme";
import { useT } from "./i18n";

export default function SideMenu({ user, lang, onNavigate, onLogout, onClose }) {
  const t = useT(lang);
  const ITEMS = [
    { id: "home", icon: "home-outline", label: t("dashboard") },
    { id: "observations", icon: "time-outline", label: t("my_observations") },
    { id: "notifications", icon: "notifications-outline", label: t("announcements") },
    { divider: true },
    { id: "blogs", icon: "book-outline", label: t("guidelines") },
    { id: "feedback", icon: "chatbubble-ellipses-outline", label: t("support") },
    { id: "acknowledgments", icon: "ribbon-outline", label: lang === "fi" ? "Kiitokset" : "Acknowledgments" },
  ];
  const name = user?.username || user?.name || "—";
  const role = user?.role === "admin" ? "Admin" : t("field_scientist");
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <View style={s.overlay}>
      <View style={s.drawer}>
        <View style={s.header}>
          <View style={s.avatar}><Text style={s.avatarText}>{initials}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{name}</Text>
            <Text style={s.role}>{role}</Text>
          </View>
          <TouchableOpacity onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={22} color={C.muted} />
          </TouchableOpacity>
        </View>

        <View style={s.items}>
          {ITEMS.map((it, i) =>
            it.divider ? (
              <View key={"d" + i} style={s.divider} />
            ) : (
              <TouchableOpacity key={it.id} style={s.item} onPress={() => onNavigate(it.id)} activeOpacity={0.7}>
                <Ionicons name={it.icon} size={22} color={C.text} />
                <Text style={s.itemLabel}>{it.label}</Text>
              </TouchableOpacity>
            )
          )}
        </View>

        <View style={{ flex: 1 }} />
        <View style={s.footer}>
          <TouchableOpacity style={s.item} onPress={onLogout} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={22} color="#DC2626" />
            <Text style={[s.itemLabel, { color: "#DC2626", fontWeight: "700" }]}>{t("sign_out")}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Pressable style={s.backdrop} onPress={onClose} />
    </View>
  );
}

const s = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, flexDirection: "row", zIndex: 100 },
  drawer: { width: 290, maxWidth: "82%", backgroundColor: "#fff", paddingTop: topPad },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)" },
  header: { flexDirection: "row", alignItems: "center", gap: 12, padding: 18, paddingBottom: 20 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: C.blue, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "800", fontSize: 17 },
  name: { fontSize: 16, fontWeight: "700", color: C.text },
  role: { fontSize: 13, color: C.muted, marginTop: 2 },
  items: { paddingHorizontal: 8 },
  item: { flexDirection: "row", alignItems: "center", gap: 16, paddingVertical: 14, paddingHorizontal: 14, borderRadius: 12 },
  itemLabel: { fontSize: 15, color: C.text },
  divider: { height: 1, backgroundColor: C.line, marginVertical: 8, marginHorizontal: 14 },
  footer: { borderTopWidth: 1, borderTopColor: C.line, padding: 8, paddingBottom: 24 },
});