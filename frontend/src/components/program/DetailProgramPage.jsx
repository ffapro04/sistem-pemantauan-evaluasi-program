/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
    AlertTriangle,
    ArrowLeft,
    Briefcase,
    Building2,
    Calendar,
    CheckCircle2,
    ChevronRight,
    Clock,
    Edit3,
    Eye,
    FileText,
    Layers3,
    Lock,
    MessageSquare,
    RefreshCcw,
    Send,
    Star,
    Target,
    UploadCloud,
    UserCheck,
    Wallet,
    X,
} from "lucide-react";

import {
    Sidebar,
    PageWrapper,
    Button,
    Input,
} from "../common";

import { canHoAccessSchool } from "../../utils/hoAccess";

const API_BASE_URL = "";

const STATUS_STYLE = {
    APPROVED: "border-emerald-100 bg-emerald-50 text-emerald-600",

    WAITING_AO: "border-sky-100 bg-sky-50 text-sky-600",
    WAITING_HO: "border-amber-100 bg-amber-50 text-amber-600",
    WAITING_UPLOAD: "border-slate-100 bg-slate-50 text-slate-400",

    REJECTED_AO: "border-orange-100 bg-orange-50 text-orange-600",
    REJECTED_HO: "border-red-100 bg-red-50 text-red-500",
    REJECTED: "border-red-100 bg-red-50 text-red-500",

    LOCKED: "border-slate-100 bg-slate-50 text-slate-300",
};

const STATUS_LABEL = {
    APPROVED: "Disetujui HO",

    WAITING_AO: "Menunggu Review AO",
    WAITING_HO: "Menunggu Keputusan HO",
    WAITING_UPLOAD: "Menunggu Upload",

    REJECTED_AO: "Ditolak AO",
    REJECTED_HO: "Ditolak HO",
    REJECTED: "Ditolak",

    LOCKED: "Terkunci",
};

const EXECUTION_COPY = {
    openingTitle: "Administrasi Pembuka Periode",
    openingSubtitle: "Bukti Administratif",
    openingDesc:
        "Narasumber wajib mengunggah bukti administratif pembuka periode. Setelah direview AO dan disetujui HO, aktivitas pada periode ini akan terbuka.",

    innerTitle: "Aktivitas Kegiatan",
    innerSubtitle: "Aktivitas + Bukti Pelaksanaan",
    innerDesc:
        "Setiap aktivitas memiliki bukti upload sendiri. Narasumber upload bukti, AO memberi review lapangan, lalu HO memberi keputusan final.",
};

function normalizeArray(payload) {
    if (Array.isArray(payload)) return payload;

    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.result)) return payload.result;
    if (Array.isArray(payload?.results)) return payload.results;
    if (Array.isArray(payload?.rows)) return payload.rows;

    if (Array.isArray(payload?.program)) return payload.program;
    if (Array.isArray(payload?.programs)) return payload.programs;

    if (Array.isArray(payload?.sekolah)) return payload.sekolah;
    if (Array.isArray(payload?.schools)) return payload.schools;

    if (Array.isArray(payload?.users)) return payload.users;
    if (Array.isArray(payload?.user)) return payload.user;

    if (Array.isArray(payload?.vendor)) return payload.vendor;
    if (Array.isArray(payload?.vendors)) return payload.vendors;

    return [];
}

function getArray(...values) {
    return values.find((value) => Array.isArray(value)) || [];
}

function normalizeMeetings(kegiatan = {}) {
    return getArray(
        kegiatan.pertemuan,
        kegiatan.meetings,
        kegiatan.t_kegiatan_pertemuan,
    ).map((item, index) => ({
        id: item.id_pertemuan || item.id || index,
        title:
            item.nama_pertemuan ||
            item.nama ||
            item.title ||
            `Pertemuan ${index + 1}`,
        description: item.deskripsi || item.description || "",
        startDate: item.tanggal_mulai || item.start_date || null,
        endDate: item.tanggal_selesai || item.end_date || null,
        status: item.status || "PLANNED",
    }));
}

function getRatingStats(kegiatan = {}) {
    const ratings = getArray(kegiatan.ratings, kegiatan.rating_items);
    const total = ratings.length;
    const average = total
        ? ratings.reduce((sum, item) => sum + Number(item.rating || 0), 0) / total
        : Number(kegiatan.guru_rating || 0);

    return {
        ratings,
        total,
        average: average ? Number(average.toFixed(2)) : 0,
        guruCount: ratings.filter((item) => String(item.rater_type || "").toUpperCase() === "GURU").length,
        vendorCount: ratings.filter((item) => String(item.rater_type || "").toUpperCase() === "VENDOR").length,
    };
}

async function safeJson(response) {
    try {
        return await response.json();
    } catch {
        return {};
    }
}

function formatCurrency(value) {
    const number = Number(value || 0);

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(number);
}

function formatDate(value) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatChatDateTime(value) {
    if (!value || value === "System" || value === "Now") {
        return {
            label: value || "",
            time: value === "Now" ? "Now" : "",
        };
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return {
            label: "",
            time: "",
        };
    }

    const today = new Date();
    const yesterday = new Date();

    yesterday.setDate(today.getDate() - 1);

    const isSameDate = (a, b) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

    const time = date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
    });

    if (isSameDate(date, today)) {
        return { label: "Hari ini", time };
    }

    if (isSameDate(date, yesterday)) {
        return { label: "Kemarin", time };
    }

    return {
        label: date.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        }),
        time,
    };
}

function getCurrentUserIdFromToken() {
    const token = localStorage.getItem("token");

    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));

        return payload.sub || payload.id_user || payload.id || null;
    } catch {
        return null;
    }
}

function getCommentReadStorageKey(programId) {
    const userId = getCurrentUserIdFromToken() || "guest";
    return `program-comment-read:${userId}:${programId || "unknown"}`;
}

function loadCommentReadRows(programId) {
    try {
        const raw = localStorage.getItem(getCommentReadStorageKey(programId));
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveCommentReadRows(programId, value) {
    try {
        localStorage.setItem(
            getCommentReadStorageKey(programId),
            JSON.stringify(value || {}),
        );
    } catch {
        // localStorage bisa gagal kalau browser membatasi storage
    }
}

function getCurrentUserRoleFromToken() {
    const token = localStorage.getItem("token");

    if (!token) {
        return {
            idRole: null,
            roleText: "",
            isAO: false,
            isHO: false,
            isVendor: false,
            isSekolah: false,
            isGuru: false,
        };
    }

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));

        const idRole = Number(payload.id_role || payload.role_id || 0);

        const roleText = String(
            payload.role ||
            payload.nama_role ||
            payload.jabatan ||
            payload.sub_jenis ||
            ""
        ).toLowerCase();

        return {
            idRole,
            roleText,

            isAO:
                idRole === 4 ||
                roleText.includes("area officer") ||
                roleText === "ao" ||
                roleText.includes("pengawas"),

            isHO:
                idRole === 3 ||
                roleText.includes("head office") ||
                roleText === "ho",

            isVendor:
                idRole === 6 ||
                roleText.includes("vendor") ||
                roleText.includes("narasumber"),

            isSekolah:
                idRole === 5 ||
                roleText.includes("sekolah") ||
                roleText.includes("operator"),

            isGuru:
                idRole === 8 ||
                roleText.includes("guru"),
        };
    } catch {
        return {
            idRole: null,
            roleText: "",
            isAO: false,
            isHO: false,
            isVendor: false,
            isSekolah: false,
            isGuru: false,
        };
    }
}

function getFileUrl(file) {
    if (!file) return null;

    const value = String(file);

    if (value.startsWith("http")) return value;
    if (value.startsWith("/uploads")) return `${API_BASE_URL}${value}`;

    const lower = value.toLowerCase();

    if (
        value.startsWith("MOU-") ||
        value.startsWith("MOU-EDIT-") ||
        lower.includes("mou")
    ) {
        return `${API_BASE_URL}/uploads/mou/${value}`;
    }

    return `${API_BASE_URL}/uploads/dokumentasi/${value}`;
}

function getRequirementFile(requirement) {
    return (
        requirement?.file ||
        requirement?.file_url ||
        requirement?.file_path ||
        requirement?.path ||
        requirement?.file_mou ||
        requirement?.dokumen ||
        requirement?.dokumen_url ||
        requirement?.bukti ||
        requirement?.bukti_url ||
        null
    );
}

function getRequirementStatus(requirement) {
    const currentStatus = String(requirement?.status || "").toUpperCase();
    const possibleFile = getRequirementFile(requirement);

    if (currentStatus === "APPROVED") return "APPROVED";

    if (currentStatus === "WAITING_AO") return "WAITING_AO";
    if (currentStatus === "WAITING_HO") return "WAITING_HO";
    if (currentStatus === "WAITING_UPLOAD") return "WAITING_UPLOAD";

    if (currentStatus === "REJECTED_AO") return "REJECTED_AO";
    if (currentStatus === "REJECTED_HO") return "REJECTED_HO";
    if (currentStatus === "REJECTED") return "REJECTED";

    // Fallback untuk data lama: kalau ada file tapi status kosong,
    // anggap sedang menunggu review AO, bukan langsung HO.
    if (possibleFile) return "WAITING_AO";

    if (requirement?.tipe === "check") return "WAITING_AO";

    return "WAITING_UPLOAD";
}

function getRequirementPurpose(requirement, parentType, parentTitle) {
    const customDescription =
        requirement?.deskripsi ||
        requirement?.description ||
        requirement?.keterangan;

    if (customDescription) return customDescription;

    const name = String(requirement?.nama || requirement?.name || "").toLowerCase();

    if (parentType === "termin") {
        if (name.includes("bayar") || name.includes("pembayaran")) {
            return "Bukti pembayaran atau administrasi awal sebelum aktivitas periode dibuka.";
        }

        if (name.includes("surat")) {
            return "Dokumen administratif pembuka periode yang harus diverifikasi AO dan disetujui HO.";
        }

        if (name.includes("mou")) {
            return "Dokumen legal kerja sama program sebagai dasar pelaksanaan program.";
        }

        return `Bukti administratif pembuka periode untuk ${parentTitle}.`;
    }

    if (name.includes("mulai")) {
        return `Bukti awal sebelum aktivitas ${parentTitle} berjalan.`;
    }

    if (name.includes("laporan")) {
        return `Laporan pelaksanaan aktivitas ${parentTitle}.`;
    }

    if (name.includes("absensi") || name.includes("daftar hadir")) {
        return `Daftar hadir peserta atau pihak yang terlibat pada aktivitas ${parentTitle}.`;
    }

    if (name.includes("dokumentasi") || name.includes("foto")) {
        return `Dokumentasi pendukung sebagai bukti pelaksanaan aktivitas ${parentTitle}.`;
    }

    return `Bukti pendukung yang perlu dipenuhi untuk aktivitas ${parentTitle}.`;
}

function normalizeAssessment(program) {
    const assessment =
        program?.assessment_baseline ||
        program?.assessment ||
        program?.hasil_assessment ||
        program?.baseline_assessment ||
        null;

    if (!assessment) return null;

    if (typeof assessment === "string") {
        try {
            return JSON.parse(assessment);
        } catch {
            return {
                nama_assessment: assessment,
            };
        }
    }

    return assessment;
}

function getAssessmentScore(assessment) {
    return Number(
        assessment?.nilai_total ||
        assessment?.total_score ||
        assessment?.score ||
        assessment?.nilai ||
        assessment?.hasil ||
        assessment?.rata_rata ||
        assessment?.average ||
        0,
    );
}

function getAssessmentTitle(assessment) {
    return (
        assessment?.nama_assessment ||
        assessment?.judul ||
        assessment?.nama ||
        assessment?.kategori ||
        assessment?.nama_kategori ||
        "Assessment Baseline"
    );
}

function getAssessmentChartData(assessment) {
    const candidates =
        assessment?.detail ||
        assessment?.details ||
        assessment?.indikator ||
        assessment?.indikators ||
        assessment?.aspek ||
        assessment?.aspects ||
        assessment?.scores ||
        assessment?.nilai_detail ||
        assessment?.hasil_detail ||
        [];

    if (Array.isArray(candidates) && candidates.length > 0) {
        return candidates.slice(0, 6).map((item, index) => ({
            label:
                item?.nama_indikator ||
                item?.indikator ||
                item?.nama_aspek ||
                item?.aspek ||
                item?.label ||
                `Aspek ${index + 1}`,
            value: Number(
                item?.nilai ||
                item?.score ||
                item?.value ||
                item?.hasil ||
                item?.rata_rata ||
                0,
            ),
        }));
    }

    return [
        {
            label: "Baseline",
            value: getAssessmentScore(assessment),
        },
    ];
}

function parseFlexibleIds(value) {
    if (!value) return [];

    if (Array.isArray(value)) {
        return value.flatMap((item) => parseFlexibleIds(item));
    }

    if (typeof value === "string") {
        const trimmed = value.trim();

        if (!trimmed) return [];

        if (
            (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
            (trimmed.startsWith("{") && trimmed.endsWith("}"))
        ) {
            try {
                return parseFlexibleIds(JSON.parse(trimmed));
            } catch {
                return [trimmed];
            }
        }

        return trimmed
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }

    if (typeof value === "object") {
        return [
            value?.id_sekolah,
            value?.sekolah_id,
            value?.id,
        ].filter(Boolean).map(String);
    }

    return [String(value)];
}

function getProgramSchoolIds(program) {
    const ids = [
        ...parseFlexibleIds(program?.id_sekolah),
        ...parseFlexibleIds(program?.sekolah_id),
        ...parseFlexibleIds(program?.sekolah_ids),
        ...parseFlexibleIds(program?.target_sekolah_ids),
        ...parseFlexibleIds(program?.school_ids),
        ...parseFlexibleIds(program?.sekolah),
        ...parseFlexibleIds(program?.sekolahs),
        ...parseFlexibleIds(program?.schools),
        ...parseFlexibleIds(program?.target_sekolah),
    ];

    return [...new Set(ids.map(String).filter(Boolean))];
}

function canHoAccessProgramDetail(program, currentHo, allSchools = []) {
    if (!currentHo) return true;

    const schoolIds = getProgramSchoolIds(program);

    if (schoolIds.length === 0) {
        return canHoAccessSchool(currentHo, program?.sekolah || {});
    }

    const relatedSchools = allSchools.filter((school) => {
        const schoolId = school?.id_sekolah || school?.id;

        return schoolIds.includes(String(schoolId));
    });

    if (relatedSchools.length === 0) {
        return canHoAccessSchool(currentHo, program?.sekolah || {});
    }

    return relatedSchools.every((school) =>
        canHoAccessSchool(currentHo, school),
    );
}

function StatusPill({ label, className = "" }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-widest ${className}`}
        >
            {label}
        </span>
    );
}

function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-widest ${STATUS_STYLE[status] || STATUS_STYLE.WAITING_UPLOAD
                }`}
        >
            {STATUS_LABEL[status] || status}
        </span>
    );
}

