import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, shadow, topPad } from "./theme";

const EN = { title: "Acknowledgments", intro: "CrowdICE is a citizen-science project of the University of Oulu, developed with the people and funders below.", team: "Project team", funders: "Funding", supervisors: "Supervisors", coordinator: "Content & data coordination", tech: "Technical experts", dev: "Developer" };
const FI = { title: "Kiitokset", intro: "CrowdICE on Oulun yliopiston kansalaistieteen hanke, kehitetty alla olevien henkiloiden ja rahoittajien kanssa.", team: "Projektiryhma", funders: "Rahoitus", supervisors: "Ohjaajat", coordinator: "Sisalto ja tiedonkeruu", tech: "Tekniset asiantuntijat", dev: "Kehittaja" };

export default function AcknowledgmentsScreen({ lang, onNavigate }) {
  const x = lang === "fi" ? FI : EN;
  const Row = ({ role, people }) => (
    <View style={s.row}><Text style={s.role}>{role}</Text><Text style={s.people}>{people}</Text></View>
  );
  return (
    <View style={s.root}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => onNavigate("home")} hitSlop={10} style={s.back}><Ionicons name="arrow-back" size={22} color={C.text} /></TouchableOpacity>
        <Text style={s.title}>{x.title}</Text>
        <View style={{ width: 38 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <View style={s.hero}>
          <View style={s.badge}><Ionicons name="ribbon" size={26} color={C.blue} /></View>
          <Text style={s.intro}>{x.intro}</Text>
        </View>
        <Text style={s.section}>{x.team}</Text>
        <View style={[s.card, shadow]}>
          <Row role={x.supervisors} people={"Prof. Ali Torabi Haghighi\nDr. Ritesh Patro"} />
          <View style={s.div} />
          <Row role={x.coordinator} people={"Elli-Noora Torronen (MSc student)"} />
          <View style={s.div} />
          <Row role={x.tech} people={"Dr. Mourad Oussalah\nHamza Javed"} />
          <View style={s.div} />
          <Row role={x.dev} people={"Mahmood Sharifizemeidani\nKhawaja Haider\nPooya Mahmoodi\nUniversity of Oulu"} />
        </View>
        <Text style={s.section}>{x.funders}</Text>
        <View style={[s.card, shadow]}>
          <Text style={s.funder}>Digital Waters Flagship - Research Council of Finland (decision 359228)</Text>
          <View style={s.div} />
          <Text style={s.funder}>Interreg Aurora RE-HYDRO (#20358005)</Text>
          <View style={s.div} />
          <Text style={s.funder}>European Union - NextGenerationEU, CRYO-RI (grant 352758)</Text>
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
  hero: { alignItems: "center", paddingVertical: 8, marginBottom: 8 },
  badge: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#EAF1FE", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  intro: { fontSize: 14, lineHeight: 21, color: C.body, textAlign: "center" },
  section: { fontSize: 13, fontWeight: "700", color: C.muted, letterSpacing: 0.5, marginTop: 24, marginBottom: 10 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16 },
  row: { paddingVertical: 10 },
  role: { fontSize: 12, fontWeight: "600", color: C.blue, marginBottom: 4 },
  people: { fontSize: 15, color: C.text, lineHeight: 22 },
  div: { height: 1, backgroundColor: C.line },
  funder: { fontSize: 14, color: C.text, lineHeight: 21, paddingVertical: 10 },
});
