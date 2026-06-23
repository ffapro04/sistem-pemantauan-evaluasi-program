/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import {
    ArrowRight,
    BadgeCheck,
    BriefcaseBusiness,
    CheckCircle2,
    Clock3,
    Eye,
    FileClock,
    FolderOpen,
    Layers3,
    Mail,
    MapPin,
    Phone,
    RefreshCcw,
    School,
    Search,
    UploadCloud,
    UserCheck,
} from "lucide-react";

import { Sidebar, PageWrapper, Button, Input } from "../common";

const API_BASE_URL = "";

function getVendorEmail(vendor) {
    return (
        vendor?.email ||
        vendor?.email_vendor ||
        vendor?.user?.email ||
        "-"
    );
}

function getVendorInitials(vendor) {
    const source =
        vendor?.nama_vendor ||
        vendor?.pj_1 ||
        vendor?.user?.nama ||
        "Vendor";

    return String(source)
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word.charAt(0).toUpperCase())
        .join("");
}

function normalizeArray(payload) {
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload)) return payload;
    return [];
}

function getArray(...values) {
    return values.find((value) => Array.isArray(value)) || [];
}

function getRequirementFile(requirement) {
    return (
        requirement?.file ||
        requirement?.file_url ||
        requirement?.file_path ||
        requirement?.path ||
        requirement?.file_mou ||
        null
    );
}

function getRequirementStatus(requirement) {
    const currentStatus = String(requirement?.status || "").toUpperCase();

    if (currentStatus === "APPROVED") return "APPROVED";
    if (currentStatus === "REJECTED") return "REJECTED";
    if (currentStatus === "WAITING_HO") return "WAITING_HO";

    if (getRequirementFile(requirement)) return "WAITING_HO";

    return "WAITING_UPLOAD";
}

function getProgramVendorIds(program) {
    if (Array.isArray(program?.vendor_ids)) {
        return program.vendor_ids.map(String);
    }

    if (Array.isArray(program?.id_vendor)) {
        return program.id_vendor.map(String);
    }

    if (program?.id_vendor) {
        return [String(program.id_vendor)];
    }

    return [];
}

function getProgramRequirements(program) {
    const fases = getArray(program?.fases);

    return fases.flatMap((fase) => {
        const terminList = getArray(fase.termin, fase.termins, fase.t_termin);

        const kegiatanList = getArray(
            fase.kegiatans,
            fase.kegiatan,
            fase.t_kegiatans,
        );

        const terminRequirements = terminList.flatMap((termin) =>
            getArray(
                termin.persyaratan,
                termin.persyaratan_termin,
                termin.requirements,
                termin.t_persyaratan_termin,
            ).map((item) => ({
                ...item,
                parentType: "termin",
            })),
        );

        const kegiatanRequirements = kegiatanList.flatMap((kegiatan) =>
            getArray(
                kegiatan.persyaratan,
                kegiatan.persyaratan_kegiatan,
                kegiatan.requirements,
                kegiatan.t_persyaratan_kegiatan,
            ).map((item) => ({
                ...item,
                parentType: "kegiatan",
            })),
        );

        return [...terminRequirements, ...kegiatanRequirements];
    });
}

function getProgramProgress(program) {
    const requirements = getProgramRequirements(program);

    const total = requirements.length;

    const approved = requirements.filter(
        (item) => getRequirementStatus(item) === "APPROVED",
    ).length;

    const waitingHo = requirements.filter(
        (item) => getRequirementStatus(item) === "WAITING_HO",
    ).length;

    const waitingUpload = requirements.filter(
        (item) => getRequirementStatus(item) === "WAITING_UPLOAD",
    ).length;

    const rejected = requirements.filter(
        (item) => getRequirementStatus(item) === "REJECTED",
    ).length;

    const actionable = waitingUpload + rejected;

    return {
        total,
        approved,
        waitingHo,
        waitingUpload,
        rejected,
        actionable,
        percentage: total ? Math.round((approved / total) * 100) : 0,
    };
}

