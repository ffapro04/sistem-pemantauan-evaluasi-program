/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { getAuthToken } from "../../utils/authSession";
import {
    AlertCircle,
    BarChart3,
    BookOpenCheck,
    CalendarDays,
    CheckCircle2,
    ClipboardCheck,
    ClipboardList,
    GraduationCap,
    Loader2,
    MapPin,
    RefreshCcw,
    School,
    ShieldCheck,
    Sparkles,
    Target,
    UserRoundCheck,
    UsersRound,
} from "lucide-react";
import { Cell, Pie, PieChart, Tooltip as RechartsTooltip } from "recharts";
import MasterPageShell from "../masterCrud/MasterPageShell";
import Dropdown from "../Dropdown";
import SafeResponsiveContainer from "../charts/SafeResponsiveContainer";
import { CHART_PALETTE, CHART_STATUS_COLORS } from "../../utils/chartPalette";
import { notify } from "../../utils/popup";

import { API_BASE_URL } from "../../config/apiBase.js";

const PROGRAM_STAGES = [
    "Approval",
    "Sosialisasi",
    "Implementasi",
    "Evaluasi",
    "Selesai",
];

const PILLARS = [
    "Akademik",
    "Karakter",
    "Seni Budaya",
    "Kecakapan Hidup",
];

const PIE_COLORS = [
    CHART_STATUS_COLORS.info,
    CHART_STATUS_COLORS.warning,
    CHART_STATUS_COLORS.orange,
    CHART_STATUS_COLORS.purple,
    CHART_STATUS_COLORS.success,
    CHART_STATUS_COLORS.danger,
    ...CHART_PALETTE,
];

const normalizeArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.rows)) return payload.rows;
    if (Array.isArray(payload?.result)) return payload.result;
    if (Array.isArray(payload?.results)) return payload.results;
    return [];
};

const normalizeText = (value) =>
    String(value || "")
        .trim()
        .toUpperCase()
        .replaceAll("-", "_")
        .replaceAll(" ", "_");

const getTokenPayload = () => {
    const token = getAuthToken();
    if (!token) return null;

    try {
        return jwtDecode(token);
    } catch {
        return null;
    }
};

const getSchoolId = (user = {}) =>
    user?.id_sekolah ||
    user?.sekolah_id ||
    user?.school_id ||
    user?.user?.id_sekolah ||
    user?.operator?.id_sekolah ||
    user?.kepala_sekolah?.id_sekolah ||
    user?.guru?.id_sekolah ||
    user?.sekolah?.id_sekolah ||
    user?.sekolah?.id ||
    user?.school?.id_sekolah ||
    user?.school?.id ||
    null;

const getUserId = (user = {}) =>
    user?.id_user || user?.sub || user?.id || user?.user?.id_user || "";

const getProgramYear = (program = {}) =>
    String(
        program?.tahun ||
        program?.year ||
        program?.tanggal_mulai?.slice?.(0, 4) ||
        program?.start_date?.slice?.(0, 4) ||
        "",
    );

const getAssessmentYear = (assessment = {}) => {
    const explicit = assessment?.tahun || assessment?.year;
    if (explicit) return String(explicit);

    const date = new Date(
        assessment?.sent_at ||
        assessment?.created_at ||
        assessment?.createdAt ||
        assessment?.tanggal_kirim ||
        "",
    );

    return Number.isNaN(date.getTime()) ? "" : String(date.getFullYear());
};

const getProgramStage = (program = {}) => {
    const raw = normalizeText(
        program?.status_program || program?.status || program?.tahap || "",
    );

    if (raw.includes("SELESAI") || raw.includes("DONE") || raw.includes("COMPLETED")) {
        return "Selesai";
    }
    if (raw.includes("EVALUASI")) return "Evaluasi";
    if (raw.includes("IMPLEMENTASI")) return "Implementasi";
    if (raw.includes("SOSIALISASI")) return "Sosialisasi";
    return "Approval";
};

const getProgramPillar = (program = {}) => {
    const raw = normalizeText(
        program?.pilar_program ||
        program?.sub_kategori ||
        program?.kategori_program ||
        program?.jenis_program ||
        program?.kategori ||
        "",
    );

    if (raw.includes("KARAKTER")) return "Karakter";
    if (raw.includes("SENI") || raw.includes("BUDAYA")) return "Seni Budaya";
    if (raw.includes("KECAKAPAN") || raw.includes("HIDUP")) {
        return "Kecakapan Hidup";
    }
    return "Akademik";
};

const getAssessmentStatus = (assessment = {}) => {
    const raw = normalizeText(
        assessment?.status_display || assessment?.status || assessment?.status_pengisian || "",
    );

    if (
        assessment?.sudah_diisi ||
        raw.includes("TERKIRIM") ||
        raw.includes("SELESAI") ||
        raw.includes("SENT") ||
        raw.includes("DONE")
    ) {
        return "Terkirim";
    }

    if (
        raw.includes("PROSES") ||
        raw.includes("DRAFT") ||
        raw.includes("SIAP_DIAJUKAN") ||
        assessment?.jumlah_jawaban > 0
    ) {
        return "Dalam Proses";
    }

    return "Belum Diisi";
};

const getAssessmentFilled = (assessment = {}) =>
    Number(
        assessment?.jumlah_pengisi ||
        assessment?.total_responden ||
        assessment?.total_pengisi ||
        assessment?.filled ||
        0,
    );

