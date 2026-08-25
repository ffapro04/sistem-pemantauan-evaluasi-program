/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import {
    ClipboardList,
    RefreshCw,
    CheckCircle2,
    PenLine,
    AlertCircle,
    School,
} from "lucide-react";
import MasterPageShell from "../../components/masterCrud/MasterPageShell";
import MasterAlert from "../../components/masterCrud/MasterAlert";
import { getAuthToken, getAuthUser } from "../../utils/authSession";

import { API_BASE_URL as BASE_URL } from "../../config/apiBase.js";
const ROWS_PER_PAGE = 8;

const STATUS_MAP = {
    draft: {
        label: "Draft",
        color: "bg-slate-100 text-slate-500",
    },
    sent: {
        label: "Terkirim",
        color: "bg-cyan-50 text-[#0AC4E0]",
    },
    done: {
        label: "Selesai",
        color: "bg-emerald-50 text-emerald-600",
    },

    "Siap Diajukan": {
        label: "Siap Diajukan",
        color: "bg-slate-100 text-slate-500",
    },
    "Proses Pengisian": {
        label: "Proses Pengisian",
        color: "bg-amber-50 text-amber-600",
    },
    Terkirim: {
        label: "Terkirim",
        color: "bg-cyan-50 text-[#0AC4E0]",
    },
    Selesai: {
        label: "Selesai",
        color: "bg-emerald-50 text-emerald-600",
    },
};

