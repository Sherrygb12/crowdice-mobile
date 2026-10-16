import { Platform } from "react-native";

export const C = {
  blue: "#0A84FF",
  blueDeep: "#0063C7",
  bg: "#F1F2F6",
  card: "#FFFFFF",
  text: "#1A202C",
  body: "#374151",
  muted: "#6B7280",
  line: "#E5E7EB",
  chip: "#DCE6FF",
  alertBg: "#FFD9D4",
  alertText: "#9B1C1C",
  alertIcon: "#C0262D",
  qBg: "#D9E2FF",
  green: "#0F766E",
  amber: "#F59E0B",
};

// Cover colours for blog cards without an image (cycled by index)
export const COVERS = ["#0A84FF", "#0F766E", "#5B5BD6", "#0E7490"];

export const shadow = Platform.select({
  web: { boxShadow: "0 2px 10px rgba(15,23,42,0.10)" },
  default: { elevation: 3, shadowColor: "#0F172A", shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
});

export const topPad = Platform.OS === "web" ? 16 : 50;
