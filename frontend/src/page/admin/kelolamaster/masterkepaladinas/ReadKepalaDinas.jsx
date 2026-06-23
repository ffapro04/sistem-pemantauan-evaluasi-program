/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Plus,
  Search as SearchIcon,
  UserCheck,
  Eye,
  Edit3,
  Filter,
  CheckCircle,
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

const ReadKepalaDinas = () => {
  const [searchTerm, setSearchTerm] = useState(
    localStorage.getItem("filter_kd_search") || "",
  );
  const [statusFilter, setStatusFilter] = useState(
    localStorage.getItem("filter_kd_status") || "all",
  );
  const [currentPage, setCurrentPage] = useState(
    Number(localStorage.getItem("filter_kd_page")) || 1,
  );
  const [kepalaDinas, setKepalaDinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  const filterStatusOptions = [
    { value: "all", label: "SEMUA STATUS" },
    { value: "active", label: "STATUS: AKTIF" },
    { value: "inactive", label: "STATUS: NONAKTIF" },
  ];

  // Sinkronisasi filter spesifik Kepala Dinas ke LocalStorage
  useEffect(() => {
    localStorage.setItem("filter_kd_search", searchTerm);
    localStorage.setItem("filter_kd_status", statusFilter);
    localStorage.setItem("filter_kd_page", currentPage);
  }, [searchTerm, statusFilter, currentPage]);

  // --- HANYA ADA SATU DEKLARASI FUNGSINYA DI SINI ---
  const fetchKepalaDinas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Respon Masuk dari Backend:", response.data);

      let rawData = [];
      if (Array.isArray(response.data)) {
        rawData = response.data;
      } else if (response.data && Array.isArray(response.data.users)) {
        rawData = response.data.users;
      } else if (response.data && Array.isArray(response.data.data)) {
        rawData = response.data.data;
      } else if (response.data && typeof response.data === "object") {
        const possibleArray = Object.values(response.data).find(Array.isArray);
        if (possibleArray) rawData = possibleArray;
      }
      
      const data = rawData.filter((u) => {
        const roleTarget = u.id_role ?? u.role_id ?? u.role;
        return Number(roleTarget) === 7;
      });
      
      console.log("Hasil setelah di-filter Frontend (Role 7):", data);
      setKepalaDinas(data);
    } catch (error) {
      console.error("Gagal memuat data kepala dinas:", error);
      Toast.fire({ icon: "error", title: "Gagal memuat data Kepala Dinas" });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchKepalaDinas();
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
      await fetchKepalaDinas();
      Toast.fire({
        icon: "success",
        title: `${name} sekarang ${nextStatus ? "Aktif" : "Nonaktif"}`,
      });
    } catch (e) {
      Toast.fire({ icon: "error", title: "Gagal memperbarui status" });
    }
  };

  // --- LOGIKA FILTER & SORTING ---
  const filteredData = kepalaDinas
    .filter((kd) => {
      const matchesSearch =
        (kd.nama && kd.nama.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (kd.email && kd.email.toLowerCase().includes(searchTerm.toLowerCase()));
        
      const isActive =
        kd.status === true || 
        kd.status === "true" || 
        Number(kd.status) === 1 ||
        kd.status === "active";
        
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? isActive
            : !isActive;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => b.id_user - a.id_user);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const safeCurrentPage = currentPage > totalPages ? totalPages : currentPage;

  const currentData = filteredData.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage,
  );

  const tableColumns = [
    {
      header: "NO",
      align: "text-left pl-8 w-[70px]",
      render: (_, i) => (
        <span className="text-[10px] font-mono font-bold text-gray-400">
          {String((safeCurrentPage - 1) * itemsPerPage + i + 1).padStart(2, "0")}
        </span>
      ),
    },
    {
      header: "IDENTITAS KEPALA DINAS",
      align: "text-left w-[40%]",
      render: (row) => (
        <div className="flex flex-col py-3">
          <span className="font-black text-gray-800 uppercase text-[11px] tracking-tight">
            {row.nama}
          </span>
          <span className="text-[9px] text-gray-400 font-bold lowercase">
            {row.email}
          </span>
        </div>
      ),
    },
    {
      header: "INSTANSI / JABATAN",
      align: "text-left w-[30%]",
      render: (row) => (
        <span className="text-[10px] font-black uppercase tracking-tight text-[#1E5AA5]">
          {row.jabatan || "KEPALA DINAS"}
        </span>
      ),
    },
    {
      header: "KONTROL AKSES",
      align: "text-left w-[240px]",
      render: (row) => {
        const isActive =
          row.status === true ||
          row.status === "true" ||
          Number(row.status) === 1;
        return (
          <div className="flex gap-3 items-center py-3">
            <div className="flex shrink-0">
              <Button
                icon={<Eye size={15} />}
                onClick={() => navigate(`/admin/kadin/detail/${row.id_user}`)}
                className="!p-2 !bg-transparent !text-gray-400 hover:!text-blue-600 !shadow-none border-none"
              />
              <Button
                icon={<Edit3 size={14} />}
                onClick={() => navigate(`/admin/kadin/edit/${row.id_user}`)}
                className="!p-2 !bg-transparent !text-gray-400 hover:!text-amber-500 !shadow-none border-none"
              />
            </div>
            
            <div
              onClick={() => handleToggleStatus(row.id_user, row.nama, row.status)}
              className="flex items-center gap-3 cursor-pointer group active:scale-95 transition-all select-none"
            >
              <div
                className={`relative w-9 h-5 rounded-full transition-all duration-300 ${isActive ? "bg-emerald-500" : "bg-gray-300"} p-1`}
              >
                <div
                  className={`w-3 h-3 bg-white rounded-full transition-all duration-300 shadow-sm ${isActive ? "translate-x-4" : "translate-x-0"}`}
                />
              </div>
              <span
                className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isActive ? "text-emerald-600" : "text-gray-400"}`}
              >
                {isActive ? "Aktif" : "Nonaktif"}
              </span>
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <PageWrapper className="h-screen bg-[#EEF5FF] flex overflow-hidden !p-0">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden px-4 md:px-10 pt-10 pb-6">
        <Card className="flex-1 flex flex-col !m-0 !p-0 rounded-[2.5rem] shadow-2xl bg-white overflow-hidden border-none">
          
          <div className="px-10 pt-8 pb-6 shrink-0">
            <header className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3.5 bg-gradient-to-br from-[#1E5AA5] to-[#164a8a] rounded-2xl text-white shadow-xl shadow-blue-900/10">
                  <UserCheck size={24} />
                </div>
                <div className="flex flex-col">
                  <Label
                    text="Sistem Pemantauan Program"
                    className="!text-[8px] !text-[#1E5AA5] !font-black !italic uppercase tracking-widest leading-none mb-1"
                  />
                  <h1 className="text-xl font-black text-gray-800 uppercase tracking-tight">
                    Manajemen Data <span className="text-[#2E5AA7]">Kepala Dinas</span>
                  </h1>
                </div>
              </div>
              <Button
                text="TAMBAH KEPALA DINAS"
                icon={<Plus size={14} />}
                onClick={() => navigate("/admin/kadin/create")}
                className="!bg-[#2E5AA7] !rounded-full !px-6 !py-2.5 !text-[9px] font-black text-white shadow-lg shadow-blue-900/10 active:scale-95 border-none"
              />
            </header>

            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Input
                  placeholder="Cari nama atau email Kepala Dinas..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full !pl-11 !py-2.5 !bg-gray-50/50 !rounded-xl !text-[11px] font-bold border-gray-100"
                />
                <SearchIcon
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                  size={16}
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
                  className="!py-2 !bg-gray-50/50 !rounded-xl !text-[9px] font-black uppercase border-gray-100"
                />
              </div>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setCurrentPage(1);
                }}
                className="text-[9px] font-black text-gray-400 hover:text-rose-500 uppercase tracking-widest transition-colors px-2"
              >
                Reset Filter
              </button>
            </div>

            <div className="px-4 py-2 bg-blue-50/50 text-[#1E5AA5] rounded-lg border border-blue-100/50 font-black text-[8px] uppercase tracking-widest w-fit flex items-center gap-2 select-none">
              <Filter size={11} /> Hasil Pencarian: {totalItems} Personil
            </div>
          </div>

          <div className="flex-1 px-10 pb-4 overflow-y-auto custom-scrollbar">
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
              <Table
                columns={tableColumns}
                data={currentData}
                className="min-w-full border-collapse"
              />
              {!loading && totalItems === 0 && (
                <div className="p-12 text-center text-gray-300 font-bold italic text-xs uppercase tracking-wider">
                  Tidak ada data Kepala Dinas yang memenuhi kriteria filter.
                </div>
              )}
            </div>
          </div>

          <div className="px-10 py-5 mt-auto border-t border-gray-100 bg-gray-50/30 shrink-0">
            <Pagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              loading={loading}
            />
          </div>
        </Card>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(30, 90, 165, 0.2); border-radius: 10px; }
      `}</style>
    </PageWrapper>
  );
};

export default ReadKepalaDinas;