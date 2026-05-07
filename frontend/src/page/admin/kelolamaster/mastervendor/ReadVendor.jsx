/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search as SearchIcon,
  Database,
  Handshake,
  Filter,
  Eye,
  Edit3,
  Tags,
  CheckCircle,
} from "lucide-react";
import Swal from "sweetalert2";

import Sidebar from "../../../../components/Sidebar";
import Card from "../../../../components/Card";
import Button from "../../../../components/Button";
import Input from "../../../../components/Input";
import Table from "../../../../components/Table";
import PageWrapper from "../../../../components/PageWrapper";
import Pagination from "../../../../components/Pagination";
import Dropdown from "../../../../components/Dropdown";
import Label from "../../../../components/Label";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const ReadVendor = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState(
    localStorage.getItem("vnd_search") || "",
  );
  const [filterStatus, setFilterStatus] = useState(
    localStorage.getItem("vnd_status") || "all",
  );
  const [filterPilar, setFilterPilar] = useState(
    localStorage.getItem("vnd_pilar") || "all",
  );
  const [currentPage, setCurrentPage] = useState(
    Number(localStorage.getItem("vnd_page")) || 1,
  );

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 5;

  useEffect(() => {
    localStorage.setItem("vnd_search", searchTerm);
    localStorage.setItem("vnd_status", filterStatus);
    localStorage.setItem("vnd_pilar", filterPilar);
    localStorage.setItem("vnd_page", currentPage);
  }, [searchTerm, filterStatus, filterPilar, currentPage]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3000/vendor", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVendors(res.data);
    } catch (err) {
      Toast.fire({ icon: "error", title: "Gagal sinkronisasi data vendor" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleToggleStatus = async (id, name, currentStatus) => {
    const isBermitra = currentStatus === "Bermitra";
    const nextStatus = isBermitra ? "Tidak Bermitra" : "Bermitra";
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:3000/vendor/${id}`,
        { status: nextStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      await fetchVendors();
      Toast.fire({
        icon: "success",
        title: `${name} kini ${nextStatus}`,
      });
    } catch {
      Toast.fire({ icon: "error", title: "Gagal memperbarui status" });
    }
  };

  const filteredData = vendors
    .filter((v) => {
      const matchSearch =
        v.nama_vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.pj_1?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === "all" || v.status === filterStatus;
      const matchPilar = filterPilar === "all" || v.pilar === filterPilar;
      return matchSearch && matchStatus && matchPilar;
    })
    .sort((a, b) => b.id_vendor - a.id_vendor);

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
      header: "LEMBAGA VENDOR",
      align: "text-left w-[30%]",
      render: (row) => (
        <div className="flex flex-col py-3.5">
          <span className="font-black text-gray-800 uppercase text-[11px] tracking-tight truncate">
            {row.nama_vendor}
          </span>
          <span className="text-[9px] text-gray-400 font-bold mt-1 uppercase tracking-widest">
            REG: {row.no_register || "-"}
          </span>
        </div>
      ),
    },
    {
      header: "BIDANG / PILAR",
      align: "text-left w-[18%]",
      render: (row) => (
        <span className="text-[11px] font-black text-gray-700 uppercase tracking-tight py-3.5">
          {row.pilar || "-"}
        </span>
      ),
    },
    {
      header: "PENANGGUNG JAWAB",
      align: "text-left w-[22%]",
      render: (row) => (
        <div className="flex flex-col py-3.5">
          <span className="font-black text-gray-800 uppercase text-[11px] tracking-tight">
            {row.pj_1 || "-"}
          </span>
          <span className="text-[9px] text-gray-400 font-bold mt-1 lowercase italic">
            {row.telp_pj_1 || "-"}
          </span>
        </div>
      ),
    },
    {
      header: "KONTROL OTORITAS",
      align: "text-left w-[240px]",
      render: (row) => {
        const isBermitra = row.status === "Bermitra";
        return (
          <div className="flex gap-3 items-center py-3.5">
            <div className="flex">
              <Button
                icon={<Eye size={16} />}
                onClick={() =>
                  navigate(`/admin/vendor/detail/${row.id_vendor}`)
                }
                className="!p-2 !bg-transparent !text-gray-400 hover:!text-blue-600 !shadow-none"
              />
              <Button
                icon={<Edit3 size={15} />}
                onClick={() => navigate(`/admin/vendor/edit/${row.id_vendor}`)}
                className="!p-2 !bg-transparent !text-gray-400 hover:!text-amber-500 !shadow-none"
              />
            </div>
            <div
              onClick={() =>
                handleToggleStatus(row.id_vendor, row.nama_vendor, row.status)
              }
              className="flex items-center gap-3 cursor-pointer active:scale-95 transition-all"
            >
              <div
                className={`relative w-9 h-5 rounded-full transition-all duration-500 ${isBermitra ? "bg-emerald-500 shadow-lg shadow-emerald-100" : "bg-gray-300"} p-1`}
              >
                <div
                  className={`w-3 h-3 bg-white rounded-full transition-all duration-300 shadow-sm ${isBermitra ? "translate-x-4" : "translate-x-0"}`}
                />
              </div>
              <span
                className={`text-[9px] font-black uppercase tracking-widest ${isBermitra ? "text-emerald-600" : "text-gray-400"}`}
              >
                {isBermitra ? "Bermitra" : "Non-Aktif"}
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
                  <Handshake size={24} />
                </div>
                <div className="flex flex-col">
                  <Label
                    text="Educational Partner Registry"
                    className="!text-[8px] !text-[#1E5AA5] !font-black !italic uppercase"
                  />
                  <h1 className="text-xl font-black text-gray-800 uppercase leading-none">
                    Manajemen <span className="text-[#2E5AA7]">Vendor</span>
                  </h1>
                </div>
              </div>
              <Button
                text="REGISTRASI VENDOR"
                icon={<Plus size={14} />}
                onClick={() => navigate("/admin/vendor/create")}
                className="!bg-[#2E5AA7] !rounded-full !px-6 !py-2.5 !text-[9px] font-black text-white shadow-lg active:scale-95 transition-all"
              />
            </header>

            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Input
                  placeholder="Cari nama vendor atau PJ..."
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
                    { value: "Bermitra", label: "BERMITRA" },
                    { value: "Tidak Bermitra", label: "TIDAK BERMITRA" },
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
                  icon={Tags}
                  value={filterPilar}
                  items={[
                    { value: "all", label: "SEMUA PILAR" },
                    { value: "Akademik", label: "AKADEMIK" },
                    { value: "Karakter", label: "KARAKTER" },
                    { value: "Seni Budaya", label: "SENI BUDAYA" },
                    { value: "Kecakapan Hidup", label: "KECAKAPAN HIDUP" },
                  ]}
                  onChange={(v) => {
                    setFilterPilar(v);
                    setCurrentPage(1);
                  }}
                  className="!py-2 !bg-gray-50/50 !rounded-xl !text-[9px] font-black uppercase"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="px-4 py-2 bg-blue-50/50 text-[#1E5AA5] rounded-lg border border-blue-100/50 font-black text-[8px] uppercase tracking-widest w-fit">
                <Filter size={12} className="inline mr-2" /> Hasil: {totalItems}{" "}
                Entities
              </div>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                  setFilterPilar("all");
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

export default ReadVendor;
