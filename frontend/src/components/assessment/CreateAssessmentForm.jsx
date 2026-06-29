/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    Search,
    School,
    ClipboardCheck,
    HelpCircle,
    CheckCircle2,
    Loader2,
    Clock,
    Upload,
    Download,
} from "lucide-react";

import Sidebar from "../Sidebar";
import PageWrapper from "../PageWrapper";
import Card from "../Card";
import Input from "../Input";
import Button from "../Button";
import Label from "../Label";
import { filterSchoolsByHoAccess } from "../../utils/hoAccess";

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
    if (Array.isArray(payload?.sekolah)) return payload.sekolah;
    if (Array.isArray(payload?.schools)) return payload.schools;
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

const cleanWilayahName = (value) => {
    const raw = String(value || "").trim();

    if (!raw) return "-";

    if (raw.includes("/")) {
        return raw.split("/").filter(Boolean).pop() || raw;
    }

    return raw;
};

const normalizeSchool = (item) => ({
    id: item?.id_sekolah ?? item?.id,
    nama: item?.nama_sekolah ?? item?.nama ?? "Sekolah",
    npsn: item?.npsn ?? "-",
    jenjang: item?.jenjang ?? item?.jenis_sekolah ?? "-",
    wilayah: cleanWilayahName(
        item?.wilayah?.nama_wilayah || item?.nama_wilayah || "-",
    ),
    status: item?.status ?? true,
});

const getFirstValue = (row, keys) => {
    const lowerMap = Object.entries(row || {}).reduce((acc, [key, value]) => {
        acc[String(key).trim().toLowerCase()] = value;
        acc[String(key).trim().toLowerCase().replaceAll(" ", "_")] = value;
        return acc;
    }, {});

    for (const key of keys) {
        const value = lowerMap[String(key).toLowerCase()];
        if (value !== undefined && value !== null && String(value).trim()) {
            return String(value).trim();
        }
    }

    return "";
};

const QUESTION_HEADER_ALIASES = [
    "pertanyaan",
    "question",
    "soal",
    "perilaku",
    "indikator",
    "teks",
    "text",
];

const DEFAULT_SCORE_OPTIONS = [
    "4 - Sangat Baik",
    "3 - Baik",
    "2 - Cukup",
    "1 - Kurang",
];

const loadXlsx = async () => import("xlsx");

const findQuestionHeaderIndex = (rows = []) =>
    rows.findIndex((row = []) =>
        row.some((cell) =>
            QUESTION_HEADER_ALIASES.includes(
                String(cell || "")
                    .trim()
                    .toLowerCase()
                    .replaceAll(" ", "_"),
            ),
        ),
    );

const worksheetToFlexibleRows = (XLSX, sheet) => {
    const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    const headerIndex = findQuestionHeaderIndex(matrix);

    if (headerIndex >= 0) {
        return XLSX.utils.sheet_to_json(sheet, {
            defval: "",
            range: headerIndex,
        });
    }

    return XLSX.utils.sheet_to_json(sheet, { defval: "" });
};

const normalizeImportedQuestions = (rows = []) => {
    return rows
        .map((row) => {
            const question = getFirstValue(row, [
                "pertanyaan",
                "question",
                "soal",
                "perilaku",
                "indikator",
                "teks",
                "text",
            ]);
            const options = [
                getFirstValue(row, ["opsi1", "opsi_1", "opsi_a", "pilihan1", "pilihan_1", "pilihan_a", "a"]),
                getFirstValue(row, ["opsi2", "opsi_2", "opsi_b", "pilihan2", "pilihan_2", "pilihan_b", "b"]),
                getFirstValue(row, ["opsi3", "opsi_3", "opsi_c", "pilihan3", "pilihan_3", "pilihan_c", "c"]),
                getFirstValue(row, ["opsi4", "opsi_4", "opsi_d", "pilihan4", "pilihan_4", "pilihan_d", "d"]),
            ].filter(Boolean).slice(0, 4);
            const type = getFirstValue(row, ["tipe", "jenis", "type", "jenis_soal"]);
            const scoreLike = String(type || "").toLowerCase().includes("skor") ||
                String(type || "").toLowerCase().includes("skala");

            return {
                question,
                options: options.length >= 2 ? options : scoreLike ? DEFAULT_SCORE_OPTIONS : ["Ya", "Tidak"],
            };
        })
        .filter((item) => item.question);
};

