/* eslint-disable react/jsx-key */
/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  ClipboardCheck,
  Factory,
  LayoutDashboard,
  Loader2,
  MapPinned,
  PieChart as PieIcon,
  RefreshCcw,
  Search,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import Sidebar from "../../../components/Sidebar";
import PageWrapper from "../../../components/PageWrapper";
import Card from "../../../components/Card";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import RegionalSchoolMap from "../../../components/maps/RegionalSchoolMap";
import CoreIntelligenceCard from "../../../components/dashboard/CoreIntelligenceCard";

const API_BASE_URL = "http://localhost:3000";

const WARNA = {
  cyan: "#0AC4E0",
  cyanTua: "#0891B2",
  cyanMuda: "#67E8F9",
  slate: "#64748B",
  merah: "#EF4444",
  amber: "#F59E0B",
  hijau: "#10B981",
};

const WARNA_DIAGRAM = [
  WARNA.cyan,
  WARNA.cyanTua,
  WARNA.cyanMuda,
  WARNA.hijau,
  WARNA.amber,
  WARNA.merah,
  WARNA.slate,
];

const FILTER_KATEGORI = [
  { label: "Semua", value: "SEMUA" },
  { label: "Akademik", value: "AKADEMIK" },
  { label: "Non-Akademik", value: "NON_AKADEMIK" },
];

function ambilArray(payload) {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.program)) return payload.program;
  if (Array.isArray(payload?.programs)) return payload.programs;
  if (Array.isArray(payload?.assessment)) return payload.assessment;
  if (Array.isArray(payload?.assessments)) return payload.assessments;
  if (Array.isArray(payload?.sekolah)) return payload.sekolah;
  if (Array.isArray(payload?.vendor)) return payload.vendor;
  if (Array.isArray(payload?.vendors)) return payload.vendors;
  if (Array.isArray(payload)) return payload;

  return [];
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

async function ambilDataDenganFallback(endpointList, headers = {}) {
  for (const endpoint of endpointList) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });

      if (!response.ok) continue;

      const payload = await safeJson(response);
      return ambilArray(payload);
    } catch {
      // lanjut endpoint berikutnya
    }
  }

  return [];
}

function normalisasiKategori(value) {
  const hasil = String(value || "")
    .trim()
    .toUpperCase()
    .replaceAll("-", "_")
    .replaceAll(" ", "_");

  if (hasil.includes("NON")) return "NON_AKADEMIK";
  if (hasil.includes("AKADEMIK")) return "AKADEMIK";

  return hasil || "TANPA_KATEGORI";
}

function tampilKategori(value) {
  const kategori = normalisasiKategori(value);

  if (kategori === "AKADEMIK") return "Akademik";
  if (kategori === "NON_AKADEMIK") return "Non-Akademik";

  return "Tanpa Kategori";
}

function sesuaiFilterKategori(item, filterAktif) {
  if (filterAktif === "SEMUA") return true;

  const kategori = normalisasiKategori(
    item?.kategori ||
    item?.kategori_program ||
    item?.kategori_assessment ||
    item?.jenis ||
    item?.tipe ||
    item?.program?.kategori,
  );

  return kategori === filterAktif;
}

function ambilIdProgram(program) {
  return program?.id_program || program?.id;
}

function ambilStatusProgram(program) {
  return (
    program?.status_program ||
    program?.status ||
    program?.fase_status ||
    program?.status_program_berjalan ||
    "Berjalan"
  );
}

function ambilStatusAssessment(assessment) {
  return (
    assessment?.status_assessment ||
    assessment?.status ||
    assessment?.status_pengisian ||
    assessment?.state ||
    "Proses Pengisian"
  );
}

function ambilNamaVendor(vendor) {
  return vendor?.nama_vendor || vendor?.nama || vendor?.name || "-";
}

function ambilNamaVendorDariProgram(program, vendors = []) {
  const directName =
    program?.vendor?.nama_vendor ||
    program?.vendor?.nama ||
    program?.nama_vendor ||
    program?.vendor_name;

  if (directName) return directName;

  if (Array.isArray(program?.vendors) && program.vendors.length > 0) {
    return (
      program.vendors
        .map((item) => item?.nama_vendor || item?.nama || item?.name)
        .filter(Boolean)
        .join(", ") || "-"
    );
  }

  const idVendor =
    program?.id_vendor ||
    program?.vendor_id ||
    program?.vendor?.id_vendor ||
    program?.vendor?.id;

  if (!idVendor) return "-";

  const found = vendors.find(
    (vendor) =>
      String(vendor?.id_vendor) === String(idVendor) ||
      String(vendor?.id) === String(idVendor),
  );

  return found ? ambilNamaVendor(found) : "-";
}

