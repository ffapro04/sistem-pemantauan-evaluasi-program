/* eslint-disable react/prop-types */
import React from "react";
import {
    Briefcase,
    Database,
    Mail,
    MapPin,
    ShieldCheck,
    User,
    Lock,
    Layers,
} from "lucide-react";

import {
    cleanWilayahName,
    isActiveValue,
} from "../../components/masterCrud";

const ROLE_AO = 4;

const getRoleId = (row) =>
    Number(row?.id_role || row?.role_id || row?.role?.id_role || 0);

const isAO = (row) => {
    const roleName = String(row?.role?.nama_role || row?.nama_role || "")
        .toLowerCase()
        .trim();
    return getRoleId(row) === ROLE_AO || roleName.includes("area officer");
};

const getWilayahId = (wilayah) => wilayah?.id_wilayah ?? wilayah?.id;

const getWilayahName = (wilayah) =>
    cleanWilayahName(wilayah?.nama_wilayah || wilayah?.nama || "Wilayah");

const normalizeArrayPayload = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.result)) return payload.result;
    return [];
};

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
    if (row?.id_wilayah || row?.nama_wilayah) {
        return [
            {
                id_wilayah: row.id_wilayah,
                nama_wilayah: row.nama_wilayah,
            },
        ];
    }
    return [];
};

