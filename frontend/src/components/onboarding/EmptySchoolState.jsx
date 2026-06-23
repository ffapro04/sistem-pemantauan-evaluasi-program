import React from "react";
import { School } from "lucide-react";

function EmptySchoolState() {
    return (
        <div className="flex flex-col items-center justify-center px-8 py-24 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-300">
                <School size={34} />
            </div>

            <h4 className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">
                Data Tidak Ditemukan
            </h4>

            <p className="mt-2 max-w-xs text-xs font-medium leading-relaxed text-slate-300">
                Tidak ada sekolah yang sesuai dengan filter wilayah atau jenis area saat
                ini.
            </p>
        </div>
    );
}

export default EmptySchoolState;
