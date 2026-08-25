import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import {
    Calendar as CalendarIcon,
    Clock,
    ChevronRight,
    MapPin,
    Info,
} from "lucide-react";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import Sidebar from "./Sidebar";
import PageWrapper from "./PageWrapper";
import { getAuthToken } from "../utils/authSession";

const PROGRAM_STATUSES = [
    "Approval",
    "Sosialisasi",
    "Implementasi",
    "Evaluasi",
    "Selesai",
];

const STATUS_STYLE = {
    Approval: {
        bg: "#F59E0B",
        soft: "bg-amber-50",
        text: "text-amber-600",
        border: "border-amber-100",
    },
    Sosialisasi: {
        bg: "#8B5CF6",
        soft: "bg-violet-50",
        text: "text-violet-600",
        border: "border-violet-100",
    },
    Implementasi: {
        bg: "#0AC4E0",
        soft: "bg-cyan-50",
        text: "text-cyan-600",
        border: "border-cyan-100",
    },
    Evaluasi: {
        bg: "#3B82F6",
        soft: "bg-blue-50",
        text: "text-blue-600",
        border: "border-blue-100",
    },
    Selesai: {
        bg: "#10B981",
        soft: "bg-emerald-50",
        text: "text-emerald-600",
        border: "border-emerald-100",
    },
};

