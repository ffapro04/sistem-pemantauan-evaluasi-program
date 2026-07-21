/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import {
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

import {
    ArrowLeft,
    Users,
    CheckCircle2,
    Clock,
    BarChart3,
    ChevronLeft,
    ChevronRight,
    Eye,
    UserCheck,
    Activity,
    ShieldCheck,
    TrendingUp,
    CalendarDays,
    Building2,
    Radio,
    DatabaseZap,
    Download,
} from "lucide-react";

import {
    Sidebar,
    PageWrapper,
    Card,
    Button,
    Table,
    Pagination,
    StatCard,
    ProgressCard,
    ProfileList,
    EmptyState,
    DetailModal,
} from "../common";

import { canHoAccessSchool } from "../../utils/hoAccess";
import { CHART_STATUS_COLORS } from "../../utils/chartPalette";
import { exportAssessmentResultWorkbook } from "../../utils/assessmentExcelExport";

const DEFAULT_API_BASE = "";
const loadXlsx = async () => import("xlsx");
const ANSWER_CHART_COLORS = ["#FF0052", "#FFD400", "#00C68D", "#0055DA"];

const ASSESSMENT_PILAR_OPTIONS = {
    akademik: [
        { value: "AKADEMIK", label: "Akademik", tone: "border-slate-200 bg-white text-slate-700" },
        { value: "KARAKTER", label: "Karakter", tone: "border-slate-300 bg-slate-100 text-slate-700" },
    ],
    "non-akademik": [
        { value: "SENI_BUDAYA", label: "Seni Budaya", tone: "border-[#D8B98C]/50 bg-[#F4E6D0] text-[#8A5A2B]" },
        { value: "KECAKAPAN_HIDUP", label: "Kecakapan Hidup", tone: "border-[#A47551]/50 bg-[#E7D0BA] text-[#5C3A21]" },
    ],
};

const normalizeJenisAssessment = (value) =>
    String(value || "")
        .trim()
        .toLowerCase()
        .replaceAll("_", "-");

const getPilarOptions = (jenisAssessment) =>
    ASSESSMENT_PILAR_OPTIONS[normalizeJenisAssessment(jenisAssessment)] ||
    ASSESSMENT_PILAR_OPTIONS.akademik;

const getDefaultPilar = (jenisAssessment) => getPilarOptions(jenisAssessment)[0]?.value || "AKADEMIK";

const normalizePilarValue = (value) => {
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
};

const getAssessmentPilarValue = (assessment, jenisAssessment) => {
    const explicit = normalizePilarValue(
        assessment?.pilar ||
        assessment?.pillar ||
        assessment?.pilar_assessment ||
        assessment?.pilarAssessment ||
        assessment?.pilar_program ||
        assessment?.program?.pilar ||
        assessment?.program?.pilar_program,
    );

    if (explicit) return explicit;

    return getDefaultPilar(assessment?.jenis || jenisAssessment);
};

const getPilarLabel = (value) => {
    const options = [
        ...ASSESSMENT_PILAR_OPTIONS.akademik,
        ...ASSESSMENT_PILAR_OPTIONS["non-akademik"],
    ];

    const normalizedValue = normalizePilarValue(value);

    return options.find((item) => item.value === normalizedValue)?.label || "Belum Dipilih";
};

const getPilarTone = (value) => {
    const options = [
        ...ASSESSMENT_PILAR_OPTIONS.akademik,
        ...ASSESSMENT_PILAR_OPTIONS["non-akademik"],
    ];

    const normalizedValue = normalizePilarValue(value);

    return options.find((item) => item.value === normalizedValue)?.tone || "border-slate-100 bg-slate-50 text-slate-500";
};


const getToken = () => localStorage.getItem("token");

const toArray = (value) => (Array.isArray(value) ? value : []);

const getQuestionId = (question) =>
    question?.id_pertanyaan ?? question?.id ?? question?.question_id ?? null;

const getQuestionText = (question) =>
    question?.teks ||
    question?.question ||
    question?.pertanyaan ||
    question?.nama_pertanyaan ||
    "Belum ada pertanyaan";

const getQuestionOptions = (question) => {
    const rawOptions =
        question?.pilihan ||
        question?.options ||
        question?.opsi ||
        question?.jawaban_opsi ||
        [];

    if (!Array.isArray(rawOptions)) return [];

    return rawOptions.map((option) => {
        if (typeof option === "string") return option;

        return (
            option?.label ||
            option?.teks ||
            option?.option ||
            option?.jawaban ||
            "-"
        );
    });
};

const getAnswerForQuestion = (pengisi, questionId) => {
    const answers = Array.isArray(pengisi?.jawaban) ? pengisi.jawaban : [];

    return answers.find(
        (item) =>
            item?.id_pertanyaan === questionId ||
            item?.question_id === questionId ||
            item?.id === questionId,
    );
};

const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const getDeadlineInfo = (deadline) => {
    if (!deadline) {
        return {
            label: "-",
            status: "Belum diset",
            variant: "neutral",
        };
    }

    const targetDate = new Date(deadline);

    if (Number.isNaN(targetDate.getTime())) {
        return {
            label: "-",
            status: "Belum valid",
            variant: "neutral",
        };
    }

    const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate(),
    );

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
        return {
            label: `${diffDays} Hari Lagi`,
            status: "Proses Aktif",
            variant: "primary",
        };
    }

    if (diffDays === 0) {
        return {
            label: "Hari Ini",
            status: "Batas Akhir",
            variant: "warning",
        };
    }

    return {
        label: "Tenggat Habis",
        status: "Expired",
        variant: "danger",
    };
};

