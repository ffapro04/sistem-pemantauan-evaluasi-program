// src/config/masterCrud/operatorSekolah.config.jsx

import {
    Building2,
    Database,
    GraduationCap,
    Lock,
    Mail,
    School,
    ShieldCheck,
    User,
} from "lucide-react";

import { isActiveValue } from "../../components/masterCrud";
import { validateEmailField, validatePasswordField } from "./validation";

const ROLE_OPERATOR_SEKOLAH = 9;
const ROLE_OPERATOR_SEKOLAH_LEGACY = 5;
const ROLE_KEPALA_SEKOLAH = 10;

const getRoleId = (row) =>
    Number(row?.id_role || row?.role_id || row?.role?.id_role || 0);

const isOperatorSekolah = (row) => {
    const roleName = String(row?.role?.nama_role || row?.nama_role || "")
        .toLowerCase()
        .trim();
    const jabatan = String(row?.jabatan || "")
        .toLowerCase()
        .trim();
    const roleId = getRoleId(row);

    if (
        roleId === ROLE_KEPALA_SEKOLAH ||
        roleName.includes("kepala sekolah") ||
        jabatan.includes("kepala sekolah")
    ) {
        return false;
    }

    return (
        roleId === ROLE_OPERATOR_SEKOLAH ||
        roleId === ROLE_OPERATOR_SEKOLAH_LEGACY ||
        roleName.includes("operator") ||
        jabatan.includes("operator")
    );
};

const normalizeSekolah = (row) => ({
    id_sekolah: row?.id_sekolah ?? row?.idSekolah ?? row?.id,
    nama_sekolah: row?.nama_sekolah || row?.namaSekolah || row?.nama || "Sekolah",
    npsn: row?.npsn || "-",
    jenjang: row?.jenjang || row?.tingkat || "-",
    status: row?.status ?? true,
});

const getRowSekolah = (row) => {
    if (row?.sekolah && typeof row.sekolah === "object") {
        return normalizeSekolah(row.sekolah);
    }

    if (row?.id_sekolah || row?.nama_sekolah) {
        return normalizeSekolah({
            id_sekolah: row.id_sekolah,
            nama_sekolah: row.nama_sekolah,
            npsn: row.npsn,
            jenjang: row.jenjang,
        });
    }

    return null;
};

const getSekolahName = (row) => {
    const sekolah = getRowSekolah(row);

    return sekolah?.nama_sekolah || "Belum Terhubung";
};

const getSekolahJenjang = (row) => {
    const sekolah = getRowSekolah(row);

    return sekolah?.jenjang || "-";
};

const getSekolahNpsn = (row) => {
    const sekolah = getRowSekolah(row);

    return sekolah?.npsn || "-";
};

const normalizeOperator = (row) => ({
    ...row,
    id_user: row?.id_user ?? row?.idUser ?? row?.id,
    nama: row?.nama || row?.name || "Operator Sekolah",
    email: row?.email || "",
    jabatan: row?.jabatan || "Operator Sekolah",
    status: row?.status ?? true,
    id_role:
        row?.id_role ||
        row?.role_id ||
        row?.role?.id_role ||
        ROLE_OPERATOR_SEKOLAH,
    id_sekolah:
        row?.id_sekolah ||
        row?.idSekolah ||
        row?.sekolah?.id_sekolah ||
        row?.sekolah?.id ||
        "",
    sekolah: getRowSekolah(row),
});

