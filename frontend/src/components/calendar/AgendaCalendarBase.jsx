/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import idLocale from "@fullcalendar/core/locales/id";
import Holidays from "date-holidays";

import {
    AlertTriangle,
    CalendarDays,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Eye,
    FileCheck2,
    Flag,
    Layers3,
    MapPin,
    Pencil,
    Plus,
    RefreshCw,
    Save,
    Search,
    Sparkles,
    UsersRound,
    AtSign,
    Trash2,
    X,
} from "lucide-react";

import Sidebar from "../Sidebar";
import PageWrapper from "../PageWrapper";
import Dropdown from "../Dropdown";
import astraLogo from "../../assets/img/logo-astra.png";
import satuIndonesiaLogo from "../../assets/img/satu_indonesia.png";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

const AGENDA_LOGO_PATHS = {
    astra: astraLogo,
    satuIndonesia: satuIndonesiaLogo,
};

const AGENDA_TABLE_PAGE_SIZE = 10;

const MONTH_NAMES = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
];

const VIEW_MODES = [
    { label: "Month", value: "MONTH", fullCalendarView: "dayGridMonth" },
    { label: "Week", value: "WEEK", fullCalendarView: "timeGridWeek" },
    { label: "Day", value: "DAY", fullCalendarView: "timeGridDay" },
];

const DEFAULT_COE_FORM = {
    title: "",
    date: "",
    startTime: "08:00",
    endTime: "09:00",
    location: "",
    description: "",
    pilar: "",
    activityType: "",
    meetingLink: "",
    jenjang_targets: [],
    participants: [],
};

const DEFAULT_TYPE_VISIBILITY = {
    showProgram: true,
    showFase: true,
    showAssessment: true,
    showCOE: true,
    showHoliday: true,
};

const PILAR_OPTIONS = [
    { label: "Akademik", value: "AKADEMIK", bidang: "AKADEMIK" },
    { label: "Karakter", value: "KARAKTER", bidang: "AKADEMIK" },
    { label: "Seni Budaya", value: "SENI_BUDAYA", bidang: "NON_AKADEMIK" },
    { label: "Kecakapan Hidup", value: "KECAKAPAN_HIDUP", bidang: "NON_AKADEMIK" },
];

const JENJANG_OPTIONS = ["SD", "SMP", "SMK"];

const COE_ACTIVITY_TYPES = [
    { label: "Indoor", value: "INDOOR" },
    { label: "Outdoor", value: "OUTDOOR" },
    { label: "Via Daring", value: "DARING" },
];

function normalizeArray(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.result)) return payload.result;
    if (Array.isArray(payload?.rows)) return payload.rows;
    if (Array.isArray(payload?.programs)) return payload.programs;
    if (Array.isArray(payload?.program)) return payload.program;
    if (Array.isArray(payload?.assessments)) return payload.assessments;
    if (Array.isArray(payload?.assessment)) return payload.assessment;
    return [];
}

function getArray(...values) {
    return values.find((value) => Array.isArray(value)) || [];
}

async function safeJson(response) {
    try {
        return await response.json();
    } catch {
        return {};
    }
}

function normalizeId(value) {
    if (value === null || value === undefined || value === "") return "";
    return String(value);
}

function toLocalDate(value) {
    if (value instanceof Date) return value;

    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split("-").map(Number);
        return new Date(year, month - 1, day);
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return new Date();

    return date;
}

