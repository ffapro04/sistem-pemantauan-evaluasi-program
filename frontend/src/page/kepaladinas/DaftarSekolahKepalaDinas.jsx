/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
import {
    Building2,
    Eye,
    Loader2,
    MapPin,
    RefreshCcw,
    School,
    Search,
    X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/Sidebar";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "";

function getTokenPayload(token) {
    try {
        return JSON.parse(atob(token.split(".")[1]));
    } catch {
        return {};
    }
}

function getCurrentUserId(decoded) {
    return (
        decoded?.id_user ||
        decoded?.id ||
        decoded?.sub ||
        decoded?.userId ||
        decoded?.user_id ||
        null
    );
}

function normalizeArray(payload) {
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.sekolah)) return payload.sekolah;
    if (Array.isArray(payload?.schools)) return payload.schools;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.result)) return payload.result;
    if (Array.isArray(payload?.results)) return payload.results;
    return [];
}

function normalizeObjectPayload(payload) {
    return payload?.data || payload?.user || payload || {};
}

function getWilayahListFromUser(user) {
    if (Array.isArray(user?.wilayah)) return user.wilayah;

    if (user?.wilayah && typeof user.wilayah === "object") {
        return [user.wilayah];
    }

    return [];
}

function getWilayahId(wilayah) {
    return (
        wilayah?.id_wilayah ||
        wilayah?.idWilayah ||
        wilayah?.wilayah_id ||
        wilayah?.id ||
        null
    );
}

function getWilayahName(wilayah) {
    if (Array.isArray(wilayah) && wilayah.length > 0) {
        return wilayah
            .map((item) => getWilayahName(item))
            .filter(Boolean)
            .join(", ");
    }

    return (
        wilayah?.nama_wilayah?.split("/")?.filter(Boolean)?.pop() ||
        wilayah?.namaWilayah ||
        wilayah?.nama ||
        wilayah?.name ||
        "Wilayah Otoritas"
    );
}

function getSchoolId(school) {
    return school?.id_sekolah || school?.idSekolah || school?.id;
}

function getSchoolName(school) {
    return school?.nama_sekolah || school?.namaSekolah || school?.nama || "Nama sekolah belum tersedia";
}

function getSchoolAddress(school) {
    return (
        school?.alamat ||
        school?.alamat_sekolah ||
        school?.address ||
        "Alamat belum tersedia"
    );
}

function getSchoolLevel(school) {
    return (
        school?.jenjang ||
        school?.jenjang_sekolah ||
        school?.tingkat ||
        school?.level ||
        "Sekolah"
    );
}

function getWilayahNameFromSchool(school) {
    return (
        school?.wilayah?.nama_wilayah?.split("/")?.filter(Boolean)?.pop() ||
        school?.wilayah?.namaWilayah ||
        school?.nama_wilayah ||
        school?.namaWilayah ||
        school?.nama_kabupaten ||
        "Wilayah"
    );
}

function getSchoolWilayahIds(school) {
    const wilayah = school?.wilayah || {};

    return [
        school?.id_wilayah,
        school?.idWilayah,
        school?.wilayah_id,
        school?.id_kabupaten,
        school?.idKabupaten,
        school?.kabupaten_id,
        wilayah?.id_wilayah,
        wilayah?.idWilayah,
        wilayah?.wilayah_id,
        wilayah?.id,
        wilayah?.id_parent,
        wilayah?.parent_id,
        wilayah?.parent?.id_wilayah,
        wilayah?.parent?.id,
    ]
        .filter(Boolean)
        .map(String);
}

function schoolBelongsToWilayah(school, wilayahIds) {
    const schoolWilayahIds = getSchoolWilayahIds(school);

    return schoolWilayahIds.some((id) => wilayahIds.includes(String(id)));
}

