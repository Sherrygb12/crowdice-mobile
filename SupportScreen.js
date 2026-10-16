import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, shadow, topPad } from "./theme";
import { useT } from "./i18n";

const CONTACT_EMAIL = "Ritesh.Patro@oulu.fi";

export default function SupportScreen({ apiUrl, token, lang, onNavigate }) {
  const t = useT(lang);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle");

  const send = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) { setStatus("error"); return; }
    setStatus("sending");
    try {
      const res = await fetch(apiUrl + "/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) },
        body: JSON.stringify({ name, email, message }),
      });
      if (res.ok) { setStatus("sent"); setName(""); setEmail(""); setMessage(""); }
      else setStatus("error");
    } catch (e) { setStatus("error"); }
  };

  return (
    <View style={s.root}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => onNavigate("home")} hitSlop={10} style={s.back}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.title}>{t("support")}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.hero}>
          <View style={s.heroIcon}><Ionicons name="chatbubbles" size={32} color={C.blue} /></View>
          <Text style={s.heroTitle}>{t("get_in_touch")}</Text>
          <Text style={s.heroSub}>{t("support_sub")}</Text>
        </View>

        {status === "sent" && (
          <View style={s.successBox}>
            <Ionicons name="checkmark-circle" size={22} color={C.green} />
            <Text style={s.successText}>{t("message_sent")}</Text>
          </View>
        )}

        <View style={[s.card, shadow]}>
          <Text style={s.label}>{t("full_name")}</Text>
          <View style={[s.input, name.length > 0 && s.inputActive]}>
            <Ionicons name="person-outline" size={18} color={C.muted} />
            <TextInput value={name} onChangeText={setName} placeholder={t("your_name")} placeholderTextColor="#9CA3AF" style={s.inputText} />
          </View>

          <Text style={s.label}>{t("email_address")}</Text>
          <View style={[s.input, email.length > 0 && s.inputActive]}>
            <Ionicons name="mail-outline" size={18} color={C.muted} />
            <TextInput value={email} onChangeText={setEmail} placeholder="email@example.com" placeholderTextColor="#9CA3AF" keyboardType="email-address" autoCapitalize="none" style={s.inputText} />
          </View>

          <Text style={s.label}>{t("message")}</Text>
          <View style={[s.input, s.inputTall, message.length > 0 && s.inputActive]}>
            <TextInput value={message} onChangeText={setMessage} placeholder={t("message_ph")} placeholderTextColor="#9CA3AF" multiline numberOfLines={5} style={[s.inputText, { height: 120, textAlignVertical: "top", paddingTop: 4 }]} />
          </View>

          {status === "error" && (
            <Text style={s.errorText}>
              {!name.trim() || !email.trim() || !message.trim() ? t("fill_all") : t("could_not_send")}
            </Text>
          )}

          <TouchableOpacity style={[s.btn, status === "sending" && { opacity: 0.7 }]} onPress={send} disabled={status === "sending"} activeOpacity={0.85}>
            {status === "sending" ? <ActivityIndicator color="#fff" /> : (
              <>
                <Ionicons name="send" size={18} color="#fff" />
                <Text style={s.btnText}>{t("send_message")}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={[s.card, shadow]}>
          <Text style={s.contactTitle}>{t("contact_directly")}</Text>
          <View style={s.contactRow}>
            <View style={s.contactIcon}><Ionicons name="mail" size={20} color={C.blue} /></View>
            <View style={{ flex: 1 }}>
              <Text style={s.contactLabel}>{t("email")}</Text>
              <Text style={s.contactValue}>{CONTACT_EMAIL}</Text>
            </View>
          </View>
          <View style={s.contactRow}>
            <View style={s.contactIcon}><Ionicons name="location" size={20} color={C.blue} /></View>
            <View style={{ flex: 1 }}>
              <Text style={s.contactLabel}>{t("address")}</Text>
              <Text style={s.contactValue}>Water, Energy and Environmental Engineering{"\n"}University of Oulu{"\n"}Pentti Kaiteran katu 1, 90014 Oulu, Finland</Text>
            </View>
          </View>
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
  scroll: { padding: 18, paddingBottom: 60 },
  hero: { alignItems: "center", paddingVertical: 20 },
  heroIcon: { width: 70, height: 70, borderRadius: 35, backgroundColor: C.chip, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  heroTitle: { fontSize: 22, fontWeight: "800", color: C.text },
  heroSub: { fontSize: 14, lineHeight: 21, color: C.muted, textAlign: "center", marginTop: 6, paddingHorizontal: 10 },
  successBox: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#D1FAE5", borderRadius: 14, padding: 14, marginBottom: 16 },
  successText: { flex: 1, fontSize: 14, color: "#065F46", lineHeight: 20 },
  card: { backgroundColor: "#fff", borderRadius: 18, padding: 18, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", color: C.text, marginBottom: 8, marginTop: 14 },
  input: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1.5, borderColor: C.line, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: "#FAFAFA" },
  inputActive: { borderColor: C.blue, backgroundColor: "#fff" },
  inputTall: { alignItems: "flex-start", paddingTop: 12 },
  inputText: { flex: 1, fontSize: 15, color: C.text, outlineStyle: "none" },
  errorText: { fontSize: 13, color: "#DC2626", marginTop: 10 },
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: C.blue, borderRadius: 14, height: 52, marginTop: 20 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  contactTitle: { fontSize: 16, fontWeight: "700", color: C.text, marginBottom: 16 },
  contactRow: { flexDirection: "row", alignItems: "flex-start", gap: 14, paddingVertical: 12, borderTopWidth: 1, borderTopColor: C.line },
  contactIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: C.chip, alignItems: "center", justifyContent: "center" },
  contactLabel: { fontSize: 12, color: C.muted, fontWeight: "600" },
  contactValue: { fontSize: 14, color: C.text, marginTop: 2, lineHeight: 20 },
});
