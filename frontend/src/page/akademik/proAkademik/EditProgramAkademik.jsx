/* eslint-disable no-undef */
import Sidebar from "../../../components/Sidebar";
import Button from "../../../components/Button";
import Label from "../../../components/Label";
import Input from "../../../components/Input";
import PageWrapper from "../../../components/PageWrapper";
import { toast } from "react-toastify";

import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import {
  ArrowLeft,
  Save,
  Upload,
  ChevronDown,
  Target,
  Info,
  FileText,
  Edit3,
  Building2,
  Calendar,
  Sparkles,
  MapPin,
  Briefcase
} from "lucide-react";

function EditProgramAkademik() {
  const navigate = useNavigate();
  const { id } = useParams();

  // State List Data
  const [sekolahList, setSekolahList] = useState([]);
  const [vendorList, setVendorList] = useState([]);
  const [aoList, setAoList] = useState([]);

  // Form State
  const [namaHO, setNamaHO] = useState("");
  const [wilayahInfo, setWilayahInfo] = useState({ kota: "", provinsi: "" });
  const [selectedSekolah, setSelectedSekolah] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedAO, setSelectedAO] = useState("");
  const [namaProgram, setNamaProgram] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [tahun, setTahun] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [statusProgram, setStatusProgram] = useState("Draft");
  const [fileMou, setFileMou] = useState(null);
  const [existingFileName, setExistingFileName] = useState("");

  // UI State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openDrop, setOpenDrop] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        if (token) {
          const decoded = jwtDecode(token);
          setNamaHO(decoded.nama || "Head Office");
        }

        const [resSekolah, resAo, resVendor, resDetail] = await Promise.all([
          fetch("http://localhost:3000/sekolah", { headers }),
          fetch("http://localhost:3000/users/ao", { headers }),
          fetch("http://localhost:3000/vendor", { headers }),
          fetch(`http://localhost:3000/program/${id}`, { headers }),
        ]);

        const dataSekolah = await resSekolah.json();
        const detail = await resDetail.json();

        setSekolahList(Array.isArray(dataSekolah) ? dataSekolah : []);
        setAoList(Array.isArray(await resAo.json()) ? await resAo.json() : []);
        setVendorList(Array.isArray(await resVendor.json()) ? await resVendor.json() : []);

        if (detail) {
          setNamaProgram(detail.nama_program || "");
          setDeskripsi(detail.deskripsi || "");
          setSelectedSekolah(detail.id_sekolah || "");
          setSelectedAO(detail.id_pengawas || "");
          setSelectedVendor(detail.id_vendor || "");
          setTahun(detail.tahun || "");
          if (detail.tanggal_mulai) setTanggalMulai(detail.tanggal_mulai.split("T")[0]);
          setStatusProgram(detail.status_program || "Draft");
          setExistingFileName(detail.file_mou_nama || "");

          const sklh = dataSekolah.find((s) => s.id_sekolah === detail.id_sekolah);
          if (sklh)
            setWilayahInfo({
              kota: sklh.wilayah?.nama_wilayah,
              provinsi: sklh.wilayah?.parent?.nama_wilayah,
            });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [id]);

  const handleSekolahSelect = (id_sekolah) => {
    setSelectedSekolah(id_sekolah);
    setOpenDrop(null);
    const s = sekolahList.find((i) => i.id_sekolah === id_sekolah);
    if (s)
      setWilayahInfo({
        kota: s.wilayah?.nama_wilayah,
        provinsi: s.wilayah?.parent?.nama_wilayah,
      });
  };

  const saveProgram = async () => {
    if (!selectedSekolah || !selectedAO || !namaProgram.trim())
      return toast.error("Lengkapi data wajib!");

    setSaving(true);
    const formData = new FormData();
    formData.append("nama_program", namaProgram);
    formData.append("deskripsi", deskripsi);
    formData.append("id_sekolah", selectedSekolah);
    formData.append("id_pengawas", selectedAO);
    if (selectedVendor) formData.append("id_vendor", selectedVendor);
    formData.append("tahun", tahun);
    if (tanggalMulai) formData.append("tanggal_mulai", tanggalMulai);
    formData.append("status_program", statusProgram);
    if (fileMou) formData.append("file_mou", fileMou);

    try {
      const res = await fetch(`http://localhost:3000/program/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });
      if (res.ok) {
        toast.success("Update Berhasil!");
        navigate(`/ho/program/akademik/detail/${id}`);
      } else {
        const b = await res.json();
        toast.error(b.message);
      }
    } catch (err) {
      toast.error("Gagal update data");
    } finally {
      setSaving(false);
    }
  };

  const DropdownTrigger = ({ type, placeholder, value, icon }) => (
    <button
      type="button"
      onClick={() => setOpenDrop(openDrop === type ? null : type)}
      className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl border transition-all duration-300 ${openDrop === type
        ? "bg-white border-[#0AC4E0] shadow-lg shadow-[#0AC4E0]/10 ring-4 ring-[#0AC4E0]/5"
        : "bg-white border-slate-200 hover:border-slate-300"
        }`}
    >
      <div className="flex items-center gap-3 overflow-hidden text-left">
        {icon && <div className={`${openDrop === type ? "text-[#0AC4E0]" : "text-slate-400"}`}>{icon}</div>}
        <span className={`truncate text-sm font-semibold ${value ? "text-slate-800" : "text-slate-300"}`}>
          {value || placeholder}
        </span>
      </div>
      <ChevronDown size={16} className={`transition-transform duration-300 ${openDrop === type ? "rotate-180 text-[#0AC4E0]" : "text-slate-300"}`} />
    </button>
  );

  if (loading)
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-12 h-12 border-4 border-[#0AC4E0] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-300 uppercase tracking-[0.2em]">Synchronizing Data...</p>
        </div>
      </div>
    );

  return (
    <PageWrapper className="h-screen bg-[#FBFBFD] flex overflow-hidden !p-0 font-sans selection:bg-[#0AC4E0]/20 text-slate-800">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Background Gradients (Subtle) */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#0AC4E0]/5 rounded-full blur-[120px] -z-10" />

        <div className="flex-1 flex flex-col px-10 pt-10 pb-6 overflow-hidden">

          {/* iOS Style Header */}
          <header className="flex flex-row items-end justify-between mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-[#0AC4E0] rounded-lg text-white shadow-lg shadow-[#0AC4E0]/20">
                  <Sparkles size={14} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0AC4E0]">Academic Editor</span>
              </div>
              <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
                Edit <span className="text-[#0AC4E0]">Program</span>
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-slate-100/50 backdrop-blur-md p-1 rounded-2xl border border-slate-200 flex shadow-sm">
                {["Draft", "Aktif", "Selesai"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusProgram(status)}
                    className={`px-6 py-2 rounded-[0.9rem] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${statusProgram === status
                      ? "bg-white text-slate-800 shadow-sm border border-slate-200"
                      : "text-slate-400 hover:text-slate-600"
                      }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <button
                onClick={() => navigate(`/ho/program/akademik/detail/${id}`)}
                className="flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-500 rounded-2xl text-sm font-bold shadow-sm border border-slate-200 transition-all active:scale-95"
              >
                <ArrowLeft size={18} /> Kembali
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-8 pb-10">

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Section 1: Penempatan */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 text-[#0AC4E0] rounded-2xl flex items-center justify-center">
                    <Building2 size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 leading-none">Penempatan</h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">Institusi pelaksana program akademik</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label text="Sekolah" required className="!text-[9px] !font-black !text-slate-400 !uppercase !tracking-widest" />
                    <div className="relative">
                      <DropdownTrigger
                        type="sekolah"
                        placeholder="Pilih Sekolah"
                        icon={<Building2 size={16} />}
                        value={sekolahList.find((s) => s.id_sekolah === selectedSekolah)?.nama_sekolah}
                      />
                      {openDrop === "sekolah" && (
                        <div className="absolute z-50 w-full bg-white border border-slate-100 mt-3 rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in-95">
                          <div className="max-h-56 overflow-y-auto no-scrollbar">
                            {sekolahList.map((s) => (
                              <button
                                key={s.id_sekolah}
                                onClick={() => handleSekolahSelect(s.id_sekolah)}
                                className="w-full text-left px-5 py-3 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-600 hover:text-[#0AC4E0] transition-colors"
                              >
                                {s.nama_sekolah}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-300 mb-1">
                        <MapPin size={12} />
                        <Label text="Provinsi" className="!mb-0 !text-[8px] !font-black !uppercase !tracking-widest" />
                      </div>
                      <p className="text-sm font-bold text-slate-700 ml-5">{wilayahInfo.provinsi || "—"}</p>
                    </div>
                    <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-300 mb-1">
                        <MapPin size={12} />
                        <Label text="Kab / Kota" className="!mb-0 !text-[8px] !font-black !uppercase !tracking-widest" />
                      </div>
                      <p className="text-sm font-bold text-slate-700 ml-5">{wilayahInfo.kota || "—"}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label text="Area Officer (AO)" required className="!text-[9px] !font-black !text-slate-400 !uppercase !tracking-widest" />
                    <div className="relative">
                      <DropdownTrigger
                        type="ao"
                        placeholder="Pilih AO Pengawas"
                        icon={<Sparkles size={16} />}
                        value={aoList.find((a) => a.id_user === selectedAO)?.nama}
                      />
                      {openDrop === "ao" && (
                        <div className="absolute z-50 w-full bg-white border border-slate-100 mt-3 rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in-95">
                          <div className="max-h-56 overflow-y-auto no-scrollbar">
                            {aoList.map((a) => (
                              <button
                                key={a.id_user}
                                onClick={() => { setSelectedAO(a.id_user); setOpenDrop(null); }}
                                className="w-full text-left px-5 py-3 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-600 hover:text-[#0AC4E0] transition-colors"
                              >
                                {a.nama}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Identitas Program */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-8 animate-in fade-in slide-in-from-right-6 duration-700">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 text-[#0AC4E0] rounded-2xl flex items-center justify-center">
                    <Info size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 leading-none">Detail Program</h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">Identitas dan narasi operasional</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label text="Head Office (Penanggung Jawab)" className="!text-[9px] !font-black !text-slate-400 !uppercase !tracking-widest" />
                    <div className="px-5 py-3.5 bg-slate-50/50 rounded-2xl text-sm font-bold text-slate-300 border border-slate-100 cursor-not-allowed">
                      {namaHO}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label text="Nama Program Akademik" required className="!text-[9px] !font-black !text-slate-400 !uppercase !tracking-widest" />
                    <Input
                      placeholder="Masukkan nama program..."
                      value={namaProgram}
                      onChange={(e) => setNamaProgram(e.target.value)}
                      className="!bg-white !border-slate-200 !rounded-2xl !py-4 !px-6 !text-sm !font-bold !text-slate-800 focus:!border-[#0AC4E0] focus:!ring-4 focus:!ring-[#0AC4E0]/5 transition-all shadow-sm"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label text="Deskripsi Singkat" className="!text-[9px] !font-black !text-slate-400 !uppercase !tracking-widest" />
                    <textarea
                      className="w-full bg-white border border-slate-200 rounded-[2rem] p-6 text-sm font-semibold text-slate-800 focus:border-[#0AC4E0] focus:ring-4 focus:ring-[#0AC4E0]/5 outline-none transition-all h-[142px] resize-none shadow-sm placeholder:text-slate-200"
                      placeholder="Tuliskan detail kegiatan di sini..."
                      value={deskripsi}
                      onChange={(e) => setDeskripsi(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Logistik & Berkas */}
              <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-14 h-14 bg-slate-800 rounded-[1.8rem] flex items-center justify-center text-white shadow-xl">
                    <FileText size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight leading-none">Logistik & Dokumentasi</h3>
                    <p className="text-sm text-slate-400 font-medium mt-2">Periode akademik, rekanan vendor, dan arsip MOU</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 text-left">
                  <div className="space-y-3">
                    <Label text="Tahun" required icon={<Calendar size={12} />} className="!text-[9px] !font-black !text-slate-400 !uppercase !tracking-widest" />
                    <Input
                      type="number"
                      value={tahun}
                      onChange={(e) => setTahun(e.target.value)}
                      className="!bg-white !border-slate-200 !rounded-2xl !py-4 !px-6 !text-center !font-black !text-lg !text-[#0AC4E0] focus:!border-[#0AC4E0] focus:!ring-4 focus:!ring-[#0AC4E0]/5 transition-all shadow-sm"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label text="Tgl Kick-off" icon={<Calendar size={12} />} className="!text-[9px] !font-black !text-slate-400 !uppercase !tracking-widest" />
                    <Input
                      type="date"
                      value={tanggalMulai}
                      onChange={(e) => setTanggalMulai(e.target.value)}
                      className="!bg-white !border-slate-200 !rounded-2xl !py-4 !px-6 !text-sm !font-bold !text-slate-800 focus:!border-[#0AC4E0] focus:!ring-4 focus:!ring-[#0AC4E0]/5 transition-all shadow-sm"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label text="Vendor Rekanan" icon={<Briefcase size={12} />} className="!text-[9px] !font-black !text-slate-400 !uppercase !tracking-widest" />
                    <div className="relative">
                      <DropdownTrigger
                        type="vendor"
                        placeholder="Pilih Vendor"
                        icon={<Briefcase size={16} />}
                        value={vendorList.find((v) => v.id_vendor === selectedVendor)?.nama_vendor}
                      />
                      {openDrop === "vendor" && (
                        <div className="absolute z-50 w-full bg-white border border-slate-100 mt-3 rounded-2xl shadow-2xl p-2">
                          <div className="max-h-56 overflow-y-auto no-scrollbar">
                            <button
                              onClick={() => { setSelectedVendor(""); setOpenDrop(null); }}
                              className="w-full text-left px-5 py-3 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-300 italic"
                            >
                              Tanpa Vendor
                            </button>
                            {vendorList.map((v) => (
                              <button
                                key={v.id_vendor}
                                onClick={() => { setSelectedVendor(v.id_vendor); setOpenDrop(null); }}
                                className="w-full text-left px-5 py-3 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-600 hover:text-[#0AC4E0] transition-colors"
                              >
                                {v.nama_vendor}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label text="Unggah Berkas MOU" className="!text-[9px] !font-black !text-slate-400 !uppercase !tracking-widest" />
                  <label className="group relative flex flex-col items-center justify-center w-full h-48 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2.5rem] hover:bg-[#0AC4E0]/5 hover:border-[#0AC4E0] transition-all duration-500 cursor-pointer overflow-hidden">
                    <div className="flex flex-col items-center justify-center p-6 transition-transform duration-500 group-hover:scale-110">
                      <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-4 group-hover:text-[#0AC4E0] transition-colors">
                        <Upload size={24} />
                      </div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-[#0AC4E0] transition-colors">
                        {fileMou ? fileMou.name : existingFileName || "Klik atau seret file MOU"}
                      </p>
                      {existingFileName && !fileMou && (
                        <p className="mt-2 text-[10px] font-bold text-[#0AC4E0] uppercase tracking-tighter bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                          Arsip: {existingFileName}
                        </p>
                      )}
                    </div>
                    <input type="file" className="hidden" onChange={(e) => setFileMou(e.target.files[0])} accept=".pdf,.jpg,.png" />
                  </label>
                </div>
              </div>
            </div>

            {/* Sticky Action Footer */}
            <footer className="mt-10 py-8 bg-white border border-slate-100 rounded-[2.5rem] flex justify-end gap-4 px-10 shadow-sm">
              <button
                disabled={saving}
                onClick={saveProgram}
                className="flex items-center gap-3 px-12 py-4 bg-[#0AC4E0] hover:bg-[#09b3cc] text-white rounded-2xl text-sm font-bold shadow-xl shadow-[#0AC4E0]/20 transition-all active:scale-95 disabled:opacity-50"
              >
                <Save size={20} />
                {saving ? "Memproses..." : "Simpan Perubahan"}
              </button>
            </footer>

          </div>
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

export default EditProgramAkademik;