import CreateProgramForm from "../../../components/program/CreateProgramForm";

function CreateProgramAkademik() {
  return (
    <CreateProgramForm
      kategori="AKADEMIK"
      title="Program Akademik"
      redirectPath="/ho/program/akademik"
      vendorEndpoint="/vendor?kategori=AKADEMIK"
      defaultFaseName="Fase 1: Inisiasi"
      programPlaceholder="Contoh: Digitalisasi Kurikulum Nasional"
      successMessage="Program Akademik berhasil dibuat"
    />
  );
}

export default CreateProgramAkademik;
