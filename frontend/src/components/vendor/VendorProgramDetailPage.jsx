/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
    AlertTriangle,
    ArrowLeft,
    BriefcaseBusiness,
    Calendar,
    CheckCircle2,
    CheckSquare,
    ChevronRight,
    Clock,
    Eye,
    FileText,
    FolderOpen,
    Layers3,
    Lock,
    MessageSquare,
    RefreshCcw,
    Send,
    Star,
    UploadCloud,
    UserCheck,
    X,
} from "lucide-react";

import {
    Sidebar,
    PageWrapper,
    Input,
} from "../common";

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
    WAITING_UPLOAD: "Perlu Upload",

    REJECTED_AO: "Ditolak AO",
    REJECTED_HO: "Ditolak HO",
    REJECTED: "Ditolak",

    LOCKED: "Terkunci",
};

const EXECUTION_COPY = {
    openingTitle: "Administrasi Pembuka Periode",
    openingSubtitle: "Bukti Administratif",
    openingDesc:
        "Narasumber mengunggah bukti administratif pembuka periode. Setelah direview AO dan disetujui HO, aktivitas pada periode ini akan terbuka.",

    innerTitle: "Aktivitas Kegiatan",
    innerSubtitle: "Aktivitas + Bukti Pelaksanaan",
    innerDesc:
        "Narasumber mengunggah bukti pelaksanaan pada setiap aktivitas. Bukti akan direview AO terlebih dahulu, lalu diputuskan oleh HO.",
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
    }));
}

