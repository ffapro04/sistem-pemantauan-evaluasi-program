/* eslint-disable no-unused-vars */
import AgendaCalendarBase from "../../components/calendar/AgendaCalendarBase";

function AgendaVendor() {
    return (
        <AgendaCalendarBase
            roleScope="VENDOR"
            title="Agenda Vendor"
            subtitle="Memantau program vendor, fase program, COE dari admin, dan tanggal merah nasional."
            canManageCOE={false}
            showProgram
            showFase
            showAssessment={false}
            showCOE
            showHoliday
        />
    );
}

export default AgendaVendor;
