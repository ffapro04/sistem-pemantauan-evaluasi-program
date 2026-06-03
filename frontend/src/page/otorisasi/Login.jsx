/* eslint-disable no-unused-vars */
import React, { useState } from "react";
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
  LogIn,
  ArrowLeft,
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

const getRedirectPath = (decoded) => {
  const role = String(decoded.role || decoded.nama_role || "")
    .trim()
    .toLowerCase();

  const jenis = String(decoded.jenis || "")
    .trim()
    .toLowerCase();

  const jabatan = String(decoded.jabatan || "")
    .trim()
    .toLowerCase();

  const idRole = Number(decoded.id_role || decoded.role_id || 0);

  console.log("ROLE CHECK:", {
    role,
    jenis,
    jabatan,
    idRole,
  });

  // ADMIN + PENGURUS
  if (
    idRole === 1 ||
    idRole === 2 ||
    role === "admin" ||
    role === "pengurus" ||
    jabatan.includes("admin") ||
    jabatan.includes("pengurus")
  ) {
    return "/admin/dashboard";
  }

  // HEAD OFFICE
  if (
    idRole === 3 ||
    role === "ho" ||
    role.includes("head office") ||
    jabatan.includes("head office") ||
    jabatan.includes("ho")
  ) {
    if (jenis.includes("non")) return "/ho/dashboard/non-akademik";
    return "/ho/dashboard/akademik";
  }

  // AREA OFFICER
  if (
    idRole === 4 ||
    role === "ao" ||
    role.includes("area officer") ||
    jabatan.includes("area officer")
  ) {
    return "/ao/dashboard";
  }

  // SEKOLAH
  if (
    idRole === 5 ||
    role === "sekolah" ||
    role === "institusi" ||
    jenis === "sekolah" ||
    jabatan.includes("sekolah") ||
    jabatan.includes("institusi")
  ) {
    return "/sekolah/dashboard";
  }

  // VENDOR
  if (
    idRole === 6 ||
    role === "vendor" ||
    jabatan.includes("vendor")
  ) {
    return "/vendor/dashboard";
  }

  // KEPALA DINAS
  if (
    idRole === 7 ||
    role.includes("kepala dinas") ||
    role.includes("dinas") ||
    jabatan.includes("kepala dinas") ||
    jabatan.includes("dinas")
  ) {
    return "/kepaladinas/dashboard";
  }

  // GURU ASSESSMENT
  // Guru tetap masuk lewat akun sekolah + mini login guru.
  // Kalau role ini tidak sengaja login lewat halaman utama, arahkan ke dashboard sekolah.
  if (
    idRole === 8 ||
    role.includes("guru") ||
    jabatan.includes("guru")
  ) {
    return "/sekolah/dashboard";
  }

  return "/login";
};
const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(null);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:3000/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      const token = res.data.access_token || res.data.token;

      if (!token) {
        throw new Error("Token tidak ditemukan dari server");
      }

      localStorage.setItem("token", token);

      const decoded = jwtDecode(token);
      localStorage.setItem("user", JSON.stringify(decoded));

      const redirectPath = getRedirectPath(decoded);

      console.log("LOGIN DECODED:", decoded);
      console.log("REDIRECT TARGET:", redirectPath);

      setIsSuccess(true);

      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 900);
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setLoading(false);
      setIsSuccess(false);
      alert(err.response?.data?.message || "Gagal Masuk: Kredensial tidak valid.");
    }
  };

  return (
    <PageWrapper className="!p-0 flex h-screen w-full overflow-hidden bg-[#F6F8FB] font-sans">
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="login-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              filter: "blur(10px)",
              transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
            }}
            className="relative h-full w-full overflow-hidden"
          >
            <div className="absolute inset-0 flex">
              <div className="h-full w-[48%] bg-[#F6F8FB]" />

              <div className="relative hidden h-full flex-1 overflow-hidden lg:block">
                <img
                  src={library_YPAMDR}
                  className="h-full w-full object-cover"
                  alt="Library YPA-MDR"
                />

                <div className="absolute inset-0 bg-gradient-to-br from-slate-950/45 via-[#0AC4E0]/10 to-slate-950/65" />
                <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(10,196,224,0.18)_0%,transparent_36%,rgba(15,23,42,0.25)_100%)]" />

                <div className="absolute right-10 top-10 grid grid-cols-6 gap-2 opacity-45">
                  {Array.from({ length: 36 }).map((_, index) => (
                    <span
                      key={index}
                      className="h-1.5 w-1.5 rounded-full bg-[#0AC4E0]"
                    />
                  ))}
                </div>

                <div className="absolute bottom-10 right-12 max-w-[510px] text-right text-white">
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/55">
                    Yayasan Pendidikan Astra Michael D. Ruslim
                  </p>

                  <h2 className="mt-4 text-[35px] font-black leading-tight tracking-[-0.055em]">
                    Monitoring program yang lebih terarah dan terukur.
                  </h2>

                  <p className="ml-auto mt-4 max-w-[420px] text-[13px] font-semibold leading-6 text-white/70">
                    Progres program, dokumen, validasi, dan evaluasi dapat
                    dipantau dalam satu alur kerja.
                  </p>

                  <div className="mt-7 flex justify-end gap-5">
                    {[pilar1, pilar2, pilar3, pilar4].map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        className="h-9 w-9 object-contain brightness-0 invert opacity-55 transition hover:opacity-100"
                        alt="pilar"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex h-full w-full">
              <section className="flex h-full w-full items-center justify-center px-7 py-7 lg:w-[48%]">
                <div className="paper-sheet relative w-full max-w-[500px] px-9 py-9 lg:px-11 lg:py-10">
                  <div className="absolute left-1/2 top-0 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0AC4E0] shadow-[0_12px_22px_rgba(10,196,224,0.32)] ring-4 ring-white/80" />

                  <div className="mb-10 flex items-center gap-5">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.35rem] bg-white/40">
                      <img
                        src={logo_ypamdr_blue}
                        className="h-14 object-contain"
                        alt="Logo YPA-MDR"
                      />
                    </div>

                    <div className="h-20 w-px bg-slate-300/70" />

                    <div className="min-w-0">
                      <p className="text-[25px] font-black leading-[1.12] tracking-[-0.04em] text-slate-800">
                        Sistem
                      </p>

                      <p className="text-[25px] font-black leading-[1.12] tracking-[-0.04em] text-slate-800">
                        Pemantauan dan
                      </p>

                      <p className="text-[25px] font-black leading-[1.12] tracking-[-0.04em] text-[#0AC4E0]">
                        Evaluasi Program
                      </p>
                    </div>
                  </div>

                  <div className="mb-7">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0AC4E0]">
                      Login Sistem
                    </p>

                    <h1 className="mt-2 text-[42px] font-black leading-none tracking-[-0.06em] text-slate-900">
                      Masuk
                    </h1>

                    <p className="mt-3 max-w-sm text-[12px] font-semibold leading-6 text-slate-500">
                      Gunakan akun yang telah terdaftar sesuai peran pengguna.
                    </p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-8">
                    <div>
                      <div className="mb-2 flex items-center gap-3">
                        <Mail
                          size={18}
                          className={
                            focused === "email"
                              ? "text-[#0AC4E0]"
                              : "text-slate-500"
                          }
                        />

                        <Label
                          text="Email"
                          className="!mb-0 !text-[13px] !font-black !text-slate-700"
                        />
                      </div>

                      <div className="relative">
                        <Input
                          type="email"
                          placeholder="nama@ypamdr.or.id"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              email: e.target.value,
                            })
                          }
                          onFocus={() => setFocused("email")}
                          onBlur={() => setFocused(null)}
                          className="paper-line-input !h-11 !rounded-none !border-0 !border-b !bg-transparent !px-0 !pb-3 !text-[14px] !font-bold !text-slate-700 !shadow-none !outline-none"
                        />

                        <span
                          className={`absolute bottom-0 left-0 h-[2px] rounded-full bg-[#0AC4E0] transition-all duration-300 ${focused === "email" ? "w-full" : "w-0"
                            }`}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center gap-3">
                        <Lock
                          size={18}
                          className={
                            focused === "password"
                              ? "text-[#0AC4E0]"
                              : "text-slate-500"
                          }
                        />

                        <Label
                          text="Password"
                          className="!mb-0 !text-[13px] !font-black !text-slate-700"
                        />
                      </div>

                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Masukkan password Anda"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          onFocus={() => setFocused("password")}
                          onBlur={() => setFocused(null)}
                          className="paper-line-input !h-11 !rounded-none !border-0 !border-b !bg-transparent !px-0 !pb-3 !pr-10 !text-[14px] !font-bold !text-slate-700 !shadow-none !outline-none"
                        />

                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-0 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-cyan-50 hover:text-[#0AC4E0]"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>

                        <span
                          className={`absolute bottom-0 left-0 h-[2px] rounded-full bg-[#0AC4E0] transition-all duration-300 ${focused === "password" ? "w-full" : "w-0"
                            }`}
                        />
                      </div>
                    </div>

                    <div className="space-y-3 pt-1">
                      <Button
                        text={loading ? "Proses..." : "Masuk"}
                        icon={
                          loading ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <LogIn size={18} />
                          )
                        }
                        type="submit"
                        disabled={loading}
                        className="!h-14 !w-full !rounded-[1rem] !bg-[#0AC4E0] !text-[12px] !font-black !uppercase !tracking-[0.18em] !text-white !shadow-[0_16px_34px_rgba(10,196,224,0.25)] transition hover:!bg-[#08AFC8] active:scale-[0.99] disabled:!opacity-70"
                      />

                      <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="mx-auto flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-[12px] font-black text-slate-500 transition hover:bg-white/60 hover:text-[#0AC4E0]"
                      >
                        <ArrowLeft size={16} />
                        Kembali
                      </button>
                    </div>
                  </form>

                  <div className="mt-8 flex items-center justify-center gap-3 text-center opacity-55">
                    <Activity size={14} className="text-[#0AC4E0]" />

                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                      Yayasan Pendidikan Astra
                    </span>
                  </div>
                </div>
              </section>
            </div>
          </motion.div>
        ) : (
          <motion.div
              key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
              className="flex h-full w-full flex-col items-center justify-center bg-white"
          >
              <motion.h2
                initial={{ y: 18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.12, duration: 0.5 }}
                className="px-6 text-center text-3xl font-black tracking-tight text-slate-900 md:text-4xl"
              >
                Sistem Pemantauan dan Evaluasi Program
              </motion.h2>

              <motion.p
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.22, duration: 0.5 }}
                className="mt-3 text-center text-sm font-semibold text-slate-400"
              >
                Login berhasil, mengarahkan ke dashboard...
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.42, duration: 0.35 }}
                className="mt-10"
              >
                <Loader2
                  className="h-12 w-12 animate-spin text-[#0AC4E0]"
                  strokeWidth={3}
                />
              </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .paper-sheet {
              background:
                radial-gradient(circle at 18% 16%, rgba(255,255,255,0.72), transparent 20%),
                radial-gradient(circle at 82% 22%, rgba(15,23,42,0.035), transparent 18%),
                radial-gradient(circle at 22% 78%, rgba(15,23,42,0.045), transparent 20%),
                linear-gradient(135deg, rgba(255,255,255,0.96), rgba(248,250,252,0.9));
              box-shadow:
                0 28px 60px rgba(15, 23, 42, 0.16),
                0 8px 18px rgba(15, 23, 42, 0.08);
              filter: drop-shadow(0 16px 18px rgba(15,23,42,0.10));
              border: 1px solid rgba(226, 232, 240, 0.85);
              border-radius: 18px;
            }

            .paper-sheet::before {
              content: "";
              position: absolute;
              inset: 0;
              pointer-events: none;
              border-radius: inherit;
              opacity: 0.45;
              background-image:
                linear-gradient(115deg, transparent 0%, rgba(15,23,42,0.04) 18%, transparent 32%),
                linear-gradient(72deg, transparent 0%, rgba(255,255,255,0.55) 36%, transparent 51%),
                repeating-linear-gradient(
                  0deg,
                  rgba(15,23,42,0.035) 0px,
                  rgba(15,23,42,0.035) 1px,
                  transparent 1px,
                  transparent 7px
                );
              mix-blend-mode: multiply;
            }

            .paper-sheet::after {
              content: "";
              position: absolute;
              inset: -1px;
              pointer-events: none;
              border-radius: inherit;
              background:
                linear-gradient(90deg, rgba(255,255,255,0.92), transparent 12%, transparent 88%, rgba(15,23,42,0.04)),
                linear-gradient(0deg, rgba(15,23,42,0.06), transparent 10%, transparent 90%, rgba(255,255,255,0.72));
              opacity: 0.45;
            }

            .paper-line-input {
              border-bottom-color: rgba(51, 65, 85, 0.55) !important;
            }

            .paper-line-input::placeholder {
              color: rgba(100, 116, 139, 0.52) !important;
              font-weight: 600 !important;
            }

            .paper-line-input:focus {
              box-shadow: none !important;
              border-bottom-color: rgba(51, 65, 85, 0.55) !important;
            }

            @media (max-height: 760px) {
              .paper-sheet {
                transform: scale(0.94);
              }
            }
          `,
        }}
      />
    </PageWrapper>
  );
};

export default Login;