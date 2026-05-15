/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Activity,
  Sparkles,
  ArrowLeft,
  LogIn
} from "lucide-react";

// ASSETS
import pilar1 from "../../assets/img/1.png";
import pilar2 from "../../assets/img/2.png";
import pilar3 from "../../assets/img/3.png";
import pilar4 from "../../assets/img/4.png";
import logo_ypamdr_blue from "../../assets/img/YPA-MDR-LOGO.png";
import library_YPAMDR from "../../assets/img/library_YPAMDR.png";

// COMPONENTS
import PageWrapper from "../../components/PageWrapper";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Label from "../../components/Label";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(null);

  const navigate = useNavigate();
  const backgrounds = [library_YPAMDR];

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:3000/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      const token = res.data.access_token;
      localStorage.setItem("token", token);
      const decoded = jwtDecode(token);

      setIsSuccess(true);
      // Jeda sedikit lebih lama agar animasi loading terlihat premium
      setTimeout(() => {
        const role = String(decoded.role || "").toLowerCase();
        const jenis = String(decoded.jenis || "").toLowerCase();
        let target = (role === "admin") ? "/admin/dashboard" : (role === "ho") ? (jenis === "akademik" ? "/ho/dashboard/akademik" : "/ho/dashboard/non-akademik") : "/sekolah/dashboard";
        navigate(target);
      }, 2500);
    } catch (err) {
      setLoading(false);
      alert("Gagal Masuk: Kredensial tidak valid.");
    }
  };

  return (
    <PageWrapper className="!p-0 h-screen w-full flex bg-[#F8FAFC] overflow-hidden font-sans">
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="login-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ scale: 5, opacity: 0, filter: "blur(20px)", transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }}
            className="relative w-full h-full flex"
          >
            {/* ─── BACKGROUND & WAVY DIVIDER ─── */}
            <div className="absolute inset-0 z-0 flex">
              <div className="w-[45%] bg-white h-full" />
              <div className="w-[55%] relative h-full overflow-hidden">
                <img src={library_YPAMDR} className="w-full h-full object-cover" alt="Library" />
                <div className="absolute inset-0 bg-[#0AC4E0]/10 mix-blend-multiply" />
              </div>
              <svg
                className="absolute inset-y-0 left-[45%] h-full w-[120px] text-white fill-current translate-x-[-100%]"
                preserveAspectRatio="none" viewBox="0 0 100 100"
              >
                <path d="M100,0 C50,0 50,50 0,50 C50,50 50,100 100,100 Z" />
              </svg>
            </div>

            {/* ─── CONTENT LAYER ─── */}
            <div className="relative z-10 w-full h-full flex flex-col lg:flex-row">

              {/* SISI KIRI: FORM LOGIN */}
              <div className="w-full lg:w-[45%] h-full flex flex-col justify-between p-12 lg:p-20 bg-transparent">
                <div className="flex items-center gap-4">
                  <img src={logo_ypamdr_blue} className="h-10 object-contain" alt="Logo" />
                  <div className="w-px h-6 bg-slate-200" />
                  <a
                    href="https://yayasanastra-ypamdr.or.id/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] hover:text-[#0AC4E0] transition-colors"
                  >
                    Official YPAMDR
                  </a>
                </div>

                <div className="max-w-[420px] w-full text-left">
                  <header className="mb-10">
                    <h1 className="text-6xl font-black text-slate-800 tracking-tighter leading-none">
                      Masuk<br />
                    </h1>
                  </header>

                  <form onSubmit={handleLogin} className="space-y-8">
                    {/* INPUT EMAIL */}
                    <div className="space-y-2">
                      <Label text="Email Akun" className="!text-[11px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
                      <div className={`relative transition-all duration-300 ${focused === 'email' ? 'scale-[1.02]' : ''}`}>
                        <Input
                          type="email"
                          placeholder="nama@ypamdr.or.id"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          onFocus={() => setFocused('email')}
                          onBlur={() => setFocused(null)}
                          className={`!h-16 !pl-14 !rounded-2xl !border-2 !text-base !font-bold ${focused === 'email' ? '!border-[#0AC4E0] !bg-white shadow-2xl shadow-cyan-100/50' : '!border-slate-100 !bg-slate-50/50'}`}
                        />
                        <Mail size={20} className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${focused === 'email' ? 'text-[#0AC4E0]' : 'text-slate-300'}`} />
                      </div>
                    </div>

                    {/* INPUT PASSWORD */}
                    <div className="space-y-2">
                      <Label text="Kata Sandi" className="!text-[11px] !font-black !text-slate-400 !uppercase !tracking-widest !ml-2" />
                      <div className={`relative transition-all duration-300 ${focused === 'password' ? 'scale-[1.02]' : ''}`}>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          onFocus={() => setFocused('password')}
                          onBlur={() => setFocused(null)}
                          className={`!h-16 !pl-14 !pr-14 !rounded-2xl !border-2 !text-base !font-bold ${focused === 'password' ? '!border-[#0AC4E0] !bg-white shadow-2xl shadow-cyan-100/50' : '!border-slate-100 !bg-slate-50/50'}`}
                        />
                        <Lock size={20} className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${focused === 'password' ? 'text-[#0AC4E0]' : 'text-slate-300'}`} />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#0AC4E0]"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    {/* BUTTONS */}
                    <div className="pt-4 flex items-center gap-4">
                      <Button
                        text="Kembali"
                        variant="outline"
                        onClick={() => navigate("/")}
                        className="!flex-1 !h-16 !rounded-2xl !text-[11px] !font-black !uppercase !tracking-[0.2em] !border-slate-200 !text-slate-400 hover:!bg-slate-50"
                      />
                      <Button
                        text={loading ? "Proses..." : "Masuk"}
                        icon={!loading && <LogIn size={18} />}
                        onClick={handleLogin}
                        disabled={loading}
                        className="!flex-1 !h-16 !bg-[#0AC4E0] hover:!bg-[#00889A] !text-white !rounded-2xl !text-[12px] !font-black !uppercase !tracking-[0.2em] shadow-xl shadow-cyan-200 active:scale-95 transition-all"
                      />
                    </div>
                  </form>
                </div>

                <div className="flex items-center gap-3 opacity-40">
                  <Activity size={14} className="text-slate-400" />
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Sistem Pemantauan dan Evaluasi Program</span>
                </div>
              </div>

              {/* SISI KANAN BAWAH: PILAR CATUR DHARMA */}
              <div className="hidden lg:flex flex-1 items-end justify-end p-12 lg:p-16">
                <div className="flex flex-col items-end gap-5">
                  <p className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em]">Yayasan Pendidikan Astra Michael D.Ruslim</p>
                  <div className="flex gap-6">
                    {[pilar1, pilar2, pilar3, pilar4].map((src, i) => (
                      <img
                        key={i} src={src}
                        className="h-9 w-9 object-contain brightness-0 invert opacity-40 hover:opacity-100 transition-all duration-500"
                        alt="pilar"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ─── ANIMASI TRANSISI SUKSES (VERSI TERBARU) ─── */
          <motion.div
              key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center w-full h-full bg-white"
          >
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight text-center px-6"
              >
                Sistem Pemantauan dan Evaluasi Program
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mt-12"
              >
                <Loader2 className="w-14 h-14 text-[#0AC4E0] animate-spin" strokeWidth={3} />
              </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
};

export default Login;