const getCurrentHoIdFromToken = () => {
    const token = getToken();

    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload?.sub || payload?.id_user || payload?.id || null;
    } catch {
        return null;
    }
};

const normalizeArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.result)) return payload.result;
    if (Array.isArray(payload?.sekolah)) return payload.sekolah;
    if (Array.isArray(payload?.schools)) return payload.schools;
    return [];
};

const getSchoolIdentity = (school) => ({
    id: String(school?.id_sekolah || school?.id || "").trim(),
    name: String(
        school?.nama_sekolah ||
        school?.nama ||
        school?.sekolah ||
        school?.nama_sekolah_target ||
        "",
    )
        .trim()
        .toLowerCase(),
});

const canAccessAssessmentResult = (assessmentResult, currentHo, allSchools = []) => {
    if (!currentHo) return true;

    const profileSchools = toArray(assessmentResult?.sekolah_profile);

    if (profileSchools.length === 0) return true;

    const hasJenjangInProfile = profileSchools.some(
        (school) =>
            school?.jenjang ||
            school?.tingkat ||
            school?.jenjang_sekolah ||
            school?.bentuk_pendidikan,
    );

    if (hasJenjangInProfile) {
        return profileSchools.some((school) =>
            canHoAccessSchool(currentHo, school),
        );
    }

    const profileIds = profileSchools
        .map((school) => getSchoolIdentity(school).id)
        .filter(Boolean);

    const profileNames = profileSchools
        .map((school) => getSchoolIdentity(school).name)
        .filter(Boolean);

    const relatedSchools = allSchools.filter((school) => {
        const identity = getSchoolIdentity(school);

        return (
            profileIds.includes(identity.id) ||
            profileNames.includes(identity.name)
        );
    });

    if (relatedSchools.length === 0) return true;

    return relatedSchools.some((school) => canHoAccessSchool(currentHo, school));
};

