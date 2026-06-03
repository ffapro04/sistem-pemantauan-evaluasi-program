import { CreateAssessmentForm } from "../../../components/assessment";

function CreateAssessmentNonAkademik() {
  return (
    <CreateAssessmentForm
      jenisAssessment="non-akademik"
      labelAssessment="Non-Akademik"
      basePath="/ho/assessment/non-akademik"
      title="Tambah Assessment"
    />
  );
}

export default CreateAssessmentNonAkademik;