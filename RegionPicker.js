import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C } from "./theme";
import { useT } from "./i18n";

export const REGIONS = ["Oulu", "Kiiminki", "Haukipudas", "Pudasjärvi"];

export default function RegionPicker({ visible, value, lang, onSelect, onClose }) {
  const t = useT(lang);
  const options = [...REGIONS, t("region_other")];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <View style={s.sheet}>
          <View style={s.handle} />
          <Text style={s.title}>{t("select_region")}</Text>
          {options.map((r) => {
            const selected = value === r;
            return (
              <TouchableOpacity key={r} style={[s.row, selected && s.rowOn]} onPress={() => { onSelect(r); onClose(); }} activeOpacity={0.7}>
                <Ionicons name="location-outline" size={20} color={selected ? C.blue : C.muted} />
                <Text style={[s.rowText, selected && { color: C.blue, fontWeight: "700" }]}>{r}</Text>
                {selected && <Ionicons name="checkmark" size={20} color={C.blue} />}
              </TouchableOpacity>
            );
          })}
          <View style={{ height: 20 }} />
        </View>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingTop: 12 },
  handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: "#D1D5DB", alignSelf: "center", marginBottom: 16 },
  title: { fontSize: 18, fontWeight: "800", color: C.text, marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 15, paddingHorizontal: 14, borderRadius: 12 },
  rowOn: { backgroundColor: "#EFF6FF" },
  rowText: { flex: 1, fontSize: 16, color: C.text },
});