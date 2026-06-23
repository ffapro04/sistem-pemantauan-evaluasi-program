// src/components/masterCrud/MasterStatusSwitch.jsx

/* eslint-disable react/prop-types */
import React from "react";
import { isActiveValue } from "./masterCrudUtils";

export default function MasterStatusSwitch({
    value,
    active,
    activeText = "Aktif",
    inactiveText = "Nonaktif",
    onClick,
}) {
    const isActive =
        typeof active === "boolean" ? active : isActiveValue(value);

    return (
        <button
            type="button"
            onClick={onClick}
            className="group flex cursor-pointer items-center gap-2 transition-all active:scale-95"
        >
            <div
                className={`relative h-[18px] w-8 rounded-full p-0.5 transition-all duration-500 ${isActive ? "bg-[#0AC4E0] shadow-sm shadow-cyan-100" : "bg-slate-200"
                    }`}
            >
                <div
                    className={`h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-all duration-300 ${isActive ? "translate-x-3.5" : "translate-x-0"
                        }`}
                />
            </div>

            <span
                className={`text-[9px] font-black uppercase tracking-widest ${isActive ? "text-[#0AC4E0]" : "text-slate-400"
                    }`}
            >
                {isActive ? activeText : inactiveText}
            </span>
        </button>
    );
}
