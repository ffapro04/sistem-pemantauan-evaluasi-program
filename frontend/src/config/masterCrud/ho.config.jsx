// src/config/masterCrud/ho.config.jsx

/* eslint-disable react/prop-types */
import React from "react";
import {
    Briefcase,
    Building2,
    Database,
    Layers,
    Mail,
    ShieldCheck,
    User,
    Lock,
} from "lucide-react";

import { isActiveValue } from "../../components/masterCrud";

const ROLE_HO = 3;

const API_BASE_URL = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    ""
).replace(/\/$/, "");

const getUserPhotoUrl = (fotoProfile) => {
    if (!fotoProfile) return "";

    const value = String(fotoProfile).trim();
    if (!value) return "";

    if (/^https?:\/\//i.test(value)) {
        return value;
    }

    if (value.startsWith("/uploads/")) {
        return `${API_BASE_URL}${value}`;
    }

    if (value.startsWith("uploads/")) {
        return `${API_BASE_URL}/${value}`;
    }

    return `${API_BASE_URL}/uploads/users/${value}`;
};

const getRoleId = (row) =>
    Number(row?.id_role || row?.role_id || row?.role?.id_role || 0);

const isHO = (row) => {
    const roleName = String(row?.role?.nama_role || row?.nama_role || "")
        .toLowerCase()
        .trim();

    return getRoleId(row) === ROLE_HO || roleName.includes("head office");
};

const normalizeJenis = (value) => {
    const raw = String(value || "").toLowerCase();

    if (raw.includes("non")) return "non-akademik";

    return "akademik";
};

const getJenisLabel = (value) => {
    const jenis = normalizeJenis(value);

    return jenis === "non-akademik" ? "Non Akademik" : "Akademik";
};

const getFokusLabel = (row) => {
    const jenis = normalizeJenis(row?.jenis);

    if (jenis === "non-akademik") return "";

    return row?.sub_jenis || "SD & SMP";
};

const normalizeHO = (row) => {
    const fotoProfile = row?.foto_profile || "";

    return {
        ...row,
        id_user: row?.id_user ?? row?.idUser ?? row?.id,
        nama: row?.nama || row?.name || "Head Office",
        email: row?.email || "",
        foto_profile: fotoProfile,
        foto_profile_url: getUserPhotoUrl(fotoProfile),
        jabatan: row?.jabatan || "Staff Head Office",
        status: row?.status ?? true,
        id_role: row?.id_role || row?.role_id || row?.role?.id_role || ROLE_HO,
        jenis: normalizeJenis(row?.jenis),
        sub_jenis:
            normalizeJenis(row?.jenis) === "akademik"
                ? row?.sub_jenis || "SD & SMP"
                : null,
    };
};

