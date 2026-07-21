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
import { validateEmailField, validatePasswordField } from "./validation";

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

const normalizeKabupatenLabel = (name) => {
    const cleaned = cleanWilayahName(name || "");
    return cleaned.toLowerCase() === "lampung" ? "Kota Bandar Lampung" : cleaned;
};

const normalizeArrayPayload = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.result)) return payload.result;
    return [];
};

const normalizeWilayah = (item = {}) => {
    const idParent =
        item?.id_parent ??
        item?.idParent ??
        item?.parent?.id_wilayah ??
        item?.parent?.id ??
        item?.id_provinsi ??
        null;

    const jenisRaw = String(
        item?.jenis_wilayah ||
        item?.jenisWilayah ||
        "",
    ).toUpperCase();

    const jenisWilayah = jenisRaw || (idParent ? "KABUPATEN" : "PROVINSI");

    return {
        ...item,
        id_wilayah: item?.id_wilayah ?? item?.idWilayah ?? item?.id,
        id_parent: idParent,
        parent: item?.parent ?? null,
        nama_wilayah: cleanWilayahName(
            item?.nama_wilayah ||
            item?.namaWilayah ||
            item?.nama ||
            item?.nama_kabupaten ||
            item?.nama_provinsi ||
            "",
        ),
        kode_wilayah:
            item?.kode_wilayah ||
            item?.kodeWilayah ||
            item?.kode_kabupaten ||
            item?.kode_provinsi ||
            "-",
        jenis_wilayah: jenisWilayah,
        tipe_wilayah: item?.tipe_wilayah || "Absolute",
        area_wilayah: item?.area_wilayah || item?.areaWilayah || item?.area || "",
        status: item?.status ?? true,
    };
};

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
        item?.id_wilayah ??
        item?.id_kabupaten ??
        item?.kode_kabupaten ??
        item?.kode_wilayah ??
        item?.value ??
        "",
    ).trim();

const getKabupatenKeys = (kabupatenTugas = []) => {
    return parseKabupatenTugas(kabupatenTugas)
        .map(getKabupatenKey)
        .filter(Boolean);
};

const getSelectedProvinsiIds = (formData = {}) => {
    if (Array.isArray(formData.id_wilayahs)) {
        return formData.id_wilayahs
            .map((id) => Number(id))
            .filter((id) => Number.isFinite(id) && id > 0);
    }

    const singleId = Number(formData.id_wilayah);
    return Number.isFinite(singleId) && singleId > 0 ? [singleId] : [];
};

const toNumberOrNull = (value) => {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : null;
};

const uniqueStrings = (values = []) => [
    ...new Set(
        values
            .map((value) => cleanWilayahName(value || ""))
            .filter(Boolean),
    ),
];

const getAssignedProvinceNames = (row) => {
    const fromWilayah = getRowWilayahList(row).map(getWilayahName);
    const fromKabupaten = getKabupatenTugas(row).map((item) => item?.nama_provinsi);

    return uniqueStrings([...fromWilayah, ...fromKabupaten]);
};

const getAssignedProvinceIds = (row) => {
    const fromWilayah = getRowWilayahList(row)
        .map((wilayah) => Number(getWilayahId(wilayah)))
        .filter((id) => Number.isFinite(id) && id > 0);

    const fromKabupaten = getKabupatenTugas(row)
        .map((item) => Number(item?.id_provinsi))
        .filter((id) => Number.isFinite(id) && id > 0);

    return [...new Set([...fromWilayah, ...fromKabupaten])];
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
    return normalizeArrayPayload(auxData?.provinsiList || [])
        .map(normalizeWilayah)
        .filter((wilayah) => {
            const jenis = String(wilayah.jenis_wilayah || "").toUpperCase();
            return (
                wilayah.id_wilayah &&
                isActiveValue(wilayah.status) &&
                jenis === "PROVINSI"
            );
        })
        .sort((a, b) =>
            String(a.nama_wilayah || "").localeCompare(String(b.nama_wilayah || "")),
        );
};

