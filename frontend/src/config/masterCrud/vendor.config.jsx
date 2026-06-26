/* eslint-disable react/prop-types */
import React from "react";
import {
    Building2,
    Database,
    FileText,
    Handshake,
    Lock,
    Mail,
    Phone,
    ShieldCheck,
    Tags,
    UploadCloud,
    User,
} from "lucide-react";

const normalizeVendorStatus = (value) => {
    const raw = String(value || "").toLowerCase();

    if (
        raw.includes("bermitra") &&
        !raw.includes("tidak") &&
        !raw.includes("non")
    ) {
        return "Bermitra";
    }

    if (value === true || value === "true" || Number(value) === 1) {
        return "Bermitra";
    }

    return "Tidak Bermitra";
};

const isVendorActive = (value) => normalizeVendorStatus(value) === "Bermitra";

const normalizeVendor = (row) => ({
    ...row,

    id_vendor: row?.id_vendor ?? row?.idVendor ?? row?.id,

    nama_vendor:
        row?.nama_vendor ||
        row?.namaVendor ||
        row?.nama_perusahaan ||
        row?.nama ||
        "Vendor",

    no_register:
        row?.no_register ||
        row?.noRegister ||
        row?.nomor_register ||
        "-",

    // Bidang sekarang hanya "Akademik" atau "Non Akademik"
    pilar:
        row?.pilar ||
        row?.kategori ||
        row?.jenis ||
        "Akademik",

    alamat:
        row?.alamat ||
        row?.address ||
        "-",

    pj_1:
        row?.pj_1 ||
        row?.pj1 ||
        row?.penanggung_jawab ||
        row?.nama_pj ||
        "-",

    telp_pj_1:
        row?.telp_pj_1 ||
        row?.telpPj1 ||
        row?.telepon ||
        row?.kontak ||
        row?.no_telp ||
        "-",

    email:
        row?.email ||
        row?.email_login ||
        row?.email_vendor ||
        row?.user?.email ||
        row?.akun?.email ||
        "-",

    akta_notaris_file:
        row?.akta_notaris_file ||
        row?.akta_notaris ||
        null,

    buku_rekening_file:
        row?.buku_rekening_file ||
        row?.buku_rekening ||
        row?.rekening_file ||
        null,

    status:
        row?.status ?? true,
});

