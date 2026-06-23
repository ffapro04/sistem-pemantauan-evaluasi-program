/* eslint-disable no-unused-vars */
import AgendaCalendarBase from "../../components/calendar/AgendaCalendarBase";

function AgendaKepalaDinas() {
    return (
        <AgendaCalendarBase
            roleScope="KEPALA_DINAS"
            title="Agenda Kepala Dinas"
            subtitle="Memantau agenda program sekolah wilayah binaan, COE dari admin, dan tanggal merah nasional."
            canManageCOE={false}
            showProgram
            showFase
            showAssessment={false}
            showCOE
            showHoliday
        />
    );
}

export default AgendaKepalaDinas;
