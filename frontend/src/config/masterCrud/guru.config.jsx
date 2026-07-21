/* eslint-disable no-unused-vars */
import { isValidEmail, validatePasswordField } from "./validation";

const GURU_AKADEMIK_VALUE = "__GURU_AKADEMIK__";

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

const normalizeMapelValue = (value) =>
    String(value || "").trim().replace(/\s+/g, " ");

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
        { label: "Guru Akademik", value: GURU_AKADEMIK_VALUE },
        ...rows.map((jurusan) => ({
            label: getJurusanName(jurusan),
            value: jurusan?.id_jurusan || jurusan?.id || "",
        })),
    ];
};

const isGuruAkademikValue = (value) =>
    String(value || "") === GURU_AKADEMIK_VALUE;

const isJurusanProduktifSelection = ({ auxData, formData } = {}) =>
    isSmkContext({ auxData }) &&
    Boolean(formData?.id_jurusan) &&
    !isGuruAkademikValue(formData.id_jurusan);

const canChooseMataPelajaran = ({ auxData, formData } = {}) =>
    !isSmkContext({ auxData }) ||
    !formData?.id_jurusan ||
    isGuruAkademikValue(formData.id_jurusan);

const getJurusanLabelById = (auxData = {}, idJurusan) => {
    const selectedJurusan = findById(unwrapArray(auxData.jurusanList), idJurusan, [
        "id_jurusan",
        "id",
    ]);

    return selectedJurusan ? getJurusanName(selectedJurusan) : "";
};

const getJurusanValueSet = (auxData = {}) => {
    const values = unwrapArray(auxData.jurusanList).flatMap((jurusan) => [
        getJurusanName(jurusan),
        getJurusanCode(jurusan),
        jurusan?.nama,
        jurusan?.jurusan,
    ]);

    return new Set(
        values
            .map((value) => normalizeMapelValue(value).toLowerCase())
            .filter(Boolean),
    );
};

const isGuruAkademikRow = (guru = {}) => {
    const idJurusan =
        guru?.id_jurusan ||
        guru?.jurusan_data?.id_jurusan ||
        guru?.jurusan?.id_jurusan ||
        "";

    return !idJurusan;
};

const getUniqueMapelRows = (auxData = {}, formData = {}) => {
    const jurusanValues = getJurusanValueSet(auxData);
    const values = unwrapArray(auxData.guruMapelList)
        .filter(isGuruAkademikRow)
        .map((guru) => guru?.mata_pelajaran || guru?.mapel || "")
        .concat(formData?.mata_pelajaran || "")
        .map(normalizeMapelValue)
        .filter((value) => value && !jurusanValues.has(value.toLowerCase()));

    return [...new Set(values)].sort((a, b) => a.localeCompare(b, "id-ID"));
};

const getMapelOptions = (auxData = {}, formData = {}) => [
    { label: "Pilih mata pelajaran", value: "" },
    ...getUniqueMapelRows(auxData, formData).map((mapel) => ({
        label: mapel,
        value: mapel,
    })),
];

const getResolvedMapel = (formData = {}, auxData = {}) => {
    if (isJurusanProduktifSelection({ auxData, formData })) {
        return (
            getJurusanLabelById(auxData, formData.id_jurusan) ||
            String(formData.jurusan || "").trim()
        ).replace(/\s+/g, " ");
    }

    const mode = formData.mata_pelajaran_mode || "sudah_ada";
    const value =
        mode === "baru"
            ? formData.mata_pelajaran_baru
            : formData.mata_pelajaran;

    return String(value || "").trim().replace(/\s+/g, " ");
};

const isGuruKejuruanDetail = (data = {}) =>
    Boolean(data?.id_jurusan) && !isGuruAkademikValue(data.id_jurusan);

