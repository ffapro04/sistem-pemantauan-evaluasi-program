/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import {
    BadgeCheck,
    CheckCircle2,
    FolderOpen,
    Layers3,
    RefreshCcw,
    School,
    Star,
} from "lucide-react";
import {
    Cell,
    Pie,
    PieChart,
    Tooltip,
} from "recharts";

import { Sidebar, PageWrapper, Button } from "../common";
import Dropdown from "../Dropdown";
import SafeResponsiveContainer from "../charts/SafeResponsiveContainer";

const API_BASE_URL = "http://localhost:3000";
const COLORS = ["#0AC4E0", "#2563EB", "#7C3AED", "#F97316", "#10B981", "#64748B", "#EC4899", "#F59E0B"];

function normalizeArray(payload) {
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload)) return payload;
    return [];
}

function getArray(...values) {
    return values.find((value) => Array.isArray(value)) || [];
}

function getProgramVendorIds(program) {
    if (Array.isArray(program?.vendor_ids)) return program.vendor_ids.map(String);
    if (Array.isArray(program?.id_vendor)) return program.id_vendor.map(String);
    if (program?.id_vendor) return [String(program.id_vendor)];
    return [];
}

function getProgramSchoolIds(program) {
    const ids = getArray(program?.sekolah_ids, program?.target_sekolah_ids).map(String);
    if (program?.id_sekolah) ids.push(String(program.id_sekolah));
    return [...new Set(ids)];
}

function getProgramPillar(program) {
    const raw = String(
        program?.pilar ||
        program?.kategori_program ||
        program?.sub_kategori ||
        program?.kategori ||
        "Belum ditentukan",
    ).trim();

    const normalized = raw.toLowerCase().replace(/[_-]+/g, " ");
    if (normalized.includes("akademik") && !normalized.includes("non")) return "Akademik";
    if (normalized.includes("karakter")) return "Karakter";
    if (normalized.includes("seni")) return "Seni Budaya";
    if (normalized.includes("kecakapan")) return "Kecakapan Hidup";
    return raw || "Belum ditentukan";
}

function getProgramYear(program) {
    return String(program?.tahun || program?.tahun_program || program?.periode || "-");
}

function normalizeVendorCategory(vendor) {
    const raw = String(
        vendor?.kategori ||
        vendor?.pilar ||
        vendor?.jenis_vendor ||
        vendor?.kategori_vendor ||
        "",
    )
        .trim()
        .toLowerCase()
        .replace(/[_-]+/g, " ");

    if (raw.includes("non") && raw.includes("akademik")) return "NON_AKADEMIK";
    if (raw.includes("akademik")) return "AKADEMIK";
    return "UNKNOWN";
}

function getVendorPillarOptions(vendor, programs = []) {
    const category = normalizeVendorCategory(vendor);
    if (category === "AKADEMIK") return ["Akademik", "Karakter"];
    if (category === "NON_AKADEMIK") return ["Seni Budaya", "Kecakapan Hidup"];

    const canonical = ["Akademik", "Karakter", "Seni Budaya", "Kecakapan Hidup"];
    const available = new Set(programs.map(getProgramPillar));
    return canonical.filter((pillar) => available.has(pillar));
}

function normalizeGradeLevel(value) {
    const raw = String(value || "").trim().toUpperCase();
    if (/\bSD\b|SEKOLAH DASAR/.test(raw)) return "SD";
    if (/\bSMP\b|SEKOLAH MENENGAH PERTAMA/.test(raw)) return "SMP";
    if (/\bSMK\b|SEKOLAH MENENGAH KEJURUAN/.test(raw)) return "SMK";
    return "";
}

