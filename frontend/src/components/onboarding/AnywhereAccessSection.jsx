import React from "react";
import { motion } from "framer-motion";
import { Smartphone, Laptop, Wifi, MapPinned } from "lucide-react";

function DeviceMock() {
    return (
        <div className="relative mx-auto flex h-[340px] w-full max-w-md items-center justify-center">
            <div className="absolute h-[260px] w-[380px] rounded-[2rem] border border-slate-100 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
                <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                        Dashboard
                    </span>
                    <Wifi size={14} className="text-[#0AC4E0]" />
                </div>

                <div className="mt-3 h-28 rounded-xl bg-cyan-50" />

                <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="h-12 rounded-lg bg-slate-50" />
                    <div className="h-12 rounded-lg bg-slate-50" />
                    <div className="h-12 rounded-lg bg-slate-50" />
                </div>
            </div>

            <div className="absolute -right-4 bottom-0 flex h-44 w-28 flex-col rounded-[1.6rem] border border-white bg-white p-3 shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
                <div className="flex items-center justify-between">
                    <Smartphone size={13} className="text-[#0AC4E0]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0AC4E0]" />
                </div>

                <div className="mt-3 flex-1 space-y-2">
                    <div className="h-3 rounded bg-slate-50" />
                    <div className="h-3 w-2/3 rounded bg-slate-50" />
                    <div className="h-14 rounded-lg bg-cyan-50" />
                </div>
            </div>

            <div className="absolute -left-6 top-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white bg-white shadow-lg">
                <MapPinned size={18} className="text-[#0AC4E0]" />
            </div>
        </div>
    );
}

function AnywhereAccessSection() {
    return (
        <section className="relative overflow-hidden bg-slate-50/60 px-5 py-16 sm:px-10 sm:py-20">
            <div className="pointer-events-none absolute -left-32 bottom-0 h-[360px] w-[360px] rounded-full bg-cyan-50 blur-[100px]" />

            <div className="relative mx-auto max-w-7xl">
                <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr]">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.55 }}
                    >
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0AC4E0]">
                            Akses Real-time
                        </p>

                        <h2 className="mt-3 max-w-xl text-3xl font-black uppercase leading-tight tracking-[-0.045em] text-slate-950 sm:text-4xl">
                            Pantau Dimana Saja,
                            <br />
                            Kapan Saja
                        </h2>

                        <p className="mt-5 max-w-lg text-sm font-medium leading-7 text-slate-500">
                            Sistem monitoring YPA-MDR dapat diakses dari laptop maupun
                            perangkat mobile, sehingga tim wilayah dan operator sekolah
                            tetap terhubung dengan data terbaru di lapangan.
                        </p>

                        <div className="mt-7 flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
                                <Laptop size={16} className="text-[#0AC4E0]" />
                                <span className="text-[11px] font-black uppercase text-slate-700">
                                    Desktop & Laptop
                                </span>
                            </div>

                            <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
                                <Smartphone size={16} className="text-[#0AC4E0]" />
                                <span className="text-[11px] font-black uppercase text-slate-700">
                                    Tablet & Mobile
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.94 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <DeviceMock />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

export default AnywhereAccessSection;
