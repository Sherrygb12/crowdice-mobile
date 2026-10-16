import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, shadow, topPad } from "./theme";
import { useT } from "./i18n";

const Q = {
  en: {
    title: "Future Expectations",
    intro: "Share your thoughts on the future of river ice. All optional.",
    river: "River name", river_ph: "Kiiminkijoki",
    dur_q: "How do you see the duration of river ice cover in the future?",
    dur_longer: "Longer than today", dur_shorter: "Shorter than today", dur_same: "Same as today",
    ice_q: "What ice types do you expect in the future? (choose any)",
    flood_q: "How will ice-jam floods affect your life in the future? (choose any)",
    fl_adapt: "Adaptation measures", fl_struct: "Structural damage", fl_env: "Environmental damage", fl_none: "No effect", fl_other: "Something else",
    improve_q: "Can the river ice situation be improved?",
    imp_no: "No action needed", imp_yes: "Need for action", imp_cant: "Cant say",
    other: "Something else", cant: "Cant say",
    submit: "Submit",
    done_title: "Thank you!", done_sub: "Your answers help the river ice research.", done_btn: "Back to Home",
    err: "Could not submit. Please try again.",
  },
  fi: {
    title: "Tulevaisuuden odotukset",
    intro: "Kerro ajatuksesi jokijaan tulevaisuudesta. Kaikki valinnaisia.",
    river: "Joen nimi", river_ph: "Kiiminkijoki",
    dur_q: "Miten naet jokijaan keston tulevaisuudessa?",
    dur_longer: "Pidempi kuin nyt", dur_shorter: "Lyhyempi kuin nyt", dur_same: "Sama kuin nyt",
    ice_q: "Mita jaatyyppeja odotat tulevaisuudessa? (valitse useita)",
    flood_q: "Miten jaapatotulvat vaikuttavat tulevaisuudessa? (valitse useita)",
    fl_adapt: "Sopeutumistoimet", fl_struct: "Rakenteelliset vauriot", fl_env: "Ymparistovahingot", fl_none: "Ei vaikutusta", fl_other: "Jokin muu",
    improve_q: "Voidaanko jokijaan tilannetta parantaa?",
    imp_no: "Ei toimia tarvita", imp_yes: "Toimia tarvitaan", imp_cant: "En osaa sanoa",
    other: "Jokin muu", cant: "En osaa sanoa",
    submit: "Laheta",
    done_title: "Kiitos!", done_sub: "Vastauksesi auttavat jokijaan tutkimusta.", done_btn: "Takaisin kotiin",
    err: "Lahetys epaonnistui. Yrita uudelleen.",
  },
};
const ICE = ["sheet_ice", "border_ice", "frazil_ice", "pancake_ice"];