function CalendarOfEventBase({
    kategori = "AKADEMIK",
    title = "Academic",
    titleAccent = "Schedule",
    subtitle = "Kalender Operasional Sistem",
    agendaBadge = "Daftar Program",
    footerTitle = "Informasi",
    footerDescription = "Tahapan program masih menggunakan status dummy sebagai pondasi awal COE.",
    emptyText = "BELUM ADA JADWAL",
    maxAgenda = 10,
}) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const categoryFallback =
        kategori === "NON_AKADEMIK" ? "Non-Akademik" : "Akademik";

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                setLoading(true);

                const token = getAuthToken();

                const res = await fetch(
                    `/program?kategori=${kategori}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );

                if (!res.ok) {
                    throw new Error("Gagal mengambil data program");
                }

                const data = await res.json();

                const mappedEvents = data.map((item, index) => {
                    const today = new Date();

                    const fallbackDay = String(
                        today.getDate() + (index % 5),
                    ).padStart(2, "0");

                    const fallbackMonth = String(today.getMonth() + 1).padStart(2, "0");

                    const fallbackDate = `${today.getFullYear()}-${fallbackMonth}-${fallbackDay}`;

                    // DUMMY STATUS DULU
                    // Nanti kalau backend sudah siap, ganti jadi:
                    // const tahapProgram = item.tahap_program || item.status_program || "Approval";
                    const tahapProgram = PROGRAM_STATUSES[index % PROGRAM_STATUSES.length];

                    const statusColor = STATUS_STYLE[tahapProgram]?.bg || "#0AC4E0";

                    return {
                        id: String(item.id_program),
                        title: item.nama_program || "Program Tanpa Nama",
                        start: item.tgl_pelaksanaan || fallbackDate,
                        backgroundColor: statusColor,
                        borderColor: "transparent",
                        textColor: "#FFFFFF",
                        extendedProps: {
                            category: item.kode_program || categoryFallback,
                            tahapProgram,
                            sekolah: item.sekolah || "-",
                            raw: item,
                        },
                    };
                });

                setEvents(mappedEvents);
                setSelectedEvent(mappedEvents[0] || null);
            } catch (error) {
                console.error("Gagal mengambil data calendar:", error);
                setEvents([]);
                setSelectedEvent(null);
            } finally {
                setLoading(false);
            }
        };

        fetchPrograms();
    }, [kategori, categoryFallback]);

    const sortedEvents = useMemo(() => {
        return [...events].sort((a, b) => new Date(a.start) - new Date(b.start));
    }, [events]);

    const statusCounter = useMemo(() => {
        return PROGRAM_STATUSES.map((status) => ({
            status,
            total: events.filter((event) => event.extendedProps.tahapProgram === status)
                .length,
        }));
    }, [events]);

    return (
        <PageWrapper className="flex h-screen overflow-hidden bg-[#F4FBFF] !p-0 font-sans">
            <Sidebar />

            <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
                <div className="pointer-events-none absolute right-[-120px] top-[-120px] h-[520px] w-[520px] rounded-full bg-[#0AC4E0]/10 blur-[120px]" />
                <div className="pointer-events-none absolute bottom-[-160px] left-[28%] h-[420px] w-[420px] rounded-full bg-blue-200/25 blur-[120px]" />

                <section className="relative z-10 flex h-[104px] shrink-0 items-center justify-between border-b border-white/70 bg-white/80 px-7 backdrop-blur-2xl">
                    <div className="flex items-center gap-5">
                        <div className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-[#0AC4E0] text-white shadow-lg shadow-[#0AC4E0]/20">
                            <CalendarIcon size={26} strokeWidth={2.5} />
                        </div>

                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
                                {subtitle}
                            </p>

                            <h1 className="mt-2 text-[28px] font-black uppercase leading-none tracking-[-0.04em] text-slate-800">
                                {title}{" "}
                                <span className="font-semibold italic text-[#0AC4E0]">
                                    {titleAccent}
                                </span>
                            </h1>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-white px-5 py-3 text-right shadow-sm">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                            Total Program
                        </p>

                        <p className="mt-1 text-2xl font-black leading-none text-slate-800">
                            {events.length}
                        </p>
                    </div>
                </section>

                <section className="relative z-10 grid min-h-0 flex-1 grid-cols-12 gap-5 overflow-hidden p-6">
                    <div className="col-span-8 flex min-h-0 flex-col overflow-hidden rounded-[2.3rem] border border-white bg-white/90 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
                        <div className="mb-4 flex shrink-0 items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#0AC4E0]">
                                    Calendar of Event
                                </p>

                                <h2 className="mt-1 text-[18px] font-black tracking-tight text-slate-800">
                                    Jadwal Program
                                </h2>
                            </div>

                            <div className="flex flex-wrap justify-end gap-2">
                                {PROGRAM_STATUSES.map((status) => (
                                    <LegendStatus key={status} status={status} />
                                ))}
                            </div>
                        </div>

                        <div className="min-h-0 flex-1 overflow-hidden">
                            <FullCalendar
                                plugins={[dayGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                headerToolbar={{
                                    left: "title",
                                    right: "prev,next today",
                                }}
                                events={events}
                                height="100%"
                                eventClick={(info) => {
                                    setSelectedEvent({
                                        id: info.event.id,
                                        title: info.event.title,
                                        start: info.event.startStr,
                                        extendedProps: info.event.extendedProps,
                                    });
                                }}
                            />
                        </div>
                    </div>

                    <div className="col-span-4 flex min-h-0 flex-col gap-5 overflow-hidden">
                        <div className="grid h-[128px] shrink-0 grid-cols-5 gap-2">
                            {statusCounter.map((item) => (
                                <StatusCounterCard
                                    key={item.status}
                                    status={item.status}
                                    total={item.total}
                                />
                            ))}
                        </div>

                        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[2.3rem] border border-white bg-white/90 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
                            <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6">
                                <div>
                                    <h3 className="text-[12px] font-black uppercase tracking-widest text-slate-800">
                                        Detail Agenda
                                    </h3>

                                    <p className="mt-1 text-[10px] font-bold text-slate-400">
                                        Daftar program berdasarkan jadwal
                                    </p>
                                </div>

                                <span className="rounded-full border border-slate-100 bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                    {agendaBadge}
                                </span>
                            </div>

                            <div className="no-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto p-5">
                                {loading ? (
                                    <LoadingState />
                                ) : sortedEvents.length === 0 ? (
                                    <EmptyState text={emptyText} />
                                ) : (
                                    sortedEvents.slice(0, maxAgenda).map((event) => (
                                        <AgendaCard
                                            key={event.id}
                                            event={event}
                                            selected={selectedEvent?.id === event.id}
                                            onClick={() => setSelectedEvent(event)}
                                        />
                                    ))
                                )}
                            </div>
                        </div>

                        <SelectedAgenda event={selectedEvent} />

                        <div className="relative shrink-0 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0AC4E0] to-[#5BE3F2] p-5 text-white shadow-xl shadow-[#0AC4E0]/20">
                            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-white/75">
                                {footerTitle}
                            </p>

                            <p className="text-[12px] font-semibold leading-relaxed text-white/95">
                                {footerDescription}
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            <CalendarPageStyle />
        </PageWrapper>
    );
}

CalendarOfEventBase.propTypes = {
    kategori: PropTypes.string,
    title: PropTypes.string,
    titleAccent: PropTypes.string,
    subtitle: PropTypes.string,
    agendaBadge: PropTypes.string,
    footerTitle: PropTypes.string,
    footerDescription: PropTypes.string,
    emptyText: PropTypes.string,
    maxAgenda: PropTypes.number,
};

const EVENT_SHAPE = PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    start: PropTypes.string,
    extendedProps: PropTypes.shape({
        category: PropTypes.string,
        tahapProgram: PropTypes.string,
        sekolah: PropTypes.string,
        raw: PropTypes.object,
    }),
});

function LegendStatus({ status }) {
    const style = STATUS_STYLE[status];

    return (
        <div className="flex items-center gap-2 rounded-full border border-slate-100 bg-white px-3 py-1.5">
            <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: style.bg }}
            />

            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                {status}
            </span>
        </div>
    );
}

LegendStatus.propTypes = {
    status: PropTypes.string.isRequired,
};

function StatusCounterCard({ status, total }) {
    const style = STATUS_STYLE[status];

    return (
        <div
            className={`flex flex-col justify-between rounded-[1.4rem] border ${style.border} ${style.soft} p-3`}
        >
            <p className={`text-[8px] font-black uppercase leading-tight ${style.text}`}>
                {status}
            </p>

            <p className={`text-[24px] font-black leading-none ${style.text}`}>
                {total}
            </p>
        </div>
    );
}

StatusCounterCard.propTypes = {
    status: PropTypes.string.isRequired,
    total: PropTypes.number.isRequired,
};

function AgendaCard({ event, selected, onClick }) {
    const status = event.extendedProps.tahapProgram;
    const style = STATUS_STYLE[status] || STATUS_STYLE.Implementasi;

    return (
        <button
            type="button"
            onClick={onClick}
            className={`group w-full rounded-2xl border p-4 text-left transition-all duration-300 ${selected
                    ? `${style.border} ${style.soft} shadow-sm`
                    : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                }`}
        >
            <div className="mb-2 flex items-center justify-between gap-3">
                <span
                    className={`rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-widest ${style.soft} ${style.text}`}
                >
                    {status}
                </span>

                <ChevronRight
                    size={15}
                    className={`${selected ? style.text : "text-slate-300"}`}
                />
            </div>

            <h4 className="line-clamp-2 text-[13px] font-black leading-snug text-slate-800">
                {event.title}
            </h4>

            <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                    <Clock size={13} />
                    <span>
                        {new Date(event.start).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                        })}
                    </span>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                    <MapPin size={13} />
                    <span className="max-w-[210px] truncate">
                        {event.extendedProps.sekolah}
                    </span>
                </div>
            </div>
        </button>
    );
}

AgendaCard.propTypes = {
    event: EVENT_SHAPE.isRequired,
    selected: PropTypes.bool,
    onClick: PropTypes.func,
};

function SelectedAgenda({ event }) {
    if (!event) {
        return (
            <div className="shrink-0 rounded-[2rem] border border-dashed border-slate-200 bg-white/80 p-5 text-center">
                <Info size={22} className="mx-auto mb-2 text-slate-300" />

                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                    Pilih agenda
                </p>
            </div>
        );
    }

    const status = event.extendedProps.tahapProgram;
    const style = STATUS_STYLE[status] || STATUS_STYLE.Implementasi;

    return (
        <div className="shrink-0 rounded-[2rem] border border-white bg-white/90 p-5 shadow-[0_12px_35px_rgba(15,23,42,0.04)]">
            <div className="mb-3 flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                    Agenda Terpilih
                </p>

                <span
                    className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${style.soft} ${style.text}`}
                >
                    {status}
                </span>
            </div>

            <h3 className="line-clamp-2 text-[15px] font-black leading-snug text-slate-800">
                {event.title}
            </h3>

            <div className="mt-4 grid grid-cols-2 gap-3">
                <InfoPill
                    label="Tanggal"
                    value={new Date(event.start).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                    })}
                />

                <InfoPill label="Sekolah" value={event.extendedProps.sekolah} />
            </div>
        </div>
    );
}

