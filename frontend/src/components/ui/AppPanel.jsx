/* eslint-disable react/prop-types */
import { cn } from "../../design/tokens";

export default function AppPanel({
  as: Component = "section",
  children,
  className = "",
  padded = true,
  interactive = false,
}) {
  return (
    <Component
      className={cn(
        "overflow-hidden rounded-[1.6rem] border border-slate-100 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)]",
        padded && "p-5",
        interactive && "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)]",
        className,
      )}
    >
      {children}
    </Component>
  );
}

