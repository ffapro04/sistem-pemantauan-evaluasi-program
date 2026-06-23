// src/components/scheduling/SchedulingCalendarBase.jsx

/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Sidebar from "../Sidebar";
import PageWrapper from "../PageWrapper";

function formatDateKey(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function isSameDate(a, b) {
    if (!a || !b) return false;

    const first = new Date(a);
    const second = new Date(b);

    return (
        first.getFullYear() === second.getFullYear() &&
        first.getMonth() === second.getMonth() &&
        first.getDate() === second.getDate()
    );
}

function getMonthLabel(date) {
    return new Intl.DateTimeFormat("id-ID", {
        month: "long",
        year: "numeric",
    }).format(date);
}

function getDayName(index) {
    return ["MIN", "SEN", "SEL", "RAB", "KAM", "JUM", "SAB"][index];
}

function getFullDateLabel(date) {
    return new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(new Date(date));
}

function buildCalendarDays(currentMonth) {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDate = new Date(year, month, 1);
    const firstDayIndex = firstDate.getDay();

    const startDate = new Date(year, month, 1 - firstDayIndex);

    return Array.from({ length: 42 }).map((_, index) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + index);

        return {
            date,
            isCurrentMonth: date.getMonth() === month,
        };
    });
}

function groupSchedulesByDate(schedules) {
    return schedules.reduce((acc, schedule) => {
        const key = formatDateKey(schedule.date);

        if (!acc[key]) acc[key] = [];
        acc[key].push(schedule);

        return acc;
    }, {});
}

function sortSchedules(schedules) {
    return [...schedules].sort((a, b) => {
        const timeA = `${a.date} ${a.startTime || "00:00"}`;
        const timeB = `${b.date} ${b.startTime || "00:00"}`;

        return new Date(timeA) - new Date(timeB);
    });
}

