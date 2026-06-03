/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Plus,
  Search as SearchIcon,
  MapPin,
  Eye,
  Edit3,
  Filter,
  CheckCircle,
  LayoutGrid,
  Mail,
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
const ROLE_AO = 4;

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
  if (Array.isArray(payload?.wilayah)) return payload.wilayah;

  return [];
};

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const getRoleId = (user) =>
  Number(user?.id_role || user?.role_id || user?.role?.id_role || 0);

const isAreaOfficerUser = (user) => getRoleId(user) === ROLE_AO;

const isActiveValue = (value) =>
  value === true || value === "true" || Number(value) === 1;

const getWilayahId = (wilayah) => wilayah?.id_wilayah || wilayah?.id;

const getWilayahName = (wilayah) =>
  wilayah?.nama_wilayah || wilayah?.nama || "Wilayah";

const cleanWilayahName = (value) =>
  String(value || "Wilayah")
    .split("/")
    .filter(Boolean)
    .pop();

const ReadAO = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState(
    localStorage.getItem("ao_filter_search") || "",
  );

  const [filterWilayah, setFilterWilayah] = useState(
    localStorage.getItem("ao_filter_wilayah") || "all",
  );

  const [filterStatus, setFilterStatus] = useState(
    localStorage.getItem("ao_filter_status") || "all",
  );

  const [currentPage, setCurrentPage] = useState(
    Number(localStorage.getItem("ao_filter_page")) || 1,
  );

  const [aos, setAos] = useState([]);
  const [wilayahList, setWilayahList] = useState([]);
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 5;

  useEffect(() => {
    localStorage.setItem("ao_filter_search", searchTerm);
    localStorage.setItem("ao_filter_wilayah", filterWilayah);
    localStorage.setItem("ao_filter_status", filterStatus);
    localStorage.setItem("ao_filter_page", currentPage);
  }, [searchTerm, filterWilayah, filterStatus, currentPage]);

  const fetchData = async () => {
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
      let wilayah = [];

      try {
        const resAO = await axios.get(`${API_BASE}/users/ao`, {
          headers,
        });

        users = normalizeArray(resAO.data);
      } catch (error) {
        console.warn("Endpoint /users/ao gagal, fallback ke /users:", error);
      }

      if (users.length === 0) {
        const resUsers = await axios.get(`${API_BASE}/users`, {
          headers,
        });

        users = normalizeArray(resUsers.data);
      }

      try {
        const resWilayah = await axios.get(`${API_BASE}/wilayah`, {
          headers,
        });

        wilayah = normalizeArray(resWilayah.data);
      } catch (error) {
        console.warn("Gagal mengambil data wilayah:", error);
        wilayah = [];
      }

      setAos(users.filter(isAreaOfficerUser));
      setWilayahList(wilayah);
    } catch (error) {
      console.error("Fetch AO Error:", error);

      Toast.fire({
        icon: "error",
        title: "Gagal memuat data Area Officer",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

      await fetchData();

      Toast.fire({
        icon: "success",
        title: `${name} sekarang ${nextStatus ? "Aktif" : "Nonaktif"}`,
      });
    } catch (error) {
      console.error("Toggle Status AO Error:", error);

      Toast.fire({
        icon: "error",
        title: "Gagal memperbarui status Area Officer",
      });
    }
  };

  const resetFilter = () => {
    setSearchTerm("");
    setFilterWilayah("all");
    setFilterStatus("all");
    setCurrentPage(1);

    localStorage.removeItem("ao_filter_search");
    localStorage.removeItem("ao_filter_wilayah");
    localStorage.removeItem("ao_filter_status");
    localStorage.removeItem("ao_filter_page");
  };

  const filteredData = aos
    .filter((ao) => {
      const search = normalizeText(searchTerm);

      const nama = normalizeText(ao?.nama);
      const email = normalizeText(ao?.email);

      const matchesSearch =
        !search || nama.includes(search) || email.includes(search);

      const matchesWilayah =
        filterWilayah === "all"
          ? true
          : Array.isArray(ao?.wilayah) &&
          ao.wilayah.some(
            (wilayah) => Number(getWilayahId(wilayah)) === Number(filterWilayah),
          );

      const active = isActiveValue(ao?.status);

      const matchesStatus =
        filterStatus === "all"
          ? true
          : filterStatus === "active"
            ? active
            : !active;

      return matchesSearch && matchesWilayah && matchesStatus;
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
          <span className="min-w-[20px] text-left font-mono text-[10px] font-bold text-gray-400">
            {String((currentPage - 1) * itemsPerPage + i + 1).padStart(2, "0")}
          </span>
        </div>
      ),
    },
    {
      header: "IDENTITAS AREA OFFICER",
      align: "text-center w-[30%]",
      render: (row) => (
        <div className="flex justify-center py-2">
          <div className="flex min-w-[160px] flex-col gap-0.5 text-left">
            <span className="text-[11px] font-black uppercase leading-tight text-gray-800">
              {row.nama || "-"}
            </span>

            <div className="flex items-center gap-1.5 leading-none text-slate-400">
              <Mail size={10} />

              <span className="truncate text-[9px] font-bold lowercase">
                {row.email || "-"}
              </span>
            </div>

            <span className="mt-1 text-[8px] font-black uppercase tracking-widest text-slate-300">
              ID: {row.id_user || "-"} · {row.jabatan || "Area Officer"}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "WILAYAH PENUGASAN",
      align: "text-center w-[35%]",
      render: (row) => (
        <div className="flex justify-center py-2">
          <div className="min-w-[160px] text-left">
            <div className="flex flex-wrap items-center gap-1.5">
              {Array.isArray(row?.wilayah) && row.wilayah.length > 0 ? (
                row.wilayah.map((wilayah) => {
                  const idWilayah = getWilayahId(wilayah);
                  const namaWilayah = cleanWilayahName(getWilayahName(wilayah));

                  return (
                    <span
                      key={idWilayah}
                      className="rounded-lg border border-[#0AC4E0]/10 bg-[#0AC4E0]/5 px-2.5 py-1 text-[9px] font-black uppercase tracking-tight text-[#0AC4E0]"
                    >
                      {namaWilayah}
                    </span>
                  );
                })
              ) : (
                  <span className="text-[10px] font-bold italic text-slate-300">
                    BELUM DITUGASKAN
                  </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "KONTROL OTORITAS",
      align: "text-center w-[280px]",
      render: (row) => {
        const active = isActiveValue(row.status);

        return (
          <div className="flex justify-center py-2">
            <div className="flex min-w-[180px] items-center gap-4 text-left">
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => navigate(`/admin/ao/detail/${row.id_user}`)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-400 transition-all hover:bg-white hover:text-[#0AC4E0] active:scale-90"
                  title="Lihat Detail"
                >
                  <Eye size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/admin/ao/edit/${row.id_user}`)}
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
                className="group flex cursor-pointer items-center gap-2 transition-all active:scale-95"
                title="Ubah Status"
              >
                <div
                  className={`relative h-[18px] w-8 rounded-full p-0.5 transition-all duration-500 ${active
                    ? "bg-emerald-500 shadow-sm shadow-emerald-200"
                    : "bg-gray-200"
                    }`}
                >
                  <div
                    className={`h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-all duration-300 ${active ? "translate-x-3.5" : "translate-x-0"
                      }`}
                  />
                </div>

                <span
                  className={`text-[9px] font-black uppercase tracking-widest ${active ? "text-emerald-600" : "text-slate-400"
                    }`}
                >
                  {active ? "Aktif" : "Nonaktif"}
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
                    text="Sistem Pemantauan Area Strategis"
                    className="!text-[8px] !font-black !italic uppercase tracking-widest !text-[#0AC4E0]"
                  />

                  <h1 className="text-xl font-black uppercase text-gray-800">
                    Manajemen Data{" "}
                    <span className="text-[#0AC4E0]">Area Officer</span>
                  </h1>
                </div>
              </div>

              <Button
                text="Tambah Area Officer"
                icon={<Plus size={14} />}
                onClick={() => navigate("/admin/ao/create")}
                className="!rounded-full !bg-[#0AC4E0] !px-6 !py-2.5 !text-[9px] font-black !uppercase text-white shadow-lg shadow-[#0AC4E0]/20 transition-all active:scale-95"
              />
            </header>

            <div className="mb-6 flex flex-col gap-3 leading-none md:flex-row">
              <div className="group relative flex-1">
                <Input
                  placeholder="Cari nama atau email Area Officer..."
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

              <div className="w-60 leading-none">
                <Dropdown
                  icon={MapPin}
                  value={filterWilayah}
                  items={[
                    { value: "all", label: "SELURUH WILAYAH" },
                    ...wilayahList
                      .filter((wilayah) => getWilayahId(wilayah))
                      .map((wilayah) => {
                        const idWilayah = getWilayahId(wilayah);
                        const namaWilayah = cleanWilayahName(
                          getWilayahName(wilayah),
                        ).toUpperCase();

                        return {
                          value: String(idWilayah),
                          label: namaWilayah,
                        };
                      }),
                  ]}
                  onChange={(value) => {
                    setFilterWilayah(value);
                    setCurrentPage(1);
                  }}
                  className="!rounded-xl !border-gray-200/50 !bg-gray-50/50 !py-2.5 !text-[9px] font-black uppercase"
                />
              </div>

              <div className="w-56 leading-none">
                <Dropdown
                  icon={CheckCircle}
                  value={filterStatus}
                  items={[
                    { value: "all", label: "SEMUA STATUS" },
                    { value: "active", label: "STATUS: AKTIF" },
                    { value: "inactive", label: "STATUS: NONAKTIF" },
                  ]}
                  onChange={(value) => {
                    setFilterStatus(value);
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
                Hasil Filter: {totalItems} Area Officer
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
                    Data Tidak Ditemukan
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

export default ReadAO;