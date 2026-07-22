/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";
import {
    BookOpen,
    FileText,
    Hash,
    Image as ImageIcon,
    Layers,
    School,
    ShieldCheck,
    ArrowUpAZ,
    ArrowDownAZ,
} from "lucide-react";

import { isActiveValue } from "../../components/masterCrud";

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "";

const getJurusanImageUrl = (imagePath) => {
    if (!imagePath) return "";

    const value = String(imagePath).trim();
    if (!value) return "";

    if (/^https?:\/\//i.test(value)) return value;
    if (value.startsWith("/")) return `${API_BASE_URL}${value}`;
    if (value.startsWith("uploads/")) return `${API_BASE_URL}/${value}`;

    return `${API_BASE_URL}/uploads/jurusan/${value}`;
};

const getCurrentUser = () => {
    try {
        const raw = localStorage.getItem("user");
        if (raw) return JSON.parse(raw);
    } catch {
        // ignore
    }

    try {
        const token = localStorage.getItem("token");
        if (!token) return {};
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload || {};
    } catch {
        return {};
    }
};

const getOperatorSekolahId = (user = {}) => {
    const currentUser =
        user && Object.keys(user).length > 0 ? user : getCurrentUser();

    return (
        currentUser?.id_sekolah ||
        currentUser?.sekolah?.id_sekolah ||
        currentUser?.sekolah?.id ||
        ""
    );
};

const normalizeJurusan = (row) => ({
    ...row,
    id_jurusan: row?.id_jurusan ?? row?.id,
    id_sekolah: row?.id_sekolah || row?.sekolah?.id_sekolah || "",
    nama_jurusan: row?.nama_jurusan || row?.nama || "",
    kode_jurusan: String(row?.kode_jurusan || row?.kode || "").toUpperCase(),
    deskripsi: row?.deskripsi || "",
    gambar_jurusan: row?.gambar_jurusan || row?.gambar_jurusan_url || row?.image_url || "",
    gambar_jurusan_url: getJurusanImageUrl(
        row?.gambar_jurusan_url || row?.gambar_jurusan || row?.image_url || "",
    ),
    status: row?.status ?? true,
});

const SORT_OPTIONS = [
    { value: "az", label: "ABJAD A-Z", icon: ArrowUpAZ },
    { value: "za", label: "ABJAD Z-A", icon: ArrowDownAZ },
    { value: "kode", label: "KODE JURUSAN", icon: Hash },
];

const compareJurusan = (a, b, sortBy = "az") => {
    if (sortBy === "za") {
        return String(b.nama_jurusan || "").localeCompare(
            String(a.nama_jurusan || ""),
        );
    }

    if (sortBy === "kode") {
        return String(a.kode_jurusan || "").localeCompare(
            String(b.kode_jurusan || ""),
        );
    }

    return String(a.nama_jurusan || "").localeCompare(
        String(b.nama_jurusan || ""),
    );
};

export const jurusanConfig = {
    entityKey: "jurusan",
    storageKey: "master_jurusan_sekolah",
    entityName: "Jurusan",
    pageTitle: "Manajemen Data",
    pageHighlight: "Jurusan",
    subtitle: "Mini master jurusan khusus sekolah jenjang SMK",
    countLabel: "Jurusan",

    idKey: "id_jurusan",
    displayKey: "nama_jurusan",

    routes: {
        read: "/sekolah/jurusan",
        create: "/sekolah/jurusan/create",
        detail: (row) => `/sekolah/jurusan/detail/${row.id_jurusan}`,
        edit: (row) => `/sekolah/jurusan/edit/${row.id_jurusan}`,
    },

    api: {
        list: ({ user }) => {
            const idSekolah = getOperatorSekolahId(user);
            return `/jurusan/sekolah/${idSekolah}`;
        },
        detail: (id) => `/jurusan/${id}`,
        create: "/jurusan",
        update: (id) => `/jurusan/${id}`,

        // MasterReadPage lama mengirim ROW ke api.delete, bukan ID.
        delete: (row) => `/jurusan/${row.id_jurusan}`,
    },

    requiresAuth: true,
    requiresSekolahId: true,

    messages: {
        fetchError: "Gagal memuat data jurusan",
        detailError: "Gagal mengambil data jurusan",
        createSuccess: "Data jurusan berhasil ditambahkan.",
        updateSuccess: "Data jurusan berhasil diperbarui.",
        deleteSuccess: "Data jurusan berhasil dihapus.",
        submitError: "Gagal menyimpan data jurusan.",
        statusError: "Gagal memperbarui status jurusan.",
    },

    itemsPerPage: 10,

    sortOptions: SORT_OPTIONS,
    defaultSortBy: "az",
    sortRows: (a, b, sortBy = "az") => compareJurusan(a, b, sortBy),

    getInitialValues: ({ user }) => ({
        id_sekolah: getOperatorSekolahId(user),
        nama_jurusan: "",
        kode_jurusan: "",
        deskripsi: "",
        gambar_jurusan: "",
        gambar_jurusan_file: null,
        status: true,
    }),

    normalizeRow: normalizeJurusan,
    normalizeDetail: normalizeJurusan,

    searchKeys: ["nama_jurusan", "kode_jurusan", "deskripsi"],

    filters: [
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
    ],

    status: {
        getValue: (row) => row.status,
        endpoint: (row) => `/jurusan/${row.id_jurusan}`,
        payload: (nextStatus) => ({ status: nextStatus }),
        successMessage: (row, nextStatus) =>
            `${row.nama_jurusan || "Jurusan"} sekarang ${nextStatus ? "Aktif" : "Nonaktif"
            }`,
    },

    columns: [
        {
            header: "Identitas Jurusan",
            align: "text-left w-[55%]",
            render: (row) => (
                <div className="flex items-start gap-3 py-2 text-left">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0AC4E0]/10 text-[#0AC4E0]">
                        <BookOpen size={18} />
                    </div>

                    <div className="min-w-0">
                        <p className="whitespace-normal break-words text-[11px] font-black uppercase leading-snug text-slate-800">
                            {row.nama_jurusan || "-"}
                        </p>

                        <p className="mt-1 flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                            <Hash size={10} className="shrink-0" />
                            Kode: {row.kode_jurusan || "-"}
                        </p>
                        {row.deskripsi && (
                            <p className="mt-2 line-clamp-2 max-w-xl text-[9px] font-semibold leading-relaxed text-slate-400">
                                {row.deskripsi}
                            </p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            header: "Status & Sekolah",
            align: "text-left w-[35%]",
            render: (row) => (
                <div className="flex flex-wrap items-center gap-2 py-2 text-left">
                    <span className="rounded-lg bg-[#0AC4E0]/5 px-2.5 py-1 text-[9px] font-black uppercase text-[#0AC4E0]">
                        ID Sekolah: {row.id_sekolah || "-"}
                    </span>

                    <span
                        className={`rounded-lg px-2.5 py-1 text-[9px] font-black uppercase ${isActiveValue(row.status)
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-rose-50 text-rose-600"
                            }`}
                    >
                        {isActiveValue(row.status) ? "Aktif" : "Nonaktif"}
                    </span>
                </div>
            ),
        },
    ],

    sections: [
        {
            title: "Data Jurusan",
            description:
                "Isi jurusan SMK sekali saja agar tidak terjadi duplikasi penulisan seperti TKR dan Teknik Kendaraan Ringan.",
            icon: BookOpen,
            className:
                "rounded-3xl border border-blue-100/60 bg-blue-50/40 p-5",
            gridClassName: "grid grid-cols-1 md:grid-cols-2 gap-4",
            fields: [
                {
                    name: "nama_jurusan",
                    label: "Nama Jurusan",
                    type: "text",
                    icon: BookOpen,
                    required: true,
                    placeholder: "Contoh: Teknik Kendaraan Ringan",
                },
                {
                    name: "kode_jurusan",
                    label: "Kode Jurusan",
                    type: "text",
                    icon: Hash,
                    required: true,
                    placeholder: "Contoh: TKR",
                    help: "Gunakan kode singkat yang konsisten, contoh: TKR, RPL, TKJ, AKL.",
                },
                {
                    name: "deskripsi",
                    label: "Deskripsi Jurusan",
                    type: "textarea",
                    icon: FileText,
                    wrapperClassName: "md:col-span-2",
                    placeholder:
                        "Contoh: Jurusan yang berfokus pada perawatan, perbaikan, dan teknologi kendaraan ringan.",
                    help: "Deskripsi ini akan tampil di dashboard operator sekolah saat jurusan dipilih.",
                },
                {
                    name: "gambar_jurusan_file",
                    label: "Gambar Jurusan",
                    type: "file",
                    icon: ImageIcon,
                    wrapperClassName: "md:col-span-2",
                    accept: "image/png,image/jpeg,image/jpg,image/webp",
                    maxSize: 3 * 1024 * 1024,
                    buttonText: "Upload Gambar Jurusan",
                    previewAsImage: true,
                    existingUrlField: "gambar_jurusan_url",
                    existingNameField: "gambar_jurusan",
                    help: "Opsional. Gambar ini akan tampil di carousel dashboard sekolah.",
                },
            ],
        },
    ],

    validate: ({ formData, user }) => {
        const idSekolah = getOperatorSekolahId(user);

        if (!idSekolah) {
            return "Akun operator belum terhubung dengan sekolah.";
        }

        if (!formData.nama_jurusan?.trim()) {
            return "Nama jurusan wajib diisi.";
        }

        if (!formData.kode_jurusan?.trim()) {
            return "Kode jurusan wajib diisi.";
        }

        return true;
    },

    buildPayload: ({ formData, user }) => {
        const payload = new FormData();

        payload.append("id_sekolah", Number(getOperatorSekolahId(user)));
        payload.append("nama_jurusan", formData.nama_jurusan?.trim() || "");
        payload.append("kode_jurusan", formData.kode_jurusan?.trim().toUpperCase() || "");
        payload.append("deskripsi", formData.deskripsi?.trim() || "");
        payload.append("status", formData.status ?? true);

        if (formData.gambar_jurusan_file instanceof File) {
            payload.append("gambar_jurusan_file", formData.gambar_jurusan_file);
        }

        if (formData.gambar_jurusan) {
            payload.append("gambar_jurusan", formData.gambar_jurusan);
        }

        return payload;
    },
    formTitle: {
        create: "Tambah Data",
        edit: "Edit Data",
    },

    submitLabel: {
        create: "Simpan Jurusan",
        edit: "Update Jurusan",
    },

    previewLabel: "Preview Jurusan",
    previewTitle: "Ringkasan Jurusan",

    preview: [
        {
            label: "Nama Jurusan",
            key: "nama_jurusan",
        },
        {
            label: "Kode Jurusan",
            key: "kode_jurusan",
            className:
                "truncate text-[12px] font-black uppercase text-[#0AC4E0]",
        },
    ],

    infoBox:
        "Mini master jurusan dipakai oleh data kelas SMK agar nama jurusan konsisten dan tidak tumpang tindih.",

    detailTitle: "Detail Data",

    detail: {
        titleKey: "nama_jurusan",
        subtitleKey: "kode_jurusan",
        initialKey: "nama_jurusan",
        sideLabel: "Major Registry",
        description:
            "Detail jurusan berisi nama jurusan, kode jurusan, status, dan relasi sekolah.",
        badges: [
            {
                type: "status",
                key: "status",
                activeText: "Aktif",
                inactiveText: "Nonaktif",
            },
            {
                key: "kode_jurusan",
                icon: Hash,
            },
        ],
        sections: [
            {
                title: "Informasi Jurusan",
                description: "Data jurusan pada sekolah jenjang SMK.",
                icon: BookOpen,
                items: [
                    {
                        label: "Nama Jurusan",
                        key: "nama_jurusan",
                        icon: BookOpen,
                    },
                    {
                        label: "Kode Jurusan",
                        key: "kode_jurusan",
                        icon: Hash,
                    },
                    {
                        label: "Deskripsi",
                        key: "deskripsi",
                        icon: FileText,
                        format: (value) => value || "Belum ada deskripsi.",
                    },
                    {
                        label: "Gambar Jurusan",
                        key: "gambar_jurusan",
                        icon: ImageIcon,
                        format: (value) => value || "Belum ada gambar.",
                    },
                    {
                        label: "ID Sekolah",
                        key: "id_sekolah",
                        icon: School,
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
        ],
    },

    deleteConfirmation: (row) => ({
        title: "Hapus Data Jurusan?",
        text: `Jurusan "${row.nama_jurusan}" akan dihapus dari daftar jurusan sekolah.`,
        icon: "warning",
        confirmButtonText: "Ya, Hapus",
        cancelButtonText: "Batal",
    }),
};

export default jurusanConfig;
