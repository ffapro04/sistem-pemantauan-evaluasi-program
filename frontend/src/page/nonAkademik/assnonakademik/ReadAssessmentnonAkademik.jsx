import { ReadAssessmentPage } from "../../../components/assessment";

function ReadAssessmentNonAkademik() {
  return (
    <ReadAssessmentPage
      jenisAssessment="non-akademik"
      labelAssessment="Non-Akademik"
      basePath="/ho/assessment/non-akademik"
      title="Riwayat Assessment"
    />
  );
}

export default ReadAssessmentNonAkademik;