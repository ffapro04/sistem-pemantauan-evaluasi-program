/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
    Activity,
    AlertTriangle,
    BarChart3,
    CalendarClock,
    CheckCircle2,
    ChartPie,
    ChevronLeft,
    ChevronRight,
    ClipboardCheck,
    Clock3,
    FileCheck2,
    Layers3,
    MapPinned,
    Target,
    TrendingUp,
    RefreshCw,
    RotateCcw,
    Search,
    School,
    UserRound,
    UsersRound,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis,
} from "recharts";

import Sidebar from "../Sidebar";
import PageWrapper from "../PageWrapper";
import Dropdown from "../Dropdown";
import ResponsiveContainer from "../charts/SafeResponsiveContainer";
import ProgramRatingStars from "../program/ProgramRatingStars";

const API_FALLBACK = "";
const ITEMS_PER_PAGE = 5;
const DASHBOARD_YEAR_OPTIONS = Array.from({ length: 21 }, (_, index) =>
    String(2015 + index),
);
const COCKPIT_STATUS_ITEMS = [
    { value: "ALL", label: "Semua Status" },
    { value: "PROSES", label: "Sedang Proses" },
    { value: "SELESAI", label: "Selesai" },
];
const STATUS_PIE_COLORS = {
    DRAFT: "#94A3B8",
    PROSES: "#FFD400",
    PENDING: "#EF4444",
    SELESAI: "#00C68D",
};

const PROGRAM_STAGE_META = [
    { key: "APPROVAL", name: "Approval", color: "#94A3B8" },
    { key: "SOSIALISASI", name: "Sosialisasi", color: "#7C3AED" },
    { key: "IMPLEMENTASI", name: "Implementasi", color: "#2563EB" },
    { key: "EVALUASI", name: "Evaluasi", color: "#F97316" },
    { key: "SELESAI", name: "Selesai", color: "#00C68D" },
];

const ASSESSMENT_STATUS_META = {
    DRAFT: {
        key: "DRAFT",
        label: "Belum Dikirim",
        shortLabel: "Draft",
        color: STATUS_PIE_COLORS.DRAFT,
        soft: "#F8FAFC",
        border: "#CBD5E1",
    },
    PROSES: {
        key: "PROSES",
        label: "Sedang Pengisian",
        shortLabel: "Proses",
        color: STATUS_PIE_COLORS.PROSES,
        soft: "#FFFBEB",
        border: "#FDE68A",
    },
    PENDING: {
        key: "PENDING",
        label: "Dipending HO",
        shortLabel: "Pending",
        color: STATUS_PIE_COLORS.PENDING,
        soft: "#FEF2F2",
        border: "#FECACA",
    },
    SELESAI: {
        key: "SELESAI",
        label: "Selesai",
        shortLabel: "Selesai",
        color: STATUS_PIE_COLORS.SELESAI,
        soft: "#ECFDF5",
        border: "#A7F3D0",
    },
};

const PILLAR_META = {
    AKADEMIK: {
        label: "Akademik",
        color: "#0055DA",
        soft: "#EAF2FF",
        group: "AKADEMIK",
        chartKey: "akademik",
    },
    KARAKTER: {
        label: "Karakter",
        color: "#360185",
        soft: "#F2ECFF",
        group: "AKADEMIK",
        chartKey: "karakter",
    },
    SENI_BUDAYA: {
        label: "Seni Budaya",
        color: "#F97316",
        soft: "#FFF3E8",
        group: "NON_AKADEMIK",
        chartKey: "seniBudaya",
    },
    KECAKAPAN_HIDUP: {
        label: "Kecakapan Hidup",
        color: "#5B2E16",
        soft: "#FFF1E7",
        group: "NON_AKADEMIK",
        chartKey: "kecakapanHidup",
    },
};

const CHART_SERIES = Object.entries(PILLAR_META).map(([key, meta]) => ({
    key,
    ...meta,
}));

const COUNTY_CHART_COLORS = [
    "#0AC4E0",
    "#2563EB",
    "#7C3AED",
    "#F97316",
    "#00C68D",
    "#E11D48",
    "#0891B2",
    "#9333EA",
    "#CA8A04",
    "#0F766E",
];

function normalizeArray(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.result)) return payload.result;
    if (Array.isArray(payload?.rows)) return payload.rows;
    if (Array.isArray(payload?.sekolah)) return payload.sekolah;
    if (Array.isArray(payload?.schools)) return payload.schools;
    if (Array.isArray(payload?.program)) return payload.program;
    if (Array.isArray(payload?.programs)) return payload.programs;
    if (Array.isArray(payload?.assessment)) return payload.assessment;
    if (Array.isArray(payload?.assessments)) return payload.assessments;
    return [];
}

async function safeJson(response) {
    try {
        return await response.json();
    } catch {
        return {};
    }
}

function normalizeKey(value) {
    return String(value || "")
        .trim()
        .toUpperCase()
        .replaceAll("-", "_")
        .replaceAll(" ", "_")
        .replaceAll("&", "DAN")
        .replace(/_+/g, "_");
}

function normalizeText(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replaceAll("_", " ")
        .replaceAll("-", " ");
}

