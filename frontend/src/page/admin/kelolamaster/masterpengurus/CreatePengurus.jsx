import { MasterFormPage } from "../../../../components/masterCrud";
import { pengurusConfig } from "../../../../config/masterCrud/pengurus.config";

export default function CreatePengurus() {
  return <MasterFormPage config={pengurusConfig} mode="create" />;
}
