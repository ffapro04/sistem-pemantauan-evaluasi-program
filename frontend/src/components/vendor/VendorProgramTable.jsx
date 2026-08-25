import PropTypes from "prop-types";
import {
    Eye,
    School,
    UserCheck,
    Calendar,
    BadgeCheck,
    UploadCloud,
    Clock3,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppButton from "../ui/AppButton";

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
            : normalized === "evaluasi"
                ? "border-violet-100 bg-violet-50 text-violet-600"
                : normalized === "implementasi"
                    ? "border-cyan-100 bg-cyan-50 text-cyan-600"
                    : normalized === "sosialisasi"
                        ? "border-blue-100 bg-blue-50 text-blue-600"
                        : "border-amber-100 bg-amber-50 text-amber-600";

    return (
        <span
            className={`inline-flex max-w-full rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${style}`}
        >
            <span className="whitespace-normal break-words text-center">
                {status || "Approval"}
            </span>
        </span>
    );
}

StatusBadge.propTypes = {
    status: PropTypes.node,
};

function SummaryChip({ icon, value, label, className }) {
    return (
        <span
            className={`inline-flex min-w-0 items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[10px] font-black ${className}`}
        >
            {icon}
            <span className="whitespace-nowrap">{value}</span>
            <span className="font-bold">{label}</span>
        </span>
    );
}

SummaryChip.propTypes = {
    icon: PropTypes.node,
    value: PropTypes.node,
    label: PropTypes.node,
    className: PropTypes.string,
};

function UploadSummary({ program }) {
    const requirements = getProgramRequirements(program);

    const waitingUpload = requirements.filter(
        (item) => getRequirementStatus(item) === "WAITING_UPLOAD",
    ).length;

    const waitingAo = requirements.filter(
        (item) => getRequirementStatus(item) === "WAITING_AO",
    ).length;

    const waitingHo = requirements.filter(
        (item) => getRequirementStatus(item) === "WAITING_HO",
    ).length;

    const rejected = requirements.filter((item) =>
        ["REJECTED", "REJECTED_AO", "REJECTED_HO"].includes(
            getRequirementStatus(item),
        ),
    ).length;

    const approved = requirements.filter(
        (item) => getRequirementStatus(item) === "APPROVED",
    ).length;

    if (requirements.length === 0) {
        return (
            <span className="text-[11px] font-semibold text-slate-400">
                Belum ada persyaratan
            </span>
        );
    }

    return (
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <SummaryChip
                icon={<UploadCloud size={12} />}
                value={waitingUpload}
                label="Upload"
                className="bg-cyan-50 text-cyan-600"
            />

            <SummaryChip
                icon={<Clock3 size={12} />}
                value={waitingAo}
                label="AO"
                className="bg-blue-50 text-blue-600"
            />

            <SummaryChip
                icon={<Clock3 size={12} />}
                value={waitingHo}
                label="HO"
                className="bg-amber-50 text-amber-600"
            />

            {rejected > 0 && (
                <SummaryChip
                    icon={<RotateCcw size={12} />}
                    value={rejected}
                    label="Revisi"
                    className="bg-rose-50 text-rose-600"
                />
            )}

            <SummaryChip
                icon={<CheckCircle2 size={12} />}
                value={approved}
                label="ACC"
                className="bg-emerald-50 text-emerald-600"
            />
        </div>
    );
}

UploadSummary.propTypes = {
    program: PropTypes.object.isRequired,
};

function MobileLabel({ children }) {
    return (
        <p className="mb-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400 xl:hidden">
            {children}
        </p>
    );
}

MobileLabel.propTypes = {
    children: PropTypes.node,
};

