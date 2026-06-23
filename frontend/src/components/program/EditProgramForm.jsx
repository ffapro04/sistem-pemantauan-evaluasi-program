/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import {
    ArrowLeft,
    Save,
    Building2,
    FileText,
    UserCheck,
    Calendar,
    Loader2,
    DollarSign,
    RefreshCw,
    ShieldCheck,
} from "lucide-react";

import {
    Sidebar,
    PageWrapper,
    Button,
    Input,
    Dropdown,
    FormSection,
    FormField,
    FileDropzone,
    WorkflowBuilder,
    SelectedChips,
} from "../common";

import {
    filterSchoolsByHoAccess,
    canHoAccessSchool,
} from "../../utils/hoAccess";


const API_BASE_URL = "";

const PROGRAM_STATUSES = [
    "Approval",
    "Sosialisasi",
    "Implementasi",
    "Evaluasi",
    "Selesai",
];

const STATUS_STYLE = {
    Approval: "border-amber-100 bg-amber-50 text-amber-600",
    Sosialisasi: "border-violet-100 bg-violet-50 text-violet-600",
    Implementasi: "border-cyan-100 bg-cyan-50 text-cyan-600",
    Evaluasi: "border-blue-100 bg-blue-50 text-blue-600",
    Selesai: "border-emerald-100 bg-emerald-50 text-emerald-600",
};

const PILAR_PROGRAM_OPTIONS = {
    AKADEMIK: [
        { value: "AKADEMIK", label: "Akademik" },
        { value: "KARAKTER", label: "Karakter" },
    ],
    NON_AKADEMIK: [
        { value: "SENI_BUDAYA", label: "Seni Budaya" },
        { value: "KECAKAPAN_HIDUP", label: "Kecakapan Hidup" },
    ],
};

function normalizeCategory(value) {
    return String(value || "")
        .trim()
        .toUpperCase()
        .replaceAll("-", "_")
        .replaceAll(" ", "_");
}

function getPilarOptions(kategori) {
    return PILAR_PROGRAM_OPTIONS[normalizeCategory(kategori)] || [];
}

function getDefaultPilar(kategori) {
    return getPilarOptions(kategori)[0]?.value || "";
}

function formatRupiah(value) {
    const number = String(value || "").replace(/\D/g, "");

    if (!number) return "";

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(number));
}

function cleanNumber(value) {
    return String(value || "").replace(/\D/g, "");
}

function normalizeArray(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.result)) return payload.result;
    if (Array.isArray(payload?.rows)) return payload.rows;
    if (Array.isArray(payload?.sekolah)) return payload.sekolah;
    if (Array.isArray(payload?.schools)) return payload.schools;
    if (Array.isArray(payload?.vendor)) return payload.vendor;
    if (Array.isArray(payload?.vendors)) return payload.vendors;
    if (Array.isArray(payload?.users)) return payload.users;

    return [];
}

function getArray(...values) {
    return values.find((value) => Array.isArray(value)) || [];
}

function normalizeId(value) {
    if (value === null || value === undefined || value === "") return null;
    return String(value);
}

function isActiveValue(value) {
    return value === true || value === "true" || Number(value) === 1;
}

function cleanWilayahName(value) {
    const raw = String(value || "").trim();

    if (!raw) return "Wilayah Tidak Diketahui";

    if (raw.includes("/")) {
        return raw.split("/").filter(Boolean).pop() || raw;
    }

    return raw;
}

function getTokenPayload() {
    const token = localStorage.getItem("token");

    if (!token) return null;

    try {
        return jwtDecode(token);
    } catch {
        return null;
    }
}

function createRequirement(name = "", description = "") {
    return {
        nama: name,
        tipe: "upload",
        deskripsi: description,
    };
}

function createDefaultFase() {
    return {
        nama_fase: "Fase 1",
        deskripsi: "",
        termin: [
            {
                nama_termin: "Termin Luar Fase 1",
                deskripsi: "Syarat awal untuk membuka Fase 1.",
                jumlah_pembayaran: 0,
                persyaratan: [
                    createRequirement(
                        "Upload dokumen pembuka fase",
                        "Dokumen administrasi, pembayaran, MOU, atau dokumen awal lainnya.",
                    ),
                ],
            },
        ],
        kegiatans: [
            {
                nama_kegiatans: "Termin Dalam Fase 1",
                deskripsi: "Bukti pelaksanaan setelah Fase 1 berjalan.",
                persyaratan: [
                    createRequirement(
                        "Upload dokumentasi kegiatan",
                        "Foto atau dokumentasi kegiatan yang sudah dilaksanakan.",
                    ),
                    createRequirement(
                        "Upload absensi kegiatan",
                        "Daftar hadir peserta atau pihak yang terlibat.",
                    ),
                ],
            },
        ],
    };
}

function normalizeRequirementForForm(requirement) {
    return {
        id_persyaratan:
            requirement?.id_persyaratan || requirement?.id || requirement?.rawId || null,
        nama: requirement?.nama || requirement?.name || "",
        tipe: requirement?.tipe || requirement?.type || "upload",
        deskripsi:
            requirement?.deskripsi ||
            requirement?.description ||
            requirement?.keterangan ||
            "",
    };
}

