import PropTypes from "prop-types";
import { Languages, CheckCircle2 } from "lucide-react";

function Bahasa({ selected = "id", onChange }) {
    const languages = [
        {
            id: "id",
            label: "Bahasa Indonesia",
            desc: "Gunakan tampilan aplikasi dalam Bahasa Indonesia.",
        },
        {
            id: "en",
            label: "English",
            desc: "Use the application interface in English.",
        },
    ];

    return (
        <div className="space-y-3">
            {languages.map((item) => {
                const active = selected === item.id;

                return (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => onChange?.(item.id)}
                        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${active
                                ? "border-[#0AC4E0] bg-[#0AC4E0]/10"
                                : "border-slate-100 bg-white hover:border-[#0AC4E0]/40 hover:bg-slate-50"
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <div
                                className={`flex h-11 w-11 items-center justify-center rounded-xl ${active
                                        ? "bg-[#0AC4E0] text-white"
                                        : "bg-slate-50 text-slate-400"
                                    }`}
                            >
                                <Languages size={20} />
                            </div>

                            <div>
                                <h3 className="text-sm font-black text-slate-800">
                                    {item.label}
                                </h3>

                                <p className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-400">
                                    {item.desc}
                                </p>
                            </div>
                        </div>

                        {active && <CheckCircle2 size={18} className="text-[#0AC4E0]" />}
                    </button>
                );
            })}
        </div>
    );
}

Bahasa.propTypes = {
    selected: PropTypes.string,
    onChange: PropTypes.func,
};

export default Bahasa;
