import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, shadow, topPad } from "./theme";
import { useT } from "./i18n";
import RegionPicker, { REGIONS } from "./RegionPicker";

export default function RegionScreen({ lang, region, onRegionChange, onNavigate }) {
  const t = useT(lang);
  const [picker, setPicker] = useState(false);
  const current = region || "Oulu";

  return (
    <View style={s.root}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => onNavigate("profile")} hitSlop={10} style={s.back}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.title}>{t("region")}</Text>
        <View style={{ width: 38 }} />
      </View>

      <View style={{ padding: 18 }}>
        <TouchableOpacity style={[s.card, shadow]} onPress={() => setPicker(true)} activeOpacity={0.85}>
          <View style={s.iconBox}><Ionicons name="location" size={22} color={C.blue} /></View>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>{t("region")}</Text>
            <Text style={s.value}>{current}</Text>
          </View>
          <Ionicons name="chevron-down" size={20} color={C.muted} />
        </TouchableOpacity>
      </View>

      <RegionPicker
        visible={picker}
        value={current}
        lang={lang}
        onSelect={(r) => onRegionChange && onRegionChange(r)}
        onClose={() => setPicker(false)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: topPad, paddingBottom: 12, paddingHorizontal: 16, backgroundColor: "#FAFAFC" },
  back: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "#EEF0F5" },
  title: { fontSize: 18, fontWeight: "700", color: C.blue },
  card: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "#fff", borderRadius: 16, padding: 16 },
  iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.chip, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 12, color: C.muted, fontWeight: "600" },
  value: { fontSize: 16, fontWeight: "700", color: C.text, marginTop: 2 },
});