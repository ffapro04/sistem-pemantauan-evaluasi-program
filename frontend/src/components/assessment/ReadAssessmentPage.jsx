/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import Dropdown from "../Dropdown";
import * as XLSX from "xlsx";
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
    Power,
    PowerOff,
    Loader2,
    Upload,
    Download,
} from "lucide-react";

import Sidebar from "../Sidebar";
import PageWrapper from "../PageWrapper";
import Card from "../Card";
import Input from "../Input";
import Button from "../Button";
import Label from "../Label";
import { canHoAccessSchool } from "../../utils/hoAccess";

const API_BASE = "";

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

const getToken = () => localStorage.getItem("token");

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

const hitungRemaining = (sentAt, tenggat = 7) => {
    if (!sentAt) return `${Number(tenggat) || 7} Hari`;

    const deadline = new Date(sentAt);
    deadline.setDate(deadline.getDate() + (Number(tenggat) || 7));

    const now = new Date();
    const diff = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

    return diff > 0 ? `${diff} Hari Lagi` : "Tenggat Habis";
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
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("semua");
    const [pilarFilter, setPilarFilter] = useState("semua");
    const [page, setPage] = useState(1);

    const limit = 8;

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
        setPage(1);
    }, [search, statusFilter, pilarFilter]);

    const filteredData = useMemo(() => {
        return assessments
            .filter((item) => {
                if (statusFilter === "aktif") return isActiveValue(item.aktif);
                if (statusFilter === "nonaktif") return !isActiveValue(item.aktif);
                if (statusFilter === "terkirim") return Boolean(item.sent_at);
                if (statusFilter === "draft") return !item.sent_at;
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
    }, [assessments, search, statusFilter, pilarFilter]);

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
                throw new Error(payload?.message || "Gagal mengubah status aktif");
            }

            setAssessments((prev) =>
                prev.map((item) =>
                    item.id === id ? { ...item, aktif: !isActiveValue(item.aktif) } : item,
                ),
            );

            toast.success("Status assessment berhasil diperbarui");
        } catch (error) {
            toast.error(error.message || "Gagal mengubah status aktif");
        } finally {
            setRowLoading(id, false);
        }
    };

    const handleExportResult = (row) => {
        if (!row?.id) return;

        const apiBaseUrl =
            import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

        window.location.href = `${apiBaseUrl}/assessment/${row.id}/hasil/export`;
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
                acc.total += 1;
                if (isActiveValue(item.aktif)) acc.aktif += 1;
                else acc.nonaktif += 1;
                if (item.sent_at) acc.terkirim += 1;
                else acc.draft += 1;
                return acc;
            },
            { total: 0, aktif: 0, nonaktif: 0, terkirim: 0, draft: 0 },
        );
    }, [assessments]);

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

            <main className="flex h-full flex-1 flex-col overflow-hidden px-4 pb-6 pt-10 md:px-10">
                <Card className="!m-0 flex flex-1 flex-col overflow-hidden rounded-[2.5rem] bg-white !p-0 shadow-2xl">
                    <div className="shrink-0 px-10 pb-6 pt-8">
                        <header className="mb-7 flex items-center justify-between">
                            <div>
                                <Label
                                    text="Assessment Management"
                                    className="!text-[8px] !font-black !italic uppercase !text-[#0AC4E0]"
                                />

                                <h1 className="text-xl font-black uppercase text-gray-800">
                                    {title}{" "}
                                    <span className="text-[#0AC4E0]">{labelAssessment}</span>
                                </h1>
                            </div>

                            <Button
                                text="Tambah Assessment"
                                icon={<Plus size={14} />}
                                onClick={() => navigate(`${basePath}/create`)}
                                className="!rounded-full !bg-[#0AC4E0] !px-6 !py-2.5 !text-[9px] font-black !uppercase text-white shadow-lg active:scale-95"
                            />
                        </header>

                        <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-4">
                            <div className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4">
                                <p className="text-[8px] font-black uppercase tracking-widest text-cyan-600">
                                    Total Data
                                </p>

                                <p className="mt-2 text-2xl font-black text-slate-900">
                                    {summary.total}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                                <p className="text-[8px] font-black uppercase tracking-widest text-emerald-600">
                                    Aktif
                                </p>

                                <p className="mt-2 text-2xl font-black text-slate-900">
                                    {summary.aktif}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
                                <p className="text-[8px] font-black uppercase tracking-widest text-amber-600">
                                    Belum Dikirim
                                </p>

                                <p className="mt-2 text-2xl font-black text-slate-900">
                                    {summary.draft}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                                <p className="text-[8px] font-black uppercase tracking-widest text-blue-600">
                                    Terkirim
                                </p>

                                <p className="mt-2 text-2xl font-black text-slate-900">
                                    {summary.terkirim}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 md:flex-row">
                            <div className="relative flex-1">
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari nama assessment, HO, sekolah, atau status..."
                                    className="w-full !rounded-xl !bg-gray-50/70 !py-2.5 !pl-11 !text-[11px] font-bold"
                                />

                                <Search
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                                    size={16}
                                />
                            </div>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="h-10 rounded-xl border border-gray-100 bg-gray-50/70 px-4 text-[9px] font-black uppercase tracking-widest text-slate-500 outline-none"
                            >
                                <option value="semua">Semua Status</option>
                                <option value="aktif">Aktif</option>
                                <option value="nonaktif">Nonaktif</option>
                                <option value="draft">Belum Dikirim</option>
                                <option value="terkirim">Terkirim</option>
                            </select>

                            <select
                                value={pilarFilter}
                                onChange={(e) => setPilarFilter(e.target.value)}
                                className="h-10 rounded-xl border border-gray-100 bg-gray-50/70 px-4 text-[9px] font-black uppercase tracking-widest text-slate-500 outline-none"
                            >
                                <option value="semua">Semua Pilar</option>
                                {getPilarOptions(jenisAssessment).map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>

                            <button
                                type="button"
                                onClick={resetFilter}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200/60 bg-gray-50 text-gray-400 shadow-sm transition-all hover:bg-rose-50 hover:text-rose-500 active:rotate-180"
                                title="Reset filter"
                            >
                                <RotateCcw size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="min-h-0 flex-1 overflow-auto px-10 pb-5">
                        <div className="overflow-x-auto rounded-3xl border border-gray-100 bg-white shadow-sm custom-scrollbar">
                            <table className="w-full min-w-[1320px] table-fixed border-collapse text-left">
                                <colgroup>
                                    <col className="w-[52px]" />
                                    <col className="w-[360px]" />
                                    <col className="w-[110px]" />
                                    <col className="w-[165px]" />
                                    <col className="w-[190px]" />
                                    <col className="w-[125px]" />
                                    <col className="w-[135px]" />
                                    <col className="w-[145px]" />
                                </colgroup>
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/70">
                                        <th className="px-2 py-4 text-center text-[9px] font-black uppercase tracking-widest text-gray-400">
                                            No
                                        </th>

                                        <th className="px-5 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">
                                            Assessment
                                        </th>

                                        <th className="px-5 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">
                                            Pilar
                                        </th>

                                        <th className="px-5 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">
                                            HO
                                        </th>

                                        <th className="px-3 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">
                                            Target Sekolah
                                        </th>

                                        <th className="px-5 py-4 text-center text-[9px] font-black uppercase tracking-widest text-gray-400">
                                            Progress
                                        </th>

                                        <th className="px-3 py-4 text-center text-[9px] font-black uppercase tracking-widest text-gray-400">
                                            Deadline
                                        </th>

                                        <th className="sticky right-0 z-10 w-[180px] bg-gray-50/70 px-5 py-4 text-right text-[9px] font-black uppercase tracking-widest text-gray-400">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {currentData.map((row, index) => {
                                        const active = isActiveValue(row.aktif);

                                        const alreadySent =
                                            Boolean(row.sent_at) ||
                                            ["TERKIRIM", "PROSES PENGISIAN"].includes(
                                                String(row.status || "").trim().toUpperCase(),
                                            );

                                        const sekolahList =
                                            row.sekolah && row.sekolah !== "-"
                                                ? String(row.sekolah)
                                                    .split(",")
                                                    .map((school) => school.trim())
                                                : [];

                                        return (
                                            <tr
                                                key={row.id}
                                                className="border-b border-gray-50 transition hover:bg-cyan-50/30 last:border-b-0"
                                            >
                                                <td className="px-5 py-5 text-center font-mono text-[10px] font-bold text-gray-400">
                                                    {String(start + index + 1).padStart(2, "0")}
                                                </td>

                                                <td className="px-5 py-5">
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0AC4E0]/10 text-[#0AC4E0]">
                                                            <ClipboardCheck size={18} />
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="truncate text-[12px] font-black uppercase text-slate-800">
                                                                {row.nama}
                                                            </p>

                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                                <span
                                                                    className={`rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-widest ${getStatusStyle(
                                                                        row.status,
                                                                    )}`}
                                                                >
                                                                    {row.status}
                                                                </span>

                                                                <span
                                                                    className={`rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-widest ${active
                                                                        ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                                                                        : "border-rose-100 bg-rose-50 text-rose-600"
                                                                        }`}
                                                                >
                                                                    {active ? "Aktif" : "Nonaktif"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-5">
                                                    <span className={`inline-flex rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-widest ${getPilarTone(row.pilar)}`}>
                                                        {getPilarLabel(row.pilar)}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <Users size={14} className="text-[#0AC4E0]" />

                                                        <span className="text-[11px] font-bold text-slate-600">
                                                            {row.ho}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-3 py-5 align-top">
                                                    <div className="w-[180px]">
                                                        {sekolahList.length > 0 ? (
                                                            <Dropdown
                                                                placeholder={`${sekolahList.length} Target Sekolah`}
                                                                value=""
                                                                onChange={() => { }}
                                                                width="w-full"
                                                                usePortal={true}
                                                                items={sekolahList.map((nama, idx) => ({
                                                                    label: nama,
                                                                    value: `${idx}-${nama}`,
                                                                }))}
                                                            />
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-gray-300">
                                                                Belum ada target
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-5 py-5 text-center">
                                                    <p className="text-[12px] font-black text-slate-700">
                                                        {row.jumlah_pengisi}/{row.jumlah_guru_target || 0} Guru
                                                    </p>
                                                    <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-amber-500">
                                                        {row.belum_mengisi || 0} belum isi
                                                    </p>

                                                    <div className="mx-auto mt-2 h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                                                        <div
                                                            className="h-full bg-[#0AC4E0]"
                                                            style={{
                                                                width: `${Math.min(
                                                                    Number(row.persentase_pengisian || 0),
                                                                    100,
                                                                )}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <p className="mt-1 text-[9px] font-black text-slate-400">
                                                        {row.persentase_pengisian || 0}%
                                                    </p>
                                                </td>

                                                <td className="px-5 py-5 text-center">
                                                    <div className="inline-flex items-center gap-2 rounded-full border border-gray-100 bg-gray-50 px-3 py-1.5">
                                                        <Clock
                                                            size={12}
                                                            className={
                                                                row.sent_at ? "text-[#0AC4E0]" : "text-slate-300"
                                                            }
                                                        />

                                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                                                            {hitungRemaining(row.sent_at, row.tenggat)}
                                                        </span>
                                                    </div>

                                                    <p className="mt-2 text-[9px] font-bold text-slate-300">
                                                        {formatDate(row.sent_at)}
                                                    </p>
                                                </td>

                                                <td className="sticky right-0 z-10 w-[180px] bg-white px-5 py-5">
                                                    <div className="flex min-w-max justify-end gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                navigate(`${basePath}/detail/${row.id}`)
                                                            }
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-400 hover:bg-white hover:text-[#0AC4E0]"
                                                            title="Detail"
                                                        >
                                                            <Eye size={14} />
                                                        </button>

                                                        {!alreadySent && (
                                                            <button
                                                                type="button"
                                                                onClick={() => navigate(`${basePath}/edit/${row.id}`)}
                                                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-400 hover:bg-white hover:text-amber-500"
                                                                title="Edit"
                                                            >
                                                                <Edit3 size={14} />
                                                            </button>
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={() => handleExportResult(row)}
                                                            disabled={actionLoading[row.id]}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white disabled:opacity-50"
                                                            title="Export hasil assessment"
                                                        >
                                                            <Download size={14} />
                                                        </button>

                                                        {!row.sent_at && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleSend(row.id)}
                                                                disabled={actionLoading[row.id]}
                                                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-100 bg-cyan-50 text-[#0AC4E0] hover:bg-[#0AC4E0] hover:text-white disabled:opacity-50"
                                                                title="Kirim"
                                                            >
                                                                {actionLoading[row.id] ? (
                                                                    <Loader2 size={14} className="animate-spin" />
                                                                ) : (
                                                                    <Send size={14} />
                                                                )}
                                                            </button>
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleAktif(row.id)}
                                                            disabled={actionLoading[row.id]}
                                                            className={`flex h-8 w-8 items-center justify-center rounded-lg border disabled:opacity-50 ${active
                                                                ? "border-rose-100 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white"
                                                                : "border-emerald-100 bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                                                                }`}
                                                            title={active ? "Nonaktifkan" : "Aktifkan"}
                                                        >
                                                            {active ? (
                                                                <PowerOff size={14} />
                                                            ) : (
                                                                <Power size={14} />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {currentData.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-24 text-slate-300">
                                    <Database size={54} strokeWidth={1} />

                                    <p className="mt-5 text-[10px] font-black uppercase tracking-widest">
                                        Data assessment tidak ditemukan
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-auto flex shrink-0 items-center justify-between border-t border-gray-100 bg-gray-50/30 px-10 py-5">
                        <p className="text-[10px] font-bold text-slate-400">
                            Menampilkan {currentData.length} dari {filteredData.length} data
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                disabled={page <= 1}
                                className="rounded-xl border border-slate-100 bg-white px-4 py-2 text-[10px] font-black uppercase text-slate-500 disabled:opacity-40"
                            >
                                Prev
                            </button>

                            <span className="rounded-xl bg-[#0AC4E0] px-4 py-2 text-[10px] font-black uppercase text-white">
                                {page} / {totalPages}
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    setPage((prev) => Math.min(prev + 1, totalPages))
                                }
                                disabled={page >= totalPages}
                                className="rounded-xl border border-slate-100 bg-white px-4 py-2 text-[10px] font-black uppercase text-slate-500 disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </Card>
            </main>
        </PageWrapper>
    );
}

export default ReadAssessmentPage;
