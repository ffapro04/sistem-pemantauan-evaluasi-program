// src/config/masterCrud/user.config.jsx

/* eslint-disable react/prop-types */
import React from "react";
import {
    Briefcase,
    Database,
    KeyRound,
    Lock,
    Mail,
    MapPin,
    ShieldCheck,
    User,
    Users,
} from "lucide-react";

import {
    cleanWilayahName,
    isActiveValue,
} from "../../components/masterCrud";
import { validateEmailField, validatePasswordField } from "./validation";

const ROLE_KEPALA_DINAS_ID = 7;

const API_BASE_URL = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    ""
).replace(/\/$/, "");

const getUserPhotoUrl = (fotoProfile) => {
    if (!fotoProfile) return "";

    const value = String(fotoProfile).trim();

    if (!value) return "";

    // Jika dari backend sudah berupa URL lengkap
    if (/^https?:\/\//i.test(value)) {
        return value;
    }

    // Jika database menyimpan uploads/users/nama-file.jpg
    if (value.startsWith("uploads/")) {
        return `${API_BASE_URL}/${value}`;
    }

    // Jika database hanya menyimpan nama-file.jpg
    return `${API_BASE_URL}/uploads/users/${value}`;
};

const getRoleId = (row) =>
    Number(row?.id_role || row?.role_id || row?.role?.id_role || 0);

const getRoleName = (row) =>
    row?.role?.nama_role || row?.nama_role || row?.role_name || row?.role || "User";

const isKepalaDinasRole = (value) => Number(value) === ROLE_KEPALA_DINAS_ID;

const getWilayahList = (row) => {
    if (Array.isArray(row?.wilayah)) return row.wilayah;

    if (row?.wilayah && typeof row.wilayah === "object") {
        return [row.wilayah];
    }

    return [];
};

const getPrimaryWilayah = (row) => {
    const wilayahList = getWilayahList(row);
    return wilayahList[0] || null;
};

const getWilayahIdFromUser = (row) => {
    const wilayah = getPrimaryWilayah(row);

    return (
        row?.id_wilayah ||
        row?.idWilayah ||
        row?.wilayah_id ||
        wilayah?.id_wilayah ||
        wilayah?.idWilayah ||
        wilayah?.id ||
        ""
    );
};

const getWilayahName = (row) => {
    const wilayahList = getWilayahList(row);

    if (wilayahList.length > 0) {
        return wilayahList
            .map((item) =>
                cleanWilayahName(
                    item?.nama_wilayah || item?.namaWilayah || item?.nama || "Wilayah",
                ),
            )
            .filter(Boolean)
            .join(", ");
    }

    return cleanWilayahName(row?.nama_wilayah || row?.wilayah_name || "Pusat");
};

const normalizeRole = (item) => ({
    id_role: item?.id_role ?? item?.idRole ?? item?.id,
    nama_role: item?.nama_role || item?.namaRole || item?.nama || "Role",
    status: item?.status ?? true,
});

const normalizeWilayah = (item) => {
    const idWilayah = item?.id_wilayah ?? item?.idWilayah ?? item?.id;
    const idParent = item?.id_parent ?? item?.idParent ?? item?.parent_id ?? null;
    const rawJenis = String(
        item?.jenis_wilayah ||
        item?.tipe_wilayah ||
        item?.jenis ||
        (idParent == null ? "PROVINSI" : "KABUPATEN"),
    ).toUpperCase();

    return {
        ...item,
        id_wilayah: idWilayah,
        id_parent: idParent,
        nama_wilayah: cleanWilayahName(
            item?.nama_wilayah || item?.namaWilayah || item?.nama,
        ),
        kode_wilayah:
            item?.kode_wilayah || item?.kodeWilayah || item?.kode_provinsi || "-",
        jenis_wilayah: rawJenis,
        status: item?.status ?? true,
    };
};

const normalizeUser = (row) => {
    const fotoProfile = row?.foto_profile || "";

    return {
        ...row,
        id_user: row?.id_user ?? row?.idUser ?? row?.id,
        nama: row?.nama || row?.name || "User",
        email: row?.email || "",
        foto_profile: fotoProfile,
        foto_profile_url: getUserPhotoUrl(fotoProfile),
        jabatan: row?.jabatan || "-",
        id_role: getRoleId(row),
        nama_role: getRoleName(row),
        id_wilayah: getWilayahIdFromUser(row),
        nama_wilayah: getWilayahName(row),
        jenis: row?.jenis || "pusat",
        status: row?.status ?? true,
    };
};

