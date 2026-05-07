/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// Import Lucide Icons Lengkap
import {
  Plus,
  Search as SearchIcon,
  MapPin,
  Globe,
  Database,
  Filter,
  Layers,
  CheckCircle,
  Edit3, // Pastikan ini ada
} from "lucide-react";
import Swal from "sweetalert2";

// IMPORT KOMPONEN UI PREMIUM
import Sidebar from "../../../../components/Sidebar";
import Card from "../../../../components/Card";
import Button from "../../../../components/Button";
import PageWrapper from "../../../../components/PageWrapper";
import Table from "../../../../components/Table";
import Pagination from "../../../../components/Pagination";
import Dropdown from "../../../../components/Dropdown";
import Input from "../../../../components/Input";
import Label from "../../../../components/Label";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const ReadWilayah = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(
    localStorage.getItem("wil_search") || "",
  );
  const [filterStatus, setFilterStatus] = useState(
    localStorage.getItem("wil_status") || "all",
  );
  const [filterKeterangan, setFilterKeterangan] = useState(
    localStorage.getItem("wil_ket") || "all",
  );
  const [currentPage, setCurrentPage] = useState(
    Number(localStorage.getItem("wil_page")) || 1,
  );

  const [loading, setLoading] = useState(true);
  const [wilayahList, setWilayahList] = useState([]);
  const itemsPerPage = 5;

  useEffect(() => {
    localStorage.setItem("wil_search", searchTerm);
    localStorage.setItem("wil_status", filterStatus);
    localStorage.setItem("wil_ket", filterKeterangan);
    localStorage.setItem("wil_page", currentPage);
  }, [searchTerm, filterStatus, filterKeterangan, currentPage]);

  const fetchWilayah = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/wilayah", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWilayahList(response.data);
    } catch (error) {
      Toast.fire({ icon: "error", title: "Gagal sinkronisasi data wilayah" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWilayah();
  }, []);

  const handleToggleStatus = async (id, name, currentStatus) => {
    const nextStatus = !currentStatus;
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:3000/wilayah/${id}`,
        { status: nextStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      await fetchWilayah();
      Toast.fire({
        icon: "success",
        title: `${name.split("/").filter(Boolean).pop()} Berhasil ${nextStatus ? "Diaktifkan" : "Dinonaktifkan"}`,
      });
    } catch (error) {
      Toast.fire({ icon: "error", title: "Gagal memperbarui status wilayah" });
    }
  };

  const filteredWilayah = wilayahList
    .filter((w) => {
      const matchesSearch = w.nama_wilayah
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all"
          ? true
          : filterStatus === "active"
            ? w.status === true
            : w.status === false;
      const matchesKeterangan =
        filterKeterangan === "all" ? true : w.keterangan === filterKeterangan;
      return matchesSearch && matchesStatus && matchesKeterangan;
    })
    .sort((a, b) => b.id_wilayah - a.id_wilayah);

  const totalItems = filteredWilayah.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const currentData = filteredWilayah.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const columns = [
    {
      header: "NO",
      align: "text-left pl-8 w-[70px]",
      render: (_, idx) => (
        <span className="text-[10px] font-mono font-bold text-gray-400">
          {String((currentPage - 1) * itemsPerPage + idx + 1).padStart(2, "0")}
        </span>
      ),
    },
    {
      header: "WILAYAH BINAAN",
      align: "text-left w-[35%]",
      render: (row) => {
        const nameParts = row.nama_wilayah?.split("/").filter(Boolean) || [];
        const mainName = nameParts.pop() || "Unknown Area";
        const hierarchy = nameParts.join(" • ");
        return (
          <div className="flex flex-col py-3.5">
            <span className="font-black text-gray-800 uppercase text-[11px] tracking-tight">
              {mainName}
            </span>
            <span className="text-[9px] text-gray-400 font-bold lowercase truncate">
              {hierarchy || row.deskripsi}
            </span>
          </div>
        );
      },
    },
    {
      header: "KLASIFIKASI",
      align: "text-left w-[20%]",
      render: (row) => {
        const isIndependent = row.keterangan === "Independent";
        return (
          <span
            className={`text-[10px] font-black uppercase tracking-tight ${
              isIndependent ? "text-blue-600" : "text-indigo-600"
            }`}
          >
            {row.keterangan?.toUpperCase() || "ABSOLUTE"}
          </span>
        );
      },
    },
    {
      header: "KONTROL STATUS",
      align: "text-left w-[240px]",
      render: (row) => {
        const isActive = row.status === true || row.status === "true";
        return (
          <div className="flex gap-3 items-center py-3.5">
            <div className="flex">
              <Button
                icon={<SearchIcon size={16} />}
                onClick={() =>
                  navigate(`/admin/wilayah/detail/${row.id_wilayah}`)
                }
                className="!p-2 !bg-transparent !text-gray-400 hover:!text-blue-600 !shadow-none"
              />
              <Button
                icon={<Edit3 size={15} />}
                onClick={() =>
                  navigate(`/admin/wilayah/edit/${row.id_wilayah}`)
                }
                className="!p-2 !bg-transparent !text-gray-400 hover:!text-amber-500 !shadow-none"
              />
            </div>
            <div
              onClick={() =>
                handleToggleStatus(row.id_wilayah, row.nama_wilayah, row.status)
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
                  <Globe size={24} />
                </div>
                <div className="flex flex-col">
                  <Label
                    text="Spatial & Regional Database Center"
                    className="!text-[8px] !text-[#1E5AA5] !font-black !italic uppercase"
                  />
                  <h1 className="text-xl font-black text-gray-800 uppercase leading-none">
                    Data <span className="text-[#2E5AA7]">Wilayah Binaan</span>
                  </h1>
                </div>
              </div>
              <Button
                text="SET AREA BARU"
                icon={<Plus size={14} />}
                onClick={() => navigate("/admin/wilayah/create")}
                className="!bg-[#2E5AA7] !rounded-full !px-6 !py-2.5 !text-[9px] font-black text-white shadow-lg active:scale-95 transition-all"
              />
            </header>

            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Input
                  placeholder="Cari wilayah..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full !pl-11 !py-2.5 !bg-gray-50/50 !border-gray-200/50 !rounded-xl !text-[11px] font-bold"
                />
                <SearchIcon
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                  size={16}
                />
              </div>
              <div className="w-52">
                <Dropdown
                  icon={CheckCircle}
                  value={filterStatus}
                  items={[
                    { value: "all", label: "SEMUA STATUS" },
                    { value: "active", label: "WILAYAH AKTIF" },
                    { value: "inactive", label: "NON-AKTIF" },
                  ]}
                  onChange={(v) => {
                    setFilterStatus(v);
                    setCurrentPage(1);
                  }}
                  className="!py-2 !bg-gray-50/50 !rounded-xl !text-[9px] font-black uppercase"
                />
              </div>
              <div className="w-52">
                <Dropdown
                  icon={Layers}
                  value={filterKeterangan}
                  items={[
                    { value: "all", label: "SEMUA TIPE" },
                    { value: "Independent", label: "INDEPENDENT" },
                    { value: "Absolute", label: "ABSOLUTE" },
                  ]}
                  onChange={(v) => {
                    setFilterKeterangan(v);
                    setCurrentPage(1);
                  }}
                  className="!py-2 !bg-gray-50/50 !rounded-xl !text-[9px] font-black uppercase"
                />
              </div>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                  setFilterKeterangan("all");
                  setCurrentPage(1);
                }}
                className="text-[8px] font-black text-gray-400 hover:text-rose-500 uppercase tracking-widest transition-colors"
              >
                Reset Filter
              </button>
            </div>

            <div className="px-4 py-2 bg-blue-50/50 text-[#1E5AA5] rounded-lg border border-blue-100/50 font-black text-[8px] uppercase tracking-widest w-fit">
              <Filter size={12} className="inline mr-2" /> Hasil: {totalItems}{" "}
              Geo-Locations
            </div>
          </div>

          <div className="flex-none px-10 pb-4 overflow-hidden">
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
              <Table
                columns={columns}
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

export default ReadWilayah;
