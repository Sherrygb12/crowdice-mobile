import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { C, topPad } from "./theme";
import AuthScreen from "./AuthScreen";
import HomeScreen from "./HomeScreen";
import BlogsScreen, { BlogDetail } from "./BlogsScreen";
import SubmitScreen from "./SubmitScreen";
import ProfileScreen from "./ProfileScreen";
import ObservationsScreen from "./ObservationsScreen";
import SupportScreen from "./SupportScreen";
import MapScreen from "./MapScreen";
import LiveScreen from "./LiveScreen";
import ChangePasswordScreen from "./ChangePasswordScreen";
import EditProfileScreen from "./EditProfileScreen";
import RegionScreen from "./RegionScreen";
import AnnouncementsScreen from "./AnnouncementsScreen";
import SideMenu from "./SideMenu";
import BottomNav from "./BottomNav";
import QuestionnaireScreen from "./QuestionnaireScreen";
import AcknowledgmentsScreen from "./AcknowledgmentsScreen";
import DeleteAccountScreen from "./DeleteAccountScreen";

const API_URL = "https://appapi.crowdice.fi";
const TABS = ["home", "map", "live", "profile"];
const TITLES = { editProfile:"Edit Profile", changePassword:"Change Password", region:"Region", deleteAccount:"Delete Account", exportCsv:"Export" };

// Show notifications while the app is in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false }),
});

// Register this device for push and send the token to the backend.
// Guarded: on web or in Expo Go (no remote push) it fails quietly.
async function registerForPush(authToken) {
  try {
    if (Platform.OS === "web") return;
    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== "granted") {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    if (status !== "granted") return;
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const expoToken = tokenData && tokenData.data;
    if (!expoToken) return;
    await fetch(API_URL + "/auth/push-token", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(authToken ? { Authorization: "Bearer " + authToken } : {}) },
      body: JSON.stringify({ token: expoToken, platform: Platform.OS }),
    });
  } catch (e) { /* Expo Go / web / no credentials: ignore */ }
}

function ComingSoon({ screen, onNavigate }) {
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={s.bar}>
        <TouchableOpacity onPress={() => onNavigate("home")} style={s.back} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.barTitle}>{TITLES[screen] || "CrowdICE"}</Text>
        <View style={{ width: 38 }} />
      </View>
      <View style={s.center}>
        <Ionicons name="construct-outline" size={40} color={C.blue} />
        <Text style={s.soon}>This screen is built next.</Text>
      </View>
      {TABS.includes(screen) && <BottomNav active={screen} onNavigate={onNavigate} />}
    </View>
  );
}

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("home");
  const [param, setParam] = useState(null);
  const [lang, setLang] = useState("fi");
  const [region, setRegion] = useState("Oulu");
  const [menuOpen, setMenuOpen] = useState(false);

  const onLogin = (tok, usr) => { setToken(tok); setUser(usr); setScreen("home"); registerForPush(tok); };
  const onUserUpdate = (usr) => setUser(usr);
  const logout = () => { setMenuOpen(false); setToken(null); setUser(null); setScreen("home"); };

  const go = (target, p = null) => {
    if (target === "menu") { setMenuOpen(true); return; }
    setMenuOpen(false);
    setParam(p);
    setScreen(target);
  };

  // Not signed in - show login / register
  if (!token) {
    return (
      <View style={s.outer}>
        <View style={s.phone}><AuthScreen onLogin={onLogin} lang={lang} onLangChange={setLang} /></View>
      </View>
    );
  }

  let view;
  if (screen === "home") view = <HomeScreen apiUrl={API_URL} token={token} lang={lang} onNavigate={go} />;
  else if (screen === "blogs") view = <BlogsScreen apiUrl={API_URL} token={token} lang={lang} onLangChange={setLang} onNavigate={go} />;
  else if (screen === "blog") view = <BlogDetail apiUrl={API_URL} token={token} lang={lang} blog={param} onNavigate={go} />;
  else if (screen === "submit") view = <SubmitScreen apiUrl={API_URL} token={token} lang={lang} onClose={() => go("home")} onDone={() => go("home")} />;
  else if (screen === "profile") view = <ProfileScreen user={user} apiUrl={API_URL} token={token} lang={lang} onLangChange={setLang} onNavigate={go} onLogout={logout} />;
  else if (screen === "observations") view = <ObservationsScreen apiUrl={API_URL} token={token} lang={lang} user={user} onNavigate={go} />;
  else if (screen === "feedback") view = <SupportScreen apiUrl={API_URL} token={token} lang={lang} onNavigate={go} />;
  else if (screen === "map") view = <MapScreen lang={lang} onNavigate={go} />;
  else if (screen === "live") view = <LiveScreen lang={lang} onNavigate={go} />;
  else if (screen === "notifications") view = <AnnouncementsScreen apiUrl={API_URL} token={token} lang={lang} onNavigate={go} />;
  else if (screen === "changePassword") view = <ChangePasswordScreen apiUrl={API_URL} token={token} lang={lang} onNavigate={go} />;
  else if (screen === "editProfile") view = <EditProfileScreen apiUrl={API_URL} token={token} lang={lang} user={user} onNavigate={go} onUserUpdate={onUserUpdate} />;
  else if (screen === "region") view = <RegionScreen lang={lang} region={region} onRegionChange={setRegion} onNavigate={go} />;
  else if (screen === "questionnaire") view = <QuestionnaireScreen apiUrl={API_URL} token={token} lang={lang} onNavigate={go} />;
  else if (screen === "acknowledgments") view = <AcknowledgmentsScreen lang={lang} onNavigate={go} />;
  else if (screen === "deleteAccount") view = <DeleteAccountScreen apiUrl={API_URL} token={token} lang={lang} onNavigate={go} onLogout={logout} />;
  else view = <ComingSoon screen={screen} onNavigate={go} />;

  return (
    <View style={s.outer}>
      <View style={s.phone}>
        {view}
        {menuOpen && <SideMenu user={user} lang={lang} onNavigate={go} onLogout={logout} onClose={() => setMenuOpen(false)} />}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  outer: { flex: 1, alignItems: "center", backgroundColor: Platform.OS === "web" ? "#DDE1E8" : C.bg },
  phone: { flex: 1, width: "100%", maxWidth: 520, backgroundColor: C.bg, overflow: "hidden" },
  bar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: topPad, paddingBottom: 12, paddingHorizontal: 16, backgroundColor: "#FAFAFC" },
  back: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "#EEF0F5" },
  barTitle: { fontSize: 18, fontWeight: "700", color: C.blue },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  soon: { fontSize: 15, color: C.muted },
});
