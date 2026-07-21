/* eslint-disable react/prop-types */
import AppPanel from "./ui/AppPanel";

export default function Card({ title, description, className = "", children }) {
  return (
    <AppPanel className={className}>
      {children}

      {(title || description) && (
        <div className={children ? "mt-5" : ""}>
          {title && (
            <h3 className="text-lg font-black tracking-[-0.02em] text-slate-950">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-2 max-w-[360px] text-sm font-semibold leading-relaxed text-slate-500">
              {description}
            </p>
          )}
        </div>
      )}
    </AppPanel>
  );
}

