/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import Dropdown from "../Dropdown";
import {
    Search,
    Plus,
    Eye,
    Edit3,
    Send,
    Clock,
    Users,
    Database,
    RotateCcw,
    ClipboardCheck,
    PauseCircle,
    PlayCircle,
    Loader2,
    Upload,
    Download,
    School,
} from "lucide-react";

import Sidebar from "../Sidebar";
import PageWrapper from "../PageWrapper";
import Card from "../Card";
import Input from "../Input";
import Button from "../Button";
import Label from "../Label";
import AppButton from "../ui/AppButton";
import { canHoAccessSchool } from "../../utils/hoAccess";
import { exportAssessmentResultWorkbook } from "../../utils/assessmentExcelExport";
import { getAuthToken } from "../../utils/authSession";

import { API_BASE_URL as API_BASE } from "../../config/apiBase.js";
const loadXlsx = async () => import("xlsx");

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

const getPilarLabel = (value) => {
    const options = [
        ...ASSESSMENT_PILAR_OPTIONS.akademik,
        ...ASSESSMENT_PILAR_OPTIONS["non-akademik"],
    ];

    return options.find((item) => item.value === value)?.label || "Belum Dipilih";
};

const getPilarTone = (value) => {
    const options = [
        ...ASSESSMENT_PILAR_OPTIONS.akademik,
        ...ASSESSMENT_PILAR_OPTIONS["non-akademik"],
    ];

    return options.find((item) => item.value === value)?.tone || "border-slate-100 bg-slate-50 text-slate-500";
};


const normalizeArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.result)) return payload.result;
    if (Array.isArray(payload?.assessment)) return payload.assessment;
    if (Array.isArray(payload?.assessments)) return payload.assessments;
    return [];
};

const getToken = () => getAuthToken();

const getHoIdFromToken = () => {
    const token = getToken();

    if (!token) return null;

    try {
        const decoded = jwtDecode(token);
        return decoded?.sub || decoded?.id_user || decoded?.id || null;
    } catch {
        return null;
    }
};

const isActiveValue = (value) =>
    value === true || value === "true" || Number(value) === 1;

const formatDate = (value) => {
    if (!value) return "Belum dikirim";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Belum dikirim";

    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const SECOND_MS = 1000;
const DAY_MS = 24 * 60 * 60 * SECOND_MS;

const getAssessmentRuntime = (assessment, nowMs = Date.now()) => {
    if (!assessment?.sent_at) {
        return {
            stage: "DRAFT",
            label: "Belum Dikirim",
            remainingSeconds: null,
            deadline: null,
            paused: false,
        };
    }

    const sentAtMs = new Date(assessment.sent_at).getTime();
    if (Number.isNaN(sentAtMs)) {
        return {
            stage: "DRAFT",
            label: "Belum Dikirim",
            remainingSeconds: null,
            deadline: null,
            paused: false,
        };
    }

    const totalPausedSeconds = Math.max(
        0,
        Number(assessment?.total_paused_seconds || 0),
    );
    const baseDeadlineMs =
        sentAtMs + (Number(assessment?.tenggat) || 7) * DAY_MS + totalPausedSeconds * SECOND_MS;
    const paused = !isActiveValue(assessment?.aktif) && Boolean(assessment?.paused_at);
    const pausedAtMs = paused ? new Date(assessment.paused_at).getTime() : null;
    const referenceMs =
        paused && pausedAtMs && !Number.isNaN(pausedAtMs) ? pausedAtMs : nowMs;
    const remainingSeconds = Math.max(
        0,
        Math.ceil((baseDeadlineMs - referenceMs) / SECOND_MS),
    );
    const target = Number(assessment?.jumlah_guru_target || 0);
    const filled = Number(assessment?.jumlah_pengisi || 0);
    const allFilled = target > 0 && filled >= target;
    const normalizedStatus = String(assessment?.status || "").toLowerCase();
    const completedByStatus = normalizedStatus.includes("selesai");

    if (remainingSeconds <= 0 || allFilled || completedByStatus) {
        return {
            stage: "SELESAI",
            label: "Selesai",
            remainingSeconds: 0,
            deadline: new Date(baseDeadlineMs),
            paused: false,
        };
    }

    if (paused) {
        return {
            stage: "PENDING",
            label: "Dipending HO",
            remainingSeconds,
            deadline: new Date(baseDeadlineMs + Math.max(0, nowMs - pausedAtMs)),
            paused: true,
        };
    }

    return {
        stage: "PROSES",
        label: "Proses Pengisian",
        remainingSeconds,
        deadline: new Date(baseDeadlineMs),
        paused: false,
    };
};

const formatCountdown = (remainingSeconds) => {
    if (remainingSeconds === null || remainingSeconds === undefined) return "Belum Dimulai";
    if (remainingSeconds <= 0) return "Tenggat Habis";

    const days = Math.floor(remainingSeconds / 86400);
    const hours = Math.floor((remainingSeconds % 86400) / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;

    return `${days} Hari ${hours} Jam ${minutes} Menit ${seconds} Detik`;
};

const getRuntimeTone = (stage) => {
    if (stage === "PROSES") return "border-amber-200 bg-amber-50 text-amber-700";
    if (stage === "PENDING") return "border-red-200 bg-red-50 text-red-600";
    if (stage === "SELESAI") return "border-emerald-200 bg-emerald-50 text-emerald-600";
    return "border-slate-200 bg-slate-50 text-slate-500";
};

const getStatusStyle = (status) => {
    const value = String(status || "").toLowerCase();

    if (
        value.includes("proses") ||
        value.includes("terkirim") ||
        value.includes("pengisian")
    ) {
        return "border-cyan-100 bg-cyan-50 text-cyan-700";
    }

    if (value.includes("siap") || value.includes("draft")) {
        return "border-amber-100 bg-amber-50 text-amber-700";
    }

    if (value.includes("selesai")) {
        return "border-emerald-100 bg-emerald-50 text-emerald-700";
    }

    return "border-slate-100 bg-slate-50 text-slate-500";
};

const normalizeAssessment = (item) => ({
    id: item?.id_assessment ?? item?.id,
    nama: item?.nama ?? item?.nama_assessment ?? "-",
    ho: item?.ho ?? item?.nama_ho ?? item?.user?.nama ?? "-",
    status: item?.status ?? "Siap Diajukan",
    aktif: item?.aktif ?? item?.status_aktif ?? true,
    sent_at: item?.sent_at ?? null,
    paused_at: item?.paused_at ?? null,
    total_paused_seconds: Number(item?.total_paused_seconds || 0),
    remaining_seconds: item?.remaining_seconds ?? null,
    deadline: item?.deadline ?? null,
    tenggat: item?.tenggat ?? 7,
    jenis: item?.jenis ?? "",
    pilar: item?.pilar ?? item?.raw?.pilar ?? "",
    sekolah:
        item?.daftar_sekolah ??
        item?.nama_sekolah ??
        item?.sekolah?.nama_sekolah ??
        "-",
    jumlah_pengisi:
        item?.jumlah_pengisi ??
        item?.jumlah_guru_mengisi ??
        item?.total_pengisi ??
        item?.sudah_mengisi ??
        0,
    jumlah_guru_target:
        item?.jumlah_guru_target ??
        item?.total_guru_target ??
        item?.total_responden ??
        0,
    belum_mengisi:
        item?.belum_mengisi ??
        item?.guru_belum_mengisi ??
        0,
    persentase_pengisian:
        item?.persentase_pengisian ??
        item?.participation_percentage ??
        0,
    raw: item,
});

const parseSchoolIds = (value) => {
    if (!value) return [];

    if (Array.isArray(value)) {
        return value.map(String).filter(Boolean);
    }

    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);

            if (Array.isArray(parsed)) {
                return parsed.map(String).filter(Boolean);
            }
        } catch {
            return value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);
        }
    }

    return [String(value)].filter(Boolean);
};

