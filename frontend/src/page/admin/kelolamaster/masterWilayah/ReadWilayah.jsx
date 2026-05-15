/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Plus,
  Search as SearchIcon,
  Globe,
  MapPin,
  Layers,
  Database,
  Eye,
  Edit3,
  Filter,
  CheckCircle,
  RotateCcw,
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

const ReadWilayah = () => {
  const navigate = useNavigate();

  // --- STATE DENGAN PERSISTENSI LOCAL STORAGE ---
  const [searchTerm, setSearchTerm] = useState(
    localStorage.getItem("wil_filter_search") || ""
  );
  const [statusFilter, setStatusFilter] = useState(
    localStorage.getItem("wil_filter_status") || "all"
  );
  const [ketFilter, setKetFilter] = useState(
    localStorage.getItem("wil_filter_ket") || "all"
  );
  const [currentPage, setCurrentPage] = useState(
    Number(localStorage.getItem("wil_filter_page")) || 1
  );

  const [wilayahList, setWilayahList] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 5;

  const filterStatusOptions = [
    { value: "all", label: "SEMUA STATUS" },
    { value: "active", label: "STATUS: AKTIF" },
    { value: "inactive", label: "STATUS: NONAKTIF" },
  ];

  const filterKetOptions = [
    { value: "all", label: "SEMUA KLASIFIKASI" },
    { value: "Absolute", label: "ABSOLUTE" },
    { value: "Independent", label: "INDEPENDENT" },
  ];

  // --- SIMPAN SETIAP PERUBAHAN KE LOCAL STORAGE ---
  useEffect(() => {
    localStorage.setItem("wil_filter_search", searchTerm);
    localStorage.setItem("wil_filter_status", statusFilter);
    localStorage.setItem("wil_filter_ket", ketFilter);
    localStorage.setItem("wil_filter_page", currentPage);
  }, [searchTerm, statusFilter, ketFilter, currentPage]);

  const fetchWilayah = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/wilayah", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWilayahList(response.data);
    } catch (error) {
      Toast.fire({ icon: "error", title: "Gagal memuat data wilayah" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWilayah();
  }, []);

  const handleToggleStatus = async (id, name, currentStatus) => {
    const nextStatus = !currentStatus;
    const regionName = name.split("/").filter(Boolean).pop();
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:3000/wilayah/${id}`,
        { status: nextStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchWilayah();
      Toast.fire({
        icon: "success",
        title: `${regionName} sekarang ${nextStatus ? "Aktif" : "Nonaktif"}`,
      });
    } catch (e) {
      Toast.fire({ icon: "error", title: "Gagal update status" });
    }
  };

  // --- LOGIKA FILTER & SORTING ---
  const filteredData = wilayahList
    .filter((w) => {
      const matchesSearch = w.nama_wilayah?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? w.status === true
            : w.status === false;
      const matchesKet = ketFilter === "all" ? true : w.keterangan === ketFilter;

      return matchesSearch && matchesStatus && matchesKet;
    })
    .sort((a, b) => b.id_wilayah - a.id_wilayah);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const tableColumns = [
    {
      header: "NO",
      align: "text-center w-[80px]",
      render: (_, i) => (
        <div className="flex justify-center">
          <span className="text-left font-mono text-[10px] font-bold text-gray-400 min-w-[20px]">
            {String((currentPage - 1) * itemsPerPage + i + 1).padStart(2, "0")}
          </span>
        </div>
      ),
    },
    {
      header: "WILAYAH BINAAN",
      align: "text-left w-[35%]",  // ← ganti text-center ke text-left
      render: (row) => {
        const nameParts = row.nama_wilayah?.split("/").filter(Boolean) || [];
        const mainName = nameParts.pop() || "Unknown Area";
        const hierarchy = nameParts.join(" • ");
        return (
          // ← hapus justify-center, langsung flex-col
          <div className="flex flex-col gap-0.5 py-2">
            <span className="font-black text-gray-800 uppercase text-[11px] leading-tight tracking-tight">
              {mainName}
            </span>
            <span className="text-[9px] text-gray-400 font-bold lowercase truncate max-w-[280px]">
              {hierarchy || row.deskripsi}
            </span>
          </div>
        );
      },
    },
    {
      header: "KLASIFIKASI",
      align: "text-center w-[20%]",
      render: (row) => (
        <div className="flex justify-center">
          <div className="text-left min-w-[120px]">
            <span
              className={`text-[10px] font-black uppercase tracking-widest ${row.keterangan === "Independent" ? "text-purple-600" : "text-[#0AC4E0]"
                }`}
            >
              {row.keterangan || "ABSOLUTE"}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "KONTROL OTORITAS",
      align: "text-center w-[280px]",
      render: (row) => {
        const isActive = row.status === true;
        return (
          <div className="flex justify-center py-2">
            <div className="flex items-center gap-4 text-left min-w-[180px]">
              {/* Action Group */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => navigate(`/admin/wilayah/detail/${row.id_wilayah}`)}
                  className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-400 hover:text-[#0AC4E0] hover:bg-white rounded-lg transition-all active:scale-90"
                  title="View"
                >
                  <Eye size={15} />
                </button>
                <button
                  onClick={() => navigate(`/admin/wilayah/edit/${row.id_wilayah}`)}
                  className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-400 hover:text-amber-500 hover:bg-white rounded-lg transition-all active:scale-90"
                  title="Edit"
                >
                  <Edit3 size={14} />
                </button>
              </div>

              <div className="h-6 w-px bg-slate-100" />

              {/* Toggle Status */}
              <div
                onClick={() => handleToggleStatus(row.id_wilayah, row.nama_wilayah, row.status)}
                className="flex items-center gap-2 cursor-pointer group active:scale-95 transition-all"
              >
                <div
                  className={`relative w-8 h-4.5 rounded-full transition-all duration-500 p-0.5 ${isActive ? "bg-emerald-500 shadow-sm shadow-emerald-200" : "bg-gray-200"
                    }`}
                >
                  <div
                    className={`w-3.5 h-3.5 bg-white rounded-full transition-all duration-300 shadow-sm ${isActive ? "translate-x-3.5" : "translate-x-0"
                      }`}
                  />
                </div>
                <span
                  className={`text-[9px] font-black uppercase tracking-widest ${isActive ? "text-emerald-600" : "text-slate-400"
                    }`}
                >
                  {isActive ? "On" : "Off"}
                </span>
              </div>
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
        <Card className="flex-1 flex flex-col !m-0 !p-0 rounded-[2.5rem] shadow-2xl bg-white overflow-hidden relative">
          <div className="px-10 pt-8 pb-6 shrink-0">
            <header className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">

                <div className="flex flex-col gap-1">
                  <Label
                    text="Spatial & Regional Database Center"
                    className="!text-[8px] !text-[#0AC4E0] !font-black !italic uppercase"
                  />
                  <h1 className="text-xl font-black text-gray-800 uppercase">
                    Manajemen Data <span className="text-[#0AC4E0]">Wilayah Binaan</span>
                  </h1>
                </div>
              </div>
              <Button
                text="SET AREA BARU"
                icon={<Plus size={14} />}
                onClick={() => navigate("/admin/wilayah/create")}
                className="!bg-[#0AC4E0] !rounded-full !px-6 !py-2.5 !text-[9px] font-black text-white shadow-lg active:scale-95 transition-all"
              />
            </header>

            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <div className="relative flex-1 group">
                <Input
                  placeholder="Cari label wilayah atau alamat..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full !pl-11 !py-2.5 !bg-gray-50/50 !border-gray-200/50 !rounded-xl !text-[11px] font-bold focus:!bg-white focus:!ring-4 focus:!ring-[#0AC4E0]/10 transition-all outline-none"
                />
                <SearchIcon
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#0AC4E0] transition-colors"
                  size={16}
                />
              </div>
              <div className="w-56">
                <Dropdown
                  icon={Layers}
                  value={ketFilter}
                  items={filterKetOptions}
                  onChange={(v) => {
                    setKetFilter(v);
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
                  setKetFilter("all");
                  setCurrentPage(1);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all active:rotate-180 duration-500"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            <div className="px-4 py-2 bg-[#0AC4E0]/5 text-[#0AC4E0] rounded-lg border border-[#0AC4E0]/10 font-black text-[8px] uppercase tracking-widest w-fit">
              <Filter size={12} className="inline mr-2" /> Terdata: {totalItems} Geo-Locations
            </div>
          </div>

          <div className="flex-none px-10 pb-4 overflow-hidden">
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
              <Table
                columns={tableColumns}
                data={currentData}
                className="min-w-full border-collapse"
              />
              {!loading && currentData.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 opacity-20 text-gray-900">
                  <Database size={40} className="mb-2" />
                  <p className="text-xs font-black uppercase tracking-widest">Data Kosong</p>
                </div>
              )}
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

export default ReadWilayah;