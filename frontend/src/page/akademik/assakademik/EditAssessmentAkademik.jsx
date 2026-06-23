import AssessmentEditBase from "../../../components/assessment/EditAssessmentForm";

function EditAssessmentAkademik() {
  return (
    <AssessmentEditBase
      basePath="/ho/assessment/akademik"
      highlight="Assessment Akademik"
      questionPlaceholder="Tuliskan pertanyaan akademik di sini..."
      successMessage="Perubahan akademik berhasil disimpan"
    />
  );
}

export default EditAssessmentAkademik;
