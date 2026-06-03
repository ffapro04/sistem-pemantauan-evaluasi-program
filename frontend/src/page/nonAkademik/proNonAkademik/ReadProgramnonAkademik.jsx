import ReadProgramPage from "../../../components/program/ReadProgramPage";

function ReadProgramnonAkademik() {
  return (
    <ReadProgramPage
      kategori="NON_AKADEMIK"
      title="Program Non-Akademik"
      titleHighlight="Non-Akademik"
      createPath="/ho/program/non-akademik/create"
      listPathPrefix="/ho/program/non-akademik/list"
      detailButtonText="Daftar Program Non-Akademik"
    />
  );
}

export default ReadProgramnonAkademik;