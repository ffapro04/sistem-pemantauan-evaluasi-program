/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { jwtDecode } from "jwt-decode";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  BarChart3,
  CalendarDays,
  UsersRound,
  Building2,
  MapPin,
  School,
  Layers,
  GraduationCap,
  BriefcaseBusiness,
  Landmark,
  ClipboardList,
  FileCheck2,
  MessageCircle,
  Mail,
  Bell,
  CheckCircle2,
  Menu,
  X,
  LogOut,
  Clock3,
  ShieldCheck,
  ChevronRight,
  BookOpenCheck,
  UserCog,
  Newspaper,
  Home,
  Settings,
} from "lucide-react";

import { getHoAllowedJenjang, normalizeValue } from "../utils/hoAccess";
import { clearAuthSession, getAuthToken } from "../utils/authSession";
import { API_BASE_URL } from "../config/apiBase.js";

const roleNameMap = {
  1: "Admin",
  2: "Pengurus",
  3: "Head Office",
  4: "Area Officer",
  5: "Sekolah",
  6: "Vendor",
  7: "Kepala Dinas",
  8: "Guru Assessment",
  9: "Operator Sekolah",
  10: "Kepala Sekolah",
};

const USE_FLOATING_ROLE_NAVIGATION = false;

const getInitial = (value) => {
  const raw = String(value || "U").trim();
  return raw.charAt(0).toUpperCase();
};

const getAssetUrl = (path, fallbackFolder = "") => {
  if (!path) return "";

  const value = String(path).trim();
  if (!value) return "";

  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/")) return `${API_BASE_URL}${value}`;
  if (value.startsWith("uploads/")) return `${API_BASE_URL}/${value}`;

  if (fallbackFolder) {
    return `${API_BASE_URL}/uploads/${fallbackFolder}/${value}`;
  }

  return `${API_BASE_URL}/${value}`;
};

const getUserAvatarUrl = (user = {}) => {
  if (user?.foto_profile) {
    return getAssetUrl(user.foto_profile, "users");
  }

  if (user?.logo_url) {
    return getAssetUrl(user.logo_url);
  }

  return "";
};

const getSekolahIdFromToken = (decoded) => {
  return (
    decoded?.id_sekolah ||
    decoded?.sekolah_id ||
    decoded?.school_id ||
    decoded?.sekolah?.id_sekolah ||
    decoded?.sekolah?.id ||
    decoded?.school?.id_sekolah ||
    decoded?.school?.id ||
    null
  );
};

const isOperatorSekolahUser = (user = {}) => {
  const idRole = Number(user?.id_role || user?.role_id || 0);
  const role = String(user?.role || user?.nama_role || "").toLowerCase();
  const jabatan = String(user?.jabatan || "").toLowerCase();

  if (
    idRole === 10 ||
    role.includes("kepala sekolah") ||
    jabatan.includes("kepala sekolah")
  ) {
    return false;
  }

  return (
    idRole === 5 ||
    idRole === 9 ||
    role.includes("operator") ||
    jabatan.includes("operator sekolah") ||
    jabatan.includes("operator")
  );
};

const isKepalaSekolahUser = (user = {}) => {
  const idRole = Number(user?.id_role || user?.role_id || 0);
  const role = String(user?.role || user?.nama_role || "").toLowerCase();
  const jabatan = String(user?.jabatan || "").toLowerCase();

  return (
    idRole === 10 ||
    role.includes("kepala sekolah") ||
    jabatan.includes("kepala sekolah")
  );
};

const getUserJenjang = (user = {}) => {
  return String(
    user?.jenjang ||
    user?.sekolah?.jenjang ||
    user?.school?.jenjang ||
    "",
  ).toUpperCase();
};

