/* eslint-disable no-unused-vars */
import React from "react";
import logo_ypamdr from "../assets/img/logo_ypamdr.png";
import simbo_catur_dharma from "../assets/img/simbo_catur_dharma.png";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  ChevronRight,
  ArrowUp,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#1E5AA5] text-white border-t border-white/10 mt-auto overflow-hidden font-sans">
      {/* SLOT IMAGE KANAN ATAS - Diperkecil & Diturunkan posisinya */}
      <div className="absolute top-0 right-0 w-[300px] md:w-[400px] h-full pointer-events-none select-none z-0">
        <img
          src={simbo_catur_dharma}
          alt="Catur Dharma Astra"
          // opacity dipertahankan 40 agar jelas, object-right-bottom agar menempel pojok
          className="w-full h-full object-contain object-right-bottom opacity-40 transform translate-x-16 translate-y-20"
        />
      </div>

      {/* Konten Utama */}
      <div className="relative z-10 container mx-auto px-6 lg:px-12 pt-24 pb-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16 mb-16">
          {/* Section 1: Brand & Social */}
          <div className="lg:col-span-4 space-y-8">
            <img
              src={logo_ypamdr}
              alt="Logo YPA-MDR"
              className="w-36 h-auto brightness-0 invert opacity-100 shadow-sm"
            />
            <p className="text-white/80 text-[14px] leading-relaxed max-w-sm font-medium">
              Membangun masa depan bangsa melalui pendidikan berkualitas di
              daerah tertinggal untuk mewujudkan masyarakat mandiri yang
              berkelanjutan.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-[#1E5AA5] transition-all duration-300 group shadow-lg"
                >
                  <Icon
                    size={20}
                    className="group-hover:scale-110 transition-transform"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Section 2: Program */}
          <div className="lg:col-span-2">
            <h4 className="text-[12px] font-black tracking-[0.25em] uppercase mb-8 text-white/50 border-l-2 border-blue-300 pl-3">
              Program
            </h4>
            <ul className="space-y-5">
              {["Pendidikan", "Kesehatan", "Ekonomi", "Lingkungan"].map(
                (item, i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="text-white/70 hover:text-white transition-all text-[14px] flex items-center group font-bold"
                    >
                      <span className="w-0 group-hover:w-4 h-px bg-blue-300 mr-0 group-hover:mr-3 transition-all duration-300" />
                      {item}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Section 3: Navigasi */}
          <div className="lg:col-span-2">
            <h4 className="text-[12px] font-black tracking-[0.25em] uppercase mb-8 text-white/50 border-l-2 border-blue-300 pl-3">
              Navigasi
            </h4>
            <ul className="space-y-5">
              {["Tentang Kami", "Berita & Artikel", "Galeri", "Kontak"].map(
                (item, i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="text-white/70 hover:text-white transition-all text-[14px] flex items-center group font-bold"
                    >
                      <span className="w-0 group-hover:w-4 h-px bg-blue-300 mr-0 group-hover:mr-3 transition-all duration-300" />
                      {item}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </div>

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
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-white/40 text-[11px] font-black tracking-[0.2em] uppercase">
              © {currentYear} YPA-MDR. All Rights Reserved.
            </p>
            <div className="flex items-center gap-3 text-[11px] text-blue-300/50 font-black uppercase italic tracking-widest">
              <span>Member of Astra</span>
              <span className="w-1.5 h-1.5 bg-white/20 rounded-full" />
              <span>Catur Dharma Astra</span>
            </div>
          </div>

          <div className="flex items-center gap-10">
            <div className="flex gap-8">
              {["Privasi", "Syarat"].map((item, i) => (
                <a
                  key={i}
                  href="#"
                  className="text-white/40 hover:text-white transition-all text-[12px] font-black uppercase tracking-[0.2em]"
                >
                  {item}
                </a>
              ))}
            </div>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="w-12 h-12 rounded-2xl border-2 border-white/10 bg-white/5 hover:bg-white/20 flex items-center justify-center transition-all shadow-2xl group"
            >
              <ArrowUp
                size={20}
                className="group-hover:-translate-y-1 transition-transform"
              />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