export default function QuestionnaireScreen({ apiUrl = "https://appapi.crowdice.fi", token, lang, onNavigate }) {
  const t = useT(lang);
  const q = Q[lang === "fi" ? "fi" : "en"];
  const [river, setRiver] = useState("Kiiminkijoki");
  const [duration, setDuration] = useState(null);
  const [iceTypes, setIceTypes] = useState([]);
  const [flood, setFlood] = useState([]);
  const [improve, setImprove] = useState(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const toggle = (arr, set, v) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const submit = async () => {
    setSending(true); setError("");
    try {
      const body = { river_name: river, duration, ice_types: JSON.stringify(iceTypes), flood_impact: JSON.stringify(flood), improvement: improve };
      const res = await fetch(apiUrl + "/future-survey", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) },
        body: JSON.stringify(body),
      });
      if (res.ok) setDone(true); else setError(q.err);
    } catch (e) { setError(q.err); }
    setSending(false);
  };

  const Chip = ({ active, label, onPress }) => (
    <TouchableOpacity style={[s.chip, active && s.chipOn]} onPress={onPress} activeOpacity={0.85}>
      <Text style={[s.chipText, active && { color: "#fff" }]}>{label}</Text>
    </TouchableOpacity>
  );

  if (done) {
    return (
      <View style={[s.root, { alignItems: "center", justifyContent: "center", padding: 30 }]}>
        <View style={s.okCircle}><Ionicons name="checkmark" size={44} color="#fff" /></View>
        <Text style={s.okTitle}>{q.done_title}</Text>
        <Text style={s.okSub}>{q.done_sub}</Text>
        <TouchableOpacity style={s.okBtn} onPress={() => onNavigate("home")}><Text style={s.okBtnText}>{q.done_btn}</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => onNavigate("home")} hitSlop={10} style={s.back}><Ionicons name="arrow-back" size={22} color={C.text} /></TouchableOpacity>
        <Text style={s.title}>{q.title}</Text>
        <View style={{ width: 38 }} />
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18, paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
        <Text style={s.intro}>{q.intro}</Text>
        <Text style={s.label}>{q.river}</Text>
        <View style={[s.input, shadow]}>
          <Ionicons name="water-outline" size={18} color={C.muted} />
          <TextInput value={river} onChangeText={setRiver} placeholder={q.river_ph} placeholderTextColor="#9CA3AF" style={s.inputText} />
        </View>
        <Text style={s.label}>{q.dur_q}</Text>
        <View style={s.grid}>
          <Chip active={duration === "longer"} label={q.dur_longer} onPress={() => setDuration("longer")} />
          <Chip active={duration === "shorter"} label={q.dur_shorter} onPress={() => setDuration("shorter")} />
          <Chip active={duration === "same"} label={q.dur_same} onPress={() => setDuration("same")} />
        </View>
        <Text style={s.label}>{q.ice_q}</Text>
        <View style={s.grid}>
          {ICE.map((id) => <Chip key={id} active={iceTypes.includes(id)} label={t(id)} onPress={() => toggle(iceTypes, setIceTypes, id)} />)}
          <Chip active={iceTypes.includes("other")} label={q.other} onPress={() => toggle(iceTypes, setIceTypes, "other")} />
          <Chip active={iceTypes.includes("cant")} label={q.cant} onPress={() => toggle(iceTypes, setIceTypes, "cant")} />
        </View>
        <Text style={s.label}>{q.flood_q}</Text>
        <View style={s.grid}>
          <Chip active={flood.includes("adapt")} label={q.fl_adapt} onPress={() => toggle(flood, setFlood, "adapt")} />
          <Chip active={flood.includes("struct")} label={q.fl_struct} onPress={() => toggle(flood, setFlood, "struct")} />
          <Chip active={flood.includes("env")} label={q.fl_env} onPress={() => toggle(flood, setFlood, "env")} />
          <Chip active={flood.includes("none")} label={q.fl_none} onPress={() => toggle(flood, setFlood, "none")} />
          <Chip active={flood.includes("other")} label={q.fl_other} onPress={() => toggle(flood, setFlood, "other")} />
        </View>
        <Text style={s.label}>{q.improve_q}</Text>
        <View style={s.grid}>
          <Chip active={improve === "no"} label={q.imp_no} onPress={() => setImprove("no")} />
          <Chip active={improve === "yes"} label={q.imp_yes} onPress={() => setImprove("yes")} />
          <Chip active={improve === "cant"} label={q.imp_cant} onPress={() => setImprove("cant")} />
        </View>
        {error ? <Text style={s.error}>{error}</Text> : null}
        <TouchableOpacity style={[s.submit, sending && { opacity: 0.6 }]} disabled={sending} onPress={submit} activeOpacity={0.88}>
          {sending ? <ActivityIndicator color="#fff" /> : <Text style={s.submitText}>{q.submit}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: topPad, paddingBottom: 12, paddingHorizontal: 16, backgroundColor: "#FAFAFC" },
  back: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "#EEF0F5" },
  title: { fontSize: 18, fontWeight: "700", color: C.blue },
  intro: { fontSize: 14, lineHeight: 21, color: C.body, marginBottom: 6 },
  label: { fontSize: 14, fontWeight: "600", color: C.text, marginTop: 22, marginBottom: 10 },
  input: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  inputText: { flex: 1, fontSize: 15, color: C.text, outlineStyle: "none" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: { backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1.5, borderColor: C.line },
  chipOn: { backgroundColor: C.blue, borderColor: C.blue },
  chipText: { fontSize: 14, fontWeight: "600", color: C.text },
  submit: { height: 52, borderRadius: 14, backgroundColor: C.blue, alignItems: "center", justifyContent: "center", marginTop: 28 },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  error: { color: "#c62828", marginTop: 16, textAlign: "center" },
  okCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: C.green, alignItems: "center", justifyContent: "center" },
  okTitle: { fontSize: 24, fontWeight: "800", color: C.text, marginTop: 24 },
  okSub: { fontSize: 15, lineHeight: 22, color: C.muted, textAlign: "center", marginTop: 10 },
  okBtn: { backgroundColor: C.blue, borderRadius: 14, paddingHorizontal: 32, height: 50, alignItems: "center", justifyContent: "center", marginTop: 30 },
  okBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
