/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  LogOut,
  Menu,
  Settings,
  User,
  X,
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

  const handleSearchChange = (value) => {
    if (typeof value === "string") {
      onSearchChange(value);
      return;
    }

    onSearchChange(value?.target?.value || "");
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
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_18px_rgba(15,23,42,0.10)] transition-all active:scale-95 md:hidden"
                aria-label="Buka menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -4 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="relative overflow-hidden border-t border-white/15 md:hidden"
              >
                <div className="mx-auto max-w-[1520px] space-y-4 px-5 py-5 sm:px-7">
                  {isDashboard && (
                    {/* <div className="rounded-2xl border border-white/15 bg-white/10 p-2">
                      <Search
                        variant="transparent"
                        placeholder="Cari data..."
                        value={searchValue}
                        onChange={handleSearchChange}
                        className="w-full"
                      />
                    </div> */}
                  )}

                  {extraMenu && (
                    <div className="rounded-xl bg-white/12 p-4 text-[13px] font-bold text-white/85">
                      {extraMenu}
                    </div>
                  )}

                  {!showProfile ? (
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="w-full rounded-xl bg-white py-4 text-[11px] font-black uppercase tracking-widest text-[#0AC4E0] shadow-[0_14px_30px_rgba(15,23,42,0.10)]"
                    >
                      Masuk
                    </button>
                  ) : (
                    <div className="rounded-xl border border-white/15 bg-white/12 p-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/65">
                        Authorized User
                      </p>

                      <p className="mt-1 text-sm font-bold text-white">
                        admin@ypamdr.or.id
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          localStorage.clear();
                          navigate("/login");
                        }}
                        className="mt-4 w-full rounded-xl bg-white py-3.5 text-[11px] font-black uppercase tracking-widest text-rose-500"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      <div className="h-[82px]" />
    </>
  );
}

export default Navbar;