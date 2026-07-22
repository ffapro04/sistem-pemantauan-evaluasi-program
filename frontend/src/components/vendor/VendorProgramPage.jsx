/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { RefreshCcw, Search, BriefcaseBusiness } from "lucide-react";
import { toast } from "react-toastify";

import {
    Sidebar,
    PageWrapper,
    Button,
    Input,
} from "../common";

import VendorProgramStats from "./VendorProgramStats";
import VendorProgramTable from "./VendorProgramTable";
import VendorEmptyState from "./VendorEmptyState";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "";
const ROWS_PER_PAGE = 3;

function normalizeArray(payload) {
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload)) return payload;
    return [];
}

function VendorProgramPage({
    title = "Program Vendor",
    detailPathPrefix = "/vendor/program/detail",
}) {
    const [programs, setPrograms] = useState([]);
    const [schools, setSchools] = useState([]);
    const [hos, setHos] = useState([]);
    const [vendors, setVendors] = useState([]);

    const [currentUser, setCurrentUser] = useState(null);
    const [currentVendor, setCurrentVendor] = useState(null);

    const [loading, setLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchVendorPrograms();
    }, []);

    const getTokenPayload = () => {
        const token = localStorage.getItem("token");
        if (!token) return null;

        try {
            return jwtDecode(token);
        } catch (error) {
            console.error("Token tidak valid:", error);
            return null;
        }
    };

    const getProgramVendorIds = (program) => {
        if (Array.isArray(program.vendor_ids)) return program.vendor_ids.map(String);
        if (Array.isArray(program.id_vendor)) return program.id_vendor.map(String);
        if (program.id_vendor) return [String(program.id_vendor)];
        return [];
    };

    const resolveCurrentVendor = (vendorList, userPayload) => {
        if (!userPayload) return null;

        const userId = String(
            userPayload.sub ||
            userPayload.id_user ||
            userPayload.id ||
            "",
        );

        const userEmail = String(userPayload.email || "").toLowerCase();
        const userName = String(userPayload.nama || "").toLowerCase();

        return (
            vendorList.find(
                (vendor) =>
                    String(vendor.id_user || "") === userId ||
                    String(vendor.user_id || "") === userId ||
                    String(vendor.id_vendor || "") === userId,
            ) ||
            vendorList.find(
                (vendor) =>
                    userEmail &&
                    String(vendor.email || vendor.email_vendor || "")
                        .toLowerCase()
                        .trim() === userEmail,
            ) ||
            vendorList.find(
                (vendor) =>
                    userName &&
                    String(vendor.nama_vendor || "")
                        .toLowerCase()
                        .trim() === userName,
            ) ||
            null
        );
    };

    const fetchUserById = async (userId, headers) => {
        if (!userId) return null;

        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                headers,
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok) return null;

            return result?.data || result;
        } catch (error) {
            console.error("Gagal mengambil user by id:", error);
            return null;
        }
    };

    const getProgramHoId = (program) => {
        return (
            program?.id_ho ||
            program?.dibuat_oleh ||
            program?.created_by_id ||
            program?.ho_id ||
            program?.ho?.id_user ||
            program?.ho?.id ||
            program?.user?.id_user ||
            program?.user?.id ||
            null
        );
    };

    const fetchVendorPrograms = async () => {
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            const payload = getTokenPayload();

            setCurrentUser(payload);

            const [resProgram, resSekolah, resHo, resVendor] = await Promise.all([
                fetch(`${API_BASE_URL}/program`, { headers }),
                fetch(`${API_BASE_URL}/sekolah`, { headers }),
                fetch(`${API_BASE_URL}/users/ho`, { headers }),
                fetch(`${API_BASE_URL}/vendor`, { headers }),
            ]);

            const dataProgram = normalizeArray(await resProgram.json());
            const dataSekolah = normalizeArray(await resSekolah.json());
            const dataHo = normalizeArray(await resHo.json());
            const dataVendor = normalizeArray(await resVendor.json());

            const normalizedHo = [...dataHo];

            const uniqueHoIds = [
                ...new Set(
                    dataProgram
                        .map((program) => getProgramHoId(program))
                        .filter(Boolean)
                        .map(String),
                ),
            ];

            for (const hoId of uniqueHoIds) {
                const alreadyExists = normalizedHo.some((item) => {
                    const itemId = item?.id_user || item?.id_ho || item?.id;
                    return String(itemId) === String(hoId);
                });

                if (!alreadyExists) {
                    const fallbackHo = await fetchUserById(hoId, headers);

                    if (fallbackHo) {
                        normalizedHo.push(fallbackHo);
                    }
                }
            }

            const vendor = resolveCurrentVendor(dataVendor, payload);

            setSchools(dataSekolah);
            setHos(normalizedHo);
            setVendors(dataVendor);
            setCurrentVendor(vendor);
            /**
             * Catatan:
             * Kalau mapping user vendor belum fix, bagian ini bisa sementara menampilkan semua program.
             * Setelah relasi m_users vendor -> m_vendor jelas, filter ini akan otomatis membatasi program sesuai vendor.
             */
            const vendorPrograms = vendor
                ? dataProgram.filter((program) =>
                    getProgramVendorIds(program).includes(String(vendor.id_vendor)),
                )
                : dataProgram.filter((program) => getProgramVendorIds(program).length > 0);

            const detailedPrograms = await Promise.all(
                vendorPrograms.map(async (program) => {
                    try {
                        const response = await fetch(
                            `${API_BASE_URL}/program/${program.id_program}`,
                            { headers },
                        );

                        const result = await response.json().catch(() => ({}));

                        if (!response.ok) return program;

                        return result?.data || result;
                    } catch (error) {
                        console.error("Gagal mengambil detail program vendor:", error);
                        return program;
                    }
                }),
            );

            setPrograms(detailedPrograms);
        } catch (error) {
            console.error("Gagal mengambil program vendor:", error);
            toast.error("Gagal mengambil program vendor");
        } finally {
            setLoading(false);
        }
    };

    const filteredPrograms = useMemo(() => {
        const keyword = searchKeyword.trim().toLowerCase();

        if (!keyword) return programs;

        return programs.filter((program) => {
            const school = schools.find(
                (item) => String(item.id_sekolah) === String(program.id_sekolah),
            );

            const hoId = getProgramHoId(program);

            const ho = hos.find((item) => {
                const itemId =
                    item?.id_user ||
                    item?.id_ho ||
                    item?.id_head_office ||
                    item?.id;

                return String(itemId) === String(hoId);
            });

            const vendorNames = getProgramVendorIds(program)
                .map((idVendor) => {
                    const vendor = vendors.find(
                        (item) => String(item.id_vendor) === String(idVendor),
                    );

                    return vendor?.nama_vendor;
                })
                .filter(Boolean)
                .join(" ");

            const searchableText = [
                program.nama_program,
                program.kode_program,
                program.kategori,
                program.status_program,
                program.tahun,
                school?.nama_sekolah,
                ho?.nama,
                vendorNames,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchableText.includes(keyword);
        });
    }, [programs, searchKeyword, schools, hos, vendors]);

    const totalPages = Math.max(1, Math.ceil(filteredPrograms.length / ROWS_PER_PAGE));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const startIndex = (safeCurrentPage - 1) * ROWS_PER_PAGE;
    const visiblePrograms = filteredPrograms.slice(
        startIndex,
        startIndex + ROWS_PER_PAGE,
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchKeyword, programs.length]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const getSchoolName = (program) => {
        const school = schools.find(
            (item) => String(item.id_sekolah) === String(program.id_sekolah),
        );

        return program?.sekolah?.nama_sekolah || school?.nama_sekolah || "-";
    };

    const getHoName = (program) => {
        const hoId = getProgramHoId(program);

        const ho = hos.find((item) => {
            const itemId =
                item?.id_user ||
                item?.id_ho ||
                item?.id_head_office ||
                item?.id;

            return String(itemId) === String(hoId);
        });

        return (
            program?.ho?.nama ||
            program?.ho?.name ||
            program?.created_by?.nama ||
            program?.created_by?.name ||
            program?.user?.nama ||
            program?.user?.name ||
            program?.nama_ho ||
            ho?.nama ||
            ho?.name ||
            ho?.nama_lengkap ||
            "-"
        );
    };
    if (loading) {
        return (
            <PageWrapper className="flex h-screen items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-11 w-11 animate-spin rounded-full border-4 border-[#0AC4E0] border-t-transparent" />
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                        Loading Program Vendor...
                    </p>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper className="flex h-screen overflow-hidden bg-[#F6F8FB] !p-0 font-sans text-slate-800">
            <Sidebar />

            <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
                <header className="shrink-0 border-b border-slate-200 bg-white px-7 py-5">
                    <div className="flex items-center justify-between gap-5">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0AC4E0] text-white shadow-[0_14px_30px_rgba(10,196,224,0.22)]">
                                <BriefcaseBusiness size={22} />
                            </div>

                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                                    Vendor Monitoring Workspace
                                </p>

                                <h1 className="mt-1 text-[25px] font-black tracking-tight text-slate-800">
                                    {title}
                                </h1>

                                <p className="mt-1 text-xs font-semibold text-slate-400">
                                    {currentVendor
                                        ? `Menampilkan program untuk ${currentVendor.nama_vendor}`
                                        : "Menampilkan program yang memiliki vendor. Mapping akun vendor belum ditemukan."}
                                </p>
                            </div>
                        </div>

                        <Button
                            text="Refresh"
                            icon={<RefreshCcw size={15} />}
                            onClick={fetchVendorPrograms}
                            className="!rounded-xl !bg-white !px-5 !py-2.5 !text-xs !font-bold !text-slate-600 !shadow-sm !ring-1 !ring-slate-100 hover:!text-[#0AC4E0]"
                        />
                    </div>
                </header>

                <section className="simple-scroll flex-1 space-y-5 overflow-y-auto px-7 py-6">
                    <VendorProgramStats programs={filteredPrograms} />

                    <div className="rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm">
                        <div className="relative">
                            <Search
                                size={17}
                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <Input
                                value={searchKeyword}
                                onChange={(event) => setSearchKeyword(event.target.value)}
                                placeholder="Cari program, sekolah, HO, status, atau tahun..."
                                className="!rounded-xl !border-none !bg-slate-50 !py-3 !pl-11 !text-sm !font-semibold"
                            />
                        </div>
                    </div>

                    {filteredPrograms.length > 0 ? (
                        <VendorProgramTable
                            programs={visiblePrograms}
                            detailPathPrefix={detailPathPrefix}
                            getSchoolName={getSchoolName}
                            getHoName={getHoName}
                            page={safeCurrentPage}
                            totalPages={totalPages}
                            startIndex={startIndex}
                            totalItems={filteredPrograms.length}
                            onPrevPage={() =>
                                setCurrentPage((page) => Math.max(1, page - 1))
                            }
                            onNextPage={() =>
                                setCurrentPage((page) =>
                                    Math.min(totalPages, page + 1),
                                )
                            }
                        />
                    ) : (
                        <VendorEmptyState
                            title="Program tidak ditemukan"
                            description={
                                searchKeyword
                                    ? `Tidak ada program yang cocok dengan kata kunci "${searchKeyword}".`
                                    : "Belum ada program yang ditugaskan kepada vendor ini."
                            }
                        />
                    )}
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
          `,
                }}
            />
        </PageWrapper>
    );
}

export default VendorProgramPage;
