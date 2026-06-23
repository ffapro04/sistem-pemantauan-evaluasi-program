import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, LayoutDashboard } from "lucide-react";

function QuickAccessBanner() {
    return (
        <section className="relative overflow-hidden bg-[#0AC4E0] px-5 py-16 sm:px-10 sm:py-20">
            <div className="pointer-events-none absolute -right-24 -top-24 h-[360px] w-[360px] rounded-full bg-white/10 blur-[80px]" />
            <div className="pointer-events-none absolute -bottom-24 left-10 h-[300px] w-[300px] rounded-full bg-white/10 blur-[100px]" />

            <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-10 text-center lg:flex-row lg:justify-between lg:text-left">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55 }}
                    className="max-w-xl"
                >
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/70">
                        Akses Cepat
                    </p>

                    <h2 className="mt-3 text-3xl font-black uppercase leading-tight tracking-[-0.045em] text-white sm:text-4xl">
                        Masuk ke Sistem Monitoring YPA-MDR
                    </h2>

                    <p className="mt-4 text-sm font-semibold leading-7 text-white/80">
                        Login untuk operator sekolah, guru, dan tim wilayah-pantau, input,
                        dan kelola data program secara langsung.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55, delay: 0.1 }}
                    className="flex shrink-0 flex-col items-center gap-4 sm:flex-row"
                >
                    <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/30 bg-white/10 backdrop-blur-xl">
                        <LayoutDashboard size={36} className="text-white" />
                    </div>

                    <a
                        href="/login"
                        className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-4 text-[11px] font-black uppercase tracking-[0.16em] text-[#0AC4E0] shadow-[0_18px_38px_rgba(15,23,42,0.2)] transition hover:bg-cyan-50 active:scale-[0.98]"
                    >
                        Login Sistem
                        <ArrowUpRight
                            size={16}
                            className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                    </a>
                </motion.div>
            </div>
        </section>
    );
}

export default QuickAccessBanner;
