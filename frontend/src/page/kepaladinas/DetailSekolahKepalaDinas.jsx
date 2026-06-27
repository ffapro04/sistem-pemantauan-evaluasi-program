/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
import {
    ArrowLeft,
    Building2,
    CheckCircle2,
    ClipboardCheck,
    FolderKanban,
    Loader2,
    Mail,
    MapPin,
    Phone,
    RefreshCcw,
    School,
    User,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import Sidebar from "../../components/Sidebar";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

function normalizeArray(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.data?.data)) return payload.data.data;
    if (Array.isArray(payload?.program)) return payload.program;
    if (Array.isArray(payload?.programs)) return payload.programs;
    if (Array.isArray(payload?.data?.program)) return payload.data.program;
    if (Array.isArray(payload?.data?.programs)) return payload.data.programs;
    if (Array.isArray(payload?.assessment)) return payload.assessment;
    if (Array.isArray(payload?.assessments)) return payload.assessments;
    if (Array.isArray(payload?.data?.assessment)) return payload.data.assessment;
    if (Array.isArray(payload?.data?.assessments)) return payload.data.assessments;
    return [];
}

function unwrapPayload(payload) {
    return payload?.data || payload;
}

function getSchoolName(school) {
    return school?.nama_sekolah || school?.nama || "Nama sekolah belum tersedia";
}

function getSchoolAddress(school) {
    return (
        school?.alamat ||
        school?.alamat_sekolah ||
        school?.address ||
        "Alamat belum tersedia"
    );
}

function getSchoolLevel(school) {
    return (
        school?.jenjang ||
        school?.jenjang_sekolah ||
        school?.tingkat ||
        school?.level ||
        "Sekolah"
    );
}

function getWilayahName(school) {
    return (
        school?.wilayah?.nama_wilayah?.split("/")?.filter(Boolean)?.pop() ||
        school?.nama_wilayah ||
        school?.wilayah_nama ||
        school?.wilayah?.nama ||
        "Wilayah"
    );
}