function getPhaseRows(fase) {
    const terminList = getArray(fase.termin, fase.termins, fase.t_termin);

    const kegiatanList = getArray(
        fase.kegiatans,
        fase.kegiatan,
        fase.t_kegiatans,
    );

    const openingRows = terminList.map((termin) => {
        const requirements = getArray(
            termin.persyaratan,
            termin.persyaratan_termin,
            termin.requirements,
            termin.t_persyaratan_termin,
        );

        return {
            type: "termin",
            requirements,
        };
    });

    const innerRows = kegiatanList.map((kegiatan) => {
        const requirements = getArray(
            kegiatan.persyaratan,
            kegiatan.persyaratan_kegiatan,
            kegiatan.requirements,
            kegiatan.t_persyaratan_kegiatan,
        );

        return {
            type: "kegiatan",
            requirements,
        };
    });

    return {
        openingRows,
        innerRows,
    };
}

function isRowApproved(row) {
    if (!row?.requirements?.length) return false;

    return row.requirements.every(
        (item) => getRequirementStatus(item) === "APPROVED",
    );
}

function isPhaseCompleted(fase) {
    const { openingRows, innerRows } = getPhaseRows(fase);

    if (!openingRows.length || !innerRows.length) return false;

    return (
        openingRows.every((row) => isRowApproved(row)) &&
        innerRows.every((row) => isRowApproved(row))
    );
}

function isOpeningCompleted(fase) {
    const { openingRows } = getPhaseRows(fase);

    if (!openingRows.length) return false;

    return openingRows.every((row) => isRowApproved(row));
}

function getActivePhaseInfo(program) {
    const fases = getArray(program?.fases);

    if (!fases.length) {
        return {
            label: "Belum ada fase",
            index: 0,
            totalPhase: 0,
            isLocked: true,
            openingDone: false,
            completed: false,
        };
    }

    const activeIndex = fases.findIndex((fase, index) => {
        const previousCompleted =
            index === 0 ||
            fases.slice(0, index).every((item) => isPhaseCompleted(item));

        if (!previousCompleted) return false;

        return !isPhaseCompleted(fase);
    });

    const index = activeIndex === -1 ? fases.length - 1 : activeIndex;
    const fase = fases[index];

    return {
        label: fase?.nama_fase || `Fase ${index + 1}`,
        index: index + 1,
        totalPhase: fases.length,
        isLocked:
            index > 0 &&
            !fases.slice(0, index).every((item) => isPhaseCompleted(item)),
        openingDone: isOpeningCompleted(fase),
        completed: isPhaseCompleted(fase),
    };
}

function getProgramProcessStatus(program) {
    const progress = getProgramProgress(program);
    const activePhase = getActivePhaseInfo(program);

    if (!progress.total) {
        return {
            label: "Belum Ada Dokumen",
            className: "border-slate-100 bg-slate-50 text-slate-400",
        };
    }

    if (progress.rejected > 0) {
        return {
            label: "Perlu Revisi",
            className: "border-red-100 bg-red-50 text-red-500",
        };
    }

    if (progress.waitingUpload > 0) {
        return {
            label: activePhase.openingDone
                ? "Upload Termin Dalam"
                : "Upload Termin Luar",
            className: "border-cyan-100 bg-cyan-50 text-[#0AC4E0]",
        };
    }

    if (progress.waitingHo > 0) {
        return {
            label: "Menunggu HO",
            className: "border-amber-100 bg-amber-50 text-amber-600",
        };
    }

    if (progress.approved === progress.total) {
        return {
            label: "Selesai",
            className: "border-emerald-100 bg-emerald-50 text-emerald-600",
        };
    }

    return {
        label: "Berjalan",
        className: "border-slate-100 bg-slate-50 text-slate-500",
    };
}

function ProgressBar({ value }) {
    return (
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
                className="h-full rounded-full bg-[#0AC4E0] transition-all"
                style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
            />
        </div>
    );
}

function StatCard({ label, value, helper, icon, tone = "cyan" }) {
    const toneClass =
        tone === "amber"
            ? "bg-amber-50 text-amber-600"
            : tone === "emerald"
                ? "bg-emerald-50 text-emerald-600"
                : tone === "red"
                    ? "bg-red-50 text-red-500"
                    : "bg-cyan-50 text-[#0AC4E0]";

    return (
        <div className="min-h-0 rounded-[1.35rem] border border-slate-100 bg-white p-4 shadow-[0_12px_34px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                        {label}
                    </p>

                    <p className="mt-2 text-[24px] font-black leading-none text-slate-800">
                        {value}
                    </p>

                    <p className="mt-1 truncate text-[10px] font-bold text-slate-400">
                        {helper}
                    </p>
                </div>

                <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${toneClass}`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-widest ${status.className}`}
        >
            {status.label}
        </span>
    );
}

