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
  ChevronRight,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const pilarImages = [pilar1, pilar2, pilar3, pilar4];

  const pillarItems = [
    {
      label: "Akademik",
      note: "Mutu pembelajaran",
      href: "#pilar-akademik",
    },
    {
      label: "Karakter",
      note: "Budaya sekolah",
      href: "#pilar-karakter",
    },
    {
      label: "Kecakapan Hidup",
      note: "Kemandirian siswa",
      href: "#pilar-kecakapan-hidup",
    },
    {
      label: "Seni Budaya",
      note: "Identitas daerah",
      href: "#pilar-seni-budaya",
    },
  ];

  const directionItems = [
    { label: "Vision", note: "Arah utama", href: "#vision" },
    { label: "Mission", note: "Langkah strategis", href: "#mission" },
    { label: "Goal", note: "Target bersama", href: "#goal" },
    { label: "Aim", note: "Dampak jangka panjang", href: "#aim" },
  ];

  const handleScrollToSection = (event, href) => {
    const targetId = String(href || "").replace("#", "");
    const targetElement = document.getElementById(targetId);

    if (!targetElement) return;

    event.preventDefault();

    window.history.pushState(null, "", href);
    window.dispatchEvent(new HashChangeEvent("hashchange"));

    targetElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <footer className="relative overflow-hidden bg-[#0AC4E0] font-sans text-white">
      <div className="relative z-10 mx-auto max-w-[1700px] px-8 pb-11 pt-10 lg:px-24 lg:pb-12 lg:pt-12">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-14">
          {/* Identitas Brand */}
          <div className="space-y-7 lg:col-span-4">
            <div className="space-y-6">
              <img
                src={logo_ypamdr}
                alt="Logo YPA-MDR"
                className="h-14 w-auto object-contain brightness-0 invert transition-transform duration-500 hover:scale-105"
              />

              <p className="max-w-md text-[16px] font-bold leading-8 text-white/92">
                Membangun kemandirian pendidikan melalui program transformasi
                yang terintegrasi untuk masa depan Bangsa dan Negara.
              </p>
            </div>

            <div className="flex gap-4">
              {[Facebook, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/25 bg-white/16 text-white transition-all duration-500 hover:-translate-y-1 hover:bg-white hover:text-[#0AC4E0] hover:shadow-2xl"
                  aria-label={`Social media ${i + 1}`}
                >
                  <Icon size={19} />
                </a>
              ))}
            </div>
          </div>

          {/* 4 Pilar Pembinaan */}
          <div className="lg:col-span-2">
            <h4 className="mb-7 text-[11px] font-black uppercase tracking-[0.32em] text-white/58">
              4 Pilar
            </h4>

            <ul className="space-y-4">
              {pillarItems.map((item, i) => (
                <li key={i}>
                  <a
                    href={item.href}
                    onClick={(event) => handleScrollToSection(event, item.href)}
                    className="group block transition-all hover:translate-x-1"
                  >
                    <span className="flex items-center text-[15px] font-black text-white/95">
                      <ChevronRight
                        size={13}
                        className="-ml-4 mr-2 opacity-0 transition-all duration-300 group-hover:ml-0 group-hover:opacity-100"
                      />
                      {item.label}
                    </span>
                    <span className="mt-1 block pl-0 text-[11px] font-bold text-white/56 group-hover:text-white/75">
                      {item.note}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Strategic Direction */}
          <div className="lg:col-span-2">
            <h4 className="mb-7 text-[11px] font-black uppercase tracking-[0.32em] text-white/58">
              Direction
            </h4>

            <ul className="space-y-4">
              {directionItems.map((item, i) => (
                <li key={i}>
                  <a
                    href={item.href}
                    onClick={(event) => handleScrollToSection(event, item.href)}
                    className="group block transition-all hover:translate-x-1"
                  >
                    <span className="flex items-center text-[15px] font-black text-white/95">
                      <ChevronRight
                        size={13}
                        className="-ml-4 mr-2 opacity-0 transition-all duration-300 group-hover:ml-0 group-hover:opacity-100"
                      />
                      {item.label}
                    </span>
                    <span className="mt-1 block pl-0 text-[11px] font-bold text-white/56 group-hover:text-white/75">
                      {item.note}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak */}
          <div className="space-y-7 lg:col-span-4">
            <h4 className="mb-7 text-[11px] font-black uppercase tracking-[0.32em] text-white/58">
              Headquarters
            </h4>

            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/18">
                <MapPin size={21} />
              </div>

              <p className="text-[15px] font-bold leading-7 text-white/94">
                Gedung B, AMDI Lt. 5, Jl. Gaya Motor Raya No. 8, Jakarta Utara
                14330
              </p>
            </div>

            <div className="space-y-3.5">
              <a
                href="mailto:info@ypamdr.or.id"
                className="flex items-center gap-3 text-[13px] font-black uppercase tracking-tight text-white transition-colors hover:text-white/65"
              >
                <Mail size={17} className="text-white/58" />
                info@ypamdr.or.id
              </a>

              <a
                href="tel:0216522555"
                className="flex items-center gap-3 text-[13px] font-black uppercase tracking-tight text-white transition-colors hover:text-white/65"
              >
                <Phone size={17} className="text-white/58" />
                (021) 6522-5555
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-9 pt-6 md:flex-row md:items-end">
          <div className="flex flex-col items-center gap-3 md:items-start">
            <div className="flex items-center gap-3">
              <ShieldCheck size={15} className="text-white" />
              <p className="text-[10px] font-black uppercase leading-none tracking-[0.16em] text-white/58">
                © {currentYear} YPA-MDR "- Operational Hub
              </p>
            </div>

            <p className="text-[9px] font-black uppercase leading-none tracking-[0.22em] text-white">
              Astra International Ecosystem
            </p>
          </div>

          <div className="flex items-center gap-12">
            <div className="flex items-center gap-6">
              {pilarImages.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Pilar ${i + 1}`}
                  className="h-10 w-10 object-contain brightness-0 invert opacity-100 transition-transform duration-300 hover:scale-110"
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-white text-[#0AC4E0] shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:bg-slate-900 hover:text-white active:scale-90"
              aria-label="Kembali ke atas"
            >
              <ArrowUp size={21} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

