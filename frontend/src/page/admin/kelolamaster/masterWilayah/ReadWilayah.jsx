import { MasterReadPage } from "../../../../components/masterCrud";
import { wilayahConfig } from "../../../../config/masterCrud/wilayah.config";

export default function ReadWilayah() {
  return <MasterReadPage config={wilayahConfig} />;
}
