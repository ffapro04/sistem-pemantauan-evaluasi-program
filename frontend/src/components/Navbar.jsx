/* eslint-disable react/prop-types */
import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  LogOut,
  Menu,
  Settings,
  User,
  X,
  Search as SearchIcon,
  Home,
  Target,
  BookOpen,
  Workflow,
  MapPinned,
  LogIn,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import logo_ypamdr from "../assets/img/logo_ypamdr.png";
import Search from "../components/Search";

const ChevronDown = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const MOBILE_NAV_ITEMS = [
  {
    label: "Beranda",
    desc: "Kembali ke bagian awal halaman.",
    href: "#top",
    icon: Home,
  },
  {
    label: "Vision, Mission, Goal, Aim",
    desc: "Arah strategis pembinaan YPA-MDR.",
    href: "#vision",
    icon: Target,
  },
  {
    label: "4 Pilar Pembinaan",
    desc: "Akademik, Karakter, Kecakapan Hidup, dan Seni Budaya.",
    href: "#pilar-akademik",
    icon: BookOpen,
  },
  {
    label: "Cara Kerja",
    desc: "Alur kebutuhan sampai evaluasi.",
    href: "#cara-kerja",
    icon: Workflow,
  },
  {
    label: "Peta Sekolah",
    desc: "Registry sekolah binaan berdasarkan wilayah.",
    href: "#peta",
    icon: MapPinned,
  },
];