const getGuruJurusanDetail = (data = {}) =>
    normalizeMapelValue(
        data.guru_jurusan ||
        data.nama_jurusan ||
        data.jurusan_data?.nama_jurusan ||
        data.jurusan_data?.nama ||
        data.jurusan ||
        data.kode_jurusan,
    );

const getGuruBidangDetail = (data = {}) => {
    if (isGuruKejuruanDetail(data)) {
        return getGuruJurusanDetail(data) || "-";
    }

    return normalizeMapelValue(data.mata_pelajaran) || "-";
};

const getGuruJenisDetail = (data = {}) =>
    isGuruKejuruanDetail(data) ? "Kejuruan" : "Bidang Studi Akademik";

const renderGuruBidangDetail = (data = {}) => {
    const isKejuruan = isGuruKejuruanDetail(data);

    return (
        <div className="min-w-0 border-b border-slate-200/80 pb-5 pt-4">
            <p className="text-[8.5px] font-black uppercase tracking-[0.22em] text-slate-400">
                {isKejuruan ? "Guru Jurusan" : "Mata Pelajaran"}
            </p>

            <p className="mt-2 break-words text-[13px] font-bold leading-snug text-slate-900">
                {getGuruBidangDetail(data)}
            </p>
        </div>
    );
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
        mata_pelajaran_mode: "sudah_ada",
        mata_pelajaran: "",
        mata_pelajaran_baru: "",
        id_kelas: "",
        id_jurusan: GURU_AKADEMIK_VALUE,
        kelas_wali: "",
        jurusan: "",
        nip: "",
        password: "",
        password_original: "",
        password_changed: false,
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
        {
            key: "guruMapelList",
            dependsOn: "id_sekolah",
            endpoint: (formData) =>
                formData?.id_sekolah
                    ? `/assessment-guru/sekolah/${formData.id_sekolah}`
                    : null,
            getPayload: unwrapArray,
        },
    ],

    normalizeDetail: (payload) => {
        const data = payload?.data || payload || {};
        const guruJurusan =
            data.nama_jurusan ||
            data.jurusan_data?.nama_jurusan ||
            data.jurusan_data?.nama ||
            data.jurusan ||
            data.kode_jurusan ||
            "";

        return {
            id_sekolah: data.id_sekolah || "",
            nama_guru: data.nama_guru || "",
            email_guru: data.email_guru || "",
            no_telepon: data.no_telepon || "",
            jenis_guru: data.jenis_guru || "GURU_ASSESSMENT",
            mata_pelajaran_mode: "sudah_ada",
            mata_pelajaran: data.mata_pelajaran || "",
            mata_pelajaran_baru: "",
            id_kelas:
                data.id_kelas ||
                data.kelas_data?.id_kelas ||
                data.kelas?.id_kelas ||
                "",
            id_jurusan:
                data.id_jurusan ||
                data.jurusan_data?.id_jurusan ||
                data.jurusan?.id_jurusan ||
                GURU_AKADEMIK_VALUE,
            kelas_wali: data.kelas_wali || data.nama_kelas || "",
            jurusan:
                data.jurusan ||
                data.kode_jurusan ||
                data.nama_jurusan ||
                data.jurusan_data?.kode_jurusan ||
                data.jurusan_data?.nama_jurusan ||
                "",
            guru_jurusan: guruJurusan,
            nip: data.nip || "",
            password: "",
            password_original: "",
            password_changed: false,
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

        if (field === "password") {
            return {
                ...next,
                password_changed: true,
            };
        }

        if (field === "mata_pelajaran_mode") {
            return {
                ...next,
                mata_pelajaran: value === "baru" ? "" : next.mata_pelajaran,
                mata_pelajaran_baru: "",
            };
        }

        if (field === "id_jurusan" && !isGuruAkademikValue(value)) {
            return {
                ...next,
                mata_pelajaran_mode: "sudah_ada",
                mata_pelajaran: "",
                mata_pelajaran_baru: "",
            };
        }

        return next;
    },

    validate: ({ mode, formData, user, auxData }) => {
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

        if (
            isSmkContext({ user, auxData }) &&
            !String(formData.id_jurusan || "").trim()
        ) {
            return {
                valid: false,
                message: "Pilih Guru Akademik atau jurusan guru.",
            };
        }

        const mataPelajaran = getResolvedMapel(formData, auxData);

        if (canChooseMataPelajaran({ auxData, formData }) && !mataPelajaran) {
            return {
                valid: false,
                message:
                    formData.mata_pelajaran_mode === "baru"
                        ? "Mata pelajaran baru wajib diisi."
                        : "Pilih mata pelajaran yang sudah ada atau tambah mata pelajaran baru.",
            };
        }

        const emailGuru = String(formData.email_guru || "").trim();
        if (emailGuru && !isValidEmail(emailGuru)) {
            return {
                valid: false,
                message: "Format email guru tidak sesuai.",
            };
        }

        const password = String(formData.password || "").trim();
        if (mode === "create") {
            const passwordError = validatePasswordField(password, "Password guru");
            if (passwordError) {
                return {
                    valid: false,
                    message: passwordError,
                };
            }
        }

        if (mode === "edit" && formData.password_changed && password) {
            const passwordError = validatePasswordField(password, "Password guru");
            if (passwordError) {
                return {
                    valid: false,
                    message: passwordError,
                };
            }
        }

        return { valid: true };
    },

    buildPayload: ({ mode, formData, user, auxData }) => {
        const isSmk = isSmkContext({ user, auxData });
        const selectedKelas = getSelectedKelas(auxData, formData.id_kelas);
        const selectedJurusan = getSelectedJurusan(auxData, formData.id_jurusan);
        const isProduktifJurusan = isJurusanProduktifSelection({
            auxData,
            formData,
        });
        const password = String(formData.password || "").trim();

        const payload = {
            id_sekolah: Number(formData.id_sekolah || getSchoolIdFromUser(user)),
            nama_guru: String(formData.nama_guru || "").trim(),
            email_guru: String(formData.email_guru || "").trim(),
            no_telepon: String(formData.no_telepon || "").trim(),
            jenis_guru: formData.id_kelas ? "WALI_KELAS" : "GURU_ASSESSMENT",
            mata_pelajaran: getResolvedMapel(formData, auxData),

            id_kelas: formData.id_kelas ? Number(formData.id_kelas) : null,
            id_jurusan: isProduktifJurusan ? Number(formData.id_jurusan) : null,

            kelas_wali: selectedKelas ? getKelasName(selectedKelas) : "",
            jurusan:
                isSmk && selectedJurusan && isProduktifJurusan
                    ? getJurusanCode(selectedJurusan)
                    : "",
            nip: "",
            is_active: normalizeBoolean(formData.is_active),
        };

        if (
            mode === "create" ||
            (formData.password_changed &&
                password &&
                password !== String(formData.password_original || "").trim())
        ) {
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
            ],
        },
        {
            title: "Penugasan Guru",
            description:
                "Tentukan wali kelas dan kategori guru terlebih dahulu. Untuk SMK, pilih Guru Akademik jika guru mengajar mata pelajaran umum.",
            fields: [
                {
                    name: "id_kelas",
                    label: "Wali Kelas",
                    type: "select",
                    options: ({ auxData }) => getKelasOptions(auxData),
                },
                {
                    name: "id_jurusan",
                    label: "Jurusan / Jenis Guru",
                    type: "select",
                    hidden: ({ auxData }) => !isSmkContext({ auxData }),
                    options: ({ auxData }) => getJurusanOptions(auxData),
                    help:
                        "Pilih Guru Akademik untuk guru mata pelajaran umum. Jika memilih jurusan, mata pelajaran akan otomatis mengikuti jurusan tersebut.",
                },
            ],
        },
        {
            title: "Mata Pelajaran",
            description:
                "Khusus Guru Akademik. Pilih dari data yang sudah ada atau tambahkan mata pelajaran baru.",
            hidden: ({ auxData, formData }) =>
                !canChooseMataPelajaran({ auxData, formData }),
            fields: [
                {
                    name: "mata_pelajaran_mode",
                    label: "Sumber Mata Pelajaran",
                    type: "select",
                    options: [
                        {
                            label: "Pilih dari data yang sudah ada",
                            value: "sudah_ada",
                        },
                        {
                            label: "Tambah mata pelajaran baru",
                            value: "baru",
                        },
                    ],
                    required: true,
                },
                {
                    name: "mata_pelajaran",
                    label: "Pilih Mata Pelajaran",
                    type: "select",
                    hidden: ({ formData }) =>
                        formData.mata_pelajaran_mode === "baru",
                    options: ({ auxData, formData }) =>
                        getMapelOptions(auxData, formData),
                    required: ({ formData }) =>
                        formData.mata_pelajaran_mode !== "baru",
                    help:
                        "Dropdown ini otomatis mengambil mata pelajaran dari data guru yang sudah pernah dibuat di sekolah ini.",
                },
                {
                    name: "mata_pelajaran_baru",
                    label: "Mata Pelajaran Baru",
                    type: "text",
                    hidden: ({ formData }) =>
                        formData.mata_pelajaran_mode !== "baru",
                    placeholder:
                        "Contoh: Matematika / Bahasa Indonesia / Produktif RPL",
                    required: ({ formData }) =>
                        formData.mata_pelajaran_mode === "baru",
                    wrapperClassName: "space-y-2 md:col-span-2",
                    className:
                        "w-full !rounded-xl !bg-white !py-3 !pl-4 !text-[11px] font-bold",
                    help:
                        "Setelah disimpan, mata pelajaran baru akan otomatis tersedia di dropdown data yang sudah ada.",
                },
            ],
        },
        {
            title: "Akses Guru",
            description: "Gunakan hanya untuk reset password akses assessment guru.",
            fields: [
                {
                    name: "password",
                    label: "Password Baru",
                    type: "password",
                    placeholder: "Minimal 8 karakter",
                    hidden: ({ mode }) => mode === "edit",
                    requiredOnCreate: true,
                    minLength: 8,
                    help: ({ mode }) =>
                        mode === "edit"
                            ? "Kosongkan jika tidak ingin mengganti password guru."
                            : "Password digunakan guru untuk masuk assessment.",
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

    detailTitle: "Detail Guru",

    detail: {
        titleKey: "nama_guru",
        subtitleKey: "email_guru",
        initialKey: "nama_guru",
        sideLabel: "Data Guru",
        description:
            "Detail Guru hanya menampilkan identitas inti, jenis guru, dan bidang penugasan.",
        sections: [
            {
                title: "Informasi Guru",
                description: "Data inti guru assessment.",
                items: [
                    { label: "Nama Guru", key: "nama_guru" },
                    { label: "Email Guru", key: "email_guru" },
                    { label: "No Telepon", key: "no_telepon" },
                    {
                        label: "Jenis Guru",
                        value: (data) => getGuruJenisDetail(data),
                    },
                    {
                        label: "Bidang Guru",
                        render: (data) => renderGuruBidangDetail(data),
                    },
                ],
            },
        ],
    },

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
            value: ({ formData, auxData }) => getResolvedMapel(formData, auxData),
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
                if (isSmkContext({ auxData }) && isGuruAkademikValue(formData.id_jurusan)) {
                    return "Guru Akademik";
                }

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
        "Penugasan guru ditentukan lebih dulu. Jika SMK memilih Guru Akademik, mata pelajaran dapat dipilih dari data lama atau ditambahkan sebagai data baru. Jika memilih jurusan, mata pelajaran otomatis mengikuti jurusan tersebut.",
};
