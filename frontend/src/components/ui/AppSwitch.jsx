/* eslint-disable react/prop-types */
import { cn } from "../../design/tokens";

const sizeClass = {
  sm: {
    track: "h-[18px] w-8 p-0.5",
    knob: "h-3.5 w-3.5",
    activeKnob: "translate-x-3.5",
  },
  md: {
    track: "h-6 w-12 p-1",
    knob: "h-4 w-4",
    activeKnob: "translate-x-6",
  },
};

const toneClass = {
  cyan: {
    activeTrack: "bg-[#0AC4E0] shadow-sm shadow-cyan-100",
    inactiveTrack: "bg-slate-200",
    activeText: "text-[#0AC4E0]",
    inactiveText: "text-slate-400",
  },
  green: {
    activeTrack: "bg-green-500",
    inactiveTrack: "bg-gray-300",
    activeText: "text-green-600",
    inactiveText: "text-gray-400",
  },
};

export default function AppSwitch({
  checked,
  onClick,
  activeText,
  inactiveText,
  showText = Boolean(activeText || inactiveText),
  size = "sm",
  tone = "cyan",
  className = "",
}) {
  const sizing = sizeClass[size] || sizeClass.sm;
  const toneStyle = toneClass[tone] || toneClass.cyan;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group inline-flex cursor-pointer items-center gap-2 transition-all active:scale-95",
        className,
      )}
    >
      <div
        className={cn(
          "relative rounded-full transition-all duration-500",
          sizing.track,
          checked ? toneStyle.activeTrack : toneStyle.inactiveTrack,
        )}
      >
        <div
          className={cn(
            "rounded-full bg-white shadow-sm transition-all duration-300",
            sizing.knob,
            checked ? sizing.activeKnob : "translate-x-0",
          )}
        />
      </div>

      {showText && (
        <span
          className={cn(
            "text-[9px] font-black uppercase tracking-widest",
            checked ? toneStyle.activeText : toneStyle.inactiveText,
          )}
        >
          {checked ? activeText : inactiveText}
        </span>
      )}
    </button>
  );
}