function getRatingStats(kegiatan = {}) {
    const ratings = getArray(kegiatan.ratings, kegiatan.rating_items);
    const total = ratings.length;
    const average = total
        ? ratings.reduce((sum, item) => sum + Number(item.rating || 0), 0) / total
        : Number(kegiatan.guru_rating || 0);

    return {
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

function getCommentReadStorageKey(programId) {
    const userId = getCurrentUserIdFromToken() || "guest";
    return `vendor-program-comment-read:${userId}:${programId || "unknown"}`;
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

    if (possibleFile) return "WAITING_AO";

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
            return "Dokumen administratif pembuka periode yang akan direview AO dan disetujui HO.";
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

function VendorProgramDetailPage({
    backPath = "/vendor/program",
    listPath = "/vendor/program",
    badgeText = "VD",
    titleHighlight = "Vendor",
}) {
    const { id } = useParams();
    const navigate = useNavigate();

    const [program, setProgram] = useState(null);
    const [loading, setLoading] = useState(true);

    const [masterSekolah, setMasterSekolah] = useState([]);
    const [masterHos, setMasterHos] = useState([]);
    const [masterAos, setMasterAos] = useState([]);
    const [masterVendor, setMasterVendor] = useState([]);

    const [activePhase, setActivePhase] = useState(0);
    const [monitoringRows, setMonitoringRows] = useState({});
    const [selectedRow, setSelectedRow] = useState(null);

    const [uploadContext, setUploadContext] = useState(null);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadNote, setUploadNote] = useState("");
    const uploadInputRef = useRef(null);

    const [showChat, setShowChat] = useState(false);
    const [chatContext, setChatContext] = useState(null);
    const [message, setMessage] = useState("");

    const [readCommentRows, setReadCommentRows] = useState(() =>
        loadCommentReadRows(id),
    );

    // Komentar kegiatan (Vendor bisa lihat, tapi tidak bisa tambah)
    const [showCommentDrawer, setShowCommentDrawer] = useState(false);
    const [commentRow, setCommentRow] = useState(null);
    const [comments, setComments] = useState([]);

    // UI state: filter konten eksekusi berdasarkan shape alur.
    const [flowFilter, setFlowFilter] = useState({
        type: "phase",
        phaseIndex: 0,
        rowId: null,
        rowType: null,
    });

    const [chats, setChats] = useState([
        {
            sender: "System",
            text:
                "Ruang diskusi vendor aktif. Gunakan chat untuk koordinasi berdasarkan program, periode, administrasi pembuka, aktivitas, atau upload bukti tertentu.",
            isSystem: true,
            time: "System",
        },
    ]);

    const fetchUserById = async (userId, headers) => {
        if (!userId) return null;

        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                headers,
            });

            const result = await safeJson(response);

            if (!response.ok) return null;

            return result?.data || result;
        } catch {
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

            const [resProgram, resSekolah, resHo, resAo, resVendor] =
                await Promise.all([
                    fetch(`${API_BASE_URL}/program/${id}`, { headers }),
                    fetch(`${API_BASE_URL}/sekolah`, { headers }),
                    fetch(`${API_BASE_URL}/users/ho`, { headers }),
                    fetch(`${API_BASE_URL}/users/ao`, { headers }),
                    fetch(`${API_BASE_URL}/vendor`, { headers }),
                ]);

            const dataProgram = await safeJson(resProgram);
            const dataSekolah = await safeJson(resSekolah);
            const dataHo = await safeJson(resHo);
            const dataAo = await safeJson(resAo);
            const dataVendor = await safeJson(resVendor);

            if (!resProgram.ok) {
                throw new Error(
                    dataProgram?.message || "Gagal memuat detail program vendor",
                );
            }

            const detail = dataProgram?.data || dataProgram;

            const normalizedHo = normalizeArray(dataHo);
            const normalizedAo = normalizeArray(dataAo);

            const hoId =
                detail?.id_ho ||
                detail?.dibuat_oleh ||
                detail?.created_by ||
                detail?.created_by_id ||
                detail?.ho_id ||
                detail?.ho?.id_user ||
                detail?.ho?.id ||
                detail?.user?.id_user ||
                detail?.user?.id ||
                null;

            const aoId =
                detail?.id_pengawas ||
                detail?.id_ao ||
                detail?.pengawas_id ||
                detail?.area_officer_id ||
                detail?.ao_id ||
                detail?.ao?.id_user ||
                detail?.ao?.id ||
                detail?.pengawas?.id_user ||
                detail?.pengawas?.id ||
                null;

            const hasHo = normalizedHo.some((item) => {
                const itemId = item?.id_user || item?.id_ho || item?.id;
                return String(itemId) === String(hoId);
            });

            const hasAo = normalizedAo.some((item) => {
                const itemId = item?.id_user || item?.id_ao || item?.id;
                return String(itemId) === String(aoId);
            });

            if (hoId && !hasHo) {
                const fallbackHo = await fetchUserById(hoId, headers);

                if (fallbackHo) {
                    normalizedHo.push(fallbackHo);
                }
            }

            if (aoId && !hasAo) {
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

            setMonitoringRows(buildMonitoringRows(detail));
            setActivePhase(0);
            setSelectedRow(null);
        } catch (error) {
            console.error("Gagal memuat detail program vendor:", error);
            toast.error(error.message || "Gagal memuat detail program vendor");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProgramDetail();
    }, [id]);
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

    const getHoName = () => {
        const hoId =
            program?.dibuat_oleh ||
            program?.created_by ||
            program?.created_by_id ||
            program?.id_ho ||
            program?.ho_id ||
            program?.id_head_office ||
            program?.head_office_id ||
            program?.ho?.id_user ||
            program?.ho?.id ||
            program?.user?.id_user ||
            program?.user?.id ||
            program?.created_by_user?.id_user ||
            program?.created_by_user?.id ||
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
            program?.head_office?.nama ||
            program?.head_office?.name ||
            program?.created_by_user?.nama ||
            program?.created_by_user?.name ||
            program?.created_by?.nama ||
            program?.created_by?.name ||
            program?.user?.nama ||
            program?.user?.name ||
            program?.nama_ho ||
            program?.nama_head_office ||
            ho?.nama ||
            ho?.name ||
            ho?.nama_lengkap ||
            "-"
        );
    };

    const getAoName = () => {
        const aoId =
            program?.id_pengawas ||
            program?.id_ao ||
            program?.id_area_officer ||
            program?.area_officer_id ||
            program?.ao_id ||
            program?.pengawas_id ||
            program?.assigned_ao_id ||
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
            program?.area_officer?.nama ||
            program?.area_officer?.name ||
            program?.nama_pengawas ||
            program?.nama_ao ||
            program?.nama_area_officer ||
            ao?.nama ||
            ao?.name ||
            ao?.nama_lengkap ||
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

    const normalizeRequirement = (requirement, reqIndex, detail, context) => {
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

            rejectedReason:
                requirement?.rejected_reason ||
                requirement?.ao_rejected_reason ||
                requirement?.alasan_reject ||
                requirement?.alasan ||
                requirement?.reason ||
                requirement?.komentar ||
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
                            time:
                                requirement?.updated_at ||
                                requirement?.created_at ||
                                "Initial",
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

                    statusKegiatan: kegiatan.status_kegiatan || "LOCKED",
                    guruRating: kegiatan.guru_rating || null,
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

    const isRowApproved = (row) => {
        if (!row?.evidences?.length) return false;

        return row.evidences.every((item) => item.status === "APPROVED");
    };

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

    const openFile = (file) => {
        const url = getFileUrl(file);

        if (!url) {
            toast.info("File belum tersedia.");
            return;
        }

        window.open(url, "_blank", "noopener,noreferrer");
    };

    // Vendor hanya bisa LIHAT komentar (read-only), tidak bisa tambah
    const fetchComments = async (idKegiatan) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/program/kegiatan/${idKegiatan}/comments`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json().catch(() => ({}));
            setComments(Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []);
        } catch { setComments([]); }
    };

    const openCommentForRow = async (row) => {
        if (!row?.parentId) return;

        setCommentRow(row);
        setComments([]);

        const nextReadRows = {
            ...readCommentRows,
            [row.id]: Number(row.commentCount || 0),
        };

        setReadCommentRows(nextReadRows);
        saveCommentReadRows(id, nextReadRows);

        setShowCommentDrawer(true);
        await fetchComments(row.parentId);
    };

    const openUploadModal = (row, evidenceIndex) => {
        if (isRowLocked(row)) {
            toast.info("Bagian ini masih terkunci.");
            return;
        }

        const evidence = row.evidences[evidenceIndex];

        if (!evidence) {
            toast.error("Data upload tidak ditemukan.");
            return;
        }

        const canUpload =
            evidence.status === "WAITING_UPLOAD" ||
            evidence.status === "REJECTED" ||
            evidence.status === "REJECTED_AO" ||
            evidence.status === "REJECTED_HO";

        if (!canUpload) {
            toast.info(
                evidence.status === "WAITING_AO"
                    ? "File sudah dikirim dan sedang menunggu review AO."
                    : evidence.status === "WAITING_HO"
                        ? "File sudah direview AO dan sedang menunggu keputusan HO."
                        : evidence.status === "APPROVED"
                            ? "Upload ini sudah disetujui HO dan tidak bisa diupload ulang."
                            : "Upload belum bisa dilakukan pada status saat ini.",
            );
            return;
        }

        setUploadContext({
            rowId: row.id,
            rowTitle: row.title,
            rowType: row.type,

            phaseId: row.phaseId,
            phaseName: row.phaseName,

            evidenceIndex,
            evidenceName: evidence.name,
            evidenceType: evidence.type,
            evidencePurpose: evidence.purpose,

            parentType: evidence.parentType,
            parentId: evidence.parentId,
            parentTitle: evidence.parentTitle,
            parentLabel: evidence.parentLabel,

            requirementId: evidence.rawId,
        });

        setUploadFile(null);
        setUploadNote("");
    };

    const closeUploadModal = () => {
        setUploadContext(null);
        setUploadFile(null);
        setUploadNote("");
    };

    const submitUpload = async () => {
        if (!uploadContext) return;

        if (!uploadContext.requirementId) {
            toast.error("ID persyaratan tidak ditemukan. Cek data detail program.");
            return;
        }

        if (uploadContext.evidenceType === "upload" && !uploadFile) {
            toast.error("Pilih file terlebih dahulu.");
            return;
        }

        if (uploadFile && uploadFile.size > 10485760) {
            toast.error("File terlalu besar. Maksimal 10MB.");
            return;
        }

        const token = localStorage.getItem("token");

        const endpoint =
            uploadContext.parentType === "termin"
                ? `${API_BASE_URL}/program/persyaratan-termin/${uploadContext.requirementId}/upload`
                : `${API_BASE_URL}/program/persyaratan-kegiatan/${uploadContext.requirementId}/upload`;

        try {
            const formData = new FormData();

            formData.append("catatan", uploadNote || "");
            formData.append("status", "WAITING_AO");

            if (uploadFile) {
                formData.append("file", uploadFile);
            }

            const response = await fetch(endpoint, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const result = await safeJson(response);

            if (!response.ok) {
                throw new Error(
                    result?.message ||
                    result?.error ||
                    "Gagal upload bukti persyaratan",
                );
            }

            await sendUploadActivityToChat();

            toast.success(result?.message || "Bukti berhasil dikirim dan menunggu review AO");
            closeUploadModal();

            await fetchProgramDetail();
        } catch (error) {
            console.error("Gagal upload bukti:", error);
            toast.error(error.message || "Gagal upload bukti");
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

    const normalizeChatFromBackend = (items = []) => {
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
                        "Ruang diskusi aktif. Pesan tersimpan berdasarkan konteks program, periode, administrasi pembuka, aktivitas, dan upload bukti tertentu.",
                    isSystem: true,
                    time: "System",
                },
                ...normalizeChatFromBackend(payload),
            ]);
        } catch (error) {
            console.error("Gagal mengambil chat:", error);

            if (!silent) {
                toast.error(error.message || "Gagal mengambil chat");
            }
        }
    };

    const handleOpenChat = async (context = null) => {
        const finalContext =
            context || {
                rowId: null,
                rowTitle: null,
                rowType: null,

                phaseId: phases[activePhase]?.id || null,
                phaseName: phases[activePhase]?.nama || null,

                parentType: null,
                parentId: null,
                requirementId: null,
                evidenceName: null,
            };

        setChatContext(finalContext);
        setShowChat(true);

        await fetchChats(finalContext);
    };

    const sendChatToBackend = async () => {
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
            await fetchChats(chatContext);
        } catch (error) {
            console.error("Gagal mengirim chat:", error);
            toast.error(error.message || "Gagal mengirim chat");
        }
    };

    const sendUploadActivityToChat = async () => {
        if (!uploadContext || !program?.id_program) return;

        try {
            const token = localStorage.getItem("token");

            const payload = {
                id_program: program?.id_program,
                id_fase: uploadContext?.phaseId || null,
                id_termin:
                    uploadContext?.parentType === "termin"
                        ? uploadContext?.parentId
                        : null,
                id_kegiatans:
                    uploadContext?.parentType === "kegiatan"
                        ? uploadContext?.parentId
                        : null,
                id_persyaratan: uploadContext?.requirementId || null,
                konteks: "PERSYARATAN",
                pesan: `Vendor/Narasumber mengupload bukti "${uploadContext.evidenceName}" untuk ${uploadContext.parentLabel} "${uploadContext.parentTitle}" pada ${uploadContext.phaseName}.${uploadNote ? ` Catatan: ${uploadNote}` : ""}`,
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
                throw new Error(result?.message || "Gagal menyimpan history upload");
            }
        } catch (error) {
            console.error("Gagal menyimpan history upload:", error);
        }
    };

    const handleSendChat = async () => {
        await sendChatToBackend();
    };

    useEffect(() => {
        if (!showChat || !chatContext || !program?.id_program) return;

        fetchChats(chatContext, true);

        const intervalId = setInterval(() => {
            fetchChats(chatContext, true);
        }, 3000);

        return () => clearInterval(intervalId);
    }, [showChat, chatContext, program?.id_program]);
    const currentPhase = phases[activePhase] || null;

    const selectedRowLocked = selectedRow ? isRowLocked(selectedRow) : true;
    const selectedRowStatus = selectedRow
        ? selectedRowLocked
            ? "LOCKED"
            : getRowStatus(selectedRow)
        : "WAITING_UPLOAD";

    const selectedRowEvidences = selectedRow?.evidences || [];
    const selectedApprovedCount = selectedRowEvidences.filter(
        (item) => item.status === "APPROVED",
    ).length;

    const selectedRowProgress = selectedRowEvidences.length
        ? Math.round((selectedApprovedCount / selectedRowEvidences.length) * 100)
        : 0;

    if (loading) {
        return (
            <PageWrapper className="flex h-screen items-center justify-center bg-[#EEF5FF]">
                <div className="rounded-[2rem] border border-white bg-white px-10 py-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                    <div className="mx-auto mb-5 h-11 w-11 animate-spin rounded-full border-4 border-[#0AC4E0] border-t-transparent" />

                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0AC4E0]">
                        Memuat Program
                    </p>

                    <p className="mt-2 text-xs font-semibold text-slate-400">
                        Menyiapkan halaman upload, periode, dan chat koordinasi.
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
                                        Vendor / Narasumber Execution
                                    </span>

                                    <span className="h-1 w-1 rounded-full bg-slate-300" />

                                    <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-amber-600">
                                        {program?.status_program || "Approval"}
                                    </span>
                                </div>

                                <h1 className="truncate text-[25px] font-black leading-none tracking-[-0.055em] text-slate-950">
                                    {program?.nama_program || "Detail Program"}{" "}
                                    <span className="text-[#0AC4E0]">
                                        {titleHighlight}
                                    </span>
                                </h1>

                                <p className="mt-2 truncate text-[11px] font-bold text-slate-400">
                                    {getSchoolName()} · {getHoName()} · {getAoName()}
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
                                onClick={() => handleOpenChat()}
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 transition hover:text-[#0AC4E0]"
                            >
                                <MessageSquare size={15} />
                                Chat Koordinasi
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate(listPath)}
                                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-[#0AC4E0]"
                            >
                                <FolderOpen size={15} />
                                Daftar Program
                            </button>
                        </div>
                    </div>
                </header>

                <section className="simple-scroll min-h-0 flex-1 overflow-y-auto pt-4">
                    <div className="space-y-5">
                        <VendorSummaryPanel
                            program={program}
                            schoolName={getSchoolName()}
                            hoName={getHoName()}
                            aoName={getAoName()}
                            vendorName={getVendorName()}
                            progress={progress}
                        />

                        <section className="space-y-5">
                            <VendorArrowPhaseSteps
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
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
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
                                                "Upload dimulai dari administrasi pembuka periode, lalu aktivitas terbuka setelah review AO dan keputusan HO selesai."}
                                        </p>
                                    </div>

                                    <div
                                        className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-2xl border px-4 py-2.5 text-[9px] font-black uppercase tracking-widest ${activeWorkflowStatus.className}`}
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
                                <VendorExecutionTablePanel
                                    title={EXECUTION_COPY.openingTitle}
                                    subtitle={EXECUTION_COPY.openingSubtitle}
                                    description={EXECUTION_COPY.openingDesc}
                                    rows={visibleOpeningRows}
                                    sectionStatus={openingSectionStatus}
                                    selectedRow={selectedRow}
                                    setSelectedRow={setSelectedRow}
                                    getRowStatus={getRowStatus}
                                    isRowLocked={isRowLocked}
                                    openUploadModal={openUploadModal}
                                    openFile={openFile}
                                    handleOpenChat={handleOpenChat}
                                    openCommentForRow={openCommentForRow}
                                    readCommentRows={readCommentRows}
                                />
                            )}

                            {hasVisibleInnerRows && (
                                <VendorExecutionTablePanel
                                    title={EXECUTION_COPY.innerTitle}
                                    subtitle={EXECUTION_COPY.innerSubtitle}
                                    description={EXECUTION_COPY.innerDesc}
                                    rows={visibleInnerRows}
                                    sectionStatus={innerSectionStatus}
                                    selectedRow={selectedRow}
                                    setSelectedRow={setSelectedRow}
                                    getRowStatus={getRowStatus}
                                    isRowLocked={isRowLocked}
                                    openUploadModal={openUploadModal}
                                    openFile={openFile}
                                    handleOpenChat={handleOpenChat}
                                    openCommentForRow={openCommentForRow}
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

                            <VendorSelectedRowPanel
                                selectedRow={selectedRow}
                                selectedRowStatus={selectedRowStatus}
                                selectedRowLocked={selectedRowLocked}
                                selectedRowProgress={selectedRowProgress}
                                selectedApprovedCount={selectedApprovedCount}
                                selectedRowEvidences={selectedRowEvidences}
                                openUploadModal={openUploadModal}
                                openFile={openFile}
                                handleOpenChat={handleOpenChat}
                            />
                        </section>
                    </div>                </section>
            </main>
            <UploadEvidenceModal
                uploadContext={uploadContext}
                uploadFile={uploadFile}
                setUploadFile={setUploadFile}
                uploadNote={uploadNote}
                setUploadNote={setUploadNote}
                uploadInputRef={uploadInputRef}
                closeUploadModal={closeUploadModal}
                submitUpload={submitUpload}
            />

            <VendorChatDrawer
                open={showChat}
                onClose={() => setShowChat(false)}
                chatContext={chatContext}
                chats={chats}
                message={message}
                setMessage={setMessage}
                handleSendChat={handleSendChat}
            />

            {/* Komentar Kegiatan - Vendor hanya lihat (read-only) */}
            {showCommentDrawer && (
                <div className="fixed inset-0 z-[90] flex">
                    <div className="flex-1 bg-slate-950/30 backdrop-blur-sm" onClick={() => { setShowCommentDrawer(false); setCommentRow(null); }} />
                    <div className="flex w-full max-w-[400px] flex-col bg-white shadow-[0_0_60px_rgba(15,23,42,0.2)]">
                        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
                            <div>
                                <p className="text-[8px] font-black uppercase tracking-widest text-violet-500"> Komentar Kegiatan</p>
                                <h3 className="mt-0.5 text-[16px] font-black text-slate-900">{commentRow?.title || "Kegiatan"}</h3>
                                <p className="mt-1 text-[10px] text-slate-400 font-semibold">Review AO · Keputusan HO · Feedback Guru</p>
                            </div>
                            <button onClick={() => { setShowCommentDrawer(false); setCommentRow(null); }}
                                className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-100 text-slate-400 hover:text-slate-700">
                                <X size={15} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                            {comments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-2">
                                    <MessageSquare size={32} className="text-slate-200" />
                                    <p className="text-[11px] font-bold text-slate-400">Belum ada komentar dari AO atau HO.</p>
                                </div>
                            ) : (
                                comments.map((c) => {
                                    const typeColors = {
                                        AO_REVIEW: "border-blue-100 bg-blue-50 text-blue-600",
                                        HO_APPROVAL: "border-emerald-100 bg-emerald-50 text-emerald-600",
                                        GURU_RATING: "border-amber-100 bg-amber-50 text-amber-600",
                                    };
                                    const typeLabels = { AO_REVIEW: "Review AO", HO_APPROVAL: "Keputusan HO", GURU_RATING: "Feedback Guru" };
                                    const meta = typeColors[c.comment_type] || typeColors.AO_REVIEW;
                                    const date = c.created_at ? new Date(c.created_at).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";
                                    return (
                                        <div key={c.id_comment} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-violet-100 text-[10px] font-black text-violet-600">
                                                    {String(c.nama_user || "U").charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black text-slate-800">{c.nama_user}</p>
                                                    <p className="text-[9px] text-slate-400">{c.role_user}</p>
                                                </div>
                                                <span className={`ml-auto inline-flex items-center rounded-full border px-2 py-0.5 text-[8px] font-black uppercase ${meta}`}>
                                                    {typeLabels[c.comment_type] || c.comment_type}
                                                </span>
                                            </div>
                                            <p className="text-[12px] font-semibold text-slate-700 leading-relaxed">{c.comment_text}</p>
                                            <p className="mt-2 text-[9px] text-slate-300">{date}</p>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        <div className="shrink-0 border-t border-slate-100 px-5 py-3">
                            <p className="text-[10px] text-slate-400 text-center font-semibold">
                                Vendor hanya dapat melihat komentar. Gunakan Chat untuk koordinasi langsung.
                            </p>
                        </div>
                    </div>
                </div>
            )}

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
function VendorSummaryPanel({
    program,
    schoolName,
    hoName,
    aoName,
    vendorName,
    progress,
}) {
    const infoItems = [
        { label: "Sekolah", value: schoolName },
        { label: "HO", value: hoName },
        { label: "AO", value: aoName },
        { label: "Vendor", value: vendorName },
        { label: "Kategori", value: program?.kategori || program?.kategori_program || "-" },
        { label: "Tahun", value: program?.tahun || "-" },
        { label: "Status", value: program?.status_program || "Approval" },
        { label: "MOU", value: program?.nomor_mou || program?.no_mou || "-" },
    ];

    return (
        <section className="overflow-hidden rounded-[1.6rem] border-2 border-[#0AC4E0]/70 bg-white shadow-[0_18px_55px_rgba(10,196,224,0.10)]">
            <div className="flex flex-col gap-5 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-cyan-50 px-3 py-1 text-[8px] font-black uppercase tracking-[0.22em] text-[#0AC4E0]">
                            Ringkasan Program
                        </span>
                        <span className="text-[8px] font-black uppercase tracking-[0.22em] text-slate-400">
                            Vendor Execution View
                        </span>
                    </div>

                    <h2 className="mt-2 truncate text-[20px] font-black tracking-[-0.05em] text-slate-950">
                        {program?.nama_program || "Detail Program"}
                    </h2>

                    <div className="mt-3 grid gap-x-5 gap-y-2 text-[11px] font-semibold text-slate-500 sm:grid-cols-2 xl:grid-cols-4">
                        {infoItems.map((item) => (
                            <div key={item.label} className="min-w-0">
                                <span className="font-black uppercase tracking-[0.14em] text-slate-400">
                                    {item.label}: {" "}
                                </span>
                                <span className="break-words font-bold text-slate-700">
                                    {item.value || "-"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-full shrink-0 rounded-[1.25rem] border border-cyan-100 bg-cyan-50/50 px-4 py-3 lg:w-[250px]">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#0AC4E0]">
                                Progress Bukti
                            </p>
                            <p className="mt-1 text-[11px] font-bold text-slate-500">
                                {progress.approved}/{progress.total || 0} bukti disetujui
                            </p>
                        </div>
                        <p className="text-2xl font-black tracking-[-0.06em] text-slate-950">
                            {progress.percentage}%
                        </p>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                        <div
                            className="h-full rounded-full bg-[#0AC4E0]"
                            style={{ width: `${progress.percentage}%` }}
                        />
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2 text-[8px] font-black uppercase tracking-widest text-slate-400">
                        <span>Upload {progress.waitingUpload}</span>
                        <span>AO {progress.waitingAo}</span>
                        <span>HO {progress.waitingHo}</span>
                        <span>Reject {progress.rejected}</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

function VendorArrowPhaseSteps({
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
                        Klik shape fase, administrasi, atau aktivitas untuk memfilter tabel upload di bawah.
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

function VendorExecutionTablePanel({
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
    openUploadModal,
    openFile,
    handleOpenChat,
    openCommentForRow,
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
                <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-slate-50 text-slate-300">
                        <Lock size={28} />
                    </div>

                    <h4 className="mt-4 text-[16px] font-black text-slate-900">
                        Aktivitas masih terkunci
                    </h4>

                    <p className="mt-2 max-w-md text-[12px] font-semibold leading-relaxed text-slate-400">
                        Tunggu sampai seluruh administrasi pembuka periode direview AO dan disetujui HO.
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

                                <th className="w-[200px] px-5 py-4 text-right text-[9px] font-black uppercase tracking-widest text-slate-400">
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
                                            Item upload belum tersedia pada bagian ini.
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

                                    const uploadableIndex = (row.evidences || []).findIndex(
                                        (item) =>
                                            item.status === "WAITING_UPLOAD" ||
                                            item.status === "REJECTED" ||
                                            item.status === "REJECTED_AO" ||
                                            item.status === "REJECTED_HO",
                                    );

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
                                                                ? "Termin Luar / Upload Pembuka"
                                                                : "Kegiatan Dalam Fase"}
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
                                                                    {row.ratingStats?.average || 0}/5 · {row.ratingStats?.total || 0}
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

                                                    <button
                                                        type="button"
                                                        disabled={rowLocked || uploadableIndex === -1}
                                                        onClick={() => openUploadModal(row, uploadableIndex)}
                                                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 transition hover:text-[#0AC4E0] disabled:cursor-not-allowed disabled:opacity-40"
                                                        title="Upload"
                                                    >
                                                        <UploadCloud size={15} />
                                                    </button>

                                                    {row.type === "kegiatan" && (
                                                        <button
                                                            type="button"
                                                            onClick={() => openCommentForRow(row)}
                                                            disabled={rowLocked}
                                                            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-400 transition hover:bg-violet-100 hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-40"
                                                            title="Lihat Komentar AO/HO/Guru"
                                                        >
                                                            <MessageSquare size={15} />
                                                            {(() => {
                                                                const unreadCommentCount = Math.max(
                                                                    Number(row.commentCount || 0) -
                                                                    Number(readCommentRows[row.id] || 0),
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

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleOpenChat({
                                                                rowId: row.id,
                                                                rowTitle: row.title,
                                                                rowType: row.type,
                                                                phaseId: row.phaseId,
                                                                phaseName: row.phaseName,
                                                                parentType: row.type,
                                                                parentId: row.parentId,
                                                            })
                                                        }
                                                        disabled={rowLocked}
                                                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 transition hover:text-[#0AC4E0] disabled:cursor-not-allowed disabled:opacity-40"
                                                        title="Chat Koordinasi"
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
function VendorSelectedRowPanel({
    selectedRow,
    selectedRowStatus,
    selectedRowLocked,
    selectedRowProgress,
    selectedApprovedCount,
    selectedRowEvidences,
    openUploadModal,
    openFile,
    handleOpenChat,
}) {
    if (!selectedRow) {
        return (
            <section className="rounded-[1.6rem] border border-dashed border-slate-200 bg-white px-6 py-10 text-center shadow-[0_12px_35px_rgba(15,23,42,0.04)]">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-cyan-50 text-[#0AC4E0]">
                    <Eye size={26} />
                </div>

                <h3 className="mt-4 text-[18px] font-black tracking-[-0.04em] text-slate-950">
                    Pilih baris upload
                </h3>

                <p className="mx-auto mt-2 max-w-[420px] text-[12px] font-semibold leading-relaxed text-slate-400">
                    Klik tombol detail pada tabel untuk melihat semua kebutuhan upload pada Termin Luar atau Kegiatan Dalam Fase.
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
                            Detail Upload
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
                            {selectedApprovedCount}/{selectedRowEvidences.length}
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
                                            <p className="text-[11px] font-black text-slate-800">{meeting.title}</p>
                                            <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                {meeting.startDate || "-"} s/d {meeting.endDate || "-"}
                                            </p>
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
                                Selesaikan item sebelumnya terlebih dahulu. Untuk aktivitas, seluruh administrasi pembuka periode harus sudah direview AO dan disetujui HO.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                    {selectedRowEvidences.map((evidence, index) => {
                        const canUpload =
                            !selectedRowLocked &&
                            (evidence.status === "WAITING_UPLOAD" ||
                                evidence.status === "REJECTED" ||
                                evidence.status === "REJECTED_AO" ||
                                evidence.status === "REJECTED_HO");

                        const isRejected = ["REJECTED", "REJECTED_AO", "REJECTED_HO"].includes(evidence.status);
                        const isWaitingAo = evidence.status === "WAITING_AO";
                        const isWaitingHo = evidence.status === "WAITING_HO";
                        const isApproved = evidence.status === "APPROVED";

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

                                    <StatusBadge
                                        status={selectedRowLocked ? "LOCKED" : evidence.status}
                                    />
                                </div>

                                {isRejected && (
                                    <div className="mb-3 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-[10px] font-bold leading-relaxed text-rose-600">
                                        Catatan Penolakan: {evidence.rejectedReason || "Bukti ditolak. Silakan upload ulang sesuai catatan AO/HO."}
                                    </div>
                                )}

                                <div className="mb-3 rounded-xl bg-white px-3 py-2">
                                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                                        File Terakhir
                                    </p>

                                    <p className="mt-1 truncate text-[11px] font-bold text-slate-700">
                                        {evidence.fileName || "Belum ada file"}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    {evidence.file && (
                                        <button
                                            type="button"
                                            onClick={() => openFile(evidence.file)}
                                            className="inline-flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 text-[9px] font-black uppercase tracking-widest text-slate-500 transition hover:text-[#0AC4E0]"
                                        >
                                            <Eye size={13} />
                                            Lihat
                                        </button>
                                    )}

                                    {canUpload && (
                                        <button
                                            type="button"
                                            onClick={() => openUploadModal(selectedRow, index)}
                                            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-white transition hover:bg-[#0AC4E0]"
                                        >
                                            <UploadCloud size={13} />
                                            {isRejected ? "Upload Ulang" : "Upload"}
                                        </button>
                                    )}

                                    {isWaitingAo && (
                                        <span className="inline-flex items-center gap-2 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-sky-600">
                                            <Clock size={13} />
                                            Menunggu AO
                                        </span>
                                    )}

                                    {isWaitingHo && (
                                        <span className="inline-flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-amber-600">
                                            <Clock size={13} />
                                            Menunggu HO
                                        </span>
                                    )}

                                    {isApproved && (
                                        <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-emerald-600">
                                            <CheckCircle2 size={13} />
                                            Selesai
                                        </span>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleOpenChat({
                                                rowId: selectedRow.id,
                                                rowTitle: selectedRow.title,
                                                rowType: selectedRow.type,
                                                phaseId: selectedRow.phaseId,
                                                phaseName: selectedRow.phaseName,
                                                parentType: selectedRow.type,
                                                parentId: selectedRow.parentId,
                                                requirementId: evidence.rawId,
                                                evidenceName: evidence.name,
                                            })
                                        }
                                        className="inline-flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 text-[9px] font-black uppercase tracking-widest text-slate-500 transition hover:text-[#0AC4E0]"
                                    >
                                        <MessageSquare size={13} />
                                        Chat
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function UploadEvidenceModal({
    uploadContext,
    uploadFile,
    setUploadFile,
    uploadNote,
    setUploadNote,
    uploadInputRef,
    closeUploadModal,
    submitUpload,
}) {
    if (!uploadContext) return null;

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/30 px-4 backdrop-blur-sm">
            <div className="w-full max-w-[560px] rounded-[2rem] border border-slate-100 bg-white p-5 shadow-[0_30px_80px_rgba(15,23,42,0.24)]">
                <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-[8px] font-black uppercase tracking-[0.22em] text-[#0AC4E0]">
                            Upload Evidence
                        </p>

                        <h3 className="mt-1 text-[20px] font-black tracking-[-0.05em] text-slate-950">
                            {uploadContext.evidenceName}
                        </h3>

                        <p className="mt-1 truncate text-[11px] font-semibold text-slate-400">
                            {uploadContext.phaseName} · {uploadContext.parentLabel} ·{" "}
                            {uploadContext.parentTitle}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={closeUploadModal}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="mb-4 rounded-[1.25rem] border border-cyan-100 bg-cyan-50/70 p-4">
                    <p className="text-[8px] font-black uppercase tracking-widest text-[#0AC4E0]">
                        Tujuan Upload
                    </p>

                    <p className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-600">
                        {uploadContext.evidencePurpose}
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                            File Bukti
                        </p>

                        <button
                            type="button"
                            onClick={() => uploadInputRef.current?.click()}
                            className="flex w-full flex-col items-center justify-center rounded-[1.35rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center transition hover:border-[#0AC4E0] hover:bg-cyan-50/40"
                        >
                            <UploadCloud size={26} className="text-[#0AC4E0]" />

                            <p className="mt-3 text-[13px] font-black text-slate-800">
                                {uploadFile ? uploadFile.name : "Klik untuk memilih file"}
                            </p>

                            <p className="mt-1 text-[10px] font-semibold text-slate-400">
                                PDF, gambar, dokumen, atau spreadsheet. Maksimal 10MB.
                            </p>
                        </button>

                        <input
                            ref={uploadInputRef}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                            className="hidden"
                            onChange={(event) =>
                                setUploadFile(event.target.files?.[0] || null)
                            }
                        />
                    </div>

                    <div>
                        <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Catatan
                        </p>

                        <textarea
                            value={uploadNote}
                            onChange={(event) => setUploadNote(event.target.value)}
                            placeholder="Tambahkan catatan singkat untuk AO/HO..."
                            className="h-[110px] w-full resize-none rounded-[1.25rem] border border-slate-100 bg-slate-50 px-4 py-3 text-[12px] font-semibold text-slate-700 outline-none transition focus:border-cyan-100 focus:bg-white focus:shadow-[0_0_0_3px_rgba(10,196,224,0.14)]"
                        />
                    </div>
                </div>

                <div className="mt-5 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={closeUploadModal}
                        className="rounded-2xl border border-slate-100 bg-white px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 transition hover:text-slate-700"
                    >
                        Batal
                    </button>

                    <button
                        type="button"
                        onClick={submitUpload}
                        className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-[#0AC4E0]"
                    >
                        <UploadCloud size={14} />
                        Kirim ke HO
                    </button>
                </div>
            </div>
        </div>
    );
}

function VendorChatDrawer({
    open,
    onClose,
    chatContext,
    chats,
    message,
    setMessage,
    handleSendChat,
}) {
    if (!open) return null;

    const groupedChats = chats.reduce((groups, chat) => {
        const formatted = chat.createdAt
            ? formatChatDateTime(chat.createdAt)
            : formatChatDateTime(chat.time);

        const label =
            chat.isSystem
                ? "System"
                : chat.dateLabel || formatted.label || "Hari ini";

        const lastGroup = groups[groups.length - 1];

        if (!lastGroup || lastGroup.label !== label) {
            groups.push({
                label,
                items: [chat],
            });
        } else {
            lastGroup.items.push(chat);
        }

        return groups;
    }, []);

    return (
        <div className="fixed inset-0 z-[80] flex justify-end bg-slate-950/25 backdrop-blur-sm">
            <div className="flex h-full w-full max-w-[430px] flex-col border-l border-slate-100 bg-white shadow-[-20px_0_60px_rgba(15,23,42,0.18)]">
                <div className="shrink-0 border-b border-slate-100 px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-[8px] font-black uppercase tracking-[0.22em] text-[#0AC4E0]">
                                Live Chat
                            </p>

                            <h3 className="mt-1 text-[18px] font-black tracking-[-0.04em] text-slate-950">
                                Diskusi dengan HO
                            </h3>

                            {chatContext?.phaseName ? (
                                <p className="mt-1 truncate text-[11px] font-semibold text-slate-400">
                                    {chatContext.phaseName}
                                    {chatContext.rowTitle
                                        ? ` · ${chatContext.rowTitle}`
                                        : ""}
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
                        {groupedChats.length === 0 && (
                            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
                                <MessageSquare size={28} className="text-slate-300" />

                                <h4 className="mt-4 text-[15px] font-black text-slate-900">
                                    Belum ada pesan
                                </h4>

                                <p className="mt-2 max-w-[280px] text-[11px] font-semibold leading-relaxed text-slate-400">
                                    Mulai diskusi dengan HO terkait upload bukti, fase, atau kegiatan program.
                                </p>
                            </div>
                        )}

                        {groupedChats.map((group, groupIndex) => (
                            <div key={`${group.label}-${groupIndex}`}>
                                <div className="mb-3 flex justify-center">
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                        {group.label}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {group.items.map((chat, index) => {
                                        const isSelf = Boolean(chat.self);
                                        const isSystem = Boolean(chat.isSystem);

                                        const formatted = chat.createdAt
                                            ? formatChatDateTime(chat.createdAt)
                                            : formatChatDateTime(chat.time);

                                        const displayTime =
                                            chat.time === "Now"
                                                ? "Now"
                                                : chat.time && !chat.createdAt && chat.time !== "System"
                                                    ? chat.time
                                                    : formatted.time;

                                        return (
                                            <div
                                                key={`${chat.text}-${index}`}
                                                className={`flex ${isSystem
                                                    ? "justify-center"
                                                    : isSelf
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
                                                        className={`max-w-[82%] rounded-[1.2rem] px-4 py-3 ${isSelf
                                                            ? "rounded-br-md bg-[#0AC4E0] text-white"
                                                            : "rounded-bl-md bg-slate-100 text-slate-700"
                                                            }`}
                                                    >
                                                        <div className="mb-1 flex items-center justify-between gap-3">
                                                            <p
                                                                className={`truncate text-[8px] font-black uppercase tracking-widest ${isSelf
                                                                    ? "text-white/60"
                                                                    : "text-slate-400"
                                                                    }`}
                                                            >
                                                                {chat.sender || "User"}
                                                            </p>

                                                            {chat.role && (
                                                                <span
                                                                    className={`shrink-0 rounded-full px-2 py-0.5 text-[7px] font-black uppercase tracking-widest ${isSelf
                                                                        ? "bg-white/15 text-white/60"
                                                                        : "bg-white text-slate-400"
                                                                        }`}
                                                                >
                                                                    {chat.role}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <p className="text-[12px] font-semibold leading-relaxed">
                                                            {chat.text}
                                                        </p>

                                                        <p
                                                            className={`mt-2 text-right text-[8px] font-bold ${isSelf
                                                                ? "text-white/55"
                                                                : "text-slate-400"
                                                                }`}
                                                        >
                                                            {displayTime || ""}
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
                    {chatContext?.phaseName && (
                        <div className="mb-3 rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3">
                            <p className="text-[8px] font-black uppercase tracking-widest text-[#0AC4E0]">
                                Konteks Diskusi
                            </p>

                            <p className="mt-1 truncate text-[11px] font-black text-slate-700">
                                {chatContext.phaseName}
                                {chatContext.rowTitle
                                    ? ` · ${chatContext.rowTitle}`
                                    : ""}
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
                                    handleSendChat();
                                }
                            }}
                            placeholder="Tulis pesan untuk HO..."
                            className="!rounded-2xl !border-none !bg-white !px-4 !py-3 !text-[12px] !font-semibold"
                        />

                        <button
                            type="button"
                            onClick={handleSendChat}
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

export default VendorProgramDetailPage;

