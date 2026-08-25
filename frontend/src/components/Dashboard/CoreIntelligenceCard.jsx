import PropTypes from "prop-types";
import {
    AlertCircle,
    Bot,
    BrainCircuit,
    CheckCircle2,
    ClipboardList,
    Lightbulb,
    Sparkles,
    TrendingUp,
} from "lucide-react";

const WARNA = {
    cyan: "#0AC4E0",
    biru: "#2563EB",
    hijau: "#10B981",
    kuning: "#F59E0B",
    merah: "#EF4444",
    ungu: "#8B5CF6",
    abu: "#64748B",
};

function normalisasiKategori(value) {
    const hasil = String(value || "")
        .trim()
        .toUpperCase()
        .replaceAll("-", "_")
        .replaceAll(" ", "_");

    if (hasil.includes("NON")) return "NON_AKADEMIK";
    if (hasil.includes("AKADEMIK")) return "AKADEMIK";

    return hasil || "TANPA_KATEGORI";
}

function ambilStatusProgram(program) {
    return (
        program?.status_program ||
        program?.status ||
        program?.fase_status ||
        program?.status_program_berjalan ||
        "Berjalan"
    );
}

function ambilStatusAssessment(assessment) {
    return (
        assessment?.status_assessment ||
        assessment?.status ||
        assessment?.status_pengisian ||
        assessment?.state ||
        "Draft"
    );
}

function assessmentTerkirim(assessment) {
    const status = String(ambilStatusAssessment(assessment)).toLowerCase();

    return (
        status.includes("terkirim") ||
        status.includes("submit") ||
        status.includes("selesai") ||
        status.includes("aktif")
    );
}

function hitungProgramPerluPerhatian(programs) {
    return programs.filter((program) => {
        const status = String(ambilStatusProgram(program)).toLowerCase();

        return (
            status.includes("revisi") ||
            status.includes("reject") ||
            status.includes("ditolak") ||
            status.includes("menunggu") ||
            status.includes("approval")
        );
    }).length;
}

function hitungProgramBerjalan(programs) {
    return programs.filter((program) => {
        const status = String(ambilStatusProgram(program)).toLowerCase();

        return (
            !status.includes("selesai") &&
            !status.includes("done") &&
            !status.includes("completed")
        );
    }).length;
}

function ambilKategoriDominan(programs) {
    const akademik = programs.filter(
        (item) => normalisasiKategori(item?.kategori) === "AKADEMIK",
    ).length;

    const nonAkademik = programs.filter(
        (item) => normalisasiKategori(item?.kategori) === "NON_AKADEMIK",
    ).length;

    if (akademik === 0 && nonAkademik === 0) return "belum terbaca";
    if (akademik > nonAkademik) return "Akademik";
    if (nonAkademik > akademik) return "Non-Akademik";

    return "Akademik dan Non-Akademik seimbang";
}

function ambilLevelKondisi(score) {
    if (score >= 80) {
        return {
            label: "Terkendali",
            warna: WARNA.hijau,
            keterangan: "Kondisi sistem terlihat stabil dan cukup sehat.",
        };
    }

    if (score >= 55) {
        return {
            label: "Perlu Dipantau",
            warna: WARNA.kuning,
            keterangan: "Ada beberapa aktivitas yang perlu dipantau oleh admin.",
        };
    }

    return {
        label: "Butuh Atensi",
        warna: WARNA.merah,
        keterangan: "Terdapat beberapa indikator yang membutuhkan tindak lanjut.",
    };
}

