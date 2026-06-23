/* eslint-disable no-unused-vars */
// src/config/masterCrud/wilayah.config.jsx
// Update: filter cakupan Wilayah YPA-MDR berdasarkan sekolah aktif.
import React from "react";
import {
    CalendarDays,
    CheckCircle,
    Database,
    Globe2,
    Layers,
    MapPin,
    Building2,
    ArrowUpAZ,
    ArrowDownAZ,
    School,
    UserRound,
} from "lucide-react";

import { isActiveValue } from "../../components/masterCrud";

const normalizeKlasifikasi = (value) => {
    const raw = String(value || "").toLowerCase();
    if (raw.includes("independent") || raw.includes("bukan") || raw.includes("mandiri") || raw.includes("non")) {
        return "Independent";
    }
    return "Absolute";
};

const normalizeArrayPayload = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.result)) return payload.result;
    return [];
};

// Normalize untuk data kabupaten/kota
const normalizeWilayah = (item) => ({
    ...item,
    id_wilayah: item?.id_wilayah,
    kode_wilayah: item?.kode_wilayah || "-",
    nama_wilayah: item?.nama_wilayah || "Kabupaten Tidak Diketahui",
    provinsi: item?.parent?.nama_wilayah || "-",
    tipe_wilayah: normalizeKlasifikasi(item?.tipe_wilayah),
    jenis_wilayah: item?.jenis_wilayah || "KABUPATEN",
    status: item?.status ?? true,
    tahun_awal_binaan: item?.tahun_awal_binaan || "",
    jumlah_sd: item?.jumlah_sd || 0,
    jumlah_smp: item?.jumlah_smp || 0,
    jumlah_smk: item?.jumlah_smk || 0,
    jumlah_guru: item?.jumlah_guru || 0,
    jumlah_siswa: item?.jumlah_siswa || 0,
    deskripsi: item?.deskripsi || "",
    parent: item?.parent,
});

// Sort options
const SORT_OPTIONS = [
    { value: "az", label: "ABJAD A-Z", icon: ArrowUpAZ },
    { value: "za", label: "ABJAD Z-A", icon: ArrowDownAZ },
];

const sortWilayah = (rows, sortBy = "az") => {
    if (!rows || !Array.isArray(rows)) return rows || [];
    const sorted = [...rows];
    if (sortBy === "az") {
        return sorted.sort((a, b) => (a.nama_wilayah || "").localeCompare(b.nama_wilayah || ""));
    }
    if (sortBy === "za") {
        return sorted.sort((a, b) => (b.nama_wilayah || "").localeCompare(a.nama_wilayah || ""));
    }
    return sorted;
};

// Ambil daftar provinsi unik dari data kabupaten
const getProvinceFilterItems = (auxData = {}) => {
    const provinces = Array.isArray(auxData?.provinsiList)
        ? auxData.provinsiList
        : [];

    return [
        { value: "all", label: "SEMUA PROVINSI" },
        ...provinces
            .filter(
                (prov) =>
                    prov.id_wilayah &&
                    isActiveValue(prov.status) &&
                    String(prov.jenis_wilayah || "").toUpperCase() === "PROVINSI",
            )
            .sort((a, b) =>
                String(a.nama_wilayah || "").localeCompare(
                    String(b.nama_wilayah || ""),
                ),
            )
            .map((prov) => ({
                value: String(prov.id_wilayah),
                label: `Provinsi ${prov.nama_wilayah}`,
            })),
    ];
};

const getWilayahAuxList = (auxData = {}) =>
    normalizeArrayPayload(auxData?.wilayahList || []).map(normalizeWilayah);

const normalizeSekolah = (item) => ({
    ...item,
    id_sekolah: item?.id_sekolah ?? item?.idSekolah ?? item?.id,
    id_wilayah:
        item?.id_wilayah ??
        item?.idWilayah ??
        item?.wilayah?.id_wilayah ??
        item?.wilayah?.id,
    id_kabupaten:
        item?.id_kabupaten ??
        item?.idKabupaten ??
        item?.id_wilayah ??
        item?.wilayah?.id_wilayah ??
        item?.wilayah?.id,
    status: item?.status ?? true,
    wilayah: item?.wilayah || null,
});

