/* eslint-disable no-unused-vars */
import AgendaCalendarBase from "../../components/calendar/AgendaCalendarBase";

function AgendaSekolah() {
    return (
        <AgendaCalendarBase
            roleScope="SEKOLAH"
            title="Agenda Sekolah"
            subtitle="Memantau program sekolah, fase program, assessment sekolah, COE dari admin, dan tanggal merah nasional."
            canManageCOE={false}
            showProgram
            showFase
            showAssessment
            showCOE
            showHoliday
        />
    );
}

export default AgendaSekolah;
