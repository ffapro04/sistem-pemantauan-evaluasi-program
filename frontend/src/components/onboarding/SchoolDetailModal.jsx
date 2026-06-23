/* eslint-disable react/prop-types */
import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    Building2,
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    MapPin,
    School,
    UsersRound,
    X,
} from "lucide-react";

const valueOrFallback = (value, fallback = "Belum tersedia") =>
    value !== undefined && value !== null && value !== "" ? value : fallback;

const getSchoolId = (school) =>
    school?.id_sekolah ?? school?.idSekolah ?? school?.school_id ?? school?.id;

const getSchoolName = (school) =>
    school?.nama_sekolah || school?.namaSekolah || school?.school_name || school?.nama || "Sekolah";

const getSchoolCountyId = (school) =>
    school?.id_kabupaten ??
    school?.kabupaten_id ??
    school?.id_kota ??
    school?.kota_id ??
    school?.kabupaten?.id_wilayah ??
    school?.kabupaten?.id ??
    null;

const getSchoolProvinceId = (school, wilayahMap) => {
    const explicit =
        school?.id_provinsi ??
        school?.provinsi_id ??
        school?.provinsi?.id_wilayah ??
        null;

    if (explicit != null) return explicit;

    const county = wilayahMap.get(String(getSchoolCountyId(school)));
    if (county?.id_parent != null) return county.id_parent;

    const directWilayahId =
        school?.id_wilayah ?? school?.wilayah_id ?? school?.wilayah?.id_wilayah ?? null;
    const directWilayah = wilayahMap.get(String(directWilayahId));

    return directWilayah?.id_parent ?? directWilayahId;
};

function InfoItem({ icon: Icon, label, value }) {
    return (
        <div className="rounded-[1.3rem] border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-slate-400">
                {Icon && <Icon size={15} />}
                <p className="text-[9px] font-black uppercase tracking-[0.16em]">
                    {label}
                </p>
            </div>
            <p className="mt-2 text-sm font-black text-slate-800">
                {valueOrFallback(value)}
            </p>
        </div>
    );
}

function ModalHeader({ school, provinceName, countyName, onClose }) {
    return (
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white p-5 sm:p-7">
            <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0AC4E0]">
                    Profil Sekolah Binaan
                </p>
                <h2 className="mt-1 truncate text-xl font-black text-slate-950 sm:text-2xl">
                    {getSchoolName(school)}
                </h2>
                <p className="mt-2 truncate text-xs font-semibold text-slate-400">
                    {countyName} · {provinceName}
                </p>
            </div>

            <button
                type="button"
                onClick={onClose}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
                aria-label="Tutup modal"
            >
                <X size={20} />
            </button>
        </div>
    );
}

