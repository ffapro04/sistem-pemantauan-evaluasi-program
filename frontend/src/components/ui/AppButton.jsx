import PropTypes from "prop-types";
import { Loader2 } from "lucide-react";
import { cn } from "../../design/tokens";

const variantClass = {
  primary: "bg-slate-950 text-white shadow-sm hover:bg-[#0AC4E0]",
  secondary: "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950",
  accent: "bg-[#0AC4E0] text-white shadow-sm hover:brightness-105",
  ghost: "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-950",
  danger: "bg-rose-500 text-white shadow-sm hover:bg-rose-600",
  subtle: "border border-slate-100 bg-slate-50 text-slate-500 hover:bg-white hover:text-slate-950",
};

const sizeClass = {
  xs: "h-8 px-3 text-[9px]",
  sm: "h-9 px-4 text-[10px]",
  md: "h-10 px-5 text-xs",
  lg: "h-12 px-6 text-sm",
  icon: "h-10 w-10 p-0",
};

export default function AppButton({
  children,
  text,
  type = "button",
  icon,
  loading = false,
  disabled = false,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  title,
}) {
  return (
    <button
      type={type}
      title={title}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl font-black uppercase tracking-widest transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55",
        variantClass[variant] || variantClass.primary,
        sizeClass[size] || sizeClass.md,
        className,
      )}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <>
          {icon && <span className="flex items-center justify-center">{icon}</span>}
          {children || text}
        </>
      )}
    </button>
  );
}

AppButton.propTypes = {
  children: PropTypes.node,
  text: PropTypes.node,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  icon: PropTypes.node,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  variant: PropTypes.oneOf([
    "primary",
    "secondary",
    "accent",
    "ghost",
    "danger",
    "subtle",
  ]),
  size: PropTypes.oneOf(["xs", "sm", "md", "lg", "icon"]),
  className: PropTypes.string,
  onClick: PropTypes.func,
  title: PropTypes.string,
};