const getRoleMenus = (idRole, hoUser) => {
  const isOperator = isOperatorSekolahUser(hoUser);
  if (idRole === null || idRole === undefined) return [];

  const adminMenus = [
    {
      label: "Ikhtisar",
      items: [
        { label: "Ikhtisar", path: "/admin/dashboard", icon: LayoutDashboard },
        { label: "Agenda", path: "/admin/agenda", icon: CalendarDays },
      ],
    },
    {
      label: "Manajemen Data",
      items: [
        { label: "Data Pengurus", path: "/admin/pengurus", icon: UsersRound },
        { label: "Data Head Office", path: "/admin/ho", icon: Building2 },
        { label: "Data Area Officer", path: "/admin/ao", icon: UserCog },
        { label: "Data Wilayah", path: "/admin/wilayah", icon: MapPin },
        { label: "Data Sekolah", path: "/admin/sekolah", icon: School },
        { label: "Data Operator Sekolah", path: "/admin/operator-sekolah", icon: GraduationCap },
        { label: "Data Kepala Sekolah", path: "/admin/kepala-sekolah", icon: ShieldCheck },
        { label: "Data Vendor", path: "/admin/vendor", icon: BriefcaseBusiness },
        { label: "Data Kepala Dinas", path: "/admin/kadin", icon: Landmark },
      ],
    },
  ];

  const pengurusMenus = [
    {
      label: "Menu Utama",
      items: [
        { label: "Dashboard", path: "/pengurus/dashboard", icon: LayoutDashboard },
        { label: "Agenda", path: "/pengurus/agenda", icon: CalendarDays },
      ],
    },
  ];

  // ======================= HO MENUS =======================
  const hoMenus = (() => {
    const hoUserLocal = hoUser || { jenis: null, sub_jenis: null };
    getHoAllowedJenjang(hoUserLocal);

    const isNonAkademik = normalizeValue(hoUser?.jenis || "").includes("non");

    if (isNonAkademik) {
      return [
        {
          label: "Ikhtisar",
          items: [
            {
              label: "Dashboard HO",
              path: "/ho/dashboard/non-akademik",
              icon: LayoutDashboard,
            },
            {
              label: "Agenda",
              path: "/ho/penjadwalan/non-akademik",
              icon: CalendarDays,
            },
          ],
        },
        {
          label: "Program",
          items: [
            {
              label: "Daftar Program",
              path: "/ho/daftar-program/non-akademik", // <- Kunci ke non-akademik
              icon: ClipboardList,
            },
            {
              label: "Buat Program Non Akademik",
              path: "/ho/program/non-akademik",
              icon: ClipboardList,
            },
          ],
        },
        {
          label: "Assessment",
          items: [
            {
              label: "Assessment Non Akademik",
              path: "/ho/assessment/non-akademik",
              icon: FileCheck2,
            },
          ],
        },
      ];
    }

    // Akademik
    return [
      {
        label: "Ikhtisar",
        items: [
          {
            label: "Dashboard HO",
            path: "/ho/dashboard/akademik",
            icon: LayoutDashboard,
          },
          {
            label: "Agenda",
            path: "/ho/penjadwalan/akademik",
            icon: CalendarDays,
          },
        ],
      },
      {
        label: "Program",
        items: [
          {
            label: "Daftar Program",
            path: "/ho/daftar-program/akademik", // <- Kunci ke akademik
            icon: ClipboardList,
          },
          {
            label: "Buat Program Akademik",
            path: "/ho/program/akademik",
            icon: BookOpenCheck,
          },
        ],
      },
      {
        label: "Assessment",
        items: [
          {
            label: "Assessment Akademik",
            path: "/ho/assessment/akademik",
            icon: FileCheck2,
          },
        ],
      },
    ];
  })();

  const aoMenus = [
    {
      label: "Menu Utama",
      items: [
        { label: "Dashboard", path: "/ao/dashboard", icon: LayoutDashboard },
        { label: "Agenda", path: "/ao/agenda", icon: CalendarDays },
        { label: "Review Upload", path: "/ao/program", icon: FileCheck2 },
      ],
    },
  ];

  const sekolahMenus = [
    {
      label: "Ikhtisar",
      items: [
        {
          label: "Dashboard Sekolah",
          path: "/sekolah/dashboard",
          icon: LayoutDashboard,
        },
        {
          label: "Agenda",
          path: "/sekolah/agenda",
          icon: CalendarDays,
        },
      ],
    },
    {
      label: "Akademik",
      items: [
        {
          label: "Assessment",
          path: "/sekolah/assessment",
          icon: ClipboardList,
        },
        {
          label: "Program Sekolah",
          path: "/sekolah/program",
          icon: FileCheck2,
        },
        {
          label: "Daftar Guru",
          path: "/sekolah/daftar-guru",
          icon: GraduationCap,
        },
        {
          label: "Berita Acara",
          path: "/sekolah/berita-acara",
          icon: Newspaper,
        },
      ],
    },
  ];

  const kepalaSekolahMenus = [
    {
      label: "Ikhtisar",
      items: [
        {
          label: "Dashboard Kepala Sekolah",
          path: "/kepala-sekolah/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
  ];

  const vendorMenus = [
    {
      label: "Ikhtisar",
      items: [
        { label: "Dashboard Vendor", path: "/vendor/dashboard", icon: LayoutDashboard },
        { label: "Agenda", path: "/vendor/agenda", icon: CalendarDays },
        { label: "Program Vendor", path: "/vendor/program", icon: ClipboardList },
      ],
    },
  ];

  const kadinMenus = [
    {
      label: "Menu Utama",
      items: [
        { label: "Dashboard", path: "/kepala-dinas/dashboard", icon: LayoutDashboard },
        { label: "Agenda", path: "/kepala-dinas/agenda", icon: CalendarDays },
        { label: "Sekolah", path: "/kepala-dinas/sekolah", icon: School },
      ],
    },
  ];

  const guruMenus = [
    {
      label: "Ikhtisar",
      items: [
        { label: "Dashboard Sekolah", path: "/sekolah/dashboard", icon: LayoutDashboard },
        { label: "Agenda", path: "/sekolah/agenda", icon: CalendarDays },
      ],
    },
    {
      label: "Akademik",
      items: [
        { label: "Assessment", path: "/sekolah/assessment", icon: ClipboardList },
        { label: "Program Sekolah", path: "/sekolah/program", icon: FileCheck2 },
        { label: "Berita Acara", path: "/sekolah/berita-acara", icon: Newspaper },
      ],
    },
  ];

  const operatorSekolahMenus = [
    {
      label: "Ikhtisar",
      items: [
        { label: "Dashboard", path: "/sekolah/dashboard", icon: LayoutDashboard },
        { label: "Agenda", path: "/sekolah/agenda", icon: CalendarDays },
      ],
    },
    {
      label: "Akademik",
      items: [
        { label: "Assessment", path: "/sekolah/assessment", icon: ClipboardList },
        { label: "Program Sekolah", path: "/sekolah/program", icon: FileCheck2 },
        { label: "Berita Acara", path: "/sekolah/berita-acara", icon: Newspaper },
      ],
    },
    {
      label: "Kelola Data",
      items: [
        { label: "Daftar Kelas", path: "/sekolah/kelas", icon: School },

        ...(getUserJenjang(hoUser) === "SMK"
          ? [
            {
              label: "Jurusan SMK",
              path: "/sekolah/jurusan",
              icon: Layers,
            },
          ]
          : []),

        { label: "Daftar Guru", path: "/sekolah/guru", icon: GraduationCap },
      ],
    },
  ];

  if (Number(idRole) === 1) return adminMenus;
  if (Number(idRole) === 2) return pengurusMenus;
  if (Number(idRole) === 3) return hoMenus;
  if (Number(idRole) === 4) return aoMenus;
  if (isKepalaSekolahUser(hoUser) || Number(idRole) === 10) return kepalaSekolahMenus;
  if (isOperator) return operatorSekolahMenus;
  if (Number(idRole) === 5) return sekolahMenus;
  if (Number(idRole) === 6) return vendorMenus;
  if (Number(idRole) === 7) return kadinMenus;
  if (Number(idRole) === 8) return guruMenus;
  if (Number(idRole) === 9) return operatorSekolahMenus;
  return adminMenus;
};

const getMenuTitle = (user = {}) => {
  if (isKepalaSekolahUser(user)) return "Menu Kepala Sekolah";
  if (isOperatorSekolahUser(user)) return "Menu Operator Sekolah";

  const idRole = Number(user?.id_role);

  if (idRole === 1) return "Menu Admin";
  if (idRole === 2) return "Menu Pengurus";
  if (idRole === 3) return "Menu Head Office";
  if (idRole === 4) return "Menu Area Officer";
  if (idRole === 5) return "Menu Sekolah";
  if (idRole === 6) return "Menu Vendor";
  if (idRole === 7) return "Menu Kepala Dinas";
  if (idRole === 8) return "Menu Guru";
  if (idRole === 9) return "Menu Operator Sekolah";
  if (idRole === 10) return "Menu Kepala Sekolah";

  return "Menu Sistem";
};

const getRoleLabel = (user = {}) => {
  if (isKepalaSekolahUser(user)) return "Kepala Sekolah";
  if (isOperatorSekolahUser(user)) return "Operator Sekolah";

  const idRole = Number(user?.id_role);

  return roleNameMap[idRole] || user?.role || "User";
};

const safeJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

const normalizeNotificationRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  return [];
};

const getNotificationIcon = (type) => {
  const value = String(type || "").toUpperCase();
  if (value.includes("AGENDA") || value.includes("COE")) return CalendarDays;
  if (value.includes("ASSESSMENT")) return ClipboardList;
  if (value.includes("PROGRAM")) return FileCheck2;
  if (value.includes("PESAN") || value.includes("MESSAGE")) return MessageCircle;
  return Bell;
};

// Notifikasi backend disimpan sebagai enum mentah (mis. PROGRAM_ACTIVITY_DEADLINE);
// map ini menerjemahkannya jadi label yang enak dibaca di UI notifikasi.
const NOTIFICATION_TYPE_LABELS = {
  PROGRAM_ACTIVITY_DEADLINE: "Tenggat Aktivitas",
  PROGRAM_OPENING_DEADLINE: "Tenggat Pembukaan",
  PROGRAM_CREATED: "Program Baru",
  PROGRAM_RATING: "Penilaian Program",
  PROGRAM_EVIDENCE_UPLOADED: "Bukti Diupload",
  PROGRAM_EVIDENCE_AO_APPROVED: "Bukti Disetujui AO",
  PROGRAM_EVIDENCE_AO_REJECTED: "Bukti Ditolak AO",
  PROGRAM_EVIDENCE_HO_APPROVED: "Bukti Disetujui HO",
  PROGRAM_EVIDENCE_HO_REJECTED: "Bukti Ditolak HO",
  ASSESSMENT_SENT: "Assessment Baru",
  GURU: "Data Guru",
  JURUSAN: "Data Jurusan",
  KELAS: "Data Kelas",
  SEKOLAH: "Data Sekolah",
  AGENDA: "Agenda",
  AGENDA_STATUS: "Status Agenda",
  PROFILE_UPDATE: "Profil Diperbarui",
  PASSWORD_RESET: "Reset Kata Sandi",
};

const humanizeNotificationTipe = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "Sistem";
  if (NOTIFICATION_TYPE_LABELS[raw]) return NOTIFICATION_TYPE_LABELS[raw];

  return raw
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatNotificationTime = (value) => {
  if (!value) return "Baru saja";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Baru saja";

  const diffMs = Date.now() - date.getTime();
  const minute = Math.floor(diffMs / 60000);
  const hour = Math.floor(diffMs / 3600000);
  const day = Math.floor(diffMs / 86400000);

  if (minute < 1) return "Baru saja";
  if (minute < 60) return `${minute} menit lalu`;
  if (hour < 24) return `${hour} jam lalu`;
  if (day === 1) return "Kemarin";
  if (day < 7) return `${day} hari lalu`;

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const normalizeNotification = (item = {}) => ({
  id: item.id_notifikasi || item.id,
  title: item.judul || item.title || "Notifikasi",
  description: item.pesan || item.description || "",
  category: humanizeNotificationTipe(item.tipe || item.category),
  time: formatNotificationTime(item.created_at || item.createdAt),
  unread: !(item.is_read ?? item.read ?? false),
  icon: getNotificationIcon(item.tipe || item.category),
  targetUrl: item.target_url || item.targetUrl || "",
  raw: item,
});

const MarqueeText = ({ text }) => {
  const value = text || "User Account";
  const truncated = value.length > 20 ? value.substring(0, 18) + "..." : value;
  return (
    <div className="sidebar-marquee-wrap max-w-[150px]">
      <div className="sidebar-marquee-track">
        <span>{truncated}</span>
        <span aria-hidden="true">{truncated}</span>
      </div>
    </div>
  );
};

MarqueeText.propTypes = {
  text: PropTypes.string,
};

// Kartu akun tunggal di footer sidebar: strip status/jam, identitas (avatar +
// nama + role), lalu aksi notifikasi/pengaturan — menggantikan ClockBox dan
// UserProfileCard yang sebelumnya tampil sebagai beberapa kotak terpisah.
const AccountCard = ({
  user,
  label,
  unreadCount,
  now,
  onProfileClick,
  onNotificationClick,
  onSettingsClick,
}) => {
  const avatarUrl = getUserAvatarUrl(user);

  return (
    <div className="overflow-hidden rounded-[1.4rem] border border-slate-100 bg-white shadow-[0_16px_38px_rgba(15,23,42,0.07)]">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/80 px-3.5 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-[6px] w-[6px] rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.16)]" />
          <span className="text-[7px] font-black uppercase tracking-[0.16em] text-slate-400">Tersambung</span>
        </div>
        <span className="text-[10px] font-black tabular-nums text-slate-500">
          {now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      <button
        type="button"
        onClick={onProfileClick}
        className="flex w-full items-center gap-2.5 px-3.5 py-3 text-left transition-colors active:scale-[0.99] hover:bg-[#0AC4E0]/5"
        title="Lihat profil"
      >
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#0AC4E0] to-[#0899B0] shadow-[0_10px_22px_rgba(10,196,224,0.28)]">
          <div className="flex h-full w-full items-center justify-center text-[15px] font-black uppercase text-white">
            {getInitial(user?.nama)}
          </div>
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt={user?.nama || "Profile"}
              className="absolute inset-0 h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.remove();
              }}
            />
          )}
          <span className="absolute -bottom-0.5 -right-0.5 flex h-[17px] w-[17px] items-center justify-center rounded-full border-[2.5px] border-white bg-emerald-500 text-white">
            <CheckCircle2 size={9} />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <MarqueeText text={user?.nama || "User Account"} />
          <div className="mt-1.5 inline-flex max-w-full items-center gap-1 rounded-full bg-[#0AC4E0]/8 px-2 py-0.5 text-[7px] font-black uppercase leading-none tracking-widest text-[#0899B0]">
            <ShieldCheck size={8} />
            <span className="truncate">{label}</span>
          </div>
        </div>

        <ChevronRight size={15} className="shrink-0 text-slate-300" />
      </button>

      <div className="grid grid-cols-2 divide-x divide-slate-100 border-t border-slate-100">
        <button
          type="button"
          onClick={onNotificationClick}
          className="relative flex items-center justify-center gap-1.5 py-2.5 text-[9px] font-black uppercase tracking-wide text-slate-500 transition-colors hover:bg-[#0AC4E0]/5 hover:text-[#0899B0]"
          title="Buka notifikasi"
        >
          <Bell size={13} />
          Notifikasi
          {unreadCount > 0 && (
            <span className="absolute right-[24%] top-1.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full border-2 border-white bg-[#0AC4E0] px-1 text-[8px] font-black text-white shadow-[0_3px_8px_rgba(10,196,224,0.4)]">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={onSettingsClick}
          className="flex items-center justify-center gap-1.5 py-2.5 text-[9px] font-black uppercase tracking-wide text-slate-500 transition-colors hover:bg-[#0AC4E0]/5 hover:text-[#0899B0]"
          title="Pengaturan akun"
        >
          <Settings size={13} />
          Pengaturan
        </button>
      </div>
    </div>
  );
};

