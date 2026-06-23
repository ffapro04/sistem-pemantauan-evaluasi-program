/* eslint-disable no-unused-vars */
import React from "react";
import logo_ypamdr from "../assets/img/logo_ypamdr.png";
import pilar1 from "../assets/img/1.png";
import pilar2 from "../assets/img/2.png";
import pilar3 from "../assets/img/3.png";
import pilar4 from "../assets/img/4.png";

import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  ArrowUp,
  ShieldCheck,
  ChevronRight
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const pilarImages = [pilar1, pilar2, pilar3, pilar4];

  return (
    <footer className="relative bg-[#0AC4E0] text-white overflow-hidden font-sans border-t border-white/20">

      {/* ─── BACKGROUND AMBIENT DECOR ─── */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] -z-0 translate-x-1/2 -translate-y-1/2" />

      <div className="relative z-10 container mx-auto px-8 lg:px-20 pt-16 pb-10 max-w-[1600px]">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-16">

          {/* Identitas Brand */}
          <div className="lg:col-span-4 space-y-8">
            <div className="space-y-6">
              <img
                src={logo_ypamdr}
                alt="Logo YPA-MDR"
                className="h-12 w-auto object-contain brightness-0 invert transition-transform hover:scale-105"
              />
              <p className="text-white text-[15px] leading-relaxed font-bold opacity-90 max-w-sm">
                Membangun kemandirian pendidikan melalui program transformasi yang terintegrasi untuk masa depan Bangsa dan Negara.
              </p>
            </div>

            <div className="flex gap-4">
              {[Facebook, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-2xl bg-white/20 border border-white/20 flex items-center justify-center hover:bg-white hover:text-[#0AC4E0] transition-all duration-500">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Sektor Program */}
          <div className="lg:col-span-2">
            <h4 className="text-[10px] font-black tracking-[0.3em] uppercase mb-8 text-white/50">Program</h4>
            <ul className="space-y-4">
              {["Akademik", "Karakter", "Kecakapan Hidup", "Seni Budaya"].map((item, i) => (
                <li key={i}>
                  <a href="#" className="text-white/90 hover:text-white transition-all text-[14px] font-bold flex items-center group">
                    <ChevronRight size={12} className="mr-2 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Direktori */}
          <div className="lg:col-span-2">
            <h4 className="text-[10px] font-black tracking-[0.3em] uppercase mb-8 text-white/50">Direktori</h4>
            <ul className="space-y-4">
              {["Tentang Kami", "Berita Utama", "Galeri Digital", "Hubungi Kami"].map((item, i) => (
                <li key={i}>
                  <a href="#" className="text-white/90 hover:text-white transition-all text-[14px] font-bold flex items-center group">
                    <ChevronRight size={12} className="mr-2 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

<<<<<<< HEAD
          {/* Kontak */}
          <div className="lg:col-span-4 space-y-8">
            <h4 className="text-[10px] font-black tracking-[0.3em] uppercase mb-8 text-white/50">Headquarters</h4>
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <MapPin size={20} />
=======
          {/* Section 4: Kontak */}
          <div className="lg:col-span-4">
            <h4 className="text-[12px] font-black tracking-[0.25em] uppercase mb-8 text-white/50 border-l-2 border-blue-300 pl-3">
              Hubungi Kamis
            </h4>
            <div className="space-y-6">
              <div className="flex gap-5 items-start">
                <MapPin size={22} className="text-blue-300 shrink-0 mt-1" />
                <div className="text-[14px] text-white/80 leading-relaxed font-semibold">
                  <span className="text-white block mb-1 uppercase tracking-wider font-black">
                    Gedung B, AMDI Lt. 5
                  </span>
                  Jl. Gaya Motor Raya No. 8, Jakarta Utara 14330
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <Phone size={18} className="text-blue-300" />
                </div>
                <a
                  href="tel:0216522555"
                  className="text-[15px] text-white hover:text-blue-200 font-black tracking-tight transition-colors"
                >
                  (021) 6522-5555
                </a>
              </div>
              <div className="flex items-center gap-5">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <Mail size={18} className="text-blue-300" />
                </div>
                <a
                  href="mailto:ypamdr@gmail.com"
                  className="text-[15px] text-white hover:text-blue-200 font-black tracking-tight transition-colors"
                >
                  ypamdr@gmail.com
                </a>
>>>>>>> 55395b99654a0c44898aa60d46a595d174a20e95
              </div>
              <p className="text-[14px] text-white font-bold leading-snug">
                Gedung B, AMDI Lt. 5, Jl. Gaya Motor Raya No. 8, Jakarta Utara 14330
              </p>
            </div>
            <div className="space-y-3">
              <a href="mailto:info@ypamdr.or.id" className="flex items-center gap-3 text-[13px] font-black uppercase tracking-tight hover:text-black/30 transition-colors">
                <Mail size={16} className="text-white/50" /> info@ypamdr.or.id
              </a>
              <a href="tel:0216522555" className="flex items-center gap-3 text-[13px] font-black uppercase tracking-tight hover:text-black/30 transition-colors">
                <Phone size={16} className="text-white/50" /> (021) 6522-5555
              </a>
            </div>
          </div>
        </div>

        {/* ─── BOTTOM BAR: LOGO PILAR DI KANAN BAWAH ─── */}
        <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-end gap-10">

          {/* Copyright & Info */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-3">
              <ShieldCheck size={14} className="text-white" />
              <p className="text-white/50 text-[10px] font-black tracking-[0.15em] uppercase leading-none">
                © {currentYear} YPA-MDR • Operational Hub
              </p>
            </div>
            <p className="text-[9px] font-black text-white uppercase tracking-[0.2em] leading-none">
              Astra International Ecosystem
            </p>
          </div>

          {/* Logo 4 Pilar & Action Button */}
          <div className="flex items-center gap-12">
            {/* 4 LOGO PILAR TANPA CARD - WARNA TEGAS */}
            <div className="flex items-center gap-6">
              {pilarImages.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Pilar ${i + 1}`}
                  className="h-9 w-9 object-contain brightness-0 invert opacity-100 hover:scale-110 transition-transform duration-300"
                />
              ))}
            </div>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="w-12 h-12 rounded-2xl bg-white text-[#0AC4E0] hover:bg-slate-900 hover:text-white flex items-center justify-center transition-all duration-500 shadow-2xl active:scale-90"
            >
              <ArrowUp size={20} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;