/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Plus,
  Search as SearchIcon,
  Database,
  Handshake,
  Eye,
  Edit3,
  Filter,
  CheckCircle,
  Tags,
  Phone,
  RotateCcw,
  Building2,
  Mail,
  User,
  FileText,
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

const getArrayPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.vendor)) return payload.vendor;
  if (Array.isArray(payload?.vendors)) return payload.vendors;

  return [];
};

const isMitraValue = (value) => {
  const raw = String(value || "").toLowerCase();

  return (
    raw === "bermitra" ||
    raw === "aktif" ||
    raw === "active" ||
    raw === "true" ||
    raw === "1"
  );
};

const normalizeStatus = (value) => {
  return isMitraValue(value) ? "Bermitra" : "Tidak Bermitra";
};

const normalizeVendor = (item) => ({
  ...item,
  id_vendor: item?.id_vendor ?? item?.idVendor ?? item?.id,
  nama_vendor:
    item?.nama_vendor ||
    item?.namaVendor ||
    item?.nama ||
    "Vendor Tidak Diketahui",
  no_register: item?.no_register || item?.noRegister || "UNSET",
  pilar: item?.pilar || "General",
  alamat: item?.alamat || "",
  pj_1: item?.pj_1 || item?.pj1 || item?.penanggung_jawab || "",
  telp_pj_1:
    item?.telp_pj_1 ||
    item?.telpPj1 ||
    item?.email_pj_1 ||
    item?.kontak_pj_1 ||
    "",
  pj_2: item?.pj_2 || item?.pj2 || "",
  telp_pj_2:
    item?.telp_pj_2 ||
    item?.telpPj2 ||
    item?.email_pj_2 ||
    item?.kontak_pj_2 ||
    "",
  email: item?.email || item?.user?.email || "",
  status: normalizeStatus(item?.status),
  npwp_file: item?.npwp_file || item?.npwpFile || "",
  ktp_pj_file: item?.ktp_pj_file || item?.ktpPjFile || "",
});

