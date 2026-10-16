import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Image, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, COVERS, shadow, topPad } from "./theme";
import { useBlogs, normalizeBlog, paragraphs } from "./blogUtils";
import BottomNav from "./BottomNav";

function Cover({ b, index, height, children }) {
  return (
    <View style={[s.cover, { height, backgroundColor: COVERS[index % COVERS.length] }]}>
      {b.image ? (
        <Image source={{ uri: b.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <>
          <View style={s.dotBig} />
          <View style={s.dotSmall} />
          <Ionicons name="snow" size={height > 150 ? 56 : 30} color="rgba(255,255,255,0.92)" />
        </>
      )}
      {children}
    </View>
  );
}

function LangToggle({ lang, onLangChange }) {
  return (
    <View style={s.lang}>
      {["en", "fi"].map((l) => (
        <TouchableOpacity key={l} onPress={() => onLangChange(l)} style={[s.langBtn, lang === l && s.langOn]}>
          <Text style={[s.langText, lang === l && { color: "#fff" }]}>{l.toUpperCase()}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function BlogsScreen({ apiUrl, token, lang, onLangChange, onNavigate }) {
  const blogs = useBlogs(apiUrl, token, lang);
  const [q, setQ] = useState("");

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? blogs.items.filter((b) => (b.title + " " + b.summary).toLowerCase().includes(t)) : blogs.items;
  }, [blogs.items, q]);
  const [hero, ...rest] = shown;

  return (
    <View style={s.root}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => onNavigate("home")} hitSlop={10} style={s.back}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.topTitle}>Guidelines</Text>
        <LangToggle lang={lang} onLangChange={onLangChange} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18, paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
        <Text style={s.lead}>Guides and reference material on river ice, safety and how your observations are used.</Text>

        <View style={[s.search, shadow]}>
          <Ionicons name="search" size={18} color={C.muted} />
          <TextInput value={q} onChangeText={setQ} placeholder="Search guidelines" placeholderTextColor="#9CA3AF" style={s.searchInput} />
          {q ? (<TouchableOpacity onPress={() => setQ("")} hitSlop={10}><Ionicons name="close-circle" size={18} color="#9CA3AF" /></TouchableOpacity>) : null}
        </View>

        {blogs.status === "loading" && <ActivityIndicator color={C.blue} style={{ marginVertical: 40 }} />}
        {blogs.status === "error" && (
          <TouchableOpacity onPress={blogs.reload} style={s.stateBox}>
            <Ionicons name="cloud-offline-outline" size={30} color={C.muted} />
            <Text style={s.stateText}>Could not load guidelines. Check that the backend is running, then tap to try again.</Text>
          </TouchableOpacity>
        )}
        {blogs.status === "empty" && (
          <View style={s.stateBox}>
            <Ionicons name="book-outline" size={30} color={C.muted} />
            <Text style={s.stateText}>No guidelines yet. Check back soon.</Text>
          </View>
        )}
        {blogs.status === "ok" && shown.length === 0 && (
          <View style={s.stateBox}><Text style={s.stateText}>No guidelines match "{q}".</Text></View>
        )}

        {hero && (
          <TouchableOpacity style={[s.heroCard, shadow]} onPress={() => onNavigate("blog", hero)} activeOpacity={0.9}>
            <Cover b={hero} index={0} height={180}>
              <View style={s.badge}><Text style={s.badgeText}>Featured</Text></View>
            </Cover>
            <View style={{ padding: 16 }}>
              <Text style={s.heroTitle}>{hero.title}</Text>
              {hero.summary ? <Text style={s.summary} numberOfLines={3}>{hero.summary}</Text> : null}
              <View style={s.metaRow}>
                <Ionicons name="time-outline" size={14} color={C.muted} />
                <Text style={s.meta}>{hero.minutes} min read{hero.date ? "  \u2022  " + hero.date : ""}</Text>
                <View style={{ flex: 1 }} />
                <Text style={s.readMore}>Read</Text>
                <Ionicons name="chevron-forward" size={16} color={C.blue} />
              </View>
            </View>
          </TouchableOpacity>
        )}

        {rest.map((b, i) => (
          <TouchableOpacity key={String(b.id)} style={[s.row, shadow]} onPress={() => onNavigate("blog", b)} activeOpacity={0.88}>
            <Cover b={b} index={i + 1} height={86}></Cover>
            <View style={s.rowBody}>
              <Text style={s.rowTitle} numberOfLines={2}>{b.title}</Text>
              <Text style={s.meta}>{b.minutes} min read{b.date ? "  \u2022  " + b.date : ""}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <BottomNav active="none" onNavigate={onNavigate} />
    </View>
  );
}

export function BlogDetail({ apiUrl, token, lang, blog, onNavigate }) {
  const [b, setB] = useState(blog);

  useEffect(() => {
    setB(blog);
    if (blog && !blog.body && blog.id != null) {
      fetch(apiUrl + "/blogs/" + blog.id, { headers: token ? { Authorization: "Bearer " + token } : {} })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => { if (d) setB(normalizeBlog(d.blog || d.data || d, lang)); })
        .catch(() => {});
    }
  }, [blog, lang]);

  if (!b) return null;
  const paras = paragraphs(b.body);

  return (
    <View style={s.root}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => onNavigate("blogs")} hitSlop={10} style={s.back}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.topTitle}>Guideline</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <Cover b={b} index={0} height={200} />
        <View style={s.article}>
          <Text style={s.h1}>{b.title}</Text>
          <View style={s.metaRow}>
            <Ionicons name="time-outline" size={14} color={C.muted} />
            <Text style={s.meta}>{b.minutes} min read{b.date ? "  \u2022  " + b.date : ""}</Text>
          </View>
          <View style={s.rule} />
          {paras.length === 0 && <Text style={s.stateText}>This post has no text yet.</Text>}
          {paras.map((p, i) => {
            const isHeading = p.length < 70 && !/[.!?:,;]$/.test(p);
            return isHeading ? <Text key={i} style={s.h2}>{p}</Text> : <Text key={i} style={s.p}>{p}</Text>;
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: topPad, paddingBottom: 12, paddingHorizontal: 16, backgroundColor: "#FAFAFC" },
  back: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "#EEF0F5" },
  topTitle: { fontSize: 18, fontWeight: "700", color: C.blue },
  lang: { flexDirection: "row", gap: 6 },
  langBtn: { paddingHorizontal: 12, height: 32, borderRadius: 16, borderWidth: 1, borderColor: C.line, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  langOn: { backgroundColor: C.blue, borderColor: C.blue },
  langText: { fontSize: 12, fontWeight: "700", color: C.body },
  lead: { fontSize: 14, lineHeight: 21, color: C.body, marginBottom: 14 },
  search: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#fff", borderRadius: 14, paddingHorizontal: 14, height: 46, marginBottom: 18 },
  searchInput: { flex: 1, fontSize: 15, color: C.text, outlineStyle: "none" },
  cover: { alignItems: "center", justifyContent: "center", overflow: "hidden" },
  dotBig: { position: "absolute", width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(255,255,255,0.14)", right: -60, top: -80 },
  dotSmall: { position: "absolute", width: 110, height: 110, borderRadius: 55, backgroundColor: "rgba(255,255,255,0.12)", left: -30, bottom: -40 },
  badge: { position: "absolute", top: 12, left: 12, backgroundColor: "rgba(255,255,255,0.95)", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: "700", color: C.blue },
  heroCard: { backgroundColor: "#fff", borderRadius: 20, overflow: "hidden", marginBottom: 16 },
  heroTitle: { fontSize: 20, fontWeight: "700", color: C.text, lineHeight: 27, marginTop: 2 },
  summary: { fontSize: 14, lineHeight: 21, color: C.body, marginTop: 8 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12 },
  meta: { fontSize: 12, color: C.muted },
  readMore: { fontSize: 13, fontWeight: "600", color: C.blue },
  row: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 18, overflow: "hidden", marginBottom: 12 },
  rowBody: { flex: 1, padding: 14, justifyContent: "center" },
  rowTitle: { fontSize: 15, fontWeight: "700", color: C.text, lineHeight: 21, marginBottom: 6 },
  stateBox: { alignItems: "center", gap: 10, paddingVertical: 36, paddingHorizontal: 20 },
  stateText: { fontSize: 14, lineHeight: 21, color: C.muted, textAlign: "center" },
  article: { padding: 20, backgroundColor: "#fff", marginTop: -20, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  h1: { fontSize: 25, fontWeight: "800", color: C.text, lineHeight: 33 },
  rule: { height: 1, backgroundColor: C.line, marginVertical: 18 },
  h2: { fontSize: 18, fontWeight: "700", color: C.text, marginTop: 14, marginBottom: 8 },
  p: { fontSize: 16, lineHeight: 26, color: C.body, marginBottom: 14 },
});