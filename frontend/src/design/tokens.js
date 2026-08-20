export const appTheme = {
  color: {
    bg: "bg-[#EEF5FF]",
    surface: "bg-white",
    primary: "bg-[#0AC4E0]",
    primaryText: "text-[#0AC4E0]",
    primaryBorder: "border-[#0AC4E0]",
    // Focus/active accent for form controls and selected states — replaces
    // the stray #1E5AA5 / #2E5AA7 blues that used to compete with the brand
    // cyan used everywhere else in the app.
    primaryRing: "ring-[#0AC4E0]",
    primaryFocusBorder: "focus:border-[#0AC4E0]",
    primaryFocusRing: "focus:ring-[#0AC4E0]/10",
    ink: "text-slate-950",
    body: "text-slate-600",
    muted: "text-slate-400",
    border: "border-slate-100",
  },
  // Bare hex values, for consumers that can't use a Tailwind class string
  // (inline `style={{}}`, gradient stop chains, SVG fills, chart color maps).
  raw: {
    primary: "#0AC4E0",
    primaryMid: "#08B5D0",
    primaryDark: "#0899B0",
    primaryDeep: "#067E95",
  },
  // Semantic states — reuses the exact shades already established by
  // AppIconButton's success/danger/warning variants and AppSwitch's tones,
  // rather than inventing a new scale.
  state: {
    success: { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", solid: "bg-emerald-600" },
    warning: { text: "text-orange-500", bg: "bg-orange-50", border: "border-orange-100", solid: "bg-orange-500" },
    danger: { text: "text-red-500", bg: "bg-red-50", border: "border-red-100", solid: "bg-red-500" },
    info: { text: "text-[#0AC4E0]", bg: "bg-[#0AC4E0]/5", border: "border-[#0AC4E0]/20", solid: "bg-[#0AC4E0]" },
  },
  radius: {
    sm: "rounded-xl",
    md: "rounded-2xl",
    lg: "rounded-[1.6rem]",
    xl: "rounded-[2rem]",
  },
  shadow: {
    panel: "shadow-[0_18px_55px_rgba(15,23,42,0.08)]",
    floating: "shadow-[0_24px_80px_rgba(15,23,42,0.14)]",
    soft: "shadow-sm",
  },
  layout: {
    page: "flex h-screen overflow-hidden bg-[#EEF5FF] !p-0 font-sans text-slate-800",
    main: "flex h-full min-w-0 flex-1 flex-col overflow-hidden px-4 py-6 md:px-8",
    content: "simple-scroll min-h-0 flex-1 overflow-y-auto",
  },
};

export function cn(...values) {
  return values
    .flatMap((value) => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      if (typeof value === "object") {
        return Object.entries(value)
          .filter(([, enabled]) => Boolean(enabled))
          .map(([key]) => key);
      }
      return [value];
    })
    .join(" ")
    .trim();
}

