import { forwardRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import idLocale from "@fullcalendar/core/locales/id";

const FULL_CALENDAR_PLUGINS = [
    dayGridPlugin,
    timeGridPlugin,
    interactionPlugin,
    listPlugin,
];

const AgendaFullCalendar = forwardRef(function AgendaFullCalendar(props, ref) {
    return (
        <FullCalendar
            ref={ref}
            {...props}
            plugins={FULL_CALENDAR_PLUGINS}
            locale={idLocale}
        />
    );
});

export default AgendaFullCalendar;
