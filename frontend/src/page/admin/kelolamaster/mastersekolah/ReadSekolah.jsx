/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search as SearchIcon,
  School,
  MapPin,
  Database,
  Filter,
  Award,
  Eye,
  Edit3,
  Trash2,
  Globe,
} from "lucide-react";
import Swal from "sweetalert2";

// Komponen Atomik Premium
import Sidebar from "../../../../components/Sidebar";
import Card from "../../../../components/Card";
import Button from "../../../../components/Button";
import Input from "../../../../components/Input";
import Table from "../../../../components/Table";
import PageWrapper from "../../../../components/PageWrapper";
import Pagination from "../../../../components/Pagination";
import Dropdown from "../../../../components/Dropdown";
import Label from "../../../../components/Label";

// Konfigurasi Toast
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const ReadSekolah = () => {
  const navigate = useNavigate();

  // --- PERSISTENSI FILTER ---
  const [searchTerm, setSearchTerm] = useState(
    localStorage.getItem("sch_search") || "",
  );
  const [filterWilayah, setFilterWilayah] = useState(
    localStorage.getItem("sch_wilayah") || "all",
  );
  const [filterAkreditasi, setFilterAkreditasi] = useState(
    localStorage.getItem("sch_akred") || "all",
  );
  const [currentPage, setCurrentPage] = useState(
    Number(localStorage.getItem("sch_page")) || 1,
  );

  const [sekolah, setSekolah] = useState([]);
  const [listWilayah, setListWilayah] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 5;

  useEffect(() => {
    localStorage.setItem("sch_search", searchTerm);
    localStorage.setItem("sch_wilayah", filterWilayah);
    localStorage.setItem("sch_akred", filterAkreditasi);
    localStorage.setItem("sch_page", currentPage);
  }, [searchTerm, filterWilayah, filterAkreditasi, currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const [resSekolah, resWilayah] = await Promise.all([
        axios.get("http://localhost:3000/sekolah", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:3000/wilayah", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setSekolah(resSekolah.data);
      setListWilayah(resWilayah.data);
    } catch (err) {
      Toast.fire({ icon: "error", title: "Gagal sinkronisasi data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (id, name, currentStatus) => {
    // Paksa ke boolean murni
    const nextStatus = !(
      currentStatus === true ||
      currentStatus === "true" ||
      Number(currentStatus) === 1
    );

    try {
      const token = localStorage.getItem("token");

      // Pastikan URL-nya benar: /sekolah/:id
      await axios.patch(
        `http://localhost:3000/sekolah/${id}`,
        { status: nextStatus }, // Body hanya mengirim field status
        { headers: { Authorization: `Bearer ${token}` } },
      );

      await fetchData(); // Refresh data tabel

      Toast.fire({
        icon: "success",
        title: `${name} sekarang ${nextStatus ? "Aktif" : "Nonaktif"}`,
      });
    } catch (e) {
      // Lihat console log untuk detail error 500-nya
      console.error("Error detail:", e.response?.data);
      Toast.fire({ icon: "error", title: "Gagal memperbarui status unit" });
    }
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: "Hapus Unit Sekolah?",
      text: `Unit ${name} akan dihapus permanen dari sistem.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
      customClass: { popup: "rounded-[2rem]" },
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:3000/sekolah/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Toast.fire({ icon: "success", title: "Unit berhasil dihapus" });
        fetchData();
      } catch (err) {
        Toast.fire({ icon: "error", title: "Gagal menghapus data" });
      }
    }
  };

  // --- LOGIKA FILTER ---
  const filteredData = sekolah
    .filter((s) => {
      const matchSearch =
        s.nama_sekolah?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.npsn?.includes(searchTerm);
      const matchWilayah =
        filterWilayah === "all" || s.wilayah?.nama_wilayah === filterWilayah;
      const matchAkreditasi =
        filterAkreditasi === "all" || s.akreditasi === filterAkreditasi;
      return matchSearch && matchWilayah && matchAkreditasi;
    })
    .sort((a, b) => b.id_sekolah - a.id_sekolah);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const wilayahOptions = [
    { value: "all", label: "SEMUA WILAYAH" },
    ...listWilayah.map((w) => ({
      value: w.nama_wilayah,
      label: w.nama_wilayah.split("/").filter(Boolean).pop().toUpperCase(),
    })),
  ];

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
      header: "NPSN",
      align: "text-left w-[120px]",
      render: (row) => (
        <span className="text-[11px] font-mono font-black text-[#1E5AA5] tracking-widest py-3.5">
          {row.npsn || "00000000"}
        </span>
      ),
    },
    {
      header: "NAMA SEKOLAH",
      align: "text-left w-[25%]",
      render: (row) => (
        <div className="flex flex-col py-3.5">
          <span className="font-black text-gray-800 uppercase text-[11px] tracking-tight truncate">
            {row.nama_sekolah}
          </span>
          <span className="text-[9px] text-gray-400 font-bold mt-1 uppercase tracking-widest">
            {row.jenjang} EDUCATION
          </span>
        </div>
      ),
    },
    {
      header: "NAMA WILAYAH",
      align: "text-left w-[20%]",
      render: (row) => (
        <span className="text-[11px] font-black text-gray-700 uppercase tracking-tight py-3.5">
          {row.wilayah?.nama_wilayah?.split("/").filter(Boolean).pop() ||
            "PUSAT"}
        </span>
      ),
    },
    {
      header: "AKREDITASI",
      align: "text-left w-[12%]",
      render: (row) => (
        <span className="text-[11px] font-black text-gray-800 uppercase py-3.5">
          {row.akreditasi ? `Grade ${row.akreditasi}` : "Proses"}
        </span>
      ),
    },
    {
      header: "KONTROL OTORITAS",
      align: "text-left w-[240px]",
      render: (row) => {
        const isActive =
          row.status === true ||
          row.status === "true" ||
          Number(row.status) === 1;
        return (
          <div className="flex gap-3 items-center py-3.5">
            <div className="flex">
              <Button
                icon={<Eye size={16} />}
                onClick={() =>
                  navigate(`/admin/sekolah/detail/${row.id_sekolah}`)
                }
                className="!p-2 !bg-transparent !text-gray-400 hover:!text-blue-600 !shadow-none"
              />
              <Button
                icon={<Edit3 size={15} />}
                onClick={() =>
                  navigate(`/admin/sekolah/edit/${row.id_sekolah}`)
                }
                className="!p-2 !bg-transparent !text-gray-400 hover:!text-amber-500 !shadow-none"
              />
              <Button
                icon={<Trash2 size={15} />}
                onClick={() => handleDelete(row.id_sekolah, row.nama_sekolah)}
                className="!p-2 !bg-transparent !text-gray-400 hover:!text-rose-500 !shadow-none"
              />
            </div>

            {/* SLIDING TOGGLE STATUS */}
            <div
              onClick={() =>
                handleToggleStatus(row.id_sekolah, row.nama_sekolah, row.status)
              }
              className="flex items-center gap-3 cursor-pointer group active:scale-95 transition-all"
            >
              <div
                className={`relative w-9 h-5 rounded-full transition-all duration-500 ${isActive ? "bg-emerald-500 shadow-lg shadow-emerald-100" : "bg-gray-300"} p-1`}
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
                  <School size={24} />
                </div>
                <div className="flex flex-col">
                  <Label
                    text="Educational Entity Database"
                    className="!text-[8px] !text-[#1E5AA5] !font-black !italic uppercase"
                  />
                  <h1 className="text-xl font-black text-gray-800 uppercase leading-none">
                    Master <span className="text-[#2E5AA7]">Unit Sekolah</span>
                  </h1>
                </div>
              </div>
              <Button
                text="REGISTRASI UNIT"
                icon={<Plus size={14} />}
                onClick={() => navigate("/admin/sekolah/create")}
                className="!bg-[#2E5AA7] !rounded-full !px-6 !py-2.5 !text-[9px] font-black text-white shadow-lg active:scale-95"
              />
            </header>

            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Input
                  placeholder="Cari nama atau NPSN..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full !pl-11 !py-2.5 !bg-gray-50/50 !border-gray-200/50 !rounded-xl !text-[11px] font-bold outline-none"
                />
                <SearchIcon
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                  size={16}
                />
              </div>
              <div className="w-56">
                <Dropdown
                  icon={Globe}
                  value={filterWilayah}
                  items={wilayahOptions}
                  onChange={(v) => {
                    setFilterWilayah(v);
                    setCurrentPage(1);
                  }}
                  className="!py-2 !bg-gray-50/50 !rounded-xl !text-[9px] font-black uppercase"
                />
              </div>
              <div className="w-52">
                <Dropdown
                  icon={Award}
                  value={filterAkreditasi}
                  items={[
                    { value: "all", label: "SEMUA AKREDITASI" },
                    { value: "A", label: "GRADE A" },
                    { value: "B", label: "GRADE B" },
                    { value: "C", label: "GRADE C" },
                  ]}
                  onChange={(v) => {
                    setFilterAkreditasi(v);
                    setCurrentPage(1);
                  }}
                  className="!py-2 !bg-gray-50/50 !rounded-xl !text-[9px] font-black uppercase"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="px-4 py-2 bg-blue-50/50 text-[#1E5AA5] rounded-lg border border-blue-100/50 font-black text-[8px] uppercase tracking-widest w-fit">
                <Filter size={12} className="inline mr-2" /> Hasil: {totalItems}{" "}
                Units
              </div>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterWilayah("all");
                  setFilterAkreditasi("all");
                  setCurrentPage(1);
                }}
                className="text-[8px] font-black text-gray-400 hover:text-rose-500 uppercase tracking-widest transition-colors"
              >
                Reset Filter
              </button>
            </div>
          </div>

          <div className="flex-none px-10 pb-4 overflow-hidden">
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table
                  columns={tableColumns}
                  data={currentData}
                  className="min-w-full border-collapse"
                />
                {!loading && currentData.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 opacity-20 text-gray-900">
                    <Database size={40} className="mb-2" />
                    <p className="text-xs font-black uppercase tracking-widest">
                      Data Tidak Ditemukan
                    </p>
                  </div>
                )}
              </div>
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

export default ReadSekolah;