export const userConfig = {
    entityKey: "user",
    storageKey: "master_user",
    entityName: "User",
    pageTitle: "Manajemen Data",
    pageHighlight: "User",
    subtitle: "Pusat Pengelolaan Akun Sistem",
    countLabel: "User",

    idKey: "id_user",
    displayKey: "nama",

    routes: {
        read: "/admin/users",
        create: "/admin/users/create",
        detail: (row) => `/admin/users/detail/${row.id_user}`,
        edit: (row) => `/admin/users/edit/${row.id_user}`,
    },

    api: {
        list: "/users",
        detail: (id) => `/users/${id}`,
        create: "/users",
        update: (id) => `/users/${id}`,
    },

    auxiliary: [
        {
            key: "roleList",
            endpoint: "/roles",
            normalize: normalizeRole,
        },
        {
            key: "wilayahList",
            endpoint: "/wilayah",
            normalize: normalizeWilayah,
        },
    ],

    messages: {
        fetchError: "Gagal memuat data User",
        detailError: "Gagal mengambil data User",
        createSuccess: "Akun pengguna berhasil didaftarkan.",
        updateSuccess: "Data pengguna berhasil diperbarui.",
        submitError: "Gagal menyimpan data pengguna.",
        statusError: "Gagal memperbarui status pengguna.",
    },

    itemsPerPage: 5,

    getInitialValues: () => ({
        nama: "",
        email: "",
        password: "",
        foto_profile: "",
        foto_profile_file: "",
        id_role: "",
        jabatan: "",
        id_wilayah: "",
        jenis: "pusat",
        status: true,
    }),

    onFieldChange: ({ field, value, next }) => {
        if (field === "id_role" && isKepalaDinasRole(value)) {
            return {
                ...next,
                jenis: "wilayah",
            };
        }

        return next;
    },

    normalizeRow: normalizeUser,

    normalizeDetail: (payload) => {
        const normalized = normalizeUser(payload);

        return {
            id_user: normalized.id_user,
            nama: normalized.nama || "",
            email: normalized.email || "",
            foto_profile: normalized.foto_profile || "",
            foto_profile_file: normalized.foto_profile || "",
            foto_profile_url: normalized.foto_profile_url || "",
            password: "",
            id_role: normalized.id_role ? String(normalized.id_role) : "",
            jabatan: normalized.jabatan === "-" ? "" : normalized.jabatan,
            id_wilayah: normalized.id_wilayah
                ? String(normalized.id_wilayah)
                : "",
            jenis: normalized.jenis || "pusat",
            status: normalized.status ?? true,
            nama_role: normalized.nama_role || "User",
            nama_wilayah: normalized.nama_wilayah || "Pusat",
        };
    },

    sortRows: (a, b) => Number(b.id_user || 0) - Number(a.id_user || 0),

    searchKeys: [
        "nama",
        "email",
        "jabatan",
        "nama_role",
        "nama_wilayah",
        "jenis",
    ],

    filters: [
        {
            name: "role",
            defaultValue: "all",
            icon: ShieldCheck,
            width: "w-56",
            items: ({ auxData }) => [
                { value: "all", label: "SEMUA ROLE" },
                ...(auxData.roleList || [])
                    .filter((role) => role.id_role)
                    .map((role) => ({
                        value: String(role.id_role),
                        label: role.nama_role.toUpperCase(),
                    })),
            ],
            predicate: (row, value) => {
                if (value === "all") return true;
                return Number(row.id_role) === Number(value);
            },
        },
        {
            name: "wilayah",
            defaultValue: "all",
            icon: MapPin,
            width: "w-60",
            items: ({ auxData }) => [
                { value: "all", label: "SELURUH WILAYAH" },
                { value: "pusat", label: "PUSAT / TANPA WILAYAH" },
                ...(auxData.wilayahList || [])
                    .filter((wilayah) => wilayah.id_wilayah)
                    .sort((a, b) => a.nama_wilayah.localeCompare(b.nama_wilayah))
                    .map((wilayah) => ({
                        value: String(wilayah.id_wilayah),
                        label: wilayah.nama_wilayah.toUpperCase(),
                    })),
            ],
            predicate: (row, value) => {
                if (value === "all") return true;

                if (value === "pusat") {
                    return !row.id_wilayah;
                }

                return Number(row.id_wilayah) === Number(value);
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

    summary: (rows) => {
        const active = rows.filter((row) => isActiveValue(row.status)).length;
        const inactive = rows.length - active;

        return [
            {
                label: "Aktif",
                value: active,
                icon: ShieldCheck,
            },
            {
                label: "Nonaktif",
                value: inactive,
                icon: ShieldCheck,
            },
            {
                label: "Total Role",
                value: new Set(rows.map((row) => row.id_role)).size,
                icon: Users,
            },
        ];
    },

    status: {
        getValue: (row) => row.status,
        endpoint: (row) => `/users/${row.id_user}`,
        payload: (nextStatus) => ({
            status: nextStatus,
        }),
        successMessage: (row, nextStatus) =>
            `${row.nama || "User"} sekarang ${nextStatus ? "Aktif" : "Nonaktif"}`,
    },

    columns: [
        {
            header: "Identitas User",
            align: "text-left w-[34%]",
            render: (row) => (
                <div className="flex w-full justify-start py-2 text-left">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0AC4E0]/10 text-[#0AC4E0] ring-1 ring-[#0AC4E0]/10">
                            <User size={18} />

                            {row.foto_profile_url && (
                                <img
                                    src={row.foto_profile_url}
                                    alt={row.nama || "Foto user"}
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
                                ID: {row.id_user || "-"} · {row.jabatan || "-"}
                            </p>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: "Role & Wilayah",
            align: "text-left w-[42%]",
            render: (row) => (
                <div className="flex w-full justify-start py-2 text-left">
                    <div className="flex min-w-0 flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="rounded-lg border border-[#0AC4E0]/10 bg-[#0AC4E0]/5 px-2.5 py-1 text-[9px] font-black uppercase tracking-tight text-[#0AC4E0]">
                                {row.nama_role || "User"}
                            </span>

                            <span className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-tight text-slate-500">
                                {row.nama_wilayah || "Pusat"}
                            </span>
                        </div>

                        <p className="text-[9px] font-bold leading-relaxed text-slate-400">
                            Jenis akun: {row.jenis || "pusat"}
                        </p>
                    </div>
                </div>
            ),
        },
    ],

    sections: [
        {
            title: "Informasi Akun",
            description: "Data dasar pengguna sistem.",
            icon: User,
            className: "rounded-3xl border border-blue-100/60 bg-blue-50/40 p-5",
            fields: [
                {
                    name: "nama",
                    label: "Nama Lengkap",
                    type: "text",
                    icon: User,
                    required: true,
                    placeholder: "Masukkan nama lengkap",
                },
                {
                    name: "email",
                    label: "Email Login",
                    type: "email",
                    icon: Mail,
                    required: true,
                    placeholder: "user@ypamdr.astra.co.id",
                },
                {
                    name: "password",
                    label: "Password Baru",
                    type: "password",
                    icon: Lock,
                    hidden: ({ mode }) => mode === "edit",
                    requiredOnCreate: true,
                    minLength: 8,
                    placeholder: "Minimal 8 karakter",
                    help: ({ mode }) =>
                        mode === "edit"
                            ? "Kosongkan jika tidak ingin mengganti password pengguna."
                            : "Password digunakan pengguna untuk masuk ke sistem.",
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
                    existingUrlField: "foto_profile_url",
                    existingNameField: "foto_profile",
                    previewAsImage: true,
                    help: "Upload foto pengguna (png/jpg/jpeg/webp)",
                },
                {
                    name: "jabatan",
                    label: "Jabatan",
                    type: "text",
                    icon: Briefcase,
                    placeholder: "Masukkan jabatan pengguna",
                },
            ],
        },
        {
            title: "Akses Sistem",
            description: "Atur role, jenis akun, dan wilayah pengguna.",
            icon: ShieldCheck,
            className: "rounded-3xl border border-slate-100 bg-slate-50/60 p-5",
            fields: [
                {
                    name: "id_role",
                    label: "Role Pengguna",
                    type: "select",
                    icon: ShieldCheck,
                    required: true,
                    options: ({ auxData }) =>
                        (auxData.roleList || [])
                            .filter((role) => role.id_role)
                            .map((role) => ({
                                value: String(role.id_role),
                                label: role.nama_role.toUpperCase(),
                            })),
                },
                {
                    name: "jenis",
                    label: "Jenis Akun",
                    type: "select",
                    icon: KeyRound,
                    required: true,
                    options: [
                        { value: "pusat", label: "PUSAT" },
                        { value: "wilayah", label: "WILAYAH" },
                        { value: "sekolah", label: "SEKOLAH" },
                    ],
                },
                {
                    name: "id_wilayah",
                    label: "Wilayah Kepala Dinas / Penugasan",
                    type: "select",
                    icon: MapPin,
                    options: ({ auxData }) => [
                        { value: "", label: "PILIH WILAYAH / TANPA WILAYAH" },
                        ...(auxData.wilayahList || [])
                            .filter((wilayah) => {
                                if (!wilayah.id_wilayah || !isActiveValue(wilayah.status)) {
                                    return false;
                                }

                                const jenis = String(
                                    wilayah.jenis_wilayah || wilayah.tipe_wilayah || "",
                                ).toUpperCase();

                                return jenis.includes("PROVINSI") || wilayah.id_parent == null;
                            })
                            .sort((a, b) => a.nama_wilayah.localeCompare(b.nama_wilayah))
                            .map((wilayah) => ({
                                value: String(wilayah.id_wilayah),
                                label: `${wilayah.nama_wilayah.toUpperCase()} (${wilayah.kode_wilayah || "-"})`,
                            })),
                    ],
                    help: "Untuk role Kepala Dinas, wilayah ini akan ditempelkan ke relasi m_wilayah.id_user.",
                    wrapperClassName: "space-y-2 md:col-span-2",
                },
            ],
        },
    ],

    validate: ({ mode, formData }) => {
        if (!formData.nama?.trim()) return "Nama pengguna wajib diisi.";
        if (!formData.email?.trim()) return "Email pengguna wajib diisi.";
        const emailError = validateEmailField(formData.email, "Email pengguna");
        if (emailError) return emailError;
        if (!formData.id_role) return "Role pengguna wajib dipilih.";

        if (isKepalaDinasRole(formData.id_role) && !formData.id_wilayah) {
            return "Wilayah Kepala Dinas wajib dipilih.";
        }

        if (mode === "create") {
            const passwordError = validatePasswordField(formData.password);
            if (passwordError) return passwordError;
        }

        if (mode === "edit" && formData.password) {
            const passwordError = validatePasswordField(formData.password);
            if (passwordError) return passwordError;
        }

        return true;
    },

    buildPayload: ({ mode, formData }) => {
        const payload = new FormData();

        payload.append("nama", formData.nama.trim());
        payload.append("email", formData.email.trim());
        payload.append("id_role", Number(formData.id_role));
        payload.append("jabatan", formData.jabatan?.trim() || "");
        payload.append("jenis", formData.jenis || "pusat");
        const selectedWilayahId = formData.id_wilayah
            ? Number(formData.id_wilayah)
            : null;

        payload.append("id_wilayah", selectedWilayahId ?? "");
        payload.append(
            "id_wilayahs",
            JSON.stringify(selectedWilayahId ? [selectedWilayahId] : []),
        );
        payload.append("status", formData.status ?? true);

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
        create: "Simpan User",
        edit: "Update User",
    },

    previewLabel: "Preview User",
    previewTitle: "Ringkasan Akun",

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
            label: "Role",
            value: ({ formData, auxData }) => {
                const selected = (auxData.roleList || []).find(
                    (role) => String(role.id_role) === String(formData.id_role),
                );

                return selected?.nama_role || "Belum dipilih";
            },
            className: "truncate text-[12px] font-black uppercase text-[#0AC4E0]",
        },
        {
            label: "Wilayah",
            value: ({ formData, auxData }) => {
                if (!formData.id_wilayah) return "Pusat";

                const selected = (auxData.wilayahList || []).find(
                    (wilayah) =>
                        String(wilayah.id_wilayah) === String(formData.id_wilayah),
                );

                return selected?.nama_wilayah || "Pusat";
            },
            className: "truncate text-[12px] font-black uppercase text-slate-800",
        },
    ],

    infoBox:
        "Master User digunakan untuk mengelola akun umum sistem. Untuk role Kepala Dinas, pilih wilayah agar akun otomatis terhubung ke data wilayah.",

    detailTitle: "Detail Data",

    detail: {
        titleKey: "nama",
        subtitleKey: "email",
        initialKey: "nama",
        avatarImage: (row) =>
            row?.foto_profile_url || getUserPhotoUrl(row?.foto_profile),

        avatarIcon: User,
        sideLabel: "Access Control",
        sideTitle: "Role & Wilayah",
        description:
            "Detail User berisi identitas akun, role akses, wilayah penugasan, dan status aktivasi.",
        badges: [
            {
                type: "status",
                key: "status",
                activeText: "Aktif",
                inactiveText: "Nonaktif",
            },
            {
                key: "nama_role",
                icon: ShieldCheck,
            },
        ],
        sections: [
            {
                title: "Identitas Akun",
                description: "Informasi dasar pengguna sistem.",
                icon: User,
                items: [
                    {
                        label: "Nama Lengkap",
                        key: "nama",
                        icon: User,
                    },
                    {
                        label: "Email Login",
                        key: "email",
                        icon: Mail,
                    },
                    {
                        label: "Jabatan",
                        key: "jabatan",
                        icon: Briefcase,
                    },
                    {
                        label: "Status",
                        key: "status",
                        icon: ShieldCheck,
                        format: (value) => (isActiveValue(value) ? "Aktif" : "Nonaktif"),
                    },
                ],
            },
            {
                title: "Akses Sistem",
                description: "Role dan wilayah pengguna.",
                icon: ShieldCheck,
                items: [
                    {
                        label: "Role",
                        key: "nama_role",
                        icon: ShieldCheck,
                    },
                    {
                        label: "ID Role",
                        key: "id_role",
                        icon: Database,
                    },
                    {
                        label: "Jenis Akun",
                        key: "jenis",
                        icon: KeyRound,
                    },
                    {
                        label: "Wilayah",
                        key: "nama_wilayah",
                        icon: MapPin,
                    },
                ],
            },
        ],
    },
};
