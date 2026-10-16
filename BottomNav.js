import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, shadow } from "./theme";

const TABS = [
  { id: "home", on: "home", off: "home-outline" },
  { id: "map", on: "map", off: "map-outline" },
  { id: "live", on: "pulse", off: "pulse-outline" },
  { id: "profile", on: "person", off: "person-outline" },
];

export default function BottomNav({ active = "home", onNavigate }) {
  return (
    <View style={s.wrap} pointerEvents="box-none">
      <View style={[s.nav, shadow]}>
        {TABS.map((t) =>
          t.id === active ? (
            <View key={t.id} style={s.active}>
              <Ionicons name={t.on} size={24} color="#fff" />
            </View>
          ) : (
            <TouchableOpacity key={t.id} style={s.btn} onPress={() => onNavigate(t.id)} accessibilityLabel={t.id}>
              <Ionicons name={t.off} size={24} color="#8A8F9C" />
            </TouchableOpacity>
          )
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, bottom: 18, alignItems: "center" },
  nav: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#fff",
    borderRadius: 32, padding: 6, width: 340,
  },
  active: { width: 96, height: 46, borderRadius: 23, backgroundColor: C.blue, alignItems: "center", justifyContent: "center" },
  btn: { flex: 1, height: 46, alignItems: "center", justifyContent: "center" },
});
