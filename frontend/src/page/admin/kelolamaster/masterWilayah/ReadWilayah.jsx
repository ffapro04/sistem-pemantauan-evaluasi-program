/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Plus,
  Search as SearchIcon,
  Database,
  Eye,
  Edit3,
  Filter,
  CheckCircle,
  MapPin,
  Layers,
  School,
  Globe2,
  Ruler,
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

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return 0;

  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const pickValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const getArrayPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.wilayah)) return payload.wilayah;
  if (Array.isArray(payload?.result)) return payload.result;
  return [];
};

const normalizeKlasifikasi = (value) => {
  const raw = String(value || "").toLowerCase();

  if (
    raw.includes("independent") ||
    raw.includes("bukan") ||
    raw.includes("mandiri") ||
    raw.includes("non")
  ) {
    return "Independent";
  }

  return "Absolute";
};

const countSekolahByJenjang = (item, jenjang) => {
  const sekolahList =
    item?.sekolah ||
    item?.sekolahs ||
    item?.schools ||
    item?.data_sekolah ||
    item?.list_sekolah ||
    [];

  if (!Array.isArray(sekolahList)) return 0;

  return sekolahList.filter((sekolah) => {
    const raw =
      sekolah?.jenjang ||
      sekolah?.tingkat ||
      sekolah?.jenis_sekolah ||
      sekolah?.type ||
      "";

    return String(raw).trim().toLowerCase() === String(jenjang).toLowerCase();
  }).length;
};

const normalizeWilayah = (item) => {
  const jumlahSd = pickValue(
    item?.jumlah_sd,
    item?.jumlahSD,
    item?.jumlahSd,
    item?.total_sd,
    item?.totalSD,
    item?.totalSd,
    countSekolahByJenjang(item, "SD"),
  );

  const jumlahSmp = pickValue(
    item?.jumlah_smp,
    item?.jumlahSMP,
    item?.jumlahSmp,
    item?.total_smp,
    item?.totalSMP,
    item?.totalSmp,
    countSekolahByJenjang(item, "SMP"),
  );

  const jumlahSmk = pickValue(
    item?.jumlah_smk,
    item?.jumlahSMK,
    item?.jumlahSmk,
    item?.total_smk,
    item?.totalSMK,
    item?.totalSmk,
    countSekolahByJenjang(item, "SMK"),
  );

  return {
    ...item,
    id_wilayah: item?.id_wilayah ?? item?.idWilayah ?? item?.id,
    kode_wilayah:
      item?.kode_wilayah ||
      item?.kodeWilayah ||
      item?.kode_provinsi ||
      "—",
    nama_wilayah:
      item?.nama_wilayah ||
      item?.namaWilayah ||
      item?.nama_provinsi ||
      item?.nama ||
      "Wilayah Tidak Diketahui",
    tipe_wilayah: normalizeKlasifikasi(
      item?.tipe_wilayah || item?.keterangan || item?.jenis_wilayah,
    ),
    jenis_wilayah: item?.jenis_wilayah || "PROVINSI",
    luas_wilayah: item?.luas_wilayah || item?.luasWilayah || "—",
    letak_geografis: item?.letak_geografis || item?.letakGeografis || "",
    letak_astronomis: item?.letak_astronomis || item?.letakAstronomis || "",
    latitude: item?.latitude ?? item?.lat ?? null,
    longitude: item?.longitude ?? item?.lng ?? item?.lon ?? null,
    status: item?.status ?? true,
    jumlah_sd: toNumber(jumlahSd),
    jumlah_smp: toNumber(jumlahSmp),
    jumlah_smk: toNumber(jumlahSmk),
  };
};

