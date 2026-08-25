import PropTypes from "prop-types";
import { AlertTriangle, Loader2, RefreshCcw } from "lucide-react";
import AppButton from "./AppButton";
import AppPanel from "./AppPanel";
import { cn } from "../../design/tokens";

const toneClass = {
  default: "bg-cyan-50 text-[#0AC4E0]",
  error: "bg-rose-50 text-rose-500",
  warning: "bg-amber-50 text-amber-500",
  success: "bg-emerald-50 text-emerald-500",
};

export default function PageState({
  title = "Memuat halaman",
  description = "Mohon tunggu sebentar.",
  eyebrow = "Sistem Monitoring Evaluasi",
  icon,
  loading = false,
  tone = "default",
  primaryAction,
  secondaryAction,
  className = "",
}) {
  const Icon = loading ? Loader2 : icon || AlertTriangle;

  return (
    <div className={cn("flex min-h-screen items-center justify-center bg-[#EEF5FF] px-6 text-center font-sans", className)}>
      <AppPanel className="w-full max-w-md p-8">
        <div className={cn("mx-auto flex h-14 w-14 items-center justify-center rounded-2xl", toneClass[tone] || toneClass.default)}>
          <Icon size={26} className={loading ? "animate-spin" : ""} />
        </div>

        <p className="mt-5 text-[10px] font-black uppercase tracking-[0.22em] text-[#0AC4E0]">
          {eyebrow}
        </p>

        <h1 className="mt-3 text-xl font-black text-slate-950">{title}</h1>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-500">
          {description}
        </p>

        {(primaryAction || secondaryAction) && (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {primaryAction && (
              <AppButton
                className="flex-1"
                icon={primaryAction.icon || <RefreshCcw size={15} />}
                onClick={primaryAction.onClick}
                variant={primaryAction.variant || "primary"}
              >
                {primaryAction.label}
              </AppButton>
            )}
            {secondaryAction && (
              <AppButton
                className="flex-1"
                icon={secondaryAction.icon}
                onClick={secondaryAction.onClick}
                variant={secondaryAction.variant || "secondary"}
              >
                {secondaryAction.label}
              </AppButton>
            )}
          </div>
        )}
      </AppPanel>
    </div>
  );
}

PageState.propTypes = {
  title: PropTypes.node,
  description: PropTypes.node,
  eyebrow: PropTypes.node,
  icon: PropTypes.elementType,
  loading: PropTypes.bool,
  tone: PropTypes.oneOf(["default", "error", "warning", "success"]),
  primaryAction: PropTypes.shape({
    icon: PropTypes.node,
    onClick: PropTypes.func,
    variant: PropTypes.string,
    label: PropTypes.node,
  }),
  secondaryAction: PropTypes.shape({
    icon: PropTypes.node,
    onClick: PropTypes.func,
    variant: PropTypes.string,
    label: PropTypes.node,
  }),
  className: PropTypes.string,
};

