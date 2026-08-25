/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";
import {
    School,
    Hash,
    ShieldCheck,
    GraduationCap,
    Layers,
    ArrowUpAZ,
    ArrowDownAZ,
} from "lucide-react";

import { isActiveValue } from "../../components/masterCrud";
import { getAuthToken } from "../../utils/authSession";

const getCurrentUser = () => {
    try {
        const raw = localStorage.getItem("user");
        if (raw) return JSON.parse(raw);
    } catch {
        // ignore
    }

    try {
        const token = getAuthToken();
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

const getUserJenjang = (user = {}) => {
    const currentUser =
        user && Object.keys(user).length > 0 ? user : getCurrentUser();

    return String(
        currentUser?.jenjang ||
        currentUser?.sekolah?.jenjang ||
        currentUser?.school?.jenjang ||
        "",
    ).toUpperCase();
};

const normalizeArrayPayload = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.result)) return payload.result;
    return [];
};

const TINGKAT_BY_JENJANG = {
    SD: ["I", "II", "III", "IV", "V", "VI"],
    SMP: ["VII", "VIII", "IX"],
    SMK: ["X", "XI", "XII"],
};

const ROMAN_ORDER = {
    I: 1,
    II: 2,
    III: 3,
    IV: 4,
    V: 5,
    VI: 6,
    VII: 7,
    VIII: 8,
    IX: 9,
    X: 10,
    XI: 11,
    XII: 12,
};

const ROMBEL_OPTIONS = [
    ...Array.from({ length: 26 }, (_, index) => {
        const value = String.fromCharCode(65 + index);
        return { value, label: value };
    }),
    ...Array.from({ length: 100 }, (_, index) => {
        const value = String(index + 1);
        return { value, label: value };
    }),
];

const getTingkatNumber = (value) => {
    return ROMAN_ORDER[String(value || "").toUpperCase()] || 0;
};

const getTingkatOptionsByJenjang = (jenjang = "SD") => {
    const normalizedJenjang = String(jenjang || "SD").toUpperCase();
    const list = TINGKAT_BY_JENJANG[normalizedJenjang] || TINGKAT_BY_JENJANG.SD;

    return list.map((item) => ({
        value: item,
        label: `Kelas ${item}`,
    }));
};

const normalizeJurusan = (row) => ({
    ...row,
    id_jurusan: row?.id_jurusan ?? row?.id,
    nama_jurusan: row?.nama_jurusan || row?.nama || "",
    kode_jurusan: String(row?.kode_jurusan || row?.kode || "").toUpperCase(),
    status: row?.status ?? true,
});

const getJurusanList = (auxData = {}) => {
    return normalizeArrayPayload(auxData?.jurusanList || [])
        .map(normalizeJurusan)
        .filter((item) => item.id_jurusan && isActiveValue(item.status))
        .sort((a, b) =>
            String(a.nama_jurusan || "").localeCompare(
                String(b.nama_jurusan || ""),
            ),
        );
};

const findJurusan = (idJurusan, auxData = {}) => {
    return getJurusanList(auxData).find(
        (item) => String(item.id_jurusan) === String(idJurusan),
    );
};

const getJurusanOptions = (auxData = {}) => {
    return getJurusanList(auxData).map((item) => ({
        value: String(item.id_jurusan),
        label: item.nama_jurusan,
        description: item.kode_jurusan,
        meta: item.kode_jurusan,
        icon: Layers,

        id_jurusan: item.id_jurusan,
        nama_jurusan: item.nama_jurusan,
        kode_jurusan: item.kode_jurusan,
    }));
};

const normalizeKelas = (row) => {
    const jurusanData = row?.jurusan_data || row?.jurusanData || row?.jurusan_detail;

    return {
        ...row,
        id_kelas: row?.id_kelas ?? row?.id,
        id_sekolah: row?.id_sekolah || row?.sekolah?.id_sekolah || "",
        id_jurusan:
            row?.id_jurusan ||
            jurusanData?.id_jurusan ||
            jurusanData?.id ||
            "",
        nama_kelas: row?.nama_kelas || "Kelas",
        tingkat: String(row?.tingkat || "").toUpperCase(),
        rombel: String(row?.rombel || "").toUpperCase(),
        jurusan: String(
            row?.jurusan ||
            jurusanData?.kode_jurusan ||
            jurusanData?.kode ||
            "",
        ).toUpperCase(),
        jurusan_data: jurusanData || null,
        nama_jurusan: jurusanData?.nama_jurusan || "",
        kode_jurusan:
            jurusanData?.kode_jurusan ||
            row?.jurusan ||
            "",
        status: row?.status ?? true,
    };
};

