/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
    Eye,
    Edit,
    ArrowLeft,
    Plus,
    LayoutGrid,
    UserCheck,
    Calendar,
    Activity,
    Building2,
    Briefcase,
    CheckCircle2,
    Clock3,
    FileClock,
    UploadCloud,
    AlertTriangle,
    Layers3,
    RefreshCw,
    Filter,
    Database,
} from "lucide-react";

import {
    Sidebar,
    PageWrapper,
    Button,
    Search,
    Dropdown,
    Pagination,
    Table,
    YearFilter,
} from "../common";

import {
    filterSchoolsByHoAccess,
    canHoAccessSchool,
} from "../../utils/hoAccess";
import {
    ALL_YEARS,
    buildYearOptions,
    matchYearFilter,
} from "../../utils/yearFilter";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "";

const PROGRAM_STATUSES = [
    "Semua",
    "Termin Luar",
    "Termin Dalam",
    "Menunggu HO",
    "Perlu Revisi",
    "Selesai",
    "Belum Ada Dokumen",
];

const STATUS_STYLE = {
    "Termin Luar": {
        className: "border-cyan-100 bg-cyan-50 text-[#0AC4E0]",
        icon: <UploadCloud size={12} />,
    },
    "Termin Dalam": {
        className: "border-blue-100 bg-blue-50 text-blue-600",
        icon: <Layers3 size={12} />,
    },
    "Menunggu HO": {
        className: "border-amber-100 bg-amber-50 text-amber-600",
        icon: <FileClock size={12} />,
    },
    "Perlu Revisi": {
        className: "border-red-100 bg-red-50 text-red-500",
        icon: <AlertTriangle size={12} />,
    },
    Selesai: {
        className: "border-emerald-100 bg-emerald-50 text-emerald-600",
        icon: <CheckCircle2 size={12} />,
    },
    "Belum Ada Dokumen": {
        className: "border-slate-100 bg-slate-50 text-slate-400",
        icon: <Clock3 size={12} />,
    },
};

const PILAR_OPTIONS = {
    AKADEMIK: [
        { label: "Semua Pilar", value: "SEMUA" },
        { label: "Akademik", value: "AKADEMIK" },
        { label: "Karakter", value: "KARAKTER" },
        { label: "Belum Ditentukan", value: "BELUM_DITENTUKAN" },
    ],
    NON_AKADEMIK: [
        { label: "Semua Pilar", value: "SEMUA" },
        { label: "Seni Budaya", value: "SENI_BUDAYA" },
        { label: "Kecakapan Hidup", value: "KECAKAPAN_HIDUP" },
        { label: "Belum Ditentukan", value: "BELUM_DITENTUKAN" },
    ],
};

const PILAR_META = {
    AKADEMIK: {
        label: "Akademik",
        className: "border-cyan-100 bg-cyan-50 text-cyan-700",
    },
    KARAKTER: {
        label: "Karakter",
        className: "border-violet-100 bg-violet-50 text-violet-700",
    },
    SENI_BUDAYA: {
        label: "Seni Budaya",
        className: "border-fuchsia-100 bg-fuchsia-50 text-fuchsia-700",
    },
    KECAKAPAN_HIDUP: {
        label: "Kecakapan Hidup",
        className: "border-emerald-100 bg-emerald-50 text-emerald-700",
    },
    BELUM_DITENTUKAN: {
        label: "Belum Ditentukan",
        className: "border-slate-200 bg-slate-50 text-slate-500",
    },
};

function normalizeArray(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.result)) return payload.result;
    if (Array.isArray(payload?.rows)) return payload.rows;
    if (Array.isArray(payload?.program)) return payload.program;
    if (Array.isArray(payload?.programs)) return payload.programs;
    if (Array.isArray(payload?.sekolah)) return payload.sekolah;
    if (Array.isArray(payload?.schools)) return payload.schools;
    if (Array.isArray(payload?.vendor)) return payload.vendor;
    if (Array.isArray(payload?.vendors)) return payload.vendors;
    if (Array.isArray(payload?.users)) return payload.users;

    return [];
}

function getArray(...values) {
    return values.find((value) => Array.isArray(value)) || [];
}

async function safeJson(response) {
    try {
        return await response.json();
    } catch {
        return {};
    }
}

function normalizeCategory(value) {
    return String(value || "")
        .trim()
        .toUpperCase()
        .replaceAll("-", "_")
        .replaceAll(" ", "_");
}

function getProgramPilar(program) {
    const value = normalizeCategory(
        program?.pilar_program ||
        program?.pilarProgram ||
        program?.pilar ||
        "",
    );

    return PILAR_META[value] ? value : "BELUM_DITENTUKAN";
}

function getPilarMeta(programOrValue) {
    const key =
        typeof programOrValue === "string"
            ? normalizeCategory(programOrValue)
            : getProgramPilar(programOrValue);

    return PILAR_META[key] || PILAR_META.BELUM_DITENTUKAN;
}

function getPilarOptions(kategori) {
    const category = normalizeCategory(kategori);

    if (category === "NON_AKADEMIK" || category === "NONAKADEMIK") {
        return PILAR_OPTIONS.NON_AKADEMIK;
    }

    return PILAR_OPTIONS.AKADEMIK;
}

function getSchoolLogoUrl(school) {
    const logo =
        school?.logo_sekolah ||
        school?.logo_url ||
        school?.logoUrl ||
        school?.logo ||
        "";

    if (!logo) return "";

    const value = String(logo).trim();

    if (!value) return "";
    if (value.startsWith("http://") || value.startsWith("https://")) return value;
    if (value.startsWith("/uploads/")) return `${API_BASE_URL}${value}`;
    if (value.startsWith("uploads/")) return `${API_BASE_URL}/${value}`;

    return value;
}