AccountCard.propTypes = {
  user: PropTypes.object,
  label: PropTypes.string,
  unreadCount: PropTypes.number,
  now: PropTypes.instanceOf(Date).isRequired,
  onProfileClick: PropTypes.func,
  onNotificationClick: PropTypes.func,
  onSettingsClick: PropTypes.func,
};

const UserMiniProfileModal = ({ open, onClose, user, label }) => {
  const avatarUrl = getUserAvatarUrl(user);
  const email =
    user?.email ||
    user?.email_guru ||
    user?.sekolah?.email_login ||
    user?.school?.email_login ||
    "Email belum tersedia";
  const jabatan =
    user?.jabatan ||
    user?.jenis_guru ||
    user?.jenis ||
    label ||
    "Pengguna Sistem";

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          key="user-mini-profile"
          className="fixed inset-0 z-[999999] isolate"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.button
            type="button"
            aria-label="Tutup profil"
            onClick={onClose}
            variants={{
              hidden: { opacity: 0, backdropFilter: "blur(0px)" },
              visible: { opacity: 1, backdropFilter: "blur(8px)" },
              exit: { opacity: 0, backdropFilter: "blur(0px)" },
            }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 bg-slate-950/35"
          />

          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.6, x: -80, y: 80 }}
              animate={{ opacity: 0.28, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.75, ease: "easeOut" }}
              className="absolute bottom-[-8rem] left-[-6rem] h-[28rem] w-[28rem] rounded-full bg-[#0AC4E0] blur-[120px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.5, x: 80, y: -80 }}
              animate={{ opacity: 0.18, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.05 }}
              className="absolute right-[-7rem] top-[-8rem] h-[26rem] w-[26rem] rounded-full bg-sky-300 blur-[130px]"
            />
          </div>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 py-8 sm:px-6">
            <motion.div
              variants={{
                hidden: {
                  opacity: 0,
                  y: 52,
                  scale: 0.78,
                  rotateX: -16,
                  filter: "blur(14px)",
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  rotateX: 0,
                  filter: "blur(0px)",
                },
                exit: {
                  opacity: 0,
                  y: 28,
                  scale: 0.9,
                  rotateX: 10,
                  filter: "blur(8px)",
                },
              }}
              transition={{
                type: "spring",
                stiffness: 235,
                damping: 21,
                mass: 0.9,
              }}
              className="pointer-events-auto relative w-[min(410px,calc(100vw-2rem))] overflow-hidden rounded-[2.25rem] border border-white/70 bg-white/95 shadow-[0_45px_140px_rgba(2,19,32,0.42)] ring-1 ring-white/80 backdrop-blur-2xl"
              style={{ transformPerspective: 1200 }}
            >
              <motion.div
                aria-hidden="true"
                initial={{ x: "-130%", opacity: 0 }}
                animate={{ x: "180%", opacity: [0, 0.55, 0] }}
                transition={{ duration: 1.15, delay: 0.25, ease: "easeInOut" }}
                className="pointer-events-none absolute inset-y-0 z-30 w-24 -skew-x-12 bg-gradient-to-r from-transparent via-white/60 to-transparent blur-sm"
              />

              <div className="relative overflow-hidden bg-gradient-to-br from-[#0AC4E0] via-[#08B5D0] to-[#067E95] px-6 pb-24 pt-6">
                <motion.div
                  aria-hidden="true"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                  className="pointer-events-none absolute -right-20 -top-24 h-60 w-60 rounded-full border-[34px] border-white/10"
                />
                <motion.div
                  aria-hidden="true"
                  animate={{ scale: [1, 1.15, 1], opacity: [0.18, 0.34, 0.18] }}
                  transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
                  className="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-white/25 blur-3xl"
                />

                <div className="relative flex items-start justify-between gap-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.18, duration: 0.45 }}
                  >
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/70">
                      Profil Pengguna
                    </p>
                    <h3 className="mt-1 text-xl font-black uppercase tracking-tight text-white">
                      Informasi Akun
                    </h3>
                  </motion.div>

                  <motion.button
                    type="button"
                    onClick={onClose}
                    initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ delay: 0.22, type: "spring", stiffness: 320, damping: 18 }}
                    whileHover={{ scale: 1.08, rotate: 6 }}
                    whileTap={{ scale: 0.92 }}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-white shadow-lg backdrop-blur-md transition-colors hover:bg-white hover:text-slate-900"
                  >
                    <X size={18} />
                  </motion.button>
                </div>
              </div>

              <div className="relative px-6 pb-7">
                <div className="-mt-16 flex flex-col items-center text-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.3, rotate: -18 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ delay: 0.18, type: "spring", stiffness: 260, damping: 17 }}
                    className="relative"
                  >
                    <motion.div
                      aria-hidden="true"
                      animate={{ scale: [1, 1.08, 1], opacity: [0.45, 0.15, 0.45] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -inset-3 rounded-[2.5rem] bg-[#0AC4E0]/35 blur-xl"
                    />
                    <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-[2.35rem] border-[7px] border-white bg-[#0AC4E0] text-5xl font-black uppercase text-white shadow-[0_22px_58px_rgba(15,23,42,0.24)]">
                      <span>{getInitial(user?.nama || user?.nama_guru)}</span>
                      {avatarUrl && (
                        <img
                          src={avatarUrl}
                          alt={user?.nama || user?.nama_guru || "Profile"}
                          className="absolute inset-0 h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.remove();
                          }}
                        />
                      )}
                    </div>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.55, type: "spring", stiffness: 400, damping: 15 }}
                      className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-emerald-500 text-white shadow-lg"
                    >
                      <CheckCircle2 size={14} />
                    </motion.span>
                  </motion.div>

                  <motion.span
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.34, duration: 0.4 }}
                    className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-cyan-100 bg-cyan-50 px-3.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-[#0AC4E0] shadow-sm"
                  >
                    <ShieldCheck size={12} />
                    {label || "Akun Sistem"}
                  </motion.span>

                  <motion.h4
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.42 }}
                    className="mt-3 max-w-full break-words text-2xl font-black tracking-tight text-slate-950"
                  >
                    {user?.nama || user?.nama_guru || "User"}
                  </motion.h4>
                </div>

                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.09, delayChildren: 0.42 } },
                  }}
                  className="mt-7 space-y-3"
                >
                  {[
                    { icon: Mail, title: "Email", value: email },
                    { icon: BriefcaseBusiness, title: "Jabatan", value: jabatan },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.title}
                        variants={{
                          hidden: { opacity: 0, x: -22, scale: 0.97 },
                          visible: { opacity: 1, x: 0, scale: 1 },
                        }}
                        whileHover={{ y: -2, scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 260, damping: 22 }}
                        className="group flex items-start gap-3 rounded-[1.5rem] border border-slate-100 bg-slate-50/75 p-4 shadow-sm transition-colors hover:border-cyan-100 hover:bg-cyan-50/50"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#0AC4E0] shadow-sm ring-1 ring-slate-100 transition-transform group-hover:rotate-3 group-hover:scale-105">
                          <Icon size={18} />
                        </div>
                        <div className="min-w-0 pt-0.5">
                          <p className="text-[8px] font-black uppercase tracking-[0.23em] text-slate-400">
                            {item.title}
                          </p>
                          <p className={`mt-1 text-[11px] font-black leading-relaxed text-slate-800 ${item.title === "Email" ? "break-all" : "break-words"}`}>
                            {item.value}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.45 }}
                className="border-t border-slate-100 bg-slate-50/80 px-6 py-4"
              >
                <p className="text-center text-[9px] font-black uppercase tracking-[0.26em] text-slate-300">
                  Sistem Monitoring Evaluasi
                </p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

UserMiniProfileModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  user: PropTypes.object,
  label: PropTypes.string,
};

const UserNotificationModal = ({
  open,
  onClose,
  user,
  label,
  notifications = [],
  loading = false,
  markingAll = false,
  onNotificationClick,
  onMarkAllRead,
}) => {
  const unreadCount = notifications.filter((item) => item.unread).length;
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[300]">
          <motion.button type="button" aria-label="Tutup notifikasi" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px]" />
          <motion.div
            initial={{ opacity: 0, x: -18, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -18, y: 14, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-8 left-1/2 w-[min(440px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-[2.1rem] border border-slate-100 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.18)] xl:left-[300px] xl:translate-x-0"
          >
            <div className="border-b border-slate-100 px-7 py-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.28em] text-[#0AC4E0]">User Hub</p>
                  <h3 className="mt-1.5 text-lg font-black uppercase tracking-tight text-slate-900">Pesan & Notifikasi</h3>
                  <p className="mt-1.5 max-w-[280px] truncate text-[10px] font-bold text-slate-400">{user?.nama || "User"} · {label || "Akun Sistem"}</p>
                </div>
                <button type="button" onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-500 active:scale-95">
                  <X size={17} />
                </button>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#0AC4E0]/15 bg-[#0AC4E0]/5 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-[#0899B0]">
                  <span className="h-[6px] w-[6px] rounded-full bg-[#0AC4E0]" />
                  {unreadCount} Belum Dibaca
                </div>
                <div className="rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
                  {notifications.length} Total
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={onMarkAllRead}
                    disabled={markingAll}
                    className="ml-auto rounded-full border border-slate-100 bg-white px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-slate-400 transition hover:border-cyan-100 hover:text-[#0AC4E0] disabled:opacity-50"
                  >
                    {markingAll ? "Memproses..." : "Tandai Semua Dibaca"}
                  </button>
                )}
              </div>
            </div>
            <div className="max-h-[420px] overflow-y-auto px-[18px] py-[18px]">
              <div className="space-y-3">
                {loading && notifications.length === 0 && (
                  <div className="rounded-[1.5rem] border border-dashed border-cyan-100 bg-cyan-50/40 p-8 text-center">
                    <Bell className="mx-auto mb-3 animate-pulse text-[#0AC4E0]" size={28} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Memuat notifikasi...</p>
                  </div>
                )}
                {notifications.map((item) => {
                  const Icon = item.icon || Bell;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => onNotificationClick?.(item)}
                      className={`relative flex w-full items-start gap-3.5 rounded-[1.3rem] border border-slate-100 bg-white py-[17px] pr-[18px] text-left transition-all hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-md ${item.unread ? "border-l-[3px] border-l-[#0AC4E0] pl-4" : "pl-[18px]"}`}
                    >
                      {item.unread && <span className="absolute right-4 top-[18px] h-[6px] w-[6px] rounded-full bg-[#0AC4E0]" />}
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.85rem] ${item.unread ? "bg-[#0AC4E0]/8 text-[#0899B0]" : "bg-slate-50 text-slate-400 ring-1 ring-inset ring-slate-100"}`}>
                        <Icon size={17} />
                      </div>
                      <div className="min-w-0 flex-1 pr-1">
                        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                          <span className={`text-[9px] font-bold ${item.unread ? "text-[#0899B0]" : "text-slate-400"}`}>{item.category}</span>
                          <span className="text-[9px] font-semibold text-slate-300">· {item.time}</span>
                        </div>
                        <p className="text-[12.5px] font-black leading-snug text-slate-900">{item.title}</p>
                        <p className="mt-1.5 text-[10.5px] font-medium leading-relaxed text-slate-400">{item.description}</p>
                      </div>
                    </button>
                  );
                })}
                {!loading && notifications.length === 0 && (
                  <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                    <Bell className="mx-auto mb-3 text-[#0AC4E0]" size={28} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Belum ada notifikasi.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-4">
              <p className="text-center text-[9px] font-black uppercase tracking-[0.25em] text-slate-300">Sistem Monitoring Evaluasi</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

UserNotificationModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  user: PropTypes.object,
  label: PropTypes.string,
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.node,
      description: PropTypes.node,
      category: PropTypes.node,
      time: PropTypes.node,
      unread: PropTypes.bool,
      icon: PropTypes.elementType,
    }),
  ),
  loading: PropTypes.bool,
  markingAll: PropTypes.bool,
  onNotificationClick: PropTypes.func,
  onMarkAllRead: PropTypes.func,
};

// ===== NOTCH NAVIGATION - MENEMPEL DI ATAS TENGAH =====
const NotchNavigation = ({
  menuGroups,
  location,
  onLogout,
  user,
  roleLabel,
  unreadCount,
  onProfileClick,
  onNotificationClick,
  onSettingsClick,
  now,
  brandTitle = "Pengurus",
  brandSubtitle = "Dashboard",
}) => {
  const avatarUrl = getUserAvatarUrl(user);
  const menuItems = menuGroups.flatMap((group) => group.items || []);

  return (
    <>
      <div className="fixed left-2 right-2 top-3 z-[9999] sm:left-4 sm:right-4 lg:sticky lg:left-auto lg:right-auto lg:top-0 lg:z-[70] lg:h-screen lg:w-[292px] lg:shrink-0 lg:translate-x-0 lg:p-3 xl:w-[304px]">
        <div className="relative mx-auto overflow-hidden rounded-[1.55rem] border border-cyan-100/80 bg-white/92 p-2 text-slate-800 shadow-[0_22px_70px_rgba(15,23,42,0.14)] backdrop-blur-2xl lg:flex lg:h-full lg:flex-col lg:rounded-[1.45rem] lg:shadow-[0_18px_44px_rgba(14,116,144,0.10)]">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#0AC4E0]/35 to-transparent" />
          <div className="pointer-events-none absolute -left-20 top-0 h-24 w-48 rounded-full bg-[#0AC4E0]/12 blur-3xl" />

          <div className="relative flex items-center gap-2 lg:h-full lg:flex-col lg:items-stretch">
            <div className="flex min-w-0 shrink-0 items-center gap-2 rounded-[1.15rem] bg-cyan-50/70 px-2 py-2 ring-1 ring-cyan-100 sm:px-3 lg:w-full lg:px-3 lg:py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0AC4E0] to-[#0899B0] text-white shadow-[0_8px_18px_rgba(10,196,224,0.28)]">
                <Home size={16} />
              </div>
              <div className="hidden min-w-0 sm:block lg:block">
                <p className="max-w-[150px] text-[11px] font-black leading-tight tracking-tight text-slate-950 lg:max-w-none">{brandTitle}</p>
                <p className="mt-1 max-w-[150px] text-[8px] font-bold uppercase tracking-wider text-slate-400 lg:max-w-none">{brandSubtitle}</p>
              </div>
            </div>

            <nav className="no-scrollbar flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto rounded-[1.15rem] bg-slate-50/80 p-1 ring-1 ring-slate-100 lg:w-full lg:flex-none lg:flex-col lg:items-stretch lg:overflow-x-hidden lg:overflow-y-auto lg:bg-transparent lg:p-0 lg:ring-0">
              {menuItems.map((item) => {
                const Icon = item.icon || LayoutDashboard;
                const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={item.label}
                    className={`group relative isolate flex min-h-11 shrink-0 items-center gap-2.5 overflow-hidden rounded-[0.95rem] px-3 py-2 text-[13px] font-black transition-all duration-200 sm:px-4 lg:w-full lg:px-3 ${isActive
                      ? "text-slate-950 shadow-[0_12px_28px_rgba(10,196,224,0.18)]"
                      : "text-slate-500 hover:bg-white hover:text-slate-900"
                      }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="notch-menu-water"
                        className="absolute inset-0 -z-10 overflow-hidden rounded-[0.95rem] bg-cyan-50"
                        transition={{ type: "spring", stiffness: 420, damping: 32 }}
                      >
                        <span className="absolute -left-5 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full bg-[#0AC4E0]/28 blur-xl" />
                        <span className="absolute right-1 top-1 h-8 w-12 rounded-full bg-sky-200/70 blur-lg" />
                        <span className="absolute inset-x-3 bottom-0 h-px bg-gradient-to-r from-transparent via-[#0AC4E0] to-transparent" />
                      </motion.span>
                    )}
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all ${isActive ? "bg-white text-[#0AC4E0] shadow-sm" : "bg-white text-slate-400 ring-1 ring-slate-100 group-hover:text-[#0AC4E0]"}`}>
                      <Icon size={15} />
                    </span>
                    <span className="min-w-0 flex-1 whitespace-normal break-words leading-tight">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="flex shrink-0 items-center gap-1.5 rounded-[1.15rem] bg-slate-50/80 p-1.5 ring-1 ring-slate-100 lg:mt-auto lg:w-full lg:justify-between">
              <div className="hidden items-center gap-1.5 rounded-full px-2 text-[10px] font-bold text-slate-400 xl:flex">
                <Clock3 size={12} className="text-[#0AC4E0]" />
                <span>{now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <button
                type="button"
                onClick={onNotificationClick}
                className="relative flex h-8 w-8 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-400 transition-all hover:border-cyan-100 hover:text-[#0AC4E0] active:scale-95"
                title="Notifikasi"
              >
                <Bell size={14} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-[#0AC4E0] px-1 text-[7px] font-black text-white shadow-lg shadow-[#0AC4E0]/40">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={onSettingsClick}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-400 transition-all hover:border-cyan-100 hover:text-[#0AC4E0] active:scale-95"
                title="Pengaturan akun"
              >
                <Settings size={14} />
              </button>
              <button
                type="button"
                onClick={onProfileClick}
                className="relative"
                title="Lihat profil"
              >
                <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#0AC4E0] to-[#0899B0] text-white text-[10px] font-black uppercase shadow-[0_4px_10px_rgba(10,196,224,0.25)] ring-2 ring-white/10 transition-all hover:scale-105 hover:ring-white/30">
                  <span>{getInitial(user?.nama)}</span>

                  {avatarUrl && (
                    <img
                      src={avatarUrl}
                      alt={user?.nama || "Profile"}
                      className="absolute inset-0 h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.remove();
                      }}
                    />
                  )}
                </div>
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-400 transition-all hover:border-rose-100 hover:bg-rose-50 hover:text-rose-500 active:scale-95"
                title="Keluar"
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `,
      }} />
    </>
  );
};

