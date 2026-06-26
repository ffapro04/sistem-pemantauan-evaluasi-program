/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
    AlertTriangle,
    BarChart3,
    Building2,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Eye,
    FolderOpen,
    GraduationCap,
    MapPin,
    MapPinned,
    RefreshCcw,
    Search,
    School,
    SlidersHorizontal,
    UsersRound,
} from "lucide-react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis,
} from "recharts";
import { toast } from "react-toastify";
import { Sidebar, PageWrapper } from "../common";
import { CHART_PALETTE, CHART_STATUS_COLORS } from "../../utils/chartPalette";

const API_BASE_URL = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    ""
).replace(/\/$/, "");

const PAGE_SIZE = 5;

const COLORS = {
    cyan: CHART_STATUS_COLORS.info,
    blue: CHART_STATUS_COLORS.info,
    violet: CHART_STATUS_COLORS.deep,
    pink: CHART_STATUS_COLORS.purple,
    amber: CHART_STATUS_COLORS.warning,
    emerald: CHART_STATUS_COLORS.success,
    orange: CHART_STATUS_COLORS.orange,
    indigo: CHART_STATUS_COLORS.deep,
    red: CHART_STATUS_COLORS.danger,
    slate: "#64748B",
};

const DISTRICT_CHART_COLORS = CHART_PALETTE;

const SCHOOL_BAR_COLORS = CHART_PALETTE;


const PROGRAM_STATUS_ORDER = [
    "APPROVAL",
    "SOSIALISASI",
    "IMPLEMENTASI",
    "EVALUASI",
    "SELESAI",
];

function normalizeArray(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.rows)) return payload.rows;
    if (Array.isArray(payload?.result)) return payload.result;
    if (Array.isArray(payload?.results)) return payload.results;
    if (Array.isArray(payload?.programs)) return payload.programs;
    if (Array.isArray(payload?.sekolah)) return payload.sekolah;
    if (Array.isArray(payload?.wilayah)) return payload.wilayah;
    return [];
}

function flattenTree(rows = []) {
    const result = [];

    const walk = (items) => {
        normalizeArray(items).forEach((item) => {
            if (!item || typeof item !== "object") return;

            result.push(item);

            const children =
                item.children ||
                item.childrens ||
                item.kabupaten ||
                item.kabupatens ||
                item.kota ||
                item.cities ||
                [];

            if (Array.isArray(children) && children.length) {
                walk(children);
            }
        });
    };

    walk(rows);
    return result;
}

function uniqueBy(rows = [], getKey) {
    const map = new Map();

    rows.forEach((row, index) => {
        const key = getKey(row) || `fallback-${index}`;

        if (!map.has(String(key))) {
            map.set(String(key), row);
        } else {
            map.set(String(key), {
                ...map.get(String(key)),
                ...row,
            });
        }
    });

    return Array.from(map.values());
}

async function safeJson(response) {
    try {
        return await response.json();
    } catch {
        return null;
    }
}

async function fetchJson(url, headers) {
    const response = await fetch(url, { headers });
    const payload = await safeJson(response);

    if (!response.ok) {
        const message =
            payload?.message ||
            payload?.error ||
            `Request gagal (${response.status})`;

        throw new Error(Array.isArray(message) ? message.join(", ") : message);
    }

    return payload;
}

