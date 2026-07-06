/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import {
    ArrowLeft,
    Save,
    Building2,
    UserCheck,
    Loader2,
    DollarSign,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Plus,
    Trash2,
    Layers3,
    ClipboardCheck,
    UploadCloud,
    CalendarDays,
} from "lucide-react";

import {
    Sidebar,
    PageWrapper,
    Button,
    Input,
    Dropdown,
    FormField,
    FileDropzone,
    SelectedChips,
} from "../common";

import {
    filterSchoolsByHoAccess,
} from "../../utils/hoAccess";

const DEFAULT_STATUS_PROGRAM = "Approval";
const API_BASE_URL = "";
const PROGRAM_DRAFT_DB_NAME = "sme_program_drafts";
const PROGRAM_DRAFT_DB_VERSION = 1;
const PROGRAM_DRAFT_FILE_STORE = "program_files";
const PROGRAM_DRAFT_STORAGE_PREFIX = "program_create_draft";

function openProgramDraftDb() {
    if (typeof window === "undefined" || !window.indexedDB) {
        return Promise.reject(new Error("IndexedDB tidak tersedia di browser ini."));
    }

    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open(PROGRAM_DRAFT_DB_NAME, PROGRAM_DRAFT_DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(PROGRAM_DRAFT_FILE_STORE)) {
                db.createObjectStore(PROGRAM_DRAFT_FILE_STORE, { keyPath: "key" });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error("Gagal membuka penyimpanan draft."));
    });
}

async function saveProgramDraftFile(key, file) {
    if (!key || !file) return null;

    try {
        const db = await openProgramDraftDb();
        await new Promise((resolve, reject) => {
            const tx = db.transaction(PROGRAM_DRAFT_FILE_STORE, "readwrite");
            const store = tx.objectStore(PROGRAM_DRAFT_FILE_STORE);
            store.put({
                key,
                file,
                name: file.name,
                type: file.type,
                size: file.size,
                lastModified: file.lastModified,
                savedAt: new Date().toISOString(),
            });
            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error || new Error("Gagal menyimpan file draft."));
        });
        db.close();

        return {
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified,
        };
    } catch (error) {
        console.warn("Gagal menyimpan file MOU ke draft browser:", error);
        return null;
    }
}

async function getProgramDraftFile(key) {
    if (!key) return null;

    try {
        const db = await openProgramDraftDb();
        const entry = await new Promise((resolve, reject) => {
            const tx = db.transaction(PROGRAM_DRAFT_FILE_STORE, "readonly");
            const store = tx.objectStore(PROGRAM_DRAFT_FILE_STORE);
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error || new Error("Gagal membaca file draft."));
        });
        db.close();

        if (!entry?.file) return null;
        if (typeof File !== "undefined" && entry.file instanceof File) return entry.file;

        if (typeof File !== "undefined") {
            return new File([entry.file], entry.name || "dokumen-mou", {
                type: entry.type || entry.file?.type || "",
                lastModified: entry.lastModified || Date.now(),
            });
        }

        return entry.file;
    } catch (error) {
        console.warn("Gagal memulihkan file MOU dari draft browser:", error);
        return null;
    }
}

async function deleteProgramDraftFile(key) {
    if (!key) return;

    try {
        const db = await openProgramDraftDb();
        await new Promise((resolve, reject) => {
            const tx = db.transaction(PROGRAM_DRAFT_FILE_STORE, "readwrite");
            const store = tx.objectStore(PROGRAM_DRAFT_FILE_STORE);
            store.delete(key);
            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error || new Error("Gagal menghapus file draft."));
        });
        db.close();
    } catch (error) {
        console.warn("Gagal menghapus file draft program:", error);
    }
}

function getProgramDraftKey(kategori = "AKADEMIK") {
    const payload = getTokenPayload() || {};
    const userId = payload.id_user || payload.sub || payload.id || "anonymous";
    return `${PROGRAM_DRAFT_STORAGE_PREFIX}:${userId}:${normalizeCategory(kategori) || "PROGRAM"}`;
}

function toDraftPlainObject(value, fallback = {}) {
    try {
        return JSON.parse(JSON.stringify(value ?? fallback));
    } catch {
        return fallback;
    }
}

function toDraftSelectedItem(item) {
    return {
        value: item?.value ?? null,
        label: item?.label || "",
        subLabel: item?.subLabel || "",
        realId: item?.realId ?? null,
        raw: toDraftPlainObject(item?.raw, {}),
    };
}

