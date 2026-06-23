// src/components/masterCrud/MasterAlert.jsx

/* eslint-disable react/prop-types */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

export default function MasterAlert({ note, setNote }) {
    return (
        <AnimatePresence>
            {note?.show && (
                <motion.div
                    initial={{
                        x: note.type === "error" ? -100 : 100,
                        opacity: 0,
                    }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{
                        x: note.type === "error" ? -100 : 100,
                        opacity: 0,
                    }}
                    className={`fixed ${note.type === "error" ? "left-[320px]" : "right-12"
                        } top-[45%] z-[350] w-72`}
                >
                    <div className="rounded-[3rem] border border-slate-200 bg-white/90 p-8 text-center shadow-2xl backdrop-blur-xl">
                        <div
                            className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg ${note.type === "error"
                                    ? "bg-rose-500 shadow-rose-200"
                                    : "bg-emerald-500 shadow-emerald-200"
                                }`}
                        >
                            {note.type === "error" ? (
                                <XCircle size={28} />
                            ) : (
                                <CheckCircle2 size={28} />
                            )}
                        </div>

                        <h4
                            className={`mb-3 text-[10px] font-black uppercase tracking-widest ${note.type === "error" ? "text-rose-600" : "text-emerald-600"
                                }`}
                        >
                            {note.type === "error" ? "Sistem Alert" : "Berhasil"}
                        </h4>

                        <p className="mb-8 text-xs font-bold leading-relaxed text-slate-700">
                            {note.message}
                        </p>

                        <button
                            type="button"
                            onClick={() => setNote({ show: false, type: null, message: "" })}
                            className={`w-full rounded-2xl py-4 text-[10px] font-black uppercase transition-all active:scale-95 ${note.type === "error"
                                    ? "bg-rose-50 text-rose-600"
                                    : "bg-emerald-50 text-emerald-600"
                                }`}
                        >
                            Mengerti
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
