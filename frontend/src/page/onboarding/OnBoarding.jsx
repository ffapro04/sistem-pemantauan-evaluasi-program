/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  Flag,
  HeartHandshake,
  LineChart,
  MapPinned,
  MousePointerClick,
  Rocket,
  School,
  ShieldCheck,
  Sparkles,
  Target,
  UploadCloud,
} from "lucide-react";

import { Footer, Navbar } from "../../components/common";
import {
  LoadingScreen,
  SchoolDetailModal,
  SchoolMapPanel,
} from "../../components/onboarding";

import picturependidikan from "../../assets/img/pichture_pendidikan 1.png";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  ""
).replace(/\/$/, "");

const VISION_MISSION_ITEMS = [
  {
    title: "Vision",
    anchor: "vision",
    icon: Target,
    eyebrow: "Arah Utama",
    desc: "Menjadi lembaga sosial yang terkemuka dan kredibel di bidang pendidikan, khususnya di daerah tertinggal yang strategis di Indonesia, agar seluruh elemen pendidikan mampu meningkatkan kualitas akademik, intelektual, kecakapan hidup, seni budaya, serta karakter berdasarkan nilai luhur bangsa Indonesia.",
  },
  {
    title: "Mission",
    anchor: "mission",
    icon: Rocket,
    eyebrow: "Langkah Strategis",
    desc: "Mendorong pendidikan bermutu melalui 4 Pilar Pembinaan serta membangun sinergi antara sekolah binaan dengan stakeholders untuk tercapainya Sekolah Unggul yang berdampak pada kesejahteraan masyarakat menuju Pride of The Nation.",
  },
  {
    title: "Goal",
    anchor: "goal",
    icon: Flag,
    eyebrow: "Target Bersama",
    desc: "Peningkatan kualitas pendidikan di daerah strategis Indonesia melalui 4 Pilar Pembinaan menuju Sekolah Unggul yang mandiri dan berwawasan global.",
  },
  {
    title: "Aim",
    anchor: "aim",
    icon: BadgeCheck,
    eyebrow: "Dampak Jangka Panjang",
    desc: "Melahirkan generasi muda yang mandiri dan peduli untuk membangun daerahnya, sejalan dengan cita-cita Astra untuk sejahtera bersama bangsa.",
  },
];

const PILLARS = [
  {
    title: "Akademik",
    anchor: "pilar-akademik",
    icon: BookOpen,
    desc: "Pemberian pelatihan untuk meningkatkan kompetensi SDM dan mutu pembelajaran.",
    outcome: "Mutu pembelajaran lebih terukur, relevan, dan konsisten.",
  },
  {
    title: "Karakter",
    anchor: "pilar-karakter",
    icon: ShieldCheck,
    desc: "Pembinaan karakter agar warga sekolah memiliki karakter yang didasarkan pada nilai luhur bangsa Indonesia.",
    outcome: "Budaya sekolah yang kuat, kolaboratif, dan berintegritas.",
  },
  {
    title: "Kecakapan Hidup",
    anchor: "pilar-kecakapan-hidup",
    icon: Briefcase,
    desc: "Siswa dibekali kecakapan hidup agar dapat meningkatkan perekonomian di daerahnya.",
    outcome: "Kemandirian, kesiapan kerja, dan keberanian menciptakan peluang.",
  },
  {
    title: "Seni Budaya",
    anchor: "pilar-seni-budaya",
    icon: HeartHandshake,
    desc: "Pembinaan seni budaya agar budaya lokal dapat dilestarikan dan menjadi identitas daerah.",
    outcome: "Warisan budaya tetap hidup sekaligus memiliki nilai tambah bagi daerah.",
  },
];

const FLOW_ITEMS = [
  {
    title: "Pemetaan Kebutuhan",
    icon: FileCheck2,
    desc: "Data sekolah dan hasil assessment menjadi dasar untuk membaca kebutuhan pembinaan secara lebih objektif.",
  },
  {
    title: "Perencanaan Program",
    icon: ClipboardCheck,
    desc: "Program, target sekolah, periode, KPI, dan kebutuhan pelaksana disusun dalam satu alur yang jelas.",
  },
  {
    title: "Pelaksanaan & Monitoring",
    icon: UploadCloud,
    desc: "Aktivitas, bukti, progres, dan tindak lanjut tercatat agar setiap proses mudah dipantau.",
  },
  {
    title: "Evaluasi & Keputusan",
    icon: LineChart,
    desc: "Capaian dan kendala dirangkum menjadi insight untuk evaluasi serta keputusan pembinaan berikutnya.",
  },
];

function normalizeArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.rows)) return payload.rows;
  return [];
}

function flattenWilayah(payload) {
  const result = [];
  const seen = new Set();

  const visit = (item, parentId = null) => {
    if (!item || typeof item !== "object") return;

    const id = item.id_wilayah ?? item.idWilayah ?? item.id;
    const key =
      id != null ? String(id) : `${item.nama_wilayah || item.nama}-${parentId}`;

    if (!seen.has(key)) {
      seen.add(key);
      result.push({
        ...item,
        id_wilayah: id,
        id_parent:
          item.id_parent ??
          item.parent_id ??
          item.parent?.id_wilayah ??
          parentId,
      });
    }

    const childCollections = [
      item.children,
      item.kabupaten,
      item.kabupaten_kota,
      item.kota,
      item.wilayah_anak,
      item.sub_wilayah,
    ];

    childCollections.forEach((collection) => {
      if (!Array.isArray(collection)) return;
      collection.forEach((child) => visit(child, id ?? parentId));
    });
  };

  normalizeArray(payload).forEach((item) => visit(item));
  return result;
}

function isActive(value) {
  if (value === undefined || value === null || value === "") return true;
  return (
    value === true ||
    value === 1 ||
    String(value).toLowerCase() === "true" ||
    String(value).toLowerCase() === "aktif"
  );
}

function formatNumber(value) {
  return new Intl.NumberFormat("id-ID").format(Number(value || 0));
}

function getWilayahName(wilayah) {
  return (
    wilayah?.nama_wilayah ||
    wilayah?.nama ||
    wilayah?.name ||
    wilayah?.label ||
    "Seluruh wilayah binaan"
  );
}

function SectionHeader({ label, title, desc, center = true, light = false }) {
  return (
    <div className={`${center ? "mx-auto text-center" : ""} max-w-4xl`}>
      <div
        className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-[0.24em] shadow-[0_12px_40px_rgba(10,196,224,0.10)] backdrop-blur-xl ${light
          ? "border border-white/30 bg-white/20 text-white"
          : "border border-[#0AC4E0]/20 bg-white/85 text-[#0AC4E0]"
          }`}
      >
        <Sparkles size={13} />
        {label}
      </div>

      <h2
        className={`mt-6 text-3xl font-black leading-tight tracking-[-0.06em] md:text-5xl ${light ? "text-white" : "text-[#103F49]"
          }`}
      >
        {title}
      </h2>

      {desc && (
        <p
          className={`mt-5 text-sm font-semibold leading-7 md:text-base ${light ? "text-white/85" : "text-[#5F7E86]"
            }`}
        >
          {desc}
        </p>
      )}
    </div>
  );
}

function CyanToWhiteWave({ position = "bottom" }) {
  const isBottom = position === "bottom";

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 z-20 ${isBottom ? "bottom-[-1px]" : "top-[-1px] rotate-180"
        }`}
    >
      <svg
        viewBox="0 0 1440 210"
        xmlns="http://www.w3.org/2000/svg"
        className="block h-[150px] w-full sm:h-[190px] lg:h-[215px]"
        preserveAspectRatio="none"
      >
        <path
          d="M0 110C150 176 291 182 443 126C598 69 760 36 950 86C1136 135 1287 183 1440 127V210H0V110Z"
          fill="#ffffff"
          opacity="0.42"
        />
        <path
          d="M0 137C170 194 312 192 469 148C655 95 801 86 972 126C1163 171 1286 189 1440 145V210H0V137Z"
          fill="#ffffff"
          opacity="0.62"
        />
        <path
          d="M0 166C169 207 316 202 489 170C683 134 838 130 1019 158C1192 184 1311 190 1440 166V210H0V166Z"
          fill="#ffffff"
        />
      </svg>
    </div>
  );
}

function SoftHeroDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-44 -top-44 h-[560px] w-[560px] rounded-full bg-white/10" />
      <div className="absolute right-[-170px] top-[-210px] h-[720px] w-[720px] rounded-full bg-white/10" />
      <div className="absolute bottom-[120px] left-[30%] h-[360px] w-[720px] rounded-[100%] bg-white/7 blur-2xl" />
      <div className="absolute bottom-[138px] left-0 h-[2px] w-[120%] -rotate-[2deg] bg-white/50" />
      <div className="absolute bottom-[116px] left-[-10%] h-[2px] w-[120%] rotate-[3deg] bg-white/30" />
    </div>
  );
}

function HeroMetric({ label, value }) {
  return (
    <div className="rounded-[1.35rem] border border-white/25 bg-white/15 px-5 py-4 text-white shadow-[0_18px_50px_rgba(0,0,0,0.05)] backdrop-blur-xl">
      <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/75">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black tracking-[-0.06em]">
        {formatNumber(value)}
      </p>
    </div>
  );
}

function HeroSection({ image, stats }) {
  return (
    <section className="relative isolate overflow-hidden bg-[#0AC4E0] px-4 pb-[170px] pt-20 text-white sm:px-6 lg:px-8 lg:pb-[210px] lg:pt-28">
      <SoftHeroDecor />

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-[0.94fr_1.06fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/18 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.22em] text-white shadow-[0_16px_50px_rgba(0,0,0,0.05)] backdrop-blur-xl">
            <span className="h-2 w-2 rounded-full bg-white" />
            YPA-MDR Operational Hub
          </div>

          <h1 className="mt-7 max-w-5xl text-5xl font-black leading-[0.96] tracking-[-0.08em] sm:text-6xl lg:text-7xl">
            Sistem monitoring pembinaan yang bersih, cepat, dan terhubung.
          </h1>

          <p className="mt-7 max-w-2xl text-base font-semibold leading-8 text-white/88 md:text-lg">
            Data wilayah, sekolah, program, assessment, dan evaluasi ditata
            dalam satu alur agar setiap proses pembinaan lebih mudah dipantau.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#peta"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-white px-7 py-4 text-[11px] font-black uppercase tracking-[0.18em] text-[#0AC4E0] shadow-[0_18px_55px_rgba(255,255,255,0.22)] transition hover:-translate-y-0.5 hover:bg-[#F6FDFF]"
            >
              Jelajahi Sekolah
              <ArrowRight size={16} />
            </a>

            <a
              href="#cara-kerja"
              className="inline-flex items-center justify-center gap-3 rounded-full border border-white/30 bg-white/14 px-7 py-4 text-[11px] font-black uppercase tracking-[0.18em] text-white backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/20"
            >
              Cara Kerja
              <ArrowRight size={16} />
            </a>
          </div>

          <div className="mt-11 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <HeroMetric label="Wilayah" value={stats.totalWilayah} />
            <HeroMetric label="Sekolah" value={stats.totalSekolah} />
            <HeroMetric label="Guru" value={stats.totalGuru} />
            <HeroMetric label="Siswa" value={stats.totalSiswa} />
          </div>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-[2.2rem] border border-white bg-white p-5 shadow-[0_34px_100px_rgba(0,0,0,0.08)]">
            <div className="absolute inset-0 bg-white" />
            <div className="relative overflow-hidden rounded-[1.8rem] bg-white">
              <img
                src={image}
                alt="Pendidikan YPA-MDR"
                className="h-[430px] w-full object-contain sm:h-[560px]"
              />
            </div>
          </div>
        </div>
      </div>

      <CyanToWhiteWave position="bottom" />
    </section>
  );
}

