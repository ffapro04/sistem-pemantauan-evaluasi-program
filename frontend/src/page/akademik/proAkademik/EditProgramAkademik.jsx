/* eslint-disable no-undef */
import Sidebar from "../../../components/Sidebar";
import Button from "../../../components/Button";
import Label from "../../../components/Label";
import Input from "../../../components/Input";
import PageWrapper from "../../../components/PageWrapper";
import Card from "../../../components/Card";
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
  UserCheck,
  Trash2,
  ListChecks,
  X,
} from "lucide-react";

function EditProgramAkademik() {
  const navigate = useNavigate();
  const { id } = useParams();

  // State List Data
  const [sekolahList, setSekolahList] = useState([]);
  const [vendorList, setVendorList] = useState([]);
  const [aoList, setAoList] = useState([]);
  const [hargaVendor, setHargaVendor] = useState("");

  // Form State
  const [namaHO, setNamaHO] = useState("");
  const [wilayahInfo, setWilayahInfo] = useState({ kota: "", provinsi: "" });
  const [selectedSekolah, setSelectedSekolah] = useState("");
  const [selectedVendors, setSelectedVendors] = useState([]); // SEKARANG ARRAY UNTUK MULTI
  const [selectedAO, setSelectedAO] = useState("");
  const [namaProgram, setNamaProgram] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [tahun, setTahun] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [statusProgram, setStatusProgram] = useState("Draft");
  const [fileMou, setFileMou] = useState(null);
  const [existingFileName, setExistingFileName] = useState("");

  // --- STATE TAHAPAN ---
  const [fases, setFases] = useState([]);
  const [expandedFase, setExpandedFase] = useState([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openDrop, setOpenDrop] = useState(null);

  const formatRupiah = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("id-ID").format(value);
  };

  const parseRawNumber = (value) => {
    return value.toString().replace(/\./g, "");
  };

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
        const dataAo = await resAo.json();
        const dataVendor = await resVendor.json();
        const detail = await resDetail.json();

        setSekolahList(Array.isArray(dataSekolah) ? dataSekolah : []);
        setAoList(Array.isArray(dataAo) ? dataAo : []);
        setVendorList(Array.isArray(dataVendor) ? dataVendor : []);

        if (detail) {
          setNamaProgram(detail.nama_program || "");
          setDeskripsi(detail.deskripsi || "");
          setTahun(detail.tahun || "");
          setStatusProgram(detail.status_program || "Draft");
          setExistingFileName(detail.file_mou || "");
          setHargaVendor(detail.harga_vendor || "");
          
          if (detail.tanggal_mulai) setTanggalMulai(detail.tanggal_mulai.split("T")[0]);
          if (detail.tanggal_selesai) setTanggalSelesai(detail.tanggal_selesai.split("T")[0]);

          setSelectedSekolah(detail.id_sekolah || "");
          setSelectedAO(detail.id_pengawas || "");

          // --- FIX MULTI VENDOR LOAD ---
          // Ambil data vendor dari detail.id_vendor (asumsi backend simpan array atau string JSON)
          if (detail.id_vendor) {
            let vendors = [];
            try {
               vendors = Array.isArray(detail.id_vendor) ? detail.id_vendor : JSON.parse(detail.id_vendor);
            } catch (e) {
               vendors = [detail.id_vendor]; // fallback kalau data tunggal
            }
            setSelectedVendors(vendors);
          }

          // --- LOAD TAHAPAN ---
          if (detail.fases && detail.fases.length > 0) {
            setFases(detail.fases);
            setExpandedFase(detail.fases.map(() => false));
          } else {
            setFases([{ nama_fase: "", deskripsi: "", urutan: 1, kegiatans: [] }]);
            setExpandedFase([true]);
          }
          
          const sklh = dataSekolah.find((s) => s.id_sekolah === detail.id_sekolah);
          if (sklh) {
            setWilayahInfo({
              kota: sklh.wilayah?.nama_wilayah,
              provinsi: sklh.wilayah?.parent?.nama_wilayah,
            });
          }
        }
      } catch (err) {
        toast.error("Gagal mengambil data program");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchAllData();
  }, [id]);

  // --- FUNGSI TAHAPAN ---
  const addFase = () => {
    setFases([...fases, { nama_fase: "", deskripsi: "", urutan: fases.length + 1, kegiatans: [] }]);
    setExpandedFase([...expandedFase, true]);
  };
  const removeFase = (index) => {
    const newFases = fases.filter((_, i) => i !== index);
    setFases(newFases.map((f, i) => ({ ...f, urutan: i + 1 })));
    setExpandedFase(expandedFase.filter((_, i) => i !== index));
  };
  const updateFase = (index, field, value) => {
    const newFases = [...fases];
    newFases[index][field] = value;
    setFases(newFases);
  };
  const toggleFaseExpand = (index) => {
    const newExpanded = [...expandedFase];
    newExpanded[index] = !newExpanded[index];
    setExpandedFase(newExpanded);
  };
  const addActivitiesToFase = (faseIndex) => {
    const newFases = [...fases];
    newFases[faseIndex].kegiatans.push({ nama_kegiatans: "", urutan: newFases[faseIndex].kegiatans.length + 1 });
    setFases(newFases);
  };
  const removeActivitiesFromFase = (faseIndex, kegIndex) => {
    const newFases = [...fases];
    newFases[faseIndex].kegiatans.splice(kegIndex, 1);
    newFases[faseIndex].kegiatans = newFases[faseIndex].kegiatans.map((k, i) => ({ ...k, urutan: i + 1 }));
    setFases([...newFases]);
  };
  const updateActivities = (faseIndex, kegIndex, field, value) => {
    const newFases = [...fases];
    newFases[faseIndex].kegiatans[kegIndex][field] = value;
    setFases(newFases);
  };

  const saveProgram = async () => {
    // --- VALIDASI REQUIRED ---
    if (!selectedSekolah) return toast.warning("Sekolah wajib dipilih!");
    if (!selectedAO) return toast.warning("Pengawas (AO) wajib dipilih!");
    if (!namaProgram.trim()) return toast.warning("Nama Program wajib diisi!");
    if (!tahun) return toast.warning("Tahun wajib diisi!");
    if (!tanggalMulai) return toast.warning("Tanggal Mulai wajib diisi!");
    if (!tanggalSelesai) return toast.warning("Tanggal Selesai wajib diisi!");
    if (!hargaVendor || hargaVendor === "0") return toast.warning("Anggaran wajib diisi!");
    if (selectedVendors.length === 0) return toast.warning("Minimal pilih 1 Vendor!");
    if (!fileMou && !existingFileName) return toast.warning("Berkas MOU wajib diunggah!");
    
    const validFases = fases.filter(f => f.nama_fase && f.nama_fase.trim() !== "");
    if (validFases.length === 0) return toast.warning("Minimal harus ada 1 Tahapan!");

    setSaving(true);
    const formData = new FormData();
    formData.append("nama_program", namaProgram.trim());
    formData.append("deskripsi", deskripsi.trim());
    formData.append("status_program", statusProgram);
    formData.append("tahun", String(tahun));
    formData.append("harga_vendor", String(hargaVendor || 0));
    formData.append("id_sekolah", String(selectedSekolah));
    formData.append("id_pengawas", String(selectedAO));
    
    // Kirim Vendor sebagai JSON string agar Backend bisa handle array
    formData.append("id_vendor", JSON.stringify(selectedVendors));
    
    formData.append("tanggal_mulai", tanggalMulai);
    formData.append("tanggal_selesai", tanggalSelesai);
    formData.append("fases", JSON.stringify(validFases));

    if (fileMou) formData.append("file_mou", fileMou);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/program/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        toast.success("🚀 Program berhasil diperbarui!");
        setTimeout(() => navigate(`/ho/program/akademik/detail/${id}`), 1500);
      } else {
        const result = await res.json();
        toast.error(result.message || "Gagal memperbarui data");
      }
    } catch (err) {
      toast.error("Koneksi terputus");
    } finally {
      setSaving(false);
    }
  };

  const DropdownTrigger = ({ type, placeholder, value, disabled }) => (
    <button
      type="button"
      onClick={() => !disabled && setOpenDrop(openDrop === type ? null : type)}
      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm transition-all 
        ${disabled 
          ? "bg-gray-100 border-gray-200 cursor-not-allowed pointer-events-none opacity-60" 
          : "bg-white border-gray-300 hover:border-blue-500"
        } 
        ${!disabled && openDrop === type ? "border-blue-600 ring-2 ring-blue-600/10" : ""}`}
    >
      <span className={`truncate font-bold ${value ? "text-black" : "text-gray-400"}`}>
        {value || placeholder}
      </span>
      {!disabled && (
        <ChevronDown size={14} className={`transition-transform ${openDrop === type ? "rotate-180 text-blue-600" : "text-black"}`} />
      )}
    </button>
  );

  if (loading) return <div className="h-screen flex items-center justify-center font-black">MEMUAT DATA...</div>;

  return (
    <PageWrapper className="h-screen bg-[#EEF5FF] flex overflow-hidden !p-0">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden px-4 md:px-12 pt-6 md:pt-10 pb-0">
        <Card className="flex-1 flex flex-col !m-0 !p-0 rounded-t-[2.5rem] rounded-b-[2.5rem] border-none shadow-2xl bg-white overflow-hidden relative">
          <div className="px-8 pt-6 pb-6 shrink-0">
            <header className="flex flex-row items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="relative p-3.5 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl text-white shadow-xl">
                  <Edit3 size={22} strokeWidth={2} />
                </div>
                <div className="flex flex-col -space-y-1">
                  <Label text="Sistem Monitoring dan Evaluasi Program" className="!text-[8px] !text-blue-700 !font-black tracking-[0.3em] !mb-1 uppercase" />
                  <h1 className="text-xl font-black text-black tracking-tight uppercase leading-none">
                    Edit Program <span className="text-blue-600">Akademik</span>
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={statusProgram}
                  onChange={(e) => setStatusProgram(e.target.value)}
                  className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border border-blue-200 bg-blue-50 text-blue-700 outline-none cursor-pointer"
                >
                  <option value="Draft">Draft</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
                <Button
                  text="← Kembali"
                  icon={<ArrowLeft size={14} />}
                  onClick={() => navigate(`/ho/program/akademik/detail/${id}`)}
                  className="!bg-black hover:!bg-gray-800 !rounded-xl !px-5 !py-2.5 !text-[10px] font-black text-white shadow-lg active:scale-95 transition-all flex items-center gap-2"
                />
              </div>
            </header>

            <div className="flex flex-row items-center gap-3 mb-6">
              <div className="flex items-center gap-3 px-5 py-2.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 font-black text-[9px] uppercase tracking-[0.2em] shrink-0">
                <Target size={14} /> Program: {namaProgram || "Loading..."}
              </div>
              <div className="flex items-center gap-3 px-5 py-2.5 bg-gray-50 text-black rounded-xl border border-gray-200 font-black text-[9px] uppercase tracking-[0.2em] shrink-0">
                <Info size={14} /> Kode: {id}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col px-10 pb-4">
            <div className="flex-1 bg-white border border-gray-100 rounded-3xl overflow-hidden flex flex-col shadow-sm">
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Penempatan */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-3 border-b-2 border-blue-100">
                      <div className="p-2 bg-blue-50 rounded-lg"><Target size={20} className="text-blue-600" /></div>
                      <h3 className="text-lg font-black text-black uppercase tracking-wide">Penempatan</h3>
                    </div>
                    <div className="space-y-4">
                      <Label text="Sekolah" required className="!text-black font-bold" />
                      <DropdownTrigger type="sekolah" disabled={true} value={sekolahList.find((s) => s.id_sekolah === selectedSekolah)?.nama_sekolah} />
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                        <div>
                          <Label text="Provinsi" className="!text-black" />
                          <p className="text-sm font-black text-blue-700">{wilayahInfo.provinsi || "-"}</p>
                        </div>
                        <div>
                          <Label text="Kabupaten / Kota" className="!text-black" />
                          <p className="text-sm font-black text-blue-700">{wilayahInfo.kota || "-"}</p>
                        </div>
                      </div>
                      <Label text="Pengawas (AO)" required className="!text-black font-bold" />
                      <DropdownTrigger type="ao" placeholder="Pilih Pengawas" value={aoList.find((a) => a.id_user === selectedAO)?.nama} />
                      {openDrop === "ao" && (
                        <ul className="absolute z-40 w-full bg-white border border-gray-100 mt-2 rounded-xl shadow-2xl max-h-48 overflow-y-auto p-1">
                          {aoList.map((a) => (
                            <li key={a.id_user} onClick={() => { setSelectedAO(a.id_user); setOpenDrop(null); }}
                              className="px-4 py-2 hover:bg-blue-50 rounded-lg cursor-pointer text-sm font-bold text-black transition-colors">
                              {a.nama}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Identitas */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-3 border-b-2 border-blue-100">
                      <div className="p-2 bg-blue-50 rounded-lg"><UserCheck size={20} className="text-blue-600" /></div>
                      <h3 className="text-lg font-black text-black uppercase tracking-wide">Identitas Program</h3>
                    </div>
                    <div className="space-y-4">
                      <Label text="Penanggung Jawab HO" className="!text-black" />
                      <Input value={namaHO} disabled className="bg-gray-100 text-black font-bold opacity-60" />
                      <Label text="Nama Program" required className="!text-black font-bold" />
                      <Input value={namaProgram} onChange={(e) => setNamaProgram(e.target.value)} className="bg-white border-gray-300 font-bold text-black" />
                      <Label text="Deskripsi" required className="!text-black font-bold" />
                      <textarea className="w-full bg-white border border-gray-300 rounded-xl p-4 text-sm font-bold text-black h-24 resize-none" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Logistik & Berkas */}
                <div className="mt-8 space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b-2 border-blue-100">
                    <div className="p-2 bg-blue-50 rounded-lg"><FileText size={20} className="text-blue-600" /></div>
                    <h3 className="text-lg font-black text-black uppercase tracking-wide">Logistik & Berkas</h3>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div>
                      <Label text="Tahun" required className="!text-black font-bold" />
                      <Input type="number" value={tahun} onChange={(e) => setTahun(e.target.value)} className="text-center text-black" />
                    </div>
                    <div>
                      <Label text="Tanggal Mulai" required className="!text-black font-bold" />
                      <Input type="date" value={tanggalMulai} onChange={(e) => setTanggalMulai(e.target.value)} className="text-black" />
                    </div>
                    <div>
                      <Label text="Tanggal Selesai" required className="!text-black font-bold" />
                      <Input type="date" value={tanggalSelesai} onChange={(e) => setTanggalSelesai(e.target.value)} className="text-black" />
                    </div>
                    <div>
                      <Label text="Anggaran (IDR)" required className="!text-black font-bold" />
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-emerald-600">Rp</div>
                        <Input type="text" value={formatRupiah(hargaVendor)} onChange={(e) => setHargaVendor(parseRawNumber(e.target.value))} className="bg-white border-gray-300 !pl-9 text-sm font-bold text-emerald-700" />
                      </div>
                    </div>

                    {/* --- MULTI VENDOR SELECTION --- */}
                    <div>
                      <Label text="Vendor (Multi)" required className="!text-black font-bold" />
                      <div className="relative">
                        <DropdownTrigger 
                          type="vendor" 
                          placeholder="Pilih Vendor..." 
                          value={selectedVendors.length ? `${selectedVendors.length} terpilih` : ""} 
                        />
                        {openDrop === "vendor" && (
                          <ul className="absolute z-40 w-full bg-white border border-gray-100 mt-2 rounded-xl shadow-2xl max-h-48 overflow-y-auto p-1">
                            {vendorList.map((v) => (
                              <li key={v.id_vendor} onClick={() => { 
                                  if(!selectedVendors.includes(v.id_vendor)) {
                                    setSelectedVendors([...selectedVendors, v.id_vendor]);
                                  }
                                  setOpenDrop(null); 
                                }}
                                className="px-4 py-2 hover:bg-blue-50 rounded-lg cursor-pointer text-sm font-bold text-black transition-colors">
                                {v.nama_vendor}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      {/* Tampilkan Badges Vendor kayak di Create */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedVendors.map((vId) => (
                          <span key={vId} className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-black">
                            {vendorList.find(v => v.id_vendor === vId)?.nama_vendor || vId}
                            <X size={10} className="cursor-pointer hover:text-red-500" onClick={() => setSelectedVendors(selectedVendors.filter(x => x !== vId))} />
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <Label text="Berkas MOU" required className="!text-black font-bold" />
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl bg-white hover:bg-blue-50 cursor-pointer group transition-all">
                    <Upload size={24} className="text-gray-400 group-hover:text-blue-600 mb-2" />
                    <p className="text-[10px] font-black text-black">{fileMou ? fileMou.name : existingFileName || "GANTI BERKAS MOU"}</p>
                    <input type="file" className="hidden" onChange={(e) => setFileMou(e.target.files[0])} />
                  </label>
                </div>

                {/* --- SECTION TAHAPAN IMPLEMENTASI --- */}
                <div className="mt-12 space-y-6">
                  <div className="flex justify-between items-center border-b-2 border-blue-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg"><ListChecks size={20} className="text-blue-600" /></div>
                      <h3 className="text-lg font-black text-black uppercase tracking-wide">Tahapan Implementasi</h3>
                    </div>
                    <button onClick={addFase} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black shadow-lg hover:scale-105 transition-transform">+ TAMBAH FASE</button>
                  </div>

                  {fases.map((f, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-4 shadow-sm">
                      <div className="p-4 flex justify-between items-center cursor-pointer bg-gray-50 hover:bg-gray-100" onClick={() => toggleFaseExpand(i)}>
                        <div className="flex items-center gap-4 flex-1">
                          <span className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center rounded-lg font-black text-xs">{i + 1}</span>
                          <input value={f.nama_fase} onChange={(e) => updateFase(i, "nama_fase", e.target.value)} onClick={(e) => e.stopPropagation()} 
                                 className="bg-transparent border-none font-black text-black flex-1 focus:ring-0" placeholder="Nama tahapan (Wajib Isi)..." />
                        </div>
                        <div className="flex items-center gap-4">
                          <Trash2 size={18} className="text-gray-300 hover:text-red-500" onClick={(e) => { e.stopPropagation(); removeFase(i); }} />
                          <ChevronDown size={20} className={`transition-all ${expandedFase[i] ? "rotate-180" : ""}`} />
                        </div>
                      </div>
                      {expandedFase[i] && (
                        <div className="p-6 space-y-4 border-t border-gray-100">
                          <Label text="Deskripsi Fase" className="!text-black font-bold" />
                          <textarea value={f.deskripsi} onChange={(e) => updateFase(i, "deskripsi", e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-xs font-bold text-black h-20" placeholder="Jelaskan detail fase ini..." />
                          
                          <div className="flex justify-between items-center border-b pb-2 mt-4">
                            <h4 className="text-[10px] font-black text-black uppercase">Kegiatan Operasional</h4>
                            <button onClick={() => addActivitiesToFase(i)} className="text-[10px] font-black text-blue-600 hover:underline">+ KEGIATAN</button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {f.kegiatans.map((k, ki) => (
                              <div key={ki} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                <span className="text-[10px] font-black text-blue-600 ml-1">{ki + 1}</span>
                                <input value={k.nama_kegiatans} onChange={(e) => updateActivities(i, ki, "nama_kegiatans", e.target.value)} 
                                       className="flex-1 bg-transparent border-none text-[11px] font-bold text-black focus:ring-0" placeholder="Nama kegiatan..." />
                                <Trash2 size={14} className="text-gray-300 hover:text-red-500 cursor-pointer" onClick={() => removeActivitiesFromFase(i, ki)} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 mt-12 pt-6 border-t border-gray-100">
                  <Button
                    text={saving ? "Menyimpan..." : "Simpan Perubahan"}
                    icon={<Save size={14} />}
                    disabled={saving}
                    onClick={saveProgram}
                    className="!bg-blue-600 !text-white !rounded-xl !px-10 !py-4 !text-sm font-black transition-all shadow-xl active:scale-95"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </PageWrapper>
  );
}

export default EditProgramAkademik;