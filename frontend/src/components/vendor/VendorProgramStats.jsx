/* eslint-disable react/prop-types */
import {
    CheckCircle2,
    FileClock,
    Layers3,
    UploadCloud,
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

function StatCard({ label, value, helper, icon, tone = "cyan" }) {
    const toneClass =
        tone === "amber"
            ? "bg-amber-50 text-amber-600"
            : tone === "emerald"
                ? "bg-emerald-50 text-emerald-600"
                : tone === "slate"
                    ? "bg-slate-50 text-slate-500"
                    : "bg-cyan-50 text-[#0AC4E0]";

    return (
        <div className="rounded-[1.35rem] border border-slate-100 bg-white px-5 py-4 shadow-[0_12px_34px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                        {label}
                    </p>

                    <p className="mt-2 text-2xl font-black leading-none text-slate-800">
                        {value}
                    </p>

                    {helper && (
                        <p className="mt-2 text-[10px] font-bold text-slate-400">
                            {helper}
                        </p>
                    )}
                </div>

                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${toneClass}`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

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

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <StatCard
                label="Total Program"
                value={totalProgram}
                helper="Program yang ditugaskan"
                icon={<Layers3 size={20} />}
            />

            <StatCard
                label="Perlu Upload"
                value={waitingUpload}
                helper="Dokumen belum dikirim"
                icon={<UploadCloud size={20} />}
                tone="cyan"
            />

            <StatCard
                label="Review AO"
                value={waitingAo}
                helper="Menunggu pemeriksaan AO"
                icon={<FileClock size={20} />}
                tone="slate"
            />

            <StatCard
                label="Keputusan HO"
                value={waitingHo}
                helper="Menunggu ACC / Reject HO"
                icon={<FileClock size={20} />}
                tone="amber"
            />

            <StatCard
                label={rejected > 0 ? "Perlu Revisi" : "Approved"}
                value={rejected > 0 ? rejected : approved}
                helper={
                    rejected > 0
                        ? "Upload ditolak AO / HO"
                        : "Dokumen disetujui HO"
                }
                icon={<CheckCircle2 size={20} />}
                tone={rejected > 0 ? "slate" : "emerald"}
            />
        </div>
    );
}
export default VendorProgramStats;
