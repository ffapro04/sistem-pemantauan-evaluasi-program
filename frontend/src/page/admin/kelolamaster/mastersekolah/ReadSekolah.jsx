/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
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
  Globe2,
  RotateCcw,
  CheckCircle,
  BookOpen,
  Hash,
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

const isActiveValue = (value) =>
  value === true || value === "true" || Number(value) === 1;

const getArrayPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.sekolah)) return payload.sekolah;
  if (Array.isArray(payload?.wilayah)) return payload.wilayah;

  return [];
};

const cleanWilayahName = (value) => {
  const raw = String(value || "").trim();

  if (!raw) return "Belum Ada Wilayah";

  if (raw.includes("/")) {
    return raw.split("/").filter(Boolean).pop() || raw;
  }

  return raw;
};

const normalizeWilayah = (item) => ({
  ...item,
  id_wilayah: item?.id_wilayah ?? item?.idWilayah ?? item?.id,
  nama_wilayah: cleanWilayahName(
    item?.nama_wilayah || item?.namaWilayah || item?.nama,
  ),
  kode_wilayah:
    item?.kode_wilayah || item?.kodeWilayah || item?.kode_provinsi || "—",
  status: item?.status ?? true,
});

const normalizeSekolah = (item) => {
  const wilayah = item?.wilayah || {};
  const wilayahId =
    item?.id_wilayah ??
    item?.idWilayah ??
    wilayah?.id_wilayah ??
    wilayah?.idWilayah ??
    wilayah?.id ??
    "";

  const wilayahName = cleanWilayahName(
    wilayah?.nama_wilayah ||
    wilayah?.namaWilayah ||
    wilayah?.nama ||
    item?.nama_wilayah ||
    item?.namaWilayah,
  );

  return {
    ...item,
    id_sekolah: item?.id_sekolah ?? item?.idSekolah ?? item?.id,
    npsn: item?.npsn || "",
    nama_sekolah: item?.nama_sekolah || item?.namaSekolah || item?.nama || "",
    jenjang: item?.jenjang || "SD",
    akreditasi: item?.akreditasi || "",
    alamat: item?.alamat || "",
    email_login: item?.email_login || item?.emailLogin || "",
    status: item?.status ?? true,
    id_wilayah: wilayahId,
    wilayah_nama: wilayahName,
    wilayah_kode:
      wilayah?.kode_wilayah || wilayah?.kodeWilayah || item?.kode_wilayah || "—",
  };
};