const getAssessmentSchoolIds = (assessment) => {
    const raw = assessment?.raw || assessment;

    const ids = [
        ...parseSchoolIds(raw?.target_sekolah_ids),
        ...parseSchoolIds(raw?.sekolah_ids),
        ...parseSchoolIds(raw?.id_sekolah),
        ...parseSchoolIds(raw?.sekolah?.id_sekolah),
        ...parseSchoolIds(raw?.sekolah?.id),
    ];

    return [...new Set(ids.map(String))];
};

const IMPORT_META_KEYS = new Set([
    "nama",
    "nama_pengisi",
    "nama_guru",
    "guru",
    "id_guru",
    "id_guru_assessment",
    "id_user",
    "sekolah",
    "nama_sekolah",
    "pertanyaan",
    "question",
    "soal",
    "jawaban",
    "answer",
    "skor",
    "score",
]);

const getCell = (row, keys) => {
    const map = Object.entries(row || {}).reduce((acc, [key, value]) => {
        acc[String(key).trim().toLowerCase()] = value;
        return acc;
    }, {});

    for (const key of keys) {
        const value = map[String(key).toLowerCase()];
        if (value !== undefined && value !== null && String(value).trim()) {
            return String(value).trim();
        }
    }

    return "";
};

const parseImportedResultRows = (rows = []) => {
    const grouped = new Map();

    rows.forEach((row, index) => {
        const nama =
            getCell(row, ["nama_pengisi", "nama_guru", "nama", "guru"]) ||
            `Pengisi ${index + 1}`;
        const idGuru = getCell(row, ["id_guru_assessment", "id_guru"]);
        const idUser = getCell(row, ["id_user"]);
        const key = idGuru || `${nama}-${index}`;

        if (!grouped.has(key)) {
            grouped.set(key, {
                nama_pengisi: nama,
                nama_guru: nama,
                id_guru_assessment: idGuru || null,
                id_user: idUser || null,
                answers: [],
            });
        }

        const target = grouped.get(key);
        const longQuestion = getCell(row, ["pertanyaan", "question", "soal"]);
        const longAnswer = getCell(row, ["jawaban", "answer"]);
        const longScore = getCell(row, ["skor", "score"]);

        if (longQuestion && longAnswer) {
            target.answers.push({
                pertanyaan: longQuestion,
                jawaban: longAnswer,
                skor: Number(longScore || 0),
            });
            return;
        }

        Object.entries(row || {}).forEach(([rawKey, value]) => {
            const keyName = String(rawKey || "").trim();
            const lowerKey = keyName.toLowerCase();
            if (!keyName || IMPORT_META_KEYS.has(lowerKey)) return;
            if (value === undefined || value === null || !String(value).trim()) return;

            target.answers.push({
                pertanyaan: keyName,
                key: lowerKey,
                jawaban: String(value).trim(),
                skor: 0,
            });
        });
    });

    return Array.from(grouped.values()).filter((row) => row.answers.length > 0);
};

