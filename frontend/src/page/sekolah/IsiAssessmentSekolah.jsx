import Sidebar from "../../components/Sidebar";
import Card from "../../components/Card";
import Button from "../../components/Button";
import PageWrapper from "../../components/PageWrapper";

import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { Building2, MapPin, GraduationCap, Info, Mail, Award, Users } from "lucide-react";

function ProfilSekolah() {
  const navigate = useNavigate();
  const { id } = useParams(); // Mengambil ID dari URL /sekolah/profil/:id

  const [sekolah, setSekolah] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfil = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        // Logika penentuan ID: Jika di URL ga ada ID, ambil dari token login
        let targetId = id;
        if (!targetId || targetId === "undefined" || targetId === "null") {
          const decoded = jwtDecode(token);
          targetId = decoded.id_sekolah;
        }

        const res = await fetch(`http://localhost:3000/sekolah/${targetId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Gagal memuat profil");

        setSekolah(data);
      } catch (err) {
        console.error(err);
        toast.error("Gagal mengambil data profil sekolah");
      } finally {
        setLoading(false);
      }
    };

    fetchProfil();
  }, [id, navigate]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen font-bold text-[#1E5AA5]">
        Loading Profil...
      </div>
    );

  return (
    <PageWrapper className="h-screen bg-[#EEF5FF] flex overflow-hidden !p-0">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden px-4 md:px-12 pt-6 md:pt-10 pb-0">
        <Card className="flex-1 flex flex-col !m-0 !p-0 rounded-t-[2.5rem] rounded-b-[2.5rem] border-none shadow-2xl bg-white overflow-auto">
          
          {/* HEADER SECTION */}
          <div className="px-8 py-8 border-b border-gray-50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-blue-50 rounded-2xl text-[#1E5AA5] shadow-sm">
                  <Building2 size={32} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[#1E5AA5] font-black mb-1">
                    Profil Lembaga
                  </p>
                  <h1 className="text-3xl font-black text-gray-800 uppercase italic">
                    {sekolah?.nama_sekolah ?? "Nama Sekolah"}
                  </h1>
                </div>
              </div>
              <Button
                text="← Dashboard"
                variant="ghost"
                onClick={() => navigate("/sekolah/dashboard")}
                className="!rounded-xl border border-gray-200"
              />
            </div>
          </div>

          <div className="px-8 py-8 space-y-6">
            
            {/* CARD STATUS UTAMA */}
            <div className="p-6 bg-gradient-to-r from-[#1E5AA5] to-[#164a8a] rounded-[1.75rem] text-white shadow-lg flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1 italic">Jenjang & Akreditasi</p>
                <h2 className="text-2xl font-black">{sekolah?.jenjang} — AKREDITASI {sekolah?.akreditasi || "-"}</h2>
              </div>
              <Award size={48} className="opacity-30" />
            </div>

            {/* GRID INFORMASI DETAIL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Box NPSN */}
              <div className="p-6 bg-white border border-gray-100 rounded-[1.75rem] shadow-sm flex items-start gap-4">
                <div className="p-3 bg-gray-50 rounded-xl text-[#1E5AA5]">
                  <Info size={24} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">NPSN Sekolah</label>
                  <p className="font-bold text-gray-800 text-lg">{sekolah?.npsn || "-"}</p>
                </div>
              </div>

              {/* Box Wilayah */}
              <div className="p-6 bg-white border border-gray-100 rounded-[1.75rem] shadow-sm flex items-start gap-4">
                <div className="p-3 bg-gray-50 rounded-xl text-[#1E5AA5]">
                  <MapPin size={24} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Wilayah / Lokasi</label>
                  <p className="font-bold text-gray-800 text-lg">{sekolah?.wilayah?.nama_wilayah || "-"}</p>
                </div>
              </div>

              {/* Box SDM */}
              <div className="p-6 bg-white border border-gray-100 rounded-[1.75rem] shadow-sm flex items-start gap-4">
                <div className="p-3 bg-gray-50 rounded-xl text-[#1E5AA5]">
                  <Users size={24} />
                </div>
                <div className="flex gap-10">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Total Guru</label>
                    <p className="font-bold text-gray-800 text-lg">{sekolah?.jumlah_guru || 0} Orang</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Total Siswa</label>
                    <p className="font-bold text-gray-800 text-lg">{sekolah?.jumlah_siswa || 0} Orang</p>
                  </div>
                </div>
              </div>

              {/* Box Email Login */}
              <div className="p-6 bg-white border border-gray-100 rounded-[1.75rem] shadow-sm flex items-start gap-4">
                <div className="p-3 bg-gray-50 rounded-xl text-[#1E5AA5]">
                  <Mail size={24} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Email Akun</label>
                  <p className="font-bold text-gray-800 text-lg">{sekolah?.email_login || "-"}</p>
                </div>
              </div>

            </div>

            {/* ALAMAT LENGKAP */}
            <div className="p-6 bg-gray-50 border border-dashed border-gray-200 rounded-[1.75rem]">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block italic text-[#1E5AA5]">Alamat Lengkap Korespondensi</label>
              <p className="text-gray-700 font-medium leading-relaxed">
                {sekolah?.alamat || "Alamat belum tercatat di sistem."}
              </p>
            </div>

          </div>

          {/* FOOTER ACTION */}
          <div className="px-8 pb-10 mt-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-blue-50 rounded-3xl border border-blue-100">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${sekolah?.status ? "bg-emerald-500" : "bg-red-500"} shadow-sm`} />
                <p className="text-sm font-black text-[#1E5AA5] uppercase tracking-widest">
                  Status Operasional: {sekolah?.status ? "Aktif" : "Non-Aktif"}
                </p>
              </div>
              <Button
                text="Hubungi Admin Untuk Perubahan"
                variant="ghost"
                className="!text-[10px] !py-2 border border-blue-200 bg-white"
                onClick={() => toast.info("Silakan hubungi admin wilayah untuk merubah data profil.")}
              />
            </div>
          </div>
        </Card>
      </main>
    </PageWrapper>
  );
}

export default ProfilSekolah;