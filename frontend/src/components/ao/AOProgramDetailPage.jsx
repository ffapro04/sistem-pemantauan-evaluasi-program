/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
    ArrowLeft,
    Calendar,
    RefreshCcw,
    FileText,
    FolderOpen,
    CheckCircle2,
    XCircle,
    Clock,
    UploadCloud,
    AlertTriangle,
    Eye,
    Lock,
    MessageSquare,
    Star,
    UserCheck,
} from "lucide-react";

import {
    Sidebar,
    PageWrapper,
    Button,
} from "../common";
import { getAuthToken } from "../../utils/authSession";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "";

const STATUS_STYLE = {
    APPROVED: "border-emerald-100 bg-emerald-50 text-emerald-600",
    WAITING_AO: "border-sky-100 bg-sky-50 text-sky-600",
    WAITING_HO: "border-amber-100 bg-amber-50 text-amber-600",
    WAITING_UPLOAD: "border-slate-100 bg-slate-50 text-slate-400",
    REJECTED_AO: "border-orange-100 bg-orange-50 text-orange-600",
    REJECTED_HO: "border-red-100 bg-red-50 text-red-500",
    REJECTED: "border-red-100 bg-red-50 text-red-500",
    LOCKED: "border-slate-100 bg-slate-50 text-slate-300",
};

const STATUS_LABEL = {
    APPROVED: "Disetujui HO",
    WAITING_AO: "Menunggu Review AO",
    WAITING_HO: "Diteruskan ke HO",
    WAITING_UPLOAD: "Belum Upload",
    REJECTED_AO: "Ditolak AO",
    REJECTED_HO: "Ditolak HO",
    REJECTED: "Ditolak",
    LOCKED: "Terkunci",
};

function safeArray(...values) {
    return values.find((value) => Array.isArray(value)) || [];
}

function normalizeMeetings(kegiatan = {}) {
    return safeArray(
        kegiatan.pertemuan,
        kegiatan.meetings,
        kegiatan.t_kegiatan_pertemuan,
    ).map((item, index) => ({
        id: item.id_pertemuan || item.id || index,
        title:
            item.nama_pertemuan ||
            item.nama ||
            item.title ||
            `Pertemuan ${index + 1}`,
        description: item.deskripsi || item.description || "",
        startDate: item.tanggal_mulai || item.start_date || null,
        endDate: item.tanggal_selesai || item.end_date || null,
    }));
}

function getRatingStats(kegiatan = {}) {
    const ratings = safeArray(kegiatan.ratings, kegiatan.rating_items);
    const total = ratings.length;
    const average = total
        ? ratings.reduce((sum, item) => sum + Number(item.rating || 0), 0) / total
        : Number(kegiatan.guru_rating || 0);

    return {
        total,
        average: average ? Number(average.toFixed(2)) : 0,
        guruCount: ratings.filter((item) => String(item.rater_type || "").toUpperCase() === "GURU").length,
        vendorCount: ratings.filter((item) => String(item.rater_type || "").toUpperCase() === "VENDOR").length,
    };
}

async function safeJson(response) {
    try {
        return await response.json();
    } catch {
        return {};
    }
}

function getFileUrl(file) {
    if (!file) return null;

    const value = String(file);

    if (value.startsWith("http")) return value;
    if (value.startsWith("/uploads")) return `${API_BASE_URL}${value}`;

    const lower = value.toLowerCase();

    if (
        value.startsWith("MOU-") ||
        value.startsWith("MOU-EDIT-") ||
        lower.includes("mou")
    ) {
        return `${API_BASE_URL}/uploads/mou/${value}`;
    }

    return `${API_BASE_URL}/uploads/dokumentasi/${value}`;
}

function getRequirementFile(requirement) {
    return (
        requirement?.file ||
        requirement?.file_url ||
        requirement?.file_path ||
        requirement?.path ||
        requirement?.dokumen ||
        requirement?.dokumen_url ||
        requirement?.bukti ||
        requirement?.bukti_url ||
        null
    );
}