const canHoAccessAssessmentRow = (assessment, currentHo, schoolList = []) => {
    if (!currentHo) return true;

    const schoolIds = getAssessmentSchoolIds(assessment);

    if (schoolIds.length === 0) return true;

    const relatedSchools = schoolList.filter((school) => {
        const schoolId = school?.id_sekolah || school?.id;

        return schoolIds.includes(String(schoolId));
    });

    if (relatedSchools.length === 0) return true;

    return relatedSchools.some((school) => canHoAccessSchool(currentHo, school));
};

function ReadAssessmentPage({
    jenisAssessment = "akademik",
    labelAssessment = "Akademik",
    basePath = "/ho/assessment/akademik",
    title = "Riwayat Assessment",
}) {
    const navigate = useNavigate();

    const [assessments, setAssessments] = useState([]);
    const [schools, setSchools] = useState([]);
    const [currentHo, setCurrentHo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});
    const [currentTime, setCurrentTime] = useState(() => Date.now());
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("semua");
    const [pilarFilter, setPilarFilter] = useState("semua");
    const [page, setPage] = useState(1);

    const limit = 10;

    const fetchData = async () => {
        try {
            setLoading(true);

            const token = getToken();

            if (!token) {
                navigate("/login");
                return;
            }

            const idHo = getHoIdFromToken();
            const query = new URLSearchParams();

            query.set("jenis", jenisAssessment);

            const [resAssessment, resSchools, resHo] = await Promise.all([
                fetch(`${API_BASE}/assessment?${query.toString()}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
                fetch(`${API_BASE}/sekolah`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
                idHo
                    ? fetch(`${API_BASE}/users/${idHo}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    })
                    : Promise.resolve(null),
            ]);

            const payloadAssessment = await resAssessment.json().catch(() => ({}));
            const payloadSchools = await resSchools.json().catch(() => ({}));
            const payloadHo = resHo
                ? await resHo.json().catch(() => ({}))
                : null;

            if (!resAssessment.ok) {
                throw new Error(
                    payloadAssessment?.message || "Gagal memuat assessment",
                );
            }

            const schoolPayload = normalizeArray(payloadSchools);
            const loggedHo = payloadHo?.data || payloadHo || null;

            const mappedAssessments = normalizeArray(payloadAssessment).map(
                normalizeAssessment,
            );

            const accessibleAssessments = mappedAssessments.filter((assessment) =>
                canHoAccessAssessmentRow(assessment, loggedHo, schoolPayload),
            );

            setSchools(schoolPayload);
            setCurrentHo(loggedHo);
            setAssessments(accessibleAssessments);
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Gagal memuat assessment");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [jenisAssessment]);

    useEffect(() => {
        const timerId = window.setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => window.clearInterval(timerId);
    }, []);

    useEffect(() => {
        setPage(1);
    }, [search, statusFilter, pilarFilter]);

    const filteredData = useMemo(() => {
        return assessments
            .filter((item) => {
                const runtime = getAssessmentRuntime(item, currentTime);
                if (statusFilter === "lanjut") return runtime.stage === "PROSES";
                if (statusFilter === "pending") return runtime.stage === "PENDING";
                if (statusFilter === "terkirim") return Boolean(item.sent_at);
                if (statusFilter === "draft") return runtime.stage === "DRAFT";
                return true;
            })
            .filter((item) => {
                if (pilarFilter === "semua") return true;
                return String(item.pilar || "") === String(pilarFilter);
            })
            .filter((item) => {
                const keyword = search.toLowerCase();

                return [item.nama, item.ho, item.sekolah, item.status, getPilarLabel(item.pilar)]
                    .join(" ")
                    .toLowerCase()
                    .includes(keyword);
            })
            .sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
    }, [assessments, search, statusFilter, pilarFilter, currentTime]);

    const totalPages = Math.ceil(filteredData.length / limit) || 1;
    const start = (page - 1) * limit;
    const currentData = filteredData.slice(start, start + limit);

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    const setRowLoading = (id, value) => {
        setActionLoading((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    const handleSend = async (id) => {
        try {
            setRowLoading(id, true);

            const token = getToken();

            const res = await fetch(`${API_BASE}/assessment/${id}/send`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const payload = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(payload?.message || "Gagal mengirim assessment");
            }

            toast.success("Assessment berhasil dikirim");
            await fetchData();
        } catch (error) {
            toast.error(error.message || "Gagal mengirim assessment");
        } finally {
            setRowLoading(id, false);
        }
    };

    const handleToggleAktif = async (id) => {
        try {
            setRowLoading(id, true);

            const token = getToken();

            const res = await fetch(`${API_BASE}/assessment/${id}/toggle-aktif`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const payload = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(payload?.message || "Gagal mengubah status assessment");
            }

            setAssessments((prev) =>
                prev.map((item) =>
                    item.id === id
                        ? {
                            ...item,
                            aktif: payload?.aktif,
                            status: payload?.status || item.status,
                            paused_at: payload?.paused_at ?? null,
                            total_paused_seconds: Number(
                                payload?.total_paused_seconds ?? item.total_paused_seconds ?? 0,
                            ),
                            remaining_seconds:
                                payload?.remaining_seconds ?? item.remaining_seconds,
                            deadline: payload?.deadline ?? item.deadline,
                        }
                        : item,
                ),
            );

            toast.success(payload?.message || "Status assessment berhasil diperbarui");
        } catch (error) {
            toast.error(error.message || "Gagal mengubah status assessment");
        } finally {
            setRowLoading(id, false);
        }
    };

    const handleExportResult = async (row) => {
        if (!row?.id) return;

        try {
            setRowLoading(row.id, true);

            const token = getToken();
            const response = await fetch(
                `${API_BASE}/assessment/${row.id}/hasil?_ts=${Date.now()}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Cache-Control": "no-store",
                        Pragma: "no-cache",
                    },
                    cache: "no-store",
                },
            );
            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(payload?.message || "Gagal mengambil hasil assessment");
            }

            const responseAssessmentId = Number(payload?.id_assessment ?? payload?.id);
            if (
                responseAssessmentId &&
                Number(row.id) &&
                responseAssessmentId !== Number(row.id)
            ) {
                throw new Error("Data export tidak sesuai dengan assessment yang dipilih. Silakan coba refresh halaman.");
            }

            const exportPayload = {
                ...payload,
                id_assessment: payload?.id_assessment ?? row.id,
                nama_assessment:
                    payload?.nama_assessment ||
                    payload?.nama ||
                    row?.raw?.nama_assessment ||
                    row?.raw?.nama ||
                    row?.nama,
                nama:
                    payload?.nama ||
                    payload?.nama_assessment ||
                    row?.raw?.nama ||
                    row?.nama,
                pilar: payload?.pilar || row?.pilar || row?.raw?.pilar,
            };

            const XLSX = await loadXlsx();
            exportAssessmentResultWorkbook(XLSX, exportPayload, {
                id: row.id,
                fileName: exportPayload.nama_assessment,
            });
            toast.success("File hasil assessment berhasil dibuat dalam format XLSX.");
        } catch (error) {
            console.error("Gagal export hasil assessment:", error);
            toast.error(error.message || "Gagal export hasil assessment");
        } finally {
            setRowLoading(row.id, false);
        }
    };

    const handleImportResult = async (assessmentId, event) => {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) return;

        const fileName = String(file.name || "").toLowerCase();
        if (fileName.endsWith(".png")) {
            toast.error("File PNG tidak didukung untuk import hasil assessment.");
            return;
        }

        try {
            setRowLoading(assessmentId, true);

            const XLSX = await loadXlsx();
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const excelRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
            const rows = parseImportedResultRows(excelRows);

            if (rows.length === 0) {
                toast.error("Tidak ada hasil valid yang terbaca dari file.");
                return;
            }

            const token = getToken();
            const response = await fetch(`${API_BASE}/assessment/${assessmentId}/hasil/import`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ rows }),
            });
            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(payload?.message || "Gagal import hasil assessment");
            }

            toast.success(payload?.message || "Hasil assessment berhasil diimport");
            await fetchData();
        } catch (error) {
            console.error("Gagal import hasil assessment:", error);
            toast.error(error.message || "Gagal import hasil assessment");
        } finally {
            setRowLoading(assessmentId, false);
        }
    };

    const resetFilter = () => {
        setSearch("");
        setStatusFilter("semua");
        setPilarFilter("semua");
        setPage(1);
    };

    const summary = useMemo(() => {
        return assessments.reduce(
            (acc, item) => {
                const runtime = getAssessmentRuntime(item, currentTime);
                acc.total += 1;
                if (runtime.stage === "PROSES") acc.lanjut += 1;
                if (runtime.stage === "PENDING") acc.pending += 1;
                if (item.sent_at) acc.terkirim += 1;
                if (runtime.stage === "DRAFT") acc.draft += 1;
                return acc;
            },
            { total: 0, lanjut: 0, pending: 0, terkirim: 0, draft: 0 },
        );
    }, [assessments, currentTime]);

    const getSchoolList = (row) =>
        row?.sekolah && row.sekolah !== "-"
            ? String(row.sekolah)
                .split(",")
                .map((school) => school.trim())
                .filter(Boolean)
            : [];

    const getProgressPercent = (row) =>
        Math.min(Math.max(Number(row?.persentase_pengisian || 0), 0), 100);

    const renderRowActions = (row, withLabel = false) => {
        const runtime = getAssessmentRuntime(row, currentTime);
        const active = runtime.stage === "PROSES";
        const canToggle = ["PROSES", "PENDING"].includes(runtime.stage);
        const alreadySent = Boolean(row.sent_at);
        const isBusy = Boolean(actionLoading[row.id]);
        const baseClass = withLabel
            ? "inline-flex h-9 items-center justify-center gap-2 rounded-xl border px-3 text-[9px] font-black uppercase tracking-wide transition disabled:cursor-not-allowed disabled:opacity-50"
            : "flex h-9 w-9 items-center justify-center rounded-xl border transition disabled:cursor-not-allowed disabled:opacity-50";

        return (
            <div className={`flex flex-wrap items-center ${withLabel ? "gap-2" : "justify-center gap-1.5"}`}>
                <button
                    type="button"
                    onClick={() => navigate(`${basePath}/detail/${row.id}`)}
                    className={`${baseClass} border-slate-200 bg-slate-50 text-slate-500 hover:border-cyan-200 hover:bg-cyan-50 hover:text-[#0AC4E0]`}
                    title="Lihat detail assessment"
                >
                    <Eye size={14} />
                    {withLabel && <span>Detail</span>}
                </button>

                {!alreadySent && (
                    <button
                        type="button"
                        onClick={() => navigate(`${basePath}/edit/${row.id}`)}
                        className={`${baseClass} border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white`}
                        title="Edit assessment"
                    >
                        <Edit3 size={14} />
                        {withLabel && <span>Edit</span>}
                    </button>
                )}

                <button
                    type="button"
                    onClick={() => handleExportResult(row)}
                    disabled={isBusy}
                    className={`${baseClass} border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white`}
                    title="Export hasil assessment"
                >
                    {isBusy ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    {withLabel && <span>Export</span>}
                </button>

                {!alreadySent && (
                    <button
                        type="button"
                        onClick={() => handleSend(row.id)}
                        disabled={isBusy}
                        className={`${baseClass} border-cyan-200 bg-cyan-50 text-[#0AC4E0] hover:bg-[#0AC4E0] hover:text-white`}
                        title="Kirim assessment"
                    >
                        {isBusy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        {withLabel && <span>Kirim</span>}
                    </button>
                )}

                {canToggle && (
                    <button
                        type="button"
                        onClick={() => handleToggleAktif(row.id)}
                        disabled={isBusy}
                        className={`${baseClass} ${active
                            ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white"
                            : "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white"
                            }`}
                        title={active ? "Pending-kan assessment" : "Lanjutkan assessment"}
                    >
                        {active ? <PauseCircle size={14} /> : <PlayCircle size={14} />}
                        {withLabel && <span>{active ? "Pending" : "Lanjutkan"}</span>}
                    </button>
                )}
            </div>
        );
    };

    const summaryCards = [
        {
            key: "semua",
            label: "Total Assessment",
            value: summary.total,
            helper: "Seluruh data dalam cakupan HO",
            tone: "border-cyan-100 bg-cyan-50/70 text-cyan-700",
        },
        {
            key: "lanjut",
            label: "Proses Pengisian",
            value: summary.lanjut,
            helper: "Timer sedang berjalan",
            tone: "border-amber-100 bg-amber-50/70 text-amber-700",
        },
        {
            key: "pending",
            label: "Dipending HO",
            value: summary.pending,
            helper: "Timer berhenti sementara",
            tone: "border-red-100 bg-red-50/70 text-red-600",
        },
        {
            key: "draft",
            label: "Belum Dikirim",
            value: summary.draft,
            helper: "Masih dapat diedit",
            tone: "border-slate-200 bg-slate-50 text-slate-600",
        },
        {
            key: "terkirim",
            label: "Sudah Dikirim",
            value: summary.terkirim,
            helper: "Pernah dikirim ke sekolah",
            tone: "border-emerald-100 bg-emerald-50/70 text-emerald-700",
        },
    ];

    if (loading) {
        return (
            <PageWrapper className="flex h-screen items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0AC4E0] border-t-transparent" />
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#0AC4E0]">
                        Memuat assessment
                    </p>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper className="flex h-screen overflow-hidden bg-[#EEF5FF] !p-0 font-sans text-slate-800">
            <Sidebar />

            <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden px-3 pb-4 pt-8 sm:px-5 lg:px-8 xl:px-10">
                <Card className="!m-0 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[2rem] border border-white/80 bg-white !p-0 shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
                    <div className="shrink-0 border-b border-slate-100 px-5 pb-5 pt-6 sm:px-7 lg:px-9">
                        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0">
                                <Label
                                    text="Assessment Management"
                                    className="!text-[9px] !font-black !italic uppercase !tracking-[0.18em] !text-[#0AC4E0]"
                                />
                                <h1 className="mt-1 break-words text-[24px] font-black leading-tight tracking-[-0.03em] text-slate-900 sm:text-[28px]">
                                    {title}{" "}
                                    <span className="text-[#0AC4E0]">{labelAssessment}</span>
                                </h1>
                                <p className="mt-2 max-w-3xl text-[11px] font-semibold leading-5 text-slate-400">
                                    Kelola pengiriman, target sekolah, progres pengisian guru, tenggat, serta status pending assessment dalam satu halaman.
                                </p>
                            </div>

                            <Button
                                text="Tambah Assessment"
                                icon={<Plus size={15} />}
                                onClick={() => navigate(`${basePath}/create`)}
                                className="!w-full !rounded-2xl !bg-[#0AC4E0] !px-6 !py-3 !text-[10px] font-black !uppercase tracking-wide text-white shadow-lg transition active:scale-95 sm:!w-auto"
                            />
                        </header>

                        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
                            {summaryCards.map((card) => {
                                const selected = statusFilter === card.key;

                                return (
                                    <button
                                        key={card.key}
                                        type="button"
                                        onClick={() => setStatusFilter(card.key)}
                                        className={`min-w-0 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${card.tone} ${selected ? "ring-2 ring-[#0AC4E0]/30" : ""}`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="whitespace-normal break-words text-[9px] font-black uppercase tracking-[0.14em]">
                                                    {card.label}
                                                </p>
                                                <p className="mt-1 text-[9px] font-semibold leading-4 opacity-70">
                                                    {card.helper}
                                                </p>
                                            </div>
                                            <span className="shrink-0 text-[28px] font-black leading-none text-slate-900">
                                                {card.value}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(320px,1fr)_190px_190px_44px]">
                            <div className="relative min-w-0">
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari nama assessment, HO, sekolah, pilar, atau status..."
                                    className="w-full !rounded-xl !border-slate-200 !bg-slate-50/80 !py-2.5 !pl-11 !pr-4 !text-[11px] font-bold"
                                />
                                <Search
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                                    size={16}
                                />
                            </div>

                            <Dropdown
                                value={statusFilter}
                                onChange={setStatusFilter}
                                items={[
                                    { value: "semua", label: "Semua Status" },
                                    { value: "lanjut", label: "Proses Pengisian" },
                                    { value: "pending", label: "Dipending HO" },
                                    { value: "draft", label: "Belum Dikirim" },
                                    { value: "terkirim", label: "Sudah Dikirim" },
                                ]}
                                placeholder="Semua Status"
                                width="w-full"
                                usePortal
                            />

                            <Dropdown
                                value={pilarFilter}
                                onChange={setPilarFilter}
                                items={[
                                    { value: "semua", label: "Semua Pilar" },
                                    ...getPilarOptions(jenisAssessment),
                                ]}
                                placeholder="Semua Pilar"
                                width="w-full"
                                usePortal
                            />

                            <AppButton
                                type="button"
                                onClick={resetFilter}
                                icon={<RotateCcw size={16} />}
                                variant="subtle"
                                size="md"
                                title="Reset seluruh filter"
                                className="!h-10 !w-full !gap-2 !rounded-xl !border !border-slate-200 !bg-slate-50 !px-3 !text-[9px] !tracking-wide !text-slate-400 hover:!border-rose-200 hover:!bg-rose-50 hover:!text-rose-500 xl:!w-11 xl:!px-0"
                            >
                                <span className="xl:hidden">Reset Filter</span>
                            </AppButton>
                        </div>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 lg:px-8">
                        {currentData.length > 0 ? (
                            <>
                                <div className="grid gap-4 lg:hidden">
                                    {currentData.map((row, index) => {
                                        const runtime = getAssessmentRuntime(row, currentTime);
                                        const sekolahList = getSchoolList(row);
                                        const progress = getProgressPercent(row);

                                        return (
                                            <article
                                                key={row.id}
                                                className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-300">
                                                            ASM-{row.id} · Data {String(start + index + 1).padStart(2, "0")}
                                                        </p>
                                                        <h2 className="mt-1 whitespace-normal break-words text-[16px] font-black leading-6 text-slate-900">
                                                            {row.nama}
                                                        </h2>
                                                    </div>
                                                    <span className={`shrink-0 rounded-full border px-3 py-1.5 text-[8px] font-black uppercase tracking-wide ${getRuntimeTone(runtime.stage)}`}>
                                                        {runtime.label}
                                                    </span>
                                                </div>

                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    <span className={`inline-flex rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-wide ${getPilarTone(row.pilar)}`}>
                                                        {getPilarLabel(row.pilar)}
                                                    </span>
                                                    {runtime.stage === "PENDING" && (
                                                        <span className="rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[8px] font-black uppercase tracking-wide text-red-500">
                                                            Timer berhenti
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                    <div className="rounded-xl bg-slate-50 p-3">
                                                        <p className="text-[8px] font-black uppercase tracking-wide text-slate-400">Head Office</p>
                                                        <div className="mt-2 flex items-start gap-2">
                                                            <Users size={14} className="mt-0.5 shrink-0 text-[#0AC4E0]" />
                                                            <p className="whitespace-normal break-words text-[11px] font-bold leading-5 text-slate-700">{row.ho}</p>
                                                        </div>
                                                    </div>

                                                    <div className="rounded-xl bg-slate-50 p-3">
                                                        <p className="text-[8px] font-black uppercase tracking-wide text-slate-400">Target Sekolah</p>
                                                        <div className="mt-2 space-y-1.5">
                                                            {sekolahList.length ? sekolahList.slice(0, 3).map((school, schoolIndex) => (
                                                                <div key={`${row.id}-${schoolIndex}`} className="flex items-start gap-2">
                                                                    <School size={13} className="mt-0.5 shrink-0 text-[#0AC4E0]" />
                                                                    <p className="whitespace-normal break-words text-[10px] font-bold leading-4 text-slate-600">{school}</p>
                                                                </div>
                                                            )) : (
                                                                <p className="text-[10px] font-bold text-slate-300">Belum ada target sekolah</p>
                                                            )}
                                                            {sekolahList.length > 3 && (
                                                                <p className="text-[9px] font-black text-[#0AC4E0]">+{sekolahList.length - 3} sekolah lainnya</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="rounded-xl bg-slate-50 p-3">
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div>
                                                                <p className="text-[8px] font-black uppercase tracking-wide text-slate-400">Progress Guru</p>
                                                                <p className="mt-1 text-[14px] font-black text-slate-900">
                                                                    {row.jumlah_pengisi}/{row.jumlah_guru_target || 0} guru
                                                                </p>
                                                            </div>
                                                            <span className="text-[13px] font-black text-[#0AC4E0]">{progress}%</span>
                                                        </div>
                                                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                                                            <div className="h-full rounded-full bg-[#0AC4E0]" style={{ width: `${progress}%` }} />
                                                        </div>
                                                        <p className="mt-2 text-[9px] font-bold text-amber-500">{row.belum_mengisi || 0} guru belum mengisi</p>
                                                    </div>

                                                    <div className={`rounded-xl border p-3 ${getRuntimeTone(runtime.stage)}`}>
                                                        <p className="text-[8px] font-black uppercase tracking-wide opacity-70">Sisa Waktu</p>
                                                        <div className="mt-2 flex items-start gap-2">
                                                            <Clock size={14} className="mt-0.5 shrink-0" />
                                                            <p className="whitespace-normal break-words text-[10px] font-black leading-5">
                                                                {formatCountdown(runtime.remainingSeconds)}
                                                            </p>
                                                        </div>
                                                        <p className="mt-2 text-[8px] font-bold uppercase tracking-wide opacity-70">
                                                            {runtime.stage === "PENDING" ? "Waktu berhenti sementara" : formatDate(row.sent_at)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-4 border-t border-slate-100 pt-4">
                                                    {renderRowActions(row, true)}
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>

                                <div className="hidden overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm lg:block custom-scrollbar">
                                    <table className="w-full min-w-[1460px] table-fixed border-collapse text-left">
                                        <colgroup>
                                            <col className="w-[56px]" />
                                            <col className="w-[320px]" />
                                            <col className="w-[150px]" />
                                            <col className="w-[190px]" />
                                            <col className="w-[250px]" />
                                            <col className="w-[170px]" />
                                            <col className="w-[205px]" />
                                            <col className="w-[155px]" />
                                        </colgroup>
                                        <thead className="sticky top-0 z-10">
                                            <tr className="border-b border-slate-100 bg-slate-50/95 backdrop-blur">
                                                {["No", "Assessment", "Pilar", "Head Office", "Target Sekolah", "Progress Guru", "Sisa Waktu", "Aksi"].map((heading) => (
                                                    <th
                                                        key={heading}
                                                        className={`px-4 py-4 text-[9px] font-black uppercase tracking-[0.14em] text-slate-400 ${["No", "Progress Guru", "Sisa Waktu", "Aksi"].includes(heading) ? "text-center" : ""}`}
                                                    >
                                                        {heading}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {currentData.map((row, index) => {
                                                const runtime = getAssessmentRuntime(row, currentTime);
                                                const sekolahList = getSchoolList(row);
                                                const progress = getProgressPercent(row);

                                                return (
                                                    <tr
                                                        key={row.id}
                                                        className="border-b border-slate-100 align-top transition hover:bg-cyan-50/30 last:border-b-0"
                                                    >
                                                        <td className="px-3 py-5 text-center font-mono text-[10px] font-bold text-slate-300">
                                                            {String(start + index + 1).padStart(2, "0")}
                                                        </td>

                                                        <td className="px-4 py-5">
                                                            <div className="flex items-start gap-3">
                                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-[#0AC4E0]">
                                                                    <ClipboardCheck size={17} />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-300">ASM-{row.id}</p>
                                                                    <p className="mt-1 whitespace-normal break-words text-[12px] font-black leading-5 text-slate-800">
                                                                        {row.nama}
                                                                    </p>
                                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                                        <span className={`rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-wide ${getRuntimeTone(runtime.stage)}`}>
                                                                            {runtime.label}
                                                                        </span>
                                                                        {runtime.stage === "PENDING" && (
                                                                            <span className="rounded-full border border-red-100 bg-white px-2.5 py-1 text-[8px] font-black uppercase tracking-wide text-red-500">
                                                                                Timer berhenti
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="px-4 py-5">
                                                            <span className={`inline-flex max-w-full whitespace-normal break-words rounded-full border px-3 py-1.5 text-[8px] font-black uppercase leading-4 tracking-wide ${getPilarTone(row.pilar)}`}>
                                                                {getPilarLabel(row.pilar)}
                                                            </span>
                                                        </td>

                                                        <td className="px-4 py-5">
                                                            <div className="flex items-start gap-2">
                                                                <Users size={14} className="mt-0.5 shrink-0 text-[#0AC4E0]" />
                                                                <span className="whitespace-normal break-words text-[11px] font-bold leading-5 text-slate-600">
                                                                    {row.ho}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        <td className="px-4 py-5">
                                                            {sekolahList.length ? (
                                                                <div className="space-y-2" title={sekolahList.join(", ")}>
                                                                    {sekolahList.slice(0, 2).map((school, schoolIndex) => (
                                                                        <div key={`${row.id}-${schoolIndex}`} className="flex items-start gap-2 rounded-lg bg-slate-50 px-2.5 py-2">
                                                                            <School size={13} className="mt-0.5 shrink-0 text-[#0AC4E0]" />
                                                                            <span className="whitespace-normal break-words text-[9px] font-bold leading-4 text-slate-600">{school}</span>
                                                                        </div>
                                                                    ))}
                                                                    {sekolahList.length > 2 && (
                                                                        <span className="inline-flex rounded-full bg-cyan-50 px-2.5 py-1 text-[8px] font-black text-[#0AC4E0]">
                                                                            +{sekolahList.length - 2} sekolah lainnya
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-[10px] font-bold text-slate-300">Belum ada target sekolah</span>
                                                            )}
                                                        </td>

                                                        <td className="px-4 py-5 text-center">
                                                            <p className="text-[13px] font-black text-slate-800">
                                                                {row.jumlah_pengisi}/{row.jumlah_guru_target || 0} guru
                                                            </p>
                                                            <p className="mt-1 text-[9px] font-bold text-amber-500">
                                                                {row.belum_mengisi || 0} belum mengisi
                                                            </p>
                                                            <div className="mx-auto mt-3 h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                                                                <div className="h-full rounded-full bg-[#0AC4E0]" style={{ width: `${progress}%` }} />
                                                            </div>
                                                            <p className="mt-1 text-[9px] font-black text-slate-400">{progress}%</p>
                                                        </td>

                                                        <td className="px-4 py-5 text-center">
                                                            <div className={`mx-auto inline-flex max-w-[180px] items-start gap-2 rounded-xl border px-3 py-2.5 text-left ${getRuntimeTone(runtime.stage)}`}>
                                                                <Clock size={13} className="mt-0.5 shrink-0" />
                                                                <span className="whitespace-normal break-words text-[9px] font-black leading-4">
                                                                    {formatCountdown(runtime.remainingSeconds)}
                                                                </span>
                                                            </div>
                                                            <p className="mt-2 whitespace-normal break-words text-[8px] font-bold uppercase leading-4 tracking-wide text-slate-300">
                                                                {runtime.stage === "PENDING" ? "Waktu berhenti sementara" : formatDate(row.sent_at)}
                                                            </p>
                                                        </td>

                                                        <td className="px-3 py-5">
                                                            {renderRowActions(row)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        ) : (
                            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 text-center text-slate-300">
                                <Database size={52} strokeWidth={1.2} />
                                <p className="mt-4 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                                    Data assessment tidak ditemukan
                                </p>
                                    <p className="mt-2 max-w-md text-[10px] font-semibold leading-5 text-slate-400">
                                        Coba ubah kata pencarian atau reset filter status dan pilar.
                                    </p>
                            </div>
                        )}
                    </div>

                    <div className="mt-auto flex shrink-0 flex-col gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7 lg:px-9">
                        <p className="text-center text-[10px] font-bold text-slate-400 sm:text-left">
                            Menampilkan <span className="font-black text-slate-700">{currentData.length}</span> dari{" "}
                            <span className="font-black text-slate-700">{filteredData.length}</span> data
                        </p>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2">
                                <AppButton
                                    text="Prev"
                                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={page <= 1}
                                    variant="secondary"
                                    size="sm"
                                    className="!px-4 !py-2.5 !text-[9px] !tracking-wide !text-slate-500 hover:!border-cyan-200 hover:!text-[#0AC4E0]"
                                />
                                <span className="min-w-[72px] rounded-xl bg-slate-900 px-4 py-2.5 text-center text-[9px] font-black uppercase tracking-wide text-white">
                                    {page} / {totalPages}
                                </span>
                                <AppButton
                                    text="Next"
                                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={page >= totalPages}
                                    variant="secondary"
                                    size="sm"
                                    className="!px-4 !py-2.5 !text-[9px] !tracking-wide !text-slate-500 hover:!border-cyan-200 hover:!text-[#0AC4E0]"
                                />
                            </div>
                        )}
                    </div>
                </Card>
            </main>
        </PageWrapper>
    );
}

ReadAssessmentPage.propTypes = {
    jenisAssessment: PropTypes.string,
    labelAssessment: PropTypes.string,
    basePath: PropTypes.string,
    title: PropTypes.node,
};

export default ReadAssessmentPage;