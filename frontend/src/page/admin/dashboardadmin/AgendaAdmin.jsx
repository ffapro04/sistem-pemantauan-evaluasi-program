/* eslint-disable no-unused-vars */
import AgendaCalendarBase from "../../../components/calendar/AgendaCalendarBase";

export default function AgendaAdmin() {
    return (
        <AgendaCalendarBase
            roleScope="ADMIN"
            title="Calendar Monitoring Admin"
            subtitle="Mengelola COE serta memantau program, fase program, assessment, dan tanggal merah nasional dalam satu kalender."
            canManageCOE
            showProgram
            showFase
            showAssessment
            showCOE
            showHoliday
        />
    );
}
