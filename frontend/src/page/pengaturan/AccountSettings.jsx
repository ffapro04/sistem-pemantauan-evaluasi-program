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
import { showConfirmDialog } from "../../utils/popup";
import { GoogleDriveLogo } from "../../components/ui";

import { API_BASE_URL } from "../../config/apiBase.js";
import { getAuthToken } from "../../utils/authSession";

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
    const token = getAuthToken();
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

function Field({ label, value, type = "text", disabled = false }) {
    return (
        <div className="min-w-0">
            <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-[#94A3B8]">
                {label}
            </label>
            <div
                className={`flex h-11 min-w-0 items-center rounded-[1.05rem] border px-4 text-[13px] font-bold ${disabled
                    ? "border-[#0AC4E0]/15 bg-[#0AC4E0]/5 text-[#94A3B8]"
                    : "border-[#0AC4E0]/15 bg-white text-[#020617]"
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
            <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-[#94A3B8]">
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
                    ? "cursor-not-allowed border-[#0AC4E0]/15 bg-[#0AC4E0]/5 text-[#94A3B8]"
                    : "border-[#0AC4E0]/15 bg-white text-[#020617] focus:border-[#0AC4E0] focus:ring-4 focus:ring-[#0AC4E0]/10"
                    }`}
            />
        </div>
    );
}

function Avatar({ user, name, size = "md", rounded = "rounded-full" }) {
    const [imageError, setImageError] = useState(false);
    const avatarUrl = getAvatarUrl(user);

    const sizeClass =
        size === "lg"
            ? "h-[72px] w-[72px] text-[26px]"
            : "h-10 w-10 text-sm";

    return (
        <div
            className={`relative flex ${sizeClass} shrink-0 items-center justify-center overflow-hidden ${rounded} bg-[#0AC4E0]/10 font-black text-[#0899B0]`}
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

function AccountSettings() {
    useUiAutoTranslate();

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingDrive, setLoadingDrive] = useState(true);
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

    const token = useMemo(() => getAuthToken(), []);
    const tokenUser = useMemo(() => getTokenPayload() || {}, []);
    const [profile, setProfile] = useState(tokenUser);

    const [driveStatus, setDriveStatus] = useState({
        connected: false,
        provider: null,
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

    const fetchProfile = useCallback(async () => {
        if (!checkAuth()) return;

        const idUser = getUserId(tokenUser);
        if (!idUser) {
            setLoadingProfile(false);
            return;
        }

        setLoadingProfile(true);

        try {
            const response = await fetch(`${API_BASE_URL}/users/${idUser}`, {
                method: "GET",
                headers: authHeaders,
            });

            const payload = await response.json().catch(() => ({}));

            if (response.ok) {
                setProfile({
                    ...tokenUser,
                    ...(payload?.data || payload || {}),
                });
            } else {
                setProfile(tokenUser);
            }
        } catch {
            setProfile(tokenUser);
        } finally {
            setLoadingProfile(false);
        }
    }, [authHeaders, checkAuth, tokenUser]);

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

        const driveParam = searchParams.get("drive") || searchParams.get("googleDrive") || searchParams.get("storage");
        if (driveParam === "connected") {
            toast.success("Penyimpanan dokumen berhasil ditautkan.");
            const returnTo = searchParams.get("returnTo");
            if (returnTo && returnTo.startsWith("/")) {
                navigate(returnTo, { replace: true });
                return;
            }
            setSearchParams({});
        }
    }, [fetchProfile, fetchDriveStatus, navigate, searchParams, setSearchParams]);

    const handleConnectDrive = async () => {
        if (!checkAuth()) return;

        setConnecting(true);

        try {
            const returnTo = searchParams.get("returnTo");
            const redirectTo =
                returnTo && returnTo.startsWith("/")
                    ? returnTo
                    : "/pengaturan-akun?storage=connected";
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
                throw new Error("URL perizinan penyimpanan tidak ditemukan dari backend.");
            }

            window.location.href = payload.url;
        } catch (error) {
            toast.error(error.message || "Gagal menautkan penyimpanan dokumen.");
            setConnecting(false);
        }
    };

    const handleDisconnectDrive = async () => {
        if (!checkAuth()) return;

        const confirmed = await showConfirmDialog({
            title: "Putuskan Penyimpanan?",
            text: "Tautan penyimpanan dokumen akan dilepas dari akun ini.",
            confirmButtonText: "Putuskan",
        });

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
            if (password.length < 8) {
                toast.error("Password baru minimal 8 karakter.");
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

    return (
        <div className="flex h-screen overflow-hidden bg-[#EEF5FF] font-sans text-[#020617] selection:bg-cyan-400 selection:text-white">
            <Sidebar />

            <main className="h-screen min-w-0 flex-1 overflow-y-auto px-8 py-7">
                <div className="mx-auto flex max-w-[920px] flex-col">
                    <div className="flex items-start justify-between gap-4 pb-7">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0AC4E0]">
                                Akun Saya
                            </p>
                            <h1 className="mt-1.5 text-[26px] font-black tracking-[-0.03em] text-[#020617]">
                                Pengaturan Akun
                            </h1>
                        </div>
                        <LanguageSwitcher compact />
                    </div>

                    {/* Profil */}
                    <div className="grid grid-cols-[220px_1fr] gap-10 border-t border-[#0AC4E0]/15 py-7">
                        <div>
                            <p className="text-[14px] font-black text-[#020617]">Profil</p>
                            <p className="mt-1.5 text-[12px] font-medium leading-relaxed text-[#94A3B8]">
                                Foto dan identitas yang tampil di seluruh sistem.
                            </p>
                        </div>

                        <div className="flex items-center justify-between gap-5 rounded-[1.7rem] border border-[#0AC4E0]/15 bg-white px-6 py-5 shadow-[0_18px_55px_rgba(10,196,224,0.07)]">
                            <div className="flex min-w-0 items-center gap-4">
                                <div className="relative shrink-0">
                                    <div className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-[1.3rem] bg-[#0AC4E0]/10 text-[26px] font-black text-[#0899B0]">
                                        {loadingProfile ? (
                                            <Loader2 size={22} className="animate-spin text-[#0AC4E0]" />
                                        ) : (
                                            <Avatar
                                                user={photoPreviewUrl ? { ...profile, foto_profile: photoPreviewUrl } : profile}
                                                name={displayName}
                                                size="lg"
                                                rounded="rounded-[1.3rem]"
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
                                        className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-[0.6rem] border-[3px] border-white bg-[#0AC4E0] text-white shadow-lg transition hover:bg-[#0899B0] disabled:cursor-not-allowed disabled:opacity-70"
                                        title="Ganti foto profil"
                                    >
                                        {uploadingPhoto ? (
                                            <Loader2 size={11} className="animate-spin" />
                                        ) : (
                                            <Camera size={11} />
                                        )}
                                    </button>
                                </div>

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <p className="truncate text-[17px] font-black tracking-[-0.02em] text-[#020617]">
                                            {displayName}
                                        </p>
                                        <span className="shrink-0 rounded-full border border-[#0AC4E0]/20 bg-[#0AC4E0]/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-[#0899B0]">
                                            {roleLabel}
                                        </span>
                                    </div>
                                    <p className="mt-1 truncate text-[12px] font-semibold text-[#64748B]">
                                        {jabatan} · {jenisLabel} · {subJenisLabel}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={isEditingProfile ? handleCancelProfile : handleEditProfile}
                                disabled={savingProfile || loadingProfile}
                                className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-[11px] font-black uppercase tracking-[0.08em] transition disabled:cursor-not-allowed disabled:opacity-70 ${isEditingProfile
                                    ? "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                                    : "border border-[#0AC4E0]/20 bg-white text-[#0899B0] hover:bg-[#0AC4E0]/5"
                                    }`}
                            >
                                {isEditingProfile ? <X size={12} /> : <Pencil size={12} />}
                                {isEditingProfile ? "Batal" : "Edit Profil"}
                            </button>
                        </div>
                    </div>

                    {/* Informasi Login */}
                    <div className="grid grid-cols-[220px_1fr] gap-10 border-t border-[#0AC4E0]/15 py-7">
                        <div>
                            <p className="text-[14px] font-black text-[#020617]">Informasi Login</p>
                            <p className="mt-1.5 text-[12px] font-medium leading-relaxed text-[#94A3B8]">
                                Nama, email, dan password dikelola secara mandiri.
                            </p>
                        </div>

                        <div className="rounded-[1.7rem] border border-[#0AC4E0]/15 bg-white p-6 shadow-[0_18px_55px_rgba(10,196,224,0.07)]">
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

                            <div className="mt-4 grid grid-cols-2 gap-4">
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

                            <div className="mt-4 rounded-[1.15rem] border border-[#0AC4E0]/16 bg-[#0AC4E0]/5 px-4 py-3 text-[13px] font-semibold leading-6 text-[#64748B]">
                                Admin hanya menerima notifikasi perubahan, bukan isi password.
                            </div>

                            <div className="mt-5 flex justify-end gap-3">
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
                                    className="inline-flex h-10 items-center gap-2 rounded-full bg-[#0AC4E0] px-5 text-[11px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#0899B0] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {savingProfile ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                                    {savingProfile ? "Menyimpan" : "Simpan Perubahan"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Penyimpanan Dokumen */}
                    <div className="grid grid-cols-[220px_1fr] gap-10 border-t border-b border-[#0AC4E0]/15 py-7">
                        <div>
                            <p className="text-[14px] font-black text-[#020617]">Penyimpanan Dokumen</p>
                            <p className="mt-1.5 text-[12px] font-medium leading-relaxed text-[#94A3B8]">
                                Dipakai saat mengunggah MOU, bukti termin, dan bukti kegiatan.
                            </p>
                        </div>

                        <div className="rounded-[1.7rem] border border-[#0AC4E0]/15 bg-white p-6 shadow-[0_18px_55px_rgba(10,196,224,0.07)]">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex min-w-0 items-start gap-3">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] border border-[#0AC4E0]/15 bg-white shadow-[0_12px_30px_rgba(10,196,224,0.10)]">
                                        <GoogleDriveLogo size={28} />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-[15px] font-black text-[#020617]">Google Drive</p>
                                        <p className="mt-1 text-[12px] font-semibold leading-5 text-[#64748B]">
                                            Dipakai ketika user mengunggah MOU, bukti termin, dan bukti kegiatan.
                                        </p>
                                    </div>
                                </div>

                                <span
                                    className={`shrink-0 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] ${connected
                                        ? "border border-[#0AC4E0]/20 bg-[#0AC4E0]/10 text-[#0899B0]"
                                        : "border border-amber-200 bg-amber-50 text-amber-700"
                                        }`}
                                >
                                    {loadingDrive ? "Mengecek" : connected ? "Terhubung" : "Belum tertaut"}
                                </span>
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-3">
                                <Field label="Email Penyimpanan" value={driveStatus.google_email} />
                                <Field label="Waktu Tertaut" value={connectedAtLabel} />
                            </div>

                            <div className="mt-5 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => fetchDriveStatus()}
                                    disabled={loadingDrive}
                                    className="h-11 flex-1 rounded-[1.05rem] border border-[#0AC4E0]/18 bg-white text-[11px] font-black uppercase tracking-[0.14em] text-[#0899B0] transition hover:bg-[#0AC4E0]/5 disabled:opacity-60"
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
                                        className="h-11 flex-1 rounded-[1.05rem] bg-[#0AC4E0] text-[11px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#0899B0] disabled:opacity-60"
                                    >
                                        {connecting ? "Menghubungkan" : "Tautkan Google Drive"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default AccountSettings;

