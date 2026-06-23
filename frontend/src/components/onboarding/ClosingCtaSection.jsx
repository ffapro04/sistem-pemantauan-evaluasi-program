import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, MapPinned } from "lucide-react";

function ClosingCtaSection() {
    return (
        <section className="relative overflow-hidden bg-[#0AC4E0] px-5 py-16 sm:px-10 sm:py-20">
            <div className="pointer-events-none absolute -left-24 -top-24 h-[360px] w-[360px] rounded-full bg-white/10 blur-[90px]" />
            <div className="pointer-events-none absolute -bottom-28 right-10 h-[320px] w-[320px] rounded-full bg-white/10 blur-[100px]" />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
                className="relative mx-auto max-w-3xl text-center"
            >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[1.8rem] border border-white/30 bg-white/10 backdrop-blur-xl">
                    <MapPinned size={28} className="text-white" />
                </div>

                <h2 className="text-3xl font-black uppercase leading-tight tracking-[-0.045em] text-white sm:text-4xl">
                    Mulai Pantau Sekarang
                </h2>

                <p className="mx-auto mt-4 max-w-xl text-sm font-semibold leading-7 text-white/85">
                    Telusuri peta wilayah, lihat data sekolah binaan, dan pantau progres
                    program YPA-MDR secara real-time.
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                    <a
                        href="#peta"
                        className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-4 text-[11px] font-black uppercase tracking-[0.16em] text-[#0AC4E0] shadow-[0_18px_38px_rgba(15,23,42,0.2)] transition hover:bg-cyan-50 active:scale-[0.98]"
                    >
                        Lihat Peta Sekolah
                        <ArrowUpRight
                            size={16}
                            className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                    </a>

                    <a
                        href="https://yayasanastra-ypamdr.or.id/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-2xl border border-white/40 px-7 py-4 text-[11px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-white/10 active:scale-[0.98]"
                    >
                        Tentang YPA-MDR
                    </a>
                </div>
            </motion.div>
        </section>
    );
}

export default ClosingCtaSection;
