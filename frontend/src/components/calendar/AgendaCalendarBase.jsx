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

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

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
    participants: [],
};

const DEFAULT_TYPE_VISIBILITY = {
    showProgram: true,
    showFase: true,
    showAssessment: true,
    showCOE: true,
    showHoliday: true,
};

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
    const targetYears = [displayYear - 1, displayYear, displayYear + 1];

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

function SummaryCard({ label, value, helper, icon }) {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
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

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-[#0AC4E0]">
                    {icon}
                </div>
            </div>
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

function COEFormModal({
    open,
    mode,
    formData,
    setFormData,
    onClose,
    onSubmit,
    mentionOptions = [],
    mentionLoading = false,
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
    const [searchKeyword, setSearchKeyword] = useState("");

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

    const filterOptions = useMemo(() => {
        const rows = [{ label: "Semua", value: "SEMUA" }];

        if (showProgram) rows.push({ label: "Program", value: "PROGRAM" });
        if (showProgram && showFase) rows.push({ label: "Fase", value: "FASE" });
        if (showAssessment) rows.push({ label: "Assessment", value: "ASSESSMENT" });
        if (showCOE) rows.push({ label: "COE", value: "COE" });
        if (showHoliday) rows.push({ label: "Tanggal Merah", value: "HOLIDAY" });

        return rows;
    }, [showProgram, showFase, showAssessment, showCOE, showHoliday]);

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
        if (canManageCOE) fetchMentionOptions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canManageCOE]);

    const programEvents = useMemo(() => {
        if (!showProgram) return [];

        return mapProgramsToEvents(programs, {
            lockedBidang: bidang,
            showFase,
            roleScope: scope,
            buildProgramPath,
        });
    }, [programs, bidang, showProgram, showFase, scope, buildProgramPath]);

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

            const matchSearch = [
                event.title,
                event.type,
                event.categoryLabel,
                event.phase,
                event.description,
                event.location,
                getStatusLabel(getEventStatus(event)),
            ]
                .join(" ")
                .toLowerCase()
                .includes(keyword);

            return matchFilter && matchSearch;
        });
    }, [allEvents, activeFilter, searchKeyword]);

    const eventMap = useMemo(() => {
        return filteredEvents.reduce((result, event) => {
            if (!result[event.date]) result[event.date] = [];
            result[event.date].push(event);
            return result;
        }, {});
    }, [filteredEvents]);

    const fullCalendarEvents = useMemo(() => {
        return filteredEvents.map((event) => {
            const status = getEventStatus(event);
            const start = event.startTime
                ? `${event.date}T${event.startTime}:00`
                : event.date;
            const end = event.endTime
                ? `${event.date}T${event.endTime}:00`
                : undefined;

            return {
                id: event.id,
                title: event.title,
                start,
                end,
                allDay: !event.startTime,
                classNames: [
                    `fc-type-${String(event.type).toLowerCase()}`,
                    `fc-status-${String(status).toLowerCase().replaceAll("_", "-")}`,
                ],
                extendedProps: {
                    originalEvent: event,
                    type: event.type,
                    status,
                    categoryLabel: event.categoryLabel,
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
                    border-radius: 14px;
                    overflow: hidden;
                }

                .fc .fc-col-header-cell {
                    background: #F8FAFC;
                    padding: 11px 0;
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
                    color: #E11D48;
                    font-weight: 900;
                }

                .fc .fc-daygrid-day-number {
                    color: #334155;
                    font-size: 12px;
                    font-weight: 900;
                    padding: 10px;
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

                .fc .fc-event {
                    border-radius: 10px;
                    border-width: 1px;
                    border-left-width: 4px;
                    cursor: pointer;
                    overflow: hidden;
                    box-shadow: none;
                    margin-bottom: 3px;
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
                    color: #0891B2;
                    font-size: 10px;
                    font-weight: 900;
                }
            `}</style>

            <PageWrapper className="flex h-screen overflow-hidden bg-slate-100 !p-0 font-sans text-slate-700">
                <Sidebar />

                <main className="agenda-scroll h-screen flex-1 overflow-y-auto p-6">
                    <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-5">
                        <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
                            <header className="flex flex-col gap-5 border-b border-slate-100 px-6 py-5 xl:flex-row xl:items-center xl:justify-between">
                                <div className="flex min-w-0 items-start gap-4">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0AC4E0] text-white shadow-sm">
                                        <CalendarDays size={24} />
                                    </div>

                                    <div className="min-w-0">
                                        <div className="mb-2 flex flex-wrap gap-2">
                                            <span className="rounded-full bg-cyan-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#0AC4E0]">
                                                Agenda Calendar
                                            </span>

                                            {bidang && (
                                                <span className="rounded-full bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                                    {bidangLabel}
                                                </span>
                                            )}

                                            <span className="rounded-full bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                                {scope}
                                            </span>
                                        </div>

                                        <h1 className="text-[24px] font-black tracking-tight text-slate-800">
                                            {title}
                                        </h1>

                                        <p className="mt-1 max-w-2xl text-[12px] font-semibold leading-5 text-slate-400">
                                            {subtitle}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                                    <div className="relative flex h-10 min-w-[300px] items-center">
                                        <Search
                                            size={15}
                                            className="absolute left-3.5 text-[#0AC4E0]"
                                        />

                                        <input
                                            value={searchKeyword}
                                            onChange={(event) =>
                                                setSearchKeyword(event.target.value)
                                            }
                                            placeholder="Cari agenda..."
                                            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-[12px] font-bold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0AC4E0] focus:ring-1 focus:ring-[#0AC4E0]"
                                        />
                                    </div>

                                    {canManageCOE && (
                                        <button
                                            type="button"
                                            onClick={openCreateCOE}
                                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-cyan-100 bg-cyan-50 px-4 text-[10px] font-black uppercase tracking-wide text-[#0AC4E0] transition hover:bg-cyan-100 active:scale-95"
                                        >
                                            <Plus size={14} />
                                            Add COE
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={fetchCalendarData}
                                        disabled={refreshing}
                                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0AC4E0] px-4 text-[10px] font-black uppercase tracking-wide text-white shadow-sm transition hover:bg-cyan-500 active:scale-95 disabled:opacity-60"
                                    >
                                        <RefreshCw
                                            size={14}
                                            className={refreshing ? "animate-spin" : ""}
                                        />
                                        Refresh
                                    </button>
                                </div>
                            </header>

                            <section className="grid grid-cols-1 gap-4 bg-slate-50/50 p-5 sm:grid-cols-2 xl:grid-cols-5">
                                {showProgram && (
                                    <SummaryCard
                                        label="Program"
                                        value={stats.program}
                                        helper="Program utama"
                                        icon={<Layers3 size={18} />}
                                    />
                                )}

                                {showProgram && showFase && (
                                    <SummaryCard
                                        label="Fase"
                                        value={stats.fase}
                                        helper="Fase program"
                                        icon={<Sparkles size={18} />}
                                    />
                                )}

                                {showAssessment && (
                                    <SummaryCard
                                        label="Assessment"
                                        value={stats.assessment}
                                        helper="Agenda assessment"
                                        icon={<FileCheck2 size={18} />}
                                    />
                                )}

                                {showCOE && (
                                    <SummaryCard
                                        label="COE"
                                        value={stats.coe}
                                        helper={canManageCOE ? "Kelola admin" : "Dari admin"}
                                        icon={<CalendarDays size={18} />}
                                    />
                                )}

                                {showHoliday && (
                                    <SummaryCard
                                        label="Tanggal Merah"
                                        value={stats.holiday}
                                        helper="Hari besar nasional"
                                        icon={<Flag size={18} />}
                                    />
                                )}
                            </section>

                            <section className="border-t border-slate-100 px-6 py-4">
                                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {filterOptions.map((item) => (
                                            <button
                                                key={item.value}
                                                type="button"
                                                onClick={() => setActiveFilter(item.value)}
                                                className={`rounded-xl border px-4 py-2 text-[10px] font-black uppercase tracking-wide transition ${activeFilter === item.value
                                                    ? "border-[#0AC4E0] bg-[#0AC4E0] text-white"
                                                    : "border-slate-200 bg-white text-slate-500 hover:border-cyan-200 hover:bg-cyan-50 hover:text-[#0AC4E0]"
                                                    }`}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={handlePrevious}
                                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleToday}
                                            className="h-9 rounded-xl border border-slate-200 bg-white px-4 text-[10px] font-black uppercase tracking-wide text-slate-500 hover:bg-slate-50"
                                        >
                                            Today
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleNext}
                                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                                        >
                                            <ChevronRight size={16} />
                                        </button>

                                        <div className="ml-0 flex rounded-xl border border-slate-200 bg-white p-1 xl:ml-3">
                                            {VIEW_MODES.map((item) => (
                                                <button
                                                    key={item.value}
                                                    type="button"
                                                    onClick={() => handleChangeView(item.value)}
                                                    className={`h-8 rounded-lg px-4 text-[10px] font-black uppercase tracking-wide transition ${viewMode === item.value
                                                        ? "bg-[#0AC4E0] text-white"
                                                        : "text-slate-500 hover:bg-cyan-50 hover:text-[#0AC4E0]"
                                                        }`}
                                                >
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="px-6 py-5">
                                <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                        <h2 className="text-[18px] font-black text-slate-800">
                                            {MONTH_NAMES[displayDate.getMonth()]}{" "}
                                            {displayDate.getFullYear()}
                                        </h2>

                                        <p className="mt-1 text-[11px] font-bold text-slate-400">
                                            Pilih tanggal untuk membaca detail event di sisi kanan.
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-slate-500">
                                        {showProgram && (
                                            <span className="flex items-center gap-2">
                                                <span className="h-2.5 w-2.5 rounded-full bg-[#0AC4E0]" />
                                                Program
                                            </span>
                                        )}

                                        {showProgram && showFase && (
                                            <span className="flex items-center gap-2">
                                                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                                                Fase
                                            </span>
                                        )}

                                        {showAssessment && (
                                            <span className="flex items-center gap-2">
                                                <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
                                                Assessment
                                            </span>
                                        )}

                                        {showCOE && (
                                            <span className="flex items-center gap-2">
                                                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                                                COE
                                            </span>
                                        )}

                                        {showHoliday && (
                                            <span className="flex items-center gap-2">
                                                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                                                Tanggal Merah
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_380px]">
                                    <div className="min-w-0">
                                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4">
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
                                                firstDay={1}
                                                height="auto"
                                                nowIndicator
                                                selectable
                                                dayMaxEvents={4}
                                                moreLinkClick="popover"
                                                headerToolbar={false}
                                                events={fullCalendarEvents}
                                                datesSet={handleCalendarDatesSet}
                                                dateClick={(info) => {
                                                    setSelectedDateKey(info.dateStr);
                                                }}
                                                eventClick={(info) => {
                                                    const originalEvent =
                                                        info.event.extendedProps.originalEvent;

                                                    if (originalEvent?.date) {
                                                        setSelectedDateKey(originalEvent.date);
                                                    }

                                                    info.jsEvent?.preventDefault?.();
                                                }}
                                                dayCellClassNames={(arg) => {
                                                    const dateKey = formatDateKey(arg.date);
                                                    const isSunday = arg.date.getDay() === 0;
                                                    const isHoliday = holidayDateSet.has(dateKey);

                                                    return isSunday || isHoliday
                                                        ? ["fc-red-day"]
                                                        : [];
                                                }}
                                                eventContent={(arg) => {
                                                    const originalEvent =
                                                        arg.event.extendedProps.originalEvent;
                                                    const status =
                                                        arg.event.extendedProps.status;
                                                    const type = arg.event.extendedProps.type;
                                                    const label =
                                                        type === "COE" || type === "HOLIDAY"
                                                            ? getStatusLabel(status)
                                                            : originalEvent?.categoryLabel || type;

                                                    return (
                                                        <div className="min-w-0 px-2 py-1">
                                                            <div className="truncate text-[8px] font-black uppercase tracking-wider opacity-70">
                                                                {label}
                                                            </div>
                                                            <div className="mt-0.5 truncate text-[10px] font-black leading-4">
                                                                {arg.event.title}
                                                            </div>
                                                        </div>
                                                    );
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <aside className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                                            <div>
                                                <h3 className="text-[15px] font-black text-slate-800">
                                                    Detail Tanggal
                                                </h3>
                                                <p className="mt-0.5 text-[10px] font-bold text-slate-400">
                                                    {formatReadableDate(selectedDateKey)}
                                                </p>
                                            </div>

                                            <span className="rounded-full bg-cyan-50 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-[#0AC4E0]">
                                                {selectedEvents.length} event
                                            </span>
                                        </div>

                                        <div className="agenda-scroll max-h-[650px] overflow-y-auto p-5 pr-3">
                                            <EventList
                                                events={selectedEvents}
                                                onOpen={handleOpenEvent}
                                                canManageCOE={canManageCOE}
                                                onEditCOE={openEditCOE}
                                                onDoneCOE={handleDoneCOE}
                                                onDeleteCOE={handleDeleteCOE}
                                            />
                                        </div>
                                    </aside>
                                </div>
                            </section>
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
                />
            )}
        </>
    );
}