function ambilNamaSekolah(sekolah) {
  return sekolah?.nama_sekolah || sekolah?.nama || sekolah?.name || "-";
}

function ambilSekolahDariProgram(program) {
  const value =
    program?.sekolah?.nama_sekolah ||
    program?.school?.nama_sekolah ||
    program?.nama_sekolah ||
    program?.sekolah ||
    "-";

  if (typeof value === "object") {
    return value?.nama_sekolah || value?.nama || "-";
  }

  return value;
}

function ambilSekolahDariAssessment(assessment) {
  const value =
    assessment?.sekolah?.nama_sekolah ||
    assessment?.school?.nama_sekolah ||
    assessment?.nama_sekolah ||
    assessment?.sekolah ||
    "-";

  if (typeof value === "object") {
    return value?.nama_sekolah || value?.nama || "-";
  }

  return value;
}

function potongLabel(value, max = 22) {
  const text = String(value || "-");

  if (text.length <= max) return text;

  return `${text.slice(0, max)}...`;
}

function kelompokkanData(data, ambilKey) {
  const map = {};

  data.forEach((item) => {
    const key = String(ambilKey(item) || "Tidak Diketahui").trim();
    map[key] = (map[key] || 0) + 1;
  });

  return Object.entries(map).map(([name, value]) => ({
    name,
    value,
  }));
}

function getArray(...values) {
  return values.find((value) => Array.isArray(value)) || [];
}

function ambilFileRequirement(requirement) {
  return (
    requirement?.file ||
    requirement?.file_url ||
    requirement?.file_path ||
    requirement?.path ||
    requirement?.dokumen ||
    requirement?.bukti ||
    requirement?.file_bukti ||
    requirement?.file_upload ||
    null
  );
}

function normalisasiStatusRequirement(requirement) {
  const status = String(requirement?.status || "").toUpperCase();

  if (
    status.includes("REJECT") ||
    status.includes("DITOLAK") ||
    status.includes("REVISI")
  ) {
    return "REJECTED";
  }

  if (
    status.includes("APPROVED") ||
    status.includes("DISETUJUI") ||
    status.includes("ACC")
  ) {
    return "APPROVED";
  }

  if (ambilFileRequirement(requirement)) return "WAITING_HO";

  return "WAITING_UPLOAD";
}

function ambilRequirementKegiatan(program) {
  const fases = getArray(program?.fases, program?.fase);

  return fases.flatMap((fase) => {
    const kegiatanList = getArray(
      fase?.kegiatans,
      fase?.kegiatan,
      fase?.t_kegiatans,
    );

    return kegiatanList.flatMap((kegiatan) =>
      getArray(
        kegiatan?.persyaratan,
        kegiatan?.persyaratan_kegiatan,
        kegiatan?.requirements,
        kegiatan?.t_persyaratan_kegiatan,
      ).map((item) => ({
        ...item,
        nama_kegiatan:
          kegiatan?.nama_kegiatans ||
          kegiatan?.nama_kegiatan ||
          kegiatan?.nama ||
          "Kegiatan",
      })),
    );
  });
}

function hitungDeteksiVendor(programs, vendors) {
  const map = {};

  vendors.forEach((vendor) => {
    const namaVendor = ambilNamaVendor(vendor);

    map[namaVendor] = {
      name: namaVendor,
      total: 0,
      reject: 0,
      rasio: 0,
    };
  });

  programs.forEach((program) => {
    const namaVendor = ambilNamaVendorDariProgram(program, vendors);
    const requirements = ambilRequirementKegiatan(program);

    if (!map[namaVendor]) {
      map[namaVendor] = {
        name: namaVendor,
        total: 0,
        reject: 0,
        rasio: 0,
      };
    }

    requirements.forEach((requirement) => {
      map[namaVendor].total += 1;

      if (normalisasiStatusRequirement(requirement) === "REJECTED") {
        map[namaVendor].reject += 1;
      }
    });
  });

  return Object.values(map)
    .map((item) => ({
      ...item,
      rasio: item.total ? Math.round((item.reject / item.total) * 100) : 0,
    }))
    .sort((a, b) => b.reject - a.reject || b.rasio - a.rasio)
    .slice(0, 8);
}

