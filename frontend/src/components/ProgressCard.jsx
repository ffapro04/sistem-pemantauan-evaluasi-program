/* eslint-disable react/prop-types */
import { Zap } from "lucide-react";
import Card from "./Card";

function ProgressCard({
    label = "Completion Rate",
    rate = 0,
    current = 0,
    total = 0,
    desc,
    color = "#0AC4E0",
    icon,
    className = "",
}) {
    const r = 26;
    const circ = 2 * Math.PI * r;

    const safeRate = Math.min(Math.max(Number(rate) || 0, 0), 100);
    const offset = circ - (circ * safeRate) / 100;

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
                <div>
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        {label}
                    </p>

                    <h3 className="text-[28px] font-black leading-none tracking-tight text-[#083344]">
                        {safeRate}%
                    </h3>

                    <p className="mt-2.5 text-[11px] font-medium text-slate-400">
                        {desc || `${current} / ${total} data`}
                    </p>
                </div>

                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
                    <svg
                        width="56"
                        height="56"
                        viewBox="0 0 64 64"
                        style={{ transform: "rotate(-90deg)" }}
                    >
                        <circle
                            cx="32"
                            cy="32"
                            r={r}
                            fill="transparent"
                            stroke="#F1F5F9"
                            strokeWidth="7"
                        />

                        <circle
                            cx="32"
                            cy="32"
                            r={r}
                            fill="transparent"
                            stroke={color}
                            strokeWidth="7"
                            strokeDasharray={circ}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            style={{ transition: "stroke-dashoffset 1s ease" }}
                        />
                    </svg>

                    <div className="absolute" style={{ color }}>
                        {icon || <Zap size={13} />}
                    </div>
                </div>
            </div>
        </Card>
    );
}

export default ProgressCard;