SelectedAgenda.propTypes = {
    event: EVENT_SHAPE,
};

function InfoPill({ label, value }) {
    return (
        <div className="min-w-0 rounded-2xl bg-slate-50 px-3 py-3">
            <p className="mb-1 text-[8px] font-black uppercase tracking-widest text-slate-400">
                {label}
            </p>

            <p className="truncate text-[10px] font-bold text-slate-500">{value}</p>
        </div>
    );
}

InfoPill.propTypes = {
    label: PropTypes.string,
    value: PropTypes.node,
};

function LoadingState() {
    return (
        <div className="flex h-full min-h-[240px] flex-col items-center justify-center">
            <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#0AC4E0] border-t-transparent" />

            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                Loading Agenda...
            </p>
        </div>
    );
}

function EmptyState({ text }) {
    return (
        <div className="flex h-full min-h-[240px] flex-col items-center justify-center text-center opacity-40">
            <Info size={40} className="mb-4 text-slate-300" />

            <p className="text-xs font-black text-slate-400">{text}</p>
        </div>
    );
}

EmptyState.propTypes = {
    text: PropTypes.string,
};

function CalendarPageStyle() {
    return (
        <style
            dangerouslySetInnerHTML={{
                __html: `
          .fc {
            height: 100% !important;
            font-family: 'Inter', sans-serif !important;
          }

          .fc .fc-toolbar {
            margin-bottom: 1rem !important;
          }

          .fc-toolbar-title {
            font-size: 1.15rem !important;
            font-weight: 900 !important;
            color: #0F172A !important;
            text-transform: uppercase !important;
            letter-spacing: -0.02em !important;
          }

          .fc-theme-standard .fc-scrollgrid {
            border: none !important;
          }

          .fc-theme-standard th {
            border: none !important;
            padding: 10px 0 !important;
            color: #94A3B8 !important;
            font-size: 10px !important;
            text-transform: uppercase !important;
            font-weight: 900 !important;
            letter-spacing: 0.12em !important;
          }

          .fc-theme-standard td {
            border-color: #F1F5F9 !important;
          }

          .fc .fc-daygrid-day {
            height: 78px !important;
          }

          .fc .fc-daygrid-day-frame {
            padding: 5px !important;
          }

          .fc-daygrid-day-number {
            color: #1E293B !important;
            font-weight: 900 !important;
            font-size: 12px !important;
            padding: 5px 8px !important;
          }

          .fc-day-today {
            background-color: rgba(10, 196, 224, 0.06) !important;
          }

          .fc-day-today .fc-daygrid-day-number {
            background: #0AC4E0 !important;
            color: white !important;
            border-radius: 999px !important;
            margin: 4px !important;
            min-width: 26px !important;
            text-align: center !important;
          }

          .fc-event {
            border-radius: 10px !important;
            padding: 3px 7px !important;
            font-size: 9px !important;
            font-weight: 800 !important;
            border: none !important;
            margin: 2px 0 !important;
            cursor: pointer !important;
          }

          .fc-h-event .fc-event-main {
            color: inherit !important;
          }

          .fc-button-primary {
            background: #F8FAFC !important;
            color: #64748B !important;
            border: none !important;
            font-weight: 900 !important;
            border-radius: 12px !important;
            font-size: 9px !important;
            text-transform: uppercase !important;
            padding: 0.55rem 0.75rem !important;
            transition: all 0.2s ease !important;
          }

          .fc-button-primary:hover {
            background: #0AC4E0 !important;
            color: white !important;
          }

          .fc-button-primary:disabled {
            opacity: 0.45 !important;
          }

          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }

          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `,
            }}
        />
    );
}

export default CalendarOfEventBase;