function TooltipDiagram({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-cyan-100 bg-white px-4 py-3 shadow-[0_18px_45px_rgba(15,23,42,0.14)]">
      {label && (
        <p className="mb-2 max-w-[240px] text-[10px] font-black uppercase tracking-widest text-slate-700">
          {label}
        </p>
      )}

      <div className="space-y-1.5">
        {payload.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color || item.fill }}
              />

              <span className="text-[11px] font-bold text-slate-500">
                {item.name}
              </span>
            </div>

            <span className="text-[11px] font-black text-slate-800">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function KartuBagian({ judul, subjudul, kanan, children, className = "" }) {
  return (
    <Card
      className={`overflow-hidden rounded-[1.8rem] border border-cyan-100 bg-white !p-0 shadow-[0_22px_70px_rgba(10,196,224,0.07)] ${className}`}
    >
      <div className="flex items-center justify-between gap-4 border-b border-cyan-50 bg-white px-5 py-4">
        <div>
          <h2 className="text-[15px] font-black tracking-tight text-slate-900">
            {judul}
          </h2>

          {subjudul && (
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-600/60">
              {subjudul}
            </p>
          )}
        </div>

        {kanan}
      </div>

      {children}
    </Card>
  );
}

function KartuAngka({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-cyan-100 bg-cyan-50/50 p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#0AC4E0] shadow-sm">
        {icon}
      </div>

      <p className="text-[26px] font-black leading-none tracking-[-0.05em] text-slate-900">
        {value}
      </p>

      <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-cyan-700">
        {label}
      </p>
    </div>
  );
}

function FilterKategori({ activeFilter, setActiveFilter }) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTER_KATEGORI.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => setActiveFilter(item.value)}
          className={`rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-widest transition ${activeFilter === item.value
            ? "border-[#0AC4E0] bg-[#0AC4E0] text-white"
            : "border-cyan-100 bg-white text-[#0AC4E0] hover:bg-cyan-50"
            }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function EmptyChart({ icon, text }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-[#0AC4E0]">
        {icon}
      </div>

      <p className="mt-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
        {text}
      </p>
    </div>
  );
}
export default function DashboardAdmin() {
  const [programs, setPrograms] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [schools, setSchools] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [activeFilter, setActiveFilter] = useState("SEMUA");
  const [searchValue, setSearchValue] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProgramDetail = async (program, headers) => {
    const id = ambilIdProgram(program);

    if (!id) return program;

    try {
      const response = await fetch(`${API_BASE_URL}/program/${id}`, {
        headers,
      });

      const payload = await safeJson(response);

      if (!response.ok) return program;

      return payload?.data || payload || program;
    } catch {
      return program;
    }
  };

  const fetchDashboardData = async () => {
    setRefreshing(true);

    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [
        programData,
        assessmentData,
        schoolData,
        vendorData,
        teacherData,
      ] = await Promise.all([
        ambilDataDenganFallback(["/program", "/programs"], headers),
        ambilDataDenganFallback(["/assessment", "/assessments"], headers),
        ambilDataDenganFallback(["/sekolah", "/schools"], headers),
        ambilDataDenganFallback(
          ["/users/vendor", "/vendor", "/vendors"],
          headers,
        ),
        ambilDataDenganFallback(
          ["/users/guru", "/guru", "/teachers", "/users"],
          headers,
        ),
      ]);

      const detailedPrograms = await Promise.all(
        programData.map((program) => fetchProgramDetail(program, headers)),
      );

      const dataVendor = vendorData.filter((item) => {
        if (item?.id_role === undefined) return true;
        return Number(item.id_role) === 6;
      });

      const dataGuru = teacherData.filter((item) => {
        const role = String(item?.nama_role || item?.role || "").toLowerCase();
        const jabatan = String(item?.jabatan || "").toLowerCase();

        return (
          Number(item?.id_role) === 5 ||
          Number(item?.id_role) === 8 ||
          role.includes("guru") ||
          jabatan.includes("guru") ||
          item?.id_guru ||
          item?.nama_guru
        );
      });

      setPrograms(detailedPrograms);
      setAssessments(assessmentData);
      setSchools(schoolData);
      setVendors(dataVendor);
      setTeachers(dataGuru);
    } catch (error) {
      console.error("Dashboard Admin Error:", error);
      alert(error.message || "Gagal memuat Dashboard Admin");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const filteredPrograms = useMemo(() => {
    return programs
      .filter((item) => sesuaiFilterKategori(item, activeFilter))
      .filter((item) => {
        const keyword = searchValue.toLowerCase();

        return [
          item?.nama_program,
          item?.kode_program,
          item?.kategori,
          ambilStatusProgram(item),
          ambilSekolahDariProgram(item),
          ambilNamaVendorDariProgram(item, vendors),
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword);
      });
  }, [programs, vendors, activeFilter, searchValue]);

  const filteredAssessments = useMemo(() => {
    return assessments
      .filter((item) => sesuaiFilterKategori(item, activeFilter))
      .filter((item) => {
        const keyword = searchValue.toLowerCase();

        return [
          item?.nama_assessment,
          item?.nama,
          item?.kode_assessment,
          item?.kategori,
          ambilStatusAssessment(item),
          ambilSekolahDariAssessment(item),
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword);
      });
  }, [assessments, activeFilter, searchValue]);

  const filteredVendors = useMemo(() => {
    return vendors
      .filter((item) => sesuaiFilterKategori(item, activeFilter))
      .filter((item) => {
        const keyword = searchValue.toLowerCase();

        return [ambilNamaVendor(item), item?.email, item?.kategori, item?.jenis]
          .join(" ")
          .toLowerCase()
          .includes(keyword);
      });
  }, [vendors, activeFilter, searchValue]);

  const filteredSchools = useMemo(() => {
    return schools.filter((item) => {
      const keyword = searchValue.toLowerCase();

      return [
        ambilNamaSekolah(item),
        item?.alamat,
        item?.alamat_sekolah,
        item?.nama_wilayah,
        item?.wilayah?.nama_wilayah,
        item?.kategori,
        item?.jenis,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [schools, searchValue]);

  const ringkasan = useMemo(() => {
    const programBerjalan = filteredPrograms.filter((program) => {
      const status = String(ambilStatusProgram(program)).toLowerCase();

      return (
        !status.includes("selesai") &&
        !status.includes("done") &&
        !status.includes("completed")
      );
    }).length;

    const assessmentSelesai = filteredAssessments.filter((assessment) => {
      const status = String(ambilStatusAssessment(assessment)).toLowerCase();

      return (
        status.includes("terkirim") ||
        status.includes("submit") ||
        status.includes("selesai") ||
        status.includes("aktif")
      );
    }).length;

    const vendorBermasalah = hitungDeteksiVendor(
      filteredPrograms,
      filteredVendors,
    ).filter((item) => item.reject > 0).length;

    return {
      sekolah: filteredSchools.length,
      programBerjalan,
      assessment: filteredAssessments.length,
      assessmentSelesai,
      vendorBermasalah,
    };
  }, [filteredPrograms, filteredAssessments, filteredSchools, filteredVendors]);

  const diagramStatusProgram = useMemo(() => {
    return kelompokkanData(filteredPrograms, ambilStatusProgram);
  }, [filteredPrograms]);

  const diagramStatusAssessment = useMemo(() => {
    return kelompokkanData(filteredAssessments, ambilStatusAssessment);
  }, [filteredAssessments]);

  const diagramDeteksiVendor = useMemo(() => {
    return hitungDeteksiVendor(filteredPrograms, filteredVendors);
  }, [filteredPrograms, filteredVendors]);

  const insightVendors = useMemo(() => {
    const bermasalah = diagramDeteksiVendor.filter((item) => item.reject > 0);

    if (bermasalah.length === 0) {
      return {
        status: "Aman",
        title: "Belum ada reject kegiatan vendor",
        message:
          "Berdasarkan data progress monitoring yang terbaca, belum ditemukan reject pada persyaratan kegiatan vendor.",
      };
    }

    const topVendor = bermasalah[0];

    return {
      status: "Perlu Perhatian",
      title: `${topVendor.name} perlu ditinjau`,
      message: `${topVendor.reject} reject dari ${topVendor.total} item kegiatan terbaca. Data ini dapat menjadi bahan pertimbangan untuk evaluasi vendor.`,
    };
  }, [diagramDeteksiVendor]);

  if (loading) {
    return (
      <PageWrapper className="flex h-screen w-full overflow-hidden bg-white !p-0">
        <Sidebar />

        <main className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-11 w-11 animate-spin text-[#0AC4E0]" />

            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-cyan-500/70">
              Memuat Dashboard Admin...
            </p>
          </div>
        </main>
      </PageWrapper>
    );
  }
  return (
    <>
      <style>{`
        html, body {
          background-color: #FFFFFF;
          font-family: 'Poppins', sans-serif;
        }

        .admin-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .admin-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .admin-scroll::-webkit-scrollbar-thumb {
          background: rgba(10, 196, 224, 0.35);
          border-radius: 999px;
        }

        .recharts-wrapper text {
          font-family: 'Poppins', sans-serif !important;
          font-size: 11px;
          font-weight: 700;
        }

        .leaflet-container {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>

      <PageWrapper className="flex min-h-screen w-full bg-white !p-0">
        <Sidebar />

        <main className="admin-scroll h-screen flex-1 overflow-y-auto bg-white p-6">
          <header className="mb-6 overflow-hidden rounded-[2rem] border border-cyan-100 bg-white p-6 shadow-[0_28px_90px_rgba(10,196,224,0.11)]">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-start gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.35rem] bg-[#0AC4E0] text-white shadow-[0_18px_38px_rgba(10,196,224,0.3)]">
                  <LayoutDashboard size={27} />
                </div>

                <div>
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-[#0AC4E0]">
                      Dashboard Admin
                    </span>

                    <span className="rounded-full border border-cyan-100 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-700">
                      Central Of Excellence
                    </span>
                  </div>

                  <h1 className="text-[34px] font-black leading-tight tracking-[-0.06em] text-slate-950">
                    Ringkasan Monitoring
                  </h1>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex h-12 min-w-[300px] items-center">
                  <Search
                    size={17}
                    className="absolute left-4 text-[#0AC4E0]"
                  />

                  <Input
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="Cari program, assessment, sekolah, atau vendor..."
                    className="!h-12 !rounded-2xl !border-cyan-100 !bg-cyan-50 !pl-11 !text-[12px] !font-bold !text-slate-700 placeholder:!text-cyan-500/45"
                  />
                </div>

                <Button
                  type="button"
                  text={refreshing ? "Memuat..." : "Muat Ulang"}
                  icon={
                    <RefreshCcw
                      size={15}
                      className={refreshing ? "animate-spin" : ""}
                    />
                  }
                  onClick={fetchDashboardData}
                  disabled={refreshing}
                  className="!h-12 !rounded-2xl !bg-[#0AC4E0] !px-5 !text-[11px] !font-black !uppercase !tracking-widest !text-white hover:!bg-cyan-500 disabled:!opacity-60"
                />
              </div>
            </div>

            <div className="mt-6">
              <FilterKategori
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
              />
            </div>
          </header>

          <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <KartuAngka
              label="Sekolah"
              value={ringkasan.sekolah}
              icon={<MapPinned size={18} />}
            />

            <KartuAngka
              label="Program Berjalan"
              value={ringkasan.programBerjalan}
              icon={<BarChart3 size={18} />}
            />

            <KartuAngka
              label="Assessment"
              value={ringkasan.assessment}
              icon={<ClipboardCheck size={18} />}
            />

            <KartuAngka
              label="Assessment Selesai"
              value={ringkasan.assessmentSelesai}
              icon={<PieIcon size={18} />}
            />

            <KartuAngka
              label="Vendor Perlu Ditinjau"
              value={ringkasan.vendorBermasalah}
              icon={<AlertTriangle size={18} />}
            />
          </section>

          <section className="mb-6">
            <CoreIntelligenceCard
              programs={filteredPrograms}
              assessments={filteredAssessments}
              schools={filteredSchools}
              vendors={filteredVendors}
              teachers={teachers}
            />
          </section>

          <section className="mb-6">
            <RegionalSchoolMap
              schools={filteredSchools}
              wilayah={null}
              mode="admin"
              title="Peta Sebaran Sekolah"
              subtitle="Sebaran sekolah yang terdaftar dalam sistem monitoring."
            />
          </section>

          <section className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
            <KartuBagian
              judul="Status Program"
              subjudul="Filter mengikuti kategori aktif"
              kanan={<PieIcon size={18} className="text-[#0AC4E0]" />}
            >
              <div className="h-[360px] p-5">
                {diagramStatusProgram.length === 0 ? (
                  <EmptyChart
                    icon={<BarChart3 size={24} />}
                    text="Belum ada data program"
                  />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={diagramStatusProgram}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={72}
                        outerRadius={118}
                        paddingAngle={5}
                      >
                        {diagramStatusProgram.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={WARNA_DIAGRAM[index % WARNA_DIAGRAM.length]}
                          />
                        ))}
                      </Pie>

                      <Tooltip content={<TooltipDiagram />} />

                      <Legend
                        iconType="circle"
                        formatter={(value) => (
                          <span className="text-[11px] font-black text-slate-600">
                            {value}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </KartuBagian>

            <KartuBagian
              judul="Status Assessment"
              subjudul="Filter mengikuti kategori aktif"
              kanan={<ClipboardCheck size={18} className="text-[#0AC4E0]" />}
            >
              <div className="h-[360px] p-5">
                {diagramStatusAssessment.length === 0 ? (
                  <EmptyChart
                    icon={<ClipboardCheck size={24} />}
                    text="Belum ada data assessment"
                  />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={diagramStatusAssessment}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={72}
                        outerRadius={118}
                        paddingAngle={5}
                      >
                        {diagramStatusAssessment.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={WARNA_DIAGRAM[index % WARNA_DIAGRAM.length]}
                          />
                        ))}
                      </Pie>

                      <Tooltip content={<TooltipDiagram />} />

                      <Legend
                        iconType="circle"
                        formatter={(value) => (
                          <span className="text-[11px] font-black text-slate-600">
                            {value}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </KartuBagian>
          </section>

          <section className="mb-6">
            <KartuBagian
              judul="Deteksi Kinerja Vendor"
              subjudul="Berdasarkan reject pada progress monitoring kegiatan"
              kanan={<Factory size={18} className="text-[#0AC4E0]" />}
            >
              <div className="grid grid-cols-1 gap-5 p-5 xl:grid-cols-[1fr_340px]">
                <div className="h-[390px]">
                  {diagramDeteksiVendor.length === 0 ? (
                    <EmptyChart
                      icon={<Factory size={24} />}
                      text="Belum ada data vendor"
                    />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={diagramDeteksiVendor}
                        layout="vertical"
                        margin={{ top: 12, right: 28, left: 90, bottom: 12 }}
                      >
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />

                          <XAxis
                            type="number"
                            allowDecimals={false}
                            tick={{
                              fill: "#64748B",
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                            axisLine={false}
                            tickLine={false}
                          />

                          <YAxis
                            dataKey="name"
                            type="category"
                            width={150}
                            tick={{
                              fill: "#475569",
                              fontSize: 10,
                              fontWeight: 700,
                            }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => potongLabel(value, 20)}
                          />

                          <Tooltip content={<TooltipDiagram />} />

                          <Bar
                            dataKey="reject"
                            name="Reject"
                            fill={WARNA.cyan}
                            radius={12}
                          />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <aside className="rounded-[1.5rem] border border-cyan-100 bg-cyan-50/60 p-5">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#0AC4E0] shadow-sm">
                    <AlertTriangle size={21} />
                  </div>

                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-700">
                    AI Deteksi Vendor
                  </p>

                  <h3 className="mt-3 text-[18px] font-black leading-tight text-slate-900">
                    {insightVendors.title}
                  </h3>

                  <p className="mt-3 text-[12px] font-semibold leading-6 text-slate-500">
                    {insightVendors.message}
                  </p>

                  <div className="mt-5 space-y-3">
                    {diagramDeteksiVendor.slice(0, 4).map((vendor) => (
                      <div
                        key={vendor.name}
                        className="rounded-2xl border border-cyan-100 bg-white p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="line-clamp-1 text-[12px] font-black text-slate-900">
                            {vendor.name}
                          </p>

                          <span className="rounded-full bg-cyan-50 px-3 py-1 text-[9px] font-black text-cyan-700">
                            {vendor.rasio}%
                          </span>
                        </div>

                        <p className="mt-2 text-[10px] font-bold text-slate-400">
                          {vendor.reject} reject dari {vendor.total} item
                          kegiatan.
                        </p>
                      </div>
                    ))}
                  </div>
                </aside>
              </div>
            </KartuBagian>
          </section>
        </main>
      </PageWrapper>
    </>
  );
}