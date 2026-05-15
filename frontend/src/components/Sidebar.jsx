/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import {
  LogOut,
  ClipboardCheck,
  FolderKanban,
  LayoutDashboard,
  ChevronDown,
  Database,
  User,
  ShieldCheck,
  Users,
  MapPin,
  School,
  Truck,
  Settings,
  CalendarDays,
  Building2,
  Clock,
  Sparkles
} from "lucide-react";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo_ypamdr from "../assets/img/logo_ypamdr.png";

const appleSpring = {
  type: "spring",
  stiffness: 100,
  damping: 20,
  mass: 1,
};

// --- 1. KOMPONEN USER PROFILE (Enhanced Contrast) ---
const UserProfileAOD = ({ user, label, pathname }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={appleSpring}
        className="relative p-4 rounded-[1.8rem] bg-black/10 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden group mb-6 flex items-center gap-4"
      >
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500">
            <span className="text-lg font-black text-[#0AC4E0] uppercase leading-none">
              {user.nama?.charAt(0)}
            </span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-[2.5px] border-[#0AC4E0] rounded-full shadow-sm" />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-[13px] font-bold text-white truncate leading-none mb-1.5 tracking-tight">
            {user.nama || "User Account"}
          </h2>
          <div className="inline-flex px-2 py-0.5 rounded-md bg-white text-[#0AC4E0] text-[8px] font-black uppercase tracking-widest leading-none">
            {label}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// --- 2. KOMPONEN SYSTEM CLOCK (Sharper Text) ---
const SystemClockAOD = ({ pathname }) => {
  const [time, setTime] = useState({ hour: "", minute: "" });
  const [dateInfo, setDateInfo] = useState({ day: "", date: "" });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime({
        hour: now.getHours().toString().padStart(2, "0"),
        minute: now.getMinutes().toString().padStart(2, "0"),
      });
      setDateInfo({
        day: now.toLocaleDateString("id-ID", { weekday: "short" }),
        date: now.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-[2rem] bg-black/15 border border-white/5 relative overflow-hidden"
    >
      <div className="flex items-center justify-between leading-none">
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-black text-slate-900/50 uppercase tracking-[0.1em] leading-none">
            SYSTEM TIME
          </span>
          <span className="text-2xl font-extrabold text-white tracking-tighter tabular-nums leading-none">
            {time.hour}:{time.minute}
          </span>
        </div>
        <div className="text-right leading-none">
          <span className="text-[9px] font-bold text-slate-900/40 uppercase block mb-1">{dateInfo.day}</span>
          <span className="text-[10px] font-black text-white uppercase">{dateInfo.date}</span>
        </div>
      </div>
    </motion.div>
  );
};

// --- 3. KOMPONEN SIDEBAR CONTENT ---
const SidebarContent = ({
  user,
  getRoleLabel,
  location,
  navigate,
  isMasterOpen,
  setIsMasterOpen,
  navItems,
  masterItems,
}) => (
  <div className="flex flex-col h-full bg-[#0AC4E0] font-inter text-white overflow-hidden relative leading-none">
    {/* Subtle Dark Gradient Overlay for better text legibility */}
    <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10 pointer-events-none" />

    <div className="flex-shrink-0 px-10 pt-12 pb-10 relative z-10">
      <img
        src={logo_ypamdr}
        alt="Logo"
        className="h-7 w-auto brightness-0 invert opacity-100 transition-transform duration-500 hover:scale-105"
      />
    </div>

    <div className="flex-1 overflow-y-auto no-scrollbar px-6 relative z-10 leading-none">
      <UserProfileAOD
        user={user}
        label={getRoleLabel()}
        pathname={location.pathname}
      />

      <div className="space-y-7 leading-none">
        {/* SECTION: MAIN */}
        <div>
          <div className="text-[10px] font-black tracking-[0.25em] text-slate-900/40 uppercase ml-4 mb-4">
            Navigation
          </div>
          <div className="space-y-1.5">
            {navItems.map((item, idx) => {
              const active = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center rounded-2xl px-5 py-4 transition-all duration-300 group ${active
                    ? "bg-white text-slate-900 shadow-2xl shadow-black/20"
                    : "hover:bg-black/10 text-white"
                    }`}
                >
                  <span className={`${active ? "text-[#0AC4E0]" : "text-slate-900/40 group-hover:text-white"} transition-colors`}>
                    {item.icon}
                  </span>
                  <span className={`ml-4 text-[13px] tracking-tight leading-none font-bold`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION: INTERNAL SYSTEM (Sharpened) */}
        {(user.id_role === 1 || user.id_role === 2) && (
          <div>
            <div className="text-[10px] font-black tracking-[0.25em] text-slate-900/40 uppercase ml-4 mb-4">
              Internal System
            </div>
            <div className="space-y-1.5">
              <button
                onClick={() => setIsMasterOpen(!isMasterOpen)}
                className={`w-full flex items-center justify-between rounded-2xl px-5 py-4 transition-all ${isMasterOpen ? "bg-black/10 text-white shadow-inner" : "hover:bg-black/10 text-white"
                  }`}
              >
                <div className="flex items-center gap-4">
                  <Database size={20} className={isMasterOpen ? "text-white" : "text-slate-900/40"} />
                  <span className="text-[13px] font-bold leading-none">Master Data</span>
                </div>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-500 ${isMasterOpen ? "rotate-180" : "text-slate-900/40"}`}
                />
              </button>

              <AnimatePresence>
                {isMasterOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="mx-2 pl-4 space-y-1 border-l-2 border-black/10 mt-2 text-left">
                      {masterItems.map((item) => {
                        const active = location.pathname.startsWith(item.path);
                        return (
                          <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all leading-none ${active
                              ? "text-white bg-black/20 font-black"
                              : "text-slate-900/50 hover:text-white hover:bg-black/10"
                              }`}
                          >
                            <span className={`text-[11px] uppercase tracking-wider text-left leading-none font-bold`}>
                              {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* 4. FOOTER (WIDGETS) */}
    <div className="flex-shrink-0 p-6 space-y-4 relative z-10">
      <SystemClockAOD pathname={location.pathname} />

      <div className="flex gap-3 leading-none">
        <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-black/10 text-slate-900/40 hover:text-white hover:bg-black/20 transition-all border border-white/5 active:scale-90">
          <Settings size={20} />
        </button>
        <button
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
          className="flex-1 flex items-center justify-center gap-3 rounded-2xl font-black text-[11px] uppercase tracking-[0.1em] bg-white text-slate-900 hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-95 leading-none"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  </div>
);

export default function Sidebar() {
  const [user, setUser] = useState({ nama: "", role: "", id_role: null, jenis: null });
  const [isMasterOpen, setIsMasterOpen] = useState(true);
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
      1: "ADMINISTRATOR",
      2: "PENGURUS",
      3: "HO PERSONNEL",
      4: "AREA OFFICER",
      5: "INSTITUSI",
      6: "VENDOR",
      8: "DINAS PENDIDIKAN",
    };
    return labels[user.id_role] || "GUEST";
  };

  const isAkademik = (user.jenis?.trim() || "").toLowerCase().includes("akademik") &&
    !(user.jenis?.trim() || "").toLowerCase().includes("non");

  const navItems = [
    ...(user.id_role === 1 || user.id_role === 2
      ? [{ icon: <LayoutDashboard size={20} />, label: "Overview", path: "/admin/dashboard", exact: true }]
      : []),
    ...(user.id_role === 3
      ? [
        { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: isAkademik ? "/ho/dashboard/akademik" : "/ho/dashboard/non-akademik", exact: true },
        { icon: <ClipboardCheck size={20} />, label: "Assessment", path: isAkademik ? "/ho/assessment/akademik" : "/ho/assessment/non-akademik" },
        { icon: <FolderKanban size={20} />, label: "Program Plan", path: isAkademik ? "/ho/program/akademik" : "/ho/program/non-akademik" },
        { icon: <CalendarDays size={20} />, label: "Scheduling", path: isAkademik ? "/ho/penjadwalan/akademik" : "/ho/penjadwalan/non-akademik" },
      ]
      : []),
    ...(user.id_role >= 4
      ? [
        { icon: <ClipboardCheck size={20} />, label: "Assessment", path: "/sekolah/dashboard" },
        { icon: <FolderKanban size={20} />, label: "Activity Plan", path: "/sekolah/program" },
      ]
      : []),
  ];

  const masterItems = [
    { label: "Data Pengurus", path: "/admin/pengurus" },
    { label: "Data Head Office", path: "/admin/ho" },
    { label: "Data Area Officer", path: "/admin/ao" },
    { label: "Data Wilayah", path: "/admin/wilayah" },
    { label: "Data Sekolah", path: "/admin/sekolah" },
    { label: "Data Vendor", path: "/admin/vendor" },
    { label: "Data Kepala Dinas", path: "/admin/kadin" },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        .font-inter { font-family: 'Inter', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      <aside className="hidden lg:flex flex-col h-screen w-[290px] flex-shrink-0 z-50 shadow-2xl relative">
        <SidebarContent
          user={user}
          getRoleLabel={getRoleLabel}
          location={location}
          navigate={navigate}
          navItems={navItems}
          masterItems={masterItems}
          isMasterOpen={isMasterOpen}
          setIsMasterOpen={setIsMasterOpen}
        />
      </aside>
    </>
  );
}