function MiniStatus({ label, value }) {
    return (
        <div className="rounded-xl bg-slate-50 px-2 py-2 text-center">
            <p className="text-[13px] font-black leading-none text-slate-800">
                {value}
            </p>

            <p className="mt-1 text-[7px] font-black uppercase tracking-widest text-slate-300">
                {label}
            </p>
        </div>
    );
}

function InfoPill({ icon, label }) {
    return (
        <div className="flex min-w-0 items-center gap-2 rounded-xl bg-cyan-50/60 px-3 py-2 text-[#0AC4E0]">
            <span className="shrink-0">{icon}</span>

            <p className="truncate text-[10px] font-bold text-slate-600">
                {label}
            </p>
        </div>
    );
}

function ProgramCard({ program, getSchoolName, getHoName, onDetail }) {
    const progress = getProgramProgress(program);
    const processStatus = getProgramProcessStatus(program);
    const activePhase = getActivePhaseInfo(program);

    return (
        <div className="group flex h-full min-h-0 flex-col rounded-[1.45rem] border border-slate-100 bg-white p-4 shadow-sm transition hover:border-cyan-100 hover:shadow-[0_18px_45px_rgba(15,23,42,0.07)]">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-[14px] font-black text-slate-800">
                        {program.nama_program || "-"}
                    </p>

                    <p className="mt-1 truncate text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {program.kode_program || `PRG-${program.id_program}`}
                    </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <div className="rounded-xl border border-cyan-100 bg-cyan-50 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-[#0AC4E0]">
                        {activePhase.index}/{activePhase.totalPhase} Fase
                    </div>

                    <button
                        type="button"
                        onClick={() => onDetail(program)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 transition group-hover:border-[#0AC4E0] group-hover:text-[#0AC4E0]"
                        title="Lihat detail program"
                    >
                        <Eye size={15} />
                    </button>
                </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
                <InfoPill icon={<School size={13} />} label={getSchoolName(program)} />
                <InfoPill icon={<UserCheck size={13} />} label={getHoName(program)} />
            </div>

            <div className="mt-3 rounded-2xl bg-slate-50 p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="truncate text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {activePhase.label}
                    </p>

                    <p className="text-[13px] font-black text-[#0AC4E0]">
                        {progress.percentage}%
                    </p>
                </div>

                <ProgressBar value={progress.percentage} />

                <div className="mt-3 grid grid-cols-4 gap-1">
                    <MiniStatus label="Upload" value={progress.waitingUpload} />
                    <MiniStatus label="HO" value={progress.waitingHo} />
                    <MiniStatus label="ACC" value={progress.approved} />
                    <MiniStatus label="Reject" value={progress.rejected} />
                </div>
            </div>
        </div>
    );
}

function TaskItem({ program, getSchoolName, onDetail }) {
    const processStatus = getProgramProcessStatus(program);
    const activePhase = getActivePhaseInfo(program);

    return (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
            <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-[#0AC4E0]">
                    <UploadCloud size={18} />
                </div>

                <div className="min-w-0">
                    <p className="line-clamp-1 text-[12px] font-black text-slate-800">
                        {program.nama_program}
                    </p>

                    <p className="mt-1 truncate text-[10px] font-semibold text-slate-400">
                        {getSchoolName(program)} · {activePhase.label}
                    </p>

                    <div className="mt-2">
                        <StatusBadge status={processStatus} />
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={() => onDetail(program)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 transition hover:border-[#0AC4E0] hover:text-[#0AC4E0]"
                title="Lihat detail program"
            >
                <ArrowRight size={15} />
            </button>
        </div>
    );
}

function WorkflowStep({ number, text }) {
    return (
        <div className="flex items-center gap-3 rounded-2xl bg-white/80 p-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0AC4E0] text-[10px] font-black text-white">
                {number}
            </div>

            <p className="text-[11px] font-bold text-slate-600">{text}</p>
        </div>
    );
}

function DashboardVendorPage({
    title = "Dashboard Vendor",
    listPath = "/vendor/program",
    detailPathPrefix = "/vendor/program/detail",
}) {
    const navigate = useNavigate();

    const [programs, setPrograms] = useState([]);
    const [schools, setSchools] = useState([]);
    const [hos, setHos] = useState([]);
    const [currentVendor, setCurrentVendor] = useState(null);

    const [loading, setLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState("");

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const getTokenPayload = () => {
        const token = localStorage.getItem("token");
        if (!token) return null;

        try {
            return jwtDecode(token);
        } catch {
            return null;
        }
    };

    const resolveCurrentVendor = (vendorList, payload) => {
        if (!payload) return null;

        const userId = String(payload.sub || payload.id_user || payload.id || "");
        const email = String(payload.email || "").toLowerCase().trim();
        const name = String(payload.nama || "").toLowerCase().trim();

        return (
            vendorList.find(
                (vendor) =>
                    String(vendor.id_user || "") === userId ||
                    String(vendor.user_id || "") === userId ||
                    String(vendor.id_vendor || "") === userId,
            ) ||
            vendorList.find(
                (vendor) =>
                    email &&
                    String(vendor.email || vendor.email_vendor || "")
                        .toLowerCase()
                        .trim() === email,
            ) ||
            vendorList.find(
                (vendor) =>
                    name &&
                    String(vendor.nama_vendor || "").toLowerCase().trim() === name,
            ) ||
            null
        );
    };

    const fetchDashboardData = async () => {
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            const payload = getTokenPayload();

            const [resProgram, resSekolah, resHo, resVendor] = await Promise.all([
                fetch(`${API_BASE_URL}/program`, { headers }),
                fetch(`${API_BASE_URL}/sekolah`, { headers }),
                fetch(`${API_BASE_URL}/users/ho`, { headers }),
                fetch(`${API_BASE_URL}/vendor`, { headers }),
            ]);

            const dataProgram = normalizeArray(await resProgram.json());
            const dataSekolah = normalizeArray(await resSekolah.json());
            const dataHo = normalizeArray(await resHo.json());
            const dataVendor = normalizeArray(await resVendor.json());

            const vendor = resolveCurrentVendor(dataVendor, payload);

            const vendorPrograms = vendor
                ? dataProgram.filter((program) =>
                    getProgramVendorIds(program).includes(
                        String(vendor.id_vendor),
                    ),
                )
                : [];

            const detailedPrograms = await Promise.all(
                vendorPrograms.map(async (program) => {
                    try {
                        const response = await fetch(
                            `${API_BASE_URL}/program/${program.id_program}`,
                            { headers },
                        );

                        const result = await response.json();

                        return result?.data || result || program;
                    } catch {
                        return program;
                    }
                }),
            );

            setPrograms(detailedPrograms);
            setSchools(dataSekolah);
            setHos(dataHo);
            setCurrentVendor(vendor);
        } catch (error) {
            console.error("Gagal mengambil dashboard vendor:", error);
            toast.error("Gagal mengambil dashboard vendor");
        } finally {
            setLoading(false);
        }
    };

    const getSchoolName = (program) => {
        const school = schools.find(
            (item) => String(item.id_sekolah) === String(program?.id_sekolah),
        );

        return (
            program?.sekolah?.nama_sekolah ||
            program?.nama_sekolah ||
            school?.nama_sekolah ||
            "-"
        );
    };

    const getHoName = (program) => {
        const ho = hos.find(
            (item) =>
                String(item.id_user || item.id) === String(program?.dibuat_oleh),
        );

        return program?.ho?.nama || program?.created_by?.nama || ho?.nama || "-";
    };

    const goToDetail = (program) => {
        navigate(`${detailPathPrefix}/${program.id_program}`);
    };

    const filteredPrograms = useMemo(() => {
        const keyword = searchKeyword.toLowerCase().trim();

        if (!keyword) return programs;

        return programs.filter((program) => {
            const progressStatus = getProgramProcessStatus(program).label;
            const activePhase = getActivePhaseInfo(program).label;

            return [
                program.nama_program,
                program.kode_program,
                program.tahun,
                getSchoolName(program),
                getHoName(program),
                progressStatus,
                activePhase,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(keyword);
        });
    }, [programs, searchKeyword, schools, hos]);

    const stats = useMemo(() => {
        const allRequirements = programs.flatMap(getProgramRequirements);

        const waitingUpload = allRequirements.filter(
            (item) => getRequirementStatus(item) === "WAITING_UPLOAD",
        ).length;

        const waitingHo = allRequirements.filter(
            (item) => getRequirementStatus(item) === "WAITING_HO",
        ).length;

        const approved = allRequirements.filter(
            (item) => getRequirementStatus(item) === "APPROVED",
        ).length;

        return {
            totalProgram: programs.length,
            waitingUpload,
            waitingHo,
            approved,
        };
    }, [programs]);

    const priorityTasks = useMemo(() => {
        return programs
            .filter((program) => getProgramProgress(program).actionable > 0)
            .sort(
                (a, b) =>
                    getProgramProgress(b).actionable -
                    getProgramProgress(a).actionable,
            )
            .slice(0, 3);
    }, [programs]);

    const visiblePrograms = filteredPrograms.slice(0, 4);
    const hiddenCount = Math.max(filteredPrograms.length - visiblePrograms.length, 0);

    const vendorEmail = getVendorEmail(currentVendor);
    const vendorInitials = getVendorInitials(currentVendor);

    if (loading) {
        return (
            <PageWrapper className="flex h-screen items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-11 w-11 animate-spin rounded-full border-4 border-[#0AC4E0] border-t-transparent" />

                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                        Loading Dashboard Vendor...
                    </p>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper className="flex h-screen overflow-hidden bg-[#F6F8FB] !p-0 font-sans text-slate-800">
            <Sidebar />

            <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
                <header className="relative shrink-0 overflow-hidden border-b border-slate-800 bg-slate-950 px-7 py-5 text-white">
                    <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#0AC4E0]/20 blur-3xl" />
                    <div className="pointer-events-none absolute left-1/3 top-10 h-28 w-28 rounded-full bg-white/5 blur-2xl" />

                    <div className="relative flex items-center justify-between gap-6">
                        <div className="flex min-w-0 items-center gap-4">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[1.4rem] border border-white/15 bg-white/10 text-lg font-black text-white shadow-[0_18px_45px_rgba(0,0,0,0.25)]">
                                {vendorInitials}
                            </div>

                            <div className="min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-[0.28em] text-cyan-300">
                                    Vendor Workspace
                                </p>

                                <h1 className="mt-1 truncate text-[25px] font-black tracking-tight text-white">
                                    {currentVendor?.nama_vendor || title}
                                </h1>

                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-white/90">
                                        <BadgeCheck size={12} className="text-cyan-300" />
                                        {currentVendor?.status || "Bermitra"}
                                    </span>

                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-white/90">
                                        <BriefcaseBusiness size={12} className="text-cyan-300" />
                                        {currentVendor?.pilar || "Bidang Vendor"}
                                    </span>

                                    <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[9px] font-bold text-white/80">
                                        <Mail size={12} className="shrink-0 text-cyan-300" />
                                        <span className="max-w-[220px] truncate">{vendorEmail}</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                            <Button
                                text="Program"
                                icon={<FolderOpen size={15} />}
                                onClick={() => navigate(listPath)}
                                className="!rounded-xl !border !border-white/10 !bg-white/10 !px-5 !py-2.5 !text-xs !font-bold !text-white !shadow-none hover:!bg-white/20"
                            />

                            <Button
                                text="Refresh"
                                icon={<RefreshCcw size={15} />}
                                onClick={fetchDashboardData}
                                className="!rounded-xl !bg-[#0AC4E0] !px-5 !py-2.5 !text-xs !font-bold !text-white hover:!bg-cyan-400"
                            />
                        </div>
                    </div>
                </header>

                <section className="grid min-h-0 flex-1 grid-cols-12 gap-4 overflow-hidden px-7 py-5">
                    <div className="col-span-12 flex min-h-0 flex-col gap-4 xl:col-span-8">
                        <div className="grid shrink-0 grid-cols-4 gap-3">
                            <StatCard
                                label="Total Program"
                                value={stats.totalProgram}
                                helper="Ditugaskan"
                                icon={<Layers3 size={21} />}
                            />

                            <StatCard
                                label="Perlu Upload"
                                value={stats.waitingUpload}
                                helper="Belum dikirim"
                                icon={<UploadCloud size={21} />}
                            />

                            <StatCard
                                label="Menunggu HO"
                                value={stats.waitingHo}
                                helper="Validasi"
                                icon={<FileClock size={21} />}
                                tone="amber"
                            />

                            <StatCard
                                label="Approved"
                                value={stats.approved}
                                helper="Disetujui"
                                icon={<CheckCircle2 size={21} />}
                                tone="emerald"
                            />
                        </div>

                        <div className="shrink-0 rounded-[1.45rem] border border-slate-100 bg-white p-4 shadow-sm">
                            <div className="relative">
                                <Search
                                    size={17}
                                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <Input
                                    value={searchKeyword}
                                    onChange={(event) =>
                                        setSearchKeyword(event.target.value)
                                    }
                                    placeholder="Cari program, sekolah, HO, status, fase, atau tahun."
                                    className="!rounded-xl !border-none !bg-slate-50 !py-3 !pl-11 !text-sm !font-semibold"
                                />
                            </div>
                        </div>

                        <div className="min-h-0 flex-1 rounded-[1.8rem] border border-slate-100 bg-white p-4 shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                                        Program Vendor
                                    </p>

                                    <h2 className="mt-1 text-[17px] font-black text-slate-800">
                                        Ringkasan Program Berjalan
                                    </h2>
                                </div>

                                <div className="flex items-center gap-2">
                                    {hiddenCount > 0 && (
                                        <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-amber-600">
                                            +{hiddenCount} lainnya
                                        </span>
                                    )}

                                    <span className="rounded-full border border-cyan-100 bg-cyan-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#0AC4E0]">
                                        {filteredPrograms.length} Data
                                    </span>
                                </div>
                            </div>

                            {visiblePrograms.length > 0 ? (
                                <div className="grid h-[calc(100%-60px)] grid-cols-2 gap-3">
                                    {visiblePrograms.map((program) => (
                                        <ProgramCard
                                            key={program.id_program}
                                            program={program}
                                            getSchoolName={getSchoolName}
                                            getHoName={getHoName}
                                            onDetail={goToDetail}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex h-[calc(100%-60px)] flex-col items-center justify-center rounded-[1.5rem] bg-slate-50 text-center">
                                    <BriefcaseBusiness
                                        size={48}
                                        className="text-slate-300"
                                    />

                                    <p className="mt-4 text-sm font-black text-slate-700">
                                        Program tidak ditemukan
                                    </p>

                                    <p className="mt-2 max-w-sm text-xs font-semibold leading-6 text-slate-400">
                                        Belum ada program yang cocok dengan kata kunci
                                        atau belum ada program yang ditugaskan ke vendor ini.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <aside className="col-span-12 flex min-h-0 flex-col gap-4 xl:col-span-4">
                        <div className="shrink-0 overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-[0_22px_70px_rgba(15,23,42,0.08)]">
                            <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-5 text-white">
                                <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-[#0AC4E0]/25 blur-3xl" />

                                <div className="relative flex items-center gap-4">
                                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[1.55rem] border border-white/15 bg-white/10 text-xl font-black text-white shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
                                        {vendorInitials}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-[9px] font-black uppercase tracking-[0.24em] text-cyan-300">
                                            Identitas Vendor
                                        </p>

                                        <h2 className="mt-1 line-clamp-2 text-[19px] font-black leading-tight text-white">
                                            {currentVendor?.nama_vendor || "Vendor"}
                                        </h2>

                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-white/90">
                                                {currentVendor?.pilar || "Bidang Vendor"}
                                            </span>

                                            <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-emerald-200">
                                                {currentVendor?.status || "Bermitra"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 p-4">
                                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                    <div className="flex items-center gap-2 text-[#0AC4E0]">
                                        <UserCheck size={14} />
                                        <p className="text-[8px] font-black uppercase tracking-widest">
                                            PJ Utama
                                        </p>
                                    </div>
                                    <p className="mt-2 line-clamp-1 text-[11px] font-black text-slate-700">
                                        {currentVendor?.pj_1 || "-"}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                    <div className="flex items-center gap-2 text-[#0AC4E0]">
                                        <Phone size={14} />
                                        <p className="text-[8px] font-black uppercase tracking-widest">
                                            Kontak
                                        </p>
                                    </div>
                                    <p className="mt-2 line-clamp-1 text-[11px] font-black text-slate-700">
                                        {currentVendor?.telp_pj_1 || "-"}
                                    </p>
                                </div>

                                <div className="col-span-2 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                    <div className="flex items-center gap-2 text-[#0AC4E0]">
                                        <Mail size={14} />
                                        <p className="text-[8px] font-black uppercase tracking-widest">
                                            Email Login
                                        </p>
                                    </div>
                                    <p className="mt-2 truncate text-[11px] font-black lowercase text-slate-700">
                                        {vendorEmail}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                    <div className="flex items-center gap-2 text-[#0AC4E0]">
                                        <BriefcaseBusiness size={14} />
                                        <p className="text-[8px] font-black uppercase tracking-widest">
                                            No. Register
                                        </p>
                                    </div>
                                    <p className="mt-2 truncate text-[11px] font-black text-slate-700">
                                        {currentVendor?.no_register || "-"}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                    <div className="flex items-center gap-2 text-[#0AC4E0]">
                                        <MapPin size={14} />
                                        <p className="text-[8px] font-black uppercase tracking-widest">
                                            Lokasi
                                        </p>
                                    </div>
                                    <p className="mt-2 line-clamp-1 text-[11px] font-black text-slate-700">
                                        {currentVendor?.alamat || "-"}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 bg-cyan-50/60 px-4 py-3">
                                <p className="text-[10px] font-semibold leading-5 text-slate-500">
                                    Fokus pada upload Termin Luar dan Termin Dalam sesuai
                                    fase yang sedang terbuka.
                                </p>
                            </div>
                        </div>

                        <div className="min-h-0 flex-1 rounded-[1.8rem] border border-slate-100 bg-white p-4 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                                        Prioritas Vendor
                                    </p>

                                    <h2 className="mt-1 text-[17px] font-black text-slate-800">
                                        Tugas Fase Aktif
                                    </h2>
                                </div>

                                <Clock3 size={20} className="text-[#0AC4E0]" />
                            </div>

                            {priorityTasks.length > 0 ? (
                                <div className="space-y-3">
                                    {priorityTasks.map((program) => (
                                        <TaskItem
                                            key={program.id_program}
                                            program={program}
                                            getSchoolName={getSchoolName}
                                            onDetail={goToDetail}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex h-[calc(100%-58px)] flex-col items-center justify-center rounded-2xl bg-slate-50 px-5 text-center">
                                    <CheckCircle2
                                        size={36}
                                        className="text-emerald-500"
                                    />

                                    <p className="mt-4 text-sm font-black text-slate-700">
                                        Tidak ada tugas aktif
                                    </p>

                                    <p className="mt-2 text-xs font-semibold leading-6 text-slate-400">
                                        Semua bukti sudah diunggah, disetujui, atau
                                        sedang menunggu validasi HO.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="shrink-0 rounded-[1.8rem] border border-cyan-100 bg-cyan-50/70 p-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0AC4E0]">
                                Alur Kerja Vendor
                            </p>

                            <div className="mt-3 grid grid-cols-2 gap-2">
                                <WorkflowStep number="01" text="Buka program berjalan" />
                                <WorkflowStep number="02" text="Pilih fase terbuka" />
                                <WorkflowStep number="03" text="Upload bukti" />
                                <WorkflowStep number="04" text="Tunggu validasi HO" />
                            </div>
                        </div>
                    </aside>
                </section>
            </main>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                        html,
                        body,
                        #root {
                            height: 100%;
                            overflow: hidden;
                        }

                        .line-clamp-1 {
                            display: -webkit-box;
                            -webkit-line-clamp: 1;
                            -webkit-box-orient: vertical;
                            overflow: hidden;
                        }

                        .line-clamp-2 {
                            display: -webkit-box;
                            -webkit-line-clamp: 2;
                            -webkit-box-orient: vertical;
                            overflow: hidden;
                        }
                    `,
                }}
            />
        </PageWrapper>
    );
}

export default DashboardVendorPage;
