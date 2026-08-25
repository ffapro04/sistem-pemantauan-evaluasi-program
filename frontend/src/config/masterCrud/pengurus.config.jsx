// src/config/masterCrud/pengurus.config.jsx

import {
    Briefcase,
    Database,
    KeyRound,
    Mail,
    ShieldCheck,
    User,
    Lock,
} from "lucide-react";

import { isActiveValue } from "../../components/masterCrud";
import { validateEmailField, validatePasswordField } from "./validation";

const ROLE_ADMIN = 1;
const ROLE_PENGURUS = 2;
const MASTER_AUTH_KEY = "Y4y4s4n4str4";

import { API_BASE_URL } from "../apiBase.js";

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

const getRoleName = (row) =>
    String(row?.role?.nama_role || row?.nama_role || "").toLowerCase().trim();

const isPengurusOrAdmin = (row) => {
    const roleId = getRoleId(row);
    const roleName = getRoleName(row);

    return (
        roleId === ROLE_ADMIN ||
        roleId === ROLE_PENGURUS ||
        roleName.includes("admin") ||
        roleName.includes("pengurus")
    );
};

const getJabatanLabel = (row) => {
    const roleId = getRoleId(row);

    if (roleId === ROLE_ADMIN) return "Admin";

    return row?.jabatan || "Ketua Pengurus";
};

const getRoleLabel = (row) => {
    const jabatan = getJabatanLabel(row);

    if (jabatan === "Admin" || getRoleId(row) === ROLE_ADMIN) {
        return "Administrator";
    }

    return "Pengurus";
};

const normalizePengurus = (row) => {
    const fotoProfile = row?.foto_profile || "";

    return {
        ...row,
        id_user: row?.id_user ?? row?.idUser ?? row?.id,
        nama: row?.nama || row?.name || "Pengurus",
        email: row?.email || "",
        foto_profile: fotoProfile,
        foto_profile_url: getUserPhotoUrl(fotoProfile),
        jabatan: getJabatanLabel(row),
        status: row?.status ?? true,
        id_role: getRoleId(row) || ROLE_PENGURUS,
    };
};

