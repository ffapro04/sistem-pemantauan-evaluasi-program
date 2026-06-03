/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Plus,
  Search as SearchIcon,
  Eye,
  Edit3,
  Filter,
  CheckCircle,
  Users,
  LayoutGrid,
  Mail,
  ChevronRight,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import Sidebar from "../../../../components/Sidebar";
import Card from "../../../../components/Card";
import Button from "../../../../components/Button";
import Input from "../../../../components/Input";
import Table from "../../../../components/Table";
import PageWrapper from "../../../../components/PageWrapper";
import Label from "../../../../components/Label";
import Pagination from "../../../../components/Pagination";
import Dropdown from "../../../../components/Dropdown";

const API_BASE = "http://localhost:3000";
const ROLE_HEAD_OFFICE = 3;

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const normalizeArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.user)) return payload.user;

  return [];
};

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const normalizeCompare = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replaceAll("_", "-")
    .replaceAll(" ", "-");

const getRoleId = (user) =>
  Number(user?.id_role || user?.role_id || user?.role?.id_role || 0);

const isHeadOfficeUser = (user) => getRoleId(user) === ROLE_HEAD_OFFICE;

const isActiveValue = (value) =>
  value === true || value === "true" || Number(value) === 1;

const formatJenis = (value) => {
  const jenis = normalizeCompare(value);

  if (jenis === "akademik") return "AKADEMIK";
  if (jenis.includes("non")) return "NON-AKADEMIK";

  return "BELUM DIATUR";
};

const getJenisBadgeClass = (value) => {
  const jenis = normalizeCompare(value);

  if (jenis === "akademik") {
    return "bg-[#0AC4E0]/10 text-[#0AC4E0]";
  }

  if (jenis.includes("non")) {
    return "bg-emerald-50 text-emerald-600";
  }

  return "bg-slate-50 text-slate-400";
};

