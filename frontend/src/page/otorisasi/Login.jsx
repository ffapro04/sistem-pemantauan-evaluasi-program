/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  ArrowLeft,
  ChevronDown,
  School,
  User,
  Search,
  KeyRound,
  X,
} from "lucide-react";

import logo_ypamdr_blue from "../../assets/img/YPA-MDR-LOGO.png";
import library_YPAMDR from "../../assets/img/library_YPAMDR.optimized.jpg";

// COMPONENTS
import PageWrapper from "../../components/PageWrapper";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Label from "../../components/Label";
import AppIconButton from "../../components/ui/AppIconButton";
import { setAuthSession } from "../../utils/authSession";

import { API_BASE_URL } from "../../config/apiBase.js";
import { ROLE_ADMIN, ROLE_PENGURUS, ROLE_VENDOR, ROLE_SEKOLAH } from "../../constants/roles.js";

// =========================================================================
// DAFTAR JENIS LOGIN
// =========================================================================
const ROLE_OPTIONS = [
  { value: "sistem", label: "Akun Sistem" },
  { value: "guru", label: "Guru Assessment" },
];

const normalizeText = (value = "") => String(value || "").trim().toLowerCase();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const isValidEmailFormat = (value = "") => EMAIL_REGEX.test(String(value).trim());

const showValidationError = (message) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 2200,
    pauseOnHover: true,
    draggable: true,
  });
};

const getLoginErrorMessage = (err) => {
  const serverMessage =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message;

  if (err?.response?.status === 400) {
    return serverMessage || "Data login belum sesuai.";
  }

  if (err?.response?.status === 401 || err?.response?.status === 403) {
    return "Email atau password salah.";
  }

  return serverMessage || "Gagal masuk. Periksa kembali kredensial Anda.";
};

const getResetPasswordErrorMessage = (error) => {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "";

  if (error?.response?.status === 503) {
    return message || "Email OTP belum siap. Periksa konfigurasi Gmail pengirim di backend .env.";
  }

  if (error?.response?.status >= 500) {
    return message || "Server belum bisa mengirim OTP. Periksa konfigurasi email backend.";
  }

  return message || "Gagal memproses lupa password.";
};

const getDecodedRoleInfo = (decoded = {}) => {
  const idRole = Number(decoded.id_role || decoded.role_id || 0);
  const role = normalizeText(decoded.role || decoded.nama_role);
  const jabatan = normalizeText(decoded.jabatan);
  const jenis = normalizeText(decoded.jenis);
  return { idRole, role, jabatan, jenis };
};

const isRoleMatch = (selectedRole, decoded = {}) => {
  const { idRole, role, jabatan } = getDecodedRoleInfo(decoded);
  switch (selectedRole) {
    case "Admin":
      return idRole === 1 || role === ROLE_ADMIN;
    case "Pengurus":
      return idRole === 2 || role === ROLE_PENGURUS;
    case "Head Office":
      return idRole === 3 || role.includes("head office");
    case "Area Officer":
      return idRole === 4 || role.includes("area officer");
    case "Sekolah":
      return (
        idRole === 5 &&
        !jabatan.includes("operator") &&
        !jabatan.includes("kepala sekolah")
      );
    case "Kepala Sekolah":
      return (
        idRole === 10 ||
        role.includes("kepala sekolah") ||
        jabatan.includes("kepala sekolah")
      );
    case "Vendor":
      return idRole === 6 || role === ROLE_VENDOR;
    case "Kepala Dinas":
      return idRole === 7 || role.includes("kepala dinas");
    case "Guru Assessment":
      return idRole === 8 || role.includes("guru");
    case "Operator Sekolah":
      return (
        idRole === 5 ||
        idRole === 9 ||
        jabatan.includes("operator sekolah") ||
        jabatan.includes("operator")
      );
    default:
      return false;
  }
};