function getProgramGradeLevels(program, schools = []) {
    const levels = new Set();
    const directValues = [
        program?.jenjang,
        program?.jenjang_sekolah,
        ...(Array.isArray(program?.jenjang_ids) ? program.jenjang_ids : []),
        ...(Array.isArray(program?.jenjangs) ? program.jenjangs : []),
    ];

    directValues.forEach((value) => {
        const normalized = normalizeGradeLevel(value);
        if (normalized) levels.add(normalized);
    });

    const schoolIds = new Set(getProgramSchoolIds(program));
    schools.forEach((school) => {
        if (!schoolIds.has(String(school?.id_sekolah))) return;
        const normalized = normalizeGradeLevel(
            school?.jenjang || school?.tingkat || school?.jenis_sekolah,
        );
        if (normalized) levels.add(normalized);
    });

    return [...levels];
}

function getProgramStatus(program) {
    const raw = String(program?.status_program || program?.status || "Belum ditentukan")
        .trim()
        .toLowerCase();
    if (raw.includes("approval")) return "Approval";
    if (raw.includes("sosialisasi")) return "Sosialisasi";
    if (raw.includes("implementasi")) return "Implementasi";
    if (raw.includes("evaluasi")) return "Evaluasi";
    if (raw.includes("selesai") || raw.includes("complete")) return "Selesai";
    return raw ? raw.replace(/\b\w/g, (char) => char.toUpperCase()) : "Belum ditentukan";
}

function getProgramRating(program) {
    const candidates = [
        program?.rating_program,
        program?.rating,
        program?.nilai_rating,
        program?.average_rating,
        program?.rata_rata_rating,
        program?.evaluasi?.rating,
    ];
    const value = candidates.map(Number).find((item) => Number.isFinite(item) && item >= 0);
    if (!Number.isFinite(value)) return null;
    return Math.min(value, 5);
}

function getVendorName(vendor, fallback) {
    return vendor?.nama_vendor || vendor?.nama || fallback || "Vendor";
}

function groupCounts(items, keyGetter) {
    const map = new Map();
    items.forEach((item) => {
        const key = keyGetter(item) || "Belum ditentukan";
        map.set(key, (map.get(key) || 0) + 1);
    });
    return [...map.entries()]
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
}

function SummaryCard({ label, value, helper, icon, tone = "cyan" }) {
    const color = {
        cyan: "#0AC4E0",
        blue: "#2563EB",
        emerald: "#10B981",
        amber: "#F59E0B",
    }[tone] || "#0AC4E0";

    return (
        <article className="relative min-h-[102px] overflow-hidden border-r border-slate-100 bg-white px-5 py-4 last:border-r-0">
            <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: color }} />
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
        </article>
    );
}

function ChartLegend({ data, total, valueSuffix = "program" }) {
    return (
        <div className="space-y-2">
            {data.map((item, index) => {
                const percentage = total ? Math.round((item.value / total) * 100) : 0;
                return (
                    <div key={item.name} className="rounded-xl border border-cyan-100 bg-white px-3 py-2">
                        <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <p className="min-w-0 flex-1 truncate text-[9px] font-black uppercase tracking-wide text-slate-600" title={item.name}>{item.name}</p>
                            <p className="text-[10px] font-black text-slate-950">{item.value}</p>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                                <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: COLORS[index % COLORS.length] }} />
                            </div>
                            <span className="text-[8px] font-black text-slate-400">{percentage}%</span>
                        </div>
                        <p className="sr-only">{item.value} {valueSuffix}</p>
                    </div>
                );
            })}
        </div>
    );
}

