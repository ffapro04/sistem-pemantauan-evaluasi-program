/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { Search, Menu, X, Bell, LogIn, ArrowLeft } from "lucide-react";
import logo_ypamdr from "../assets/img/YPA-MDR-LOGO.png";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";

const Navbar = ({
  extraMenu = null,
  showBack = false,
  showProfile = false,
  isDashboard = false,
  // 👇 INI KUNCINYA: Harus didefinisikan di sini dengan nilai default
  searchValue = "",
  onSearchChange = () => { },
}) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 5);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 bg-[#F7F8F0] transition-all duration-300
        ${scrolled ? "shadow-lg shadow-black/20" : ""}`}
      >
        <div className="max-w-[1600px] mx-auto px-10">
          <div className="flex items-center justify-between h-24">
            {/* ================= LEFT ================= */}
            <div className="flex items-center gap-6">
              {/* BACK BUTTON */}
              {showBack && (
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 rounded-full hover:bg-white/10 transition"
                >
                  <ArrowLeft
                    size={30}
                    strokeWidth={2.8}
                    className="text-white"
                  />
                </button>
              )}

              {/* LOGO */}
              <div
                className="w-40 h-16 cursor-pointer"
                onClick={() => navigate("/")}
              >
                <img
                  src={logo_ypamdr}
                  alt="logo"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* EXTRA MENU */}
              {extraMenu && (
                <div className="hidden md:flex items-center gap-8 text-white font-medium">
                  {extraMenu}
                </div>
              )}
            </div>

            {/* ================= RIGHT (DASHBOARD ONLY) ================= */}
            {isDashboard && (
              <div className="hidden md:flex items-center gap-4">
                {/* SEARCH BAR (DESKTOP) */}
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  /> <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Cari..."
                    // 👇 Dipasang di sini biar gak Read-Only
                    value={searchValue}
                    onChange={onSearchChange}
                    className="w-52 pl-11 pr-4 py-2.5 bg-white rounded-2xl
                    focus:outline-none focus:ring-2 focus:ring-[#1E5AA5]/40 border border-gray-200
                    text-sm text-gray-800 transition-all duration-300
                    focus:w-64"
                  />
                </div>

                {/* NOTIFICATION */}
                <button className="relative p-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition">
                  <Bell stroke="#d4af37" fill="#d4af37" className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white">
                    3
                  </span>
                </button>

                {/* LOGIN / PROFILE */}
                {!showProfile ? (
                  <Button
                    text="Masuk"
                    icon={<LogIn size={16} />}
                    className="bg-[#16a34a] text-white hover:bg-[#15803d] shadow-md"
                    onClick={() => navigate("/login")}
                  />
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm"
                    >
                      <img
                        src="/images/profile.jpg"
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </button>

                    {profileOpen && (
                      <div className="absolute right-0 mt-3 w-44 bg-white text-gray-700 rounded-xl shadow-lg">
                        <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-xl">
                          Profil Saya
                        </button>
                        <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                          Pengaturan
                        </button>
                        <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-xl">
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ================= MOBILE BUTTON ================= */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-800"
            >
              {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>

          {/* ================= MOBILE MENU ================= */}
          {isMenuOpen && (
            <div className="md:hidden pb-6 space-y-4 text-gray-800 border-t border-gray-200 pt-4">
              {extraMenu && (
                <div className="flex flex-col gap-3">{extraMenu}</div>
              )}

              {/* SEARCH BAR (MOBILE) */}
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Cari..."
                  value={searchValue}
                  onChange={onSearchChange}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl text-gray-800 border border-gray-200"
                />
              </div>

              {!showProfile && (
                <button
                  onClick={() => navigate("/login")}
                  className="w-full py-2.5 bg-[#16a34a] text-white rounded-xl font-medium"
                >
                  Masuk
                </button>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* SPACER */}
      <div className="h-24" />
    </>
  );
};

export default Navbar;
