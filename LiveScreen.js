import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, shadow, topPad } from "./theme";
import BottomNav from "./BottomNav";
import { useT } from "./i18n";

const API = "https://appapi.crowdice.fi";
// Kiiminkijoki weather-station location
const LAT = 65.06, LON = 25.48;

const DAYS_FI = { Mon: "Ma", Tue: "Ti", Wed: "Ke", Thu: "To", Fri: "Pe", Sat: "La", Sun: "Su" };
const EN_DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dayLabel(dateStr, lang) {
  const d = new Date(dateStr + "T00:00");
  const en = EN_DAY[d.getDay()];
  return lang === "fi" ? (DAYS_FI[en] || en) : en;
}

// WMO weather code -> Ionicons name + bilingual label
function wmo(code, lang) {
  const fi = lang === "fi";
  if (code === 0) return ["sunny", fi ? "Selkeää" : "Clear"];
  if (code <= 2) return ["partly-sunny", fi ? "Puolipilvistä" : "Partly cloudy"];
  if (code === 3) return ["cloudy", fi ? "Pilvistä" : "Cloudy"];
  if (code <= 48) return ["cloudy", fi ? "Sumua" : "Fog"];
  if (code <= 57) return ["rainy", fi ? "Tihkusadetta" : "Drizzle"];
  if (code <= 67) return ["rainy", fi ? "Sadetta" : "Rain"];
  if (code <= 77) return ["snow", fi ? "Lumisadetta" : "Snow"];
  if (code <= 82) return ["rainy", fi ? "Sadekuuroja" : "Rain showers"];
  if (code <= 86) return ["snow", fi ? "Lumikuuroja" : "Snow showers"];
  return ["thunderstorm", fi ? "Ukkosta" : "Thunder"];
}