const buildNamaKelas = (formData = {}, auxData = {}) => {
    const tingkat = String(formData.tingkat || "").trim().toUpperCase();
    const rombel = String(formData.rombel || "").trim().toUpperCase();

    const selectedJurusan = findJurusan(formData.id_jurusan, auxData);
    const kodeJurusan = selectedJurusan?.kode_jurusan || "";

    return ["Kelas", tingkat, kodeJurusan, rombel]
        .filter(Boolean)
        .join(" ");
};

const SORT_OPTIONS = [
    { value: "kelas_asc", label: "KELAS TERKECIL", icon: ArrowUpAZ },
    { value: "kelas_desc", label: "KELAS TERBESAR", icon: ArrowDownAZ },
    { value: "az", label: "ABJAD A-Z", icon: ArrowUpAZ },
];

const compareKelas = (a, b, sortBy = "kelas_asc") => {
    if (sortBy === "kelas_desc") {
        return getTingkatNumber(b.tingkat) - getTingkatNumber(a.tingkat);
    }

    if (sortBy === "az") {
        return String(a.nama_kelas || "").localeCompare(
            String(b.nama_kelas || ""),
            "id",
            { numeric: true },
        );
    }

    return getTingkatNumber(a.tingkat) - getTingkatNumber(b.tingkat);
};

