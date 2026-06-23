// src/components/masterCrud/MasterPageShell.jsx

/* eslint-disable react/prop-types */
import React from "react";
import Sidebar from "../Sidebar";
import PageWrapper from "../PageWrapper";
import Card from "../Card";
import Label from "../Label";
import Button from "../Button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MasterPageShell({
    title = "Manajemen Data",
    highlight = "",
    subtitle = "Sistem Monitoring dan Evaluasi Program",
    children,
    action,
    backPath,
    backLabel = "Kembali",
    className = "",
    contentClassName = "",
}) {
    const navigate = useNavigate();

    return (
        <PageWrapper className="flex h-screen overflow-hidden bg-[#EEF5FF] !p-0 font-sans text-slate-800">
            <Sidebar />

            <main className="flex h-full flex-1 flex-col overflow-hidden px-4 pb-6 pt-10 md:px-10">
                <Card
                    className={`!m-0 flex flex-1 flex-col overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white !p-0 shadow-[0_24px_70px_rgba(15,23,42,0.08)] ${className}`}
                >
                    <div className="shrink-0 px-10 pb-6 pt-8">
                        <header className="flex items-center justify-between gap-6">
                            <div className="min-w-0">
                                <Label
                                    text={subtitle}
                                    className="!text-[8px] !font-black !italic uppercase !tracking-widest !text-[#0AC4E0]"
                                />

                                <h1 className="mt-1 text-xl font-black uppercase text-slate-800">
                                    {title}{" "}
                                    {highlight && (
                                        <span className="text-[#0AC4E0]">{highlight}</span>
                                    )}
                                </h1>
                            </div>

                            <div className="flex items-center gap-3">
                                {backPath && (
                                    <Button
                                        text={backLabel}
                                        icon={<ChevronLeft size={14} />}
                                        onClick={() => navigate(backPath)}
                                        className="!rounded-full !border !border-slate-100 !bg-white !px-6 !py-2.5 !text-[9px] !font-black !uppercase !text-slate-400 shadow-sm hover:!text-slate-800"
                                    />
                                )}

                                {action}
                            </div>
                        </header>
                    </div>

                    <div className={`min-h-0 flex-1 overflow-hidden border-t border-slate-100 ${contentClassName}`}>
                        {children}
                    </div>
                </Card>
            </main>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          `,
                }}
            />
        </PageWrapper>
    );
}
