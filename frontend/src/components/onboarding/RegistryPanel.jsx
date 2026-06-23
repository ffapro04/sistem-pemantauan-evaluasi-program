/* eslint-disable react/prop-types */
import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight, Eye, Filter, RefreshCcw, Search } from "lucide-react";

import { Dropdown } from "../common";
import EmptySchoolState from "./EmptySchoolState";

const areaTypeOptions = [
    { value: "all", label: "SEMUA JENIS AREA" },
    { value: "Absolute", label: "ABSOLUTE" },
    { value: "Independent", label: "INDEPENDENT" },
];

const getAreaShortName = (name) => name?.split("/")?.pop() || name || "-";

const normalizeValue = (value) => {
    const numberValue = Number(value);
    return Number.isNaN(numberValue) ? value : numberValue;
};

function RegistryHeader({ onResetFilter }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0AC4E0]">
                    Registry
                </p>

                <h3 className="mt-1 text-[26px] font-black uppercase tracking-[-0.04em] text-slate-950">
                    Data Sekolah
                </h3>

                <p className="mt-1 text-xs font-semibold text-slate-400">
                    Filter dan buka detail sekolah binaan.
                </p>
            </div>

            <button
                type="button"
                onClick={onResetFilter}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-white text-slate-500 shadow-sm transition hover:border-cyan-100 hover:bg-cyan-50 hover:text-[#0AC4E0] active:scale-95"
                aria-label="Reset filter"
            >
                <RefreshCcw size={18} />
            </button>
        </div>
    );
}

function RegistryFilters({
    wilayahList,
    selectedWilayah,
    selectedJenis,
    onChangeWilayah,
    onChangeJenis,
}) {
    const wilayahOptions = useMemo(
        () => [
            { value: "all", label: "PILIH SEMUA WILAYAH" },
            ...wilayahList.map((wilayah) => ({
                value: wilayah.id_wilayah,
                label: getAreaShortName(wilayah.nama_wilayah).toUpperCase(),
            })),
        ],
        [wilayahList],
    );

    return (
        <div className="space-y-3">
            <Dropdown
                icon={Search}
                items={wilayahOptions}
                value={selectedWilayah?.id_wilayah || "all"}
                onChange={(value) => onChangeWilayah(normalizeValue(value))}
                className="!rounded-2xl !border-slate-100 !bg-white !py-4 !text-[11px] !font-black !text-slate-700 shadow-sm"
            />

            <Dropdown
                icon={Filter}
                items={areaTypeOptions}
                value={selectedJenis}
                onChange={onChangeJenis}
                className="!rounded-2xl !border-slate-100 !bg-white !py-4 !text-[11px] !font-black !text-slate-700 shadow-sm"
            />
        </div>
    );
}

function SchoolRow({ school, onOpenSchool }) {
    return (
        <tr className="group transition-colors hover:bg-[#0AC4E0]/5">
            <td className="border-b border-slate-100 px-5 py-5">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-[#0AC4E0]">
                        <span className="text-[12px] font-black">
                            {String(school.nama_sekolah || "S").charAt(0)}
                        </span>
                    </div>

                    <div className="min-w-0">
                        <p className="line-clamp-1 text-[13px] font-black uppercase text-slate-800">
                            {school.nama_sekolah}
                        </p>

                        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                            {school.jenjang || "-"} "- NPSN {school.npsn || "-"}
                        </p>

                        <div className="mt-3 inline-flex rounded-full bg-[#0AC4E0]/10 px-3 py-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#0AC4E0]">
                                Aktif
                            </span>
                        </div>
                    </div>
                </div>
            </td>

            <td className="border-b border-slate-100 px-5 py-5">
                <button
                    type="button"
                    onClick={() => onOpenSchool(school)}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-100 bg-white text-[#0AC4E0] shadow-sm transition hover:bg-[#0AC4E0] hover:text-white active:scale-95"
                    aria-label={`Lihat detail ${school.nama_sekolah}`}
                >
                    <Eye size={17} />
                </button>
            </td>
        </tr>
    );
}

function RegistryTable({ schools, onOpenSchool }) {
    if (schools.length === 0) return <EmptySchoolState />;

    return (
        <div className="min-w-full overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
                <thead>
                    <tr>
                        <th className="border-b border-slate-100 bg-slate-50 px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                            Sekolah
                        </th>
                        <th className="w-24 border-b border-slate-100 bg-slate-50 px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                            Detail
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {schools.map((school) => (
                        <SchoolRow
                            key={school.id_sekolah || school.npsn}
                            school={school}
                            onOpenSchool={onOpenSchool}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function RegistryPagination({
    currentPage,
    totalPages,
    totalSchools,
    onPreviousPage,
    onNextPage,
}) {
    return (
        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-slate-100 bg-white p-5">
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Halaman {currentPage} / {totalPages}
                </p>

                <p className="mt-1 text-[10px] font-bold text-slate-400">
                    {totalSchools} sekolah ditemukan
                </p>
            </div>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={onPreviousPage}
                    disabled={currentPage === 1}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-500 shadow-sm transition active:scale-95 disabled:opacity-30"
                    aria-label="Halaman sebelumnya"
                >
                    <ChevronLeft size={16} />
                </button>

                <button
                    type="button"
                    onClick={onNextPage}
                    disabled={currentPage === totalPages}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-500 shadow-sm transition active:scale-95 disabled:opacity-30"
                    aria-label="Halaman berikutnya"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}

function RegistryPanel({
    wilayahList,
    selectedWilayah,
    selectedJenis,
    schools,
    totalSchools,
    currentPage,
    totalPages,
    onSelectWilayah,
    onResetFilter,
    onChangeJenis,
    onOpenSchool,
    onPreviousPage,
    onNextPage,
}) {
    const handleChangeWilayah = (value) => {
        if (value === "all") {
            onResetFilter();
            return;
        }

        const foundWilayah = wilayahList.find(
            (wilayah) => wilayah.id_wilayah === value,
        );

        if (foundWilayah) {
            onSelectWilayah(foundWilayah);
        }
    };

    return (
        <aside className="flex min-h-[620px] flex-col overflow-hidden rounded-[2.2rem] border border-white bg-white shadow-[0_24px_80px_rgba(15,23,42,0.07)]">
            <div className="shrink-0 space-y-5 border-b border-slate-100 bg-white p-6">
                <RegistryHeader onResetFilter={onResetFilter} />

                <RegistryFilters
                    wilayahList={wilayahList}
                    selectedWilayah={selectedWilayah}
                    selectedJenis={selectedJenis}
                    onChangeWilayah={handleChangeWilayah}
                    onChangeJenis={onChangeJenis}
                />
            </div>

            <div className="flex flex-1 flex-col overflow-hidden">
                <div className="no-scrollbar flex-1 overflow-y-auto">
                    <RegistryTable schools={schools} onOpenSchool={onOpenSchool} />
                </div>

                <RegistryPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalSchools={totalSchools}
                    onPreviousPage={onPreviousPage}
                    onNextPage={onNextPage}
                />
            </div>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                        .line-clamp-1 {
                            display: -webkit-box;
                            -webkit-line-clamp: 1;
                            -webkit-box-orient: vertical;
                            overflow: hidden;
                        }
                    `,
                }}
            />
        </aside>
    );
}

export default RegistryPanel;