function normalizeFasesForForm(detail) {
    const sourceFases = getArray(detail?.fases);

    if (sourceFases.length === 0) {
        return [createDefaultFase()];
    }

    return sourceFases.map((fase, faseIndex) => {
        const terminList = getArray(fase.termin, fase.termins, fase.t_termin);
        const kegiatanList = getArray(
            fase.kegiatans,
            fase.kegiatan,
            fase.t_kegiatans,
        );

        return {
            id_fase: fase.id_fase || fase.id || null,
            nama_fase: fase.nama_fase || `Fase ${faseIndex + 1}`,
            deskripsi: fase.deskripsi || "",
            termin:
                terminList.length > 0
                    ? terminList.map((termin, terminIndex) => ({
                        id_termin: termin.id_termin || termin.id || null,
                        nama_termin:
                            termin.nama_termin || termin.nama || `Termin Luar ${terminIndex + 1}`,
                        deskripsi: termin.deskripsi || "",
                        jumlah_pembayaran: termin.jumlah_pembayaran || 0,
                        persyaratan:
                            getArray(
                                termin.persyaratan,
                                termin.persyaratan_termin,
                                termin.requirements,
                                termin.t_persyaratan_termin,
                            ).map(normalizeRequirementForForm) || [],
                    }))
                    : [
                        {
                            nama_termin: `Termin Luar Fase ${faseIndex + 1}`,
                            deskripsi: "",
                            jumlah_pembayaran: 0,
                            persyaratan: [createRequirement("Upload dokumen pembuka fase")],
                        },
                    ],
            kegiatans:
                kegiatanList.length > 0
                    ? kegiatanList.map((kegiatan, kegiatanIndex) => ({
                        id_kegiatans:
                            kegiatan.id_kegiatans ||
                            kegiatan.id_kegiatan ||
                            kegiatan.id ||
                            null,
                        nama_kegiatans:
                            kegiatan.nama_kegiatans ||
                            kegiatan.nama_kegiatan ||
                            kegiatan.nama ||
                            `Termin Dalam ${kegiatanIndex + 1}`,
                        deskripsi: kegiatan.deskripsi || "",
                        persyaratan:
                            getArray(
                                kegiatan.persyaratan,
                                kegiatan.persyaratan_kegiatan,
                                kegiatan.requirements,
                                kegiatan.t_persyaratan_kegiatan,
                            ).map(normalizeRequirementForForm) || [],
                    }))
                    : [
                        {
                            nama_kegiatans: `Termin Dalam Fase ${faseIndex + 1}`,
                            deskripsi: "",
                            persyaratan: [
                                createRequirement("Upload dokumentasi kegiatan"),
                                createRequirement("Upload absensi kegiatan"),
                            ],
                        },
                    ],
        };
    });
}

function getWilayahIds(item) {
    const source = item?.raw || item;

    if (!source) return [];

    const ids = [];

    if (source.id_wilayah) ids.push(source.id_wilayah);
    if (source.wilayah_id) ids.push(source.wilayah_id);
    if (source.id_parent) ids.push(source.id_parent);

    if (source.wilayah?.id_wilayah) ids.push(source.wilayah.id_wilayah);
    if (source.wilayah?.id) ids.push(source.wilayah.id);
    if (source.raw?.id_wilayah) ids.push(source.raw.id_wilayah);
    if (source.raw?.wilayah?.id_wilayah) ids.push(source.raw.wilayah.id_wilayah);
    if (source.raw?.wilayah?.id) ids.push(source.raw.wilayah.id);

    if (Array.isArray(source.wilayah)) {
        source.wilayah.forEach((wilayah) => {
            if (wilayah?.id_wilayah) ids.push(wilayah.id_wilayah);
            if (wilayah?.id) ids.push(wilayah.id);
            if (wilayah?.wilayah?.id_wilayah) ids.push(wilayah.wilayah.id_wilayah);
            if (wilayah?.raw?.id_wilayah) ids.push(wilayah.raw.id_wilayah);
        });
    }

    if (Array.isArray(source.wilayah_ids)) {
        source.wilayah_ids.forEach((id) => ids.push(id));
    }

    return [...new Set(ids.map(normalizeId).filter(Boolean))];
}

function normalizeSchool(item) {
    return {
        value: item?.id_sekolah ?? item?.id,
        label: item?.nama_sekolah ?? item?.nama ?? "Sekolah",
        subLabel: `${item?.npsn || "-"} · ${cleanWilayahName(
            item?.wilayah?.nama_wilayah || item?.nama_wilayah || item?.wilayah,
        )}`,
        raw: item,
    };
}

function normalizeAo(item) {
    return {
        value: item?.id_user ?? item?.id,
        label: item?.nama ?? item?.name ?? "Area Officer",
        subLabel: cleanWilayahName(
            item?.wilayah?.nama_wilayah ||
            item?.nama_wilayah ||
            item?.wilayah ||
            item?.area,
        ),
        raw: item,
    };
}

function getVendorId(item) {
    return item?.id_vendor ?? item?.vendor_id ?? item?.id_master_vendor ?? item?.id_user ?? item?.id ?? null;
}

function normalizeVendor(item) {
    const vendorId = getVendorId(item);

    return {
        value: vendorId,
        realId: vendorId,
        label:
            item?.nama_vendor ??
            item?.nama_perusahaan ??
            item?.nama_pt ??
            item?.nama ??
            item?.name ??
            "Vendor",
        subLabel: item?.kategori || item?.kategori_vendor || item?.jenis || item?.pilar || "",
        raw: item,
    };
}

