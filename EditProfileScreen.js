import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, shadow, topPad } from "./theme";
import { useT } from "./i18n";

const emailValid = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export default function EditProfileScreen({ apiUrl, token, lang, user, onNavigate, onUserUpdate }) {
  const t = useT(lang);
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const initials = (username || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const submit = async () => {
    setError("");
    if (!username.trim()) { setError(t("err_name")); return; }
    if (!emailValid(email)) { setError(t("err_email_invalid")); return; }
    setStatus("saving");
    try {
      const res = await fetch(apiUrl + "/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) },
        body: JSON.stringify({ username, email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("done");
        if (onUserUpdate && data.user) onUserUpdate(data.user);
      } else {
        setStatus("idle");
        setError(data.error === "That email is already in use." ? t("email_in_use") : (data.error || t("could_not_send")));
      }
    } catch (e) { setStatus("idle"); setError(t("err_server")); }
  };

  return (
    <View style={s.root}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => onNavigate("profile")} hitSlop={10} style={s.back}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.title}>{t("edit_profile")}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18 }}>
        <View style={s.hero}>
          <View style={s.avatar}><Text style={s.avatarText}>{initials}</Text></View>
        </View>

        {status === "done" && (
          <View style={s.successBox}>
            <Ionicons name="checkmark-circle" size={22} color={C.green} />
            <Text style={s.successText}>{t("profile_updated")}</Text>
          </View>
        )}

        <View style={[s.card, shadow]}>
          <Text style={s.label}>{t("username_label")}</Text>
          <View style={s.input}>
            <Ionicons name="person-outline" size={18} color={C.muted} />
            <TextInput value={username} onChangeText={setUsername} placeholder={t("your_name")} placeholderTextColor="#9CA3AF" style={s.inputText} />
          </View>

          <Text style={s.label}>{t("email_address")}</Text>
          <View style={s.input}>
            <Ionicons name="mail-outline" size={18} color={C.muted} />
            <TextInput value={email} onChangeText={setEmail} placeholder="email@example.com" placeholderTextColor="#9CA3AF" keyboardType="email-address" autoCapitalize="none" style={s.inputText} />
          </View>

          {error ? <Text style={s.errorText}>{error}</Text> : null}

          <TouchableOpacity style={[s.btn, status === "saving" && { opacity: 0.7 }]} onPress={submit} disabled={status === "saving"} activeOpacity={0.85}>
            {status === "saving" ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>{t("save_changes")}</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: topPad, paddingBottom: 12, paddingHorizontal: 16, backgroundColor: "#FAFAFC" },
  back: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "#EEF0F5" },
  title: { fontSize: 18, fontWeight: "700", color: C.blue },
  hero: { alignItems: "center", paddingVertical: 20 },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: C.chip, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 30, fontWeight: "800", color: C.blue },
  successBox: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#D1FAE5", borderRadius: 14, padding: 14, marginBottom: 16 },
  successText: { flex: 1, fontSize: 14, color: "#065F46", lineHeight: 20 },
  card: { backgroundColor: "#fff", borderRadius: 18, padding: 18 },
  label: { fontSize: 13, fontWeight: "600", color: C.text, marginBottom: 8, marginTop: 14 },
  input: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1.5, borderColor: C.line, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: "#FAFAFA" },
  inputText: { flex: 1, fontSize: 15, color: C.text, outlineStyle: "none" },
  errorText: { fontSize: 13, color: "#DC2626", marginTop: 12 },
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: C.blue, borderRadius: 14, height: 52, marginTop: 20 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});