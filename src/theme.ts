import { Platform } from "react-native";

export const colors = {
  ink: "#1F2A2E",
  inkSoft: "#5B6B70",
  line: "#E3DDCF",
  cream: "#FFF9EE",
  card: "#FFFFFF",
  bamboo: "#2FA37A",
  bambooDark: "#1F7A5A",
  bambooSoft: "#DDF3E9",
  sky: "#4FB3E8",
  skyDark: "#2B8CC0",
  skySoft: "#DDF1FB",
  peach: "#FF8A5B",
  peachDark: "#D9663A",
  gold: "#FFC043",
  goldDark: "#D99A12",
  goldSoft: "#FFF1CC",
  red: "#EF5350",
  redDark: "#C73B38",
  redSoft: "#FFE0DE",
  locked: "#D9D4C7",
  lockedDark: "#B9B3A4",
  white: "#FFFFFF",
};

export const unitColors = [
  { main: colors.bamboo, dark: colors.bambooDark, soft: colors.bambooSoft },
  { main: colors.sky, dark: colors.skyDark, soft: colors.skySoft },
  { main: colors.peach, dark: colors.peachDark, soft: "#FFE6DB" },
  { main: "#9B7EDE", dark: "#7458BF", soft: "#ECE5FB" },
  { main: "#E86FA3", dark: "#C24D82", soft: "#FCE3EE" },
];

export const radius = { sm: 10, md: 16, lg: 22, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const font = {
  regular: Platform.select({ android: "sans-serif", default: undefined }),
  bold: Platform.select({ android: "sans-serif-medium", default: undefined }),
};

/** Sombra "3D" inferior que da el aspecto de botón apretable. */
export const lift = (color: string, depth = 4) => ({
  borderBottomWidth: depth,
  borderBottomColor: color,
});
