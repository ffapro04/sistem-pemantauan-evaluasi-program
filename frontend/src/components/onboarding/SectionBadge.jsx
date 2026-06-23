/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";

function SectionBadge({ icon: Icon, children, className = "" }) {
    return (
        <div
            className={`inline-flex items-center gap-2 rounded-full border border-[#0AC4E0]/15 bg-white px-4 py-2 shadow-sm shadow-cyan-100/50 ${className}`}
        >
            {Icon && <Icon size={14} className="text-[#0AC4E0]" />}
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0AC4E0]">
                {children}
            </span>
        </div>
    );
}

export default SectionBadge;