const getStoredUser = () => {
    try {
        const raw = getAuthUser();
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const getTokenUser = () => {
    try {
        const token = getAuthToken();
        return token ? jwtDecode(token) : null;
    } catch {
        return null;
    }
};

const getCurrentUser = () => {
    return getStoredUser() || getTokenUser() || {};
};

const getSekolahId = (user = {}) => {
    return (
        user?.id_sekolah ||
        user?.sekolah?.id_sekolah ||
        user?.sekolah?.id ||
        ""
    );
};

const isOperatorSekolah = (user = {}) => {
    const idRole = Number(user?.id_role || user?.role_id || 0);
    const role = String(user?.role || user?.nama_role || "").toLowerCase();
    const jabatan = String(user?.jabatan || "").toLowerCase();

    return (
        idRole === 5 ||
        idRole === 9 ||
        role.includes("operator") ||
        jabatan.includes("operator sekolah") ||
        jabatan.includes("operator")
    );
};

const isGuruAssessment = (user = {}) => {
    return Number(user?.id_role || 0) === 8;
};

const isSekolahBiasa = (user = {}) => {
    return Number(user?.id_role || 0) === 5 && !isOperatorSekolah(user);
};

const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const getAssessmentName = (item = {}) => {
    return (
        item.nama ||
        item.nama_assessment ||
        item.judul ||
        item.title ||
        "Assessment"
    );
};

const getAssessmentJenis = (item = {}) => {
    const raw = String(
        item.jenis ||
        item.kategori ||
        item.jenis_assessment ||
        item.assessment_jenis ||
        item.type ||
        "",
    )
        .trim()
        .toLowerCase();

    const name = String(getAssessmentName(item)).toLowerCase();

    if (raw.includes("non") || name.includes("non akademik")) {
        return "Non Akademik";
    }

    if (raw.includes("akademik")) {
        return "Akademik";
    }

    // Karena endpoint sekolah saat ini belum mengirim field jenis,
    // default ditampilkan sebagai Akademik.
    return "Akademik";
};

const getAssessmentJenisClass = (jenis = "") => {
    const value = String(jenis).toLowerCase();

    if (value.includes("non")) {
        return "bg-orange-50 text-orange-500";
    }

    return "bg-violet-50 text-violet-500";
};

const getAssessmentId = (item = {}) => {
    return item.id_assessment || item.id || item.assessment_id || "";
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const getAssessmentStartDate = (item = {}) => {
    return (
        item.sent_at ||
        item.tanggal_kirim ||
        item.created_at ||
        item.createdAt ||
        item.created_date ||
        null
    );
};

const getAssessmentDeadlineDate = (item = {}) => {
    if (item.deadline || item.tanggal_tenggat || item.due_date) {
        const fixedDeadline = new Date(
            item.deadline || item.tanggal_tenggat || item.due_date,
        );

        return Number.isNaN(fixedDeadline.getTime()) ? null : fixedDeadline;
    }

    const startDate = getAssessmentStartDate(item);
    const tenggat = Number(item.tenggat || 0);

    if (!startDate || !tenggat) return null;

    const deadline = new Date(startDate);

    if (Number.isNaN(deadline.getTime())) return null;

    deadline.setDate(deadline.getDate() + tenggat);

    return deadline;
};

const getAssessmentDeadline = (item = {}) => {
    if (item.sisa_hari !== undefined && item.sisa_hari !== null) {
        const remaining = Math.max(0, Number(item.sisa_hari));
        return remaining === 0 ? "Tenggat selesai" : `${remaining} hari lagi`;
    }

    const deadline = getAssessmentDeadlineDate(item);

    if (!deadline) {
        if (item.tenggat) return `${item.tenggat} hari`;
        return "-";
    }

    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const sisaHari = Math.max(0, Math.ceil(diff / MS_PER_DAY));

    return sisaHari === 0 ? "Tenggat selesai" : `${sisaHari} hari lagi`;
};

const isAssessmentExpired = (item = {}) => {
    if (item.is_expired !== undefined && item.is_expired !== null) {
        return Boolean(item.is_expired);
    }

    if (item.sisa_hari !== undefined && item.sisa_hari !== null) {
        return Number(item.sisa_hari) <= 0;
    }

    const deadline = getAssessmentDeadlineDate(item);
    return Boolean(deadline && Date.now() > deadline.getTime());
};

const getAssessmentStatus = (item = {}) => {
    if (item.sudah_diisi || isAssessmentExpired(item)) {
        return "Selesai";
    }

    return item.status_display || item.status;
};

export default function AssessmentSekolah() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [list, setList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [note, setNote] = useState({
        show: false,
        type: null,
        message: "",
    });

    const operatorSekolah = isOperatorSekolah(user);
    const guruAssessment = isGuruAssessment(user);
    const sekolahBiasa = isSekolahBiasa(user);

    // Operator Sekolah dan Sekolah biasa hanya melihat daftar.
    // Guru Assessment saja yang boleh mengisi.
    const canFillAssessment = guruAssessment;

    useEffect(() => {
        const currentUser = getCurrentUser();

        if (!currentUser?.id_role) {
            navigate("/login");
            return;
        }

        setUser(currentUser);
    }, [navigate]);

    const fetchData = useCallback(async () => {
        if (!user) return;

        const idSekolah = getSekolahId(user);

        if (!idSekolah) {
            setNote({
                show: true,
                type: "error",
                message: "ID sekolah tidak terbaca. Silakan login ulang.",
            });
            return;
        }

        setLoading(true);

        try {
            const token = getAuthToken();

            const guruId =
                user?.id_guru_assessment ||
                user?.sub ||
                user?.id_user ||
                "";

            const queryGuru = guruAssessment && guruId ? `?id_user=${guruId}` : "";

            const { data } = await axios.get(
                `${BASE_URL}/assessment/sekolah/${idSekolah}${queryGuru}`,
                {
                    headers: token
                        ? {
                            Authorization: `Bearer ${token}`,
                        }
                        : {},
                },
            );

            const result = Array.isArray(data) ? data : data?.data ?? [];

            setList(result);
            setCurrentPage(1);
        } catch (error) {
            console.error("FETCH ASSESSMENT SEKOLAH ERROR:", error);

            setNote({
                show: true,
                type: "error",
                message: "Gagal memuat data assessment.",
            });
        } finally {
            setLoading(false);
        }
    }, [user, guruAssessment]);

    useEffect(() => {
        if (user) fetchData();
    }, [user, fetchData]);

    const totalPages = Math.max(1, Math.ceil(list.length / ROWS_PER_PAGE));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const pageStartIndex = (safeCurrentPage - 1) * ROWS_PER_PAGE;
    const pageEndIndex = Math.min(pageStartIndex + ROWS_PER_PAGE, list.length);
    const paginatedList = list.slice(pageStartIndex, pageEndIndex);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const statusBadge = (status) => {
        const s =
            STATUS_MAP[status] ?? {
                label: status || "-",
                color: "bg-slate-100 text-slate-500",
            };

        return (
            <span
                className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${s.color}`}
            >
                {s.label}
            </span>
        );
    };

    const renderRoleInfo = () => {
        if (operatorSekolah) {
            return (
                <div className="mb-6 flex items-center gap-3 rounded-2xl border border-cyan-100 bg-cyan-50 px-5 py-3.5">
                    <AlertCircle
                        size={15}
                        className="shrink-0 text-[#0AC4E0]"
                    />
                    <p className="text-[10px] font-bold text-[#0AC4E0]">
                        Sebagai Operator Sekolah, Anda hanya dapat memantau
                        daftar assessment. Pengisian assessment dilakukan oleh
                        Guru Assessment.
                    </p>
                </div>
            );
        }

        if (sekolahBiasa) {
            return (
                <div className="mb-6 flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3.5">
                    <School size={15} className="shrink-0 text-slate-400" />
                    <p className="text-[10px] font-bold text-slate-500">
                        Akun sekolah hanya dapat melihat daftar assessment yang
                        dikirim ke sekolah.
                    </p>
                </div>
            );
        }

        if (guruAssessment) {
            return (
                <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-3.5">
                    <CheckCircle2
                        size={15}
                        className="shrink-0 text-emerald-500"
                    />
                    <p className="text-[10px] font-bold text-emerald-600">
                        Anda login sebagai Guru Assessment. Silakan isi
                        assessment yang tersedia.
                    </p>
                </div>
            );
        }

        return null;
    };

    return (
        <MasterPageShell
            title="Assessment"
            highlight="Sekolah"
            subtitle="Sistem Monitoring dan Evaluasi Program"
            contentClassName="bg-[#EEF5FF]"
            action={
                <button
                    type="button"
                    onClick={fetchData}
                    className="flex items-center gap-2 rounded-full border border-slate-100 bg-white px-5 py-2.5 text-[9px] font-black uppercase text-slate-400 shadow-sm transition-all hover:text-slate-700 active:scale-95"
                >
                    <RefreshCw
                        size={12}
                        className={loading ? "animate-spin" : ""}
                    />
                    Refresh
                </button>
            }
        >
            <MasterAlert note={note} setNote={setNote} />

            <div className="h-full overflow-y-auto no-scrollbar px-6 py-6 md:px-8">
                {renderRoleInfo()}

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
                    <div className="flex flex-col items-center justify-center gap-3 py-24">
                        <ClipboardList size={40} className="text-slate-200" />
                        <p className="text-xs font-bold text-slate-400">
                            Belum ada assessment yang dikirim ke sekolah ini.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-[1.35rem] border border-slate-100 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.04)]">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 bg-[#0AC4E0]">
                                    <th className="w-14 px-3 py-3.5 text-center text-[9px] font-black uppercase tracking-widest text-white">
                                        No
                                    </th>
                                    <th className="px-5 py-3.5 text-[9px] font-black uppercase tracking-widest text-white">
                                        Nama Assessment
                                    </th>
                                    <th className="px-5 py-3.5 text-[9px] font-black uppercase tracking-widest text-white">
                                        Jenis
                                    </th>
                                    <th className="px-5 py-3.5 text-[9px] font-black uppercase tracking-widest text-white">
                                        Status
                                    </th>
                                    <th className="px-5 py-3.5 text-[9px] font-black uppercase tracking-widest text-white">
                                        Tenggat
                                    </th>

                                    {canFillAssessment && (
                                        <th className="px-5 py-3.5 text-[9px] font-black uppercase tracking-widest text-white">
                                            Aksi
                                        </th>
                                    )}
                                </tr>
                            </thead>

                            <tbody>
                                {paginatedList.map((item, idx) => {
                                    const idAssessment = getAssessmentId(item);
                                    const jenis = getAssessmentJenis(item);

                                    return (
                                        <tr
                                            key={idAssessment || idx}
                                            className="border-b border-slate-50 bg-white transition-colors hover:bg-slate-50/50"
                                        >
                                            <td className="w-14 px-3 py-4 text-center text-[10px] font-bold text-slate-400">
                                                {pageStartIndex + idx + 1}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex min-w-0 flex-col">
                                                    <p className="text-[13px] font-black text-slate-950">
                                                        {getAssessmentName(item)}
                                                    </p>
                                                    <p className="mt-1 text-[9px] font-bold text-slate-400">
                                                        ID:{" "}
                                                        {idAssessment || "-"}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${getAssessmentJenisClass(
                                                        jenis,
                                                    )}`}
                                                >
                                                    {jenis}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                {statusBadge(getAssessmentStatus(item))}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-600">
                                                        {getAssessmentDeadline(item)}
                                                    </span>
                                                    <span className="mt-1 text-[9px] font-bold text-slate-400">
                                                        Deadline: {formatDate(getAssessmentDeadlineDate(item))}
                                                    </span>
                                                </div>
                                            </td>

                                            {canFillAssessment && (
                                                <td className="px-5 py-4">
                                                    {item.sudah_diisi || isAssessmentExpired(item) ? (
                                                        <button
                                                            type="button"
                                                            disabled
                                                            className="flex cursor-not-allowed items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-2 text-[9px] font-black uppercase text-emerald-600 ring-1 ring-emerald-100"
                                                        >
                                                            <CheckCircle2 size={11} />
                                                            Selesai
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                navigate(`/sekolah/assessment/isi/${idAssessment}`)
                                                            }
                                                            className="flex items-center gap-1.5 rounded-full bg-[#0AC4E0] px-4 py-2 text-[9px] font-black uppercase text-white shadow-sm shadow-cyan-100 transition-all hover:bg-cyan-500 active:scale-95"
                                                        >
                                                            <PenLine size={11} />
                                                            Isi
                                                        </button>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                Menampilkan {pageStartIndex + 1}-{pageEndIndex} dari {list.length} assessment
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={safeCurrentPage <= 1}
                                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                    className="rounded-full border border-slate-100 bg-white px-4 py-2 text-[9px] font-black uppercase tracking-widest text-slate-500 shadow-sm transition hover:border-cyan-100 hover:text-[#0AC4E0] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Prev
                                </button>

                                <span className="rounded-full bg-[#0AC4E0] px-4 py-2 text-[9px] font-black uppercase tracking-widest text-white shadow-sm shadow-cyan-100">
                                    {safeCurrentPage} / {totalPages}
                                </span>

                                <button
                                    type="button"
                                    disabled={safeCurrentPage >= totalPages}
                                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                    className="rounded-full border border-slate-100 bg-white px-4 py-2 text-[9px] font-black uppercase tracking-widest text-slate-500 shadow-sm transition hover:border-cyan-100 hover:text-[#0AC4E0] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MasterPageShell>
    );
}
