export const appTheme = {
  color: {
    bg: "bg-[#EEF5FF]",
    surface: "bg-white",
    primary: "bg-[#0AC4E0]",
    primaryText: "text-[#0AC4E0]",
    ink: "text-slate-950",
    body: "text-slate-600",
    muted: "text-slate-400",
    border: "border-slate-100",
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