export const hoConfig = {
    entityKey: "ho",
    storageKey: "master_ho",
    entityName: "Head Office",
    pageTitle: "Manajemen Data",
    pageHighlight: "Head Office",
    subtitle: "Sistem Pemantauan Unit Head Office",
    countLabel: "Head Office",

    idKey: "id_user",
    displayKey: "nama",

    routes: {
        read: "/admin/ho",
        create: "/admin/ho/create",
        detail: (row) => `/admin/ho/detail/${row.id_user}`,
        edit: (row) => `/admin/ho/edit/${row.id_user}`,
    },

    api: {
        list: "/users/ho",
        fallbackList: ["/users"],
        detail: (id) => `/users/${id}`,
        create: "/users",
        update: (id) => `/users/${id}`,
    },

    messages: {
        fetchError: "Gagal memuat data Head Office",
        detailError: "Gagal mengambil data Head Office",
        createSuccess: "Akun Head Office berhasil didaftarkan.",
        updateSuccess: "Data Head Office berhasil diperbarui.",
        submitError: "Gagal menyimpan data Head Office.",
        statusError: "Gagal memperbarui status Head Office.",
    },

    itemsPerPage: 5,

    getInitialValues: () => ({
        nama: "",
        email: "",
        password: "",
        foto_profile: "",
        foto_profile_file: null,
        id_role: ROLE_HO,
        jabatan: "Staff Head Office",
        jenis: "akademik",
        sub_jenis: "SD & SMP",
        status: true,
    }),

    normalizeRow: normalizeHO,

    normalizeDetail: (payload) => ({
        id_user: payload?.id_user ?? payload?.idUser ?? payload?.id,
        nama: payload?.nama || "",
        email: payload?.email || "",
        password: "",
        foto_profile: payload?.foto_profile || "",
        foto_profile_file: null,
        foto_profile_url: getUserPhotoUrl(payload?.foto_profile),
        jabatan: payload?.jabatan || "Staff Head Office",
        id_role: ROLE_HO,
        status: payload?.status ?? true,
        jenis: normalizeJenis(payload?.jenis),
        sub_jenis:
            normalizeJenis(payload?.jenis) === "akademik"
                ? payload?.sub_jenis || "SD & SMP"
                : null,
    }),

    transformRows: (rows) => rows.filter(isHO),

    sortRows: (a, b) => Number(b.id_user || 0) - Number(a.id_user || 0),

    searchKeys: ["nama", "email", "jabatan", "jenis", "sub_jenis"],

    filters: [
        {
            name: "jenis",
            defaultValue: "all",
            icon: Building2,
            width: "w-56",
            items: [
                { value: "all", label: "SEMUA BIDANG" },
                { value: "akademik", label: "AKADEMIK" },
                { value: "non-akademik", label: "NON AKADEMIK" },
            ],
            predicate: (row, value) => {
                if (value === "all") return true;

                return normalizeJenis(row.jenis) === value;
            },
        },
        {
            name: "fokus",
            defaultValue: "all",
            icon: Layers,
            width: "w-52",
            items: [
                { value: "all", label: "SEMUA FOKUS" },
                { value: "SD & SMP", label: "SD & SMP" },
                { value: "SMK", label: "SMK" },
            ],
            predicate: (row, value) => {
                if (value === "all") return true;

                if (normalizeJenis(row.jenis) !== "akademik") return false;

                return getFokusLabel(row) === value;
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
            `${row.nama || "Head Office"} sekarang ${nextStatus ? "Aktif" : "Nonaktif"
            }`,
    },

    columns: [
        {
            header: "Identitas Head Office",
            align: "text-left w-[32%]",
            render: (row) => (
                <div className="flex w-full justify-start py-2 text-left">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0AC4E0]/10 text-[#0AC4E0]">
                            <User size={18} />

                            {row.foto_profile_url && (
                                <img
                                    src={row.foto_profile_url}
                                    alt={row.nama || "Foto Head Office"}
                                    className="absolute inset-0 h-full w-full object-cover"
                                    onError={(event) => {
                                        event.currentTarget.remove();
                                    }}
                                />
                            )}
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
                                ID: {row.id_user || "-"} · {row.jabatan || "Head Office"}
                            </p>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: "Bidang & Fokus",
            align: "text-left w-[42%]",
            render: (row) => (
                <div className="flex w-full justify-start py-2 text-left">
                    <div className="flex min-w-0 flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="rounded-lg border border-[#0AC4E0]/10 bg-[#0AC4E0]/5 px-2.5 py-1 text-[9px] font-black uppercase tracking-tight text-[#0AC4E0]">
                                {getJenisLabel(row.jenis)}
                            </span>

                            {normalizeJenis(row.jenis) === "akademik" && (
                                <span className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-tight text-slate-500">
                                    {getFokusLabel(row)}
                                </span>
                            )}
                        </div>

                        <p className="text-[9px] font-bold leading-relaxed text-slate-400">
                            Akses dashboard dan data program mengikuti bidang kerja Head
                            Office.
                        </p>
                    </div>
                </div>
            ),
        },
    ],

    onFieldChange: ({ field, value, next }) => {
        if (field === "jenis") {
            if (value === "non-akademik") {
                return {
                    ...next,
                    sub_jenis: null,
                };
            }

            return {
                ...next,
                sub_jenis: next.sub_jenis || "SD & SMP",
            };
        }

        return next;
    },

    sections: [
        {
            title: "Identitas Head Office",
            description: "Data dasar akun Head Office.",
            icon: User,
            className: "rounded-3xl border border-blue-100/60 bg-blue-50/40 p-5",
            fields: [
                {
                    name: "nama",
                    label: "Nama Head Office",
                    type: "text",
                    icon: User,
                    required: true,
                    placeholder: "Masukkan nama lengkap HO",
                },
                {
                    name: "jabatan",
                    label: "Jabatan",
                    type: "text",
                    icon: Briefcase,
                    required: true,
                    placeholder: "Staff Head Office",
                },
                {
                    name: "email",
                    label: "Email Login",
                    type: "email",
                    icon: Mail,
                    required: true,
                    placeholder: "ho@ypamdr.astra.co.id",
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
                            : "Password digunakan HO untuk masuk ke sistem.",
                },
                {
                    name: "foto_profile_file",
                    label: "Foto Profile",
                    type: "upload",
                    icon: User,
                    accept: "image/jpeg,image/jpg,image/png,image/webp",
                    maxSize: 2 * 1024 * 1024,
                    buttonText: "Pilih Foto Profile",
                    helperText: "Maks. 2MB · JPG, PNG, atau WEBP",
                    help: "Foto akan digunakan sebagai avatar Head Office.",
                    wrapperClassName: "space-y-2 md:col-span-2",
                },
            ],
        },
        {
            title: "Bidang Kerja",
            description: "Atur bidang kerja dan fokus jenjang Head Office.",
            icon: Building2,
            className: "rounded-3xl border border-slate-100 bg-slate-50/60 p-5",
            fields: [
                {
                    name: "jenis",
                    label: "Departemen",
                    type: "select",
                    icon: Building2,
                    required: true,
                    options: [
                        { value: "akademik", label: "AKADEMIK" },
                        { value: "non-akademik", label: "NON AKADEMIK" },
                    ],
                },
                {
                    name: "sub_jenis",
                    label: "Fokus Bidang Akademik",
                    type: "select",
                    icon: Layers,
                    required: ({ formData }) => formData.jenis === "akademik",
                    disabled: ({ formData }) => formData.jenis !== "akademik",
                    hidden: ({ formData }) => formData.jenis !== "akademik",
                    options: [
                        { value: "SD & SMP", label: "SD & SMP" },
                        { value: "SMK", label: "SMK" },
                    ],
                },
            ],
        },
    ],

    validate: ({ mode, formData }) => {
        if (!formData.nama?.trim()) {
            return "Nama Head Office wajib diisi.";
        }

        if (!formData.email?.trim()) {
            return "Email Head Office wajib diisi.";
        }

        if (mode === "create" && String(formData.password || "").length < 8) {
            return "Password minimal 8 karakter.";
        }

        if (
            mode === "edit" &&
            formData.password &&
            String(formData.password).length < 8
        ) {
            return "Password minimal 8 karakter.";
        }

        if (!formData.jabatan?.trim()) {
            return "Jabatan Head Office wajib diisi.";
        }

        if (!formData.jenis) {
            return "Departemen Head Office wajib dipilih.";
        }

        if (formData.jenis === "akademik" && !formData.sub_jenis) {
            return "Fokus bidang akademik wajib dipilih.";
        }

        return true;
    },

    buildPayload: ({ mode, formData }) => {
        const payload = new FormData();

        payload.append("nama", formData.nama.trim());
        payload.append("email", formData.email.trim());
        payload.append("id_role", String(ROLE_HO));
        payload.append(
            "jabatan",
            formData.jabatan?.trim() || "Staff Head Office",
        );
        payload.append("jenis", normalizeJenis(formData.jenis));
        payload.append(
            "sub_jenis",
            normalizeJenis(formData.jenis) === "akademik"
                ? formData.sub_jenis || "SD & SMP"
                : "",
        );
        payload.append("status", String(formData.status ?? true));

        if (mode === "create" || formData.password?.trim()) {
            payload.append("password", formData.password);
        }

        if (formData.foto_profile_file instanceof File) {
            payload.append("foto_profile_file", formData.foto_profile_file);
        }

        if (formData.foto_profile) {
            payload.append("foto_profile", formData.foto_profile);
        }

        return payload;
    },

    formTitle: {
        create: "Tambah Data",
        edit: "Edit Data",
    },

    submitLabel: {
        create: "Simpan HO",
        edit: "Update HO",
    },

    previewLabel: "Preview Head Office",
    previewTitle: "Ringkasan Bidang",

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
            label: "Departemen",
            value: ({ formData }) => getJenisLabel(formData.jenis),
            className: "truncate text-[12px] font-black uppercase text-[#0AC4E0]",
        },
        {
            label: "Fokus",
            value: ({ formData }) =>
                formData.jenis === "non-akademik"
                    ? "Tidak dibatasi fokus akademik"
                    : formData.sub_jenis || "SD & SMP",
            className: "truncate text-[12px] font-black uppercase text-slate-800",
        },
    ],

    infoBox:
        "Personel Head Office akan mendapatkan akses dashboard sesuai departemen dan fokus bidang yang dipilih.",

    detailTitle: "Detail Data",

    detail: {
        titleKey: "nama",
        subtitleKey: "email",
        initialKey: "nama",
        avatarImage: (row) =>
            row?.foto_profile_url || getUserPhotoUrl(row?.foto_profile),
        avatarIcon: User,
        sideLabel: "Bidang Kerja",
        sideTitle: "Akses & Fokus",
        description:
            "Detail Head Office berisi identitas akun, status akses, departemen, dan fokus bidang kerja.",
        badges: [
            {
                type: "status",
                key: "status",
                activeText: "Aktif",
                inactiveText: "Nonaktif",
            },
            {
                value: (data) => getJenisLabel(data.jenis),
                icon: Building2,
            },
        ],
        sections: [
            {
                title: "Identitas Akun",
                description: "Informasi dasar akun Head Office.",
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
                title: "Bidang Head Office",
                description: "Departemen dan fokus data yang dapat diakses.",
                icon: Building2,
                items: [
                    {
                        label: "Departemen",
                        icon: Building2,
                        value: (data) => getJenisLabel(data.jenis),
                    },
                    {
                        label: "Fokus Bidang",
                        icon: Layers,
                        value: (data) =>
                            normalizeJenis(data.jenis) === "non-akademik"
                                ? "Tidak dibatasi fokus akademik"
                                : getFokusLabel(data),
                    },
                    {
                        label: "Role Sistem",
                        icon: Database,
                        value: () => "Head Office",
                    },
                ],
            },
        ],
    },
};
