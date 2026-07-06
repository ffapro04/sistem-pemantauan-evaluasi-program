// src/config/masterCrud/kepalaDinas.config.jsx

/* eslint-disable react/prop-types */
import React from "react";
import {
    Briefcase,
    Database,
    Globe2,
    Mail,
    MapPin,
    ShieldCheck,
    User,
    Lock,
} from "lucide-react";

import {
    cleanWilayahName,
    isActiveValue,
} from "../../components/masterCrud";
import { validateEmailField, validatePasswordField } from "./validation";

const ROLE_KEPALA_DINAS = 7;

const getRoleId = (row) =>
    Number(row?.id_role || row?.role_id || row?.role?.id_role || 0);

const isKepalaDinas = (row) => {
    const roleName = String(row?.role?.nama_role || row?.nama_role || "")
        .toLowerCase()
        .trim();

    return (
        getRoleId(row) === ROLE_KEPALA_DINAS ||
        roleName.includes("kepala dinas")
    );
};

const getWilayahId = (wilayah) => wilayah?.id_wilayah ?? wilayah?.id;

const normalizeWilayah = (item) => ({
    id_wilayah: item?.id_wilayah ?? item?.idWilayah ?? item?.id,
    nama_wilayah: cleanWilayahName(
        item?.nama_wilayah || item?.namaWilayah || item?.nama,
    ),
    kode_wilayah:
        item?.kode_wilayah || item?.kodeWilayah || item?.kode_provinsi || "-",
    jenis_wilayah: item?.jenis_wilayah || "PROVINSI",
    tipe_wilayah: item?.tipe_wilayah || "Absolute",
    status: item?.status ?? true,
});

const getRowWilayahList = (row) => {
    if (Array.isArray(row?.wilayah)) return row.wilayah;
    if (Array.isArray(row?.wilayah_list)) return row.wilayah_list;
    if (Array.isArray(row?.wilayahs)) return row.wilayahs;

    if (row?.wilayah && typeof row.wilayah === "object") {
        return [row.wilayah];
    }

    if (row?.id_wilayah || row?.nama_wilayah) {
        return [
            {
                id_wilayah: row.id_wilayah,
                nama_wilayah: row.nama_wilayah,
                kode_wilayah: row.kode_wilayah,
            },
        ];
    }

    return [];
};

const getWilayahName = (row) => {
    const wilayah = getRowWilayahList(row)[0];

    return cleanWilayahName(
        wilayah?.nama_wilayah ||
        wilayah?.nama ||
        row?.nama_wilayah ||
        "Belum Ditugaskan",
    );
};

const getWilayahCode = (row) => {
    const wilayah = getRowWilayahList(row)[0];

    return wilayah?.kode_wilayah || wilayah?.kodeWilayah || row?.kode_wilayah || "-";
};

const normalizeKepalaDinas = (row) => ({
    ...row,
    id_user: row?.id_user ?? row?.idUser ?? row?.id,
    nama: row?.nama || row?.name || "Kepala Dinas",
    email: row?.email || "",
    jabatan: row?.jabatan || "Kepala Dinas Pendidikan",
    status: row?.status ?? true,
    id_role:
        row?.id_role || row?.role_id || row?.role?.id_role || ROLE_KEPALA_DINAS,
    wilayah: getRowWilayahList(row),
});

