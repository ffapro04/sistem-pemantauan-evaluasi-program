import React from "react";
import { Database, MapPinned, School, PanelsTopLeft } from "lucide-react";

const items = [
    {
        icon: Database,
        title: "Data Terpusat",
        desc: "Data wilayah dan sekolah binaan dikumpulkan dalam satu tampilan agar proses monitoring lebih cepat.",
    },
    {
        icon: MapPinned,
        title: "Peta Interaktif",
        desc: "Wilayah dapat dipilih langsung melalui peta untuk melihat sekolah yang berada di area tersebut.",
    },
    {
        icon: School,
        title: "Registry Sekolah",
        desc: "Daftar sekolah tersusun rapi, dapat difilter berdasarkan wilayah, dan mudah dibaca.",
    },
    {
        icon: PanelsTopLeft,
        title: "Detail Sekolah",
        desc: "Informasi sekolah dapat dibuka melalui modal tanpa meninggalkan halaman monitoring.",
    },
];

function MonitoringInfoCard({ icon: Icon, title, desc, index }) {
    return (
        <div className="group relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-6 shadow-[0_16px_44px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-1 hover:border-cyan-100 hover:shadow-[0_22px_60px_rgba(10,196,224,0.10)]">
            <div className="absolute right-[-34px] top-[-34px] h-28 w-28 rounded-full bg-[#0AC4E0]/5 transition duration-500 group-hover:scale-150" />

            <div className="relative z-10">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-[#0AC4E0] transition group-hover:scale-105">
                        <Icon size={22} />
                    </div>

                    <span className="text-[11px] font-black text-slate-200">
                        0{index + 1}
                    </span>
                </div>

                <h4 className="text-[17px] font-black uppercase tracking-tight text-slate-900">
                    {title}
                </h4>

                <p className="mt-3 text-sm font-medium leading-7 text-slate-500">
                    {desc}
                </p>
            </div>
        </div>
    );
}

function CoreValuesSection() {
    return (
        <section className="px-5 py-14 sm:px-10 sm:py-18">
            <div className="mx-auto max-w-7xl">
                <div className="mb-9 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0AC4E0]">
                            Fitur Monitoring
                        </p>

                        <h2 className="mt-3 max-w-2xl text-3xl font-black uppercase leading-tight tracking-[-0.045em] text-slate-950 sm:text-4xl">
                            Ringkas, Terarah, dan Mudah Digunakan
                        </h2>
                    </div>

                    <p className="max-w-xl text-sm font-medium leading-7 text-slate-500">
                        Halaman onboarding dibuat untuk membantu pengguna membaca
                        persebaran data sekolah binaan secara cepat tanpa tampilan yang
                        berat atau membingungkan.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                    {items.map((item, index) => (
                        <MonitoringInfoCard
                            key={item.title}
                            index={index}
                            icon={item.icon}
                            title={item.title}
                            desc={item.desc}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

export default CoreValuesSection;
