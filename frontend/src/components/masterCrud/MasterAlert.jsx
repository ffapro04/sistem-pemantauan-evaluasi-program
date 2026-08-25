// src/components/masterCrud/MasterAlert.jsx

import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import AppButton from "../ui/AppButton";

export default function MasterAlert({ note, setNote }) {
    return (
        <AnimatePresence>
            {note?.show && (
                <motion.div
                    initial={{ y: -24, opacity: 0, scale: 0.98 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -24, opacity: 0, scale: 0.98 }}
                    className="pointer-events-none fixed inset-x-0 top-5 z-[350] flex justify-center px-4"
                >
                    <div className="pointer-events-auto w-[min(420px,calc(100vw-32px))] rounded-[1.35rem] border border-slate-200 bg-white/95 p-4 shadow-[0_18px_55px_rgba(15,23,42,0.14)] backdrop-blur-xl">
                        <div
                            className={`float-left mr-3 flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-lg ${note.type === "error"
                                    ? "bg-rose-500 shadow-rose-200"
                                    : "bg-emerald-500 shadow-emerald-200"
                                }`}
                        >
                            {note.type === "error" ? <XCircle size={21} /> : <CheckCircle2 size={21} />}
                        </div>

                        <h4
                            className={`mb-1 text-[10px] font-black uppercase tracking-widest ${note.type === "error" ? "text-rose-600" : "text-emerald-600"
                                }`}
                        >
                            {note.type === "error" ? "Sistem Alert" : "Berhasil"}
                        </h4>

                        <p className="text-xs font-bold leading-relaxed text-slate-700">
                            {note.message}
                        </p>

                        <AppButton
                            type="button"
                            onClick={() => setNote({ show: false, type: null, message: "" })}
                            variant="primary"
                            className="mt-3 w-full"
                        >
                            Mengerti
                        </AppButton>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

MasterAlert.propTypes = {
    note: PropTypes.shape({
        show: PropTypes.bool,
        type: PropTypes.string,
        message: PropTypes.node,
    }),
    setNote: PropTypes.func.isRequired,
};