function formatDate(value) {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function getRequirementStatus(requirement) {
    const status = String(requirement?.status || "").toUpperCase();

    if (status === "APPROVED") return "APPROVED";
    if (status === "WAITING_AO") return "WAITING_AO";
    if (status === "WAITING_HO") return "WAITING_HO";
    if (status === "WAITING_UPLOAD") return "WAITING_UPLOAD";
    if (status === "REJECTED_AO") return "REJECTED_AO";
    if (status === "REJECTED_HO") return "REJECTED_HO";
    if (status === "REJECTED") return "REJECTED";

    if (requirement?.file_path || requirement?.nama_file || requirement?.file_url) {
        return "WAITING_AO";
    }

    return "WAITING_UPLOAD";
}

function getAllRequirements(program) {
    const periods = Array.isArray(program?.fases) ? program.fases : [];

    return periods.flatMap((period) => {
        const openingRequirements = normalizeArray(
            period?.termin ||
            period?.termins ||
            period?.t_termin,
        ).flatMap((termin) =>
            normalizeArray(
                termin?.persyaratan ||
                termin?.persyaratan_termin ||
                termin?.requirements ||
                termin?.t_persyaratan_termin,
            ),
        );

        const activityRequirements = normalizeArray(
            period?.kegiatans ||
            period?.kegiatan ||
            period?.t_kegiatans,
        ).flatMap((activity) =>
            normalizeArray(
                activity?.persyaratan ||
                activity?.persyaratan_kegiatan ||
                activity?.requirements ||
                activity?.t_persyaratan_kegiatan,
            ),
        );

        return [...openingRequirements, ...activityRequirements];
    });
}

function getProgramProgress(program) {
    const requirements = getAllRequirements(program);
    const total = requirements.length;

    const approved = requirements.filter(
        (item) => getRequirementStatus(item) === "APPROVED",
    ).length;

    const waitingAo = requirements.filter(
        (item) => getRequirementStatus(item) === "WAITING_AO",
    ).length;

    const waitingHo = requirements.filter(
        (item) => getRequirementStatus(item) === "WAITING_HO",
    ).length;

    const rejected = requirements.filter((item) =>
        ["REJECTED", "REJECTED_AO", "REJECTED_HO"].includes(
            getRequirementStatus(item),
        ),
    ).length;

    const waitingUpload = requirements.filter(
        (item) => getRequirementStatus(item) === "WAITING_UPLOAD",
    ).length;

    return {
        total,
        approved,
        waitingAo,
        waitingHo,
        rejected,
        waitingUpload,
        percentage: total ? Math.round((approved / total) * 100) : 0,
    };
}

function getDerivedProgramStatus(program) {
    const progress = getProgramProgress(program);

    if (progress.total > 0 && progress.approved === progress.total) return "Selesai";
    if (progress.rejected > 0) return "Perlu Revisi";
    if (progress.waitingHo > 0) return "Keputusan HO";
    if (progress.waitingAo > 0) return "Review AO";
    if (progress.waitingUpload > 0) return "Perlu Upload";

    return program?.status_program || program?.status || "Berjalan";
}

function StatusBadge({ status }) {
    const normalized = String(status || "Berjalan");
    const lower = normalized.toLowerCase();

    const className = lower.includes("selesai")
        ? "border-emerald-100 bg-emerald-50 text-emerald-600"
        : lower.includes("revisi") || lower.includes("tolak")
            ? "border-red-100 bg-red-50 text-red-500"
            : lower.includes("ao")
                ? "border-sky-100 bg-sky-50 text-sky-600"
                : lower.includes("ho") ||
                    lower.includes("upload") ||
                    lower.includes("approval") ||
                    lower.includes("menunggu")
                    ? "border-amber-100 bg-amber-50 text-amber-600"
                    : "border-cyan-100 bg-cyan-50 text-cyan-600";

    return (
        <span
            className={`inline-flex rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-widest ${className}`}
        >
            {normalized}
        </span>
    );
}

function InfoCard({ icon, label, value }) {
    return (
        <div className="rounded-[1.35rem] border border-slate-100 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-[#0AC4E0]">
                {icon}
            </div>

            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">
                {label}
            </p>

            <p className="mt-2 text-[13px] font-black leading-6 text-slate-800">
                {value || "-"}
            </p>
        </div>
    );
}

function ProgramCard({ program }) {
    const progress = getProgramProgress(program);
    const status = getDerivedProgramStatus(program);

    return (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="line-clamp-2 text-[13px] font-black text-slate-900">
                        {program?.nama_program || "Program"}
                    </p>

                    <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                        Tahun {program?.tahun || "-"} · {progress.percentage}% bukti
                    </p>
                </div>

                <StatusBadge status={status} />
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                <div
                    className="h-full rounded-full bg-[#0AC4E0]"
                    style={{ width: `${progress.percentage}%` }}
                />
            </div>
        </div>
    );
}

export default function DetailSekolahKepalaDinas() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [school, setSchool] = useState(null);
    const [programs, setPrograms] = useState([]);
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDetail = async () => {
        setRefreshing(true);

        try {
            const token = localStorage.getItem("token");

            const headers = token
                ? {
                    Authorization: `Bearer ${token}`,
                }
                : {};

            const fetchJson = async (url) => {
                const response = await fetch(url, { headers });
                const payload = await response.json().catch(() => ({}));

                if (!response.ok) {
                    throw new Error(payload?.message || `Gagal memuat data dari ${url}`);
                }

                return unwrapPayload(payload);
            };

            const [schoolPayload, programPayload, assessmentPayload] =
                await Promise.all([
                    fetchJson(`${API_BASE_URL}/sekolah/${id}`),
                    fetchJson(`${API_BASE_URL}/program/sekolah/${id}`).catch((error) => {
                        console.warn("Gagal memuat program sekolah:", error);
                        return [];
                    }),
                    fetchJson(`${API_BASE_URL}/assessment/sekolah/${id}`).catch((error) => {
                        console.warn("Gagal memuat assessment sekolah:", error);
                        return [];
                    }),
                ]);

            const rawPrograms = normalizeArray(programPayload);

            const detailedPrograms = await Promise.all(
                rawPrograms.map(async (program) => {
                    const programId = program?.id_program || program?.id;

                    if (!programId) return program;

                    try {
                        const detailResponse = await fetch(
                            `${API_BASE_URL}/program/${programId}`,
                            { headers },
                        );

                        const detailPayload = await detailResponse
                            .json()
                            .catch(() => ({}));

                        if (!detailResponse.ok) return program;

                        return unwrapPayload(detailPayload) || program;
                    } catch (error) {
                        console.warn(`Gagal memuat detail program ${programId}:`, error);
                        return program;
                    }
                }),
            );

            const schoolData =
                schoolPayload?.sekolah ||
                schoolPayload?.school ||
                schoolPayload?.data?.sekolah ||
                schoolPayload?.data?.school ||
                schoolPayload;

            setSchool(schoolData);
            setPrograms(detailedPrograms);
            setAssessments(normalizeArray(assessmentPayload));
        } catch (error) {
            console.error("Detail sekolah Kepala Dinas error:", error);
            setSchool(null);
            setPrograms([]);
            setAssessments([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const activePrograms = useMemo(() => {
        return programs.filter((program) => {
            const status = String(getDerivedProgramStatus(program)).toLowerCase();
            return !status.includes("selesai");
        });
    }, [programs]);

    const completedPrograms = useMemo(() => {
        return programs.filter((program) => {
            const status = String(getDerivedProgramStatus(program)).toLowerCase();
            return status.includes("selesai");
        });
    }, [programs]);

    if (loading) {
        return (
            <div className="flex h-screen w-full overflow-hidden bg-[#F6F8FB]">
                <Sidebar />

                <main className="flex flex-1 items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-11 w-11 animate-spin text-[#0AC4E0]" />

                        <p className="text-[10px] font-black uppercase tracking-[0.26em] text-cyan-500/70">
                            Memuat Detail Sekolah...
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <>
            <style>{`
                html, body {
                    background-color: #F6F8FB;
                    font-family: 'Poppins', sans-serif;
                }

                .kadin-scroll::-webkit-scrollbar {
                    width: 6px;
                }

                .kadin-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }

                .kadin-scroll::-webkit-scrollbar-thumb {
                    background: rgba(10, 196, 224, 0.35);
                    border-radius: 999px;
                }

                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>

            <div className="flex min-h-screen w-full bg-[#F6F8FB]">
                <Sidebar />

                <main className="kadin-scroll h-screen flex-1 overflow-y-auto p-6">
                    <header className="mb-6 overflow-hidden rounded-[1.9rem] border border-cyan-100 bg-white p-6 shadow-[0_24px_80px_rgba(10,196,224,0.10)]">
                        <div className="mb-5 flex items-center justify-between gap-4">
                            <button
                                type="button"
                                onClick={() => navigate("/kepaladinas/sekolah")}
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition hover:text-[#0AC4E0]"
                            >
                                <ArrowLeft size={15} />
                                Kembali
                            </button>

                            <button
                                type="button"
                                onClick={fetchDetail}
                                disabled={refreshing}
                                className="inline-flex h-10 items-center gap-2 rounded-2xl bg-[#0AC4E0] px-4 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-cyan-500 disabled:opacity-60"
                            >
                                <RefreshCcw
                                    size={14}
                                    className={refreshing ? "animate-spin" : ""}
                                />
                                Refresh
                            </button>
                        </div>

                        <div className="flex items-start gap-5">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0AC4E0] text-white shadow-[0_16px_34px_rgba(10,196,224,0.25)]">
                                <School size={24} />
                            </div>

                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-500/70">
                                    Detail Sekolah Wilayah
                                </p>

                                <h1 className="mt-2 text-[28px] font-black uppercase leading-tight tracking-[-0.045em] text-slate-900">
                                    {getSchoolName(school)}
                                </h1>

                                <p className="mt-2 max-w-2xl text-[13px] font-semibold leading-6 text-slate-400">
                                    Informasi detail sekolah dan ringkasan program yang
                                    berjalan pada sekolah ini.
                                </p>
                            </div>
                        </div>
                    </header>

                    <section className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                        <InfoCard
                            icon={<Building2 size={20} />}
                            label="Jenjang"
                            value={getSchoolLevel(school)}
                        />

                        <InfoCard
                            icon={<MapPin size={20} />}
                            label="Wilayah"
                            value={getWilayahName(school)}
                        />

                        <InfoCard
                            icon={<FolderKanban size={20} />}
                            label="Program Berjalan"
                            value={activePrograms.length}
                        />

                        <InfoCard
                            icon={<ClipboardCheck size={20} />}
                            label="Assessment"
                            value={assessments.length}
                        />
                    </section>

                    <section className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
                        <div className="rounded-[1.6rem] border border-slate-100 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
                            <h2 className="text-[15px] font-black text-slate-900">
                                Informasi Sekolah
                            </h2>

                            <div className="mt-5 space-y-4">
                                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                                    <MapPin
                                        size={18}
                                        className="mt-0.5 text-[#0AC4E0]"
                                    />

                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Alamat
                                        </p>

                                        <p className="mt-1 text-[12px] font-bold leading-6 text-slate-700">
                                            {getSchoolAddress(school)}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                                        <User
                                            size={18}
                                            className="mt-0.5 text-[#0AC4E0]"
                                        />

                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                Kepala Sekolah
                                            </p>

                                            <p className="mt-1 text-[12px] font-bold leading-6 text-slate-700">
                                                {school?.kepala_sekolah ||
                                                    school?.nama_kepsek ||
                                                    "-"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                                        <Phone
                                            size={18}
                                            className="mt-0.5 text-[#0AC4E0]"
                                        />

                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                Kontak
                                            </p>

                                            <p className="mt-1 text-[12px] font-bold leading-6 text-slate-700">
                                                {school?.no_hp ||
                                                    school?.telepon ||
                                                    school?.phone ||
                                                    "-"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 md:col-span-2">
                                        <Mail
                                            size={18}
                                            className="mt-0.5 text-[#0AC4E0]"
                                        />

                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                Email
                                            </p>

                                            <p className="mt-1 text-[12px] font-bold leading-6 text-slate-700">
                                                {school?.email ||
                                                    school?.email_login ||
                                                    "-"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[1.6rem] border border-slate-100 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-[15px] font-black text-slate-900">
                                        Program Sekolah
                                    </h2>

                                    <p className="mt-1 text-[11px] font-semibold text-slate-400">
                                        {activePrograms.length} berjalan ·{" "}
                                        {completedPrograms.length} selesai
                                    </p>
                                </div>

                                <CheckCircle2 size={20} className="text-[#0AC4E0]" />
                            </div>

                            <div className="mt-5 max-h-[520px] space-y-3 overflow-y-auto pr-1">
                                {programs.length === 0 ? (
                                    <div className="flex h-64 flex-col items-center justify-center text-center">
                                        <FolderKanban
                                            size={34}
                                            className="text-cyan-200"
                                        />

                                        <p className="mt-4 text-[12px] font-black uppercase tracking-widest text-slate-400">
                                            Belum ada program
                                        </p>
                                    </div>
                                ) : (
                                    programs.map((program) => (
                                        <ProgramCard
                                            key={
                                                program?.id_program ||
                                                program?.id ||
                                                program?.nama_program
                                            }
                                            program={program}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}