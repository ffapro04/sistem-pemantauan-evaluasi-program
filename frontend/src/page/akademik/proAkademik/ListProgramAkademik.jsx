import ListProgramPage from "../../../components/program/ListProgramPage";

function ListProgramAkademik() {
  return (
    <ListProgramPage
      kategori="AKADEMIK"
      titleHighlight="Akademik"
      backPath="/ho/program/akademik"
      createPath="/ho/program/akademik/create"
      detailPathPrefix="/ho/program/akademik/detail"
      editPathPrefix="/ho/program/akademik/edit"
      programColumnTitle="PROGRAM AKADEMIK"
      emptyText="Data program akademik tidak tersedia"
    />
  );
}

export default ListProgramAkademik;