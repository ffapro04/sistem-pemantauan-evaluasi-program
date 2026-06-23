import { MasterFormPage } from "../../../../components/masterCrud";
import { hoConfig } from "../../../../config/masterCrud/ho.config";

export default function CreateHO() {
  return <MasterFormPage config={hoConfig} mode="create" />;
}
