/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import {
    Plus,
    Trash2,
    ChevronRight,
    FileCheck2,
    LockKeyhole,
    ClipboardCheck,
    Layers3,
} from "lucide-react";

function createRequirement(name = "", description = "") {
    return {
        nama: name,
        tipe: "upload",
        deskripsi: description,
    };
}

function createOpeningTermin(phaseNumber) {
    return {
        nama_termin: `Termin Luar Fase ${phaseNumber}`,
        deskripsi: `Syarat awal untuk membuka Fase ${phaseNumber}.`,
        jumlah_pembayaran: 0,
        persyaratan: [
            createRequirement(
                "Upload dokumen pembuka fase",
                "Dokumen administrasi, pembayaran, MOU, atau dokumen awal lainnya.",
            ),
        ],
    };
}

function createInnerTermin(phaseNumber) {
    return {
        nama_kegiatans: `Termin Dalam Fase ${phaseNumber}`,
        deskripsi: `Bukti pelaksanaan setelah Fase ${phaseNumber} berjalan.`,
        persyaratan: [
            createRequirement(
                "Upload dokumentasi kegiatan",
                "Foto atau dokumentasi kegiatan yang sudah dilaksanakan.",
            ),
            createRequirement(
                "Upload absensi kegiatan",
                "Daftar hadir peserta atau pihak yang terlibat.",
            ),
        ],
    };
}

function FieldLabel({ children }) {
    return (
        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            {children}
        </p>
    );
}

function TextInput({ value, onChange, placeholder, type = "text" }) {
    return (
        <input
            type={type}
            value={value || ""}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-[13px] font-bold text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-cyan-200 focus:bg-white focus:ring-4 focus:ring-cyan-100/60"
        />
    );
}

function TextArea({ value, onChange, placeholder }) {
    return (
        <textarea
            value={value || ""}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full resize-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-[13px] font-semibold leading-6 text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-cyan-200 focus:bg-white focus:ring-4 focus:ring-cyan-100/60"
        />
    );
}

function SmallButton({ children, onClick, variant = "primary", disabled = false }) {
    const variants = {
        primary: "bg-[#0AC4E0] text-white hover:bg-cyan-500",
        cyan: "bg-cyan-50 text-[#0AC4E0] hover:bg-cyan-100",
        amber: "bg-amber-50 text-amber-600 hover:bg-amber-100",
        danger: "bg-rose-50 text-rose-500 hover:bg-rose-100",
        slate: "bg-slate-50 text-slate-500 hover:bg-slate-100",
    };

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] transition disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]}`}
        >
            {children}
        </button>
    );
}

function RequirementList({
    title,
    subtitle,
    tone = "cyan",
    requirements = [],
    onChange,
}) {
    const isAmber = tone === "amber";

    const addRequirement = () => {
        onChange([...requirements, createRequirement()]);
    };

    const updateRequirement = (index, field, value) => {
        onChange(
            requirements.map((item, itemIndex) =>
                itemIndex === index ? { ...item, [field]: value } : item,
            ),
        );
    };

    const removeRequirement = (index) => {
        if (requirements.length <= 1) return;
        onChange(requirements.filter((_, itemIndex) => itemIndex !== index));
    };

    return (
        <div
            className={`rounded-[24px] border p-4 ${isAmber
                    ? "border-amber-100 bg-amber-50/35"
                    : "border-cyan-100 bg-cyan-50/35"
                }`}
        >
            <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                    <p
                        className={`text-[11px] font-black uppercase tracking-[0.18em] ${isAmber ? "text-amber-600" : "text-[#0AC4E0]"
                            }`}
                    >
                        {title}
                    </p>
                    <p className="mt-1 text-[12px] font-semibold leading-5 text-slate-500">
                        {subtitle}
                    </p>
                </div>

                <SmallButton
                    variant={isAmber ? "amber" : "cyan"}
                    onClick={addRequirement}
                >
                    <Plus size={13} />
                    Tambah
                </SmallButton>
            </div>

            <div className="space-y-3">
                {requirements.map((item, index) => (
                    <div
                        key={index}
                        className="rounded-[20px] border border-white bg-white p-4 shadow-sm"
                    >
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <span className="rounded-full bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                                Dokumen {index + 1}
                            </span>

                            <button
                                type="button"
                                onClick={() => removeRequirement(index)}
                                disabled={requirements.length <= 1}
                                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-300 transition hover:bg-rose-50 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <div>
                                <FieldLabel>Nama Dokumen</FieldLabel>
                                <TextInput
                                    value={item.nama}
                                    onChange={(value) =>
                                        updateRequirement(index, "nama", value)
                                    }
                                    placeholder="Contoh: Upload bukti pembayaran"
                                />
                            </div>

                            <div>
                                <FieldLabel>Keterangan</FieldLabel>
                                <TextInput
                                    value={item.deskripsi}
                                    onChange={(value) =>
                                        updateRequirement(index, "deskripsi", value)
                                    }
                                    placeholder="Jelaskan fungsi dokumen ini..."
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SectionHeader({ icon, title, subtitle, tone = "cyan", right }) {
    const isAmber = tone === "amber";

    return (
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
                <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] ${isAmber
                            ? "bg-amber-100 text-amber-600"
                            : "bg-cyan-100 text-[#0AC4E0]"
                        }`}
                >
                    {icon}
                </div>

                <div>
                    <h4 className="text-[17px] font-black tracking-[-0.03em] text-slate-900">
                        {title}
                    </h4>
                    <p className="mt-1 max-w-2xl text-[12px] font-semibold leading-6 text-slate-500">
                        {subtitle}
                    </p>
                </div>
            </div>

            {right}
        </div>
    );
}

