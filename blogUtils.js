import { useEffect, useState } from "react";

const ENT = { "&nbsp;": " ", "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" };

export const stripHtml = (s) =>
  String(s || "")
    .replace(/<\/(p|div|h[1-6]|li)>|<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/g, (m) => ENT[m]);

export const paragraphs = (s) =>
  stripHtml(s).split(/\n+/).map((t) => t.trim()).filter(Boolean);

const snippet = (txt, n) => {
  const clean = stripHtml(txt).replace(/\s+/g, " ").trim();
  return clean.length > n ? clean.slice(0, n).trimEnd() + "\u2026" : clean;
};

// Reads multilingual fields stored as title_en / title_fi, title.en / title.fi, or a plain title.
export const pick = (b, names, lang) => {
  for (const n of names) {
    const v = b?.[n + "_" + lang] ?? (b?.[n] && typeof b[n] === "object" ? b[n][lang] : undefined) ?? (typeof b?.[n] === "string" ? b[n] : undefined);
    if (v) return v;
  }
  for (const n of names) if (b?.[n + "_en"]) return b[n + "_en"];
  return "";
};

export function normalizeBlog(b, lang = "en") {
  const body = pick(b, ["content", "body", "text"], lang);
  const title = pick(b, ["title", "name", "heading"], lang) || "Untitled";
  const summary = pick(b, ["summary", "excerpt", "description"], lang) || snippet(body, 150);
  const words = stripHtml(body).split(/\s+/).filter(Boolean).length;
  const img = b?.image || b?.cover || b?.imageUrl || b?.image_url || b?.thumbnail || null;
  const raw = b?.created_at || b?.createdAt || b?.date || null;
  let date = "";
  if (raw) {
    const d = new Date(String(raw).replace(" ", "T"));
    if (!isNaN(d)) date = d.toLocaleDateString(lang === "fi" ? "fi-FI" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
  }
  return {
    id: b?.id ?? b?._id ?? title,
    title,
    summary,
    body,
    image: typeof img === "string" && /^https?:/.test(img) ? img : null,
    date,
    category: typeof b?.category === "string" ? b.category : typeof b?.tag === "string" ? b.tag : null,
    minutes: Math.max(1, Math.round(words / 200)),
  };
}

export function useBlogs(apiUrl, token, lang, limit) {
  const [state, setState] = useState({ status: "loading", items: [] });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(apiUrl + "/blogs", { headers: token ? { Authorization: "Bearer " + token } : {} });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.blogs || data.data || [];
        const items = list.map((b) => normalizeBlog(b, lang));
        if (alive) setState({ status: items.length ? "ok" : "empty", items: limit ? items.slice(0, limit) : items });
      } catch (e) {
        if (alive) setState({ status: "error", items: [] });
      }
    })();
    return () => { alive = false; };
  }, [apiUrl, token, lang, tick]);

  return { ...state, reload: () => { setState({ status: "loading", items: [] }); setTick((t) => t + 1); } };
}
