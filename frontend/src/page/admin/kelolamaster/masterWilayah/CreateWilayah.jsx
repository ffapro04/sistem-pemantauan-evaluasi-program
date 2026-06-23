import { MasterFormPage } from "../../../../components/masterCrud";
import { wilayahConfig } from "../../../../config/masterCrud/wilayah.config";

export default function CreateWilayah() {
  return <MasterFormPage config={wilayahConfig} mode="create" />;
}
