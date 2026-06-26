/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Sidebar from "../../components/Sidebar";
import {
  AlertTriangle,
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Loader2,
  School,
  UsersRound,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_PALETTE, getChartPaletteColor } from "../../utils/chartPalette";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";
const COLORS = CHART_PALETTE;

const getChartColor = getChartPaletteColor;

const normalizeArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.result)) return payload.result;
  return [];
};

const getSekolahIdFromToken = (decoded) =>
  decoded?.id_sekolah ||
  decoded?.sekolah_id ||
  decoded?.school_id ||
  decoded?.sekolah?.id_sekolah ||
  decoded?.sekolah?.id ||
  decoded?.school?.id_sekolah ||
  decoded?.school?.id ||
  null;

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replaceAll("-", "_")
    .replaceAll(" ", "_");

const shortText = (value, max = 24) => {
  const text = String(value || "-");
  return text.length > max ? `${text.slice(0, max)}...` : text;
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  if (!amount) return "-";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const FILTER_OPTIONS = [
  { value: "ALL", label: "Semua Program", group: "Semua" },
  { value: "AKADEMIK", label: "Akademik", group: "Akademik" },
  { value: "KARAKTER", label: "Karakter", group: "Akademik" },
  { value: "SENI_BUDAYA", label: "Seni Budaya", group: "Non Akademik" },
  { value: "KECAKAPAN_HIDUP", label: "Kecakapan Hidup", group: "Non Akademik" },
];

const normalizeProgramCategory = (program = {}) => {
  const raw = normalizeText(
    program.pilar_program ||
    program.sub_kategori ||
    program.kategori_program ||
    program.jenis_program ||
    program.kategori ||
    "",
  );

  if (raw.includes("KARAKTER")) return "KARAKTER";
  if (raw.includes("SENI") || raw.includes("BUDAYA")) return "SENI_BUDAYA";
  if (raw.includes("KECAKAPAN") || raw.includes("HIDUP")) return "KECAKAPAN_HIDUP";
  if (raw.includes("NON")) return "NON_AKADEMIK";

  return "AKADEMIK";
};

const getProgramCategoryLabel = (program = {}) => {
  const category = normalizeProgramCategory(program);

  if (category === "KARAKTER") return "Karakter";
  if (category === "SENI_BUDAYA") return "Seni Budaya";
  if (category === "KECAKAPAN_HIDUP") return "Kecakapan Hidup";
  if (category === "NON_AKADEMIK") return "Non Akademik";

  return "Akademik";
};

const getProgramGroupLabel = (program = {}) => {
  const category = normalizeProgramCategory(program);

  if (["SENI_BUDAYA", "KECAKAPAN_HIDUP", "NON_AKADEMIK"].includes(category)) {
    return "Non Akademik";
  }

  return "Akademik";
};

const getProgramYear = (program = {}) => {
  return String(
    program.tahun ||
    program.year ||
    program.tanggal_mulai?.slice?.(0, 4) ||
    program.start_date?.slice?.(0, 4) ||
    "Tanpa Tahun",
  );
};

function EmptyChart({
  title = "Belum ada data",
  desc = "Data belum cukup untuk ditampilkan dalam grafik.",
}) {
  return (
    <div className="flex h-full min-h-[190px] items-center justify-center rounded-[1.35rem] border border-dashed border-slate-200 bg-slate-50/70 p-5 text-center">
      <div>
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm">
          <BarChart3 size={20} />
        </div>
        <p className="mt-3 text-sm font-black text-slate-700">{title}</p>
        <p className="mx-auto mt-1 max-w-xs text-xs font-semibold leading-relaxed text-slate-400">
          {desc}
        </p>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, helper, tone = "cyan" }) {
  const toneClass = {
    cyan: "bg-cyan-50 text-[#0AC4E0]",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  }[tone];

  return (
    <div className="group relative overflow-hidden rounded-[1.6rem] border border-slate-100 bg-white p-4 shadow-[0_14px_36px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
      <div className="pointer-events-none absolute -right-14 -top-14 h-32 w-32 rounded-full bg-[#0AC4E0]/5 blur-2xl transition-all group-hover:bg-[#0AC4E0]/10" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
            {label}
          </p>
          <p className="mt-1.5 text-3xl font-black leading-none text-slate-950">
            {value}
          </p>
          {helper && (
            <p className="mt-1.5 line-clamp-1 text-[11px] font-semibold leading-relaxed text-slate-400">
              {helper}
            </p>
          )}
        </div>

        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${toneClass}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function ChartPanel({ title, subtitle, children, className = "" }) {
  return (
    <section
      className={`rounded-[1.7rem] border border-slate-100 bg-white p-4 shadow-[0_14px_36px_rgba(15,23,42,0.04)] ${className}`}
    >
      <div className="mb-3">
        <p className="text-sm font-black text-slate-950">{title}</p>
        <p className="mt-1 line-clamp-1 text-[11px] font-semibold leading-relaxed text-slate-400">
          {subtitle}
        </p>
      </div>
      {children}
    </section>
  );
}

function ProgramRow({ program }) {
  const title = program.nama_program || program.nama || "-";
  const status = program.status_program || program.status || "Berjalan";
  const kategori = `${getProgramGroupLabel(program)} · ${getProgramCategoryLabel(program)}`;

  return (
    <div className="group rounded-[1.35rem] border border-slate-100 bg-white p-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-cyan-100 hover:shadow-[0_14px_36px_rgba(15,23,42,0.07)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="line-clamp-2 text-[13px] font-black leading-snug text-slate-950">
            {title}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-slate-400">
            {kategori} · {program.tahun || "-"}
          </p>
        </div>

        <span className="w-fit shrink-0 rounded-full bg-cyan-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-[#0AC4E0]">
          {status}
        </span>
      </div>

      <div className="mt-3 grid gap-2 text-[11px] font-bold text-slate-500 sm:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 px-3 py-2">
          <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
            Mulai
          </p>
          <p className="mt-1">{formatDate(program.tanggal_mulai || program.start_date)}</p>
        </div>

        <div className="rounded-2xl bg-slate-50 px-3 py-2">
          <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
            Selesai
          </p>
          <p className="mt-1">{formatDate(program.tanggal_selesai || program.end_date)}</p>
        </div>

        <div className="rounded-2xl bg-slate-50 px-3 py-2">
          <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
            Budget
          </p>
          <p className="mt-1 truncate">{formatCurrency(program.harga_vendor || program.budget)}</p>
        </div>
      </div>
    </div>
  );
}

function AssessmentTable({ assessments = [] }) {
  const PAGE_SIZE = 5;
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    return assessments.map((assessment, index) => {
      const expected = Number(assessment.guru_aktif || assessment.jumlah_guru || 0);
      const filled = Number(
        assessment.jumlah_pengisi ||
        assessment.total_responden ||
        assessment.total_pengisi ||
        0,
      );
      const missing = Math.max(expected - filled, 0);
      const percentage = expected > 0 ? Math.round((filled / expected) * 100) : 0;

      return {
        no: index + 1,
        id: assessment.id_assessment || assessment.id || index,
        nama: assessment.nama || assessment.judul || "Assessment",
        status: assessment.status || "-",
        aktif: assessment.aktif ? "Aktif" : "Tidak Aktif",
        expected,
        filled,
        missing,
        percentage,
      };
    });
  }, [assessments]);

  const totalPage = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPage);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const visibleRows = rows.slice(startIndex, startIndex + PAGE_SIZE);

  useEffect(() => {
    if (page > totalPage) {
      setPage(totalPage);
    }
  }, [page, totalPage]);

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm font-bold text-slate-400">
        Belum ada assessment untuk sekolah ini.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[1.4rem] border border-slate-100 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-[920px] w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest text-slate-400">
                No
              </th>
              <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest text-slate-400">
                Nama Assessment
              </th>
              <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest text-slate-400">
                Status
              </th>
              <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest text-slate-400">
                Aktif
              </th>
              <th className="px-4 py-3 text-center text-[9px] font-black uppercase tracking-widest text-slate-400">
                Guru
              </th>
              <th className="px-4 py-3 text-center text-[9px] font-black uppercase tracking-widest text-slate-400">
                Isi
              </th>
              <th className="px-4 py-3 text-center text-[9px] font-black uppercase tracking-widest text-slate-400">
                Belum
              </th>
              <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest text-slate-400">
                Progress
              </th>
            </tr>
          </thead>

          <tbody>
            {visibleRows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-slate-100 transition-colors last:border-b-0 hover:bg-cyan-50/40"
              >
                <td className="px-4 py-3 text-xs font-black text-slate-500">
                  {row.no}
                </td>

                <td className="px-4 py-3">
                  <p className="line-clamp-2 text-sm font-black text-slate-900">
                    {row.nama}
                  </p>
                </td>

                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full bg-cyan-50 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-[#0AC4E0]">
                    {row.status}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${row.aktif === "Aktif"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-slate-100 text-slate-400"
                      }`}
                  >
                    {row.aktif}
                  </span>
                </td>

                <td className="px-4 py-3 text-center text-sm font-black text-slate-700">
                  {row.expected}
                </td>

                <td className="px-4 py-3 text-center text-sm font-black text-[#0AC4E0]">
                  {row.filled}
                </td>

                <td className="px-4 py-3 text-center text-sm font-black text-amber-600">
                  {row.missing}
                </td>

                <td className="px-4 py-3">
                  <div className="flex min-w-[170px] items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-[#0AC4E0]"
                        style={{ width: `${Math.min(row.percentage, 100)}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs font-black text-slate-700">
                      {row.percentage}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length > PAGE_SIZE && (
        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Menampilkan {startIndex + 1} - {Math.min(startIndex + PAGE_SIZE, rows.length)} dari {rows.length} assessment
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="h-9 rounded-xl border border-slate-100 bg-white px-3 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all hover:border-cyan-100 hover:text-[#0AC4E0] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Prev
            </button>

            <div className="rounded-xl bg-white px-3 py-2 text-[10px] font-black text-slate-600 ring-1 ring-slate-100">
              {safePage} / {totalPage}
            </div>

            <button
              type="button"
              disabled={safePage >= totalPage}
              onClick={() => setPage((prev) => Math.min(totalPage, prev + 1))}
              className="h-9 rounded-xl border border-slate-100 bg-white px-3 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all hover:border-cyan-100 hover:text-[#0AC4E0] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterPanel({
  selectedCategory,
  setSelectedCategory,
  selectedYear,
  setSelectedYear,
  yearOptions,
  totalProgram,
  filteredTotal,
}) {
  return (
    <section className="mt-4 rounded-[1.7rem] border border-slate-100 bg-white p-4 shadow-[0_14px_36px_rgba(15,23,42,0.04)]">
      <div className="grid gap-4 2xl:grid-cols-[1fr_250px_170px] 2xl:items-end">
        <div className="min-w-0">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#0AC4E0]">
                Filter Program
              </p>
              <h2 className="mt-1 text-base font-black text-slate-950">
                Kategori dan Tahun Program
              </h2>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-2.5">
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                Ditampilkan
              </p>
              <p className="mt-0.5 text-sm font-black text-slate-900">
                {filteredTotal} dari {totalProgram} program
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {FILTER_OPTIONS.map((option) => {
              const active = selectedCategory === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedCategory(option.value)}
                  className={`rounded-full border px-3.5 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${active
                    ? "border-[#0AC4E0] bg-[#0AC4E0] text-white shadow-lg shadow-cyan-200"
                    : "border-slate-100 bg-slate-50 text-slate-400 hover:border-cyan-100 hover:bg-cyan-50 hover:text-[#0AC4E0]"
                    }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[8px] font-black uppercase tracking-widest text-slate-400">
            Tahun Program
          </p>

          <select
            value={selectedYear}
            onChange={(event) => setSelectedYear(event.target.value)}
            className="h-11 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm font-black text-slate-700 outline-none transition-all focus:border-[#0AC4E0] focus:bg-white focus:ring-4 focus:ring-cyan-100"
          >
            <option value="ALL">Semua Tahun</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedCategory("ALL");
            setSelectedYear("ALL");
          }}
          className="h-11 rounded-2xl border border-slate-100 bg-white px-4 text-[9px] font-black uppercase tracking-widest text-slate-400 transition-all hover:border-rose-100 hover:bg-rose-50 hover:text-rose-500"
        >
          Reset Filter
        </button>
      </div>
    </section>
  );
}

export default function DashboardKepalaSekolah() {
  const [loading, setLoading] = useState(true);
  const [sekolah, setSekolah] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [assessmentResults, setAssessmentResults] = useState([]);
  const [gurus, setGurus] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedYear, setSelectedYear] = useState("ALL");

  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem("token");
      const decoded = token ? jwtDecode(token) : null;
      const idSekolah = getSekolahIdFromToken(decoded);
      const idUser = decoded?.id_user || decoded?.sub || decoded?.id || "";

      if (!idSekolah) {
        setLoading(false);
        return;
      }

      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const [schoolRes, programRes, assessmentRes, guruRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/sekolah/${idSekolah}`, { headers }),
          axios.get(`${API_BASE_URL}/program/sekolah/${idSekolah}?id_user=${idUser}`, { headers }),
          axios.get(`${API_BASE_URL}/assessment/sekolah/${idSekolah}?id_user=${idUser}`, { headers }),
          axios
            .get(`${API_BASE_URL}/assessment-guru/sekolah/${idSekolah}/aktif`, { headers })
            .catch(() => ({ data: [] })),
        ]);

        const guruRows = normalizeArray(guruRes.data);
        const assessmentRowsRaw = normalizeArray(assessmentRes.data);

        const resultRows = await Promise.all(
          assessmentRowsRaw.slice(0, 8).map(async (assessment) => {
            try {
              const result = await axios.get(
                `${API_BASE_URL}/assessment/${assessment.id_assessment}/hasil`,
                { headers },
              );

              return {
                id_assessment: assessment.id_assessment,
                title: assessment.nama || assessment.judul || "Assessment",
                payload: result.data,
              };
            } catch {
              return {
                id_assessment: assessment.id_assessment,
                title: assessment.nama || assessment.judul || "Assessment",
                payload: null,
              };
            }
          }),
        );

        setSekolah(schoolRes.data?.data || schoolRes.data);
        setPrograms(normalizeArray(programRes.data));
        setGurus(guruRows);
        setAssessments(
          assessmentRowsRaw.map((item) => ({
            ...item,
            guru_aktif: guruRows.length,
          })),
        );
        setAssessmentResults(resultRows);
      } catch (error) {
        console.error("Gagal memuat dashboard kepala sekolah:", error);
        setSekolah(null);
        setPrograms([]);
        setAssessments([]);
        setAssessmentResults([]);
        setGurus([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const yearOptions = useMemo(() => {
    return Array.from(
      new Set(programs.map((program) => getProgramYear(program)).filter(Boolean)),
    ).sort((a, b) => Number(b) - Number(a));
  }, [programs]);

  const filteredPrograms = useMemo(() => {
    return programs.filter((program) => {
      const category = normalizeProgramCategory(program);
      const year = getProgramYear(program);

      const matchCategory =
        selectedCategory === "ALL" ||
        category === selectedCategory ||
        (selectedCategory === "AKADEMIK" && category === "AKADEMIK") ||
        (selectedCategory === "KARAKTER" && category === "KARAKTER") ||
        (selectedCategory === "SENI_BUDAYA" && category === "SENI_BUDAYA") ||
        (selectedCategory === "KECAKAPAN_HIDUP" && category === "KECAKAPAN_HIDUP");

      const matchYear = selectedYear === "ALL" || year === selectedYear;

      return matchCategory && matchYear;
    });
  }, [programs, selectedCategory, selectedYear]);

  const programComposition = useMemo(() => {
    const counter = new Map();

    filteredPrograms.forEach((program) => {
      const key = getProgramCategoryLabel(program);
      counter.set(key, (counter.get(key) || 0) + 1);
    });

    return Array.from(counter.entries()).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length],
    }));
  }, [filteredPrograms]);

  const programStatusRows = useMemo(() => {
    const counter = new Map();

    filteredPrograms.forEach((program) => {
      const key = program.status_program || program.status || "Berjalan";
      counter.set(key, (counter.get(key) || 0) + 1);
    });

    return Array.from(counter.entries()).map(([name, total]) => ({ name, total }));
  }, [filteredPrograms]);

  const programYearRows = useMemo(() => {
    const counter = new Map();

    filteredPrograms.forEach((program) => {
      const key = getProgramYear(program);
      counter.set(key, (counter.get(key) || 0) + 1);
    });

    return Array.from(counter.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => Number(a.name) - Number(b.name));
  }, [filteredPrograms]);

  const assessmentRows = useMemo(() => {
    return assessments.map((assessment) => {
      const expected = Number(assessment.guru_aktif || assessment.jumlah_guru || 0);
      const filled = Number(
        assessment.jumlah_pengisi ||
        assessment.total_responden ||
        assessment.total_pengisi ||
        0,
      );

      return {
        name: assessment.nama || assessment.judul || "Assessment",
        label: shortText(assessment.nama || assessment.judul || "Assessment", 22),
        filled,
        missing: Math.max(expected - filled, 0),
      };
    });
  }, [assessments]);

  const scoreRows = useMemo(() => {
    return assessmentResults.map((result) => {
      const payload = result.payload || {};
      const average =
        Number(payload.rata_rata_skor || payload.average_score || payload.average || 0) ||
        Number(payload.summary?.rata_rata_skor || payload.summary?.average_score || 0);

      return {
        name: result.title,
        label: shortText(result.title, 22),
        score: Number(Number(average || 0).toFixed(2)),
      };
    });
  }, [assessmentResults]);

  const totalFilled = assessmentRows.reduce((total, row) => total + row.filled, 0);
  const totalMissing = assessmentRows.reduce((total, row) => total + row.missing, 0);
  const hasAssessmentParticipation = assessmentRows.some((row) => row.filled > 0 || row.missing > 0);
  const hasScore = scoreRows.some((row) => row.score > 0);

  return (
    <div className="flex min-h-screen bg-[#F5FAFF] font-inter text-slate-900">
      <Sidebar />

      <main className="min-w-0 flex-1 p-3 sm:p-4 lg:p-5 xl:p-6">
        <div className="w-full max-w-none">
          <div className="relative overflow-hidden rounded-[1.8rem] border border-slate-100 bg-white p-4 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#0AC4E0]/10 blur-3xl" />

            <div className="relative grid gap-4 xl:grid-cols-[1fr_360px] xl:items-center">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-[#0AC4E0]">
                  <School size={26} />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0AC4E0]">
                    Dashboard Kepala Sekolah
                  </p>
                  <h1 className="mt-1 truncate text-2xl font-black text-slate-950 md:text-3xl">
                    {sekolah?.nama_sekolah || "Sekolah"}
                  </h1>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Ringkasan program, assessment, dan partisipasi guru di sekolah sendiri.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                    Jenjang
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-900">
                    {sekolah?.jenjang || "-"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                    Guru Aktif
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-900">
                    {gurus.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="mt-4 flex min-h-[420px] items-center justify-center rounded-3xl bg-white">
              <Loader2 className="h-10 w-10 animate-spin text-[#0AC4E0]" />
            </div>
          ) : (
            <>
              {gurus.length === 0 && (
                <div className="mt-4 flex gap-3 rounded-[1.5rem] border border-amber-100 bg-amber-50 p-4 text-amber-700">
                  <AlertTriangle size={20} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-black">Belum ada guru assessment aktif.</p>
                    <p className="mt-1 text-xs font-semibold leading-relaxed">
                      Karena guru aktif masih 0, grafik partisipasi assessment bisa terlihat kosong.
                      Tambahkan guru assessment aktif agar data “Sudah Mengisi” dan “Belum Mengisi” lebih bermakna.
                    </p>
                  </div>
                </div>
              )}

              <FilterPanel
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                yearOptions={yearOptions}
                totalProgram={programs.length}
                filteredTotal={filteredPrograms.length}
              />

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <MetricCard
                  icon={ClipboardList}
                  label="Program"
                  value={filteredPrograms.length}
                  helper={
                    selectedYear === "ALL"
                      ? "Program sesuai filter"
                      : `Program tahun ${selectedYear}`
                  }
                  tone="cyan"
                />
                <MetricCard
                  icon={BookOpenCheck}
                  label="Assessment"
                  value={assessments.length}
                  helper="Assessment aktif/sent"
                  tone="blue"
                />
                <MetricCard
                  icon={GraduationCap}
                  label="Guru Aktif"
                  value={gurus.length}
                  helper="Guru assessment aktif"
                  tone="green"
                />
                <MetricCard
                  icon={UsersRound}
                  label="Sudah Mengisi"
                  value={totalFilled}
                  helper="Total pengisi assessment"
                  tone="cyan"
                />
                <MetricCard
                  icon={AlertTriangle}
                  label="Belum Mengisi"
                  value={totalMissing}
                  helper="Guru perlu diingatkan"
                  tone="amber"
                />
              </div>

              <div className="mt-4 grid gap-5 xl:grid-cols-2">
                <ChartPanel
                  title="Partisipasi Assessment"
                  subtitle="Guru sudah dan belum mengisi."
                >
                  <div className="h-[340px]">
                    {!hasAssessmentParticipation ? (
                      <EmptyChart
                        title="Belum ada partisipasi"
                        desc="Assessment sudah ada, tetapi jumlah guru aktif atau data pengisi belum tersedia."
                      />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={assessmentRows}
                          layout="vertical"
                          margin={{ top: 8, right: 14, left: 4, bottom: 8 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                          <XAxis
                            type="number"
                            allowDecimals={false}
                            tick={{ fontSize: 10, fontWeight: 800, fill: "#64748B" }}
                          />
                          <YAxis
                            type="category"
                            dataKey="label"
                            width={112}
                            tick={{ fontSize: 10, fontWeight: 800, fill: "#64748B" }}
                          />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="filled" name="Sudah" fill={getChartColor(2)} radius={[0, 8, 8, 0]} />
                          <Bar dataKey="missing" name="Belum" fill={getChartColor(1)} radius={[0, 8, 8, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </ChartPanel>

                <ChartPanel title="Skor Assessment" subtitle="Rata-rata skor assessment.">
                  <div className="h-[340px]">
                    {!hasScore ? (
                      <EmptyChart
                        title="Skor belum tersedia"
                        desc="Data hasil assessment belum memiliki rata-rata skor."
                      />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={scoreRows}
                          layout="vertical"
                          margin={{ top: 8, right: 14, left: 4, bottom: 8 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                          <XAxis
                            type="number"
                            tick={{ fontSize: 10, fontWeight: 800, fill: "#64748B" }}
                          />
                          <YAxis
                            type="category"
                            dataKey="label"
                            width={112}
                            tick={{ fontSize: 10, fontWeight: 800, fill: "#64748B" }}
                          />
                          <Tooltip />
                          <Bar dataKey="score" name="Skor" fill={getChartColor(2)} radius={[0, 8, 8, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </ChartPanel>

                <div className="xl:col-span-2">
                  <div className="overflow-x-auto pb-2">
                    <div className="grid min-w-[1180px] grid-cols-3 gap-5">
                      <ChartPanel title="Komposisi Program" subtitle="Kategori program sekolah.">
                        <div className="h-[360px] overflow-x-auto">
                          <div className="h-full min-w-[360px]">
                            {programComposition.length === 0 ? (
                              <EmptyChart
                                title="Belum ada program"
                                desc="Program sekolah belum tersedia."
                              />
                            ) : (
                              <>
                                <ResponsiveContainer width="100%" height="82%">
                                  <PieChart>
                                    <Pie
                                      data={programComposition}
                                      dataKey="value"
                                      nameKey="name"
                                      innerRadius={70}
                                      outerRadius={118}
                                      paddingAngle={4}
                                    >
                                      {programComposition.map((row, index) => (
                                        <Cell key={row.name} fill={getChartColor(index)} />
                                      ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value} program`, "Total"]} />
                                  </PieChart>
                                </ResponsiveContainer>

                                <div className="flex flex-wrap justify-center gap-2">
                                  {programComposition.map((row, index) => (
                                    <div
                                      key={row.name}
                                      className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5 text-[10px] font-black text-slate-600"
                                    >
                                      <span
                                        className="h-2.5 w-2.5 rounded-full"
                                        style={{ backgroundColor: getChartColor(index) }}
                                      />
                                      <span>{row.name}</span>
                                      <span className="text-slate-400">({row.value})</span>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </ChartPanel>

                      <ChartPanel title="Status Program" subtitle="Sebaran status program.">
                        <div className="h-[360px] overflow-x-auto">
                          <div
                            className="h-full"
                            style={{
                              width: `${Math.max(440, programStatusRows.length * 140)}px`,
                            }}
                          >
                            {programStatusRows.length === 0 ? (
                              <EmptyChart title="Belum ada status" desc="Status program belum tersedia." />
                            ) : (
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={programStatusRows}
                                  margin={{ top: 18, right: 20, left: 0, bottom: 32 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                  <XAxis
                                    dataKey="name"
                                    interval={0}
                                    angle={-12}
                                    textAnchor="end"
                                    height={58}
                                    tick={{
                                      fontSize: 10,
                                      fontWeight: 800,
                                      fill: "#64748B",
                                    }}
                                  />
                                  <YAxis
                                    allowDecimals={false}
                                    tick={{
                                      fontSize: 10,
                                      fontWeight: 800,
                                      fill: "#64748B",
                                    }}
                                  />
                                  <Tooltip />
                                  <Bar dataKey="total" name="Program" radius={[10, 10, 0, 0]}>
                                    {programStatusRows.map((row, index) => (
                                      <Cell key={row.name} fill={getChartColor(index)} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            )}
                          </div>
                        </div>
                      </ChartPanel>

                      <ChartPanel title="Program per Tahun" subtitle="Jumlah program tahunan.">
                        <div className="h-[360px] overflow-x-auto">
                          <div
                            className="h-full"
                            style={{
                              width: `${Math.max(440, programYearRows.length * 130)}px`,
                            }}
                          >
                            {programYearRows.length === 0 ? (
                              <EmptyChart
                                title="Belum ada data tahun"
                                desc="Program belum memiliki field tahun."
                              />
                            ) : (
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={programYearRows}
                                  margin={{ top: 18, right: 20, left: 0, bottom: 24 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                  <XAxis
                                    dataKey="name"
                                    tick={{
                                      fontSize: 10,
                                      fontWeight: 800,
                                      fill: "#64748B",
                                    }}
                                  />
                                  <YAxis
                                    allowDecimals={false}
                                    tick={{
                                      fontSize: 10,
                                      fontWeight: 800,
                                      fill: "#64748B",
                                    }}
                                  />
                                  <Tooltip />
                                  <Bar dataKey="total" name="Program" radius={[10, 10, 0, 0]}>
                                    {programYearRows.map((row, index) => (
                                      <Cell key={row.name} fill={getChartColor(index)} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            )}
                          </div>
                        </div>
                      </ChartPanel>
                    </div>
                  </div>
                </div>
              </div>
              <section className="mt-4 rounded-[1.7rem] border border-slate-100 bg-white p-4 shadow-[0_14px_36px_rgba(15,23,42,0.04)]">
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <CheckCircle2 size={19} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-950">Assessment Sekolah</p>
                      <p className="text-xs font-semibold text-slate-400">
                        Progress pengisian assessment guru ditampilkan dalam bentuk tabel.
                      </p>
                    </div>
                  </div>

                  <span className="w-fit rounded-full bg-emerald-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                    {assessments.length} Assessment
                  </span>
                </div>

                <AssessmentTable assessments={assessments} />
              </section>
              <section className="mt-4 rounded-[1.7rem] border border-slate-100 bg-white p-4 shadow-[0_14px_36px_rgba(15,23,42,0.04)]">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-black text-slate-950">Catatan Monitoring</p>
                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      Fokus kepala sekolah: pantau program berjalan, pastikan guru aktif, dan dorong pengisian assessment.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#0AC4E0]">
                      <CalendarDays size={13} />
                      {filteredPrograms.length} Program
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                      <CheckCircle2 size={13} />
                      {assessments.length} Assessment
                    </span>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
