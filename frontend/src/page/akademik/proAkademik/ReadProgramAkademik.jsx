import ReadProgramPage from "../../../components/program/ReadProgramPage";

function ReadProgramAkademik() {
  return (
    <ReadProgramPage
      kategori="AKADEMIK"
      title="Program Akademik"
      titleHighlight="Akademik"
      createPath="/ho/program/akademik/create"
      listPathPrefix="/ho/program/akademik/list"
      detailButtonText="Akses Detail Program"
    />
  );
}

export default ReadProgramAkademik;