const parseKabupatenTugas = (value) => {
    if (Array.isArray(value)) return value;

    if (typeof value === "string" && value.trim()) {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    return [];
};

const getKabupatenTugas = (row) => parseKabupatenTugas(row?.kabupaten_tugas);

const getKabupatenKey = (item) =>
    String(
        item?.kode_kabupaten ??
        item?.id_kabupaten ??
        item?.id_wilayah ??
        item?.kode_wilayah ??
        "",
    ).trim();

const getKabupatenKeys = (kabupatenTugas = []) => {
    return parseKabupatenTugas(kabupatenTugas)
        .map(getKabupatenKey)
        .filter(Boolean);
};

const normalizeAO = (row) => ({
    ...row,
    id_user: row?.id_user ?? row?.idUser ?? row?.id,
    nama: row?.nama || row?.name || "Area Officer",
    email: row?.email || "",
    jabatan: row?.jabatan || "Area Officer",
    status: row?.status ?? true,
    id_role: row?.id_role || row?.role_id || row?.role?.id_role || ROLE_AO,
    wilayah: getRowWilayahList(row),
    kabupaten_tugas: getKabupatenTugas(row),
    kabupaten_tugas_keys: getKabupatenKeys(row?.kabupaten_tugas),
});

const getWilayahList = (auxData = {}) => {
    return normalizeArrayPayload(auxData?.wilayahList || [])
        .map(normalizeWilayah)
        .filter((wilayah) => {
            const jenis = String(wilayah.jenis_wilayah || "").toUpperCase();
            return (
                wilayah.id_wilayah &&
                isActiveValue(wilayah.status) &&
                jenis === "PROVINSI"
            );
        })
        .sort((a, b) => a.nama_wilayah.localeCompare(b.nama_wilayah));
};

const getKabupatenOptionsByWilayah = (formData = {}, auxData = {}) => {
    const kabupatenList = normalizeArrayPayload(auxData?.kabupatenList || []);
    const wilayahList = getWilayahList(auxData);
    const provinsi = wilayahList.find(
        (w) => Number(w.id_wilayah) === Number(formData.id_wilayah),
    );

    return kabupatenList.map((item) => {
        const idKabupaten =
            item?.id_kabupaten ??
            item?.id_wilayah ??
            item?.id ??
            null;
        const kodeKabupaten =
            item?.kode_kabupaten ??
            item?.kode_wilayah ??
            idKabupaten;
        const namaKabupaten =
            item?.nama_kabupaten ||
            item?.nama_wilayah ||
            item?.nama ||
            "Kabupaten/Kota";

        return {
            value: String(kodeKabupaten ?? idKabupaten ?? ""),
            label: namaKabupaten,
            meta: String(item?.jenis_wilayah || namaKabupaten)
                .toLowerCase()
                .startsWith("kota")
                ? "KOTA"
                : "KABUPATEN",
            icon: MapPin,
            id_provinsi:
                item?.id_parent ??
                item?.id_provinsi ??
                Number(formData.id_wilayah),
            kode_provinsi: provinsi?.kode_wilayah || "",
            nama_provinsi: provinsi?.nama_wilayah || "",
            id_kabupaten: idKabupaten,
            id_wilayah: item?.id_wilayah ?? idKabupaten,
            kode_kabupaten: String(kodeKabupaten ?? idKabupaten ?? ""),
            nama_kabupaten: namaKabupaten,
        };
    });
};

const buildKabupatenTugasPayload = (formData = {}, auxData = {}) => {
    const selectedKeys = Array.isArray(formData.kabupaten_tugas_keys)
        ? formData.kabupaten_tugas_keys.map((key) => String(key))
        : [];

    const options = getKabupatenOptionsByWilayah(formData, auxData);
    const existingKabupaten = getKabupatenTugas(formData);

    const selected = selectedKeys
        .map((key) => {
            const fromOptions = options.find(
                (item) => String(item.value) === String(key),
            );

            if (fromOptions) return fromOptions;

            return existingKabupaten.find(
                (item) => getKabupatenKey(item) === String(key),
            );
        })
        .filter(Boolean)
        .map((item) => ({
            id_provinsi:
                item?.id_provinsi ??
                item?.id_parent ??
                Number(formData.id_wilayah) ??
                null,
            kode_provinsi: item?.kode_provinsi || "",
            nama_provinsi: item?.nama_provinsi || "",
            id_kabupaten:
                item?.id_kabupaten ??
                item?.id_wilayah ??
                null,
            id_wilayah:
                item?.id_wilayah ??
                item?.id_kabupaten ??
                null,
            kode_kabupaten:
                item?.kode_kabupaten ||
                item?.kode_wilayah ||
                getKabupatenKey(item),
            nama_kabupaten:
                item?.nama_kabupaten ||
                item?.nama_wilayah ||
                item?.label ||
                "Kabupaten/Kota",
        }));

    const deduped = new Map();

    selected.forEach((item) => {
        const key = String(
            item.kode_kabupaten ||
            item.id_kabupaten ||
            item.id_wilayah ||
            item.nama_kabupaten,
        );
        deduped.set(key, item);
    });

    return Array.from(deduped.values());
};

export const aoConfig = {
    entityKey: "ao",
    storageKey: "master_ao",
    entityName: "Area Officer",
    pageTitle: "Manajemen Data",
    pageHighlight: "Area Officer",
    subtitle: "Sistem Pemantauan Area Strategis",
    countLabel: "Area Officer",

    idKey: "id_user",
    displayKey: "nama",

    routes: {
        read: "/admin/ao",
        create: "/admin/ao/create",
        detail: (row) => `/admin/ao/detail/${row?.id_user ?? row?.id ?? row}`,
        edit: (row) => `/admin/ao/edit/${row?.id_user ?? row?.id ?? row}`,
    },

    api: {
        list: "/users/ao",
        fallbackList: ["/users"],
        detail: (id) => `/users/${id}`,
        create: "/users/register_ao",
        update: (id) => `/users/${id}`,
        delete: (row) => `/users/${row?.id_user ?? row}`,
    },

    auxiliary: [
        {
            key: "wilayahList",
            endpoint: "/wilayah/provinsi",
            getPayload: normalizeArrayPayload,
            normalize: normalizeWilayah,
        },
    ],

    auxiliaryDynamic: [
        {
            key: "kabupatenList",
            endpoint: (formData) =>
                formData?.id_wilayah
                    ? `/wilayah/${formData.id_wilayah}/kabupaten`
                    : null,
            getPayload: normalizeArrayPayload,
            dependsOn: "id_wilayah",
        },
    ],

    messages: {
        fetchError: "Gagal memuat data Area Officer",
        detailError: "Gagal mengambil data Area Officer",
        createSuccess: "Akun Area Officer berhasil didaftarkan.",
        updateSuccess: "Data Area Officer berhasil diperbarui.",
        submitError: "Gagal menyimpan data Area Officer.",
        statusError: "Gagal memperbarui status Area Officer.",
    },

    itemsPerPage: 5,

    getInitialValues: () => ({
        nama: "",
        email: "",
        password: "",
        id_role: ROLE_AO,
        jabatan: "Area Officer",
        id_wilayah: "",
        id_wilayahs: [],
        kabupaten_tugas: [],
        kabupaten_tugas_keys: [],
        status: true,
    }),

    normalizeRow: normalizeAO,

    normalizeDetail: (payload) => {
        const wilayahList = getRowWilayahList(payload);
        const kabupatenTugas = getKabupatenTugas(payload);

        return {
            ...payload,
            nama: payload?.nama || "",
            email: payload?.email || "",
            password: "",
            jabatan: payload?.jabatan || "Area Officer",
            id_role: ROLE_AO,
            status: payload?.status ?? true,
            wilayah: wilayahList,
            id_wilayah:
                wilayahList?.[0]?.id_wilayah ||
                wilayahList?.[0]?.id ||
                payload?.id_wilayah ||
                "",
            id_wilayahs: wilayahList
                .map((wilayah) => Number(getWilayahId(wilayah)))
                .filter(Boolean),
            kabupaten_tugas: kabupatenTugas,
            kabupaten_tugas_keys: getKabupatenKeys(kabupatenTugas),
        };
    },

    transformRows: (rows) => rows.filter(isAO),

    sortRows: (a, b) => Number(b.id_user || 0) - Number(a.id_user || 0),

    searchKeys: [
        "nama",
        "email",
        "jabatan",
        (row) => getRowWilayahList(row).map(getWilayahName).join(" "),
        (row) =>
            getKabupatenTugas(row)
                .map((item) => item.nama_kabupaten)
                .join(" "),
    ],

    filters: [
        {
            name: "wilayah",
            defaultValue: "all",
            icon: MapPin,
            width: "w-60",
            items: ({ auxData }) => [
                { value: "all", label: "SELURUH PROVINSI" },
                ...getWilayahList(auxData).map((wilayah) => ({
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
        endpoint: (row) => `/users/${row?.id_user ?? row}`,
        payload: (nextStatus) => ({
            status: nextStatus,
        }),
        successMessage: (row, nextStatus) =>
            `${row.nama || "Area Officer"} sekarang ${nextStatus ? "Aktif" : "Nonaktif"}`,
    },

    columns: [
        {
            header: "Identitas AO",
            align: "text-left w-[30%]",
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
                                {row.jabatan || "Area Officer"}
                            </p>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: "Wilayah Penugasan",
            align: "text-left w-[42%]",
            render: (row) => {
                const wilayahList = getRowWilayahList(row);
                const kabupatenTugas = getKabupatenTugas(row);

                const provinceName =
                    wilayahList?.[0]?.nama_wilayah ||
                    kabupatenTugas?.[0]?.nama_provinsi ||
                    "Belum ditugaskan";

                return (
                    <div className="flex w-full justify-start py-2 text-left">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <span className="rounded-lg border border-[#0AC4E0]/10 bg-[#0AC4E0]/5 px-2.5 py-1 text-[9px] font-black uppercase tracking-tight text-[#0AC4E0]">
                                    {cleanWilayahName(provinceName)}
                                </span>

                                <span className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-tight text-slate-500">
                                    {kabupatenTugas.length} Kabupaten/Kota
                                </span>
                            </div>

                            {kabupatenTugas.length > 0 ? (
                                <p className="mt-2 line-clamp-1 text-[9px] font-bold leading-relaxed text-slate-400">
                                    {kabupatenTugas
                                        .map((item) => item.nama_kabupaten)
                                        .join(", ")}
                                </p>
                            ) : (
                                <p className="mt-2 text-[10px] font-bold italic text-slate-300">
                                    Belum ada kabupaten/kota tugas
                                </p>
                            )}
                        </div>
                    </div>
                );
            },
        },
    ],

    sections: [
        {
            title: "Identitas Area Officer",
            description: "Data dasar akun Area Officer.",
            icon: User,
            className: "rounded-3xl border border-blue-100/60 bg-blue-50/40 p-5",
            fields: [
                {
                    name: "nama",
                    label: "Nama Area Officer",
                    type: "text",
                    icon: User,
                    required: true,
                    placeholder: "Masukkan nama lengkap AO",
                },
                {
                    name: "jabatan",
                    label: "Jabatan",
                    type: "text",
                    icon: Briefcase,
                    required: true,
                    placeholder: "Area Officer",
                },
                {
                    name: "email",
                    label: "Email Login",
                    type: "email",
                    icon: Mail,
                    required: true,
                    placeholder: "ao@mail.com",
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
                            : "Password digunakan AO untuk masuk ke sistem.",
                },
            ],
        },
        {
            title: "Wilayah Penugasan",
            description:
                "Pilih satu provinsi binaan, lalu tentukan kabupaten/kota yang menjadi cakupan Area Officer.",
            icon: MapPin,
            className: "rounded-3xl border border-slate-100 bg-slate-50/60 p-5",
            gridClassName: "grid grid-cols-1",
            fields: [
                {
                    name: "id_wilayah",
                    label: "Provinsi Penugasan",
                    type: "select",
                    icon: MapPin,
                    required: true,
                    options: ({ auxData }) =>
                        getWilayahList(auxData).map((wilayah) => ({
                            value: Number(wilayah.id_wilayah),
                            label: wilayah.nama_wilayah,
                        })),
                    placeholder: "Pilih provinsi binaan",
                    help: "Kabupaten/kota penugasan akan mengikuti provinsi yang dipilih.",
                },
                {
                    name: "kabupaten_tugas_keys",
                    label: "Kabupaten/Kota Penugasan",
                    type: "multiSelectCards",
                    required: true,
                    searchable: true,
                    searchPlaceholder: "Cari kabupaten/kota...",
                    maxHeight: 360,
                    options: ({ formData, auxData }) =>
                        getKabupatenOptionsByWilayah(formData, auxData),
                    emptyText: "Pilih provinsi terlebih dahulu.",
                },
            ],
        },
    ],

    onFieldChange: ({ field, value, next }) => {
        if (field === "id_wilayah") {
            return {
                ...next,
                id_wilayah: value,
                id_wilayahs: value ? [Number(value)] : [],
                kabupaten_tugas: [],
                kabupaten_tugas_keys: [],
            };
        }
        return next;
    },

    validate: ({ mode, formData }) => {
        if (!formData.nama?.trim()) {
            return "Nama Area Officer wajib diisi.";
        }

        if (!formData.email?.trim()) {
            return "Email Area Officer wajib diisi.";
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

        if (!formData.id_wilayah) {
            return "Pilih provinsi penugasan Area Officer.";
        }

        if (
            !Array.isArray(formData.kabupaten_tugas_keys) ||
            formData.kabupaten_tugas_keys.length === 0
        ) {
            return "Pilih minimal satu kabupaten/kota penugasan Area Officer.";
        }

        return true;
    },

    buildPayload: ({ mode, formData, auxData }) => {
        const payload = {
            nama: formData.nama.trim(),
            email: formData.email.trim(),
            id_role: ROLE_AO,
            jabatan: formData.jabatan?.trim() || "Area Officer",
            id_wilayah: formData.id_wilayah ? Number(formData.id_wilayah) : null,
            id_wilayahs: formData.id_wilayah ? [Number(formData.id_wilayah)] : [],
            kabupaten_tugas: buildKabupatenTugasPayload(formData, auxData),
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
        create: "Simpan AO",
        edit: "Update AO",
    },

    previewLabel: "Preview Area Officer",
    previewTitle: "Ringkasan Penugasan",

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
            label: "Total Kabupaten",
            value: ({ formData }) =>
                `${formData.kabupaten_tugas_keys?.length || 0} Kabupaten/Kota`,
            className: "truncate text-[12px] font-black uppercase text-slate-800",
        },
    ],

    infoBox:
        "Area Officer akan mendapatkan akses monitoring berdasarkan provinsi dan kabupaten/kota penugasan yang dipilih pada akun ini.",

    detailTitle: "Detail Data",
    detail: {
        titleKey: "nama",
        subtitleKey: "email",
        initialKey: "nama",
        sideLabel: "Area Assignment",
        sideTitle: "Wilayah & Akses",
        description:
            "Detail Area Officer berisi identitas akun, status akses, provinsi penugasan, dan daftar kabupaten/kota tugas.",
        badges: [
            {
                type: "status",
                key: "status",
                activeText: "Aktif",
                inactiveText: "Nonaktif",
            },
            {
                key: "jabatan",
                icon: Briefcase,
            },
        ],
        sections: [
            {
                title: "Identitas Akun",
                description: "Informasi dasar akun Area Officer.",
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
                title: "Provinsi Penugasan",
                description: "Provinsi utama yang menjadi area monitoring AO.",
                icon: MapPin,
                items: [
                    {
                        label: "Total Provinsi",
                        icon: Database,
                        value: (data) => `${getRowWilayahList(data).length} Provinsi`,
                    },
                    {
                        label: "Nama Provinsi",
                        icon: MapPin,
                        value: (data) =>
                            getRowWilayahList(data).map(getWilayahName).join(", ") ||
                            getKabupatenTugas(data)?.[0]?.nama_provinsi ||
                            "Belum ada provinsi penugasan.",
                    },
                ],
            },
            {
                title: "Kabupaten/Kota Penugasan",
                description:
                    "Daftar kabupaten/kota yang menjadi cakupan tugas Area Officer.",
                icon: Layers,
                items: [
                    {
                        label: "Kabupaten/Kota Tugas",
                        render: (data) => {
                            const kabupatenTugas = getKabupatenTugas(data);

                            return (
                                <div className="col-span-full rounded-[1.7rem] border border-slate-100 bg-white p-5">
                                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">
                                                Kabupaten/Kota Tugas
                                            </p>

                                            <p className="mt-1 text-[13px] font-black uppercase text-slate-900">
                                                {kabupatenTugas?.[0]?.nama_provinsi || "Belum Diatur"}
                                            </p>
                                        </div>

                                        <div className="rounded-full bg-[#0AC4E0]/10 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-[#0AC4E0]">
                                            {kabupatenTugas.length} Wilayah
                                        </div>
                                    </div>

                                    {kabupatenTugas.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                                            {kabupatenTugas.map((item, index) => (
                                                <div
                                                    key={`${item.kode_kabupaten}-${index}`}
                                                    className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-[10px] font-black uppercase text-slate-600"
                                                >
                                                    {item.nama_kabupaten}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-[10px] font-bold text-slate-400">
                                            Belum ada kabupaten/kota tugas.
                                        </p>
                                    )}
                                </div>
                            );
                        },
                    },
                ],
            },
        ],
    },
};