const getSekolahList = (auxData = {}) =>
    normalizeArrayPayload(auxData?.sekolahList || [])
        .map(normalizeSekolah)
        .filter((sekolah) => sekolah.id_sekolah && isActiveValue(sekolah.status));

const getKabupatenIdFromSekolah = (sekolah) => {
    const value =
        sekolah?.id_kabupaten ??
        sekolah?.id_wilayah ??
        sekolah?.wilayah?.id_wilayah ??
        sekolah?.wilayah?.id;

    const id = Number(value);
    return Number.isFinite(id) ? id : null;
};

const getWilayahLookup = (auxData = {}) => {
    const map = new Map();

    getWilayahAuxList(auxData).forEach((wilayah) => {
        const id = Number(wilayah?.id_wilayah);
        if (Number.isFinite(id)) {
            map.set(id, wilayah);
        }
    });

    return map;
};

const getKabupatenBinaanIds = (auxData = {}) => {
    const ids = new Set();

    getSekolahList(auxData).forEach((sekolah) => {
        const id = getKabupatenIdFromSekolah(sekolah);
        if (id) ids.add(id);
    });

    return ids;
};

const getProvinsiBinaanIds = (auxData = {}) => {
    const ids = new Set();
    const wilayahLookup = getWilayahLookup(auxData);

    getSekolahList(auxData).forEach((sekolah) => {
        const kabupatenId = getKabupatenIdFromSekolah(sekolah);
        const wilayah = wilayahLookup.get(Number(kabupatenId)) || sekolah?.wilayah;

        const provinsiId =
            wilayah?.id_parent ??
            wilayah?.parent?.id_wilayah ??
            wilayah?.parent?.id ??
            sekolah?.id_provinsi ??
            sekolah?.idProvinsi;

        const id = Number(provinsiId);
        if (Number.isFinite(id)) {
            ids.add(id);
        }
    });

    return ids;
};

const isProvinsiRow = (row) =>
    String(row?.jenis_wilayah || "").toUpperCase() === "PROVINSI";

const isWilayahYpamdr = (row, auxData = {}) => {
    const rowId = Number(row?.id_wilayah);

    if (!Number.isFinite(rowId)) return false;

    if (isProvinsiRow(row)) {
        return getProvinsiBinaanIds(auxData).has(rowId);
    }

    return getKabupatenBinaanIds(auxData).has(rowId);
};

