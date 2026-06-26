export const CHART_PALETTE = [
  "#FF0052",
  "#FFD400",
  "#00C68D",
  "#0055DA",
  "#360185",
  "#8F0177",
  "#DE1A58",
  "#F4B342",
];

export const getChartPaletteColor = (index = 0) =>
  CHART_PALETTE[Math.abs(Number(index) || 0) % CHART_PALETTE.length];

export const CHART_STATUS_COLORS = {
  danger: "#FF0052",
  warning: "#FFD400",
  success: "#00C68D",
  info: "#0055DA",
  deep: "#360185",
  purple: "#8F0177",
  pink: "#DE1A58",
  orange: "#F4B342",
};