function fmtTime(ts) {
  if (!ts) return "";
  const m = String(ts).match(/(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
  return m ? `${m[3]}.${m[2]}. ${m[4]}:${m[5]}` : ts;
}

const show = (v, suffix = "") => (v === null || v === undefined ? "—" : `${v}${suffix}`);

function WeatherStat({ icon, label, value }) {
  return (
    <View style={[s.wStat, shadow]}>
      <Ionicons name={icon} size={20} color={C.blue} />
      <Text style={s.wStatLabel}>{label}</Text>
      <Text style={s.wStatValue}>{value}</Text>
    </View>
  );
}

export default function LiveScreen({ lang, onNavigate }) {
  const t = useT(lang);
  const [cameras, setCameras] = useState(null);
  const [camW, setCamW] = useState(0);
  const [camIdx, setCamIdx] = useState(0);
  const [weather, setWeather] = useState(null);
  const [wErr, setWErr] = useState(false);
  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    let alive = true;

    fetch(`${API}/cameras-live`)
      .then((r) => r.json())
      .then((j) => { if (alive) setCameras(j && j.cameras ? j.cameras.filter((c) => c.image && c.image.allas_url) : []); })
      .catch(() => { if (alive) setCameras([]); });

    fetch(`${API}/live-weather`)
      .then((r) => r.json())
      .then((j) => { if (alive) setWeather(j && j.latest ? j.latest : null); })
      .catch(() => { if (alive) setWErr(true); });

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
      `&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`;
    fetch(url)
      .then((r) => r.json())
      .then((j) => {
        if (!alive || !j || !j.daily) return;
        const d = j.daily;
        const rows = (d.time || []).map((date, i) => {
          const [icon, label] = wmo(d.weathercode[i], lang);
          return { day: dayLabel(date, lang), icon, label, hi: Math.round(d.temperature_2m_max[i]), lo: Math.round(d.temperature_2m_min[i]) };
        });
        setForecast(rows);
      })
      .catch(() => { if (alive) setForecast([]); });

    return () => { alive = false; };
  }, [lang]);

  const w = weather;

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

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18, paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
        <Text style={s.kicker}>{t("live_data_feed")}</Text>
        <Text style={s.h1}>{t("river_observation")}</Text>

        {/* Live cameras — swipeable carousel of real presigned images from /cameras-live */}
        <View style={[s.card, shadow]} onLayout={(e) => setCamW(Math.round(e.nativeEvent.layout.width - 36))}>
          <View style={s.cardHead}>
            <Text style={s.cardTitle}>{lang === "fi" ? "Live-kamerat" : "Live cameras"}</Text>
            <Ionicons name="videocam" size={20} color={C.text} />
          </View>

          {cameras === null ? (
            <ActivityIndicator style={{ marginTop: 18 }} color={C.blue} />
          ) : cameras.length === 0 ? (
            <Text style={s.cardSub}>{lang === "fi" ? "Ei kamerakuvia juuri nyt" : "No camera images right now"}</Text>
          ) : camW > 0 ? (
            <View style={{ marginTop: 12 }}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => setCamIdx(Math.round(e.nativeEvent.contentOffset.x / camW))}
              >
                {cameras.map((cam) => (
                  <View key={cam.id} style={{ width: camW }}>
                    <View style={s.camWrap}>
                      <Image source={{ uri: cam.image.allas_url }} style={[s.camImg, { width: camW }]} resizeMode="cover" />
                      <View style={s.camOverlay}>
                        <Text style={s.camNameO} numberOfLines={1}>{cam.name}</Text>
                        <Text style={s.camTimeO}>{fmtTime(cam.image.timestamp)}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
              {cameras.length > 1 && (
                <View style={s.dots}>
                  {cameras.map((_, i) => (<View key={i} style={[s.dot, i === camIdx && s.dotActive]} />))}
                </View>
              )}
            </View>
          ) : (
            <View style={{ height: 196 }} />
          )}
        </View>

        {/* Water level — real gauge coming once a live source exists (SYKE gauge discontinued 1991) */}
        <View style={[s.card, shadow]}>
          <View style={s.cardHead}>
            <Text style={s.cardLabel}>{t("water_level")}</Text>
          </View>
          <View style={s.soonBox}>
            <Ionicons name="water-outline" size={26} color={C.muted} />
            <Text style={s.soonText}>{lang === "fi" ? "Vedenkorkeusmittaus tulossa pian" : "Live gauge coming soon"}</Text>
          </View>
        </View>

        {/* Weather — real on-site DL-ATM41 sensor data */}
        <View style={[s.card, shadow]}>
          <View style={s.cardHead}>
            <View>
              <Text style={s.cardTitle}>{t("weather")} (DL-ATM41)</Text>
              <Text style={s.cardSub}>
                {wErr ? (lang === "fi" ? "Ei yhteyttä" : "Offline") : w ? `${t("last_synced")} ${fmtTime(w.time)}` : "…"}
              </Text>
            </View>
            <Ionicons name="pulse" size={22} color={C.text} />
          </View>

          <View style={s.tempRow}>
            <View style={s.tempIcon}><Ionicons name="thermometer" size={22} color="#fff" /></View>
            <View style={{ flex: 1 }}>
              <Text style={s.tempLabel}>{t("temperature")}</Text>
              <Text style={s.tempValue}>{w && w.air_temperature_c !== null ? `${w.air_temperature_c.toFixed(1)}°C` : "—"}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={s.tempLabel}>{lang === "fi" ? "Ilmanpaine" : "Pressure"}</Text>
              <Text style={s.feelsValue}>{show(w && w.pressure_hpa, " hPa")}</Text>
            </View>
          </View>

          <View style={s.wStatRow}>
            <WeatherStat icon="speedometer-outline" label={t("wind_speed")} value={show(w && w.wind_speed_ms, " m/s")} />
            <WeatherStat icon="water-outline" label={t("humidity")} value={show(w && (w.relative_humidity_pct !== null ? Math.round(w.relative_humidity_pct) : null), "%")} />
          </View>
        </View>

        {/* 7-day forecast — Open-Meteo */}
        <View style={[s.card, shadow]}>
          <Text style={s.cardTitle}>{t("forecast_7day")}</Text>
          {forecast === null ? (
            <ActivityIndicator style={{ marginTop: 16 }} color={C.blue} />
          ) : forecast.length === 0 ? (
            <Text style={s.cardSub}>{lang === "fi" ? "Ennustetta ei saatavilla" : "Forecast unavailable"}</Text>
          ) : (
            forecast.map((f, i) => (
              <View key={i} style={[s.fRow, i < forecast.length - 1 && s.fBorder]}>
                <Text style={s.fDay}>{f.day}</Text>
                <Ionicons name={f.icon} size={22} color={C.blue} style={{ width: 40, textAlign: "center" }} />
                <Text style={s.fLabel}>{f.label}</Text>
                <Text style={s.fHi}>{f.hi}°</Text>
                <Text style={s.fLo}>{f.lo}°</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <BottomNav active="live" onNavigate={onNavigate} />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: topPad, paddingBottom: 14, paddingHorizontal: 20, backgroundColor: "#FAFAFC" },
  brand: { fontSize: 19, fontWeight: "700", color: C.blue },
  kicker: { fontSize: 12, fontWeight: "700", color: C.muted, letterSpacing: 1 },
  h1: { fontSize: 24, fontWeight: "800", color: C.text, marginTop: 4, marginBottom: 16 },
  card: { backgroundColor: "#fff", borderRadius: 18, padding: 18, marginBottom: 16 },
  cardHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardLabel: { fontSize: 14, fontWeight: "600", color: C.body },
  cardTitle: { fontSize: 17, fontWeight: "700", color: C.text },
  cardSub: { fontSize: 12, color: C.muted, marginTop: 3 },
  // cameras
  camWrap: { borderRadius: 14, overflow: "hidden", backgroundColor: "#E5E7EB" },
  camImg: { height: 190 },
  camOverlay: { position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 12, paddingVertical: 9, backgroundColor: "rgba(17,24,39,0.55)" },
  camNameO: { color: "#fff", fontSize: 13, fontWeight: "700", flex: 1, marginRight: 8 },
  camTimeO: { color: "#E5E7EB", fontSize: 11, fontWeight: "600" },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 12 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#D1D5DB" },
  dotActive: { backgroundColor: C.blue, width: 18 },
  // water
  soonBox: { alignItems: "center", justifyContent: "center", paddingVertical: 22, gap: 8 },
  soonText: { fontSize: 13, color: C.muted, fontWeight: "600" },
  // weather
  tempRow: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "#F3F4F6", borderRadius: 14, padding: 14, marginTop: 16 },
  tempIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.blue, alignItems: "center", justifyContent: "center" },
  tempLabel: { fontSize: 12, color: C.muted },
  tempValue: { fontSize: 22, fontWeight: "800", color: C.text, marginTop: 2 },
  feelsValue: { fontSize: 16, fontWeight: "600", color: C.muted, marginTop: 2 },
  wStatRow: { flexDirection: "row", gap: 12, marginTop: 12 },
  wStat: { flex: 1, backgroundColor: "#F9FAFB", borderRadius: 14, padding: 14, gap: 4 },
  wStatLabel: { fontSize: 11, fontWeight: "600", color: C.muted, letterSpacing: 0.4, marginTop: 4 },
  wStatValue: { fontSize: 18, fontWeight: "800", color: C.text },
  // forecast
  fRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14 },
  fBorder: { borderBottomWidth: 1, borderBottomColor: C.line },
  fDay: { width: 44, fontSize: 15, fontWeight: "600", color: C.text },
  fLabel: { flex: 1, fontSize: 14, color: C.body },
  fHi: { fontSize: 15, fontWeight: "700", color: C.text, width: 36, textAlign: "right" },
  fLo: { fontSize: 15, color: C.muted, width: 40, textAlign: "right" },
});
