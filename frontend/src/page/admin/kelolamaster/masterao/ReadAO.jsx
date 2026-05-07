/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Plus,
  Search as SearchIcon,
  Briefcase,
  MapPin,
  Database,
  Eye,
  Edit3,
  Filter,
  CheckCircle,
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

const ReadAO = () => {
  const [searchTerm, setSearchTerm] = useState(
    localStorage.getItem("ao_search") || "",
  );
  const [filterWilayah, setFilterWilayah] = useState(
    localStorage.getItem("ao_wilayah") || "all",
  );
  const [filterStatus, setFilterStatus] = useState(
    localStorage.getItem("ao_status") || "all",
  ); // TAMBAH INI
  const [currentPage, setCurrentPage] = useState(
    Number(localStorage.getItem("ao_page")) || 1,
  );

  const [aos, setAos] = useState([]);
  const [wilayahList, setWilayahList] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("ao_search", searchTerm);
    localStorage.setItem("ao_wilayah", filterWilayah);
    localStorage.setItem("ao_status", filterStatus); // TAMBAH INI
    localStorage.setItem("ao_page", currentPage);
  }, [searchTerm, filterWilayah, filterStatus, currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const resAO = await axios.get("http://localhost:3000/users/ao", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAos(resAO.data.filter((u) => Number(u.id_role) === 4));

      const resWilayah = await axios.get("http://localhost:3000/wilayah", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWilayahList(resWilayah.data);
    } catch (error) {
      Toast.fire({ icon: "error", title: "Gagal sinkronisasi data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
        { headers: { Authorization: `Bearer ${token}` } },
      );
      await fetchData();
      Toast.fire({
        icon: "success",
        title: `${name} sekarang ${nextStatus ? "Aktif" : "Nonaktif"}`,
      });
    } catch {
      Toast.fire({ icon: "error", title: "Gagal update otoritas" });
    }
  };

  // LOGIKA FILTER — tambah matchesStatus
  const filteredData = aos
    .filter((ao) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        ao.nama?.toLowerCase().includes(search) ||
        ao.email?.toLowerCase().includes(search);

      const matchesWilayah =
        filterWilayah === "all"
          ? true
          : ao.wilayah?.some((w) => w.id_wilayah === Number(filterWilayah));

      const isActive =
        ao.status === true || ao.status === "true" || Number(ao.status) === 1;
      const matchesStatus =
        filterStatus === "all"
          ? true
          : filterStatus === "active"
            ? isActive
            : !isActive;

      return matchesSearch && matchesWilayah && matchesStatus;
    })
    .sort((a, b) => b.id_user - a.id_user);

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
      header: "IDENTITAS AREA OFFICER",
      align: "text-left w-[30%]",
      render: (row) => (
        <div className="flex flex-col py-3.5">
          <span className="font-black text-gray-800 uppercase text-[11px] tracking-tight">
            {row.nama}
          </span>
          <span className="text-[9px] text-gray-400 font-bold mt-1 lowercase truncate">
            {row.email}
          </span>
        </div>
      ),
    },
    {
      header: "WILAYAH PENUGASAN",
      align: "text-left w-[35%]",
      render: (row) => (
        <div className="flex flex-wrap items-center gap-x-2 py-3.5">
          {row.wilayah?.length > 0 ? (
            row.wilayah.map((w, idx) => (
              <div key={idx} className="flex items-center">
                <span className="text-[11px] font-black text-gray-900 uppercase tracking-tight">
                  {w.nama_wilayah?.split("/").filter(Boolean).pop()}
                </span>
                {idx < row.wilayah.length - 1 && (
                  <span className="ml-2 text-gray-300 font-black">•</span>
                )}
              </div>
            ))
          ) : (
            <span className="text-[10px] text-gray-300 italic font-bold">
              BELUM DITUGASKAN
            </span>
          )}
        </div>
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
                onClick={() => navigate(`/admin/ao/detail/${row.id_user}`)}
                className="!p-2 !bg-transparent !text-gray-400 hover:!text-blue-600 !shadow-none"
              />
              <Button
                icon={<Edit3 size={15} />}
                onClick={() => navigate(`/admin/ao/edit/${row.id_user}`)}
                className="!p-2 !bg-transparent !text-gray-400 hover:!text-amber-500 !shadow-none"
              />
            </div>
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
                  <Briefcase size={24} />
                </div>
                <div className="flex flex-col">
                  <Label
                    text="Sistem Monitoring Area Strategis"
                    className="!text-[8px] !text-[#1E5AA5] !font-black !italic uppercase"
                  />
                  <h1 className="text-xl font-black text-gray-800 uppercase">
                    Manajemen Data{" "}
                    <span className="text-[#2E5AA7]">Area Officer</span>
                  </h1>
                </div>
              </div>
              <Button
                text="REGISTRASI AO"
                icon={<Plus size={14} />}
                onClick={() => navigate("/admin/ao/create")}
                className="!bg-[#2E5AA7] !rounded-full !px-6 !py-2.5 !text-[9px] font-black text-white shadow-lg active:scale-95 transition-all"
              />
            </header>

            <div className="flex flex-col md:flex-row gap-3 mb-6">
              {/* Search */}
              <div className="relative flex-1">
                <Input
                  placeholder="Cari nama/email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full !pl-11 !py-2.5 !bg-gray-50/50 !rounded-xl !text-[11px] font-bold outline-none"
                />
                <SearchIcon
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                  size={16}
                />
              </div>

              {/* Filter Wilayah */}
              <div className="w-56">
                <Dropdown
                  icon={MapPin}
                  value={filterWilayah}
                  items={[
                    { value: "all", label: "SEMUA WILAYAH" },
                    ...wilayahList.map((w) => ({
                      value: w.id_wilayah.toString(),
                      label: w.nama_wilayah
                        .split("/")
                        .filter(Boolean)
                        .pop()
                        .toUpperCase(),
                    })),
                  ]}
                  onChange={(v) => {
                    setFilterWilayah(v);
                    setCurrentPage(1);
                  }}
                  className="!py-2 !bg-gray-50/50 !rounded-xl !text-[9px] font-black uppercase"
                />
              </div>

              {/* Filter Status — TAMBAHAN BARU */}
              <div className="w-52">
                <Dropdown
                  icon={CheckCircle}
                  value={filterStatus}
                  items={[
                    { value: "all", label: "SEMUA STATUS" },
                    { value: "active", label: "AKTIF" },
                    { value: "inactive", label: "NONAKTIF" },
                  ]}
                  onChange={(v) => {
                    setFilterStatus(v);
                    setCurrentPage(1);
                  }}
                  className="!py-2 !bg-gray-50/50 !rounded-xl !text-[9px] font-black uppercase"
                />
              </div>

              {/* Reset */}
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterWilayah("all");
                  setFilterStatus("all");
                  setCurrentPage(1);
                }}
                className="text-[8px] font-black text-gray-400 hover:text-rose-500 uppercase tracking-widest transition-colors"
              >
                Reset Filter
              </button>
            </div>

            <div className="px-4 py-2 bg-blue-50/50 text-[#1E5AA5] rounded-lg border border-blue-100/50 font-black text-[8px] uppercase tracking-widest w-fit">
              <Filter size={12} className="inline mr-2" /> Hasil Filter:{" "}
              {totalItems} Personnel
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

export default ReadAO;
