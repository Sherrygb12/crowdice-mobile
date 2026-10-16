import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, shadow, topPad } from "./theme";
import { useT } from "./i18n";

export default function ChangePasswordScreen({ apiUrl, token, lang, onNavigate }) {
  const t = useT(lang);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("idle"); // idle | saving | done
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!current || !next || !confirm) { setError(t("fill_all")); return; }
    if (next.length < 6) { setError(t("err_pw_short")); return; }
    if (!/[A-Z]/.test(next)) { setError(t("err_pw_caps")); return; }
    if (next !== confirm) { setError(t("err_pw_match")); return; }
    setStatus("saving");
    try {
      const res = await fetch(apiUrl + "/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json();
      if (res.ok) { setStatus("done"); setCurrent(""); setNext(""); setConfirm(""); }
      else { setStatus("idle"); setError(res.status === 401 ? t("current_pw_wrong") : (data.error || t("could_not_send"))); }
    } catch (e) { setStatus("idle"); setError(t("err_server")); }
  };

  const Field = ({ label, value, onChange }) => (
    <>
      <Text style={s.label}>{label}</Text>
      <View style={s.input}>
        <Ionicons name="lock-closed-outline" size={18} color={C.muted} />
        <TextInput value={value} onChangeText={onChange} secureTextEntry placeholder="••••••" placeholderTextColor="#9CA3AF" style={s.inputText} />
      </View>
    </>
  );

  return (
    <View style={s.root}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => onNavigate("profile")} hitSlop={10} style={s.back}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.title}>{t("change_password")}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18 }}>
        <View style={s.hero}>
          <View style={s.heroIcon}><Ionicons name="key" size={30} color={C.blue} /></View>
        </View>

        {status === "done" && (
          <View style={s.successBox}>
            <Ionicons name="checkmark-circle" size={22} color={C.green} />
            <Text style={s.successText}>{t("password_updated")}</Text>
          </View>
        )}

        <View style={[s.card, shadow]}>
          <Field label={t("current_password")} value={current} onChange={setCurrent} />
          <Field label={t("new_password")} value={next} onChange={setNext} />
          <Text style={s.hint}>{t("pw_hint")}</Text>
          <Field label={t("confirm_new_password")} value={confirm} onChange={setConfirm} />

          {error ? <Text style={s.errorText}>{error}</Text> : null}

          <TouchableOpacity style={[s.btn, status === "saving" && { opacity: 0.7 }]} onPress={submit} disabled={status === "saving"} activeOpacity={0.85}>
            {status === "saving" ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>{t("update_password")}</Text>}
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
  heroIcon: { width: 70, height: 70, borderRadius: 35, backgroundColor: C.chip, alignItems: "center", justifyContent: "center" },
  successBox: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#D1FAE5", borderRadius: 14, padding: 14, marginBottom: 16 },
  successText: { flex: 1, fontSize: 14, color: "#065F46", lineHeight: 20 },
  card: { backgroundColor: "#fff", borderRadius: 18, padding: 18 },
  label: { fontSize: 13, fontWeight: "600", color: C.text, marginBottom: 8, marginTop: 14 },
  input: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1.5, borderColor: C.line, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: "#FAFAFA" },
  inputText: { flex: 1, fontSize: 15, color: C.text, outlineStyle: "none" },
  hint: { color: "#a0aec0", fontSize: 12, marginTop: 6 },
  errorText: { fontSize: 13, color: "#DC2626", marginTop: 12 },
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: C.blue, borderRadius: 14, height: 52, marginTop: 20 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});