export const wilayahConfig = {
    entityKey: "wilayah",
    storageKey: "master_wilayah",
    entityName: "Wilayah",
    pageTitle: "Manajemen Data",
    pageHighlight: "Kabupaten/Kota",
    subtitle: "Sistem Pemantauan Program",
    countLabel: "Kabupaten/Kota",

    idKey: "id_wilayah",
    displayKey: "nama_wilayah",

    routes: {
        read: "/admin/wilayah",
        create: "/admin/wilayah/create",
        detail: (row) => `/admin/wilayah/detail/${row.id_wilayah}`,
        edit: (row) => `/admin/wilayah/edit/${row.id_wilayah}`,
    },

    api: {
        list: "/wilayah",
        detail: (id) => `/wilayah/${id}`,
        create: "/wilayah",
        update: (id) => `/wilayah/${id}`,
    },

    auxiliary: [
        {
            key: "provinsiList",
            endpoint: "/wilayah/provinsi",
            getPayload: normalizeArrayPayload,
            normalize: (item) => ({
                ...item,
                id_wilayah: item?.id_wilayah,
                kode_wilayah: item?.kode_wilayah || "-",
                nama_wilayah: item?.nama_wilayah || "Provinsi Tidak Diketahui",
                jenis_wilayah: item?.jenis_wilayah || "PROVINSI",
                status: item?.status ?? true,
            }),
        },
        {
            key: "wilayahList",
            endpoint: "/wilayah",
            getPayload: normalizeArrayPayload,
            normalize: normalizeWilayah,
        },
        {
            key: "sekolahList",
            endpoint: "/sekolah",
            getPayload: normalizeArrayPayload,
            normalize: normalizeSekolah,
        },
    ],

    messages: {
        fetchError: "Gagal memuat data Wilayah",
        detailError: "Gagal mengambil data Wilayah",
        createSuccess: "Data Wilayah berhasil ditambahkan.",
        updateSuccess: "Data Wilayah berhasil diperbarui.",
        submitError: "Gagal menyimpan data Wilayah.",
        statusError: "Gagal memperbarui status Wilayah.",
    },

    itemsPerPage: 5,

    sortOptions: SORT_OPTIONS,
    defaultSortBy: "az",
    sortRows: (rows, sortBy = "az") => sortWilayah(rows, sortBy),

    getInitialValues: () => ({
        nama_wilayah: "",
        kode_wilayah: "",
        provinsi: "",
        tipe_wilayah: "Absolute",
        tahun_awal_binaan: "",
        jumlah_sd: 0,
        jumlah_smp: 0,
        jumlah_smk: 0,
        jumlah_guru: 0,
        jumlah_siswa: 0,
        deskripsi: "",
        status: true,
        id_parent: null,
    }),

    normalizeRow: normalizeWilayah,

    normalizeDetail: (payload) => {
        return {
            id_wilayah: payload?.id_wilayah,
            nama_wilayah: payload?.nama_wilayah || "",
            kode_wilayah: payload?.kode_wilayah || "",
            provinsi: payload?.parent?.nama_wilayah || "",
            tipe_wilayah: payload?.tipe_wilayah || "Absolute",
            tahun_awal_binaan: payload?.tahun_awal_binaan || "",
            jumlah_sd: payload?.jumlah_sd || 0,
            jumlah_smp: payload?.jumlah_smp || 0,
            jumlah_smk: payload?.jumlah_smk || 0,
            jumlah_guru: payload?.jumlah_guru || 0,
            jumlah_siswa: payload?.jumlah_siswa || 0,
            deskripsi: payload?.deskripsi || "",
            status: payload?.status ?? true,
            id_parent: payload?.id_parent || payload?.parent?.id_wilayah || null,
        };
    },

    searchKeys: ["nama_wilayah", "kode_wilayah", "provinsi", "tipe_wilayah", "deskripsi"],

    filters: [
        {
            name: "cakupan",
            label: "CAKUPAN",
            defaultValue: "all",
            icon: School,
            width: "w-56",
            items: [
                { value: "all", label: "SEMUA WILAYAH" },
                { value: "ypamdr", label: "WILAYAH YPA-MDR" },
            ],
            predicate: (row, value, { auxData }) => {
                if (value === "all") return true;
                return isWilayahYpamdr(row, auxData);
            },
        },
        {
            name: "provinsi",
            label: "PROVINSI",
            defaultValue: "all",
            icon: MapPin,
            width: "w-64",
            items: ({ auxData }) => getProvinceFilterItems(auxData),
            predicate: (row, value) => {
                if (value === "all") return true;

                const parentId =
                    row?.id_parent ||
                    row?.parent?.id_wilayah ||
                    row?.parent?.id;

                return Number(parentId) === Number(value);
            },
        },
        {
            name: "tipe",
            label: "KLASIFIKASI",
            defaultValue: "all",
            icon: Globe2,
            width: "w-56",
            items: [
                { value: "all", label: "SEMUA KLASIFIKASI" },
                { value: "Absolute", label: "ABSOLUTE" },
                { value: "Independent", label: "INDEPENDENT" },
            ],
            predicate: (row, value) => {
                if (value === "all") return true;
                return normalizeKlasifikasi(row.tipe_wilayah) === value;
            },
        },
        {
            name: "status",
            label: "STATUS",
            defaultValue: "all",
            icon: CheckCircle,
            width: "w-52",
            items: [
                { value: "all", label: "SEMUA STATUS" },
                { value: "active", label: "AKTIF" },
                { value: "inactive", label: "NONAKTIF" },
            ],
            predicate: (row, value) => {
                if (value === "all") return true;
                const active = isActiveValue(row.status);
                return value === "active" ? active : !active;
            },
        },
    ],

    summary: (rows) => {
        const total = rows?.length || 0;
        return [{ label: "Total Kabupaten", value: total, icon: Building2 }];
    },

    status: {
        getValue: (row) => row.status,
        endpoint: (row) => `/wilayah/${row.id_wilayah}`,
        payload: (nextStatus) => ({ status: nextStatus }),
        successMessage: (row, nextStatus) =>
            `${row.nama_wilayah} sekarang ${nextStatus ? "Aktif" : "Nonaktif"}`,
    },

    columns: [
        {
            header: "Kabupaten/Kota",
            align: "text-left w-[25%]",
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0AC4E0]/10 text-[#0AC4E0]">
                        <Building2 size={16} />
                    </div>
                    <div>
                        <p className="text-[11px] font-black uppercase text-slate-800">
                            {row.nama_wilayah || "-"}
                        </p>
                        <p className="text-[9px] text-slate-400">{row.kode_wilayah || "-"}</p>
                    </div>
                </div>
            ),
        },
        {
            header: "Provinsi",
            align: "text-left w-[15%]",
            render: (row) => (
                <div className="flex items-center gap-2">
                    <MapPin size={12} className="text-slate-300" />
                    <p className="text-[10px] font-bold uppercase text-slate-600">
                        {row.parent?.nama_wilayah || "-"}
                    </p>
                </div>
            ),
        },
        {
            header: "Tahun Binaan",
            align: "text-center w-[10%]",
            render: (row) => (
                <span className="text-[10px] font-bold">{row.tahun_awal_binaan || "-"}</span>
            ),
        },
        {
            header: "SD",
            align: "text-center w-[8%]",
            render: (row) => <span className="font-bold text-[10px]">{row.jumlah_sd || 0}</span>,
        },
        {
            header: "SMP",
            align: "text-center w-[8%]",
            render: (row) => <span className="font-bold text-[10px]">{row.jumlah_smp || 0}</span>,
        },
        {
            header: "SMK",
            align: "text-center w-[8%]",
            render: (row) => <span className="font-bold text-[10px]">{row.jumlah_smk || 0}</span>,
        },
        {
            header: "Guru",
            align: "text-center w-[10%]",
            render: (row) => <span className="font-bold text-[10px]">{row.jumlah_guru || 0}</span>,
        },
        {
            header: "Siswa",
            align: "text-center w-[12%]",
            render: (row) => <span className="font-bold text-[10px]">{row.jumlah_siswa?.toLocaleString() || 0}</span>,
        },
        {
            header: "Klasifikasi",
            align: "text-left w-[10%]",
            render: (row) => {
                const tipe = normalizeKlasifikasi(row.tipe_wilayah);
                const isIndependent = tipe === "Independent";
                return (
                    <span className={`rounded-lg border px-2 py-0.5 text-[8px] font-black uppercase tracking-tight ${isIndependent
                        ? "border-purple-100 bg-purple-50 text-purple-600"
                        : "border-[#0AC4E0]/10 bg-[#0AC4E0]/5 text-[#0AC4E0]"
                        }`}>
                        {tipe}
                    </span>
                );
            },
        },
    ],

    sections: [
        {
            title: "Identitas Kabupaten/Kota",
            description: "Informasi dasar kabupaten/kota binaan.",
            icon: Building2,
            className: "rounded-3xl border border-blue-100/60 bg-blue-50/40 p-5",
            gridClassName: "grid grid-cols-1 md:grid-cols-2 gap-4",
            fields: [
                {
                    name: "nama_wilayah",
                    label: "Nama Kabupaten/Kota",
                    type: "text",
                    icon: Building2,
                    required: true,
                    placeholder: "Masukkan nama kabupaten/kota",
                },
                {
                    name: "kode_wilayah",
                    label: "Kode Wilayah",
                    type: "text",
                    icon: Database,
                    disabled: true,
                    help: "Kode wilayah otomatis dari sistem",
                },
                {
                    name: "provinsi",
                    label: "Provinsi",
                    type: "text",
                    icon: MapPin,
                    disabled: true,
                    help: "Provinsi ditentukan dari induk wilayah",
                },
                {
                    name: "tipe_wilayah",
                    label: "Klasifikasi",
                    type: "select",
                    icon: Globe2,
                    required: true,
                    options: [
                        { value: "Absolute", label: "ABSOLUTE" },
                        { value: "Independent", label: "INDEPENDENT" },
                    ],
                    help: "Absolute = binaan utama, Independent = mandiri/non-binaan",
                },
            ],
        },
        {
            title: "Data Binaan",
            description: "Informasi statistik sekolah binaan di wilayah ini.",
            icon: School,
            className: "rounded-3xl border border-green-100/60 bg-green-50/40 p-5",
            gridClassName: "grid grid-cols-1 md:grid-cols-3 gap-4",
            fields: [
                {
                    name: "tahun_awal_binaan",
                    label: "Tahun Awal Binaan",
                    type: "number",
                    icon: CalendarDays,
                    placeholder: "Contoh: 2006",
                    help: "Tahun pertama wilayah ini menjadi binaan",
                },
                {
                    name: "jumlah_sd",
                    label: "Jumlah SD",
                    type: "number",
                    icon: School,
                    placeholder: "0",
                    disabled: true,
                    help: "Dihitung otomatis dari data sekolah",
                },
                {
                    name: "jumlah_smp",
                    label: "Jumlah SMP",
                    type: "number",
                    icon: School,
                    placeholder: "0",
                    disabled: true,
                    help: "Dihitung otomatis dari data sekolah",
                },
                {
                    name: "jumlah_smk",
                    label: "Jumlah SMK/SMA",
                    type: "number",
                    icon: School,
                    placeholder: "0",
                    disabled: true,
                    help: "Dihitung otomatis dari data sekolah",
                },
                {
                    name: "jumlah_guru",
                    label: "Jumlah Guru",
                    type: "number",
                    icon: UserRound,
                    placeholder: "0",
                    disabled: true,
                    help: "Dihitung otomatis dari data sekolah",
                },
                {
                    name: "jumlah_siswa",
                    label: "Jumlah Siswa",
                    type: "number",
                    icon: UserRound,
                    placeholder: "0",
                    disabled: true,
                    help: "Dihitung otomatis dari data sekolah",
                },
            ],
        },
        {
            title: "Catatan",
            description: "Informasi tambahan wilayah binaan.",
            icon: Database,
            className: "rounded-3xl border border-slate-100 bg-slate-50/60 p-5",
            gridClassName: "grid grid-cols-1 gap-4",
            fields: [
                {
                    name: "deskripsi",
                    label: "Deskripsi / Catatan",
                    type: "textarea",
                    icon: Database,
                    placeholder: "Catatan tentang wilayah binaan, kondisi, atau informasi lainnya...",
                    rows: 3,
                },
            ],
        },
    ],

    validate: ({ formData }) => {
        if (!formData.nama_wilayah?.trim()) {
            return "Nama kabupaten/kota wajib diisi.";
        }
        return true;
    },

    buildPayload: ({ formData }) => {
        return {
            nama_wilayah: formData.nama_wilayah,
            kode_wilayah: formData.kode_wilayah,
            tipe_wilayah: formData.tipe_wilayah,
            jenis_wilayah: "KABUPATEN",
            tahun_awal_binaan: formData.tahun_awal_binaan
                ? Number(formData.tahun_awal_binaan)
                : null,
            deskripsi: formData.deskripsi || "",
            status: formData.status ?? true,
            id_parent: formData.id_parent,
        };
    },
    formTitle: {
        create: "Tambah Kabupaten/Kota",
        edit: "Edit Kabupaten/Kota",
    },

    submitLabel: {
        create: "Simpan Kabupaten",
        edit: "Update Kabupaten",
    },

    previewLabel: "Preview Data",
    previewTitle: "Ringkasan Kabupaten/Kota",

    preview: [
        { label: "Nama Kabupaten", key: "nama_wilayah" },
        { label: "Kode Wilayah", key: "kode_wilayah" },
        { label: "Provinsi", key: "provinsi" },
        { label: "Klasifikasi", key: "tipe_wilayah" },
        { label: "Tahun Binaan", key: "tahun_awal_binaan" },
        { label: "Jumlah SD", key: "jumlah_sd" },
        { label: "Jumlah SMP", key: "jumlah_smp" },
        { label: "Jumlah SMK", key: "jumlah_smk" },
        { label: "Jumlah Guru", key: "jumlah_guru" },
        { label: "Jumlah Siswa", key: "jumlah_siswa" },
    ],

    infoBox: "Data kabupaten/kota digunakan untuk referensi sekolah, Area Officer, dan pemetaan program.",

    detailTitle: "Detail Data",

    detail: {
        titleKey: "nama_wilayah",
        subtitleKey: "kode_wilayah",
        initialKey: "nama_wilayah",
        sideLabel: "Kabupaten/Kota Registry",
        description: "Detail kabupaten/kota binaan.",
        badges: [
            {
                type: "status",
                key: "status",
                activeText: "Aktif",
                inactiveText: "Nonaktif",
            },
            {
                value: (data) => normalizeKlasifikasi(data.tipe_wilayah),
                icon: Globe2,
            },
        ],
        sections: [
            {
                title: "Identitas Wilayah",
                description: "Informasi dasar kabupaten/kota.",
                icon: Building2,
                items: [
                    {
                        label: "Nama Kabupaten",
                        key: "nama_wilayah",
                        icon: Building2,
                    },
                    {
                        label: "Kode Wilayah",
                        key: "kode_wilayah",
                        icon: Database,
                    },
                    {
                        label: "Provinsi",
                        key: "provinsi",
                        icon: MapPin,
                    },
                    {
                        label: "Klasifikasi",
                        key: "tipe_wilayah",
                        icon: Globe2,
                        format: (value) => normalizeKlasifikasi(value),
                    },
                ],
            },
            {
                title: "Data Binaan",
                description: "Statistik sekolah binaan di wilayah ini.",
                icon: School,
                items: [
                    {
                        label: "Tahun Awal Binaan",
                        key: "tahun_awal_binaan",
                        icon: CalendarDays,
                        format: (value) => value || "Belum Ditentukan",
                    },
                    {
                        label: "Jumlah SD",
                        key: "jumlah_sd",
                        icon: School,
                    },
                    {
                        label: "Jumlah SMP",
                        key: "jumlah_smp",
                        icon: School,
                    },
                    {
                        label: "Jumlah SMK",
                        key: "jumlah_smk",
                        icon: School,
                    },
                    {
                        label: "Jumlah Guru",
                        key: "jumlah_guru",
                        icon: UserRound,
                    },
                    {
                        label: "Jumlah Siswa",
                        key: "jumlah_siswa",
                        icon: UserRound,
                        format: (value) => value?.toLocaleString() || 0,
                    },
                ],
            },
            {
                title: "Deskripsi",
                description: "Informasi tambahan wilayah.",
                icon: Database,
                items: [
                    {
                        label: "Deskripsi",
                        key: "deskripsi",
                        icon: Database,
                        format: (value) => value || "Tidak ada deskripsi",
                    },
                ],
            },
        ],
    },
};

export default wilayahConfig;
