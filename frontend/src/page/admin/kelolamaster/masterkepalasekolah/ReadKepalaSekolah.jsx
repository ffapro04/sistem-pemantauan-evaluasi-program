/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  CheckCircle2,
  Mail,
  RefreshCw,
  School,
  Search,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";

import MasterPageShell from "../../../../components/masterCrud/MasterPageShell";
import MasterAlert from "../../../../components/masterCrud/MasterAlert";
import AppButton from "../../../../components/ui/AppButton";

import { API_BASE_URL as BASE_URL } from "../../../../config/apiBase.js";
import { getAuthToken } from "../../../../utils/authSession";

const PAGE_SIZE = 10;

function getAuthHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function unwrapArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.result)) return payload.result;
  return [];
}

function isActive(value) {
  if (typeof value === "boolean") return value;
  const raw = String(value || "").toLowerCase();
  return !["false", "nonaktif", "inactive", "0"].includes(raw);
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ active }) {
  return active ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-500">
      <CheckCircle2 size={11} />
      Aktif
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-rose-400">
      <XCircle size={11} />
      Nonaktif
    </span>
  );
}

export default function ReadKepalaSekolah() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [note, setNote] = useState({
    show: false,
    type: null,
    message: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const response = await axios.get(`${BASE_URL}/users/kepala-sekolah`, {
        headers: getAuthHeaders(),
      });

      setRows(unwrapArray(response.data));
    } catch (error) {
      console.error("Gagal memuat data Kepala Sekolah:", error);
      const message =
        error?.response?.data?.message || "Gagal memuat data Kepala Sekolah.";

      setNote({
        show: true,
        type: "error",
        message: Array.isArray(message) ? message.join(", ") : message,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return rows;

    return rows.filter((item) => {
      const haystack = [
        item?.nama,
        item?.email,
        item?.jabatan,
        item?.sekolah?.nama_sekolah,
        item?.sekolah?.jenjang,
        item?.sekolah?.nama_kabupaten,
        item?.sekolah?.wilayah?.nama_wilayah,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [rows, search]);

  const totalPage = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPage);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const visibleRows = filteredRows.slice(startIndex, startIndex + PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (page > totalPage) {
      setPage(totalPage);
    }
  }, [page, totalPage]);

  return (
    <MasterPageShell
      title="Data"
      highlight="Kepala Sekolah"
      subtitle="Admin hanya dapat melihat akun Kepala Sekolah"
      action={
        <AppButton
          type="button"
          onClick={fetchData}
          icon={<RefreshCw size={12} className={loading ? "animate-spin" : ""} />}
          variant="secondary"
          size="sm"
          className="!rounded-full"
        >
          Refresh
        </AppButton>
      }
    >
      <MasterAlert note={note} setNote={setNote} />

      <div className="h-full overflow-y-auto no-scrollbar px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
        <div className="mb-5 grid gap-4 lg:grid-cols-[1fr_320px] lg:items-center">
          <div className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-[#0AC4E0]">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0AC4E0]">
                  Read Only
                </p>
                <p className="mt-1 text-sm font-bold text-slate-500">
                  Data otomatis mengikuti akun yang dibuat atau diubah Operator Sekolah.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama, email, sekolah..."
              className="h-13 w-full rounded-[1.3rem] border border-slate-100 bg-white py-4 pl-11 pr-4 text-xs font-bold text-slate-600 outline-none shadow-sm transition-all focus:border-[#0AC4E0] focus:ring-4 focus:ring-cyan-100"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col gap-1 border-b border-slate-100 bg-slate-50 px-6 py-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0AC4E0]">
              Daftar Kepala Sekolah
            </p>
            <p className="text-sm font-bold text-slate-500">
              Total {filteredRows.length} akun Kepala Sekolah.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24">
              <RefreshCw size={28} className="animate-spin text-[#0AC4E0]" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Memuat data...
              </p>
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-24">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-50">
                <School size={34} className="text-[#0AC4E0]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-black text-slate-700">
                  Belum ada data Kepala Sekolah.
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-400">
                  Data akan muncul setelah Operator Sekolah membuat akun Kepala Sekolah.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1080px] text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-white">
                      <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        No
                      </th>
                      <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        Kepala Sekolah
                      </th>
                      <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        Email
                      </th>
                      <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        Sekolah
                      </th>
                      <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        Jenjang
                      </th>
                      <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        Wilayah/Kabupaten
                      </th>
                      <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        Status
                      </th>
                      <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        Dibuat
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {visibleRows.map((item, index) => (
                      <tr
                        key={item?.id_user || index}
                        className="border-b border-slate-50 bg-white transition-colors hover:bg-slate-50/70"
                      >
                        <td className="px-6 py-4 text-[10px] font-bold text-slate-400">
                          {startIndex + index + 1}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-[11px] font-black text-[#0AC4E0]">
                              {String(item?.nama || "K").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-black text-slate-800">
                                {item?.nama || "-"}
                              </p>
                              <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
                                {item?.jabatan || "Kepala Sekolah"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                            <Mail size={12} className="text-slate-300" />
                            {item?.email || "-"}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-[10px] font-bold text-slate-500">
                          {item?.sekolah?.nama_sekolah || "-"}
                        </td>

                        <td className="px-6 py-4 text-[10px] font-bold text-slate-500">
                          {item?.sekolah?.jenjang || "-"}
                        </td>

                        <td className="px-6 py-4 text-[10px] font-bold text-slate-500">
                          {item?.sekolah?.wilayah?.nama_wilayah || item?.sekolah?.nama_kabupaten || "-"}
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge active={isActive(item?.status)} />
                        </td>

                        <td className="px-6 py-4 text-[10px] font-bold text-slate-400">
                          {formatDate(item?.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredRows.length > PAGE_SIZE && (
                <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Menampilkan {startIndex + 1} - {Math.min(startIndex + PAGE_SIZE, filteredRows.length)} dari {filteredRows.length} data
                  </p>

                  <div className="flex items-center gap-2">
                    <AppButton
                      type="button"
                      disabled={safePage <= 1}
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      variant="secondary"
                      size="sm"
                      className="!border-slate-100 !text-slate-500 hover:!border-cyan-100 hover:!text-[#0AC4E0]"
                    >
                      Prev
                    </AppButton>

                    <div className="rounded-xl bg-white px-3 py-2 text-[10px] font-black text-slate-600 ring-1 ring-slate-100">
                      {safePage} / {totalPage}
                    </div>

                    <AppButton
                      type="button"
                      disabled={safePage >= totalPage}
                      onClick={() => setPage((prev) => Math.min(totalPage, prev + 1))}
                      variant="secondary"
                      size="sm"
                      className="!border-slate-100 !text-slate-500 hover:!border-cyan-100 hover:!text-[#0AC4E0]"
                    >
                      Next
                    </AppButton>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MasterPageShell>
  );
}
