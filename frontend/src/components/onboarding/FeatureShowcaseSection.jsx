/* eslint-disable react/prop-types */
import React from "react";
import { motion } from "framer-motion";
import {
    CheckCircle2,
    MapPinned,
    School,
    Users,
    ClipboardList,
    Building2,
} from "lucide-react";

const features = [
    "Data wilayah & sekolah terhubung otomatis dari satu sumber",
    "Filter cepat berdasarkan jenis area: Absolute & Independent",
    "Detail sekolah lengkap-NPSN, jenjang, akreditasi, jumlah guru & siswa",
    "Update lokasi & status wilayah langsung tampil di peta",
];

const picRoles = [
    { icon: MapPinned, color: "bg-cyan-50 text-[#0AC4E0]" },
    { icon: Building2, color: "bg-orange-50 text-orange-500" },
    { icon: School, color: "bg-cyan-50 text-[#0AC4E0]" },
    { icon: Users, color: "bg-orange-50 text-orange-500" },
    { icon: ClipboardList, color: "bg-cyan-50 text-[#0AC4E0]" },
    { icon: Building2, color: "bg-slate-100 text-slate-400" },
];

function PicOrbit() {
    const radius = 150;

    return (
        <div className="relative mx-auto flex h-[360px] w-[360px] items-center justify-center">
            <div className="absolute h-full w-full rounded-full border border-dashed border-cyan-200" />
            <div className="absolute h-[70%] w-[70%] rounded-full border border-dashed border-cyan-100" />

            <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#0AC4E0] text-white shadow-[0_18px_45px_rgba(10,196,224,0.35)]">
                <School size={30} />
            </div>

            {picRoles.map((role, index) => {
                const angle = (index / picRoles.length) * 2 * Math.PI - Math.PI / 2;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const Icon = role.icon;

                return (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.6 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.08, duration: 0.4 }}
                        style={{
                            transform: `translate(${x}px, ${y}px)`,
                        }}
                        className="absolute flex h-14 w-14 items-center justify-center rounded-2xl border border-white bg-white/90 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl"
                    >
                        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${role.color}`}>
                            <Icon size={17} />
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}

function FeatureShowcaseSection() {
    return (
        <section className="relative overflow-hidden px-5 py-16 sm:px-10 sm:py-20">
            <div className="pointer-events-none absolute -left-32 top-1/3 h-[380px] w-[380px] rounded-full bg-cyan-50/70 blur-[100px]" />

            <div className="relative mx-auto max-w-7xl">
                <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr]">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.55 }}
                    >
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0AC4E0]">
                            Fitur Utama
                        </p>

                        <h2 className="mt-3 max-w-xl text-3xl font-black uppercase leading-tight tracking-[-0.045em] text-slate-950 sm:text-4xl">
                            Pantau Setiap
                            <br />
                            Wilayah Binaan
                        </h2>

                        <p className="mt-5 max-w-lg text-sm font-medium leading-7 text-slate-500">
                            Semua data wilayah, sekolah, guru, dan siswa terkumpul dalam satu
                            tampilan-tinggal pilih area di peta untuk melihat detailnya.
                        </p>

                        <ul className="mt-7 space-y-3">
                            {features.map((feature) => (
                                <li key={feature} className="flex items-start gap-3">
                                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0AC4E0]/10 text-[#0AC4E0]">
                                        <CheckCircle2 size={14} />
                                    </span>
                                    <span className="text-sm font-semibold text-slate-600">
                                        {feature}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.94 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <PicOrbit />

                        <div className="mt-2 text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                Sinkronisasi Data Wilayah, Sekolah & Tim
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

export default FeatureShowcaseSection;