const buildRows = (items, getter, preferredOrder = []) => {
    const counter = new Map();

    items.forEach((item) => {
        const key = getter(item);
        if (!key) return;
        counter.set(key, (counter.get(key) || 0) + 1);
    });

    const orderedKeys = [
        ...preferredOrder.filter((key) => counter.has(key)),
        ...[...counter.keys()].filter((key) => !preferredOrder.includes(key)),
    ];

    return orderedKeys.map((name, index) => ({
        name,
        value: Number(counter.get(name) || 0),
        color: PIE_COLORS[index % PIE_COLORS.length],
    }));
};

const formatPercent = (value) => `${Math.max(0, Math.min(100, Math.round(value || 0)))}%`;

function MetricStrip({ items }) {
    return (
        <section className="overflow-hidden rounded-[1.55rem] border border-slate-100 bg-white shadow-[0_16px_42px_rgba(15,23,42,0.05)]">
            <div className="grid sm:grid-cols-2 xl:grid-cols-4">
                {items.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <article
                            key={item.label}
                            className={`relative min-w-0 p-4 ${index > 0 ? "border-t border-slate-100 sm:border-t-0 sm:border-l" : ""} ${index === 2 ? "sm:border-l-0 xl:border-l" : ""}`}
                        >
                            <span
                                className="absolute inset-x-0 top-0 h-1"
                                style={{ backgroundColor: item.color }}
                            />
                            <div className="flex items-start justify-between gap-3 pt-1">
                                <div className="min-w-0">
                                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                                        {item.label}
                                    </p>
                                    <p className="mt-2 text-3xl font-black leading-none tracking-[-0.045em] text-slate-950">
                                        {item.value}
                                    </p>
                                    <p className="mt-1.5 text-[11px] font-semibold leading-5 text-slate-400">
                                        {item.helper}
                                    </p>
                                </div>
                                <div
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
                                    style={{ backgroundColor: `${item.color}16`, color: item.color }}
                                >
                                    <Icon size={19} />
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

function EmptyPie({ message }) {
    return (
        <div className="flex h-[250px] items-center justify-center rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50/70 px-5 text-center">
            <div>
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm">
                    <BarChart3 size={20} />
                </div>
                <p className="mt-3 text-xs font-black text-slate-500">Belum ada data</p>
                <p className="mt-1 text-[11px] font-semibold leading-5 text-slate-400">{message}</p>
            </div>
        </div>
    );
}

function SolidPieCard({ eyebrow, title, subtitle, rows, totalLabel = "Total Data" }) {
    const total = rows.reduce((sum, row) => sum + Number(row.value || 0), 0);

    return (
        <section className="rounded-[1.7rem] border border-slate-100 bg-white p-4 shadow-[0_16px_42px_rgba(15,23,42,0.05)]">
            <div className="border-b border-slate-100 pb-3">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#0AC4E0]">
                    {eyebrow}
                </p>
                <h2 className="mt-1 text-xl font-black tracking-[-0.035em] text-slate-950">
                    {title}
                </h2>
                <p className="mt-1 text-[11px] font-semibold leading-5 text-slate-400">
                    {subtitle}
                </p>
            </div>

            {total === 0 ? (
                <div className="pt-4">
                    <EmptyPie message="Data belum tersedia untuk filter yang dipilih." />
                </div>
            ) : (
                <div className="grid items-center gap-3 pt-3 sm:grid-cols-[minmax(220px,0.9fr)_minmax(220px,1.1fr)]">
                    <div className="min-w-0">
                        <SafeResponsiveContainer width="100%" height={220} minHeight={220} minWidth={220}>
                            <PieChart>
                                <Pie
                                    data={rows}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={0}
                                    outerRadius={86}
                                    startAngle={90}
                                    endAngle={-270}
                                    paddingAngle={rows.length > 1 ? 2 : 0}
                                    stroke="#FFFFFF"
                                    strokeWidth={3}
                                    isAnimationActive={false}
                                >
                                    {rows.map((row) => (
                                        <Cell key={row.name} fill={row.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    formatter={(value, _name, payload) => [
                                        `${value} data`,
                                        payload?.payload?.name || "Data",
                                    ]}
                                />
                            </PieChart>
                        </SafeResponsiveContainer>

                        <div className="mx-auto -mt-1 flex max-w-[190px] items-center justify-between gap-2 rounded-2xl border border-cyan-100 bg-cyan-50/70 px-4 py-2.5">
                            <span className="min-w-0 flex-1 truncate text-[9px] font-black uppercase tracking-[0.14em] text-[#0AC4E0]">
                                {totalLabel}
                            </span>
                            <span className="shrink-0 text-lg font-black text-slate-950">{total}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {rows.map((row) => {
                            const percentage = total ? (row.value / total) * 100 : 0;
                            return (
                                <div
                                    key={row.name}
                                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5"
                                >
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        <span
                                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                                            style={{ backgroundColor: row.color }}
                                        />
                                        <span className="min-w-0 break-words text-[11px] font-black leading-4 text-slate-700">
                                            {row.name}
                                        </span>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <p className="text-sm font-black text-slate-950">{row.value}</p>
                                        <p className="text-[9px] font-bold text-slate-400">
                                            {formatPercent(percentage)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </section>
    );
}

function SchoolSnapshot({ sekolah, gurus, roleMode, onEditStudents, editingStudents }) {
    const kabupaten =
        sekolah?.nama_kabupaten ||
        sekolah?.wilayah?.nama_wilayah ||
        sekolah?.nama_wilayah ||
        "Belum tersedia";
    const provinsi =
        sekolah?.wilayah?.parent?.nama_wilayah ||
        sekolah?.nama_provinsi ||
        sekolah?.provinsi?.nama_wilayah ||
        "Belum tersedia";

    const rows = [
        ["NPSN", sekolah?.npsn || "-"],
        ["Jenjang", sekolah?.jenjang || "-"],
        ["Akreditasi", sekolah?.akreditasi || "-"],
        ["Kabupaten/Kota", kabupaten],
        ["Provinsi", provinsi],
        ["Guru Assessment", `${gurus.length} guru`],
    ];

    return (
        <section className="rounded-[1.55rem] border border-slate-100 bg-white p-4 shadow-[0_14px_36px_rgba(15,23,42,0.04)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#0AC4E0]">
                        Ringkasan Sekolah
                    </p>
                    <h3 className="mt-1 text-lg font-black text-slate-950">
                        Identitas dan kapasitas sekolah
                    </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-50 px-3 py-2 text-[10px] font-black text-slate-600">
                        {Number(sekolah?.jumlah_siswa || 0)} siswa
                    </span>
                    {roleMode === "operator" && (
                        <button
                            type="button"
                            onClick={onEditStudents}
                            className="rounded-full bg-cyan-50 px-3 py-2 text-[10px] font-black text-[#0AC4E0] transition hover:bg-cyan-100"
                        >
                            {editingStudents ? "Tutup Edit" : "Ubah Jumlah Siswa"}
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
                {rows.map(([label, value]) => (
                    <div key={label} className="min-w-0 rounded-2xl bg-slate-50 px-3.5 py-3">
                        <p className="text-[8px] font-black uppercase tracking-[0.14em] text-slate-400">
                            {label}
                        </p>
                        <p className="mt-1 break-words text-[11px] font-black leading-5 text-slate-800">
                            {value}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}

function StudentEditor({ value, onChange, onSave, onCancel, saving }) {
    return (
        <div className="flex flex-col gap-3 rounded-[1.35rem] border border-cyan-100 bg-cyan-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <p className="text-xs font-black text-slate-900">Perbarui jumlah siswa</p>
                <p className="mt-1 text-[11px] font-semibold text-slate-500">
                    Nilai ini digunakan pada ringkasan dashboard sekolah.
                </p>
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    min="0"
                    value={value}
                    disabled={saving}
                    onChange={(event) => onChange(event.target.value)}
                    className="h-10 w-28 rounded-xl border border-cyan-100 bg-white px-3 text-sm font-black text-slate-800 outline-none focus:border-[#0AC4E0]"
                />
                <button
                    type="button"
                    onClick={onSave}
                    disabled={saving}
                    className="h-10 rounded-xl bg-[#0AC4E0] px-4 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-60"
                >
                    Simpan
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={saving}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-[10px] font-black uppercase tracking-widest text-slate-500"
                >
                    Batal
                </button>
            </div>
        </div>
    );
}

function RoleActions({ roleMode }) {
    if (roleMode === "kepala") {
        return (
            <section className="flex flex-col gap-3 rounded-[1.55rem] border border-slate-100 bg-slate-950 p-4 text-white sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-300">
                        Fokus Monitoring
                    </p>
                    <p className="mt-1 text-sm font-black">
                        Pastikan program berjalan dan partisipasi Guru Assessment tetap terpantau.
                    </p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white">
                    <ShieldCheck size={14} />
                    Ringkasan Sekolah
                </span>
            </section>
        );
    }

    const actions =
        roleMode === "guru"
            ? [
                ["Assessment", "/sekolah/assessment", ClipboardCheck],
                ["Program", "/sekolah/program", Target],
                ["Agenda", "/sekolah/agenda", CalendarDays],
            ]
            : [
                ["Program", "/sekolah/program", Target],
                ["Assessment", "/sekolah/assessment", ClipboardList],
                ["Data Guru", "/sekolah/guru", GraduationCap],
            ];

    return (
        <section className="flex flex-col gap-3 rounded-[1.55rem] border border-slate-100 bg-slate-950 p-4 text-white sm:flex-row sm:items-center sm:justify-between">
            <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-300">
                    Akses Cepat
                </p>
                <p className="mt-1 text-sm font-black">Lanjutkan ke menu yang paling sering digunakan.</p>
            </div>
            <div className="flex flex-wrap gap-2">
                {actions.map(([label, to, Icon]) => (
                    <Link
                        key={label}
                        to={to}
                        className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-[#0AC4E0]"
                    >
                        <Icon size={14} />
                        {label}
                    </Link>
                ))}
            </div>
        </section>
    );
}


function HeadSchoolExecutiveView({
    user,
    sekolah,
    metrics,
    loading,
    onRefresh,
    chartMode,
    onChartModeChange,
    chartRows,
    chartMeta,
    gurus,
    programCount,
    activePrograms,
    completedPrograms,
    assessmentCount,
    participationRate,
}) {
    const total = chartRows.reduce((sum, row) => sum + Number(row.value || 0), 0);
    const topRow = [...chartRows].sort(
        (a, b) => Number(b.value || 0) - Number(a.value || 0),
    )[0];
    const topShare = total && topRow ? Math.round((Number(topRow.value || 0) / total) * 100) : 0;

    const controls = [
        {
            value: "PROGRAM",
            label: "Tahapan",
            helper: "Posisi program",
            icon: Target,
            count: 5,
        },
        {
            value: "PILLAR",
            label: "Pilar",
            helper: "Komposisi program",
            icon: Sparkles,
            count: 4,
        },
        {
            value: "ASSESSMENT",
            label: "Assessment",
            helper: "Status pengisian",
            icon: ClipboardList,
            count: 3,
        },
        {
            value: "PARTICIPATION",
            label: "Partisipasi",
            helper: "Respons guru",
            icon: UserRoundCheck,
            count: 2,
        },
    ];

    const schoolProfile = [
        ["NPSN", sekolah?.npsn || "-"],
        ["Jenjang", sekolah?.jenjang || "-"],
        ["Akreditasi", sekolah?.akreditasi || "-"],
        ["Siswa", Number(sekolah?.jumlah_siswa || 0)],
        ["Guru Assessment", gurus.length],
        [
            "Kabupaten/Kota",
            sekolah?.nama_kabupaten || sekolah?.wilayah?.nama_wilayah || "-",
        ],
    ];

    return (
        <MasterPageShell
            title="Dashboard"
            highlight="Kepala Sekolah"
            subtitle="Ringkasan strategis program dan assessment sekolah."
            contentClassName="bg-[#EEF5FF]"
        >
            <div className="h-full overflow-y-auto bg-[#EEF5FF] p-3 text-slate-900 no-scrollbar lg:overflow-hidden md:p-4">
                <div className="flex min-h-full flex-col gap-3 lg:h-full lg:min-h-0">
                    <section className="relative shrink-0 overflow-hidden rounded-[1.7rem] border border-slate-100 bg-white px-4 py-3.5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
                        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#0AC4E0]/12 blur-3xl" />
                        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-center gap-3.5">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-[#0AC4E0]">
                                    <ShieldCheck size={24} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#0AC4E0]">
                                        Kepala Sekolah
                                    </p>
                                    <h1 className="mt-0.5 break-words text-xl font-black leading-tight tracking-[-0.04em] text-slate-950 md:text-2xl">
                                        {sekolah?.nama_sekolah || user?.nama_sekolah || "Sekolah"}
                                    </h1>
                                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold text-slate-400">
                                        <span>Monitoring sekolah dalam satu tampilan.</span>
                                        <span className="inline-flex items-center gap-1.5">
                                            <MapPin size={11} className="text-[#0AC4E0]" />
                                            {sekolah?.nama_kabupaten || sekolah?.wilayah?.nama_wilayah || "Wilayah sekolah"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={onRefresh}
                                disabled={loading}
                                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-[9px] font-black uppercase tracking-widest text-white transition hover:bg-[#0AC4E0] disabled:opacity-60"
                            >
                                <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
                                Refresh
                            </button>
                        </div>
                    </section>

                    <div className="shrink-0">
                        <MetricStrip items={metrics} />
                    </div>

                    <section className="grid min-h-[360px] flex-1 gap-3 lg:min-h-0 xl:grid-cols-[minmax(0,1.45fr)_minmax(270px,0.55fr)]">
                        <div className="flex min-h-0 flex-col rounded-[1.7rem] border border-slate-100 bg-white p-4 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
                            <div className="flex shrink-0 flex-col gap-2 border-b border-slate-100 pb-3 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#0AC4E0]">
                                        {chartMeta.eyebrow}
                                    </p>
                                    <h2 className="mt-1 text-xl font-black tracking-[-0.035em] text-slate-950">
                                        {chartMeta.title}
                                    </h2>
                                    <p className="mt-1 text-[11px] font-semibold text-slate-400">
                                        {chartMeta.subtitle}
                                    </p>
                                </div>
                                <span className="rounded-full bg-cyan-50 px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-[#0AC4E0]">
                                    {total} {chartMeta.unit}
                                </span>
                            </div>

                            {total === 0 ? (
                                <div className="flex min-h-0 flex-1 items-center pt-3">
                                    <EmptyPie message="Belum ada data sekolah untuk tampilan ini." />
                                </div>
                            ) : (
                                <div className="grid min-h-0 flex-1 items-center gap-3 pt-2 lg:grid-cols-[minmax(270px,0.95fr)_minmax(250px,1.05fr)]">
                                    <div className="flex min-h-0 flex-col items-center justify-center">
                                        <SafeResponsiveContainer
                                            width="100%"
                                            height={285}
                                            minHeight={250}
                                            minWidth={250}
                                        >
                                            <PieChart>
                                                <Pie
                                                    data={chartRows}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="52%"
                                                    innerRadius={0}
                                                    outerRadius={112}
                                                    startAngle={90}
                                                    endAngle={-270}
                                                    paddingAngle={chartRows.length > 1 ? 2 : 0}
                                                    stroke="#FFFFFF"
                                                    strokeWidth={3}
                                                    isAnimationActive={false}
                                                >
                                                    {chartRows.map((row) => (
                                                        <Cell key={row.name} fill={row.color} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip
                                                    formatter={(value, _name, payload) => [
                                                        `${value} ${chartMeta.unit}`,
                                                        payload?.payload?.name || "Data",
                                                    ]}
                                                />
                                            </PieChart>
                                        </SafeResponsiveContainer>
                                        <div className="-mt-2 flex w-full max-w-[210px] items-center justify-between rounded-2xl border border-cyan-100 bg-cyan-50/70 px-4 py-2.5">
                                            <span className="text-[9px] font-black uppercase tracking-[0.14em] text-[#0AC4E0]">
                                                Total Data
                                            </span>
                                            <span className="text-lg font-black text-slate-950">{total}</span>
                                        </div>
                                    </div>

                                    <div className="grid content-center gap-2 sm:grid-cols-2 lg:grid-cols-1">
                                        {chartRows.map((row) => {
                                            const percentage = total ? (Number(row.value || 0) / total) * 100 : 0;
                                            return (
                                                <div
                                                    key={row.name}
                                                    className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5"
                                                >
                                                    <div className="flex min-w-0 items-center gap-2.5">
                                                        <span
                                                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                                                            style={{ backgroundColor: row.color }}
                                                        />
                                                        <span className="min-w-0 break-words text-[11px] font-black leading-4 text-slate-700">
                                                            {row.name}
                                                        </span>
                                                    </div>
                                                    <div className="shrink-0 text-right">
                                                        <p className="text-sm font-black text-slate-950">{row.value}</p>
                                                        <p className="text-[9px] font-bold text-slate-400">
                                                            {formatPercent(percentage)}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid min-h-0 gap-3 sm:grid-cols-2 xl:grid-cols-1 xl:grid-rows-[0.9fr_1.1fr]">
                            <section className="rounded-[1.55rem] border border-slate-100 bg-slate-950 p-4 text-white shadow-[0_16px_42px_rgba(15,23,42,0.08)]">
                                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-300">
                                    Baca Cepat
                                </p>
                                <div className="mt-3 grid grid-cols-2 gap-2">
                                    <div className="rounded-2xl bg-white/10 p-3">
                                        <p className="text-[8px] font-black uppercase tracking-[0.14em] text-white/50">
                                            Terbesar
                                        </p>
                                        <p className="mt-1 break-words text-sm font-black text-white">
                                            {topRow?.name || "-"}
                                        </p>
                                        <p className="mt-1 text-xl font-black text-cyan-300">{topShare}%</p>
                                    </div>
                                    <div className="rounded-2xl bg-white/10 p-3">
                                        <p className="text-[8px] font-black uppercase tracking-[0.14em] text-white/50">
                                            Kategori Aktif
                                        </p>
                                        <p className="mt-2 text-2xl font-black text-white">
                                            {chartRows.filter((row) => Number(row.value || 0) > 0).length}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                                    <div className="rounded-xl bg-white/5 px-2 py-2">
                                        <p className="text-base font-black">{activePrograms}</p>
                                        <p className="text-[7px] font-black uppercase tracking-wider text-white/45">Berjalan</p>
                                    </div>
                                    <div className="rounded-xl bg-white/5 px-2 py-2">
                                        <p className="text-base font-black">{completedPrograms}</p>
                                        <p className="text-[7px] font-black uppercase tracking-wider text-white/45">Selesai</p>
                                    </div>
                                    <div className="rounded-xl bg-white/5 px-2 py-2">
                                        <p className="text-base font-black">{participationRate}%</p>
                                        <p className="text-[7px] font-black uppercase tracking-wider text-white/45">Partisipasi</p>
                                    </div>
                                </div>
                            </section>

                            <section className="min-h-0 overflow-hidden rounded-[1.55rem] border border-slate-100 bg-white p-4 shadow-[0_14px_36px_rgba(15,23,42,0.04)]">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#0AC4E0]">
                                            Profil Sekolah
                                        </p>
                                        <h3 className="mt-1 text-sm font-black text-slate-950">
                                            Data utama sekolah
                                        </h3>
                                    </div>
                                    <School size={20} className="text-[#0AC4E0]" />
                                </div>
                                <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                                    {schoolProfile.map(([label, value]) => (
                                        <div key={label} className="min-w-0 rounded-xl bg-slate-50 px-3 py-2.5">
                                            <p className="text-[7px] font-black uppercase tracking-[0.13em] text-slate-400">
                                                {label}
                                            </p>
                                            <p className="mt-1 break-words text-[10px] font-black leading-4 text-slate-800">
                                                {value}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </section>

                    <section className="shrink-0 rounded-[1.55rem] border border-slate-100 bg-white p-3 shadow-[0_14px_36px_rgba(15,23,42,0.04)]">
                        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                            {controls.map((control) => {
                                const Icon = control.icon;
                                const active = chartMode === control.value;
                                return (
                                    <button
                                        key={control.value}
                                        type="button"
                                        onClick={() => onChartModeChange(control.value)}
                                        className={`group flex min-w-0 items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-left transition ${active
                                                ? "border-[#0AC4E0] bg-cyan-50 shadow-[0_8px_22px_rgba(10,196,224,0.12)]"
                                                : "border-slate-100 bg-slate-50/70 hover:border-cyan-100 hover:bg-cyan-50/50"
                                            }`}
                                    >
                                        <span
                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${active ? "bg-[#0AC4E0] text-white" : "bg-white text-slate-400"
                                                }`}
                                        >
                                            <Icon size={16} />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className={`block text-[10px] font-black ${active ? "text-slate-950" : "text-slate-700"}`}>
                                                {control.label}
                                            </span>
                                            <span className="mt-0.5 block text-[8px] font-bold text-slate-400">
                                                {control.helper}
                                            </span>
                                        </span>
                                        <span className={`rounded-full px-2 py-1 text-[8px] font-black ${active ? "bg-white text-[#0AC4E0]" : "bg-slate-100 text-slate-400"}`}>
                                            {control.count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                </div>
            </div>
        </MasterPageShell>
    );
}

export default function SchoolRoleDashboard({ mode = "auto" }) {
    const [user, setUser] = useState(null);
    const [sekolah, setSekolah] = useState(null);
    const [programs, setPrograms] = useState([]);
    const [assessments, setAssessments] = useState([]);
    const [gurus, setGurus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pillarFilter, setPillarFilter] = useState("ALL");
    const [yearFilter, setYearFilter] = useState("ALL");
    const [editingStudents, setEditingStudents] = useState(false);
    const [studentDraft, setStudentDraft] = useState("");
    const [savingStudents, setSavingStudents] = useState(false);
    const [headChartMode, setHeadChartMode] = useState("PROGRAM");

    useEffect(() => {
        setUser(getTokenPayload());
    }, []);

    const roleMode = useMemo(() => {
        if (mode !== "auto") return mode;
        const roleId = Number(user?.id_role || user?.role_id || 0);
        return roleId === 8 ? "guru" : "operator";
    }, [mode, user]);

    const schoolId = useMemo(() => getSchoolId(user), [user]);
    const userId = useMemo(() => getUserId(user), [user]);

    const loadData = async () => {
        if (!schoolId) {
            setLoading(false);
            return;
        }

        const token = getAuthToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        setLoading(true);
        try {
            const assessmentUrl = `${API_BASE_URL}/assessment/sekolah/${schoolId}${roleMode === "guru" && userId ? `?id_user=${userId}` : userId ? `?id_user=${userId}` : ""
                }`;

            const [schoolRes, programRes, assessmentRes, guruRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/sekolah/${schoolId}`, { headers }),
                axios.get(`${API_BASE_URL}/program/sekolah/${schoolId}?id_user=${userId || ""}`, {
                    headers,
                }),
                axios.get(assessmentUrl, { headers }).catch(() => ({ data: [] })),
                axios
                    .get(`${API_BASE_URL}/assessment-guru/sekolah/${schoolId}/aktif`, { headers })
                    .catch(async () =>
                        axios
                            .get(`${API_BASE_URL}/assessment-guru/sekolah/${schoolId}`, { headers })
                            .catch(() => ({ data: [] })),
                    ),
            ]);

            setSekolah(schoolRes.data?.data || schoolRes.data || null);
            setPrograms(normalizeArray(programRes.data));
            setAssessments(normalizeArray(assessmentRes.data));
            setGurus(normalizeArray(guruRes.data));
        } catch (error) {
            console.error("Gagal memuat dashboard sekolah:", error);
            setSekolah(null);
            setPrograms([]);
            setAssessments([]);
            setGurus([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && schoolId) loadData();
    }, [user, schoolId, roleMode]);

    const yearOptions = useMemo(() => {
        const years = new Set();
        programs.forEach((program) => {
            const year = getProgramYear(program);
            if (year) years.add(year);
        });
        assessments.forEach((assessment) => {
            const year = getAssessmentYear(assessment);
            if (year) years.add(year);
        });

        return [
            { value: "ALL", label: "Semua Tahun" },
            ...[...years]
                .sort((a, b) => Number(b) - Number(a))
                .map((year) => ({ value: year, label: year })),
        ];
    }, [programs, assessments]);

    const filteredPrograms = useMemo(
        () =>
            programs.filter((program) => {
                const matchPillar =
                    pillarFilter === "ALL" || getProgramPillar(program) === pillarFilter;
                const matchYear =
                    yearFilter === "ALL" || getProgramYear(program) === String(yearFilter);
                return matchPillar && matchYear;
            }),
        [programs, pillarFilter, yearFilter],
    );

    const filteredAssessments = useMemo(
        () =>
            assessments.filter(
                (assessment) =>
                    yearFilter === "ALL" || getAssessmentYear(assessment) === String(yearFilter),
            ),
        [assessments, yearFilter],
    );

    const programStageRows = useMemo(
        () => buildRows(filteredPrograms, getProgramStage, PROGRAM_STAGES),
        [filteredPrograms],
    );
    const programPillarRows = useMemo(
        () => buildRows(filteredPrograms, getProgramPillar, PILLARS),
        [filteredPrograms],
    );
    const assessmentStatusRows = useMemo(
        () =>
            buildRows(filteredAssessments, getAssessmentStatus, [
                "Belum Diisi",
                "Dalam Proses",
                "Terkirim",
            ]),
        [filteredAssessments],
    );

    const totalFilled = useMemo(
        () => filteredAssessments.reduce((sum, item) => sum + getAssessmentFilled(item), 0),
        [filteredAssessments],
    );
    const expectedResponses = filteredAssessments.length * gurus.length;
    const missingResponses = Math.max(expectedResponses - totalFilled, 0);
    const participationRows = [
        {
            name: "Sudah Mengisi",
            value: totalFilled,
            color: CHART_STATUS_COLORS.success,
        },
        {
            name: "Belum Mengisi",
            value: missingResponses,
            color: CHART_STATUS_COLORS.warning,
        },
    ].filter((row) => row.value > 0);

    const activePrograms = filteredPrograms.filter(
        (program) => getProgramStage(program) !== "Selesai",
    ).length;
    const completedPrograms = filteredPrograms.length - activePrograms;
    const completedAssessments = filteredAssessments.filter(
        (assessment) => getAssessmentStatus(assessment) === "Terkirim",
    ).length;
    const pendingAssessments = filteredAssessments.length - completedAssessments;
    const participationRate = expectedResponses
        ? Math.round((totalFilled / expectedResponses) * 100)
        : 0;

    const metrics =
        roleMode === "guru"
            ? [
                {
                    label: "Assessment",
                    value: filteredAssessments.length,
                    helper: "Assessment untuk Anda",
                    icon: ClipboardList,
                    color: CHART_STATUS_COLORS.info,
                },
                {
                    label: "Perlu Diisi",
                    value: pendingAssessments,
                    helper: "Belum dikirim",
                    icon: AlertCircle,
                    color: CHART_STATUS_COLORS.warning,
                },
                {
                    label: "Sudah Dikirim",
                    value: completedAssessments,
                    helper: "Pengisian selesai",
                    icon: CheckCircle2,
                    color: CHART_STATUS_COLORS.success,
                },
                {
                    label: "Program Aktif",
                    value: activePrograms,
                    helper: "Program sekolah berjalan",
                    icon: Target,
                    color: CHART_STATUS_COLORS.purple,
                },
            ]
            : roleMode === "kepala"
                ? [
                    {
                        label: "Program",
                        value: filteredPrograms.length,
                        helper: "Program sesuai filter",
                        icon: Target,
                        color: CHART_STATUS_COLORS.info,
                    },
                    {
                        label: "Assessment",
                        value: filteredAssessments.length,
                        helper: "Assessment sekolah",
                        icon: ClipboardList,
                        color: CHART_STATUS_COLORS.purple,
                    },
                    {
                        label: "Guru Aktif",
                        value: gurus.length,
                        helper: "Guru Assessment",
                        icon: GraduationCap,
                        color: CHART_STATUS_COLORS.success,
                    },
                    {
                        label: "Partisipasi",
                        value: formatPercent(participationRate),
                        helper: "Pengisian assessment",
                        icon: UserRoundCheck,
                        color: CHART_STATUS_COLORS.warning,
                    },
                ]
                : [
                    {
                        label: "Total Program",
                        value: filteredPrograms.length,
                        helper: "Program sekolah",
                        icon: Target,
                        color: CHART_STATUS_COLORS.info,
                    },
                    {
                        label: "Program Berjalan",
                        value: activePrograms,
                        helper: "Belum selesai",
                        icon: Sparkles,
                        color: CHART_STATUS_COLORS.warning,
                    },
                    {
                        label: "Guru Assessment",
                        value: gurus.length,
                        helper: "Guru aktif",
                        icon: GraduationCap,
                        color: CHART_STATUS_COLORS.success,
                    },
                    {
                        label: "Jumlah Siswa",
                        value: Number(sekolah?.jumlah_siswa || 0),
                        helper: "Siswa terdaftar",
                        icon: UsersRound,
                        color: CHART_STATUS_COLORS.purple,
                    },
                ];

    const roleLabel =
        roleMode === "guru"
            ? "Guru Assessment"
            : roleMode === "kepala"
                ? "Kepala Sekolah"
                : "Operator Sekolah";

    const roleSubtitle =
        roleMode === "guru"
            ? "Pantau assessment dan program sekolah dalam satu ringkasan."
            : roleMode === "kepala"
                ? "Pantau program, assessment, dan partisipasi guru secara ringkas."
                : "Pantau data sekolah dan program yang sedang berjalan.";


    const headChartViews = {
        PROGRAM: {
            eyebrow: "Program Sekolah",
            title: "Tahapan Program",
            subtitle: "Posisi seluruh program yang terkait dengan sekolah.",
            unit: "program",
            rows: programStageRows,
        },
        PILLAR: {
            eyebrow: "Program Sekolah",
            title: "4 Pilar Program",
            subtitle: "Komposisi program berdasarkan empat pilar.",
            unit: "program",
            rows: programPillarRows,
        },
        ASSESSMENT: {
            eyebrow: "Assessment Sekolah",
            title: "Status Assessment",
            subtitle: "Ringkasan status pengisian assessment sekolah.",
            unit: "assessment",
            rows: assessmentStatusRows,
        },
        PARTICIPATION: {
            eyebrow: "Guru Assessment",
            title: "Partisipasi Guru",
            subtitle: "Perbandingan respons Guru Assessment pada assessment sekolah.",
            unit: "respons",
            rows: participationRows,
        },
    };
    const activeHeadChart = headChartViews[headChartMode] || headChartViews.PROGRAM;

    const handleToggleStudentEditor = () => {
        if (!editingStudents) {
            setStudentDraft(String(sekolah?.jumlah_siswa || 0));
        }
        setEditingStudents((current) => !current);
    };

    const handleSaveStudents = async () => {
        const value = Number(studentDraft);
        if (!Number.isInteger(value) || value < 0) {
            notify.warning("Jumlah siswa harus berupa angka minimal 0.");
            return;
        }

        try {
            setSavingStudents(true);
            await axios.patch(
                `${API_BASE_URL}/sekolah/operator/jumlah-siswa`,
                { jumlah_siswa: value },
                {
                    headers: {
                        Authorization: `Bearer ${getAuthToken()}`,
                    },
                },
            );
            setSekolah((current) => ({ ...current, jumlah_siswa: value }));
            setEditingStudents(false);
            notify.success("Jumlah siswa berhasil diperbarui.");
        } catch (error) {
            notify.error(error?.response?.data?.message || "Gagal memperbarui jumlah siswa.");
        } finally {
            setSavingStudents(false);
        }
    };

    if (roleMode === "kepala") {
        return (
            <HeadSchoolExecutiveView
                user={user}
                sekolah={sekolah}
                metrics={metrics}
                loading={loading}
                onRefresh={loadData}
                chartMode={headChartMode}
                onChartModeChange={setHeadChartMode}
                chartRows={activeHeadChart.rows}
                chartMeta={activeHeadChart}
                gurus={gurus}
                programCount={filteredPrograms.length}
                activePrograms={activePrograms}
                completedPrograms={completedPrograms}
                assessmentCount={filteredAssessments.length}
                participationRate={participationRate}
            />
        );
    }

    return (
        <MasterPageShell
            title="Dashboard"
            highlight={roleLabel}
            subtitle={roleSubtitle}
            contentClassName="bg-[#EEF5FF]"
        >
            <div className="h-full overflow-y-auto bg-[#EEF5FF] p-4 text-slate-900 no-scrollbar md:p-6">
                <div className="space-y-4">
                    <section className="relative overflow-hidden rounded-[1.7rem] border border-slate-100 bg-white p-4 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
                        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#0AC4E0]/10 blur-3xl" />
                        <div className="relative grid gap-4 xl:grid-cols-[1fr_430px] xl:items-center">
                            <div className="flex min-w-0 items-center gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-[#0AC4E0]">
                                    {roleMode === "guru" ? (
                                        <BookOpenCheck size={27} />
                                    ) : roleMode === "kepala" ? (
                                        <ShieldCheck size={27} />
                                    ) : (
                                        <School size={27} />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#0AC4E0]">
                                        {roleLabel}
                                    </p>
                                    <h1 className="mt-1 break-words text-2xl font-black leading-tight tracking-[-0.04em] text-slate-950 md:text-3xl">
                                        {sekolah?.nama_sekolah || user?.nama_sekolah || "Sekolah"}
                                    </h1>
                                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-slate-400">
                                        <span>{roleSubtitle}</span>
                                        <span className="inline-flex items-center gap-1.5">
                                            <MapPin size={12} className="text-[#0AC4E0]" />
                                            {sekolah?.nama_kabupaten || sekolah?.wilayah?.nama_wilayah || "Wilayah sekolah"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                                <Dropdown
                                    value={pillarFilter}
                                    onChange={setPillarFilter}
                                    items={[
                                        { value: "ALL", label: "Semua Pilar" },
                                        ...PILLARS.map((pillar) => ({ value: pillar, label: pillar })),
                                    ]}
                                    placeholder="Semua Pilar"
                                    width="w-full"
                                />
                                <Dropdown
                                    value={yearFilter}
                                    onChange={setYearFilter}
                                    items={yearOptions}
                                    placeholder="Semua Tahun"
                                    width="w-full"
                                />
                                <button
                                    type="button"
                                    onClick={loadData}
                                    disabled={loading}
                                    className="inline-flex h-[39px] items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-[9px] font-black uppercase tracking-widest text-white transition hover:bg-[#0AC4E0] disabled:opacity-60"
                                >
                                    <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
                                    Refresh
                                </button>
                            </div>
                        </div>
                    </section>

                    {loading ? (
                        <div className="flex min-h-[500px] items-center justify-center rounded-[1.7rem] border border-slate-100 bg-white">
                            <Loader2 className="h-10 w-10 animate-spin text-[#0AC4E0]" />
                        </div>
                    ) : (
                        <>
                            <MetricStrip items={metrics} />

                            <div className="grid gap-4 xl:grid-cols-2">
                                {roleMode === "guru" ? (
                                    <>
                                        <SolidPieCard
                                            eyebrow="Assessment"
                                            title="Status Assessment"
                                            subtitle="Ringkasan assessment milik Guru Assessment yang sedang login."
                                            rows={assessmentStatusRows}
                                            totalLabel="Total Assessment"
                                        />
                                        <SolidPieCard
                                            eyebrow="Program Sekolah"
                                            title="4 Pilar Program"
                                            subtitle="Komposisi program sekolah berdasarkan pilar."
                                            rows={programPillarRows}
                                            totalLabel="Total Program"
                                        />
                                    </>
                                ) : roleMode === "kepala" ? (
                                    <>
                                        <SolidPieCard
                                            eyebrow="Program Sekolah"
                                            title="Tahapan Program"
                                            subtitle="Sebaran lima tahapan program sekolah."
                                            rows={programStageRows}
                                            totalLabel="Total Program"
                                        />
                                        <SolidPieCard
                                            eyebrow="Assessment"
                                            title="Partisipasi Guru"
                                            subtitle="Perbandingan pengisian assessment oleh Guru Assessment."
                                            rows={participationRows}
                                            totalLabel="Total Respons"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <SolidPieCard
                                            eyebrow="Program Sekolah"
                                            title="Tahapan Program"
                                            subtitle="Sebaran lima tahapan program yang terkait dengan sekolah."
                                            rows={programStageRows}
                                            totalLabel="Total Program"
                                        />
                                        <SolidPieCard
                                            eyebrow="Program Sekolah"
                                            title="4 Pilar Program"
                                            subtitle="Komposisi program sekolah berdasarkan empat pilar."
                                            rows={programPillarRows}
                                            totalLabel="Total Program"
                                        />
                                    </>
                                )}
                            </div>

                            <SchoolSnapshot
                                sekolah={sekolah}
                                gurus={gurus}
                                roleMode={roleMode}
                                editingStudents={editingStudents}
                                onEditStudents={handleToggleStudentEditor}
                            />

                            {roleMode === "operator" && editingStudents && (
                                <StudentEditor
                                    value={studentDraft}
                                    onChange={setStudentDraft}
                                    onSave={handleSaveStudents}
                                    onCancel={() => setEditingStudents(false)}
                                    saving={savingStudents}
                                />
                            )}

                            <RoleActions roleMode={roleMode} />
                        </>
                    )}
                </div>
            </div>
        </MasterPageShell>
    );
}