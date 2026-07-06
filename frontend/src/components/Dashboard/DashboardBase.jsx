/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
    BarChart3,
    CheckCircle2,
    ChartPie,
    ChevronLeft,
    ChevronRight,
    ClipboardCheck,
    Clock3,
    FileCheck2,
    Layers3,
    RefreshCw,
    Search,
    School,
} from "lucide-react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis,
} from "recharts";

import Sidebar from "../Sidebar";
import PageWrapper from "../PageWrapper";
import Dropdown from "../Dropdown";
import ProgramRatingStars from "../program/ProgramRatingStars";
import { CHART_STATUS_COLORS } from "../../utils/chartPalette";

const API_FALLBACK = "";
const ITEMS_PER_PAGE = 5;

const PILLAR_META = {
    AKADEMIK: {
        label: "Akademik",
        color: CHART_STATUS_COLORS.success,
        soft: "#ECFDF5",
        group: "AKADEMIK",
        chartKey: "akademik",
    },
    KARAKTER: {
        label: "Karakter",
        color: CHART_STATUS_COLORS.warning,
        soft: "#FFFBEB",
        group: "AKADEMIK",
        chartKey: "karakter",
    },
    SENI_BUDAYA: {
        label: "Seni Budaya",
        color: CHART_STATUS_COLORS.danger,
        soft: "#FFF1F2",
        group: "NON_AKADEMIK",
        chartKey: "seniBudaya",
    },
    KECAKAPAN_HIDUP: {
        label: "Kecakapan Hidup",
        color: CHART_STATUS_COLORS.orange,
        soft: "#FFF7ED",
        group: "NON_AKADEMIK",
        chartKey: "kecakapanHidup",
    },
};

const CHART_SERIES = Object.entries(PILLAR_META).map(([key, meta]) => ({
    key,
    ...meta,
}));

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

function statusText(item, getStatus) {
    return String(getStatus(item) || "Belum Ada").trim();
}

function getProgressBucket(item, getStatus, type) {
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
    return value === "SELESAI" ? "Selesai" : "Dalam Proses";
}

function uniqueStrings(values) {
    return [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))];
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
        <div className="relative min-h-[112px] overflow-hidden border-r border-slate-100 bg-white px-5 py-5 last:border-r-0">
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
                    <p className="mt-2 text-[34px] font-black leading-none tracking-[-0.05em] text-slate-800">
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

