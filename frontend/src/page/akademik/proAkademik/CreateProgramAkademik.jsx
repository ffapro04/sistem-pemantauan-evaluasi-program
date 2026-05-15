/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { jsPDF } from "jspdf";
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
} from "lucide-react";

// PEMANGGILAN CUSTOM COMPONENTS
import Sidebar from "../../../components/Sidebar";
import PageWrapper from "../../../components/PageWrapper";
import Button from "../../../components/Button";
import Card from "../../../components/Card";
import Input from "../../../components/Input";
import Label from "../../../components/Label";
import Dropdown from "../../../components/Dropdown";

export default function CreateProgramAkademik() {
  const navigate = useNavigate();

  // --- 1. STATE DATA MASTER (BACKEND) ---
  const [sekolahOptions, setSekolahOptions] = useState([]);
  const [aoOptions, setAoOptions] = useState([]);
  const [hoOptions, setHoOptions] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  // --- 2. STATE FORM UTAMA ---
  const [formData, setFormData] = useState({
    namaProgram: "",
    nomorMou: "",
    hargaVendor: "",
    kpi: "",
    tahun: new Date().getFullYear().toString(),
    selectedSekolah: null,
    selectedHO: null,
    selectedAOs: [],
    selectedVendors: [],
    fileFinal: null,
    fileName: "",
  });

  // --- 3. STATE WORKFLOW ---
  const [fases, setFases] = useState([
    {
      nama_fase: "Fase 1: Inisiasi",
      pembayaran: [
        { nama: "Invoice Termin 1", tipe: "upload" },
        { nama: "Kwitansi Pembayaran", tipe: "upload" },
      ],
      kegiatans: [
        { nama_kegiatans: "", deskripsi: "", persyaratan: [{ nama: "" }] },
      ],
    },
  ]);

  // ─── FETCH DATA MASTER DARI BACKEND ───
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const [resSek, resAo, resHo, resVen] = await Promise.all([
          fetch("http://localhost:3000/sekolah", { headers }),
          fetch("http://localhost:3000/users/ao", { headers }),
          fetch("http://localhost:3000/users/ho", { headers }),
          fetch("http://localhost:3000/vendor", { headers }),
        ]);
        const dSek = await resSek.json();
        const dAo = await resAo.json();
        const dHo = await resHo.json();
        const dVen = await resVen.json();

        setSekolahOptions(
          (dSek.data || dSek).map((s) => ({
            value: s.id_sekolah,
            label: s.nama_sekolah,
          })),
        );
        setAoOptions(
          (dAo.data || dAo).map((a) => ({ value: a.id_user, label: a.nama })),
        );
        setHoOptions(
          (dHo.data || dHo).map((h) => ({ value: h.id_user, label: h.nama })),
        );
        setVendorOptions(
          (dVen.data || dVen).map((v) => ({
            value: v.id_vendor,
            label: v.nama_vendor,
          })),
        );
      } catch (err) {
        toast.error("Gagal sinkronisasi data master");
      }
    };
    fetchData();
  }, []);

  // ─── VALIDASI KETAT (STRICT VALIDATION) ───
  const validateForm = () => {
    if (!formData.namaProgram.trim())
      return toast.error("Nama Program wajib diisi");
    if (!formData.selectedSekolah) return toast.error("Pilih Sekolah Sasaran");
    if (!formData.selectedHO) return toast.error("Pilih PIC Head Office");
    if (formData.selectedAOs.length === 0)
      return toast.error("Pilih minimal satu Area Officer (AO)");
    if (formData.selectedVendors.length === 0)
      return toast.error("Pilih minimal satu Vendor");
    if (!formData.fileFinal)
      return toast.error("Dokumen MOU wajib diunggah/dikonversi ke PDF");

    // Validasi Fase & Kegiatan
    for (let i = 0; i < fases.length; i++) {
      if (!fases[i].nama_fase.trim())
        return toast.error(`Nama Fase ke-${i + 1} kosong`);
      for (let j = 0; j < fases[i].kegiatans.length; j++) {
        if (!fases[i].kegiatans[j].nama_kegiatans.trim())
          return toast.error(`Nama kegiatan di ${fases[i].nama_fase} kosong`);
        if (fases[i].kegiatans[j].persyaratan.some((p) => !p.nama.trim()))
          return toast.error(
            `Terdapat syarat kosong di kegiatan ${fases[i].kegiatans[j].nama_kegiatans}`,
          );
      }
    }
    return true;
  };

  // ─── LOGIKA MULTI-SELECT ───
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
    setFormData({
      ...formData,
      [key]: formData[key].filter((item) => item.value !== val),
    });
  };

  // ─── UNIVERSAL CONVERTER (IMAGE, WORD, EXCEL) ───
  const handleUniversalUpload = async (e, mode) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10485760)
      return toast.error("File terlalu besar! Maksimal 10MB.");

    if (mode === "pdf") {
      if (file.type !== "application/pdf")
        return toast.error("Harus file PDF!");
      setFormData({ ...formData, fileFinal: file, fileName: file.name });
      toast.success("PDF berhasil diunggah");
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
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (img.height * pdfWidth) / img.width;
            pdf.addImage(img, "JPEG", 0, 0, pdfWidth, pdfHeight);
            finalizeConversion(pdf, file.name);
          };
        };
        reader.readAsDataURL(file);
      } else if (file.name.endsWith(".docx")) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const splitText = pdf.splitTextToSize(result.value, 180);
        pdf.text(splitText, 10, 10);
        finalizeConversion(pdf, file.name);
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const data = XLSX.utils.sheet_to_txt(
          workbook.Sheets[workbook.SheetNames[0]],
        );
        const splitText = pdf.splitTextToSize(data, 180);
        pdf.text(splitText, 10, 10);
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

  // ─── WORKFLOW FUNCTIONS ───
  const addFase = () => {
    setFases([
      ...fases,
      {
        nama_fase: `Fase ${fases.length + 1}`,
        pembayaran: [{ nama: "Invoice", tipe: "upload" }],
        kegiatans: [
          { nama_kegiatans: "", deskripsi: "", persyaratan: [{ nama: "" }] },
        ],
      },
    ]);
  };

  const updateKegiatan = (fi, ki, field, val) => {
    const nf = [...fases];
    nf[fi].kegiatans[ki][field] = val;
    setFases(nf);
  };

  const saveProgram = async () => {
    if (!validateForm()) return;
    setLoading(true);
    // Simulasi POST ke API
    setTimeout(() => {
      setLoading(false);
      toast.success("Rancangan Program Berhasil Diterbitkan!");
      navigate("/ho/program/akademik");
    }, 2000);
  };

  return (
    <PageWrapper className="h-screen flex overflow-hidden !p-0 text-left bg-[#F5F5F7]">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden font-sans text-slate-800">
        {/* ══ HEADER (Glassmorphism Effect) ══ */}
        <header className="shrink-0 sticky top-0 bg-white/70 backdrop-blur-md border-b border-[#E5E5EA] px-8 py-4 flex items-center justify-between z-30 transition-all">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-[17px] font-semibold text-slate-900 tracking-tight">
              Inisiasi Program Baru
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              Batal
            </button>
            <Button
              text={loading ? "Memproses..." : "Terbitkan Program"}
              icon={
                loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )
              }
              onClick={saveProgram}
              disabled={loading}
              className="!bg-[#007AFF] hover:!bg-[#0056b3] !text-white !rounded-full !px-6 !py-2 !text-[13px] !font-medium shadow-sm border-none transition-all duration-300"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#F5F5F7]">
          <div className="max-w-[1200px] mx-auto py-10 px-8 space-y-8 pb-40">
            {/* ══ SECTION 1: MASTER INFO ══ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CARD: IDENTITAS */}
              <Card className="!p-7 !rounded-3xl border border-white/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] bg-white/80 backdrop-blur-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-[#E5E5EA] pb-4">
                  <div className="p-2.5 bg-blue-50/50 rounded-xl text-[#007AFF]">
                    <Building2 size={20} strokeWidth={2.5} />
                  </div>
                  <h2 className="text-[15px] font-semibold text-slate-800 tracking-tight">
                    Identitas Program
                  </h2>
                </div>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label
                      text="Nama Lengkap Program"
                      className="!text-xs font-medium text-slate-500"
                    />
                    <Input
                      value={formData.namaProgram}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          namaProgram: e.target.value,
                        })
                      }
                      placeholder="Contoh: Digitalisasi Kurikulum Nasional"
                      className="!rounded-xl !bg-[#F2F2F7] focus:!bg-white focus:!ring-2 focus:!ring-[#007AFF]/20 border-none !py-3.5 !px-4 transition-all duration-300"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        text="Target Sekolah Sasaran"
                        className="!text-xs font-medium text-slate-500"
                      />
                      <Dropdown
                        options={sekolahOptions}
                        placeholder="Pilih Sekolah"
                        onSelect={(val) =>
                          setFormData({ ...formData, selectedSekolah: val })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        text="Tahun Anggaran"
                        className="!text-xs font-medium text-slate-500"
                      />
                      <Input
                        value={formData.tahun}
                        onChange={(e) =>
                          setFormData({ ...formData, tahun: e.target.value })
                        }
                        className="!rounded-xl !bg-[#F2F2F7] focus:!bg-white focus:!ring-2 focus:!ring-[#007AFF]/20 border-none !py-3.5 !px-4 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 text-left">
                    <Label
                      text="Target KPI Utama"
                      className="!text-xs font-medium text-slate-500"
                    />
                    <Input
                      value={formData.kpi}
                      onChange={(e) =>
                        setFormData({ ...formData, kpi: e.target.value })
                      }
                      placeholder="Contoh: Implementasi 100% di 10 Sekolah"
                      className="!rounded-xl !bg-[#F2F2F7] focus:!bg-white focus:!ring-2 focus:!ring-[#007AFF]/20 border-none !py-3.5 !px-4 transition-all"
                    />
                  </div>
                </div>
              </Card>

              {/* CARD: LEGALITAS & UPLOAD */}
              <Card className="!p-7 !rounded-3xl border border-white/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] bg-white/80 backdrop-blur-sm space-y-6">
                <div className="flex items-center justify-between border-b border-[#E5E5EA] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-orange-50/50 rounded-xl text-orange-500">
                      <FileText size={20} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-[15px] font-semibold text-slate-800 tracking-tight">
                      Legalitas MOU
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[11px] font-medium tracking-wide">
                    <Sparkles size={12} /> Auto-PDF
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 text-left">
                    <Label
                      text="Nomor MOU Fisik"
                      className="!text-xs font-medium text-slate-500"
                    />
                    <Input
                      value={formData.nomorMou}
                      onChange={(e) =>
                        setFormData({ ...formData, nomorMou: e.target.value })
                      }
                      placeholder="088/MOU/..."
                      className="!rounded-xl !bg-[#F2F2F7] focus:!bg-white focus:!ring-2 focus:!ring-[#007AFF]/20 border-none !py-3.5 !px-4 transition-all"
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <Label
                      text="Anggaran Vendor"
                      className="!text-xs font-medium text-slate-500"
                    />
                    <div className="relative">
                      <DollarSign
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <Input
                        type="number"
                        value={formData.hargaVendor}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hargaVendor: e.target.value,
                          })
                        }
                        className="!pl-11 !rounded-xl !bg-[#F2F2F7] focus:!bg-white focus:!ring-2 focus:!ring-[#007AFF]/20 border-none !py-3.5 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#E5E5EA]">
                  <div className="space-y-2 text-left">
                    <Label
                      text="Upload PDF Resmi"
                      className="!text-xs font-medium text-slate-500"
                    />
                    <label
                      className={`flex flex-col items-center justify-center h-[90px] border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
                        formData.fileName && !isConverting
                          ? "bg-blue-50/50 border-[#007AFF]/40"
                          : "bg-[#F2F2F7] border-slate-300/50 hover:bg-slate-200/50"
                      }`}
                    >
                      <FileUp size={20} className="text-[#007AFF] mb-1.5" />
                      <span className="text-[11px] font-medium text-slate-600 text-center px-2 truncate w-full">
                        {formData.fileName && !isConverting
                          ? formData.fileName
                          : "Pilih File PDF"}
                      </span>
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => handleUniversalUpload(e, "pdf")}
                      />
                    </label>
                  </div>
                  <div className="space-y-2 text-left">
                    <Label
                      text="Konversi Otomatis (Img/Word/Xls)"
                      className="!text-xs font-medium text-purple-600/80"
                    />
                    <label className="flex flex-col items-center justify-center h-[90px] border-2 border-dashed border-purple-200/50 bg-purple-50/30 rounded-2xl cursor-pointer hover:bg-purple-50/60 transition-all duration-300 text-center px-2">
                      {isConverting ? (
                        <Loader2
                          size={20}
                          className="animate-spin text-purple-500 mb-1.5"
                        />
                      ) : (
                        <FileBox size={20} className="text-purple-400 mb-1.5" />
                      )}
                      <p className="text-[11px] font-medium text-purple-600">
                        {isConverting ? "Mengonversi..." : "Unggah & Konversi"}
                      </p>
                      <input
                        type="file"
                        accept="image/*, .docx, .xlsx, .xls"
                        className="hidden"
                        onChange={(e) => handleUniversalUpload(e, "convert")}
                      />
                    </label>
                  </div>
                </div>
              </Card>

              {/* CARD: OTORITAS PERSONEL */}
              <Card className="!p-7 !rounded-3xl border border-white/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] bg-white/80 backdrop-blur-sm lg:col-span-2 space-y-6">
                <div className="flex items-center gap-3 border-b border-[#E5E5EA] pb-4">
                  <div className="p-2.5 bg-green-50/50 rounded-xl text-green-600">
                    <UserCheck size={20} strokeWidth={2.5} />
                  </div>
                  <h2 className="text-[15px] font-semibold text-slate-800 tracking-tight">
                    Otoritas Penanggung Jawab
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <Label
                      text="PIC Head Office (Pusat)"
                      className="!text-xs font-medium text-slate-500"
                    />
                    <Dropdown
                      options={hoOptions}
                      placeholder="Pilih Penanggung Jawab HO"
                      onSelect={(val) =>
                        setFormData({ ...formData, selectedHO: val })
                      }
                    />
                  </div>
                  <div className="space-y-3 text-left">
                    <Label
                      text="PIC Area Officer (Wilayah)"
                      className="!text-xs font-medium text-slate-500"
                    />
                    <Dropdown
                      options={aoOptions}
                      placeholder="Pilih AO (Bisa >1)"
                      onSelect={(val) => addMultiSelect("ao", val)}
                    />
                    <div className="flex flex-wrap gap-2 min-h-[30px] pt-1">
                      {formData.selectedAOs.map((ao) => (
                        <div
                          key={ao.value}
                          className="ios-fade-in flex items-center gap-1.5 px-3 py-1.5 bg-[#F2F2F7] text-slate-700 rounded-full text-[12px] font-medium border border-slate-200 transition-all hover:bg-slate-200"
                        >
                          <span>{ao.label}</span>
                          <X
                            size={14}
                            className="cursor-pointer text-slate-400 hover:text-red-500 transition-colors"
                            onClick={() => removeMultiSelect("ao", ao.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3 text-left">
                    <Label
                      text="Pelaksana (Vendor)"
                      className="!text-xs font-medium text-slate-500"
                    />
                    <Dropdown
                      options={vendorOptions}
                      placeholder="Pilih Vendor (Bisa >1)"
                      onSelect={(val) => addMultiSelect("vendor", val)}
                    />
                    <div className="flex flex-wrap gap-2 min-h-[30px] pt-1">
                      {formData.selectedVendors.map((v) => (
                        <div
                          key={v.value}
                          className="ios-fade-in flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-[12px] font-medium border border-purple-100 transition-all hover:bg-purple-100"
                        >
                          <span>{v.label}</span>
                          <X
                            size={14}
                            className="cursor-pointer text-purple-400 hover:text-red-500 transition-colors"
                            onClick={() => removeMultiSelect("vendor", v.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* ══ SECTION 2: WORKFLOW ══ */}
            <div className="space-y-6 pt-6 text-left">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-200/50 rounded-xl text-slate-600">
                    <Layers size={20} strokeWidth={2.5} />
                  </div>
                  <h2 className="text-[17px] font-semibold text-slate-800 tracking-tight">
                    Rancang Alur Kerja Program
                  </h2>
                </div>
                <button
                  onClick={addFase}
                  className="flex items-center gap-2 text-[13px] font-medium text-[#007AFF] bg-blue-50/50 hover:bg-blue-100/50 px-4 py-2 rounded-full transition-all duration-300"
                >
                  <Plus size={16} /> Tambah Fase Baru
                </button>
              </div>

              <div className="space-y-8">
                {fases.map((f, fi) => (
                  <Card
                    key={fi}
                    className="ios-fade-in !p-0 !rounded-3xl border border-[#E5E5EA] overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] bg-white transition-all duration-300"
                  >
                    <div className="p-5 bg-slate-50/50 border-b border-[#E5E5EA] flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#007AFF] text-white rounded-full flex items-center justify-center font-medium shadow-sm text-[15px]">
                          {fi + 1}
                        </div>
                        <div className="space-y-0.5">
                          <input
                            value={f.nama_fase}
                            onChange={(e) => {
                              const nf = [...fases];
                              nf[fi].nama_fase = e.target.value;
                              setFases(nf);
                            }}
                            className="bg-transparent border-none text-[16px] font-semibold text-slate-800 focus:ring-0 w-[300px] p-0 outline-none placeholder:text-slate-300 transition-all"
                            placeholder="Judul Fase..."
                          />
                          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                            Urutan Workflow
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setFases(fases.filter((_, i) => i !== fi))
                        }
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all p-2 rounded-full"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="p-6 space-y-8">
                      <div className="space-y-4 text-left">
                        <div className="flex items-center gap-2 text-slate-600 font-semibold text-[13px] tracking-tight">
                          <CheckSquare size={16} className="text-emerald-500" />
                          Prasyarat Aktivasi Fase
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {f.pembayaran.map((p, pi) => (
                            <div
                              key={pi}
                              className="ios-fade-in flex items-center gap-3 bg-[#F2F2F7] px-4 py-3 rounded-2xl border border-transparent focus-within:border-[#007AFF]/30 focus-within:bg-white transition-all group"
                            >
                              <FileUp
                                size={18}
                                className="text-slate-400 group-focus-within:text-[#007AFF] transition-colors"
                              />
                              <input
                                value={p.nama}
                                onChange={(e) => {
                                  const nf = [...fases];
                                  nf[fi].pembayaran[pi].nama = e.target.value;
                                  setFases(nf);
                                }}
                                className="bg-transparent border-none text-[13px] font-medium text-slate-700 focus:ring-0 p-0 w-full outline-none placeholder:text-slate-400"
                                placeholder="Nama Dokumen Syarat..."
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div className="flex items-center justify-between border-b border-[#E5E5EA] pb-3">
                          <h4 className="text-[13px] font-semibold text-slate-600 tracking-tight">
                            Detail Pengerjaan (Unit Kegiatan)
                          </h4>
                          <button
                            onClick={() => {
                              const nf = [...fases];
                              nf[fi].kegiatans.push({
                                nama_kegiatans: "",
                                deskripsi: "",
                                persyaratan: [{ nama: "" }],
                              });
                              setFases(nf);
                            }}
                            className="text-[12px] font-medium text-[#007AFF] hover:bg-blue-50 px-3 py-1.5 rounded-full transition-all"
                          >
                            + Tambah Unit
                          </button>
                        </div>

                        {f.kegiatans.map((k, ki) => (
                          <div
                            key={ki}
                            className="ios-fade-in relative p-5 bg-[#F9F9FB] rounded-3xl border border-[#E5E5EA] group hover:bg-white transition-all duration-300"
                          >
                            <div className="grid grid-cols-2 gap-6 mb-5">
                              <div className="space-y-2 text-left">
                                <Label
                                  text="Unit Kegiatan"
                                  className="!text-[12px] font-medium text-slate-500"
                                />
                                <Input
                                  value={k.nama_kegiatans}
                                  onChange={(e) =>
                                    updateKegiatan(
                                      fi,
                                      ki,
                                      "nama_kegiatans",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Tulis rincian pengerjaan..."
                                  className="!rounded-xl !bg-white border !border-[#E5E5EA] focus:!border-[#007AFF]/40 focus:!ring-4 focus:!ring-[#007AFF]/10 !py-3 !px-4 text-[13px] font-medium transition-all"
                                />
                              </div>
                              <div className="space-y-2 text-left">
                                <Label
                                  text="Target Output"
                                  className="!text-[12px] font-medium text-slate-500"
                                />
                                <Input
                                  value={k.deskripsi}
                                  onChange={(e) =>
                                    updateKegiatan(
                                      fi,
                                      ki,
                                      "deskripsi",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Hasil akhir yang diharapkan..."
                                  className="!rounded-xl !bg-white border !border-[#E5E5EA] focus:!border-[#007AFF]/40 focus:!ring-4 focus:!ring-[#007AFF]/10 !py-3 !px-4 text-[13px] font-medium transition-all"
                                />
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 items-center">
                              <div className="text-[12px] font-medium text-slate-400 mr-1">
                                Syarat Bukti:
                              </div>
                              {k.persyaratan.map((ps, pi) => (
                                <div
                                  key={pi}
                                  className="ios-fade-in flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-[#E5E5EA] shadow-sm transition-all focus-within:border-[#007AFF]/40"
                                >
                                  <Hash size={12} className="text-slate-400" />
                                  <input
                                    value={ps.nama}
                                    onChange={(e) => {
                                      const nf = [...fases];
                                      nf[fi].kegiatans[ki].persyaratan[
                                        pi
                                      ].nama = e.target.value;
                                      setFases(nf);
                                    }}
                                    className="text-[12px] font-medium text-slate-700 bg-transparent border-none outline-none focus:ring-0 p-0 w-32"
                                    placeholder="Nama Berkas..."
                                  />
                                  <button
                                    onClick={() => {
                                      const nf = [...fases];
                                      nf[fi].kegiatans[ki].persyaratan.splice(
                                        pi,
                                        1,
                                      );
                                      setFases(nf);
                                    }}
                                  >
                                    <X
                                      size={14}
                                      className="text-slate-300 hover:text-red-500 transition-colors"
                                    />
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={() => {
                                  const nf = [...fases];
                                  nf[fi].kegiatans[ki].persyaratan.push({
                                    nama: "",
                                  });
                                  setFases(nf);
                                }}
                                className="w-8 h-8 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            <button
                              onClick={() => {
                                const nf = [...fases];
                                nf[fi].kegiatans.splice(ki, 1);
                                setFases(nf);
                              }}
                              className="absolute -top-3 -right-3 w-8 h-8 bg-white text-red-500 rounded-full flex items-center justify-center shadow-sm border border-[#E5E5EA] opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* FINAL BANNER */}
            <div className="bg-white p-10 rounded-3xl shadow-[0_4px_30px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col items-center gap-5 text-center transition-all duration-500 hover:shadow-[0_8px_40px_-4px_rgba(0,0,0,0.08)]">
              <div className="p-4 bg-blue-50 rounded-2xl text-[#007AFF] mb-2">
                <ShieldCheck size={36} strokeWidth={2} />
              </div>
              <div className="space-y-2">
                <h3 className="text-[20px] font-semibold text-slate-800 tracking-tight">
                  Terbitkan Blueprint Program
                </h3>
                <p className="text-[13px] text-slate-500 max-w-xl mx-auto font-medium leading-relaxed">
                  Seluruh alur kerja akan disinkronisasikan ke sistem
                  pemantauan. Pastikan data sudah akurat sebelum melakukan
                  publikasi.
                </p>
              </div>
              <button
                onClick={saveProgram}
                disabled={loading}
                className="mt-4 px-10 py-3.5 bg-[#007AFF] text-white rounded-full text-[14px] font-medium shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Terbitkan Sekarang"
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* --- INJECT CSS ANIMATIONS & SCROLLBAR --- */}
      <style>{`
        /* Mac-like clean scrollbar */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: #D1D1D6; 
          border-radius: 10px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #AEAEB2; }

        /* Smooth iOS style Fade-in animation */
        .ios-fade-in {
          animation: iosFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }

        @keyframes iosFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.99);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </PageWrapper>
  );
}
