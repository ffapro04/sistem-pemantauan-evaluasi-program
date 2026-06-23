import DetailProgramPage from "../../../components/program/DetailProgramPage";

function DetailProgramnonAkademik() {
  return (
    <DetailProgramPage
      kategori="NON_AKADEMIK"
      titleHighlight="Non-Akademik"
      editPathPrefix="/ho/program/non-akademik/edit"
      badgeText="NA"
    />
  );
}

export default DetailProgramnonAkademik;