function ProfileMenu({ profileOpen, setProfileOpen, navigate }) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setProfileOpen((prev) => !prev)}
        className={`flex items-center gap-3 rounded-xl border px-3 py-2 transition-all duration-200 ${profileOpen
          ? "border-white/45 bg-white/24 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_18px_rgba(15,23,42,0.10)]"
          : "border-white/20 bg-white/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] hover:border-white/35 hover:bg-white/18"
          }`}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[12px] font-black text-[#0AC4E0] shadow-sm">
          A
        </div>

        <div className="hidden text-left lg:block">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/60">
            Authorized
          </p>

          <p className="mt-0.5 text-[12px] font-black uppercase tracking-[0.12em] text-white">
            Admin
          </p>
        </div>

        <ChevronDown
          size={15}
          className={`text-white/70 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""
            }`}
        />
      </button>

      <AnimatePresence>
        {profileOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 z-[120] mt-3 w-72 overflow-hidden rounded-2xl border border-slate-100 bg-white/95 p-2.5 shadow-[0_28px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl"
          >
            <div className="border-b border-slate-100 px-4 py-4">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#0AC4E0]">
                Authorized User
              </p>

              <p className="mt-1 truncate text-[13px] font-bold text-slate-700">
                admin@ypamdr.or.id
              </p>
            </div>

            <div className="mt-2 space-y-1">
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-[13px] font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-[#0AC4E0]"
              >
                <User size={17} />
                Profil Saya
              </button>

              <button
                type="button"
                onClick={() => navigate("/pengaturan-akun")}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-[13px] font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-[#0AC4E0]"
              >
                <Settings size={17} />
                Pengaturan
              </button>

              <button
                type="button"
                onClick={() => {
                  localStorage.clear();
                  navigate("/login");
                }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-[11px] font-black uppercase tracking-[0.14em] text-rose-500 transition-all hover:bg-rose-50"
              >
                <LogOut size={17} />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BrandLogo({ navigate }) {
  return (
    <button
      type="button"
      onClick={() => navigate("/")}
      className="group flex min-w-0 items-center"
      aria-label="Kembali ke beranda"
    >
      <img
        src={logo_ypamdr}
        alt="YPA-MDR"
        className="h-8 w-auto object-contain brightness-0 invert transition-transform duration-300 group-hover:scale-[1.04] sm:h-9"
      />
    </button>
  );
}

function MobileMenuItem({ item, onClick }) {
  const Icon = item.icon || Home;

  return (
    <button
      type="button"
      onClick={() => onClick(item.href)}
      className="group flex w-full items-start gap-4 rounded-[1.35rem] border border-white/15 bg-white/10 px-4 py-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all active:scale-[0.98]"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#0AC4E0] shadow-[0_14px_34px_rgba(2,48,57,0.12)]">
        <Icon size={19} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-black uppercase tracking-[0.08em] text-white">
          {item.label}
        </p>
        <p className="mt-1 text-[11px] font-semibold leading-5 text-white/68">
          {item.desc}
        </p>
      </div>
    </button>
  );
}

function Navbar({
  extraMenu = null,
  showBack = false,
  showProfile = false,
  isDashboard = false,
  searchValue = "",
  onSearchChange = () => { },
}) {
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const mobileMenuItems = useMemo(() => MOBILE_NAV_ITEMS, []);

  useEffect(() => {
    const getScrollTop = () => {
      const pageScroll = window.scrollY || document.documentElement.scrollTop;

      const scrollContainers = document.querySelectorAll(
        ".simple-scroll, [data-page-scroll='true']",
      );

      const containerScroll = Array.from(scrollContainers).some(
        (item) => item.scrollTop > 8,
      );

      return pageScroll > 8 || containerScroll;
    };

    const handleScroll = () => {
      setScrolled(getScrollTop());
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    const scrollContainers = document.querySelectorAll(
      ".simple-scroll, [data-page-scroll='true']",
    );

    scrollContainers.forEach((item) => {
      item.addEventListener("scroll", handleScroll, { passive: true });
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);

      scrollContainers.forEach((item) => {
        item.removeEventListener("scroll", handleScroll);
      });
    };
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  const handleSearchChange = (value) => {
    if (typeof value === "string") {
      onSearchChange(value);
      return;
    }

    onSearchChange(value?.target?.value || "");
  };

  const handleMobileNavigation = (href) => {
    setIsMenuOpen(false);

    if (!href || href === "#top") {
      if (window.location.pathname !== "/") {
        navigate("/");
        setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 120);
        return;
      }

      window.history.pushState(null, "", "#top");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const targetId = href.replace("#", "");

    const scrollToTarget = () => {
      const targetElement = document.getElementById(targetId);

      if (!targetElement) {
        window.history.pushState(null, "", href);
        return;
      }

      window.history.pushState(null, "", href);
      window.dispatchEvent(new HashChangeEvent("hashchange"));

      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    };

    if (window.location.pathname !== "/") {
      navigate(`/${href}`);
      setTimeout(scrollToTarget, 160);
      return;
    }

    scrollToTarget();
  };

  return (
    <>
      <nav
        className={`fixed left-0 right-0 top-0 z-[100] w-full border-b border-cyan-200/25 bg-[#0AC4E0] transition-shadow duration-300 ${scrolled
          ? "shadow-[0_10px_28px_rgba(15,23,42,0.14),0_4px_16px_rgba(10,196,224,0.18)]"
          : "shadow-[0_5px_18px_rgba(10,196,224,0.14)]"
          }`}
      >
        <div className="relative overflow-visible">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/45" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-cyan-200/40" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-[420px] bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute left-0 top-0 h-full w-[300px] bg-cyan-100/10 blur-3xl" />

          <div className="relative mx-auto flex min-h-[82px] max-w-[1520px] items-center justify-between gap-5 px-5 sm:px-7 lg:px-10">
            <div className="flex min-w-0 items-center gap-4 sm:gap-5 lg:gap-6">
              {showBack && (
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_18px_rgba(15,23,42,0.10)] transition-all hover:bg-white/20 active:scale-95"
                  aria-label="Kembali"
                >
                  <ArrowLeft size={20} strokeWidth={2.6} />
                </button>
              )}

              <div className="flex items-center gap-4">
                <BrandLogo navigate={navigate} />

                <div className="hidden h-8 w-px bg-white/20 sm:block" />

                <div className="hidden text-left md:block">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/60">
                    YPA-MDR
                  </p>

                  <p className="mt-0.5 text-[13px] font-black uppercase tracking-[0.12em] text-white">
                    Sistem Pemantauan dan Evaluasi Program
                  </p>
                </div>
              </div>

              {extraMenu && (
                <div className="ml-2 hidden items-center gap-5 rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-[12px] font-black uppercase tracking-[0.16em] text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] xl:flex">
                  {extraMenu}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 lg:gap-4">
              {isDashboard && (
                <div className="hidden items-center md:flex">
                  <Search
                    variant="transparent"
                    placeholder="Cari data..."
                    value={searchValue}
                    onChange={handleSearchChange}
                    className="w-56 xl:w-72"
                  />
                </div>
              )}

              <div className="hidden items-center md:flex">
                {!showProfile ? (
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="rounded-xl bg-white px-8 py-3.5 text-[11px] font-black uppercase tracking-[0.16em] text-[#0AC4E0] shadow-[0_10px_24px_rgba(15,23,42,0.14)] transition-all hover:bg-slate-900 hover:text-white active:scale-95"
                  >
                    Masuk
                  </button>
                ) : (
                    <ProfileMenu
                      profileOpen={profileOpen}
                      setProfileOpen={setProfileOpen}
                      navigate={navigate}
                    />
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_18px_rgba(15,23,42,0.10)] transition-all active:scale-95 md:hidden"
                aria-label={isMenuOpen ? "Tutup menu" : "Buka menu"}
              >
                {isMenuOpen ? <X size={25} /> : <Menu size={25} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            key="mobile-navbar-menu"
            className="fixed inset-x-0 bottom-0 top-[82px] z-[95] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Tutup menu"
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-slate-950/24 backdrop-blur-[3px]"
            />

            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="relative mx-4 mt-4 max-h-[calc(100vh-112px)] overflow-y-auto rounded-[2rem] border border-white/20 bg-[#0AC4E0] p-4 shadow-[0_30px_90px_rgba(2,48,57,0.32)]"
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

              <div className="relative">
                <div className="mb-4 rounded-[1.5rem] border border-white/15 bg-white/10 px-4 py-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/60">
                    Navigation
                  </p>
                  <h3 className="mt-1 text-2xl font-black tracking-[-0.06em] text-white">
                    Jelajahi YPA-MDR
                  </h3>
                  <p className="mt-2 text-[12px] font-semibold leading-6 text-white/70">
                    Pilih bagian halaman untuk melihat informasi pembinaan,
                    pilar, alur kerja, dan peta sekolah.
                  </p>
                </div>

                {isDashboard && (
                  <div className="mb-4 rounded-[1.35rem] border border-white/15 bg-white/10 p-2">
                    <Search
                      variant="transparent"
                      placeholder="Cari data..."
                      value={searchValue}
                      onChange={handleSearchChange}
                      className="w-full"
                    />
                  </div>
                )}

                <div className="space-y-3">
                  {mobileMenuItems.map((item) => (
                    <MobileMenuItem
                      key={item.href}
                      item={item}
                      onClick={handleMobileNavigation}
                    />
                  ))}
                </div>

                {extraMenu && (
                  <div className="mt-4 rounded-[1.35rem] border border-white/15 bg-white/10 p-4 text-[13px] font-bold text-white/85">
                    {extraMenu}
                  </div>
                )}

                <div className="mt-4">
                  {!showProfile ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate("/login");
                      }}
                      className="flex w-full items-center justify-center gap-3 rounded-[1.35rem] bg-white py-4 text-[11px] font-black uppercase tracking-widest text-[#0AC4E0] shadow-[0_18px_38px_rgba(2,48,57,0.14)] active:scale-[0.98]"
                    >
                      <LogIn size={17} />
                      Masuk Sistem
                    </button>
                  ) : (
                      <div className="rounded-[1.35rem] border border-white/15 bg-white/10 p-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/65">
                        Authorized User
                      </p>

                      <p className="mt-1 text-sm font-bold text-white">
                        admin@ypamdr.or.id
                      </p>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setIsMenuOpen(false);
                              navigate("/pengaturan-akun");
                            }}
                            className="rounded-xl bg-white/14 py-3 text-[10px] font-black uppercase tracking-widest text-white"
                          >
                            Pengaturan
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              localStorage.clear();
                              navigate("/login");
                            }}
                            className="rounded-xl bg-white py-3 text-[10px] font-black uppercase tracking-widest text-rose-500"
                          >
                            Logout
                          </button>
                        </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-[82px]" />
    </>
  );
}

export default Navbar;
