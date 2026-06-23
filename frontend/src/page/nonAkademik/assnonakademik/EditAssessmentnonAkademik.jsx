import AssessmentEditBase from "../../../components/assessment/EditAssessmentForm";

function EditAssessmentNonAkademik() {
  return (
    <AssessmentEditBase
      basePath="/ho/assessment/non-akademik"
      highlight="Assessment Non-Akademik"
      questionPlaceholder="Tuliskan pertanyaan non-akademik di sini..."
      successMessage="Perubahan non-akademik berhasil disimpan"
    />
  );
}

export default EditAssessmentNonAkademik;
