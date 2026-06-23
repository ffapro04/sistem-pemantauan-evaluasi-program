/* eslint-disable no-unused-vars */
import AgendaCalendarBase from "../../../components/calendar/AgendaCalendarBase";

function CalendarOfEventakademik() {
  return (
    <AgendaCalendarBase
      roleScope="HO"
      lockedBidang="AKADEMIK"
      title="Calendar of Event"
      subtitle="Lihat jadwal program akademik, fase program, assessment akademik, COE dari admin, dan tanggal merah nasional."
      canManageCOE={false}
      showProgram
      showFase
      showAssessment
      showCOE
      showHoliday
    />
  );
}

export default CalendarOfEventakademik;