export const pengurusConfig = {
    entityKey: "pengurus",
    storageKey: "master_pengurus",
    entityName: "Pengurus",
    pageTitle: "Manajemen Data",
    pageHighlight: "Pengurus",
    subtitle: "Sistem Manajemen Pengurus Yayasan",
    countLabel: "Pengurus",

    idKey: "id_user",
    displayKey: "nama",

    routes: {
        read: "/admin/pengurus",
        create: "/admin/pengurus/create",
        detail: (row) => `/admin/pengurus/detail/${row.id_user}`,
        edit: (row) => `/admin/pengurus/edit/${row.id_user}`,
    },

    api: {
        list: "/users",
        fallbackList: ["/users/pengurus"],
        detail: (id) => `/users/${id}`,
        create: "/users",
        update: (id) => `/users/${id}`,
    },

    messages: {
        fetchError: "Gagal memuat data Pengurus",
        detailError: "Gagal mengambil data Pengurus",
        createSuccess: "Akun Pengurus berhasil didaftarkan.",
        updateSuccess: "Data Pengurus berhasil diperbarui.",
        submitError: "Gagal menyimpan data Pengurus.",
        statusError: "Gagal memperbarui status Pengurus.",
    },

    itemsPerPage: 5,

    getInitialValues: () => ({
        nama: "",
        email: "",
        password: "",
        password_original: "",
        password_changed: false,
        foto_profile: "",
        foto_profile_file: null,
        id_role: ROLE_PENGURUS,
        jabatan: "Ketua Pengurus",
        adminKey: "",
        status: true,
    }),
    normalizeRow: normalizePengurus,

    normalizeDetail: (payload) => {
        const passwordValue = payload?.password || "";

        return {
            id_user: payload?.id_user ?? payload?.idUser ?? payload?.id,
            nama: payload?.nama || "",
            email: payload?.email || "",
            password: passwordValue,
            password_original: passwordValue,
            password_changed: false,
            foto_profile: payload?.foto_profile || "",
            foto_profile_file: null,
            foto_profile_url: getUserPhotoUrl(payload?.foto_profile),
            id_role: getRoleId(payload) || ROLE_PENGURUS,
            jabatan: getJabatanLabel(payload),
            adminKey: "",
            status: payload?.status ?? true,
        };
    },

    transformRows: (rows) => rows.filter(isPengurusOrAdmin),

    sortRows: (a, b) => Number(b.id_user || 0) - Number(a.id_user || 0),

    searchKeys: ["nama", "email", "jabatan", (row) => getRoleLabel(row)],

    filters: [
        {
            name: "jabatan",
            defaultValue: "all",
            icon: Briefcase,
            width: "w-56",
            items: [
                { value: "all", label: "SEMUA JABATAN" },
                { value: "Admin", label: "ADMIN" },
                { value: "Ketua Pengurus", label: "KETUA PENGURUS" },
                { value: "Sekretaris", label: "SEKRETARIS" },
                { value: "Bendahara", label: "BENDAHARA" },
                { value: "Anggota Pengurus", label: "ANGGOTA" },
            ],
            predicate: (row, value) => {
                if (value === "all") return true;

                return getJabatanLabel(row) === value;
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
            `${row.nama || "Pengurus"} sekarang ${nextStatus ? "Aktif" : "Nonaktif"
            }`,
    },

    columns: [
        {
            header: "Identitas Pengurus",
            align: "text-left w-[35%]",
            render: (row) => (
                <div className="flex w-full justify-start py-2 text-left">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0AC4E0]/10 text-[#0AC4E0]">
                            <User size={18} />

                            {row.foto_profile_url && (
                                <img
                                    src={row.foto_profile_url}
                                    alt={row.nama || "Foto Pengurus"}
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
                                ID: {row.id_user || "-"} · {getRoleLabel(row)}
                            </p>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: "Jabatan & Otoritas",
            align: "text-left w-[40%]",
            render: (row) => {
                const isAdmin = getRoleId(row) === ROLE_ADMIN || row.jabatan === "Admin";

                return (
                    <div className="flex w-full justify-start py-2 text-left">
                        <div className="flex min-w-0 flex-col gap-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <span
                                    className={`rounded-lg border px-2.5 py-1 text-[9px] font-black uppercase tracking-tight ${isAdmin
                                        ? "border-rose-100 bg-rose-50 text-rose-600"
                                        : "border-[#0AC4E0]/10 bg-[#0AC4E0]/5 text-[#0AC4E0]"
                                        }`}
                                >
                                    {getJabatanLabel(row)}
                                </span>

                                <span className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-tight text-slate-500">
                                    {getRoleLabel(row)}
                                </span>
                            </div>

                            <p className="text-[9px] font-bold leading-relaxed text-slate-400">
                                {isAdmin
                                    ? "Memiliki otoritas penuh terhadap sistem."
                                    : "Memiliki akses pengawasan dan ringkasan data yayasan."}
                            </p>
                        </div>
                    </div>
                );
            },
        },
    ],

    onFieldChange: ({ field, value, next }) => {
        if (field === "password") {
            return {
                ...next,
                password_changed: true,
            };
        }

        if (field === "jabatan" && value !== "Admin") {
            return {
                ...next,
                adminKey: "",
                id_role: ROLE_PENGURUS,
            };
        }

        if (field === "jabatan" && value === "Admin") {
            return {
                ...next,
                id_role: ROLE_ADMIN,
            };
        }

        return next;
    },

    sections: [
        {
            title: "Identitas Pengurus",
            description: "Data dasar akun pengurus yayasan.",
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
                    label: "Email Institusi",
                    type: "email",
                    icon: Mail,
                    required: true,
                    placeholder: "user@ypamdr.astra.co.id",
                },
                {
                    name: "password",
                    label: "Password Login",
                    type: "password",
                    icon: Lock,
                    hidden: ({ mode }) => mode === "edit",
                    requiredOnCreate: true,
                    minLength: 8,
                    placeholder: "Minimal 8 karakter",
                    help: ({ mode }) =>
                        mode === "edit"
                            ? "Kosongkan jika password tidak ingin diubah."
                            : "Password digunakan untuk masuk ke sistem.",
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
                    help: "Foto akan digunakan sebagai avatar Pengurus.",
                    wrapperClassName: "space-y-2 md:col-span-2",
                },
                {
                    name: "jabatan",
                    label: "Posisi Jabatan",
                    type: "select",
                    icon: Briefcase,
                    required: true,
                    options: [
                        { value: "Admin", label: "SUPER ADMINISTRATOR" },
                        { value: "Ketua Pengurus", label: "KETUA PENGURUS" },
                        { value: "Sekretaris", label: "SEKRETARIS" },
                        { value: "Bendahara", label: "BENDAHARA" },
                        { value: "Anggota Pengurus", label: "ANGGOTA PENGURUS" },
                    ],
                },
            ],
        },
        {
            title: "Otoritas Super Admin",
            description: "Master Key wajib diisi jika membuat akun Super Admin.",
            icon: KeyRound,
            className: "rounded-3xl border border-rose-100 bg-rose-50/50 p-5",
            hidden: ({ formData }) => formData.jabatan !== "Admin",
            fields: [
                {
                    name: "adminKey",
                    label: "Master Key",
                    type: "password",
                    icon: KeyRound,
                    required: ({ formData }) => formData.jabatan === "Admin",
                    placeholder: "Masukkan Master Key",
                    help: "Field ini hanya digunakan untuk validasi pembuatan Super Admin.",
                },
            ],
        },
    ],

    validate: ({ mode, formData }) => {
        if (!formData.nama?.trim()) {
            return "Nama Pengurus wajib diisi.";
        }

        if (!formData.email?.trim()) {
            return "Email Pengurus wajib diisi.";
        }

        const emailError = validateEmailField(formData.email, "Email Pengurus");
        if (emailError) return emailError;

        if (mode === "create") {
            const passwordError = validatePasswordField(formData.password);
            if (passwordError) return passwordError;
        }

        if (
            mode === "edit" &&
            formData.password_changed &&
            formData.password
        ) {
            const passwordError = validatePasswordField(formData.password);
            if (passwordError) return passwordError;
        }

        if (!formData.jabatan) {
            return "Jabatan Pengurus wajib dipilih.";
        }

        if (formData.jabatan === "Admin" && formData.adminKey !== MASTER_AUTH_KEY) {
            return "Master Key tidak valid. Akses pembuatan Super Admin ditolak.";
        }

        return true;
    },

    buildPayload: ({ mode, formData }) => {
        const isAdmin = formData.jabatan === "Admin";
        const payload = new FormData();

        payload.append("nama", formData.nama.trim());
        payload.append("email", formData.email.trim());
        payload.append("id_role", String(isAdmin ? ROLE_ADMIN : ROLE_PENGURUS));
        payload.append("jabatan", formData.jabatan);
        payload.append("status", String(formData.status ?? true));

        if (mode === "create") {
            payload.append("password", formData.password);
        }

        if (
            mode === "edit" &&
            formData.password_changed &&
            formData.password?.trim() &&
            formData.password !== formData.password_original
        ) {
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
        create: "Simpan Pengurus",
        edit: "Update Pengurus",
    },

    previewLabel: "Preview Pengurus",
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
            label: "Role Sistem",
            value: ({ formData }) =>
                formData.jabatan === "Admin" ? "Administrator" : "Pengurus",
            className: "truncate text-[12px] font-black uppercase text-slate-800",
        },
    ],

    infoBox:
        "Akun Pengurus digunakan untuk mengakses ringkasan data yayasan. Super Admin hanya boleh dibuat dengan Master Key yang valid.",

    detailTitle: "Detail Data",

    detail: {
        titleKey: "nama",
        subtitleKey: "email",
        initialKey: "nama",
        avatarImage: (row) =>
            row?.foto_profile_url || getUserPhotoUrl(row?.foto_profile),
        avatarIcon: User,
        sideLabel: "System Authority",
        sideTitle: "Jabatan & Akses",
        description:
            "Detail Pengurus berisi identitas akun, jabatan, role sistem, dan status akses.",
        badges: [
            {
                type: "status",
                key: "status",
                activeText: "Aktif",
                inactiveText: "Nonaktif",
            },
            {
                value: (data) => getRoleLabel(data),
                icon: ShieldCheck,
            },
        ],
        sections: [
            {
                title: "Identitas Akun",
                description: "Informasi dasar akun Pengurus.",
                icon: User,
                items: [
                    { label: "Nama Lengkap", key: "nama", icon: User },
                    { label: "Email Login", key: "email", icon: Mail },
                    {
                        label: "Status",
                        key: "status",
                        icon: ShieldCheck,
                        format: (value) => (isActiveValue(value) ? "Aktif" : "Nonaktif"),
                    },
                ],
            },
            {
                title: "Otoritas Sistem",
                description: "Jabatan dan role akses pada sistem.",
                icon: Briefcase,
                items: [
                    {
                        label: "Jabatan",
                        icon: Briefcase,
                        value: (data) => getJabatanLabel(data),
                    },
                    {
                        label: "Role Sistem",
                        icon: Database,
                        value: (data) => getRoleLabel(data),
                    },
                    {
                        label: "Level Akses",
                        icon: KeyRound,
                        value: (data) =>
                            getRoleId(data) === ROLE_ADMIN
                                ? "Full System Access"
                                : "Executive Monitoring Access",
                    },
                ],
            },
        ],
    },
};
