import { MasterFormPage } from "../../../../components/masterCrud";
import { wilayahConfig } from "../../../../config/masterCrud/wilayah.config";

export default function EditWilayah() {
  return <MasterFormPage config={wilayahConfig} mode="edit" />;
}