const downloadQuestionTemplate = async () => {
    const XLSX = await loadXlsx();
    const workbook = XLSX.utils.book_new();
    const templateRows = [
        ["TEMPLATE IMPORT SOAL ASSESSMENT"],
        ["Isi langsung pada tabel di bawah. Kolom Pertanyaan wajib diisi. Opsi jawaban maksimal 4."],
        [],
        ["Komponen", "No", "Pertanyaan", "Tipe", "Opsi 1", "Opsi 2", "Opsi 3", "Opsi 4", "Catatan"],
        ["Akademik - Guru", 1, "Bagaimana kualitas proses pembelajaran yang dilaksanakan?", "Pilihan", "Sangat Baik", "Baik", "Cukup", "Kurang", "Contoh, boleh diganti"],
        ["Karakter - Sekolah", 2, "Apakah program pembiasaan karakter berjalan konsisten?", "Pilihan", "Sangat Setuju", "Setuju", "Kurang Setuju", "Tidak Setuju", "Contoh, boleh diganti"],
        ["", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", ""],
    ];
    const templateSheet = XLSX.utils.aoa_to_sheet(templateRows);

    templateSheet["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
    ];
    templateSheet["!cols"] = [
        { wch: 24 },
        { wch: 8 },
        { wch: 58 },
        { wch: 14 },
        { wch: 22 },
        { wch: 22 },
        { wch: 22 },
        { wch: 22 },
        { wch: 28 },
    ];
    templateSheet["!autofilter"] = { ref: "A4:I11" };

    const styledCells = {
        A1: { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "0055DA" } }, alignment: { horizontal: "center" } },
        A2: { font: { bold: true, color: { rgb: "360185" } }, fill: { fgColor: { rgb: "FFD400" } } },
    };
    Object.entries(styledCells).forEach(([cell, style]) => {
        if (templateSheet[cell]) templateSheet[cell].s = style;
    });
    for (let col = 0; col <= 8; col += 1) {
        const cell = XLSX.utils.encode_cell({ r: 3, c: col });
        if (templateSheet[cell]) {
            templateSheet[cell].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "0055DA" } },
                alignment: { horizontal: "center" },
            };
        }
    }

    XLSX.utils.book_append_sheet(workbook, templateSheet, "Template Soal");
    XLSX.writeFile(workbook, "template-import-soal-assessment.xlsx");
};

