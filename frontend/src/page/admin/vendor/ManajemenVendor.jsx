import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Search,
  Star,
} from "lucide-react";
import { toast } from "react-toastify";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  ""
).replace(/\/$/, "");

const scoreTone = (score) => {
  if (score >= 90) return "text-emerald-600 bg-emerald-50 border-emerald-100";
  if (score >= 75) return "text-cyan-600 bg-cyan-50 border-cyan-100";
  if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-100";
  return "text-rose-600 bg-rose-50 border-rose-100";
};

function MetricCard({ icon: Icon, label, value, helper }) {
  return (
    <div className="flex min-h-[92px] items-center justify-between gap-3 rounded-2xl border border-cyan-100 bg-white p-4 shadow-[0_14px_34px_rgba(10,196,224,0.08)]">
        <div className="min-w-0">
          <p className="text-[24px] font-black leading-none text-slate-950">{value}</p>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            {label}
          </p>
          {helper && <p className="mt-1 line-clamp-1 text-[10px] font-semibold text-slate-400">{helper}</p>}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E9FBFF] text-[#0AC4E0]">
          <Icon size={18} />
        </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .simple-scroll::-webkit-scrollbar { width: 6px; }
            .simple-scroll::-webkit-scrollbar-track { background: transparent; }
            .simple-scroll::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.55); border-radius: 999px; }
            .line-clamp-1 { overflow: hidden; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; }
          `,
        }}
      />
    </div>
  );
}

function VendorCard({ vendor, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border bg-white p-3 text-left shadow-[0_12px_28px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:border-cyan-100 ${
        selected ? "border-[#0AC4E0] ring-4 ring-cyan-50" : "border-slate-100"
      }`}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_64px] items-center gap-3">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-black text-slate-950">
            {vendor.nama_vendor}
          </p>
          <p className="mt-1 truncate text-[11px] font-semibold text-slate-400">
            {vendor.pilar || "Pilar belum diisi"} - {vendor.total_program || 0} program
          </p>
        </div>
        <span
          className={`inline-flex h-9 min-w-[56px] shrink-0 items-center justify-center rounded-xl border px-2 text-center text-[11px] font-black ${scoreTone(
            vendor.performance_score || 0,
          )}`}
        >
          {vendor.performance_score || 0}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <MiniMetric label="Rating" value={(vendor.average_rating || 0).toFixed(1)} />
        <MiniMetric label="Reject" value={vendor.rejected_evidence || 0} />
        <MiniMetric label="Telat" value={vendor.late_evidence || 0} />
      </div>
    </button>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2 text-center">
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-slate-900">{value}</p>
    </div>
  );
}

function ProgramRow({ program }) {
  return (
    <div className="grid gap-3 rounded-2xl border border-slate-100 bg-white p-4 md:grid-cols-[minmax(0,1.6fr)_120px_110px_110px] md:items-center">
      <div className="min-w-0">
        <p className="truncate text-sm font-black text-slate-950">
          {program.nama_program}
        </p>
        <p className="mt-1 text-xs font-semibold text-slate-400">
          {program.pilar_program || program.kategori || "-"} - {program.tahun || "-"}
        </p>
      </div>
      <MiniMetric label="Progress" value={`${program.completion_percentage || 0}%`} />
      <MiniMetric label="Reject" value={program.rejected_evidence || 0} />
      <MiniMetric label="Rating" value={(program.average_rating || 0).toFixed(1)} />
    </div>
  );
}