function isSameCategory(program, kategori) {
    const programCategory = normalizeCategory(
        program?.kategori ||
        program?.kategori_program ||
        program?.jenis ||
        program?.tipe ||
        program?.category,
    );

    const targetCategory = normalizeCategory(kategori);

    if (!programCategory) return true;

    if (targetCategory === "NON_AKADEMIK") {
        return (
            programCategory === "NON_AKADEMIK" ||
            programCategory === "NONAKADEMIK" ||
            programCategory === "NON_ACADEMIC"
        );
    }

    return programCategory === targetCategory;
}

function getProgramId(program) {
    return program?.id_program ?? program?.id;
}

function getProgramName(program) {
    return program?.nama_program || program?.nama || program?.title || "-";
}

function getProgramCode(program) {
    return program?.kode_program || `PRG-${getProgramId(program) || "NEW"}`;
}

function getProgramTime(program) {
    const value =
        program?.updated_at ||
        program?.created_at ||
        program?.tanggal_mulai ||
        program?.start_date ||
        program?.tanggal;

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function getRequirementFile(requirement) {
    return (
        requirement?.file ||
        requirement?.file_url ||
        requirement?.file_path ||
        requirement?.path ||
        requirement?.file_mou ||
        requirement?.dokumen ||
        requirement?.bukti ||
        null
    );
}

function getRequirementStatus(requirement) {
    const currentStatus = String(requirement?.status || "").toUpperCase();

    if (currentStatus === "APPROVED") return "APPROVED";
    if (currentStatus === "REJECTED") return "REJECTED";
    if (currentStatus === "WAITING_HO") return "WAITING_HO";
    if (currentStatus === "WAITING_UPLOAD") return "WAITING_UPLOAD";

    if (getRequirementFile(requirement)) return "WAITING_HO";

    return "WAITING_UPLOAD";
}

function getProgramRequirements(program) {
    const fases = getArray(program?.fases);

    return fases.flatMap((fase) => {
        const terminList = getArray(fase.termin, fase.termins, fase.t_termin);
        const kegiatanList = getArray(
            fase.kegiatans,
            fase.kegiatan,
            fase.t_kegiatans,
        );

        const terminRequirements = terminList.flatMap((termin) =>
            getArray(
                termin.persyaratan,
                termin.persyaratan_termin,
                termin.requirements,
                termin.t_persyaratan_termin,
            ).map((item) => ({
                ...item,
                parentType: "termin",
            })),
        );

        const kegiatanRequirements = kegiatanList.flatMap((kegiatan) =>
            getArray(
                kegiatan.persyaratan,
                kegiatan.persyaratan_kegiatan,
                kegiatan.requirements,
                kegiatan.t_persyaratan_kegiatan,
            ).map((item) => ({
                ...item,
                parentType: "kegiatan",
            })),
        );

        return [...terminRequirements, ...kegiatanRequirements];
    });
}

function getProgramProgress(program) {
    const requirements = getProgramRequirements(program);
    const total = requirements.length;

    const approved = requirements.filter(
        (item) => getRequirementStatus(item) === "APPROVED",
    ).length;

    const waitingHo = requirements.filter(
        (item) => getRequirementStatus(item) === "WAITING_HO",
    ).length;

    const waitingUpload = requirements.filter(
        (item) => getRequirementStatus(item) === "WAITING_UPLOAD",
    ).length;

    const rejected = requirements.filter(
        (item) => getRequirementStatus(item) === "REJECTED",
    ).length;

    return {
        total,
        approved,
        waitingHo,
        waitingUpload,
        rejected,
        percentage: total ? Math.round((approved / total) * 100) : 0,
    };
}

function getPhaseRows(fase) {
    const terminList = getArray(fase.termin, fase.termins, fase.t_termin);
    const kegiatanList = getArray(
        fase.kegiatans,
        fase.kegiatan,
        fase.t_kegiatans,
    );

    const openingRows = terminList.map((termin) => ({
        type: "termin",
        requirements: getArray(
            termin.persyaratan,
            termin.persyaratan_termin,
            termin.requirements,
            termin.t_persyaratan_termin,
        ),
    }));

    const innerRows = kegiatanList.map((kegiatan) => ({
        type: "kegiatan",
        requirements: getArray(
            kegiatan.persyaratan,
            kegiatan.persyaratan_kegiatan,
            kegiatan.requirements,
            kegiatan.t_persyaratan_kegiatan,
        ),
    }));

    return {
        openingRows,
        innerRows,
    };
}

function isRowApproved(row) {
    if (!row?.requirements?.length) return false;

    return row.requirements.every(
        (item) => getRequirementStatus(item) === "APPROVED",
    );
}

function isOpeningCompleted(fase) {
    const { openingRows } = getPhaseRows(fase);

    if (!openingRows.length) return false;

    return openingRows.every((row) => isRowApproved(row));
}

function isPhaseCompleted(fase) {
    const { openingRows, innerRows } = getPhaseRows(fase);

    if (!openingRows.length || !innerRows.length) return false;

    return (
        openingRows.every((row) => isRowApproved(row)) &&
        innerRows.every((row) => isRowApproved(row))
    );
}

function getActivePhaseInfo(program) {
    const fases = getArray(program?.fases);

    if (!fases.length) {
        return {
            label: "Belum ada fase",
            index: 0,
            totalPhase: 0,
            openingDone: false,
            completed: false,
        };
    }

    const activeIndex = fases.findIndex((fase, index) => {
        const previousCompleted =
            index === 0 ||
            fases.slice(0, index).every((item) => isPhaseCompleted(item));

        if (!previousCompleted) return false;

        return !isPhaseCompleted(fase);
    });

    const index = activeIndex === -1 ? fases.length - 1 : activeIndex;
    const fase = fases[index];

    return {
        label: fase?.nama_fase || `Fase ${index + 1}`,
        index: index + 1,
        totalPhase: fases.length,
        openingDone: isOpeningCompleted(fase),
        completed: isPhaseCompleted(fase),
    };
}

function getProgramProcessStatus(program) {
    const progress = getProgramProgress(program);
    const activePhase = getActivePhaseInfo(program);

    if (!progress.total) {
        return {
            label: "Belum Ada Dokumen",
            filterValue: "Belum Ada Dokumen",
            className: STATUS_STYLE["Belum Ada Dokumen"].className,
            icon: STATUS_STYLE["Belum Ada Dokumen"].icon,
        };
    }

    if (progress.rejected > 0) {
        return {
            label: "Perlu Revisi",
            filterValue: "Perlu Revisi",
            className: STATUS_STYLE["Perlu Revisi"].className,
            icon: STATUS_STYLE["Perlu Revisi"].icon,
        };
    }

    if (progress.waitingHo > 0) {
        return {
            label: "Menunggu HO",
            filterValue: "Menunggu HO",
            className: STATUS_STYLE["Menunggu HO"].className,
            icon: STATUS_STYLE["Menunggu HO"].icon,
        };
    }

    if (progress.waitingUpload > 0) {
        const label = activePhase.openingDone ? "Termin Dalam" : "Termin Luar";

        return {
            label,
            filterValue: label,
            className: STATUS_STYLE[label].className,
            icon: STATUS_STYLE[label].icon,
        };
    }

    if (progress.total > 0 && progress.approved === progress.total) {
        return {
            label: "Selesai",
            filterValue: "Selesai",
            className: STATUS_STYLE.Selesai.className,
            icon: STATUS_STYLE.Selesai.icon,
        };
    }

    const fallbackLabel = activePhase.openingDone ? "Termin Dalam" : "Termin Luar";

    return {
        label: fallbackLabel,
        filterValue: fallbackLabel,
        className: STATUS_STYLE[fallbackLabel].className,
        icon: STATUS_STYLE[fallbackLabel].icon,
    };
}

function pushFlexibleIds(ids, value) {
    if (value === null || value === undefined || value === "") return;

    if (Array.isArray(value)) {
        value.forEach((item) => pushFlexibleIds(ids, item));
        return;
    }

    if (typeof value === "string") {
        const trimmed = value.trim();

        if (
            (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
            (trimmed.startsWith("{") && trimmed.endsWith("}"))
        ) {
            try {
                pushFlexibleIds(ids, JSON.parse(trimmed));
                return;
            } catch {
                ids.push(trimmed);
                return;
            }
        }

        ids.push(trimmed);
        return;
    }

    if (typeof value === "object") {
        if (value.id_sekolah) ids.push(value.id_sekolah);
        if (value.id_user) ids.push(value.id_user);
        if (value.id_vendor) ids.push(value.id_vendor);
        if (value.id) ids.push(value.id);
        return;
    }

    ids.push(value);
}

function collectIdsFromProgram(program, keys = [], relationKeys = []) {
    const ids = [];

    keys.forEach((key) => {
        pushFlexibleIds(ids, program?.[key]);
    });

    relationKeys.forEach((key) => {
        pushFlexibleIds(ids, program?.[key]);
    });

    return [...new Set(ids.map(String).filter(Boolean))];
}

function getMasterName(master, ids, idKeys = [], nameKeys = []) {
    const names = ids
        .map((id) => {
            const found = master.find((item) =>
                idKeys.some((key) => String(item?.[key]) === String(id)),
            );

            if (!found) return null;

            for (const key of nameKeys) {
                if (found?.[key]) return found[key];
            }

            return null;
        })
        .filter(Boolean);

    return [...new Set(names)];
}

function getCurrentHoIdFromToken() {
    const token = localStorage.getItem("token");

    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));

        return payload?.sub || payload?.id_user || payload?.id || null;
    } catch {
        return null;
    }
}

