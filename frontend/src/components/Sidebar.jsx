
import {
  LogOut,
  ClipboardCheck,
  FolderKanban,
  LayoutDashboard,
  ChevronDown,
  Database,
  Settings,
  CalendarDays,
} from "lucide-react";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo_ypamdr from "../assets/img/logo_ypamdr.png";
import { Map } from "lucide-react";

const appleSpring = {
  type: "spring",
  stiffness: 100,
  damping: 20,
  mass: 1,
};

const UserProfileAOD = ({ user, label, pathname }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={appleSpring}
        className="group relative mb-6 flex items-center gap-4 overflow-hidden rounded-[1.8rem] border border-white/10 bg-black/10 p-4 shadow-xl backdrop-blur-md"
      >
        <div className="relative flex-shrink-0">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-lg transition-transform duration-500 group-hover:scale-105">
            <span className="text-lg font-black uppercase leading-none text-[#0AC4E0]">
              {user.nama?.charAt(0) || "U"}
            </span>
          </div>

          <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-[2.5px] border-[#0AC4E0] bg-emerald-400 shadow-sm" />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="mb-1.5 truncate text-[13px] font-bold leading-none tracking-tight text-white">
            {user.nama || "User Account"}
          </h2>

          <div className="inline-flex rounded-md bg-white px-2 py-0.5 text-[8px] font-black uppercase leading-none tracking-widest text-[#0AC4E0]">
            {label}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const SystemClockAOD = () => {
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
        date: now.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
        }),
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
      className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-black/15 p-5"
    >
      <div className="flex items-center justify-between leading-none">
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-black uppercase leading-none tracking-[0.1em] text-slate-900/50">
            SYSTEM TIME
          </span>

          <span className="text-2xl font-extrabold leading-none tracking-tighter text-white tabular-nums">
            {time.hour}:{time.minute}
          </span>
        </div>

        <div className="text-right leading-none">
          <span className="mb-1 block text-[9px] font-bold uppercase text-slate-900/40">
            {dateInfo.day}
          </span>

          <span className="text-[10px] font-black uppercase text-white">
            {dateInfo.date}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

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
  <div className="font-inter relative flex h-full flex-col overflow-hidden bg-[#0AC4E0] text-white">
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10" />

    <div className="relative z-10 flex-shrink-0 px-10 pb-10 pt-12">
      <img
        src={logo_ypamdr}
        alt="Logo"
        className="h-7 w-auto brightness-0 invert transition-transform duration-500 hover:scale-105"
      />
    </div>

    <div className="no-scrollbar relative z-10 flex-1 overflow-y-auto px-6">
      <UserProfileAOD
        user={user}
        label={getRoleLabel()}
        pathname={location.pathname}
      />

      <div className="space-y-7">
        <div>
          <div className="mb-4 ml-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-900/40">
            Navigation
          </div>

          <div className="space-y-1.5">
            {navItems.map((item) => {
              const active = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`group flex w-full items-center rounded-2xl px-5 py-4 transition-all duration-300 ${active
                    ? "bg-white text-slate-900 shadow-2xl shadow-black/20"
                    : "text-white hover:bg-black/10"
                    }`}
                >
                  <span
                    className={`transition-colors ${active
                      ? "text-[#0AC4E0]"
                      : "text-slate-900/40 group-hover:text-white"
                      }`}
                  >
                    {item.icon}
                  </span>

                  <span className="ml-4 text-[13px] font-bold leading-none tracking-tight">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {user.id_role === 1 && (
          <div>
            <div className="mb-4 ml-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-900/40">
              Internal System
            </div>

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setIsMasterOpen(!isMasterOpen)}
                className={`flex w-full items-center justify-between rounded-2xl px-5 py-4 transition-all ${isMasterOpen
                  ? "bg-black/10 text-white shadow-inner"
                  : "text-white hover:bg-black/10"
                  }`}
              >
                <div className="flex items-center gap-4">
                  <Database
                    size={20}
                    className={isMasterOpen ? "text-white" : "text-slate-900/40"}
                  />

                  <span className="text-[13px] font-bold leading-none">
                    Master Data
                  </span>
                </div>

                <ChevronDown
                  size={14}
                  className={`transition-transform duration-500 ${isMasterOpen ? "rotate-180" : "text-slate-900/40"
                    }`}
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
                    <div className="mx-2 mt-2 space-y-1 border-l-2 border-black/10 pl-4 text-left">
                      {masterItems.map((item) => {
                        const active = location.pathname.startsWith(item.path);

                        return (
                          <button
                            key={item.path}
                            type="button"
                            onClick={() => navigate(item.path)}
                            className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3 transition-all ${active
                              ? "bg-black/20 font-black text-white"
                              : "text-slate-900/50 hover:bg-black/10 hover:text-white"
                              }`}
                          >
                            <span className="text-left text-[11px] font-bold uppercase leading-none tracking-wider">
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

    <div className="relative z-10 flex-shrink-0 space-y-4 p-6">
      <SystemClockAOD />

      <div className="flex gap-3 leading-none">
        <button
          type="button"
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/5 bg-black/10 text-slate-900/40 transition-all hover:bg-black/20 hover:text-white active:scale-90"
        >
          <Settings size={20} />
        </button>

        <button
          type="button"
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
          className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-white text-[11px] font-black uppercase leading-none tracking-[0.1em] text-slate-900 shadow-xl transition-all hover:bg-red-600 hover:text-white active:scale-95"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  </div>
);

export default function Sidebar() {
  const [user, setUser] = useState({
    nama: "",
    role: "",
    id_role: null,
    jenis: null,
  });

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
      3: "HEAD OFFICE",
      4: "AREA OFFICER",
      5: "SEKOLAH",
      6: "VENDOR",
      7: "KEPALA DINAS",
<<<<<<< HEAD
      8: "GURU ASSESSMENT",
=======
>>>>>>> 55395b99654a0c44898aa60d46a595d174a20e95
    };

    return labels[user.id_role] || "GUEST";
  };

  const userJenis = (user.jenis?.trim() || "").toLowerCase();

  const isAkademik =
    userJenis.includes("akademik") && !userJenis.includes("non");

  // --- PEMETAAN NAV ITEMS SINKRON (MUTLAK TERISOLASI PER ROLE) 🚀 ---
  const navItems = [
<<<<<<< HEAD
=======
    // Role 1: Super Admin
>>>>>>> 55395b99654a0c44898aa60d46a595d174a20e95
    ...(user.id_role === 1
      ? [
        {
          icon: <LayoutDashboard size={20} />,
          label: "Overview",
          path: "/admin/dashboard",
          exact: true,
        },
        {
          icon: <CalendarDays size={20} />,
          label: "Agenda",
          path: "/admin/agenda",
          exact: true,
        },
      ]
      : []),
<<<<<<< HEAD

    ...(user.id_role === 2
      ? [
        {
          icon: <LayoutDashboard size={20} />,
          label: "Dashboard Pengurus",
          path: "/pengurus/dashboard",
          exact: true,
        },
      ]
      : []),

    ...(user.id_role === 3
      ? [
        {
          icon: <LayoutDashboard size={20} />,
          label: "Dashboard",
          path: isAkademik
            ? "/ho/dashboard/akademik"
            : "/ho/dashboard/non-akademik",
          exact: true,
        },
        {
          icon: <ClipboardCheck size={20} />,
          label: "Assessment",
          path: isAkademik
            ? "/ho/assessment/akademik"
            : "/ho/assessment/non-akademik",
        },
        {
          icon: <FolderKanban size={20} />,
          label: "Program Plan",
          path: isAkademik
            ? "/ho/program/akademik"
            : "/ho/program/non-akademik",
        },
        {
          icon: <CalendarDays size={20} />,
          label: "Scheduling",
          path: isAkademik
            ? "/ho/penjadwalan/akademik"
            : "/ho/penjadwalan/non-akademik",
        },
      ]
      : []),

    ...(user.id_role === 4
      ? [
        {
          icon: <LayoutDashboard size={20} />,
          label: "Dashboard AO",
          path: "/ao/dashboard",
          exact: true,
        },
        {
          icon: <FolderKanban size={20} />,
          label: "Monitoring Program",
          path: "/ao/program",
        },
      ]
      : []),

    ...(user.id_role === 5
      ? [
        {
          icon: <LayoutDashboard size={20} />,
          label: "Dashboard Sekolah",
          path: "/sekolah/dashboard",
          exact: true,
        },
        {
          icon: <ClipboardCheck size={20} />,
          label: "Assessment",
          path: "/sekolah/assessment",
        },
      ]
      : []),

    ...(user.id_role === 6
      ? [
        {
          icon: <LayoutDashboard size={20} />,
          label: "Dashboard Vendor",
          path: "/vendor/dashboard",
          exact: true,
        },
        {
          icon: <FolderKanban size={20} />,
          label: "Program Berjalan",
          path: "/vendor/program",
        },
      ]
      : []),

    ...(user.id_role === 7
      ? [
        {
          icon: <LayoutDashboard size={20} />,
          label: "Dashboard Kepala Dinas",
          path: "/kepaladinas/dashboard",
          exact: true,
        },
      ]
      : []),

    ...(user.id_role === 8
      ? [
        {
          icon: <ClipboardCheck size={20} />,
          label: "Assessment",
          path: "/sekolah/assessment",
          exact: true,
        },
      ]
=======
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
>>>>>>> 55395b99654a0c44898aa60d46a595d174a20e95
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

  const masterItems = [
<<<<<<< HEAD
    { label: "Data Pengurus", path: "/admin/pengurus" },
    { label: "Data Head Office", path: "/admin/ho" },
    { label: "Data Area Officer", path: "/admin/ao" },
    { label: "Data Wilayah", path: "/admin/wilayah" },
    { label: "Data Sekolah", path: "/admin/sekolah" },
    { label: "Data Vendor", path: "/admin/vendor" },
    { label: "Data Kepala Dinas", path: "/admin/kadin" },
  ];

=======
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

>>>>>>> 55395b99654a0c44898aa60d46a595d174a20e95
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

            .font-inter {
              font-family: 'Inter', sans-serif;
            }

            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }

            .no-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `,
        }}
      />

      <aside className="relative z-50 hidden h-screen w-[290px] flex-shrink-0 flex-col shadow-2xl lg:flex">
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