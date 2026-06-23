/* eslint-disable react/prop-types */
import { ArrowLeft } from "lucide-react";
import Button from "./Button";

function FormPageHeader({
    title,
    highlight,
    subtitle,
    backText = "Kembali",
    icon,
    onBack,
    className = "",
}) {
    return (
        <header
            className={`mb-8 flex flex-row items-end justify-between leading-none ${className}`}
        >
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    {icon ? (
                        <div className="rounded-lg bg-[#0AC4E0] p-1.5 text-white shadow-lg shadow-[#0AC4E0]/20">
                            {icon}
                        </div>
                    ) : (
                        <div className="h-3 w-1 rounded-full bg-[#0AC4E0]" />
                    )}

                    <span
                        className={`text-[10px] font-black uppercase tracking-[0.3em] ${icon ? "text-[#0AC4E0]" : "text-slate-400"
                            }`}
                    >
                        {subtitle}
                    </span>
                </div>

                <h1 className="text-3xl font-black leading-none tracking-tighter text-slate-800">
                    {title} <span className="text-[#0AC4E0]">{highlight}</span>
                </h1>
            </div>

            <Button
                text={backText}
                icon={<ArrowLeft size={18} />}
                variant="outline"
                onClick={onBack}
                className="!rounded-2xl !border-slate-100 !px-6 !py-3.5 !text-sm !font-bold !text-slate-500 shadow-sm transition-all hover:!bg-slate-50 active:scale-95"
            />
        </header>
    );
}

export default FormPageHeader;
