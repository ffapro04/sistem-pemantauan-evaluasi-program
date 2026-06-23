/* eslint-disable no-unused-vars */
import AgendaCalendarBase from "../../components/calendar/AgendaCalendarBase";

function AgendaPengurus() {
    return (
        <AgendaCalendarBase
            roleScope="PENGURUS"
            title="Agenda Pengurus"
            subtitle="Memantau agenda program, fase program, COE dari admin, dan tanggal merah nasional."
            canManageCOE={false}
            showProgram
            showFase
            showAssessment={false}
            showCOE
            showHoliday
        />
    );
}

export default AgendaPengurus;
