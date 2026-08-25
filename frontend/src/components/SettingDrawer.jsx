/* eslint-disable no-unused-vars */
import React from "react";
import PropTypes from "prop-types";
import { X, ShieldCheck, ChevronRight } from "lucide-react";

// Import komponen-komponen kecil yang sudah kamu buat
import Profile from "./Profile";
import Bahasa from "./Bahasa";
import Notifikasi from "./Notifikasi";
import AppButton from "./ui/AppButton";
import AppIconButton from "./ui/AppIconButton";

const SettingDrawer = ({ isOpen, onClose, user }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex justify-end font-sans">
      {/* 1. Backdrop Blur - Klik luar untuk tutup */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* 2. Window Kecil (Size HP) */}
      <div className="relative w-85 h-screen bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.1)] flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
        {/* HEADER: Profile Ringkas & Hak Akses */}
        <div className="p-8 bg-[#0AC4E0] text-white shrink-0 relative">
          <AppIconButton
            icon={X}
            iconSize={18}
            onClick={onClose}
            ariaLabel="Tutup"
            size="auto"
            variant="gray"
            className="!absolute !top-6 !right-6 !rounded-xl !border-transparent !bg-white/10 !p-2 !text-white hover:!bg-white/20 hover:!text-white active:!scale-90"
          />

          <div className="flex flex-col items-center mt-4">
            <div className="w-20 h-20 rounded-[2rem] bg-white flex items-center justify-center font-black text-[#0AC4E0] text-2xl border-4 border-white/20 shadow-2xl mb-4 uppercase">
              {user.nama?.charAt(0)}
            </div>
            <h2 className="text-lg font-black uppercase tracking-tight leading-none text-center px-4">
              {user.nama}
            </h2>
            <div className="flex items-center gap-1.5 mt-3 px-3 py-1 bg-white/10 rounded-full border border-white/10">
              <ShieldCheck size={10} className="text-emerald-400" />
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-100">
                {user.role} Authority
              </span>
            </div>
          </div>
        </div>

        {/* BODY: Scrollable Settings Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-8 space-y-12">
          {/* Section 1: Data Diri */}
          <section>
            <Profile user={user} />
          </section>

          <div className="h-px bg-gray-50 w-full" />

          {/* Section 2: Bahasa */}
          <section>
            <Bahasa />
          </section>

          <div className="h-px bg-gray-50 w-full" />

          {/* Section 3: Visual & Notif */}
          <section>
            <Notifikasi />
          </section>
        </div>

        {/* FOOTER: Simpan / Tutup */}
        <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex flex-col gap-3 shrink-0">
          <AppButton
            text="Simpan Perubahan"
            onClick={onClose}
            variant="accent"
            size="lg"
            className="!w-full !py-4 !text-[10px] !tracking-[0.2em] !shadow-lg !shadow-blue-900/10 hover:!bg-[#0899B0]"
          />
          <p className="text-center text-[8px] font-bold text-gray-300 uppercase tracking-[0.3em]">
            YPA-MDR System v2.0.4
          </p>
        </div>
      </div>
    </div>
  );
};

SettingDrawer.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  user: PropTypes.shape({
    nama: PropTypes.string,
    role: PropTypes.string,
  }).isRequired,
};

export default SettingDrawer;

