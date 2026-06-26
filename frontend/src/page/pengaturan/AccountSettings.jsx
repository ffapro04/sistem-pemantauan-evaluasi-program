/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { Camera, Loader2, Pencil, Save, X } from "lucide-react";

import Sidebar from "../../components/Sidebar";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { useUiAutoTranslate } from "../../i18n/localUiTranslator";

const API_BASE_URL = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    ""
).replace(/\/$/, "");

const ROLE_LABELS = {
    1: "Admin",
    2: "Pengurus",
    3: "Head Office",
    4: "Area Officer",
    5: "Sekolah",
    6: "Vendor",
    7: "Kepala Dinas",
    8: "Guru Assessment",
    9: "Operator Sekolah",
    10: "Kepala Sekolah",
};

const ROLE_IDS = {
    ADMIN: 1,
    PENGURUS: 2,
    HO: 3,
    AO: 4,
    SEKOLAH: 5,
    VENDOR: 6,
    KEPALA_DINAS: 7,
    GURU_ASSESSMENT: 8,
    OPERATOR_SEKOLAH: 9,
    KEPALA_SEKOLAH: 10,
};

const PENGURUS_POSITION_ORDER = {
    "ketua pengurus": 1,
    sekretaris: 2,
    bendahara: 3,
    "anggota pengurus": 4,
};

