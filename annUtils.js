import { useEffect, useState } from "react";

export function fmtAnnDate(raw) {
  if (!raw) return "";
  const d = new Date(String(raw).replace(" ", "T"));
  if (isNaN(d)) return String(raw);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function useAnnouncements(apiUrl, token, lang = "en") {
  const [state, setState] = useState({ status: "loading", items: [] });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(apiUrl + "/announcements", { headers: token ? { Authorization: "Bearer " + token } : {} });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();
        const raw = Array.isArray(data) ? data : data.announcements || [];
        const items = raw.map((a) => ({
          id: a.id,
          type: a.type || "update",
          title: a["title_" + lang] || a.title_en || a.title || "",
          body: a["body_" + lang] || a.body_en || a.body || "",
          created_at: a.created_at,
        }));
        if (alive) setState({ status: items.length ? "ok" : "empty", items });
      } catch (e) {
        if (alive) setState({ status: "error", items: [] });
      }
    })();
    return () => { alive = false; };
  }, [apiUrl, token, lang, tick]);

  return { ...state, reload: () => { setState({ status: "loading", items: [] }); setTick((t) => t + 1); } };
}