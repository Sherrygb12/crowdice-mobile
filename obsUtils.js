import { useEffect, useState } from "react";

const ICE_LABELS = {
  sheet_ice: "Sheet ice", ice_fragments: "Ice fragments", open_water: "Open water",
  skim_ice: "Skim ice", border_ice: "Border ice", frazil_ice: "Frazil ice",
  pancake_ice: "Pancake ice", unknown: "Unknown",
};

const ICE_ICONS = {
  sheet_ice: "layers", ice_fragments: "snow", open_water: "water",
  skim_ice: "remove", border_ice: "git-branch", frazil_ice: "sparkles",
  pancake_ice: "ellipse", unknown: "help-circle",
};

export const iceLabel = (t) => ICE_LABELS[t] || "Observation";
export const iceIcon = (t) => ICE_ICONS[t] || "layers";

export function fmtDate(raw) {
  if (!raw) return "";
  const d = new Date(String(raw).replace(" ", "T"));
  if (isNaN(d)) return String(raw);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function useObservations(apiUrl, token) {
  const [state, setState] = useState({ status: "loading", items: [] });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(apiUrl + "/observations", { headers: token ? { Authorization: "Bearer " + token } : {} });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.observations || [];
        if (alive) setState({ status: list.length ? "ok" : "empty", items: list });
      } catch (e) {
        if (alive) setState({ status: "error", items: [] });
      }
    })();
    return () => { alive = false; };
  }, [apiUrl, token, tick]);

  return { ...state, reload: () => { setState({ status: "loading", items: [] }); setTick((t) => t + 1); } };
}