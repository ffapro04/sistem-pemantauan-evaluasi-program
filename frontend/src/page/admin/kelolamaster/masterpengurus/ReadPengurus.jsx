/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Plus,
  Search as SearchIcon,
  Database,
  UserCheck,
  UserRoundCheck,
  ShieldCheck,
  Eye,
  Edit3,
  Filter,
  CheckCircle,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

// Komponen Custom
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
  const [searchTerm, setSearchTerm] = useState(
    localStorage.getItem("filter_search") || "",
  );
  const [statusFilter, setStatusFilter] = useState(
    localStorage.getItem("filter_status") || "all",
  );
  const [jabatanFilter, setJabatanFilter] = useState(
    localStorage.getItem("filter_jabatan") || "all",
  );
  const [currentPage, setCurrentPage] = useState(
    Number(localStorage.getItem("filter_page")) || 1,
  );
  const [pengurus, setPengurus] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 5;
  const navigate = useNavigate();

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
    localStorage.setItem("filter_search", searchTerm);
    localStorage.setItem("filter_status", statusFilter);
    localStorage.setItem("filter_jabatan", jabatanFilter);
    localStorage.setItem("filter_page", currentPage);
  }, [searchTerm, statusFilter, jabatanFilter, currentPage]);

  const fetchPengurus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // FIX: Ambil Role 1 (Admin) dan Role 2 (Pengurus)
      const data = response.data.filter(
        (u) => Number(u.id_role) === 1 || Number(u.id_role) === 2,
      );
      setPengurus(data);
    } catch (error) {
      Toast.fire({ icon: "error", title: "Gagal memuat data" });
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
      Toast.fire({ icon: "error", title: "Gagal update status" });
    }
  };

  // --- LOGIKA FILTER & SORTING (FIXED ID 1 & 2) ---
  const filteredData = pengurus
    .filter((p) => {
      const matchesSearch =
        p.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const isActive =
        p.status === true || p.status === "true" || Number(p.status) === 1;
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? isActive
            : !isActive;

      // Filter Jabatan berdasarkan ID 1 atau 2
      const matchesJabatan =
        jabatanFilter === "all"
          ? true
          : Number(p.id_role) === Number(jabatanFilter);

      return matchesSearch && matchesStatus && matchesJabatan;
    })
    .sort((a, b) => {
      // Prioritas: Role 1 (Super Admin) Selalu di Atas
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
      align: "text-left pl-8 w-[70px]",
      render: (_, i) => (
        <span className="text-[10px] font-mono font-bold text-gray-400">
          {String((currentPage - 1) * itemsPerPage + i + 1).padStart(2, "0")}
        </span>
      ),
    },
    {
      header: "IDENTITAS PENGURUS",
      align: "text-left w-[30%]",
      render: (row) => {
        const isSuper = Number(row.id_role) === 1; // FIX: Admin adalah ID 1
        return (
          <div className="flex flex-col py-3">
            <div className="flex items-center gap-2">
              <span className="font-black text-gray-800 uppercase text-[11px]">
                {row.nama}
              </span>
              {isSuper && <ShieldCheck size={12} className="text-amber-500" />}
            </div>
            <span className="text-[9px] text-gray-400 font-bold lowercase">
              {row.email}
            </span>
          </div>
        );
      },
    },
    {
      header: "JABATAN STRUKTURAL",
      align: "text-left w-[25%]",
      render: (row) => {
        const isSuper = Number(row.id_role) === 1;
        return (
          <span
            className={`text-[10px] font-black uppercase tracking-tight ${
              isSuper ? "text-gray-800" : "text-[#1E5AA5]"
            }`}
          >
            {isSuper ? "SUPER ADMINISTRATOR" : row.jabatan || "PENGURUS"}
          </span>
        );
      },
    },
    {
      header: "KONTROL OTORITAS",
      align: "text-left w-[240px]",
      render: (row) => {
        const isSuper = Number(row.id_role) === 1; // FIX: Admin adalah ID 1
        const isActive =
          row.status === true ||
          row.status === "true" ||
          Number(row.status) === 1;
        return (
          <div className="flex gap-3 items-center py-3">
            <div className="flex">
              <Button
                icon={<Eye size={16} />}
                onClick={() =>
                  navigate(`/admin/pengurus/detail/${row.id_user}`)
                }
                className="!p-2 !bg-transparent !text-gray-400 hover:!text-blue-600 !shadow-none"
              />
              <Button
                icon={<Edit3 size={15} />}
                onClick={() => navigate(`/admin/pengurus/edit/${row.id_user}`)}
                className="!p-2 !bg-transparent !text-gray-400 hover:!text-amber-500 !shadow-none"
              />
            </div>
            {isSuper ? (
              <span className="text-[8px] font-black text-gray-300 uppercase pl-2 italic tracking-widest">
                Locked Access
              </span>
            ) : (
              <div
                onClick={() =>
                  handleToggleStatus(row.id_user, row.nama, row.status)
                }
                className="flex items-center gap-3 cursor-pointer group active:scale-95 transition-all"
              >
                <div
                  className={`relative w-9 h-5 rounded-full transition-all duration-500 ${isActive ? "bg-emerald-500" : "bg-gray-300"} p-1`}
                >
                  <div
                    className={`w-3 h-3 bg-white rounded-full transition-all duration-300 shadow-sm ${isActive ? "translate-x-4" : "translate-x-0"}`}
                  />
                </div>
                <span
                  className={`text-[9px] font-black uppercase tracking-widest ${isActive ? "text-emerald-600" : "text-gray-400"}`}
                >
                  {isActive ? "Aktif" : "Nonaktif"}
                </span>
              </div>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <PageWrapper className="h-screen bg-[#EEF5FF] flex overflow-hidden !p-0">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden px-4 md:px-10 pt-10 pb-6">
        <Card className="flex-1 flex flex-col !m-0 !p-0 rounded-[2.5rem] shadow-2xl bg-white overflow-hidden">
          <div className="px-10 pt-8 pb-6 shrink-0">
            <header className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3.5 bg-gradient-to-br from-[#1E5AA5] to-[#164a8a] rounded-2xl text-white shadow-xl">
                  <UserRoundCheck size={24} />
                </div>
                <div className="flex flex-col">
                  <Label
                    text="Sistem Pemantauan Program"
                    className="!text-[8px] !text-[#1E5AA5] !font-black !italic uppercase"
                  />
                  <h1 className="text-xl font-black text-gray-800 uppercase">
                    Manajemen Data{" "}
                    <span className="text-[#2E5AA7]">Pengurus</span>
                  </h1>
                </div>
              </div>
              <Button
                text="TAMBAH PENGURUS"
                icon={<Plus size={14} />}
                onClick={() => navigate("/admin/kadin/create")}
                className="!bg-[#2E5AA7] !rounded-full !px-6 !py-2.5 !text-[9px] font-black text-white shadow-lg active:scale-95"
              />
            </header>

            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Input
                  placeholder="Cari nama/email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full !pl-11 !py-2.5 !bg-gray-50/50 !rounded-xl !text-[11px] font-bold"
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
                  className="!py-2 !bg-gray-50/50 !rounded-xl !text-[9px] font-black uppercase"
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
                  className="!py-2 !bg-gray-50/50 !rounded-xl !text-[9px] font-black uppercase"
                />
              </div>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setJabatanFilter("all");
                  setCurrentPage(1);
                }}
                className="text-[8px] font-black text-gray-400 hover:text-rose-500 uppercase tracking-widest transition-colors"
              >
                Reset Filter
              </button>
            </div>
            <div className="px-4 py-2 bg-blue-50/50 text-[#1E5AA5] rounded-lg border border-blue-100/50 font-black text-[8px] uppercase tracking-widest w-fit">
              <Filter size={12} className="inline mr-2" /> Hasil: {totalItems}{" "}
              Personnel
            </div>
          </div>
          <div className="flex-none px-10 pb-4 overflow-hidden">
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
              <Table
                columns={tableColumns}
                data={currentData}
                className="min-w-full border-collapse"
              />
            </div>
          </div>
          <div className="px-10 py-5 mt-auto border-t border-gray-100 bg-gray-50/30">
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
