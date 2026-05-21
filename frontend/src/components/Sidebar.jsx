
import {
  ArrowLeft,
  LogOut,
  ClipboardCheck,
  FolderKanban,
  LayoutDashboard,
  ChevronDown,
  Database,
  Menu as MenuIcon,
  X,
  User,
  ShieldCheck,
  Users,
  MapPin,
  School,
  Truck,
  Settings,
  CalendarDays,
  Activity,
  Building2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo_ypamdr from "../assets/img/logo_ypamdr.png";
import { Map } from "lucide-react";

// --- SPRING CONFIG (Samsung OneUI Inspired) ---
const samsungSpring = {
  type: "spring",
  stiffness: 100,
  damping: 20,
  mass: 1,
};

// --- 1. KOMPONEN USER PROFILE AOD (SOLID) ---
const UserProfileAOD = ({ user, label, pathname }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, x: -20, filter: "blur(10px)" }}
        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        transition={{ ...samsungSpring, delay: 0.1 }}
        className="relative p-4 rounded-[1.75rem] bg-[#164a8a] border border-white/5 shadow-2xl overflow-hidden group mb-8 flex items-center gap-4"
      >
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg">
            <span className="text-xl font-black text-[#1E5AA5] uppercase">
              {user.nama?.charAt(0)}
            </span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-[3px] border-[#164a8a] rounded-full" />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-[14px] font-bold text-white truncate leading-tight mb-1">
            {user.nama || "User"}
          </h2>
          <div className="inline-flex px-2 py-0.5 rounded-md bg-blue-400 text-[#1E5AA5] text-[8px] font-black uppercase tracking-wider">
            {label}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// --- 2. KOMPONEN SYSTEM CLOCK AOD (SOLID) ---
const SystemClockAOD = ({ pathname }) => {
  const [time, setTime] = useState({ hour: "", minute: "", second: "" });
  const [dateInfo, setDateInfo] = useState({ day: "", date: "", year: "" });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime({
        hour: now.getHours().toString().padStart(2, "0"),
        minute: now.getMinutes().toString().padStart(2, "0"),
        second: now.getSeconds().toString().padStart(2, "0"),
      });
      const dayName = now.toLocaleDateString("id-ID", { weekday: "long" });
      const dayDate = now.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      });
      const year = now.getFullYear();
      setDateInfo({ day: dayName, date: dayDate, year: year });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ ...samsungSpring, delay: 0.2 }}
        className="p-5 rounded-[1.75rem] bg-[#164a8a] border border-white/5 shadow-2xl relative overflow-hidden"
      >
        <div className="flex items-baseline gap-2 justify-center mb-1">
          <span className="text-3xl font-bold tracking-tighter text-white tabular-nums">
            {time.hour}
            <span className="text-white/20 font-thin mx-0.5">:</span>
            {time.minute}
          </span>
          <span className="text-[12px] font-bold text-blue-400 tabular-nums">
            {time.second}
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center px-1">
          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">
            {dateInfo.day}
          </span>
          <span className="text-[10px] font-medium text-white/20 tabular-nums uppercase">
            {dateInfo.date} • {dateInfo.year}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default function Sidebar() {
  const [user, setUser] = useState({
    nama: "",
    role: "",
    id_role: null,
    jenis: null,
  });
  const [isMasterOpen, setIsMasterOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const d = jwtDecode(token);
        setUser({
          nama: d.nama ?? d.email ?? "User",
          id_role: d.id_role !== undefined ? Number(d.id_role) : null,
          role: d.nama_role ?? d.role ?? "-",
          jenis: d.jenis ?? null,
        });
      } catch {
        localStorage.clear();
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [location.pathname, navigate]);

  const getRoleLabel = () => {
    const labels = {
      1: "SUPER ADMIN",
      2: "PENGURUS",
      3: "HO PERSONNEL",
      4: "AREA OFFICER",
      5: "SEKOLAH",
      6: "VENDOR",
      7: "KEPALA DINAS",
    };
    return labels[user.id_role] || "GUEST";
  };

  const isAkademik =
    (user.jenis?.trim() || "").toLowerCase().includes("akademik") &&
    !(user.jenis?.trim() || "").toLowerCase().includes("non");

  // --- PEMETAAN NAV ITEMS SINKRON (MUTLAK TERISOLASI PER ROLE) 🚀 ---
  const navItems = [
    // Role 1: Super Admin
    ...(user.id_role === 1
      ? [
          {
            icon: <LayoutDashboard size={20} />,
            label: "Dashboard",
            path: "/admin/dashboard",
            exact: true,
          },
        ]
      : []),
    // Role 2: Pengurus
    ...(user.id_role === 2
      ? [
          {
            icon: <LayoutDashboard size={20} />,
            label: "Dashboard Pengurus",
            path: "/pengurus/dashboard",
          },
          {
            icon: <ClipboardCheck size={20} />,
            label: "Dashboard Sekolah",
            path: "/pengurus/dashboardsekolahpengurus",
          },
          {
            icon: <FolderKanban size={20} />,
            label: "Dashboard Kegiatan",
            path: "/pengurus/dashboardkegiatanpengurus",
          },
        ]
      : []),
    // Role 3: HO Personnel
    ...(user.id_role === 3
      ? [
          {
            icon: <LayoutDashboard size={20} />,
            label: "Dashboard",
            path: isAkademik ? "/ho/dashboard/akademik" : "/ho/dashboard/non-akademik",
            exact: true,
          },
          {
            icon: <LayoutDashboard size={20} />,
            label: "Assessment",
            path: isAkademik ? "/ho/assessment/akademik" : "/ho/assessment/non-akademik",
          },
          {
            icon: <FolderKanban size={20} />,
            label: "Program Kegiatan",
            path: isAkademik ? "/ho/program/akademik" : "/ho/program/non-akademik",
          },
          {
            icon: <CalendarDays size={20} />,
            label: "List Schedule",
            path: isAkademik ? "/ho/penjadwalan/akademik" : "/ho/penjadwalan/non-akademik",
          },
        ]
      : []),
    // Role 4: Area Officer (AO) -> Khusus Monitoring Wilayah Binaan Astra
    ...(user.id_role === 4
      ? [
          {
            icon: <LayoutDashboard size={20} />,
            label: "Dashboard AO",
            path: "/ao/dashboard",
          },
          {
            icon: <School size={20} />,
            label: "Monitoring Wilayah",
            path: "/ao/monitoring-wilayah",
          },
        ]
      : []),
    // Role 5: Internal Sekolah Binaaan Astra
    ...(user.id_role === 5
      ? [
          {
            icon: <FolderKanban size={20} />,
            label: "Profil Sekolah",
            path: "/sekolah/ProfilSekolah",
          },
          {
            icon: <ClipboardCheck size={20} />,
            label: "Assessment",
            path: "/sekolah/dashboard",
          },
          {
            icon: <FolderKanban size={20} />,
            label: "Program Kegiatan",
            path: "/sekolah/ProgramKegiatan",
          },
        ]
      : []),
    ...(user.id_role === 6
      ? [
          {
            icon: <LayoutDashboard size={20} />,
            label: "Dashboard Vendor",
            path: "/vendor/dashboard",
          },
          {
            icon: <Truck size={20} />,
            label: "Project Pengadaan",
            path: "/vendor/project",
          },
        ]
      : []),
    ...(user.id_role === 7
      ? [
          {
            icon: <Map size={20} />,
            label: "Wilayah Sekolah",
            path: "/kadin/wilayahsekolah",
          },
          
        ]
      : []),
  ];

  // --- DATA FINANCE TELAH DIHAPUS ---
  const masterItems = [
    {
      label: "Data Pengurus",
      path: "/admin/pengurus",
      icon: <User size={16} />,
    },
    { label: "Data HO", path: "/admin/ho", icon: <ShieldCheck size={16} /> },
    { label: "Data AO", path: "/admin/ao", icon: <Users size={16} /> },
    {
      label: "Data Wilayah",
      path: "/admin/wilayah",
      icon: <MapPin size={16} />,
    },
    {
      label: "Data Sekolah",
      path: "/admin/sekolah",
      icon: <School size={16} />,
    },
    { label: "Data Vendor", 
      path: "/admin/vendor", 
      icon: <Truck size={16} /> },
    {
      label: "Data Kepala Dinas",
      path: "/admin/kadin",
      icon: <Building2 size={16} />,
    },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full font-poppins text-white bg-[#1E5AA5] overflow-hidden border-r border-black/10">
      {/* 1. HEADER (Static) */}
      <div className="flex-shrink-0 px-8 pt-10 pb-8">
        <img
          src={logo_ypamdr}
          alt="Logo"
          className="h-7 w-auto brightness-0 invert opacity-100"
        />
      </div>

      {/* 2. PROFILE & MENU UTAMA (Static) */}
      <div className="flex-shrink-0 px-6">
        <UserProfileAOD
          user={user}
          label={getRoleLabel()}
          pathname={location.pathname}
        />

        <div className="mt-2">
          <div className="text-[10px] font-black tracking-[0.2em] text-white/30 uppercase ml-4 mb-4">
            Menu Utama
          </div>
          <div className="space-y-1.5">
            {navItems.map((item, idx) => {
              const active = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);
              return (
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 + 0.2 }}
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center rounded-xl px-5 py-3.5 transition-all duration-300 ${active ? "bg-white text-[#1E5AA5] shadow-lg font-bold" : "hover:bg-white/5 text-white/70"}`}
                >
                  <span className={active ? "text-[#1E5AA5]" : "text-white/40"}>
                    {item.icon}
                  </span>
                  <span className="ml-4 text-[13px]">{item.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. ADMINISTRASI (Scrollable) */}
      {(user.id_role === 1 ) && (
        <div className="flex-1 flex flex-col overflow-hidden min-h-0 mt-8">
          <div className="flex-shrink-0 px-10">
            <div className="text-[10px] font-black tracking-[0.2em] text-white/30 uppercase mb-4">
              Administrasi
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-4">
            <button
              onClick={() => setIsMasterOpen(!isMasterOpen)}
              className={`w-full flex items-center justify-between rounded-xl px-5 py-3 transition-all ${isMasterOpen ? "bg-white/5 text-white" : "hover:bg-white/5 text-white/70"}`}
            >
              <div className="flex items-center gap-4">
                <Database size={18} className="text-white/40" />
                <span className="text-[13px] font-medium">Master Data</span>
              </div>
              <ChevronDown
                size={14}
                className={`transition-transform duration-300 ${isMasterOpen ? "rotate-180" : ""}`}
              />
            </button>

            <motion.div
              initial={false}
              animate={{
                height: isMasterOpen ? "auto" : 0,
                opacity: isMasterOpen ? 1 : 0,
              }}
              className="overflow-hidden"
            >
              <div className="mx-2 pl-4 space-y-1 border-l-2 border-white/10 mt-2">
                {masterItems.map((item) => {
                  const active = location.pathname.startsWith(item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-lg transition-all ${active ? "text-white font-bold bg-white/10" : "text-white/40 hover:text-white hover:bg-white/5"}`}
                    >
                      <span className="text-[11.5px] uppercase tracking-wide text-left">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      )}

    {user.id_role === 2 && (
    <div className="mt-8 px-6">
      <div className="text-[10px] font-black tracking-[0.2em] text-white/30 uppercase ml-4 mb-4">
        {/* Laporan Yayasan */}
      </div>
      {/* Tambahkan button menu di sini */}
    </div>
    )}

   {user.id_role === 7 && (
        <div className="mt-8 px-6">
          <div className="text-[10px] font-black tracking-[0.2em] text-white/30 uppercase ml-4 mb-4">
            {/* Monitoring Dinas */}
          </div>
        </div>
      )}


      {/* 4. FOOTER CLOCK (Static) */}
      <div className="flex-shrink-0 p-6 bg-black/10 mt-auto">
        <SystemClockAOD pathname={location.pathname} />

        <div className="flex gap-3 mt-4">
          <button className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white/30 hover:bg-white/10 transition-all border border-white/5">
            <Settings size={18} />
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            className="flex-1 flex items-center justify-center gap-3 rounded-xl font-bold text-[11px] uppercase tracking-widest bg-red-600 hover:bg-red-700 text-white transition-all shadow-lg"
          >
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>

      <aside className="hidden lg:flex flex-col h-screen w-[280px] flex-shrink-0 z-10 shadow-xl relative">
        <SidebarContent />
      </aside>
    </>
  );
}
