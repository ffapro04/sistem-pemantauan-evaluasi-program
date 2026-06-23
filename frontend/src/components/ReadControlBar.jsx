/* eslint-disable react/prop-types */
import { ClipboardCheck } from "lucide-react";
import Search from "./Search";
import Dropdown from "./Dropdown";

function ReadControlBar({
    total = 0,
    search,
    onSearchChange,
    filterValue,
    onFilterChange,
    filterOptions = [],
    placeholder = "Cari data...",
}) {
    return (
        <div className="shrink-0 bg-white/80 backdrop-blur-3xl border border-gray-100 p-2.5 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center gap-4 animate-in fade-in zoom-in-95 duration-700">
            <div className="flex items-center gap-3 px-5 py-3 bg-slate-50 rounded-full border border-gray-100 shrink-0">
                <ClipboardCheck size={16} className="text-[#0AC4E0]" />

                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                    {total} Dokumen
                </span>
            </div>

            <div className="relative flex-1 group">
                <Search
                    placeholder={placeholder}
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    className="!pl-12 !pr-4 !py-3.5 !bg-transparent !border-none !rounded-full !text-[14px] !font-semibold focus:!ring-0 outline-none placeholder:text-slate-300"
                />
            </div>

            <div className="h-8 w-px bg-gray-100" />

            <div className="w-56">
                <Dropdown
                    items={filterOptions}
                    value={filterValue}
                    onChange={onFilterChange}
                    className="!bg-transparent !border-none !rounded-full !py-3 !text-[12px] !font-bold !text-slate-500"
                />
            </div>
        </div>
    );
}

export default ReadControlBar;