function SchedulingCalendarBase({
    title = "Scheduling",
    titleHighlight = "Kegiatan",
    subtitle = "Pantau jadwal kegiatan program berdasarkan tanggal pelaksanaan.",
    schedules = [],
    onScheduleClick,
}) {
    const today = new Date();

    const [currentMonth, setCurrentMonth] = useState(
        new Date(today.getFullYear(), today.getMonth(), 1),
    );

    const [selectedDate, setSelectedDate] = useState(today);

    const schedulesByDate = useMemo(
        () => groupSchedulesByDate(schedules),
        [schedules],
    );

    const calendarDays = useMemo(
        () => buildCalendarDays(currentMonth),
        [currentMonth],
    );

    const selectedDateKey = formatDateKey(selectedDate);

    const selectedSchedules = useMemo(() => {
        return sortSchedules(schedulesByDate[selectedDateKey] || []);
    }, [schedulesByDate, selectedDateKey]);

    const goPrevMonth = () => {
        setCurrentMonth((prev) => {
            return new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
        });
    };

    const goNextMonth = () => {
        setCurrentMonth((prev) => {
            return new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
        });
    };

    return (
        <PageWrapper className="flex h-screen overflow-hidden bg-[#F4FBFC] !p-0 font-sans text-slate-800">
            <Sidebar />

            <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto px-7 py-7">
                    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5">
                        <header className="rounded-[30px] border border-cyan-100 bg-white px-7 py-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0AC4E0]">
                                Menu Scheduling
                            </p>

                            <h1 className="mt-2 text-[34px] font-black tracking-[-0.05em] text-slate-900 md:text-[42px]">
                                {title}{" "}
                                <span className="text-[#0AC4E0]">{titleHighlight}</span>
                            </h1>

                            <p className="mt-3 max-w-3xl text-[15px] font-semibold leading-7 text-slate-500">
                                {subtitle}
                            </p>
                        </header>

                        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_0.9fr]">
                            <div className="rounded-[32px] border border-cyan-100 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.07)]">
                                <div className="mb-6 flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={goPrevMonth}
                                        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-[#0AC4E0]"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>

                                    <h2 className="text-[20px] font-black capitalize tracking-tight text-slate-800">
                                        {getMonthLabel(currentMonth)}
                                    </h2>

                                    <button
                                        type="button"
                                        onClick={goNextMonth}
                                        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-[#0AC4E0]"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>

                                <div className="mb-3 grid grid-cols-7 gap-3">
                                    {Array.from({ length: 7 }).map((_, index) => (
                                        <div
                                            key={getDayName(index)}
                                            className="py-2 text-center text-[11px] font-black uppercase tracking-[0.16em] text-slate-400"
                                        >
                                            {getDayName(index)}
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-3">
                                    {calendarDays.map((item) => {
                                        const key = formatDateKey(item.date);
                                        const scheduleCount = (schedulesByDate[key] || []).length;
                                        const selected = isSameDate(item.date, selectedDate);
                                        const todayDate = isSameDate(item.date, today);

                                        return (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => setSelectedDate(item.date)}
                                                className={`relative min-h-[92px] rounded-[20px] border p-3 text-left transition ${selected
                                                        ? "border-cyan-300 bg-cyan-50 shadow-[0_14px_32px_rgba(10,196,224,0.18)]"
                                                        : item.isCurrentMonth
                                                            ? "border-slate-100 bg-white hover:border-cyan-200 hover:bg-cyan-50/40"
                                                            : "border-slate-100 bg-slate-50/70 hover:border-cyan-100"
                                                    }`}
                                            >
                                                {scheduleCount > 0 && (
                                                    <div className="absolute right-2.5 top-2.5 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-[#0AC4E0] px-2 text-[11px] font-black text-white">
                                                        {scheduleCount}
                                                    </div>
                                                )}

                                                <div
                                                    className={`text-[16px] font-black ${selected
                                                            ? "text-[#0AC4E0]"
                                                            : todayDate
                                                                ? "text-slate-950"
                                                                : item.isCurrentMonth
                                                                    ? "text-slate-700"
                                                                    : "text-slate-300"
                                                        }`}
                                                >
                                                    {item.date.getDate()}
                                                </div>

                                                {scheduleCount > 0 && (
                                                    <div className="mt-6 flex flex-wrap gap-1">
                                                        {Array.from({
                                                            length: Math.min(scheduleCount, 3),
                                                        }).map((_, index) => (
                                                            <span
                                                                key={index}
                                                                className="h-1.5 w-7 rounded-full bg-cyan-300"
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <aside className="overflow-hidden rounded-[32px] border border-cyan-100 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.07)]">
                                <div className="bg-[#0AC4E0] px-7 py-6 text-white">
                                    <h3 className="text-[30px] font-black capitalize tracking-[-0.05em]">
                                        {new Intl.DateTimeFormat("id-ID", {
                                            weekday: "long",
                                        }).format(new Date(selectedDate))}
                                    </h3>

                                    <p className="mt-1 text-[14px] font-semibold text-cyan-50">
                                        {getFullDateLabel(selectedDate)}
                                    </p>
                                </div>

                                <div className="max-h-[720px] overflow-y-auto px-5 py-5">
                                    {selectedSchedules.length === 0 ? (
                                        <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
                                            <div className="mb-5 h-16 w-16 rounded-[24px] border border-cyan-100 bg-cyan-50" />

                                            <p className="text-[17px] font-black text-slate-800">
                                                Belum ada kegiatan
                                            </p>

                                            <p className="mt-2 max-w-[280px] text-[13px] font-semibold leading-6 text-slate-400">
                                                Tidak ada jadwal kegiatan pada tanggal yang dipilih.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {selectedSchedules.map((schedule) => (
                                                <button
                                                    key={schedule.id}
                                                    type="button"
                                                    onClick={() => onScheduleClick?.(schedule)}
                                                    className="w-full rounded-[22px] border border-slate-100 bg-white px-5 py-4 text-left transition hover:border-cyan-200 hover:bg-cyan-50/50"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#0AC4E0]" />

                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-start justify-between gap-3">
                                                                <h4 className="text-[15px] font-black leading-6 text-slate-900">
                                                                    {schedule.title}
                                                                </h4>

                                                                {schedule.phase && (
                                                                    <span className="shrink-0 rounded-full bg-cyan-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-700">
                                                                        {schedule.phase}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <p className="mt-1 text-[12px] font-bold text-slate-500">
                                                                {schedule.startTime || "--:--"} -{" "}
                                                                {schedule.endTime || "--:--"}
                                                            </p>

                                                            {schedule.description && (
                                                                <p className="mt-2 line-clamp-2 text-[13px] font-semibold leading-6 text-slate-500">
                                                                    {schedule.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </aside>
                        </section>
                    </div>
                </div>
            </main>
        </PageWrapper>
    );
}

export default SchedulingCalendarBase;
