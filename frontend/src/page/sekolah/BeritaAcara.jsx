/* eslint-disable no-unused-vars */
import React from "react";
import { FileText, Clock } from "lucide-react";
import MasterPageShell from "../../components/masterCrud/MasterPageShell";

export default function BeritaAcara() {
    return (
        <MasterPageShell
            title="Berita"
            highlight="Acara"
            subtitle="Sistem Monitoring dan Evaluasi Program"
        >
            <div className="flex h-full flex-col items-center justify-center gap-5">
                <div className="relative flex h-24 w-24 items-center justify-center rounded-[2rem] bg-amber-50">
                    <FileText size={38} className="text-amber-400" />
                    <div className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 shadow-sm shadow-amber-100">
                        <Clock size={13} className="text-white" />
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-amber-400">Coming Soon</p>
                    <h3 className="mt-1 text-xl font-black text-slate-800">Berita Acara</h3>
                    <p className="mt-2 max-w-xs text-xs font-medium leading-relaxed text-slate-400">
                        Fitur dokumentasi kegiatan dan berita acara sedang dalam pengembangan. Akan segera hadir!
                    </p>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-5 py-2.5">
                    <Clock size={11} className="text-amber-400" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">
                        Dalam Pengembangan
                    </span>
                </div>
            </div>
        </MasterPageShell>
    );
}
