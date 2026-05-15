/* eslint-disable no-unused-vars */
import Sidebar from "../../../components/Sidebar";
import Button from "../../../components/Button";
import Label from "../../../components/Label";
import Input from "../../../components/Input";
import IconButton from "../../../components/IconButton";
import PageWrapper from "../../../components/PageWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

import { Trash2, ArrowLeft, Save, Plus, FileText, Sparkles, LayoutGrid, ClipboardList } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

function EditAssessmentAkademik() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAssessment = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/assessment/${id}`);
        const data = await res.json();
        setQuestions(data.questions || []);
      } catch (err) {
        console.error("Gagal mengambil assessment", err);
        toast.error("Gagal memuat data assessment");
      } finally {
        setLoading(false);
      }
    };
    fetchAssessment();
  }, [id]);

  const handleQuestionChange = (index, value) => {
    const updated = [...questions];
    updated[index].question = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) {
      toast.warn("Minimal harus terdapat satu pertanyaan");
      return;
    }
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", "", "", ""] }]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:3000/assessment/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions }),
      });

      if (!res.ok) throw new Error("Gagal update");

      toast.success("Perubahan berhasil disimpan");
      navigate("/ho/assessment/akademik");
    } catch (err) {
      toast.error("Gagal memperbarui assessment");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#0AC4E0] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PageWrapper className="h-screen bg-white flex overflow-hidden !p-0 font-sans selection:bg-[#0AC4E0]/20 text-slate-800">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Subtle Background Decor */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0AC4E0]/5 rounded-full blur-[120px] -z-10" />

        <div className="flex-1 flex flex-col px-8 pt-10 pb-4 overflow-hidden leading-none gap-8">

          {/* HEADER SECTION - PROFESSIONAL STYLE */}
          <header className="flex flex-row items-center justify-between mb-10 animate-in fade-in duration-1000 leading-none">
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
                Edit Data Soal <span className="text-[#0AC4E0]">Assessment</span>
              </h1>
            </div>

            {/* Menggunakan Component Button.jsx */}
            <Button
              text="Kembali"
              icon={<ArrowLeft size={18} />}
              variant="outline"
              onClick={() => navigate("/ho/assessment/akademik")}
              className="!rounded-2xl !px-6 !py-3.5 !text-sm !font-bold shadow-sm border-slate-100 !text-slate-500 hover:!bg-slate-50 transition-all active:scale-95 leading-none"
            />
          </header>

          {/* QUICK STATS PILL */}
          <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border border-slate-100 rounded-full w-fit animate-in fade-in zoom-in-95 duration-700">
            <ClipboardList size={16} className="text-[#0AC4E0]" />
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest leading-none">
              Total: {questions.length} Butir Pertanyaan
            </span>
          </div>

          {/* EDITING AREA */}
          <div className="flex-1 overflow-y-auto no-scrollbar pr-2 space-y-8 pb-20">
            <div className="space-y-6">
              {questions.map((q, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={index}
                  className="bg-white rounded-[2.5rem] border-2 border-[#0AC4E0]/20 p-8 shadow-sm relative overflow-hidden group"
                >
                  {/* Card Header: Nomor & Delete */}
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-[#0AC4E0] text-white flex items-center justify-center font-black text-sm shadow-lg shadow-[#0AC4E0]/30 leading-none">
                        {index + 1}
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Konfigurasi Pertanyaan</p>
                    </div>
                    <button
                      onClick={() => removeQuestion(index)}
                      className="w-10 h-10 rounded-full bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-90"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Input Pertanyaan */}
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <Label text="Pertanyaan Utama" required className="!text-[10px] !font-black !text-[#0AC4E0] !uppercase !tracking-widest !ml-1" />
                      <Input
                        value={q.question}
                        onChange={(e) => handleQuestionChange(index, e.target.value)}
                        placeholder="Tuliskan pertanyaan di sini..."
                        className="!bg-white !border-slate-200 !rounded-2xl !py-4 !px-6 !text-[15px] !font-bold !text-slate-800 focus:!border-[#0AC4E0] focus:!ring-0 transition-all shadow-sm leading-snug"
                      />
                    </div>

                    {/* Grid Jawaban */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                      {q.options.map((opt, i) => (
                        <div key={i} className="space-y-2 leading-none">
                          <div className="flex items-center gap-2 ml-1">
                            <span className="text-[10px] font-black text-[#0AC4E0] bg-white w-5 h-5 rounded-md flex items-center justify-center border border-slate-200">
                              {String.fromCharCode(65 + i)}
                            </span>
                            <Label text={`Pilihan Jawaban`} className="!mb-0 !text-[9px] !font-black !text-slate-400 !uppercase !tracking-widest" />
                          </div>
                          <Input
                            value={opt}
                            placeholder={`Jawaban ${String.fromCharCode(65 + i)}`}
                            onChange={(e) => handleOptionChange(index, i, e.target.value)}
                            className="!bg-white !border-transparent !rounded-xl !py-3.5 !px-5 !text-[13px] !font-semibold text-slate-700 focus:!border-[#0AC4E0]/30 transition-all shadow-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* BUTTON ADD QUESTION */}
            <button
              onClick={addQuestion}
              className="w-full py-6 bg-white border-2 border-dashed border-[#0AC4E0]/30 rounded-[2.5rem] text-[#0AC4E0] font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 hover:bg-[#0AC4E0]/5 hover:border-[#0AC4E0] transition-all active:scale-[0.99] leading-none mb-10"
            >
              <Plus size={20} strokeWidth={3} /> Sisipkan Pertanyaan Baru
            </button>
          </div>

          {/* STICKY FOOTER ACTION */}
          <footer className="mt-auto py-6 bg-white/60 backdrop-blur-xl border border-slate-100 rounded-[2.5rem] flex items-center justify-end px-10 shadow-sm leading-none shrink-0">
            <button
              disabled={saving}
              onClick={handleSave}
              className="flex items-center gap-3 px-12 py-4 bg-[#0AC4E0] hover:bg-[#09b3cc] text-white rounded-2xl text-[13px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#0AC4E0]/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <Save size={20} />
              {saving ? "MENYIMPAN..." : "SIMPAN PERUBAHAN"}
            </button>
          </footer>
        </div>
      </main>

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

export default EditAssessmentAkademik;