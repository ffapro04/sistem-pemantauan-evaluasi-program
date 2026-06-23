import CreateProgramForm from "../../../components/program/CreateProgramForm";

function CreateProgramAkademik() {
<<<<<<< HEAD
  return (
    <CreateProgramForm
      kategori="AKADEMIK"
      title="Program Akademik"
      redirectPath="/ho/program/akademik"
      vendorEndpoint="http://localhost:3000/vendor?kategori=AKADEMIK"
      defaultFaseName="Fase 1: Inisiasi"
      programPlaceholder="Contoh: Digitalisasi Kurikulum Nasional"
      successMessage="Program Akademik berhasil dibuat"
    />
=======
  const navigate = useNavigate();

  // --- 1. STATE DATA REFERENSI ---
  const [sekolahList, setSekolahList] = useState([]);
  const [vendorList, setVendorList] = useState([]);
  const [aoList, setAoList] = useState([]);
  const [hoList, setHoList] = useState([]);

  // --- 2. STATE FORM ---
  const [loading, setLoading] = useState(false);
  const [wilayahInfo, setWilayahInfo] = useState({ kota: "", provinsi: "" });
  const [selectedSekolah, setSelectedSekolah] = useState(null);
  const [selectedAO, setSelectedAO] = useState(null);
  const [selectedHO, setSelectedHO] = useState(null);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [hargaVendor, setHargaVendor] = useState("");
  const [namaProgram, setNamaProgram] = useState("");
  const [kpi, setKpi] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [fileMou, setFileMou] = useState(null);

  // --- 3. STATE FASE & KEGIATAN ---
  const [fases, setFases] = useState([
    { nama_fase: "", deskripsi: "", urutan: 1, kegiatans: [] },
  ]);
  const [expandedFase, setExpandedFase] = useState([true]);
  const [openDrop, setOpenDrop] = useState(null);

  // --- 4. FETCH DATA ---
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

        setSekolahList(Array.isArray(dSek) ? dSek : dSek.data || []);
        setAoList(Array.isArray(dAo) ? dAo : dAo.data || []);
        setHoList(Array.isArray(dHo) ? dHo : dHo.data || []);
        setVendorList(Array.isArray(dVen) ? dVen : dVen.data || []);
      } catch (err) {
        console.error("Gagal sinkronisasi data");
      }
    };
    fetchData();
  }, []);

  const handleSekolahSelect = (id) => {
    setSelectedSekolah(id);
    setOpenDrop(null);
    const s = sekolahList.find((i) => i.id_sekolah === id);
    if (s)
      setWilayahInfo({
        kota: s.wilayah?.nama_wilayah || s.nama_wilayah || "-",
        provinsi: s.wilayah?.parent?.nama_wilayah || s.nama_provinsi || "-",
      });
  };

  const addFase = () => {
    setFases([
      ...fases,
      { nama_fase: "", deskripsi: "", urutan: fases.length + 1, kegiatans: [] },
    ]);
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
    newFases[faseIndex].kegiatans.push({
      nama_kegiatans: "",
      deskripsi: "",
      urutan: newFases[faseIndex].kegiatans.length + 1,
    });
    setFases(newFases);
  };

  const removeActivitiesFromFase = (faseIndex, kegIndex) => {
    const newFases = [...fases];
    newFases[faseIndex].kegiatans.splice(kegIndex, 1);
    newFases[faseIndex].kegiatans = newFases[faseIndex].kegiatans.map(
      (k, i) => ({ ...k, urutan: i + 1 }),
    );
    setFases([...newFases]);
  };

  const updateActivities = (faseIndex, kegIndex, field, value) => {
    const newFases = [...fases];
    newFases[faseIndex].kegiatans[kegIndex][field] = value;
    setFases(newFases);
  };

  const formatRupiah = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("id-ID").format(value);
  };

  const parseRawNumber = (value) => {
    return value.replace(/\./g, "");
  };

  const saveProgram = async () => {
    if (
      !selectedSekolah ||
      !selectedHO ||
      !selectedAO ||
      !namaProgram.trim() ||
      !fileMou
    ) {
      return toast.error(
        "Lengkapi data wajib: Sekolah, Personel (HO & AO), Nama Program, dan berkas MOU.",
      );
    }

    const validFases = fases
      .filter((f) => f.nama_fase && f.nama_fase.trim() !== "")
      .map((f, i) => ({
        ...f,
        urutan: i + 1,
        kegiatans: f.kegiatans.filter(
          (k) => k.nama_kegiatans && k.nama_kegiatans.trim() !== "",
        ),
      }));

    if (validFases.length === 0) {
      return toast.error(
        "Tambahkan minimal 1 Tahapan Program dengan nama yang jelas.",
      );
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("nama_program", namaProgram);
      formData.append("kpi", kpi);
      formData.append("deskripsi", deskripsi);
      formData.append("id_sekolah", String(selectedSekolah));
      formData.append("id_pengawas", String(selectedAO));
      formData.append("id_user_ho", String(selectedHO));
      formData.append("harga_vendor", String(hargaVendor || 0))
      formData.append("tahun", String(tahun));
      formData.append("kategori", "AKADEMIK");
      formData.append("status_program", "Draft");

      if (tanggalMulai) formData.append("tanggal_mulai", tanggalMulai);
      if (tanggalSelesai) formData.append("tanggal_selesai", tanggalSelesai);
      formData.append("ids_vendor", JSON.stringify(selectedVendors));
      formData.append("file_mou", fileMou);
      formData.append("fases", JSON.stringify(validFases));

      const res = await fetch("http://localhost:3000/program", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (res.ok) {
        toast.success("Program Akademik Berhasil Diterbitkan!");
        setTimeout(() => navigate("/ho/program/akademik"), 1500);
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Gagal menyimpan ke server.");
      }
    } catch (err) {
      toast.error("Koneksi server terputus.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper className="h-screen bg-[#F1F5F9] flex overflow-hidden !p-0">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="px-8 pt-5 pb-3 shrink-0 flex items-center justify-between bg-white border-b border-gray-200 z-30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#1E5AA5] rounded-xl text-white shadow-md">
              <PlusCircle size={20} />
            </div>
            <h1 className="text-lg font-black text-black uppercase tracking-tight leading-none">
              Inisiasi <span className="text-[#1E5AA5]">Akademik</span>
            </h1>
          </div>
          <Button
            text="Kembali"
            icon={<ArrowLeft size={14} />}
            onClick={() => navigate("/ho/program/akademik")}
            className="!bg-gray-50 !text-black !rounded-xl !px-4 !py-2 !text-[10px] font-bold border border-gray-200 transition-all hover:!text-red-500 shadow-sm"
          />
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-8 pt-6 pb-20 space-y-6">
          <div className="max-w-[1400px] mx-auto space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Target size={18} className="text-[#1E5AA5]" />
                  <h3 className="text-xs font-black text-black uppercase">
                    Sasaran Wilayah
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Label
                      text="Pilih Sekolah"
                      className="!text-[9px] uppercase font-bold text-black"
                    />
                    <button
                      onClick={() => setOpenDrop(openDrop === "sek" ? null : "sek")}
                      className="w-full text-left px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-black flex justify-between items-center transition-all hover:bg-white hover:border-[#1E5AA5]"
                    >
                      {sekolahList.find((s) => s.id_sekolah === selectedSekolah)?.nama_sekolah || "Pilih..."}
                      <ChevronDown size={14} className="text-black" />
                    </button>
                    {openDrop === "sek" && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-40 overflow-y-auto p-1">
                        {sekolahList.map((s) => (
                          <div
                            key={s.id_sekolah}
                            onClick={() => handleSekolahSelect(s.id_sekolah)}
                            className="p-2 hover:bg-blue-50 rounded-lg cursor-pointer text-xs font-bold text-black"
                          >
                            {s.nama_sekolah}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="bg-blue-50/50 p-2 rounded-xl border border-blue-100 flex justify-around items-center">
                    <div className="text-center">
                      <p className="text-[7px] font-bold text-black uppercase">Kota</p>
                      <p className="text-[10px] font-black text-[#1E5AA5]">
                        {wilayahInfo.kota || "-"}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[7px] font-bold text-black uppercase">Provinsi</p>
                      <p className="text-[10px] font-black text-[#1E5AA5]">
                        {wilayahInfo.provinsi || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <UserCheck size={18} className="text-emerald-600" />
                  <h3 className="text-xs font-black text-black uppercase">PIC Otoritas</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <button
                      onClick={() => setOpenDrop(openDrop === "ho" ? null : "ho")}
                      className="w-full text-left px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-black flex justify-between transition-all hover:border-emerald-500"
                    >
                      {hoList.find((h) => h.id_user === selectedHO)?.nama || "PIC HO"}
                      <ChevronDown size={14} className="text-black" />
                    </button>
                    {openDrop === "ho" && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-40 overflow-y-auto p-1">
                        {hoList.map((h) => (
                          <div key={h.id_user} onClick={() => { setSelectedHO(h.id_user); setOpenDrop(null); }}
                            className="p-2 hover:bg-emerald-50 rounded-lg cursor-pointer text-xs font-bold text-black">
                            {h.nama}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setOpenDrop(openDrop === "ao" ? null : "ao")}
                      className="w-full text-left px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-black flex justify-between transition-all hover:border-blue-500"
                    >
                      {aoList.find((a) => a.id_user === selectedAO)?.nama || "AO Wilayah"}
                      <ChevronDown size={14} className="text-black" />
                    </button>
                    {openDrop === "ao" && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-40 overflow-y-auto p-1">
                        {aoList.map((a) => (
                          <div key={a.id_user} onClick={() => { setSelectedAO(a.id_user); setOpenDrop(null); }}
                            className="p-2 hover:bg-blue-50 rounded-lg cursor-pointer text-xs font-bold text-black">
                            {a.nama}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="space-y-1">
                  <Label text="Nama Program Utama" className="!text-[9px] uppercase !text-black" />
                  <Input
                    placeholder="Contoh: Digitalisasi Modul Pengajaran..."
                    value={namaProgram}
                    onChange={(e) => setNamaProgram(e.target.value)}
                    className="!text-lg !font-black !py-4 !bg-gray-50/50 !rounded-2xl !text-black"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label text="KPI Capaian" className="!text-[9px] uppercase !text-black" />
                    <Input
                      placeholder="KPI terukur..."
                      value={kpi}
                      onChange={(e) => setKpi(e.target.value)}
                      className="!text-xs !bg-blue-50/30 !rounded-xl !text-black !font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label text="Anggaran (IDR)" className="!text-[9px] uppercase !text-black" />
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10 pointer-events-none">
                        <span className="text-[10px] font-black text-emerald-600">Rp</span>
                      </div>
                      <Input
                        type="text"
                        placeholder="0"
                        value={formatRupiah(hargaVendor)}
                        onChange={(e) => {
                          const rawValue = parseRawNumber(e.target.value);
                          if (!isNaN(rawValue) || rawValue === "") setHargaVendor(rawValue);
                        }}
                        className="!text-xs !pl-9 !bg-emerald-50/30 !rounded-xl !text-black font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label text="Tanggal Mulai" className="!text-[9px] uppercase !text-black" />
                    <div className="relative">
                      <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1E5AA5] z-10" />
                      <Input type="date" value={tanggalMulai} onChange={(e) => setTanggalMulai(e.target.value)}
                        className="!text-xs !pl-8 !bg-emerald-50/30 !rounded-xl !text-black !font-bold" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label text="Tanggal Selesai" className="!text-[9px] uppercase !text-black" />
                    <div className="relative">
                      <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1E5AA5] z-10" />
                      <Input type="date" value={tanggalSelesai} onChange={(e) => setTanggalSelesai(e.target.value)}
                        className="!text-xs !pl-8 !bg-emerald-50/30 !rounded-xl !text-black !font-bold" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="relative">
                  <Label text="Mitra Pelaksana (Multi)" className="!text-[8px] uppercase font-black !text-black" />
                  <button onClick={() => setOpenDrop(openDrop === "ven" ? null : "ven")}
                    className="w-full text-left px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-[10px] font-bold text-black flex justify-between items-center transition-all hover:border-[#1E5AA5]"
                  >
                    {selectedVendors.length ? `${selectedVendors.length} Vendor` : "Pilih Vendor..."}
                    <ChevronDown size={14} className="text-black" />
                  </button>
                  {openDrop === "ven" && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-32 overflow-y-auto p-1">
                      {vendorList.map((v) => (
                        <div key={v.id_vendor} onClick={() => {
                          if (!selectedVendors.includes(v.id_vendor)) setSelectedVendors([...selectedVendors, v.id_vendor]);
                          setOpenDrop(null);
                        }} className="p-2 hover:bg-blue-50 rounded-lg cursor-pointer text-[10px] font-bold text-black">
                          {v.nama_vendor || v.nama}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedVendors.map((id) => (
                    <span key={id} className="px-2 py-0.5 bg-[#1E5AA5] text-white text-[8px] font-bold rounded flex items-center gap-1">
                      {vendorList.find((v) => v.id_vendor === id)?.nama_vendor || "Vendor"}
                      <X size={10} className="cursor-pointer" onClick={() => setSelectedVendors(selectedVendors.filter((x) => x !== id))} />
                    </span>
                  ))}
                </div>
                <label className="flex items-center gap-2 p-2 border border-dashed border-gray-400 rounded-xl bg-white cursor-pointer hover:bg-blue-50 transition-colors">
                  <Upload size={14} className="text-[#1E5AA5]" />
                  <span className="text-[9px] font-bold text-black truncate">
                    {fileMou ? fileMou.name : "Unggah MOU"}
                  </span>
                  <input type="file" className="hidden" onChange={(e) => setFileMou(e.target.files[0])} />
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-2">
                  <ListChecks size={20} className="text-[#1E5AA5]" />
                  <h3 className="text-sm font-black text-black uppercase">Tahapan Implementasi</h3>
                </div>
                <button onClick={addFase} className="px-4 py-2 bg-[#1E5AA5] text-white rounded-xl text-[10px] font-black shadow-lg hover:scale-105 transition-transform">
                  + TAMBAH FASE
                </button>
              </div>

              {fases.map((f, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm group hover:shadow-md transition-shadow">
                  <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleFaseExpand(i)}>
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 bg-[#1E5AA5] text-white flex items-center justify-center rounded-xl font-black text-sm shadow-md">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <input value={f.nama_fase} onChange={(e) => updateFase(i, "nama_fase", e.target.value)} onClick={(e) => e.stopPropagation()}
                        className="border-none font-black text-black text-base focus:ring-0 w-80 bg-transparent placeholder-gray-400"
                        placeholder="Contoh: Tahap Persiapan & Riset..." />
                    </div>
                    <div className="flex items-center gap-4">
                      <Trash2 size={18} className="text-gray-300 hover:text-red-500 transition-colors"
                        onClick={(e) => { e.stopPropagation(); removeFase(i); }} />
                      <ChevronDown size={20} className={`text-black transition-all duration-300 ${expandedFase[i] ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                  {expandedFase[i] && (
                    <div className="p-6 bg-slate-50/50 border-t border-gray-200 space-y-6 animate-in fade-in duration-300">
                      <div className="space-y-1">
                        <Label text="Deskripsi Tahapan" className="!text-[8px] uppercase !text-black" />
                        <textarea value={f.deskripsi} onChange={(e) => updateFase(i, "deskripsi", e.target.value)}
                          className="w-full p-4 text-xs font-bold text-black border border-gray-200 rounded-xl h-24 shadow-inner"
                          placeholder="Jelaskan apa yang ingin dicapai pada fase ini..." />
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <h4 className="text-[10px] font-black text-black uppercase tracking-widest">Daftar Kegiatan Lapangan</h4>
                          <button onClick={() => addActivitiesToFase(i)} className="text-[10px] font-black text-[#1E5AA5] hover:underline">+ TAMBAH KEGIATAN</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {f.kegiatans.map((k, ki) => (
                            <div key={ki} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 hover:border-blue-300 transition-all group/item">
                              <span className="w-7 h-7 bg-blue-50 text-[#1E5AA5] flex items-center justify-center rounded-lg font-black text-[10px]">{ki + 1}</span>
                              <input value={k.nama_kegiatans} onChange={(e) => updateActivities(i, ki, "nama_kegiatans", e.target.value)}
                                className="flex-1 border-none text-xs font-black text-black focus:ring-0 bg-transparent placeholder-gray-400"
                                placeholder="Detail kegiatan operasional..." />
                              <Trash2 size={14} className="text-gray-300 hover:text-red-500 cursor-pointer transition-colors"
                                onClick={() => removeActivitiesFromFase(i, ki)} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-10">
              <Button
                text={loading ? "SEDANG MENSINKRONISASI..." : "SIMPAN SELURUH PROGRAM"}
                icon={<Save size={20} />}
                disabled={loading}
                onClick={saveProgram}
                className="!bg-[#1E5AA5] !text-white !rounded-[2rem] !px-24 !py-5 !text-sm font-black shadow-2xl hover:-translate-y-1 transition-all uppercase tracking-widest active:scale-95"
              />
            </div>
          </div>
        </div>
      </main>
    </PageWrapper>
>>>>>>> 55395b99654a0c44898aa60d46a595d174a20e95
  );
}

export default CreateProgramAkademik;