function PhaseEditor({ fase, phaseIndex, fases, setFases }) {
    const phaseNumber = phaseIndex + 1;

    const updatePhase = (field, value) => {
        setFases(
            fases.map((item, index) =>
                index === phaseIndex ? { ...item, [field]: value } : item,
            ),
        );
    };

    const updateTermin = (terminIndex, field, value) => {
        updatePhase(
            "termin",
            (fase.termin || []).map((termin, index) =>
                index === terminIndex ? { ...termin, [field]: value } : termin,
            ),
        );
    };

    const updateTerminRequirements = (terminIndex, requirements) => {
        updatePhase(
            "termin",
            (fase.termin || []).map((termin, index) =>
                index === terminIndex
                    ? { ...termin, persyaratan: requirements }
                    : termin,
            ),
        );
    };

    const addOpeningTermin = () => {
        updatePhase("termin", [
            ...(fase.termin || []),
            {
                ...createOpeningTermin(phaseNumber),
                nama_termin: `Termin Luar ${(fase.termin || []).length + 1}`,
            },
        ]);
    };

    const removeOpeningTermin = (terminIndex) => {
        if ((fase.termin || []).length <= 1) return;

        updatePhase(
            "termin",
            (fase.termin || []).filter((_, index) => index !== terminIndex),
        );
    };

    const updateInner = (innerIndex, field, value) => {
        updatePhase(
            "kegiatans",
            (fase.kegiatans || []).map((item, index) =>
                index === innerIndex ? { ...item, [field]: value } : item,
            ),
        );
    };

    const updateInnerRequirements = (innerIndex, requirements) => {
        updatePhase(
            "kegiatans",
            (fase.kegiatans || []).map((item, index) =>
                index === innerIndex ? { ...item, persyaratan: requirements } : item,
            ),
        );
    };

    const addInnerTermin = () => {
        updatePhase("kegiatans", [
            ...(fase.kegiatans || []),
            {
                ...createInnerTermin(phaseNumber),
                nama_kegiatans: `Termin Dalam ${(fase.kegiatans || []).length + 1}`,
            },
        ]);
    };

    const removeInnerTermin = (innerIndex) => {
        if ((fase.kegiatans || []).length <= 1) return;

        updatePhase(
            "kegiatans",
            (fase.kegiatans || []).filter((_, index) => index !== innerIndex),
        );
    };

    return (
        <div className="space-y-5">
            <div className="rounded-[28px] border border-white bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.07)]">
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-[#0AC4E0] text-[13px] font-black text-white">
                        {String(phaseNumber).padStart(2, "0")}
                    </div>

                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            Fase yang sedang diedit
                        </p>
                        <h3 className="mt-1 text-[18px] font-black tracking-[-0.03em] text-slate-900">
                            {fase.nama_fase || `Fase ${phaseNumber}`}
                        </h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div>
                        <FieldLabel>Nama Fase</FieldLabel>
                        <TextInput
                            value={fase.nama_fase}
                            onChange={(value) => updatePhase("nama_fase", value)}
                            placeholder={`Fase ${phaseNumber}`}
                        />
                    </div>

                    <div>
                        <FieldLabel>Deskripsi Singkat</FieldLabel>
                        <TextInput
                            value={fase.deskripsi}
                            onChange={(value) => updatePhase("deskripsi", value)}
                            placeholder="Contoh: Persiapan program dan validasi dokumen"
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-[30px] border border-amber-100 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.07)]">
                <SectionHeader
                    tone="amber"
                    icon={<LockKeyhole size={18} />}
                    title="Termin Luar"
                    subtitle="Bagian ini adalah syarat awal untuk membuka fase. Cocok untuk dokumen administrasi, pembayaran, MOU, atau persetujuan awal."
                    right={
                        <SmallButton variant="amber" onClick={addOpeningTermin}>
                            <Plus size={13} />
                            Tambah Termin Luar
                        </SmallButton>
                    }
                />

                <div className="space-y-4">
                    {(fase.termin || []).map((termin, terminIndex) => (
                        <div
                            key={terminIndex}
                            className="rounded-[24px] border border-amber-100 bg-amber-50/30 p-4"
                        >
                            <div className="mb-4 flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-600">
                                        Termin Luar {terminIndex + 1}
                                    </p>
                                    <p className="mt-1 text-[12px] font-semibold text-slate-500">
                                        Syarat yang harus dipenuhi sebelum fase dibuka.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeOpeningTermin(terminIndex)}
                                    disabled={(fase.termin || []).length <= 1}
                                    className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 transition hover:bg-rose-50 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                <div>
                                    <FieldLabel>Nama Termin Luar</FieldLabel>
                                    <TextInput
                                        value={termin.nama_termin}
                                        onChange={(value) =>
                                            updateTermin(
                                                terminIndex,
                                                "nama_termin",
                                                value,
                                            )
                                        }
                                        placeholder="Contoh: Administrasi Pembuka"
                                    />
                                </div>

                                <div>
                                    <FieldLabel>Nominal Pembayaran</FieldLabel>
                                    <TextInput
                                        value={termin.jumlah_pembayaran}
                                        onChange={(value) =>
                                            updateTermin(
                                                terminIndex,
                                                "jumlah_pembayaran",
                                                String(value).replace(/\D/g, ""),
                                            )
                                        }
                                        placeholder="0"
                                    />
                                </div>

                                <div className="lg:col-span-2">
                                    <FieldLabel>Keterangan Termin Luar</FieldLabel>
                                    <TextArea
                                        value={termin.deskripsi}
                                        onChange={(value) =>
                                            updateTermin(
                                                terminIndex,
                                                "deskripsi",
                                                value,
                                            )
                                        }
                                        placeholder="Jelaskan syarat pembuka fase ini..."
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <RequirementList
                                    tone="amber"
                                    title="Dokumen Pembuka"
                                    subtitle="Dokumen yang harus diunggah untuk membuka fase."
                                    requirements={termin.persyaratan || []}
                                    onChange={(requirements) =>
                                        updateTerminRequirements(
                                            terminIndex,
                                            requirements,
                                        )
                                    }
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-[30px] border border-cyan-100 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.07)]">
                <SectionHeader
                    tone="cyan"
                    icon={<FileCheck2 size={18} />}
                    title="Termin Dalam"
                    subtitle="Bagian ini berisi bukti pelaksanaan setelah fase berjalan. Cocok untuk dokumentasi kegiatan, absensi, laporan, atau bukti pekerjaan."
                    right={
                        <SmallButton variant="cyan" onClick={addInnerTermin}>
                            <Plus size={13} />
                            Tambah Termin Dalam
                        </SmallButton>
                    }
                />

                <div className="space-y-4">
                    {(fase.kegiatans || []).map((kegiatan, kegiatanIndex) => (
                        <div
                            key={kegiatanIndex}
                            className="rounded-[24px] border border-cyan-100 bg-cyan-50/30 p-4"
                        >
                            <div className="mb-4 flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0AC4E0]">
                                        Termin Dalam {kegiatanIndex + 1}
                                    </p>
                                    <p className="mt-1 text-[12px] font-semibold text-slate-500">
                                        Bukti yang harus dipenuhi agar fase selesai.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeInnerTermin(kegiatanIndex)}
                                    disabled={(fase.kegiatans || []).length <= 1}
                                    className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 transition hover:bg-rose-50 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <FieldLabel>Nama Termin Dalam</FieldLabel>
                                    <TextInput
                                        value={kegiatan.nama_kegiatans}
                                        onChange={(value) =>
                                            updateInner(
                                                kegiatanIndex,
                                                "nama_kegiatans",
                                                value,
                                            )
                                        }
                                        placeholder="Contoh: Dokumentasi Pelaksanaan"
                                    />
                                </div>

                                <div>
                                    <FieldLabel>Keterangan Termin Dalam</FieldLabel>
                                    <TextArea
                                        value={kegiatan.deskripsi}
                                        onChange={(value) =>
                                            updateInner(
                                                kegiatanIndex,
                                                "deskripsi",
                                                value,
                                            )
                                        }
                                        placeholder="Jelaskan bukti yang harus dikumpulkan..."
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <RequirementList
                                    tone="cyan"
                                    title="Dokumen Bukti"
                                    subtitle="Dokumen yang harus diunggah sebagai bukti pelaksanaan."
                                    requirements={kegiatan.persyaratan || []}
                                    onChange={(requirements) =>
                                        updateInnerRequirements(
                                            kegiatanIndex,
                                            requirements,
                                        )
                                    }
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function PhaseNavigation({ fases, activePhase, setActivePhase, addFase, removeFase }) {
    return (
        <aside className="rounded-[30px] border border-white bg-white p-4 shadow-[0_20px_65px_rgba(15,23,42,0.08)]">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Daftar Fase
                    </p>
                    <p className="mt-1 text-[18px] font-black text-slate-900">
                        {fases.length} Fase
                    </p>
                </div>

                <SmallButton onClick={addFase}>
                    <Plus size={13} />
                    Fase
                </SmallButton>
            </div>

            <div className="space-y-2">
                {fases.map((fase, index) => {
                    const active = activePhase === index;

                    return (
                        <button
                            key={index}
                            type="button"
                            onClick={() => setActivePhase(index)}
                            className={`group flex w-full items-center justify-between gap-3 rounded-[22px] border px-4 py-4 text-left transition ${active
                                    ? "border-cyan-100 bg-cyan-50 text-[#0AC4E0]"
                                    : "border-slate-100 bg-white text-slate-500 hover:border-cyan-100 hover:bg-cyan-50/50"
                                }`}
                        >
                            <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-[0.16em]">
                                    Fase {index + 1}
                                </p>
                                <p className="mt-1 truncate text-[13px] font-black text-slate-800">
                                    {fase.nama_fase || `Fase ${index + 1}`}
                                </p>
                            </div>

                            <ChevronRight
                                size={16}
                                className={`shrink-0 transition ${active
                                        ? "text-[#0AC4E0]"
                                        : "text-slate-300 group-hover:text-[#0AC4E0]"
                                    }`}
                            />
                        </button>
                    );
                })}
            </div>

            <div className="mt-4 border-t border-slate-100 pt-4">
                <SmallButton
                    variant="danger"
                    onClick={removeFase}
                    disabled={fases.length <= 1}
                >
                    <Trash2 size={13} />
                    Hapus Fase Ini
                </SmallButton>
            </div>
        </aside>
    );
}

function WorkflowBuilder({ fases, setFases }) {
    const [activePhase, setActivePhase] = useState(0);

    const selectedPhase = fases[activePhase] || fases[0];

    const summary = useMemo(() => {
        const openingTotal = fases.reduce((total, fase) => {
            return (
                total +
                (fase.termin || []).reduce(
                    (sum, termin) => sum + (termin.persyaratan || []).length,
                    0,
                )
            );
        }, 0);

        const innerTotal = fases.reduce((total, fase) => {
            return (
                total +
                (fase.kegiatans || []).reduce(
                    (sum, kegiatan) =>
                        sum + (kegiatan.persyaratan || []).length,
                    0,
                )
            );
        }, 0);

        return {
            openingTotal,
            innerTotal,
        };
    }, [fases]);

    const addFase = () => {
        const nextNumber = fases.length + 1;

        setFases([
            ...fases,
            {
                nama_fase: `Fase ${nextNumber}`,
                deskripsi: "",
                termin: [createOpeningTermin(nextNumber)],
                kegiatans: [createInnerTermin(nextNumber)],
            },
        ]);

        setActivePhase(fases.length);
    };

    const removeFase = () => {
        if (fases.length <= 1) return;

        const nextFases = fases.filter((_, index) => index !== activePhase);
        setFases(nextFases);
        setActivePhase(Math.max(0, activePhase - 1));
    };

    return (
        <section className="rounded-[36px] border border-white bg-white/70 p-6 shadow-[0_26px_90px_rgba(15,23,42,0.09)] backdrop-blur-xl">
            <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#0AC4E0]">
                        <Layers3 size={13} />
                        Workflow Program
                    </div>

                    <h2 className="text-[26px] font-black leading-tight tracking-[-0.05em] text-slate-950">
                        Susun Alur Fase Program
                    </h2>

                    <p className="mt-2 max-w-3xl text-[13px] font-semibold leading-6 text-slate-500">
                        Buat fase program dengan dua bagian sederhana: Termin Luar untuk membuka fase,
                        lalu Termin Dalam untuk bukti penyelesaian fase.
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-[22px] border border-slate-100 bg-white px-4 py-3 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                            Fase
                        </p>
                        <p className="mt-1 text-[22px] font-black text-slate-900">
                            {fases.length}
                        </p>
                    </div>

                    <div className="rounded-[22px] border border-amber-100 bg-amber-50 px-4 py-3 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-600">
                            Luar
                        </p>
                        <p className="mt-1 text-[22px] font-black text-slate-900">
                            {summary.openingTotal}
                        </p>
                    </div>

                    <div className="rounded-[22px] border border-cyan-100 bg-cyan-50 px-4 py-3 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-600">
                            Dalam
                        </p>
                        <p className="mt-1 text-[22px] font-black text-slate-900">
                            {summary.innerTotal}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
                <div className="rounded-[26px] border border-amber-100 bg-amber-50/70 p-5">
                    <div className="mb-3 flex items-center gap-3">
                        <LockKeyhole size={18} className="text-amber-600" />
                        <h3 className="text-[15px] font-black text-slate-900">
                            Termin Luar
                        </h3>
                    </div>
                    <p className="text-[13px] font-semibold leading-6 text-slate-600">
                        Syarat untuk membuka fase. Contoh: administrasi, pembayaran, MOU, atau dokumen persetujuan.
                    </p>
                </div>

                <div className="rounded-[26px] border border-cyan-100 bg-cyan-50/70 p-5">
                    <div className="mb-3 flex items-center gap-3">
                        <ClipboardCheck size={18} className="text-[#0AC4E0]" />
                        <h3 className="text-[15px] font-black text-slate-900">
                            Termin Dalam
                        </h3>
                    </div>
                    <p className="text-[13px] font-semibold leading-6 text-slate-600">
                        Bukti untuk menyelesaikan fase. Contoh: dokumentasi kegiatan, absensi, laporan, atau bukti pelaksanaan.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[320px_1fr]">
                <PhaseNavigation
                    fases={fases}
                    activePhase={activePhase}
                    setActivePhase={setActivePhase}
                    addFase={addFase}
                    removeFase={removeFase}
                />

                <PhaseEditor
                    fase={selectedPhase}
                    phaseIndex={activePhase}
                    fases={fases}
                    setFases={setFases}
                />
            </div>
        </section>
    );
}

export default WorkflowBuilder;
