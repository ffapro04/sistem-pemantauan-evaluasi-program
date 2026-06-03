/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
    AlertCircle,
    CalendarDays,
    CheckCircle2,
    FolderKanban,
    Search as SearchIcon,
    TrendingUp,
    Activity,
    Building2,
    UserCog,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import Sidebar from "../../components/Sidebar";
import Card from "../../components/Card";
import Search from "../../components/Search";
import Table from "../../components/Table";
import PageWrapper from "../../components/PageWrapper";

const API_BASE = "http://localhost:3000";

const normalizeArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.result)) return payload.result;
    if (Array.isArray(payload?.results)) return payload.results;
    if (Array.isArray(payload?.rows)) return payload.rows;

    if (Array.isArray(payload?.program)) return payload.program;
    if (Array.isArray(payload?.programs)) return payload.programs;
    if (Array.isArray(payload?.transaksi_program)) return payload.transaksi_program;
    if (Array.isArray(payload?.transaksiProgram)) return payload.transaksiProgram;
    if (Array.isArray(payload?.program_sekolah)) return payload.program_sekolah;
    if (Array.isArray(payload?.programSekolah)) return payload.programSekolah;

    if (Array.isArray(payload?.users)) return payload.users;
    if (Array.isArray(payload?.user)) return payload.user;
    if (Array.isArray(payload?.vendor)) return payload.vendor;
    if (Array.isArray(payload?.vendors)) return payload.vendors;

    return [];
};

const normalizeText = (value) =>
    String(value || "")
        .trim()
        .toLowerCase();

const getSekolahIdFromToken = (decoded) => {
    return (
        decoded?.id_sekolah ||
        decoded?.sekolah_id ||
        decoded?.school_id ||
        decoded?.sekolah?.id_sekolah ||
        decoded?.sekolah?.id ||
        decoded?.school?.id_sekolah ||
        decoded?.school?.id ||
        null
    );
};

const getUserIdFromToken = (decoded) => {
    return decoded?.sub || decoded?.id_user || decoded?.id || null;
};