function normalizeArray(payload) {
    if (Array.isArray(payload)) return payload;

    const keys = [
        "data",
        "items",
        "result",
        "results",
        "rows",
        "users",
        "records",
        "content",
    ];

    for (const key of keys) {
        if (Array.isArray(payload?.[key])) return payload[key];
    }

    return [];
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

function getAssetUrl(value, fallbackFolder = "") {
    if (!value) return "";

    const raw = String(value || "").trim();
    if (!raw) return "";

    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    if (raw.startsWith("blob:") || raw.startsWith("data:")) return raw;
    if (raw.startsWith("/")) return `${API_BASE_URL}${raw}`;
    if (raw.startsWith("uploads/")) return `${API_BASE_URL}/${raw}`;

    if (fallbackFolder) {
        return `${API_BASE_URL}/uploads/${fallbackFolder}/${raw}`;
    }

    return `${API_BASE_URL}/${raw}`;
}

function getAvatarUrl(user = {}) {
    if (user?.foto_profile) return getAssetUrl(user.foto_profile, "users");
    if (user?.logo_url) return getAssetUrl(user.logo_url);
    return "";
}

function getInitial(value) {
    return String(value || "U").trim().charAt(0).toUpperCase();
}

function titleCase(value) {
    return String(value || "")
        .trim()
        .replaceAll("_", " ")
        .replaceAll("-", " ")
        .replace(/\s+/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalKey(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replaceAll("_", " ")
        .replaceAll("-", " ")
        .replace(/\s+/g, " ");
}

function getRoleId(user = {}) {
    return Number(user?.id_role || user?.role_id || user?.role?.id_role || 0);
}

function safeText(value, fallback = "-") {
    if (value === null || value === undefined || value === "") return fallback;

    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }

    if (typeof value === "object") {
        return (
            value.nama_role ||
            value.nama ||
            value.label ||
            value.name ||
            value.deskripsi ||
            fallback
        );
    }

    return fallback;
}

function getRoleLabel(user = {}) {
    const roleId = getRoleId(user);

    return safeText(
        ROLE_LABELS[roleId] ||
        user?.role?.nama_role ||
        user?.nama_role ||
        user?.role,
        "User",
    );
}

function getUserId(user = {}) {
    return user?.id_user || user?.sub || user?.id || user?.user_id || null;
}

function getUserName(user = {}) {
    return safeText(user?.nama || user?.name || user?.username || user?.nama_lengkap, "User");
}

function getUserEmail(user = {}) {
    return safeText(user?.email || user?.email_login || user?.email_user, "-");
}

function getJabatan(user = {}) {
    return safeText(
        user?.jabatan || user?.position || user?.nama_jabatan || getRoleLabel(user),
        getRoleLabel(user),
    );
}

function getJenis(user = {}) {
    return safeText(user?.jenis || user?.type || user?.kategori || "", "");
}

function getSubJenis(user = {}) {
    return safeText(
        user?.sub_jenis ||
        user?.subJenis ||
        user?.subjenis ||
        user?.bidang_fokus ||
        user?.bidangFokus ||
        user?.fokus_bidang ||
        user?.fokusBidang ||
        user?.pilar_program ||
        user?.pilarProgram ||
        "",
        "",
    );
}

function getJenisLabel(user = {}) {
    if (getRoleId(user) === ROLE_IDS.KEPALA_SEKOLAH) return "Akun Sekolah";

    const value = getJenis(user);
    return value ? titleCase(value) : "Jenis belum ditentukan";
}

function getSubJenisLabel(user = {}) {
    if (getRoleId(user) === ROLE_IDS.KEPALA_SEKOLAH) {
        return safeText(
            user?.sekolah?.nama_sekolah ||
            user?.school?.nama_sekolah ||
            user?.nama_sekolah ||
            "Kepala Sekolah",
            "Kepala Sekolah",
        );
    }

    const value = getSubJenis(user);
    return value ? titleCase(value) : "Sub jenis belum ditentukan";
}

function getJenisKey(user = {}) {
    return normalKey(getJenis(user));
}

function getSubJenisKey(user = {}) {
    return normalKey(getSubJenis(user));
}

function getJabatanKey(user = {}) {
    return normalKey(getJabatan(user));
}

function isActiveUser(user = {}) {
    const value = user?.status;
    if (value === undefined || value === null || value === "") return true;

    const normalized = String(value).trim().toLowerCase();
    return (
        value === true ||
        Number(value) === 1 ||
        normalized === "true" ||
        normalized === "aktif" ||
        normalized === "active"
    );
}

function formatDateTime(value) {
    if (!value) return "-";

    try {
        return new Date(value).toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    } catch {
        return "-";
    }
}

function getRelationPanelType(user = {}) {
    const roleId = getRoleId(user);

    if (roleId === ROLE_IDS.PENGURUS || roleId === ROLE_IDS.HO) return "team";
    if (roleId === ROLE_IDS.AO) return "wilayah";

    return null;
}

function getPengurusPositionKey(user = {}) {
    const key = getJabatanKey(user);

    if (key.includes("ketua")) return "ketua pengurus";
    if (key.includes("sekretaris")) return "sekretaris";
    if (key.includes("bendahara")) return "bendahara";
    if (key.includes("anggota")) return "anggota pengurus";

    return "";
}

function getHoFocusKey(user = {}) {
    const combined = normalKey(
        [getJenis(user), getSubJenis(user), getJabatan(user), user?.bidang, user?.kategori]
            .filter(Boolean)
            .join(" "),
    );

    if (!combined) return "";

    if (combined.includes("non akademik")) {
        if (combined.includes("seni")) return "non-akademik-seni-budaya";
        if (combined.includes("kecakapan")) return "non-akademik-kecakapan-hidup";
        return "non-akademik";
    }

    if (combined.includes("smk")) return "akademik-smk";
    if (combined.includes("sd") || combined.includes("smp")) return "akademik-sd-smp";
    if (combined.includes("akademik")) return "akademik";

    return getSubJenisKey(user) || getJenisKey(user) || getJabatanKey(user);
}

function getHoFocusLabel(user = {}) {
    const focusKey = getHoFocusKey(user);

    const labels = {
        "akademik-smk": "HO Akademik SMK",
        "akademik-sd-smp": "HO Akademik SD/SMP",
        akademik: "HO Akademik",
        "non-akademik-seni-budaya": "HO Seni Budaya",
        "non-akademik-kecakapan-hidup": "HO Kecakapan Hidup",
        "non-akademik": "HO Non Akademik",
    };

    return labels[focusKey] || "Fokus HO";
}

function getTeamRelation(currentUser = {}, targetUser = {}) {
    const currentRole = getRoleId(currentUser);
    const targetRole = getRoleId(targetUser);

    if (!currentRole || !targetRole || currentRole !== targetRole) return null;

    if (currentRole === ROLE_IDS.PENGURUS) {
        const positionKey = getPengurusPositionKey(targetUser);
        return positionKey ? titleCase(positionKey) : null;
    }

    if (currentRole === ROLE_IDS.HO) {
        const currentFocus = getHoFocusKey(currentUser);
        const targetFocus = getHoFocusKey(targetUser);

        if (!currentFocus || !targetFocus || currentFocus !== targetFocus) return null;
        return getHoFocusLabel(targetUser);
    }

    return null;
}

function sortTeamMembers(currentId = "") {
    return (a, b) => {
        const aCurrent = String(getUserId(a.user) || "") === currentId ? -1 : 0;
        const bCurrent = String(getUserId(b.user) || "") === currentId ? -1 : 0;
        if (aCurrent !== bCurrent) return aCurrent - bCurrent;

        const aRole = getRoleId(a.user);
        const bRole = getRoleId(b.user);

        if (aRole === ROLE_IDS.PENGURUS || bRole === ROLE_IDS.PENGURUS) {
            const aPriority = PENGURUS_POSITION_ORDER[getPengurusPositionKey(a.user)] || 99;
            const bPriority = PENGURUS_POSITION_ORDER[getPengurusPositionKey(b.user)] || 99;
            if (aPriority !== bPriority) return aPriority - bPriority;
        }

        return getUserName(a.user).localeCompare(getUserName(b.user));
    };
}

function normalizeWilayahItem(value = {}) {
    if (!value) return null;

    if (typeof value === "string") {
        const name = value.trim();
        return name ? { name, detail: "Wilayah terhubung" } : null;
    }

    const name =
        value?.nama_wilayah ||
        value?.namaWilayah ||
        value?.wilayah ||
        value?.nama_provinsi ||
        value?.provinsi ||
        value?.nama_kabupaten ||
        value?.kabupaten ||
        value?.name ||
        "";

    const detail = [
        value?.kode_wilayah || value?.kodeWilayah,
        value?.nama_provinsi || value?.provinsi,
        value?.nama_kabupaten || value?.kabupaten,
    ]
        .filter(Boolean)
        .join(" · ");

    if (!String(name).trim()) return null;

    return {
        name: String(name).trim(),
        detail: detail || "Wilayah terhubung",
    };
}

function getAoWilayahItems(user = {}) {
    const rawCollections = [
        user?.wilayahs,
        user?.wilayah_list,
        user?.wilayahList,
        user?.areas,
        user?.area_list,
        user?.areaList,
    ];

    const fromCollections = rawCollections
        .flatMap((item) => (Array.isArray(item) ? item : []))
        .map(normalizeWilayahItem)
        .filter(Boolean);

    const directItems = [
        user?.wilayah,
        user?.area,
        user?.region,
        {
            nama_wilayah: user?.nama_wilayah,
            kode_wilayah: user?.kode_wilayah,
            nama_provinsi: user?.nama_provinsi,
            nama_kabupaten: user?.nama_kabupaten,
        },
    ]
        .map(normalizeWilayahItem)
        .filter(Boolean);

    const seen = new Set();

    return [...fromCollections, ...directItems].filter((item) => {
        const key = normalKey(`${item.name} ${item.detail}`);
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function getRelationPanelMeta(user = {}) {
    const panelType = getRelationPanelType(user);

    if (panelType === "wilayah") {
        return {
            title: "Wilayah",
            desc: "Wilayah binaan yang sudah diatur untuk akun Area Officer ini.",
            countLabel: "Wilayah",
            loadingLabel: "Memuat wilayah terkait",
            emptyTitle: "Belum ada wilayah terkait.",
            emptyDesc: "Pastikan data wilayah Area Officer sudah diatur dari master user.",
        };
    }

    return {
        title: "Teams",
        desc: getRoleId(user) === ROLE_IDS.PENGURUS
            ? "Menampilkan struktur pengurus: ketua, sekretaris, bendahara, dan anggota pengurus."
            : "Menampilkan Head Office dengan fokus bidang yang sama.",
        countLabel: "User",
        loadingLabel: "Memuat team terkait",
        emptyTitle: "Belum ada user terkait.",
        emptyDesc: getRoleId(user) === ROLE_IDS.PENGURUS
            ? "Pastikan jabatan pengurus sudah diisi sebagai ketua, sekretaris, bendahara, atau anggota pengurus."
            : "Pastikan jenis dan sub jenis Head Office sudah terisi konsisten.",
    };
}

function CyanWave() {
    return (
        <div className="pointer-events-none absolute inset-x-0 bottom-[-1px]">
            <svg
                viewBox="0 0 1440 145"
                xmlns="http://www.w3.org/2000/svg"
                className="block h-[76px] w-full"
                preserveAspectRatio="none"
            >
                <path
                    d="M0 52C160 97 300 105 470 72C655 36 812 20 1000 55C1175 88 1297 103 1440 70V145H0V52Z"
                    fill="#ffffff"
                    opacity="0.32"
                />
                <path
                    d="M0 77C170 116 330 111 505 88C710 60 865 62 1042 88C1210 112 1325 114 1440 92V145H0V77Z"
                    fill="#ffffff"
                    opacity="0.62"
                />
                <path
                    d="M0 104C185 133 342 129 526 109C730 88 902 91 1090 110C1250 126 1354 122 1440 107V145H0V104Z"
                    fill="#ffffff"
                />
            </svg>
        </div>
    );
}

function HeroDecor() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-44 -top-44 h-[390px] w-[390px] rounded-full bg-white/12" />
            <div className="absolute right-[-160px] top-[-220px] h-[540px] w-[540px] rounded-full bg-white/10" />
            <div className="absolute bottom-[72px] left-[-10%] h-[2px] w-[120%] rotate-[3deg] bg-white/24" />
            <div className="absolute bottom-[104px] left-0 h-[2px] w-[120%] -rotate-[2deg] bg-white/32" />
        </div>
    );
}

function Field({ label, value, type = "text", disabled = false }) {
    return (
        <div className="min-w-0">
            <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-[#7FA4AB]">
                {label}
            </label>
            <div
                className={`flex h-11 min-w-0 items-center rounded-[1.05rem] border px-4 text-[13px] font-bold ${disabled
                    ? "border-[#DFF8FC] bg-[#F7FDFF] text-[#7FA4AB]"
                    : "border-[#DFF8FC] bg-white text-[#103F49]"
                    }`}
            >
                <span className="min-w-0 truncate">
                    {type === "password" ? "********" : value || "-"}
                </span>
            </div>
        </div>
    );
}

function InputField({
    label,
    value,
    onChange,
    type = "text",
    disabled = false,
    placeholder = "",
    autoComplete = "off",
}) {
    return (
        <div className="min-w-0">
            <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-[#7FA4AB]">
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                disabled={disabled}
                placeholder={placeholder}
                autoComplete={autoComplete}
                className={`h-11 w-full rounded-[1.05rem] border px-4 text-[13px] font-bold outline-none transition ${disabled
                    ? "cursor-not-allowed border-[#DFF8FC] bg-[#F7FDFF] text-[#7FA4AB]"
                    : "border-[#DFF8FC] bg-white text-[#103F49] focus:border-[#0AC4E0] focus:ring-4 focus:ring-[#0AC4E0]/10"
                    }`}
            />
        </div>
    );
}

function SectionTitle({ children, desc }) {
    return (
        <div className="mb-4">
            <h2 className="text-[23px] font-black leading-tight tracking-[-0.055em] text-[#103F49]">
                {children}
            </h2>
            {desc && (
                <p className="mt-1 max-w-2xl text-[13px] font-semibold leading-6 text-[#5F7E86]">
                    {desc}
                </p>
            )}
        </div>
    );
}

function Avatar({ user, name, size = "md", rounded = "rounded-full" }) {
    const [imageError, setImageError] = useState(false);
    const avatarUrl = getAvatarUrl(user);

    const sizeClass =
        size === "lg"
            ? "h-[128px] w-[128px] text-[50px]"
            : "h-10 w-10 text-sm";

    return (
        <div
            className={`relative flex ${sizeClass} shrink-0 items-center justify-center overflow-hidden ${rounded} bg-[#E9FBFF] font-black text-[#078EA3]`}
        >
            {avatarUrl && !imageError ? (
                <img
                    src={avatarUrl}
                    alt={name || "Foto profil"}
                    className="h-full w-full object-cover"
                    onError={() => setImageError(true)}
                />
            ) : (
                getInitial(name)
            )}
        </div>
    );
}

function TeamMemberRow({ member, current = false, relation = "" }) {
    const name = getUserName(member);
    const jabatan = getJabatan(member);
    const email = getUserEmail(member);
    const jenis = getJenisLabel(member);
    const subJenis = getSubJenisLabel(member);

    return (
        <div className="flex items-center gap-3 rounded-[1.15rem] border border-[#0AC4E0]/12 bg-white px-3.5 py-3 transition hover:border-[#0AC4E0]/25 hover:bg-[#F7FDFF]">
            <Avatar user={member} name={name} />

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <p className="truncate text-[13px] font-black text-[#103F49]">{name}</p>
                    {current && (
                        <span className="shrink-0 rounded-full bg-[#0AC4E0] px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-white">
                            Anda
                        </span>
                    )}
                </div>
                <p className="mt-0.5 truncate text-[11px] font-bold text-[#5F7E86]">
                    {jabatan}
                </p>
                <p className="mt-0.5 truncate text-[10px] font-semibold text-[#7FA4AB]">
                    {jenis} · {subJenis} · {email}
                </p>
            </div>

            {relation && (
                <span className="shrink-0 rounded-full border border-[#0AC4E0]/18 bg-[#F6FDFF] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-[#078EA3]">
                    {relation}
                </span>
            )}
        </div>
    );
}

function AccountSettings() {
    useUiAutoTranslate();

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingDrive, setLoadingDrive] = useState(true);
    const [loadingTeam, setLoadingTeam] = useState(true);
    const [connecting, setConnecting] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState("");
    const [profileForm, setProfileForm] = useState({
        nama: "",
        email: "",
        password: "",
        password_confirmation: "",
    });
    const photoInputRef = useRef(null);

    const token = useMemo(() => localStorage.getItem("token"), []);
    const tokenUser = useMemo(() => getTokenPayload() || {}, []);
    const [profile, setProfile] = useState(tokenUser);
    const [teamMembers, setTeamMembers] = useState([]);

    const [driveStatus, setDriveStatus] = useState({
        connected: false,
        google_email: null,
        google_name: null,
        owner_type: null,
        connected_at: null,
    });

    const authHeaders = useMemo(
        () => ({ Authorization: `Bearer ${token}` }),
        [token],
    );

    const checkAuth = useCallback(() => {
        if (!token) {
            toast.error("Sesi login tidak ditemukan. Silakan login ulang.");
            navigate("/login");
            return false;
        }

        return true;
    }, [navigate, token]);

    const buildProfileForm = useCallback((user = {}) => {
        const email = getUserEmail(user);

        return {
            nama: getUserName(user) === "User" ? "" : getUserName(user),
            email: email === "-" ? "" : email,
            password: "",
            password_confirmation: "",
        };
    }, []);

    const clearPhotoPreview = useCallback(() => {
        setSelectedPhotoFile(null);
        setPhotoPreviewUrl((previous) => {
            if (previous) URL.revokeObjectURL(previous);
            return "";
        });
    }, []);

    const resetProfileForm = useCallback((user = profile) => {
        setProfileForm(buildProfileForm(user));
        clearPhotoPreview();
    }, [buildProfileForm, clearPhotoPreview, profile]);

    useEffect(() => {
        if (!isEditingProfile) {
            setProfileForm(buildProfileForm(profile));
        }
    }, [buildProfileForm, isEditingProfile, profile]);

    useEffect(() => {
        return () => {
            if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
        };
    }, [photoPreviewUrl]);

    const loadTeamMembers = useCallback(
        async (effectiveProfile) => {
            if (!checkAuth()) return;

            const relationPanelType = getRelationPanelType(effectiveProfile);

            if (relationPanelType !== "team") {
                setTeamMembers([]);
                setLoadingTeam(false);
                return;
            }

            setLoadingTeam(true);

            try {
                const response = await fetch(`${API_BASE_URL}/users`, {
                    method: "GET",
                    headers: authHeaders,
                });

                const payload = await response.json().catch(() => ({}));
                const users = normalizeArray(payload);

                if (!response.ok || users.length === 0) {
                    setTeamMembers([]);
                    return;
                }

                const currentId = String(getUserId(effectiveProfile) || "");
                const currentFromUsers =
                    users.find((user) => String(getUserId(user) || "") === currentId) || null;

                const finalProfile = {
                    ...effectiveProfile,
                    ...(currentFromUsers || {}),
                };

                if (currentFromUsers) {
                    setProfile((previous) => ({
                        ...previous,
                        ...currentFromUsers,
                    }));
                }

                const relatedUsers = users
                    .filter((user) => isActiveUser(user))
                    .map((user) => ({
                        user,
                        relation: getTeamRelation(finalProfile, user),
                    }))
                    .filter((item) => item.relation)
                    .sort(sortTeamMembers(currentId));

                setTeamMembers(relatedUsers);
            } catch {
                setTeamMembers([]);
            } finally {
                setLoadingTeam(false);
            }
        },
        [authHeaders, checkAuth],
    );

    const fetchProfile = useCallback(async () => {
        if (!checkAuth()) return;

        const idUser = getUserId(tokenUser);
        if (!idUser) {
            setLoadingProfile(false);
            await loadTeamMembers(tokenUser);
            return;
        }

        setLoadingProfile(true);

        let effectiveProfile = tokenUser;

        try {
            const response = await fetch(`${API_BASE_URL}/users/${idUser}`, {
                method: "GET",
                headers: authHeaders,
            });

            const payload = await response.json().catch(() => ({}));

            if (response.ok) {
                effectiveProfile = {
                    ...tokenUser,
                    ...(payload?.data || payload || {}),
                };
            }

            setProfile(effectiveProfile);
        } catch {
            setProfile(tokenUser);
            effectiveProfile = tokenUser;
        } finally {
            setLoadingProfile(false);
            await loadTeamMembers(effectiveProfile);
        }
    }, [authHeaders, checkAuth, loadTeamMembers, tokenUser]);

    const fetchDriveStatus = useCallback(
        async ({ silent = false } = {}) => {
            if (!checkAuth()) return;

            if (!silent) setLoadingDrive(true);

            try {
                const response = await fetch(`${API_BASE_URL}/google-drive/status`, {
                    method: "GET",
                    headers: authHeaders,
                });

                const payload = await response.json().catch(() => ({}));

                if (!response.ok) {
                    throw new Error(
                        payload?.message || "Gagal memuat status penyimpanan dokumen.",
                    );
                }

                setDriveStatus(payload);
            } catch (error) {
                toast.error(error.message || "Gagal memuat status penyimpanan dokumen.");
            } finally {
                if (!silent) setLoadingDrive(false);
            }
        },
        [authHeaders, checkAuth],
    );

    useEffect(() => {
        fetchProfile();
        fetchDriveStatus();

        const driveParam = searchParams.get("drive") || searchParams.get("googleDrive");
        if (driveParam === "connected") {
            toast.success("Penyimpanan dokumen berhasil ditautkan.");
            setSearchParams({});
        }
    }, [fetchProfile, fetchDriveStatus, searchParams, setSearchParams]);

    const handleConnectDrive = async () => {
        if (!checkAuth()) return;

        setConnecting(true);

        try {
            const redirectTo = "/pengaturan-akun?drive=connected";
            const response = await fetch(
                `${API_BASE_URL}/google-drive/auth-url?redirectTo=${encodeURIComponent(redirectTo)}`,
                {
                    method: "GET",
                    headers: authHeaders,
                },
            );

            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    payload?.message || "Gagal membuat tautan perizinan dokumen.",
                );
            }

            if (!payload?.url) {
                throw new Error("URL perizinan Google tidak ditemukan dari backend.");
            }

            window.location.href = payload.url;
        } catch (error) {
            toast.error(error.message || "Gagal menautkan penyimpanan dokumen.");
            setConnecting(false);
        }
    };

    const handleDisconnectDrive = async () => {
        if (!checkAuth()) return;

        const confirmed = window.confirm(
            "Putuskan tautan penyimpanan dokumen dari akun ini?",
        );

        if (!confirmed) return;

        setDisconnecting(true);

        try {
            const response = await fetch(`${API_BASE_URL}/google-drive/disconnect`, {
                method: "POST",
                headers: authHeaders,
            });

            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    payload?.message || "Gagal memutus tautan penyimpanan dokumen.",
                );
            }

            toast.success(
                payload?.message || "Tautan penyimpanan dokumen berhasil diputuskan.",
            );
            await fetchDriveStatus({ silent: true });
        } catch (error) {
            toast.error(error.message || "Gagal memutus tautan penyimpanan dokumen.");
        } finally {
            setDisconnecting(false);
        }
    };

    const handlePhotoButtonClick = () => {
        if (savingProfile || uploadingPhoto || loadingProfile) return;

        if (!isEditingProfile) {
            setIsEditingProfile(true);
            setProfileForm(buildProfileForm(profile));
        }

        photoInputRef.current?.click();
    };

    const handlePhotoChange = (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) return;

        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Foto profil harus berupa JPG, JPEG, PNG, atau WEBP.");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error("Ukuran foto profil maksimal 2MB.");
            return;
        }

        const previewUrl = URL.createObjectURL(file);

        setSelectedPhotoFile(file);
        setPhotoPreviewUrl((previous) => {
            if (previous) URL.revokeObjectURL(previous);
            return previewUrl;
        });

        if (!isEditingProfile) {
            setIsEditingProfile(true);
            setProfileForm(buildProfileForm(profile));
        }
    };

    const handleEditProfile = () => {
        setIsEditingProfile(true);
        setProfileForm(buildProfileForm(profile));
    };

    const handleCancelProfile = () => {
        setIsEditingProfile(false);
        resetProfileForm(profile);
    };

    const handleProfileInputChange = (field) => (event) => {
        const value = event.target.value;
        setProfileForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const handleSaveProfile = async () => {
        if (!checkAuth()) return;

        const nama = profileForm.nama.trim();
        const email = profileForm.email.trim().toLowerCase();
        const password = profileForm.password.trim();
        const passwordConfirmation = profileForm.password_confirmation.trim();

        if (!nama) {
            toast.error("Nama tidak boleh kosong.");
            return;
        }

        if (!email) {
            toast.error("Email tidak boleh kosong.");
            return;
        }

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            toast.error("Format email tidak valid.");
            return;
        }

        if (password || passwordConfirmation) {
            if (password.length < 6) {
                toast.error("Password baru minimal 6 karakter.");
                return;
            }

            if (password !== passwordConfirmation) {
                toast.error("Konfirmasi password tidak sama.");
                return;
            }
        }

        const currentName = getUserName(profile);
        const currentEmail = getUserEmail(profile);
        const formData = new FormData();
        let hasChanges = false;

        if (nama !== currentName) {
            formData.append("nama", nama);
            hasChanges = true;
        }

        if (email !== String(currentEmail || "").trim().toLowerCase()) {
            formData.append("email", email);
            hasChanges = true;
        }

        if (password) {
            formData.append("password", password);
            hasChanges = true;
        }

        if (selectedPhotoFile) {
            formData.append("foto_profile_file", selectedPhotoFile);
            hasChanges = true;
        }

        if (!hasChanges) {
            toast.info("Tidak ada perubahan profil yang perlu disimpan.");
            return;
        }

        setSavingProfile(true);

        try {
            const response = await fetch(`${API_BASE_URL}/users/me/profile`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(payload?.message || "Gagal menyimpan perubahan profil.");
            }

            const updatedUser = payload?.data || payload;

            setProfile((previous) => ({
                ...previous,
                ...updatedUser,
            }));

            setIsEditingProfile(false);
            clearPhotoPreview();
            setProfileForm(buildProfileForm(updatedUser));

            await loadTeamMembers({
                ...profile,
                ...updatedUser,
            });

            window.dispatchEvent(new Event("user-profile-updated"));
            window.dispatchEvent(new Event("agenda-notification-refresh"));

            toast.success("Perubahan profil berhasil disimpan.");
        } catch (error) {
            toast.error(error.message || "Gagal menyimpan perubahan profil.");
        } finally {
            setSavingProfile(false);
        }
    };

    const displayName = getUserName(profile);
    const displayEmail = getUserEmail(profile);
    const roleLabel = getRoleLabel(profile);
    const jabatan = getJabatan(profile);
    const jenisLabel = getJenisLabel(profile);
    const subJenisLabel = getSubJenisLabel(profile);
    const connected = Boolean(driveStatus.connected);
    const connectedAtLabel = formatDateTime(driveStatus?.connected_at);
    const relationPanelType = getRelationPanelType(profile);
    const relationPanelMeta = getRelationPanelMeta(profile);
    const showRelationPanel = Boolean(relationPanelType);
    const aoWilayahItems = getAoWilayahItems(profile);
    const visibleTeamMembers = teamMembers.slice(0, 4);
    const hiddenTeamCount = Math.max(teamMembers.length - visibleTeamMembers.length, 0);

    return (
        <div className="flex h-screen overflow-hidden bg-[#F7FDFF] font-sans text-[#103F49] selection:bg-cyan-400 selection:text-white">
            <Sidebar />

            <main className="h-screen min-w-0 flex-1 overflow-hidden px-8 py-7">
                <div className="grid h-full grid-cols-[1.55fr_0.72fr] gap-7">
                    <div className="min-h-0">
                        <div className="relative h-full overflow-hidden rounded-[2rem] border border-[#DFF8FC] bg-white shadow-[0_30px_90px_rgba(10,196,224,0.14)]">
                            <div className="relative h-[128px] overflow-hidden bg-[#0AC4E0]">
                                <HeroDecor />
                                <CyanWave />
                            </div>

                            <div className="px-8 pb-7">
                                <div className="-mt-[46px] flex items-start justify-between gap-6">
                                    <div className="flex min-w-0 items-start gap-6">
                                        <div className="relative shrink-0">
                                            <div className="flex h-[128px] w-[128px] items-center justify-center overflow-hidden rounded-[2rem] border-[7px] border-white bg-[#E9FBFF] text-[50px] font-black text-[#078EA3] shadow-[0_22px_60px_rgba(10,196,224,0.20)]">
                                                {loadingProfile ? (
                                                    <Loader2 size={32} className="animate-spin text-[#0AC4E0]" />
                                                ) : (
                                                    <Avatar
                                                        user={photoPreviewUrl ? { ...profile, foto_profile: photoPreviewUrl } : profile}
                                                        name={displayName}
                                                        size="lg"
                                                        rounded="rounded-[1.55rem]"
                                                    />
                                                )}
                                            </div>

                                            <input
                                                ref={photoInputRef}
                                                type="file"
                                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                                className="hidden"
                                                onChange={handlePhotoChange}
                                            />

                                            <button
                                                type="button"
                                                onClick={handlePhotoButtonClick}
                                                disabled={uploadingPhoto || loadingProfile}
                                                className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-[0.9rem] border-4 border-white bg-[#103F49] text-white shadow-lg transition hover:bg-[#0AC4E0] disabled:cursor-not-allowed disabled:opacity-70"
                                                title="Ganti foto profil"
                                            >
                                                {uploadingPhoto ? (
                                                    <Loader2 size={14} className="animate-spin" />
                                                ) : (
                                                    <Camera size={14} />
                                                )}
                                            </button>
                                        </div>

                                        <div className="min-w-0 pt-[62px]">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h2 className="truncate text-[40px] font-black leading-none tracking-[-0.07em] text-[#103F49]">
                                                    {displayName}
                                                </h2>

                                                <span className="rounded-full border border-[#0AC4E0]/20 bg-[#E9FBFF] px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#078EA3]">
                                                    {roleLabel}
                                                </span>
                                            </div>

                                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                                <span className="rounded-full border border-[#DFF8FC] bg-white px-4 py-2 text-[12px] font-black text-[#5F7E86] shadow-[0_10px_30px_rgba(10,196,224,0.06)]">
                                                    {displayEmail}
                                                </span>
                                                <span className="rounded-full border border-[#0AC4E0]/20 bg-[#F6FDFF] px-4 py-2 text-[12px] font-black text-[#078EA3] shadow-[0_10px_30px_rgba(10,196,224,0.06)]">
                                                    {jabatan}
                                                </span>
                                                <span className="rounded-full border border-[#0AC4E0]/20 bg-white px-4 py-2 text-[12px] font-black text-[#078EA3] shadow-[0_10px_30px_rgba(10,196,224,0.06)]">
                                                    {jenisLabel} · {subJenisLabel}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-[74px] flex shrink-0 items-center gap-3">
                                        <LanguageSwitcher compact />

                                        <button
                                            type="button"
                                            onClick={isEditingProfile ? handleCancelProfile : handleEditProfile}
                                            disabled={savingProfile || loadingProfile}
                                            className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-7 text-[12px] font-black uppercase tracking-[0.16em] text-white shadow-[0_16px_45px_rgba(10,196,224,0.24)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 ${isEditingProfile ? "bg-slate-500 hover:bg-slate-600" : "bg-[#0AC4E0] hover:bg-[#08B7D1]"}`}
                                        >
                                            {isEditingProfile ? <X size={14} /> : <Pencil size={14} />}
                                            {isEditingProfile ? "Batal" : "Edit Profil"}
                                        </button>
                                    </div>
                                </div>

                                <div className={`mt-6 grid gap-7 ${showRelationPanel ? "grid-cols-[1fr_0.92fr]" : "grid-cols-1"}`}>
                                    <div className="rounded-[1.7rem] border border-[#DFF8FC] bg-white shadow-[0_18px_55px_rgba(10,196,224,0.07)]">
                                        <div className="border-b border-[#DFF8FC] px-6 py-4">
                                            <SectionTitle desc="Nama, email, dan password login sistem dikelola dari panel ini.">
                                                Informasi Login
                                            </SectionTitle>
                                        </div>

                                        <div className="space-y-4 px-6 py-5">
                                            <div className="grid grid-cols-2 gap-4">
                                                <InputField
                                                    label="Nama"
                                                    value={profileForm.nama}
                                                    onChange={handleProfileInputChange("nama")}
                                                    disabled={!isEditingProfile || savingProfile}
                                                    placeholder="Masukkan nama"
                                                    autoComplete="name"
                                                />
                                                <InputField
                                                    label="Email"
                                                    type="email"
                                                    value={profileForm.email}
                                                    onChange={handleProfileInputChange("email")}
                                                    disabled={!isEditingProfile || savingProfile}
                                                    placeholder="nama@gmail.com"
                                                    autoComplete="email"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <InputField
                                                    label="Password Baru"
                                                    type="password"
                                                    value={profileForm.password}
                                                    onChange={handleProfileInputChange("password")}
                                                    disabled={!isEditingProfile || savingProfile}
                                                    placeholder="Kosongkan jika tidak diganti"
                                                    autoComplete="new-password"
                                                />
                                                <InputField
                                                    label="Konfirmasi Password"
                                                    type="password"
                                                    value={profileForm.password_confirmation}
                                                    onChange={handleProfileInputChange("password_confirmation")}
                                                    disabled={!isEditingProfile || savingProfile}
                                                    placeholder="Ulangi password baru"
                                                    autoComplete="new-password"
                                                />
                                            </div>

                                            <div className="rounded-[1.15rem] border border-[#0AC4E0]/16 bg-[#F6FDFF] px-4 py-3 text-[13px] font-semibold leading-6 text-[#5F7E86]">
                                                User dapat mengubah nama, email, password, dan foto profil secara mandiri. Admin hanya menerima notifikasi perubahan, bukan isi password.
                                            </div>

                                            <div className="flex justify-end gap-3">
                                                {isEditingProfile && (
                                                    <button
                                                        type="button"
                                                        onClick={handleCancelProfile}
                                                        disabled={savingProfile}
                                                        className="h-10 rounded-full border border-slate-200 bg-white px-5 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 transition hover:bg-slate-50 disabled:opacity-60"
                                                    >
                                                        Batal
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={handleSaveProfile}
                                                    disabled={!isEditingProfile || savingProfile || loadingProfile}
                                                    className="inline-flex h-10 items-center gap-2 rounded-full bg-[#103F49] px-5 text-[11px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#0AC4E0] disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {savingProfile ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                                                    {savingProfile ? "Menyimpan" : "Simpan Perubahan"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {showRelationPanel && (
                                        <div className="rounded-[1.7rem] border border-[#DFF8FC] bg-[#F7FDFF] shadow-[0_18px_55px_rgba(10,196,224,0.07)]">
                                            <div className="border-b border-[#DFF8FC] px-6 py-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <SectionTitle desc={relationPanelMeta.desc}>
                                                        {relationPanelMeta.title}
                                                    </SectionTitle>

                                                    <span className="mt-1 shrink-0 rounded-full border border-[#0AC4E0]/18 bg-white px-3 py-1.5 text-[10px] font-black text-[#078EA3]">
                                                        {relationPanelType === "wilayah"
                                                            ? `${aoWilayahItems.length} ${relationPanelMeta.countLabel}`
                                                            : `${loadingTeam ? "..." : teamMembers.length} ${relationPanelMeta.countLabel}`}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-3 px-6 py-5">
                                                {relationPanelType === "wilayah" ? (
                                                    aoWilayahItems.length > 0 ? (
                                                        aoWilayahItems.map((item) => (
                                                            <div
                                                                key={`${item.name}-${item.detail}`}
                                                                className="rounded-[1.15rem] border border-[#0AC4E0]/12 bg-white px-4 py-3 transition hover:border-[#0AC4E0]/25 hover:bg-[#F7FDFF]"
                                                            >
                                                                <p className="text-[13px] font-black text-[#103F49]">
                                                                    {item.name}
                                                                </p>
                                                                <p className="mt-1 text-[11px] font-semibold leading-5 text-[#6D98A1]">
                                                                    {item.detail}
                                                                </p>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="rounded-[1.25rem] border border-[#DFF8FC] bg-white px-5 py-6 text-center">
                                                            <p className="text-sm font-black text-[#103F49]">
                                                                {relationPanelMeta.emptyTitle}
                                                            </p>
                                                            <p className="mt-2 text-xs font-semibold leading-5 text-[#6D98A1]">
                                                                {relationPanelMeta.emptyDesc}
                                                            </p>
                                                        </div>
                                                    )
                                                ) : loadingTeam ? (
                                                    <div className="flex h-[198px] items-center justify-center rounded-[1.25rem] border border-[#DFF8FC] bg-white">
                                                        <div className="flex items-center gap-3 text-sm font-black text-[#6D98A1]">
                                                            <Loader2 size={18} className="animate-spin text-[#0AC4E0]" />
                                                            {relationPanelMeta.loadingLabel}
                                                        </div>
                                                    </div>
                                                ) : visibleTeamMembers.length > 0 ? (
                                                    <>
                                                        {visibleTeamMembers.map((item) => (
                                                            <TeamMemberRow
                                                                key={getUserId(item.user) || getUserEmail(item.user)}
                                                                member={item.user}
                                                                relation={item.relation}
                                                                current={
                                                                    String(getUserId(item.user) || "") ===
                                                                    String(getUserId(profile) || getUserId(tokenUser) || "")
                                                                }
                                                            />
                                                        ))}

                                                        {hiddenTeamCount > 0 && (
                                                            <div className="rounded-[1.15rem] border border-[#DFF8FC] bg-white px-4 py-3 text-center text-[12px] font-black text-[#6D98A1]">
                                                                +{hiddenTeamCount} user lain dengan relasi team yang sama
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="rounded-[1.25rem] border border-[#DFF8FC] bg-white px-5 py-6 text-center">
                                                        <p className="text-sm font-black text-[#103F49]">
                                                            {relationPanelMeta.emptyTitle}
                                                        </p>
                                                        <p className="mt-2 text-xs font-semibold leading-5 text-[#6D98A1]">
                                                            {relationPanelMeta.emptyDesc}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <aside className="grid min-h-0 grid-rows-[0.9fr_1.1fr] gap-7">
                        <div className="rounded-[2rem] border border-[#DFF8FC] bg-white p-6 shadow-[0_24px_70px_rgba(10,196,224,0.11)]">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-[23px] font-black tracking-[-0.055em] text-[#103F49]">
                                        Penyimpanan Dokumen
                                    </h2>
                                    <p className="mt-2 text-[13px] font-semibold leading-6 text-[#5F7E86]">
                                        Dipakai ketika user mengunggah MOU, bukti termin, dan bukti kegiatan.
                                    </p>
                                </div>

                                <span
                                    className={`shrink-0 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] ${connected
                                        ? "border border-[#0AC4E0]/20 bg-[#E9FBFF] text-[#078EA3]"
                                        : "border border-amber-200 bg-amber-50 text-amber-700"
                                        }`}
                                >
                                    {loadingDrive ? "Mengecek" : connected ? "Terhubung" : "Belum tertaut"}
                                </span>
                            </div>

                            <div className="mt-5 space-y-3">
                                <Field label="Email Penyimpanan" value={driveStatus.google_email} />
                                <Field label="Nama Akun Penyimpanan" value={driveStatus.google_name} />
                                <Field label="Waktu Tertaut" value={connectedAtLabel} />
                            </div>

                            <div className="mt-5 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => fetchDriveStatus()}
                                    disabled={loadingDrive}
                                    className="h-11 flex-1 rounded-[1.05rem] border border-[#0AC4E0]/18 bg-white text-[11px] font-black uppercase tracking-[0.14em] text-[#078EA3] transition hover:bg-[#F6FDFF] disabled:opacity-60"
                                >
                                    {loadingDrive ? "Memuat" : "Refresh"}
                                </button>

                                {connected ? (
                                    <button
                                        type="button"
                                        onClick={handleDisconnectDrive}
                                        disabled={disconnecting}
                                        className="h-11 flex-1 rounded-[1.05rem] border border-rose-200 bg-white text-[11px] font-black uppercase tracking-[0.14em] text-rose-500 transition hover:bg-rose-50 disabled:opacity-60"
                                    >
                                        {disconnecting ? "Memutuskan" : "Putuskan"}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleConnectDrive}
                                        disabled={connecting}
                                        className="h-11 flex-1 rounded-[1.05rem] bg-[#0AC4E0] text-[11px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#08B7D1] disabled:opacity-60"
                                    >
                                        {connecting ? "Menghubungkan" : "Tautkan"}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-[#DFF8FC] bg-white p-6 shadow-[0_24px_70px_rgba(10,196,224,0.11)]">
                            <h2 className="text-[23px] font-black tracking-[-0.055em] text-[#103F49]">
                                Cara Kerja Upload
                            </h2>

                            <div className="mt-5 space-y-3">
                                {[
                                    {
                                        title: "Upload dari modul aktif",
                                        desc: "User mengunggah file dari Program, Assessment, atau modul lain.",
                                    },
                                    {
                                        title: "Sistem validasi tautan",
                                        desc: "Jika belum tertaut, user diarahkan menautkan penyimpanan dokumen.",
                                    },
                                    {
                                        title: "Riwayat tetap tercatat",
                                        desc: "Metadata menyimpan user, role, modul, dan waktu upload.",
                                    },
                                ].map((item, index) => (
                                    <div
                                        key={item.title}
                                        className="rounded-[1.35rem] border border-[#0AC4E0]/12 bg-[#F7FDFF] px-4 py-3"
                                    >
                                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#0AC4E0]">
                                            Step 0{index + 1}
                                        </p>
                                        <p className="mt-1 text-[14px] font-black text-[#103F49]">
                                            {item.title}
                                        </p>
                                        <p className="mt-1 text-[12px] font-semibold leading-5 text-[#5F7E86]">
                                            {item.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}

export default AccountSettings;

