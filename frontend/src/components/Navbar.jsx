/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { Menu, X, Bell, LogIn, ArrowLeft, User, Settings, LogOut } from "lucide-react";
import logo_ypamdr from "../assets/img/logo_ypamdr.png";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Import Komponen Search yang tadi dibuat
import Search from "../components/Search";

const Navbar = ({
  extraMenu = null,
  showBack = false,
  showProfile = false,
  isDashboard = false,
  searchValue = "",
  onSearchChange = () => { },
}) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 border-b leading-none
        ${scrolled
            ? "bg-[#0AC4E0]/95 backdrop-blur-xl border-white/10 py-3 shadow-lg"
            : "bg-[#0AC4E0] border-transparent py-5"}`}
      >
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <div className="flex items-center justify-between">

            {/* ================= LEFT SECTION ================= */}
            <div className="flex items-center gap-8">
              {/* BACK BUTTON */}
              {showBack && (
                <button
                  onClick={() => navigate(-1)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all active:scale-90 border border-white/20"
                >
                  <ArrowLeft size={20} strokeWidth={2.5} />
                </button>
              )}

              {/* LOGO (Small White Inverted) */}
              <div
                className="h-7 cursor-pointer group flex items-center gap-3"
                onClick={() => navigate("/")}
              >
                <img
                  src={logo_ypamdr}
                  alt="logo"
                  className="h-full w-auto object-contain brightness-0 invert transition-transform duration-500 group-hover:scale-105"
                />
                <div className="hidden lg:flex flex-col border-l border-white/20 pl-3 leading-none">
                  <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">YPA-MDR</span>
                  <span className="text-[7px] font-bold text-white/60 uppercase tracking-widest mt-0.5">Astra Foundation</span>
                </div>
              </div>

              {/* EXTRA MENU */}
              {extraMenu && (
                <div className="hidden xl:flex items-center gap-6 text-white/80 font-bold text-[13px] ml-4 uppercase tracking-widest">
                  {extraMenu}
                </div>
              )}
            </div>

            {/* ================= RIGHT SECTION ================= */}
            <div className="flex items-center gap-4 leading-none">
              {isDashboard && (
                <div className="hidden md:flex items-center gap-5">

                  {/* MEMANGGIL KOMPONEN SEARCH MACBOOK STYLE */}
                  <Search
                    variant="transparent"
                    placeholder="Cari data..."
                    value={searchValue}
                    onChange={onSearchChange}
                    className="w-48 xl:w-64"
                  />

                  {/* NOTIFICATION */}
                  <button className="relative w-10 h-10 flex items-center justify-center bg-white/10 rounded-full text-white hover:bg-white/20 transition-all border border-white/10">
                    <Bell size={18} />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#0AC4E0]" />
                  </button>
                </div>
              )}

              {/* AUTH BUTTONS / PROFILE */}
              <div className="hidden md:flex items-center ml-2 leading-none">
                {!showProfile ? (
                  <button
                    onClick={() => navigate("/login")}
                    className="px-8 py-2.5 bg-white text-[#0AC4E0] hover:bg-slate-900 hover:text-white rounded-full text-[11px] font-black uppercase tracking-[0.15em] shadow-xl transition-all active:scale-95 leading-none"
                  >
                    Masuk
                  </button>
                ) : (
                    <div className="relative leading-none">
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                        className={`flex items-center gap-3 p-1 pr-4 rounded-full transition-all border
                      ${profileOpen ? "bg-white/20 border-white/30 shadow-lg" : "bg-white/10 border-white/10 hover:bg-white/15"}`}
                    >
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#0AC4E0] text-[10px] font-black">
                          A
                        </div>
                        <span className="text-[11px] font-black text-white uppercase tracking-wider">Admin</span>
                        <ChevronDown size={14} className={`text-white/60 transition-transform duration-300 ${profileOpen ? "rotate-180" : ""}`} />
                    </button>

                      <AnimatePresence>
                        {profileOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-4 w-60 bg-white rounded-[2rem] shadow-2xl p-2 z-[110] border border-gray-100 overflow-hidden"
                          >
                            <div className="px-5 py-4 border-b border-gray-50 mb-1">
                              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1.5">Authorized User</p>
                              <p className="text-[12px] font-bold text-slate-700 truncate leading-none font-sans">admin@ypamdr.or.id</p>
                            </div>
                            <div className="space-y-1">
                              <button className="flex items-center gap-3 w-full text-left px-5 py-3 text-[12px] font-bold text-slate-600 hover:bg-slate-50 hover:text-[#0AC4E0] rounded-xl transition-all leading-none font-sans">
                                <User size={16} /> Profil Saya
                              </button>
                              <button className="flex items-center gap-3 w-full text-left px-5 py-3 text-[12px] font-bold text-slate-600 hover:bg-slate-50 hover:text-[#0AC4E0] rounded-xl transition-all leading-none font-sans">
                                <Settings size={16} /> Pengaturan
                              </button>
                              <button
                                onClick={() => { localStorage.clear(); navigate("/login"); }}
                                className="flex items-center gap-3 w-full text-left px-5 py-3 text-[12px] font-black text-rose-500 hover:bg-rose-50 rounded-xl transition-all mt-1 uppercase tracking-widest leading-none font-sans"
                              >
                                <LogOut size={16} /> Logout
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                  </div>
                )}
              </div>

              {/* MOBILE MENU TOGGLE */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden w-10 h-10 flex items-center justify-center bg-white/10 rounded-full text-white active:scale-90 transition-all"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* ================= MOBILE MENU ================= */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden overflow-hidden bg-white/10 backdrop-blur-3xl rounded-3xl mt-4 px-4 pb-8 space-y-6"
              >
                <div className="mt-6">
                  {/* SEARCH MOBILE JUGA PAKAI KOMPONEN SEARCH */}
                  <Search
                    variant="transparent"
                    value={searchValue}
                    onChange={onSearchChange}
                  />
                </div>

                {!showProfile && (
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full py-4 bg-white text-[#0AC4E0] rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl"
                  >
                    Masuk
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* SPACER */}
      <div className={scrolled ? "h-16 md:h-16" : "h-20 md:h-24"} />
    </>
  );
};

const ChevronDown = ({ size, className }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
    className={className}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export default Navbar;