async function fetchFirst(endpoints, headers) {
    let lastError = null;

    for (const endpoint of endpoints) {
        try {
            return await fetchJson(`${API_BASE_URL}${endpoint}`, headers);
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError || new Error("Endpoint tidak tersedia");
}

async function mapWithConcurrency(rows, limit, mapper) {
    const result = new Array(rows.length);
    let cursor = 0;

    async function worker() {
        while (cursor < rows.length) {
            const index = cursor;
            cursor += 1;

            try {
                result[index] = await mapper(rows[index], index);
            } catch {
                result[index] = rows[index];
            }
        }
    }

    await Promise.all(
        Array.from(
            { length: Math.min(Math.max(1, limit), Math.max(1, rows.length)) },
            () => worker(),
        ),
    );

    return result;
}

function normalizeText(value) {
    return String(value || "")
        .trim()
        .replace(/\s+/g, " ");
}

function normalizeValue(value) {
    return normalizeText(value)
        .toUpperCase()
        .replaceAll("-", "_")
        .replaceAll(" ", "_");
}

function normalizeId(value) {
    if (value === null || value === undefined || value === "") return "";
    return String(value);
}

function uniqueStrings(values = []) {
    return [...new Set(values.map(normalizeText).filter(Boolean))];
}

function getTokenPayload() {
    const token = localStorage.getItem("token");

    if (!token) return null;

    try {
        return jwtDecode(token);
    } catch {
        return null;
    }
}

function getUserId(payload = {}) {
    return (
        payload?.sub ||
        payload?.id_user ||
        payload?.user_id ||
        payload?.id ||
        null
    );
}

function getWilayahId(row = {}) {
    return (
        row?.id_wilayah ||
        row?.wilayah_id ||
        row?.id ||
        null
    );
}

function getWilayahName(row = {}) {
    return normalizeText(
        row?.nama_wilayah ||
        row?.nama ||
        row?.name ||
        "",
    );
}

function getWilayahType(row = {}) {
    return normalizeValue(
        row?.jenis_wilayah ||
        row?.tipe_wilayah ||
        row?.type ||
        "",
    );
}

function getWilayahParentId(row = {}) {
    return (
        row?.id_parent ||
        row?.parent_id ||
        row?.parent?.id_wilayah ||
        row?.parent?.id ||
        null
    );
}

function isProvince(row = {}) {
    const type = getWilayahType(row);

    if (type.includes("PROVINSI") || type.includes("PROVINCE")) return true;

    return !getWilayahParentId(row) && Boolean(getWilayahId(row));
}

function isDistrict(row = {}) {
    const type = getWilayahType(row);

    return (
        type.includes("KABUPATEN") ||
        type.includes("KOTA") ||
        type.includes("CITY") ||
        type.includes("REGENCY")
    );
}

function buildWilayahMap(rows = []) {
    const map = new Map();

    rows.forEach((row) => {
        const id = getWilayahId(row);
        if (id) map.set(String(id), row);
    });

    return map;
}

function findProvinceRowByWilayahId(id, wilayahMap) {
    let currentId = normalizeId(id);
    const visited = new Set();

    while (currentId && !visited.has(currentId)) {
        visited.add(currentId);

        const row = wilayahMap.get(currentId);
        if (!row) return null;
        if (isProvince(row)) return row;

        currentId = normalizeId(getWilayahParentId(row));
    }

    return null;
}

function getProfileWilayahRows(profile = {}) {
    const values = [
        profile?.wilayah,
        profile?.wilayahs,
        profile?.daftar_wilayah,
        profile?.assigned_wilayah,
    ];

    return values.flatMap((value) => {
        if (Array.isArray(value)) return value;
        if (value && typeof value === "object") return [value];
        return [];
    });
}

function getKabupatenTugas(profile = {}) {
    const values = [
        profile?.kabupaten_tugas,
        profile?.kabupatenTugas,
        profile?.wilayah_tugas,
        profile?.wilayahTugas,
    ];

    const value = values.find((item) => Array.isArray(item));
    return value || [];
}

function getAoScope(profile = {}, tokenPayload = {}, wilayahMap) {
    const provinceIds = new Set();
    const provinceNames = new Set();

    const addProvince = (row) => {
        if (!row) return;

        const id = getWilayahId(row);
        const name = getWilayahName(row);

        if (id) provinceIds.add(String(id));
        if (name) provinceNames.add(name.toLowerCase());
    };

    getProfileWilayahRows(profile).forEach((row) => {
        if (isProvince(row)) {
            addProvince(row);
            return;
        }

        const province = findProvinceRowByWilayahId(getWilayahId(row), wilayahMap);
        addProvince(province);
    });

    const rawWilayahIds = [
        profile?.id_wilayah,
        profile?.wilayah_id,
        tokenPayload?.id_wilayah,
        tokenPayload?.wilayah_id,
        ...(Array.isArray(profile?.id_wilayahs) ? profile.id_wilayahs : []),
        ...(Array.isArray(tokenPayload?.id_wilayahs)
            ? tokenPayload.id_wilayahs
            : []),
    ]
        .map(normalizeId)
        .filter(Boolean);

    rawWilayahIds.forEach((id) => {
        const row = wilayahMap.get(id);

        if (row && isProvince(row)) {
            addProvince(row);
        } else {
            addProvince(findProvinceRowByWilayahId(id, wilayahMap));
        }
    });

    getKabupatenTugas(profile).forEach((item) => {
        const provinceId =
            item?.id_provinsi ||
            item?.provinsi_id ||
            item?.id_parent ||
            null;

        const provinceName =
            item?.nama_provinsi ||
            item?.provinsi ||
            "";

        if (provinceId) {
            const provinceRow =
                wilayahMap.get(String(provinceId)) ||
                findProvinceRowByWilayahId(provinceId, wilayahMap);

            if (provinceRow) addProvince(provinceRow);
            else provinceIds.add(String(provinceId));
        }

        if (provinceName) {
            provinceNames.add(normalizeText(provinceName).toLowerCase());
        }
    });

    const explicitNames = [
        profile?.nama_provinsi,
        profile?.provinsi,
        tokenPayload?.nama_provinsi,
        tokenPayload?.provinsi,
    ]
        .map(normalizeText)
        .filter(Boolean);

    explicitNames.forEach((name) => provinceNames.add(name.toLowerCase()));

    const labels = [];

    provinceIds.forEach((id) => {
        const row = wilayahMap.get(id);
        if (row) labels.push(getWilayahName(row));
    });

    explicitNames.forEach((name) => labels.push(name));

    return {
        provinceIds,
        provinceNames,
        provinceLabels: uniqueStrings(labels),
        hasScope: provinceIds.size > 0 || provinceNames.size > 0,
    };
}

function getSchoolId(school = {}) {
    return (
        school?.id_sekolah ||
        school?.sekolah_id ||
        school?.school_id ||
        school?.id ||
        null
    );
}

function getSchoolName(school = {}) {
    return normalizeText(
        school?.nama_sekolah ||
        school?.nama ||
        school?.name ||
        "Sekolah",
    );
}

function getSchoolLevel(school = {}) {
    return normalizeText(
        school?.jenjang ||
        school?.level ||
        school?.tingkat ||
        "-",
    ).toUpperCase();
}

function getSchoolAccreditation(school = {}) {
    return normalizeText(
        school?.akreditasi ||
        school?.accreditation ||
        "-",
    ).toUpperCase();
}

function getSchoolStatus(school = {}) {
    const raw = school?.status;

    if (
        raw === false ||
        raw === 0 ||
        raw === "0" ||
        normalizeValue(raw).includes("NONAKTIF") ||
        normalizeValue(raw).includes("INACTIVE")
    ) {
        return "Nonaktif";
    }

    return "Aktif";
}

function getSchoolDistrictCandidateId(school = {}) {
    return (
        school?.id_kabupaten ||
        school?.kabupaten_id ||
        school?.id_wilayah ||
        school?.wilayah_id ||
        school?.wilayah?.id_wilayah ||
        school?.wilayah?.id ||
        null
    );
}

function resolveSchoolGeo(school = {}, wilayahMap) {
    const candidateIds = [
        school?.id_kabupaten,
        school?.kabupaten_id,
        school?.id_wilayah,
        school?.wilayah_id,
        school?.wilayah?.id_wilayah,
        school?.wilayah?.id,
    ]
        .map(normalizeId)
        .filter(Boolean);

    let districtRow = null;
    let provinceRow = null;

    for (const id of candidateIds) {
        const row = wilayahMap.get(id);

        if (!row) continue;

        if (!districtRow && isDistrict(row)) districtRow = row;
        if (!provinceRow) {
            provinceRow = isProvince(row)
                ? row
                : findProvinceRowByWilayahId(id, wilayahMap);
        }
    }

    const districtId =
        getWilayahId(districtRow) ||
        school?.id_kabupaten ||
        school?.kabupaten_id ||
        school?.id_wilayah ||
        school?.wilayah_id ||
        null;

    const districtName =
        getWilayahName(districtRow) ||
        normalizeText(
            school?.nama_kabupaten ||
            school?.kabupaten ||
            school?.nama_kota ||
            school?.kota ||
            school?.wilayah?.nama_wilayah ||
            school?.wilayah?.nama ||
            "Kabupaten/Kota belum dipetakan",
        );

    const provinceId =
        getWilayahId(provinceRow) ||
        school?.id_provinsi ||
        school?.provinsi_id ||
        school?.wilayah?.id_parent ||
        null;

    const provinceName =
        getWilayahName(provinceRow) ||
        normalizeText(
            school?.nama_provinsi ||
            school?.provinsi ||
            school?.wilayah?.parent?.nama_wilayah ||
            school?.wilayah?.parent?.nama ||
            "",
        );

    return {
        districtId: normalizeId(districtId),
        districtName,
        provinceId: normalizeId(provinceId),
        provinceName,
    };
}

function schoolBelongsToAoProvince(school, aoScope, wilayahMap) {
    if (!aoScope?.hasScope) return false;

    const geo = resolveSchoolGeo(school, wilayahMap);

    if (geo.provinceId && aoScope.provinceIds.has(geo.provinceId)) {
        return true;
    }

    if (
        geo.provinceName &&
        aoScope.provinceNames.has(geo.provinceName.toLowerCase())
    ) {
        return true;
    }

    return false;
}

function getProgramId(program = {}) {
    return (
        program?.id_program ||
        program?.program_id ||
        program?.id ||
        null
    );
}

function getProgramTitle(program = {}) {
    return normalizeText(
        program?.nama_program ||
        program?.nama ||
        program?.title ||
        "Program",
    );
}

function getProgramAoIds(program = {}) {
    const ids = [];

    [
        program?.id_pengawas,
        program?.id_ao,
        program?.ao_id,
        program?.pengawas_id,
        program?.pengawas?.id_user,
        program?.pengawas?.id_ao,
        program?.pengawas?.id,
        program?.ao?.id_user,
        program?.ao?.id_ao,
        program?.ao?.id,
    ].forEach((value) => {
        if (value !== null && value !== undefined && value !== "") {
            ids.push(value);
        }
    });

    [
        program?.ao_ids,
        program?.aos,
        program?.area_officers,
        program?.pengawas_list,
    ].forEach((value) => {
        if (!Array.isArray(value)) return;

        value.forEach((item) => {
            if (item && typeof item === "object") {
                ids.push(
                    item?.id_user ||
                    item?.id_ao ||
                    item?.id ||
                    item?.ao_id,
                );
            } else {
                ids.push(item);
            }
        });
    });

    return [...new Set(ids.map(normalizeId).filter(Boolean))];
}

function getProgramSchoolObjects(program = {}) {
    const values = [
        program?.sekolahs,
        program?.schools,
        program?.target_sekolah,
        program?.target_sekolahs,
    ];

    return values
        .flatMap((value) => (Array.isArray(value) ? value : []))
        .filter((value) => value && typeof value === "object");
}

function getProgramSchoolIds(program = {}) {
    const ids = [];

    [
        program?.id_sekolah,
        program?.sekolah_id,
        program?.school_id,
        program?.sekolah?.id_sekolah,
        program?.sekolah?.id,
        program?.school?.id_sekolah,
        program?.school?.id,
    ].forEach((value) => {
        if (value !== null && value !== undefined && value !== "") {
            ids.push(value);
        }
    });

    [
        program?.sekolah_ids,
        program?.school_ids,
        program?.target_sekolah_ids,
    ].forEach((value) => {
        if (Array.isArray(value)) ids.push(...value);
    });

    getProgramSchoolObjects(program).forEach((school) => {
        ids.push(getSchoolId(school));
    });

    return [...new Set(ids.map(normalizeId).filter(Boolean))];
}

function getProgramCategory(program = {}) {
    const value = normalizeValue(
        program?.kategori ||
        program?.kategori_program ||
        program?.category ||
        program?.jenis ||
        program?.bidang ||
        "",
    );

    if (
        value.includes("NON_AKADEMIK") ||
        value.includes("NONAKADEMIK") ||
        value === "NON"
    ) {
        return "NON_AKADEMIK";
    }

    if (value.includes("AKADEMIK")) return "AKADEMIK";

    return "LAINNYA";
}

function getProgramCategoryLabel(value) {
    if (value === "AKADEMIK") return "Akademik";
    if (value === "NON_AKADEMIK") return "Non Akademik";
    return "Belum Dikategorikan";
}

function getProgramPillar(program = {}) {
    const value = normalizeValue(
        program?.pilar_program ||
        program?.pilarProgram ||
        program?.pilar ||
        program?.kategori_pilar ||
        program?.kategoriPilar ||
        program?.sub_kategori ||
        program?.subKategori ||
        program?.subkategori ||
        program?.jenis_non_akademik ||
        program?.program_pilar ||
        program?.bidang_program ||
        "",
    );

    if (
        value.includes("KECAKAPAN") ||
        value.includes("LIFE_SKILL") ||
        value.includes("LIFESKILL")
    ) {
        return "KECAKAPAN_HIDUP";
    }

    if (value.includes("SENI") || value.includes("BUDAYA")) {
        return "SENI_BUDAYA";
    }

    if (
        value.includes("KARAKTER") ||
        value.includes("CHARACTER") ||
        value.includes("BUDI_PEKERTI")
    ) {
        return "KARAKTER";
    }

    if (value.includes("AKADEMIK")) return "AKADEMIK";

    if (getProgramCategory(program) === "AKADEMIK") return "AKADEMIK";

    return "LAINNYA";
}

function getProgramPillarLabel(value) {
    if (value === "AKADEMIK") return "Akademik";
    if (value === "KARAKTER") return "Karakter";
    if (value === "SENI_BUDAYA") return "Seni Budaya";
    if (value === "KECAKAPAN_HIDUP") return "Kecakapan Hidup";
    return "Pilar Lainnya";
}

function getProgramStatus(program = {}) {
    const value = normalizeValue(
        program?.status_program ||
        program?.status ||
        program?.fase_status ||
        "BERJALAN",
    );

    if (value.includes("APPROVAL")) return "APPROVAL";
    if (value.includes("SOSIALISASI")) return "SOSIALISASI";
    if (value.includes("IMPLEMENTASI")) return "IMPLEMENTASI";
    if (value.includes("EVALUASI")) return "EVALUASI";
    if (
        value.includes("SELESAI") ||
        value.includes("DONE") ||
        value.includes("COMPLETED")
    ) {
        return "SELESAI";
    }

    return value || "BERJALAN";
}

function formatStatusLabel(value) {
    return normalizeText(String(value || "").replaceAll("_", " "))
        .toLowerCase()
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getArray(...values) {
    return values.find((value) => Array.isArray(value)) || [];
}

function getRequirementFile(requirement = {}) {
    return (
        requirement?.file ||
        requirement?.file_url ||
        requirement?.file_path ||
        requirement?.path ||
        requirement?.dokumen ||
        requirement?.bukti ||
        null
    );
}

function getRequirementStatus(requirement = {}) {
    const currentStatus = normalizeValue(requirement?.status);

    if (currentStatus === "APPROVED") return "APPROVED";
    if (currentStatus === "WAITING_AO") return "WAITING_AO";
    if (currentStatus === "WAITING_HO") return "WAITING_HO";
    if (currentStatus === "WAITING_UPLOAD") return "WAITING_UPLOAD";
    if (currentStatus === "REJECTED_AO") return "REJECTED_AO";
    if (currentStatus === "REJECTED_HO") return "REJECTED_HO";
    if (currentStatus === "REJECTED") return "REJECTED";

    if (getRequirementFile(requirement)) return "WAITING_AO";

    return "WAITING_UPLOAD";
}

function getProgramRequirements(program = {}) {
    const fases = getArray(
        program?.fases,
        program?.fase,
        program?.t_fase,
    );

    return fases.flatMap((fase) => {
        const terminList = getArray(
            fase?.termin,
            fase?.termins,
            fase?.t_termin,
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
            ),
        );

        const kegiatanRequirements = kegiatanList.flatMap((kegiatan) =>
            getArray(
                kegiatan?.persyaratan,
                kegiatan?.persyaratan_kegiatan,
                kegiatan?.requirements,
                kegiatan?.t_persyaratan_kegiatan,
            ),
        );

        return [...terminRequirements, ...kegiatanRequirements];
    });
}

function getProgramProgress(program = {}) {
    const requirements = getProgramRequirements(program);
    const total = requirements.length;

    const waitingAo = requirements.filter(
        (item) => getRequirementStatus(item) === "WAITING_AO",
    ).length;

    const waitingHo = requirements.filter(
        (item) => getRequirementStatus(item) === "WAITING_HO",
    ).length;

    const approved = requirements.filter(
        (item) => getRequirementStatus(item) === "APPROVED",
    ).length;

    const rejected = requirements.filter((item) =>
        ["REJECTED", "REJECTED_AO", "REJECTED_HO"].includes(
            getRequirementStatus(item),
        ),
    ).length;

    const waitingUpload = requirements.filter(
        (item) => getRequirementStatus(item) === "WAITING_UPLOAD",
    ).length;

    return {
        total,
        waitingAo,
        waitingHo,
        approved,
        rejected,
        waitingUpload,
        percentage: total ? Math.round((approved / total) * 100) : 0,
    };
}

function getProgramStatusColor(status) {
    if (status === "SELESAI") {
        return {
            background: "#ECFDF5",
            border: "#A7F3D0",
            color: "#059669",
        };
    }

    if (status === "EVALUASI") {
        return {
            background: "#FFF7ED",
            border: "#FED7AA",
            color: "#EA580C",
        };
    }

    if (status === "IMPLEMENTASI") {
        return {
            background: "#EFF6FF",
            border: "#BFDBFE",
            color: "#2563EB",
        };
    }

    if (status === "SOSIALISASI") {
        return {
            background: "#F5F3FF",
            border: "#DDD6FE",
            color: "#7C3AED",
        };
    }

    return {
        background: "#ECFEFF",
        border: "#A5F3FC",
        color: "#0891B2",
    };
}

function buildProgramSchoolRows(program, scopedSchoolMap, wilayahMap) {
    const result = [];
    const used = new Set();

    const pushSchool = (school) => {
        const id = normalizeId(getSchoolId(school));
        const name = getSchoolName(school);

        const identity = id || name.toLowerCase();
        if (!identity || used.has(identity)) return;

        used.add(identity);

        const canonical =
            (id && scopedSchoolMap.get(id)) ||
            school;

        const geo = resolveSchoolGeo(canonical, wilayahMap);

        result.push({
            id: normalizeId(getSchoolId(canonical)),
            name: getSchoolName(canonical),
            districtId: geo.districtId,
            districtName: geo.districtName,
            provinceId: geo.provinceId,
            provinceName: geo.provinceName,
        });
    };

    getProgramSchoolObjects(program).forEach(pushSchool);

    [
        program?.sekolah,
        program?.school,
    ].forEach((school) => {
        if (school && typeof school === "object") pushSchool(school);
    });

    getProgramSchoolIds(program).forEach((id) => {
        const school = scopedSchoolMap.get(String(id));
        if (school) pushSchool(school);
    });

    return result;
}

function isProgramVisibleToAo(
    program,
    aoUserId,
    scopedSchoolIds,
    scopedSchoolMap,
    wilayahMap,
) {
    const aoIds = getProgramAoIds(program);
    const assignedToCurrentAo = aoIds.includes(String(aoUserId));
    const hasExplicitAoAssignment = aoIds.length > 0;

    const schoolIds = getProgramSchoolIds(program);
    const schoolRows = buildProgramSchoolRows(
        program,
        scopedSchoolMap,
        wilayahMap,
    );

    const overlapsProvince =
        schoolIds.some((id) => scopedSchoolIds.has(String(id))) ||
        schoolRows.some((school) =>
            school.id ? scopedSchoolIds.has(String(school.id)) : false,
        );

    if (hasExplicitAoAssignment) {
        if (!assignedToCurrentAo) return false;

        /*
         * Program yang memang ditugaskan ke AO tetap dipertahankan ketika
         * relasi sekolah pada endpoint list belum lengkap. Setelah detail
         * berhasil dimuat, relasi sekolah akan digunakan untuk filter.
         */
        return overlapsProvince || schoolIds.length === 0;
    }

    /*
     * Fallback untuk payload lama yang belum membawa relasi AO:
     * program hanya boleh masuk apabila sekolahnya berada di provinsi AO.
     */
    return overlapsProvince;
}

function getProgramSchoolNames(program, scopedSchoolMap, wilayahMap) {
    const rows = buildProgramSchoolRows(
        program,
        scopedSchoolMap,
        wilayahMap,
    );

    if (rows.length) return rows.map((row) => row.name).join(", ");

    return normalizeText(
        program?.nama_sekolah ||
        program?.sekolah_nama ||
        "-",
    );
}

function getProgramDistrictNames(program, scopedSchoolMap, wilayahMap) {
    return uniqueStrings(
        buildProgramSchoolRows(program, scopedSchoolMap, wilayahMap).map(
            (row) => row.districtName,
        ),
    );
}

function MetricCard({ label, value, helper, icon, color }) {
    return (
        <article
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            style={{ borderTopColor: color, borderTopWidth: 3 }}
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p
                        className="text-[10px] font-black uppercase tracking-[0.16em]"
                        style={{ color }}
                    >
                        {label}
                    </p>

                    <p className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-900">
                        {value}
                    </p>

                    <p className="mt-2 text-[11px] font-semibold text-slate-400">
                        {helper}
                    </p>
                </div>

                <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{
                        backgroundColor: `${color}14`,
                        color,
                    }}
                >
                    {icon}
                </div>
            </div>
        </article>
    );
}

function PanelHeader({ eyebrow, title, subtitle, icon, right }) {
    return (
        <header className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-[#0AC4E0]">
                    {icon}
                </div>

                <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0AC4E0]">
                        {eyebrow}
                    </p>
                    <h2 className="mt-1 text-[18px] font-black text-slate-900">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="mt-1 text-[11px] font-semibold leading-5 text-slate-400">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {right}
        </header>
    );
}

function EmptyState({ title, description, icon }) {
    return (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-300 shadow-sm">
                {icon || <FolderOpen size={22} />}
            </div>

            <p className="mt-3 text-sm font-black text-slate-700">{title}</p>
            <p className="mt-1 max-w-md text-[11px] font-semibold leading-5 text-slate-400">
                {description}
            </p>
        </div>
    );
}

function Pagination({
    page,
    totalPages,
    totalRows,
    pageSize = PAGE_SIZE,
    onChange,
}) {
    const safeTotalPages = Math.max(1, totalPages);
    const start = totalRows ? (page - 1) * pageSize + 1 : 0;
    const end = Math.min(page * pageSize, totalRows);

    return (
        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] font-bold text-slate-400">
                Menampilkan {start}-{end} dari {totalRows} data
            </p>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onChange(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black text-slate-500 transition hover:border-[#0AC4E0] hover:text-[#0AC4E0] disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ChevronLeft size={14} />
                    Prev
                </button>

                <span className="flex h-9 min-w-20 items-center justify-center rounded-xl bg-slate-900 px-3 text-[10px] font-black text-white">
                    {page} / {safeTotalPages}
                </span>

                <button
                    type="button"
                    onClick={() =>
                        onChange(Math.min(safeTotalPages, page + 1))
                    }
                    disabled={page >= safeTotalPages}
                    className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black text-slate-500 transition hover:border-[#0AC4E0] hover:text-[#0AC4E0] disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Next
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
}

function FilterSelect({ label, value, onChange, options }) {
    return (
        <label className="flex min-w-[180px] flex-col gap-1.5">
            <span className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                {label}
            </span>

            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-600 outline-none transition focus:border-[#0AC4E0] focus:ring-2 focus:ring-[#0AC4E0]/10"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    );
}

function DistrictDropdown({ label, value, onChange, options = [] }) {
    const selectedOption =
        options.find((option) => String(option.value) === String(value)) ||
        options[0];

    return (
        <label className="flex min-w-0 flex-col gap-1.5 md:col-span-2 xl:col-span-2 2xl:col-span-2">
            <span className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                {label}
            </span>

            <div className="relative">
                <MapPin
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#0AC4E0]"
                />

                <select
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    title={selectedOption?.label || label}
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-10 text-[11px] font-bold text-slate-700 outline-none transition focus:border-[#0AC4E0] focus:ring-2 focus:ring-[#0AC4E0]/10"
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
            </div>

            <span
                className="min-h-[16px] break-words text-[10px] font-bold leading-4 text-slate-500"
                title={selectedOption?.label || ""}
            >
                {selectedOption?.label || "Semua Kabupaten/Kota"}
            </span>
        </label>
    );
}

function SearchInput({ value, onChange, placeholder }) {
    return (
        <label className="relative block min-w-[220px] flex-1">
            <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
            />
            <input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-[11px] font-semibold text-slate-600 outline-none transition placeholder:text-slate-300 focus:border-[#0AC4E0] focus:ring-2 focus:ring-[#0AC4E0]/10"
            />
        </label>
    );
}

function DistrictPieTooltip({ active, payload }) {
    if (!active || !payload?.length) return null;

    const row = payload[0]?.payload;

    return (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
            <p className="text-[11px] font-black text-slate-800">{row?.name}</p>
            <p className="mt-1 text-[10px] font-bold text-slate-500">
                {row?.total || 0} sekolah
            </p>
        </div>
    );
}

function SchoolDistributionChart({ rows, totalSchools }) {
    if (!rows.length) {
        return (
            <EmptyState
                title="Belum ada pemetaan sekolah"
                description="Data sekolah pada provinsi binaan AO belum ditemukan."
                icon={<MapPinned size={22} />}
            />
        );
    }

    return (
        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
            <div className="relative h-[300px] rounded-2xl border border-slate-100 bg-slate-50/50 p-3">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={rows}
                            dataKey="total"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={108}
                            paddingAngle={3}
                            stroke="#FFFFFF"
                            strokeWidth={3}
                        >
                            {rows.map((row) => (
                                <Cell
                                    key={row.key}
                                    fill={row.color}
                                />
                            ))}
                        </Pie>

                        <RechartsTooltip
                            content={<DistrictPieTooltip />}
                        />
                    </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                    <span className="text-4xl font-black tracking-[-0.06em] text-slate-900">
                        {totalSchools}
                    </span>
                    <span className="mt-1 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                        Sekolah
                    </span>
                </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto pr-1">
                <div className="grid gap-2 sm:grid-cols-2">
                    {rows.map((row) => (
                        <div
                            key={row.key}
                            className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3"
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                <span
                                    className="h-3 w-3 shrink-0 rounded-full"
                                    style={{ backgroundColor: row.color }}
                                />
                                <span className="truncate text-[11px] font-black text-slate-700">
                                    {row.name}
                                </span>
                            </div>

                            <span className="shrink-0 rounded-lg bg-slate-50 px-2.5 py-1 text-[10px] font-black text-slate-600">
                                {row.total}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function SchoolTable({
    rows,
    totalRows,
    page,
    totalPages,
    onPageChange,
}) {
    if (!totalRows) {
        return (
            <div className="p-5">
                <EmptyState
                    title="Sekolah tidak ditemukan"
                    description="Tidak ada sekolah yang sesuai dengan pencarian atau filter kabupaten."
                    icon={<School size={22} />}
                />
            </div>
        );
    }

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse">
                    <thead>
                        <tr className="border-y border-slate-100 bg-slate-50">
                            {[
                                "Sekolah",
                                "Jenjang",
                                "Kabupaten/Kota",
                                "Akreditasi",
                                "Status",
                            ].map((label) => (
                                <th
                                    key={label}
                                    className="px-4 py-3 text-center text-[9px] font-black uppercase tracking-[0.14em] text-slate-400"
                                >
                                    {label}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map((row) => (
                            <tr
                                key={row.id || row.name}
                                className="border-b border-slate-100 last:border-b-0 hover:bg-cyan-50/30"
                            >
                                <td className="px-4 py-4 text-left">
                                    <p className="max-w-[260px] truncate text-[12px] font-black text-slate-800">
                                        {row.name}
                                    </p>
                                    {row.npsn && (
                                        <p className="mt-1 text-[10px] font-semibold text-slate-400">
                                            NPSN {row.npsn}
                                        </p>
                                    )}
                                </td>

                                <td className="px-4 py-4 text-left">
                                    <span className="inline-flex rounded-lg bg-blue-50 px-2.5 py-1 text-[9px] font-black text-blue-600">
                                        {row.level}
                                    </span>
                                </td>

                                <td className="px-4 py-4 text-left">
                                    <p className="max-w-[220px] truncate text-[11px] font-bold text-slate-600">
                                        {row.districtName}
                                    </p>
                                </td>

                                <td className="px-4 py-4 text-left">
                                    <span className="text-[11px] font-black text-slate-600">
                                        {row.accreditation}
                                    </span>
                                </td>

                                <td className="px-4 py-4 text-left">
                                    <span
                                        className={`inline-flex rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-widest ${row.status === "Aktif"
                                                ? "bg-emerald-50 text-emerald-600"
                                                : "bg-slate-100 text-slate-500"
                                            }`}
                                    >
                                        {row.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination
                page={page}
                totalPages={totalPages}
                totalRows={totalRows}
                onChange={onPageChange}
            />
        </>
    );
}


function getStableChartColor(value) {
    const source = String(value || "sekolah");
    let hash = 0;

    for (let index = 0; index < source.length; index += 1) {
        hash = (hash * 31 + source.charCodeAt(index)) % 360;
    }

    return `hsl(${(hash + 185) % 360} 72% 52%)`;
}

function splitSchoolLabel(value, maxLength = 18, maxLines = 3) {
    const words = String(value || "Sekolah").split(/\s+/).filter(Boolean);
    const lines = [];
    let current = "";

    words.forEach((word) => {
        const candidate = current ? `${current} ${word}` : word;

        if (candidate.length <= maxLength || !current) {
            current = candidate;
            return;
        }

        lines.push(current);
        current = word;
    });

    if (current) lines.push(current);

    if (lines.length <= maxLines) return lines;

    const visible = lines.slice(0, maxLines);
    visible[maxLines - 1] = `${visible[maxLines - 1].slice(0, maxLength - 1)}"¦`;
    return visible;
}

function SchoolAxisTick({ x, y, payload }) {
    const lines = splitSchoolLabel(payload?.value);

    return (
        <g transform={`translate(${x},${y})`}>
            <text
                x={0}
                y={22}
                textAnchor="middle"
                fill="#64748B"
                fontSize={10}
                fontWeight={800}
            >
                {lines.map((line, index) => (
                    <tspan
                        key={`${line}-${index}`}
                        x={0}
                        dy={index === 0 ? 0 : 14}
                    >
                        {line}
                    </tspan>
                ))}
            </text>
        </g>
    );
}

function ProgramChartTooltip({ active, payload }) {
    if (!active || !payload?.length) return null;

    const row = payload[0]?.payload;

    return (
        <div className="max-w-[320px] rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
            <p className="text-[11px] font-black text-slate-800">
                {row?.fullName}
            </p>
            <p className="mt-1 text-[10px] font-bold text-slate-500">
                {row?.districtName}
            </p>

            <div className="mt-3 border-t border-slate-100 pt-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-[#0AC4E0]">
                    {row?.total || 0} Program
                </p>

                <div className="mt-2 space-y-1">
                    {(row?.programNames || []).slice(0, 6).map((name) => (
                        <p
                            key={name}
                            className="text-[10px] font-semibold leading-4 text-slate-500"
                        >
                            "- {name}
                        </p>
                    ))}

                    {(row?.programNames || []).length > 6 && (
                        <p className="text-[9px] font-bold text-slate-400">
                            +{row.programNames.length - 6} program lainnya
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

function SchoolProgramBarChart({ rows }) {
    if (!rows.length) {
        return (
            <EmptyState
                title="Belum ada program sesuai filter"
                description="Ubah filter kabupaten, sekolah, bidang, pilar, atau status program."
                icon={<BarChart3 size={22} />}
            />
        );
    }

    /*
     * Saat sekolah masih sedikit, diagram tetap memenuhi lebar panel.
     * Saat jumlah sekolah bertambah, lebar diagram mengikuti jumlah sekolah
     * sehingga pengguna dapat menggesernya secara horizontal tanpa batang bertubrukan.
     */
    const chartWidth = Math.max(rows.length * 190, 1);

    return (
        <div className="program-chart-scroll w-full overflow-x-auto overflow-y-hidden pb-3 pt-5">
            <div
                className="relative"
                style={{
                    width: chartWidth,
                    minWidth: "100%",
                    height: 430,
                }}
            >
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={rows}
                        barCategoryGap="35%"
                        margin={{
                            top: 28,
                            right: 24,
                            left: 8,
                            bottom: 8,
                        }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#E2E8F0"
                        />

                        <XAxis
                            dataKey="fullName"
                            interval={0}
                            height={72}
                            axisLine={{ stroke: "#CBD5E1" }}
                            tickLine={false}
                            tick={<SchoolAxisTick />}
                        />

                        <YAxis
                            allowDecimals={false}
                            axisLine={false}
                            tickLine={false}
                            width={35}
                            tick={{
                                fontSize: 10,
                                fontWeight: 800,
                                fill: "#94A3B8",
                            }}
                        />

                        <RechartsTooltip
                            cursor={{ fill: "rgba(10,196,224,0.04)" }}
                            content={<ProgramChartTooltip />}
                        />

                        <Bar
                            dataKey="total"
                            radius={[10, 10, 0, 0]}
                            maxBarSize={52}
                        >
                            {rows.map((row) => (
                                <Cell
                                    key={row.key}
                                    fill={row.color}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function ProgramTable({
    rows,
    totalRows,
    page,
    totalPages,
    onPageChange,
    navigate,
    detailPathPrefix,
    schoolMap,
    wilayahMap,
}) {
    if (!totalRows) {
        return (
            <div className="p-5">
                <EmptyState
                    title="Program tidak ditemukan"
                    description="Tidak ada program yang sesuai dengan kombinasi filter saat ini."
                    icon={<FolderOpen size={22} />}
                />
            </div>
        );
    }

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1180px] border-collapse">
                    <thead>
                        <tr className="border-y border-slate-100 bg-slate-50">
                            {[
                                "Program",
                                "Sekolah",
                                "Kabupaten/Kota",
                                "Bidang",
                                "Pilar",
                                "Status",
                                "Progress",
                                "Detail",
                            ].map((label) => (
                                <th
                                    key={label}
                                    className="px-4 py-3 text-center text-[9px] font-black uppercase tracking-[0.14em] text-slate-400"
                                >
                                    {label}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map((program) => {
                            const progress = getProgramProgress(program);
                            const status = getProgramStatus(program);
                            const style = getProgramStatusColor(status);
                            const schoolNames = getProgramSchoolNames(
                                program,
                                schoolMap,
                                wilayahMap,
                            );
                            const districtNames = getProgramDistrictNames(
                                program,
                                schoolMap,
                                wilayahMap,
                            );

                            return (
                                <tr
                                    key={getProgramId(program)}
                                    className="border-b border-slate-100 last:border-b-0 hover:bg-cyan-50/30"
                                >
                                    <td className="px-4 py-4 text-left">
                                        <p className="max-w-[260px] truncate text-[12px] font-black text-slate-800">
                                            {getProgramTitle(program)}
                                        </p>
                                        <p className="mt-1 text-[10px] font-semibold text-slate-400">
                                            Tahun {program?.tahun || "-"}
                                        </p>
                                    </td>

                                    <td className="px-4 py-4 text-left">
                                        <p className="max-w-[250px] truncate text-[11px] font-bold text-slate-600">
                                            {schoolNames}
                                        </p>
                                    </td>

                                    <td className="px-4 py-4 text-left">
                                        <p className="max-w-[220px] truncate text-[11px] font-bold text-slate-600">
                                            {districtNames.join(", ") || "-"}
                                        </p>
                                    </td>

                                    <td className="px-4 py-4 text-left">
                                        <span className="inline-flex rounded-full bg-cyan-50 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-cyan-700">
                                            {getProgramCategoryLabel(
                                                getProgramCategory(program),
                                            )}
                                        </span>
                                    </td>

                                    <td className="px-4 py-4 text-left">
                                        <span className="inline-flex rounded-full bg-violet-50 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-violet-600">
                                            {getProgramPillarLabel(
                                                getProgramPillar(program),
                                            )}
                                        </span>
                                    </td>

                                    <td className="px-4 py-4 text-left">
                                        <span
                                            className="inline-flex rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-widest"
                                            style={{
                                                backgroundColor: style.background,
                                                borderColor: style.border,
                                                color: style.color,
                                            }}
                                        >
                                            {formatStatusLabel(status)}
                                        </span>
                                    </td>

                                    <td className="px-4 py-4 text-left">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className="h-full rounded-full bg-[#0AC4E0]"
                                                    style={{
                                                        width: `${progress.percentage}%`,
                                                    }}
                                                />
                                            </div>

                                            <span className="text-[10px] font-black text-slate-600">
                                                {progress.percentage}%
                                            </span>
                                        </div>

                                        {progress.waitingAo > 0 && (
                                            <p className="mt-1 text-[9px] font-bold text-amber-600">
                                                {progress.waitingAo} menunggu review AO
                                            </p>
                                        )}
                                    </td>

                                    <td className="px-4 py-4 text-center">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate(
                                                    `${detailPathPrefix}/${getProgramId(
                                                        program,
                                                    )}`,
                                                )
                                            }
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:border-[#0AC4E0] hover:text-[#0AC4E0]"
                                            title="Lihat detail program"
                                        >
                                            <Eye size={15} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <Pagination
                page={page}
                totalPages={totalPages}
                totalRows={totalRows}
                onChange={onPageChange}
            />
        </>
    );
}

function LoadingView() {
    return (
        <PageWrapper className="flex min-h-screen items-center justify-center bg-slate-100 !p-0">
            <div className="flex flex-col items-center gap-4">
                <div className="h-11 w-11 animate-spin rounded-full border-4 border-[#0AC4E0] border-t-transparent" />
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                    Memuat Dashboard AO
                </p>
            </div>
        </PageWrapper>
    );
}

function AODashboardPage({
    title = "Dashboard Area Officer",
    detailPathPrefix = "/ao/program/detail",
}) {
    const navigate = useNavigate();

    const [currentUser, setCurrentUser] = useState(null);
    const [aoScope, setAoScope] = useState({
        provinceIds: new Set(),
        provinceNames: new Set(),
        provinceLabels: [],
        hasScope: false,
    });

    const [wilayahRows, setWilayahRows] = useState([]);
    const [schools, setSchools] = useState([]);
    const [programs, setPrograms] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [schoolDistrictFilter, setSchoolDistrictFilter] = useState("ALL");
    const [schoolSearch, setSchoolSearch] = useState("");
    const [schoolPage, setSchoolPage] = useState(1);

    const [programDistrictFilter, setProgramDistrictFilter] = useState("ALL");
    const [programSchoolFilter, setProgramSchoolFilter] = useState("ALL");
    const [programCategoryFilter, setProgramCategoryFilter] = useState("ALL");
    const [programPillarFilter, setProgramPillarFilter] = useState("ALL");
    const [programStatusFilter, setProgramStatusFilter] = useState("ALL");
    const [programSearch, setProgramSearch] = useState("");
    const [programPage, setProgramPage] = useState(1);

    const fetchAoData = async ({ silent = false } = {}) => {
        if (silent) setRefreshing(true);
        else setLoading(true);

        setErrorMessage("");

        try {
            const token = localStorage.getItem("token");
            const tokenPayload = getTokenPayload();

            if (!token || !tokenPayload) {
                navigate("/login");
                return;
            }

            const aoUserId = getUserId(tokenPayload);

            if (!aoUserId) {
                throw new Error("Identitas Area Officer tidak ditemukan pada token");
            }

            const headers = {
                Authorization: `Bearer ${token}`,
            };

            const [
                profileResult,
                wilayahResult,
                wilayahTreeResult,
                schoolResult,
                programResult,
            ] = await Promise.allSettled([
                fetchFirst(
                    [
                        `/users/${aoUserId}`,
                        `/users/ao/${aoUserId}`,
                    ],
                    headers,
                ),
                fetchFirst(
                    [
                        "/wilayah",
                        "/wilayah/tree",
                        "/wilayah/provinsi",
                    ],
                    headers,
                ),
                fetchFirst(
                    [
                        "/wilayah/tree",
                        "/wilayah",
                    ],
                    headers,
                ),
                fetchFirst(
                    [
                        "/sekolah",
                    ],
                    headers,
                ),
                fetchFirst(
                    [
                        "/program",
                    ],
                    headers,
                ),
            ]);

            const profilePayload =
                profileResult.status === "fulfilled"
                    ? profileResult.value
                    : tokenPayload;

            const profile =
                profilePayload?.data ||
                profilePayload?.user ||
                profilePayload ||
                tokenPayload;

            const wilayahPrimary =
                wilayahResult.status === "fulfilled"
                    ? flattenTree(normalizeArray(wilayahResult.value))
                    : [];

            const wilayahTree =
                wilayahTreeResult.status === "fulfilled"
                    ? flattenTree(normalizeArray(wilayahTreeResult.value))
                    : [];

            const mergedWilayah = uniqueBy(
                [...wilayahPrimary, ...wilayahTree],
                getWilayahId,
            );

            const wilayahMap = buildWilayahMap(mergedWilayah);
            const nextAoScope = getAoScope(
                profile,
                tokenPayload,
                wilayahMap,
            );

            const allSchools =
                schoolResult.status === "fulfilled"
                    ? normalizeArray(schoolResult.value)
                    : [];

            const scopedSchools = nextAoScope.hasScope
                ? allSchools.filter((school) =>
                    schoolBelongsToAoProvince(
                        school,
                        nextAoScope,
                        wilayahMap,
                    ),
                )
                : [];

            const scopedSchoolMap = new Map(
                scopedSchools
                    .map((school) => [
                        normalizeId(getSchoolId(school)),
                        school,
                    ])
                    .filter(([id]) => id),
            );

            const scopedSchoolIds = new Set(scopedSchoolMap.keys());

            const programList =
                programResult.status === "fulfilled"
                    ? normalizeArray(programResult.value)
                    : [];

            /*
             * Detail dipanggil agar relasi AO, sekolah, fase, termin,
             * kegiatan, dan persyaratan tidak tertinggal dari dashboard.
             */
            const detailedPrograms = await mapWithConcurrency(
                programList,
                6,
                async (program) => {
                    const id = getProgramId(program);
                    if (!id) return program;

                    try {
                        const detailPayload = await fetchJson(
                            `${API_BASE_URL}/program/${id}`,
                            headers,
                        );

                        const detail =
                            detailPayload?.data ||
                            detailPayload?.program ||
                            detailPayload;

                        return {
                            ...program,
                            ...(detail || {}),
                        };
                    } catch {
                        return program;
                    }
                },
            );

            const visiblePrograms = detailedPrograms.filter((program) =>
                isProgramVisibleToAo(
                    program,
                    aoUserId,
                    scopedSchoolIds,
                    scopedSchoolMap,
                    wilayahMap,
                ),
            );

            setCurrentUser({
                ...tokenPayload,
                ...profile,
            });
            setAoScope(nextAoScope);
            setWilayahRows(mergedWilayah);
            setSchools(scopedSchools);
            setPrograms(visiblePrograms);

            setSchoolDistrictFilter("ALL");
            setSchoolSearch("");
            setSchoolPage(1);

            setProgramDistrictFilter("ALL");
            setProgramSchoolFilter("ALL");
            setProgramCategoryFilter("ALL");
            setProgramPillarFilter("ALL");
            setProgramStatusFilter("ALL");
            setProgramSearch("");
            setProgramPage(1);

            if (!nextAoScope.hasScope) {
                setErrorMessage(
                    "Provinsi binaan AO belum terhubung pada profil pengguna. Dashboard sengaja tidak menampilkan seluruh data untuk mencegah kebocoran lintas wilayah.",
                );
            } else if (
                schoolResult.status === "rejected" ||
                programResult.status === "rejected"
            ) {
                setErrorMessage(
                    "Sebagian endpoint belum berhasil dimuat. Tekan Refresh setelah backend aktif.",
                );
            }
        } catch (error) {
            console.error("AODashboardPage Error:", error);
            setErrorMessage(
                error?.message ||
                "Gagal memuat dashboard Area Officer",
            );
            toast.error(
                error?.message ||
                "Gagal memuat dashboard Area Officer",
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAoData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const wilayahMap = useMemo(
        () => buildWilayahMap(wilayahRows),
        [wilayahRows],
    );

    const normalizedSchools = useMemo(
        () =>
            schools
                .map((school) => {
                    const geo = resolveSchoolGeo(school, wilayahMap);

                    return {
                        raw: school,
                        id: normalizeId(getSchoolId(school)),
                        name: getSchoolName(school),
                        npsn: normalizeText(school?.npsn),
                        level: getSchoolLevel(school),
                        accreditation: getSchoolAccreditation(school),
                        status: getSchoolStatus(school),
                        districtId: geo.districtId,
                        districtName: geo.districtName,
                        provinceId: geo.provinceId,
                        provinceName: geo.provinceName,
                        totalStudents: Number(
                            school?.jumlah_siswa ||
                            school?.total_siswa ||
                            0,
                        ),
                        totalTeachers: Number(
                            school?.jumlah_guru ||
                            school?.total_guru ||
                            0,
                        ),
                    };
                })
                .sort((a, b) => a.name.localeCompare(b.name)),
        [schools, wilayahMap],
    );

    const districtRows = useMemo(() => {
        const map = new Map();

        wilayahRows.forEach((wilayah) => {
            if (!isDistrict(wilayah)) return;

            const province = findProvinceRowByWilayahId(
                getWilayahId(wilayah),
                wilayahMap,
            );

            const provinceId = normalizeId(getWilayahId(province));
            const provinceName = getWilayahName(province).toLowerCase();
            const belongsToAo =
                (provinceId && aoScope.provinceIds.has(provinceId)) ||
                (provinceName && aoScope.provinceNames.has(provinceName));

            if (!belongsToAo) return;

            const districtId = normalizeId(getWilayahId(wilayah));
            const districtName =
                getWilayahName(wilayah) || "Kabupaten/Kota belum dinamai";
            const key = districtId || districtName.toLowerCase();

            map.set(key, {
                key,
                id: districtId,
                name: districtName,
                total: 0,
                schools: [],
            });
        });

        normalizedSchools.forEach((school) => {
            const key =
                school.districtId ||
                school.districtName.toLowerCase();

            if (!map.has(key)) {
                map.set(key, {
                    key,
                    id: school.districtId,
                    name: school.districtName,
                    total: 0,
                    schools: [],
                });
            }

            map.get(key).total += 1;
            map.get(key).schools.push(school);
        });

        return Array.from(map.values())
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((row, index) => ({
                ...row,
                color:
                    DISTRICT_CHART_COLORS[
                    index % DISTRICT_CHART_COLORS.length
                    ],
            }));
    }, [
        wilayahRows,
        wilayahMap,
        aoScope,
        normalizedSchools,
    ]);

    const schoolDistrictOptions = useMemo(
        () => [
            {
                value: "ALL",
                label: `Semua Kabupaten/Kota (${normalizedSchools.length})`,
            },
            ...districtRows.map((row) => ({
                value: row.key,
                label: `${row.name} (${row.total})`,
            })),
        ],
        [districtRows, normalizedSchools.length],
    );

    const filteredSchools = useMemo(() => {
        const keyword = schoolSearch.toLowerCase().trim();

        return normalizedSchools.filter((school) => {
            const districtKey =
                school.districtId ||
                school.districtName.toLowerCase();

            const matchDistrict =
                schoolDistrictFilter === "ALL" ||
                districtKey === schoolDistrictFilter;

            const matchSearch = [
                school.name,
                school.npsn,
                school.level,
                school.districtName,
                school.accreditation,
            ]
                .join(" ")
                .toLowerCase()
                .includes(keyword);

            return matchDistrict && matchSearch;
        });
    }, [
        normalizedSchools,
        schoolDistrictFilter,
        schoolSearch,
    ]);

    const schoolTotalPages = Math.max(
        1,
        Math.ceil(filteredSchools.length / PAGE_SIZE),
    );

    const schoolPageRows = useMemo(() => {
        const start = (schoolPage - 1) * PAGE_SIZE;
        return filteredSchools.slice(start, start + PAGE_SIZE);
    }, [filteredSchools, schoolPage]);

    useEffect(() => {
        if (schoolPage > schoolTotalPages) {
            setSchoolPage(schoolTotalPages);
        }
    }, [schoolPage, schoolTotalPages]);

    const scopedSchoolMap = useMemo(
        () =>
            new Map(
                normalizedSchools
                    .map((school) => [school.id, school.raw])
                    .filter(([id]) => id),
            ),
        [normalizedSchools],
    );

    const programSchoolRowsMap = useMemo(() => {
        const map = new Map();

        programs.forEach((program) => {
            map.set(
                String(getProgramId(program)),
                buildProgramSchoolRows(
                    program,
                    scopedSchoolMap,
                    wilayahMap,
                ),
            );
        });

        return map;
    }, [programs, scopedSchoolMap, wilayahMap]);

    const programSchoolOptions = useMemo(() => {
        const districtSchools = normalizedSchools.filter((school) => {
            if (programDistrictFilter === "ALL") return true;

            const districtKey =
                school.districtId || school.districtName.toLowerCase();

            return districtKey === programDistrictFilter;
        });

        return [
            {
                value: "ALL",
                label: `Semua Sekolah (${districtSchools.length})`,
            },
            ...districtSchools.map((school) => ({
                value: school.id,
                label: `${school.name} - ${school.districtName}`,
            })),
        ];
    }, [normalizedSchools, programDistrictFilter]);

    const programDistrictOptions = useMemo(
        () => [
            {
                value: "ALL",
                label: `Semua Kabupaten/Kota (${districtRows.length})`,
            },
            ...districtRows.map((row) => ({
                value: row.key,
                label: `${row.name} (${row.total} sekolah)`,
            })),
        ],
        [districtRows],
    );

    const programStatusOptions = useMemo(() => {
        const statuses = [
            ...new Set(programs.map(getProgramStatus)),
        ].sort((a, b) => {
            const aIndex = PROGRAM_STATUS_ORDER.indexOf(a);
            const bIndex = PROGRAM_STATUS_ORDER.indexOf(b);

            if (aIndex === -1 && bIndex === -1) {
                return a.localeCompare(b);
            }

            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
        });

        return [
            {
                value: "ALL",
                label: "Semua Status Program",
            },
            ...statuses.map((status) => ({
                value: status,
                label: formatStatusLabel(status),
            })),
        ];
    }, [programs]);

    const filteredPrograms = useMemo(() => {
        const keyword = programSearch.toLowerCase().trim();

        return programs
            .filter((program) => {
                const programId = String(getProgramId(program));
                const linkedSchools =
                    programSchoolRowsMap.get(programId) || [];

                const matchDistrict =
                    programDistrictFilter === "ALL" ||
                    linkedSchools.some((school) => {
                        const key =
                            school.districtId ||
                            school.districtName.toLowerCase();

                        return key === programDistrictFilter;
                    });

                const matchSchool =
                    programSchoolFilter === "ALL" ||
                    linkedSchools.some(
                        (school) =>
                            String(school.id) ===
                            String(programSchoolFilter),
                    );

                const matchCategory =
                    programCategoryFilter === "ALL" ||
                    getProgramCategory(program) ===
                    programCategoryFilter;

                const matchPillar =
                    programPillarFilter === "ALL" ||
                    getProgramPillar(program) ===
                    programPillarFilter;

                const matchStatus =
                    programStatusFilter === "ALL" ||
                    getProgramStatus(program) ===
                    programStatusFilter;

                const matchSearch = [
                    getProgramTitle(program),
                    getProgramCategoryLabel(getProgramCategory(program)),
                    getProgramPillarLabel(getProgramPillar(program)),
                    formatStatusLabel(getProgramStatus(program)),
                    ...linkedSchools.map((school) => school.name),
                    ...linkedSchools.map((school) => school.districtName),
                ]
                    .join(" ")
                    .toLowerCase()
                    .includes(keyword);

                return (
                    matchDistrict &&
                    matchSchool &&
                    matchCategory &&
                    matchPillar &&
                    matchStatus &&
                    matchSearch
                );
            })
            .sort((a, b) => {
                const waitingA = getProgramProgress(a).waitingAo;
                const waitingB = getProgramProgress(b).waitingAo;

                if (waitingA !== waitingB) return waitingB - waitingA;

                return getProgramTitle(a).localeCompare(
                    getProgramTitle(b),
                );
            });
    }, [
        programs,
        programSchoolRowsMap,
        programDistrictFilter,
        programSchoolFilter,
        programCategoryFilter,
        programPillarFilter,
        programStatusFilter,
        programSearch,
    ]);

    const programTotalPages = Math.max(
        1,
        Math.ceil(filteredPrograms.length / PAGE_SIZE),
    );

    const programPageRows = useMemo(() => {
        const start = (programPage - 1) * PAGE_SIZE;
        return filteredPrograms.slice(start, start + PAGE_SIZE);
    }, [filteredPrograms, programPage]);

    useEffect(() => {
        if (programPage > programTotalPages) {
            setProgramPage(programTotalPages);
        }
    }, [programPage, programTotalPages]);

    const schoolProgramChartRows = useMemo(() => {
        const counter = new Map();

        filteredPrograms.forEach((program) => {
            const programId = String(getProgramId(program));
            const linkedSchools =
                programSchoolRowsMap.get(programId) || [];

            linkedSchools.forEach((school) => {
                const key =
                    school.id ||
                    school.name.toLowerCase();

                if (!counter.has(key)) {
                    counter.set(key, {
                        key,
                        fullName: school.name,
                        shortName:
                            school.name.length > 22
                                ? `${school.name.slice(0, 20)}"¦`
                                : school.name,
                        districtId: school.districtId,
                        districtName: school.districtName,
                        total: 0,
                        programNames: [],
                    });
                }

                const row = counter.get(key);
                row.total += 1;
                row.programNames.push(getProgramTitle(program));
            });
        });

        return Array.from(counter.values())
            .sort(
                (a, b) =>
                    b.total - a.total ||
                    a.fullName.localeCompare(b.fullName),
            )
            .map((row, index) => ({
                ...row,
                programNames: uniqueStrings(row.programNames),
                color:
                    SCHOOL_BAR_COLORS[
                    index % SCHOOL_BAR_COLORS.length
                    ],
            }));
    }, [
        filteredPrograms,
        programSchoolRowsMap,
    ]);

    const totals = useMemo(() => {
        const requirementStats = programs.reduce(
            (acc, program) => {
                const progress = getProgramProgress(program);

                acc.waitingAo += progress.waitingAo;
                acc.approved += progress.approved;
                acc.total += progress.total;

                return acc;
            },
            {
                waitingAo: 0,
                approved: 0,
                total: 0,
            },
        );

        return {
            schools: normalizedSchools.length,
            districts: districtRows.length,
            programs: programs.length,
            waitingAo: requirementStats.waitingAo,
        };
    }, [programs, normalizedSchools.length, districtRows.length]);

    const activeProgramFilterCount = [
        programDistrictFilter,
        programSchoolFilter,
        programCategoryFilter,
        programPillarFilter,
        programStatusFilter,
    ].filter((value) => value !== "ALL").length + (programSearch ? 1 : 0);

    const resetProgramFilters = () => {
        setProgramDistrictFilter("ALL");
        setProgramSchoolFilter("ALL");
        setProgramCategoryFilter("ALL");
        setProgramPillarFilter("ALL");
        setProgramStatusFilter("ALL");
        setProgramSearch("");
        setProgramPage(1);
    };

    if (loading) return <LoadingView />;

    const provinceLabel =
        aoScope.provinceLabels.join(", ") ||
        normalizeText(
            currentUser?.nama_provinsi ||
            currentUser?.provinsi ||
            "Provinsi belum dipetakan",
        );

    return (
        <PageWrapper className="min-h-screen bg-slate-100 !p-0 font-sans text-slate-700">
            <Sidebar />

            <main className="min-h-screen w-full pt-[76px]">
                <header className="border-b border-slate-200 bg-white">
                    <div className="flex w-full flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                        <div className="flex min-w-0 items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0AC4E0] text-white shadow-[0_12px_26px_rgba(10,196,224,0.22)]">
                                <MapPinned size={22} />
                            </div>

                            <div className="min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#0AC4E0]">
                                    Area Officer · Wilayah Binaan
                                </p>
                                <h1 className="mt-1 truncate text-2xl font-black tracking-[-0.04em] text-slate-900">
                                    {title}
                                </h1>
                                <p className="mt-1 text-[11px] font-semibold text-slate-400">
                                    {currentUser?.nama ||
                                        currentUser?.name ||
                                        currentUser?.email ||
                                        "Area Officer"}{" "}
                                    · {provinceLabel}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => fetchAoData({ silent: true })}
                            disabled={refreshing}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 transition hover:border-[#0AC4E0] hover:text-[#0AC4E0] disabled:cursor-wait disabled:opacity-60"
                        >
                            <RefreshCcw
                                size={14}
                                className={refreshing ? "animate-spin" : ""}
                            />
                            {refreshing ? "Memuat" : "Refresh"}
                        </button>
                    </div>
                </header>

                <section className="w-full space-y-6 px-5 py-6 lg:px-8">
                    {errorMessage && (
                        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-700">
                            <AlertTriangle
                                size={18}
                                className="mt-0.5 shrink-0"
                            />
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-widest">
                                    Perhatian
                                </p>
                                <p className="mt-1 text-[11px] font-semibold leading-5">
                                    {errorMessage}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <MetricCard
                            label="Sekolah Binaan"
                            value={totals.schools}
                            helper={`Dalam ${provinceLabel}`}
                            icon={<School size={19} />}
                            color={COLORS.blue}
                        />
                        <MetricCard
                            label="Kabupaten/Kota"
                            value={totals.districts}
                            helper="Terdaftar pada provinsi binaan"
                            icon={<Building2 size={19} />}
                            color={COLORS.violet}
                        />
                        <MetricCard
                            label="Program Terbaca"
                            value={totals.programs}
                            helper="Program dalam cakupan AO"
                            icon={<FolderOpen size={19} />}
                            color={COLORS.emerald}
                        />
                        <MetricCard
                            label="Menunggu Review AO"
                            value={totals.waitingAo}
                            helper="Bukti yang perlu ditindaklanjuti"
                            icon={<Clock3 size={19} />}
                            color={COLORS.amber}
                        />
                    </div>

                    <section className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-sm">
                        <PanelHeader
                            eyebrow="Pemetaan Wilayah"
                            title="Distribusi Sekolah per Kabupaten/Kota"
                            subtitle={`Seluruh kabupaten/kota yang didaftarkan Admin pada ${provinceLabel}, termasuk wilayah yang belum memiliki sekolah binaan.`}
                            icon={<MapPin size={18} />}
                        />

                        <div className="grid gap-6 p-5 xl:grid-cols-[0.9fr_1.1fr]">
                            <div>
                                <SchoolDistributionChart
                                    rows={districtRows}
                                    totalSchools={normalizedSchools.length}
                                />
                            </div>

                            <div className="overflow-hidden rounded-2xl border border-slate-100">
                                <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
                                    <SearchInput
                                        value={schoolSearch}
                                        onChange={(value) => {
                                            setSchoolSearch(value);
                                            setSchoolPage(1);
                                        }}
                                        placeholder="Cari nama sekolah, NPSN, jenjang..."
                                    />

                                    <FilterSelect
                                        label="Kabupaten/Kota"
                                        value={schoolDistrictFilter}
                                        onChange={(value) => {
                                            setSchoolDistrictFilter(value);
                                            setSchoolPage(1);
                                        }}
                                        options={schoolDistrictOptions}
                                    />
                                </div>

                                <SchoolTable
                                    rows={schoolPageRows}
                                    totalRows={filteredSchools.length}
                                    page={schoolPage}
                                    totalPages={schoolTotalPages}
                                    onPageChange={setSchoolPage}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-sm">
                        <PanelHeader
                            eyebrow="Monitoring Program"
                            title="Program per Sekolah"
                            subtitle="Diagram dapat digeser secara horizontal ketika jumlah sekolah lebih banyak dari lebar layar."
                            icon={<BarChart3 size={18} />}
                            right={
                                activeProgramFilterCount > 0 ? (
                                    <button
                                        type="button"
                                        onClick={resetProgramFilters}
                                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 text-[9px] font-black uppercase tracking-widest text-rose-500 transition hover:bg-rose-500 hover:text-white"
                                    >
                                        <SlidersHorizontal size={13} />
                                        Reset {activeProgramFilterCount} Filter
                                    </button>
                                ) : null
                            }
                        />

                        <div className="border-b border-slate-100 bg-slate-50/50 p-5">
                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
                                <div className="md:col-span-2 xl:col-span-2 2xl:col-span-2">
                                    <span className="mb-1.5 block text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                                        Pencarian
                                    </span>
                                    <SearchInput
                                        value={programSearch}
                                        onChange={(value) => {
                                            setProgramSearch(value);
                                            setProgramPage(1);
                                        }}
                                        placeholder="Cari program, sekolah, kabupaten..."
                                    />
                                </div>

                                <DistrictDropdown
                                    label="Kabupaten/Kota"
                                    value={programDistrictFilter}
                                    onChange={(value) => {
                                        setProgramDistrictFilter(value);
                                        setProgramSchoolFilter("ALL");
                                        setProgramPage(1);
                                    }}
                                    options={programDistrictOptions}
                                />

                                <FilterSelect
                                    label="Sekolah"
                                    value={programSchoolFilter}
                                    onChange={(value) => {
                                        setProgramSchoolFilter(value);
                                        setProgramPage(1);
                                    }}
                                    options={programSchoolOptions}
                                />

                                <FilterSelect
                                    label="Bidang"
                                    value={programCategoryFilter}
                                    onChange={(value) => {
                                        setProgramCategoryFilter(value);
                                        setProgramPage(1);
                                    }}
                                    options={[
                                        {
                                            value: "ALL",
                                            label: "Semua Bidang",
                                        },
                                        {
                                            value: "AKADEMIK",
                                            label: "Akademik",
                                        },
                                        {
                                            value: "NON_AKADEMIK",
                                            label: "Non Akademik",
                                        },
                                    ]}
                                />

                                <FilterSelect
                                    label="Pilar"
                                    value={programPillarFilter}
                                    onChange={(value) => {
                                        setProgramPillarFilter(value);
                                        setProgramPage(1);
                                    }}
                                    options={[
                                        {
                                            value: "ALL",
                                            label: "Semua Pilar",
                                        },
                                        {
                                            value: "AKADEMIK",
                                            label: "Akademik",
                                        },
                                        {
                                            value: "KARAKTER",
                                            label: "Karakter",
                                        },
                                        {
                                            value: "SENI_BUDAYA",
                                            label: "Seni Budaya",
                                        },
                                        {
                                            value: "KECAKAPAN_HIDUP",
                                            label: "Kecakapan Hidup",
                                        },
                                    ]}
                                />

                                <FilterSelect
                                    label="Status"
                                    value={programStatusFilter}
                                    onChange={(value) => {
                                        setProgramStatusFilter(value);
                                        setProgramPage(1);
                                    }}
                                    options={programStatusOptions}
                                />
                            </div>
                        </div>

                        <div className="px-5 pb-6 pt-4">
                            <div className="flex flex-col gap-1 border-b border-slate-100 pb-3 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#0AC4E0]">
                                        Jumlah Program per Sekolah
                                    </p>
                                    <p className="mt-1 text-[10px] font-semibold text-slate-400">
                                        Nama sekolah ditampilkan penuh di bawah batang. Geser diagram ke kanan untuk melihat sekolah berikutnya.
                                    </p>
                                </div>

                                <p className="mt-2 text-[10px] font-black text-slate-500 sm:mt-0">
                                    {schoolProgramChartRows.length} sekolah pada diagram
                                </p>
                            </div>

                            <SchoolProgramBarChart
                                rows={schoolProgramChartRows}
                            />
                        </div>

                        <div className="border-t border-slate-100">
                            <div className="flex flex-col gap-1 px-5 py-4">
                                <h3 className="text-sm font-black text-slate-800">
                                    Daftar Program
                                </h3>
                                <p className="text-[10px] font-semibold text-slate-400">
                                    {filteredPrograms.length} program sesuai filter · maksimal {PAGE_SIZE} baris per halaman
                                </p>
                            </div>

                            <ProgramTable
                                rows={programPageRows}
                                totalRows={filteredPrograms.length}
                                page={programPage}
                                totalPages={programTotalPages}
                                onPageChange={setProgramPage}
                                navigate={navigate}
                                detailPathPrefix={detailPathPrefix}
                                schoolMap={scopedSchoolMap}
                                wilayahMap={wilayahMap}
                            />
                        </div>
                    </section>
                </section>
            </main>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                        .program-chart-scroll::-webkit-scrollbar {
                            height: 7px;
                        }

                        .program-chart-scroll::-webkit-scrollbar-track {
                            background: #F1F5F9;
                            border-radius: 999px;
                        }

                        .program-chart-scroll::-webkit-scrollbar-thumb {
                            background: rgba(10, 196, 224, 0.45);
                            border-radius: 999px;
                        }

                        .program-chart-scroll {
                            scrollbar-width: thin;
                            scrollbar-color: rgba(10, 196, 224, 0.45) #F1F5F9;
                        }
                    `,
                }}
            />
        </PageWrapper>
    );
}

export default AODashboardPage;

