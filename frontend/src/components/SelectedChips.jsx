/* eslint-disable react/prop-types */
import { X } from "lucide-react";

function SelectedChips({ items = [], onRemove, variant = "default" }) {
    if (!items.length) return null;

    const className =
        variant === "cyan"
            ? "border-cyan-100 bg-cyan-50 text-[#0AC4E0]"
            : "border-slate-200 bg-slate-50 text-slate-600";

    return (
        <div className="mt-3 flex flex-wrap gap-2">
            {items.map((item) => (
                <div
                    key={item.value}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-bold ${className}`}
                >
                    <span>{item.label}</span>

                    <button type="button" onClick={() => onRemove(item.value)}>
                        <X size={14} className="opacity-60 hover:text-red-500" />
                    </button>
                </div>
            ))}
        </div>
    );
}

export default SelectedChips;
