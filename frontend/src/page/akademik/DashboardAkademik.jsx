/* eslint-disable no-unused-vars */
import Sidebar from "../../components/Sidebar";
import PageWrapper from "../../components/PageWrapper";
import { useEffect, useState } from "react";
import {
  ClipboardCheck,
  School,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip,
  ResponsiveContainer, Cell, PieChart, Pie
} from "recharts";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// ── Custom SVG Pin (sama dengan Onboarding) ──────────────────────────────────
const makePinSVG = (mainColor, shadowColor) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="100" height="120">
      <ellipse cx="50" cy="112" rx="18" ry="7" fill="${shadowColor}" opacity="0.85"/>
      <path d="M50 8 C28 8 12 26 12 48 C12 72 50 108 50 108 C50 108 88 72 88 48 C88 26 72 8 50 8 Z" fill="${mainColor}"/>
      <circle cx="50" cy="46" r="18" fill="white"/>
    </svg>
  `.trim();
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

const schoolIcon = L.icon({
  iconUrl: makePinSVG("#0AC4E0", "#0077aa"),
  iconSize: [36, 44],
  iconAnchor: [18, 44],
  popupAnchor: [0, -40],
});

const schoolIconSelected = L.icon({
  iconUrl: makePinSVG("#F97316", "#c2410c"),
  iconSize: [42, 52],
  iconAnchor: [21, 52],
  popupAnchor: [0, -48],
});
// ─────────────────────────────────────────────────────────────────────────────

const getDummyCoords = (index) => {
  const baseLat = -7.0;
  const baseLng = 110.0;
  return [baseLat + Math.sin(index * 1.5) * 1.5, baseLng + Math.cos(index * 1.5) * 3.5];
};

// Warna dominan cyan — tidak ada hijau
const COLORS = ["#0AC4E0", "#0891b2", "#0e7490", "#F97316"];

export default function DashboardAkademik() {
  const [sekolahs, setSekolahs] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [resSekolah, resAss] = await Promise.all([
          fetch("http://localhost:3000/sekolah", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:3000/assessment?kategori=AKADEMIK", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (resSekolah.ok && resAss.ok) {
          const dataSekolah = await resSekolah.json();
          const dataAss = await resAss.json();
          setAssessments(Array.isArray(dataAss) ? dataAss : []);
          const mappedSekolah = (Array.isArray(dataSekolah) ? dataSekolah : []).map((s, idx) => ({
            ...s,
            coords: s.latitude && s.longitude
              ? [parseFloat(s.latitude), parseFloat(s.longitude)]
              : getDummyCoords(idx),
          }));
          setSekolahs(mappedSekolah);
        }
      } catch {
        toast.error("Gagal sinkronisasi data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalSekolah = sekolahs.length;
  const totalAssessment = assessments.length;
  const statsAss = assessments.reduce((acc, curr) => {
    const status = curr.status_assessment || "Draft";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(statsAss).map((key) => ({ name: key, value: statsAss[key] }));

  const assPerSchool = sekolahs
    .map((s) => ({
      name: s.nama_sekolah?.substring(0, 8) + "..",
      total: assessments.filter((a) => a.sekolah === s.nama_sekolah).length,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const selectedSchoolAssessments = selectedSchool
    ? assessments.filter((a) => a.sekolah === selectedSchool.nama_sekolah)
    : [];

  if (loading) return (
    <div className="h-screen bg-white flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#0AC4E0] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <PageWrapper className="h-screen bg-white flex overflow-hidden !p-0 font-sans selection:bg-[#0AC4E0]/20 text-slate-800 leading-none">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#0AC4E0]/5 rounded-full blur-[100px] -z-10" />

        <div className="flex-1 flex flex-col px-8 pt-8 pb-6 overflow-hidden gap-5">

          {/* HEADER */}
          <header className="flex flex-row items-center justify-between animate-in fade-in duration-1000 leading-none">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-3 bg-[#0AC4E0] rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                  Sistem Pemantauan dan Evaluasi Program
                </span>
              </div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tighter">
                Dashboard Head Office <span className="text-[#0AC4E0]">Akademik</span>
              </h1>
            </div>
          </header>

          {/* STATS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <StatCard icon={<School size={18} />} label="Institusi" value={totalSekolah} color="#0AC4E0" />
            <StatCard icon={<ClipboardCheck size={18} />} label="Assessment" value={totalAssessment} color="#0AC4E0" />
            <StatCard icon={<CheckCircle2 size={18} />} label="Verified" value={statsAss["Selesai"] || 0} color="#0891b2" />
            <StatCard icon={<AlertCircle size={18} />} label="Pending" value={statsAss["Draft"] || 0} color="#F97316" />
          </div>

          {/* MAIN GRID */}
          <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-5">

            {/* LEFT: MAP + CHARTS */}
            <div className="lg:col-span-8 flex flex-col gap-5 h-full overflow-hidden">

              {/* MAP */}
              <div className="flex-1 bg-white rounded-[2rem] border-2 border-[#0AC4E0]/20 shadow-sm overflow-hidden flex flex-col min-h-0">
                <div className="px-6 py-3.5 border-b border-gray-50 flex justify-between items-center bg-white/50 backdrop-blur-md shrink-0">
                  <div className="flex items-center gap-2.5">
                    <MapPin size={16} className="text-[#0AC4E0]" />
                    <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-widest">Network Coverage</h3>
                  </div>
                  <span className="text-[9px] font-bold bg-[#0AC4E0] text-white px-2.5 py-1 rounded-full uppercase">
                    {totalSekolah} Points
                  </span>
                </div>
                <div className="flex-1 z-0">
                  <MapContainer
                    center={[-6.200, 106.816]}
                    zoom={5}
                    style={{ height: "100%", width: "100%" }}
                    zoomControl={true}
                    scrollWheelZoom={true}
                  >
                    {/* Tema OpenStreetMap — sama dengan Onboarding */}
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    {sekolahs.map((s, i) => (
                      <Marker
                        key={i}
                        position={s.coords}
                        icon={selectedSchool?.nama_sekolah === s.nama_sekolah ? schoolIconSelected : schoolIcon}
                        eventHandlers={{ click: () => setSelectedSchool(s) }}
                      >
                        <Popup>
                          <div className="p-0.5 text-center">
                            <p className="font-bold text-slate-800 text-xs">{s.nama_sekolah}</p>
                            <button
                              onClick={() => setSelectedSchool(s)}
                              className="mt-2 w-full py-1.5 bg-[#0AC4E0] text-white rounded text-[9px] font-bold uppercase"
                            >
                              Select
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </div>

              {/* CHARTS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 shrink-0">
                {/* Pie */}
                <div className="bg-white p-5 rounded-[2rem] border-2 border-[#0AC4E0]/20 shadow-sm">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Status Composition</h3>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData} cx="50%" cy="50%"
                          innerRadius={35} outerRadius={50}
                          paddingAngle={5} dataKey="value" stroke="none"
                        >
                          {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Bar */}
                <div className="bg-white p-5 rounded-[2rem] border-2 border-[#0AC4E0]/20 shadow-sm">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Workload Ranking</h3>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={assPerSchool} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis
                          dataKey="name" type="category"
                          axisLine={false} tickLine={false}
                          tick={{ fontSize: 9, fontWeight: "bold", fill: "#94A3B8" }}
                          width={60}
                        />
                        <RechartsTooltip cursor={{ fill: "#F8FAFC" }} />
                        <Bar dataKey="total" fill="#0AC4E0" radius={[0, 6, 6, 0]} barSize={8} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: DETAIL */}
            <div className="lg:col-span-4 flex flex-col h-full overflow-hidden leading-none animate-in fade-in duration-1000">
              <div className="bg-white rounded-[2rem] border-2 border-[#0AC4E0]/20 shadow-sm flex flex-col h-full overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center gap-2.5 shrink-0">
                  <TrendingUp size={18} className="text-[#0AC4E0]" />
                  <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-widest">Inspection Context</h3>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-5 bg-gray-50/30">
                  {!selectedSchool ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                      <MapPin size={28} className="text-[#0AC4E0] mb-3" />
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">
                        Click marker for details
                      </p>
                    </div>
                  ) : (
                      <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="bg-white p-5 rounded-[1.5rem] border border-[#0AC4E0]/10 shadow-sm">
                          <p className="text-[8px] font-black text-[#0AC4E0] uppercase tracking-widest mb-1">
                            NPSN: {selectedSchool.npsn}
                          </p>
                          <h4 className="text-sm font-bold text-slate-800 leading-tight">{selectedSchool.nama_sekolah}</h4>
                          <div className="mt-3 flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase">
                            <MapPin size={10} className="text-[#0AC4E0]" />
                            {selectedSchool.wilayah?.nama_wilayah?.split("/").pop() || "ID"}
                        </div>
                      </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between px-1">
                            <h5 className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Activity History</h5>
                            <span className="text-[8px] font-black bg-[#0AC4E0]/10 text-[#0AC4E0] px-2 py-0.5 rounded-full">
                              {selectedSchoolAssessments.length} UNITS
                          </span>
                        </div>

                          {selectedSchoolAssessments.map((ass) => (
                            <div key={ass.id_assessment} className="group bg-white p-4 rounded-[1.2rem] border border-gray-100 hover:border-[#0AC4E0]/40 transition-all shadow-sm">
                              <div className="flex justify-between items-center mb-2.5 leading-none">
                                <div className={`w-1.5 h-1.5 rounded-full ${ass.status_assessment === "Selesai" ? "bg-[#0AC4E0]" : "bg-[#F97316]"}`} />
                                <span className="text-[8px] font-black text-slate-300 uppercase">{ass.kode_assessment}</span>
                              </div>
                            <h6 className="text-[11px] font-bold text-slate-700 group-hover:text-[#0AC4E0] transition-colors leading-snug mb-3">
                              {ass.nama_assessment}
                            </h6>
                            <div className="flex items-center gap-3 text-[8px] font-black text-slate-300 uppercase leading-none">
                              <span className="flex items-center gap-1"><Clock size={10} /> {ass.tahun}</span>
                              <span className="flex items-center gap-1 shrink-0"><User size={10} /> {ass.pembuat}</span>
                            </div>
                          </div>
                        ))}
                        </div>
                      </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .leaflet-container { font-family: inherit; }
        .leaflet-popup-content-wrapper { border-radius: 16px !important; padding: 8px !important; box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important; }
        .leaflet-popup-content { margin: 0 !important; }
        .leaflet-control-zoom a { border-radius: 10px !important; color: #0AC4E0 !important; }
      `}} />
    </PageWrapper>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color }) => (
  <div className="group bg-white p-4 rounded-[1.5rem] border-2 border-[#0AC4E0]/20 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4">
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
      style={{ backgroundColor: `${color}15`, color }}
    >
      {icon}
    </div>
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 leading-none mb-1">{label}</p>
      <h3 className="text-xl font-black text-slate-800 leading-none tracking-tight">{value}</h3>
    </div>
  </div>
);