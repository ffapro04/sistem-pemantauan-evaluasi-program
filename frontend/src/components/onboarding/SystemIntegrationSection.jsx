import React from "react";
import { motion } from "framer-motion";
import {
    School,
    Users,
    MapPinned,
    ClipboardCheck,
    FileBarChart,
    Building2,
} from "lucide-react";

const systems = [
    { icon: School, label: "Master Sekolah", color: "bg-cyan-50 text-[#0AC4E0]" },
    { icon: Users, label: "Assessment Guru", color: "bg-orange-50 text-orange-500" },
    { icon: MapPinned, label: "Master Wilayah", color: "bg-cyan-50 text-[#0AC4E0]" },
    { icon: Building2, label: "Area Officer", color: "bg-slate-100 text-slate-400" },
    { icon: ClipboardCheck, label: "Berita Acara", color: "bg-orange-50 text-orange-500" },
    { icon: FileBarChart, label: "Program Sekolah", color: "bg-cyan-50 text-[#0AC4E0]" },
];

function SystemOrbit() {
    const radius = 150;

    return (
        <div className="relative mx-auto flex h-[360px] w-[360px] items-center justify-center">
            <div className="absolute h-full w-full rounded-full border border-dashed border-cyan-200" />
            <div className="absolute h-[70%] w-[70%] rounded-full border border-dashed border-cyan-100" />

            <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#0AC4E0] text-white shadow-[0_18px_45px_rgba(10,196,224,0.35)]">
                <FileBarChart size={30} />
            </div>

            {systems.map((system, index) => {
                const angle = (index / systems.length) * 2 * Math.PI - Math.PI / 2;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const Icon = system.icon;

                return (
                    <motion.div
                        key={system.label}
                        initial={{ opacity: 0, scale: 0.6 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.08, duration: 0.4 }}
                        style={{ transform: `translate(${x}px, ${y}px)` }}
                        className="absolute flex h-14 w-14 items-center justify-center rounded-2xl border border-white bg-white/90 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl"
                    >
                        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${system.color}`}>
                            <Icon size={17} />
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}

function SystemIntegrationSection() {
    return (
        <section className="relative overflow-hidden px-5 py-16 sm:px-10 sm:py-20">
            <div className="pointer-events-none absolute -left-32 bottom-10 h-[380px] w-[380px] rounded-full bg-cyan-50/70 blur-[100px]" />

            <div className="relative mx-auto max-w-7xl">
                <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr]">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.94 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <SystemOrbit />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.55 }}
                    >
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0AC4E0]">
                            Satu Ekosistem
                        </p>

                        <h2 className="mt-3 max-w-xl text-3xl font-black uppercase leading-tight tracking-[-0.045em] text-slate-950 sm:text-4xl">
                            Terintegrasi dengan
                            <br />
                            Modul Lainnya
                        </h2>

                        <p className="mt-5 max-w-lg text-sm font-medium leading-7 text-slate-500">
                            Halaman monitoring ini terhubung dengan modul Master Sekolah,
                            Master Wilayah, Assessment Guru, Area Officer, hingga Berita
                            Acara dan Program Sekolah-semua dalam satu platform YPA-MDR.
                        </p>

                        <div className="mt-7 grid grid-cols-2 gap-3 sm:max-w-md">
                            {systems.slice(0, 4).map((system) => {
                                const Icon = system.icon;
                                return (
                                    <div
                                        key={system.label}
                                        className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm"
                                    >
                                        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${system.color}`}>
                                            <Icon size={15} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-wide text-slate-700">
                                            {system.label}
                                        </span>
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

export default SystemIntegrationSection;
