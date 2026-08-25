import PropTypes from "prop-types";
import { Bell, Mail, Smartphone, CheckCircle2 } from "lucide-react";

function Notifikasi({ settings = {}, onChange }) {
    const items = [
        {
            key: "email",
            label: "Email Notification",
            desc: "Terima notifikasi melalui email.",
            icon: <Mail size={18} />,
        },
        {
            key: "app",
            label: "In-App Notification",
            desc: "Tampilkan notifikasi di dalam aplikasi.",
            icon: <Bell size={18} />,
        },
        {
            key: "mobile",
            label: "Mobile Notification",
            desc: "Aktifkan notifikasi perangkat mobile.",
            icon: <Smartphone size={18} />,
        },
    ];

    return (
        <div className="space-y-3">
            {items.map((item) => {
                const active = settings[item.key] ?? true;

                return (
                    <button
                        key={item.key}
                        type="button"
                        onClick={() => onChange?.(item.key, !active)}
                        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${active
                                ? "border-[#0AC4E0]/40 bg-[#0AC4E0]/10"
                                : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <div
                                className={`flex h-11 w-11 items-center justify-center rounded-xl ${active
                                        ? "bg-[#0AC4E0] text-white"
                                        : "bg-slate-50 text-slate-400"
                                    }`}
                            >
                                {item.icon}
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

Notifikasi.propTypes = {
    settings: PropTypes.object,
    onChange: PropTypes.func,
};

export default Notifikasi;
