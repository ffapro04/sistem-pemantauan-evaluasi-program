import React from "react";
import { CalendarDays } from "lucide-react";
import Dropdown from "../Dropdown";

const YearFilter = ({
    value,
    onChange,
    options,
    className = "",
}) => (
    <div className={`flex h-[48px] min-w-[210px] items-center rounded-2xl border border-slate-100 bg-slate-50 px-4 ${className}`}>
        <CalendarDays size={15} className="mr-3 shrink-0 text-slate-400" />
        <Dropdown
            items={options}
            value={value}
            onChange={onChange}
            className="!w-full !border-none !bg-transparent !py-0 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-500"
        />
    </div>
);

export default YearFilter;
