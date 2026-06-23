/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Plus,
  Search as SearchIcon,
  Database,
  Eye,
  Edit3,
  Filter,
  CheckCircle,
  Users,
  ShieldCheck,
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

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const ReadPengurus = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState(
    localStorage.getItem("filter_search_pengurus") || "",
  );

  const [statusFilter, setStatusFilter] = useState(
    localStorage.getItem("filter_status_pengurus") || "all",
  );

  const [jabatanFilter, setJabatanFilter] = useState(
    localStorage.getItem("filter_jabatan_pengurus") || "all",
  );

  const [currentPage, setCurrentPage] = useState(
    Number(localStorage.getItem("filter_page_pengurus")) || 1,
  );

  const [pengurus, setPengurus] = useState([]);
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 5;

  const filterJabatanOptions = [
    { value: "all", label: "SEMUA OTORITAS" },
    { value: "1", label: "SUPER ADMIN" },
    { value: "2", label: "PENGURUS PUSAT" },
  ];

  const filterStatusOptions = [
    { value: "all", label: "SEMUA STATUS" },
    { value: "active", label: "STATUS: AKTIF" },
    { value: "inactive", label: "STATUS: NONAKTIF" },
  ];

  useEffect(() => {
    localStorage.setItem("filter_search_pengurus", searchTerm);
    localStorage.setItem("filter_status_pengurus", statusFilter);
    localStorage.setItem("filter_jabatan_pengurus", jabatanFilter);
    localStorage.setItem("filter_page_pengurus", currentPage);
  }, [searchTerm, statusFilter, jabatanFilter, currentPage]);

  const fetchPengurus = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get("http://localhost:3000/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data.filter(
        (u) => Number(u.id_role) === 1 || Number(u.id_role) === 2,
      );

      setPengurus(data);
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: "Gagal memuat data pengurus",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPengurus();
  }, []);

  const handleToggleStatus = async (id, name, currentStatus) => {
    const nextStatus = !(
      currentStatus === true ||
      currentStatus === "true" ||
      Number(currentStatus) === 1
    );

    try {
      const token = localStorage.getItem("token");

      await axios.patch(
        `http://localhost:3000/users/${id}`,
        { status: nextStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      await fetchPengurus();

      Toast.fire({
        icon: "success",
        title: `${name} sekarang ${nextStatus ? "Aktif" : "Nonaktif"}`,
      });
    } catch (e) {
      Toast.fire({
        icon: "error",
        title: "Gagal memperbarui status",
      });
    }
  };

  const filteredData = pengurus
    .filter((p) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        p.nama?.toLowerCase().includes(search) ||
        p.email?.toLowerCase().includes(search) ||
        p.jabatan?.toLowerCase().includes(search);

      const isActive =
        p.status === true || p.status === "true" || Number(p.status) === 1;

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? isActive
            : !isActive;

      const matchesJabatan =
        jabatanFilter === "all"
          ? true
          : Number(p.id_role) === Number(jabatanFilter);

      return matchesSearch && matchesStatus && matchesJabatan;
    })
    .sort((a, b) => {
      const isASuper = Number(a.id_role) === 1;
      const isBSuper = Number(b.id_role) === 1;

      if (isASuper && !isBSuper) return -1;
      if (!isASuper && isBSuper) return 1;

      return b.id_user - a.id_user;
    });

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

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
      header: "IDENTITAS PENGURUS",
      align: "text-center w-[30%]",
      render: (row) => {
        const isSuper = Number(row.id_role) === 1;

        return (
          <div className="flex justify-center py-2">
            <div className="flex min-w-[160px] flex-col gap-0.5 text-left">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase leading-tight text-gray-800">
                  {row.nama}
                </span>

                {isSuper && (
                  <ShieldCheck
                    size={12}
                    className="shrink-0 text-amber-500"
                  />
                )}
              </div>

              <span className="truncate text-[9px] font-bold lowercase text-gray-400">
                {row.email}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: "JABATAN STRUKTURAL",
      align: "text-center w-[25%]",
      render: (row) => {
        const isSuper = Number(row.id_role) === 1;

        return (
          <div className="flex justify-center">
            <div className="min-w-[140px] text-left">
              <span
                className={`text-[10px] font-black uppercase tracking-tight ${isSuper ? "text-gray-800" : "text-[#0AC4E0]"
                  }`}
              >
                {isSuper ? "SUPER ADMINISTRATOR" : row.jabatan || "PENGURUS"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: "KONTROL OTORITAS",
      align: "text-center w-[280px]",
      render: (row) => {
        const isSuper = Number(row.id_role) === 1;

        const isActive =
          row.status === true ||
          row.status === "true" ||
          Number(row.status) === 1;

        return (
          <div className="flex justify-center py-2">
            <div className="flex min-w-[180px] items-center gap-4 text-left">
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() =>
                    navigate(`/admin/pengurus/detail/${row.id_user}`)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-400 transition-all hover:bg-white hover:text-[#0AC4E0] active:scale-90"
                  title="Lihat Detail"
                >
                  <Eye size={15} />
                </button>

                <button
                  onClick={() => navigate(`/admin/pengurus/edit/${row.id_user}`)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-400 transition-all hover:bg-white hover:text-amber-500 active:scale-90"
                  title="Edit Data"
                >
                  <Edit3 size={14} />
                </button>
              </div>

              <div className="h-6 w-px bg-slate-100" />

              {isSuper ? (
                <span className="text-[8px] font-black uppercase italic tracking-widest text-gray-300">
                  Terkunci
                </span>
              ) : (
                <div
                    onClick={() =>
                      handleToggleStatus(row.id_user, row.nama, row.status)
                    }
                    className="group flex cursor-pointer items-center gap-2 transition-all active:scale-95"
                  >
                    <div
                      className={`relative h-4.5 w-8 rounded-full p-0.5 transition-all duration-500 ${isActive
                        ? "bg-emerald-500 shadow-sm shadow-emerald-200"
                        : "bg-gray-200"
                        }`}
                    >
                      <div
                        className={`h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-all duration-300 ${isActive ? "translate-x-3.5" : "translate-x-0"
                          }`}
                      />
                    </div>

                    <span
                      className={`text-[9px] font-black uppercase tracking-widest ${isActive ? "text-emerald-600" : "text-slate-400"
                        }`}
                    >
                      {isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <PageWrapper className="flex h-screen overflow-hidden bg-[#EEF5FF] !p-0">
      <Sidebar />

      <main className="flex h-full flex-1 flex-col overflow-hidden px-4 pb-6 pt-10 md:px-10">
        <Card className="!m-0 flex flex-1 flex-col overflow-hidden rounded-[2.5rem] bg-white !p-0 shadow-2xl">
          <div className="shrink-0 px-10 pb-6 pt-8">
            <header className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <Label
                    text="Sistem Pemantauan Program"
                    className="!text-[8px] !font-black !italic uppercase !text-[#0AC4E0]"
                  />

                  <h1 className="text-xl font-black uppercase text-gray-800">
                    Manajemen Data{" "}
                    <span className="text-[#0AC4E0]">Pengurus</span>
                  </h1>
                </div>
              </div>

              <Button
                text="Tambah Pengurus"
                icon={<Plus size={14} />}
<<<<<<< HEAD
                onClick={() => navigate("/admin/pengurus/create")}
                className="!rounded-full !bg-[#0AC4E0] !px-6 !py-2.5 !text-[9px] font-black !uppercase text-white shadow-lg active:scale-95"
=======
                onClick={() => navigate("/admin/kadin/create")}
                className="!bg-[#2E5AA7] !rounded-full !px-6 !py-2.5 !text-[9px] font-black text-white shadow-lg active:scale-95"
>>>>>>> 55395b99654a0c44898aa60d46a595d174a20e95
              />
            </header>

            <div className="mb-6 flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <Input
                  placeholder="Cari nama, email, atau jabatan..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full !rounded-xl !bg-gray-50/50 !py-2.5 !pl-11 !text-[11px] font-bold"
                />

                <SearchIcon
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                  size={16}
                />
              </div>

              <div className="w-56">
                <Dropdown
                  icon={Users}
                  value={jabatanFilter}
                  items={filterJabatanOptions}
                  onChange={(v) => {
                    setJabatanFilter(v);
                    setCurrentPage(1);
                  }}
                  className="!rounded-xl !bg-gray-50/50 !py-2 !text-[9px] font-black uppercase"
                />
              </div>

              <div className="w-52">
                <Dropdown
                  icon={CheckCircle}
                  value={statusFilter}
                  items={filterStatusOptions}
                  onChange={(v) => {
                    setStatusFilter(v);
                    setCurrentPage(1);
                  }}
                  className="!rounded-xl !bg-gray-50/50 !py-2 !text-[9px] font-black uppercase"
                />
              </div>

              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setJabatanFilter("all");
                  setCurrentPage(1);
                }}
                className="text-[8px] font-black uppercase tracking-widest text-gray-400 transition-colors hover:text-rose-500"
              >
                Atur Ulang
              </button>
            </div>

            <div className="w-fit rounded-lg border border-blue-100/50 bg-blue-50/50 px-4 py-2 text-[8px] font-black uppercase tracking-widest text-[#0AC4E0]">
              <Filter size={12} className="mr-2 inline" />
              Hasil: {totalItems} Pengurus
            </div>
          </div>

          <div className="flex-none overflow-hidden px-10 pb-4">
            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
              <Table
                columns={tableColumns}
                data={currentData}
                className="min-w-full border-collapse"
              />

              {!loading && currentData.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-gray-900 opacity-20">
                  <Database size={56} className="mb-4" strokeWidth={1} />

                  <p className="text-xs font-black uppercase tracking-widest">
                    Data tidak ditemukan
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto border-t border-gray-100 bg-gray-50/30 px-10 py-5">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              loading={loading}
            />
          </div>
        </Card>
      </main>
    </PageWrapper>
  );
};

export default ReadPengurus;