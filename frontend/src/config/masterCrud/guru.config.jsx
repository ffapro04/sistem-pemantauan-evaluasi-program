/* eslint-disable no-unused-vars */
const getSchoolIdFromUser = (user = {}) => {
    return (
        user?.id_sekolah ||
        user?.sekolah_id ||
        user?.school_id ||
        user?.user?.id_sekolah ||
        user?.sekolah?.id_sekolah ||
        user?.sekolah?.id ||
        user?.school?.id_sekolah ||
        user?.school?.id ||
        ""
    );
};

const normalizeBoolean = (value) => {
    return value === true || value === "true" || value === 1 || value === "1";
};

const unwrapArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.result)) return payload.result;
    if (payload?.data && typeof payload.data === "object") return [payload.data];
    if (payload && typeof payload === "object") return [payload];
    return [];
};

const getSekolahDetail = (auxData = {}) => {
    const raw = auxData.sekolahDetail;
    if (Array.isArray(raw)) return raw[0] || {};
    return raw || {};
};

const getJenjangFromContext = ({ user, auxData } = {}) => {
    const sekolahDetail = getSekolahDetail(auxData);

    return String(
        sekolahDetail?.jenjang ||
        sekolahDetail?.data?.jenjang ||
        user?.jenjang ||
        user?.sekolah?.jenjang ||
        user?.school?.jenjang ||
        "",
    ).toUpperCase();
};

const isSmkContext = (context = {}) => {
    return getJenjangFromContext(context) === "SMK";
};

const getKelasName = (kelas = {}) => {
    const parts = [
        kelas?.nama_kelas,
        kelas?.tingkat,
        kelas?.jurusan,
        kelas?.rombel,
    ]
        .filter(Boolean)
        .map((item) => String(item).trim())
        .filter(Boolean);

    return kelas?.nama_kelas || parts.join(" ") || `Kelas ${kelas?.id_kelas || ""}`;
};

const getJurusanName = (jurusan = {}) => {
    return (
        jurusan?.nama_jurusan ||
        jurusan?.nama ||
        jurusan?.jurusan ||
        jurusan?.kode_jurusan ||
        jurusan?.kode ||
        `Jurusan ${jurusan?.id_jurusan || ""}`
    );
};

const getJurusanCode = (jurusan = {}) => {
    return (
        jurusan?.kode_jurusan ||
        jurusan?.kode ||
        jurusan?.nama_jurusan ||
        jurusan?.nama ||
        ""
    );
};

const findById = (rows = [], id, keyCandidates = []) => {
    if (!id) return null;

    return rows.find((row) =>
        keyCandidates.some((key) => String(row?.[key]) === String(id)),
    ) || null;
};

const getKelasOptions = (auxData = {}) => {
    const rows = unwrapArray(auxData.kelasList);

    return [
        { label: "Tidak menjadi wali kelas", value: "" },
        ...rows.map((kelas) => ({
            label: getKelasName(kelas),
            value: kelas?.id_kelas || kelas?.id || "",
        })),
    ];
};

const getJurusanOptions = (auxData = {}) => {
    const rows = unwrapArray(auxData.jurusanList);

    return [
        { label: "Pilih jurusan", value: "" },
        ...rows.map((jurusan) => ({
            label: getJurusanName(jurusan),
            value: jurusan?.id_jurusan || jurusan?.id || "",
        })),
    ];
};

const getSelectedKelas = (auxData = {}, idKelas) => {
    return findById(unwrapArray(auxData.kelasList), idKelas, ["id_kelas", "id"]);
};

const getSelectedJurusan = (auxData = {}, idJurusan) => {
    return findById(unwrapArray(auxData.jurusanList), idJurusan, [
        "id_jurusan",
        "id",
    ]);
};

