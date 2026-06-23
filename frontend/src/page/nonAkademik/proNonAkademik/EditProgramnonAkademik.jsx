import EditProgramForm from "../../../components/program/EditProgramForm";

function EditProgramnonAkademik() {
  return (
    <EditProgramForm
      kategori="NON_AKADEMIK"
      title="Program Non-Akademik"
      titleHighlight="Non-Akademik"
      vendorEndpoint="/vendor?kategori=NON_AKADEMIK"
      backPath="/ho/program/non-akademik"
      detailPathPrefix="/ho/program/non-akademik/detail"
      programPlaceholder="Masukkan nama program non-akademik..."
      successMessage="Program Non-Akademik berhasil diperbarui"
    />
  );
}

export default EditProgramnonAkademik;