export const kepalaDinasConfig = {
    entityKey: "kepala_dinas",
    storageKey: "master_kepala_dinas",
    entityName: "Kepala Dinas",
    pageTitle: "Manajemen Data",
    pageHighlight: "Kepala Dinas",
    subtitle: "Sistem Monitoring Otoritas Dinas",
    countLabel: "Kepala Dinas",

    idKey: "id_user",
    displayKey: "nama",

    routes: {
        read: "/admin/kadin",
        create: "/admin/kadin/create",
        detail: (row) => `/admin/kadin/detail/${row.id_user}`,
        edit: (row) => `/admin/kadin/edit/${row.id_user}`,
    },

    api: {
        list: "/users",
        fallbackList: ["/users/kadin", "/users/kepala-dinas"],
        detail: (id) => `/users/${id}`,
        create: "/users/register",
        update: (id) => `/users/${id}`,
    },

    auxiliary: [
        {
            key: "wilayahList",
            endpoint: "/wilayah/provinsi",
            getPayload: (payload) => {
                if (Array.isArray(payload)) return payload;
                if (Array.isArray(payload?.data)) return payload.data;
                if (Array.isArray(payload?.result)) return payload.result;
                return [];
            },
            normalize: normalizeWilayah,
        },
    ],

    messages: {
        fetchError: "Gagal memuat data Kepala Dinas",
        detailError: "Gagal mengambil data Kepala Dinas",
        createSuccess: "Akun Kepala Dinas berhasil didaftarkan.",
        updateSuccess: "Data Kepala Dinas berhasil diperbarui.",
        submitError: "Gagal menyimpan data Kepala Dinas.",
        statusError: "Gagal memperbarui status Kepala Dinas.",
    },

    itemsPerPage: 5,

    getInitialValues: () => ({
        nama: "",
        email: "",
        password: "",
        id_role: ROLE_KEPALA_DINAS,
        jabatan: "Kepala Dinas Pendidikan",
        id_wilayah: "",
        status: true,
    }),

    normalizeRow: normalizeKepalaDinas,

    normalizeDetail: (payload) => {
        const wilayahList = getRowWilayahList(payload);
        const selectedWilayah = wilayahList[0];

        return {
            id_user: payload?.id_user ?? payload?.idUser ?? payload?.id,
            nama: payload?.nama || "",
            email: payload?.email || "",
            password: payload?.password || "",
            jabatan: payload?.jabatan || "Kepala Dinas Pendidikan",
            id_role: ROLE_KEPALA_DINAS,
            status: payload?.status ?? true,
            wilayah: wilayahList,
            id_wilayah:
                selectedWilayah?.id_wilayah ||
                selectedWilayah?.id ||
                payload?.id_wilayah ||
                "",
        };
    },

    transformRows: (rows) => rows.filter(isKepalaDinas),

    sortRows: (a, b) => Number(b.id_user || 0) - Number(a.id_user || 0),

    searchKeys: [
        "nama",
        "email",
        "jabatan",
        (row) => getWilayahName(row),
        (row) => getWilayahCode(row),
    ],

    filters: [
        {
            name: "wilayah",
            defaultValue: "all",
            icon: MapPin,
            width: "w-60",
            items: ({ auxData }) => [
                { value: "all", label: "SELURUH WILAYAH" },
                ...(auxData.wilayahList || [])
                    .filter(
                        (wilayah) =>
                            wilayah.id_wilayah &&
                            isActiveValue(wilayah.status) &&
                            String(wilayah.jenis_wilayah || "").toUpperCase() === "PROVINSI",
                    )
                    .sort((a, b) => a.nama_wilayah.localeCompare(b.nama_wilayah))
                    .map((wilayah) => ({
                        value: String(wilayah.id_wilayah),
                        label: wilayah.nama_wilayah.toUpperCase(),
                    })),
            ],
            predicate: (row, value) => {
                if (value === "all") return true;

                return getRowWilayahList(row).some(
                    (wilayah) => Number(getWilayahId(wilayah)) === Number(value),
                );
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
    ],

    status: {
        getValue: (row) => row.status,
        endpoint: (row) => `/users/${row.id_user}`,
        payload: (nextStatus) => ({
            status: nextStatus,
        }),
        successMessage: (row, nextStatus) =>
            `${row.nama || "Kepala Dinas"} sekarang ${nextStatus ? "Aktif" : "Nonaktif"
            }`,
    },

    columns: [
        {
            header: "Identitas Kepala Dinas",
            align: "text-left w-[34%]",
            render: (row) => (
                <div className="flex w-full justify-start py-2 text-left">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0AC4E0]/10 text-[#0AC4E0]">
                            <User size={18} />
                        </div>

                        <div className="min-w-0">
                            <p className="whitespace-normal break-words text-[11px] font-black uppercase leading-snug text-slate-800">
                                {row.nama || "-"}
                            </p>

                            <p className="mt-1 flex items-start gap-1.5 break-words text-[9px] font-bold lowercase leading-snug text-slate-400">
                                <Mail size={10} className="mt-0.5 shrink-0" />
                                {row.email || "-"}
                            </p>

                            <p className="mt-2 text-[8px] font-black uppercase tracking-widest text-slate-300">
                                ID: {row.id_user || "-"} · {row.jabatan || "Kepala Dinas"}
                            </p>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: "Wilayah Otoritas",
            align: "text-left w-[42%]",
            render: (row) => (
                <div className="flex w-full justify-start py-2 text-left">
                    <div className="flex min-w-0 flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="rounded-lg border border-[#0AC4E0]/10 bg-[#0AC4E0]/5 px-2.5 py-1 text-[9px] font-black uppercase tracking-tight text-[#0AC4E0]">
                                {getWilayahName(row)}
                            </span>

                            <span className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-tight text-slate-500">
                                {getWilayahCode(row)}
                            </span>
                        </div>

                        <p className="text-[9px] font-bold leading-relaxed text-slate-400">
                            Dashboard Kepala Dinas hanya membaca data sekolah dan program pada
                            wilayah otoritas ini.
                        </p>
                    </div>
                </div>
            ),
        },
    ],

    sections: [
        {
            title: "Identitas Kepala Dinas",
            description: "Data dasar akun otoritas wilayah dinas.",
            icon: User,
            className: "rounded-3xl border border-blue-100/60 bg-blue-50/40 p-5",
            fields: [
                {
                    name: "nama",
                    label: "Nama Kepala Dinas",
                    type: "text",
                    icon: User,
                    required: true,
                    placeholder: "Masukkan nama lengkap Kepala Dinas",
                },
                {
                    name: "jabatan",
                    label: "Jabatan Struktural",
                    type: "text",
                    icon: Briefcase,
                    required: true,
                    placeholder: "Kepala Dinas Pendidikan",
                },
                {
                    name: "email",
                    label: "Email Login",
                    type: "email",
                    icon: Mail,
                    required: true,
                    placeholder: "kadin@dinas.go.id",
                },
                {
                    name: "password",
                    label: "Password Login",
                    type: "password",
                    icon: Lock,
                    requiredOnCreate: true,
                    minLength: 8,
                    placeholder: "Minimal 8 karakter",
                    help: ({ mode }) =>
                        mode === "edit"
                            ? "Kosongkan jika password tidak ingin diubah."
                            : "Password digunakan Kepala Dinas untuk masuk ke sistem.",
                },
            ],
        },
        {
            title: "Wilayah Otoritas",
            description: "Satu Kepala Dinas hanya memegang satu provinsi.",
            icon: Globe2,
            className: "rounded-3xl border border-slate-100 bg-slate-50/60 p-5",
            fields: [
                {
                    name: "id_wilayah",
                    label: "Pilih Wilayah Provinsi",
                    type: "select",
                    icon: MapPin,
                    required: true,
                    options: ({ auxData }) =>
                        (auxData.wilayahList || [])
                            .filter(
                                (wilayah) =>
                                    wilayah.id_wilayah &&
                                    isActiveValue(wilayah.status) &&
                                    String(wilayah.jenis_wilayah || "").toUpperCase() ===
                                    "PROVINSI",
                            )
                            .sort((a, b) => a.nama_wilayah.localeCompare(b.nama_wilayah))
                            .map((wilayah) => ({
                                value: String(wilayah.id_wilayah),
                                label: `Provinsi ${wilayah.nama_wilayah}`,
                            }))
                },
            ],
        },
    ],

    validate: ({ mode, formData }) => {
        if (!formData.nama?.trim()) {
            return "Nama Kepala Dinas wajib diisi.";
        }

        if (!formData.email?.trim()) {
            return "Email Kepala Dinas wajib diisi.";
        }

        const emailError = validateEmailField(
            formData.email,
            "Email Kepala Dinas",
        );
        if (emailError) return emailError;

        if (mode === "create") {
            const passwordError = validatePasswordField(formData.password);
            if (passwordError) return passwordError;
        }

        if (mode === "edit" && formData.password) {
            const passwordError = validatePasswordField(formData.password);
            if (passwordError) return passwordError;
        }

        if (!formData.jabatan?.trim()) {
            return "Jabatan Kepala Dinas wajib diisi.";
        }

        if (!formData.id_wilayah) {
            return "Pilih satu wilayah otoritas Kepala Dinas.";
        }

        return true;
    },

    buildPayload: ({ mode, formData }) => {
        const payload = {
            nama: formData.nama.trim(),
            email: formData.email.trim(),
            id_role: ROLE_KEPALA_DINAS,
            jabatan: formData.jabatan?.trim() || "Kepala Dinas Pendidikan",
            id_wilayahs: [Number(formData.id_wilayah)],
            id_wilayah: Number(formData.id_wilayah),
            status: formData.status ?? true,
        };

        if (mode === "create" || formData.password?.trim()) {
            payload.password = formData.password;
        }

        return payload;
    },

    formTitle: {
        create: "Tambah Data",
        edit: "Edit Data",
    },

    submitLabel: {
        create: "Simpan Kadin",
        edit: "Update Kadin",
    },

    previewLabel: "Preview Kepala Dinas",
    previewTitle: "Ringkasan Otoritas",

    preview: [
        {
            label: "Nama",
            key: "nama",
        },
        {
            label: "Email",
            key: "email",
            className: "truncate text-[11px] font-bold lowercase text-slate-500",
        },
        {
            label: "Jabatan",
            key: "jabatan",
            className: "truncate text-[12px] font-black uppercase text-[#0AC4E0]",
        },
        {
            label: "Wilayah",
            value: ({ formData, auxData }) => {
                const selected = (auxData.wilayahList || []).find(
                    (wilayah) => String(wilayah.id_wilayah) === String(formData.id_wilayah),
                );

                return selected?.nama_wilayah || "Belum dipilih";
            },
            className: "truncate text-[12px] font-black uppercase text-slate-800",
        },
    ],

    infoBox:
        "Dashboard Kepala Dinas nantinya hanya menampilkan data sekolah, program, dan monitoring berdasarkan wilayah otoritas yang dipilih pada akun ini.",

    detailTitle: "Detail Data",

    detail: {
        titleKey: "nama",
        subtitleKey: "email",
        initialKey: "nama",
        sideLabel: "Authority Region",
        sideTitle: "Wilayah & Akses",
        description:
            "Detail Kepala Dinas berisi identitas akun, status akses, dan wilayah provinsi otoritas.",
        badges: [
            {
                type: "status",
                key: "status",
                activeText: "Aktif",
                inactiveText: "Nonaktif",
            },
            {
                value: () => "Kepala Dinas",
                icon: ShieldCheck,
            },
        ],
        sections: [
            {
                title: "Identitas Akun",
                description: "Informasi dasar akun Kepala Dinas.",
                icon: User,
                items: [
                    { label: "Nama Lengkap", key: "nama", icon: User },
                    { label: "Email Login", key: "email", icon: Mail },
                    { label: "Jabatan", key: "jabatan", icon: Briefcase },
                    {
                        label: "Status",
                        key: "status",
                        icon: ShieldCheck,
                        format: (value) => (isActiveValue(value) ? "Aktif" : "Nonaktif"),
                    },
                ],
            },
            {
                title: "Wilayah Otoritas",
                description: "Provinsi yang menjadi area akses Kepala Dinas.",
                icon: MapPin,
                items: [
                    {
                        label: "Nama Wilayah",
                        icon: MapPin,
                        value: (data) => getWilayahName(data),
                    },
                    {
                        label: "Kode Wilayah",
                        icon: Database,
                        value: (data) => getWilayahCode(data),
                    },
                    {
                        label: "Role Sistem",
                        icon: ShieldCheck,
                        value: () => "Kepala Dinas",
                    },
                ],
            },
        ],
    },
};
