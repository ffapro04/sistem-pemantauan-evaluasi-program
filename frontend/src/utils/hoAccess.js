/* eslint-disable no-unused-vars */

export function normalizeValue(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ");
}

function readTokenPayload() {
    try {
        if (typeof window === "undefined") return null;
        const token = window.localStorage?.getItem("token");
        if (!token) return null;

        const payload = token.split(".")[1];
        if (!payload) return null;

        return JSON.parse(
            atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
        );
    } catch {
        return null;
    }
}

function getSourceWithTokenFallback(value = {}) {
    const source = value?.raw || value || {};
    const tokenPayload = readTokenPayload() || {};

    // Token dipakai sebagai fallback supaya data jenis/sub_jenis dari JWT tidak hilang
    // ketika endpoint /users/:id belum mengirim field lengkap.
    return {
        ...tokenPayload,
        ...source,
        jenis: source?.jenis ?? tokenPayload?.jenis,
        sub_jenis:
            source?.sub_jenis ??
            source?.subJenis ??
            source?.subjenis ??
            tokenPayload?.sub_jenis ??
            tokenPayload?.subJenis ??
            tokenPayload?.subjenis,
        id_role: source?.id_role ?? source?.role_id ?? tokenPayload?.id_role,
        role:
            source?.role ??
            source?.nama_role ??
            source?.role_name ??
            tokenPayload?.role ??
            tokenPayload?.nama_role,
    };
}

function normalizeId(value) {
    if (value === null || value === undefined || value === "") return null;
    return String(value);
}

function normalizeJenjang(value) {
    const text = String(value || "").trim().toUpperCase();

    // Jangan pakai includes secara lepas tanpa urutan, supaya SD tidak terbaca dari teks lain.
    if (/\bSMK\b/.test(text) || text === "SMK") return "SMK";
    if (/\bSMP\b/.test(text) || text === "SMP") return "SMP";
    if (/\bSD\b/.test(text) || text === "SD") return "SD";

    return "";
}

function getRoleId(user = {}) {
    const source = getSourceWithTokenFallback(user);
    return Number(
        source?.id_role ||
        source?.role_id ||
        source?.role?.id_role ||
        source?.raw?.id_role ||
        0
    );
}

function getRoleText(user = {}) {
    const source = getSourceWithTokenFallback(user);
    return normalizeValue(
        source?.role ||
        source?.nama_role ||
        source?.role_name ||
        source?.jabatan ||
        source?.role?.nama_role ||
        source?.raw?.role ||
        source?.raw?.nama_role ||
        source?.raw?.jabatan ||
        ""
    );
}

function getHoJenis(user = {}) {
    const source = getSourceWithTokenFallback(user);
    return normalizeValue(
        source?.jenis ||
        source?.kategori ||
        source?.kategori_ho ||
        source?.tipe ||
        source?.raw?.jenis ||
        ""
    );
}

function getHoSubJenis(user = {}) {
    const source = getSourceWithTokenFallback(user);
    return normalizeValue(
        source?.sub_jenis ||
        source?.subJenis ||
        source?.subjenis ||
        source?.jenjang_binaan ||
        source?.raw?.sub_jenis ||
        ""
    );
}

function isHeadOffice(user = {}) {
    const idRole = getRoleId(user);
    const roleText = getRoleText(user);

    return (
        idRole === 3 ||
        roleText === "ho" ||
        roleText.includes("head office") ||
        roleText.includes("supervisor head office")
    );
}

export function isHoNonAkademik(user = {}) {
    const jenis = getHoJenis(user);
    return jenis.includes("non");
}

export function isHoAkademik(user = {}) {
    const jenis = getHoJenis(user);
    return jenis.includes("akademik") && !jenis.includes("non");
}

export function getHoAllowedJenjang(user = {}) {
    if (!isHeadOffice(user)) {
        return ["SD", "SMP", "SMK"];
    }

    if (isHoNonAkademik(user)) {
        return ["SD", "SMP", "SMK"];
    }

    const subJenis = getHoSubJenis(user);

    if (subJenis.includes("smk")) {
        return ["SMK"];
    }

    if (subJenis.includes("sd") && subJenis.includes("smp")) {
        return ["SD", "SMP"];
    }

    if (subJenis.includes("sd")) return ["SD"];
    if (subJenis.includes("smp")) return ["SMP"];

    // Kalau HO akademik tapi sub_jenis kosong, jangan tampilkan semua.
    // Ini sengaja strict agar HO SMK tidak bocor melihat SD/SMP saat data profile belum lengkap.
    if (isHoAkademik(user)) return [];

    return ["SD", "SMP", "SMK"];
}