function VendorProgramTable({
    programs,
    detailPathPrefix,
    getSchoolName,
    getHoName,
    page = 1,
    totalPages = 1,
    startIndex = 0,
    totalItems,
    onPrevPage,
    onNextPage,
}) {
    const navigate = useNavigate();
    const totalProgramCount =
        typeof totalItems === "number" ? totalItems : programs.length;
    const hasPagination = totalPages > 1;

    return (
        <section className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
            <div className="hidden grid-cols-[52px_minmax(210px,1.6fr)_minmax(190px,1.35fr)_minmax(150px,1fr)_86px_minmax(220px,1.55fr)_52px] items-center gap-4 bg-[#0AC4E0] px-6 py-4 text-[10px] font-black uppercase tracking-[0.14em] text-white xl:grid">
                <div>No</div>
                <div>Program</div>
                <div>Sekolah</div>
                <div>Head Office</div>
                <div>Tahun</div>
                <div>Status Bukti</div>
                <div className="text-center">Aksi</div>
            </div>

            <div className="divide-y divide-slate-100">
                {programs.map((program, index) => {
                    const schoolName = getSchoolName(program);
                    const hoName = getHoName(program);

                    return (
                        <article
                            key={program.id_program}
                            className="grid gap-4 px-5 py-5 transition hover:bg-cyan-50/30 sm:grid-cols-2 xl:grid-cols-[52px_minmax(210px,1.6fr)_minmax(190px,1.35fr)_minmax(150px,1fr)_86px_minmax(220px,1.55fr)_52px] xl:items-center xl:gap-4 xl:px-6"
                        >
                            <div className="hidden text-[12px] font-black text-slate-300 xl:block">
                                {String(startIndex + index + 1).padStart(2, "0")}
                            </div>

                            <div className="min-w-0 sm:col-span-2 xl:col-span-1">
                                <MobileLabel>Program</MobileLabel>
                                <p className="whitespace-normal break-words text-[14px] font-black leading-5 text-slate-800">
                                    {program.nama_program || "Program tanpa nama"}
                                </p>

                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
                                        {program.kode_program ||
                                            `PRG-${program.id_program}`}
                                    </span>
                                    <StatusBadge status={program.status_program} />
                                </div>
                            </div>

                            <div className="min-w-0">
                                <MobileLabel>Sekolah</MobileLabel>
                                <div className="flex items-start gap-2.5">
                                    <School
                                        size={15}
                                        className="mt-0.5 shrink-0 text-[#0AC4E0]"
                                    />
                                    <span
                                        className="whitespace-normal break-words text-[12px] font-bold leading-5 text-slate-600"
                                        title={schoolName}
                                    >
                                        {schoolName}
                                    </span>
                                </div>
                            </div>

                            <div className="min-w-0">
                                <MobileLabel>Head Office</MobileLabel>
                                <div className="flex items-start gap-2.5">
                                    <UserCheck
                                        size={15}
                                        className="mt-0.5 shrink-0 text-[#0AC4E0]"
                                    />
                                    <span
                                        className="whitespace-normal break-words text-[12px] font-bold leading-5 text-slate-600"
                                        title={hoName}
                                    >
                                        {hoName}
                                    </span>
                                </div>
                            </div>

                            <div className="min-w-0">
                                <MobileLabel>Tahun</MobileLabel>
                                <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-[11px] font-black text-slate-600">
                                    <Calendar size={13} className="text-[#0AC4E0]" />
                                    {program.tahun || "-"}
                                </div>
                            </div>

                            <div className="min-w-0 sm:col-span-2 xl:col-span-1">
                                <MobileLabel>Status Bukti</MobileLabel>
                                <UploadSummary program={program} />
                            </div>

                            <div className="flex items-end justify-end sm:col-span-2 xl:col-span-1 xl:items-center xl:justify-center">
                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            `${detailPathPrefix}/${program.id_program}`,
                                        )
                                    }
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[11px] font-black text-slate-500 shadow-sm transition hover:border-[#0AC4E0] hover:text-[#0AC4E0] xl:w-10 xl:px-0"
                                    title="Lihat detail program"
                                >
                                    <Eye size={16} />
                                    <span className="xl:hidden">Detail</span>
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>

            <footer className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between xl:px-6">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
                    <BadgeCheck size={14} className="shrink-0 text-[#0AC4E0]" />
                    <span className="whitespace-normal">
                        Menampilkan {totalProgramCount === 0 ? 0 : startIndex + 1}–
                        {Math.min(
                            startIndex + programs.length,
                            totalProgramCount,
                        )}{" "}
                        dari {totalProgramCount} program vendor
                    </span>
                </div>

                {hasPagination && (
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        <AppButton
                            type="button"
                            onClick={onPrevPage}
                            disabled={page <= 1}
                            icon={<ChevronLeft size={15} />}
                            variant="secondary"
                            size="sm"
                            className="hover:!border-cyan-100 hover:!text-[#0AC4E0]"
                        >
                            Prev
                        </AppButton>

                        <span className="inline-flex h-10 min-w-[58px] items-center justify-center rounded-xl bg-[#0AC4E0] px-3 text-[11px] font-black text-white">
                            {page} / {totalPages}
                        </span>

                        <AppButton
                            type="button"
                            onClick={onNextPage}
                            disabled={page >= totalPages}
                            variant="secondary"
                            size="sm"
                            className="hover:!border-cyan-100 hover:!text-[#0AC4E0]"
                        >
                            Next
                            <ChevronRight size={15} className="ml-2" />
                        </AppButton>
                    </div>
                )}
            </footer>
        </section>
    );
}

VendorProgramTable.propTypes = {
    programs: PropTypes.arrayOf(PropTypes.object).isRequired,
    detailPathPrefix: PropTypes.string,
    getSchoolName: PropTypes.func.isRequired,
    getHoName: PropTypes.func.isRequired,
    page: PropTypes.number,
    totalPages: PropTypes.number,
    startIndex: PropTypes.number,
    totalItems: PropTypes.number,
    onPrevPage: PropTypes.func,
    onNextPage: PropTypes.func,
};

export default VendorProgramTable;