import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, shadow, topPad } from "./theme";
import BottomNav from "./BottomNav";
import { useT } from "./i18n";

const DATA = {
  observations: [
    { id: "o1", lat: 65.133, lng: 25.78 }, { id: "o2", lat: 65.118, lng: 25.80 }, { id: "o3", lat: 65.105, lng: 25.76 },
  ],
  cameras: [
    { id: "c1", lat: 65.145, lng: 25.83 }, { id: "c2", lat: 65.128, lng: 25.81 }, { id: "c3", lat: 65.150, lng: 25.86 },
  ],
  sensors: [
    { id: "s1", lat: 65.138, lng: 25.79 }, { id: "s2", lat: 65.112, lng: 25.82 },
  ],
};

function buildHtml(active) {
  const layers = [];
  if (active.observations) DATA.observations.forEach((p) => layers.push({ ...p, color: "#0A84FF" }));
  if (active.cameras) DATA.cameras.forEach((p) => layers.push({ ...p, color: "#7C3AED" }));
  if (active.sensors) DATA.sensors.forEach((p) => layers.push({ ...p, color: "#0891B2" }));
  const markers = JSON.stringify(layers);
  return `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>html,body,#map{height:100%;margin:0;padding:0}
.pin{border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)}</style>
</head><body><div id="map"></div><script>
var map=L.map('map',{zoomControl:false}).setView([65.128,25.80],12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© OpenStreetMap'}).addTo(map);
L.control.zoom({position:'bottomleft'}).addTo(map);
var markers=${markers};
markers.forEach(function(m){
  var icon=L.divIcon({className:'',html:'<div class="pin" style="background:'+m.color+'"><svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><circle cx="12" cy="12" r="6"/></svg></div>',iconSize:[30,30],iconAnchor:[15,15]});
  L.marker([m.lat,m.lng],{icon:icon}).addTo(map);
});
</script></body></html>`;
}

export default function MapScreen({ lang, onNavigate }) {
  const t = useT(lang);
  const FILTERS = [
    { id: "observations", label: t("observations_label"), color: C.blue, icon: "eye" },
    { id: "cameras", label: t("cameras"), color: "#7C3AED", icon: "videocam" },
    { id: "sensors", label: t("sensors"), color: "#0891B2", icon: "pulse" },
  ];
  const [active, setActive] = useState({ observations: true, cameras: true, sensors: true });
  const [panelOpen, setPanelOpen] = useState(true);
  const toggle = (id) => setActive((a) => ({ ...a, [id]: !a[id] }));

  const html = buildHtml(active);
  const counts = {
    observations: active.observations ? DATA.observations.length : 0,
    cameras: active.cameras ? DATA.cameras.length : 0,
    sensors: active.sensors ? DATA.sensors.length : 0,
  };

  return (
    <View style={s.root}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => onNavigate("menu")} hitSlop={10}>
          <Ionicons name="menu" size={26} color={C.text} />
        </TouchableOpacity>
        <Text style={s.brand}>CrowdICE</Text>
        <TouchableOpacity onPress={() => onNavigate("notifications")} hitSlop={10}>
          <Ionicons name="notifications-outline" size={24} color={C.text} />
        </TouchableOpacity>
      </View>

      <View style={s.mapWrap}>
        <iframe srcDoc={html} style={{ border: "none", width: "100%", height: "100%" }} title="map" />

        <View style={s.filters}>
          {FILTERS.map((f) => (
            <TouchableOpacity key={f.id} style={[s.chip, { backgroundColor: active[f.id] ? f.color : "#fff" }]} onPress={() => toggle(f.id)} activeOpacity={0.85}>
              <Ionicons name={f.icon} size={16} color={active[f.id] ? "#fff" : f.color} />
              <Text style={[s.chipText, { color: active[f.id] ? "#fff" : f.color }]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={s.fab} onPress={() => onNavigate("submit")} activeOpacity={0.9}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={[s.panel, shadow]}>
          <TouchableOpacity style={s.panelHead} onPress={() => setPanelOpen((o) => !o)} activeOpacity={0.8}>
            <Text style={s.panelTitle}>{t("active_data_points")}</Text>
            <Ionicons name={panelOpen ? "chevron-down" : "chevron-up"} size={20} color={C.muted} />
          </TouchableOpacity>
          {panelOpen && (
            <>
              <View style={s.panelRow}>
                <View style={s.panelStat}>
                  <Ionicons name="eye" size={18} color="#0A84FF" />
                  <Text style={s.panelNum}>{String(counts.observations).padStart(2, "0")}</Text>
                  <Text style={s.panelLabel}>{t("observations_label")}</Text>
                </View>
                <View style={s.panelStat}>
                  <Ionicons name="videocam" size={18} color="#7C3AED" />
                  <Text style={s.panelNum}>{String(counts.cameras).padStart(2, "0")}</Text>
                  <Text style={s.panelLabel}>{t("live_cams")}</Text>
                </View>
                <View style={s.panelStat}>
                  <Ionicons name="pulse" size={18} color="#0891B2" />
                  <Text style={s.panelNum}>{String(counts.sensors).padStart(2, "0")}</Text>
                  <Text style={s.panelLabel}>{t("sensors")}</Text>
                </View>
              </View>
            </>
          )}
        </View>
      </View>

      <BottomNav active="map" onNavigate={onNavigate} />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: topPad, paddingBottom: 14, paddingHorizontal: 20, backgroundColor: "#FAFAFC", zIndex: 5 },
  brand: { fontSize: 19, fontWeight: "700", color: C.blue },
  mapWrap: { flex: 1, position: "relative" },
  filters: { position: "absolute", top: 14, left: 14, gap: 8, zIndex: 10 },
  chip: { flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 24, ...shadow },
  chipText: { fontSize: 13, fontWeight: "700" },
  fab: { position: "absolute", right: 18, bottom: 150, width: 56, height: 56, borderRadius: 28, backgroundColor: C.blue, alignItems: "center", justifyContent: "center", zIndex: 10, ...shadow },
  panel: { position: "absolute", left: 14, right: 14, bottom: 90, backgroundColor: "#fff", borderRadius: 18, padding: 16, zIndex: 10 },
  panelHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  panelTitle: { fontSize: 15, fontWeight: "700", color: C.text },
  panelRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 14 },
  panelStat: { alignItems: "center", gap: 3 },
  panelNum: { fontSize: 22, fontWeight: "800", color: C.text },
  panelLabel: { fontSize: 12, color: C.muted },
});