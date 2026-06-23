/* eslint-disable react/prop-types */
import {
    Eye,
    School,
    UserCheck,
    Calendar,
    BadgeCheck,
    UploadCloud,
    Clock3,
    CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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

function StatusBadge({ status }) {
    const normalized = String(status || "Approval").toLowerCase();

    const style =
        normalized === "selesai"
            ? "border-emerald-100 bg-emerald-50 text-emerald-600"
            : normalized === "rejected"
                ? "border-red-100 bg-red-50 text-red-500"
                : normalized === "implementasi"
                    ? "border-cyan-100 bg-cyan-50 text-cyan-600"
                    : "border-amber-100 bg-amber-50 text-amber-600";

    return (
        <span
            className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${style}`}
        >
            {status || "Approval"}
        </span>
    );
}

function UploadSummary({ program }) {
    const requirements = getProgramRequirements(program);

    const waitingUpload = requirements.filter(
        (item) => getRequirementStatus(item) === "WAITING_UPLOAD",
    ).length;

    const waitingHo = requirements.filter(
        (item) => getRequirementStatus(item) === "WAITING_HO",
    ).length;

    const approved = requirements.filter(
        (item) => getRequirementStatus(item) === "APPROVED",
    ).length;

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-50 px-2.5 py-1.5 text-[10px] font-black text-cyan-600">
                <UploadCloud size={12} />
                {waitingUpload} upload
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-2.5 py-1.5 text-[10px] font-black text-amber-600">
                <Clock3 size={12} />
                {waitingHo} HO
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-2.5 py-1.5 text-[10px] font-black text-emerald-600">
                <CheckCircle2 size={12} />
                {approved} ACC
            </span>
        </div>
    );
}

function VendorProgramTable({
    programs,
    detailPathPrefix,
    getSchoolName,
    getHoName,
}) {
    const navigate = useNavigate();

    return (
        <div className="overflow-hidden rounded-[1.6rem] border border-slate-100 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
            <div className="grid grid-cols-12 bg-[#0AC4E0] px-6 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-white">
                <div className="col-span-1">No</div>
                <div className="col-span-3">Program</div>
                <div className="col-span-2">Sekolah</div>
                <div className="col-span-2">HO</div>
                <div className="col-span-1">Tahun</div>
                <div className="col-span-2">Upload</div>
                <div className="col-span-1 text-right">Aksi</div>
            </div>

            <div className="divide-y divide-slate-100">
                {programs.map((program, index) => (
                    <div
                        key={program.id_program}
                        className="grid grid-cols-12 items-center px-6 py-5 text-sm transition hover:bg-cyan-50/35"
                    >
                        <div className="col-span-1 text-[12px] font-black text-slate-300">
                            {String(index + 1).padStart(2, "0")}
                        </div>

                        <div className="col-span-3 min-w-0">
                            <p className="truncate text-[14px] font-black text-slate-800">
                                {program.nama_program}
                            </p>

                            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                {program.kode_program || `PRG-${program.id_program}`}
                            </p>

                            <div className="mt-2">
                                <StatusBadge status={program.status_program} />
                            </div>
                        </div>

                        <div className="col-span-2 min-w-0">
                            <div className="flex items-center gap-2">
                                <School size={14} className="text-[#0AC4E0]" />
                                <span className="truncate text-[12px] font-bold text-slate-600">
                                    {getSchoolName(program)}
                                </span>
                            </div>
                        </div>

                        <div className="col-span-2 min-w-0">
                            <div className="flex items-center gap-2">
                                <UserCheck size={14} className="text-[#0AC4E0]" />
                                <span className="truncate text-[12px] font-bold text-slate-600">
                                    {getHoName(program)}
                                </span>
                            </div>
                        </div>

                        <div className="col-span-1">
                            <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-[11px] font-black text-slate-600">
                                <Calendar size={13} className="text-[#0AC4E0]" />
                                {program.tahun || "-"}
                            </div>
                        </div>

                        <div className="col-span-2">
                            <UploadSummary program={program} />
                        </div>

                        <div className="col-span-1 flex justify-end">
                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        `${detailPathPrefix}/${program.id_program}`,
                                    )
                                }
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 shadow-sm transition hover:border-[#0AC4E0] hover:text-[#0AC4E0]"
                                title="Lihat detail"
                            >
                                <Eye size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-6 py-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                    <BadgeCheck size={14} className="text-[#0AC4E0]" />
                    Menampilkan {programs.length} program vendor
                </div>
            </div>
        </div>
    );
}

export default VendorProgramTable;