function AssessmentDetailBase({
    type = "akademik",
    jenisAssessment = type,
    label = "Akademik",
    basePath = "/ho/assessment/akademik",
    headerEyebrow = "Assessment Dashboard",
    title = "Hasil Assessment Akademik",
    apiBase = DEFAULT_API_BASE,
}) {

    const navigate = useNavigate();
    const { id } = useParams();

    const [loading, setLoading] = useState(true);
    const [assessment, setAssessment] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [selectedPengisi, setSelectedPengisi] = useState(null);

    const [pagePengisi, setPagePengisi] = useState(1);
    const limitPengisi = 5;

    useEffect(() => {
        const fetchDetailHasil = async () => {
            try {
                setLoading(true);
                setErrorMessage("");

                const token = getToken();

                if (!token) {
                    navigate("/login");
                    return;
                }

                const hoId = getCurrentHoIdFromToken();

                const [res, resSchools, resHo] = await Promise.all([
                    fetch(`${apiBase}/assessment/${id}/hasil?_ts=${Date.now()}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Cache-Control": "no-store",
                            Pragma: "no-cache",
                        },
                        cache: "no-store",
                    }),

                    fetch(`${apiBase}/sekolah`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),

                    hoId
                        ? fetch(`${apiBase}/users/${hoId}`, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        })
                        : Promise.resolve(null),
                ]);

                const data = await res.json().catch(() => ({}));
                const schoolPayload = await resSchools.json().catch(() => ({}));
                const hoPayload = resHo ? await resHo.json().catch(() => ({})) : null;

                if (!res.ok) {
                    throw new Error(data?.message || "Gagal mengambil hasil assessment");
                }

                const currentHo = hoPayload?.data || hoPayload || null;
                const allSchools = normalizeArray(schoolPayload);

                const allowed = canAccessAssessmentResult(data, currentHo, allSchools);

                if (!allowed) {
                    toast.error("Kamu tidak punya akses untuk melihat detail assessment ini.");
                    navigate(basePath);
                    return;
                }

                setAssessment({
                    ...data,
                    pertanyaan: toArray(data?.pertanyaan),
                    pengisi: toArray(data?.pengisi),
                    sekolah_profile: toArray(data?.sekolah_profile),
                });
            } catch (error) {
                console.error("Gagal mengambil detail hasil assessment:", error);

                setAssessment(null);
                setErrorMessage(
                    error?.message ||
                    "Terjadi kesalahan saat mengambil data hasil assessment.",
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDetailHasil();
    }, [apiBase, id, navigate, basePath]);

    const questions = assessment?.pertanyaan || [];
    const resolvedJenisAssessment = assessment?.jenis || jenisAssessment || type || "akademik";
    const assessmentPilar = getAssessmentPilarValue(assessment, resolvedJenisAssessment);
    const respondents = assessment?.pengisi || [];
    const schools = assessment?.sekolah_profile || [];
    const activeQuestion = questions[activeQuestionIndex] || null;

    const currentPengisi = respondents.slice(
        (pagePengisi - 1) * limitPengisi,
        pagePengisi * limitPengisi,
    );

    const totalPagesPengisi = Math.ceil(respondents.length / limitPengisi) || 1;

    useEffect(() => {
        if (activeQuestionIndex > questions.length - 1) {
            setActiveQuestionIndex(0);
        }
    }, [questions.length, activeQuestionIndex]);

    useEffect(() => {
        if (pagePengisi > totalPagesPengisi) {
            setPagePengisi(totalPagesPengisi);
        }
    }, [pagePengisi, totalPagesPengisi]);

    const deadlineInfo = useMemo(
        () => getDeadlineInfo(assessment?.deadline),
        [assessment],
    );

    const completionRate = useMemo(() => {
        const total = Number(assessment?.total_responden || 0);

        if (!total) return 0;

        return Math.min(Math.round((respondents.length / total) * 100), 100);
    }, [assessment, respondents]);

    const chartData = useMemo(() => {
        if (!activeQuestion) return [];

        const questionId = getQuestionId(activeQuestion);
        const pilihan = getQuestionOptions(activeQuestion);

        return pilihan.map((opsi, index) => {
            const jumlah = respondents.filter((pengisi) => {
                const jawaban = getAnswerForQuestion(pengisi, questionId);

                return jawaban?.jawaban === opsi;
            }).length;

            const persentase =
                respondents.length > 0
                    ? Math.round((jumlah / respondents.length) * 100)
                    : 0;

            return {
                jawaban: opsi,
                jumlah,
                persentase,
                color: ANSWER_CHART_COLORS[index % ANSWER_CHART_COLORS.length],
            };
        });
    }, [respondents, activeQuestion]);

    const tableColumns = [
        {
            header: "No.",
            align: "text-center w-16",
            render: (_, idx) => (
                <span className="text-[11px] font-mono font-bold text-slate-400">
                    {String((pagePengisi - 1) * limitPengisi + idx + 1).padStart(2, "0")}
                </span>
            ),
        },
        {
            header: "Identitas Pengisi",
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#0AC4E0]/20 bg-[#0AC4E0]/10 text-[#0AC4E0]">
                        <UserCheck size={15} />
                    </div>

                    <div className="text-left leading-none">
                        <p className="text-[13px] font-bold uppercase tracking-tight text-[#083344]">
                            {row.nama || "-"}
                        </p>

                        <p className="mt-1.5 text-[10px] font-medium text-slate-400">
                            Partisipan Terverifikasi
                        </p>
                    </div>
                </div>
            ),
        },
        {
            header: "Asal Sekolah",
            render: (row) => (
                <div className="flex items-center gap-2">
                    <Building2 size={13} className="shrink-0 text-slate-300" />

                    <p className="text-[12px] font-semibold uppercase tracking-tight text-slate-600">
                        {row.sekolah || "-"}
                    </p>
                </div>
            ),
        },
        {
            header: "Tanggal Submit",
            align: "text-center",
            render: (row) => (
                <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1.5">
                        <CalendarDays size={11} className="text-[#0AC4E0]" />

                        <span className="text-[12px] font-bold text-[#083344]">
                            {formatDate(row.tanggal_mengisi)}
                        </span>
                    </div>

                    <span className="text-[9px] font-medium uppercase tracking-widest text-slate-400">
                        Waktu Submit
                    </span>
                </div>
            ),
        },
        {
            header: "Detail",
            align: "text-center w-20",
            render: (row) => (
                <button
                    type="button"
                    onClick={() => setSelectedPengisi(row)}
                    className="mx-auto flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-500 transition-all hover:border-[#0AC4E0] hover:bg-[#0AC4E0]/5 hover:text-[#0AC4E0]"
                >
                    <Eye size={13} /> Lihat
                </button>
            ),
        },
    ];

    const handlePrevQuestion = () => {
        setActiveQuestionIndex((prev) => Math.max(prev - 1, 0));
    };

    const handleNextQuestion = () => {
        setActiveQuestionIndex((prev) =>
            Math.min(prev + 1, Math.max(questions.length - 1, 0)),
        );
    };

    const handleExport = async () => {
        if (!assessment) {
            toast.error("Data assessment belum siap diexport.");
            return;
        }

        const XLSX = await loadXlsx();
        exportAssessmentResultWorkbook(
            XLSX,
            {
                ...assessment,
                pilar: assessmentPilar,
                pertanyaan: questions,
                pengisi: respondents,
                sekolah_profile: schools,
            },
            {
                id,
                fileName:
                    assessment?.nama_assessment ||
                    assessment?.nama ||
                    `assessment-${id}`,
            },
        );
    };

    if (loading) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-3 bg-[#FBFDFF]">
                <Activity className="animate-spin text-[#0AC4E0]" size={32} />

                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Memuat Data...
                </p>
            </div>
        );
    }

    if (!assessment) {
        return (
            <PageWrapper className="h-screen w-screen overflow-hidden bg-[#F5F9FC] !p-0 font-sans text-[#083344]">
                <div className="flex h-screen w-screen overflow-hidden">
                    <Sidebar />

                    <main className="flex flex-1 items-center justify-center bg-[#F5F9FC]">
                        <div className="w-[520px] rounded-2xl border border-red-100 bg-red-50 px-10 py-8 text-center shadow-sm">
                            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-red-500 shadow-sm">
                                <DatabaseZap size={30} />
                            </div>

                            <h2 className="text-xl font-black tracking-tight text-red-500">
                                Data hasil assessment gagal dimuat
                            </h2>

                            <p className="mt-3 text-sm font-semibold leading-relaxed text-red-400">
                                {errorMessage ||
                                    "Backend belum berhasil mengembalikan data hasil assessment."}
                            </p>

                            <Button
                                text="Kembali"
                                icon={<ArrowLeft size={16} />}
                                onClick={() => navigate(-1)}
                                className="mt-6 !rounded-xl !bg-[#083344] !px-6 !py-3 !text-sm !font-bold !text-[#0AC4E0] hover:!bg-[#0AC4E0] hover:!text-white"
                            />
                        </div>
                    </main>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper className="h-screen w-screen overflow-hidden bg-[#F5F9FC] !p-0 font-sans text-[#083344] leading-none">
            <div className="flex h-screen w-screen overflow-hidden">
                <Sidebar />

                <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
                    <header className="relative z-20 flex h-[76px] shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-8 shadow-sm">
                        <div className="flex items-center gap-5">
                            <Button
                                text="Kembali"
                                icon={<ArrowLeft size={14} />}
                                variant="outline"
                                onClick={() => navigate(basePath)}
                                className="!rounded-xl !border !border-slate-200 !px-4 !py-2 !text-xs !font-semibold !text-slate-600 hover:!border-[#0AC4E0] hover:!bg-[#0AC4E0]/5 hover:!text-[#0AC4E0]"
                            />

                            <div className="h-6 w-px bg-slate-200" />

                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#083344]">
                                    <BarChart3 size={16} className="text-[#0AC4E0]" />
                                </div>

                                <div>
                                    <div className="mb-0.5 flex items-center gap-2">
                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                                            {headerEyebrow}
                                        </p>

                                        <span className="flex h-1.5 w-1.5 animate-pulse rounded-full bg-[#0AC4E0]" />
                                    </div>

                                    <h1 className="text-[18px] font-black leading-none tracking-tight text-[#083344]">
                                        Analisis <span className="text-[#0AC4E0]">{title}</span>
                                    </h1>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={handleExport}
                                className="hidden items-center gap-2 rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#0AC4E0] transition-all hover:bg-[#0AC4E0] hover:text-white md:flex"
                            >
                                <Download size={14} />
                                Download Hasil
                            </button>

                            <div className="hidden text-right lg:block">
                                <p className="mb-1 text-[9px] font-semibold uppercase tracking-widest text-slate-400">
                                    Nama Assessment
                                </p>

                                <p className="max-w-[260px] truncate text-[12px] font-bold uppercase text-[#083344]">
                                    {assessment?.nama_assessment || "-"}
                                </p>
                            </div>

                            <div className="h-8 w-px bg-slate-200" />

                            <div className="flex items-center gap-2 rounded-xl bg-[#083344] px-4 py-2.5">
                                <ShieldCheck size={14} className="text-[#0AC4E0]" />

                                <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                                    {getPilarLabel(assessmentPilar) || label}
                                </span>

                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#0AC4E0]" />
                            </div>
                        </div>
                    </header>

                    <div
                        className="custom-scrollbar min-h-0 flex-1 overflow-y-auto"
                        style={{
                            background:
                                "linear-gradient(160deg, #F0F8FC 0%, #F5F9FC 50%, #EEF6FA 100%)",
                        }}
                    >
                        <div className="mx-auto flex max-w-[1600px] flex-col gap-5 p-6 pb-10">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                                <StatCard
                                    icon={<Users size={18} />}
                                    label="Target Responden"
                                    value={assessment?.total_responden || 0}
                                    desc="Total yang ditargetkan"
                                    color="#0AC4E0"
                                />

                                <StatCard
                                    icon={<ShieldCheck size={18} />}
                                    label="Pilar"
                                    value={getPilarLabel(assessmentPilar)}
                                    desc={label}
                                    color="#64748B"
                                />

                                <StatCard
                                    icon={<CheckCircle2 size={18} />}
                                    label="Laporan Masuk"
                                    value={respondents.length}
                                    desc="Data terverifikasi"
                                    color="#10B981"
                                />

                                <ProgressCard
                                    label="Completion Rate"
                                    rate={completionRate}
                                    current={respondents.length}
                                    total={assessment?.total_responden || 0}
                                    desc={`${respondents.length} / ${assessment?.total_responden || 0
                                        } responden`}
                                />

                                <StatCard
                                    icon={<Clock size={18} />}
                                    label="Sisa Waktu"
                                    value={deadlineInfo.label}
                                    desc={deadlineInfo.status}
                                    color={
                                        deadlineInfo.variant === "danger"
                                            ? "#EF4444"
                                            : deadlineInfo.variant === "warning"
                                                ? "#F59E0B"
                                                : "#0AC4E0"
                                    }
                                />
                            </div>

                            <div className="grid grid-cols-12 gap-5">
                                <Card className="col-span-12 !m-0 flex flex-col !rounded-2xl !border !border-slate-200/80 !bg-white !p-5 shadow-sm sm:!p-6">
                                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0 flex-1 pr-4">
                                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#083344] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#0AC4E0]">
                                                    <Radio size={9} className="animate-pulse" />
                                                    Soal{" "}
                                                    {questions.length > 0 ? activeQuestionIndex + 1 : 0}{" "}
                                                    dari {questions.length}
                                                </span>

                                                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                                    {getPilarLabel(assessmentPilar) || label}
                                                </span>
                                            </div>

                                            <h2 className="line-clamp-2 text-[15px] font-bold leading-snug tracking-tight text-[#083344] sm:text-[16px]">
                                                {activeQuestion
                                                    ? getQuestionText(activeQuestion)
                                                    : "Belum ada pertanyaan"}
                                            </h2>
                                        </div>

                                        <div className="flex shrink-0 gap-2">
                                            <button
                                                type="button"
                                                onClick={handlePrevQuestion}
                                                disabled={
                                                    activeQuestionIndex === 0 || questions.length === 0
                                                }
                                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white transition-all hover:border-[#0AC4E0] hover:bg-[#0AC4E0]/5 hover:text-[#0AC4E0] disabled:cursor-not-allowed disabled:opacity-25"
                                            >
                                                <ChevronLeft size={18} />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleNextQuestion}
                                                disabled={
                                                    questions.length === 0 ||
                                                    activeQuestionIndex === questions.length - 1
                                                }
                                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white transition-all hover:border-[#0AC4E0] hover:bg-[#0AC4E0]/5 hover:text-[#0AC4E0] disabled:cursor-not-allowed disabled:opacity-25"
                                            >
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mb-4 flex max-h-10 flex-wrap gap-1.5 overflow-y-auto pr-1">
                                        {questions.map((_, i) => (
                                            <button
                                                type="button"
                                                key={i}
                                                onClick={() => setActiveQuestionIndex(i)}
                                                className={`h-1.5 rounded-full transition-all duration-300 ${i === activeQuestionIndex
                                                    ? "w-6 bg-[#0AC4E0]"
                                                    : "w-1.5 bg-slate-200 hover:bg-slate-300"
                                                    }`}
                                            />
                                        ))}
                                    </div>

                                    {questions.length > 0 ? (
                                        <div className="flex flex-col gap-4 xl:flex-row xl:items-stretch">
                                            <div className="h-[220px] min-w-0 flex-1 sm:h-[240px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart
                                                        data={chartData}
                                                        margin={{ left: -20, right: 8 }}
                                                    >
                                                        <defs>
                                                            <linearGradient
                                                                id={`barGrad-${type}`}
                                                                x1="0"
                                                                y1="0"
                                                                x2="0"
                                                                y2="1"
                                                            >
                                                                <stop offset="0%" stopColor={CHART_STATUS_COLORS.info} />
                                                                <stop offset="100%" stopColor={CHART_STATUS_COLORS.deep} />
                                                            </linearGradient>
                                                        </defs>

                                                        <CartesianGrid
                                                            vertical={false}
                                                            stroke="#F1F5F9"
                                                            strokeDasharray="3 3"
                                                        />

                                                        <XAxis
                                                            dataKey="jawaban"
                                                            tick={{
                                                                fontSize: 11,
                                                                fontWeight: 600,
                                                                fill: "#94a3b8",
                                                            }}
                                                            axisLine={false}
                                                            tickLine={false}
                                                        />

                                                        <YAxis
                                                            allowDecimals={false}
                                                            tick={{
                                                                fontSize: 11,
                                                                fontWeight: 600,
                                                                fill: "#94a3b8",
                                                            }}
                                                            axisLine={false}
                                                            tickLine={false}
                                                        />

                                                        <Tooltip
                                                            cursor={{
                                                                fill: "rgba(0,85,218,0.05)",
                                                                radius: 8,
                                                            }}
                                                            contentStyle={{
                                                                borderRadius: "14px",
                                                                border: "1px solid #E2E8F0",
                                                                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                                                                fontSize: "12px",
                                                            }}
                                                        />

                                                        <Bar
                                                            dataKey="jumlah"
                                                            radius={[8, 8, 0, 0]}
                                                            barSize={44}
                                                        >
                                                            {chartData.map((entry, index) => (
                                                                <Cell
                                                                    key={`answer-bar-${entry.jawaban}-${index}`}
                                                                    fill={entry.color}
                                                                />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>

                                            <div className="custom-scrollbar flex max-h-[240px] w-full flex-col gap-1 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50/50 p-3 xl:w-72">
                                                <p className="mb-2 shrink-0 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                                                    Distribusi Jawaban
                                                </p>

                                                {chartData.map((item, i) => (
                                                    <div
                                                        key={i}
                                                        className="group border-b border-slate-50 py-3 last:border-0"
                                                    >
                                                        <div className="mb-1.5 flex items-center justify-between">
                                                            <span className="flex min-w-0 flex-1 items-center gap-2 pr-2 text-[11px] font-semibold text-slate-600 transition-colors group-hover:text-[#0AC4E0]">
                                                                <span
                                                                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                                                                    style={{ backgroundColor: item.color }}
                                                                />
                                                                <span className="truncate">{item.jawaban}</span>
                                                            </span>

                                                            <div className="flex shrink-0 items-center gap-2">
                                                                <span className="text-[10px] font-medium text-slate-400">
                                                                    {item.jumlah}x
                                                                </span>

                                                                <span className="min-w-[36px] text-right text-[12px] font-black text-[#0AC4E0]">
                                                                    {item.persentase}%
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                                                            <div
                                                                className="h-full rounded-full transition-all duration-700"
                                                                style={{
                                                                    width: `${item.persentase}%`,
                                                                    backgroundColor: item.color,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <EmptyState
                                            icon={<BarChart3 size={34} />}
                                            title="Belum Ada Pertanyaan"
                                            description="Assessment ini belum memiliki pertanyaan untuk dianalisis."
                                        />
                                    )}
                                </Card>

                            </div>

                            <Card className="!m-0 flex flex-col overflow-hidden !rounded-2xl !border !border-slate-200/80 !bg-white shadow-sm">
                                <div className="flex items-center justify-between border-b border-slate-100 px-8 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-xl border border-[#0AC4E0]/20 bg-[#0AC4E0]/10 p-2 text-[#0AC4E0]">
                                            <ShieldCheck size={16} />
                                        </div>

                                        <div>
                                            <h3 className="text-[13px] font-bold uppercase tracking-tight text-[#083344]">
                                                Data Partisipan Assessment
                                            </h3>

                                            <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                                                Seluruh responden yang telah mengisi
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2">
                                        <TrendingUp size={13} className="text-[#0AC4E0]" />

                                        <span className="text-[11px] font-bold text-slate-600">
                                            {respondents.length} Responden
                                        </span>
                                    </div>
                                </div>

                                <div className="min-h-[320px] overflow-x-auto">
                                    {respondents.length > 0 ? (
                                        <Table columns={tableColumns} data={currentPengisi} />
                                    ) : (
                                        <EmptyState
                                            icon={<UserCheck size={34} />}
                                            title="Belum Ada Partisipan"
                                            description="Nama pengisi akan muncul setelah sekolah mengirim jawaban assessment."
                                        />
                                    )}
                                </div>

                                {respondents.length > 0 && (
                                    <div className="flex items-center border-t border-slate-100 bg-slate-50/50 px-8 py-4">
                                        <Pagination
                                            currentPage={pagePengisi}
                                            totalPages={totalPagesPengisi}
                                            totalItems={respondents.length}
                                            itemsPerPage={limitPengisi}
                                            onPageChange={setPagePengisi}
                                        />
                                    </div>
                                )}
                            </Card>
                        </div>
                    </div>
                </main>
            </div>

            <DetailModal
                open={!!selectedPengisi}
                onClose={() => setSelectedPengisi(null)}
                icon={<UserCheck size={20} className="text-[#0AC4E0]" />}
                eyebrow="Detail Jawaban Partisipan"
                title={selectedPengisi?.nama || "-"}
                subtitle={selectedPengisi?.sekolah || "-"}
                footerLeft={`${questions.length} pertanyaan · ${selectedPengisi?.jawaban?.length || 0
                    } dijawab`}
            >
                <AnswerDetailContent pengisi={selectedPengisi} pertanyaan={questions} />
            </DetailModal>

            <AssessmentDetailStyle />
        </PageWrapper>
    );
}

function AnswerDetailContent({ pengisi, pertanyaan }) {
    const safeJawaban = Array.isArray(pengisi?.jawaban) ? pengisi.jawaban : [];

    if (!pengisi) return null;

    if (pertanyaan.length === 0) {
        return (
            <EmptyState
                icon={<UserCheck size={34} />}
                title="Belum Ada Detail Jawaban"
                description="Data pertanyaan atau jawaban belum tersedia."
            />
        );
    }

    return (
        <div className="space-y-4">
            {pertanyaan.map((soal, index) => {
                const questionId = getQuestionId(soal);
                const jawaban = safeJawaban.find(
                    (item) =>
                        item.id_pertanyaan === questionId ||
                        item.question_id === questionId ||
                        item.id === questionId,
                );

                return (
                    <div
                        key={questionId || index}
                        className="rounded-xl border border-slate-200/80 bg-white p-6 text-left shadow-sm transition-colors hover:border-[#0AC4E0]/30"
                    >
                        <div className="mb-4 flex gap-4">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#083344] text-[11px] font-black text-[#0AC4E0] shadow">
                                {String(index + 1).padStart(2, "0")}
                            </span>

                            <h3 className="pt-0.5 text-[14px] font-semibold leading-snug text-[#083344]">
                                {getQuestionText(soal)}
                            </h3>
                        </div>

                        <div className="mb-4">
                            <span className="inline-flex rounded-xl bg-[#0AC4E0] px-4 py-2 text-[12px] font-bold text-white shadow-sm shadow-cyan-200">
                                {jawaban?.jawaban || "N/A"}
                            </span>
                        </div>

                        <div className="rounded-xl border-l-2 border-[#0AC4E0]/40 bg-slate-50 p-4">
                            <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-[#0AC4E0]">
                                Komentar
                            </p>

                            <p className="text-[13px] italic leading-relaxed text-slate-500">
                                "{jawaban?.komentar || "Tidak ada komentar tambahan."}"
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function AssessmentDetailStyle() {
    return (
        <style
            dangerouslySetInnerHTML={{
                __html: `
          .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #0AC4E0; }

          thead th {
            background: #083344 !important;
            color: white !important;
            font-size: 10px !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.08em !important;
            padding: 14px 20px !important;
            border: none !important;
          }

          tbody td {
            padding: 14px 20px !important;
            border-bottom: 1px solid #F8FAFC !important;
            vertical-align: middle !important;
          }

          tbody tr:last-child td {
            border-bottom: none !important;
          }

          tbody tr {
            transition: background 0.15s;
          }

          tbody tr:hover td {
            background-color: rgba(10,196,224,0.03) !important;
          }

          .line-clamp-1 {
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `,
            }}
        />
    );
}

export default AssessmentDetailBase;