export const guruConfig = {
    entityName: "Guru",
    pageHighlight: "Guru",
    subtitle: "Kelola data guru assessment sekolah",

    routes: {
        read: "/sekolah/guru",
        create: "/sekolah/guru/create",
        edit: (id) => `/sekolah/guru/edit/${id}`,
        detail: (id) => `/sekolah/guru/detail/${id}`,
    },

    api: {
        create: "/assessment-guru/register",
        createMethod: "post",
        detail: (id) => `/assessment-guru/${id}`,
        update: (id) => `/assessment-guru/${id}`,
        updateMethod: "patch",
    },

    formTitle: {
        create: "Tambah",
        edit: "Edit",
    },

    submitLabel: {
        create: "Simpan Guru",
        edit: "Update Guru",
    },

    messages: {
        createSuccess: "Guru berhasil ditambahkan.",
        updateSuccess: "Data guru berhasil diperbarui.",
        submitError: "Gagal menyimpan data guru.",
        detailError: "Gagal mengambil detail guru.",
    },

    getInitialValues: ({ user }) => ({
        id_sekolah: getSchoolIdFromUser(user),
        nama_guru: "",
        email_guru: "",
        no_telepon: "",
        jenis_guru: "GURU_ASSESSMENT",
        mata_pelajaran: "",
        id_kelas: "",
        id_jurusan: "",
        kelas_wali: "",
        jurusan: "",
        nip: "",
        password: "",
        is_active: true,
    }),

    auxiliaryDynamic: [
        {
            key: "sekolahDetail",
            dependsOn: "id_sekolah",
            endpoint: (formData) =>
                formData?.id_sekolah ? `/sekolah/${formData.id_sekolah}` : null,
            getPayload: (payload) => {
                if (payload?.data) return [payload.data];
                if (payload && typeof payload === "object") return [payload];
                return [];
            },
        },
        {
            key: "kelasList",
            dependsOn: "id_sekolah",
            endpoint: (formData) =>
                formData?.id_sekolah
                    ? `/kelas/sekolah/${formData.id_sekolah}`
                    : null,
            getPayload: unwrapArray,
        },
        {
            key: "jurusanList",
            dependsOn: "id_sekolah",
            endpoint: (formData) =>
                formData?.id_sekolah
                    ? `/jurusan/sekolah/${formData.id_sekolah}`
                    : null,
            getPayload: unwrapArray,
        },
    ],

    normalizeDetail: (payload) => {
        const data = payload?.data || payload || {};

        return {
            id_sekolah: data.id_sekolah || "",
            nama_guru: data.nama_guru || "",
            email_guru: data.email_guru || "",
            no_telepon: data.no_telepon || "",
            jenis_guru: data.jenis_guru || "GURU_ASSESSMENT",
            mata_pelajaran: data.mata_pelajaran || "",
            id_kelas:
                data.id_kelas ||
                data.kelas_data?.id_kelas ||
                data.kelas?.id_kelas ||
                "",
            id_jurusan:
                data.id_jurusan ||
                data.jurusan_data?.id_jurusan ||
                data.jurusan?.id_jurusan ||
                "",
            kelas_wali: data.kelas_wali || data.nama_kelas || "",
            jurusan:
                data.jurusan ||
                data.kode_jurusan ||
                data.nama_jurusan ||
                data.jurusan_data?.kode_jurusan ||
                data.jurusan_data?.nama_jurusan ||
                "",
            nip: data.nip || "",
            password: data.password_hash || data.password || "",
            is_active:
                data.is_active === undefined || data.is_active === null
                    ? true
                    : Boolean(data.is_active),
        };
    },

    onFieldChange: ({ field, value, next }) => {
        if (field === "id_kelas") {
            return {
                ...next,
                jenis_guru: value ? "WALI_KELAS" : "GURU_ASSESSMENT",
            };
        }

        return next;
    },

    validate: ({ mode, formData, user }) => {
        const idSekolah = formData.id_sekolah || getSchoolIdFromUser(user);

        if (!idSekolah) {
            return {
                valid: false,
                message: "ID sekolah tidak ditemukan pada akun operator.",
            };
        }

        if (!String(formData.nama_guru || "").trim()) {
            return {
                valid: false,
                message: "Nama guru wajib diisi.",
            };
        }

        if (!String(formData.mata_pelajaran || "").trim()) {
            return {
                valid: false,
                message: "Mata pelajaran wajib diisi.",
            };
        }

        if (
            mode === "create" &&
            String(formData.password || "").trim().length < 4
        ) {
            return {
                valid: false,
                message: "Password guru minimal 4 karakter.",
            };
        }

        return { valid: true };
    },

    buildPayload: ({ mode, formData, user, auxData }) => {
        const isSmk = isSmkContext({ user, auxData });
        const selectedKelas = getSelectedKelas(auxData, formData.id_kelas);
        const selectedJurusan = getSelectedJurusan(auxData, formData.id_jurusan);
        const password = String(formData.password || "").trim();

        const payload = {
            id_sekolah: Number(formData.id_sekolah || getSchoolIdFromUser(user)),
            nama_guru: String(formData.nama_guru || "").trim(),
            email_guru: String(formData.email_guru || "").trim(),
            no_telepon: String(formData.no_telepon || "").trim(),
            jenis_guru: formData.id_kelas ? "WALI_KELAS" : "GURU_ASSESSMENT",
            mata_pelajaran: String(formData.mata_pelajaran || "").trim(),

            id_kelas: formData.id_kelas ? Number(formData.id_kelas) : null,
            id_jurusan:
                isSmk && formData.id_jurusan ? Number(formData.id_jurusan) : null,

            kelas_wali: selectedKelas ? getKelasName(selectedKelas) : "",
            jurusan:
                isSmk && selectedJurusan ? getJurusanCode(selectedJurusan) : "",
            nip: "",
            is_active: normalizeBoolean(formData.is_active),
        };

        if (mode === "create" || password) {
            payload.password = password;
        }

        return payload;
    },

    sections: [
        {
            title: "Identitas Guru",
            description: "Data utama guru assessment.",
            fields: [
                {
                    name: "nama_guru",
                    label: "Nama Guru",
                    type: "text",
                    placeholder: "Masukkan nama guru",
                    required: true,
                },
                {
                    name: "email_guru",
                    label: "Email Guru",
                    type: "email",
                    placeholder: "nama@gmail.com",
                },
                {
                    name: "no_telepon",
                    label: "No. Telepon",
                    type: "text",
                    placeholder: "08xxxxxxxxxx",
                },
                {
                    name: "mata_pelajaran",
                    label: "Mata Pelajaran",
                    type: "text",
                    placeholder: "Contoh: Matematika / Bahasa Indonesia / Produktif RPL",
                    required: true,
                },
            ],
        },
        {
            title: "Penugasan Guru",
            description:
                "Wali kelas bersifat opsional. Jurusan hanya muncul untuk sekolah SMK.",
            fields: [
                {
                    name: "id_kelas",
                    label: "Wali Kelas",
                    type: "select",
                    options: ({ auxData }) => getKelasOptions(auxData),
                },
                {
                    name: "id_jurusan",
                    label: "Jurusan",
                    type: "select",
                    hidden: ({ user, auxData }) => !isSmkContext({ user, auxData }),
                    options: ({ auxData }) => getJurusanOptions(auxData),
                },
            ],
        },
        {
            title: "Akses Guru",
            description: "Password digunakan guru untuk masuk assessment.",
            fields: [
                {
                    name: "password",
                    label: "Password",
                    type: "password",
                    placeholder: "Minimal 4 karakter",
                    requiredOnCreate: true,
                    minLength: 4,
                },
                {
                    name: "is_active",
                    label: "Status Akun",
                    type: "select",
                    options: [
                        { label: "Aktif", value: true },
                        { label: "Nonaktif", value: false },
                    ],
                },
            ],
        },
    ],

    previewLabel: "Preview Guru",
    previewTitle: "Ringkasan Guru",

    preview: [
        {
            label: "Nama Guru",
            key: "nama_guru",
        },
        {
            label: "Email",
            key: "email_guru",
        },
        {
            label: "Mata Pelajaran",
            key: "mata_pelajaran",
        },
        {
            label: "Wali Kelas",
            value: ({ formData, auxData }) => {
                const selectedKelas = getSelectedKelas(auxData, formData.id_kelas);
                return selectedKelas ? getKelasName(selectedKelas) : "Bukan wali kelas";
            },
        },
        {
            label: "Jurusan",
            value: ({ formData, auxData }) => {
                const selectedJurusan = getSelectedJurusan(
                    auxData,
                    formData.id_jurusan,
                );

                return selectedJurusan ? getJurusanName(selectedJurusan) : "—";
            },
        },
        {
            label: "Status",
            value: ({ formData }) =>
                normalizeBoolean(formData.is_active) ? "Aktif" : "Nonaktif",
        },
    ],

    infoBox:
        "Mata pelajaran digunakan sebagai pengganti NIP/NIK. Wali kelas mengambil data dari Daftar Kelas, sedangkan jurusan khusus SMK mengambil data dari Data Jurusan.",
};
