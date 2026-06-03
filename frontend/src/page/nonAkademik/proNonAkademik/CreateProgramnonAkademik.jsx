import CreateProgramForm from "../../../components/program/CreateProgramForm";

function CreateProgramnonAkademik() {
  return (
    <CreateProgramForm
      kategori="NON_AKADEMIK"
      title="Program Non-Akademik"
      redirectPath="/ho/program/non-akademik"
      vendorEndpoint="http://localhost:3000/vendor?kategori=NON_AKADEMIK"
      defaultFaseName="Fase 1: Persiapan & Inisiasi"
      programPlaceholder="Contoh: Digitalisasi Perpustakaan"
      successMessage="Program Non-Akademik berhasil dibuat"
    />
  );
}

export default CreateProgramnonAkademik;