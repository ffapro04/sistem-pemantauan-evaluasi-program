/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
    AlertTriangle,
    BookOpen,
    Calendar,
    CheckCircle2,
    ChevronRight,
    Clock,
    Eye,
    FileText,
    Layers3,
    Lock,
    MessageSquare,
    RefreshCw,
    Send,
    Star,
    UserCheck,
    X,
} from "lucide-react";
import MasterPageShell from "../../components/masterCrud/MasterPageShell";
import MasterAlert from "../../components/masterCrud/MasterAlert";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

const PROGRAM_STATUS_COLOR = {
    aktif: "border-emerald-100 bg-emerald-50 text-emerald-600",
    selesai: "border-emerald-100 bg-emerald-50 text-emerald-600",
    approval: "border-amber-100 bg-amber-50 text-amber-600",
    sosialisasi: "border-sky-100 bg-sky-50 text-sky-600",
    implementasi: "border-cyan-100 bg-cyan-50 text-cyan-600",
    evaluasi: "border-violet-100 bg-violet-50 text-violet-600",
    pending: "border-amber-100 bg-amber-50 text-amber-600",
    berjalan: "border-cyan-100 bg-cyan-50 text-cyan-600",
    "review ao": "border-sky-100 bg-sky-50 text-sky-600",
    "keputusan ho": "border-amber-100 bg-amber-50 text-amber-600",
    "perlu revisi": "border-red-100 bg-red-50 text-red-500",
    "perlu upload": "border-slate-100 bg-slate-50 text-slate-500",
};

const REQUIREMENT_STATUS_COLOR = {
    APPROVED: "border-emerald-100 bg-emerald-50 text-emerald-600",
    WAITING_AO: "border-sky-100 bg-sky-50 text-sky-600",
    WAITING_HO: "border-amber-100 bg-amber-50 text-amber-600",
    WAITING_UPLOAD: "border-slate-100 bg-slate-50 text-slate-400",
    REJECTED_AO: "border-orange-100 bg-orange-50 text-orange-600",
    REJECTED_HO: "border-red-100 bg-red-50 text-red-500",
    REJECTED: "border-red-100 bg-red-50 text-red-500",
};

const REQUIREMENT_STATUS_LABEL = {
    APPROVED: "Disetujui HO",
    WAITING_AO: "Review AO",
    WAITING_HO: "Keputusan HO",
    WAITING_UPLOAD: "Belum Upload",
    REJECTED_AO: "Ditolak AO",
    REJECTED_HO: "Ditolak HO",
    REJECTED: "Ditolak",
};

const ACTIVITY_STATUS_COLOR = {
    APPROVED: "border-emerald-100 bg-emerald-50 text-emerald-600",
    LOCKED: "border-slate-100 bg-slate-50 text-slate-300",
    UNLOCKED: "border-cyan-100 bg-cyan-50 text-cyan-600",
    IN_PROGRESS: "border-blue-100 bg-blue-50 text-blue-600",
    WAITING_AO: "border-sky-100 bg-sky-50 text-sky-600",
    WAITING_HO: "border-amber-100 bg-amber-50 text-amber-600",
    REJECTED_AO: "border-orange-100 bg-orange-50 text-orange-600",
    REJECTED_HO: "border-red-100 bg-red-50 text-red-500",
    REJECTED: "border-red-100 bg-red-50 text-red-500",
};

const ACTIVITY_STATUS_LABEL = {
    APPROVED: "Selesai",
    LOCKED: "Terkunci",
    UNLOCKED: "Siap Berjalan",
    IN_PROGRESS: "Sedang Berjalan",
    WAITING_AO: "Review AO",
    WAITING_HO: "Keputusan HO",
    REJECTED_AO: "Ditolak AO",
    REJECTED_HO: "Ditolak HO",
    REJECTED: "Ditolak",
};

const COMMENT_TYPE_COLOR = {
    AO_REVIEW: "border-sky-100 bg-sky-50 text-sky-600",
    HO_APPROVAL: "border-emerald-100 bg-emerald-50 text-emerald-600",
    GURU_RATING: "border-amber-100 bg-amber-50 text-amber-600",
};

const COMMENT_TYPE_LABEL = {
    AO_REVIEW: "Review AO",
    HO_APPROVAL: "Keputusan HO",
    GURU_RATING: "Feedback Guru",
};

function normalizeArray(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.rows)) return payload.rows;
    if (Array.isArray(payload?.result)) return payload.result;
    if (Array.isArray(payload?.results)) return payload.results;
    return [];
}

function getArray(...values) {
    return values.find((value) => Array.isArray(value)) || [];
}

function getGuruAssessmentId(user = {}) {
    return (
        user?.id_guru_assessment ||
        user?.guru_assessment_id ||
        user?.id_guru ||
        user?.sub ||
        user?.id ||
        null
    );
}

function normalizeMeetings(activity = {}) {
    return getArray(
        activity.pertemuan,
        activity.meetings,
        activity.t_kegiatan_pertemuan,
    ).map((item, index) => ({
        id: item.id_pertemuan || item.id || index,
        title: item.nama_pertemuan || item.nama || `Pertemuan ${index + 1}`,
        description: item.deskripsi || item.description || "",
        startDate: item.tanggal_mulai || item.start_date || null,
        endDate: item.tanggal_selesai || item.end_date || null,
    }));
}

