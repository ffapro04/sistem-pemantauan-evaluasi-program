/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
    CheckCircle2,
    Eye,
    GraduationCap,
    KeyRound,
    Mail,
    Pencil,
    Phone,
    Plus,
    Power,
    PowerOff,
    RefreshCw,
    ShieldCheck,
    Trash2,
    UserRound,
    Users,
    XCircle,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Dropdown from "../../components/Dropdown";
import MasterPageShell from "../../components/masterCrud/MasterPageShell";
import MasterAlert from "../../components/masterCrud/MasterAlert";
import AppButton from "../../components/ui/AppButton";
import { showConfirmDialog } from "../../utils/popup";

import { API_BASE_URL as BASE_URL } from "../../config/apiBase.js";
import { getAuthToken } from "../../utils/authSession";

function decodeUser() {
    const token = getAuthToken();
    if (!token) return null;

    try {
        return jwtDecode(token);
    } catch {
        return null;
    }
}

function getAuthHeaders() {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

function unwrapArray(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.rows)) return payload.rows;
    if (Array.isArray(payload?.result)) return payload.result;
    if (payload?.data && typeof payload.data === "object") return [payload.data];
    if (payload && typeof payload === "object") return [payload];
    return [];
}

function unwrapObject(payload) {
    if (!payload) return null;
    if (payload?.data && typeof payload.data === "object") return payload.data;
    if (payload && typeof payload === "object") return payload;
    return null;
}

function getSchoolId(user) {
    return (
        user?.id_sekolah ||
        user?.sekolah_id ||
        user?.school_id ||
        user?.user?.id_sekolah ||
        user?.sekolah?.id_sekolah ||
        user?.sekolah?.id ||
        user?.school?.id_sekolah ||
        user?.school?.id ||
        null
    );
}

function getUserRoleId(user) {
    return Number(user?.id_role || user?.role_id || user?.user?.id_role || 0);
}

function isOperatorSekolah(user) {
    const idRole = getUserRoleId(user);
    const role = String(user?.role || user?.nama_role || "").toLowerCase();
    const jabatan = String(user?.jabatan || "").toLowerCase();

    return (
        idRole === 5 ||
        idRole === 9 ||
        role.includes("operator") ||
        jabatan.includes("operator sekolah") ||
        jabatan.includes("operator")
    );
}

function getJenjang(user, sekolahDetail) {
    return String(
        sekolahDetail?.jenjang ||
        sekolahDetail?.data?.jenjang ||
        user?.jenjang ||
        user?.sekolah?.jenjang ||
        user?.school?.jenjang ||
        "",
    ).toUpperCase();
}

function getGuruId(item) {
    return item?.id_guru_assessment || item?.id_user || item?.id || null;
}

function getGuruName(item) {
    return item?.nama_guru || item?.nama || item?.name || "-";
}

function getGuruEmail(item) {
    return item?.email_guru || item?.email || "-";
}

function getGuruPhone(item) {
    return item?.no_telepon || item?.no_telp || item?.no_hp || item?.telepon || "-";
}

function getGuruMapel(item) {
    return item?.mata_pelajaran || item?.mapel || "-";
}

function getGuruKelasLabel(item) {
    return (
        item?.kelas_data?.nama_kelas ||
        item?.kelas?.nama_kelas ||
        item?.nama_kelas ||
        item?.kelas_wali ||
        ""
    );
}

function getGuruRawJurusanLabel(item) {
    return (
        item?.jurusan_data?.nama_jurusan ||
        item?.jurusan_data?.kode_jurusan ||
        item?.nama_jurusan ||
        item?.kode_jurusan ||
        item?.jurusan ||
        ""
    );
}

function getGuruJurusanLabel(item) {
    const jurusanLabel = getGuruRawJurusanLabel(item);

    if (jurusanLabel) return jurusanLabel;

    const hasAcademicSubject =
        String(item?.mata_pelajaran || item?.mapel || "").trim().length > 0;

    return hasAcademicSubject ? "Bidang Studi Akademik" : "-";
}

function normalizeFilterValue(value) {
    return String(value || "")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();
}

