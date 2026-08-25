/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ClipboardList } from "lucide-react";

import {
    Sidebar,
    PageWrapper,
    FormPageHeader,
    QuestionBuilder,
    ActionFooter,
    NoScrollbarStyle,
    InfoPill,
} from "../common";
import Dropdown from "../Dropdown";

import { canHoAccessSchool } from "../../utils/hoAccess";
import { getAuthToken } from "../../utils/authSession";

import { API_BASE_URL as DEFAULT_API_BASE } from "../../config/apiBase.js";

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


const getToken = () => getAuthToken();

const normalizeOption = (option) => {
    if (typeof option === "string") return option;

    return (
        option?.label ||
        option?.teks ||
        option?.option ||
        option?.jawaban ||
        ""
    );
};

const normalizeQuestion = (item) => {
    const rawOptions =
        item?.options ||
        item?.pilihan ||
        item?.opsi ||
        item?.jawaban_opsi ||
        [];

    const options = Array.isArray(rawOptions)
        ? rawOptions.map(normalizeOption)
        : ["", "", "", ""];

    return {
        id_pertanyaan: item?.id_pertanyaan ?? item?.id ?? null,
        question:
            item?.question ||
            item?.teks ||
            item?.pertanyaan ||
            item?.nama_pertanyaan ||
            "",
        options: options.length > 0 ? options : ["", "", "", ""],
    };
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
    const raw = assessment?.data || assessment;

    const ids = [
        ...parseSchoolIds(raw?.target_sekolah_ids),
        ...parseSchoolIds(raw?.sekolah_ids),
        ...parseSchoolIds(raw?.id_sekolah),
        ...parseSchoolIds(raw?.sekolah?.id_sekolah),
        ...parseSchoolIds(raw?.sekolah?.id),
    ];

    return [...new Set(ids.map(String))];
};