const getProgramId = (program) => {
    return (
        program?.id_program ??
        program?.id_transaksi_program ??
        program?.id_program_sekolah ??
        program?.id
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

const pushFlexibleIds = (ids, value) => {
    if (value === null || value === undefined || value === "") return;

    if (Array.isArray(value)) {
        value.forEach((item) => pushFlexibleIds(ids, item));
        return;
    }

    if (typeof value === "string") {
        const trimmed = value.trim();

        if (!trimmed) return;

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

        if (trimmed.includes(",")) {
            trimmed
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
                .forEach((item) => ids.push(item));

            return;
        }

        ids.push(trimmed);
        return;
    }

    if (typeof value === "object") {
        if (value.id_sekolah) ids.push(value.id_sekolah);
        if (value.sekolah_id) ids.push(value.sekolah_id);
        if (value.school_id) ids.push(value.school_id);

        if (value.id_vendor) ids.push(value.id_vendor);
        if (value.vendor_id) ids.push(value.vendor_id);
        if (value.id_narasumber) ids.push(value.id_narasumber);
        if (value.narasumber_id) ids.push(value.narasumber_id);

        if (value.id_user) ids.push(value.id_user);
        if (value.id_ao) ids.push(value.id_ao);
        if (value.id_pengawas) ids.push(value.id_pengawas);

        if (value.id) ids.push(value.id);

        if (value.sekolah) pushFlexibleIds(ids, value.sekolah);
        if (value.school) pushFlexibleIds(ids, value.school);

        if (value.vendor) pushFlexibleIds(ids, value.vendor);
        if (value.vendors) pushFlexibleIds(ids, value.vendors);
        if (value.narasumber) pushFlexibleIds(ids, value.narasumber);
        if (value.narasumbers) pushFlexibleIds(ids, value.narasumbers);

        return;
    }

    ids.push(value);
};

const collectProgramSchoolIds = (program) => {
    const ids = [];

    [
        program?.id_sekolah,
        program?.sekolah_id,
        program?.school_id,
        program?.id_target_sekolah,
        program?.target_sekolah_ids,
        program?.sekolah_ids,
        program?.school_ids,
        program?.sekolah,
        program?.school,
        program?.sekolahs,
        program?.schools,
        program?.target_sekolah,
        program?.targetSekolah,
        program?.daftar_sekolah,
        program?.daftarSekolah,
        program?.program?.id_sekolah,
        program?.program?.sekolah_id,
        program?.program?.sekolah,
    ].forEach((value) => pushFlexibleIds(ids, value));

    return [...new Set(ids.map(String).filter(Boolean))];
};

const isProgramForLoggedSchool = (program, idSekolah) => {
    if (!idSekolah) return false;

    const schoolIds = collectProgramSchoolIds(program);

    return schoolIds.some((id) => String(id) === String(idSekolah));
};

const getArray = (...values) => {
    return values.find((value) => Array.isArray(value)) || [];
};
const getRequirementFile = (requirement) => {
    return (
        requirement?.file ||
        requirement?.file_url ||
        requirement?.file_path ||
        requirement?.path ||
        requirement?.file_mou ||
        requirement?.dokumen ||
        requirement?.bukti ||
        requirement?.file_bukti ||
        requirement?.file_upload ||
        null
    );
};

const getRequirementStatus = (requirement) => {
    const currentStatus = String(requirement?.status || "").toUpperCase();

    if (
        currentStatus.includes("APPROVED") ||
        currentStatus.includes("DISETUJUI") ||
        currentStatus.includes("ACC")
    ) {
        return "APPROVED";
    }

    if (
        currentStatus.includes("REJECTED") ||
        currentStatus.includes("DITOLAK") ||
        currentStatus.includes("REVISI")
    ) {
        return "REJECTED";
    }

    if (
        currentStatus.includes("WAITING_HO") ||
        currentStatus.includes("MENUNGGU_HO") ||
        currentStatus.includes("MENUNGGU HO")
    ) {
        return "WAITING_HO";
    }

    if (
        currentStatus.includes("WAITING_UPLOAD") ||
        currentStatus.includes("PERLU_UPLOAD") ||
        currentStatus.includes("PERLU UPLOAD")
    ) {
        return "WAITING_UPLOAD";
    }

    if (getRequirementFile(requirement)) return "WAITING_HO";

    return "WAITING_UPLOAD";
};

const getProgramRequirements = (program) => {
    const fases = getArray(program?.fases, program?.fase, program?.program?.fases);

    return fases.flatMap((fase) => {
        const terminList = getArray(
            fase?.termin,
            fase?.termins,
            fase?.t_termin,
            fase?.term,
        );

        const kegiatanList = getArray(
            fase?.kegiatans,
            fase?.kegiatan,
            fase?.t_kegiatans,
        );

        const terminRequirements = terminList.flatMap((termin) =>
            getArray(
                termin?.persyaratan,
                termin?.persyaratan_termin,
                termin?.requirements,
                termin?.t_persyaratan_termin,
            ).map((item) => ({
                ...item,
                parentType: "termin",
            })),
        );

        const kegiatanRequirements = kegiatanList.flatMap((kegiatan) =>
            getArray(
                kegiatan?.persyaratan,
                kegiatan?.persyaratan_kegiatan,
                kegiatan?.requirements,
                kegiatan?.t_persyaratan_kegiatan,
            ).map((item) => ({
                ...item,
                parentType: "kegiatan",
            })),
        );

        return [...terminRequirements, ...kegiatanRequirements];
    });
};

const getProgramProgress = (program) => {
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
};

const getPhaseRows = (fase) => {
    const terminList = getArray(
        fase?.termin,
        fase?.termins,
        fase?.t_termin,
        fase?.term,
    );

    const kegiatanList = getArray(
        fase?.kegiatans,
        fase?.kegiatan,
        fase?.t_kegiatans,
    );

    const openingRows = terminList.map((termin) => ({
        type: "termin",
        requirements: getArray(
            termin?.persyaratan,
            termin?.persyaratan_termin,
            termin?.requirements,
            termin?.t_persyaratan_termin,
        ),
    }));

    const innerRows = kegiatanList.map((kegiatan) => ({
        type: "kegiatan",
        requirements: getArray(
            kegiatan?.persyaratan,
            kegiatan?.persyaratan_kegiatan,
            kegiatan?.requirements,
            kegiatan?.t_persyaratan_kegiatan,
        ),
    }));

    return {
        openingRows,
        innerRows,
    };
};

const isRowApproved = (row) => {
    if (!row?.requirements?.length) return false;

    return row.requirements.every(
        (item) => getRequirementStatus(item) === "APPROVED",
    );
};

const isOpeningCompleted = (fase) => {
    const { openingRows } = getPhaseRows(fase);

    if (!openingRows.length) return false;

    return openingRows.every((row) => isRowApproved(row));
};

const isPhaseCompleted = (fase) => {
    const { openingRows, innerRows } = getPhaseRows(fase);

    if (!openingRows.length && !innerRows.length) return false;

    const openingOk =
        openingRows.length === 0 || openingRows.every((row) => isRowApproved(row));

    const innerOk =
        innerRows.length === 0 || innerRows.every((row) => isRowApproved(row));

    return openingOk && innerOk;
};

const getActivePhaseInfo = (program) => {
    const fases = getArray(program?.fases, program?.fase, program?.program?.fases);

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
        label: fase?.nama_fase || fase?.nama || `Fase ${index + 1}`,
        index: index + 1,
        totalPhase: fases.length,
        openingDone: isOpeningCompleted(fase),
        completed: isPhaseCompleted(fase),
    };
};

const fetchMasterArray = async (urls = [], headers = {}) => {
    for (const url of urls) {
        try {
            const response = await fetch(`${API_BASE}${url}`, {
                method: "GET",
                headers,
            });

            const payload = await response.json().catch(() => []);

            if (!response.ok) continue;

            const data = normalizeArray(payload);

            // penting: kalau endpoint sukses tapi array kosong,
            // jangan langsung berhenti, coba endpoint berikutnya
            if (data.length === 0) continue;

            return data;
        } catch {
            // lanjut endpoint berikutnya
        }
    }

    return [];
};

const normalizeName = (value) => {
    if (!value) return "";

    if (Array.isArray(value)) {
        return value.map(normalizeName).filter(Boolean).join(", ");
    }

    if (typeof value === "object") {
        return (
            value?.nama_vendor ||
            value?.nama_perusahaan ||
            value?.vendor_name ||
            value?.company_name ||
            value?.nama_narasumber ||
            value?.nama_pemateri ||
            value?.nama ||
            value?.name ||
            value?.nama_user ||
            value?.nama_ho ||
            normalizeName(value?.vendor) ||
            normalizeName(value?.narasumber) ||
            normalizeName(value?.user) ||
            ""
        );
    }

    return String(value || "").trim();
};

const getMasterIds = (item) => {
    return [
        item?.id_vendor,
        item?.vendor_id,
        item?.id_narasumber,
        item?.narasumber_id,

        item?.id_user,
        item?.id_ao,
        item?.id_area_officer,
        item?.id_pengawas,
        item?.id,
    ]
        .filter(Boolean)
        .map(String);
};

const findNameByIds = (list = [], ids = []) => {
    const cleanIds = ids.map(String).filter(Boolean);

    if (cleanIds.length === 0) return "";

    const found = list.find((item) => {
        const masterIds = getMasterIds(item);

        return masterIds.some((id) => cleanIds.includes(String(id)));
    });

    return normalizeName(found);
};
const collectPicIds = (item) => {
    const ids = [];

    [
        item?.id_pengawas,
        item?.pengawas_id,
        item?.id_ao,
        item?.ao_id,
        item?.id_area_officer,
        item?.area_officer_id,

        item?.program?.id_pengawas,
        item?.program?.pengawas_id,
        item?.program?.id_ao,
        item?.program?.ao_id,
        item?.program?.id_area_officer,
        item?.program?.area_officer_id,

        item?.pengawas,
        item?.ao,
        item?.area_officer,
        item?.areaOfficer,
        item?.program?.pengawas,
        item?.program?.ao,
        item?.program?.area_officer,
        item?.program?.areaOfficer,
    ].forEach((value) => pushFlexibleIds(ids, value));

    return [...new Set(ids.map(String).filter(Boolean))];
};

const collectVendorIds = (item) => {
    const ids = [];

    [
        item?.id_vendor,
        item?.vendor_id,
        item?.vendor_ids,
        item?.id_narasumber,
        item?.narasumber_id,
        item?.narasumber_ids,

        item?.program?.id_vendor,
        item?.program?.vendor_id,
        item?.program?.vendor_ids,
        item?.program?.id_narasumber,
        item?.program?.narasumber_id,
        item?.program?.narasumber_ids,

        item?.vendor,
        item?.vendors,
        item?.narasumber,
        item?.narasumbers,
        item?.pemateri,
        item?.mitra,

        item?.program?.vendor,
        item?.program?.vendors,
        item?.program?.narasumber,
        item?.program?.narasumbers,

        item?.program_vendors,
        item?.programVendor,
        item?.program_vendor,
        item?.vendor_program,
        item?.vendorPrograms,
        item?.t_vendor_program,
        item?.t_vendors,
        item?.program?.program_vendors,
        item?.program?.vendor_program,
    ].forEach((value) => pushFlexibleIds(ids, value));

    return [...new Set(ids.map(String).filter(Boolean))];
};

const getPicName = (item, masterAoList = []) => {
    const directName =
        normalizeName(item?.pengawas) ||
        normalizeName(item?.ao) ||
        normalizeName(item?.area_officer) ||
        normalizeName(item?.areaOfficer) ||
        normalizeName(item?.nama_pengawas) ||
        normalizeName(item?.nama_ao) ||
        normalizeName(item?.nama_area_officer) ||
        normalizeName(item?.program?.pengawas) ||
        normalizeName(item?.program?.ao) ||
        normalizeName(item?.program?.area_officer) ||
        normalizeName(item?.program?.areaOfficer);

    if (directName && !/^\d+$/.test(directName)) return directName;

    const byId = findNameByIds(masterAoList, collectPicIds(item));

    return byId || directName || "Tanpa PIC";
};

const getVendorName = (item, masterVendorList = []) => {
    const directName =
        normalizeName(item?.vendor) ||
        normalizeName(item?.vendors) ||
        normalizeName(item?.narasumber) ||
        normalizeName(item?.narasumbers) ||
        normalizeName(item?.pemateri) ||
        normalizeName(item?.mitra) ||
        normalizeName(item?.program_vendors) ||
        normalizeName(item?.vendor_program) ||
        normalizeName(item?.t_vendor_program) ||
        normalizeName(item?.t_vendors) ||
        normalizeName(item?.nama_vendor) ||
        normalizeName(item?.vendor_name) ||
        normalizeName(item?.nama_narasumber) ||
        normalizeName(item?.program?.vendor) ||
        normalizeName(item?.program?.vendors) ||
        normalizeName(item?.program?.narasumber) ||
        normalizeName(item?.program?.narasumbers) ||
        normalizeName(item?.program?.program_vendors) ||
        normalizeName(item?.program?.vendor_program);

    if (directName && !/^\d+$/.test(directName)) return directName;

    const byId = findNameByIds(masterVendorList, collectVendorIds(item));

    return byId || directName || "Tanpa vendor";
};

const getDateValue = (...values) => {
    return (
        values.find(
            (value) => value !== null && value !== undefined && value !== "",
        ) || null
    );
};

const getFirstPhaseDate = (item, fieldList = []) => {
    const fases = getArray(item?.fases, item?.fase, item?.program?.fases);

    for (const fase of fases) {
        for (const field of fieldList) {
            if (fase?.[field]) return fase[field];
        }
    }

    return null;
};

const getLastPhaseDate = (item, fieldList = []) => {
    const fases = getArray(item?.fases, item?.fase, item?.program?.fases);

    for (let index = fases.length - 1; index >= 0; index -= 1) {
        const fase = fases[index];

        for (const field of fieldList) {
            if (fase?.[field]) return fase[field];
        }
    }

    return null;
};

const getProgramStartDate = (item) => {
    return getDateValue(
        item?.tanggal_mulai,
        item?.tanggalMulai,
        item?.start_date,
        item?.startDate,
        item?.mulai,
        item?.periode_mulai,
        item?.periodeMulai,
        item?.periode?.mulai,
        item?.periode?.tanggal_mulai,
        item?.periode?.start_date,
        item?.program?.tanggal_mulai,
        item?.program?.tanggalMulai,
        item?.program?.start_date,
        item?.program?.mulai,
        getFirstPhaseDate(item, [
            "tanggal_mulai",
            "tanggalMulai",
            "start_date",
            "mulai",
        ]),
    );
};

const getProgramEndDate = (item) => {
    return getDateValue(
        item?.tanggal_selesai,
        item?.tanggalSelesai,
        item?.tanggal_akhir,
        item?.tanggalAkhir,
        item?.end_date,
        item?.endDate,
        item?.selesai_pada,
        item?.periode_selesai,
        item?.periodeSelesai,
        item?.periode_akhir,
        item?.periodeAkhir,
        item?.periode?.selesai,
        item?.periode?.tanggal_selesai,
        item?.periode?.tanggal_akhir,
        item?.periode?.end_date,
        item?.program?.tanggal_selesai,
        item?.program?.tanggalSelesai,
        item?.program?.tanggal_akhir,
        item?.program?.end_date,
        item?.program?.selesai,
        getLastPhaseDate(item, [
            "tanggal_selesai",
            "tanggalSelesai",
            "tanggal_akhir",
            "end_date",
            "selesai",
        ]),
    );
};

const getProgramPeriodText = (item) => {
    const startDate = getProgramStartDate(item);
    const endDate = getProgramEndDate(item);

    if (startDate || endDate) {
        return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    }

    const tahun =
        item?.tahun ||
        item?.year ||
        item?.periode?.tahun ||
        item?.program?.tahun ||
        item?.program?.year;

    if (tahun) return `Tahun ${tahun}`;

    return "Belum ada periode";
};
const normalizeProgram = (item, master = {}) => {
    const masterAoList = master.masterAoList || [];
    const masterVendorList = master.masterVendorList || [];

    const progress = getProgramProgress(item);
    const activePhase = getActivePhaseInfo(item);

    const rawStatus =
        item?.status ||
        item?.status_program ||
        item?.status_progress ||
        item?.fase_status ||
        item?.program?.status ||
        "Berjalan";

    const statusText = String(rawStatus || "Berjalan");
    const statusLower = statusText.toLowerCase();

    const isSelesai =
        statusLower.includes("selesai") ||
        statusLower.includes("complete") ||
        statusLower.includes("done") ||
        progress.percentage >= 100 ||
        activePhase.completed ||
        item?.is_selesai === true ||
        item?.selesai === true;

    return {
        id_program:
            item?.id_program ||
            item?.id_transaksi_program ||
            item?.id_program_sekolah ||
            item?.id ||
            "-",

        nama:
            item?.nama_program ||
            item?.nama ||
            item?.judul ||
            item?.program?.nama_program ||
            item?.program?.nama ||
            "Program Sekolah",

        kategori:
            item?.jenis ||
            item?.kategori ||
            item?.kategori_program ||
            item?.tipe ||
            item?.program?.jenis ||
            item?.program?.kategori ||
            "Program",

        fase: activePhase.label || "Monitoring Program",
        status: isSelesai ? "Selesai" : statusText,
        selesai: isSelesai,
        progress: progress.percentage,

        tanggal_mulai: getProgramStartDate(item),
        tanggal_selesai: getProgramEndDate(item),
        periode: getProgramPeriodText(item),

        pic: getPicName(item, masterAoList),
        vendor: getVendorName(item, masterVendorList),

        raw: item,
    };
};

function DashboardSekolah() {
    const navigate = useNavigate();

    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("semua");

    const [page, setPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                setLoading(true);
                setErrorMessage("");

                const token = localStorage.getItem("token");

                if (!token) {
                    navigate("/login");
                    return;
                }

                const decoded = jwtDecode(token);

                const idSekolah = getSekolahIdFromToken(decoded);
                const idUser = getUserIdFromToken(decoded);
                const idRole = Number(decoded?.id_role || decoded?.role_id || 0);

                if (![5, 8].includes(idRole)) {
                    throw new Error(
                        "Akun yang sedang login bukan akun sekolah. Silakan login menggunakan akun sekolah.",
                    );
                }

                if (!idSekolah) {
                    throw new Error(
                        "ID sekolah tidak terbaca dari token. Pastikan akun sekolah sudah terhubung dengan data sekolah.",
                    );
                }

                const headers = {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                };

                const queryParams = new URLSearchParams();

                if (idUser) {
                    queryParams.set("id_user", String(idUser));
                }

                const listUrl = `${API_BASE}/program${queryParams.toString() ? `?${queryParams.toString()}` : ""
                    }`;

                const [resProgram, rawMasterAoList, masterVendorList] =
                    await Promise.all([
                        fetch(listUrl, {
                            method: "GET",
                            headers,
                        }),
                        fetchMasterArray(
                            [
                                "/users/ao",
                                "/users?id_role=4",
                                "/users?role=ao",
                                "/users?role=area-officer",
                                "/users",
                            ],
                            headers,
                        ),
                        fetchMasterArray(
                            [
                                "/vendor",
                                "/vendor?kategori=AKADEMIK",
                                "/vendor?kategori=NON_AKADEMIK",
                                "/vendors",
                                "/users/vendor",
                                "/users?id_role=6",
                                "/users?role=vendor",
                            ],
                            headers,
                        ),
                    ]);

                const masterAoList = rawMasterAoList.filter((item) => {
                    const roleText = String(item?.role || item?.nama_role || item?.jabatan || "")
                        .toLowerCase();

                    return (
                        Number(item?.id_role) === 4 ||
                        roleText.includes("area officer") ||
                        roleText.includes("ao") ||
                        roleText.includes("pengawas")
                    );
                });

                const programPayload = await resProgram.json().catch(() => null);

                if (!resProgram.ok) {
                    throw new Error(
                        programPayload?.message || "Gagal mengambil data program",
                    );
                }

                const programList = normalizeArray(programPayload)
                    .filter((program) => getProgramId(program))
                    .filter((program) =>
                        isProgramForLoggedSchool(program, idSekolah),
                    );

                const detailedPrograms = await Promise.all(
                    programList.map(async (program) => {
                        try {
                            const programId = getProgramId(program);

                            const detailRes = await fetch(
                                `${API_BASE}/program/${programId}`,
                                {
                                    method: "GET",
                                    headers,
                                },
                            );

                            const detailPayload = await detailRes
                                .json()
                                .catch(() => null);

                            if (!detailRes.ok) {
                                return program;
                            }

                            const detail =
                                detailPayload?.data || detailPayload || program;

                            if (!isProgramForLoggedSchool(detail, idSekolah)) {
                                return program;
                            }

                            return detail;
                        } catch {
                            return program;
                        }
                    }),
                );

                const normalizedData = detailedPrograms
                    .filter((program) =>
                        isProgramForLoggedSchool(program, idSekolah),
                    )
                    .map((program) =>
                        normalizeProgram(program, {
                            masterAoList,
                            masterVendorList,
                        }),
                    )
                    .sort((a, b) => {
                        const dateA = new Date(
                            a.raw?.updated_at || a.raw?.created_at || 0,
                        );

                        const dateB = new Date(
                            b.raw?.updated_at || b.raw?.created_at || 0,
                        );

                        return dateB.getTime() - dateA.getTime();
                    });

                console.log("DASHBOARD SEKOLAH PROGRAM CHECK:", {
                    idSekolah,
                    masterAoCount: masterAoList.length,
                    masterVendorCount: masterVendorList.length,
                    rawProgramCount: normalizeArray(programPayload).length,
                    visibleProgramCount: normalizedData.length,
                    sample: normalizedData.slice(0, 3).map((item) => ({
                        nama: item.nama,
                        pic: item.pic,
                        vendor: item.vendor,
                        periode: item.periode,
                        vendorIdsTerbaca: collectVendorIds(item.raw),
                        rawVendorFields: {
                            id_vendor: item.raw?.id_vendor,
                            vendor_id: item.raw?.vendor_id,
                            vendor_ids: item.raw?.vendor_ids,
                            vendor: item.raw?.vendor,
                            vendors: item.raw?.vendors,
                            narasumber: item.raw?.narasumber,
                            narasumbers: item.raw?.narasumbers,
                            program_vendors: item.raw?.program_vendors,
                            vendor_program: item.raw?.vendor_program,
                            programVendor: item.raw?.programVendor,
                        },
                        raw: item.raw,
                    })),
                });

                setPrograms(normalizedData);
            } catch (error) {
                console.error("Gagal mengambil program sekolah:", error);

                setPrograms([]);
                setErrorMessage(
                    error?.message ||
                    "Gagal memuat data program sekolah. Pastikan data program sudah terhubung dengan sekolah login.",
                );
            } finally {
                setLoading(false);
            }
        };

        fetchPrograms();
    }, [navigate]);
    const filteredData = useMemo(() => {
        return programs
            .filter((item) => {
                if (statusFilter === "berjalan") return !item.selesai;
                if (statusFilter === "selesai") return item.selesai;

                return true;
            })
            .filter((item) => {
                if (!searchTerm) return true;

                const keyword = normalizeText(searchTerm);

                return [
                    item.nama,
                    item.kategori,
                    item.fase,
                    item.status,
                    item.pic,
                    item.vendor,
                    item.periode,
                ]
                    .join(" ")
                    .toLowerCase()
                    .includes(keyword);
            });
    }, [programs, searchTerm, statusFilter]);

    const totalProgram = programs.length;
    const totalBerjalan = programs.filter((item) => !item.selesai).length;
    const totalSelesai = programs.filter((item) => item.selesai).length;

    const averageProgress =
        programs.length > 0
            ? Math.round(
                programs.reduce(
                    (sum, item) => sum + Number(item.progress || 0),
                    0,
                ) / programs.length,
            )
            : 0;

    const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;

    const paginatedData = filteredData.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage,
    );

    useEffect(() => {
        setPage(1);
    }, [searchTerm, statusFilter]);

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    const tableColumns = [
        {
            header: "No",
            align: "text-center w-20",
            render: (_, idx) => (
                <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-xl bg-slate-50 px-3 text-[11px] font-black text-slate-400">
                    {(page - 1) * itemsPerPage + idx + 1}
                </span>
            ),
        },
        {
            header: "Nama Program",
            render: (row) => (
                <div className="flex items-center gap-4 text-left">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#0AC4E0]/10 text-[#0AC4E0]">
                        <FolderKanban size={18} />
                    </div>

                    <div className="leading-tight">
                        <p className="text-[13px] font-black uppercase tracking-tight text-slate-800">
                            {row.nama}
                        </p>

                        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                            ID Program #{row.id_program || "-"} · {row.kategori}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            header: "Fase / Status",
            render: (row) => (
                <div className="space-y-2">
                    <p className="text-[12px] font-bold text-slate-600">
                        {row.fase || "-"}
                    </p>

                    <span
                        className={`inline-flex rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${row.selesai
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-[#0AC4E0]/10 text-[#0AC4E0]"
                            }`}
                    >
                        {row.selesai ? "Selesai" : "Sedang Berjalan"}
                    </span>
                </div>
            ),
        },
        {
            header: "PIC / Vendor",
            render: (row) => (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <UserCog size={13} className="text-[#0AC4E0]" />

                        <span className="text-[12px] font-bold text-slate-600">
                            {row.pic && row.pic !== "-" ? row.pic : "Tanpa PIC"}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Building2 size={13} className="text-slate-300" />

                        <span className="text-[11px] font-semibold text-slate-400">
                            {row.vendor && row.vendor !== "-"
                                ? row.vendor
                                : "Tanpa vendor"}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            header: "Periode",
            align: "text-center",
            render: (row) => (
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2">
                    <CalendarDays size={13} className="text-[#0AC4E0]" />

                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        {row.periode || "Belum ada periode"}
                    </span>
                </div>
            ),
        },
        {
            header: "Progress",
            align: "text-center",
            render: (row) => (
                <div className="mx-auto w-[140px]">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400">
                            Progress
                        </span>

                        <span className="text-[11px] font-black text-[#0AC4E0]">
                            {row.progress}%
                        </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                            className={`h-full rounded-full ${row.selesai ? "bg-emerald-500" : "bg-[#0AC4E0]"
                                }`}
                            style={{ width: `${row.progress}%` }}
                        />
                    </div>
                </div>
            ),
        },
    ];
    return (
        <PageWrapper className="h-screen w-screen overflow-hidden bg-white !p-0 font-sans text-slate-800">
            <div className="flex h-screen w-screen overflow-hidden">
                <Sidebar />

                <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-white">
                    <div className="pointer-events-none absolute right-0 top-0 h-[360px] w-[360px] rounded-full bg-[#0AC4E0]/5 blur-[110px]" />
                    <div className="pointer-events-none absolute bottom-0 left-1/3 h-[320px] w-[320px] rounded-full bg-blue-100/20 blur-[120px]" />

                    <section className="relative z-10 flex shrink-0 items-center justify-between border-b border-slate-100 bg-white/80 px-10 py-3 backdrop-blur-xl">
                        <div className="flex items-center gap-5">
                            <div className="text-left leading-none">
                                <div className="mb-1.5 flex items-center gap-2">
                                    <div className="h-3 w-1 rounded-full bg-[#0AC4E0]" />

                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
                                        Sistem Monitoring dan Evaluasi
                                    </p>
                                </div>

                                <h1 className="text-[26px] font-black tracking-tighter text-slate-800">
                                    Dashboard{" "}
                                    <span className="text-[#0AC4E0]">
                                        Sekolah
                                    </span>
                                </h1>

                                <p className="mt-1.5 text-[12px] font-semibold text-slate-400">
                                    Pantau program yang sedang berjalan dan yang
                                    sudah selesai di sekolah login saat ini.
                                </p>
                            </div>
                        </div>

                        <div className="flex w-[520px] shrink-0 items-center gap-3">
                            <div className="flex-1 rounded-[1.5rem] bg-slate-50/60 p-2.5">
                                <Search
                                    placeholder="Cari program, fase, PIC, atau vendor..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="!rounded-[1.1rem] !border-slate-100 !bg-white !py-2.5 !pl-12 !pr-5 !text-sm focus:!bg-white focus:!ring-4 focus:!ring-[#0AC4E0]/10"
                                />
                            </div>

                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                                className="h-11 rounded-2xl border border-slate-100 bg-slate-50 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none transition focus:border-[#0AC4E0] focus:bg-white"
                            >
                                <option value="semua">Semua</option>
                                <option value="berjalan">Berjalan</option>
                                <option value="selesai">Selesai</option>
                            </select>
                        </div>
                    </section>

                    <section className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden px-5 py-3">
                        <div className="mb-3 grid shrink-0 grid-cols-1 gap-4 md:grid-cols-4">
                            <StatCard
                                icon={<FolderKanban size={19} />}
                                label="Total Program"
                                value={totalProgram}
                                description="Program milik sekolah ini"
                            />

                            <StatCard
                                icon={<Activity size={19} />}
                                label="Sedang Berjalan"
                                value={totalBerjalan}
                                description="Program aktif dipantau"
                                variant="primary"
                            />

                            <StatCard
                                icon={<CheckCircle2 size={19} />}
                                label="Sudah Selesai"
                                value={totalSelesai}
                                description="Program telah selesai"
                                variant="success"
                            />

                            <StatCard
                                icon={<TrendingUp size={19} />}
                                label="Rata-rata Progress"
                                value={`${averageProgress}%`}
                                description="Akumulasi progress program"
                                variant="warning"
                            />
                        </div>

                        <Card className="!m-0 flex min-h-0 flex-1 flex-col overflow-hidden !rounded-[2.2rem] !border !border-slate-100 !bg-white !p-0 shadow-[0_16px_55px_rgba(15,23,42,0.04)]">
                            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-8 py-4">
                                <div className="text-left">
                                    <h2 className="text-[12px] font-black uppercase tracking-[0.25em] text-slate-800">
                                        Daftar Program Sekolah
                                    </h2>

                                    <p className="mt-1.5 text-[12px] font-semibold text-slate-400">
                                        Menampilkan {paginatedData.length} data
                                        pada halaman ini dari total{" "}
                                        {filteredData.length} program.
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 rounded-full bg-[#0AC4E0]/10 px-5 py-2.5 text-[#0AC4E0]">
                                    <SearchIcon size={15} />

                                    <span className="text-[10px] font-black uppercase tracking-[0.25em]">
                                        Data Program
                                    </span>
                                </div>
                            </div>

                            <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 py-4">
                                {loading ? (
                                    <LoadingState />
                                ) : errorMessage ? (
                                        <ErrorState message={errorMessage} />
                                    ) : filteredData.length > 0 ? (
                                        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.8rem] border border-slate-100 bg-white">
                                            <div className="min-h-0 flex-1 overflow-hidden">
                                                <Table
                                                    columns={tableColumns}
                                                    data={paginatedData}
                                                />
                                            </div>

                                                <Pagination
                                                    page={page}
                                                    totalPages={totalPages}
                                                    totalData={filteredData.length}
                                                    itemsPerPage={itemsPerPage}
                                                    onPrev={() =>
                                                        setPage((prev) =>
                                                            Math.max(prev - 1, 1),
                                                        )
                                                    }
                                                    onNext={() =>
                                                        setPage((prev) =>
                                                            Math.min(
                                                                prev + 1,
                                                                totalPages,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </div>
                                        ) : (
                                    <EmptyState />
                                )}
                            </div>
                        </Card>
                    </section>
                </main>
            </div>
        </PageWrapper>
    );
}
function StatCard({ icon, label, value, description, variant = "primary" }) {
    const variantClass = {
        primary: "bg-[#0AC4E0]/10 text-[#0AC4E0]",
        success: "bg-emerald-50 text-emerald-600",
        warning: "bg-orange-50 text-orange-500",
    };

    return (
        <Card className="!m-0 !rounded-[1.8rem] !border !border-slate-100 !bg-white !px-5 !py-4 shadow-[0_12px_40px_rgba(15,23,42,0.03)]">
            <div className="flex items-start justify-between">
                <div className="text-left">
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">
                        {label}
                    </p>

                    <h3 className="mt-2 text-[28px] font-black leading-none tracking-tighter text-slate-800">
                        {value}
                    </h3>

                    <p className="mt-2 text-[11px] font-semibold text-slate-400">
                        {description}
                    </p>
                </div>

                <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${variantClass[variant] || variantClass.primary
                        }`}
                >
                    {icon}
                </div>
            </div>
        </Card>
    );
}

function Pagination({
    page,
    totalPages,
    totalData,
    itemsPerPage,
    onPrev,
    onNext,
}) {
    const startData = totalData === 0 ? 0 : (page - 1) * itemsPerPage + 1;
    const endData = Math.min(page * itemsPerPage, totalData);

    return (
        <div className="flex shrink-0 items-center justify-between border-t border-slate-100 bg-slate-50/60 px-6 py-3">
            <p className="text-[11px] font-bold text-slate-400">
                Menampilkan {startData} - {endData} dari {totalData} data
            </p>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={onPrev}
                    disabled={page === 1}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-1.5 text-[11px] font-black uppercase tracking-widest transition ${page === 1
                        ? "cursor-not-allowed border-slate-100 bg-slate-100 text-slate-300"
                        : "border-slate-200 bg-white text-slate-400 hover:border-[#0AC4E0] hover:text-[#0AC4E0]"
                        }`}
                >
                    <ChevronLeft size={14} />
                    Prev
                </button>

                <div className="rounded-xl bg-[#0AC4E0] px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-[#0AC4E0]/20">
                    {page} / {totalPages}
                </div>

                <button
                    type="button"
                    onClick={onNext}
                    disabled={page === totalPages}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-1.5 text-[11px] font-black uppercase tracking-widest transition ${page === totalPages
                        ? "cursor-not-allowed border-slate-100 bg-slate-100 text-slate-300"
                        : "border-slate-200 bg-white text-slate-400 hover:border-[#0AC4E0] hover:text-[#0AC4E0]"
                        }`}
                >
                    Next
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-[1.8rem] bg-slate-50">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0AC4E0] border-t-transparent" />

            <p className="mt-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">
                Memuat Data Program Sekolah
            </p>
        </div>
    );
}

function ErrorState({ message }) {
    return (
        <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-[1.8rem] border border-red-100 bg-red-50 px-8 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-white text-red-400 shadow-sm">
                <AlertCircle size={32} />
            </div>

            <h3 className="text-sm font-black uppercase tracking-widest text-red-500">
                Gagal Memuat Data
            </h3>

            <p className="mt-3 max-w-xl text-sm font-medium leading-relaxed text-red-400">
                {message}
            </p>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-[1.8rem] border border-dashed border-slate-200 bg-slate-50 px-8 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-white text-slate-300 shadow-sm">
                <AlertCircle size={32} />
            </div>

            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">
                Belum Ada Program
            </h3>

            <p className="mt-3 max-w-md text-sm font-medium leading-relaxed text-slate-400">
                Belum ada program yang terhubung dengan sekolah yang sedang login.
            </p>
        </div>
    );
}

export default DashboardSekolah;