export function canHoAccessSchool(user = {}, school = {}) {
    if (!isHeadOffice(user)) return true;

    const allowedJenjang = getHoAllowedJenjang(user);
    const source = school?.raw || school;

    const schoolJenjang = normalizeJenjang(
        source?.jenjang ||
        source?.jenjang_sekolah ||
        source?.tingkat ||
        source?.school_level ||
        source?.level ||
        ""
    );

    if (!schoolJenjang) return false;
    return allowedJenjang.includes(schoolJenjang);
}

export function filterSchoolsByHoAccess(schools = [], user = {}) {
    if (!Array.isArray(schools)) return [];
    return schools.filter((school) => canHoAccessSchool(user, school));
}

function pushSchoolId(ids, value) {
    const id = normalizeId(value);
    if (id) ids.push(id);
}

function pushSchoolObject(objects, value) {
    if (!value) return;

    if (Array.isArray(value)) {
        value.forEach((item) => pushSchoolObject(objects, item));
        return;
    }

    if (typeof value === "object") objects.push(value);
}

function getProgramSchoolIds(program = {}) {
    const source = program?.raw || program;
    const ids = [];

    pushSchoolId(ids, source?.id_sekolah);
    pushSchoolId(ids, source?.sekolah_id);
    pushSchoolId(ids, source?.id_school);
    pushSchoolId(ids, source?.school_id);

    ["sekolah_ids", "target_sekolah_ids", "school_ids", "schools_ids"].forEach(
        (key) => {
            const value = source?.[key];
            if (!Array.isArray(value)) return;

            value.forEach((item) => {
                if (typeof item === "object") {
                    pushSchoolId(ids, item?.id_sekolah || item?.id || item?.value);
                } else {
                    pushSchoolId(ids, item);
                }
            });
        }
    );

    ["sekolah", "sekolahs", "schools", "target_sekolah", "targetSekolah"].forEach(
        (key) => {
            const value = source?.[key];
            if (Array.isArray(value)) {
                value.forEach((item) => {
                    pushSchoolId(ids, item?.id_sekolah || item?.id || item?.value);
                });
            } else if (value && typeof value === "object") {
                pushSchoolId(ids, value?.id_sekolah || value?.id || value?.value);
            }
        }
    );

    return [...new Set(ids.map(String).filter(Boolean))];
}

function getProgramSchoolObjects(program = {}) {
    const source = program?.raw || program;
    const objects = [];

    pushSchoolObject(objects, source?.sekolah);
    pushSchoolObject(objects, source?.sekolahs);
    pushSchoolObject(objects, source?.schools);
    pushSchoolObject(objects, source?.target_sekolah);
    pushSchoolObject(objects, source?.targetSekolah);

    return objects;
}

function looksLikeHo(value = {}) {
    if (!value || typeof value !== "object") return false;
    return (
        getRoleId(value) === 3 ||
        Boolean(value?.jenis) ||
        Boolean(value?.sub_jenis) ||
        getRoleText(value).includes("head office")
    );
}

function looksLikeProgram(value = {}) {
    if (!value || typeof value !== "object") return false;
    return (
        Boolean(value?.id_program) ||
        Boolean(value?.nama_program) ||
        Boolean(value?.sekolah_ids) ||
        Boolean(value?.id_sekolah) ||
        Boolean(value?.status_program)
    );
}

export function canHoAccessProgram(arg1 = {}, arg2 = {}, allSchools = []) {
    let currentHo = arg1;
    let program = arg2;

    if (looksLikeProgram(arg1) && looksLikeHo(arg2)) {
        program = arg1;
        currentHo = arg2;
    }

    if (!isHeadOffice(currentHo)) return true;
    if (isHoNonAkademik(currentHo)) return true;

    const directSchoolObjects = getProgramSchoolObjects(program);
    if (directSchoolObjects.length > 0) {
        return directSchoolObjects.every((school) => canHoAccessSchool(currentHo, school));
    }

    const selectedSchoolIds = getProgramSchoolIds(program);
    if (selectedSchoolIds.length > 0 && Array.isArray(allSchools)) {
        const relatedSchools = allSchools.filter((school) => {
            const source = school?.raw || school;
            const schoolId = normalizeId(source?.id_sekolah || source?.id || source?.value);
            return schoolId && selectedSchoolIds.includes(schoolId);
        });

        if (relatedSchools.length > 0) {
            return relatedSchools.every((school) => canHoAccessSchool(currentHo, school));
        }
    }

    const source = program?.raw || program;
    const directJenjang = normalizeJenjang(
        source?.jenjang || source?.jenjang_sekolah || source?.school_level || source?.level || ""
    );

    if (directJenjang) return getHoAllowedJenjang(currentHo).includes(directJenjang);

    return true;
}

export function filterProgramsByHoAccess(programs = [], currentHo = {}, allSchools = []) {
    if (!Array.isArray(programs)) return [];
    return programs.filter((program) => canHoAccessProgram(currentHo, program, allSchools));
}