function getSelectedIdsFromDetail(detail, singleKey, arrayKeys = [], objectKeys = []) {
    const ids = [];

    const pushId = (value) => {
        if (value === null || value === undefined || value === "") return;

        if (Array.isArray(value)) {
            value.forEach(pushId);
            return;
        }

        if (typeof value === "object") {
            pushId(
                value.id_user ||
                value.id_pengawas ||
                value.id_ao ||
                value.id_area_officer ||
                value.id_vendor ||
                value.vendor_id ||
                value.id_master_vendor ||
                value.id_sekolah ||
                value.id ||
                value.value,
            );
            return;
        }

        ids.push(value);
    };

    pushId(detail?.[singleKey]);

    arrayKeys.forEach((key) => {
        pushId(detail?.[key]);
    });

    objectKeys.forEach((key) => {
        pushId(detail?.[key]);
    });

    return [...new Set(ids.map(normalizeId).filter(Boolean))];
}

function buildSelectedOptionsFromIds(options = [], selectedIds = [], labelPrefix = "Data") {
    const uniqueIds = [
        ...new Set(
            (selectedIds || [])
                .map((item) => normalizeId(item))
                .filter(Boolean),
        ),
    ];

    return uniqueIds.map((id) => {
        const found = options.find((item) => String(item.value) === String(id));

        if (found) {
            return found;
        }

        return {
            value: id,
            realId: id,
            label: `${labelPrefix} #${id}`,
            subLabel: "Data tersimpan pada program",
            raw: {
                id,
                id_user: id,
                id_vendor: id,
                __fromProgramDetail: true,
            },
            persisted: true,
        };
    });
}

