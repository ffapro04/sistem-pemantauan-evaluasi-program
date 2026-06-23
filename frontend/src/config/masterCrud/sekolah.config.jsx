// src/config/masterCrud/sekolah.config.jsx
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";
import {
    Award,
    CalendarDays,
    Database,
    GraduationCap,
    Hash,
    Lock,
    Mail,
    MapPin,
    Navigation,
    School,
    ShieldCheck,
    UserRound,
    Image,
    Layers,
    ArrowUpAZ,
    ArrowDownAZ,
} from "lucide-react";

import {
    cleanWilayahName,
    isActiveValue,
} from "../../components/masterCrud";

const API_BASE_URL = "";

const AKREDITASI_INTERNAL_OPTIONS = [
    { value: "Unggul", label: "Unggul" },
    { value: "Pra-Unggul", label: "Pra-Unggul" },
    { value: "Prosung", label: "Prosung" },
    { value: "Swapraja", label: "Swapraja" },
    { value: "Praswapraja", label: "Praswapraja" },
    { value: "Proswa", label: "Proswa" },
    { value: "Pembinaan", label: "Pembinaan" },
    { value: "Dasar", label: "Dasar" },
    { value: "Belum Ditentukan", label: "Belum Ditentukan" },
];

const YES_NO_OPTIONS = [
    { value: "Sudah", label: "Sudah" },
    { value: "Belum", label: "Belum" },
];

const getAkreditasiInternal = (row) =>
    row?.akreditasi_internal ||
    row?.level_binaan ||
    row?.kategori_binaan ||
    "Dasar";

const normalizeYear = (value) => {
    if (value === undefined || value === null || value === "") return "";

    const numberValue = Number(value);

    if (Number.isNaN(numberValue)) return "";

    return numberValue;
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Payload helpers
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const normalizeArrayPayload = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.result)) return payload.result;
    return [];
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Wilayah helpers
// Sekolah harus pakai KABUPATEN/KOTA, bukan PROVINSI
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const getWilayahId = (wilayah) => wilayah?.id_wilayah ?? wilayah?.id;

const normalizeWilayah = (item) => ({
    ...item,
    id_wilayah: item?.id_wilayah ?? item?.idWilayah ?? item?.id,
    nama_wilayah: cleanWilayahName(
        item?.nama_wilayah || item?.namaWilayah || item?.nama,
    ),
    kode_wilayah:
        item?.kode_wilayah ||
        item?.kodeWilayah ||
        item?.kode_kabupaten ||
        "-",
    jenis_wilayah: item?.jenis_wilayah || "KABUPATEN",
    tipe_wilayah: item?.tipe_wilayah || "Absolute",
    status: item?.status ?? true,
    id_parent: item?.id_parent ?? item?.parent?.id_wilayah ?? null,
    parent: item?.parent || null,
});

const getWilayahList = (auxData = {}) =>
    normalizeArrayPayload(auxData?.wilayahList || [])
        .map(normalizeWilayah)
        .filter((w) => {
            const jenis = String(w.jenis_wilayah || "").toUpperCase();

            return (
                w.id_wilayah &&
                isActiveValue(w.status) &&
                (jenis === "KABUPATEN" || jenis === "KOTA")
            );
        })
        .sort((a, b) =>
            String(a.nama_wilayah || "").localeCompare(
                String(b.nama_wilayah || ""),
            ),
        );

const getKabupatenOptions = (auxData = {}) =>
    getWilayahList(auxData).map((item) => ({
        value: String(item.id_wilayah),
        label: item.nama_wilayah,
        description: item.parent?.nama_wilayah || "",
        meta: item.jenis_wilayah || "KABUPATEN",
        icon: MapPin,

        id_wilayah: item.id_wilayah,
        kode_kabupaten: item.kode_wilayah,
        nama_kabupaten: item.nama_wilayah,
        nama_provinsi: item.parent?.nama_wilayah || "",
        id_parent: item.id_parent || item.parent?.id_wilayah || null,
    }));

