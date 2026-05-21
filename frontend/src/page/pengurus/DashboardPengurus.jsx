/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend 
} from "recharts";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  TrendingUp, 
  ArrowUpRight,
  ShieldCheck,
  Briefcase
} from "lucide-react";

import Sidebar from "../../components/Sidebar";
import PageWrapper from "../../components/PageWrapper";

const DashboardPengurus = () => {
  const [user, setUser] = useState({ nama: "", jabatan: "" });
  const [statsData, setStatsData] = useState({
    totalProgram: 0,
    totalSekolah: 0
  });
  const [dataPie, setDataPie] = useState([]);
  const [loading, setLoading] = useState(true);

  const MAIN_COLOR = "#0AC4E0";
  // Warna: Draft (Slate), Aktif/Berjalan (Cyan), Selesai (Emerald)
  const COLORS = ["#94a3b8", "#0AC4E0", "#10b981"];

  useEffect(() => {
    // 1. Decode Token
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          nama: decoded.nama || "User",
          jabatan: decoded.jabatan || "Pengurus" 
        });
      } catch (error) {
        console.error("Gagal decode token", error);
      }
    }

    // 2. Fetch Data dari API
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [resProgram, resSekolah] = await Promise.all([
          fetch("http://localhost:3000/program", { headers }),
          fetch("http://localhost:3000/sekolah", { headers })
        ]);

        const dataProgram = await resProgram.json();
        const dataSekolah = await resSekolah.json();

        // Hitung Status untuk Pie Chart
        const countDraft = dataProgram.filter(p => p.status_program === "Draft").length;
        const countAktif = dataProgram.filter(p => p.status_program === "Berjalan" || p.status_program === "Aktif").length;
        const countSelesai = dataProgram.filter(p => p.status_program === "Selesai").length;

        // Jika semua data masih 0, beri placeholder agar chart tidak crash/hilang
        if (countDraft === 0 && countAktif === 0 && countSelesai === 0) {
          setDataPie([{ name: "Belum Ada Data", value: 1 }]);
        } else {
          setDataPie([
            { name: "Draft", value: countDraft },
            { name: "Aktif", value: countAktif },
            { name: "Selesai", value: countSelesai },
          ]);
        }

        setStatsData({
          totalProgram: dataProgram.length,
          totalSekolah: dataSekolah.length
        });

      } catch (error) {
        console.error("Gagal mengambil data dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    { label: "Total Program", value: statsData.totalProgram.toString(), icon: Briefcase, color: "bg-[#0AC4E0]" },
    { label: "Sekolah Binaan", value: statsData.totalSekolah.toString(), icon: Users, color: "bg-indigo-500" },
    { label: "Laporan Masuk", value: "156", icon: FileText, color: "bg-emerald-500" },
    { label: "Realisasi Anggaran", value: "82%", icon: TrendingUp, color: "bg-amber-500" },
  ];

  return (
    <PageWrapper className="h-screen bg-[#EEF5FF] flex overflow-hidden !p-0">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden px-4 md:px-12 pt-10 pb-0">
        <div className="flex-1 !rounded-t-[2.5rem] border-none shadow-2xl bg-white flex flex-col overflow-hidden">
          
          {/* Header Dashboard */}
          <div className="px-8 md:px-16 pt-12 pb-10 flex flex-col md:flex-row items-center justify-between bg-[#0AC4E0] shrink-0">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30">
                <LayoutDashboard className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white uppercase leading-none">
                  Dashboard <span className="text-white/70">Pengurus</span>
                </h1>
                <p className="text-[10px] font-bold text-white/80 uppercase italic mt-2 tracking-widest flex items-center gap-2">
                  <ShieldCheck size={12} /> {user.jabatan} Portal Access
                </p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-4 bg-black/10 p-2 rounded-2xl border border-white/10">
                <div className="text-right">
                    <p className="text-[9px] text-white/70 font-bold uppercase">Selamat Datang,</p>
                    <p className="text-xs text-white font-black">{user.nama}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-[#0AC4E0]">
                    {user.nama ? user.nama.charAt(0) : "U"}
                </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 md:px-16 py-10 space-y-10 custom-scrollbar">
            
            {/* Grid Statistik */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-6 rounded-[2rem] bg-gray-50 border border-gray-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${item.color} text-white shadow-lg`}>
                      <item.icon size={20} />
                    </div>
                    <ArrowUpRight className="text-gray-300 group-hover:text-[#0AC4E0] transition-colors" size={18} />
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
                  <h3 className="text-2xl font-black text-gray-800 mt-1">{item.value}</h3>
                </motion.div>
              ))}
            </div>

            {/* SECTION GRAFIK */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pie Chart: Status Program */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col">
                <h2 className="text-sm font-black text-gray-800 uppercase tracking-tighter mb-6">Status Program Kerja</h2>
                
                <div style={{ width: '100%', height: 300 }}>
                  {!loading ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dataPie}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {dataPie.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.name === "Belum Ada Data" ? "#e2e8f0" : COLORS[index % COLORS.length]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest animate-pulse">Memproses Data...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Ringkasan Aktivitas */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col">
                <h2 className="text-sm font-black text-gray-800 uppercase tracking-tighter mb-6">Ringkasan Aktivitas</h2>
                <div className="flex-1 flex flex-col justify-center space-y-4">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Sekolah Teraktif</p>
                        <p className="text-lg font-black text-slate-800 uppercase">SMK Astra Binaan</p>
                    </div>
                    <div className="p-6 bg-cyan-50 rounded-3xl border border-cyan-100">
                        <p className="text-[10px] font-black text-[#0AC4E0] uppercase mb-1">Program Terbaru</p>
                        <p className="text-lg font-black text-slate-800 uppercase">Pilar Lingkungan 2026</p>
                    </div>
                </div>
              </div>
            </div>

            {/* Log Aktivitas */}
            <div className="space-y-6 pb-10">
              <h2 className="text-sm font-black text-gray-800 uppercase tracking-tighter">Log Aktivitas Terkini</h2>
              <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="p-6 flex items-center justify-between border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-[#0AC4E0]" />
                      <div>
                        <p className="text-xs font-bold text-gray-800">Review Laporan Bulanan - Sekolah {i + 1}</p>
                        <p className="text-[10px] text-gray-400 font-medium">Selesai diperiksa baru saja</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-[#0AC4E0]/10 text-[9px] font-black text-[#0AC4E0] rounded-full">DIVERIFIKASI</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #0AC4E0; border-radius: 10px; }
      `}</style>
    </PageWrapper>
  );
};

export default DashboardPengurus;