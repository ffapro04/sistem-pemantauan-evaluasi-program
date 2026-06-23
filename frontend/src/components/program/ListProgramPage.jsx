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
} from "../common";

import {
    filterSchoolsByHoAccess,
    canHoAccessSchool,
} from "../../utils/hoAccess";

const API_BASE_URL = "";

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
    return (
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
                className="h-full rounded-full bg-[#0AC4E0] transition-all"
                style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
            />
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

    const [programs, setPrograms] = useState([]);
    const [masterUsers, setMasterUsers] = useState([]);
    const [masterSekolah, setMasterSekolah] = useState([]);
    const [masterVendor, setMasterVendor] = useState([]);

    const [loading, setLoading] = useState(true);

    const limit = 2;

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

    const tableColumns = [
        {
            header: "NO",
            align: "text-center w-[58px]",
            render: (_, index) => (
                <span className="text-[12px] font-bold text-slate-300">
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
                    <div className="min-w-[260px] py-1 text-left">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-[#0AC4E0]">
                                <Layers3 size={17} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="line-clamp-1 text-[13.5px] font-black leading-snug tracking-tight text-slate-800">
                                    {getProgramName(row)}
                                </p>

                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                        {getProgramCode(row)}
                                    </span>

                                    <span className="inline-flex items-center gap-1 rounded-lg border border-slate-100 bg-slate-50 px-2 py-1 text-[9px] font-black text-slate-500">
                                        <Calendar size={10} className="text-[#0AC4E0]" />
                                        {row.tahun || "-"}
                                    </span>

                                    {row.jenis_program && (
                                        <span className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[8px] font-black uppercase tracking-widest ${row.jenis_program === "REGULER"
                                            ? "border-violet-100 bg-violet-50 text-violet-600"
                                            : "border-[#0AC4E0]/20 bg-[#0AC4E0]/5 text-[#0AC4E0]"
                                            }`}>
                                            {row.jenis_program === "REGULER" ? "ðŸ”„ Reguler" : "ðŸ“‹ Project"}
                                        </span>
                                    )}

                                    <span
                                        className={`inline-flex items-center rounded-lg border px-2 py-1 text-[8px] font-black uppercase tracking-widest ${pilar.className}`}
                                    >
                                        Pilar {pilar.label}
                                    </span>
                                </div>

                                <div className="mt-3 flex items-center gap-3">
                                    <div className="min-w-[46px] text-[10px] font-black text-[#0AC4E0]">
                                        {progress.percentage}%
                                    </div>

                                    <div className="w-full max-w-[160px]">
                                        <ProgressBar value={progress.percentage} />
                                    </div>

                                    <span className="whitespace-nowrap text-[9px] font-black uppercase tracking-widest text-slate-400">
                                        {activePhase.totalPhase
                                            ? `${activePhase.index}/${activePhase.totalPhase} fase`
                                            : "0 fase"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            header: "SEKOLAH",
            align: "text-left",
            render: (row) => (
                <InfoCell
                    icon={<Building2 size={14} />}
                    value={getSchoolName(row)}
                    maxWidth="max-w-[190px]"
                />
            ),
        },
        {
            header: "PIC HO",
            align: "text-left",
            render: (row) => (
                <InfoCell
                    icon={<UserCheck size={14} />}
                    value={getPicName(row)}
                    maxWidth="max-w-[145px]"
                />
            ),
        },
        {
            header: "VENDOR",
            align: "text-left",
            render: (row) => (
                <InfoCell
                    icon={<Briefcase size={14} />}
                    value={getVendorName(row)}
                    maxWidth="max-w-[165px]"
                />
            ),
        },
        {
            header: "FASE AKTIF",
            align: "text-left",
            render: (row) => {
                const activePhase = getActivePhaseInfo(row);

                return (
                    <div className="min-w-[125px] text-left">
                        <p className="line-clamp-1 text-[12px] font-black text-slate-700">
                            {activePhase.label}
                        </p>

                        <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                            {activePhase.totalPhase
                                ? `${activePhase.index}/${activePhase.totalPhase} fase`
                                : "Belum ada fase"}
                        </p>
                    </div>
                );
            },
        },
        {
            header: "STATUS",
            align: "text-left",
            render: (row) => {
                const status = getProgramProcessStatus(row);

                return (
                    <span
                        className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-widest ${status.className}`}
                    >
                        {status.icon}
                        {status.label}
                    </span>
                );
            },
        },
        {
            header: "AKSI",
            align: "text-right w-[110px]",
            render: (row) => {
                const programId = getProgramId(row);

                return (
                    <div className="flex justify-end gap-2 bg-white">
                        <button
                            type="button"
                            onClick={() => navigate(`${detailPathPrefix}/${programId}`)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 shadow-sm transition hover:border-[#0AC4E0] hover:text-[#0AC4E0]"
                            title="Lihat detail program"
                        >
                            <Eye size={16} />
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate(`${editPathPrefix}/${programId}`)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 shadow-sm transition hover:border-blue-200 hover:text-blue-500"
                            title="Edit program"
                        >
                            <Edit size={16} />
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
        <PageWrapper className="flex h-screen overflow-hidden bg-[#EEF5FF] !p-0 font-sans text-slate-800">
            <Sidebar />

            <main className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden">
                <div className="pointer-events-none absolute -right-36 -top-36 h-[420px] w-[420px] rounded-full bg-cyan-200/40 blur-[120px]" />
                <div className="pointer-events-none absolute -left-32 bottom-0 h-[380px] w-[380px] rounded-full bg-sky-100/70 blur-[110px]" />

                <section className="relative z-10 shrink-0 px-8 pt-7">
                    <div className="overflow-hidden rounded-[2.3rem] border border-white bg-white/95 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
                        <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                            <div className="flex min-w-0 items-start gap-4">
                                <button
                                    type="button"
                                    onClick={() => navigate(backPath)}
                                    className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-slate-500 transition hover:bg-white hover:text-[#0AC4E0]"
                                >
                                    <ArrowLeft size={18} />
                                </button>

                                <div className="min-w-0">
                                    <div className="mb-3 flex flex-wrap items-center gap-2">
                                        <span className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-cyan-700">
                                            Program List
                                        </span>

                                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-slate-500">
                                            {titleHighlight}
                                        </span>
                                    </div>

                                    <h1 className="text-[34px] font-black leading-none tracking-[-0.055em] text-slate-950">
                                        Daftar Program{" "}
                                        <span className="bg-gradient-to-r from-[#0AC4E0] to-cyan-600 bg-clip-text text-transparent">
                                            {titleHighlight}
                                        </span>
                                    </h1>

                                    <p className="mt-4 max-w-3xl text-[13px] font-semibold leading-6 text-slate-500">
                                        Monitoring progres program berdasarkan Termin Luar, Termin
                                        Dalam, validasi HO, revisi vendor, dan penyelesaian fase.
                                    </p>
                                </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-3">
                                <button
                                    type="button"
                                    onClick={fetchData}
                                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-slate-400 transition hover:bg-white hover:text-[#0AC4E0]"
                                    title="Refresh Data"
                                >
                                    <RefreshCw size={16} />
                                </button>

                                <Button
                                    text="Tambah Program"
                                    icon={<Plus size={16} />}
                                    onClick={() => navigate(createPath)}
                                    className="!rounded-2xl !bg-[#0AC4E0] !px-6 !py-3 !text-[10px] !font-black !uppercase !tracking-widest !text-white shadow-lg shadow-cyan-100 hover:!bg-cyan-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
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

                <section className="relative z-10 shrink-0 px-8 py-5">
                    <div className="flex flex-col gap-3 rounded-[2rem] border border-white bg-white/90 p-4 shadow-sm xl:flex-row xl:items-center">
                        <div className="flex-1">
                            <Search
                                placeholder="Cari program, pilar, sekolah, vendor, status, fase, atau tahun..."
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                        </div>

                        <div className="relative z-20 overflow-visible">
                            <div className="flex h-[48px] min-w-[230px] items-center rounded-2xl border border-slate-100 bg-slate-50 px-4">
                                <Filter size={15} className="mr-3 shrink-0 text-slate-400" />
                                <Dropdown
                                    items={pilarOptions}
                                    value={filterPilar}
                                    onChange={(value) => setFilterPilar(value)}
                                    className="!w-full !border-none !bg-transparent !py-0 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-500"
                                />
                            </div>
                        </div>

                        <div className="relative z-10 overflow-visible">
                            <div className="flex h-[48px] min-w-[230px] items-center rounded-2xl border border-slate-100 bg-slate-50 px-4">
                                <Filter size={15} className="mr-3 shrink-0 text-slate-400" />
                                <Dropdown
                                    items={filterOptions}
                                    value={filterStatus}
                                    onChange={(value) => setFilterStatus(value)}
                                    className="!w-full !border-none !bg-transparent !py-0 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-500"
                                />
                            </div>
                        </div>

                        <div className="flex h-[48px] items-center gap-3 rounded-2xl bg-slate-900 px-5 text-white">
                            <LayoutGrid size={15} className="text-[#0AC4E0]" />

                            <span className="text-[10px] font-black uppercase tracking-widest">
                                {totalItems} Data
                            </span>
                        </div>
                    </div>
                </section>

                <section className="simple-scroll relative z-10 flex-1 overflow-y-auto px-8 pb-6">
                    <div className="overflow-hidden rounded-[1.7rem] border border-white bg-white shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
                        <div className="overflow-x-auto">
                            <Table
                                columns={tableColumns}
                                data={currentData}
                                className="min-w-[1080px]"
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

                <section className="relative z-10 flex shrink-0 items-center justify-between border-t border-white/80 bg-white/80 px-8 py-5 backdrop-blur-xl">
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
              background: #CBD5E1;
              border-radius: 999px;
            }

            table {
              width: 100%;
              border-collapse: separate;
              border-spacing: 0;
            }

            thead th {
              background: #0AC4E0 !important;
              color: white !important;
              font-size: 10px !important;
              font-weight: 900 !important;
              text-transform: uppercase !important;
              letter-spacing: 0.12em !important;
              padding: 1rem 1.25rem !important;
              border-bottom: 1px solid #E2E8F0 !important;
              white-space: nowrap !important;
            }

            tbody td {
              padding: 1rem 1.25rem !important;
              border-bottom: 1px solid #F1F5F9 !important;
              vertical-align: middle !important;
            }

            tbody tr:last-child td {
              border-bottom: none !important;
            }

            tbody tr:hover td {
              background: rgba(10, 196, 224, 0.04) !important;
            }

            thead th:last-child,
            tbody td:last-child {
              position: sticky;
              right: 0;
              z-index: 15;
              background: white !important;
              box-shadow: -10px 0 20px rgba(15, 23, 42, 0.04);
            }

            thead th:last-child {
              z-index: 25;
              background: #0AC4E0 !important;
            }

            tbody tr:hover td:last-child {
              background: white !important;
            }

            .line-clamp-1 {
              display: -webkit-box;
              -webkit-line-clamp: 1;
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
        <div className="flex items-center gap-3 text-left">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-[#0AC4E0]">
                {icon}
            </div>

            <span
                className={`${maxWidth} truncate text-[12px] font-semibold text-slate-600`}
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
            ? "bg-emerald-50 text-emerald-600"
            : variant === "amber"
                ? "bg-amber-50 text-amber-600"
                : variant === "cyan"
                    ? "bg-[#0AC4E0]/10 text-[#0AC4E0]"
                    : variant === "slate"
                        ? "bg-slate-100 text-slate-500"
                        : "bg-slate-50 text-slate-700";

    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                {label}
            </p>

            <div className="mt-2 flex items-end justify-between gap-3">
                <div>
                    <p className="text-[24px] font-black leading-none text-slate-800">
                        {value}
                    </p>

                    <p className="mt-2 text-[10px] font-bold text-slate-400">
                        {helper}
                    </p>
                </div>

                <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${style}`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default ListProgramPage;