const ReadWilayah = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState(
    localStorage.getItem("filter_search_wilayah") || "",
  );

  const [statusFilter, setStatusFilter] = useState(
    localStorage.getItem("filter_status_wilayah") || "all",
  );

  const [tipeFilter, setTipeFilter] = useState(
    localStorage.getItem("filter_tipe_wilayah") || "all",
  );

  const [currentPage, setCurrentPage] = useState(
    Number(localStorage.getItem("filter_page_wilayah")) || 1,
  );

  const [wilayah, setWilayah] = useState([]);
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 5;

  const filterTipeOptions = [
    { value: "all", label: "SEMUA KLASIFIKASI" },
    { value: "Absolute", label: "ABSOLUTE" },
    { value: "Independent", label: "INDEPENDENT" },
  ];

  const filterStatusOptions = [
    { value: "all", label: "SEMUA STATUS" },
    { value: "active", label: "STATUS: AKTIF" },
    { value: "inactive", label: "STATUS: NONAKTIF" },
  ];

  useEffect(() => {
    localStorage.setItem("filter_search_wilayah", searchTerm);
    localStorage.setItem("filter_status_wilayah", statusFilter);
    localStorage.setItem("filter_tipe_wilayah", tipeFilter);
    localStorage.setItem("filter_page_wilayah", currentPage);
  }, [searchTerm, statusFilter, tipeFilter, currentPage]);

  const fetchWilayah = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get("http://localhost:3000/wilayah", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const normalizedData = getArrayPayload(response.data)
        .map(normalizeWilayah)
        .filter((item) => item.id_wilayah);

      setWilayah(normalizedData);
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: "Gagal memuat data wilayah",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWilayah();
  }, []);

  const handleToggleStatus = async (id, name, currentStatus) => {
    const nextStatus = !isActiveValue(currentStatus);

    try {
      const token = localStorage.getItem("token");

      await axios.patch(
        `http://localhost:3000/wilayah/${id}`,
        { status: nextStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      await fetchWilayah();

      Toast.fire({
        icon: "success",
        title: `${name} sekarang ${nextStatus ? "Aktif" : "Nonaktif"}`,
      });
    } catch (e) {
      Toast.fire({
        icon: "error",
        title: "Gagal memperbarui status wilayah",
      });
    }
  };

  const filteredData = useMemo(() => {
    return wilayah
      .filter((item) => {
        const search = searchTerm.toLowerCase();
        const tipe = normalizeKlasifikasi(item.tipe_wilayah);
        const active = isActiveValue(item.status);

        const matchesSearch =
          item.nama_wilayah?.toLowerCase().includes(search) ||
          item.kode_wilayah?.toLowerCase().includes(search) ||
          item.jenis_wilayah?.toLowerCase().includes(search) ||
          item.tipe_wilayah?.toLowerCase().includes(search) ||
          item.luas_wilayah?.toLowerCase().includes(search) ||
          item.letak_geografis?.toLowerCase().includes(search) ||
          item.letak_astronomis?.toLowerCase().includes(search) ||
          item.deskripsi?.toLowerCase().includes(search);

        const matchesStatus =
          statusFilter === "all"
            ? true
            : statusFilter === "active"
              ? active
              : !active;

        const matchesTipe =
          tipeFilter === "all"
            ? true
            : tipe.toLowerCase() === String(tipeFilter).toLowerCase();

        return matchesSearch && matchesStatus && matchesTipe;
      })
      .sort((a, b) => Number(b.id_wilayah) - Number(a.id_wilayah));
  }, [wilayah, searchTerm, statusFilter, tipeFilter]);

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
    return wilayah.reduce(
      (acc, item) => {
        acc.total += 1;

        if (isActiveValue(item.status)) acc.active += 1;
        else acc.inactive += 1;

        acc.sd += Number(item.jumlah_sd || 0);
        acc.smp += Number(item.jumlah_smp || 0);
        acc.smk += Number(item.jumlah_smk || 0);

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
  }, [wilayah]);

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
      header: "IDENTITAS PROVINSI",
      align: "text-center w-[30%]",
      render: (row) => (
        <div className="flex justify-center py-2">
          <div className="flex min-w-[190px] items-center gap-3 text-left">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0AC4E0]/10 text-[#0AC4E0]">
              <MapPin size={17} />
            </div>

            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-[11px] font-black uppercase leading-tight text-gray-800">
                {row.nama_wilayah}
              </span>

              <span className="truncate text-[9px] font-bold uppercase tracking-tight text-gray-400">
                {row.kode_wilayah || "—"} · {row.jenis_wilayah || "PROVINSI"}
              </span>

              <span className="truncate text-[8px] font-bold text-gray-300">
                ID: {row.id_wilayah}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "KLASIFIKASI",
      align: "text-center w-[18%]",
      render: (row) => {
        const tipe = normalizeKlasifikasi(row.tipe_wilayah);
        const isIndependent = tipe === "Independent";

        return (
          <div className="flex justify-center">
            <div className="min-w-[130px] text-left">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[8px] font-black uppercase tracking-widest ${isIndependent
                  ? "border-purple-100 bg-purple-50 text-purple-600"
                  : "border-[#0AC4E0]/10 bg-[#0AC4E0]/5 text-[#0AC4E0]"
                  }`}
              >
                <Layers size={10} />
                {tipe}
              </span>

              <div className="mt-2 flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-gray-400">
                <Ruler size={10} />
                {row.luas_wilayah || "—"}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: "JUMLAH SEKOLAH",
      align: "text-center w-[28%]",
      render: (row) => (
        <div className="flex justify-center">
          <div className="grid min-w-[210px] grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-slate-50 px-3 py-2">
              <p className="text-[11px] font-black text-gray-800">
                {row.jumlah_sd || 0}
              </p>
              <p className="mt-0.5 text-[7px] font-black uppercase tracking-widest text-gray-400">
                SD
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 px-3 py-2">
              <p className="text-[11px] font-black text-gray-800">
                {row.jumlah_smp || 0}
              </p>
              <p className="mt-0.5 text-[7px] font-black uppercase tracking-widest text-gray-400">
                SMP
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 px-3 py-2">
              <p className="text-[11px] font-black text-gray-800">
                {row.jumlah_smk || 0}
              </p>
              <p className="mt-0.5 text-[7px] font-black uppercase tracking-widest text-gray-400">
                SMK
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "KONTROL DATA",
      align: "text-center w-[260px]",
      render: (row) => {
        const active = isActiveValue(row.status);

        return (
          <div className="flex justify-center py-2">
            <div className="flex min-w-[170px] items-center gap-4 text-left">
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() =>
                    navigate(`/admin/wilayah/detail/${row.id_wilayah}`)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-400 transition-all hover:bg-white hover:text-[#0AC4E0] active:scale-90"
                  title="Lihat Detail"
                >
                  <Eye size={15} />
                </button>

                <button
                  onClick={() =>
                    navigate(`/admin/wilayah/edit/${row.id_wilayah}`)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-400 transition-all hover:bg-white hover:text-amber-500 active:scale-90"
                  title="Edit Data"
                >
                  <Edit3 size={14} />
                </button>
              </div>

              <div className="h-6 w-px bg-slate-100" />

              <div
                onClick={() =>
                  handleToggleStatus(
                    row.id_wilayah,
                    row.nama_wilayah,
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
                    <span className="text-[#0AC4E0]">Wilayah</span>
                  </h1>
                </div>
              </div>

              <Button
                text="Tambah Wilayah"
                icon={<Plus size={14} />}
                onClick={() => navigate("/admin/wilayah/create")}
                className="!rounded-full !bg-[#0AC4E0] !px-6 !py-2.5 !text-[9px] font-black !uppercase text-white shadow-lg active:scale-95"
              />
            </header>

            <div className="mb-6 flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <Input
                  placeholder="Cari provinsi, kode wilayah, klasifikasi, luas, atau letak geografis..."
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
                  icon={Globe2}
                  value={tipeFilter}
                  items={filterTipeOptions}
                  onChange={(v) => {
                    setTipeFilter(v);
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
                  setTipeFilter("all");
                  setCurrentPage(1);
                }}
                className="text-[8px] font-black uppercase tracking-widest text-gray-400 transition-colors hover:text-rose-500"
              >
                Atur Ulang
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="w-fit rounded-lg border border-blue-100/50 bg-blue-50/50 px-4 py-2 text-[8px] font-black uppercase tracking-widest text-[#0AC4E0]">
                <Filter size={12} className="mr-2 inline" />
                Hasil: {totalItems} Wilayah
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
                    Memuat data wilayah
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

export default ReadWilayah;