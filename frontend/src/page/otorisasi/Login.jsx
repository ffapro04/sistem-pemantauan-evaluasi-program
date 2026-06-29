/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
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
  Activity,
  LogIn,
  ArrowLeft,
  ChevronDown,
  School,
  User,
  Search,
} from "lucide-react";

// ASSETS
import pilar1 from "../../assets/img/1.png";
import pilar2 from "../../assets/img/2.png";
import pilar3 from "../../assets/img/3.png";
import pilar4 from "../../assets/img/4.png";
import logo_ypamdr_blue from "../../assets/img/YPA-MDR-LOGO.png";
import library_YPAMDR from "../../assets/img/library_YPAMDR.optimized.jpg";

// COMPONENTS
import PageWrapper from "../../components/PageWrapper";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Label from "../../components/Label";

const API_BASE_URL = "";

// =========================================================================
// DAFTAR ROLE UNTUK DROPDOWN
// =========================================================================
const ROLE_OPTIONS = [
  { value: "sistem", label: "Admin" },
  { value: "sistem", label: "Pengurus" },
  { value: "sistem", label: "Head Office" },
  { value: "sistem", label: "Area Officer" },
  { value: "sistem", label: "Sekolah" },
  { value: "sistem", label: "Kepala Sekolah" },
  { value: "sistem", label: "Vendor" },
  { value: "sistem", label: "Kepala Dinas" },
  { value: "sistem", label: "Operator Sekolah" },
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
  if (err?.isRoleMismatch) {
    return err.message;
  }

  const serverMessage =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message;

  if (err?.response?.status === 401 || err?.response?.status === 403) {
    return "Email, password, atau role tidak sesuai.";
  }

  return serverMessage || "Gagal masuk. Periksa kembali kredensial Anda.";
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
      return idRole === 1 || role === "admin";
    case "Pengurus":
      return idRole === 2 || role === "pengurus";
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
      return idRole === 6 || role === "vendor";
    case "Kepala Dinas":
      return idRole === 7 || role.includes("kepala dinas");
    case "Guru Assessment":
      return idRole === 8 || role.includes("guru");
    case "Operator Sekolah":
      return (
        idRole === 9 ||
        jabatan.includes("operator sekolah") ||
        jabatan.includes("operator")
      );
    default:
      return false;
  }
};

const getRoleMismatchMessage = (selectedRole) =>
  `Akun yang digunakan tidak sesuai dengan role ${selectedRole}. Silakan pilih role yang benar atau gunakan akun yang sesuai.`;

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
  if (idRole === 1 || role === "admin") {
    return "/admin/dashboard";
  }

  // Pengurus
  if (idRole === 2 || role === "pengurus") {
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
    idRole === 9 ||
    role.includes("operator") ||
    jabatan.includes("operator sekolah") ||
    jabatan.includes("operator")
  ) {
    return "/sekolah/dashboard";
  }

  // Sekolah
  if (idRole === 5 || role === "sekolah") {
    return "/sekolah/dashboard";
  }

  // Vendor / Narasumber
  if (idRole === 6 || role === "vendor" || role.includes("narasumber")) {
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
          {selected ? selected.label : "Pilih peran Anda"}
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
                    <User size={13} className="shrink-0 text-slate-300" />
                  )}
                  {role.label}
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
        className="flex w-full items-center justify-between rounded-[0.9rem] border border-slate-200 bg-white/70 px-4 py-3 text-left text-[13px] font-black text-slate-700 shadow-sm transition hover:border-[#0AC4E0]/40 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
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

