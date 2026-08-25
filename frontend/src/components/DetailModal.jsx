import PropTypes from "prop-types";
import { X } from "lucide-react";
import Button from "./Button";
import AppIconButton from "./ui/AppIconButton";

function DetailModal({
    open = true,
    onClose,
    icon,
    eyebrow = "Detail Data",
    title = "-",
    subtitle = "-",
    children,
    footerLeft,
    closeText = "Tutup",
    className = "",
}) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
            style={{
                background: "rgba(8,51,68,0.5)",
                backdropFilter: "blur(8px)",
            }}
            onClick={(event) => event.target === event.currentTarget && onClose?.()}
        >
            <div
                className={`flex w-full max-w-[800px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ${className}`}
            >
                <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white p-8">
                    <div className="flex items-center gap-4">
                        {icon && (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#083344]">
                                {icon}
                            </div>
                        )}

                        <div>
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#0AC4E0]">
                                {eyebrow}
                            </p>

                            <h2 className="text-[20px] font-black leading-none tracking-tight text-[#083344]">
                                {title}
                            </h2>

                            <p className="mt-1 text-[12px] font-medium text-slate-400">
                                {subtitle}
                            </p>
                        </div>
                    </div>

                    <AppIconButton
                        icon={X}
                        iconSize={18}
                        onClick={onClose}
                        ariaLabel={closeText}
                        variant="gray"
                        size="lg"
                        className="!rounded-xl !border-slate-200 !bg-slate-50 !text-slate-400 hover:!border-red-200 hover:!bg-red-50 hover:!text-red-500"
                    />
                </div>

                <div className="custom-scrollbar max-h-[60vh] flex-1 overflow-y-auto bg-slate-50/50 p-8">
                    {children}
                </div>

                <div className="flex shrink-0 items-center justify-between border-t border-slate-100 bg-white p-6">
                    <div className="text-[11px] font-medium text-slate-400">
                        {footerLeft}
                    </div>

                    <Button
                        text={closeText}
                        onClick={onClose}
                        className="!rounded-xl !bg-[#083344] !px-8 !py-2.5 !text-sm !font-bold !text-[#0AC4E0] transition-all hover:!bg-[#0AC4E0] hover:!text-white"
                    />
                </div>
            </div>
        </div>
    );
}

DetailModal.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    icon: PropTypes.node,
    eyebrow: PropTypes.node,
    title: PropTypes.node,
    subtitle: PropTypes.node,
    children: PropTypes.node,
    footerLeft: PropTypes.node,
    closeText: PropTypes.node,
    className: PropTypes.string,
};

export default DetailModal;