export const vendorConfig = {
    entityKey: "vendor",
    storageKey: "master_vendor",
    entityName: "Vendor",
    pageTitle: "Manajemen Data",
    pageHighlight: "Vendor",
    subtitle: "Educational Partner Registry",
    countLabel: "Vendor",

    idKey: "id_vendor",
    displayKey: "nama_vendor",

    routes: {
        read: "/admin/vendor",
        create: "/admin/vendor/create",
        detail: (row) => `/admin/vendor/detail/${row.id_vendor}`,
        edit: (row) => `/admin/vendor/edit/${row.id_vendor}`,
    },

    api: {
        list: "/vendor",
        detail: (id) => `/vendor/${id}`,
        create: "/vendor",
        update: (id) => `/vendor/${id}`,
    },

    messages: {
        fetchError: "Gagal memuat data Vendor",
        detailError: "Gagal mengambil data Vendor",
        createSuccess: "Vendor berhasil didaftarkan ke sistem.",
        updateSuccess: "Data Vendor berhasil diperbarui.",
        submitError: "Gagal menyimpan data Vendor.",
        statusError: "Gagal memperbarui status Vendor.",
    },

    itemsPerPage: 5,

    getInitialValues: () => ({
        nama_vendor: "",
        no_register: "",
        pilar: "Akademik",   // default Akademik
        alamat: "",
        pj_1: "",
        telp_pj_1: "",
        pj_2: "",
        telp_pj_2: "",
        email: "",
        password: "",
        npwp_file: null,
        buku_rekening_file: null,
        ktp_pj_file: null,
        akta_notaris_file: null,
        status: "Bermitra",
    }),

    normalizeRow: normalizeVendor,

    normalizeDetail: (payload) => ({
        ...normalizeVendor(payload),
        password: "",
    }),

    sortRows: (a, b) => Number(b.id_vendor || 0) - Number(a.id_vendor || 0),

    searchKeys: [
        "nama_vendor",
        "no_register",
        "pilar",
        "alamat",
        "pj_1",
        "telp_pj_1",
        "email",
        "status",
    ],

    filters: [
        {
            name: "pilar",
            defaultValue: "all",
            icon: Tags,
            width: "w-56",
            items: [
                { value: "all", label: "SEMUA BIDANG" },
                { value: "Akademik", label: "AKADEMIK" },
                { value: "Non Akademik", label: "NON AKADEMIK" },
            ],
            predicate: (row, value) => {
                if (value === "all") return true;
                return String(row.pilar) === String(value);
            },
        },
        {
            name: "status",
            defaultValue: "all",
            icon: ShieldCheck,
            width: "w-56",
            items: [
                { value: "all", label: "SEMUA STATUS" },
                { value: "Bermitra", label: "BERMITRA" },
                { value: "Tidak Bermitra", label: "TIDAK BERMITRA" },
            ],
            predicate: (row, value) => {
                if (value === "all") return true;
                return normalizeVendorStatus(row.status) === value;
            },
        },
    ],

    status: {
        getValue: (row) => row.status,
        isActive: (value) => isVendorActive(value),
        getNextValue: (currentStatus) =>
            isVendorActive(currentStatus) ? "Tidak Bermitra" : "Bermitra",
        endpoint: (row) => `/vendor/${row.id_vendor}`,
        payload: (nextStatus) => ({
            status: nextStatus,
        }),
        activeText: "Bermitra",
        inactiveText: "Nonaktif",
        successMessage: (row, nextStatus) =>
            `${row.nama_vendor || "Vendor"} sekarang ${nextStatus}`,
    },

    columns: [
        {
            header: "Identitas Vendor",
            align: "text-left w-[32%]",
            render: (row) => (
                <div className="flex w-full justify-start py-2 text-left">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-100 bg-[#0AC4E0]/10 text-[#0AC4E0] shadow-sm">
                            <Building2 size={18} />
                        </div>

                        <div className="min-w-0">
                            <p className="whitespace-normal break-words text-[11px] font-black uppercase leading-snug text-slate-800">
                                {row.nama_vendor || "-"}
                            </p>

                            <p className="mt-1 flex items-start gap-1.5 break-words text-[9px] font-bold lowercase leading-snug text-slate-400">
                                <Mail size={10} className="mt-0.5 shrink-0" />
                                {row.email || "-"}
                            </p>

                            <p className="mt-2 text-[8px] font-black uppercase tracking-widest text-slate-300">
                                ID: {row.id_vendor || "-"} · REG: {row.no_register || "-"}
                            </p>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: "Bidang & Penanggung Jawab",
            align: "text-left w-[42%]",
            render: (row) => (
                <div className="flex w-full justify-start py-2 text-left">
                    <div className="flex min-w-0 flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="rounded-lg border border-[#0AC4E0]/10 bg-[#0AC4E0]/5 px-2.5 py-1 text-[9px] font-black uppercase tracking-tight text-[#0AC4E0]">
                                {row.pilar || "Akademik"}
                            </span>

                            <span className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-tight text-slate-500">
                                {normalizeVendorStatus(row.status)}
                            </span>
                        </div>

                        <p className="text-[9px] font-bold leading-relaxed text-slate-400">
                            PJ Utama: {row.pj_1 || "-"} · Kontak: {row.telp_pj_1 || "-"}
                        </p>
                    </div>
                </div>
            ),
        },
    ],

    sections: [
        {
            title: "Identitas Vendor",
            description: "Data lembaga rekanan program.",
            icon: Building2,
            className: "rounded-3xl border border-blue-100/60 bg-blue-50/40 p-5",
            fields: [
                {
                    name: "nama_vendor",
                    label: "Nama Vendor",
                    type: "text",
                    icon: Building2,
                    required: true,
                    placeholder: "Nama perusahaan / lembaga",
                },
                {
                    name: "no_register",
                    label: "No. Register",
                    type: "text",
                    icon: FileText,
                    required: true,
                    placeholder: "NIB / REG",
                },
                {
                    name: "pilar",
                    label: "Bidang Program",
                    type: "select",
                    icon: Tags,
                    required: true,
                    options: [
                        { value: "Akademik", label: "AKADEMIK" },
                        { value: "Non Akademik", label: "NON AKADEMIK" },
                    ],
                },
                {
                    name: "alamat",
                    label: "Alamat Operasional",
                    type: "textarea",
                    required: true,
                    placeholder: "Alamat lengkap operasional vendor...",
                    wrapperClassName: "space-y-2 md:col-span-2",
                },
            ],
        },
        {
            title: "Penanggung Jawab",
            description: "Kontak utama dan kontak cadangan vendor.",
            icon: User,
            className: "rounded-3xl border border-slate-100 bg-slate-50/60 p-5",
            fields: [
                {
                    name: "pj_1",
                    label: "Nama PJ Utama",
                    type: "text",
                    icon: User,
                    required: true,
                    placeholder: "Nama penanggung jawab",
                },
                {
                    name: "telp_pj_1",
                    label: "Kontak PJ Utama",
                    type: "text",
                    icon: Phone,
                    required: true,
                    placeholder: "Nomor telepon / kontak",
                },
                {
                    name: "pj_2",
                    label: "Nama PJ 2",
                    type: "text",
                    icon: User,
                    placeholder: "Nama PJ cadangan",
                    help: "Opsional",
                },
                {
                    name: "telp_pj_2",
                    label: "Kontak PJ 2",
                    type: "text",
                    icon: Phone,
                    placeholder: "Nomor telepon / kontak",
                    help: "Opsional",
                },
            ],
        },
        {
            title: "Akun & Dokumen Vendor",
            description:
                "Kredensial login dan dokumen administrasi vendor.",
            icon: UploadCloud,
            className:
                "rounded-3xl border border-slate-100 bg-white p-5 shadow-sm",
            fields: [
                {
                    name: "email",
                    label: "Email Login",
                    type: "email",
                    icon: Mail,
                    required: true,
                    placeholder: "vendor@login.com",
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
                            : "Password digunakan vendor untuk masuk ke sistem.",
                },
                {
                    name: "npwp_file",
                    label: "Dokumen NPWP",
                    type: "upload",
                    required: true,
                    accept: ".pdf,image/jpeg,image/jpg,image/png,image/webp",
                    maxSize: 10 * 1024 * 1024,
                    buttonText: "Upload Dokumen NPWP",
                    helperText: "Wajib · PDF/JPG/PNG · Maks. 10 MB",
                },
                {
                    name: "buku_rekening_file",
                    label: "Buku Rekening",
                    type: "upload",
                    required: true,
                    accept: ".pdf,image/jpeg,image/jpg,image/png,image/webp",
                    maxSize: 10 * 1024 * 1024,
                    buttonText: "Upload Buku Rekening",
                    helperText: "Wajib · PDF/JPG/PNG · Maks. 10 MB",
                },
                {
                    name: "ktp_pj_file",
                    label: "KTP Penanggung Jawab",
                    type: "upload",
                    accept: ".pdf,image/jpeg,image/jpg,image/png,image/webp",
                    maxSize: 10 * 1024 * 1024,
                    buttonText: "Upload KTP PJ",
                    helperText: "Opsional · PDF/JPG/PNG · Maks. 10 MB",
                },
                {
                    name: "akta_notaris_file",
                    label: "Akta Notaris",
                    type: "upload",
                    accept: ".pdf,image/jpeg,image/jpg,image/png,image/webp",
                    maxSize: 10 * 1024 * 1024,
                    buttonText: "Upload Akta Notaris",
                    helperText: "Opsional · PDF/JPG/PNG · Maks. 10 MB",
                },
            ],
        },
    ],

    validate: ({ mode, formData }) => {
        if (!formData.nama_vendor?.trim()) {
            return "Nama vendor wajib diisi.";
        }

        if (!formData.no_register?.trim()) {
            return "Nomor register vendor wajib diisi.";
        }

        if (!formData.pilar) {
            return "Bidang program vendor wajib dipilih.";
        }

        if (!formData.alamat?.trim()) {
            return "Alamat operasional vendor wajib diisi.";
        }

        if (!formData.pj_1?.trim()) {
            return "Nama PJ utama wajib diisi.";
        }

        if (!formData.telp_pj_1?.trim()) {
            return "Kontak PJ utama wajib diisi.";
        }

        if (!formData.email?.trim()) {
            return "Email login vendor wajib diisi.";
        }

        if (
            mode === "create" &&
            String(formData.password || "").length < 8
        ) {
            return "Password login minimal 8 karakter.";
        }

        if (
            mode === "edit" &&
            formData.password &&
            String(formData.password).length < 8
        ) {
            return "Password login minimal 8 karakter.";
        }

        if (!formData.npwp_file) {
            return "Dokumen NPWP wajib diunggah.";
        }

        if (!formData.buku_rekening_file) {
            return "Buku Rekening wajib diunggah.";
        }

        // PJ 2, Kontak PJ 2, KTP PJ, dan Akta Notaris tidak divalidasi
        // karena bersifat opsional.

        return true;
    },

    buildPayload: ({ mode, formData }) => {
        const payload = new FormData();

        payload.append("nama_vendor", formData.nama_vendor.trim());
        payload.append("no_register", formData.no_register.trim());
        payload.append("pilar", formData.pilar);
        payload.append("alamat", formData.alamat.trim());
        payload.append("pj_1", formData.pj_1.trim());
        payload.append("telp_pj_1", formData.telp_pj_1.trim());
        payload.append("pj_2", formData.pj_2?.trim() || "");
        payload.append("telp_pj_2", formData.telp_pj_2?.trim() || "");
        payload.append("email", formData.email.trim());
        payload.append("status", normalizeVendorStatus(formData.status));

        if (mode === "create" || formData.password?.trim()) {
            payload.append("password", formData.password);
        }

        const appendDocument = (fieldName) => {
            const value = formData[fieldName];

            if (value instanceof File) {
                payload.append(fieldName, value);
                return;
            }

            if (typeof value === "string" && value.trim()) {
                payload.append(fieldName, value.trim());
            }
        };
        appendDocument("npwp_file");
        appendDocument("buku_rekening_file");
        appendDocument("ktp_pj_file");
        appendDocument("akta_notaris_file");

        return payload;
    },

    formTitle: {
        create: "Tambah Data",
        edit: "Edit Data",
    },

    submitLabel: {
        create: "Simpan Vendor",
        edit: "Update Vendor",
    },

    previewLabel: "Preview Vendor",
    previewTitle: "Ringkasan Rekanan",

    preview: [
        { label: "Nama Vendor", key: "nama_vendor" },
        {
            label: "Bidang",
            key: "pilar",
            className: "truncate text-[12px] font-black uppercase text-[#0AC4E0]",
        },
        {
            label: "PJ Utama",
            key: "pj_1",
        },
        {
            label: "Email Login",
            key: "email",
            className: "truncate text-[11px] font-bold lowercase text-slate-500",
        },
    ],

    infoBox:
        "Vendor yang dibuat akan otomatis berstatus Bermitra. Status kemitraan dapat diaktifkan atau dinonaktifkan dari halaman Read Vendor.",

    detailTitle: "Detail Data",

    detail: {
        titleKey: "nama_vendor",
        subtitleKey: "email",
        initialKey: "nama_vendor",
        sideLabel: "Vendor Registry",
        sideTitle: "PJ & Dokumen",
        description:
            "Detail Vendor berisi identitas lembaga, bidang program, kontak penanggung jawab, dokumen, dan status kemitraan.",
        badges: [
            {
                key: "status",
                type: "status",
                isActive: (value) => isVendorActive(value),
                activeText: "Bermitra",
                inactiveText: "Tidak Bermitra",
            },
            {
                key: "pilar",
                icon: Tags,
            },
        ],
        sections: [
            {
                title: "Identitas Vendor",
                description: "Informasi dasar lembaga rekanan.",
                icon: Building2,
                items: [
                    { label: "Nama Vendor", key: "nama_vendor", icon: Building2 },
                    { label: "Nomor Register", key: "no_register", icon: FileText },
                    { label: "Bidang Program", key: "pilar", icon: Tags },
                    { label: "Alamat", key: "alamat", icon: Database },
                    {
                        label: "Status Kemitraan",
                        key: "status",
                        icon: Handshake,
                        format: (value) => normalizeVendorStatus(value),
                    },
                ],
            },
            {
                title: "Penanggung Jawab",
                description: "Kontak utama dan cadangan vendor.",
                icon: User,
                items: [
                    { label: "PJ Utama", key: "pj_1", icon: User },
                    { label: "Kontak PJ Utama", key: "telp_pj_1", icon: Phone },
                    { label: "PJ 2", key: "pj_2", icon: User },
                    { label: "Kontak PJ 2", key: "telp_pj_2", icon: Phone },
                    { label: "NPWP", key: "npwp_file", icon: UploadCloud },
                    { label: "Buku Rekening", key: "buku_rekening_file", icon: UploadCloud },
                    { label: "KTP PJ", key: "ktp_pj_file", icon: UploadCloud },
                    {
                        label: "Akta Notaris",
                        key: "akta_notaris_file",
                        icon: UploadCloud,
                    },
                ],
            },
        ],
    },
};
