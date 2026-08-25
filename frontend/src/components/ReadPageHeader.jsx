import PropTypes from "prop-types";
import { Plus } from "lucide-react";
import Button from "./Button";

function ReadPageHeader({
    subtitle = "Sistem Pemantauan dan Evaluasi Program",
    title = "Riwayat Assessment",
    highlight = "Akademik",
    buttonText = "Buat Assessment",
    onCreate,
}) {
    return (
        <header className="shrink-0 flex flex-row items-center justify-between animate-in fade-in duration-1000 leading-none">
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-3 bg-[#0AC4E0] rounded-full" />

                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                        {subtitle}
                    </span>
                </div>

                <h1 className="text-[28px] font-black text-slate-800 tracking-tighter">
                    {title} <span className="text-[#0AC4E0]">{highlight}</span>
                </h1>
            </div>

            <Button
                text={buttonText}
                icon={<Plus size={18} />}
                onClick={onCreate}
                className="!bg-slate-800 hover:!bg-[#0AC4E0] !text-white !rounded-2xl !px-7 !py-3.5 !text-sm !font-bold shadow-xl transition-all duration-300 active:scale-95 leading-none"
            />
        </header>
    );
}

ReadPageHeader.propTypes = {
    subtitle: PropTypes.node,
    title: PropTypes.node,
    highlight: PropTypes.node,
    buttonText: PropTypes.node,
    onCreate: PropTypes.func,
};

export default ReadPageHeader;