const canAccessAssessmentDetail = (assessment, currentHo, schoolList = []) => {
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

function AssessmentEditBase({
    basePath = "/ho/assessment/akademik",
    highlight = "Assessment",
    questionPlaceholder = "Tuliskan pertanyaan di sini...",
    successMessage = "Perubahan berhasil disimpan",
    apiBase = DEFAULT_API_BASE,
}) {
    const navigate = useNavigate();
    const { id } = useParams();

    const [questions, setQuestions] = useState([]);
    const [meta, setMeta] = useState({
        nama: "",
        jenis: "akademik",
        pilar: "AKADEMIK",
        tenggat: 7,
        target_sekolah_ids: [],
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchAssessment();
    }, [id]);

    const fetchAssessment = async () => {
        setLoading(true);

        try {
            const token = getToken();

            if (!token) {
                navigate("/login");
                return;
            }

            const hoId = (() => {
                try {
                    const payload = JSON.parse(atob(token.split(".")[1]));
                    return payload?.sub || payload?.id_user || payload?.id || null;
                } catch {
                    return null;
                }
            })();

            const [res, resSchools, resHo] = await Promise.all([
                fetch(`${apiBase}/assessment/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
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

            const data = await res.json();
            const schoolPayload = await resSchools.json().catch(() => ({}));
            const hoPayload = resHo ? await resHo.json().catch(() => ({})) : null;

            if (!res.ok) {
                throw new Error(data?.message || "Gagal mengambil assessment");
            }

            const assessmentDetail = data?.data || data;
            const currentHo = hoPayload?.data || hoPayload || null;
            const schoolList = normalizeArray(schoolPayload);

            const allowed = canAccessAssessmentDetail(
                assessmentDetail,
                currentHo,
                schoolList,
            );

            if (!allowed) {
                toast.error("Kamu tidak punya akses untuk mengedit assessment ini.");
                navigate(basePath);
                return;
            }

            setMeta({
                nama: assessmentDetail?.nama || assessmentDetail?.nama_assessment || "",
                jenis: assessmentDetail?.jenis || "akademik",
                pilar: assessmentDetail?.pilar || getDefaultPilar(assessmentDetail?.jenis || "akademik"),
                tenggat: assessmentDetail?.tenggat || 7,
                target_sekolah_ids: assessmentDetail?.target_sekolah_ids || [],
            });

            const sourceQuestions =
                assessmentDetail?.questions ||
                assessmentDetail?.pertanyaan ||
                assessmentDetail?.items ||
                [];

            setQuestions(
                Array.isArray(sourceQuestions)
                    ? sourceQuestions.map(normalizeQuestion)
                    : [],
            );
        } catch (error) {
            console.error("Gagal mengambil assessment:", error);
            toast.error(error?.message || "Gagal memuat data assessment");
        } finally {
            setLoading(false);
        }
    };

    const handleQuestionChange = (index, value) => {
        setQuestions((prev) =>
            prev.map((question, i) =>
                i === index
                    ? {
                        ...question,
                        question: value,
                    }
                    : question,
            ),
        );
    };

    const handleOptionChange = (questionIndex, optionIndex, value) => {
        setQuestions((prev) =>
            prev.map((question, i) => {
                if (i !== questionIndex) return question;

                const currentOptions = Array.isArray(question.options)
                    ? question.options
                    : [];

                return {
                    ...question,
                    options: currentOptions.map((option, j) =>
                        j === optionIndex ? value : option,
                    ),
                };
            }),
        );
    };

    const removeQuestion = (index) => {
        if (questions.length === 1) {
            toast.warn("Minimal harus terdapat satu pertanyaan");
            return;
        }

        setQuestions((prev) => prev.filter((_, i) => i !== index));
    };

    const addQuestion = () => {
        setQuestions((prev) => [
            ...prev,
            {
                question: "",
                options: ["", "", "", ""],
            },
        ]);
    };

    const validateQuestions = () => {
        if (questions.length === 0) {
            toast.error("Minimal harus terdapat satu pertanyaan");
            return false;
        }

        for (const item of questions) {
            if (!item.question?.trim()) {
                toast.error("Pertanyaan tidak boleh kosong");
                return false;
            }

            if (!Array.isArray(item.options) || item.options.length === 0) {
                toast.error("Pilihan jawaban tidak boleh kosong");
                return false;
            }

            if (item.options.some((option) => !option?.trim())) {
                toast.error("Semua pilihan jawaban harus diisi");
                return false;
            }
        }

        return true;
    };

    const handleSave = async () => {
        if (saving) return;
        if (!validateQuestions()) return;

        try {
            setSaving(true);

            const token = getToken();

            if (!token) {
                navigate("/login");
                return;
            }

            const payload = {
                nama: meta.nama,
                jenis: meta.jenis,
                pilar: meta.pilar,
                tenggat: Number(meta.tenggat) || 7,
                target_sekolah_ids: meta.target_sekolah_ids,
                questions: questions.map((item) => ({
                    question: item.question.trim(),
                    options: item.options.map((option) => option.trim()),
                })),
            };

            const res = await fetch(`${apiBase}/assessment/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data?.message || "Gagal update");
            }

            toast.success(successMessage);
            navigate(basePath);
        } catch (error) {
            console.error("Gagal memperbarui assessment:", error);
            toast.error(error?.message || "Gagal memperbarui assessment");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0AC4E0] border-t-transparent" />
            </div>
        );
    }

    return (
        <PageWrapper className="flex h-screen overflow-hidden bg-white !p-0 font-sans text-slate-800 selection:bg-[#0AC4E0]/20">
            <Sidebar />

            <main className="relative flex h-full flex-1 flex-col overflow-hidden">
                <div className="absolute right-0 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-[#0AC4E0]/5 blur-[120px]" />

                <div className="flex flex-1 flex-col gap-8 overflow-hidden px-8 pb-4 pt-10 leading-none">
                    <FormPageHeader
                        title="Edit Data Soal"
                        highlight={highlight}
                        subtitle="Sistem Pemantauan dan Evaluasi Program"
                        backText="Kembali"
                        onBack={() => navigate(basePath)}
                        className="mb-2"
                    />

                    <InfoPill
                        icon={<ClipboardList size={16} />}
                        text={`Total: ${questions.length} Butir Pertanyaan`}
                        className="animate-in fade-in zoom-in-95 duration-700"
                    />

                    <div className="grid grid-cols-1 gap-4 rounded-3xl border border-slate-100 bg-slate-50/70 p-5 md:grid-cols-[1fr_220px_160px]">
                        <div className="space-y-2">
                            <label className="ml-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                Nama Assessment
                            </label>
                            <input
                                value={meta.nama}
                                onChange={(event) =>
                                    setMeta((prev) => ({ ...prev, nama: event.target.value }))
                                }
                                className="h-11 w-full rounded-xl border border-slate-100 bg-white px-4 text-[11px] font-bold text-slate-700 outline-none focus:border-[#0AC4E0] focus:ring-2 focus:ring-[#0AC4E0]/15"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="ml-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                Pilar Assessment
                            </label>
                            <Dropdown
                                value={meta.pilar}
                                onChange={(value) =>
                                    setMeta((prev) => ({ ...prev, pilar: value }))
                                }
                                items={getPilarOptions(meta.jenis)}
                                placeholder="Pilih Pilar"
                                width="w-full"
                                usePortal
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="ml-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                Tenggat Hari
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={meta.tenggat}
                                onChange={(event) =>
                                    setMeta((prev) => ({ ...prev, tenggat: event.target.value }))
                                }
                                className="h-11 w-full rounded-xl border border-slate-100 bg-white px-4 text-[11px] font-bold text-slate-700 outline-none focus:border-[#0AC4E0] focus:ring-2 focus:ring-[#0AC4E0]/15"
                            />
                        </div>
                    </div>

                    <div className="no-scrollbar flex-1 space-y-8 overflow-y-auto pb-20 pr-2">
                        <QuestionBuilder
                            title="Konfigurasi Pertanyaan"
                            badge={`${questions.length} BUTIR PERTANYAAN`}
                            questions={questions}
                            questionLabel="Pertanyaan Utama"
                            questionPlaceholder={questionPlaceholder}
                            optionLabel="Pilihan Jawaban"
                            optionPlaceholder="Jawaban"
                            itemLabel="Konfigurasi Pertanyaan"
                            addText="Sisipkan Pertanyaan Baru"
                            onAdd={addQuestion}
                            onRemove={removeQuestion}
                            onQuestionChange={handleQuestionChange}
                            onOptionChange={handleOptionChange}
                        />
                    </div>

                    <ActionFooter
                        showCancel={false}
                        submitText="Simpan Perubahan"
                        loadingText="Menyimpan..."
                        loading={saving}
                        onSubmit={handleSave}
                    />
                </div>
            </main>

            <NoScrollbarStyle />
        </PageWrapper>
    );
}

AssessmentEditBase.propTypes = {
    basePath: PropTypes.string,
    highlight: PropTypes.node,
    questionPlaceholder: PropTypes.string,
    successMessage: PropTypes.string,
    apiBase: PropTypes.string,
};

export default AssessmentEditBase;
