/* eslint-disable no-unused-vars */
import { KeyRound, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";

const getSchoolIdFromUser = (user = {}) => {
  return (
    user?.id_sekolah ||
    user?.sekolah_id ||
    user?.school_id ||
    user?.user?.id_sekolah ||
    user?.sekolah?.id_sekolah ||
    user?.sekolah?.id ||
    user?.school?.id_sekolah ||
    user?.school?.id ||
    ""
  );
};

const normalizeBoolean = (value) => {
  return value === true || value === "true" || value === 1 || value === "1";
};

export const kepalaSekolahOperatorConfig = {
  entityName: "Kepala Sekolah",
  pageHighlight: "Kepala Sekolah",
  subtitle: "Kelola akun Kepala Sekolah pada sekolah operator",

  routes: {
    read: "/sekolah/guru?tab=kepala-sekolah",
    create: "/sekolah/guru/kepala-sekolah/create",
    edit: (id) => `/sekolah/guru/kepala-sekolah/edit/${id}`,
  },

  api: {
    create: "/users/kepala-sekolah",
    createMethod: "post",
    detail: (id) => `/users/${id}`,
    update: (id) => `/users/kepala-sekolah/${id}`,
    updateMethod: "patch",
  },

  formTitle: {
    create: "Tambah",
    edit: "Edit",
  },

  submitLabel: {
    create: "Simpan Kepala Sekolah",
    edit: "Update Kepala Sekolah",
  },

  messages: {
    createSuccess: "Akun Kepala Sekolah berhasil dibuat.",
    updateSuccess: "Akun Kepala Sekolah berhasil diperbarui.",
    submitError: "Gagal menyimpan akun Kepala Sekolah.",
    detailError: "Gagal mengambil detail Kepala Sekolah.",
  },

  getInitialValues: ({ user }) => ({
    id_sekolah: getSchoolIdFromUser(user),
    nama: "",
    email: "",
    no_telp: "",
    password: "",
    status: true,
  }),

  normalizeDetail: (payload) => {
    const data = payload?.data || payload || {};

    return {
      id_sekolah: data.id_sekolah || data.sekolah?.id_sekolah || "",
      nama: data.nama || "",
      email: data.email || "",
      no_telp: data.no_telp || "",
      password: data.password || "",
      status:
        data.status === undefined || data.status === null
          ? true
          : Boolean(data.status),
    };
  },

  validate: ({ mode, formData, user }) => {
    const idSekolah = formData.id_sekolah || getSchoolIdFromUser(user);

    if (!idSekolah) {
      return {
        valid: false,
        message: "ID sekolah tidak ditemukan pada akun operator.",
      };
    }

    if (!String(formData.nama || "").trim()) {
      return {
        valid: false,
        message: "Nama Kepala Sekolah wajib diisi.",
      };
    }

    const email = String(formData.email || "").trim();
    if (!email) {
      return {
        valid: false,
        message: "Email Kepala Sekolah wajib diisi.",
      };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        valid: false,
        message: "Format email tidak valid.",
      };
    }

    const password = String(formData.password || "").trim();
    if (mode === "create" && password.length < 6) {
      return {
        valid: false,
        message: "Password Kepala Sekolah minimal 6 karakter.",
      };
    }

    if (mode === "edit" && password && password.length < 6) {
      return {
        valid: false,
        message: "Password Kepala Sekolah minimal 6 karakter.",
      };
    }

    return { valid: true };
  },

  buildPayload: ({ mode, formData, user }) => {
    const password = String(formData.password || "").trim();

    const payload = {
      nama: String(formData.nama || "").trim(),
      email: String(formData.email || "").trim().toLowerCase(),
      no_telp: String(formData.no_telp || "").trim(),
      status: normalizeBoolean(formData.status),
    };

    if (mode === "create" || password) {
      payload.password = password;
    }

    return payload;
  },

  sections: [
    {
      title: "Identitas Kepala Sekolah",
      description: "Data utama akun Kepala Sekolah.",
      fields: [
        {
          name: "nama",
          label: "Nama Kepala Sekolah",
          type: "text",
          placeholder: "Masukkan nama Kepala Sekolah",
          required: true,
          icon: UserRound,
        },
        {
          name: "email",
          label: "Email Login",
          type: "email",
          placeholder: "kepsek.sekolah@ypamdr.local",
          required: true,
          icon: Mail,
        },
        {
          name: "no_telp",
          label: "No. Telepon",
          type: "text",
          placeholder: "08xxxxxxxxxx",
          icon: Phone,
        },
      ],
    },
    {
      title: "Akses Akun",
      description: "Password digunakan Kepala Sekolah untuk login dashboard.",
      fields: [
        {
          name: "password",
          label: "Password",
          type: "password",
          placeholder: "Minimal 6 karakter",
          requiredOnCreate: true,
          minLength: 6,
          icon: KeyRound,
          help: ({ mode }) =>
            mode === "edit"
              ? "Kosongkan password jika tidak ingin mengganti password."
              : "Password wajib diisi saat membuat akun Kepala Sekolah.",
        },
        {
          name: "status",
          label: "Status Akun",
          type: "select",
          icon: ShieldCheck,
          options: [
            { label: "Aktif", value: true },
            { label: "Nonaktif", value: false },
          ],
        },
      ],
    },
  ],

  previewLabel: "Preview Akun",
  previewTitle: "Ringkasan Kepala Sekolah",

  preview: [
    {
      label: "Nama",
      key: "nama",
    },
    {
      label: "Email",
      key: "email",
    },
    {
      label: "Jabatan",
      value: () => "Kepala Sekolah",
    },
    {
      label: "Role",
      value: () => "Kepala Sekolah",
    },
    {
      label: "Status",
      value: ({ formData }) =>
        normalizeBoolean(formData.status) ? "Aktif" : "Nonaktif",
    },
  ],

  infoBox:
    "Akun Kepala Sekolah disimpan di data user dengan role Kepala Sekolah. Satu sekolah hanya dapat memiliki satu akun Kepala Sekolah.",
};