export default function ManajemenVendor() {
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState([]);
  const [summary, setSummary] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/vendor/management/summary`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || "Gagal memuat manajemen vendor");
      }

      const rows = Array.isArray(payload?.data) ? payload.data : [];
      setVendors(rows);
      setSummary(payload?.summary || null);
      setSelectedId((current) => current || rows[0]?.id_vendor || null);
    } catch (error) {
      console.error("Gagal memuat manajemen vendor:", error);
      toast.error(error.message || "Gagal memuat manajemen vendor");
      setVendors([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredVendors = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    if (!query) return vendors;

    return vendors.filter((vendor) =>
      [vendor.nama_vendor, vendor.pilar, vendor.pj_1, vendor.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [vendors, keyword]);

  const selectedVendor =
    filteredVendors.find((vendor) => String(vendor.id_vendor) === String(selectedId)) ||
    filteredVendors[0] ||
    null;

  return (
    <div className="flex min-h-screen bg-[#F4F7FB] font-sans text-slate-900">
      <Sidebar />
      <main className="relative min-w-0 flex-1 overflow-hidden px-6 py-5">
        <div className="arcade-grid pointer-events-none absolute inset-0 opacity-70" />
        <div className="relative z-10 w-full">
          <div className="arcade-panel rounded-2xl border border-white bg-white/95 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0AC4E0]">
                  Manajemen Vendor
                </div>
                <h1 className="mt-1 text-[30px] font-black leading-tight text-slate-950">
                  Penilaian Vendor Program
                </h1>
                <p className="mt-2 max-w-3xl text-[13px] font-semibold leading-6 text-slate-500">
                  Pantau performa vendor dari program berjalan, rating aktivitas, bukti disetujui, bukti terlambat, dan jumlah reject.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchData}
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-cyan-100 bg-[#E9FBFF] px-4 text-[10px] font-black uppercase tracking-widest text-[#078EA3] shadow-[0_10px_22px_rgba(10,196,224,0.12)] transition hover:bg-[#0AC4E0] hover:text-white disabled:opacity-60"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                Muat Ulang
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={BriefcaseBusiness}
              label="Total Vendor"
              value={summary?.total_vendor || 0}
              helper={`${summary?.active_vendor || 0} bermitra`}
            />
            <MetricCard
              icon={Activity}
              label="Program"
              value={summary?.total_program || 0}
              helper="Program dengan vendor"
            />
            <MetricCard
              icon={BarChart3}
              label="Skor Rata-rata"
              value={summary?.average_score || 0}
              helper="Dari semua vendor"
            />
            <MetricCard
              icon={Star}
              label="Rating"
              value={(summary?.average_rating || 0).toFixed(1)}
              helper="Rata-rata aktivitas"
            />
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[390px_1fr] 2xl:grid-cols-[420px_1fr]">
            <section className="rounded-2xl border border-white bg-white/95 p-4 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#0AC4E0]"
                />
                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Cari vendor..."
                  className="h-11 w-full rounded-xl border border-slate-100 bg-slate-50 pl-11 pr-4 text-[12px] font-bold text-slate-800 outline-none transition-all focus:border-cyan-200 focus:bg-white"
                />
              </div>

              <div className="simple-scroll mt-4 max-h-[650px] space-y-3 overflow-y-auto pr-1">
                {loading ? (
                  <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm font-bold text-slate-400">
                    Memuat vendor...
                  </div>
                ) : filteredVendors.length === 0 ? (
                  <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm font-bold text-slate-400">
                    Vendor tidak ditemukan.
                  </div>
                ) : (
                  filteredVendors.map((vendor) => (
                    <VendorCard
                      key={vendor.id_vendor}
                      vendor={vendor}
                      selected={String(vendor.id_vendor) === String(selectedVendor?.id_vendor)}
                      onClick={() => setSelectedId(vendor.id_vendor)}
                    />
                  ))
                )}
              </div>
            </section>

            <section className="min-w-0 rounded-2xl border border-white bg-white/95 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
              {selectedVendor ? (
                <>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0AC4E0]">
                        Detail Performa Vendor
                      </p>
                      <h2 className="mt-1 truncate text-[24px] font-black text-slate-950">
                        {selectedVendor.nama_vendor}
                      </h2>
                      <p className="mt-2 text-[12px] font-semibold text-slate-500">
                        PJ: {selectedVendor.pj_1 || "-"} - {selectedVendor.telp_pj_1 || "-"}
                      </p>
                    </div>
                    <div
                      className={`flex h-[76px] min-w-[150px] flex-col items-center justify-center rounded-2xl border px-4 text-center ${scoreTone(
                        selectedVendor.performance_score || 0,
                      )}`}
                    >
                      <p className="text-[10px] font-black uppercase tracking-[0.18em]">
                        Skor Vendor
                      </p>
                      <p className="mt-1 text-[26px] font-black leading-none">
                        {selectedVendor.performance_score || 0}
                      </p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-widest">
                        {selectedVendor.performance_label || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <MetricCard
                      icon={CheckCircle2}
                      label="Bukti Disetujui"
                      value={selectedVendor.approved_evidence || 0}
                      helper={`${selectedVendor.total_evidence || 0} total bukti`}
                    />
                    <MetricCard
                      icon={AlertTriangle}
                      label="Reject"
                      value={selectedVendor.rejected_evidence || 0}
                      helper="AO atau HO"
                    />
                    <MetricCard
                      icon={Clock3}
                      label="Terlambat"
                      value={selectedVendor.late_evidence || 0}
                      helper="Lewat tenggat"
                    />
                    <MetricCard
                      icon={Star}
                      label="Rating"
                      value={(selectedVendor.average_rating || 0).toFixed(1)}
                      helper={`${selectedVendor.total_rating || 0} rating masuk`}
                    />
                  </div>

                  <div className="mt-5">
                    <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <p className="text-[14px] font-black text-slate-950">
                          Grafik Program Vendor
                        </p>
                        <p className="text-[11px] font-semibold text-slate-400">
                          Progress bukti, reject, telat, dan rating per program.
                        </p>
                      </div>
                    </div>

                    <div className="simple-scroll max-h-[520px] space-y-3 overflow-y-auto pr-1">
                      {(selectedVendor.programs || []).length === 0 ? (
                        <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm font-bold text-slate-400">
                          Belum ada program untuk vendor ini.
                        </div>
                      ) : (
                        selectedVendor.programs.map((program) => (
                          <ProgramRow key={program.id_program} program={program} />
                        ))
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex min-h-[420px] items-center justify-center rounded-2xl bg-slate-50 text-sm font-bold text-slate-400">
                  Pilih vendor untuk melihat detail.
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