function getGuruKelasFilterValue(item) {
    const idKelas =
        item?.id_kelas ||
        item?.kelas_data?.id_kelas ||
        item?.kelas?.id_kelas ||
        item?.kelas?.id ||
        "";

    if (idKelas) return `id:${idKelas}`;

    const kelasLabel = getGuruKelasLabel(item);
    return kelasLabel ? `label:${normalizeFilterValue(kelasLabel)}` : "tanpa-kelas";
}

function getGuruJurusanFilterValue(item) {
    const idJurusan =
        item?.id_jurusan ||
        item?.jurusan_data?.id_jurusan ||
        item?.jurusan?.id_jurusan ||
        "";

    if (idJurusan) return `id:${idJurusan}`;

    const jurusanLabel = getGuruRawJurusanLabel(item);
    return jurusanLabel
        ? `label:${normalizeFilterValue(jurusanLabel)}`
        : "bidang-studi-akademik";
}

function getGuruBidangStudi(item) {
    return getGuruJurusanFilterValue(item) === "bidang-studi-akademik"
        ? "akademik"
        : "kejuruan";
}

function buildUniqueOptions(rows, getValue, getLabel, emptyLabel) {
    const unique = new Map();

    rows.forEach((row) => {
        const value = getValue(row);
        const label = getLabel(row);

        if (!value || !label) return;
        if (!unique.has(value)) {
            unique.set(value, label);
        }
    });

    return [
        { label: emptyLabel, value: "semua" },
        ...Array.from(unique.entries())
            .sort((a, b) => a[1].localeCompare(b[1], "id-ID"))
            .map(([value, label]) => ({ value, label })),
    ];
}

function getGuruSubLabel(item) {
    const kelasLabel = getGuruKelasLabel(item);

    if (kelasLabel) {
        return `Wali ${kelasLabel}`;
    }

    return "Guru Assessment";
}

function getGuruActive(item) {
    if (typeof item?.is_active === "boolean") return item.is_active;
    if (typeof item?.status === "boolean") return item.status;

    const value = String(item?.is_active || item?.status || "").toLowerCase();
    return !["false", "nonaktif", "inactive", "0"].includes(value);
}

function getKepsekId(item) {
    return item?.id_user || item?.id || null;
}

function getKepsekActive(item) {
    if (typeof item?.status === "boolean") return item.status;
    const value = String(item?.status || "").toLowerCase();
    return !["false", "nonaktif", "inactive", "0"].includes(value);
}

function formatDate(value) {
    if (!value) return "Belum pernah";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Belum pernah";

    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function StatusBadge({ active }) {
    return active ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-500">
            <CheckCircle2 size={11} />
            Aktif
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-rose-400">
            <XCircle size={11} />
            Nonaktif
        </span>
    );
}