// =========================================================================
// REDIRECT BERDASARKAN JWT
// =========================================================================
const getRedirectPath = (decoded) => {
  const idRole = Number(decoded.id_role || decoded.role_id || 0);

  const role = String(decoded.role || decoded.nama_role || "")
    .trim()
    .toLowerCase();

  const jenis = String(decoded.jenis || "")
    .trim()
    .toLowerCase();

  const jabatan = String(decoded.jabatan || "")
    .trim()
    .toLowerCase();

  // Admin
  if (idRole === 1 || role === ROLE_ADMIN) {
    return "/admin/dashboard";
  }

  // Pengurus
  if (idRole === 2 || role === ROLE_PENGURUS) {
    return "/pengurus/dashboard";
  }

  // Head Office
  if (idRole === 3 || role.includes("head office")) {
    return jenis.includes("non")
      ? "/ho/dashboard/non-akademik"
      : "/ho/dashboard/akademik";
  }

  // Area Officer
  if (idRole === 4 || role.includes("area officer")) {
    return "/ao/dashboard";
  }

  // Operator Sekolah
  if (
    idRole === 10 ||
    role.includes("kepala sekolah") ||
    jabatan.includes("kepala sekolah")
  ) {
    return "/kepala-sekolah/dashboard";
  }

  // Operator Sekolah
  if (
    idRole === 5 ||
    idRole === 9 ||
    role.includes("operator") ||
    jabatan.includes("operator sekolah") ||
    jabatan.includes("operator")
  ) {
    return "/sekolah/dashboard";
  }

  // Sekolah
  if (idRole === 5 || role === ROLE_SEKOLAH) {
    return "/sekolah/dashboard";
  }

  // Vendor / Narasumber
  if (idRole === 6 || role === ROLE_VENDOR || role.includes("narasumber")) {
    return "/vendor/dashboard";
  }

  // Kepala Dinas
  if (idRole === 7 || role.includes("kepala dinas")) {
    return "/kepala-dinas/dashboard";
  }

  // Guru Assessment
  if (idRole === 8 || role.includes("guru")) {
    return "/sekolah/dashboard";
  }

  return "/login";
};

// =========================================================================
// KOMPONEN DROPDOWN ROLE
// =========================================================================
const RoleDropdown = ({ selectedRole, onSelect }) => {
  const [open, setOpen] = useState(false);
  const selected = ROLE_OPTIONS.find((role) => role.label === selectedRole);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-[0.9rem] border border-slate-200 bg-white/70 px-4 py-3 text-left text-[13px] font-black text-slate-700 shadow-sm transition hover:border-[#0AC4E0]/40 hover:bg-white"
      >
        <span className={selected ? "text-slate-800" : "text-slate-400"}>
          {selected ? selected.label : "Pilih jenis login"}
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""
            }`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-[0.9rem] border border-slate-100 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
          >
            {ROLE_OPTIONS.map((role, index) => (
              <li key={`${role.label}-${index}`}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(role.label);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-[12px] font-black transition-colors ${selectedRole === role.label
                    ? "bg-[#0AC4E0]/10 text-[#0AC4E0]"
                    : "text-slate-600 hover:bg-slate-50"
                    } ${role.value === "guru" ? "border-t border-slate-100" : ""}`}
                >
                  {role.value === "guru" ? (
                    <School size={13} className="shrink-0 text-[#0AC4E0]" />
                  ) : (
                    <User size={13} className="shrink-0 text-[#0AC4E0]" />
                  )}
                  {role.label}
                  {role.value === "sistem" && (
                    <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-slate-500">
                      Role otomatis
                    </span>
                  )}
                  {role.value === "guru" && (
                    <span className="ml-auto rounded-full bg-[#0AC4E0]/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-[#0AC4E0]">
                      Guru
                    </span>
                  )}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

RoleDropdown.propTypes = {
  selectedRole: PropTypes.string,
  onSelect: PropTypes.func,
};

