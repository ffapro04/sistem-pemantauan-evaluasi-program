/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { jsPDF } from "jspdf";
import { jwtDecode } from "jwt-decode";
import * as mammoth from "mammoth";
import * as XLSX from "xlsx";
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  FileText,
  Building2,
  Layers,
  FileUp,
  X,
  CheckSquare,
  DollarSign,
  UserCheck,
  ShieldCheck,
  Sparkles,
  Loader2,
  Hash,
  FileBox,
  Target,
  Briefcase,
  ChevronRight
} from "lucide-react";

// PEMANGGILAN CUSTOM COMPONENTS
import Sidebar from "../../../components/Sidebar";
import PageWrapper from "../../../components/PageWrapper";
import Button from "../../../components/Button";
import Card from "../../../components/Card";
import Input from "../../../components/Input";
import Label from "../../../components/Label";
import Dropdown from "../../../components/Dropdown";

export default function CreateProgramnonAkademik() {
  const navigate = useNavigate();

  // =========================================================================
  // 1. STATE MANAGEMENT
  // =========================================================================
  const [sekolahOptions, setSekolahOptions] = useState([]);
  const [aoOptions, setAoOptions] = useState([]);
  const [hoOptions, setHoOptions] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const [formData, setFormData] = useState({
    namaProgram: "",
    nomorMou: "",
    hargaVendor: "",
    kpi: "",
    deskripsi: "",
    tahun: new Date().getFullYear().toString(),
    selectedSekolah: null,
    selectedHO: null,
    selectedAOs: [],
    selectedVendors: [],
    fileFinal: null,
    fileName: "",
  });

  const [fases, setFases] = useState([
    {
      nama_fase: "Fase 1: Persiapan & Inisiasi",
      pembayaran: [
        { nama: "Invoice DP / Termin 1", tipe: "upload" },
        { nama: "Kwitansi Pembayaran Resmi", tipe: "upload" },
      ],
      kegiatans: [
        {
          nama_kegiatans: "",
          deskripsi: "",
          persyaratan: [{ nama: "" }]
        },
      ],
    },
  ]);

  // =========================================================================
  // 2. DATA FETCHING
  // =========================================================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [resSek, resAo, resHo, resVen] = await Promise.all([
          fetch("http://localhost:3000/sekolah", { headers }),
          fetch("http://localhost:3000/users/ao", { headers }),
          fetch("http://localhost:3000/users/ho", { headers }),
          fetch("http://localhost:3000/vendor?kategori=NON_AKADEMIK", { headers }),
        ]);

        const dSek = await resSek.json();
        const dAo = await resAo.json();
        const dHo = await resHo.json();
        const dVen = await resVen.json();

        setSekolahOptions((dSek.data || dSek).map(s => ({ value: s.id_sekolah, label: s.nama_sekolah })));
        setAoOptions((dAo.data || dAo).map(a => ({ value: a.id_user, label: a.nama })));
        setHoOptions((dHo.data || dHo).map(h => ({ value: h.id_user, label: h.nama })));
        setVendorOptions((dVen.data || dVen).map(v => ({ value: v.id_vendor, label: v.nama_vendor })));
      } catch (err) {
        toast.error("Gagal sinkronisasi data master");
      }
    };
    fetchData();
  }, []);

  // =========================================================================
  // 3. LOGIKA FORM & CONVERTER
  // =========================================================================
  const addMultiSelect = (type, val) => {
    const key = type === "ao" ? "selectedAOs" : "selectedVendors";
    const options = type === "ao" ? aoOptions : vendorOptions;
    const selectedItem = options.find((opt) => opt.value === val);

    if (selectedItem && !formData[key].find((item) => item.value === val)) {
      setFormData({ ...formData, [key]: [...formData[key], selectedItem] });
    }
  };

  const removeMultiSelect = (type, val) => {
    const key = type === "ao" ? "selectedAOs" : "selectedVendors";
    setFormData({ ...formData, [key]: formData[key].filter((item) => item.value !== val) });
  };

  const handleUniversalUpload = async (e, mode) => {
    const file = e.target.files[0];
    if (!file) return;
    if (mode === "pdf") {
      setFormData({ ...formData, fileFinal: file, fileName: file.name });
      return;
    }

    setIsConverting(true);
    const pdf = new jsPDF();
    try {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target.result;
          img.onload = () => {
            pdf.addImage(img, "JPEG", 0, 0, 210, (img.height * 210) / img.width);
            finalizeConversion(pdf, file.name);
          };
        };
        reader.readAsDataURL(file);
      } else if (file.name.endsWith(".docx")) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        pdf.text(pdf.splitTextToSize(result.value, 180), 10, 10);
        finalizeConversion(pdf, file.name);
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const data = XLSX.utils.sheet_to_txt(workbook.Sheets[workbook.SheetNames[0]]);
        pdf.text(pdf.splitTextToSize(data, 180), 10, 10);
        finalizeConversion(pdf, file.name);
      }
    } catch (err) {
      toast.error("Gagal mengonversi file");
      setIsConverting(false);
    }
  };

  const finalizeConversion = (pdfInstance, originalName) => {
    const blob = pdfInstance.output("blob");
    const newName = originalName.split(".")[0] + "_converted.pdf";
    setFormData({
      ...formData,
      fileFinal: new File([blob], newName, { type: "application/pdf" }),
      fileName: newName,
    });
    setIsConverting(false);
    toast.success("File berhasil dikonversi ke PDF!");
  };

  // =========================================================================
  // 4. NESTED WORKFLOW HANDLERS
  // =========================================================================
  const addFase = () => {
    setFases([...fases, {
      nama_fase: `Fase ${fases.length + 1}`,
      pembayaran: [{ nama: "Dokumen Syarat", tipe: "upload" }],
      kegiatans: [{ nama_kegiatans: "", deskripsi: "", persyaratan: [{ nama: "" }] }],
    }]);
  };

  const updateFaseName = (fi, val) => {
    const nf = [...fases];
    nf[fi].nama_fase = val;
    setFases(nf);
  };

  const updateKegiatanField = (fi, ki, field, val) => {
    const nf = [...fases];
    nf[fi].kegiatans[ki][field] = val;
    setFases(nf);
  };

  const addPersyaratan = (fi, ki) => {
    const nf = [...fases];
    nf[fi].kegiatans[ki].persyaratan.push({ nama: "" });
    setFases(nf);
  };

  const saveProgram = async () => {
    if (!formData.namaProgram.trim()) return toast.error("Nama Program wajib diisi");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const submission = new FormData();
      submission.append("nama_program", formData.namaProgram);
      submission.append("deskripsi", formData.deskripsi);
      submission.append("kpi", formData.kpi);
      submission.append("tahun", formData.tahun);
      submission.append("id_sekolah", formData.selectedSekolah);
      submission.append("id_ho", formData.selectedHO);
      submission.append("kategori", "NON_AKADEMIK");
      submission.append("file_mou", formData.fileFinal);
      submission.append("fases", JSON.stringify(fases));

      const res = await fetch("http://localhost:3000/program", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: submission
      });

      if (res.ok) {
        toast.success("Program Berhasil Diterbitkan!");
        navigate("/ho/program/non-akademik");
      }
    } catch (err) {
      toast.error("Kesalahan server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper className="h-screen flex overflow-hidden !p-0 text-left bg-[#F5F5F7]">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden font-sans text-slate-800">

        {/* ══ PROFESSIONAL HEADER ══ */}
        <header className="shrink-0 sticky top-0 bg-white/80 backdrop-blur-md border-b border-[#E5E5EA] px-10 py-5 flex items-center justify-between z-30 leading-none">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-3 bg-[#0AC4E0] rounded-full" />
              <Label 
                text="Sistem Pemantauan dan Evaluasi Program"
                className="!text-[10px] !font-black !uppercase !tracking-[0.3em] !text-slate-400 !mb-0"
              />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter">
              Inisiasi Program <span className="text-[#0AC4E0]">Non-Akademik</span>
            </h1>
          </div>

          <div className="flex gap-4">
            <Button
              text="Batal"
              variant="outline"
              onClick={() => navigate(-1)}
              className="!rounded-full !px-6 !py-2.5 !text-[13px] !font-bold border-slate-200 text-slate-400 hover:!bg-slate-50"
            />
            <Button
              text={loading ? "Memproses..." : "Terbitkan Program"}
              icon={loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              onClick={saveProgram}
              disabled={loading}
              className="!bg-slate-900 hover:!bg-[#0AC4E0] !text-white !rounded-full !px-8 !py-2.5 !text-[13px] !font-bold shadow-xl transition-all"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar bg-[#F5F5F7]">
          <div className="max-w-[1200px] mx-auto py-10 px-10 space-y-8 pb-40">

            {/* ══ SECTION 1: MASTER INFO ══ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* CARD: IDENTITAS */}
              <Card className="!p-8 !rounded-[2.5rem] border border-white bg-white/80 backdrop-blur-sm space-y-6 shadow-sm">
                <div className="flex items-center gap-4 border-b border-slate-50 pb-5">
                  <div className="p-3 bg-cyan-50 text-[#0AC4E0] rounded-2xl"><Building2 size={22} /></div>
                  <h2 className="text-[16px] font-bold text-slate-800">Identitas Utama</h2>
                </div>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label text="Nama Lengkap Program" className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest" />
                    <Input value={formData.namaProgram} onChange={(e) => setFormData({ ...formData, namaProgram: e.target.value })} placeholder="Contoh: Digitalisasi Perpustakaan" className="!rounded-2xl !bg-[#F2F2F7] border-none !py-4" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label text="Sekolah Sasaran" className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest" />
                      <Dropdown options={sekolahOptions} placeholder="Pilih Sekolah" onSelect={(v) => setFormData({ ...formData, selectedSekolah: v })} />
                    </div>
                    <div className="space-y-2">
                      <Label text="Tahun Anggaran" className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest" />
                      <Input value={formData.tahun} onChange={(e) => setFormData({ ...formData, tahun: e.target.value })} className="!rounded-2xl !bg-[#F2F2F7] border-none !py-4" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label text="Target KPI / Output" className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest" />
                    <Input value={formData.kpi} onChange={(e) => setFormData({ ...formData, kpi: e.target.value })} placeholder="Target pencapaian..." className="!rounded-2xl !bg-[#F2F2F7] border-none !py-4" />
                  </div>
                </div>
              </Card>

              {/* CARD: LEGALITAS */}
              <Card className="!p-8 !rounded-[2.5rem] border border-white bg-white/80 backdrop-blur-sm space-y-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-50 pb-5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl"><FileText size={22} /></div>
                    <h2 className="text-[16px] font-bold text-slate-800">Legalitas & Biaya</h2>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label text="Nomor MOU Fisik" className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest" />
                    <Input value={formData.nomorMou} onChange={(e) => setFormData({ ...formData, nomorMou: e.target.value })} placeholder="000/MOU/..." className="!rounded-2xl !bg-[#F2F2F7] border-none !py-4" />
                  </div>
                  <div className="space-y-2">
                    <Label text="Anggaran Vendor" className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest" />
                    <div className="relative">
                      <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Input type="number" value={formData.hargaVendor} onChange={(e) => setFormData({ ...formData, hargaVendor: e.target.value })} className="!pl-11 !rounded-2xl !bg-[#F2F2F7] border-none !py-4" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <label className="flex flex-col items-center justify-center h-[100px] border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer bg-[#F2F2F7] hover:bg-slate-200 transition-all">
                    <FileUp size={24} className="text-[#0AC4E0] mb-2" />
                    <span className="text-[11px] font-bold text-slate-500 truncate px-2">{formData.fileName || "Upload PDF MOU"}</span>
                    <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleUniversalUpload(e, "pdf")} />
                  </label>
                  <label className="flex flex-col items-center justify-center h-[100px] border-2 border-dashed border-purple-100 bg-purple-50/30 rounded-2xl cursor-pointer hover:bg-purple-50/50 transition-all">
                    {isConverting ? <Loader2 size={24} className="animate-spin text-purple-500" /> : <FileBox size={24} className="text-purple-400 mb-2" />}
                    <p className="text-[11px] font-bold text-purple-600">{isConverting ? "Proses..." : "Konversi Otomatis"}</p>
                    <input type="file" accept="image/*, .docx, .xlsx" className="hidden" onChange={(e) => handleUniversalUpload(e, "convert")} />
                  </label>
                </div>
              </Card>

              {/* CARD: OTORITAS */}
              <Card className="!p-8 !rounded-[2.5rem] border border-white bg-white/80 backdrop-blur-sm lg:col-span-2 space-y-6 shadow-sm">
                <div className="flex items-center gap-4 border-b border-slate-50 pb-5">
                  <div className="p-3 bg-green-50 text-green-600 rounded-2xl"><UserCheck size={22} /></div>
                  <h2 className="text-[16px] font-bold text-slate-800">Otoritas Penanggung Jawab</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <Label text="PIC Head Office" className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest" />
                    <Dropdown options={hoOptions} placeholder="Pilih PIC Pusat" onSelect={(v) => setFormData({ ...formData, selectedHO: v })} />
                  </div>
                  <div className="space-y-3">
                    <Label text="PIC Area Officer (AO)" className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest" />
                    <Dropdown options={aoOptions} placeholder="Tambah AO..." onSelect={(v) => addMultiSelect("ao", v)} />
                    <div className="flex flex-wrap gap-2">{formData.selectedAOs.map(ao => (
                      <div key={ao.value} className="flex items-center gap-2 px-4 py-2 bg-[#F2F2F7] rounded-full text-[12px] font-bold border border-slate-200">
                        {ao.label} <X size={14} className="cursor-pointer text-slate-400 hover:text-red-500" onClick={() => removeMultiSelect("ao", ao.value)} />
                      </div>
                    ))}</div>
                  </div>
                  <div className="space-y-3">
                    <Label text="Vendor Pelaksana" className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest" />
                    <Dropdown options={vendorOptions} placeholder="Tambah Vendor..." onSelect={(v) => addMultiSelect("vendor", v)} />
                    <div className="flex flex-wrap gap-2">{formData.selectedVendors.map(v => (
                      <div key={v.value} className="flex items-center gap-2 px-4 py-2 bg-cyan-50 text-[#0AC4E0] rounded-full text-[12px] font-bold border border-cyan-100">
                        {v.label} <X size={14} className="cursor-pointer hover:text-red-500" onClick={() => removeMultiSelect("vendor", v.value)} />
                      </div>
                    ))}</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* ══ SECTION 2: WORKFLOW ══ */}
            <div className="space-y-6 pt-6">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl"><Layers size={22} /></div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">Rancang Alur Kerja Program</h2>
                </div>
                <Button
                  text="Tambah Fase Baru"
                  icon={<Plus size={16} />}
                  onClick={addFase}
                  className="!rounded-full !px-6 !py-2.5 !text-[12px] !font-black !uppercase !tracking-widest !bg-white !text-[#0AC4E0] border border-[#0AC4E0]/20 hover:!bg-[#0AC4E0] hover:!text-white shadow-sm"
                />
              </div>

              <div className="space-y-8">
                {fases.map((f, fi) => (
                  <Card key={fi} className="ios-fade-in !p-0 !rounded-[2.5rem] border border-white overflow-hidden shadow-sm bg-white transition-all">
                    <div className="p-6 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#0AC4E0] text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-cyan-500/20">{fi + 1}</div>
                        <div className="space-y-1">
                          <input value={f.nama_fase} onChange={(e) => updateFaseName(fi, e.target.value)}
                            className="bg-transparent border-none text-[18px] font-black text-slate-800 focus:ring-0 w-[400px] outline-none placeholder:text-slate-300" placeholder="Judul Fase..." />
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Urutan Workflow Tahunan</p>
                        </div>
                      </div>
                      <button onClick={() => removeFase(fi)} className="text-slate-300 hover:text-red-500 p-3 hover:bg-red-50 rounded-full transition-all"><Trash2 size={20} /></button>
                    </div>

                    <div className="p-8 space-y-10">
                      <div className="space-y-5">
                        <div className="flex items-center gap-3 text-slate-500 font-bold text-[13px] uppercase tracking-widest">
                          <CheckSquare size={18} className="text-emerald-500" /> Prasyarat Aktivasi Fase
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                          {f.pembayaran.map((p, pi) => (
                            <div key={pi} className="flex items-center gap-4 bg-slate-50 px-5 py-4 rounded-2xl border border-transparent focus-within:border-[#0AC4E0]/30 focus-within:bg-white transition-all">
                              <FileUp size={20} className="text-slate-400" />
                              <input value={p.nama} onChange={(e) => { const nf = [...fases]; nf[fi].pembayaran[pi].nama = e.target.value; setFases(nf); }}
                                className="bg-transparent border-none text-[13px] font-bold text-slate-700 focus:ring-0 w-full outline-none" placeholder="Nama Dokumen Syarat..." />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                          <h4 className="text-[13px] font-black text-slate-400 uppercase tracking-widest">Detail Pengerjaan (Unit Kegiatan)</h4>
                          <button onClick={() => addKegiatan(fi)} className="text-[12px] font-black text-[#0AC4E0] hover:underline tracking-tight">+ Tambah Unit</button>
                        </div>

                        {f.kegiatans.map((k, ki) => (
                          <div key={ki} className="relative p-6 bg-[#F9F9FB] rounded-[2rem] border border-slate-100 group hover:bg-white transition-all shadow-sm">
                            <div className="grid grid-cols-2 gap-8 mb-6">
                              <div className="space-y-2">
                                <Label text="Deskripsi Kegiatan" className="!text-[11px] !font-black !text-slate-400 !uppercase !tracking-widest" />
                                <Input value={k.nama_kegiatans} onChange={(e) => updateKegiatanField(fi, ki, "nama_kegiatans", e.target.value)}
                                  placeholder="Rincian kegiatan..." className="!rounded-2xl !bg-white border focus:!border-[#0AC4E0]/40 !py-4" />
                              </div>
                              <div className="space-y-2">
                                <Label text="Target Output" className="!text-[11px] !font-black !text-slate-400 !uppercase !tracking-widest" />
                                <Input value={k.deskripsi} onChange={(e) => updateKegiatanField(fi, ki, "deskripsi", e.target.value)}
                                  placeholder="Hasil akhir..." className="!rounded-2xl !bg-white border focus:!border-[#0AC4E0]/40 !py-4" />
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-3 items-center">
                              <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest mr-2">Syarat Bukti:</span>
                              {k.persyaratan.map((ps, pi) => (
                                <div key={pi} className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm transition-all focus-within:border-[#0AC4E0]/40">
                                  <Hash size={12} className="text-slate-400" />
                                  <input value={ps.nama} onChange={(e) => { const nf = [...fases]; nf[fi].kegiatans[ki].persyaratan[pi].nama = e.target.value; setFases(nf); }}
                                    className="text-[12px] font-bold text-slate-700 bg-transparent border-none outline-none focus:ring-0 p-0 w-32" placeholder="Nama Berkas..." />
                                  <X size={14} className="text-slate-300 cursor-pointer hover:text-red-500 transition-colors" onClick={() => { const nf = [...fases]; nf[fi].kegiatans[ki].persyaratan.splice(pi, 1); setFases(nf); }} />
                                </div>
                              ))}
                              <button onClick={() => addPersyaratan(fi, ki)} className="w-9 h-9 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all"><Plus size={16} /></button>
                            </div>

                            <button onClick={() => { const nf = [...fases]; nf[fi].kegiatans.splice(ki, 1); setFases(nf); }}
                              className="absolute -top-3 -right-3 w-10 h-10 bg-white text-red-500 rounded-full flex items-center justify-center shadow-xl border border-slate-100 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"><X size={20} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* FINAL BANNER */}
            <div className="bg-slate-900 p-12 rounded-[3.5rem] shadow-2xl border border-white/10 flex flex-col items-center gap-6 text-center transition-all duration-500">
              <div className="p-5 bg-white/5 text-[#0AC4E0] rounded-[2rem] border border-white/10 shadow-inner"><ShieldCheck size={44} strokeWidth={2} /></div>
              <div className="space-y-2">
                <h3 className="text-[24px] font-black text-white tracking-tighter uppercase italic">Terbitkan Blueprint Program</h3>
                <p className="text-[13px] text-white/40 max-w-xl mx-auto font-medium leading-relaxed uppercase tracking-widest">Seluruh alur kerja akan disinkronisasikan ke sistem pemantauan pusat YPA-MDR.</p>
              </div>
              <Button 
                text={loading ? "Sinkronisasi..." : "Terbitkan Sekarang"}
                icon={loading ? <Loader2 size={18} className="animate-spin" /> : <ChevronRight size={18} />}
                onClick={saveProgram} 
                disabled={loading}
                className="!bg-[#0AC4E0] !text-white !rounded-full !px-12 !py-5 !text-[14px] !font-black !uppercase !tracking-[0.25em] shadow-2xl shadow-cyan-500/30 hover:scale-[1.02] active:scale-95 transition-all mt-4"
              />
            </div>

          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .ios-fade-in { animation: iosFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        @keyframes iosFadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </PageWrapper>
  );
}