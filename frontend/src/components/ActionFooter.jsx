/* eslint-disable react/prop-types */
import { Loader2, Save } from "lucide-react";
import Button from "./Button";

function ActionFooter({
    cancelText = "Batalkan",
    submitText = "Simpan",
    loadingText = "Menyimpan...",
    loading = false,
    showCancel = true,
    onCancel,
    onSubmit,
}) {
    return (
        <footer
            className={`mt-6 flex shrink-0 items-center rounded-[2.5rem] border border-slate-100 bg-white/60 px-10 py-6 leading-none shadow-sm backdrop-blur-xl ${showCancel ? "justify-between" : "justify-end"
                }`}
        >
            {showCancel && (
                <Button
                    text={cancelText}
                    variant="ghost"
                    onClick={onCancel}
                    className="!text-sm !font-bold !uppercase !tracking-widest !text-slate-400 transition-colors hover:!text-slate-600"
                />
            )}

            <Button
                disabled={loading}
                onClick={onSubmit}
                text={loading ? loadingText : submitText}
                icon={
                    loading ? (
                        <Loader2 size={20} className="animate-spin" />
                    ) : (
                        <Save size={20} />
                    )
                }
                className="!rounded-2xl !bg-[#0AC4E0] !px-12 !py-4 !text-[13px] !font-black !uppercase !tracking-[0.2em] !text-white shadow-xl shadow-[#0AC4E0]/30 transition-all hover:!bg-[#09b3cc] active:scale-95 disabled:!opacity-50"
            />
        </footer>
    );
}

export default ActionFooter;
