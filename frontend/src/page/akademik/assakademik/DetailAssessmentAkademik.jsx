import DetailAssessmentPage from "../../../components/assessment/DetailAssessmentPage";

function DetailAssessmentAkademik() {
  return (
    <DetailAssessmentPage
      type="akademik"
      label="Akademik"
      basePath="/ho/assessment/akademik"
      headerEyebrow="Academic Dashboard"
      title="Hasil Assessment Akademik"
    />
  );
}

export default DetailAssessmentAkademik;