function ModalContent({ school, provinceName, countyName }) {
    const status =
        school?.status === false || school?.status === "false" || Number(school?.status) === 0
            ? "Nonaktif"
            : "Aktif";

    return (
        <div className="no-scrollbar flex-1 overflow-y-auto bg-slate-50 p-5 sm:p-8">
            <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-5">
                    <div className="relative overflow-hidden rounded-[2rem] bg-[#083344] p-7 text-white">
                        <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-[7rem] bg-[#0AC4E0]" />

                        <div className="relative">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#083344]">
                                <School size={25} />
                            </div>

                            <p className="mt-7 text-[9px] font-black uppercase tracking-[0.22em] text-cyan-200">
                                Identitas Sekolah
                            </p>
                            <h3 className="mt-2 text-3xl font-black tracking-[-0.05em]">
                                {getSchoolName(school)}
                            </h3>

                            <div className="mt-6 flex flex-wrap gap-2">
                                <span className="rounded-full bg-white/10 px-4 py-2 text-[10px] font-black uppercase">
                                    NPSN {valueOrFallback(school?.npsn)}
                                </span>
                                <span className="rounded-full bg-white/10 px-4 py-2 text-[10px] font-black uppercase">
                                    {valueOrFallback(school?.jenjang, "Jenjang belum tersedia")}
                                </span>
                                <span className="rounded-full bg-cyan-400 px-4 py-2 text-[10px] font-black uppercase text-slate-950">
                                    {status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-[#0AC4E0]">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                                    Lokasi Sekolah
                                </p>
                                <p className="mt-1 text-sm font-black text-slate-800">
                                    {countyName}, {provinceName}
                                </p>
                            </div>
                        </div>

                        <p className="mt-5 text-sm font-semibold leading-7 text-slate-500">
                            {valueOrFallback(
                                school?.alamat || school?.alamat_lengkap || school?.address,
                                "Informasi alamat lengkap belum tersedia.",
                            )}
                        </p>
                    </div>

                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                            Ringkasan
                        </p>
                        <p className="mt-3 text-sm font-semibold leading-7 text-slate-500">
                            {valueOrFallback(
                                school?.deskripsi || school?.description,
                                "Sekolah binaan yang terhubung dalam sistem pemantauan dan evaluasi pendidikan.",
                            )}
                        </p>
                    </div>
                </div>

                <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0AC4E0]">
                        Informasi Utama
                    </p>
                    <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950">
                        Data Sekolah
                    </h3>

                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                        <InfoItem
                            icon={GraduationCap}
                            label="Jenjang"
                            value={school?.jenjang}
                        />
                        <InfoItem
                            icon={Building2}
                            label="Akreditasi"
                            value={school?.akreditasi}
                        />
                        <InfoItem
                            icon={UsersRound}
                            label="Jumlah Guru"
                            value={school?.jumlah_guru ?? 0}
                        />
                        <InfoItem
                            icon={UsersRound}
                            label="Jumlah Siswa"
                            value={school?.jumlah_siswa ?? 0}
                        />
                        <InfoItem
                            icon={School}
                            label="Tahun Binaan"
                            value={school?.tahun_binaan || school?.tahun_awal_binaan}
                        />
                        <InfoItem
                            icon={MapPin}
                            label="Area"
                            value={school?.area || countyName}
                        />
                    </div>

                    <div className="mt-5 rounded-[1.5rem] border border-cyan-100 bg-cyan-50 p-5">
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-600">
                            Status Pemantauan
                        </p>
                        <p className="mt-2 text-sm font-black leading-6 text-slate-800">
                            Data sekolah dapat ditelusuri langsung dari peta wilayah untuk mendukung pemantauan yang lebih cepat dan terarah.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ModalFooter({ currentIndex, totalSchools, onPrevious, onNext }) {
    return (
        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-slate-200 bg-white px-5 py-5 sm:px-8">
            <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                Sekolah {currentIndex + 1} dari {totalSchools}
            </span>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={onPrevious}
                    disabled={currentIndex === 0}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition active:scale-95 disabled:opacity-30"
                    aria-label="Sekolah sebelumnya"
                >
                    <ChevronLeft size={18} />
                </button>

                <button
                    type="button"
                    onClick={onNext}
                    disabled={currentIndex === totalSchools - 1}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0AC4E0] text-white transition active:scale-95 disabled:opacity-30"
                    aria-label="Sekolah berikutnya"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}

function SchoolDetailModal({
    isOpen,
    onClose,
    initialSchool,
    allSchools = [],
    wilayahList = [],
}) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const wilayahMap = useMemo(
        () =>
            new Map(
                wilayahList
                    .filter((item) => item?.id_wilayah != null || item?.id != null)
                    .map((item) => [String(item.id_wilayah ?? item.id), item]),
            ),
        [wilayahList],
    );

    const initialCountyId = getSchoolCountyId(initialSchool);
    const initialProvinceId = initialSchool
        ? getSchoolProvinceId(initialSchool, wilayahMap)
        : null;

    const schoolsInArea = useMemo(() => {
        if (!initialSchool) return [];

        const sameCounty = allSchools.filter(
            (school) =>
                initialCountyId != null &&
                String(getSchoolCountyId(school)) === String(initialCountyId),
        );

        if (sameCounty.length) return sameCounty;

        return allSchools.filter(
            (school) =>
                String(getSchoolProvinceId(school, wilayahMap)) === String(initialProvinceId),
        );
    }, [allSchools, initialSchool, initialCountyId, initialProvinceId, wilayahMap]);

    useEffect(() => {
        if (!initialSchool) return;

        const initialIndex = schoolsInArea.findIndex(
            (school) => String(getSchoolId(school)) === String(getSchoolId(initialSchool)),
        );

        setCurrentIndex(initialIndex !== -1 ? initialIndex : 0);
    }, [initialSchool, schoolsInArea]);

    useEffect(() => {
        if (!isOpen) return undefined;

        const handleEscape = (event) => {
            if (event.key === "Escape") onClose?.();
        };

        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen || !initialSchool || schoolsInArea.length === 0) return null;

    const school = schoolsInArea[currentIndex];
    const countyId = getSchoolCountyId(school);
    const provinceId = getSchoolProvinceId(school, wilayahMap);
    const county = wilayahMap.get(String(countyId));
    const province = wilayahMap.get(String(provinceId));

    const countyName =
        county?.nama_wilayah ||
        school?.nama_kabupaten ||
        school?.kabupaten?.nama_wilayah ||
        "Kabupaten/Kota belum tersedia";

    const provinceName =
        province?.nama_wilayah ||
        school?.nama_provinsi ||
        school?.provinsi?.nama_wilayah ||
        "Provinsi belum tersedia";

    return (
        <AnimatePresence>
            <div
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/55 p-4 sm:p-6"
                onMouseDown={(event) => {
                    if (event.target === event.currentTarget) onClose?.();
                }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.97, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97, y: 16 }}
                    transition={{ type: "spring", stiffness: 260, damping: 25 }}
                    className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl"
                >
                    <ModalHeader
                        school={school}
                        provinceName={provinceName}
                        countyName={countyName}
                        onClose={onClose}
                    />

                    <ModalContent
                        school={school}
                        provinceName={provinceName}
                        countyName={countyName}
                    />

                    <ModalFooter
                        currentIndex={currentIndex}
                        totalSchools={schoolsInArea.length}
                        onPrevious={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                        onNext={() =>
                            setCurrentIndex((prev) =>
                                Math.min(schoolsInArea.length - 1, prev + 1),
                            )
                        }
                    />
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

export default SchoolDetailModal;

