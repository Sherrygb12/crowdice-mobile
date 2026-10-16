import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Modal, Image } from "react-native";
import { useT } from "./i18n";
import RegionPicker, { REGIONS } from "./RegionPicker";
import { Ionicons } from "@expo/vector-icons";

const API_URL = "https://appapi.crowdice.fi";

const emailValid = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export default function AuthScreen({ onLogin, lang, onLangChange }) {
  const t = useT(lang);
  const GENDERS = lang === "fi" ? ["En halua kertoa", "Nainen", "Mies", "Muu"] : ["Prefer not to say", "Female", "Male", "Other"];
  const AGE_GROUPS = ["Prefer not to say", "Under 18", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"];

  const [tab, setTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirm, setConfirm] = useState("");
  const [region, setRegion] = useState("Oulu");
  const [regionPicker, setRegionPicker] = useState(false);
  const [gender, setGender] = useState(GENDERS[0]);
  const [ageGroup, setAgeGroup] = useState(AGE_GROUPS[0]);
  const [profession, setProfession] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [regStep, setRegStep] = useState(1);

  const [fieldErr, setFieldErr] = useState({ name: "", email: "", password: "", confirm: "" });
  const setFE = (k, v) => setFieldErr((prev) => ({ ...prev, [k]: v }));

  const passwordError = (p) => {
    if (p.length < 6) return t("err_pw_short");
    if (!/[A-Z]/.test(p)) return t("err_pw_caps");
    return "";
  };

  const blurName = () => setFE("name", name.trim() ? "" : t("err_name"));
  const blurEmail = () => setFE("email", !email ? t("err_email_empty") : emailValid(email) ? "" : t("err_email_invalid"));
  const blurPassword = () => {
    setFE("password", !password ? t("err_pw_empty") : passwordError(password));
    if (confirm) setFE("confirm", confirm === password ? "" : t("err_pw_match"));
  };
  const blurConfirm = () => setFE("confirm", confirm === password ? "" : t("err_pw_match"));

  async function signIn() {
    setError(""); setLoading(true);
    try {
      const res = await fetch(API_URL + "/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Login failed");
      else { onLogin(data.token, data.user); }
    } catch (e) { setError(t("err_server")); }
    setLoading(false);
  }

  function attemptRegister() {
    setError("");
    const errs = {
      name: name.trim() ? "" : t("err_name"),
      email: !email ? t("err_email_empty") : emailValid(email) ? "" : t("err_email_invalid"),
      password: !password ? t("err_pw_empty") : passwordError(password),
      confirm: confirm === password ? "" : t("err_pw_match"),
    };
    setFieldErr(errs);
    if (errs.name || errs.email || errs.password || errs.confirm) return;
    setShowConsent(true);
  }

  function continueToStep2() {
    setError("");
    const errs = {
      name: name.trim() ? "" : t("err_name"),
      email: !email ? t("err_email_empty") : emailValid(email) ? "" : t("err_email_invalid"),
      password: !password ? t("err_pw_empty") : passwordError(password),
      confirm: confirm === password ? "" : t("err_pw_match"),
    };
    setFieldErr(errs);
    if (errs.name || errs.email || errs.password || errs.confirm) return;
    setRegStep(2);
  }

  const skipAndRegister = () => { setGender(GENDERS[0]); setAgeGroup(AGE_GROUPS[0]); setProfession(""); attemptRegister(); };

  async function acceptAndRegister() {
    setShowConsent(false); setLoading(true);
    try {
      const res = await fetch(API_URL + "/auth/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username: name, password, gender, ageGroup, profession, region, consent: true, consentAt: new Date().toISOString() }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Registration failed");
      else {
        const loginRes = await fetch(API_URL + "/auth/login", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const loginData = await loginRes.json();
        onLogin(loginData.token, loginData.user);
      }
    } catch (e) { setError(t("err_server")); }
    setLoading(false);
  }

  const switchTab = (tb) => { setTab(tb); setError(""); setRegStep(1); setFieldErr({ name: "", email: "", password: "", confirm: "" }); };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.authScroll}>
        <View style={styles.topRow}>
          <View style={styles.logoRow}>
            <Image source={require("./assets/crowdice-logo.png")} style={styles.logoImg} resizeMode="contain" />
            <Text style={styles.logoText}>CrowdICE</Text>
          </View>
          <View style={styles.langGroup}>
            {["en", "fi"].map((l) => (
              <TouchableOpacity key={l} onPress={() => onLangChange(l)} style={[styles.langBtn, lang === l && styles.langOn]}>
                <Text style={[styles.langText, lang === l && { color: "#fff" }]}>{l.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, tab === "signin" && styles.tabActive]} onPress={() => switchTab("signin")}>
            <Text style={[styles.tabText, tab === "signin" && styles.tabTextActive]}>{t("sign_in")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, tab === "register" && styles.tabActive]} onPress={() => switchTab("register")}>
            <Text style={[styles.tabText, tab === "register" && styles.tabTextActive]}>{t("create_account")}</Text>
          </TouchableOpacity>
        </View>

        {tab === "signin" ? (
          <>
            <Text style={styles.heading}>{t("welcome_back")}</Text>
            <Text style={styles.subheading}>{t("signin_sub")}</Text>
            <View style={styles.card}>
              <Text style={styles.label}>{t("email_address")}</Text>
              <TextInput style={styles.input} placeholder="email@example.com" placeholderTextColor="#9aa5b1"
                value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
              <Text style={styles.label}>{t("password")}</Text>
              <TextInput style={styles.input} placeholder={t("password")} placeholderTextColor="#9aa5b1"
                value={password} onChangeText={setPassword} secureTextEntry />
              <Text style={styles.forgot}>{t("forgot_password")}</Text>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <TouchableOpacity style={styles.primaryBtn} onPress={signIn} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>{t("sign_in")}</Text>}
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.heading}>{t("join_mission")}</Text>
            <Text style={styles.subheading}>{t("register_sub")}</Text>
            <View style={styles.card}>
              {regStep === 1 && (
              <>
              <Text style={styles.label}>{t("full_name")}</Text>
              <TextInput style={[styles.input, fieldErr.name && styles.inputErr]} placeholder={t("your_name")} placeholderTextColor="#9aa5b1"
                value={name} onChangeText={setName} onBlur={blurName} />
              {fieldErr.name ? <Text style={styles.fieldError}>{fieldErr.name}</Text> : null}

              <Text style={styles.label}>{t("email_address")}</Text>
              <TextInput style={[styles.input, fieldErr.email && styles.inputErr]} placeholder="email@example.com" placeholderTextColor="#9aa5b1"
                value={email} onChangeText={setEmail} onBlur={blurEmail} autoCapitalize="none" keyboardType="email-address" />
              {fieldErr.email ? <Text style={styles.fieldError}>{fieldErr.email}</Text> : null}

              <Text style={styles.label}>{t("password")}</Text>
              <TextInput style={[styles.input, fieldErr.password && styles.inputErr]} placeholder={t("password")} placeholderTextColor="#9aa5b1"
                value={password} onChangeText={setPassword} onBlur={blurPassword} secureTextEntry />
              {fieldErr.password ? <Text style={styles.fieldError}>{fieldErr.password}</Text> : <Text style={styles.hint}>{t("pw_hint")}</Text>}

              <Text style={styles.label}>{t("confirm")}</Text>
              <TextInput style={[styles.input, fieldErr.confirm && styles.inputErr]} placeholder={t("confirm_password")} placeholderTextColor="#9aa5b1"
                value={confirm} onChangeText={setConfirm} onBlur={blurConfirm} secureTextEntry />
              {fieldErr.confirm ? <Text style={styles.fieldError}>{fieldErr.confirm}</Text> : null}

              <TouchableOpacity style={styles.primaryBtn} onPress={continueToStep2} disabled={loading}>
                <Text style={styles.primaryBtnText}>{t("continue")}</Text>
              </TouchableOpacity>
              </>
              )}

              {regStep === 2 && (
              <>
              <Text style={styles.label}>{t("region")}</Text>
              <TouchableOpacity style={styles.regionBtn} onPress={() => setRegionPicker(true)} activeOpacity={0.8}>
                <Ionicons name="location-outline" size={18} color="#718096" />
                <Text style={styles.regionText}>{region}</Text>
                <Ionicons name="chevron-down" size={18} color="#718096" />
              </TouchableOpacity>

              <View style={styles.optionalHeader}>
                <Text style={styles.optionalTitle}>{t("optional_research")}</Text>
                <Text style={styles.optionalSub}>{t("optional_skip")}</Text>
              </View>

              <Text style={styles.label}>{t("gender")}</Text>
              <View style={styles.chipRow}>
                {GENDERS.map((g) => (
                  <TouchableOpacity key={g} style={[styles.chip, gender === g && styles.chipActive]} onPress={() => setGender(g)}>
                    <Text style={[styles.chipText, gender === g && styles.chipTextActive]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>{t("age_group")}</Text>
              <View style={styles.chipRow}>
                {AGE_GROUPS.map((a) => (
                  <TouchableOpacity key={a} style={[styles.chip, ageGroup === a && styles.chipActive]} onPress={() => setAgeGroup(a)}>
                    <Text style={[styles.chipText, ageGroup === a && styles.chipTextActive]}>{a}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>{t("profession")}</Text>
              <TextInput style={styles.input} placeholder={t("profession_ph")} placeholderTextColor="#9aa5b1" value={profession} onChangeText={setProfession} />

              {error ? <Text style={styles.error}>{error}</Text> : null}
              <TouchableOpacity style={styles.primaryBtn} onPress={attemptRegister} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>{t("create_account")}</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.skipBtn} onPress={skipAndRegister} disabled={loading}>
                <Text style={styles.skipText}>{lang === "fi" ? "Ohita" : "Skip for now"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.backLink} onPress={() => setRegStep(1)}>
                <Ionicons name="arrow-back" size={16} color="#718096" />
                <Text style={styles.backLinkText}>{t("back")}</Text>
              </TouchableOpacity>
              </>
              )}
            </View>
          </>
        )}

        <Text style={styles.footer}>© 2026 DevelopNators Initiative</Text>
      </ScrollView>

      <RegionPicker visible={regionPicker} value={region} lang={lang} onSelect={setRegion} onClose={() => setRegionPicker(false)} />

      <Modal visible={showConsent} transparent animationType="slide" onRequestClose={() => setShowConsent(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}><Ionicons name="shield-checkmark" size={26} color={BLUE} /></View>
            <Text style={styles.modalTitle}>{t("consent_title")}</Text>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalP}>{lang === "fi" ? "CrowdICE on Oulun yliopiston HEM-ryhman kansalaistieteen hanke, joka seuraa Kiiminkijoen jaatilannetta." : "CrowdICE is a citizen-science project by the University of Oulu HEM group, monitoring river ice on the Kiiminkijoki."}</Text>
              <Text style={styles.modalH}>{lang === "fi" ? "Mita keraamme" : "What we collect"}</Text>
              <Text style={styles.modalP}>{lang === "fi" ? "Tilitietosi (nimi ja sahkoposti) ja havaintosi (kuvat, sijainti, jaatiedot) seka mahdolliset valinnaiset taustatiedot." : "Your account details (name, email) and your observations (photos, location, ice details), plus any optional background info you give."}</Text>
              <Text style={styles.modalH}>{lang === "fi" ? "Miksi" : "Why"}</Text>
              <Text style={styles.modalP}>{lang === "fi" ? "Tietoja kaytetaan vain tahan jokijaan tutkimukseen. Niita ei myyda eika jaeta mainontaan." : "Your data is used only for this river-ice research. It is never sold or shared for advertising."}</Text>
              <Text style={styles.modalH}>{lang === "fi" ? "Oikeutesi" : "Your rights"}</Text>
              <Text style={styles.modalP}>{lang === "fi" ? "GDPR:n mukaisesti voit milloin tahansa tarkastella, korjata, vieda tai poistaa tietosi." : "Under the GDPR you may access, correct, export, or delete your data at any time."}</Text>
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.declineBtn} onPress={() => setShowConsent(false)}>
                <Text style={styles.declineText}>{t("decline")}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptBtn} onPress={acceptAndRegister}>
                <Text style={styles.primaryBtnText}>{t("accept_continue")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const BLUE = "#1877f2";
const styles = StyleSheet.create({
  logoImg: { width: 40, height: 40, borderRadius: 10, marginRight: 8 },
  skipBtn: { alignItems: "center", paddingVertical: 12, marginTop: 4 },
  skipText: { color: "#718096", fontSize: 14, fontWeight: "600" },
  backLink: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 6 },
  backLinkText: { color: "#718096", fontSize: 14, fontWeight: "600" },
  screen: { flex: 1, backgroundColor: "#f1f2f6" },
  authScroll: { padding: 20, paddingTop: 50 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  logoRow: { flexDirection: "row", alignItems: "center" },
  logoBox: { width: 36, height: 36, borderRadius: 9, backgroundColor: BLUE, alignItems: "center", justifyContent: "center", marginRight: 8 },
  logoIcon: { color: "#fff", fontSize: 20 },
  logoText: { fontSize: 22, fontWeight: "700", color: BLUE },
  langGroup: { flexDirection: "row", gap: 6 },
  langBtn: { paddingHorizontal: 12, height: 32, borderRadius: 16, borderWidth: 1, borderColor: "#e2e8f0", alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  langOn: { backgroundColor: BLUE, borderColor: BLUE },
  langText: { fontSize: 12, fontWeight: "700", color: "#4a5568" },
  tabs: { flexDirection: "row", marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 24 },
  tabActive: { backgroundColor: BLUE },
  tabText: { fontSize: 15, color: "#4a5568", fontWeight: "600" },
  tabTextActive: { color: "#fff" },
  heading: { fontSize: 30, fontWeight: "800", color: "#1a202c" },
  subheading: { fontSize: 15, color: "#718096", marginTop: 4, marginBottom: 18 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 20 },
  label: { fontSize: 13, fontWeight: "600", color: "#2d3748", marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: "#f1f2f6", borderRadius: 10, padding: 14, fontSize: 15, color: "#1a202c", justifyContent: "center", borderWidth: 1.5, borderColor: "transparent" },
  inputErr: { borderColor: "#e53e3e", backgroundColor: "#fff5f5" },
  fieldError: { color: "#c62828", fontSize: 12, marginTop: 5 },
  hint: { color: "#a0aec0", fontSize: 12, marginTop: 5 },
  regionBtn: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#f1f2f6", borderRadius: 10, padding: 14 },
  regionText: { flex: 1, fontSize: 15, color: "#1a202c" },
  forgot: { color: BLUE, textAlign: "center", marginTop: 16, fontSize: 14, fontWeight: "500" },
  primaryBtn: { backgroundColor: BLUE, borderRadius: 10, padding: 16, alignItems: "center", marginTop: 16 },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  optionalHeader: { marginTop: 20, marginBottom: 4, borderTopWidth: 1, borderTopColor: "#edf0f4", paddingTop: 16 },
  optionalTitle: { fontSize: 14, fontWeight: "700", color: "#2d3748" },
  optionalSub: { fontSize: 12, color: "#a0aec0", marginTop: 2 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  chip: { backgroundColor: "#f1f2f6", borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14, marginRight: 8, marginBottom: 8 },
  chipActive: { backgroundColor: BLUE },
  chipText: { fontSize: 13, color: "#4a5568" },
  chipTextActive: { color: "#fff", fontWeight: "600" },
  error: { color: "#c62828", marginTop: 12, textAlign: "center" },
  footer: { textAlign: "center", color: "#a0aec0", fontSize: 12, marginTop: 20 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalCard: { backgroundColor: "#fff", borderRadius: 20, padding: 24, maxHeight: "82%", width: "100%", maxWidth: 420 },
  modalTitle: { fontSize: 20, fontWeight: "800", color: "#1a202c", marginBottom: 14, textAlign: "center" },
  modalIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#EAF1FE", alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 12 },
  modalH: { fontSize: 13, fontWeight: "700", color: "#2d3748", marginTop: 12, marginBottom: 4 },
  modalBody: { marginBottom: 16 },
  modalPlaceholder: { fontSize: 12, color: "#c05621", backgroundColor: "#fffaf0", padding: 8, borderRadius: 6, marginBottom: 12, fontStyle: "italic" },
  modalP: { fontSize: 13, color: "#4a5568", lineHeight: 19, marginBottom: 8 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  declineBtn: { flex: 1, backgroundColor: "#edf0f4", borderRadius: 10, padding: 14, alignItems: "center", marginRight: 8 },
  declineText: { color: "#4a5568", fontSize: 16, fontWeight: "600" },
  acceptBtn: { flex: 2, backgroundColor: BLUE, borderRadius: 10, padding: 14, alignItems: "center", marginLeft: 8 },
});