const ReadVendor = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState(
    localStorage.getItem("vnd_filter_search") || "",
  );

  const [statusFilter, setStatusFilter] = useState(
    localStorage.getItem("vnd_filter_status") || "all",
  );

  const [pilarFilter, setPilarFilter] = useState(
    localStorage.getItem("vnd_filter_pilar") || "all",
  );

  const [currentPage, setCurrentPage] = useState(
    Number(localStorage.getItem("vnd_filter_page")) || 1,
  );

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 5;

  const filterStatusOptions = [
    { value: "all", label: "SEMUA STATUS" },
    { value: "Bermitra", label: "STATUS: BERMITRA" },
    { value: "Tidak Bermitra", label: "STATUS: NONAKTIF" },
  ];

  const filterPilarOptions = [
    { value: "all", label: "SEMUA PILAR" },
    { value: "Akademik", label: "PILAR: AKADEMIK" },
    { value: "Karakter", label: "PILAR: KARAKTER" },
    { value: "Seni Budaya", label: "PILAR: SENI BUDAYA" },
    { value: "Kecakapan Hidup", label: "PILAR: KECAKAPAN HIDUP" },
    { value: "General", label: "PILAR: GENERAL" },
  ];

  useEffect(() => {
    localStorage.setItem("vnd_filter_search", searchTerm);
    localStorage.setItem("vnd_filter_status", statusFilter);
    localStorage.setItem("vnd_filter_pilar", pilarFilter);
    localStorage.setItem("vnd_filter_page", currentPage);
  }, [searchTerm, statusFilter, pilarFilter, currentPage]);

  const fetchVendors = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:3000/vendor", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = getArrayPayload(res.data)
        .map(normalizeVendor)
        .filter((item) => item.id_vendor);

      setVendors(data);
    } catch (err) {
      Toast.fire({
        icon: "error",
        title: "Gagal memuat data mitra vendor",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleToggleStatus = async (id, name, currentStatus) => {
    const nextStatus = isMitraValue(currentStatus)
      ? "Tidak Bermitra"
      : "Bermitra";

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
      Toast.fire({
        icon: "error",
        title: "Gagal memperbarui status mitra",
      });
    }
  };

  const filteredData = useMemo(() => {
    return vendors
      .filter((vendor) => {
        const search = searchTerm.toLowerCase();

        const matchesSearch =
          vendor.nama_vendor?.toLowerCase().includes(search) ||
          vendor.no_register?.toLowerCase().includes(search) ||
          vendor.pilar?.toLowerCase().includes(search) ||
          vendor.pj_1?.toLowerCase().includes(search) ||
          vendor.telp_pj_1?.toLowerCase().includes(search) ||
          vendor.email?.toLowerCase().includes(search) ||
          vendor.alamat?.toLowerCase().includes(search);

        const matchesStatus =
          statusFilter === "all" ? true : vendor.status === statusFilter;

        const matchesPilar =
          pilarFilter === "all" ? true : vendor.pilar === pilarFilter;

        return matchesSearch && matchesStatus && matchesPilar;
      })
      .sort((a, b) => Number(b.id_vendor) - Number(a.id_vendor));
  }, [vendors, searchTerm, statusFilter, pilarFilter]);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const summary = useMemo(() => {
    return vendors.reduce(
      (acc, item) => {
        acc.total += 1;

        if (isMitraValue(item.status)) acc.bermitra += 1;
        else acc.nonaktif += 1;

        const pilar = String(item.pilar || "").toLowerCase();

        if (pilar.includes("akademik")) acc.akademik += 1;
        if (pilar.includes("karakter")) acc.karakter += 1;
        if (pilar.includes("seni")) acc.seniBudaya += 1;
        if (pilar.includes("kecakapan")) acc.kecakapan += 1;

        return acc;
      },
      {
        total: 0,
        bermitra: 0,
        nonaktif: 0,
        akademik: 0,
        karakter: 0,
        seniBudaya: 0,
        kecakapan: 0,
      },
    );
  }, [vendors]);

  const resetFilter = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPilarFilter("all");
    setCurrentPage(1);
  };

  const tableColumns = [
    {
      header: "NO",
      align: "text-center w-[70px]",
      render: (_, i) => (
        <div className="flex justify-center py-2">
          <span className="min-w-[20px] text-left font-mono text-[10px] font-bold text-gray-400">
            {String((currentPage - 1) * itemsPerPage + i + 1).padStart(2, "0")}
          </span>
        </div>
      ),
    },
    {
      header: "IDENTITAS VENDOR",
      align: "text-center w-[30%]",
      render: (row) => (
        <div className="flex w-full justify-start py-2 text-left">
          <div className="flex w-full min-w-0 max-w-[320px] items-start gap-3 text-left">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0AC4E0]/10 text-[#0AC4E0]">
              <Building2 size={18} />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1 text-left">
              <span className="whitespace-normal break-words text-left text-[11px] font-black uppercase leading-snug text-gray-800">
                {row.nama_vendor || "Vendor Tidak Diketahui"}
              </span>

              <span className="flex min-w-0 items-start gap-1 text-left text-[9px] font-black uppercase leading-snug tracking-widest text-slate-400">
                <FileText size={10} className="mt-0.5 shrink-0" />

                <span className="min-w-0 whitespace-normal break-words">
                  REG: {row.no_register || "UNSET"}
                </span>
              </span>

              <span className="whitespace-normal break-words text-left text-[8px] font-bold lowercase leading-snug text-gray-300">
                {row.email || "email login belum tersedia"}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "PILAR PROGRAM",
      align: "text-center w-[18%]",
      render: (row) => (
        <div className="flex w-full justify-start py-2 text-left">
          <div className="w-full min-w-0 max-w-[240px] text-left">
            <span className="inline-flex max-w-full items-start gap-1.5 rounded-full border border-[#0AC4E0]/10 bg-[#0AC4E0]/5 px-3 py-1.5 text-left text-[8px] font-black uppercase leading-snug tracking-widest text-[#0AC4E0]">
              <Tags size={10} className="mt-0.5 shrink-0" />

              <span className="min-w-0 whitespace-normal break-words">
                {row.pilar || "General"}
              </span>
            </span>

            <p className="mt-2 whitespace-normal break-words text-left text-[9px] font-bold leading-relaxed text-gray-400">
              {row.alamat || "Alamat belum tersedia"}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "PENANGGUNG JAWAB",
      align: "text-center w-[24%]",
      render: (row) => (
        <div className="flex w-full justify-start py-2 text-left">
          <div className="w-full min-w-0 max-w-[280px] text-left">
            <div className="flex min-w-0 items-start gap-2 text-left">
              <User size={13} className="mt-0.5 shrink-0 text-[#0AC4E0]" />

              <span className="min-w-0 flex-1 whitespace-normal break-words text-left text-[11px] font-black uppercase leading-snug text-gray-800">
                {row.pj_1 || "-"}
              </span>
            </div>

            <div className="mt-1 flex min-w-0 items-start gap-2 text-left">
              <Phone size={12} className="mt-0.5 shrink-0 text-gray-300" />

              <span className="min-w-0 flex-1 whitespace-normal break-words text-left text-[9px] font-bold leading-snug text-gray-400">
                {row.telp_pj_1 || "-"}
              </span>
            </div>

            {row.pj_2 && (
              <p className="mt-2 whitespace-normal break-words text-left text-[8px] font-black uppercase leading-snug tracking-widest text-gray-300">
                PJ 2: {row.pj_2}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "KONTROL DATA",
      align: "text-center w-[280px]",
      render: (row) => {
        const isBermitra = isMitraValue(row.status);

        return (
          <div className="flex justify-center py-2">
            <div className="flex min-w-[210px] items-center gap-4 text-left">
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() =>
                    navigate(`/admin/vendor/detail/${row.id_vendor}`)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-400 transition-all hover:bg-white hover:text-[#0AC4E0] active:scale-90"
                  title="Lihat Detail"
                >
                  <Eye size={15} />
                </button>

                <button
                  onClick={() => navigate(`/admin/vendor/edit/${row.id_vendor}`)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-400 transition-all hover:bg-white hover:text-amber-500 active:scale-90"
                  title="Edit Data"
                >
                  <Edit3 size={14} />
                </button>
              </div>

              <div className="h-6 w-px bg-slate-100" />

              <div
                onClick={() =>
                  handleToggleStatus(row.id_vendor, row.nama_vendor, row.status)
                }
                className="group flex cursor-pointer items-center gap-2 transition-all active:scale-95"
              >
                <div
                  className={`relative h-[18px] w-8 rounded-full p-0.5 transition-all duration-500 ${isBermitra
                    ? "bg-emerald-500 shadow-sm shadow-emerald-200"
                    : "bg-gray-200"
                    }`}
                >
                  <div
                    className={`h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-all duration-300 ${isBermitra ? "translate-x-3.5" : "translate-x-0"
                      }`}
                  />
                </div>

                <span
                  className={`text-[9px] font-black uppercase tracking-widest ${isBermitra ? "text-emerald-600" : "text-slate-400"
                    }`}
                >
                  {isBermitra ? "Mitra" : "Nonaktif"}
                </span>
              </div>
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
                    text="Educational Partner Registry"
                    className="!text-[8px] !font-black !italic uppercase !text-[#0AC4E0]"
                  />

                  <h1 className="text-xl font-black uppercase text-gray-800">
                    Manajemen{" "}
                    <span className="text-[#0AC4E0]">Mitra Vendor</span>
                  </h1>
                </div>
              </div>

              <Button
                text="Tambah Vendor"
                icon={<Plus size={14} />}
                onClick={() => navigate("/admin/vendor/create")}
                className="!rounded-full !bg-[#0AC4E0] !px-6 !py-2.5 !text-[9px] font-black !uppercase text-white shadow-lg active:scale-95"
              />
            </header>

            <div className="mb-6 flex flex-col gap-3 xl:flex-row">
              <div className="relative flex-1">
                <Input
                  placeholder="Cari nama vendor, register, pilar, PJ, kontak, email, atau alamat..."
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

              <div className="w-full xl:w-56">
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

              <div className="w-full xl:w-60">
                <Dropdown
                  icon={Tags}
                  value={pilarFilter}
                  items={filterPilarOptions}
                  onChange={(v) => {
                    setPilarFilter(v);
                    setCurrentPage(1);
                  }}
                  className="!rounded-xl !bg-gray-50/50 !py-2 !text-[9px] font-black uppercase"
                />
              </div>

              <button
                onClick={resetFilter}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200/60 bg-gray-50 text-gray-400 shadow-sm transition-all duration-500 hover:bg-rose-50 hover:text-rose-500 active:rotate-180"
                title="Atur ulang filter"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="w-fit rounded-lg border border-blue-100/50 bg-blue-50/50 px-4 py-2 text-[8px] font-black uppercase tracking-widest text-[#0AC4E0]">
                <Filter size={12} className="mr-2 inline" />
                Hasil: {totalItems} Vendor
              </div>

              <div className="w-fit rounded-lg border border-emerald-100/50 bg-emerald-50/50 px-4 py-2 text-[8px] font-black uppercase tracking-widest text-emerald-600">
                <ShieldCheck size={12} className="mr-2 inline" />
                Bermitra: {summary.bermitra}
              </div>

              <div className="w-fit rounded-lg border border-slate-100 bg-slate-50 px-4 py-2 text-[8px] font-black uppercase tracking-widest text-slate-500">
                <Tags size={12} className="mr-2 inline" />
                Akademik: {summary.akademik}
              </div>

              <div className="w-fit rounded-lg border border-slate-100 bg-slate-50 px-4 py-2 text-[8px] font-black uppercase tracking-widest text-slate-500">
                <Tags size={12} className="mr-2 inline" />
                Karakter: {summary.karakter}
              </div>

              <div className="w-fit rounded-lg border border-slate-100 bg-slate-50 px-4 py-2 text-[8px] font-black uppercase tracking-widest text-slate-500">
                <Tags size={12} className="mr-2 inline" />
                Seni: {summary.seniBudaya}
              </div>

              <div className="w-fit rounded-lg border border-slate-100 bg-slate-50 px-4 py-2 text-[8px] font-black uppercase tracking-widest text-slate-500">
                <Tags size={12} className="mr-2 inline" />
                Kecakapan: {summary.kecakapan}
              </div>
            </div>
          </div>

          <div className="flex-none overflow-hidden px-10 pb-4">
            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
              <Table
                columns={tableColumns}
                data={loading ? [] : currentData}
                className="min-w-full border-collapse"
              />

              {loading && (
                <div className="flex flex-col items-center justify-center py-24 text-[#0AC4E0]">
                  <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#0AC4E0] border-t-transparent" />

                  <p className="text-xs font-black uppercase tracking-widest">
                    Memuat data vendor
                  </p>
                </div>
              )}

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

export default ReadVendor;