function formatDateKey(value) {
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
    }

    const date = toLocalDate(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatReadableDate(value) {
    return toLocalDate(value).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

function normalizeTime(value) {
    if (!value) return "";
    return String(value).slice(0, 5);
}

function normalizeBidang(value) {
    const text = String(value || "")
        .trim()
        .toUpperCase()
        .replaceAll("-", "_")
        .replaceAll(" ", "_");

    if (text.includes("NON")) return "NON_AKADEMIK";
    if (text.includes("AKADEMIK")) return "AKADEMIK";

    return text || "";
}

function normalizePilar(value) {
    const text = String(value || "")
        .trim()
        .toUpperCase()
        .replaceAll("-", "_")
        .replaceAll(" ", "_");

    if (text.includes("KECAKAPAN")) return "KECAKAPAN_HIDUP";
    if (text.includes("SENI")) return "SENI_BUDAYA";
    if (text.includes("KARAKTER")) return "KARAKTER";
    if (text.includes("AKADEMIK")) return "AKADEMIK";

    return "";
}

function getPilarLabel(value) {
    const pilar = normalizePilar(value);
    return PILAR_OPTIONS.find((item) => item.value === pilar)?.label || "Semua Pilar";
}

function normalizeActivityType(value) {
    const text = String(value || "")
        .trim()
        .toUpperCase()
        .replaceAll("-", "_")
        .replaceAll(" ", "_");

    if (text.includes("OUT")) return "OUTDOOR";
    if (text.includes("DAR") || text.includes("ONLINE") || text.includes("VIA")) return "DARING";
    if (text.includes("IN")) return "INDOOR";

    return "";
}

function getActivityTypeLabel(value) {
    const type = normalizeActivityType(value);
    return COE_ACTIVITY_TYPES.find((item) => item.value === type)?.label || "Tipe belum diisi";
}

function normalizeExternalUrl(value) {
    const text = String(value || "").trim();
    if (!text) return "";
    if (/^https?:\/\//i.test(text)) return text;
    return `https://${text}`;
}

function getAllowedPilarOptions(user = {}, lockedBidang = "", scope = "") {
    const roleId = getRoleId(user);
    const userJenis = normalizeBidang(user?.jenis || lockedBidang);
    const normalizedScope = String(scope || "").toUpperCase();

    if (roleId === 3 || normalizedScope === "HO") {
        const targetBidang = userJenis || normalizeBidang(lockedBidang);
        if (targetBidang) {
            return PILAR_OPTIONS.filter((item) => item.bidang === targetBidang);
        }
    }

    return PILAR_OPTIONS;
}

function getAllowedJenjangOptions(user = {}, scope = "") {
    const roleId = getRoleId(user);
    const normalizedScope = String(scope || "").toUpperCase();
    const subJenis = String(user?.sub_jenis || user?.subJenis || "").toUpperCase();
    const userJenjang = String(user?.sekolah?.jenjang || user?.jenjang || "").toUpperCase();

    if (roleId === 3 || normalizedScope === "HO") {
        if (subJenis.includes("SMK")) return ["SMK"];
        if (subJenis.includes("SD") && subJenis.includes("SMP")) return ["SD", "SMP"];
        if (subJenis.includes("SMP")) return ["SMP"];
        if (subJenis.includes("SD")) return ["SD"];
    }

    if (["SEKOLAH"].includes(normalizedScope) && userJenjang) return [userJenjang];

    return JENJANG_OPTIONS;
}

function getBidangText(value) {
    if (!value) return "Semua Bidang";
    return normalizeBidang(value) === "NON_AKADEMIK"
        ? "Non Akademik"
        : "Akademik";
}

function isSameBidang(value, lockedBidang) {
    if (!lockedBidang) return true;
    return normalizeBidang(value || lockedBidang) === normalizeBidang(lockedBidang);
}

function firstAvailableDate(...values) {
    const found = values.find((value) => {
        if (!value) return false;
        const date = new Date(value);
        return !Number.isNaN(date.getTime());
    });

    return found || null;
}

function buildDateTime(dateKey, timeValue, fallbackTime = "00:00") {
    return new Date(`${dateKey}T${normalizeTime(timeValue) || fallbackTime}:00`);
}

function getCurrentUserFromToken() {
    const token = localStorage.getItem("token");

    if (!token) return null;

    try {
        return jwtDecode(token);
    } catch {
        return null;
    }
}

function getUserId(user = {}) {
    return (
        user?.id_user ??
        user?.id ??
        user?.sub ??
        user?.userId ??
        user?.user_id ??
        ""
    );
}

function getRoleId(user = {}) {
    return Number(
        user?.id_role ??
        user?.role_id ??
        user?.role?.id_role ??
        user?.role?.id ??
        0,
    );
}

function getSchoolId(user = {}) {
    return (
        user?.id_sekolah ??
        user?.sekolah_id ??
        user?.school_id ??
        user?.sekolah?.id_sekolah ??
        user?.sekolah?.id ??
        user?.school?.id_sekolah ??
        user?.school?.id ??
        ""
    );
}

function getVendorId(user = {}) {
    return (
        user?.id_vendor ??
        user?.vendor_id ??
        user?.vendor?.id_vendor ??
        user?.vendor?.id ??
        ""
    );
}


function getMentionKey(item = {}) {
    const type = String(
        item?.participant_type || item?.recipient_type || item?.type || "USER",
    ).toUpperCase();
    const id =
        item?.participant_id ??
        item?.recipient_id ??
        item?.id_user ??
        item?.id_guru_assessment ??
        item?.id;

    return `${type}:${normalizeId(id)}`;
}

function normalizeMentionOption(item = {}) {
    const participantType = String(
        item?.participant_type || item?.recipient_type || item?.type || "USER",
    ).toUpperCase();
    const participantId =
        item?.participant_id ??
        item?.recipient_id ??
        item?.id_user ??
        item?.id_guru_assessment ??
        item?.id;

    return {
        key: `${participantType}:${normalizeId(participantId)}`,
        participant_type: participantType,
        participant_id: Number(participantId),
        name:
            item?.name ||
            item?.nama ||
            item?.participant_name_snapshot ||
            item?.nama_guru ||
            "User",
        email:
            item?.email ||
            item?.participant_email_snapshot ||
            item?.email_guru ||
            "",
        role_label:
            item?.role_label ||
            item?.role_name_snapshot ||
            item?.role?.nama_role ||
            item?.nama_role ||
            item?.role ||
            "User",
        meta: item?.meta || item?.jabatan || item?.jenis || "",
    };
}

function normalizeAgendaParticipants(agenda = {}) {
    return getArray(
        agenda?.participants,
        agenda?.participant,
        agenda?.agenda_participants,
    )
        .map(normalizeMentionOption)
        .filter((item) => item.participant_id && item.key);
}

function getProgramId(program) {
    return program?.id_program ?? program?.id;
}

function getAssessmentId(assessment) {
    return assessment?.id_assessment ?? assessment?.id;
}

function getProgramName(program) {
    return program?.nama_program || program?.nama || program?.title || "Program";
}

function getAssessmentName(assessment) {
    return (
        assessment?.nama_assessment ||
        assessment?.nama ||
        assessment?.judul ||
        assessment?.title ||
        "Assessment"
    );
}

function getProgramCategory(program, lockedBidang) {
    return normalizeBidang(
        program?.kategori ||
        program?.kategori_program ||
        program?.jenis ||
        program?.tipe ||
        lockedBidang ||
        "",
    );
}

function getProgramPilar(program, lockedBidang) {
    return normalizePilar(
        program?.pilar_program ||
        program?.pilarProgram ||
        program?.pilar ||
        program?.kategori_pilar ||
        getProgramCategory(program, lockedBidang),
    );
}

function getAssessmentCategory(assessment, lockedBidang) {
    return normalizeBidang(
        assessment?.jenis ||
        assessment?.kategori ||
        assessment?.tipe ||
        assessment?.category ||
        lockedBidang ||
        "",
    );
}

function getAssessmentPilar(assessment, lockedBidang) {
    return normalizePilar(
        assessment?.pilar ||
        assessment?.pilar_assessment ||
        assessment?.pilar_program ||
        getAssessmentCategory(assessment, lockedBidang),
    );
}

function getProgramBaseDate(program) {
    return (
        firstAvailableDate(
            program?.tanggal_mulai,
            program?.start_date,
            program?.periode_mulai,
            program?.created_at,
            program?.updated_at,
        ) || new Date()
    );
}

function getFaseDate(program, fase) {
    return (
        firstAvailableDate(
            fase?.tanggal_mulai,
            fase?.tanggal,
            fase?.start_date,
            fase?.created_at,
            program?.tanggal_mulai,
            program?.start_date,
            program?.created_at,
        ) || new Date()
    );
}

function getAssessmentDate(assessment) {
    return (
        firstAvailableDate(
            assessment?.deadline,
            assessment?.tenggat,
            assessment?.tanggal_deadline,
            assessment?.due_date,
            assessment?.sent_at,
            assessment?.created_at,
        ) || new Date()
    );
}

function isDoneText(value) {
    const text = String(value || "").toUpperCase();

    return (
        text.includes("SELESAI") ||
        text.includes("DONE") ||
        text.includes("TERKIRIM") ||
        text.includes("COMPLETED") ||
        text.includes("SUDAH")
    );
}

function getProgramDetailPath(program, lockedBidang) {
    const id = getProgramId(program);
    const bidang = normalizeBidang(lockedBidang || getProgramCategory(program));

    if (!id) return "";

    if (bidang === "NON_AKADEMIK") {
        return `/ho/program/non-akademik/detail/${id}`;
    }

    return `/ho/program/akademik/detail/${id}`;
}

function getAssessmentDetailPath(assessment, lockedBidang) {
    const id = getAssessmentId(assessment);
    const bidang = normalizeBidang(lockedBidang || getAssessmentCategory(assessment));

    if (!id) return "";

    if (bidang === "NON_AKADEMIK") {
        return `/ho/assessment/non-akademik/detail/${id}`;
    }

    return `/ho/assessment/akademik/detail/${id}`;
}

function getCoeRuntimeStatus(event) {
    const dbStatus = String(event?.status || event?.dbStatus || "").toUpperCase();

    if (dbStatus === "DONE") return "SELESAI";
    if (dbStatus === "CANCELLED") return "DIBATALKAN";

    const now = new Date();
    const start = buildDateTime(event.date, event.startTime, "00:00");
    const end = buildDateTime(event.date, event.endTime, "23:59");

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return "YANG_AKAN_DATANG";
    }

    if (now < start) return "YANG_AKAN_DATANG";
    if (now >= start && now <= end) return "DALAM_PROSES";
    if (now > end) return "OVERDUE";

    return "YANG_AKAN_DATANG";
}

function getEventStatus(event) {
    if (event.type === "HOLIDAY") return "TANGGAL_MERAH";
    if (event.type === "COE") return getCoeRuntimeStatus(event);
    if (isDoneText(event?.phase)) return "SELESAI";
    return "DALAM_PROSES";
}

function getStatusLabel(status) {
    if (status === "TANGGAL_MERAH") return "Tanggal Merah";
    if (status === "YANG_AKAN_DATANG") return "Yang Akan Datang";
    if (status === "DALAM_PROSES") return "Dalam Proses";
    if (status === "SELESAI") return "Selesai";
    if (status === "OVERDUE") return "Overdue";
    if (status === "DIBATALKAN") return "Dibatalkan";
    return status || "-";
}

function slugText(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function mapIndonesiaHolidaysToEvents(displayYear) {
    const holidayEngine = new Holidays("ID");
    const targetYears = [displayYear - 1, displayYear, displayYear + 1]
        .filter((year) => year >= 2024 && year <= 2030);

    const rows = targetYears.flatMap((year) => {
        try {
            return holidayEngine.getHolidays(year) || [];
        } catch {
            return [];
        }
    });

    const mapped = rows
        .filter((item) => {
            const type = String(item?.type || "").toLowerCase();
            return ["public", "bank", "optional", "observance"].includes(type);
        })
        .map((item, index) => {
            const dateKey = formatDateKey(item?.start || item?.date);
            const type = String(item?.type || "").toLowerCase();
            const isPublic = type === "public" || type === "bank";

            return {
                id: `holiday-${dateKey}-${slugText(item?.name || index)}`,
                source: "HOLIDAY",
                type: "HOLIDAY",
                title: item?.name || "Hari Libur Nasional",
                date: dateKey,
                startTime: "",
                endTime: "",
                categoryLabel: isPublic ? "Tanggal Merah" : "Hari Besar",
                description: item?.name || "Hari besar / perayaan nasional",
                location: "Indonesia",
                phase: isPublic ? "Libur Nasional" : "Peringatan",
                path: "",
                raw: item,
            };
        });

    const unique = new Map();

    mapped.forEach((item) => unique.set(item.id, item));

    return Array.from(unique.values());
}

function mapProgramsToEvents(programs, options = {}) {
    const {
        lockedBidang,
        showFase = true,
        roleScope = "ADMIN",
        buildProgramPath,
    } = options;

    return programs.flatMap((program, programIndex) => {
        const id = getProgramId(program);
        const programName = getProgramName(program);
        const category = getProgramCategory(program, lockedBidang);
        const categoryLabel = getBidangText(category);
        const pilar = getProgramPilar(program, lockedBidang);
        const path =
            typeof buildProgramPath === "function"
                ? buildProgramPath(program)
                : getProgramDetailPath(program, lockedBidang);

        const programEvent = {
            id: `program-${id || programIndex}`,
            source: "SYSTEM",
            type: "PROGRAM",
            title: programName,
            date: formatDateKey(getProgramBaseDate(program)),
            startTime: normalizeTime(program?.jam_mulai || program?.start_time),
            endTime: normalizeTime(program?.jam_selesai || program?.end_time),
            categoryLabel,
            pilar,
            description:
                program?.deskripsi ||
                program?.description ||
                "Program berjalan dalam sistem monitoring.",
            location: program?.lokasi || program?.location || "",
            phase: program?.status_program || program?.status || "Program",
            path,
            raw: program,
        };

        const fases = showFase
            ? getArray(program?.fases, program?.fase, program?.t_fase)
            : [];

        const faseEvents = fases.map((fase, faseIndex) => {
            const faseName =
                fase?.nama_fase ||
                fase?.nama ||
                fase?.fase ||
                `Fase ${faseIndex + 1}`;

            return {
                id: `fase-${id || programIndex}-${fase?.id_fase || fase?.id || faseIndex}`,
                source: "SYSTEM",
                type: "FASE",
                title: `${faseName} · ${programName}`,
                date: formatDateKey(getFaseDate(program, fase)),
                startTime: normalizeTime(fase?.jam_mulai || fase?.start_time),
                endTime: normalizeTime(fase?.jam_selesai || fase?.end_time),
                categoryLabel: "Fase Program",
                pilar,
                description:
                    fase?.deskripsi ||
                    fase?.description ||
                    `Fase ${faseIndex + 1} dari program ${programName}.`,
                location: fase?.lokasi || fase?.location || "",
                phase: faseName,
                path,
                raw: {
                    ...program,
                    current_fase: fase,
                },
            };
        });

        return [programEvent, ...faseEvents];
    });
}

function mapAssessmentsToEvents(assessments, options = {}) {
    const { lockedBidang, buildAssessmentPath } = options;

    return assessments.map((assessment, index) => {
        const category = getAssessmentCategory(assessment, lockedBidang);
        const categoryLabel = getBidangText(category);
        const pilar = getAssessmentPilar(assessment, lockedBidang);
        const path =
            typeof buildAssessmentPath === "function"
                ? buildAssessmentPath(assessment)
                : getAssessmentDetailPath(assessment, lockedBidang);

        return {
            id: `assessment-${getAssessmentId(assessment) || index}`,
            source: "SYSTEM",
            type: "ASSESSMENT",
            title: getAssessmentName(assessment),
            date: formatDateKey(getAssessmentDate(assessment)),
            startTime: normalizeTime(assessment?.jam_mulai || assessment?.start_time),
            endTime: normalizeTime(assessment?.jam_selesai || assessment?.end_time),
            categoryLabel,
            pilar,
            description:
                assessment?.deskripsi ||
                assessment?.description ||
                assessment?.keterangan ||
                assessment?.status ||
                "Assessment dalam sistem monitoring.",
            location: "",
            phase: assessment?.status || "Assessment",
            path,
            raw: assessment,
        };
    });
}

function mapCoeToEvents(agendas) {
    return agendas.map((agenda) => ({
        id: `coe-${agenda.id_agenda || agenda.id}`,
        agendaId: agenda.id_agenda || agenda.id,
        source: "DATABASE",
        type: "COE",
        title: agenda.title || "Calendar of Event",
        date: formatDateKey(agenda.agenda_date || agenda.date || agenda.tanggal),
        startTime: normalizeTime(agenda.start_time || agenda.startTime),
        endTime: normalizeTime(agenda.end_time || agenda.endTime),
        categoryLabel: "COE",
        description: agenda.description || agenda.status_note || "",
        location: agenda.location || "",
        pilar: normalizePilar(agenda.pilar),
        activityType: normalizeActivityType(agenda.activity_type || agenda.activityType),
        meetingLink: agenda.meeting_link || agenda.meetingLink || agenda.zoom_link || "",
        jenjangTargets: Array.isArray(agenda.jenjang_targets) ? agenda.jenjang_targets : [],
        phase: agenda.status || "SCHEDULED",
        status: agenda.status || "SCHEDULED",
        dbStatus: agenda.status || "SCHEDULED",
        path: "",
        raw: agenda,
    }));
}

function getEventVisual(event) {
    if (event.type === "HOLIDAY") {
        return {
            label: "Tanggal Merah",
            badge: "bg-rose-50 text-rose-700 border-rose-100",
            dot: "bg-rose-500",
            className: "holiday",
        };
    }

    if (event.type === "PROGRAM") {
        return {
            label: "Program",
            badge: "bg-cyan-50 text-cyan-700 border-cyan-100",
            dot: "bg-[#0AC4E0]",
            className: "program",
        };
    }

    if (event.type === "FASE") {
        return {
            label: "Fase",
            badge: "bg-indigo-50 text-indigo-700 border-indigo-100",
            dot: "bg-indigo-500",
            className: "fase",
        };
    }

    if (event.type === "ASSESSMENT") {
        return {
            label: "Assessment",
            badge: "bg-slate-50 text-slate-700 border-slate-100",
            dot: "bg-slate-500",
            className: "assessment",
        };
    }

    const status = getCoeRuntimeStatus(event);

    if (status === "SELESAI") {
        return {
            label: "COE Selesai",
            badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
            dot: "bg-emerald-500",
            className: "coe-done",
        };
    }

    if (status === "DALAM_PROSES") {
        return {
            label: "COE Proses",
            badge: "bg-amber-50 text-amber-700 border-amber-100",
            dot: "bg-amber-500",
            className: "coe-process",
        };
    }

    if (status === "OVERDUE" || status === "DIBATALKAN") {
        return {
            label: "COE Overdue",
            badge: "bg-rose-50 text-rose-700 border-rose-100",
            dot: "bg-rose-500",
            className: "coe-overdue",
        };
    }

    return {
        label: "COE",
        badge: "bg-slate-50 text-slate-700 border-slate-100",
        dot: "bg-slate-400",
        className: "coe-upcoming",
    };
}

function shouldKeepProgramByRole(program, user, roleScope) {
    const scope = String(roleScope || "").toUpperCase();

    if (["ADMIN", "PENGURUS", "HO", "KEPALA_DINAS"].includes(scope)) {
        return true;
    }

    if (scope === "AO") {
        const userId = normalizeId(getUserId(user));
        const aoIds = [
            program?.id_pengawas,
            program?.id_ao,
            program?.ao_id,
            program?.pengawas?.id_user,
            program?.pengawas?.id,
            ...(Array.isArray(program?.ao_ids) ? program.ao_ids : []),
            ...(Array.isArray(program?.aos)
                ? program.aos.map((ao) => ao?.id_user || ao?.id)
                : []),
        ]
            .map(normalizeId)
            .filter(Boolean);

        return aoIds.includes(userId);
    }

    if (scope === "SEKOLAH") {
        const schoolId = normalizeId(getSchoolId(user));
        const schoolIds = [
            program?.id_sekolah,
            program?.sekolah_id,
            program?.sekolah?.id_sekolah,
            program?.sekolah?.id,
            ...(Array.isArray(program?.sekolah_ids) ? program.sekolah_ids : []),
            ...(Array.isArray(program?.sekolahs)
                ? program.sekolahs.map((school) => school?.id_sekolah || school?.id)
                : []),
        ]
            .map(normalizeId)
            .filter(Boolean);

        return schoolIds.includes(schoolId);
    }

    if (scope === "VENDOR") {
        const vendorId = normalizeId(getVendorId(user));
        const vendorIds = [
            program?.id_vendor,
            program?.vendor_id,
            program?.vendor?.id_vendor,
            program?.vendor?.id,
            ...(Array.isArray(program?.vendor_ids) ? program.vendor_ids : []),
            ...(Array.isArray(program?.vendors)
                ? program.vendors.map((vendor) => vendor?.id_vendor || vendor?.id)
                : []),
        ]
            .map(normalizeId)
            .filter(Boolean);

        return vendorIds.includes(vendorId);
    }

    return true;
}

function SummaryCard({ label, value, helper, icon, active = false, onClick }) {
    return (
        <button
            type={onClick ? "button" : "button"}
            onClick={onClick}
            disabled={!onClick}
            className={`group rounded-2xl border p-5 text-left shadow-sm transition-all ${active
                ? "border-[#0AC4E0] bg-cyan-50 shadow-[0_16px_40px_rgba(10,196,224,0.12)]"
                : "border-slate-100 bg-white hover:border-cyan-100 hover:bg-cyan-50/35"
                } ${onClick ? "cursor-pointer" : "cursor-default"}`}
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${active ? "text-[#0AC4E0]" : "text-slate-400"}`}>
                        {label}
                    </p>
                    <h3 className="mt-2 text-[30px] font-black leading-none tracking-[-0.05em] text-slate-800">
                        {value}
                    </h3>
                    {helper && (
                        <p className="mt-2 text-[10px] font-bold text-slate-400">
                            {helper}
                        </p>
                    )}
                </div>

                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl transition ${active ? "bg-[#0AC4E0] text-white" : "bg-cyan-50 text-[#0AC4E0] group-hover:bg-white"}`}>
                    {icon}
                </div>
            </div>
        </button>
    );
}

function FilterGroup({ title, children, tone = "cyan" }) {
    const toneClass = tone === "amber" ? "text-amber-500" : tone === "dark" ? "text-slate-500" : "text-[#0AC4E0]";

    return (
        <div className="rounded-2xl border border-slate-100 bg-white/90 p-3 shadow-sm">
            <p className={`mb-2 text-[9px] font-black uppercase tracking-[0.2em] ${toneClass}`}>
                {title}
            </p>
            <div className="flex flex-wrap gap-2">{children}</div>
        </div>
    );
}

function FilterButton({ active, children, onClick, tone = "cyan" }) {
    const activeClass =
        tone === "amber"
            ? "border-amber-500 bg-amber-500 text-white shadow-[0_10px_24px_rgba(245,158,11,0.18)]"
            : tone === "dark"
                ? "border-slate-800 bg-slate-800 text-white shadow-[0_10px_24px_rgba(15,23,42,0.16)]"
                : "border-[#0AC4E0] bg-[#0AC4E0] text-white shadow-[0_10px_24px_rgba(10,196,224,0.18)]";

    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-xl border px-3.5 py-2 text-[10px] font-black uppercase tracking-wide transition ${active
                ? activeClass
                : "border-slate-200 bg-white text-slate-500 hover:border-cyan-200 hover:bg-cyan-50 hover:text-slate-800"
                }`}
        >
            {children}
        </button>
    );
}

function AgendaFilterSelect({ label, value, onChange, options, tone = "cyan" }) {
    const accentClass =
        tone === "amber"
            ? "text-amber-500"
            : tone === "dark"
                ? "text-slate-500"
                : "text-[#0AC4E0]";

    return (
        <div className="group min-w-[154px] flex-1 rounded-2xl border border-slate-100 bg-white px-3 py-2 shadow-sm transition hover:border-cyan-100 hover:shadow-md">
            <span className={`mb-1 block text-[8px] font-black uppercase tracking-[0.2em] ${accentClass}`}>
                {label}
            </span>
            <Dropdown
                value={value}
                items={options}
                onChange={onChange}
                placeholder="Pilih..."
                usePortal={false}
            />
        </div>
    );
}

function EventList({ events, onOpen, canManageCOE, onEditCOE, onDoneCOE, onDeleteCOE }) {
    if (!events.length) {
        return (
            <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
                <CalendarDays className="mb-3 text-[#0AC4E0]" size={28} />
                <p className="text-[13px] font-black text-slate-700">
                    Tidak ada agenda
                </p>
                <p className="mt-1 max-w-[260px] text-[11px] font-semibold leading-5 text-slate-400">
                    Pilih tanggal lain untuk melihat program, fase, assessment,
                    COE, atau tanggal merah.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {events.map((event) => {
                const visual = getEventVisual(event);
                const status = getEventStatus(event);
                const isCOE = event.type === "COE";
                const isDone = status === "SELESAI";
                const isCancelled = status === "DIBATALKAN";

                return (
                    <div
                        key={event.id}
                        className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-cyan-100 hover:bg-cyan-50/20"
                    >
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span
                                className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${visual.badge}`}
                            >
                                {visual.label}
                            </span>

                            <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500">
                                {isCOE ? getStatusLabel(status) : event.categoryLabel}
                            </span>

                            {isCOE && event.pilar && (
                                <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-cyan-700">
                                    {getPilarLabel(event.pilar)}
                                </span>
                            )}

                            {isCOE && event.activityType && (
                                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-amber-700">
                                    {getActivityTypeLabel(event.activityType)}
                                </span>
                            )}
                        </div>

                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <h3 className="line-clamp-2 text-[13px] font-black leading-5 text-slate-800">
                                    {event.title}
                                </h3>

                                <div className="mt-3 space-y-1.5 text-[11px] font-bold text-slate-500">
                                    <p className="flex items-center gap-2">
                                        <Clock3 size={13} className="text-[#0AC4E0]" />
                                        {event.startTime || "Sepanjang hari"}
                                        {event.endTime ? ` - ${event.endTime}` : ""}
                                    </p>

                                    {event.location && (
                                        <p className="flex items-center gap-2">
                                            <MapPin
                                                size={13}
                                                className="text-[#0AC4E0]"
                                            />
                                            {event.location}
                                        </p>
                                    )}

                                    {isCOE && status === "OVERDUE" && (
                                        <p className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-rose-600">
                                            <AlertTriangle size={13} />
                                            Jadwal sudah lewat dan belum selesai.
                                        </p>
                                    )}

                                    {isCOE && event.meetingLink && (
                                        <a
                                            href={normalizeExternalUrl(event.meetingLink)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-2 rounded-xl bg-cyan-50 px-3 py-2 text-[11px] font-black text-[#0AC4E0] transition hover:bg-cyan-100"
                                        >
                                            <MapPin size={13} />
                                            Buka link meeting
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="flex shrink-0 flex-wrap justify-end gap-2">
                                {event.path && (
                                    <button
                                        type="button"
                                        onClick={() => onOpen(event)}
                                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0AC4E0] text-white transition hover:bg-cyan-500 active:scale-95"
                                        title="Lihat detail"
                                    >
                                        <Eye size={15} />
                                    </button>
                                )}

                                {canManageCOE && isCOE && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => onEditCOE(event)}
                                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition hover:bg-amber-100 active:scale-95"
                                            title="Edit COE"
                                        >
                                            <Pencil size={15} />
                                        </button>

                                        {!isDone && !isCancelled && (
                                            <button
                                                type="button"
                                                onClick={() => onDoneCOE(event)}
                                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 active:scale-95"
                                                title="Tandai selesai"
                                            >
                                                <CheckCircle2 size={15} />
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => onDeleteCOE(event)}
                                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition hover:bg-rose-100 active:scale-95"
                                            title="Hapus COE"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {event.description && (
                            <p className="mt-3 line-clamp-3 text-[11px] font-semibold leading-5 text-slate-400">
                                {event.description}
                            </p>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function AgendaLogoSlot({ src, label, align = "left" }) {
    return (
        <div className={`flex min-h-[72px] items-center ${align === "right" ? "justify-end text-right" : "justify-start text-left"}`}>
            <div className="relative flex min-w-[190px] items-center justify-center px-1">
                <img
                    src={src}
                    alt={label}
                    className="max-h-16 max-w-[180px] object-contain"
                    onError={(event) => {
                        event.currentTarget.style.display = "none";
                        event.currentTarget.nextElementSibling?.classList.remove("hidden");
                    }}
                />
                <span className="hidden text-[9px] font-black uppercase tracking-[0.18em] text-slate-300">
                    Slot {label}
                </span>
            </div>
        </div>
    );
}

function getEventJenjangLabel(event) {
    const targets = Array.isArray(event?.jenjangTargets)
        ? event.jenjangTargets
        : Array.isArray(event?.raw?.jenjang_targets)
            ? event.raw.jenjang_targets
            : [];

    const directValue =
        event?.jenjang ||
        event?.raw?.jenjang ||
        event?.raw?.target_jenjang ||
        event?.raw?.sekolah?.jenjang ||
        event?.raw?.program?.jenjang;

    if (targets.length) return targets.join(", ");
    if (directValue) return String(directValue).toUpperCase();

    return "Semua Jenjang";
}

function AgendaDaySection({
    title,
    events,
    total,
    emptyText,
    type = "program",
    onOpen,
    canManageCOE = false,
    onEditCOE,
    onDoneCOE,
    onDeleteCOE,
}) {
    return (
        <section className="min-w-0">
            <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-200 pb-2">
                <h3 className="text-[12px] font-black uppercase tracking-[0.18em] text-slate-800">
                    {title}
                </h3>
                <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-[9px] font-black text-[#0AC4E0]">
                    {total}
                </span>
            </div>

            {events.length ? (
                <div className="agenda-scroll max-h-[102px] space-y-2 overflow-y-auto pr-2">
                    {events.map((event) => {
                        const isCOE = event.type === "COE";
                        const isHoliday = event.type === "HOLIDAY";
                        const metaParts = isHoliday
                            ? [event.description || "Hari libur nasional"]
                            : [
                                isCOE ? getPilarLabel(event.pilar) : event.categoryLabel || getPilarLabel(event.pilar),
                                getEventJenjangLabel(event),
                                isCOE ? getActivityTypeLabel(event.activityType) : null,
                            ].filter(Boolean);

                        return (
                            <div key={event.id} className="border-b border-slate-100 pb-2.5 last:border-b-0">
                                <button
                                    type="button"
                                    onClick={() => onOpen?.(event)}
                                    disabled={!event.path}
                                    className={`block w-full text-left text-[12px] font-black leading-5 text-slate-800 ${event.path ? "hover:text-[#0AC4E0]" : "cursor-default"}`}
                                >
                                    {event.title}
                                </button>
                                <p className="mt-0.5 text-[10px] font-semibold leading-4 text-slate-500">
                                    ({metaParts.join(" · ")})
                                </p>

                                {isCOE && event.meetingLink && (
                                    <a
                                        href={normalizeExternalUrl(event.meetingLink)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-1 inline-flex text-[10px] font-black text-[#0AC4E0] underline decoration-cyan-300 underline-offset-2"
                                    >
                                        Buka link Zoom / meeting
                                    </a>
                                )}

                                {isCOE && canManageCOE && (
                                    <div className="mt-1.5 flex flex-wrap gap-3 text-[10px] font-black text-slate-500">
                                        <button
                                            type="button"
                                            onClick={() => onEditCOE?.(event)}
                                            className="underline decoration-slate-300 underline-offset-2 hover:text-[#0AC4E0]"
                                        >
                                            Edit
                                        </button>
                                        {!["SELESAI", "DIBATALKAN"].includes(getEventStatus(event)) && (
                                            <button
                                                type="button"
                                                onClick={() => onDoneCOE?.(event)}
                                                className="underline decoration-slate-300 underline-offset-2 hover:text-emerald-600"
                                            >
                                                Selesai
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => onDeleteCOE?.(event)}
                                            className="underline decoration-slate-300 underline-offset-2 hover:text-rose-600"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {total > events.length && (
                        <p className="pt-1 text-[10px] font-bold text-white/65">
                            +{total - events.length} agenda lainnya di tanggal ini.
                        </p>
                    )}
                </div>
            ) : (
                <p className="text-[11px] font-semibold leading-5 text-slate-400">
                    {emptyText}
                </p>
            )}
        </section>
    );
}

function COEFormModal({
    open,
    mode,
    formData,
    setFormData,
    onClose,
    onSubmit,
    mentionOptions = [],
    mentionLoading = false,
    pilarOptions = PILAR_OPTIONS,
    jenjangOptions = JENJANG_OPTIONS,
}) {
    const [mentionQuery, setMentionQuery] = useState("");

    useEffect(() => {
        if (!open) setMentionQuery("");
    }, [open]);

    if (!open) return null;

    const setField = (key, value) => {
        setFormData((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const selectedParticipants = Array.isArray(formData.participants)
        ? formData.participants
        : [];
    const selectedJenjangs = Array.isArray(formData.jenjang_targets)
        ? formData.jenjang_targets
        : [];
    const selectedKeys = new Set(selectedParticipants.map(getMentionKey));
    const keyword = mentionQuery.trim().toLowerCase();
    const suggestions = keyword
        ? mentionOptions
            .filter((item) => !selectedKeys.has(getMentionKey(item)))
            .filter((item) =>
                [item.name, item.email, item.role_label, item.meta]
                    .join(" ")
                    .toLowerCase()
                    .includes(keyword),
            )
            .slice(0, 12)
        : [];

    const addParticipant = (item) => {
        const normalized = normalizeMentionOption(item);
        if (!normalized.participant_id) return;

        setField("participants", [
            ...selectedParticipants.filter(
                (row) => getMentionKey(row) !== normalized.key,
            ),
            normalized,
        ]);
        setMentionQuery("");
    };

    const removeParticipant = (item) => {
        const key = getMentionKey(item);
        setField(
            "participants",
            selectedParticipants.filter((row) => getMentionKey(row) !== key),
        );
    };

    const toggleListValue = (key, value) => {
        const rows = Array.isArray(formData[key]) ? formData[key] : [];
        const normalizedValue = String(value);
        const exists = rows.map(String).includes(normalizedValue);

        setField(
            key,
            exists
                ? rows.filter((item) => String(item) !== normalizedValue)
                : [...rows, value],
        );
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/40 px-4 py-5 backdrop-blur-sm">
            <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
                <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-5">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0AC4E0]">
                            Calendar of Event
                        </p>
                        <h2 className="mt-1 text-[18px] font-black text-slate-800">
                            {mode === "edit" ? "Edit / Reschedule COE" : "Tambah COE"}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="agenda-scroll grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto p-6 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Nama COE
                        </label>
                        <input
                            value={formData.title}
                            onChange={(event) => setField("title", event.target.value)}
                            placeholder="Contoh: Rapat koordinasi program"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-[12px] font-bold text-slate-700 outline-none focus:border-[#0AC4E0] focus:ring-1 focus:ring-[#0AC4E0]"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Tanggal
                        </label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(event) => setField("date", event.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-[12px] font-bold text-slate-700 outline-none focus:border-[#0AC4E0] focus:ring-1 focus:ring-[#0AC4E0]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Mulai
                            </label>
                            <input
                                type="time"
                                value={formData.startTime}
                                onChange={(event) => setField("startTime", event.target.value)}
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-[12px] font-bold text-slate-700 outline-none focus:border-[#0AC4E0] focus:ring-1 focus:ring-[#0AC4E0]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Selesai
                            </label>
                            <input
                                type="time"
                                value={formData.endTime}
                                onChange={(event) => setField("endTime", event.target.value)}
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-[12px] font-bold text-slate-700 outline-none focus:border-[#0AC4E0] focus:ring-1 focus:ring-[#0AC4E0]"
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Lokasi
                        </label>
                        <input
                            value={formData.location}
                            onChange={(event) => setField("location", event.target.value)}
                            placeholder="Opsional"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-[12px] font-bold text-slate-700 outline-none focus:border-[#0AC4E0] focus:ring-1 focus:ring-[#0AC4E0]"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Link Zoom / Meeting
                        </label>
                        <input
                            value={formData.meetingLink || ""}
                            onChange={(event) => setField("meetingLink", event.target.value)}
                            placeholder="Contoh: https://zoom.us/j/..."
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-[12px] font-bold text-slate-700 outline-none focus:border-[#0AC4E0] focus:ring-1 focus:ring-[#0AC4E0]"
                        />
                        <p className="mt-1 text-[10px] font-semibold text-slate-400">
                            Dipakai untuk COE Via Daring. Link akan tampil di detail agenda dan bisa langsung dibuka.
                        </p>
                    </div>

                    <div>
                        <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Pilar COE
                        </label>
                        <select
                            value={formData.pilar || ""}
                            onChange={(event) => setField("pilar", event.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-[12px] font-bold text-slate-700 outline-none focus:border-[#0AC4E0] focus:ring-1 focus:ring-[#0AC4E0]"
                        >
                            <option value="">Semua Pilar</option>
                            {pilarOptions.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Tipe Pelaksanaan
                        </label>
                        <select
                            value={formData.activityType || ""}
                            onChange={(event) => setField("activityType", event.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-[12px] font-bold text-slate-700 outline-none focus:border-[#0AC4E0] focus:ring-1 focus:ring-[#0AC4E0]"
                        >
                            <option value="">Semua tipe / belum ditentukan</option>
                            {COE_ACTIVITY_TYPES.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Jenjang Target
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {jenjangOptions.map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => toggleListValue("jenjang_targets", item)}
                                    className={`rounded-xl border px-4 py-2 text-[10px] font-black uppercase tracking-wide transition ${selectedJenjangs.includes(item)
                                        ? "border-[#0AC4E0] bg-[#0AC4E0] text-white"
                                        : "border-slate-200 bg-white text-slate-500 hover:border-cyan-200 hover:bg-cyan-50"
                                        }`}
                                >
                                    {item}
                                </button>
                            ))}
                            <span className="self-center text-[10px] font-bold text-slate-300">
                                Kosong berarti semua jenjang yang diizinkan.
                            </span>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="mb-2 flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span className="inline-flex items-center gap-2">
                                <AtSign size={13} className="text-[#0AC4E0]" />
                                Mention Peserta
                            </span>
                            <span className="normal-case tracking-normal text-slate-300">
                                {selectedParticipants.length} dipilih
                            </span>
                        </label>

                        <div className="relative">
                            <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 focus-within:border-[#0AC4E0] focus-within:ring-1 focus-within:ring-[#0AC4E0]">
                                <Search size={15} className="shrink-0 text-[#0AC4E0]" />
                                <input
                                    value={mentionQuery}
                                    onChange={(event) => setMentionQuery(event.target.value)}
                                    placeholder="Ketik nama, nama vendor, atau email..."
                                    className="h-full min-w-0 flex-1 bg-transparent text-[12px] font-bold text-slate-700 outline-none placeholder:text-slate-300"
                                />
                            </div>

                            {mentionQuery.trim() && (
                                <div className="absolute inset-x-0 top-[48px] z-20 max-h-64 overflow-y-auto rounded-2xl border border-slate-100 bg-white p-2 shadow-[0_20px_55px_rgba(15,23,42,0.16)]">
                                    {mentionLoading ? (
                                        <p className="px-3 py-5 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Memuat user...
                                        </p>
                                    ) : suggestions.length > 0 ? (
                                        suggestions.map((item) => (
                                            <button
                                                key={item.key}
                                                type="button"
                                                onClick={() => addParticipant(item)}
                                                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-cyan-50"
                                            >
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-[#0AC4E0]">
                                                    <UsersRound size={16} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-[11px] font-black text-slate-800">
                                                        {item.name}
                                                    </p>
                                                    <p className="mt-0.5 truncate text-[9px] font-bold text-slate-400">
                                                        {item.role_label}
                                                        {item.email ? ` · ${item.email}` : ""}
                                                    </p>
                                                </div>
                                                <Plus size={15} className="shrink-0 text-[#0AC4E0]" />
                                            </button>
                                        ))
                                    ) : (
                                        <p className="px-3 py-5 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            User tidak ditemukan
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {selectedParticipants.length > 0 ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {selectedParticipants.map((item) => (
                                    <span
                                        key={getMentionKey(item)}
                                        className="inline-flex max-w-full items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-2 text-[9px] font-black text-cyan-700"
                                    >
                                        <span className="max-w-[210px] truncate">
                                            {item.name} · {item.role_label}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeParticipant(item)}
                                            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white text-cyan-500 hover:text-rose-500"
                                            title="Hapus peserta"
                                        >
                                            <X size={10} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-2 text-[9px] font-bold text-amber-500">
                                Minimal pilih satu peserta agar COE tampil pada agenda penerima.
                            </p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Deskripsi
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(event) => setField("description", event.target.value)}
                            rows={4}
                            placeholder="Catatan COE..."
                            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-[12px] font-bold text-slate-700 outline-none focus:border-[#0AC4E0] focus:ring-1 focus:ring-[#0AC4E0]"
                        />
                    </div>
                </div>

                <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-10 rounded-xl border border-slate-200 bg-white px-5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={onSubmit}
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0AC4E0] px-5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-cyan-500"
                    >
                        <Save size={14} />
                        {mode === "edit" ? "Simpan Perubahan" : "Simpan COE"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AgendaCalendarBase({
    roleScope = "ADMIN",
    lockedBidang = null,
    title = "Calendar Monitoring",
    subtitle = "Pantau seluruh agenda sistem dalam satu tampilan kalender.",
    canManageCOE = false,

    showProgram = DEFAULT_TYPE_VISIBILITY.showProgram,
    showFase = DEFAULT_TYPE_VISIBILITY.showFase,
    showAssessment = DEFAULT_TYPE_VISIBILITY.showAssessment,
    showCOE = DEFAULT_TYPE_VISIBILITY.showCOE,
    showHoliday = DEFAULT_TYPE_VISIBILITY.showHoliday,

    fetchProgramsFn = null,
    fetchAssessmentsFn = null,
    fetchCoeFn = null,

    buildProgramPath = null,
    buildAssessmentPath = null,

    initialFilter = "SEMUA",
}) {
    const navigate = useNavigate();
    const routeLocation = useLocation();
    const calendarRef = useRef(null);
    const openedAgendaRef = useRef("");

    const currentUser = useMemo(() => getCurrentUserFromToken(), []);
    const today = new Date();

    const [displayDate, setDisplayDate] = useState(today);
    const [selectedDateKey, setSelectedDateKey] = useState(formatDateKey(today));
    const [viewMode, setViewMode] = useState("MONTH");

    const [programs, setPrograms] = useState([]);
    const [assessments, setAssessments] = useState([]);
    const [coeEvents, setCoeEvents] = useState([]);
    const [mentionOptions, setMentionOptions] = useState([]);
    const [mentionLoading, setMentionLoading] = useState(false);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState(initialFilter);
    const [activePilar, setActivePilar] = useState("SEMUA");
    const [activeJenjang, setActiveJenjang] = useState("SEMUA");
    const [activeActivityType, setActiveActivityType] = useState("SEMUA");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [tableSearchKeyword, setTableSearchKeyword] = useState("");
    const [tablePage, setTablePage] = useState(1);

    const [showCOEModal, setShowCOEModal] = useState(false);
    const [editingCOE, setEditingCOE] = useState(null);
    const [coeForm, setCoeForm] = useState({
        ...DEFAULT_COE_FORM,
        date: selectedDateKey,
    });

    const scope = String(roleScope || "ADMIN").toUpperCase();
    const bidang = lockedBidang ? normalizeBidang(lockedBidang) : "";
    const bidangLabel = getBidangText(bidang);
    const displayYear = displayDate.getFullYear();
    const allowedPilarOptions = useMemo(
        () => getAllowedPilarOptions(currentUser, bidang, scope),
        [currentUser, bidang, scope],
    );
    const allowedJenjangOptions = useMemo(
        () => getAllowedJenjangOptions(currentUser, scope),
        [currentUser, scope],
    );

    const filterOptions = useMemo(() => {
        const rows = [{ label: "Semua", value: "SEMUA" }];

        if (showProgram) rows.push({ label: "Program", value: "PROGRAM" });
        if (showAssessment) rows.push({ label: "Assessment", value: "ASSESSMENT" });
        if (showCOE) rows.push({ label: "COE", value: "COE" });
        if (showHoliday) rows.push({ label: "Tanggal Merah", value: "HOLIDAY" });

        return rows;
    }, [showProgram, showAssessment, showCOE, showHoliday]);

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return null;
        }

        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
    };


    const fetchMentionOptions = async () => {
        if (!canManageCOE) return;

        setMentionLoading(true);
        try {
            const headers = getAuthHeaders();
            if (!headers) return;

            const response = await fetch(
                `${API_BASE_URL}/admin-agenda/mention-options`,
                { headers },
            );
            const payload = await safeJson(response);

            if (!response.ok) {
                throw new Error(payload?.message || "Gagal memuat daftar mention");
            }

            const rows = normalizeArray(payload)
                .map(normalizeMentionOption)
                .filter((item) => item.participant_id && item.name)
                .sort((a, b) => a.name.localeCompare(b.name, "id"));

            setMentionOptions(rows);
        } catch (error) {
            console.error("Gagal memuat mention:", error);
            toast.error(error.message || "Gagal memuat daftar user");
            setMentionOptions([]);
        } finally {
            setMentionLoading(false);
        }
    };

    const fetchDefaultPrograms = async (headers) => {
        if (!showProgram) return [];

        if (scope === "SEKOLAH") {
            const schoolId = getSchoolId(currentUser);
            const userId = getUserId(currentUser);

            if (schoolId) {
                const response = await fetch(
                    `${API_BASE_URL}/program/sekolah/${schoolId}?id_user=${userId || ""}`,
                    { headers },
                );
                const payload = await safeJson(response);

                if (response.ok) {
                    return normalizeArray(payload);
                }
            }
        }

        const kategoriQuery = bidang ? `?kategori=${bidang}` : "";
        const response = await fetch(`${API_BASE_URL}/program${kategoriQuery}`, {
            headers,
        });
        const payload = await safeJson(response);

        let rows = normalizeArray(payload);

        if (!response.ok || rows.length === 0) {
            try {
                const fallback = await fetch(`${API_BASE_URL}/program`, { headers });
                const fallbackPayload = await safeJson(fallback);
                rows = normalizeArray(fallbackPayload);
            } catch {
                rows = [];
            }
        }

        rows = rows.filter((program) =>
            isSameBidang(
                program?.kategori ||
                program?.kategori_program ||
                program?.jenis ||
                bidang,
                bidang,
            ),
        );

        rows = rows.filter((program) =>
            shouldKeepProgramByRole(program, currentUser, scope),
        );

        const details = await Promise.all(
            rows.map(async (program) => {
                const id = getProgramId(program);

                if (!id) return program;

                try {
                    const detailResponse = await fetch(
                        `${API_BASE_URL}/program/${id}`,
                        { headers },
                    );
                    const detailPayload = await safeJson(detailResponse);

                    if (!detailResponse.ok) return program;

                    return detailPayload?.data || detailPayload || program;
                } catch {
                    return program;
                }
            }),
        );

        return details.filter((program) => getProgramId(program));
    };

    const fetchDefaultAssessments = async (headers) => {
        if (!showAssessment) return [];

        if (scope === "SEKOLAH") {
            const schoolId = getSchoolId(currentUser);
            const userId = getUserId(currentUser);

            if (schoolId) {
                const response = await fetch(
                    `${API_BASE_URL}/assessment/sekolah/${schoolId}?id_user=${userId || ""}`,
                    { headers },
                );
                const payload = await safeJson(response);

                if (response.ok) {
                    return normalizeArray(payload);
                }
            }
        }

        const jenisQuery = bidang
            ? `?jenis=${bidang === "NON_AKADEMIK" ? "non-akademik" : "akademik"}`
            : "";
        const response = await fetch(`${API_BASE_URL}/assessment${jenisQuery}`, {
            headers,
        });
        const payload = await safeJson(response);

        let rows = normalizeArray(payload);

        if (!response.ok || rows.length === 0) {
            try {
                const fallback = await fetch(`${API_BASE_URL}/assessment`, {
                    headers,
                });
                const fallbackPayload = await safeJson(fallback);
                rows = normalizeArray(fallbackPayload);
            } catch {
                rows = [];
            }
        }

        return rows
            .filter((assessment) =>
                isSameBidang(
                    assessment?.jenis ||
                    assessment?.kategori ||
                    assessment?.tipe ||
                    bidang,
                    bidang,
                ),
            )
            .filter((assessment) => getAssessmentId(assessment));
    };

    const fetchDefaultCoe = async (headers) => {
        if (!showCOE) return [];

        const response = await fetch(`${API_BASE_URL}/admin-agenda`, { headers });
        const payload = await safeJson(response);

        if (!response.ok) return [];

        return normalizeArray(payload);
    };

    const fetchCalendarData = async () => {
        setRefreshing(true);

        try {
            const headers = getAuthHeaders();

            if (!headers) return;

            const context = {
                roleScope: scope,
                lockedBidang: bidang,
                currentUser,
                apiBaseUrl: API_BASE_URL,
                normalizeArray,
                safeJson,
            };

            const [programRows, assessmentRows, coeRows] = await Promise.all([
                typeof fetchProgramsFn === "function"
                    ? fetchProgramsFn(headers, context)
                    : fetchDefaultPrograms(headers),
                typeof fetchAssessmentsFn === "function"
                    ? fetchAssessmentsFn(headers, context)
                    : fetchDefaultAssessments(headers),
                typeof fetchCoeFn === "function"
                    ? fetchCoeFn(headers, context)
                    : fetchDefaultCoe(headers),
            ]);

            setPrograms(Array.isArray(programRows) ? programRows : []);
            setAssessments(Array.isArray(assessmentRows) ? assessmentRows : []);
            setCoeEvents(Array.isArray(coeRows) ? coeRows : []);
        } catch (error) {
            console.error("AgendaCalendarBase Error:", error);
            toast.error(error.message || "Gagal memuat agenda");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchCalendarData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scope, bidang]);

    useEffect(() => {
        if (canManageCOE) {
            fetchMentionOptions();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canManageCOE]);

    const programEvents = useMemo(() => {
        if (!showProgram) return [];

        return mapProgramsToEvents(programs, {
            lockedBidang: bidang,
            showFase: false,
            roleScope: scope,
            buildProgramPath,
        });
    }, [programs, bidang, showProgram, scope, buildProgramPath]);

    const assessmentEvents = useMemo(() => {
        if (!showAssessment) return [];

        return mapAssessmentsToEvents(assessments, {
            lockedBidang: bidang,
            buildAssessmentPath,
        });
    }, [assessments, bidang, showAssessment, buildAssessmentPath]);

    const coeCalendarEvents = useMemo(() => {
        if (!showCOE) return [];

        return mapCoeToEvents(coeEvents);
    }, [coeEvents, showCOE]);

    useEffect(() => {
        const agendaId = new URLSearchParams(routeLocation.search).get("agenda");
        if (!agendaId || openedAgendaRef.current === String(agendaId)) return;

        const event = coeCalendarEvents.find(
            (item) => String(item.agendaId) === String(agendaId),
        );
        if (!event) return;

        openedAgendaRef.current = String(agendaId);
        setActiveFilter("COE");
        setSelectedDateKey(event.date);
        setDisplayDate(toLocalDate(event.date));

        window.setTimeout(() => {
            calendarRef.current?.getApi?.()?.gotoDate?.(event.date);
        }, 0);
    }, [routeLocation.search, coeCalendarEvents]);

    const holidayEvents = useMemo(() => {
        if (!showHoliday) return [];

        return mapIndonesiaHolidaysToEvents(displayYear);
    }, [displayYear, showHoliday]);

    const holidayDateSet = useMemo(() => {
        return new Set(holidayEvents.map((event) => event.date));
    }, [holidayEvents]);

    const allEvents = useMemo(() => {
        return [
            ...programEvents,
            ...assessmentEvents,
            ...coeCalendarEvents,
            ...holidayEvents,
        ].sort((a, b) => {
            if (a.date !== b.date) {
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            }

            return String(a.startTime || "99:99").localeCompare(
                String(b.startTime || "99:99"),
            );
        });
    }, [programEvents, assessmentEvents, coeCalendarEvents, holidayEvents]);

    const filteredEvents = useMemo(() => {
        const keyword = searchKeyword.toLowerCase().trim();

        return allEvents.filter((event) => {
            const matchFilter =
                activeFilter === "SEMUA" || event.type === activeFilter;

            const matchPilar =
                activePilar === "SEMUA" ||
                event.type === "HOLIDAY" ||
                normalizePilar(event.pilar || event.raw?.pilar) === activePilar;

            const coeJenjangs = Array.isArray(event.jenjangTargets)
                ? event.jenjangTargets.map((item) => String(item).toUpperCase())
                : [];
            const matchJenjang =
                activeJenjang === "SEMUA" ||
                event.type !== "COE" ||
                coeJenjangs.length === 0 ||
                coeJenjangs.includes(activeJenjang);

            const matchActivityType =
                activeActivityType === "SEMUA" ||
                event.type !== "COE" ||
                normalizeActivityType(event.activityType || event.raw?.activity_type) === activeActivityType;

            const matchSearch = [
                event.title,
                event.type,
                event.categoryLabel,
                getPilarLabel(event.pilar),
                event.phase,
                event.description,
                event.location,
                getStatusLabel(getEventStatus(event)),
            ]
                .join(" ")
                .toLowerCase()
                .includes(keyword);

            return matchFilter && matchPilar && matchJenjang && matchActivityType && matchSearch;
        });
    }, [allEvents, activeFilter, activePilar, activeJenjang, activeActivityType, searchKeyword]);

    const eventMap = useMemo(() => {
        return filteredEvents.reduce((result, event) => {
            if (!result[event.date]) result[event.date] = [];
            result[event.date].push(event);
            return result;
        }, {});
    }, [filteredEvents]);

    const fullCalendarEvents = useMemo(() => {
        const dateCounts = filteredEvents.reduce((result, event) => {
            result[event.date] = (result[event.date] || 0) + 1;
            return result;
        }, {});
        const dateIndexes = {};

        return filteredEvents.map((event) => {
            const status = getEventStatus(event);
            const start = event.startTime
                ? `${event.date}T${event.startTime}:00`
                : event.date;
            const end = event.endTime
                ? `${event.date}T${event.endTime}:00`
                : undefined;
            const dateIndex = dateIndexes[event.date] || 0;

            dateIndexes[event.date] = dateIndex + 1;

            return {
                id: event.id,
                title: event.title,
                start,
                end,
                allDay: !event.startTime,
                classNames: [
                    `fc-type-${String(event.type).toLowerCase()}`,
                    `fc-status-${String(status).toLowerCase().replaceAll("_", "-")}`,
                    event.pilar ? `fc-pilar-${String(event.pilar).toLowerCase().replaceAll("_", "-")}` : "",
                    event.activityType ? `fc-coe-${String(event.activityType).toLowerCase()}` : "",
                ],
                extendedProps: {
                    originalEvent: event,
                    type: event.type,
                    status,
                    categoryLabel: event.categoryLabel,
                    eventCount: dateCounts[event.date] || 0,
                    isFirstEventOfDate: dateIndex === 0,
                },
            };
        });
    }, [filteredEvents]);

    const selectedEvents = eventMap[selectedDateKey] || [];

    const stats = useMemo(() => {
        return {
            program: allEvents.filter((event) => event.type === "PROGRAM").length,
            fase: allEvents.filter((event) => event.type === "FASE").length,
            assessment: allEvents.filter((event) => event.type === "ASSESSMENT").length,
            coe: allEvents.filter((event) => event.type === "COE").length,
            holiday: allEvents.filter((event) => event.type === "HOLIDAY").length,
        };
    }, [allEvents]);

    const hasActiveAdvancedFilter =
        activeFilter !== "SEMUA" ||
        activePilar !== "SEMUA" ||
        activeJenjang !== "SEMUA" ||
        activeActivityType !== "SEMUA" ||
        searchKeyword.trim();

    const resetFilters = () => {
        setActiveFilter("SEMUA");
        setActivePilar("SEMUA");
        setActiveJenjang("SEMUA");
        setActiveActivityType("SEMUA");
        setSearchKeyword("");
    };

    const getCalendarApi = () => calendarRef.current?.getApi?.();

    const syncCalendarDate = () => {
        const api = getCalendarApi();
        if (!api) return;
        setDisplayDate(api.getDate());
    };

    const handlePrevious = () => {
        const api = getCalendarApi();
        if (!api) return;
        api.prev();
        syncCalendarDate();
    };

    const handleNext = () => {
        const api = getCalendarApi();
        if (!api) return;
        api.next();
        syncCalendarDate();
    };

    const handleToday = () => {
        const api = getCalendarApi();
        const now = new Date();

        if (api) {
            api.today();
            syncCalendarDate();
        }

        setSelectedDateKey(formatDateKey(now));
        setDisplayDate(now);
    };

    const handleChangeView = (mode) => {
        const item = VIEW_MODES.find((row) => row.value === mode);
        const api = getCalendarApi();

        setViewMode(mode);

        if (!api || !item) return;

        api.changeView(item.fullCalendarView);
        syncCalendarDate();
    };

    const handleCalendarDatesSet = (info) => {
        const viewType = info?.view?.type;

        if (viewType === "timeGridDay") setViewMode("DAY");
        if (viewType === "timeGridWeek") setViewMode("WEEK");
        if (viewType === "dayGridMonth") setViewMode("MONTH");

        setDisplayDate(info?.view?.currentStart || info?.start || new Date());
    };

    const handleOpenEvent = (event) => {
        if (event?.path) {
            navigate(event.path);
        }
    };

    const openCreateCOE = () => {
        fetchMentionOptions();
        setEditingCOE(null);
        setCoeForm({
            ...DEFAULT_COE_FORM,
            date: selectedDateKey,
        });
        setShowCOEModal(true);
    };

    const openEditCOE = (event) => {
        fetchMentionOptions();
        setEditingCOE(event);
        setCoeForm({
            title: event.title || "",
            date: event.date || selectedDateKey,
            startTime: event.startTime || "08:00",
            endTime: event.endTime || "09:00",
            location: event.location || "",
            description: event.description || "",
            pilar: normalizePilar(event.pilar || event.raw?.pilar),
            activityType: normalizeActivityType(event.activityType || event.raw?.activity_type),
            meetingLink: event.meetingLink || event.raw?.meeting_link || event.raw?.zoom_link || "",
            jenjang_targets: Array.isArray(event.jenjangTargets)
                ? event.jenjangTargets
                : Array.isArray(event.raw?.jenjang_targets)
                    ? event.raw.jenjang_targets
                    : [],
            participants: normalizeAgendaParticipants(event.raw || event),
        });
        setShowCOEModal(true);
    };

    const buildCOEPayload = () => ({
        title: coeForm.title.trim(),
        agenda_date: coeForm.date,
        start_time: coeForm.startTime || null,
        end_time: coeForm.endTime || null,
        location: coeForm.location.trim() || null,
        description: coeForm.description.trim() || null,
        pilar: coeForm.pilar || null,
        activity_type: coeForm.activityType || null,
        meeting_link: coeForm.meetingLink?.trim() || null,
        jenjang_targets: Array.isArray(coeForm.jenjang_targets)
            ? coeForm.jenjang_targets
            : [],
        visibility_scope: "TARGETED",
        participants: (coeForm.participants || []).map((item) => ({
            participant_type: item.participant_type,
            participant_id: Number(item.participant_id),
        })),
    });

    const handleSaveCOE = async () => {
        if (!canManageCOE) return;

        if (!coeForm.title.trim()) {
            toast.error("Nama COE wajib diisi");
            return;
        }

        if (!coeForm.date) {
            toast.error("Tanggal COE wajib diisi");
            return;
        }

        if (!Array.isArray(coeForm.participants) || coeForm.participants.length === 0) {
            toast.error("Minimal pilih satu peserta COE");
            return;
        }

        if (normalizeActivityType(coeForm.activityType) === "DARING" && !String(coeForm.meetingLink || "").trim()) {
            toast.error("Link Zoom / meeting wajib diisi untuk COE Via Daring");
            return;
        }

        try {
            const headers = getAuthHeaders();
            if (!headers) return;

            const payload = buildCOEPayload();
            const url = editingCOE?.agendaId
                ? `${API_BASE_URL}/admin-agenda/${editingCOE.agendaId}`
                : `${API_BASE_URL}/admin-agenda`;
            const method = editingCOE?.agendaId ? "PATCH" : "POST";

            const response = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(payload),
            });
            const result = await safeJson(response);

            if (!response.ok) {
                throw new Error(result?.message || "Gagal menyimpan COE");
            }

            setSelectedDateKey(payload.agenda_date);
            setDisplayDate(toLocalDate(payload.agenda_date));
            setActiveFilter("COE");
            setActivePilar(payload.pilar || "SEMUA");
            setActiveJenjang("SEMUA");
            setActiveActivityType(payload.activity_type || "SEMUA");
            setSearchKeyword("");
            setShowCOEModal(false);
            setEditingCOE(null);

            toast.success(
                editingCOE?.agendaId
                    ? "COE berhasil diperbarui"
                    : "COE berhasil dibuat",
            );

            await fetchCalendarData();
            window.dispatchEvent(new Event("agenda-notification-refresh"));
        } catch (error) {
            console.error("Gagal simpan COE:", error);
            toast.error(error.message || "Gagal menyimpan COE");
        }
    };

    const handleDoneCOE = async (event) => {
        if (!canManageCOE || !event?.agendaId) return;

        try {
            const headers = getAuthHeaders();
            if (!headers) return;

            const response = await fetch(
                `${API_BASE_URL}/admin-agenda/${event.agendaId}/status`,
                {
                    method: "PATCH",
                    headers,
                    body: JSON.stringify({
                        status: "DONE",
                        status_note: "COE ditandai selesai dari Calendar Monitoring.",
                    }),
                },
            );
            const result = await safeJson(response);

            if (!response.ok) {
                throw new Error(result?.message || "Gagal menyelesaikan COE");
            }

            toast.success("COE ditandai selesai");
            await fetchCalendarData();
        } catch (error) {
            console.error("Gagal selesai COE:", error);
            toast.error(error.message || "Gagal menyelesaikan COE");
        }
    };

    const handleDeleteCOE = async (event) => {
        if (!canManageCOE || !event?.agendaId) return;

        try {
            const headers = getAuthHeaders();
            if (!headers) return;

            const response = await fetch(
                `${API_BASE_URL}/admin-agenda/${event.agendaId}`,
                {
                    method: "DELETE",
                    headers,
                },
            );
            const result = await safeJson(response);

            if (!response.ok) {
                throw new Error(result?.message || "Gagal menghapus COE");
            }

            toast.success("COE berhasil dihapus");
            await fetchCalendarData();
        } catch (error) {
            console.error("Gagal hapus COE:", error);
            toast.error(error.message || "Gagal menghapus COE");
        }
    };

    const selectedProgramAssessmentAll = selectedEvents.filter((event) =>
        ["PROGRAM", "ASSESSMENT"].includes(event.type),
    );
    const selectedCOEAll = selectedEvents.filter((event) => event.type === "COE");
    const selectedHolidayAll = selectedEvents.filter((event) => event.type === "HOLIDAY");
    const selectedProgramAssessmentEvents = selectedProgramAssessmentAll.slice(0, 10);
    const selectedCOEEvents = selectedCOEAll.slice(0, 10);
    const selectedHolidayEvents = selectedHolidayAll.slice(0, 10);
    const tableEvents = useMemo(() => {
        const keyword = tableSearchKeyword.toLowerCase().trim();

        if (!keyword) return selectedEvents;

        return selectedEvents.filter((event) =>
            [
                event.title,
                event.type,
                event.categoryLabel,
                getPilarLabel(event.pilar),
                getEventJenjangLabel(event),
                getActivityTypeLabel(event.activityType),
                event.location,
                event.description,
                getStatusLabel(getEventStatus(event)),
                formatReadableDate(event.date),
            ]
                .join(" ")
                .toLowerCase()
                .includes(keyword),
        );
    }, [selectedEvents, tableSearchKeyword]);
    const tableTotalPages = Math.max(
        1,
        Math.ceil(tableEvents.length / AGENDA_TABLE_PAGE_SIZE),
    );
    const safeTablePage = Math.min(tablePage, tableTotalPages);
    const tableStartIndex = (safeTablePage - 1) * AGENDA_TABLE_PAGE_SIZE;
    const paginatedTableEvents = tableEvents.slice(
        tableStartIndex,
        tableStartIndex + AGENDA_TABLE_PAGE_SIZE,
    );
    const tableFrom = tableEvents.length ? tableStartIndex + 1 : 0;
    const tableTo = Math.min(
        tableStartIndex + paginatedTableEvents.length,
        tableEvents.length,
    );

    useEffect(() => {
        setTablePage(1);
    }, [tableSearchKeyword, activeFilter, activePilar, activeJenjang, activeActivityType, searchKeyword]);

    useEffect(() => {
        if (tablePage > tableTotalPages) {
            setTablePage(tableTotalPages);
        }
    }, [tablePage, tableTotalPages]);

    if (loading) {
        return (
            <PageWrapper className="flex h-screen overflow-hidden bg-white !p-0">
                <Sidebar />
                <main className="flex flex-1 items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-11 w-11 animate-spin rounded-full border-4 border-[#0AC4E0] border-t-transparent" />
                        <p className="text-[10px] font-black uppercase tracking-[0.26em] text-cyan-500/70">
                            Memuat Agenda Calendar...
                        </p>
                    </div>
                </main>
            </PageWrapper>
        );
    }

    return (
        <>
            <style>{`
                html, body {
                    background-color: #F1F5F9;
                    font-family: 'Poppins', sans-serif;
                }

                .agenda-scroll::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }

                .agenda-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }

                .agenda-scroll::-webkit-scrollbar-thumb {
                    background: rgba(10, 196, 224, 0.35);
                    border-radius: 999px;
                }

                .fc {
                    --fc-border-color: #E6EDF3;
                    --fc-today-bg-color: rgba(10, 196, 224, 0.07);
                    --fc-neutral-bg-color: #F8FAFC;
                    --fc-page-bg-color: #FFFFFF;
                    font-family: 'Poppins', sans-serif;
                    color: #334155;
                }

                .fc .fc-scrollgrid {
                    border-radius: 18px;
                    overflow: hidden;
                }

                .fc .fc-daygrid-day-frame {
                    min-height: 62px;
                }

                .fc .fc-col-header-cell {
                    background: #FFFFFF;
                    padding: 7px 0;
                }

                .fc .fc-col-header-cell-cushion {
                    color: #64748B;
                    font-size: 11px;
                    font-weight: 900;
                    letter-spacing: .12em;
                    text-transform: uppercase;
                    text-decoration: none;
                }

                .fc .fc-day-sun .fc-col-header-cell-cushion,
                .fc .fc-red-day .fc-daygrid-day-number {
                    color: #DC2626;
                    font-weight: 900;
                }

                .fc .fc-daygrid-day-number {
                    color: #334155;
                    font-size: 11px;
                    font-weight: 900;
                    padding: 5px 7px;
                    text-decoration: none;
                }

                .fc .fc-day-today .fc-daygrid-day-number {
                    background: #0AC4E0;
                    color: #FFFFFF;
                    border-radius: 999px;
                    margin: 6px;
                    padding: 4px 8px;
                }

                .fc .fc-daygrid-day:hover {
                    background: rgba(10, 196, 224, 0.035);
                }

                .fc .fc-selected-day {
                    background: linear-gradient(180deg, rgba(10,196,224,0.10), rgba(255,255,255,0));
                    box-shadow: inset 0 0 0 2px rgba(10,196,224,0.24);
                }

                .fc .fc-holiday-day {
                    background: #FFE4E6;
                }

                .fc .fc-holiday-day .fc-daygrid-day-number {
                    background: #DC2626;
                    color: #FFFFFF;
                    border-radius: 999px;
                    margin: 4px;
                    padding: 4px 8px;
                }

                .fc .fc-event {
                    border-radius: 9px;
                    border-width: 1px;
                    border-left-width: 3px;
                    cursor: pointer;
                    overflow: hidden;
                    box-shadow: none;
                    margin-bottom: 2px;
                    transition: transform .16s ease, box-shadow .16s ease, filter .16s ease;
                }

                .fc .fc-event:hover {
                    filter: saturate(1.08);
                    transform: translateY(-1px);
                    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.09);
                }

                .fc .fc-event-main {
                    color: inherit;
                }

                .fc .fc-type-program {
                    background: #F0FCFE;
                    border-color: #B8EEF5;
                    border-left-color: #0AC4E0;
                    color: #0F7280;
                }

                .fc .fc-type-fase {
                    background: #EEF2FF;
                    border-color: #C7D2FE;
                    border-left-color: #6366F1;
                    color: #3730A3;
                }

                .fc .fc-pilar-akademik {
                    background: #ECFEFF;
                    border-color: #A5F3FC;
                    border-left-color: #06B6D4;
                    color: #155E75;
                }

                .fc .fc-pilar-karakter {
                    background: #EEF2FF;
                    border-color: #C7D2FE;
                    border-left-color: #6366F1;
                    color: #3730A3;
                }

                .fc .fc-pilar-seni-budaya {
                    background: #FDF4FF;
                    border-color: #F5D0FE;
                    border-left-color: #C026D3;
                    color: #86198F;
                }

                .fc .fc-pilar-kecakapan-hidup {
                    background: #ECFDF5;
                    border-color: #BBF7D0;
                    border-left-color: #10B981;
                    color: #047857;
                }

                .fc .fc-type-assessment {
                    background: #F8FAFC;
                    border-color: #E2E8F0;
                    border-left-color: #64748B;
                    color: #334155;
                }

                .fc .fc-type-coe.fc-status-yang-akan-datang {
                    background: #F8FAFC;
                    border-color: #E2E8F0;
                    border-left-color: #94A3B8;
                    color: #475569;
                }

                .fc .fc-type-coe.fc-status-dalam-proses {
                    background: #FFFBEB;
                    border-color: #FDE68A;
                    border-left-color: #F59E0B;
                    color: #92400E;
                }

                .fc .fc-type-coe.fc-status-selesai {
                    background: #F0FDF4;
                    border-color: #BBF7D0;
                    border-left-color: #22C55E;
                    color: #166534;
                }

                .fc .fc-type-coe.fc-status-overdue,
                .fc .fc-type-coe.fc-status-dibatalkan {
                    background: #FFF1F2;
                    border-color: #FFE4E6;
                    border-left-color: #EF4444;
                    color: #991B1B;
                }

                .fc .fc-type-holiday {
                    background: #FFF1F2;
                    border-color: #FFE4E6;
                    border-left-color: #E11D48;
                    color: #9F1239;
                }

                .fc .fc-more-link {
                    display: inline-flex;
                    margin-top: 2px;
                    border-radius: 999px;
                    background: #E0F7FB;
                    padding: 3px 8px;
                    color: #0891B2;
                    font-size: 9px;
                    font-weight: 900;
                    text-decoration: none;
                }

                .fc .fc-popover {
                    border: 1px solid #E2E8F0;
                    border-radius: 18px;
                    overflow: hidden;
                    box-shadow: 0 24px 70px rgba(15, 23, 42, 0.18);
                }

                .fc .fc-popover-header {
                    background: #F8FAFC;
                    padding: 10px 12px;
                    font-size: 11px;
                    font-weight: 900;
                }
            `}</style>

            <PageWrapper className="flex h-screen overflow-hidden bg-slate-100 !p-0 font-sans text-slate-700">
                <Sidebar />

                <main className="agenda-scroll h-screen flex-1 overflow-y-auto bg-white p-2 sm:p-3 lg:p-4">
                    <div className="flex w-full flex-col gap-4">
                        <section className="flex h-[calc(100vh-2rem)] min-w-0 flex-col overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
                            <div className="relative shrink-0 border-b border-slate-100 bg-white px-5 py-3 sm:px-8 lg:px-10">
                                <div className="grid items-start gap-4 md:grid-cols-[1fr_auto_1fr]">
                                    <AgendaLogoSlot src={AGENDA_LOGO_PATHS.astra} label="Astra" />

                                    <div className="text-center">
                                        <p className="text-[15px] font-black leading-none text-slate-700">
                                            {MONTH_NAMES[displayDate.getMonth()]}
                                        </p>
                                        <p className="mt-1 text-[36px] font-black leading-none text-[#1d2e5c] sm:text-[44px]">
                                            {displayDate.getFullYear()}
                                        </p>
                                        <p className="mt-1 text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">
                                            {formatReadableDate(selectedDateKey)}
                                        </p>
                                    </div>

                                    <AgendaLogoSlot src={AGENDA_LOGO_PATHS.satuIndonesia} label="Satu Indonesia" align="right" />
                                </div>
                            </div>

                            <div className="shrink-0 border-b border-slate-100 bg-white px-4 py-3 sm:px-6 lg:px-8">
                                <div className="flex flex-wrap items-end gap-2">
                                    <div className="mr-auto min-w-[220px]">
                                        <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#0AC4E0]">
                                            Filter Agenda
                                        </p>
                                        <h1 className="mt-1 text-[17px] font-black leading-tight text-slate-900">
                                            {title}
                                        </h1>
                                        <p className="mt-0.5 text-[10px] font-semibold leading-4 text-slate-400">
                                            {bidang ? bidangLabel : scope} · {filteredEvents.length} dari {allEvents.length} agenda
                                        </p>
                                    </div>

                                    <div className="relative h-[58px] min-w-[210px] flex-1">
                                        <span className="mb-1 block text-[8px] font-black uppercase tracking-[0.2em] text-[#0AC4E0]">
                                            Cari
                                        </span>
                                        <Search size={15} className="absolute bottom-3 left-3.5 text-[#0AC4E0]" />
                                        <input
                                            value={searchKeyword}
                                            onChange={(event) => setSearchKeyword(event.target.value)}
                                            placeholder="Cari agenda..."
                                            className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-[11px] font-bold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0AC4E0] focus:ring-1 focus:ring-[#0AC4E0]"
                                        />
                                    </div>

                                    <div className="grid h-[58px] min-w-[230px] grid-cols-[38px_minmax(100px,1fr)_38px] items-end gap-2">
                                        <button
                                            type="button"
                                            onClick={handlePrevious}
                                            className="flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
                                            title="Bulan sebelumnya"
                                        >
                                            <ChevronLeft size={15} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleToday}
                                            className="h-9 rounded-xl bg-[#0AC4E0] px-4 text-[9px] font-black uppercase tracking-wide text-white shadow-sm transition hover:bg-cyan-500"
                                        >
                                            Hari Ini
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleNext}
                                            className="flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
                                            title="Bulan berikutnya"
                                        >
                                            <ChevronRight size={15} />
                                        </button>
                                    </div>

                                    <AgendaFilterSelect
                                        label="Masa"
                                        value={viewMode}
                                        onChange={handleChangeView}
                                        options={VIEW_MODES}
                                        tone="dark"
                                    />

                                    <AgendaFilterSelect
                                        label="Jenis Agenda"
                                        value={activeFilter}
                                        onChange={setActiveFilter}
                                        options={filterOptions}
                                    />

                                    <AgendaFilterSelect
                                        label="Pilar"
                                        value={activePilar}
                                        onChange={setActivePilar}
                                        options={[
                                            { label: "Semua", value: "SEMUA" },
                                            ...allowedPilarOptions,
                                        ]}
                                    />

                                    <AgendaFilterSelect
                                        label="Jenjang"
                                        value={activeJenjang}
                                        onChange={setActiveJenjang}
                                        options={[
                                            { label: "Semua", value: "SEMUA" },
                                            ...allowedJenjangOptions.map((item) => ({
                                                label: item,
                                                value: item,
                                            })),
                                        ]}
                                        tone="dark"
                                    />

                                    {showCOE && (
                                        <AgendaFilterSelect
                                            label="Tipe COE"
                                            value={activeActivityType}
                                            onChange={setActiveActivityType}
                                            options={[
                                                { label: "Semua", value: "SEMUA" },
                                                ...COE_ACTIVITY_TYPES,
                                            ]}
                                            tone="amber"
                                        />
                                    )}

                                    {canManageCOE && (
                                        <button
                                            type="button"
                                            onClick={openCreateCOE}
                                            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[#0AC4E0] px-3 text-[9px] font-black uppercase tracking-wide text-white shadow-sm transition hover:bg-cyan-500 active:scale-95"
                                        >
                                            <Plus size={13} />
                                            Buat COE
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={fetchCalendarData}
                                        disabled={refreshing}
                                        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-cyan-100 bg-cyan-50 px-3 text-[9px] font-black uppercase tracking-wide text-[#0AC4E0] transition hover:bg-cyan-100 disabled:opacity-60"
                                    >
                                        <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
                                        Refresh
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetFilters}
                                        disabled={!hasActiveAdvancedFilter}
                                        className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-[9px] font-black uppercase tracking-wide text-slate-500 transition hover:border-rose-100 hover:bg-rose-50 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>

                            <div className="min-h-0 flex-1 p-2 sm:p-3 lg:p-4">
                                <div className="h-full min-h-0 overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white">
                                    <FullCalendar
                                        ref={calendarRef}
                                        plugins={[
                                            dayGridPlugin,
                                            timeGridPlugin,
                                            interactionPlugin,
                                            listPlugin,
                                        ]}
                                        locale={idLocale}
                                        initialView="dayGridMonth"
                                        firstDay={0}
                                        height="100%"
                                        nowIndicator
                                        selectable
                                        showNonCurrentDates={false}
                                        fixedWeekCount={false}
                                        dayMaxEvents={2}
                                        eventOrder="type,start,title"
                                        moreLinkClick="popover"
                                        headerToolbar={false}
                                        events={fullCalendarEvents}
                                        datesSet={handleCalendarDatesSet}
                                        dateClick={(info) => {
                                            setSelectedDateKey(info.dateStr);
                                        }}
                                        eventClick={(info) => {
                                            const originalEvent = info.event.extendedProps.originalEvent;

                                            if (originalEvent?.date) {
                                                setSelectedDateKey(originalEvent.date);
                                            }

                                            info.jsEvent?.preventDefault?.();
                                        }}
                                        dayCellClassNames={(arg) => {
                                            const dateKey = formatDateKey(arg.date);
                                            const isSunday = arg.date.getDay() === 0;
                                            const isHoliday = holidayDateSet.has(dateKey);
                                            const classes = [];

                                            if (isSunday || isHoliday) classes.push("fc-red-day", "fc-holiday-day");
                                            if (dateKey === selectedDateKey) classes.push("fc-selected-day");

                                            return classes;
                                        }}
                                        eventContent={(arg) => {
                                            const count = arg.event.extendedProps.eventCount || 0;
                                            const isFirstEventOfDate = arg.event.extendedProps.isFirstEventOfDate;

                                            if (!isFirstEventOfDate) return null;

                                            return (
                                                <div
                                                    className="mx-auto my-0.5 inline-flex min-w-7 items-center justify-center rounded-full bg-current px-2 py-1 text-[9px] font-black leading-none"
                                                    title={`${count} agenda`}
                                                    aria-label={`${count} agenda`}
                                                >
                                                    <span className="text-white">{count}</span>
                                                </div>
                                            );
                                        }}
                                    />
                                </div>
                            </div>

                        </section>

                        <section className="rounded-[2rem] border border-slate-100 bg-white p-4 shadow-[0_18px_55px_rgba(15,23,42,0.08)] sm:p-5 lg:p-6">
                            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#0AC4E0]">
                                        Detail Agenda
                                    </p>
                                    <h2 className="mt-1 text-[22px] font-black text-slate-900">
                                        Tabel Agenda Tanggal Terpilih
                                    </h2>
                                    <p className="mt-1 text-[11px] font-semibold text-slate-400">
                                        {formatReadableDate(selectedDateKey)} · menampilkan {tableFrom}-{tableTo} dari {tableEvents.length} agenda.
                                    </p>
                                </div>

                                <div className="relative h-11 w-full lg:w-[420px]">
                                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0AC4E0]" />
                                    <input
                                        value={tableSearchKeyword}
                                        onChange={(event) => setTableSearchKeyword(event.target.value)}
                                        placeholder="Cari di tabel agenda..."
                                        className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-3 text-[12px] font-bold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0AC4E0] focus:ring-1 focus:ring-[#0AC4E0]"
                                    />
                                </div>
                            </div>

                            <div className="agenda-scroll overflow-x-auto rounded-2xl border border-slate-100">
                                <table className="w-full min-w-[1040px] border-collapse text-left">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            {[
                                                "Nama Agenda",
                                                "Tanggal",
                                                "Jenis",
                                                "Pilar",
                                                "Jenjang",
                                                "Waktu",
                                                "Lokasi",
                                                ...(canManageCOE ? ["Action"] : []),
                                            ].map((column) => (
                                                <th
                                                    key={column}
                                                    className="border-b border-slate-100 px-4 py-3 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400"
                                                >
                                                    {column}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedTableEvents.length ? (
                                            paginatedTableEvents.map((event) => {
                                                const isCOE = event.type === "COE";
                                                const isHoliday = event.type === "HOLIDAY";
                                                const status = getEventStatus(event);
                                                const visual = getEventVisual(event);

                                                return (
                                                    <tr key={event.id} className="transition hover:bg-cyan-50/30">
                                                        <td className="border-b border-slate-50 px-4 py-3 align-top">
                                                            <p className="max-w-[280px] text-[12px] font-black leading-5 text-slate-800">
                                                                {event.title}
                                                            </p>
                                                            {event.description && (
                                                                <p className="mt-1 line-clamp-2 max-w-[280px] text-[10px] font-semibold leading-4 text-slate-400">
                                                                    {event.description}
                                                                </p>
                                                            )}
                                                        </td>
                                                        <td className="border-b border-slate-50 px-4 py-3 align-top text-[11px] font-black text-slate-800">
                                                            {formatReadableDate(event.date)}
                                                        </td>
                                                        <td className="border-b border-slate-50 px-4 py-3 align-top">
                                                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-widest ${visual.badge}`}>
                                                                {visual.label}
                                                            </span>
                                                        </td>
                                                        <td className="border-b border-slate-50 px-4 py-3 align-top text-[11px] font-bold text-slate-600">
                                                            {isHoliday ? "-" : getPilarLabel(event.pilar)}
                                                        </td>
                                                        <td className="border-b border-slate-50 px-4 py-3 align-top text-[11px] font-bold text-slate-600">
                                                            {isHoliday ? "-" : getEventJenjangLabel(event)}
                                                        </td>
                                                        <td className="border-b border-slate-50 px-4 py-3 align-top text-[11px] font-bold text-slate-600">
                                                            {event.startTime || event.endTime
                                                                ? `${event.startTime || "00:00"}${event.endTime ? ` - ${event.endTime}` : ""}`
                                                                : "Sepanjang hari"}
                                                            {isCOE && (
                                                                <span className="mt-1 block text-[10px] font-black uppercase tracking-wide text-amber-600">
                                                                    {getActivityTypeLabel(event.activityType)}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="border-b border-slate-50 px-4 py-3 align-top text-[11px] font-bold text-slate-600">
                                                            {event.location || "-"}
                                                            {isCOE && event.meetingLink && (
                                                                <a
                                                                    href={normalizeExternalUrl(event.meetingLink)}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="mt-1 block text-[10px] font-black text-[#0AC4E0] underline underline-offset-2"
                                                                >
                                                                    Buka meeting
                                                                </a>
                                                            )}
                                                        </td>
                                                        {canManageCOE && (
                                                            <td className="border-b border-slate-50 px-4 py-3 align-top">
                                                                <div className="flex flex-wrap gap-2">
                                                                    {event.path && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleOpenEvent(event)}
                                                                            className="rounded-lg bg-[#0AC4E0] px-3 py-2 text-[9px] font-black uppercase tracking-wide text-white"
                                                                        >
                                                                            Detail
                                                                        </button>
                                                                    )}
                                                                    {isCOE && (
                                                                    <>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => openEditCOE(event)}
                                                                            className="rounded-lg bg-amber-50 px-3 py-2 text-[9px] font-black uppercase tracking-wide text-amber-600"
                                                                        >
                                                                            Edit
                                                                        </button>
                                                                        {!["SELESAI", "DIBATALKAN"].includes(status) && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleDoneCOE(event)}
                                                                                className="rounded-lg bg-emerald-50 px-3 py-2 text-[9px] font-black uppercase tracking-wide text-emerald-600"
                                                                            >
                                                                                Selesai
                                                                            </button>
                                                                        )}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleDeleteCOE(event)}
                                                                            className="rounded-lg bg-rose-50 px-3 py-2 text-[9px] font-black uppercase tracking-wide text-rose-600"
                                                                        >
                                                                            Hapus
                                                                        </button>
                                                                    </>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        )}
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={canManageCOE ? 8 : 7} className="px-4 py-12 text-center">
                                                    <p className="text-[12px] font-black text-slate-700">
                                                        Agenda tidak ditemukan
                                                    </p>
                                                    <p className="mt-1 text-[11px] font-semibold text-slate-400">
                                                        Ubah filter kalender atau kata kunci pencarian tabel.
                                                    </p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                                    Halaman {safeTablePage} dari {tableTotalPages} · Maksimal {AGENDA_TABLE_PAGE_SIZE} data per halaman
                                </p>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setTablePage((page) => Math.max(1, page - 1))}
                                        disabled={safeTablePage <= 1}
                                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[10px] font-black uppercase tracking-wide text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <ChevronLeft size={14} />
                                        Prev
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTablePage((page) => Math.min(tableTotalPages, page + 1))}
                                        disabled={safeTablePage >= tableTotalPages}
                                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0AC4E0] px-4 text-[10px] font-black uppercase tracking-wide text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Next
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                </main>
            </PageWrapper>

            {canManageCOE && (
                <COEFormModal
                    open={showCOEModal}
                    mode={editingCOE ? "edit" : "create"}
                    formData={coeForm}
                    setFormData={setCoeForm}
                    onClose={() => {
                        setShowCOEModal(false);
                        setEditingCOE(null);
                    }}
                    onSubmit={handleSaveCOE}
                    mentionOptions={mentionOptions}
                    mentionLoading={mentionLoading}
                    pilarOptions={allowedPilarOptions}
                    jenjangOptions={allowedJenjangOptions}
                />
            )}
        </>
    );
}