function EmptyState({ title, description }) {
    return (
        <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-[#0AC4E0]">
                <BarChart3 size={24} />
            </div>
            <h3 className="mt-4 text-[14px] font-black text-slate-700">{title}</h3>
            <p className="mt-2 max-w-[320px] text-[11px] font-semibold leading-5 text-slate-400">
                {description}
            </p>
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
                description="Ubah filter atau pastikan data memiliki relasi sekolah dan pilar."
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
                    description="Pilih filter lain atau pastikan pilar sudah tersimpan pada data."
                />
            );
        }

        return (
            <div className="min-w-0">
                <div className="mb-4 flex flex-wrap gap-3">
                    {pieRows.map((item) => (
                        <span
                            key={item.key}
                            className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-wide text-slate-500"
                        >
                            <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            {item.name} ({item.value})
                        </span>
                    ))}
                </div>

                <div className="relative h-[420px] min-h-[360px] min-w-0">
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                        minWidth={0}
                        minHeight={0}
                        debounce={50}
                    >
                        <PieChart>
                            <Pie
                                data={pieRows}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={86}
                                outerRadius={142}
                                paddingAngle={4}
                                stroke="#ffffff"
                                strokeWidth={4}
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
                    </ResponsiveContainer>

                    <div className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                        <span className="text-[34px] font-black leading-none tracking-[-0.06em] text-slate-800">
                            {totalPie}
                        </span>
                        <span className="mt-1 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                            Total Data
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    const chartHeight = Math.max(360, rows.length * 52);

    return (
        <div className="min-w-0">
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

            <div className="max-h-[520px] min-w-0 overflow-y-auto overflow-x-hidden pr-2">
                <div className="min-w-0" style={{ height: chartHeight }}>
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                        minWidth={0}
                        minHeight={0}
                        debounce={50}
                    >
                        <BarChart
                            data={rows}
                            layout="vertical"
                            margin={{ top: 8, right: 20, left: 10, bottom: 8 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                horizontal={false}
                                stroke="#E2E8F0"
                            />
                            <XAxis
                                type="number"
                                allowDecimals={false}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fontWeight: 800, fill: "#94A3B8" }}
                            />
                            <YAxis
                                type="category"
                                dataKey="name"
                                width={160}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fontWeight: 900, fill: "#475569" }}
                                tickFormatter={(value) =>
                                    String(value || "").length > 23
                                        ? `${String(value).slice(0, 23)}"¦`
                                        : value
                                }
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
                                        barSize={24}
                                        radius={
                                            pillarKey === visiblePillars.at(-1)
                                                ? [0, 8, 8, 0]
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
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Maksimal {ITEMS_PER_PAGE} data per halaman
                </p>

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
    subtitle,
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

    const groupByItems = [
        { value: "SEKOLAH", label: "Per Sekolah" },
        { value: "KABUPATEN", label: "Per Kabupaten" },
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
        <DashboardPanel title={title} subtitle={subtitle}>
            <div className="border-b border-slate-100 bg-slate-50/60 p-4">
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
                        value={countyFilter}
                        onChange={setCountyFilter}
                        items={countyFilterItems}
                        placeholder="Semua Kabupaten"
                        ariaLabel="Filter kabupaten"
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

            <div className="grid min-w-0 grid-cols-1 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                <div className="min-w-0 border-b border-slate-100 p-5 xl:border-b-0 xl:border-r">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                Diagram {groupBy === "SEKOLAH" ? "Per Sekolah" : "Per Kabupaten"}
                            </p>
                            <p className="mt-1 text-[12px] font-bold text-slate-600">
                                {chartRows.length} kelompok dari {rows.length} data terfilter
                            </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => setChartType("BAR")}
                                    className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[9px] font-black uppercase tracking-wide transition ${chartType === "BAR"
                                        ? "bg-slate-800 text-white"
                                        : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                                        }`}
                                    title="Lihat diagram batang"
                                >
                                    <BarChart3 size={14} /> Batang
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setChartType("PIE")}
                                    className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[9px] font-black uppercase tracking-wide transition ${chartType === "PIE"
                                        ? "bg-slate-800 text-white"
                                        : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                                        }`}
                                    title="Lihat diagram pie"
                                >
                                    <ChartPie size={14} /> Pie
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

                <div className="min-w-0">
                    <div className="border-b border-slate-100 px-4 py-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            Daftar {type === "PROGRAM" ? "Program" : "Assessment"}
                        </p>
                        <p className="mt-1 text-[11px] font-semibold text-slate-500">
                            Data mengikuti seluruh filter pada bagian atas.
                        </p>
                    </div>

                    <DataList
                        rows={rows}
                        type={type}
                        getTitle={getTitle}
                        getCode={getCode}
                        getStatus={getStatus}
                        resolveTargets={resolveTargets}
                        onItemClick={onItemClick}
                        filterSignature={filterSignature}
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
}) {
    const [schools, setSchools] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState("ALL");

    const [programSearch, setProgramSearch] = useState("");
    const [programGroupFilter, setProgramGroupFilter] = useState("ALL");
    const [programPillarFilter, setProgramPillarFilter] = useState("ALL");
    const [programCountyFilter, setProgramCountyFilter] = useState("ALL");
    const [programGroupBy, setProgramGroupBy] = useState("SEKOLAH");
    const [programTypeFilter, setProgramTypeFilter] = useState("ALL");
    const [programProgressFilter, setProgramProgressFilter] = useState("ALL");

    const [assessmentSearch, setAssessmentSearch] = useState("");
    const [assessmentGroupFilter, setAssessmentGroupFilter] = useState("ALL");
    const [assessmentPillarFilter, setAssessmentPillarFilter] = useState("ALL");
    const [assessmentCountyFilter, setAssessmentCountyFilter] = useState("ALL");
    const [assessmentGroupBy, setAssessmentGroupBy] = useState("SEKOLAH");
    const [assessmentProgressFilter, setAssessmentProgressFilter] = useState("ALL");

    const fetchDashboardData = async () => {
        if (!primaryEndpoint || !programEndpoint || !assessmentEndpoint) {
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
                fetch(assessmentEndpoint, { headers }),
            ]);

            const schoolPayload = await safeJson(schoolRes);
            const programPayload = await safeJson(programRes);
            const assessmentPayload = await safeJson(assessmentRes);

            if (!schoolRes.ok || !programRes.ok || !assessmentRes.ok) {
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

            const scopedAssessments = normalizeArray(assessmentPayload)
                .filter((item) => isItemAllowedByHo(item, categoryFilter))
                .filter(filterBySchoolScope);

            setSchools(scopedSchools);
            setPrograms(scopedPrograms);
            setAssessments(scopedAssessments);
        } catch (error) {
            console.error("Gagal mengambil dashboard HO:", error);
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
        categoryFilter,
        JSON.stringify(allowedJenjang),
    ]);

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

    const filterRows = ({
        source,
        type,
        search,
        groupFilter,
        pillarFilter,
        countyFilter,
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
            assessmentProgressFilter,
            schoolById,
            schoolByName,
        ],
    );

    const buildChartRows = (source, groupBy) => {
        const counter = new Map();

        source.forEach((item) => {
            const pillarKey = getPillarKey(item);
            const chartKey = PILLAR_META[pillarKey].chartKey;
            const uniqueGroups = new Set();

            resolveTargets(item).forEach((target) => {
                const groupName =
                    groupBy === "KABUPATEN" ? target.county : target.name;
                if (groupName) uniqueGroups.add(groupName);
            });

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
        () => buildChartRows(filteredPrograms, programGroupBy),
        [filteredPrograms, programGroupBy, schoolById, schoolByName],
    );

    const assessmentChartRows = useMemo(
        () => buildChartRows(filteredAssessments, assessmentGroupBy),
        [filteredAssessments, assessmentGroupBy, schoolById, schoolByName],
    );

    const visiblePillars =
        normalizeKey(categoryFilter) === "NON_AKADEMIK"
            ? ["SENI_BUDAYA", "KECAKAPAN_HIDUP"]
            : ["AKADEMIK", "KARAKTER"];

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
        <PageWrapper className="flex h-screen overflow-hidden bg-slate-100 !p-0 font-sans text-slate-700">
            <Sidebar />

            <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto px-4 py-5 md:px-6">
                    <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-5">
                        <DashboardPanel>
                            <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
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

                                    <h1 className="text-[24px] font-black tracking-tight text-slate-800">
                                        {title}{" "}
                                        <span className="text-[#0AC4E0]">
                                            {titleHighlight}
                                        </span>
                                    </h1>
                                    <p className="mt-1 max-w-3xl text-[12px] font-semibold leading-5 text-slate-400">
                                        {subtitle}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                                        {[
                                            { value: "ALL", label: "Semua", icon: Layers3 },
                                            {
                                                value: "PROGRAM",
                                                label: "Program",
                                                icon: ClipboardCheck,
                                            },
                                            {
                                                value: "ASSESSMENT",
                                                label: "Assessment",
                                                icon: FileCheck2,
                                            },
                                        ].map((option) => {
                                            const Icon = option.icon;
                                            const active = activeView === option.value;
                                            return (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() => setActiveView(option.value)}
                                                    className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-[10px] font-black uppercase tracking-wide transition ${active
                                                        ? "bg-[#0AC4E0] text-white shadow-sm"
                                                        : "text-slate-400 hover:bg-white hover:text-slate-700"
                                                        }`}
                                                >
                                                    <Icon size={13} />
                                                    {option.label}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={fetchDashboardData}
                                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0AC4E0] px-4 text-[10px] font-black uppercase tracking-wide text-white shadow-sm transition hover:bg-cyan-500 active:scale-95"
                                    >
                                        <RefreshCw size={13} /> Refresh
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                                {metricRows.map((metric) => (
                                    <MetricCard key={metric.label} {...metric} />
                                ))}
                            </div>
                        </DashboardPanel>

                        {(activeView === "ALL" || activeView === "ASSESSMENT") && (
                            <AnalyticsSection
                                type="ASSESSMENT"
                                title="Monitoring Assessment"
                                subtitle="Satu diagram per sekolah atau kabupaten dan daftar assessment dalam satu panel."
                                rows={filteredAssessments}
                                chartRows={assessmentChartRows}
                                visiblePillars={visiblePillars}
                                groupFilter={assessmentGroupFilter}
                                setGroupFilter={setAssessmentGroupFilter}
                                pillarFilter={assessmentPillarFilter}
                                setPillarFilter={setAssessmentPillarFilter}
                                countyFilter={assessmentCountyFilter}
                                setCountyFilter={setAssessmentCountyFilter}
                                countyOptions={assessmentCountyOptions}
                                groupBy={assessmentGroupBy}
                                setGroupBy={setAssessmentGroupBy}
                                typeFilter="ALL"
                                setTypeFilter={() => { }}
                                progressFilter={assessmentProgressFilter}
                                setProgressFilter={setAssessmentProgressFilter}
                                search={assessmentSearch}
                                setSearch={setAssessmentSearch}
                                categoryFilter={categoryFilter}
                                getTitle={getAssessmentTitle}
                                getCode={getAssessmentCode}
                                getStatus={getAssessmentStatus}
                                resolveTargets={resolveTargets}
                                onItemClick={onAssessmentClick}
                            />
                        )}

                        {(activeView === "ALL" || activeView === "PROGRAM") && (
                            <AnalyticsSection
                                type="PROGRAM"
                                title="Monitoring Program"
                                subtitle="Satu diagram per sekolah atau kabupaten dan daftar program dalam satu panel."
                                rows={filteredPrograms}
                                chartRows={programChartRows}
                                visiblePillars={visiblePillars}
                                groupFilter={programGroupFilter}
                                setGroupFilter={setProgramGroupFilter}
                                pillarFilter={programPillarFilter}
                                setPillarFilter={setProgramPillarFilter}
                                countyFilter={programCountyFilter}
                                setCountyFilter={setProgramCountyFilter}
                                countyOptions={programCountyOptions}
                                groupBy={programGroupBy}
                                setGroupBy={setProgramGroupBy}
                                typeFilter={programTypeFilter}
                                setTypeFilter={setProgramTypeFilter}
                                progressFilter={programProgressFilter}
                                setProgressFilter={setProgramProgressFilter}
                                search={programSearch}
                                setSearch={setProgramSearch}
                                categoryFilter={categoryFilter}
                                getTitle={getProgramTitle}
                                getCode={getProgramCode}
                                getStatus={getProgramStatus}
                                resolveTargets={resolveTargets}
                                onItemClick={onProgramClick}
                            />
                        )}
                    </div>
                </div>
            </main>
        </PageWrapper>
    );
}

export default DashboardBase;

