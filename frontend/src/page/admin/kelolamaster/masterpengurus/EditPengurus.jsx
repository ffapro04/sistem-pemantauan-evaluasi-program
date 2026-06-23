import { MasterFormPage } from "../../../../components/masterCrud";
import { pengurusConfig } from "../../../../config/masterCrud/pengurus.config";

export default function EditPengurus() {
  return <MasterFormPage config={pengurusConfig} mode="edit" />;
}
