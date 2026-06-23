/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate, useParams } from "react-router-dom";
import {
    ChevronLeft,
    ChevronRight,
    Send,
    RefreshCw,
    CheckCircle2,
    ClipboardList,
} from "lucide-react";
import MasterPageShell from "../../components/masterCrud/MasterPageShell";
import MasterAlert from "../../components/masterCrud/MasterAlert";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

export default function IsiAssessmentSekolah() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [assessment, setAssessment] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);
    const [current, setCurrent] = useState(0);
    const [jawaban, setJawaban] = useState({});
    const [note, setNote] = useState({ show: false, type: null, message: "" });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) setUser(jwtDecode(token));
    }, []);

    const fetchAssessment = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${BASE_URL}/assessment/${id}`);
            setAssessment(data);
        } catch {
            setNote({ show: true, type: "error", message: "Gagal memuat assessment." });
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchAssessment();
    }, [fetchAssessment]);

    const questions = assessment?.pertanyaan ?? assessment?.questions ?? [];
    const totalQ = questions.length;
    const progress = totalQ > 0 ? Math.round((Object.keys(jawaban).length / totalQ) * 100) : 0;

    const handlePilih = (idPertanyaan, pilihan) => {
        setJawaban((prev) => ({ ...prev, [idPertanyaan]: pilihan }));
    };

    const handleSubmit = async () => {
        if (Object.keys(jawaban).length < totalQ) {
            setNote({ show: true, type: "error", message: "Harap jawab semua pertanyaan sebelum mengirim." });
            return;
        }
        setSubmitting(true);
        try {
            const payload = {
                id_user: user?.sub,
                id_guru_assessment: user?.sub,
                nama_pengisi: user?.nama,
                jawaban: Object.entries(jawaban).map(([id_pertanyaan, jawaban]) => ({
                    id_pertanyaan: Number(id_pertanyaan),
                    jawaban,
                })),
            };
            await axios.post(`${BASE_URL}/assessment/${id}/jawab`, payload);
            setDone(true);
        } catch {
            setNote({ show: true, type: "error", message: "Gagal mengirim jawaban. Coba lagi." });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <MasterPageShell title="Isi Assessment" subtitle="Sistem Monitoring dan Evaluasi Program" backPath="/sekolah/assessment">
                <div className="flex flex-col items-center justify-center h-full gap-3">
                    <RefreshCw size={28} className="animate-spin text-[#0AC4E0]" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Memuat pertanyaan...</p>
                </div>
            </MasterPageShell>
        );
    }

    if (done) {
        return (
            <MasterPageShell title="Isi Assessment" subtitle="Sistem Monitoring dan Evaluasi Program" backPath="/sekolah/assessment">
                <div className="flex flex-col items-center justify-center h-full gap-5">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
                        <CheckCircle2 size={40} className="text-emerald-500" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-black text-slate-800">Assessment Terkirim!</h3>
                        <p className="mt-1 text-xs font-medium text-slate-400">Jawaban Anda telah berhasil disimpan.</p>
                    </div>
                    <button
                        onClick={() => navigate("/sekolah/assessment")}
                        className="mt-2 rounded-full bg-[#0AC4E0] px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-sm shadow-cyan-100 transition-all hover:bg-cyan-500 active:scale-95"
                    >
                        Kembali ke Daftar
                    </button>
                </div>
            </MasterPageShell>
        );
    }

    const q = questions[current];

    return (
        <MasterPageShell
            title="Isi Assessment"
            highlight={assessment?.nama ?? ""}
            subtitle="Sistem Monitoring dan Evaluasi Program"
            backPath="/sekolah/assessment"
        >
            <MasterAlert note={note} setNote={setNote} />

            <div className="h-full overflow-y-auto no-scrollbar px-10 py-8">
                {/* Progress */}
                <div className="mb-8">
                    <div className="mb-2 flex items-center justify-between">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                            Pertanyaan {current + 1} dari {totalQ}
                        </p>
                        <p className="text-[9px] font-black text-[#0AC4E0]">{progress}% selesai</p>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                            className="h-full rounded-full bg-[#0AC4E0] transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {q && (
                    <div className="mx-auto max-w-2xl">
                        {/* Question Card */}
                        <div className="mb-6 rounded-[1.5rem] border border-slate-100 bg-white p-8 shadow-sm">
                            <p className="text-[9px] font-black uppercase tracking-widest text-[#0AC4E0] mb-3">
                                Pertanyaan {current + 1}
                            </p>
                            <p className="text-sm font-bold leading-relaxed text-slate-800">
                                {q.pertanyaan ?? q.question}
                            </p>
                        </div>

                        {/* Options */}
                        <div className="flex flex-col gap-3 mb-8">
                            {(q.options ?? []).map((opt, i) => {
                                const isSelected = jawaban[q.id_pertanyaan ?? current] === opt;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => handlePilih(q.id_pertanyaan ?? current, opt)}
                                        className={`w-full rounded-2xl border px-6 py-4 text-left text-xs font-bold transition-all active:scale-[0.99] ${isSelected
                                            ? "border-[#0AC4E0] bg-cyan-50 text-[#0AC4E0] shadow-sm shadow-cyan-100"
                                            : "border-slate-100 bg-white text-slate-700 hover:border-cyan-200 hover:bg-slate-50"
                                            }`}
                                    >
                                        <span className={`mr-3 text-[9px] font-black uppercase ${isSelected ? "text-[#0AC4E0]" : "text-slate-300"}`}>
                                            {String.fromCharCode(65 + i)}.
                                        </span>
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setCurrent((p) => Math.max(0, p - 1))}
                                disabled={current === 0}
                                className="flex items-center gap-2 rounded-full border border-slate-100 bg-white px-5 py-2.5 text-[9px] font-black uppercase text-slate-400 shadow-sm transition-all hover:text-slate-700 active:scale-95 disabled:opacity-30"
                            >
                                <ChevronLeft size={12} /> Sebelumnya
                            </button>

                            {current < totalQ - 1 ? (
                                <button
                                    onClick={() => setCurrent((p) => p + 1)}
                                    className="flex items-center gap-2 rounded-full bg-[#0AC4E0] px-6 py-2.5 text-[9px] font-black uppercase text-white shadow-sm shadow-cyan-100 transition-all hover:bg-cyan-500 active:scale-95"
                                >
                                    Selanjutnya <ChevronRight size={12} />
                                </button>
                            ) : (
                                <button
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        className="flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-2.5 text-[9px] font-black uppercase text-white shadow-sm shadow-emerald-100 transition-all hover:bg-emerald-600 active:scale-95 disabled:opacity-60"
                                    >
                                        {submitting ? <RefreshCw size={11} className="animate-spin" /> : <Send size={11} />}
                                        Kirim Jawaban
                                    </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </MasterPageShell>
    );
}
