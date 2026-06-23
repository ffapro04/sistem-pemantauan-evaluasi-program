import React from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, MapPinned, Filter, Layers } from "lucide-react";

function MockFilterCard() {
    return (
        <div className="relative mx-auto w-full max-w-md rounded-[2.5rem] border border-white/80 bg-white/60 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.1)] backdrop-blur-xl sm:p-8">
            <div className="absolute -left-6 -top-6 flex h-14 w-14 items-center justify-center rounded-[1.4rem] border border-white bg-white shadow-lg">
                <Filter size={22} className="text-[#0AC4E0]" />
            </div>

            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Filter Aktif
            </p>

            <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                        <MapPinned size={15} className="text-[#0AC4E0]" />
                        <span className="text-[11px] font-black uppercase text-slate-700">
                            Wilayah Jakarta
                        </span>
                    </div>
                    <span className="h-2 w-8 rounded-full bg-[#0AC4E0]" />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                        <Layers size={15} className="text-orange-400" />
                        <span className="text-[11px] font-black uppercase text-slate-700">
                            Jenis: Absolute
                        </span>
                    </div>
                    <span className="h-2 w-8 rounded-full bg-orange-400" />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal size={15} className="text-slate-400" />
                        <span className="text-[11px] font-black uppercase text-slate-500">
                            Tampilkan Semua
                        </span>
                    </div>
                    <span className="h-2 w-8 rounded-full bg-slate-200" />
                </div>
            </div>

            <div className="mt-6 rounded-2xl bg-[#0AC4E0]/10 p-4 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0AC4E0]">
                    24 Sekolah Sesuai Filter
                </p>
            </div>
        </div>
    );
}

function CustomizeViewSection() {
    return (
        <section className="relative overflow-hidden px-5 py-16 sm:px-10 sm:py-20">
            <div className="pointer-events-none absolute -right-32 top-10 h-[380px] w-[380px] rounded-full bg-cyan-50/70 blur-[100px]" />

            <div className="relative mx-auto max-w-7xl">
                <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.94 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="order-2 lg:order-1"
                    >
                        <MockFilterCard />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.55 }}
                        className="order-1 lg:order-2"
                    >
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0AC4E0]">
                            Personalisasi
                        </p>

                        <h2 className="mt-3 max-w-xl text-3xl font-black uppercase leading-tight tracking-[-0.045em] text-slate-950 sm:text-4xl">
                            Sesuaikan Tampilan
                            <br />
                            Monitoring Anda
                        </h2>

                        <p className="mt-5 max-w-lg text-sm font-medium leading-7 text-slate-500">
                            Pilih wilayah, jenis area, atau kombinasi keduanya untuk
                            menampilkan data yang relevan dengan kebutuhan Anda-peta dan
                            registry akan otomatis menyesuaikan.
                        </p>

                        <div className="mt-7 grid grid-cols-2 gap-3 sm:max-w-md">
                            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                                    Filter Wilayah
                                </p>
                                <p className="mt-1 text-sm font-black text-slate-900">
                                    34 Pilihan
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                                    Jenis Area
                                </p>
                                <p className="mt-1 text-sm font-black text-slate-900">
                                    Absolute / Independent
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

export default CustomizeViewSection;