const ReadSekolah = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState(
    localStorage.getItem("sch_filter_search") || "",
  );

  const [filterWilayah, setFilterWilayah] = useState(
    localStorage.getItem("sch_filter_wilayah") || "all",
  );

  const [filterJenjang, setFilterJenjang] = useState(
    localStorage.getItem("sch_filter_jenjang") || "all",
  );

  const [filterAkreditasi, setFilterAkreditasi] = useState(
    localStorage.getItem("sch_filter_akred") || "all",
  );

  const [statusFilter, setStatusFilter] = useState(
    localStorage.getItem("sch_filter_status") || "all",
  );

  const [currentPage, setCurrentPage] = useState(
    Number(localStorage.getItem("sch_filter_page")) || 1,
  );

  const [sekolah, setSekolah] = useState([]);
  const [listWilayah, setListWilayah] = useState([]);
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 5;

  const filterJenjangOptions = [
    { value: "all", label: "SEMUA JENJANG" },
    { value: "SD", label: "SD" },
    { value: "SMP", label: "SMP" },
    { value: "SMK", label: "SMK" },
  ];

  const filterAkreditasiOptions = [
    { value: "all", label: "SEMUA AKREDITASI" },
    { value: "A", label: "GRADE: A" },
    { value: "B", label: "GRADE: B" },
    { value: "C", label: "GRADE: C" },
  ];

  const filterStatusOptions = [
    { value: "all", label: "SEMUA STATUS" },
    { value: "active", label: "STATUS: AKTIF" },
    { value: "inactive", label: "STATUS: NONAKTIF" },
  ];

  useEffect(() => {
    localStorage.setItem("sch_filter_search", searchTerm);
    localStorage.setItem("sch_filter_wilayah", filterWilayah);
    localStorage.setItem("sch_filter_jenjang", filterJenjang);
    localStorage.setItem("sch_filter_akred", filterAkreditasi);
    localStorage.setItem("sch_filter_status", statusFilter);
    localStorage.setItem("sch_filter_page", currentPage);
  }, [
    searchTerm,
    filterWilayah,
    filterJenjang,
    filterAkreditasi,
    statusFilter,
    currentPage,
  ]);

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

      const sekolahData = getArrayPayload(resSekolah.data)
        .map(normalizeSekolah)
        .filter((item) => item.id_sekolah);

      const wilayahData = getArrayPayload(resWilayah.data)
        .map(normalizeWilayah)
        .filter((item) => item.id_wilayah && isActiveValue(item.status));

      setSekolah(sekolahData);
      setListWilayah(wilayahData);
    } catch (err) {
      Toast.fire({
        icon: "error",
        title: "Gagal memuat data sekolah",
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
        `http://localhost:3000/sekolah/${id}`,
        { status: nextStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      await fetchData();

      Toast.fire({
        icon: "success",
        title: `${name} sekarang ${nextStatus ? "Aktif" : "Nonaktif"}`,
      });
    } catch (e) {
      Toast.fire({
        icon: "error",
        title: "Gagal memperbarui status sekolah",
      });
    }
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: "Hapus Unit Sekolah?",
      text: `Unit ${name} akan dihapus dari sistem.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#F43F5E",
      cancelButtonColor: "#CBD5E1",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      reverseButtons: true,
      customClass: {
        popup: "rounded-[2.5rem] border-none shadow-2xl",
        confirmButton:
          "rounded-full px-8 py-3 text-[10px] font-black uppercase",
        cancelButton:
          "rounded-full px-8 py-3 text-[10px] font-black uppercase",
      },
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(`http://localhost:3000/sekolah/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchData();

      Toast.fire({
        icon: "success",
        title: "Unit sekolah berhasil dihapus",
      });
    } catch (err) {
      Toast.fire({
        icon: "error",
        title: "Gagal menghapus unit sekolah",
      });
    }
  };

  const wilayahOptions = useMemo(
    () => [
      { value: "all", label: "SEMUA WILAYAH" },
      ...listWilayah.map((w) => ({
        value: String(w.id_wilayah),
        label: `${w.nama_wilayah.toUpperCase()} (${w.kode_wilayah || "—"})`,
      })),
    ],
    [listWilayah],
  );

  const filteredData = useMemo(() => {
    return sekolah
      .filter((item) => {
        const search = searchTerm.toLowerCase();
        const active = isActiveValue(item.status);

        const matchesSearch =
          item.nama_sekolah?.toLowerCase().includes(search) ||
          item.npsn?.toLowerCase().includes(search) ||
          item.email_login?.toLowerCase().includes(search) ||
          item.alamat?.toLowerCase().includes(search) ||
          item.wilayah_nama?.toLowerCase().includes(search) ||
          item.wilayah_kode?.toLowerCase().includes(search) ||
          item.jenjang?.toLowerCase().includes(search) ||
          item.akreditasi?.toLowerCase().includes(search);

        const matchesWilayah =
          filterWilayah === "all"
            ? true
            : String(item.id_wilayah) === String(filterWilayah);

        const matchesJenjang =
          filterJenjang === "all"
            ? true
            : String(item.jenjang).toUpperCase() ===
            String(filterJenjang).toUpperCase();

        const matchesAkreditasi =
          filterAkreditasi === "all"
            ? true
            : String(item.akreditasi).toUpperCase() ===
            String(filterAkreditasi).toUpperCase();

        const matchesStatus =
          statusFilter === "all"
            ? true
            : statusFilter === "active"
              ? active
              : !active;

        return (
          matchesSearch &&
          matchesWilayah &&
          matchesJenjang &&
          matchesAkreditasi &&
          matchesStatus
        );
      })
      .sort((a, b) => Number(b.id_sekolah) - Number(a.id_sekolah));
  }, [
    sekolah,
    searchTerm,
    filterWilayah,
    filterJenjang,
    filterAkreditasi,
    statusFilter,
  ]);

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
    return sekolah.reduce(
      (acc, item) => {
        acc.total += 1;

        if (isActiveValue(item.status)) acc.active += 1;
        else acc.inactive += 1;

        const jenjang = String(item.jenjang || "").toUpperCase();

        if (jenjang === "SD") acc.sd += 1;
        if (jenjang === "SMP") acc.smp += 1;
        if (jenjang === "SMK") acc.smk += 1;

        return acc;
      },
      {
        total: 0,
        active: 0,
        inactive: 0,
        sd: 0,
        smp: 0,
        smk: 0,
      },
    );
  }, [sekolah]);

  const resetFilter = () => {
    setSearchTerm("");
    setFilterWilayah("all");
    setFilterJenjang("all");
    setFilterAkreditasi("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const tableColumns = [
    {
      header: "NO",
      align: "text-center w-[70px]",
      render: (_, i) => (
        <div className="flex justify-center">
          <span className="min-w-[20px] text-left font-mono text-[10px] font-bold text-gray-400">
            {String((currentPage - 1) * itemsPerPage + i + 1).padStart(2, "0")}
          </span>
        </div>
      ),
    },
    {
      header: "IDENTITAS SEKOLAH",
      align: "text-center w-[30%]",
      render: (row) => (
        <div className="flex justify-center py-2">
          <div className="flex min-w-[230px] items-center gap-3 text-left">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0AC4E0]/10 text-[#0AC4E0]">
              <School size={18} />
            </div>

            <div className="flex min-w-0 flex-col gap-1">
              <span className="truncate text-[11px] font-black uppercase leading-tight text-gray-800">
                {row.nama_sekolah || "Nama sekolah belum tersedia"}
              </span>

              <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                <Hash size={10} />
                {row.npsn || "NPSN belum tersedia"}
              </span>

              <span className="truncate text-[8px] font-bold lowercase text-gray-300">
                {row.email_login || "email login belum tersedia"}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "WILAYAH PROVINSI",
      align: "text-center w-[22%]",
      render: (row) => (
        <div className="flex w-full justify-start py-2 text-left">
          <div className="w-full min-w-0 max-w-[280px] pl-2 pr-4 text-left">
            <div className="flex min-w-0 items-start justify-start gap-2 text-left">
              <MapPin
                size={13}
                className="mt-0.5 shrink-0 text-[#0AC4E0]"
              />

              <span className="block min-w-0 flex-1 whitespace-normal break-words text-left text-[11px] font-black uppercase leading-snug text-gray-800">
                {row.wilayah_nama || "Belum Ada Wilayah"}
              </span>
            </div>

            <p className="mt-1 whitespace-normal break-words text-left text-[8px] font-black uppercase leading-snug tracking-widest text-gray-400">
              {row.wilayah_kode || "—"}
            </p>

            <p className="mt-2 whitespace-normal break-words text-left text-[9px] font-bold leading-relaxed text-gray-400">
              {row.alamat || "Alamat belum tersedia"}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "KATEGORI UNIT",
      align: "text-center w-[20%]",
      render: (row) => {
        const jenjang = String(row.jenjang || "SD").toUpperCase();

        return (
          <div className="flex justify-center">
            <div className="grid min-w-[150px] grid-cols-2 gap-2 text-center">
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-[#0AC4E0]">
                <p className="text-[11px] font-black leading-none">
                  {jenjang}
                </p>

                <p className="mt-1 text-[7px] font-black uppercase tracking-widest opacity-60">
                  Jenjang
                </p>
              </div>

              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-emerald-600">
                <p className="text-[11px] font-black leading-none">
                  {row.akreditasi ? `Grade ${row.akreditasi}` : "—"}
                </p>

                <p className="mt-1 text-[7px] font-black uppercase tracking-widest opacity-60">
                  Akreditasi
                </p>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: "KONTROL DATA",
      align: "text-center w-[280px]",
      render: (row) => {
        const active = isActiveValue(row.status);

        return (
          <div className="flex justify-center py-2">
            <div className="flex min-w-[210px] items-center gap-4 text-left">
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() =>
                    navigate(`/admin/sekolah/detail/${row.id_sekolah}`)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-400 transition-all hover:bg-white hover:text-[#0AC4E0] active:scale-90"
                  title="Lihat Detail"
                >
                  <Eye size={15} />
                </button>

                <button
                  onClick={() =>
                    navigate(`/admin/sekolah/edit/${row.id_sekolah}`)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-400 transition-all hover:bg-white hover:text-amber-500 active:scale-90"
                  title="Edit Data"
                >
                  <Edit3 size={14} />
                </button>

                <button
                  onClick={() =>
                    handleDelete(row.id_sekolah, row.nama_sekolah)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-400 transition-all hover:bg-white hover:text-rose-500 active:scale-90"
                  title="Hapus Data"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="h-6 w-px bg-slate-100" />

              <div
                onClick={() =>
                  handleToggleStatus(
                    row.id_sekolah,
                    row.nama_sekolah,
                    row.status,
                  )
                }
                className="group flex cursor-pointer items-center gap-2 transition-all active:scale-95"
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
                    text="Sistem Pemantauan Program"
                    className="!text-[8px] !font-black !italic uppercase !text-[#0AC4E0]"
                  />

                  <h1 className="text-xl font-black uppercase text-gray-800">
                    Manajemen Data{" "}
                    <span className="text-[#0AC4E0]">Sekolah</span>
                  </h1>
                </div>
              </div>

              <Button
                text="Tambah Sekolah"
                icon={<Plus size={14} />}
                onClick={() => navigate("/admin/sekolah/create")}
                className="!rounded-full !bg-[#0AC4E0] !px-6 !py-2.5 !text-[9px] font-black !uppercase text-white shadow-lg active:scale-95"
              />
            </header>

            <div className="mb-6 flex flex-col gap-3 xl:flex-row">
              <div className="relative flex-1">
                <Input
                  placeholder="Cari nama sekolah, NPSN, wilayah, email, atau alamat..."
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

              <div className="w-full xl:w-64">
                <Dropdown
                  icon={Globe2}
                  value={filterWilayah}
                  items={wilayahOptions}
                  onChange={(v) => {
                    setFilterWilayah(v);
                    setCurrentPage(1);
                  }}
                  className="!rounded-xl !bg-gray-50/50 !py-2 !text-[9px] font-black uppercase"
                />
              </div>

              <div className="w-full xl:w-48">
                <Dropdown
                  icon={BookOpen}
                  value={filterJenjang}
                  items={filterJenjangOptions}
                  onChange={(v) => {
                    setFilterJenjang(v);
                    setCurrentPage(1);
                  }}
                  className="!rounded-xl !bg-gray-50/50 !py-2 !text-[9px] font-black uppercase"
                />
              </div>

              <div className="w-full xl:w-52">
                <Dropdown
                  icon={Award}
                  value={filterAkreditasi}
                  items={filterAkreditasiOptions}
                  onChange={(v) => {
                    setFilterAkreditasi(v);
                    setCurrentPage(1);
                  }}
                  className="!rounded-xl !bg-gray-50/50 !py-2 !text-[9px] font-black uppercase"
                />
              </div>

              <div className="w-full xl:w-52">
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
                Hasil: {totalItems} Sekolah
              </div>

              <div className="w-fit rounded-lg border border-emerald-100/50 bg-emerald-50/50 px-4 py-2 text-[8px] font-black uppercase tracking-widest text-emerald-600">
                <CheckCircle size={12} className="mr-2 inline" />
                Aktif: {summary.active}
              </div>

              <div className="w-fit rounded-lg border border-slate-100 bg-slate-50 px-4 py-2 text-[8px] font-black uppercase tracking-widest text-slate-500">
                <School size={12} className="mr-2 inline" />
                SD: {summary.sd}
              </div>

              <div className="w-fit rounded-lg border border-slate-100 bg-slate-50 px-4 py-2 text-[8px] font-black uppercase tracking-widest text-slate-500">
                <School size={12} className="mr-2 inline" />
                SMP: {summary.smp}
              </div>

              <div className="w-fit rounded-lg border border-slate-100 bg-slate-50 px-4 py-2 text-[8px] font-black uppercase tracking-widest text-slate-500">
                <School size={12} className="mr-2 inline" />
                SMK: {summary.smk}
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
                    Memuat data sekolah
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

export default ReadSekolah;