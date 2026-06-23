/* eslint-disable react/prop-types */
import { Briefcase } from "lucide-react";

function VendorEmptyState({
    title = "Belum ada program",
    description = "Program yang ditugaskan kepada vendor akan tampil di sini.",
}) {
    return (
        <div className="flex flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200 bg-white px-6 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-[#0AC4E0]">
                <Briefcase size={26} />
            </div>

            <h3 className="mt-5 text-[17px] font-black text-slate-800">{title}</h3>

            <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-slate-400">
                {description}
            </p>
        </div>
    );
}

export default VendorEmptyState;
