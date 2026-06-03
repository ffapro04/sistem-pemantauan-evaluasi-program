import ListProgramPage from "../../../components/program/ListProgramPage";

function ListProgramnonAkademik() {
  return (
    <ListProgramPage
      kategori="NON_AKADEMIK"
      titleHighlight="Non-Akademik"
      backPath="/ho/program/non-akademik"
      createPath="/ho/program/non-akademik/create"
      detailPathPrefix="/ho/program/non-akademik/detail"
      editPathPrefix="/ho/program/non-akademik/edit"
      programColumnTitle="PROGRAM NON-AKADEMIK"
      emptyText="Data program non-akademik tidak tersedia"
    />
  );
}

export default ListProgramnonAkademik;