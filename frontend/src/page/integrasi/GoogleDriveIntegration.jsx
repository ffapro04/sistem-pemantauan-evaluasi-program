/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
    AlertCircle,
    CheckCircle2,
    ExternalLink,
    FileUp,
    Loader2,
    Mail,
    RefreshCw,
    ShieldCheck,
    Unlink,
    UploadCloud,
    UserRound,
} from "lucide-react";
import { showConfirmDialog } from "../../utils/popup";

import Sidebar from "../../components/Sidebar";
import { GoogleDriveLogo } from "../../components/ui";

const API_BASE_URL = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    ""
).replace(/\/$/, "");

const GoogleDriveIntegration = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [status, setStatus] = useState({
        connected: false,
        google_email: null,
        google_name: null,
        owner_type: null,
        connected_at: null,
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(null);

    const token = useMemo(() => localStorage.getItem("token"), []);

    const authHeaders = useMemo(
        () => ({
            Authorization: `Bearer ${token}`,
        }),
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

    const fetchStatus = useCallback(
        async ({ silent = false } = {}) => {
            if (!checkAuth()) return;

            if (!silent) setLoading(true);

            try {
                const response = await fetch(`${API_BASE_URL}/google-drive/status`, {
                    method: "GET",
                    headers: authHeaders,
                });

                const payload = await response.json().catch(() => ({}));

                if (!response.ok) {
                    throw new Error(payload?.message || "Gagal memuat status Google Drive.");
                }

                setStatus(payload);
            } catch (error) {
                toast.error(error.message || "Gagal memuat status Google Drive.");
            } finally {
                if (!silent) setLoading(false);
            }
        },
        [authHeaders, checkAuth],
    );

    useEffect(() => {
        fetchStatus();

        const googleDriveParam = searchParams.get("googleDrive");
        const driveParam = searchParams.get("drive");

        if (googleDriveParam === "connected" || driveParam === "connected") {
            toast.success("Google Drive berhasil dihubungkan.");
            setSearchParams({});
        }
    }, [fetchStatus, searchParams, setSearchParams]);

    const handleConnect = async () => {
        if (!checkAuth()) return;

        setConnecting(true);

        try {
            const redirectTo = "/integrasi/google-drive";

            const response = await fetch(
                `${API_BASE_URL}/google-drive/auth-url?redirectTo=${encodeURIComponent(
                    redirectTo,
                )}`,
                {
                    method: "GET",
                    headers: authHeaders,
                },
            );

            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(payload?.message || "Gagal membuat URL Google Drive.");
            }

            if (!payload?.url) {
                throw new Error("URL Google Drive tidak ditemukan dari backend.");
            }

            window.location.href = payload.url;
        } catch (error) {
            toast.error(error.message || "Gagal menghubungkan Google Drive.");
            setConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        if (!checkAuth()) return;

        const confirmed = await showConfirmDialog({
            title: "Putuskan Google Drive?",
            text: "Koneksi Google Drive akan dilepas dari akun ini.",
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
                throw new Error(payload?.message || "Gagal memutus koneksi Google Drive.");
            }

            toast.success(payload?.message || "Koneksi Google Drive berhasil diputuskan.");
            setUploadedFile(null);
            setSelectedFile(null);
            await fetchStatus({ silent: true });
        } catch (error) {
            toast.error(error.message || "Gagal memutus koneksi Google Drive.");
        } finally {
            setDisconnecting(false);
        }
    };

    const handleUploadTest = async () => {
        if (!checkAuth()) return;

        if (!status.connected) {
            toast.warning("Hubungkan Google Drive terlebih dahulu.");
            return;
        }

        if (!selectedFile) {
            toast.warning("Pilih file test terlebih dahulu.");
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("moduleType", "GENERAL");
            formData.append("relatedTable", "frontend_test");
            formData.append("relatedId", "1");

            const response = await fetch(`${API_BASE_URL}/google-drive/upload`, {
                method: "POST",
                headers: authHeaders,
                body: formData,
            });

            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(payload?.message || "Upload test ke Google Drive gagal.");
            }

            setUploadedFile(payload?.file || null);
            toast.success("File test berhasil diupload ke Google Drive.");
        } catch (error) {
            toast.error(error.message || "Upload test ke Google Drive gagal.");
        } finally {
            setUploading(false);
        }
    };

    const connectedAtLabel = status?.connected_at
        ? new Date(status.connected_at).toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
        })
        : "-";

    return (
        <div className="flex min-h-screen bg-slate-50 font-inter text-slate-900">
            <Sidebar />

            <main className="min-h-screen flex-1 overflow-y-auto px-5 py-8 sm:px-8 lg:px-10">
                <div className="mx-auto max-w-6xl">
                    <section className="relative overflow-hidden rounded-[2rem] border border-cyan-100 bg-white p-7 shadow-[0_24px_70px_rgba(15,23,42,0.07)] sm:p-9">
                        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#0AC4E0]/15 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-28 left-10 h-72 w-72 rounded-full bg-cyan-100/70 blur-3xl" />

                        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#0AC4E0]">
                                    <GoogleDriveLogo size={17} />
                                    Integrasi Akun
                                </div>

                                <h1 className="mt-5 max-w-3xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                                    Google Drive Integration
                                </h1>

                                <p className="mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-slate-500">
                                    Hubungkan akun Google Drive agar sistem dapat menyimpan dokumen
                                    program, bukti kegiatan, dan file pendukung secara terstruktur.
                                </p>
                            </div>

                            <div
                                className={`rounded-[1.5rem] border px-5 py-4 text-sm font-black shadow-sm ${status.connected
                                        ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                                        : "border-amber-100 bg-amber-50 text-amber-700"
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    {status.connected ? (
                                        <CheckCircle2 size={18} />
                                    ) : (
                                        <AlertCircle size={18} />
                                    )}
                                    {status.connected ? "Terhubung" : "Belum Terhubung"}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="mt-7 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm sm:p-7">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <h2 className="text-xl font-black tracking-tight text-slate-950">
                                        Status Koneksi
                                    </h2>
                                    <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-500">
                                        Status ini dibaca langsung dari backend berdasarkan akun
                                        aplikasi yang sedang login.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => fetchStatus()}
                                    disabled={loading}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-500 shadow-sm transition hover:border-cyan-100 hover:bg-cyan-50 hover:text-[#0AC4E0] disabled:opacity-60"
                                >
                                    {loading ? (
                                        <Loader2 size={15} className="animate-spin" />
                                    ) : (
                                        <RefreshCw size={15} />
                                    )}
                                    Refresh
                                </button>
                            </div>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#0AC4E0] shadow-sm">
                                            <Mail size={18} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black uppercase tracking-[0.24em] text-slate-400">
                                                Google Email
                                            </p>
                                            <p className="mt-1 break-all text-sm font-black text-slate-900">
                                                {status.google_email || "-"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#0AC4E0] shadow-sm">
                                            <UserRound size={18} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black uppercase tracking-[0.24em] text-slate-400">
                                                Google Name
                                            </p>
                                            <p className="mt-1 break-words text-sm font-black text-slate-900">
                                                {status.google_name || "-"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#0AC4E0] shadow-sm">
                                            <ShieldCheck size={18} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black uppercase tracking-[0.24em] text-slate-400">
                                                Owner Type
                                            </p>
                                            <p className="mt-1 text-sm font-black text-slate-900">
                                                {status.owner_type || "-"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#0AC4E0] shadow-sm">
                                            <CheckCircle2 size={18} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black uppercase tracking-[0.24em] text-slate-400">
                                                Connected At
                                            </p>
                                            <p className="mt-1 text-sm font-black text-slate-900">
                                                {connectedAtLabel}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                                {!status.connected ? (
                                    <button
                                        type="button"
                                        onClick={handleConnect}
                                        disabled={connecting}
                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0AC4E0] px-5 py-3.5 text-sm font-black uppercase tracking-widest text-white shadow-[0_18px_40px_rgba(10,196,224,0.28)] transition hover:bg-[#09b4ce] active:scale-[0.99] disabled:opacity-60"
                                    >
                                        {connecting ? (
                                            <Loader2 size={17} className="animate-spin" />
                                        ) : (
                                            <GoogleDriveLogo size={18} />
                                        )}
                                        Hubungkan Google Drive
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleDisconnect}
                                        disabled={disconnecting}
                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-rose-500 px-5 py-3.5 text-sm font-black uppercase tracking-widest text-white shadow-[0_18px_40px_rgba(244,63,94,0.22)] transition hover:bg-rose-600 active:scale-[0.99] disabled:opacity-60"
                                    >
                                        {disconnecting ? (
                                            <Loader2 size={17} className="animate-spin" />
                                        ) : (
                                            <Unlink size={17} />
                                        )}
                                        Putuskan Koneksi
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm sm:p-7">
                            <div className="flex items-start gap-3">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-[#0AC4E0]">
                                    <UploadCloud size={21} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black tracking-tight text-slate-950">
                                        Test Upload
                                    </h2>
                                    <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-500">
                                        Gunakan ini hanya untuk memastikan upload dari frontend ke
                                        Google Drive sudah berjalan.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-5">
                                <input
                                    type="file"
                                    onChange={(event) => {
                                        setSelectedFile(event.target.files?.[0] || null);
                                        setUploadedFile(null);
                                    }}
                                    className="block w-full cursor-pointer rounded-2xl border border-slate-100 bg-white p-3 text-xs font-bold text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-[#0AC4E0] file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-widest file:text-white"
                                />

                                {selectedFile && (
                                    <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
                                        <FileUp className="shrink-0 text-[#0AC4E0]" size={18} />
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-black text-slate-900">
                                                {selectedFile.name}
                                            </p>
                                            <p className="mt-1 text-[10px] font-bold text-slate-400">
                                                {(selectedFile.size / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={handleUploadTest}
                                    disabled={uploading || !status.connected}
                                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-black uppercase tracking-widest text-white transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300"
                                >
                                    {uploading ? (
                                        <Loader2 size={17} className="animate-spin" />
                                    ) : (
                                        <UploadCloud size={17} />
                                    )}
                                    Upload Test
                                </button>
                            </div>

                            {uploadedFile?.web_view_link && (
                                <a
                                    href={uploadedFile.web_view_link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-5 flex items-center justify-between gap-3 rounded-[1.5rem] border border-emerald-100 bg-emerald-50 p-4 text-sm font-black text-emerald-700 transition hover:bg-emerald-100"
                                >
                                    <span className="truncate">
                                        Lihat file: {uploadedFile.original_name}
                                    </span>
                                    <ExternalLink size={17} />
                                </a>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default GoogleDriveIntegration;
