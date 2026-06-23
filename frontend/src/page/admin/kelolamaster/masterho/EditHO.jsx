import { MasterFormPage } from "../../../../components/masterCrud";
import { hoConfig } from "../../../../config/masterCrud/ho.config";

export default function EditHO() {
  return <MasterFormPage config={hoConfig} mode="edit" />;
}
