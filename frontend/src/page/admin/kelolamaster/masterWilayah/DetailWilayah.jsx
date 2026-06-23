import { MasterDetailPage } from "../../../../components/masterCrud";
import { wilayahConfig } from "../../../../config/masterCrud/wilayah.config";

export default function DetailWilayah() {
  return <MasterDetailPage config={wilayahConfig} />;
}