function buatInsight({ programs, assessments, schools, vendors, teachers }) {
    const totalProgram = programs.length;
    const totalAssessment = assessments.length;
    const totalSekolah = schools.length;
    const totalVendor = vendors.length;
    const totalGuru = teachers.length;

    const programBerjalan = hitungProgramBerjalan(programs);
    const programPerluPerhatian = hitungProgramPerluPerhatian(programs);

    const assessmentTerkirimCount = assessments.filter(assessmentTerkirim).length;
    const assessmentBelumTerkirim = Math.max(
        totalAssessment - assessmentTerkirimCount,
        0,
    );

    const persentaseAssessment = totalAssessment
        ? Math.round((assessmentTerkirimCount / totalAssessment) * 100)
        : 0;

    const kategoriDominan = ambilKategoriDominan(programs);

    const programScore = totalProgram
        ? Math.round(((totalProgram - programPerluPerhatian) / totalProgram) * 100)
        : 0;

    const assessmentScore = totalAssessment ? persentaseAssessment : 0;

    const score =
        totalProgram || totalAssessment
            ? Math.round((programScore + assessmentScore) / 2)
            : 0;

    const kondisi = ambilLevelKondisi(score);

    const ringkasan = `Saat ini sistem memantau ${totalSekolah} sekolah, ${totalProgram} program, ${totalAssessment} assessment, ${totalGuru} guru pengisi, dan ${totalVendor} vendor. Aktivitas program paling dominan berada pada kategori ${kategoriDominan}.`;

    const temuan = [];

    if (programBerjalan > 0) {
        temuan.push(
            `${programBerjalan} program masih berjalan dan perlu dipantau progresnya.`,
        );
    }

    if (programPerluPerhatian > 0) {
        temuan.push(
            `${programPerluPerhatian} program terdeteksi perlu perhatian karena berstatus menunggu, revisi, atau approval.`,
        );
    }

    if (assessmentBelumTerkirim > 0) {
        temuan.push(
            `${assessmentBelumTerkirim} assessment belum berada pada status terkirim/selesai.`,
        );
    }

    if (totalVendor === 0) {
        temuan.push("Data vendor belum terbaca atau belum tersedia di sistem.");
    }

    if (totalGuru === 0) {
        temuan.push(
            "Data guru pengisi assessment belum terbaca dari backend atau belum terhubung ke assessment.",
        );
    }

    if (temuan.length === 0) {
        temuan.push(
            "Tidak ada masalah dominan yang terdeteksi dari data dashboard saat ini.",
        );
    }

    const rekomendasi = [];

    if (programPerluPerhatian > 0) {
        rekomendasi.push(
            "Prioritaskan pengecekan program dengan status menunggu approval, revisi, atau ditolak.",
        );
    }

    if (assessmentBelumTerkirim > 0) {
        rekomendasi.push(
            "Hubungi sekolah atau guru pengisi yang assessment-nya belum terkirim.",
        );
    }

    if (programBerjalan > 0) {
        rekomendasi.push(
            "Pantau program berjalan secara berkala agar tidak berhenti di fase persyaratan atau validasi.",
        );
    }

    if (totalVendor > 0) {
        rekomendasi.push(
            "Evaluasi distribusi vendor akademik dan non-akademik agar beban pelaksanaan program tetap seimbang.",
        );
    }

    if (rekomendasi.length === 0) {
        rekomendasi.push(
            "Pertahankan ritme monitoring saat ini dan lakukan pengecekan rutin melalui dashboard.",
        );
    }

    return {
        score,
        kondisi,
        ringkasan,
        temuan,
        rekomendasi,
        totalProgram,
        totalAssessment,
        totalSekolah,
        totalVendor,
        totalGuru,
        programBerjalan,
        programPerluPerhatian,
        assessmentTerkirimCount,
        assessmentBelumTerkirim,
        persentaseAssessment,
    };
}

function InsightPill({ label, value, color }) {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                {label}
            </p>

            <p className="mt-2 text-[20px] font-black leading-none text-slate-900">
                <span style={{ color }}>{value}</span>
            </p>
        </div>
    );
}

InsightPill.propTypes = {
    label: PropTypes.node,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    color: PropTypes.string,
};

