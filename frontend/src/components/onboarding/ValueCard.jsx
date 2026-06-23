/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";

function ValueCard({ icon: Icon, title, desc }) {
    return (
        <div className="group relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-8 text-left shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-[#0AC4E0]/40 hover:shadow-2xl hover:shadow-cyan-100/60 sm:p-10">
            <div className="absolute right-[-40px] top-[-40px] h-28 w-28 rounded-full bg-[#0AC4E0]/5 transition-all duration-500 group-hover:scale-150" />

            <div className="relative z-10">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-3xl bg-[#0AC4E0]/10 text-[#0AC4E0] transition-transform duration-500 group-hover:scale-110">
                    <Icon size={28} />
                </div>

                <h4 className="mb-4 text-2xl font-black uppercase tracking-tighter text-slate-900">
                    {title}
                </h4>

                <p className="text-sm font-medium leading-relaxed text-slate-500">
                    {desc}
                </p>
            </div>
        </div>
    );
}

export default ValueCard;