function CreateAssessmentForm({
    jenisAssessment = "akademik",
    labelAssessment = "Akademik",
    basePath = "/ho/assessment/akademik",
    title = "Tambah Assessment",
}) {
    const navigate = useNavigate();

    const [masterLoading, setMasterLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [schools, setSchools] = useState([]);
    const [searchSchool, setSearchSchool] = useState("");
    const [currentHo, setCurrentHo] = useState(null);

    const pilarOptions = useMemo(() => getPilarOptions(jenisAssessment), [jenisAssessment]);

    const [formData, setFormData] = useState({
        nama: "",
        tenggat: 7,
        pilar: getDefaultPilar(jenisAssessment),
        target_sekolah_ids: [],
        questions: [
            {
                question: "",
                options: ["", "", "", ""],
            },
        ],
    });

    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            pilar: prev.pilar || getDefaultPilar(jenisAssessment),
        }));
    }, [jenisAssessment]);

    const selectedSchools = useMemo(() => {
        return schools.filter((school) =>
            formData.target_sekolah_ids.includes(Number(school.id)),
        );
    }, [schools, formData.target_sekolah_ids]);

    const filteredSchools = useMemo(() => {
        const keyword = searchSchool.toLowerCase();

        return schools.filter((school) =>
            [school.nama, school.npsn, school.jenjang, school.wilayah]
                .join(" ")
                .toLowerCase()
                .includes(keyword),
        );
    }, [schools, searchSchool]);

    const fetchCurrentHo = async (token) => {
        const hoId = getHoIdFromToken();

        if (!hoId) return null;

        try {
            const res = await fetch(`${API_BASE}/users/${hoId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const payload = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(payload?.message || "Gagal mengambil data HO login");
            }

            const user = payload?.data || payload;

            setCurrentHo(user);

            return user;
        } catch (error) {
            console.error("Gagal mengambil data HO login:", error);
            toast.error("Data fokus HO login gagal dibaca");
            return null;
        }
    };

    useEffect(() => {
        const fetchSchools = async () => {
            try {
                setMasterLoading(true);

                const token = getToken();

                if (!token) {
                    navigate("/login");
                    return;
                }

                const res = await fetch(`${API_BASE}/sekolah`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const payload = await res.json();

                if (!res.ok) {
                    throw new Error(payload?.message || "Gagal mengambil data sekolah");
                }

                const mapped = normalizeArray(payload)
                    .map(normalizeSchool)
                    .filter((school) => school.id && isActiveValue(school.status))
                    .sort((a, b) => a.nama.localeCompare(b.nama));

                const loggedHo = await fetchCurrentHo(token);

                const accessibleSchools = filterSchoolsByHoAccess(mapped, loggedHo);

                setSchools(accessibleSchools);
            } catch (error) {
                toast.error(error.message || "Gagal mengambil data sekolah");
            } finally {
                setMasterLoading(false);
            }
        };

        fetchSchools();
    }, [navigate]);

    const setField = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const toggleSchool = (id) => {
        const schoolId = Number(id);

        setFormData((prev) => {
            const exists = prev.target_sekolah_ids.includes(schoolId);

            return {
                ...prev,
                target_sekolah_ids: exists
                    ? prev.target_sekolah_ids.filter((item) => item !== schoolId)
                    : [...prev.target_sekolah_ids, schoolId],
            };
        });
    };

    const addQuestion = () => {
        setFormData((prev) => ({
            ...prev,
            questions: [
                ...prev.questions,
                {
                    question: "",
                    options: ["", "", "", ""],
                },
            ],
        }));
    };

    const removeQuestion = (index) => {
        if (formData.questions.length === 1) {
            toast.warn("Minimal harus ada satu pertanyaan");
            return;
        }

        setFormData((prev) => ({
            ...prev,
            questions: prev.questions.filter((_, idx) => idx !== index),
        }));
    };

    const updateQuestion = (index, value) => {
        setFormData((prev) => ({
            ...prev,
            questions: prev.questions.map((item, idx) =>
                idx === index ? { ...item, question: value } : item,
            ),
        }));
    };

    const updateOption = (qIndex, optionIndex, value) => {
        setFormData((prev) => ({
            ...prev,
            questions: prev.questions.map((item, idx) => {
                if (idx !== qIndex) return item;

                return {
                    ...item,
                    options: item.options.map((option, optIdx) =>
                        optIdx === optionIndex ? value : option,
                    ),
                };
            }),
        }));
    };

    const addOption = (qIndex) => {
        setFormData((prev) => ({
            ...prev,
            questions: prev.questions.map((item, idx) => {
                if (idx !== qIndex) return item;

                if (item.options.length >= 4) {
                    toast.warn("Maksimal 4 pilihan jawaban");
                    return item;
                }

                return {
                    ...item,
                    options: [...item.options, ""],
                };
            }),
        }));
    };

    const removeOption = (qIndex, optionIndex) => {
        setFormData((prev) => ({
            ...prev,
            questions: prev.questions.map((item, idx) => {
                if (idx !== qIndex) return item;

                if (item.options.length <= 2) {
                    toast.warn("Minimal harus ada 2 pilihan jawaban");
                    return item;
                }

                return {
                    ...item,
                    options: item.options.filter((_, optIdx) => optIdx !== optionIndex),
                };
            }),
        }));
    };

    const handleImportQuestions = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) return;

        const fileName = String(file.name || "").toLowerCase();

        if (fileName.endsWith(".png")) {
            toast.error("File PNG tidak didukung untuk import soal.");
            return;
        }

        try {
            const XLSX = await loadXlsx();
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: "array" });
            const firstSheetName = workbook.SheetNames[0];

            if (!firstSheetName) {
                toast.error("Sheet tidak ditemukan pada file.");
                return;
            }

            const sheet = workbook.Sheets["Template Soal"] || workbook.Sheets[firstSheetName];
            const rows = worksheetToFlexibleRows(XLSX, sheet);
            const questions = normalizeImportedQuestions(rows);

            if (questions.length === 0) {
                toast.error("Tidak ada soal terbaca. Gunakan kolom pertanyaan dan opsi1-opsi4.");
                return;
            }

            setFormData((prev) => ({
                ...prev,
                questions,
            }));

            toast.success(`${questions.length} soal berhasil diimport.`);
        } catch (error) {
            console.error("Gagal import soal assessment:", error);
            toast.error("Gagal membaca file. Gunakan Excel/CSV dengan kolom pertanyaan dan opsi.");
        }
    };

    const validateForm = () => {
        if (!formData.nama.trim()) {
            toast.error("Nama assessment wajib diisi");
            return false;
        }

        if (!formData.pilar) {
            toast.error("Pilar assessment wajib dipilih");
            return false;
        }

        if (formData.target_sekolah_ids.length === 0) {
            toast.error("Pilih minimal satu sekolah target");
            return false;
        }

        if (!Number(formData.tenggat) || Number(formData.tenggat) < 1) {
            toast.error("Tenggat minimal 1 hari");
            return false;
        }

        const invalidQuestion = formData.questions.some((item) => {
            const validQuestion = item.question.trim();
            const validOptions = item.options.filter((opt) => opt.trim()).length >= 2;

            return !validQuestion || !validOptions;
        });

        if (invalidQuestion) {
            toast.error("Setiap pertanyaan wajib punya teks dan minimal 2 pilihan");
            return false;
        }

        return true;
    };

    const handleSubmit = async (event) => {
        if (event) event.preventDefault();

        if (!validateForm()) return;

        try {
            setSaving(true);

            const token = getToken();
            const idHo = getHoIdFromToken();

            if (!token) {
                navigate("/login");
                return;
            }

            if (!idHo) {
                toast.error("ID HO tidak terbaca dari token login");
                return;
            }

            const payload = {
                id_ho: Number(idHo),
                nama: formData.nama.trim(),
                target_sekolah_ids: formData.target_sekolah_ids.map(Number),
                tenggat: Number(formData.tenggat) || 7,
                jenis: jenisAssessment,
                pilar: formData.pilar,
                questions: formData.questions.map((item) => ({
                    question: item.question.trim(),
                    options: item.options.map((opt) => opt.trim()).filter(Boolean),
                })),
            };

            const res = await fetch(`${API_BASE}/assessment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data?.message || "Gagal membuat assessment");
            }

            toast.success("Assessment berhasil dibuat");
            navigate(basePath);
        } catch (error) {
            toast.error(error.message || "Gagal membuat assessment");
        } finally {
            setSaving(false);
        }
    };

    if (masterLoading) {
        return (
            <PageWrapper className="flex h-screen items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0AC4E0] border-t-transparent" />

                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#0AC4E0]">
                        Memuat data sekolah
                    </p>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper className="flex h-screen overflow-hidden bg-[#EEF5FF] !p-0 font-sans text-slate-800">
            <Sidebar />

            <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden px-4 pb-6 pt-10 md:px-10">
                <Card className="!m-0 flex flex-1 flex-col overflow-hidden rounded-[2.5rem] bg-white !p-0 shadow-2xl">
                    <div className="shrink-0 px-10 pb-6 pt-8">
                        <header className="flex items-center justify-between">
                            <div>
                                <Label
                                    text="Assessment Builder"
                                    className="!text-[8px] !font-black !italic uppercase !text-[#0AC4E0]"
                                />

                                <h1 className="text-xl font-black uppercase text-gray-800">
                                    {title}{" "}
                                    <span className="text-[#0AC4E0]">{labelAssessment}</span>
                                </h1>
                            </div>

                            <Button
                                text="Kembali"
                                icon={<ArrowLeft size={14} />}
                                onClick={() => navigate(basePath)}
                                className="!rounded-full !border !border-slate-100 !bg-white !px-6 !py-2.5 !text-[9px] font-black !uppercase !text-slate-400 shadow-sm hover:!text-slate-800"
                            />
                        </header>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden border-t border-gray-100 lg:grid-cols-[58%_42%]"
                    >
                        <div className="no-scrollbar overflow-y-auto px-10 py-7 pb-10">
                            <div className="space-y-6">
                                <div className="rounded-3xl border border-blue-100/60 bg-blue-50/40 p-5">
                                    <div className="mb-5 flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#0AC4E0] shadow-sm">
                                            <ClipboardCheck size={21} />
                                        </div>

                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-700">
                                                Identitas Assessment
                                            </p>

                                            <p className="text-[9px] font-bold text-gray-400">
                                                Data dasar assessment yang akan dikirim ke sekolah.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_170px_210px]">
                                        <div className="space-y-2">
                                            <Label
                                                text="Nama Assessment"
                                                required
                                                className="!ml-1 !text-[9px] !font-black !uppercase !tracking-widest !text-gray-400"
                                            />

                                            <Input
                                                value={formData.nama}
                                                onChange={(e) => setField("nama", e.target.value)}
                                                placeholder={`Contoh: Assessment ${labelAssessment} Semester 1`}
                                                className="w-full !rounded-xl !bg-white !py-3 !text-[11px] font-bold"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                text="Tenggat Hari"
                                                required
                                                className="!ml-1 !text-[9px] !font-black !uppercase !tracking-widest !text-gray-400"
                                            />

                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={formData.tenggat}
                                                    onChange={(e) => setField("tenggat", e.target.value)}
                                                    className="w-full !rounded-xl !bg-white !py-3 !pl-10 !text-[11px] font-bold"
                                                />

                                                <Clock
                                                    size={15}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                text="Pilar Assessment"
                                                required
                                                className="!ml-1 !text-[9px] !font-black !uppercase !tracking-widest !text-gray-400"
                                            />

                                            <select
                                                value={formData.pilar}
                                                onChange={(e) => setField("pilar", e.target.value)}
                                                className="h-[46px] w-full rounded-xl border border-slate-100 bg-white px-4 text-[11px] font-black uppercase tracking-wide text-slate-600 outline-none transition focus:border-[#0AC4E0] focus:ring-2 focus:ring-[#0AC4E0]/15"
                                            >
                                                {pilarOptions.map((item) => (
                                                    <option key={item.value} value={item.value}>
                                                        {item.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-5">
                                    <div className="mb-5 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#0AC4E0] shadow-sm">
                                                <School size={21} />
                                            </div>

                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-700">
                                                    Target Sekolah
                                                </p>

                                                <p className="text-[9px] font-bold text-gray-400">
                                                    Pilih sekolah yang akan menerima assessment.
                                                </p>
                                            </div>
                                        </div>

                                        <span className="rounded-full bg-[#0AC4E0]/10 px-3 py-1 text-[9px] font-black uppercase text-[#0AC4E0]">
                                            {formData.target_sekolah_ids.length} Dipilih
                                        </span>
                                    </div>

                                    <div className="relative mb-4">
                                        <Input
                                            value={searchSchool}
                                            onChange={(e) => setSearchSchool(e.target.value)}
                                            placeholder="Cari sekolah, NPSN, jenjang, atau wilayah..."
                                            className="w-full !rounded-xl !bg-white !py-3 !pl-10 !text-[11px] font-bold"
                                        />

                                        <Search
                                            size={15}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                                        />
                                    </div>

                                    <div className="no-scrollbar grid max-h-[330px] grid-cols-1 gap-3 overflow-y-auto pr-1 md:grid-cols-2">
                                        {filteredSchools.map((school) => {
                                            const selected = formData.target_sekolah_ids.includes(
                                                Number(school.id),
                                            );

                                            return (
                                                <button
                                                    type="button"
                                                    key={school.id}
                                                    onClick={() => toggleSchool(school.id)}
                                                    className={`flex items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-all active:scale-[0.98] ${selected
                                                        ? "border-[#0AC4E0] bg-[#0AC4E0]/5 shadow-sm"
                                                        : "border-white bg-white opacity-75 hover:opacity-100"
                                                        }`}
                                                >
                                                    <div
                                                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border-2 ${selected
                                                            ? "border-[#0AC4E0] bg-[#0AC4E0]"
                                                            : "border-slate-200"
                                                            }`}
                                                    >
                                                        {selected && (
                                                            <CheckCircle2 size={12} className="text-white" />
                                                        )}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-[11px] font-black uppercase text-slate-800">
                                                            {school.nama}
                                                        </p>

                                                        <p className="mt-1 truncate text-[8px] font-black uppercase tracking-widest text-slate-300">
                                                            {school.jenjang} · {school.npsn} ·{" "}
                                                            {school.wilayah}
                                                        </p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                                    <div className="mb-5 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0AC4E0]/10 text-[#0AC4E0]">
                                                <HelpCircle size={21} />
                                            </div>

                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-700">
                                                    Daftar Pertanyaan
                                                </p>

                                                <p className="text-[9px] font-bold text-gray-400">
                                                    Setiap pertanyaan minimal memiliki dua pilihan jawaban.
                                                </p>
                                            </div>
                                        </div>

                                        <Button
                                            type="button"
                                            text="Tambah"
                                            icon={<Plus size={14} />}
                                            onClick={addQuestion}
                                            className="!rounded-full !bg-[#0AC4E0] !px-5 !py-2 !text-[9px] font-black !uppercase !text-white"
                                        />
                                        <Button
                                            type="button"
                                            text="Template"
                                            icon={<Download size={14} />}
                                            onClick={downloadQuestionTemplate}
                                            className="!rounded-full !border !border-slate-200 !bg-white !px-5 !py-2 !text-[9px] font-black !uppercase !text-slate-500 hover:!border-cyan-100 hover:!bg-cyan-50 hover:!text-[#0AC4E0]"
                                        />
                                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-5 py-2 text-[9px] font-black uppercase tracking-widest text-[#0AC4E0] transition-all hover:bg-[#0AC4E0] hover:text-white">
                                            <Upload size={14} />
                                            Import Soal
                                            <input
                                                type="file"
                                                accept=".xlsx,.xls,.csv,.tsv,.txt,.ods"
                                                className="hidden"
                                                onChange={handleImportQuestions}
                                            />
                                        </label>
                                    </div>

                                    <div className="space-y-4">
                                        {formData.questions.map((question, qIndex) => (
                                            <div
                                                key={qIndex}
                                                className="rounded-3xl border border-slate-100 bg-slate-50/70 p-5"
                                            >
                                                <div className="mb-4 flex items-center justify-between gap-4">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                        Pertanyaan {qIndex + 1}
                                                    </p>

                                                    <button
                                                        type="button"
                                                        onClick={() => removeQuestion(qIndex)}
                                                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>

                                                <Input
                                                    value={question.question}
                                                    onChange={(e) =>
                                                        updateQuestion(qIndex, e.target.value)
                                                    }
                                                    placeholder="Tulis pertanyaan assessment..."
                                                    className="mb-4 w-full !rounded-xl !bg-white !py-3 !text-[11px] font-bold"
                                                />

                                                <div className="mb-3 flex items-center justify-between gap-3">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                        Pilihan Jawaban · {question.options.length}/4
                                                    </p>

                                                    <button
                                                        type="button"
                                                        onClick={() => addOption(qIndex)}
                                                        disabled={question.options.length >= 4}
                                                        className={`rounded-full px-4 py-2 text-[8px] font-black uppercase tracking-widest transition-all ${question.options.length >= 4
                                                            ? "cursor-not-allowed bg-slate-100 text-slate-300"
                                                            : "bg-[#0AC4E0]/10 text-[#0AC4E0] hover:bg-[#0AC4E0] hover:text-white"
                                                            }`}
                                                    >
                                                        + Tambah Pilihan
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                                    {question.options.map((option, optIndex) => (
                                                        <div key={optIndex} className="relative">
                                                            <Input
                                                                value={option}
                                                                onChange={(e) =>
                                                                    updateOption(qIndex, optIndex, e.target.value)
                                                                }
                                                                placeholder={`Pilihan ${optIndex + 1}`}
                                                                className="w-full !rounded-xl !bg-white !py-3 !pr-11 !text-[11px] font-bold"
                                                            />

                                                            <button
                                                                type="button"
                                                                onClick={() => removeOption(qIndex, optIndex)}
                                                                disabled={question.options.length <= 2}
                                                                className={`absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg transition-all ${question.options.length <= 2
                                                                    ? "cursor-not-allowed bg-slate-50 text-slate-200"
                                                                    : "bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white"
                                                                    }`}
                                                                title="Hapus pilihan"
                                                            >
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex min-h-0 flex-col border-l border-gray-100 p-7">
                            <div className="mb-5">
                                <Label
                                    text="Assessment Preview"
                                    className="!text-[8px] !font-black !italic uppercase !text-[#0AC4E0]"
                                />

                                <h2 className="text-lg font-black uppercase text-gray-800">
                                    Ringkasan Data
                                </h2>
                            </div>

                            <div className="no-scrollbar flex-1 overflow-y-auto">
                                <div className="space-y-4">
                                    <div className="rounded-3xl border border-blue-100/60 bg-blue-50/40 p-5">
                                        <Label
                                            text="Nama Assessment"
                                            className="!mb-2 !text-[8px] !font-black !uppercase !tracking-widest !text-gray-400"
                                        />

                                        <p className="text-[14px] font-black uppercase text-slate-800">
                                            {formData.nama || "-"}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                        <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                                            <Label
                                                text="Jenis"
                                                className="!mb-2 !text-[8px] !font-black !uppercase !tracking-widest !text-gray-400"
                                            />

                                            <p className="text-[13px] font-black uppercase text-[#0AC4E0]">
                                                {labelAssessment}
                                            </p>
                                        </div>

                                        <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                                            <Label
                                                text="Tenggat"
                                                className="!mb-2 !text-[8px] !font-black !uppercase !tracking-widest !text-gray-400"
                                            />

                                            <p className="text-[13px] font-black uppercase text-slate-800">
                                                {formData.tenggat || 7} Hari
                                            </p>
                                        </div>

                                        <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                                            <Label
                                                text="Pilar"
                                                className="!mb-2 !text-[8px] !font-black !uppercase !tracking-widest !text-gray-400"
                                            />

                                            <p className="text-[13px] font-black uppercase text-slate-800">
                                                {getPilarLabel(formData.pilar)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                                        <Label
                                            text="Sekolah Target"
                                            className="!mb-3 !text-[8px] !font-black !uppercase !tracking-widest !text-gray-400"
                                        />

                                        <div className="flex flex-wrap gap-2">
                                            {selectedSchools.length > 0 ? (
                                                selectedSchools.map((school) => (
                                                    <span
                                                        key={school.id}
                                                        className="rounded-full bg-[#0AC4E0]/10 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-[#0AC4E0]"
                                                    >
                                                        {school.nama}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-[10px] font-bold text-gray-400">
                                                    Belum ada sekolah dipilih.
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                                        <Label
                                            text="Jumlah Pertanyaan"
                                            className="!mb-2 !text-[8px] !font-black !uppercase !tracking-widest !text-gray-400"
                                        />

                                        <p className="text-[28px] font-black text-slate-900">
                                            {formData.questions.length}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 flex shrink-0 items-center justify-between border-t border-gray-100 pt-5">
                                <Button
                                    type="button"
                                    text="Batal"
                                    icon={<ArrowLeft size={14} />}
                                    onClick={() => navigate(basePath)}
                                    className="!rounded-full !border !border-slate-100 !bg-white !px-7 !py-3 !text-[9px] font-black !uppercase !text-slate-400 shadow-sm hover:!text-slate-800"
                                />

                                <Button
                                    type="submit"
                                    text={saving ? "Menyimpan..." : "Simpan Assessment"}
                                    icon={
                                        saving ? (
                                            <Loader2 size={15} className="animate-spin" />
                                        ) : (
                                            <Save size={15} />
                                        )
                                    }
                                    onClick={handleSubmit}
                                    disabled={saving}
                                    className="!rounded-full !bg-[#0AC4E0] !px-8 !py-3 !text-[9px] font-black !uppercase !text-white shadow-lg shadow-[#0AC4E0]/20 active:scale-95"
                                />
                            </div>
                        </div>
                    </form>
                </Card>
            </main>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          `,
                }}
            />
        </PageWrapper>
    );
}

export default CreateAssessmentForm;