function readProgramDraft(kategori) {
    try {
        const raw = localStorage.getItem(getProgramDraftKey(kategori));
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function hasMeaningfulProgramDraft(draft) {
    const form = draft?.formData || {};

    return Boolean(
        String(form?.namaProgram || "").trim() ||
        String(form?.nomorMou || "").trim() ||
        String(form?.hargaVendor || "").trim() ||
        String(form?.tanggalMulaiProgram || "").trim() ||
        String(form?.tanggalSelesaiProgram || "").trim() ||
        String(form?.fileName || "").trim() ||
        normalizeArray(form?.selectedSekolahs).length ||
        normalizeArray(form?.selectedAOs).length ||
        normalizeArray(form?.selectedVendors).length
    );
}

// =========================================================================
// STEP CONFIG
// =========================================================================
const MAIN_STEPS = [
    {
        key: "identitas",
        label: "Step 01",
        title: "Data Program & Periode",
        desc: "Identitas program, tim pelaksana, MOU, dan periode pelaksanaan",
        icon: Building2,
    },
    {
        key: "workflow",
        label: "Step 02",
        title: "Aktivitas & Bukti",
        desc: "Atur periode/bulan, administrasi pembuka, aktivitas, dan bukti kegiatan",
        icon: CalendarDays,
    },
    {
        key: "review",
        label: "Step 03",
        title: "Review",
        desc: "Cek sebelum program diterbitkan",
        icon: ClipboardCheck,
    },
];

// =========================================================================
// HELPERS
// =========================================================================
function formatRupiah(value) {
    const number = String(value || "").replace(/\D/g, "");
    if (!number) return "";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(number));
}

function cleanNumber(value) {
    return String(value || "").replace(/\D/g, "");
}

function normalizeArray(payload) {
    if (Array.isArray(payload)) {
        if (payload.length === 1 && typeof payload[0] === "object" && payload[0] !== null) {
            const first = payload[0];
            const wrapperKeys = ["data", "items", "result", "results", "rows", "users", "records", "content"];
            for (const key of wrapperKeys) {
                if (Array.isArray(first[key])) return first[key];
            }
        }
        return payload;
    }

    if (payload && typeof payload === "object") {
        const wrapperKeys = ["data", "items", "result", "results", "rows", "users", "records", "content", "vendor", "vendors", "sekolah", "schools"];
        for (const key of wrapperKeys) {
            if (Array.isArray(payload[key])) return payload[key];
        }
    }

    return [];
}

function normalizeId(value) {
    if (value === null || value === undefined || value === "") return null;
    return String(value);
}

function isActiveValue(value) {
    if (value === undefined || value === null || value === "") return true;
    const normalized = String(value).trim().toLowerCase();
    return value === true ||
        Number(value) === 1 ||
        normalized === "true" ||
        normalized === "aktif" ||
        normalized === "active" ||
        normalized === "bermitra";
}

function cleanWilayahName(value) {
    const raw = String(value || "").trim();
    if (!raw) return "Wilayah Tidak Diketahui";
    if (raw.includes("/")) return raw.split("/").filter(Boolean).pop() || raw;
    return raw;
}

//  Fungsi baru untuk normalisasi kategori (Akademik / Non-Akademik)
function normalizeCategory(value) {
    return String(value || "")
        .trim()
        .toUpperCase()
        .replaceAll("-", "_")
        .replaceAll(" ", "_");
}

const PILAR_PROGRAM_OPTIONS = {
    AKADEMIK: [
        { value: "AKADEMIK", label: "Akademik" },
        { value: "KARAKTER", label: "Karakter" },
    ],
    NON_AKADEMIK: [
        { value: "SENI_BUDAYA", label: "Seni Budaya" },
        { value: "KECAKAPAN_HIDUP", label: "Kecakapan Hidup" },
    ],
};

function getPilarProgramOptions(kategori) {
    const normalizedCategory = normalizeCategory(kategori);

    return PILAR_PROGRAM_OPTIONS[normalizedCategory] || [];
}

function getPilarProgramLabel(value) {
    const normalizedValue = normalizeCategory(value);

    const option = Object.values(PILAR_PROGRAM_OPTIONS)
        .flat()
        .find((item) => item.value === normalizedValue);

    return option?.label || value || "-";
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

function compactUserContext(value = {}) {
    const source = value?.data || value || {};
    return Object.fromEntries(
        Object.entries(source).filter(([, item]) => item !== undefined && item !== null && item !== "")
    );
}

function mergeUserContext(tokenPayload = {}, apiPayload = {}) {
    return {
        ...compactUserContext(tokenPayload),
        ...compactUserContext(apiPayload),
        // jenis/sub_jenis dari token tidak boleh hilang walau endpoint /users/:id belum lengkap
        jenis:
            apiPayload?.jenis ||
            apiPayload?.data?.jenis ||
            tokenPayload?.jenis ||
            "",
        sub_jenis:
            apiPayload?.sub_jenis ||
            apiPayload?.data?.sub_jenis ||
            apiPayload?.subJenis ||
            tokenPayload?.sub_jenis ||
            tokenPayload?.subJenis ||
            "",
        id_role:
            apiPayload?.id_role ||
            apiPayload?.data?.id_role ||
            tokenPayload?.id_role ||
            tokenPayload?.role_id ||
            null,
        role:
            apiPayload?.role ||
            apiPayload?.nama_role ||
            apiPayload?.data?.role ||
            apiPayload?.data?.nama_role ||
            tokenPayload?.role ||
            tokenPayload?.nama_role ||
            "",
    };
}

function pushWilayahId(ids, value) {
    const normalized = normalizeId(value);
    if (normalized) ids.push(normalized);
}

function pushWilayahObjectIds(ids, wilayah) {
    if (!wilayah) return;

    if (Array.isArray(wilayah)) {
        wilayah.forEach((item) => pushWilayahObjectIds(ids, item));
        return;
    }

    if (typeof wilayah !== "object") {
        pushWilayahId(ids, wilayah);
        return;
    }

    pushWilayahId(ids, wilayah.id_wilayah);
    pushWilayahId(ids, wilayah.idWilayah);
    pushWilayahId(ids, wilayah.wilayah_id);
    pushWilayahId(ids, wilayah.id);
    pushWilayahId(ids, wilayah.id_kabupaten);
    pushWilayahId(ids, wilayah.kabupaten_id);
    pushWilayahId(ids, wilayah.id_provinsi);
    pushWilayahId(ids, wilayah.provinsi_id);

    pushWilayahId(ids, wilayah.id_parent);
    pushWilayahId(ids, wilayah.parent_id);

    pushWilayahObjectIds(ids, wilayah.parent);
    pushWilayahObjectIds(ids, wilayah.induk);
    pushWilayahObjectIds(ids, wilayah.wilayah_induk);
    pushWilayahObjectIds(ids, wilayah.provinsi);
    pushWilayahObjectIds(ids, wilayah.kabupaten);
}

function getWilayahIds(item) {
    const source = item?.raw || item;
    if (!source) return [];

    const ids = [];

    pushWilayahId(ids, source.id_wilayah);
    pushWilayahId(ids, source.idWilayah);
    pushWilayahId(ids, source.wilayah_id);
    pushWilayahId(ids, source.id_kabupaten);
    pushWilayahId(ids, source.kabupaten_id);
    pushWilayahId(ids, source.id_provinsi);
    pushWilayahId(ids, source.provinsi_id);
    pushWilayahId(ids, source.id_parent);
    pushWilayahId(ids, source.parent_id);

    pushWilayahObjectIds(ids, source.wilayah);
    pushWilayahObjectIds(ids, source.kabupaten);
    pushWilayahObjectIds(ids, source.provinsi);
    pushWilayahObjectIds(ids, source.kabupaten_tugas);

    if (Array.isArray(source.wilayah_ids)) {
        source.wilayah_ids.forEach((id) => pushWilayahId(ids, id));
    }

    if (Array.isArray(source.kabupaten_ids)) {
        source.kabupaten_ids.forEach((id) => pushWilayahId(ids, id));
    }

    if (Array.isArray(source.provinsi_ids)) {
        source.provinsi_ids.forEach((id) => pushWilayahId(ids, id));
    }

    return [...new Set(ids.map(normalizeId).filter(Boolean))];
}

function normalizeWilayahText(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replaceAll("\\", "/")
        .replaceAll(">", "/")
        .replace(/\s*\/\s*/g, "/")
        .replace(/\s+/g, " ")
        .trim();
}

function pushWilayahName(names, value) {
    const normalized = normalizeWilayahText(value);
    if (normalized) names.push(normalized);
}

function pushWilayahObjectNames(names, wilayah) {
    if (!wilayah) return;

    if (Array.isArray(wilayah)) {
        wilayah.forEach((item) => pushWilayahObjectNames(names, item));
        return;
    }

    if (typeof wilayah === "string") {
        pushWilayahName(names, wilayah);
        return;
    }

    if (typeof wilayah !== "object") return;

    pushWilayahName(names, wilayah.nama_wilayah);
    pushWilayahName(names, wilayah.namaWilayah);
    pushWilayahName(names, wilayah.nama);
    pushWilayahName(names, wilayah.name);
    pushWilayahName(names, wilayah.region);
    pushWilayahName(names, wilayah.area);

    pushWilayahObjectNames(names, wilayah.parent);
    pushWilayahObjectNames(names, wilayah.induk);
    pushWilayahObjectNames(names, wilayah.wilayah_induk);
}

function getWilayahNames(item) {
    const source = item?.raw || item;
    if (!source) return [];

    const names = [];

    pushWilayahName(names, source.nama_wilayah);
    pushWilayahName(names, source.namaWilayah);
    pushWilayahName(names, source.nama_kabupaten);
    pushWilayahName(names, source.nama_provinsi);
    pushWilayahName(names, source.area);
    pushWilayahName(names, typeof source.wilayah === "string" ? source.wilayah : "");

    pushWilayahObjectNames(names, source.wilayah);
    pushWilayahObjectNames(names, source.kabupaten);
    pushWilayahObjectNames(names, source.provinsi);
    pushWilayahObjectNames(names, source.parent);
    pushWilayahObjectNames(names, source.kabupaten_tugas);

    return [...new Set(names.filter(Boolean))];
}

function createWilayahLookup(rows = []) {
    const map = new Map();

    normalizeArray(rows).forEach((item) => {
        const id = normalizeId(item?.id_wilayah ?? item?.id);
        if (!id) return;
        map.set(id, item);
    });

    return map;
}

function collectWilayahParentChain(ids, wilayahById, value, visited = new Set()) {
    const id = normalizeId(value);
    if (!id || visited.has(id)) return;

    visited.add(id);
    ids.push(id);

    const wilayah = wilayahById?.get?.(id);
    if (!wilayah) return;

    [
        wilayah?.id_parent,
        wilayah?.parent_id,
        wilayah?.id_provinsi,
        wilayah?.provinsi_id,
        wilayah?.parent?.id_wilayah,
        wilayah?.parent?.id,
        wilayah?.induk?.id_wilayah,
        wilayah?.induk?.id,
        wilayah?.wilayah_induk?.id_wilayah,
        wilayah?.wilayah_induk?.id,
        wilayah?.provinsi?.id_wilayah,
        wilayah?.provinsi?.id,
    ].forEach((parentId) => {
        const normalizedParentId = normalizeId(parentId);
        if (normalizedParentId && normalizedParentId !== id) {
            collectWilayahParentChain(ids, wilayahById, normalizedParentId, visited);
        }
    });
}

function getExpandedWilayahIds(item, wilayahById) {
    const ids = [];

    getWilayahIds(item).forEach((id) => {
        collectWilayahParentChain(ids, wilayahById, id);
    });

    return [...new Set(ids.map(normalizeId).filter(Boolean))];
}

function getExpandedWilayahNames(item, wilayahById) {
    const names = [...getWilayahNames(item)];

    getExpandedWilayahIds(item, wilayahById).forEach((id) => {
        const wilayah = wilayahById?.get?.(String(id));
        if (!wilayah) return;

        pushWilayahName(names, wilayah?.nama_wilayah);
        pushWilayahName(names, wilayah?.namaWilayah);
        pushWilayahName(names, wilayah?.nama);
        pushWilayahName(names, wilayah?.name);

        pushWilayahObjectNames(names, wilayah?.parent);
        pushWilayahObjectNames(names, wilayah?.induk);
        pushWilayahObjectNames(names, wilayah?.wilayah_induk);
        pushWilayahObjectNames(names, wilayah?.provinsi);
    });

    return [...new Set(names.filter(Boolean))];
}

function isSameWilayahScope(ao, selectedWilayahIds, selectedWilayahNames, wilayahById) {
    const aoIds = getExpandedWilayahIds(ao.raw || ao, wilayahById);
    const aoNames = getExpandedWilayahNames(ao.raw || ao, wilayahById);

    const matchById = aoIds.some((id) => selectedWilayahIds.includes(String(id)));
    if (matchById) return true;

    const matchByName = aoNames.some((name) => selectedWilayahNames.includes(name));
    return matchByName;
}

function normalizeSchool(item) {
    return {
        value: item?.id_sekolah ?? item?.id,
        label: item?.nama_sekolah ?? item?.nama ?? "Sekolah",
        subLabel: `${item?.npsn || "-"} · ${cleanWilayahName(item?.wilayah?.nama_wilayah || item?.nama_wilayah || item?.wilayah)}`,
        raw: item,
    };
}

function normalizeAo(item) {
    const tugasList = normalizeArray(item?.kabupaten_tugas);
    const tugasLabel = tugasList
        .map((tugas) => tugas?.nama_kabupaten || tugas?.nama_wilayah || tugas?.nama_provinsi)
        .filter(Boolean)
        .slice(0, 3)
        .join(", ");

    return {
        value: item?.id_user ?? item?.id,
        label: item?.nama ?? item?.name ?? item?.nama_lengkap ?? "User",
        subLabel:
            tugasLabel ||
            cleanWilayahName(
                item?.wilayah?.nama_wilayah ||
                item?.nama_wilayah ||
                item?.wilayah ||
                item?.area ||
                ""
            ) ||
            item?.email ||
            item?.jabatan ||
            "",
        raw: item,
    };
}
function isAreaOfficer(item) {
    if (!item) return false;
    const idRole = Number(item?.id_role || item?.role?.id_role || item?.role_id || 0);
    if (idRole === 4) return true;
    const roleText = String(
        item?.nama_role ||
        item?.role?.nama_role ||
        item?.jabatan ||
        item?.role_name ||
        ""
    ).toLowerCase();
    if (roleText.includes("ao") ||
        roleText.includes("area officer") ||
        roleText.includes("area") ||
        roleText.includes("pengawas") ||
        roleText.includes("supervisor")) {
        return true;
    }
    return false;
}

function getVendorId(item) {
    return item?.id_vendor ?? item?.vendor_id ?? item?.id_master_vendor ?? item?.id_user ?? item?.id ?? null;
}

function normalizeVendor(item, index = 0) {
    const vendorId = getVendorId(item);
    return {
        value: vendorId ?? `vendor-fallback-${index}`,
        label: item?.nama_vendor || item?.nama_perusahaan || item?.nama_pt || item?.nama || item?.name || `Vendor ${index + 1}`,
        subLabel: item?.kategori || item?.kategori_vendor || item?.jenis || item?.pilar || "",
        raw: item,
        realId: vendorId,
    };
}

// =========================================================================
// PERIODE / AKTIVITAS FACTORIES
// =========================================================================
function createDefaultRequirement(name = "") {
    return { nama: name, tipe: "upload", deskripsi: "" };
}

function createDefaultPertemuan(kegiatanNumber = 1, pertemuanNumber = 1) {
    return {
        nama_pertemuan: `Pertemuan ${pertemuanNumber} - Aktivitas ${kegiatanNumber}`,
        deskripsi: "",
        tanggal_mulai: "",
        tanggal_selesai: "",
    };
}

function getMonthPeriodName(dateValue = "") {
    if (!dateValue) return "";
    try {
        const date = new Date(dateValue);
        if (Number.isNaN(date.getTime())) return "";
        return new Intl.DateTimeFormat("id-ID", {
            month: "long",
            year: "numeric",
        }).format(date);
    } catch {
        return "";
    }
}

function createDefaultTermin(periodNumber = 1) {
    return {
        nama_termin: `Administrasi Pembuka Periode ${periodNumber}`,
        deskripsi: "Upload bukti administratif sebelum aktivitas pada periode ini dibuka.",
        jumlah_pembayaran: 0,
        persyaratan: [
            createDefaultRequirement("Bukti pembayaran / administrasi pembuka periode"),
        ],
    };
}

function createDefaultKegiatan(periodNumber = 1, kegiatanNumber = 1) {
    return {
        nama_kegiatans: `Aktivitas ${kegiatanNumber} - Periode ${periodNumber}`,
        deskripsi: "",
        tanggal_mulai: "",
        tanggal_selesai: "",
        pertemuan: [createDefaultPertemuan(kegiatanNumber, 1)],
        persyaratan: [
            createDefaultRequirement("Bukti mulai kegiatan"),
            createDefaultRequirement("Bukti dokumentasi kegiatan"),
        ],
    };
}

function createDefaultFase(periodNumber = 1, defaultFaseName = "") {
    return {
        nama_fase: defaultFaseName || `Periode ${periodNumber}`,
        deskripsi: "",
        kpi_nama: "",
        kpi_target: "",
        kpi_satuan: "%",
        termin: [createDefaultTermin(periodNumber)],
        kegiatans: [createDefaultKegiatan(periodNumber, 1)],
    };
}

// =========================================================================
// VALIDATORS
// =========================================================================
function validateFase(fase, kategori = "AKADEMIK") {
    const isNonAkademik = normalizeCategory(kategori) === "NON_AKADEMIK";

    if (!String(fase?.nama_fase || "").trim()) {
        return "Nama periode/bulan wajib diisi.";
    }
    if (!fase?.termin?.length) {
        return "Periode wajib memiliki administrasi pembuka.";
    }
    for (const termin of fase.termin) {
        if (!termin?.persyaratan?.length) {
            return "Administrasi pembuka wajib memiliki minimal satu bukti upload.";
        }
        for (const syarat of termin.persyaratan) {
            if (!String(syarat?.nama || "").trim()) {
                return "Nama bukti administratif pembuka wajib diisi.";
            }
        }
    }
    if (!fase?.kegiatans?.length) {
        return "Periode wajib memiliki minimal satu aktivitas.";
    }
    for (const kegiatan of fase.kegiatans) {
        if (!String(kegiatan?.nama_kegiatans || "").trim()) {
            return "Nama aktivitas wajib diisi.";
        }
        if (!String(kegiatan?.tanggal_mulai || "").trim()) {
            return "Tanggal mulai aktivitas wajib diisi.";
        }
        if (!String(kegiatan?.tanggal_selesai || "").trim()) {
            return "Tanggal selesai aktivitas wajib diisi.";
        }
        if (
            kegiatan?.tanggal_mulai &&
            kegiatan?.tanggal_selesai &&
            new Date(kegiatan.tanggal_mulai) > new Date(kegiatan.tanggal_selesai)
        ) {
            return "Tanggal selesai aktivitas tidak boleh lebih awal dari tanggal mulai.";
        }
        if (isNonAkademik) {
            if (!kegiatan?.pertemuan?.length) {
                return "Aktivitas non-akademik wajib memiliki minimal satu pertemuan.";
            }
            for (const pertemuan of kegiatan.pertemuan) {
                if (!String(pertemuan?.nama_pertemuan || "").trim()) {
                    return "Nama pertemuan wajib diisi.";
                }
                if (
                    pertemuan?.tanggal_mulai &&
                    pertemuan?.tanggal_selesai &&
                    new Date(pertemuan.tanggal_mulai) > new Date(pertemuan.tanggal_selesai)
                ) {
                    return "Tanggal selesai pertemuan tidak boleh lebih awal dari tanggal mulai.";
                }
            }
        }
        if (!kegiatan?.persyaratan?.length) {
            return "Aktivitas wajib memiliki minimal satu bukti upload.";
        }
        for (const syarat of kegiatan.persyaratan) {
            if (!String(syarat?.nama || "").trim()) {
                return "Nama bukti upload aktivitas wajib diisi.";
            }
        }
    }
    return "";
}

// =========================================================================
// MAIN COMPONENT
// =========================================================================
function CreateProgramForm({
    kategori = "AKADEMIK",
    title = "Program Akademik",
    redirectPath = "/ho/program/akademik",
    vendorEndpoint = `${API_BASE_URL}/vendor?kategori=${kategori}`,
    defaultFaseName = "Juni 2026",
    programPlaceholder = "Contoh: Digitalisasi Kurikulum Nasional",
    successMessage = "Program berhasil dibuat",
}) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialSekolahId = searchParams.get("sekolah");
    const draftPromptShownRef = useRef(false);

    const [activeStep, setActiveStep] = useState("identitas");
    const [activeFaseIndex, setActiveFaseIndex] = useState(0);

    const [sekolahOptions, setSekolahOptions] = useState([]);
    const [aoOptions, setAoOptions] = useState([]);
    const [vendorOptions, setVendorOptions] = useState([]);
    const [wilayahRows, setWilayahRows] = useState([]);

    const [hoUser, setHoUser] = useState({ id: null, nama: "Head Office" });
    const [loading, setLoading] = useState(false);
    const [masterLoading, setMasterLoading] = useState(true);

    const [driveGuardOpen, setDriveGuardOpen] = useState(false);
    const [driveGuardLoading, setDriveGuardLoading] = useState(false);
    const [driveGuardMessage, setDriveGuardMessage] = useState(
        "Akun Anda belum tertaut ke penyimpanan dokumen. Hubungkan terlebih dahulu untuk mengunggah MOU."
    );
    const [draftPromptOpen, setDraftPromptOpen] = useState(false);
    const [draftPromptMissingFile, setDraftPromptMissingFile] = useState(false);
    const [draftRestoring, setDraftRestoring] = useState(false);

    const pilarProgramOptions = useMemo(
        () => getPilarProgramOptions(kategori),
        [kategori],
    );

    const [formData, setFormData] = useState({
        namaProgram: "",
        nomorMou: "",
        hargaVendor: "",
        tahun: new Date().getFullYear().toString(),
        jenisProgram: "PROJECT",
        pilarProgram: getPilarProgramOptions(kategori)[0]?.value || "",
        tanggalMulaiProgram: "",
        tanggalSelesaiProgram: "",
        selectedSekolahs: [],
        selectedAOs: [],
        selectedVendors: [],
        fileFinal: null,
        fileName: "",
    });

    const [fases, setFases] = useState([createDefaultFase(1, defaultFaseName)]);

    const updateForm = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

    const saveProgramDraft = async () => {
        const draftKey = getProgramDraftKey(kategori);
        const fileMeta = await saveProgramDraftFile(draftKey, formData.fileFinal);
        const draft = {
            version: 1,
            key: draftKey,
            kategori,
            title,
            savedAt: new Date().toISOString(),
            activeStep,
            activeFaseIndex,
            formData: {
                ...formData,
                selectedSekolahs: formData.selectedSekolahs.map(toDraftSelectedItem),
                selectedAOs: formData.selectedAOs.map(toDraftSelectedItem),
                selectedVendors: formData.selectedVendors.map(toDraftSelectedItem),
                fileFinal: null,
                fileName: formData.fileName || fileMeta?.name || "",
            },
            fases: toDraftPlainObject(fases, [createDefaultFase(1, defaultFaseName)]),
            fileMeta: fileMeta || (formData.fileName ? { name: formData.fileName } : null),
        };

        try {
            localStorage.setItem(draftKey, JSON.stringify(draft));
        } catch (error) {
            console.warn("Gagal menyimpan draft program:", error);
            toast.warning("Draft form gagal disimpan otomatis. Jangan tutup halaman sebelum program diterbitkan.");
        }

        return draft;
    };

    const clearProgramDraft = async () => {
        const draftKey = getProgramDraftKey(kategori);
        localStorage.removeItem(draftKey);
        await deleteProgramDraftFile(draftKey);
    };

    const restoreProgramDraft = async (draft) => {
        if (!draft?.formData) return { restoredFile: null };

        const draftKey = draft.key || getProgramDraftKey(kategori);
        const restoredFile = await getProgramDraftFile(draftKey);
        const restoredFileName =
            restoredFile?.name ||
            draft.formData?.fileName ||
            draft.fileMeta?.name ||
            "";

        setFormData((prev) => ({
            ...prev,
            ...draft.formData,
            selectedSekolahs: normalizeArray(draft.formData.selectedSekolahs),
            selectedAOs: normalizeArray(draft.formData.selectedAOs),
            selectedVendors: normalizeArray(draft.formData.selectedVendors),
            fileFinal: restoredFile,
            fileName: restoredFileName,
        }));
        setFases(
            Array.isArray(draft.fases) && draft.fases.length > 0
                ? draft.fases
                : [createDefaultFase(1, defaultFaseName)]
        );
        setActiveStep(draft.activeStep || "review");
        setActiveFaseIndex(Number(draft.activeFaseIndex) || 0);

        return { restoredFile };
    };

    const hasCurrentFormInput = () =>
        Boolean(
            String(formData.namaProgram || "").trim() ||
            String(formData.nomorMou || "").trim() ||
            String(formData.hargaVendor || "").trim() ||
            String(formData.tanggalMulaiProgram || "").trim() ||
            String(formData.tanggalSelesaiProgram || "").trim() ||
            String(formData.fileName || "").trim() ||
            formData.selectedSekolahs.length ||
            formData.selectedAOs.length ||
            formData.selectedVendors.length
        );

    useEffect(() => {
        setFormData((prev) => {
            const currentPilarStillValid = pilarProgramOptions.some(
                (item) => item.value === prev.pilarProgram,
            );

            if (currentPilarStillValid) return prev;

            return {
                ...prev,
                pilarProgram: pilarProgramOptions[0]?.value || "",
            };
        });
    }, [pilarProgramOptions]);

    // â”€â”€ FETCH MASTER DATA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const fetchMasterData = async () => {
        setMasterLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            const decoded = getTokenPayload();
            if (decoded) {
                setHoUser({
                    id: decoded.id_user || decoded.sub || decoded.id || null,
                    nama: decoded.nama || decoded.name || "Head Office"
                });
            }

            const headers = { Authorization: `Bearer ${token}` };
            let currentHo = mergeUserContext(decoded || {}, {});
            const currentHoId = decoded?.id_user || decoded?.sub || decoded?.id || null;

            if (currentHoId) {
                try {
                    const res = await fetch(`${API_BASE_URL}/users/${currentHoId}`, { headers });
                    const payload = await res.json().catch(() => ({}));
                    if (res.ok) {
                        currentHo = mergeUserContext(decoded, payload?.data || payload);
                        setHoUser({
                            ...currentHo,
                            id: currentHo?.id_user || currentHoId,
                            nama: currentHo?.nama || decoded?.nama || "Head Office"
                        });
                    }
                } catch {
                    /* ignore */
                }
            }

            const fetchSafe = async (urls) => {
                for (const url of urls) {
                    try {
                        const res = await fetch(url, { headers });
                        const payload = await res.json().catch(() => []);
                        const normalized = normalizeArray(payload);
                        if (res.ok && normalized.length > 0) {
                            return normalized;
                        }
                    } catch (error) {
                        // Coba endpoint fallback berikutnya.
                    }
                }
                return [];
            };

            // Fetch semua data parallel
            const [rawSekolahList, rawAoList, rawVendorList, rawWilayahList] = await Promise.all([
                fetchSafe([`${API_BASE_URL}/sekolah`]),
                fetchSafe([
                    `${API_BASE_URL}/users/ao`,
                    `${API_BASE_URL}/users?role=ao`,
                    `${API_BASE_URL}/users?role=AO`,
                    `${API_BASE_URL}/users`,
                ]),
                fetchSafe([
                    vendorEndpoint,
                    `${API_BASE_URL}/vendor?kategori=${kategori}`,
                    // Fallback tanpa filter tetap disertakan agar tidak gagal, namun nanti akan difilter manual
                    `${API_BASE_URL}/vendor`
                ]),
                fetchSafe([`${API_BASE_URL}/wilayah`]),
            ]);

            //  FILTER VENDOR BERDASARKAN KATEGORI
            const targetCategory = normalizeCategory(kategori);
            const filteredVendorList = rawVendorList.filter(item => {
                const vendorCategoryRaw = item?.kategori || item?.kategori_vendor || item?.jenis || item?.pilar || "";
                const vendorCategory = normalizeCategory(vendorCategoryRaw);
                // Jika vendor tidak punya kategori, tetap tampilkan (fallback)
                if (!vendorCategory) return true;
                return vendorCategory === targetCategory;
            });
            // Proses Sekolah - strict by HO jenis/sub_jenis
            const activeRawSchools = rawSekolahList
                .filter((item) => item?.id_sekolah || item?.id)
                .filter((item) => isActiveValue(item?.status));

            const accessibleSchools = filterSchoolsByHoAccess(activeRawSchools, currentHo);

            const sekolahList = accessibleSchools
                .map(normalizeSchool)
                .sort((a, b) => a.label.localeCompare(b.label));

            // Proses AO
            let aoList = [];
            const usersWithId = rawAoList.filter((item) => item?.id_user || item?.id);
            const recognizedAo = usersWithId.filter(isAreaOfficer);
            const aoSource = recognizedAo.length > 0 ? recognizedAo : usersWithId;
            if (recognizedAo.length === 0 && usersWithId.length > 0) {
                console.warn("âš  Tidak ada user dengan role AO terdeteksi, menampilkan semua user");
            }
            aoList = aoSource
                .filter((item) => isActiveValue(item?.status))
                .map(normalizeAo)
                .sort((a, b) => a.label.localeCompare(b.label));

            const vendorList = filteredVendorList
                .filter((item) => item?.id_vendor || getVendorId(item))
                .filter((item) => isActiveValue(item?.status))
                .map((item, i) => normalizeVendor(item, i))
                .filter((item) => item.label && item.value)
                .sort((a, b) => a.label.localeCompare(b.label));

            if (filteredVendorList.length === 0 && rawVendorList.length > 0) {
                console.warn(`️ Filter kategori vendor [${kategori}] tidak ditemukan, dropdown vendor akan kosong`, {
                    kategori,
                    totalVendor: rawVendorList.length,
                });
            }

            setSekolahOptions(sekolahList);
            setAoOptions(aoList);
            setVendorOptions(vendorList);
            setWilayahRows(rawWilayahList);

            if (aoList.length === 0) {
                toast.warning("Tidak ada data Area Officer ditemukan. Silakan tambahkan AO terlebih dahulu.", {
                    autoClose: 5000,
                });
            }
        } catch (error) {
            console.error("âŒ Gagal mengambil data master:", error);
            toast.error("Gagal mengambil data master: " + error.message);
        } finally {
            setMasterLoading(false);
        }
    };

    useEffect(() => {
        fetchMasterData();
    }, [vendorEndpoint, kategori]);

    useEffect(() => {
        if (masterLoading || draftPromptShownRef.current) return;

        const driveParam =
            searchParams.get("drive") ||
            searchParams.get("googleDrive") ||
            searchParams.get("storage");
        const draftParam = searchParams.get("programDraft");

        const draft = readProgramDraft(kategori);
        if (!draft) {
            if (driveParam === "connected") {
                draftPromptShownRef.current = true;
                toast.success("Penyimpanan dokumen berhasil ditautkan.");
            }
            return;
        }

        if (!hasMeaningfulProgramDraft(draft)) return;

        const shouldRestoreDraft =
            driveParam === "connected" ||
            draftParam === "saved" ||
            !hasCurrentFormInput();

        if (!shouldRestoreDraft) return;

        draftPromptShownRef.current = true;
        setDraftRestoring(true);

        restoreProgramDraft(draft)
            .then(({ restoredFile }) => {
                setDraftPromptMissingFile(!restoredFile);
                setDraftPromptOpen(true);
                toast.info("Draft program kamu tersimpan. Silakan terbitkan atau lanjutkan edit.");
            })
            .catch(() => {
                toast.warning("Draft program ditemukan, tetapi sebagian data gagal dipulihkan.");
                setDraftPromptOpen(true);
                setDraftPromptMissingFile(true);
            })
            .finally(() => setDraftRestoring(false));
    }, [masterLoading, searchParams, kategori]);

    useEffect(() => {
        if (!initialSekolahId || sekolahOptions.length === 0) return;
        const selectedSchool = sekolahOptions.find((item) => String(item.value) === String(initialSekolahId));
        if (!selectedSchool) return;
        setFormData((prev) => {
            const alreadySelected = prev.selectedSekolahs.some((item) => String(item.value) === String(initialSekolahId));
            if (alreadySelected) return prev;
            return { ...prev, selectedSekolahs: [selectedSchool] };
        });
    }, [initialSekolahId, sekolahOptions]);

    // â”€â”€ AO FILTER BY WILAYAH â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const wilayahById = useMemo(() => createWilayahLookup(wilayahRows), [wilayahRows]);

    const selectedWilayahIds = useMemo(() => {
        return [
            ...new Set(
                formData.selectedSekolahs.flatMap((school) =>
                    getExpandedWilayahIds(school.raw || school, wilayahById),
                ),
            ),
        ];
    }, [formData.selectedSekolahs, wilayahById]);

    const selectedWilayahNames = useMemo(() => {
        return [
            ...new Set(
                formData.selectedSekolahs.flatMap((school) =>
                    getExpandedWilayahNames(school.raw || school, wilayahById),
                ),
            ),
        ];
    }, [formData.selectedSekolahs, wilayahById]);

    const filteredAoOptions = useMemo(() => {
        // Jangan tampilkan semua AO sebelum sekolah dipilih.
        if (formData.selectedSekolahs.length === 0) return [];

        // Kalau sekolah belum punya relasi wilayah yang bisa dibaca,
        // jangan fallback ke semua AO karena itu bisa salah wilayah.
        if (selectedWilayahIds.length === 0 && selectedWilayahNames.length === 0) {
            return [];
        }

        return aoOptions.filter((ao) =>
            isSameWilayahScope(ao, selectedWilayahIds, selectedWilayahNames, wilayahById),
        );
    }, [
        aoOptions,
        selectedWilayahIds,
        selectedWilayahNames,
        wilayahById,
        formData.selectedSekolahs.length,
    ]);

    useEffect(() => {
        if (formData.selectedAOs.length === 0) return;
        const allowedIds = filteredAoOptions.map((ao) => String(ao.value));
        setFormData((prev) => ({
            ...prev,
            selectedAOs: prev.selectedAOs.filter((ao) => allowedIds.includes(String(ao.value)))
        }));
    }, [filteredAoOptions]);

    // â”€â”€ SELECTION HELPERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const addSelectedItem = (field, options, value) => {
        const selectedItem = options.find((item) => String(item.value) === String(value));
        if (!selectedItem) return;
        if (formData[field].some((item) => String(item.value) === String(value))) {
            toast.info("Data sudah dipilih");
            return;
        }
        setFormData((prev) => ({ ...prev, [field]: [...prev[field], selectedItem] }));
    };

    const removeSelectedItem = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: prev[field].filter((item) => String(item.value) !== String(value))
        }));
    };

    const handleMouUpload = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (file.size > 10485760) {
            toast.error("File terlalu besar. Maksimal 10MB");
            return;
        }
        setFormData((prev) => ({ ...prev, fileFinal: file, fileName: file.name }));
    };

    // â”€â”€ VALIDATION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const validateStep = (stepKey = activeStep) => {
        if (stepKey === "identitas") {
            if (!formData.namaProgram.trim()) {
                toast.error("Nama program wajib diisi");
                return false;
            }
            if (!formData.pilarProgram) {
                toast.error("Pilar program wajib dipilih");
                return false;
            }
            if (!formData.tanggalMulaiProgram) {
                toast.error("Tanggal mulai program wajib diisi");
                return false;
            }
            if (!formData.tanggalSelesaiProgram) {
                toast.error("Tanggal selesai program wajib diisi");
                return false;
            }
            if (
                formData.tanggalMulaiProgram &&
                formData.tanggalSelesaiProgram &&
                new Date(formData.tanggalMulaiProgram) > new Date(formData.tanggalSelesaiProgram)
            ) {
                toast.error("Tanggal selesai program tidak boleh lebih awal dari tanggal mulai");
                return false;
            }
            if (formData.selectedSekolahs.length === 0) {
                toast.error("Minimal pilih satu sekolah sasaran");
                return false;
            }
            if (formData.selectedAOs.length === 0) {
                toast.error("Minimal pilih satu Area Officer");
                return false;
            }
            if (formData.selectedVendors.length === 0) {
                toast.error("Minimal pilih satu vendor");
                return false;
            }
            if (!formData.fileFinal) {
                toast.error("Dokumen MOU wajib diunggah");
                return false;
            }
            return true;
        }
        if (stepKey === "workflow") {
            for (const fase of fases) {
                const error = validateFase(fase, kategori);
                if (error) {
                    toast.error(error);
                    return false;
                }
            }
            return true;
        }
        return true;
    };

    const validateForm = () => {
        for (const step of ["identitas", "workflow"]) {
            if (!validateStep(step)) {
                setActiveStep(step);
                return false;
            }
        }
        return true;
    };

    // â”€â”€ PAYLOAD BUILD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const buildPayloadFases = () => {
        return fases.map((fase, faseIndex) => ({
            nama_fase: fase.nama_fase,
            deskripsi: fase.deskripsi || "",
            urutan: faseIndex + 1,
            kpi_nama: fase.kpi_nama || "",
            kpi_target: Number(fase.kpi_target || 0),
            kpi_satuan: fase.kpi_satuan || "%",
            termin: (fase.termin || []).map((termin, terminIndex) => ({
                nama_termin: termin.nama_termin || `Administrasi Pembuka ${fase.nama_fase}`,
                deskripsi: termin.deskripsi || "",
                urutan: terminIndex + 1,
                jumlah_pembayaran: 0,
                persyaratan: (termin.persyaratan || []).map((syarat, syaratIndex) => ({
                    nama: syarat.nama,
                    tipe: syarat.tipe || "upload",
                    deskripsi: syarat.deskripsi || "",
                    urutan: syaratIndex + 1,
                })),
            })),
            kegiatans: (fase.kegiatans || []).map((kegiatan, kegiatanIndex) => ({
                nama_kegiatans: kegiatan.nama_kegiatans,
                deskripsi: kegiatan.deskripsi || "",
                urutan: kegiatanIndex + 1,
                tanggal_mulai: kegiatan.tanggal_mulai || "",
                tanggal_selesai: kegiatan.tanggal_selesai || "",
                pertemuan: (kegiatan.pertemuan || []).map((pertemuan, pertemuanIndex) => ({
                    nama_pertemuan: pertemuan.nama_pertemuan,
                    deskripsi: pertemuan.deskripsi || "",
                    urutan: pertemuanIndex + 1,
                    tanggal_mulai: pertemuan.tanggal_mulai || "",
                    tanggal_selesai: pertemuan.tanggal_selesai || "",
                })),
                persyaratan: (kegiatan.persyaratan || []).map((syarat, syaratIndex) => ({
                    nama: syarat.nama,
                    tipe: syarat.tipe || "upload",
                    deskripsi: syarat.deskripsi || "",
                    urutan: syaratIndex + 1,
                })),
            })),
        }));
    };

    const getCurrentPagePath = () => {
        const currentPath = `${window.location.pathname}${window.location.search || ""}`;
        return currentPath || "/pengaturan-akun";
    };

    const checkDriveBeforeUpload = async (token) => {
        const response = await fetch(`${API_BASE_URL}/google-drive/status`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(payload?.message || "Gagal memeriksa tautan penyimpanan dokumen.");
        }

        if (!payload?.connected) {
            await saveProgramDraft();
            setDriveGuardMessage(
                "Akun Anda belum tertaut ke penyimpanan dokumen. Hubungkan Google Drive terlebih dahulu untuk mengunggah MOU."
            );
            setDriveGuardOpen(true);
            return false;
        }

        return true;
    };

    const handleConnectDriveFromGuard = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            toast.error("Sesi login tidak ditemukan. Silakan login ulang.");
            navigate("/login");
            return;
        }

        setDriveGuardLoading(true);

        try {
            await saveProgramDraft();
            const redirectTo = `${getCurrentPagePath()}${getCurrentPagePath().includes("?") ? "&" : "?"}drive=connected`;

            const response = await fetch(
                `${API_BASE_URL}/google-drive/auth-url?redirectTo=${encodeURIComponent(redirectTo)}`,
                {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(payload?.message || "Gagal membuat tautan perizinan penyimpanan dokumen.");
            }

            if (!payload?.url) {
                throw new Error("URL perizinan Google tidak ditemukan dari backend.");
            }

            window.location.href = payload.url;
        } catch (error) {
            toast.error(error.message || "Gagal menautkan penyimpanan dokumen.");
            setDriveGuardLoading(false);
        }
    };

    const handleOpenAccountSettingsFromGuard = async () => {
        try {
            await saveProgramDraft();
            setDriveGuardOpen(false);
            toast.info("Draft program tersimpan. Hubungkan Google Drive, lalu kamu bisa lanjutkan draft ini.");

            const returnTo = `${getCurrentPagePath()}${getCurrentPagePath().includes("?") ? "&" : "?"}drive=connected&programDraft=saved`;
            navigate(`/pengaturan-akun?returnTo=${encodeURIComponent(returnTo)}&programDraft=saved`);
        } catch {
            navigate("/pengaturan-akun");
        }
    };

    // â”€â”€ SAVE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const saveProgram = async () => {
        if (!validateForm()) return;
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            if (formData.fileFinal) {
                const driveReady = await checkDriveBeforeUpload(token);
                if (!driveReady) return;
            }

            const sekolahIds = formData.selectedSekolahs.map((item) => item.value);
            const aoIds = formData.selectedAOs.map((item) => item.value);
            const vendorIds = formData.selectedVendors.map((item) => item.realId || item.value);

            const submission = new FormData();
            submission.append("nama_program", formData.namaProgram.trim());
            submission.append("nomor_mou", formData.nomorMou.trim() || "");
            submission.append("harga_vendor", cleanNumber(formData.hargaVendor) || "0");
            submission.append("kategori", kategori);
            submission.append("pilar_program", formData.pilarProgram || "");
            submission.append("jenis_program", formData.jenisProgram || "PROJECT");
            submission.append("tahun", formData.tahun || "");
            submission.append("tanggal_mulai", formData.tanggalMulaiProgram || "");
            submission.append("tanggal_selesai", formData.tanggalSelesaiProgram || "");
            submission.append("status_program", DEFAULT_STATUS_PROGRAM);
            submission.append("id_sekolah", String(sekolahIds[0] || ""));
            submission.append("sekolah_ids", JSON.stringify(sekolahIds));
            submission.append("id_pengawas", String(aoIds[0] || ""));
            submission.append("ao_ids", JSON.stringify(aoIds));
            submission.append("id_vendor", JSON.stringify(vendorIds));
            submission.append("vendor_ids", JSON.stringify(vendorIds));
            if (hoUser.id) submission.append("id_ho", String(hoUser.id));
            submission.append("fases", JSON.stringify(buildPayloadFases()));
            if (formData.fileFinal) submission.append("file_mou", formData.fileFinal);

            const res = await fetch(`${API_BASE_URL}/program`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: submission,
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                const errorCode = data?.code || data?.error?.code || data?.response?.code;
                const errorMessage =
                    data?.message ||
                    data?.error?.message ||
                    data?.response?.message ||
                    "Gagal membuat program";

                if (
                    errorCode === "GOOGLE_DRIVE_NOT_CONNECTED" ||
                    String(errorMessage).toLowerCase().includes("google drive belum terhubung") ||
                    String(errorMessage).toLowerCase().includes("belum tertaut")
                ) {
                    await saveProgramDraft();
                    setDriveGuardMessage(
                        "Akun Anda belum tertaut ke penyimpanan dokumen. Hubungkan Google Drive terlebih dahulu untuk mengunggah MOU."
                    );
                    setDriveGuardOpen(true);
                    return;
                }

                throw new Error(errorMessage);
            }

            await clearProgramDraft();
            toast.success(successMessage);
            navigate(redirectPath);
        } catch (error) {
            toast.error(error.message || "Terjadi kesalahan saat membuat program");
        } finally {
            setLoading(false);
        }
    };

    // â”€â”€ STEP NAVIGATION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const currentStepIndex = MAIN_STEPS.findIndex((item) => item.key === activeStep);

    const goNext = () => {
        const current = MAIN_STEPS[currentStepIndex];
        if (current?.key !== "review" && !validateStep(current.key)) return;
        const next = MAIN_STEPS[currentStepIndex + 1];
        if (next) setActiveStep(next.key);
    };

    const goPrev = () => {
        const prev = MAIN_STEPS[currentStepIndex - 1];
        if (prev) setActiveStep(prev.key);
    };

    const stepCompletion = {
        identitas:
            formData.namaProgram.trim() &&
            formData.tanggalMulaiProgram &&
            formData.tanggalSelesaiProgram &&
            formData.selectedSekolahs.length > 0 &&
            formData.selectedAOs.length > 0 &&
            formData.selectedVendors.length > 0 &&
            formData.fileFinal,
        workflow: fases.every((fase) => !validateFase(fase, kategori)),
        review: false,
    };

    if (masterLoading) {
        return (
            <PageWrapper className="flex h-screen items-center justify-center bg-[#EEF5FF]">
                <div className="rounded-[2rem] border border-white bg-white px-10 py-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                    <div className="mx-auto mb-5 h-11 w-11 animate-spin rounded-full border-4 border-[#0AC4E0] border-t-transparent" />
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0AC4E0]">Memuat data master</p>
                    <p className="mt-2 text-xs font-semibold text-slate-400">Menyiapkan data sekolah, AO, dan vendor.</p>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper className="flex h-screen overflow-hidden bg-[#EEF5FF] !p-0 font-sans text-slate-800">
            <Sidebar />

            <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden px-4 py-4">
                {/* HEADER */}
                <header className="shrink-0">
                    <div className="flex min-h-[72px] items-center justify-between rounded-[1.8rem] border border-slate-100 bg-white px-4 py-3 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
                        <div className="flex min-w-0 items-center gap-3">
                            <button type="button" onClick={() => navigate(-1)}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-slate-500 transition hover:bg-white hover:text-[#0AC4E0]">
                                <ArrowLeft size={16} />
                            </button>
                            <div className="min-w-0">
                                <div className="mb-1 flex flex-wrap items-center gap-2">
                                    <span className="text-[8px] font-black uppercase tracking-[0.24em] text-[#0AC4E0]">Buat Program</span>
                                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                                    <span className="text-[8px] font-black uppercase tracking-[0.24em] text-slate-400">{kategori}</span>
                                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[7px] font-black uppercase tracking-widest text-amber-600">{DEFAULT_STATUS_PROGRAM}</span>
                                </div>
                                <h1 className="text-[22px] font-black leading-none tracking-[-0.055em] text-slate-950">
                                    Inisiasi <span className="text-[#0AC4E0]">{title}</span>
                                </h1>
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                            <div className="hidden items-center gap-2 lg:flex">
                                {MAIN_STEPS.map((step) => (
                                    <div key={step.key}
                                        className={`h-2.5 rounded-full transition-all ${activeStep === step.key ? "w-10 bg-[#0AC4E0]" : stepCompletion[step.key] ? "w-5 bg-emerald-400" : "w-5 bg-slate-200"}`}
                                        title={step.title}
                                    />
                                ))}
                            </div>
                            <button type="button" onClick={fetchMasterData}
                                className="flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-slate-400 transition hover:bg-white hover:text-[#0AC4E0]">
                                <RefreshCw size={14} />
                            </button>
                            <Button
                                text={loading ? "Memproses..." : "Simpan Program"}
                                icon={loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                onClick={saveProgram}
                                disabled={loading}
                                className="!rounded-2xl !bg-[#0AC4E0] !px-4 !py-2 !text-[10px] !font-black !uppercase !tracking-widest !text-white shadow-lg shadow-cyan-100 hover:!bg-cyan-500"
                            />
                        </div>
                    </div>
                </header>

                {/* STEP TABS */}
                <div className="mt-3 shrink-0">
                    <div className="grid grid-cols-3 gap-2">
                        {MAIN_STEPS.map((step, index) => {
                            const Icon = step.icon;
                            const active = activeStep === step.key;
                            const done = stepCompletion[step.key];
                            return (
                                <button key={step.key} type="button"
                                    onClick={() => {
                                        if (index < currentStepIndex) {
                                            setActiveStep(step.key);
                                            return;
                                        }
                                        if (index === currentStepIndex + 1 && validateStep(MAIN_STEPS[currentStepIndex].key)) {
                                            setActiveStep(step.key);
                                        }
                                    }}
                                    className={`rounded-[1.2rem] border px-4 py-3 text-left transition ${active ? "border-[#0AC4E0]/30 bg-white shadow-[0_8px_25px_rgba(10,196,224,0.12)]" : "border-slate-100 bg-white/60 hover:bg-white"}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${active ? "bg-[#0AC4E0]/10 text-[#0AC4E0]" : done ? "bg-emerald-50 text-emerald-500" : "bg-slate-50 text-slate-300"}`}>
                                            <Icon size={15} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`text-[8px] font-black uppercase tracking-widest ${active ? "text-[#0AC4E0]" : "text-slate-400"}`}>{step.label}</p>
                                            <p className="truncate text-[11px] font-black text-slate-800">{step.title}</p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* CONTENT */}
                <section className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.8rem] border border-slate-100 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.06)]">
                    <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4">
                        {activeStep === "identitas" && (
                            <IdentitasTimStep
                                formData={formData}
                                updateForm={updateForm}
                                pilarProgramOptions={pilarProgramOptions}
                                sekolahOptions={sekolahOptions}
                                filteredAoOptions={filteredAoOptions}
                                vendorOptions={vendorOptions}
                                addSelectedItem={addSelectedItem}
                                removeSelectedItem={removeSelectedItem}
                                handleMouUpload={handleMouUpload}
                                hoUser={hoUser}
                                programPlaceholder={programPlaceholder}
                                title={title}
                            />
                        )}
                        {activeStep === "workflow" && (
                            <WorkflowFaseStep
                                fases={fases}
                                setFases={setFases}
                                activeFaseIndex={activeFaseIndex}
                                setActiveFaseIndex={setActiveFaseIndex}
                                kategori={kategori}
                            />
                        )}
                        {activeStep === "review" && (
                            <ReviewStep
                                title={title}
                                formData={formData}
                                hoUser={hoUser}
                                fases={fases}
                            />
                        )}
                    </div>

                    {/* FOOTER NAVIGATION */}
                    <div className="shrink-0 border-t border-slate-100 bg-slate-50/70 px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                            <button type="button" onClick={goPrev} disabled={currentStepIndex === 0}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40">
                                <ChevronLeft size={13} /> Sebelumnya
                            </button>
                            {activeStep === "review" ? (
                                <Button
                                    text={loading ? "Memproses..." : "Terbitkan Program"}
                                    icon={loading ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                                    onClick={saveProgram}
                                    disabled={loading}
                                    className="!rounded-xl !bg-[#0AC4E0] !px-5 !py-2 !text-xs !font-bold !text-white hover:!bg-cyan-500"
                                />
                            ) : (
                                <button type="button" onClick={goNext}
                                    className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-slate-800">
                                    Lanjut <ChevronRight size={13} />
                                </button>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            {(draftPromptOpen || draftRestoring) && (
                <div className="fixed inset-0 z-[998] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
                    <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.25)]">
                        <div className="absolute inset-x-0 top-0 h-2 bg-emerald-400" />

                        <div className="p-7">
                            <div className="mb-5 inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
                                Draft Program Tersimpan
                            </div>

                            <h2 className="text-2xl font-black tracking-[-0.05em] text-slate-950">
                                Mau langsung terbitkan program ini?
                            </h2>

                            <p className="mt-3 text-sm font-semibold leading-7 text-slate-500">
                                Draft yang kamu isi sebelum menautkan Google Drive sudah dipulihkan. Kamu bisa langsung menerbitkan program, atau lanjut edit dulu kalau masih ada yang ingin ditambahkan.
                            </p>

                            {draftPromptMissingFile && (
                                <div className="mt-5 rounded-[1.25rem] border border-amber-100 bg-amber-50 px-5 py-4">
                                    <p className="text-sm font-bold leading-6 text-amber-700">
                                        Data form berhasil dipulihkan, tetapi file MOU perlu dipilih ulang karena browser tidak mengizinkan file disimpan otomatis.
                                    </p>
                                </div>
                            )}

                            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDraftPromptOpen(false);
                                        if (draftPromptMissingFile) {
                                            setActiveStep("identitas");
                                            toast.warning("Pilih ulang file MOU terlebih dahulu sebelum program diterbitkan.");
                                        }
                                    }}
                                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-xs font-black uppercase tracking-widest text-slate-500 transition hover:bg-slate-50"
                                >
                                    Tambahkan Lagi
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setDraftPromptOpen(false);
                                        saveProgram();
                                    }}
                                    disabled={loading || draftRestoring}
                                    className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#0AC4E0] px-5 text-xs font-black uppercase tracking-widest text-white shadow-[0_14px_32px_rgba(10,196,224,0.28)] transition hover:bg-[#08B7D1] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading || draftRestoring ? (
                                        <>
                                            <Loader2 size={14} className="mr-2 animate-spin" />
                                            Memproses
                                        </>
                                    ) : (
                                        "Terbitkan Program"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {driveGuardOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
                    <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-cyan-100 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.28)]">
                        <div className="absolute inset-x-0 top-0 h-2 bg-[#0AC4E0]" />

                        <div className="p-7">
                            <div className="mb-5 inline-flex rounded-full border border-[#0AC4E0]/20 bg-[#E9FBFF] px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#078EA3]">
                                Penyimpanan Dokumen
                            </div>

                            <h2 className="text-2xl font-black tracking-[-0.05em] text-slate-950">
                                Akun belum tertaut ke Google Drive
                            </h2>

                            <p className="mt-3 text-sm font-semibold leading-7 text-slate-500">
                                {driveGuardMessage}
                            </p>

                            <div className="mt-5 rounded-[1.25rem] border border-cyan-100 bg-[#F6FDFF] px-5 py-4">
                                <p className="text-sm font-bold leading-6 text-[#5F7E86]">
                                    Draft program akan disimpan otomatis sebelum kamu diarahkan ke Google. Setelah tautan berhasil, kamu bisa langsung menerbitkan program atau lanjut edit dulu.
                                </p>
                            </div>

                            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setDriveGuardOpen(false)}
                                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-xs font-black uppercase tracking-widest text-slate-500 transition hover:bg-slate-50"
                                >
                                    Tutup
                                </button>

                                <button
                                    type="button"
                                    onClick={handleOpenAccountSettingsFromGuard}
                                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-cyan-100 bg-[#F6FDFF] px-5 text-xs font-black uppercase tracking-widest text-[#078EA3] transition hover:bg-[#E9FBFF]"
                                >
                                    Simpan Draft & Buka Pengaturan
                                </button>

                                <button
                                    type="button"
                                    onClick={handleConnectDriveFromGuard}
                                    disabled={driveGuardLoading}
                                    className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#0AC4E0] px-5 text-xs font-black uppercase tracking-widest text-white shadow-[0_14px_32px_rgba(10,196,224,0.28)] transition hover:bg-[#08B7D1] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {driveGuardLoading ? (
                                        <>
                                            <Loader2 size={14} className="mr-2 animate-spin" />
                                            Menghubungkan
                                        </>
                                    ) : (
                                        "Tautkan Sekarang"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}` }} />
        </PageWrapper>
    );
}

// =========================================================================
// STEP 1 - IDENTITAS & TIM
// =========================================================================
function IdentitasTimStep({
    formData, updateForm, pilarProgramOptions, sekolahOptions, filteredAoOptions, vendorOptions,
    addSelectedItem, removeSelectedItem, handleMouUpload, hoUser, programPlaceholder, title,
}) {
    return (
        <div className="mx-auto w-full max-w-7xl">
            <SectionCard
                icon={<Building2 size={16} />}
                title="Data Program & Periode"
                desc="Nama program, periode, tim pelaksana, MOU, dan anggaran."
                className="!p-5"
            >
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.05fr_1fr]">
                    <div className="space-y-4">
                        <p className="border-b border-slate-100 pb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-800">
                            Data Program
                        </p>

                        <FormField label="Nama Program">
                            <Input
                                value={formData.namaProgram}
                                onChange={(e) => updateForm("namaProgram", e.target.value)}
                                placeholder={programPlaceholder}
                                className="form-input"
                            />
                        </FormField>

                        <FormField label="Pilar Program">
                            <div className="grid grid-cols-2 gap-2">
                                {pilarProgramOptions.map((pilar) => (
                                    <button
                                        key={pilar.value}
                                        type="button"
                                        onClick={() => updateForm("pilarProgram", pilar.value)}
                                        className={`rounded-xl border px-3 py-2.5 text-[10px] font-black uppercase tracking-widest transition ${formData.pilarProgram === pilar.value
                                            ? "border-[#0AC4E0] bg-[#0AC4E0]/10 text-[#0AC4E0]"
                                            : "border-slate-100 bg-slate-50 text-slate-400 hover:border-[#0AC4E0]/30 hover:text-slate-600"
                                            }`}
                                    >
                                        {pilar.label}
                                    </button>
                                ))}
                            </div>
                        </FormField>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <FormField label="Tahun Anggaran">
                                <Input
                                    value={formData.tahun}
                                    onChange={(e) => updateForm("tahun", e.target.value)}
                                    className="form-input"
                                />
                            </FormField>

                            <FormField label="Jenis Program">
                                <div className="flex gap-2">
                                    {["PROJECT", "REGULER"].map((jenis) => (
                                        <button
                                            key={jenis}
                                            type="button"
                                            onClick={() => updateForm("jenisProgram", jenis)}
                                            className={`flex-1 rounded-xl border px-2 py-2.5 text-[10px] font-black uppercase tracking-widest transition ${formData.jenisProgram === jenis
                                                ? "border-[#0AC4E0] bg-[#0AC4E0]/10 text-[#0AC4E0]"
                                                : "border-slate-100 bg-slate-50 text-slate-400"
                                                }`}
                                        >
                                            {jenis === "PROJECT" ? "Project" : "Reguler"}
                                        </button>
                                    ))}
                                </div>
                            </FormField>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <FormField label="Tanggal Mulai Program">
                                <Input
                                    type="date"
                                    value={formData.tanggalMulaiProgram}
                                    onChange={(e) => updateForm("tanggalMulaiProgram", e.target.value)}
                                    className="form-input"
                                />
                            </FormField>
                            <FormField label="Tanggal Selesai Program">
                                <Input
                                    type="date"
                                    value={formData.tanggalSelesaiProgram}
                                    onChange={(e) => updateForm("tanggalSelesaiProgram", e.target.value)}
                                    className="form-input"
                                />
                            </FormField>
                        </div>

                        {formData.tanggalMulaiProgram && formData.tanggalSelesaiProgram && (
                            <div className="rounded-xl border border-[#0AC4E0]/15 bg-[#0AC4E0]/5 px-3 py-2">
                                <div className="flex items-center gap-2">
                                    <CalendarDays size={13} className="text-[#0AC4E0]" />
                                    <p className="text-[9px] font-black uppercase tracking-widest text-[#0AC4E0]">Periode Program</p>
                                </div>
                                <p className="mt-1 text-[11px] font-bold text-slate-700">
                                    {getMonthPeriodName(formData.tanggalMulaiProgram)} sampai {getMonthPeriodName(formData.tanggalSelesaiProgram)}
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <FormField label="Head Office">
                                <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-[12px] font-bold text-slate-600">
                                    {hoUser.nama}
                                </div>
                            </FormField>

                            <FormField label="Status Awal">
                                <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5 text-[11px] font-black uppercase tracking-widest text-amber-600">
                                    Approval
                                </div>
                            </FormField>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="border-b border-slate-100 pb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-800">
                            Tim Pelaksana
                        </p>

                        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                            <FormField label="Sekolah Sasaran">
                                <div className="relative z-30">
                                    <Dropdown
                                        items={sekolahOptions}
                                        placeholder="Pilih sekolah"
                                        usePortal={false}
                                        onChange={(value) => addSelectedItem("selectedSekolahs", sekolahOptions, value)}
                                    />
                                </div>
                                <SelectedChips
                                    items={formData.selectedSekolahs}
                                    onRemove={(value) => removeSelectedItem("selectedSekolahs", value)}
                                    variant="cyan"
                                />
                            </FormField>

                            <FormField label="Area Officer">
                                <div className="relative z-20">
                                    <Dropdown
                                        items={filteredAoOptions}
                                        usePortal={false}
                                        placeholder={
                                            formData.selectedSekolahs.length === 0
                                                ? "Pilih sekolah dulu"
                                                : filteredAoOptions.length === 0
                                                    ? "Tidak ada AO"
                                                    : "Pilih AO"
                                        }
                                        onChange={(value) => addSelectedItem("selectedAOs", filteredAoOptions, value)}
                                    />
                                </div>
                                <SelectedChips
                                    items={formData.selectedAOs}
                                    onRemove={(value) => removeSelectedItem("selectedAOs", value)}
                                />
                                {formData.selectedSekolahs.length > 0 && filteredAoOptions.length === 0 && (
                                    <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-[9px] font-bold leading-relaxed text-amber-700">
                                        Belum ada AO yang memiliki wilayah sama dengan sekolah sasaran.
                                    </p>
                                )}
                            </FormField>
                        </div>

                        <FormField label={`Vendor / Narasumber ${title}`}>
                            <div className="relative z-10">
                                <Dropdown
                                    items={vendorOptions}
                                    placeholder="Pilih vendor / narasumber"
                                    usePortal={false}
                                    onChange={(value) => addSelectedItem("selectedVendors", vendorOptions, value)}
                                />
                            </div>
                            <SelectedChips
                                items={formData.selectedVendors}
                                onRemove={(value) => removeSelectedItem("selectedVendors", value)}
                                variant="cyan"
                            />
                        </FormField>

                        <p className="border-b border-slate-100 pb-2 pt-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-800">
                            Legalitas & Anggaran
                        </p>

                        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                            <FormField label="Nomor MOU">
                                <Input
                                    value={formData.nomorMou}
                                    onChange={(e) => updateForm("nomorMou", e.target.value)}
                                    placeholder="088/MOU/..."
                                    className="form-input"
                                />
                            </FormField>
                            <FormField label="Anggaran Vendor">
                                <div className="relative">
                                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        value={formatRupiah(formData.hargaVendor)}
                                        onChange={(e) => updateForm("hargaVendor", cleanNumber(e.target.value))}
                                        placeholder="Rp 0"
                                        className="form-input !pl-9"
                                    />
                                </div>
                            </FormField>
                        </div>

                        <FormField label="Dokumen MOU">
                            <FileDropzone
                                label="Upload File MOU"
                                fileName={formData.fileName}
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleMouUpload}
                            />
                        </FormField>
                    </div>
                </div>
            </SectionCard>
        </div>
    );
}

// =========================================================================
// STEP 2 - WORKFLOW FASE (sama seperti kode asli, tidak diubah)
// =========================================================================
function WorkflowFaseStep({
    fases,
    setFases,
    activeFaseIndex,
    setActiveFaseIndex,
    kategori,
}) {
    const activePeriod = fases[activeFaseIndex] || fases[0];
    const isNonAkademik = normalizeCategory(kategori) === "NON_AKADEMIK";

    const updatePeriod = (field, value) => {
        setFases((prev) =>
            prev.map((period, i) =>
                i === activeFaseIndex ? { ...period, [field]: value } : period
            )
        );
    };

    const addPeriod = () => {
        const error = validateFase(activePeriod, kategori);
        if (error) {
            toast.error(error);
            return;
        }
        const newIndex = fases.length;
        setFases((prev) => [
            ...prev,
            createDefaultFase(prev.length + 1, ""),
        ]);
        setActiveFaseIndex(newIndex);
    };

    const removePeriod = () => {
        if (fases.length <= 1) {
            toast.error("Minimal harus ada satu periode/bulan.");
            return;
        }
        setFases((prev) => prev.filter((_, i) => i !== activeFaseIndex));
        setActiveFaseIndex((prev) => Math.max(prev - 1, 0));
    };

    const updateAdmin = (field, value) => {
        setFases((prev) =>
            prev.map((period, i) => {
                if (i !== activeFaseIndex) return period;
                const termin = period.termin?.[0] || createDefaultTermin(i + 1);
                return {
                    ...period,
                    termin: [{ ...termin, [field]: value }],
                };
            })
        );
    };

    const updateAdminUpload = (uploadIndex, field, value) => {
        setFases((prev) =>
            prev.map((period, i) => {
                if (i !== activeFaseIndex) return period;
                const termin = period.termin?.[0] || createDefaultTermin(i + 1);
                return {
                    ...period,
                    termin: [{
                        ...termin,
                        persyaratan: termin.persyaratan.map((item, idx) =>
                            idx === uploadIndex ? { ...item, [field]: value } : item
                        ),
                    }],
                };
            })
        );
    };

    const addAdminUpload = () => {
        setFases((prev) =>
            prev.map((period, i) => {
                if (i !== activeFaseIndex) return period;
                const termin = period.termin?.[0] || createDefaultTermin(i + 1);
                return {
                    ...period,
                    termin: [{
                        ...termin,
                        persyaratan: [...termin.persyaratan, createDefaultRequirement("")],
                    }],
                };
            })
        );
    };

    const removeAdminUpload = (uploadIndex) => {
        const uploads = activePeriod.termin?.[0]?.persyaratan || [];
        if (uploads.length <= 1) {
            toast.error("Minimal satu bukti administratif pembuka periode.");
            return;
        }
        setFases((prev) =>
            prev.map((period, i) => {
                if (i !== activeFaseIndex) return period;
                const termin = period.termin?.[0];
                return {
                    ...period,
                    termin: [{
                        ...termin,
                        persyaratan: termin.persyaratan.filter((_, idx) => idx !== uploadIndex),
                    }],
                };
            })
        );
    };

    const addAktivitas = () => {
        setFases((prev) =>
            prev.map((period, i) => {
                if (i !== activeFaseIndex) return period;
                return {
                    ...period,
                    kegiatans: [
                        ...period.kegiatans,
                        createDefaultKegiatan(i + 1, period.kegiatans.length + 1),
                    ],
                };
            })
        );
    };

    const removeAktivitas = (aktivitasIndex) => {
        if (activePeriod.kegiatans.length <= 1) {
            toast.error("Minimal satu aktivitas per periode.");
            return;
        }
        setFases((prev) =>
            prev.map((period, i) => {
                if (i !== activeFaseIndex) return period;
                return {
                    ...period,
                    kegiatans: period.kegiatans.filter((_, idx) => idx !== aktivitasIndex),
                };
            })
        );
    };

    const updateAktivitas = (aktivitasIndex, field, value) => {
        setFases((prev) =>
            prev.map((period, i) => {
                if (i !== activeFaseIndex) return period;
                return {
                    ...period,
                    kegiatans: period.kegiatans.map((aktivitas, idx) =>
                        idx === aktivitasIndex ? { ...aktivitas, [field]: value } : aktivitas
                    ),
                };
            })
        );
    };

    const updatePertemuan = (aktivitasIndex, pertemuanIndex, field, value) => {
        setFases((prev) =>
            prev.map((period, i) => {
                if (i !== activeFaseIndex) return period;
                return {
                    ...period,
                    kegiatans: period.kegiatans.map((aktivitas, idx) => {
                        if (idx !== aktivitasIndex) return aktivitas;
                        const pertemuan = aktivitas.pertemuan?.length
                            ? aktivitas.pertemuan
                            : [createDefaultPertemuan(aktivitasIndex + 1, 1)];
                        return {
                            ...aktivitas,
                            pertemuan: pertemuan.map((item, pidx) =>
                                pidx === pertemuanIndex ? { ...item, [field]: value } : item
                            ),
                        };
                    }),
                };
            })
        );
    };

    const addPertemuan = (aktivitasIndex) => {
        setFases((prev) =>
            prev.map((period, i) => {
                if (i !== activeFaseIndex) return period;
                return {
                    ...period,
                    kegiatans: period.kegiatans.map((aktivitas, idx) => {
                        if (idx !== aktivitasIndex) return aktivitas;
                        const current = aktivitas.pertemuan || [];
                        return {
                            ...aktivitas,
                            pertemuan: [
                                ...current,
                                createDefaultPertemuan(aktivitasIndex + 1, current.length + 1),
                            ],
                        };
                    }),
                };
            })
        );
    };

    const removePertemuan = (aktivitasIndex, pertemuanIndex) => {
        const pertemuan = activePeriod.kegiatans[aktivitasIndex]?.pertemuan || [];
        if (pertemuan.length <= 1) {
            toast.error("Minimal satu pertemuan per aktivitas non-akademik.");
            return;
        }
        setFases((prev) =>
            prev.map((period, i) => {
                if (i !== activeFaseIndex) return period;
                return {
                    ...period,
                    kegiatans: period.kegiatans.map((aktivitas, idx) => {
                        if (idx !== aktivitasIndex) return aktivitas;
                        return {
                            ...aktivitas,
                            pertemuan: (aktivitas.pertemuan || []).filter((_, pidx) => pidx !== pertemuanIndex),
                        };
                    }),
                };
            })
        );
    };

    const updateAktivitasUpload = (aktivitasIndex, uploadIndex, field, value) => {
        setFases((prev) =>
            prev.map((period, i) => {
                if (i !== activeFaseIndex) return period;
                return {
                    ...period,
                    kegiatans: period.kegiatans.map((aktivitas, idx) => {
                        if (idx !== aktivitasIndex) return aktivitas;
                        return {
                            ...aktivitas,
                            persyaratan: aktivitas.persyaratan.map((item, pidx) =>
                                pidx === uploadIndex ? { ...item, [field]: value } : item
                            ),
                        };
                    }),
                };
            })
        );
    };

    const addAktivitasUpload = (aktivitasIndex) => {
        setFases((prev) =>
            prev.map((period, i) => {
                if (i !== activeFaseIndex) return period;
                return {
                    ...period,
                    kegiatans: period.kegiatans.map((aktivitas, idx) => {
                        if (idx !== aktivitasIndex) return aktivitas;
                        return {
                            ...aktivitas,
                            persyaratan: [...aktivitas.persyaratan, createDefaultRequirement("")],
                        };
                    }),
                };
            })
        );
    };

    const removeAktivitasUpload = (aktivitasIndex, uploadIndex) => {
        const uploads = activePeriod.kegiatans[aktivitasIndex]?.persyaratan || [];
        if (uploads.length <= 1) {
            toast.error("Minimal satu bukti upload aktivitas.");
            return;
        }
        setFases((prev) =>
            prev.map((period, i) => {
                if (i !== activeFaseIndex) return period;
                return {
                    ...period,
                    kegiatans: period.kegiatans.map((aktivitas, idx) => {
                        if (idx !== aktivitasIndex) return aktivitas;
                        return {
                            ...aktivitas,
                            persyaratan: aktivitas.persyaratan.filter((_, pidx) => pidx !== uploadIndex),
                        };
                    }),
                };
            })
        );
    };

    const activeAdmin = activePeriod?.termin?.[0];

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 rounded-[1.2rem] border border-slate-100 bg-slate-50 p-2">
                {fases.map((period, index) => {
                    const error = validateFase(period, kategori);
                    const active = activeFaseIndex === index;
                    return (
                        <button
                            key={index}
                            type="button"
                            onClick={() => setActiveFaseIndex(index)}
                            className={`rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition ${active
                                ? "bg-[#0AC4E0] text-white shadow-sm"
                                : "bg-white text-slate-400 hover:text-slate-700"
                                }`}
                        >
                            {period.nama_fase || `Periode ${index + 1}`}
                            {error ? (
                                <span className="ml-1 inline-flex h-2 w-2 rounded-full bg-amber-400" />
                            ) : (
                                <span className="ml-1 inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                            )}
                        </button>
                    );
                })}
                <button
                    type="button"
                    onClick={addPeriod}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-950 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white"
                >
                    <Plus size={11} />
                    Periode
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_280px]">
                <div className="space-y-4">
                    <SectionCard
                        icon={<CalendarDays size={16} />}
                        title={`Periode / Bulan ${activeFaseIndex + 1}`}
                        desc="Gunakan bulan atau rentang waktu sebagai pengganti fase."
                        className="!p-5"
                    >
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <FormField label="Nama Periode / Bulan">
                                <Input
                                    value={activePeriod.nama_fase}
                                    onChange={(e) => updatePeriod("nama_fase", e.target.value)}
                                    placeholder=""
                                    className="form-input"
                                />
                            </FormField>
                            <FormField label="Catatan Periode">
                                <Input
                                    value={activePeriod.deskripsi}
                                    onChange={(e) => updatePeriod("deskripsi", e.target.value)}
                                    placeholder=""
                                    className="form-input"
                                />
                            </FormField>
                        </div>
                        {fases.length > 1 && (
                            <button
                                type="button"
                                onClick={removePeriod}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-100 bg-rose-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-rose-600 transition hover:bg-rose-100"
                            >
                                <Trash2 size={12} />
                                Hapus Periode Ini
                            </button>
                        )}
                    </SectionCard>

                    <SectionCard
                        icon={<UploadCloud size={16} />}
                        title="Administrasi Pembuka Periode"
                        desc="Narasumber wajib upload bukti administratif sebelum aktivitas periode ini terbuka."
                        className="!p-5"
                    >
                        <FormField label="Instruksi Administrasi Pembuka">
                            <Input
                                value={activeAdmin?.deskripsi || ""}
                                onChange={(e) => updateAdmin("deskripsi", e.target.value)}
                                placeholder=""
                                className="form-input"
                            />
                        </FormField>
                        <div className="space-y-2">
                            {(activeAdmin?.persyaratan || []).map((upload, uploadIndex) => (
                                <div key={uploadIndex} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                    <div className="mb-2 flex items-center justify-between">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-[#0AC4E0]">
                                            Bukti Administratif {uploadIndex + 1}
                                        </p>
                                        {(activeAdmin?.persyaratan || []).length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeAdminUpload(uploadIndex)}
                                                className="flex h-6 w-6 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-500 transition hover:bg-rose-100"
                                            >
                                                <Trash2 size={11} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                        <FormField label="Nama Bukti">
                                            <Input
                                                value={upload.nama}
                                                onChange={(e) => updateAdminUpload(uploadIndex, "nama", e.target.value)}
                                                placeholder=""
                                                className="form-input !text-[11px]"
                                            />
                                        </FormField>
                                        <FormField label="Instruksi">
                                            <Input
                                                value={upload.deskripsi}
                                                onChange={(e) => updateAdminUpload(uploadIndex, "deskripsi", e.target.value)}
                                                placeholder=""
                                                className="form-input !text-[11px]"
                                            />
                                        </FormField>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addAdminUpload}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-100 bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 transition hover:text-[#0AC4E0]"
                            >
                                <Plus size={11} />
                                Tambah Bukti Administratif
                            </button>
                        </div>
                    </SectionCard>

                    <SectionCard
                        icon={<Layers3 size={16} />}
                        title="Aktivitas Kegiatan"
                        desc="Atur aktivitas, tenggat, dan bukti yang wajib diunggah."
                        className="!p-5"
                    >
                        <div className="space-y-3">
                            {(activePeriod.kegiatans || []).map((aktivitas, aktivitasIndex) => (
                                <div key={aktivitasIndex} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                                    <div className="mb-3 flex items-center justify-between">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-[#0AC4E0]">
                                                Aktivitas {aktivitasIndex + 1}
                                            </p>
                                            <p className="mt-0.5 text-[8px] font-bold text-slate-400">
                                                Bukti aktivitas, review AO, dan keputusan HO
                                            </p>
                                        </div>
                                        {activePeriod.kegiatans.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeAktivitas(aktivitasIndex)}
                                                className="flex h-6 w-6 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-500 transition hover:bg-rose-100"
                                            >
                                                <Trash2 size={11} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                                        <FormField label="Nama Aktivitas">
                                            <Input
                                                value={aktivitas.nama_kegiatans}
                                                onChange={(e) => updateAktivitas(aktivitasIndex, "nama_kegiatans", e.target.value)}
                                                placeholder=""
                                                className="form-input !text-[11px]"
                                            />
                                        </FormField>
                                        <FormField label="Deskripsi Aktivitas">
                                            <Input
                                                value={aktivitas.deskripsi}
                                                onChange={(e) => updateAktivitas(aktivitasIndex, "deskripsi", e.target.value)}
                                                placeholder=""
                                                className="form-input !text-[11px]"
                                            />
                                        </FormField>
                                        <FormField label="Tanggal Mulai">
                                            <Input
                                                type="date"
                                                value={aktivitas.tanggal_mulai || ""}
                                                onChange={(e) => updateAktivitas(aktivitasIndex, "tanggal_mulai", e.target.value)}
                                                className="form-input !text-[11px]"
                                            />
                                        </FormField>
                                        <FormField label="Tanggal Selesai">
                                            <Input
                                                type="date"
                                                value={aktivitas.tanggal_selesai || ""}
                                                onChange={(e) => updateAktivitas(aktivitasIndex, "tanggal_selesai", e.target.value)}
                                                className="form-input !text-[11px]"
                                            />
                                        </FormField>
                                    </div>

                                    {isNonAkademik && (
                                        <div className="mb-3 rounded-2xl border border-cyan-100 bg-cyan-50/40 p-3">
                                            <div className="mb-2 flex items-center justify-between gap-2">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-[#0AC4E0]">
                                                    Pertemuan Aktivitas
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => addPertemuan(aktivitasIndex)}
                                                    className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-[8px] font-black uppercase tracking-widest text-[#0AC4E0] ring-1 ring-cyan-100"
                                                >
                                                    <Plus size={10} />
                                                    Pertemuan
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                {(aktivitas.pertemuan || [createDefaultPertemuan(aktivitasIndex + 1, 1)]).map((pertemuan, pertemuanIndex) => (
                                                    <div key={pertemuanIndex} className="rounded-xl border border-cyan-100 bg-white p-3">
                                                        <div className="mb-2 flex items-center justify-between gap-2">
                                                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                                                                Pertemuan {pertemuanIndex + 1}
                                                            </span>
                                                            {(aktivitas.pertemuan || []).length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removePertemuan(aktivitasIndex, pertemuanIndex)}
                                                                    className="flex h-6 w-6 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-500"
                                                                >
                                                                    <Trash2 size={11} />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                                            <Input
                                                                value={pertemuan.nama_pertemuan}
                                                                onChange={(e) => updatePertemuan(aktivitasIndex, pertemuanIndex, "nama_pertemuan", e.target.value)}
                                                                placeholder=""
                                                                className="form-input !py-1.5 !text-[10px]"
                                                            />
                                                            <Input
                                                                value={pertemuan.deskripsi}
                                                                onChange={(e) => updatePertemuan(aktivitasIndex, pertemuanIndex, "deskripsi", e.target.value)}
                                                                placeholder=""
                                                                className="form-input !py-1.5 !text-[10px]"
                                                            />
                                                            <Input
                                                                type="date"
                                                                value={pertemuan.tanggal_mulai || ""}
                                                                onChange={(e) => updatePertemuan(aktivitasIndex, pertemuanIndex, "tanggal_mulai", e.target.value)}
                                                                className="form-input !py-1.5 !text-[10px]"
                                                            />
                                                            <Input
                                                                type="date"
                                                                value={pertemuan.tanggal_selesai || ""}
                                                                onChange={(e) => updatePertemuan(aktivitasIndex, pertemuanIndex, "tanggal_selesai", e.target.value)}
                                                                className="form-input !py-1.5 !text-[10px]"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Bukti Aktivitas</p>
                                        {(aktivitas.persyaratan || []).map((upload, uploadIndex) => (
                                            <div key={uploadIndex} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
                                                <div className="grid flex-1 grid-cols-1 gap-2 md:grid-cols-2">
                                                    <Input
                                                        value={upload.nama}
                                                        onChange={(e) => updateAktivitasUpload(aktivitasIndex, uploadIndex, "nama", e.target.value)}
                                                        placeholder=""
                                                        className="form-input !py-1.5 !text-[10px]"
                                                    />
                                                    <Input
                                                        value={upload.deskripsi}
                                                        onChange={(e) => updateAktivitasUpload(aktivitasIndex, uploadIndex, "deskripsi", e.target.value)}
                                                        placeholder=""
                                                        className="form-input !py-1.5 !text-[10px]"
                                                    />
                                                </div>
                                                {aktivitas.persyaratan.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAktivitasUpload(aktivitasIndex, uploadIndex)}
                                                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-500"
                                                    >
                                                        <Trash2 size={11} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => addAktivitasUpload(aktivitasIndex)}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-100 bg-white px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 transition hover:text-[#0AC4E0]"
                                        >
                                            <Plus size={10} />
                                            Tambah Bukti Aktivitas
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addAktivitas}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-slate-800"
                            >
                                <Plus size={11} />
                                Tambah Aktivitas
                            </button>
                        </div>
                    </SectionCard>
                </div>

                <aside className="space-y-3">
                    <div className="rounded-[1.2rem] border border-slate-100 bg-slate-50 p-3">
                        <p className="mb-2 text-[8px] font-black uppercase tracking-widest text-slate-400">Ringkasan Periode</p>
                        <div className="space-y-2">
                            {fases.map((period, index) => {
                                const error = validateFase(period, kategori);
                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => setActiveFaseIndex(index)}
                                        className={`w-full rounded-lg border p-2.5 text-left transition ${activeFaseIndex === index
                                            ? "border-[#0AC4E0]/20 bg-white"
                                            : "border-slate-100 bg-white/60 hover:bg-white"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-1.5">
                                            <div className="min-w-0">
                                                <p className="truncate text-[10px] font-black text-slate-800">
                                                    {period.nama_fase || `Periode ${index + 1}`}
                                                </p>
                                                <p className="mt-0.5 text-[8px] font-bold text-slate-400">
                                                    {(period.termin?.[0]?.persyaratan || []).length} administrasi · {(period.kegiatans || []).length} aktivitas
                                                </p>
                                            </div>
                                            <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[7px] font-black uppercase ${error ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
                                                {error ? "Cek" : "OK"}
                                            </span>
                                        </div>
                                        {error && activeFaseIndex === index && (
                                            <p className="mt-1.5 text-[8px] font-bold leading-relaxed text-amber-600">{error}</p>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="rounded-[1.2rem] border border-slate-100 bg-white p-3 shadow-sm">
                        <p className="mb-2 text-[8px] font-black uppercase tracking-widest text-slate-400">Pola Monitoring</p>
                        <div className="space-y-1.5 text-[9px] font-semibold leading-relaxed text-slate-500">
                            <p>Administrasi pembuka direview AO dan diputuskan HO.</p>
                            <p>Aktivitas terbuka setelah administrasi periode disetujui.</p>
                            <p>Bukti aktivitas melewati alur Narasumber, AO, lalu HO.</p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

// =========================================================================
// STEP 3 - REVIEW (tidak diubah)
// =========================================================================
function ReviewStep({ title, formData, hoUser, fases }) {
    const totalAktivitas = fases.reduce((total, periode) => total + (periode.kegiatans?.length || 0), 0);
    const totalAdministrasi = fases.reduce((total, periode) => total + (periode.termin?.[0]?.persyaratan || []).length, 0);
    const totalBuktiAktivitas = fases.reduce((total, periode) => {
        const aktivitasUploads = (periode.kegiatans || []).reduce((sum, aktivitas) => sum + (aktivitas.persyaratan?.length || 0), 0);
        return total + aktivitasUploads;
    }, 0);
    const totalUpload = totalAdministrasi + totalBuktiAktivitas;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <SectionCard icon={<Building2 size={16} />} title="Ringkasan Program" desc="Data inti yang akan disimpan.">
                    <ReviewGrid items={[
                        ["Nama Program", formData.namaProgram || "-"],
                        ["Pilar Program", getPilarProgramLabel(formData.pilarProgram)],
                        ["Jenis Program", formData.jenisProgram || "-"],
                        ["Status Awal", DEFAULT_STATUS_PROGRAM],
                        ["Tahun", formData.tahun || "-"],
                        ["Periode Program", formData.tanggalMulaiProgram && formData.tanggalSelesaiProgram
                            ? `${getMonthPeriodName(formData.tanggalMulaiProgram)} - ${getMonthPeriodName(formData.tanggalSelesaiProgram)}`
                            : "-"],
                        ["Head Office", hoUser.nama || "-"],
                        ["Nomor MOU", formData.nomorMou || "-"],
                        ["Anggaran Vendor", formatRupiah(formData.hargaVendor) || "Rp 0"],
                        ["Dokumen MOU", formData.fileName || "-"],
                    ]} />
                </SectionCard>
                <SectionCard icon={<UserCheck size={16} />} title="Tim Pelaksana" desc="Sasaran program dan aktor monitoring.">
                    <ReviewGrid items={[
                        ["Sekolah Sasaran", `${formData.selectedSekolahs.length} sekolah`],
                        ["Area Officer", `${formData.selectedAOs.length} AO`],
                        ["Vendor / Narasumber", `${formData.selectedVendors.length} narasumber`],
                        ["Periode / Bulan", `${fases.length} periode`],
                        ["Total Aktivitas", `${totalAktivitas} aktivitas`],
                        ["Total Upload", `${totalUpload} bukti`],
                    ]} />
                </SectionCard>
                <SectionCard icon={<ClipboardCheck size={16} />} title="Alur Monitoring" desc="Pola review yang akan diterapkan.">
                    <div className="space-y-2">
                        {[
                            "Narasumber upload administrasi pembuka periode.",
                            "AO memberi komentar dan review lapangan.",
                            "HO memberi keputusan ACC atau Reject.",
                            "Aktivitas terbuka setelah administrasi periode disetujui.",
                            "Narasumber upload bukti aktivitas.",
                            "AO review bukti aktivitas, lalu HO memberi keputusan final.",
                        ].map((item, index) => (
                            <div key={index} className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0AC4E0]/10 text-[9px] font-black text-[#0AC4E0]">{index + 1}</span>
                                <p className="text-[10px] font-bold leading-relaxed text-slate-600">{item}</p>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </div>
            <SectionCard icon={<CalendarDays size={16} />} title="Preview Periode & Aktivitas" desc="Ringkasan periode, administrasi pembuka, aktivitas, dan bukti yang akan dibuat.">
                <div className="space-y-3">
                    {fases.map((periode, periodeIndex) => {
                        const administrasi = periode.termin?.[0]?.persyaratan || [];
                        return (
                            <div key={periodeIndex} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-[#0AC4E0]">Periode {periodeIndex + 1}</p>
                                        <h4 className="mt-1 text-[14px] font-black text-slate-900">{periode.nama_fase || `Periode ${periodeIndex + 1}`}</h4>
                                        {periode.deskripsi && <p className="mt-1 text-[10px] font-semibold leading-relaxed text-slate-400">{periode.deskripsi}</p>}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="rounded-full bg-white px-3 py-1 text-[8px] font-black uppercase tracking-widest text-slate-500 ring-1 ring-slate-100">{administrasi.length} administrasi</span>
                                        <span className="rounded-full bg-white px-3 py-1 text-[8px] font-black uppercase tracking-widest text-slate-500 ring-1 ring-slate-100">{periode.kegiatans?.length || 0} aktivitas</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                                    <div className="rounded-lg border border-white bg-white p-3">
                                        <p className="mb-2 text-[8px] font-black uppercase tracking-widest text-slate-400">Administrasi Pembuka</p>
                                        <div className="space-y-1.5">
                                            {administrasi.map((item, index) => (
                                                <div key={index} className="rounded-lg bg-slate-50 px-3 py-2">
                                                    <p className="text-[10px] font-black text-slate-800">{item.nama || `Bukti Administratif ${index + 1}`}</p>
                                                    {item.deskripsi && <p className="mt-0.5 text-[9px] font-semibold leading-relaxed text-slate-400">{item.deskripsi}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="rounded-lg border border-white bg-white p-3">
                                        <p className="mb-2 text-[8px] font-black uppercase tracking-widest text-slate-400">Aktivitas Kegiatan</p>
                                        <div className="space-y-2">
                                            {(periode.kegiatans || []).map((aktivitas, aktivitasIndex) => (
                                                <div key={aktivitasIndex} className="rounded-lg bg-slate-50 px-3 py-2">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <p className="text-[10px] font-black text-slate-800">{aktivitas.nama_kegiatans || `Aktivitas ${aktivitasIndex + 1}`}</p>
                                                            <p className="mt-0.5 text-[8px] font-black uppercase tracking-widest text-[#0AC4E0]">{aktivitas.tanggal_mulai || "-"} sampai {aktivitas.tanggal_selesai || "-"}</p>
                                                        </div>
                                                        <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[7px] font-black uppercase tracking-widest text-slate-400 ring-1 ring-slate-100">{aktivitas.persyaratan?.length || 0} bukti</span>
                                                    </div>
                                                    {aktivitas.deskripsi && <p className="mt-1 text-[9px] font-semibold leading-relaxed text-slate-400">{aktivitas.deskripsi}</p>}
                                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                                        {(aktivitas.persyaratan || []).map((bukti, buktiIndex) => (
                                                            <span key={buktiIndex} className="rounded-full bg-white px-2 py-1 text-[7px] font-black uppercase tracking-widest text-slate-500 ring-1 ring-slate-100">{bukti.nama || `Bukti ${buktiIndex + 1}`}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </SectionCard>
        </div>
    );
}

// =========================================================================
// SHARED UI COMPONENTS
// =========================================================================
function SectionCard({ icon, title, desc, children, className = "" }) {
    return (
        <div className={`rounded-[1.2rem] border border-slate-100 bg-white p-4 shadow-sm ${className}`}>
            <div className="mb-3 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0AC4E0]/10 text-[#0AC4E0]">{icon}</div>
                <div>
                    <p className="text-[12px] font-black text-slate-900">{title}</p>
                    <p className="text-[9px] font-semibold text-slate-400">{desc}</p>
                </div>
            </div>
            <div className="space-y-3">{children}</div>
        </div>
    );
}

function ReviewGrid({ items }) {
    return (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {items.map(([label, value]) => (
                <div key={label} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                    <p className="text-[7px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                    <p className="mt-0.5 truncate text-[11px] font-black text-slate-800">{value}</p>
                </div>
            ))}
        </div>
    );
}

export default CreateProgramForm;