const getKabupatenOptionsByWilayah = (formData = {}, auxData = {}) => {
    const selectedProvinsiIds = getSelectedProvinsiIds(formData);

    if (selectedProvinsiIds.length === 0) return [];

    const wilayahList = normalizeArrayPayload(auxData?.wilayahList || [])
        .map(normalizeWilayah);

    const provinsiList = getWilayahList(auxData);

    return wilayahList
        .filter((item) => {
            const jenis = String(item?.jenis_wilayah || "").toUpperCase();

            const parentId =
                item?.id_parent ??
                item?.parent?.id_wilayah ??
                item?.parent?.id ??
                item?.id_provinsi;

            return (
                item?.id_wilayah &&
                isActiveValue(item?.status) &&
                jenis !== "PROVINSI" &&
                selectedProvinsiIds.includes(Number(parentId))
            );
        })
        .sort((a, b) =>
            String(a.nama_wilayah || "").localeCompare(String(b.nama_wilayah || "")),
        )
        .map((item) => {
            const parentId =
                item?.id_parent ??
                item?.parent?.id_wilayah ??
                item?.parent?.id ??
                item?.id_provinsi;

            const provinsi = provinsiList.find(
                (wilayah) => Number(wilayah.id_wilayah) === Number(parentId),
            );

            const idKabupaten = item?.id_wilayah;
            const kodeKabupaten = item?.kode_wilayah || idKabupaten;
            const namaKabupaten = normalizeKabupatenLabel(item?.nama_wilayah);

            return {
                value: String(idKabupaten),
                label: item?.area_wilayah
                    ? `${namaKabupaten} · ${item.area_wilayah}`
                    : namaKabupaten,
                meta: provinsi?.nama_wilayah
                    ? `Provinsi ${provinsi.nama_wilayah}`
                    : "MASTER WILAYAH",
                icon: MapPin,

                id_provinsi: Number(parentId) || null,
                kode_provinsi: provinsi?.kode_wilayah || "",
                nama_provinsi: provinsi?.nama_wilayah || "",

                id_kabupaten: Number(idKabupaten),
                id_wilayah: Number(idKabupaten),
                kode_kabupaten: String(kodeKabupaten || ""),
                nama_kabupaten: namaKabupaten,
                area_wilayah: item?.area_wilayah || "",
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
        .map((item) => {
            const idKabupaten = toNumberOrNull(
                item?.id_wilayah ??
                item?.id_kabupaten ??
                item?.value,
            );

            const idProvinsi = toNumberOrNull(
                item?.id_provinsi ??
                item?.id_parent ??
                formData.id_wilayah,
            );

            return {
                id_provinsi: idProvinsi,
                kode_provinsi: item?.kode_provinsi || "",
                nama_provinsi: item?.nama_provinsi || "",

                id_kabupaten: idKabupaten,
                id_wilayah: idKabupaten,
                kode_kabupaten:
                    item?.kode_kabupaten ||
                    item?.kode_wilayah ||
                    String(idKabupaten || ""),
                nama_kabupaten: normalizeKabupatenLabel(
                    item?.nama_kabupaten ||
                    item?.nama_wilayah ||
                    item?.label ||
                    "Kabupaten/Kota",
                ),
                area_wilayah: item?.area_wilayah || "",
            };
        });

    const deduped = new Map();

    selected.forEach((item) => {
        const key = String(
            item.id_wilayah ||
            item.id_kabupaten ||
            item.kode_kabupaten ||
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
            key: "provinsiList",
            endpoint: "/wilayah/provinsi",
            getPayload: normalizeArrayPayload,
            normalize: normalizeWilayah,
        },
        {
            key: "wilayahList",
            endpoint: "/wilayah",
            getPayload: normalizeArrayPayload,
            normalize: normalizeWilayah,
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
        const provinsiIds = getAssignedProvinceIds({
            ...payload,
            wilayah: wilayahList,
            kabupaten_tugas: kabupatenTugas,
        });

        return {
            ...payload,
            nama: payload?.nama || "",
            email: payload?.email || "",
            password: payload?.password || "",
            jabatan: payload?.jabatan || "Area Officer",
            id_role: ROLE_AO,
            status: payload?.status ?? true,
            wilayah: wilayahList,
            id_wilayah: provinsiIds?.[0] || "",
            id_wilayahs: provinsiIds.map((id) => String(id)),
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
        (row) => getAssignedProvinceNames(row).join(" "),
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

                return getAssignedProvinceIds(row).some(
                    (id) => Number(id) === Number(value),
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
                const kabupatenTugas = getKabupatenTugas(row);
                const provinceNames = getAssignedProvinceNames(row);
                const provinceLabel = provinceNames.join(", ") || "Belum ditugaskan";

                return (
                    <div className="flex w-full justify-start py-2 text-left">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <span className="max-w-[260px] truncate rounded-lg border border-[#0AC4E0]/10 bg-[#0AC4E0]/5 px-2.5 py-1 text-[9px] font-black uppercase tracking-tight text-[#0AC4E0]">
                                    {provinceLabel}
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
                    hidden: ({ mode }) => mode === "edit",
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
                "Pilih satu atau beberapa provinsi binaan, lalu tentukan kabupaten/kota yang menjadi cakupan Area Officer.",
            icon: MapPin,
            className: "rounded-3xl border border-slate-100 bg-slate-50/60 p-5",
            gridClassName: "grid grid-cols-1",
            fields: [
                {
                    name: "id_wilayahs",
                    label: "Provinsi Penugasan",
                    type: "multiSelectCards",
                    icon: MapPin,
                    required: true,
                    searchable: true,
                    searchOnly: true,
                    minSearchLength: 2,
                    searchPlaceholder: "Cari provinsi...",
                    searchEmptyText: "Ketik minimal 2 huruf untuk mencari provinsi.",
                    maxHeight: 320,
                    options: ({ auxData }) =>
                        getWilayahList(auxData).map((wilayah) => ({
                            value: String(wilayah.id_wilayah),
                            label: `Provinsi ${wilayah.nama_wilayah}`.trim(),
                            meta: wilayah.kode_wilayah || "PROVINSI",
                            icon: MapPin,
                        })),
                    emptyText: "Belum ada provinsi pada Master Data Wilayah.",
                    help: "AO dapat ditugaskan ke satu atau beberapa provinsi.",
                },
                {
                    name: "kabupaten_tugas_keys",
                    label: "Kabupaten/Kota Penugasan",
                    type: "multiSelectCards",
                    required: true,
                    searchable: true,
                    searchOnly: true,
                    minSearchLength: 2,
                    searchPlaceholder: "Cari kabupaten/kota...",
                    searchEmptyText: "Ketik minimal 2 huruf untuk mencari kabupaten/kota.",
                    maxHeight: 360,
                    options: ({ formData, auxData }) =>
                        getKabupatenOptionsByWilayah(formData, auxData),
                    emptyText: "Pilih minimal satu provinsi terlebih dahulu.",
                },
            ],
        },
    ],

    onFieldChange: ({ field, value, next, auxData }) => {
        if (field === "id_wilayahs") {
            const selectedIds = Array.isArray(value)
                ? value.map((id) => String(id))
                : [];

            return {
                ...next,
                id_wilayahs: selectedIds,
                id_wilayah: selectedIds?.[0] ? Number(selectedIds[0]) : "",
                kabupaten_tugas: [],
                kabupaten_tugas_keys: [],
            };
        }

        if (field === "kabupaten_tugas_keys") {
            const selectedKeys = Array.isArray(value) ? value : [];

            return {
                ...next,
                kabupaten_tugas_keys: selectedKeys,
                kabupaten_tugas: buildKabupatenTugasPayload(
                    {
                        ...next,
                        kabupaten_tugas_keys: selectedKeys,
                    },
                    auxData,
                ),
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

        const emailError = validateEmailField(
            formData.email,
            "Email Area Officer",
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

        if (
            !Array.isArray(formData.id_wilayahs) ||
            formData.id_wilayahs.length === 0
        ) {
            return "Pilih minimal satu provinsi penugasan Area Officer.";
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
        const selectedProvinsiIds = getSelectedProvinsiIds(formData);

        const payload = {
            nama: formData.nama.trim(),
            email: formData.email.trim(),
            id_role: ROLE_AO,
            jabatan: formData.jabatan?.trim() || "Area Officer",
            id_wilayah: selectedProvinsiIds?.[0] || null,
            id_wilayahs: selectedProvinsiIds,
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
            label: "Total Provinsi",
            value: ({ formData }) =>
                `${getSelectedProvinsiIds(formData).length || 0} Provinsi`,
            className: "truncate text-[12px] font-black uppercase text-slate-800",
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
                description: "Provinsi yang menjadi area monitoring AO.",
                icon: MapPin,
                items: [
                    {
                        label: "Total Provinsi",
                        icon: Database,
                        value: (data) => `${getAssignedProvinceNames(data).length} Provinsi`,
                    },
                    {
                        label: "Nama Provinsi",
                        icon: MapPin,
                        value: (data) =>
                            getAssignedProvinceNames(data).join(", ") ||
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
                            const provinceNames = getAssignedProvinceNames(data);

                            return (
                                <div className="col-span-full rounded-[1.7rem] border border-slate-100 bg-white p-5">
                                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">
                                                Kabupaten/Kota Tugas
                                            </p>

                                            <p className="mt-1 text-[13px] font-black uppercase text-slate-900">
                                                {provinceNames.join(", ") || "Belum Diatur"}
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
