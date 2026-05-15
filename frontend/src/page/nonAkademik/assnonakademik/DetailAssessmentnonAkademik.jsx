/* eslint-disable no-unused-vars */
import Sidebar from "../../../components/Sidebar";
import Button from "../../../components/Button";
import PageWrapper from "../../../components/PageWrapper";
import Label from "../../../components/Label";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  BarChart3,
  Activity,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  FileText,
  Clock,
  ChevronRight,
  ShieldCheck
} from "lucide-react";

export default function DetailAssessmentNonAkademik() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [questions, setQuestions] = useState([]);
  const [daftarPengisi, setDaftarPengisi] = useState([]);
  const [totalPengisi, setTotalPengisi] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const res = await fetch(`http://localhost:3000/assessment/${id}`);
        const data = await res.json();

        setQuestions(data.questions || []);
        setDaftarPengisi(data.daftar_pengisi || []);
        setTotalPengisi(data.total_pengisi || 0);
      } catch (error) {
        console.error("Gagal mengambil detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="w-12 h-12 border-4 border-[#0AC4E0] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalJawaban = questions.reduce(
    (acc, q) => acc + (q.stats?.reduce((sum, s) => sum + s.count, 0) || 0),
    0,
  );

  return (
    <PageWrapper className="h-screen bg-white flex overflow-hidden !p-0 font-sans selection:bg-[#0AC4E0]/20 text-slate-800">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Dekorasi Background Halus */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0AC4E0]/5 rounded-full blur-[120px] -z-10" />

        <div className="flex-1 flex flex-col px-8 pt-8 pb-4 overflow-hidden gap-6">

          {/* PROFESSIONAL HEADER SECTION */}
          <header className="flex flex-row items-center justify-between animate-in fade-in duration-1000 leading-none">
            <div className="space-y-3">
              {/* Sub-label dengan penanda aksen bar vertikal profesional */}
              <div className="flex items-center gap-2">
                <div className="w-1 h-3 bg-[#0AC4E0] rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                  Sistem Pemantauan dan Evaluasi Program
                </span>
              </div>

              {/* Judul Utama */}
              <h1 className="text-3xl font-black text-slate-800 tracking-tighter">
                Detail Soal <span className="text-[#0AC4E0]">Assessment Non-Akademik</span>
              </h1>
            </div>

            {/* Menggunakan Component Button.jsx */}
            <Button
              text="Kembali"
              icon={<ArrowLeft size={18} />}
              variant="outline"
              onClick={() => navigate("/ho/assessment/non-akademik")}
              className="!rounded-2xl !px-6 !py-3.5 !text-sm !font-bold shadow-sm border-slate-100 !text-slate-500 hover:!bg-slate-50 transition-all active:scale-95 leading-none"
            />
          </header>

          <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">

            {/* PANEL KIRI: SUMMARY & RESPONDEN (Bento Column) */}
            <div className="w-full lg:w-[350px] flex flex-col gap-6 shrink-0 overflow-hidden leading-none">

              {/* STATS MINI CARDS */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-[2rem] p-6 border-2 border-[#0AC4E0]/20 shadow-sm">
                  <Users size={18} className="text-[#0AC4E0] mb-3" />
                  <p className="text-2xl font-black text-slate-800 tracking-tighter">{totalPengisi}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Responden</p>
                </div>
                <div className="bg-white rounded-[2rem] p-6 border-2 border-[#0AC4E0]/20 shadow-sm">
                  <CheckCircle2 size={18} className="text-[#10B981] mb-3" />
                  <p className="text-2xl font-black text-slate-800 tracking-tighter">{questions.length}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Soal</p>
                </div>
              </div>

              {/* LIVE INSIGHT WIDGET */}
              <div className="bg-slate-900 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl shadow-slate-200">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-[#0AC4E0] animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0AC4E0]">Live Feed</span>
                  </div>
                  <p className="text-[13px] font-medium leading-relaxed text-slate-300">
                    Sistem merekam <span className="text-white font-black text-lg mx-1">{totalJawaban}</span> interaksi data yang telah diakumulasi secara non-akademik.
                  </p>
                </div>
                <Activity size={80} className="absolute -right-4 -bottom-4 text-white opacity-5 rotate-12" />
              </div>

              {/* RESPONDENT LOG */}
              <div className="flex-1 bg-white rounded-[2.5rem] border-2 border-[#0AC4E0]/20 shadow-sm overflow-hidden flex flex-col leading-none">
                <div className="p-6 border-b border-gray-50 flex items-center gap-2">
                  <Users size={16} className="text-[#0AC4E0]" />
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Responden Log</h3>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-1 bg-gray-50/30">
                  {daftarPengisi.length > 0 ? (
                    daftarPengisi.map((nama, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-2xl hover:border-[#0AC4E0]/30 transition-all cursor-default group">
                        <div className="w-8 h-8 rounded-xl bg-[#0AC4E0]/10 text-[#0AC4E0] flex items-center justify-center text-[10px] font-black group-hover:bg-[#0AC4E0] group-hover:text-white transition-colors leading-none">
                          {nama.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[13px] font-semibold text-slate-700 truncate leading-none">{nama}</span>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
                      <Users size={32} className="mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No Data</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* PANEL KANAN: DISTRIBUTION (Bento Main) */}
            <div className="flex-1 bg-white rounded-[2.5rem] border-2 border-[#0AC4E0]/20 shadow-sm overflow-hidden flex flex-col leading-none animate-in fade-in duration-1000 delay-200">
              <div className="p-8 border-b border-gray-50 bg-white/50 backdrop-blur-md flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-[#0AC4E0]">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-widest">Distribusi Jawaban</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Analisis Pilihan Non-Akademik</p>
                  </div>
                </div>
                <span className="px-4 py-2 bg-slate-50 rounded-full border border-gray-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {questions.length} Butir Soal
                </span>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-12">
                {questions.map((q, index) => (
                  <div key={index} className="group relative">
                    {/* Header Soal */}
                    <div className="flex items-start gap-5 mb-8">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center font-black text-sm shrink-0 border border-gray-200 group-hover:bg-[#0AC4E0] group-hover:text-white group-hover:border-[#0AC4E0] group-hover:shadow-lg group-hover:shadow-[#0AC4E0]/20 transition-all duration-500 leading-none">
                        {index + 1}
                      </div>
                      <h4 className="text-lg font-bold text-slate-800 leading-snug pt-1">
                        {q.question}
                      </h4>
                    </div>

                    {/* Statistik Bar */}
                    <div className="space-y-4 lg:pl-14">
                      {q.stats?.map((stat, i) => {
                        const percentage = totalPengisi > 0 ? (stat.count / totalPengisi) * 100 : 0;
                        const isHighest = Math.max(...q.stats.map((s) => s.count)) === stat.count && stat.count > 0;

                        return (
                          <div key={i} className="flex flex-col md:flex-row md:items-center gap-4">
                            {/* Label */}
                            <div className="flex-1 flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full shrink-0 ${isHighest ? 'bg-[#0AC4E0] shadow-[0_0_8px_rgba(10,196,224,0.5)]' : 'bg-slate-200'}`} />
                              <span className={`text-[13px] ${isHighest ? "font-bold text-slate-900" : "font-medium text-slate-500"}`}>
                                {stat.label || stat.option}
                              </span>
                            </div>

                            {/* Bar & Value */}
                            <div className="w-full md:w-[45%] flex items-center gap-4 shrink-0 leading-none">
                              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden relative">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 1.5, ease: "easeOut" }}
                                  className={`h-full rounded-full ${isHighest ? 'bg-[#0AC4E0]' : 'bg-slate-300 opacity-50'}`}
                                />
                              </div>
                              <div className="flex items-center gap-2 w-20 justify-end shrink-0">
                                <span className={`text-[13px] font-black ${isHighest ? "text-[#0AC4E0]" : "text-slate-400"}`}>
                                  {stat.count}
                                </span>
                                <span className="text-[10px] font-bold text-slate-300">
                                  ({Math.round(percentage)}%)
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Divider MacBook Style */}
                    {index < questions.length - 1 && (
                      <div className="h-px w-full bg-slate-50 mt-12" />
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Style Tambahan untuk Animasi & Scrollbar */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in {
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </PageWrapper>
  );
}