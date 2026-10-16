import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, shadow, topPad } from "./theme";

export default function DeleteAccountScreen({ apiUrl, token, lang, onNavigate, onLogout }) {
  const fi = lang === "fi";
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const KEYWORD = "DELETE";
  const ready = confirm.trim().toUpperCase() === KEYWORD && !busy;

  const T = {
    title: fi ? "Poista tili" : "Delete Account",
    heading: fi ? "Poista tilisi pysyvästi" : "Permanently delete your account",
    body: fi
      ? "Tämä poistaa tilisi ja kirjautumistietosi. Tätä ei voi perua. Lähettämäsi havainnot säilyvät nimettöminä tutkimusaineistossa, mutta niitä ei enää yhdistetä sinuun."
      : "This removes your account and login. It cannot be undone. Observations you submitted stay in the research data anonymously, but will no longer be linked to you.",
    typePrompt: fi ? 'Kirjoita "DELETE" vahvistaaksesi' : 'Type "DELETE" to confirm',
    cancel: fi ? "Peruuta" : "Cancel",
    del: fi ? "Poista tili" : "Delete account",
    failed: fi ? "Poisto epäonnistui. Yritä uudelleen." : "Could not delete the account. Please try again.",
  };

  const doDelete = async () => {
    if (!ready) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`${apiUrl}/auth/account`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("delete failed " + res.status);
      // account gone -> log the user out (returns to the login screen)
      onLogout();
    } catch (e) {
      setErr(T.failed);
      setBusy(false);
    }
  };

  return (
    <View style={s.root}>
      <View style={s.bar}>
        <TouchableOpacity onPress={() => onNavigate("profile")} style={s.back} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.barTitle}>{T.title}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 18 }} showsVerticalScrollIndicator={false}>
        <View style={[s.card, shadow]}>
          <View style={s.iconWrap}>
            <Ionicons name="warning" size={28} color="#DC2626" />
          </View>
          <Text style={s.heading}>{T.heading}</Text>
          <Text style={s.body}>{T.body}</Text>

          <Text style={s.label}>{T.typePrompt}</Text>
          <TextInput
            value={confirm}
            onChangeText={setConfirm}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder="DELETE"
            placeholderTextColor="#B6BBC6"
            style={s.input}
            editable={!busy}
          />

          {err ? <Text style={s.err}>{err}</Text> : null}

          <TouchableOpacity
            style={[s.delBtn, !ready && s.delBtnOff]}
            onPress={doDelete}
            activeOpacity={0.8}
            disabled={!ready}
          >
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.delText}>{T.del}</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={s.cancelBtn} onPress={() => onNavigate("profile")} disabled={busy}>
            <Text style={s.cancelText}>{T.cancel}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  bar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: topPad, paddingBottom: 12, paddingHorizontal: 16, backgroundColor: "#FAFAFC" },
  back: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "#EEF0F5" },
  barTitle: { fontSize: 18, fontWeight: "700", color: C.blue },
  card: { backgroundColor: "#fff", borderRadius: 18, padding: 22, alignItems: "center" },
  iconWrap: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#FEE2E2", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  heading: { fontSize: 19, fontWeight: "800", color: C.text, textAlign: "center" },
  body: { fontSize: 14, color: C.body, textAlign: "center", lineHeight: 20, marginTop: 10 },
  label: { alignSelf: "stretch", fontSize: 13, fontWeight: "600", color: C.muted, marginTop: 22, marginBottom: 8 },
  input: { alignSelf: "stretch", borderWidth: 1, borderColor: C.line, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, fontWeight: "700", letterSpacing: 2, color: C.text, backgroundColor: "#F9FAFB" },
  err: { alignSelf: "stretch", color: "#DC2626", fontSize: 13, marginTop: 10 },
  delBtn: { alignSelf: "stretch", backgroundColor: "#DC2626", borderRadius: 12, paddingVertical: 15, alignItems: "center", marginTop: 18 },
  delBtnOff: { backgroundColor: "#FCA5A5" },
  delText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  cancelBtn: { paddingVertical: 14, alignItems: "center", marginTop: 4 },
  cancelText: { color: C.blue, fontSize: 15, fontWeight: "600" },
});