// =========================================================================
// KOMPONEN UTAMA LOGIN
// =========================================================================
const Login = () => {
  const [selectedRole, setSelectedRole] = useState("");
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
  const [focused, setFocused] = useState(null);
  const navigate = useNavigate();

  const isGuru = selectedRole === "Guru Assessment";
  const isSistem = selectedRole && !isGuru;

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
        console.error("GAGAL MEMUAT SEKOLAH:", error);
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

    if (!selectedRole) {
      showValidationError("Role harus dipilih.");
      return;
    }

    if (isSistem) {
      if (!emailValue) {
        showValidationError("Email harus di isi");
        return;
      }

      if (!passwordValue) {
        showValidationError("Password harus di isi");
        return;
      }

      if (!isValidEmailFormat(emailValue)) {
        showValidationError("Format email tidak valid.");
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
        showValidationError("Password harus di isi");
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

      if (!isRoleMatch(selectedRole, decoded)) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        throw {
          isRoleMismatch: true,
          message: getRoleMismatchMessage(selectedRole),
        };
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(decoded));

      const redirectPath = getRedirectPath(decoded);
      console.log("LOGIN DECODED:", decoded);
      console.log("REDIRECT TARGET:", redirectPath);

      toast.success("Login berhasil. Mengarahkan ke dashboard...", {
        position: "top-right",
        autoClose: 1200,
      });

      setIsSuccess(true);
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 900);
    } catch (err) {
      console.error("LOGIN ERROR:", err);
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
          className="space-y-7"
        >
          {/* Pilih Sekolah */}
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

          {/* Nama Guru */}
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
                className="paper-line-input !h-11 !rounded-none !border-0 !border-b !bg-transparent !px-0 !pb-3 !text-[14px] !font-bold !text-slate-700 !shadow-none !outline-none"
              />
              <span
                className={`absolute bottom-0 left-0 h-[2px] rounded-full bg-[#0AC4E0] transition-all duration-300 ${focused === "nama_guru" ? "w-full" : "w-0"
                  }`}
              />
            </div>
          </div>

          {/* Password */}
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
        className="space-y-7"
      >
        {/* Email */}
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

        {/* Password */}
        {renderPasswordField()}
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
            exit={{
              opacity: 0,
              filter: "blur(10px)",
              transition: {
                duration: 0.45,
                ease: [0.16, 1, 0.3, 1],
              },
            }}
            className="relative h-full w-full overflow-hidden"
          >
            {/* BACKGROUND SPLIT */}
            <div className="absolute inset-0 flex">
              <div className="h-full w-[48%] bg-[#F6F8FB]" />
              <div className="relative hidden h-full flex-1 overflow-hidden lg:block">
                <img
                  src={library_YPAMDR}
                  className="h-full w-full object-cover"
                  alt="Library YPA-MDR"
                  decoding="async"
                  fetchPriority="high"
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
                    {[pilar1, pilar2, pilar3, pilar4].map((src, index) => (
                      <img
                        key={index}
                        src={src}
                        className="h-9 w-9 object-contain brightness-0 invert opacity-55 transition hover:opacity-100"
                        alt="pilar"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* FORM PANEL */}
            <div className="relative z-10 flex h-full w-full">
              <section className="flex h-full w-full items-center justify-center px-7 py-7 lg:w-[48%]">
                <div className="paper-sheet relative w-full max-w-[500px] px-9 py-9 lg:px-11 lg:py-10">
                  <div className="absolute left-1/2 top-0 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0AC4E0] shadow-[0_12px_22px_rgba(10,196,224,0.32)] ring-4 ring-white/80" />

                  {/* HEADER */}
                  <div className="mb-8 flex items-center gap-5">
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

                  {/* TITLE */}
                  <div className="mb-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0AC4E0]">
                      Login Sistem
                    </p>
                    <h1 className="mt-2 text-[42px] font-black leading-none tracking-[-0.06em] text-slate-900">
                      Masuk
                    </h1>
                    <p className="mt-3 max-w-sm text-[12px] font-semibold leading-6 text-slate-500">
                      Pilih peran Anda terlebih dahulu, lalu masukkan
                      kredensial yang sesuai.
                    </p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-6">
                    {/* DROPDOWN ROLE */}
                    <div>
                      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Peran / Role
                      </p>
                      <RoleDropdown
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
                    </div>

                    {/* FIELDS */}
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

                    {/* TOMBOL */}
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
                        disabled={loading || !selectedRole}
                        className="!h-14 !w-full !rounded-[1rem] !bg-[#0AC4E0] !text-[12px] !font-black !uppercase !tracking-[0.18em] !text-white !shadow-[0_16px_34px_rgba(10,196,224,0.25)] transition hover:!bg-[#08AFC8] active:scale-[0.99] disabled:!opacity-40"
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

                  <div className="mt-6 flex items-center justify-center gap-3 text-center opacity-55">
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
          opacity: 0.45;
          background-image:
            linear-gradient(115deg, transparent 0%, rgba(15,23,42,0.04) 18%, transparent 32%),
            linear-gradient(72deg, transparent 0%, rgba(255,255,255,0.55) 36%, transparent 51%),
            repeating-linear-gradient(0deg, rgba(15,23,42,0.035) 0px, rgba(15,23,42,0.035) 1px, transparent 1px, transparent 7px);
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
          border-bottom-color: rgba(51,65,85,0.55) !important;
        }
        .paper-line-input::placeholder {
          color: rgba(100,116,139,0.52) !important;
          font-weight: 600 !important;
        }
        .paper-line-input:focus {
          box-shadow: none !important;
          border-bottom-color: rgba(51,65,85,0.55) !important;
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
