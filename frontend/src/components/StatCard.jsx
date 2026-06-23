/* eslint-disable react/prop-types */
import Card from "./Card";

function StatCard({
    icon,
    label,
    value,
    desc,
    color = "#0AC4E0",
    className = "",
}) {
    return (
        <Card
            className={`!m-0 !rounded-2xl !border !border-slate-200/80 !bg-white !p-6 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 relative overflow-hidden ${className}`}
        >
            <div
                className="absolute left-0 right-0 top-0 h-[3px]"
                style={{
                    background: `linear-gradient(90deg, ${color}, transparent)`,
                }}
            />

            <div className="mt-1 flex items-start justify-between">
                <div className="min-w-0 flex-1 pr-3">
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        {label}
                    </p>

                    <h3 className="truncate text-[28px] font-black leading-none tracking-tight text-[#083344]">
                        {value ?? 0}
                    </h3>

                    <p className="mt-2.5 text-[11px] font-medium text-slate-400">
                        {desc}
                    </p>
                </div>

                <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50"
                    style={{ color }}
                >
                    {icon}
                </div>
            </div>
        </Card>
    );
}

export default StatCard;