const ReadHO = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState(
    localStorage.getItem("ho_filter_search") || "",
  );

  const [filterDept, setFilterDept] = useState(
    localStorage.getItem("ho_filter_dept") || "all",
  );

  const [filterTingkat, setFilterTingkat] = useState(
    localStorage.getItem("ho_filter_tingkat") || "all",
  );

  const [currentPage, setCurrentPage] = useState(
    Number(localStorage.getItem("ho_filter_page")) || 1,
  );

  const [hos, setHos] = useState([]);
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 5;

  const filterDeptOptions = [
    { value: "all", label: "SEMUA DEPARTEMEN" },
    { value: "akademik", label: "AKADEMIK" },
    { value: "non-akademik", label: "NON-AKADEMIK" },
  ];

  const filterTingkatOptions = [
    { value: "all", label: "SEMUA FOKUS" },
    { value: "SD & SMP", label: "SD & SMP" },
    { value: "SMK", label: "SMK" },
  ];

  useEffect(() => {
    localStorage.setItem("ho_filter_search", searchTerm);
    localStorage.setItem("ho_filter_dept", filterDept);
    localStorage.setItem("ho_filter_tingkat", filterTingkat);
    localStorage.setItem("ho_filter_page", currentPage);
  }, [searchTerm, filterDept, filterTingkat, currentPage]);

  const fetchHO = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      let users = [];

      try {
        const hoResponse = await axios.get(`${API_BASE}/users/ho`, {
          headers,
        });

        users = normalizeArray(hoResponse.data);
      } catch (error) {
        console.warn("Endpoint /users/ho gagal, fallback ke /users:", error);
      }

      let onlyHO = users.filter(isHeadOfficeUser);

      if (onlyHO.length === 0) {
        const allUsersResponse = await axios.get(`${API_BASE}/users`, {
          headers,
        });

        const allUsers = normalizeArray(allUsersResponse.data);
        onlyHO = allUsers.filter(isHeadOfficeUser);
      }

      setHos(onlyHO);
    } catch (error) {
      console.error("Fetch HO Error:", error);

      Toast.fire({
        icon: "error",
        title: "Gagal memuat data Head Office",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHO();
  }, []);

  const handleToggleStatus = async (id, name, currentStatus) => {
    const nextStatus = !isActiveValue(currentStatus);

    try {
      const token = localStorage.getItem("token");

      await axios.patch(
        `${API_BASE}/users/${id}`,
        { status: nextStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await fetchHO();

      Toast.fire({
        icon: "success",
        title: `${name} sekarang ${nextStatus ? "Aktif" : "Nonaktif"}`,
      });
    } catch (error) {
      console.error("Toggle HO Status Error:", error);

      Toast.fire({
        icon: "error",
        title: "Gagal memperbarui status",
      });
    }
  };

  const resetFilter = () => {
    setSearchTerm("");
    setFilterDept("all");
    setFilterTingkat("all");
    setCurrentPage(1);

    localStorage.removeItem("ho_filter_search");
    localStorage.removeItem("ho_filter_dept");
    localStorage.removeItem("ho_filter_tingkat");
    localStorage.removeItem("ho_filter_page");
  };

  const filteredData = hos
    .filter((ho) => {
      const search = normalizeText(searchTerm);

      const nama = normalizeText(ho?.nama);
      const email = normalizeText(ho?.email);
      const jabatan = normalizeText(ho?.jabatan);
      const jenis = normalizeCompare(ho?.jenis);
      const subJenis = normalizeCompare(ho?.sub_jenis);

      const matchesSearch =
        !search ||
        nama.includes(search) ||
        email.includes(search) ||
        jabatan.includes(search);

      const matchesDept =
        filterDept === "all" ? true : jenis === normalizeCompare(filterDept);

      const matchesTingkat =
        filterTingkat === "all"
          ? true
          : subJenis === normalizeCompare(filterTingkat);

      return matchesSearch && matchesDept && matchesTingkat;
    })
    .sort((a, b) => Number(b.id_user || 0) - Number(a.id_user || 0));

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const tableColumns = [
    {
      header: "NO",
      align: "text-center w-[80px]",
      render: (_, i) => (
        <div className="flex justify-center">
          <span className="min-w-[25px] text-left font-mono text-[12px] font-bold text-slate-300">
            {String((currentPage - 1) * itemsPerPage + i + 1).padStart(2, "0")}
          </span>
        </div>
      ),
    },
    {
      header: "IDENTITAS HEAD OFFICE",
      align: "text-center w-[30%]",
      render: (row) => (
        <div className="flex justify-center py-1">
          <div className="flex min-w-[180px] flex-col gap-1 text-left">
            <span className="text-[13.5px] font-bold uppercase leading-none tracking-tight text-slate-800">
              {row.nama || "-"}
            </span>

            <div className="flex items-center gap-1.5 leading-none text-slate-400">
              <Mail size={10} />

              <span className="text-[10px] font-medium lowercase">
                {row.email || "-"}
              </span>
            </div>

            <span className="mt-1 text-[8px] font-black uppercase tracking-widest text-slate-300">
              ID: {row.id_user || "-"} · {row.jabatan || "Head Office"}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "DEPARTEMEN & FOKUS",
      align: "text-center w-[30%]",
      render: (row) => (
        <div className="flex justify-center">
          <div className="flex min-w-[180px] items-center gap-2 text-left">
            <span
              className={`rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest ${getJenisBadgeClass(
                row.jenis,
              )}`}
            >
              {formatJenis(row.jenis)}
            </span>

            {row.sub_jenis ? (
              <div className="flex items-center gap-2 leading-none">
                <ChevronRight size={12} className="text-slate-200" />

                <span className="text-[10px] font-black uppercase text-slate-400">
                  {row.sub_jenis}
                </span>
              </div>
            ) : (
              <span className="text-[10px] font-black uppercase text-slate-300">
                -
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "KONTROL OTORITAS",
      align: "text-center w-[280px]",
      render: (row) => {
        const isActive = isActiveValue(row.status);

        return (
          <div className="flex justify-center py-1">
            <div className="flex min-w-[210px] items-center gap-4 text-left">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => navigate(`/admin/ho/detail/${row.id_user}`)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-400 transition-all hover:bg-white hover:text-[#0AC4E0] active:scale-90"
                  title="Lihat Detail"
                >
                  <Eye size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/admin/ho/edit/${row.id_user}`)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-400 transition-all hover:bg-white hover:text-amber-500 active:scale-90"
                  title="Edit Data"
                >
                  <Edit3 size={14} />
                </button>
              </div>

              <div className="h-6 w-px bg-slate-100" />

              <button
                type="button"
                onClick={() =>
                  handleToggleStatus(row.id_user, row.nama, row.status)
                }
                className="group flex cursor-pointer select-none items-center gap-3 transition-all active:scale-95"
                title="Ubah Status"
              >
                <div
                  className={`relative h-[18px] w-8 rounded-full p-0.5 transition-all duration-500 ${isActive
                    ? "bg-emerald-500 shadow-sm shadow-emerald-200"
                    : "bg-slate-200"
                    }`}
                >
                  <div
                    className={`h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-all duration-300 ${isActive ? "translate-x-3.5" : "translate-x-0"
                      }`}
                  />
                </div>

                <span
                  className={`w-14 text-[9px] font-black uppercase tracking-widest ${isActive ? "text-emerald-600" : "text-slate-400"
                    }`}
                >
                  {isActive ? "Aktif" : "Nonaktif"}
                </span>
              </button>
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <PageWrapper className="flex h-screen overflow-hidden bg-[#EEF5FF] !p-0 font-sans text-slate-800 selection:bg-[#0AC4E0]/20">
      <Sidebar />

      <main className="flex h-full flex-1 flex-col overflow-hidden px-4 pb-6 pt-10 md:px-10">
        <Card className="relative !m-0 flex flex-1 flex-col overflow-hidden rounded-[2.5rem] bg-white !p-0 leading-none shadow-2xl">
          <div className="absolute right-0 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-[#0AC4E0]/5 blur-[100px]" />

          <div className="shrink-0 px-10 pb-6 pt-8">
            <header className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1 leading-none">
                  <Label
                    text="Sistem Pemantauan dan Evaluasi Program"
                    className="!text-[8px] !font-black !italic uppercase tracking-widest !text-[#0AC4E0]"
                  />

                  <h1 className="text-xl font-black uppercase text-gray-800">
                    Manajemen Data{" "}
                    <span className="text-[#0AC4E0]">Head Office</span>
                  </h1>
                </div>
              </div>

              <Button
                text="Tambah Head Office"
                icon={<Plus size={14} />}
                onClick={() => navigate("/admin/ho/create")}
                className="!rounded-full !bg-[#0AC4E0] !px-6 !py-2.5 !text-[9px] font-black !uppercase text-white shadow-lg shadow-[#0AC4E0]/20 transition-all active:scale-95"
              />
            </header>

            <div className="mb-6 flex flex-col gap-3 leading-none md:flex-row">
              <div className="group relative flex-1">
                <Input
                  placeholder="Cari nama, email, atau jabatan Head Office..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full !rounded-xl !border-gray-200/50 !bg-gray-50/50 !py-3 !pl-11 !text-[11px] font-bold outline-none transition-all focus:!bg-white focus:!ring-4 focus:!ring-[#0AC4E0]/10"
                />

                <SearchIcon
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-[#0AC4E0]"
                  size={16}
                />
              </div>

              <div className="w-56 leading-none">
                <Dropdown
                  icon={Users}
                  value={filterDept}
                  items={filterDeptOptions}
                  onChange={(v) => {
                    setFilterDept(v);
                    setFilterTingkat("all");
                    setCurrentPage(1);
                  }}
                  className="!rounded-xl !border-gray-200/50 !bg-gray-50/50 !py-2.5 !text-[9px] font-black uppercase"
                />
              </div>

              <div className="w-56 leading-none">
                <Dropdown
                  icon={CheckCircle}
                  value={filterTingkat}
                  items={filterTingkatOptions}
                  disabled={filterDept !== "akademik"}
                  onChange={(v) => {
                    setFilterTingkat(v);
                    setCurrentPage(1);
                  }}
                  className="!rounded-xl !border-gray-200/50 !bg-gray-50/50 !py-2.5 !text-[9px] font-black uppercase"
                />
              </div>

              <button
                type="button"
                onClick={resetFilter}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200/50 bg-gray-50 text-gray-400 shadow-sm transition-all duration-500 hover:bg-rose-50 hover:text-rose-500 active:rotate-180"
                title="Atur Ulang Filter"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="w-fit rounded-lg border border-[#0AC4E0]/10 bg-[#0AC4E0]/5 px-4 py-2 text-[8px] font-black uppercase leading-none tracking-widest text-[#0AC4E0]">
                <Filter size={12} className="mr-2 inline" />
                Hasil Filter: {totalItems} Head Office
              </div>

              {loading && (
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-4 py-2 text-[8px] font-black uppercase tracking-widest text-slate-400">
                  <Loader2 size={12} className="animate-spin" />
                  Memuat Data
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-1 flex-col overflow-hidden px-10 pb-4">
            <div className="no-scrollbar flex-1 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
              <Table
                columns={tableColumns}
                data={currentData}
                className="min-w-full border-separate border-spacing-0"
              />

              {!loading && currentData.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 text-gray-900 opacity-20">
                  <LayoutGrid size={64} className="mb-4" strokeWidth={1} />

                  <p className="text-xs font-black uppercase tracking-widest">
                    Data tidak ditemukan
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto border-t border-gray-50 bg-gray-50/30 px-10 py-5">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              loading={loading}
              className="!gap-1"
            />
          </div>
        </Card>
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

            table {
              border-collapse: separate;
              border-spacing: 0;
              width: 100%;
            }

            thead th {
              background-color: #0AC4E0 !important;
              color: white !important;
              font-size: 10px !important;
              font-weight: 900 !important;
              text-transform: uppercase !important;
              letter-spacing: 0.12em !important;
              padding: 1.5rem 1.5rem !important;
              border: none !important;
              position: sticky;
              top: 0;
              z-index: 10;
            }

            thead th:first-child {
              border-top-left-radius: 1.8rem !important;
            }

            thead th:last-child {
              border-top-right-radius: 1.8rem !important;
            }

            tbody td {
              padding: 1rem 1.5rem !important;
              border-bottom: 1px solid #F8FAFC !important;
              vertical-align: middle !important;
            }

            tbody tr:last-child td {
              border-bottom: none !important;
            }

            tbody tr:hover td {
              background-color: rgba(10, 196, 224, 0.05) !important;
              transition: all 0.2s ease;
            }
          `,
        }}
      />
    </PageWrapper>
  );
};

export default ReadHO;