function DashboardPieCard({ eyebrow, title, description, data, total, centerLabel, emptyText, valueSuffix = "program" }) {
    return (
        <section className="flex min-h-0 flex-col rounded-[1.55rem] border border-cyan-100 bg-white shadow-sm">
            <div className="shrink-0 border-b border-slate-100 px-4 py-3">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#0AC4E0]">{eyebrow}</p>
                <h2 className="mt-1 text-[17px] font-black text-slate-950">{title}</h2>
                <p className="mt-1 text-[9px] font-bold text-slate-400">{description}</p>
            </div>

            {data.length ? (
                <div className="grid min-h-0 flex-1 grid-cols-[minmax(250px,0.95fr)_minmax(260px,1.05fr)] items-center gap-4 p-4">
                    <div className="flex min-h-0 flex-col items-center justify-center">
                        <div className="h-[290px] w-full min-w-0">
                            <SafeResponsiveContainer
                                width="100%"
                                height="100%"
                                minWidth={0}
                                minHeight={270}
                                debounce={50}
                            >
                                {({ width, height }) => {
                                    const radiusBase = Math.min(Number(width) || 0, Number(height) || 0);
                                    const outerRadius = Math.max(
                                        92,
                                        Math.min(122, Math.round(radiusBase * 0.41)),
                                    );

                                    return (
                                        <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                                            <Pie
                                                data={data}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="52%"
                                                innerRadius={0}
                                                outerRadius={outerRadius}
                                                startAngle={90}
                                                endAngle={-270}
                                                paddingAngle={data.length > 1 ? 2 : 0}
                                                cornerRadius={data.length > 1 ? 6 : 0}
                                                stroke="#ffffff"
                                                strokeWidth={3}
                                                labelLine={false}
                                                isAnimationActive={false}
                                            >
                                                {data.map((item, index) => (
                                                    <Cell
                                                        key={`${item.name}-${index}`}
                                                        fill={COLORS[index % COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value, name) => [`${value} ${valueSuffix}`, name]}
                                                contentStyle={{
                                                    borderRadius: 14,
                                                    border: "1px solid #CFFAFE",
                                                    boxShadow: "0 14px 34px rgba(15, 23, 42, 0.12)",
                                                    fontSize: 11,
                                                    fontWeight: 800,
                                                }}
                                            />
                                        </PieChart>
                                    );
                                }}
                            </SafeResponsiveContainer>
                        </div>

                        <div className="mt-1 inline-flex items-center gap-3 rounded-2xl border border-cyan-100 bg-white px-4 py-2 shadow-[0_10px_25px_rgba(15,23,42,0.06)]">
                            <span className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-slate-950 px-2 text-[15px] font-black text-white">{total}</span>
                            <div>
                                <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400">Total Data</p>
                                <p className="mt-0.5 text-[10px] font-black text-slate-700">{centerLabel}</p>
                            </div>
                        </div>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto pr-1">
                        <ChartLegend data={data} total={total} valueSuffix={valueSuffix} />
                    </div>
                </div>
            ) : (
                <div className="flex min-h-[280px] flex-1 items-center justify-center text-center">
                    <div>
                        <Layers3 className="mx-auto text-slate-300" size={34} />
                        <p className="mt-3 text-[11px] font-black text-slate-500">{emptyText}</p>
                    </div>
                </div>
            )}
        </section>
    );
}

function ControlGroup({ label, value, onChange, items }) {
    return (
        <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/60 p-1.5">
            <p className="px-1.5 pb-1 text-[7px] font-black uppercase tracking-[0.14em] text-slate-400">
                {label}
            </p>
            <div className="flex min-w-0 gap-1">
                {items.map((item) => {
                    const active = String(item.value) === String(value);
                    return (
                        <button
                            key={item.value}
                            type="button"
                            onClick={() => onChange(item.value)}
                            className={`min-w-0 flex-1 truncate rounded-lg border px-2 py-1.5 text-[8px] font-black transition ${active
                                ? "border-[#0AC4E0] bg-cyan-50 text-[#0AC4E0] shadow-sm"
                                : "border-transparent bg-white text-slate-600 hover:border-cyan-100"
                                }`}
                            title={item.label}
                        >
                            {item.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default function DashboardVendorPage({
    title = "Dashboard Vendor",
    listPath = "/vendor/program",
}) {
    const navigate = useNavigate();
    const [programs, setPrograms] = useState([]);
    const [schools, setSchools] = useState([]);
    const [currentVendor, setCurrentVendor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pillarFilter, setPillarFilter] = useState("ALL");
    const [gradeFilter, setGradeFilter] = useState("ALL");
    const [yearFilter, setYearFilter] = useState("ALL");
    const [viewMode, setViewMode] = useState("PILLAR");

    const getTokenPayload = () => {
        const token = localStorage.getItem("token");
        if (!token) return null;
        try { return jwtDecode(token); } catch { return null; }
    };

    const resolveCurrentVendor = (vendorList, payload) => {
        const userId = String(payload?.sub || payload?.id_user || payload?.id || "");
        const email = String(payload?.email || "").toLowerCase().trim();
        const name = String(payload?.nama || "").toLowerCase().trim();
        return vendorList.find((vendor) => [vendor?.id_user, vendor?.user_id, vendor?.id_vendor].filter(Boolean).map(String).includes(userId))
            || vendorList.find((vendor) => email && String(vendor?.email || vendor?.email_vendor || vendor?.user?.email || "").toLowerCase().trim() === email)
            || vendorList.find((vendor) => name && String(vendor?.nama_vendor || vendor?.nama || "").toLowerCase().trim() === name)
            || null;
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            const payload = getTokenPayload();
            const [programResponse, schoolResponse, vendorResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/program`, { headers }),
                fetch(`${API_BASE_URL}/sekolah`, { headers }),
                fetch(`${API_BASE_URL}/vendor`, { headers }),
            ]);
            const programList = normalizeArray(await programResponse.json());
            const schoolList = normalizeArray(await schoolResponse.json());
            const vendorList = normalizeArray(await vendorResponse.json());
            const vendor = resolveCurrentVendor(vendorList, payload);
            const vendorPrograms = vendor
                ? programList.filter((program) => getProgramVendorIds(program).includes(String(vendor.id_vendor)))
                : [];
            const detailedPrograms = await Promise.all(vendorPrograms.map(async (program) => {
                try {
                    const response = await fetch(`${API_BASE_URL}/program/${program.id_program}`, { headers });
                    const result = await response.json();
                    return result?.data || result || program;
                } catch { return program; }
            }));
            setPrograms(detailedPrograms);
            setSchools(schoolList);
            setCurrentVendor(vendor);
        } catch (error) {
            console.error("Gagal mengambil dashboard vendor:", error);
            toast.error("Gagal mengambil dashboard vendor");
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchDashboardData(); }, []);

    const vendorPillarControls = useMemo(
        () => getVendorPillarOptions(currentVendor, programs),
        [currentVendor, programs],
    );

    useEffect(() => {
        if (
            pillarFilter !== "ALL" &&
            !vendorPillarControls.includes(pillarFilter)
        ) {
            setPillarFilter("ALL");
        }
    }, [pillarFilter, vendorPillarControls]);

    const yearOptions = useMemo(() => {
        const values = [...new Set(programs.map(getProgramYear).filter((value) => value && value !== "-"))].sort((a, b) => Number(b) - Number(a));
        return [{ value: "ALL", label: "Semua Tahun" }, ...values.map((value) => ({ value, label: value }))];
    }, [programs]);

    const filteredPrograms = useMemo(
        () =>
            programs.filter((program) => {
                const pillarMatch =
                    pillarFilter === "ALL" || getProgramPillar(program) === pillarFilter;
                const yearMatch =
                    yearFilter === "ALL" || getProgramYear(program) === yearFilter;
                const gradeMatch =
                    gradeFilter === "ALL" ||
                    getProgramGradeLevels(program, schools).includes(gradeFilter);
                return pillarMatch && yearMatch && gradeMatch;
            }),
        [programs, schools, pillarFilter, gradeFilter, yearFilter],
    );

    const filteredSchoolIds = useMemo(() => [...new Set(filteredPrograms.flatMap(getProgramSchoolIds))], [filteredPrograms]);
    const completedCount = useMemo(() => filteredPrograms.filter((program) => getProgramStatus(program) === "Selesai").length, [filteredPrograms]);
    const ratings = useMemo(() => filteredPrograms.map(getProgramRating).filter((value) => value !== null), [filteredPrograms]);
    const averageRating = ratings.length ? (ratings.reduce((sum, value) => sum + value, 0) / ratings.length).toFixed(1) : "-";

    const statusData = useMemo(() => groupCounts(filteredPrograms, getProgramStatus), [filteredPrograms]);
    const pillarData = useMemo(() => groupCounts(filteredPrograms, getProgramPillar), [filteredPrograms]);

    const schoolData = useMemo(() => {
        const counter = new Map();
        filteredPrograms.forEach((program) => {
            getProgramSchoolIds(program).forEach((id) => counter.set(id, (counter.get(id) || 0) + 1));
        });
        return [...counter.entries()].map(([id, value]) => {
            const school = schools.find((item) => String(item.id_sekolah) === String(id));
            return { name: school?.nama_sekolah || `Sekolah ${id}`, value };
        }).sort((a, b) => b.value - a.value);
    }, [filteredPrograms, schools]);

    const ratingData = useMemo(() => {
        const buckets = [
            { name: "4.5–5.0", min: 4.5, max: 5.01, value: 0 },
            { name: "4.0–4.4", min: 4, max: 4.5, value: 0 },
            { name: "3.0–3.9", min: 3, max: 4, value: 0 },
            { name: "< 3.0", min: 0, max: 3, value: 0 },
        ];
        let unrated = 0;
        filteredPrograms.forEach((program) => {
            const rating = getProgramRating(program);
            if (rating === null) { unrated += 1; return; }
            const bucket = buckets.find((item) => rating >= item.min && rating < item.max);
            if (bucket) bucket.value += 1;
        });
        const result = buckets.filter((item) => item.value > 0).map(({ name, value }) => ({ name, value }));
        if (unrated > 0) result.push({ name: "Belum Dinilai", value: unrated });
        return result;
    }, [filteredPrograms]);

    const secondaryConfig = {
        PILLAR: { eyebrow: "Komposisi Program", title: "Program per Pilar", description: "Perbandingan Program Vendor berdasarkan pilar.", data: pillarData, total: filteredPrograms.length, centerLabel: "Program", valueSuffix: "program" },
        SCHOOL: { eyebrow: "Sekolah Terlibat", title: "Program per Sekolah", description: "Nama sekolah dan jumlah Program Vendor yang diterima.", data: schoolData, total: schoolData.reduce((sum, item) => sum + item.value, 0), centerLabel: "Penugasan", valueSuffix: "program" },
        RATING: { eyebrow: "Penilaian Program", title: "Rating Program", description: "Sebaran rating Program Vendor. Program tanpa rating tetap ditandai.", data: ratingData, total: filteredPrograms.length, centerLabel: "Program", valueSuffix: "program" },
    }[viewMode];

    const vendorName = getVendorName(currentVendor, title);

    if (loading) {
        return (
            <PageWrapper className="flex h-screen items-center justify-center bg-white">
                <div className="text-center">
                    <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-[#0AC4E0] border-t-transparent" />
                    <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Memuat Dashboard Vendor</p>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper className="flex h-screen overflow-hidden bg-[#F5FBFD] !p-0 font-sans text-slate-900">
            <Sidebar />
            <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <header className="shrink-0 border-b border-cyan-100 bg-white px-6 py-3.5">
                    <div className="flex items-center justify-between gap-5">
                        <div className="flex min-w-0 items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 text-lg font-black text-[#0AC4E0]">{vendorName.charAt(0).toUpperCase()}</div>
                            <div className="min-w-0">
                                <h1 className="truncate text-[22px] font-black tracking-tight text-slate-950">{vendorName}</h1>
                                <div className="mt-1.5 flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[8px] font-black uppercase tracking-wider text-emerald-700"><BadgeCheck size={11} /> Bermitra</span>
                                    <span className="rounded-full bg-cyan-50 px-3 py-1 text-[8px] font-black uppercase tracking-wider text-[#0AC4E0]">{currentVendor?.pilar || currentVendor?.kategori || "Vendor"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                            <Dropdown
                                value={yearFilter}
                                onChange={setYearFilter}
                                items={yearOptions}
                                placeholder="Semua Tahun"
                                label="Filter Tahun"
                                width="w-[170px]"
                            />
                            <Button text="Program" icon={<FolderOpen size={14} />} onClick={() => navigate(listPath)} className="!rounded-xl !border !border-cyan-100 !bg-white !px-4 !py-2.5 !text-[9px] !font-black !uppercase !tracking-wider !text-[#0AC4E0] !shadow-sm" />
                            <Button text="Refresh" icon={<RefreshCcw size={14} />} onClick={fetchDashboardData} className="!rounded-xl !bg-[#0AC4E0] !px-4 !py-2.5 !text-[9px] !font-black !uppercase !tracking-wider !text-white" />
                        </div>
                    </div>
                </header>

                <section className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-6 py-4">
                    <section className="shrink-0 overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white shadow-sm">
                        <div className="grid sm:grid-cols-2 xl:grid-cols-4">
                            <SummaryCard label="Program Vendor" value={filteredPrograms.length} helper="Sesuai filter aktif" icon={<Layers3 size={19} />} />
                            <SummaryCard label="Sekolah Terlibat" value={filteredSchoolIds.length} helper="Sekolah unik dalam Program" icon={<School size={19} />} tone="blue" />
                            <SummaryCard label="Program Selesai" value={completedCount} helper="Telah menyelesaikan proses" icon={<CheckCircle2 size={19} />} tone="emerald" />
                            <SummaryCard label="Rating Rata-rata" value={averageRating === "-" ? "-" : `${averageRating}/5`} helper={ratings.length ? `${ratings.length} Program telah dinilai` : "Belum ada rating Program"} icon={<Star size={19} />} tone="amber" />
                        </div>
                    </section>

                    <div className="grid min-h-0 flex-1 grid-cols-2 gap-3">
                        <DashboardPieCard eyebrow="Status Program" title="Tahapan Program Vendor" description="Status seluruh Program yang terkait dengan Vendor ini." data={statusData} total={filteredPrograms.length} centerLabel="Program" emptyText="Belum ada Program pada filter ini" />
                        <DashboardPieCard {...secondaryConfig} emptyText="Belum ada data pada filter ini" />
                    </div>

                    <section className="shrink-0 rounded-[1.35rem] border border-cyan-100 bg-white p-2.5 shadow-sm">
                        <div className="grid grid-cols-[150px_minmax(0,1.15fr)_minmax(0,0.9fr)_minmax(0,0.9fr)] items-center gap-2">
                            <div className="px-2">
                                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#0AC4E0]">Kontrol Data</p>
                                <p className="mt-1 text-[9px] font-bold text-slate-400">Klik untuk mengubah diagram.</p>
                            </div>

                            <ControlGroup
                                label="Pilar"
                                value={pillarFilter}
                                onChange={setPillarFilter}
                                items={[
                                    { value: "ALL", label: "Semua" },
                                    ...vendorPillarControls.map((pillar) => ({ value: pillar, label: pillar })),
                                ]}
                            />

                            <ControlGroup
                                label="Jenjang"
                                value={gradeFilter}
                                onChange={setGradeFilter}
                                items={[
                                    { value: "ALL", label: "Semua" },
                                    { value: "SD", label: "SD" },
                                    { value: "SMP", label: "SMP" },
                                    { value: "SMK", label: "SMK" },
                                ]}
                            />

                            <ControlGroup
                                label="Diagram Kanan"
                                value={viewMode}
                                onChange={setViewMode}
                                items={[
                                    { value: "PILLAR", label: "Pilar" },
                                    { value: "SCHOOL", label: "Sekolah" },
                                    { value: "RATING", label: "Rating" },
                                ]}
                            />
                        </div>
                    </section>
                </section>
            </main>
        </PageWrapper>
    );
}