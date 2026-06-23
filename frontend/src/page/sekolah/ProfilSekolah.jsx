/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios"; 
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { 
  Building2, MapPin, GraduationCap, Info, 
  Mail, Award, Users, ArrowLeft, Globe2 
} from "lucide-react";

import Sidebar from "../../components/Sidebar";
import Card from "../../components/Card";
import Button from "../../components/Button";
import PageWrapper from "../../components/PageWrapper";

const ProfilSekolah = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [sekolah, setSekolah] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfilData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        const decoded = jwtDecode(token);
        console.table(decoded); 

        // const targetId = id || decoded.id_sekolah || decoded.sub;
        const targetId = id  || decoded.sub;

        if (!targetId ) {
          toast.error("user ID bener-bener gak ketemu!");
          return;
        }

        const response = await axios.get(`http://localhost:3000/sekolah/user/${targetId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setSekolah(response.data);
      } catch (err) {
        console.error("Fetch Error:", err);
        // Cek apakah error 404 karena datanya memang ga ada di tabel sekolah
      if (err.response?.status === 404) {
        toast.error("Data profil sekolah belum dibuat!");
      } else {
        toast.error("Gagal memuat profil");
      }
    } finally {
      setLoading(false);
    }
    };

    fetchProfilData();
  }, [id, navigate]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#F0FBFF] font-black text-[#0AC4E0] tracking-widest uppercase italic">
      Synchronizing Data...
    </div>
  );

  return (
    <PageWrapper className="h-screen bg-[#F0FBFF] flex overflow-hidden !p-0">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden px-4 md:px-12 pt-6 md:pt-10 pb-0">
        <Card className="flex-1 flex flex-col !m-0 !p-0 rounded-t-[3rem] rounded-b-[3rem] border-none shadow-3xl bg-white overflow-auto custom-scrollbar">
          
          {/* Header Banner - Warna Baru #0AC4E0 */}
          <div className="px-10 py-10 bg-[#0AC4E0] relative shrink-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/30 to-transparent" />
            <Globe2 size={180} className="absolute -bottom-10 -right-10 opacity-20 rotate-12 text-white" />
            
            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white border border-white/30 shadow-xl backdrop-blur-md">
                  <Building2 size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-[1000] text-white uppercase tracking-tighter leading-none mb-2">
                    {sekolah?.nama_sekolah}
                  </h2>
                  <p className="text-[10px] font-bold text-cyan-50 uppercase tracking-[0.3em] italic">
                    NPSN: {sekolah?.npsn} • {sekolah?.jenjang}
                  </p>
                </div>
              </div>
              <Button
                text="Dashboard"
                icon={<ArrowLeft size={16} />}
                onClick={() => navigate("/sekolah/dashboard")}
                // Button transparan di atas biru cerah
                className="!bg-white/20 !text-white border border-white/30 hover:!bg-white/40 !rounded-2xl transition-all shadow-lg"
              />
            </div>
          </div>

          <div className="p-10 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem icon={<MapPin />} label="Wilayah Operasional" value={sekolah?.wilayah?.nama_wilayah} />
                  <InfoItem icon={<Award />} label="Status Akreditasi" value={`Grade ${sekolah?.akreditasi || 'N/A'}`} />
                  <InfoItem icon={<Mail />} label="Email " value={sekolah?.email_login} />
                  <InfoItem icon={<Info />} label="Status Lembaga" value={sekolah?.status ? "AKTIF" : "NON-AKTIF"} />
                </div>

                <div className="p-8 bg-gray-50/50 rounded-[2.5rem] border border-gray-100">
                  <span className="text-[#0AC4E0] font-black text-[9px] uppercase mb-3 block tracking-widest italic">Alamat Sekolah</span>
                  <p className="text-sm font-bold text-gray-600 leading-relaxed uppercase">
                    {sekolah?.alamat || "Alamat belum diperbarui dalam sistem."}
                  </p>
                </div>
              </div>
              {/* Kolom Statistik - Warna Baru #0AC4E0 */}
              <div className="p-8 bg-[#0AC4E0] rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-cyan-900/20 flex flex-col justify-center">
                <div className="relative z-10 space-y-8">
                  <div className="border-b border-white/20 pb-6">
                    <p className="text-5xl font-black tracking-tighter leading-none mb-1">{sekolah?.jumlah_guru || 0}</p>
                    <p className="text-[9px] font-black uppercase opacity-70 tracking-widest">Tenaga Pengajar (Guru)</p>
                  </div>
                  <div>
                    <p className="text-5xl font-black tracking-tighter leading-none mb-1">{sekolah?.jumlah_siswa || 0}</p>
                    <p className="text-[9px] font-black uppercase opacity-70 tracking-widest">Siswa Terdaftar</p>
                  </div>
                </div>
                <Building2 size={120} className="absolute -bottom-6 -right-6 opacity-10" />
              </div>

            </div>
          </div>
        </Card>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}</style>
    </PageWrapper>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center gap-4">
    {/* Icon background disesuaikan ke biru cerah */}
    <div className="text-[#0AC4E0] p-2 bg-cyan-50 rounded-lg">{icon}</div>
    <div>
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5 leading-none">{label}</p>
      <p className="text-xs font-black text-gray-800 uppercase truncate">{value || "-"}</p>
    </div>
  </div>
);

export default ProfilSekolah;