function VisionMissionSection() {
  const [vision, ...remainingItems] = VISION_MISSION_ITEMS;
  const VisionIcon = vision.icon;

  return (
    <section className="relative overflow-hidden bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl">
        <SectionHeader
          label="Strategic Direction"
          title="Vision, Mission, Goal, and Aim."
          desc="Arah besar pembinaan disusun sebagai satu rangkaian yang saling menguatkan, dari cita-cita hingga dampak nyata bagi sekolah dan daerah."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div
            id={vision.anchor}
            className="relative scroll-mt-28 overflow-hidden rounded-[2.3rem] border border-[#0AC4E0]/16 bg-gradient-to-br from-[#E9FBFF] via-white to-white p-8 shadow-[0_26px_80px_rgba(10,196,224,0.12)] sm:p-10 lg:p-12"
          >
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#0AC4E0]/15 blur-[80px]" />

            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-[#0AC4E0] text-white shadow-[0_16px_45px_rgba(10,196,224,0.22)]">
                <VisionIcon size={27} />
              </div>

              <p className="mt-10 text-[10px] font-black uppercase tracking-[0.24em] text-[#0AC4E0]">
                {vision.eyebrow}
              </p>

              <h3 className="mt-3 text-5xl font-black uppercase tracking-[-0.08em] text-[#103F49] sm:text-6xl">
                {vision.title}
              </h3>

              <p className="mt-8 max-w-2xl text-base font-semibold leading-8 text-[#5F7E86]">
                {vision.desc}
              </p>

              <div className="mt-10 flex items-start gap-3 rounded-[1.5rem] border border-[#0AC4E0]/14 bg-white/70 p-5 backdrop-blur-xl">
                <CheckCircle2 size={21} className="mt-0.5 shrink-0 text-[#0AC4E0]" />
                <p className="text-sm font-bold leading-7 text-[#4D7179]">
                  Setiap tujuan pembinaan diterjemahkan menjadi alur data yang
                  mudah dipantau, terdokumentasi, dan siap ditindaklanjuti.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5">
            {remainingItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <article
                  id={item.anchor}
                  key={item.title}
                  className="group scroll-mt-28 rounded-[2rem] border border-[#0AC4E0]/12 bg-white p-6 shadow-[0_18px_55px_rgba(10,196,224,0.08)] transition hover:-translate-y-1 hover:border-[#0AC4E0]/25 hover:shadow-[0_24px_70px_rgba(10,196,224,0.14)] sm:p-8"
                >
                  <div className="grid gap-5 sm:grid-cols-[64px_1fr_auto] sm:items-start">
                    <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-[#E9FBFF] text-[#0AC4E0]">
                      <Icon size={24} />
                    </div>

                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#7FA4AB]">
                        {item.eyebrow}
                      </p>
                      <h3 className="mt-2 text-3xl font-black uppercase tracking-[-0.06em] text-[#103F49]">
                        {item.title}
                      </h3>
                      <p className="mt-4 text-sm font-semibold leading-7 text-[#5F7E86]">
                        {item.desc}
                      </p>
                    </div>

                    <span className="hidden text-4xl font-black leading-none text-[#DFF8FC] sm:block">
                      0{index + 2}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function PillarsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activePillar = PILLARS[activeIndex];
  const ActiveIcon = activePillar.icon;

  useEffect(() => {
    const syncActivePillarFromHash = () => {
      const hash = decodeURIComponent(window.location.hash.replace("#", ""));
      const nextIndex = PILLARS.findIndex((pillar) => pillar.anchor === hash);

      if (nextIndex >= 0) {
        setActiveIndex(nextIndex);
      }
    };

    syncActivePillarFromHash();
    window.addEventListener("hashchange", syncActivePillarFromHash);

    return () => {
      window.removeEventListener("hashchange", syncActivePillarFromHash);
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -right-28 top-20 h-[480px] w-[480px] rounded-full bg-[#0AC4E0]/8 blur-[85px]" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-[420px] w-[420px] rounded-full bg-cyan-100/55 blur-[90px]" />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeader
          label="4 Pilar Pembinaan"
          title="Empat fokus yang bergerak dalam satu arah."
          desc="Setiap pilar memperkuat sisi yang berbeda, namun semuanya bertemu pada tujuan yang sama: sekolah yang unggul, mandiri, dan berdampak bagi daerah."
        />

        <div className="mt-14 overflow-hidden rounded-[2.4rem] border border-[#0AC4E0]/14 bg-white/86 p-4 shadow-[0_30px_90px_rgba(10,196,224,0.12)] backdrop-blur-xl lg:p-6">
          <div className="grid gap-3 md:grid-cols-4">
            {PILLARS.map((pillar, index) => {
              const Icon = pillar.icon;
              const active = index === activeIndex;

              return (
                <button
                  id={pillar.anchor}
                  key={pillar.title}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`group scroll-mt-28 rounded-[1.6rem] border px-5 py-5 text-left transition ${active
                    ? "border-[#0AC4E0]/30 bg-[#E9FBFF] shadow-[0_18px_45px_rgba(10,196,224,0.12)]"
                    : "border-transparent bg-white hover:border-[#0AC4E0]/15 hover:bg-[#F7FDFF]"
                    }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl transition ${active
                        ? "bg-[#0AC4E0] text-white"
                        : "bg-[#E9FBFF] text-[#0AC4E0]"
                        }`}
                    >
                      <Icon size={22} />
                    </span>
                    <ArrowRight
                      size={17}
                      className={active ? "text-[#0AC4E0]" : "text-[#C0DDE3]"}
                    />
                  </div>

                  <p className="mt-5 text-[9px] font-black uppercase tracking-[0.22em] text-[#7FA4AB]">
                    Pilar 0{index + 1}
                  </p>
                  <p className="mt-1 text-lg font-black text-[#103F49]">
                    {pillar.title}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-5 rounded-[2rem] border border-[#0AC4E0]/14 bg-gradient-to-br from-white via-[#F7FDFF] to-[#E9FBFF] p-7 sm:p-9 lg:p-11">
            <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
              <div>
                <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-[#0AC4E0] text-white shadow-[0_18px_45px_rgba(10,196,224,0.24)]">
                  <ActiveIcon size={29} />
                </div>

                <p className="mt-8 text-[10px] font-black uppercase tracking-[0.24em] text-[#0AC4E0]">
                  Fokus Pembinaan
                </p>

                <h3 className="mt-2 text-4xl font-black tracking-[-0.07em] text-[#103F49] sm:text-5xl">
                  {activePillar.title}
                </h3>
              </div>

              <div>
                <p className="max-w-3xl text-base font-semibold leading-8 text-[#5F7E86]">
                  {activePillar.desc}
                </p>

                <div className="mt-7 rounded-[1.5rem] border border-[#0AC4E0]/14 bg-white/80 p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      size={20}
                      className="mt-0.5 shrink-0 text-[#0AC4E0]"
                    />
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#7FA4AB]">
                        Dampak yang dituju
                      </p>
                      <p className="mt-2 text-sm font-black leading-6 text-[#103F49]">
                        {activePillar.outcome}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-7 grid grid-cols-4 gap-2">
                  {PILLARS.map((pillar, index) => (
                    <div
                      key={pillar.title}
                      className={`h-2 rounded-full transition ${index === activeIndex ? "bg-[#0AC4E0]" : "bg-[#DFF8FC]"
                        }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkflowSection() {
  return (
    <section
      id="cara-kerja"
      className="relative overflow-hidden bg-white px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-[#DFF8FC]" />

      <div className="mx-auto max-w-7xl">
        <SectionHeader
          label="Cara Kerja Platform"
          title="Dari kebutuhan menjadi keputusan dalam satu alur."
          desc="Proses dibuat sederhana agar data, progres, dan tindak lanjut tidak lagi tersebar di banyak tempat."
        />

        <div className="relative mt-14">
          <div className="absolute left-8 right-8 top-11 hidden h-px bg-[#C9F3F8] lg:block" />

          <div className="grid gap-5 lg:grid-cols-4">
            {FLOW_ITEMS.map((item, index) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="relative rounded-[2rem] border border-[#0AC4E0]/12 bg-white p-7 shadow-[0_18px_55px_rgba(10,196,224,0.08)] transition hover:-translate-y-1 hover:border-[#0AC4E0]/25 hover:shadow-[0_24px_70px_rgba(10,196,224,0.14)]"
                >
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-[1.3rem] bg-[#E9FBFF] text-[#0AC4E0]">
                    <Icon size={24} />
                  </div>

                  <p className="mt-8 text-[10px] font-black uppercase tracking-[0.22em] text-[#7FA4AB]">
                    Step 0{index + 1}
                  </p>

                  <h3 className="mt-2 text-xl font-black leading-tight tracking-[-0.04em] text-[#103F49]">
                    {item.title}
                  </h3>

                  <p className="mt-4 text-sm font-semibold leading-7 text-[#5F7E86]">
                    {item.desc}
                  </p>
                </article>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-5 rounded-[2rem] border border-[#0AC4E0]/14 bg-[#F6FDFF] px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0AC4E0] text-white">
              <CheckCircle2 size={23} />
            </div>

            <div>
              <p className="text-sm font-black text-[#103F49]">
                Lebih mudah dipantau, lebih cepat ditindaklanjuti.
              </p>
              <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-[#5F7E86]">
                Website ini membantu setiap proses pembinaan tetap tersambung,
                terdokumentasi, dan mudah dibaca sehingga tim dapat fokus pada
                keputusan yang benar-benar berdampak.
              </p>
            </div>
          </div>

          <a
            href="#peta"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#0AC4E0] px-6 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-[#08B7D1]"
          >
            Jelajahi Sekolah
            <ArrowRight size={15} />
          </a>
        </div>
      </div>
    </section>
  );
}

function MapSection({
  wilayahList,
  sekolahList,
  selectedWilayah,
  onSelectWilayah,
  onResetFilter,
  onOpenSchool,
}) {
  return (
    <section id="peta" className="relative overflow-hidden bg-white px-4 pb-0 pt-20 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -right-28 top-28 h-[520px] w-[520px] rounded-full bg-[#0AC4E0]/10 blur-[90px]" />
      <div className="pointer-events-none absolute -left-28 top-[420px] h-[420px] w-[420px] rounded-full bg-cyan-100/70 blur-[90px]" />

      <div className="relative z-20 mx-auto max-w-[1600px]">
        <SectionHeader
          label="Registry Sekolah Binaan"
          title="Peta Indonesia yang terhubung langsung dengan data sekolah."
          desc="Pilih provinsi untuk melihat kabupaten binaan, lalu buka marker kabupaten untuk menelusuri sekolah yang terhubung di wilayah tersebut."
        />

        <div className="mt-14">
          <div className="mx-auto mb-7 flex max-w-7xl flex-col gap-4 rounded-[2rem] border border-[#0AC4E0]/14 bg-white/85 px-6 py-5 shadow-[0_22px_70px_rgba(10,196,224,0.12)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0AC4E0] text-white">
                <MapPinned size={20} />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0AC4E0]">
                  Interactive Map
                </p>
                <p className="mt-1 text-sm font-semibold text-[#5F7E86]">
                  Fokus saat ini: {getWilayahName(selectedWilayah)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#0AC4E0]/14 bg-[#F6FDFF] px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#6D98A1]">
                <School size={14} />
                {formatNumber(sekolahList.length)} Sekolah
              </div>

              {selectedWilayah ? (
                <button
                  type="button"
                  onClick={onResetFilter}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0AC4E0] px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-[0_14px_40px_rgba(10,196,224,0.20)] transition hover:bg-[#08B7D1]"
                >
                  Reset Wilayah
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-full border border-[#0AC4E0]/14 bg-[#F6FDFF] px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#6D98A1]">
                  <MousePointerClick size={14} />
                  Pilih Marker
                </div>
              )}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2.8rem] border border-[#DFF8FC] bg-white p-4 shadow-[0_35px_100px_rgba(10,196,224,0.18)] sm:p-5 lg:p-6">
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#0AC4E0]/35 to-transparent" />
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#0AC4E0]/10 blur-[55px]" />
            <div className="pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-[#0AC4E0]/10 blur-[55px]" />

            <div className="relative overflow-hidden rounded-[2.25rem] border border-[#DFF8FC] bg-[#F8FEFF]">
              <SchoolMapPanel
                wilayahList={wilayahList}
                selectedWilayah={selectedWilayah}
                schools={sekolahList}
                totalSchools={sekolahList.length}
                onSelectWilayah={onSelectWilayah}
                onResetFilter={onResetFilter}
                onOpenSchool={onOpenSchool}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative -mx-4 mt-20 bg-[#0AC4E0] pb-16 pt-[190px] sm:-mx-6 lg:-mx-8">
        <CyanToWhiteWave position="top" />

        <div className="pointer-events-none absolute -left-32 bottom-0 h-[420px] w-[420px] rounded-full bg-white/12 blur-[80px]" />
        <div className="pointer-events-none absolute -right-32 bottom-8 h-[520px] w-[520px] rounded-full bg-white/12 blur-[90px]" />
        <div className="pointer-events-none absolute bottom-[92px] left-[-10%] h-[2px] w-[120%] rotate-[3deg] bg-white/30" />
        <div className="pointer-events-none absolute bottom-[124px] left-0 h-[2px] w-[120%] -rotate-[2deg] bg-white/38" />

        <div className="relative mx-auto h-10 max-w-7xl px-4 sm:px-6 lg:px-8" />
      </div>
    </section>
  );
}

function OnBoarding() {
  const [wilayahList, setWilayahList] = useState([]);
  const [sekolahList, setSekolahList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWilayah, setSelectedWilayah] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchoolModal, setSelectedSchoolModal] = useState(null);

  const schoolStats = useMemo(() => {
    const flattenedWilayah = flattenWilayah(wilayahList);
    const provinceCount = flattenedWilayah.filter((item) => {
      const type = String(
        item.jenis_wilayah || item.tipe_wilayah || "",
      ).toUpperCase();

      return (
        type.includes("PROVINSI") ||
        (!item.id_parent && !type.includes("KAB") && !type.includes("KOTA"))
      );
    }).length;

    const totalGuru = sekolahList.reduce(
      (total, item) => total + Number(item.jumlah_guru || 0),
      0,
    );

    const totalSiswa = sekolahList.reduce(
      (total, item) => total + Number(item.jumlah_siswa || 0),
      0,
    );

    return {
      totalWilayah: provinceCount || flattenedWilayah.length,
      totalSekolah: sekolahList.length,
      totalGuru,
      totalSiswa,
      filteredSekolah: sekolahList.length,
    };
  }, [wilayahList, sekolahList]);

  useEffect(() => {
    const fetchOnboardingData = async () => {
      try {
        const [wilayahResponse, sekolahResponse] = await Promise.all([
          axios
            .get(`${API_BASE_URL}/wilayah/tree`)
            .catch(() => axios.get(`${API_BASE_URL}/wilayah`)),
          axios.get(`${API_BASE_URL}/sekolah`),
        ]);

        const wilayahData = normalizeArray(wilayahResponse.data);
        const sekolahData = normalizeArray(sekolahResponse.data);

        const activeWilayah = wilayahData.filter((wilayah) =>
          isActive(wilayah.status),
        );

        const activeSekolah = sekolahData.filter((sekolah) =>
          isActive(sekolah.status),
        );

        setWilayahList(activeWilayah);
        setSekolahList(activeSekolah);
      } catch (error) {
        console.error("Gagal mengambil data onboarding:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOnboardingData();
  }, []);

  const selectWilayah = (wilayah) => {
    setSelectedWilayah(wilayah || null);
  };

  const resetFilter = () => {
    setSelectedWilayah(null);
  };

  const openSchoolModal = (school) => {
    setSelectedSchoolModal(school);
    setIsModalOpen(true);
  };

  const closeSchoolModal = () => {
    setSelectedSchoolModal(null);
    setIsModalOpen(false);
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen w-full overflow-hidden bg-white font-sans text-[#103F49] selection:bg-cyan-400 selection:text-white">
      <Navbar isDashboard />

      <HeroSection image={picturependidikan} stats={schoolStats} />

      <VisionMissionSection />
      <PillarsSection />
      <WorkflowSection />

      <MapSection
        wilayahList={wilayahList}
        sekolahList={sekolahList}
        selectedWilayah={selectedWilayah}
        onSelectWilayah={selectWilayah}
        onResetFilter={resetFilter}
        onOpenSchool={openSchoolModal}
      />

      <Footer />

      <SchoolDetailModal
        isOpen={isModalOpen}
        onClose={closeSchoolModal}
        initialSchool={selectedSchoolModal}
        allSchools={sekolahList}
        wilayahList={flattenWilayah(wilayahList)}
      />
    </div>
  );
}

export default OnBoarding;

