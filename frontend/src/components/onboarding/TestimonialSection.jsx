import React from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
    {
        name: "Siti Rahayu",
        role: "Kepala Sekolah, SDN Binaan Jakarta",
        quote:
            "Sistem ini membantu kami memantau progres program tanpa harus menunggu laporan manual setiap bulan.",
        large: true,
    },
    {
        name: "Bambang Setiawan",
        role: "PIC Wilayah Jawa Barat",
        quote:
            "Filter wilayah dan jenis area sangat membantu saat presentasi evaluasi ke tim pusat.",
    },
    {
        name: "Dewi Lestari",
        role: "Operator Sekolah, SMP Binaan Surabaya",
        quote:
            "Tampilannya rapi dan data sekolah mudah diakses kapan saja saat dibutuhkan.",
    },
];

function Avatar({ name }) {
    const initials = name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("");

    return (
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0AC4E0]/10 text-sm font-black text-[#0AC4E0]">
            {initials}
        </div>
    );
}

function TestimonialSection() {
    const [featured, ...rest] = testimonials;

    return (
        <section className="px-5 py-16 sm:px-10 sm:py-20">
            <div className="mx-auto max-w-7xl">
                <div className="mb-10 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0AC4E0]">
                        Testimoni
                    </p>

                    <h2 className="mt-3 text-3xl font-black uppercase leading-tight tracking-[-0.045em] text-slate-950 sm:text-4xl">
                        Apa Kata Mereka
                    </h2>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.55 }}
                        className="flex flex-col justify-between rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm sm:p-10"
                    >
                        <Quote size={32} className="text-[#0AC4E0]/30" />

                        <p className="mt-6 text-lg font-bold leading-8 text-slate-700 sm:text-xl">
                            "{featured.quote}"
                        </p>

                        <div className="mt-8 flex items-center gap-3">
                            <Avatar name={featured.name} />
                            <div>
                                <p className="text-sm font-black uppercase text-slate-900">
                                    {featured.name}
                                </p>
                                <p className="text-[11px] font-semibold text-slate-400">
                                    {featured.role}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid gap-6">
                        {rest.map((item, index) => (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.55, delay: 0.1 + index * 0.08 }}
                                className="rounded-[2.5rem] border border-cyan-100 bg-[#0AC4E0]/5 p-7"
                            >
                                <Quote size={24} className="text-[#0AC4E0]/40" />

                                <p className="mt-4 text-sm font-bold leading-7 text-slate-700">
                                    "{item.quote}"
                                </p>

                                <div className="mt-6 flex items-center gap-3">
                                    <Avatar name={item.name} />
                                    <div>
                                        <p className="text-[13px] font-black uppercase text-slate-900">
                                            {item.name}
                                        </p>
                                        <p className="text-[10px] font-semibold text-slate-400">
                                            {item.role}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default TestimonialSection;
