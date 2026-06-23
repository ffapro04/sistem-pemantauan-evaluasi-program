/* eslint-disable no-unused-vars */
import AgendaCalendarBase from "../../../components/calendar/AgendaCalendarBase";

function CalendarOfEventnonAkademik() {
  return (
    <AgendaCalendarBase
      roleScope="HO"
      lockedBidang="NON_AKADEMIK"
      title="Calendar of Event"
      subtitle="Lihat jadwal program non-akademik, fase program, assessment non-akademik, COE dari admin, dan tanggal merah nasional."
      canManageCOE={false}
      showProgram
      showFase
      showAssessment
      showCOE
      showHoliday
    />
  );
}

export default CalendarOfEventnonAkademik;