function MiniStat({ label, value }) {
    return (
        <div className="rounded-xl bg-white px-3 py-2 text-center">
            <p className="text-[14px] font-black text-slate-900">{value}</p>
            <p className="mt-0.5 text-[8px] font-black uppercase tracking-widest text-slate-400">
                {label}
            </p>
        </div>
    );
}

function DetailProgramPage({
    kategori = "AKADEMIK",
    titleHighlight = "Akademik",
    editPathPrefix = "/ho/program/akademik/edit",
    backPath = -1,
    badgeText = "AK",
}) {
    const { id } = useParams();
    const navigate = useNavigate();

    const [program, setProgram] = useState(null);
    const [loading, setLoading] = useState(true);

    const [masterSekolah, setMasterSekolah] = useState([]);
    const [masterHos, setMasterHos] = useState([]);
    const [masterAos, setMasterAos] = useState([]);
    const [masterVendor, setMasterVendor] = useState([]);
    const [ratingSummary, setRatingSummary] = useState(null);

    const [activePhase, setActivePhase] = useState(0);
    const [selectedRow, setSelectedRow] = useState(null);
    const [monitoringRows, setMonitoringRows] = useState({});

    const [showChat, setShowChat] = useState(false);
    const [chatContext, setChatContext] = useState(null);
    const [message, setMessage] = useState("");
    const [reviewModal, setReviewModal] = useState(null);

    // Comment system
    const [showCommentDrawer, setShowCommentDrawer] = useState(false);
    const [commentRow, setCommentRow] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [commentType, setCommentType] = useState("AO_REVIEW");
    const [commentLoading, setCommentLoading] = useState(false);

    // UI state: badge komentar hilang setelah drawer komentar dibuka.
    const [readCommentRows, setReadCommentRows] = useState(() =>
        loadCommentReadRows(id),
    );

    // UI state: filter konten eksekusi berdasarkan shape alur.
    const [flowFilter, setFlowFilter] = useState({
        type: "phase",
        phaseIndex: 0,
        rowId: null,
        rowType: null,
    });

    // Guru rating
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [ratingRow, setRatingRow] = useState(null);
    const [ratingValue, setRatingValue] = useState(0);
    const [ratingComment, setRatingComment] = useState("");
    const [ratingLoading, setRatingLoading] = useState(false);

    const [chats, setChats] = useState([
        {
            sender: "System",
            text:
                "Ruang diskusi monitoring aktif. Gunakan chat untuk koordinasi, upload bukti untuk eksekusi, review AO, dan keputusan HO.",
            isSystem: true,
            time: "System",
        },
    ]);

    const assessment = useMemo(() => normalizeAssessment(program), [program]);
    const assessmentChartData = assessment ? getAssessmentChartData(assessment) : [];
    const currentRole = useMemo(() => getCurrentUserRoleFromToken(), []);

    const fetchUserById = async (userId, headers) => {
        if (!userId) return null;

        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                headers,
            });

            const result = await safeJson(response);

            if (!response.ok) return null;

            return result?.data || result;
        } catch (error) {
            console.error("Gagal mengambil user by id:", error);
            return null;
        }
    };

    const fetchProgramDetail = async () => {
        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const headers = {
                Authorization: `Bearer ${token}`,
            };

            const currentHoId = getCurrentUserIdFromToken();

            const [resProgram, resSekolah, resHo, resAo, resVendor, resCurrentHo, resRatingSummary] =
                await Promise.all([
                    fetch(`${API_BASE_URL}/program/${id}`, { headers }),
                    fetch(`${API_BASE_URL}/sekolah`, { headers }),
                    fetch(`${API_BASE_URL}/users/ho`, { headers }),
                    fetch(`${API_BASE_URL}/users/ao`, { headers }),
                    fetch(`${API_BASE_URL}/vendor?kategori=${kategori}`, { headers }),
                    currentHoId
                        ? fetch(`${API_BASE_URL}/users/${currentHoId}`, { headers })
                        : Promise.resolve(null),
                    fetch(`${API_BASE_URL}/program/${id}/rating-summary`, { headers }),
                ]);

            const dataProgram = await safeJson(resProgram);
            const dataSekolah = await safeJson(resSekolah);
            const dataHo = await safeJson(resHo);
            const dataAo = await safeJson(resAo);
            const dataVendor = await safeJson(resVendor);
            const dataCurrentHo = resCurrentHo ? await safeJson(resCurrentHo) : null;
            const dataRatingSummary = await safeJson(resRatingSummary);

            if (!resProgram.ok) {
                throw new Error(dataProgram?.message || "Gagal memuat detail program");
            }

            const detail = dataProgram?.data || dataProgram;

            const allSchools = normalizeArray(dataSekolah);
            const currentHo = dataCurrentHo?.data || dataCurrentHo || null;

            const allowedToView = canHoAccessProgramDetail(
                detail,
                currentHo,
                allSchools,
            );

            if (!allowedToView) {
                toast.error("Kamu tidak punya akses untuk melihat detail program ini.");
                navigate(backPath);
                return;
            }

            const normalizedHo = normalizeArray(dataHo);
            const normalizedAo = normalizeArray(dataAo);

            const hoId =
                detail?.id_ho ||
                detail?.dibuat_oleh ||
                detail?.created_by_id ||
                detail?.ho_id ||
                detail?.ho?.id_user ||
                detail?.ho?.id ||
                null;

            const aoId =
                detail?.id_pengawas ||
                detail?.id_ao ||
                detail?.pengawas_id ||
                detail?.area_officer_id ||
                detail?.ao?.id_user ||
                detail?.ao?.id ||
                detail?.pengawas?.id_user ||
                detail?.pengawas?.id ||
                null;

            if (normalizedHo.length === 0 && hoId) {
                const fallbackHo = await fetchUserById(hoId, headers);

                if (fallbackHo) {
                    normalizedHo.push(fallbackHo);
                }
            }

            if (normalizedAo.length === 0 && aoId) {
                const fallbackAo = await fetchUserById(aoId, headers);

                if (fallbackAo) {
                    normalizedAo.push(fallbackAo);
                }
            }

            setProgram(detail);
            setMasterSekolah(normalizeArray(dataSekolah));
            setMasterHos(normalizedHo);
            setMasterAos(normalizedAo);
            setMasterVendor(normalizeArray(dataVendor));
            setRatingSummary(resRatingSummary?.ok ? dataRatingSummary : null);
            setMonitoringRows(buildMonitoringRows(detail));
            setActivePhase(0);
            setSelectedRow(null);
            setFlowFilter({
                type: "phase",
                phaseIndex: 0,
                rowId: null,
                rowType: null,
            });
        } catch (error) {
            console.error("Gagal memuat detail program:", error);
            toast.error(error.message || "Gagal memuat detail program");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProgramDetail();
    }, [id, kategori]);

    useEffect(() => {
        setReadCommentRows(loadCommentReadRows(id));
    }, [id]);

    const getSchoolName = () => {
        const school = masterSekolah.find(
            (item) =>
                String(item.id_sekolah || item.id) === String(program?.id_sekolah),
        );

        return (
            program?.sekolah?.nama_sekolah ||
            program?.nama_sekolah ||
            school?.nama_sekolah ||
            school?.nama ||
            "-"
        );
    };

    const getAoName = () => {
        const aoId =
            program?.id_pengawas ||
            program?.id_ao ||
            program?.pengawas_id ||
            program?.area_officer_id ||
            program?.ao?.id_user ||
            program?.ao?.id ||
            program?.pengawas?.id_user ||
            program?.pengawas?.id ||
            null;

        const ao = masterAos.find((item) => {
            const itemId =
                item?.id_user ||
                item?.id_ao ||
                item?.id_area_officer ||
                item?.id;

            return String(itemId) === String(aoId);
        });

        return (
            program?.pengawas?.nama ||
            program?.pengawas?.name ||
            program?.ao?.nama ||
            program?.ao?.name ||
            program?.nama_pengawas ||
            program?.nama_ao ||
            ao?.nama ||
            ao?.name ||
            ao?.nama_lengkap ||
            "-"
        );
    };

    const getHoName = () => {
        const hoId =
            program?.id_ho ||
            program?.dibuat_oleh ||
            program?.created_by_id ||
            program?.ho_id ||
            program?.ho?.id_user ||
            program?.ho?.id ||
            program?.user?.id_user ||
            program?.user?.id ||
            null;

        const ho = masterHos.find((item) => {
            const itemId =
                item?.id_user ||
                item?.id_ho ||
                item?.id_head_office ||
                item?.id;

            return String(itemId) === String(hoId);
        });

        return (
            program?.ho?.nama ||
            program?.ho?.name ||
            program?.created_by?.nama ||
            program?.created_by?.name ||
            program?.user?.nama ||
            program?.user?.name ||
            program?.nama_ho ||
            ho?.nama ||
            ho?.name ||
            ho?.nama_lengkap ||
            "-"
        );
    };

    const getVendorName = () => {
        const vendorIds = Array.isArray(program?.vendor_ids)
            ? program.vendor_ids
            : Array.isArray(program?.id_vendor)
                ? program.id_vendor
                : program?.id_vendor
                    ? [program.id_vendor]
                    : [];

        const names = vendorIds
            .map((idVendor) => {
                const vendor = masterVendor.find(
                    (item) =>
                        String(item.id_vendor || item.vendor_id || item.id) ===
                        String(idVendor),
                );

                return (
                    vendor?.nama_vendor ||
                    vendor?.nama_perusahaan ||
                    vendor?.nama ||
                    vendor?.name
                );
            })
            .filter(Boolean);

        return program?.nama_vendor || names.join(", ") || "-";
    };
    const normalizeRequirement = (requirement, reqIndex, programDetail, context) => {
        const file = getRequirementFile(requirement);
        const status = getRequirementStatus(requirement);

        const requirementName =
            requirement?.nama ||
            requirement?.name ||
            requirement?.nama_persyaratan ||
            `Upload Bukti ${reqIndex + 1}`;

        const requirementType = requirement?.tipe || requirement?.type || "upload";

        const fileName =
            requirement?.nama_file ||
            requirement?.original_name ||
            requirement?.file_name ||
            requirement?.filename ||
            file ||
            null;

        return {
            id:
                requirement?.id_persyaratan ||
                requirement?.id_persyaratan_termin ||
                requirement?.id_persyaratan_kegiatan ||
                requirement?.id ||
                `REQ-${context.parentType}-${context.parentId}-${reqIndex}`,

            rawId:
                requirement?.id_persyaratan ||
                requirement?.id_persyaratan_termin ||
                requirement?.id_persyaratan_kegiatan ||
                requirement?.id ||
                null,

            phaseIndex: context.phaseIndex,
            phaseId: context.phaseId,
            phaseName: context.phaseName,

            parentType: context.parentType,
            parentId: context.parentId,
            parentTitle: context.parentTitle,
            parentLabel: context.parentLabel,
            parentDescription: context.parentDescription,

            name: requirementName,
            type: requirementType,

            description:
                requirement?.deskripsi ||
                requirement?.description ||
                requirement?.keterangan ||
                "",

            purpose: getRequirementPurpose(
                {
                    ...requirement,
                    nama: requirementName,
                    tipe: requirementType,
                },
                context.parentType,
                context.parentTitle,
            ),

            file,
            fileName,
            status,

            approvedAt: requirement?.approved_at || requirement?.tanggal_approve || null,
            rejectedAt: requirement?.rejected_at || requirement?.tanggal_reject || null,

            rejectedReason:
                requirement?.alasan_reject ||
                requirement?.alasan ||
                requirement?.catatan_reject ||
                "",

            history: Array.isArray(requirement?.history)
                ? requirement.history
                : file
                    ? [
                        {
                            file,
                            status:
                                status === "REJECTED"
                                    ? "REJECTED"
                                    : status === "APPROVED"
                                        ? "APPROVED"
                                        : "SUBMITTED",
                            note: "File sudah diunggah",
                            time: requirement?.updated_at || requirement?.created_at || "-",
                        },
                    ]
                    : [],
        };
    };

    const buildMonitoringRows = (detail) => {
        const sourceFases =
            Array.isArray(detail?.fases) && detail.fases.length > 0
                ? detail.fases
                : [];

        const result = {};

        sourceFases.forEach((fase, faseIndex) => {
            const rows = [];

            const phaseName = fase.nama_fase || fase.nama || `Periode ${faseIndex + 1}`;
            const phaseId = fase.id_fase || fase.id || faseIndex;

            const terminList = getArray(
                fase.termin,
                fase.termins,
                fase.t_termin,
                fase.termin_luar,
            );

            const kegiatanList = getArray(
                fase.kegiatans,
                fase.kegiatan,
                fase.t_kegiatans,
                fase.kegiatan_fase,
            );

            terminList.forEach((termin, terminIndex) => {
                const requirements = getArray(
                    termin.persyaratan,
                    termin.persyaratan_termin,
                    termin.requirements,
                    termin.t_persyaratan_termin,
                );

                const parentTitle =
                    termin.nama_termin ||
                    termin.nama ||
                    `Administrasi Pembuka Periode ${terminIndex + 1}`;

                const parentId =
                    termin.id_termin ||
                    termin.id ||
                    termin.id_termin_luar ||
                    null;

                const parentDescription =
                    termin.deskripsi ||
                    termin.description ||
                    EXECUTION_COPY.openingDesc;

                rows.push({
                    id: parentId
                        ? `termin-${parentId}`
                        : `termin-${faseIndex}-${terminIndex}-${parentTitle}`,

                    type: "termin",
                    title: parentTitle,
                    description: parentDescription,

                    phaseIndex: faseIndex,
                    phaseId,
                    phaseName,

                    parentId,
                    parentLabel: "Administrasi Pembuka",
                    parentSubtitle: "Bukti Administratif Periode",

                    amount: 0,

                    evidences: requirements.map((req, reqIndex) =>
                        normalizeRequirement(req, reqIndex, detail, {
                            phaseIndex: faseIndex,
                            phaseId,
                            phaseName,
                            parentType: "termin",
                            parentId,
                            parentTitle,
                            parentLabel: "Administrasi Pembuka",
                            parentDescription,
                        }),
                    ),
                });
            });

            kegiatanList.forEach((kegiatan, kegiatanIndex) => {
                const requirements = getArray(
                    kegiatan.persyaratan,
                    kegiatan.persyaratan_kegiatan,
                    kegiatan.requirements,
                    kegiatan.t_persyaratan_kegiatan,
                );
                const meetings = normalizeMeetings(kegiatan);
                const ratingStats = getRatingStats(kegiatan);

                const parentTitle =
                    kegiatan.nama_kegiatans ||
                    kegiatan.nama_kegiatan ||
                    kegiatan.nama ||
                    `Kegiatan ${kegiatanIndex + 1}`;

                const parentId =
                    kegiatan.id_kegiatans ||
                    kegiatan.id_kegiatan ||
                    kegiatan.id ||
                    null;

                const parentDescription =
                    kegiatan.deskripsi ||
                    kegiatan.description ||
                    EXECUTION_COPY.innerDesc;

                rows.push({
                    id: parentId
                        ? `kegiatan-${parentId}`
                        : `kegiatan-${faseIndex}-${kegiatanIndex}-${parentTitle}`,

                    type: "kegiatan",
                    title: parentTitle,
                    description: parentDescription,

                    phaseIndex: faseIndex,
                    phaseId,
                    phaseName,

                    parentId,
                    parentLabel: "Aktivitas Kegiatan",
                    parentSubtitle: "Bukti Pelaksanaan Aktivitas",

                    amount: null,

                    // New fields from backend
                    statusKegiatan: kegiatan.status_kegiatan || "LOCKED",
                    guruRating: kegiatan.guru_rating || null,
                    guruComment: kegiatan.guru_comment || null,
                    meetings,
                    ratingStats,
                    commentCount: Array.isArray(kegiatan.comments) ? kegiatan.comments.length : 0,
                    tanggalMulai: kegiatan.tanggal_mulai || null,
                    tanggalSelesai: kegiatan.tanggal_selesai || null,

                    evidences: requirements.map((req, reqIndex) =>
                        normalizeRequirement(req, reqIndex, detail, {
                            phaseIndex: faseIndex,
                            phaseId,
                            phaseName,
                            parentType: "kegiatan",
                            parentId,
                            parentTitle,
                            parentLabel: "Aktivitas Kegiatan",
                            parentDescription,
                        }),
                    ),
                });
            });

            result[faseIndex] = rows;
        });

        return result;
    };

    const phases = useMemo(() => {
        if (Array.isArray(program?.fases) && program.fases.length > 0) {
            return program.fases.map((fase, index) => ({
                id: fase.id_fase || fase.id || index,
                nama: fase.nama_fase || fase.nama || `Periode ${index + 1}`,
                deskripsi: fase.deskripsi || fase.description || "",
            }));
        }

        return [];
    }, [program]);

    const allCurrentRows = monitoringRows[activePhase] || [];

    const openingRows = useMemo(() => {
        return allCurrentRows.filter((row) => row.type === "termin");
    }, [allCurrentRows]);

    const innerRows = useMemo(() => {
        return allCurrentRows.filter((row) => row.type === "kegiatan");
    }, [allCurrentRows]);

    const visibleOpeningRows = useMemo(() => {
        if (flowFilter?.type === "row") {
            return openingRows.filter(
                (row) => row.id === flowFilter.rowId && row.type === "termin",
            );
        }

        return openingRows;
    }, [openingRows, flowFilter]);

    const visibleInnerRows = useMemo(() => {
        if (flowFilter?.type === "row") {
            return innerRows.filter(
                (row) => row.id === flowFilter.rowId && row.type === "kegiatan",
            );
        }

        return innerRows;
    }, [innerRows, flowFilter]);

    const hasVisibleOpeningRows = visibleOpeningRows.length > 0;
    const hasVisibleInnerRows = visibleInnerRows.length > 0;

    const getRowStatus = (row) => {
        if (!row?.evidences?.length) return "WAITING_UPLOAD";

        if (row.evidences.every((item) => item.status === "APPROVED")) {
            return "APPROVED";
        }

        if (row.evidences.some((item) => item.status === "REJECTED_HO")) {
            return "REJECTED_HO";
        }

        if (row.evidences.some((item) => item.status === "REJECTED_AO")) {
            return "REJECTED_AO";
        }

        if (row.evidences.some((item) => item.status === "REJECTED")) {
            return "REJECTED";
        }

        if (row.evidences.some((item) => item.status === "WAITING_HO")) {
            return "WAITING_HO";
        }

        if (row.evidences.some((item) => item.status === "WAITING_AO")) {
            return "WAITING_AO";
        }

        return "WAITING_UPLOAD";
    };

    const isRowApproved = (row) => getRowStatus(row) === "APPROVED";

    const getOpeningRows = (phaseIndex) => {
        const rows = monitoringRows[phaseIndex] || [];
        return rows.filter((row) => row.type === "termin");
    };

    const getInnerRows = (phaseIndex) => {
        const rows = monitoringRows[phaseIndex] || [];
        return rows.filter((row) => row.type === "kegiatan");
    };

    const getRowsRequirements = (rows = []) => {
        return rows.flatMap((row) =>
            Array.isArray(row.evidences) ? row.evidences : [],
        );
    };

    const isOpeningCompleted = (phaseIndex) => {
        const rows = getOpeningRows(phaseIndex);
        const requirements = getRowsRequirements(rows);

        if (rows.length === 0) return false;
        if (requirements.length === 0) return false;

        return requirements.every((item) => item.status === "APPROVED");
    };

    const isInnerCompleted = (phaseIndex) => {
        const rows = getInnerRows(phaseIndex);
        const requirements = getRowsRequirements(rows);

        if (rows.length === 0) return false;
        if (requirements.length === 0) return false;

        return requirements.every((item) => item.status === "APPROVED");
    };

    const isPhaseCompleted = (phaseIndex) => {
        return isOpeningCompleted(phaseIndex) && isInnerCompleted(phaseIndex);
    };

    const checkPhaseUnlocked = (phaseIndex) => {
        if (phaseIndex === 0) return true;

        for (let index = 0; index < phaseIndex; index += 1) {
            if (!isPhaseCompleted(index)) return false;
        }

        return true;
    };

    const isPhaseContentOpen = (phaseIndex) => {
        return checkPhaseUnlocked(phaseIndex) && isOpeningCompleted(phaseIndex);
    };

    const getPhaseWorkflowStatus = (phaseIndex) => {
        if (!checkPhaseUnlocked(phaseIndex)) {
            return {
                label: "Periode Terkunci",
                description:
                    "Periode ini akan terbuka setelah periode sebelumnya selesai.",
                className: "border-slate-100 bg-slate-50 text-slate-400",
            };
        }

        if (!isOpeningCompleted(phaseIndex)) {
            return {
                label: "Menunggu Administrasi",
                description:
                    "Aktivitas pada periode ini masih terkunci sampai seluruh administrasi pembuka direview AO dan disetujui HO.",
                className: "border-amber-100 bg-amber-50 text-amber-600",
            };
        }

        if (!isInnerCompleted(phaseIndex)) {
            return {
                label: "Aktivitas Terbuka",
                description:
                    "Administrasi pembuka sudah disetujui. Narasumber dapat menjalankan aktivitas dan mengunggah bukti pelaksanaan.",
                className: "border-cyan-100 bg-cyan-50 text-cyan-600",
            };
        }

        return {
            label: "Periode Selesai",
            description:
                "Seluruh administrasi pembuka dan bukti aktivitas pada periode ini sudah disetujui.",
            className: "border-emerald-100 bg-emerald-50 text-emerald-600",
        };
    };

    const isPreviousRowsCompleted = (rows, currentIndex) => {
        if (currentIndex <= 0) return true;

        const previousRows = rows.slice(0, currentIndex);

        return previousRows.every((row) => isRowApproved(row));
    };

    const isOpeningRowUnlocked = (row) => {
        if (!checkPhaseUnlocked(activePhase)) return false;

        const rowIndex = openingRows.findIndex((item) => item.id === row.id);

        if (rowIndex === -1) return false;

        return isPreviousRowsCompleted(openingRows, rowIndex);
    };

    const isInnerRowUnlocked = (row) => {
        if (!checkPhaseUnlocked(activePhase)) return false;
        if (!isPhaseContentOpen(activePhase)) return false;

        const rowIndex = innerRows.findIndex((item) => item.id === row.id);

        if (rowIndex === -1) return false;

        return isPreviousRowsCompleted(innerRows, rowIndex);
    };

    const isRowLocked = (row) => {
        if (!row) return true;

        if (row.type === "termin") return !isOpeningRowUnlocked(row);
        if (row.type === "kegiatan") return !isInnerRowUnlocked(row);

        return true;
    };

    const activeWorkflowStatus = getPhaseWorkflowStatus(activePhase);

    const getSectionStatus = (type) => {
        if (!checkPhaseUnlocked(activePhase)) {
            return {
                label: "Terkunci",
                icon: <Lock size={15} />,
                className: "border-slate-100 bg-slate-50 text-slate-400",
            };
        }

        if (type === "opening") {
            if (isOpeningCompleted(activePhase)) {
                return {
                    label: "Selesai",
                    icon: <CheckCircle2 size={15} />,
                    className: "border-emerald-100 bg-emerald-50 text-emerald-600",
                };
            }

            return {
                label: "Perlu Upload / Validasi",
                icon: <Clock size={15} />,
                className: "border-amber-100 bg-amber-50 text-amber-600",
            };
        }

        if (!isPhaseContentOpen(activePhase)) {
            return {
                label: "Terkunci",
                icon: <Lock size={15} />,
                className: "border-slate-100 bg-slate-50 text-slate-400",
            };
        }

        if (isInnerCompleted(activePhase)) {
            return {
                label: "Selesai",
                icon: <CheckCircle2 size={15} />,
                className: "border-emerald-100 bg-emerald-50 text-emerald-600",
            };
        }

        return {
            label: "Terbuka",
            icon: <UploadCloud size={15} />,
            className: "border-cyan-100 bg-cyan-50 text-cyan-600",
        };
    };

    const openingSectionStatus = getSectionStatus("opening");
    const innerSectionStatus = getSectionStatus("inner");

    const progress = useMemo(() => {
        const allRequirements = Object.values(monitoringRows)
            .flat()
            .flatMap((row) => row.evidences || []);

        const total = allRequirements.length;

        const approved = allRequirements.filter(
            (item) => item.status === "APPROVED",
        ).length;

        const waitingAo = allRequirements.filter(
            (item) => item.status === "WAITING_AO",
        ).length;

        const waitingHo = allRequirements.filter(
            (item) => item.status === "WAITING_HO",
        ).length;

        const waitingUpload = allRequirements.filter(
            (item) => item.status === "WAITING_UPLOAD",
        ).length;

        const rejected = allRequirements.filter((item) =>
            ["REJECTED", "REJECTED_AO", "REJECTED_HO"].includes(item.status),
        ).length;

        return {
            approved,
            waitingAo,
            waitingHo,
            waitingUpload,
            rejected,
            total,
            percentage: total ? Math.round((approved / total) * 100) : 0,
        };
    }, [monitoringRows]);

    const appendSystemChat = (text) => {
        setChats((prev) => [
            ...prev,
            {
                sender: "System",
                text,
                isSystem: true,
                time: "Now",
            },
        ]);
    };

    const updateEvidenceStatus = async ({
        rowId,
        evidenceIndex,
        action,
        reason = "",
    }) => {
        const rows = monitoringRows[activePhase] || [];
        const targetRow = rows.find((row) => row.id === rowId);
        const targetEvidence = targetRow?.evidences?.[evidenceIndex];

        if (!targetRow || !targetEvidence) {
            toast.error("Data bukti tidak ditemukan");
            return;
        }

        if (!targetEvidence.rawId) {
            toast.error("ID bukti tidak ditemukan. Cek data detail program.");
            return;
        }

        const role = getCurrentUserRoleFromToken();

        const isAoAction = action === "AO_APPROVE" || action === "AO_REJECT";
        const isHoAction = action === "HO_APPROVE" || action === "HO_REJECT";

        if (isAoAction && !role.isAO) {
            toast.error("Akses ditolak. Hanya Area Officer yang bisa melakukan review AO.");
            return;
        }

        if (isHoAction && !role.isHO) {
            toast.error("Akses ditolak. Hanya Head Office yang bisa memberi keputusan final.");
            return;
        }

        if (isAoAction && targetEvidence.status !== "WAITING_AO") {
            toast.info("Bukti belum dalam status menunggu review AO.");
            return;
        }

        if (isHoAction && targetEvidence.status !== "WAITING_HO") {
            toast.info("Bukti belum dalam status menunggu keputusan HO.");
            return;
        }

        const token = localStorage.getItem("token");

        const endpointBase =
            targetEvidence.parentType === "termin"
                ? `${API_BASE_URL}/program/persyaratan-termin/${targetEvidence.rawId}`
                : `${API_BASE_URL}/program/persyaratan-kegiatan/${targetEvidence.rawId}`;

        let endpoint = endpointBase;
        let nextStatus = targetEvidence.status;
        let successText = "Status bukti berhasil diperbarui";

        if (action === "AO_APPROVE") {
            endpoint = `${endpointBase}/ao-approve`;
            nextStatus = "WAITING_HO";
            successText = "Review AO disetujui. Bukti diteruskan ke HO.";
        }

        if (action === "AO_REJECT") {
            endpoint = `${endpointBase}/ao-reject`;
            nextStatus = "REJECTED_AO";
            successText = "Bukti ditolak AO. Narasumber perlu upload ulang.";
        }

        if (action === "HO_APPROVE") {
            endpoint = `${endpointBase}/approve`;
            nextStatus = "APPROVED";
            successText = "Bukti berhasil di-ACC oleh HO.";
        }

        if (action === "HO_REJECT") {
            endpoint = `${endpointBase}/reject`;
            nextStatus = "REJECTED_HO";
            successText = "Bukti ditolak HO. Narasumber perlu upload ulang.";
        }

        try {
            const response = await fetch(endpoint, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body:
                    action === "AO_REJECT" || action === "HO_REJECT"
                        ? JSON.stringify({
                            alasan:
                                reason ||
                                "Dokumen belum sesuai, mohon upload ulang.",
                            reason:
                                reason ||
                                "Dokumen belum sesuai, mohon upload ulang.",
                            komentar:
                                reason ||
                                "Dokumen belum sesuai, mohon upload ulang.",
                        })
                        : JSON.stringify({}),
            });

            const result = await safeJson(response);

            if (!response.ok) {
                throw new Error(
                    result?.message ||
                    result?.error ||
                    "Gagal memperbarui status bukti"
                );
            }

            toast.success(result?.message || successText);

            appendSystemChat(
                `${targetEvidence.parentLabel} "${targetEvidence.parentTitle}" - bukti "${targetEvidence.name}" berubah status menjadi ${STATUS_LABEL[nextStatus] || nextStatus}.`
            );

            await fetchProgramDetail();
        } catch (error) {
            console.error("Gagal memperbarui status bukti:", error);
            toast.error(error.message || "Gagal memperbarui status bukti");
        }
    };

    const buildChatQuery = (context = chatContext) => {
        if (!program) return "";

        const params = new URLSearchParams();

        params.append("id_program", String(program.id_program));

        if (context?.phaseId) {
            params.append("id_fase", String(context.phaseId));
        }

        if (context?.parentType === "termin" && context?.parentId) {
            params.append("id_termin", String(context.parentId));
        }

        if (context?.parentType === "kegiatan" && context?.parentId) {
            params.append("id_kegiatans", String(context.parentId));
        }

        if (context?.requirementId) {
            params.append("id_persyaratan", String(context.requirementId));
        }

        return params.toString();
    };

    const normalizeChatFromBackend = (items = [], context = chatContext) => {
        const currentUserId = getCurrentUserIdFromToken();

        return items.map((item) => {
            const formatted = formatChatDateTime(item.created_at);

            return {
                id_chat: item.id_chat,
                sender: item.nama_user || "User",
                role: item.role_user || "",
                text: item.pesan,
                self: String(item.id_user) === String(currentUserId),
                dateLabel: formatted.label,
                time: formatted.time,
                createdAt: item.created_at,
                context,
            };
        });
    };

    const fetchChats = async (context = chatContext, silent = false) => {
        try {
            const token = localStorage.getItem("token");
            const query = buildChatQuery(context);

            if (!query) return;

            const response = await fetch(`${API_BASE_URL}/termin/chat?${query}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = await safeJson(response);

            if (!response.ok) {
                throw new Error(result?.message || "Gagal mengambil chat");
            }

            const payload = Array.isArray(result)
                ? result
                : Array.isArray(result?.data)
                    ? result.data
                    : Array.isArray(result?.items)
                        ? result.items
                        : [];

            setChats([
                {
                    sender: "System",
                    text:
                        "Ruang diskusi aktif. Pesan tersimpan sebagai history berdasarkan program, fase, kegiatan/termin, dan dokumen upload.",
                    isSystem: true,
                    time: "System",
                },
                ...normalizeChatFromBackend(payload, context),
            ]);
        } catch (error) {
            console.error("Gagal mengambil chat:", error);

            if (!silent) {
                toast.error(error.message || "Gagal mengambil chat");
            }
        }
    };

    const openChatForRow = async (row, evidence = null) => {
        const finalContext = {
            phaseId: row.phaseId,
            phaseName: row.phaseName,

            rowId: row.id,
            rowTitle: row.title,
            rowType: row.type,

            parentType: row.type,
            parentId: row.parentId,

            requirementId: evidence?.rawId || null,
            evidenceName: evidence?.name || null,
            evidenceStatus: evidence?.status || null,
        };

        setChatContext(finalContext);
        setShowChat(true);

        await fetchChats(finalContext);
    };

    const openGeneralChat = async () => {
        const finalContext = {
            phaseId: phases[activePhase]?.id || null,
            phaseName: phases[activePhase]?.nama || null,

            rowId: null,
            rowTitle: null,
            rowType: null,

            parentType: null,
            parentId: null,

            requirementId: null,
            evidenceName: null,
            evidenceStatus: null,
        };

        setChatContext(finalContext);
        setShowChat(true);

        await fetchChats(finalContext);
    };

    const sendMessage = async () => {
        if (!message.trim()) return;

        try {
            const token = localStorage.getItem("token");

            const payload = {
                id_program: program?.id_program,
                id_fase: chatContext?.phaseId || null,
                id_termin:
                    chatContext?.parentType === "termin"
                        ? chatContext?.parentId
                        : null,
                id_kegiatans:
                    chatContext?.parentType === "kegiatan"
                        ? chatContext?.parentId
                        : null,
                id_persyaratan: chatContext?.requirementId || null,
                konteks: chatContext?.requirementId
                    ? "PERSYARATAN"
                    : chatContext?.parentType === "termin"
                        ? "TERMIN"
                        : chatContext?.parentType === "kegiatan"
                            ? "KEGIATAN"
                            : "PROGRAM",
                pesan: message.trim(),
            };

            const response = await fetch(`${API_BASE_URL}/termin/chat`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const result = await safeJson(response);

            if (!response.ok) {
                throw new Error(result?.message || "Gagal mengirim chat");
            }

            setMessage("");
            await fetchChats(chatContext, true);
        } catch (error) {
            console.error("Gagal mengirim chat:", error);
            toast.error(error.message || "Gagal mengirim chat");
        }
    };

    useEffect(() => {
        if (!showChat || !chatContext || !program?.id_program) return;

        fetchChats(chatContext, true);

        const intervalId = setInterval(() => {
            fetchChats(chatContext, true);
        }, 3000);

        return () => clearInterval(intervalId);
    }, [showChat, chatContext, program?.id_program]);

    const getGroupedChats = () => {
        const grouped = [];

        chats.forEach((chat) => {
            const dateInfo = formatChatDateTime(chat.time);
            const label = chat.isSystem ? "System" : dateInfo.label || "Hari ini";

            const lastGroup = grouped[grouped.length - 1];

            if (!lastGroup || lastGroup.label !== label) {
                grouped.push({
                    label,
                    items: [chat],
                });
            } else {
                lastGroup.items.push(chat);
            }
        });

        return grouped;
    };

    const openFile = (file) => {
        const url = getFileUrl(file);

        if (!url) {
            toast.info("File belum tersedia");
            return;
        }

        window.open(url, "_blank", "noopener,noreferrer");
    };

    // â”€â”€â”€ COMMENT FUNCTIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    const fetchComments = async (idKegiatan) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/program/kegiatan/${idKegiatan}/comments`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await safeJson(res);
            setComments(Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []);
        } catch {
            setComments([]);
        }
    };

    const openCommentForRow = async (row) => {
        if (!row?.parentId) return;

        setCommentRow(row);
        setComments([]);
        setCommentText("");

        const nextReadRows = {
            ...readCommentRows,
            [row.id]: Number(row.commentCount || 0),
        };

        setReadCommentRows(nextReadRows);
        saveCommentReadRows(id, nextReadRows);

        const token = localStorage.getItem("token");

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const idRole = Number(payload.id_role || payload.role_id || 0);

            if (idRole === 4) {
                setCommentType("AO_REVIEW");
            } else if (idRole === 3) {
                setCommentType("HO_APPROVAL");
            } else if (idRole === 8) {
                setCommentType("GURU_RATING");
            } else {
                setCommentType("AO_REVIEW");
            }
        } catch {
            setCommentType("AO_REVIEW");
        }

        setShowCommentDrawer(true);
        await fetchComments(row.parentId);
    };

    const submitComment = async () => {
        if (!commentText.trim() || !commentRow?.parentId) return;
        setCommentLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/program/kegiatan/${commentRow.parentId}/comment`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ comment_text: commentText.trim(), comment_type: commentType }),
            });
            const data = await safeJson(res);
            if (!res.ok) throw new Error(data?.message || "Gagal kirim komentar");
            setCommentText("");
            await fetchComments(commentRow.parentId);
            // Refresh monitoring rows untuk update commentCount
            await fetchProgramDetail();
            toast.success("Komentar berhasil dikirim");
        } catch (e) {
            toast.error(e.message || "Gagal kirim komentar");
        } finally {
            setCommentLoading(false);
        }
    };

    // â”€â”€â”€ GURU RATING FUNCTIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    const openRatingModal = (row) => {
        if (!row?.parentId) return;
        setRatingRow(row);
        setRatingValue(row.guruRating || 0);
        setRatingComment(row.guruComment || "");
        setShowRatingModal(true);
    };

    const submitRating = async () => {
        if (!ratingValue || ratingValue < 1 || !ratingRow?.parentId) {
            toast.warning("Pilih rating terlebih dahulu (1-5 bintang)");
            return;
        }
        setRatingLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/program/kegiatan/${ratingRow.parentId}/rating`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ rating: ratingValue, comment: ratingComment }),
            });
            const data = await safeJson(res);
            if (!res.ok) throw new Error(data?.message || "Gagal kirim rating");
            toast.success("Rating berhasil disimpan! Terima kasih atas feedbacknya.");
            setShowRatingModal(false);
            await fetchProgramDetail();
        } catch (e) {
            toast.error(e.message || "Gagal kirim rating");
        } finally {
            setRatingLoading(false);
        }
    };

    const openEvidenceReviewModal = (row, evidence, evidenceIndex) => {
        setReviewModal({
            row,
            evidence,
            evidenceIndex,
            locked: isRowLocked(row),
        });
    };

    const closeEvidenceReviewModal = () => {
        setReviewModal(null);
    };

    const handleModalApprove = async () => {
        if (!reviewModal) return;

        await handleApproveEvidence(reviewModal.row, reviewModal.evidenceIndex);
        closeEvidenceReviewModal();
    };

    const handleModalReject = async () => {
        if (!reviewModal) return;

        await handleRejectEvidence(reviewModal.row, reviewModal.evidenceIndex);
        closeEvidenceReviewModal();
    };

    const getEvidenceStatusMeta = (status, locked = false) => {
        if (locked) {
            return {
                label: STATUS_LABEL.LOCKED,
                className: STATUS_STYLE.LOCKED,
                icon: <Lock size={13} />,
            };
        }

        const currentStatus = status || "WAITING_UPLOAD";

        return {
            label: STATUS_LABEL[currentStatus] || currentStatus,
            className:
                STATUS_STYLE[currentStatus] || STATUS_STYLE.WAITING_UPLOAD,
            icon:
                currentStatus === "APPROVED" ? (
                    <CheckCircle2 size={13} />
                ) : currentStatus === "WAITING_AO" ? (
                    <UserCheck size={13} />
                ) : currentStatus === "WAITING_HO" ? (
                    <Clock size={13} />
                ) : ["REJECTED", "REJECTED_AO", "REJECTED_HO"].includes(
                    currentStatus
                ) ? (
                    <AlertTriangle size={13} />
                ) : (
                    <UploadCloud size={13} />
                ),
        };
    };

    const handleApproveEvidence = async (row, evidenceIndex) => {
        if (isRowLocked(row)) {
            toast.info("Bagian ini masih terkunci");
            return;
        }

        const evidence = row?.evidences?.[evidenceIndex];

        if (!evidence) {
            toast.error("Data bukti tidak ditemukan");
            return;
        }

        const role = getCurrentUserRoleFromToken();

        if (evidence.status === "WAITING_AO") {
            if (!role.isAO) {
                toast.info("Bukti ini sedang menunggu review AO.");
                return;
            }

            await updateEvidenceStatus({
                rowId: row.id,
                evidenceIndex,
                action: "AO_APPROVE",
            });

            return;
        }

        if (evidence.status === "WAITING_HO") {
            if (!role.isHO) {
                toast.info("Bukti ini sedang menunggu keputusan HO.");
                return;
            }

            await updateEvidenceStatus({
                rowId: row.id,
                evidenceIndex,
                action: "HO_APPROVE",
            });

            return;
        }

        toast.info("Bukti belum bisa di-ACC pada status saat ini.");
    };
    const handleRejectEvidence = async (row, evidenceIndex) => {
        if (isRowLocked(row)) {
            toast.info("Bagian ini masih terkunci");
            return;
        }

        const evidence = row?.evidences?.[evidenceIndex];

        if (!evidence) {
            toast.error("Data bukti tidak ditemukan");
            return;
        }

        const role = getCurrentUserRoleFromToken();

        let action = null;
        let title = "Masukkan alasan penolakan:";

        if (evidence.status === "WAITING_AO") {
            if (!role.isAO) {
                toast.info("Bukti ini sedang menunggu review AO.");
                return;
            }

            action = "AO_REJECT";
            title = "Masukkan komentar penolakan dari AO:";
        }

        if (evidence.status === "WAITING_HO") {
            if (!role.isHO) {
                toast.info("Bukti ini sedang menunggu keputusan HO.");
                return;
            }

            action = "HO_REJECT";
            title = "Masukkan alasan reject dari HO:";
        }

        if (!action) {
            toast.info("Bukti belum bisa ditolak pada status saat ini.");
            return;
        }

        const reason = window.prompt(
            title,
            "Dokumen belum sesuai, mohon upload ulang."
        );

        if (reason === null) return;

        await updateEvidenceStatus({
            rowId: row.id,
            evidenceIndex,
            action,
            reason,
        });
    };

    const handlePhaseClick = (phaseIndex) => {
        if (!checkPhaseUnlocked(phaseIndex)) {
            toast.info("Periode ini masih terkunci. Selesaikan periode sebelumnya terlebih dahulu.");
            return;
        }

        setActivePhase(phaseIndex);
        setSelectedRow(null);
        setFlowFilter({
            type: "phase",
            phaseIndex,
            rowId: null,
            rowType: null,
        });
    };

    const handleFlowRowClick = (row, phaseIndex) => {
        if (!row) return;

        if (!checkPhaseUnlocked(phaseIndex)) {
            toast.info("Periode ini masih terkunci. Selesaikan periode sebelumnya terlebih dahulu.");
            return;
        }

        if (row.type === "kegiatan" && !isPhaseContentOpen(phaseIndex)) {
            setActivePhase(phaseIndex);
            setSelectedRow(null);
            setFlowFilter({
                type: "phase",
                phaseIndex,
                rowId: null,
                rowType: null,
            });
            toast.info("Aktivitas pada periode ini belum terbuka. Selesaikan administrasi pembuka terlebih dahulu.");
            return;
        }

        setActivePhase(phaseIndex);
        setSelectedRow(row);
        setFlowFilter({
            type: "row",
            phaseIndex,
            rowId: row.id,
            rowType: row.type,
        });
    };
    const currentPhase = phases[activePhase] || null;

    const selectedRowLocked = selectedRow ? isRowLocked(selectedRow) : true;
    const selectedRowStatus = selectedRow
        ? selectedRowLocked
            ? "LOCKED"
            : getRowStatus(selectedRow)
        : "WAITING_UPLOAD";

    const selectedRowRequirements = selectedRow?.evidences || [];
    const selectedRowApprovedCount = selectedRowRequirements.filter(
        (item) => item.status === "APPROVED",
    ).length;

    const selectedRowProgress = selectedRowRequirements.length
        ? Math.round((selectedRowApprovedCount / selectedRowRequirements.length) * 100)
        : 0;

    if (loading) {
        return (
            <PageWrapper className="flex h-screen items-center justify-center bg-[#EEF5FF]">
                <div className="rounded-[2rem] border border-white bg-white px-10 py-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                    <div className="mx-auto mb-5 h-11 w-11 animate-spin rounded-full border-4 border-[#0AC4E0] border-t-transparent" />

                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0AC4E0]">
                        Memuat detail program
                    </p>

                    <p className="mt-2 text-xs font-semibold text-slate-400">
                        Menyiapkan halaman eksekusi dan monitoring.
                    </p>
                </div>
            </PageWrapper>
        );
    }

    if (!program) {
        return (
            <PageWrapper className="flex h-screen items-center justify-center bg-[#EEF5FF]">
                <div className="rounded-[2rem] border border-white bg-white px-10 py-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                    <AlertTriangle className="mx-auto text-amber-500" size={34} />

                    <h2 className="mt-4 text-xl font-black text-slate-900">
                        Program tidak ditemukan
                    </h2>

                    <p className="mt-2 text-sm font-semibold text-slate-400">
                        Data program tidak tersedia atau sudah dihapus.
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate(backPath)}
                        className="mt-5 rounded-2xl bg-slate-950 px-5 py-3 text-xs font-black uppercase tracking-widest text-white"
                    >
                        Kembali
                    </button>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper className="flex h-screen overflow-hidden bg-[#EEF5FF] !p-0 font-sans text-slate-800">
            <Sidebar />

            <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden px-6 py-6">
                <header className="shrink-0">
                    <div className="flex min-h-[94px] items-center justify-between rounded-[1.8rem] border border-slate-100 bg-white px-6 py-4 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
                        <div className="flex min-w-0 items-center gap-4">
                            <button
                                type="button"
                                onClick={() => navigate(backPath)}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-slate-500 transition hover:bg-white hover:text-[#0AC4E0]"
                                title="Kembali"
                            >
                                <ArrowLeft size={17} />
                            </button>

                            <div className="min-w-0">
                                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-cyan-50 px-3 py-1 text-[8px] font-black uppercase tracking-[0.22em] text-[#0AC4E0]">
                                        {badgeText}
                                    </span>

                                    <span className="text-[8px] font-black uppercase tracking-[0.24em] text-slate-400">
                                        Progress Monitoring Aktivitas
                                    </span>

                                    <span className="h-1 w-1 rounded-full bg-slate-300" />

                                    <StatusPill
                                        label={program?.status_program || "Approval"}
                                        className="border-amber-100 bg-amber-50 text-amber-600"
                                    />
                                </div>

                                <h1 className="truncate text-[25px] font-black leading-none tracking-[-0.055em] text-slate-950">
                                    {program?.nama_program || "Detail Program"}{" "}
                                    <span className="text-[#0AC4E0]">
                                        {titleHighlight}
                                    </span>
                                </h1>

                                <p className="mt-2 truncate text-[11px] font-bold text-slate-400">
                                    {getSchoolName()} · {getAoName()} · {getVendorName()}
                                </p>
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                            <button
                                type="button"
                                onClick={fetchProgramDetail}
                                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-slate-400 transition hover:bg-white hover:text-[#0AC4E0]"
                                title="Refresh"
                            >
                                <RefreshCcw size={15} />
                            </button>

                            <button
                                type="button"
                                onClick={() => openGeneralChat()}
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 transition hover:text-[#0AC4E0]"
                            >
                                <MessageSquare size={15} />
                                Chat
                            </button>

                            <Button
                                text="Edit Program"
                                icon={<Edit3 size={15} />}
                                onClick={() => navigate(`${editPathPrefix}/${id}`)}
                                className="!rounded-2xl !bg-slate-950 !px-5 !py-2.5 !text-[10px] !font-black !uppercase !tracking-widest !text-white hover:!bg-slate-800"
                            />
                        </div>
                    </div>
                </header>

                <section className="simple-scroll min-h-0 flex-1 overflow-y-auto pt-4">
                    <div className="space-y-5">
                        <ProgramSummaryPanel
                            program={program}
                            schoolName={getSchoolName()}
                            hoName={getHoName()}
                            aoName={getAoName()}
                            vendorName={getVendorName()}
                            progress={progress}
                            assessment={assessment}
                            assessmentChartData={assessmentChartData}
                            ratingSummary={ratingSummary}
                        />

                        <section className="space-y-5">
                            <ArrowPhaseSteps
                                phases={phases}
                                monitoringRows={monitoringRows}
                                activePhase={activePhase}
                                selectedRow={selectedRow}
                                flowFilter={flowFilter}
                                onPhaseClick={handlePhaseClick}
                                onRowClick={handleFlowRowClick}
                                checkPhaseUnlocked={checkPhaseUnlocked}
                                isPhaseCompleted={isPhaseCompleted}
                                isPhaseContentOpen={isPhaseContentOpen}
                                getPhaseWorkflowStatus={getPhaseWorkflowStatus}
                                getRowStatus={getRowStatus}
                            />

                            <div className="rounded-[1.6rem] border border-slate-100 bg-white px-5 py-4 shadow-[0_12px_35px_rgba(15,23,42,0.05)]">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="text-[8px] font-black uppercase tracking-[0.22em] text-[#0AC4E0]">
                                            Konten Eksekusi Aktif
                                        </p>

                                        <h2 className="mt-1 truncate text-[21px] font-black tracking-[-0.05em] text-slate-950">
                                            {flowFilter?.type === "row" && selectedRow
                                                ? selectedRow.title
                                                : currentPhase?.nama || `Periode ${activePhase + 1}`}
                                        </h2>

                                        <p className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-400">
                                            {flowFilter?.type === "row" && selectedRow
                                                ? `${selectedRow.phaseName} · ${selectedRow.parentLabel}. Tabel di bawah hanya menampilkan item yang dipilih pada shape alur.`
                                                : currentPhase?.deskripsi ||
                                                "Eksekusi dimulai dari administrasi pembuka periode, lalu aktivitas terbuka setelah review AO dan keputusan HO selesai."}
                                        </p>
                                    </div>

                                    <div
                                        className={`inline-flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-2.5 text-[9px] font-black uppercase tracking-widest ${activeWorkflowStatus.className}`}
                                    >
                                        {activeWorkflowStatus.label.includes("Terkunci") ? (
                                            <Lock size={14} />
                                        ) : activeWorkflowStatus.label.includes("Selesai") ? (
                                            <CheckCircle2 size={14} />
                                        ) : (
                                            <Clock size={14} />
                                        )}

                                        {activeWorkflowStatus.label}
                                    </div>
                                </div>

                                <div className="mt-3 rounded-[1.2rem] border border-slate-100 bg-slate-50 px-4 py-3">
                                    <p className="text-[11px] font-semibold leading-relaxed text-slate-500">
                                        {flowFilter?.type === "row" && selectedRow
                                            ? selectedRow.description || activeWorkflowStatus.description
                                            : activeWorkflowStatus.description}
                                    </p>
                                </div>
                            </div>

                            {hasVisibleOpeningRows && (
                                <ExecutionTablePanel
                                    title={EXECUTION_COPY.openingTitle}
                                    subtitle={EXECUTION_COPY.openingSubtitle}
                                    description={EXECUTION_COPY.openingDesc}
                                    rows={visibleOpeningRows}
                                    sectionStatus={openingSectionStatus}
                                    selectedRow={selectedRow}
                                    setSelectedRow={setSelectedRow}
                                    getRowStatus={getRowStatus}
                                    isRowLocked={isRowLocked}
                                    openChatForRow={openChatForRow}
                                    openCommentForRow={openCommentForRow}
                                    openRatingModal={openRatingModal}
                                    readCommentRows={readCommentRows}
                                />
                            )}

                            {hasVisibleInnerRows && (
                                <ExecutionTablePanel
                                    title={EXECUTION_COPY.innerTitle}
                                    subtitle={EXECUTION_COPY.innerSubtitle}
                                    description={EXECUTION_COPY.innerDesc}
                                    rows={visibleInnerRows}
                                    sectionStatus={innerSectionStatus}
                                    selectedRow={selectedRow}
                                    setSelectedRow={setSelectedRow}
                                    getRowStatus={getRowStatus}
                                    isRowLocked={isRowLocked}
                                    openChatForRow={openChatForRow}
                                    openCommentForRow={openCommentForRow}
                                    openRatingModal={openRatingModal}
                                    locked={!isPhaseContentOpen(activePhase)}
                                    readCommentRows={readCommentRows}
                                />
                            )}

                            {!hasVisibleOpeningRows && !hasVisibleInnerRows && (
                                <section className="rounded-[1.6rem] border border-dashed border-slate-200 bg-white px-6 py-10 text-center shadow-[0_12px_35px_rgba(15,23,42,0.04)]">
                                    <Layers3 size={32} className="mx-auto text-slate-300" />
                                    <h3 className="mt-3 text-sm font-black text-slate-700">
                                        Belum ada item eksekusi pada pilihan ini
                                    </h3>
                                    <p className="mx-auto mt-2 max-w-lg text-[12px] font-semibold leading-relaxed text-slate-400">
                                        Pilih shape fase, administrasi, atau aktivitas lain pada alur eksekusi di atas.
                                    </p>
                                </section>
                            )}

                            <SelectedRowDetailPanel
                                selectedRow={selectedRow}
                                selectedRowLocked={selectedRowLocked}
                                selectedRowStatus={selectedRowStatus}
                                selectedRowProgress={selectedRowProgress}
                                selectedRowApprovedCount={selectedRowApprovedCount}
                                selectedRowRequirements={selectedRowRequirements}
                                getEvidenceStatusMeta={getEvidenceStatusMeta}
                                handleApproveEvidence={handleApproveEvidence}
                                handleRejectEvidence={handleRejectEvidence}
                                openFile={openFile}
                                openChatForRow={openChatForRow}
                                openEvidenceReviewModal={openEvidenceReviewModal}
                            />
                        </section>
                    </div>
                </section>
            </main>
            <ChatDrawer
                open={showChat}
                onClose={() => setShowChat(false)}
                chatContext={chatContext}
                groupedChats={getGroupedChats()}
                message={message}
                setMessage={setMessage}
                sendMessage={sendMessage}
            />

            <EvidenceReviewModal
                reviewModal={reviewModal}
                currentRole={currentRole}
                onClose={closeEvidenceReviewModal}
                onReject={handleModalReject}
                onApprove={handleModalApprove}
            />
            {/* â”€â”€ Comment Drawer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <CommentDrawer
                open={showCommentDrawer}
                row={commentRow}
                comments={comments}
                commentText={commentText}
                setCommentText={setCommentText}
                commentType={commentType}
                setCommentType={setCommentType}
                loading={commentLoading}
                onClose={() => { setShowCommentDrawer(false); setCommentRow(null); }}
                onSubmit={submitComment}
            />

            {/* â”€â”€ Guru Rating Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <GuruRatingModal
                open={showRatingModal}
                row={ratingRow}
                ratingValue={ratingValue}
                setRatingValue={setRatingValue}
                ratingComment={ratingComment}
                setRatingComment={setRatingComment}
                loading={ratingLoading}
                onClose={() => { setShowRatingModal(false); setRatingRow(null); }}
                onSubmit={submitRating}
            />

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                        .simple-scroll::-webkit-scrollbar {
                            width: 6px;
                            height: 6px;
                        }

                        .simple-scroll::-webkit-scrollbar-track {
                            background: transparent;
                        }

                        .simple-scroll::-webkit-scrollbar-thumb {
                            background: #CBD5E1;
                            border-radius: 999px;
                        }

                        .simple-scroll::-webkit-scrollbar-thumb:hover {
                            background: #0AC4E0;
                        }
                    `,
                }}
            />
        </PageWrapper>
    );
}
function ChatDrawer({
    open,
    onClose,
    chatContext,
    groupedChats,
    message,
    setMessage,
    sendMessage,
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[80] flex justify-end bg-slate-950/25 backdrop-blur-sm">
            <div className="flex h-full w-full max-w-[430px] flex-col border-l border-slate-100 bg-white shadow-[-20px_0_60px_rgba(15,23,42,0.18)]">
                <div className="shrink-0 border-b border-slate-100 px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-[8px] font-black uppercase tracking-[0.22em] text-[#0AC4E0]">
                                Live Chat Monitoring
                            </p>

                            <h3 className="mt-1 text-[18px] font-black tracking-[-0.04em] text-slate-950">
                                Diskusi Eksekusi
                            </h3>

                            {chatContext ? (
                                <p className="mt-1 truncate text-[11px] font-semibold text-slate-400">
                                    {chatContext.phaseName} · {chatContext.rowTitle}
                                    {chatContext.evidenceName
                                        ? ` · ${chatContext.evidenceName}`
                                        : ""}
                                </p>
                            ) : (
                                <p className="mt-1 text-[11px] font-semibold text-slate-400">
                                    Diskusi umum program.
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                <div className="simple-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4">
                    <div className="space-y-5">
                        {groupedChats.map((group, groupIndex) => (
                            <div key={`${group.label}-${groupIndex}`}>
                                <div className="mb-3 flex justify-center">
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                        {group.label}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {group.items.map((chat, index) => {
                                        const dateInfo = formatChatDateTime(chat.time);
                                        const isHo = Boolean(chat.self) || chat.sender === "Head Office";
                                        const isSystem = chat.isSystem;

                                        return (
                                            <div
                                                key={`${chat.text}-${index}`}
                                                className={`flex ${isSystem
                                                    ? "justify-center"
                                                    : isHo
                                                        ? "justify-end"
                                                        : "justify-start"
                                                    }`}
                                            >
                                                {isSystem ? (
                                                    <div className="max-w-[86%] rounded-2xl bg-slate-50 px-4 py-3 text-center text-[11px] font-semibold leading-relaxed text-slate-400">
                                                        {chat.text}
                                                    </div>
                                                ) : (
                                                    <div
                                                        className={`max-w-[82%] rounded-[1.2rem] px-4 py-3 ${isHo
                                                            ? "rounded-br-md bg-[#0AC4E0] text-white"
                                                            : "rounded-bl-md bg-slate-100 text-slate-700"
                                                            }`}
                                                    >
                                                        <p
                                                            className={`mb-1 text-[8px] font-black uppercase tracking-widest ${isHo
                                                                ? "text-white/60"
                                                                : "text-slate-400"
                                                                }`}
                                                        >
                                                            {chat.sender}
                                                        </p>

                                                        {chat.context && (
                                                            <p
                                                                className={`mb-2 rounded-xl px-3 py-2 text-[9px] font-bold leading-relaxed ${isHo
                                                                    ? "bg-white/15 text-white/80"
                                                                    : "bg-white text-slate-400"
                                                                    }`}
                                                            >
                                                                {chat.context.phaseName} ·{" "}
                                                                {chat.context.rowTitle}
                                                            </p>
                                                        )}

                                                        <p className="text-[12px] font-semibold leading-relaxed">
                                                            {chat.text}
                                                        </p>

                                                        <p
                                                            className={`mt-2 text-right text-[8px] font-bold ${isHo
                                                                ? "text-white/55"
                                                                : "text-slate-400"
                                                                }`}
                                                        >
                                                            {dateInfo.time || "Now"}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="shrink-0 border-t border-slate-100 bg-slate-50 px-5 py-4">
                    {chatContext && (
                        <div className="mb-3 rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3">
                            <p className="text-[8px] font-black uppercase tracking-widest text-[#0AC4E0]">
                                Konteks Chat
                            </p>

                            <p className="mt-1 truncate text-[11px] font-black text-slate-700">
                                {chatContext.phaseName} · {chatContext.rowTitle}
                            </p>

                            {chatContext.evidenceName && (
                                <p className="mt-1 truncate text-[10px] font-semibold text-slate-500">
                                    Upload: {chatContext.evidenceName}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <Input
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    event.preventDefault();
                                    sendMessage();
                                }
                            }}
                            placeholder="Tulis komentar monitoring..."
                            className="!rounded-2xl !border-none !bg-white !px-4 !py-3 !text-[12px] !font-semibold"
                        />

                        <button
                            type="button"
                            onClick={sendMessage}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white transition hover:bg-[#0AC4E0]"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
function ProgramSummaryPanel({
    program,
    schoolName,
    hoName,
    aoName,
    vendorName,
    progress,
    assessment,
    ratingSummary,
}) {
    const summaryItems = [
        { label: "Sekolah", value: schoolName },
        { label: "Head Office", value: hoName },
        { label: "Area Officer", value: aoName },
        { label: "Vendor", value: vendorName },
        {
            label: "KPI",
            value: `${program?.kpi_nama || "-"}${program?.kpi_target
                ? ` · Target ${program.kpi_target}${program?.kpi_satuan || ""}`
                : ""
                }`,
        },
        { label: "Anggaran", value: formatCurrency(program?.harga_vendor) },
        { label: "Tahun", value: program?.tahun || "-" },
        {
            label: "Validasi",
            value: `${progress.approved}/${progress.total} disetujui · ${progress.percentage}%`,
        },
    ];

    if (assessment) {
        summaryItems.push({
            label: "Assessment",
            value: `${getAssessmentTitle(assessment)} · Skor ${getAssessmentScore(assessment)}`,
        });
    }

    if (ratingSummary) {
        summaryItems.push({
            label: "Rating",
            value: `${ratingSummary.average_rating || 0}/5 · ${ratingSummary.total_rating || 0} rating · Partisipasi ${ratingSummary.participation_percentage || 0}%`,
        });
    }

    return (
        <section className="overflow-hidden rounded-[1.6rem] border-2 border-[#0AC4E0] bg-white shadow-[0_14px_36px_rgba(10,196,224,0.10)]">
            <div className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0AC4E0] text-white">
                            <Layers3 size={22} />
                        </div>

                        <div className="min-w-0">
                            <p className="text-[8px] font-black uppercase tracking-[0.24em] text-[#0AC4E0]">
                                Ringkasan Program
                            </p>

                            <h2 className="mt-1 truncate text-[22px] font-black tracking-[-0.05em] text-slate-950">
                                {program?.nama_program || program?.nama || "Detail Program"}
                            </h2>

                            <p className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-500">
                                Informasi inti program, pelaksana, KPI, anggaran, dan progres validasi.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="shrink-0 rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-right">
                    <p className="text-[8px] font-black uppercase tracking-widest text-[#0AC4E0]">
                        Progress
                    </p>

                    <p className="mt-1 text-[24px] font-black leading-none tracking-[-0.06em] text-slate-950">
                        {progress.percentage}%
                    </p>

                    <p className="mt-1 text-[10px] font-bold text-slate-500">
                        {progress.approved}/{progress.total} bukti approved
                    </p>
                </div>
            </div>

            <div className="border-t border-cyan-100 px-5 py-4">
                <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2 xl:grid-cols-4">
                    {summaryItems.map((item) => (
                        <div key={item.label} className="min-w-0">
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                                {item.label}
                            </p>

                            <p className="mt-1 truncate text-[12px] font-black text-slate-800" title={String(item.value || "-")}>
                                {item.value || "-"}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-cyan-50">
                    <div
                        className="h-full rounded-full bg-[#0AC4E0] transition-all"
                        style={{ width: `${progress.percentage}%` }}
                    />
                </div>
            </div>
        </section>
    );
}

function SummaryMetric({ label, value, className = "" }) {
    return (
        <div className="rounded-[1.2rem] border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                {label}
            </p>

            <p className={`mt-1 text-[22px] font-black leading-none ${className}`}>
                {value}
            </p>
        </div>
    );
}

function SummaryLine({ icon, label, value }) {
    return (
        <div className="flex items-start gap-3 rounded-[1.2rem] border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#0AC4E0]">
                {icon}
            </div>

            <div className="min-w-0">
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                    {label}
                </p>

                <p className="mt-1 truncate text-[12px] font-black text-slate-800">
                    {value || "-"}
                </p>
            </div>
        </div>
    );
}

function AssessmentMiniChart({ data = [] }) {
    const safeData = data.length > 0 ? data : [{ label: "Baseline", value: 0 }];

    const maxValue = Math.max(
        ...safeData.map((item) => Number(item.value || 0)),
        100,
    );

    return (
        <div className="space-y-2">
            {safeData.slice(0, 6).map((item, index) => {
                const value = Number(item.value || 0);
                const width = Math.min(100, Math.max(6, (value / maxValue) * 100));

                return (
                    <div key={`${item.label}-${index}`}>
                        <div className="mb-1 flex items-center justify-between gap-3">
                            <p className="truncate text-[9px] font-black text-slate-600">
                                {item.label}
                            </p>

                            <p className="text-[9px] font-black text-slate-400">
                                {value}
                            </p>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-white">
                            <div
                                className="h-full rounded-full bg-[#0AC4E0]"
                                style={{ width: `${width}%` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
function ArrowPhaseSteps({
    phases,
    monitoringRows = {},
    activePhase,
    selectedRow,
    flowFilter,
    onPhaseClick,
    onRowClick,
    checkPhaseUnlocked,
    isPhaseCompleted,
    isPhaseContentOpen,
    getPhaseWorkflowStatus,
    getRowStatus,
}) {
    const getFlowRows = (phaseIndex) => monitoringRows[phaseIndex] || [];

    const getFlowTone = ({ active, completed, locked, rowStatus, type }) => {
        if (locked) {
            return {
                wrapper: "border-slate-200 bg-slate-50 text-slate-400",
                icon: "bg-white text-slate-300",
            };
        }

        if (active) {
            return {
                wrapper: "border-[#0AC4E0] bg-[#0AC4E0] text-white shadow-[0_16px_35px_rgba(10,196,224,0.22)]",
                icon: "bg-white/20 text-white",
            };
        }

        if (completed || rowStatus === "APPROVED") {
            return {
                wrapper: "border-emerald-100 bg-emerald-50 text-emerald-700 hover:border-emerald-200 hover:bg-white",
                icon: "bg-white text-emerald-600",
            };
        }

        if (rowStatus === "WAITING_HO" || rowStatus === "WAITING_AO") {
            return {
                wrapper: "border-amber-100 bg-amber-50 text-amber-700 hover:border-amber-200 hover:bg-white",
                icon: "bg-white text-amber-600",
            };
        }

        if (type === "termin") {
            return {
                wrapper: "border-blue-100 bg-blue-50 text-blue-700 hover:border-blue-200 hover:bg-white",
                icon: "bg-white text-blue-600",
            };
        }

        return {
            wrapper: "border-slate-100 bg-white text-slate-700 hover:border-cyan-100 hover:bg-cyan-50",
            icon: "bg-slate-50 text-[#0AC4E0]",
        };
    };

    const arrowStyle = {
        clipPath:
            "polygon(0 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 0 100%, 18px 50%)",
    };

    return (
        <div className="rounded-[1.6rem] border border-slate-100 bg-white px-5 py-4 shadow-[0_12px_35px_rgba(15,23,42,0.05)]">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.22em] text-[#0AC4E0]">
                        Periode Program
                    </p>

                    <h3 className="mt-1 text-[17px] font-black tracking-[-0.04em] text-slate-950">
                        Alur Eksekusi
                    </h3>

                    <p className="mt-1 text-[11px] font-semibold text-slate-400">
                        Klik shape fase, administrasi, aktivitas, atau pertemuan untuk memfilter tabel eksekusi di bawah.
                    </p>
                </div>

                <p className="w-fit rounded-full bg-slate-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    Geser horizontal jika alur panjang
                </p>
            </div>

            <div className="simple-scroll overflow-x-auto pb-2">
                <div className="flex min-w-max items-stretch gap-2 pr-4">
                    {phases.length === 0 && (
                        <div className="w-full rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-center">
                            <p className="text-[12px] font-bold text-slate-400">
                                Belum ada periode pada program ini.
                            </p>
                        </div>
                    )}

                    {phases.map((phase, index) => {
                        const phaseRows = getFlowRows(index);
                        const unlocked = checkPhaseUnlocked(index);
                        const completed = isPhaseCompleted(index);
                        const status = getPhaseWorkflowStatus(index);
                        const phaseActive =
                            activePhase === index && flowFilter?.type !== "row";
                        const phaseTone = getFlowTone({
                            active: phaseActive,
                            completed,
                            locked: !unlocked,
                            type: "phase",
                        });

                        const openingRows = phaseRows.filter((row) => row.type === "termin");
                        const activityRows = phaseRows.filter((row) => row.type === "kegiatan");

                        return (
                            <div
                                key={`${phase.id}-${index}`}
                                className="flex shrink-0 items-stretch gap-2"
                            >
                                <button
                                    type="button"
                                    onClick={() => onPhaseClick(index)}
                                    style={arrowStyle}
                                    className={`min-h-[86px] w-[210px] border px-7 py-3 text-left transition ${phaseTone.wrapper} ${!unlocked ? "cursor-not-allowed opacity-70" : ""}`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <span
                                            className={`flex h-8 w-8 items-center justify-center rounded-2xl ${phaseTone.icon}`}
                                        >
                                            {!unlocked ? (
                                                <Lock size={14} />
                                            ) : completed ? (
                                                    <CheckCircle2 size={14} />
                                                ) : (
                                                <Layers3 size={14} />
                                            )}
                                        </span>

                                        <span className="text-[8px] font-black uppercase tracking-widest opacity-70">
                                            Fase {String(index + 1).padStart(2, "0")}
                                        </span>
                                    </div>

                                    <h4 className="mt-2 truncate text-[12px] font-black">
                                        {phase.nama || `Periode ${index + 1}`}
                                    </h4>

                                    <p className="mt-1 truncate text-[8px] font-black uppercase tracking-widest opacity-70">
                                        {status.label}
                                    </p>
                                </button>

                                {openingRows.map((row) => {
                                    const rowStatus = getRowStatus(row);
                                    const rowActive =
                                        flowFilter?.type === "row" &&
                                        flowFilter?.rowId === row.id;
                                    const rowTone = getFlowTone({
                                        active: rowActive,
                                        completed: rowStatus === "APPROVED",
                                        locked: !unlocked,
                                        rowStatus,
                                        type: row.type,
                                    });

                                    return (
                                        <button
                                            key={row.id}
                                            type="button"
                                            onClick={() => onRowClick(row, index)}
                                            style={arrowStyle}
                                            className={`min-h-[86px] w-[230px] border px-7 py-3 text-left transition ${rowTone.wrapper} ${!unlocked ? "cursor-not-allowed opacity-70" : ""}`}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <span
                                                    className={`flex h-8 w-8 items-center justify-center rounded-2xl ${rowTone.icon}`}
                                                >
                                                    <UploadCloud size={14} />
                                                </span>

                                                <span className="text-[8px] font-black uppercase tracking-widest opacity-70">
                                                    Administrasi
                                                </span>
                                            </div>

                                            <h4 className="mt-2 truncate text-[12px] font-black">
                                                {row.title}
                                            </h4>

                                            <p className="mt-1 truncate text-[8px] font-black uppercase tracking-widest opacity-70">
                                                {STATUS_LABEL[rowStatus] || rowStatus}
                                            </p>
                                        </button>
                                    );
                                })}

                                {activityRows.map((row, activityIndex) => {
                                    const rowStatus = getRowStatus(row);
                                    const phaseContentOpen = isPhaseContentOpen(index);
                                    const rowActive =
                                        flowFilter?.type === "row" &&
                                        flowFilter?.rowId === row.id;
                                    const rowTone = getFlowTone({
                                        active: rowActive,
                                        completed: rowStatus === "APPROVED",
                                        locked: !unlocked || !phaseContentOpen,
                                        rowStatus,
                                        type: row.type,
                                    });

                                    return (
                                        <button
                                            key={row.id}
                                            type="button"
                                            onClick={() => onRowClick(row, index)}
                                            style={arrowStyle}
                                            className={`min-h-[86px] w-[245px] border px-7 py-3 text-left transition ${rowTone.wrapper} ${!unlocked || !phaseContentOpen ? "cursor-not-allowed opacity-70" : ""}`}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <span
                                                    className={`flex h-8 w-8 items-center justify-center rounded-2xl ${rowTone.icon}`}
                                                >
                                                    <FileText size={14} />
                                                </span>

                                                <span className="text-[8px] font-black uppercase tracking-widest opacity-70">
                                                    Aktivitas {activityIndex + 1}
                                                </span>
                                            </div>

                                            <h4 className="mt-2 truncate text-[12px] font-black">
                                                {row.title}
                                            </h4>

                                            <div className="mt-1 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest opacity-70">
                                                <span>{(row.meetings || []).length} Pertemuan</span>
                                                <span>·</span>
                                                <span>{STATUS_LABEL[rowStatus] || rowStatus}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function ExecutionTablePanel({
    title,
    subtitle,
    description,
    rows,
    locked = false,
    sectionStatus,
    selectedRow,
    setSelectedRow,
    getRowStatus,
    isRowLocked,
    openChatForRow,
    openCommentForRow,
    openRatingModal,
    readCommentRows = {},
}) {
    return (
        <section className="overflow-hidden rounded-[1.6rem] border border-slate-100 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.05)]">
            <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.22em] text-[#0AC4E0]">
                            {subtitle}
                        </p>

                        <h3 className="mt-1 text-[17px] font-black tracking-[-0.04em] text-slate-950">
                            {title}
                        </h3>

                        <p className="mt-1 max-w-3xl text-[11px] font-semibold leading-relaxed text-slate-400">
                            {description}
                        </p>
                    </div>

                    <span
                        className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[8px] font-black uppercase tracking-widest ${sectionStatus.className}`}
                    >
                        {sectionStatus.icon}
                        {sectionStatus.label}
                    </span>
                </div>
            </div>

            {locked ? (
                <div className="flex flex-col items-center justify-center rounded-[1.2rem] border border-slate-100 bg-slate-50 px-6 py-10 text-center">
                    <Lock size={28} className="text-slate-300" />

                    <h3 className="mt-3 text-sm font-black text-slate-700">
                        Aktivitas masih terkunci
                    </h3>

                    <p className="mt-2 max-w-md text-[12px] font-semibold leading-relaxed text-slate-400">
                        Selesaikan dan ACC seluruh administrasi pembuka periode terlebih dahulu.
                    </p>
                </div>
            ) : (
                <div className="simple-scroll overflow-x-auto">
                    <table className="w-full min-w-[920px] border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-white">
                                <th className="w-[70px] px-5 py-4 text-center text-[9px] font-black uppercase tracking-widest text-slate-400">
                                    No
                                </th>

                                <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-widest text-slate-400">
                                    Step Eksekusi
                                </th>

                                <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-widest text-slate-400">
                                    Upload / Bukti
                                </th>

                                <th className="w-[150px] px-5 py-4 text-center text-[9px] font-black uppercase tracking-widest text-slate-400">
                                    Status
                                </th>

                                <th className="w-[180px] px-5 py-4 text-right text-[9px] font-black uppercase tracking-widest text-slate-400">
                                    Aksi
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-12 text-center">
                                        <p className="text-[13px] font-black text-slate-700">
                                            Belum ada data
                                        </p>

                                        <p className="mt-1 text-[11px] font-semibold text-slate-400">
                                            Item eksekusi belum tersedia pada bagian ini.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                rows.map((row, index) => {
                                    const rowLocked = isRowLocked(row);
                                    const status = rowLocked ? "LOCKED" : getRowStatus(row);
                                    const active = selectedRow?.id === row.id;

                                    const totalEvidence = row.evidences?.length || 0;
                                    const approvedEvidence = (row.evidences || []).filter(
                                        (item) => item.status === "APPROVED",
                                    ).length;

                                    return (
                                        <tr
                                            key={row.id}
                                            className={`border-b border-slate-100 transition ${active ? "bg-cyan-50/50" : "hover:bg-slate-50"
                                                }`}
                                        >
                                            <td className="px-5 py-4 text-center text-[12px] font-black text-slate-300">
                                                {String(index + 1).padStart(2, "0")}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${row.type === "termin"
                                                            ? "bg-amber-50 text-amber-600"
                                                            : "bg-cyan-50 text-[#0AC4E0]"
                                                            }`}
                                                    >
                                                        {rowLocked ? (
                                                            <Lock size={16} />
                                                        ) : row.type === "termin" ? (
                                                            <UploadCloud size={16} />
                                                        ) : (
                                                            <FileText size={16} />
                                                        )}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="truncate text-[13px] font-black text-slate-900">
                                                            {row.title}
                                                        </p>

                                                        <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                            {row.type === "termin"
                                                                ? "Administrasi Pembuka"
                                                                : "Aktivitas Kegiatan"}
                                                        </p>

                                                        <p className="mt-2 line-clamp-2 text-[11px] font-semibold leading-relaxed text-slate-400">
                                                            {row.description || "-"}
                                                        </p>

                                                        {row.type === "kegiatan" && (
                                                            <div className="mt-3 flex flex-wrap gap-2">
                                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-100 bg-cyan-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-[#0AC4E0]">
                                                                    <Calendar size={11} />
                                                                    {(row.meetings || []).length} Pertemuan
                                                                </span>

                                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-amber-600">
                                                                    <Star size={11} />
                                                                    {row.ratingStats?.average || 0}/5 · {row.ratingStats?.total || 0} rating
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="space-y-2">
                                                    {(row.evidences || [])
                                                        .slice(0, 3)
                                                        .map((item, reqIndex) => (
                                                            <div
                                                                key={`${item.id}-${reqIndex}`}
                                                                className="rounded-xl border border-slate-100 bg-white px-3 py-2"
                                                            >
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <p className="truncate text-[11px] font-black text-slate-700">
                                                                        {item.name}
                                                                    </p>

                                                                    <StatusBadge status={item.status} />
                                                                </div>

                                                                <p className="mt-1 line-clamp-1 text-[10px] font-semibold text-slate-400">
                                                                    {item.purpose}
                                                                </p>
                                                            </div>
                                                        ))}

                                                    {(row.evidences || []).length > 3 && (
                                                        <p className="text-[10px] font-black text-slate-400">
                                                            +{row.evidences.length - 3} upload lainnya
                                                        </p>
                                                    )}

                                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                        Approved {approvedEvidence}/{totalEvidence}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-center">
                                                <StatusBadge status={status} />
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedRow(active ? null : row)}
                                                        disabled={rowLocked}
                                                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 transition hover:text-[#0AC4E0] disabled:cursor-not-allowed disabled:opacity-40"
                                                        title="Detail"
                                                    >
                                                        <Eye size={15} />
                                                    </button>

                                                    {row.type === "kegiatan" && (
                                                        <button
                                                            type="button"
                                                            onClick={() => openCommentForRow(row)}
                                                            disabled={rowLocked}
                                                            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-400 transition hover:bg-violet-100 hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-40"
                                                            title="Komentar Kegiatan (AO/HO/Guru)"
                                                        >
                                                            <MessageSquare size={15} />
                                                            {(() => {
                                                                const unreadCommentCount = Math.max(
                                                                    Number(row.commentCount || 0) - Number(readCommentRows[row.id] || 0),
                                                                    0,
                                                                );

                                                                return unreadCommentCount > 0 ? (
                                                                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-500 px-1 text-[8px] font-black text-white">
                                                                        {unreadCommentCount > 9 ? "9+" : unreadCommentCount}
                                                                    </span>
                                                                ) : null;
                                                            })()}
                                                        </button>
                                                    )}

                                                    {row.type === "kegiatan" && status === "APPROVED" && typeof openRatingModal === "function" && (
                                                        <button
                                                            type="button"
                                                            onClick={() => openRatingModal(row)}
                                                            className="relative flex h-9 items-center justify-center gap-1 rounded-xl border border-amber-100 bg-amber-50 px-2 text-[9px] font-black text-amber-500 transition hover:bg-amber-100 hover:text-amber-700"
                                                            title="Rating Guru"
                                                        >
                                                            {row.guruRating ? (
                                                                <span className="inline-flex items-center gap-1">
                                                                    <Star size={12} fill="currentColor" />
                                                                    {row.guruRating}/5
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1">
                                                                    <Star size={12} />
                                                                    Rating
                                                                </span>
                                                            )}
                                                        </button>
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() => openChatForRow(row)}
                                                        disabled={rowLocked}
                                                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 transition hover:text-[#0AC4E0] disabled:cursor-not-allowed disabled:opacity-40"
                                                        title="Chat Real-time"
                                                    >
                                                        <Send size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
function SelectedRowDetailPanel({
    selectedRow,
    selectedRowLocked,
    selectedRowStatus,
    selectedRowProgress,
    selectedRowApprovedCount,
    selectedRowRequirements,
    getEvidenceStatusMeta,
    handleApproveEvidence,
    handleRejectEvidence,
    openFile,
    openChatForRow,
    openEvidenceReviewModal,
}) {
    if (!selectedRow) {
        return (
            <section className="rounded-[1.6rem] border border-dashed border-slate-200 bg-white px-6 py-10 text-center shadow-[0_12px_35px_rgba(15,23,42,0.04)]">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-cyan-50 text-[#0AC4E0]">
                    <Eye size={26} />
                </div>

                <h3 className="mt-4 text-[18px] font-black tracking-[-0.04em] text-slate-950">
                    Pilih baris eksekusi
                </h3>

                <p className="mx-auto mt-2 max-w-[420px] text-[12px] font-semibold leading-relaxed text-slate-400">
                    Klik tombol detail pada tabel Administrasi Pembuka atau Aktivitas Kegiatan untuk melihat bukti, status review AO, dan keputusan HO.
                </p>
            </section>
        );
    }

    return (
        <section className="overflow-hidden rounded-[1.6rem] border border-slate-100 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.05)]">
            <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-[8px] font-black uppercase tracking-[0.22em] text-[#0AC4E0]">
                            Detail Validasi
                        </p>

                        <h3 className="mt-1 truncate text-[18px] font-black tracking-[-0.04em] text-slate-950">
                            {selectedRow.title}
                        </h3>

                        <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            {selectedRow.phaseName} · {selectedRow.parentLabel}
                        </p>
                    </div>

                    <StatusBadge status={selectedRowStatus} />
                </div>

                <div className="mt-4 rounded-[1.25rem] border border-slate-100 bg-white p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                            Progress Item
                        </p>

                        <p className="text-[10px] font-black text-slate-500">
                            {selectedRowApprovedCount}/{selectedRowRequirements.length}
                        </p>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                            className="h-full rounded-full bg-[#0AC4E0]"
                            style={{ width: `${selectedRowProgress}%` }}
                        />
                    </div>
                </div>

                {selectedRow.type === "kegiatan" && (
                    <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
                        <div className="rounded-[1.25rem] border border-cyan-100 bg-cyan-50/40 p-4">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <p className="text-[8px] font-black uppercase tracking-widest text-[#0AC4E0]">
                                    Pertemuan
                                </p>
                                <span className="rounded-full bg-white px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-[#0AC4E0]">
                                    {(selectedRow.meetings || []).length} item
                                </span>
                            </div>

                            {(selectedRow.meetings || []).length === 0 ? (
                                <p className="text-[11px] font-semibold leading-relaxed text-slate-400">
                                    Belum ada detail pertemuan pada aktivitas ini.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {selectedRow.meetings.map((meeting, index) => (
                                        <div key={`${meeting.id}-${index}`} className="rounded-xl border border-cyan-100 bg-white px-3 py-2">
                                            <p className="text-[11px] font-black text-slate-800">
                                                {meeting.title}
                                            </p>
                                            <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                {meeting.startDate || "-"} s/d {meeting.endDate || "-"}
                                            </p>
                                            {meeting.description && (
                                                <p className="mt-1 text-[10px] font-semibold leading-relaxed text-slate-400">
                                                    {meeting.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="rounded-[1.25rem] border border-amber-100 bg-amber-50/50 p-4">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <p className="text-[8px] font-black uppercase tracking-widest text-amber-600">
                                    Rating Aktivitas
                                </p>
                                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-amber-600">
                                    <Star size={11} />
                                    {selectedRow.ratingStats?.average || 0}/5
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <MiniStat label="Total" value={selectedRow.ratingStats?.total || 0} />
                                <MiniStat label="Guru" value={selectedRow.ratingStats?.guruCount || 0} />
                                <MiniStat label="Vendor" value={selectedRow.ratingStats?.vendorCount || 0} />
                            </div>

                            <p className="mt-3 text-[10px] font-semibold leading-relaxed text-amber-700/70">
                                Average dihitung dari user yang sudah memberi rating. User yang belum rating tetap bisa dipakai sebagai bahan evaluasi partisipasi.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-5">
                {selectedRowLocked && (
                    <div className="mb-4 flex items-start gap-3 rounded-[1.25rem] border border-slate-100 bg-slate-50 p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-300">
                            <Lock size={16} />
                        </div>

                        <div>
                            <p className="text-[13px] font-black text-slate-800">
                                Item ini masih terkunci
                            </p>

                            <p className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-400">
                                Selesaikan item sebelumnya terlebih dahulu. Untuk aktivitas, seluruh administrasi pembuka periode harus sudah disetujui.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                    {selectedRowRequirements.map((evidence, index) => {
                        const statusMeta = getEvidenceStatusMeta(
                            evidence.status,
                            selectedRowLocked,
                        );

                        const inputId = `ho-upload-${selectedRow.id}-${index}`.replaceAll(
                            " ",
                            "-",
                        );

                        const canValidate =
                            !selectedRowLocked && evidence.status === "WAITING_HO";

                        const canUpload =
                            !selectedRowLocked &&
                            (evidence.status === "WAITING_UPLOAD" ||
                                evidence.status === "REJECTED");

                        return (
                            <div
                                key={`${evidence.id}-${index}`}
                                className="rounded-[1.25rem] border border-slate-100 bg-slate-50 p-4"
                            >
                                <div className="mb-3 flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-[#0AC4E0]">
                                            Upload {index + 1}
                                        </p>

                                        <h4 className="mt-1 text-[13px] font-black text-slate-900">
                                            {evidence.name}
                                        </h4>

                                        <p className="mt-1 text-[10px] font-semibold leading-relaxed text-slate-400">
                                            {evidence.purpose}
                                        </p>
                                    </div>

                                    <span
                                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[8px] font-black uppercase tracking-widest ${statusMeta.className}`}
                                    >
                                        {statusMeta.icon}
                                        {statusMeta.label}
                                    </span>
                                </div>

                                {evidence.rejectedReason && (
                                    <div className="mb-3 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-[10px] font-bold leading-relaxed text-rose-600">
                                        Alasan reject: {evidence.rejectedReason}
                                    </div>
                                )}

                                <div className="mb-3 rounded-xl bg-white px-3 py-2">
                                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                                        File
                                    </p>

                                    <p className="mt-1 truncate text-[11px] font-bold text-slate-700">
                                        {evidence.fileName || "Belum ada file"}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => openEvidenceReviewModal(selectedRow, evidence, index)}
                                        className="inline-flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 text-[9px] font-black uppercase tracking-widest text-slate-500 transition hover:text-[#0AC4E0]"
                                    >
                                        <Eye size={13} />
                                        Lihat
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => openChatForRow(selectedRow, evidence)}
                                        className="inline-flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 text-[9px] font-black uppercase tracking-widest text-slate-500 transition hover:text-[#0AC4E0]"
                                    >
                                        <MessageSquare size={13} />
                                        Chat
                                    </button>
                                </div>

                                {selectedRowLocked && (
                                    <div className="mt-3 flex items-start gap-2 rounded-xl bg-white px-3 py-2 text-[10px] font-bold leading-relaxed text-slate-400">
                                        <Lock size={13} className="mt-0.5 shrink-0" />
                                        Upload ini belum bisa diproses karena alur sebelumnya belum selesai.
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
// â”€â”€â”€ Comment Drawer Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const COMMENT_TYPE_LABEL = {
    AO_REVIEW: { label: "Review AO", color: "text-blue-600 bg-blue-50 border-blue-100" },
    HO_APPROVAL: { label: "Keputusan HO", color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    GURU_RATING: { label: "Feedback Guru", color: "text-amber-600 bg-amber-50 border-amber-100" },
};

function CommentDrawer({ open, row, comments, commentText, setCommentText, commentType, setCommentType, loading, onClose, onSubmit }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[90] flex">
            <div className="flex-1 bg-slate-950/30 backdrop-blur-sm" onClick={onClose} />
            <div className="flex w-full max-w-[420px] flex-col bg-white shadow-[0_0_60px_rgba(15,23,42,0.2)]">
                {/* Header */}
                <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
                    <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-violet-500">
                            Komentar Kegiatan
                        </p>
                        <h3 className="mt-0.5 text-[16px] font-black text-slate-900 leading-tight">
                            {row?.title || "Kegiatan"}
                        </h3>
                        <p className="mt-1 text-[10px] text-slate-400 font-semibold">
                            AO review menjadi referensi HO untuk ACC/Reject · Guru beri feedback
                        </p>
                    </div>
                    <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-100 text-slate-400 hover:text-slate-700">
                        <X size={15} />
                    </button>
                </div>

                {/* Comment list */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 no-scrollbar">
                    {comments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-2">
                            <MessageSquare size={32} className="text-slate-200" />
                            <p className="text-[11px] font-bold text-slate-400">Belum ada komentar.</p>
                            <p className="text-[10px] text-slate-300">AO, HO, atau Guru bisa tambahkan komentar di sini.</p>
                        </div>
                    ) : (
                        comments.map((c) => {
                            const meta = COMMENT_TYPE_LABEL[c.comment_type] || COMMENT_TYPE_LABEL.AO_REVIEW;
                            const date = c.created_at ? new Date(c.created_at).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";
                            return (
                                <div key={c.id_comment} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-violet-100 text-[10px] font-black text-violet-600">
                                            {String(c.nama_user || "U").charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-black text-slate-800">{c.nama_user || "User"}</p>
                                            <p className="text-[9px] text-slate-400">{c.role_user}</p>
                                        </div>
                                        <span className={`ml-auto inline-flex items-center rounded-full border px-2 py-0.5 text-[8px] font-black uppercase ${meta.color}`}>
                                            {meta.label}
                                        </span>
                                    </div>
                                    <p className="text-[12px] font-semibold text-slate-700 leading-relaxed">{c.comment_text}</p>
                                    <p className="mt-2 text-[9px] text-slate-300">{date}</p>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Input */}
                <div className="shrink-0 border-t border-slate-100 p-4 space-y-3">
                    <div className="flex gap-2">
                        {["AO_REVIEW", "HO_APPROVAL", "GURU_RATING"].map((t) => {
                            const m = COMMENT_TYPE_LABEL[t];
                            return (
                                <button key={t} type="button" onClick={() => setCommentType(t)}
                                    className={`flex-1 rounded-xl border px-2 py-2 text-[8px] font-black uppercase tracking-wide transition ${commentType === t ? m.color : "border-slate-100 text-slate-300"}`}>
                                    {m.label}
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex gap-2">
                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Tulis komentar..."
                            rows={3}
                            className="flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-[12px] font-semibold text-slate-700 focus:border-violet-300 focus:outline-none"
                        />
                        <button
                            onClick={onSubmit}
                            disabled={loading || !commentText.trim()}
                            className="flex h-12 w-12 shrink-0 items-center justify-center self-end rounded-xl bg-violet-500 text-white shadow hover:bg-violet-600 disabled:opacity-40"
                        >
                            {loading ? <RefreshCcw size={16} className="animate-spin" /> : <Send size={16} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// â”€â”€â”€ Guru Rating Modal Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function GuruRatingModal({ open, row, ratingValue, setRatingValue, ratingComment, setRatingComment, loading, onClose, onSubmit }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-[0_35px_90px_rgba(15,23,42,0.25)]">
                {/* Header */}
                <div className="border-b border-slate-100 px-6 py-5">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-amber-500">
                                <Star size={12} fill="currentColor" />
                                Rating Kegiatan
                            </p>
                            <h3 className="mt-1 text-[20px] font-black text-slate-900 leading-tight">
                                {row?.title || "Kegiatan"}
                            </h3>
                            <p className="mt-1 text-[11px] font-semibold text-slate-400">
                                Kegiatan telah selesai. Berikan penilaian Anda.
                            </p>
                        </div>
                        <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-100 text-slate-400 hover:text-slate-700">
                            <X size={15} />
                        </button>
                    </div>
                </div>

                {/* Rating stars */}
                <div className="px-6 py-6 space-y-5">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">
                            Pilih Rating (1-5 Bintang)
                        </p>
                        <div className="flex justify-center gap-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRatingValue(star)}
                                    className={`flex h-14 w-14 items-center justify-center rounded-2xl border text-3xl transition-all active:scale-90 ${ratingValue >= star
                                        ? "border-amber-200 bg-amber-50 scale-110"
                                        : "border-slate-100 bg-slate-50 opacity-30 hover:opacity-60"
                                        }`}
                                >
                                    <Star
                                        size={28}
                                        fill={ratingValue >= star ? "currentColor" : "none"}
                                        className={
                                            ratingValue >= star
                                                ? "text-amber-400"
                                                : "text-slate-300"
                                        }
                                    />
                                </button>
                            ))}
                        </div>
                        {ratingValue > 0 && (
                            <p className="mt-2 text-center text-[11px] font-black text-amber-500">
                                {["", "Sangat Kurang", "Kurang", "Cukup", "Baik", "Sangat Baik"][ratingValue]} ({ratingValue}/5)
                            </p>
                        )}
                    </div>

                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
                            Komentar / Feedback (Opsional)
                        </p>
                        <textarea
                            value={ratingComment}
                            onChange={(e) => setRatingComment(e.target.value)}
                            placeholder="Ceritakan pengalaman Anda tentang kegiatan ini..."
                            rows={3}
                            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-[12px] font-semibold text-slate-700 focus:border-amber-300 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-full border border-slate-100 py-3 text-[10px] font-black uppercase text-slate-400 hover:text-slate-700"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={loading || ratingValue < 1}
                        className="flex-1 flex items-center justify-center gap-2 rounded-full bg-amber-400 py-3 text-[10px] font-black uppercase text-white shadow hover:bg-amber-500 disabled:opacity-40"
                    >
                        {loading ? <RefreshCcw size={14} className="animate-spin" /> : <Star size={14} />}
                        Simpan Rating
                    </button>
                </div>
            </div>
        </div>
    );
}

function EvidenceReviewModal({
    reviewModal,
    currentRole,
    onClose,
    onReject,
    onApprove,
}) {
    if (!reviewModal) return null;

    const { row, evidence, locked } = reviewModal;

    const fileUrl = getFileUrl(evidence?.file);
    const fileName = evidence?.fileName || evidence?.file || "Belum ada file";
    const lowerFile = String(fileName || "").toLowerCase();

    const isImage =
        lowerFile.endsWith(".jpg") ||
        lowerFile.endsWith(".jpeg") ||
        lowerFile.endsWith(".png") ||
        lowerFile.endsWith(".webp");

    const isPdf = lowerFile.endsWith(".pdf");

    const isWaitingAo = evidence?.status === "WAITING_AO";
    const isWaitingHo = evidence?.status === "WAITING_HO";

    const canAoValidate = !locked && isWaitingAo && currentRole?.isAO;
    const canHoValidate = !locked && isWaitingHo && currentRole?.isHO;

    const canValidate = canAoValidate || canHoValidate;

    const actionLabel = canAoValidate
        ? "Review AO"
        : canHoValidate
            ? "Keputusan HO"
            : "Belum bisa divalidasi";

    const approveLabel = canAoValidate ? "Setujui AO" : "ACC HO";
    const rejectLabel = canAoValidate ? "Tolak AO" : "Reject HO";

    return (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
            <div className="flex max-h-[92vh] w-full max-w-[880px] flex-col overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-[0_35px_90px_rgba(15,23,42,0.28)]">
                <div className="shrink-0 border-b border-slate-100 px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-[8px] font-black uppercase tracking-[0.22em] text-[#0AC4E0]">
                                Review Dokumen
                            </p>

                            <h3 className="mt-1 truncate text-[20px] font-black tracking-[-0.05em] text-slate-950">
                                {evidence?.name || "Dokumen Upload"}
                            </h3>

                            <p className="mt-1 truncate text-[11px] font-semibold text-slate-400">
                                {row?.phaseName} · {row?.parentLabel} · {row?.title}
                            </p>
                        </div>

                        <StatusBadge status={locked ? "LOCKED" : evidence?.status} />
                    </div>
                </div>

                <div className="simple-scroll min-h-0 flex-1 overflow-y-auto p-5">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_260px]">
                        <div className="overflow-hidden rounded-[1.5rem] border border-slate-100 bg-slate-50">
                            <div className="border-b border-slate-100 bg-white px-4 py-3">
                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                                    Preview File
                                </p>

                                <p className="mt-1 truncate text-[12px] font-black text-slate-800">
                                    {fileName}
                                </p>
                            </div>

                            <div className="flex min-h-[420px] items-center justify-center bg-slate-50 p-4">
                                {!fileUrl ? (
                                    <div className="text-center">
                                        <FileText size={38} className="mx-auto text-slate-300" />

                                        <h4 className="mt-4 text-[15px] font-black text-slate-900">
                                            File belum tersedia
                                        </h4>

                                        <p className="mt-2 max-w-[320px] text-[11px] font-semibold leading-relaxed text-slate-400">
                                            Dokumen ini belum diupload oleh vendor/narasumber.
                                        </p>
                                    </div>
                                ) : isImage ? (
                                    <img
                                        src={fileUrl}
                                        alt={evidence?.name || "Preview dokumen"}
                                        className="max-h-[560px] w-full rounded-[1.2rem] object-contain"
                                    />
                                ) : isPdf ? (
                                    <iframe
                                        src={fileUrl}
                                        title={evidence?.name || "Preview PDF"}
                                        className="h-[560px] w-full rounded-[1.2rem] border border-slate-100 bg-white"
                                    />
                                ) : (
                                    <div className="text-center">
                                        <FileText size={42} className="mx-auto text-[#0AC4E0]" />

                                        <h4 className="mt-4 text-[15px] font-black text-slate-900">
                                            Preview tidak tersedia
                                        </h4>

                                        <p className="mt-2 max-w-[340px] text-[11px] font-semibold leading-relaxed text-slate-400">
                                            Format file ini tidak bisa ditampilkan langsung.
                                            Buka file di tab baru untuk melihat dokumen.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                window.open(fileUrl, "_blank", "noopener,noreferrer")
                                            }
                                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-white transition hover:bg-[#0AC4E0]"
                                        >
                                            <Eye size={13} />
                                            Buka File
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <aside className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-4">
                            <p className="text-[8px] font-black uppercase tracking-widest text-[#0AC4E0]">
                                Detail Dokumen
                            </p>

                            <h4 className="mt-1 text-[15px] font-black text-slate-900">
                                {evidence?.name || "-"}
                            </h4>

                            <p className="mt-2 text-[11px] font-semibold leading-relaxed text-slate-500">
                                {evidence?.purpose || evidence?.description || "-"}
                            </p>

                            <div className="mt-4 space-y-3">
                                <div className="rounded-xl bg-white px-3 py-2">
                                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                                        Status
                                    </p>

                                    <p className="mt-1 text-[11px] font-black text-slate-700">
                                        {STATUS_LABEL[evidence?.status] || evidence?.status || "-"}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-white px-3 py-2">
                                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                                        File
                                    </p>

                                    <p className="mt-1 truncate text-[11px] font-black text-slate-700">
                                        {fileName}
                                    </p>
                                </div>

                                {evidence?.rejectedReason && (
                                    <div className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-rose-500">
                                            Catatan Reject
                                        </p>

                                        <p className="mt-1 text-[10px] font-bold leading-relaxed text-rose-600">
                                            {evidence.rejectedReason}
                                        </p>
                                    </div>
                                )}

                                {!canValidate && (
                                    <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2">
                                        <p className="text-[10px] font-bold leading-relaxed text-amber-700">
                                            {isWaitingAo &&
                                                "Bukti ini sedang menunggu review AO. Tombol aktif hanya untuk Area Officer."}

                                            {isWaitingHo &&
                                                "Bukti ini sedang menunggu keputusan HO. Tombol aktif hanya untuk Head Office."}

                                            {!isWaitingAo &&
                                                !isWaitingHo &&
                                                "Bukti belum berada pada status yang bisa divalidasi."}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </aside>
                    </div>
                </div>

                <div className="shrink-0 border-t border-slate-100 bg-slate-50 px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-100 bg-white px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 transition hover:text-slate-800"
                        >
                            <ArrowLeft size={14} />
                            Back
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onReject}
                                disabled={!canValidate}
                                className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <X size={14} />
                                {rejectLabel}
                            </button>

                            <button
                                type="button"
                                onClick={onApprove}
                                disabled={!canValidate}
                                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <CheckCircle2 size={14} />
                                {approveLabel}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default DetailProgramPage;