function toNumberArray(value) {
    if (Array.isArray(value)) {
        return value
            .map((item) => {
                if (typeof item === "object") {
                    return Number(item?.id_sekolah || item?.id || item?.school_id);
                }
                return Number(item);
            })
            .filter((item) => Number.isFinite(item));
    }

    if (typeof value === "string" && value.trim()) {
        return value
            .replace(/[{}\[\]"]/g, "")
            .split(",")
            .map((item) => Number(String(item).trim()))
            .filter((item) => Number.isFinite(item));
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? [parsed] : [];
}

function collectSchoolIds(item) {
    const values = [
        item?.id_sekolah,
        item?.sekolah_id,
        item?.school_id,
        item?.sekolah?.id_sekolah,
        item?.sekolah?.id,
        item?.school?.id_sekolah,
        item?.school?.id,
        item?.sekolah_ids,
        item?.school_ids,
        item?.target_sekolah_ids,
        item?.targetSchoolIds,
        item?.sekolahs,
        item?.schools,
        item?.target_sekolah,
    ];

    return [
        ...new Set(
            values.flatMap(toNumberArray).filter((item) => Number.isFinite(item)),
        ),
    ];
}

function collectSchoolNames(item) {
    const names = [];

    const pushName = (value) => {
        const text = String(value || "").trim();
        if (text) names.push(text);
    };

    pushName(item?.sekolah?.nama_sekolah);
    pushName(item?.sekolah?.nama);
    pushName(item?.school?.nama_sekolah);
    pushName(item?.school?.nama);
    pushName(item?.nama_sekolah);
    pushName(item?.schoolName);

    [item?.sekolahs, item?.schools, item?.target_sekolah].forEach((rows) => {
        if (!Array.isArray(rows)) return;
        rows.forEach((school) =>
            pushName(school?.nama_sekolah || school?.nama || school?.name),
        );
    });

    const daftar = item?.daftar_sekolah;
    if (typeof daftar === "string") {
        daftar
            .split(",")
            .map((name) => name.trim())
            .filter(Boolean)
            .forEach(pushName);
    }

    return [...new Set(names)];
}

function getSchoolId(school) {
    return school?.id_sekolah || school?.id || school?.school_id || null;
}

function getSchoolName(school) {
    return school?.nama_sekolah || school?.nama || school?.name || "Sekolah";
}

function getSchoolLevel(school) {
    return String(
        school?.jenjang ||
        school?.level ||
        school?.jenis_sekolah ||
        school?.raw?.jenjang ||
        "",
    )
        .trim()
        .toUpperCase();
}

function getSchoolCounty(school, getItemRegion) {
    const value =
        school?.wilayah?.nama_wilayah ||
        school?.wilayah?.nama ||
        school?.kabupaten?.nama_wilayah ||
        school?.kabupaten?.nama_kabupaten ||
        school?.kabupaten?.nama ||
        school?.nama_kabupaten ||
        school?.kabupaten ||
        school?.nama_wilayah ||
        getItemRegion?.(school) ||
        "Belum Dipetakan";

    return typeof value === "object"
        ? value?.nama_wilayah || value?.nama || "Belum Dipetakan"
        : String(value || "Belum Dipetakan");
}

function getSchoolArea(school) {
    const value =
        school?.wilayah?.area_wilayah ||
        school?.wilayah?.areaWilayah ||
        school?.wilayah?.area_binaan ||
        school?.wilayah?.areaBinaan ||
        school?.kabupaten?.area_wilayah ||
        school?.kabupaten?.areaWilayah ||
        school?.area_wilayah ||
        school?.areaWilayah ||
        school?.area_binaan ||
        school?.areaBinaan ||
        school?.nama_area ||
        school?.area ||
        "Belum Dipetakan";

    return typeof value === "object"
        ? value?.area_wilayah || value?.nama_area || value?.nama || "Belum Dipetakan"
        : String(value || "Belum Dipetakan");
}

function getSchoolProvince(school) {
    const value =
        school?.wilayah?.provinsi?.nama_wilayah ||
        school?.wilayah?.provinsi?.nama_provinsi ||
        school?.wilayah?.nama_provinsi ||
        school?.provinsi?.nama_wilayah ||
        school?.provinsi?.nama_provinsi ||
        school?.nama_provinsi ||
        school?.provinsi ||
        "Belum Dipetakan";

    return typeof value === "object"
        ? value?.nama_wilayah || value?.nama_provinsi || value?.nama || "Belum Dipetakan"
        : String(value || "Belum Dipetakan");
}

function isSchoolAllowedByJenjang(school, allowedJenjang = []) {
    const allowed = Array.isArray(allowedJenjang)
        ? allowedJenjang.map(normalizeKey).filter(Boolean)
        : [];

    if (allowed.length === 0) return true;
    return allowed.includes(normalizeKey(getSchoolLevel(school)));
}

function getRawPillar(item) {
    return (
        item?.pilar_program ||
        item?.pilarProgram ||
        item?.pilar ||
        item?.sub_kategori ||
        item?.subKategori ||
        item?.kategori_pilar ||
        item?.kategoriPilar ||
        item?.bidang_program ||
        item?.raw?.pilar_program ||
        item?.raw?.pilarProgram ||
        item?.raw?.pilar ||
        item?.program?.pilar_program ||
        item?.program?.pilarProgram ||
        item?.program?.pilar ||
        item?.assessment?.pilar ||
        ""
    );
}

function getRawGroup(item) {
    return (
        item?.kategori ||
        item?.kategori_program ||
        item?.kategori_assessment ||
        item?.jenis_assessment ||
        item?.jenis ||
        item?.category ||
        item?.program?.kategori ||
        item?.assessment?.jenis ||
        ""
    );
}

function getPillarKey(item) {
    const pillar = normalizeKey(getRawPillar(item));

    if (pillar.includes("KARAKTER") || pillar.includes("CHARACTER")) {
        return "KARAKTER";
    }

    if (
        pillar.includes("SENI_BUDAYA") ||
        pillar.includes("SENI_DAN_BUDAYA") ||
        pillar === "SENI"
    ) {
        return "SENI_BUDAYA";
    }

    if (
        pillar.includes("KECAKAPAN_HIDUP") ||
        pillar.includes("LIFE_SKILL") ||
        pillar.includes("LIFESKILL")
    ) {
        return "KECAKAPAN_HIDUP";
    }

    if (pillar === "AKADEMIK" || pillar === "ACADEMIC") {
        return "AKADEMIK";
    }

    const group = normalizeKey(getRawGroup(item));

    if (
        group.includes("SENI_BUDAYA") ||
        group.includes("SENI_DAN_BUDAYA")
    ) {
        return "SENI_BUDAYA";
    }

    if (
        group.includes("KECAKAPAN_HIDUP") ||
        group.includes("LIFE_SKILL")
    ) {
        return "KECAKAPAN_HIDUP";
    }

    if (group.includes("KARAKTER")) return "KARAKTER";
    if (group.includes("NON_AKADEMIK") || group.includes("NONAKADEMIK")) {
        return "SENI_BUDAYA";
    }
    if (group.includes("AKADEMIK") || group.includes("ACADEMIC")) {
        return "AKADEMIK";
    }

    return "AKADEMIK";
}

function getGroupKey(item) {
    return PILLAR_META[getPillarKey(item)]?.group || "AKADEMIK";
}

function isItemAllowedByHo(item, categoryFilter) {
    const target = normalizeKey(categoryFilter);
    if (!target) return true;

    if (target === "AKADEMIK") return getGroupKey(item) === "AKADEMIK";
    if (target === "NON_AKADEMIK") {
        return getGroupKey(item) === "NON_AKADEMIK";
    }

    return normalizeKey(getRawGroup(item)) === target;
}

function getProgramType(item) {
    const value = normalizeKey(
        item?.jenis_program ||
        item?.jenisProgram ||
        item?.tipe_program ||
        item?.type_program ||
        item?.tipe ||
        "",
    );

    if (value.includes("PROJECT")) return "PROJECT";
    if (value.includes("REGULER")) return "REGULER";
    return "LAINNYA";
}

function getProgramTypeLabel(value) {
    if (value === "PROJECT") return "Project";
    if (value === "REGULER") return "Reguler";
    return "Lainnya";
}

function getProgramStageKey(item) {
    const value = normalizeKey(
        item?.status_program ||
        item?.statusProgram ||
        item?.status ||
        "APPROVAL",
    );

    if (value.includes("SELESAI") || value.includes("COMPLETED")) return "SELESAI";
    if (value.includes("EVALUASI") || value.includes("EVALUATION")) return "EVALUASI";
    if (value.includes("IMPLEMENTASI") || value.includes("IMPLEMENTATION")) {
        return "IMPLEMENTASI";
    }
    if (value.includes("SOSIALISASI") || value.includes("SOCIALIZATION")) {
        return "SOSIALISASI";
    }
    return "APPROVAL";
}

function getCreatedDate(item) {
    return (
        item?.created_at ||
        item?.createdAt ||
        item?.sent_at ||
        item?.updated_at ||
        item?.updatedAt ||
        null
    );
}

function getItemYear(item) {
    const explicitYear =
        item?.tahun ||
        item?.year ||
        item?.tahun_anggaran ||
        item?.tahunAnggaran ||
        item?.periode_tahun ||
        item?.periodeTahun;

    if (explicitYear) return String(explicitYear);

    const dateValue =
        item?.tanggal_mulai ||
        item?.tanggalMulai ||
        item?.start_date ||
        item?.startDate ||
        getCreatedDate(item);
    const date = dateValue ? new Date(dateValue) : null;

    if (date && !Number.isNaN(date.getTime())) return String(date.getFullYear());
    return "Belum Ada Tahun";
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

function isAssessmentActive(value) {
    if (value === false || value === 0) return false;

    const normalized = normalizeText(value);
    if (["false", "0", "nonaktif", "inactive", "pending"].includes(normalized)) {
        return false;
    }

    return true;
}

const ASSESSMENT_SECOND_MS = 1000;
const ASSESSMENT_DAY_MS = 24 * 60 * 60 * ASSESSMENT_SECOND_MS;

function getAssessmentTiming(item, nowMs = Date.now()) {
    if (!item?.sent_at) {
        return {
            remainingSeconds: null,
            deadline: null,
            paused: false,
        };
    }

    const sentAtMs = new Date(item.sent_at).getTime();
    if (Number.isNaN(sentAtMs)) {
        return {
            remainingSeconds: null,
            deadline: null,
            paused: false,
        };
    }

    const totalPausedSeconds = Math.max(0, Number(item?.total_paused_seconds || 0));
    const baseDeadlineMs =
        sentAtMs +
        (Number(item?.tenggat) || 7) * ASSESSMENT_DAY_MS +
        totalPausedSeconds * ASSESSMENT_SECOND_MS;
    const paused = !isAssessmentActive(item?.aktif) && Boolean(item?.paused_at);
    const pausedAtMs = paused ? new Date(item.paused_at).getTime() : null;
    const referenceMs =
        paused && pausedAtMs && !Number.isNaN(pausedAtMs) ? pausedAtMs : nowMs;
    const remainingSeconds = Math.max(
        0,
        Math.ceil((baseDeadlineMs - referenceMs) / ASSESSMENT_SECOND_MS),
    );
    const deadlineMs =
        paused && pausedAtMs && !Number.isNaN(pausedAtMs)
            ? baseDeadlineMs + Math.max(0, nowMs - pausedAtMs)
            : baseDeadlineMs;

    return {
        remainingSeconds,
        deadline: new Date(deadlineMs),
        paused,
    };
}

function getAssessmentDeadline(item, nowMs = Date.now()) {
    return getAssessmentTiming(item, nowMs).deadline;
}

function formatAssessmentCountdown(remainingSeconds) {
    if (remainingSeconds === null || remainingSeconds === undefined) return "Belum dimulai";
    if (remainingSeconds <= 0) return "Tenggat habis";

    const days = Math.floor(remainingSeconds / 86400);
    const hours = Math.floor((remainingSeconds % 86400) / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;

    return `${days} hari ${hours} jam ${minutes} menit ${seconds} detik`;
}

function getAssessmentStage(item, nowMs = Date.now()) {
    const sentAt = item?.sent_at || null;
    if (!sentAt) return "DRAFT";

    const status = normalizeText(
        item?.status_assessment || item?.status || item?.status_pengisian || "",
    );
    const totalTarget = Number(
        item?.jumlah_guru_target || item?.total_guru_target || item?.total_responden || 0,
    );
    const totalFilled = Number(
        item?.jumlah_pengisi || item?.jumlah_guru_mengisi || item?.sudah_mengisi || 0,
    );
    const timing = getAssessmentTiming(item, nowMs);
    const deadlineExpired = timing.remainingSeconds !== null && timing.remainingSeconds <= 0;
    const allFilled = totalTarget > 0 && totalFilled >= totalTarget;
    const statusCompleted =
        status.includes("selesai") ||
        status.includes("completed") ||
        status.includes("sudah lengkap") ||
        status.includes("sudah dilengkapi");

    if (deadlineExpired || allFilled || statusCompleted) return "SELESAI";
    if (timing.paused) return "PENDING";
    return "PROSES";
}

function getAssessmentStageMeta(item) {
    return ASSESSMENT_STATUS_META[getAssessmentStage(item)] || ASSESSMENT_STATUS_META.DRAFT;
}

function getAssessmentSenderName(item) {
    return (
        item?.ho ||
        item?.nama_ho ||
        item?.nama_pengirim ||
        item?.user?.nama ||
        item?.created_by?.nama ||
        "HO belum terbaca"
    );
}

function getAssessmentTeacherProgress(item) {
    const target = Number(
        item?.jumlah_guru_target || item?.total_guru_target || item?.total_responden || 0,
    );
    const filled = Number(
        item?.jumlah_pengisi || item?.jumlah_guru_mengisi || item?.sudah_mengisi || 0,
    );

    return {
        target,
        filled,
        remaining: Math.max(target - filled, 0),
        percent: target > 0 ? Math.min(Math.round((filled / target) * 100), 100) : 0,
    };
}

function statusText(item, getStatus) {
    return String(getStatus(item) || "Belum Ada").trim();
}

function getProgressBucket(item, getStatus, type) {
    if (type === "ASSESSMENT") {
        return getAssessmentStage(item) === "SELESAI" ? "SELESAI" : "PROSES";
    }

    const status = normalizeText(statusText(item, getStatus));
    const progress = Number(
        item?.persentase ||
        item?.progress ||
        item?.completion_rate ||
        item?.percentage ||
        0,
    );

    if (progress >= 100) return "SELESAI";

    if (
        status.includes("selesai") ||
        status.includes("completed") ||
        status.includes("sudah lengkap") ||
        status.includes("sudah dilengkapi")
    ) {
        return "SELESAI";
    }

    if (type === "PROGRAM" && status.includes("finish")) return "SELESAI";
    return "PROSES";
}

function getProgressLabel(value) {
    return value === "SELESAI" ? "Selesai" : "Sedang Proses";
}

function uniqueStrings(values) {
    return [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))];
}

function parseMaybeArray(value) {
    if (Array.isArray(value)) return value;
    if (!value || typeof value !== "string") return [];

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function getArray(...values) {
    for (const value of values) {
        if (Array.isArray(value)) return value;
        const parsed = parseMaybeArray(value);
        if (parsed.length) return parsed;
    }

    return [];
}

function getRequirementFile(requirement = {}) {
    return (
        requirement?.file ||
        requirement?.file_url ||
        requirement?.file_path ||
        requirement?.path ||
        requirement?.file_mou ||
        requirement?.dokumen ||
        requirement?.bukti ||
        requirement?.nama_file ||
        null
    );
}

function getRequirementStatus(requirement = {}) {
    const status = normalizeKey(requirement?.status);

    if (status === "APPROVED") return "APPROVED";
    if (status === "WAITING_AO") return "WAITING_AO";
    if (status === "WAITING_HO") return "WAITING_HO";
    if (status === "WAITING_UPLOAD") return "WAITING_UPLOAD";
    if (status === "REJECTED_AO") return "REJECTED_AO";
    if (status === "REJECTED_HO") return "REJECTED_HO";
    if (status === "REJECTED") return "REJECTED";

    if (getRequirementFile(requirement)) return "WAITING_AO";
    return "WAITING_UPLOAD";
}

function getProgramPhases(program = {}) {
    return getArray(program?.fases, program?.fase, program?.phases, program?.t_fase);
}

function getPhaseTermins(phase = {}) {
    return getArray(phase?.termin, phase?.termins, phase?.t_termin);
}

function getPhaseActivities(phase = {}) {
    return getArray(
        phase?.kegiatans,
        phase?.kegiatan,
        phase?.activities,
        phase?.aktivitas,
        phase?.t_kegiatans,
    );
}

function getTerminRequirements(termin = {}) {
    return getArray(
        termin?.persyaratan,
        termin?.persyaratan_termin,
        termin?.requirements,
        termin?.t_persyaratan_termin,
    );
}

function getActivityRequirements(activity = {}) {
    return getArray(
        activity?.persyaratan,
        activity?.persyaratan_kegiatan,
        activity?.requirements,
        activity?.t_persyaratan_kegiatan,
    );
}

function requirementUploaded(requirement = {}) {
    return ["WAITING_AO", "WAITING_HO", "APPROVED"].includes(
        getRequirementStatus(requirement),
    );
}

function requirementAoApproved(requirement = {}) {
    return ["WAITING_HO", "APPROVED"].includes(getRequirementStatus(requirement));
}

function requirementApproved(requirement = {}) {
    return getRequirementStatus(requirement) === "APPROVED";
}

function allAvailableDone(rows = [], predicate) {
    return rows.length > 0 && rows.every(predicate);
}

function getProgramWorkflowStatus(program = {}) {
    const phases = getProgramPhases(program);
    const termins = phases.flatMap(getPhaseTermins);
    const activities = phases.flatMap(getPhaseActivities);
    const openingRequirements = termins.flatMap(getTerminRequirements);
    const activityRequirements = activities.flatMap(getActivityRequirements);
    const hasDetailedWorkflow =
        phases.length > 0 ||
        openingRequirements.length > 0 ||
        activityRequirements.length > 0;

    const rawProgress = Number(
        program?.persentase ||
        program?.progress ||
        program?.completion_rate ||
        program?.percentage ||
        0,
    );
    const progressValue = Number.isFinite(rawProgress)
        ? Math.min(Math.max(rawProgress, 0), 100)
        : 0;
    const fallbackDone =
        getProgressBucket(
            program,
            (item) => item?.status_program || item?.status,
            "PROGRAM",
        ) === "SELESAI";
    const fallbackAt = (minimum) => fallbackDone || progressValue >= minimum;

    const uploadAdminDone = hasDetailedWorkflow
        ? allAvailableDone(openingRequirements, requirementUploaded)
        : fallbackAt(20);
    const aoValidationDone = hasDetailedWorkflow
        ? allAvailableDone(openingRequirements, requirementAoApproved)
        : fallbackAt(40);
    const hoApprovalDone = hasDetailedWorkflow
        ? allAvailableDone(openingRequirements, requirementApproved)
        : fallbackAt(55);

    const hasActivityProgress =
        activities.some((activity) => {
            const status = normalizeKey(activity?.status_kegiatan || activity?.status);
            const requirements = getActivityRequirements(activity);

            return (
                ["UNLOCKED", "IN_PROGRESS", "WAITING_AO", "WAITING_HO", "APPROVED"].includes(status) ||
                requirements.some(requirementUploaded)
            );
        }) || activityRequirements.some(requirementUploaded);

    const activityStartedDone = hasDetailedWorkflow
        ? hoApprovalDone && hasActivityProgress
        : fallbackAt(65);
    const activityUploadDone = hasDetailedWorkflow
        ? allAvailableDone(activityRequirements, requirementUploaded)
        : fallbackAt(78);
    const activityApprovedDone = hasDetailedWorkflow
        ? allAvailableDone(activityRequirements, requirementApproved)
        : fallbackAt(90);
    const ratings = activities.flatMap((activity) =>
        getArray(activity?.ratings, activity?.rating, activity?.t_kegiatan_rating),
    );
    const ratingTotal = Number(
        program?.rating_summary?.total_rating ||
        program?.ratingSummary?.total_rating ||
        program?.total_rating ||
        program?.jumlah_rating ||
        ratings.length ||
        0,
    );
    const ratingDone = hasDetailedWorkflow
        ? activityApprovedDone && ratingTotal > 0
        : fallbackDone;

    return {
        INIT: Boolean(program),
        UPLOAD_ADMIN: uploadAdminDone,
        VALIDATE_AO: aoValidationDone,
        APPROVE_HO: hoApprovalDone,
        EXEC_ACTIVITY: activityStartedDone,
        UPLOAD_ACTIVITY: activityUploadDone,
        RATING: ratingDone,
    };
}

function getProgramProcessSteps(program = {}) {
    const status = getProgramWorkflowStatus(program);
    const steps = [
        { key: "INIT", label: "Inisiasi Program" },
        { key: "UPLOAD_ADMIN", label: "Upload Administrasi" },
        { key: "VALIDATE_AO", label: "Validasi Area Officer" },
        { key: "APPROVE_HO", label: "Persetujuan Head Office" },
        { key: "EXEC_ACTIVITY", label: "Pelaksanaan Aktivitas" },
        { key: "UPLOAD_ACTIVITY", label: "Upload Bukti Kegiatan" },
        { key: "RATING", label: "Rating Guru" },
    ];

    return steps.map((step) => ({
        ...step,
        status: status[step.key] ? "SELESAI" : "PROSES",
    }));
}

function DashboardPanel({ title, subtitle, right, children, className = "" }) {
    return (
        <section
            className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
        >
            {(title || right) && (
                <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0">
                        <h2 className="text-[16px] font-black tracking-tight text-slate-800">
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="mt-1 text-[11px] font-semibold leading-5 text-slate-400">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {right && <div className="shrink-0">{right}</div>}
                </div>
            )}
            {children}
        </section>
    );
}

function MetricCard({ label, value, helper, icon, color }) {
    return (
        <div className="relative min-h-[102px] overflow-hidden border-r border-slate-100 bg-white px-5 py-4 last:border-r-0">
            <div
                className="absolute inset-x-0 top-0 h-1"
                style={{ backgroundColor: color }}
            />
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p
                        className="truncate text-[10px] font-black uppercase tracking-[0.14em]"
                        style={{ color }}
                    >
                        {label}
                    </p>
                    <p className="mt-2 text-[31px] font-black leading-none tracking-[-0.05em] text-slate-800">
                        {value}
                    </p>
                    <p className="mt-2 truncate text-[10px] font-semibold text-slate-400">
                        {helper}
                    </p>
                </div>
                <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: `${color}16`, color }}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

function ExecutiveVisualControlPanel({
    modes = [],
    activeMode,
    stageLabel,
    pillarLabel,
    countyLabel,
    resultCount,
    totalCount,
    onSelectMode,
    onResetSlices,
}) {
    const activeModeMeta = modes.find((item) => item.key === activeMode) || modes[0];
    const selectionLabels = [stageLabel, pillarLabel, countyLabel].filter(Boolean);
    const hasSliceSelection = selectionLabels.length > 0;
    const percent = totalCount ? Math.round((resultCount / totalCount) * 100) : 0;

    return (
        <DashboardPanel className="shrink-0 overflow-hidden">
            <div className="flex flex-col gap-2.5 px-4 py-2.5 xl:flex-row xl:items-center">
                <div className="flex min-w-0 shrink-0 items-center gap-2.5 xl:w-[160px]">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-[#0AC4E0]">
                        <Target size={17} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#0AC4E0]">
                            Pilih Data
                        </p>
                        <p className="mt-0.5 text-[9px] font-semibold text-slate-400">
                            Klik untuk ubah diagram.
                        </p>
                    </div>
                </div>

                <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
                    {modes.map((mode) => {
                        const selected = mode.key === activeMode;

                        return (
                            <button
                                type="button"
                                key={mode.key}
                                onClick={() => onSelectMode(mode.key)}
                                title={mode.helper}
                                className={`group flex min-w-0 items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition active:scale-[0.98] ${selected
                                    ? "shadow-[0_7px_20px_rgba(15,23,42,0.09)]"
                                    : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-sm"
                                    }`}
                                style={
                                    selected
                                        ? {
                                            borderColor: `${mode.color}66`,
                                            backgroundColor: `${mode.color}0D`,
                                        }
                                        : undefined
                                }
                            >
                                <span
                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition ${selected
                                        ? "text-white"
                                        : "bg-slate-100 text-slate-500 group-hover:bg-cyan-50 group-hover:text-[#0AC4E0]"
                                        }`}
                                    style={selected ? { backgroundColor: mode.color } : undefined}
                                >
                                    {mode.icon}
                                </span>
                                <span className="min-w-0">
                                    <span
                                        className={`block truncate text-[9px] font-black ${selected ? "" : "text-slate-600"
                                            }`}
                                        style={selected ? { color: mode.color } : undefined}
                                    >
                                        {mode.label}
                                    </span>
                                    <span className="mt-0.5 block truncate text-[11px] font-black text-slate-800">
                                        {mode.count} program
                                    </span>
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div
                    className="flex shrink-0 items-center justify-between gap-3 rounded-xl border bg-slate-50 px-3 py-2 xl:w-[180px]"
                    style={{ borderColor: `${activeModeMeta?.color || "#0AC4E0"}55` }}
                >
                    <div className="min-w-0">
                        <p className="truncate text-[8px] font-black uppercase tracking-[0.13em] text-slate-400">
                            Dilihat
                        </p>
                        <p className="mt-0.5 truncate text-[11px] font-black text-slate-700">
                            {activeModeMeta?.label || "Semua"}
                            {hasSliceSelection ? ` · ${selectionLabels.join(" × ")}` : ""}
                        </p>
                        <p className="mt-0.5 text-[8px] font-bold text-slate-400">
                            {resultCount} program · {percent}%
                        </p>
                    </div>

                    {hasSliceSelection && (
                        <button
                            type="button"
                            onClick={onResetSlices}
                            title="Hapus pilihan diagram"
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:border-cyan-200 hover:text-[#0AC4E0] active:scale-95"
                        >
                            <RotateCcw size={13} />
                        </button>
                    )}
                </div>
            </div>
        </DashboardPanel>
    );
}

function SearchBox({ value, onChange, placeholder }) {
    return (
        <div className="relative min-w-[220px] flex-1">
            <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
            />
            <input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-[11px] font-semibold text-slate-600 outline-none transition placeholder:text-slate-300 focus:border-[#0AC4E0] focus:ring-2 focus:ring-[#0AC4E0]/15"
            />
        </div>
    );
}

function DropdownFilter({
    value,
    onChange,
    items = [],
    placeholder = "Pilih Filter",
    ariaLabel = "Filter",
    width = "w-full sm:w-[170px]",
}) {
    return (
        <div aria-label={ariaLabel} className="min-w-[150px]">
            <Dropdown
                value={value}
                onChange={onChange}
                items={items}
                placeholder={placeholder}
                width={width}
                usePortal
            />
        </div>
    );
}

function EmptyState({ title }) {
    return (
        <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-[#0AC4E0]">
                <BarChart3 size={24} />
            </div>
            <h3 className="mt-4 text-[14px] font-black text-slate-700">{title}</h3>
        </div>
    );
}

function PillarBadge({ pillarKey }) {
    const meta = PILLAR_META[pillarKey] || PILLAR_META.AKADEMIK;

    return (
        <span
            className="inline-flex rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wide"
            style={{
                color: meta.color,
                backgroundColor: meta.soft,
                borderColor: `${meta.color}30`,
            }}
        >
            {meta.label}
        </span>
    );
}

function StatusPieCard({
    title,
    total,
    rows = [],
    icon,
    helper,
    showProgress = true,
    description = "Distribusi status berdasarkan filter dashboard aktif",
    className = "",
    interactive = false,
    selectedKey = "",
    onSelect,
    emphasizeChart = false,
    compactSummary = false,
}) {
    const visibleRows = rows.filter((item) => Number(item.value || 0) > 0);
    const summaryRows = rows.map((item) => ({
        ...item,
        percent: total ? Math.round((Number(item.value || 0) / total) * 100) : 0,
    }));

    return (
        <DashboardPanel className={`flex min-h-0 flex-col overflow-hidden ${className}`}>
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0AC4E0]">
                            {title}
                        </p>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-slate-500">
                            {helper}
                        </span>
                    </div>
                    <p className="mt-1 text-[11px] font-semibold text-slate-400">
                        {description}
                    </p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-[#0AC4E0] shadow-sm">
                    {icon}
                </div>
            </div>

            <div className={`grid min-h-0 flex-1 gap-4 px-4 py-4 md:items-stretch ${emphasizeChart
                ? "md:grid-cols-[minmax(250px,1fr)_minmax(250px,1fr)]"
                : "md:grid-cols-[minmax(190px,0.92fr)_minmax(210px,1.08fr)]"
                }`}>
                <div
                    className={`relative min-w-0 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-cyan-50/40 ${emphasizeChart ? "h-full min-h-[300px]" : "min-h-[210px]"
                        }`}
                >
                    {visibleRows.length ? (
                        <div
                            className={emphasizeChart ? "h-full translate-y-[58px]" : "h-full"}
                        >
                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                                minWidth={0}
                                minHeight={emphasizeChart ? 300 : 210}
                                debounce={50}
                            >
                                {({ width, height }) => {
                                    const radiusBase = Math.min(width, height);
                                    const outerRadius = emphasizeChart
                                        ? Math.max(
                                            94,
                                            Math.min(126, Math.round(radiusBase * 0.43)),
                                        )
                                        : Math.max(
                                            65,
                                            Math.min(88, Math.round(radiusBase * 0.39)),
                                        );

                                    return (
                                        <PieChart>
                                            <Pie
                                                data={visibleRows}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy={emphasizeChart ? "56%" : "50%"}
                                                innerRadius={0}
                                                outerRadius={outerRadius}
                                                paddingAngle={2}
                                                cornerRadius={8}
                                                startAngle={90}
                                                endAngle={-270}
                                                stroke="#ffffff"
                                                strokeWidth={2}
                                                labelLine={false}
                                                style={{ cursor: interactive ? "pointer" : "default" }}
                                                onClick={(entry) => {
                                                    const key = entry?.key || entry?.payload?.key;
                                                    if (interactive && key && onSelect) onSelect(key);
                                                }}
                                            >
                                                {visibleRows.map((item) => {
                                                    const rowKey = item.key || item.name;
                                                    const isSelected = selectedKey === rowKey;
                                                    const isDimmed = selectedKey && !isSelected;

                                                    return (
                                                        <Cell
                                                            key={rowKey}
                                                            fill={item.color}
                                                            opacity={isDimmed ? 0.28 : 1}
                                                            stroke={isSelected ? item.color : "#ffffff"}
                                                            strokeWidth={isSelected ? 5 : 2}
                                                        />
                                                    );
                                                })}
                                            </Pie>
                                            <RechartsTooltip
                                                formatter={(value, name) => [
                                                    `${value} data`,
                                                    name,
                                                ]}
                                                contentStyle={{
                                                    borderRadius: 14,
                                                    border: "1px solid #E2E8F0",
                                                    boxShadow: "0 14px 34px rgba(15, 23, 42, 0.12)",
                                                    fontSize: 11,
                                                    fontWeight: 800,
                                                }}
                                            />
                                        </PieChart>
                                    );
                                }}
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex h-full min-h-[210px] items-center justify-center px-4 text-center">
                            <p className="text-[11px] font-black uppercase tracking-wide text-slate-300">
                                Belum ada data
                            </p>
                        </div>
                    )}

                    <div
                        className={`pointer-events-none absolute left-1/2 -translate-x-1/2 ${emphasizeChart ? "bottom-7" : "bottom-3"
                            }`}
                    >
                        <div className="inline-flex min-w-[154px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-[0_16px_38px_rgba(15,23,42,0.16)]">
                            <span className="flex h-10 min-w-[42px] shrink-0 items-center justify-center rounded-xl bg-slate-900 px-2 text-[20px] font-black leading-none text-white shadow-sm">
                                {total}
                            </span>
                            <span className="min-w-0 pr-1 text-left">
                                <span className="block whitespace-nowrap text-[8px] font-black uppercase tracking-[0.18em] text-slate-400">
                                    Total Data
                                </span>
                                <span
                                    className="mt-0.5 block whitespace-nowrap text-[10px] font-black leading-none text-slate-700"
                                    style={{ wordBreak: "keep-all", overflowWrap: "normal" }}
                                >
                                    {title}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>

                <div
                    className={`grid content-center ${compactSummary ? "gap-1" : "gap-2"}`}
                >
                    {summaryRows.map((item) => {
                        const isLit = Number(item.value || 0) > 0;
                        const rowKey = item.key || item.name;
                        const isSelected = selectedKey === rowKey;
                        const isDimmed = selectedKey && !isSelected;

                        return (
                            <button
                                type="button"
                                key={rowKey}
                                disabled={!interactive}
                                onClick={() => {
                                    if (interactive && onSelect) onSelect(rowKey);
                                }}
                                className={`w-full rounded-xl border text-left shadow-sm transition ${compactSummary ? "px-2.5 py-1.5" : "px-3 py-2.5"
                                    } ${interactive ? "cursor-pointer hover:-translate-y-0.5" : "cursor-default"
                                    } ${isLit ? "bg-white" : "bg-slate-50/70 opacity-60"} ${isDimmed ? "opacity-40" : ""
                                    }`}
                                style={{
                                    borderColor: isSelected
                                        ? item.color
                                        : isLit
                                            ? `${item.color}65`
                                            : "#E2E8F0",
                                    boxShadow: isSelected
                                        ? `0 0 0 3px ${item.color}20, 0 10px 28px ${item.color}20`
                                        : isLit
                                            ? `0 8px 24px ${item.color}14`
                                            : "none",
                                }}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <span className="inline-flex min-w-0 items-center gap-2 text-[9px] font-black uppercase tracking-wide text-slate-600">
                                        <span
                                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                                            style={{
                                                backgroundColor: isLit ? item.color : "#CBD5E1",
                                                boxShadow: isLit ? `0 0 0 4px ${item.color}16` : "none",
                                            }}
                                        />
                                        <span className="truncate">{item.name}</span>
                                    </span>
                                    <span
                                        className="shrink-0 text-[12px] font-black"
                                        style={{ color: isLit ? item.color : "#94A3B8" }}
                                    >
                                        {item.value}
                                    </span>
                                </div>

                                {showProgress ? (
                                    <div
                                        className={`${compactSummary ? "mt-1" : "mt-2"} flex items-center gap-2`}
                                    >
                                        <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${item.percent}%`,
                                                    backgroundColor: item.color,
                                                }}
                                            />
                                        </div>
                                        <span
                                            className="w-9 text-right text-[9px] font-black"
                                            style={{ color: item.color }}
                                        >
                                            {item.percent}%
                                        </span>
                                    </div>
                                ) : (
                                    <p
                                        className="mt-2 line-clamp-2 text-[8px] font-bold leading-4"
                                        style={{ color: isLit ? item.color : "#94A3B8" }}
                                    >
                                        {item.detail || (isLit ? "Status aktif" : "Tidak ada data")}
                                    </p>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </DashboardPanel>
    );
}

function VisualProcessPanel({
    mode = "PROGRAM",
    query,
    setQuery,
    item,
    steps = [],
    targets = [],
    getTitle,
    getCode,
    nowMs = Date.now(),
    staggeredHeader = true,
}) {
    const isAssessment = mode === "ASSESSMENT";
    const hasQuery = normalizeText(query).length > 1;
    const assessmentMeta = item ? getAssessmentStageMeta(item) : ASSESSMENT_STATUS_META.DRAFT;
    const teacherProgress = item ? getAssessmentTeacherProgress(item) : {
        target: 0,
        filled: 0,
        remaining: 0,
        percent: 0,
    };
    const assessmentTiming = item ? getAssessmentTiming(item, nowMs) : {
        remainingSeconds: null,
        deadline: null,
        paused: false,
    };
    const deadline = assessmentTiming.deadline;

    const programFlowSteps = steps.map((step, index) => {
        const label = typeof step === "string" ? step : step?.label;
        const done = typeof step === "string" ? false : step?.status === "SELESAI";

        return {
            label: label || `Langkah ${index + 1}`,
            status: done ? "SELESAI" : "PROSES",
            color: done ? STATUS_PIE_COLORS.SELESAI : STATUS_PIE_COLORS.PROSES,
            soft: done ? "#ECFDF5" : "#FFFBEB",
            border: done ? "#00C68D55" : "#FFD40066",
        };
    });

    const schoolBoxes = targets.map((target) => ({
        label: "Sekolah Target",
        value: target.name,
        helper: target.county || target.area || "Wilayah belum terbaca",
        icon: <School size={15} />,
    }));

    const assessmentBoxes = item
        ? [
            {
                label: "HO Pengirim",
                value: getAssessmentSenderName(item),
                helper: item?.sent_at ? `Dikirim ${formatDate(item.sent_at)}` : "Assessment belum dikirim",
                icon: <UserRound size={15} />,
            },
            ...schoolBoxes,
            {
                label: "Guru Wajib Mengisi",
                value: `${teacherProgress.target} guru`,
                helper: `${teacherProgress.remaining} guru belum mengisi`,
                icon: <UsersRound size={15} />,
            },
            {
                label: "Progress Pengisian",
                value: `${teacherProgress.filled}/${teacherProgress.target} guru`,
                helper: `${teacherProgress.percent}% telah mengisi`,
                icon: <FileCheck2 size={15} />,
            },
            {
                label: assessmentTiming.paused ? "Waktu Dipending" : "Sisa Waktu Pengisian",
                value: formatAssessmentCountdown(assessmentTiming.remainingSeconds),
                helper: assessmentTiming.paused
                    ? "Timer berhenti dan akan berjalan lagi saat dilanjutkan"
                    : item?.sent_at
                        ? `Berakhir ${formatDate(deadline)}`
                        : "Tenggat berjalan setelah assessment dikirim",
                icon: <CalendarClock size={15} />,
            },
        ]
        : [];

    const PROCESS_ITEMS_PER_PAGE = 8;
    const selectedItemKey =
        item?.id_program || item?.id_assessment || item?.id || "empty";
    const [processPage, setProcessPage] = useState(1);
    const processItems = isAssessment ? assessmentBoxes : programFlowSteps;
    const processTotalPages = Math.max(
        1,
        Math.ceil(processItems.length / PROCESS_ITEMS_PER_PAGE),
    );
    const processStartIndex = (processPage - 1) * PROCESS_ITEMS_PER_PAGE;
    const paginatedProcessItems = processItems.slice(
        processStartIndex,
        processStartIndex + PROCESS_ITEMS_PER_PAGE,
    );

    useEffect(() => {
        setProcessPage(1);
    }, [mode, selectedItemKey]);

    useEffect(() => {
        if (processPage > processTotalPages) {
            setProcessPage(processTotalPages);
        }
    }, [processPage, processTotalPages]);

    const legends = isAssessment
        ? Object.values(ASSESSMENT_STATUS_META)
        : [
            {
                key: "PROSES",
                label: "Sedang Proses",
                color: STATUS_PIE_COLORS.PROSES,
            },
            {
                key: "SELESAI",
                label: "Selesai",
                color: STATUS_PIE_COLORS.SELESAI,
            },
        ];

    return (
        <DashboardPanel
            className={`relative min-h-0 ${staggeredHeader
                ? "!overflow-visible xl:rounded-tl-none"
                : "overflow-hidden"
                }`}
        >
            {staggeredHeader && (
                <>
                    <div
                        aria-hidden="true"
                        className="absolute -left-px -top-[104px] hidden h-[105px] w-[calc(50%_-_5px)] rounded-t-2xl border border-b-0 border-slate-200 bg-white shadow-sm xl:block"
                    />
                    <div className="absolute -top-[82px] left-5 z-10 hidden w-[calc(50%_-_46px)] xl:block">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0AC4E0]">
                            Visual Proses
                        </p>
                        {item ? (
                            <div className="mt-2 min-w-0">
                                <p className="truncate text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                                    {getCode(item)}
                                </p>
                                <h2 className="mt-1 line-clamp-2 text-[19px] font-black leading-tight text-slate-900">
                                    {getTitle(item)}
                                </h2>
                            </div>
                        ) : (
                            <h2 className="mt-2 text-[19px] font-black leading-tight text-slate-900">
                                Pilih {isAssessment ? "Assessment" : "Program"}
                            </h2>
                        )}
                    </div>
                </>
            )}

            <div className="flex h-full min-h-0 flex-col px-5 py-4">
                <div className="grid shrink-0 gap-3 border-b border-slate-100 pb-4 xl:grid-cols-[minmax(260px,0.4fr)_minmax(320px,0.6fr)] xl:items-start">
                    <div className={`min-w-0 pt-1 ${staggeredHeader ? "xl:hidden" : ""}`}>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0AC4E0]">
                            Visual Proses
                        </p>
                        {item ? (
                            <div className="mt-2 min-w-0">
                                <p className="truncate text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                                    {getCode(item)}
                                </p>
                                <h2 className="mt-1 line-clamp-2 text-[18px] font-black leading-tight text-slate-900">
                                    {getTitle(item)}
                                </h2>
                            </div>
                        ) : (
                            <h2 className="mt-2 text-[18px] font-black text-slate-900">
                                Pilih {isAssessment ? "Assessment" : "Program"}
                            </h2>
                        )}
                    </div>
                    <div
                        className={`min-w-0 xl:w-[420px] xl:self-start xl:justify-self-end ${staggeredHeader ? "xl:col-start-2" : ""
                            }`}
                    >
                        <SearchBox
                            value={query}
                            onChange={setQuery}
                            placeholder={`Ketik nama ${isAssessment ? "assessment" : "program"}...`}
                        />
                    </div>
                </div>

                <div className="relative min-h-0 flex-1 overflow-hidden pt-5">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={`${mode}-${item?.id_program || item?.id_assessment || item?.id || "empty"}`}
                            initial={{ opacity: 0, rotateY: 75, scale: 0.98 }}
                            animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                            exit={{ opacity: 0, rotateY: -75, scale: 0.98 }}
                            transition={{ duration: 0.32, ease: "easeInOut" }}
                            style={{ transformPerspective: 1200 }}
                            className="h-full"
                        >
                            {item ? (
                                <div className="flex h-full min-h-0 flex-col">
                                    <div className="flex shrink-0 justify-end">
                                        {isAssessment ? (
                                            <span
                                                className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-wide"
                                                style={{
                                                    color: assessmentMeta.color,
                                                    backgroundColor: assessmentMeta.soft,
                                                    borderColor: assessmentMeta.border,
                                                }}
                                            >
                                                <span
                                                    className="h-2 w-2 rounded-full"
                                                    style={{ backgroundColor: assessmentMeta.color }}
                                                />
                                                {assessmentMeta.label}
                                            </span>
                                        ) : (
                                            <PillarBadge pillarKey={getPillarKey(item)} />
                                        )}
                                    </div>

                                    <div className="mt-2 flex min-h-0 flex-1 flex-col justify-center">
                                        {isAssessment ? (
                                            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-4">
                                                {paginatedProcessItems.map((box, index) => (
                                                    <div
                                                        key={`${box.label}-${box.value}-${processStartIndex + index}`}
                                                        className="relative min-h-[78px] rounded-xl border px-3 py-2.5 shadow-sm"
                                                        style={{
                                                            backgroundColor: assessmentMeta.soft,
                                                            borderColor: assessmentMeta.border,
                                                        }}
                                                    >
                                                        <span
                                                            className="absolute -top-2 left-3 flex h-6 min-w-[24px] items-center justify-center rounded-full border-2 border-white px-1.5 text-white shadow-sm"
                                                            style={{ backgroundColor: assessmentMeta.color }}
                                                        >
                                                            {box.icon}
                                                        </span>
                                                        <p
                                                            className="mt-2 text-[8px] font-black uppercase tracking-[0.13em]"
                                                            style={{ color: assessmentMeta.color }}
                                                        >
                                                            {box.label}
                                                        </p>
                                                        <p className="mt-1 line-clamp-2 text-[10px] font-black leading-4 text-slate-800">
                                                            {box.value}
                                                        </p>
                                                        <p className="mt-1 line-clamp-1 text-[8px] font-semibold text-slate-400">
                                                            {box.helper}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-4">
                                                {paginatedProcessItems.map((step, index) => (
                                                    <div
                                                        key={`${step.label}-${processStartIndex + index}`}
                                                        className="relative min-h-[66px] rounded-xl border px-3 py-2 shadow-sm transition"
                                                        style={{
                                                            backgroundColor: step.soft,
                                                            borderColor: step.border,
                                                        }}
                                                    >
                                                        <span
                                                            className="absolute -top-2 left-3 flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-white px-1 text-[9px] font-black text-white shadow-sm"
                                                            style={{ backgroundColor: step.color }}
                                                        >
                                                            {processStartIndex + index + 1}
                                                        </span>
                                                        <p className="mt-2 line-clamp-2 text-[10px] font-black leading-4 text-slate-800">
                                                            {step.label}
                                                        </p>
                                                        <p
                                                            className="mt-1 text-[8px] font-black uppercase tracking-wide"
                                                            style={{ color: step.color }}
                                                        >
                                                            {step.status === "SELESAI" ? "Selesai" : "Proses"}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {processTotalPages > 1 && (
                                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
                                                <p className="text-[9px] font-bold text-slate-400">
                                                    Menampilkan {processStartIndex + 1}–{Math.min(processStartIndex + PROCESS_ITEMS_PER_PAGE, processItems.length)} dari {processItems.length} kotak proses
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setProcessPage((current) => Math.max(1, current - 1))}
                                                        disabled={processPage <= 1}
                                                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-[9px] font-black uppercase tracking-wide text-slate-600 transition hover:border-cyan-200 hover:text-[#0AC4E0] disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        <ChevronLeft size={13} /> Prev
                                                    </button>
                                                    <span className="inline-flex h-8 min-w-[54px] items-center justify-center rounded-lg bg-slate-900 px-3 text-[10px] font-black text-white">
                                                        {processPage}/{processTotalPages}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setProcessPage((current) => Math.min(processTotalPages, current + 1))}
                                                        disabled={processPage >= processTotalPages}
                                                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-[9px] font-black uppercase tracking-wide text-slate-600 transition hover:border-cyan-200 hover:text-[#0AC4E0] disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        Next <ChevronRight size={13} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 border-t border-slate-100 pt-3">
                                            {legends.map((legend) => (
                                                <span
                                                    key={legend.key}
                                                    className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-wide text-slate-500"
                                                >
                                                    <span
                                                        className="h-3 w-3 rounded"
                                                        style={{ backgroundColor: legend.color }}
                                                    />
                                                    {legend.label}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex h-full min-h-[205px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 text-center">
                                    <ChartPie size={28} className="text-slate-300" />
                                    <p className="mt-3 text-[12px] font-black text-slate-600">
                                        {hasQuery
                                            ? `${isAssessment ? "Assessment" : "Program"} tidak ditemukan`
                                            : "Visual proses siap ditampilkan"}
                                    </p>
                                    <p className="mt-1 max-w-[380px] text-[10px] font-semibold leading-5 text-slate-400">
                                        {hasQuery
                                            ? `Coba gunakan kata kunci lain dari nama ${isAssessment ? "assessment" : "program"}.`
                                            : `Pilih salah satu ${isAssessment ? "assessment" : "program"} dari daftar terfilter untuk melihat detail visualnya.`}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </DashboardPanel>
    );
}

function CompactMonitoringList({
    mode = "PROGRAM",
    onFlip,
    rows = [],
    totalCount = rows.length,
    page,
    totalPages,
    setPage,
    getTitle,
    getCode,
    getYear = getItemYear,
    onSelectVisual,
}) {
    const isAssessment = mode === "ASSESSMENT";

    return (
        <DashboardPanel className="flex min-h-0 flex-col overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={mode}
                    initial={{ opacity: 0, rotateY: 90 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    exit={{ opacity: 0, rotateY: -90 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    style={{ transformPerspective: 1200 }}
                    className="flex h-full min-h-0 flex-col"
                >
                    <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
                        <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0AC4E0]">
                                List {isAssessment ? "Assessment" : "Program"}
                            </p>
                            <h2 className="mt-2 text-[18px] font-black text-slate-900">
                                {isAssessment ? "Assessment" : "Program"} Terfilter
                            </h2>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black text-slate-500">
                                {totalCount} data
                            </span>
                            <button
                                type="button"
                                onClick={onFlip}
                                title={`Flip ke list ${isAssessment ? "program" : "assessment"}`}
                                className="group inline-flex h-9 items-center gap-2 rounded-xl border border-cyan-100 bg-cyan-50 px-3 text-[9px] font-black uppercase tracking-wide text-[#0AC4E0] transition hover:border-[#0AC4E0] hover:bg-[#0AC4E0] hover:text-white active:scale-95"
                            >
                                <RotateCcw
                                    size={13}
                                    className="transition-transform duration-500 group-hover:rotate-180"
                                />
                                Flip
                            </button>
                        </div>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                        {rows.length ? (
                            <div className="grid gap-3">
                                {rows.map((row) => {
                                    const assessmentMeta = isAssessment
                                        ? getAssessmentStageMeta(row)
                                        : null;
                                    const teacherProgress = isAssessment
                                        ? getAssessmentTeacherProgress(row)
                                        : null;
                                    const schoolNames = isAssessment
                                        ? collectSchoolNames(row)
                                        : [];

                                    return (
                                        <button
                                            key={
                                                row?.id_program ||
                                                row?.id_assessment ||
                                                row?.id ||
                                                getTitle(row)
                                            }
                                            type="button"
                                            onClick={() => onSelectVisual?.(row)}
                                            className="group w-full rounded-2xl border border-slate-100 bg-white px-4 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-300">
                                                        {getCode(row)}
                                                    </p>
                                                    <h3 className="mt-1 line-clamp-2 text-[13px] font-black leading-5 text-slate-900">
                                                        {getTitle(row)}
                                                    </h3>
                                                    <div className="mt-2">
                                                        {isAssessment ? (
                                                            <span
                                                                className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-wide"
                                                                style={{
                                                                    color: assessmentMeta.color,
                                                                    backgroundColor: assessmentMeta.soft,
                                                                    borderColor: assessmentMeta.border,
                                                                }}
                                                            >
                                                                <span
                                                                    className="h-2 w-2 rounded-full"
                                                                    style={{ backgroundColor: assessmentMeta.color }}
                                                                />
                                                                {assessmentMeta.label}
                                                            </span>
                                                        ) : (
                                                            <PillarBadge pillarKey={getPillarKey(row)} />
                                                        )}
                                                    </div>
                                                </div>
                                                {isAssessment ? (
                                                    <div className="shrink-0 text-right">
                                                        <p className="text-[18px] font-black leading-none text-slate-900">
                                                            {teacherProgress.filled}/{teacherProgress.target}
                                                        </p>
                                                        <p className="mt-1 text-[8px] font-black uppercase tracking-wide text-slate-400">
                                                            Guru Mengisi
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <ProgramRatingStars
                                                        program={row}
                                                        size={15}
                                                        compact
                                                        className="shrink-0 items-end"
                                                    />
                                                )}
                                            </div>

                                            {isAssessment && (
                                                <div className="mt-3 grid gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
                                                    <div className="flex min-w-0 items-center gap-2 text-[9px] font-bold text-slate-500">
                                                        <UserRound size={12} className="shrink-0 text-[#0AC4E0]" />
                                                        <span className="truncate">
                                                            HO: {getAssessmentSenderName(row)}
                                                        </span>
                                                    </div>
                                                    <div className="flex min-w-0 items-center gap-2 text-[9px] font-bold text-slate-500">
                                                        <School size={12} className="shrink-0 text-[#0AC4E0]" />
                                                        <span className="line-clamp-1">
                                                            {schoolNames.length
                                                                ? schoolNames.join(", ")
                                                                : "Sekolah target belum terbaca"}
                                                        </span>
                                                    </div>
                                                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-500"
                                                            style={{
                                                                width: `${teacherProgress.percent}%`,
                                                                backgroundColor: assessmentMeta.color,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-2">
                                                <span className="text-[9px] font-black uppercase tracking-wide text-slate-300">
                                                    Klik untuk visual proses
                                                </span>
                                                <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-slate-500">
                                                    {isAssessment
                                                        ? row?.sent_at
                                                            ? `Tenggat ${formatDate(getAssessmentDeadline(row))}`
                                                            : "Belum Dikirim"
                                                        : `Tahun ${getYear(row)}`}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex h-full min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 text-center">
                                <p className="text-[11px] font-black uppercase tracking-wide text-slate-300">
                                    Belum ada {isAssessment ? "assessment" : "program"} pada filter ini
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() => setPage((current) => Math.max(current - 1, 1))}
                            className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-[10px] font-black uppercase tracking-wide text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft size={13} /> Prev
                        </button>
                        <span className="rounded-full bg-slate-900 px-4 py-2 text-[10px] font-black text-white">
                            {page} / {totalPages}
                        </span>
                        <button
                            type="button"
                            disabled={page >= totalPages}
                            onClick={() =>
                                setPage((current) => Math.min(current + 1, totalPages))
                            }
                            className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-[10px] font-black uppercase tracking-wide text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next <ChevronRight size={13} />
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </DashboardPanel>
    );
}

function CoverageTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;

    const visible = payload.filter((item) => Number(item?.value || 0) > 0);

    return (
        <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-xl">
            <p className="mb-2 max-w-[260px] text-[11px] font-black text-slate-800">
                {label}
            </p>
            <div className="space-y-1.5">
                {visible.map((item) => (
                    <div
                        key={item.dataKey}
                        className="flex items-center justify-between gap-6 text-[10px] font-bold"
                    >
                        <span className="flex items-center gap-2 text-slate-500">
                            <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            {item.name}
                        </span>
                        <span className="font-black text-slate-800">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function CoverageChart({ rows, visiblePillars, chartType = "BAR" }) {
    if (!rows.length) {
        return (
            <EmptyState
                title="Data diagram belum tersedia"
            />
        );
    }

    const pieRows = visiblePillars
        .map((pillarKey) => {
            const meta = PILLAR_META[pillarKey];

            return {
                key: pillarKey,
                name: meta.label,
                value: rows.reduce(
                    (total, row) => total + Number(row?.[meta.chartKey] || 0),
                    0,
                ),
                color: meta.color,
            };
        })
        .filter((item) => item.value > 0);

    const totalPie = pieRows.reduce((total, item) => total + item.value, 0);

    if (chartType === "PIE") {
        if (!pieRows.length) {
            return (
                <EmptyState
                    title="Komposisi pilar belum tersedia"
                />
            );
        }

        return (
            <div className="grid min-h-[360px] min-w-0 items-center gap-5 lg:grid-cols-[minmax(320px,0.62fr)_minmax(240px,0.38fr)]">
                <div className="relative flex min-h-[320px] min-w-0 items-center justify-center rounded-2xl bg-slate-50/60">
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                        minWidth={0}
                        minHeight={300}
                        debounce={50}
                    >
                        {({ width, height }) => {
                            const radiusBase = Math.min(width, height);
                            const outerRadius = Math.max(
                                104,
                                Math.min(136, Math.round(radiusBase * 0.38)),
                            );

                            return (
                                <PieChart>
                                    <Pie
                                        data={pieRows}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={0}
                                        outerRadius={outerRadius}
                                        paddingAngle={2}
                                        stroke="#ffffff"
                                        strokeWidth={2}
                                        labelLine={false}
                                        label={({ percent }) =>
                                            percent >= 0.08
                                                ? `${Math.round(percent * 100)}%`
                                                : ""
                                        }
                                    >
                                        {pieRows.map((item) => (
                                            <Cell key={item.key} fill={item.color} />
                                        ))}
                                    </Pie>

                                    <RechartsTooltip
                                        formatter={(value, name) => [
                                            `${value} data`,
                                            name,
                                        ]}
                                    />
                                </PieChart>
                            );
                        }}
                    </ResponsiveContainer>
                </div>

                <div className="grid content-center gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <div className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4">
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-500">
                            Total Data
                        </p>
                        <p className="mt-2 text-[34px] font-black leading-none text-slate-900">
                            {totalPie}
                        </p>
                        <p className="mt-2 text-[11px] font-semibold text-slate-500">
                            Komposisi mengikuti filter aktif.
                        </p>
                    </div>

                    {pieRows.map((item) => {
                        const percent = totalPie
                            ? Math.round((item.value / totalPie) * 100)
                            : 0;

                        return (
                            <div
                                key={item.key}
                                className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100/70"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <span className="flex min-w-0 items-center gap-2 text-[10px] font-black uppercase tracking-wide text-slate-500">
                                        <span
                                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        {item.name}
                                    </span>
                                    <span
                                        className="rounded-full px-2.5 py-1 text-[10px] font-black"
                                        style={{
                                            color: item.color,
                                            backgroundColor: `${item.color}14`,
                                        }}
                                    >
                                        {percent}%
                                    </span>
                                </div>
                                <p className="mt-3 text-[26px] font-black leading-none text-slate-900">
                                    {item.value}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    const rowCount = rows.length;
    const chartHeight = rowCount <= 8 ? 390 : 430;
    const barSize = rowCount <= 3 ? 58 : rowCount <= 8 ? 48 : 34;
    const chartWidth =
        rowCount <= 8 ? "100%" : `${Math.max(1280, rowCount * 136)}px`;
    const maxTotal = Math.max(...rows.map((row) => Number(row.total || 0)), 0);
    const yAxisMax = Math.max(3, Math.ceil(maxTotal * 1.2));

    return (
        <div className="flex min-h-full min-w-0 flex-col">
            <div className="mb-4 flex flex-wrap gap-3">
                {visiblePillars.map((pillarKey) => {
                    const meta = PILLAR_META[pillarKey];

                    return (
                        <span
                            key={pillarKey}
                            className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-wide text-slate-500"
                        >
                            <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: meta.color }}
                            />
                            {meta.label}
                        </span>
                    );
                })}
            </div>

            <div className="flex min-h-[430px] flex-1 min-w-0 items-stretch overflow-x-auto overflow-y-hidden pb-1">
                <div
                    className="min-w-0"
                    style={{
                        height: chartHeight,
                        width: chartWidth,
                        minWidth: rowCount <= 8 ? 0 : 920,
                    }}
                >
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                        minWidth={0}
                        minHeight={0}
                        debounce={50}
                    >
                        <BarChart
                            data={rows}
                            margin={{ top: 24, right: 18, left: -8, bottom: 38 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="#E2E8F0"
                            />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                interval={0}
                                tick={{ fontSize: 10, fontWeight: 900, fill: "#475569" }}
                                tickMargin={14}
                                tickFormatter={(value) =>
                                    String(value || "").length > 16
                                        ? `${String(value).slice(0, 16)}...`
                                        : value
                                }
                            />
                            <YAxis
                                allowDecimals={false}
                                domain={[0, yAxisMax]}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fontWeight: 800, fill: "#94A3B8" }}
                            />
                            <RechartsTooltip content={<CoverageTooltip />} />

                            {visiblePillars.map((pillarKey) => {
                                const meta = PILLAR_META[pillarKey];

                                return (
                                    <Bar
                                        key={pillarKey}
                                        dataKey={meta.chartKey}
                                        name={meta.label}
                                        stackId="total"
                                        fill={meta.color}
                                        barSize={barSize}
                                        radius={
                                            pillarKey === visiblePillars.at(-1)
                                                ? [8, 8, 0, 0]
                                                : 0
                                        }
                                    />
                                );
                            })}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
function DataList({
    rows,
    type,
    getTitle,
    getCode,
    getStatus,
    resolveTargets,
    onItemClick,
    filterSignature,
}) {
    const [page, setPage] = useState(1);

    useEffect(() => {
        setPage(1);
    }, [filterSignature]);

    const totalPages = Math.max(Math.ceil(rows.length / ITEMS_PER_PAGE), 1);

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    const start = (page - 1) * ITEMS_PER_PAGE;
    const currentRows = rows.slice(start, start + ITEMS_PER_PAGE);
    const rangeStart = rows.length > 0 ? start + 1 : 0;
    const rangeEnd = Math.min(start + currentRows.length, rows.length);

    const pageNumbers = useMemo(() => {
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, index) => index + 1);
        }

        const first = Math.max(1, Math.min(page - 2, totalPages - 4));
        return Array.from({ length: 5 }, (_, index) => first + index);
    }, [page, totalPages]);

    return (
        <div className="flex min-h-[430px] flex-col">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Menampilkan {rangeStart}-{rangeEnd} dari {rows.length} data
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#0AC4E0]">
                    Halaman {page} / {totalPages}
                </p>
            </div>

            {currentRows.length === 0 ? (
                <EmptyState
                    title={`${type === "PROGRAM" ? "Program" : "Assessment"} tidak ditemukan`}
                    description="Ubah filter atau kata kunci pencarian untuk menampilkan data lain."
                />
            ) : (
                <div className="flex-1 divide-y divide-slate-100">
                    {currentRows.map((item, index) => {
                        const pillarKey = getPillarKey(item);
                        const meta = PILLAR_META[pillarKey];
                        const targets = resolveTargets(item);
                        const firstTarget = targets[0];
                        const status = statusText(item, getStatus);
                        const bucket = getProgressBucket(item, getStatus, type);
                        const id =
                            type === "PROGRAM"
                                ? item?.id_program || item?.id
                                : item?.id_assessment || item?.id;

                        return (
                            <button
                                key={`${type}-${id || start + index}`}
                                type="button"
                                onClick={() => onItemClick?.(item)}
                                className="group relative flex w-full items-center justify-between gap-4 overflow-hidden px-4 py-4 text-left transition hover:bg-slate-50"
                            >
                                <span
                                    className="absolute inset-y-0 left-0 w-1"
                                    style={{ backgroundColor: meta.color }}
                                />

                                <div className="min-w-0 flex-1 pl-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="max-w-[340px] truncate text-[12px] font-black text-slate-800">
                                            {getTitle(item)}
                                        </p>
                                        <PillarBadge pillarKey={pillarKey} />
                                    </div>

                                    <p className="mt-1 text-[10px] font-semibold text-slate-400">
                                        {getCode(item)} · {formatDate(getCreatedDate(item))}
                                    </p>

                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                        <span className="max-w-[270px] truncate rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-slate-500">
                                            {firstTarget?.name || "Sekolah belum terbaca"}
                                        </span>
                                        {targets.length > 1 && (
                                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-slate-400">
                                                +{targets.length - 1} sekolah
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-2 truncate text-[10px] font-semibold text-slate-400">
                                        {type === "PROGRAM"
                                            ? `${getProgramTypeLabel(getProgramType(item))} · Tahun ${item?.tahun || item?.year || "-"}`
                                            : `Target ${targets.length} sekolah · ${meta.group === "AKADEMIK" ? "Akademik" : "Non-Akademik"}`}
                                    </p>

                                    {type === "PROGRAM" && (
                                        <ProgramRatingStars
                                            program={item}
                                            size={13}
                                            className="mt-2"
                                        />
                                    )}
                                </div>

                                <div className="flex shrink-0 flex-col items-end gap-2">
                                    <span
                                        className={`inline-flex rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${bucket === "SELESAI"
                                            ? "bg-emerald-50 text-emerald-600"
                                            : "bg-amber-50 text-amber-600"
                                            }`}
                                    >
                                        {getProgressLabel(bucket)}
                                    </span>
                                    <span className="max-w-[130px] truncate text-[9px] font-bold uppercase tracking-wide text-slate-300">
                                        {status}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {ITEMS_PER_PAGE} data per halaman
                </span>

                <div className="flex flex-wrap items-center justify-center gap-1.5">
                    <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => setPage((current) => Math.max(current - 1, 1))}
                        className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black uppercase tracking-wide text-slate-500 transition hover:border-cyan-200 hover:text-[#0AC4E0] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ChevronLeft size={14} /> Prev
                    </button>

                    {pageNumbers.map((pageNumber) => (
                        <button
                            key={pageNumber}
                            type="button"
                            onClick={() => setPage(pageNumber)}
                            className={`flex h-9 min-w-9 items-center justify-center rounded-xl border px-2 text-[10px] font-black transition ${page === pageNumber
                                ? "border-[#0AC4E0] bg-[#0AC4E0] text-white shadow-sm"
                                : "border-slate-200 bg-white text-slate-500 hover:border-cyan-200 hover:text-[#0AC4E0]"
                                }`}
                        >
                            {pageNumber}
                        </button>
                    ))}

                    <button
                        type="button"
                        disabled={page >= totalPages}
                        onClick={() =>
                            setPage((current) => Math.min(current + 1, totalPages))
                        }
                        className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black uppercase tracking-wide text-slate-500 transition hover:border-cyan-200 hover:text-[#0AC4E0] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Next <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}

function AnalyticsSection({
    type,
    title,
    rows,
    chartRows,
    visiblePillars,
    groupFilter,
    setGroupFilter,
    pillarFilter,
    setPillarFilter,
    countyFilter,
    setCountyFilter,
    countyOptions,
    yearFilter,
    setYearFilter,
    yearOptions,
    groupBy,
    setGroupBy,
    typeFilter,
    setTypeFilter,
    progressFilter,
    setProgressFilter,
    search,
    setSearch,
    categoryFilter,
    getTitle,
    getCode,
    getStatus,
    resolveTargets,
    onItemClick,
}) {
    const allowedPillars =
        normalizeKey(categoryFilter) === "NON_AKADEMIK"
            ? ["SENI_BUDAYA", "KECAKAPAN_HIDUP"]
            : ["AKADEMIK", "KARAKTER"];

    const groupLabel =
        normalizeKey(categoryFilter) === "NON_AKADEMIK"
            ? "Non-Akademik"
            : "Akademik";

    const [chartType, setChartType] = useState("BAR");

    const filterSignature = [
        groupFilter,
        pillarFilter,
        countyFilter,
        yearFilter,
        groupBy,
        typeFilter,
        progressFilter,
        search,
    ].join("|");

    const groupFilterItems = [
        { value: "ALL", label: "Semua Kelompok" },
        { value: normalizeKey(categoryFilter), label: groupLabel },
    ];

    const pillarFilterItems = [
        { value: "ALL", label: "Semua Pilar" },
        ...allowedPillars.map((pillarKey) => ({
            value: pillarKey,
            label: PILLAR_META[pillarKey].label,
        })),
    ];

    const countyFilterItems = [
        { value: "ALL", label: "Semua Kabupaten" },
        ...countyOptions.map((county) => ({
            value: county,
            label: county,
        })),
    ];

    const yearFilterItems = [
        { value: "ALL", label: "Semua Tahun" },
        ...yearOptions.map((year) => ({
            value: year,
            label: year,
        })),
    ];

    const groupByItems = [
        { value: "WILAYAH", label: "Per Wilayah" },
        { value: "STATUS", label: "Per Status" },
    ];

    const typeFilterItems = [
        { value: "ALL", label: "Semua Jenis" },
        { value: "REGULER", label: "Reguler" },
        { value: "PROJECT", label: "Project" },
    ];

    const progressFilterItems = [
        { value: "ALL", label: "Semua Status" },
        { value: "PROSES", label: "Dalam Proses" },
        { value: "SELESAI", label: "Selesai" },
    ];
    return (
        <DashboardPanel
            title={title}
            className="flex min-h-[calc(100vh-292px)] flex-1 flex-col shadow-none"
        >
            <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                    <SearchBox
                        value={search}
                        onChange={setSearch}
                        placeholder={`Cari ${type === "PROGRAM" ? "program" : "assessment"}, sekolah, atau kabupaten...`}
                    />

                    <DropdownFilter
                        value={groupFilter}
                        onChange={setGroupFilter}
                        items={groupFilterItems}
                        placeholder="Semua Kelompok"
                        ariaLabel="Filter kelompok"
                    />

                    <DropdownFilter
                        value={pillarFilter}
                        onChange={setPillarFilter}
                        items={pillarFilterItems}
                        placeholder="Semua Pilar"
                        ariaLabel="Filter pilar"
                    />

                    <DropdownFilter
                        value={yearFilter}
                        onChange={setYearFilter}
                        items={yearFilterItems}
                        placeholder="Semua Tahun"
                        ariaLabel="Filter tahun"
                        width="w-full sm:w-[160px]"
                    />

                    <DropdownFilter
                        value={countyFilter}
                        onChange={setCountyFilter}
                        items={countyFilterItems}
                        placeholder="Semua Wilayah"
                        ariaLabel="Filter wilayah"
                        width="w-full sm:w-[190px]"
                    />

                    <DropdownFilter
                        value={groupBy}
                        onChange={setGroupBy}
                        items={groupByItems}
                        placeholder="Kelompok Diagram"
                        ariaLabel="Kelompok diagram"
                    />

                    {type === "PROGRAM" && (
                        <DropdownFilter
                            value={typeFilter}
                            onChange={setTypeFilter}
                            items={typeFilterItems}
                            placeholder="Semua Jenis"
                            ariaLabel="Filter jenis program"
                        />
                    )}

                    <DropdownFilter
                        value={progressFilter}
                        onChange={setProgressFilter}
                        items={progressFilterItems}
                        placeholder="Semua Status"
                        ariaLabel="Filter progres"
                    />
                </div>
            </div>

            <div className="grid min-w-0 flex-1 grid-cols-1">
                <div className="flex min-h-0 min-w-0 flex-col px-5 py-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                Diagram {groupBy === "STATUS" ? "Per Status" : "Per Wilayah"}
                            </p>
                            <p className="mt-1 text-[12px] font-bold text-slate-600">
                                {chartRows.length} kelompok dari {rows.length} data terfilter
                            </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            <div className="inline-flex rounded-xl border border-cyan-100 bg-white p-1 shadow-sm shadow-cyan-50">
                                <button
                                    type="button"
                                    onClick={() => setChartType("BAR")}
                                    className={`inline-flex h-9 items-center rounded-lg px-4 text-[9px] font-black uppercase tracking-wide transition ${chartType === "BAR"
                                        ? "bg-[#0AC4E0] text-white shadow-sm shadow-cyan-200"
                                        : "text-slate-500 hover:bg-cyan-50 hover:text-[#0AC4E0]"
                                        }`}
                                    title="Lihat diagram batang"
                                >
                                    Batang
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setChartType("PIE")}
                                    className={`inline-flex h-9 items-center rounded-lg px-4 text-[9px] font-black uppercase tracking-wide transition ${chartType === "PIE"
                                        ? "bg-[#0AC4E0] text-white shadow-sm shadow-cyan-200"
                                        : "text-slate-500 hover:bg-cyan-50 hover:text-[#0AC4E0]"
                                        }`}
                                    title="Lihat diagram pie"
                                >
                                    Pie
                                </button>
                            </div>

                            <div className="rounded-xl bg-cyan-50 px-3 py-2 text-right">
                                <p className="text-[9px] font-black uppercase tracking-wide text-cyan-500">
                                    Total
                                </p>
                                <p className="text-[18px] font-black text-slate-800">
                                    {rows.length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <CoverageChart
                        rows={chartRows}
                        visiblePillars={visiblePillars}
                        chartType={chartType}
                    />
                </div>
            </div>
        </DashboardPanel>
    );
}

function DashboardBase({
    title = "Dashboard",
    titleHighlight = "",
    subtitle = "Pantau ringkasan data dan aktivitas sistem secara terpusat.",
    categoryLabel = "Dashboard",
    categoryFilter = "",
    allowedJenjang = [],
    scopeLabel = "",
    primaryEndpoint,
    programEndpoint,
    assessmentEndpoint,
    getItemRegion = (item) =>
        item?.wilayah?.nama_wilayah ||
        item?.raw?.wilayah?.nama_wilayah ||
        item?.nama_wilayah ||
        item?.region ||
        "-",
    getProgramTitle = (program) =>
        program?.nama_program || program?.title || "Program",
    getProgramStatus = (program) =>
        program?.status_program || program?.status || "Approval",
    getProgramCode = (program) =>
        program?.kode_program ||
        `PRG-${program?.id_program || program?.id || "-"}`,
    getAssessmentTitle = (assessment) =>
        assessment?.nama_assessment || assessment?.nama || "Assessment",
    getAssessmentStatus = (assessment) =>
        assessment?.status_assessment || assessment?.status || "Draft",
    getAssessmentCode = (assessment) =>
        assessment?.kode_assessment ||
        assessment?.kode ||
        `ASM-${assessment?.id_assessment || assessment?.id || "-"}`,
    onProgramClick,
    onAssessmentClick,
    showAssessment = true,
    showMonitoringList = true,
    showExecutiveSummary = false,
}) {
    const [schools, setSchools] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState("PROGRAM");
    const [assessmentClock, setAssessmentClock] = useState(() => Date.now());

    const [programSearch, setProgramSearch] = useState("");
    const [programGroupFilter, setProgramGroupFilter] = useState("ALL");
    const [programPillarFilter, setProgramPillarFilter] = useState("ALL");
    const [programCountyFilter, setProgramCountyFilter] = useState("ALL");
    const [programYearFilter, setProgramYearFilter] = useState("ALL");
    const [programGroupBy, setProgramGroupBy] = useState("WILAYAH");
    const [programTypeFilter, setProgramTypeFilter] = useState("ALL");
    const [programProgressFilter, setProgramProgressFilter] = useState("ALL");

    const [assessmentSearch, setAssessmentSearch] = useState("");
    const [assessmentGroupFilter, setAssessmentGroupFilter] = useState("ALL");
    const [assessmentPillarFilter, setAssessmentPillarFilter] = useState("ALL");
    const [assessmentCountyFilter, setAssessmentCountyFilter] = useState("ALL");
    const [assessmentYearFilter, setAssessmentYearFilter] = useState("ALL");
    const [assessmentGroupBy, setAssessmentGroupBy] = useState("WILAYAH");
    const [assessmentProgressFilter, setAssessmentProgressFilter] = useState("ALL");
    const [cockpitAreaFilter, setCockpitAreaFilter] = useState("ALL");
    const [cockpitPillarFilter, setCockpitPillarFilter] = useState("ALL");
    const [cockpitStatusFilter, setCockpitStatusFilter] = useState("ALL");
    const [cockpitYearFilter, setCockpitYearFilter] = useState("ALL");
    const [visualProgramQuery, setVisualProgramQuery] = useState("");
    const [visualAssessmentQuery, setVisualAssessmentQuery] = useState("");
    const [executiveAnalysisMode, setExecutiveAnalysisMode] = useState("ALL");
    const [executiveStageKey, setExecutiveStageKey] = useState("");
    const [executivePillarKey, setExecutivePillarKey] = useState("");
    const [executiveCountyKey, setExecutiveCountyKey] = useState("");
    const [programListPage, setProgramListPage] = useState(1);
    const [assessmentListPage, setAssessmentListPage] = useState(1);
    const assessmentEnabled = Boolean(showAssessment && assessmentEndpoint);

    useEffect(() => {
        if (!showExecutiveSummary) return;
        setCockpitPillarFilter("ALL");
        setCockpitStatusFilter("ALL");
    }, [showExecutiveSummary]);

    useEffect(() => {
        if (!showExecutiveSummary) return;
        setExecutiveStageKey("");
        setExecutivePillarKey("");
        setExecutiveCountyKey("");
    }, [showExecutiveSummary, cockpitAreaFilter]);

    const fetchDashboardData = async () => {
        if (!primaryEndpoint || !programEndpoint || (showAssessment && !assessmentEndpoint)) {
            toast.error("Endpoint dashboard belum lengkap");
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const [schoolRes, programRes, assessmentRes] = await Promise.all([
                fetch(primaryEndpoint, { headers }),
                fetch(programEndpoint, { headers }),
                assessmentEnabled
                    ? fetch(assessmentEndpoint, { headers })
                    : Promise.resolve(null),
            ]);

            const schoolPayload = await safeJson(schoolRes);
            const programPayload = await safeJson(programRes);
            const assessmentPayload = assessmentRes ? await safeJson(assessmentRes) : [];

            if (!schoolRes.ok || !programRes.ok || (assessmentRes && !assessmentRes.ok)) {
                throw new Error(
                    schoolPayload?.message ||
                    programPayload?.message ||
                    assessmentPayload?.message ||
                    "Gagal mengambil data dashboard",
                );
            }

            const scopedSchools = normalizeArray(schoolPayload).filter((school) =>
                isSchoolAllowedByJenjang(school, allowedJenjang),
            );

            const allowedSchoolIds = new Set(
                scopedSchools.map(getSchoolId).filter(Boolean).map(String),
            );

            const filterBySchoolScope = (item) => {
                const ids = collectSchoolIds(item).map(String);
                if (ids.length === 0 || allowedSchoolIds.size === 0) return true;
                return ids.some((id) => allowedSchoolIds.has(id));
            };

            const scopedPrograms = normalizeArray(programPayload)
                .filter((item) => isItemAllowedByHo(item, categoryFilter))
                .filter(filterBySchoolScope);

            const scopedAssessments = assessmentEnabled
                ? normalizeArray(assessmentPayload)
                    .filter((item) => isItemAllowedByHo(item, categoryFilter))
                    .filter(filterBySchoolScope)
                : [];

            setSchools(scopedSchools);
            setPrograms(scopedPrograms);
            setAssessments(scopedAssessments);
        } catch (error) {
            console.error("Gagal mengambil dashboard:", error);
            toast.error(error?.message || "Gagal mengambil data dashboard");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        primaryEndpoint,
        programEndpoint,
        assessmentEndpoint,
        assessmentEnabled,
        showAssessment,
        categoryFilter,
        JSON.stringify(allowedJenjang),
    ]);

    useEffect(() => {
        if (!assessmentEnabled) return undefined;

        const timerId = window.setInterval(() => setAssessmentClock(Date.now()), 1000);
        return () => window.clearInterval(timerId);
    }, [assessmentEnabled]);

    useEffect(() => {
        if (!assessmentEnabled && activeView !== "PROGRAM") {
            setActiveView("PROGRAM");
        }
    }, [assessmentEnabled, activeView]);

    const schoolById = useMemo(
        () =>
            new Map(
                schools
                    .map((school) => [String(getSchoolId(school)), school])
                    .filter(([id]) => id && id !== "undefined"),
            ),
        [schools],
    );

    const schoolByName = useMemo(
        () =>
            new Map(
                schools.map((school) => [normalizeText(getSchoolName(school)), school]),
            ),
        [schools],
    );

    const resolveTargets = (item) => {
        const result = [];

        collectSchoolIds(item).forEach((id) => {
            const school = schoolById.get(String(id));
            if (!school) return;
            result.push({
                id: String(id),
                name: getSchoolName(school),
                county: getSchoolCounty(school, getItemRegion),
                area: getSchoolArea(school),
                province: getSchoolProvince(school),
                raw: school,
            });
        });

        collectSchoolNames(item).forEach((name) => {
            const school = schoolByName.get(normalizeText(name));
            result.push({
                id: school ? String(getSchoolId(school)) : `name-${normalizeText(name)}`,
                name: school ? getSchoolName(school) : name,
                county: school
                    ? getSchoolCounty(school, getItemRegion)
                    : String(
                        item?.nama_kabupaten ||
                        item?.kabupaten ||
                        item?.nama_wilayah ||
                        "Belum Dipetakan",
                    ),
                area: school
                    ? getSchoolArea(school)
                    : String(
                        item?.area_wilayah ||
                        item?.areaWilayah ||
                        item?.area_binaan ||
                        item?.area ||
                        "Belum Dipetakan",
                    ),
                province: school
                    ? getSchoolProvince(school)
                    : String(
                        item?.nama_provinsi ||
                        item?.provinsi ||
                        "Belum Dipetakan",
                    ),
                raw: school || null,
            });
        });

        if (result.length === 0) {
            result.push({
                id: `unknown-${item?.id_program || item?.id_assessment || item?.id || Math.random()
                    }`,
                name: "Sekolah belum terbaca",
                county: String(
                    item?.nama_kabupaten ||
                    item?.kabupaten ||
                    item?.nama_wilayah ||
                    "Belum Dipetakan",
                ),
                area: String(
                    item?.area_wilayah ||
                    item?.areaWilayah ||
                    item?.area_binaan ||
                    item?.area ||
                    "Belum Dipetakan",
                ),
                province: String(
                    item?.nama_provinsi ||
                    item?.provinsi ||
                    "Belum Dipetakan",
                ),
                raw: null,
            });
        }

        return [
            ...new Map(result.map((target) => [target.id || target.name, target])).values(),
        ];
    };

    const programCountyOptions = useMemo(
        () =>
            uniqueStrings(
                programs.flatMap((item) => resolveTargets(item).map((row) => row.county)),
            ).sort((a, b) => a.localeCompare(b)),
        [programs, schoolById, schoolByName],
    );

    const assessmentCountyOptions = useMemo(
        () =>
            uniqueStrings(
                assessments.flatMap((item) =>
                    resolveTargets(item).map((row) => row.county),
                ),
            ).sort((a, b) => a.localeCompare(b)),
        [assessments, schoolById, schoolByName],
    );

    const programYearOptions = DASHBOARD_YEAR_OPTIONS;

    const assessmentYearOptions = DASHBOARD_YEAR_OPTIONS;

    const filterRows = ({
        source,
        type,
        search,
        groupFilter,
        pillarFilter,
        countyFilter,
        yearFilter,
        typeFilter,
        progressFilter,
        getTitle,
        getCode,
        getStatus,
    }) => {
        const keyword = normalizeText(search);

        return source
            .filter((item) => {
                const pillarKey = getPillarKey(item);
                const groupKey = PILLAR_META[pillarKey].group;
                const targets = resolveTargets(item);
                const counties = targets.map((target) => target.county);

                const matchGroup =
                    groupFilter === "ALL" || groupKey === groupFilter;
                const matchPillar =
                    pillarFilter === "ALL" || pillarKey === pillarFilter;
                const matchCounty =
                    countyFilter === "ALL" || counties.includes(countyFilter);
                const matchYear =
                    yearFilter === "ALL" || getItemYear(item) === yearFilter;
                const matchType =
                    type !== "PROGRAM" ||
                    typeFilter === "ALL" ||
                    getProgramType(item) === typeFilter;
                const matchProgress =
                    progressFilter === "ALL" ||
                    getProgressBucket(item, getStatus, type) === progressFilter;

                const searchable = [
                    getTitle(item),
                    getCode(item),
                    getStatus(item),
                    PILLAR_META[pillarKey].label,
                    groupKey,
                    item?.tahun,
                    item?.year,
                    getProgramTypeLabel(getProgramType(item)),
                    ...targets.flatMap((target) => [target.name, target.county]),
                ]
                    .map(normalizeText)
                    .join(" ");

                const matchSearch = !keyword || searchable.includes(keyword);

                return (
                    matchGroup &&
                    matchPillar &&
                    matchCounty &&
                    matchYear &&
                    matchType &&
                    matchProgress &&
                    matchSearch
                );
            })
            .sort((a, b) => {
                const aDate = new Date(getCreatedDate(a) || 0).getTime();
                const bDate = new Date(getCreatedDate(b) || 0).getTime();
                return bDate - aDate;
            });
    };

    const filteredPrograms = useMemo(
        () =>
            filterRows({
                source: programs,
                type: "PROGRAM",
                search: programSearch,
                groupFilter: programGroupFilter,
                pillarFilter: programPillarFilter,
                countyFilter: programCountyFilter,
                yearFilter: programYearFilter,
                typeFilter: programTypeFilter,
                progressFilter: programProgressFilter,
                getTitle: getProgramTitle,
                getCode: getProgramCode,
                getStatus: getProgramStatus,
            }),
        [
            programs,
            programSearch,
            programGroupFilter,
            programPillarFilter,
            programCountyFilter,
            programYearFilter,
            programTypeFilter,
            programProgressFilter,
            schoolById,
            schoolByName,
        ],
    );

    const filteredAssessments = useMemo(
        () =>
            filterRows({
                source: assessments,
                type: "ASSESSMENT",
                search: assessmentSearch,
                groupFilter: assessmentGroupFilter,
                pillarFilter: assessmentPillarFilter,
                countyFilter: assessmentCountyFilter,
                yearFilter: assessmentYearFilter,
                typeFilter: "ALL",
                progressFilter: assessmentProgressFilter,
                getTitle: getAssessmentTitle,
                getCode: getAssessmentCode,
                getStatus: getAssessmentStatus,
            }),
        [
            assessments,
            assessmentSearch,
            assessmentGroupFilter,
            assessmentPillarFilter,
            assessmentCountyFilter,
            assessmentYearFilter,
            assessmentProgressFilter,
            schoolById,
            schoolByName,
        ],
    );

    const buildChartRows = (source, groupBy, type, getStatus) => {
        const counter = new Map();

        source.forEach((item) => {
            const pillarKey = getPillarKey(item);
            const chartKey = PILLAR_META[pillarKey].chartKey;
            const uniqueGroups = new Set();

            if (groupBy === "STATUS") {
                uniqueGroups.add(getProgressLabel(getProgressBucket(item, getStatus, type)));
            } else {
                resolveTargets(item).forEach((target) => {
                    if (target.county) uniqueGroups.add(target.county);
                });
            }

            uniqueGroups.forEach((name) => {
                if (!counter.has(name)) {
                    counter.set(name, {
                        name,
                        total: 0,
                        akademik: 0,
                        karakter: 0,
                        seniBudaya: 0,
                        kecakapanHidup: 0,
                    });
                }

                const row = counter.get(name);
                row.total += 1;
                row[chartKey] += 1;
            });
        });

        return Array.from(counter.values()).sort(
            (a, b) => b.total - a.total || a.name.localeCompare(b.name),
        );
    };

    const programChartRows = useMemo(
        () =>
            buildChartRows(
                filteredPrograms,
                programGroupBy,
                "PROGRAM",
                getProgramStatus,
            ),
        [filteredPrograms, programGroupBy, schoolById, schoolByName],
    );

    const assessmentChartRows = useMemo(
        () =>
            buildChartRows(
                filteredAssessments,
                assessmentGroupBy,
                "ASSESSMENT",
                getAssessmentStatus,
            ),
        [filteredAssessments, assessmentGroupBy, schoolById, schoolByName],
    );

    const visiblePillars = useMemo(() => {
        const normalizedCategory = normalizeKey(categoryFilter);

        if (normalizedCategory === "NON_AKADEMIK") {
            return ["SENI_BUDAYA", "KECAKAPAN_HIDUP"];
        }

        if (normalizedCategory === "AKADEMIK") {
            return ["AKADEMIK", "KARAKTER"];
        }

        return ["AKADEMIK", "KARAKTER", "SENI_BUDAYA", "KECAKAPAN_HIDUP"];
    }, [categoryFilter]);

    const cockpitPillarItems = useMemo(
        () => [
            { value: "ALL", label: "Semua Pilar" },
            ...visiblePillars.map((pillarKey) => ({
                value: pillarKey,
                label: PILLAR_META[pillarKey].label,
            })),
        ],
        [visiblePillars],
    );

    const cockpitAreaItems = useMemo(() => {
        const areaRows = uniqueStrings(
            [...programs, ...assessments].flatMap((item) =>
                resolveTargets(item).map((target) => target.area || "Belum Dipetakan"),
            ),
        ).sort((a, b) => a.localeCompare(b));

        return [
            { value: "ALL", label: "Semua Area" },
            ...areaRows.map((area) => ({ value: area, label: area })),
        ];
    }, [programs, assessments, schoolById, schoolByName]);

    const cockpitYearItems = useMemo(() => {
        const yearRows = uniqueStrings(
            [...programs, ...assessments]
                .map(getItemYear)
                .filter((year) => year && year !== "Belum Ada Tahun"),
        ).sort((a, b) => Number(b) - Number(a));

        return [
            { value: "ALL", label: "Semua Tahun" },
            ...yearRows.map((year) => ({ value: year, label: year })),
        ];
    }, [programs, assessments]);

    const filterCockpitRows = ({ source, type, getTitle, getCode, getStatus }) => {
        return source
            .filter((item) => {
                const targets = resolveTargets(item);
                const pillarKey = getPillarKey(item);
                const progressBucket = getProgressBucket(item, getStatus, type);
                const year = getItemYear(item);
                const matchArea =
                    cockpitAreaFilter === "ALL" ||
                    targets.some((target) => target.area === cockpitAreaFilter);
                const matchPillar =
                    cockpitPillarFilter === "ALL" || pillarKey === cockpitPillarFilter;
                const matchStatus =
                    cockpitStatusFilter === "ALL" ||
                    progressBucket === cockpitStatusFilter;
                const matchYear =
                    cockpitYearFilter === "ALL" || year === cockpitYearFilter;

                const isVisiblePillar = visiblePillars.includes(pillarKey);
                return (
                    matchArea &&
                    matchPillar &&
                    matchStatus &&
                    matchYear &&
                    isVisiblePillar
                );
            })
            .sort((a, b) => {
                const aDate = new Date(getCreatedDate(a) || 0).getTime();
                const bDate = new Date(getCreatedDate(b) || 0).getTime();
                const dateSort = bDate - aDate;
                if (dateSort) return dateSort;
                return getTitle(a).localeCompare(getTitle(b));
            });
    };

    const cockpitPrograms = useMemo(
        () =>
            filterCockpitRows({
                source: programs,
                type: "PROGRAM",
                getTitle: getProgramTitle,
                getCode: getProgramCode,
                getStatus: getProgramStatus,
            }),
        [
            programs,
            cockpitAreaFilter,
            cockpitPillarFilter,
            cockpitStatusFilter,
            cockpitYearFilter,
            visiblePillars,
            schoolById,
            schoolByName,
        ],
    );

    const cockpitAssessments = useMemo(
        () =>
            filterCockpitRows({
                source: assessments,
                type: "ASSESSMENT",
                getTitle: getAssessmentTitle,
                getCode: getAssessmentCode,
                getStatus: getAssessmentStatus,
            }),
        [
            assessments,
            cockpitAreaFilter,
            cockpitPillarFilter,
            cockpitStatusFilter,
            cockpitYearFilter,
            visiblePillars,
            schoolById,
            schoolByName,
        ],
    );

    const buildStatusPieRows = (source, type, getStatus) => {
        const processCount = source.filter(
            (item) => getProgressBucket(item, getStatus, type) === "PROSES",
        ).length;
        const doneCount = Math.max(source.length - processCount, 0);

        return [
            {
                key: "PROSES",
                name: "Sedang Proses",
                value: processCount,
                color: STATUS_PIE_COLORS.PROSES,
            },
            {
                key: "SELESAI",
                name: "Selesai",
                value: doneCount,
                color: STATUS_PIE_COLORS.SELESAI,
            },
        ];
    };

    const buildAssessmentStatusPieRows = (source, nowMs) => {
        const stagedAssessments = source.map((assessment) => ({
            assessment,
            stage: getAssessmentStage(assessment, nowMs),
            timing: getAssessmentTiming(assessment, nowMs),
        }));
        const nearestRunning = stagedAssessments
            .filter((item) => item.stage === "PROSES")
            .sort(
                (a, b) =>
                    Number(a.timing.remainingSeconds ?? Number.MAX_SAFE_INTEGER) -
                    Number(b.timing.remainingSeconds ?? Number.MAX_SAFE_INTEGER),
            )[0];

        return Object.values(ASSESSMENT_STATUS_META).map((meta) => {
            const value = stagedAssessments.filter((item) => item.stage === meta.key).length;
            let detail = "Tidak ada assessment";

            if (meta.key === "DRAFT" && value > 0) {
                detail = `${value} assessment belum dikirim`;
            }

            if (meta.key === "PROSES" && value > 0) {
                detail = nearestRunning
                    ? `Terdekat: ${formatAssessmentCountdown(
                        nearestRunning.timing.remainingSeconds,
                    )}`
                    : "Timer pengisian sedang berjalan";
            }

            if (meta.key === "PENDING" && value > 0) {
                detail = "Timer berhenti sementara oleh HO";
            }

            if (meta.key === "SELESAI" && value > 0) {
                detail = `${value} assessment telah selesai`;
            }

            return {
                key: meta.key,
                name: meta.label,
                value,
                color: meta.color,
                detail,
            };
        });
    };

    const visualProgram = useMemo(() => {
        const keyword = normalizeText(visualProgramQuery);
        if (keyword.length < 2) return null;

        return (
            cockpitPrograms.find((program) => {
                const targets = resolveTargets(program);
                const searchable = [
                    getProgramTitle(program),
                    getProgramCode(program),
                    PILLAR_META[getPillarKey(program)].label,
                    ...targets.flatMap((target) => [
                        target.name,
                        target.county,
                        target.area,
                        target.province,
                    ]),
                ]
                    .map(normalizeText)
                    .join(" ");

                return searchable.includes(keyword);
            }) || null
        );
    }, [visualProgramQuery, cockpitPrograms, schoolById, schoolByName]);

    const visualProcessSteps = useMemo(
        () => (visualProgram ? getProgramProcessSteps(visualProgram) : []),
        [visualProgram],
    );

    const visualAssessment = useMemo(() => {
        const keyword = normalizeText(visualAssessmentQuery);
        if (keyword.length < 2) return null;

        return (
            cockpitAssessments.find((assessment) => {
                const targets = resolveTargets(assessment);
                const searchable = [
                    getAssessmentTitle(assessment),
                    getAssessmentCode(assessment),
                    getAssessmentSenderName(assessment),
                    getAssessmentStageMeta(assessment).label,
                    ...targets.flatMap((target) => [
                        target.name,
                        target.county,
                        target.area,
                        target.province,
                    ]),
                ]
                    .map(normalizeText)
                    .join(" ");

                return searchable.includes(keyword);
            }) || null
        );
    }, [visualAssessmentQuery, cockpitAssessments, schoolById, schoolByName]);

    const visualAssessmentTargets = useMemo(
        () => (visualAssessment ? resolveTargets(visualAssessment) : []),
        [visualAssessment, schoolById, schoolByName],
    );

    const programPieRows = useMemo(
        () =>
            buildStatusPieRows(
                visualProgram ? [visualProgram] : cockpitPrograms,
                "PROGRAM",
                getProgramStatus,
            ),
        [visualProgram, cockpitPrograms],
    );

    const assessmentPieRows = useMemo(
        () =>
            buildAssessmentStatusPieRows(
                visualAssessment ? [visualAssessment] : cockpitAssessments,
                assessmentClock,
            ),
        [visualAssessment, cockpitAssessments, assessmentClock],
    );

    const programPieTotal = visualProgram ? 1 : cockpitPrograms.length;
    const assessmentPieTotal = visualAssessment ? 1 : cockpitAssessments.length;

    const executiveModeData = useMemo(() => {
        const rows = {
            ALL: [...cockpitPrograms],
            IN_PROGRESS: [],
            COMPLETED: [],
            AKADEMIK: [],
            KARAKTER: [],
            SENI_BUDAYA: [],
            KECAKAPAN_HIDUP: [],
        };

        cockpitPrograms.forEach((program) => {
            const stage = getProgramStageKey(program);
            const completed =
                stage === "SELESAI" ||
                getProgressBucket(program, getProgramStatus, "PROGRAM") === "SELESAI";
            const pillarKey = getPillarKey(program);

            if (completed) {
                rows.COMPLETED.push(program);
            } else {
                rows.IN_PROGRESS.push(program);
            }

            if (rows[pillarKey]) {
                rows[pillarKey].push(program);
            }
        });

        return {
            rows,
            modes: [
                {
                    key: "ALL",
                    label: "Semua",
                    helper: "Semua program",
                    color: "#0AC4E0",
                    count: rows.ALL.length,
                    icon: <ChartPie size={14} />,
                },
                {
                    key: "IN_PROGRESS",
                    label: "Dalam Proses",
                    helper: "Approval–Evaluasi",
                    color: "#F59E0B",
                    count: rows.IN_PROGRESS.length,
                    icon: <Activity size={14} />,
                },
                {
                    key: "COMPLETED",
                    label: "Selesai",
                    helper: "Selesai",
                    color: "#00C68D",
                    count: rows.COMPLETED.length,
                    icon: <CheckCircle2 size={14} />,
                },
                {
                    key: "AKADEMIK",
                    label: "Akademik",
                    helper: "Akademik",
                    color: PILLAR_META.AKADEMIK.color,
                    count: rows.AKADEMIK.length,
                    icon: <Layers3 size={14} />,
                },
                {
                    key: "KARAKTER",
                    label: "Karakter",
                    helper: "Karakter",
                    color: PILLAR_META.KARAKTER.color,
                    count: rows.KARAKTER.length,
                    icon: <Layers3 size={14} />,
                },
                {
                    key: "SENI_BUDAYA",
                    label: "Seni Budaya",
                    helper: "Seni Budaya",
                    color: PILLAR_META.SENI_BUDAYA.color,
                    count: rows.SENI_BUDAYA.length,
                    icon: <Layers3 size={14} />,
                },
                {
                    key: "KECAKAPAN_HIDUP",
                    label: "Kecakapan Hidup",
                    helper: "Kecakapan Hidup",
                    color: PILLAR_META.KECAKAPAN_HIDUP.color,
                    count: rows.KECAKAPAN_HIDUP.length,
                    icon: <Layers3 size={14} />,
                },
            ],
        };
    }, [cockpitPrograms]);

    const executiveModePrograms =
        executiveModeData.rows[executiveAnalysisMode] || executiveModeData.rows.ALL;
    const executiveActiveModeLabel =
        executiveModeData.modes.find((item) => item.key === executiveAnalysisMode)?.label ||
        "Semua";

    const executiveUsesCountyChart = cockpitAreaFilter !== "ALL";

    const matchesExecutiveCounty = (program, countyKey) => {
        if (!countyKey || cockpitAreaFilter === "ALL") return true;

        return resolveTargets(program).some(
            (target) =>
                target.area === cockpitAreaFilter &&
                normalizeKey(target.county) === countyKey,
        );
    };

    const executiveStageChartPrograms = useMemo(
        () =>
            executiveModePrograms.filter((program) => {
                const matchesPillar =
                    !executivePillarKey ||
                    getPillarKey(program) === executivePillarKey;
                const matchesCounty = matchesExecutiveCounty(
                    program,
                    executiveCountyKey,
                );

                return matchesPillar && matchesCounty;
            }),
        [
            executiveModePrograms,
            executivePillarKey,
            executiveCountyKey,
            cockpitAreaFilter,
            schoolById,
            schoolByName,
        ],
    );

    const executiveSecondaryChartPrograms = useMemo(
        () =>
            executiveStageKey
                ? executiveModePrograms.filter(
                    (program) => getProgramStageKey(program) === executiveStageKey,
                )
                : executiveModePrograms,
        [executiveModePrograms, executiveStageKey],
    );

    const executiveProgramStatusRows = useMemo(
        () =>
            PROGRAM_STAGE_META.map((meta) => ({
                ...meta,
                value: executiveStageChartPrograms.filter(
                    (program) => getProgramStageKey(program) === meta.key,
                ).length,
            })),
        [executiveStageChartPrograms],
    );

    const executivePillarRows = useMemo(
        () =>
            ["AKADEMIK", "KARAKTER", "SENI_BUDAYA", "KECAKAPAN_HIDUP"].map(
                (pillarKey) => ({
                    key: pillarKey,
                    name: PILLAR_META[pillarKey].label,
                    color: PILLAR_META[pillarKey].color,
                    value: executiveSecondaryChartPrograms.filter(
                        (program) => getPillarKey(program) === pillarKey,
                    ).length,
                }),
            ),
        [executiveSecondaryChartPrograms],
    );

    const executiveCountyRows = useMemo(() => {
        if (!executiveUsesCountyChart) return [];

        const countySchools = new Map();

        executiveSecondaryChartPrograms.forEach((program) => {
            resolveTargets(program)
                .filter((target) => target.area === cockpitAreaFilter)
                .forEach((target) => {
                    const countyName = target.county || "Belum Dipetakan";
                    const countyKey = normalizeKey(countyName);

                    if (!countySchools.has(countyKey)) {
                        countySchools.set(countyKey, {
                            key: countyKey,
                            name: countyName,
                            schools: new Set(),
                        });
                    }

                    if (target.name !== "Sekolah belum terbaca") {
                        countySchools
                            .get(countyKey)
                            .schools.add(target.id || target.name);
                    }
                });
        });

        return Array.from(countySchools.values())
            .map((item) => ({
                key: item.key,
                name: item.name,
                value: item.schools.size,
            }))
            .filter((item) => item.value > 0)
            .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))
            .map((item, index) => ({
                ...item,
                color: COUNTY_CHART_COLORS[index % COUNTY_CHART_COLORS.length],
            }));
    }, [
        executiveUsesCountyChart,
        executiveSecondaryChartPrograms,
        cockpitAreaFilter,
        schoolById,
        schoolByName,
    ]);

    const executiveCountySchoolTotal = useMemo(
        () => executiveCountyRows.reduce((total, item) => total + item.value, 0),
        [executiveCountyRows],
    );

    const executiveAnalysisPrograms = useMemo(
        () =>
            executiveModePrograms.filter((program) => {
                const matchesStage =
                    !executiveStageKey ||
                    getProgramStageKey(program) === executiveStageKey;
                const matchesPillar =
                    !executivePillarKey || getPillarKey(program) === executivePillarKey;
                const matchesCounty = matchesExecutiveCounty(
                    program,
                    executiveCountyKey,
                );

                return matchesStage && matchesPillar && matchesCounty;
            }),
        [
            executiveModePrograms,
            executiveStageKey,
            executivePillarKey,
            executiveCountyKey,
            cockpitAreaFilter,
            schoolById,
            schoolByName,
        ],
    );

    const executiveSchoolCount = useMemo(() => {
        const uniqueSchools = new Set();

        cockpitPrograms.forEach((program) => {
            resolveTargets(program).forEach((target) => {
                if (target.name === "Sekolah belum terbaca") return;
                if (
                    cockpitAreaFilter !== "ALL" &&
                    target.area !== cockpitAreaFilter
                ) {
                    return;
                }
                uniqueSchools.add(target.id || target.name);
            });
        });

        return uniqueSchools.size;
    }, [cockpitPrograms, cockpitAreaFilter, schoolById, schoolByName]);

    const executiveCompletedCount = useMemo(
        () =>
            cockpitPrograms.filter(
                (program) =>
                    getProgressBucket(program, getProgramStatus, "PROGRAM") === "SELESAI",
            ).length,
        [cockpitPrograms],
    );

    const executiveStageLabel = executiveStageKey
        ? PROGRAM_STAGE_META.find((item) => item.key === executiveStageKey)?.name || ""
        : "";
    const executivePillarLabel = executivePillarKey
        ? PILLAR_META[executivePillarKey]?.label || ""
        : "";
    const executiveCountyLabel = executiveCountyKey
        ? executiveCountyRows.find((item) => item.key === executiveCountyKey)?.name || ""
        : "";

    const executiveMetricRows = useMemo(
        () => [
            {
                label: "Total Program",
                value: cockpitPrograms.length,
                helper: "Program sesuai filter aktif",
                color: "#0AC4E0",
                icon: <ClipboardCheck size={18} />,
            },
            {
                label: "Program Berjalan",
                value: Math.max(cockpitPrograms.length - executiveCompletedCount, 0),
                helper: "Belum mencapai status selesai",
                color: "#F59E0B",
                icon: <Clock3 size={18} />,
            },
            {
                label: "Program Selesai",
                value: executiveCompletedCount,
                helper: "Telah menyelesaikan proses",
                color: "#10B981",
                icon: <CheckCircle2 size={18} />,
            },
            {
                label: "Sekolah Terjangkau",
                value: executiveSchoolCount,
                helper: "Sekolah unik dalam program",
                color: "#7C3AED",
                icon: <School size={18} />,
            },
        ],
        [cockpitPrograms.length, executiveCompletedCount, executiveSchoolCount],
    );

    const programListTotalPages = Math.max(
        Math.ceil(cockpitPrograms.length / ITEMS_PER_PAGE),
        1,
    );

    const paginatedCockpitPrograms = useMemo(() => {
        const startIndex = (programListPage - 1) * ITEMS_PER_PAGE;
        return cockpitPrograms.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [cockpitPrograms, programListPage]);

    const assessmentListTotalPages = Math.max(
        Math.ceil(cockpitAssessments.length / ITEMS_PER_PAGE),
        1,
    );

    const paginatedCockpitAssessments = useMemo(() => {
        const startIndex = (assessmentListPage - 1) * ITEMS_PER_PAGE;
        return cockpitAssessments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [cockpitAssessments, assessmentListPage]);

    useEffect(() => {
        setProgramListPage(1);
        setAssessmentListPage(1);
        setVisualProgramQuery("");
        setVisualAssessmentQuery("");
        setExecutiveStageKey("");
        setExecutivePillarKey("");
    }, [cockpitAreaFilter, cockpitPillarFilter, cockpitStatusFilter, cockpitYearFilter]);

    useEffect(() => {
        if (programListPage > programListTotalPages) {
            setProgramListPage(programListTotalPages);
        }
    }, [programListPage, programListTotalPages]);

    useEffect(() => {
        if (assessmentListPage > assessmentListTotalPages) {
            setAssessmentListPage(assessmentListTotalPages);
        }
    }, [assessmentListPage, assessmentListTotalPages]);

    const getRelatedSchoolCount = (source) => {
        const ids = new Set();
        source.forEach((item) =>
            resolveTargets(item).forEach((target) => ids.add(target.id || target.name)),
        );
        return ids.size;
    };

    const programCompleted = programs.filter(
        (item) => getProgressBucket(item, getProgramStatus, "PROGRAM") === "SELESAI",
    ).length;
    const assessmentCompleted = assessments.filter(
        (item) =>
            getProgressBucket(item, getAssessmentStatus, "ASSESSMENT") === "SELESAI",
    ).length;

    const allRelatedSchoolCount = useMemo(
        () => getRelatedSchoolCount([...programs, ...assessments]),
        [programs, assessments, schoolById, schoolByName],
    );

    const metricRows = useMemo(() => {
        if (activeView === "PROGRAM") {
            return [
                {
                    label: "Jumlah Sekolah",
                    value: getRelatedSchoolCount(programs),
                    helper: "Sekolah yang memiliki program",
                    color: "#0AC4E0",
                    icon: <School size={18} />,
                },
                {
                    label: "Jumlah Program",
                    value: programs.length,
                    helper: "Seluruh program dalam cakupan",
                    color: "#334155",
                    icon: <ClipboardCheck size={18} />,
                },
                {
                    label: "Dalam Proses",
                    value: Math.max(programs.length - programCompleted, 0),
                    helper: "Program belum selesai",
                    color: "#F59E0B",
                    icon: <Clock3 size={18} />,
                },
                {
                    label: "Selesai",
                    value: programCompleted,
                    helper: "Program sudah selesai",
                    color: "#10B981",
                    icon: <CheckCircle2 size={18} />,
                },
            ];
        }

        if (activeView === "ASSESSMENT") {
            return [
                {
                    label: "Jumlah Sekolah",
                    value: getRelatedSchoolCount(assessments),
                    helper: "Sekolah target assessment",
                    color: "#0AC4E0",
                    icon: <School size={18} />,
                },
                {
                    label: "Jumlah Assessment",
                    value: assessments.length,
                    helper: "Seluruh assessment dalam cakupan",
                    color: "#7C3AED",
                    icon: <FileCheck2 size={18} />,
                },
                {
                    label: "Dalam Proses",
                    value: Math.max(assessments.length - assessmentCompleted, 0),
                    helper: "Assessment belum selesai",
                    color: "#F59E0B",
                    icon: <Clock3 size={18} />,
                },
                {
                    label: "Selesai",
                    value: assessmentCompleted,
                    helper: "Assessment sudah selesai",
                    color: "#10B981",
                    icon: <CheckCircle2 size={18} />,
                },
            ];
        }

        return [
            {
                label: "Jumlah Sekolah",
                value: allRelatedSchoolCount,
                helper: "Sekolah terkait seluruh data",
                color: "#0AC4E0",
                icon: <School size={18} />,
            },
            {
                label: "Jumlah Program",
                value: programs.length,
                helper: "Seluruh program dalam cakupan",
                color: "#334155",
                icon: <ClipboardCheck size={18} />,
            },
            {
                label: "Jumlah Assessment",
                value: assessments.length,
                helper: "Seluruh assessment dalam cakupan",
                color: "#7C3AED",
                icon: <FileCheck2 size={18} />,
            },
            {
                label: "Total Selesai",
                value: programCompleted + assessmentCompleted,
                helper: "Program dan assessment selesai",
                color: "#10B981",
                icon: <CheckCircle2 size={18} />,
            },
        ];
    }, [
        activeView,
        programs,
        assessments,
        programCompleted,
        assessmentCompleted,
        allRelatedSchoolCount,
        schoolById,
        schoolByName,
    ]);

    if (loading) {
        return (
            <PageWrapper className="flex h-screen items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-11 w-11 animate-spin rounded-full border-4 border-[#0AC4E0] border-t-transparent" />
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#0AC4E0]">
                        Memuat dashboard
                    </p>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper className="flex h-screen overflow-hidden bg-[#EEF4FA] !p-0 font-sans text-slate-800">
            <Sidebar />

            <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
                <div className="flex h-full min-h-0 flex-col gap-3 px-3 py-3 md:px-4 xl:px-5">
                    <DashboardPanel className="shrink-0">
                        <div className="grid gap-4 px-5 py-4 xl:grid-cols-[minmax(260px,0.7fr)_minmax(520px,1fr)] xl:items-center">
                            <div className="min-w-0">
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-cyan-50 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-[#0AC4E0]">
                                        {categoryLabel}
                                    </span>
                                    {scopeLabel && (
                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                                            {scopeLabel}
                                        </span>
                                    )}
                                </div>
                                <h1 className="truncate text-[24px] font-black tracking-tight text-slate-900">
                                    {title}{" "}
                                    <span className="text-[#0AC4E0]">
                                        {titleHighlight}
                                    </span>
                                </h1>
                                <p className="mt-1 line-clamp-2 text-[11px] font-semibold leading-5 text-slate-400">
                                    {subtitle}
                                </p>
                            </div>

                            <div
                                className={`grid min-w-0 gap-2 sm:grid-cols-2 ${showExecutiveSummary
                                    ? "xl:grid-cols-[1fr_1fr_auto]"
                                    : "xl:grid-cols-[1fr_1fr_1fr_1fr_auto]"
                                    }`}
                            >
                                <DropdownFilter
                                    value={cockpitAreaFilter}
                                    onChange={setCockpitAreaFilter}
                                    items={cockpitAreaItems}
                                    placeholder="Semua Area"
                                    ariaLabel="Filter area"
                                    width="w-full"
                                />

                                {!showExecutiveSummary && (
                                    <>
                                        <DropdownFilter
                                            value={cockpitPillarFilter}
                                            onChange={setCockpitPillarFilter}
                                            items={cockpitPillarItems}
                                            placeholder="Semua Pilar"
                                            ariaLabel="Filter pilar"
                                            width="w-full"
                                        />
                                        <DropdownFilter
                                            value={cockpitStatusFilter}
                                            onChange={setCockpitStatusFilter}
                                            items={COCKPIT_STATUS_ITEMS}
                                            placeholder="Semua Status"
                                            ariaLabel="Filter status"
                                            width="w-full"
                                        />
                                    </>
                                )}

                                <DropdownFilter
                                    value={cockpitYearFilter}
                                    onChange={setCockpitYearFilter}
                                    items={cockpitYearItems}
                                    placeholder="Semua Tahun"
                                    ariaLabel="Filter tahun"
                                    width="w-full"
                                />
                                <button
                                    type="button"
                                    onClick={fetchDashboardData}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0AC4E0] px-4 text-[10px] font-black uppercase tracking-wide text-white shadow-sm transition hover:bg-cyan-500 active:scale-95"
                                >
                                    <RefreshCw size={13} /> Refresh
                                </button>
                            </div>
                        </div>
                    </DashboardPanel>

                    {showMonitoringList ? (
                        <section className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.34fr)]">
                            <div className="grid min-h-0 gap-3 xl:grid-rows-[auto_minmax(320px,1fr)]">
                                <div
                                    className={`grid min-h-0 gap-3 lg:items-start ${assessmentEnabled ? "lg:grid-cols-2" : "lg:grid-cols-1"
                                        }`}
                                >
                                    <StatusPieCard
                                        title="Program"
                                        total={programPieTotal}
                                        rows={programPieRows}
                                        icon={<ClipboardCheck size={19} />}
                                        helper={
                                            visualProgram
                                                ? "Status data terpilih"
                                                : "Status program"
                                        }
                                    />
                                    {assessmentEnabled && (
                                        <StatusPieCard
                                            title="Assessment"
                                            total={assessmentPieTotal}
                                            rows={assessmentPieRows}
                                            icon={<FileCheck2 size={19} />}
                                            helper={
                                                visualAssessment
                                                    ? "Status data terpilih"
                                                    : "Status assessment"
                                            }
                                            showProgress={false}
                                        />
                                    )}
                                </div>

                                <VisualProcessPanel
                                    mode={assessmentEnabled ? activeView : "PROGRAM"}
                                    query={
                                        assessmentEnabled && activeView === "ASSESSMENT"
                                            ? visualAssessmentQuery
                                            : visualProgramQuery
                                    }
                                    setQuery={(value) => {
                                        if (assessmentEnabled && activeView === "ASSESSMENT") {
                                            setVisualProgramQuery("");
                                            setVisualAssessmentQuery(value);
                                            return;
                                        }

                                        setVisualAssessmentQuery("");
                                        setVisualProgramQuery(value);
                                    }}
                                    item={
                                        assessmentEnabled && activeView === "ASSESSMENT"
                                            ? visualAssessment
                                            : visualProgram
                                    }
                                    steps={
                                        assessmentEnabled && activeView === "ASSESSMENT"
                                            ? []
                                            : visualProcessSteps
                                    }
                                    targets={
                                        assessmentEnabled && activeView === "ASSESSMENT"
                                            ? visualAssessmentTargets
                                            : []
                                    }
                                    getTitle={
                                        assessmentEnabled && activeView === "ASSESSMENT"
                                            ? getAssessmentTitle
                                            : getProgramTitle
                                    }
                                    getCode={
                                        assessmentEnabled && activeView === "ASSESSMENT"
                                            ? getAssessmentCode
                                            : getProgramCode
                                    }
                                    nowMs={assessmentClock}
                                />
                            </div>

                            <CompactMonitoringList
                                mode={assessmentEnabled ? activeView : "PROGRAM"}
                                onFlip={
                                    assessmentEnabled
                                        ? () =>
                                            setActiveView((current) =>
                                                current === "PROGRAM" ? "ASSESSMENT" : "PROGRAM",
                                            )
                                        : undefined
                                }
                                rows={
                                    assessmentEnabled && activeView === "ASSESSMENT"
                                        ? paginatedCockpitAssessments
                                        : paginatedCockpitPrograms
                                }
                                totalCount={
                                    assessmentEnabled && activeView === "ASSESSMENT"
                                        ? cockpitAssessments.length
                                        : cockpitPrograms.length
                                }
                                page={
                                    assessmentEnabled && activeView === "ASSESSMENT"
                                        ? assessmentListPage
                                        : programListPage
                                }
                                totalPages={
                                    assessmentEnabled && activeView === "ASSESSMENT"
                                        ? assessmentListTotalPages
                                        : programListTotalPages
                                }
                                setPage={
                                    assessmentEnabled && activeView === "ASSESSMENT"
                                        ? setAssessmentListPage
                                        : setProgramListPage
                                }
                                getTitle={
                                    assessmentEnabled && activeView === "ASSESSMENT"
                                        ? getAssessmentTitle
                                        : getProgramTitle
                                }
                                getCode={
                                    assessmentEnabled && activeView === "ASSESSMENT"
                                        ? getAssessmentCode
                                        : getProgramCode
                                }
                                onSelectVisual={(row) => {
                                    if (assessmentEnabled && activeView === "ASSESSMENT") {
                                        setVisualProgramQuery("");
                                        setVisualAssessmentQuery(getAssessmentCode(row));
                                        return;
                                    }

                                    setVisualAssessmentQuery("");
                                    setVisualProgramQuery(getProgramCode(row));
                                }}
                            />
                        </section>
                    ) : showExecutiveSummary ? (
                        <section className="min-h-0 flex-1 overflow-hidden">
                            <div className="grid h-full min-h-0 grid-rows-[auto_minmax(280px,1fr)_auto] gap-3">
                                <DashboardPanel className="shrink-0">
                                    <div className="grid sm:grid-cols-2 xl:grid-cols-4">
                                        {executiveMetricRows.map((metric) => (
                                            <MetricCard key={metric.label} {...metric} />
                                        ))}
                                    </div>
                                </DashboardPanel>

                                    <div className="grid min-h-0 gap-3 xl:grid-cols-2 xl:items-stretch">
                                        <StatusPieCard
                                            title="Tahapan Program"
                                            total={executiveStageChartPrograms.length}
                                            rows={executiveProgramStatusRows}
                                            icon={<ClipboardCheck size={19} />}
                                            helper={
                                                executiveCountyLabel
                                                    ? executiveCountyLabel
                                                    : executivePillarLabel
                                                        ? `Pilar ${executivePillarLabel}`
                                                        : executiveActiveModeLabel
                                            }
                                            description={
                                                executiveUsesCountyChart
                                                    ? "Klik tahapan untuk melihat sebaran sekolah per kabupaten/kota."
                                                    : "Klik bagian diagram untuk melihat komposisi pilar pada tahap tertentu."
                                            }
                                            className="h-full"
                                            emphasizeChart
                                            interactive
                                            selectedKey={executiveStageKey}
                                            onSelect={(key) =>
                                                setExecutiveStageKey((current) =>
                                                    current === key ? "" : key,
                                                )
                                            }
                                        />

                                        <StatusPieCard
                                            title={
                                                executiveUsesCountyChart
                                                    ? "Sekolah per Kabupaten/Kota"
                                                    : "4 Pilar Program"
                                            }
                                            total={
                                                executiveUsesCountyChart
                                                    ? executiveCountySchoolTotal
                                                    : executiveSecondaryChartPrograms.length
                                            }
                                            rows={
                                                executiveUsesCountyChart
                                                    ? executiveCountyRows
                                                    : executivePillarRows
                                            }
                                            icon={
                                                executiveUsesCountyChart ? (
                                                    <MapPinned size={19} />
                                                ) : (
                                                    <Layers3 size={19} />
                                                )
                                            }
                                            helper={
                                                executiveUsesCountyChart
                                                    ? executiveStageLabel
                                                        ? `${cockpitAreaFilter} · ${executiveStageLabel}`
                                                        : cockpitAreaFilter
                                                    : executiveStageLabel
                                                        ? `Tahap ${executiveStageLabel}`
                                                        : executiveActiveModeLabel
                                            }
                                            description={
                                                executiveUsesCountyChart
                                                    ? "Jumlah sekolah program pada setiap kabupaten/kota di area terpilih."
                                                    : "Klik bagian diagram untuk melihat tahapan pada pilar tertentu."
                                            }
                                            className="h-full"
                                            emphasizeChart
                                            compactSummary={executiveUsesCountyChart}
                                            interactive
                                            selectedKey={
                                                executiveUsesCountyChart
                                                    ? executiveCountyKey
                                                    : executivePillarKey
                                            }
                                            onSelect={(key) => {
                                                if (executiveUsesCountyChart) {
                                                    setExecutiveCountyKey((current) =>
                                                        current === key ? "" : key,
                                                    );
                                                    return;
                                                }

                                                setExecutivePillarKey((current) =>
                                                    current === key ? "" : key,
                                                );
                                            }}
                                        />
                                    </div>

                                    <ExecutiveVisualControlPanel
                                        modes={executiveModeData.modes}
                                        activeMode={executiveAnalysisMode}
                                        stageLabel={executiveStageLabel}
                                        pillarLabel={executivePillarLabel}
                                        countyLabel={executiveCountyLabel}
                                        resultCount={executiveAnalysisPrograms.length}
                                        totalCount={cockpitPrograms.length}
                                        onSelectMode={(modeKey) => {
                                            setExecutiveAnalysisMode(modeKey);
                                            setExecutiveStageKey("");
                                            setExecutivePillarKey("");
                                            setExecutiveCountyKey("");
                                        }}
                                        onResetSlices={() => {
                                            setExecutiveStageKey("");
                                            setExecutivePillarKey("");
                                            setExecutiveCountyKey("");
                                        }}
                                    />
                                </div>
                            </section>
                        ) : (
                            <section className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[minmax(390px,0.38fr)_minmax(0,1fr)] xl:items-start">
                                <div className="min-h-0 self-start">
                                    <StatusPieCard
                                        title="Program"
                                        total={programPieTotal}
                                        rows={programPieRows}
                                        icon={<ClipboardCheck size={19} />}
                                        helper={
                                            visualProgram
                                                ? "Status data terpilih"
                                                : "Status program"
                                        }
                                    />
                                    </div>

                                    <div className="min-h-[520px] xl:h-full">
                                        <VisualProcessPanel
                                            mode="PROGRAM"
                                            query={visualProgramQuery}
                                            setQuery={(value) => {
                                                setVisualAssessmentQuery("");
                                                setVisualProgramQuery(value);
                                            }}
                                            item={visualProgram}
                                            steps={visualProcessSteps}
                                            targets={[]}
                                            getTitle={getProgramTitle}
                                            getCode={getProgramCode}
                                            nowMs={assessmentClock}
                                            staggeredHeader={false}
                                        />
                                    </div>
                        </section>
                    )}
                </div>
            </main>
        </PageWrapper>
    );
}

export default DashboardBase;