const menuGroupsPropType = PropTypes.arrayOf(
  PropTypes.shape({
    label: PropTypes.string,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        path: PropTypes.string,
        icon: PropTypes.elementType,
      }),
    ),
  }),
);

NotchNavigation.propTypes = {
  menuGroups: menuGroupsPropType.isRequired,
  location: PropTypes.object.isRequired,
  onLogout: PropTypes.func,
  user: PropTypes.object,
  roleLabel: PropTypes.string,
  unreadCount: PropTypes.number,
  onProfileClick: PropTypes.func,
  onNotificationClick: PropTypes.func,
  onSettingsClick: PropTypes.func,
  now: PropTypes.instanceOf(Date).isRequired,
  brandTitle: PropTypes.string,
  brandSubtitle: PropTypes.string,
};

const RightPoniNavigation = ({
  menuGroups,
  location,
  onLogout,
  user,
  unreadCount,
  onProfileClick,
  onNotificationClick,
  onSettingsClick,
  brandTitle = "Kepala Dinas",
  brandSubtitle = "Wilayah",
}) => {
  const avatarUrl = getUserAvatarUrl(user);
  const menuItems = menuGroups.flatMap((group) => group.items || []);

  return (
    <>
      <aside className="group fixed right-3 top-1/2 z-[70] w-[68px] -translate-y-1/2 overflow-hidden rounded-l-[1.45rem] border border-cyan-100/80 bg-white/95 p-2 text-slate-800 shadow-[0_18px_52px_rgba(15,23,42,0.12)] backdrop-blur-2xl transition-all duration-300 hover:w-[238px] max-lg:right-2 max-lg:w-[64px] max-lg:hover:w-[220px]">
        <div className="pointer-events-none absolute -left-20 top-0 h-40 w-40 rounded-full bg-[#0AC4E0]/15 blur-3xl" />

        <div className="relative mb-2 flex items-center gap-3 rounded-[1.25rem] bg-cyan-50/80 p-2 ring-1 ring-cyan-100">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0AC4E0] to-[#0899B0] text-white shadow-[0_10px_24px_rgba(10,196,224,0.28)]">
            <Home size={17} />
          </div>

          <div className="min-w-0 max-w-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:max-w-[170px] group-hover:opacity-100">
            <p className="truncate text-[12px] font-black leading-none tracking-tight text-slate-950">
              {brandTitle}
            </p>
            <p className="mt-1 truncate text-[8px] font-bold uppercase tracking-wider text-slate-400">
              {brandSubtitle}
            </p>
          </div>
        </div>

        <nav className="relative space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon || LayoutDashboard;
            const isActive =
              location.pathname === item.path ||
              location.pathname.startsWith(`${item.path}/`);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={item.label}
                className={`group/item flex h-12 items-center gap-3 rounded-[1.15rem] px-2 text-[12px] font-black transition-all duration-200 ${isActive
                  ? "bg-cyan-50 text-slate-950 shadow-[0_12px_28px_rgba(10,196,224,0.18)]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${isActive
                    ? "bg-white text-[#0AC4E0] shadow-sm"
                    : "bg-white text-slate-400 ring-1 ring-slate-100 group-hover/item:text-[#0AC4E0]"
                    }`}
                >
                  <Icon size={16} />
                </span>

                <span className="min-w-0 max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover:max-w-[160px] group-hover:opacity-100">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        <div className="relative mt-2 space-y-1 border-t border-slate-100 pt-2">
          <button
            type="button"
            onClick={onNotificationClick}
            title="Notifikasi"
            className="relative flex h-11 w-full items-center gap-3 rounded-[1.15rem] px-2 text-slate-400 transition-all hover:bg-cyan-50 hover:text-[#0AC4E0] active:scale-95"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white ring-1 ring-slate-100">
              <Bell size={15} />
            </span>

            {unreadCount > 0 && (
              <span className="absolute left-8 top-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-[#0AC4E0] px-1 text-[7px] font-black text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}

            <span className="max-w-0 overflow-hidden whitespace-nowrap text-[11px] font-black opacity-0 transition-all duration-300 group-hover:max-w-[150px] group-hover:opacity-100">
              Notifikasi
            </span>
          </button>

          <button
            type="button"
            onClick={onSettingsClick}
            title="Pengaturan"
            className="flex h-11 w-full items-center gap-3 rounded-[1.15rem] px-2 text-slate-400 transition-all hover:bg-cyan-50 hover:text-[#0AC4E0] active:scale-95"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white ring-1 ring-slate-100">
              <Settings size={15} />
            </span>

            <span className="max-w-0 overflow-hidden whitespace-nowrap text-[11px] font-black opacity-0 transition-all duration-300 group-hover:max-w-[150px] group-hover:opacity-100">
              Pengaturan
            </span>
          </button>

          <button
            type="button"
            onClick={onProfileClick}
            title="Profil"
            className="flex h-11 w-full items-center gap-3 rounded-[1.15rem] px-2 text-slate-500 transition-all hover:bg-cyan-50 hover:text-slate-900 active:scale-95"
          >
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#0AC4E0] to-[#0899B0] text-[10px] font-black uppercase text-white shadow-[0_6px_14px_rgba(10,196,224,0.25)]">
              {getInitial(user?.nama)}

              {avatarUrl && (
                <img
                  src={avatarUrl}
                  alt={user?.nama || "Profile"}
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.remove();
                  }}
                />
              )}
            </span>

            <span className="max-w-0 overflow-hidden whitespace-nowrap text-[11px] font-black opacity-0 transition-all duration-300 group-hover:max-w-[150px] group-hover:opacity-100">
              Profil
            </span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            title="Keluar"
            className="flex h-11 w-full items-center gap-3 rounded-[1.15rem] px-2 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-500 active:scale-95"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white ring-1 ring-slate-100">
              <LogOut size={14} />
            </span>

            <span className="max-w-0 overflow-hidden whitespace-nowrap text-[11px] font-black opacity-0 transition-all duration-300 group-hover:max-w-[150px] group-hover:opacity-100">
              Keluar
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

RightPoniNavigation.propTypes = {
  menuGroups: menuGroupsPropType.isRequired,
  location: PropTypes.object.isRequired,
  onLogout: PropTypes.func,
  user: PropTypes.object,
  unreadCount: PropTypes.number,
  onProfileClick: PropTypes.func,
  onNotificationClick: PropTypes.func,
  onSettingsClick: PropTypes.func,
  brandTitle: PropTypes.string,
  brandSubtitle: PropTypes.string,
};

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [now, setNow] = useState(new Date());
  const [showNotificationHub, setShowNotificationHub] = useState(false);
  const [showProfileHub, setShowProfileHub] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [user, setUser] = useState({
    id_user: null,
    nama: "",
    email: "",
    jabatan: "",
    role: "",
    id_role: null,
    jenis: null,
    id_sekolah: null,
    foto_profile: "",
    logo_url: "",
  });

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setMobileSidebarOpen(false);
    setShowNotificationHub(false);
    setShowProfileHub(false);
  }, [location.pathname]);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const token = getAuthToken();
      if (!token) {
        navigate("/login");
        return;
      }

      let decoded;

      try {
        decoded = jwtDecode(token);
      } catch (error) {
        clearAuthSession();
        navigate("/login");
        return;
      }

      const idRole =
        decoded.id_role !== undefined ? Number(decoded.id_role) : null;
      const idUser = Number(
        decoded.id_user ||
        decoded.user_id ||
        decoded.sub ||
        decoded.id ||
        0,
      );
      const idSekolah = getSekolahIdFromToken(decoded);

      const baseUser = {
        id_user: idUser || null,
        nama: decoded.nama ?? decoded.nama_guru ?? decoded.email ?? "User",
        email: decoded.email ?? decoded.email_guru ?? "",
        jabatan: decoded.jabatan ?? decoded.jenis_guru ?? "",
        id_role: idRole,
        role: decoded.nama_role ?? decoded.role ?? roleNameMap[idRole] ?? "-",
        jenis: decoded.jenis ?? null,
        id_sekolah: idSekolah,
        jenjang:
          decoded.jenjang ||
          decoded.sekolah?.jenjang ||
          decoded.school?.jenjang ||
          "",
        foto_profile: decoded.foto_profile || "",
        logo_url: decoded.logo_url || "",
      };

      if (isMounted) setUser(baseUser);

      /*
       * Ambil profil user terbaru dari database.
       * Jika request ini gagal saat refresh, sesi tetap dipertahankan memakai data token.
       */
      if (idUser && Number(idRole) !== 8) {
        try {
          const userResponse = await fetch(`${API_BASE_URL}/users/${idUser}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });

          const userPayload = await userResponse.json().catch(() => null);

          if (userResponse.ok && isMounted) {
            const userData = userPayload?.data || userPayload;

            setUser((prev) => ({
              ...prev,
              ...userData,
              id_user: userData?.id_user || prev.id_user,
              email: userData?.email || prev.email || "",
              jabatan: userData?.jabatan || prev.jabatan || "",
              id_role: Number(
                userData?.id_role ||
                userData?.role?.id_role ||
                prev.id_role,
              ),
              role:
                userData?.role?.nama_role ||
                userData?.nama_role ||
                prev.role,
              foto_profile:
                userData?.foto_profile || prev.foto_profile || "",
              id_sekolah:
                userData?.id_sekolah ||
                userData?.sekolah?.id_sekolah ||
                prev.id_sekolah,
            }));
          }
        } catch (error) {
          console.warn("Profil user belum bisa dimuat:", error);
        }
      }

      if (([5, 9, 10].includes(Number(idRole)) || isKepalaSekolahUser(baseUser)) && idSekolah) {
        try {
          const response = await fetch(`${API_BASE_URL}/sekolah/${idSekolah}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });

          const payload = await response.json().catch(() => null);
          if (!response.ok) return;

          const sekolahData = payload?.data || payload;

          if (isMounted) {
            setUser((prev) => ({
              ...prev,
              nama:
                Number(idRole) === 5
                  ? sekolahData?.nama_sekolah || prev.nama
                  : prev.nama,
              jenjang: sekolahData?.jenjang || prev.jenjang,
              logo_url: sekolahData?.logo_url || prev.logo_url || "",
              email: sekolahData?.email_login || prev.email || "",
              jabatan: prev.jabatan || (Number(idRole) === 5 ? "Sekolah" : "Operator Sekolah"),
              sekolah: sekolahData || prev.sekolah,
            }));
          }
        } catch (error) {
          console.warn("Profil sekolah belum bisa dimuat:", error);
        }
      }
    };

    loadUser();
    return () => { isMounted = false; };
  }, [location.pathname, navigate]);

  const menuTitle = useMemo(() => getMenuTitle(user), [user]);

  const roleLabel = useMemo(() => getRoleLabel(user), [user]);

  const menuGroups = useMemo(
    () => getRoleMenus(user.id_role, user),
    [user],
  );

  const staticMenuGroups = useMemo(
    () => menuGroups.filter((g) => g.label !== "Manajemen Data" && g.label !== "Kelola Data"),
    [menuGroups],
  );
  const managementMenuGroups = useMemo(
    () => menuGroups.filter((g) => g.label === "Manajemen Data" || g.label === "Kelola Data"),
    [menuGroups],
  );

  const fetchNotifications = useCallback(async ({ silent = false } = {}) => {
    const token = getAuthToken();
    if (!token) return;

    if (!silent) setNotificationLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/notifikasi/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await safeJson(response);

      if (!response.ok) {
        throw new Error(payload?.message || "Gagal memuat notifikasi");
      }

      setNotifications(
        normalizeNotificationRows(payload).map(normalizeNotification),
      );
    } catch (error) {
      console.error("Gagal memuat notifikasi:", error);
      if (!silent) setNotifications([]);
    } finally {
      if (!silent) setNotificationLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user.id_role) return undefined;

    fetchNotifications();
    const timer = window.setInterval(
      () => fetchNotifications({ silent: true }),
      30000,
    );
    const handleRefresh = () => fetchNotifications({ silent: true });
    window.addEventListener("agenda-notification-refresh", handleRefresh);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("agenda-notification-refresh", handleRefresh);
    };
  }, [user.id_role, user.id_user, fetchNotifications]);

  const unreadNotificationCount = useMemo(
    () => notifications.filter((item) => item.unread).length,
    [notifications],
  );

  const handleNotificationClick = async (item) => {
    const token = getAuthToken();

    if (item?.unread && item?.id && token) {
      try {
        const response = await fetch(`${API_BASE_URL}/notifikasi/${item.id}/read`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = await safeJson(response);

        if (!response.ok) {
          throw new Error(payload?.message || "Gagal menandai notifikasi");
        }

        setNotifications((rows) =>
          rows.map((row) =>
            String(row.id) === String(item.id) ? { ...row, unread: false } : row,
          ),
        );
      } catch (error) {
        console.error("Gagal menandai notifikasi:", error);
      }
    }

    await fetchNotifications({ silent: true });
  };

  const handleMarkAllRead = async () => {
    const token = getAuthToken();
    if (!token || unreadNotificationCount === 0) return;

    setMarkingAll(true);
    try {
      const response = await fetch(`${API_BASE_URL}/notifikasi/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Gagal menandai seluruh notifikasi");

      setNotifications((rows) => rows.map((row) => ({ ...row, unread: false })));
      await fetchNotifications({ silent: true });
    } catch (error) {
      console.error("Gagal menandai seluruh notifikasi:", error);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login");
  };

  const renderMenuItem = (item) => {
    const Icon = item.icon || LayoutDashboard;
    const isActive =
      location.pathname === item.path ||
      location.pathname.startsWith(`${item.path}/`);

    return (
      <NavLink
        key={item.path}
        to={item.path}
        viewTransition
        onClick={() => setMobileSidebarOpen(false)}
        className={({ isActive: navActive }) => {
          const active = navActive || isActive;
          return `group relative flex min-h-12 w-full items-center gap-3 overflow-hidden rounded-[1.15rem] px-3.5 py-2.5 text-[13px] font-black leading-tight transition-[background-color,color,box-shadow,transform] duration-200 ease-out ${active
            ? "bg-gradient-to-br from-[#0AC4E0] to-[#08B5D0] text-white shadow-[0_14px_30px_rgba(10,196,224,0.24)]"
            : "text-slate-500 hover:bg-[#0AC4E0]/5 hover:text-slate-900"
            }`;
        }}
      >
        {({ isActive: navActive }) => {
          const active = navActive || isActive;
          return (
            <>
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${active ? "bg-white/15 text-white" : "bg-slate-50 text-slate-300 group-hover:bg-white group-hover:text-[#0AC4E0]"}`}>
                <Icon size={16} />
              </div>
              <span className="min-w-0 flex-1 whitespace-normal break-words">{item.label}</span>
              <span className={`flex h-4 w-4 shrink-0 items-center justify-center transition-opacity duration-200 ${active ? "opacity-100" : "opacity-0"}`}>
                <ChevronRight size={13} />
              </span>
            </>
          );
        }}
      </NavLink>
    );
  };

  // Semua role memakai sidebar normal fixed agar navigasi tidak melayang,
  // tidak ikut scroll, dan tidak menimpa konten halaman.
  if (USE_FLOATING_ROLE_NAVIGATION && ([2, 4, 7, 10].includes(Number(user.id_role)) || isKepalaSekolahUser(user))) {
    const currentRoleId = Number(user.id_role);
    const isKepsek = currentRoleId === 10 || isKepalaSekolahUser(user);

    const notchBrand =
      isKepsek
        ? {
          title: "Kepala Sekolah",
          subtitle: "Dashboard Sekolah",
        }
        : currentRoleId === 7
          ? {
            title: "Kepala Dinas",
            subtitle: "Wilayah",
          }
          : currentRoleId === 4
            ? {
              title: "Area Officer",
              subtitle: "Monitoring Wilayah",
            }
            : {
              title: "Pengurus",
              subtitle: "Dashboard",
            };

    const openProfileHub = () => {
      setShowNotificationHub(false);
      setShowProfileHub(true);
    };

    const openNotificationHub = () => {
      setShowProfileHub(false);
      setShowNotificationHub(true);
      fetchNotifications({ silent: true });
    };

    const openSettingsPage = () => {
      setShowProfileHub(false);
      setShowNotificationHub(false);
      navigate("/pengaturan-akun");
    };

    return (
      <>
        <NotchNavigation
          menuGroups={staticMenuGroups}
          location={location}
          onLogout={handleLogout}
          user={user}
          roleLabel={roleLabel}
          unreadCount={unreadNotificationCount}
          onProfileClick={openProfileHub}
          onNotificationClick={openNotificationHub}
          onSettingsClick={openSettingsPage}
          now={now}
          brandTitle={notchBrand.title}
          brandSubtitle={notchBrand.subtitle}
        />

        <UserNotificationModal
          open={showNotificationHub}
          onClose={() => setShowNotificationHub(false)}
          user={user}
          label={roleLabel}
          notifications={notifications}
          loading={notificationLoading}
          markingAll={markingAll}
          onNotificationClick={handleNotificationClick}
          onMarkAllRead={handleMarkAllRead}
        />

        <UserMiniProfileModal
          open={showProfileHub}
          onClose={() => setShowProfileHub(false)}
          user={user}
          label={roleLabel}
        />
      </>
    );
  }

  // ===== ROLE LAIN: SIDEBAR NORMAL =====
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .app-sidebar-spacer {
            width: 304px;
            min-width: 304px;
            max-width: 304px;
          }
          .app-sidebar-panel {
            width: min(320px, 88vw);
            min-width: min(320px, 88vw);
            max-width: min(320px, 88vw);
            height: 100dvh;
            min-height: 100dvh;
            max-height: 100dvh;
            box-sizing: border-box;
            contain: layout paint;
          }
          @media (min-width: 1024px) {
            .app-sidebar-panel {
              width: 304px;
              min-width: 304px;
              max-width: 304px;
              height: 100vh;
              min-height: 100vh;
              max-height: 100vh;
            }
          }
        `,
      }} />

      <div className="fixed left-4 top-4 z-[210] flex items-center gap-3 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-100 bg-white text-[#0AC4E0] shadow-[0_18px_45px_rgba(15,23,42,0.12)] active:scale-95"
          aria-label="Buka menu"
        >
          <Menu size={20} />
        </button>

        <div className="rounded-2xl border border-cyan-100 bg-white/95 px-4 py-2 shadow-[0_18px_45px_rgba(15,23,42,0.10)] backdrop-blur-xl">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0AC4E0]">Menu</p>
          <p className="max-w-[190px] truncate text-xs font-black text-slate-900">{menuTitle}</p>
        </div>
      </div>

      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.button
            type="button"
            aria-label="Tutup menu"
            onClick={() => setMobileSidebarOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[214] bg-slate-950/35 backdrop-blur-[2px] lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className="app-sidebar-spacer hidden shrink-0 lg:block" aria-hidden="true" />

      <aside className={`app-sidebar-panel fixed inset-y-0 left-0 z-[220] flex shrink-0 flex-col overflow-hidden rounded-r-[1.55rem] border-r border-cyan-100/70 bg-white px-4 py-5 font-inter text-slate-800 shadow-[16px_0_48px_rgba(14,116,144,0.12)] transition-transform duration-300 ease-out lg:z-[80] lg:translate-x-0 lg:shadow-[14px_0_38px_rgba(14,116,144,0.08)] ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-[42px] w-[42px] shrink-0 items-center justify-center overflow-hidden rounded-[0.85rem] bg-gradient-to-br from-[#0AC4E0] via-[#08B5D0] to-[#0899B0] shadow-[0_10px_22px_rgba(10,196,224,0.32)]">
              <LayoutDashboard size={19} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-400">Sistem Monitoring</p>
              <h1 className="truncate text-[15px] font-black tracking-tight text-slate-950">{menuTitle}</h1>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-500 transition-all hover:bg-rose-500 hover:text-white active:scale-95"
                title="Keluar"
              >
                <LogOut size={14} />
              </button>

              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-400 transition-all hover:bg-slate-900 hover:text-white active:scale-95 lg:hidden"
                title="Tutup menu"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>

        <nav className="mt-5 flex flex-1 flex-col min-h-0 pr-1">
          <div className="space-y-5 pb-4 shrink-0">
            {staticMenuGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">
                  <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-[#0AC4E0] shadow-[0_0_0_3px_rgba(10,196,224,0.14)]" />
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => renderMenuItem(item))}
                </div>
              </div>
            ))}
          </div>

          {managementMenuGroups.map((group) => (
            <div key={group.label} className="flex flex-1 flex-col min-h-0 border-t border-slate-100 pt-3">
              <p className="mb-2 flex shrink-0 items-center gap-2 text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">
                <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-[#0AC4E0] shadow-[0_0_0_3px_rgba(10,196,224,0.14)]" />
                {group.label}
              </p>
              <div className="no-scrollbar flex-1 overflow-y-auto pr-1 min-h-0">
                <div className="space-y-1 pb-3">
                  {group.items.map((item) => renderMenuItem(item))}
                </div>
              </div>
            </div>
          ))}
        </nav>

        <div className="shrink-0 mt-auto pt-3 border-t border-slate-100">
          <div className="space-y-2">
            <AccountCard
              user={user}
              label={roleLabel}
              unreadCount={unreadNotificationCount}
              now={now}
              onProfileClick={() => {
                setShowNotificationHub(false);
                setShowProfileHub(true);
              }}
              onNotificationClick={() => {
                setShowProfileHub(false);
                setShowNotificationHub(true);
                fetchNotifications({ silent: true });
              }}
              onSettingsClick={() => {
                setShowProfileHub(false);
                setShowNotificationHub(false);
                navigate("/pengaturan-akun");
              }}
            />
          </div>
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
          .font-inter { font-family: 'Inter', sans-serif; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          .sidebar-marquee-wrap {
            position: relative; max-width: 100%; overflow: hidden;
            white-space: nowrap; line-height: 1;
            -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 10%, #000 90%, transparent 100%);
            mask-image: linear-gradient(to right, transparent 0%, #000 10%, #000 90%, transparent 100%);
          }
          .sidebar-marquee-track {
            display: inline-flex; width: max-content; gap: 2rem;
            animation: sidebar-marquee 8s linear infinite;
          }
          .sidebar-marquee-track span {
            display: inline-block; font-size: 10px; font-weight: 900;
            line-height: 1; letter-spacing: -0.02em; color: #1e293b; white-space: nowrap;
          }
          .sidebar-marquee-wrap:hover .sidebar-marquee-track,
          .group:hover .sidebar-marquee-track { animation-play-state: paused; }
          @keyframes sidebar-marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(calc(-50% - 1rem)); }
          }
        `}} />
      </aside>

      <UserNotificationModal
        open={showNotificationHub}
        onClose={() => setShowNotificationHub(false)}
        user={user}
        label={roleLabel}
        notifications={notifications}
        loading={notificationLoading}
        markingAll={markingAll}
        onNotificationClick={handleNotificationClick}
        onMarkAllRead={handleMarkAllRead}
      />
      <UserMiniProfileModal
        open={showProfileHub}
        onClose={() => setShowProfileHub(false)}
        user={user}
        label={roleLabel}
      />
    </>
  );
};

export default Sidebar;
