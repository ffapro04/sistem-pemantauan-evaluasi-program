/* eslint-disable react/prop-types */

function InfoPill({ icon, text, className = "" }) {
    return (
        <div
            className={`flex w-fit items-center gap-3 rounded-full border border-slate-100 bg-slate-50 px-6 py-4 leading-none ${className}`}
        >
            <div className="text-[#0AC4E0]">{icon}</div>

            <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                {text}
            </span>
        </div>
    );
}

export default InfoPill;
