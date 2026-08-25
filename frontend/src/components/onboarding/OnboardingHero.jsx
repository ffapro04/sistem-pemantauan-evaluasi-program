import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { ArrowUpRight, MapPinned, School, UsersRound } from "lucide-react";

function StatItem({ label, value, helper, icon: Icon }) {
    return (
        <div className="group rounded-[1.6rem] border border-white/70 bg-white/75 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-100 hover:shadow-[0_24px_70px_rgba(10,196,224,0.12)]">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-[#0AC4E0]">
                <Icon size={19} />
            </div>

            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                {label}
            </p>

            <p className="mt-2 text-[30px] font-black leading-none tracking-tight text-slate-900">
                {value}
            </p>

            <p className="mt-2 text-[11px] font-bold text-slate-400">{helper}</p>
        </div>
    );
}

StatItem.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    helper: PropTypes.node,
    icon: PropTypes.elementType.isRequired,
};

function OnboardingHero({ image, stats, selectedWilayah }) {
    const selectedAreaName =
        selectedWilayah?.nama_wilayah?.split("/")?.pop() || "Seluruh Indonesia";

    return (
        <section className="relative overflow-hidden px-5 pb-12 pt-28 sm:px-10 sm:pt-36">
            <div className="pointer-events-none absolute left-[-120px] top-20 h-[420px] w-[420px] rounded-full bg-[#0AC4E0]/10 blur-[110px]" />
            <div className="pointer-events-none absolute right-[-120px] top-8 h-[520px] w-[520px] rounded-full bg-cyan-100/60 blur-[120px]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[340px] bg-gradient-to-b from-cyan-50/70 to-transparent" />

            <div className="relative mx-auto max-w-7xl">
                <div className="grid items-center gap-12 lg:grid-cols-[1.04fr_0.96fr]">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55 }}
                    >
                        <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-cyan-100 bg-white/75 px-4 py-2 shadow-sm backdrop-blur-xl">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0AC4E0] opacity-60" />
                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#0AC4E0]" />
                            </span>

                            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0AC4E0]">
                                Monitoring Sekolah Binaan
                            </span>
                        </div>

                        <h1 className="max-w-4xl text-[45px] font-black uppercase leading-[0.9] tracking-[-0.075em] text-slate-950 sm:text-6xl lg:text-[78px]">
                            Pantau Data
                            <br />
                            <span className="relative inline-block text-[#0AC4E0]">
                                Sekolah Binaan
                                <span className="absolute -bottom-2 left-1 h-2 w-[88%] rounded-full bg-[#0AC4E0]/15" />
                            </span>
                        </h1>

                        <p className="mt-7 max-w-2xl text-[15px] font-semibold leading-8 text-slate-500">
                            Lihat persebaran wilayah, jumlah sekolah, guru, dan siswa
                            dalam tampilan monitoring yang rapi, ringan, dan mudah dibaca.
                        </p>

                        <div className="mt-8 flex flex-wrap items-center gap-4">
                            <a
                                href="https://yayasanastra-ypamdr.or.id/"
                                target="_blank"
                                rel="noreferrer"
                                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0AC4E0] px-6 py-4 text-[11px] font-black uppercase tracking-[0.16em] text-white shadow-[0_18px_38px_rgba(10,196,224,0.25)] transition hover:bg-cyan-500 active:scale-[0.98]"
                            >
                                Website YPA-MDR
                                <ArrowUpRight
                                    size={16}
                                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                                />
                            </a>

                            <div className="rounded-2xl border border-slate-100 bg-white/70 px-5 py-3 backdrop-blur-xl">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    Area Aktif
                                </p>
                                <p className="mt-1 max-w-[190px] truncate text-xs font-black uppercase text-slate-800">
                                    {selectedAreaName}
                                </p>
                            </div>
                        </div>

                        <div className="mt-9 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
                            <StatItem
                                label="Wilayah"
                                value={stats.totalWilayah}
                                helper="Wilayah aktif"
                                icon={MapPinned}
                            />
                            <StatItem
                                label="Sekolah"
                                value={stats.totalSekolah}
                                helper={`${stats.filteredSekolah} tampil`}
                                icon={School}
                            />
                            <StatItem
                                label="Guru"
                                value={stats.totalGuru}
                                helper="Terdata"
                                icon={UsersRound}
                            />
                            <StatItem
                                label="Siswa"
                                value={stats.totalSiswa}
                                helper="Terdata"
                                icon={UsersRound}
                            />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.65, delay: 0.08 }}
                        className="relative hidden lg:block"
                    >
                        <div className="absolute left-10 top-8 h-[420px] w-[420px] rounded-[4rem] bg-gradient-to-br from-[#0AC4E0]/20 to-cyan-50 blur-2xl" />

                        <div className="relative mx-auto w-[520px]">
                            <div className="absolute -left-5 top-12 h-20 w-20 rounded-[1.8rem] border border-white bg-white/70 shadow-xl backdrop-blur-xl" />
                            <div className="absolute -right-2 bottom-20 h-24 w-24 rounded-full border border-cyan-100 bg-white/80 shadow-xl backdrop-blur-xl" />

                            <div className="relative rounded-[3rem] border border-white/80 bg-white/50 p-8 shadow-[0_30px_100px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                                <img
                                    src={image}
                                    alt="Ilustrasi pendidikan"
                                    className="animate-float mx-auto w-[460px] drop-shadow-2xl"
                                />

                                <div className="absolute bottom-8 left-8 rounded-[1.4rem] border border-white/70 bg-white/85 px-5 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.10)] backdrop-blur-xl">
                                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                                        Status
                                    </p>
                                    <p className="mt-1 text-sm font-black text-slate-900">
                                        Data Monitoring Aktif
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                        @keyframes float {
                            0%, 100% { transform: translateY(0); }
                            50% { transform: translateY(-14px); }
                        }

                        .animate-float {
                            animation: float 6s ease-in-out infinite;
                        }
                    `,
                }}
            />
        </section>
    );
}

OnboardingHero.propTypes = {
    image: PropTypes.string.isRequired,
    stats: PropTypes.shape({
        totalWilayah: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        totalSekolah: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        filteredSekolah: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        totalGuru: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        totalSiswa: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }).isRequired,
    selectedWilayah: PropTypes.shape({
        nama_wilayah: PropTypes.string,
    }),
};

export default OnboardingHero;