const findSelectedWilayahOption = (formData = {}, auxData = {}) => {
    return getKabupatenOptions(auxData).find(
        (item) => String(item.value) === String(formData.id_wilayah),
    );
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Row helpers
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const getRowWilayah = (row) => {
    if (row?.wilayah && typeof row.wilayah === "object") return row.wilayah;

    if (row?.id_wilayah || row?.nama_wilayah) {
        return {
            id_wilayah: row.id_wilayah,
            nama_wilayah: row.nama_wilayah,
            kode_wilayah: row.kode_wilayah,
            parent: row.parent,
        };
    }

    return null;
};

const getWilayahName = (row) => {
    const wilayah = getRowWilayah(row);

    return cleanWilayahName(
        row?.nama_kabupaten ||
        wilayah?.nama_wilayah ||
        wilayah?.nama ||
        row?.nama_wilayah ||
        "Belum Ditentukan",
    );
};

const getWilayahCode = (row) => {
    const wilayah = getRowWilayah(row);

    return (
        row?.kode_kabupaten ||
        wilayah?.kode_wilayah ||
        row?.kode_wilayah ||
        "-"
    );
};

const getProvinceName = (row) => {
    const wilayah = getRowWilayah(row);

    return (
        wilayah?.parent?.nama_wilayah ||
        row?.nama_provinsi ||
        row?.provinsi ||
        "Provinsi belum terbaca"
    );
};

const getLogoUrl = (row) => {
    const logo = row?.logo_url || row?.logoUrl || row?.logo;

    if (!logo) return "";
    if (String(logo).startsWith("http")) return logo;

    return `${API_BASE_URL}${logo}`;
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Normalize sekolah
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const normalizeSekolah = (row) => {
    const wilayah = getRowWilayah(row);

    return {
        ...row,
        id_sekolah: row?.id_sekolah ?? row?.idSekolah ?? row?.id,
        npsn: row?.npsn || "-",
        nama_sekolah:
            row?.nama_sekolah || row?.namaSekolah || row?.nama || "Sekolah",
        jenjang: row?.jenjang || row?.tingkat || "SD",

        id_wilayah:
            row?.id_wilayah ||
            row?.idWilayah ||
            wilayah?.id_wilayah ||
            wilayah?.id ||
            "",

        wilayah,
        nama_kabupaten:
            row?.nama_kabupaten ||
            row?.namaKabupaten ||
            wilayah?.nama_wilayah ||
            "",
        kode_kabupaten:
            row?.kode_kabupaten ||
            row?.kodeKabupaten ||
            wilayah?.kode_wilayah ||
            "",

        akreditasi: row?.akreditasi || "Belum Terakreditasi",
        akreditasi_internal: getAkreditasiInternal(row),
        tahun_binaan: normalizeYear(
            row?.tahun_binaan ||
            row?.tahunBinaan ||
            row?.wilayah?.tahun_awal_binaan
        ),
        sertifikat_iso: row?.sertifikat_iso || "Belum",
        adiwiyata: row?.adiwiyata || "Belum",
        area: row?.area || "",

        jumlah_guru: Number(row?.jumlah_guru || row?.jumlahGuru || 0),
        jumlah_siswa: Number(row?.jumlah_siswa || row?.jumlahSiswa || 0),
        email_login: row?.email_login || "",
        password_login: "",

        alamat: row?.alamat || "",
        latitude: row?.latitude ?? row?.lat ?? "",
        longitude: row?.longitude ?? row?.lng ?? row?.lon ?? "",
        logo_url: row?.logo_url || row?.logoUrl || row?.logo || "",
        status: row?.status ?? true,
    };
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Sort
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const SORT_OPTIONS = [
    { value: "newest", label: "TERBARU", icon: ArrowDownAZ },
    { value: "az", label: "ABJAD A-Z", icon: ArrowUpAZ },
    { value: "za", label: "ABJAD Z-A", icon: ArrowDownAZ },
];

const compareSekolah = (a, b, sortBy = "newest") => {
    if (sortBy === "az") {
        return String(a.nama_sekolah || "").localeCompare(
            String(b.nama_sekolah || ""),
        );
    }

    if (sortBy === "za") {
        return String(b.nama_sekolah || "").localeCompare(
            String(a.nama_sekolah || ""),
        );
    }

    return Number(b.id_sekolah || 0) - Number(a.id_sekolah || 0);
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Config
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const sekolahConfig = {
    entityKey: "sekolah",
    storageKey: "master_sekolah",
    entityName: "Sekolah",
    pageTitle: "Manajemen Data",
    pageHighlight: "Sekolah",
    subtitle: "Registry Sekolah Binaan YPA-MDR",
    countLabel: "Sekolah",

    idKey: "id_sekolah",
    displayKey: "nama_sekolah",

    routes: {
        read: "/admin/sekolah",
        create: "/admin/sekolah/create",
        detail: (row) => `/admin/sekolah/detail/${row.id_sekolah}`,
        edit: (row) => `/admin/sekolah/edit/${row.id_sekolah}`,
    },

    api: {
        list: "/sekolah",
        detail: (id) => `/sekolah/${id}`,
        create: "/sekolah",
        update: (id) => `/sekolah/${id}`,
    },

    auxiliary: [
        {
            key: "wilayahList",
            endpoint: "/wilayah",
            getPayload: normalizeArrayPayload,
            normalize: normalizeWilayah,
        },
    ],

    messages: {
        fetchError: "Gagal memuat data Sekolah",
        detailError: "Gagal mengambil data Sekolah",
        createSuccess: "Data Sekolah berhasil ditambahkan.",
        updateSuccess: "Data Sekolah berhasil diperbarui.",
        submitError: "Gagal menyimpan data Sekolah.",
        statusError: "Gagal memperbarui status Sekolah.",
    },

    itemsPerPage: 5,

    sortOptions: SORT_OPTIONS,
    defaultSortBy: "newest",
    sortRows: (a, b, sortBy = "newest") => compareSekolah(a, b, sortBy),

    getInitialValues: () => ({
        npsn: "",
        nama_sekolah: "",
        jenjang: "SD",
        id_wilayah: "",
        kode_kabupaten: "",
        nama_kabupaten: "",
        jumlah_guru: "",
        jumlah_siswa: "",
        email_login: "",
        password_login: "",
        akreditasi: "Belum Terakreditasi",
        akreditasi_internal: "Dasar",
        tahun_binaan: "",
        sertifikat_iso: "Belum",
        adiwiyata: "Belum",
        area: "",
        alamat: "",
        latitude: "",
        longitude: "",
        logo: null,
        logo_url: "",
        status: true,
    }),

    normalizeRow: normalizeSekolah,

    normalizeDetail: (payload) => {
        const normalized = normalizeSekolah(payload);

        return {
            ...normalized,
            id_wilayah: normalized.id_wilayah
                ? String(normalized.id_wilayah)
                : "",
            kode_kabupaten:
                normalized.kode_kabupaten ||
                normalized.wilayah?.kode_wilayah ||
                "",
            nama_kabupaten:
                normalized.nama_kabupaten ||
                normalized.wilayah?.nama_wilayah ||
                "",
            tahun_binaan:
                normalized.tahun_binaan ||
                payload?.wilayah?.tahun_awal_binaan ||
                "",
            logo: null,
            logo_url: normalized.logo_url || "",
            password_login: "",
        };
    },

    onFieldChange: ({ field, value, next, auxData }) => {
        const safeAuxData = auxData || {};

        if (field === "id_wilayah") {
            const selected = getKabupatenOptions(safeAuxData).find(
                (item) => String(item.value) === String(value),
            );

            return {
                ...next,
                id_wilayah: value,
                kode_kabupaten: selected?.kode_kabupaten || "",
                nama_kabupaten: selected?.nama_kabupaten || "",
            };
        }

        return next;
    },

    searchKeys: [
        "npsn",
        "nama_sekolah",
        "jenjang",
        "akreditasi",
        "akreditasi_internal",
        "tahun_binaan",
        "sertifikat_iso",
        "adiwiyata",
        "area",
        "nama_kabupaten",
        "kode_kabupaten",
        (row) => getWilayahName(row),
        (row) => getWilayahCode(row),
        (row) => getProvinceName(row),
    ],

    filters: [
        {
            name: "jenjang",
            defaultValue: "all",
            icon: GraduationCap,
            width: "w-52",
            items: [
                { value: "all", label: "SEMUA JENJANG" },
                { value: "SD", label: "SD" },
                { value: "SMP", label: "SMP" },
                { value: "SMK", label: "SMK" },
            ],
            predicate: (row, value) => {
                if (value === "all") return true;

                return (
                    String(row.jenjang).toUpperCase() ===
                    String(value).toUpperCase()
                );
            },
        },
        {
            name: "wilayah",
            defaultValue: "all",
            icon: MapPin,
            width: "w-64",
            items: ({ auxData }) => [
                { value: "all", label: "SELURUH KAB/KOTA" },
                ...getWilayahList(auxData).map((w) => ({
                    value: String(w.id_wilayah),
                    label: w.nama_wilayah.toUpperCase(),
                })),
            ],
            predicate: (row, value) => {
                if (value === "all") return true;

                const wilayah = getRowWilayah(row);
                const rowId = row.id_wilayah || getWilayahId(wilayah);

                return Number(rowId) === Number(value);
            },
        },
        {
            name: "status",
            defaultValue: "all",
            icon: ShieldCheck,
            width: "w-52",
            items: [
                { value: "all", label: "SEMUA STATUS" },
                { value: "active", label: "STATUS: AKTIF" },
                { value: "inactive", label: "STATUS: NONAKTIF" },
            ],
            predicate: (row, value) => {
                if (value === "all") return true;

                const active = isActiveValue(row.status);

                return value === "active" ? active : !active;
            },
        },
        {
            name: "akreditasi_internal",
            defaultValue: "all",
            icon: Award,
            width: "w-56",
            items: [
                { value: "all", label: "SEMUA LEVEL BINAAN" },
                ...AKREDITASI_INTERNAL_OPTIONS.map((item) => ({
                    value: item.value,
                    label: item.label.toUpperCase(),
                })),
            ],
            predicate: (row, value) => {
                if (value === "all") return true;

                return (
                    String(row.akreditasi_internal || "").toUpperCase() ===
                    String(value).toUpperCase()
                );
            },
        },
    ],

    summary: (rows) => {
        const totalSD = rows.filter(
            (r) => String(r.jenjang).toUpperCase() === "SD",
        ).length;

        const totalSMP = rows.filter(
            (r) => String(r.jenjang).toUpperCase() === "SMP",
        ).length;

        const totalSMK = rows.filter(
            (r) => String(r.jenjang).toUpperCase() === "SMK",
        ).length;

        return [
            { label: "SD", value: totalSD, icon: School },
            { label: "SMP", value: totalSMP, icon: School },
            { label: "SMK", value: totalSMK, icon: School },
        ];
    },

    status: {
        getValue: (row) => row.status,
        endpoint: (row) => `/sekolah/${row.id_sekolah}`,
        payload: (nextStatus) => ({ status: nextStatus }),
        successMessage: (row, nextStatus) =>
            `${row.nama_sekolah || "Sekolah"} sekarang ${nextStatus ? "Aktif" : "Nonaktif"
            }`,
    },

    columns: [
        {
            header: "Identitas Sekolah",
            align: "text-left w-[34%]",
            render: (row) => (
                <div className="flex w-full justify-start py-2 text-left">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0AC4E0]/10 text-[#0AC4E0]">
                            {getLogoUrl(row) ? (
                                <img
                                    src={getLogoUrl(row)}
                                    alt={row.nama_sekolah || "Logo"}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <School size={18} />
                            )}
                        </div>

                        <div className="min-w-0">
                            <p className="whitespace-normal break-words text-[11px] font-black uppercase leading-snug text-slate-800">
                                {row.nama_sekolah || "-"}
                            </p>

                            <p className="mt-1 flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                                <Hash size={10} className="shrink-0" />
                                NPSN: {row.npsn || "-"}
                            </p>

                            <p className="mt-2 text-[8px] font-black uppercase tracking-widest text-slate-300">
                                {row.jenjang || "-"} · ID:{" "}
                                {row.id_sekolah || "-"}
                            </p>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: "Wilayah & Profil",
            align: "text-left w-[42%]",
            render: (row) => (
                <div className="flex w-full justify-start py-2 text-left">
                    <div className="flex min-w-0 flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="rounded-lg border border-[#0AC4E0]/10 bg-[#0AC4E0]/5 px-2.5 py-1 text-[9px] font-black uppercase tracking-tight text-[#0AC4E0]">
                                {getWilayahName(row)}
                            </span>

                            <span className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-tight text-slate-500">
                                {getProvinceName(row)}
                            </span>

                            <span className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-tight text-slate-500">
                                Akreditasi {row.akreditasi || "Belum Terakreditasi"}
                            </span>

                            <span className="rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-tight text-emerald-600">
                                {row.akreditasi_internal || "Dasar"}
                            </span>

                            {row.tahun_binaan && (
                                <span className="rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-tight text-indigo-600">
                                    Binaan {row.tahun_binaan}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-[9px] font-bold text-slate-400">
                            <span>{row.jumlah_guru || 0} Guru</span>
                            <span>·</span>
                            <span>{row.jumlah_siswa || 0} Siswa</span>
                        </div>
                    </div>
                </div>
            ),
        },
    ],

    sections: [
        {
            title: "Data Sekolah & Lokasi",
            description: "Isi data pokok dan lokasi sekolah binaan.",
            icon: School,
            className:
                "rounded-3xl border border-blue-100/60 bg-blue-50/40 p-5",
            gridClassName: "grid grid-cols-1 md:grid-cols-2 gap-4",
            fields: [
                {
                    name: "npsn",
                    label: "NPSN",
                    type: "text",
                    icon: Hash,
                    required: true,
                    placeholder: "Masukkan NPSN",
                },
                {
                    name: "nama_sekolah",
                    label: "Nama Sekolah",
                    type: "text",
                    icon: School,
                    required: true,
                    placeholder: "Masukkan nama sekolah",
                },
                {
                    name: "jenjang",
                    label: "Jenjang",
                    type: "select",
                    icon: GraduationCap,
                    required: true,
                    options: [
                        { value: "SD", label: "SD" },
                        { value: "SMP", label: "SMP" },
                        { value: "SMK", label: "SMK" },
                    ],
                },
                {
                    name: "akreditasi",
                    label: "Akreditasi",
                    type: "select",
                    icon: Award,
                    required: true,
                    options: [
                        { value: "A", label: "A" },
                        { value: "B", label: "B" },
                        { value: "C", label: "C" },
                        {
                            value: "Belum Terakreditasi",
                            label: "Belum Terakreditasi",
                        },
                    ],
                    help: "Pilih status akreditasi sekolah",
                },
                {
                    name: "akreditasi_internal",
                    label: "Level Binaan",
                    type: "select",
                    icon: Award,
                    required: true,
                    options: AKREDITASI_INTERNAL_OPTIONS,
                    help: "Level binaan internal sekolah, berbeda dari akreditasi A/B/C.",
                },
                {
                    name: "tahun_binaan",
                    label: "Tahun Binaan",
                    type: "number",
                    icon: CalendarDays,
                    placeholder: "Contoh: 2022",
                    help: "Tahun awal sekolah menjadi binaan YPA-MDR.",
                },
                {
                    name: "email_login",
                    label: "Email Login",
                    type: "email",
                    icon: Mail,
                    required: true,
                    placeholder: "email@sekolah.sch.id",
                },
                {
                    name: "password_login",
                    label: "Password",
                    type: "password",
                    icon: Lock,
                    requiredOnCreate: true,
                    minLength: 8,
                    placeholder: "Minimal 8 karakter",
                },
                {
                    name: "jumlah_guru",
                    label: "Jumlah Guru",
                    type: "number",
                    icon: UserRound,
                    required: true,
                    placeholder: "0",
                },
                {
                    name: "jumlah_siswa",
                    label: "Jumlah Siswa",
                    type: "number",
                    icon: UserRound,
                    required: true,
                    placeholder: "0",
                },
                {
                    name: "id_wilayah",
                    label: "Kabupaten/Kota",
                    type: "multiSelectCards",
                    icon: Layers,
                    required: true,
                    searchable: true,
                    singleSelect: true,
                    searchPlaceholder: "Ketik nama kabupaten/kota...",
                    maxHeight: 260,
                    gridClassName: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
                    wrapperClassName: "md:col-span-2",
                    options: ({ auxData }) => getKabupatenOptions(auxData),
                    emptyText: "Kabupaten/kota tidak ditemukan",
                },
                {
                    name: "alamat",
                    label: "Alamat",
                    type: "textarea",
                    icon: MapPin,
                    wrapperClassName: "md:col-span-2",
                    placeholder: "Alamat lengkap sekolah",
                },
                {
                    name: "latitude",
                    label: "Latitude",
                    type: "number",
                    icon: Navigation,
                    placeholder: "Contoh: -6.123456",
                },
                {
                    name: "longitude",
                    label: "Longitude",
                    type: "number",
                    icon: Navigation,
                    placeholder: "Contoh: 106.123456",
                },
            ],
        },
        {
            title: "Kualifikasi Tambahan",
            description:
                "Data tambahan untuk profil sekolah, dashboard operator, dan laporan kelembagaan.",
            icon: ShieldCheck,
            className:
                "rounded-3xl border border-emerald-100/70 bg-emerald-50/30 p-5",
            gridClassName: "grid grid-cols-1 md:grid-cols-2 gap-4",
            fields: [
                {
                    name: "area",
                    label: "Area",
                    type: "text",
                    icon: Layers,
                    placeholder: "Contoh: Area Barat",
                },
                {
                    name: "sertifikat_iso",
                    label: "Sertifikat ISO",
                    type: "select",
                    icon: ShieldCheck,
                    options: YES_NO_OPTIONS,
                },
                {
                    name: "adiwiyata",
                    label: "Adiwiyata",
                    type: "select",
                    icon: ShieldCheck,
                    options: YES_NO_OPTIONS,
                },
            ],
        },
        {
            title: "Logo Sekolah",
            description:
                "Logo sekolah bersifat opsional dan akan tampil di tabel serta detail sekolah.",
            icon: Image,
            className:
                "rounded-3xl border border-slate-100 bg-white p-5 shadow-sm",
            gridClassName: "grid grid-cols-1 gap-4",
            fields: [
                {
                    name: "logo",
                    label: "Logo Sekolah",
                    type: "file",
                    icon: Image,
                    accept: "image/*",
                    help: "Upload logo sekolah jika tersedia.",
                },
            ],
        },
    ],

    validate: ({ mode, formData }) => {
        if (!formData.npsn?.trim()) return "NPSN wajib diisi.";
        if (!formData.nama_sekolah?.trim()) return "Nama sekolah wajib diisi.";
        if (!formData.jenjang) return "Jenjang sekolah wajib dipilih.";
        if (!formData.akreditasi) return "Akreditasi nasional wajib dipilih.";
        if (!formData.akreditasi_internal) return "Level binaan wajib dipilih.";
        if (!formData.email_login?.trim())
            return "Email login sekolah wajib diisi.";
        if (!formData.id_wilayah)
            return "Kabupaten/kota sekolah wajib dipilih.";

        if (
            formData.tahun_binaan &&
            String(formData.tahun_binaan).length !== 4
        ) {
            return "Tahun binaan harus 4 digit, contoh: 2022.";
        }

        if (
            mode === "create" &&
            String(formData.password_login || "").length < 8
        ) {
            return "Password login minimal 8 karakter.";
        }

        if (
            mode === "edit" &&
            formData.password_login &&
            String(formData.password_login).length < 8
        ) {
            return "Password login minimal 8 karakter.";
        }

        return true;
    },

    buildPayload: ({ mode, formData, auxData }) => {
        const payload = new FormData();

        const selectedWilayah = findSelectedWilayahOption(formData, auxData);

        payload.append("npsn", formData.npsn?.trim() || "");
        payload.append("nama_sekolah", formData.nama_sekolah?.trim() || "");
        payload.append("jenjang", formData.jenjang || "SD");

        // Ini yang paling penting:
        // id_wilayah harus id kabupaten/kota, bukan id provinsi.
        payload.append("id_wilayah", String(formData.id_wilayah || ""));

        payload.append(
            "id_kabupaten",
            String(formData.id_wilayah || ""),
        );

        payload.append(
            "kode_kabupaten",
            selectedWilayah?.kode_kabupaten || formData.kode_kabupaten || "",
        );

        payload.append(
            "nama_kabupaten",
            selectedWilayah?.nama_kabupaten || formData.nama_kabupaten || "",
        );

        payload.append("jumlah_guru", String(Number(formData.jumlah_guru || 0)));
        payload.append(
            "jumlah_siswa",
            String(Number(formData.jumlah_siswa || 0)),
        );

        payload.append("email_login", formData.email_login?.trim() || "");
        payload.append(
            "akreditasi",
            formData.akreditasi || "Belum Terakreditasi",
        );

        payload.append(
            "akreditasi_internal",
            formData.akreditasi_internal || "Dasar",
        );

        if (
            formData.tahun_binaan !== undefined &&
            formData.tahun_binaan !== null &&
            formData.tahun_binaan !== ""
        ) {
            payload.append("tahun_binaan", String(Number(formData.tahun_binaan)));
        }


        payload.append("sertifikat_iso", formData.sertifikat_iso || "Belum");
        payload.append("adiwiyata", formData.adiwiyata || "Belum");
        payload.append("area", formData.area?.trim() || "");

        payload.append("status", String(formData.status ?? true));

        if (mode === "create" || formData.password_login?.trim()) {
            payload.append("password_login", formData.password_login || "");
        }

        if (formData.alamat) {
            payload.append("alamat", formData.alamat);
        }

        if (formData.latitude !== "" && formData.latitude !== null) {
            payload.append("latitude", String(Number(formData.latitude)));
        }

        if (formData.longitude !== "" && formData.longitude !== null) {
            payload.append("longitude", String(Number(formData.longitude)));
        }

        if (formData.logo instanceof File) {
            payload.append("logo", formData.logo);
        }

        return payload;
    },

    formTitle: {
        create: "Tambah Data",
        edit: "Edit Data",
    },

    submitLabel: {
        create: "Simpan Sekolah",
        edit: "Update Sekolah",
    },

    previewLabel: "Preview Sekolah",
    previewTitle: "Ringkasan Sekolah",

    preview: [
        {
            label: "Logo",
            value: ({ formData }) =>
                formData.logo?.name || formData.logo_url || "Belum ada logo",
            className: "truncate text-[11px] font-bold text-slate-500",
        },
        {
            label: "Nama Sekolah",
            key: "nama_sekolah",
        },
        {
            label: "NPSN",
            key: "npsn",
            className:
                "truncate text-[12px] font-black uppercase text-[#0AC4E0]",
        },
        {
            label: "Jenjang",
            key: "jenjang",
            className:
                "truncate text-[12px] font-black uppercase text-slate-800",
        },
        {
            label: "Akreditasi Nasional",
            key: "akreditasi",
            className:
                "truncate text-[12px] font-black uppercase text-slate-800",
        },
        {
            label: "Level Binaan",
            key: "akreditasi_internal",
            className:
                "truncate text-[12px] font-black uppercase text-emerald-600",
        },
        {
            label: "Tahun Binaan",
            key: "tahun_binaan",
            className:
                "truncate text-[12px] font-black uppercase text-indigo-600",
        },
        {
            label: "Provinsi",
            value: ({ formData, auxData }) => {
                const selected = findSelectedWilayahOption(formData, auxData);
                return selected?.nama_provinsi || "Belum dipilih";
            },
            className:
                "truncate text-[12px] font-black uppercase text-slate-800",
        },
        {
            label: "Kabupaten/Kota",
            value: ({ formData, auxData }) => {
                const selected = findSelectedWilayahOption(formData, auxData);
                return (
                    selected?.nama_kabupaten ||
                    formData.nama_kabupaten ||
                    "Belum dipilih"
                );
            },
            className:
                "truncate text-[12px] font-black uppercase text-slate-800",
        },
        {
            label: "Email Login",
            key: "email_login",
            className: "truncate text-[11px] font-bold lowercase text-slate-500",
        },
    ],

    infoBox:
        "Data sekolah digunakan sebagai target assessment, program, monitoring, dan pelaporan per wilayah.",

    detailTitle: "Detail Data",

    detail: {
        titleKey: "nama_sekolah",
        subtitleKey: "npsn",
        initialKey: "nama_sekolah",
        avatarImage: (data) => getLogoUrl(data),
        sideLabel: "School Registry",
        description:
            "Detail Sekolah berisi identitas sekolah, jenjang, wilayah binaan, kabupaten/kota, dan status aktif data.",
        badges: [
            {
                type: "status",
                key: "status",
                activeText: "Aktif",
                inactiveText: "Nonaktif",
            },
            {
                key: "jenjang",
                icon: GraduationCap,
            },
            {
                key: "akreditasi_internal",
                icon: Award,
            },
            {
                key: "tahun_binaan",
                icon: CalendarDays,
            },
        ],
        sections: [
            {
                title: "Identitas Sekolah",
                description: "Informasi dasar sekolah binaan.",
                icon: School,
                items: [
                    {
                        label: "Logo Sekolah",
                        icon: Image,
                        type: "image",
                        value: (data) => getLogoUrl(data),
                    },
                    {
                        label: "Nama Sekolah",
                        key: "nama_sekolah",
                        icon: School,
                    },
                    {
                        label: "NPSN",
                        key: "npsn",
                        icon: Hash,
                    },
                    {
                        label: "Jenjang",
                        key: "jenjang",
                        icon: GraduationCap,
                    },
                    {
                        label: "Akreditasi Nasional",
                        key: "akreditasi",
                        icon: Award,
                    },
                    {
                        label: "Level Binaan",
                        key: "akreditasi_internal",
                        icon: Award,
                    },
                    {
                        label: "Tahun Binaan",
                        key: "tahun_binaan",
                        icon: CalendarDays,
                        format: (value) => value || "-",
                    },
                    {
                        label: "Email Login",
                        key: "email_login",
                        icon: Mail,
                    },
                    {
                        label: "Status",
                        key: "status",
                        icon: ShieldCheck,
                        format: (value) =>
                            isActiveValue(value) ? "Aktif" : "Nonaktif",
                    },
                ],
            },
            {
                title: "Wilayah & Lokasi",
                description: "Wilayah binaan dan kabupaten/kota sekolah.",
                icon: MapPin,
                items: [
                    {
                        label: "Kabupaten/Kota",
                        icon: Layers,
                        value: (data) =>
                            data.nama_kabupaten ||
                            getWilayahName(data) ||
                            "Belum Ditentukan",
                    },
                    {
                        label: "Provinsi",
                        icon: MapPin,
                        value: (data) => getProvinceName(data),
                    },
                    {
                        label: "Kode Wilayah",
                        icon: Database,
                        value: (data) => getWilayahCode(data),
                    },
                    {
                        label: "Alamat",
                        key: "alamat",
                        icon: MapPin,
                        format: (value) => value || "Alamat belum diisi.",
                    },
                    {
                        label: "Jumlah Guru",
                        key: "jumlah_guru",
                        icon: UserRound,
                        format: (value) => `${value || 0} Guru`,
                    },
                    {
                        label: "Jumlah Siswa",
                        key: "jumlah_siswa",
                        icon: UserRound,
                        format: (value) => `${value || 0} Siswa`,
                    },
                    {
                        label: "Latitude",
                        key: "latitude",
                        icon: Navigation,
                    },
                    {
                        label: "Longitude",
                        key: "longitude",
                        icon: Navigation,
                    },
                ],
            },
            {
                title: "Kualifikasi Mutu",
                description:
                    "Informasi tambahan mutu sekolah dan status kelembagaan.",
                icon: ShieldCheck,
                items: [
                    {
                        label: "Sertifikat ISO",
                        key: "sertifikat_iso",
                        icon: ShieldCheck,
                        format: (value) => value || "Belum",
                    },
                    {
                        label: "Adiwiyata",
                        key: "adiwiyata",
                        icon: ShieldCheck,
                        format: (value) => value || "Belum",
                    },
                    {
                        label: "Area",
                        key: "area",
                        icon: Layers,
                        format: (value) => value || "-",
                    },
                ],
            },
        ],
    },
};

export default sekolahConfig;

