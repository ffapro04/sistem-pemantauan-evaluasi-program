import DetailProgramPage from "../../../components/program/DetailProgramPage";

function DetailProgramAkademik() {
  return (
    <DetailProgramPage
      kategori="AKADEMIK"
      titleHighlight="Akademik"
      editPathPrefix="/ho/program/akademik/edit"
      badgeText="AK"
    />
  );
}

export default DetailProgramAkademik;