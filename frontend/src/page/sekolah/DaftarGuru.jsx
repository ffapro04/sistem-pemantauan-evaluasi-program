/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
    BookOpen,
    CheckCircle2,
    Eye,
    GraduationCap,
    Mail,
    Pencil,
    Phone,
    Plus,
    RefreshCw,
    Users,
    XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import MasterPageShell from "../../components/masterCrud/MasterPageShell";
import MasterAlert from "../../components/masterCrud/MasterAlert";

const BASE_URL =
    import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "";

function decodeUser() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        return jwtDecode(token);
    } catch {
        return null;
    }
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

function getGuruJurusanLabel(item) {
    return (
        item?.jurusan_data?.nama_jurusan ||
        item?.jurusan_data?.kode_jurusan ||
        item?.nama_jurusan ||
        item?.kode_jurusan ||
        item?.jurusan ||
        "-"
    );
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

export default function DaftarGuru() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [sekolahDetail, setSekolahDetail] = useState(null);
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [note, setNote] = useState({
        show: false,
        type: null,
        message: "",
    });

    const idSekolah = getSchoolId(user);
    const isOperator = isOperatorSekolah(user);
    const isSmk = getJenjang(user, sekolahDetail) === "SMK";

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
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const guruEndpoint = isOperator
                ? `${BASE_URL}/assessment-guru/sekolah/${idSekolah}`
                : `${BASE_URL}/assessment-guru/sekolah/${idSekolah}/aktif`;

            const [guruResponse, sekolahResponse] = await Promise.allSettled([
                axios.get(guruEndpoint, { headers }),
                axios.get(`${BASE_URL}/sekolah/${idSekolah}`, { headers }),
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

    const handleCreate = () => {
        if (!isOperator) return;
        navigate("/sekolah/guru/create");
    };

    const handleEdit = (item) => {
        if (!isOperator) return;

        const id = getGuruId(item);
        if (!id) return;

        navigate(`/sekolah/guru/edit/${id}`);
    };

    const handleDetail = (item) => {
        const id = getGuruId(item);
        if (!id) return;

        navigate(`/sekolah/guru/detail/${id}`);
    };

    return (
        <MasterPageShell
            title="Daftar"
            highlight="Guru"
            subtitle={
                isOperator
                    ? "Kelola data guru assessment pada sekolah operator."
                    : "Daftar guru assessment aktif pada sekolah Anda."
            }
            action={
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={fetchData}
                        className="flex items-center gap-2 rounded-full border border-slate-100 bg-white px-5 py-2.5 text-[9px] font-black uppercase tracking-widest text-slate-400 shadow-sm transition-all hover:text-slate-700 active:scale-95"
                    >
                        <RefreshCw
                            size={12}
                            className={loading ? "animate-spin" : ""}
                        />
                        Refresh
                    </button>

                    {isOperator && (
                        <button
                            type="button"
                            onClick={handleCreate}
                            className="flex items-center gap-2 rounded-full bg-[#0AC4E0] px-5 py-2.5 text-[9px] font-black uppercase tracking-widest text-white shadow-sm transition-all hover:bg-cyan-500 active:scale-95"
                        >
                            <Plus size={12} />
                            Tambah Guru
                        </button>
                    )}
                </div>
            }
        >
            <MasterAlert note={note} setNote={setNote} />

            <div className="h-full overflow-y-auto no-scrollbar px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-24">
                        <RefreshCw
                            size={28}
                            className="animate-spin text-[#0AC4E0]"
                        />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Memuat data...
                        </p>
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
                            <button
                                type="button"
                                onClick={handleCreate}
                                className="mt-2 flex items-center gap-2 rounded-full bg-[#0AC4E0] px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-sm transition-all hover:bg-cyan-500 active:scale-95"
                            >
                                <Plus size={13} />
                                Tambah Guru
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white shadow-sm">
                        <div className="flex flex-col gap-1 border-b border-slate-100 bg-slate-50 px-6 py-5">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0AC4E0]">
                                Data Guru
                            </p>
                            <p className="text-sm font-bold text-slate-500">
                                Total {list.length} guru terdaftar pada sekolah ini.
                            </p>
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
                                    {list.map((item, idx) => {
                                        const active = getGuruActive(item);

                                        return (
                                            <tr
                                                key={getGuruId(item) || idx}
                                                className="border-b border-slate-50 bg-white transition-colors hover:bg-slate-50/70"
                                            >
                                                <td className="px-6 py-4 text-[10px] font-bold text-slate-400">
                                                    {idx + 1}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-[11px] font-black text-[#0AC4E0]">
                                                            {getGuruName(item)
                                                                ?.charAt(0)
                                                                ?.toUpperCase() || "G"}
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

                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                                        <BookOpen size={12} className="text-slate-300" />
                                                        {getGuruMapel(item)}
                                                    </div>
                                                </td>

                                                {isSmk && (
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                                            <GraduationCap
                                                                size={12}
                                                                className="text-slate-300"
                                                            />
                                                            {getGuruJurusanLabel(item)}
                                                        </div>
                                                    </td>
                                                )}

                                                <td className="px-6 py-4">
                                                    {active ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-500">
                                                            <CheckCircle2 size={11} />
                                                            Aktif
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-rose-400">
                                                            <XCircle size={11} />
                                                            Nonaktif
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 text-[10px] font-bold text-slate-400">
                                                    {formatDate(item.last_login_at)}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDetail(item)}
                                                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 transition hover:text-[#0AC4E0]"
                                                            title="Detail"
                                                        >
                                                            <Eye size={14} />
                                                        </button>

                                                        {isOperator && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleEdit(item)}
                                                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-[#0AC4E0] transition hover:bg-[#0AC4E0] hover:text-white"
                                                                title="Edit"
                                                            >
                                                                <Pencil size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </MasterPageShell>
    );
}