export const kelasConfig = {
    entityKey: "kelas",
    storageKey: "master_kelas_sekolah",
    entityName: "Kelas",
    pageTitle: "Manajemen Data",
    pageHighlight: "Kelas",
    subtitle: "Daftar kelas pada sekolah Anda",
    countLabel: "Kelas",

    idKey: "id_kelas",
    displayKey: "nama_kelas",

    routes: {
        read: "/sekolah/kelas",
        create: "/sekolah/kelas/create",
        detail: (row) => `/sekolah/kelas/detail/${row.id_kelas}`,
        edit: (row) => `/sekolah/kelas/edit/${row.id_kelas}`,
    },

    api: {
        list: ({ user }) => {
            const idSekolah = getOperatorSekolahId(user);
            return `/kelas/sekolah/${idSekolah}`;
        },
        detail: (id) => `/kelas/${id}`,
        create: "/kelas",
        update: (id) => `/kelas/${id}`,
        delete: (row) => `/kelas/${row.id_kelas}`,
    },

    auxiliaryDynamic: [
        {
            key: "jurusanList",
            dependsOn: "id_sekolah",
            endpoint: (formData) => {
                if (!formData.id_sekolah) return null;
                return `/jurusan/sekolah/${formData.id_sekolah}`;
            },
            getPayload: (payload) =>
                normalizeArrayPayload(payload).map(normalizeJurusan),
        },
    ],

    requiresAuth: true,
    requiresSekolahId: true,

    messages: {
        fetchError: "Gagal memuat data kelas",
        detailError: "Gagal mengambil data kelas",
        createSuccess: "Data kelas berhasil ditambahkan.",
        updateSuccess: "Data kelas berhasil diperbarui.",
        deleteSuccess: "Data kelas berhasil dihapus.",
        submitError: "Gagal menyimpan data kelas.",
        statusError: "Gagal memperbarui status kelas.",
    },

    itemsPerPage: 10,

    sortRows: (a, b) => compareKelas(a, b, "kelas_asc"),

    getInitialValues: ({ user }) => ({
        nama_kelas: "",
        tingkat: "",
        rombel: "",
        id_jurusan: "",
        jurusan: "",
        status: true,
        id_sekolah: getOperatorSekolahId(user),
    }),

    normalizeRow: normalizeKelas,
    normalizeDetail: normalizeKelas,

    searchKeys: [
        "nama_kelas",
        "tingkat",
        "rombel",
        "jurusan",
        "nama_jurusan",
        "kode_jurusan",
    ],

    filters: [
        {
            name: "tingkat",
            defaultValue: "all",
            icon: GraduationCap,
            width: "w-52",
            items: ({ user }) => [
                { value: "all", label: "SEMUA KELAS" },
                ...getTingkatOptionsByJenjang(getUserJenjang(user)).map((item) => ({
                    value: item.value,
                    label: item.label.toUpperCase(),
                })),
            ],
            predicate: (row, value) => {
                if (value === "all") return true;

                return (
                    String(row.tingkat || "").toUpperCase() ===
                    String(value || "").toUpperCase()
                );
            },
        },
        {
            name: "rombel",
            defaultValue: "all",
            icon: School,
            width: "w-44",
            items: [
                { value: "all", label: "SEMUA ROMBEL" },
                ...ROMBEL_OPTIONS.map((item) => ({
                    value: item.value,
                    label: `ROMBEL ${item.label}`,
                })),
            ],
            predicate: (row, value) => {
                if (value === "all") return true;

                return (
                    String(row.rombel || "").toUpperCase() ===
                    String(value || "").toUpperCase()
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
        endpoint: (row) => `/kelas/${row.id_kelas}`,
        payload: (nextStatus) => ({ status: nextStatus }),
        successMessage: (row, nextStatus) =>
            `${row.nama_kelas || "Kelas"} sekarang ${nextStatus ? "Aktif" : "Nonaktif"
            }`,
    },

    columns: [
        {
            header: "Nama Kelas",
            align: "text-left w-[45%]",
            render: (row) => (
                <div className="flex items-start gap-3 py-2 text-left">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0AC4E0]/10 text-[#0AC4E0]">
                        <School size={18} />
                    </div>

                    <div>
                        <p className="text-[11px] font-black uppercase text-slate-800">
                            {row.nama_kelas}
                        </p>
                        <p className="mt-1 text-[9px] font-bold text-slate-400">
                            ID: {row.id_kelas || "-"}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            header: "Tingkat, Rombel & Jurusan",
            align: "text-left w-[40%]",
            render: (row) => (
                <div className="flex flex-wrap gap-2 py-2 text-left">
                    <span className="rounded-lg bg-[#0AC4E0]/5 px-2.5 py-1 text-[9px] font-black uppercase text-[#0AC4E0]">
                        Kelas {row.tingkat || "-"}
                    </span>

                    <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-[9px] font-black uppercase text-slate-500">
                        Rombel {row.rombel || "-"}
                    </span>

                    {row.jurusan && (
                        <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase text-emerald-600">
                            {row.jurusan}
                        </span>
                    )}
                </div>
            ),
        },
    ],

    sections: [
        {
            title: "Data Kelas",
            description:
                "Isi data kelas berdasarkan jenjang sekolah. Untuk SMK, jurusan wajib dipilih dari mini master jurusan.",
            icon: School,
            className:
                "rounded-3xl border border-blue-100/60 bg-blue-50/40 p-5",
            gridClassName: "grid grid-cols-1 md:grid-cols-2 gap-4",
            fields: [
                {
                    name: "tingkat",
                    label: "Kelas",
                    type: "select",
                    icon: Hash,
                    required: true,
                    options: ({ user }) =>
                        getTingkatOptionsByJenjang(getUserJenjang(user)),
                    placeholder: "Pilih kelas",
                    help: "Pilihan kelas otomatis mengikuti jenjang sekolah login.",
                },
                {
                    name: "rombel",
                    label: "Rombel",
                    type: "select",
                    icon: School,
                    required: true,
                    options: ROMBEL_OPTIONS,
                    placeholder: "Pilih rombel",
                    help: "Pilih A-Z atau angka 1-100.",
                },
                {
                    name: "id_jurusan",
                    label: "Jurusan",
                    type: "select",
                    icon: Layers,
                    required: false,
                    options: ({ auxData }) => getJurusanOptions(auxData),
                    placeholder: "Pilih jurusan khusus SMK",
                    help: ({ auxData }) => {
                        const totalJurusan = getJurusanOptions(auxData).length;

                        if (totalJurusan === 0) {
                            return (
                                <span>
                                    Belum ada jurusan.{" "}
                                    <a
                                        href="/sekolah/jurusan/create"
                                        className="font-black text-[#0AC4E0] underline underline-offset-2"
                                    >
                                        Tambah jurusan SMK dulu
                                    </a>
                                    .
                                </span>
                            );
                        }

                        return (
                            <span>
                                Khusus kelas SMK.{" "}
                                <a
                                    href="/sekolah/jurusan"
                                    className="font-black text-[#0AC4E0] underline underline-offset-2"
                                >
                                    Kelola jurusan
                                </a>
                                .
                            </span>
                        );
                    },
                },
            ],
        },
    ],

    validate: ({ formData, user }) => {
        const idSekolah = getOperatorSekolahId(user);
        const jenjang = getUserJenjang(user);

        if (!idSekolah) {
            return "Akun operator belum terhubung dengan sekolah.";
        }

        if (!formData.tingkat) {
            return "Kelas wajib dipilih.";
        }

        if (!formData.rombel) {
            return "Rombel wajib dipilih.";
        }

        if (jenjang === "SMK" && !formData.id_jurusan) {
            return "Jurusan wajib dipilih untuk kelas SMK.";
        }

        return true;
    },

    buildPayload: ({ formData, user }) => {
        const jenjang = getUserJenjang(user);

        const payload = {
            id_sekolah: Number(getOperatorSekolahId(user)),
            tingkat: formData.tingkat?.trim().toUpperCase() || "",
            rombel: formData.rombel?.trim().toUpperCase() || "",
            status: formData.status ?? true,
        };

        if (jenjang === "SMK" && formData.id_jurusan) {
            payload.id_jurusan = Number(formData.id_jurusan);
        }

        return payload;
    },

    formTitle: {
        create: "Tambah Data",
        edit: "Edit Data",
    },

    submitLabel: {
        create: "Simpan Kelas",
        edit: "Update Kelas",
    },

    previewLabel: "Preview Kelas",
    previewTitle: "Ringkasan Kelas",

    preview: [
        {
            label: "Nama Kelas",
            value: ({ formData, auxData }) =>
                buildNamaKelas(formData, auxData) || "Belum dipilih",
        },
        { label: "Tingkat", key: "tingkat" },
        { label: "Rombel", key: "rombel" },
        {
            label: "Jurusan",
            value: ({ formData, auxData }) => {
                const jurusan = findJurusan(formData.id_jurusan, auxData);

                if (jurusan) {
                    return `${jurusan.kode_jurusan} - ${jurusan.nama_jurusan}`;
                }

                const totalJurusan = getJurusanOptions(auxData).length;

                return totalJurusan === 0
                    ? "Belum ada jurusan SMK"
                    : "Belum memilih jurusan";
            },
        },
    ],

    infoBox:
        "Data kelas digunakan untuk menghubungkan guru, wali kelas, dan assessment pada sekolah operator.",

    detailTitle: "Detail Data",

    detail: {
        titleKey: "nama_kelas",
        subtitleKey: "tingkat",
        initialKey: "nama_kelas",
        sideLabel: "Class Registry",
        description:
            "Detail kelas berisi nama kelas, tingkat, rombel, jurusan khusus SMK, dan status.",
        badges: [
            {
                type: "status",
                key: "status",
                activeText: "Aktif",
                inactiveText: "Nonaktif",
            },
            {
                key: "tingkat",
                icon: GraduationCap,
            },
        ],
        sections: [
            {
                title: "Informasi Kelas",
                description: "Data kelas pada sekolah.",
                icon: School,
                items: [
                    { label: "Nama Kelas", key: "nama_kelas", icon: School },
                    { label: "Tingkat", key: "tingkat", icon: GraduationCap },
                    { label: "Rombel", key: "rombel", icon: School },
                    {
                        label: "Jurusan",
                        icon: Layers,
                        value: (data) =>
                            data.jurusan_data?.nama_jurusan
                                ? `${data.jurusan_data.kode_jurusan} - ${data.jurusan_data.nama_jurusan}`
                                : data.jurusan || "Tidak menggunakan jurusan",
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
        title: "Hapus Data Kelas?",
        text: `Kelas "${row.nama_kelas}" akan dihapus dari daftar kelas sekolah.`,
        icon: "warning",
        confirmButtonText: "Ya, Hapus",
        cancelButtonText: "Batal",
    }),
};

export default kelasConfig;