function canHoAccessProgramRow(program, currentHo, allSchools = []) {
    if (!currentHo) return true;

    const schoolIds = collectIdsFromProgram(
        program,
        ["id_sekolah", "sekolah_id", "sekolah_ids", "target_sekolah_ids"],
        ["sekolah", "sekolahs", "schools", "target_sekolah"],
    );

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

    return relatedSchools.some((school) => canHoAccessSchool(currentHo, school));
}

function programBelongsToSelectedSchool(program, selectedSchoolId) {
    if (!selectedSchoolId) return true;

    const schoolIds = collectIdsFromProgram(
        program,
        ["id_sekolah", "sekolah_id", "sekolah_ids", "target_sekolah_ids"],
        ["sekolah", "sekolahs", "schools", "target_sekolah"],
    );

    return schoolIds.some((schoolId) => String(schoolId) === String(selectedSchoolId));
}

function ProgressBar({ value }) {
    const safeValue = Math.min(100, Math.max(0, value));

    return (
        <div className="arcade-progress h-3 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
            <div
                className="h-full rounded-md bg-[#0AC4E0] transition-all duration-500"
                style={{ width: `${safeValue}%` }}
            />
        </div>
    );
}

function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border px-3 py-1.5 text-[9px] font-black uppercase tracking-widest shadow-sm ${status.className}`}
        >
            {status.icon}
            {status.label}
        </span>
    );
}

function MiniMeta({ label, value }) {
    return (
        <div className="min-w-0 rounded-xl border border-slate-100 bg-white px-3 py-2.5 shadow-[0_8px_20px_rgba(15,23,42,0.035)]">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                {label}
            </p>
            <p className="line-clamp-1 mt-1 text-[11px] font-black leading-snug text-slate-700" title={value || "-"}>
                {value || "-"}
            </p>
        </div>
    );
}

function SchoolHeaderLogo({ src, name }) {
    const [failed, setFailed] = useState(false);
    const showImage = Boolean(src) && !failed;

    return (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-cyan-100 bg-[#E9FBFF] text-[#0AC4E0] shadow-[0_14px_28px_rgba(10,196,224,0.16)]">
            {showImage ? (
                <img
                    src={src}
                    alt={name || "Logo sekolah"}
                    className="h-full w-full object-contain p-2"
                    onError={() => setFailed(true)}
                />
            ) : (
                <Building2 size={28} />
            )}
        </div>
    );
}

function ListProgramPage({
    kategori = "AKADEMIK",
    titleHighlight = "Akademik",
    backPath = "/ho/program/akademik",
    createPath = "/ho/program/akademik/create",
    detailPathPrefix = "/ho/program/akademik/detail",
    editPathPrefix = "/ho/program/akademik/edit",
    programColumnTitle = "PROGRAM AKADEMIK",
    emptyText = "Data program tidak tersedia",
}) {
    const navigate = useNavigate();
    const params = useParams();

    const selectedSchoolId =
        params.schoolId ||
        params.id_sekolah ||
        params.idSekolah ||
        params.id ||
        null;

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [filterStatus, setFilterStatus] = useState("Semua");
    const [filterPilar, setFilterPilar] = useState("SEMUA");
    const [filterYear, setFilterYear] = useState(ALL_YEARS);

    const [programs, setPrograms] = useState([]);
    const [masterUsers, setMasterUsers] = useState([]);
    const [masterSekolah, setMasterSekolah] = useState([]);
    const [masterVendor, setMasterVendor] = useState([]);

    const [loading, setLoading] = useState(true);

    const limit = 5;

    const filterOptions = useMemo(
        () =>
            PROGRAM_STATUSES.map((status) => ({
                label: status === "Semua" ? "Semua Status" : status,
                value: status,
            })),
        [],
    );

    const pilarOptions = useMemo(
        () => getPilarOptions(kategori),
        [kategori],
    );

    const fetchData = async () => {
        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const headers = { Authorization: `Bearer ${token}` };
            const currentHoId = getCurrentHoIdFromToken();

            const [resProgram, resUsers, resSekolah, resVendor, resCurrentHo] =
                await Promise.all([
                    fetch(`${API_BASE_URL}/program?kategori=${kategori}`, { headers }),
                    fetch(`${API_BASE_URL}/users/ho`, { headers }),
                    fetch(`${API_BASE_URL}/sekolah`, { headers }),
                    fetch(`${API_BASE_URL}/vendor?kategori=${kategori}`, { headers }),
                    currentHoId
                        ? fetch(`${API_BASE_URL}/users/${currentHoId}`, { headers })
                        : Promise.resolve(null),
                ]);

            const programPayload = await safeJson(resProgram);
            const usersPayload = await safeJson(resUsers);
            const sekolahPayload = await safeJson(resSekolah);
            const vendorPayloadRaw = await safeJson(resVendor);
            let vendorList = normalizeArray(vendorPayloadRaw);

            // Filter vendor berdasarkan kategori yang sama
            const targetCategory = normalizeCategory(kategori);
            vendorList = vendorList.filter((vendor) => {
                const vendorCategory = normalizeCategory(
                    vendor?.kategori || vendor?.kategori_vendor || vendor?.jenis || ""
                );
                // Jika vendor tidak memiliki kategori, tetap tampilkan (fallback)
                if (!vendorCategory) return true;
                return vendorCategory === targetCategory;
            });

            const currentHoPayload = resCurrentHo
                ? await safeJson(resCurrentHo)
                : null;

            if (!resProgram.ok) {
                throw new Error(programPayload?.message || "Gagal memuat data program");
            }

            if (!resUsers.ok || !resSekolah.ok || !resVendor.ok) {
                throw new Error(
                    usersPayload?.message ||
                    sekolahPayload?.message ||
                    vendorPayloadRaw?.message ||
                    "Gagal memuat data master",
                );
            }

            const currentHo = currentHoPayload?.data || currentHoPayload || null;

            const allSekolahList = normalizeArray(sekolahPayload);

            const accessibleSekolahList = filterSchoolsByHoAccess(
                allSekolahList,
                currentHo,
            );

            const dataProgram = normalizeArray(programPayload)
                .filter((program) => getProgramId(program))
                .filter((program) => isSameCategory(program, kategori));

            const detailedPrograms = await Promise.all(
                dataProgram.map(async (program) => {
                    try {
                        const programId = getProgramId(program);

                        const response = await fetch(
                            `${API_BASE_URL}/program/${programId}`,
                            { headers },
                        );

                        const result = await safeJson(response);

                        if (!response.ok) return program;

                        return result?.data || result || program;
                    } catch {
                        return program;
                    }
                }),
            );

            const accessiblePrograms = detailedPrograms
                .filter((program) => getProgramId(program))
                .filter((program) => isSameCategory(program, kategori))
                .filter((program) =>
                    canHoAccessProgramRow(program, currentHo, allSekolahList),
                )
                .filter((program) =>
                    programBelongsToSelectedSchool(program, selectedSchoolId),
                )
                .sort((a, b) => getProgramTime(b) - getProgramTime(a));

            setPrograms(accessiblePrograms);
            setMasterUsers(normalizeArray(usersPayload));
            setMasterSekolah(accessibleSekolahList);
            setMasterVendor(vendorList); // Gunakan vendor yang sudah difilter
        } catch (error) {
            console.error("Gagal memuat program:", error);
            toast.error(error.message || "Gagal memuat data program");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [kategori, selectedSchoolId]);

    useEffect(() => {
        setFilterPilar("SEMUA");
    }, [kategori]);

    useEffect(() => {
        setPage(1);
    }, [search, filterStatus, filterPilar, selectedSchoolId]);

    const getPicName = (row) => {
        const ids = collectIdsFromProgram(
            row,
            ["dibuat_oleh", "id_ho", "created_by_id"],
            ["ho", "created_by", "user"],
        );

        const names = [
            row?.ho?.nama,
            row?.created_by?.nama,
            row?.user?.nama,
            ...getMasterName(
                masterUsers,
                ids,
                ["id_user", "id"],
                ["nama", "name", "email"],
            ),
        ].filter(Boolean);

        return [...new Set(names)].join(", ") || "-";
    };

    const getSchoolName = (row) => {
        const ids = collectIdsFromProgram(
            row,
            ["id_sekolah", "sekolah_id", "sekolah_ids", "target_sekolah_ids"],
            ["sekolah", "sekolahs", "schools", "target_sekolah"],
        );

        const directNames = [];

        if (row?.sekolah?.nama_sekolah) directNames.push(row.sekolah.nama_sekolah);
        if (row?.sekolah?.nama) directNames.push(row.sekolah.nama);
        if (row?.nama_sekolah) directNames.push(row.nama_sekolah);

        if (Array.isArray(row?.sekolahs)) {
            row.sekolahs.forEach((school) => {
                if (school?.nama_sekolah) directNames.push(school.nama_sekolah);
                if (school?.nama) directNames.push(school.nama);
            });
        }

        const masterNames = getMasterName(
            masterSekolah,
            ids,
            ["id_sekolah", "id"],
            ["nama_sekolah", "nama"],
        );

        const names = [...new Set([...directNames, ...masterNames].filter(Boolean))];

        return names.join(", ") || "-";
    };

    const getVendorName = (row) => {
        const ids = collectIdsFromProgram(
            row,
            ["id_vendor", "vendor_ids"],
            ["vendor", "vendors"],
        );

        const directNames = [];

        if (row?.vendor?.nama_vendor) directNames.push(row.vendor.nama_vendor);
        if (row?.vendor?.nama) directNames.push(row.vendor.nama);
        if (row?.nama_vendor) directNames.push(row.nama_vendor);

        if (Array.isArray(row?.vendors)) {
            row.vendors.forEach((vendor) => {
                if (vendor?.nama_vendor) directNames.push(vendor.nama_vendor);
                if (vendor?.nama) directNames.push(vendor.nama);
            });
        }

        const masterNames = getMasterName(
            masterVendor,
            ids,
            ["id_vendor", "id"],
            ["nama_vendor", "nama", "name"],
        );

        const names = [...new Set([...directNames, ...masterNames].filter(Boolean))];

        return names.join(", ") || "-";
    };

    const filteredPrograms = useMemo(() => {
        return programs
            .filter((program) => matchYearFilter(program, filterYear))
            .filter((program) => {
                const processStatus = getProgramProcessStatus(program);

                return filterStatus === "Semua"
                    ? true
                    : processStatus.filterValue === filterStatus;
            })
            .filter((program) => {
                if (filterPilar === "SEMUA") return true;

                return getProgramPilar(program) === filterPilar;
            })
            .filter((program) =>
                [
                    getProgramName(program),
                    getProgramCode(program),
                    program?.tahun,
                    program?.jenis_program,
                    getPilarMeta(program).label,
                    getSchoolName(program),
                    getVendorName(program),
                    getPicName(program),
                    getProgramProcessStatus(program).label,
                    getActivePhaseInfo(program).label,
                ]
                    .join(" ")
                    .toLowerCase()
                    .includes(search.toLowerCase()),
            );
    }, [
        programs,
        filterStatus,
        filterPilar,
        filterYear,
        search,
        masterSekolah,
        masterVendor,
        masterUsers,
    ]);

    const totalItems = filteredPrograms.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const start = (page - 1) * limit;
    const currentData = filteredPrograms.slice(start, start + limit);

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    const summary = useMemo(() => {
        const completed = programs.filter(
            (program) => getProgramProcessStatus(program).filterValue === "Selesai",
        ).length;

        const waitingHo = programs.filter(
            (program) =>
                getProgramProcessStatus(program).filterValue === "Menunggu HO",
        ).length;

        const needAction = programs.filter((program) =>
            ["Termin Luar", "Termin Dalam", "Perlu Revisi"].includes(
                getProgramProcessStatus(program).filterValue,
            ),
        ).length;

        const noDocument = programs.filter(
            (program) =>
                getProgramProcessStatus(program).filterValue === "Belum Ada Dokumen",
        ).length;

        return {
            total: programs.length,
            shown: filteredPrograms.length,
            waitingHo,
            needAction,
            completed,
            noDocument,
        };
    }, [programs, filteredPrograms]);

    const yearOptions = useMemo(
        () => buildYearOptions(programs),
        [programs],
    );

    const selectedSchool = useMemo(() => {
        if (!selectedSchoolId) return null;

        return masterSekolah.find((school) => {
            const schoolId = school?.id_sekolah ?? school?.id;

            return String(schoolId) === String(selectedSchoolId);
        }) || null;
    }, [masterSekolah, selectedSchoolId]);

    const headerSchoolName =
        selectedSchool?.nama_sekolah ||
        selectedSchool?.nama ||
        (selectedSchoolId ? `Sekolah ID ${selectedSchoolId}` : `Daftar Program ${titleHighlight}`);

    const headerSchoolLogo = getSchoolLogoUrl(selectedSchool);

    const headerSchoolMeta = [
        selectedSchool?.jenjang,
        selectedSchool?.wilayah?.nama_wilayah ||
        selectedSchool?.wilayah_name ||
        selectedSchool?.nama_wilayah,
        selectedSchool?.npsn ? `NPSN ${selectedSchool.npsn}` : null,
    ].filter(Boolean);

    const tableColumns = [
        {
            header: "NO",
            align: "text-center w-[64px]",
            width: "64px",
            render: (_, index) => (
                <span className="text-[13px] font-black text-slate-300">
                    {String(start + index + 1).padStart(2, "0")}
                </span>
            ),
        },
        {
            header: programColumnTitle,
            align: "text-left",
            render: (row) => {
                const progress = getProgramProgress(row);
                const activePhase = getActivePhaseInfo(row);
                const pilar = getPilarMeta(row);

                return (
                    <div className="min-w-0 py-1 text-left">
                        <div className="flex items-start gap-4">
                            <div className="arcade-icon mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E9FBFF] text-[#0AC4E0] shadow-[0_12px_24px_rgba(10,196,224,0.16)]">
                                <Layers3 size={18} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-[260px] flex-1">
                                        <p className="line-clamp-1 text-[15px] font-black leading-snug text-slate-950">
                                            {getProgramName(row)}
                                        </p>

                                        <div className="mt-2 flex flex-wrap items-center gap-2">
                                            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                                                {getProgramCode(row)}
                                            </span>

                                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-[11px] font-black text-slate-600">
                                                <Calendar size={12} className="text-[#0AC4E0]" />
                                                {row.tahun || "-"}
                                            </span>

                                            {row.jenis_program && (
                                                <span className={`inline-flex items-center rounded-lg border px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest ${row.jenis_program === "REGULER"
                                                    ? "border-violet-100 bg-violet-50 text-violet-600"
                                                    : "border-[#0AC4E0]/20 bg-[#0AC4E0]/5 text-[#0AC4E0]"
                                                    }`}>
                                                    {row.jenis_program === "REGULER" ? "Reguler" : "Project"}
                                                </span>
                                            )}

                                            <span
                                                className={`inline-flex items-center rounded-lg border px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest ${pilar.className}`}
                                            >
                                                {pilar.label}
                                            </span>
                                        </div>
                                    </div>

                                    <StatusBadge status={getProgramProcessStatus(row)} />
                                </div>

                                <div className="mt-3 grid grid-cols-1 gap-2.5 lg:grid-cols-[1.15fr_0.85fr]">
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                        <MiniMeta label="Sekolah" value={getSchoolName(row)} />
                                        <MiniMeta label="PIC HO" value={getPicName(row)} />
                                        <MiniMeta label="Vendor" value={getVendorName(row)} />
                                    </div>

                                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                                        <div className="mb-2 flex items-center justify-between gap-3">
                                            <span className="line-clamp-1 text-[12px] font-black text-slate-800">
                                                {activePhase.label}
                                            </span>
                                            <span className="shrink-0 rounded-lg bg-white px-2 py-1 text-[10px] font-black uppercase tracking-widest text-[#078EA3] ring-1 ring-cyan-100">
                                                {progress.percentage}%
                                            </span>
                                        </div>

                                        <ProgressBar value={progress.percentage} />

                                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            <span>{activePhase.totalPhase ? `${activePhase.index}/${activePhase.totalPhase} fase` : "0 fase"}</span>
                                            <span>{progress.approved}/{progress.total || 0} bukti ACC</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            header: "AKSI",
            align: "text-right w-[108px]",
            width: "108px",
            render: (row) => {
                const programId = getProgramId(row);

                return (
                    <div className="flex justify-end gap-2 bg-white">
                        <button
                            type="button"
                            onClick={() => navigate(`${detailPathPrefix}/${programId}`)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50 text-[#0AC4E0] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0AC4E0] hover:text-white"
                            title="Lihat detail program"
                        >
                            <Eye size={18} />
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate(`${editPathPrefix}/${programId}`)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-500 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-500 hover:text-white"
                            title="Edit program"
                        >
                            <Edit size={18} />
                        </button>
                    </div>
                );
            },
        },
    ];

    if (loading) {
        return (
            <PageWrapper className="flex h-screen items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-11 w-11 animate-spin rounded-full border-4 border-[#0AC4E0] border-t-transparent" />

                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#0AC4E0]">
                        Memuat daftar program
                    </p>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper className="flex h-screen overflow-hidden bg-[#F4F7FB] !p-0 font-sans text-slate-800">
            <Sidebar />

            <main className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden">
                <div className="arcade-grid pointer-events-none absolute inset-0 opacity-70" />

                <section className="relative z-10 shrink-0 px-6 pt-5">
                    <div className="arcade-panel overflow-hidden rounded-2xl border border-white bg-white/95 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
                        <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div className="flex min-w-0 items-start gap-3">
                                <button
                                    type="button"
                                    onClick={() => navigate(backPath)}
                                    className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0AC4E0] hover:text-[#0AC4E0]"
                                >
                                    <ArrowLeft size={17} />
                                </button>

                                <div className="flex min-w-0 items-center gap-4">
                                    <SchoolHeaderLogo
                                        src={headerSchoolLogo}
                                        name={headerSchoolName}
                                    />

                                    <div className="min-w-0">
                                        <h1 className="line-clamp-2 text-[32px] font-black leading-tight text-slate-950">
                                            {headerSchoolName}
                                        </h1>

                                        <p className="mt-2 max-w-4xl text-[13px] font-semibold leading-6 text-slate-500">
                                            Daftar Program {titleHighlight}
                                            {headerSchoolMeta.length > 0 ? ` - ${headerSchoolMeta.join(" - ")}` : ""}.
                                            {" "}Monitoring progres berdasarkan Termin Luar, Termin Dalam, validasi HO, revisi vendor, dan penyelesaian fase.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-3">
                                <button
                                    type="button"
                                    onClick={fetchData}
                                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0AC4E0] hover:text-[#0AC4E0]"
                                    title="Refresh Data"
                                >
                                    <RefreshCw size={15} />
                                </button>

                                <Button
                                    text="Tambah Program"
                                    icon={<Plus size={15} />}
                                    onClick={() => navigate(createPath)}
                                    className="!rounded-xl !bg-[#2563EB] !px-6 !py-3 !text-[10px] !font-black !uppercase !tracking-widest !text-white shadow-[0_12px_24px_rgba(37,99,235,0.18)] hover:!bg-[#0AC4E0]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                            <SummaryItem
                                label="Total Program"
                                value={summary.total}
                                helper="Semua data"
                                icon={<Database size={15} />}
                            />

                            <SummaryItem
                                label="Perlu Aksi"
                                value={summary.needAction}
                                helper="Upload / revisi"
                                variant="cyan"
                                icon={<UploadCloud size={15} />}
                            />

                            <SummaryItem
                                label="Menunggu HO"
                                value={summary.waitingHo}
                                helper="Validasi dokumen"
                                variant="amber"
                                icon={<FileClock size={15} />}
                            />

                            <SummaryItem
                                label="Selesai"
                                value={summary.completed}
                                helper="Approved semua"
                                variant="green"
                                icon={<CheckCircle2 size={15} />}
                            />

                            <SummaryItem
                                label="Tanpa Dokumen"
                                value={summary.noDocument}
                                helper="Belum ada bukti"
                                variant="slate"
                                icon={<Clock3 size={15} />}
                            />
                        </div>
                    </div>
                </section>

                <section className="relative z-10 shrink-0 px-6 py-3">
                    <div className="arcade-toolbar flex flex-col gap-3 rounded-2xl border border-white bg-white/90 p-3 shadow-sm xl:flex-row xl:items-center">
                        <div className="flex-1">
                            <Search
                                placeholder="Cari program, pilar, sekolah, vendor, status, fase, atau tahun..."
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                        </div>

                        <div className="relative z-20 overflow-visible">
                            <div className="flex h-[46px] min-w-[220px] items-center rounded-xl border border-slate-100 bg-slate-50 px-3">
                                <Filter size={15} className="mr-2.5 shrink-0 text-slate-400" />
                                <Dropdown
                                    items={pilarOptions}
                                    value={filterPilar}
                                    onChange={(value) => setFilterPilar(value)}
                                    className="!w-full !border-none !bg-transparent !py-0 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-500"
                                />
                            </div>
                        </div>

                        <div className="relative z-10 overflow-visible">
                            <div className="flex h-[46px] min-w-[220px] items-center rounded-xl border border-slate-100 bg-slate-50 px-3">
                                <Filter size={15} className="mr-2.5 shrink-0 text-slate-400" />
                                <Dropdown
                                    items={filterOptions}
                                    value={filterStatus}
                                    onChange={(value) => setFilterStatus(value)}
                                    className="!w-full !border-none !bg-transparent !py-0 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-500"
                                />
                            </div>
                        </div>

                        <div className="relative z-10 overflow-visible">
                            <YearFilter
                                value={filterYear}
                                onChange={(value) => setFilterYear(value)}
                                options={yearOptions}
                            />
                        </div>

                        <div className="flex h-[46px] items-center gap-2.5 rounded-xl bg-[#2563EB] px-5 text-white shadow-[0_12px_24px_rgba(37,99,235,0.18)]">
                            <LayoutGrid size={15} className="text-cyan-100" />

                            <span className="text-[10px] font-black uppercase tracking-widest">
                                {totalItems} Data
                            </span>
                        </div>
                    </div>
                </section>

                <section className="simple-scroll relative z-10 flex-1 overflow-y-auto px-6 pb-4">
                    <div className="program-list-table overflow-hidden rounded-2xl border border-white bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
                        <div className="overflow-x-auto">
                            <Table
                                columns={tableColumns}
                                data={currentData}
                            />
                        </div>

                        {totalItems === 0 && (
                            <div className="flex flex-col items-center justify-center py-32 opacity-50">
                                <LayoutGrid size={54} className="text-slate-300" />

                                <p className="mt-5 text-xs font-black uppercase tracking-widest text-slate-400">
                                    {emptyText}
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                <section className="relative z-10 flex shrink-0 items-center justify-between border-t border-white/80 bg-white/80 px-6 py-3 backdrop-blur-xl">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <Activity size={14} className="text-[#0AC4E0]" />
                        Menampilkan {currentData.length} dari {totalItems} program
                    </div>

                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        totalItems={totalItems}
                        itemsPerPage={limit}
                        className="!gap-1"
                    />
                </section>
            </main>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
            .simple-scroll::-webkit-scrollbar {
              width: 6px;
            }

            .simple-scroll::-webkit-scrollbar-track {
              background: transparent;
            }

            .simple-scroll::-webkit-scrollbar-thumb {
              background: #0AC4E0;
              border-radius: 999px;
            }

            .arcade-grid {
              background-image:
                linear-gradient(rgba(15, 23, 42, 0.045) 1px, transparent 1px),
                linear-gradient(90deg, rgba(15, 23, 42, 0.045) 1px, transparent 1px),
                linear-gradient(135deg, rgba(10, 196, 224, 0.12), transparent 34%, rgba(16, 185, 129, 0.10) 66%, rgba(251, 191, 36, 0.12));
              background-size: 26px 26px, 26px 26px, 100% 100%;
            }

            .arcade-panel,
            .arcade-toolbar {
              box-shadow:
                0 16px 0 rgba(10, 196, 224, 0.035),
                0 24px 70px rgba(15, 23, 42, 0.09);
            }

            .arcade-progress {
              background-image: repeating-linear-gradient(
                90deg,
                rgba(15, 23, 42, 0.08) 0,
                rgba(15, 23, 42, 0.08) 1px,
                transparent 1px,
                transparent 18px
              );
            }

            .arcade-progress > div {
              background-image: linear-gradient(90deg, #22D3EE, #10B981, #FBBF24);
              box-shadow: 0 0 18px rgba(34, 211, 238, 0.42);
            }

            .arcade-icon {
              box-shadow: inset 0 -3px 0 rgba(255,255,255,0.08), 0 10px 22px rgba(15,23,42,0.18);
            }

            .program-list-table table {
              width: 100%;
              min-width: 100% !important;
              table-layout: fixed;
              border-collapse: separate;
              border-spacing: 0;
            }

            .program-list-table > div {
              border-radius: 1rem !important;
              box-shadow: 0 12px 36px rgba(15, 23, 42, 0.06) !important;
            }

            @media (min-width: 1024px) {
              .program-list-table .overflow-x-auto {
                overflow-x: hidden !important;
              }
            }

            .program-list-table thead th {
              background: #0AC4E0 !important;
              color: white !important;
              font-size: 10px !important;
              font-weight: 900 !important;
              text-transform: uppercase !important;
              letter-spacing: 0.1em !important;
              padding: 0.8rem 1rem !important;
              border-bottom: 3px solid #67E8F9 !important;
              white-space: nowrap !important;
            }

            .program-list-table tbody td {
              padding: 0.95rem 1rem !important;
              border-bottom: 1px solid #F1F5F9 !important;
              vertical-align: middle !important;
              white-space: normal !important;
            }

            .program-list-table tbody tr:last-child td {
              border-bottom: none !important;
            }

            .program-list-table tbody tr:hover td {
              background: rgba(34, 211, 238, 0.075) !important;
            }

            .program-list-table thead th:last-child,
            .program-list-table tbody td:last-child {
              position: sticky;
              right: 0;
              z-index: 15;
              background: white !important;
              box-shadow: -10px 0 20px rgba(15, 23, 42, 0.035);
            }

            .program-list-table thead th:last-child {
              z-index: 25;
              background: #0AC4E0 !important;
            }

            .program-list-table tbody tr:hover td:last-child {
              background: white !important;
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
        </PageWrapper>
    );
}

function InfoCell({ icon, value, maxWidth = "max-w-[160px]" }) {
    return (
        <div className="flex items-center gap-3.5 text-left">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50 text-[#0AC4E0]">
                {icon}
            </div>

            <span
                className={`${maxWidth} line-clamp-2 text-[14px] font-bold leading-snug text-slate-600`}
                title={value || "-"}
            >
                {value || "-"}
            </span>
        </div>
    );
}

function SummaryItem({
    label,
    value,
    helper,
    variant = "default",
    icon = <Activity size={15} />,
}) {
    const style =
        variant === "green"
            ? "bg-emerald-500 text-white"
            : variant === "amber"
                ? "bg-amber-400 text-slate-800"
                : variant === "cyan"
                    ? "bg-[#0AC4E0] text-white"
                    : variant === "slate"
                        ? "bg-slate-200 text-slate-700"
                        : "bg-[#2563EB] text-white";

    const accent =
        variant === "green"
            ? "bg-emerald-400"
            : variant === "amber"
                ? "bg-amber-400"
                : variant === "cyan"
                    ? "bg-[#0AC4E0]"
                    : variant === "slate"
                        ? "bg-slate-300"
                        : "bg-violet-400";

    return (
        <div className="group relative overflow-hidden rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-100 hover:shadow-[0_14px_26px_rgba(15,23,42,0.10)]">
            <div className={`absolute left-0 top-0 h-full w-1.5 ${accent}`} />
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                {label}
            </p>

            <div className="mt-2 flex items-end justify-between gap-3">
                <div>
                    <p className="text-[25px] font-black leading-none text-slate-900">
                        {value}
                    </p>

                    <p className="mt-1.5 text-[11px] font-bold text-slate-400">
                        {helper}
                    </p>
                </div>

                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-sm transition group-hover:scale-105 ${style}`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default ListProgramPage;
