import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Alert, Platform, TextInput, ActivityIndicator, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { C, shadow, topPad } from "./theme";
import { useT } from "./i18n";

const SV = {
  en: {
    research: "Research questions (optional)",
    research_sub: "Help the study. Answer any you like, or skip.",
    mode_q: "Is this photo of current conditions or a past winter?",
    current: "Current", historical: "Past winter",
    condition_q: "How would you describe the river right now?",
    partly: "Partially frozen", fully: "Completely frozen", noice: "No ice",
    leaves_q: "When do you expect the ice to leave this spring?",
    leaves_ph: "e.g. late April",
    uses_q: "What do you use the river ice for? (choose any)",
    use_ski: "Skiing", use_snow: "Snowmobiling", use_fish: "Fishing", use_skate: "Skating", use_cycle: "Cycling", use_road: "Ice road", use_other: "Something else", use_none: "Nowhere",
    flood_q: "How do ice-jam floods affect your life today? (choose any)",
    fl_adapt: "Adaptation measures", fl_struct: "Structural damage", fl_env: "Environmental damage", fl_none: "No effect", fl_other: "Something else",
    advice_q: "Advice for younger generations about river ice?",
    ad_caution: "A cautionary tale", ad_danger: "Spotting dangerous ice", ad_thick: "Checking ice thickness", ad_other: "Something else", ad_none: "Nothing",
  },
  fi: {
    research: "Tutkimuskysymykset (valinnainen)",
    research_sub: "Auta tutkimusta. Vastaa haluamiisi tai ohita.",
    mode_q: "Onko kuva nykytilanteesta vai menneesta talvesta?",
    current: "Nykytilanne", historical: "Mennyt talvi",
    condition_q: "Miten kuvailisit jokea juuri nyt?",
    partly: "Osittain jaassa", fully: "Kokonaan jaassa", noice: "Ei jaata",
    leaves_q: "Milloin arvioit jaiden lahtevan tana kevaana?",
    leaves_ph: "esim. huhtikuun loppu",
    uses_q: "Mihin kaytat jokijaata? (valitse useita)",
    use_ski: "Hiihto", use_snow: "Moottorikelkkailu", use_fish: "Kalastus", use_skate: "Luistelu", use_cycle: "Pyoraily", use_road: "Jaatie", use_other: "Jokin muu", use_none: "En mihinkaan",
    flood_q: "Miten jaapatotulvat vaikuttavat elamaasi nyt? (valitse useita)",
    fl_adapt: "Sopeutumistoimet", fl_struct: "Rakenteelliset vauriot", fl_env: "Ymparistovahingot", fl_none: "Ei vaikutusta", fl_other: "Jokin muu",
    advice_q: "Neuvo nuoremmille sukupolville jokijaasta?",
    ad_caution: "Varoittava tarina", ad_danger: "Vaarallisen jaan tunnistus", ad_thick: "Jaan paksuuden tarkistus", ad_other: "Jokin muu", ad_none: "Ei mitaan",
  },
};

const ICE_TYPES = ["sheet_ice", "ice_fragments", "open_water", "skim_ice", "border_ice", "frazil_ice", "pancake_ice", "unknown"];
const ICE_ICON = { sheet_ice: "layers", ice_fragments: "snow", open_water: "water", skim_ice: "remove", border_ice: "git-branch", frazil_ice: "sparkles", pancake_ice: "ellipse", unknown: "help-circle" };

function Progress({ step, labels }) {
  const icons = ["camera", "location", "create-outline", "cloud-upload"];
  return (
    <View style={s.progress}>
      <View style={s.progressLine} />
      {labels.map((lbl, i) => (
        <View key={i} style={s.pStep}>
          <View style={[s.pDot, i <= step && s.pDotOn]}>
            <Ionicons name={icons[i]} size={16} color={i <= step ? "#fff" : "#6B7280"} />
          </View>
          <Text style={[s.pLabel, i === step && { color: C.blue, fontWeight: "700" }]}>{lbl}</Text>
        </View>
      ))}
    </View>
  );
}