export const operatorSekolahConfig = {
    entityKey: "operator_sekolah",
    storageKey: "master_operator_sekolah",
    entityName: "Operator Sekolah",
    pageTitle: "Manajemen Data",
    pageHighlight: "Operator Sekolah",
    subtitle: "Manajemen Akun Login Sekolah",
    countLabel: "Operator Sekolah",

    idKey: "id_user",
    displayKey: "nama",

    routes: {
        read: "/admin/operator-sekolah",
        create: "/admin/operator-sekolah/create",
        detail: (row) => `/admin/operator-sekolah/detail/${row.id_user}`,
        edit: (row) => `/admin/operator-sekolah/edit/${row.id_user}`,
    },

    api: {
        list: "/users/operator-sekolah",
        fallbackList: ["/users/sekolah"],
        detail: (id) => `/users/${id}`,
        create: "/users/register",
        update: (id) => `/users/${id}`,
    },

    auxiliary: [
        {
            key: "sekolahList",
            endpoint: "/sekolah",
            normalize: normalizeSekolah,
        },
    ],

    messages: {
        fetchError: "Gagal memuat data Operator Sekolah",
        detailError: "Gagal mengambil data Operator Sekolah",
        createSuccess: "Akun Operator Sekolah berhasil didaftarkan.",
        updateSuccess: "Data Operator Sekolah berhasil diperbarui.",
        submitError: "Gagal menyimpan data Operator Sekolah.",
        statusError: "Gagal memperbarui status Operator Sekolah.",
    },

    itemsPerPage: 5,

    getInitialValues: () => ({
        nama: "",
        email: "",
        password: "",
        id_role: ROLE_OPERATOR_SEKOLAH,
        jabatan: "Operator Sekolah",
        id_sekolah: "",
        status: true,
    }),

    normalizeRow: normalizeOperator,

    normalizeDetail: (payload) => {
        const normalized = normalizeOperator(payload);

        return {
            id_user: normalized.id_user,
            nama: normalized.nama || "",
            email: normalized.email || "",
            password: payload?.password || "",
            id_role: ROLE_OPERATOR_SEKOLAH,
            jabatan: normalized.jabatan || "Operator Sekolah",
            id_sekolah: normalized.id_sekolah ? String(normalized.id_sekolah) : "",
            sekolah: normalized.sekolah,
            status: normalized.status ?? true,
        };
    },

    transformRows: (rows) => rows.filter(isOperatorSekolah),

    sortRows: (a, b) => Number(b.id_user || 0) - Number(a.id_user || 0),

    searchKeys: [
        "nama",
        "email",
        "jabatan",
        (row) => getSekolahName(row),
        (row) => getSekolahNpsn(row),
        (row) => getSekolahJenjang(row),
    ],

    filters: [
        {
            name: "sekolah",
            defaultValue: "all",
            icon: School,
            width: "w-64",
            items: ({ auxData }) => [
                { value: "all", label: "SELURUH SEKOLAH" },
                ...(auxData.sekolahList || [])
                    .filter((sekolah) => sekolah.id_sekolah)
                    .sort((a, b) => a.nama_sekolah.localeCompare(b.nama_sekolah))
                    .map((sekolah) => ({
                        value: String(sekolah.id_sekolah),
                        label: `${sekolah.nama_sekolah.toUpperCase()} (${sekolah.jenjang || "-"})`,
                    })),
            ],
            predicate: (row, value) => {
                if (value === "all") return true;

                return Number(row.id_sekolah) === Number(value);
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
            `${row.nama || "Operator Sekolah"} sekarang ${nextStatus ? "Aktif" : "Nonaktif"
            }`,
    },

    columns: [
        {
            header: "Identitas Operator",
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
                                ID: {row.id_user || "-"} · {row.jabatan || "Operator Sekolah"}
                            </p>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: "Sekolah Terhubung",
            align: "text-left w-[42%]",
            render: (row) => (
                <div className="flex w-full justify-start py-2 text-left">
                    <div className="flex min-w-0 flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="rounded-lg border border-[#0AC4E0]/10 bg-[#0AC4E0]/5 px-2.5 py-1 text-[9px] font-black uppercase tracking-tight text-[#0AC4E0]">
                                {getSekolahName(row)}
                            </span>

                            <span className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-tight text-slate-500">
                                {getSekolahJenjang(row)}
                            </span>

                            <span className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-tight text-slate-500">
                                NPSN: {getSekolahNpsn(row)}
                            </span>
                        </div>

                        <p className="text-[9px] font-bold leading-relaxed text-slate-400">
                            Operator ini digunakan sebagai akun login utama sekolah pada sistem.
                        </p>
                    </div>
                </div>
            ),
        },
    ],

    sections: [
        {
            title: "Identitas Operator",
            description: "Data dasar akun login operator sekolah.",
            icon: User,
            className: "rounded-3xl border border-blue-100/60 bg-blue-50/40 p-5",
            fields: [
                {
                    name: "nama",
                    label: "Nama Operator",
                    type: "text",
                    icon: User,
                    required: true,
                    placeholder: "Masukkan nama operator sekolah",
                },
                {
                    name: "jabatan",
                    label: "Jabatan",
                    type: "text",
                    icon: Building2,
                    required: true,
                    placeholder: "Operator Sekolah",
                },
                {
                    name: "email",
                    label: "Email Login",
                    type: "email",
                    icon: Mail,
                    required: true,
                    placeholder: "operator@sekolah.sch.id",
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
                            ? "Kosongkan jika tidak ingin mengganti password operator."
                            : "Password digunakan operator untuk masuk ke dashboard sekolah.",
                },
            ],
        },
        {
            title: "Relasi Sekolah",
            description: "Hubungkan operator dengan satu sekolah.",
            icon: School,
            className: "rounded-3xl border border-slate-100 bg-slate-50/60 p-5",
            fields: [
                {
                    name: "id_sekolah",
                    label: "Pilih Sekolah",
                    type: "select",
                    icon: School,
                    required: true,
                    options: ({ auxData }) =>
                        (auxData.sekolahList || [])
                            .filter((sekolah) => sekolah.id_sekolah)
                            .sort((a, b) => a.nama_sekolah.localeCompare(b.nama_sekolah))
                            .map((sekolah) => ({
                                value: String(sekolah.id_sekolah),
                                label: `${sekolah.nama_sekolah.toUpperCase()} - ${sekolah.jenjang || "-"}`,
                            })),
                },
            ],
        },
    ],

    validate: ({ mode, formData }) => {
        if (!formData.nama?.trim()) return "Nama Operator Sekolah wajib diisi.";
        if (!formData.email?.trim()) return "Email Operator Sekolah wajib diisi.";
        const emailError = validateEmailField(
            formData.email,
            "Email Operator Sekolah",
        );
        if (emailError) return emailError;
        if (!formData.jabatan?.trim()) return "Jabatan Operator Sekolah wajib diisi.";
        if (!formData.id_sekolah) return "Pilih sekolah yang terhubung dengan operator.";

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
        const payload = {
            nama: formData.nama.trim(),
            email: formData.email.trim(),
            id_role: ROLE_OPERATOR_SEKOLAH,
            jabatan: formData.jabatan?.trim() || "Operator Sekolah",
            id_sekolah: Number(formData.id_sekolah),
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
        create: "Simpan Operator",
        edit: "Update Operator",
    },

    previewLabel: "Preview Operator",
    previewTitle: "Ringkasan Akun Sekolah",

    preview: [
        { label: "Nama Operator", key: "nama" },
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
            label: "Sekolah",
            value: ({ formData, auxData }) => {
                const selected = (auxData.sekolahList || []).find(
                    (sekolah) => String(sekolah.id_sekolah) === String(formData.id_sekolah),
                );

                return selected?.nama_sekolah || "Belum dipilih";
            },
            className: "truncate text-[12px] font-black uppercase text-slate-800",
        },
    ],

    infoBox:
        "Operator Sekolah adalah akun login yang digunakan pihak sekolah untuk mengakses dashboard sekolah, assessment, dan program berjalan.",

    detailTitle: "Detail Data",

    detail: {
        titleKey: "nama",
        subtitleKey: "email",
        initialKey: "nama",
        sideLabel: "School Account",
        sideTitle: "Relasi Sekolah",
        description:
            "Detail Operator Sekolah berisi identitas akun, status akses, dan sekolah yang terhubung.",
        badges: [
            {
                type: "status",
                key: "status",
                activeText: "Aktif",
                inactiveText: "Nonaktif",
            },
            {
                value: () => "Operator Sekolah",
                icon: School,
            },
        ],
        sections: [
            {
                title: "Identitas Akun",
                description: "Informasi dasar akun Operator Sekolah.",
                icon: User,
                items: [
                    { label: "Nama Operator", key: "nama", icon: User },
                    { label: "Email Login", key: "email", icon: Mail },
                    { label: "Jabatan", key: "jabatan", icon: Building2 },
                    {
                        label: "Status",
                        key: "status",
                        icon: ShieldCheck,
                        format: (value) => (isActiveValue(value) ? "Aktif" : "Nonaktif"),
                    },
                ],
            },
            {
                title: "Sekolah Terhubung",
                description: "Sekolah yang menggunakan akun operator ini.",
                icon: School,
                items: [
                    {
                        label: "Nama Sekolah",
                        icon: School,
                        value: (data) => getSekolahName(data),
                    },
                    {
                        label: "Jenjang",
                        icon: GraduationCap,
                        value: (data) => getSekolahJenjang(data),
                    },
                    {
                        label: "NPSN",
                        icon: Database,
                        value: (data) => getSekolahNpsn(data),
                    },
                    {
                        label: "Role Sistem",
                        icon: ShieldCheck,
                        value: () => "Sekolah",
                    },
                ],
            },
        ],
    },
};
