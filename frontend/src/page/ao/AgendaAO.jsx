/* eslint-disable no-unused-vars */
import AgendaCalendarBase from "../../components/calendar/AgendaCalendarBase";

function AgendaAO() {
    return (
        <AgendaCalendarBase
            roleScope="AO"
            title="Agenda Area Officer"
            subtitle="Memantau program binaan AO, fase program, COE dari admin, dan tanggal merah nasional."
            canManageCOE={false}
            showProgram
            showFase
            showAssessment={false}
            showCOE
            showHoliday
        />
    );
}

export default AgendaAO;