// Renders the ice-types guide text: a short line with no ending punctuation is a bold
// heading, everything else is a normal line.
function GuideBody({ text }) {
  const lines = (text || "").split("\n").map((l) => l.trim()).filter(Boolean);
  return (
    <>
      {lines.map((line, i) => {
        const heading = line.length < 70 && !/[.!?:,;]$/.test(line);
        return <Text key={i} style={heading ? s.gH : s.gP}>{line}</Text>;
      })}
    </>
  );
}

export default function SubmitScreen({ apiUrl = "https://appapi.crowdice.fi", token, lang, onClose, onDone }) {
  const t = useT(lang);
  const STEP_LABELS = [t("step_photo"), t("step_location"), t("step_details"), t("step_submit")];
  const [step, setStep] = useState(0);
  const [photo, setPhoto] = useState(null);
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [manualLoc, setManualLoc] = useState("");
  const [river, setRiver] = useState("Kiiminkijoki");
  const [iceType, setIceType] = useState(null);
  const [notes, setNotes] = useState("");
  const [sending, setSending] = useState(false);
  const sv = SV[lang === "fi" ? "fi" : "en"];
  const [mode, setMode] = useState("current");
  const [condition, setCondition] = useState(null);
  const [iceLeaves, setIceLeaves] = useState("");
  const [uses, setUses] = useState([]);
  const [floodImpact, setFloodImpact] = useState([]);
  const [advice, setAdvice] = useState(null);
  const toggleIn = (arr, setArr, v) => setArr(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  // Ice types guide (shown in a popup so it does not interrupt the submission).
  const [guide, setGuide] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  useEffect(() => {
    fetch(apiUrl + "/blogs/ice-types-guide")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setGuide(d.blog || d); })
      .catch(() => {});
  }, []);
  const guideTitle = lang === "fi" ? (guide && guide.title_fi) || "Jäätyypit" : (guide && guide.title_en) || "Ice types";
  const guideText = lang === "fi" ? (guide && guide.content_fi) : (guide && guide.content_en);

  // Load an image result into state as a data URL (base64) so it posts like the web path.
  const useResult = (res) => {
    if (!res || res.canceled) return;
    const a = (res.assets && res.assets[0]) || null;
    if (!a) return;
    setPhoto(a.base64 ? `data:image/jpeg;base64,${a.base64}` : a.uri);
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { Alert.alert(t("permission_needed") || "Permission needed", t("camera_permission") || "Please allow camera access to take a photo."); return; }
    useResult(await ImagePicker.launchCameraAsync({ quality: 0.6, base64: true }));
  };

  const chooseFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert(t("permission_needed") || "Permission needed", t("photos_permission") || "Please allow photo access to choose a picture."); return; }
    useResult(await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.6, base64: true }));
  };

  const pickPhoto = () => {
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setPhoto(reader.result);
        reader.readAsDataURL(file);
      };
      input.click();
      return;
    }
    // Native: let the user choose camera or gallery.
    Alert.alert(
      lang === "fi" ? "Lisää kuva" : "Add a photo",
      lang === "fi" ? "Ota uusi kuva tai valitse galleriasta." : "Take a new photo or choose one from your gallery.",
      [
        { text: lang === "fi" ? "Kamera" : "Camera", onPress: takePhoto },
        { text: lang === "fi" ? "Galleria" : "Gallery", onPress: chooseFromGallery },
        { text: lang === "fi" ? "Peruuta" : "Cancel", style: "cancel" },
      ]
    );
  };

  const getLocation = async () => {
    setLocating(true);
    try {
      if (Platform.OS === "web") {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocating(false); },
            () => { setLocating(false); },
            { enableHighAccuracy: true, timeout: 10000 }
          );
        } else { setLocating(false); }
        return;
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocating(false);
        Alert.alert(t("permission_needed") || "Permission needed", t("location_permission") || "Please allow location access to tag your observation.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setLocating(false);
    } catch (e) {
      setLocating(false);
    }
  };

  const submit = async () => {
    setSending(true);
    try {
      const survey_data = JSON.stringify({ mode, condition, ice_leaves: iceLeaves, uses, flood_impact: floodImpact, advice });
      const body = { ice_type: iceType, notes, latitude: coords?.lat ?? null, longitude: coords?.lng ?? null, river_name: river, photo_data: photo, survey_data, is_historical: mode === "historical" ? 1 : 0 };
      const res = await fetch(apiUrl + "/observations", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) },
        body: JSON.stringify(body),
      });
      if (res.ok) { setSending(false); setStep(4); }
      else { setSending(false); Alert.alert("Error", t("could_not_send")); }
    } catch (e) { setSending(false); Alert.alert("Error", t("err_server")); }
  };

  const canContinue =
    (step === 0 && !!photo) ||
    (step === 1 && (!!coords || manualLoc.trim().length > 0)) ||
    (step === 2 && !!iceType) ||
    step === 3;

  const next = () => { if (step === 3) { submit(); return; } setStep((n) => Math.min(n + 1, 3)); };
  const back = () => (step === 0 ? onClose() : setStep((n) => n - 1));

  if (step === 4) {
    return (
      <View style={[s.root, { alignItems: "center", justifyContent: "center", padding: 30 }]}>
        <View style={s.successCircle}><Ionicons name="checkmark" size={48} color="#fff" /></View>
        <Text style={s.successTitle}>{t("observation_submitted")}</Text>
        <Text style={s.successSub}>{t("thanks_submit")}</Text>
        <TouchableOpacity style={s.doneBtn} onPress={() => (onDone ? onDone() : onClose())}>
          <Text style={s.doneText}>{t("back_home")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={back} hitSlop={10} style={s.iconBtn}>
          <Ionicons name={step === 0 ? "close" : "arrow-back"} size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.title}>{t("new_observation")}</Text>
        <View style={{ width: 38 }} />
      </View>

      <Progress step={step} labels={STEP_LABELS} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 130 }}>
        {step === 0 && (
          <>
            <Text style={s.h}>{t("align_ice")}</Text>
            <View style={[s.card, shadow]}>
              {photo ? (
                <View>
                  <Image source={{ uri: photo }} style={s.preview} resizeMode="cover" />
                  <TouchableOpacity style={s.retake} onPress={pickPhoto}>
                    <Ionicons name="refresh" size={16} color={C.blue} />
                    <Text style={s.linkText}>{t("choose_another")}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={s.capture} onPress={pickPhoto} activeOpacity={0.88}>
                  <View style={s.camCircle}><Ionicons name="camera" size={30} color="#fff" /></View>
                  <Text style={s.captureText}>{t("capture_photo")}</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={s.tip}>
              <View style={s.tipHead}><Ionicons name="bulb-outline" size={18} color={C.amber} /><Text style={s.tipTitle}>{t("photo_tip")}</Text></View>
              <Text style={s.tipBody}>{t("photo_tip_body")}</Text>
            </View>
          </>
        )}

        {step === 1 && (
          <>
            <Text style={s.h}>{t("where_taken")}</Text>
            <TouchableOpacity style={[s.locBtn, shadow]} onPress={getLocation} activeOpacity={0.88}>
              {locating ? <ActivityIndicator color={C.blue} /> : <Ionicons name="navigate" size={22} color={C.blue} />}
              <Text style={s.locBtnText}>{locating ? t("getting_location") : t("use_location")}</Text>
            </TouchableOpacity>
            {coords && (
              <View style={s.coordsBox}>
                <Ionicons name="checkmark-circle" size={18} color={C.green} />
                <Text style={s.coordsText}>{t("location_set")}: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</Text>
              </View>
            )}
            <Text style={s.label}>{t("river_name")}</Text>
            <View style={[s.input, shadow]}>
              <Ionicons name="water-outline" size={18} color={C.muted} />
              <TextInput value={river} onChangeText={setRiver} placeholder="Kiiminkijoki" placeholderTextColor="#9CA3AF" style={s.inputText} />
            </View>
            <Text style={s.label}>{t("describe_location")}</Text>
            <View style={[s.input, shadow]}>
              <Ionicons name="pin-outline" size={18} color={C.muted} />
              <TextInput value={manualLoc} onChangeText={setManualLoc} placeholder="..." placeholderTextColor="#9CA3AF" style={s.inputText} />
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={s.h}>{t("what_see")}</Text>
            <TouchableOpacity style={s.helpLink} onPress={() => setShowGuide(true)} activeOpacity={0.7}>
              <Ionicons name="help-circle-outline" size={17} color={C.blue} />
              <Text style={s.helpLinkText}>{lang === "fi" ? "Etko ole varma tyypista? Katso opas" : "Not sure which type? See the guide"}</Text>
            </TouchableOpacity>
            <Text style={s.label}>{t("ice_condition")}</Text>
            <View style={s.iceGrid}>
              {ICE_TYPES.map((id) => (
                <TouchableOpacity key={id} style={[s.iceChip, iceType === id && s.iceChipOn]} onPress={() => setIceType(id)} activeOpacity={0.85}>
                  <Ionicons name={ICE_ICON[id]} size={20} color={iceType === id ? "#fff" : C.blue} />
                  <Text style={[s.iceChipText, iceType === id && { color: "#fff" }]}>{t(id)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={s.label}>{t("notes_optional")}</Text>
            <View style={[s.input, s.inputTall, shadow]}>
              <TextInput value={notes} onChangeText={setNotes} placeholder={t("notes_ph")} placeholderTextColor="#9CA3AF" multiline numberOfLines={4} style={[s.inputText, { height: 100, textAlignVertical: "top" }]} />
            </View>

            <View style={{ height: 1, backgroundColor: C.line, marginTop: 26, marginBottom: 2 }} />
            <Text style={[s.label, { fontSize: 15 }]}>{sv.research}</Text>
            <Text style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{sv.research_sub}</Text>

            <Text style={s.label}>{sv.mode_q}</Text>
            <View style={s.iceGrid}>
              {[["current", sv.current], ["historical", sv.historical]].map(([v, lbl]) => (
                <TouchableOpacity key={v} style={[s.iceChip, mode === v && s.iceChipOn]} onPress={() => setMode(v)} activeOpacity={0.85}>
                  <Text style={[s.iceChipText, mode === v && { color: "#fff" }]}>{lbl}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.label}>{sv.condition_q}</Text>
            <View style={s.iceGrid}>
              {[["partly", sv.partly], ["fully", sv.fully], ["noice", sv.noice]].map(([v, lbl]) => (
                <TouchableOpacity key={v} style={[s.iceChip, condition === v && s.iceChipOn]} onPress={() => setCondition(v)} activeOpacity={0.85}>
                  <Text style={[s.iceChipText, condition === v && { color: "#fff" }]}>{lbl}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.label}>{sv.leaves_q}</Text>
            <View style={[s.input, shadow]}>
              <Ionicons name="calendar-outline" size={18} color={C.muted} />
              <TextInput value={iceLeaves} onChangeText={setIceLeaves} placeholder={sv.leaves_ph} placeholderTextColor="#9CA3AF" style={s.inputText} />
            </View>

            <Text style={s.label}>{sv.uses_q}</Text>
            <View style={s.iceGrid}>
              {[["ski", sv.use_ski], ["snow", sv.use_snow], ["fish", sv.use_fish], ["skate", sv.use_skate], ["cycle", sv.use_cycle], ["road", sv.use_road], ["other", sv.use_other], ["none", sv.use_none]].map(([v, lbl]) => (
                <TouchableOpacity key={v} style={[s.iceChip, uses.includes(v) && s.iceChipOn]} onPress={() => toggleIn(uses, setUses, v)} activeOpacity={0.85}>
                  <Text style={[s.iceChipText, uses.includes(v) && { color: "#fff" }]}>{lbl}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.label}>{sv.flood_q}</Text>
            <View style={s.iceGrid}>
              {[["adapt", sv.fl_adapt], ["struct", sv.fl_struct], ["env", sv.fl_env], ["none", sv.fl_none], ["other", sv.fl_other]].map(([v, lbl]) => (
                <TouchableOpacity key={v} style={[s.iceChip, floodImpact.includes(v) && s.iceChipOn]} onPress={() => toggleIn(floodImpact, setFloodImpact, v)} activeOpacity={0.85}>
                  <Text style={[s.iceChipText, floodImpact.includes(v) && { color: "#fff" }]}>{lbl}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.label}>{sv.advice_q}</Text>
            <View style={s.iceGrid}>
              {[["caution", sv.ad_caution], ["danger", sv.ad_danger], ["thick", sv.ad_thick], ["other", sv.ad_other], ["none", sv.ad_none]].map(([v, lbl]) => (
                <TouchableOpacity key={v} style={[s.iceChip, advice === v && s.iceChipOn]} onPress={() => setAdvice(v)} activeOpacity={0.85}>
                  <Text style={[s.iceChipText, advice === v && { color: "#fff" }]}>{lbl}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <Text style={s.h}>{t("review_submit")}</Text>
            <View style={[s.card, shadow, { padding: 16 }]}>
              {photo && <Image source={{ uri: photo }} style={s.reviewImg} resizeMode="cover" />}
              <ReviewRow icon="layers" label={t("ice_condition")} value={iceType ? t(iceType) : "-"} />
              <ReviewRow icon="water-outline" label={t("river_name")} value={river || "-"} />
              <ReviewRow icon="location-outline" label={t("step_location")} value={coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : (manualLoc || "-")} />
              {notes ? <ReviewRow icon="document-text-outline" label={t("message")} value={notes} /> : null}
            </View>
          </>
        )}
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity style={[s.cont, !canContinue && s.contOff]} disabled={!canContinue || sending} onPress={next} activeOpacity={0.88}>
          {sending ? <ActivityIndicator color="#fff" /> : (
            <>
              <Text style={s.contText}>{step === 3 ? t("submit_observation") : t("continue")}</Text>
              <Ionicons name={step === 3 ? "cloud-upload" : "chevron-forward"} size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>

      <Modal visible={showGuide} animationType="slide" transparent onRequestClose={() => setShowGuide(false)}>
        <View style={s.guideBackdrop}>
          <View style={s.guideCard}>
            <View style={s.guideHead}>
              <Text style={s.guideTitle}>{guideTitle}</Text>
              <TouchableOpacity onPress={() => setShowGuide(false)} hitSlop={12}>
                <Ionicons name="close" size={24} color={C.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 460 }} contentContainerStyle={{ paddingBottom: 8 }} showsVerticalScrollIndicator={false}>
              {guideText ? <GuideBody text={guideText} /> : <ActivityIndicator color={C.blue} style={{ marginTop: 20 }} />}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ReviewRow({ icon, label, value }) {
  return (
    <View style={s.reviewRow}>
      <Ionicons name={icon} size={18} color={C.muted} />
      <Text style={s.reviewLabel}>{label}</Text>
      <Text style={s.reviewValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: topPad, paddingBottom: 10, paddingHorizontal: 16, backgroundColor: "#FAFAFC" },
  iconBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "#EEF0F5" },
  title: { fontSize: 17, fontWeight: "700", color: C.text },
  progress: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 16, paddingBottom: 6, backgroundColor: "#FAFAFC" },
  progressLine: { position: "absolute", left: 48, right: 48, top: 32, height: 2, backgroundColor: "#D1D5DB" },
  pStep: { alignItems: "center", width: 70 },
  pDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#E5E7EB", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#D1D5DB" },
  pDotOn: { backgroundColor: C.blue, borderColor: C.blue },
  pLabel: { fontSize: 11, color: C.muted, marginTop: 5, textAlign: "center" },
  h: { fontSize: 18, fontWeight: "600", color: C.text, textAlign: "center", marginVertical: 16 },
  card: { backgroundColor: "#fff", borderRadius: 18, padding: 14 },
  capture: { height: 190, borderRadius: 14, backgroundColor: C.blue, alignItems: "center", justifyContent: "center" },
  camCircle: { width: 58, height: 58, borderRadius: 29, backgroundColor: "rgba(255,255,255,0.28)", alignItems: "center", justifyContent: "center" },
  captureText: { color: "#fff", fontWeight: "700", fontSize: 15, marginTop: 12 },
  linkText: { color: C.blue, fontWeight: "600", fontSize: 14 },
  preview: { width: "100%", height: 280, borderRadius: 14, backgroundColor: "#E5E7EB" },
  retake: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingTop: 14, paddingBottom: 4 },
  tip: { marginTop: 16, backgroundColor: "#fff", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.line },
  tipHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  tipTitle: { fontSize: 14, fontWeight: "600", color: C.text },
  tipBody: { fontSize: 14, lineHeight: 21, color: C.body },
  locBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "#fff", borderRadius: 14, height: 54, borderWidth: 1.5, borderColor: C.blue },
  locBtnText: { fontSize: 15, fontWeight: "700", color: C.blue },
  coordsBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#D1FAE5", borderRadius: 12, padding: 12, marginTop: 12 },
  coordsText: { fontSize: 13, color: "#065F46", fontWeight: "600" },
  label: { fontSize: 13, fontWeight: "600", color: C.text, marginTop: 20, marginBottom: 8 },
  helpLink: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: -6, marginBottom: 2 },
  helpLinkText: { fontSize: 14, fontWeight: "600", color: C.blue },
  input: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  inputTall: { alignItems: "flex-start", paddingTop: 12 },
  inputText: { flex: 1, fontSize: 15, color: C.text, outlineStyle: "none" },
  iceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  iceChip: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1.5, borderColor: C.line, width: "47%" },
  iceChipOn: { backgroundColor: C.blue, borderColor: C.blue },
  iceChipText: { fontSize: 13, fontWeight: "600", color: C.text },
  reviewImg: { width: "100%", height: 160, borderRadius: 12, marginBottom: 14, backgroundColor: "#E5E7EB" },
  reviewRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 11, borderTopWidth: 1, borderTopColor: C.line },
  reviewLabel: { fontSize: 13, color: C.muted, width: 110 },
  reviewValue: { flex: 1, fontSize: 14, fontWeight: "600", color: C.text },
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: "#FAFAFC", borderTopWidth: 1, borderTopColor: C.line },
  cont: { flexDirection: "row", gap: 6, height: 50, borderRadius: 14, backgroundColor: C.blue, alignItems: "center", justifyContent: "center" },
  contOff: { opacity: 0.45 },
  contText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  successCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: C.green, alignItems: "center", justifyContent: "center" },
  successTitle: { fontSize: 24, fontWeight: "800", color: C.text, marginTop: 24, textAlign: "center" },
  successSub: { fontSize: 15, lineHeight: 22, color: C.muted, textAlign: "center", marginTop: 10 },
  doneBtn: { backgroundColor: C.blue, borderRadius: 14, paddingHorizontal: 32, height: 50, alignItems: "center", justifyContent: "center", marginTop: 30 },
  doneText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  guideBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  guideCard: { backgroundColor: "#fff", borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, paddingBottom: 28 },
  guideHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  guideTitle: { fontSize: 20, fontWeight: "800", color: C.text },
  gH: { fontSize: 16, fontWeight: "700", color: C.text, marginTop: 14, marginBottom: 3 },
  gP: { fontSize: 15, lineHeight: 22, color: C.body },
});
