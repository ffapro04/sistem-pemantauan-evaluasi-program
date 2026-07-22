/* eslint-disable react/prop-types */
import Sidebar from "../Sidebar";
import PageWrapper from "../PageWrapper";
import AppPanel from "./AppPanel";
import AppButton from "./AppButton";
import { cn } from "../../design/tokens";

export default function PageShell({
  children,
  title,
  highlight,
  subtitle = "Sistem Monitoring dan Evaluasi Program",
  action,
  backAction,
  withSidebar = true,
  className = "",
  mainClassName = "",
  contentClassName = "",
}) {
  return (
    <PageWrapper className={cn("flex h-screen overflow-hidden bg-[#EEF5FF] !p-0 font-sans text-slate-800", className)}>
      {withSidebar && <Sidebar />}

      <main className={cn("flex h-full min-w-0 flex-1 flex-col overflow-hidden px-4 py-6 md:px-8", mainClassName)}>
        {(title || subtitle || action || backAction) && (
          <AppPanel className="mb-4 flex shrink-0 flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              {subtitle && (
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0AC4E0]">
                  {subtitle}
                </p>
              )}
              {title && (
                <h1 className="mt-1 truncate text-2xl font-black leading-tight tracking-[-0.04em] text-slate-950">
                  {title} {highlight && <span className="text-[#0AC4E0]">{highlight}</span>}
                </h1>
              )}
            </div>

            {(action || backAction) && (
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {backAction && (
                  <AppButton variant="secondary" onClick={backAction.onClick} icon={backAction.icon}>
                    {backAction.label || "Kembali"}
                  </AppButton>
                )}
                {action}
              </div>
            )}
          </AppPanel>
        )}

        <div className={cn("simple-scroll min-h-0 flex-1 overflow-y-auto", contentClassName)}>
          {children}
        </div>
      </main>
    </PageWrapper>
  );
}

