import EditProgramForm from "../../../components/program/EditProgramForm";

function EditProgramAkademik() {
  return (
    <EditProgramForm
      kategori="AKADEMIK"
      title="Program Akademik"
      titleHighlight="Akademik"
      vendorEndpoint="/vendor?kategori=AKADEMIK"
      backPath="/ho/program/akademik"
      detailPathPrefix="/ho/program/akademik/detail"
      programPlaceholder="Masukkan nama program akademik..."
      successMessage="Program Akademik berhasil diperbarui"
    />
  );
}

export default EditProgramAkademik;
