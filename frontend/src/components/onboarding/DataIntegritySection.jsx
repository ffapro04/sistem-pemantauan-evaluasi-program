import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Eye, Database } from "lucide-react";

const points = [
    {
        icon: Database,
        title: "Satu Sumber Data",
        desc: "Seluruh data wilayah dan sekolah tersimpan terpusat, mengurangi duplikasi dan inkonsistensi.",
    },
    {
        icon: Lock,
        title: "Akses Berbasis Peran",
        desc: "Setiap pengguna hanya dapat melihat dan mengelola data sesuai peran dan wilayahnya.",
    },
    {
        icon: Eye,
        title: "Transparan & Terlacak",
        desc: "Perubahan data dapat dipantau, mendukung proses evaluasi yang akurat dan akuntabel.",
    },
];

function DataIntegritySection() {
    return (
        <section className="relative overflow-hidden px-5 py-16 sm:px-10 sm:py-20">
            <div className="pointer-events-none absolute right-0 top-0 h-[380px] w-[380px] rounded-full bg-cyan-50/70 blur-[100px]" />

            <div className="relative mx-auto max-w-7xl">
                <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="relative mx-auto flex h-[300px] w-[300px] items-center justify-center"
                    >
                        <div className="absolute h-full w-full rounded-full border border-dashed border-cyan-200" />
                        <div className="absolute h-[72%] w-[72%] rounded-full border border-dashed border-cyan-100" />

                        <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-[#0AC4E0] text-white shadow-[0_18px_45px_rgba(10,196,224,0.35)]">
                            <ShieldCheck size={40} />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.55 }}
                    >
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0AC4E0]">
                            Keamanan Data
                        </p>

                        <h2 className="mt-3 max-w-xl text-3xl font-black uppercase leading-tight tracking-[-0.045em] text-slate-950 sm:text-4xl">
                            Data Aman dan
                            <br />
                            Dapat Dipercaya
                        </h2>

                        <p className="mt-5 max-w-lg text-sm font-medium leading-7 text-slate-500">
                            Setiap data yang ditampilkan berasal dari sumber yang sama
                            dengan sistem internal YPA-MDR, sehingga konsisten dan dapat
                            dipertanggungjawabkan.
                        </p>

                        <div className="mt-8 space-y-5">
                            {points.map((point) => {
                                const Icon = point.icon;
                                return (
                                    <div key={point.title} className="flex gap-4">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-[#0AC4E0]">
                                            <Icon size={19} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black uppercase tracking-tight text-slate-900">
                                                {point.title}
                                            </p>
                                            <p className="mt-1 text-[13px] font-medium leading-6 text-slate-500">
                                                {point.desc}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

export default DataIntegritySection;
