import React from "react";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";

const partners = [
    "Astra International",
    "Yayasan Astra Honda Motor",
    "Yayasan Toyota Astra",
    "Astra Agro Lestari",
    "Yayasan Dharma Bhakti Astra",
];

function PartnerNetworkSection() {
    return (
        <section className="px-5 py-14 sm:px-10 sm:py-18">
            <div className="mx-auto max-w-7xl">
                <div className="mb-10 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0AC4E0]">
                        Jaringan Program
                    </p>

                    <h2 className="mt-3 text-3xl font-black uppercase leading-tight tracking-[-0.045em] text-slate-950 sm:text-4xl">
                        Mitra & Jaringan YPA-MDR
                    </h2>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4">
                    {partners.map((partner, index) => (
                        <motion.div
                            key={partner}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.06 }}
                            className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-white px-5 py-3 shadow-sm transition hover:border-cyan-100 hover:shadow-[0_14px_40px_rgba(10,196,224,0.08)]"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-50 text-[#0AC4E0]">
                                <Building2 size={15} />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-wide text-slate-700">
                                {partner}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default PartnerNetworkSection;
