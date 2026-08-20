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
  // `frame`: render header + content as one continuous rounded card instead
  // of a separate header panel above free-floating content — reproduces the
  // Master-CRUD page frame that masterCrud/MasterPageShell.jsx used to
  // reimplement independently (see that file for the thin wrapper).
  frame = false,
  className = "",
  mainClassName = "",
  contentClassName = "",
}) {
  const hasHeader = title || subtitle || action || backAction;

  const titleBlock = (
    <div className="min-w-0">
      {subtitle && (
        <p
          className={
            frame
              ? "text-[8px] font-black italic uppercase tracking-widest text-[#0AC4E0]"
              : "text-[10px] font-black uppercase tracking-[0.22em] text-[#0AC4E0]"
          }
        >
          {subtitle}
        </p>
      )}
      {title && (
        <h1
          className={
            frame
              ? "mt-1 text-xl font-black uppercase text-slate-800"
              : "mt-1 truncate text-2xl font-black leading-tight tracking-[-0.04em] text-slate-950"
          }
        >
          {title} {highlight && <span className="text-[#0AC4E0]">{highlight}</span>}
        </h1>
      )}
    </div>
  );

  const actionsBlock = (action || backAction) && (
    <div className={frame ? "flex items-center gap-3" : "flex shrink-0 flex-wrap items-center gap-2"}>
      {backAction && (
        <AppButton variant="secondary" onClick={backAction.onClick} icon={backAction.icon}>
          {backAction.label || "Kembali"}
        </AppButton>
      )}
      {action}
    </div>
  );

  const content = (
    <div
      className={cn(
        frame
          ? "min-h-0 flex-1 overflow-hidden border-t border-slate-100"
          : "simple-scroll min-h-0 flex-1 overflow-y-auto",
        contentClassName,
      )}
    >
      {children}
    </div>
  );

  return (
    <PageWrapper className={cn("flex h-screen overflow-hidden bg-[#EEF5FF] !p-0 font-sans text-slate-800", className)}>
      {withSidebar && <Sidebar />}

      <main
        className={cn(
          "flex h-full min-w-0 flex-1 flex-col overflow-hidden",
          frame ? "px-4 pb-6 pt-10 md:px-10" : "px-4 py-6 md:px-8",
          mainClassName,
        )}
      >
        {frame ? (
          <AppPanel className="!m-0 flex flex-1 flex-col overflow-hidden rounded-[2.5rem] !p-0 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
            {hasHeader && (
              <div className="shrink-0 px-10 pb-6 pt-8">
                <header className="flex items-center justify-between gap-6">
                  {titleBlock}
                  {actionsBlock}
                </header>
              </div>
            )}
            {content}
          </AppPanel>
        ) : (
          <>
            {hasHeader && (
              <AppPanel className="mb-4 flex shrink-0 flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                {titleBlock}
                {actionsBlock}
              </AppPanel>
            )}
            {content}
          </>
        )}
      </main>
    </PageWrapper>
  );
}
