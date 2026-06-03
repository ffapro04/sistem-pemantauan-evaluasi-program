/* eslint-disable react/prop-types */
import Sidebar from "../../components/Sidebar";
import Card from "../../components/Card";
import Button from "../../components/Button";
import PageWrapper from "../../components/PageWrapper";

import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

const API_BASE_URL = "http://localhost:3000";

function IsiAssessmentSekolah() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [assessment, setAssessment] = useState(null);
  const [jawaban, setJawaban] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [isExpired, setIsExpired] = useState(false);
  const [sisaHari, setSisaHari] = useState(0);

  const [schoolAuth, setSchoolAuth] = useState(null);
  const [activeGuru, setActiveGuru] = useState(null);
  const [guruModalOpen, setGuruModalOpen] = useState(false);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const decoded = jwtDecode(token);

        const id_user = decoded.sub || decoded.id_user || decoded.id || 0;
        const id_sekolah = decoded.id_sekolah || decoded.sekolah_id || 0;

        setSchoolAuth({
          id_user,
          id_sekolah,
          email: decoded.email || decoded.email_login || "",
          nama: decoded.nama || decoded.nama_sekolah || "Sekolah",
        });

        const res = await fetch(`${API_BASE_URL}/assessment/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Gagal memuat assessment");
        }

        const now = new Date();
        const deadline = data.tanggal_selesai
          ? new Date(data.tanggal_selesai)
          : null;

        let expiredStatus = false;

        if (deadline) {
          deadline.setHours(23, 59, 59, 999);

          const diffTime = deadline - now;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          expiredStatus = now > deadline;

          setSisaHari(diffDays);
          setIsExpired(expiredStatus);
        } else {
          setSisaHari(0);
          setIsExpired(false);
        }

        setAssessment({
          ...data,
          questions: Array.isArray(data.questions) ? data.questions : [],
        });

        setJawaban({});
        setActiveGuru(null);

        if (!expiredStatus) {
          setGuruModalOpen(true);
        }
      } catch (err) {
        console.error(err);
        toast.error(err.message || "Gagal mengambil data assessment");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [id, navigate]);

  const handleSetGuru = (guru) => {
    setActiveGuru(guru);
    setGuruModalOpen(false);
  };

  const handleChangeGuru = () => {
    setActiveGuru(null);
    setGuruModalOpen(true);
  };

  const handleJawab = (id_pertanyaan, jawaban_dipilih) => {
    if (isExpired) return;

    setJawaban((prev) => ({
      ...prev,
      [id_pertanyaan]: jawaban_dipilih,
    }));
  };

  const handleSubmit = async () => {
    if (!assessment || isExpired) {
      return toast.error("Periode pengisian telah berakhir.");
    }

    if (!activeGuru) {
      setGuruModalOpen(true);
      return toast.error("Silakan masuk sebagai guru terlebih dahulu.");
    }

    const totalSoal = assessment.questions.length;
    const totalDijawab = Object.keys(jawaban).length;

    if (totalDijawab < totalSoal) {
      return toast.error("Harap jawab semua pertanyaan!");
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");
      const decoded = jwtDecode(token);

      const id_user =
        schoolAuth?.id_user || decoded.sub || decoded.id_user || decoded.id || 0;

      const payload = {
        id_user,
        id_guru_assessment: activeGuru.id_guru_assessment,
        nama_pengisi: activeGuru.nama_guru,
        nama_guru_snapshot: activeGuru.nama_guru,
        jawaban: Object.entries(jawaban).map(([id_pertanyaan, value]) => ({
          id_pertanyaan: Number(id_pertanyaan),
          jawaban: value,
        })),
      };

      const res = await fetch(`${API_BASE_URL}/assessment/${id}/jawab`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(result?.message || "Gagal submit jawaban");
      }

      toast.success("Jawaban berhasil dikirim!");
      navigate("/sekolah/dashboard");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Gagal mengirim jawaban");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";

    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white font-bold text-[#0AC4E0]">
        Loading...
      </div>
    );
  }

  return (
    <PageWrapper className="flex h-screen overflow-hidden bg-[#EEF5FF] !p-0">
      <Sidebar />

      <main className="flex h-full flex-1 flex-col overflow-hidden px-4 pb-0 pt-6 md:px-12 md:pt-10">
        <Card className="!m-0 flex flex-1 flex-col overflow-auto rounded-b-[2.5rem] rounded-t-[2.5rem] border-none bg-white !p-0 shadow-2xl">
          <div className="px-8 py-8">
            <div className="flex flex-col gap-4">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="mb-1 text-xs font-black uppercase tracking-[0.3em] text-[#0AC4E0]">
                    Isi Assessment Sekolah
                  </p>

                  <h1 className="text-3xl font-black uppercase italic text-gray-800">
                    {assessment?.nama ?? "Assessment"}
                  </h1>
                </div>

                <Button
                  text="← Kembali"
                  variant="ghost"
                  onClick={() => navigate("/sekolah/dashboard")}
                  className="!rounded-xl border border-gray-200"
                />
              </div>

              <div
                className={`flex items-center justify-between gap-4 rounded-2xl border p-5 ${isExpired
                  ? "border-red-100 bg-red-50 text-red-700"
                  : "border-emerald-100 bg-emerald-50 text-emerald-700"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-3 w-3 rounded-full ${isExpired ? "bg-red-500" : "animate-pulse bg-emerald-500"
                      }`}
                  />

                  <div>
                    <p className="text-sm font-black uppercase tracking-wider">
                      Status: {isExpired ? "Selesai / Berakhir" : "Masa Pengisian"}
                    </p>

                    <p className="text-xs opacity-80">
                      Batas: {formatTanggal(assessment?.tanggal_selesai)}
                    </p>
                  </div>
                </div>

                {!isExpired && (
                  <div className="rounded-xl bg-emerald-100 px-4 py-2 text-center">
                    <p className="text-[10px] font-bold uppercase leading-tight">
                      Sisa Waktu
                    </p>

                    <p className="text-lg font-black leading-tight">
                      {sisaHari} Hari
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-[1.75rem] border border-cyan-100 bg-cyan-50/70 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#0AC4E0] shadow-sm">
                      <UserRound size={22} />
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0AC4E0]">
                        Identitas Guru Pengisi
                      </p>

                      {activeGuru ? (
                        <>
                          <p className="mt-1 text-lg font-black text-slate-800">
                            {activeGuru.nama_guru}
                          </p>

                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            Mengisi menggunakan akses sekolah aktif.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="mt-1 text-lg font-black text-slate-800">
                            Belum masuk sebagai guru
                          </p>

                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            Silakan masuk / daftar guru sebelum mengisi assessment.
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {!isExpired && (
                    <button
                      type="button"
                      onClick={handleChangeGuru}
                      className="rounded-2xl bg-[#0AC4E0] px-5 py-3 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-cyan-200 transition hover:bg-cyan-500"
                    >
                      {activeGuru ? "Ganti Guru" : "Masuk Guru"}
                    </button>
                  )}
                </div>
              </div>

              {assessment?.questions.map((q, index) => (
                <div
                  key={q.id_pertanyaan || index}
                  className="rounded-[1.75rem] border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <p className="mb-5 flex gap-2 font-bold text-gray-800">
                    <span>{index + 1}.</span>
                    <span>{q.question}</span>
                  </p>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {(q.options || []).map((opt, i) => {
                      const isSelected = jawaban[q.id_pertanyaan] === opt;

                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={isExpired}
                          onClick={() => handleJawab(q.id_pertanyaan, opt)}
                          className={`w-full rounded-2xl border px-5 py-4 text-left text-sm font-bold transition-all duration-200 ${isSelected
                            ? "border-[#0AC4E0] bg-[#0AC4E0] text-white shadow-lg"
                            : isExpired
                              ? "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400"
                              : "border-gray-200 bg-white text-gray-600 hover:border-[#0AC4E0] hover:bg-cyan-50"
                            }`}
                        >
                          <span className="mr-3 opacity-60">
                            {String.fromCharCode(65 + i)}
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto px-8 pb-10">
            <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-6 sm:flex-row">
              <p className="text-sm font-medium italic text-gray-500">
                {isExpired
                  ? "Assessment sudah ditutup."
                  : activeGuru
                    ? `Jawaban akan dikirim atas nama ${activeGuru.nama_guru}.`
                    : "Masuk sebagai guru terlebih dahulu sebelum mengirim jawaban."}
              </p>

              <Button
                text={submitting ? "Mengirim..." : "Kirim Jawaban Sekarang"}
                onClick={handleSubmit}
                disabled={submitting || isExpired}
                className={isExpired ? "opacity-50" : "shadow-xl"}
              />
            </div>
          </div>
        </Card>
      </main>

      <GuruAccessModal
        open={guruModalOpen}
        onClose={() => {
          if (activeGuru || isExpired) setGuruModalOpen(false);
        }}
        onBack={() => navigate("/sekolah/dashboard")}
        schoolAuth={schoolAuth}
        onSuccess={handleSetGuru}
      />
    </PageWrapper>
  );
}

function GuruAccessModal({ open, onClose, onBack, schoolAuth, onSuccess }) {
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    nama_guru: "",
    password: "",
    confirm_password: "",
    email_sekolah: "",
    password_sekolah: "",
    password_baru: "",
    confirm_password_baru: "",
  });

  useEffect(() => {
    if (open) {
      setMode("login");
      setShowPassword(false);
      setForm({
        nama_guru: "",
        password: "",
        confirm_password: "",
        email_sekolah: schoolAuth?.email || "",
        password_sekolah: "",
        password_baru: "",
        confirm_password_baru: "",
      });
    }
  }, [open, schoolAuth]);

  if (!open) return null;

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const getMessage = async (response) => {
    const result = await response.json().catch(() => null);
    return result?.message || "Terjadi kesalahan";
  };

  const handleLogin = async () => {
    if (!form.nama_guru.trim() || !form.password.trim()) {
      return toast.error("Nama guru dan password wajib diisi");
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/assessment-guru/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_sekolah: schoolAuth?.id_sekolah,
          nama_guru: form.nama_guru,
          password: form.password,
        }),
      });

      if (!res.ok) {
        throw new Error(await getMessage(res));
      }

      const result = await res.json();

      toast.success("Login guru berhasil");
      onSuccess(result.guru);
    } catch (err) {
      toast.error(err.message || "Login guru gagal");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!form.nama_guru.trim() || !form.password.trim()) {
      return toast.error("Nama guru dan password wajib diisi");
    }

    if (form.password.length < 4) {
      return toast.error("Password guru minimal 4 karakter");
    }

    if (form.password !== form.confirm_password) {
      return toast.error("Konfirmasi password tidak sesuai");
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/assessment-guru/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_sekolah: schoolAuth?.id_sekolah,
          nama_guru: form.nama_guru,
          password: form.password,
        }),
      });

      if (!res.ok) {
        throw new Error(await getMessage(res));
      }

      const result = await res.json();

      toast.success("Guru berhasil didaftarkan");
      onSuccess(result.guru);
    } catch (err) {
      toast.error(err.message || "Daftar guru gagal");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (
      !form.nama_guru.trim() ||
      !form.email_sekolah.trim() ||
      !form.password_sekolah.trim() ||
      !form.password_baru.trim()
    ) {
      return toast.error("Semua field reset password wajib diisi");
    }

    if (form.password_baru.length < 4) {
      return toast.error("Password baru minimal 4 karakter");
    }

    if (form.password_baru !== form.confirm_password_baru) {
      return toast.error("Konfirmasi password baru tidak sesuai");
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/assessment-guru/reset-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_sekolah: schoolAuth?.id_sekolah,
          nama_guru: form.nama_guru,
          email_sekolah: form.email_sekolah,
          password_sekolah: form.password_sekolah,
          password_baru: form.password_baru,
        }),
      });

      if (!res.ok) {
        throw new Error(await getMessage(res));
      }

      toast.success("Password guru berhasil diperbarui");

      setMode("login");
      setForm((prev) => ({
        ...prev,
        password: "",
        password_sekolah: "",
        password_baru: "",
        confirm_password_baru: "",
      }));
    } catch (err) {
      toast.error(err.message || "Reset password gagal");
    } finally {
      setLoading(false);
    }
  };

  const actionMap = {
    login: {
      title: "Masuk Sebagai Guru",
      subtitle: "Gunakan nama dan password guru yang sudah terdaftar.",
      buttonText: "Masuk & Mulai Isi",
      onSubmit: handleLogin,
    },
    register: {
      title: "Daftar Guru Baru",
      subtitle: "Buat akses guru khusus untuk sekolah ini.",
      buttonText: "Daftar & Mulai Isi",
      onSubmit: handleRegister,
    },
    reset: {
      title: "Reset Password Guru",
      subtitle: "Validasi dengan akun sekolah untuk membuat password baru.",
      buttonText: "Reset Password",
      onSubmit: handleReset,
    },
  };

  const current = actionMap[mode];

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-md">
      <div className="relative w-full max-w-[880px] overflow-hidden rounded-[2.2rem] bg-white shadow-[0_34px_120px_rgba(15,23,42,0.28)]">
        <div className="absolute right-[-80px] top-[-80px] h-56 w-56 rounded-full bg-[#0AC4E0]/15 blur-3xl" />
        <div className="absolute bottom-[-90px] left-[-90px] h-56 w-56 rounded-full bg-cyan-100/70 blur-3xl" />

        <div className="relative grid min-h-[610px] grid-cols-1 lg:grid-cols-[310px_1fr]">
          <aside className="relative hidden overflow-hidden bg-[#0AC4E0] p-7 text-white lg:block">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute left-6 top-8 h-24 w-24 rounded-full border border-white/50" />
              <div className="absolute right-[-30px] top-20 h-40 w-40 rounded-full border border-white/40" />
              <div className="absolute bottom-12 left-10 h-32 w-32 rounded-full border border-white/40" />
            </div>

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-white shadow-lg">
                  <ShieldCheck size={27} />
                </div>

                <p className="mt-7 text-[10px] font-black uppercase tracking-[0.28em] text-white/70">
                  Akses Assessment
                </p>

                <h2 className="mt-3 text-[31px] font-black leading-tight tracking-[-0.05em]">
                  Verifikasi Guru Pengisi
                </h2>

                <p className="mt-4 text-[13px] font-semibold leading-6 text-white/75">
                  Setiap guru wajib masuk ulang ketika membuka assessment agar
                  jawaban tidak tertukar dengan guru sebelumnya.
                </p>
              </div>

              <div className="space-y-3">
                <MiniStep number="01" text="Masuk akun sekolah" />
                <MiniStep number="02" text="Pilih identitas guru" />
                <MiniStep number="03" text="Isi dan kirim assessment" />
              </div>
            </div>
          </aside>

          <section className="relative flex min-h-0 flex-col">
            <div className="flex shrink-0 items-start justify-between gap-5 border-b border-slate-100 px-7 py-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0AC4E0]">
                  Mini Login Guru
                </p>

                <h3 className="mt-2 text-[27px] font-black tracking-[-0.04em] text-slate-900">
                  {current.title}
                </h3>

                <p className="mt-2 max-w-md text-[13px] font-semibold leading-6 text-slate-400">
                  {current.subtitle}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-white text-slate-400 transition hover:border-red-100 hover:bg-red-50 hover:text-red-500"
                title="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            <div className="shrink-0 px-7 pt-5">
              <div className="grid grid-cols-3 gap-2 rounded-[1.25rem] bg-slate-50 p-1.5">
                <TabButton active={mode === "login"} onClick={() => setMode("login")}>
                  Masuk
                </TabButton>

                <TabButton
                  active={mode === "register"}
                  onClick={() => setMode("register")}
                >
                  Daftar
                </TabButton>

                <TabButton active={mode === "reset"} onClick={() => setMode("reset")}>
                  Reset
                </TabButton>
              </div>
            </div>

            <div className="simple-modal-scroll min-h-0 flex-1 overflow-y-auto px-7 py-6">
              <div className="space-y-5">
                <FormInput
                  label="Nama Guru"
                  icon={<UserRound size={18} />}
                  value={form.nama_guru}
                  onChange={(value) => updateForm("nama_guru", value)}
                  placeholder="Contoh: Pak Ahmad"
                />

                {mode === "login" && (
                  <FormInput
                    label="Password Guru"
                    icon={<Lock size={18} />}
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(value) => updateForm("password", value)}
                    placeholder="Masukkan password guru"
                    rightButton={
                      <PasswordToggle
                        show={showPassword}
                        onClick={() => setShowPassword((prev) => !prev)}
                      />
                    }
                  />
                )}

                {mode === "register" && (
                  <>
                    <FormInput
                      label="Password Guru"
                      icon={<Lock size={18} />}
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(value) => updateForm("password", value)}
                      placeholder="Minimal 4 karakter"
                      rightButton={
                        <PasswordToggle
                          show={showPassword}
                          onClick={() => setShowPassword((prev) => !prev)}
                        />
                      }
                    />

                    <FormInput
                      label="Konfirmasi Password"
                      icon={<Lock size={18} />}
                      type={showPassword ? "text" : "password"}
                      value={form.confirm_password}
                      onChange={(value) => updateForm("confirm_password", value)}
                      placeholder="Ulangi password guru"
                    />
                  </>
                )}

                {mode === "reset" && (
                  <>
                    <FormInput
                      label="Email Sekolah"
                      icon={<Mail size={18} />}
                      value={form.email_sekolah}
                      onChange={(value) => updateForm("email_sekolah", value)}
                      placeholder="Email login sekolah"
                    />

                    <FormInput
                      label="Password Sekolah"
                      icon={<Lock size={18} />}
                      type="password"
                      value={form.password_sekolah}
                      onChange={(value) => updateForm("password_sekolah", value)}
                      placeholder="Password akun sekolah"
                    />

                    <FormInput
                      label="Password Guru Baru"
                      icon={<Lock size={18} />}
                      type="password"
                      value={form.password_baru}
                      onChange={(value) => updateForm("password_baru", value)}
                      placeholder="Minimal 4 karakter"
                    />

                    <FormInput
                      label="Konfirmasi Password Baru"
                      icon={<CheckCircle2 size={18} />}
                      type="password"
                      value={form.confirm_password_baru}
                      onChange={(value) =>
                        updateForm("confirm_password_baru", value)
                      }
                      placeholder="Ulangi password baru"
                    />
                  </>
                )}
              </div>
            </div>

            <div className="shrink-0 border-t border-slate-100 bg-white px-7 py-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[0.8fr_1.2fr]">
                <button
                  type="button"
                  onClick={onBack}
                  disabled={loading}
                  className="flex h-14 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 transition hover:border-cyan-100 hover:bg-cyan-50 hover:text-[#0AC4E0] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Kembali
                </button>

                <button
                  type="button"
                  onClick={current.onSubmit}
                  disabled={loading}
                  className={`flex h-14 w-full items-center justify-center gap-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.18em] text-white transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 ${mode === "reset"
                    ? "bg-slate-900 hover:bg-slate-800"
                    : "bg-[#0AC4E0] shadow-[0_16px_34px_rgba(10,196,224,0.24)] hover:bg-cyan-500"
                    }`}
                >
                  {loading ? "Memproses..." : current.buttonText}
                </button>
              </div>

              <p className="mt-4 text-center text-[11px] font-semibold leading-5 text-slate-400">
                Akses guru tidak disimpan otomatis. Setiap membuka halaman assessment,
                guru wajib masuk ulang.
              </p>
            </div>
          </section>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .simple-modal-scroll::-webkit-scrollbar {
              width: 6px;
            }

            .simple-modal-scroll::-webkit-scrollbar-track {
              background: transparent;
            }

            .simple-modal-scroll::-webkit-scrollbar-thumb {
              background: #CBD5E1;
              border-radius: 999px;
            }
          `,
        }}
      />
    </div>
  );
}

function MiniStep({ number, text }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[10px] font-black text-[#0AC4E0]">
        {number}
      </div>

      <p className="text-[12px] font-bold text-white/85">{text}</p>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[1rem] px-4 py-3 text-[10px] font-black uppercase tracking-widest transition ${active
        ? "bg-white text-[#0AC4E0] shadow-sm"
        : "text-slate-400 hover:bg-white/70 hover:text-slate-600"
        }`}
    >
      {children}
    </button>
  );
}

function PasswordToggle({ show, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-cyan-50 hover:text-[#0AC4E0]"
    >
      {show ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );
}

function FormInput({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = "text",
  rightButton = null,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </span>

      <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3.5 shadow-sm transition focus-within:border-cyan-200 focus-within:ring-4 focus-within:ring-cyan-50">
        <span className="text-[#0AC4E0]">{icon}</span>

        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm font-bold text-slate-700 outline-none placeholder:text-slate-300"
        />

        {rightButton}
      </div>
    </label>
  );
}

export default IsiAssessmentSekolah;