const RoleSuggestion = ({ selectedRole, onSelect }) => (
  <div className="grid grid-cols-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5">
    {ROLE_OPTIONS.map((role) => {
      const active = selectedRole === role.label;
      const isGuruRole = role.value === "guru";

      return (
        <button
          key={role.value}
          type="button"
          onClick={() => onSelect(role.label)}
          className={`group flex h-12 items-center justify-center gap-2 rounded-xl px-3 text-center transition ${active
            ? "bg-white text-[#0AC4E0] shadow-[0_10px_22px_rgba(15,23,42,0.08)]"
            : "text-slate-500 hover:bg-white/70 hover:text-slate-800"
            }`}
        >
          {isGuruRole ? <School size={16} /> : <User size={16} />}
          <span className="truncate text-[11px] font-black uppercase tracking-widest">
            {role.label}
          </span>
        </button>
      );
    })}
  </div>
);

RoleSuggestion.propTypes = {
  selectedRole: PropTypes.string,
  onSelect: PropTypes.func,
};

// =========================================================================
// KOMPONEN DROPDOWN SEKOLAH UNTUK LOGIN GURU
// =========================================================================
const SekolahDropdown = ({
  sekolahList = [],
  selectedId,
  onSelect,
  loading = false,
}) => {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");

  const selected = sekolahList.find(
    (sekolah) => String(sekolah.id_sekolah) === String(selectedId)
  );

  const filteredSekolah = useMemo(() => {
    const search = normalizeText(keyword);
    if (!search) return sekolahList;
    return sekolahList.filter((sekolah) => {
      const nama = normalizeText(sekolah.nama_sekolah);
      const npsn = normalizeText(sekolah.npsn);
      const jenjang = normalizeText(sekolah.jenjang);
      return (
        nama.includes(search) ||
        npsn.includes(search) ||
        jenjang.includes(search)
      );
    });
  }, [keyword, sekolahList]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          if (!loading) setOpen(!open);
        }}
        disabled={loading}
        className="flex h-12 w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 text-left text-[13px] font-black text-slate-700 shadow-sm transition hover:border-[#0AC4E0]/50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className={selected ? "text-slate-800" : "text-slate-400"}>
          {loading
            ? "Memuat daftar sekolah..."
            : selected
              ? `${selected.nama_sekolah}${selected.jenjang ? ` (${selected.jenjang})` : ""
              }`
              : "Pilih sekolah Anda"}
        </span>
        {loading ? (
          <Loader2 size={16} className="animate-spin text-[#0AC4E0]" />
        ) : (
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""
              }`}
          />
        )}
      </button>
      <AnimatePresence>
        {open && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-[0.9rem] border border-slate-100 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
          >
            <div className="border-b border-slate-100 p-3">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Cari nama sekolah / NPSN..."
                  className="h-10 w-full rounded-xl border border-slate-100 bg-slate-50 pl-9 pr-3 text-[11px] font-bold text-slate-600 outline-none transition focus:border-[#0AC4E0]/40 focus:bg-white"
                />
              </div>
            </div>
            <ul className="max-h-64 overflow-y-auto py-1">
              {filteredSekolah.length === 0 ? (
                <li className="px-4 py-3 text-[12px] font-bold text-slate-400">
                  Sekolah tidak ditemukan.
                </li>
              ) : (
                filteredSekolah.map((sekolah) => (
                  <li key={sekolah.id_sekolah}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(String(sekolah.id_sekolah));
                        setOpen(false);
                        setKeyword("");
                      }}
                      className={`flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors ${String(selectedId) === String(sekolah.id_sekolah)
                        ? "bg-[#0AC4E0]/10 text-[#0AC4E0]"
                        : "text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      <School
                        size={14}
                        className="mt-0.5 shrink-0 text-[#0AC4E0]"
                      />
                      <span className="min-w-0">
                        <span className="block text-[12px] font-black uppercase leading-snug">
                          {sekolah.nama_sekolah || "Nama sekolah belum ada"}
                        </span>
                        <span className="mt-0.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">
                          {sekolah.jenjang || "Jenjang belum ada"}
                          {sekolah.npsn ? ` · NPSN ${sekolah.npsn}` : ""}
                        </span>
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

SekolahDropdown.propTypes = {
  sekolahList: PropTypes.arrayOf(PropTypes.object),
  selectedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSelect: PropTypes.func,
  loading: PropTypes.bool,
};

// =========================================================================
// KOMPONEN UTAMA LOGIN
// =========================================================================
const Login = () => {
  const [selectedRole, setSelectedRole] = useState("Akun Sistem");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    id_sekolah: "",
    nama_guru: "",
  });
  const [sekolahList, setSekolahList] = useState([]);
  const [loadingSekolah, setLoadingSekolah] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetForm, setResetForm] = useState({
    email: "",
    otp: "",
    password: "",
    password_confirmation: "",
  });
  const [resetOtpSent, setResetOtpSent] = useState(false);
  const [resetExpiresIn, setResetExpiresIn] = useState(null);
  const [focused, setFocused] = useState(null);
  const navigate = useNavigate();

  const isGuru = selectedRole === "Guru Assessment";
  const isSistem = selectedRole === "Akun Sistem";

  useEffect(() => {
    if (!isGuru) return;

    const fetchSekolah = async () => {
      setLoadingSekolah(true);
      try {
        const { data } = await axios.get(`${API_BASE_URL}/sekolah`);
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.result)
              ? data.result
              : [];

        const normalized = list
          .filter((sekolah) => sekolah?.id_sekolah)
          .map((sekolah) => ({
            ...sekolah,
            id_sekolah: sekolah.id_sekolah,
            nama_sekolah:
              sekolah.nama_sekolah ||
              sekolah.namaSekolah ||
              sekolah.nama ||
              "Sekolah",
            npsn: sekolah.npsn || "",
            jenjang: sekolah.jenjang || sekolah.tingkat || "",
          }))
          .sort((a, b) =>
            String(a.nama_sekolah || "").localeCompare(
              String(b.nama_sekolah || "")
            )
          );

        setSekolahList(normalized);
      } catch (error) {
        toast.error("Gagal memuat daftar sekolah.", {
          position: "top-right",
          autoClose: 2200,
        });
        setSekolahList([]);
      } finally {
        setLoadingSekolah(false);
      }
    };

    fetchSekolah();
  }, [isGuru]);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (loading) return;

    const emailValue = String(formData.email || "").trim();
    const passwordValue = String(formData.password || "").trim();
    const guruNameValue = String(formData.nama_guru || "").trim();

    if (isSistem) {
      if (!emailValue) {
        showValidationError("Email wajib diisi.");
        return;
      }

      if (!isValidEmailFormat(emailValue)) {
        showValidationError("Format email tidak sesuai.");
        return;
      }

      if (!passwordValue) {
        showValidationError("Password wajib diisi.");
        return;
      }
    }

    if (isGuru) {
      if (!formData.id_sekolah) {
        showValidationError("Sekolah harus dipilih.");
        return;
      }

      if (!guruNameValue) {
        showValidationError("Nama guru harus di isi.");
        return;
      }

      if (!passwordValue) {
        showValidationError("Password wajib diisi.");
        return;
      }
    }

    setLoading(true);

    try {
      let token;

      if (isGuru) {
        const res = await axios.post(`${API_BASE_URL}/auth/login-guru`, {
          id_sekolah: Number(formData.id_sekolah),
          nama_guru: guruNameValue,
          password: passwordValue,
        });
        token = res.data.access_token || res.data.token;
      } else {
        const res = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: emailValue,
          password: passwordValue,
        });
        token = res.data.access_token || res.data.token;
      }

      if (!token) throw new Error("Token tidak ditemukan dari server");

      const decoded = jwtDecode(token);

      setAuthSession(token, decoded);

      const redirectPath = getRedirectPath(decoded);

      toast.success("Login berhasil. Mengarahkan ke dashboard...", {
        position: "top-right",
        autoClose: 1200,
      });

      setIsSuccess(true);
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 900);
    } catch (err) {
      setLoading(false);
      setIsSuccess(false);
      toast.error(getLoginErrorMessage(err), {
        position: "top-right",
        autoClose: 2600,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const openResetPassword = () => {
    setResetForm({
      email: formData.email || "",
      otp: "",
      password: "",
      password_confirmation: "",
    });
    setResetOtpSent(false);
    setResetExpiresIn(null);
    setShowResetPassword(true);
  };

  const requestResetOtp = async () => {
    if (resetLoading) return;

    const email = String(resetForm.email || "").trim();

    if (!email) {
      showValidationError("Email wajib diisi.");
      return;
    }

    if (!isValidEmailFormat(email)) {
      showValidationError("Format email tidak valid.");
      return;
    }

    setResetLoading(true);

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/auth/forgot-password/request`,
        { email }
      );

      setResetOtpSent(true);
      setResetExpiresIn(data?.expires_in_minutes || null);
      setResetForm((prev) => ({
        ...prev,
        email,
        otp: "",
        password: "",
        password_confirmation: "",
      }));

      toast.success(data?.message || "OTP reset password sudah dikirim.", {
        position: "top-right",
        autoClose: 2600,
      });
    } catch (error) {
      toast.error(getResetPasswordErrorMessage(error), {
        position: "top-right",
        autoClose: 3600,
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    if (event) event.preventDefault();
    if (resetLoading) return;

    const email = String(resetForm.email || "").trim();
    const otp = String(resetForm.otp || "").trim();
    const password = String(resetForm.password || "").trim();
    const passwordConfirmation = String(
      resetForm.password_confirmation || ""
    ).trim();

    if (!resetOtpSent) {
      showValidationError("Kirim OTP ke email terlebih dahulu.");
      return;
    }

    if (!email) {
      showValidationError("Email wajib diisi.");
      return;
    }

    if (!isValidEmailFormat(email)) {
      showValidationError("Format email tidak valid.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      showValidationError("Kode OTP harus 6 digit.");
      return;
    }

    if (password.length < 8) {
      showValidationError("Password baru minimal 8 karakter.");
      return;
    }

    if (password !== passwordConfirmation) {
      showValidationError("Konfirmasi password tidak sama.");
      return;
    }

    setResetLoading(true);

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/auth/forgot-password/verify`,
        {
          email,
          otp,
          password,
          password_confirmation: passwordConfirmation,
        }
      );

      toast.success(
        data?.message ||
        "Password berhasil diperbarui. Silakan login dengan password baru.",
        {
          position: "top-right",
          autoClose: 2600,
        }
      );

      setFormData((prev) => ({
        ...prev,
        email,
        password: "",
      }));
      setSelectedRole("Akun Sistem");
      setResetForm({
        email,
        otp: "",
        password: "",
        password_confirmation: "",
      });
      setResetOtpSent(false);
      setResetExpiresIn(null);
      setShowResetPassword(false);
    } catch (error) {
      toast.error(getResetPasswordErrorMessage(error), {
        position: "top-right",
        autoClose: 3600,
      });
    } finally {
      setResetLoading(false);
    }
  };

  const renderPasswordField = () => (
    <div>
      <div className="mb-2 flex items-center gap-3">
        <Lock
          size={18}
          className={
            focused === "password" ? "text-[#0AC4E0]" : "text-slate-500"
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
          className="!h-12 !rounded-2xl !border !border-slate-200 !bg-white !px-4 !pr-12 !text-[14px] !font-bold !text-slate-800 !shadow-sm !outline-none transition focus:!border-[#0AC4E0] focus:!ring-4 focus:!ring-[#0AC4E0]/10"
        />
        <AppIconButton
          icon={showPassword ? EyeOff : Eye}
          iconSize={18}
          variant="nav"
          size="sm"
          ariaLabel={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 !h-8 !w-8 -translate-y-1/2 !rounded-lg"
        />
      </div>
    </div>
  );

  // =========================================================================
  // RENDER FIELD BERDASARKAN ROLE
  // =========================================================================
  const renderFields = () => {
    if (!selectedRole) return null;

    if (isGuru) {
      return (
        <motion.div
          key="guru-fields"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
          className="space-y-5"
        >
          <div>
            <div className="mb-2 flex items-center gap-3">
              <School
                size={18}
                className={
                  focused === "id_sekolah" ? "text-[#0AC4E0]" : "text-slate-500"
                }
              />
              <Label
                text="Sekolah"
                className="!mb-0 !text-[13px] !font-black !text-slate-700"
              />
            </div>
            <SekolahDropdown
              sekolahList={sekolahList}
              selectedId={formData.id_sekolah}
              loading={loadingSekolah}
              onSelect={(idSekolah) =>
                setFormData({
                  ...formData,
                  id_sekolah: idSekolah,
                })
              }
            />
          </div>

          <div>
            <div className="mb-2 flex items-center gap-3">
              <User
                size={18}
                className={
                  focused === "nama_guru" ? "text-[#0AC4E0]" : "text-slate-500"
                }
              />
              <Label
                text="Nama Guru"
                className="!mb-0 !text-[13px] !font-black !text-slate-700"
              />
            </div>
            <div className="relative">
              <Input
                type="text"
                placeholder="Masukkan nama lengkap Anda"
                value={formData.nama_guru}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nama_guru: e.target.value,
                  })
                }
                onFocus={() => setFocused("nama_guru")}
                onBlur={() => setFocused(null)}
                className="!h-12 !rounded-2xl !border !border-slate-200 !bg-white !px-4 !text-[14px] !font-bold !text-slate-800 !shadow-sm !outline-none transition focus:!border-[#0AC4E0] focus:!ring-4 focus:!ring-[#0AC4E0]/10"
              />
            </div>
          </div>

          {renderPasswordField()}
        </motion.div>
      );
    }

    return (
      <motion.div
        key="sistem-fields"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.2 }}
        className="space-y-5"
      >
        <div>
          <div className="mb-2 flex items-center gap-3">
            <Mail
              size={18}
              className={
                focused === "email" ? "text-[#0AC4E0]" : "text-slate-500"
              }
            />
            <Label
              text="Email"
              className="!mb-0 !text-[13px] !font-black !text-slate-700"
            />
          </div>
          <div className="relative">
            <Input
              type="text"
              inputMode="email"
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
              className="!h-12 !rounded-2xl !border !border-slate-200 !bg-white !px-4 !text-[14px] !font-bold !text-slate-800 !shadow-sm !outline-none transition focus:!border-[#0AC4E0] focus:!ring-4 focus:!ring-[#0AC4E0]/10"
            />
          </div>
        </div>

        {renderPasswordField()}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={openResetPassword}
            className="text-[11px] font-black text-[#0AC4E0] transition hover:text-[#0899B0]"
          >
            Lupa password?
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <PageWrapper className="!p-0 flex h-screen w-full overflow-hidden bg-[#F6F8FB] font-sans">
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="login-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            className="relative h-full w-full overflow-hidden"
          >
            <div className="absolute inset-0 flex">
              <div className="h-full w-[48%] bg-[#F6F8FB]" />
              <div className="relative hidden h-full flex-1 overflow-hidden lg:block">
                <img
                  src={library_YPAMDR}
                  className="h-full w-full object-cover"
                  alt="Library YPA-MDR"
                  decoding="async"
                  fetchpriority="high"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950/35 via-[#0AC4E0]/10 to-slate-950/55" />
                <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(10,196,224,0.14)_0%,transparent_38%,rgba(15,23,42,0.25)_100%)]" />
                <div className="absolute right-10 top-10 grid grid-cols-6 gap-2 opacity-35">
                  {Array.from({ length: 36 }).map((_, index) => (
                    <span
                      key={index}
                      className="h-1.5 w-1.5 rounded-full bg-[#0AC4E0]"
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="relative z-10 flex h-full w-full">
              <section className="flex h-full w-full items-center justify-center px-7 py-7 lg:w-[48%]">
                <div className="paper-sheet relative w-full max-w-[500px] px-8 py-8 lg:px-10 lg:py-9">
                  <div className="absolute left-1/2 top-0 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0AC4E0] shadow-[0_12px_22px_rgba(10,196,224,0.32)] ring-4 ring-white/80" />

                  <div className="mb-7 flex items-center gap-5">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.35rem] bg-white/45">
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

                  <div className="mb-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0AC4E0]">
                      Login Sistem
                    </p>
                    <h1 className="mt-2 text-[42px] font-black leading-none tracking-[-0.06em] text-slate-900">
                      Masuk
                    </h1>
                  </div>

                  <form onSubmit={handleLogin} noValidate className="space-y-6">
                    <RoleSuggestion
                      selectedRole={selectedRole}
                      onSelect={(label) => {
                        setSelectedRole(label);
                        setFormData({
                          email: "",
                          password: "",
                          id_sekolah: "",
                          nama_guru: "",
                        });
                      }}
                    />

                    <AnimatePresence mode="wait">
                      {selectedRole && (
                        <motion.div
                          key={isGuru ? "guru" : "sistem"}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                        >
                          {renderFields()}
                        </motion.div>
                      )}
                    </AnimatePresence>

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
                      disabled={loading || !selectedRole}
                      className="!h-14 !w-full !rounded-[1rem] !bg-[#0AC4E0] !text-[12px] !font-black !uppercase !tracking-[0.18em] !text-white !shadow-[0_16px_34px_rgba(10,196,224,0.25)] transition hover:!bg-[#08AFC8] active:scale-[0.99] disabled:!opacity-40"
                    />

                    <Button
                      variant="ghost"
                      icon={<ArrowLeft size={16} />}
                      onClick={() => navigate("/")}
                      className="!mx-auto !text-slate-500 hover:!text-[#0AC4E0]"
                    >
                      Kembali
                    </Button>
                  </form>
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
            <img
              src={logo_ypamdr_blue}
              className="h-20 object-contain"
              alt="Logo YPA-MDR"
            />
            <Loader2
              className="mt-8 h-11 w-11 animate-spin text-[#0AC4E0]"
              strokeWidth={3}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showResetPassword && (
          <motion.div
            key="reset-password-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 16, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 12, opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-[460px] overflow-hidden rounded-[1.4rem] border border-slate-100 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.24)]"
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
                <div>
                  <div className="flex items-center gap-2 text-[#0AC4E0]">
                    <KeyRound size={18} />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                      Reset Password
                    </p>
                  </div>
                  <h2 className="mt-2 text-xl font-black tracking-tight text-slate-900">
                    Lupa Password
                  </h2>
                </div>

                <AppIconButton
                  icon={X}
                  iconSize={16}
                  variant="plainDanger"
                  size="md"
                  ariaLabel="Tutup"
                  disabled={resetLoading}
                  onClick={() => setShowResetPassword(false)}
                  className="!rounded-xl !bg-slate-50"
                />
              </div>

              <form
                onSubmit={handleResetPassword}
                noValidate
                className="space-y-4 px-6 py-5"
              >
                <div>
                  <Label
                    text="Email Akun"
                    className="!mb-2 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-400"
                  />
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      inputMode="email"
                      value={resetForm.email}
                      onChange={(event) => {
                        setResetForm((prev) => ({
                          ...prev,
                          email: event.target.value,
                          otp: "",
                          password: "",
                          password_confirmation: "",
                        }));
                        setResetOtpSent(false);
                        setResetExpiresIn(null);
                      }}
                      placeholder="nama@ypamdr.or.id"
                      className="!h-12 !rounded-2xl !border-slate-200 !bg-white !text-sm !font-bold !shadow-sm"
                    />
                    <Button
                      variant="secondary"
                      loading={resetLoading && !resetOtpSent}
                      disabled={resetLoading}
                      icon={!resetLoading && <Mail size={14} />}
                      onClick={requestResetOtp}
                      className="!h-12 !shrink-0 !rounded-2xl !border-[#0AC4E0]/20 !bg-[#0AC4E0]/10 !px-4 !text-[10px] !text-[#0899B0] hover:!bg-[#0AC4E0]/15"
                    >
                      {resetOtpSent ? "Kirim Ulang" : "Kirim OTP"}
                    </Button>
                  </div>
                </div>

                {resetOtpSent && (
                  <>
                    <div className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                        OTP Terkirim
                      </span>
                      {resetExpiresIn && (
                        <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                          {resetExpiresIn} Menit
                        </span>
                      )}
                    </div>

                    <div>
                      <Label
                        text="Kode OTP"
                        className="!mb-2 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-400"
                      />
                      <Input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={resetForm.otp}
                        onChange={(event) =>
                          setResetForm((prev) => ({
                            ...prev,
                            otp: event.target.value.replace(/\D/g, "").slice(0, 6),
                          }))
                        }
                        placeholder="6 digit OTP"
                        className="!h-12 !rounded-2xl !border-slate-200 !bg-white !text-center !text-lg !font-black !tracking-[0.35em] !shadow-sm"
                        autoComplete="one-time-code"
                      />
                    </div>

                    <div>
                      <Label
                        text="Password Baru"
                        className="!mb-2 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-400"
                      />
                      <Input
                        type="password"
                        value={resetForm.password}
                        onChange={(event) =>
                          setResetForm((prev) => ({
                            ...prev,
                            password: event.target.value,
                          }))
                        }
                        placeholder="Minimal 8 karakter"
                        className="!h-12 !rounded-2xl !border-slate-200 !bg-white !text-sm !font-bold !shadow-sm"
                        autoComplete="new-password"
                      />
                    </div>

                    <div>
                      <Label
                        text="Konfirmasi Password"
                        className="!mb-2 !text-[10px] !font-black !uppercase !tracking-widest !text-slate-400"
                      />
                      <Input
                        type="password"
                        value={resetForm.password_confirmation}
                        onChange={(event) =>
                          setResetForm((prev) => ({
                            ...prev,
                            password_confirmation: event.target.value,
                          }))
                        }
                        placeholder="Ulangi password baru"
                        className="!h-12 !rounded-2xl !border-slate-200 !bg-white !text-sm !font-bold !shadow-sm"
                        autoComplete="new-password"
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    variant="secondary"
                    disabled={resetLoading}
                    onClick={() => setShowResetPassword(false)}
                    className="!h-11 !rounded-xl !px-5 !text-[11px]"
                  >
                    Batal
                  </Button>

                  <Button
                    type="submit"
                    variant="primary"
                    loading={resetLoading}
                    disabled={resetLoading || !resetOtpSent}
                    icon={!resetLoading && <KeyRound size={14} />}
                    className="!h-11 !rounded-xl !px-5 !text-[11px]"
                  >
                    {resetLoading ? "Menyimpan" : "Reset Password"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .paper-sheet {
          background: radial-gradient(circle at 18% 16%, rgba(255,255,255,0.72), transparent 20%),
            radial-gradient(circle at 82% 22%, rgba(15,23,42,0.035), transparent 18%),
            radial-gradient(circle at 22% 78%, rgba(15,23,42,0.045), transparent 20%),
            linear-gradient(135deg, rgba(255,255,255,0.96), rgba(248,250,252,0.9));
          box-shadow: 0 28px 60px rgba(15,23,42,0.16), 0 8px 18px rgba(15,23,42,0.08);
          filter: drop-shadow(0 16px 18px rgba(15,23,42,0.10));
          border: 1px solid rgba(226,232,240,0.85);
          border-radius: 18px;
        }
        .paper-sheet::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          border-radius: inherit;
          opacity: 0.42;
          background-image:
            linear-gradient(115deg, transparent 0%, rgba(15,23,42,0.035) 18%, transparent 32%),
            linear-gradient(72deg, transparent 0%, rgba(255,255,255,0.55) 36%, transparent 51%),
            repeating-linear-gradient(0deg, rgba(15,23,42,0.026) 0px, rgba(15,23,42,0.026) 1px, transparent 1px, transparent 7px);
          mix-blend-mode: multiply;
        }
        .paper-sheet::after {
          content: "";
          position: absolute;
          inset: -1px;
          pointer-events: none;
          border-radius: inherit;
          background:
            linear-gradient(90deg, rgba(255,255,255,0.88), transparent 12%, transparent 88%, rgba(15,23,42,0.035)),
            linear-gradient(0deg, rgba(15,23,42,0.045), transparent 10%, transparent 90%, rgba(255,255,255,0.72));
          opacity: 0.4;
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