function getRequirementStatus(requirement) {
    const currentStatus = String(requirement?.status || "").toUpperCase();

    if (currentStatus === "APPROVED") return "APPROVED";
    if (currentStatus === "WAITING_AO") return "WAITING_AO";
    if (currentStatus === "WAITING_HO") return "WAITING_HO";
    if (currentStatus === "WAITING_UPLOAD") return "WAITING_UPLOAD";
    if (currentStatus === "REJECTED_AO") return "REJECTED_AO";
    if (currentStatus === "REJECTED_HO") return "REJECTED_HO";
    if (currentStatus === "REJECTED") return "REJECTED";

    if (getRequirementFile(requirement)) return "WAITING_AO";

    return "WAITING_UPLOAD";
}

function getRequirementName(requirement, index) {
    return (
        requirement?.nama ||
        requirement?.name ||
        requirement?.nama_persyaratan ||
        `Bukti ${index + 1}`
    );
}

function getRequirementId(requirement) {
    return (
        requirement?.id_persyaratan ||
        requirement?.id_persyaratan_termin ||
        requirement?.id_persyaratan_kegiatan ||
        requirement?.id ||
        null
    );
}

function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-widest ${STATUS_STYLE[status] || STATUS_STYLE.WAITING_UPLOAD}`}
        >
            {STATUS_LABEL[status] || status}
        </span>
    );
}

function AOMetric({ label, value, tone = "cyan" }) {
    const toneClass =
        tone === "sky"
            ? "text-sky-600"
            : tone === "amber"
                ? "text-amber-600"
                : tone === "emerald"
                    ? "text-emerald-600"
                    : tone === "red"
                        ? "text-red-500"
                        : "text-[#0AC4E0]";

    return (
        <div className="rounded-[1.2rem] border border-slate-100 bg-white px-4 py-3 shadow-sm">
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                {label}
            </p>

            <p className={`mt-1 text-2xl font-black ${toneClass}`}>
                {value}
            </p>
        </div>
    );
}

function AOProgramDetailPage({
    backPath = "/ao/program",
}) {
    const { id } = useParams();
    const navigate = useNavigate();

    const [program, setProgram] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processingKey, setProcessingKey] = useState(null);
    const [commentModal, setCommentModal] = useState(null);
    const [aoCommentText, setAoCommentText] = useState("");
    const [commentLoading, setCommentLoading] = useState(false);

    const fetchDetail = async () => {
        setLoading(true);

        try {
            const token = getAuthToken();

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await fetch(`${API_BASE_URL}/program/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = await safeJson(response);

            if (!response.ok) {
                throw new Error(result?.message || "Gagal memuat detail program AO");
            }

            setProgram(result?.data || result);
        } catch (error) {
            console.error("Gagal memuat detail program AO:", error);
            toast.error(error.message || "Gagal memuat detail program AO");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [id]);

    const monitoringRows = useMemo(() => {
        const fases = safeArray(program?.fases);

        return fases.flatMap((fase, faseIndex) => {
            const phaseName =
                fase?.nama_fase ||
                fase?.nama ||
                `Periode ${faseIndex + 1}`;

            const terminList = safeArray(
                fase?.termin,
                fase?.termins,
                fase?.t_termin,
            );

            const kegiatanList = safeArray(
                fase?.kegiatans,
                fase?.kegiatan,
                fase?.t_kegiatans,
            );

            const terminRows = terminList.map((termin, terminIndex) => {
                const requirements = safeArray(
                    termin?.persyaratan,
                    termin?.persyaratan_termin,
                    termin?.requirements,
                    termin?.t_persyaratan_termin,
                );

                return {
                    id: `termin-${termin?.id_termin || terminIndex}`,
                    type: "termin",
                    parentType: "termin",
                    parentId: termin?.id_termin || termin?.id || null,
                    phaseName,
                    title:
                        termin?.nama_termin ||
                        termin?.nama ||
                        `Administrasi Pembuka ${terminIndex + 1}`,
                    subtitle: "Administrasi Pembuka Periode",
                    description:
                        termin?.deskripsi ||
                        "Bukti administratif pembuka periode sebelum aktivitas berjalan.",
                    requirements,
                };
            });

            const kegiatanRows = kegiatanList.map((kegiatan, kegiatanIndex) => {
                const requirements = safeArray(
                    kegiatan?.persyaratan,
                    kegiatan?.persyaratan_kegiatan,
                    kegiatan?.requirements,
                    kegiatan?.t_persyaratan_kegiatan,
                );
                const meetings = normalizeMeetings(kegiatan);
                const ratingStats = getRatingStats(kegiatan);

                return {
                    id: `kegiatan-${kegiatan?.id_kegiatans || kegiatanIndex}`,
                    type: "kegiatan",
                    parentType: "kegiatan",
                    parentId:
                        kegiatan?.id_kegiatans ||
                        kegiatan?.id_kegiatan ||
                        kegiatan?.id ||
                        null,
                    phaseName,
                    title:
                        kegiatan?.nama_kegiatans ||
                        kegiatan?.nama_kegiatan ||
                        kegiatan?.nama ||
                        `Aktivitas ${kegiatanIndex + 1}`,
                    subtitle: "Aktivitas Kegiatan",
                    description:
                        kegiatan?.deskripsi ||
                        "Bukti pelaksanaan aktivitas yang perlu direview AO.",
                    tanggalMulai: kegiatan?.tanggal_mulai || null,
                    tanggalSelesai: kegiatan?.tanggal_selesai || null,
                    meetings,
                    ratingStats,
                    requirements,
                };
            });

            return [...terminRows, ...kegiatanRows];
        });
    }, [program]);

    const allRequirements = useMemo(() => {
        return monitoringRows.flatMap((row) =>
            row.requirements.map((requirement, index) => ({
                row,
                requirement,
                index,
                status: getRequirementStatus(requirement),
            })),
        );
    }, [monitoringRows]);

    const progress = useMemo(() => {
        const waitingUpload = allRequirements.filter(
            (item) => item.status === "WAITING_UPLOAD",
        ).length;

        const waitingAo = allRequirements.filter(
            (item) => item.status === "WAITING_AO",
        ).length;

        const waitingHo = allRequirements.filter(
            (item) => item.status === "WAITING_HO",
        ).length;

        const approved = allRequirements.filter(
            (item) => item.status === "APPROVED",
        ).length;

        const rejected = allRequirements.filter((item) =>
            ["REJECTED", "REJECTED_AO", "REJECTED_HO"].includes(item.status),
        ).length;

        return {
            waitingUpload,
            waitingAo,
            waitingHo,
            approved,
            rejected,
            total: allRequirements.length,
        };
    }, [allRequirements]);

    const openFile = (file) => {
        const url = getFileUrl(file);

        if (!url) {
            toast.info("File belum tersedia.");
            return;
        }

        window.open(url, "_blank", "noopener,noreferrer");
    };

    const sendAoComment = async ({ row, requirement, action, reason }) => {
        if (row.parentType !== "kegiatan" || !row.parentId) return;

        try {
            const token = getAuthToken();

            await fetch(`${API_BASE_URL}/program/kegiatan/${row.parentId}/comment`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id_persyaratan: getRequirementId(requirement),
                    comment_type: "AO_REVIEW",
                    comment_text:
                        reason ||
                        (action === "approve"
                            ? "Bukti sudah sesuai dengan kondisi lapangan dan diteruskan ke Head Office."
                            : "Bukti belum sesuai dengan kondisi lapangan dan perlu upload ulang."),
                }),
            });
        } catch (error) {
            console.error("Gagal menyimpan komentar AO:", error);
        }
    };

    const openAoCommentModal = (row, requirement) => {
        if (row.parentType !== "kegiatan" || !row.parentId) {
            toast.info("Komentar AO saat ini tersedia untuk aktivitas kegiatan.");
            return;
        }

        setCommentModal({
            row,
            requirement,
        });
        setAoCommentText("");
    };

    const closeAoCommentModal = () => {
        setCommentModal(null);
        setAoCommentText("");
    };

    const submitAoComment = async () => {
        if (!commentModal?.row?.parentId) {
            toast.error("Data aktivitas tidak ditemukan.");
            return;
        }

        if (!aoCommentText.trim()) {
            toast.error("Komentar AO wajib diisi.");
            return;
        }

        setCommentLoading(true);

        try {
            const token = getAuthToken();

            const response = await fetch(
                `${API_BASE_URL}/program/kegiatan/${commentModal.row.parentId}/comment`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        id_persyaratan: getRequirementId(commentModal.requirement),
                        comment_type: "AO_REVIEW",
                        comment_text: aoCommentText.trim(),
                    }),
                },
            );

            const result = await safeJson(response);

            if (!response.ok) {
                throw new Error(result?.message || "Gagal menyimpan komentar AO");
            }

            toast.success("Komentar AO berhasil disimpan.");
            closeAoCommentModal();
        } catch (error) {
            console.error("Gagal menyimpan komentar AO:", error);
            toast.error(error.message || "Gagal menyimpan komentar AO");
        } finally {
            setCommentLoading(false);
        }
    };

    const updateRequirementByAo = async ({ row, requirement, action }) => {
        const requirementId = getRequirementId(requirement);
        const status = getRequirementStatus(requirement);

        if (!requirementId) {
            toast.error("ID persyaratan tidak ditemukan.");
            return;
        }

        if (status !== "WAITING_AO") {
            toast.info("Bukti ini belum berada pada status menunggu review AO.");
            return;
        }

        let reason = "";

        if (action === "reject") {
            reason = window.prompt(
                "Masukkan alasan penolakan AO:",
                "Bukti belum sesuai dengan kondisi lapangan, mohon upload ulang.",
            );

            if (reason === null) return;
        }

        const token = getAuthToken();

        const endpointBase =
            row.parentType === "termin"
                ? `${API_BASE_URL}/program/persyaratan-termin/${requirementId}`
                : `${API_BASE_URL}/program/persyaratan-kegiatan/${requirementId}`;

        const endpoint =
            action === "approve"
                ? `${endpointBase}/ao-approve`
                : `${endpointBase}/ao-reject`;

        const processKey = `${row.id}-${requirementId}-${action}`;
        setProcessingKey(processKey);

        try {
            const response = await fetch(endpoint, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body:
                    action === "reject"
                        ? JSON.stringify({
                            alasan: reason,
                            reason,
                            komentar: reason,
                        })
                        : JSON.stringify({}),
            });

            const result = await safeJson(response);

            if (!response.ok) {
                throw new Error(result?.message || "Gagal memproses review AO");
            }

            await sendAoComment({ row, requirement, action, reason });

            toast.success(
                action === "approve"
                    ? "Bukti disetujui AO dan diteruskan ke HO."
                    : "Bukti ditolak AO dan dikembalikan ke vendor.",
            );

            await fetchDetail();
        } catch (error) {
            console.error("Gagal memproses review AO:", error);
            toast.error(error.message || "Gagal memproses review AO");
        } finally {
            setProcessingKey(null);
        }
    };

    if (loading) {
        return (
            <PageWrapper className="flex h-screen items-center justify-center bg-[#F6F8FB]">
                <div className="text-center">
                    <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-[#0AC4E0] border-t-transparent" />
                    <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Memuat detail program AO...
                    </p>
                </div>
            </PageWrapper>
        );
    }

    if (!program) {
        return (
            <PageWrapper className="flex h-screen items-center justify-center bg-[#F6F8FB]">
                <div className="rounded-[2rem] border border-slate-100 bg-white px-8 py-7 text-center shadow-sm">
                    <AlertTriangle className="mx-auto text-amber-500" size={34} />
                    <h2 className="mt-4 text-lg font-black text-slate-900">
                        Program tidak ditemukan
                    </h2>
                    <button
                        type="button"
                        onClick={() => navigate(backPath)}
                        className="mt-5 rounded-2xl bg-slate-950 px-5 py-3 text-xs font-black uppercase tracking-widest text-white"
                    >
                        Kembali
                    </button>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper className="flex h-screen overflow-hidden bg-[#F6F8FB] !p-0 font-sans text-slate-800">
            <Sidebar />

            <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
                <header className="shrink-0 border-b border-slate-200 bg-white px-7 py-5">
                    <div className="flex items-center justify-between gap-5">
                        <div className="flex min-w-0 items-center gap-4">
                            <button
                                type="button"
                                onClick={() => navigate(backPath)}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-slate-500 hover:text-[#0AC4E0]"
                            >
                                <ArrowLeft size={17} />
                            </button>

                            <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0AC4E0]">
                                    Area Officer Review
                                </p>

                                <h1 className="mt-1 truncate text-[26px] font-black tracking-tight text-slate-900">
                                    {program.nama_program || "Detail Program"}
                                </h1>

                                <p className="mt-1 text-xs font-semibold text-slate-400">
                                    Review bukti vendor sebelum diteruskan ke Head Office.
                                </p>
                            </div>
                        </div>

                        <Button
                            text="Refresh"
                            icon={<RefreshCcw size={15} />}
                            onClick={fetchDetail}
                            className="!rounded-xl !bg-white !px-5 !py-2.5 !text-xs !font-bold !text-slate-600 !shadow-sm !ring-1 !ring-slate-100 hover:!text-[#0AC4E0]"
                        />
                    </div>
                </header>

                <section className="simple-scroll flex-1 overflow-y-auto px-7 py-6">
                    <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
                        <AOMetric label="Total Bukti" value={progress.total} />
                        <AOMetric label="Belum Upload" value={progress.waitingUpload} />
                        <AOMetric label="Review AO" value={progress.waitingAo} tone="sky" />
                        <AOMetric label="Keputusan HO" value={progress.waitingHo} tone="amber" />
                        <AOMetric label="Approved" value={progress.approved} tone="emerald" />
                        <AOMetric label="Rejected" value={progress.rejected} tone="red" />
                    </div>

                    <div className="space-y-5">
                        {monitoringRows.length === 0 ? (
                            <div className="rounded-[1.6rem] border border-dashed border-slate-200 bg-white px-8 py-12 text-center">
                                <FolderOpen className="mx-auto text-slate-200" size={42} />
                                <p className="mt-4 text-sm font-black text-slate-700">
                                    Belum ada periode atau bukti pada program ini.
                                </p>
                            </div>
                        ) : (
                            monitoringRows.map((row) => (
                                <section
                                    key={row.id}
                                    className="overflow-hidden rounded-[1.6rem] border border-slate-100 bg-white shadow-sm"
                                >
                                    <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-[#0AC4E0]">
                                                    {row.phaseName} · {row.subtitle}
                                                </p>

                                                <h2 className="mt-1 text-[18px] font-black text-slate-900">
                                                    {row.title}
                                                </h2>

                                                <p className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-400">
                                                    {row.description}
                                                </p>

                                                {row.type === "kegiatan" && (
                                                    <p className="mt-2 text-[10px] font-bold text-slate-400">
                                                        Tanggal: {row.tanggalMulai || "-"} s/d {row.tanggalSelesai || "-"}
                                                    </p>
                                                )}

                                                {row.type === "kegiatan" && (
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-100 bg-cyan-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-[#0AC4E0]">
                                                            <Calendar size={11} />
                                                            {(row.meetings || []).length} Pertemuan
                                                        </span>
                                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-amber-600">
                                                            <Star size={11} />
                                                            {row.ratingStats?.average || 0}/5 · {row.ratingStats?.total || 0} rating
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <span className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-white px-3 py-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
                                                {row.type === "termin" ? (
                                                    <FileText size={13} />
                                                ) : (
                                                    <FolderOpen size={13} />
                                                )}
                                                {row.type === "termin" ? "Administrasi" : "Aktivitas"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="divide-y divide-slate-100">
                                        {row.requirements.length === 0 ? (
                                            <div className="px-5 py-7 text-center text-xs font-bold text-slate-400">
                                                Belum ada persyaratan upload.
                                            </div>
                                        ) : (
                                            row.requirements.map((requirement, index) => {
                                                const status = getRequirementStatus(requirement);
                                                const file = getRequirementFile(requirement);
                                                const requirementId = getRequirementId(requirement);
                                                const canReview = status === "WAITING_AO";
                                                const processApproveKey = `${row.id}-${requirementId}-approve`;
                                                const processRejectKey = `${row.id}-${requirementId}-reject`;

                                                return (
                                                    <div
                                                        key={`${row.id}-${requirementId || index}`}
                                                        className="grid grid-cols-1 gap-4 px-5 py-4 lg:grid-cols-12 lg:items-center"
                                                    >
                                                        <div className="lg:col-span-4">
                                                            <p className="text-[13px] font-black text-slate-800">
                                                                {getRequirementName(requirement, index)}
                                                            </p>

                                                            <p className="mt-1 text-[10px] font-semibold text-slate-400">
                                                                {requirement?.deskripsi ||
                                                                    requirement?.description ||
                                                                    "Bukti pendukung program."}
                                                            </p>

                                                            {["REJECTED", "REJECTED_AO", "REJECTED_HO"].includes(status) && (
                                                                <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-[10px] font-bold leading-relaxed text-red-500">
                                                                    {requirement?.rejected_reason ||
                                                                        requirement?.alasan ||
                                                                        requirement?.catatan_reject ||
                                                                        "Bukti ditolak. Vendor perlu upload ulang."}
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="lg:col-span-2">
                                                            <StatusBadge status={status} />
                                                        </div>

                                                        <div className="lg:col-span-2">
                                                            {file ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openFile(file)}
                                                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-[#0AC4E0]"
                                                                >
                                                                    <Eye size={13} />
                                                                    Lihat File
                                                                </button>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                                    <UploadCloud size={13} />
                                                                    Belum Ada
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="flex flex-wrap justify-end gap-2 lg:col-span-4">
                                                            <button
                                                                type="button"
                                                                disabled={row.parentType !== "kegiatan" || !file}
                                                                onClick={() => openAoCommentModal(row, requirement)}
                                                                className="inline-flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition hover:border-[#0AC4E0] hover:text-[#0AC4E0] disabled:cursor-not-allowed disabled:opacity-40"
                                                            >
                                                                <MessageSquare size={13} />
                                                                Komentar AO
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={!canReview || processingKey === processRejectKey}
                                                                onClick={() =>
                                                                    updateRequirementByAo({
                                                                        row,
                                                                        requirement,
                                                                        action: "reject",
                                                                    })
                                                                }
                                                                className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                                                            >
                                                                <XCircle size={13} />
                                                                Tolak AO
                                                            </button>

                                                            <button
                                                                type="button"
                                                                disabled={!canReview || processingKey === processApproveKey}
                                                                onClick={() =>
                                                                    updateRequirementByAo({
                                                                        row,
                                                                        requirement,
                                                                        action: "approve",
                                                                    })
                                                                }
                                                                className="inline-flex items-center gap-2 rounded-xl bg-[#0AC4E0] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-[#09AFC8] disabled:cursor-not-allowed disabled:opacity-40"
                                                            >
                                                                <CheckCircle2 size={13} />
                                                                Setujui ke HO
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </section>
                            ))
                        )}
                    </div>
                </section>
                <AOCommentModal
                    commentModal={commentModal}
                    aoCommentText={aoCommentText}
                    setAoCommentText={setAoCommentText}
                    commentLoading={commentLoading}
                    onClose={closeAoCommentModal}
                    onSubmit={submitAoComment}
                />
            </main>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                        .simple-scroll::-webkit-scrollbar {
                            width: 6px;
                        }
                        .simple-scroll::-webkit-scrollbar-track {
                            background: transparent;
                        }
                        .simple-scroll::-webkit-scrollbar-thumb {
                            background: #CBD5E1;
                            border-radius: 999px;
                        }
                    `,
                }}
            />
        </PageWrapper>
    );
}

function AOCommentModal({
    commentModal,
    aoCommentText,
    setAoCommentText,
    commentLoading,
    onClose,
    onSubmit,
}) {
    if (!commentModal) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
            <div className="w-full max-w-[520px] overflow-hidden rounded-[1.7rem] border border-slate-100 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.22)]">
                <div className="border-b border-slate-100 px-6 py-5">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0AC4E0]">
                        Komentar Area Officer
                    </p>

                    <h3 className="mt-1 text-lg font-black text-slate-900">
                        {commentModal?.row?.title || "Aktivitas"}
                    </h3>

                    <p className="mt-1 text-xs font-semibold text-slate-400">
                        {getRequirementName(commentModal?.requirement, 0)}
                    </p>
                </div>

                <div className="px-6 py-5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Catatan Review AO
                    </label>

                    <textarea
                        value={aoCommentText}
                        onChange={(event) => setAoCommentText(event.target.value)}
                        placeholder="Tulis komentar AO terkait kesesuaian bukti dengan kondisi lapangan..."
                        rows={5}
                        className="mt-2 w-full resize-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#0AC4E0]/40 focus:bg-white"
                    />
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={commentLoading}
                        className="rounded-xl border border-slate-100 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition hover:text-slate-800 disabled:opacity-50"
                    >
                        Batal
                    </button>

                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={commentLoading}
                        className="rounded-xl bg-[#0AC4E0] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-[#09AFC8] disabled:opacity-50"
                    >
                        {commentLoading ? "Menyimpan..." : "Simpan Komentar"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AOProgramDetailPage;