function InsightList({ title, icon, items, color }) {
    return (
        <div className="rounded-[1.4rem] border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
                <div
                    className="flex h-10 w-10 items-center justify-center rounded-2xl text-white"
                    style={{ backgroundColor: color }}
                >
                    {icon}
                </div>

                <h3 className="text-[13px] font-black uppercase tracking-tight text-slate-900">
                    {title}
                </h3>
            </div>

            <div className="space-y-3">
                {items.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                        <span
                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: color }}
                        />

                        <p className="text-[12px] font-semibold leading-6 text-slate-500">
                            {item}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

InsightList.propTypes = {
    title: PropTypes.node,
    icon: PropTypes.node,
    items: PropTypes.arrayOf(PropTypes.node),
    color: PropTypes.string,
};

export default function CoreIntelligenceCard({
    programs = [],
    assessments = [],
    schools = [],
    vendors = [],
    teachers = [],
}) {
    const insight = buatInsight({
        programs,
        assessments,
        schools,
        vendors,
        teachers,
    });

    return (
        <section className="mb-6 overflow-hidden rounded-[1.9rem] border border-cyan-100 bg-white shadow-[0_28px_90px_rgba(10,196,224,0.10)]">
            <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-cyan-50 via-white to-white px-6 py-6">
                <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#0AC4E0]/20 blur-3xl" />

                <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex items-start gap-5">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.4rem] bg-[#0AC4E0] text-white shadow-[0_18px_38px_rgba(10,196,224,0.30)]">
                            <BrainCircuit size={30} />
                        </div>

                        <div>
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-[#0AC4E0]">
                                    <Bot size={13} />
                                    Core Intelligence
                                </span>

                                <span
                                    className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em]"
                                    style={{
                                        color: insight.kondisi.warna,
                                        borderColor: `${insight.kondisi.warna}24`,
                                        backgroundColor: `${insight.kondisi.warna}10`,
                                    }}
                                >
                                    <Sparkles size={13} />
                                    {insight.kondisi.label}
                                </span>
                            </div>

                            <h2 className="text-[26px] font-black leading-tight tracking-[-0.055em] text-slate-950">
                                Asisten Analisis Dashboard Admin
                            </h2>

                            <p className="mt-2 max-w-4xl text-[13px] font-semibold leading-6 text-slate-500">
                                {insight.ringkasan}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-[1.4rem] border border-white bg-white/80 p-5 text-center shadow-lg backdrop-blur-xl">
                        <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">
                            Skor Monitoring
                        </p>

                        <p
                            className="mt-2 text-[44px] font-black leading-none tracking-[-0.08em]"
                            style={{ color: insight.kondisi.warna }}
                        >
                            {insight.score}%
                        </p>

                        <p className="mt-2 max-w-[190px] text-[10px] font-bold leading-5 text-slate-400">
                            {insight.kondisi.keterangan}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-slate-100 bg-slate-50/50 p-5 md:grid-cols-4 xl:grid-cols-6">
                <InsightPill
                    label="Program Berjalan"
                    value={insight.programBerjalan}
                    color={WARNA.biru}
                />

                <InsightPill
                    label="Butuh Atensi"
                    value={insight.programPerluPerhatian}
                    color={WARNA.merah}
                />

                <InsightPill
                    label="Assessment Terkirim"
                    value={insight.assessmentTerkirimCount}
                    color={WARNA.hijau}
                />

                <InsightPill
                    label="Belum Terkirim"
                    value={insight.assessmentBelumTerkirim}
                    color={WARNA.kuning}
                />

                <InsightPill
                    label="Guru Pengisi"
                    value={insight.totalGuru}
                    color={WARNA.ungu}
                />

                <InsightPill
                    label="Vendor"
                    value={insight.totalVendor}
                    color={WARNA.cyan}
                />
            </div>

            <div className="grid grid-cols-1 gap-5 p-5 xl:grid-cols-2">
                <InsightList
                    title="Temuan Otomatis"
                    icon={<AlertCircle size={20} />}
                    color={WARNA.kuning}
                    items={insight.temuan}
                />

                <InsightList
                    title="Rekomendasi Tindakan"
                    icon={<Lightbulb size={20} />}
                    color={WARNA.cyan}
                    items={insight.rekomendasi}
                />
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-6 py-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-emerald-500" />

                    <p className="text-[11px] font-bold leading-5 text-slate-500">
                        Analisis ini dibuat otomatis berdasarkan data yang sudah dimuat dari
                        backend dashboard.
                    </p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#0AC4E0]">
                    <TrendingUp size={14} />
                    Mode Insight Lokal
                </div>
            </div>
        </section>
    );
}

CoreIntelligenceCard.propTypes = {
    programs: PropTypes.array,
    assessments: PropTypes.array,
    schools: PropTypes.array,
    vendors: PropTypes.array,
    teachers: PropTypes.array,
};