function getRatingStats(activity = {}) {
    const ratings = getArray(activity.ratings, activity.rating_items);
    const total = ratings.length;
    const average = total
        ? ratings.reduce((sum, item) => sum + Number(item.rating || 0), 0) / total
        : Number(activity.guru_rating || 0);

    return {
        total,
        average: average ? Number(average.toFixed(2)) : 0,
    };
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

function formatDateTime(value) {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
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

function getRequirementReason(requirement) {
    return (
        requirement?.rejected_reason ||
        requirement?.alasan_reject ||
        requirement?.alasan ||
        requirement?.catatan_reject ||
        "Bukti ditolak dan perlu diperbaiki oleh narasumber."
    );
}

function getAllRequirements(program) {
    const periods = getArray(program?.fases);

    return periods.flatMap((period) => {
        const openingRequirements = getArray(period.termin, period.termins, period.t_termin)
            .flatMap((termin) => getArray(
                termin.persyaratan,
                termin.persyaratan_termin,
                termin.requirements,
                termin.t_persyaratan_termin,
            ));

        const activityRequirements = getArray(period.kegiatans, period.kegiatan, period.t_kegiatans)
            .flatMap((activity) => getArray(
                activity.persyaratan,
                activity.persyaratan_kegiatan,
                activity.requirements,
                activity.t_persyaratan_kegiatan,
            ));

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
        ["REJECTED", "REJECTED_AO", "REJECTED_HO"].includes(getRequirementStatus(item)),
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

    if (progress.total > 0 && progress.approved === progress.total) {
        return "Selesai";
    }

    if (progress.rejected > 0) {
        return "Perlu Revisi";
    }

    if (progress.waitingAo > 0) {
        return "Review AO";
    }

    if (progress.waitingHo > 0) {
        return "Keputusan HO";
    }

    if (progress.waitingUpload > 0 && progress.total > 0) {
        return "Perlu Upload";
    }

    return program?.status_program || program?.status || "Berjalan";
}

function isOpeningCompleted(period) {
    const openingRequirements = getArray(period?.termin, period?.termins, period?.t_termin)
        .flatMap((termin) => getArray(
            termin.persyaratan,
            termin.persyaratan_termin,
            termin.requirements,
            termin.t_persyaratan_termin,
        ));

    if (!openingRequirements.length) return false;

    return openingRequirements.every((item) => getRequirementStatus(item) === "APPROVED");
}

function isActivityApproved(activity) {
    const requirements = getArray(
        activity?.persyaratan,
        activity?.persyaratan_kegiatan,
        activity?.requirements,
        activity?.t_persyaratan_kegiatan,
    );

    if (!requirements.length) return activity?.status_kegiatan === "APPROVED";

    return requirements.every((item) => getRequirementStatus(item) === "APPROVED");
}

function getActivityStatus(activity) {
    const rawStatus = String(activity?.status_kegiatan || "").toUpperCase();
    const requirements = getArray(
        activity?.persyaratan,
        activity?.persyaratan_kegiatan,
        activity?.requirements,
        activity?.t_persyaratan_kegiatan,
    );

    if (requirements.some((item) => getRequirementStatus(item) === "REJECTED_HO")) return "REJECTED_HO";
    if (requirements.some((item) => getRequirementStatus(item) === "REJECTED_AO")) return "REJECTED_AO";
    if (requirements.some((item) => getRequirementStatus(item) === "REJECTED")) return "REJECTED";
    if (requirements.some((item) => getRequirementStatus(item) === "WAITING_HO")) return "WAITING_HO";
    if (requirements.some((item) => getRequirementStatus(item) === "WAITING_AO")) return "WAITING_AO";
    if (isActivityApproved(activity)) return "APPROVED";

    if (["LOCKED", "UNLOCKED", "IN_PROGRESS", "WAITING_HO", "REJECTED", "APPROVED"].includes(rawStatus)) {
        return rawStatus;
    }

    return "LOCKED";
}

function canOpenActivity(period, activity, index) {
    if (!isOpeningCompleted(period)) return false;
    if (String(activity?.status_kegiatan || "").toUpperCase() === "LOCKED") return false;

    const activities = getArray(period?.kegiatans, period?.kegiatan, period?.t_kegiatans);
    const previousActivities = activities.slice(0, index);

    return previousActivities.every(isActivityApproved);
}

function getPeriodStatus(period) {
    const openingDone = isOpeningCompleted(period);
    const activities = getArray(period?.kegiatans, period?.kegiatan, period?.t_kegiatans);
    const activitiesDone = activities.length > 0 && activities.every(isActivityApproved);

    if (!openingDone) {
        return {
            label: "Administrasi Pembuka",
            className: "border-amber-100 bg-amber-50 text-amber-600",
        };
    }

    if (!activitiesDone) {
        return {
            label: "Aktivitas Berjalan",
            className: "border-cyan-100 bg-cyan-50 text-cyan-600",
        };
    }

    return {
        label: "Periode Selesai",
        className: "border-emerald-100 bg-emerald-50 text-emerald-600",
    };
}

function StatusBadge({ status, type = "requirement" }) {
    const palette = type === "activity" ? ACTIVITY_STATUS_COLOR : REQUIREMENT_STATUS_COLOR;
    const labels = type === "activity" ? ACTIVITY_STATUS_LABEL : REQUIREMENT_STATUS_LABEL;

    return (
        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-widest ${palette[status] || "border-slate-100 bg-slate-50 text-slate-400"}`}>
            {labels[status] || status || "-"}
        </span>
    );
}

function JenisBadge({ jenis }) {
    if (!jenis) return null;

    const isReguler = String(jenis).toUpperCase() === "REGULER";

    return (
        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-widest ${isReguler ? "border-violet-100 bg-violet-50 text-violet-600" : "border-cyan-100 bg-cyan-50 text-[#0AC4E0]"}`}>
            {isReguler ? "Reguler" : "Project"}
        </span>
    );
}

function KategoriBadge({ kategori }) {
    if (!kategori) return null;

    const normalized = String(kategori).toUpperCase();
    const isNonAkademik = normalized.includes("NON");

    return (
        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-widest ${isNonAkademik ? "border-rose-100 bg-rose-50 text-rose-500" : "border-indigo-100 bg-indigo-50 text-indigo-600"}`}>
            {isNonAkademik ? "Non Akademik" : "Akademik"}
        </span>
    );
}

function ProgramCard({ program, onClick }) {
    const progress = getProgramProgress(program);
    const derivedStatus = getDerivedProgramStatus(program);
    const statusKey = String(derivedStatus || "").toLowerCase();

    return (
        <button
            type="button"
            onClick={onClick}
            className="group w-full overflow-hidden rounded-[1.7rem] border border-slate-100 bg-white text-left shadow-[0_16px_45px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-1 hover:border-[#0AC4E0]/30 hover:shadow-[0_22px_55px_rgba(15,23,42,0.08)] active:scale-[0.99]"
        >
            <div className="p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.2rem] bg-[#0AC4E0]/10 text-[#0AC4E0]">
                        <BookOpen size={20} />
                    </div>

                    <span className={`rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-widest ${PROGRAM_STATUS_COLOR[statusKey] || "border-slate-100 bg-slate-50 text-slate-400"}`}>
                        {derivedStatus || "-"}
                    </span>
                </div>

                <p className="line-clamp-2 text-[15px] font-black leading-snug text-slate-950">
                    {program.nama_program || program.nama || "Program"}
                </p>

                {program.deskripsi && (
                    <p className="mt-2 line-clamp-2 text-[11px] font-semibold leading-relaxed text-slate-400">
                        {program.deskripsi}
                    </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                    <JenisBadge jenis={program.jenis_program} />
                    <KategoriBadge kategori={program.kategori} />
                    {program.tahun && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-slate-400">
                            <Calendar size={10} />
                            {program.tahun}
                        </span>
                    )}
                </div>

                <div className="mt-5 rounded-[1.2rem] border border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="mb-2 flex items-center justify-between">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                            Progress Bukti
                        </p>
                        <p className="text-[12px] font-black text-[#0AC4E0]">
                            {progress.percentage}%
                        </p>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white">
                        <div
                            className="h-full rounded-full bg-[#0AC4E0] transition-all"
                            style={{ width: `${progress.percentage}%` }}
                        />
                    </div>

                    <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                        <MiniStat label="AO" value={progress.waitingAo} />
                        <MiniStat label="HO" value={progress.waitingHo} />
                        <MiniStat label="ACC" value={progress.approved} />
                        <MiniStat label="Total" value={progress.total} />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 transition group-hover:text-[#0AC4E0]">
                Lihat Detail
                <ChevronRight size={13} />
            </div>
        </button>
    );
}

function MiniStat({ label, value }) {
    return (
        <div className="rounded-xl bg-white px-2 py-2">
            <p className="text-[7px] font-black uppercase tracking-widest text-slate-300">
                {label}
            </p>
            <p className="mt-1 text-[12px] font-black text-slate-700">
                {value}
            </p>
        </div>
    );
}

function DetailMetric({ label, value, helper, tone = "cyan" }) {
    const toneClass =
        tone === "emerald"
            ? "text-emerald-600"
            : tone === "amber"
                ? "text-amber-600"
                : tone === "sky"
                    ? "text-sky-600"
                    : tone === "red"
                        ? "text-red-500"
                        : "text-[#0AC4E0]";

    return (
        <div className="rounded-[1.25rem] border border-slate-100 bg-white px-4 py-3 shadow-sm">
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                {label}
            </p>
            <p className={`mt-1 text-2xl font-black leading-none ${toneClass}`}>
                {value}
            </p>
            {helper && (
                <p className="mt-1 text-[10px] font-semibold text-slate-400">
                    {helper}
                </p>
            )}
        </div>
    );
}

export default function ProgramSekolah() {
    const [user, setUser] = useState(null);
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [note, setNote] = useState({ show: false, type: null, message: "" });

    const [selectedProgram, setSelectedProgram] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [activePeriod, setActivePeriod] = useState(0);

    const [ratingModal, setRatingModal] = useState(null);
    const [ratingValue, setRatingValue] = useState(0);
    const [ratingComment, setRatingComment] = useState("");
    const [ratingLoading, setRatingLoading] = useState(false);

    const [commentDrawer, setCommentDrawer] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentLoading, setCommentLoading] = useState(false);
    const [commentText, setCommentText] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            setUser(jwtDecode(token));
        } catch {
            setUser(null);
        }
    }, []);

    const idRole = Number(user?.id_role || 0);
    const isGuru = idRole === 8;

    const fetchList = useCallback(async () => {
        if (!user?.id_sekolah) return;

        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const { data } = await axios.get(`${BASE_URL}/program/sekolah/${user.id_sekolah}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const basePrograms = normalizeArray(data);

            const detailedPrograms = await Promise.all(
                basePrograms.map(async (program) => {
                    try {
                        const response = await axios.get(`${BASE_URL}/program/${program.id_program}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });

                        return response.data?.data || response.data || program;
                    } catch {
                        return program;
                    }
                }),
            );

            setList(detailedPrograms);
        } catch {
            setNote({
                show: true,
                type: "error",
                message: "Gagal memuat daftar program.",
            });
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) fetchList();
    }, [user, fetchList]);

    const fetchDetail = async (id) => {
        setDetailLoading(true);

        try {
            const token = localStorage.getItem("token");
            const { data } = await axios.get(`${BASE_URL}/program/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const detail = data?.data || data;

            setSelectedProgram(detail);
            setActivePeriod(0);
        } catch {
            setNote({
                show: true,
                type: "error",
                message: "Gagal memuat detail program.",
            });
        } finally {
            setDetailLoading(false);
        }
    };

    const fetchComments = async (idKegiatan) => {
        try {
            const token = localStorage.getItem("token");
            const { data } = await axios.get(`${BASE_URL}/program/kegiatan/${idKegiatan}/comments`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setComments(normalizeArray(data));
        } catch {
            setComments([]);
        }
    };

    const openComment = async (activity) => {
        setCommentDrawer(activity);
        setComments([]);
        setCommentText("");
        await fetchComments(activity.id_kegiatans);
    };

    const submitGuruComment = async () => {
        if (!commentText.trim() || !commentDrawer) return;

        setCommentLoading(true);

        try {
            const token = localStorage.getItem("token");

            await axios.post(
                `${BASE_URL}/program/kegiatan/${commentDrawer.id_kegiatans}/comment`,
                {
                    comment_text: commentText.trim(),
                    comment_type: "GURU_RATING",
                },
                { headers: { Authorization: `Bearer ${token}` } },
            );

            setCommentText("");
            await fetchComments(commentDrawer.id_kegiatans);

            if (selectedProgram?.id_program) {
                await fetchDetail(selectedProgram.id_program);
            }
        } catch {
            setNote({
                show: true,
                type: "error",
                message: "Gagal mengirim komentar.",
            });
        } finally {
            setCommentLoading(false);
        }
    };

    const openRating = (activity) => {
        setRatingModal(activity);
        setRatingValue(activity.guru_rating || 0);
        setRatingComment(activity.guru_comment || "");
    };

    const submitRating = async () => {
        if (!ratingValue || ratingValue < 1) {
            setNote({
                show: true,
                type: "error",
                message: "Pilih rating 1-5 bintang terlebih dahulu.",
            });
            return;
        }

        setRatingLoading(true);

        try {
            const token = localStorage.getItem("token");

            await axios.post(
                `${BASE_URL}/program/kegiatan/${ratingModal.id_kegiatans}/rating`,
                {
                    rating: ratingValue,
                    comment: ratingComment,
                    rater_type: "GURU",
                    id_guru_assessment: getGuruAssessmentId(user),
                    id_sekolah: user?.id_sekolah || ratingModal?.id_sekolah || selectedProgram?.id_sekolah,
                },
                { headers: { Authorization: `Bearer ${token}` } },
            );

            setNote({
                show: true,
                type: "success",
                message: "Rating berhasil disimpan. Terima kasih atas feedbacknya.",
            });

            setRatingModal(null);

            if (selectedProgram?.id_program) {
                await fetchDetail(selectedProgram.id_program);
            }
        } catch (error) {
            setNote({
                show: true,
                type: "error",
                message: error.response?.data?.message || "Gagal menyimpan rating.",
            });
        } finally {
            setRatingLoading(false);
        }
    };

    const periods = getArray(selectedProgram?.fases);
    const currentPeriod = periods[activePeriod];
    const progress = selectedProgram ? getProgramProgress(selectedProgram) : null;

    return (
        <MasterPageShell
            title="Program"
            highlight="Sekolah"
            subtitle="Pantau program, aktivitas, komentar, dan feedback sekolah dalam satu halaman."
            action={(
                <div className="flex items-center gap-2">
                    {selectedProgram && (
                        <button
                            type="button"
                            onClick={() => setSelectedProgram(null)}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-white px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-slate-500 shadow-sm transition hover:text-[#0AC4E0] active:scale-95"
                        >
                            <ChevronRight size={12} className="rotate-180" />
                            Kembali
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => (selectedProgram ? fetchDetail(selectedProgram.id_program) : fetchList())}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-white px-5 py-2.5 text-[9px] font-black uppercase tracking-widest text-slate-500 shadow-sm transition hover:text-[#0AC4E0] active:scale-95"
                    >
                        <RefreshCw size={12} className={loading || detailLoading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>
            )}
        >
            <MasterAlert note={note} setNote={setNote} />

            <div className="h-full overflow-y-auto px-8 py-6 no-scrollbar">
                {!selectedProgram && (
                    <ProgramListView
                        list={list}
                        loading={loading}
                        onOpenDetail={fetchDetail}
                    />
                )}

                {selectedProgram && detailLoading && (
                    <LoadingState label="Memuat detail program..." />
                )}

                {selectedProgram && !detailLoading && (
                    <div className="space-y-6">
                        <ProgramDetailHeader
                            program={selectedProgram}
                            progress={progress}
                        />

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                            <DetailMetric label="Progress" value={`${progress.percentage}%`} helper={`${progress.approved}/${progress.total} bukti`} />
                            <DetailMetric label="Review AO" value={progress.waitingAo} tone="sky" helper="Menunggu AO" />
                            <DetailMetric label="Keputusan HO" value={progress.waitingHo} tone="amber" helper="Menunggu HO" />
                            <DetailMetric label="Disetujui" value={progress.approved} tone="emerald" helper="Approved" />
                            <DetailMetric label="Ditolak" value={progress.rejected} tone="red" helper="Perlu revisi vendor" />
                        </div>

                        <PeriodTabs
                            periods={periods}
                            activePeriod={activePeriod}
                            setActivePeriod={setActivePeriod}
                        />

                        {currentPeriod ? (
                            <PeriodContent
                                period={currentPeriod}
                                periodIndex={activePeriod}
                                isGuru={isGuru}
                                openComment={openComment}
                                openRating={openRating}
                            />
                        ) : (
                            <EmptyState
                                icon={<Layers3 size={38} />}
                                title="Belum ada periode"
                                description="Program ini belum memiliki periode, administrasi, atau aktivitas."
                            />
                        )}
                    </div>
                )}
            </div>

            <RatingModal
                ratingModal={ratingModal}
                ratingValue={ratingValue}
                ratingComment={ratingComment}
                ratingLoading={ratingLoading}
                setRatingValue={setRatingValue}
                setRatingComment={setRatingComment}
                onClose={() => setRatingModal(null)}
                onSubmit={submitRating}
            />

            <CommentDrawer
                open={Boolean(commentDrawer)}
                activity={commentDrawer}
                comments={comments}
                isGuru={isGuru}
                commentText={commentText}
                commentLoading={commentLoading}
                setCommentText={setCommentText}
                onClose={() => {
                    setCommentDrawer(null);
                    setComments([]);
                    setCommentText("");
                }}
                onSubmit={submitGuruComment}
            />
        </MasterPageShell>
    );
}

function ProgramListView({ list, loading, onOpenDetail }) {
    if (loading) {
        return <LoadingState label="Memuat program..." />;
    }

    if (!list.length) {
        return (
            <EmptyState
                icon={<BookOpen size={42} />}
                title="Belum ada program"
                description="Belum ada program yang berjalan untuk sekolah ini."
            />
        );
    }

    return (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {list.map((program) => (
                <ProgramCard
                    key={program.id_program}
                    program={program}
                    onClick={() => onOpenDetail(program.id_program)}
                />
            ))}
        </div>
    );
}

function ProgramDetailHeader({ program, progress }) {
    const derivedStatus = getDerivedProgramStatus(program);
    const statusKey = String(derivedStatus || "").toLowerCase();

    return (
        <div className="overflow-hidden rounded-[1.7rem] border border-slate-100 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
            <div className="border-b border-slate-100 bg-gradient-to-r from-cyan-50 to-white px-6 py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                            <JenisBadge jenis={program.jenis_program} />
                            <KategoriBadge kategori={program.kategori} />
                            <span className={`rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-widest ${PROGRAM_STATUS_COLOR[statusKey] || "border-slate-100 bg-slate-50 text-slate-400"}`}>
                                {derivedStatus || "-"}
                            </span>
                        </div>

                        <h2 className="text-[24px] font-black tracking-[-0.04em] text-slate-950">
                            {program.nama_program || "Program"}
                        </h2>

                        {program.deskripsi && (
                            <p className="mt-2 max-w-3xl text-[12px] font-semibold leading-relaxed text-slate-500">
                                {program.deskripsi}
                            </p>
                        )}
                    </div>

                    <div className="shrink-0 rounded-[1.3rem] border border-cyan-100 bg-white px-5 py-4 text-center shadow-sm">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                            Progress Approved
                        </p>
                        <p className="mt-1 text-[34px] font-black leading-none tracking-[-0.06em] text-[#0AC4E0]">
                            {progress.percentage}%
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 px-6 py-4 md:grid-cols-3">
                <InfoLine icon={<Calendar size={15} />} label="Tahun" value={program.tahun || "-"} />
                <InfoLine icon={<Clock size={15} />} label="Periode Program" value={`${formatDate(program.tanggal_mulai)} - ${formatDate(program.tanggal_selesai)}`} />
                <InfoLine icon={<FileText size={15} />} label="Nomor MOU" value={program.nomor_mou || "-"} />
            </div>
        </div>
    );
}

function InfoLine({ icon, label, value }) {
    return (
        <div className="flex items-center gap-3 rounded-[1.1rem] border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#0AC4E0]">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                    {label}
                </p>
                <p className="mt-0.5 truncate text-[12px] font-black text-slate-800">
                    {value}
                </p>
            </div>
        </div>
    );
}

function PeriodTabs({ periods, activePeriod, setActivePeriod }) {
    if (!periods.length) return null;

    return (
        <div className="rounded-[1.4rem] border border-slate-100 bg-white px-4 py-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-4">
                <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-[#0AC4E0]">
                        Periode Program
                    </p>
                    <p className="mt-1 text-[12px] font-semibold text-slate-400">
                        Pilih periode untuk melihat administrasi dan aktivitas.
                    </p>
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {periods.map((period, index) => {
                    const status = getPeriodStatus(period);
                    const active = activePeriod === index;

                    return (
                        <button
                            key={period.id_fase || index}
                            type="button"
                            onClick={() => setActivePeriod(index)}
                            className={`min-w-[190px] shrink-0 rounded-[1.1rem] border px-4 py-3 text-left transition ${active ? "border-[#0AC4E0] bg-cyan-50 shadow-sm" : "border-slate-100 bg-slate-50 hover:bg-white"}`}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#0AC4E0]">
                                    <Layers3 size={15} />
                                </span>
                                <span className={`rounded-full border px-2 py-1 text-[7px] font-black uppercase tracking-widest ${status.className}`}>
                                    {status.label}
                                </span>
                            </div>
                            <p className="mt-3 truncate text-[13px] font-black text-slate-900">
                                {period.nama_fase || period.nama || `Periode ${index + 1}`}
                            </p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function PeriodContent({ period, periodIndex, isGuru, openComment, openRating }) {
    const openingList = getArray(period.termin, period.termins, period.t_termin);
    const activityList = getArray(period.kegiatans, period.kegiatan, period.t_kegiatans);
    const openingDone = isOpeningCompleted(period);

    return (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
            <section className="space-y-5 xl:col-span-5">
                <SectionCard
                    title="Administrasi Pembuka"
                    subtitle="Bukti administratif sebelum aktivitas dibuka"
                    badge={openingDone ? "Selesai" : "Menunggu Validasi"}
                    badgeClassName={openingDone ? "border-emerald-100 bg-emerald-50 text-emerald-600" : "border-amber-100 bg-amber-50 text-amber-600"}
                >
                    {openingList.length === 0 ? (
                        <InlineEmpty text="Belum ada administrasi pembuka." />
                    ) : (
                        <div className="space-y-3">
                            {openingList.map((termin, index) => (
                                <OpeningCard
                                    key={termin.id_termin || index}
                                    termin={termin}
                                    index={index}
                                />
                            ))}
                        </div>
                    )}
                </SectionCard>
            </section>

            <section className="space-y-5 xl:col-span-7">
                <SectionCard
                    title="Aktivitas Program"
                    subtitle="Aktivitas berjalan setelah administrasi disetujui"
                    badge={openingDone ? "Terbuka Bertahap" : "Terkunci"}
                    badgeClassName={openingDone ? "border-cyan-100 bg-cyan-50 text-cyan-600" : "border-slate-100 bg-slate-50 text-slate-400"}
                >
                    {!openingDone ? (
                        <LockedActivityNotice />
                    ) : activityList.length === 0 ? (
                        <InlineEmpty text="Belum ada aktivitas pada periode ini." />
                    ) : (
                        <div className="space-y-3">
                            {activityList.map((activity, index) => (
                                <ActivityCard
                                    key={activity.id_kegiatans || index}
                                    period={period}
                                    activity={activity}
                                    index={index}
                                    isGuru={isGuru}
                                    openComment={openComment}
                                    openRating={openRating}
                                />
                            ))}
                        </div>
                    )}
                </SectionCard>
            </section>
        </div>
    );
}

function SectionCard({ title, subtitle, badge, badgeClassName, children }) {
    return (
        <div className="overflow-hidden rounded-[1.6rem] border border-slate-100 bg-white shadow-[0_14px_45px_rgba(15,23,42,0.05)]">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 px-5 py-4">
                <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#0AC4E0]">
                        {title}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold text-slate-400">
                        {subtitle}
                    </p>
                </div>

                <span className={`shrink-0 rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-widest ${badgeClassName}`}>
                    {badge}
                </span>
            </div>

            <div className="p-5">
                {children}
            </div>
        </div>
    );
}

function OpeningCard({ termin, index }) {
    const requirements = getArray(
        termin.persyaratan,
        termin.persyaratan_termin,
        termin.requirements,
        termin.t_persyaratan_termin,
    );

    const approved = requirements.filter((item) => getRequirementStatus(item) === "APPROVED").length;

    return (
        <div className="rounded-[1.2rem] border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <FileText size={15} />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-black text-slate-900">
                        {termin.nama_termin || termin.nama || `Administrasi ${index + 1}`}
                    </p>

                    {termin.deskripsi && (
                        <p className="mt-1 text-[10px] font-semibold leading-relaxed text-slate-400">
                            {termin.deskripsi}
                        </p>
                    )}

                    <p className="mt-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        {approved}/{requirements.length} bukti disetujui
                    </p>
                </div>
            </div>

            {requirements.length > 0 && (
                <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                    {requirements.map((requirement) => {
                        const status = getRequirementStatus(requirement);
                        const isRejected = ["REJECTED", "REJECTED_AO", "REJECTED_HO"].includes(status);

                        return (
                            <div key={requirement.id_persyaratan || requirement.id} className="rounded-xl bg-slate-50 px-3 py-2">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-[11px] font-black text-slate-700">
                                        {requirement.nama || requirement.name || "Bukti"}
                                    </p>
                                    <StatusBadge status={status} />
                                </div>

                                {isRejected && (
                                    <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-[10px] font-semibold leading-relaxed text-red-500">
                                        {getRequirementReason(requirement)}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function ActivityCard({ period, activity, index, isGuru, openComment, openRating }) {
    const activityStatus = getActivityStatus(activity);
    const unlocked = canOpenActivity(period, activity, index);
    const approved = activityStatus === "APPROVED";
    const requirements = getArray(
        activity.persyaratan,
        activity.persyaratan_kegiatan,
        activity.requirements,
        activity.t_persyaratan_kegiatan,
    );

    const approvedCount = requirements.filter((item) => getRequirementStatus(item) === "APPROVED").length;
    const commentCount = Array.isArray(activity.comments) ? activity.comments.length : 0;
    const meetings = normalizeMeetings(activity);
    const ratingStats = getRatingStats(activity);

    return (
        <div className={`rounded-[1.35rem] border p-5 transition ${!unlocked ? "border-slate-100 bg-slate-50 opacity-70" : approved ? "border-emerald-100 bg-emerald-50/40" : "border-slate-100 bg-white shadow-sm"}`}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${!unlocked ? "bg-slate-100 text-slate-300" : approved ? "bg-emerald-100 text-emerald-600" : "bg-[#0AC4E0]/10 text-[#0AC4E0]"}`}>
                        {!unlocked ? <Lock size={16} /> : approved ? <CheckCircle2 size={16} /> : <span className="text-[11px] font-black">{String(index + 1).padStart(2, "0")}</span>}
                    </div>

                    <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            <StatusBadge status={!unlocked ? "LOCKED" : activityStatus} type="activity" />
                            {activity.tanggal_mulai && (
                                <span className="rounded-full border border-slate-100 bg-white px-3 py-1 text-[8px] font-black uppercase tracking-widest text-slate-400">
                                    {formatDate(activity.tanggal_mulai)} - {formatDate(activity.tanggal_selesai)}
                                </span>
                            )}
                        </div>

                        <p className="text-[14px] font-black text-slate-950">
                            {activity.nama_kegiatans || activity.nama_kegiatan || activity.nama || `Aktivitas ${index + 1}`}
                        </p>

                        {activity.deskripsi && (
                            <p className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-400">
                                {activity.deskripsi}
                            </p>
                        )}

                        <p className="mt-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                            {approvedCount}/{requirements.length} bukti disetujui
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-100 bg-cyan-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-[#0AC4E0]">
                                <Calendar size={11} />
                                {meetings.length} Pertemuan
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-amber-600">
                                <Star size={11} />
                                {ratingStats.average || 0}/5 · {ratingStats.total || 0} rating
                            </span>
                        </div>
                    </div>
                </div>

                {unlocked && (
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => openComment(activity)}
                            className="relative inline-flex h-10 items-center gap-2 rounded-xl border border-violet-100 bg-violet-50 px-3 text-[9px] font-black uppercase tracking-widest text-violet-500 transition hover:bg-violet-100"
                        >
                            <MessageSquare size={14} />
                            Komentar
                            {commentCount > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-[8px] font-black text-white">
                                    {commentCount > 9 ? "9+" : commentCount}
                                </span>
                            )}
                        </button>

                        {isGuru && approved && (
                            <button
                                type="button"
                                onClick={() => openRating(activity)}
                                className="inline-flex h-10 items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 text-[9px] font-black uppercase tracking-widest text-amber-500 transition hover:bg-amber-100"
                            >
                                <Star size={14} />
                                {activity.guru_rating ? `${activity.guru_rating}/5` : "Rating"}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {meetings.length > 0 && unlocked && (
                <div className="mt-4 rounded-[1.2rem] border border-cyan-100 bg-cyan-50/40 px-4 py-3">
                    <p className="mb-2 text-[8px] font-black uppercase tracking-widest text-[#0AC4E0]">
                        Jadwal Pertemuan
                    </p>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        {meetings.map((meeting, meetingIndex) => (
                            <div key={`${meeting.id}-${meetingIndex}`} className="rounded-xl border border-cyan-100 bg-white px-3 py-2">
                                <p className="text-[11px] font-black text-slate-800">
                                    {meeting.title}
                                </p>
                                <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                    {formatDate(meeting.startDate)} - {formatDate(meeting.endDate)}
                                </p>
                                {meeting.description && (
                                    <p className="mt-1 text-[10px] font-semibold leading-relaxed text-slate-400">
                                        {meeting.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {requirements.length > 0 && unlocked && (
                <div className="mt-4 grid grid-cols-1 gap-2 border-t border-slate-100 pt-4 md:grid-cols-2">
                    {requirements.map((requirement) => {
                        const status = getRequirementStatus(requirement);
                        const isRejected = ["REJECTED", "REJECTED_AO", "REJECTED_HO"].includes(status);

                        return (
                            <div key={requirement.id_persyaratan || requirement.id} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-[11px] font-black text-slate-700">
                                            {requirement.nama || requirement.name || "Bukti"}
                                        </p>
                                        <p className="mt-1 text-[9px] font-semibold text-slate-400">
                                            {requirement.nama_file || requirement.file_path ? "File sudah dikirim" : "Belum ada file"}
                                        </p>
                                    </div>
                                    <StatusBadge status={status} />
                                </div>

                                {isRejected && (
                                    <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-[10px] font-semibold leading-relaxed text-red-500">
                                        {getRequirementReason(requirement)}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function LockedActivityNotice() {
    return (
        <div className="flex flex-col items-center justify-center rounded-[1.3rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-300">
                <Lock size={24} />
            </div>
            <p className="mt-4 text-[14px] font-black text-slate-800">
                Aktivitas masih terkunci
            </p>
            <p className="mt-2 max-w-md text-[11px] font-semibold leading-relaxed text-slate-400">
                Aktivitas akan terbuka setelah seluruh administrasi pembuka periode direview AO dan disetujui HO.
            </p>
        </div>
    );
}

function InlineEmpty({ text }) {
    return (
        <div className="rounded-[1.2rem] border border-dashed border-slate-200 bg-slate-50 px-5 py-7 text-center text-[12px] font-bold text-slate-400">
            {text}
        </div>
    );
}

function EmptyState({ icon, title, description }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-[1.7rem] border border-dashed border-slate-200 bg-white px-8 py-16 text-center">
            <div className="text-slate-200">{icon}</div>
            <p className="mt-4 text-[15px] font-black text-slate-800">
                {title}
            </p>
            <p className="mt-2 max-w-md text-[12px] font-semibold leading-relaxed text-slate-400">
                {description}
            </p>
        </div>
    );
}

function LoadingState({ label }) {
    return (
        <div className="flex flex-col items-center justify-center py-24">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-[#0AC4E0]">
                <RefreshCw size={24} className="animate-spin" />
            </div>
            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                {label}
            </p>
        </div>
    );
}

function RatingModal({
    ratingModal,
    ratingValue,
    ratingComment,
    ratingLoading,
    setRatingValue,
    setRatingComment,
    onClose,
    onSubmit,
}) {
    if (!ratingModal) return null;

    return (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-[0_35px_90px_rgba(15,23,42,0.25)]">
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-6 py-5">
                    <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-amber-500">
                            Rating Aktivitas
                        </p>
                        <h3 className="mt-1 text-[18px] font-black leading-tight text-slate-900">
                            {ratingModal.nama_kegiatans || ratingModal.nama_kegiatan || "Aktivitas"}
                        </h3>
                        <p className="mt-1 text-[11px] font-semibold text-slate-400">
                            Berikan penilaian setelah aktivitas selesai.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-100 text-slate-400 hover:text-slate-700"
                    >
                        <X size={15} />
                    </button>
                </div>

                <div className="space-y-5 px-6 py-6">
                    <div>
                        <p className="mb-3 text-[9px] font-black uppercase tracking-widest text-slate-400">
                            Pilih Rating
                        </p>
                        <div className="flex justify-center gap-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRatingValue(star)}
                                    className={`flex h-14 w-14 items-center justify-center rounded-2xl border text-2xl transition-all active:scale-90 ${ratingValue >= star ? "scale-110 border-amber-200 bg-amber-50" : "border-slate-100 bg-slate-50 opacity-40 hover:opacity-70"}`}
                                >
                                    <Star size={26} className={ratingValue >= star ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
                                </button>
                            ))}
                        </div>

                        {ratingValue > 0 && (
                            <p className="mt-3 text-center text-[11px] font-black text-amber-500">
                                {["", "Sangat Kurang", "Kurang", "Cukup", "Baik", "Sangat Baik"][ratingValue]} ({ratingValue}/5)
                            </p>
                        )}
                    </div>

                    <div>
                        <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                            Komentar
                        </p>
                        <textarea
                            value={ratingComment}
                            onChange={(event) => setRatingComment(event.target.value)}
                            placeholder="Ceritakan pengalaman tentang aktivitas ini..."
                            rows={3}
                            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-[12px] font-semibold text-slate-700 outline-none focus:border-amber-300"
                        />
                    </div>
                </div>

                <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-full border border-slate-100 py-3 text-[10px] font-black uppercase text-slate-400 hover:text-slate-700"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={ratingLoading || ratingValue < 1}
                        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-amber-400 py-3 text-[10px] font-black uppercase text-white shadow hover:bg-amber-500 disabled:opacity-40"
                    >
                        {ratingLoading ? <RefreshCw size={14} className="animate-spin" /> : <Star size={14} />}
                        Simpan Rating
                    </button>
                </div>
            </div>
        </div>
    );
}

function CommentDrawer({
    open,
    activity,
    comments,
    isGuru,
    commentText,
    commentLoading,
    setCommentText,
    onClose,
    onSubmit,
}) {
    if (!open) return null;

    const canGuruComment = isGuru && getActivityStatus(activity) === "APPROVED";

    return (
        <div className="fixed inset-0 z-[90] flex">
            <button
                type="button"
                className="flex-1 bg-slate-950/30 backdrop-blur-sm"
                onClick={onClose}
                aria-label="Tutup komentar"
            />

            <div className="flex w-full max-w-[430px] flex-col bg-white shadow-[0_0_60px_rgba(15,23,42,0.2)]">
                <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
                    <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-violet-500">
                            Komentar Aktivitas
                        </p>
                        <h3 className="mt-0.5 text-[16px] font-black text-slate-900">
                            {activity?.nama_kegiatans || activity?.nama_kegiatan || "Aktivitas"}
                        </h3>
                        <p className="mt-1 text-[10px] font-semibold text-slate-400">
                            Review AO · Keputusan HO · Feedback Guru
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-100 text-slate-400 hover:text-slate-700"
                    >
                        <X size={15} />
                    </button>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4 no-scrollbar">
                    {comments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-16">
                            <MessageSquare size={32} className="text-slate-200" />
                            <p className="text-[11px] font-bold text-slate-400">
                                Belum ada komentar.
                            </p>
                        </div>
                    ) : (
                        comments.map((comment) => {
                            const meta = COMMENT_TYPE_COLOR[comment.comment_type] || COMMENT_TYPE_COLOR.AO_REVIEW;

                            return (
                                <div key={comment.id_comment} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                    <div className="mb-2 flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 text-[10px] font-black text-violet-600">
                                            {String(comment.nama_user || "U").charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-[11px] font-black text-slate-800">
                                                {comment.nama_user || "User"}
                                            </p>
                                            <p className="text-[9px] text-slate-400">
                                                {comment.role_user || "-"}
                                            </p>
                                        </div>
                                        <span className={`ml-auto inline-flex rounded-full border px-2 py-0.5 text-[8px] font-black uppercase ${meta}`}>
                                            {COMMENT_TYPE_LABEL[comment.comment_type] || comment.comment_type}
                                        </span>
                                    </div>

                                    <p className="text-[12px] font-semibold leading-relaxed text-slate-700">
                                        {comment.comment_text}
                                    </p>
                                    <p className="mt-2 text-[9px] text-slate-300">
                                        {formatDateTime(comment.created_at)}
                                    </p>
                                </div>
                            );
                        })
                    )}
                </div>

                {canGuruComment ? (
                    <div className="shrink-0 border-t border-slate-100 p-4">
                        <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                            Tambah Feedback Guru
                        </p>
                        <div className="flex gap-2">
                            <textarea
                                value={commentText}
                                onChange={(event) => setCommentText(event.target.value)}
                                placeholder="Tulis feedback Anda..."
                                rows={2}
                                className="flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-[12px] font-semibold text-slate-700 outline-none focus:border-violet-300"
                            />
                            <button
                                type="button"
                                onClick={onSubmit}
                                disabled={commentLoading || !commentText.trim()}
                                className="flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-xl bg-violet-500 text-white shadow hover:bg-violet-600 disabled:opacity-40"
                            >
                                {commentLoading ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="shrink-0 border-t border-slate-100 px-5 py-4 text-center">
                        <p className="text-[10px] font-semibold text-slate-400">
                            Feedback guru dibuka setelah aktivitas selesai dan disetujui HO.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

