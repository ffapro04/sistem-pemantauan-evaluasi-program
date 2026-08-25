import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { CheckCircle2, Globe2, MapPinned, Layers } from "lucide-react";

const areaTypes = [
    {
        icon: Globe2,
        title: "Semua Wilayah",
        desc: "Lihat keseluruhan persebaran wilayah binaan tanpa filter.",
        points: [
            "Tampilkan seluruh titik wilayah di peta",
            "Akses cepat ke semua sekolah binaan",
            "Ringkasan total guru & siswa nasional",
        ],
        highlighted: false,
    },
    {
        icon: Layers,
        title: "Absolute",
        desc: "Wilayah dengan keterlibatan penuh program YPA-MDR.",
        points: [
            "Pendampingan menyeluruh per sekolah",
            "Monitoring rutin oleh tim wilayah",
            "Prioritas evaluasi program tahunan",
        ],
        highlighted: true,
    },
    {
        icon: MapPinned,
        title: "Independent",
        desc: "Wilayah yang berjalan mandiri dengan dukungan terbatas.",
        points: [
            "Pemantauan data dasar sekolah",
            "Koordinasi berkala dengan tim pusat",
            "Pelaporan capaian secara periodik",
        ],
        highlighted: false,
    },
];

function AreaTypeCard({ icon: Icon, title, desc, points, highlighted, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            className={`relative flex flex-col rounded-[2.5rem] border p-8 shadow-sm transition hover:-translate-y-1 ${highlighted
                    ? "border-[#0AC4E0] bg-[#0AC4E0] text-white shadow-[0_24px_70px_rgba(10,196,224,0.3)]"
                    : "border-slate-100 bg-white text-slate-900 hover:border-cyan-100 hover:shadow-[0_22px_60px_rgba(10,196,224,0.1)]"
                }`}
        >
            {highlighted && (
                <span className="absolute -top-3 left-8 rounded-full bg-white px-4 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-[#0AC4E0] shadow-sm">
                    Prioritas
                </span>
            )}

            <div
                className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl ${highlighted ? "bg-white/15 text-white" : "bg-cyan-50 text-[#0AC4E0]"
                    }`}
            >
                <Icon size={22} />
            </div>

            <h3 className="text-xl font-black uppercase tracking-tight">{title}</h3>

            <p
                className={`mt-3 text-sm font-medium leading-6 ${highlighted ? "text-white/80" : "text-slate-500"
                    }`}
            >
                {desc}
            </p>

            <ul className="mt-6 flex-1 space-y-3">
                {points.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                        <CheckCircle2
                            size={15}
                            className={`mt-0.5 shrink-0 ${highlighted ? "text-white" : "text-[#0AC4E0]"
                                }`}
                        />
                        <span
                            className={`text-[13px] font-semibold leading-6 ${highlighted ? "text-white/90" : "text-slate-600"
                                }`}
                        >
                            {point}
                        </span>
                    </li>
                ))}
            </ul>
        </motion.div>
    );
}

AreaTypeCard.propTypes = {
    icon: PropTypes.elementType.isRequired,
    title: PropTypes.string.isRequired,
    desc: PropTypes.string.isRequired,
    points: PropTypes.arrayOf(PropTypes.string).isRequired,
    highlighted: PropTypes.bool,
    index: PropTypes.number,
};

function AreaTypeSection() {
    return (
        <section className="px-5 py-16 sm:px-10 sm:py-20">
            <div className="mx-auto max-w-7xl">
                <div className="mb-12 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0AC4E0]">
                        Klasifikasi Wilayah
                    </p>

                    <h2 className="mt-3 text-3xl font-black uppercase leading-tight tracking-[-0.045em] text-slate-950 sm:text-4xl">
                        Jenis Area Binaan
                    </h2>

                    <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-7 text-slate-500">
                        Setiap wilayah dikelompokkan agar pendampingan dan pelaporan
                        program lebih terarah sesuai kondisinya.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {areaTypes.map((type, index) => (
                        <AreaTypeCard key={type.title} index={index} {...type} />
                    ))}
                </div>
            </div>
        </section>
    );
}

export default AreaTypeSection;
