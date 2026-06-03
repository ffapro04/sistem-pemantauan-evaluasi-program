import { CreateAssessmentForm } from "../../../components/assessment";

function CreateAssessmentAkademik() {
  return (
    <CreateAssessmentForm
      jenisAssessment="akademik"
      labelAssessment="Akademik"
      basePath="/ho/assessment/akademik"
      title="Tambah Assessment"
    />
  );
}

export default CreateAssessmentAkademik;