function SchoolCard({ school, onOpen }) {
    return (
        <article className="group overflow-hidden rounded-[1.6rem] border border-slate-100 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-cyan-100 hover:shadow-[0_24px_70px_rgba(10,196,224,0.12)]">
            <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-[#0AC4E0]">
                    <Building2 size={22} />
                </div>

                <span className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-[#0AC4E0]">
                    {getSchoolLevel(school)}
                </span>
            </div>

            <h2 className="mt-5 line-clamp-2 text-[16px] font-black uppercase leading-snug tracking-tight text-slate-900">
                {getSchoolName(school)}
            </h2>

            <p className="mt-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                NPSN: {school?.npsn || "-"} · {getWilayahNameFromSchool(school)}
            </p>

            <div className="mt-4 flex items-start gap-2 text-slate-400">
                <MapPin size={15} className="mt-0.5 shrink-0 text-[#0AC4E0]" />

                <p className="line-clamp-2 text-[12px] font-semibold leading-6">
                    {getSchoolAddress(school)}
                </p>
            </div>

            <button
                type="button"
                onClick={onOpen}
                className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#0AC4E0] text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-cyan-500 active:scale-[0.99]"
            >
                <Eye size={16} />
                Lihat Detail
            </button>
        </article>
    );
}

export default function DaftarSekolahKepalaDinas() {
    const navigate = useNavigate();

    const [schools, setSchools] = useState([]);
    const [wilayah, setWilayah] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const fetchSchools = async () => {
        setRefreshing(true);
        setErrorMessage("");

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setWilayah([]);
                setSchools([]);
                setErrorMessage("Token tidak ditemukan. Silakan login ulang.");
                return;
            }

            const decoded = getTokenPayload(token);
            const idUser = getCurrentUserId(decoded);

            if (!idUser) {
                setWilayah([]);
                setSchools([]);
                setErrorMessage("ID user tidak ditemukan pada token. Silakan login ulang.");
                return;
            }

            const headers = {
                Authorization: `Bearer ${token}`,
            };

            const [userResponse, schoolResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/users/${idUser}`, { headers }),
                fetch(`${API_BASE_URL}/sekolah`, { headers }),
            ]);

            const userPayload = await userResponse.json().catch(() => ({}));
            const schoolPayload = await schoolResponse.json().catch(() => ({}));

            if (!userResponse.ok) {
                throw new Error(userPayload?.message || "Gagal memuat data Kepala Dinas");
            }

            if (!schoolResponse.ok) {
                throw new Error(schoolPayload?.message || "Gagal memuat daftar sekolah");
            }

            const currentUser = normalizeObjectPayload(userPayload);
            const wilayahList = getWilayahListFromUser(currentUser);
            const wilayahIds = wilayahList
                .map((item) => getWilayahId(item))
                .filter(Boolean)
                .map(String);

            const allSchools = normalizeArray(schoolPayload);

            if (wilayahIds.length === 0) {
                setWilayah([]);
                setSchools([]);
                setErrorMessage(
                    "Akun Kepala Dinas belum memiliki wilayah. Silakan set wilayah lewat Admin > User."
                );
                return;
            }

            const visibleSchools = allSchools.filter((school) =>
                schoolBelongsToWilayah(school, wilayahIds),
            );

            setWilayah(wilayahList);
            setSchools(visibleSchools);
        } catch (error) {
            console.error("Daftar sekolah Kepala Dinas error:", error);
            setWilayah([]);
            setSchools([]);
            setErrorMessage(error.message || "Gagal memuat daftar sekolah.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchSchools();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredSchools = useMemo(() => {
        const keyword = searchValue.toLowerCase().trim();

        if (!keyword) return schools;

        return schools.filter((school) => {
            return [
                getSchoolName(school),
                getSchoolAddress(school),
                getSchoolLevel(school),
                getWilayahNameFromSchool(school),
                school?.npsn,
            ]
                .join(" ")
                .toLowerCase()
                .includes(keyword);
        });
    }, [schools, searchValue]);

    if (loading) {
        return (
            <div className="flex h-screen w-full overflow-hidden bg-[#F6F8FB]">
                <Sidebar />

                <main className="flex flex-1 items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-11 w-11 animate-spin text-[#0AC4E0]" />

                        <p className="text-[10px] font-black uppercase tracking-[0.26em] text-cyan-500/70">
                            Memuat Daftar Sekolah...
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <>
            <style>{`
                html, body {
                    background-color: #F6F8FB;
                    font-family: 'Poppins', sans-serif;
                }

                .kadin-scroll::-webkit-scrollbar {
                    width: 6px;
                }

                .kadin-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }

                .kadin-scroll::-webkit-scrollbar-thumb {
                    background: rgba(10, 196, 224, 0.35);
                    border-radius: 999px;
                }

                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>

            <div className="flex min-h-screen w-full bg-[#F6F8FB]">
                <Sidebar />

                <main className="kadin-scroll h-screen flex-1 overflow-y-auto p-6">
                    <header className="mb-6 overflow-hidden rounded-[1.9rem] border border-cyan-100 bg-white p-6 shadow-[0_24px_80px_rgba(10,196,224,0.10)]">
                        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                            <div className="flex items-start gap-5">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0AC4E0] text-white shadow-[0_16px_34px_rgba(10,196,224,0.25)]">
                                    <School size={24} />
                                </div>

                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-500/70">
                                        Dinas Pendidikan
                                    </p>

                                    <h1 className="mt-2 text-[28px] font-black leading-tight tracking-[-0.045em] text-slate-900">
                                        Daftar Sekolah
                                    </h1>

                                    <p className="mt-2 max-w-2xl text-[13px] font-semibold leading-6 text-slate-400">
                                        Menampilkan sekolah yang berada dalam wilayah otoritas Kepala Dinas.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={fetchSchools}
                                disabled={refreshing}
                                className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#0AC4E0] px-5 text-[11px] font-black uppercase tracking-widest text-white transition hover:bg-cyan-500 disabled:opacity-60"
                            >
                                <RefreshCcw
                                    size={15}
                                    className={refreshing ? "animate-spin" : ""}
                                />
                                Refresh
                            </button>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-center">
                            <div className="flex h-12 items-center gap-3 rounded-2xl border border-cyan-100 bg-cyan-50 px-4">
                                <Search size={17} className="text-[#0AC4E0]" />

                                <input
                                    value={searchValue}
                                    onChange={(event) => setSearchValue(event.target.value)}
                                    placeholder="Cari sekolah, NPSN, alamat, jenjang..."
                                    className="w-full bg-transparent text-[12px] font-bold text-slate-700 outline-none placeholder:text-cyan-500/45"
                                />

                                {searchValue && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchValue("")}
                                        className="flex h-7 w-7 items-center justify-center rounded-xl bg-white text-slate-400 hover:text-[#0AC4E0]"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

                            <div className="inline-flex h-12 items-center gap-3 rounded-2xl border border-cyan-100 bg-white px-5">
                                <MapPin size={17} className="text-[#0AC4E0]" />

                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                                    {getWilayahName(wilayah)}
                                </span>
                            </div>

                            <div className="inline-flex h-12 items-center gap-3 rounded-2xl border border-cyan-100 bg-white px-5">
                                <School size={17} className="text-[#0AC4E0]" />

                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                                    {filteredSchools.length}/{schools.length} Sekolah
                                </span>
                            </div>
                        </div>

                        {errorMessage && (
                            <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-[12px] font-bold text-red-500">
                                {errorMessage}
                            </div>
                        )}
                    </header>

                    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {filteredSchools.map((school) => (
                            <SchoolCard
                                key={getSchoolId(school) || getSchoolName(school)}
                                school={school}
                                onOpen={() =>
                                    navigate(`/kepala-dinas/sekolah/detail/${getSchoolId(school)}`)
                                }
                            />
                        ))}
                    </section>

                    {filteredSchools.length === 0 && (
                        <div className="flex h-[420px] flex-col items-center justify-center text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50 text-[#0AC4E0]">
                                <School size={28} />
                            </div>

                            <p className="mt-5 text-[13px] font-black uppercase tracking-widest text-slate-400">
                                Sekolah tidak ditemukan
                            </p>

                            <p className="mt-2 max-w-md text-[12px] font-semibold leading-6 text-slate-400">
                                Pastikan akun Kepala Dinas sudah memiliki wilayah melalui halaman Admin User.
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
