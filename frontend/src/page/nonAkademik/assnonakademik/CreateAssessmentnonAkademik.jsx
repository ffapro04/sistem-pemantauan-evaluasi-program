/* eslint-disable no-undef */
import Sidebar from "../../../components/Sidebar";
import Label from "../../../components/Label";
import Input from "../../../components/Input";
import PageWrapper from "../../../components/PageWrapper";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

import { useNavigate } from "react-router-dom";
import {
  Trash2,
  ArrowLeft,
  Save,
  Plus,
  Sparkles,
  ChevronDown,
  Clock,
  School,
  User,
  LayoutGrid
} from "lucide-react";
import { useState, useEffect } from "react";

function CreateAssessmentNonAkademik() {
  const navigate = useNavigate();
  const [hoList, setHoList] = useState([]);
  const [selectedHo, setSelectedHo] = useState(null);
  const [sekolahList, setSekolahList] = useState([]);
  const [selectedSekolah, setSelectedSekolah] = useState(null);
  const [loading, setLoading] = useState(false);
  const [namaAssessment, setNamaAssessment] = useState("");
  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""] },
  ]);
  const [tenggat, setTenggat] = useState(7);

  useEffect(() => {
    const fetchHo = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/users/ho", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          // Filter khusus non-akademik
          const filteredHo = data.filter((ho) => ho.jenis === "non-akademik");
          setHoList(filteredHo);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchHo();

    const fetchSekolah = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/sekolah", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setSekolahList(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSekolah();
  }, []);

  const addQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", "", "", ""] }]);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

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

  const saveAssessment = async () => {
    if (!selectedHo) return toast.error("Silakan pilih HO terlebih dahulu");
    if (!selectedSekolah) return toast.error("Silakan pilih sekolah terlebih dahulu");
    if (!namaAssessment.trim()) return toast.error("Nama assessment harus diisi");

    for (let q of questions) {
      if (!q.question.trim()) return toast.error("Pertanyaan tidak boleh kosong");
      if (q.options.some((opt) => !opt.trim())) return toast.error("Semua pilihan harus diisi");
    }

    const payload = {
      id_ho: Number(selectedHo),
      nama: namaAssessment.trim(),
      target_sekolah_ids: [Number(selectedSekolah)],
      tenggat: tenggat,
      jenis: "non-akademik", // Explicitly set jenis
      questions: questions.map((q) => ({
        question: q.question.trim(),
        options: q.options.map((opt) => opt.trim()),
      })),
    };

    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gagal");
      toast.success("Assessment Non-Akademik berhasil dibuat!");
      navigate("/ho/assessment/non-akademik");
    } catch (err) {
      toast.error("Gagal membuat assessment");
    } finally {
      setLoading(false);
    }
  };

  function CustomDropdown({ label, items, value, onSelect, placeholder, icon: Icon }) {
    const [open, setOpen] = useState(false);
    const selectedItem = items.find(i => (i.id_user || i.id_sekolah) === value);

    return (
      <div className="relative w-full group">
        <Label text={label} required className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-1 !mb-2" />
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center justify-between px-5 py-3.5 bg-white border-2 transition-all duration-300 rounded-2xl ${open ? 'border-[#0AC4E0] ring-4 ring-[#0AC4E0]/10 shadow-lg' : 'border-slate-100 hover:border-[#0AC4E0]/40 shadow-sm'}`}
        >
          <div className="flex items-center gap-3">
            <Icon size={18} className={open ? "text-[#0AC4E0]" : "text-slate-300"} />
            <span className={`text-sm font-semibold ${selectedItem ? "text-slate-800" : "text-slate-300"}`}>
              {selectedItem ? (selectedItem.nama || selectedItem.nama_sekolah) : placeholder}
            </span>
          </div>
          <ChevronDown size={16} className={`transition-transform duration-300 ${open ? 'rotate-180 text-[#0AC4E0]' : 'text-slate-300'}`} />
        </button>
        <AnimatePresence>
          {open && (
            <motion.ul
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute z-50 w-full bg-white/90 backdrop-blur-xl border border-slate-100 mt-2 rounded-2xl shadow-2xl max-h-60 overflow-y-auto no-scrollbar p-2"
            >
              {items.map((item) => (
                <li
                  key={item.id_user || item.id_sekolah}
                  onClick={() => { onSelect(item.id_user || item.id_sekolah); setOpen(false); }}
                  className="px-4 py-3 hover:bg-[#0AC4E0] hover:text-white rounded-xl cursor-pointer text-sm font-bold text-slate-600 transition-all mb-1 last:mb-0"
                >
                  {item.nama || item.nama_sekolah}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <PageWrapper className="h-screen bg-white flex overflow-hidden !p-0 font-sans selection:bg-[#0AC4E0]/20">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0AC4E0]/5 rounded-full blur-[120px] -z-10" />

        <div className="flex-1 flex flex-col px-8 pt-8 pb-4 overflow-hidden leading-none">
          {/* COMPACT HEADER */}
          <header className="flex flex-row items-end justify-between mb-8 animate-in fade-in duration-700">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#0AC4E0] rounded-lg text-white shadow-lg shadow-[#0AC4E0]/20">
                  <LayoutGrid size={14} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0AC4E0]">Non-Academic Module</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-none">
                New <span className="text-[#0AC4E0]">Assessment</span>
              </h1>
            </div>

            <button
              onClick={() => navigate("/ho/assessment/non-akademik")}
              className="flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-500 rounded-2xl text-sm font-bold shadow-sm border border-slate-100 transition-all active:scale-95 leading-none"
            >
              <ArrowLeft size={18} /> Kembali
            </button>
          </header>

          <div className="flex-1 overflow-y-auto no-scrollbar pr-2 space-y-8 pb-10">
            {/* SECTION 1: CORE INFO (BENTO CARD) */}
            <div className="bg-white rounded-[2.5rem] border-2 border-[#0AC4E0]/20 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <CustomDropdown
                  label="Penanggung Jawab (HO Non-Akademik)"
                  items={hoList}
                  value={selectedHo}
                  onSelect={setSelectedHo}
                  placeholder="Pilih Personil Non-Akademik..."
                  icon={User}
                />
                <CustomDropdown
                  label="Institusi Sekolah"
                  items={sekolahList}
                  value={selectedSekolah}
                  onSelect={setSelectedSekolah}
                  placeholder="Pilih Sekolah Tujuan..."
                  icon={School}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-3">
                  <Label text="Nama Assessment Non-Akademik" required className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-1" />
                  <Input
                    placeholder="Contoh: Evaluasi Sarana Prasarana / Ekstrakurikuler..."
                    value={namaAssessment}
                    onChange={(e) => setNamaAssessment(e.target.value)}
                    className="!bg-slate-50/50 !border-slate-100 !rounded-2xl !py-4 !px-6 !text-sm !font-bold !text-slate-800 focus:!border-[#0AC4E0] focus:!ring-4 focus:!ring-[#0AC4E0]/5 transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-3">
                  <Label text="Tenggat (Hari)" required className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-1" />
                  <div className="relative">
                    <Input
                      type="number"
                      value={tenggat}
                      onChange={(e) => setTenggat(Number(e.target.value))}
                      className="!bg-slate-50/50 !border-slate-100 !rounded-2xl !py-4 !px-12 !text-center !font-black !text-lg !text-[#0AC4E0] focus:!border-[#0AC4E0] transition-all shadow-sm"
                    />
                    <Clock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: QUESTIONS LIST */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-[#0AC4E0] rounded-full" />
                  Konstruksi Instrumen
                </h3>
                <span className="text-[10px] font-black bg-[#0AC4E0]/10 text-[#0AC4E0] px-3 py-1 rounded-full">
                  {questions.length} ITEM PERTANYAAN
                </span>
              </div>

              {questions.map((q, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={index}
                  className="bg-white rounded-[2.5rem] border-2 border-[#0AC4E0]/20 p-8 shadow-sm relative overflow-hidden group"
                >
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-[#0AC4E0] text-white flex items-center justify-center font-black text-sm shadow-lg shadow-[#0AC4E0]/30">
                        {index + 1}
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Draft Butir Instrumen</p>
                    </div>
                    <button
                      onClick={() => removeQuestion(index)}
                      className="w-10 h-10 rounded-full bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-90"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-3">
                      <Label text="Pertanyaan / Indikator" required className="!text-[10px] !font-black !text-[#0AC4E0] !uppercase !tracking-widest !ml-1" />
                      <Input
                        placeholder="Tuliskan indikator penilaian non-akademik di sini..."
                        value={q.question}
                        onChange={(e) => handleQuestionChange(index, e.target.value)}
                        className="!bg-white !border-slate-200 !rounded-2xl !py-4 !px-6 !text-[15px] !font-bold !text-slate-800 focus:!border-[#0AC4E0] focus:!ring-0 transition-all shadow-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                      {q.options.map((opt, optIndex) => (
                        <div key={optIndex} className="space-y-2">
                          <div className="flex items-center gap-2 ml-1">
                            <span className="text-[10px] font-black text-[#0AC4E0] bg-white w-5 h-5 rounded-md flex items-center justify-center border border-slate-200">
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <Label text={`Skala / Pilihan`} className="!mb-0 !text-[9px] !font-black !text-slate-400 !uppercase !tracking-widest" />
                          </div>
                          <Input
                            value={opt}
                            placeholder={`Ketik deskripsi pilihan...`}
                            onChange={(e) => handleOptionChange(index, optIndex, e.target.value)}
                            className="!bg-white !border-transparent !rounded-xl !py-3 !px-5 !text-sm !font-semibold focus:!border-[#0AC4E0]/30 transition-all shadow-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}

              <button
                onClick={addQuestion}
                className="w-full py-6 bg-white border-2 border-dashed border-[#0AC4E0]/30 rounded-[2.5rem] text-[#0AC4E0] font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 hover:bg-[#0AC4E0]/5 hover:border-[#0AC4E0] transition-all active:scale-[0.99]"
              >
                <Plus size={20} strokeWidth={3} /> Tambah Butir Instrumen
              </button>
            </div>
          </div>

          {/* STICKY ACTION FOOTER */}
          <footer className="mt-6 py-6 bg-white/60 backdrop-blur-xl border border-slate-100 rounded-[2.5rem] flex items-center justify-between px-10 shadow-sm leading-none shrink-0">
            <button
              onClick={() => navigate("/ho/assessment/non-akademik")}
              className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
            >
              Batalkan
            </button>
            <button
              disabled={loading}
              onClick={saveAssessment}
              className="flex items-center gap-3 px-10 py-4 bg-[#0AC4E0] hover:bg-[#09b3cc] text-white rounded-2xl text-[13px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#0AC4E0]/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <Save size={20} />
              {loading ? "SINKRONISASI..." : "PUBLIKASI NON-AKADEMIK"}
            </button>
          </footer>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </PageWrapper>
  );
}

export default CreateAssessmentNonAkademik;