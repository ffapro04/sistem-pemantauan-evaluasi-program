import { ReadAssessmentPage } from "../../../components/assessment";

function ReadAssessmentAkademik() {
  return (
    <ReadAssessmentPage
      jenisAssessment="akademik"
      labelAssessment="Akademik"
      basePath="/ho/assessment/akademik"
      createTitle="Riwayat Assessment"
    />
  );
}

export default ReadAssessmentAkademik;