export default function DaftarGuru() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const initialTab = searchParams.get("tab") === "kepala-sekolah" ? "kepala-sekolah" : "guru";

    const [activeTab, setActiveTab] = useState(initialTab);
    const [user, setUser] = useState(null);
    const [sekolahDetail, setSekolahDetail] = useState(null);
    const [list, setList] = useState([]);
    const [kepalaSekolah, setKepalaSekolah] = useState(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState({});
    const [filters, setFilters] = useState({
        status: "semua",
        kelas: "semua",
        jurusan: "semua",
        bidangStudi: "semua",
    });
    const [note, setNote] = useState({
        show: false,
        type: null,
        message: "",
    });

    const idSekolah = getSchoolId(user);
    const isOperator = isOperatorSekolah(user);
    const isSmk = getJenjang(user, sekolahDetail) === "SMK";

    const currentTitle = activeTab === "kepala-sekolah" ? "Kepala Sekolah" : "Guru";

    const kelasOptions = useMemo(
        () =>
            buildUniqueOptions(
                list,
                getGuruKelasFilterValue,
                (item) => getGuruKelasLabel(item) || "Tidak menjadi wali kelas",
                "Semua Kelas",
            ),
        [list],
    );

    const jurusanOptions = useMemo(
        () =>
            buildUniqueOptions(
                list,
                getGuruJurusanFilterValue,
                getGuruJurusanLabel,
                "Semua Jurusan",
            ),
        [list],
    );

    const filteredList = useMemo(() => {
        return list.filter((item) => {
            if (filters.status === "aktif" && !getGuruActive(item)) return false;
            if (filters.status === "nonaktif" && getGuruActive(item)) return false;

            if (
                filters.kelas !== "semua" &&
                getGuruKelasFilterValue(item) !== filters.kelas
            ) {
                return false;
            }

            if (
                filters.jurusan !== "semua" &&
                getGuruJurusanFilterValue(item) !== filters.jurusan
            ) {
                return false;
            }

            if (
                filters.bidangStudi !== "semua" &&
                getGuruBidangStudi(item) !== filters.bidangStudi
            ) {
                return false;
            }

            return true;
        });
    }, [filters, list]);

    const hasActiveFilter = Object.values(filters).some((value) => value !== "semua");

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const resetFilters = () => {
        setFilters({
            status: "semua",
            kelas: "semua",
            jurusan: "semua",
            bidangStudi: "semua",
        });
    };

    useEffect(() => {
        const decoded = decodeUser();

        if (!decoded) {
            setNote({
                show: true,
                type: "error",
                message: "Sesi login tidak valid. Silakan login ulang.",
            });
            return;
        }

        setUser(decoded);
    }, []);

    const switchTab = (tab) => {
        setActiveTab(tab);
        if (tab === "kepala-sekolah") {
            setSearchParams({ tab: "kepala-sekolah" });
        } else {
            setSearchParams({});
        }
    };

    const fetchData = useCallback(async () => {
        if (!idSekolah) {
            setNote({
                show: true,
                type: "error",
                message: "ID sekolah tidak ditemukan pada akun.",
            });
            return;
        }

        setLoading(true);

        try {
            const headers = getAuthHeaders();

            const guruEndpoint = isOperator
                ? `${BASE_URL}/assessment-guru/sekolah/${idSekolah}`
                : `${BASE_URL}/assessment-guru/sekolah/${idSekolah}/aktif`;

            const [guruResponse, sekolahResponse, kepsekResponse] = await Promise.allSettled([
                axios.get(guruEndpoint, { headers }),
                axios.get(`${BASE_URL}/sekolah/${idSekolah}`, { headers }),
                axios.get(`${BASE_URL}/users/kepala-sekolah/sekolah/${idSekolah}`, { headers }),
            ]);

            if (guruResponse.status === "rejected") {
                throw guruResponse.reason;
            }

            const guruPayload = guruResponse.value?.data;
            setList(Array.isArray(guruPayload) ? guruPayload : guruPayload?.data ?? []);

            if (sekolahResponse.status === "fulfilled") {
                const sekolahPayload = sekolahResponse.value?.data;
                setSekolahDetail(sekolahPayload?.data || sekolahPayload || null);
            }

            if (kepsekResponse.status === "fulfilled") {
                const payload = unwrapObject(kepsekResponse.value?.data);
                setKepalaSekolah(payload?.id_user || payload?.id ? payload : null);
            } else {
                setKepalaSekolah(null);
            }
        } catch (error) {
            console.error("Gagal memuat daftar guru:", error);

            setNote({
                show: true,
                type: "error",
                message: "Gagal memuat daftar guru.",
            });
        } finally {
            setLoading(false);
        }
    }, [idSekolah, isOperator]);

    useEffect(() => {
        if (user) fetchData();
    }, [user, fetchData]);

    const handleCreateGuru = () => {
        if (!isOperator) return;
        navigate("/sekolah/guru/create");
    };

    const handleEditGuru = (item) => {
        if (!isOperator) return;

        const id = getGuruId(item);
        if (!id) return;

        navigate(`/sekolah/guru/edit/${id}`);
    };

    const handleDetailGuru = (item) => {
        const id = getGuruId(item);
        if (!id) return;

        navigate(`/sekolah/guru/detail/${id}`);
    };

    const setGuruActionLoading = (id, value) => {
        setActionLoading((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    const handleToggleGuruStatus = async (item) => {
        if (!isOperator) return;

        const id = getGuruId(item);
        if (!id) return;

        const active = getGuruActive(item);
        const nextActive = !active;
        const actionText = active ? "nonaktifkan" : "aktifkan";

        const confirmed = await showConfirmDialog({
            title: `${active ? "Nonaktifkan" : "Aktifkan"} Guru?`,
            text: `Yakin ingin ${actionText} guru "${getGuruName(item)}"?`,
            confirmButtonText: active ? "Nonaktifkan" : "Aktifkan",
        });

        if (!confirmed) return;

        setGuruActionLoading(id, true);

        try {
            await axios.patch(
                `${BASE_URL}/assessment-guru/${id}`,
                { is_active: nextActive },
                { headers: getAuthHeaders() },
            );

            setNote({
                show: true,
                type: "success",
                message: `Guru berhasil di${actionText}.`,
            });

            fetchData();
        } catch (error) {
            console.error("Gagal mengubah status guru:", error);
            const message =
                error?.response?.data?.message || "Gagal mengubah status guru.";

            setNote({
                show: true,
                type: "error",
                message: Array.isArray(message) ? message.join(", ") : message,
            });
        } finally {
            setGuruActionLoading(id, false);
        }
    };

    const handleDeleteGuru = async (item) => {
        if (!isOperator) return;

        const id = getGuruId(item);
        if (!id) return;

        const confirmed = await showConfirmDialog({
            title: "Hapus Guru?",
            text: `Yakin ingin menghapus guru "${getGuruName(item)}"? Data yang dihapus tidak bisa dikembalikan.`,
            confirmButtonText: "Hapus",
        });

        if (!confirmed) return;

        setGuruActionLoading(id, true);

        try {
            await axios.delete(`${BASE_URL}/assessment-guru/${id}`, {
                headers: getAuthHeaders(),
            });

            setNote({
                show: true,
                type: "success",
                message: "Guru berhasil dihapus.",
            });

            fetchData();
        } catch (error) {
            console.error("Gagal menghapus guru:", error);
            const message = error?.response?.data?.message || "Gagal menghapus guru.";

            setNote({
                show: true,
                type: "error",
                message: Array.isArray(message) ? message.join(", ") : message,
            });
        } finally {
            setGuruActionLoading(id, false);
        }
    };

    const handleCreateKepsek = () => {
        if (!isOperator) return;
        navigate("/sekolah/guru/kepala-sekolah/create");
    };

    const handleEditKepsek = () => {
        if (!isOperator || !kepalaSekolah) return;

        const id = getKepsekId(kepalaSekolah);
        if (!id) return;

        navigate(`/sekolah/guru/kepala-sekolah/edit/${id}`);
    };

    const handleResetPasswordKepsek = async () => {
        if (!isOperator || !kepalaSekolah) return;

        const id = getKepsekId(kepalaSekolah);
        if (!id) return;

        const password = window.prompt("Masukkan password baru Kepala Sekolah. Minimal 8 karakter:");

        if (password === null) return;

        const cleanPassword = String(password || "").trim();

        if (cleanPassword.length < 8) {
            setNote({
                show: true,
                type: "error",
                message: "Password minimal 8 karakter.",
            });
            return;
        }

        try {
            await axios.patch(
                `${BASE_URL}/users/kepala-sekolah/${id}/reset-password`,
                { password: cleanPassword },
                { headers: getAuthHeaders() },
            );

            setNote({
                show: true,
                type: "success",
                message: "Password Kepala Sekolah berhasil direset.",
            });

            fetchData();
        } catch (error) {
            console.error("Gagal reset password Kepala Sekolah:", error);
            const message = error?.response?.data?.message || "Gagal reset password Kepala Sekolah.";

            setNote({
                show: true,
                type: "error",
                message: Array.isArray(message) ? message.join(", ") : message,
            });
        }
    };

    return (
        <MasterPageShell
            title="Daftar"
            highlight={currentTitle}
            subtitle={
                isOperator
                    ? "Kelola data guru assessment dan akun Kepala Sekolah."
                    : "Daftar guru assessment aktif pada sekolah Anda."
            }
            action={
                <div className="flex flex-wrap items-center gap-3">
                    <AppButton
                        type="button"
                        onClick={fetchData}
                        icon={<RefreshCw size={12} className={loading ? "animate-spin" : ""} />}
                        variant="secondary"
                        size="sm"
                        className="!rounded-full"
                    >
                        Refresh
                    </AppButton>

                    {isOperator && activeTab === "guru" && (
                        <AppButton
                            type="button"
                            onClick={handleCreateGuru}
                            icon={<Plus size={12} />}
                            variant="accent"
                            size="sm"
                            className="!rounded-full hover:!bg-cyan-500"
                        >
                            Tambah Guru
                        </AppButton>
                    )}

                    {isOperator && activeTab === "kepala-sekolah" && !kepalaSekolah && (
                        <AppButton
                            type="button"
                            onClick={handleCreateKepsek}
                            icon={<Plus size={12} />}
                            variant="accent"
                            size="sm"
                            className="!rounded-full hover:!bg-cyan-500"
                        >
                            Tambah Kepala Sekolah
                        </AppButton>
                    )}

                    {isOperator && activeTab === "kepala-sekolah" && kepalaSekolah && (
                        <AppButton
                            type="button"
                            onClick={handleEditKepsek}
                            icon={<Pencil size={12} />}
                            variant="accent"
                            size="sm"
                            className="!rounded-full hover:!bg-cyan-500"
                        >
                            Edit Akun
                        </AppButton>
                    )}
                </div>
            }
        >
            <MasterAlert note={note} setNote={setNote} />

            <div className="h-full overflow-y-auto no-scrollbar px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
                <div className="mb-5 flex flex-wrap gap-2 rounded-[1.5rem] border border-slate-100 bg-white p-2 shadow-sm">
                    <button
                        type="button"
                        onClick={() => switchTab("guru")}
                        className={`flex items-center gap-2 rounded-[1.1rem] px-4 py-2.5 text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === "guru"
                            ? "bg-[#0AC4E0] text-white shadow-lg shadow-cyan-100"
                            : "bg-slate-50 text-slate-400 hover:bg-cyan-50 hover:text-[#0AC4E0]"
                            }`}
                    >
                        <GraduationCap size={13} />
                        Guru Assessment
                    </button>

                    <button
                        type="button"
                        onClick={() => switchTab("kepala-sekolah")}
                        className={`flex items-center gap-2 rounded-[1.1rem] px-4 py-2.5 text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === "kepala-sekolah"
                            ? "bg-[#0AC4E0] text-white shadow-lg shadow-cyan-100"
                            : "bg-slate-50 text-slate-400 hover:bg-cyan-50 hover:text-[#0AC4E0]"
                            }`}
                    >
                        <ShieldCheck size={13} />
                        Kepala Sekolah
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-24">
                        <RefreshCw size={28} className="animate-spin text-[#0AC4E0]" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Memuat data...
                        </p>
                    </div>
                ) : activeTab === "kepala-sekolah" ? (
                    <div className="overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white shadow-sm">
                        <div className="flex flex-col gap-1 border-b border-slate-100 bg-slate-50 px-6 py-5">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0AC4E0]">
                                Akun Kepala Sekolah
                            </p>
                            <p className="text-sm font-bold text-slate-500">
                                Satu sekolah hanya dapat memiliki satu akun Kepala Sekolah.
                            </p>
                        </div>

                        {!kepalaSekolah ? (
                            <div className="flex flex-col items-center justify-center gap-4 py-24">
                                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-50">
                                    <ShieldCheck size={34} className="text-[#0AC4E0]" />
                                </div>

                                <div className="text-center">
                                    <p className="text-sm font-black text-slate-700">
                                        Belum ada akun Kepala Sekolah.
                                    </p>
                                    <p className="mt-1 text-xs font-semibold text-slate-400">
                                        Tambahkan akun Kepala Sekolah agar dapat login ke dashboard Kepala Sekolah.
                                    </p>
                                </div>

                                {isOperator && (
                                    <AppButton
                                        type="button"
                                        onClick={handleCreateKepsek}
                                        icon={<Plus size={13} />}
                                        variant="accent"
                                        className="!rounded-full hover:!bg-cyan-500"
                                    >
                                        Tambah Kepala Sekolah
                                    </AppButton>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[940px] text-left">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-white">
                                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                Nama
                                            </th>
                                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                Email
                                            </th>
                                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                Jabatan
                                            </th>
                                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                Sekolah
                                            </th>
                                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                Status
                                            </th>
                                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        <tr className="border-b border-slate-50 bg-white transition-colors hover:bg-slate-50/70">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-[11px] font-black text-[#0AC4E0]">
                                                        {String(kepalaSekolah.nama || "K").charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-800">
                                                            {kepalaSekolah.nama || "-"}
                                                        </p>
                                                        <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
                                                            Role Kepala Sekolah
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                                    <Mail size={12} className="text-slate-300" />
                                                    {kepalaSekolah.email || "-"}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-[10px] font-bold text-slate-500">
                                                {kepalaSekolah.jabatan || "Kepala Sekolah"}
                                            </td>

                                            <td className="px-6 py-4 text-[10px] font-bold text-slate-500">
                                                {kepalaSekolah.sekolah?.nama_sekolah || sekolahDetail?.nama_sekolah || "-"}
                                            </td>

                                            <td className="px-6 py-4">
                                                <StatusBadge active={getKepsekActive(kepalaSekolah)} />
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {isOperator && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={handleEditKepsek}
                                                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-[#0AC4E0] transition hover:bg-[#0AC4E0] hover:text-white"
                                                                title="Edit Akun"
                                                            >
                                                                <Pencil size={14} />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={handleResetPasswordKepsek}
                                                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-500 transition hover:bg-amber-500 hover:text-white"
                                                                title="Reset Password"
                                                            >
                                                                <KeyRound size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : list.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-4 rounded-[2rem] border border-dashed border-slate-200 bg-white py-24">
                        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-50">
                            <Users size={34} className="text-[#0AC4E0]" />
                        </div>

                        <div className="text-center">
                            <p className="text-sm font-black text-slate-700">
                                Belum ada guru terdaftar.
                            </p>
                            <p className="mt-1 text-xs font-semibold text-slate-400">
                                {isOperator
                                    ? "Tambahkan guru assessment untuk sekolah ini."
                                    : "Belum ada guru assessment aktif pada sekolah ini."}
                            </p>
                        </div>

                        {isOperator && (
                            <AppButton
                                type="button"
                                onClick={handleCreateGuru}
                                icon={<Plus size={13} />}
                                variant="accent"
                                className="!rounded-full hover:!bg-cyan-500"
                            >
                                Tambah Guru
                            </AppButton>
                        )}
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white shadow-sm">
                        <div className="flex flex-col gap-1 border-b border-slate-100 bg-slate-50 px-6 py-5">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0AC4E0]">
                                Data Guru
                            </p>
                            <p className="text-sm font-bold text-slate-500">
                                Menampilkan {filteredList.length} dari {list.length} guru terdaftar pada sekolah ini.
                            </p>
                        </div>

                        <div className="border-b border-slate-100 bg-white px-6 py-5">
                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                <div className="space-y-2">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                        Status
                                    </p>
                                    <Dropdown
                                        value={filters.status}
                                        onChange={(value) => handleFilterChange("status", value)}
                                        placeholder="Semua Status"
                                        items={[
                                            { label: "Semua Status", value: "semua" },
                                            { label: "Aktif", value: "aktif" },
                                            { label: "Nonaktif", value: "nonaktif" },
                                        ]}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                        Kelas
                                    </p>
                                    <Dropdown
                                        value={filters.kelas}
                                        onChange={(value) => handleFilterChange("kelas", value)}
                                        placeholder="Semua Kelas"
                                        items={kelasOptions}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                        Jurusan
                                    </p>
                                    <Dropdown
                                        value={filters.jurusan}
                                        onChange={(value) => handleFilterChange("jurusan", value)}
                                        placeholder="Semua Jurusan"
                                        items={jurusanOptions}
                                        disabled={!isSmk}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                        Bidang Studi
                                    </p>
                                    <div className="flex gap-2">
                                        <Dropdown
                                            value={filters.bidangStudi}
                                            onChange={(value) => handleFilterChange("bidangStudi", value)}
                                            placeholder="Semua Bidang"
                                            items={[
                                                { label: "Semua Bidang", value: "semua" },
                                                { label: "Akademik", value: "akademik" },
                                                { label: "Kejuruan", value: "kejuruan" },
                                            ]}
                                        />

                                        {hasActiveFilter && (
                                            <AppButton
                                                type="button"
                                                onClick={resetFilters}
                                                variant="secondary"
                                                size="sm"
                                                className="shrink-0 !border-slate-100 !bg-slate-50 !text-slate-400 hover:!border-[#0AC4E0]/30 hover:!bg-cyan-50 hover:!text-[#0AC4E0]"
                                            >
                                                Reset
                                            </AppButton>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1080px] text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-white">
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                            No
                                        </th>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                            Nama Guru
                                        </th>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                            Email
                                        </th>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                            Kontak
                                        </th>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                            Mata Pelajaran
                                                    </th>
                                        {isSmk && (
                                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                Jurusan
                                            </th>
                                                    )}
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                            Login Terakhir
                                        </th>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredList.map((item, idx) => {
                                        const active = getGuruActive(item);
                                        const guruId = getGuruId(item);
                                        const rowLoading = Boolean(actionLoading[guruId]);

                                        return (
                                            <tr
                                                key={guruId || idx}
                                                className="border-b border-slate-50 bg-white transition-colors hover:bg-slate-50/70"
                                            >
                                                <td className="px-6 py-4 text-[10px] font-bold text-slate-400">
                                                    {idx + 1}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-[11px] font-black text-[#0AC4E0]">
                                                            {getGuruName(item)?.charAt(0)?.toUpperCase() || "G"}
                                                        </div>

                                                        <div>
                                                            <p className="text-xs font-black text-slate-800">
                                                                {getGuruName(item)}
                                                            </p>
                                                            <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
                                                                {getGuruSubLabel(item)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                                        <Mail size={12} className="text-slate-300" />
                                                        {getGuruEmail(item)}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                                        <Phone size={12} className="text-slate-300" />
                                                        {getGuruPhone(item)}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 text-[10px] font-bold text-slate-500">
                                                    {getGuruMapel(item)}
                                                </td>

                                                {isSmk && (
                                                    <td className="px-6 py-4 text-[10px] font-bold text-slate-500">
                                                        {getGuruJurusanLabel(item)}
                                                    </td>
                                                )}

                                                <td className="px-6 py-4">
                                                    <StatusBadge active={active} />
                                                </td>

                                                <td className="px-6 py-4 text-[10px] font-bold text-slate-400">
                                                    {formatDate(item.last_login_at)}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDetailGuru(item)}
                                                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 transition hover:text-[#0AC4E0]"
                                                            title="Detail"
                                                        >
                                                            <Eye size={14} />
                                                        </button>

                                                        {isOperator && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleEditGuru(item)}
                                                                    disabled={rowLoading}
                                                                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-[#0AC4E0] transition hover:bg-[#0AC4E0] hover:text-white disabled:opacity-50"
                                                                    title="Edit"
                                                                >
                                                                    <Pencil size={14} />
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleToggleGuruStatus(item)}
                                                                    disabled={rowLoading}
                                                                    className={`flex h-9 w-9 items-center justify-center rounded-xl transition disabled:opacity-50 ${active
                                                                        ? "bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white"
                                                                        : "bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                                                                        }`}
                                                                    title={active ? "Nonaktifkan" : "Aktifkan"}
                                                                >
                                                                    {active ? (
                                                                        <PowerOff size={14} />
                                                                    ) : (
                                                                        <Power size={14} />
                                                                    )}
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteGuru(item)}
                                                                    disabled={rowLoading}
                                                                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-500 transition hover:bg-rose-500 hover:text-white disabled:opacity-50"
                                                                    title="Hapus"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {filteredList.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={isSmk ? 9 : 8}
                                                className="px-6 py-16 text-center text-[10px] font-black uppercase tracking-widest text-slate-300"
                                            >
                                                Tidak ada guru yang sesuai dengan filter.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </MasterPageShell>
    );
}
