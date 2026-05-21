/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import {
  ChevronLeft,
  Fingerprint,
  Mail,
  KeyRound,
  Shield,
  ArrowUpRight,
  Sparkles,
  CheckCircle,
  Lock,
  Eye,
  EyeOff,
  User,
  Activity,
} from "lucide-react";
import Swal from "sweetalert2";

// ATOMIC COMPONENTS
import Input from "../../components/Input";
import Button from "../../components/Button";
import PageWrapper from "../../components/PageWrapper";
import Label from "../../components/Label";

// ASSETS
import logo_ypamdr_blue from "../../assets/img/YPA-MDR-LOGO.png";
import akademikBg from "../../assets/img/akademik.jpg";
import karakterBg from "../../assets/img/karakter.jpg";
import kecakapanhidupBg from "../../assets/img/kecakapanhidup.jpeg";
import senibudayaBg from "../../assets/img/senibudaya.jpg";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [activePillar, setActivePillar] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const navigate = useNavigate();

  const PRIMARY_BLUE = "#1E5AA5";
  const ERROR_RED = "#ef4444";

  const pillars = [
    {
      title: "Akademik",
      image: akademikBg,
      desc: "Meningkatkan kualitas pendidikan melalui berbagai program, salah satunya dengan memberikan pelatihan akademik untuk meningkatkan kompetensi sumber daya manusia (SDM) di lingkungan sekolah binaan.",
    },
    {
      title: "Karakter",
      image: karakterBg,
      desc: "Warga sekolah diberikan pembinaan untuk mengembangkan karakter yang berlandaskan nilai-nilai luhur bangsa Indonesia.",
    },
    {
      title: "Kecakapan Hidup",
      image: kecakapanhidupBg,
      desc: "Siswa dibekali dengan kecakapan hidup agar dapat meningkatkan perekonomian di daerahnya",
    },
    {
      title: "Seni Budaya",
      image: senibudayaBg,
      desc: "Pembinaan seni budaya diberikan agar seni budaya lokal dapat dilestarikan",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePillar((prev) => (prev + 1) % pillars.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Animasi loading progress bar zig zag
  useEffect(() => {
    let interval;
    if (loading) {
      setLoadingProgress(0);
      interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          // Increment random antara 5-15% biar efek zig zag
          const increment = Math.floor(Math.random() * 15) + 5;
          return Math.min(prev + increment, 100);
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX - innerWidth / 2) / 80;
    const y = (clientY - innerHeight / 2) / 80;
    setMousePosition({ x, y });
  };

  const getTargetPath = (decoded) => {
    console.log("Isi decoded token:", decoded);

    // Ambil ID Role dan pastikan jadi angka
    const id_role = Number(decoded.id_role);
    const jenis = String(decoded.jenis || "").trim().toLowerCase();

    console.log("Role ID:", id_role);

    if (id_role === 1) {
      return "/admin/dashboard";
    } 
    if (id_role === 2) {
      return "/pengurus/dashboard"; 
    } 
    if (id_role === 3) {
      return jenis === "akademik"
        ? "/ho/dashboard/akademik"
        : "/ho/dashboard/non-akademik";
    }

    if (id_role === 7) {
      return "/kadin/dashboard";

    }
    return "/sekolah/dashboard";
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:3000/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      const token = res.data.access_token;
      localStorage.setItem("token", token);
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("savedEmail", formData.email);
      }
      const decoded = jwtDecode(token);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      Swal.fire({
        html: `
        <style>
          .auth-container { font-family: 'Poppins', sans-serif; display: flex; flex-direction: column; align-items: center; padding: 40px 20px; }
          .logo-text { font-size: 32px; font-weight: 900; color: ${PRIMARY_BLUE}; letter-spacing: 3px; margin-bottom: 8px; }
          .subtitle-text { font-size: 9px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 30px; text-align: center; }
          .loader-wrapper { width: 180px; height: 3px; background: #f3f4f6; border-radius: 10px; overflow: hidden; position: relative; }
          .loader-bar { width: 0%; height: 100%; background: ${PRIMARY_BLUE}; animation: fillBar 1.8s forwards; }
          @keyframes fillBar { 100% { width: 100%; } }
        </style>
        <div class="auth-container">
          <h1 class="logo-text">YPA-MDR</h1>
          <p class="subtitle-text">Sistem Pemantauan dan Evaluasi Program</p>
          <div class="loader-wrapper"><div class="loader-bar"></div></div>
        </div>`,
        background: "#ffffff",
        showConfirmButton: false,
        timer: 2500,
        width: "400px",
        customClass: { popup: "rounded-[2.5rem] shadow-2xl" },
      });

      const targetPath = getTargetPath(decoded);
      setTimeout(() => navigate(targetPath), 2500);
    } catch (err) {
      const errorData = err.response?.data;
      let serverMessage = "INVALID CREDENTIALS";

      if (errorData?.message) {
        serverMessage = Array.isArray(errorData.message)
          ? errorData.message.join(" | ")
          : errorData.message;
      }

      Swal.fire({
        html: `
        <style>
          .auth-container { font-family: 'Poppins', sans-serif; display: flex; flex-direction: column; align-items: center; padding: 40px 20px; }
          .logo-text-error { font-size: 32px; font-weight: 900; color: white; -webkit-text-stroke: 1px ${ERROR_RED}; letter-spacing: 3px; margin-bottom: 8px; animation: shake 0.4s both; }
          .error-msg { margin-top: 20px; font-size: 11px; font-weight: 800; color: ${ERROR_RED}; text-transform: uppercase; text-align: center; line-height: 1.5; }
          @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } }
        </style>
        <div class="auth-container">
          <h1 class="logo-text-error">YPA-MDR</h1>
          <p class="error-msg">ACCESS DENIED:<br>${serverMessage}</p>
        </div>`,
        background: "#ffffff",
        showConfirmButton: true,
        confirmButtonText: "RETRY",
        confirmButtonColor: ERROR_RED,
        width: "400px",
        customClass: {
          popup: "rounded-[2.5rem] shadow-2xl",
          confirmButton:
            "rounded-full px-8 py-2 text-[10px] font-black tracking-widest",
        },
      });
    } finally {
      setLoading(false);
      setLoadingProgress(0);
    }
  };
  // Komponen Loading Zig Zag Bar
  const LoadingZigZagBar = () => (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={10} className="text-[#1E5AA5] animate-pulse" />
          <span className="text-[8px] text-gray-400 uppercase tracking-wider">
            Verifying Credentials
          </span>
        </div>
        <span className="text-[8px] font-mono text-[#1E5AA5]">
          {loadingProgress}%
        </span>
      </div>

      {/* Zig Zag Progress Bar Container */}
      <div className="relative h-1 bg-gray-100 rounded-full overflow-hidden">
        {/* Main Progress Bar */}
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#1E5AA5] via-[#3B82F6] to-[#1E5AA5] rounded-full"
          style={{ width: `${loadingProgress}%` }}
          initial={{ width: "0%" }}
          animate={{ width: `${loadingProgress}%` }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />

        {/* Zig Zag Effect - Garis horizontal bergerak */}
        <motion.div
          className="absolute inset-y-0 w-2 bg-white/40"
          animate={{
            left: [`${loadingProgress - 5}%`, `${loadingProgress + 5}%`],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ left: `${loadingProgress}%` }}
        />
      </div>

      {/* Zig Zag Pattern di bawah progress bar */}
      <div className="flex justify-between items-center">
        <div className="flex gap-[2px]">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="w-[3px] h-[2px] bg-gray-200 rounded-full"
              animate={{
                opacity: loadingProgress > i * 5 ? [0.3, 1, 0.3] : 0.2,
                scale: loadingProgress > i * 5 ? [1, 1.5, 1] : 1,
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.05,
              }}
            />
          ))}
        </div>
        <div className="flex gap-[2px]">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="w-[3px] h-[2px] bg-gray-200 rounded-full"
              animate={{
                opacity: loadingProgress > i * 5 ? [0.3, 1, 0.3] : 0.2,
                scale: loadingProgress > i * 5 ? [1, 1.5, 1] : 1,
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.05 + 0.4,
              }}
            />
          ))}
        </div>
      </div>

      {/* Loading Steps Text */}
      <div className="flex justify-between text-[6px] text-gray-300 uppercase tracking-wider mt-1">
        <span className={loadingProgress > 20 ? "text-[#1E5AA5]" : ""}>
          Auth
        </span>
        <span className={loadingProgress > 40 ? "text-[#1E5AA5]" : ""}>
          Token
        </span>
        <span className={loadingProgress > 60 ? "text-[#1E5AA5]" : ""}>
          Role
        </span>
        <span className={loadingProgress > 80 ? "text-[#1E5AA5]" : ""}>
          Redirect
        </span>
      </div>
    </div>
  );

  return (
    <PageWrapper className="!p-0 h-screen w-full flex overflow-hidden select-none bg-white">
      {/* LEFT PANEL - DARKER OVERLAY FOR BETTER CONTRAST */}
      <div
        className="hidden lg:flex lg:w-[65%] relative overflow-hidden"
        onMouseMove={handleMouseMove}
      >
        {/* Background with Parallax */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePillar}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: mousePosition.x,
              y: mousePosition.y,
            }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 1.8, ease: [0.43, 0.13, 0.23, 0.96] }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${pillars[activePillar].image})` }}
          />
        </AnimatePresence>

        {/* Darker Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/30 z-10" />

        {/* Blue Accent Lines */}
        <div className="absolute top-0 right-0 w-1/3 h-px bg-gradient-to-l from-transparent via-[#1E5AA5]/40 to-transparent z-20" />
        <div className="absolute bottom-0 left-0 w-1/3 h-px bg-gradient-to-r from-transparent via-[#1E5AA5]/40 to-transparent z-20" />

        {/* Content */}
        <div className="relative z-30 w-full h-full flex flex-col justify-between p-20">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img
              src={logo_ypamdr_blue}
              alt="YPA-MDR"
              className="h-7 w-auto brightness-0 invert"
            />
          </motion.div>

          {/* Hero Section */}
          <div className="space-y-12">
            {/* Counter & Blue Line */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="space-y-3"
            >
              <p className="text-[#1E5AA5]/80 text-[9px] tracking-[0.4em] font-light font-mono">
                {String(activePillar + 1).padStart(2, "0")}.
                {String(pillars.length).padStart(2, "0")}
              </p>
              <div className="w-12 h-px bg-[#1E5AA5]/60" />
            </motion.div>

            {/* Title & Description */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activePillar}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -40, opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                className="space-y-6"
              >
                <h1 className="text-7xl xl:text-8xl font-light text-white tracking-tighter leading-[1.15]">
                  {pillars[activePillar].title}
                </h1>
                <p className="text-base text-white/50 font-light leading-relaxed max-w-md">
                  {pillars[activePillar].desc}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress Indicators */}
          <div className="flex gap-3">
            {pillars.map((_, idx) => (
              <motion.button
                key={idx}
                onClick={() => setActivePillar(idx)}
                className={`h-px transition-all duration-1000 ${
                  idx === activePillar ? "w-12 bg-[#1E5AA5]" : "w-6 bg-white/20"
                }`}
                animate={{
                  width: idx === activePillar ? 48 : 24,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - CLEAN PREMIUM FORM */}
      <div className="w-full lg:w-[35%] bg-white flex flex-col justify-center p-8 lg:p-12 relative shadow-xl">
        {/* Exit Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          onClick={() => navigate("/")}
          className="absolute top-8 right-8 flex items-center gap-1 text-[8px] text-gray-400 hover:text-[#1E5AA5] transition-colors tracking-wider z-10"
        >
          <span>EXIT</span>
          <ArrowUpRight size={10} />
        </motion.button>

        {/* Main Content */}
        <div className="relative z-10 w-full max-w-[380px] mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <div className="mb-4">
              <div className="inline-flex items-center gap-2">
                <div className="w-8 h-0.5 bg-[#1E5AA5]/30 rounded-full" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#1E5AA5]" />
                <div className="w-8 h-0.5 bg-[#1E5AA5]/30 rounded-full" />
              </div>
            </div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2 tracking-tight">
              Masuk
            </h1>
            <p className="text-[13px] text-gray-400">
              Silahkan login sesuai dengan otorisasi anda
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleLogin}
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Email Field */}
            <div className="group">
              <Label
                text="Email Address"
                className="!text-[10px] !font-medium !text-gray-500 !mb-2 block"
              />
              <div
                className={`relative border rounded-xl transition-all duration-300 ${
                  focusedField === "email"
                    ? "border-[#1E5AA5] shadow-md shadow-[#1E5AA5]/10"
                    : "border-gray-200 group-hover:border-gray-300"
                }`}
              >
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <User
                    size={16}
                    className={`transition-all duration-300 ${
                      focusedField === "email"
                        ? "text-[#1E5AA5]"
                        : "text-gray-400"
                    }`}
                  />
                </div>
                <Input
                  type="email"
                  placeholder="name@ypamdr.astra.co.id"
                  value={formData.email}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="!border-0 !bg-transparent !text-gray-900 w-full text-[14px] placeholder:text-gray-300 focus:outline-none !py-3.5 !pl-10 !pr-3"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="group">
              <Label
                text="Password"
                className="!text-[10px] !font-medium !text-gray-500 !mb-2 block"
              />
              <div
                className={`relative border rounded-xl transition-all duration-300 ${
                  focusedField === "password"
                    ? "border-[#1E5AA5] shadow-md shadow-[#1E5AA5]/10"
                    : "border-gray-200 group-hover:border-gray-300"
                }`}
              >
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Lock
                    size={16}
                    className={`transition-all duration-300 ${
                      focusedField === "password"
                        ? "text-[#1E5AA5]"
                        : "text-gray-400"
                    }`}
                  />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="!border-0 !bg-transparent !text-gray-900 w-full text-[14px] placeholder:text-gray-300 focus:outline-none !py-3.5 !pl-10 !pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1E5AA5] transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Forgot & Remember */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-3.5 h-3.5 border rounded transition-all duration-200 flex items-center justify-center cursor-pointer ${
                    rememberMe
                      ? "bg-[#1E5AA5] border-[#1E5AA5]"
                      : "border-gray-300 bg-white group-hover:border-gray-400"
                  }`}
                >
                  {rememberMe && (
                    <CheckCircle size={8} className="text-white" />
                  )}
                </div>
                <span className="text-[8px] text-gray-400 uppercase tracking-wider cursor-pointer group-hover:text-gray-500 transition-colors">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="text-[8px] text-[#1E5AA5] hover:text-[#164786] transition-colors uppercase tracking-wider"
                onClick={() =>
                  Swal.fire(
                    "Contact Administrator",
                    "Please contact your system administrator to reset your password",
                    "info",
                  )
                }
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button dengan Loading Zig Zag */}
            <div className="pt-2 space-y-4">
              {!loading ? (
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    text={
                      <div className="flex items-center justify-center gap-2">
                        <span>SIGN IN</span>
                        <ArrowUpRight size={12} />
                      </div>
                    }
                    type="submit"
                    disabled={loading}
                    className="w-full !py-3.5 !bg-[#1E5AA5] hover:!bg-[#164786] !text-white !rounded-xl !text-[10px] font-semibold tracking-wider transition-all duration-300 shadow-md hover:shadow-lg"
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full !py-4 !bg-gray-50 !rounded-xl !border !border-gray-100"
                >
                  <LoadingZigZagBar />
                </motion.div>
              )}
            </div>
          </motion.form>

          {/* Divider dengan Info Yayasan */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center">
              <div className="px-5 bg-white text-center">
                <p className="text-[9px] font-semibold text-gray-700 tracking-wide">
                  Yayasan Pendidikan Astra Michael D. Ruslim
                </p>
                <p className="text-[8px] text-gray-400 mt-1">
                  Sistem Pemantauan & Evaluasi Program
                </p>
              </div>
            </div>
          </div>

          {/* Footer Official Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 pt-4 border-t border-gray-50"
          >
            <div className="text-center">
              <a
                href="https://yayasanastra-ypamdr.or.id/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 group"
              >
                <span className="text-[8px] font-medium text-gray-400 group-hover:text-[#1E5AA5] transition-colors">
                  Official Website
                </span>
                <ArrowUpRight
                  size={8}
                  className="text-gray-300 group-hover:text-[#1E5AA5] transition-colors"
                />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Login;