async function hydrateSelectedAoOptions(selectedAOs = [], headers = {}) {
    if (!Array.isArray(selectedAOs) || selectedAOs.length === 0) return [];

    const hydrated = await Promise.all(
        selectedAOs.map(async (option) => {
            const value = option?.realId || option?.value;
            const isFallbackLabel = String(option?.label || "").startsWith("Area Officer #");

            if (!value || (!option?.persisted && !isFallbackLabel)) {
                return option;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/users/${value}`, { headers });
                const payload = await response.json().catch(() => ({}));

                if (!response.ok) {
                    return option;
                }

                const user = payload?.data || payload;

                if (!user || (!user.id_user && !user.id)) {
                    return option;
                }

                return {
                    ...normalizeAo(user),
                    persisted: option?.persisted || false,
                };
            } catch {
                return option;
            }
        }),
    );

    return hydrated;
}

function buildPayloadFases(fases) {
    return fases.map((fase, faseIndex) => ({
        id_fase: fase.id_fase || null,
        nama_fase: fase.nama_fase,
        deskripsi: fase.deskripsi || "",
        urutan: faseIndex + 1,

        termin: (fase.termin || []).map((termin, terminIndex) => ({
            id_termin: termin.id_termin || null,
            nama_termin: termin.nama_termin,
            deskripsi: termin.deskripsi || "",
            urutan: terminIndex + 1,
            jumlah_pembayaran: Number(termin.jumlah_pembayaran || 0),

            persyaratan: (termin.persyaratan || []).map((syarat, syaratIndex) => ({
                id_persyaratan: syarat.id_persyaratan || null,
                nama: syarat.nama,
                tipe: syarat.tipe || "upload",
                deskripsi: syarat.deskripsi || "",
                urutan: syaratIndex + 1,
            })),
        })),

        kegiatans: (fase.kegiatans || []).map((kegiatan, kegiatanIndex) => ({
            id_kegiatans: kegiatan.id_kegiatans || null,
            nama_kegiatans: kegiatan.nama_kegiatans,
            deskripsi: kegiatan.deskripsi || "",
            urutan: kegiatanIndex + 1,

            persyaratan: (kegiatan.persyaratan || []).map((syarat, syaratIndex) => ({
                id_persyaratan: syarat.id_persyaratan || null,
                nama: syarat.nama,
                tipe: syarat.tipe || "upload",
                deskripsi: syarat.deskripsi || "",
                urutan: syaratIndex + 1,
            })),
        })),
    }));
}

function canHoAccessProgramEdit(detail, currentHo, allSchools = []) {
    if (!currentHo) return true;

    const selectedSchoolIds = getSelectedIdsFromDetail(
        detail,
        "id_sekolah",
        ["sekolah_ids", "target_sekolah_ids", "school_ids"],
        ["sekolah", "sekolahs", "schools", "target_sekolah"],
    );

    if (selectedSchoolIds.length === 0) {
        return canHoAccessSchool(currentHo, detail?.sekolah || {});
    }

    const relatedSchools = allSchools.filter((school) => {
        const schoolId = school?.id_sekolah || school?.id;

        return selectedSchoolIds.includes(String(schoolId));
    });

    if (relatedSchools.length === 0) {
        return canHoAccessSchool(currentHo, detail?.sekolah || {});
    }

    return relatedSchools.every((school) =>
        canHoAccessSchool(currentHo, school),
    );
}

function EditProgramForm({
    kategori = "AKADEMIK",
    title = "Program Akademik",
    titleHighlight = "Akademik",
    vendorEndpoint = `${API_BASE_URL}/vendor?kategori=AKADEMIK`,
    backPath = "/ho/program/akademik",
    detailPathPrefix = "/ho/program/akademik/detail",
    programPlaceholder = "Masukkan nama program...",
    successMessage = "Program berhasil diperbarui",
}) {
    const { id } = useParams();
    const navigate = useNavigate();

    const [sekolahOptions, setSekolahOptions] = useState([]);
    const [aoOptions, setAoOptions] = useState([]);
    const [vendorOptions, setVendorOptions] = useState([]);

    const [hoUser, setHoUser] = useState({
        id: null,
        nama: "Head Office",
    });

    const [formData, setFormData] = useState({
        namaProgram: "",
        deskripsi: "",
        nomorMou: "",
        hargaVendor: "",
        kpiNama: "",
        kpiTarget: "",
        kpiSatuan: "%",
        tahun: new Date().getFullYear().toString(),
        tanggalMulai: "",
        statusProgram: "Approval",
        pilarProgram: getDefaultPilar(kategori),

        selectedSekolahs: [],
        selectedAOs: [],
        selectedVendors: [],

        fileMou: null,
        existingFileName: "",
    });

    const [fases, setFases] = useState([createDefaultFase()]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const updateForm = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const fetchInitialData = async () => {
        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const decoded = getTokenPayload();
            const currentHoId =
                decoded?.id_user ||
                decoded?.sub ||
                decoded?.id ||
                null;

            if (decoded) {
                setHoUser({
                    id: currentHoId,
                    nama: decoded.nama || decoded.name || "Head Office",
                });
            }

            const headers = { Authorization: `Bearer ${token}` };

            const [resSekolah, resAo, resVendor, resDetail, resCurrentHo] =
                await Promise.all([
                    fetch(`${API_BASE_URL}/sekolah`, { headers }),
                    fetch(`${API_BASE_URL}/users/ao`, { headers }),
                    fetch(vendorEndpoint, { headers }),
                    fetch(`${API_BASE_URL}/program/${id}`, { headers }),
                    currentHoId
                        ? fetch(`${API_BASE_URL}/users/${currentHoId}`, { headers })
                        : Promise.resolve(null),
                ]);

            const dataSekolah = await resSekolah.json().catch(() => []);
            const dataAo = await resAo.json().catch(() => []);
            const dataVendor = await resVendor.json().catch(() => []);
            const dataDetail = await resDetail.json().catch(() => ({}));
            const dataCurrentHo = resCurrentHo
                ? await resCurrentHo.json().catch(() => ({}))
                : null;

            if (!resDetail.ok) {
                throw new Error(dataDetail?.message || "Gagal memuat detail program");
            }

            if (!resSekolah.ok || !resAo.ok || !resVendor.ok) {
                throw new Error(
                    dataSekolah?.message ||
                    dataAo?.message ||
                    dataVendor?.message ||
                    "Gagal memuat master data",
                );
            }

            const detail = dataDetail?.data || dataDetail;
            const currentHo = dataCurrentHo?.data || dataCurrentHo || decoded || null;

            if (currentHo) {
                setHoUser({
                    ...currentHo,
                    id:
                        currentHo?.id_user ||
                        currentHo?.id ||
                        currentHoId,
                    nama:
                        currentHo?.nama ||
                        currentHo?.name ||
                        decoded?.nama ||
                        decoded?.name ||
                        "Head Office",
                });
            }

            const rawSchools = normalizeArray(dataSekolah)
                .filter((item) => item?.id_sekolah || item?.id)
                .filter((item) => item?.status === undefined || isActiveValue(item.status))
                .sort((a, b) =>
                    String(a?.nama_sekolah || a?.nama || "").localeCompare(
                        String(b?.nama_sekolah || b?.nama || ""),
                    ),
                );

            const allowedToEdit = canHoAccessProgramEdit(
                detail,
                currentHo,
                rawSchools,
            );

            if (!allowedToEdit) {
                toast.error("Kamu tidak punya akses untuk mengedit program ini.");
                navigate(backPath);
                return;
            }

            const accessibleRawSchools = filterSchoolsByHoAccess(
                rawSchools,
                currentHo,
            );

            const schools = accessibleRawSchools
                .map(normalizeSchool)
                .sort((a, b) => a.label.localeCompare(b.label));

            const aos = normalizeArray(dataAo)
                .filter((item) => item?.id_user || item?.id)
                .filter((item) => item?.status === undefined || isActiveValue(item.status))
                .map(normalizeAo)
                .sort((a, b) => a.label.localeCompare(b.label));

            const vendors = normalizeArray(dataVendor)
                .filter((item) => item?.id_vendor || item?.id)
                .filter((item) => item?.status === undefined || isActiveValue(item.status))
                .map(normalizeVendor)
                .sort((a, b) => a.label.localeCompare(b.label));

            setSekolahOptions(schools);
            setAoOptions(aos);
            setVendorOptions(vendors);

            const selectedSchoolIds = getSelectedIdsFromDetail(
                detail,
                "id_sekolah",
                ["sekolah_ids", "target_sekolah_ids", "school_ids"],
                ["sekolah", "sekolahs", "schools", "target_sekolah"],
            );

            const selectedAoIds = getSelectedIdsFromDetail(
                detail,
                "id_pengawas",
                [
                    "ao_ids",
                    "pengawas_ids",
                    "area_officer_ids",
                    "areaOfficerIds",
                    "id_area_officers",
                ],
                [
                    "pengawas",
                    "ao",
                    "aos",
                    "area_officer",
                    "area_officers",
                    "areaOfficer",
                    "areaOfficers",
                ],
            );

            const selectedVendorIds = getSelectedIdsFromDetail(
                detail,
                "id_vendor",
                ["vendor_ids", "id_vendors", "vendorIds"],
                ["vendor", "vendors", "vendor_program", "program_vendors"],
            );

            const selectedAOs = await hydrateSelectedAoOptions(
                buildSelectedOptionsFromIds(
                    aos,
                    selectedAoIds,
                    "Area Officer",
                ),
                headers,
            );

            const selectedVendors = buildSelectedOptionsFromIds(
                vendors,
                selectedVendorIds,
                "Vendor",
            );

            setFormData({
                namaProgram: detail.nama_program || detail.nama || "",
                deskripsi: detail.deskripsi || "",
                nomorMou: detail.nomor_mou || "",
                hargaVendor: cleanNumber(detail.harga_vendor || ""),
                kpiNama: detail.kpi_nama || "",
                kpiTarget: detail.kpi_target || "",
                kpiSatuan: detail.kpi_satuan || "%",
                tahun: String(detail.tahun || new Date().getFullYear()),
                tanggalMulai: detail.tanggal_mulai
                    ? String(detail.tanggal_mulai).split("T")[0]
                    : "",
                statusProgram: detail.status_program || detail.status || "Approval",
                pilarProgram:
                    detail.pilar_program ||
                    detail.pilarProgram ||
                    getDefaultPilar(kategori),

                selectedSekolahs: schools.filter((item) =>
                    selectedSchoolIds.includes(String(item.value)),
                ),
                selectedAOs,
                selectedVendors,

                fileMou: null,
                existingFileName:
                    detail.file_mou ||
                    detail.file_mou_nama ||
                    detail.file_final ||
                    detail.dokumen_mou ||
                    "",
            });

            setFases(normalizeFasesForForm(detail));
        } catch (error) {
            console.error("Gagal memuat data edit program:", error);
            toast.error(error.message || "Gagal memuat data program");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, [id, vendorEndpoint]);

    const selectedWilayahIds = useMemo(() => {
        return [
            ...new Set(
                formData.selectedSekolahs.flatMap((school) =>
                    getWilayahIds(school.raw || school),
                ),
            ),
        ];
    }, [formData.selectedSekolahs]);

    const aoHasWilayahMapping = useMemo(() => {
        return aoOptions.some((ao) => getWilayahIds(ao.raw || ao).length > 0);
    }, [aoOptions]);

    const filteredAoOptions = useMemo(() => {
        if (formData.selectedSekolahs.length === 0) return [];

        if (!aoHasWilayahMapping) {
            return aoOptions;
        }

        if (selectedWilayahIds.length === 0) return [];

        return aoOptions.filter((ao) => {
            const aoWilayahIds = getWilayahIds(ao.raw || ao);

            return aoWilayahIds.some((idWilayah) =>
                selectedWilayahIds.includes(String(idWilayah)),
            );
        });
    }, [aoOptions, selectedWilayahIds, formData.selectedSekolahs, aoHasWilayahMapping]);

    const availableAoOptions = useMemo(() => {
        const merged = [...filteredAoOptions];

        formData.selectedAOs.forEach((selectedAo) => {
            const exists = merged.some((ao) => String(ao.value) === String(selectedAo.value));
            if (!exists) {
                merged.push(selectedAo);
            }
        });

        return merged;
    }, [filteredAoOptions, formData.selectedAOs]);

    useEffect(() => {
        // Halaman edit tidak boleh otomatis menghapus AO yang sudah tersimpan.
        // Kadang endpoint master AO tidak membawa mapping wilayah lengkap,
        // padahal program sudah punya id_pengawas / ao_ids yang valid.
        // User tetap bisa menghapus AO manual lewat chip.
        return;
    }, [filteredAoOptions]);

    const addSelectedItem = (field, options, value) => {
        const selectedItem = options.find(
            (item) => String(item.value) === String(value),
        );

        if (!selectedItem) return;

        const exists = formData[field].some(
            (item) => String(item.value) === String(value),
        );

        if (exists) {
            toast.info("Data sudah dipilih");
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [field]: [...prev[field], selectedItem],
        }));
    };

    const removeSelectedItem = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: prev[field].filter((item) => String(item.value) !== String(value)),
        }));
    };

    const handleMouUpload = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (file.size > 10485760) {
            toast.error("File terlalu besar. Maksimal 10MB");
            return;
        }

        setFormData((prev) => ({
            ...prev,
            fileMou: file,
        }));
    };

    const validateForm = () => {
        if (!formData.namaProgram.trim()) {
            toast.error("Nama program wajib diisi");
            return false;
        }

        const allowedPilarValues = getPilarOptions(kategori).map(
            (item) => item.value,
        );

        if (!formData.pilarProgram) {
            toast.error("Pilar program wajib dipilih");
            return false;
        }

        if (!allowedPilarValues.includes(formData.pilarProgram)) {
            toast.error("Pilar program tidak sesuai dengan kategori program");
            return false;
        }

        if (formData.selectedSekolahs.length === 0) {
            toast.error("Minimal pilih satu sekolah sasaran");
            return false;
        }

        if (formData.selectedAOs.length === 0) {
            toast.error("Minimal pilih satu Area Officer");
            return false;
        }

        if (formData.selectedVendors.length === 0) {
            toast.error("Minimal pilih satu vendor");
            return false;
        }

        for (let faseIndex = 0; faseIndex < fases.length; faseIndex++) {
            const fase = fases[faseIndex];

            if (!String(fase.nama_fase || "").trim()) {
                toast.error(`Nama fase ke-${faseIndex + 1} wajib diisi`);
                return false;
            }

            if (!fase.termin?.length) {
                toast.error(`${fase.nama_fase} harus memiliki minimal satu termin`);
                return false;
            }

            if (!fase.kegiatans?.length) {
                toast.error(`${fase.nama_fase} harus memiliki minimal satu kegiatan`);
                return false;
            }
        }

        return true;
    };

    const saveProgram = async () => {
        if (!validateForm()) return;

        setSaving(true);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const sekolahIds = formData.selectedSekolahs.map((item) => item.value);
            const aoIds = formData.selectedAOs.map((item) => item.realId || item.value);
            const vendorIds = formData.selectedVendors.map((item) => item.realId || item.value);

            const payload = new FormData();

            payload.append("nama_program", formData.namaProgram.trim());
            payload.append("deskripsi", formData.deskripsi || "");
            payload.append("nomor_mou", formData.nomorMou || "");
            payload.append("harga_vendor", cleanNumber(formData.hargaVendor) || "0");

            payload.append("kpi_nama", formData.kpiNama || "");
            payload.append("kpi_target", String(Number(formData.kpiTarget || 0)));
            payload.append("kpi_satuan", formData.kpiSatuan || "%");

            payload.append("kategori", normalizeCategory(kategori));
            payload.append("pilar_program", formData.pilarProgram);
            payload.append("tahun", formData.tahun || "");
            payload.append("tanggal_mulai", formData.tanggalMulai || "");
            payload.append("status_program", formData.statusProgram || "Approval");

            payload.append("id_sekolah", String(sekolahIds[0]));
            payload.append("sekolah_ids", JSON.stringify(sekolahIds));

            payload.append("id_pengawas", String(aoIds[0]));
            payload.append("ao_ids", JSON.stringify(aoIds));

            payload.append("id_vendor", JSON.stringify(vendorIds));
            payload.append("vendor_ids", JSON.stringify(vendorIds));

            if (hoUser.id) {
                payload.append("id_ho", String(hoUser.id));
            }

            payload.append("fases", JSON.stringify(buildPayloadFases(fases)));

            if (formData.fileMou) {
                payload.append("file_mou", formData.fileMou);
            }

            const res = await fetch(`${API_BASE_URL}/program/${id}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: payload,
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data?.message || "Gagal memperbarui program");
            }

            toast.success(successMessage);
            navigate(`${detailPathPrefix}/${id}`);
        } catch (error) {
            console.error("Gagal update program:", error);
            toast.error(error.message || "Gagal update data");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <PageWrapper className="flex h-screen items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-11 w-11 animate-spin rounded-full border-4 border-[#0AC4E0] border-t-transparent" />

                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#0AC4E0]">
                        Memuat data program
                    </p>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper className="flex h-screen overflow-hidden bg-[#EEF5FF] !p-0 font-sans text-slate-800">
            <Sidebar />

            <main className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden">
                <div className="pointer-events-none absolute -right-40 -top-40 h-[430px] w-[430px] rounded-full bg-cyan-200/40 blur-[120px]" />
                <div className="pointer-events-none absolute -left-36 bottom-0 h-[380px] w-[380px] rounded-full bg-sky-100/70 blur-[110px]" />

                <header className="relative z-10 shrink-0 px-7 pt-7">
                    <div className="flex min-h-[96px] items-center justify-between rounded-[2rem] border border-white bg-white/95 px-7 py-5 shadow-[0_22px_70px_rgba(15,23,42,0.10)]">
                        <div className="flex min-w-0 items-center gap-4">
                            <button
                                type="button"
                                onClick={() => navigate(backPath)}
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-slate-500 transition hover:bg-white hover:text-[#0AC4E0]"
                            >
                                <ArrowLeft size={18} />
                            </button>

                            <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                                    Sistem Monitoring Program
                                </p>

                                <h1 className="mt-2 text-[28px] font-black leading-none tracking-[-0.04em] text-slate-900">
                                    Edit{" "}
                                    <span className="bg-gradient-to-r from-[#0AC4E0] to-cyan-600 bg-clip-text text-transparent">
                                        {title}
                                    </span>
                                </h1>
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                            <button
                                type="button"
                                onClick={fetchInitialData}
                                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-slate-400 transition hover:bg-white hover:text-[#0AC4E0]"
                                title="Refresh Data"
                            >
                                <RefreshCw size={16} />
                            </button>

                            <Button
                                text="Kembali Detail"
                                variant="outline"
                                onClick={() => navigate(`${detailPathPrefix}/${id}`)}
                                className="!rounded-2xl !px-5 !py-3 !text-[10px] !font-black !uppercase !tracking-widest"
                            />

                            <Button
                                text={saving ? "Menyimpan..." : "Simpan Perubahan"}
                                icon={
                                    saving ? (
                                        <Loader2 size={15} className="animate-spin" />
                                    ) : (
                                        <Save size={15} />
                                    )
                                }
                                onClick={saveProgram}
                                disabled={saving}
                                className="!rounded-2xl !bg-[#0AC4E0] !px-6 !py-3 !text-[10px] !font-black !uppercase !tracking-widest !text-white shadow-lg shadow-cyan-100 hover:!bg-cyan-500"
                            />
                        </div>
                    </div>
                </header>

                <section className="simple-scroll relative z-10 flex-1 overflow-y-auto px-7 py-6">
                    <div className="w-full max-w-none space-y-5 pb-16">
                        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                            <FormSection
                                icon={<Building2 size={18} />}
                                title="Identitas Program"
                                className="xl:col-span-4"
                            >
                                <FormField label={`Nama ${title}`}>
                                    <Input
                                        value={formData.namaProgram}
                                        onChange={(event) =>
                                            updateForm("namaProgram", event.target.value)
                                        }
                                        placeholder={programPlaceholder}
                                        className="input-clean"
                                    />
                                </FormField>

                                <FormField label="Deskripsi">
                                    <textarea
                                        value={formData.deskripsi}
                                        onChange={(event) =>
                                            updateForm("deskripsi", event.target.value)
                                        }
                                        placeholder="Tuliskan deskripsi program..."
                                        className="h-[118px] w-full resize-none rounded-xl border-none bg-slate-100 px-4 py-3 text-[13px] font-semibold text-slate-700 outline-none transition focus:bg-white focus:ring-4 focus:ring-[#0AC4E0]/10"
                                    />
                                </FormField>

                                <FormField label="Pilar Program">
                                    <div className="grid grid-cols-2 gap-2">
                                        {getPilarOptions(kategori).map((pilar) => (
                                            <button
                                                key={pilar.value}
                                                type="button"
                                                onClick={() =>
                                                    updateForm("pilarProgram", pilar.value)
                                                }
                                                className={`rounded-xl border px-3 py-3 text-[10px] font-black uppercase tracking-widest transition ${formData.pilarProgram === pilar.value
                                                    ? "border-[#0AC4E0] bg-[#0AC4E0]/10 text-[#0AC4E0] shadow-sm"
                                                    : "border-slate-100 bg-slate-50 text-slate-400 hover:border-cyan-100 hover:bg-white"
                                                    }`}
                                            >
                                                {pilar.label}
                                            </button>
                                        ))}
                                    </div>

                                    <p className="mt-2 text-[10px] font-semibold leading-relaxed text-slate-400">
                                        Pilar menjadi penanda program tanpa mengubah kategori utama {normalizeCategory(kategori) === "NON_AKADEMIK" ? "Non Akademik" : "Akademik"}.
                                    </p>
                                </FormField>

                                <FormField label="Sekolah Sasaran">
                                    <Dropdown
                                        items={sekolahOptions}
                                        placeholder="Tambah sekolah sasaran"
                                        onChange={(value) =>
                                            addSelectedItem("selectedSekolahs", sekolahOptions, value)
                                        }
                                    />

                                    <SelectedChips
                                        items={formData.selectedSekolahs}
                                        onRemove={(value) =>
                                            removeSelectedItem("selectedSekolahs", value)
                                        }
                                        variant="cyan"
                                    />
                                </FormField>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField label="Tahun Anggaran">
                                        <Input
                                            value={formData.tahun}
                                            onChange={(event) => updateForm("tahun", event.target.value)}
                                            className="input-clean"
                                        />
                                    </FormField>

                                    <FormField label="Tanggal Mulai">
                                        <Input
                                            type="date"
                                            value={formData.tanggalMulai}
                                            onChange={(event) =>
                                                updateForm("tanggalMulai", event.target.value)
                                            }
                                            className="input-clean"
                                        />
                                    </FormField>
                                </div>
                            </FormSection>

                            <FormSection
                                icon={<FileText size={18} />}
                                title="KPI & Legalitas"
                                className="xl:col-span-4"
                            >
                                <FormField label="Nama KPI">
                                    <Input
                                        value={formData.kpiNama}
                                        onChange={(event) => updateForm("kpiNama", event.target.value)}
                                        placeholder="Contoh: Peningkatan Partisipasi Siswa"
                                        className="input-clean"
                                    />
                                </FormField>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField label="Target KPI">
                                        <Input
                                            type="number"
                                            value={formData.kpiTarget}
                                            onChange={(event) =>
                                                updateForm("kpiTarget", event.target.value)
                                            }
                                            placeholder="80"
                                            className="input-clean"
                                        />
                                    </FormField>

                                    <FormField label="Satuan KPI">
                                        <Input
                                            value={formData.kpiSatuan}
                                            onChange={(event) =>
                                                updateForm("kpiSatuan", event.target.value)
                                            }
                                            placeholder="%"
                                            className="input-clean"
                                        />
                                    </FormField>
                                </div>

                                <FormField label="Nomor MOU">
                                    <Input
                                        value={formData.nomorMou}
                                        onChange={(event) => updateForm("nomorMou", event.target.value)}
                                        placeholder="088/MOU/..."
                                        className="input-clean"
                                    />
                                </FormField>

                                <FormField label="Anggaran Vendor">
                                    <div className="relative">
                                        <DollarSign
                                            size={15}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                        <Input
                                            value={formatRupiah(formData.hargaVendor)}
                                            onChange={(event) =>
                                                updateForm("hargaVendor", cleanNumber(event.target.value))
                                            }
                                            placeholder="Rp 0"
                                            className="input-clean !pl-10"
                                        />
                                    </div>
                                </FormField>
                            </FormSection>

                            <FormSection
                                icon={<UserCheck size={18} />}
                                title="Penanggung Jawab"
                                className="xl:col-span-4"
                            >
                                <FormField label="Head Office">
                                    <div className="rounded-xl border border-slate-100 bg-slate-100 px-4 py-3 text-[13px] font-bold text-slate-500">
                                        {hoUser.nama}
                                    </div>
                                </FormField>

                                <FormField label="Area Officer Berdasarkan Wilayah">
                                    <Dropdown
                                        items={availableAoOptions}
                                        placeholder={
                                            formData.selectedSekolahs.length === 0
                                                ? "Pilih sekolah dulu"
                                                : availableAoOptions.length === 0
                                                    ? "Tidak ada AO di wilayah sekolah"
                                                    : "Tambah AO"
                                        }
                                        onChange={(value) =>
                                            addSelectedItem("selectedAOs", availableAoOptions, value)
                                        }
                                    />

                                    <SelectedChips
                                        items={formData.selectedAOs}
                                        onRemove={(value) => removeSelectedItem("selectedAOs", value)}
                                    />

                                    {formData.selectedSekolahs.length > 0 &&
                                        availableAoOptions.length === 0 && (
                                            <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-[10px] font-bold leading-relaxed text-amber-700">
                                                Belum ada Area Officer yang memiliki wilayah sama dengan
                                                sekolah sasaran.
                                            </p>
                                        )}
                                </FormField>

                                <FormField label={`Vendor ${titleHighlight}`}>
                                    <Dropdown
                                        items={vendorOptions}
                                        placeholder="Tambah vendor"
                                        onChange={(value) =>
                                            addSelectedItem("selectedVendors", vendorOptions, value)
                                        }
                                    />

                                    <SelectedChips
                                        items={formData.selectedVendors}
                                        onRemove={(value) =>
                                            removeSelectedItem("selectedVendors", value)
                                        }
                                        variant="cyan"
                                    />
                                </FormField>

                                <FormField label="Status Program">
                                    <div className="grid grid-cols-2 gap-2">
                                        {PROGRAM_STATUSES.map((status) => (
                                            <button
                                                key={status}
                                                type="button"
                                                onClick={() => updateForm("statusProgram", status)}
                                                className={`rounded-xl border px-3 py-2.5 text-[10px] font-black uppercase tracking-widest transition ${formData.statusProgram === status
                                                    ? STATUS_STYLE[status]
                                                    : "border-slate-100 bg-slate-50 text-slate-400 hover:bg-white"
                                                    }`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </FormField>
                            </FormSection>
                        </div>

                        <FormSection icon={<Calendar size={18} />} title="Dokumen Program">
                            <FileDropzone
                                label="Upload File MOU Baru"
                                fileName={
                                    formData.fileMou?.name ||
                                    formData.existingFileName ||
                                    "Belum ada file"
                                }
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleMouUpload}
                            />
                        </FormSection>

                        <div className="rounded-[2rem] border border-white bg-white/95 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-[#0AC4E0]">
                                    <ShieldCheck size={18} />
                                </div>

                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                        Workflow Program
                                    </p>

                                    <h2 className="text-[18px] font-black tracking-tight text-slate-900">
                                        Fase, Termin, Kegiatan, dan Persyaratan
                                    </h2>
                                </div>
                            </div>

                            <WorkflowBuilder fases={fases} setFases={setFases} />
                        </div>

                        <div className="sticky bottom-0 z-20 flex items-center justify-end gap-3 rounded-[1.5rem] border border-slate-100 bg-white/95 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.10)] backdrop-blur">
                            <Button
                                text="Batal"
                                variant="outline"
                                onClick={() => navigate(`${detailPathPrefix}/${id}`)}
                                className="!rounded-xl !px-5 !py-2.5 !text-xs !font-bold"
                            />

                            <Button
                                text={saving ? "Menyimpan..." : "Simpan Perubahan"}
                                icon={
                                    saving ? (
                                        <Loader2 size={15} className="animate-spin" />
                                    ) : (
                                        <Save size={15} />
                                    )
                                }
                                onClick={saveProgram}
                                disabled={saving}
                                className="!rounded-xl !bg-[#0AC4E0] !px-6 !py-2.5 !text-xs !font-bold !text-white hover:!bg-cyan-500"
                            />
                        </div>
                    </div>
                </section>
            </main>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
            .simple-scroll::-webkit-scrollbar {
              width: 6px;
            }

            .simple-scroll::-webkit-scrollbar-track {
              background: transparent;
            }

            .simple-scroll::-webkit-scrollbar-thumb {
              background: #CBD5E1;
              border-radius: 999px;
            }

            .input-clean {
              border: none !important;
              border-radius: 0.85rem !important;
              background: #F1F5F9 !important;
              padding: 0.82rem 0.95rem !important;
              font-size: 13px !important;
              font-weight: 600 !important;
            }

            .input-clean:focus {
              background: white !important;
              box-shadow: 0 0 0 3px rgba(10, 196, 224, 0.14) !important;
            }
          `,
                }}
            />
        </PageWrapper>
    );
}

export default EditProgramForm;
