import PropTypes from "prop-types";
import {
    CheckCircle2,
    FileClock,
    Layers3,
    UploadCloud,
    RotateCcw,
} from "lucide-react";

function getArray(...values) {
    return values.find((value) => Array.isArray(value)) || [];
}

function getRequirementFile(requirement) {
    return (
        requirement?.file ||
        requirement?.file_url ||
        requirement?.file_path ||
        requirement?.path ||
        requirement?.file_mou ||
        null
    );
}

function getRequirementStatus(requirement) {
    const currentStatus = String(requirement?.status || "").toUpperCase();

    if (currentStatus === "APPROVED") return "APPROVED";
    if (currentStatus === "WAITING_AO") return "WAITING_AO";
    if (currentStatus === "WAITING_HO") return "WAITING_HO";
    if (currentStatus === "WAITING_UPLOAD") return "WAITING_UPLOAD";
    if (currentStatus === "REJECTED_AO") return "REJECTED_AO";
    if (currentStatus === "REJECTED_HO") return "REJECTED_HO";
    if (currentStatus === "REJECTED") return "REJECTED";

    if (getRequirementFile(requirement)) return "WAITING_AO";
    return "WAITING_UPLOAD";
}

function getProgramRequirements(program) {
    const fases = getArray(program?.fases);

    return fases.flatMap((fase) => {
        const terminList = getArray(fase.termin, fase.termins, fase.t_termin);
        const kegiatanList = getArray(
            fase.kegiatans,
            fase.kegiatan,
            fase.t_kegiatans,
        );

        const terminRequirements = terminList.flatMap((termin) =>
            getArray(
                termin.persyaratan,
                termin.persyaratan_termin,
                termin.requirements,
                termin.t_persyaratan_termin,
            ),
        );

        const kegiatanRequirements = kegiatanList.flatMap((kegiatan) =>
            getArray(
                kegiatan.persyaratan,
                kegiatan.persyaratan_kegiatan,
                kegiatan.requirements,
                kegiatan.t_persyaratan_kegiatan,
            ),
        );

        return [...terminRequirements, ...kegiatanRequirements];
    });
}

const TONES = {
    cyan: {
        accent: "bg-[#0AC4E0]",
        icon: "bg-cyan-50 text-[#0AC4E0]",
    },
    blue: {
        accent: "bg-blue-500",
        icon: "bg-blue-50 text-blue-600",
    },
    amber: {
        accent: "bg-amber-400",
        icon: "bg-amber-50 text-amber-600",
    },
    emerald: {
        accent: "bg-emerald-500",
        icon: "bg-emerald-50 text-emerald-600",
    },
    rose: {
        accent: "bg-rose-500",
        icon: "bg-rose-50 text-rose-600",
    },
};

function StatItem({ label, value, helper, icon, tone = "cyan" }) {
    const palette = TONES[tone] || TONES.cyan;

    return (
        <div className="relative min-w-0 bg-white px-5 py-4 lg:px-6">
            <span
                className={`absolute inset-x-0 top-0 h-1 ${palette.accent}`}
                aria-hidden="true"
            />

            <div className="flex min-w-0 items-center justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                        {label}
                    </p>

                    <p className="mt-2 text-[28px] font-black leading-none tracking-tight text-slate-800">
                        {value}
                    </p>

                    <p className="mt-2 whitespace-normal text-[11px] font-semibold leading-4 text-slate-400">
                        {helper}
                    </p>
                </div>

                <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${palette.icon}`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

StatItem.propTypes = {
    label: PropTypes.node,
    value: PropTypes.node,
    helper: PropTypes.node,
    icon: PropTypes.node,
    tone: PropTypes.oneOf(["cyan", "blue", "amber", "emerald", "rose"]),
};

function VendorProgramStats({ programs }) {
    const totalProgram = programs.length;
    const allRequirements = programs.flatMap(getProgramRequirements);

    const waitingUpload = allRequirements.filter(
        (item) => getRequirementStatus(item) === "WAITING_UPLOAD",
    ).length;

    const waitingAo = allRequirements.filter(
        (item) => getRequirementStatus(item) === "WAITING_AO",
    ).length;

    const waitingHo = allRequirements.filter(
        (item) => getRequirementStatus(item) === "WAITING_HO",
    ).length;

    const rejected = allRequirements.filter((item) =>
        ["REJECTED", "REJECTED_AO", "REJECTED_HO"].includes(
            getRequirementStatus(item),
        ),
    ).length;

    const approved = allRequirements.filter(
        (item) => getRequirementStatus(item) === "APPROVED",
    ).length;

    const finalLabel = rejected > 0 ? "Perlu Revisi" : "Disetujui";
    const finalValue = rejected > 0 ? rejected : approved;
    const finalHelper =
        rejected > 0
            ? "Bukti perlu diperbaiki"
            : "Bukti telah disetujui";

    return (
        <section className="overflow-hidden rounded-[1.55rem] border border-slate-200 bg-white shadow-[0_14px_38px_rgba(15,23,42,0.05)]">
            <div className="grid grid-cols-1 gap-px bg-slate-100 sm:grid-cols-2 xl:grid-cols-5">
                <StatItem
                    label="Total Program"
                    value={totalProgram}
                    helper="Program yang ditugaskan"
                    icon={<Layers3 size={20} />}
                    tone="cyan"
                />

                <StatItem
                    label="Perlu Upload"
                    value={waitingUpload}
                    helper="Bukti belum dikirim"
                    icon={<UploadCloud size={20} />}
                    tone="blue"
                />

                <StatItem
                    label="Review AO"
                    value={waitingAo}
                    helper="Menunggu pemeriksaan AO"
                    icon={<FileClock size={20} />}
                    tone="amber"
                />

                <StatItem
                    label="Keputusan HO"
                    value={waitingHo}
                    helper="Menunggu keputusan HO"
                    icon={<FileClock size={20} />}
                    tone="rose"
                />

                <StatItem
                    label={finalLabel}
                    value={finalValue}
                    helper={finalHelper}
                    icon={
                        rejected > 0 ? (
                            <RotateCcw size={20} />
                        ) : (
                            <CheckCircle2 size={20} />
                        )
                    }
                    tone={rejected > 0 ? "rose" : "emerald"}
                />
            </div>
        </section>
    );
}

VendorProgramStats.propTypes = {
    programs: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default VendorProgramStats;