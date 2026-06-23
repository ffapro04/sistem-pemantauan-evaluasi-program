/* eslint-disable react/prop-types */

function EmptyState({
    icon,
    title = "Data Kosong",
    description = "Belum ada data yang tersedia.",
    className = "",
}) {
    return (
        <div
            className={`flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center ${className}`}
        >
            <div className="mb-4 text-slate-300">{icon}</div>

            <h3 className="text-[12px] font-black uppercase tracking-widest text-slate-500">
                {title}
            </h3>

            <p className="mt-2 max-w-md text-[11px] font-semibold leading-relaxed text-slate-400">
                {description}
            </p>
        </div>
    );
}

export default EmptyState;
